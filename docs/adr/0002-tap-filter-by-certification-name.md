# 產銷履歷資料以 CertificationName 參數在伺服器端過濾

產銷履歷開放資料集約 850 萬筆、每筆約 5 KB，`$skip` 的成本隨 offset 線性增加，全量掃描推算要 14 小時以上、30 GB 以上，在 Apps Script 的 6 分鐘執行上限與 50 MB 回應上限下不可行。實測發現這支 API 雖然不吃 OData 的 `$filter`，卻接受純 query string 參數 `CertificationName`（以及 `OrgID`、`PackDate`、`Tracecode`），伺服器端就會過濾，一次請求 2.6 MB、約 1 秒即可取得本公司最新 1000 筆。因此同步策略定為：每日以 `CertificationName` 取最新一批做增量、上線前以分批方式做一次歷史回填並只保留去重後的業者清單。
