# 晶圓良率：同一片晶圓，大晶片為什麼比較吃虧（科技透明圈 第 4 支・tech-yield）

查證截至 2026/11/15。本文會整理成「科技透明圈」精選文章（留言「良率」拿完整解說）。
排程：2026/11/18（三）20:00，類別「科技原理」，接 tech-euv 片尾「一片晶圓印完，每一顆都能用嗎？」。
狀態標記：**已確定**（教科書、標準作法、多個獨立來源一致）／**廠商公布**（廠商說法，非第三方實測）／**估算**（照公開模型與數字推算，非實測）。

## 一句話

晶圓上的缺陷是隨機落下的，落在哪顆晶片、那顆就可能報廢；同樣的缺陷密度下，晶片面積越大，被打中的機率越高。以每平方公分 0.1 個缺陷估算，100 平方毫米的小晶片約九成能用，800 平方毫米的大晶片不到一半。所以切割前要逐顆測試、記憶體會留備用排，而大晶片乾脆拆小再封裝在一起。

## 數字與來源

| # | 說法（影片裡怎麼講） | 數字 | 狀態 | 來源（查詢日 2026/11/15） | 信心 |
|---|---|---|---|---|---|
| 1 | 能用的比例就叫良率 | 晶粒良率＝一片晶圓上通過測試的晶片 ÷ 全部晶片 | 已確定（定義） | WikiChip〈Yield〉；AnySilicon〈Ultimate guide to wafer sort〉 | 高 |
| 2 | 缺陷可能是一顆微粒、一段沒印好的線 | 隨機缺陷（微粒、圖形缺陷）是晶粒良率損失的主因之一 | 已確定（教科書） | WikiChip〈Yield〉；SemiEngineering〈Chiplets add more inspection and test steps〉 | 高 |
| 3 | 缺陷一樣密，晶片越大，被打中的機會越大 | 泊松模型 Y = e^(−D0·A)：面積 A 越大，良率指數下降；實際缺陷會成群，業界也用負二項式模型 | 已確定（模型；泊松是簡化） | WikiChip〈Yield〉；鉅亨網、Digitimes 專欄整理 | 高 |
| 4 | 廠商公布過，五奈米量產初期每平方公分約 0.1 個缺陷 | N5 約 0.10～0.11 個/cm²，預期量產拉升後低於 0.10；比 N7 同期低 | 廠商公布（台積電 2020 技術論壇投影片，AnandTech 報導） | AnandTech〈'Better Yield on 5nm than 7nm': TSMC Update on Defect Rates for N5〉（2020/08）；WikiChip Fuse 早期報導說 N5 與 N7 的 D0 軌跡相近 | 中（只有一家媒體直接報導數字，2020 年舊資料；畫面標「廠商公布，2020」） |
| 5 | 小晶片九成能用 | D0＝0.1/cm²、A＝1 cm²（100 mm²）→ e^(−0.1) ≈ 90.5% | 估算（由 3、4 推算） | 同上 | 中 |
| 6 | 大晶片（大八倍）不到一半 | A＝8 cm²（800 mm²）→ e^(−0.8) ≈ 44.9% | 估算 | 同上；800 mm² 接近單次曝光上限 858 mm²（26 × 33 mm） | 中 |
| 7 | 大晶片接近一次曝光能印的最大面積 | 曝光視野 26 × 33 mm ≈ 858 mm²（193 nm 浸潤式與 EUV 相同） | 已確定 | SemiEngineering〈Are Larger Reticle Sizes On The Horizon?〉；AnandTech〈TSMC Preps 6x Reticle Size Super Carrier Interposer〉 | 高（影片沒有念這個數字，畫面小字用） |
| 8 | 一片晶圓排得下六百多顆小晶片、六十顆大晶片 | 12 吋（300 mm）、邊緣扣 3 mm：毛晶粒＝π·d²/(4S) − π·d/√(2S)，d＝294 mm → 100 mm² 約 613 顆、800 mm² 約 61 顆 | 估算（公式忽略切割道與缺口，實際差幾個百分比） | AnySilicon〈Die per wafer formula〉；calculator.academy；IEEE 2005〈Investigation of gross die per wafer formulas〉 | 中高 |
| 9 | 小晶片好的五百多顆，大晶片只剩二十幾顆 | 613 × 0.905 ≈ 555；61 × 0.449 ≈ 27 | 估算（由 5、6、8 推算） | 同上 | 中 |
| 10 | 切開之前，探針卡把每一顆都通電測過，記在晶圓地圖上 | 晶圓測試（wafer sort／CP）：探針接觸焊墊，結果寫成 wafer map；以前在壞晶片點墨，現在多用電子地圖，封裝廠只挑好的那一箱（bin） | 已確定 | AnySilicon〈Ultimate guide to wafer sort〉；NextPCB〈Wafer probing guide〉；美國專利 5838951（wafer map） | 高 |
| 11 | （畫面）探針卡可以一次測好幾顆 | 多站點平行測試（multi-site） | 已確定 | 美國專利 10620236 | 高（旁白沒講，畫面一次亮 4 顆） |
| 12 | 記憶體會多做幾排備用，壞掉那排直接換掉 | 備用列／行（redundancy）：測試找到壞的位址，用熔絲（雷射或電流）切換到備用列；代價是多佔面積 | 已確定 | 美國專利 4658379、6535436；IEEE TechNav〈Yield-enhancement Redundancy〉、〈Chip Repair〉 | 高 |
| 13 | 大晶片拆小再拼回去（下一支：先進封裝） | 小晶片（chiplet）：壞一顆只丟那顆；每顆先測成「已知良品」（KGD）再封裝；代價是組合後良率要連乘 | 已確定（作法）；連乘例子為示意 | SemiEngineering〈Chiplets add more inspection and test steps〉；〈Multi-Die Assemblies Dominate At 2nm And Below〉 | 高 |
| 14 | （影片沒講）先進封裝本身的良率 | 台積電主管表示 5.5 倍光罩尺寸 CoWoS 部分產品可達 99% 良率 | 廠商說法（媒體轉述） | 鉅亨網整理 | 低中（留給下一支再查） |

