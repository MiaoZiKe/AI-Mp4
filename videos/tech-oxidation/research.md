# tech-oxidation 研究紀錄：氧化與熱處理（科技透明圈，系列 1 第 10 支；接清洗，下一支光阻塗佈與顯影）

查證截至 2026/11/21。狀態標籤：【確】已確定（原理、製程通則、專利與教科書寫明）｜【廠】廠商公布｜【媒】媒體報導（標誰報的）｜【估】研究機構估計｜【示】示意。
搜尋（WebSearch 14 組；三類來源：百科與大學講義／專利與學術論文／廠商產品頁、台灣與日本媒體）：
1. thermal oxidation silicon dry wet oxidation temperature 800 1200 °C furnace Deal-Grove（Wikipedia Thermal oxidation；KTH Lecture 5；CityU AP6120 講義；U. Alberta 氧化計算器）
2. post-implant anneal dopant activation lattice damage repair spike anneal laser anneal millisecond diffusion（Cambridge MRS 論文；USPTO 7846803、8232114、7737036；NIST）
3. rapid thermal processing RTP lamp heating ramp rate 100 °C per second single wafer（Wikipedia RTP；USPTO 6768084、6133550 等；JTEKT 技術報）→ 升溫速率各來源 20～數百 °C/秒不等，片中不念數字，只說「幾秒」
4. dopant diffusion during anneal thermal budget junction depth spike anneal laser anneal（Cambridge MRS 兩篇；USPTO 7968440：尖峰退火頂點停留近乎 0、約 1000–1100°C；尖峰系統升溫上限約 150°C/秒）
5. Applied Materials RTP laser anneal market leader Vantage Astra dynamic surface anneal（應用材料官網中／日／韓／台產品頁）
6. Screen Semiconductor laser anneal LT-3100 flash lamp anneal SCREEN millisecond annealing（SCREEN 簡報、CEA-Leti 新聞稿、USPTO 8017528）
7. Kokusai Electric batch furnace market share vertical furnace Tokyo Electron thermal processing（SEMI 會員資料、SemiWiki、SemiAnalysis、市場報告摘要、日本半導體歷史館）
8. Tokyo Electron TELINDY batch thermal processing furnace oxidation anneal（TEL 2007 ECS 論文、TELINDY PLUS 產品說明、二手設備平台）
9. ASM International vertical furnace A400 A412 thermal oxidation anneal batch（ASM 官網、GlobeNewswire 2003）
10. 國際電氣 Kokusai 爐管 熱處理 設備 中文 台灣 東京威力科創 應用材料 退火（無半導體相關結果）
11. "國際電氣" KOKUSAI ELECTRIC 半導體 設備 台灣（科技新報 2023/09/06、2023/09/22；優分析）
12. 國際電氣 6525 日本 成膜設備 爐管 批次（日立評論 2006、2011；東北大學設備清單）
13. 台灣 熱處理 爐管 半導體 設備廠 退火 雷射退火 國產 供應鏈；立式爐管 國產化 台灣 設備商；雷射退火 設備 台灣廠商（數位時代、經濟日報、科技新報、鉅亨、工商時報）→ 沒有查到台灣自製的爐管或雷射退火量產設備，片中不寫台灣設備商
14. ASM International 中文名；"先藝科技" ASM 立式爐管 → 只有中時一則寫「ASM 台灣先藝科技」（台灣子公司名），第二次查不到，**中文名不念**，卡片只寫「ASM（荷蘭）」

