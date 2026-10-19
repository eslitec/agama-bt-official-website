import { describe, expect, it } from 'vitest'
import { createAdminMock, MOCK_ADMIN } from '@/api/admin-mock'
import { unwrap, type AdminRequestBody } from '@/api/modules/admin'
import { groupAdminDownloads, matchesDownload } from '@/utils/admin-downloads'
import type { AdminDownloadInput, AdminDownloadItem } from '@/types/models'

function setup(options: Parameters<typeof createAdminMock>[0] = {}) {
  const mock = createAdminMock(options)
  const call = async <T>(body: AdminRequestBody): Promise<T> => unwrap<T>(await mock.handle(body))
  const token = async (): Promise<string> =>
    (await call<{ token: string }>({ action: 'login', ...MOCK_ADMIN })).token
  return { call, token }
}

const download = (patch: Partial<AdminDownloadInput> = {}): AdminDownloadInput => ({
  n: '01',
  group: '有機農產品驗證申請書',
  groupEn: 'Organic certification application forms',
  name: '測試文件 1.0',
  nameEn: 'Test document 1.0',
  ext: 'pdf',
  href: 'https://example.tw/a.pdf',
  visible: true,
  ...patch,
})

describe('後台資料下載', () => {
  it('新增後格式轉大寫，並排在同分類的最後一筆之後', async () => {
    const { call, token } = setup()
    const t = await token()
    const before = await call<{ items: { id: number; n: string }[] }>({
      action: 'listDownloads',
      token: t,
    })
    const { item } = await call<{ item: { id: number; ext: string } }>({
      action: 'createDownload',
      token: t,
      item: download(),
    })
    expect(item.ext).toBe('PDF')
    const after = await call<{ items: { id: number; n: string }[] }>({
      action: 'listDownloads',
      token: t,
    })
    expect(after.items.length).toBe(before.items.length + 1)
    const at = after.items.findIndex((d) => d.id === item.id)
    // 後面不會再有同分類的資料
    expect(after.items.slice(at + 1).some((d) => d.n === '01')).toBe(false)
  })

  it('分類編號與連結格式錯誤時回傳 VALIDATION', async () => {
    const { call, token } = setup()
    const t = await token()
    await expect(
      call({ action: 'createDownload', token: t, item: download({ n: '第一類' }) }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(
      call({ action: 'createDownload', token: t, item: download({ href: 'example.tw/a.pdf' }) }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('上下移動只在同分類內交換，已在最前面時回傳 VALIDATION', async () => {
    const { call, token } = setup()
    const t = await token()
    const { items } = await call<{ items: { id: number; n: string }[] }>({
      action: 'listDownloads',
      token: t,
    })
    const first = items[0]!
    const second = items.find((d) => d.n === first.n && d.id !== first.id)!
    const moved = await call<{ items: { id: number }[] }>({
      action: 'moveDownload',
      token: t,
      id: second.id,
      dir: 'up',
    })
    expect(moved.items[0]!.id).toBe(second.id)
    await expect(
      call({ action: 'moveDownload', token: t, id: second.id, dir: 'up' }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('改分類後整列搬到新分類最後面，分類不會被切成兩段', async () => {
    const { call, token } = setup()
    const t = await token()
    const before = await call<{ items: AdminDownloadItem[] }>({ action: 'listDownloads', token: t })
    const target = before.items.find((d) => d.n === '05')!
    await call({ action: 'updateDownload', token: t, id: target.id, item: { ...target, n: '01' } })
    const after = await call<{ items: AdminDownloadItem[] }>({ action: 'listDownloads', token: t })
    const seq = after.items.map((d) => d.n).filter((n, i, a) => n !== a[i - 1])
    expect(seq).toEqual([...new Set(seq)])
    const group = after.items.filter((d) => d.n === '01')
    expect(group[group.length - 1]!.id).toBe(target.id)
  })

  it('刪除後讀不到；再刪一次回傳 NOT_FOUND', async () => {
    const { call, token } = setup()
    const t = await token()
    const { item } = await call<{ item: { id: number } }>({
      action: 'createDownload',
      token: t,
      item: download(),
    })
    await call({ action: 'deleteDownload', token: t, id: item.id })
    const { items } = await call<{ items: { id: number }[] }>({
      action: 'listDownloads',
      token: t,
    })
    expect(items.some((d) => d.id === item.id)).toBe(false)
    await expect(call({ action: 'deleteDownload', token: t, id: item.id })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
  })
})

describe('資料下載列表工具', () => {
  const items = [
    {
      id: 1,
      n: '01',
      group: '申請書',
      groupEn: 'Forms',
      name: 'A 表',
      nameEn: 'Form A',
      ext: 'PDF',
      href: 'https://a.tw/a.pdf',
      visible: true,
    },
    {
      id: 2,
      n: '01',
      group: '申請書',
      groupEn: 'Forms',
      name: 'B 表',
      nameEn: 'Form B',
      ext: 'DOC',
      href: 'https://a.tw/b.doc',
      visible: false,
    },
    {
      id: 3,
      n: '05',
      group: '手冊',
      groupEn: 'Manuals',
      name: 'C 手冊',
      nameEn: '',
      ext: 'PDF',
      href: 'https://a.tw/c.pdf',
      visible: true,
    },
  ]

  it('依分類編號分組，順序維持原本的列順序', () => {
    expect(groupAdminDownloads(items).map((g) => [g.n, g.items.length])).toEqual([
      ['01', 2],
      ['05', 1],
    ])
  })

  it('關鍵字比對檔名、英文檔名、分類與格式', () => {
    expect(items.filter((i) => matchesDownload(i, 'form b')).map((i) => i.id)).toEqual([2])
    expect(items.filter((i) => matchesDownload(i, '手冊')).map((i) => i.id)).toEqual([3])
    expect(items.filter((i) => matchesDownload(i, 'doc')).map((i) => i.id)).toEqual([2])
    expect(items.filter((i) => matchesDownload(i, '  ')).length).toBe(3)
  })
})
