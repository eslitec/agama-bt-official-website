import { describe, expect, it } from 'vitest'
import { baseCompile } from '@intlify/message-compiler'
import zhTW from '@/i18n/locales/zh-TW'
import en from '@/i18n/locales/en'

type Tree = { [k: string]: unknown }

const keys = (obj: Tree, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? keys(v as Tree, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  )

describe('語系檔', () => {
  it('中英文 key 完全一致', () => {
    expect(keys(en as unknown as Tree).sort()).toEqual(keys(zhTW as unknown as Tree).sort())
  })
})

const strings = (value: unknown, path: string): [string, string][] => {
  if (typeof value === 'string') return [[path, value]]
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`))
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k))
  return []
}

describe('語系訊息語法', () => {
  // 「|」是 vue-i18n 的複數分隔、「@」是連結語法，未跳脫會在執行期編譯失敗
  it.each([
    ['zh-TW', zhTW],
    ['en', en],
  ])('%s 每則訊息都能編譯', (_, messages) => {
    const failed: string[] = []
    for (const [path, msg] of strings(messages, '')) {
      baseCompile(msg, { onError: () => failed.push(path) })
    }
    expect(failed).toEqual([])
  })
})
