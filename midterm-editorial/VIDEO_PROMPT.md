# 影片詳細提示詞｜2026 美國期中選舉 選後 8 件事

> 這份提示詞是從已完成的成片（`output/midterm-editorial.mp4`）反推整理的，可直接拿來重製、改版，或交給其他 AI 影片／設計工具。
> 時間碼是實際配音的時間（`voice_timing.json`），單位為秒。

---

## A. 整體規格

- 9:16 直式，1080×1920，30fps，長 76.4 秒，H.264 yuv420p CRF 18，AAC 192k / 48kHz
- 語言：繁體中文配音；畫面字幕為繁中主字幕，下方一行英文小字
- 受眾：台灣散戶投資人、對美國政治不熟的一般大眾
- 調性：冷靜、中立、資訊密度高的財經編輯風；兩黨用同樣語氣描述，只講事實與「市場普遍預期」
- 品牌：左上角「每日財經筆記」＋「@daily.finance.notes」
- 資料截至：2026/11/04（美東 11/04 盤中）
- 禁止：政治人物照片或肖像、政黨標誌、有版權的音樂、任何寵物或吉祥物元素

## B. 視覺風格（每一頁共用）

**風格關鍵字**：深色編輯風資訊圖表、科技雜誌封面感、等角（isometric）金線插畫、大量留白、精準格線

**配色**
| 用途 | 色碼 |
|---|---|
| 背景（炭黑） | #111214 |
| 主文字（米白） | #EDE8DF |
| 次要文字（灰） | #8A8A8A |
| 唯一強調色（金黃） | #E3B341 |
| 民主黨資料（低彩度藍） | #4F72B8，側面 #3B568C／#2E436D |
| 共和黨資料（低彩度紅） | #C8574F，側面 #9A433D／#77342F |
| 中性方塊（未定、計票中） | #3A3936，側面 #2A2927／#201F1E |
| 金色系方塊 | #3B331F，側面 #2B2517／#211C12 |

**背景質感**：40px 細格線（米白 5.5% 透明）＋200px 大格線（3.5%）＋256px 雜訊紙紋（7%、screen 混合）＋四周暗角。格線緩慢漂移，每秒約 6–9px。

**字體**
- 大標題：Noto Serif TC 900，112px（封面 150px，兩行）
- 內文：Noto Sans TC 500／700
- 數字、頁碼、英文標籤：JetBrains Mono 500／700

**版面格線**（左右邊距 64px，內容寬 952px）
| 區塊 | 位置（y） | 內容 |
|---|---|---|
| 品牌列 | 58 | 金框方塊「財」＋「每日財經筆記」(30px 粗)＋「@daily.finance.notes」(19px Mono 灰) |
| 頁碼 | 右上 52 | 「01/08」：01 金色 44px Mono，/08 灰色 30px，下方小字 POINT；封面為「08 件事 / OVERVIEW」，結尾為「END / SUMMARY」 |
| 標籤列 | 146 | 上方細分隔線；左邊金色小方塊＋「美國期中選舉 選後解析」＋「2026.11.04」；右邊「資料截至 2026/11/04」 |
| 大標題 | 228 | 每頁重點，8 字以內；數字改用金色 Mono |
| 說明 | 370 | 72×4px 金色短線＋兩行說明 33px |
| 插圖 | 520–1180 | 等角 SVG 插圖，金色描邊，緩慢上下浮動 ±7px |
| KPI | 1196 | 三欄並排，細直線分隔；金色 Mono 74px 大數字＋灰色 24px 說明＋56px 金色短底線 |
| 字幕帶 | 1468–1700 | 由上往下漸層變深的黑帶；頂端細線上有一條金色進度條（隨全片時間填滿）；中文 54px 粗體米白置中，英文 26px 灰色；離底部 220px 以上，避開 Reels 介面 |
| 頁尾 | 1716 | 左「SOURCES · AP / NBC / CBS / CNBC / CNN / CRS」，右「NOT INVESTMENT ADVICE」，17px Mono 灰 |

