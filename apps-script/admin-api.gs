/**
 * 成大智研官網後台 API（Google Apps Script Web App）
 *
 * 用途：管理者登入後維護「成大智研官網內容」試算表的「最新消息」、「資料下載」與「人才發展」，
 *       並接收公開網站「意見反應」表單的來信（不需登入，只寄信不存進公開試算表）。
 * 第一次使用資料下載／人才發展前，在編輯器執行一次 setupAdminSheets()：
 *   會替「資料下載」補上 ID 欄並編號、建立「人才發展」工作表，並印出它的 gid。
 * 部署：部署 → 新增部署作業 → 類型「網頁應用程式」→ 執行身分「我」→ 存取權「所有人」。
 *       部署後的網址填到網站環境變數 VITE_ADMIN_API_URL。
 * 初次設定：在編輯器執行 createSetupCode()，到「執行記錄」看設定碼，
 *           到網站 /login 的「初次設定」輸入設定碼與第一位管理者帳號密碼（設定碼 30 分鐘內有效、只能用一次）。
 *
 * 安全設計：
 * - 管理者帳密存在「指令碼屬性」（不在試算表裡，試算表已公開發布）。
 * - 密碼以隨機 salt + SHA-256 迭代雜湊儲存，不保存明碼。
 * - 登入成功回傳 HMAC-SHA256 簽章的權杖（8 小時有效），之後每個請求都要帶權杖。
 * - 登入失敗鎖定目前關閉（MAX_FAILS = 0）；要啟用時把 MAX_FAILS 改成 5，連續失敗 5 次會鎖 LOCK_SECONDS 秒。
 * - 寫入試算表使用 LockService 避免同時編輯互相覆蓋。
 *
 * 請求格式：POST，Content-Type: text/plain，內容為 JSON { action, token?, ...參數 }
 * 回應格式：{ ok: true, data } 或 { ok: false, error: { code, message } }
 */

var SPREADSHEET_ID = '1I2qpT_Vs0iHJmx46TZGkDwvhLMzi4IFY9O379vbnpmE'
var NEWS_GID = 40890007
var DOWNLOADS_GID = 1702372519
var CAREERS_SHEET = '人才發展'
// 意見反應收件信箱；留空則寄給這個 Apps Script 專案的擁有者
var CONTACT_TO = 'hoganalin@gmail.com'
var CONTACT_MAX_PER_10MIN = 10
var TOKEN_TTL_MS = 8 * 60 * 60 * 1000
var HASH_ROUNDS = 1000
var MAX_FAILS = 0 // 0 = 不限制登入失敗次數（使用者要求）
var LOCK_SECONDS = 15 * 60
var SETUP_TTL_MS = 30 * 60 * 1000
var MIN_PASSWORD = 10

var NEWS_HEADERS = {
  id: 'ID',
  date: '日期',
  src: '來源機關',
  srcEn: '來源機關（英文）',
  no: '公告編號',
  title: '標題',
  titleEn: '標題（英文）',
  atts: '附件',
  imgs: '圖片',
  visible: '顯示',
}

var DOWNLOAD_HEADERS = {
  n: '分類編號',
  group: '分類名稱',
  groupEn: '分類名稱（英文）',
  name: '檔名',
  nameEn: '檔名（英文）',
  ext: '格式',
  href: '檔案連結',
  visible: '顯示',
  id: 'ID',
}

var CAREER_HEADERS = {
  id: 'ID',
  kind: '類型',
  title: '標題',
  titleEn: '標題（英文）',
  place: '地點',
  nature: '性質',
  period: '期間',
  body: '說明',
  bodyEn: '說明（英文）',
  href: '連結',
  visible: '顯示',
}

var CAREER_KINDS = { 職缺: 'job', 教育訓練: 'training' }
var CAREER_KIND_LABELS = { job: '職缺', training: '教育訓練' }

/* ───────── 進入點 ───────── */

function doPost(e) {
  var body
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}')
  } catch (err) {
    return respond(fail('BAD_REQUEST', '請求格式錯誤'))
  }
  try {
    return respond(handle(body))
  } catch (err) {
    if (err && err.code) return respond(fail(err.code, err.message))
    console.error(err)
    return respond(fail('SERVER', '伺服器發生錯誤，請稍後再試'))
  }
}

function doGet() {
  return respond({ ok: true, data: { service: '成大智研官網後台 API' } })
}

