import heroPoster from '@/assets/images/hero-poster.webp'
import heroMp4 from '@/assets/videos/hero.mp4'
import heroWebm from '@/assets/videos/hero.webm'
import fieldBanner from '@/assets/images/field-banner.webp'
import contact from '@/assets/images/contact.webp'
import about from '@/assets/images/about.webp'

/**
 * 首頁主視覺影片（原片前 6 秒、無音軌），poster 為第一格畫面。
 * 替換時保持同檔名：src/assets/videos/hero.webm、hero.mp4 與 src/assets/images/hero-poster.webp。
 */
export const heroVideo = {
  webm: heroWebm,
  mp4: heroMp4,
  poster: heroPoster,
} as const

/**
 * 其他區塊的底圖（取自主視覺影片的畫面）。
 * - fieldBanner：首頁「驗證類別」底圖、管理者登入頁側欄（植物與實驗器材）
 * - contact：首頁聯絡資訊卡（單支試管幼苗）
 * - about：成大智研頁（一排試管幼苗）
 * 取得實拍照片後替換 src/assets/images 內同名檔即可。
 */
export const media = {
  fieldBanner,
  contact,
  about,
} as const

/** 外部查詢系統 */
export const externalUrls = {
  traceableLookup: 'https://taft.moa.gov.tw',
  organicLookup: 'https://epv.afa.gov.tw',
} as const
