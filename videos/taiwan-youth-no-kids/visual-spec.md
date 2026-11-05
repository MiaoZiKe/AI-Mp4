# 畫面規格：taiwan-youth-no-kids

可直接對照 `src/` 執行；所有尺寸、顏色、動畫參數都引用現有程式碼（theme.ts、Video.tsx、Cover.tsx、components/anim.ts），本集不新增元件。

## 1. 基本規格
- 畫布 **1080×1920、30fps**，輸出 H.264 MP4（`npm run render taiwan-youth-no-kids` → `out/taiwan-youth-no-kids.mp4`）。
- 安全區（theme.ts `SAFE`）：上下各 **220px**、左右各 **64px**。
- 版面（Video.tsx）：
  - Header：top 220，左「logo＋白話國際」40px／900，右「國際白話講」粉色膠囊 30px。
  - 全片進度條：top 306（SAFE.top＋86）、高 4px，青→粉漸層。
  - 內容區：top 330、高 **1030**（EndCard 1370），元件水平垂直置中；整幕 Ken Burns 緩慢推近 ×1.000→1.025。
  - 字幕：bottom 290（SAFE.bottom＋70），左右貼安全區、置中。
  - 來源列：bottom 220，22px、白 50%，單行、超出以省略號收尾（所以每幕 `sources` 控制在 2–4 個短名稱）。
- 換幕：進場 10 幀（0.33 秒）淡入＋上移 36px→0＋縮放 1.03→1；出場 9 幀（0.3 秒）淡出＋上移 20px。
- 無配音時每幕 5–10 秒（字數估）；有 timeline.json 時以配音為準：幕長＝0.3 秒前導＋音檔＋0.5 秒尾（片尾 1.2 秒）。

## 2. 配色（沿用 CLAUDE.md 設計系統，theme.ts `C`）
| 名稱 | hex | 本集用途 |
|---|---|---|
| 背景 bg | `#0B1026` | 深藍底＋6% 白細格線（60px）＋緩慢漂移的藍紫光暈、星點與上飄光點（Background.tsx，固定 seed 20261103） |
| 青 cyan | `#22E5D4` | **官方統計與定義**：總生育率定義卡、2026 出生數卡、0–2 歲幼兒數、1975 年起點、行政院版、一句話總結、公托關鍵數字 |
| 粉 pink | `#FF4FA3` | **下滑與警訊**：0.695 大數字、房價所得比、2024 年未婚 41.4%、公托名額、「不想讓孩子一起吃苦」 |
| 黃 yellow | `#FFD54A` | **錢**：青年月薪、年總工時、經濟負擔 60.3%、5,839 億預算卡、「薪水只夠養活自己」、沒有公托的 164 個鄉鎮區（警示） |
| 紫 purple | `#8B7CFF` | **制度與關係**：婚育綁定、不婚（未婚者沒對象）、擔心教養與未來、立法院版、「不確定能負責一輩子」、年總工時（封面格） |
| 白 | `#FFFFFF` | 內文、字幕 |
| 卡片底 | `rgba(18,26,60,0.72)` | 圓角 20px、1.5px 發光邊框（Card.tsx） |
| 狀態標籤 | fact 青／expected 黃／pending 粉（BigNumber.tsx `STATUS`） | 「已確定／分析預期／尚未確定」膠囊，ImpactCard 每列與 BigNumber 下方 |

政治中立：第 12 幕行政院版用 **青**、立法院版用 **紫**，不用 `C.dem`／`C.rep` 紅藍，兩邊版面完全對稱、都有文字標示，footer 只寫「尚未定案」不評價。

