import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { csvToRecords, parseCsv } from '@/utils/csv'
import {
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

/** 由目前內建資料匯出、與 Google 試算表發布格式相同（CRLF、雙引號跳脫）的 CSV */
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
      { label: '公告連結', href: 'https://a.tw/x?y=1' },
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
