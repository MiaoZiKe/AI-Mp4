# 影片詳細提示詞：美國期中選舉，跟台灣有什麼關係？

- 用途：逐幕重現本片畫面，可貼進 AI 影片／圖像工具（Sora、Runway、Kling、Midjourney 等），或交給剪輯師照做
- 規格：1080×1920 直式、30fps、總長 89.6 秒、12 幕、換幕 0.3 秒淡入淡出
- 資料截至：2026/11/4（數字來源見 research.md）
- **重要**：AI 生成工具畫中文字常會錯字或亂碼。建議只用 AI 生成「無文字的背景與線稿動畫」，所有中英文字幕、數字、標籤都在剪輯軟體裡另外疊字。

---

## 一、全片共用風格提示詞（每一幕都要加在最前面）

**中文**
> 藍圖工程圖風格的直式資訊動畫，深海軍藍漸層背景（#0E2A5C 到 #0A1F45），白色 8% 透明度的細格線、每格 40px，每 5 格一條較粗的白色 15% 格線。畫面內縮一圈白色細框，四個角有十字對位標記，像工程圖紙。所有物件都是白色線稿（線寬 2.5px），帶技術製圖元素：外框、斜線剖面填充、帶箭頭的尺寸標註線、虛線引出線加小標籤卡。重點色只用亮黃 #FFC83D（框選、關鍵字）和青色 #5EE6FF（次要標註）。線稿以描線動畫逐筆畫出，動作用彈簧曲線，鏡頭緩慢推近。乾淨、冷靜、專業、扁平向量，沒有寫實質感。

