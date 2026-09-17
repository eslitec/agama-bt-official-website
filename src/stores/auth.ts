import { computed, ref } from 'vue'
import { defineStore, type StateTree } from 'pinia'
import type { LoginPayload, MemberUser } from '@/types/models'
import { memberApi } from '@/api'

/**
 * 「記住此裝置」勾選時存 localStorage（關閉瀏覽器仍保持登入），
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
      if (!state.user) return
      ;(state.remember ? localStorage : sessionStorage).setItem(key, value)
    } catch {
      /* 無痕模式或儲存空間被封鎖時略過 */
    }
  },
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<MemberUser | null>(null)
    const remember = ref(false)
    const isLoggedIn = computed(() => user.value !== null)

    async function login(payload: LoginPayload): Promise<void> {
      const result = await memberApi.login(payload)
      remember.value = payload.remember
      user.value = result
    }

    async function logout(): Promise<void> {
      await memberApi.logout()
      user.value = null
      remember.value = false
    }

    return { user, remember, isLoggedIn, login, logout }
  },
  { persist: { pick: ['user', 'remember'], storage: rememberAwareStorage } },
)
