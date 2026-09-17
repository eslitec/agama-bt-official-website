import { describe, expect, it } from 'vitest'
import type { CertUnit, Farm, NewsItem } from '@/types/models'
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

describe('英文欄位', () => {
  const news: NewsItem[] = [
    {
      id: 1,
      date: '2026.01.01',
      src: '',
      no: '',
      title: '補助公告',
      titleEn: 'Subsidy Notice',
      atts: [],
    },
    { id: 2, date: '2026.01.02', src: '', no: '', title: '講習會', atts: [] },
  ]

  it('消息同時比對中英文標題，英文不分大小寫', () => {
    expect(filterNews(news, 'SUBSIDY').map((n) => n.id)).toEqual([1])
    expect(filterNews(news, 'notice').map((n) => n.id)).toEqual([1])
    expect(filterNews(news, '講習').map((n) => n.id)).toEqual([2])
    expect(filterNews(news, '補助').map((n) => n.id)).toEqual([1])
  })

  it('類別比對英文名稱與說明', () => {
    const units: CertUnit[] = [
      { ...unitsData[0]!, cid: 1, nameEn: 'Organic Crops', descEn: 'Fields and crops' },
      { ...unitsData[1]!, cid: 2, nameEn: undefined, descEn: undefined },
    ]
    expect(filterUnits(units, 'organic').map((u) => u.cid)).toEqual([1])
    expect(filterUnits(units, 'FIELDS').map((u) => u.cid)).toEqual([1])
  })

  it('農場比對英文名稱、縣市與地址', () => {
    const farms: Farm[] = [
      {
        ...farmsData[0]!,
        nameEn: 'Qigu Clam Group',
        cityEn: 'Tainan City',
        addrEn: 'No. 30, Haipu',
      },
      { ...farmsData[1]! },
    ]
    expect(filterFarms(farms, 'clam')).toHaveLength(1)
    expect(filterFarms(farms, 'tainan')).toHaveLength(1)
    expect(filterFarms(farms, 'HAIPU')).toHaveLength(1)
    expect(filterFarms(farms, '花蓮')).toHaveLength(1)
  })
})
