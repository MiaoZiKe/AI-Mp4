# 影片詳細提示詞｜2026 美國期中選舉結果，對你的投資有什麼影響？

> 本檔案完整描述已完成影片 `output/midterm-2026.mp4` 的每一個畫面、文字、動畫與聲音，可直接當作重製、改版或交給其他 AI 影片工具的提示詞使用。
> 所有數據以 `research.md`（資料截至 2026/11/04）為準。

---

## 一、總體提示詞（可整段複製）

```
製作一支 9:16 直式財經短影片，1080×1920、30fps、長度 58.9 秒，繁體中文字幕＋繁中男聲旁白。
主題：2026 美國期中選舉結果，對美國政策、全球市場與台灣的影響。
受眾：台灣散戶投資人、對美國政治不熟的一般大眾。語氣中立、口語好懂，只講事實與「市場普遍預期」，不評價任何政黨。

視覺風格：「報紙社論＋資訊圖表」，莊重但好讀。
- 背景：米白新聞紙 #F4F0E6，疊一層灰階 feTurbulence 紙紋（multiply、透明度 0.12），右上角有淡淡的 45° 半色調網點（透明度約 5%），四周微暗角。
- 色彩：主色深海軍藍 #1B2A41；共和黨紅 #C8423B、民主黨藍 #2F5DA8 只用在資料視覺，面積與尺寸對等；強調色金黃 #E0B33A；次要文字 #3A4659；卡片底色 #FBF8F1。
- 字體：標題 Noto Serif TC 900；內文與字幕 Noto Sans TC 700；數字與英文標籤 JetBrains Mono 700–800。
- 所有圖像皆以向量線稿／幾何圖形繪製：不用照片、不用政黨標誌、不出現任何真人或肖像、不使用任何吉祥物或動物角色。

固定版面（每一格都相同）：
- 左上：SVG 筆記本 logo（海軍藍封面、左側四個裝訂環、內頁米白、一條金黃橫線＋三條藍灰橫線、一支金黃鉛筆斜放），旁邊「每日財經筆記」（Serif 900、40px）與「@daily.finance.notes」（Mono、22px）。
- 右上：兩個膠囊標籤「美國政治」（實心海軍藍、白字）與「投資影響」（米白底、海軍藍外框）。
- 報頭橫幅（y≈178–330）：上方 8px 粗黑線、下方雙細線；中央大標「期中選舉特刊」（Serif 900、76px、字距 6px），左側「U.S. MIDTERMS 2026」（Mono 小字），右側微傾斜 −2° 的方框日期戳記「資料截至 2026/11/04」。
- 內容區：y 380–1420，左右各 64px 邊距；每格上方一行金黃短槓＋Mono 小標（kicker），下面是 Serif 900、64px 的單行標題。每格底部一行 21px 來源說明。
- 字幕：固定在 y 1452–1652（離底部 268px，避開 Reels 介面）；海軍藍圓角膠囊、左側 8px 金黃直條、白色 Noto Sans TC 700 54px、單行置中，過長時自動縮字。

動畫規則：
- 所有元素動作只用 power3.out 或 expo.out，禁止線性；同組元素進場錯開 80ms。
- 轉場：橫向推移 0.4 秒（舊頁往左、新頁從右，兩頁同步、無空白幀）；新頁內容在推移途中已開始進場。
- 背景永遠微動：整支影片從 scale 1 緩慢推近到 1.03，網點緩慢斜向漂移（sine.inOut，前後端不會停住）。
- 數字一律 count-up 從 0 跑到目標值；折線用 stroke-dashoffset 由左往右畫出；重點詞加金黃螢光筆由左往右劃過（scaleX 0→1、斜切 −8°）。
- 字幕在旁白開始的同一刻出現（0.25 秒 expo.out 由下 18px 浮起），誤差 ≤0.1 秒；下一句開始前 0.12 秒淡出。

聲音：
- 旁白：沉穩、新聞主播感的中文男聲，約每秒 4–4.5 字，每句分開錄製，句間停 0.1 秒，每格開頭留 0.2 秒、結尾留 0.3 秒。
- BGM：程式合成的低調 pad 和弦循環 Dm9 → B♭maj7 → Fmaj7/A → Csus2（每和弦 4 秒），加柔和低音與每拍一下的悶音撥弦，低通 3.2kHz；音量 −22 LUFS，旁白出現時自動壓低 6dB。
- 音效：開場 BREAKING 印章「咚」一聲（低頻下掃＋短促噪音＋喀聲），兩個「計票中」小印章較輕；每次轉場一個輕柔 whoosh（掃頻濾波噪音 0.5 秒）。
- 混音完成後響度正規化到 −14 LUFS，真峰值 ≤ −1.5 dBTP。

輸出：H.264 MP4（yuv420p、CRF 18）、AAC 192k／48kHz 立體聲。
```

