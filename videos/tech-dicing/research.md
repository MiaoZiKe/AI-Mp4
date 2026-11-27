# 晶圓切割與薄化（併背面研磨、TSV）：查證紀錄（系列 3 第 1 集，科技透明圈，約 80 秒）

查證日：2026-11-27。信心：高＝官方或兩個獨立來源一致；中＝單一媒體／公司自述／專利；低＝推論；查不到＝如實標示。

**查證方式說明**：本次以網路搜尋取得各頁摘要；`disco.co.jp` 在這個雲端環境無法直接開啟全文（網路白名單外），DISCO 官方頁的內容是從搜尋引擎對該頁的摘要取得，網址照列。上片前若要逐字引用 DISCO 原文，需開放 disco.co.jp 再核一次。

**不上片的數字**：DISCO 市占（80%／70–80%／78%／50%／26.6% 口徑全不一）、東京精密市占（8–9% 為推算）、HBM 封裝高度 720→775 µm 屬於哪一代（兩來源衝突）、16 層 HBM 約 30 µm（分析預期）、昇陽半產能數字、精材台積電持股比例（三成／四成／41% 不一）、鈦昇安裝量 2,500 部（投資媒體單一來源）、切割道寬度（80／70–100／約 100 µm 各說各的）。

---

## 1. 切割（dicing）

### 1-1 刀片切割（blade dicing）
| 內容 | 來源 | 信心 |
|---|---|---|
| 刀片是把鑽石顆粒固定在結合劑裡；常見結合劑有樹脂（resin）、電鑄鎳（electroformed nickel）、金屬；選哪種看被切材料 | DISCO 刀片產品頁 disco.co.jp/eg/products/blade/z05.html、p1a.html、a1ak1a.html；EPFL CMi DAD321 頁 epfl.ch/research/facilities/cmi/equipment/packaging-miscellaneous/disco-dad321；Asahi Diamond 刀片說明 mfc.engineering.arizona.edu/…/asahi_blade_information.pdf | 高 |
| 刀片厚度：窄切割道（50–76 µm）建議用 20–30 µm 厚刀片；DISCO ZHZZ 系列可切出約 10 µm 刀痕（DISCO 稱「相較一般 20–40 µm 刀片極薄」）；電鑄鎳刀片可薄到約 15 µm；可用刀片範圍 15–500 µm | DISCO disco.co.jp/eg/products/blade/zhzz.html；Semiconductor Digest sst.semiconductor-digest.com/?p=34110；integra-tech.com/faq/march-2025-dicing-die-prep；Asahi 刀片說明 | 高（「幾十微米」量級）／中（單一型號 10 µm） |
| 主軸轉速：DISCO DAD3350 標準 1.8 kW 主軸 6,000–60,000 min⁻¹（每分鐘轉數）；大學無塵室切矽常用 30,000–60,000 rpm | DISCO 官方 disco.co.jp/eg/products/dicer/dad3350.html；USC Nanofab wiki.nanofab.usc.edu/index.php/Dicing_Saw | 高 |
| 切割時要噴去離子水：冷卻刀片、沖掉碎屑保持晶片表面乾淨；噴嘴角度與水壓不對會造成崩邊 | USC Nanofab wiki（Coolant DI water required）；SEIPI 論文 seipi.org.ph/…/DEVELOPMENT-AND-CHALLENGES-OF-HIGH-FEED-SPEED.pdf；UCSB ADT Troubleshooting wiki.nanofab.ucsb.edu/w/images/6/6b/ADT-Troubleshooting.pdf | 高 |
| 切割道（street／scribe line）：晶片之間預留給刀走的窄道；寬度說法不一（約 80 µm、70–100 µm 以上、約 100 µm） | integra-tech FAQ；Wikipedia Die preparation；Semiconductor Digest | 高（有這條道）／**寬度不上片** |
| 刀痕寬（kerf）約等於或略大於刀片厚度；刀片切割的刀痕一般幾十到上百微米 | Semiconductor Digest；nanoFAB（U of Alberta）nanofab.ualberta.ca/stealth-dicing-now-at-the-nanofab/ | 高 |
| 切割前晶圓背面貼在切割膠膜（dicing tape）上、膠膜繃在金屬框架（frame）上；刀只切到膠膜一點點（SOP：至少切進膠膜 0.001 英吋），晶片切完仍黏在膠膜上 | UCSB ADT SOP、Notre Dame DAD3240 使用說明 nanofabrication.nd.edu/assets/526708/dad3240_dicing_saw_user_instructions.pdf；Utah DAD3220 SOP | 高 |
| UV 膠膜：切完照紫外線讓膠變弱，晶片好取下；薄晶圓（≤80 µm）要用照後黏著力更低的膠膜 | USPTO 8609515、8114759；Ultron 膠膜規格 mfc.arizona.edu/…/dicing_tape_ultron.pdf | 中高（專利＋廠商資料） |
| 缺點：崩邊（chipping）。晶圓越薄背面崩邊越多；DISCO 建議改細顆粒刀片（#4800）或分兩刀切（step cut）；刀片磨耗不均也會增加崩邊 | DISCO 應用例 disco.co.jp/eg/solution/library/dicing/dicing_thin.html | 高（官方） |
| 刀片經過脆性矽材會在切邊留下微裂紋與缺口，邊緣損傷越大晶片越不耐力；薄晶圓用刀切應力大、晶片強度低 | USPTO 6271102、6915795；USPTO 7776720 | 中（專利語句，方向一致） |
| 矽的崩邊方向和晶格方向有關（30°／60°／90°／不規則四型） | Luo & Wang, Int J Adv Manuf Technol（link.springer.com/article/10.1007/s00170-006-0800-3） | 中（不上片，背景） |

