# 畫面規格：mstr-bitcoin-v2（styleVersion 2・A 奶油編輯）

> 與 `script.json`、`timeline.json`、`storyboard.json` 同步（2026/11/11）。數值對應 `src/theme.ts`（`THEME_V2`／`LAYOUT_V2`）、`src/components/anim.ts`（motion token）、`src/Video.tsx`（v2 轉場）、`src/components/v2/`；本檔只把它們寫成可核對的規格，不另外新增樣式。動畫若再調整，以程式碼與 `storyboard.json` 為準，再回頭更新本檔。

## 1. 基本規格

| 項目 | 規格 |
|---|---|
| 尺寸／幀率 | 1080 × 1920、30 fps、H.264 MP4 |
| 輸出 | `npm run render mstr-bitcoin-v2` → `out/mstr-bitcoin-v2.video.mp4`（畫面＋參考人聲）→ `scripts/mix.mjs` 混音 → `out/mstr-bitcoin-v2.mp4`；同時輸出 `out/mstr-bitcoin-v2.srt`／`.zh.srt`／`.en.srt` 與 `videos/mstr-bitcoin-v2/storyboard.json` |
| 長度 | 13 幕、1898 幀＝63.27 秒（`timeline.json` v2 的 `totalFrames`，唯一時間來源） |
| 時間軸 | 第 1 幕音檔從第 0 幀開始；之後每幕開口＝前一幕收聲＋0.15 秒（或該幕 `pauseAfter`）；每幕 `startFrame`＝開口 − 9 幀（轉場剛好在開口時完成） |
| 人聲 | `public/audio/mstr-bitcoin-v2/voice.wav`（整條兩段式 loudnorm −16 LUFS），畫面只播這一條 |
| 字型 | Noto Sans TC（400／700／900）＋ Inter，由 `npm run fonts` 鏡像到 `public/fonts/` |

## 2. 版面格線（`LAYOUT_V2`，全解析度 y）

| 帶 | 範圍 | 內容 |
|---|---|---|
| 頁首 | 220–310 | 左 logo＋「白話國際」、右「國際白話講」；310 處 4px 報頭線兼全片進度 |
| 主視覺 | 330–1250（x 64–1016，952 寬） | 元件撐滿；外框 ≥ 856×814（圖表繪圖區 ≥ 856×640） |
| 字幕 | 1270–1560（x ≤ 960） | 短語模式：中文 76px／900 一次一段單行（≤ 11.5em），英文 30px 次要文字（每段 ≤ 42 字元） |
| 出處 | 1580–1690 | 24px 輔助色「資料來源：…｜截至 2026/11/6」 |
| 底帶 | 1700–1920 | 只放背景色帶 |

背景層（每幕）：米色色塊＋出血色帶＋大字水印（`bg.mark`，預設第一個關鍵詞；480px、5% 透明度），視差 0.2。

## 3. 色彩（`THEME_V2`）

| 用途 | 色碼 |
|---|---|
| 背景 | `#FBF5EA`＋4% 海軍藍圓點紙紋（`public/bg/base-v2.png`） |
| 文字 主／次／輔 | `#14213D`／`#4B5675`／`#5F6673` |
| 卡片 | 暖白 `#FFFDF8`、2px `#E6D9C2` 邊框、圓角 14px、紙張陰影、頂端 6px 色條 |
| pink → 珊瑚 | 填色 `#E8613C`、文字 `#C2441F` |
| yellow → 暖黃 | 填色 `#F5B83D`、文字 `#8A5E00` |
| cyan → 深青 | 填色 `#2A7F8F`、文字 `#1F6A78` |
| purple → 灰紫 | 填色 `#7A6CA8`、文字 `#5A4D7A` |
| 狀態標籤 | 已確定 `#E2F0E7/#1E6544`、分析預期 `#FCEBCB/#8A5300`、尚未確定 `#ECE7F3/#5A4D7A`，圓角 8px |
| 字幕關鍵詞色序 | ① 珊瑚字 ② 海軍藍字＋黃色螢光筆底 ③ 深青字 |

