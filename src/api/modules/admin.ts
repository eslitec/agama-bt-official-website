import type { AdminAccount, AdminNewsInput, AdminNewsItem, AdminSession } from '@/types/models'

/**
 * 管理者後台 API（Google Apps Script Web App，原始碼在 apps-script/admin-api.gs）。
 *
 * - 網址由環境變數 VITE_ADMIN_API_URL 設定（部署後的 …/exec）。
 * - 一律 POST、Content-Type 為 text/plain：Apps Script 無法回應 CORS 預檢（OPTIONS），
 *   text/plain 屬於「簡單請求」，瀏覽器不會送預檢。
 * - 回應為 { ok: true, data } 或 { ok: false, error: { code, message } }。
 * - 開發環境（npm run dev）未設定網址時，改用 src/api/admin-mock.ts 的模擬後台。
 */

/** 伺服器回傳的錯誤代碼；NETWORK、NOT_CONFIGURED 為前端自行產生 */
export type AdminErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'INVALID_CREDENTIALS'
  | 'LOCKED'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'SETUP_DONE'
  | 'INVALID_SETUP_CODE'
  | 'BUSY'
  | 'SERVER'
  | 'NETWORK'
  | 'NOT_CONFIGURED'

export class AdminApiError extends Error {
  readonly code: AdminErrorCode

  constructor(code: AdminErrorCode, message: string) {
    super(message)
    this.name = 'AdminApiError'
    this.code = code
  }
}

/** 伺服器訊息（中文）可直接顯示給使用者的錯誤代碼 */
export const USER_FACING_CODES: readonly AdminErrorCode[] = [
  'VALIDATION',
  'INVALID_CREDENTIALS',
  'LOCKED',
  'INVALID_SETUP_CODE',
  'SETUP_DONE',
  'NOT_FOUND',
  'BUSY',
]

export type AdminResponse<T> =
  { ok: true; data: T } | { ok: false; error: { code: AdminErrorCode; message: string } }

export type AdminRequestBody = { action: string; token?: string } & Record<string, unknown>

export const adminApiUrl = (): string => (import.meta.env.VITE_ADMIN_API_URL ?? '').trim()

/** 已設定正式後台網址 */
export const isAdminApiConfigured = (): boolean => Boolean(adminApiUrl())

/** 開發環境且未設定網址：使用模擬後台 */
export const isAdminMock = (): boolean => import.meta.env.DEV && !isAdminApiConfigured()

/** 後台可以使用（正式網址或開發模擬） */
export const isAdminAvailable = (): boolean => isAdminApiConfigured() || isAdminMock()

const isResponse = (v: unknown): v is AdminResponse<unknown> =>
  !!v && typeof v === 'object' && typeof (v as { ok?: unknown }).ok === 'boolean'

/** 把回應轉成資料或 AdminApiError */
export function unwrap<T>(json: unknown): T {
  if (!isResponse(json)) throw new AdminApiError('SERVER', 'Unexpected response')
  if (json.ok) return json.data as T
  const code = json.error?.code ?? 'SERVER'
  throw new AdminApiError(code, json.error?.message ?? '')
}

async function post(url: string, body: AdminRequestBody): Promise<unknown> {
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      redirect: 'follow',
      credentials: 'omit',
    })
  } catch {
    throw new AdminApiError('NETWORK', 'Network error')
  }
  if (!res.ok)
    throw new AdminApiError(res.status >= 500 ? 'SERVER' : 'NETWORK', `HTTP ${res.status}`)
  try {
    return await res.json()
  } catch {
    // 部署設定錯誤（例如存取權不是「所有人」）時 Google 會回傳 HTML 登入頁
    throw new AdminApiError('SERVER', 'Invalid JSON response')
  }
}

export async function request<T>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  const body: AdminRequestBody = { action, ...params }
  const url = adminApiUrl()
  if (url) return unwrap<T>(await post(url, body))
  if (import.meta.env.DEV) {
    const { adminMock } = await import('@/api/admin-mock')
    return unwrap<T>(await adminMock.handle(body))
  }
  throw new AdminApiError('NOT_CONFIGURED', 'VITE_ADMIN_API_URL is not set')
}

/* ───────── 各操作 ───────── */

export const setupStatus = (): Promise<{ needsSetup: boolean }> => request('setupStatus')

export const setup = (params: {
  setupCode: string
  username: string
  password: string
}): Promise<AdminSession> => request('setup', params)

export const login = (params: { username: string; password: string }): Promise<AdminSession> =>
  request('login', params)

export const me = (token: string): Promise<{ username: string; expiresAt: number }> =>
  request('me', { token })

export const listNews = (token: string): Promise<{ items: AdminNewsItem[] }> =>
  request('listNews', { token })

export const createNews = (token: string, item: AdminNewsInput): Promise<{ item: AdminNewsItem }> =>
  request('createNews', { token, item })

export const updateNews = (
  token: string,
  id: number,
  item: AdminNewsInput,
): Promise<{ item: AdminNewsItem }> => request('updateNews', { token, id, item })

export const deleteNews = (token: string, id: number): Promise<{ id: number }> =>
  request('deleteNews', { token, id })

export const changePassword = (
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<Record<string, never>> =>
  request('changePassword', { token, currentPassword, newPassword })

export const listAdmins = (token: string): Promise<{ admins: AdminAccount[] }> =>
  request('listAdmins', { token })

export const addAdmin = (
  token: string,
  username: string,
  password: string,
): Promise<Record<string, never>> => request('addAdmin', { token, username, password })

export const removeAdmin = (token: string, username: string): Promise<Record<string, never>> =>
  request('removeAdmin', { token, username })
