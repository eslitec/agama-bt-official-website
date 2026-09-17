/** 單頁應用的頁面標題與 meta 更新（description、canonical、Open Graph） */

export const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/+$/, '')

/** 整站不收錄（與 vite.config.ts 的判斷一致） */
export const NOINDEX = import.meta.env.VITE_NOINDEX === 'true' || !SITE_URL

export interface PageMeta {
  title: string
  description: string
  /** 目前頁面路徑（含 query），用於 canonical 與 og:url */
  path: string
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

export function applyPageMeta({ title, description, path }: PageMeta): void {
  if (typeof document === 'undefined') return
  document.title = title
  upsertMeta('name', 'description', description)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:type', 'website')
  if (SITE_URL) {
    const url = `${SITE_URL}${path}`
    upsertMeta('property', 'og:url', url)
    upsertCanonical(url)
  }
}

/** 取文字前 n 個字作為描述 */
export const excerpt = (text: string, n = 110): string => {
  const s = text.replace(/\s+/g, ' ').trim()
  return s.length > n ? `${s.slice(0, n)}…` : s
}
