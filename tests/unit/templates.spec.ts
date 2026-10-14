import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * 模板裡不能寫 TypeScript 的型別轉換（`x as HTMLInputElement`）。
 * 開發模式用的是執行階段模板編譯器，看不懂 `as`，整個元件會編譯失敗、
 * 畫面只剩頁首頁尾，而且正式建置不會報錯（建置時先編譯好），很難發現。
 * 這個 bug 已經出現過兩次（AdminDownloadEditView、CertifiedOperators），所以用測試擋住。
 * 作法：把運算式搬到 <script setup> 的函式裡，模板只呼叫函式。
 */
const SRC = resolve(process.cwd(), 'src')

function vueFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return vueFiles(path)
    return path.endsWith('.vue') ? [path] : []
  })
}

const templateOf = (source: string): string => {
  const start = source.indexOf('<template')
  if (start < 0) return ''
  const end = source.lastIndexOf('</template>')
  return end > start ? source.slice(start, end) : source.slice(start)
}

describe('單一檔案元件的模板', () => {
  it('模板裡沒有 TypeScript 型別轉換（as X）', () => {
    const offenders = vueFiles(SRC).flatMap((path) => {
      const template = templateOf(readFileSync(path, 'utf8'))
      const hits = template.match(/\bas\s+(?:HTML|Element|Node|unknown|const\b)[A-Za-z]*/g)
      return hits ? [`${path.replace(SRC, 'src')}: ${hits.join(', ')}`] : []
    })
    expect(offenders).toEqual([])
  })
})
