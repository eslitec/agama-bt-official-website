import { describe, expect, it } from 'vitest'
import { createAdminMock, MOCK_ADMIN } from '@/api/admin-mock'
import { unwrap, type AdminRequestBody } from '@/api/modules/admin'
import { newsData } from '@/api/data/news.data'
import type { AdminNewsInput, AdminNewsItem } from '@/types/models'

const HOUR = 60 * 60 * 1000

function setup(options: Parameters<typeof createAdminMock>[0] = {}) {
  const mock = createAdminMock(options)
  const call = async <T>(body: AdminRequestBody): Promise<T> => unwrap<T>(await mock.handle(body))
  const token = async (): Promise<string> =>
    (await call<{ token: string }>({ action: 'login', ...MOCK_ADMIN })).token
  return { mock, call, token }
}

const input = (patch: Partial<AdminNewsInput> = {}): AdminNewsInput => ({
  date: '2026-09-17',
  src: '本公司',
  srcEn: '',
  no: '',
  title: '測試消息',
  titleEn: 'Test news',
  atts: [{ label: '公告連結', href: 'https://example.com/a.pdf' }],
  imgs: [],
  visible: true,
  ...patch,
})

describe('開發用模擬後台', () => {
  it('不需要初次設定，初次設定回傳 SETUP_DONE', async () => {
    const { call } = setup()
    expect(await call({ action: 'setupStatus' })).toEqual({ needsSetup: false })
    await expect(
      call({ action: 'setup', setupCode: 'X', username: 'abc', password: 'abc1234567' }),
    ).rejects.toMatchObject({ code: 'SETUP_DONE' })
  })

  it('登入成功回傳權杖；錯誤密碼 INVALID_CREDENTIALS，連錯 5 次鎖定', async () => {
    const { call } = setup()
    const session = await call<{ token: string; username: string; expiresAt: number }>({
      action: 'login',
      username: 'ADMIN',
      password: 'admin12345',
    })
    expect(session.username).toBe('admin')
    expect(session.expiresAt).toBeGreaterThan(Date.now())
    expect(await call({ action: 'me', token: session.token })).toEqual({
      username: 'admin',
      expiresAt: session.expiresAt,
    })

    for (let i = 0; i < 5; i++)
      await expect(
        call({ action: 'login', username: 'admin', password: 'nope' }),
      ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS', message: '帳號或密碼錯誤' })
    await expect(call({ action: 'login', ...MOCK_ADMIN })).rejects.toMatchObject({
      code: 'LOCKED',
    })
  })

  it('沒有權杖、權杖被竄改或逾時回傳 UNAUTHORIZED', async () => {
    let now = Date.now()
    const { call, token } = setup({ now: () => now })
    await expect(call({ action: 'listNews' })).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    const tok = await token()
    await expect(call({ action: 'listNews', token: `${tok}x` })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
    now += 9 * HOUR
    await expect(call({ action: 'listNews', token: tok })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: '登入已逾時，請重新登入',
    })
  })

  it('列表為內建資料，依日期新到舊', async () => {
    const { call, token } = setup()
    const { items } = await call<{ items: AdminNewsItem[] }>({
      action: 'listNews',
      token: await token(),
    })
    expect(items).toHaveLength(newsData.length)
    expect(items[0]).toMatchObject({ id: newsData[0]!.id, visible: true })
    expect(items.every((n) => Array.isArray(n.imgs) && typeof n.srcEn === 'string')).toBe(true)
  })

  it('新增的 ID 為最大值 + 1，並正規化日期', async () => {
    const { call, token } = setup()
    const tok = await token()
    const maxId = Math.max(...newsData.map((n) => n.id))
    const { item } = await call<{ item: AdminNewsItem }>({
      action: 'createNews',
      token: tok,
      item: input({ date: '2026/9/7' }),
    })
    expect(item.id).toBe(maxId + 1)
    expect(item.date).toBe('2026.09.07')
    const { item: second } = await call<{ item: AdminNewsItem }>({
      action: 'createNews',
      token: tok,
      item: input(),
    })
    expect(second.id).toBe(maxId + 2)
    const { items } = await call<{ items: AdminNewsItem[] }>({ action: 'listNews', token: tok })
    expect(items[0]!.id).toBe(maxId + 2)
  })

  it('修改、刪除；找不到時 NOT_FOUND', async () => {
    const { call, token } = setup()
    const tok = await token()
    const id = newsData[3]!.id
    const { item } = await call<{ item: AdminNewsItem }>({
      action: 'updateNews',
      token: tok,
      id,
      item: input({ title: '改過的標題', visible: false }),
    })
    expect(item).toMatchObject({ id, title: '改過的標題', visible: false })

    expect(await call({ action: 'deleteNews', token: tok, id })).toEqual({ id })
    const { items } = await call<{ items: AdminNewsItem[] }>({ action: 'listNews', token: tok })
    expect(items.some((n) => n.id === id)).toBe(false)

    await expect(call({ action: 'deleteNews', token: tok, id })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
    await expect(
      call({ action: 'updateNews', token: tok, id: 99999, item: input() }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('驗證規則與伺服器相同', async () => {
    const { call, token } = setup()
    const tok = await token()
    const create = (item: AdminNewsInput) => call({ action: 'createNews', token: tok, item })
    await expect(create(input({ date: '17/09/2026' }))).rejects.toMatchObject({
      code: 'VALIDATION',
      message: '日期格式需為 YYYY.MM.DD',
    })
    await expect(create(input({ title: '  ' }))).rejects.toMatchObject({
      code: 'VALIDATION',
      message: '請填寫標題',
    })
    await expect(
      create(input({ atts: [{ label: 'x', href: 'example.com' }] })),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(create(input({ imgs: ['https://a b'] }))).rejects.toMatchObject({
      code: 'VALIDATION',
    })
  })

  it('帳號管理：新增、不可刪除自己、刪除他人、修改密碼', async () => {
    const { call, token } = setup()
    const tok = await token()
    await expect(
      call({ action: 'addAdmin', token: tok, username: 'Bob', password: 'short1' }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
    await call({ action: 'addAdmin', token: tok, username: 'Bob', password: 'bobpass1234' })
    await expect(
      call({ action: 'addAdmin', token: tok, username: 'bob', password: 'bobpass1234' }),
    ).rejects.toMatchObject({ code: 'VALIDATION', message: '這個帳號已存在' })
    const { admins } = await call<{ admins: { username: string }[] }>({
      action: 'listAdmins',
      token: tok,
    })
    expect(admins.map((a) => a.username)).toEqual(['admin', 'bob'])

    await expect(
      call({ action: 'removeAdmin', token: tok, username: 'admin' }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
    await call({ action: 'removeAdmin', token: tok, username: 'bob' })
    await expect(
      call({ action: 'removeAdmin', token: tok, username: 'bob' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })

    await expect(
      call({
        action: 'changePassword',
        token: tok,
        currentPassword: 'x',
        newPassword: 'newpass12345',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
    await call({
      action: 'changePassword',
      token: tok,
      currentPassword: 'admin12345',
      newPassword: 'newpass12345',
    })
    await expect(call({ action: 'login', ...MOCK_ADMIN })).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    })
    await expect(
      call({ action: 'login', username: 'admin', password: 'newpass12345' }),
    ).resolves.toMatchObject({ username: 'admin' })
  })

  it('需要初次設定時以設定碼建立第一位管理者', async () => {
    const { call } = setup({ needsSetup: true, setupCode: 'ABCDEF123456' })
    expect(await call({ action: 'setupStatus' })).toEqual({ needsSetup: true })
    await expect(
      call({ action: 'setup', setupCode: 'WRONG', username: 'boss', password: 'boss123456' }),
    ).rejects.toMatchObject({ code: 'INVALID_SETUP_CODE' })
    const session = await call<{ username: string }>({
      action: 'setup',
      setupCode: 'abcdef123456',
      username: 'boss',
      password: 'boss123456',
    })
    expect(session.username).toBe('boss')
    expect(await call({ action: 'setupStatus' })).toEqual({ needsSetup: false })
  })

  it('不支援的操作回傳 BAD_REQUEST', async () => {
    const { call, token } = setup()
    await expect(call({ action: 'dropTable', token: await token() })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    })
  })
})
