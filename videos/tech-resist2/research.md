# tech-resist2 研究紀錄：光阻-2：塗上去、洗出來的機器（科技透明圈，系列「代工的供應商」第 6 集；上一集光阻-1：光阻是什麼；下一集設備五大-1：ASML）

查證截至 2026/11/23（WebSearch，台北時間 2026/11/24 凌晨）。發布：12/8（二）20:00。
狀態標籤：【確】已確定（原理、教科書、專利、設備使用手冊寫明）｜【廠】公司說法（公司自己公布、未經第三方證實）｜【媒】媒體／研究機構報導（標誰報的）｜【示】示意。
規則：市占要兩個獨立來源對得上才寫數字；只有公司自己講的，畫面標「公司說法」。不給投資建議、不寫「非投資建議」。

## 一、這是什麼、負責哪一步
塗佈顯影機（coater/developer，業界叫 track，「軌道機」）：黃光區裡跟曝光機連在一起的機台。晶圓進曝光機「之前」在它裡面塗光阻、烤乾；從曝光機「出來之後」又回到它裡面烤一次、顯影、沖洗、甩乾。曝光機負責「照」，塗佈顯影機負責「塗上去、洗出來」。

## 二、機台裡做什麼（影片內容依據）
| # | 內容 | 狀態 | 來源（查詢日 2026/11/23） |
|---|---|---|---|
| 1 | 旋轉塗佈：光阻（溶在溶劑裡）滴在晶圓上，晶圓高速旋轉，離心力把光阻往外甩開、多的從邊緣甩掉，留下均勻薄膜；「光阻滴在旋轉中的晶圓上」是塗佈軌道機的標準做法 | 【確】 | USPTO 8465901 等（"spin coating the photoresist in solvent using a coating track, in which the photoresist is dispensed on a spinning wafer"）；BYU Cleanroom〈Photolithography Chemicals and Materials〉 |
| 2 | 厚度靠轉速：膜厚大約跟「轉速的平方根」成反比，轉越快越薄（例：AZ 4533 在 2000／4000／6000 rpm 約 4.0／3.3／2.3 µm）；黏度、轉的時間也會影響，實務上用廠商的轉速曲線 | 【確】 | LBL〈Spin coating photoresist〉（"thickness approximately decreases with the reciprocal square-root of the spin speed"）；USPTO 6327793（平均厚度與轉速平方根成反比）；DTU Nanolab〈Spin coating〉（轉速曲線） |
| 3 | 極紫外光（EUV）光阻很薄：專利與論文的例子是約 40 nm（另一例 38 nm）；圖形越細、膜要越薄以免圖形倒塌 | 【確】 | USPTO 8614047、9810983（40 nm 膜、旋塗、PAB、EUV 曝光、PEB）；Univ. of Birmingham SPIE 2025 論文（38 nm 膜、線寬 18.4 nm）。片中只說「幾十奈米」 |
| 4 | 軟烤（塗佈後烘烤，soft bake／PAB）：約 90～150°C、30～90 秒，把溶劑趕走；烤完厚度會再少一些 | 【確】 | USPTO 9298093（90–150°C、30–90 s）；UW EE 527 講義（軟烤後膜厚約減 25%，指一般光阻）。片中不念溫度 |
| 5 | 曝光後烘烤（PEB）：約 80～150°C、30～120 秒，在加熱板上進行；化學放大型光阻要靠這一步讓曝光產生的酸繼續反應，圖案才完整 | 【確】 | USPTO 9298093（PEB 80–150°C、30–120 s，加熱板）；USPTO 8614047（EUV 例 PEB 110–120°C、60 s） |
| 6 | 顯影：常用 2.38% 的四甲基氫氧化銨（TMAH）鹼性顯影液，在晶圓上形成一層靜止的液膜（puddle）溶掉曝光過的正型光阻，室溫、數秒到數十秒；之後純水沖洗、旋轉甩乾 | 【確】 | USPTO 10281822（TMAH 2.38 wt%）；Semiconductor Digest〈An efficient low-defectivity process for 193nm resist development〉（2.38% TMAH、static puddle）；USPTO 9583344（顯影室溫 5–30 s） |
| 7 | 硬烤（顯影後烘烤）：顯影後再烤一次讓圖形更耐後面的蝕刻；部分製程會省略 | 【確】 | UW EE 527 講義（流程：塗佈→軟烤→曝光→PEB→顯影→硬烤）。片中只說「烤硬」 |
| 8 | 塗佈顯影機與曝光機連線（inline）：塗佈顯影機有「載入端（放晶圓盒）／製程區（各模組）／曝光機介面區」三段，介面區的手臂把晶圓送進曝光機、再拿回來做 PEB 與顯影 | 【確】 | USPTO 6770424（cassette end／process section／scanner interface section 三段）；EPFL CMi〈TEL Clean Track ACT-8〉（ACT8 與 ASML 曝光機 in-line，介面手臂進出曝光機的晶圓傳送系統）；USPTO 7728953（塗佈→介面→曝光→回到軌道機 PEB→顯影） |
| 9 | 為什麼要連在一起：化學放大型光阻曝光後產生的酸，會被空氣裡微量的鹼性物質（胺類）中和；曝光到 PEB 之間等越久，被中和越多，表面形成不溶層，圖形頂端變成 T 字形（T-top）→ 所以曝光完要馬上烤，不能放 | 【確】 | USPTO 6743564、6749988（延長曝光到 PEB 的時間、表面酸被空氣中的鹼性物質失活、形成 T-top）；USPTO 7468236（胺類污染）。片中說「曝光後的光阻怕等，放久了圖案會走樣」 |
| 10 | 機台裡晶圓由中央機械手臂在各模組（塗佈杯、加熱板、冷卻板、顯影杯）之間搬運 | 【確】 | USPTO 6770424、EPFL CMi 設備頁。片中模組數與排列是示意（真機多層堆疊） |

