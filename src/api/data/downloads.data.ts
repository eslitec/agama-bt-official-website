/* 內建備援資料（搬到 Google 試算表當下的快照）：試算表讀取失敗時才使用，平常請改試算表，不用改這裡。 */
import type { DownloadFile, DownloadGroup } from '@/types/models'
import { driveFile } from '@/utils/drive'

export const downloadGroupsData: DownloadGroup[] = [
  {
    n: '01',
    title: '有機農產品驗證申請書',
    titleEn: 'Organic certification application forms',
    files: [
      {
        name: 'TT-10-03-01 有機驗證（有機作物）申請書 2.4',
        nameEn: 'TT-10-03-01 Organic certification application (organic crops) 2.4',
        ext: 'DOC',
        href: driveFile('1hKfjVrPA_lKRD0qy-1Yo52788dBMNQE8'),
      },
      {
        name: 'TT-10-03-02 有機驗證（有機加工、分裝及流通）申請書 2.1',
        nameEn:
          'TT-10-03-02 Organic certification application (processing, packaging and distribution) 2.1',
        ext: 'DOC',
        href: driveFile('1w6PYzgmSxVmclQi6oj7yzLin0ZRHu6G6'),
      },
      {
        name: '附件1（有機蔬果、果樹）2.4',
        nameEn: 'Annex 1 (organic vegetables and fruit trees) 2.4',
        ext: 'DOC',
        href: driveFile('1rSGPdaA4maseSj3F_blRlCmATecWR7cc'),
      },
      {
        name: '附件2（有機米）2.4',
        nameEn: 'Annex 2 (organic rice) 2.4',
        ext: 'DOC',
        href: driveFile('1r5wDPpDfXu-YFnBKGU1J_Fpvm4hNI_5l'),
      },
      {
        name: '附件3（有機茶）2.4',
        nameEn: 'Annex 3 (organic tea) 2.4',
        ext: 'DOC',
        href: driveFile('1w4zjz8VgUR6OrgT67WMOMLR1FKjC4nzj'),
      },
      {
        name: '附件4（有機菇類）2.4',
        nameEn: 'Annex 4 (organic mushrooms) 2.4',
        ext: 'DOC',
        href: driveFile('1sa4dqGPjG8IoUOXJL3IrplzXwanyAU5d'),
      },
      {
        name: '附件5（作物加工）2.4',
        nameEn: 'Annex 5 (crop processing) 2.4',
        ext: 'DOC',
        href: driveFile('1cLWUm53vOAMShBhTkcddFf58iOARERSv'),
      },
      {
        name: '附件6（有機加工分裝流通）2.4',
        nameEn: 'Annex 6 (organic processing, packaging and distribution) 2.4',
        ext: 'DOCX',
        href: driveFile('1B1brOcrGg7m3PoY44y8FrVpgV_AWuaqP'),
      },
      {
        name: 'TT-05-01 有機農糧產品生產使用資材審查表 1.4',
        nameEn: 'TT-05-01 Input review form for organic agri-food production 1.4',
        ext: 'PDF',
        href: driveFile('1_ynqiV1funw2VGWrCHL-c5k9k07SWWzh'),
      },
      {
        name: 'TT-05-02 有機農糧加工品使用資材審查表 1.4',
        nameEn: 'TT-05-02 Input review form for organic processed agri-food products 1.4',
        ext: 'PDF',
        href: driveFile('1VjYiuvQogpr2rduY7rLhUZCUQ5KBIv6l'),
      },
    ],
  },
  {
    n: '02',
    title: '產銷履歷驗證申請書',
    titleEn: 'Traceability certification application forms',
    files: [
      {
        name: 'TT-10-04-01 產銷履歷驗證（農糧產品）申請書 2.3',
        nameEn: 'TT-10-04-01 Traceability certification application (agri-food products) 2.3',
        ext: 'DOCX',
        href: driveFile('1Wkpe0wkNL2Xzr0A-OZlPEBK3_IokEuUN'),
      },
      {
        name: 'TT-10-04-02 產銷履歷驗證（養殖水產品）申請書 2.1',
        nameEn: 'TT-10-04-02 Traceability certification application (aquaculture products) 2.1',
        ext: 'DOC',
        href: driveFile('1Gejo-T9HmGJSJlSQpUiKDoY-NF8N04DJ'),
      },
      {
        name: 'TT-10-04-03 產銷履歷驗證（農糧、養殖水產品加工、分裝及流通）申請書 1.9',
        nameEn:
          'TT-10-04-03 Traceability certification application (processing, packaging and distribution of agri-food and aquaculture products) 1.9',
        ext: 'DOC',
        href: driveFile('10log4-HnRI7kPSM8xdpwmcLtPLSaV9cd'),
      },
      {
        name: 'TT-10-04-04 產銷履歷驗證（蜂產類）申請書 2.1',
        nameEn: 'TT-10-04-04 Traceability certification application (bee products) 2.1',
        ext: 'DOC',
        href: driveFile('19QaUIZMNVfjrl2Jkjv4ZDIpjSRBlP7DU'),
      },
    ],
  },
  {
    n: '03',
    title: '驗證申請應檢附資料清單',
    titleEn: 'Document checklists for applications',
    files: [
      {
        name: '產銷履歷－個別及集團驗證應檢附文件',
        nameEn: 'Traceability – required documents for individual and group certification',
        ext: 'DOC',
        href: driveFile('1XRFwVCtWYsdfQqiRceNDDexPE77aQmRd'),
      },
      {
        name: '有機農糧－個別應檢附文件',
        nameEn: 'Organic agri-food – required documents for individual certification',
        ext: 'DOC',
        href: driveFile('1aVYzVDhQEs3GoVvje69a0Z6lIXaIF0hO'),
      },
      {
        name: '有機農糧－集團應檢附文件',
        nameEn: 'Organic agri-food – required documents for group certification',
        ext: 'DOC',
        href: driveFile('1IwR979WZxv_2GRdFVUPy9vDtB7qCR7h_'),
      },
      {
        name: '有機農糧－加工品應檢附文件',
        nameEn: 'Organic agri-food – required documents for processed products',
        ext: 'DOC',
        href: driveFile('1sPcjxhJ-isFN4I-Rv-4ILIol64dKhtUo'),
      },
      {
        name: '產銷履歷－養殖水產品應檢附文件',
        nameEn: 'Traceability – required documents for aquaculture products',
        ext: 'DOC',
        href: driveFile('1ua6UyJoTt1r_ZyNiwGDPa1TkmXxtyE5r'),
      },
      {
        name: '產銷履歷－加工品驗證應檢附文件',
        nameEn: 'Traceability – required documents for processed products',
        ext: 'DOC',
        href: driveFile('1b7E7H5_Jgfmef1i1CrOl8Sm3QuBFyml8'),
      },
      {
        name: '產銷履歷蜂產類申請所需文件',
        nameEn: 'Traceability – required documents for bee products',
        ext: 'DOC',
        href: driveFile('1tLbQVJ2xkZU3_ltFxpS4YIX36Y1fqF_P'),
      },
    ],
  },
  {
    n: '04',
    title: '生產履歷紀錄簿',
    titleEn: 'Production record books',
    files: [
      {
        name: '［產銷履歷］成大智研－作物生產紀錄簿（1071225 版）',
        nameEn: '[Traceability] Crop production record book (2018-12-25 edition)',
        ext: 'DOC',
        href: driveFile('16poOiQzZl9vbDj88MTZA77uQQZkscr_t'),
      },
      {
        name: '［有機］成大智研－作物生產紀錄簿（1080830 版）',
        nameEn: '[Organic] Crop production record book (2019-08-30 edition)',
        ext: 'DOC',
        href: driveFile('1D2oswalIk60-004WpTBRUjI1i7CwSAh5'),
      },
    ],
  },
  {
    n: '05',
    title: '驗證手冊與作業程序',
    titleEn: 'Certification manuals and procedures',
    files: [
      {
        name: 'TT-10-05 農產品驗證作業手冊 2.2－20260201',
        nameEn: 'TT-10-05 Agricultural product certification manual 2.2 (2026-02-01)',
        ext: 'DOC',
        href: driveFile('1dOQ4nkVLqwhITerdPArKQLgMwI1LRGMG'),
      },
      {
        name: 'TT-10-05 農產品驗證作業手冊 2.1',
        nameEn: 'TT-10-05 Agricultural product certification manual 2.1',
        ext: 'PDF',
        href: driveFile('1xwESW2O392ZoNdhVNckAgQk8G9qyDdeB'),
      },
      {
        name: '產銷履歷集團驗證品質管理手冊簡版',
        nameEn: 'Traceability group certification quality manual (short version)',
        ext: 'PDF',
        href: driveFile('1X1SCHgvHd4eH1mitp-abPl7O_fb2XZEW'),
      },
      {
        name: '產銷履歷集團驗證品質管理手冊簡版',
        nameEn: 'Traceability group certification quality manual (short version)',
        ext: 'WORD',
        href: driveFile('1DbOY-TLFmt22bjqM_7fTR04bvC91tfV3'),
      },
      {
        name: 'TT-31 驗證之增列、結束、減列、暫時停止及終止作業程序書 2.4',
        nameEn:
          'TT-31 Procedure for extension, reduction, suspension, termination and withdrawal of certification 2.4',
        ext: 'PDF',
        href: driveFile('1qNMcUlLZtNQlx67Lz9yZNe7nDmma3zgr'),
      },
    ],
  },
  {
    n: '06',
    title: '權利義務與申訴',
    titleEn: 'Rights, obligations and complaints',
    files: [
      {
        name: 'TT-01-01-02 產銷履歷農產品經營者與驗證機構雙方應負之權利與義務協議書 2.4－1150222',
        nameEn:
          'TT-01-01-02 Agreement on rights and obligations between traceable product operators and the certification body 2.4 (2026-02-22)',
        ext: 'DOCX',
        href: driveFile('1MHXiI6pAtb7sxna4MJHurMpsFfNuQmKS'),
      },
      {
        name: 'TT-34-01 抱怨與申訴單 1.1',
        nameEn: 'TT-34-01 Complaint and appeal form 1.1',
        ext: 'DOC',
        href: driveFile('1gBURk_jO-g2vkiVHQa5HV5taaJNn5JFO'),
      },
    ],
  },
]