不用霓虹 glow、放射光、星點、暗角；圖示＝海軍藍方角線稿（6px）＋錯位色塊。

### 本集用色邏輯

| 色名 | 代表 | 用在 |
|---|---|---|
| yellow（暖黃） | 比特幣本體、持幣、溢價（飛輪燃料） | 第 4 幕持幣翻牌、第 5 幕飛輪、第 6 幕原有 100 枚、第 7 幕 Saylor 卡、第 8 幕 2026 色帶、第 9 幕「幣 +26%」 |
| cyan（深青） | 2022 年說法、股票／股數、比特幣對照 | 第 2 幕 2022 側、第 3 幕比特幣跌幅、第 6 幕股數計數、第 9 幕「股數 +31%」、第 10 幕募資、第 12 幕「該」選項 |
| pink（珊瑚） | 賣幣、下跌、反轉、風險 | 第 2 幕 2026 側、第 3 幕 MSTR 跌幅、第 6 幕新買 20 枚、第 8 幕 mNAV 線、第 9 幕「每股 −3.7%」、第 10 幕賣幣、第 11 幕風險卡 |
| purple（灰紫） | 優先股、尚未確定 | 第 10 幕回購優先股、第 11 幕「11/11 公布」徽章 |

## 4. 動畫與轉場

| 項目 | 規格 |
|---|---|
| motion token | `DUR` xs 4／s 8／m 12／l 18 幀；`STAGGER` 4 幀；出場＝進場 65%；`EASE.enter` out-cubic、`exit` in-quad、`move` inOut-cubic；spring 只有 `ui`（無過衝）與 `accent`（過衝 ≤ 3%） |
| 元素進場 | 依 `cues` 進場（cue − 4 幀）：淡入 8 幀＋上移 24px（ui spring，整數 px） |
| focus／punch | 多項目時念到的那項 1、其他降到 0.35；念到時 accent spring 從 0.9 彈回 1 |
| 鏡頭 | 在 cue 推拉 0.965 ↔ 1（12 幀後固定），不做連續縮放 |
| 讀秒保護 | 元素落定後至少 0.8 秒才出場 |
| 換幕轉場 | `fade`（`timeline.transition`）9 幀：出場第 0–5 幀淡出＋上移 24px（ease-in），進場第 3–8 幀淡入＋自下 32px 升起（ease-out quad）；兩者不同時 > 40% 不透明，沒有雙重曝光。元件時間比 Sequence 快 6 幀（`ENTER_LEAD`），進場淡入時內容已在動 |
| 字幕 | 每段在第一個字被唸到前 0.12 秒出現，淡入 3 幀＋上移 8px、淡出 2 幀；關鍵詞被唸到時上色 |
| 2.5D | 只用 CSS 2D／perspective（DepthStage 傾斜 ≤ 6°、視差 0.2／0.5／1.0、堆疊卡），不用 3D 引擎 |
| 確定性 | 不讀系統時間、不用 Math.random、不用 CSS 動畫；隨機用固定 seed |

## 5. 每幕規格

