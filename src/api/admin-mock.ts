/**
 * 開發用模擬後台（npm run dev 且未設定 VITE_ADMIN_API_URL 時使用）。
 * 行為與 apps-script/admin-api.gs 相同：同樣的 action、回應格式、錯誤代碼與驗證規則。
 * 資料只存在記憶體，重新整理頁面後消息會還原成內建資料。
 */
import type { AdminAccount, AdminDownloadItem, AdminNewsItem } from '@/types/models'
import type { AdminErrorCode, AdminRequestBody, AdminResponse } from '@/api/modules/admin'
import { newsData } from '@/api/data/news.data'
import { downloadGroupsData } from '@/api/data/downloads.data'
import { sortAdminNews, toAdminNewsItem } from '@/utils/admin-news'

/** 內建的資料下載資料攤平成後台的一列一檔（同名多格式會變成多列） */
const seedDownloads = (): AdminDownloadItem[] => {
  let id = 0
  return downloadGroupsData.flatMap((g) =>
    g.files.flatMap((f) =>
      [{ ext: f.ext, href: f.href }, ...(f.more ?? [])].map((v) => ({
        id: ++id,
        n: g.n,
        group: g.title,
        groupEn: g.titleEn ?? '',
        name: f.name,
        nameEn: f.nameEn ?? '',
        ext: v.ext,
        href: v.href,
        visible: true,
      })),
    ),
  )
}

export const MOCK_ADMIN = { username: 'admin', password: 'admin12345' } as const

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000
const MIN_PASSWORD = 10
const MAX_FAILS = 5

class MockError extends Error {
  constructor(
    readonly code: AdminErrorCode,
    message: string,
  ) {
    super(message)
  }
}

interface MockAdmin extends AdminAccount {
  password: string
}

export interface AdminMockOptions {
  /** 目前時間（測試權杖逾時用） */
  now?: () => number
  /** 模擬網路延遲（毫秒） */
  delay?: number
  /** 初始消息（預設為內建資料） */
  news?: AdminNewsItem[]
  /** 初始資料下載（預設為內建資料） */
  downloads?: AdminDownloadItem[]
  /** true 時沒有管理者帳號，需要初次設定 */
  needsSetup?: boolean
  /** 初次設定碼 */
  setupCode?: string
}

const b64 = (s: string): string => btoa(String.fromCharCode(...new TextEncoder().encode(s)))
const unb64 = (s: string): string =>
  new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)))

const clean = (v: unknown, max: number): string =>
  String(v ?? '')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, max)

