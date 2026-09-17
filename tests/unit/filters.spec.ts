import { describe, expect, it } from 'vitest'
import { filterFarms, filterNews, filterUnits } from '@/utils/filters'
import { newsData } from '@/api/data/news.data'
import { unitsData } from '@/api/data/units.data'
import { farmsData } from '@/api/data/farms.data'

describe('filterNews', () => {
  it('空白關鍵字回傳全部', () => {
    expect(filterNews(newsData, '   ')).toHaveLength(newsData.length)
  })

  it('依標題關鍵字篩選', () => {
    const r = filterNews(newsData, '補助')
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((n) => n.title.includes('補助'))).toBe(true)
  })

  it('英文關鍵字不分大小寫', () => {
    expect(filterNews(newsData, 'esg').length).toBe(filterNews(newsData, 'ESG').length)
  })
})

describe('filterUnits', () => {
  it('比對類別名稱與說明', () => {
    expect(filterUnits(unitsData, '水產').map((u) => u.cid)).toEqual([7, 8])
    expect(filterUnits(unitsData, '販運').map((u) => u.cid)).toEqual([2])
  })
})

describe('filterFarms', () => {
  it('比對名稱、縣市與地址', () => {
    expect(filterFarms(farmsData, '臺南市')).toHaveLength(2)
    expect(filterFarms(farmsData, '番金路')).toHaveLength(1)
    expect(filterFarms(farmsData, '不存在')).toHaveLength(0)
  })
})
