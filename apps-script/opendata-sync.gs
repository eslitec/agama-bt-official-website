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
 *   來源是「每批追溯碼一筆」的明細、由新到舊，$top 上限 10000，且 $skip 越深越慢，
 *   因此每日只取最近 TAP_MAX_PAGES 批，並與試算表既有資料「累積合併」：
 *   抓到的覆蓋同一業者，先前抓過、效期未過的保留，效期已過的自動移除。
 *   要補齊更舊的業者，手動執行一次 backfillTapOperators()，它會自己排程跑到完成。
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
// 產銷履歷每筆約 2.6 KB，單批 10000 筆就是 26 MB，Apps Script 光 JSON.parse 就會吃掉
// 大半個 6 分鐘上限（實測逾時），因此單批壓到 2000 筆、每次執行只抓幾批。
var TAP_PAGE = 2000 // 產銷履歷單批筆數（來源 $top 上限 10000，但解析成本太高）
var TAP_MAX_PAGES = 3 // 每日同步往回取幾批（淺層分頁，約一分鐘內跑完）
var TAP_BACKFILL_PAGES = 3 // backfillTapOperators() 每次再往回加抓幾批
var TAP_BACKFILL_MAX_PAGE = 24 // 回補最深到第幾批（約 50000 筆明細）
var TAP_BACKFILL_KEY = 'TAP_BACKFILL_NEXT_PAGE'
var TAP_BACKFILL_FN = 'backfillTapOperators'

var OPERATOR_HEADERS = ['類別', '業者名稱', '縣市', '品項', '證書字號', '效期', '業者代號']

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
      '產銷履歷要補更舊的業者，手動執行一次 backfillTapOperators()，之後會自動跑完。',
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
      // 有機是完整快照直接覆蓋；產銷履歷只拿得到最近幾批明細，與既有資料累積合併
      var merged = type === '產銷履歷' ? mergeTapOperators(existing, fresh.rows) : fresh.rows
      rows = rows.concat(merged)
      setStatus(status, type + '－最後同步成功', formatNow())
      setStatus(status, type + '－來源資料日期', fresh.sourceDate || '')
      setStatus(status, type + '－筆數', String(merged.length))
      if (fresh.oldest) setStatus(status, type + '－本次明細涵蓋起日', fresh.oldest)
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
      rows.push([
        '有機',
        String(r.Name || '').trim(),
        cityOf(r.Address || r.MailingAddress),
        productsOf(r.Products, r.ContainCrops),
        sn,
        effective,
        '',
      ])
    }
    if (batch.length < ORGANIC_PAGE) break
  }
  rows.sort(sortByName)
  // 有機資料集是即時的完整快照，來源沒有「資料日期」欄位，留空讓網站只顯示同步時間
  return { rows: rows, sourceDate: '' }
}

/* ───────── 產銷履歷 ───────── */

/** 每日同步：從最新一批往回取 TAP_MAX_PAGES 批 */
function fetchTapOperators() {
  return fetchTapRange(0, TAP_MAX_PAGES)
}

/**
 * 取回指定批次範圍的產銷履歷明細，依業者代號去重成業者清單。
 * 來源是「每批追溯碼一筆」、由新到舊，所以同一業者會重複出現，取效期最新的一筆。
 */
function fetchTapRange(startPage, pages) {
  var byOrg = {}
  var latest = ''
  var oldest = ''
  var reachedEnd = false
  var page = startPage
  for (var i = 0; i < pages; i++) {
    page = startPage + i
    var url =
      TAP_API +
      '?$top=' +
      TAP_PAGE +
      '&$skip=' +
      page * TAP_PAGE +
      '&CertificationName=' +
      encodeURIComponent(COMPANY_NAME)
    var batch = fetchJson(url)
    if (!batch.length) {
      reachedEnd = true
      break
    }
    for (var j = 0; j < batch.length; j++) {
      var r = batch[j]
      if (String(r.CertificationName || '').trim() !== COMPANY_NAME) continue
      var id = String(r.OrgID || '').trim() || String(r.Producer || '').trim()
      if (!id) continue
      var valid = String(r.ValidDate || '').trim()
      var packed = String(r.PackDate || '').trim()
      if (packed) {
        if (packed > latest) latest = packed
        if (!oldest || packed < oldest) oldest = packed
      }
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
    if (batch.length < TAP_PAGE) {
      reachedEnd = true
      break
    }
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
    ]
  })
  rows.sort(sortByName)
  return {
    rows: rows,
    sourceDate: latest,
    oldest: oldest,
    reachedEnd: reachedEnd,
    nextPage: page + 1,
  }
}

