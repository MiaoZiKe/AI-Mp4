# tech-metrology 研究紀錄：量測與檢測（科技透明圈，接化學機械研磨，下一支離子佈植）

查證截至 2026/11/20。狀態標籤：【確】已確定（原理、設備通則）｜【廠】廠商公布｜【媒】媒體報導（標誰報的）｜【估】研究機構估計｜【示】示意。
搜尋關鍵字（WebSearch，共 9 組；三類來源：原廠與專利／技術文、媒體與投顧、市場研究）：
1. semiconductor metrology inspection overlay CD-SEM optical inspection e-beam review KLA process control（KLA 官網、SEMI、SemiconductorX、Averroes）
2. 晶圓 量測 檢測 膜厚 線寬 疊對 缺陷檢測 電子束 光學 設備 台灣 廠商（工商時報、Yahoo 股市、應用材料台灣官網、數位時代）
3. process control metrology inspection market KLA Applied Materials Hitachi High-Tech ASML HMI Onto Nova share（市場研究頁、SemiWiki）
4. overlay error nanometer budget EUV scanner YieldStar diffraction-based overlay（SPIE、ASML 官網）
5. 台灣 晶圓檢測設備 國產 光學量測 AOI（科技新報、工商時報、鉅亨、udn）
6. ellipsometry thin film thickness reflectometry interference OCD scatterometry（halbleiter.org、Penn State、USPTO 專利）
7. Mulkens on-product overlay 2 nm（SEMI Engineering《How Overlay Keeps Pace With EUV Patterning》）
8. 華洋精機 光罩 微粒檢測 EUV 上櫃（科技新報、經濟日報、ETtoday）
9. 牧德 晶圓檢測 出貨 日月光（工商時報、科技新報、經濟日報）、科磊 KLA 日立先端科技 CD-SEM（日文產業分析）

## 原理（影片內容依據）
| # | 內容 | 狀態 | 來源 |
|---|---|---|---|
| 1 | 晶圓一層一層做；每步後量測，偏掉就回頭修正，後面才不白做 | 【確】製程通則 | KLA 說明頁（疊對、線寬、剖面量測資料用於即時圖案控制）；SEMI 報導 |
| 2 | 量測三大項：膜厚、線寬（關鍵尺寸，CD）、疊對（overlay）；另有缺陷檢測 | 【確】 | SemiconductorX（CD-SEM、OCD 列量測；光學與電子束檢測列檢測）；KLA 產品線 |
| 3 | 膜厚：光打在膜上，從表面與底部各反射一次，兩道光干涉，依反射光譜算出厚度；橢圓偏光儀量偏振變化再套模型算厚度與折射率 | 【確】 | halbleiter.org 膜厚量測；Penn State 橢圓偏光說明；USPTO 5910842 |
| 4 | 線寬：掃描式電子顯微鏡（CD-SEM）以電子束掃描，偵測放出的電子成像，量線邊緣得到寬度；另有光學 OCD（散射量測）用繞射圖樣反推線寬、高度與側壁（影片不寫） | 【確】CD-SEM 原理；OCD 摘要沒有原文，影片不寫 | SemiconductorX；日文產業分析 |
| 5 | 疊對：上層與下層各有一組光柵（紋路）疊在一起，光打上去，+1、−1 階繞射光強度差反映偏移量（DBO） | 【確】 | SPIE 摘要（intensity difference between the +1st and −1st diffraction order … two overlapping gratings）；ASML YieldStar 500（光學疊對量測機） |
| 6 | 疊對精度：領先的記憶體與邏輯客戶，量產疊對約 2～2.5 奈米；3 奈米世代（22 奈米金屬間距）容許值在個位數奈米範圍 | 【媒】SEMI Engineering 引 ASML 研究員 Jan Mulkens；ASML 官網：最新微影機疊對優於 2 奈米 | 搜尋 4、7（兩個獨立頁面，片中只用「約兩奈米」） |
| 7 | 疊對標記刻在晶圓切割道（scribe line）上，再換算到元件本身 | 【媒】Mulkens（SEMI Engineering） | 搜尋 7（影片視覺可畫，旁白不提） |
| 8 | 缺陷檢測：光學檢測速度快、覆蓋廣、但靈敏度較低；電子束靈敏度高、但產能低；實務是光學先掃出可疑座標，再用電子束複檢（review） | 【確】通則 | SemiconductorX、Averroes 說明；應用材料 SEMVision（電子束複檢系統）官網 |
| 9 | 量測資料送回曝光機（掃描機）修正疊對 | 【媒】SEMI Engineering：疊對量測資料用於掃描機機群管理 | 搜尋 1、7；KLA 資料分析頁 |
| 10 | 光學與電子束靈敏度的具體數字（光學 20～30 奈米、電子束 1～3 奈米） | 低權威頁面，單一來源 | 不用（影片只講「看不細／看得細」） |

