import type { CertUnit } from '@/types/models'
import { fromStatic, hasBackend, http } from '@/api/http'

export const fetchUnits = async (): Promise<CertUnit[]> =>
  hasBackend()
    ? http.get<CertUnit[]>('/units').then((r) => r.data)
    : fromStatic((await import('@/api/data/units.data')).unitsData)
