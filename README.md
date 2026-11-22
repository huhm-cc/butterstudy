# ButterStudy 🧈

上傳一篇文章,AI 幫你畫重點。

ButterStudy 是一個 AI 學習平台:上傳 **PDF / TXT / Markdown / 圖片**,網站自動擷取文字、整理章節與重點,你可以就文章內容問 AI,也能讓 AI 依據文章出練習題。學習進度、正確率與歷史紀錄都存在 [Turso](https://turso.tech),像 Duolingo 一樣追著你走。

- 線上:**https://butterstudy.vercel.app**(部署後替換為你的網域)
- AI 模型:`nvidia/nemotron-3.5-super-vl-120b-a12b`(NVIDIA NIM,OpenAI 兼容)
- 授權:MIT

## 功能

| 頁面 | 內容 |
| --- | --- |
| `/` | 公開首頁:產品介紹、運作方式、功能、即時數據 |
| `/register` `/login` | 名稱 / Email / 密碼註冊與登入(密碼 scrypt 雜湊 + HttpOnly session) |
| `/study` | 學習主頁:問候、數字條、正在讀、歷史紀錄 |
| `/study/new` | 上傳新課程:拖曳檔案或貼上文字 |
| `/study/[id]` | 閱讀器:文章 + 章節大綱/重點/結論 + 問 AI(串流)+ 練習題 |
| `/study-overview` | 總覽:已學會、已上完幾堂、優勢科目、AI 教師建議 |
| `/stats` | 公開數據:總瀏覽次數、AI 使用次數、各國比例 |

## 本地開發

```bash
cp .env.example .env.local   # 填入 NVIDIA_API_KEY 等
npm install
npm run dev                  # http://localhost:3000
```

環境變數:

| 名稱 | 說明 |
| --- | --- |
| `NVIDIA_API_KEY` | 必填。build.nvidia.com 產生的 key |
| `NVIDIA_MODEL` | 選填,預設 `nvidia/nemotron-3.5-super-vl-120b-a12b` |
| `TURSO_DATABASE_URL` | 預設 `file:./data/local.db`(本地);Turso 填 `libsql://…turso.io` |
| `TURSO_AUTH_TOKEN` | Turso 部署時必填 |
| `AUTH_SECRET` | 必填(部署)。任意 16+ 字元隨機字串 |

未設定 Turso 時自動使用本地 SQLite,開箱即可開發。

## 部署(Vercel + Turso)

1. 建 Turso 資料庫:`turso db create butterstudy`,取得 `libsql://` URL 與 token。
2. Vercel 匯入本 repo,環境變數設定 `NVIDIA_API_KEY`、`TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`AUTH_SECRET`。
3. Deploy。首次請求時自動建表(users/sessions/documents/study_sessions/quiz_attempts/events)。

## 架構

```
app/                  Next.js App Router(頁面 + API routes)
  api/auth/*          註冊/登入/登出/me
  api/ai/*            outline(整理)/chat(串流問答)/quiz(出題)
  api/extract         圖片取字(VL 模型)
  api/documents       文章 CRUD
  api/study/*         課程、進度、練習紀錄
  api/overview        總覽聚合 + AI 建議
  api/track, api/stats 瀏覽/使用事件與公開統計
components/            UI 元件(study / landing / auth / ui)
lib/                   db(Turso)、auth、nvidia、prompts、text、stats、queries
scripts/               postinstall:複製 pdfjs worker 到 public/
```

PDF 文字擷取在瀏覽器端完成(pdfjs);圖片交給 NVIDIA VL 模型辨識;密碼不落地、Key 只存在伺服器環境變數。

## 開發提示

- `npm run build` 檢查型別與建置;`npm run dev` 本地跑。
- 圖片上限約 4MB(base64 後,配合 Vercel Function 限制),上傳前已在瀏覽器壓縮到 1600px。