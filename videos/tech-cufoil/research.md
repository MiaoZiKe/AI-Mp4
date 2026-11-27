# PCB-2：銅箔與玻纖布：查證紀錄（系列 3 第 12 集，科技透明圈）

查證日：2026-11-27。信心：高＝官方或兩個獨立來源一致；中＝單一媒體／公司自述／專利／通識；低＝推論或口徑不明；查不到＝如實標示。
**不上片的數字**：各家營收、毛利、市占、產能噸數、漲價幅度、券商目標價、Dk／Df 實際數值、粗糙度 Rz 數值（測法與頻率不同不可比）。念稿 0 個數字。
分工：3-11（tech-ccl）已講銅箔基板是「玻纖布浸樹脂＋兩面銅箔熱壓」、低損耗樹脂與台光電、聯茂、台燿；比喻用過夾心餅乾、紗窗、紙巾吸醬汁、泥巴路／跑道，**本集不重複**。本集只講兩種原料本身怎麼做、AI 伺服器為什麼要升級：電解銅箔（滾筒電鍍、光面／粗面、粗化處理、低粗糙度）與玻纖布（拉絲、捻紗、織布、開纖、低介電玻璃）。
前一集 3-11 末段（定案＝tech-ccl/script.md 存檔版）：「布要多平、銅要多光滑？下一集看銅箔與玻纖布」；本集開場沿用同一個問句。下一集 3-13：伺服器主機板。

## 1. 銅箔（念稿依據）
| 內容 | 來源 | 信心 |
|---|---|---|
| 電解銅箔：硫酸銅電解液中，鈦製陰極滾筒（drum）轉動，銅電鍍到滾筒表面，連續剝離捲收；厚度主要由滾筒轉速與電流密度控制 | [1] De Nora「ED Copper Foil Manufacturing Key Processes」；US4240894、US6036826（鈦電鍍滾筒專利）；Total Materia「Copper foil manufacturing」 | 高 |
| 貼滾筒那面＝光面（shiny side，複製滾筒的鏡面）；另一面＝粗面（matte side，較粗，粗糙度受電流密度與添加劑影響） | [2] EP1308539、CA 2230256、US20030116241 | 高 |
| 後處理：粗面做「瘤化／粗化」（nodule），長出小銅瘤，靠錨定效應咬住樹脂；再做阻隔層、防鏽、矽烷偶聯 | [2] EP1308539；[3] Circuit World「Drum Side Treated Foil」（反轉處理 RTF：處理光面） | 高 |
| 集膚效應：頻率越高，電流越集中在導體表面（約 1 GHz 時 2.1 µm、10 GHz 時 0.7 µm）；表面粗糙度與集膚深度同量級時，路徑變長、散射，插入損耗增加，高頻時可達平滑銅的兩倍以上 | [4] Rogers「Choosing Copper Foils for High Frequency PCBs」、Altium、Signal Integrity Journal（Bogatin） | 高 → 念稿「訊號大多擠在銅表面走，表面越粗路越彎」（示意，不上數字） |
| 低粗糙度等級：LP、VLP、HVLP（hyper very low profile），業界再細分 HVLP1～HVLP5；越平損耗越低但越難黏牢（粗糙度與附著力互相拉扯） | [5] IPC 技術論文 E5&S24_01（Circuit Foil）；US10765010、US10772199 專利；TechNews 1457474 | 高 → 念稿「做得更平又要黏得牢，這最難」 |

