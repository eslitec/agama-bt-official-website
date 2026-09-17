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
    return [{ label: m[1].replace(/[|｜]\s*$/, '').trim() || '連結', href: m[2] }]
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
      no: r['公告編號'] ?? '',
      title,
      atts: parseAttachments(r['附件']),
      ...(imgs.length ? { imgs } : {}),
    })
  }
  return items.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
}

const toFile = (r: SheetRecord, nameKey: string): DownloadFile | null => {
  const name = r[nameKey] ?? ''
  const href = fileHref(r['檔案連結'])
  return name && href && isShown(r) ? { name, ext: ext(r['格式'], name), href } : null
}

export function toDownloadGroups(records: SheetRecord[]): DownloadGroup[] {
  const groups = new Map<string, DownloadGroup>()
  for (const r of records) {
    const file = toFile(r, '檔名')
    if (!file) continue
    const n = r['分類編號'] || '99'
    const group = groups.get(n) ?? { n, title: r['分類名稱'] || '其他', files: [] }
    group.files.push(file)
    groups.set(n, group)
  }
  return [...groups.values()].sort((a, b) => a.n.localeCompare(b.n, undefined, { numeric: true }))
}

export const toQuickFiles = (records: SheetRecord[]): DownloadFile[] =>
  records.map((r) => toFile(r, '檔名')).filter((f): f is DownloadFile => f !== null)

export const toFeeDocs = (records: SheetRecord[]): FeeDoc[] =>
  records
    .filter((r) => r['名稱'] && r['檔案連結'] && isShown(r))
    .map((r) => ({ name: r['名稱'], href: fileHref(r['檔案連結']) }))

const FARM_ICONS: FarmIconKey[] = ['clam', 'rice', 'mango', 'sprout', 'wheat']

export const toFarms = (records: SheetRecord[]): Farm[] =>
  records
    .filter((r) => r['名稱'] && isShown(r))
    .map((r) => ({
      name: r['名稱'],
      city: r['縣市'] ?? '',
      addr: r['地址'] ?? '',
      tel: r['電話'] ?? '',
      fax: r['傳真'] ?? '',
      email: r['Email'] ?? '',
      site: r['網站'] ?? '',
      icon: (FARM_ICONS as string[]).includes(r['圖示']) ? (r['圖示'] as FarmIconKey) : 'sprout',
    }))
