/**
 * 成大智研官網後台 API（Google Apps Script Web App）
 *
 * 用途：管理者登入後新增、修改、刪除「成大智研官網內容」試算表的「最新消息」。
 * 部署：部署 → 新增部署作業 → 類型「網頁應用程式」→ 執行身分「我」→ 存取權「所有人」。
 *       部署後的網址填到網站環境變數 VITE_ADMIN_API_URL。
 * 初次設定：在編輯器執行 createSetupCode()，到「執行記錄」看設定碼，
 *           到網站 /login 的「初次設定」輸入設定碼與第一位管理者帳號密碼（設定碼 30 分鐘內有效、只能用一次）。
 *
 * 安全設計：
 * - 管理者帳密存在「指令碼屬性」（不在試算表裡，試算表已公開發布）。
 * - 密碼以隨機 salt + SHA-256 迭代雜湊儲存，不保存明碼。
 * - 登入成功回傳 HMAC-SHA256 簽章的權杖（8 小時有效），之後每個請求都要帶權杖。
 * - 同一帳號連續登入失敗 5 次鎖定 15 分鐘。
 * - 寫入試算表使用 LockService 避免同時編輯互相覆蓋。
 *
 * 請求格式：POST，Content-Type: text/plain，內容為 JSON { action, token?, ...參數 }
 * 回應格式：{ ok: true, data } 或 { ok: false, error: { code, message } }
 */

var SPREADSHEET_ID = '1I2qpT_Vs0iHJmx46TZGkDwvhLMzi4IFY9O379vbnpmE'
var NEWS_GID = 40890007
var TOKEN_TTL_MS = 8 * 60 * 60 * 1000
var HASH_ROUNDS = 1000
var MAX_FAILS = 5
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
  if (fails >= MAX_FAILS) throw apiError('LOCKED', '登入失敗次數過多，請 15 分鐘後再試')
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

function newsSheet() {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    .getSheets()
    .filter(function (s) { return s.getSheetId() === NEWS_GID })[0]
  if (!sheet) throw apiError('SERVER', '找不到「最新消息」工作表')
  return sheet
}

function columnMap(sheet) {
  var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim() })
  var map = {}
  Object.keys(NEWS_HEADERS).forEach(function (key) {
    var idx = header.indexOf(NEWS_HEADERS[key])
    if (idx < 0) throw apiError('SERVER', '「最新消息」缺少欄位：' + NEWS_HEADERS[key])
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
  var map = columnMap(sheet)
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
  var map = columnMap(sheet)
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
  var map = columnMap(sheet)
  var rowIndex = findRowIndex(sheet, map, id)
  if (rowIndex < 0) throw apiError('NOT_FOUND', '找不到這則消息，可能已被刪除')
  writeRow(sheet, map, rowIndex, Number(id), v)
  console.log('updateNews', user, id)
  return rowToItem(sheet.getRange(rowIndex, 1, 1, map._width).getValues()[0], map)
}

function deleteNews(id, user) {
  var sheet = newsSheet()
  var map = columnMap(sheet)
  var rowIndex = findRowIndex(sheet, map, id)
  if (rowIndex < 0) throw apiError('NOT_FOUND', '找不到這則消息，可能已被刪除')
  sheet.deleteRow(rowIndex)
  console.log('deleteNews', user, id)
  return Number(id)
}
