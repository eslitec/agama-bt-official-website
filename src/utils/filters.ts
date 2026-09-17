import type { CertUnit, Farm, NewsItem } from '@/types/models'

const norm = (s: string): string => s.trim().toLowerCase()

/** 關鍵字比對中文與英文欄位（不分大小寫）；英文欄位可省略 */
const matches = (q: string, fields: (string | undefined)[]): boolean =>
  fields.some((v) => v?.toLowerCase().includes(q) ?? false)

const byQuery =
  <T>(fields: (item: T) => (string | undefined)[]) =>
  (list: T[], query: string): T[] => {
    const q = norm(query)
    return q ? list.filter((item) => matches(q, fields(item))) : list
  }

export const filterNews = byQuery<NewsItem>((n) => [n.title, n.titleEn])

export const filterUnits = byQuery<CertUnit>((u) => [u.name, u.nameEn, u.desc, u.descEn])

export const filterFarms = byQuery<Farm>((f) => [
  f.name,
  f.nameEn,
  f.city,
  f.cityEn,
  f.addr,
  f.addrEn,
])