export function createAdminMock(options: AdminMockOptions = {}) {
  const now = options.now ?? Date.now
  const delay = options.delay ?? 0
  let news: AdminNewsItem[] = structuredClone(options.news ?? newsData.map(toAdminNewsItem))
  let downloads: AdminDownloadItem[] = structuredClone(options.downloads ?? seedDownloads())
  let admins: MockAdmin[] = options.needsSetup
    ? []
    : [{ ...MOCK_ADMIN, createdAt: '2026-09-01T00:00:00.000Z' }]
  const fails = new Map<string, number>()

  const fail = (code: AdminErrorCode, message: string): never => {
    throw new MockError(code, message)
  }

  /* 權杖：內容 + 「簽章」（模擬用，不具安全性）；重新整理頁面後仍有效 */
  const signature = (payload: string): string => b64(`mock-secret:${payload}`).slice(0, 16)

  function issueToken(username: string) {
    const expiresAt = now() + TOKEN_TTL_MS
    const payload = b64(JSON.stringify({ u: username, exp: expiresAt }))
    return { token: `${payload}.${signature(payload)}`, username, expiresAt }
  }

  function verifyToken(token: unknown): { u: string; exp: number } {
    const [payload, sig, extra] = String(token ?? '').split('.')
    if (!payload || extra !== undefined || signature(payload) !== sig)
      fail('UNAUTHORIZED', '請重新登入')
    let data: { u: string; exp: number }
    try {
      data = JSON.parse(unb64(payload!))
    } catch {
      return fail('UNAUTHORIZED', '請重新登入')
    }
    if (!data.exp || data.exp < now()) fail('UNAUTHORIZED', '登入已逾時，請重新登入')
    if (!admins.some((a) => a.username === data.u)) fail('UNAUTHORIZED', '帳號已停用')
    return data
  }

  function normalizeUsername(v: unknown): string {
    const u = String(v ?? '')
      .trim()
      .toLowerCase()
    if (!/^[a-z0-9._-]{3,32}$/.test(u)) fail('VALIDATION', '帳號需為 3–32 個英數字（可含 . _ -）')
    return u
  }

  function checkPasswordRule(p: unknown): string {
    const s = String(p ?? '')
    if (s.length < MIN_PASSWORD || !/[A-Za-z]/.test(s) || !/[0-9]/.test(s))
      fail('VALIDATION', `密碼至少 ${MIN_PASSWORD} 個字元，且需同時包含英文字母與數字`)
    return s
  }

  function validateItem(input: unknown): Omit<AdminNewsItem, 'id'> {
    const item = (input ?? {}) as Record<string, unknown>
    let date = clean(item.date, 10).replace(/[-/]/g, '.')
    const m = date.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})$/)
    if (!m) fail('VALIDATION', '日期格式需為 YYYY.MM.DD')
    date = `${m![1]}.${m![2]!.padStart(2, '0')}.${m![3]!.padStart(2, '0')}`
    const title = clean(item.title, 300)
    if (!title) fail('VALIDATION', '請填寫標題')
    const atts = (Array.isArray(item.atts) ? item.atts : []).slice(0, 20).map((a) => {
      const href = clean(a?.href, 1000)
      if (!/^https?:\/\/\S+$/.test(href))
        fail('VALIDATION', '附件網址需以 http:// 或 https:// 開頭，且不能有空白')
      return {
        label: clean(a?.label, 100)
          .replace(/[|｜\n]/g, ' ')
          .trim(),
        href,
      }
    })
    const imgs = (Array.isArray(item.imgs) ? item.imgs : []).slice(0, 30).map((u) => {
      const url = clean(u, 1000)
      if (!/^https?:\/\/\S+$/.test(url))
        fail('VALIDATION', '圖片網址需以 http:// 或 https:// 開頭，且不能有空白')
      return url
    })
    return {
      date,
      src: clean(item.src, 100),
      srcEn: clean(item.srcEn, 200),
      no: clean(item.no, 30),
      title,
      titleEn: clean(item.titleEn, 500),
      atts,
      imgs,
      visible: item.visible !== false,
    }
  }

  const indexOf = (id: unknown): number => {
    const i = news.findIndex((n) => n.id === Number(id))
    if (i < 0) fail('NOT_FOUND', '找不到這則消息，可能已被刪除')
    return i
  }

  function validateDownload(input: unknown): Omit<AdminDownloadItem, 'id'> {
    const item = (input ?? {}) as Record<string, unknown>
    const n = clean(item.n, 10)
    if (!/^[0-9A-Za-z]{1,10}$/.test(n)) fail('VALIDATION', '分類編號只能是英數字（例如 01、05）')
    const group = clean(item.group, 100)
    if (!group) fail('VALIDATION', '請填寫分類名稱')
    const name = clean(item.name, 300)
    if (!name) fail('VALIDATION', '請填寫檔名')
    const href = clean(item.href, 1000)
    if (!/^https?:\/\/\S+$/.test(href))
      fail('VALIDATION', '檔案連結需以 http:// 或 https:// 開頭，且不能有空白')
    const ext = clean(item.ext, 10)
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, '')
    if (!ext) fail('VALIDATION', '請填寫格式（例如 PDF、DOC）')
    return {
      n,
      group,
      groupEn: clean(item.groupEn, 200),
      name,
      nameEn: clean(item.nameEn, 500),
      ext,
      href,
      visible: item.visible !== false,
    }
  }

  /** 在同一個群組內與相鄰項目對調（與 admin-api.gs 的 moveRow 行為相同） */
  function moveWithin<T extends { id: number }>(
    list: T[],
    id: unknown,
    dir: unknown,
    sameGroup: (a: T, b: T) => boolean,
  ): T[] {
    const i = list.findIndex((v) => v.id === Number(id))
    if (i < 0) fail('NOT_FOUND', '找不到這筆資料，可能已被刪除')
    const step = dir === 'up' ? -1 : 1
    let j = i + step
    while (j >= 0 && j < list.length && !sameGroup(list[i]!, list[j]!)) j += step
    if (j < 0 || j >= list.length) fail('VALIDATION', '已經在最前面或最後面了')
    const next = [...list]
    ;[next[i], next[j]] = [next[j]!, next[i]!]
    return next
  }

  function login(body: AdminRequestBody) {
    const username = String(body.username ?? '')
      .trim()
      .toLowerCase()
    const count = fails.get(username) ?? 0
    if (count >= MAX_FAILS) fail('LOCKED', '登入失敗次數過多，請 15 分鐘後再試')
    const admin = admins.find((a) => a.username === username)
    if (!admin || admin.password !== String(body.password ?? '')) {
      fails.set(username, count + 1)
      fail('INVALID_CREDENTIALS', '帳號或密碼錯誤')
    }
    fails.delete(username)
    return issueToken(admin!.username)
  }

  function dispatch(body: AdminRequestBody): unknown {
    switch (body.action) {
      case 'setupStatus':
        return { needsSetup: admins.length === 0 }
      case 'setup': {
        if (admins.length) fail('SETUP_DONE', '已完成初次設定，請直接登入')
        const code = String(body.setupCode ?? '')
          .trim()
          .toUpperCase()
        if (!options.setupCode || code !== options.setupCode.toUpperCase())
          fail('INVALID_SETUP_CODE', '設定碼錯誤或已過期，請重新產生')
        const username = normalizeUsername(body.username)
        const password = checkPasswordRule(body.password)
        admins = [{ username, password, createdAt: new Date(now()).toISOString() }]
        return issueToken(username)
      }
      case 'login':
        return login(body)
    }

    const session = verifyToken(body.token)
    switch (body.action) {
      case 'me':
        return { username: session.u, expiresAt: session.exp }
      case 'listNews':
        return { items: sortAdminNews(news) }
      case 'createNews': {
        const v = validateItem(body.item)
        const id = news.reduce((max, n) => Math.max(max, n.id), 0) + 1
        const item = { id, ...v }
        news = [item, ...news]
        return { item }
      }
      case 'updateNews': {
        const v = validateItem(body.item)
        const i = indexOf(body.id)
        const item = { id: Number(body.id), ...v }
        news[i] = item
        return { item }
      }
      case 'deleteNews': {
        const i = indexOf(body.id)
        news.splice(i, 1)
        return { id: Number(body.id) }
      }
      case 'listDownloads':
        return { items: downloads }
      case 'createDownload': {
        const v = validateDownload(body.item)
        const id = downloads.reduce((max, d) => Math.max(max, d.id), 0) + 1
        const item = { id, ...v }
        // 與後端一致：放在同分類最後一筆之後
        const last = downloads.map((d) => d.n).lastIndexOf(v.n)
        downloads =
          last < 0
            ? [...downloads, item]
            : [...downloads.slice(0, last + 1), item, ...downloads.slice(last + 1)]
        return { item }
      }
      case 'updateDownload': {
        const v = validateDownload(body.item)
        const i = downloads.findIndex((d) => d.id === Number(body.id))
        if (i < 0) fail('NOT_FOUND', '找不到這份文件，可能已被刪除')
        const item = { id: Number(body.id), ...v }
        // 與後端一致：改了分類就搬到新分類最後面，分類在試算表上才不會被切成兩段
        if (downloads[i]!.n !== v.n) {
          const rest = downloads.filter((_, n) => n !== i)
          const last = rest.map((d) => d.n).lastIndexOf(v.n)
          downloads =
            last < 0 ? [...rest, item] : [...rest.slice(0, last + 1), item, ...rest.slice(last + 1)]
        } else {
          downloads[i] = item
        }
        return { item }
      }
      case 'deleteDownload': {
        const i = downloads.findIndex((d) => d.id === Number(body.id))
        if (i < 0) fail('NOT_FOUND', '找不到這份文件，可能已被刪除')
        downloads.splice(i, 1)
        return { id: Number(body.id) }
      }
      case 'moveDownload':
        downloads = moveWithin(downloads, body.id, body.dir, (a, b) => a.n === b.n)
        return { items: downloads }
      case 'changePassword': {
        const admin = admins.find((a) => a.username === session.u)
        if (!admin || admin.password !== String(body.currentPassword ?? ''))
          fail('INVALID_CREDENTIALS', '目前的密碼不正確')
        admin!.password = checkPasswordRule(body.newPassword)
        return {}
      }
      case 'listAdmins':
        return { admins: admins.map(({ username, createdAt }) => ({ username, createdAt })) }
      case 'addAdmin': {
        const username = normalizeUsername(body.username)
        if (admins.some((a) => a.username === username)) fail('VALIDATION', '這個帳號已存在')
        const password = checkPasswordRule(body.password)
        admins.push({ username, password, createdAt: new Date(now()).toISOString() })
        return {}
      }
      case 'removeAdmin': {
        const username = String(body.username ?? '')
          .trim()
          .toLowerCase()
        if (username === session.u) fail('VALIDATION', '不能刪除自己的帳號')
        const next = admins.filter((a) => a.username !== username)
        if (next.length === admins.length) fail('NOT_FOUND', '找不到這個帳號')
        admins = next
        return {}
      }
      default:
        return fail('BAD_REQUEST', '不支援的操作')
    }
  }

  async function handle(body: AdminRequestBody): Promise<AdminResponse<unknown>> {
    if (delay) await new Promise((r) => setTimeout(r, delay))
    try {
      // 經過 JSON 來回轉換，與真正的網路傳輸一樣不會共用物件
      const data = dispatch(JSON.parse(JSON.stringify(body)))
      return { ok: true, data: JSON.parse(JSON.stringify(data ?? {})) }
    } catch (e) {
      if (e instanceof MockError) return { ok: false, error: { code: e.code, message: e.message } }
      return { ok: false, error: { code: 'SERVER', message: '伺服器發生錯誤，請稍後再試' } }
    }
  }

  return { handle }
}

export type AdminMock = ReturnType<typeof createAdminMock>

/** 開發伺服器共用的模擬後台（稍微延遲，方便看到「儲存中」狀態） */
export const adminMock: AdminMock = createAdminMock({ delay: 350 })
