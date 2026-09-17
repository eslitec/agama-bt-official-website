/**
 * 內容試算表設定（本檔不使用 @ 別名與 import.meta.env，建置腳本也會匯入）。
 *
 * Google 試算表「成大智研官網內容」（已發布到網路）。
 * 網站開啟時讀取各工作表的 CSV；讀取失敗時改用 src/api/data 的內建備援資料。
 *
 * - VITE_CONTENT_SHEET_KEY：發布到網路網址中 /d/e/ 後面那段（2PACX-…）。設為 off 可停用試算表、只用內建資料。
 * - 工作表以 gid 讀取：工作表可以改名，但不能刪除重建（gid 會變）。
 */
export const CONTENT_SHEET = {
  /** 試算表編輯網址（給維護人員） */
  editUrl:
    'https://docs.google.com/spreadsheets/d/1I2qpT_Vs0iHJmx46TZGkDwvhLMzi4IFY9O379vbnpmE/edit',
  defaultKey:
    '2PACX-1vRQ5SAjL_ES9hUZNmYyCX-8nmkPwCbrLCUApKYUdDTMlQjVpGvzxWlj4rBaQVxOPnVruh5zunMI-SoA',
  gids: {
    news: 40890007,
    downloads: 1702372519,
    quick: 958667549,
    fees: 1518946501,
    farms: 1015962713,
  },
} as const

export type SheetTab = keyof typeof CONTENT_SHEET.gids

export const sheetCsvUrl = (tab: SheetTab, key: string): string =>
  `https://docs.google.com/spreadsheets/d/e/${key}/pub?gid=${CONTENT_SHEET.gids[tab]}&single=true&output=csv`