function handle(body) {
  var action = String(body.action || '')
  switch (action) {
    case 'setup':
      return ok(setupFirstAdmin(body))
    case 'login':
      return ok(login(body))
    case 'setupStatus':
      return ok({ needsSetup: getAdmins().length === 0 })
    case 'contact':
      return ok(receiveContact(body))
  }
  var session = verifyToken(body.token)
  switch (action) {
    case 'me':
      return ok({ username: session.u, expiresAt: session.exp })
    case 'listNews':
      return ok({ items: listNews() })
    case 'createNews':
      return ok({ item: withLock(function () { return createNews(body.item, session.u) }) })
    case 'updateNews':
      return ok({ item: withLock(function () { return updateNews(body.id, body.item, session.u) }) })
    case 'deleteNews':
      return ok({ id: withLock(function () { return deleteNews(body.id, session.u) }) })
    case 'listDownloads':
      return ok({ items: listDownloads() })
    case 'createDownload':
      return ok({ item: withLock(function () { return createDownload(body.item, session.u) }) })
    case 'updateDownload':
      return ok({ item: withLock(function () { return updateDownload(body.id, body.item, session.u) }) })
    case 'deleteDownload':
      return ok({ id: withLock(function () { return deleteDownload(body.id, session.u) }) })
    case 'moveDownload':
      return ok({ items: withLock(function () { return moveDownload(body.id, body.dir, session.u) }) })
    case 'listCareers':
      return ok({ items: listCareers() })
    case 'createCareer':
      return ok({ item: withLock(function () { return createCareer(body.item, session.u) }) })
    case 'updateCareer':
      return ok({ item: withLock(function () { return updateCareer(body.id, body.item, session.u) }) })
    case 'deleteCareer':
      return ok({ id: withLock(function () { return deleteCareer(body.id, session.u) }) })
    case 'moveCareer':
      return ok({ items: withLock(function () { return moveCareer(body.id, body.dir, session.u) }) })
    case 'changePassword':
      return ok(changePassword(session.u, body.currentPassword, body.newPassword))
    case 'listAdmins':
      return ok({ admins: getAdmins().map(function (a) { return { username: a.username, createdAt: a.createdAt } }) })
    case 'addAdmin':
      return ok(addAdmin(body.username, body.password))
    case 'removeAdmin':
      return ok(removeAdmin(session.u, body.username))
    default:
      throw apiError('BAD_REQUEST', '不支援的操作')
  }
}

/* ───────── 回應工具 ───────── */

function respond(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON)
}
function ok(data) {
  return { ok: true, data: data }
}
function fail(code, message) {
  return { ok: false, error: { code: code, message: message } }
}
function apiError(code, message) {
  var err = new Error(message)
  err.code = code
  return err
}

/* ───────── 管理者帳號 ───────── */

function props() {
  return PropertiesService.getScriptProperties()
}
function getAdmins() {
  return JSON.parse(props().getProperty('ADMINS') || '[]')
}
function saveAdmins(list) {
  props().setProperty('ADMINS', JSON.stringify(list))
}
function secret() {
  var s = props().getProperty('TOKEN_SECRET')
  if (!s) {
    s = Utilities.getUuid() + Utilities.getUuid()
    props().setProperty('TOKEN_SECRET', s)
  }
  return s
}

function hashPassword(password, salt) {
  var saltBytes = Utilities.newBlob(salt).getBytes()
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ':' + password, Utilities.Charset.UTF_8)
  for (var i = 1; i < HASH_ROUNDS; i++) {
    bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes.concat(saltBytes))
  }
  return Utilities.base64Encode(bytes)
}

function normalizeUsername(v) {
  var u = String(v || '').trim().toLowerCase()
  if (!/^[a-z0-9._-]{3,32}$/.test(u)) throw apiError('VALIDATION', '帳號需為 3–32 個英數字（可含 . _ -）')
  return u
}
function checkPasswordRule(p) {
  var s = String(p || '')
  if (s.length < MIN_PASSWORD || !/[A-Za-z]/.test(s) || !/[0-9]/.test(s))
    throw apiError('VALIDATION', '密碼至少 ' + MIN_PASSWORD + ' 個字元，且需同時包含英文字母與數字')
  return s
}

function createAdminRecord(username, password) {
  var salt = Utilities.getUuid()
  return { username: username, salt: salt, hash: hashPassword(password, salt), createdAt: new Date().toISOString() }
}

