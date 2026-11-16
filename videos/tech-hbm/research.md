# HBM：十二層記憶體，比一張信用卡還薄（科技透明圈 第 6 支・tech-hbm）

查證截至 2026/11/16。**發布當天（11/19）要再查一次市占（Counterpoint 第三季若已出就換新）、HBM4 基底晶片製程說法，並更新「查證截至」日期。**
排程：2026/11/19（四）20:00（`TZ=Asia/Taipei date -d 2026-11-19 +%A` → Thursday），類別「產品」，接 tech-packaging 片尾「下一支，來看記憶體為什麼疊十二層」；片尾預告 11/20（五）「伺服器到底是什麼」。
供應鏈位置（topic_tree）：先進封裝節點的拓展子題——圍在運算晶片旁邊的那一圈記憶體；往下游接伺服器。
狀態標記：已確定／廠商公布／媒體報導（寫明哪家）／估算／廠商目標值（非實測）／查不到。
研究工具：只用 WebSearch（摘要）。來源三類：一手（JEDEC 標準被轉述、SK 海力士與三星新聞稿、台積電說法）、研究機構（Counterpoint、TrendForce）、媒體（科技新報、Tom's Hardware、Edaily）。

## 一句話

HBM 是把好幾層 DRAM 晶片磨薄、打上幾萬個矽穿孔（TSV）直接疊起來的記憶體，放在 AI 晶片旁邊的中介層上。十二層的 HBM3E 整疊約 720 微米，比信用卡（0.76 公釐）還薄；新一代 HBM4 一疊有 2,048 條資料線。最底下一片是邏輯晶片，HBM4 起開始交給晶圓代工廠用邏輯製程做。全世界只有三家在做（SK 海力士、三星、美光）。

## 數字與來源

| # | 說法 | 數字 | 狀態 | 來源（查詢日 2026/11/16） | 信心 |
|---|---|---|---|---|---|
| 1 | 十二層疊在一起，整疊比信用卡薄 | 三星 12 層 3D-TSV：封裝厚度 720 µm，與 8 層 HBM2 相同；SK 海力士 12 層 HBM3E（2024/9/26 量產）：與 8 層產品同厚；信用卡 ID-1 標準厚 0.76 mm（760 µm） | 已確定（廠商公布＋ISO/IEC 7810） | 三星新聞稿〈Industry's First 12-Layer 3D-TSV Chip Packaging Technology〉；科技新報〈SK 海力士率先全球量產 12 層堆疊 HBM3E〉（2024/9/26）；ISO/IEC 7810 ID-1 | 中高（**只限 HBM3E／12 層 720 µm**；HBM4 的 12／16 層 JEDEC 定 775 µm，比信用卡厚，所以畫面標「第五代 HBM3E」，不寫成所有 HBM） |
| 2 | 全世界只有三家在做 | 2026 Q2 HBM 營收市占：SK 海力士 50%、三星 33%、美光 18%（合計約 100%） | 研究機構估計（Counterpoint） | Counterpoint〈Global HBM Market Share Q2 2026〉（韓文版）；Edaily 2026/9/3 報導 | 中高（市占是估計；「三家」由市占合計推得，另有中國廠商傳聞未計入，畫面標「Counterpoint 2026 Q2」） |
| 3 | 一般電腦記憶體一次走 64 條資料線；新一代 HBM 一疊 2,048 條 | DDR5 模組資料寬度 64 位元（兩個 32 位元子通道）；HBM4 介面 2,048 位元，是 HBM3（1,024）的兩倍 | 已確定（JEDEC 標準） | Tom's Hardware〈Preliminary HBM4 specs〉；TrendForce〈HBM basics and the rise of HBM4〉（2025/9/29）；JEDEC DDR5 標準（JESD79-5） | 高 |
| 4 | 直接在晶片上打洞 | 矽穿孔（TSV）垂直連接各層 DRAM | 已確定 | 三星新聞稿；TrendForce 同上 | 高 |
| 5 | 打上幾萬個比頭髮細的孔，填銅 | 三星 12 層：超過 60,000 個 TSV，每孔直徑約人髮的二十分之一 | 廠商公布 | 三星新聞稿；EEPower 轉述 | 中高（旁白只說「幾萬個」「比頭髮細」） |
| 6 | 十二層版本每一片薄了四成，才塞得進原本八層的高度 | SK 海力士：單顆 DRAM 晶片比以前薄 40%，12 層與 8 層同厚；用 MR-MUF 填充 | 廠商公布 | 科技新報 2024/9/26；SK 海力士新聞稿轉述 | 中高 |
| 7 | 最底下那一片不是記憶體，是指揮整疊的邏輯晶片 | HBM 的基底晶片（base die／logic die）負責介面與控制 | 已確定 | TrendForce 同上；Siemens〈HBM3E／HBM4 IC design guide〉（2026/4/24） | 高 |
| 8 | 新一代開始交給晶圓代工廠，用邏輯製程做 | 台積電確認以 12FFC+（12 奈米級）與 N5（5 奈米級）製造 HBM4 基底晶片；SK 海力士沒說初期用哪一個 | 廠商公布 | Tom's Hardware〈SK hynix completes development of HBM4〉；Utmel〈HBM4 and the shift to customized AI memory〉 | 中高（「3／4 奈米」說法與台積電說法不符，不採用） |
| 9 | 每一家用哪個製程、堆疊良率多少，廠商都沒有完整公布 | 查不到各家 HBM4 基底製程與良率的官方數字 | 查不到（截至 2026/11/16） | 同 #8（SK 海力士不揭露基底製程） | — |
| 10 | 底層交給客戶自己設計（二選一的另一邊） | HBM4 起的「客製化 HBM」：客戶可在基底晶片放自己的邏輯 | 媒體報導 | Utmel 同上；TrendForce 同上 | 中（只當問句，不當結論） |
| 11 | （不念）頻寬 | HBM4 JEDEC 每腳最高 6.4 Gb/s 起；SK 海力士宣稱 10 Gb/s | 標準／廠商公布 | Tom's Hardware 兩篇 | 中（留給文章） |