| # | id | beat | 元件（類別） | 主色 | 畫面重點 |
|---|---|---|---|---|---|
| 1 | hook | hook | HookTitle（kinetic） | — | 第 0 幀即完整主張「85萬枚大戶／開始賣幣」（≥120px），`slamAt: sell` 落章；副標 2022 vs 2026/5；`claims` 指向 research.md |
| 2 | not-a-seller | hook | DepthStage＋CompareSplit（depth） | pink | 左 2022「我們不是賣家」（cyan，`say`）、右 2026「5 月首次賣 32 枚／累計約 4.3 億美元」（pink，`sell`）；徽章「說法 vs 行動」 |
| 3 | amplified | you | BarChart flat（chart） | pink | 11/5 盤中跌幅：比特幣約 −6%（`btc`，參考線）vs MSTR 約 −10%（`drop`）；註解「槓桿化比特幣」；註腳標收盤尚未確定 |
| 4 | holdings | mechanism | KineticText（kinetic） | yellow | 翻牌計數 672,500 → 849,327 枚（`buy` 起跑、`pct` 落地）；大字「全球 4%」；右下 ring 4.04%／2,100 萬枚上限 |
| 5 | flywheel | mechanism | DepthStage＋FlowRow（depth） | yellow | 三步飛輪：股價有溢價（`prem`）→ 發新股換現金（`issue`）→ 拿去買比特幣（`buy`）；徽章「溢價＝燃料」 |
| 6 | premium-math | mechanism | UnitGrid（chart） | cyan | 12 欄 waffle：原有 100 枚（yellow）＋新買 20 枚（pink，`c20` 框選）；計數列持幣 100→120、股數 100→110；註解「每股含幣 1.00 → 1.09 枚」（`more`） |
| 7 | buy-the-top | mechanism | DepthStage＋ImpactCard（depth） | yellow | 「Saylor 的邏輯」三列：名言（已確定）、看每股含幣（已確定）、前提＝有溢價（分析預期，`cond`）；中段鉤子 |
| 8 | premium-gone | twist | LineChart（chart） | pink | mNAV 2024/11 約 3.4 倍 → 2026/11 約 0.9 倍：描線分兩段（`y2026`、`zero`），2026 年色帶，1 倍參考線（`coins`）；水印 0.9 |
| 9 | yield-negative | twist | KineticText（kinetic） | pink | 三行計數「幣 +26%」（`coins`）「股數 +31%」（`shares`）「每股 −3.7%」（`yield`，螢光筆）；右上 sparkline BTC Yield 2026 |
| 10 | selling-for-dividends | payoff | BarChart iso（chart） | pink | 2026 年的錢去哪：募資 212.3、買幣 143.3、賣幣 4.3（`sold`）、回購優先股 20.4（億美元）；註解「賣幣所得：付股息、回購」（`div`） |
| 11 | watch-next | payoff | DepthStage＋ImpactCard（depth） | pink | 兩件事：成本線約 75,451 美元（已確定，`cost`）、MSCI 11/11 公布（尚未確定，畫面寫「截至 2026/11/6 尚未確定」，`index`）；「本片不構成投資建議」 |
| 12 | your-call | cta | CtaCard（card） | — | 「該不該賣幣來付股息？」兩個選項（`q`）＋「留言告訴我們」（`talk`）；不寫分享／標記 |
| 13 | end | cta | EndCardV2（end） | — | 白話國際／一支講透一件事；三格 recap；下一集預告；AI 輔助製作聲明 |

元件類別檢查（validate 規則 1–10）：card 只有第 12 幕（≤ 13÷3）；第 1 幕不是 card；同類不連續三幕（depth 在 2、5、7、11 幕，kinetic 在 1、4、9 幕，chart 在 3、6、8、10 幕）。畫面變化：每幕 2–4 個 cue，平均每 2 秒左右有一次進場／focus／鏡頭推拉。

### 時間表（取自 `storyboard.json`，幀＝絕對幀，cue 與字幕為幕內幀）

