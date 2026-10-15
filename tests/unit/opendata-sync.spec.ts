import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * opendata-sync.gs 是貼到 Apps Script 執行的，沒有打包流程會檢查它。
 * 這裡把純函式抽出來跑，至少擋住「品項被硬切成半截字」這種會直接出現在名單頁上的回歸。
 */
const source = readFileSync(resolve(process.cwd(), 'apps-script/opendata-sync.gs'), 'utf8')

const pick = (name: string): string => {
  const at = source.indexOf(`function ${name}(`)
  expect(at, `找不到 ${name}`).toBeGreaterThan(-1)
  const end = source.indexOf('\n}\n', at)
  return source.slice(at, end + 3)
}

const clipList = new Function(`${pick('clipList')}; return clipList`)() as (
  text: string,
  max: number,
) => string
const tapProducts = new Function(`${pick('tapProducts')}; return tapProducts`)() as (
  products: Record<string, true>,
) => string

describe('clipList（品項太長時的截短）', () => {
  it('沒超過長度就原樣回傳', () => {
    expect(clipList('梨果（梅）', 200)).toBe('梨果（梅）')
  })

  it('截到最後一個完整品項，不會停在品項中間', () => {
    const text =
      '自產農產加工品（' + Array.from({ length: 60 }, (_, i) => `品項${i}`).join('、') + '）'
    const out = clipList(text, 200)
    expect(out.endsWith('…）')).toBe(true)
    // 「、品項12…」而不是「、品項1」這種被切一半的字
    expect(/品項\d+…）$/.test(out)).toBe(true)
  })

  it('左括號被切掉時補回右括號，括號數量成對', () => {
    const text = 'A（' + 'あ、'.repeat(200) + '）'
    const out = clipList(text, 200)
    expect((out.match(/（/g) ?? []).length).toBe((out.match(/）/g) ?? []).length)
  })

  it('整串沒有頓號時仍然加上省略號', () => {
    expect(clipList('あ'.repeat(250), 200).endsWith('…')).toBe(true)
  })
})

describe('tapProducts（產銷履歷品項只列前 8 個）', () => {
  it('8 個以內不加省略號', () => {
    const products = Object.fromEntries(['米', '茶'].map((k) => [k, true as const]))
    expect(tapProducts(products)).toBe('米、茶')
  })

  it('超過 8 個時結尾加上省略號，讓人知道還有別的', () => {
    const products = Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [`品項${i}`, true as const]),
    )
    const out = tapProducts(products)
    expect(out.split('、').length).toBe(8)
    expect(out.endsWith('…')).toBe(true)
  })
})
