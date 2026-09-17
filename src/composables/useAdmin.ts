import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { AdminApiError, USER_FACING_CODES } from '@/api/modules/admin'
import { useAuthStore } from '@/stores/auth'

type Translate = (key: string) => string

/**
 * 後台錯誤轉成畫面訊息：
 * 驗證、帳密錯誤、鎖定、找不到等顯示伺服器的中文訊息；網路問題與其他錯誤顯示語系檔的通用訊息。
 */
export function adminErrorMessage(e: unknown, t: Translate): string {
  if (e instanceof AdminApiError) {
    if (USER_FACING_CODES.includes(e.code) && e.message) return e.message
    if (e.code === 'UNAUTHORIZED') return t('login.expired')
    if (e.code === 'NOT_CONFIGURED') return t('login.notConfigured')
    if (e.code === 'NETWORK') return t('admin.errors.network')
  }
  return t('admin.errors.generic')
}

/* 跨頁提示（例如儲存後回到列表顯示「已新增」） */
const flash = ref('')
export const setAdminFlash = (message: string): void => {
  flash.value = message
}
export const takeAdminFlash = (): string => {
  const message = flash.value
  flash.value = ''
  return message
}

/**
 * 呼叫需要權杖的後台 API。權杖無效或逾時（UNAUTHORIZED）時清除登入狀態。
 */
export function useAdminRequest() {
  const auth = useAuthStore()
  const { t } = useI18n()

  // 清除登入狀態後，App.vue 會把停在後台頁面的使用者導向登入頁並提示「請重新登入」
  async function run<T>(call: (token: string) => Promise<T>): Promise<T> {
    if (!auth.checkExpiry()) throw new AdminApiError('UNAUTHORIZED', '')
    try {
      return await call(auth.token)
    } catch (e) {
      if (e instanceof AdminApiError && e.code === 'UNAUTHORIZED') auth.logout()
      throw e
    }
  }

  const messageOf = (e: unknown): string => adminErrorMessage(e, t)

  return { run, messageOf }
}
