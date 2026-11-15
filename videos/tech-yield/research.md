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