## 原理（影片內容依據）
| # | 內容 | 狀態 | 來源 |
|---|---|---|---|
| 1 | 熱氧化：矽在高溫下和氧氣（乾式）或水氣（濕式）反應，表面長成二氧化矽；爐管通常 800–1200°C | 【確】 | Wikipedia Thermal oxidation；KTH Lecture 5（Deal-Grove 適用 700–1200°C）；ASM 官網立式爐管說明 |
| 2 | 濕式比乾式快很多（水在二氧化矽裡的溶解度遠高於氧氣）；乾式氧化層較緻密、介面品質好；厚氧化層常用「乾—濕—乾」 | 【確】 | Wikipedia Thermal oxidation |
| 3 | 氧化層要長得厚需要數小時，所以爐管是批次製程，一次 100–200 片；日立國際電氣的立式爐大批次最多 125 片 | 【確】 | Wikipedia Thermal oxidation；日立評論 2006/03（QUIXACE） |
| 4 | 表面要先洗乾淨：RCA 清洗是在氧化、擴散、CVD 等高溫步驟前要做；表面有汙染，氧化層就不均勻（接上一支） | 【確】 | Wikipedia RCA clean（見 tech-clean research.md 第 9 列） |
| 5 | 佈植後晶格受損、離子多半不在晶格位置上，電性不活化；退火修復晶格、讓摻質進到晶格位置才導電（活化） | 【確】 | Cambridge MRS「Efficacy of damage annealing…」；UW ECE528 Ch8；USPTO 7846803 |
| 6 | 加熱太久，摻質會擴散，接面變深變糊；傳統尖峰退火擴散偏多、活化有限，所以先進製程改用毫秒級退火 | 【確】 | Cambridge MRS 論文；ORBi（Nguyen 2009）；USPTO 7968440 |
| 7 | 單片快速熱處理（RTP）用高強度燈管加熱單片晶圓；尖峰退火＝快速升到約 1000–1100°C、頂點停留近乎 0、立刻降溫 | 【確】 | Wikipedia RTP；USPTO 8232114、7968440 |
| 8 | 尖峰退火系統的升溫速率約到 150°C/秒已到極限，下一步是閃光燈或雷射的毫秒級退火 | 【確】專利敘述 | USPTO 7968440 |
| 9 | 雷射退火：應用材料 Astra DSA 把晶圓表面最上面幾層原子在不到千分之一秒內加熱到超過 1000°C，限制缺陷與漏電 | 【廠】 | 應用材料官網 Vantage Astra DSA 產品頁 |
| 10 | 「界線一糊就關不起來」：擴散讓源極／汲極接面變深、通道變短，電晶體漏電、關不乾淨（片中是白話說法） | 【確】原理／【示】 | Cambridge MRS 論文（接面漏電與擴散）；示意 |

## 誰在做（只列查到的）
| 公司 | 做什麼 | 狀態 | 來源 |
|---|---|---|---|
| 國際電氣（KOKUSAI ELECTRIC，日本，東證 6525；前身日立國際電氣） | 立式批次爐管（1986 年推出 VERTEX 系列，做氧化、擴散、CVD）；批次成膜設備；應用材料持股約 15% | 【廠】【媒】 | 日本半導體歷史館（SHMJ）；日立評論 2006、2011；科技新報 2023/09/22 |
| 東京威力科創（TEL，日本） | 立式批次熱處理爐 TELINDY／TELINDY PLUS（氧化、退火、自由基氧化） | 【廠】 | TEL 產品說明；TEL 2007 ECS 論文 |
| ASM（荷蘭） | 立式爐管 A400／A412 系列（氧化、退火、摻質活化） | 【廠】 | ASM 官網；GlobeNewswire 2003 |
| 應用材料（Applied Materials，美國） | 單片快速熱處理（RTP）、雷射退火 Vantage Astra DSA；自稱 RTP 領導廠商 | 【廠】 | 應用材料官網（台灣中文頁） |
| 迪恩士（SCREEN，日本） | 閃光燈退火 LA-3000F、紫外線雷射退火 LT-3100 | 【廠】 | SCREEN 2015、2023 簡報；CEA-Leti 新聞稿 |
| 台積電（台灣） | 國際電氣的客戶之一（另有英特爾、三星） | 【媒】科技新報 | 科技新報 2023/09/06、2023/09/22 |

注意：
- 立式爐市場「前三大合計超過 73%」（市場報告摘要）、國際電氣批次 ALD 約 70%（SemiAnalysis／市調轉述）都是估計值，且是成膜不是氧化，片中不念。
- 台灣：查了三組關鍵字（立式爐管國產化、雷射退火台灣設備、熱處理國產供應鏈），沒有找到台灣自製、量產的爐管或雷射退火設備；台灣相關只寫台積電是客戶。
- ASM 的中文名只查到一則（台灣子公司「台灣先藝科技」），不念，卡片寫英文。

## 數字（片中出現的）
- 800–1200°C（爐管熱氧化，百科與講義一致）
- 一百多片（一管批次 100–200 片；日立 125 片）
- 約 1000°C、到頂就降溫（尖峰退火，專利）
- 超過 1000°C、不到千分之一秒（雷射退火，應用材料產品頁，標「廠商說明」）
- 幾秒（尖峰退火升溫，依專利 150°C/秒上限推算約數秒；示意，不念數字）

## 沒放進片裡、但文章可以寫的
- Deal-Grove 模型（1965）描述氧化層厚度和時間的關係；薄的乾氧化層用 Massoud 模型較準。
- 迪恩士 LT-3100：308 奈米紫外線、脈衝約 160 奈秒（廠商簡報）。
- 毫秒退火後若再經 500–800°C 的熱步驟，砷會失去活化（NIST）。
- 國際電氣 2026/08 報導上修 2027 財年營收預估到 3,400 億日圓（優分析轉述，未再查證）。
