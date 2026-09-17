import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { CONTENT_SHEET, sheetCsvUrl } from '../src/config/content-sheet'
import { csvToRecords } from '../src/utils/csv'

/**
 * @fontsource 的 CSS 同時提供 woff2 與 woff；現代瀏覽器都支援 woff2，
 * 移除 woff 來源可讓打包出的字型檔數量減半。
 */
export function woff2Only(): Plugin {
  return {
    name: 'site:woff2-only',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('@fontsource') || !id.endsWith('.css')) return null
      return code.replace(/,\s*url\([^)]+\.woff\)\s*format\(['"]woff['"]\)/g, '')
    },
  }
}

const readIds = (file: string, field: string): number[] =>
  [...readFileSync(file, 'utf8').matchAll(new RegExp(`\\b${field}:\\s*(\\d+)`, 'g'))].map((m) =>
    Number(m[1]),
  )

/**
 * 產生 robots.txt 與 sitemap.xml。
 * sitemap 需要絕對網址，須設定 VITE_SITE_URL；未設定時只產生 robots.txt 並提示。
 * noindex 時 robots.txt 禁止所有爬蟲，也不產生 sitemap。
 */
/** 從內容試算表讀消息 ID（建置時）；讀不到回傳 null，改用內建資料 */
async function sheetNewsIds(key: string): Promise<number[] | null> {
  if (!key || key === 'off') return null
  try {
    const res = await fetch(sheetCsvUrl('news', key), { signal: AbortSignal.timeout(15000) })
    if (!res.ok) return null
    const ids = csvToRecords(await res.text())
      .filter((r) => !/^(n|no|否|0)$/i.test(r['顯示'] ?? ''))
      .map((r) => Number.parseInt(r['ID'] ?? '', 10))
      .filter(Number.isFinite)
    return ids.length ? [...new Set(ids)] : null
  } catch {
    return null
  }
}

export function sitemap(options: {
  siteUrl?: string
  root: string
  noindex?: boolean
  /** 內容試算表金鑰；未設定用預設值，off 停用 */
  sheetKey?: string
}): Plugin {
  const base = (options.siteUrl ?? '').replace(/\/+$/, '')
  return {
    name: 'site:sitemap',
    apply: 'build',
    async generateBundle() {
      const staticPaths = [
        '/',
        '/about',
        '/how',
        '/fee',
        '/units',
        '/download',
        '/news',
        '/farms',
        '/links',
        '/contact',
        '/privacy',
      ]
      const fromSheet = options.noindex
        ? null
        : await sheetNewsIds(options.sheetKey?.trim() || CONTENT_SHEET.defaultKey)
      if (!options.noindex && !fromSheet)
        this.warn('讀不到內容試算表，sitemap 的消息網址改用內建資料')
      const newsIds = fromSheet ?? readIds(`${options.root}/src/api/data/news.data.ts`, 'id')
      const unitIds = readIds(`${options.root}/src/api/data/units.data.ts`, 'cid')
      const paths = [
        ...staticPaths,
        ...unitIds.map((id) => `/units/${id}`),
        ...newsIds.map((id) => `/news/${id}`),
      ]

      if (options.noindex) {
        this.emitFile({
          type: 'asset',
          fileName: 'robots.txt',
          source: 'User-agent: *\nDisallow: /\n',
        })
        this.warn('目前設定為不讓搜尋引擎收錄（VITE_NOINDEX=true 或未設定 VITE_SITE_URL）')
        return
      }
      const robots = ['User-agent: *', 'Allow: /', 'Disallow: /login', 'Disallow: /admin']
      if (base) robots.push('', `Sitemap: ${base}/sitemap.xml`)
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` })

      if (!base) {
        this.warn('未設定 VITE_SITE_URL，略過 sitemap.xml（正式部署前請在 .env.production 設定）')
        return
      }
      const urls = paths.map((p) => `  <url><loc>${base}${p}</loc></url>`).join('\n')
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
    },
  }
}

/**
 * 不收錄時：index.html 加上 robots noindex，並輸出 Netlify 的 _headers（X-Robots-Tag），
 * 讓 PDF 等非 HTML 檔也不被收錄。其他主機會忽略 _headers。
 */
export function noindexOutput(noindex: boolean): Plugin {
  return {
    name: 'site:noindex',
    apply: 'build',
    transformIndexHtml() {
      return noindex
        ? [
            {
              tag: 'meta',
              attrs: { name: 'robots', content: 'noindex, nofollow' },
              injectTo: 'head',
            },
          ]
        : []
    },
    generateBundle() {
      if (!noindex) return
      this.emitFile({
        type: 'asset',
        fileName: '_headers',
        source: '/*\n  X-Robots-Tag: noindex, nofollow\n',
      })
    },
  }
}