## 影片裡刻意不說的

- 不說任何一家公司、任何一個製程「現在」的良率（沒有官方數字；媒體流傳的多半是轉述）。
- 0.1/cm² 是 2020 年 N5 量產初期的廠商公布值，只拿來當「估算用的典型數字」，畫面標「廠商公布，2020」「估算」。
- 泊松模型偏保守（實際缺陷會成群，大晶片的良率通常比泊松算的好一點）；畫面標「估算（簡化模型）」。
- 不點名哪款手機、哪款 AI 晶片的面積；只說「100 平方毫米的小晶片」「800 平方毫米的大晶片」。
- 不講測試成本、不講封裝良率數字（留下一支）。

## 寫成文章時的段落

1. 一片晶圓印完，不是每一顆都能用：良率的定義。
2. 缺陷從哪裡來：微粒、圖形缺陷。
3. 晶圓測試：探針卡、晶圓地圖、分箱（bin）。
4. 為什麼大晶片吃虧：泊松模型、缺陷密度 0.1 的估算（附算式與每片顆數）。
5. 救回來的方法：記憶體備用列。
6. 下一支：把大晶片拆小再拼回去（先進封裝）。

## 來源網址

- AnandTech〈TSMC Update on Defect Rates for N5〉：https://www.anandtech.com/show/16028
- WikiChip Fuse〈TSMC Talks 7nm, 5nm, Yield〉：https://fuse.wikichip.org/?p=2567 ；WikiChip〈Yield〉：https://en.wikichip.org/wiki/yield
- AnySilicon 晶圓測試：https://anysilicon.com/ultimate-guide-wafer-sort/ ；每片晶粒公式：https://anysilicon.com/die-per-wafer-formula-free-calculators
- calculator.academy 晶粒公式：https://calculator.academy/die-per-wafer-calculator/
- NextPCB 晶圓探針：https://www.nextpcb.com/blog/wafer-probing-an-ultimate-guide
- SemiEngineering：https://semiengineering.com/are-larger-reticle-sizes-on-the-horizon 、https://semiengineering.com/chiplets-add-more-inspection-and-test-steps/ 、https://semiengineering.com/multi-die-assemblies-dominate-at-2nm-and-below/
- AnandTech 6 倍光罩中介層：https://www.anandtech.com/show/18876
- 記憶體備用列專利：https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/4658379 、https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/6535436
- IEEE TechNav：https://technav.ieee.org/topic/yield-enhancement-redundancy/

## 查不到或低信心

