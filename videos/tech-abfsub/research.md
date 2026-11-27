# ABF 載板（FC-BGA 載板）：查證紀錄（科技透明圈 系列 3 第 8 集「ABF-2：ABF 載板」，約 70 秒）

查證日：2026-11-27。信心：高＝官方或兩個獨立來源一致；中＝單一媒體／公司自述／專利；低＝推論；查不到＝如實標示。

**查證方式說明**：本次以網路搜尋取得各頁摘要。這個雲端環境打不開 tomshardware.com、polymerinnovationblog.com、global.kyocera.com、samsungsem.com 全文（網路白名單外），這些頁的內容是從搜尋引擎對該頁的摘要取得，網址照列。上片前若要逐字引用，需開放這些網域再核一次。

**和上一集（3-7 ABF 膜，`videos/tech-abf/research.md`）的分工**：上一集已講「ABF 是什麼材料、味之素、市占 95%、真空壓合、半加成法（SAP）六步、線寬比頭髮細、AI 載板十幾層」。本集不重講材料與 SAP 細節，重點放在：**整塊載板怎麼從核心板一路蓋上去、為什麼 AI 載板更大更多層更難做、誰在做**。上一集已用的數字「十幾層」本集若要升級成「二十層以上」，念稿要接「上一集說十幾層，那是一面；兩面加起來……」避免觀眾覺得矛盾（見 2-2 層數口徑）。

**不上片的數字**：各家 ABF 載板市占（欣興 22%「全球最大」只見於市調報告摘要；前五大 74%；台灣合計 41.3%；Ibiden 無量化市占）；20 層以上面板良率 75–80%（市調草稿）；層數 24–28→40+ 時良率 73%→62%（wiki 類頁面）；Intel 78×77 mm 翹曲 ABF 約 50 µm 對玻璃約 20 µm（單一量測）；南電 ABF 月產能 2,800 萬顆、欣興 4,000 萬顆（投資教學網站）；南電交換器載板市占 >70%（法人估）；高盛供需缺口 10%／21%／42%；Unimicron 設備交期 30 個月、材料缺口 20%；Nvidia 載板產能 2.5 倍（單一彙整站）；各公司營收、EPS、目標價（投資資訊，頻道不給投資建議）；Ibiden AI 占營收 15% 以上；線寬線距 9/12 µm（廠商目錄，數字太技術，畫面最多寫「比頭髮細很多」，上一集已用過）。

---

## 1. ABF 載板（FC-BGA 載板）怎麼做

### 1-0 它在哪裡、做什麼
| 內容 | 來源 | 信心 |
|---|---|---|
| 堆疊順序：晶片（或 CoWoS 的多顆晶片＋中介層）→ 封裝載板 → 主機板（PCB）。晶片／中介層與載板之間用 C4 凸塊（Controlled Collapse Chip Connection，受控塌陷焊點）接；載板底面是陣列排列的錫球（BGA，ball grid array），再焊到主機板 | 台積電相關專利 USPTO 12068300（Chip-on-wafer-on-substrate package with improved yield）、12283570、11676942；ECTC 2023 論文 conferences.computer.org/ectc/pdfs/ECTC2023-1NkkviSxgDnmPjptC1ysqm/349800a510/349800a510.pdf | 高（多份專利＋論文一致） |
| 白話角色：晶片的接點又小又密，主機板的接點又大又疏；載板在中間把線「由密拉疏」轉接出去（翻成：晶片底下的轉接板） | 由上列結構推論；ECTC 例：晶片到中介層 40 µm 間距微凸塊、中介層到 85 mm 有機載板用 150 µm 間距銅柱 C4 | 高（結構）／低（比喻是推論，不誤導） |
| 介面兩處都要灌底部填充膠（underfill）包住焊點 | USPTO 12068300 等 | 中高 |
| ECTC 2023 論文實例：裝 SoC＋HBM 的 1.5 倍光罩尺寸中介層，放在 **85 mm** 的有機載板上 | ECTC 2023（同上） | 中（單一論文實例，佐證「AI 載板很大」） |

