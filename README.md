# 成大智研國際驗證 官網前端

依 Claude Design 設計稿《成大智研官網.dc.html》實作的官網前端。設計稿原始檔（由離線版解包）放在 `../design/`。

## 技術

Vite 6、Vue 3（`<script setup>` + TypeScript）、Pug 模板、Vue Router 4、Pinia（含 persistedstate）、手刻 SCSS／BEM、Axios、vue-i18n（zh-TW／en）、@vueuse/core、ESLint＋Prettier、Vitest。未使用 UI 元件庫。

字型以 @fontsource 自架（只打包 woff2），圖示使用 Material Symbols Rounded 的 SVG（只打包用到的圖示），不依賴 Google Fonts。

## 指令

```bash
npm install
npm run dev         # 開發伺服器（或雙擊 start-dev.bat）
npm run build       # 型別檢查 + 打包到 dist/（含 robots.txt、sitemap.xml）
npm run preview     # 預覽打包結果
npm run lint        # ESLint（含 Pug 模板）
npm run format      # Prettier（含 Pug 模板）
npm run test        # Vitest
```

需要 Node.js 20.19 以上。

## 環境變數

複製 `.env.example` 為 `.env.production`（正式）或 `.env.local`（本機）後修改：

| 變數 | 說明 |
| --- | --- |
| `VITE_SITE_URL` | 網站正式網址。產生 `sitemap.xml`、canonical 與社群分享網址；未設定時只產生 `robots.txt` |
| `VITE_API_BASE_URL` | 後端 API 根路徑。設定後 `src/api/modules/*` 改走 Axios；未設定時使用 `src/api/data/*` 內建資料 |
| `VITE_LEGACY_SITE_URL` | 仍放在原站的內容（第 123 則公告內建備援圖片）根網址，預設 `https://agama-bt.com.tw`。搬家時改這一個值即可 |
| `VITE_ADMIN_API_URL` | 管理者後台 API：`apps-script/admin-api.gs` 部署成網頁應用程式後的 `…/exec` 網址（見「管理者後台」）。`npm run dev` 未設定時使用模擬後台；正式環境未設定時登入頁顯示「後台尚未設定」並停用表單 |
| `VITE_NOINDEX` | 設為 `true` 時整站不讓搜尋引擎收錄（robots.txt 全擋、頁面加 noindex、Netlify 加 `X-Robots-Tag`）。**未設定 `VITE_SITE_URL` 時也會自動不收錄**；Netlify 的預覽部署與分支部署由 `netlify.toml` 固定設為 `true` |
| `VITE_CONTENT_SHEET_KEY` | 內容試算表「發布到網路」的金鑰（網址 `/d/e/` 後的 `2PACX-…`）。**不用設定**，程式內已有預設值（`src/config/content-sheet.ts`）；換試算表時才設定，設為 `off` 只用內建資料 |

## 內容更新（Google 試算表）

最新消息、資料下載、首頁常用下載、收費文件、農場簡介由 Google 試算表「成大智研官網內容」維護，**改完不用重新部署**：

- 試算表：<https://docs.google.com/spreadsheets/d/1I2qpT_Vs0iHJmx46TZGkDwvhLMzi4IFY9O379vbnpmE/edit>（第一個工作表「使用說明」寫了各欄位填法）。
- 網站開啟時讀取各工作表「發布到網路」的 CSV（`src/api/sheet.ts`、欄位轉換在 `src/api/sheet-mappers.ts`），同一次瀏覽快取 5 分鐘；Google 發布本身也有快取，修改後約 5 分鐘內生效。
- 讀取失敗（Google 暫時連不上）時自動改用 `src/api/data/*.data.ts` 的內建備援資料，頁面不會空白；備援資料是搬移當下的快照，不會自動更新。
- 工作表以 gid 讀取：可以改名，**不能刪除重建**；第 1 列欄位名稱不能改。
- 英文欄位（選填，欄名用全形括號）：最新消息「標題（英文）」「來源機關（英文）」、資料下載「分類名稱（英文）」（同一分類填一列即可）「檔名（英文）」、首頁常用下載「檔名（英文）」、收費文件「名稱（英文）」、農場簡介「名稱（英文）」「縣市（英文）」「地址（英文）」。英文介面有填時顯示英文，空白時顯示中文（`src/composables/useLocalized.ts`）；附件名稱依 `attachmentLabelEn` 對照表自動翻譯。
- 檔案連結可直接貼雲端硬碟分享連結，會自動轉成直接下載；「顯示」填 N 可下架。
- 試算表是公開可讀的，不能放不可公開的資料；編輯權限只分享給負責更新的同事。
- 建置時 `sitemap.xml` 的消息網址也從試算表讀取（讀不到改用內建資料）。
- 最新消息也可以由管理者登入網站後台編輯（見下一節），兩種方式改的是同一張工作表。
- `tests/fixtures/sheet-*.csv` 是搬移當下從試算表下載的 CSV（與 Google 輸出逐位元組相同），`tests/unit/sheet.spec.ts` 用來確認轉換結果與內建資料一致。

