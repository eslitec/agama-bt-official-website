/** 只接受站內路徑（/ 開頭、不是 //），避免 ?redirect= 被用來導向外站 */
export const safeRedirect = (value: unknown): string | null =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : null
