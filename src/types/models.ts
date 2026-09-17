/** 消息附件或外部連結 */
export interface NewsAttachment {
  label: string
  /** 英文名稱（沒有時英文介面顯示中文） */
  labelEn?: string
  href: string
}

/** 最新消息／轉知公告 */
export interface NewsItem {
  id: number
  /** 格式 YYYY.MM.DD */
  date: string
  /** 來源機關 */
  src: string
  /** 來源機關（英文） */
  srcEn?: string
  /** 公告編號 */
  no: string
  title: string
  /** 標題（英文） */
  titleEn?: string
  atts: NewsAttachment[]
  /** 公告圖片（多頁掃描檔） */
  imgs?: string[]
}

/** 檔案格式（DOC、DOCX、PDF…，試算表可自由填寫） */
export type FileExt = string

export interface DownloadFile {
  name: string
  nameEn?: string
  ext: FileExt
  href: string
}

export interface DownloadGroup {
  n: string
  title: string
  titleEn?: string
  files: DownloadFile[]
}

/*
 * 資料欄位中文為主；xxxEn 為選填的英文版本，英文介面有值時顯示英文，沒有時顯示中文
 * （見 src/composables/useLocalized.ts）。
 */

/** 驗證類別 */
export interface CertUnit {
  cid: number
  name: string
  nameEn?: string
  desc: string
  descEn?: string
  /** Material Symbols 圖示名稱 */
  icon: string
  color: string
  portal: string
  portalEn?: string
  portalUrl: string
}

export interface ProcessStep {
  n: string
  title: string
  titleEn?: string
  body: string
  bodyEn?: string
}

export interface FeeDoc {
  name: string
  nameEn?: string
  href: string
}

export type FarmIconKey = 'clam' | 'rice' | 'mango' | 'sprout' | 'wheat'

export interface Farm {
  name: string
  nameEn?: string
  tel: string
  fax: string
  site: string
  email: string
  city: string
  cityEn?: string
  addr: string
  addrEn?: string
  icon: FarmIconKey
}

export interface RelatedLink {
  n: string
  name: string
  nameEn?: string
  href: string
}

/* ───────── 管理者後台（apps-script/admin-api.gs） ───────── */

/** 後台編輯用的消息（與試算表「最新消息」一列對應） */
export interface AdminNewsItem {
  id: number
  /** 格式 YYYY.MM.DD */
  date: string
  src: string
  srcEn: string
  no: string
  title: string
  titleEn: string
  atts: { label: string; href: string }[]
  imgs: string[]
  /** false 時公開網站不顯示（試算表「顯示」填 N） */
  visible: boolean
}

/** 新增、修改時送出的內容（ID 由伺服器指定） */
export type AdminNewsInput = Omit<AdminNewsItem, 'id'>

/** 登入成功後取得的權杖 */
export interface AdminSession {
  username: string
  token: string
  /** 權杖到期時間（epoch 毫秒） */
  expiresAt: number
}

export interface AdminAccount {
  username: string
  /** ISO 8601 */
  createdAt: string
}
