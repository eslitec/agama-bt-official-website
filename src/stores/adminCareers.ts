import type { AdminCareerItem } from '@/types/models'
import { defineAdminCollection } from '@/stores/admin-collection'

export const useAdminCareersStore = defineAdminCollection<AdminCareerItem>('adminCareers')