## 2. 玻纖布（念稿依據）
| 內容 | 來源 | 信心 |
|---|---|---|
| 製程：玻璃原料熔融 → 由白金漏板（bushing）拉成細絲 → 上漿、多根合股成紗並加捻 → 經紗整經、織機以平紋（一經一緯）織成布 → 退漿、表面處理 | [6] Isola「Understanding Laminate Prepreg Manufacturing」、Intel「Fiberglass Weave Composition」、TrendForce 2025/11/24「What is glass fiber fabric」 | 中高（流程通識＋業界文件；拉絲細節未逐項查原廠） |
| 布型：1078、1080、2116、7628 等；電子級皆平紋（IPC-4412／4413） | [7] IPC-4412C、IPC-4413 目錄；Isola glass fabric 文件 | 高 |
| 玻纖效應（fiber weave effect）：玻璃（E-glass Dk 約 6.6）與樹脂介電常數差很多；線路剛好走在紗束上或空隙上，訊號速度不同，差動對兩條線對不齊（skew） | [8] Isola「Developments in Glass Yarns and Fabric Constructions」、PCD&F「Advanced Glass Reinforcement Technology」、Intel 疊構指南 | 高 → 念稿「紗和空隙讓訊號快慢不一，一對訊號就對不齊」 |
| 開纖（spread glass）：把紗攤平成扁帶狀，空隙變小、玻璃分布更均勻；Intel 建議超高速收發器板用開纖布 | [8] 同上；Intel | 高 → 念稿「把紗攤平，像把辮子梳開」 |
| 低介電玻璃（Low Dk，如 NE-glass）：鹼土金屬少、氧化硼多，Dk、Df 都比 E-glass 低（NE 型約 4.4–4.6 @10 GHz）；與樹脂差距縮小、損耗更低。另有 Low CTE（T-glass，日東紡）給載板，石英布（Q-glass）更低 | [9] 專利 US11191158、US6846761；日東紡產品頁；TrendForce 2025/11/24 | 中高 → 念稿「換低介電玻璃，訊號更快、損耗更少」（不上數字） |

## 3. 公司（逐一查證；念稿只放 3 家）
| 公司 | 代號 | 查證結果 | 來源 | 信心 |
|---|---|---|---|---|
| **金居** | 8358 | 電解銅箔廠，主攻伺服器用 RG、HVLP 銅箔；HVLP4 二廠新產線 2026 年開出、三廠 2026 Q4 起逐季開出（公司說法） | [10] TechNews 1457474；中時 wantrich 20260214900080、20260304900410；工商 20251125700919 | 中高（公司法說＋多家媒體）；念稿「金居做低粗糙度銅箔」「都在擴產」 |
| **台玻** | 1802 | 電子級玻纖布；2018 完成一代 Low DK、2023 二代 Low DK 與 Low CTE；高階玻纖布產線擴增（媒體：4 條增至 12 條）、股東會通過第三期投資 | [11] udn 7252/9152772（法說會）、udn 7255/9580592、工商 20260612701148 | 中高；念稿「台玻做低介電玻纖布」 |
| **富喬** | 1815 | 玻纖紗、玻纖布垂直整合；Low DK1／DK2、Low CTE 特殊規格占營收過半（媒體）；石英布客戶認證中；泰國新廠 | [12] udn 5607/9860616、5607/9833567；工商 20260122700245 | 中（媒體）；念稿「富喬做低介電玻纖布」 |
| 南亞、長春 | 1303／未上市 | 南亞兼做銅箔與玻纖布、長春為大型銅箔廠 | 通識＋媒體 | 中；**念稿不放**（3 家上限） |
| 日東紡（日本） | — | 高階玻纖布與 T-glass 主要供應商（媒體：高階電子級市占過半） | [11]、TrendForce | 中；不放 |
**不要寫**：市占、產能噸數、漲價幅度、券商目標價、「缺貨到某年」、任何客戶名。念稿只說各家做什麼、都在擴產（公司公開說法）。

## 4. 比喻清單（對應物理動作）
| 比喻 | 幕 | 對應物理動作 | 風險 |
|---|---|---|---|
| 像煎潤餅皮 | s2 | 銅在轉動滾筒表面長成一層薄皮，連續撕下捲起 | 輕微：潤餅皮靠加熱、銅箔靠電鍍；畫面標「電鍍」 |
| 像魔鬼氈 | s3 | 粗面的小銅瘤咬進樹脂（錨定效應） | 不會 |
| 像在洗衣板跑步 | s4 | 集膚效應下，訊號沿粗糙表面走，路徑變長、損耗變大 | 輕微：實際還有散射；畫面標「示意」 |
| 像編竹蓆 | s6 | 平紋一經一緯交錯 | 不會 |
| 像把辮子梳開 | s8 | 開纖：圓紗束攤成扁帶，空隙變小 | 不會 |