/** 在編輯器手動執行：產生初次設定碼（30 分鐘內有效） */
function createSetupCode() {
  if (getAdmins().length) {
    Logger.log('已有管理者帳號，不需要初次設定。忘記密碼時請由其他管理者重設，或在指令碼屬性刪除 ADMINS 後重新設定。')
    return
  }
  var code = Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase()
  props().setProperty('SETUP_CODE', JSON.stringify({ code: code, exp: Date.now() + SETUP_TTL_MS }))
  Logger.log('初次設定碼（30 分鐘內有效）：' + code)
}

function setupFirstAdmin(body) {
  return withLock(function () {
    if (getAdmins().length) throw apiError('SETUP_DONE', '已完成初次設定，請直接登入')
    var saved = JSON.parse(props().getProperty('SETUP_CODE') || 'null')
    var input = String(body.setupCode || '').trim().toUpperCase()
    if (!saved || saved.exp < Date.now() || !input || input !== saved.code)
      throw apiError('INVALID_SETUP_CODE', '設定碼錯誤或已過期，請重新產生')
    var username = normalizeUsername(body.username)
    var password = checkPasswordRule(body.password)
    saveAdmins([createAdminRecord(username, password)])
    props().deleteProperty('SETUP_CODE')
    return issueToken(username)
  })
}

function login(body) {
  var username = String(body.username || '').trim().toLowerCase()
  var password = String(body.password || '')
  var cache = CacheService.getScriptCache()
  var failKey = 'fail:' + username
  var fails = Number(cache.get(failKey) || 0)
  if (MAX_FAILS > 0 && fails >= MAX_FAILS) throw apiError('LOCKED', '登入失敗次數過多，請 15 分鐘後再試')
  var admin = getAdmins().filter(function (a) { return a.username === username })[0]
  if (!admin || hashPassword(password, admin.salt) !== admin.hash) {
    cache.put(failKey, String(fails + 1), LOCK_SECONDS)
    throw apiError('INVALID_CREDENTIALS', '帳號或密碼錯誤')
  }
  cache.remove(failKey)
  return issueToken(admin.username)
}

function changePassword(username, currentPassword, newPassword) {
  return withLock(function () {
    var admins = getAdmins()
    var admin = admins.filter(function (a) { return a.username === username })[0]
    if (!admin || hashPassword(String(currentPassword || ''), admin.salt) !== admin.hash)
      throw apiError('INVALID_CREDENTIALS', '目前的密碼不正確')
    var next = createAdminRecord(username, checkPasswordRule(newPassword))
    next.createdAt = admin.createdAt
    saveAdmins(admins.map(function (a) { return a.username === username ? next : a }))
    return {}
  })
}

function addAdmin(username, password) {
  return withLock(function () {
    var u = normalizeUsername(username)
    var admins = getAdmins()
    if (admins.some(function (a) { return a.username === u })) throw apiError('VALIDATION', '這個帳號已存在')
    admins.push(createAdminRecord(u, checkPasswordRule(password)))
    saveAdmins(admins)
    return {}
  })
}

function removeAdmin(self, username) {
  return withLock(function () {
    var u = String(username || '').trim().toLowerCase()
    if (u === self) throw apiError('VALIDATION', '不能刪除自己的帳號')
    var admins = getAdmins()
    var next = admins.filter(function (a) { return a.username !== u })
    if (next.length === admins.length) throw apiError('NOT_FOUND', '找不到這個帳號')
    saveAdmins(next)
    return {}
  })
}

/* ───────── 權杖 ───────── */

function sign(payload) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payload, secret(), Utilities.Charset.UTF_8))
}

function issueToken(username) {
  var exp = Date.now() + TOKEN_TTL_MS
  var payload = Utilities.base64EncodeWebSafe(JSON.stringify({ u: username, exp: exp }), Utilities.Charset.UTF_8)
  return { token: payload + '.' + sign(payload), username: username, expiresAt: exp }
}

function verifyToken(token) {
  var parts = String(token || '').split('.')
  if (parts.length !== 2 || sign(parts[0]) !== parts[1]) throw apiError('UNAUTHORIZED', '請重新登入')
  var data = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString('UTF-8'))
  if (!data.exp || data.exp < Date.now()) throw apiError('UNAUTHORIZED', '登入已逾時，請重新登入')
  if (!getAdmins().some(function (a) { return a.username === data.u }))
    throw apiError('UNAUTHORIZED', '帳號已停用')
  return data
}

/* ───────── 最新消息 ───────── */

