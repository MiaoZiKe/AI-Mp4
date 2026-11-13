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
- 動畫：元素依 `cues` 進場（cue−4 幀）、多項目 focus（其他項目降到 `THEME_V2.dim`＝0.70，灰階＋淡色、對比仍 ≥3:1）、念到時 punch；鏡頭預設不動，只有 script.json 該幕寫了 `camera: { move: "push"｜"pull"｜"pan", at? }` 才在指定 cue 動一次（`src/cue.ts` 的 `cameraMove`）；讀秒保護＝落定後至少 0.8 秒才出場；不做連續縮放、不用 3D（最多 2.5D）。
- 鉤子：第 1 幕 `HookTitle`，第 0 幀就是完整主張（≤10 字＋數字、≥120px），數字附 `claims`（指向 research.md）；骨架 `beat: hook｜you｜mechanism｜twist｜payoff｜cta`；片尾卡前一幕 `CtaCard` 具體提問（不寫「分享給／傳給／標記」）。

## styleVersion 3（桌面紙拼貼）
- 一句話：全片是同一張桌面上的一鏡到底，紙片依配音 cue 貼上、移動、撕走。第一支：`videos/what-is-server/`；設計理由與樣張：`docs/style-v3/`；每鏡規格寫在該片的 `visual-spec.md`。
- token：`src/theme.ts` 的 `THEME_V3`（桌面 `#EFE6D4`、切割墊 `#2F4A3A`、紙 `#FFFDF7`、牛皮 `#C9A66B`、紅 `#D9482B`、黃 `#F2B632`、藍 `#1F3A5F`、薄荷 `#7DB7A0`、墨 `#1E1B16`；`motion`＝貼上 6 幀、重貼 4、滑入 8、退場 6、鏡頭 12、逐格每 2 幀、落定後每 9 幀抖 ±1px）與 `LAYOUT_V3`（字幕紙條 1300–1532、中文 72px／英文 30px、出處紙條 1601 起）。元件不寫死色碼；`make-paper.py` 的色表要和 `THEME_V3` 一致。
- 元件（`src/components/v3/`）：`engine.ts`（把各幕 props 攤平成絕對時間軸：鏡頭、切割墊、紙片出生／移動／狀態／退場）、`Stage.tsx`（畫桌面與各層）、`Pieces.tsx`（StripTitle 撕邊紙條／TapeLabel／Polaroid、MarkerHighlight、DashedPath 紙虛線、PassWindow 出餐口、ImgPiece 含 grid）、`PhoneMock.tsx`（中性的自製手機畫面）、`Tracks.tsx`（頁首、字幕紙條、出處紙條、片尾卡）、`Cover.tsx`。
- script.json：頂層 `styleVersion: 3`；每幕 `component: "PaperScene"`（最後一幕 `EndCard`，`silent: true`＋`durationSec`），props＝`camera`（世界座標 `[cx, cy, 縮放]`，可多段）、`punch`（念到 cue 推近一次，全片 ≤4 次）、`mat`（切割墊蓋上／掀開）、`headerPlate`、`items`。紙片的 `at` 只寫 cue id 或 `start｜voice｜end｜exit` 加減幾幀，不手填秒數；進場 `paste｜slam｜cut｜wipe｜left｜right｜top｜bottom`，退場 `until`＋`to`；跨幕沿用同一張紙片用 `id`／`ref`。`cover` 也是 `{ camera, items }`。
- 素材：`python3 scripts/make-paper.py <slug>` 產生紙材 PNG 與 `meta.json` 到 `public/v3/<slug>/`（不 commit；固定 seed，紙材函式在 `scripts/styleframes/paper.py`）；實拍照片放 `out/<slug>/assets-raw/photos/`，來源與授權記在 `videos/<slug>/assets.md`。AI 生圖不用。
- 配音：`voice.mode: "take"` 走 `scripts/tts-take.mjs`（整篇一次生成、強制對齊找切點、保留原始錄音的句間停頓，不能單幕重生）；`voice.style` 是提示句，程式自動接「說：」。提示不要寫成情境對話（會被念出來）。
- 指令：`npm run validate`（v3 規則在 `scripts/v3/validate-v3.mjs`）→ `npm run still`（覆蓋率用 v3 門檻）→ `npm run selfcheck <slug> -- --sample`（前 15 秒樣片關口）→ `npm run render` → `npm run audit` → `npm run selfcheck <slug> -- --render`（全片；六項分數讀 `review.md` 第一張評分表，要由沒參與製作的評審填）→ `python3 scripts/v3/review-sheet.py <slug>`（`out/<slug>-review.png`）。看指定時刻：`node scripts/v3/peek.mjs <slug> <out.png> <幀或 s06:cue+10,...>`。
- 規則：不用 3D、SVG 圖示卡、霓虹發光、漸層、透明度淡入淡出（紙只會貼上、滑動、被蓋住、被撕走）；同屏主要東西 ≤3 樣；每 2–4 秒有事件、內容幕不留 >1.5 秒靜止；轉場用蓋場紙、切割墊或沿虛線移鏡，不硬切；字幕換段不留空白紙條；深色紙片經過頁首時墊 `headerPlate`；不出現真實人物與真實商標圖案；片中不加 AI 標示。
- 外觀與頻道（頂層，都可省略）：`skin`＝`desk`（預設，what-is-server 的桌面）｜`blueprint`（藍圖方格紙＋白／青紙片，桌面是深色）｜`newsprint`（軟木板＋報紙色紙、黑白照片）｜`notebook`（橫線筆記本＋粉橘便條）｜`sticky`（白板＋彩色便利貼）；`channel: { name, tag, slogan }`（預設 白話國際／國際白話講／一支講透一件事）決定頁首左右兩處與片尾卡的字。skin 只換色票與桌面紙紋，版面與動作不變；色名（red／yellow／blue／mint／white／ink／ink2／ink3／kraft）是「角色」，每套 skin 對到不同顏色。數值在 `src/theme-v3-skins.json`（`THEME_V3.skins` 與 `make-paper.py` 讀同一份）；元件用 `useT()`／`useChannel()` 拿，不直接讀 `THEME_V3` 的色票。換 skin 要重跑 `make-paper.py`（validate／still／render 會檢查紙材是不是同一套 skin 做的）。深色桌面（blueprint）上直接放的圖表字會自動用淺色，圖表墊在白紙上時寫 `onDark: false`。
- 通用紙片（每支新片的 `public/v3/<slug>/` 都有；what-is-server 舊片不產生）：便條 `note-<色>`、重點卡 `card-<色>`、方塊 `block-<色>`、紙箭頭 `arrow-<色>`（朝右，用 `rot` 轉）、圖釘 `pin-red｜blue｜yellow`、膠帶 `tape-y｜m｜r｜b｜w｜k`（色＝white／yellow／red／blue／mint／kraft／ink）。有字的都用 `type: "strip"` 加 `paper`；`img` 也可以加 `tape`。另外四種 type（`src/components/v3/Charts.tsx`）：
  - `num` 大數字紙片：`value`、`fromValue`、`decimals`、`prefix`、`unit`、`head`、`lines`、`paper`（預設 `card-white`）；`state.count: 0` 加 `set: [{ at, count: 1 }]` 可以等念到才跳。
  - `stack` 堆疊方塊：`layers` 由下到上，每層 `{ asset, w, t }` 或 `{ row: [...] }`（同一層並排）；`state.n` 控制疊到第幾層。
  - `bars` 紙條長條圖：`bars: [{ v, label, color, val }]`、`dir: "up"｜"right"`、`w`／`h`、`unit`；`state.grow`。
  - `line` 紙條折線：`vals`、`labels`、`marks: [{ i, t }]`、`color`；`state.grow`。
  - `path` 加 `head: true`（或 `"arrowhead-r"`／`"arrowhead-w"`）＝虛線長完在終點貼一個紙箭頭。
  - 自訂尺寸的色紙（堆疊的每一層、特大標題條）與照片的裁切寫在 `videos/<slug>/assets.json`（`papers`／`photos`）。手機沒有實拍原圖時自動改用紙手機；出餐口 `pass`、機櫃 `rack` 只有 what-is-server 有。
  - 寫法範例：`docs/style-v3/skin-proof-script.json`；五套外觀的樣張：`node scripts/v3/skin-proof.mjs all` → `out/skin-proof/<skin>/sheet.png`。
