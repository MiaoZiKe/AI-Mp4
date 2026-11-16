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

---

## 第二輪補查：2.5D 封裝的真實結構與流程（2026/11/16，給 device-spec 用）

研究工具同上，只用 WebSearch（摘要，沒讀到全文）。來源三類：一手／學術（IEEE ECTC 2023 論文、TSMC 3DFabric CoWoS 官方頁、美國專利檢索頁 台積電專利、Hot Chips 2012 Amkor 教學簡報）；產業整理（SemiWiki 比較文、WikiChip CoWoS、SemiEngineering、Teradyne、Cadence、TestConX 2025 主題演講）；二手科普（PCB 廠部落格 bestpcbs）。**注意：沒有任何一份是完整、標好層名的 TSMC 剖面圖**；下面的層別順序是「多份來源拼出來」的，標信心。

### 結構（由上到下，CoWoS-S 為例）

| # | 層／零件 | 說明 | 狀態 | 來源 | 信心 |
|---|---|---|---|---|---|
| S1 | 晶片：運算晶粒（SoC／GPU die）與 HBM 並排，平放在中介層上方 | 多顆晶片水平並排，不是疊在一起 | 已確定 | WikiChip CoWoS；ECTC 2023 | 高 |
| S2 | 微凸塊（μ-bump） | 晶片面朝下，以微凸塊接到中介層上表面；ECTC 2023 寫間距約 30–60 μm；Chip Scale Review 寫 35 μm 級 | 已確定（作法）；間距為論文範圍 | ECTC 2023；Chip Scale Review 2022 | 高（作法）／中（數字，不上畫面） |
| S3 | 矽中介層：上面有重分佈層（RDL，銅細線加介電層），晶片之間靠這些線互連；層內有矽穿孔（TSV）垂直穿過矽 | 上下兩面都可有 RDL，上面接 μ-bump、下面接 C4（CoWoS-L 論文明寫兩面都有 RDL） | 已確定 | ECTC 2023；台積電專利檢索頁（CoW 的 TSV 要磨薄後露出） | 高 |
| S4 | C4 凸塊（受控塌陷晶片連接） | 中介層底面接到封裝基板；ECTC 一篇寫 150 μm 間距銅柱 C4（凸塊比微凸塊粗得多） | 已確定（作法）；150 μm 是單篇論文例子 | ECTC 2023 | 中高 |
| S5 | 封裝基板（有機增層基板，ABF 薄膜為增層絕緣材料） | 有機材料多層板，線寬與孔都比中介層粗很多 | 已確定（基板有機、增層）；ABF 名稱為產業共識（本輪沒找到單篇明寫 CoWoS 用 ABF，列在查不到） | WikiChip；ECTC 2023（build-up organic substrate） | 中高 |
| S6 | BGA 錫球 | 基板底面接到主機板（PCB）；專利檢索頁寫「以 BGA 方式安裝到 PCB」 | 已確定 | 台積電專利檢索頁 | 高 |

**層別順序（由上到下）定案：晶片（SoC、HBM）→ 微凸塊 → 矽中介層（RDL＋TSV）→ C4 凸塊 → 有機基板（ABF 增層）→ BGA 錫球 → 主機板。** 摘要工具自己也說「BGA 與 ABF 增層的相對位置沒有單篇明確」，但 BGA 在基板底面是封裝通識，信心高。

### 流程（CoWoS-S 的代表性順序；各家與各變體的順序不同）