/**
 * 加抓更舊的產銷履歷明細（補齊久未出貨、但證書仍有效的業者）。
 * 執行一次會往回加抓 TAP_BACKFILL_PAGES 批、把進度存進指令碼屬性，並自動裝一個
 * 每 5 分鐘的排程繼續往下抓；抓到底或超過 TAP_BACKFILL_MAX_PAGE 就自己把排程移除。
 * 所以只要手動執行一次，剩下的會自己跑完（執行記錄會出現「已完成」）。
 */
function backfillTapOperators() {
  var props = PropertiesService.getScriptProperties()
  var startPage = Number(props.getProperty(TAP_BACKFILL_KEY) || TAP_MAX_PAGES)
  if (startPage > TAP_BACKFILL_MAX_PAGE) {
    removeBackfillTrigger()
    Logger.log('產銷履歷回補：已完成（已達回溯上限）')
    return
  }
  var ss = SpreadsheetApp.openById(SYNC_SPREADSHEET_ID)
  var sheet = ensureSheet(ss, OPERATORS_SHEET, OPERATOR_HEADERS)
  var status = ensureSheet(ss, SYNC_STATUS_SHEET, ['項目', '值'])
  var existing = readOperators(sheet)
  var before = existing.filter(function (row) {
    return String(row[0]).trim() === '產銷履歷'
  }).length

  var fetched = fetchTapRange(startPage, TAP_BACKFILL_PAGES)
  var tap = mergeTapOperators(existing, fetched.rows)
  var organic = existing.filter(function (row) {
    return String(row[0]).trim() === '有機'
  })
  writeOperators(sheet, organic.concat(tap))

  var done = fetched.reachedEnd || fetched.nextPage > TAP_BACKFILL_MAX_PAGE
  props.setProperty(TAP_BACKFILL_KEY, String(done ? TAP_BACKFILL_MAX_PAGE + 1 : fetched.nextPage))
  if (done) removeBackfillTrigger()
  else ensureBackfillTrigger()
  setStatus(status, '產銷履歷－筆數', String(tap.length))
  setStatus(
    status,
    '產銷履歷－回補進度',
    done ? '已完成' : '已回補到第 ' + fetched.nextPage + ' 批',
  )
  if (fetched.oldest) setStatus(status, '產銷履歷－回補涵蓋起日', fetched.oldest)
  Logger.log(
    [
      '產銷履歷回補：第 ' + startPage + '～' + (fetched.nextPage - 1) + ' 批',
      '明細最舊日期：' + (fetched.oldest || '（無）'),
      '業者數：' + before + ' → ' + tap.length,
      done ? '已完成，排程已移除。' : '尚未抓完，已排程 5 分鐘後自動繼續。',
    ].join('\n'),
  )
}

/** 裝一個每 5 分鐘的回補排程（已經有就不重複裝） */
function ensureBackfillTrigger() {
  var has = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === TAP_BACKFILL_FN
  })
  if (!has) ScriptApp.newTrigger(TAP_BACKFILL_FN).timeBased().everyMinutes(5).create()
}

/** 回補完成後把自己的排程移除 */
function removeBackfillTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === TAP_BACKFILL_FN) ScriptApp.deleteTrigger(t)
  })
}

/**
 * 產銷履歷採累積合併：抓到的覆蓋同一業者，先前抓過、效期未過的保留。
 * 來源只給「出貨批次」明細，久未出貨的業者不會出現在最近幾批裡，但證書仍有效。
 */
function mergeTapOperators(existing, fresh) {
  var byId = {}
  var order = []
  function put(row) {
    var id = String(row[6] || row[1]).trim()
    if (!id) return
    if (!byId[id]) order.push(id)
    byId[id] = row
  }
  existing.forEach(function (row) {
    if (String(row[0]).trim() !== '產銷履歷') return
    if (isExpired(row[5])) return
    put(row)
  })
  fresh.forEach(put)
  return order
    .map(function (id) {
      return byId[id]
    })
    .sort(sortByName)
}

/** 效期（yyyy/MM/dd 字串）已過今天 */
function isExpired(validDate) {
  var d = String(validDate || '').trim()
  if (!d) return false
  return d < Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy/MM/dd')
}

/* ───────── 工具 ───────── */

function fetchJson(url) {
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true })
  var code = res.getResponseCode()
  if (code !== 200) throw new Error('HTTP ' + code + '：' + url)
  var text = res.getContentText()
  var data = JSON.parse(text)
  if (!data || typeof data.length !== 'number') throw new Error('回應格式非陣列：' + url)
  // 來源會用「一筆 errMsg」回報錯誤（例如 $top 超過 10000），不要當成空資料
  if (data.length === 1 && data[0] && data[0].errMsg) {
    throw new Error('來源回應：' + data[0].errMsg)
  }
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
  var extra = sheet.getLastColumn() - OPERATOR_HEADERS.length
  if (extra > 0) {
    sheet
      .getRange(1, OPERATOR_HEADERS.length + 1, Math.max(sheet.getLastRow(), 1), extra)
      .clearContent()
  }
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
