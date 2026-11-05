# 畫面規格：us-midterm-tech-2026

可直接對照 `src/` 執行的規格。元件、動畫參數皆引用現有程式碼（`src/theme.ts`、`src/components/anim.ts`、`src/Video.tsx`、`src/Cover.tsx`），本集不新增元件。

## 1. 輸出與版面

| 項目 | 值 | 來源 |
|---|---|---|
| 尺寸／幀率／編碼 | 1080×1920、30fps、H.264 MP4 | `theme.ts` W/H/FPS |
| 安全區 | 上下各 220px、左右各 64px | `SAFE = { top: 220, bottom: 220, x: 64 }` |
| 固定頁首 | top 220：左 logo（64px 霓虹地球 SVG，青圈＋粉赤道線）＋「白話國際」40px/900；右「國際白話講」膠囊 30px/700、粉色 1.5px 邊框、`0 0 14px #FF4FA355` 光暈 | `Header.tsx` |
| 全片進度條 | top 306（220＋86）、高 4px、青→粉漸層 `linear-gradient(90deg,#22E5D4,#FF4FA3)` | `Video.tsx ProgressBar` |
| 元件區 | left/right 64、top 330、高 1030（EndCard 1370），flex 置中；整幕 Ken Burns 緩推 `scale(1 → 1.025)` | `Video.tsx SceneView` |
| 字幕區 | 底部 290px 起（`SAFE.bottom + 70`）往上排 | `Subtitle.tsx` |
| 來源列 | bottom 220、22px、白 50%、單行 ellipsis：「資料來源：A、B｜截至 2026/11/6」 | `SourceFooter.tsx` |
| 每幕長度 | 由配音 timeline 決定（validator 估 4.9–6.9 秒／幕，全片約 92 秒）；無配音時每秒 5 字＋1 秒、限 5–10 秒。本集不填 `durationSec` | `timing.ts` |
| 換幕 | 進場 10 幀（0.33 秒）：opacity 0→1、translateY 36→0、scale 1.03→1，`Easing.out(cubic)`；出場 9 幀（0.3 秒）：opacity→0、translateY −20、scale −0.015，`Easing.in(cubic)` | `Video.tsx IN/OUT` |

## 2. 配色（沿用 CLAUDE.md 設計系統）

| 名稱 | Hex | 用途 |
|---|---|---|
| 背景 bg | `#0B1026` | 深藍底 |
| 格線 | `rgba(255,255,255,0.06)`，每格 60px | `Background.tsx` |
| 光暈 | 藍紫 `rgba(110,100,255,0.24)` 橢圓（中心隨 `sin(f/90)`、`cos(f/110)` 緩慢漂移）＋粉 `rgba(255,79,163,0.10)`；40 顆星點＋22 顆上飄光點，固定 seed `20261103` | `Background.tsx` |
| 青 cyan | `#22E5D4` | 主色之一、fact 標籤 |
| 粉 pink | `#FF4FA3` | 主色之一、pending 標籤 |
| 黃 yellow | `#FFD54A` | expected 標籤、「台灣視角」框、CompareSplit footer |
| 紫 purple | `#8B7CFF` | 第四色 |
| 白 | `#FFFFFF` | 文字 |
| 卡片底 | `rgba(18,26,60,0.72)`、圓角 20、1.5px 發光邊框 `boxGlow` | `Card.tsx` |
| 政黨色（本集未用） | dem `#6F8FC9`／rep `#C9807A`／undecided `#5B6280` | 本集沒有 SeatBar，不出現紅藍對立 |

圖示一律 `src/components/Icons.tsx` 自繪 SVG 霓虹描邊（stroke 3px＋`glow()` 外發光），不用外部圖片、不畫真人。

## 3. 本集主色與用色邏輯

本集主色：**青 `#22E5D4`**（制度與事實）配 **紫 `#8B7CFF`**（AI 議題）；粉與黃做分類與警示。

| 顏色 | 代表資訊類型 | 用在哪幾幕 |
|---|---|---|
| 青 cyan | 制度、政府、已確定事實、官方說法、「不直接變」 | 02 分裂政府卡、04 左欄（行政／法院）、07 第 1 步、10 第 1 步、11 右欄（選後預期）、12 道瓊漲、13 台灣科技業卡、14「不直接變」格、封面台股格 |
| 紫 purple | AI 監管議題 | 01 AI 監管格、03 凌駕州法卡、05 AI 監管走向卡、10 第 4 步（民主黨新版）、12 那斯達克格、14 時間點格、封面 AI 監管格 |
| 黃 yellow | 資料中心／能源、國會立法欄、「待觀察」 | 01 資料中心格、04 右欄（國會立法）、06 公投 BigNumber、07 第 3 步、10 第 3 步、12 台股格、14「尚未確定」格、封面資料中心格 |
| 粉 pink | 晶片／半導體、警示與「尚未確定」 | 01 晶片格、07 第 2 步（高盛 45%）、08 對中晶片管制卡、09 48D BigNumber、10 第 2 步（參院未過）、11 左欄（白宮要求砍）、12 費半跌、14「轉趨嚴格」格、封面晶片格 |
| 狀態標籤（固定） | fact 青／expected 黃／pending 粉，`StatusTag` 30px 膠囊 | 05、08、13 ImpactCard 每列；06、09 BigNumber tag；封面 tags |