## 管理者後台

網站管理者登入 `/login` 後，可以在 `/admin/news` 新增、修改、刪除最新消息，在 `/admin/account` 修改密碼與管理其他管理者帳號。一般訪客不需要登入，入口只放在頁尾「管理者登入」。

- **可以編輯的欄位**：日期、來源機關（含英文）、公告編號、標題（含英文）、附件（名稱＋網址，可多筆）、圖片網址（可多筆）、是否在網站顯示。不提供檔案上傳：檔案請先放到雲端硬碟，再貼分享連結。
- **更新時間**：儲存後立即寫入內容試算表，但公開網站讀的是「發布到網路」的 CSV，Google 有快取，**約 5 分鐘內**才會看到變更（管理者自己的瀏覽器會清掉本機快取，但仍受 Google 快取影響）。
- **後端**：`apps-script/admin-api.gs`（Google Apps Script 網頁應用程式）。帳號密碼以 salt＋SHA-256 雜湊存在指令碼屬性（不在公開的試算表裡）；登入後取得 8 小時有效的簽章權杖，每個請求都要帶權杖；同一帳號連續登入失敗 5 次鎖定 15 分鐘；寫入時加鎖避免同時儲存互相覆蓋。
- **前端**：`src/api/modules/admin.ts`（一律以 `Content-Type: text/plain` POST，避免 Apps Script 無法回應的 CORS 預檢）、`src/stores/auth.ts`（權杖；勾選「記住此裝置」存 localStorage，否則存 sessionStorage，權杖到期自動登出）、`src/views/admin/*`。
- **開發模式**：`npm run dev` 且未設定 `VITE_ADMIN_API_URL` 時使用 `src/api/admin-mock.ts` 模擬後台（帳號 `admin`／密碼 `admin12345`，資料只在記憶體，重新整理後還原），行為與錯誤訊息與正式後台相同。

### 部署 Apps Script（第一次）

1. 開啟內容試算表 → **擴充功能 → Apps Script**（或以同一個 Google 帳號到 <https://script.google.com> 新增專案），把 `apps-script/admin-api.gs` 的內容貼到 `程式碼.gs` 並儲存。`SPREADSHEET_ID`、`NEWS_GID` 已對應目前的試算表；換試算表時要一起改。
2. **部署 → 新增部署作業** → 類型選「網頁應用程式」→ 執行身分「**我**」、存取權「**所有人**」→ 部署，依提示授權（需要讀寫試算表的權限）。
3. 複製部署後的網址（結尾是 `/exec`），填到 `netlify.toml` 的 `VITE_ADMIN_API_URL`（目前已填好現用的部署網址；這裡的值會蓋過 Netlify 後台設定的同名變數），然後**重新部署網站**（環境變數是建置時寫入的）。
4. **初次設定**：回到 Apps Script 編輯器，上方函式選 `createSetupCode` → 執行，在「執行記錄」看到 12 碼設定碼（30 分鐘內有效、只能用一次）。到網站 `/login`，頁面會自動切換成「初次設定」，輸入設定碼與第一位管理者的帳號（3–32 個英數字，可含 `. _ -`）和密碼（至少 10 個字元，需同時有英文字母與數字）。
5. 之後的管理者由已登入的管理者在「帳號設定」新增。忘記密碼時請其他管理者刪除後重新新增；只剩一位管理者又忘記密碼時，到 Apps Script **專案設定 → 指令碼屬性**刪除 `ADMINS`，再重做第 4 步。

修改 `admin-api.gs` 後要到 **部署 → 管理部署作業 → 編輯 → 版本選「新版本」** 才會生效（網址不變）；如果改成「新增部署作業」會得到新網址，需更新 `VITE_ADMIN_API_URL`。

## 部署

### Netlify（建議）

專案根目錄的 `netlify.toml` 已設定好 Build command（`npm run build`）、Publish directory（`dist`）、Node 22、單頁應用轉址與快取標頭，後台連 GitHub 或拖曳上傳即可。

