import type { Farm } from '@/types/models'
import { fromStatic, hasBackend, http } from '@/api/http'
import { fromSheet } from '@/api/sheet'
import { toFarms } from '@/api/sheet-mappers'

export const fetchFarms = async (): Promise<Farm[]> =>
  hasBackend()
    ? http.get<Farm[]>('/farms').then((r) => r.data)
    : fromSheet('farms', toFarms, async () =>
        fromStatic((await import('@/api/data/farms.data')).farmsData),
      )
