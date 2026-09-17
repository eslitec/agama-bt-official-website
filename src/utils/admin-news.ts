import type { AdminNewsInput, AdminNewsItem, NewsItem } from '@/types/models'

const pad = (n: number): string => String(n).padStart(2, '0')

/** 今天（本地時間），格式 YYYY.MM.DD */
export const todayNewsDate = (now = new Date()): string =>
  `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`

/**
 * 日期正規化為 YYYY.MM.DD（也接受 - 或 / 分隔、月日一位數）；不是存在的日期時回傳 null。
 */
export function normalizeNewsDate(value: string): string | null {
  const m = value.trim().match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/)
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(y, mo - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null
  return `${m[1]}.${pad(mo)}.${pad(d)}`
}

/** YYYY.MM.DD → 原生 date 輸入框的 YYYY-MM-DD；格式錯誤時回傳空字串 */
export const toDateInputValue = (date: string): string =>
  normalizeNewsDate(date)?.replaceAll('.', '-') ?? ''

/** 內建消息資料轉成後台格式（開發模擬資料用） */
export const toAdminNewsItem = (n: NewsItem): AdminNewsItem => ({
  id: n.id,
  date: n.date,
  src: n.src,
  srcEn: n.srcEn ?? '',
  no: n.no,
  title: n.title,
  titleEn: n.titleEn ?? '',
  atts: n.atts.map(({ label, href }) => ({ label, href })),
  imgs: [...(n.imgs ?? [])],
  visible: true,
})

export const emptyNewsInput = (now = new Date()): AdminNewsInput => ({
  date: todayNewsDate(now),
  src: '',
  srcEn: '',
  no: '',
  title: '',
  titleEn: '',
  atts: [],
  imgs: [],
  visible: true,
})

/** 送出前整理：去除前後空白、略過整列空白的附件與圖片 */
export const cleanNewsInput = (input: AdminNewsInput): AdminNewsInput => ({
  date: normalizeNewsDate(input.date) ?? input.date.trim(),
  src: input.src.trim(),
  srcEn: input.srcEn.trim(),
  no: input.no.trim(),
  title: input.title.trim(),
  titleEn: input.titleEn.trim(),
  atts: input.atts
    .map((a) => ({ label: a.label.trim(), href: a.href.trim() }))
    .filter((a) => a.label || a.href),
  imgs: input.imgs.map((u) => u.trim()).filter(Boolean),
  visible: input.visible,
})

/** 後台列表排序：日期新到舊，同日期 ID 大的在前（與 API 一致） */
export const sortAdminNews = (items: AdminNewsItem[]): AdminNewsItem[] =>
  [...items].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)

/** 後台搜尋：比對中英文標題（不分大小寫）與公告編號 */
export function filterAdminNews(
  items: AdminNewsItem[],
  query: string,
  visibility: 'all' | 'visible' | 'hidden' = 'all',
): AdminNewsItem[] {
  const q = query.trim().toLowerCase()
  return items.filter(
    (n) =>
      (visibility === 'all' || n.visible === (visibility === 'visible')) &&
      (!q ||
        n.title.toLowerCase().includes(q) ||
        n.titleEn.toLowerCase().includes(q) ||
        n.no.toLowerCase() === q),
  )
}
