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
- 片長：`styleVersion: 2` 新片總長 45–75 秒；鉤子幕與 CTA 幕可短到 3 秒，其他幕仍 5–10 秒。v1 舊片（沒有 styleVersion）維持總長 70–100 秒
- 安全區：上下各留 220px、左右各留 64px

## 視覺設計系統
以下是 v1（舊片，沒有 styleVersion）的規範；`styleVersion: 2` 改用下一節「A 奶油編輯」。
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

## styleVersion 2（A 奶油編輯）
- token 全部在 `src/theme.ts` 的 `THEME_V2`（顏色、陰影、圓角、狀態標籤、關鍵詞色序）與 `LAYOUT_V2`（格線、尺寸下限、空白帶上限、水印）；v2 元件在 `src/components/v2/`，**元件裡不寫死色碼、不用霓虹 glow**，換主題只改 theme.ts。設計理由與樣稿：`docs/style-v2/`；版面規則：`docs/layout-rules.md`。
- 色彩：背景米白 `#FBF5EA`＋4% 海軍藍圓點紙紋（預渲染 `public/bg/base-v2.png`）；主文字 `#14213D`、次要 `#4B5675`、輔助 `#5F6673`；強調：珊瑚 `#E8613C`（文字 `#C2441F`）、暖黃 `#F5B83D`（文字 `#8A5E00`）、深青 `#2A7F8F`（文字 `#1F6A78`）；script.json 仍寫 cyan／pink／yellow／purple，v2 對應到深青／珊瑚／暖黃／灰紫。
- 狀態標籤淡底深字：已確定 `#E2F0E7/#1E6544`、分析預期 `#FCEBCB/#8A5300`、尚未確定 `#ECE7F3/#5A4D7A`，圓角 8px。
- 卡片：暖白 `#FFFDF8`、2px `#E6D9C2` 邊框、圓角 14px、紙張陰影（不發光），頂端 6px 色條；圖示＝海軍藍方角線稿＋錯位色塊（套印風），不發光。
- 版面格線（1080×1920）：頁首 220–310（下方 4px 報頭線兼全片進度）｜主視覺 330–1250（撐滿 952 寬，≥856×814）｜字幕 1270–1560｜出處 1580–1690｜1700–1920 只放背景色帶。每幕背景層＝米色色塊＋出血色帶＋大字水印（`bg.mark`，預設第一個關鍵詞）。
- 字幕（短語模式）：中文 76px 900 字重、一次一段單行（≤11.5em，約 11 個全形字；`\n` 可指定斷點），關鍵詞依序：珊瑚字／海軍藍字＋黃色螢光筆底／深青字；英文 30px 實色次要文字，跟著中文的句顯示、每段 ≤42 字元；右側留 120px（x ≤960）。
- 動畫：元素依 `cues` 進場（cue−4 幀）、多項目 focus（其他降到 0.35）、念到時 punch、鏡頭在 cue 推拉（0.965↔1，12 幀後固定）；讀秒保護＝落定後至少 0.8 秒才出場；不做連續縮放、不用 3D（最多 2.5D）。
- 鉤子：第 1 幕 `HookTitle`，第 0 幀就是完整主張（≤10 字＋數字、≥120px），數字附 `claims`（指向 research.md）；骨架 `beat: hook｜you｜mechanism｜twist｜payoff｜cta`；片尾卡前一幕 `CtaCard` 具體提問（不寫「分享給／傳給／標記」）。

## 可重用元件（src/components/）
Background、Header、Subtitle、EndCard、TermCard、FlowRow、CompareSplit、BigNumber、SeatBar（席次條，含過半門檻線）、IconGrid、ImpactCard（含「已確定／分析預期／尚未確定」標籤）、SourceFooter
- v2（`src/components/v2/`）：HookTitle、CtaCard、BigNumberV2（from、對照小標 ref、資料條 bars）、CompareSplitV2、FlowRowV2、ImpactCardV2、IconGridV2、TermCardV2、EndCardV2、SubtitleTrackV2／SourceTrackV2、CoverV2；SeatBar 尚無 v2 版
- v2 畫面形式元件（只用 SVG＋CSS 2D／perspective，禁止 three.js／WebGL／預渲染 3D）：KineticText（全螢幕大字、翻牌 flip、count、角落 ring／sparkline／icon）、LineChart（描線關鍵幀 draw、跟隨徽章、引線註解 ≤3、參考線、重點期間色帶）、UnitGrid（waffle，row／col／wave 填色、框選一組、計數列）、DepthStage（2.5D 景深舞台，前景包 CompareSplit／FlowRow／ImpactCard／IconGrid／TermCard／BigNumber）、BarChart（flat／iso／race）。
- 元件類別（validate 規則 1–10，見 docs/viz-research.md）：card（TermCard、FlowRow、CompareSplit、BigNumber、IconGrid、ImpactCard、CtaCard）／chart（LineChart、BarChart、UnitGrid）／kinetic（HookTitle、KineticText）／depth（DepthStage）／end。card ≤ 幕數÷3、第一幕不能是 card、同類不連續三幕。
- `npm run still` 對 v2 會跑覆蓋率檢查（cov2.py；佔用率、空白帶、主視覺框、背景存在率），結果寫 `out/<slug>/coverage.json`，有 error 時非零結束。