**等角插圖規則**：30° 等角投影；每個方塊畫頂面、左面、右面三個面，頂面最亮；1.1–1.8px 金色描邊；由後往前依深度排序。

## C. 動畫規則

- 所有時間點直接取自配音的字詞時間戳記，不估秒數
- 緩動只用 power3.out 或 expo.out；同一組元素錯開 35–100ms 進場
- **換頁**（0.35 秒）：在兩段旁白之間 0.30 秒的停頓開始；舊頁向上淡出（y −110），新頁由下推入（y +140→0），兩頁全程重疊；新頁的標題、說明跟著頁面一起推入（字元只做 y 錯位，不從透明開始），不可有空白幀
- **字幕**：一次只顯示一句，換句時舊句 0.1 秒淡出完，新句 0.18 秒淡入；當前唸到的關鍵字變成金黃色並放大到 1.06 倍再彈回（卡拉 OK 效果）
- **KPI**：旁白唸到對應的詞時，卡片由下 36px 滑入，數字從 0 用 expo.out 在 0.7 秒內跳到目標值（千分位、小數都照原格式），金色底線同時展開
- **插圖**：方塊由下往上依序堆疊（往上浮入＋淡入）；金色描邊用 stroke-dashoffset 從 1 畫到 0；插圖的主要動作對齊旁白提到它的那個字
- **常駐微動**：格線漂移、插圖上下浮動、底部金色進度條線性前進

## D. 逐頁分鏡

### 00｜封面 0.00–5.83
- **大標題**（兩行）：期中選舉 / 選後 **8** 件事（8 為金色）
- **說明**：參眾兩院結果出爐， / 美國政策、全球市場、台灣怎麼看？
- **插圖**：等角國會大廈。三層階梯基座、前排 8 根和側面 5 根柱子、簷部、圓柱鼓座、經緯線構成的半球圓頂、小燈籠塔、頂端尖針。基座與柱子由下往上浮入，描邊同步畫出，圓頂線條最後畫完
- **KPI**：11/03 美東投票日｜435 眾議院席次全數改選｜8 件選後重點
- **旁白**：美國選完了，這跟你的股票有什麼關係？一次看懂，選後八件事。
- **字幕**：美國選完了｜這跟你的股票有什麼關係？｜一次看懂 選後 8 件事
- **英文字幕**：The US midterms are over｜What does it mean for your stocks?｜8 things to know, one page each
- **對位**：「美國」→第 1 個 KPI；「股票」→第 2 個；「八件事」→第 3 個

### 01｜參議院 5.83–12.61
- **標題**：參院 民主黨過半
- **說明**：民主黨至少 54 席、共和黨 44 席 / 密西西比、阿拉斯加 2 州計票中
- **插圖**：100 席半圓形席次圖，每席一個等角小方塊，排成 5 排，外圍有一條金色弧線。方塊先以灰色從內排到外排升起；唸到「參議院」時開始填色，藍色 54 席從左往右掃、紅色 44 席從右往左掃，中間 2 席保持灰色並加上金框。圖下方有圖例：民主黨 54｜計票中 2｜共和黨 44
- **KPI**：54+ 民主黨席次（至少）｜44 共和黨席次｜2 州計票中（MS、AK）
- **旁白**：第一，參議院。民主黨至少五十四席，共和黨四十四席，還有兩州在計票。
- **字幕**：01 參議院｜民主黨至少 54 席｜共和黨 44 席｜還有 2 州計票中
- **英文字幕**：01 · The Senate｜Democrats: at least 54 seats｜Republicans: 44 seats｜2 races still being counted

