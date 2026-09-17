import axios, { AxiosError, type AxiosInstance } from 'axios'

/** 統一的 API 錯誤格式，元件層只需處理 message */
export class ApiError extends Error {
  readonly status?: number
  /** 前端可辨識的錯誤代碼，例如 MEMBER_UNAVAILABLE */
  readonly code?: string

  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

http.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string }>) => {
    const status = err.response?.status
    const message = err.response?.data?.message ?? err.message ?? '連線發生問題，請稍後再試。'
    return Promise.reject(new ApiError(message, status))
  },
)

/** 是否已設定後端；未設定時 api/modules 回傳內建靜態資料 */
export const hasBackend = (): boolean => Boolean(import.meta.env.VITE_API_BASE_URL)

/**
 * 以 Promise 包裝內建資料，模擬 API 呼叫。
 * 接後端時把 `fromStatic(data)` 換成 `http.get<T>(url).then((r) => r.data)` 即可，元件層不需變動。
 */
export const fromStatic = <T>(data: T): Promise<T> => Promise.resolve(structuredClone(data))