---

## 二、逐格分鏡提示詞

時間碼以實際配音長度排定（`timeline.json`）。旁白欄是唸出來的稿子，字幕欄是畫面上顯示的文字。

### 第 1 格｜鉤子（0:00.0–0:04.7）
- **Kicker**：「2026 期中選舉 · 開票結果」
- **畫面**：
  - 上半部是簡化美國地圖（50 州＋DC，Albers 投影，寬 952px）。第 0 幀就以 35% 透明度淡淡出現，接著各州由西向東依序淡入，填上三種深淺不同的藍灰色，州界為米白細線。
  - 0.35 秒時，右上角「BREAKING」印章從 2.4 倍大、旋轉 −18° 用 expo.out 蓋下，停在 −7°。印章是海軍藍雙線框、Mono 粗體、半透明米白底，同時響起印章音效。
  - 約 1.1 秒時，阿拉斯加與密西西比改填金黃色並加海軍藍描邊；旁邊各蓋一個「計票中」小印章（金黃底、海軍藍字與外框，−6°）。
  - 下半部是大標「選完了，／你的投資會被影響嗎？」（Serif 900、88px，兩行），第 0 幀就在畫面上，只做 12px 的上浮定位。第二句旁白時，「投資」兩字劃上金黃螢光筆。
  - 底部說明：「金黃色：參議院仍在計票的阿拉斯加、密西西比」
- **旁白／字幕**：
  1. 美國期中選舉結果出爐。｜美國期中選舉結果出爐
  2. 選完了，你的投資會被影響嗎？｜選完了，你的投資會被影響嗎？

### 第 2 格｜結果總覽：席次圖（0:04.7–0:11.9）
- **Kicker**：「AP · NBC · CNBC 交叉比對」　**標題**：民主黨取得參眾兩院多數
- **畫面**：
  - 上方是參議院半圓席次圖：100 個圓點、5 排。民主黨藍在左、計票中灰（#A3A7AE）在中、共和黨紅在右。中央空心處寫「參議院」與「過半 51 席」。
  - 下方是眾議院半圓席次圖：435 個圓點、11 排。中央寫「眾議院」與「過半 218 席」。
  - 圓點一開始是淡米灰空位，隨旁白「由中心向外」逐排填色（內排先、每排由左而右）。每點從 0.4 倍放大到 1 倍，參議院約 1.1 秒填完、眾議院約 1.6 秒。
  - 席次圖下方三組標籤做 count-up（Mono 68px）：參議院「54 民主黨／2 計票中／44 共和黨」；眾議院「235 民主黨（已宣布）／54 計票中／146 共和黨（已宣布）」。兩黨標籤字級、位置完全對稱。
- **旁白／字幕**：
  1. 參議院，民主黨五十四席，共和黨四十四席。｜參議院 民主黨54席、共和黨44席
  2. 兩席計票中，眾議院民主黨也過半。｜兩席計票中，眾議院民主黨也過半

