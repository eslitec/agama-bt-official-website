import { ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'

/**
 * 把輸入框文字同步到網址參數（例如 /news?q=補助），
 * 讓搜尋結果可以分享、重新整理後保留，並在關鍵字變更時清掉分頁參數。
 */
export function useQueryParam(key: string, resetKeys: string[] = ['page']): Ref<string> {
  const route = useRoute()
  const router = useRouter()
  const read = (): string => {
    const v = route.query[key]
    return (Array.isArray(v) ? v[0] : v) ?? ''
  }
  const value = ref(read())

  const write = useDebounceFn((v: string) => {
    const next = v.trim()
    if (next === read()) return
    const query = { ...route.query, [key]: next || undefined }
    resetKeys.forEach((k) => delete query[k])
    void router.replace({ query })
  }, 250)

  watch(value, (v) => void write(v))
  watch(
    () => route.query[key],
    () => {
      if (read() !== value.value.trim()) value.value = read()
    },
  )

  return value
}
