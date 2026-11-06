# 畫面規格：mstr-bitcoin

所有數值對應 `src/theme.ts`、`src/components/anim.ts`、`src/Video.tsx`、`src/Cover.tsx` 的實作；本檔只是把它們寫成可核對的規格，不另外新增樣式。

## 1. 基本規格

| 項目 | 規格 |
|---|---|
| 尺寸／幀率 | 1080 × 1920、30 fps（`W`/`H`/`FPS`） |
| 輸出 | H.264 MP4，`npm run render mstr-bitcoin` → `out/mstr-bitcoin.mp4` |
| 安全區 | 上下各 220 px、左右各 64 px（`SAFE = { top: 220, bottom: 220, x: 64 }`） |
| 元件區 | `top: 330`、高 1030 px（片尾卡 1370 px）、左右貼安全區，內容置中；整幕有 2.5% 的 Ken Burns 緩慢推近 |
| 幕數／長度 | 15 幕（含片尾），配音版估 94 秒；不填 `durationSec`，長度由 `scripts/align.mjs` 依音檔決定 |
| 換幕 | 進場 10 幀（0.33 秒）：淡入 + 上移 36 px 歸位 + 縮放 1.03 → 1；出場 9 幀（0.3 秒）：淡出 + 上移 20 px + 縮放 1 → 0.985 |
| 字型 | Noto Sans TC（400/700/900）＋ Inter（400/600/800），由 `npm run fonts` 鏡像到 `public/fonts/`；大數字用 Inter，所以 BigNumber 的 `prefix/suffix` 只放 ASCII（本集用 `%`，不放中文） |

## 2. 配色（沿用 CLAUDE.md 設計系統）

| Token | Hex | 用途 |
|---|---|---|
| `C.bg` | `#0B1026` | 背景深藍 |
| `C.cyan` | `#22E5D4` | 主色一 |
| `C.pink` | `#FF4FA3` | 主色二 |
| `C.yellow` | `#FFD54A` | 主色三 |
| `C.purple` | `#8B7CFF` | 主色四 |
| `C.white` | `#FFFFFF` | 文字 |
| `C.card` | `rgba(18, 26, 60, 0.72)` | 卡片底 |
| 格線 | `rgba(255,255,255,0.06)`、每格 60 px | 背景 |
| 光暈 | `rgba(110,100,255,0.24)` 藍紫橢圓（隨幀緩慢漂移）＋ `rgba(255,79,163,0.10)` 粉色副光暈 | 背景 |
| 星點／光點 | 40 顆白色星點、22 顆四色上飄光點，seed `20261103` | 背景（`seeded()` 固定，每次渲染一致） |

狀態標籤（`StatusTag`）固定對應，不可改：已確定 = cyan、分析預期 = yellow、尚未確定 = pink。

### 本集用色邏輯

| 顏色 | 代表 | 用在 |
|---|---|---|
| **yellow** | 比特幣本體、持幣數量 | 第 1 幕大數字、第 4 幕左側比特幣、第 6 幕「股價有溢價」、第 8 幕 Saylor 卡、第 10 幕買幣、第 14 幕持幣格、封面 bitcoin 圖示與「持幣」格 |
| **cyan** | 公司、股票、定義、2022 年說法 | 第 2 幕名詞卡、第 5 幕增發股票、第 6 幕增發買幣、第 7 幕溢價側、第 10 幕募資、第 12 幕 2022 側、第 14 幕飛輪格、封面「溢價」格 |
| **purple** | 制度與工具：mNAV、可轉債、優先股、循環 | 第 3 幕 mNAV 卡、第 5 幕可轉債、第 6 幕「溢價更高」、第 10 幕回購優先股、第 14 幕 MSCI 格、封面「飛輪」格 |
| **pink** | 下跌、折價、賣幣、風險、2026 年反轉、尚未確定 | 第 4 幕 MSTR 側、第 5 幕優先股、第 6 幕「每股含幣增加」（視覺對比用）、第 7 幕折價側、第 9 幕 mNAV 0.90、第 10 幕賣幣、第 11 幕 −3.7%、第 12 幕 2026 側、第 13 幕風險卡、第 14 幕 2026 格、封面「風險」格 |

政治中立配色（`C.dem`/`C.rep`）本集不涉及，不使用。

## 3. 進場動畫參數（`src/components/anim.ts`）

| 函式 | 參數 | 效果 |
|---|---|---|
| `rise(frame, delay, dist = 40)` | spring `{ damping: 14, stiffness: 110, mass: 0.7 }` | 淡入 + 從下方 `dist` px 彈上來，opacity = min(1, s × 1.15) |
| `pop(frame, delay, from = 0.6)` | spring `{ damping: 10, stiffness: 160, mass: 0.6 }` | 從 `from` 倍放大、過衝後回到 1 |
| `progress(frame, delay, dur)` | `Easing.out(Easing.cubic)`，clamp 0–1 | 描線、打字機、數字遞增用的進度 |
| `linear(frame, delay, dur)` | 線性 | 本集元件未直接使用 |

