# 先進封裝：晶片太大做不好，拆小再拼回去（科技透明圈 第 5 支・tech-packaging）

查證截至 2026/11/16。**發布當天（11/18）要再查一次「五倍光罩量產」「良率 98%」「14 倍時程」是否有更新，並更新畫面上的「查證截至」日期。**
排程：2026/11/18（三）20:00（`TZ=Asia/Taipei date -d 2026-11-18 +%A` → Wednesday），類別「產業／科技原理」，接 tech-yield 片尾「下一支，來看先進封裝」。
狀態標記：**已確定**（標準、物理、多個獨立來源一致）／**廠商公布**（廠商自己的說法，非第三方實測）／**媒體報導**（寫明哪家）／**估算**（照公開模型推算，非實測）／**廠商目標值（非實測）**／**查不到**（截至日期）。
研究工具：只用 WebSearch（拿到摘要與標題，沒有讀到全文）。來源三類：一手（台積電法說、技術論壇、OCP 演講被媒體轉述；NVIDIA 產品發表；AMD ISSCC 論文被轉述）、產業媒體與資料站（TrendForce、Tom's Hardware、WikiChip、SemiEngineering、科技新報、經濟日報、數位時代）、科普整理（鉅亨號、優分析、財報狗）。

## 一句話

一次曝光能印的最大面積大約 26 × 33 毫米（約 858 平方毫米），晶片不可能印得比這更大；而且晶片越大越容易被缺陷打中（上一支良率）。所以 AI 晶片改成「拆成幾顆小的，各自先測好，再平放在一片矽中介層上拼回去，旁邊圍上記憶體」——這就是 2.5D 先進封裝（台積電叫 CoWoS）。現在量產的封裝面積已經是單次曝光上限的五倍以上。

## 數字與來源