### 1-2 雷射隱形切割（stealth dicing，SD）
| 內容 | 來源 | 信心 |
|---|---|---|
| 原理：用矽「透得過」的波長雷射，聚焦在晶圓**內部**，焦點附近能量超過門檻，在裡面形成一條改質層（Hamamatsu 稱 SD layer），裂紋從這層往上下長；之後把膠膜往外均勻撐開（tape expansion），拉力讓裂紋延伸到表面、晶片分開 | Hamamatsu 官方 hamamatsu.com/jp/en/product/lasers/laser-related-products/stealth-dicing-technology.html；DISCO 官方 disco.co.jp/eg/solution/library/laser/stealth.html | 高（兩家官方一致） |
| 兩步驟：雷射照射 → 擴片（expansion）；厚晶圓（如 MEMS）要在不同深度打多層 SD 層再接起來 | Hamamatsu 官方 | 高 |
| 雷射波長：矽對 >1000 nm 的紅外光透明；常用 1064 nm、1080 nm（光纖雷射）或 1342 nm；短波長會被矽表面吸收 | USPTO 9147624、8785234（專利）；photonics.com/Article.aspx?AID=31907 | 中高 |
| 優點（廠商說法）：乾式、不用清洗、基本上沒有刀痕損失（kerf loss）、不崩邊，表面背面不受影響；切割道可做窄 → 一片晶圓排更多晶片 | Hamamatsu 官方；DISCO 官方；nanoFAB（「近乎零」刀痕）；Nanotech 2008 MEMS 論文 briefs.techconnect.org/…/1356.pdf（乾式、不接觸、減少微粒） | 高（乾式、改質層、擴片）／中（「零刀痕」是廠商用語，片中說「幾乎沒有」） |
| 技術歸屬：Hamamatsu 持有基礎專利，DISCO 取得授權做雷射切割機（DFL 系列） | Hamamatsu 專利資訊頁 hamamatsu.com/jp/en/product/lasers/laser-related-products/stealth-dicing-technology/patent-information.html；DISCO TR16-04 技術報告 | 中高 |
| 擴片機：DISCO DDS 系列 die separator；DDS2300 用「冷擴片」（0 或 −5 °C 讓 DAF 黏晶膜變脆好斷），擴完用熱風（200–250 °C）收緊鬆掉的膠膜 | DISCO 官方 disco.co.jp/eg/products/separator/dds2300.html | 高（官方規格；溫度不上片） |
| 背面金屬層會反射雷射，影響 SD | USPTO 9147624 | 中 |

### 1-3 雷射開槽（laser grooving／ablation）＋刀切
| 內容 | 來源 | 信心 |
|---|---|---|
| 高速邏輯晶片用的 low-k 絕緣膜機械強度低，直接刀切容易剝離；DISCO 做法是先用雷射在切割道上燒出兩條槽（π 型或 ω 型），再用刀片以一般速度切斷 | DISCO 官方 disco.co.jp/eg/solution/library/laser/low_k.html（DFL7161） | 高（官方） |
| 用短脈衝紫外雷射讓材料汽化，汽化帶走熱，減少熱傳到周圍 | 同上 | 中（廠商說法） |
| 業界論文稱「先雷射開槽再刀切」是目前的參考製程；缺點是熱影響、殘渣、需要較寬切割道 | IEEE ieeexplore.ieee.org/document/8429805；engrxiv 預印本 | 中高 |

### 1-4 為什麼不能用一般鋸子（白話理由與依據）
| 白話理由 | 依據 | 信心 |
|---|---|---|
| 矽像玻璃一樣**又硬又脆**，一般鋸子是「撕扯」材料，會讓矽崩裂；刀片經過脆性材料就會留下微裂紋和缺口 | USPTO 6271102（brittle semiconductor material, microcracks and scallops） | 中（專利） |
| 晶片之間的走道只有幾十到一百微米左右（比頭髮細），刀本身要薄到二三十微米、位置要準到微米級，所以要用攝影機對位 | Semiconductor Digest（20–30 µm 刀片配 50–76 µm 道）；DAD3220 型錄（攝影機自動對位） | 高（量級）；具體寬度不上片 |
| 切的時候會發熱和震動，熱與震動會傷晶片、讓邊緣崩掉，所以要邊切邊噴水 | USC Nanofab；SEIPI 論文；DISCO dicing_thin 頁 | 高 |
| 碎屑（矽粉）會汙染晶片表面，水要一直沖 | SEIPI 論文（water keeps die surface clean） | 中高 |
| 晶圓越薄越容易裂，所以薄片要換方法（細刀、分段切、雷射隱形切割、先切後磨） | DISCO dicing_thin 頁；USPTO 7776720 | 高 |
| 註：「一般鋸子」本身沒有文獻直接比較；上面是把「為什麼要鑽石刀片＋高轉速＋噴水＋對位」的依據轉成白話，片中說法用「矽又硬又脆」「縫只有幾十微米」即可，不要說「一般鋸子會讓晶片爆炸」這類誇大 | — | 低（推論的白話化） |