### 02｜眾議院 12.61–18.27
- **標題**：眾院 跨過 **218**
- **說明**：AP 確認民主黨已拿下 218 席過半門檻 / 最終席次仍在計票中
- **插圖**：435 席半圓形席次圖，11 排小方塊。唸到「眾議院」時，左側 218 席填成藍色，右側 217 席保持灰色加金框，標示「其他／計票中」（不編造共和黨席次）
- **KPI**：218 民主黨已確定席次｜435 眾議院總席次｜計票中 最終席次
- **旁白**：第二，眾議院。民主黨拿下兩百一十八席，也就是說，已經過半。
- **字幕**：02 眾議院｜民主黨已拿下 218 席｜也就是說，已經過半
- **英文字幕**：02 · The House｜Democrats have won 218 seats｜That is a majority (final count pending)

### 03｜分裂政府 18.27–27.15
- **標題**：分裂政府
- **說明**：白宮：共和黨｜國會兩院：民主黨 / 新國會 2027 年 1 月就任
- **插圖**：等角天平。金色底座和深色立柱，頂端支點是金色圓圈，橫樑是一條金線。左盤放 1 個紅色方塊，標「白宮 / 共和黨」；右盤放 2 個藍色方塊，標「國會 / 民主黨」。唸到「分裂政府」時，橫樑以 expo.out 往國會那側傾斜 7°，兩個盤子保持垂直
- **KPI**：1 白宮｜共和黨　2 國會兩院｜民主黨　2027.01 新國會就任
- **旁白**：第三，這叫分裂政府。簡單說，國會像董事會，總統像執行長。董事會換人，執行長就要看臉色。
- **字幕**：03 分裂政府｜簡單說，國會像董事會｜總統像執行長｜董事會換人，執行長要看臉色
- **英文字幕**：03 · Divided government｜Think of Congress as the board｜and the president as the CEO｜New board, the CEO must negotiate

### 04｜預算與稅務 27.15–34.47
- **標題**：預算 **12/11** 大限
- **說明**：臨時預算只撐到 12/11，年度撥款未完成 / 市場普遍預期：大規模減稅、加碼支出更難過關
- **插圖**：左後方三疊等角稅單（9、13、6 張薄板逐張往上疊，最上面一張是金色，畫有 4 條表格線）；右前方一個金色大方塊當日曆，頂面印著金色 Mono「12/11」（沿等角平面排字）和一條金線
- **KPI**：12/11 臨時預算到期｜0/12 年度撥款法案兩院通過｜2 院都要同意才能過關
- **旁白**：第四，預算。政府經費只撐到十二月十一號，市場預期，大減稅或加碼支出，都更難過關。
- **字幕**：04 預算與稅務｜政府經費只撐到 12/11｜市場普遍預期｜大減稅、加碼支出都更難過關
- **英文字幕**：04 · Budget & taxes｜Stopgap funding runs out Dec 11｜Markets broadly expect｜big tax cuts or new spending get harder

### 05｜關稅與貿易 34.47–41.09
- **標題**：關稅 短期難改
- **說明**：最高法院 2 月否決緊急關稅後，改以 301 條款等法源 / 國會要推翻總統否決，需兩院各 2/3
- **插圖**：等角貨櫃堆。2×3 個貨櫃排成底層，往上疊到第 3 層，其中兩個是金色；長邊有 10 道、短邊有 3 道浪板紋；上方一條吊鉤金線垂下
- **KPI**：6:3 最高法院否決緊急關稅｜301 條款｜現行主要法源｜2/3 推翻否決門檻
- **旁白**：第五，關稅。其實，關稅主要由總統決定，國會要推翻否決，得要三分之二。
- **字幕**：05 關稅與貿易｜其實，關稅主要由總統決定｜國會要推翻總統否決｜得要 2/3 票數
- **英文字幕**：05 · Tariffs & trade｜Tariffs are mostly set by the president｜To override a veto, Congress｜needs a two-thirds vote

