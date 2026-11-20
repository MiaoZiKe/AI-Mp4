# tech-clean 研究紀錄：清洗（科技透明圈，系列 1 第 9 支；接離子佈植，下一支氧化與熱處理）

查證截至 2026/11/20。狀態標籤：【確】已確定（原理、製程通則、專利與教科書寫明）｜【廠】廠商公布｜【媒】媒體報導（標誰報的）｜【估】研究機構估計｜【示】示意。
搜尋（WebSearch 11 組；三類來源：專利與百科／產業資料平台與市場研究／台灣媒體與公司）：
1. wafer cleaning RCA clean SC1 SC2 particles（Wikipedia RCA clean；USPTO 5695572、7674695、6627001）
2. 清洗 佔 半導體製程步驟 三成（只有專利背景，沒有可用數字）→ 3. wafer cleaning "30%" of process steps（MKS、Microchip Fabrication、SemiconductorX、USPTO 8828144、9117870）
4. high dose implant photoresist crust ashing popping（USPTO 8193096、9564344、8367555、6352936；HAL hal-01882454 Grenoble/ST）
5. megasonic 1 MHz acoustic streaming vs ultrasonic（USPTO 6006765、8310131；Wikipedia Megasonic cleaning）
6. IPA drying Marangoni watermark pattern collapse（USPTO 8303724、11069520；scientific.net SSP.346.111）
7. killer particle half of feature size（USPTO 10332741、7410814）
8. wafer cleaning equipment market share SCREEN Lam TEL SEMES（MarketsandMarkets、GMInsights、Verified Market Research、marketresearch.com 摘要）
9. SCREEN world's top share wafer cleaning（Japan Times 贊助特刊、SEMI 2025 Goeke 簡報、komachine）
10. SCREEN 中文名 迪恩士（台灣迪恩士半導體科技 公司介紹、經濟部商業司、technews 2025/07/28）
11. 辛耘 弘塑 濕製程 清洗設備 台積電（經濟日報 money.udn 9383236、聯合報 udn 9636530、科技新報 2022/08/20、MoneyWeekly、中時 wantrich）
12. SEMES Samsung cleaning（oled-info、SemiconductorX WFE Cleaning、DIGITIMES 2025/07/10）

## 原理（影片內容依據）
| # | 內容 | 狀態 | 來源 |
|---|---|---|---|
| 1 | 清洗步驟多：成熟製程（28 奈米以上）每片約 20–30 次清洗，7 奈米以下約 50 次以上；另有「清洗佔全部步驟 20%～40%」等說法（各來源不一致，片中只用「先進晶片 50 次以上」並標「業界整理」） | 【估】 | SemiconductorX 前段製程 Wafer Cleaning；MKS（30–40%）；Microchip Fabrication（約 20%） |
| 2 | 殺手顆粒：顆粒大約是線寬一半就可能造成缺陷（另有專利以 10%／20% 最小線寬當門檻）；片中只說「線寬一半大的顆粒，就可能讓線路短路」 | 【確】專利敘述／【示】 | USPTO 10332741；USPTO 7410814（SEMATECH 路線圖引述） |
| 3 | 高劑量佈植後，光阻表層被離子打成高度交聯、以碳為主的硬殼；殼的厚度跟劑量與能量有關 | 【確】 | USPTO 8193096、9564344、8367555 |
| 4 | 灰化＝用電漿（常見氧系，另有氫系 N2H2）把光阻燒成氣體；硬殼反應慢，要先在低溫（約 120°C 以下）去殼 | 【確】 | USPTO 9564344、8367555；HAL hal-01882454 |
| 5 | 爆裂（popping）：溫度一高，底下較軟的光阻放出氣體、壓力頂破硬殼，碎片變成顆粒與缺陷；殼穿了之後才能加溫加快 | 【確】 | USPTO 8367555、9564344 |
| 6 | 乾式去光阻之後再用濕式清洗去殘渣，常見硫酸加雙氧水（SPM），之後接 SC1 | 【確】 | HAL hal-01882454（SPM 5:1 80°C＋SC1）；USPTO 9564344 |
| 7 | 單晶圓旋轉清洗：晶圓在轉盤上旋轉、噴嘴供液，液體被甩向邊緣；現代清洗以單片機台為主（單片佔清洗設備需求七成以上為市場報告說法） | 【確】原理／【估】比例 | USPTO 8303724（從中心往外乾）；市場報告摘要（比例不上片） |
| 8 | 兆音波（megasonic）約 0.8–2 MHz（通常約 1 MHz），超音波約 20–200 kHz；兆音波主要靠聲流（acoustic streaming）讓邊界層變薄、把次微米顆粒推走，損傷比超音波小（是否有空蝕各來源說法不同，片中不提） | 【確】 | USPTO 6006765、8310131；Wikipedia Megasonic cleaning |
| 9 | RCA 清洗：SC1（氨水＋雙氧水＋水）去顆粒與有機物、SC2（鹽酸＋雙氧水＋水）去金屬，中間用超純水沖洗；在氧化、擴散、CVD 等高溫步驟前要做 | 【確】 | Wikipedia RCA clean；USPTO 5695572 |
| 10 | 乾燥：水直接甩乾會留水痕；液面經過細小圖形時表面張力會把線拉倒（圖形倒塌）；用異丙醇（IPA）換掉水，從中心往外乾（Marangoni 效應） | 【確】 | USPTO 8303724、11069520；scientific.net SSP.346.111 |
| 11 | 佈植後要加熱（退火）修復晶格、讓摻質進到晶格位置才導電 → 接下一支「氧化與熱處理」 | 【確】 | UW ECE528 Ch8（見 tech-implant research.md 第 11 列） |

