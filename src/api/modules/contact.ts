import { ApiError, fromStatic, hasBackend, http } from '@/api/http'

/**
 * 意見反應表單。
 * - 有後端（VITE_API_BASE_URL）：POST /contact。
 * - 部署在 Netlify：以 Netlify Forms 收件，送到靜態檔 /forms/contact.html
 *   （該檔內有同名表單供 Netlify 建置時偵測，欄位需與 CONTACT_FIELDS 一致，測試會檢查）。
 * - 開發環境（npm run dev）：沒有 Netlify，只模擬送出成功。
 */
export const CONTACT_FORM_NAME = 'contact'
export const CONTACT_ENDPOINT = '/forms/contact.html'
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

export const CONTACT_TOPICS = ['apply', 'fee', 'member', 'complaint', 'website', 'other'] as const
export type ContactTopic = (typeof CONTACT_TOPICS)[number]

export type ContactPayload = Record<(typeof CONTACT_FIELDS)[number], string>

export const isDemoContact = (): boolean => !hasBackend() && import.meta.env.DEV

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