| # | 說法（影片裡怎麼講） | 數字 | 狀態 | 來源（查詢日 2026/11/16） | 信心 |
|---|---|---|---|---|---|
| 1 | 一次曝光，最多印八百多平方毫米 | 曝光視野 26 × 33 mm ≈ 858 mm²（193 nm 浸潤式與 EUV 相同）；台積電自己的口徑約 830 mm² | 已確定 | SemiEngineering〈Are Larger Reticle Sizes On The Horizon?〉；Tom's Hardware〈TSMC Super Carrier CoWoS interposer〉（同時寫 830 與 858）；tech-yield research #7 | 高（畫面寫「約 858 mm²」小字，旁白只念「八百多」） |
| 2 | 現在最大的 AI 晶片封裝，是這個的五倍以上 | 台積電 2026/10 法說：已量產五倍光罩尺寸的先進封裝；2026/8 OCP APAC 峰會副總何軍：5.5 倍光罩 CoWoS 已大量生產 | 廠商公布 | 鉅亨號、優分析〈台積電法說〉（2026/10 法說摘要；同一篇寫 5 倍也寫 5.5 倍）；優分析〈OCP 峰會 台積電 CoWoS 良率已達 99%〉（2026/8）；Tom's Hardware（5.5 倍＝4,719 mm²、可放 12 顆 HBM4） | 中高（5 與 5.5 兩種說法，旁白用「五倍以上」兩者都對） |
| 3 | 好幾顆晶片平放在一片矽中介層上，旁邊圍一圈記憶體 | 2.5D 封裝：運算晶片與 HBM 水平並排在中介層上，中介層再接到下方基板；CoWoS-S（全矽中介層）、CoWoS-L（局部矽橋＋重分佈層）、CoWoS-R（有機重分佈層） | 已確定 | 數位時代〈台積電 CoWoS 類型解釋〉；科技新報〈什麼是 CoWoS、CoPoS、CoWoP〉（2025/9/8）；TrendForce 2.5D／3D 說明；經濟日報產業科普頁 | 高 |
| 4 | 中介層的線比電路板細很多；晶片跟記憶體貼得近，資料來回才夠快 | 運算晶片與 HBM 之間線路密度高，傳統基板承載不了，需要中介層；晶片與中介層用微凸塊接（間距約 40～50 微米），中介層用矽穿孔（TSV）接到基板；距離越長，延遲與功耗越高 | 已確定（作法）；微凸塊間距為媒體整理 | 鉅亨號〈CoWoS 為什麼需要中介層〉；鉅亨號〈台積電的 CoWoS 封裝技術是什麼？〉；數位時代同上 | 高（間距數字只放 research，不上畫面） |
| 5 | 大晶片好的估計不到一半（上一支） | D0＝0.1/cm²、800 mm² → e^(−0.8) ≈ 45% | 估算（簡化泊松模型） | tech-yield research #4–#6（AnandTech 2020 N5 缺陷密度） | 中（畫面標「估算，非實測」） |
| 6 | 拆成小顆，每顆先測過，只挑好的封裝；壞一顆只丟那一小顆 | 小晶片各自做「已知良品」測試（KGD）再組裝；WikiChip 例子：360 mm² 單顆良率約 15%，拆成 4 顆 99 mm² 約 37%；AMD 自己估算 32 核設計拆 4 顆成本約為單顆的 0.59 倍（多出約 10% 面積） | 已確定（作法）；數字為廠商估算 | WikiChip〈Chiplet〉；Next Platform〈AMD on why chiplets and why now〉（2021/6/9，引 AMD ISSCC 論文）；SemiEngineering〈Chiplets add more inspection and test steps〉 | 高（作法）／中（0.59 只放 research，不上旁白） |
| 7 | 拆開再拼的代價：接點變多、訊號多走一段 | 晶片之間每傳一次資料，相比單一晶片會有效能或延遲代價；小晶片本身也不一定小 | 已確定（業界共識） | The Register〈AMD chiplets〉（2024/4/23）；WikiChip（10% 跨晶片通訊面積開銷） | 高 |
| 8 | 廠商公布的大晶片，就是兩顆印到極限的晶片並排，每秒互傳十兆位元組 | NVIDIA Blackwell（2024/3 發表）：兩顆「印到光罩上限」的晶片封在一起，晶片間 10 TB/s，共 2,080 億電晶體，台積電 4NP、CoWoS-L | 廠商公布 | Electronic Design〈NVIDIA's Blackwell GPU〉；All About Circuits〈NVIDIA reveals Blackwell〉；CDOTrends〈Nvidia unveils new B200 GPU〉；數位時代（CoWoS-L 用於 Blackwell） | 高（旁白不念公司與產品名；出處小字寫「NVIDIA 2024/3 發表」） |
| 9 | 代價是封裝變難；廠商說大封裝良率已超過九成八 | 2026/8 OCP APAC：5.5 倍光罩 CoWoS 多家 AI 客戶產品良率超過 98%，部分達 99% | 廠商公布（媒體轉述） | 優分析〈OCP 峰會〉（2026/8）；財報狗〈台積電 CoWoS 良率衝上 98%〉 | 中（只有廠商說法，畫面標「廠商公布，非第三方實測」） |
| 10 | 更大的九倍、十四倍版本，廠商排在二零二八年以後 | 2026/4 北美技術論壇：14 倍光罩 CoWoS（約 10 顆運算晶粒＋20 顆 HBM）預計 2028 年生產、2029 年推出大於 14 倍；9 倍（或 9.5 倍）各報導寫 2027 年 | 廠商目標值（非實測） | 優分析〈台積技術論壇 瞄準大尺寸封裝 推出 14 倍光罩 CoWoS、40 倍光罩 SoW-X〉（2026/4）；Tom's Hardware（9 倍、2027）；TrendForce（9.5 倍、2027） | 中（**9 倍時程是 2027，不是 2028**：旁白念「九倍、十四倍……排在二零二八年以後」不精準，見下方「念稿修正」） |
| 11 | （不念）產能 | 2026 年底 CoWoS 月產能各法人估 10.6 萬～14 萬片 | 分析推測 | TrendForce（12～14 萬）；Morgan Stanley（12～13 萬）；Goldman Sachs（約 10.6 萬）；經濟日報引法人 | 中低（口徑不同，不上影片） |
| 12 | （不念）CoPoS | 2026/4 法說：已建 CoPoS（方形面板）試產線，數年後量產 | 廠商公布 | 優分析〈台積電法說 已建置 CoPoS 實驗線〉 | 中（留給完整解說文章） |