function withLock(fn) {
  var lock = LockService.getScriptLock()
  if (!lock.tryLock(15000)) throw apiError('BUSY', '其他人正在儲存，請稍後再試')
  try {
    return fn()
  } finally {
    lock.releaseLock()
  }
}

function sheetByGid(gid, label) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    .getSheets()
    .filter(function (s) { return s.getSheetId() === gid })[0]
  if (!sheet) throw apiError('SERVER', '找不到「' + label + '」工作表')
  return sheet
}

function sheetByName(name) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name)
  if (!sheet) throw apiError('SERVER', '找不到「' + name + '」工作表，請先執行 setupAdminSheets()')
  return sheet
}

function newsSheet() { return sheetByGid(NEWS_GID, '最新消息') }

function columnMap(sheet, headers, label) {
  var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim() })
  var map = {}
  Object.keys(headers).forEach(function (key) {
    var idx = header.indexOf(headers[key])
    if (idx < 0) throw apiError('SERVER', '「' + label + '」缺少欄位：' + headers[key] + '，請先執行 setupAdminSheets()')
    map[key] = idx
  })
  map._width = header.length
  return map
}

function lines(v) {
  return String(v || '')
    .split(/\r?\n/)
    .map(function (s) { return s.trim() })
    .filter(function (s) { return s })
}

function parseAtts(cell) {
  return lines(cell)
    .map(function (line) {
      var m = line.match(/^(.*?)[\s|｜]*(https?:\/\/\S+)$/)
      return m ? { label: m[1].replace(/[|｜]\s*$/, '').trim(), href: m[2] } : null
    })
    .filter(function (a) { return a })
}

function rowToItem(row, map) {
  return {
    id: Number(row[map.id]),
    date: String(row[map.date]),
    src: String(row[map.src]),
    srcEn: String(row[map.srcEn]),
    no: String(row[map.no]),
    title: String(row[map.title]),
    titleEn: String(row[map.titleEn]),
    atts: parseAtts(row[map.atts]),
    imgs: lines(row[map.imgs]),
    visible: !/^(n|no|否|0)$/i.test(String(row[map.visible]).trim()),
  }
}

function readRows(sheet, map) {
  var n = sheet.getLastRow() - 1
  if (n < 1) return []
  return sheet.getRange(2, 1, n, map._width).getValues()
}

function listNews() {
  var sheet = newsSheet()
  var map = columnMap(sheet, NEWS_HEADERS, '最新消息')
  return readRows(sheet, map)
    .filter(function (r) { return String(r[map.id]).trim() !== '' })
    .map(function (r) { return rowToItem(r, map) })
    .sort(function (a, b) { return b.date.localeCompare(a.date) || b.id - a.id })
}

function clean(v, max) {
  return String(v == null ? '' : v).replace(/\r\n?/g, '\n').trim().slice(0, max)
}

function validateItem(input) {
  var item = input || {}
  var date = clean(item.date, 10).replace(/[-/]/g, '.')
  var m = date.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})$/)
  if (!m) throw apiError('VALIDATION', '日期格式需為 YYYY.MM.DD')
  date = m[1] + '.' + ('0' + m[2]).slice(-2) + '.' + ('0' + m[3]).slice(-2)
  var title = clean(item.title, 300)
  if (!title) throw apiError('VALIDATION', '請填寫標題')
  var atts = (Array.isArray(item.atts) ? item.atts : []).slice(0, 20).map(function (a) {
    var href = clean(a && a.href, 1000)
    if (!/^https?:\/\/\S+$/.test(href)) throw apiError('VALIDATION', '附件網址需以 http:// 或 https:// 開頭，且不能有空白')
    return clean(a.label, 100).replace(/[|｜\n]/g, ' ') + ' | ' + href
  })
  var imgs = (Array.isArray(item.imgs) ? item.imgs : []).slice(0, 30).map(function (u) {
    var url = clean(u, 1000)
    if (!/^https?:\/\/\S+$/.test(url)) throw apiError('VALIDATION', '圖片網址需以 http:// 或 https:// 開頭，且不能有空白')
    return url
  })
  return {
    date: date,
    src: clean(item.src, 100),
    srcEn: clean(item.srcEn, 200),
    no: clean(item.no, 30),
    title: title,
    titleEn: clean(item.titleEn, 500),
    atts: atts.join('\n'),
    imgs: imgs.join('\n'),
    visible: item.visible === false ? 'N' : 'Y',
  }
}