- 缺陷密度 0.1 只有 AnandTech 一家直接報導（WikiChip 只說和 N7 軌跡相近），而且是 2020 年；更新的製程沒有找到廠商公布的 D0。
- 「九成／不到一半」「五百多顆／二十幾顆」都是模型估算，不是任何一條產線的實測。

## 研究工具紀錄

- 只用 WebSearch（摘要），沒有讀 YouTube 逐字稿。

---

# 第二輪補查（2026/11/16，規劃用；原內容未刪）

查證截至 2026/11/16；**發布當天（11/18）要再查一次 D0 與來源網址是否還在，並更新畫面日期**。
標記：**已確定**／**廠商公布**／**估算**（自己算的，非任何產線實測）。信心：高／中／低。
本輪用 WebSearch（只拿到摘要與標題，沒讀到全文），來源三類：一手（專利、廠商技術文件、ITRS／IRDS 良率章節）、學術／標準參考（IEEE TechNav、WikiChip、IEEE 2005 die-per-wafer 論文）、媒體科普（AnandTech、SemiEngineering、imec 文章、鉅亨網）。

## A. 缺陷從哪裡來（念稿第 2 段）

| 說法 | 內容 | 狀態／信心 | 來源 |
|---|---|---|---|
| 微粒 | 製程中落在晶圓上的外來顆粒（光阻、光罩、擴散等步驟都可能帶入；晶圓背面顆粒也會掉到下一片）。蓋上下一層後，微粒可造成線路短路或斷路 | 已確定／高 | 美國專利 6393602、5913105（缺陷來源描述）；ITRS 2011／2013 Yield Enhancement 章節（空氣分子污染、製程引入缺陷）：semiconductors.org 2011Yield.pdf、2013Yield.pdf |
| 圖案缺陷 | 圖形轉印出錯：線寬偏差、線斷（開路）、兩線連在一起（短路）、對位偏移。成因含光罩缺陷、顆粒、曝光與蝕刻偏差 | 已確定／高 | ITRS 2013（pattern transfer 的設計與線寬偏差）；WikiChip〈Yield〉 |
| 刮傷 | 機械接觸造成（機械手臂、搬運、研磨），常是一條線橫跨好幾顆晶片；屬可避免的損失 | 已確定／中高 | 專利 5913105（scratch pattern）；Semiconductor Digest 良率文章 |
| 致命缺陷 | D0 指的是「會讓晶片失效的缺陷」（致命缺陷）；不是每個缺陷都會報廢，要落在關鍵面積（critical area）上才致命 | 已確定／高 | WikiChip〈Yield〉；IEEE TechNav〈Integrated circuit yield〉 |
| 邊緣損失 | 晶圓邊緣放不下完整晶片，這是幾何損失，不算缺陷 | 已確定／高 | 良率模型參考文件 yield_models.pdf（fog.misty.com） |

規劃用的簡化：影片只畫「微粒」「線斷」兩種（念稿第 2 段只講這兩種）；刮傷只在晶圓地圖畫面當一種圖樣出現（見 device-spec），旁白不講。

## B. 探針卡與晶圓針測（念稿第 4 段）