### 1-1 核心層（core）
| 步驟 | 內容與白話理由 | 可畫成 3D 的構造 | 來源 | 信心 |
|---|---|---|---|---|
| 銅箔基板 | 核心是玻纖布浸樹脂（預浸材 prepreg）壓上銅箔；壓合時預浸材軟化、流動、包住線路後固化。玻纖布讓核心「硬、不容易變形」＝整塊載板的地基 | 一片厚板，中間米色玻纖編織紋，上下兩面亮銅 | Polymer Innovation Blog（FC-BGA 剖面圖 polymerinnovationblog.com/?p=6371）；USPTO 7041531、8841209 摘要（prepreg 壓合） | 高 |
| AI 載板核心用低膨脹玻纖布（T-glass，日東紡為主要供應） | 核心要用熱膨脹小的特殊玻纖布，AI 載板尺寸變大、用量加倍 → 缺貨 | 同上（不必畫品牌） | TrendForce 2025/11/24「what is glass fiber fabric and why is T-glass critical for AI servers」；Counterpoint 報告摘要 counterpointresearch.com/en/reports/From-T-Glass-Crisis-Capacity-Erosion-The-Multi-Year-Substrate-Shortage；Tom's Hardware（Nittobo 福島擴產） | 高（缺料與用途）／市占數字不上片 |
| 機械鑽孔 | 核心太厚、有玻纖，用鑽頭打「貫通孔」（PTH，plated through hole）讓正反面相通；專利指出機械鑽孔是核心製作最貴的單一步驟，而且做不到約 150 µm 以下的小孔 | 鑽針從上往下鑽穿整片核心 | USPTO 8877565（摘要：mechanical PTH drilling can be the most expensive single process；not suitable below ~150 µm） | 中（專利） |
| 孔壁鍍銅 | 鑽完的孔要鍍銅才導電（同一份四層核心流程：鑽孔→除膠渣→電鍍→塞孔→線路） | 孔內壁一圈銅 | USPTO 8877565 等流程描述 | 中高 |
| 塞孔（plugging） | 把樹脂灌進貫通孔、硬化後把兩面磨平（buffing），上面才能平平地往上蓋；孔內有氣泡（void）可能造成短路、填料凹陷會讓表面不平 | 孔被灌滿樹脂、表面刮平 | USPTO 9578755（through holes filled with resin…buffed and flattened）；EP1194022、EP1672970（填料凹陷、氣泡） | 中（多份專利方向一致，但年代較舊） |
| 核心線路 | 核心兩面的銅蝕刻出線路（核心本身一般 2～4 層銅） | 兩面銅箔變成線 | 專利「3/2/3 FC-BGA」＝2 層核心銅＋兩邊各 3 層增層（USPTO 6969674 摘要） | 中 |

### 1-2 增層（build-up）：兩面一層一層往上蓋（上一集已講材料與 SAP，本集只帶過）
| 步驟 | 內容與白話理由 | 可畫成 3D 的構造 | 來源 | 信心 |
|---|---|---|---|---|
| 貼 ABF 膜 | 真空壓膜：加熱讓膜變軟（黏度降約一個數量級），流進線路縫隙、不留氣泡；再烘烤硬化 | 一張薄膜蓋上，邊緣被真空吸平 | Polymer Innovation Blog part one（polymerinnovationblog.com/polymers-in-electronic-packaging-build-up-films-for-flip-chip-semiconductor-substrates-part-one/）；tech-abf research 第 4 列 | 中高 |
| 增層膜沒有玻纖布 → 才能用雷射打小孔 | 「the dielectric films are capable of being laser drilled and do not contain woven glass fabric」 | — | Polymer Innovation Blog（?p=6371） | 中高 |
| 雷射鑽微孔（盲孔） | 只打穿一層膜、停在下一層的銅墊上（盲孔＝看不到底的孔，不穿透整片）。CO2 雷射波長 10.6 µm（10,600 nm），光斑 40–75 µm；UV 雷射能打更小孔、也能削銅；業界常用 UV＋CO2 組合 | 雷射光束點一下，膜上出現小碗形孔，底部露出銅墊 | iconnect007「Microvias: links of faith are not created equally」（iconnect007.com/article/118437）；Altium「microvia manufacturing processes」 | 高（CO2 10.6 µm 是物理常數）／中（光斑） |
| 微孔尺寸 | 廠商設備：MKS ESI Geode A（專打 ABF 的 CO2 雷射）孔徑 30–85 µm；三菱電機 GTF 系列宣稱可打 40 µm 以下 | — | MKS 產品頁 esi.d1.mks.com/f/geode-a-abf-via-drilling-system；iconnect007.com/article/136549；三菱電機 mitsubishielectric.com/fa/products/mecha/laser/items/drilling/index.html | 中（廠商自述，**數字不上片**） |
| 去膠渣（desmear） | 雷射打完孔底殘留燒焦的樹脂，用藥水溶掉；同時把膜面咬粗，銅才黏得住；去太多也不行 | 藥水槽，孔底黑渣被洗掉 | USPTO 8298945（over-desmeared）；tech-abf research 第 6 列 | 中高 |
| 化學銅＋電鍍銅（SAP） | 先化學鍍一層很薄的種子銅 → 乾膜光阻＋曝光顯影定義線路 → 只在開口電鍍加厚、同時把微孔填滿銅 → 去光阻 → 快速蝕刻掉多餘薄銅 | 電鍍槽：板子吊進硫酸銅藥水、銅一點點長進溝槽與孔裡 | TPCA 製程海報（ats.net/wp-content/uploads/TPCA_Miniaturization-poster_591x841mm_v3-1.pdf）；MacDermid IMPACT 2022（nexx.semi.asmpt.com/…/IMPACT-2022-US-0016-Feng-Full-Paper.pdf）；MacDermid IMPACT 2018 填孔電鍍（硫酸銅約 190–220 g/L） | 高（流程多源一致）／中（藥水配方） |
| 曝光顯影 | 載板常用雷射直接成像（LDI）曝光乾膜光阻，不用底片 | 雷射掃描頭在板面上畫出線路 | 旭化成 SUNFORT ADP&DA（LDI 用乾膜，標 FC-BGA 用）asahi-kasei.co.jp/sunfort/en/products/adp_da.html；DuPont Riston 部落格 | 中（廠商） |
| 疊孔（stacked via） | 每蓋一層就重複「雷射打孔＋填孔電鍍」，孔一顆顆正對著往上疊，像電梯井；做得到更細更多層，但交期長，填孔不穩會影響可靠度 | 剖面：一串實心銅柱一層層疊上去 | iconnect007 118437；MacDermid APEX 2021「weak microvia interface」 | 中高 |
| 兩面對稱 | 標準載板是核心兩面對稱各蓋十層以上 ABF；把層數從一面挪到另一面會不對稱、造成翹曲 | 剖面上下對稱的千層結構 | Tom's Hardware 2026（the state of ABF substrates…）摘要；iNEMI 大尺寸載板專題（iconnect007.com/article/136973） | 中高 |