function writeRow(sheet, map, rowIndex, id, v) {
  var range = sheet.getRange(rowIndex, 1, 1, map._width)
  var row = range.getValues()[0]
  row[map.id] = String(id)
  ;['date', 'src', 'srcEn', 'no', 'title', 'titleEn', 'atts', 'imgs', 'visible'].forEach(function (k) {
    row[map[k]] = v[k]
  })
  range.setNumberFormat('@')
  range.setValues([row])
}

function findRowIndex(sheet, map, id) {
  var rows = readRows(sheet, map)
  for (var i = 0; i < rows.length; i++) if (Number(rows[i][map.id]) === Number(id)) return i + 2
  return -1
}

function createNews(input, user) {
  var v = validateItem(input)
  var sheet = newsSheet()
  var map = columnMap(sheet, NEWS_HEADERS, '最新消息')
  var maxId = readRows(sheet, map).reduce(function (m, r) { return Math.max(m, Number(r[map.id]) || 0) }, 0)
  var id = maxId + 1
  sheet.insertRowBefore(2)
  writeRow(sheet, map, 2, id, v)
  console.log('createNews', user, id)
  return rowToItem(sheet.getRange(2, 1, 1, map._width).getValues()[0], map)
}

function updateNews(id, input, user) {
  var v = validateItem(input)
  var sheet = newsSheet()
  var map = columnMap(sheet, NEWS_HEADERS, '最新消息')
  var rowIndex = findRowIndex(sheet, map, id)
  if (rowIndex < 0) throw apiError('NOT_FOUND', '找不到這則消息，可能已被刪除')
  writeRow(sheet, map, rowIndex, Number(id), v)
  console.log('updateNews', user, id)
  return rowToItem(sheet.getRange(rowIndex, 1, 1, map._width).getValues()[0], map)
}

function deleteNews(id, user) {
  var sheet = newsSheet()
  var map = columnMap(sheet, NEWS_HEADERS, '最新消息')
  var rowIndex = findRowIndex(sheet, map, id)
  if (rowIndex < 0) throw apiError('NOT_FOUND', '找不到這則消息，可能已被刪除')
  sheet.deleteRow(rowIndex)
  console.log('deleteNews', user, id)
  return Number(id)
}

/* ───────── 共用：有 ID 欄的工作表 ───────── */

function nextId(rows, map) {
  return rows.reduce(function (m, r) { return Math.max(m, Number(r[map.id]) || 0) }, 0) + 1
}

function rowIndexOfId(rows, map, id) {
  for (var i = 0; i < rows.length; i++) if (Number(rows[i][map.id]) === Number(id)) return i + 2
  return -1
}

/** 把 values 依 map 寫回整列（不動 map 以外的欄位） */
function writeMapped(sheet, map, rowIndex, values) {
  var range = sheet.getRange(rowIndex, 1, 1, map._width)
  var row = range.getValues()[0]
  Object.keys(values).forEach(function (k) { row[map[k]] = values[k] })
  range.setNumberFormat('@')
  range.setValues([row])
}

/** 與相鄰同類列對調（dir: 'up' | 'down'）；回傳整份新順序 */
function moveRow(sheet, map, id, dir, sameGroup, toItem) {
  var rows = readRows(sheet, map)
  var idx = -1
  for (var i = 0; i < rows.length; i++) if (Number(rows[i][map.id]) === Number(id)) idx = i
  if (idx < 0) throw apiError('NOT_FOUND', '找不到這筆資料，可能已被刪除')
  var step = dir === 'up' ? -1 : 1
  var j = idx + step
  while (j >= 0 && j < rows.length && !sameGroup(rows[idx], rows[j])) j += step
  if (j < 0 || j >= rows.length) throw apiError('VALIDATION', '已經在最前面或最後面了')
  var a = sheet.getRange(idx + 2, 1, 1, map._width)
  var b = sheet.getRange(j + 2, 1, 1, map._width)
  var av = a.getValues()
  a.setValues(b.getValues())
  b.setValues(av)
  return readRows(sheet, map)
    .filter(function (r) { return String(r[map.id]).trim() !== '' })
    .map(function (r) { return toItem(r, map) })
}

/* ───────── 資料下載 ───────── */

function downloadsSheet() { return sheetByGid(DOWNLOADS_GID, '資料下載') }
function downloadsMap(sheet) { return columnMap(sheet, DOWNLOAD_HEADERS, '資料下載') }