各元件固定時序（幀，相對本幕開始）：

| 元件 | 時序 |
|---|---|
| TermCard | 卡片 `rise(f, 0)`；圖示描線 `progress(f, 0, 30)`；定義打字機 `progress(f, 18, 45)`（第 18–63 幀逐字出現，游標 ▍ 打完消失）；要點 `rise(f, 50 + i × 8, 20)` |
| FlowRow | 標題 `rise(f, 0)`；第 i 張卡 `rise(f, 8 + i × 22)`；箭頭描線 `progress(f, d − 10, 12)`（d 為該卡 delay），青色 3 px 線 + 外發光 |
| CompareSplit | 左卡 `rise(f, 0)`、右卡 `rise(f, 8)`；每條項目 `rise(f, d + 12 + i × 7, 16)`；footer（黃字）`rise(f, 45)` |
| BigNumber | 圖示 `rise(f, 0)` + 描線 `progress(f, 0, 30)`；標籤 `rise(f, 4)`；數字遞增 `value × (1 − (1 − progress(f, 10, 40))³)`（第 10–50 幀跑到定值）；第 50 幀 `pop(f, 50, 0.93)` 彈一下；註解 `rise(f, 30)`；狀態標籤 `rise(f, 36)` |
| IconGrid | 標題 `rise(f, 0)`；第 i 格 `rise(f, 8 + i × 7)` |
| ImpactCard | 卡片 `rise(f, 0)`；圖示描線 `progress(f, 0, 30)`；第 i 列 `rise(f, 14 + i × 9, 18)`；台灣視角框 `rise(f, 14 + rows × 9 + 6, 18)` |
| EndCard | logo 圓 `progress(f, 0, 30)` 描線；「白話國際」`rise(f, 8)`；slogan `rise(f, 14)`；英文 `rise(f, 20)`；追蹤／分享／留言膠囊 `rise(f, 28)`；下集預告 `rise(f, 36)`；免責 `rise(f, 40)` |

圖示一律 `src/components/Icons.tsx` 自繪 SVG 霓虹描邊（stroke 3 px + `glow()` 外發光），不使用外部圖片、不畫真人。

## 4. 固定元素

| 元素 | 位置 | 規格 |
|---|---|---|
| Header 左 | `top: 220, left: 64` | 64 px 地球 logo（青圈、粉赤道線）＋「白話國際」40 px / 900 |
| Header 右 | `top: 220, right: 64` | 「國際白話講」膠囊：粉 1.5 px 邊框、30 px / 700、`0 0 14px #FF4FA355` 外光 |
| 進度條 | `top: 306`（220 + 86）、高 4 px | 青 → 粉漸層，隨全片進度前進 |
| 字幕 | `bottom: 290`（220 + 70）、左右 64 px、置中 | 中文 64 px / 900、行高 1.3、白字、黑色投影；關鍵詞依序上色 yellow → cyan → pink → purple，並加 `0 0 18px` 同色光；每行 `rise(f, lineStart, 20)`；有配音時間軸時逐字點亮（未唸到 42% 透明）、關鍵詞被唸到時 `pop(f, t, 0.86)`。英文 28 px、70% 透明、`marginTop: 14`。中文每行 ≤14 字、最多 2 行、在「，；：、」最靠中間處斷行 |
| 資料來源 | `bottom: 220`、22 px、50% 白、單行省略 | 「資料來源：A、B、C｜截至 2026/11/6」；本集每幕 2–3 個來源名以免被截斷 |

## 5. 每幕規格