### 1-5 DBG／SDBG（先切再磨）
| 內容 | 來源 | 信心 |
|---|---|---|
| DBG（Dicing Before Grinding）：先用刀從正面切一半深度（half-cut），再從背面研磨，磨到切口以下晶片自然分開；可減少背面崩邊與薄化時破片 | DISCO 官方 disco.co.jp/eg/solution/library/dbg/dbg_process.html；Wikipedia Wafer dicing | 高 |
| SDBG：先做隱形切割（內部改質層），再研磨；改質層在研磨時被磨掉，所以晶片薄又強；DISCO 稱可減少正反面崩邊 | DISCO 官方 disco.co.jp/eg/solution/library/dbg/sdbg.html；Hamamatsu 官方（SDBG 同說法） | 高（兩家官方一致） |
| 2023 年論文比較刀片／隱形／電漿三種 DBG（10 mm 方形晶片）：刀片半切頂緣崩邊嚴重，SDBG 頂緣未觀察到崩邊與汙染 | Micro and Nano Systems Letters, link.springer.com/article/10.1186/s40486-023-00183-w | 中高（獨立論文） |

---

## 2. 薄化／背面研磨（backgrinding）

### 2-1 厚度
| 內容 | 來源 | 信心 |
|---|---|---|
| 300 mm 晶圓標準厚度 775 µm（約 0.775 mm）；公差說法有 ±20 µm（引 SEMI）與 ±25 µm（單一供應商規格） | WikiChip en.wikichip.org/wiki/Wafer_size；Wikipedia Wafer (electronics)；SVMI 規格 svmi.com/wp-content/uploads/2021/01/SV029.pdf | **高**（775 µm）／公差不上片。註：未取得 SEMI 標準原文 |
| HBM 每層 DRAM 晶片厚度一般約 30–50 µm | TrendForce 2025/9/29 trendforce.com/news/2025/09/29/news-breaking-the-memory-wall-hbm-basics-and-the-rise-of-hbm4-in-ai/ | 中高 |
| SK 海力士 2023 年 HBM3 發表時表示晶片厚度已減到約 30 µm；12 層的晶片要比 8 層薄約 40%，翹曲（warpage）成為大問題 | AnandTech anandtech.com/show/18823 | 中高（公司說法經媒體報導；與 TrendForce 範圍一致 → 「約 30～50 微米」高） |
| 16 層 HBM 估計要磨到約 30 µm（現行 12 層約 50 µm） | TrendForce 2026/1/9 | 中（分析預期，不上片） |
| JEDEC HBM4 封裝高度 775 µm（12 層、16 層都適用），先前是 720 µm；但 720→775 是從 HBM3E 還是 HBM4 開始，SemiEngineering 與 Digitimes 說法衝突 | TechPowerUp 2024/3/13；wccftech；SemiEngineering semiengineering.com/hbm-options-..；Digitimes a20260306VL208 | 高（HBM4＝775 µm）／世代沿革衝突 → **不上片** |
| HBM4E／HBM5 封裝高度提案 825–900 µm 以上 | Digitimes 引 ZDNet Korea | 尚未確定（截至 2026/11/27），不上片 |
| CoWoS 中介層翻面後研磨拋光到約 100 µm，露出背面 TSV | SemiAnalysis newsletter.semianalysis.com/p/ai-expansion-supply-chain-analysis | 中（單一研究機構） |
| 一般封裝薄化：專利描述傳統研磨低於約 150 µm 破片變多；50 µm 等級要外圈或補強支撐；TAIKO 專利稱可薄到約 60–120 µm 仍減翹曲 | USPTO 6713366、6693342、10741504 等 | 中（專利，數字不上片） |
| 東京精密：自家 ML 切割機＋研磨拋光一體機搭配特定製程，型錄稱可做到 25 µm 厚晶片無缺陷 | accretech.com 型錄 | 中（公司自述，不上片） |

### 2-2 為什麼要磨薄
| 內容 | 來源 | 信心 |
|---|---|---|
| 封裝變薄（降低封裝高度） | USPTO 6506681／7291543（thin flip-chip） | 中高 |
| 堆疊：HBM 要在固定封裝高度內疊 12～16 層，只能把每層磨薄 | TrendForce；TechInsights techinsights.com/ko/node/58015；JEDEC 新聞（TechPowerUp） | 高 |
| TSV 要露出：背面要磨到離孔底幾微米，再露出銅柱 | SemiEngineering semiengineering.com/tsv-complexity-leads-to-manufacturing-bottleneck/ | 高（與 SemiAnalysis 一致） |
| 散熱：薄晶片熱比較容易傳出去 | 本次未找到可直接引用的獨立來源；只有「薄晶片較能隨基板彎曲、降低熱膨脹應力」（USPTO 6506681） | **低／查不到直接依據**，片中不要把「散熱」當主因 |