## 三、誰在做
| # | 內容 | 狀態 | 來源 |
|---|---|---|---|
| 11 | 東京威力科創（TEL）：EUV 用的塗佈顯影機在量產市場 100%（2020/9 公司新聞稿）；2025、2026 年 SEMICON Taiwan 期間對媒體再說「EUV 塗佈顯影在特定市場市占 100%」 | 【廠】公司說法 | Digitimes 2020/9/29 TEL 新聞稿（"100% market share of Coater/Developer for EUV in high volume manufacturing"）；Yahoo 股市〈全球唯一擁四大連續製程設備 EUV 出貨商機 TEL 成大贏家〉（2026/9，週報 2026-11-23 第七節線索）；財報狗 SEMICON 報導（同一說法）。**畫面標「公司說法」** |
| 12 | 整體塗佈顯影機市占：The Information Network 估 2025 年全球光阻軌道設備營收約 37.8 億美元、TEL 86.6%；TEL 自己估 2025 年 91% → 兩份都在八成五以上，片中不念，卡片寫「整體八成五以上（兩份估計）」 | 【媒】＋【廠】 | The Information Network（247 Wall St. 2026/10/22 轉述 87%）；Shared Research TEL 報告（公司數字 91%） |
| 13 | TEL 產品：CLEAN TRACK LITHIUS Pro Z（300 mm、10 奈米以下世代，與 ASML EUV 搭配）；2025/12 發表 LITHIUS Pro DICE（支援 EUV 與 DUV） | 【廠】 | TEL 產品頁（environmental-expert 轉載）；SemiAnalysis〈Lam Research, Tokyo Electron, JSR battle〉。片中不念型號、不放商標 |
| 14 | 其他供應商：日本 SCREEN（迪恩士）是另一家主要的塗佈顯影機廠，兩家日商合計約八成八（單一來源，不寫數字）；另有韓國 SEMES、中國芯源微等 | 【媒】 | Envisioning〈Japan semiconductor coating equipment〉（TEL＋SCREEN 88%）；CREX〈equipment makers〉（日商雙寡占、TEL 第一 SCREEN 其次）；MarketResearch 摘要（列 SEMES、Kingsemi）。卡片只寫「SCREEN（日本）」，不寫市占 |