### 06｜科技與晶片 41.09–47.98
- **標題**：晶片 管制不轉彎
- **說明**：232 條款：部分先進晶片 25% 關稅仍在 / 對中科技管制屬兩黨共識，市場預期不會急轉
- **插圖**：等角晶片封裝。大片基板，兩側各有 12 根金色接腳；基板上有一塊金色晶粒，晶粒上畫電路走線並標著金色「25%」；旁邊是 8 層交錯金色和深色的記憶體堆疊（HBM），一層一層往上疊
- **KPI**：232 條款｜晶片關稅法源　25% 部分先進晶片關稅　2 黨立場接近（對中管制）
- **旁白**：第六，晶片。部分晶片，百分之二十五的關稅還在，對中科技管制，兩黨立場接近。
- **字幕**：06 科技與晶片｜部分先進晶片 25% 關稅仍在｜對中科技管制｜兩黨立場接近
- **英文字幕**：06 · Tech & chips｜A 25% tariff on some advanced chips stays｜On China tech controls,｜both parties largely agree

### 07｜市場反應 47.98–57.31
- **標題**：美股漲 債息降
- **說明**：11/4 美股盤中：道瓊漲逾 1,000 點；美元小幅走弱 / 1950 年以來，期中選後 12 個月美股每次都上漲
- **插圖**：等角 K 線圖。深色長平台上立著 9 根立體 K 棒（上漲為金色、下跌為深色），每根有細金線影線，由左到右依序從下方升起；唸到「百分之十五」時，一條粗金色趨勢線把所有柱頂連起來
- **KPI**：+1,000 道瓊盤中漲點（以上）｜≈4.9% 10 年期美債殖利率｜+15% 選後 12 個月平均（1950–）
- **旁白**：第七，市場。道瓊盤中大漲，超過一千點，美債殖利率下滑。歷史上，選後一年，美股平均漲百分之十五。
- **字幕**：07 市場反應｜道瓊盤中大漲逾 1,000 點｜10 年期美債殖利率下滑｜歷史上，選後 12 個月｜美股平均漲約 15%
- **英文字幕**：07 · Market reaction｜Dow up 1,000+ points intraday｜10-year Treasury yield falls｜Historically, 12 months after｜S&P 500 averaged about +15%

### 08｜對台灣的影響 57.31–66.51
- **標題**：台灣 盯晶片關稅
- **說明**：11/4 計票日 加權指數收 42,949｜台積電收 2,260 元 / 市場關注：半導體、AI 伺服器供應鏈、對台法案
- **插圖**：台灣輪廓的立體版塊（俯視、北方朝上，厚度 46，頂面金褐色，側面帶金色描邊）。輪廓描邊先畫出，接著島上落下一顆金色晶片並畫出接腳，周圍有一圈金色虛線橢圓；唸到「三百五十八點」時，一條引線拉出標籤「TAIEX −358」和「11/4 收 42,949」
- **KPI**：−358 加權指數（11/4 收盤）｜42,949 收盤點位｜−35 台積電（元）
- **旁白**：第八，重點來了——台灣。計票當天，台股跌三百五十八點，台積電跌三十五元。接下來，盯緊晶片關稅。
- **字幕**：08 對台灣的影響｜計票當天 台股跌 358 點｜台積電跌 35 元｜接下來：盯緊晶片關稅
- **英文字幕**：08 · What it means for Taiwan｜TAIEX fell 358 points on count day｜TSMC fell NT$35｜Next: watch chip tariffs

### 09｜總結＋追蹤 66.51–76.39
- **標題**：國會換手 政策放慢
- **說明**：政策變慢、不急轉彎；仍在計票的席次請以官方結果為準 / 內容僅供參考，不構成投資建議
- **插圖**：國會大廈重新畫一次（和封面相同）
- **KPI**：54+ 參院民主黨（至少）｜218+ 眾院民主黨（已確定）｜+15% 歷史選後一年均值
- **旁白**：一句話總結——國會換手，政策變慢，但不會急轉彎。追蹤每日財經筆記，每天三分鐘，看懂財經。
- **字幕**：一句話總結｜國會換手，政策變慢｜但不會急轉彎｜追蹤 @daily.finance.notes｜每天 3 分鐘看懂財經
- **英文字幕**：In one line｜Congress flips, policy slows｜but no sharp U-turn｜Follow @daily.finance.notes｜Finance in 3 minutes a day
- 片尾留 1 秒，音樂淡出

