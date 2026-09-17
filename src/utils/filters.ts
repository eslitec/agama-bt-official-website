import type { CertUnit, Farm, NewsItem } from '@/types/models'

const norm = (s: string): string => s.trim().toLowerCase()

export const filterNews = (list: NewsItem[], query: string): NewsItem[] => {
  const q = norm(query)
  return q ? list.filter((n) => n.title.toLowerCase().includes(q)) : list
}

export const filterUnits = (list: CertUnit[], query: string): CertUnit[] => {
  const q = norm(query)
  return q ? list.filter((u) => u.name.includes(q) || u.desc.includes(q)) : list
}

export const filterFarms = (list: Farm[], query: string): Farm[] => {
  const q = norm(query)
  return q
    ? list.filter((f) => f.name.includes(q) || f.city.includes(q) || f.addr.includes(q))
    : list
}
