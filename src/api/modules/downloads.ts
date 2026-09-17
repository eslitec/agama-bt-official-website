import type { DownloadFile, DownloadGroup } from '@/types/models'
import { fromStatic, hasBackend, http } from '@/api/http'

const local = () => import('@/api/data/downloads.data')

export const fetchDownloadGroups = async (): Promise<DownloadGroup[]> =>
  hasBackend()
    ? http.get<DownloadGroup[]>('/downloads').then((r) => r.data)
    : fromStatic((await local()).downloadGroupsData)

export const fetchQuickFiles = async (): Promise<DownloadFile[]> =>
  hasBackend()
    ? http.get<DownloadFile[]>('/downloads/quick').then((r) => r.data)
    : fromStatic((await local()).quickFilesData)