1. **環境變數**（Site configuration → Environment variables）：
   - `VITE_SITE_URL`：正式網址（例如 `https://www.example.com.tw`）。**只是給客戶看的預覽站就不要設**，會自動不讓搜尋引擎收錄。
   - `VITE_ADMIN_API_URL`：Apps Script 後台網址（見「管理者後台」）。`netlify.toml` 已填好，換部署網址時才需要改。
   - `VITE_LEGACY_SITE_URL`：舊站關閉前把公告圖片搬家後再設定。
2. **意見反應表單（Netlify Forms）**：
   - 第一次部署前到 **Forms → Enable form detection** 開啟表單偵測，開啟後要**重新部署一次**才會偵測到 `contact` 表單。
   - 到 **Forms → Form notifications** 設定收件 Email。
   - 送出的資料在 Netlify 後台 Forms 頁面查看；表單含 honeypot 防機器人欄位，Netlify 也會自動過濾垃圾訊息。
   - 免費方案每月送出數量有上限，量大時請查 Netlify 方案。
   - 偵測用的靜態表單在 `public/forms/contact.html`，欄位要和 `src/api/modules/contact.ts` 的 `CONTACT_FIELDS` 一致（`tests/unit/contact.spec.ts` 會檢查）。
   - `npm run dev` 時只模擬送出；部署到 Netlify 以外的主機時表單會送出失敗，需改接後端（設定 `VITE_API_BASE_URL` 後改 POST `/contact`）。

### GitHub Pages

repo：<https://github.com/eslitec/agama-bt-official-website>，網址：<https://eslitec.github.io/agama-bt-official-website/>。

- `.github/workflows/deploy-pages.yml`：推送到 `main`（或在 Actions 頁手動執行）時自動跑單元測試、建置並部署。
- **第一次**：repo 的 **Settings → Pages → Build and deployment → Source** 選「**GitHub Actions**」，再到 **Actions** 重新執行一次失敗的部署。私人 repo 要開 Pages 需要組織是付費方案，否則 repo 要改公開。
- 網址在子路徑 `/<repo 名稱>/`，建置時由 `VITE_BASE` 設定根路徑（workflow 已自動帶入）。之後改用自訂網域時，把 `VITE_BASE` 改成 `/`。
- GitHub Pages 沒有轉址設定，建置時輸出一份與 `index.html` 相同的 `404.html`，直接開啟 `/news/712` 等網址或重新整理都能正常顯示（HTTP 狀態碼會是 404，瀏覽器顯示不受影響）。
- 管理者後台 API 網址寫在 workflow 的 `VITE_ADMIN_API_URL`；正式網址確定後，在 repo **Settings → Secrets and variables → Actions → Variables** 新增 `VITE_SITE_URL` 才會開始讓搜尋引擎收錄。
- **限制**：「意見反應」表單使用 Netlify Forms，放在 GitHub Pages 時**送不出去**（需改接其他收件方式）。
- 本機推送：雙擊 `push-github.bat`（需安裝 Git for Windows；第一次會跳出 GitHub 登入視窗）。

### 其他主機

使用 History 模式網址（例如 `/news/712`），伺服器必須把找不到實體檔案的路徑導回 `index.html`，否則重新整理會 404：

- **Apache**：`public/.htaccess` 會一起打包到 `dist/`，直接可用。
- **IIS**：`public/web.config` 會一起打包（需安裝 URL Rewrite 模組）。
- **Nginx**：參考 `deploy/nginx.conf`。

## 路由

| 路徑 | 頁面 |
| --- | --- |
| `/` | 首頁 |
| `/about` | 成大智研 |
| `/how`（`?tab=traceable`） | 驗證申請須知 |
| `/fee` | 驗證費用 |
| `/units`（`?q=`）、`/units/:cid` | 通過驗證單位、類別名單查詢方式 |
| `/download` | 資料下載 |
| `/news`（`?q=&page=`）、`/news/:id` | 最新消息、消息內容 |
| `/farms`（`?q=`） | 農場簡介 |
| `/links` | 相關連結 |
| `/contact` | 意見反應表單（Netlify Forms；`?topic=apply` 等可預選類別） |
| `/privacy` | 個人資料蒐集、處理及利用告知聲明 |
| `/login` | 管理者登入；尚無管理者時顯示「初次設定」（已登入時導向後台；不收錄） |
| `/admin` | 轉到 `/admin/news` |
| `/admin/news`、`/admin/news/new`、`/admin/news/:id` | 後台：最新消息列表、新增、編輯（需登入；不收錄） |
| `/admin/account` | 後台：修改密碼、管理者帳號（需登入；不收錄） |