| # | id | 元件 | 主色 | 圖示 | 畫面重點 | 進場 |
|---|---|---|---|---|---|---|
| 1 | hook | BigNumber | yellow | bitcoin | 849,327 遞增；標籤「Strategy 持有的比特幣（枚）」；註解佔 4.04%；標籤「已確定」 | 圖示描線 0–30 幀，數字 10–50 幀跑完，50 幀彈一下 |
| 2 | what-is-strategy | TermCard | cyan | building | 名詞 Strategy／Formerly MicroStrategy · Nasdaq: MSTR；定義打字機；3 要點（持幣、成本、本業營收） | 打字 18–63 幀，要點 50/58/66 幀 |
| 3 | what-is-mnav | TermCard | purple | scale | 名詞 mNAV；定義打字機；3 要點（3.4 倍高峰、0.85–1.2、企業價值口徑） | 同上 |
| 4 | stock-vs-coin | CompareSplit | yellow / pink | bitcoin / chart | 左比特幣 11/5 −5%、右 MSTR −10%；footer「槓桿化的比特幣」 | 左 0 幀、右 8 幀、footer 45 幀 |
| 5 | funding-tools | IconGrid（3 欄） | cyan / purple / pink | chart / document / coins | 增發股票、可轉債、優先股三格，各附一句白話解釋與規模 | 格 8/15/22 幀 |
| 6 | flywheel | FlowRow（4 步） | yellow → cyan → pink → purple | trendUp / chart / bitcoin / cycle | 標題「2024–2025 年的飛輪」；溢價 → 增發買幣 → 每股含幣增加 → 股價再漲 | 卡 8/30/52/74 幀，箭頭在前一卡之後描線 |
| 7 | premium-math | CompareSplit | cyan / pink | trendUp / trendDown | 左「溢價 2 倍」100 股→1.09 枚；右「折價 0.85」每股含幣變少；footer 註明依公開定義推算 | 左 0、右 8、footer 45 |
| 8 | saylor-logic | ImpactCard | yellow | megaphone | 標題「Saylor 的邏輯」；2 列已確定（名言、KPI）+ 1 列分析預期（批評） | 列 14/23/32 幀 |
| 9 | premium-gone | BigNumber | pink | scale | 0.90（2 位小數）遞增；標籤「mNAV（11/5 盤中，自算）」；標籤「分析預期」 | 數字 10–50 幀 |
| 10 | money-flow-2026 | FlowRow（4 步） | cyan → yellow → purple → pink | bank / bitcoin / coins / trendDown | 標題「2026 年的錢去哪了？」；募資 212.3 億 → 買幣 143.3 億 → 回購優先股 → 賣幣 4.3 億 | 卡 8/30/52/74 幀 |
| 11 | btc-yield-negative | BigNumber | pink | percent | −3.7% 遞減（1 位小數、suffix `%`）；註解解釋 BTC Yield；標籤「已確定」 | 數字 10–50 幀 |
| 12 | never-sell-to-selling | CompareSplit | cyan / pink | lock / trendDown | 左 2022 說法三句；右 2026 行動三筆（32 枚、12.5 億授權、累計 4.3 億）；footer 註明所得用途與 Saylor 回應 | 左 0、右 8、footer 45 |
| 13 | risks | ImpactCard | pink | warning | 4 列：成本線（已確定）、MSCI 11/11（尚未確定，畫面寫「截至 2026/11/6 尚未確定」）、摩根大通估值（分析預期）、分析師分歧（分析預期）；台灣視角框 | 列 14/23/32/41 幀，台灣框 56 幀 |
| 14 | summary | IconGrid（2 欄） | yellow / cyan / pink / purple | bitcoin / cycle / trendDown / question | 標題「MSTR × 比特幣，一句話」；持幣、飛輪、2026 歸零、MSCI 名單四格 | 格 8/15/22/29 幀 |
| 15 | end | EndCard | cyan | （logo） | 白話國際／一支講透一件事／下一集預告／免責聲明 | 見第 3 節 EndCard 時序 |

連續兩幕不用同一元件；BigNumber 出現在第 1、9、11 幕，CompareSplit 第 4、7、12 幕，FlowRow 第 6、10 幕，ImpactCard 第 8、13 幕，IconGrid 第 5、14 幕。

## 6. 封面（`npm run still mstr-bitcoin` → `out/mstr-bitcoin-cover.png`）

| 元素 | 規格 |
|---|---|
| 背景、Header | 與影片相同 |
| 圖示 | 兩個 200 px 霓虹圖示並排（間距 40）：bitcoin（yellow）、cycle（cyan），`top: 420` |
| 標題 | 第 1 行「比特幣越漲」白色 132 px / 900；第 2 行「它越買？」黃色 132 px + `glow(#FFD54A, 10)`；行高 1.18 |
| 副標 | 「全球最大持幣公司的飛輪與反轉」青色 56 px / 700，`marginTop: 40` |
| 英文 | "MSTR & Bitcoin: why it kept buying, and what changed" 32 px、70% 白 |
| 四格 | 2 × 2 格、總寬 820、間距 24：持幣（bitcoin／yellow）、溢價（scale／cyan）、飛輪（cycle／purple）、風險（warning／pink）；每格 70 px 圖示 + 52 px / 900 標籤、1.5 px 同色邊框與外光 |
| 標籤 | 「資料截至 2026/11/6」（已確定／cyan）、「MSCI 名單 11/11 公布」（尚未確定／pink），30 px 膠囊 |

## 7. 交付前畫面檢查（對應 CLAUDE.md 檢查清單）

- `npm run still mstr-bitcoin` 逐幕看 `out/mstr-bitcoin/stills/*.png`：第 2、3 幕定義是否超過 3 行；第 13 幕 4 列 + 台灣框是否壓到字幕（估高約 840 px < 1030）；第 5 幕 3 欄註解換行後是否對齊。
- 大數字：第 1 幕「849,327」7 字元、第 9 幕「0.90」、第 11 幕「-3.7%」皆 ≤ 9 字元，不會溢出。
- 缺字檢查：全片未使用 →、≈、％ 等可能不在字型子集的符號；÷、×、−、– 皆在 Inter latin 子集內。
- 來源列：每幕 2–3 個來源，單行不應被省略號截斷。