| 說法 | 內容 | 狀態／信心 | 來源 |
|---|---|---|---|
| 流程 | 晶圓放在真空吸盤（chuck）上，晶圓測試機（prober）移動晶圓，**探針卡固定在上方不動**；晶圓上升讓探針壓上焊墊，測試機（ATE）灌測試圖樣、讀回應，通過或失敗；吸盤移到下一顆（或下一組）再測 | 已確定／高 | Wikipedia〈Wafer testing〉；AnySilicon〈Ultimate guide to wafer sort〉；專利 7453261 |
| 探針卡結構 | 電路板（PCB，大圓板）→ 空間轉換器（space transformer，把大間距轉成細間距）→ 探針頭（導板固定探針）→ 探針（鎢或鎢錸；懸臂式、垂直式、MEMS 式三大類） | 已確定／中高 | 專利 11852656 等（probe head／space transformer）；venture-mfg.com〈what is probe cards〉 |
| 探針類型怎麼選 | 焊墊間距 >150 µm 懸臂式；80–150 µm 垂直式；40–80 µm 進階垂直或 MEMS；<40 µm 只能 MEMS（廠商經驗法則，非標準） | 廠商說法／中 | venture-mfg.com |
| 過壓 | 探針接觸後再多壓一小段（overdrive，廠商資料例：標稱 60–200 µm）讓探針微彎、刮破焊墊氧化層確保導通 | 廠商資料／中 | Synergie-CAD 探針產品資料（anysilicon.com 附檔） |
| 一次測多顆 | 多站點（multi-site）平行測試：一張卡一次壓好幾顆（記憶體可到數百顆以上；邏輯晶片常見 1–8 顆，依焊墊數與測試機通道數） | 已確定（概念）／高；邏輯晶片的具體顆數是估計／低 | 專利 10620236；AnySilicon |
| 分箱與晶圓地圖 | 每顆依測試結果給 bin 編號（好、壞、或依速度分級）；結果存成晶圓地圖檔（wafermap），以前壞晶片點墨，現在多用電子地圖；封裝時只挑好的 bin，壞的不封裝 | 已確定／高 | AnySilicon；Wikipedia〈Wafer testing〉；專利 5654204（die sorter） |
| 缺陷分布的樣子 | 地圖上常見四種圖樣：隨機散落（微粒）、一條線（刮傷）、一團（局部污染或製程偏離）、邊緣一圈（邊緣製程問題）。這是工程師從地圖認出問題的方式 | 已確定（業界常見分類）／中高 | ITRS 良率章節；專利 5913105（scratch pattern recognition）；Synopsys 台灣部落格〈機器學習驅動測試分析〉 |
| 中文來源 | 針測＝晶圓在封裝前以探針做功能測試，避免把封裝成本花在壞晶片上；探針會磨耗、接觸電阻升高 | 已確定／中 | cnyes 鉅亨網、Synopsys 台灣部落格（zh-tw） |

**物理正確性（規劃關鍵）**：移動的是晶圓（吸盤做 XY 步進與 Z 升降），不是探針卡。原 visual-spec 寫「探針卡平移到下一組」是錯的，device-spec 已改。

## C. 缺陷密度 D0、泊松與負二項式（念稿第 5、6 段）

| 說法 | 內容 | 狀態／信心 | 來源 |
|---|---|---|---|
| 泊松模型 | Y = e^(−A·D0)；假設缺陷均勻、互相獨立。實際缺陷會成群，所以泊松偏悲觀（算出的良率低於實際，特別是大晶片） | 已確定（模型）／高 | IEEE TechNav〈Integrated circuit yield〉；良率模型參考 yield_models.pdf |
| 負二項式 | Y = (1 + A·D0/α)^(−α)；α 是成群程度（越小越成群），常見 0.5–5；α→∞ 就等於泊松。缺陷平均數固定時，成群越強、整體良率越高 | 已確定／中高 | 專利 9026981、7194366；Bohrium 良率預測條目；globalsino 對照表 |
| 對念稿的影響（我算的） | 同樣 D0＝0.1、A＝8 cm²：α＝∞（泊松）44.9%；α＝5 47.6%；α＝3 49.2%；α＝2 51.0%；α＝1 55.6%。**「不到一半」只在泊松或 α≥3 成立**；α≤2 就略過一半。小晶片 A＝1 cm² 各模型都在 90.5–90.9%，「九成」穩 | 估算／中 | 自己算（見下「算式」） |
| D0 數字 | 台積電 2020 技術論壇：N5 量產初期約 0.10–0.11 個/cm²，預期量產拉升後低於 0.10；同階段比 N7 低 | 廠商公布（2020）／中：只有 AnandTech 直接報導，WikiChip 只說與 N7 軌跡相近，沒有更新的官方數字（本輪重查仍然沒有） | AnandTech〈'Better Yield on 5nm than 7nm'〉https://www.anandtech.com/show/16028 |
| 旁證（不要上片） | 台積電 2019 的 N5 測試晶片（約 17.92 mm²，含 256 Mb SRAM 與邏輯）平均良率約 80%、最高超過 90%：那是小測試晶片，不是產品 | 廠商公布（二手轉述）／低 | 第三方部落格轉述，不引用 |

## D. 算式與念稿數字核對（念稿第 1、5、6 段）

**假設（兩邊一致）**：12 吋晶圓、直徑 300 mm；小晶片 100 mm²（＝1 cm²，例 10×10 mm）；大晶片 800 mm²（＝8 cm²，**大八倍**）；D0 ＝ 0.1／cm²；泊松模型；可用直徑扣邊緣 3 mm（d＝294 mm）。念稿「同樣缺陷」＝同一個 D0。