規則：同一幕內「卡片主色」表示主題分類，「標籤色」表示確定程度，兩者分開讀；市場幕的漲跌用 `trendUp`（青）／`trendDown`（粉）圖示表示方向，不另外用紅綠。

## 4. 每幕元件與進場動畫

`anim.ts` 參數：
- `rise(frame, delay, dist=40)`：spring（damping 14、stiffness 110、mass 0.7），opacity `min(1, s×1.15)`、translateY `(1−s)×dist`。
- `pop(frame, delay, from)`：spring（damping 10、stiffness 160、mass 0.6），scale 從 `from` 彈到 1。
- `progress(frame, delay, dur)`：0→1，`Easing.out(cubic)`，clamp。

| # | id | 元件 | 主色 | 進場（幀，相對本幕開始） | 畫面重點 |
|---|---|---|---|---|---|
| 01 | hook | IconGrid 2×2 | 四色 | 標題 `rise(f,0)`；4 格 `rise(f, 8+i×7)` | 「國會換手 × 科技」四格：AI 監管／晶片／資料中心／台灣科技業 |
| 02 | term-divided-government | TermCard | 青 | 卡 `rise(f,0)`；圖示描線 `progress(f,0,30)`；定義打字機 `progress(f,18,45)×字數`；3 點 `rise(f, 50+i×8, 20)` | 分裂政府；參院 54：44、2 席未判定；新國會 2027/1/3 |
| 03 | term-preemption | TermCard | 紫 | 同上 | 凌駕州法；加州 SB 53 已生效、科羅拉多／紐約 2027/1/1、參院 99–1 |
| 04 | who-decides | CompareSplit | 青／黃 | 左卡 `rise(f,0)`、右卡 `rise(f,8)`；項目 `rise(f, d+12+i×7, 16)`；footer `rise(f,45)`（黃字） | 行政・法院 vs 國會立法，各 3 項 |
| 05 | ai-regulation | ImpactCard | 紫 | 卡 `rise(f,0)`；圖示 `progress(f,0,30)`；3 列 `rise(f, 14+i×9, 18)`；台灣視角框 `rise(f, 14+3×9+6, 18)` | expected／expected／pending；台灣視角：逐州對規則 |
| 06 | data-center-ballots | BigNumber | 黃 | 圖示 `rise(f,0)`＋描線 `progress(f,0,30)`；標籤 `rise(f,4)`；數字 0→40 遞增 `progress(f,10,40)`（`1−(1−p)³`），第 50 幀後 `pop(f,50,0.93)`；note `rise(f,30)`；tag `rise(f,36)` | 「40/41」150px Inter 800 ＋ glow；tag fact |
| 07 | governors-pause | FlowRow 3 步 | 青→粉→黃 | 標題 `rise(f,0)`；第 i 步卡 `rise(f, 8+i×22)`；箭頭描線 `progress(f, d−10, 12)`（d＝8+i×22） | 州長主張（未落實）→ 高盛約 45%（未核對）→ 延後非取消（UBS 約 30%） |
| 08 | chip-export-controls | ImpactCard | 粉 | 同 05 | fact／expected／pending；台灣視角：台積電代工 Nvidia |
| 09 | chip-credit-48d | BigNumber | 粉 | 同 06 | 「35%」；note 含「截至 2026/11/6 尚未過關」；tag pending |
| 10 | crypto-clarity | FlowRow 4 步 | 青→粉→黃→紫 | 同 07（4 步、3 支箭頭；總高約 880px，在 1030 內） | 2025/7 眾院通過 → 9/15 參院 49–50 → 2027/1/3 失效 → 民主黨擬重提（尚未確定） |
| 11 | science-budget | CompareSplit | 粉／青 | 同 04 | 白宮要求（NSF −55%、NASA −23%、眾院版 −20%）vs 選後預期；footer 解釋 NSF／NASA |
| 12 | markets | IconGrid 2×2 | 青／粉／紫／黃 | 同 01 | 標題「選後市場紀錄（非投資建議）」；道瓊 11/4、費半 11/4、那斯達克 11/5（收盤待確認）、台股 11/5 |
| 13 | taiwan-tech | ImpactCard | 青 | 同 05 | fact／pending／expected；台灣視角：鴻海、緯創表態 |
| 14 | summary | IconGrid 2×2 | 青／粉／黃／紫 | 同 01 | 不直接變／轉趨嚴格／尚未確定／時間點 |
| 15 | end | EndCard | 青 | logo 圓 `progress(f,0,30)`；「白話國際」110px `rise(f,8)`；slogan `rise(f,14)`；英文 `rise(f,20)`；追蹤／分享／留言膠囊 `rise(f,28)`；下集 `rise(f,36)`；聲明 `rise(f,40)` | 無字幕、無來源列 |

