# AI-Mp4 製作規範（白話國際）

用程式自動生成知識科普短影音（Remotion + TypeScript）。

## 頻道設定
- 頻道名稱：白話國際
- 系列標籤：國際白話講
- 片尾 slogan：一支講透一件事
- 受眾：台灣一般散戶和上班族
- 語言：繁體中文、台灣用語，搭配英文副字幕

## 腳本寫作
- 口語白話，旁白一句 15–25 字
- 專有名詞出現時，馬上用一句話解釋
- 一幕只講一件事
- 時事題材必須上網查證，不依賴訓練資料；區分「已確定／分析預期／尚未確定」，未定者標示「截至 YYYY/M/D 尚未確定」
- 政治題材保持中立，不給投資建議（談市場用「分析師普遍認為…」）

## 影片規格
- 1080×1920、30fps、H.264 MP4
- 每幕 5–10 秒；無配音時長依中文字數估算（每秒約 5 字，再加 1 秒），資訊卡較密的幕可在 script.json 用 `durationSec` 指定
- 安全區：上下各留 220px、左右各留 64px

## 視覺設計系統
- 背景：深藍 #0B1026，加 6% 透明度細格線（每格 60px），中心有微弱的藍紫光暈
- 主色：青 #22E5D4、粉 #FF4FA3、黃 #FFD54A、紫 #8B7CFF；文字白
- 政治主題配色要中立：不用強烈的紅藍對立；需要區分兩黨時，用低飽和紅藍並列（`C.dem` / `C.rep`），並加文字標示
- 字型：Noto Sans TC、Inter（用 @remotion/google-fonts 載入）
- 圖示：一律自繪 SVG 霓虹描邊（`src/components/Icons.tsx`），stroke 3px 加外發光；不用外部圖片，不畫任何真實人物
- 卡片：圓角 20px、半透明深底、1.5px 發光邊框
- 固定元素：左上角 logo 加「白話國際」，右上角「國際白話講」膠囊
- 字幕：中文粗體 64px，關鍵詞上色；英文 28px、70% 透明度；中文每行 ≤14 字，於逗號處自動斷行，關鍵詞不拆行
- 動畫：元素淡入加上移（spring）、箭頭描線、打字機效果、數字和席次條遞增、換幕 0.3 秒淡入淡出
- 隨機效果用固定 seed

## 可重用元件（src/components/）
Background、Header、Subtitle、EndCard、TermCard、FlowRow、CompareSplit、BigNumber、SeatBar（席次條，含過半門檻線）、IconGrid、ImpactCard（含「已確定／分析預期／尚未確定」標籤）、SourceFooter

## 資料驅動
- `videos/<slug>/` 底下放：research.md、script.json（每幕的 id、旁白、中英字幕、關鍵詞、元件、參數、來源）、caption.md
- script.json 每幕：`{ id, narration, subtitle: {zh, en}, keywords, component, props, sources, durationSec? }`；頂層另有 `slug, title, asOf, cover`
- 指令：
  - `npm run still <slug>` → `out/<slug>/stills/*.png`（每幕）、`out/<slug>-cover.png`、`out/<slug>-overview.png`
  - `npm run render <slug>` → `out/<slug>.mp4`
  - `npm run fonts` → 把字型子集鏡像到 `public/fonts/`（still/render 會自動執行）。Remotion 啟動 Chrome 時帶 `--no-proxy-server`，在有 TLS 攔截代理的環境無法直連 Google Fonts，因此改讀本地鏡像；沒有鏡像時自動回退到 Google Fonts。
  - `npm run studio` 預覽
- TTS：`scripts/tts.mjs` 讀環境變數 `TTS_PROVIDER`（目前支援 `openai`，需 `OPENAI_API_KEY`）；未設定或沒有 key 時自動產出無聲版
- Chrome：預設使用 `/opt/pw-browsers` 的 headless shell，可用 `REMOTION_BROWSER` 覆寫

## 交付前檢查清單
- 數字與 research.md 來源一致；未定事項已標示
- 用詞中立、無投資建議
- 每幕截圖檢查：安全區、溢出、缺字方框
- 最後一幕是片尾卡；總長 70–100 秒；ffprobe 確認可播放
- 影片與圖片不 commit（見 .gitignore）

## 配音流程（Gemini TTS，依 ai-voiceover-explainer-video 技能）
- 順序固定：研究 → 腳本 → 逐幕 TTS → 逐字時間戳（Whisper）→ 依時間軸渲染 → ffprobe 檢查。配音是影片的時鐘，改稿就要從 TTS 重跑。
- `videos/<slug>/` 另放 script.md、pronunciation.md（念稿規則）、voice.md（音色設定與候選比較表）、visual-spec.md（可執行的畫面規格）
- script.json 頂層 `voice: { voiceName, candidates?, style? }`；每幕可加 `tts`（念稿版，數字、縮寫改成唸法）
- `npm run validate <slug>` 先檢查結構、字數、元件 props、總長估算，0 error 才進 TTS
- Gemini 金鑰存在雲端環境的網路秘密（主機 generativelanguage.googleapis.com，標頭 x-goog-api-key），由代理自動注入；程式碼和 repo 裡不放金鑰

## 停工線（額度保護）
- 以台灣時間（Asia/Taipei）為準，**07:00 是停工線**。每個耗時步驟（研究工作流、TTS 批次、render）開始前先執行 `TZ=Asia/Taipei date`。
- 若已超過 07:00：不開始新的耗時步驟；正在進行的 render 可讓它跑完但不再排下一支；把進度（已完成哪幾幕／哪一步）commit 並回報，等使用者再指示。
- 每完成一支影片就先給使用者看（截圖總覽＋ MP4 路徑），再做下一支。
