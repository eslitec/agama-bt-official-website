import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { AdminNewsItem } from '@/types/models'
import { useAuthStore } from '@/stores/auth'
import { sortAdminNews } from '@/utils/admin-news'

/**
 * 後台消息列表的暫存：列表 → 編輯 → 回列表時不必每次等待重新讀取。
 * 換帳號或登出時清空。
 */
export const useAdminNewsStore = defineStore('adminNews', () => {
  const items = ref<AdminNewsItem[]>([])
  const loaded = ref(false)

  function setAll(list: AdminNewsItem[]): void {
    items.value = sortAdminNews(list)
    loaded.value = true
  }

  function upsert(item: AdminNewsItem): void {
    items.value = sortAdminNews([...items.value.filter((n) => n.id !== item.id), item])
  }

  function remove(id: number): void {
    items.value = items.value.filter((n) => n.id !== id)
  }

  function reset(): void {
    items.value = []
    loaded.value = false
  }

  const auth = useAuthStore()
  watch(
    () => auth.username,
    () => reset(),
  )

  return { items, loaded, setAll, upsert, remove, reset }
})