### 第 3 格｜權力結構（0:11.9–0:17.1）
- **Kicker**：「權力結構」　**標題**：分裂政府：總統與國會不同黨（第二句旁白時，「分裂政府」劃上金黃螢光筆）
- **畫面**：
  - 上方是美國國會大廈線稿（基座、柱廊、圓頂、旗桿，海軍藍 5px 線），以 stroke-dashoffset 逐筆畫出。
  - 下方是一座天平：海軍藍支柱、金黃支點圓。橫樑從 −6° 慢慢回到水平，兩邊等重，代表權力互相制衡。
    - 左盤寫「總統」（Serif 52px），下方是紅色膠囊「共和黨」。
    - 右盤寫「國會」，下方是藍色膠囊「民主黨」。兩個膠囊一樣大。
  - 最下方兩行說明依序浮入：「法案：國會通過＋總統簽署」「總統保有否決權，雙方需協商」。
- **旁白／字幕**：
  1. 總統屬共和黨，國會由民主黨主導，｜總統屬共和黨，國會由民主黨主導
  2. 這就是分裂政府。｜這就是「分裂政府」

### 第 4 格｜政策影響（0:17.1–0:23.8）
- **Kicker**：「立法方向 · 市場普遍預期」　**標題**：政策：立法節奏預期放慢
- **畫面**：2×2 卡片（米白底、海軍藍 3px 框、14px 圓角、右下錯位陰影），由下往上錯開 90ms 浮入。每張卡左上是向量圖示，下面是 Serif 標題，再下面是說明：
  - 預算（文件＋金幣圖示）：撥款、債限談判難度升高
  - 稅務（收據＋％圖示）：大型稅改不易通過
  - 關稅（貨櫃船圖示）：主導權仍在行政部門。第二句旁白時，這張卡的外框與陰影轉為金黃色。
  - 能源（圓形＋閃電圖示）：綠能條款可能被調整
- **來源**：Morningstar、Morgan Stanley、Deutsche Bank、Goldman Sachs 分析（Yahoo Finance 整理）
- **旁白／字幕**：
  1. 市場預期立法變慢，大型稅改難推，｜市場預期立法變慢，大型稅改難推
  2. 但關稅主導權，仍在行政部門。｜但關稅主導權仍在行政部門

### 第 5 格｜市場影響（0:23.8–0:29.3）
- **Kicker**：「選後首個交易日 · 11/4 盤中」　**標題**：市場：殖利率下滑、美元走弱
- **畫面**：
  - 上方是圖表卡，左上角標明「示意圖（非實際報價）」，背景為虛線格線。
    - 8 根 K 線依序彈入：前兩根實心（下跌）、後面空心（上漲）且位置逐步走高，代表「先震盪後回穩」。
    - 一條由左上往右下的 10 年期殖利率曲線（金黃 14px 底光＋海軍藍 5px 線），以 stroke-dashoffset 由左往右畫出。
    - 右下圖例：「— 10年期殖利率　▮ 美股」。
  - 下方三列指標（虛線分隔）由右側滑入：
    - 「10年期美債殖利率 ⬇ 下滑」先出現。
    - 「美元 ⬇ 走弱」「美股 〜 先震盪後回穩」接著出現。向下箭頭是海軍藍實心圓，震盪符號是空心圓加波浪線。
- **來源**：CNBC、FXStreet、Fox Business、Morningstar（初步走勢，非收盤定論）
- **旁白／字幕**：
  1. 選後首日，美債殖利率下滑，｜選後首日，美債殖利率下滑
  2. 美元走弱，美股先震盪，後回穩。｜美元走弱，美股先震盪後回穩

### 第 6 格｜產業影響（0:29.3–0:35.2）
- **Kicker**：「產業焦點」　**標題**：產業：AI、晶片、能源
- **畫面**：三張橫向長卡由右滑入，錯開 90ms。每張卡左邊是 140px 圖示，右邊是標題與說明。講到哪一張卡，那張的外框就轉為金黃：
  - 伺服器機櫃圖示｜AI／資料中心｜擔心監管審查增加（第一句旁白時亮金框）
  - 晶片圖示（海軍藍晶片、金黃核心、四邊接腳）｜半導體｜出口管制屬兩黨共識（第二句旁白時亮金框）
  - 太陽能板＋太陽圖示｜能源｜綠能條款可能被調整
