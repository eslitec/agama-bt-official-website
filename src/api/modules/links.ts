import type { RelatedLink } from '@/types/models'
import { fromStatic, hasBackend, http } from '@/api/http'

export const fetchLinks = async (): Promise<RelatedLink[]> =>
  hasBackend()
    ? http.get<RelatedLink[]>('/links').then((r) => r.data)
    : fromStatic((await import('@/api/data/links.data')).linksData)