## 資料驅動
- `videos/<slug>/` 底下放：research.md、script.json（每幕的 id、旁白、中英字幕、關鍵詞、元件、參數、來源）、caption.md
- script.json 每幕：`{ id, narration, subtitle: {zh, en}, keywords, component, props, sources, durationSec? }`；頂層另有 `slug, title, asOf, cover`
- 指令：
  - `npm run still <slug>` → `out/<slug>/stills/*.png`（每幕）、`out/<slug>-cover.png`、`out/<slug>-overview.png`
  - `npm run render <slug>` → `out/<slug>.mp4`
  - `npm run fonts` → 把字型子集鏡像到 `public/fonts/`（still/render 會自動執行）。Remotion 啟動 Chrome 時帶 `--no-proxy-server`，在有 TLS 攔截代理的環境無法直連 Google Fonts，因此改讀本地鏡像；沒有鏡像時自動回退到 Google Fonts。
  - `npm run studio` 預覽
  - `npm run audit <slug>` → 量測 out/<slug>.mp4 的流暢度（黑場、靜止比例、每幀位移、人聲靜音），輸出 `videos/<slug>/motion.json`（`-- --baseline` 寫基準）；說明見 `scripts/audit/README.md`
- TTS：`scripts/tts.mjs` 讀環境變數 `TTS_PROVIDER`（目前支援 `openai`，需 `OPENAI_API_KEY`）；未設定或沒有 key 時自動產出無聲版
- Chrome：預設使用 `/opt/pw-browsers` 的 headless shell，可用 `REMOTION_BROWSER` 覆寫

## 交付前檢查清單
- 數字與 research.md 來源一致；未定事項已標示
- 用詞中立、無投資建議
- 每幕截圖檢查：安全區、溢出、缺字方框
- 最後一幕是片尾卡；總長符合規範（v2 45–75 秒、v1 70–100 秒）；ffprobe 確認可播放
- 影片與圖片不 commit（見 .gitignore）

## 配音流程（Gemini TTS，依 ai-voiceover-explainer-video 技能）
- 順序固定：研究 → 腳本 → 逐幕 TTS → 逐字時間戳（CTC 強制對齊）→ 依時間軸渲染 → ffprobe 檢查。配音是影片的時鐘，改稿就要從 TTS 重跑。
- 對齊：`npm run align <slug>` 預設用 `scripts/fa.py`（MMS-300M forced-aligner，輸入念稿 tts 文字，LCS 映射回字幕字），需要 `.venv`（`python3 -m venv .venv && .venv/bin/pip install -r scripts/fa-requirements.txt`，模型第一次從 huggingface.co 下載約 1.2GB）；失敗才回退 gemini+silence。對齊信心與起音誤差寫在 timeline.json 的 `fa` 和 tts-check.md，信心 < 0.5 的幕要試聽。
- `videos/<slug>/` 另放 script.md、pronunciation.md（念稿規則）、voice.md（音色設定與候選比較表）、visual-spec.md（可執行的畫面規格）
- script.json 頂層 `voice: { voiceName, candidates?, style? }`；每幕可加 `tts`（念稿版，數字、縮寫改成唸法）
- 停頓（v2）：換幕人聲間隔預設 0.15 秒；script.json 每幕可設 `pauseAfter`（本幕結束到下一幕開口的整段秒數；鉤子後約 0.25、數字或反轉前後 0.3–0.5），每支最多 3 處、每處 ≤0.7 秒。v2 切檔只去頭尾靜音（各留 40ms）不逐段 loudnorm，align 會把各段依時間軸疊成一條 `public/audio/<slug>/voice.wav` 再整條做兩段式 loudnorm（−16 LUFS），畫面只播這一條。
- `npm run validate <slug>` 先檢查結構、字數、元件 props、總長估算，0 error 才進 TTS
- Gemini 金鑰存在雲端環境的網路秘密（主機 generativelanguage.googleapis.com，標頭 x-goog-api-key），由代理自動注入；程式碼和 repo 裡不放金鑰

## 停工線（額度保護）
- 以台灣時間（Asia/Taipei）為準，**07:00 是停工線**。每個耗時步驟（研究工作流、TTS 批次、render）開始前先執行 `TZ=Asia/Taipei date`。
- 若已超過 07:00：不開始新的耗時步驟；正在進行的 render 可讓它跑完但不再排下一支；把進度（已完成哪幾幕／哪一步）commit 並回報，等使用者再指示。
- 每完成一支影片就先給使用者看（截圖總覽＋ MP4 路徑），再做下一支。