### 2-3 研磨流程
| 內容 | 來源 | 信心 |
|---|---|---|
| 正面先貼研磨保護膠帶（BG tape），保護電路不被刮、不被研磨液汙染，也方便搬運；晶圓越薄越容易翹 | USPTO 8222118（Wafer backside grinding with stress relief）、11424153（Back grinding tape）；明基材料 BG Tape 產品頁 benqmaterials.com/exhibition-detail/BG_Tape_EN/ | 高 |
| 晶圓被真空吸盤（chuck table）吸住；DISCO DGP8761 是「3 軸、4 個吸盤」在轉盤上輪流：Z1 粗磨 → Z2 細磨 → Z3 應力消除（乾式拋光或 CMP 墊） | DISCO DGP8761 型錄 disco.co.jp/eg/products/catalog/pdf/dgp8761.pdf、產品頁 disco.co.jp/eg/products/polisher_etcher/dgp8761.html | 高（官方） |
| 研磨方式：晶圓自轉＋砂輪往下進給（in-feed grinding with wafer rotation） | 同上 | 高 |
| 粗磨、細磨用兩種不同的鑽石砂輪 | Saint-Gobain 背磨應用頁 electronics.saint-gobain.com/applications/bumped-wafers；EPFL DAG810 頁 | 高 |
| 粗磨留下損傷層（由表往內：非晶層／多晶層／微裂紋層／應變層／完整晶體）；要用濕蝕刻、CMP 或乾式拋光去掉幾微米來消除應力；乾式拋光成本較低 | USPTO 8222118；USPTO 7452787、7759224；EPFL DAG810 | 中高（專利＋大學設備頁一致） |
| DISCO：研磨＋乾式拋光 2 µm 去除後 Ra < 0.005 µm（鏡面） | DGP8761 型錄 | 高（官方，數字不上片） |
| 測厚：二手設備資料寫 Z1／Z2 用高度計（0–1.8 mm）、Z3 有非接觸式量測；DISCO 型錄本次未取得量測器名稱 | caeonline.com 二手機台頁 | 中低（第三方描述；畫面可畫「測厚探頭」但不寫型號） |
| TAIKO 製程（DISCO）：外圈留約 3 mm 不磨、只磨內圈，外圈像鼓框撐住，薄晶圓不用硬載板也能保持形狀、減少翹曲；缺點是要專用夾具、之後切掉外環可能崩角 | DISCO 官方 disco.co.jp/eg/solution/library/grinder/taiko_process.html；USPTO 10741504、11551923 | 高 |
| 載板（carrier）：極薄晶圓也可用暫時貼合把晶圓黏在玻璃／矽載板上加工，再剝離（台廠辛耘有這類設備，見 4-2） | stockfeel 辛耘介紹；USPTO 8536709 | 中 |
| 研磨後背面很「活」，直接貼切割膠膜會黏死取不下來（需注意） | USPTO 7452787 | 中（不上片，背景） |

---

## 3. TSV（矽穿孔）
| 內容 | 來源 | 信心 |
|---|---|---|
| 做法：用深反應離子蝕刻（DRIE）在矽上挖出又深又細的孔 → 鋪絕緣層與阻障層 → 鍍銅種子層 → 電鍍把銅由下往上填滿 → CMP 磨平 | SemiAnalysis；SemiEngineering TSV 文章 | 高（兩源一致） |
| 用途：讓上下堆疊的晶片用垂直的銅柱直接連線，不用繞到旁邊打線；HBM 用 via-middle（前段電晶體做完後做孔） | SemiEngineering | 高 |
| 露出（reveal）：從背面粗、中、細磨到離孔底幾微米、鏡面，再用電漿蝕刻把銅柱頭露出來，表面再鋪氧化層保護 | SemiEngineering；USPTO 9818622、10410879（Uniform back side exposure of TSVs） | 高 |
| 中介層（CoWoS 的矽中介層）也有 TSV，翻面研磨到約 100 µm 露出 | SemiAnalysis | 中（厚度不上片） |
| 已知問題：磨到露出時銅可能凸出（copper extrusion） | USPTO 7833895 背景段 | 中 |

一段白話：在矽上鑽很多又深又細的洞、灌滿銅，等於在大樓樓板預先埋好管道間；再把晶圓背面磨薄到洞底露出來，上下兩層晶片就能直接用這些銅柱對接。HBM 的 DRAM 就是這樣一層層疊起來，CoWoS 的中介層也靠它把訊號往下傳。

---

## 4. 公司

