/* 內建備援資料（搬到 Google 試算表當下的快照）：試算表讀取失敗時才使用，平常請改試算表，不用改這裡。 */
import type { NewsItem } from '@/types/models'
import { legacyUrl } from '@/utils/legacy'

/** 第 123 則公告之掃描頁（原站圖檔，離線時不顯示） */
const NOTICE_123_PAGES_BASE = legacyUrl(
  '/management/upload/images/123-1150616-%E6%9C%89%E9%97%9C%E3%80%8C%E7%94%A2%E9%8A%B7%E5%B1%A5%E6%AD%B7%E9%A4%8A%E6%AE%96%E6%B0%B4%E7%94%A2%E5%93%81%E9%A9%97%E8%AD%89%E8%B2%BB%E7%94%A8%E8%A3%9C%E5%8A%A9%E6%96%B9%E5%BC%8F%E3%80%8D%E5%8F%8A%E3%80%8C%E7%94%A2%E9%8A%B7%E5%B1%A5%E6%AD%B7%E6%B0%B4%E7%94%A2%E5%93%81%E7%92%B0%E5%A2%83%E7%8D%8E%E5%8B%B5%E8%A6%81%E9%BB%9E%E3%80%8D%E7%B5%A6%E4%BB%98%E9%A9%97%E8%AD%89%E8%B2%BB%E7%94%A8%E8%A3%9C%E5%8A%A9%E6%AC%BE%E5%8F%8A%E7%92%B0%E5%A2%83%E7%8D%8E%E5%8B%B5%E9%87%91%E5%BE%B5%E5%85%8D%E6%89%80%E5%BE%97%E7%A8%85%E4%B8%80%E6%A1%88_%E9%A0%81%E9%9D%A2_',
)

export const noticeImagePages = (base: string, count: number): string[] =>
  Array.from({ length: count }, (_, i) => `${base}${i + 1}.jpg`)