function rowToDownload(row, map) {
  return {
    id: Number(row[map.id]),
    n: String(row[map.n]).trim(),
    group: String(row[map.group]).trim(),
    groupEn: String(row[map.groupEn]).trim(),
    name: String(row[map.name]).trim(),
    nameEn: String(row[map.nameEn]).trim(),
    ext: String(row[map.ext]).trim(),
    href: String(row[map.href]).trim(),
    visible: !/^(n|no|否|0)$/i.test(String(row[map.visible]).trim()),
  }
}

function listDownloads() {
  var sheet = downloadsSheet()
  var map = downloadsMap(sheet)
  return readRows(sheet, map)
    .filter(function (r) { return String(r[map.id]).trim() !== '' })
    .map(function (r) { return rowToDownload(r, map) })
}

function validateDownload(input) {
  var item = input || {}
  var n = clean(item.n, 10)
  if (!/^[0-9A-Za-z]{1,10}$/.test(n)) throw apiError('VALIDATION', '分類編號只能是英數字（例如 01、05）')
  var group = clean(item.group, 100)
  if (!group) throw apiError('VALIDATION', '請填寫分類名稱')
  var name = clean(item.name, 300)
  if (!name) throw apiError('VALIDATION', '請填寫檔名')
  var href = clean(item.href, 1000)
  if (!/^https?:\/\/\S+$/.test(href)) throw apiError('VALIDATION', '檔案連結需以 http:// 或 https:// 開頭，且不能有空白')
  var ext = clean(item.ext, 10).toUpperCase().replace(/[^0-9A-Z]/g, '')
  if (!ext) throw apiError('VALIDATION', '請填寫格式（例如 PDF、DOC）')
  return {
    n: n,
    group: group,
    groupEn: clean(item.groupEn, 200),
    name: name,
    nameEn: clean(item.nameEn, 500),
    ext: ext,
    href: href,
    visible: item.visible === false ? 'N' : 'Y',
  }
}

/** 新列插在同分類最後一列之後；沒有同分類時放到最下面 */
function insertIndexFor(rows, map, n) {
  var last = -1
  for (var i = 0; i < rows.length; i++) if (String(rows[i][map.n]).trim() === n) last = i
  return last < 0 ? rows.length + 2 : last + 3
}

function createDownload(input, user) {
  var v = validateDownload(input)
  var sheet = downloadsSheet()
  var map = downloadsMap(sheet)
  var rows = readRows(sheet, map)
  var id = nextId(rows, map)
  var at = insertIndexFor(rows, map, v.n)
  if (at <= sheet.getLastRow()) sheet.insertRowBefore(at)
  v.id = String(id)
  writeMapped(sheet, map, at, v)
  console.log('createDownload', user, id)
  return rowToDownload(sheet.getRange(at, 1, 1, map._width).getValues()[0], map)
}

function updateDownload(id, input, user) {
  var v = validateDownload(input)
  var sheet = downloadsSheet()
  var map = downloadsMap(sheet)
  var rows = readRows(sheet, map)
  var at = rowIndexOfId(rows, map, id)
  if (at < 0) throw apiError('NOT_FOUND', '找不到這份文件，可能已被刪除')
  v.id = String(Number(id))
  // 改了分類就把這一列實際搬到新分類的最後面，否則它會留在原位，
  // 讓試算表上同一個分類被切成不連續的兩段（看起來像漏了一列）
  if (String(rows[at - 2][map.n]).trim() !== v.n) {
    sheet.deleteRow(at)
    var left = readRows(sheet, map)
    at = insertIndexFor(left, map, v.n)
    if (at <= sheet.getLastRow()) sheet.insertRowBefore(at)
  }
  writeMapped(sheet, map, at, v)
  console.log('updateDownload', user, id)
  return rowToDownload(sheet.getRange(at, 1, 1, map._width).getValues()[0], map)
}

function deleteDownload(id, user) {
  var sheet = downloadsSheet()
  var map = downloadsMap(sheet)
  var at = rowIndexOfId(readRows(sheet, map), map, id)
  if (at < 0) throw apiError('NOT_FOUND', '找不到這份文件，可能已被刪除')
  sheet.deleteRow(at)
  console.log('deleteDownload', user, id)
  return Number(id)
}

/** 只在同一個分類裡上下移動，分類之間的順序不會被打亂 */
function moveDownload(id, dir, user) {
  var sheet = downloadsSheet()
  var map = downloadsMap(sheet)
  console.log('moveDownload', user, id, dir)
  return moveRow(sheet, map, id, dir === 'up' ? 'up' : 'down', function (a, b) {
    return String(a[map.n]).trim() === String(b[map.n]).trim()
  }, rowToDownload)
}