### 4-1 日本
| 公司 | 查到的事實 | 來源 | 信心 |
|---|---|---|---|
| **DISCO（迪思科，東證 6146）** | 做切割機（DAD 系列）、雷射切割機（DFL 系列）、研磨機（DFG／DGP 系列）、擴片機（DDS），也賣刀片、砂輪等耗材；耗材是重複營收（2026 財年上半年耗材銷售創新高，Quartr 摘要） | DISCO 官網產品頁；Wikipedia Disco Corporation；umbrex 公司分析；Quartr 財報摘要 | 高（業務）／中（耗材創新高的財報摘要） |
| DISCO 市占 | 口徑衝突：TechNews「切割設備約 80%」；Digitimes「晶圓切割與研磨設備 70–80%」；DCF-analysis「切割機約 78%」；另一分析「切割／薄化設備 50%」；Bonafide「全體切割設備 26.6%（2025）」 | technews.tw/2025/12/16/disco-three-equipment/；apps.digitimes.com/news/a20240110PD201.html；dcf-analysis.com；bonafideresearch.com | 口徑不一 → **不上片**。片中只說「切割、研磨機台以日本 DISCO 為主」或「龍頭」（多來源一致說它是龍頭） |
| **台灣迪思科**：迪思科高科技股份有限公司（DISCO HI-TEC TAIWAN CO., LTD.） | 2007 年成立；據點台北、新竹、台中、台南、高雄；2017 年在台設 DHT 訓練中心（設備操作與維修培訓）；DISCO 新聞稿有稱 branch／affiliate，「子公司或分公司」法律身分說法不一 | DISCO 新聞 disco.co.jp/eg/news/corp/20230727.html、disco.co.jp/eg/news/press/20170123.html；cake.me 公司頁（約 400 人，求職平台自述） | 中高（存在與據點）／中（員工數，不上片） |
| **東京精密（ACCRETECH，東證 7729）** | 半導體設備含探針台、切割機、研磨拋光一體機（polish grinder，PG 系列）、CMP、高剛性研磨機、邊緣研磨機；官網稱開發世界第一台 polish grinder（約 2000 年）、商品化對向雙主軸全自動刀片切割機 | accretech.com/en/company/ 與歷史頁；PG3000RMX 型錄 | 高（業務）。市占：只有媒體推算約 8–9%、「唯一有規模的競爭者」 → **不上片**；官網「70–80%」是指 slicing machine（切晶棒），不是切割晶片，**不要混用** |
| Hamamatsu（濱松光子） | 隱形切割基礎技術與專利；做雷射引擎 | Hamamatsu 官方 | 高 |

註：東證代號 7729 本次搜尋未直接出現在結果文字中，取自一般公開資料；上片前若要秀代號請再核一次（信心：中）。

### 4-2 台灣（逐一查證）
| 公司 | 代號 | 做什麼（與本集相關的部分） | 來源 | 信心 |
|---|---|---|---|---|
| **鈦昇科技** | 8027 | 高雄的雷射與電漿設備廠；2020 年報導稱已轉型為**晶圓級雷射切割**與電漿清洗設備量產廠；2026 年新聞稿有大尺寸玻璃精密切割、ABF 開槽（Grooving）能力；FOPLP 面板雷射切割 | technews.tw/?p=645972；thenewslens.com/article/269852（SEMICON Taiwan 2026）；moneyweekly | 中高（多篇媒體一致；規格未取得） |
| **均華精密** | 6640 | 晶粒挑揀機（Chip Sorter，切完之後把晶粒挑出分級）、黏晶機（Die Bonder，HBM／CoWoS／SoIC 用）、切單揀選機（Jig Saw）；**沒有查到它做晶圓切割機或研磨機** | statementdog 9077、17548；ltn 5558513 | 中高（業務）／查不到（切割研磨本身） |
| **萬潤科技** | 6187 | CoWoS 點膠、AOI 檢測、晶粒處理、光耦合機；早年的「切割機」是被動元件用；**沒有查到晶圓切割或研磨設備** | pocket.tw/school/articles/7340/；uanalyze 722905768；money.udn 8874354 | 中高（業務）／查不到（切割研磨） |
| **辛耘** | 3583 | 自製**暫時貼合與剝離設備**（Pyxis TB／FDB／TDB 系列），用在晶圓薄化時把晶圓黏在玻璃載板上撐住、磨完再剝開 | stockfeel ?p=270924；pocket.tw article-mvgetj5s；statementdog 7758 | 中（媒體整理產品表） |
| **弘塑** | 3131 | 主力是濕製程（單晶圓濕洗、蝕刻）；2026/8 子公司佳霖代理日本青輝的鍵合與表面處理設備；**沒有查到研磨或暫時貼合設備** | wantrich.chinatimes 20260811900557；pocket.tw | 中／查不到（研磨） |
| **昇陽半導體** | 8028 | 再生晶圓＋**晶圓薄化代工**兩大本業；薄化從功率半導體延伸到先進封裝、GaN／SiC；有報導連結台積電 A16 背面供電帶動薄化需求 | money.udn 9791481、9476625；wantrich 20250908900349 | 高（業務，多篇一致）／產能數字不上片 |
| **精材科技** | 3374 | 台積電轉投資封測廠；起家於 CIS 晶圓級尺寸封裝、以 **TSV 技術**見長；近年測試營收占比接近五成；**沒有查到專門的薄化業務描述** | money-link 3374；businesstoday 201503120019；vocus | 高（TSV／晶圓級封裝）／持股比例不一不上片 |
| **日月光投控**（日月光半導體） | 3711 | 官網凸塊服務頁列出 **backside grinding（背面研磨）**、背面打印、覆晶組裝等一條龍；2017 年在中壢廠導入 Plasma-Therm 電漿切割 | ase.aseglobal.com/?p=55；Yole／Silicon Semiconductor 2017 新聞 | 高（官方＋產業新聞） |
| **京元電子** | 2449 | 以測試為主；只有一個第三方設備目錄頁寫它提供晶圓研磨服務（含凸塊晶圓）；**切割服務查不到** | etesters.com 產品頁 | 低（單一第三方）→ 不上片 |
| **中砂（中國砂輪）** | 1560 | 鑽石碟（CMP 修整器）、再生晶圓、砂輪三大事業；有報導說它供應 CMP 耗材含研磨輪；**沒有查到 HBM 背面研磨砂輪或晶圓切割刀片的具體產品** | bnext 78228；ctee 20260425700010；moneyweekly | 中（業務）／查不到（切割刀片、背磨砂輪） |
| **明基材料** | 8215 | 官網有晶圓背磨膠帶（BG Tape）產品頁：研磨時支撐晶圓、保護表面、包覆凸塊、不殘膠 | benqmaterials.com/exhibition-detail/BG_Tape_EN/ | 高（官方產品頁）。代號 8215 為公開資料，本次搜尋結果未直接顯示，上片前再核 |
| 切割膠帶（dicing tape）台廠 | — | 達興、長興、台虹：**查不到**與切割／BG 膠帶直接相關的資料；國際常見供應商為古河、日東、Ultron（背景） | 搜尋無結果 | 查不到 |
| 晶圓切割刀片台廠 | — | **查不到**台灣量產半導體切割刀片的廠商 | 搜尋無結果 | 查不到 |
| 切割機／研磨機台廠 | — | 除鈦昇（雷射切割）外，**查不到**台灣量產半導體刀片切割機或背面研磨機的公司 | 搜尋無結果 | 查不到 |

