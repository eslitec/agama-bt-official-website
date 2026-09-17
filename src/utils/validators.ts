/** 表單驗證工具（台灣常用格式） */

export const isBlank = (v: string): boolean => v.trim() === ''

export const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

/**
 * 統一編號（8 碼）檢查碼。
 * 權數 1,2,1,2,1,2,4,1，各乘積十位與個位相加後總和能被 5 整除即合法（2023 年起由 10 改為 5，向下相容）；
 * 第 7 碼為 7 時，總和加 1 亦可。
 */
export const isTaxId = (v: string): boolean => {
  const s = v.trim()
  if (!/^\d{8}$/.test(s)) return false
  const weights = [1, 2, 1, 2, 1, 2, 4, 1]
  const sum = weights.reduce((acc, w, i) => {
    const p = Number(s[i]) * w
    return acc + Math.floor(p / 10) + (p % 10)
  }, 0)
  return sum % 5 === 0 || (s[6] === '7' && (sum + 1) % 5 === 0)
}

const ID_LETTER_CODES: Record<string, number> = {
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
  G: 16,
  H: 17,
  I: 34,
  J: 18,
  K: 19,
  L: 20,
  M: 21,
  N: 22,
  O: 35,
  P: 23,
  Q: 24,
  R: 25,
  S: 26,
  T: 27,
  U: 28,
  V: 29,
  W: 32,
  X: 30,
  Y: 31,
  Z: 33,
}

/** 國民身分證統一編號與新式居留證號（第 2 碼 1、2、8、9）檢查碼 */
export const isNationalId = (v: string): boolean => {
  const s = v.trim().toUpperCase()
  if (!/^[A-Z][1289]\d{8}$/.test(s)) return false
  const code = ID_LETTER_CODES[s[0]!]!
  const digits = [Math.floor(code / 10), code % 10, ...s.slice(1).split('').map(Number)]
  const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1]
  const sum = digits.reduce((acc, d, i) => acc + d * weights[i]!, 0)
  return sum % 10 === 0
}

/** 市話（含區碼）或手機，允許 -、空白、括號與 +886 */
export const isPhone = (v: string): boolean => {
  let d = v.trim().replace(/[\s\-()]/g, '')
  if (d.startsWith('+886')) d = `0${d.slice(4)}`
  if (/#\d+$/.test(d)) d = d.replace(/#\d+$/, '')
  return /^09\d{8}$/.test(d) || /^0[2-8]\d{7,8}$/.test(d)
}

/* ───────── 管理者後台（規則與 apps-script/admin-api.gs 一致） ───────── */

export const ADMIN_PASSWORD_MIN = 10

/** 管理者帳號：3–32 個英數字，可含 . _ -（不分大小寫，伺服器存成小寫） */
export const isAdminUsername = (v: string): boolean =>
  /^[a-z0-9._-]{3,32}$/.test(v.trim().toLowerCase())

/** 管理者密碼：至少 10 個字元，且同時包含英文字母與數字 */
export const isAdminPassword = (v: string): boolean =>
  v.length >= ADMIN_PASSWORD_MIN && /[A-Za-z]/.test(v) && /\d/.test(v)

/** http:// 或 https:// 開頭、不含空白的網址 */
export const isHttpUrl = (v: string): boolean => /^https?:\/\/\S+$/.test(v.trim())
