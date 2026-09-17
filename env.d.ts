/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 後端 API 根路徑；未設定時使用內建靜態資料 */
  readonly VITE_API_BASE_URL?: string
  /** 原站檔案根網址（預設 https://agama-bt.com.tw） */
  readonly VITE_LEGACY_SITE_URL?: string
  /** 網站放在子路徑時的根路徑（例如 /agama-bt-official-website/，結尾要有 /）；預設 / */
  readonly VITE_BASE?: string
  /** 網站正式網址，用於 sitemap、canonical、OG（例如 https://www.example.com.tw） */
  readonly VITE_SITE_URL?: string
  /** 管理者後台 API（Google Apps Script 網頁應用程式的 …/exec 網址）；開發環境未設定時使用模擬後台 */
  readonly VITE_ADMIN_API_URL?: string
  /** 設為 true 時整站不讓搜尋引擎收錄（未設定 VITE_SITE_URL 時也會自動不收錄） */
  readonly VITE_NOINDEX?: string
  /** 內容試算表發布到網路的金鑰（2PACX-…）；設為 off 只用內建資料 */
  readonly VITE_CONTENT_SHEET_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.svg?raw' {
  const content: string
  export default content
}
