import type { AdminDownloadItem } from '@/types/models'
import { defineAdminCollection } from '@/stores/admin-collection'

export const useAdminDownloadsStore = defineAdminCollection<AdminDownloadItem>('adminDownloads')
