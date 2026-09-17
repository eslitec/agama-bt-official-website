/* 由設計稿抽出之內建資料。 */

/** 註冊表單「擬申請驗證類別」 */
export const registerCategoriesData: string[] = [
  '有機作物',
  '有機加工、分裝及流通',
  '產銷履歷農糧產品',
  '產銷履歷農糧加工品',
  '產銷履歷養殖水產品',
  '產銷履歷養殖水產加工品',
]

/**
 * 類別的英文顯示名稱（key 為上方中文值）。英文介面有對照時顯示英文，
 * 送出的值一律是中文；沒有對照的類別顯示中文。
 */
export const registerCategoryLabelsEn: Record<string, string> = {
  有機作物: 'Organic crops',
  '有機加工、分裝及流通': 'Organic processing, packaging and distribution',
  產銷履歷農糧產品: 'Traceable agri-food products',
  產銷履歷農糧加工品: 'Traceable processed agri-food products',
  產銷履歷養殖水產品: 'Traceable aquaculture products',
  產銷履歷養殖水產加工品: 'Traceable processed aquaculture products',
}
