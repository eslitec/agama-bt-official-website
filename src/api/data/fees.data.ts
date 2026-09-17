/* 內建備援資料（搬到 Google 試算表當下的快照）：試算表讀取失敗時才使用，平常請改試算表，不用改這裡。 */
import type { FeeDoc } from '@/types/models'
import { driveFile } from '@/utils/drive'

export const feesData: FeeDoc[] = [
  {
    name: '有機農糧產品（含加工分裝流通）驗證收費',
    nameEn:
      'Fee schedule – organic agri-food products (incl. processing, packaging and distribution)',
    href: driveFile('15tTVDW-Ah7P-VjSsn4y-b2A2PXuZoMMB'),
  },
  {
    name: '產銷履歷（農糧產品、農糧加工品）驗證收費',
    nameEn: 'Fee schedule – traceable agri-food and processed agri-food products',
    href: driveFile('1OPYPfEvlj0LzA-M22uzuyy3adw_03IEr'),
  },
  {
    name: '產銷履歷（養殖水產品）驗證收費',
    nameEn: 'Fee schedule – traceable aquaculture products',
    href: driveFile('1XuXrt0gfBFcRirLT6q8Mz_pvRJKUrq7J'),
  },
  {
    name: '產銷履歷（養殖水產加工品）驗證收費',
    nameEn: 'Fee schedule – traceable processed aquaculture products',
    href: driveFile('1_O2Vhj25v_utv7v67QW0CsLvY9yADzc4'),
  },
]
