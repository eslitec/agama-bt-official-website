/**
 * RFC 4180 CSV 解析（Google 試算表「發布到網路」輸出的格式）：
 * 支援雙引號包住的欄位、欄位內的逗號、換行與 "" 跳脫。
 * 本檔不使用 @ 別名，建置腳本（build/site-plugins.ts）也會匯入。
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text

  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += c
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

/** 以第一列為欄位名稱轉成物件；整列空白的列會略過 */
export function csvToRecords(text: string): Record<string, string>[] {
  const [header = [], ...rows] = parseCsv(text)
  const keys = header.map((h) => h.trim())
  return rows
    .filter((r) => r.some((v) => v.trim() !== ''))
    .map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])))
}
