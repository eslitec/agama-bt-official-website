import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePreferencesStore } from '@/stores/preferences'
import { i18n } from '@/i18n'

describe('auth store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('登入後取得示範會員，登出後清除', async () => {
    const auth = useAuthStore()
    expect(auth.isLoggedIn).toBe(false)
    await auth.login({ account: 'a', password: 'b', remember: false })
    expect(auth.isLoggedIn).toBe(true)
    expect(auth.user?.name).toBe('◯◯有機農場')
    await auth.logout()
    expect(auth.user).toBeNull()
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
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('未勾選存 sessionStorage，勾選存 localStorage，登出後清除', async () => {
    const { createApp } = await import('vue')
    const piniaPluginPersistedstate = (await import('pinia-plugin-persistedstate')).default
    const app = createApp({})
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)
    app.use(pinia)
    setActivePinia(pinia)

    const auth = useAuthStore()
    await auth.login({ account: '04595257', password: 'x', remember: false })
    await nextTick()
    expect(sessionStorage.getItem('auth')).toContain('◯◯有機農場')
    expect(localStorage.getItem('auth')).toBeNull()

    await auth.logout()
    await auth.login({ account: '04595257', password: 'x', remember: true })
    await nextTick()
    expect(localStorage.getItem('auth')).toContain('◯◯有機農場')
    expect(sessionStorage.getItem('auth')).toBeNull()

    await auth.logout()
    await nextTick()
    expect(localStorage.getItem('auth')).toBeNull()
  })
})
