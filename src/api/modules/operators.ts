import type { CertifiedOperatorData, OperatorSync } from '@/types/models'
import { CONTENT_SHEET, fetchSheet, hasContentSheet } from '@/api/sheet'
import { toCertifiedOperators, toOperatorSync } from '@/api/sheet-mappers'

const EMPTY_SYNC: OperatorSync = { organic: {}, tap: {} }

/** 同步用的工作表建立前 gid 為 -1，此時整個「通過驗證業者」區塊不顯示 */
export const hasCertifiedOperators = (): boolean =>
  hasContentSheet() && CONTENT_SHEET.gids.operators >= 0

/**
 * 通過驗證業者清單與同步狀態。
 * 資料由 apps-script/opendata-sync.gs 每日寫進內容試算表；讀不到時回傳空清單（區塊自動隱藏）。
 */
export async function fetchCertifiedOperators(): Promise<CertifiedOperatorData> {
  if (!hasCertifiedOperators()) return { items: [], sync: EMPTY_SYNC }
  const [items, sync] = await Promise.all([
    fetchSheet('operators').then(toCertifiedOperators),
    CONTENT_SHEET.gids.syncStatus >= 0
      ? fetchSheet('syncStatus')
          .then(toOperatorSync)
          .catch(() => EMPTY_SYNC)
      : Promise.resolve(EMPTY_SYNC),
  ])
  return { items, sync }
}
