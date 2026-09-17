/** 消息附件或外部連結 */
export interface NewsAttachment {
  label: string
  href: string
}

/** 最新消息／轉知公告 */
export interface NewsItem {
  id: number
  /** 格式 YYYY.MM.DD */
  date: string
  /** 來源機關 */
  src: string
  /** 公告編號 */
  no: string
  title: string
  atts: NewsAttachment[]
  /** 公告圖片（多頁掃描檔） */
  imgs?: string[]
}

export type FileExt = 'DOC' | 'DOCX' | 'PDF' | 'WORD'

export interface DownloadFile {
  name: string
  ext: FileExt
  href: string
}

export interface DownloadGroup {
  n: string
  title: string
  files: DownloadFile[]
}

/** 驗證類別 */
export interface CertUnit {
  cid: number
  name: string
  desc: string
  /** Material Symbols 圖示名稱 */
  icon: string
  color: string
  portal: string
  portalUrl: string
}

export interface ProcessStep {
  n: string
  title: string
  body: string
}

export interface FeeDoc {
  name: string
  href: string
}

export type FarmIconKey = 'clam' | 'rice' | 'mango' | 'sprout' | 'wheat'

export interface Farm {
  name: string
  tel: string
  fax: string
  site: string
  email: string
  city: string
  addr: string
  icon: FarmIconKey
  href: string
}

export interface RelatedLink {
  n: string
  name: string
  href: string
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
