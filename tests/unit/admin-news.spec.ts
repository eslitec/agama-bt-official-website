import { describe, expect, it } from 'vitest'
import {
  cleanNewsInput,
  emptyNewsInput,
  filterAdminNews,
  normalizeNewsDate,
  sortAdminNews,
  toAdminNewsItem,
  toDateInputValue,
  todayNewsDate,
} from '@/utils/admin-news'
import { newsData } from '@/api/data/news.data'

describe('後台消息工具', () => {
  it('日期正規化與 date 輸入框轉換', () => {
    expect(normalizeNewsDate('2026-09-07')).toBe('2026.09.07')
    expect(normalizeNewsDate('2026/9/7')).toBe('2026.09.07')
    expect(normalizeNewsDate('2026.02.30')).toBeNull()
    expect(normalizeNewsDate('')).toBeNull()
    expect(toDateInputValue('2026.06.22')).toBe('2026-06-22')
    expect(toDateInputValue('abc')).toBe('')
    expect(todayNewsDate(new Date(2026, 0, 5))).toBe('2026.01.05')
    expect(emptyNewsInput(new Date(2026, 8, 17))).toMatchObject({
      date: '2026.09.17',
      visible: true,
    })
  })

  it('送出前去除空白並略過空白列', () => {
    expect(
      cleanNewsInput({
        date: '2026-09-17',
        src: ' 本公司 ',
        srcEn: '',
        no: ' 1 ',
        title: ' 標題 ',
        titleEn: '',
        atts: [
          { label: ' 公告 ', href: ' https://a ' },
          { label: '', href: '  ' },
        ],
        imgs: ['', ' https://img '],
        visible: false,
      }),
    ).toEqual({
      date: '2026.09.17',
      src: '本公司',
      srcEn: '',
      no: '1',
      title: '標題',
      titleEn: '',
      atts: [{ label: '公告', href: 'https://a' }],
      imgs: ['https://img'],
      visible: false,
    })
  })

  it('搜尋中英文標題、依顯示狀態篩選、排序', () => {
    const items = newsData.map(toAdminNewsItem)
    items[1]!.visible = false
    expect(filterAdminNews(items, '', 'hidden')).toEqual([items[1]])
    expect(filterAdminNews(items, '', 'visible')).toHaveLength(items.length - 1)
    const withEn = items.find((n) => n.titleEn)!
    expect(filterAdminNews(items, withEn.titleEn.toUpperCase())).toContain(withEn)
    expect(filterAdminNews(items, withEn.title.slice(0, 6))).toContain(withEn)
    const sorted = sortAdminNews([
      { ...items[0]!, id: 1, date: '2026.01.01' },
      { ...items[0]!, id: 3, date: '2026.01.02' },
      { ...items[0]!, id: 2, date: '2026.01.02' },
    ])
    expect(sorted.map((n) => n.id)).toEqual([3, 2, 1])
  })
})
