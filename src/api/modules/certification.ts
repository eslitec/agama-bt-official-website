import type { FeeDoc, ProcessStep } from '@/types/models'
import { fromStatic, hasBackend, http } from '@/api/http'
import { fromSheet } from '@/api/sheet'
import { toFeeDocs } from '@/api/sheet-mappers'

export const fetchProcessSteps = async (): Promise<ProcessStep[]> =>
  hasBackend()
    ? http.get<ProcessStep[]>('/certification/steps').then((r) => r.data)
    : fromStatic((await import('@/api/data/steps.data')).stepsData)

export const fetchFeeDocs = async (): Promise<FeeDoc[]> =>
  hasBackend()
    ? http.get<FeeDoc[]>('/certification/fees').then((r) => r.data)
    : fromSheet('fees', toFeeDocs, async () =>
        fromStatic((await import('@/api/data/fees.data')).feesData),
      )
