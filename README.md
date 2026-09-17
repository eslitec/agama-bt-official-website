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
| `VITE_LEGACY_SITE_URL` | 仍放在原站的內容（第 123 則公告圖片、會員專區）根網址，預設 `https://agama-bt.com.tw`。搬家時改這一個值即可 |
| `VITE_DEMO_MEMBER` | 未接後端時是否開放**示範**登入／註冊。`npm run dev` 一律開放並顯示「示範模式」提示；正式環境預設關閉，會顯示「線上會員系統尚未開放」 |
| `VITE_NOINDEX` | 設為 `true` 時整站不讓搜尋引擎收錄（robots.txt 全擋、頁面加 noindex、Netlify 加 `X-Robots-Tag`）。**未設定 `VITE_SITE_URL` 時也會自動不收錄**；Netlify 的預覽部署與分支部署由 `netlify.toml` 固定設為 `true` |

## 部署

### Netlify（建議）

專案根目錄的 `netlify.toml` 已設定好 Build command（`npm run build`）、Publish directory（`dist`）、Node 22、單頁應用轉址與快取標頭，後台連 GitHub 或拖曳上傳即可。

1. **環境變數**（Site configuration → Environment variables）：
   - `VITE_SITE_URL`：正式網址（例如 `https://www.example.com.tw`）。**只是給客戶看的預覽站就不要設**，會自動不讓搜尋引擎收錄。
   - `VITE_DEMO_MEMBER`：給客戶試用示範登入設 `true`，正式上線設 `false`。
   - `VITE_LEGACY_SITE_URL`：舊站關閉前把公告圖片搬家後再設定。
2. **意見反應表單（Netlify Forms）**：
   - 第一次部署前到 **Forms → Enable form detection** 開啟表單偵測，開啟後要**重新部署一次**才會偵測到 `contact` 表單。
   - 到 **Forms → Form notifications** 設定收件 Email。
   - 送出的資料在 Netlify 後台 Forms 頁面查看；表單含 honeypot 防機器人欄位，Netlify 也會自動過濾垃圾訊息。
   - 免費方案每月送出數量有上限，量大時請查 Netlify 方案。
   - 偵測用的靜態表單在 `public/forms/contact.html`，欄位要和 `src/api/modules/contact.ts` 的 `CONTACT_FIELDS` 一致（`tests/unit/contact.spec.ts` 會檢查）。
   - `npm run dev` 時只模擬送出；部署到 Netlify 以外的主機時表單會送出失敗，需改接後端（設定 `VITE_API_BASE_URL` 後改 POST `/contact`）。

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
| `/login`、`/register` | 會員登入、新業者註冊（已登入時自動導回首頁） |
| `/contact` | 意見反應表單（Netlify Forms；`?topic=member` 等可預選類別） |
| `/privacy` | 個人資料蒐集、處理及利用告知聲明 |

## 目錄

```
build/            Vite 外掛：sitemap／robots、字型只留 woff2
deploy/           Nginx 設定範例
src/
  api/            http.ts（Axios 實例）、modules/（各資源 API）、data/（設計稿抽出的內建資料，動態載入）
  assets/         主視覺影片與底圖
  components/     layout/（頂部列、頁首、頁尾）、common/（共用元件、表單欄位）
  composables/    useAsyncData、useFormErrors、useQueryParam、useCountUp、useScrollProgress
  directives/     v-reveal 進場動畫
  i18n/           語系檔（含隱私權聲明、表單驗證訊息、SEO 描述）
  router/         路由、頁面 meta、登入導向
  stores/         auth（記住此裝置）、preferences（語系）
  styles/         tokens、mixins、base、字型
  utils/          驗證、篩選、分頁、SEO、原站網址
  views/          各頁面
tests/unit/       Vitest 單元測試
```

## 設計稿對應與調整

- 設計稿以 `state.page` 切換的單頁 → 具名路由＋404。
- AOS＋GSAP ScrollTrigger → 原生 IntersectionObserver：`v-reveal`、`useCountUp`、`useScrollProgress`，皆尊重 `prefers-reduced-motion`。
- 頁首依可用寬度自動切換 full／dense／tight／compact 四種密度，放不下時收合為「選單」按鈕。
- 手機版主視覺影片只鋪在文案區，查詢卡片移到影片下方；數據卡平板與手機為 2×2；消息分頁以省略號收合。
- 搜尋關鍵字寫在網址 `?q=`，可分享、重新整理後保留。
- 註冊表單有完整欄位檢查（統編／身分證檢查碼、電話、Email、密碼強度）與個資告知同意。

## 上線前需要客戶確認

- **公司地址**：消息中有「本公司變更營業登記地址及辦公室」公告，但全站地址仍為歸仁區中正南路二段 15 之 1 號。地址集中在 `src/i18n/locales/*.ts` 的 `site.address`，改一處即可。
- **隱私權聲明**：`/privacy` 內容依個資法第 8 條撰寫的範本，特定目的代號與保存期間需由公司個資管理人員或法務確認。
- **會員系統**：登入／註冊需要後端 API；未接之前正式環境會顯示「尚未開放」。
- **消息內容**：155 則中只有 12 則有附件或圖片，其餘只有標題，需要補內文或附件。
- **下載檔案**：34 個申請書、表單與收費文件放在 Google 雲端硬碟「成大智研官網下載檔案」資料夾（`src/utils/drive.ts`），網站連結用檔案 ID 直接下載。更新檔案請在雲端硬碟對原檔「管理版本 → 上傳新版本」，ID 不變、網站不用改；刪掉重傳會換 ID，要改 `downloads.data.ts`／`fees.data.ts`。目前放在個人帳號，正式上線建議改放公司帳號（換帳號重新上傳會換 ID，需同步更新連結）。
- **原站內容**：第 123 則公告圖片、會員專區仍在 `agama-bt.com.tw`，搬家後設定 `VITE_LEGACY_SITE_URL`。
- **主視覺與底圖**：目前取自同一支影片的畫面，取得實拍照片後替換 `src/assets/images/` 內同名檔。
- **產銷履歷申請須知**：設計稿標示為整理中，目前顯示空狀態。
- **英文版**：只翻譯介面，消息、文件等內容為中文，英文介面瀏覽這些頁面時會顯示提示。
- **SEO**：已有每頁標題／描述、canonical、OG、sitemap、robots；網站仍是單頁應用，若需要更好的搜尋收錄，可再評估預先渲染（prerender／SSG）。
