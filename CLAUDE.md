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
- 旁白寫成「對一個人講話時真的會說出口的字」（`docs/voice-natural.md`）：長短句交錯、可以半句話和自問自答（「有四塊。哪四塊？」）；不寫對稱排比、不用冒號帶條列、真人不會停的逗號拿掉。**語助詞多寡依頻道**：AI 教學＝親和專業（懂行又好相處的前輩在解釋；不用欸、蛤、齁、耶、嘛、啦，只留其實、所以、你會發現、我們來看這類連接，句尾的喔、呢全片最多一兩個）；談晴說礙＝輕聲聊天（開頭有進場的字，句尾語助詞大約每 15–25 字一個）；其他頻道在兩者之間，照 voice-natural.md 的分級。口語化不能改動事實與「已確定／分析預期／尚未確定」的分寸
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

## 風格試片的四種新畫面（`stage`）
- 用途：四個頻道各一種和紙拼貼明顯不同的畫面，目前只有 10–15 秒試片（沒有片尾卡），讓使用者挑風格。每支的成片資訊、已知問題、人耳確認清單在各自的 `videos/<slug>/README.md`。
- 開關：script.json 頂層 `styleVersion: 3` 加 `stage`。配音（`voice.mode: "take"`）、對齊、時間軸、字幕檔、混音都沿用 v3 流程，只有畫面換掉；有 `stage` 就不用跑 `make-paper.py`。原本規劃的 `styleVersion: 4` 沒有開，3D 也是走 `stage: "three"`。
  - `stage: "iso"`（**AI 教學頻道的固定風格**，使用者 2026/11/14 決定：等距 2.5D 插畫，isometric 2.5D）：粉彩亮色的斜角小桌面，只用 SVG 與 CSS 2D 矩陣（不用 three.js，每幀約 0.05 秒）。`src/components/ai-iso/`（`IsoFilm.tsx` 完整片引擎，頂層加 `isoVersion: 2`＋`sample: false`；`IsoVideo.tsx` 基本零件與 5 鏡試片；`engine.ts`），每幕 `component: "IsoScene"`＋`props.panel`＋`props.camera`（`look [x,y,z]`、`zoom`、`sy`）；token＝`THEME_ISO`／`LAYOUT_ISO`；檢查 `scripts/ai-iso/validate-iso.mjs`（回答逐行比對 `verbatim` 的實測原文、要標「實測…（節錄）」、第 0 幀要有數字、完整片要有對照／提醒／範本／提問／下一集／片尾卡）；無聲時間軸 `node scripts/ui/silent-timeline.mjs <slug>`。試片 `videos/sample-ai-iso/`，第一支完整片 `videos/sample-ai-news-iso/`（20 鏡）。短片用 `isoVersion: 3`（`IsoShort.tsx`，第一支 `videos/short-ai/`）：每鏡不同構圖（`camera` 可加 `dur`、`rot`，全部 ease-in-out）、按鍵下沉／放大鏡掃過／新聞紙翻頁／數字翻牌／落地回彈／蓋章震動／被撞飛／發光圈，沒事件時也有呼吸、光暈與前景漂浮物；欄位見該片 README。
    - 同一張桌面貫穿全片，鏡頭只平移縮放。桌上的東西各有意思：螢幕＝AI、新聞紙＝原文、放大鏡＝搜尋／核對、五格托盤＝提示機、回答紙＝落回桌上的回答。要讀的字放在「飛起來轉正」的白色厚卡片上（≥28px），桌面上斜著的東西不放要讀的字；範本卡這類長文字用正面平視的大卡。
    - `props.panel`：`hook｜ask｜answer｜bump｜why｜title｜slot｜result｜add｜compare｜remind｜template｜question｜next｜end`（各自的欄位與動作見 `docs/channels/ai-tutorial.md` 3.1）。動作＝卡片在螢幕面／桌面／正面之間飛、彈出、蓋章、螢光標記、劃掉、打字、物件跳一下、沿虛線移動。
    - 色票角色（`color`／`kw`）：`primary` 長春花藍＝AI 與主標、`wrong` 珊瑚＝錯的或過期的、`right` 青綠＝對的或和原文一致、`note` 暖黃＝提醒或還不確定、`sky`／`plum`＝中性（只給「這樣問」的欄位分色）；色塊 `tone`＝`lav｜sky｜yellow｜plum｜mint｜coral｜white`。
  - `stage: "ui"`（AI 教學的舊風格，深色仿介面動畫；**2026/11/14 起不再用於新片**，改用上面的 `stage: "iso"`）：`src/components/ui/`，每幕 `component: "UiScene"`；token＝`THEME_UI`／`LAYOUT_UI`；檢查 `scripts/ui/validate-ui.mjs`；樣片 `videos/sample-ai-ui/`、`videos/sample-ai-news/`（留作紀錄，腳本與實測被 sample-ai-news-iso 沿用）。
  - `stage: "chat"`（感情，對話泡泡）：`src/components/chat/`，每幕 `component: "ChatScene"`，`props.events`＝`bubble｜compose｜read｜typing｜card｜stat｜react`；token＝`THEME_CHAT`／`LAYOUT_CHAT`；檢查 `scripts/chat/validate-chat.mjs`，音效 `scripts/chat/sfx.mjs`；樣片 `videos/sample-love-chat/`。畫面要標「情境示意，非真實對話」，不仿真實通訊軟體。
  - `stage: "three"`（科技，3D 產品台）：`src/components/three/`，每幕 `component: "ThreeScene"`（`spin`、`explode`、`labels`、`focus`、`sweep`…）；**產品模型是資料**：零件清單（形狀、尺寸、材質、所在層、標註點）寫在 `videos/<slug>/model.json`，引擎讀資料建模，換產品不改引擎；資料格式、可用的形狀／材質／特效／鏡頭動作與每種效果的渲染成本見 `docs/three-stage.md`。token＝`THEME_3D`／`LAYOUT_3D`（特效開關 `THEME_3D.fx`）；檢查 `scripts/three/validate-three.mjs`；量成本 `node scripts/three/bench-fx.mjs <slug>`；樣片 `videos/sample-tech-3d/`。
    - **運作動畫**（不只拆解，還演「東西實際怎麼運作」）：動作的定義也是資料，寫在 `model.json` 的 `actions`（八種 type：`vibrate` 零件振動／往復、`rotate` 旋轉件、`pulse` 零件發光脈衝、`flow` 沿路徑流動的光點或箭頭、`wave` 往外擴散的聲波圈、`trace` 行進波形、`sum` 幾道波疊加相消、`meter` 跟著數值動的小儀表），每幕用 `props.run: [{ id, at, until?, speed?, gain? }]` 由 cue 觸發；另有 `props.shot`（鏡頭關鍵格，跟著訊號走）與 `props.shift`（把某一層變透明或移開）。程式在 `src/components/three/Ops.tsx`，線寬與不透明度在 `THEME_3D.ops`；寫法、範例與每種成本見 `docs/three-stage.md`「運作動畫怎麼寫」，量成本 `node scripts/three/bench-fx.mjs <slug> --ops`；樣片 `videos/sample-tech-anc/`（耳機主動降噪，拆解只佔約三分之一）。運作動畫都是示意，出處列要寫「波形是示意，不是量測」，儀表不標沒查證的數字。
  - `stage: "chart"`（股票，資料圖表主導）：`src/components/chartlead/`，每幕 `component: "ChartScene"`，資料寫在頂層 `chart`；token＝`THEME_CHARTLEAD`／`LAYOUT_CHARTLEAD`；檢查 `scripts/chartlead/validate-chart.mjs`；樣片 `videos/sample-stock-chart/`。只畫查證過的資料點，紅色代表上漲（台股習慣），不給投資建議。
