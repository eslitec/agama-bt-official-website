import type { LoginPayload, MemberUser, RegisterPayload } from '@/types/models'
import { ApiError, fromStatic, hasBackend, http } from '@/api/http'

/**
 * 尚未接後端時，是否開放示範登入／註冊。
 * 開發環境（npm run dev）一律開放；正式環境需明確設定 VITE_DEMO_MEMBER=true，
 * 否則會回傳「會員系統尚未開放」，避免訪客以為真的登入或送出了資料。
 */
export const isDemoMember = (): boolean =>
  !hasBackend() && (import.meta.env.DEV || import.meta.env.VITE_DEMO_MEMBER === 'true')

const unavailable = (): Promise<never> =>
  Promise.reject(new ApiError('Member service is not available', 503, 'MEMBER_UNAVAILABLE'))

export const fetchRegisterCategories = async (): Promise<string[]> =>
  hasBackend()
    ? http.get<string[]>('/member/register-categories').then((r) => r.data)
    : fromStatic((await import('@/api/data/register.data')).registerCategoriesData)

export const login = (payload: LoginPayload): Promise<MemberUser> => {
  if (hasBackend()) return http.post<MemberUser>('/member/login', payload).then((r) => r.data)
  if (!isDemoMember()) return unavailable()
  return fromStatic({ name: '◯◯有機農場', status: '有機作物　驗證中' })
}

export const logout = (): Promise<void> =>
  hasBackend() ? http.post('/member/logout').then(() => undefined) : Promise.resolve()

export const register = (payload: RegisterPayload): Promise<{ ok: true }> => {
  if (hasBackend()) return http.post<{ ok: true }>('/member/register', payload).then((r) => r.data)
  if (!isDemoMember()) return unavailable()
  return fromStatic({ ok: true as const })
}
