import { computed, ref, watch } from 'vue'
import { defineStore, type StateTree } from 'pinia'
import type { AdminSession } from '@/types/models'
import { adminApi } from '@/api'

/**
 * 「記住此裝置」勾選時存 localStorage（關閉瀏覽器仍保持登入，直到權杖到期），
 * 未勾選時存 sessionStorage（關閉分頁即登出）。
 */
const rememberAwareStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key) ?? sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem(key: string, value: string): void {
    try {
      const state = JSON.parse(value) as StateTree
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
      if (!state.session) return
      ;(state.remember ? localStorage : sessionStorage).setItem(key, value)
    } catch {
      /* 無痕模式或儲存空間被封鎖時略過 */
    }
  },
}

/** setTimeout 的上限約 24.8 天 */
const MAX_TIMEOUT = 2 ** 31 - 1

const isSession = (v: unknown): v is AdminSession =>
  !!v &&
  typeof (v as AdminSession).token === 'string' &&
  typeof (v as AdminSession).username === 'string' &&
  typeof (v as AdminSession).expiresAt === 'number'

/** 管理者登入狀態 */
export const useAuthStore = defineStore(
  'auth',
  () => {
    const session = ref<AdminSession | null>(null)
    const remember = ref(false)
    /** 最後一次檢查的時間；權杖到期計時器觸發時更新 */
    const clock = ref(Date.now())

    const isLoggedIn = computed(
      () => isSession(session.value) && session.value.expiresAt > clock.value,
    )
    const username = computed(() => (isLoggedIn.value ? session.value!.username : ''))
    const token = computed(() => (isLoggedIn.value ? session.value!.token : ''))

    function setSession(next: AdminSession, rememberDevice: boolean): void {
      clock.value = Date.now()
      remember.value = rememberDevice
      session.value = { username: next.username, token: next.token, expiresAt: next.expiresAt }
    }

    function logout(): void {
      session.value = null
      remember.value = false
    }

    /** 重新以目前時間判斷是否登入中；已到期時清除登入狀態 */
    function checkExpiry(): boolean {
      clock.value = Date.now()
      if (session.value && !isLoggedIn.value) logout()
      return isLoggedIn.value
    }

    async function login(payload: {
      username: string
      password: string
      remember: boolean
    }): Promise<void> {
      const result = await adminApi.login({
        username: payload.username.trim(),
        password: payload.password,
      })
      setSession(result, payload.remember)
    }

    /** 初次設定第一位管理者，成功後直接登入 */
    async function setup(payload: {
      setupCode: string
      username: string
      password: string
      remember: boolean
    }): Promise<void> {
      const result = await adminApi.setup({
        setupCode: payload.setupCode.trim(),
        username: payload.username.trim(),
        password: payload.password,
      })
      setSession(result, payload.remember)
    }

    // 權杖到期時自動登出（重新整理後由持久化資料還原時也會重新排程）
    let timer: ReturnType<typeof setTimeout> | undefined
    function schedule(s: AdminSession | null): void {
      clearTimeout(timer)
      if (!s) return
      const ms = s.expiresAt - Date.now()
      if (ms <= 0) {
        checkExpiry()
        return
      }
      timer = setTimeout(
        () => {
          if (checkExpiry()) schedule(session.value)
        },
        Math.min(ms + 50, MAX_TIMEOUT),
      )
    }
    watch(session, schedule, { immediate: true })

    return {
      session,
      remember,
      isLoggedIn,
      username,
      token,
      login,
      setup,
      logout,
      checkExpiry,
    }
  },
  { persist: { pick: ['session', 'remember'], storage: rememberAwareStorage } },
)