/* ───────── 人才發展 ───────── */

function careersSheet() { return sheetByName(CAREERS_SHEET) }
function careersMap(sheet) { return columnMap(sheet, CAREER_HEADERS, CAREERS_SHEET) }

function rowToCareer(row, map) {
  return {
    id: Number(row[map.id]),
    kind: CAREER_KINDS[String(row[map.kind]).trim()] || 'job',
    title: String(row[map.title]).trim(),
    titleEn: String(row[map.titleEn]).trim(),
    place: String(row[map.place]).trim(),
    nature: String(row[map.nature]).trim(),
    period: String(row[map.period]).trim(),
    body: String(row[map.body]).replace(/\r\n?/g, '\n').trim(),
    bodyEn: String(row[map.bodyEn]).replace(/\r\n?/g, '\n').trim(),
    href: String(row[map.href]).trim(),
    visible: !/^(n|no|否|0)$/i.test(String(row[map.visible]).trim()),
  }
}

function listCareers() {
  var sheet = careersSheet()
  var map = careersMap(sheet)
  return readRows(sheet, map)
    .filter(function (r) { return String(r[map.id]).trim() !== '' })
    .map(function (r) { return rowToCareer(r, map) })
}

function validateCareer(input) {
  var item = input || {}
  var kind = CAREER_KIND_LABELS[String(item.kind || '').trim()]
  if (!kind) throw apiError('VALIDATION', '類型只能是職缺或教育訓練')
  var title = clean(item.title, 200)
  if (!title) throw apiError('VALIDATION', '請填寫標題')
  var body = clean(item.body, 4000)
  if (!body) throw apiError('VALIDATION', '請填寫說明')
  var href = clean(item.href, 1000)
  if (href && !/^(https?:\/\/|mailto:)\S+$/.test(href)) {
    throw apiError('VALIDATION', '連結需以 http://、https:// 或 mailto: 開頭，且不能有空白')
  }
  return {
    kind: kind,
    title: title,
    titleEn: clean(item.titleEn, 300),
    place: clean(item.place, 100),
    nature: clean(item.nature, 100),
    period: clean(item.period, 100),
    body: body,
    bodyEn: clean(item.bodyEn, 6000),
    href: href,
    visible: item.visible === false ? 'N' : 'Y',
  }
}

function createCareer(input, user) {
  var v = validateCareer(input)
  var sheet = careersSheet()
  var map = careersMap(sheet)
  var rows = readRows(sheet, map)
  var id = nextId(rows, map)
  var at = rows.length + 2
  v.id = String(id)
  writeMapped(sheet, map, at, v)
  console.log('createCareer', user, id)
  return rowToCareer(sheet.getRange(at, 1, 1, map._width).getValues()[0], map)
}

function updateCareer(id, input, user) {
  var v = validateCareer(input)
  var sheet = careersSheet()
  var map = careersMap(sheet)
  var at = rowIndexOfId(readRows(sheet, map), map, id)
  if (at < 0) throw apiError('NOT_FOUND', '找不到這筆資料，可能已被刪除')
  v.id = String(Number(id))
  writeMapped(sheet, map, at, v)
  console.log('updateCareer', user, id)
  return rowToCareer(sheet.getRange(at, 1, 1, map._width).getValues()[0], map)
}

function deleteCareer(id, user) {
  var sheet = careersSheet()
  var map = careersMap(sheet)
  var at = rowIndexOfId(readRows(sheet, map), map, id)
  if (at < 0) throw apiError('NOT_FOUND', '找不到這筆資料，可能已被刪除')
  sheet.deleteRow(at)
  console.log('deleteCareer', user, id)
  return Number(id)
}

/** 只在同一個類型（職缺／教育訓練）裡上下移動 */
function moveCareer(id, dir, user) {
  var sheet = careersSheet()
  var map = careersMap(sheet)
  console.log('moveCareer', user, id, dir)
  return moveRow(sheet, map, id, dir === 'up' ? 'up' : 'down', function (a, b) {
    return String(a[map.kind]).trim() === String(b[map.kind]).trim()
  }, rowToCareer)
}

/* ───────── 一次性安裝 ───────── */