### 1-3 收尾：防焊、表面處理、凸塊／錫球
| 步驟 | 內容與白話理由 | 可畫成 3D 的構造 | 來源 | 信心 |
|---|---|---|---|---|
| 防焊（solder resist，綠漆類） | 最外層塗一層保護漆，只在要焊的銅墊上開窗，避免回焊時錫流過去橋接；一家廠商寫厚度一般控制在 15–45 µm | 板面蓋上一層深色漆、露出一顆顆圓形小窗 | ipcb 技術頁 ipcb.com/ic-substrate-tech/742.html；polymerinnovationblog 剖面 | 高（功能）／中（厚度，**不上片**） |
| 表面處理 | 露出的銅墊鍍鎳金類（ENIG、ENEPIG＝鎳／鈀／金），或在墊上先上錫（SOP，solder on pad）；目的：防氧化、讓錫好焊。ENEPIG 一例：鎳 5 µm、鈀 0.2 µm、金 0.1 µm | 銅墊表面變金色 | 矽品 ENEPIG 評估論文（researchgate Don Son Jiang）；TI 應用筆記 spraa55；IPC E15&S13_02 | 中高（BGA 面）；**晶片面（C4 面）用哪種處理查不到** |
| 上面接晶片、下面植錫球 | 上面 C4 凸塊接晶片／中介層，下面錫球（BGA）接主機板；有專利把錫球與凸塊在同一次回焊完成 | 上方一片晶片落下、底面一排小錫珠 | USPTO 8993378（Flip-chip BGA assembly process）；1-0 列專利 | 中高 |

**一句話流程（念稿候選）**：先做一塊硬的核心板、打洞塞平 → 兩面一層一層貼膜、雷射打孔、鍍銅畫線，重複十幾次 → 最外面上保護漆、鍍金、裝錫球。

---

## 2. 為什麼 AI 晶片的載板更大、更多層、更難做

