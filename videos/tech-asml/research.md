# tech-asml 研究紀錄：設備五大-1：艾司摩爾 ASML（曝光）（科技透明圈，系列「代工的供應商」第 7 集；上一集光阻-2：塗佈顯影機；下一集設備五大-2：應用材料）

查證截至 2026/11/25（WebSearch，台北時間 2026/11/26 凌晨）。發布：12/9（三）18:00。留言關鍵字「ASML」。
狀態標籤：【確】已確定（原理、公司財報、官網寫明）｜【廠】公司說法（公司自己公布、未經第三方證實）｜【媒】媒體／研究機構報導（標誰報的）｜【示】示意。
規則：數字要兩個來源對得上才寫；只有一處的不念、不上畫面。不給投資建議。

## 一、是什麼、負責哪一步
| # | 內容 | 狀態 | 來源 |
|---|---|---|---|
| 1 | 曝光機（微影機，scanner）＝把光罩上的電路圖，用光縮小（EUV 機台縮小 4 倍）印到晶圓的光阻上；就是晶片廠裡的「投影機」 | 【確】 | ASML〈Lithography principles〉官網；Wikipedia〈Extreme ultraviolet lithography〉；tech-euv research.md #8–#13 |
| 2 | 負責「曝光」這一步：晶片每一層圖案都要先塗光阻（上一集的塗佈顯影機）→ 曝光 → 顯影 → 蝕刻或佈植；一顆先進晶片要重複幾十層 | 【確】 | tech-resist2 research.md #8；UW EE 527 講義（流程）。片中只說「每一層都要先經過它」，不念層數 |
| 3 | 掃描式：光罩台和晶圓台反方向同步移動，光只照一條細縫，掃過去才印完一格；照完一格，晶圓台換到下一格再掃（step-and-scan） | 【確】 | ASML〈How lithography works〉；Wikipedia〈Stepper〉（scanner 段落）；tech-euv research.md |

## 二、極紫外光怎麼來（影片 s4–s5 依據）
| # | 內容 | 狀態 | 來源 |
|---|---|---|---|
| 4 | 光源：錫滴（約 25 微米）以每秒約 5 萬顆落下，先被弱的預脈衝雷射打扁，再被強的主脈衝（CO2 雷射）打成電漿，發出 13.5 奈米的極紫外光 | 【確】＋【廠】 | ASML〈The hottest thing about ASML machines〉（25 µm、70 m/s、每秒 5 萬次、約 50 萬度）；Wikipedia〈EUVL〉；Frontiers〈aot-2012-0125〉（約 30 µm、60 m/s、40–60 kHz）。片中念「每秒五萬顆」，畫面標「錫滴放大、放慢示意」 |
| 5 | 極紫外光會被空氣與玻璃吸掉 → 整台抽真空、只能用反射鏡（多層膜鏡）；碗形收集鏡把電漿往四面發的光收成一束，聚到中間焦點 | 【確】 | Wikipedia〈EUVL〉；Frontiers 同上（collector mirror → intermediate focus）；tech-euv research.md #10–#13 |
| 6 | 從光源到晶圓約 11 次反射、到晶圓只剩約 2% | 【估】只有一處 | tech-euv research.md #13。**本片不念、不上畫面** |

