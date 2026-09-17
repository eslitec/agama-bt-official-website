import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { csvToRecords, parseCsv } from '@/utils/csv'
import {
  attachmentLabelEn,
  fileHref,
  isShown,
  normalizeDate,
  parseAttachments,
  toDownloadGroups,
  toFarms,
  toFeeDocs,
  toNews,
  toQuickFiles,
} from '@/api/sheet-mappers'
import { sheetCsvUrl } from '@/api/sheet'
import { newsData } from '@/api/data/news.data'
import { downloadGroupsData, quickFilesData } from '@/api/data/downloads.data'
import { feesData } from '@/api/data/fees.data'
import { farmsData } from '@/api/data/farms.data'
import { driveFile } from '@/utils/drive'

/** 移除所有名稱以 En 結尾的欄位（含巢狀的附件、檔案），比對中文內容用 */
const stripEn = <T>(value: T): T => {
  if (Array.isArray(value)) return value.map(stripEn) as T
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => !k.endsWith('En'))
        .map(([k, v]) => [k, stripEn(v)]),
    ) as T
  return value
}

/** 從 Google 試算表下載的 CSV（含英文欄位；CRLF、雙引號跳脫，與發布輸出逐位元組相同） */
const fixture = (tab: string) =>
  csvToRecords(readFileSync(resolve(process.cwd(), `tests/fixtures/sheet-${tab}.csv`), 'utf8'))

describe('CSV 解析', () => {
  it('處理引號、逗號、換行與 "" 跳脫', () => {
    const text = '﻿a,b,c\r\n1,"x, y","第一行\n第二行"\r\n2,"他說 ""好""",\r\n'
    expect(parseCsv(text)).toEqual([
      ['a', 'b', 'c'],
      ['1', 'x, y', '第一行\n第二行'],
      ['2', '他說 "好"', ''],
    ])
  })

  it('以標題列轉物件並略過空白列', () => {
    expect(csvToRecords(' 名稱 ,顯示\r\nA,Y\r\n,\r\nB,\r\n')).toEqual([
      { 名稱: 'A', 顯示: 'Y' },
      { 名稱: 'B', 顯示: '' },
    ])
  })
})

describe('試算表欄位轉換', () => {
  it('雲端硬碟分享連結、ID 轉直接下載，其他網址不變', () => {
    const id = '1hKfjVrPA_lKRD0qy-1Yo52788dBMNQE8'
    expect(fileHref(`https://drive.google.com/file/d/${id}/view?usp=sharing`)).toBe(driveFile(id))
    expect(fileHref(`https://drive.google.com/open?id=${id}`)).toBe(driveFile(id))
    expect(fileHref(id)).toBe(driveFile(id))
    expect(fileHref('https://example.com/a.pdf')).toBe('https://example.com/a.pdf')
  })

  it('日期、顯示、附件格式', () => {
    expect(normalizeDate('2026/6/2')).toBe('2026.06.02')
    expect(normalizeDate('2026-06-22')).toBe('2026.06.22')
    expect(isShown({ 顯示: 'N' })).toBe(false)
    expect(isShown({ 顯示: '' })).toBe(true)
    expect(parseAttachments('公告連結 | https://a.tw/x?y=1\nhttps://b.tw\n亂打的')).toEqual([
      { label: '公告連結', labelEn: 'Announcement', href: 'https://a.tw/x?y=1' },
      { label: '連結', href: 'https://b.tw' },
    ])
  })

  it('消息：略過沒有 ID／標題、重複 ID 與下架的列，依日期新到舊排序', () => {
    const list = toNews([
      { ID: '2', 日期: '2026/1/5', 標題: 'B' },
      { ID: '3', 日期: '2026.02.01', 標題: 'C', 顯示: 'N' },
      { ID: '1', 日期: '2026.01.05', 標題: 'A' },
      { ID: '1', 日期: '2026.01.05', 標題: '重複' },
      { ID: '', 標題: '沒有 ID' },
    ])
    expect(list.map((n) => [n.id, n.title, n.date])).toEqual([
      [2, 'B', '2026.01.05'],
      [1, 'A', '2026.01.05'],
    ])
  })
})

describe('試算表內容與內建資料一致（搬移時沒有遺漏）', () => {
  it('最新消息', () => {
    const decoded = (items: typeof newsData) =>
      items
        .map((n) => ({ ...n, imgs: n.imgs?.map((u) => decodeURI(u)) }))
        .map((n) => (n.imgs ? n : { ...n, imgs: undefined }))
        .sort((a, b) => a.id - b.id)
    const fromSheet = toNews(fixture('news'))
    expect(fromSheet).toHaveLength(newsData.length)
    // 含英文欄位（xxxEn）一起比對
    expect(decoded(fromSheet)).toEqual(decoded(newsData))
  })

  it('資料下載、首頁常用下載、收費文件、農場', () => {
    expect(toDownloadGroups(fixture('downloads'))).toEqual(downloadGroupsData)
    expect(toQuickFiles(fixture('quick'))).toEqual(quickFilesData)
    expect(toFeeDocs(fixture('fees'))).toEqual(feesData)
    expect(toFarms(fixture('farms'))).toEqual(farmsData)
  })

  it('發布網址格式', () => {
    expect(sheetCsvUrl('news', 'KEY')).toBe(
      'https://docs.google.com/spreadsheets/d/e/KEY/pub?gid=40890007&single=true&output=csv',
    )
  })
})