1. 良率：小 Y＝e^(−0.1×1)＝0.9048 → **九成**（90.5%）✓；大 Y＝e^(−0.1×8)＝e^(−0.8)＝0.4493 → **不到一半**（44.9%）✓。
2. 每片毛晶粒（GDPW）＝ π·d²/(4S) − π·d/√(2S)，d＝294：
   - S＝100：π×294²/400 ＝ 678.9；π×294/√200 ＝ 65.3；GDPW ≈ **613**。
   - S＝800：π×294²/3200 ＝ 84.9；π×294/√1600 ＝ 23.1；GDPW ≈ **61**。
3. 好的顆數：613×0.9048 ≈ **555**（五百多顆 ✓）；61×0.4493 ≈ **27.4**（二十幾顆 ✓）。
4. 每片晶圓的缺陷數（畫缺陷雨用）：晶圓面積 π×15² ＝ 706.9 cm² × 0.1 ≈ **71 個致命缺陷**。每顆平均被打中：小 0.1 個、大 0.8 個。

**一致性結論：念稿的四個數字用同一組假設算得出來（d＝294 mm、S＝100／800 mm²、D0＝0.1、泊松），沒有衝突。** 但有四個「依賴假設」的地方，請 CEO 知道：

- **(a) 顆數公式敏感**：若不扣邊緣用 d＝300，GDPW＝640／65；若用 siliconanalysts 另一種寫法（π·r²/S − π·r/√(2S)，r＝147）＝646／73，則大晶片好的＝73×0.449＝32.9 → **變成「三十幾顆」，念稿「二十幾」就對不上**。念稿的「二十幾」只在 GDPW≈61–64（算到 28.7 以內）時成立。建議畫面小字寫明「300 mm 晶圓、邊緣扣 3 mm、100／800 mm²、D0＝0.1、泊松」，並一律以「61 顆」那個公式為準。
- **(b) 實際格線數與公式不同**：我用電腦在 r＝147 mm 圓內實排（只算完整晶片、不留切割道）：100 mm² 方格依偏移 616–625 顆、25×32 mm 矩形依偏移 60–69 顆。公式（613／61）略少。畫面計數器「全部」要用**真實格線數**，不要硬寫 613／61，否則格子數數得出來對不上。下面 device-spec 給了選偏移與缺陷種子的條件，讓畫面結果落在 555 附近／27 附近，與念稿一致。
- **(c) 泊松偏悲觀**：真實缺陷會成群，大晶片的真實良率通常比 44.9% 好一些（負二項式 α＝2 就超過一半）。念稿「可能不到一半」有「可能」，沒問題；畫面標「估算（簡化模型）」。**不要在畫面或旁白把「不到一半」寫成事實**。
- **(d) 800 mm² 不能畫成正方形**：√800＝28.3 mm，超過曝光視野寬度 26 mm（視野 26×33＝858 mm²）。800 mm² 的晶片只能是長方形，例如 25×32 mm。畫大晶片請用 25×32 的直立矩形（比例約 0.78），不要畫成正方形，否則懂的人一眼看出不可能。

建議（不改念稿）：念稿沒有 bug；唯一一句我會提醒的是第 1 段「同一片晶圓，同樣的缺陷，小晶片…大晶片…」——字面上同一片晶圓不會同時有兩種晶片。畫面做成「兩片晶圓並排、同一組缺陷」並標「同樣的缺陷分布」即可，不需改字。

## E. 記憶體備用列修補（念稿第 7 段）

| 說法 | 內容 | 狀態／信心 | 來源 |
|---|---|---|---|
| 作法 | 記憶體陣列多做幾條備用列（行）。晶圓測試找出壞的位址後，把那個位址記進熔絲；之後存取到該位址時，比較電路改選備用列的字元線，壞列不再被使用 | 已確定／高 | 專利 4658379、6535436、6728156；IEEE TechNav〈Chip Repair〉、〈Yield-enhancement Redundancy〉 |
| 雷射熔絲 | 晶圓階段用雷射把金屬連線燒斷（寫入位址），封裝後不能再改 | 已確定／高 | 專利 7050349、6288436 |
| 電熔絲（e-fuse） | 用電流／約 5 V 讓連線熔斷，封裝後也能修；缺點是佔面積（大電晶體或放大器），所以有的設計兩種混用（例：256 Mb DRAM 約 8000 條雷射熔絲＋100 條電熔絲） | 已確定／中高（專利舊） | 專利 8797808、9235487、6288436 |
| 代價 | 備用列佔面積；用到備用列時內部時序要略放慢（有專利提供 timing fuse 補償） | 已確定／中 | 專利「Timing fuse option for row repair」 |
| 範圍 | 規則排列的記憶體（SRAM、DRAM 陣列）才好這樣修；邏輯電路沒有備用列可換 | 已確定（業界共識）／中高；本輪沒找到單一明文來源，寫成「記憶體」就好，不寫「邏輯不能修」 | 同上推論 |

