import type { AdminDownloadItem } from '@/types/models'

/** 關鍵字比對：檔名、英文檔名、分類、格式、連結 */
export function matchesDownload(item: AdminDownloadItem, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [item.name, item.nameEn, item.group, item.groupEn, item.ext, item.href, item.n]
    .join(' ')
    .toLowerCase()
    .includes(q)
}

export interface AdminDownloadGroup {
  n: string
  title: string
  items: AdminDownloadItem[]
}

/** 依分類編號分組；分組與組內順序都沿用試算表的列順序 */
export function groupAdminDownloads(items: AdminDownloadItem[]): AdminDownloadGroup[] {
  const groups = new Map<string, AdminDownloadGroup>()
  for (const item of items) {
    const group = groups.get(item.n) ?? { n: item.n, title: item.group, items: [] }
    group.items.push(item)
    groups.set(item.n, group)
  }
  return [...groups.values()]
}