**English**
> Vertical 9:16 blueprint-style technical explainer animation. Deep navy gradient background (#0E2A5C to #0A1F45) with a fine white grid at 8% opacity (40px cells) and a heavier grid line every 5 cells at 15% opacity. An inset thin white border frame with crosshair registration marks in all four corners, like an engineering drawing sheet. All objects are white line art (2.5px strokes) with drafting details: outlines, diagonal hatching, dimension lines with arrowheads, dashed leader lines ending in small label cards. Accent colors only: bright yellow #FFC83D for highlights and boxes, cyan #5EE6FF for secondary annotations. Lines draw themselves on stroke by stroke, motion uses spring easing, the camera slowly pushes in. Clean, calm, professional, flat vector, no photorealism.

**負面提示詞（Negative prompt）**
> real people, faces, politicians, photographs, flags waving, party logos, red-vs-blue conflict imagery, fire, explosions, dramatic lighting, 3D render, glossy, neon glow, gradients on line art, cluttered, watermark, garbled text, random letters, stock footage

**固定版面（所有幕都一樣，建議剪輯時疊上）**
- 左上（y≈224–300）：地球儀線稿 logo＋「白話國際」粗體＋小字 `BAIHUA INTL`
- 右上：黃色外框膠囊標籤「國際白話講」
- 內容區：y 330–1334
- 來源小字：y≈1334，JetBrains Mono 19px，白色 55%，格式「▸ 來源 SRC: ○○ ｜ 資料截至 2026/11/4」
- 字幕底板：y 1370–1700，半透明深藍底、上緣白色細線；中文 Noto Sans TC 粗體 64px（關鍵詞黃色）、英文 JetBrains Mono 28px 70% 白；底板最下方一條工程刻度尺
- 背景音樂：低調 lo-fi（76 BPM，Am9–Fmaj7–Cmaj7–G6 循環，輕底鼓、刷聲、黑膠底噪），平均音量約 -20dB

---

## 二、逐幕提示詞

### 第 1 幕｜鉤子（0.0–7.2 秒）
- **旁白**：美國人投票，為什麼台灣人也要關心？因為關稅、晶片和軍售，美國國會都有發言權。
- **畫面中文**：上半部三行超大字（104px 粗體）「美國人投票，／為什麼**台灣人**／也要關心？」，「台灣人」是黃色並有黃色底線。下半部左邊是美國國會大廈線稿（標註 `US CONGRESS · 美國國會`），右邊是黃色台灣輪廓（標註「台灣」），中間三張直排小卡：貨櫃船「關稅 TARIFFS」、晶片「晶片 CHIPS」、盾牌「軍售 ARMS SALES」，青色虛線從國會大廈分出連到三張卡，再匯到台灣。台灣外圍有黃色橢圓圈選並脈衝。
- **動畫**：問句三行依序彈入 → 國會大廈描線畫出 → 虛線延伸、三張卡依序彈出 → 台灣輪廓描線 → 黃圈畫出並開始脈衝。
- **AI 影片提示詞（英文）**：
  > [共用風格] Top half: empty space reserved for large headline text. Bottom left: a white line-art drawing of a domed legislative building with columns, drawing itself on. Three small rounded label cards stacked vertically in the middle, each containing a tiny line icon (cargo ship, microchip, shield). Cyan dashed lines extend from the building to each card, then converge to the right onto a yellow outline of an elongated leaf-shaped island. A yellow ellipse draws around the island and pulses gently. Slow push-in toward the lower center.

### 第 2 幕｜名詞解釋：期中選舉（7.2–15.0 秒）
- **旁白**：期中選舉，就是總統四年任期中間的國會大選。眾議院全部改選，參議院只改選約三分之一。
- **畫面中文**：上方名詞卡：黃色大字「期中選舉」＋青色 `/ MIDTERM ELECTION`，下面白框輸入框以打字機效果打出「總統四年任期的中間，舉行的國會選舉」，黃色游標閃爍。中段一條 2025→2029 的時間軸（標 `PRESIDENTIAL TERM · 總統任期 4 年`），刻度依序出現，中間偏左一個黃色圓點脈衝，標「2026/11/3 期中選舉」，上方虛線尺寸標註分成前後兩半。下方兩個大數字遞增：黃色「435」（眾議院 全部改選／`HOUSE · ALL SEATS`）、青色「35」（參議院 改選席次／`SENATE · ~1/3 OF 100`）。
- **動畫**：名詞卡彈入 → 打字機 → 時間軸由左往右畫 → 黃點出現並脈衝 → 兩個數字從 0 跳到目標值。
- **AI 影片提示詞**：
  > [共用風格] A horizontal timeline draws from left to right with five evenly spaced tick marks; a yellow dot appears at the midpoint and emits pulsing rings. A dashed dimension line splits the timeline into two equal halves. Above it, an empty rectangular input box with a blinking yellow cursor. Below, two large blank areas reserved for big numbers. Minimal, technical.

### 第 3 幕｜參議院 vs 眾議院（15.0–22.8 秒）
- **旁白**：眾議院管錢包，稅收法案要從這裡先提出。參議院管人事和條約，像官員任命要它同意。
- **畫面中文**：左右兩個等寬白框面板，中間黃色圓圈「VS」。
  - 左：`HOUSE`／「眾議院」／投票箱線稿（紙上打勾）／黃字「435 席 · 任期 2 年」／條列：01 **稅收法案先從這提出**（黃）、02 可以發動彈劾、03 人數多、全部改選
  - 右：`SENATE`／「參議院」／天秤線稿／黃字「100 席 · 任期 6 年」／條列：01 **同意官員任命**（黃）、02 批准對外條約、03 每次改選約 1/3
  - 底部黃色虛線框：「共通點：一般法案要『兩院都通過』才能送總統」
- **動畫**：左面板先上滑，右面板延遲 0.27 秒；圖示描線；條列依序從左滑入；底部框最後淡入。
- **AI 影片提示詞**：
  > [共用風格] Split screen: two tall rectangular panels side by side with thin white borders, a small yellow circle badge in the center between them. Left panel: line-art ballot box with a paper and a check mark, drawing itself on. Right panel: line-art balance scale with two pans, drawing itself on. Below each icon, three short horizontal placeholder lines appear one by one. A dashed yellow rectangle fades in along the bottom.

### 第 4 幕｜選舉結果：席次條（22.8–30.6 秒）
- **旁白**：結果出爐，民主黨同時拿下參眾兩院。參議院至少五十四席，眾議院已越過過半門檻。
- **畫面中文**：標題「這次的結果」＋`SEC.04 // RESULTS · AS OF 2026/11/4`，右邊青色標籤「已確定 BOTH CHAMBERS」。
  - 參議院席次條（總 100）：藍 #7AA8E0「民主黨 54」→ 白色斜線「未定 2」→ 紅 #E07A7A「共和黨 44」；黃色虛線門檻「過半門檻 51」；下方尺寸線「100 SEATS」；小字「選前：共和黨 53 · 民主黨 47」
  - 眾議院席次條（總 435）：「民主黨 228」→「未定 68」→「共和黨 139」；門檻「過半門檻 218」；小字「AP 計票快照 · 選前民主黨 214 席」
  - 底部橘色虛線框：「尚未確定 PENDING｜截至 2026/11/4 尚未確定」／「參議院：阿拉斯加、密西西比 ｜ 眾議院：最終席次」
- **動畫**：席次條從左往右長出、數字同步遞增（參議院先、眾議院晚 0.5 秒）→ 黃色門檻線上下延伸並彈出標籤 → 尚未確定框縮放彈入。
- **AI 影片提示詞**：
  > [共用風格] Two horizontal stacked bar charts drawn as technical diagrams. Each bar grows from left to right in three segments: a muted soft blue segment, a small white diagonally-hatched segment, and a muted soft red segment. A vertical yellow dashed threshold line extends across each bar with a small yellow tag on top. Dimension lines with arrowheads under each bar. At the bottom, an orange dashed rectangle scales in. Muted, low-saturation colors, no flags, no party symbols.

### 第 5 幕｜分裂政府 vs 一致政府（30.6–38.0 秒）
- **旁白**：白宮是共和黨，國會是民主黨，這叫分裂政府。法案要兩邊都點頭，立法會變慢也變難。
- **畫面中文**：標題「分裂政府 vs 一致政府」。
  - 左框「一致政府 UNIFIED」：白色白宮線稿「=」白色國會線稿，說明「白宮和國會同一黨／法案比較好推」
  - 右框（黃框）「分裂政府 DIVIDED」：淡紅白宮「白宮·共和黨」「≠」淡藍國會「國會·民主黨」，說明「白宮和國會不同黨／2027/1 新國會就任起」
  - 流程列：「國會通過法案」→（橘色虛線箭頭＋✕）→「總統否決」（橘色虛線框）→「推翻否決／需兩院各 2/3」
  - 底部：青色「已確定 制度 CONSTITUTION」＋「本次未出現推翻否決所需的 2/3 多數（分析）」
- **動畫**：兩框依序上滑、建築描線 → 流程三格依序縮放彈出、箭頭描線，第二支箭頭出現 ✕。
- **AI 影片提示詞**：
  > [共用風格] Two side-by-side framed boxes. Left box: two white line-art buildings (a columned house with a triangular pediment and flag, and a domed capitol) with an equals sign between them. Right box with yellow border: the same two buildings, one in muted soft red, one in muted soft blue, with a not-equal sign between them. Below, three rectangular boxes connected by arrows; the middle arrow is an orange dashed line with an X mark and the middle box has an orange dashed border.

### 第 6 幕｜預算與財政（38.0–46.0 秒）
- **旁白**：第一個考驗是預算，臨時撥款十二月十一日到期。兩黨在預算和舉債上限上，預期會有攻防。
- **畫面中文**：標題「預算與財政」`BUDGET & FISCAL`。左邊大天秤線稿；右邊黃色大字「12/11」（170px），下面「臨時撥款到期日」`STOPGAP DEADLINE · 2026`，外圍黃框框選並脈衝。下方兩張影響卡：
  - #01 青色「已確定」｜「臨時撥款 12/11 到期」｜國會要再表決，才能讓政府繼續運作
  - #02 黃色「分析預期」｜「舉債上限 41.1 兆美元」｜分析預估約半年內觸頂，兩黨可能角力
- **動畫**：天秤描線 → 日期彈入 → 黃框描線後脈衝 → 兩張卡從右滑入。
- **AI 影片提示詞**：
  > [共用風格] Left: a large white line-art balance scale drawing itself on. Right: a large empty rectangular area surrounded by a yellow rounded rectangle that draws itself and then pulses outward. Below, two wide horizontal cards slide in from the right, each with a thick colored left edge (cyan for the first, yellow for the second).

### 第 7 幕｜關稅與貿易（46.0–53.8 秒）
- **旁白**：關稅主要是總統依法律授權決定的。國會換黨不會直接取消關稅，但可以開聽證來監督。
- **畫面中文**：標題「關稅與貿易」`TARIFFS & TRADE`。左邊貨櫃船線稿（甲板上兩層貨櫃、船橋、波浪），標 `FIG.07 — CARGO / 貨櫃船`。兩條引出線：
  - 青色，從貨櫃連到「關稅權：總統依法授權」`SEC.232 / 301 · EXECUTIVE`＋「已確定」
  - 黃色，從船身連到「推翻否決需 2/3」「本次選舉未出現 2/3 多數」＋「分析預期」
  - 底部影響卡（國會圖示）：「分析預期｜預期：監督聽證、撤銷部分關稅的表決／例如針對加拿大關稅；但總統可否決」
- **動畫**：船描線 → 引出線點出圓點、虛線延伸 → 標籤卡彈出、文字打字機 → 底部卡滑入。鏡頭往船推近。
- **AI 影片提示詞**：
  > [共用風格] A white line-art cargo ship with two rows of stacked containers, a bridge tower and wavy water lines, drawing itself on in the left half. Two dashed leader lines (one cyan, one yellow) start from small glowing dots on the containers and hull, extend to the right and end at empty label cards that pop in. Slow push-in toward the ship.

### 第 8 幕｜晶片與科技（53.8–62.2 秒）
- **旁白**：晶片補助法案的預先撥款，二零二六年是最後一年。要不要延續、怎麼管 AI，都牽動台灣供應鏈。
- **畫面中文**：標題「晶片與科技」`CHIPS & TECH`。左邊大晶片線稿（外框、四邊各 6 支針腳、中央晶粒有青色斜線剖面），下方尺寸線與 `FIG.08 — SEMICONDUCTOR · 晶片剖面`。右側三條引出線：
  - 「CHIPS 法案：撥款到 FY2026」`CRS R49031`＋已確定
  - 「對中出口管制：兩黨共識」`EXPORT CONTROLS`＋分析預期
  - 「AI 資料中心監管可能增加」`AI REGULATION`＋分析預期
  - 底部黃框：黃色台灣輪廓＋「**牽動台灣半導體供應鏈**」「補助、出口管制與 AI 規範，都由國會參與決定」
- **動畫**：晶片逐筆描線（針腳→晶粒→剖面線）→ 三條引出線間隔 0.6 秒依序出現 → 底部框淡入、黃框描線脈衝。
- **AI 影片提示詞**：
  > [共用風格] A large white line-art microchip seen from above: square package, six pins on each side, an inner die square filled with cyan diagonal hatching, a small circle orientation mark in the corner. It draws itself on stroke by stroke. A dimension line with arrows appears below. Three dashed leader lines extend from the right edge of the chip to three stacked label cards. At the bottom, a wide yellow rectangle draws itself around a small yellow outline of an elongated island.

### 第 9 幕｜對台與對中（62.2–70.0 秒）
- **旁白**：支持台灣，在美國國會一向是兩黨共識。不過約一百四十億美元的對台軍售，仍待白宮放行。
- **畫面中文**：標題「對台與對中」`TAIWAN & CHINA`。左邊大的黃色台灣輪廓（淡黃填色），旁邊一條垂直尺寸線，標 `TAIWAN · 台灣`，外圍黃色橢圓圈選並脈衝。右邊三張影響卡：
  - 國會圖示｜分析預期｜「挺台是兩黨共識」選舉結果未必改變這個立場
  - 盾牌圖示｜**尚未確定（橘色虛線標籤）**｜「約 140 億美元對台軍售」仍待白宮放行，何時推進尚未確定
  - 地球圖示｜分析預期｜「美中競爭態勢不變」國會可能在台灣議題上牽制白宮
- **動畫**：台灣輪廓描線 → 尺寸線出現 → 黃圈畫出 → 三張卡依序從右滑入。鏡頭往台灣推近。
- **AI 影片提示詞**：
  > [共用風格] Left: a large yellow outline of an elongated leaf-shaped island oriented north-northeast, filled with faint translucent yellow, drawing itself on, with a vertical dimension line beside it. A yellow ellipse circles it and pulses. Right: three wide horizontal cards slide in one after another, each with a small white line icon (domed building, shield with check mark, globe). The middle card has an orange dashed accent. No maps of other countries, no military imagery.

### 第 10 幕｜市場怎麼看（70.0–77.6 秒）
- **旁白**：開票時台股一度走低，道瓊收盤漲約百分之二點四。分析師普遍認為，僵局讓政策更可預期。
- **畫面中文**：標題「市場怎麼看」`MARKETS`＋「已確定 MARKET DATA」。上方兩個數字卡：青色「41,855」台股盤中低點（`TAIEX · 11/4 開票時`）、黃色「+2.4%」道瓊 11/4 收盤（`DOW +1,240 PTS`），數字遞增。左下股價線示意圖（先跌後漲），標「示意圖 ILLUSTRATIVE」；右下黃框：「分析預期｜分析師普遍認為：分裂政府 → 政策僵局 → 可預期性提高」。底部橘色虛線警示條：「⚠ 以上為市場紀錄與分析師看法，不構成投資建議」。
- **動畫**：兩個數字從 0 遞增 → 股價線描線 → 黃框彈入 → 警示條淡入。
- **AI 影片提示詞**：
  > [共用風格] Two framed number cards at the top with empty centers. Lower left: a simple white line chart on axes that dips down then rises steadily to the right, drawing itself on. Lower right: a yellow-bordered text box pops in. Bottom: a thin orange dashed warning banner fades in. No real stock tickers, no candlesticks, no money imagery.

### 第 11 幕｜一句話總結（77.6–84.6 秒）
- **旁白**：一句話總結：國會換手，政策不會一夕翻轉，但關稅、晶片和軍售，國會的監督會變強。
- **畫面中文**：上方青色小標 `SHARE THIS`＋「轉述給朋友的一句話」。半透明黃色大引號。四行 76px 粗體逐行滑入：「國會換手，／政策不會一夕翻轉；／但關稅、晶片、軍售，／**國會的監督會變強。**」（最後一行黃色，黃框框選並脈衝）。下方三個圖示：貨櫃船「關稅監督 ↑」、晶片「晶片監督 ↑」、盾牌「軍售監督 ↑」。
- **動畫**：四行依序從左滑入 → 最後一行黃框描線脈衝 → 三個圖示描線、文字淡入。
- **AI 影片提示詞**：
  > [共用風格] A large translucent yellow quotation mark in the upper left. Four empty horizontal text lines slide in from the left one by one; a yellow rounded rectangle draws around the fourth line and pulses. Below, three small white line icons (cargo ship, microchip, shield) draw themselves on in a row.

### 第 12 幕｜品牌片尾卡（84.6–89.6 秒）
- **旁白**：我是白話國際，一支講透一件事，我們下次見。
- **畫面中文**：中央大 logo（地球儀線稿、黃色十字刻度與中心點），外圍白色圓圈描線、青色虛線外圈、淡十字輔助線。下方「白話國際」（104px）、黃字「一支講透一件事」、青色膠囊「國際白話講」。小字：「資料來源與連結見影片說明欄」「本片使用 AI 輔助製作，由真人選題與審核。」`DATA AS OF 2026/11/4`。
- **動畫**：圓圈描線 → logo 縮放彈出 → 頻道名與 slogan 上滑 → 小字淡入。
- **AI 影片提示詞**：
  > [共用風格] Centered composition: a white circle draws itself around a globe-style logo (circle with meridian ellipse and three latitude lines, yellow crosshair ticks and a yellow center dot) that scales in with a spring. A cyan dashed outer ring and faint crosshair guide lines behind it. Empty space below for the channel name and slogan. Calm, final, minimal.

---

## 三、封面提示詞（1080×1920 靜態）
- **畫面中文**：上方青色小字 `US MIDTERMS 2026 // TAIWAN`；超大字三行（132px）「美國期中選舉，／跟**台灣**有／什麼關係？」（台灣黃色）。左下大國會大廈線稿，青色虛線弧形箭頭指向右邊黃色台灣輪廓，台灣外圍黃色橢圓圈。下方黃底深藍字標籤「國會變天 · 關稅 · 晶片 · 軍售」，再下方青色小字「資料截至 2026/11/4」。
- **AI 圖像提示詞**：
  > [共用風格] Static vertical poster. Upper 45% left empty for a huge headline. Lower left: a large white line-art domed capitol building. A cyan dashed curved arrow arcs from the building to the right toward a yellow outline of an elongated leaf-shaped island circled by a yellow ellipse. A wide solid yellow banner shape near the bottom. High contrast, bold, thumbnail-friendly.

---

## 四、剪輯疊字對照（字幕逐句）

| 時間 | 中文字幕（黃色＝關鍵詞） | English |
|---|---|---|
| 0.0–3.5 | 美國人投票，為什麼**台灣人**也要關心？ | Americans voted. Why should Taiwan care? |
| 3.5–7.2 | 因為**關稅**、**晶片**和**軍售**，**國會**都有發言權。 | Congress has a say on tariffs, chips and arms sales. |
| 7.2–11.1 | **期中選舉**，就是**總統任期中間**的國會大選。 | Midterms: the congressional election halfway through a presidential term. |
| 11.1–15.0 | 眾議院**全部改選**，參議院改選約**三分之一**。 | All 435 House seats, about 1/3 of the Senate. |
| 15.0–18.9 | **眾議院**管**錢包**，稅收法案要從這裡先提出。 | The House holds the purse: tax bills start here. |
| 18.9–22.8 | **參議院**管**人事和條約**，官員任命要它同意。 | The Senate confirms officials and ratifies treaties. |
| 22.8–26.2 | 結果出爐：**民主黨**同時拿下**參眾兩院**。 | Result: Democrats won both chambers. |
| 26.2–30.6 | 參議院至少**54席**，眾議院已越過**218**門檻。 | Senate: at least 54. House: past the 218 majority line. |
| 30.6–34.3 | 白宮共和黨、國會民主黨，這叫**分裂政府**。 | Republican White House, Democratic Congress: divided government. |
| 34.3–38.0 | 法案要**兩邊都點頭**，立法會**變慢也變難**。 | Both sides must agree, so laws come slower and harder. |
| 38.0–42.1 | 第一個考驗是**預算**：臨時撥款**12/11**到期。 | First test: the stopgap funding expires Dec 11. |
| 42.1–46.0 | 兩黨在預算和**舉債上限**上，預期會有**攻防**。 | Analysts expect budget and debt-limit standoffs. |
| 46.0–49.4 | 關稅，主要是**總統**依法律授權決定的。 | Tariffs are mostly set by the President under delegated law. |
| 49.4–53.8 | 國會換黨**不會直接取消**關稅，但能開**聽證監督**。 | A new Congress can't simply cancel them, but can hold hearings. |
| 53.8–58.1 | **晶片法案**的預先撥款，2026年是**最後一年**。 | CHIPS Act advance funding ends in fiscal 2026. |
| 58.1–62.2 | 要不要延續、怎麼管**AI**，都牽動**台灣供應鏈**。 | Renewal and AI rules both matter to Taiwan's supply chain. |
| 62.2–65.9 | 支持台灣，在美國國會一向是**兩黨共識**。 | Support for Taiwan has long been bipartisan in Congress. |
| 65.9–70.0 | 約**140億美元**的對台軍售，仍待**白宮放行**。 | A ~$14B arms package still awaits White House approval. |
| 70.0–73.9 | 開票時**台股**一度走低，**道瓊**收盤漲約2.4%。 | Taiwan stocks dipped during the count; the Dow closed up ~2.4%. |
| 73.9–77.6 | **分析師普遍認為**，僵局讓政策**更可預期**。 | Analysts broadly see gridlock as more predictable policy. |
| 77.6–81.1 | 一句話：國會換手，政策**不會一夕翻轉**， | In one line: a new Congress won't flip policy overnight, |
| 81.1–84.6 | 但關稅、晶片、軍售，國會的**監督會變強**。 | but oversight on tariffs, chips and arms gets stronger. |
| 84.6–89.6 | 我是**白話國際**，**一支講透一件事**，下次見。 | This is Baihua International. One video, one topic. See you. |
