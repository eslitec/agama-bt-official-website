import { describe, expect, it } from 'vitest'
import { newsData } from '@/api/data/news.data'
import { downloadGroupsData, quickFilesData } from '@/api/data/downloads.data'
import { unitsData } from '@/api/data/units.data'
import { stepsData } from '@/api/data/steps.data'
import { linksData } from '@/api/data/links.data'
import { fetchNewsById, fetchNewsList, memberApi } from '@/api'
import { registerCategoriesData } from '@/api/data/register.data'

describe('內建資料（由設計稿抽出）', () => {
  it('筆數與設計稿一致', () => {
    expect(newsData).toHaveLength(155)
    expect(downloadGroupsData).toHaveLength(6)
    expect(unitsData).toHaveLength(6)
    expect(stepsData).toHaveLength(6)
    expect(linksData).toHaveLength(12)
    expect(quickFilesData).toHaveLength(4)
  })

  it('消息 id 不重複且依日期新到舊', () => {
    expect(new Set(newsData.map((n) => n.id)).size).toBe(newsData.length)
    const dates = newsData.map((n) => n.date)
    expect([...dates].sort().reverse()).toEqual(dates)
  })

  it('第 123 則公告附 4 頁圖片', () => {
    const n = newsData.find((x) => x.no === '123')
    expect(n?.imgs).toHaveLength(4)
    expect(n?.imgs?.[3]).toMatch(/_4\.jpg$/)
  })
})

describe('api modules（未設定後端時）', () => {
  it('回傳資料副本，修改不影響來源', async () => {
    const list = await fetchNewsList()
    list[0]!.title = 'changed'
    expect(newsData[0]!.title).not.toBe('changed')
  })

  it('依 id 取得單則消息', async () => {
    expect((await fetchNewsById(714))?.src).toBe('農業部漁業署')
    expect(await fetchNewsById(1)).toBeUndefined()
  })
})

describe('註冊類別', () => {
  it('送出值為中文，英文名稱有對照時才帶 labelEn', async () => {
    const list = await memberApi.fetchRegisterCategories()
    expect(list.map((c) => c.value)).toEqual(registerCategoriesData)
    expect(
      memberApi.toRegisterCategories(
        ['有機作物', { value: '產銷履歷農糧產品', labelEn: 'TAP' }, '其他'],
        {
          有機作物: 'Organic crops',
          其他: ' ',
        },
      ),
    ).toEqual([
      { value: '有機作物', labelEn: 'Organic crops' },
      { value: '產銷履歷農糧產品', labelEn: 'TAP' },
      { value: '其他' },
    ])
  })
})