- 四支頻道樣片（各用一套 skin，寫法可互相參考）：`videos/tech-cowos/`（科技，`blueprint`）、`videos/stock-jensen/`（股票，`newsprint`；時事題材，上片當天要重查 research.md）、`videos/love-stats/`（感情，`notebook`）、`videos/ai-make-video/`（AI，`sticky`）。每支的成片資訊與人耳確認清單在各自的 `README.md`。
- 打包暫存：`scripts/lib.mjs` 的 `makeBundle` 把 Remotion bundle 寫到 `out/.bundle/<pid>/`，跑完自動刪除（以前寫在 /tmp，堆到磁碟滿）。指令被中斷時會留下殘檔，確認該 pid 已不在後可以直接刪；`out/` 整個不 commit。跑 still／peek／render 前先 `df -h /`，可用不到 1GB 就先清 `out/<slug>/` 的舊中間檔。
- 實拍照片：`python3 scripts/styleframes/find_pexels.py 關鍵字…` 找、`--fetch <slug> 名稱=md5` 抓，`make-paper.py` 自動做成 `polaroid-<名稱>`／`print-<名稱>`（newsprint 另有 `clip-<名稱>`）；流程與規則（不要有可辨識人臉、怎麼記 assets.md）見 `docs/style-v3/photos-howto.md`。
- 已知限制：selfcheck 的單幀跳變關口是照 v2 訂的，v3 紙片「貼上」那一幀會被算成跳變（what-is-server 有 13 幀）；audit 的 `blackFramesTotal` 會把蓋場大紙算進去，真正黑幀用 ffmpeg blackdetect 看。SeatBar 沒有 v3 版；v3 的圖表只有紙條長條（bars）與紙條折線（line）。

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
- 最後一幕是片尾卡；總長符合規範（v2／v3 45–75 秒、v1 70–100 秒）；ffprobe 確認可播放
- 影片與圖片不 commit（見 .gitignore）