### 2-1 尺寸
| 內容 | 來源 | 信心 |
|---|---|---|
| Ibiden 路線圖：最先進載板 2026 年 90×90 mm、2028 年 110×110 mm、2030 年起 130×130 mm 以上 | Tom's Hardware 2026「The state of ABF substrates in data center silicon in 2026」（tomshardware.com/tech-industry/semiconductors/the-state-of-abf-substrates-in-data-center-silicon-in-2026-…）摘要；上一集 research 第 10 列同源 | 中（單一媒體轉述公司路線圖） |
| Counterpoint：載板規格正快速走向**超過 100×100 mm**、層數 20+ 到 40+；一顆 AI 晶片用的載板材料約是一般 PC 晶片的 10 倍 | Counterpoint 報告摘要（counterpointresearch.com/en/reports/From-T-Glass-Crisis-Capacity-Erosion-The-Multi-Year-Substrate-Shortage） | 中（研調摘要） |
| 欣興董事長錢山傑（2026/10）：載板尺寸從早期約 1 倍光罩尺寸 → 2025 年 3 倍 → 2026 年目標 5 倍 → 2027–2028 年 5–9 倍，最終可能到 12–14 倍 | TrendForce 2026/10/20（trendforce.com/news/2026/10/20/news-unimicron-warns-of-ic-substrate-crunch-up-to-30-month-equipment-lead-times-20-material-gap-in-2027，轉引財訊、經濟日報、MoneyDJ） | 中（公司高層談話，經二手報導） |
| ECTC 2023 論文實例：85 mm 有機載板 | 見 1-0 | 中 |
| **綜合判斷**：「AI 晶片載板做到約 10 公分見方（100 mm 上下）」＝Ibiden 路線圖（90→110 mm）＋Counterpoint（>100×100 mm）兩個獨立來源同一量級 → **中高**；念稿建議寫「接近十公分見方」或「快要一個手掌寬」，不寫精確到哪一代產品 | 綜合上列 | 中高 |
| 對照：一般 PC 處理器載板大小 → 查不到可靠的單一數字（各型號不同），**不做對照數字** | — | 查不到 |

### 2-2 層數（口徑要講清楚）
| 內容 | 來源 | 信心 |
|---|---|---|
| Ibiden 層數路線：2026 年 10-X-10、2028 年 12-X-12、2030 年起 14-X-14（「10-X-10」＝核心兩面各 10 層增層，X＝核心層） | Tom's Hardware 2026 摘要 | 中 |
| 標準載板核心兩面對稱、**各 10 層以上 ABF** | 同上；iNEMI 專題 iconnect007.com/article/136973 | 中高 |
| Counterpoint：層數 20+ 到 40+ | Counterpoint 摘要 | 中 |
| 上一集用的「12～20 層、十幾層」（technews 2026/5/30） | tech-abf research 第 8、11 列 | 中 |
| **口徑提醒**：各家層數算法不同（只算一面、兩面合計、含不含核心），一面 10 層＝兩面合計 20 層增層＋核心層 | Counterpoint 摘要（vendors count layers differently） | 高（口徑不一是事實） |
| **綜合判斷**：「兩面加起來二十層以上」＝Ibiden 10-X-10（兩面合計 20）＋Counterpoint 20+ 一致 → **中高**；念稿用「兩面加起來二十層以上」，不寫 40 層 | 綜合 | 中高 |

### 2-3 線寬線距
| 內容 | 來源 | 信心 |
|---|---|---|
| 京瓷 FC-BGA 型錄：增層線寬／線距最小 9 µm／12 µm、via 焊墊直徑最小 85 µm | Kyocera global.kyocera.com/prdct/organic/prdct/package/fcbga/std（搜尋摘要） | 中 |
| 三星電機 FCBGA：9／12 µm、凸塊間距 90 µm | samsungsem.com/global/product/substrate/package-substrate/fcbga.do（搜尋摘要） | 中（兩廠目錄數字相同 → 量產等級約 10 µm 為中高） |
| 上一集：SAP 量產約 10/10 µm、廠商宣稱 5/5 µm | tech-abf research 第 7 列 | 中 |
| AI 載板「專用」的線寬線距數字 → 查不到可靠出處 | — | 查不到 |
| 念稿處理：上一集已用「比頭髮細很多」，本集不再念線寬 | — | — |

### 2-4 良率為什麼難
| 內容 | 來源 | 信心 |
|---|---|---|
| 每多一層，就多一次出缺陷或對不準的機會，任何一層出錯整片載板可能報廢 | Wing VC「The ABF Substrate Bottleneck」（wing.vc/content/the-abf-substrate-bottleneck）；SemiEngineering「Addressing Yield Challenges In Advanced IC Substrate (AICS) Packaging」（semiengineering.com/addressing-yield-challenges-in-advanced-ic-substrate-aics-packaging） | 中高（兩個來源同方向） |
| SemiEngineering 舉例：一片面板做到 40 層製程的第 5 層時良率已只剩 50%，要不要繼續做？重點是逐片、逐層即時追蹤良率 | SemiEngineering（同上） | 中（**例子是假設情境，數字不上片**） |
| 良率相乘（推論示意）：假設每層 99% 良，20 層連乘約 82%（0.99²⁰≈0.818）；40 層約 67% | 【算】推論，非實測 | 低（只能當「示意」，畫面若用要標「示意，非實際良率」） |
| 翹曲：矽、銅、核心、ABF 受熱膨脹量不同；翹曲過大會影響焊點、層間對位與可靠度；尺寸越大越明顯 | Tom's Hardware 2026 摘要；iNEMI 專題 iconnect007.com/article/136973、137127；ECTC 2023（結構不平衡 → C4 不沾錫、橋接、底填脫層） | 高（多源一致） |
| 對位（registration）：層數越多，層與層對不準的風險越高 | Wing VC；SemiEngineering | 中高 |
| Ibiden 的優勢被描述為「高層數下的良率成熟度」；2024 年 Digitimes 報導欣興高階 ABF 良率仍低於 Ibiden（舊報導） | Wing VC；Digitimes 2024/3/26（digitimes.com/news/a20240326PD224.html） | 中（媒體；**不上片**，避免比較兩家良率） |
| 20 層以上面板良率 75–80%、良率 73%→62% | 市調草稿；wiki 類頁面 | 低，**不上片** |

