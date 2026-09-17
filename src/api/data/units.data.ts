/* 由設計稿《成大智研官網.dc.html》抽出之內建資料。接上後端後可移除。 */
import type { CertUnit } from '@/types/models'

export const unitsData: CertUnit[] = [
  {
    cid: 9,
    name: '產銷履歷農糧產品',
    desc: '生產、分裝流通',
    icon: 'agriculture',
    color: '#06717A',
    portal: '產銷履歷農產品資訊網',
    portalUrl: 'https://taft.moa.gov.tw',
  },
  {
    cid: 1,
    name: '有機作物',
    desc: '有機田區與栽培作物',
    icon: 'eco',
    color: '#06717A',
    portal: '臺灣有機農業資訊網',
    portalUrl: 'https://epv.afa.gov.tw',
  },
  {
    cid: 6,
    name: '產銷履歷農糧加工品',
    desc: '加工廠與產品配方',
    icon: 'factory',
    color: '#0E6F78',
    portal: '產銷履歷農產品資訊網',
    portalUrl: 'https://taft.moa.gov.tw',
  },
  {
    cid: 2,
    name: '有機加工、分裝及流通',
    desc: '加工、分裝與販運',
    icon: 'inventory_2',
    color: '#0E6F78',
    portal: '臺灣有機農業資訊網',
    portalUrl: 'https://epv.afa.gov.tw',
  },
  {
    cid: 7,
    name: '產銷履歷養殖水產品',
    desc: '魚塭與養殖場',
    icon: 'set_meal',
    color: '#155A78',
    portal: '產銷履歷農產品資訊網',
    portalUrl: 'https://taft.moa.gov.tw',
  },
  {
    cid: 8,
    name: '產銷履歷養殖水產加工品',
    desc: '水產加工廠製程',
    icon: 'fact_check',
    color: '#155A78',
    portal: '產銷履歷農產品資訊網',
    portalUrl: 'https://taft.moa.gov.tw',
  },
]
