# CLAUDE.md — 白話國際 短影音製作規範

> 之後只要說「照 CLAUDE.md 做一支主題是 ○○ 的片」，就照本文件同一套流程執行（全自動：研究 → 腳本 → 配音 → render → 品質檢查 → commit）。

## 頻道設定
- 頻道名稱：白話國際
- 系列標籤：國際白話講
- 片尾 slogan：一支講透一件事
- 受眾：台灣一般散戶和上班族
- 語言：繁體中文，搭配英文副字幕

## 爆款公式
1. 開場用「困惑式問題」：第一句就讓觀眾覺得「對耶，我也想知道」
2. 從觀眾的生活切入：先講跟台灣人有什麼關係，再講原理
3. 一幕只講一件事：一句旁白配一張圖解，重點用框選、圈選、箭頭標出
4. 專有名詞馬上白話解釋
5. 看完有收穫：最後給一句可以轉述給朋友的總結
6. 文案附資料來源，加上 AI 輔助製作聲明

## 內容原則
- 研究必須上網查證最新可靠來源（AP、Reuters、BBC、NPR、中央社等），不依賴訓練資料；整理成 `videos/<slug>/research.md`，附連結與查詢日期
- 每個論點標註確定度：「已確定」「分析預期」「尚未確定」；未確定者寫「截至 YYYY/MM/DD 尚未確定」，不自行推測
- 政治中立：不站任何政黨立場、不用帶情緒的詞，兩黨說法平衡
- 不給投資建議；談市場用「分析師普遍認為…」
- 口語白話、台灣用語，旁白一句 15–25 字；字幕單行 ≤ 14 個全形字（過長在逗號處自動換行）

## 影片規格
- 1080×1920、30fps、H.264 MP4（yuv420p）
- 每幕 5–10 秒，總長依主題（新聞題 80–100 秒）
- 安全區：上下各留 220px、左右各留 64px
  - Header：y≈224–300；內容區：y 330–1334；來源小字：y≈1334；字幕底板：y 1370–1700

## 視覺風格：藍圖工程圖（Blueprint）
- 背景：#0E2A5C → #0A1F45 漸層；細格線白 8%、每格 40px；每 5 格粗線白 15%
- 線稿：白 #FFFFFF、stroke 2.5px；技術製圖感：外框、剖面線、尺寸標註線
- 重點色：黃 #FFC83D（關鍵字、框選）、青 #5EE6FF（次要標註）
- 兩黨區分：低飽和紅 #E07A7A、藍 #7AA8E0 並列並加文字標示；不做強烈紅藍對立
- 外框：畫面內縮白色細框，四角十字對位標記
- 標註：虛線引出線 + 小標籤卡
- 字型：Noto Sans TC（中文粗體）、JetBrains Mono（英文、標籤）。字型資訊來自 `@remotion/google-fonts`，由 `scripts/fonts.mjs` 預先下載到 `public/fonts/`（gitignore）再以 FontFace 載入，避免渲染時大量網路請求
- 圖示：一律自繪 SVG 線稿（`src/components/icons.tsx`：國會大廈、投票箱、天秤、晶片、貨櫃船、地球、台灣輪廓、股價線、盾牌、白宮）；不用外部圖片、不畫真實人物
- 固定元素：左上 logo +「白話國際」；右上「國際白話講」膠囊標籤
- 字幕區：下方半透明深藍底板，上緣白色細線；中文粗體 64px（關鍵詞黃色）；英文 JetBrains Mono 28px、70% 透明度；底部工程刻度線
- 動畫：線稿 stroke-dashoffset 描線；引出線延伸後標籤彈出；黃框/圓圈帶脈衝；數字與席次條遞增；標籤、輸入框打字機；每幕緩慢推鏡（局部放大）；換幕 0.3 秒淡入淡出；曲線用 spring
- 隨機效果使用固定 seed（`src/anim.ts` 的 `seeded`，BGM 也用固定 seed）

## 可重用元件（src/components/）
BlueprintBackground、Header、Subtitle、EndCard、TermCard、CompareSplit、SeatBar、BigNumber、FlowRow、Callout、HighlightBox、ImpactCard、SourceFooter，另有 SceneTitle、CertTag、icons。
各幕版型在 `src/scenes/Scenes.tsx`（Hook、Term、Compare、Seats、Divided、Impact、Tariff、Chip、Taiwan、Market、Summary、End），由 script.json 的 `component` 指定；新主題可新增版型，但沿用元件與風格。

## 資料驅動
- `videos/<slug>/`：`research.md`、`script.json`、`caption.md`
- `script.json` 每幕欄位：`id`、`narration`（旁白）、`subtitle_zh`、`subtitle_en`、`keywords`、`component`、`props`（參數）、`sources`（來源）、`certainty`（確定度）
- 時長：有配音 → 音檔長度 + 0.4 秒；無配音 → 字幕字數 ÷ 5 + 1 秒（夾在 5–10 秒）

## 指令
```bash
npm install
node scripts/tts.mjs <slug>     # 有 AZURE_TTS_KEY（zh-TW-HsiaoChenNeural）或 ELEVENLABS_API_KEY 才會產生配音
npm run still <slug>            # 每幕截圖 out/<slug>/stills/、總覽 out/<slug>-overview.png、封面
npm run render <slug>           # 完整影片 out/<slug>.mp4（含 -20dB 合成 lo-fi BGM）+ 封面 out/<slug>-cover.png
npm run typecheck
```
- 瀏覽器：預設使用 `/opt/pw-browsers/chromium`，可用 `REMOTION_BROWSER` 覆寫
- 新影片：在 `src/Root.tsx` 的預設 import 可換成新 slug（render/still 會以 inputProps 傳入指定 slug 的 script.json）

## 交付物
- `out/<slug>.mp4`、`out/<slug>-cover.png`（大字問句 + 主視覺）、`out/<slug>-overview.png`
- `videos/<slug>/caption.md`：開場鉤子、3–5 段白話重點、資料來源連結、「本片使用 AI 輔助製作，由真人選題與審核。」、一句英文摘要、6–8 個 hashtag

## 品質檢查（全部通過才算完成）
- 數字與結果和 research.md 來源一致；尚未確定的部分有標示
- 用詞政治中立、無投資建議
- 字幕在安全區內，中文無缺字或方框（檢查每幕截圖）
- 全片風格一致，最後一幕是片尾卡
- 影片可正常播放，長度符合規格（ffprobe 檢查）

## Git
- commit 程式碼、CLAUDE.md、research.md、script.json、caption.md
- 不 commit：node_modules/、out/、*.mp4、*.mp3、*.wav、.env、public/fonts/