## 影片裡刻意不說的

- 市占只念「三家」，數字放畫面小字並標「Counterpoint 2026 Q2 估計」；不排名誰好誰壞、不給投資建議。
- 不說哪一家良率高、哪一家被哪個客戶認證（多為傳聞）。
- 畫面不放任何公司商標；可以在畫面小字寫公司名（playbook 第十一節：點名可以，附出處與狀態）。

## 查不到或低信心

- HBM4 是否全部比信用卡厚：JEDEC 775 µm 是 TrendForce 轉述，原文件沒讀到；所以鉤子只講 HBM3E 12 層。
- 「30 微米」單層厚度：查不到可靠來源，不用。

## 寫成文章時的段落

1. HBM 是什麼、放在哪（連回先進封裝）。
2. 為什麼要疊：資料線寬度（64 vs 2,048）。
3. 怎麼疊：磨薄、TSV、填充（MR-MUF）、熱壓接合。
4. 底下那一片：邏輯基底晶片、交給晶圓代工、客製化 HBM。
5. 誰在做：三家與市占（Counterpoint）。
6. 下一支：這些晶片最後裝進的伺服器。

## 來源網址

- 三星 12 層 3D-TSV：https://news.samsung.com/us/samsung-12-layer-3d-tsv-chip-packaging-technology
- 科技新報 SK 海力士 12 層 HBM3E：https://technews.tw/2024/09/26/sk-hynix-announces-first-global-mass-production-of-12-layer-stacked-hbm3e/
- 科技新報 SK 海力士下單 ASMPT 鍵合設備：https://technews.tw/2024/10/04/sk-hynix-places-order-tc-bonders-asmpt/
- Tom's Hardware HBM4 規格：https://www.tomshardware.com/tech-industry/preliminary-hbm4-specs-point-to-major-performance-uplift-for-gpus/
- TrendForce HBM 基礎：https://www.trendforce.com/news/2025/09/29/news-breaking-the-memory-wall-hbm-basics-and-the-rise-of-hbm4-in-ai/
- Siemens HBM 設計指南：https://blogs.sw.siemens.com/semiconductor-packaging/2026/04/24/hbm3e-hbm4-ic-design-guide/
- Utmel 客製化 HBM：https://www.utmel.com/blog/news/semiconductor/hbm4-and-the-shift-to-customized-ai-memory-the-advanced-packaging-bottleneck
- Counterpoint HBM 市占：https://korea.counterpointresearch.com/global-hbm-market-share-q2-2026/
- Edaily：https://en.edaily.co.kr/news/eda202609035608/
