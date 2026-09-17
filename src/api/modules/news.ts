import type { NewsItem } from '@/types/models'
import { fromStatic, hasBackend, http } from '@/api/http'

// 內建資料以動態 import 載入，拆成獨立 chunk，不塞進首頁主程式
const localNews = async (): Promise<NewsItem[]> => (await import('@/api/data/news.data')).newsData

export const fetchNewsList = async (): Promise<NewsItem[]> =>
  hasBackend() ? http.get<NewsItem[]>('/news').then((r) => r.data) : fromStatic(await localNews())

export const fetchNewsById = async (id: number): Promise<NewsItem | undefined> => {
  if (hasBackend()) return http.get<NewsItem>(`/news/${id}`).then((r) => r.data)
  return fromStatic((await localNews()).find((n) => n.id === id))
}
