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

/** 註冊表單「擬申請驗證類別」選項：value 為送出的中文值，labelEn 為英文顯示名稱 */
export interface RegisterCategory {
  value: string
  labelEn?: string
}

export interface MemberUser {
  name: string
  status: string
}

export interface LoginPayload {
  account: string
  password: string
  remember: boolean
}

export interface RegisterPayload {
  operatorName: string
  taxId: string
  owner: string
  contact: string
  phone: string
  email: string
  address: string
  categories: string[]
  password: string
  passwordConfirm: string
  agree: boolean
}
