/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 後端 API 根路徑；未設定時使用內建靜態資料 */
  readonly VITE_API_BASE_URL?: string
  /** 原站檔案根網址（預設 https://agama-bt.com.tw） */
  readonly VITE_LEGACY_SITE_URL?: string
  /** 網站正式網址，用於 sitemap、canonical、OG（例如 https://www.example.com.tw） */
  readonly VITE_SITE_URL?: string
  /** 未接後端時是否允許示範登入／註冊（開發環境預設開啟） */
  readonly VITE_DEMO_MEMBER?: string
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