**片中可說**：「切割研磨的機台主要是日本 DISCO，台灣有分公司就近服務；台灣這邊，鈦昇做雷射切割設備、昇陽半做晶圓薄化代工、精材做 TSV 晶圓級封裝，日月光封測也有背面研磨。」
**不要說**：DISCO 市占幾成、「台灣也做切割刀片」、「京元電做切割」、「均華／萬潤做切割機」。

---

## 5. 片中數字與比喻建議

### 5-1 最多 2 個數字（都要高信心）
1. **775 微米 → 約 30～50 微米**（300 mm 晶圓原本約 775 µm〔WikiChip＋Wikipedia＋供應商規格一致〕；HBM 每層 DRAM 約 30～50 µm〔TrendForce＋SK 海力士 2023 說法〕）。白話：「原本將近 0.8 毫米，磨到只剩幾十微米，磨掉九成以上」。若只能一個數字，就念「七百七十五微米磨到三十幾微米」，但「30」建議寫成「約 30～50」或「幾十微米」以免變成單一公司數字。
2. **每分鐘最高 6 萬轉**（DISCO DAD3350 官方規格 6,000–60,000 min⁻¹，另有大學設備頁 30,000–60,000 rpm 佐證）。念稿：「每分鐘最高轉六萬圈」。

備選（若不用轉速）：刀片厚度「二三十微米」（Semiconductor Digest 等兩源，高），白話「比頭髮還細」。

### 5-2 生活比喻候選（≥3）
| 比喻 | 對應的物理動作 | 備註 |
|---|---|---|
| **繃在刺繡框上的布**：晶圓貼在膠膜上、膠膜繃在鐵框上，切完晶片還黏在布上不會散 | 切割膠膜＋框架 | 畫面好做 |
| **砂輪切磁磚、邊切邊沖水**：師傅切磁磚會一邊淋水降溫、沖掉粉塵 | 鑽石刀片高速旋轉＋噴水冷卻沖屑 | 最直覺；點出「硬又脆」 |
| **掰巧克力片**：先在內部打出一排「看不見的折線」，把膠膜往外一拉就沿線斷開 | 隱形切割改質層＋擴片 | 要強調線在「裡面」，可補「像水晶內雕」 |
| **水晶內雕**：雷射穿過透明玻璃，在裡面點出圖案，表面完全沒傷 | 雷射聚焦在矽內部（矽對紅外光透明） | 和上面二選一 |
| **先粗砂紙再細砂紙**：磨木頭先用粗的快速磨掉、再用細的磨亮 | 粗磨＋細磨兩段砂輪＋拋光去損傷層 | |
| **太鼓的鼓框**（TAIKO 日文就是太鼓）：中間磨薄、外圈留一圈厚邊撐住，像鼓面繃在鼓框上 | TAIKO 研磨留外圈 | TAIKO 為 DISCO 製程名，DISCO 官方稱外圈約 3 mm |
| **大樓預埋管道間**：先在樓板鑽洞拉好管線，把地板磨掉就露出管口、上下樓直接接 | TSV 蝕刻填銅＋背面研磨露出 | |
| **先切半塊吐司再從底下削**：先切一半深，從背面削到切口，片自然分開 | DBG | 時間夠才用 |

---

## 6. 可畫成 3D 的機台構造（每項附依據）

