import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { adminGuard, router } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { safeRedirect } from '@/utils/redirect'

const HOUR = 60 * 60 * 1000

describe('後台路由守衛（純函式）', () => {
  const admin = { meta: { requiresAdmin: true }, fullPath: '/admin/news?x=1', query: {} }
  const login = { meta: { guestOnly: true }, fullPath: '/login', query: {} }

  it('未登入進後台導向登入頁並帶 redirect', () => {
    expect(adminGuard(admin, false)).toEqual({
      name: 'login',
      query: { redirect: '/admin/news?x=1' },
    })
    expect(adminGuard(admin, true)).toBe(true)
  })

  it('已登入進登入頁導向後台（或安全的 redirect）', () => {
    expect(adminGuard(login, false)).toBe(true)
    expect(adminGuard(login, true)).toEqual({ name: 'adminNews' })
    expect(adminGuard({ ...login, query: { redirect: '/admin/account' } }, true)).toBe(
      '/admin/account',
    )
    expect(adminGuard({ ...login, query: { redirect: '//evil.example' } }, true)).toEqual({
      name: 'adminNews',
    })
  })

  it('safeRedirect 只接受站內路徑', () => {
    expect(safeRedirect('/admin/news')).toBe('/admin/news')
    expect(safeRedirect('https://evil.example')).toBeNull()
    expect(safeRedirect('//evil.example')).toBeNull()
    expect(safeRedirect(['/a'])).toBeNull()
  })
})

describe('路由表', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // jsdom 沒有實作 scrollTo（路由的 scrollBehavior 會呼叫）
    vi.stubGlobal('scrollTo', vi.fn())
    localStorage.clear()
    sessionStorage.clear()
  })
  afterEach(() => {
    useAuthStore().logout()
    vi.unstubAllGlobals()
  })

  it('/register 已移除（落到 404）；/admin 轉到 /admin/news', () => {
    expect(router.resolve('/register').name).toBe('notFound')
    expect(router.hasRoute('register')).toBe(false)
    const admin = router.resolve('/admin/news/12')
    expect(admin.name).toBe('adminNewsEdit')
    expect(admin.meta).toMatchObject({ requiresAdmin: true, noindex: true })
    expect(router.resolve('/admin/news/new').name).toBe('adminNewsNew')
    expect(router.resolve('/admin/account').meta.requiresAdmin).toBe(true)
    expect(router.resolve('/login').meta.noindex).toBe(true)
  })

  it('實際導覽：未登入被導向 /login，登入後可進入', async () => {
    await router.push('/admin/account')
    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/admin/account')

    useAuthStore().session = { username: 'admin', token: 't.s', expiresAt: Date.now() + HOUR }
    await router.push('/admin')
    expect(router.currentRoute.value.name).toBe('adminNews')
    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('adminNews')
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toMatch(
      /noindex/,
    )
  })
})