describe('英文欄位', () => {
  const quote = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v)
  const csv = (rows: string[][]) =>
    csvToRecords(rows.map((r) => r.map(quote).join(',')).join('\r\n'))
  const DRIVE = 'https://drive.google.com/file/d/1hKfjVrPA_lKRD0qy-1Yo52788dBMNQE8/view'

  it('去掉 En 欄位的比對工具會處理巢狀資料', () => {
    expect(
      stripEn([{ title: 'A', titleEn: 'a', atts: [{ label: 'L', labelEn: 'l', href: 'h' }] }]),
    ).toEqual([{ title: 'A', atts: [{ label: 'L', href: 'h' }] }])
  })

  it('最新消息：標題（英文）、來源機關（英文）', () => {
    const [a, b] = toNews(
      csv([
        ['ID', '日期', '來源機關', '來源機關（英文）', '標題', '標題（英文）', '附件'],
        ['2', '2026.02.01', '農業部', 'Ministry of Agriculture', '補助', ' Subsidy ', ''],
        ['1', '2026.01.01', '農業部', '', '講習', '', ''],
      ]),
    )
    expect(a).toEqual({
      id: 2,
      date: '2026.02.01',
      src: '農業部',
      srcEn: 'Ministry of Agriculture',
      no: '',
      title: '補助',
      titleEn: 'Subsidy',
      atts: [],
    })
    // 空白的英文欄位不留 key
    expect(b).not.toHaveProperty('titleEn')
    expect(b).not.toHaveProperty('srcEn')
    expect(Object.keys(b!)).toEqual(['id', 'date', 'src', 'no', 'title', 'atts'])
  })

  it('資料下載：分類名稱（英文）取同分類第一個有填的列，檔名（英文）', () => {
    const groups = toDownloadGroups(
      csv([
        ['分類編號', '分類名稱', '分類名稱（英文）', '檔名', '檔名（英文）', '格式', '檔案連結'],
        ['01', '申請書', '', '甲', 'Form A', 'DOC', DRIVE],
        ['01', '申請書', 'Application Forms', '乙', '', 'PDF', DRIVE],
        ['01', '申請書', 'Ignored', '丙', '', 'PDF', DRIVE],
        ['02', '規範', '', '丁', '', 'PDF', DRIVE],
      ]),
    )
    expect(groups[0]!.titleEn).toBe('Application Forms')
    expect(groups[0]!.files.map((f) => f.nameEn)).toEqual(['Form A', undefined, undefined])
    expect(groups[0]!.files[1]).not.toHaveProperty('nameEn')
    expect(groups[1]).not.toHaveProperty('titleEn')
  })

  it('首頁常用下載、收費文件、農場', () => {
    const [quick] = toQuickFiles(
      csv([
        ['檔名', '檔名（英文）', '格式', '檔案連結'],
        ['申請書', 'Application', 'DOC', DRIVE],
      ]),
    )
    expect(quick!.nameEn).toBe('Application')

    const fees = toFeeDocs(
      csv([
        ['名稱', '名稱（英文）', '檔案連結'],
        ['收費', 'Fees', DRIVE],
        ['收費二', '', DRIVE],
      ]),
    )
    expect(fees[0]!.nameEn).toBe('Fees')
    expect(fees[1]).not.toHaveProperty('nameEn')

    const [farm, other] = toFarms(
      csv([
        ['名稱', '名稱（英文）', '縣市', '縣市（英文）', '地址', '地址（英文）', '圖示'],
        ['文蛤班', 'Clam Group', '臺南市', 'Tainan City', '海浦 30 號', 'No. 30, Haipu', 'clam'],
        ['農會', '', '花蓮縣', '', '富里', '', ''],
      ]),
    )
    expect(farm).toMatchObject({
      nameEn: 'Clam Group',
      cityEn: 'Tainan City',
      addrEn: 'No. 30, Haipu',
    })
    expect(Object.keys(other!).filter((k) => k.endsWith('En'))).toEqual([])
  })

  it('附件名稱英文對照（開頭比對、保留後綴）', () => {
    expect(attachmentLabelEn('公告連結')).toBe('Announcement')
    expect(attachmentLabelEn('附件連結')).toBe('Attachment')
    expect(attachmentLabelEn('報名連結 7/9')).toBe('Registration 7/9')
    expect(attachmentLabelEn('有機農業商品化資材網路公開品牌')).toBe(
      'Approved organic farming inputs (online brand list)',
    )
    expect(attachmentLabelEn('簡章')).toBeUndefined()
    expect(attachmentLabelEn('連結')).toBeUndefined()
    expect(attachmentLabelEn('公告連結（修正）')).toBeUndefined()
    expect(parseAttachments('報名連結 8/7 | https://a.tw\n簡章 | https://b.tw')).toEqual([
      { label: '報名連結 8/7', labelEn: 'Registration 8/7', href: 'https://a.tw' },
      { label: '簡章', href: 'https://b.tw' },
    ])
  })
})