### 6-1 刀片切割機（以 DISCO DAD 系列為參考，不仿特定機型外觀）
| 零件 | 形狀／動作 | 依據 |
|---|---|---|
| 主軸（spindle） | 水平軸、高速旋轉（最高約 60,000 min⁻¹） | DISCO DAD3350 官方規格 |
| 刀片（blade） | 薄圓片，外緣是鑽石刃；可分有輪轂（hub blade，鋁輪轂）與無輪轂 | Asahi 刀片說明；UCSB SOP（hub blade 用 spacer） |
| 法蘭（flange） | 夾住刀片、用鎖緊螺帽固定在主軸上 | UCSB ADT SOP；Notre Dame DAD3240 說明 |
| 刀蓋＋噴水嘴（blade cover／nozzle） | 刀片上方罩子，兩側噴嘴對刀口噴去離子水 | UCSB ADT Troubleshooting（調整冷卻水壓、對準噴嘴）；USC Nanofab |
| 卡盤（chuck table） | 多孔陶瓷真空吸盤，框架晶圓放上去置中吸住，可 X 方向移動、θ 旋轉 | Utah DAD3220 SOP（mount and center framed wafer on chuck table）；DAD3241 頁（X、Y、Z 軸伺服） |
| 框架與膠膜（frame＋dicing tape） | 圓環金屬框中間繃膠膜，晶圓貼在膠膜中央；刀切進膠膜一點點 | UCSB SOP；USPTO 8609515 |
| 對位攝影機（alignment camera） | 在主軸旁，切前看切割道自動／手動對準 | DAD3220 型錄（camera based alignment） |
| 動作順序 | 對位 → 主軸下降 → 卡盤帶晶圓直線走刀 → 換下一道 → 轉 90° 切另一方向 → 噴水全程 | 綜合 SOP（UCSB、Utah、Notre Dame） |

### 6-2 隱形切割（雷射）＋擴片
| 零件 | 形狀／動作 | 依據 |
|---|---|---|
| 雷射頭（laser engine＋聚光鏡） | 從上方往下打紅外雷射（>1000 nm），焦點在晶圓內部；可分光成多道、在不同深度打多層 | Hamamatsu 官方（LBA 光學、LCOS 分光、多層 SD）；USPTO 9147624 |
| 改質層（SD layer） | 晶圓內部一排小點連成的面，裂紋往上下表面延伸 | Hamamatsu 官方 |
| 擴片機（die separator） | 框架固定、中間圓台往上頂（DDS2300 頂升最多 30 mm），膠膜被均勻撐開，晶片之間拉開縫；可在低溫下做（冷擴片），完後熱風收緊膠膜 | DISCO DDS2300 官方規格 |

### 6-3 背面研磨機（以 DISCO DGP8761 為參考）
| 零件 | 形狀／動作 | 依據 |
|---|---|---|
| 轉盤（turntable） | 大圓盤上 4 個卡盤，轉盤每轉一格把晶圓送到下一站 | DGP8761 型錄（3 axes, 4 chuck tables） |
| 旋轉卡盤（chuck table） | 真空吸住晶圓（正面朝下、貼 BG 膠帶），自己旋轉 | DGP8761 型錄（in-feed grinding with wafer rotation）；USPTO 8222118 |
| 鑽石砂輪（grinding wheel） | 杯型砂輪，外緣一圈鑽石磨塊，從上往下壓、旋轉；粗磨與細磨各一種 | Saint-Gobain 背磨頁；JSPE 2009 杯型砂輪研究（jstage 2009S_0_295） |
| 粗磨軸 Z1／細磨軸 Z2（＋Z3 拋光） | 兩到三個垂直主軸，依序粗磨 → 細磨 → 乾式拋光／CMP 墊 | DGP8761 型錄 |
| 測厚探頭（thickness gauge） | 研磨時量厚度（接觸式高度計＋非接觸式） | caeonline 二手機台描述（第三方，信心中低）；畫面只畫「探頭」不標型號 |
| BG 膠帶 | 正面保護膜 | USPTO 11424153；明基材料產品頁 |
| TAIKO 外圈（可選） | 晶圓外圈約 3 mm 不磨，中間凹下去 | DISCO TAIKO 官方頁 |

---

## 7. 查不到／待補
- 台灣切割膠膜、切割刀片、刀片切割機、背面研磨機的國產量產廠：**查不到**（截至 2026/11/27）。
- DISCO 與東京精密的可靠市占：口徑衝突，**查不到單一權威數字**。
- 「磨薄是為了散熱」的直接依據：**查不到**可引用的獨立來源。
- 京元電切割服務：**查不到**；研磨服務只有單一第三方頁。
- 研磨機測厚探頭的 DISCO 官方規格：**查不到**（只有二手機台描述）。
- SEMI 300 mm 晶圓標準原文（M1）：未取得，775 µm 由多個二手來源一致支持。
- disco.co.jp 全文無法在本環境直接開啟，DISCO 官方內容取自搜尋摘要。