**畫面取捨**：影片只畫雷射熔絲版（視覺最直觀）；備註 e-fuse 只放文章，不上片。

## F. 小晶片 vs 大晶片（念稿第 9 段；下一支才展開）

- 缺陷曝險隨面積增加；拆成小晶片後每顆較容易無缺陷，且每顆先測成已知良品（KGD）再封裝，壞一顆只丟一小顆（SemiEngineering、webiano、electronicdesign／imec）。**已確定（作法）／高**。
- imec 示意數字：小晶片良率 >50%、同總面積大單晶片 <30%（這是舉例，不是通則）。**不要上片**。
- 代價：組裝後良率連乘、壞一顆可能連累好晶片與昂貴的中介層；單片晶片內部延遲與耗電較低、測試較簡單（Altium、webiano）。**已確定／中高**。
- 光罩視野 26×33 mm（約 858 mm²）是單晶片面積上限（imec、Octopart、SemiEngineering）。**已確定／高**。
- 「二選一」問句＝念稿第 9 段「硬做一整顆，還是拆小再拼回去？」，是開放式問題，沒有做結論；下一支「先進封裝」是已排定。

## G. 本輪沒查到或低信心

1. 2020 年以後任何製程（N3、N2、Intel、三星）廠商公布的 D0：**查不到**（關鍵字：TSMC defect density N3／N2、foundry defect density disclosure）。所以念稿第 8 段「各家現在的良率，廠商都沒有公布」是合理的說法，**但要寫成「截至 2026/11/16 查不到官方公布」**，畫面標「查證截至 2026/11/18」。
2. 邏輯晶片探針卡一次壓幾顆：沒有可靠數字（專利只講概念），畫面用「一次 4 顆」是示意，必標。
3. 缺陷到底是微粒還是圖案缺陷各佔多少：查不到比例；畫面不給比例。
4. 搜尋結果裡中文頁面多為行銷或財經頁（gugu.fund、cmoney 本益比文章），只用來交叉確認「針測是封裝前測試」的概念，沒有當數字來源。
5. 本輪全用 WebSearch 摘要；專利號與頁面標題我沒打開全文，上稿前（發布當天）請再抽 3 個網址確認還在。

## H. 新增來源網址

- ITRS Yield Enhancement 2011／2013：https://www.semiconductors.org/wp-content/uploads/2018/08/2011Yield.pdf 、…/2013Yield.pdf
- IEEE TechNav〈Integrated circuit yield〉：https://technav.ieee.org/topic/integrated-circuit-yield/ ；〈Chip Repair〉：https://technav.ieee.org/topic/chip-repair/
- 良率模型參考（泊松、Murphy、Seeds、負二項式）：https://fog.misty.com/perry/cod/references/yield_models.pdf ；https://www.globalsino.com/ICsAndMaterials/page4304.html
- 專利：6393602、5913105（缺陷與刮傷）、7453261、5654204、10620236（探針與分箱）、9026981、7194366（負二項式 α）、7050349、6288436、8797808（雷射熔絲與 e-fuse）：https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/<專利號>
- 探針卡類型：https://www.venture-mfg.com/what-is-probe-cards/
- 每片晶粒公式：https://siliconanalysts.com/guide/chips-per-wafer ；https://anysilicon.com/semipedia/die-per-wafer/
- 小晶片：https://www.imec-int.com/en/articles/when-does-it-make-sense-move-monolithic-asic-chiplet-based-design ；https://www.electronicdesign.com/55303538
- Synopsys 台灣：https://www.synopsys.com/zh-tw/taiwan/blog/enhancing-chip-yield-analytics.html