| # | id | 元件 | 開始 | 長度 | 轉場 | cue（幕內幀 → 念到的詞） | 字幕短語（出現幀） |
|---|---|---|---|---|---|---|---|
| 1 | hook | HookTitle | 0s（0） | 105 幀 | none | hoard 11「囤幣」、sell 62「賣幣」、div 82「股息」 | 最愛囤幣的 Strategy（0）／開始賣幣付股息了（49） |
| 2 | not-a-seller | DepthStage | 3.2s（96） | 161 幀 | fade 9 幀 | say 67「不是賣家」、sell 141「開始賣」 | 2022 年它說（6）／「我們不是賣家」（54）／今年 5 月起卻開始賣（102） |
| 3 | amplified | BarChart | 8.27s（248） | 178 幀 | fade 9 幀 | amp 60「放大版」、btc 132「6%」、drop 162「一成」 | 很多人把它當（6）／比特幣放大版（42）／11/5 幣跌 6%（81）／它跌一成（141） |
| 4 | holdings | KineticText | 13.9s（417） | 143 幀 | fade 9 幀 | buy 58「一路買」、pct 112「4%」 | 它從 2020 年一路買（6）／現在囤了（79）／全球 4% 的比特幣（95） |
| 5 | flywheel | DepthStage | 18.37s（551） | 164 幀 | fade 9 幀 | prem 33「溢價」、pricier 94「還貴」、issue 121「發新股」、buy 146「買幣」 | 祕訣是溢價（6）／股票比背後的幣還貴（55）／就發新股去買幣（112） |
| 6 | premium-math | UnitGrid | 23.53s（706） | 166 幀 | fade 9 幀 | x2 31「2 倍」、c20 82「20 枚」、more 144「變多」 | 溢價 2 倍時（6）／發 10 股能買 20 枚（46）／每股含幣反而變多（103） |
| 7 | buy-the-top | DepthStage | 28.77s（863） | 139 幀 | fade 9 幀 | saylor 28「Saylor」、top 66「買在頂部」、cond 121「前提」 | 共同創辦人 Saylor（6）／說要永遠買在頂部（33）／但這有個前提（103） |
| 8 | premium-gone | LineChart | 33.1s（993） | 173 幀 | fade 9 幀 | y2026 31「2026 年」、zero 76「歸零」、coins 153「手上的幣」 | 到了 2026 年（6）／溢價幾乎歸零（52）／股價差不多（100）／只等於手上的幣（135） |
| 9 | yield-negative | KineticText | 38.57s（1157） | 198 幀 | fade 9 幀 | coins 27「26%」、shares 85「31%」、yield 162「3.7%」 | 幣多了 26%（6）／股數卻多了 31%（46）／每股含幣反而少 3.7%（112） |
| 10 | selling-for-dividends | BarChart | 44.87s（1346） | 160 幀 | fade 9 幀 | sold 31「賣掉」、div 107「優先股股息」、buyback 143「回購」 | 它已賣掉約 （6）／4.3 億美元的幣（47）／拿去付優先股股息（89）／和回購（135） |
| 11 | watch-next | DepthStage | 49.9s（1497） | 171 幀 | fade 9 幀 | cost 90「成本線」、index 123「指數」 | 接下來看兩件事（6）／幣價貼著成本線（61）／指數去留還沒定（120） |
| 12 | your-call | CtaCard | 55.3s（1659） | 129 幀 | fade 9 幀 | q 32「該不該」、talk 102「留言」 | 你覺得（6）／它該不該賣幣來付股息？（22）／留言說說看（98） |
| 13 | end | EndCard | 59.3s（1779） | 119 幀 | fade 9 幀 | — | — |

## 6. 封面（`npm run still mstr-bitcoin-v2` → `out/mstr-bitcoin-v2-cover.png`）

| 元素 | 規格 |
|---|---|
| kicker | 「比特幣 × 美股｜STRATEGY (MSTR)」 |
| 標題 | 「說不賣幣／卻開始賣幣」（≤ 10 字，第 2 行螢光筆 `mark: 1`） |
| 副標／英文 | 「全球最大持幣公司的飛輪與反轉」／"MSTR said it wouldn't sell. Now it sells bitcoin." |
| chips | 約 85 萬枚（pink）、≈ 0.90（yellow）、5 月起（cyan） |
| 插圖 | 飛輪 2024–25 ↑ ／ 反轉 2026 ↓，bitcoin 圖示 |
| 標籤 | 「資料截至 2026/11/6」（已確定） |

## 7. 交付前畫面檢查

- `npm run still mstr-bitcoin-v2`：逐幕看 `out/mstr-bitcoin-v2/stills/*.png`（截圖幀＝`timeline` 的 `stillFrame`），並看 `out/mstr-bitcoin-v2/coverage.json`（佔用率、空白帶、主視覺框、背景存在率，0 error）。
- 安全區、溢出、缺字方框；字幕每段 ≤ 11.5em、x ≤ 960。
- `npm run audit mstr-bitcoin-v2` → `motion.json`（黑場、靜止比例、每幀位移）。
- 字幕檔：`out/mstr-bitcoin-v2.srt` 的文字要與本檔第 5 節字幕短語一致（稿子原文，不是聽寫）。
