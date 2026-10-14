/**
 * 成大智研官網－開放資料同步（Google Apps Script）
 *
 * 用途：每天從農業部農業資料開放平臺取得本公司的通過驗證業者，寫進
 *       「成大智研官網內容」試算表的「通過驗證業者」工作表，供官網讀取。
 *
 * 安裝（只需做一次）：把本檔內容貼到與 admin-api.gs 同一個 Apps Script 專案，
 *       執行 setupOpenDataSync()：會建立工作表、立刻同步一次、安裝每天 05:00 的排程，
 *       並在執行記錄印出兩個工作表的 gid（填到前端 src/config/content-sheet.ts）。
 *
 * 資料來源（實測）：
 * - 有機：https://data.moa.gov.tw/Service/OpenData/Traceability/TraceabilityOrganic.aspx
 *   免金鑰、CORS 開放、即時更新；不支援用驗證機構參數過濾，需全量取回後自行過濾。
 * - 產銷履歷：https://data.moa.gov.tw/Service/OpenData/Resume/ResumeData_Plus.aspx
 *   支援 query 參數 CertificationName 在伺服器端過濾（OData $filter 無效）。
 *   注意：此資料集來源自 2025/12/17 起停止更新，同步仍會進行，網站會顯示來源日期。
 */

var SYNC_SPREADSHEET_ID = '1I2qpT_Vs0iHJmx46TZGkDwvhLMzi4IFY9O379vbnpmE'
var COMPANY_NAME = '成大智研國際驗證股份有限公司'
var OPERATORS_SHEET = '通過驗證業者'
var SYNC_STATUS_SHEET = '同步狀態'

var ORGANIC_API = 'https://data.moa.gov.tw/Service/OpenData/Traceability/TraceabilityOrganic.aspx'
var TAP_API = 'https://data.moa.gov.tw/Service/OpenData/Resume/ResumeData_Plus.aspx'
var ORGANIC_PAGE = 3000 // 單批筆數（整包約 7.8MB，分批可降低記憶體壓力）
var ORGANIC_MAX_PAGES = 12
var TAP_PAGE = 1000 // 產銷履歷每次只取最新一批（資料由新到舊）

var OPERATOR_HEADERS = [
  '類別',
  '業者名稱',
  '縣市',
  '品項',
  '證書字號',
  '效期',
  '業者代號',
  '資料來源日期',
]

/* ───────── 安裝與排程 ───────── */

/** 手動執行一次：建立工作表 → 同步 → 安裝每日排程 → 印出 gid */
function setupOpenDataSync() {
  var ss = SpreadsheetApp.openById(SYNC_SPREADSHEET_ID)
  var operators = ensureSheet(ss, OPERATORS_SHEET, OPERATOR_HEADERS)
  var status = ensureSheet(ss, SYNC_STATUS_SHEET, ['項目', '值'])
  syncOpenData()
  installDailyTrigger()
  Logger.log(
    [
      '工作表 gid（填到 src/config/content-sheet.ts）：',
      OPERATORS_SHEET + ' = ' + operators.getSheetId(),
      SYNC_STATUS_SHEET + ' = ' + status.getSheetId(),
      '',
      '記得把這兩個工作表「發布到網路」：檔案 → 共用 → 發布到網路 → 整份文件 → CSV。',
    ].join('\n'),
  )
}

/** 安裝每天 05:00 的排程（重複安裝不會長出第二個） */
function installDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'syncOpenData') ScriptApp.deleteTrigger(t)
  })
  ScriptApp.newTrigger('syncOpenData').timeBased().atHour(5).everyDays(1).create()
}

/* ───────── 每日同步 ───────── */

/** 排程執行：有機 + 產銷履歷；任一邊失敗不影響另一邊，失敗會寄信通知 */
function syncOpenData() {
  var ss = SpreadsheetApp.openById(SYNC_SPREADSHEET_ID)
  var sheet = ensureSheet(ss, OPERATORS_SHEET, OPERATOR_HEADERS)
  var status = ensureSheet(ss, SYNC_STATUS_SHEET, ['項目', '值'])
  var existing = readOperators(sheet)
  var errors = []
  var result = { 有機: null, 產銷履歷: null }

  try {
    result['有機'] = fetchOrganicOperators()
  } catch (err) {
    errors.push('有機：' + err)
  }
  try {
    result['產銷履歷'] = fetchTapOperators()
  } catch (err) {
    errors.push('產銷履歷：' + err)
  }

  // 只覆蓋成功取得的那一類，另一類沿用試算表既有資料
  var rows = []
  ;['有機', '產銷履歷'].forEach(function (type) {
    var fresh = result[type]
    if (fresh) {
      rows = rows.concat(fresh.rows)
      setStatus(status, type + '－最後同步成功', formatNow())
      setStatus(status, type + '－來源資料日期', fresh.sourceDate || '（來源未提供）')
      setStatus(status, type + '－筆數', String(fresh.rows.length))
    } else {
      rows = rows.concat(
        existing.filter(function (r) {
          return r[0] === type
        }),
      )
    }
  })

  writeOperators(sheet, rows)

  if (errors.length) {
    notifyFailure(errors.join('\n'))
    throw new Error(errors.join('\n'))
  }
}

/* ───────── 有機 ───────── */