/**
 * 在編輯器手動執行一次：
 * - 「資料下載」補上 ID 欄並從 1 開始編號（已有的不動）
 * - 建立「人才發展」工作表與欄位（已存在就不動），並印出它的 gid
 */
function setupAdminSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  var downloads = downloadsSheet()
  var header = downloads.getRange(1, 1, 1, downloads.getLastColumn()).getValues()[0]
    .map(function (h) { return String(h).trim() })
  if (header.indexOf(DOWNLOAD_HEADERS.id) < 0) {
    var col = downloads.getLastColumn() + 1
    downloads.getRange(1, col).setValue(DOWNLOAD_HEADERS.id).setFontWeight('bold')
    header.push(DOWNLOAD_HEADERS.id)
  }
  var map = downloadsMap(downloads)
  var rows = readRows(downloads, map)
  var next = nextId(rows, map)
  var ids = rows.map(function (r) {
    var has = String(r[map.name]).trim() || String(r[map.href]).trim()
    var id = String(r[map.id]).trim()
    if (!has) return ['']
    return [id || String(next++)]
  })
  if (ids.length) {
    var idRange = downloads.getRange(2, map.id + 1, ids.length, 1)
    idRange.setNumberFormat('@')
    idRange.setValues(ids)
  }

  var careers = ss.getSheetByName(CAREERS_SHEET)
  if (!careers) {
    careers = ss.insertSheet(CAREERS_SHEET)
    var labels = Object.keys(CAREER_HEADERS).map(function (k) { return CAREER_HEADERS[k] })
    careers.getRange(1, 1, 1, labels.length).setValues([labels]).setFontWeight('bold')
    careers.setFrozenRows(1)
  }

  Logger.log([
    '資料下載：ID 欄已就緒，共 ' + ids.filter(function (r) { return r[0] }).length + ' 筆已編號。',
    '人才發展 gid（填到 src/config/content-sheet.ts 的 careers）= ' + careers.getSheetId(),
    '',
    '記得把「人才發展」一併發布到網路：檔案 → 共用 → 發布到網路 → 整份文件 → CSV。',
  ].join('\n'))
}

/* ───────── 意見反應（公開，不需登入） ───────── */

/**
 * 公開網站 /contact 的表單。只把內容寄到 CONTACT_TO，不寫進「成大智研官網內容」試算表
 * ——那份試算表是「發布到網路」的，寫進去等於把來信者的姓名、電話、信箱公開。
 * 防濫用：蜜罐欄位、欄位長度上限、全站每 10 分鐘最多 CONTACT_MAX_PER_10MIN 封。
 */
function receiveContact(body) {
  // 蜜罐：真人看不到這個欄位，填了就當成機器人，回成功但不寄信
  if (clean(body.botField, 100)) return { sent: true }

  var name = clean(body.name, 100)
  var email = clean(body.email, 200)
  var subject = clean(body.subject, 200)
  var message = clean(body.message, 5000)
  if (!name) throw apiError('VALIDATION', '請填寫姓名')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw apiError('VALIDATION', 'E-mail 格式不正確')
  if (!subject) throw apiError('VALIDATION', '請填寫訊息主旨')
  if (!message) throw apiError('VALIDATION', '請填寫訊息內容')

  var cache = CacheService.getScriptCache()
  var key = 'contact-' + Math.floor(Date.now() / (10 * 60 * 1000))
  var count = Number(cache.get(key) || 0)
  if (count >= CONTACT_MAX_PER_10MIN) {
    throw apiError('BUSY', '目前來信量較多，請稍後再送出，或直接來信 ' + contactTo())
  }
  cache.put(key, String(count + 1), 15 * 60)

  var lines = [
    '主旨類別：' + clean(body.topic, 50),
    '姓名：' + name,
    '服務單位：' + clean(body.organization, 200),
    '聯絡電話：' + clean(body.phone, 50),
    'E-mail：' + email,
    '訊息主旨：' + subject,
    '同意隱私權政策：' + (clean(body.privacy, 10) === 'yes' ? '是' : '否'),
    '介面語言：' + clean(body.locale, 20),
    '送出時間：' + formatNow(),
    '',
    '訊息內容：',
    message,
  ].join('\n')

  MailApp.sendEmail({
    to: contactTo(),
    replyTo: email,
    name: '成大智研官網',
    subject: '[官網意見反應] ' + subject,
    body: lines,
  })
  console.log('contact', email, subject)
  return { sent: true }
}

function contactTo() {
  return CONTACT_TO || Session.getEffectiveUser().getEmail()
}