## E. 配音與音樂

**配音**
- 女聲，沉穩、自然、像財經新聞主播，語速約每秒 4.7 字（比一般說話稍快）
- 每頁一次唸完整段，不一句一句拼接
- 停頓：逗號 0.15 秒、句號和問號 0.32 秒、「——」0.36 秒、頁與頁之間 0.30 秒

**人聲後製**
- 80Hz 高通濾波
- 去齒音
- 輕度壓縮（門檻 −20dB、壓縮比 2.5:1）

**環境音**：粉紅雜訊，比人聲低 50dB，讓停頓不是死寂

**背景音樂**（程式合成，無版權）
- A 小調，和弦進行 Am–F–C–G，每個和弦 2 小節，速度 92 BPM
- 音色：鋸齒波和三角波混合的低通 pad＋低音正弦波
- 節奏：柔和大鼓（第 1、3 拍）、鼓邊（第 2、4 拍）、八分音符 hi-hat
- 音量比人聲低 22dB；人聲出現時 sidechain 再壓低約 7dB（起音 40ms、釋放 300ms）
- 開頭 0.6 秒淡入，結尾 1.8 秒淡出

**最終響度**：−14 LUFS，峰值 ≤ −1 dBTP（實測 −1.5）

## F. 給 AI 影片／圖像工具的精簡英文提示詞（每頁一段）

共用風格前綴（每段前面都加）：
> Vertical 9:16 editorial infographic, dark charcoal background #111214 with faint drifting grid lines and subtle paper-grain noise, isometric 3D illustration with thin golden outlines (#E3B341), muted navy #4F72B8 and muted brick red #C8574F used in equal saturation, cream serif headline (Noto Serif TC Black), monospace gold numbers, three KPI figures in a row, dark subtitle band near the bottom, tech-magazine cover feel, calm and neutral, no people, no portraits, no party logos, smooth ease-out motion

| 頁 | 提示詞 |
|---|---|
| 00 | an isometric Capitol-style domed building drawn in gold line art on stepped plinths, dome made of latitude/longitude gold wireframe, headline "期中選舉 選後 8 件事" |
| 01 | an isometric hemicycle seating chart of 100 small cubes in 5 rows, 54 blue cubes on the left, 44 red cubes on the right, 2 grey cubes with gold outline in the middle, colors sweeping in from both sides |
| 02 | an isometric hemicycle of 435 tiny cubes in 11 rows, 218 blue on the left, the rest neutral grey with gold outlines marked "pending" |
| 03 | an isometric balance scale, gold beam tilting 7° toward a pan holding two blue cubes, the other pan holds one red cube |
| 04 | isometric stacks of thin tax-form sheets rising one by one, a large gold block with "12/11" printed on its top face |
| 05 | isometric shipping containers with corrugated walls stacked three levels high, a crane hook line descending |
| 06 | an isometric chip package with gold pins, a gold die marked "25%", an 8-layer memory (HBM) stack rising beside it |
| 07 | isometric 3D candlestick bars rising from a dark platform, a bold gold trend line drawing across their tops |
| 08 | an extruded isometric outline of Taiwan in dark gold with a small gold chip landing on it, dashed gold ring, callout label "TAIEX −358" |
| 09 | the gold line-art Capitol building again, summary KPIs "54+ / 218+ / +15%", call to action "@daily.finance.notes" |

## G. 必須保留的事實與標註

- 參院「至少 54 席」，2 州計票中；眾院「已達 218 席」，最終席次計票中
- 美股是 11/4 盤中數字，要標「盤中」
- 資料截至 2026/11/04；來源見 `research.md`
- 片尾和文案都要有：「內容僅供參考，不構成投資建議」
