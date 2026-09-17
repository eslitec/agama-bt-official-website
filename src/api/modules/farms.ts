import type { Farm } from '@/types/models'
import { fromStatic, hasBackend, http } from '@/api/http'

export const fetchFarms = async (): Promise<Farm[]> =>
  hasBackend()
    ? http.get<Farm[]>('/farms').then((r) => r.data)
    : fromStatic((await import('@/api/data/farms.data')).farmsData)