## 配音流程（Gemini TTS，依 ai-voiceover-explainer-video 技能）
- 順序固定：研究 → 腳本 → validate（含讀法規則）→ TTS（整篇一次生成＋回讀校驗自動重生）→ 逐字時間戳（CTC 強制對齊，寫 timeline.json＋storyboard.json）→ 依時間軸渲染（＋SRT）→ ffprobe 檢查。配音是影片的時鐘，改稿就要從 TTS 重跑。
- 對齊：`npm run align <slug>` 預設用 `scripts/fa.py`（MMS-300M forced-aligner，輸入念稿 tts 文字，LCS 映射回字幕字），需要 `.venv`（`python3 -m venv .venv && .venv/bin/pip install -r scripts/fa-requirements.txt`，模型第一次從 huggingface.co 下載約 1.2GB）；失敗才回退 gemini+silence。對齊信心與起音誤差寫在 timeline.json 的 `fa` 和 tts-check.md，信心 < 0.5 的幕要試聽。
- `videos/<slug>/` 另放 script.md、pronunciation.md（念稿規則）、voice.md（音色設定與候選比較表）、visual-spec.md（可執行的畫面規格）
- script.json 頂層 `voice: { voiceName, candidates?, style? }`；每幕可加 `tts`（念稿版，數字、縮寫改成唸法）
- 停頓（v2）：換幕人聲間隔預設 0.15 秒；script.json 每幕可設 `pauseAfter`（本幕結束到下一幕開口的整段秒數；鉤子後約 0.25、數字或反轉前後 0.3–0.5），每支最多 3 處、每處 ≤0.7 秒。v2 切檔只去頭尾靜音（各留 40ms）不逐段 loudnorm，align 會把各段依時間軸疊成一條 `public/audio/<slug>/voice.wav` 再整條做兩段式 loudnorm（−16 LUFS），畫面只播這一條。
- `npm run validate <slug>` 先檢查結構、字數、元件 props、總長估算，0 error 才進 TTS
- 讀法規則（只改送配音的 `tts`，字幕維持原文）：兩個標點之間 ≤26 字（超過加逗號）；數字、%、$ 寫成唸法（二零二六、四趴、四點三億美元），英文縮寫拆字母（M S T R）或改中文，英文與中文之間留半形空白；會念錯的多音字換同義詞；整篇一次生成、各幕空一行（tts.mjs 自動）。validate 對念稿版逐條警告，確定念得對的詞放 pronunciation.md 標題含「白名單」的一節（反引號包住）。
- 回讀校驗＋自動重生：`npm run tts` 合成完自動校驗新做的幕——CTC 對齊信心 < 0.5（預設 `--verify=fa`，本機不花請求）或 Gemini 聽寫 CER > 15%（`--verify=asr|both`，花文字模型請求）的幕自動重生一次（等同 `--only`，合併成一次 TTS 請求；每支最多 `--regen-max=3` 幕），重生後再校驗、變差就還原原音檔；音色／模型／念稿已改的幕不單獨重生。`--no-regen` 只校驗、`--verify=off` 全關、`--check` 不合成只校驗現有音檔。結果寫 `videos/<slug>/tts-verify.json` 與 tts-check.md 的「自動重生紀錄」。仍不合格的幕要人耳試聽。
- 字幕檔：`npm run render <slug>` 後自動輸出 `out/<slug>.srt`（中英雙行）、`.zh.srt`、`.en.srt`；時間取 timeline.json 的字幕短語（v1 用舊時間軸逐行），文字用 script.json 的 subtitle 原文，不用辨識結果。不重渲只要字幕：`npm run subs <slug>`。
- 分鏡表：`npm run align`／`render`／`subs` 會寫 `videos/<slug>/storyboard.json`（每幕 id、startFrame、durationFrames、component、beat、轉場、人聲區間、cues 絕對幀與幕內幀、字幕短語時間），自查拼圖與聲畫匹配以它為準。
- Gemini 金鑰存在雲端環境的網路秘密（主機 generativelanguage.googleapis.com，標頭 x-goog-api-key），由代理自動注入；程式碼和 repo 裡不放金鑰

## 停工線（額度保護）
- 以台灣時間（Asia/Taipei）為準，**07:00 是停工線**。每個耗時步驟（研究工作流、TTS 批次、render）開始前先執行 `TZ=Asia/Taipei date`。
- 若已超過 07:00：不開始新的耗時步驟；正在進行的 render 可讓它跑完但不再排下一支；把進度（已完成哪幾幕／哪一步）commit 並回報，等使用者再指示。
- 每完成一支影片就先給使用者看（截圖總覽＋ MP4 路徑），再做下一支。