- 共同規則：元件不寫死色碼；事件的 `at` 只寫 cue id 或 `start｜voice｜end｜exit` 加減幾幀，不手填秒數；不出現真實商標與真人；這四種可以用淡入淡出（紙拼貼的「不用透明度」規則只管沒有 `stage` 的 v3）。
- **深色 HUD 片的頻道皮膚**（`videos/tech-2nm/`，科技透明圈第一支完整片）：script.json 頂層 `hudSkin: "deep"｜"glass"｜"brand"｜"light"` 選配色，色票全部在 `src/theme-hud-skins.json`（換色只改這一個欄位；新增一套就在 JSON 加一個鍵）；另有 `props.reexplode`、overlay `bars`、片尾卡（最後一幕 `silent: true`＋`props.endCard`）、旁白設定檔 `tech-report`，寫法見 `docs/three-stage.md` 第八節。使用者 2026/11/15 選定科技頻道用 `light`（頻道貼文風：淺藍白底＋亮藍＋橘、開口圈標誌）；`glass`、`brand` 留著備用。
- **科技片三條固定規則**（使用者 2026/11/15）：LOGO 固定左上、版面填滿（`LAYOUT_HUD`）；片尾卡 LOGO 要有動畫（使用者 2026/11/15 定案 `logoAnim: "transparent"`「透明圈」加強版，`src/components/three/LogoAnims.tsx`；片尾 3 秒，配可愛科技感合成音效與五字招牌音，做法在 `docs/channels/tech-daily-playbook.md`）；電流等運作效果用 `stream`（電子流跟著閘極電壓加速／減速停住、電場線）。細節見 `docs/channels/tech-daily-playbook.md`。
- **3D 片的前 3 秒與留存**（使用者 2026/11/14 要求、三位評審評估）：第 0 幀要有反差或後果的大字加一個已經在動的東西（不是只有產品在轉），先給結果再拆開；中段逐步揭曉並畫出一個衝突，結尾＝具體提問＋下一集鉤子；示意動畫不畫成歸零。新畫面優先用 2D 疊層 `props.overlay`（`scope｜stamp｜cross｜circle｜steps｜card｜ribbon`，`src/components/three/Overlays.tsx`，不增加 3D 成本）。18 條檢查清單在 `docs/channels/tech-3d.md`，評估全文與採用理由在 `docs/tech-3d-expert-review.md`；照做的樣片是 `videos/sample-tech-anc/`。
- **3D 只開放給科技頻道**（使用者已同意）：全專案只有 `src/components/three/` 可以 import three.js／`@remotion/three`（validate 會擋其他資料夾）；v2、紙拼貼與其他 `stage` 仍禁止 3D。模型用基本形狀自己建，不畫真實商標、不仿特定機型。
- 3D 的 GL 設定與限制：這台機器 4 核心、沒有 GPU，預設的 `gl: "swiftshader"` 開不出 WebGL；`stage: "three"` 時 `scripts/lib.mjs` 自動改用 `swangle`，平行數預設 1（`THREE_CONCURRENCY` 可調，樣片用 4）。成本幾乎和 3D 畫布的像素數成正比：`THEME_3D.fx.dpr`（畫布倍率）1＝每幀約 2.7 秒、1.35（樣片）＝平行數 4 時每幀約 2 秒（441 幀約 15 分鐘）、2＝約 8.3 秒；一般畫面每幀約 0.05 秒。MSAA、物理材質（PBR）、陰影貼圖、折射在這台機器都太貴（數字在 `docs/three-stage.md`），預設用 Phong＋程式畫的環境貼圖＋壓扁的假陰影；正式長片要先 `node scripts/three/bench30.mjs <slug>` 估時間。
- 語速：使用者要的是 Sulafat、4.6–5.0 音節/秒（AI 教學新片用 `voice.profile: "ai-report"`，見「配音流程」）。`voice.profile.pace` 寫 `[4.6, 5]`、語氣寫明「講話偏快、不拖尾音」，稿子用短句；對齊時可用 `ALIGN_GAP_MAX=0.3` 壓幕間停頓；還不夠才用 `atempo`，上限 1.08。生成後用 `scripts/voice-retro.py` 量語速與捲舌指標。

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
- **配音前先定旁白設定檔**（`docs/voice-profiles.md`）：script.json 的 `voice.profile` 寫預設檔名字（`tech｜stock｜love｜ai｜ai-report｜liguligu`，在 `scripts/voice-profiles.json`）、`{ preset, …要改的欄位 }` 或整份自己寫；欄位＝`persona`（誰在講、對誰講）、`gender`、`accent`（固定「台灣華語」）、`pace`（目標音節/秒範圍）、`tone`、`arc`（起／承／轉／合各一句情緒指示）、`englishTerms`（英文詞與標準念法）、`avoid`。`tts-take.mjs` 用 `scripts/voice-profile.mjs` 把它組成「導演筆記」說明（只描述說話方式，**不放任何像台詞的句子、不引用稿子**，會被念出來）並送 `speechConfig.languageCode: "cmn-TW"`（模型不收就自動拿掉，之後寫 `voice.languageCode: "off"`）。各段情緒只能給整篇走向（Arc 一行），不能逐句控制；3.x 系列會把說明念出來，只送念稿與 languageCode。沒有 `voice.profile` 的舊片照舊用 `voice.style`，請求與快取不變。
- 台灣口音與用語：口音句固定（台北人平常講話的台灣華語、捲舌輕帶、不兒化、詞尾不念輕聲；中文英文都要標準，英文用標準美式發音完整念出來），各片不改；提示不寫「咬字清楚、字正腔圓」（會推向播音腔）。稿子禁用中國用語與兒化（視頻、信息、軟件、質量、這兒…；清單在 `voice-profile.mjs` 的 `CN_TERMS`，validate 對念稿與字幕警告）；新聞題材也寫成「講給朋友聽」的句子，不寫新聞稿體。
- 旁白不要像演講，也不要太輕浮（`docs/voice-natural.md`）：設定檔寫情境（誰、在哪裡、只對一個人講），不寫清楚、專業、沉穩、明快、俐落這類形容詞，也不在提示裡要求「快、不要停」；新片加 `delivery` 與 `scene`，**說話方式依頻道**：AI 教學＝`delivery: "report"`（正常報導一件事，預設檔 `ai-report`；2026/11/14 使用者聽完 short-ai：「口吻很奇怪，語速太慢，我只是想要讓它正常的去報導一件事情」。說明只有固定的一句話，不送人設、場景、情緒弧線；各幕寫 `para: 1` 連成一段。**長篇導演筆記（人設＋場景＋弧線）會讓 Gemini 變慢、變演**：short-ai 用 warm-pro 兩次都只有 3.3 音節/秒，改 report 後 3.9、扣掉幕間停頓 4.4，診斷在 `videos/short-ai/voice.md`。原本的 `warm-pro`／`ai` 預設檔留給已配好音的舊片）；談晴說礙等輕聲聊天的頻道＝`delivery: "chat"`（各頻道的場景句在 `voice-profiles.json` 的 `_chat`）；哩股哩股＝`delivery: "probe"`（查證揭露：講到疑點放慢、講到查證結果乾脆，`liguligu` 預設檔已內建）。後製不把句間停頓壓成等距（要趕時間就刪字，不調 `ALIGN_GAP_MAX`）；句號停頓要比逗號長。換稿試聽用 `tts-take.mjs --audition=<名字> --script=<另一份稿.json>`；要給使用者在網頁版試聽的整段提示詞用 `node scripts/voice-prompts.mjs`（寫到 `docs/voice-prompts-full.md`，不送請求）。
- 音色依頻道與內容選，**不限男性**（感情頻道預設女聲）；**每個新音色或新頻道第一次用，先做試聽給使用者聽過再整篇配音**：`node scripts/tts-take.mjs <slug> --audition=<名字> --upto=<幕id> --voice=<音色> [--profile=<預設檔>] [--out=out/voice-audition-v2]`（一次請求、不動正式音檔），比較表寫在 `docs/voice-audition-v2.md` 這一類文件。口音只有人耳能判斷；`scripts/voice-retro.py`（ㄓㄔㄕ 與 ㄗㄘㄙ 擦音重心差距）只是輔助數字。
- 語速要讓模型自己念到 `pace` 範圍；**後製加速（atempo）上限 1.08，超過就重配（改稿或改設定檔），不硬加速**。
- `videos/<slug>/` 另放 script.md、pronunciation.md（念稿規則）、voice.md（音色設定與候選比較表）、visual-spec.md（可執行的畫面規格）
- script.json 頂層 `voice: { voiceName, profile, languageCode?, candidates?, style?（舊片） }`；每幕可加 `tts`（念稿版，數字、縮寫改成唸法）
- 停頓（v2）：換幕人聲間隔預設 0.15 秒；script.json 每幕可設 `pauseAfter`（本幕結束到下一幕開口的整段秒數；鉤子後約 0.25、數字或反轉前後 0.3–0.5），每支最多 3 處、每處 ≤0.7 秒。v2 切檔只去頭尾靜音（各留 40ms）不逐段 loudnorm，align 會把各段依時間軸疊成一條 `public/audio/<slug>/voice.wav` 再整條做兩段式 loudnorm（−16 LUFS），畫面只播這一條。
- `npm run validate <slug>` 先檢查結構、字數、元件 props、總長估算，0 error 才進 TTS
- 片長與停頓（2026/11/16 使用者，全頻道）：短片 45–60 秒、旁白 180–260 字不加速；段落間停 0.6–0.8 秒、句間至少 0.3 秒；數字 ≤5、事實 ≤6（docs/channels/tanqing-shuoai.md）。
- 交件前驗證與評分（2026/11/16 使用者，全頻道）：非製作者的審查子 agent 驗證並在 `docs/scores.md` 記五項分數與「下次避免」；沒有驗證紀錄不交件；做下一支前先讀最近 10 筆。
- 素材依內容生成（2026/11/16 使用者，全頻道）：每鏡插圖從該句旁白的具體內容出發，至少一個主體＋一個對上關鍵詞的細節；不用通用圖、不跨篇重複。
- 送 API 前逐句印出 tts 全文檢查（2026/11/16 使用者：不准有「欸」、句首不用英文字母、AI 不拆成「A I」，見 docs/channels/tanqing-shuoai.md 最後一節）。
- 讀法規則（只改送配音的 `tts`，字幕維持原文）：兩個標點之間 ≤26 字（超過加逗號）；數字、%、$ 寫成唸法（二零二六、四趴、四點三億美元），英文縮寫拆字母（M S T R）或改中文，英文與中文之間留半形空白；會念錯的多音字換同義詞；整篇一次生成、各幕空一行（tts.mjs 自動）。validate 對念稿版逐條警告，確定念得對的詞放 pronunciation.md 標題含「白名單」的一節（反引號包住）。
- 回讀校驗＋自動重生：`npm run tts` 合成完自動校驗新做的幕——CTC 對齊信心 < 0.5（預設 `--verify=fa`，本機不花請求）或 Gemini 聽寫 CER > 15%（`--verify=asr|both`，花文字模型請求）的幕自動重生一次（等同 `--only`，合併成一次 TTS 請求；每支最多 `--regen-max=3` 幕），重生後再校驗、變差就還原原音檔；音色／模型／念稿已改的幕不單獨重生。`--no-regen` 只校驗、`--verify=off` 全關、`--check` 不合成只校驗現有音檔。結果寫 `videos/<slug>/tts-verify.json` 與 tts-check.md 的「自動重生紀錄」。仍不合格的幕要人耳試聽。
- 字幕檔：`npm run render <slug>` 後自動輸出 `out/<slug>.srt`（中英雙行）、`.zh.srt`、`.en.srt`；時間取 timeline.json 的字幕短語（v1 用舊時間軸逐行），文字用 script.json 的 subtitle 原文，不用辨識結果。不重渲只要字幕：`npm run subs <slug>`。
- 分鏡表：`npm run align`／`render`／`subs` 會寫 `videos/<slug>/storyboard.json`（每幕 id、startFrame、durationFrames、component、beat、轉場、人聲區間、cues 絕對幀與幕內幀、字幕短語時間），自查拼圖與聲畫匹配以它為準。
- Gemini 金鑰存在雲端環境的網路秘密（主機 generativelanguage.googleapis.com，標頭 x-goog-api-key），由代理自動注入；程式碼和 repo 裡不放金鑰

