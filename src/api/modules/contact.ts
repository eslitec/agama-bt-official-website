import { ApiError, fromStatic, hasBackend, http } from '@/api/http'

/**
 * 意見反應表單。依設定選用收件方式，由上往下第一個成立的為準：
 * - 有後端（VITE_API_BASE_URL）：POST /contact。
 * - 開發環境（npm run dev）且沒有後端：只模擬送出成功。
 * - 有設定 VITE_CONTACT_API_URL：POST 到 Apps Script 網頁應用程式（apps-script/admin-api.gs
 *   的 contact 動作），由它寄信給公司信箱。GitHub Pages 沒有表單後端，走這條。
 * - 其他（Netlify）：以 Netlify Forms 收件，送到靜態檔 /forms/contact.html
 *   （該檔內有同名表單供 Netlify 建置時偵測，欄位需與 CONTACT_FIELDS 一致，測試會檢查）。
 */
export const CONTACT_FORM_NAME = 'contact'
export const CONTACT_ENDPOINT = `${import.meta.env.BASE_URL}forms/contact.html`
export const CONTACT_FIELDS = [
  'topic',
  'name',
  'organization',
  'phone',
  'email',
  'subject',
  'message',
  'privacy',
  'locale',
] as const
/** 防機器人欄位（真人看不到，填了就會被 Netlify 當成垃圾訊息） */
export const CONTACT_HONEYPOT = 'bot-field'

export const CONTACT_TOPICS = ['apply', 'fee', 'complaint', 'website', 'other'] as const
export type ContactTopic = (typeof CONTACT_TOPICS)[number]

export type ContactPayload = Record<(typeof CONTACT_FIELDS)[number], string>

export const isDemoContact = (): boolean => !hasBackend() && import.meta.env.DEV

/** Apps Script 網頁應用程式網址（結尾 /exec）；沒設定就走 Netlify Forms */
export const contactApiUrl = (): string => (import.meta.env.VITE_CONTACT_API_URL ?? '').trim()

/**
 * Apps Script 的請求內容。與後台 API 同一個進入點，所以要帶 action；
 * 蜜罐欄位用 botField（Apps Script 端看到有值就當成機器人，回成功但不寄信）。
 */
export const contactApiBody = (payload: ContactPayload, honeypot = ''): string =>
  JSON.stringify({ action: 'contact', botField: honeypot, ...payload })

/** 轉成 application/x-www-form-urlencoded（Netlify Forms 的格式） */
export const encodeContactForm = (payload: ContactPayload, honeypot = ''): string =>
  new URLSearchParams({
    'form-name': CONTACT_FORM_NAME,
    [CONTACT_HONEYPOT]: honeypot,
    ...payload,
  }).toString()

export async function sendContact(payload: ContactPayload, honeypot = ''): Promise<void> {
  if (hasBackend()) {
    await http.post('/contact', payload)
    return
  }
  if (isDemoContact()) {
    await fromStatic(null)
    return
  }
  const scriptUrl = contactApiUrl()
  if (scriptUrl) {
    await sendViaScript(scriptUrl, payload, honeypot)
    return
  }
  let res: Response
  try {
    res = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeContactForm(payload, honeypot),
    })
  } catch {
    throw new ApiError('Network error', undefined, 'CONTACT_FAILED')
  }
  if (!res.ok) throw new ApiError('Contact form rejected', res.status, 'CONTACT_FAILED')
}

/**
 * 送到 Apps Script：一律 text/plain，避免 Apps Script 無法回應的 CORS 預檢
 * （與後台 API 同樣的做法，見 src/api/modules/admin.ts）。
 */
async function sendViaScript(
  url: string,
  payload: ContactPayload,
  honeypot: string,
): Promise<void> {
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: contactApiBody(payload, honeypot),
      redirect: 'follow',
      credentials: 'omit',
    })
  } catch {
    throw new ApiError('Network error', undefined, 'CONTACT_FAILED')
  }
  if (!res.ok) throw new ApiError('Contact form rejected', res.status, 'CONTACT_FAILED')
  let json: unknown
  try {
    json = await res.json()
  } catch {
    throw new ApiError('Invalid response', undefined, 'CONTACT_FAILED')
  }
  const ok = !!json && typeof json === 'object' && (json as { ok?: unknown }).ok === true
  if (!ok) throw new ApiError('Contact form rejected', undefined, 'CONTACT_FAILED')
}