## 來源清單
1. Hamamatsu Stealth Dicing：https://www.hamamatsu.com/jp/en/product/lasers/laser-related-products/stealth-dicing-technology.html ；專利資訊 https://www.hamamatsu.com/jp/en/product/lasers/laser-related-products/stealth-dicing-technology/patent-information.html
2. DISCO 隱形切割：https://disco.co.jp/eg/solution/library/laser/stealth.html
3. DISCO 薄晶圓切割：https://disco.co.jp/eg/solution/library/dicing/dicing_thin.html
4. DISCO low-k 雷射開槽：https://disco.co.jp/eg/solution/library/laser/low_k.html
5. DISCO DBG／SDBG：https://disco.co.jp/eg/solution/library/dbg/dbg_process.html ；https://disco.co.jp/eg/solution/library/dbg/sdbg.html
6. DISCO TAIKO：https://disco.co.jp/eg/solution/library/grinder/taiko_process.html
7. DISCO DAD3350：https://disco.co.jp/eg/products/dicer/dad3350.html
8. DISCO DGP8761：https://www.disco.co.jp/eg/products/catalog/pdf/dgp8761.pdf
9. DISCO DDS2300：https://disco.co.jp/eg/products/separator/dds2300.html
10. DISCO 刀片：https://disco.co.jp/eg/products/blade/zhzz.html 、z05.html、p1a.html
11. DISCO 台灣據點新聞：https://www.disco.co.jp/eg/news/press/20170123.html 、https://www.disco.co.jp/eg/news/corp/20230727.html
12. nanoFAB（U of Alberta）：https://www.nanofab.ualberta.ca/stealth-dicing-now-at-the-nanofab/
13. photonics.com：https://www.photonics.com/Article.aspx?AID=31907
14. USC Nanofab Dicing Saw：https://wiki.nanofab.usc.edu/index.php/Dicing_Saw
15. UCSB ADT Troubleshooting／SOP：https://wiki.nanofab.ucsb.edu/w/images/6/6b/ADT-Troubleshooting.pdf
16. Utah DAD3220 型錄／SOP：https://www.nanofab.utah.edu/wp-content/uploads/2022/12/DAD3220-Brochure.pdf.pdf
17. Semiconductor Digest Wafer Dicing：https://sst.semiconductor-digest.com/?p=34110
18. Springer MNSL 2023（DBG 比較）：https://link.springer.com/article/10.1186/s40486-023-00183-w
19. IEEE low-k 開槽：https://ieeexplore.ieee.org/document/8429805
20. WikiChip Wafer size：https://en.wikichip.org/wiki/Wafer_size ；SVMI：https://svmi.com/wp-content/uploads/2021/01/SV029.pdf
21. TrendForce HBM 基礎：https://www.trendforce.com/news/2025/09/29/news-breaking-the-memory-wall-hbm-basics-and-the-rise-of-hbm4-in-ai/ ；2026/1/9 HBM4 報導
22. AnandTech SK hynix HBM3：https://www.anandtech.com/show/18823
23. TechPowerUp JEDEC HBM4 厚度：https://techpowerup.com/320314/jedec-agrees-to-relax-hbm4-package-thickness
24. SemiEngineering TSV：https://semiengineering.com/tsv-complexity-leads-to-manufacturing-bottleneck/ ；HBM options：https://semiengineering.com/hbm-options-..
25. SemiAnalysis CoWoS／HBM：https://newsletter.semianalysis.com/p/ai-expansion-supply-chain-analysis
26. 專利（USPTO）：6271102、6915795、7776720（刀切損傷）；9147624、8785234（SD 波長）；8222118、7452787、7759224、11424153、9076859（背磨與應力消除）；10741504、11551923（TAIKO）；8609515、8114759（膠膜）；9818622、10410879、7833895（TSV 露出）；6506681、6713366、6693342（薄晶片）
27. Saint-Gobain 背磨：https://electronics.saint-gobain.com/applications/bumped-wafers
28. Accretech：https://www.accretech.com/en/company/
29. DISCO 市占報導：https://technews.tw/2025/12/16/disco-three-equipment/ ；https://apps.digitimes.com/news/a20240110PD201.html ；https://newsletter.semianalysis.com/p/disco-corporation-the-world-leader
30. 鈦昇：https://technews.tw/?p=645972 ；https://www.thenewslens.com/article/269852
31. 均華：https://statementdog.com/news/9077 ；https://ec.ltn.com.tw/article/breakingnews/5558513
32. 萬潤：https://www.pocket.tw/school/articles/7340/
33. 辛耘：https://www.stockfeel.com.tw/?p=270924
34. 弘塑：https://wantrich.chinatimes.com/news/20260811900557-420101
35. 昇陽半：https://money.udn.com/money/amp/story/5607/9791481 ；https://money.udn.com/money/story/5607/9476625
36. 精材：https://ww2.money-link.com.tw/TWStock/StockBasic.aspx?SymId=3374 ；https://www.businesstoday.com.tw/article/category/80402/post/201503120019/
37. 日月光：https://ase.aseglobal.com/?p=55 ；https://www.yolegroup.com/industry-news/ase-selects-plasma-therm-s-singulator-mds-100-to-establish-plasma-dicing-capabilities-in-taiwan/
38. 京元電（第三方）：https://www.etesters.com/product/cebca091-1422-08df-aa22-7fb5cf1e9036/
39. 中砂：https://www.bnext.com.tw/article/78228/kninik-hbm-abu ；https://www.ctee.com.tw/news/20260425700010-430503
40. 明基材料 BG Tape：https://www.benqmaterials.com/exhibition-detail/BG_Tape_EN/
41. 台灣迪思科（求職平台）：https://www.cake.me/companies/disco-jp-jp-index-html

## 補充（製作人 2026/11/27，英文字幕用）
| 內容 | 來源 | 信心 |
|---|---|---|
| 鈦昇科技（8027）英文簡稱 E&R（官網 www.enr.com.tw；美國子公司 E AND R ENGINEERING USA LLC）；英文字幕寫「E&R (8027)」，不寫未查證的全名 | info.technews.tw/company/22101002；hk.investing.com/equities/e-r-engineering | 中（簡稱多源一致，全名未查證） |
| 昇陽半導體（8028）英文名 Phoenix Silicon International Corporation，簡稱 PSI；英文字幕寫「Phoenix Silicon (PSI, 8028)」 | info.technews.tw/company/84149884；money-link 8028 基本資料 | 中高 |