---

## 3. 公司

| 公司 | 做什麼 | ABF 載板地位的可靠說法 | 來源 | 信心 |
|---|---|---|---|---|
| **欣興電子**（Unimicron，3037，桃園） | 1990 年成立的電路板廠，2000 年代切入 IC 載板；載板＋PCB＋HDI | 報導稱為能做最先進 AI 加速器 ABF 載板的**兩家之一**（另一家 Ibiden）；客戶報導含英特爾、蘋果、AMD、Nvidia；2024 年 Digitimes 稱是 Nvidia 第二家認證的 ABF 供應商；董事長 2026 年稱高階載板供給仍緊、產能滿到至少 2027 年 | TVBS 英文 news.tvbs.com.tw/english/3135117（2026/2）；Taipei Times 2022/2/25；Digitimes 2024/3/26；TrendForce 2026/10/20 | 中（媒體多家方向一致）；「全球最大、市占 22%」只見市調摘要 → **不上片** |
| **南亞電路板**（南電，Nan Ya PCB，8046） | 台塑集團；源自 1985 年南亞塑膠電路板事業部，1997 年獨立上櫃；ABF 載板約占營收 50–55%、BT 載板約 30%、PCB 約 15% | 台灣主要 ABF 載板廠之一（「載板三雄」）；產能排名、交換器載板市占為投資網站與法人說法 | 口袋學堂 pocket.tw/school/articles/5703；經濟日報 money.udn.com/money/amp/story/5607/9761399 | 中（沿革、產品）；產能／市占**不上片** |
| **景碩科技**（Kinsus，3189，桃園） | 2000 年成立、和碩集團轉投資（最大股東和碩）；載板（ABF＋BT）約占 78%、另有光學／隱形眼鏡子公司 | 台灣主要 ABF 載板廠之一；2026 年資本支出約 80 億元、其中 60 億元用於 ABF；報導 2026/2 加碼確保 ABF 膜供應 | 口袋學堂 pocket.tw/school/articles/6374；經濟日報 money.udn.com/money/story/5607/9259815；heise.de/-11174896 | 中 |
| **揖斐電**（Ibiden，4062，日本岐阜大垣） | 1912 年 11 月創立為揖斐川電力（水力發電）；1970 年進入電路板、1987 年開始做塑膠 IC 封裝載板；2023 年 3 月前退出一般電路板、專注 IC 封裝載板 | 多家報導稱 Nvidia AI 晶片的主要（甚至唯一）載板供應商；業界分析稱其優勢是高層數下的良率；**無量化市占** | Wikipedia en.wikipedia.org/wiki/Ibiden；the-shashi.com/en/tse/4062；Taipei Times 2024/12/31；Business Standard 2024/12/30；3dnews.ru/1116101 | 高（沿革，兩來源）／中（Nvidia 主力供應，媒體一致但非官方揭露） |
| **新光電氣工業**（Shinko，6967，日本長野） | 覆晶封裝載板（FC-BGA）、PBGA、無核心薄載板、2.5D 封裝載板；另做導線架、陶瓷靜電吸盤 | **已下市**：產業革新投資機構（JIC）旗下 JICC-04 公開收購 2025/2/18 開始、2025/3/18 成立（每股 5,920 日圓），DNP（大日本印刷，持收購公司 15% 表決權）與三井化學共同出資；富士通同時賣出持股；2025/5/20 臨時股東會通過股份合併，**東證 2025/6/6 下市**；企業資料站另記載 2025/12/1 併入 JICC-04 解散（登記事項，**未經官方新聞稿確認**） | 東證 jpx.co.jp/news/1023/20250520-11.html；公司公告 www2.jpx.co.jp/disc/69670/140120250605582118.pdf；DNP 新聞稿 global.dnp/en/news/detail/2025/03/0319_20176512/；Digitimes 2025/3/21；j-lic.com/companies/6967 | 高（下市日：東證＋公司公告）／中（12/1 合併解散） |