/** 首頁「常用下載」 */
export const quickFilesData: DownloadFile[] = [
  {
    name: 'TT-10-03-01 有機驗證（有機作物）申請書',
    nameEn: 'TT-10-03-01 Organic certification application (organic crops)',
    ext: 'DOC',
    href: driveFile('1hKfjVrPA_lKRD0qy-1Yo52788dBMNQE8'),
  },
  {
    name: 'TT-10-04-01 產銷履歷驗證（農糧產品）申請書',
    nameEn: 'TT-10-04-01 Traceability certification application (agri-food products)',
    ext: 'DOCX',
    href: driveFile('1Wkpe0wkNL2Xzr0A-OZlPEBK3_IokEuUN'),
  },
  {
    name: '有機農糧產品（含加工分裝流通）驗證收費',
    nameEn:
      'Fee schedule – organic agri-food products (incl. processing, packaging and distribution)',
    ext: 'PDF',
    href: driveFile('15tTVDW-Ah7P-VjSsn4y-b2A2PXuZoMMB'),
  },
  {
    name: 'TT-34-01 抱怨與申訴單',
    nameEn: 'TT-34-01 Complaint and appeal form',
    ext: 'DOC',
    href: driveFile('1gBURk_jO-g2vkiVHQa5HV5taaJNn5JFO'),
  },
]