## 哩股哩股頻道（追問式）
- 規則全文：`docs/channels/liguligu.md`（使用者 2026/11/14 要求）。題材＝國際情勢、國際大公司與市場、基金。**結構不是介紹，是追問**：前 3 秒丟出反常的事實或疑點（第 0 幀實心大字＋1 秒內一個蓋章或撕紙動作）→ 發生了什麼（只講已確定的）→ 哪裡不合理、外界懷疑什麼 → 逐一查證 → 目前最合理的解釋與還不知道的事 → 具體提問＋下一集鉤子。
- 事實紀律是硬規則：可以問「這合理嗎？」「有人懷疑是…」，**不可以把沒有證據的陰謀寫成結論**；每個說法標「已確定／媒體報導（誰報的）／分析推測／查不到（截至日期）」；真實人物的私事只寫本人承認或官方文件有的部分，不提第三人姓名，不用定罪式用語；不給投資建議；不出現真人肖像（含替代物）與商標。
- 口吻：冷靜、有把握，「我幫你把沒人講清楚的地方查出來」；不聳動、不喊口號。旁白設定檔 `liguligu`（男聲，`delivery: "probe"`）。畫面：紙拼貼 `skin: newsprint`，畫面常駐「查證截至 YYYY/M/D」。第一支：`videos/liguligu-jensen/`（約 26 秒短片，無聲版）。

