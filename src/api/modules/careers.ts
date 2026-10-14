import type { Career } from '@/types/models'
import { CONTENT_SHEET, fetchSheet, hasContentSheet } from '@/api/sheet'
import { toCareers } from '@/api/sheet-mappers'

/** 「人才發展」工作表建立前 gid 為 -1，此時整個人才發展頁不出現在導覽列 */
export const hasCareers = (): boolean => hasContentSheet() && CONTENT_SHEET.gids.careers >= 0

/** 職缺與教育訓練；工作表還沒建立或讀取失敗時回傳空陣列 */
export async function fetchCareers(): Promise<Career[]> {
  if (!hasCareers()) return []
  return fetchSheet('careers').then(toCareers)
}
