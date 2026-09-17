import { csvToRecords } from '@/utils/csv'
import { hasBackend } from '@/api/http'

import { CONTENT_SHEET, sheetCsvUrl as buildUrl, type SheetTab } from '@/config/content-sheet'

export { CONTENT_SHEET, type SheetTab }
export type SheetRecord = Record<string, string>

const sheetKey = (): string => {
  const env = import.meta.env.VITE_CONTENT_SHEET_KEY?.trim()
  if (env === 'off' || import.meta.env.MODE === 'test') return ''
  return env || CONTENT_SHEET.defaultKey
}

/** 未接後端、且未停用試算表時，內容從試算表讀取 */
export const hasContentSheet = (): boolean => !hasBackend() && Boolean(sheetKey())

export const sheetCsvUrl = (tab: SheetTab, key = sheetKey()): string => buildUrl(tab, key)

/** 同一次瀏覽內快取 5 分鐘，切換頁面不重複下載 */
const CACHE_MS = 5 * 60 * 1000
const cache = new Map<SheetTab, { at: number; promise: Promise<SheetRecord[]> }>()

export function fetchSheet(tab: SheetTab): Promise<SheetRecord[]> {
  const hit = cache.get(tab)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.promise
  const promise = fetch(sheetCsvUrl(tab), { credentials: 'omit' })
    .then((res) => {
      if (!res.ok) throw new Error(`Sheet ${tab} HTTP ${res.status}`)
      return res.text()
    })
    .then((text) => {
      const records = csvToRecords(text)
      if (!records.length && !text.includes(',')) throw new Error(`Sheet ${tab} is empty`)
      return records
    })
  cache.set(tab, { at: Date.now(), promise })
  promise.catch(() => cache.delete(tab))
  return promise
}

/** 清除快取（測試用） */
export const clearSheetCache = (): void => cache.clear()

/**
 * 先讀試算表，失敗時用內建資料，避免 Google 暫時連不上時整頁空白。
 */
export async function fromSheet<T>(
  tab: SheetTab,
  map: (records: SheetRecord[]) => T,
  fallback: () => Promise<T>,
): Promise<T> {
  if (!hasContentSheet()) return fallback()
  try {
    return map(await fetchSheet(tab))
  } catch (e) {
    console.warn(`[content-sheet] 讀取「${tab}」失敗，改用內建資料`, e)
    return fallback()
  }
}
