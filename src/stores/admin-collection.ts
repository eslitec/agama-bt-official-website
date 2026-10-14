import { ref, watch, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'

/**
 * 後台列表的暫存：列表 → 編輯 → 回列表時不必每次等待重新讀取。換帳號或登出時清空。
 * 順序由伺服器（試算表的列順序）決定，前端不另外排序。
 */
export function defineAdminCollection<T extends { id: number }>(storeId: string) {
  return defineStore(storeId, () => {
    // ref 對泛型會推成 UnwrapRef<T>[]，這裡的 T 都是純資料物件，直接標成 Ref<T[]>
    const items = ref([]) as Ref<T[]>
    const loaded = ref(false)

    function setAll(list: T[]): void {
      items.value = list
      loaded.value = true
    }

    /** 保留原本位置覆蓋；沒有的接在最後面 */
    function upsert(item: T): void {
      const i = items.value.findIndex((v) => v.id === item.id)
      if (i < 0) items.value = [...items.value, item]
      else items.value = items.value.map((v, n) => (n === i ? item : v))
    }

    function remove(id: number): void {
      items.value = items.value.filter((v) => v.id !== id)
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
}
