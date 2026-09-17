/**
 * 原站（agama-bt.com.tw）上的文件、圖片與表單網址。
 * 檔案搬到新主機時，只要設定環境變數 VITE_LEGACY_SITE_URL（例如 https://files.example.com），
 * 所有下載連結會一起改到新網址，路徑維持 /ncku/... 不變。
 */
export const LEGACY_SITE_URL = (
  import.meta.env.VITE_LEGACY_SITE_URL || 'https://agama-bt.com.tw'
).replace(/\/+$/, '')

export const legacyUrl = (path: string): string =>
  `${LEGACY_SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