1. 挑好的晶片（已知良品，KGD）：晶片先在晶圓階段做探針測試（上一支的針測），切開後再挑好的；TestConX 2025 主題演講、Teradyne、SemiEngineering 都提到組裝前要確認晶粒好壞，壞的混進去會連同中介層與基板一起報廢。**已確定（作法）**，高。
2. 晶片貼到「中介層晶圓」上（chip-on-wafer，CoW）：用微凸塊接合，之後灌第一次底部填充膠（underfill）並固化。專利檢索頁原文有「mounting IC chips on the interposer wafer via micro-bumps, applying and curing the first underfill」。**已確定**，中高。
3. 磨薄 CoW，露出 TSV，做 C4 凸塊（背面）。專利與 Amkor 簡報：背面研磨、載板移除、露出 TSV、加焊墊。**已確定**，中。
4. 切割（singulation），再貼到封裝基板（oS：on substrate）並灌第二次底部填充膠。專利：「second underfill between CoW and package substrate … then diced」；Amkor 簡報順序略有不同（先切再貼）。**順序因變體而異**，中。
5. 最後裝 BGA 錫球、上 PCB（回流焊）。**已確定**，中高。
- 微凸塊接合是用熱壓還是整批回流焊：**本輪查不到**（Cadence 與 ECTC 都只說「堆疊或回流後才暴露的潛在缺陷」）。影片的「回流焊」只用在「整顆封裝放上基板、錫球／凸塊熔化」這個一般性說法，標示意。
- 回流焊時凸塊熔融、表面張力把零件拉回對位（自對位），是焊接通識（不是從本輪來源查到）：**已確定（通用物理）**，中高，畫面不標數字。

### CoWoS-S／L／R 差別

| 型式 | 中介層 | 狀態 | 來源 | 信心 |
|---|---|---|---|---|
| CoWoS-S | 整片矽中介層（含 TSV）；台積電官網寫已量產自 2012、矽中介層可到約 3.3 倍光罩 | 已確定（官網）；3.3 倍為廠商公布 | TSMC 3DFabric CoWoS 頁；SemiWiki | 高 |
| CoWoS-R | 以有機重分佈層（RDL）取代矽中介層（銅線＋聚合物介電）；官網 RDL 最小線距約 4 μm（線寬線距各 2 μm） | 已確定；數字為廠商公布 | TSMC 官網；SemiWiki | 高／中 |
| CoWoS-L | 以重組（reconstituted）中介層加 RDL 做封裝層級走線，只在需要高密度的位置埋入小塊矽橋（LSI，本地矽互連）；成型膠包住 TIV（穿孔導通）提供基板到上方晶片的垂直通路 | 已確定 | ECTC 2023；SemiWiki；bestpcbs | 高 |
- **對念稿段 7 的含意**：廠商公布的兩顆晶片十 TB／s 互傳，路徑是 CoWoS-L 的矽橋（LSI），不是整片矽中介層。念稿只說「並排」，不衝突；但**畫面不可把兩顆晶片之間畫成一整片矽中介層**，段 7 要用「矽橋」或把中介層畫成示意並標「示意」。
- 另一點：「CoWoS-S 是最成熟版本」與「S 與 L 性能互有說法」二手說法不一，旁白不比較三者優劣。

### 中介層走線密度（對念稿段 6「線比電路板細很多」）

- HBM 每疊 1024 位元介面（HBM4 為 2048 位元，JEDEC），數千條訊號線，一般電路板放不下，所以要中介層（Rambus、Tom's Hardware、IONOS 整理）。**已確定**，高。
- 線寬數字：TSMC 官網只給 RDL 中介層 4 μm 線距；矽中介層的線寬、TSV 直徑**本輪查不到**（搜尋摘要沒有）。對照「一般電路板線寬」亦查不到單篇數字。**所以畫面只畫「相對很細／很粗」，不標微米數字**。
- 「晶片跟記憶體貼得近，資料才夠快」：距離越長延遲與功耗越高，已確定（research #4）。

### 比例（光罩尺寸與中介層倍數）

- 中介層有尺寸上限：矽中介層本身也是用同一種曝光機印的，所以單次曝光 858 mm²；要更大就把幾次曝光拼接（stitching，有專利檢索結果「Forming large chips through stitching」）。台積電官網寫 CoWoS-S 中介層到約 3.3 倍；5.5 倍、9 倍、14 倍屬 CoWoS-L／後續（research #2、#10）。**念稿「五倍以上」不指定是哪一型，OK**。
- 實際倍數的畫法：1 倍＝26×33 mm 框；5 倍框的面積加起來約 4,290 mm²（5.5 倍＝4,719 mm²，Tom's Hardware）。畫面以「框數」呈現，**框是面積單位，不是封裝外形**（封裝是矩形，不是 5 個框排一排；見 device-spec）。

### 念稿事實核對（念稿不改，列建議）