## 5. 分類（上片守則）
- **已確定**：電解銅箔用滾筒電鍍、光面與粗面、粗化處理；高頻集膚效應與粗糙度造成損耗；玻纖布平紋織造、玻纖效應、開纖布與低介電玻璃的用途；三家公司的產品線。
- **公司說法**：各家擴產時程（金居二廠、三廠；台玻產線擴增與第三期；富喬泰國廠）。念稿只說「都在擴產」。
- **不上片**：數字、市占、價格、客戶。

## 來源
[1] https://denora.com/en/newsroom/learn-with-us/electrodeposited-ed-copper-foil-manufacturing-key-processes ；https://patents.google.com/patent/US4240894 ；https://patents.google.com/patent/US6036826 ；https://www.totalmateria.com/articles/copper-foil-manufacturing
[2] https://data.epo.org/publication-server/rest/v1.2/patents/EP1308539NWA1/document.pdf ；https://brevets-patents.ic.gc.ca/opic-cipo/cpd/eng/patent/2230256/summary.html ；https://uspto.report/patent/app/20030116241
[3] https://emeraldinsight.com/insight/content/doi/10.1108/03056129610799886/full/html
[4] https://rogerscorp.com/-/media/project/rogerscorp/documents/articles/english/advanced-connectivity-solutions/choosing-copper-foils-for-high-frequency-pcbs.pdf ；https://resources.altium.com/p/how-copper-foil-roughness-affects-your-signals-and-impedance ；https://signalintegrityjournal.com/blogs/4-eric-bogatin-signal-integrity-journal-technical-editor/post/1588-the-quest-for-smoother-copper-may-have-reached-its-limit
[5] https://www.ipc.org/system/files/technical_resource/E5%26S24_01.pdf ；https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10765010 ；https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10772199 ；https://technews.tw/?p=1457474
[6] https://www.isola-group.com/wp-content/uploads/Understanding-Laminate-Prepreg-Manufacturing.pdf ；https://intel.com/content/www/us/en/docs/programmable/683883/current/fiberglass-weave-composition.html ；https://www.trendforce.com/news/2025/11/24/news-what-is-glass-fiber-fabric-and-why-is-t-glass-critical-for-ai-servers/
[7] https://www.ipc.org/TOC/IPC-4412C_TOC.pdf ；https://www.ipc.org/TOC/IPC-4413_TOC.pdf ；https://www.isola-group.com/wp-content/uploads/Isola-Glass-Fabric-04_2022.pdf
[8] https://www.isola-group.com/wp-content/uploads/Developments-in-Glass-Yarns-and-Fabric-Constructions.pdf ；https://www.pcdandf.com/pcdesign/index.php/articles-by-subject/210-signal-integrity/3378-advanced-glass-reinforcement-technology-for-improved-signal-integrity ；https://www.electronics.org/system/files/technical_resource/E12%26S09_03.pdf
[9] https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11191158 ；https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/6846761 ；https://pr.mono.ipros.com/en/nittobo/product/detail/2001553211
[10] https://technews.tw/?p=1457474 ；https://wantrich.chinatimes.com/news/20260214900080-420101 ；https://wantrich.chinatimes.com/news/20260304900410-420101 ；https://www.ctee.com.tw/news/20251125700919-430503
[11] https://udn.com/news/story/7252/9152772 ；https://udn.com/news/story/7255/9580592 ；https://www.ctee.com.tw/news/20260612701148-430503
[12] https://money.udn.com/money/story/5607/9860616 ；https://money.udn.com/money/amp/story/5607/9833567 ；https://www.ctee.com.tw/news/20260122700245-430502