## 各頻道音色（使用者 2026/11/14 決定）
- 哩股哩股（股票、國際情勢、基金）：**男聲，用使用者上傳的參考錄音**。使用者 2026/11/14 上傳並說「這個是哩股哩股以後的旁白音檔」：`out/voice-refs/liguligu-reference.wav`（不進 git；複本 `public/audio/liguligu-jensen-pro/user-take2.orig.wav`，原檔名 `Generated_Audio_November_14_2026_-_10_23PM.wav`，23.16 秒、7 句完整；量到語速 4.8 音節/秒、扣掉停頓約 5.9，音高中位數約 123 Hz，捲舌指標 5.8 kHz 偏高；量測在 `videos/liguligu-jensen-pro/voice.md`）。**音色名稱與提示詞待使用者告知；在那之前新片由使用者自己生成錄音上傳**，用 `scripts/dossier/recording-timeline.mjs` 接成時間軸，不送 TTS 請求。先前否決過 Iapetus 與 Achird（「聲音我不喜歡，需要男生旁白，且專業的介紹，帶點揭發以及解惑大家不知道的感覺」）；拿到音色名稱後旁白設定檔用 `liguligu`（`delivery: "probe"`），試聽提示詞在 `docs/prompts/liguligu-男聲試聽.txt`。舊片 liguligu-cpi 是 Iapetus 錄音，不動。
- AI 教學：Sulafat（女）（2026/11/14 使用者聽過 Iapetus 版 short-ai 後改回女聲）。2026/11/15 起使用者在 AI Studio 用 Sulafat＋「用台灣人平常講話的口音，不特別捲舌、不兒化，像平常跟人報告一件事那樣，語速比平常再快一點點，語氣跟著內容有起伏…」這句提示自己生成上傳（提示詞存 `docs/prompts/short-ai-旁白.txt`）。
- 談晴說礙：**2026/11/15 定案＝API 自動配音，使用者不再上傳**（「worktime_sulafat.wav 我使用這旁白在談晴說礙上未來影片…以後都用這口吻 語調 語速」）：script.json `voice: { voiceName: "Sulafat", mode: "take", profile: "tanqing-report" }`（`delivery: "deep-report"`，gemini-3.8-flash-tts，失敗才改 2.5，不送 languageCode）；設定句全文 `docs/prompts/tanqing-旁白-深度報導.txt`，送法同 `scripts/tts-worktime.mjs`（設定句＋念稿不換行、一段）。參考檔 `out/voice-refs/tanqing-reference.wav`。**3.8 每次都把設定句念出來（約 34 秒）**，`tts-take.mjs` 用本機強制對齊自動切掉（原檔留 `.orig.wav`）；切掉後實際語速約 4.9 字/秒（含停頓），不加速。結尾「介紹完就好」：介紹完 → 下一集 → 片尾卡，不加「天還亮著」類的晴收尾與反思提問。以下是較早的設定：Sulafat（女）。2026/11/15 使用者定案：之後由使用者在 AI Studio 用 Sulafat＋這句提示自己生成上傳（不送 API）：「用台灣人平常講話的口音，不特別捲舌、不兒化，用平常說話的音量和聲音，正常語速、不拖尾音、不用氣音、不演，直接說：」（全文與念稿見 `videos/talk-ep01/voice.md`）。說明用 `delivery: "plain"`（正常說話，只送一句；2026/11/14 使用者聽完 short-talk 第 1 版：「我覺得正常說話，不要太奇怪，那個氣音很奇怪」，所以不寫小聲、放低、講心事這類會引出氣音的字；短片的留存做法在 `docs/channels/tanqing-shuoai.md` 6-1 節）。畫面風格照頻道既有貼文（參考檔在 `docs/channels/tanqing-ref/`）：暖米紙底、襯線大標、棕墨字、一個橘色強調、線稿圓角圖表、左上太陽雲朵字標、右下小太陽頁碼。使用者 2026/11/14 兩次表示語速太慢（short-talk：1.08 版聽完說「語速再加快，還是太慢」），這個頻道後製加速可到約 1.2（以使用者聽過為準；short-talk 用 atempo 1.22、幕間停頓 ≤0.45 秒，成片扣掉停頓約 5.1 音節/秒）。
- 科技（Tech）：Iapetus（男）＋「說明 B」（親和、專業解說），使用者 2026/11/15 決定；提示詞全文在 `docs/prompts/tech-2nm-親和專業試聽.txt`。第一支用在 tech-2nm：使用者自己在 Google AI Studio 生成錄音後上傳，沒有送 TTS 請求（做法見 `videos/tech-2nm/voice.md`）。在這之前的設定是照 love-stats 成片的聲音（使用者 2026/11/14 上傳 love-stats.mp4 指定：`voice.style`＝「用台灣人平常講話的口音，語氣沉穩認真一點，語速比平常稍快，咬字清楚」，生成後 atempo 1.17；使用者聽過成品後指定的，1.08 上限不適用）。原本哩股哩股也用這個聲音，11/14 已被否決，只剩科技頻道沿用。
- 白話國際：沿用 Iapetus（未另行指定）。
- 音色固定；語速、語氣、情緒起伏依每支片的內容在 voice.profile 決定，試聽檔只代表音色。Iapetus 曾被聽成中國口音（stock-jensen），每次生成後跑 scripts/voice-retro.py，捲舌指標明顯偏高時照實告訴使用者，重配要先得到同意。