## 誰在做（只列查到的）
| 公司 | 做什麼 | 狀態 | 來源 |
|---|---|---|---|
| 迪恩士（SCREEN Semiconductor Solutions，日本；台灣子公司「台灣迪恩士半導體科技」） | 單晶圓清洗機、濕式清洗槽；自稱清洗設備全球市佔第一（多份市場報告也列第一） | 【廠】【估】 | 台灣迪恩士公司介紹（東海大學徵才附件）；Japan Times 贊助特刊；SEMI 2025 Goeke 簡報（SU-3400 每小時最多 1,200 片） |
| 東京威力科創（TEL，日本） | 單晶圓清洗設備，主要供應商之一 | 【估】 | MarketsandMarkets、GMInsights 摘要 |
| 科林研發（Lam Research，美國） | 單晶圓清洗設備，主要供應商之一 | 【估】 | 同上；三家合計約佔清洗設備八成以上（舊資料，不上片） |
| SEMES（韓國，三星子公司） | 單片與批次濕式清洗，主要供三星 | 【媒】DIGITIMES／分析 | SemiconductorX；DIGITIMES 2025/07/10（片中不念，因中文名查不到正式譯名） |
| 辛耘（台灣，3583） | 自製批次濕式清洗槽（Wet Bench）、單晶圓旋轉清洗機，主要供先進封裝；另有代理設備與再生晶圓 | 【媒】經濟日報、聯合報 | money.udn 9383236、udn 9636530 |
| 弘塑（台灣，3131） | 濕式清洗槽、單晶圓旋轉清洗機；台積電先進封裝濕製程的主要國產供應商之一 | 【媒】科技新報、經濟日報 | technews 2022/08/20、money.udn 9383236 |

注意：辛耘、弘塑的設備主要用在先進封裝（CoWoS、SoIC），不是前段最先進製程的清洗主力；片中寫「台灣辛耘、弘塑做先進封裝的濕製程」，不寫市佔。

## 數字（片中出現的）
- 50 次以上（SemiconductorX，7 奈米以下；標「業界整理」）
- 約 1 MHz／每秒約一百萬次（專利與百科一致）
- 線寬一半（專利敘述）
- 幾十奈米（線寬量級，示意）

## 沒放進片裡、但文章可以寫的
- 清洗佔超純水用量約三成（SemiconductorX，是用水比例不是步驟比例）。
- 單片清洗機產能：SCREEN SU-3400 每小時最多 1,200 片（廠商簡報）。
- 熱 IPA（60–82°C）可減少圖形倒塌與 IPA 用量（專利申請案）。
- 灰化另有氫系（N2H2）電漿，對矽的損耗較小（HAL 論文）。
