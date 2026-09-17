import type {
  DownloadFile,
  DownloadGroup,
  Farm,
  FarmIconKey,
  FeeDoc,
  NewsAttachment,
  NewsItem,
} from '@/types/models'
import { driveFile } from '@/utils/drive'
import type { SheetRecord } from '@/api/sheet'

/** 「顯示」填 N（或 否、no）視為下架；空白或 Y 顯示 */
export const isShown = (r: SheetRecord): boolean => !/^(n|no|否|0)$/i.test(r['顯示'] ?? '')

const lines = (v = ''): string[] =>
  v
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)

/**
 * 檔案連結：雲端硬碟分享連結或檔案 ID 轉成直接下載網址，其他網址原樣使用。
 */
export function fileHref(link = ''): string {
  const v = link.trim()
  const m =
    v.match(/drive\.google\.com\/file\/d\/([\w-]{10,})/) ??
    v.match(/drive\.google\.com\/.*[?&]id=([\w-]{10,})/) ??
    v.match(/^([\w-]{25,})$/)
  return m ? driveFile(m[1]) : v
}

const ext = (format = '', name = ''): string =>
  (format.trim() || name.match(/\.(\w{2,5})$/)?.[1] || 'FILE').toUpperCase()

/**
 * 選填的英文欄位：有值時回傳 `{ [key]: 值 }`，空白時回傳 `{}`（不留 `key: undefined`），
 * 用法：`{ name, ...optional('nameEn', r['名稱（英文）']) }`。
 */
export function optional<K extends string>(key: K, value?: string): Partial<Record<K, string>> {
  const v = value?.trim()
  return v ? ({ [key]: v } as Record<K, string>) : {}
}

/** 附件名稱中英對照（以開頭比對，後面的日期等文字原樣保留，例如「報名連結 7/9」→「Registration 7/9」） */
const ATTACHMENT_LABELS_EN: [zh: string, en: string][] = [
  ['有機農業商品化資材網路公開品牌', 'Approved organic farming inputs (online brand list)'],
  ['公告連結', 'Announcement'],
  ['附件連結', 'Attachment'],
  ['報名連結', 'Registration'],
]

/** 附件名稱的英文；對照表沒有、或後面接的文字含中文時回傳 undefined（英文介面改顯示中文） */
export function attachmentLabelEn(label: string): string | undefined {
  const v = label.trim()
  for (const [zh, en] of ATTACHMENT_LABELS_EN) {
    if (!v.startsWith(zh)) continue
    const rest = v.slice(zh.length)
    if (/[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/.test(rest)) return undefined
    return `${en}${rest}`.trim()
  }
  return undefined
}

/** 日期統一成 YYYY.MM.DD（接受 2026/6/2、2026-06-02） */
export function normalizeDate(v = ''): string {
  const m = v.trim().match(/^(\d{4})\D(\d{1,2})\D(\d{1,2})$/)
  return m ? `${m[1]}.${m[2].padStart(2, '0')}.${m[3].padStart(2, '0')}` : v.trim()
}

/** 附件每行一個：「名稱 | 網址」；只有網址時名稱用「連結」 */
export function parseAttachments(v = ''): NewsAttachment[] {
  return lines(v).flatMap((line) => {
    const m = line.match(/^(.*?)[\s|｜]*(https?:\/\/\S+)$/)
    if (!m) return []
    const label = m[1].replace(/[|｜]\s*$/, '').trim() || '連結'
    return [{ label, ...optional('labelEn', attachmentLabelEn(label)), href: m[2] }]
  })
}

export function toNews(records: SheetRecord[]): NewsItem[] {
  const seen = new Set<number>()
  const items: NewsItem[] = []
  for (const r of records) {
    const id = Number.parseInt(r['ID'] ?? '', 10)
    const title = r['標題'] ?? ''
    if (!Number.isFinite(id) || !title || seen.has(id) || !isShown(r)) continue
    seen.add(id)
    const imgs = lines(r['圖片']).filter((u) => /^https?:\/\//.test(u))
    items.push({
      id,
      date: normalizeDate(r['日期']),
      src: r['來源機關'] ?? '',
      ...optional('srcEn', r['來源機關（英文）']),
      no: r['公告編號'] ?? '',
      title,
      ...optional('titleEn', r['標題（英文）']),
      atts: parseAttachments(r['附件']),
      ...(imgs.length ? { imgs } : {}),
    })
  }
  return items.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
}

const toFile = (r: SheetRecord): DownloadFile | null => {
  const name = r['檔名'] ?? ''
  const href = fileHref(r['檔案連結'])
  return name && href && isShown(r)
    ? { name, ...optional('nameEn', r['檔名（英文）']), ext: ext(r['格式'], name), href }
    : null
}

export function toDownloadGroups(records: SheetRecord[]): DownloadGroup[] {
  const groups = new Map<string, DownloadGroup>()
  // 分類英文名稱：同一分類編號中第一個有填的列（不必每列都填）
  const titlesEn = new Map<string, string>()
  for (const r of records) {
    const n = r['分類編號'] || '99'
    const titleEn = r['分類名稱（英文）']?.trim()
    if (titleEn && !titlesEn.has(n)) titlesEn.set(n, titleEn)
  }
  for (const r of records) {
    const file = toFile(r)
    if (!file) continue
    const n = r['分類編號'] || '99'
    const group = groups.get(n) ?? {
      n,
      title: r['分類名稱'] || '其他',
      ...optional('titleEn', titlesEn.get(n)),
      files: [],
    }
    group.files.push(file)
    groups.set(n, group)
  }
  return [...groups.values()].sort((a, b) => a.n.localeCompare(b.n, undefined, { numeric: true }))
}

export const toQuickFiles = (records: SheetRecord[]): DownloadFile[] =>
  records.map((r) => toFile(r)).filter((f): f is DownloadFile => f !== null)

export const toFeeDocs = (records: SheetRecord[]): FeeDoc[] =>
  records
    .filter((r) => r['名稱'] && r['檔案連結'] && isShown(r))
    .map((r) => ({
      name: r['名稱'],
      ...optional('nameEn', r['名稱（英文）']),
      href: fileHref(r['檔案連結']),
    }))

const FARM_ICONS: FarmIconKey[] = ['clam', 'rice', 'mango', 'sprout', 'wheat']

export const toFarms = (records: SheetRecord[]): Farm[] =>
  records
    .filter((r) => r['名稱'] && isShown(r))
    .map((r) => ({
      name: r['名稱'],
      ...optional('nameEn', r['名稱（英文）']),
      city: r['縣市'] ?? '',
      ...optional('cityEn', r['縣市（英文）']),
      addr: r['地址'] ?? '',
      ...optional('addrEn', r['地址（英文）']),
      tel: r['電話'] ?? '',
      fax: r['傳真'] ?? '',
      email: r['Email'] ?? '',
      site: r['網站'] ?? '',
      icon: (FARM_ICONS as string[]).includes(r['圖示']) ? (r['圖示'] as FarmIconKey) : 'sprout',
    }))