## 目錄

```
apps-script/      管理者後台 API（Google Apps Script，部署方式見「管理者後台」）
build/            Vite 外掛：sitemap／robots、字型只留 woff2
deploy/           Nginx 設定範例
src/
  api/            http.ts（Axios 實例）、modules/（各資源 API，admin.ts 為後台）、admin-mock.ts（開發用模擬後台）、data/（內建備援資料，動態載入）
  assets/         主視覺影片與底圖
  components/     layout/（頂部列、頁首、頁尾）、common/（共用元件、表單欄位）、admin/（確認對話框）
  composables/    useAsyncData、useFormErrors、useQueryParam、useCountUp、useScrollProgress、useAdmin（後台請求與錯誤訊息）
  directives/     v-reveal 進場動畫
  i18n/           語系檔（含隱私權聲明、表單驗證訊息、SEO 描述）
  router/         路由、頁面 meta、後台登入守衛
  stores/         auth（管理者權杖、記住此裝置）、adminNews（後台消息暫存）、preferences（語系）
  styles/         tokens、mixins、base、字型
  utils/          驗證、篩選、分頁、SEO、原站網址
  views/          各頁面；admin/ 為後台頁面
tests/unit/       Vitest 單元測試
```

## 設計稿對應與調整

- 設計稿以 `state.page` 切換的單頁 → 具名路由＋404。
- AOS＋GSAP ScrollTrigger → 原生 IntersectionObserver：`v-reveal`、`useCountUp`、`useScrollProgress`，皆尊重 `prefers-reduced-motion`。
- 頁首依可用寬度自動切換 full／dense／tight／compact 四種密度，放不下時收合為「選單」按鈕。
- 手機版主視覺影片只鋪在文案區，查詢卡片移到影片下方；數據卡平板與手機為 2×2；消息分頁以省略號收合。
- 搜尋關鍵字寫在網址 `?q=`，可分享、重新整理後保留。
- 設計稿的會員登入／新業者註冊不實作；登入改為網站管理者使用的後台，首頁原「會員專區」卡片改為「如何申請驗證」。

## 上線前需要客戶確認

- **公司地址**：消息中有「本公司變更營業登記地址及辦公室」公告，但全站地址仍為歸仁區中正南路二段 15 之 1 號。地址集中在 `src/i18n/locales/*.ts` 的 `site.address`，改一處即可。
- **隱私權聲明**：`/privacy` 內容依個資法第 8 條撰寫的範本，特定目的代號與保存期間需由公司個資管理人員或法務確認。
- **管理者後台**：需依「管理者後台」一節部署 Apps Script 並設定 `VITE_ADMIN_API_URL`，再完成初次設定；建議由公司帳號部署。
- **消息內容**：155 則中只有 12 則有附件或圖片，其餘只有標題，需要補內文或附件。
- **下載檔案**：34 個申請書、表單與收費文件放在 Google 雲端硬碟「成大智研官網下載檔案」資料夾，連結填在內容試算表。更新檔案請在雲端硬碟對原檔「管理版本 → 上傳新版本」，連結不變；新增或重傳的檔案把分享連結貼到試算表即可。目前放在個人帳號，正式上線建議改放公司帳號（換帳號重新上傳會換 ID，需同步更新連結）。
- **原站內容**：第 123 則公告的 4 張圖片仍在 `agama-bt.com.tw`（網址在試算表「最新消息 → 圖片」，搬家後直接改，或在後台編輯該則消息）。
- **內容試算表帳號**：試算表與下載檔目前在個人 Google 帳號，正式上線建議移到公司帳號並重新發布（金鑰會變，需設定 `VITE_CONTENT_SHEET_KEY` 或更新 `src/config/content-sheet.ts`）。
- **主視覺與底圖**：目前取自同一支影片的畫面，取得實拍照片後替換 `src/assets/images/` 內同名檔。
- **產銷履歷申請須知**：設計稿標示為整理中，目前顯示空狀態。
- **英文版**：介面與內容（消息標題與來源、下載檔名、收費文件、農場、驗證類別、流程、相關連結）皆有英文，為 Claude 翻譯的參考譯文，**需請客戶校閱**；公司、品牌與產品名稱保留中文原文以免譯名錯誤。下載的文件本身仍是中文，英文介面會顯示「中文版為準」提示。試算表新增資料時，「（英文）」欄位空白就會顯示中文。
- **SEO**：已有每頁標題／描述、canonical、OG、sitemap、robots；網站仍是單頁應用，若需要更好的搜尋收錄，可再評估預先渲染（prerender／SSG）。
