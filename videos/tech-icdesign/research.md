# tech-icdesign 研究紀錄（查證截至 2026/11/18；畫面常駐「查證截至 2026/11/23」，發片當天再查一次）

狀態標籤：【確】已確定｜【廠】廠商公布｜【研】研究機構估計｜【媒】媒體報導（標誰報的）｜【示】示意。WebSearch 摘要是線索不是事實，下面每條都標了信心度。

## 查證用的關鍵字與來源類別（≥3 組關鍵字、≥3 類來源）
1. 「fabless IC design flow RTL synthesis place and route tape-out GDSII photomask」→ 教學／技術文章（All About Circuits、AnySilicon、Wikipedia Design flow）
2. 「創意電子 世芯 智原 ASIC 設計服務 …」→ 財經與產業媒體（數位時代 bnext、科技新報、工商時報、商業周刊、聯合新聞網）
3. 「EDA 三大 Synopsys Cadence Siemens EDA 市占 …」→ 市調與分析（SemiAnalysis、芯智訊轉載、優分析）
4. 「photomask reticle 4x reduction …」→ 一手／專利與光罩廠說明（Compugraphics、SPIE 論文、美國專利）
5. 「先進製程晶片 金屬層 … back-end-of-line」→ 技術文章（Semiconductor Engineering、Wikipedia BEOL）
6. 「力旺 晶心科 矽智財 …」「力旺電子 eMemory …」→ 公司新聞稿與媒體（iThome 新聞稿、科技新報、數位時代）
7. 「NVIDIA fabless TSMC …」→ 公司年報摘要（NVIDIA 10-K 的 "fabless and contracting manufacturing strategy" 說法為二手轉述）

## 結論與念稿用到的事實
| # | 事實 | 狀態 | 來源／信心 |
|---|---|---|---|
| 1 | 設計公司（fabless）專心設計，製造交給晶圓代工；代工廠提供標準元件庫與設計規則，設計公司照著設計 | 【確】基本定義 | All About Circuits、Wikipedia；高 |
| 2 | 設計流程：規格→架構→用 RTL 程式描述電路→模擬驗證→邏輯合成→布局（平面規劃、擺放、繞線）→時序／DRC／LVS 簽核→交出 GDSII（tape-out）→做成光罩 | 【確】通用流程 | AnySilicon、Wikipedia Design flow、dzone；高 |
| 3 | 光罩上的圖案比晶圓上大，掃描機的鏡組把它縮小；現代常見縮小比例 4:1 或 5:1（念稿寫「縮小四倍」＝常見的 4:1，不寫成所有機台） | 【確】 | Compugraphics、美國專利 US6337162 等；高。EUV 的反射式光學也是 4 倍的說法未獨立確認，片中不講 EUV |
| 4 | 先進邏輯晶片的金屬內連線層「10 到 15 層或更多」，Intel 10nm 為 13 層；各節點、各產品不同 | 【媒】技術文章（Semiconductor Engineering／Wikipedia BEOL） | 中高；念稿寫「十幾層」，畫面標「示意畫 6 層，實際約 10～15 層以上」。「Rubin 15 層」只有非正式教學頁，不用 |
| 5 | 創意電子（3443）、世芯-KY、智原是台灣主要的 ASIC 設計服務公司；創意成立 1998、台積電為最大股東；智原與聯電淵源 | 【媒】數位時代、科技新報、工商時報、商業周刊 | 高（多來源一致）；市占數字各家差很大（23%～40%），不寫 |
| 6 | 力旺（3529）：嵌入式非揮發性記憶體（OTP 等）矽智財；NeoFuse OTP 在台積電 N7～N3 量產驗證 | 【廠】公司新聞稿（iThome 刊）＋【媒】數位時代 | 高；念稿只寫「賣矽智財」 |
| 7 | 晶心科（6533）：RISC-V CPU 矽智財授權（授權金＋權利金） | 【媒】科技新報、數位時代 | 高；股票代號 6533 未在摘要出現，片中不放代號 |
| 8 | EDA（設計軟體）三大＝Synopsys 新思、Cadence 益華、Siemens EDA 西門子；合計約 7 成（2024 芯智訊）到 85%（SemiAnalysis 2026/5）以上，口徑不同 | 【研】 | 三家名稱高；市占不寫數字 |
| 9 | NVIDIA 採 fabless 與委外製造策略，主要由台積電製造 | 【廠】年報說法（二手轉述） | 中高；念稿不點名，只講「設計公司常常沒有工廠」，畫面不放商標 |
| 10 | 聯發科、聯詠、瑞昱是台灣 IC 設計公司 | 【確】 | 一般常識；本片不放它們的數字，不引線（不是這支主題的部位） |

## 不寫的（查不到或口徑不一）
- 設計一顆晶片要花幾年、花多少錢：來源口徑差很大。
- 光罩一組多少錢、幾張光罩：沒有一手來源。
- 台灣 EDA 代理商與本土 EDA 廠：本輪沒查到可靠名單。
- 圓星（M31）等其他 IP 公司：本輪沒查到來源，不寫。

## 下一支（晶圓代工有哪幾家、各家做什麼不同）
已排定；本片只預告題目，不先講答案。
