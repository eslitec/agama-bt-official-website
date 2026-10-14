import { describe, expect, it } from 'vitest'
import { createAdminMock, MOCK_ADMIN } from '@/api/admin-mock'
import { unwrap, type AdminRequestBody } from '@/api/modules/admin'
import { groupAdminDownloads, matchesDownload } from '@/utils/admin-downloads'
import { toCareers } from '@/api/sheet-mappers'
import type { SheetRecord } from '@/api/sheet'
import type {
  AdminCareerInput,
  AdminCareerItem,
  AdminDownloadInput,
  AdminDownloadItem,
} from '@/types/models'

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

const career = (patch: Partial<AdminCareerInput> = {}): AdminCareerInput => ({
  kind: 'job',
  title: '驗證稽核員',
  titleEn: '',
  place: '臺南市歸仁區',
  nature: '全職',
  period: '長期徵才',
  body: '執行現場稽核。',
  bodyEn: '',
  href: 'mailto:caicbetter@gmail.com',
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

describe('後台人才發展', () => {
  it('新增、修改、刪除', async () => {
    const { call, token } = setup({ careers: [] })
    const t = await token()
    const { item } = await call<{ item: AdminCareerItem }>({
      action: 'createCareer',
      token: t,
      item: career(),
    })
    expect(item).toMatchObject({ id: 1, kind: 'job', title: '驗證稽核員' })
    const updated = await call<{ item: AdminCareerItem }>({
      action: 'updateCareer',
      token: t,
      id: item.id,
      item: career({ title: '驗證稽核員（有機）', visible: false }),
    })
    expect(updated.item).toMatchObject({ id: 1, title: '驗證稽核員（有機）', visible: false })
    await call({ action: 'deleteCareer', token: t, id: item.id })
    expect(await call<{ items: unknown[] }>({ action: 'listCareers', token: t })).toEqual({
      items: [],
    })
  })

  it('類型、標題、說明與連結格式會驗證', async () => {
    const { call, token } = setup({ careers: [] })
    const t = await token()
    for (const patch of [
      { kind: 'other' as never },
      { title: '  ' },
      { body: '' },
      { href: '成大智研.tw' },
    ]) {
      await expect(
        call({ action: 'createCareer', token: t, item: career(patch) }),
      ).rejects.toMatchObject({ code: 'VALIDATION' })
    }
  })

  it('上下移動只在同類型內交換', async () => {
    const { call, token } = setup({ careers: [] })
    const t = await token()
    for (const c of [
      career({ title: '職缺 A' }),
      career({ kind: 'training', title: '訓練 A' }),
      career({ title: '職缺 B' }),
    ]) {
      await call({ action: 'createCareer', token: t, item: c })
    }
    const { items } = await call<{ items: AdminCareerItem[] }>({
      action: 'moveCareer',
      token: t,
      id: 3,
      dir: 'up',
    })
    // 中間的「訓練 A」不受影響，兩個職缺對調
    expect(items.map((c) => c.title)).toEqual(['職缺 B', '訓練 A', '職缺 A'])
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

describe('人才發展工作表', () => {
  it('轉成職缺與教育訓練，顯示 N 與缺標題、說明的列略過', () => {
    const rows: SheetRecord[] = [
      {
        ID: '1',
        類型: '職缺',
        標題: '驗證稽核員',
        '標題（英文）': 'Auditor',
        地點: '臺南市歸仁區',
        性質: '全職',
        期間: '長期徵才',
        說明: '執行現場稽核。',
        '說明（英文）': '',
        連結: 'mailto:caicbetter@gmail.com',
        顯示: 'Y',
      },
      { ID: '2', 類型: '教育訓練', 標題: '年度教育訓練', 說明: '法規更新。', 顯示: '' },
      { ID: '3', 類型: '職缺', 標題: '下架職缺', 說明: '不應出現。', 顯示: 'N' },
      { ID: '4', 類型: '職缺', 標題: '', 說明: '沒有標題。', 顯示: 'Y' },
    ]
    expect(toCareers(rows)).toEqual([
      {
        id: 1,
        kind: 'job',
        title: '驗證稽核員',
        titleEn: 'Auditor',
        place: '臺南市歸仁區',
        nature: '全職',
        period: '長期徵才',
        body: '執行現場稽核。',
        href: 'mailto:caicbetter@gmail.com',
      },
      { id: 2, kind: 'training', title: '年度教育訓練', body: '法規更新。' },
    ])
  })
})
