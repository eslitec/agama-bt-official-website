export interface PageResult<T> {
  items: T[]
  page: number
  total: number
}

/** 依頁碼切出資料，頁碼超出範圍時自動夾回 1 ~ total */
export const paginate = <T>(list: T[], page: number, perPage: number): PageResult<T> => {
  const total = Math.max(1, Math.ceil(list.length / perPage))
  const safe = Number.isFinite(page) ? Math.trunc(page) : 1
  const current = Math.min(Math.max(1, safe), total)
  return {
    items: list.slice((current - 1) * perPage, current * perPage),
    page: current,
    total,
  }
}

/** 解析路由 query 的頁碼 */
export const parsePage = (raw: unknown): number => {
  const v = Array.isArray(raw) ? raw[0] : raw
  const n = Number.parseInt(String(v ?? ''), 10)
  return Number.isNaN(n) || n < 1 ? 1 : n
}

export type PageToken = number | 'gap-start' | 'gap-end'

/**
 * 產生分頁按鈕序列：首頁、末頁、目前頁前後 siblings 頁，其餘以省略號代替。
 * 只省略 1 頁時直接顯示該頁碼（避免出現「1 … 3」這種省略號比頁碼還佔位的情況）。
 */
export const pageWindow = (page: number, total: number, siblings = 1): PageToken[] => {
  const current = Math.min(Math.max(1, page), Math.max(1, total))
  const start = Math.max(2, current - siblings)
  const end = Math.min(total - 1, current + siblings)
  const tokens: PageToken[] = [1]
  if (start === 3) tokens.push(2)
  else if (start > 3) tokens.push('gap-start')
  for (let i = start; i <= end; i++) tokens.push(i)
  if (end === total - 2) tokens.push(total - 1)
  else if (end < total - 2) tokens.push('gap-end')
  if (total > 1) tokens.push(total)
  return tokens
}