**片中處理建議**：公司卡只寫「做什麼」，不比市占、不比良率；新光電氣若出場，標「2025/6 已下市，由日本官民基金收購」。依 Andy 2026/11/24 規則，公司出場要附官方 LOGO（來源記 assets.md）、國家附國旗（台灣／日本）。

**台灣整體（不上片，留作背景）**：工研院／TPCA 類報告稱台灣廠商合計 ABF 載板市占 41.3%、全球第一（iconnect007.com/article/151541「AI drives high-end IC substrate growth to US$19.51B in 2026」）— 單一來源、口徑未明 → 中，不上片。

---

## 4. 建議片中數字與比喻

### 4-1 片中最多 2 個數字（都是「中高」，本題查不到兩個官方來源一致的「高」數字，如實標示）
1. **「接近十公分見方」**（約 100 mm）：Ibiden 路線圖 90→110 mm（Tom's Hardware）＋Counterpoint >100×100 mm，兩個獨立來源同一量級 → 中高。畫面標「AI 晶片載板，接近 10 公分見方（業界路線圖）」。
2. **「兩面加起來二十層以上」**：Ibiden 10-X-10＋Counterpoint 20+ → 中高；要說明口徑「兩面合計」，以接上一集的「十幾層」（那是一面或不同算法）。

備選（高信心，但和主題較遠）：新光電氣 2025/6/6 下市（東證公告）。CO2 雷射波長 10.6 µm（物理常數，高；但對一般觀眾意義小）。

### 4-2 生活比喻候選（≥3）
| 比喻 | 對應的物理或製程動作 | 會不會誤導 |
|---|---|---|
| 蓋大樓：先打地基（核心板），再一層一層往上蓋樓板 | 核心板＋兩面增層 | 要補「上下兩面同時蓋」——像地下室也往下蓋，不然會以為只往上；對稱是為了不翹 |
| 千層蛋糕／夾心餅乾一層層疊 | 銅線層與 ABF 絕緣層交錯 | 蛋糕是一次疊完；載板是「貼一層、打孔、鍍銅、再貼下一層」重複，畫面要演重複迴圈 |
| 雷射打孔像用放大鏡聚光在紙上燒一個小洞，燒到下面的金屬就停 | CO2 雷射鑽盲孔、停在銅墊上 | 不誤導；強調只打穿一層（盲孔），不是打穿整塊 |
| 鍍銅像「把板子泡進銅水，通電後銅一點點長進溝裡和洞裡」 | 電鍍填孔＋線路 | 要說「先刷一層很薄的底（化學銅）才能通電長銅」，否則觀眾會以為絕緣膜能直接鍍 |
| 塞孔像牆上打洞後用補土填平再磨平 | 貫通孔樹脂塞孔＋磨平 | 不誤導；塞孔用的是樹脂，孔壁已先鍍好銅 |
| 電梯井一格格對齊往上疊 | 疊孔（stacked via） | 上一集已用「電梯井」當標籤，本集可沿用並升級成疊孔剖面 |
| 良率像連過二十關的闖關遊戲：每關都很容易，連過二十關就沒那麼容易 | 層數多 → 良率相乘 | 只能當示意；不給實際良率數字 |
| 翹曲像烤餅乾邊緣翹起來（上下兩面熱脹冷縮不一樣） | 材料熱膨脹不同 → 翹曲 | 不誤導；強調尺寸越大越明顯 |

---

## 5. 可畫成 3D 的構造與製程設備