| 段 | 念稿 | 核對 | 建議 |
|---|---|---|---|
| 1 | 一次曝光最多印八百多平方毫米；最大封裝五倍以上 | 858／830 都屬「八百多」，OK；五倍以上＝廠商公布（5 與 5.5 倍） | 無；但畫面別讓人以為「晶片」可以到五倍：晶片仍受 858 mm² 限制，**變大的是封裝（中介層）**。段 1 大字用「封裝」不用「晶片」，見 spec |
| 2 | 好幾顆晶片平放在矽中介層上，旁邊圍一圈記憶體 | OK（CoWoS-S 結構；CoWoS-L 的中介層不是整片矽） | 畫面標「以 CoWoS-S 示意」小字 |
| 3 | 接點變多，訊號多走一段 | OK（業界共識，research #7） | 無 |
| 4 | 大晶片好的不到一半 | 估算（上一支 45%）；念稿沒有講是「估算」 | 畫面必標「估算，簡化模型」 |
| 5 | 每顆先測過，只挑好的封裝；壞一顆只丟那一小顆 | OK（KGD）；注意壞的丟的是**晶片**，不是整個封裝 | 畫面壞晶片掉進廢料盒，已貼的封裝不丟 |
| 6 | 中介層的線比電路板細很多 | OK（定性）；沒有數字來源 | **不標微米**；只畫相對粗細 |
| 7 | 兩顆印到極限的晶片並排，每秒互傳十兆位元組 | 廠商公布（NVIDIA 2024/3）；晶片間走矽橋（CoWoS-L LSI） | 畫面別畫成整片矽中介層；標「廠商公布」 |
| 8 | 這種大封裝良率已超過九成八 | 廠商公布（台積電 2026/8 OCP，媒體轉述）；**那是封裝組裝良率，不是上一段的「晶片好壞」良率**，兩者不能混為一談 | 標籤寫「廠商公布，封裝良率，非第三方實測」；不與段 4 的 45% 畫在同一張比較 |
| 9 | 十四倍排在二零二八年 | 廠商目標（2026/4 北美技術論壇） | 標「廠商目標值（非實測）」 |
| 10 | 往旁邊拼，還是往上疊？ | OK；下一支 HBM | 無 |

### 本輪新增的低信心點

1. 矽中介層與 TSV 的真實尺寸、線寬：查不到（只有 4 μm RDL 線距）。
2. 微凸塊接合是熱壓還是回流：查不到。
3. ABF 在 CoWoS 基板的明確來源：只有「有機增層基板」，ABF 為產業通識。
4. CoWoS-S 流程順序（先貼基板後切或先切）依變體不同。
5. 各層相對厚度：本輪沒有來源，device-spec 全部標「示意」。

### 新增來源網址

- TSMC 3DFabric CoWoS：https://3dfabric.tsmc.com/english/dedicatedFoundry/technology/cowos.htm
- WikiChip CoWoS：https://en.wikichip.org/wiki/CoWoS
- IEEE ECTC 2023（CoWoS 可靠度、μ-bump 30–60 μm、150 μm C4）：https://conferences.computer.org/ectc/pdfs/ECTC2023-1NkkviSxgDnmPjptC1ysqm/349800b022/349800b022.pdf 、…/349800a510/349800a510.pdf
- 台積電專利（CoW 流程：第一次底部填充、磨薄、切割、BGA）：https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12068300 、…/11532573
- Hot Chips 2012 Amkor 堆疊教學：https://old.hotchips.org/wp-content/uploads/hc_archives/hc24/HC24-Tut2-Die-Stack/HC24.27.225-Stacking-Tutorial-Lee-Amkor.pdf
- SemiWiki CoWoS-S／R／L 比較：https://semiwiki.com/semiconductor-manufacturers/tsmc/371790-comparison-of-tsmc-cowos-s-cowos-r-and-cowos-l/
- Teradyne（AI 小晶片測試）：https://www.teradyne.com/2026/07/27/ai-chiplet-architectures-redefining-test-insertions
- TestConX 2025 主題演講：https://www.testconx.org/premium/wp-content/uploads/2025china/TestConXChina2025s1p1HurtarteKeynote_6321.pdf
- SemiEngineering（單顆測試）：https://semiengineering.com/singulated-die-test-ensures-stacked-die-quality-as-power-density-rises/
- Rambus HBM3：https://www.rambus.com/blogs/hbm3-everything-you-need-to-know/