- **來源**：Morningstar、Credendo、Yahoo Finance 分析師整理
- **旁白／字幕**：
  1. AI 股擔心資料中心監管增加，｜AI股擔心資料中心監管增加
  2. 晶片出口管制，則是兩黨共識。｜晶片出口管制則是兩黨共識

### 第 7 格｜對台灣的影響（0:35.2–0:43.1）
- **Kicker**：「對台灣的影響」　**標題**：台灣：對台政策預期延續（第一句旁白時，「預期延續」劃上金黃螢光筆）
- **畫面**：
  - 左側是簡化的台灣本島輪廓：海軍藍 5px 線，先以 stroke-dashoffset 畫出，再填滿金黃色。
  - 右側是台股資料欄：
    - 小字「台股加權指數 · 2026/11/04 收盤」
    - 大數字 count-up 到「42,948.91」（Mono 96px）。第三句旁白時，數字下方劃上金黃螢光筆。
    - 「▼ 358.63（−0.83%）」count-up
    - 註記「台灣白天美國仍在開票，屬對初步結果的反應」
  - 下方兩張橫卡隨旁白依序浮入：「對台政策　兩黨支持度高，預期延續」「半導體關稅　232 條款由行政部門主導」。
- **來源**：Credendo、數位時代、經理人、ETtoday、經濟日報
- **旁白／字幕**：
  1. 兩黨對台灣的支持度都高，｜兩黨對台灣的支持度都高
  2. 半導體關稅，仍看行政部門。｜半導體關稅仍看行政部門
  3. 台股四日收跌百分之零點八三。｜台股4日收跌0.83%

### 第 8 格｜歷史數據（0:43.1–0:52.7）
- **Kicker**：「歷史數據 · 1950 年以來」　**標題**：歷史：選後一年美股表現
- **畫面**：
  - 置中巨大數字「+16.6%」：Mono 800、210px，從 85% 放大進場並 count-up。第二句旁白時，下緣劃上金黃螢光筆。
  - 數字下方說明：「期中選舉後 12 個月 · 標普500 平均漲幅」。
  - 一排 19 個圓點，每個是金黃圓＋海軍藍勾勾。一開始是淡淡的空位，第三句旁白時逐一放大點亮（間隔 60ms）。旁邊的「0 / 19 次上漲」同時 count-up 到「19 / 19」。
  - 提醒卡：「⚠ 樣本只有 19 次，各機構算法不同（約 14%–18%）。過去表現不代表未來。」
- **來源**：BNY Investments、TradingView（Benzinga）、Deutsche Bank（Investing.com）
- **旁白／字幕**：
  1. 一九五零年以來，期中選舉後一年，｜1950年以來，期中選舉後一年
  2. 標普指數平均漲約百分之十六點六，｜標普500平均漲約16.6%
  3. 十九次都上漲，但不代表未來。｜19次都上漲，但不代表未來

### 第 9 格｜總結＋追蹤（0:52.7–0:58.9）
- **Kicker**：「一句話總結」
- **畫面**：
  - 大卡片內寫兩行大字「國會換手，／政策步調變慢」（Serif 900、100px），「政策步調變慢」劃上金黃螢光筆。
  - 卡片下方三個金黃菱形重點依序滑入：「分裂政府：法案需雙方協商」「關稅主導權仍在行政部門」「留意 AI、晶片、能源政策」。
  - 第二句旁白時，下方 CTA 浮入：150px 筆記本 logo＋「追蹤 每日財經筆記」（Serif 56px）＋「@daily.finance.notes」（Mono 40px）＋「看更多財經重點」。
  - 底部聲明：「本片使用 AI 輔助製作，由真人選題與審核 · 內容僅供參考，不構成投資建議」
- **旁白／字幕**：
  1. 總結：國會換手，政策步調變慢。｜總結：國會換手，政策步調變慢
  2. 追蹤每日財經筆記，看更多。｜追蹤 @daily.finance.notes 看更多

---

## 三、封面提示詞（cover.png，1080×1920）

