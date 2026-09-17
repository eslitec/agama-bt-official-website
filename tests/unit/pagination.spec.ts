import { describe, expect, it } from 'vitest'
import { pageWindow, paginate, parsePage } from '@/utils/pagination'

const list = Array.from({ length: 155 }, (_, i) => i + 1)

describe('paginate', () => {
  it('依每頁筆數切出資料並計算總頁數', () => {
    const r = paginate(list, 1, 15)
    expect(r.items).toHaveLength(15)
    expect(r.total).toBe(11)
    expect(r.items[0]).toBe(1)
  })

  it('最後一頁只含剩餘筆數', () => {
    const r = paginate(list, 11, 15)
    expect(r.items).toEqual([151, 152, 153, 154, 155])
  })

  it('頁碼超出範圍時夾回邊界', () => {
    expect(paginate(list, 99, 15).page).toBe(11)
    expect(paginate(list, -3, 15).page).toBe(1)
    expect(paginate(list, Number.NaN, 15).page).toBe(1)
  })

  it('空清單仍回傳 1 頁', () => {
    expect(paginate([], 1, 15)).toEqual({ items: [], page: 1, total: 1 })
  })
})

describe('parsePage', () => {
  it.each([
    ['3', 3],
    [['4', '5'], 4],
    ['abc', 1],
    ['0', 1],
    [undefined, 1],
  ])('parsePage(%j) → %i', (raw, expected) => {
    expect(parsePage(raw)).toBe(expected)
  })
})

describe('pageWindow', () => {
  it('頁數少時全部列出', () => {
    expect(pageWindow(1, 1)).toEqual([1])
    expect(pageWindow(2, 4, 1)).toEqual([1, 2, 3, 4])
  })

  it('中間頁前後加省略號', () => {
    expect(pageWindow(6, 11, 1)).toEqual([1, 'gap-start', 5, 6, 7, 'gap-end', 11])
    expect(pageWindow(6, 11, 0)).toEqual([1, 'gap-start', 6, 'gap-end', 11])
  })

  it('只差一頁時顯示頁碼而非省略號', () => {
    expect(pageWindow(4, 11, 1)).toEqual([1, 2, 3, 4, 5, 'gap-end', 11])
    expect(pageWindow(1, 11, 1)).toEqual([1, 2, 'gap-end', 11])
    expect(pageWindow(11, 11, 1)).toEqual([1, 'gap-start', 10, 11])
  })
})