## 3. 字型與字幕
- 字型：Noto Sans TC（中文 400/700/900）、Inter（英文與數字 400/600/800），由 `@remotion/google-fonts` 載入；本機鏡像 `public/fonts/`（`npm run fonts`，still/render 自動執行）。
- 中文字幕 **64px／900**、行高 1.3、白字＋黑色投影；每行 ≤14 字（標點不計）、最多 2 行，在最接近中間的「，」斷行；關鍵詞依序上色 **黃→青→粉**（Subtitle.tsx `colors`），被唸到時彈一下（pop 0.86→1）並加同色光暈；逐字點亮（未唸到的字 42% 透明）。
- 英文字幕 **28px**、白 70%、行高 1.35、與中文間距 14px、≤90 字元。
- 數字一律用 Inter：BigNumber 的大數字 150px／800，`prefix/suffix` 只放 ASCII（本集 0.695、2,030 都不帶單位，單位寫在 label），避免 FONT_EN 缺中文字形。

## 4. 進場動畫參數（components/anim.ts）
- `rise(frame, delay, dist=40)`：spring（damping 14、stiffness 110、mass 0.7），opacity＝min(1, s×1.15)，translateY＝(1−s)×dist → 「淡入＋上移、帶一點過衝」。
- `progress(frame, delay, dur)`：0→1、ease-out cubic（開頭快收尾慢），用於圖示描線與打字機。
- `pop(frame, delay, from)`：spring（damping 10、stiffness 160、mass 0.6），from→1 的彈出。
- 圖示：Icons.tsx 自繪 SVG 霓虹描邊，stroke 3px＋外發光，`draw` 由 progress 控制描線。

各元件時間軸（幀，相對幕開始）：

| 元件 | 動畫 |
|---|---|
| TermCard | 卡片 rise(0)；圖示描線 progress(0,30)；定義打字機 progress(18,45)；重點列 rise(50＋i×8, 20) |
| FlowRow | 標題 rise(0)；第 i 步 d＝8＋i×22：箭頭描線 progress(d−10,12)、卡片 rise(d) |
| CompareSplit | 左卡 rise(0)、右卡 rise(8)；各項 rise(d＋12＋i×7, 16)；footer rise(45) |
| BigNumber | 圖示 rise(0)＋描線 progress(0,30)；label rise(4)；數字 10→40 幀 ease-out 遞增到目標值，第 50 幀 pop(0.93) 彈一下；note rise(30)；狀態標籤 rise(36) |
| IconGrid | 標題 rise(0)；第 i 格 rise(8＋i×7) |
| ImpactCard | 卡片 rise(0)；圖示描線 progress(0,30)；第 i 列 rise(14＋i×9, 18) |
| EndCard | logo 圓描線 progress(0,30)；「白話國際」rise(8)、slogan rise(14)、英文 rise(20)、追蹤／分享／留言膠囊 rise(28)、下集預告 rise(36)、聲明 rise(40) |

## 5. 逐幕規格