### 念稿修正（已套用）
- #10：9 倍的時程是 2027 年，所以念稿改成「十四倍的版本，廠商排在二零二八年」，不把九倍一起放進 2028。

## 影片裡刻意不說的

- 不念任何公司名與產品名（畫面也不放商標）；出處小字才寫台積電、NVIDIA。
- 不說產能數字（法人口徑不一）、不說價格、不給投資建議。
- 小晶片的良率好處用「上一支估算」帶過，不再算一次；AMD 0.59 倍成本只放文章。
- 5 倍與 5.5 倍兩種說法並存，旁白只說「五倍以上」。

## 查不到或低信心

- 台積電 10 月法說「五倍」與「5.5 倍」同一篇報導兩種寫法，原始逐字稿沒讀到（WebSearch 只到摘要）。
- 98%／99% 良率只有廠商說法，沒有第三方實測。
- 微凸塊間距 40～50 微米只有一篇媒體整理，不上畫面。

## 寫成文章時的段落

1. 一次曝光能印多大：26 × 33 mm。
2. 為什麼不一顆做到底：缺陷與良率（連回上一支）。
3. 拆小再拼：已知良品、中介層、微凸塊、矽穿孔。
4. 2.5D 三種做法：CoWoS-S／L／R。
5. 現況與目標：5.5 倍量產、良率（廠商說法）、14 倍目標、CoPoS。
6. 下一支：記憶體為什麼要疊十二層（HBM）。

## 來源網址

- 優分析（台積電法說 CoPoS）：https://uanalyze.com.tw/articles/4144650771
- 優分析（技術論壇 14 倍／SoW-X）：https://uanalyze.com.tw/articles/9184751106
- 優分析（OCP 峰會 良率 99%）：https://uanalyze.com.tw/articles/8236053186
- 財報狗（CoWoS 良率 98%）：https://statementdog.com/news/17387
- Tom's Hardware（9 倍 Super Carrier）：https://www.tomshardware.com/tech-industry/tsmc-super-carrier-cowos-interposer-gets-bigger-enabling-massive-ai-chips-to-reach-9-reticle-sizes-with-12-hbm4-stacks
- TrendForce（光罩尺寸擴大）：https://www.trendforce.com/news/2025/05/02/news-wafer-level-packaging-showdown-tsmc-scales-up-cowos-reticle-size-as-intel-readies-foveros-s/
- WikiChip Chiplet：https://en.wikichip.org/wiki/chiplet ；CoWoS：https://en.wikichip.org/wiki/CoWoS
- Next Platform（AMD 小晶片）：https://www.nextplatform.com/2021/06/09/amd-on-why-chiplets-and-why-now
- The Register（小晶片代價）：https://www.theregister.com/2024/04/23/amd_chiplets_ghg/
- Electronic Design（Blackwell）：https://www.electronicdesign.com/technologies/embedded/article/21284968/electronic-design-nvidias-blackwell-gpu-driving-the-future-of-ai
- All About Circuits（Blackwell）：https://www.allaboutcircuits.com/news/nvidia-reveals-blackwell-worlds-most-power-chip-for-ai/
- 數位時代（CoWoS 類型）：https://www.bnext.com.tw/article/82088/tsmc-cowos-type-explanation
- 科技新報（CoWoS／CoPoS／CoWoP）：https://technews.tw/2025/09/08/what-is-cowos-copos-cowop/
- 鉅亨號（中介層）：https://hao.cnyes.com/post/274146 、https://hao.cnyes.com/post/81358
