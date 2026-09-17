/* 由設計稿《成大智研官網.dc.html》抽出之內建資料。接上後端後可移除。 */
import type { ProcessStep } from '@/types/models'

export const stepsData: ProcessStep[] = [
  {
    n: '1',
    title: '驗證申請',
    titleEn: 'Application',
    body: '農產品經營者於驗證申請前至本公司網站下載或向本公司索取相關驗證依據資料，並加以閱讀驗證依據、了解相關法令規範、權利、義務及罰則；依申請驗證範圍檢附「驗證申請書」及備妥應檢附文件，送至「臺南市歸仁區中正南路二段15之1號 成大智研國際驗證股份有限公司收」。',
    bodyEn:
      'Before applying, operators download the certification criteria from our website or request them from us, read the criteria and understand the relevant regulations, rights, obligations and penalties. According to the scope of certification, send the application form and required documents to NCKU Intelligent Research International Certification Co., Ltd., No. 15-1, Sec. 2, Zhongzheng S. Rd., Guiren Dist., Tainan City.',
  },
  {
    n: '2',
    title: '文件審查',
    titleEn: 'Document review',
    body: '公司收件後將審查所附文件是否符合驗證基準，依據主管機關收費標準報價，並安排實地稽核及採樣。',
    bodyEn:
      'After receiving the application, we review whether the documents meet the certification criteria, provide a quote based on the fee standards set by the competent authority, and arrange the on-site audit and sampling.',
  },
  {
    n: '3',
    title: '實地稽核採樣',
    titleEn: 'On-site audit and sampling',
    body: '實地稽核前成大智研會擬定稽核計畫書，確認驗證品項、時程、稽核人天數、預計稽核場區、驗證稽核人員、採樣件數等事項供農產品經營者確認；稽核員於現場查核各項作業是否符合驗證基準，並依主管機關所定基本規範抽樣產品檢送實驗室檢測。',
    bodyEn:
      'Before the on-site audit, we prepare an audit plan covering the certified items, schedule, auditor-days, sites to be audited, auditors and number of samples for the operator to confirm. Auditors verify on site that all operations meet the certification criteria and take product samples for laboratory testing according to the basic rules set by the competent authority.',
  },
  {
    n: '4',
    title: '稽核報告提送審查',
    titleEn: 'Audit report review',
    body: '就各項審查、稽核及檢驗結果做成結論及建議，提送報告予成大智研；並指派未曾參與文件審查、實地稽核、產品抽樣檢驗之人員，審查稽核報告與相關資料之完整性及合理性。',
    bodyEn:
      'Conclusions and recommendations from the reviews, audit and test results are compiled into a report and submitted to us. Staff who took no part in the document review, on-site audit or sampling review the completeness and reasonableness of the audit report and related records.',
  },
  {
    n: '5',
    title: '驗證決定',
    titleEn: 'Certification decision',
    body: '驗證機構組成審議小組，依稽核報告內容判斷申請者符合農產品驗證基準者，通過驗證並核發農產品驗證證書；未通過驗證者，另以書面通知。',
    bodyEn:
      'A review panel decides, based on the audit report, whether the applicant meets the certification criteria. Applicants who pass are granted certification and issued a certificate; applicants who do not pass are notified in writing.',
  },
  {
    n: '6',
    title: '驗證資格維持',
    titleEn: 'Maintaining certification',
    body: '追蹤查驗：已通過驗證之農產品經營者須進行每年至少一次定期追查，必要時得增加追蹤查驗次數，方能繼續保有驗證資格。展延查驗：有機農產品、有機轉型期農產品驗證證書有效期間最長為三年，有效期間屆滿三個月前，成大智研將通知農產品經營者填具申請書申請展延；逾期申請展延者不予受理，應重新申請驗證。',
    bodyEn:
      'Surveillance: certified operators undergo at least one surveillance audit per year, with additional audits when necessary, to keep their certification. Renewal: organic and in-conversion certificates are valid for up to three years. Three months before expiry we notify the operator to apply for renewal; late renewal applications are not accepted and a new certification application is required.',
  },
]
