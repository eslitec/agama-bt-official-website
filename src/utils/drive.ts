/**
 * Google 雲端硬碟上的下載檔案。
 * 檔案放在「成大智研官網下載檔案」資料夾，共用設定為「知道連結的任何人都能檢視」。
 * 更新檔案時請在雲端硬碟對原檔「管理版本 → 上傳新版本」，ID 不會變、網站不用改；
 * 刪除後重新上傳會產生新 ID，需要更新 downloads.data.ts / fees.data.ts。
 */
export const DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1rpfperVdCdoB8NwJaGtm9GwJOS_Co-9_'

/** 點擊直接下載（不經過雲端硬碟預覽頁） */
export const driveFile = (id: string): string =>
  `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`