| 項目 | 怎麼畫（建議） | 依據 | 信心 |
|---|---|---|---|
| 核心板 | 一片較厚的板，側面看得到米色玻纖編織紋，上下兩面銅箔；中間幾個貫通孔（孔壁一圈銅、孔內塞滿樹脂） | USPTO 9578755、8877565；Polymer Innovation Blog 剖面（?p=6371） | 高 |
| 銅箔 | 亮橘銅色薄片，先整面、蝕刻後變線路 | 同上 | 高 |
| ABF 膜壓合（真空壓膜機） | 一張半透明薄膜從捲筒拉出、蓋上板面，上下熱壓板＋抽真空把膜壓平；之後送進烘箱 | Polymer Innovation Blog part one（vacuum lamination、加熱黏度下降）；SEMI 名錄（Nikko-Materials 真空壓膜機，semi.org/en/node/165511）；iPROS 真空壓膜機說明（不留氣泡貼合凹凸基板） | 中高（設備外型為示意） |
| 雷射鑽孔機（CO2／UV） | 上方掃描振鏡頭（galvano），光束一點點打在板上；CO2 打膜、UV 可打更小孔或削銅；三菱電機 GTF 為 4 光束機 | 三菱電機雷射鑽孔頁；MKS ESI Geode A；iconnect007 118437 | 中高（外型示意，不畫品牌） |
| 去膠渣／化學銅／電鍍槽 | 一排藥水槽，板子垂直吊掛依序浸入；電鍍槽中銅從孔底往上長滿 | MacDermid IMPACT 2018（填孔電鍍）；DuPont 部落格（無孔洞填孔需高均鍍力）；敍豐濕製程報導 finance.technews.tw/2026/04/09/wet-process/ | 中高 |
| 曝光顯影 | 乾膜光阻貼上 → 雷射直接成像（LDI）掃描 → 顯影後露出溝槽 | 旭化成 SUNFORT ADP&DA；TPCA 製程海報 | 中 |
| 微孔、盲孔、疊孔剖面 | 剖面：上下對稱多層，每層一個小碗形盲孔停在下一層銅墊；疊孔＝一串銅柱正對往上；中間核心是較粗的貫通孔 | iconnect007 118437；MacDermid APEX 2021；Polymer Innovation Blog 1+4+1 剖面（?p=6384） | 高 |
| 防焊與表面處理 | 最外層深色漆，圓形開窗露出金色焊墊 | ipcb 742；矽品 ENEPIG 論文 | 高 |
| 凸塊與錫球 | 上表面中央一片密密的小凸點（C4，接晶片）；下表面整面較大、較疏的錫球（BGA，接主機板）；兩種密度差是「由密拉疏」的視覺重點 | ECTC 2023（40 µm 微凸塊／150 µm C4）；USPTO 8993378 | 高 |
| 晶片→載板→主機板 | 三層疊：最上晶片（或晶片＋HBM 放在中介層上）、中間載板、最下主機板；可做爆炸圖上下分開 | USPTO 12068300、12283570；ECTC 2023 | 高 |
| 翹曲示意 | 加熱時載板四角微微翹起、錫球一邊沒碰到 | iNEMI 專題；ECTC 2023 | 高（現象）／示意（幅度） |

---

## 6. 查不到／未確認
- 晶片面（C4 面）焊墊用哪一種表面處理（ENEPIG、SOP 或其他）：查不到可靠來源。
- AI 載板專用的線寬線距、微孔孔徑實際數字：只有廠商目錄與設備規格，查不到 AI 載板確切值。
- 一般 PC 處理器載板尺寸（做對照）：各型號不同，查不到可引用的單一數字。
- 實際良率：只有市調草稿與 wiki 類數字，查不到可靠來源。
- 各公司 ABF 載板市占：口徑不一，查不到官方揭露。
- Nvidia 下一代平台在 Ibiden／欣興之間的分配比例：查不到。
- 新光電氣 2025/12/1 併入 JICC-04 解散：只見企業資料站，未見官方新聞稿。
- 真空壓膜機、電鍍線的實際機台外型：只畫示意，不仿特定機型。
- 無法開啟全文的網域：tomshardware.com、polymerinnovationblog.com、global.kyocera.com、samsungsem.com（以上數字都來自搜尋摘要）。

---

