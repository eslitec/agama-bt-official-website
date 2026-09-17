import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useAuthStore } from '@/stores/auth'
import { usePreferencesStore } from '@/stores/preferences'
import { i18n } from '@/i18n'

const API = 'https://script.google.com/macros/s/test/exec'
const HOUR = 60 * 60 * 1000

/** 模擬後台 login：回傳 expiresAt = 現在 + ttl */
function stubLogin(ttl = 8 * HOUR) {
  const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body))
    return new Response(
      JSON.stringify({
        ok: true,
        data: { token: 'tok.sig', username: body.username, expiresAt: Date.now() + ttl },
      }),
    )
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function persistedPinia() {
  const app = createApp({})
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
  setActivePinia(pinia)
  return pinia
}

beforeEach(() => {
  vi.stubEnv('VITE_ADMIN_API_URL', API)
  localStorage.clear()
  sessionStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('auth store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('登入後保存帳號與權杖，登出後清除', async () => {
    stubLogin()
    const auth = useAuthStore()
    expect(auth.isLoggedIn).toBe(false)
    await auth.login({ username: ' admin ', password: 'admin12345', remember: false })
    expect(auth.isLoggedIn).toBe(true)
    expect(auth.username).toBe('admin')
    expect(auth.token).toBe('tok.sig')
    auth.logout()
    expect(auth.session).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
    expect(auth.token).toBe('')
  })

  it('權杖到期時自動登出', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-17T08:00:00Z'))
    stubLogin(HOUR)
    const auth = useAuthStore()
    await auth.login({ username: 'admin', password: 'admin12345', remember: false })
    expect(auth.checkExpiry()).toBe(true)

    vi.advanceTimersByTime(HOUR - 1000)
    expect(auth.isLoggedIn).toBe(true)
    vi.advanceTimersByTime(2000)
    expect(auth.isLoggedIn).toBe(false)
    expect(auth.session).toBeNull()
  })

  it('checkExpiry 以目前時間判斷（計時器尚未觸發時也有效）', async () => {
    stubLogin(HOUR)
    const auth = useAuthStore()
    await auth.login({ username: 'admin', password: 'admin12345', remember: false })
    const now = Date.now()
    const spy = vi.spyOn(Date, 'now').mockReturnValue(now + 2 * HOUR)
    expect(auth.checkExpiry()).toBe(false)
    expect(auth.session).toBeNull()
    spy.mockRestore()
  })

  it('登入失敗時維持未登入', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              ok: false,
              error: { code: 'INVALID_CREDENTIALS', message: '帳號或密碼錯誤' },
            }),
          ),
      ),
    )
    const auth = useAuthStore()
    await expect(
      auth.login({ username: 'admin', password: 'wrong', remember: true }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
    expect(auth.isLoggedIn).toBe(false)
  })
})

describe('preferences store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('切換語系同步 vue-i18n 與 <html lang>', async () => {
    const prefs = usePreferencesStore()
    prefs.setLocale('en')
    await nextTick()
    expect(i18n.global.locale.value).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    prefs.setLocale('zh-TW')
    await nextTick()
    expect(document.documentElement.lang).toBe('zh-Hant-TW')
  })
})

describe('auth 記住此裝置', () => {
  it('未勾選存 sessionStorage，勾選存 localStorage，登出後清除', async () => {
    stubLogin()
    persistedPinia()
    const auth = useAuthStore()
    await auth.login({ username: 'admin', password: 'admin12345', remember: false })
    await nextTick()
    expect(sessionStorage.getItem('auth')).toContain('tok.sig')
    expect(localStorage.getItem('auth')).toBeNull()

    auth.logout()
    await auth.login({ username: 'admin', password: 'admin12345', remember: true })
    await nextTick()
    expect(localStorage.getItem('auth')).toContain('tok.sig')
    expect(sessionStorage.getItem('auth')).toBeNull()

    auth.logout()
    await nextTick()
    expect(localStorage.getItem('auth')).toBeNull()
    expect(sessionStorage.getItem('auth')).toBeNull()
  })

  it('重新開啟時還原未到期的登入；已到期的登入會被清除', async () => {
    const saved = (expiresAt: number) =>
      JSON.stringify({ session: { username: 'admin', token: 't.s', expiresAt }, remember: true })

    localStorage.setItem('auth', saved(Date.now() + HOUR))
    persistedPinia()
    expect(useAuthStore().isLoggedIn).toBe(true)
    expect(useAuthStore().username).toBe('admin')

    localStorage.setItem('auth', saved(Date.now() - 1000))
    persistedPinia()
    const auth = useAuthStore()
    expect(auth.checkExpiry()).toBe(false)
    await nextTick()
    expect(localStorage.getItem('auth')).toBeNull()
  })
})