## 三、全球誰做
| # | 內容 | 狀態 | 來源 |
|---|---|---|---|
| 7 | 曝光機主要三家：荷蘭艾司摩爾（ASML）、日本尼康（Nikon）、日本佳能（Canon）；佳能主攻 i-line、KrF 等成熟製程 | 【確】 | 36Kr〈ASML/Nikon/Canon 2024 出貨〉；MarketResearch〈Global Lithography Equipment〉摘要；Bits&Chips〈Nikon aims to challenge ASML in ArF immersion〉 |
| 8 | 高階機台（EUV、ArF 浸潤、ArF）ASML 佔九成以上：2024 年 ASML 201 台、約 91.4%；ArF 浸潤約九成 | 【媒】 | MarketResearch 摘要（91.4%）；Bits&Chips（ArFi 約 90%）。卡片寫「高階機台九成以上（研究機構估計）」 |
| 9 | 極紫外光（EUV）曝光機只有 ASML 量產供貨 | 【確】 | Wikipedia〈EUVL〉（ASML 為唯一供應商）；Tom's Hardware〈ASML's planned Low-NA EUV price hikes…〉（ASML 掌控 EUV 關鍵環節）；tech-euv research.md |
| 10 | 一台 EUV 約 2 億美元；High-NA 約 3.8–4 億美元 | 【媒】 | 工商時報 2026/9/16（EUV 約 2 億、High-NA 約 4 億美元）；數位時代〈High NA EUV 一台要價 120 億〉（High-NA 約 3.8 億、前一代約 1.8 億美元）。片中念「大約兩億美元」 |
| 11 | 2025 年出貨 48 台 EUV（44 台 Low-NA＋4 台 High-NA 認列）、131 台 ArF 浸潤；EUV 約佔營收 48% | 【確】公司財報 | eeNews Europe〈ASML reports €32.7bn sales…for 2025〉；heise〈Record orders for ASML due to AI〉；ASML 2025 年報 |
| 12 | 2025 年系統營收約 22% 來自台灣（中國 33%、南韓 25%） | 【確】公司財報（媒體轉述） | Nasdaq／Zacks〈ASML's revenue mix is changing〉（22%）；Tom's Hardware〈ASML projects USD71 billion…〉（22%）。另 Cryptobriefing 以總營收算約 26%（口徑不同）。片中念「兩成多」 |

## 四、台灣誰做
| # | 內容 | 狀態 | 來源 |
|---|---|---|---|
| 13 | ASML 台灣總部在新竹，另有林口、台中、台南據點（台中、台南就近服務南部科學園區與中科的晶圓廠） | 【廠】 | ASML〈Locations〉官網；ASML〈Taiwan at a glance〉招募頁 |
| 14 | 林口新據點：新北林口工一重劃區，第一期投資約新台幣 300 億元、約 2,000 人；曝光機整機仍不在台灣生產 | 【媒】政府官員說法 | 中央社 2022/11/16；Taipei Times 2022/11/18、2023/9/6。完工時間各報不同，片中只說「在蓋新據點」 |
| 15 | 2026 年在台再招募約 1,000 人，在台員工將超過 5,000 人 | 【媒】 | Digitimes 2026/5/26；NewKerala 2026/5/26（轉述）。片中不念 |
| 16 | 台灣供應鏈：帆宣（EUV 次系統模組代工、整合）、家登（EUV 光罩盒，High-NA 光罩盒通過 ASML 認證）、公準（精密金屬零組件） | 【媒】 | 科技新報 2021/1/20〈EUV 供應鏈〉、2026/9/9〈台積電與 ASML 推進 High-NA〉；工商時報 2021（公準）、2023/8/29（帆宣、家登、公準）。卡片標「媒體報導」 |

## 五、片中不講（查不到或只有單一來源）
- 「在台員工 5,000 人」：只有 2026/5 兩篇同源報導，不念。
- 高雄辦公室：只有傳聞（TweakTown），不提。
- 光到晶圓只剩約 2%：只有 Wikipedia，不提。
- 帆宣、公準 LOGO：官網被本機網路擋（micb2b.com 回 403），Commons 沒有原檔 → 卡片與 3D 用文字名牌，回報已列。

## 六、物理表現依據（Andy 第 15 條）
- 錫滴：受重力落下（等加速），先排隊、被打扁成餅、再被打成電漿；電漿發光後亮度衰減、碎點往外噴（tech-euv 的 `lpp` 動作，相位與 2D 側視卡同一份）。
- 光：電漿往四面發光 → 收集鏡碗內是「發散的光錐」，反射後變成「收斂的光錐」聚到中間焦點，兩層錐（內亮外淡）做出邊緣柔化，跟著每一次電漿閃一下。
- 晶圓台：掃描是正弦往復（兩端減速、中間最快）；換格是緩入緩出位移＋到位後小幅阻尼過衝（spring），表示慣性。