## 來源清單
1. Tom's Hardware 2026「The state of ABF substrates in data center silicon in 2026」：https://www.tomshardware.com/tech-industry/semiconductors/the-state-of-abf-substrates-in-data-center-silicon-in-2026-solving-the-supply-crunch-and-material-wall-beneath-every-ai-accelerator
2. Counterpoint「From T-Glass Crisis to Capacity Erosion」：https://counterpointresearch.com/en/reports/From-T-Glass-Crisis-Capacity-Erosion-The-Multi-Year-Substrate-Shortage
3. TrendForce 2026/10/20 欣興警告載板吃緊：https://trendforce.com/news/2026/10/20/news-unimicron-warns-of-ic-substrate-crunch-up-to-30-month-equipment-lead-times-20-material-gap-in-2027
4. TrendForce T-glass：https://www.trendforce.com/news/2025/11/24/news-what-is-glass-fiber-fabric-and-why-is-t-glass-critical-for-ai-servers-a-deep-dive/
5. iNEMI 大尺寸載板專題：https://iconnect007.com/article/136973 ；https://iconnect007.com/article/137127
6. iconnect007 微孔可靠度：https://iconnect007.com/article/118437
7. iconnect007 台灣載板市占：https://iconnect007.com/article/151541
8. MKS ESI Geode A：https://esi.d1.mks.com/f/geode-a-abf-via-drilling-system ；https://iconnect007.com/article/136549
9. 三菱電機雷射鑽孔機：https://mitsubishielectric.com/fa/products/mecha/laser/items/drilling/index.html
10. Polymer Innovation Blog：https://polymerinnovationblog.com/?p=6371 ；https://polymerinnovationblog.com/polymers-in-electronic-packaging-build-up-films-for-flip-chip-semiconductor-substrates-part-one/ ；https://polymerinnovationblog.com/?p=6384
11. Altium 微孔製程：https://resources.altium.com/pcb-design-blog/microvia-manufacturing-processes-hdi-substrates
12. TPCA mSAP 製程海報：https://ats.net/wp-content/uploads/TPCA_Miniaturization-poster_591x841mm_v3-1.pdf
13. MacDermid / ASMPT IMPACT 2022：https://nexx.semi.asmpt.com/ASM-NEXX/wp-content/uploads/2023/03/IMPACT-2022-US-0016-Feng-Full-Paper.pdf ；IMPACT 2018：https://macdermidalpha.com/sites/default/files/2021-07/Electroplating-Processes-For-IC-Substrates-Embedded-Trace-Plate,-Via-Fill-And-Through-Hole-Fill-IMPACT-2018-Paper.pdf ；APEX 2021：https://www.MacDermidAlpha.com/sites/default/files/2021-07/Process-Improve-Strategies-for-Weak-MicroVia-Interface-APEX-2021-Paper.pdf
14. DuPont 細線路光阻：https://www.dupont.com/blogs/fine-line-patterning-slps-high-res-photoresist.html
15. 旭化成 SUNFORT ADP&DA：https://www.asahi-kasei.co.jp/sunfort/en/products/adp_da.html
16. 京瓷 FC-BGA：https://global.kyocera.com/prdct/organic/prdct/package/fcbga/std
17. 三星電機 FCBGA：https://www.samsungsem.com/global/product/substrate/package-substrate/fcbga.do
18. ipcb 防焊：https://www.ipcb.com/ic-substrate-tech/742.html
19. 表面處理：矽品 ENEPIG 論文（researchgate, Don Son Jiang）；TI spraa55 https://edgeworker.ti.com/lit/pdf/spraa55 ；IPC https://www.ipc.org/system/files/technical_resource/E15%26S13_02.pdf
20. ECTC 2023：https://conferences.computer.org/ectc/pdfs/ECTC2023-1NkkviSxgDnmPjptC1ysqm/349800a510/349800a510.pdf
21. 良率：Wing VC https://www.wing.vc/content/the-abf-substrate-bottleneck ；SemiEngineering https://semiengineering.com/addressing-yield-challenges-in-advanced-ic-substrate-aics-packaging
22. SEMI 名錄（真空壓膜機）：https://www.semi.org/en/node/165511?page=45
23. 敍豐濕製程：https://finance.technews.tw/2026/04/09/wet-process/
24. 專利（USPTO）：8877565（機械鑽孔成本、150 µm 限制）、9578755（塞孔磨平）、8298945（過度去膠渣）、6969674（3/2/3 FC-BGA）、7041531、8841209（prepreg 壓合）、8993378（FC-BGA 組裝）、12068300、12283570、11676942（CoWoS 疊構）；EPO：EP1194022、EP1672970（填料凹陷、氣泡）
25. 欣興：TVBS https://news.tvbs.com.tw/english/3135117 ；Taipei Times https://www.taipeitimes.com/News/biz/archives/2022/02/25/2003773714 ；Digitimes https://www.digitimes.com/news/a20240326PD224.html ；經濟日報 https://money.udn.com/money/story/5607/9259815
26. 南電：https://www.pocket.tw/school/articles/5703/ ；https://money.udn.com/money/amp/story/5607/9761399
27. 景碩：https://www.pocket.tw/school/articles/6374/ ；https://heise.de/-11174896
28. Ibiden：https://en.wikipedia.org/wiki/Ibiden ；https://the-shashi.com/en/tse/4062/ ；https://taipeitimes.com/News/biz/archives/2024/12/31/2003829378 ；https://business-standard.com/technology/tech-news/nvidia-supplier-ibiden-weighs-faster-expansion-to-meet-ai-demand-says-ceo-124123000069_1.html ；https://3dnews.ru/1116101/
29. 新光電氣：東證 https://www.jpx.co.jp/news/1023/20250520-11.html ；公司公告 https://www2.jpx.co.jp/disc/69670/140120250605582118.pdf ；DNP https://www.global.dnp/en/news/detail/2025/03/0319_20176512/ ；Digitimes https://apps.digitimes.com/news/a20250321PD206.html ；j-lic https://j-lic.com/companies/6967
30. 上一集查證：videos/tech-abf/research.md