## 公司（只列查得到、有來源的；不寫市占）
| 公司 | 做什麼 | 狀態 | 來源 |
|---|---|---|---|
| 科磊（KLA） | 製程控制龍頭：缺陷檢測、疊對、膜厚、線寬量測；各家市調都把它列第一 | 【媒】多份市場研究與日文產業分析 | 搜尋 1、3、9 |
| 艾司摩爾（ASML） | YieldStar 光學疊對量測機；分析稱疊對量測由科磊與 ASML 為主 | 【廠】ASML 官網產品頁；【媒】產業分析 | 搜尋 3、4 |
| 應用材料（Applied Materials） | SEMVision 電子束缺陷複檢（官網）；VeritySEM 10 專門量 EUV、High-NA 圖案的 CD（過去一年交貨 30 多套） | 【廠】應材台灣官網；【媒】Yahoo 股市／鉅亨報導 | 搜尋 2 |
| 日立先端科技（Hitachi High-Tech） | CD-SEM 領導廠商；CD-SEM 由它與應材為主 | 【媒】SemiconductorX、日文產業分析 | 搜尋 1、3、9 |
| 華洋精機（6983，台灣） | 光罩微粒檢測（台灣本土唯一能同時檢測 EUV 與 DUV 光罩微粒）；技術應用於光罩、晶圓與先進封裝檢測；設備 2022 年導入晶圓代工龍頭先進製程 | 【媒】科技新報、經濟日報、ETtoday、公司法說（公司自述，未獨立驗證） | 搜尋 5、8 |
| 牧德（3563，台灣） | 晶圓段與晶圓封裝外觀檢查機（Wafer AVI：切割碎裂、bump/pad 刮傷等）已陸續出貨；日月光為最大單一股東並合作開發 | 【媒】工商時報（2024/9）、科技新報（2025/6） | 搜尋 5、9 |
不寫：
- 各家市占（KLA 40%／53%／55–60%，各市調範圍不同，互相對不上）。
- 華洋精機客戶名與營收占比（媒體寫「晶圓代工龍頭」「八成營收」，屬公司自述）。
- 致茂、由田、晶彩科、均豪、大量：只有彙整型報導、未查到晶圓量測或檢測的具體產品與供應證據。
- 閎康、汎銓：屬材料分析實驗室，不是產線內量測設備，搜尋也沒有相關資料。
- Onto Innovation、Nova：查得到但篇幅取捨，片中不列。

## 注意（摘要陷阱）
- 搜尋 1 摘要裡，一篇 Averroes 文章夾了「2026 KLA 多束電子束發表」的字句，無法驗證，已丟棄。
- 「華洋精機」與「華洋精密」是同一家（6983），主流報導用「精機」。
- 華洋精機檢測的是「光罩」微粒，牧德檢測的是「晶圓與封裝外觀」，影片視覺要分清楚，不寫成同一件事。
- ASML 的疊對機台（YieldStar）與微影機（掃描機）是兩種產品；「數字送回曝光機修正」指的是量測資料回饋給曝光機。