## 四、台灣相關（只寫查得到的）
| # | 內容 | 狀態 | 來源 |
|---|---|---|---|
| 15 | TEL 台南營運中心 2024/12/3 在南科開幕：六層樓、約 35,000 平方公尺、投資約新台幣 21 億元，內設維修中心，縮短客戶等待維修品的時間 | 【媒】（公司記者會） | 科技新報 2024/12/3〈TEL 台南營運中心開幕〉；數位時代〈tel-tainan-operation-center-open〉 |
| 16 | 2022 年動土時公司表示，台南中心要聚焦在地零組件加工、技術與維修 | 【廠】 | 1111 新聞〈東京威力科創台南營運中心開工動土 預計 2024 年完工〉 |
| 17 | 「與台灣超過 80 家供應商合作」只有一篇 SEMICON 報導（財報狗），**片中不念數字** | 【廠】單一來源 | 財報狗 news/17574 |
| 18 | 台灣個別廠商供應塗佈顯影機零組件：京鼎、帆宣被列為「美系設備大廠」協力商，**查不到跟 TEL 塗佈顯影機直接相關的公開來源 → 不寫** | — | 財報狗產業報告（不採用） |

## 五、片中數字（≤5）
1. 幾十奈米（EUV 光阻膜厚，第 3 列）
2. 轉越快越薄（第 2 列，不念公式）
3. EUV 用的幾乎都是 TEL（公司說法，第 11 列）
4. 台南維修中心（第 15 列）
（沒用到的：PEB 溫度、2.38%、21 億元 → 卡片小字或不放）

## 六、沒查到、不寫的
- SCREEN 個別市占（各家數字不一、多為付費報告）。
- 台灣廠商直接供應 TEL 塗佈顯影機的零組件名單。
- 「四大連續製程設備」的定義（Yahoo 標題用語，無第二來源）。

## 來源網址（查詢日 2026/11/23）
- Digitimes TEL 新聞稿 2020/9/29：https://digitimes.com/news/a20200929PR200.html
- Yahoo 股市（TEL EUV 塗佈顯影 100%）：https://tw.stock.yahoo.com/news/%E5%85%A8%E7%90%83%E5%94%AF-%E6%93%81%E5%9B%9B%E5%A4%A7%E9%80%A3%E7%BA%8C%E8%A3%BD%E7%A8%8B%E8%A8%AD%E5%82%99-euv%E5%87%BA%E8%B2%A8%E5%95%86%E6%A9%9F-tel%E6%88%90%E5%A4%A7%E8%B4%8F%E5%AE%B6-201000971.html
- 財報狗 SEMICON 報導：https://statementdog.com/news/17574
- TrendForce 2024/6/28：https://www.trendforce.com/news/2024/06/28/news-japanese-equipment-giant-tel-emerges-as-major-winner-as-euv-orders-surge/
- 247 Wall St. 2026/10/22：https://247wallst.com/investing/2026/10/22/tokyo-electron-ltd-controls-87-of-this-semiconductor-equipment-market-can-smaller-rivals-break-in/
- Shared Research TEL：https://sharedresearch.jp/en/companies/8035/report/694cef3d05f04596c2a90b52
- Envisioning：https://www.envisioning.com/research/substrate/japan__semiconductor-coating-equipment
- CREX：https://www.crex-data.com/industry/machinery/semiconductor-equipment/equipment-makers
- SemiAnalysis：https://www.semianalysis.com/p/lam-research-tokyo-electron-jsr-battle
- EPFL CMi TEL ACT-8：https://www.epfl.ch/research/facilities/cmi/equipment/photolithography/tel-cleantrack-act-8/
- LBL 旋塗講義：https://www-eng.lbl.gov/~shuman/XENON/MATERIALS&COMPONENTS/spincoating/spin_coating_photoresist.pdf
- DTU Nanolab 旋塗：https://labadviser.nanolab.dtu.dk/images/a/ac/Litho_Tool_Package_-_2_Spin_coating_v8_LESJO_%28TARAN_ed%29.pdf
- UW EE 527：https://faculty.washington.edu/tcchen/EE527Wi/Notes/EE%20527%2002-10%202014.pdf
- Semiconductor Digest（193nm 顯影）：https://sst.semiconductor-digest.com/issue/?id=16639
- Univ. of Birmingham SPIE 2025：https://pure-oai.bham.ac.uk/ws/files/266703959/SPIE_2025_v2.pdf
- USPTO 6327793、6770424、6743564、7728953、8465901、8614047、9298093、9583344、10281822（image-ppubs.uspto.gov）
- 科技新報 2024/12/3：https://technews.tw/2024/12/03/tel-tainan/
- 數位時代：https://www.bnext.com.tw/article/81540/tel-tainan-operation-center-open
- 1111 新聞：https://www.1111.com.tw/news/jobns/148793