```
與影片相同的報紙版面：米白新聞紙＋紙紋＋網點，左上筆記本 logo 與「每日財經筆記／@daily.finance.notes」，右上「美國政治」「投資影響」標籤，報頭「期中選舉特刊」與「資料截至 2026/11/04」戳記。
報頭下方右側斜放「BREAKING」印章（海軍藍雙線框，−8°）。
主標題兩行：「期中選舉結果」「對你有什麼影響？」（Noto Serif TC 900、116px、海軍藍），「什麼影響」四字劃上金黃螢光筆。
下方小標「參議院席次（2 席計票中）」，再下方是 100 點半圓席次圖：左 54 藍、中 2 灰、右 44 紅，圓點大小一致。
最下方三欄數字：藍色「54 民主黨」、灰色「2 計票中」、紅色「44 共和黨」（JetBrains Mono），字級相同、左中右對稱。
不用照片、政黨標誌、人物或任何吉祥物。
```

---

## 四、負面提示詞（不要出現）

```
不要照片、真人、政治人物肖像或剪影；不要政黨標誌（驢子、大象）或任何吉祥物、動物角色（含天竺鼠）；
不要螢光霓虹、科技感漸層、3D 金屬質感；不要線性等速移動；不要空白或閃黑的轉場幀；
不要評價性字眼（大勝、慘敗、浪潮、重挫等）；不要投資建議或「買進／賣出」字樣；
紅藍兩色不可用在非資料元素上，也不可一方面積或彩度明顯大於另一方；
字幕不可超過一行、不可壓到畫面底部 260px 內；不可出現缺字方塊。
```

---

## 五、英文精簡版（給英文介面的 AI 影片工具）

```
Vertical 9:16 finance explainer, 1080x1920, 30fps, ~59s, Traditional Chinese subtitles and calm male Mandarin news-anchor voiceover.
Topic: 2026 U.S. midterm results and what they mean for U.S. policy, global markets and Taiwan. Neutral tone, facts only.
Style: editorial newspaper + infographic. Off-white newsprint (#F4F0E6) with subtle paper grain and faint halftone dots;
deep navy #1B2A41 ink, Republican red #C8423B and Democratic blue #2F5DA8 used only in data graphics with equal visual weight, gold #E0B33A accents and highlighter swipes.
Fonts: Noto Serif TC Black headlines, Noto Sans TC Bold body/subtitles, JetBrains Mono numbers.
Fixed masthead: notebook logo + "每日財經筆記 @daily.finance.notes" top-left, pills "美國政治" "投資影響" top-right, banner "期中選舉特刊" with date stamp "資料截至 2026/11/04".
Subtitles: single-line white text in a navy rounded box with a gold left bar, placed 268px above the bottom.
9 scenes: (1) US map fades in west-to-east, BREAKING stamp, Alaska & Mississippi in gold with "計票中" stamps, hook question;
(2) Senate 100-dot and House 435-dot hemicycles fill from the center outward: Senate D54 / R44 / 2 pending, House D235 / R146 / 54 pending (called seats), with count-up numbers;
(3) Capitol line drawing + balanced scale: President (Republican) vs Congress (Democratic) = divided government;
(4) four policy cards: budget, tax, tariffs, energy; (5) schematic candlesticks + falling 10-year yield line drawn left to right, yields down, dollar weaker, stocks volatile then steadier;
(6) AI/data center, semiconductors, energy cards; (7) Taiwan outline drawn then filled gold, TAIEX 42,948.91 (−358.63, −0.83%) on 2026/11/04;
(8) giant "+16.6%" count-up, 19 of 19 dots light up (S&P 500 average 12 months after midterms since 1950; past performance is not a guarantee);
(9) summary "國會換手，政策步調變慢" + follow CTA.
Motion: power3.out / expo.out only, 80ms staggers, 0.4s horizontal push transitions with overlapping pages, slow background zoom 1→1.03 and halftone drift that never stops.
Audio: synthesized ambient news pad (Dm9–Bbmaj7–Fmaj7/A–Csus2) at −22 LUFS ducking −6dB under voice, stamp hit on BREAKING, soft whooshes on transitions, final mix −14 LUFS.
No photos, no real people, no party logos, no mascots or animal characters.
```