export const newsData: NewsItem[] = [
  {
    id: 714,
    date: '2026.06.22',
    src: '農業部漁業署',
    srcEn: 'Fisheries Agency, Ministry of Agriculture',
    no: '129',
    title: '【轉知】129-農業部漁業署 公告115年度水產品產銷履歷驗證評選補助名單',
    titleEn:
      '129 – Fisheries Agency: 2026 selection results for aquaculture product traceability certification subsidies',
    atts: [
      {
        label: '公告連結',
        labelEn: 'Announcement',
        href: 'https://www.fa.gov.tw/view.php?theme=Announcement_Info&subtheme=&id=580',
      },
    ],
  },
  {
    id: 713,
    date: '2026.06.16',
    src: '屏東縣政府',
    srcEn: 'Pingtung County Government',
    no: '124',
    title:
      '【轉知】124-屏東縣政府 「屏東縣115年首次申請通過產銷履歷(農糧產品)驗證申請補助作業須知」',
    titleEn:
      '124 – Pingtung County Government: 2026 guidelines for subsidies to first-time traceability certification (agri-food products) in Pingtung County',
    atts: [
      {
        label: '附件連結',
        labelEn: 'Attachment',
        href: 'https://odcdl.pthg.gov.tw/dl/DLLIB/WebFile.ashx?SKey=VznUMMJv',
      },
    ],
  },
  {
    id: 712,
    date: '2026.06.16',
    src: '農業部漁業署',
    srcEn: 'Fisheries Agency, Ministry of Agriculture',
    no: '123',
    title:
      '【轉知】123-農業部漁業署 說明有關「產銷履歷養殖水產品驗證費用補助方式」及「產銷履歷水產品環境獎勵要點」給付驗證費用補助款及環境獎勵金徵免所得稅',
    titleEn:
      '123 – Fisheries Agency: Clarification on income tax treatment of traceability certification fee subsidies for aquaculture products and environmental incentives for traceable aquatic products',
    atts: [],
    imgs: noticeImagePages(NOTICE_123_PAGES_BASE, 4),
  },
  {
    id: 711,
    date: '2026.06.12',
    src: '財團法人仰山文教基金會',
    srcEn: 'Yang-Shan Cultural and Educational Foundation',
    no: '122',
    title:
      '【轉知】122-財團法人仰山文教基金會 辦理115年7-8月「數位農務培訓-農務e把抓基礎訓練講習」',
    titleEn:
      '122 – Yang-Shan Cultural and Educational Foundation: July–August 2026 digital farming training – basic workshops on the “農務e把抓” app',
    atts: [
      {
        label: '報名連結 7/9',
        labelEn: 'Registration 7/9',
        href: 'https://forms.gle/Cxkf37SwuwJsbkQT8',
      },
      {
        label: '報名連結 7/10',
        labelEn: 'Registration 7/10',
        href: 'https://forms.gle/T9fToDTk6FHnjuXF8',
      },
      {
        label: '報名連結 8/7',
        labelEn: 'Registration 8/7',
        href: 'https://forms.gle/Fem1eQAKBef2zeka8',
      },
      {
        label: '報名連結 8/14',
        labelEn: 'Registration 8/14',
        href: 'https://forms.gle/BusYxQcGKaE7kdZ68',
      },
    ],
  },
  {
    id: 710,
    date: '2026.06.12',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '121',
    title:
      '【轉知】121-農業部農糧署 增列維慶實業產製之「中性亞磷酸-植保亞磷酸」為有機農業商品化資材-植物病蟲草害防制資材網路公開品牌',
    titleEn:
      '121 – Agriculture and Food Agency: “中性亞磷酸-植保亞磷酸” by 維慶實業 added to the online brand list of commercial organic farming inputs (plant pest, disease and weed control)',
    atts: [
      {
        label: '有機農業商品化資材網路公開品牌',
        labelEn: 'Approved organic farming inputs (online brand list)',
        href: 'https://www.afa.gov.tw/cht/index.php?code=list&ids=556',
      },
    ],
  },
  {
    id: 709,
    date: '2026.06.12',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '120',
    title:
      '【轉知】120-農業部農糧署 增列萬益生技股份有限公司產製之「林旺有機質肥料」為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '120 – Agriculture and Food Agency: “林旺有機質肥料” by 萬益生技股份有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [
      {
        label: '有機農業商品化資材網路公開品牌',
        labelEn: 'Approved organic farming inputs (online brand list)',
        href: 'https://www.afa.gov.tw/cht/index.php?code=list&ids=556',
      },
    ],
  },
  {
    id: 708,
    date: '2026.06.12',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '119',
    title:
      '【轉知】119-農業部農糧署 增列仁諭畜牧場產製之「仁諭有機質肥料」為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '119 – Agriculture and Food Agency: “仁諭有機質肥料” by 仁諭畜牧場 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [
      {
        label: '有機農業商品化資材網路公開品牌',
        labelEn: 'Approved organic farming inputs (online brand list)',
        href: 'https://www.afa.gov.tw/cht/index.php?code=list&ids=556',
      },
    ],
  },
  {
    id: 707,
    date: '2026.06.12',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '118',
    title:
      '【轉知】118-農業部農糧署 增列瑪汀農牧產銷有限公司產製之「宏生好到底」、「宏生好肥底」、「宏生好田底」、「瑪汀大豐收」為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '118 – Agriculture and Food Agency: “宏生好到底”, “宏生好肥底”, “宏生好田底” and “瑪汀大豐收” by 瑪汀農牧產銷有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [
      {
        label: '有機農業商品化資材網路公開品牌',
        labelEn: 'Approved organic farming inputs (online brand list)',
        href: 'https://www.afa.gov.tw/cht/index.php?code=list&ids=556',
      },
    ],
  },
  {
    id: 706,
    date: '2026.06.11',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '117',
    title:
      '【轉知】117-農業部農糧署 函轉農業部公告「扶比胺」農藥使用方法及其範圍與修正「派滅芬、凡殺歐西比、賽速安勃、阿扶平、派芬農、亞克瑞、特安勃」農藥使用方法及其範圍案',
    titleEn:
      '117 – Agriculture and Food Agency: Ministry of Agriculture announcement on the use and scope of the pesticide “扶比胺” and amendments for 7 other pesticides',
    atts: [],
  },
  {
    id: 705,
    date: '2026.06.09',
    src: '國立嘉義大學',
    srcEn: 'National Chiayi University',
    no: '116',
    title: '【轉知】116-國立嘉義大學 辦理「115年度產銷履歷水產品驗證稽核人員基礎訓練」',
    titleEn:
      '116 – National Chiayi University: 2026 basic training for traceable aquatic product certification auditors',
    atts: [],
  },
  {
    id: 704,
    date: '2026.06.04',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '111',
    title:
      '【轉知】111-農業部農糧署 增列福壽實業股份有限公司產製之「福壽牌苦茶粕」為有機農業商品化資材-植物病蟲草害防治資材網路公開品牌',
    titleEn:
      '111 – Agriculture and Food Agency: “福壽牌苦茶粕” by 福壽實業股份有限公司 added to the online brand list of commercial organic farming inputs (plant pest, disease and weed control)',
    atts: [
      {
        label: '有機農業商品化資材網路公開品牌',
        labelEn: 'Approved organic farming inputs (online brand list)',
        href: 'https://www.afa.gov.tw/cht/index.php?code=list&ids=556',
      },
    ],
  },
  {
    id: 703,
    date: '2026.06.04',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '110',
    title:
      '【轉知】110-農業部農糧署 增列龍瑩生物科技股份有限公司產製之「安盾LY01」為有機農業商品化資材-植物病蟲草害防治資材網路公開品牌',
    titleEn:
      '110 – Agriculture and Food Agency: “安盾LY01” by 龍瑩生物科技股份有限公司 added to the online brand list of commercial organic farming inputs (plant pest, disease and weed control)',
    atts: [
      {
        label: '有機農業商品化資材網路公開品牌',
        labelEn: 'Approved organic farming inputs (online brand list)',
        href: 'https://www.afa.gov.tw/cht/index.php?code=list&ids=556',
      },
    ],
  },
  {
    id: 702,
    date: '2026.06.04',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '109',
    title:
      '【轉知】109-農業部農糧署 增列金大堆肥共同處理場產製之「金大牌2號」為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '109 – Agriculture and Food Agency: “金大牌2號” by 金大堆肥共同處理場 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [
      {
        label: '有機農業商品化資材網路公開品牌',
        labelEn: 'Approved organic farming inputs (online brand list)',
        href: 'https://www.afa.gov.tw/cht/index.php?code=list&ids=556',
      },
    ],
  },
  {
    id: 701,
    date: '2026.06.04',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '108',
    title:
      '【轉知】108-農業部農糧署 增列佳禾科技有限公司產製之「好收成高級3號」為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '108 – Agriculture and Food Agency: “好收成高級3號” by 佳禾科技有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [
      {
        label: '有機農業商品化資材網路公開品牌',
        labelEn: 'Approved organic farming inputs (online brand list)',
        href: 'https://www.afa.gov.tw/cht/index.php?code=list&ids=556',
      },
    ],
  },
  {
    id: 700,
    date: '2026.06.01',
    src: '財團法人仰山文教基金會',
    srcEn: 'Yang-Shan Cultural and Educational Foundation',
    no: '103',
    title: '【轉知】103-財團法人仰山文教基金會 辦理115年6月「數位農務培訓-農務e把抓基礎訓練講習」',
    titleEn:
      '103 – Yang-Shan Cultural and Educational Foundation: June 2026 digital farming training – basic workshops on the “農務e把抓” app',
    atts: [],
  },
  {
    id: 699,
    date: '2026.06.01',
    src: '本公司公告',
    srcEn: 'Company announcement',
    no: '',
    title: '【公告】2026(115)年6月特殊營業時間',
    titleEn: 'Special business hours for June 2026',
    atts: [],
  },
  {
    id: 698,
    date: '2026.05.29',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '102',
    title:
      '【轉知】102-農業部農糧署 增列中華紙漿股份有限公司產製之「豐田」為有機農業商品化資材-病蟲草害防治資材網路公開品牌',
    titleEn:
      '102 – Agriculture and Food Agency: “豐田” by 中華紙漿股份有限公司 added to the online brand list of commercial organic farming inputs (plant pest, disease and weed control)',
    atts: [],
  },
  {
    id: 697,
    date: '2026.05.29',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '101',
    title:
      '【轉知】101-農業部農糧署 停止「純德牌鉀肥肥427」登載為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '101 – Agriculture and Food Agency: “純德牌鉀肥肥427” removed from the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 696,
    date: '2026.05.28',
    src: '農業部茶及飲料作物改良場',
    srcEn: 'Tea and Beverage Research Station, Ministry of Agriculture',
    no: '100',
    title:
      '【轉知】100-農業部茶及飲料作物改良場 辦理「2026臺灣第七屆有機及第六屆產銷履歷茶TAGs分類分級評鑑活動」',
    titleEn:
      '100 – Tea and Beverage Research Station: 2026 Taiwan 7th Organic and 6th Traceable Tea TAGs Grading Competition',
    atts: [],
  },
  {
    id: 695,
    date: '2026.05.26',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '098',
    title:
      '【轉知】098-農業部農糧署 保證責任雲林縣豐榮合作農場之「百恩旺有機質肥料」禽畜糞堆肥品牌，本署核予停止網路登載推薦',
    titleEn:
      '098 – Agriculture and Food Agency: Online listing of the livestock manure compost brand “百恩旺有機質肥料” (保證責任雲林縣豐榮合作農場) discontinued',
    atts: [],
  },
  {
    id: 694,
    date: '2026.05.26',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '097',
    title:
      '【轉知】097-農業部農糧署 增列長岡化工股份有限公司產製之「禾圓寶」為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '097 – Agriculture and Food Agency: “禾圓寶” by 長岡化工股份有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 692,
    date: '2026.05.25',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '095',
    title:
      '【轉知】095-農業部農糧署 增列三木實業股份有限公司產製之「三木精選苦茶粕」及「花生粕」等2件產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '095 – Agriculture and Food Agency: “三木精選苦茶粕” and “花生粕” by 三木實業股份有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 691,
    date: '2026.05.22',
    src: '臺中市政府農業局',
    srcEn: 'Agriculture Bureau, Taichung City Government',
    no: '091',
    title: '【轉知】091-臺中市政府農業局 臺中市有機及有機轉型期驗證加碼補助計畫',
    titleEn:
      '091 – Agriculture Bureau, Taichung City Government: Additional subsidy program for organic and in-conversion certification in Taichung',
    atts: [],
  },
  {
    id: 690,
    date: '2026.05.18',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '088',
    title:
      '【轉知】088-農業部農糧署 增列維慶實業有限公司之「勝懋豆粕肥」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '088 – Agriculture and Food Agency: “勝懋豆粕肥” by 維慶實業有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 689,
    date: '2026.05.18',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '087',
    title:
      '【轉知】087-農業部農糧署 增列嶺先興業股份有限公司之「祺雞1號」及「祺雞333」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '087 – Agriculture and Food Agency: “祺雞1號” and “祺雞333” by 嶺先興業股份有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 684,
    date: '2026.05.18',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '086',
    title:
      '【轉知】086-農業部農糧署 暫停台灣糖業股份有限公司新營副產加工廠之「台糖牌田寶10號有機質肥料」登載為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '086 – Agriculture and Food Agency: Listing of “台糖牌田寶10號有機質肥料” (Taiwan Sugar Corporation, Xinying by-product plant) suspended from the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 685,
    date: '2026.05.14',
    src: '農業部漁業署',
    srcEn: 'Fisheries Agency, Ministry of Agriculture',
    no: '085',
    title: '【轉知】085-農業部漁業署 「水產類農產品初級加工場產製計畫指引」(冷凍汆燙蝦類、貝類)',
    titleEn:
      '085 – Fisheries Agency: Guidelines for production plans of primary processing plants for aquatic products (frozen blanched shrimp and shellfish)',
    atts: [],
  },
  {
    id: 681,
    date: '2026.05.12',
    src: '農業部',
    srcEn: 'Ministry of Agriculture',
    no: '080',
    title: '【轉知】080-農業部 公告修正「產銷履歷農產品生產過程臺灣良好農業規範(TGAP)-水果類」',
    titleEn:
      '080 – Ministry of Agriculture: Amended Taiwan Good Agricultural Practice (TGAP) for traceable agricultural products – fruits',
    atts: [],
  },
  {
    id: 680,
    date: '2026.05.12',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '079',
    title:
      '【轉知】079-農業部農糧署 為利外國及農產品經營者了解並運用質譜快篩自主檢驗農產品農藥殘留，本署製作多國語言(中文、英文、越南、泰國、印尼)宣導單張如附件',
    titleEn:
      '079 – Agriculture and Food Agency: Multilingual leaflets (Chinese, English, Vietnamese, Thai, Indonesian) on mass spectrometry rapid screening for pesticide residues',
    atts: [],
  },
  {
    id: 679,
    date: '2026.05.11',
    src: '國立中興大學',
    srcEn: 'National Chung Hsing University',
    no: '078',
    title: '【轉知】078-國立中興大學 辦理115年「產銷履歷驗證集團總部管理訓練課程」',
    titleEn:
      '078 – National Chung Hsing University: 2026 management training for traceability group certification headquarters',
    atts: [],
  },
  {
    id: 678,
    date: '2026.05.11',
    src: '農業部',
    srcEn: 'Ministry of Agriculture',
    no: '077',
    title:
      '【轉知】077-農業部 公告修正「產銷履歷農產品生產過程臺灣良好農業規範(TGAP)-養殖水產類」養殖魚類、甲殼類、貝類、甲魚(鱉)、養殖魚類初級處理、蝦仁初級處理等規範',
    titleEn:
      '077 – Ministry of Agriculture: Amended TGAP for traceable aquaculture products (fish, crustaceans, shellfish, soft-shelled turtles, primary processing of fish and peeled shrimp)',
    atts: [],
  },
  {
    id: 682,
    date: '2026.05.07',
    src: '國立中興大學',
    srcEn: 'National Chung Hsing University',
    no: '084',
    title: '【轉知】084-國立中興大學 辦理「2026有機農產品經營者輔導媒合計畫」',
    titleEn:
      '084 – National Chung Hsing University: 2026 organic operator guidance and matching program',
    atts: [],
  },
  {
    id: 693,
    date: '2026.05.05',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '',
    title: '【轉知】農業部農糧署 宣導勿使用非法農藥「Broflanilide」(格力高)',
    titleEn: 'Agriculture and Food Agency: Do not use the illegal pesticide Broflanilide',
    atts: [],
  },
  {
    id: 677,
    date: '2026.04.28',
    src: '采園生態驗證有限公司',
    srcEn: '采園生態驗證有限公司 (certification body)',
    no: '',
    title: '【轉知】采園生態驗證有限公司 辦理有機農產品加工、分裝及流通從業人員訓練課程',
    titleEn:
      '采園生態驗證: Training course for personnel in organic processing, packaging and distribution',
    atts: [],
  },
  {
    id: 676,
    date: '2026.04.27',
    src: '財團法人仰山文教基金會',
    srcEn: 'Yang-Shan Cultural and Educational Foundation',
    no: '',
    title: '【轉知】財團法人仰山文教基金會 辦理農務e把基礎訓練講習',
    titleEn:
      'Yang-Shan Cultural and Educational Foundation: Basic training workshops on the “農務e把抓” app',
    atts: [],
  },
  {
    id: 675,
    date: '2026.04.23',
    src: '本公司公告',
    srcEn: 'Company announcement',
    no: '',
    title: '【公告】2026(115)年5月特殊營業時間',
    titleEn: 'Special business hours for May 2026',
    atts: [],
  },
  {
    id: 674,
    date: '2026.04.22',
    src: '財團法人食品工業發展研究所',
    srcEn: 'Food Industry Research and Development Institute',
    no: '068',
    title:
      '【轉知】068-財團法人食品工業發展研究所 辦理之「食品加工業者自主管理實務」、「供應商管理與合約審查實務」、「數位表單於製程及溯源管理應用實務」',
    titleEn:
      '068 – Food Industry Research and Development Institute: Courses on food processor self-management, supplier management and contract review, and digital forms for process and traceability management',
    atts: [],
  },
  {
    id: 673,
    date: '2026.04.22',
    src: '農業部農糧署北區分署',
    srcEn: 'Northern Region Branch, Agriculture and Food Agency',
    no: '067',
    title: '【轉知】067-農業部農糧署北區分署 本(115)年度「有機農業生產輔導計畫」',
    titleEn:
      '067 – Northern Region Branch, AFA: 2026 Organic Agriculture Production Guidance Program',
    atts: [],
  },
  {
    id: 672,
    date: '2026.04.20',
    src: '國立中興大學',
    srcEn: 'National Chung Hsing University',
    no: '063',
    title: '【轉知】063-國立中興大學 辦理「農糧產品產銷履歷資訊系統(L3)實機操作課程」',
    titleEn:
      '063 – National Chung Hsing University: Hands-on course for the agri-food traceability information system (L3)',
    atts: [],
  },
  {
    id: 671,
    date: '2026.04.20',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '060',
    title:
      '【轉知】060-農業部農糧署 增列創裕有機有限公司之「創裕牌雞金肥」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '060 – Agriculture and Food Agency: “創裕牌雞金肥” by 創裕有機有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 670,
    date: '2026.04.20',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '059',
    title:
      '【轉知】059-農業部農糧署 增列御品園科技有限公司之「勤續奮蓋好99號」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '059 – Agriculture and Food Agency: “勤續奮蓋好99號” by 御品園科技有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 669,
    date: '2026.04.15',
    src: '農業部農糧署中區分署',
    srcEn: 'Central Region Branch, Agriculture and Food Agency',
    no: '055',
    title:
      '【轉知】055-農業部農糧署中區分署 本(115)年度「有機農業生產輔導計畫」之「生產及加工設備輔導計畫」',
    titleEn:
      '055 – Central Region Branch, AFA: Production and processing equipment guidance under the 2026 Organic Agriculture Production Guidance Program',
    atts: [],
  },
  {
    id: 668,
    date: '2026.04.15',
    src: '財團法人台灣養殖漁業發展基金會',
    srcEn: 'Taiwan Aquaculture Development Foundation',
    no: '054',
    title: '【轉知】054-財團法人台灣養殖漁業發展基金會 辦理「水產養殖安全管理宣導講習會」',
    titleEn:
      '054 – Taiwan Aquaculture Development Foundation: Aquaculture safety management workshops',
    atts: [],
  },
  {
    id: 667,
    date: '2026.04.15',
    src: '花蓮縣政府',
    srcEn: 'Hualien County Government',
    no: '053',
    title: '【轉知】053-花蓮縣政府 有機農業發展計畫',
    titleEn: '053 – Hualien County Government: Organic agriculture development program',
    atts: [],
  },
  {
    id: 666,
    date: '2026.04.02',
    src: '財團法人台灣養殖漁業發展基金會',
    srcEn: 'Taiwan Aquaculture Development Foundation',
    no: '048',
    title: '【轉知】048-財團法人台灣養殖漁業發展基金會 辦理「水產養殖安全管理宣導講習會」',
    titleEn:
      '048 – Taiwan Aquaculture Development Foundation: Aquaculture safety management workshops',
    atts: [],
  },
  {
    id: 665,
    date: '2026.03.27',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '045',
    title:
      '【轉知】045-農業部農糧署 增列禾旺農品有限公司之「禾旺雞蛋費有機質肥料」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '045 – Agriculture and Food Agency: “禾旺雞蛋費有機質肥料” by 禾旺農品有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 664,
    date: '2026.03.25',
    src: '本公司公告',
    srcEn: 'Company announcement',
    no: '',
    title: '【公告】2026(115)年4月特殊營業時間',
    titleEn: 'Special business hours for April 2026',
    atts: [],
  },
  {
    id: 663,
    date: '2026.03.13',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '040',
    title: '【轉知】040-農業部農糧署 115年度產銷履歷農糧產品驗證費用補助作業須知',
    titleEn:
      '040 – Agriculture and Food Agency: 2026 guidelines for traceability certification fee subsidies for agri-food products',
    atts: [],
  },
  {
    id: 662,
    date: '2026.03.13',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '038',
    title:
      '【轉知】038-農業部農糧署 增列創裕有機有限公司之「創裕牌加佳肥混合有機質肥料」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '038 – Agriculture and Food Agency: “創裕牌加佳肥混合有機質肥料” by 創裕有機有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 661,
    date: '2026.03.11',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '037',
    title:
      '【轉知】037-農業部農糧署 增列保證責任嘉義縣東石合作農場之「東農牌24號有機質肥料」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '037 – Agriculture and Food Agency: “東農牌24號有機質肥料” by 保證責任嘉義縣東石合作農場 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 660,
    date: '2026.03.11',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '036',
    title:
      '【轉知】036-農業部農糧署 動植物防疫檢疫署轉駐日代表處農業組通知「日方取消包含2-苯基苯酚等農藥之殘留基準，修改為統一基準0.01ppm」',
    titleEn:
      '036 – Agriculture and Food Agency: Japan removes residue limits for pesticides including 2-phenylphenol and applies the uniform limit of 0.01 ppm',
    atts: [],
  },
  {
    id: 658,
    date: '2026.03.10',
    src: '財團法人農業科技研究院',
    srcEn: 'Agricultural Technology Research Institute',
    no: '',
    title: '【轉知】財團法人農業科技研究院 辦理本（115）年有機農產品經營者相關訓練',
    titleEn: 'Agricultural Technology Research Institute: 2026 training for organic operators',
    atts: [],
  },
  {
    id: 659,
    date: '2026.03.06',
    src: '農業部',
    srcEn: 'Ministry of Agriculture',
    no: '032',
    title: '【轉知】032-農業部 公告修正「產銷履歷養殖水產品驗證費用補助方式」',
    titleEn:
      '032 – Ministry of Agriculture: Amended subsidy scheme for traceability certification fees of aquaculture products',
    atts: [],
  },
  {
    id: 657,
    date: '2026.02.26',
    src: '國立中興大學',
    srcEn: 'National Chung Hsing University',
    no: '030',
    title: '【轉知】030-國立中興大學 「115年度有機及產銷履歷農產品驗證稽核人員基礎訓練」',
    titleEn:
      '030 – National Chung Hsing University: 2026 basic training for organic and traceable product certification auditors',
    atts: [],
  },
  {
    id: 656,
    date: '2026.02.26',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '029',
    title:
      '【轉知】029-農業部農糧署 增列長興生物科技股份有限公司之「長興牌活綠旺2號」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '029 – Agriculture and Food Agency: “長興牌活綠旺2號” by 長興生物科技股份有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 655,
    date: '2026.02.26',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '028',
    title:
      '【轉知】028-農業部農糧署 增列大成長城企業股份有限公司之「碩成有機質肥料2號+」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '028 – Agriculture and Food Agency: “碩成有機質肥料2號+” by 大成長城企業股份有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 654,
    date: '2026.02.13',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '024',
    title:
      '【轉知】024-農業部農糧署 增列新華丰再生能源有限公司之「華豐牌有機質肥料7號」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '024 – Agriculture and Food Agency: “華豐牌有機質肥料7號” by 新華丰再生能源有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 653,
    date: '2026.02.13',
    src: '本公司公告',
    srcEn: 'Company announcement',
    no: '',
    title: '【公告】2026(115)年2月特殊營業時間',
    titleEn: 'Special business hours for February 2026',
    atts: [],
  },
  {
    id: 652,
    date: '2026.02.12',
    src: '本公司公告',
    srcEn: 'Company announcement',
    no: '',
    title: '【公告】有關本(115)年度有機驗證費及檢驗費補助須配合農業部推動農業生產資訊登記案之說明',
    titleEn:
      '2026 organic certification and testing fee subsidies require agricultural production information registration with the Ministry of Agriculture',
    atts: [],
  },
  {
    id: 650,
    date: '2026.02.09',
    src: '財團法人台灣養殖漁業發展基金會',
    srcEn: 'Taiwan Aquaculture Development Foundation',
    no: '021',
    title:
      '【轉知】021-財團法人台灣養殖漁業發展基金會 115年度產銷履歷養殖水產品輔導團體評選補助作業規範',
    titleEn:
      '021 – Taiwan Aquaculture Development Foundation: 2026 rules for selecting and subsidizing guidance groups for traceable aquaculture products',
    atts: [],
  },
  {
    id: 651,
    date: '2026.02.04',
    src: '桃園市政府',
    srcEn: 'Taoyuan City Government',
    no: '018',
    title: '【轉知】018-桃園市政府 桃園市115年有機農業推廣補助計畫',
    titleEn:
      '018 – Taoyuan City Government: 2026 Taoyuan organic agriculture promotion subsidy program',
    atts: [],
  },
  {
    id: 649,
    date: '2026.02.03',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '017',
    title:
      '【轉知】017-農業部農糧署 有關本(115)年度有機驗證費及檢驗費補助須配合農業部推動農業生產資訊登記案',
    titleEn:
      '017 – Agriculture and Food Agency: 2026 organic certification and testing fee subsidies to be linked with agricultural production information registration',
    atts: [],
  },
  {
    id: 648,
    date: '2026.02.02',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '016',
    title:
      '【轉知】016-農業部農糧署 增列正瀚生技股份有限公司之「富肽-9號」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '016 – Agriculture and Food Agency: “富肽-9號” by 正瀚生技股份有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 638,
    date: '2026.01.30',
    src: '農業部漁業署',
    srcEn: 'Fisheries Agency, Ministry of Agriculture',
    no: '014',
    title: '【轉知】014-農業部漁業署「水產類產銷履歷集團驗證品質管理文件參考手冊」',
    titleEn:
      '014 – Fisheries Agency: Reference manual of quality management documents for traceability group certification of aquatic products',
    atts: [],
  },
  {
    id: 636,
    date: '2026.01.16',
    src: '臺東縣政府',
    srcEn: 'Taitung County Government',
    no: '008',
    title:
      '【轉知】008-臺東縣政府「臺東縣115年度強化產銷履歷溯源農產品安全管理暨契作產銷履歷番荔枝肥料補助計畫」',
    titleEn:
      '008 – Taitung County Government: 2026 program to strengthen safety management of traceable agricultural products and fertilizer subsidies for contract-farmed traceable sugar apples',
    atts: [],
  },
  {
    id: 630,
    date: '2025.03.31',
    src: '本公司公告',
    srcEn: 'Company announcement',
    no: '',
    title: '【公告】本公司與農產品經營者簽訂之權利與義務協議書及驗證證書相關事宜',
    titleEn:
      'Rights and obligations agreements signed with agricultural operators and certification certificates',
    atts: [],
  },
  {
    id: 629,
    date: '2025.03.03',
    src: '本公司公告',
    srcEn: 'Company announcement',
    no: '',
    title: '【公告】本公司變更營業登記地址及辦公室聯絡資訊',
    titleEn: 'Change of registered business address and office contact information',
    atts: [],
  },
  {
    id: 628,
    date: '2025.02.20',
    src: '中華郵政公司',
    srcEn: 'Chunghwa Post',
    no: '',
    title:
      '【轉知】中華郵政公司「i郵購」網路購物平臺可納入產銷履歷、有機標章產品、國產茶及咖啡等產品',
    titleEn:
      'Chunghwa Post: The “i郵購” online shopping platform accepts traceable, organic-labelled, domestic tea and coffee products',
    atts: [],
  },
  {
    id: 627,
    date: '2024.12.04',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '323',
    title:
      '【轉知】323-1131129-停止多鏈科技股份有限公司之「龍矽寶」產品登載為有機農業商品化資材－植物病蟲害防治資材網路公開品牌',
    titleEn:
      '323-1131129 – “龍矽寶” by 多鏈科技股份有限公司 removed from the online brand list of commercial organic farming inputs (plant pest and disease control)',
    atts: [],
  },
  {
    id: 626,
    date: '2024.09.13',
    src: '主管機關轉知',
    srcEn: 'Competent authority',
    no: '237',
    title:
      '【轉知】237-1130913-本會訂於113年10月16日(星期三)上午8時45分，於臺東縣鹿野地區農會辦理「113年度消費者有機農業教育宣導會」',
    titleEn:
      '237-1130913 – Consumer organic agriculture education seminar, 8:45 a.m. on October 16, 2024, at Luye Farmers’ Association, Taitung County',
    atts: [],
  },
  {
    id: 625,
    date: '2024.09.13',
    src: '主管機關轉知',
    srcEn: 'Competent authority',
    no: '236',
    title:
      '【轉知】236-1130913-本會訂於113年10月15日(星期二)上午8時50分，於臺東縣鹿野地區農會辦理「113年度臺東縣有機農業土壤肥培淨零碳排暨作物健康管理講習會」',
    titleEn:
      '236-1130913 – Taitung County workshop on organic soil fertility, net-zero emissions and crop health management, 8:50 a.m. on October 15, 2024, at Luye Farmers’ Association',
    atts: [],
  },
  {
    id: 622,
    date: '2024.09.06',
    src: '主管機關轉知',
    srcEn: 'Competent authority',
    no: '232',
    title:
      '【轉知】232-1130906-本會訂於113年9月23日(星期一)上午8時45分於宜蘭鄉三星鄉農會(上午場)、及9月25日(星期三)上午8時45分於臺北市休閒農業發展協會(花博場)(上午場)',
    titleEn:
      '232-1130906 – Seminars at 8:45 a.m. on September 23, 2024 (Sanxing Township Farmers’ Association, Yilan) and September 25, 2024 (Taipei Leisure Agriculture Development Association, Flora Expo venue)',
    atts: [],
  },
  {
    id: 623,
    date: '2024.09.03',
    src: '主管機關轉知',
    srcEn: 'Competent authority',
    no: '227',
    title: '【轉知】227-1130903-檢送「2024第四屆台灣產銷茶分類TGAs評鑑活動」報名簡章1份',
    titleEn:
      '227-1130903 – Registration brochure for the 2024 4th Taiwan Traceable Tea TAGs Grading Competition',
    atts: [],
  },
  {
    id: 621,
    date: '2024.08.30',
    src: '主管機關轉知',
    srcEn: 'Competent authority',
    no: '230',
    title:
      '【轉知】230-1130830-本會訂於113年9月24日(星期二)上午8時50分，於花蓮區農改場蘭陽分場辦理「113年度宜蘭縣有機農業土壤肥培淨零碳排暨作物健康管理講習會」',
    titleEn:
      '230-1130830 – Yilan County workshop on organic soil fertility, net-zero emissions and crop health management, 8:50 a.m. on September 24, 2024, at the Lanyang Branch, Hualien District Agricultural Research and Extension Station',
    atts: [],
  },
  {
    id: 615,
    date: '2024.08.23',
    src: '南華大學',
    srcEn: 'Nanhua University',
    no: '219',
    title:
      '【轉知】219-1130820-有關南華大學辦理「2024年有機世界大會(Organic World Congress)」敬請協助轉知相關協會、農友、企業並踴躍報名',
    titleEn:
      '219-1130820 – Nanhua University hosts the 2024 Organic World Congress; associations, farmers and businesses are invited to register',
    atts: [],
  },
  {
    id: 612,
    date: '2024.07.23',
    src: '水產試驗所',
    srcEn: 'Fisheries Research Institute',
    no: '192',
    title:
      '【轉知】192-1130719-本所將於本(113)年11月5日辦理113年漁業科技成果發表暨技術媒合會，擬調查貴單位感興趣的技術媒合內容',
    titleEn:
      '192-1130719 – Fisheries Research Institute: 2024 fishery technology results and technology matching event on November 5; survey of technologies of interest',
    atts: [],
  },
  {
    id: 611,
    date: '2024.07.17',
    src: '主管機關轉知',
    srcEn: 'Competent authority',
    no: '189',
    title:
      '【轉知】189-1130711-本校謹訂於本(113)年10月1日於圖書館七樓國際會議廳辦理「有機農業生態系統服務價值國際研討會」',
    titleEn:
      '189-1130711 – International symposium on the ecosystem service value of organic agriculture, October 1, 2024, 7F International Conference Hall, University Library',
    atts: [],
  },
  {
    id: 609,
    date: '2024.05.23',
    src: '主管機關轉知',
    srcEn: 'Competent authority',
    no: '120',
    title:
      '【轉知】120-1130523-貴院辦理本(113)年度有機農產加工、分流及流通從業人員訓練課程之「穀物加工品精進課程」，得予列入應受訓練時數計算',
    titleEn:
      '120-1130523 – The “Grain Processed Products Advanced Course” in 2024 training for organic processing, packaging and distribution personnel counts toward required training hours',
    atts: [],
  },
  {
    id: 608,
    date: '2024.05.20',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '116',
    title:
      '【轉知】116-1130520-停止豫豐實業有限公司之「寶島牌有夠大」及「寶島牌甜美肥」登載為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '116-1130520 – “寶島牌有夠大” and “寶島牌甜美肥” by 豫豐實業有限公司 removed from the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 607,
    date: '2024.05.16',
    src: '臺東縣政府',
    srcEn: 'Taitung County Government',
    no: '112',
    title:
      '【轉知】112-1130516-為辦理「113年度臺東縣有機農業生產與驗證輔導計畫」案請依說明檢附相關資料並於期限內送府憑辦核銷事宜',
    titleEn:
      '112-1130516 – Supporting documents required for reimbursement under the 2024 Taitung County organic production and certification guidance program',
    atts: [],
  },
  {
    id: 606,
    date: '2024.05.10',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '109',
    title:
      '【轉知】109-1130510-停止福壽實業股份有限公司之「福壽牌特級生機栽培專用肥426」及「532」登載為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '109-1130510 – “福壽牌特級生機栽培專用肥426” and “532” by 福壽實業股份有限公司 removed from the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 605,
    date: '2024.05.03',
    src: '主管機關轉知',
    srcEn: 'Competent authority',
    no: '',
    title: '【轉知】1130503-113年水產養殖管理宣導講習會',
    titleEn: '1130503 – 2024 aquaculture management workshops',
    atts: [],
  },
  {
    id: 604,
    date: '2024.04.23',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '096',
    title:
      '【轉知】096-1130423-停止百泰生物科技股份有限公司之「火山寶」及「貝萊斯寶」登載為有機農業商品化資材-植物病蟲害防治資材網路公開品牌',
    titleEn:
      '096-1130423 – “火山寶” and “貝萊斯寶” by 百泰生物科技股份有限公司 removed from the online brand list of commercial organic farming inputs (plant pest and disease control)',
    atts: [],
  },
  {
    id: 603,
    date: '2024.04.18',
    src: '主管機關轉知',
    srcEn: 'Competent authority',
    no: '091',
    title:
      '【轉知】091-1130418-貴院辦理本(113)年度有機農產品加工、分裝及流通從業人員訓練課程之「基礎訓練」及「乾燥及磨粉產品之製成管理實務精進課程」得予列入時數計算',
    titleEn:
      '091-1130418 – Basic training and advanced course on drying and milling process management in 2024 training for organic processing, packaging and distribution personnel count toward training hours',
    atts: [],
  },
  {
    id: 577,
    date: '2024.04.16',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '088',
    title: '【轉知】088-1130416-函轉農業部公告修正「畢芬寧、撲滅松、祿分隆」農藥使用方法及其範圍案',
    titleEn:
      '088-1130416 – Ministry of Agriculture announcement amending the use and scope of the pesticides bifenthrin, fenitrothion and flufenoxuron',
    atts: [],
  },
  {
    id: 576,
    date: '2024.04.16',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '087',
    title:
      '【轉知】087-1130416-有關個別驗證之農產品經營業者，於申請產銷履歷農產品環境補貼，是否得於發放環境補貼疑義案',
    titleEn:
      '087-1130416 – Clarification on whether individually certified operators may receive environmental subsidies for traceable agricultural products',
    atts: [],
  },
  {
    id: 575,
    date: '2024.04.15',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '086',
    title:
      '【轉知】086-1130415-停止田酪股份有限公司之「豐田一號高級有機質肥料」登載為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '086-1130415 – “豐田一號高級有機質肥料” by 田酪股份有限公司 removed from the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 590,
    date: '2024.04.11',
    src: '台灣有機產業促進協會',
    srcEn: 'Taiwan Organic Industry Promotion Association',
    no: '090',
    title:
      '【轉知】090-1130411-本會訂於113年5月7日、6月6日及6月12日於彰化縣員林市農會、南投縣竹山鎮農會、台中市外埔區農會、大肚區農會辦理「113年度消費者有機農業教育宣導會」',
    titleEn:
      '090-1130411 – 2024 consumer organic agriculture education seminars on May 7, June 6 and June 12 at farmers’ associations in Yuanlin (Changhua), Zhushan (Nantou), Waipu and Dadu (Taichung)',
    atts: [],
  },
  {
    id: 589,
    date: '2024.04.10',
    src: '台灣有機產業促進協會',
    srcEn: 'Taiwan Organic Industry Promotion Association',
    no: '089',
    title:
      '【轉知】089-1130410-本會訂於113年5月15日、5月23日及5月29日於嘉義縣義竹鄉農會、嘉義市農會、雲林縣虎尾鎮農會、台南市柳營區及歸仁區農會辦理「113年度消費者有機農業教育宣導會」',
    titleEn:
      '089-1130410 – 2024 consumer organic agriculture education seminars on May 15, 23 and 29 at farmers’ associations in Yizhu (Chiayi County), Chiayi City, Huwei (Yunlin), Liuying and Guiren (Tainan)',
    atts: [],
  },
  {
    id: 602,
    date: '2024.04.09',
    src: '台灣有機產業促進協會',
    srcEn: 'Taiwan Organic Industry Promotion Association',
    no: '076',
    title:
      '【轉知】076-1130409-本會訂於113年4月24日及5月2日於高雄市旗山區農會及屏東縣九如鄉農會辦理「113年度消費者有機農業教育宣導會」',
    titleEn:
      '076-1130409 – 2024 consumer organic agriculture education seminars on April 24 and May 2 at Qishan (Kaohsiung) and Jiuru (Pingtung) farmers’ associations',
    atts: [],
  },
  {
    id: 599,
    date: '2024.04.09',
    src: '國立中興大學',
    srcEn: 'National Chung Hsing University',
    no: '073',
    title:
      '【轉知】073-1130409-本校謹定於本(113)年4月2日至11月30日辦理「有機農產品經營者輔導媒合計畫」',
    titleEn:
      '073-1130409 – Organic operator guidance and matching program, April 2 to November 30, 2024',
    atts: [],
  },
  {
    id: 596,
    date: '2024.04.09',
    src: '主管機關轉知',
    srcEn: 'Competent authority',
    no: '067',
    title: '【轉知】067-1130403-檢送「2024第四屆全國有機茶分類分級TAGs評鑑活動」報名簡章1份',
    titleEn:
      '067-1130403 – Registration brochure for the 2024 4th National Organic Tea TAGs Grading Competition',
    atts: [],
  },
  {
    id: 598,
    date: '2024.04.08',
    src: '主管機關轉知',
    srcEn: 'Competent authority',
    no: '071',
    title:
      '【轉知】071-1130408-本學會於4月30日線上辦理「推動政府機關(構)與國營事業採用在地生產農產品暨農糧直賣所說明會」',
    titleEn:
      '071-1130408 – Online briefing on April 30 on promoting local produce procurement by government agencies and state-owned enterprises, and farmers’ direct markets',
    atts: [],
  },
  {
    id: 597,
    date: '2024.04.08',
    src: '農業部',
    srcEn: 'Ministry of Agriculture',
    no: '068',
    title:
      '【轉知】068-1130408-產銷履歷農產品生產過程台灣良好農業規範(TGAP)-蔬菜、水果、雜糧，業經本部於113年4月8日公告',
    titleEn:
      '068-1130408 – TGAP for traceable agricultural products (vegetables, fruits, grains) announced by the Ministry of Agriculture on April 8, 2024',
    atts: [],
  },
  {
    id: 595,
    date: '2024.04.03',
    src: '臺東縣政府',
    srcEn: 'Taitung County Government',
    no: '066',
    title: '【轉知】066-1130403-檢送「臺東縣113年度強化產銷履歷溯源農產品安全管理實施計畫」1份',
    titleEn:
      '066-1130403 – 2024 Taitung County implementation plan for strengthening safety management of traceable agricultural products',
    atts: [],
  },
  {
    id: 593,
    date: '2024.04.03',
    src: '主管機關轉知',
    srcEn: 'Competent authority',
    no: '065',
    title:
      '【轉知】065-1130403-貴所辦理本(113)年有機農產品加工、分裝、流通從業人員食品安全管制(HACCP)系列訓練，得予列入時數計算',
    titleEn:
      '065-1130403 – 2024 food safety (HACCP) training series for organic processing, packaging and distribution personnel counts toward training hours',
    atts: [],
  },
  {
    id: 601,
    date: '2024.04.01',
    src: '台灣有機產業促進協會',
    srcEn: 'Taiwan Organic Industry Promotion Association',
    no: '075',
    title:
      '【轉知】075-1130401-本會訂於113年5月8日、6月5日及6月11日於彰化市農會、竹山鎮農會及外埔區農會辦理「113年度中彰投地區有機農業土壤肥培淨零碳排暨作物健康管理講習會」',
    titleEn:
      '075-1130401 – 2024 Changhua–Nantou–Taichung workshops on organic soil fertility, net-zero emissions and crop health management on May 8, June 5 and June 11',
    atts: [],
  },
  {
    id: 600,
    date: '2024.03.27',
    src: '台灣有機產業促進協會',
    srcEn: 'Taiwan Organic Industry Promotion Association',
    no: '074',
    title:
      '【轉知】074-1130327-本會訂於113年5月14日、5月22日及5月28日於新港鄉農會、虎尾鎮農會及柳營區農會辦理「113年度雲嘉南地區有機農業土壤肥培淨零碳排暨作物健康管理講習會」',
    titleEn:
      '074-1130327 – 2024 Yunlin–Chiayi–Tainan workshops on organic soil fertility, net-zero emissions and crop health management on May 14, 22 and 28',
    atts: [],
  },
  {
    id: 574,
    date: '2024.03.01',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '040',
    title:
      '【轉知】040-農業部農糧署 增列長興生物科技股份有限公司之「龍苗活磷勇6號」及「龍苗活磷勇1號」二產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '040 – Agriculture and Food Agency: “龍苗活磷勇6號” and “龍苗活磷勇1號” by 長興生物科技股份有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 573,
    date: '2024.02.23',
    src: '桃園市政府',
    srcEn: 'Taoyuan City Government',
    no: '038',
    title: '【轉知】038-桃園市政府 函轉農業部農糧署新訂「113年稻米產銷履歷驗證補助作業須知」',
    titleEn:
      '038 – Taoyuan City Government: Forwarding the AFA’s new 2024 guidelines for rice traceability certification subsidies',
    atts: [],
  },
  {
    id: 570,
    date: '2024.02.20',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '035',
    title: '【轉知】035-農業部農糧署 113年稻米產銷履歷驗證補助作業須知',
    titleEn:
      '035 – Agriculture and Food Agency: 2024 guidelines for rice traceability certification subsidies',
    atts: [],
  },
  {
    id: 569,
    date: '2024.02.07',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '028',
    title:
      '【轉知】028-農業部農糧署 增列龍瑩生物科技股份有限公司之「一值生」產品為有機農業商品化資材-病蟲草害防制資材網路公開品牌',
    titleEn:
      '028 – Agriculture and Food Agency: “一值生” by 龍瑩生物科技股份有限公司 added to the online brand list of commercial organic farming inputs (plant pest, disease and weed control)',
    atts: [],
  },
  {
    id: 568,
    date: '2024.02.06',
    src: '中華民國養殖漁業發展協會',
    srcEn: 'Aquaculture Development Association of the R.O.C.',
    no: '026',
    title:
      '【轉知】026-社團法人中華民國養殖漁業發展協會 辦理113年度產銷履歷養殖水產品標籤條碼機補助',
    titleEn:
      '026 – Aquaculture Development Association of the R.O.C.: 2024 subsidies for label barcode printers for traceable aquaculture products',
    atts: [],
  },
  {
    id: 567,
    date: '2024.01.31',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '025',
    title:
      '【轉知】025-農業部農糧署 增列保證責任嘉義縣東石合作農場之「東農牌15號有機質肥料」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '025 – Agriculture and Food Agency: “東農牌15號有機質肥料” by 保證責任嘉義縣東石合作農場 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 566,
    date: '2024.01.25',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '021',
    title:
      '【轉知】021-農業部農糧署 增列屏東縣南州地區農會之「阿猴城牌有機質肥料2號」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '021 – Agriculture and Food Agency: “阿猴城牌有機質肥料2號” by 屏東縣南州地區農會 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 572,
    date: '2024.01.24',
    src: '桃園市政府',
    srcEn: 'Taoyuan City Government',
    no: '019',
    title: '【轉知】019-桃園市政府 桃園市113年有機農業推廣補助計畫',
    titleEn:
      '019 – Taoyuan City Government: 2024 Taoyuan organic agriculture promotion subsidy program',
    atts: [],
  },
  {
    id: 571,
    date: '2024.01.24',
    src: '桃園市政府',
    srcEn: 'Taoyuan City Government',
    no: '019',
    title: '【轉知】019-桃園市政府 桃園市113年有機農業推廣補助計畫（附件）',
    titleEn:
      '019 – Taoyuan City Government: 2024 Taoyuan organic agriculture promotion subsidy program (attachment)',
    atts: [],
  },
  {
    id: 564,
    date: '2024.01.24',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '017',
    title: '【轉知】017-農業部農糧署 113年度產銷履歷農糧產品蜂產類驗證費用補助須知',
    titleEn:
      '017 – Agriculture and Food Agency: 2024 guidelines for traceability certification fee subsidies for bee products',
    atts: [],
  },
  {
    id: 563,
    date: '2024.01.19',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '014',
    title: '【轉知】014-農業部農糧署 輔導販賣有機農產品及有機轉型期農產品操作指南',
    titleEn:
      '014 – Agriculture and Food Agency: Operating guide for selling organic and in-conversion agricultural products',
    atts: [],
  },
  {
    id: 562,
    date: '2024.01.19',
    src: '農業部農糧署北區分署',
    srcEn: 'Northern Region Branch, Agriculture and Food Agency',
    no: '013',
    title:
      '【轉知】013-農業部農糧署北區分署 新竹縣農會定於本(113)年1月31日舉辦「113年北部地區蜂產類產銷履歷媒合座談暨養蜂保險說明會」',
    titleEn:
      '013 – Northern Region Branch, AFA: 2024 northern region bee product traceability matching forum and beekeeping insurance briefing, January 31, Hsinchu County Farmers’ Association',
    atts: [],
  },
  {
    id: 561,
    date: '2024.01.11',
    src: '農業部農糧署南區分署',
    srcEn: 'Southern Region Branch, Agriculture and Food Agency',
    no: '009',
    title:
      '【轉知】009-農業部農糧署南區分署 台南市南化區農會訂本(113)年1月26日舉辦「113年南部地區蜂產類產銷履歷媒合座談暨養蜂保險說明會」',
    titleEn:
      '009 – Southern Region Branch, AFA: 2024 southern region bee product traceability matching forum and beekeeping insurance briefing, January 26, Nanhua District Farmers’ Association, Tainan',
    atts: [],
  },
  {
    id: 560,
    date: '2024.01.10',
    src: '農業部',
    srcEn: 'Ministry of Agriculture',
    no: '004',
    title: '【轉知】004-農業部 公告113年度產銷履歷養殖水產品驗證費用補助之申請期間及補助名額',
    titleEn:
      '004 – Ministry of Agriculture: Application period and quota for 2024 traceability certification fee subsidies for aquaculture products',
    atts: [],
  },
  {
    id: 559,
    date: '2024.01.08',
    src: '農業部農糧署中區分署',
    srcEn: 'Central Region Branch, Agriculture and Food Agency',
    no: '003',
    title:
      '【轉知】003-農業部農糧署中區分署 臺中市大里區農會訂本(113)年1月24日舉辦「113年中部地區蜂產類產銷履歷媒合座談暨養蜂保險說明會」',
    titleEn:
      '003 – Central Region Branch, AFA: 2024 central region bee product traceability matching forum and beekeeping insurance briefing, January 24, Dali District Farmers’ Association, Taichung',
    atts: [],
  },
  {
    id: 558,
    date: '2024.01.08',
    src: '農業部農糧署中區分署',
    srcEn: 'Central Region Branch, Agriculture and Food Agency',
    no: '002',
    title:
      '【轉知】002-農業部農糧署中區分署 彰化縣員林市農會訂本(113)年1月25日舉辦「113年中部地區蜂產類產銷履歷媒合座談暨養蜂保險說明會」',
    titleEn:
      '002 – Central Region Branch, AFA: 2024 central region bee product traceability matching forum and beekeeping insurance briefing, January 25, Yuanlin City Farmers’ Association, Changhua',
    atts: [],
  },
  {
    id: 557,
    date: '2023.12.29',
    src: '花蓮縣政府',
    srcEn: 'Hualien County Government',
    no: '260',
    title: '【轉知】260-花蓮縣政府 行政院農業委員會農糧署補助有機農業發展計畫',
    titleEn:
      '260 – Hualien County Government: Organic agriculture development program subsidized by the Agriculture and Food Agency',
    atts: [],
  },
  {
    id: 555,
    date: '2023.12.28',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '258',
    title: '【轉知】258-農業部農糧署 113年度「蔬菜、水果、雜糧及特用作物產銷履歷驗證補助作業須知」',
    titleEn:
      '258 – Agriculture and Food Agency: 2024 guidelines for traceability certification subsidies for vegetables, fruits, grains and specialty crops',
    atts: [],
  },
  {
    id: 554,
    date: '2023.12.21',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '253',
    title:
      '【轉知】253-農業部農糧署 增列保證責任雲林縣豐榮合作農場之「百恩旺有機質肥料」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '253 – Agriculture and Food Agency: “百恩旺有機質肥料” by 保證責任雲林縣豐榮合作農場 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 553,
    date: '2023.12.12',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '247',
    title:
      '【轉知】247-1-農業部農糧署 元霖實業有限公司之「好康立克3號」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '247-1 – Agriculture and Food Agency: “好康立克3號” by 元霖實業有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 552,
    date: '2023.11.28',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '231',
    title:
      '【轉知】231-2-農業部農糧署 增列正隆股份有限公司后里分公司之「環保抑草紙」產品為有機農業商品化資材-植物病蟲草害防制資材網路公開品牌',
    titleEn:
      '231-2 – Agriculture and Food Agency: “環保抑草紙” by 正隆股份有限公司后里分公司 added to the online brand list of commercial organic farming inputs (plant pest, disease and weed control)',
    atts: [],
  },
  {
    id: 551,
    date: '2023.11.22',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '230',
    title:
      '【轉知】230-農業部農糧署 停止良農現代化農業科技股份有限公司之「土豪」產品登載為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '230 – Agriculture and Food Agency: “土豪” by 良農現代化農業科技股份有限公司 removed from the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 550,
    date: '2023.11.21',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '229',
    title:
      '【轉知】229-農業部農糧署 增列六和化工股份有限公司之「六和金根旺」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '229 – Agriculture and Food Agency: “六和金根旺” by 六和化工股份有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 549,
    date: '2023.11.16',
    src: '台灣有機產業促進協會',
    srcEn: 'Taiwan Organic Industry Promotion Association',
    no: '224',
    title: '【轉知】224-台灣有機產業促進協會 辦理112年度屏東縣消費者有機農業教育宣導會',
    titleEn:
      '224 – Taiwan Organic Industry Promotion Association: 2023 Pingtung County consumer organic agriculture education seminar',
    atts: [],
  },
  {
    id: 548,
    date: '2023.11.14',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '222',
    title:
      '【轉知】222-增列台灣糖業股份有限公司新營副產加工廠之「台糖牌田寶有機質肥料」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '222 – “台糖牌田寶有機質肥料” by Taiwan Sugar Corporation (Xinying by-product plant) added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 547,
    date: '2023.10.27',
    src: '國立中興大學',
    srcEn: 'National Chung Hsing University',
    no: '210',
    title: '【轉知】210-國立中興大學 辦理「2023有機生活日」',
    titleEn: '210 – National Chung Hsing University: 2023 Organic Living Day',
    atts: [],
  },
  {
    id: 546,
    date: '2023.10.26',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '207',
    title:
      '【轉知】207-2-增列綠寶生物科技股份有限公司之「殺無赦」產品為有機農業商品化資材-病蟲草害防制資材網路公開品牌',
    titleEn:
      '207-2 – “殺無赦” by 綠寶生物科技股份有限公司 added to the online brand list of commercial organic farming inputs (plant pest, disease and weed control)',
    atts: [],
  },
  {
    id: 545,
    date: '2023.10.26',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '207',
    title:
      '【轉知】207-1-增列田酪股份有限公司之「漢江生態堆肥」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '207-1 – “漢江生態堆肥” by 田酪股份有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 544,
    date: '2023.10.23',
    src: '台灣品牌農業推廣協會',
    srcEn: 'Taiwan Brand Agriculture Promotion Association',
    no: '205',
    title:
      '【轉知】205-台灣品牌農業推廣協會 辦理112年友善環境耕作推廣計畫友善農法推廣教育訓練暨專題講座',
    titleEn:
      '205 – Taiwan Brand Agriculture Promotion Association: 2023 environmentally friendly farming training and lecture series',
    atts: [],
  },
  {
    id: 543,
    date: '2023.10.20',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '204',
    title:
      '【轉知】204-增列巨聖油脂化學股份有限公司之「95%苦練油」產品為有機農業商品化資材-病蟲草害防制資材網路公開品牌',
    titleEn:
      '204 – “95%苦練油” by 巨聖油脂化學股份有限公司 added to the online brand list of commercial organic farming inputs (plant pest, disease and weed control)',
    atts: [],
  },
  {
    id: 542,
    date: '2023.10.18',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '202',
    title:
      '【轉知】202-停止保證責任嘉義縣東石合作農場之「東農牌1號、10號、11號有機質肥料」登載為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '202 – “東農牌1號、10號、11號有機質肥料” by 保證責任嘉義縣東石合作農場 removed from the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 540,
    date: '2023.10.18',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '201',
    title:
      '【轉知】201-停止「阿猴城牌有機質肥料」等5件產品登載為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '201 – “阿猴城牌有機質肥料” and 4 other products removed from the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 539,
    date: '2023.10.05',
    src: '台灣有機產業促進協會',
    srcEn: 'Taiwan Organic Industry Promotion Association',
    no: '190',
    title:
      '【轉知】190-2-台灣有機產業促進協會 辦理「112全國有機日慶祝活動暨花蓮縣消費者有機農業教育宣導會」',
    titleEn:
      '190-2 – Taiwan Organic Industry Promotion Association: 2023 National Organic Day celebration and Hualien County consumer organic agriculture education seminar',
    atts: [],
  },
  {
    id: 538,
    date: '2023.10.02',
    src: '台灣有機產業促進協會',
    srcEn: 'Taiwan Organic Industry Promotion Association',
    no: '186',
    title:
      '【轉知】186-台灣有機產業促進協會 辦理「112年度臺南市消費者有機農業教育宣導會」、「112年度臺中市消費者有機農業教育宣導會」',
    titleEn:
      '186 – Taiwan Organic Industry Promotion Association: 2023 consumer organic agriculture education seminars in Tainan and Taichung',
    atts: [],
  },
  {
    id: 537,
    date: '2023.09.27',
    src: '國立東華大學',
    srcEn: 'National Dong Hwa University',
    no: '184',
    title:
      '【轉知】184-國立東華大學 辦理2023有機農產品驗證稽核員培訓系列課程[課程二]稽核員專業訓練-進階課程',
    titleEn:
      '184 – National Dong Hwa University: 2023 organic certification auditor training series, course 2 – advanced auditor training',
    atts: [],
  },
  {
    id: 536,
    date: '2023.09.26',
    src: '農業部',
    srcEn: 'Ministry of Agriculture',
    no: '183',
    title:
      '【轉知】183-農業部 通知為配合「傳染病防治法」防治作業需要，經通過驗證有機及有機轉型期田區之管制措施',
    titleEn:
      '183 – Ministry of Agriculture: Control measures for certified organic and in-conversion fields under the Communicable Disease Control Act',
    atts: [],
  },
  {
    id: 535,
    date: '2023.09.25',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '181',
    title:
      '【轉知】181-增列翔鹿股份有限公司之「翔鹿牌好豐收624」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '181 – “翔鹿牌好豐收624” by 翔鹿股份有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 534,
    date: '2023.09.23',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '179',
    title:
      '【轉知】179-停止良農現代化農業科技股份有限公司之「天下無蟲窄域油」產品登載為有機農業商品化資材-植物病蟲草害防制資材網路公開品牌',
    titleEn:
      '179 – “天下無蟲窄域油” by 良農現代化農業科技股份有限公司 removed from the online brand list of commercial organic farming inputs (plant pest, disease and weed control)',
    atts: [],
  },
  {
    id: 533,
    date: '2023.09.22',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '178',
    title:
      '【轉知】178-增列田園生物科技有限公司之「純得牌肥多多633」產品為有機農業商品化資材-土壤肥力改良資材網路公開品牌',
    titleEn:
      '178 – “純得牌肥多多633” by 田園生物科技有限公司 added to the online brand list of commercial organic farming inputs (soil fertility improvement)',
    atts: [],
  },
  {
    id: 532,
    date: '2023.09.21',
    src: '財團法人台北市瑠公農業產銷基金會',
    srcEn: 'Taipei Liugong Agricultural Marketing Foundation',
    no: '177',
    title:
      '【轉知】177-財團法人台北市瑠公農業產銷基金會 辦理「2023第三屆臺灣產銷履歷茶分類分級TAGs評鑑活動」',
    titleEn:
      '177 – Taipei Liugong Agricultural Marketing Foundation: 2023 3rd Taiwan Traceable Tea TAGs Grading Competition',
    atts: [],
  },
  {
    id: 531,
    date: '2023.09.20',
    src: '農業部',
    srcEn: 'Ministry of Agriculture',
    no: '176',
    title:
      '【轉知】176-農業部 提供「產銷履歷集團驗證品質文件參考手冊」112年3.0版1式，供農產品經營者參考使用',
    titleEn:
      '176 – Ministry of Agriculture: Reference manual of quality documents for traceability group certification (2023, version 3.0) for operators',
    atts: [],
  },
  {
    id: 528,
    date: '2023.09.19',
    src: '財團法人農業科技研究院',
    srcEn: 'Agricultural Technology Research Institute',
    no: '175',
    title:
      '【轉知】175-財團法人農業科技研究院 辦理「112年度有機農產品加工、分裝、流通－乾燥及磨粉產品之製程管理實務精進課程」',
    titleEn:
      '175 – Agricultural Technology Research Institute: 2023 advanced course on process management of dried and milled products for organic processing, packaging and distribution',
    atts: [],
  },
  {
    id: 530,
    date: '2023.09.14',
    src: '中華民國養殖漁業發展協會',
    srcEn: 'Aquaculture Development Association of the R.O.C.',
    no: '173',
    title:
      '【轉知】173-社團法人中華民國養殖漁業發展協會 「112年度產銷履歷養殖水產品標籤條碼機補助計畫」補助作業規範(第二次公告)',
    titleEn:
      '173 – Aquaculture Development Association of the R.O.C.: Rules for the 2023 label barcode printer subsidy for traceable aquaculture products (second announcement)',
    atts: [],
  },
  {
    id: 529,
    date: '2023.09.13',
    src: '國立中興大學',
    srcEn: 'National Chung Hsing University',
    no: '172',
    title: '【轉知】172-國立中興大學 辦理「2023有機農產品外銷入門－基本知識與自我評估」',
    titleEn:
      '172 – National Chung Hsing University: 2023 Introduction to exporting organic products – basics and self-assessment',
    atts: [],
  },
  {
    id: 527,
    date: '2023.09.01',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '161',
    title: '【轉知】161-農業部農糧署 辦理產銷履歷農糧產品環境補貼申請與審查作業，請依說明配合辦理',
    titleEn:
      '161 – Agriculture and Food Agency: Application and review of environmental subsidies for traceable agri-food products',
    atts: [],
  },
  {
    id: 526,
    date: '2023.08.31',
    src: '國立東華大學',
    srcEn: 'National Dong Hwa University',
    no: '160',
    title:
      '【轉知】160-國立東華大學 辦理2023有機農產品驗證稽核員培訓系列課程[課程一]稽核員專業訓練-初階班',
    titleEn:
      '160 – National Dong Hwa University: 2023 organic certification auditor training series, course 1 – basic auditor training',
    atts: [],
  },
  {
    id: 525,
    date: '2023.08.29',
    src: '台灣有機產業促進協會',
    srcEn: 'Taiwan Organic Industry Promotion Association',
    no: '157',
    title: '【轉知】157-台灣有機產業促進協會 辦理「112年度北部地區消費者有機農業教育宣導會」',
    titleEn:
      '157 – Taiwan Organic Industry Promotion Association: 2023 northern region consumer organic agriculture education seminar',
    atts: [],
  },
  {
    id: 523,
    date: '2023.08.29',
    src: '台灣有機產業促進協會',
    srcEn: 'Taiwan Organic Industry Promotion Association',
    no: '154',
    title:
      '【轉知】154-台灣有機產業促進協會 辦理「112年度宜蘭縣有機農業土壤肥培及病蟲害管理講習會」',
    titleEn:
      '154 – Taiwan Organic Industry Promotion Association: 2023 Yilan County workshop on organic soil fertility and pest management',
    atts: [],
  },
  {
    id: 522,
    date: '2023.08.21',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '151',
    title: '【轉知】151-農業部農糧署 辦理「112年度農糧類產銷履歷輔導員培訓計畫」(修訂版簡章)',
    titleEn:
      '151 – Agriculture and Food Agency: 2023 agri-food traceability advisor training program (revised brochure)',
    atts: [],
  },
  {
    id: 521,
    date: '2023.08.15',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '147',
    title:
      '【轉知】147-增列台茂奈米生化股份有限公司之「鈣植得」產品為有機農業商品化資材-病蟲草害防制資材網路公開品牌',
    titleEn:
      '147 – “鈣植得” by 台茂奈米生化股份有限公司 added to the online brand list of commercial organic farming inputs (plant pest, disease and weed control)',
    atts: [],
  },
  {
    id: 520,
    date: '2023.08.14',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '146',
    title: '【轉知】146-農業部農糧署 辦理「112年度農糧類產銷履歷輔導員培訓計畫」',
    titleEn:
      '146 – Agriculture and Food Agency: 2023 agri-food traceability advisor training program',
    atts: [],
  },
  {
    id: 519,
    date: '2023.08.10',
    src: '國立中興大學',
    srcEn: 'National Chung Hsing University',
    no: '144',
    title: '【轉知】144-國立中興大學 辦理「水產品類稽核人員進階教育訓練」',
    titleEn:
      '144 – National Chung Hsing University: Advanced training for aquatic product auditors',
    atts: [],
  },
  {
    id: 518,
    date: '2023.08.10',
    src: '國立中興大學',
    srcEn: 'National Chung Hsing University',
    no: '143',
    title: '【轉知】143-國立中興大學 辦理「畜禽產品類稽核人員進階教育訓練」',
    titleEn:
      '143 – National Chung Hsing University: Advanced training for livestock and poultry product auditors',
    atts: [],
  },
  {
    id: 517,
    date: '2023.08.10',
    src: '國立中興大學',
    srcEn: 'National Chung Hsing University',
    no: '142',
    title: '【轉知】142-國立中興大學 辦理「土壤碳匯發展現況與企業ESG國際論壇」',
    titleEn:
      '142 – National Chung Hsing University: International forum on soil carbon sinks and corporate ESG',
    atts: [],
  },
  {
    id: 516,
    date: '2023.08.04',
    src: '台灣有機產業促進協會',
    srcEn: 'Taiwan Organic Industry Promotion Association',
    no: '140',
    title: '【轉知】140-1-台灣有機產業促進協會 辦理「112年度有機農業驗證法規講習會」',
    titleEn:
      '140-1 – Taiwan Organic Industry Promotion Association: 2023 workshop on organic certification regulations',
    atts: [],
  },
  {
    id: 515,
    date: '2023.07.28',
    src: '農業部農糧署',
    srcEn: 'Agriculture and Food Agency, Ministry of Agriculture',
    no: '136',
    title:
      '【轉知】136-農業部農糧署 辦理產銷履歷補助，請農產品經營者於規定期限內使用「農糧作物產銷履歷驗證補助申請及審查系統」申請相關補助費用',
    titleEn:
      '136 – Agriculture and Food Agency: Operators must apply for traceability subsidies through the agri-food traceability certification subsidy application and review system by the deadline',
    atts: [],
  },
  {
    id: 514,
    date: '2023.07.26',
    src: '國立東華大學',
    srcEn: 'National Dong Hwa University',
    no: '132',
    title: '【轉知】132-2-國立東華大學 辦理有機農產品驗證稽核人員培訓系列課程',
    titleEn: '132-2 – National Dong Hwa University: Organic certification auditor training series',
    atts: [],
  },
]