/** 取回全部有機資料，篩出本公司且狀態為「通過」的業者 */
function fetchOrganicOperators() {
  var rows = []
  var seen = {}
  var latest = ''
  for (var page = 0; page < ORGANIC_MAX_PAGES; page++) {
    var url = ORGANIC_API + '?$top=' + ORGANIC_PAGE + '&$skip=' + page * ORGANIC_PAGE
    var batch = fetchJson(url)
    if (!batch.length) break
    for (var i = 0; i < batch.length; i++) {
      var r = batch[i]
      if (String(r.CompanyName || '').trim() !== COMPANY_NAME) continue
      if (String(r.Status || '').trim() !== '通過') continue
      var sn = String(r.CertOrganicSn || '').trim()
      if (!sn || seen[sn]) continue
      seen[sn] = true
      var effective = String(r.EffectiveDate || '').trim()
      if (effective > latest) latest = effective
      rows.push([
        '有機',
        String(r.Name || '').trim(),
        cityOf(r.Address || r.MailingAddress),
        productsOf(r.Products, r.ContainCrops),
        sn,
        effective,
        '',
        '',
      ])
    }
    if (batch.length < ORGANIC_PAGE) break
  }
  rows.sort(sortByName)
  return { rows: rows, sourceDate: latest }
}

/* ───────── 產銷履歷 ───────── */

/**
 * 取回本公司最新一批產銷履歷紀錄，依業者代號去重成業者清單。
 * 來源是「每批追溯碼一筆」的明細，所以同一業者會重複出現，取效期最新的一筆。
 */
function fetchTapOperators() {
  var url =
    TAP_API +
    '?$top=' +
    TAP_PAGE +
    '&CertificationName=' +
    encodeURIComponent(COMPANY_NAME)
  var batch = fetchJson(url)
  var byOrg = {}
  var latest = ''
  for (var i = 0; i < batch.length; i++) {
    var r = batch[i]
    if (String(r.CertificationName || '').trim() !== COMPANY_NAME) continue
    var id = String(r.OrgID || '').trim() || String(r.Producer || '').trim()
    if (!id) continue
    var valid = String(r.ValidDate || '').trim()
    var packed = String(r.PackDate || '').trim()
    if (packed > latest) latest = packed
    var item = byOrg[id]
    if (!item) {
      item = byOrg[id] = {
        name: String(r.Producer || '').trim(),
        city: cityOf(r.Place),
        products: {},
        valid: valid,
      }
    }
    if (valid > item.valid) item.valid = valid
    var product = String(r.ProductName || '').trim()
    if (product) item.products[product] = true
  }
  var rows = Object.keys(byOrg).map(function (id) {
    var item = byOrg[id]
    return [
      '產銷履歷',
      item.name,
      item.city,
      Object.keys(item.products).slice(0, 8).join('、'),
      '',
      item.valid,
      id,
      '',
    ]
  })
  rows.sort(sortByName)
  return { rows: rows, sourceDate: latest }
}

/* ───────── 工具 ───────── */

function fetchJson(url) {
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true })
  var code = res.getResponseCode()
  if (code !== 200) throw new Error('HTTP ' + code + '：' + url)
  var text = res.getContentText()
  var data = JSON.parse(text)
  if (!data || typeof data.length !== 'number') throw new Error('回應格式非陣列：' + url)
  return data
}

/** 從地址取出縣市（例：臺南市歸仁區… → 臺南市） */
function cityOf(address) {
  var m = String(address || '')
    .trim()
    .match(/^(.{2,3}?[縣市])/)
  return m ? m[1].replace(/^台/, '臺') : ''
}

function productsOf(products, crops) {
  var a = String(products || '').trim()
  var b = String(crops || '').trim()
  var text = a && b && a !== b ? a + '（' + b + '）' : a || b
  return text.replace(/\s+/g, ' ').slice(0, 200)
}

function sortByName(a, b) {
  return String(a[1]).localeCompare(String(b[1]), 'zh-Hant')
}

function ensureSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name)
  if (!sheet) {
    sheet = ss.insertSheet(name)
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }
  return sheet
}

function readOperators(sheet) {
  var n = sheet.getLastRow() - 1
  if (n < 1) return []
  return sheet.getRange(2, 1, n, OPERATOR_HEADERS.length).getValues()
}

function writeOperators(sheet, rows) {
  sheet.getRange(1, 1, 1, OPERATOR_HEADERS.length).setValues([OPERATOR_HEADERS])
  var last = sheet.getLastRow()
  if (last > 1) sheet.getRange(2, 1, last - 1, OPERATOR_HEADERS.length).clearContent()
  if (!rows.length) return
  var range = sheet.getRange(2, 1, rows.length, OPERATOR_HEADERS.length)
  range.setNumberFormat('@')
  range.setValues(rows)
}

function setStatus(sheet, key, value) {
  var n = Math.max(sheet.getLastRow() - 1, 0)
  var rows = n ? sheet.getRange(2, 1, n, 2).getValues() : []
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === key) {
      sheet.getRange(i + 2, 2).setValue(value)
      return
    }
  }
  sheet.appendRow([key, value])
}

function formatNow() {
  return Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy/MM/dd HH:mm')
}

function notifyFailure(message) {
  try {
    var to = Session.getEffectiveUser().getEmail()
    if (!to) return
    MailApp.sendEmail(
      to,
      '[成大智研官網] 開放資料同步失敗',
      '同步通過驗證業者時發生錯誤：\n\n' + message + '\n\n網站會繼續顯示上一次成功的資料。',
    )
  } catch (err) {
    console.error(err)
  }
}