## 所有頻道的版面規則（使用者 2026/11/15：「所有影片都是」）
- 頻道 LOGO 固定在左上角，全片不動、不換位置。
- 版面不要留大片空白：主視覺、字幕、出處要適當填滿 1080×1920，上方與下方不留死白帶（平台介面區不放重要文字，但也不能看起來是空的）。
- 片尾卡的頻道 LOGO 要有動畫（例如描線畫出、圓點彈入、輕微脈動），不能只是靜止圖；**片尾 LOGO 也要配音效**（程式合成、對準動作，頻道名逐字出現時用固定的招牌旋律；使用者 2026/11/15：「後面 LOGO 音效也要寫進去，他是需要的」）。
- 物理或運作效果（電流流動、訊號傳遞、零件動作等）要做得清楚、有方向感、跟旁白同步，示意也要像真的在動。
- 第一支照這四條修改的是 `videos/tech-2nm/`；其他頻道的新片一律照做，舊片要改時再套用。

## 試聽規則
- 試聽不花 API 額度（使用者 2026/11/13 指示）：要比較音色、語氣或口語程度時，不要自己送 TTS 請求；把完整提示詞（含設定說明與念稿）寫成檔案交給使用者，由他在 Google AI Studio 的語音生成頁（aistudio.google.com/generate-speech，模型 Gemini 2.5 Flash Preview TTS、音色照設定檔）試聽後回覆選擇；Claude 的網站不會產生語音，不要叫使用者貼到那裡。API 只用在使用者選定之後的正式配音（每支片整篇 1 次）；需要重配先說明原因與次數，等使用者同意。

## 停工線（額度保護）
- 以台灣時間（Asia/Taipei）為準，**07:00 是停工線**。每個耗時步驟（研究工作流、TTS 批次、render）開始前先執行 `TZ=Asia/Taipei date`。
- 若已超過 07:00：不開始新的耗時步驟；正在進行的 render 可讓它跑完但不再排下一支；把進度（已完成哪幾幕／哪一步）commit 並回報，等使用者再指示。
- 每完成一支影片就先給使用者看（截圖總覽＋ MP4 路徑），再做下一支。