元件規則：中段 04–14 不連續使用同一元件（02–03 兩張 TermCard 是名詞解釋段，依規格刻意連用）。

## 5. 字幕與字級

| 項目 | 規格 |
|---|---|
| 中文字幕 | Noto Sans TC（`FONT_ZH`：Inter 排前、Noto Sans TC 補中文）、64px、weight 900、line-height 1.3、白色、`text-shadow: 0 4px 18px rgba(0,0,0,0.8)`；置中於 left/right 64、bottom 290 |
| 斷行 | 每行 ≤14 字（標點不計）、最多 2 行；超過 14 字時在最接近中間的「，；：、」後自動斷行（`splitLines`，validator 與 Subtitle.tsx 同一份邏輯）。本集 15 幕皆已驗證：第一行 6–14 字、第二行 8–13 字 |
| 關鍵詞 | 每幕 1–3 個，依序上色 `[#FFD54A, #22E5D4, #FF4FA3, #8B7CFF]`，上色時加 `0 0 18px <色>99` 光暈；`white-space: nowrap` 不拆行。本集關鍵詞皆落在單一行內（已用 `splitLines` 檢查） |
| 配音時間軸 | 每行 `rise(f, lineStart, 20)`；每個字唸到才由 42% 亮到 100%（KTV 式）；關鍵詞被唸到時 `pop(f, kwStart, 0.86)` 彈一下。由 `npm run align` 產生 `timeline.json` |
| 英文字幕 | Inter 28px、`rgba(255,255,255,0.7)`、line-height 1.35、margin-top 14；≤90 字元（本集最長 88） |
| 元件內字級 | TermCard 名詞 68／定義 44／要點 38；ImpactCard 標題 58／列 36／台灣視角 34；CompareSplit 標題 54／項目 34／footer 34（黃）；FlowRow 標題 52／步驟 46／註 34；IconGrid 標題 56／格名 40／註 30；BigNumber 標籤 48／數字 150（Inter 800）／註 36；StatusTag 30 |

## 6. 封面（`npm run still us-midterm-tech-2026` → `out/us-midterm-tech-2026-cover.png`）

| 層 | 規格（`Cover.tsx`） | 本集內容 |
|---|---|---|
| 背景＋頁首 | 同正片 | — |
| 圖示列 | top 420、兩顆 200px、間距 40 | `capitol` 青、`chip` 粉 |
| 大標 | 132px/900、line-height 1.18；第 1 行白、第 2 行黃＋`glow(#FFD54A,10)` | 「美國國會換手」／「科技會怎麼變」 |
| 副標 | 56px/700 青、margin-top 40 | 「AI、晶片、資料中心、台股」 |
| 英文 | Inter 32px、白 70% | After the 2026 US Midterms: What changes for tech? |
| 四格 | 2×2、寬 820、gap 24；每格卡片底＋1.5px 同色邊框＋圓角 20、圖示 70、字 52px/900 | AI 監管（紫 robot）／晶片（粉 chip）／資料中心（黃 server）／台股（青 chart） |
| 狀態標籤 | `StatusTag` 30px 膠囊、margin-top 56 | fact「資料截至 2026/11/6」、pending「參院 2 席、眾院席次未定」 |

## 7. 交付前畫面檢查（對應 CLAUDE.md 清單）

1. `npm run still us-midterm-tech-2026`，逐幕看 `out/us-midterm-tech-2026/stills/*.png`：安全區、溢出、缺字方框（本集用到「×」「→」「–」「vs」「％」皆為 Noto Sans TC／Inter 有的字元）。
2. 密度最高的三幕：04 CompareSplit（每側 3 項、最長 17 字會折 2 行）、10 FlowRow（4 步約 880px）、12 IconGrid（註最長 23 字折 2 行）——確認卡片底緣不壓到字幕（字幕頂約 1920−290−64×1.3×2 ≈ 1460px；元件區底 330＋1030＝1360px）。
3. 數字與 `research.md` 一致、尚未確定的畫面文字都帶「截至 2026/11/6」或「待確認」。
4. 最後一幕 EndCard；`ffprobe out/us-midterm-tech-2026.mp4` 確認可播放、總長 70–100 秒。
