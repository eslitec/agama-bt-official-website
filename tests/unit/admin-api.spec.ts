import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { adminApi } from '@/api'
import { AdminApiError } from '@/api/modules/admin'
import { adminErrorMessage } from '@/composables/useAdmin'
import { i18n } from '@/i18n'

const API = 'https://script.google.com/macros/s/abc/exec'

const reply = (payload: unknown) => vi.fn(async () => new Response(JSON.stringify(payload)))

beforeEach(() => vi.stubEnv('VITE_ADMIN_API_URL', API))
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('adminApi 請求格式', () => {
  it('POST text/plain、body 帶 action 與 token，不送 cookie', async () => {
    const fetchMock = reply({ ok: true, data: { items: [] } })
    vi.stubGlobal('fetch', fetchMock)
    await expect(adminApi.listNews('tok.sig')).resolves.toEqual({ items: [] })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(API)
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({ 'Content-Type': 'text/plain;charset=utf-8' })
    expect(init.redirect).toBe('follow')
    expect(init.credentials).toBe('omit')
    expect(JSON.parse(String(init.body))).toEqual({ action: 'listNews', token: 'tok.sig' })
  })

  it('各操作的參數', async () => {
    const fetchMock = reply({ ok: true, data: {} })
    vi.stubGlobal('fetch', fetchMock)
    const item = {
      date: '2026.09.17',
      src: '',
      srcEn: '',
      no: '',
      title: '標題',
      titleEn: '',
      atts: [{ label: '公告連結', href: 'https://example.com' }],
      imgs: [],
      visible: true,
    }
    await adminApi.setupStatus()
    await adminApi.setup({ setupCode: 'ABC', username: 'admin', password: 'admin12345' })
    await adminApi.login({ username: 'admin', password: 'admin12345' })
    await adminApi.me('t')
    await adminApi.createNews('t', item)
    await adminApi.updateNews('t', 7, item)
    await adminApi.deleteNews('t', 7)
    await adminApi.changePassword('t', 'old', 'new')
    await adminApi.listAdmins('t')
    await adminApi.addAdmin('t', 'bob', 'pw')
    await adminApi.removeAdmin('t', 'bob')

    const bodies = fetchMock.mock.calls.map((c) =>
      JSON.parse(String((c as unknown as [string, RequestInit])[1].body)),
    )
    expect(bodies).toEqual([
      { action: 'setupStatus' },
      { action: 'setup', setupCode: 'ABC', username: 'admin', password: 'admin12345' },
      { action: 'login', username: 'admin', password: 'admin12345' },
      { action: 'me', token: 't' },
      { action: 'createNews', token: 't', item },
      { action: 'updateNews', token: 't', id: 7, item },
      { action: 'deleteNews', token: 't', id: 7 },
      { action: 'changePassword', token: 't', currentPassword: 'old', newPassword: 'new' },
      { action: 'listAdmins', token: 't' },
      { action: 'addAdmin', token: 't', username: 'bob', password: 'pw' },
      { action: 'removeAdmin', token: 't', username: 'bob' },
    ])
    expect(bodies[4].item.id).toBeUndefined()
  })
})

describe('adminApi 回應處理', () => {
  it('ok: false 轉成 AdminApiError（保留代碼與伺服器訊息）', async () => {
    vi.stubGlobal(
      'fetch',
      reply({ ok: false, error: { code: 'LOCKED', message: '請 15 分鐘後再試' } }),
    )
    const err = await adminApi.login({ username: 'a', password: 'b' }).catch((e) => e)
    expect(err).toBeInstanceOf(AdminApiError)
    expect(err.code).toBe('LOCKED')
    expect(err.message).toBe('請 15 分鐘後再試')
  })

  it('網路錯誤轉成 NETWORK', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )
    await expect(adminApi.me('t')).rejects.toMatchObject({ code: 'NETWORK' })
  })

  it('不是 JSON（例如 Google 登入頁）轉成 SERVER', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<html>Sign in</html>')),
    )
    await expect(adminApi.me('t')).rejects.toMatchObject({ code: 'SERVER' })
  })

  it('格式不符的 JSON 轉成 SERVER', async () => {
    vi.stubGlobal('fetch', reply({ hello: 'world' }))
    await expect(adminApi.me('t')).rejects.toMatchObject({ code: 'SERVER' })
  })

  it('設定狀態判斷', () => {
    expect(adminApi.isAdminApiConfigured()).toBe(true)
    expect(adminApi.isAdminMock()).toBe(false)
    vi.stubEnv('VITE_ADMIN_API_URL', '')
    expect(adminApi.isAdminApiConfigured()).toBe(false)
    // 測試環境屬於開發模式：未設定網址時使用模擬後台
    expect(adminApi.isAdminMock()).toBe(import.meta.env.DEV)
  })
})

describe('錯誤訊息', () => {
  const t = (key: string) => i18n.global.t(key)

  it('驗證、帳密等顯示伺服器訊息；其他顯示語系檔訊息', () => {
    expect(adminErrorMessage(new AdminApiError('VALIDATION', '請填寫標題'), t)).toBe('請填寫標題')
    expect(adminErrorMessage(new AdminApiError('NOT_FOUND', '找不到'), t)).toBe('找不到')
    expect(adminErrorMessage(new AdminApiError('NETWORK', 'x'), t)).toBe(t('admin.errors.network'))
    expect(adminErrorMessage(new AdminApiError('SERVER', 'stack trace'), t)).toBe(
      t('admin.errors.generic'),
    )
    expect(adminErrorMessage(new AdminApiError('UNAUTHORIZED', ''), t)).toBe(t('login.expired'))
    expect(adminErrorMessage(new Error('boom'), t)).toBe(t('admin.errors.generic'))
  })
})
