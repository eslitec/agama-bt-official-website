import { onMounted, ref, shallowRef, type Ref } from 'vue'

export interface AsyncData<T> {
  data: Ref<T>
  loading: Ref<boolean>
  error: Ref<Error | null>
  reload: () => Promise<void>
}

/** 取用 api/modules 的非同步資料，並提供 loading / error 狀態 */
export function useAsyncData<T>(fetcher: () => Promise<T>, initial: T): AsyncData<T> {
  const data = shallowRef(initial) as Ref<T>
  const loading = ref(true)
  const error = ref<Error | null>(null)

  async function reload(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      data.value = await fetcher()
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
    } finally {
      loading.value = false
    }
  }

  onMounted(reload)

  return { data, loading, error, reload }
}