| # | id | 元件 | 主色 | 畫面重點與狀態標示 |
|---|---|---|---|---|
| 01 | hook | IconGrid 2×2 | 粉／黃／紫／青 | 標題「四個關鍵數字」；房價所得比、青年月薪、年總工時、公托覆蓋率四格（note 各 ≤24 字）；字幕關鍵詞「不敢生」黃、「不想生」青 |
| 02 | what-is-tfr | TermCard | 青 | 圖示 baby；定義打字機；重點：2.1 門檻、1984 年起低於 |
| 03 | marriage-bound | TermCard | 紫 | 圖示 ring；「婚育綁定」定義；重點：2025 結婚 10.4 萬對、20–49 歲女性有配偶 43.5% |
| 04 | tfr-record-low | BigNumber | 粉 | 圖示 trendDown；數字 0.000→0.695（decimals 3）；note 含香港／南韓／日本對照；標籤 **已確定** |
| 05 | births-2026 | ImpactCard | 青 | 4 列：已確定 ×2（1–9 月、2 月）、分析預期（國發會 9.4 萬）、**尚未確定（10 月數字截至 2026/11/6 尚未公布）** |
| 06 | top-reasons | FlowRow 3 步 | 黃→粉→紫 | 標題「26.6% 女性不想生，為什麼？」；60.3%→49.4%→34.3% 依箭頭依序出現 |
| 07 | wage-vs-housing | CompareSplit | 黃 vs 粉 | 左青年月薪（wallet）、右房價所得比（house）；footer 黃字「內政部 2026 Q1；Q2 截至 11/6 尚未公布」 |
| 08 | working-hours | BigNumber | 黃 | 圖示 clock；0→2,030 遞增；note 南韓 1,859、日本 1,636；標籤 **已確定**；不出現「全球第 5」 |
| 09 | childcare-gap | IconGrid 2×2 | 青／粉／黃／紫 | 標題「公托有多難搶（聯合報盤點）」；38.1 萬 vs 1.8 萬（不含準公共、保母）、164 個鄉鎮區、329 搶 1 |
| 10 | unmarried-trend | FlowRow 3 步 | 青→粉→紫 | 標題帶出處「中研院鄭雁馨」；1975 年 5.3% → 2024 年 41.4% → 未婚者約三分之二沒對象 |
| 11 | policy-spending | ImpactCard | 黃 | 圖示 coins；已確定 ×3（5,839 億、1.125→0.695、12% 認為有用）、分析預期（立院預算中心：多生效果有限） |
| 12 | two-cash-plans | CompareSplit | 青 vs 紫 | 行政院版（building）vs 立法院版（gavel），對稱版面；footer「兩版如何整合，截至 2026/11/6 尚未定案」 |
| 13 | youth-voices | IconGrid 2×2 | 黃／粉／青／紫 | 四句引述加「」，note 標「不敢生 ·／不想生 ·」＋出處；不畫人物，用 wallet／house／heart／question 圖示 |
| 14 | summary | ImpactCard | 青 | 圖示 bulb；已確定 ×2、分析預期（不婚是關鍵）、**尚未確定（10 月出生數、0–18 歲津貼整合）** |
| 15 | end | EndCard | 青 | 下一集：南韓生育率為什麼連兩年回升？；聲明「本片使用 AI 輔助製作，由真人選題與審核。」 |

元件順序：IconGrid→TermCard→TermCard→BigNumber→ImpactCard→FlowRow→CompareSplit→BigNumber→IconGrid→FlowRow→ImpactCard→CompareSplit→IconGrid→ImpactCard→EndCard（除第 2–3 幕名詞卡外，沒有連續兩幕同元件）。

## 6. 封面（Cover.tsx，`npm run still` 輸出 `out/taiwan-youth-no-kids-cover.png`）
- 圖示列：top 420，baby（青）＋ house（粉），各 200px、間距 40。
- 大標兩行 132px／900：第 1 行「台灣年輕人」白、第 2 行「為什麼不生？」黃＋黃色光暈。
- 副標「不敢生，還是不想生？」56px 青；英文「Why aren't young Taiwanese having kids?」32px 白 70%。
- 2×2 格（寬 820）：房價（house 粉）、薪資（wallet 黃）、工時（clock 紫）、托育（stroller 青），70px 圖示＋52px 字。
- 狀態標籤：fact「資料截至 2026/11/6」（青）＋ pending「10 月出生數尚未公布」（粉）。

## 7. 製作前截圖檢查（`npm run still taiwan-youth-no-kids` → `out/taiwan-youth-no-kids/stills/`）
- 第 05、11、14 幕 ImpactCard 四列：每列文字 36px 可能折 2 行，確認卡片總高 ≤1030、不壓到字幕。
- 第 06、10 幕 FlowRow 三步＋標題：高度約 850px，確認最後一張卡不超出內容區。
- 第 13 幕 IconGrid 標籤含「」與第 09 幕的「（不含準公共、保母）」：確認 Noto Sans TC 子集有這些標點、無方框。
- 第 04、08 幕 BigNumber：「0.695」「2,030」用 Inter，皆 ≤9 字元；狀態標籤出現在 note 下方。
- 第 07、12 幕 CompareSplit：titleEn 全英文（避免 FONT_EN 缺中文字形）；footer 黃字單行。
- 來源列每幕單行不被省略：第 06 幕「衛福部 113 年婦女生活狀況調查、自由時報」最長，確認未截斷。
- 10 月出生數公布後（預計 11/8–10）：更新第 05 幕第 4 列、第 14 幕第 4 列、封面 pending 標籤與 `asOf`，再重跑該兩幕 TTS。
