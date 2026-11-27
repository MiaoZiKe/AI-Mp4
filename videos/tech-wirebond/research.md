# 封裝打線（wire bonding）：查證紀錄（科技透明圈，約 80 秒）

查證日：2026-11-27。方法：WebSearch 摘要為線索，優先採教科書級論文（Waterloo、Cal Poly、Fraunhofer、NTU）、專利（USPTO）、設備與耗材商自述（ASMPT、TOTO、Orbray、CoorsTek Gaiser、Tanaka、Amkor、ASE）。
**限制**：這次雲端環境的 WebFetch 連不到 wikipedia、kns.com、amkor.com、semiengineering.com、uwaterloo.ca、thomasnet，所以上述網站只看到搜尋摘要、沒開原文；凡只靠摘要的條目信心最多「中」。要升級信心，請在環境網路設定放行這些網域後重開原文。
信心：高＝兩個以上獨立來源一致（或教科書＋專利一致）；中＝單一來源、廠商自述或摘要；低＝口徑不明、年代不明或只有市場研究摘要；查不到＝如實標示。
**不上片的數字**：任何市占（打線占封裝 75–80%、球焊 93%、金線占比 77%→44%、ASMPT／K&S 營收占比）、金價、單一機型 UPH。

## 1. 打線在封裝流程的位置（構造）
| 內容 | 說明 | 來源 | 信心 |
|---|---|---|---|
| 封裝後段順序：晶圓切割 → 黏晶（die attach／die bond）→ **打線** → 封膠（molding）→ 電鍍／蓋印 → 切單／成型 → 包裝 | 業界媒體文章列出的流程；封膠把晶片和線一起包起來、加熱硬化 | [13] Semiconductor Digest〈From dicing to packing〉；USPTO 專利 9196557 等 | 高 |
| 線的兩端：一端在晶片上的**焊墊**（bond pad，常見是鋁），另一端在**導線架引腳**（lead frame）或**載板**上的焊點 | 專利用語為 contact pad／bond site；「焊指（bond finger）」是載板上的業界稱呼，這次沒查到權威定義原文 | [13]；[8] UF 講義 | 高（兩端位置）／中（bond finger 名稱） |
| 一般第一點（球）打在晶片焊墊、第二點（魚尾）打在引腳 | 「正打」；另有反打（reverse bonding）先在引腳 | [1] Waterloo 論文流程圖；[9] USPTO 5448165（反打） | 高 |
| 打線與封膠是整條後段產線的速度瓶頸 | 專利原文：wire bonding 與 encapsulating 是 rate-limiting steps | [13] 專利摘要 | 中（**不上片**） |

## 2. 線材
| 內容 | 說明 | 來源 | 信心 |
|---|---|---|---|
| 三大類：金線、銅線（含**鍍鈀銅線 PCC**）、銀合金線；功率元件另用粗鋁線 | 線材商型錄 | [4] Tanaka、Kaisertech；[15] 粗鋁線論文 | 高 |
| 細線常見線徑：約 **15～50 µm**；主流 15～25 µm | Tanaka：PCC 15～50 µm、銀合金 15～30 µm；Kaisertech：主流 15～25 µm；Neyco 金線 15～38 µm；Amkor：銅線量產驗證 0.6～2.0 mil（約 15～50 µm） | [4] | 高 |
| 功率元件用粗線：鋁線 10 mil（約 250 µm）以上；Tanaka 粗線 100～500 µm | 跟細線是兩個世界 | [15] Allen Press 論文；[4] Tanaka | 高 |
| 銅線取代金線的原因＝**成本**：銅線價格約金線的 10～40% | 金價上漲與波動促使改銅（專利原文）；ASE 2005 年就預期金價大漲而推銅線 | [5] NTU 鍾志偉講義；USPTO 8198737；[12] ASE 新聞室 | 高 |
| 銅線電阻比金低 | Amkor TS105 資料表 | [12] | 中 |
| 缺點 1：**銅比金硬**，要更大的超音波能量與壓力，容易把焊墊壓裂、底下矽裂開（cratering）、鋁墊被擠掉 | | [5] NTU；Copper Wire Bond Failure Mechanisms（smtnet PDF） | 高 |
| 缺點 2：**容易氧化**，成球時要吹保護氣；常見「95% 氮＋5% 氫」（forming gas），純氮也行 | Waterloo 研究也用 95% N₂＋5% H₂ | [5]；[1] | 高 |
| 缺點 3：製程窗口比金窄、劈刀磨耗比較快；封膠裡的氯等鹵素會腐蝕銅 | | [5]；USPTO 8198737；SemiEngineering 摘要 | 中高 |
| PCC 抗氧化比純銅好，但更硬、更貴 | Amkor 副總受訪（SemiEngineering） | [5][12] | 中 |
| 金線仍用在可靠度要求極高、細間距處；2026 年高金價加速以 PCC 等取代 | World Gold Council 2026 Q2／Q3 科技需求報告 | [11] | 中（趨勢）；**金價數字不上片** |

## 3. 打線機的頭：劈刀、線夾、換能器、打火棒
| 零件 | 白話說法 | 查到的事實 | 來源 | 信心 |
|---|---|---|---|---|
| **劈刀**（capillary，中國稱瓷嘴） | 中間有孔的陶瓷細針，線從孔裡穿出來 | 材質多為陶瓷：氧化鋁、紅寶石、氧化鋯增韌氧化鋁（ZTA）；尖端有倒角（chamfer）負責「含住」小球、讓拉線順；例：配 25 µm 金線的劈刀孔徑約 38 µm、倒角約 64 µm、尖端約 152 µm；細間距用瓶頸形尖端 | [6] USPTO 6325269、6715658；Orbray、TOTO 產品頁 | 高（材質、構造）／中（尺寸例） |
| 陶瓷劈刀的發明 | — | CoorsTek 白皮書：1960 年代末由 Gaiser Tool Company（現 CoorsTek）發明 | [6] CoorsTek Gaiser | 中（廠商自述，**不上片**） |
| **線夾**（wire clamp） | 夾住線的小夾子，該放線時鬆、該拉斷時夾 | 開合跟焊頭動作同步，用來控制送線與拉斷 | [7] USPTO 4653681、7025243 | 高 |
| **超音波換能器＋變幅桿**（transducer／horn） | 把電變成高速振動，傳到劈刀尖端 | 壓電元件疊堆接一支桿子，劈刀裝在桿子末端 | [7] 專利 | 高 |
| **打火棒**（EFO，electronic flame-off） | 對線頭放一個電火花，把線尾燒成小圓球 | 火花熔化線端形成「自由空氣球」（free air ball，FAB）；球大小靠放電電流與時間控制 | [1] Waterloo；[7] USPTO 6062462 | 高 |

## 4. 原理：熱超音波壓接（不是焊錫）
| 內容 | 說明 | 來源 | 信心 |
|---|---|---|---|
| 三樣一起來：**加熱＋壓力＋超音波振動** | 參數就是壓力、超音波能量、時間（加上成球的放電電流與時間） | [1] Waterloo | 高 |
| 超音波的作用：把焊墊表面的氧化層磨破，讓兩邊乾淨金屬直接接觸，原子互相擴散形成接合（固態接合），**沒有焊錫、也沒有把焊墊融化** | Fraunhofer：超音波打破焊墊原生氧化層，使接合可在 150 °C 或更低完成 | [3] Fraunhofer；[1] | 高 |
| 溫度：約 **一百多度，常見 150 °C 上下** | 研究實例：加熱台 125 °C（晶片約 110 °C）、175 °C（焊墊約 158 °C）；舊專利說傳統製程 175～300 °C；不同機台差很多 | [1][3]；USPTO 5894983 | 中（給範圍，不給單一數字） |
| 頻率：傳統 **60 kHz**，較新的高頻 **120 kHz** 上下（ESEC 3100 為 128 kHz）；都遠高於人耳聽得到的約 20 kHz | Cal Poly：金線通常 60 kHz；120 kHz 所需功率較低 | [2] Cal Poly；[1] | 高（60／120 兩檔）；「聽不到」是常識換算 |
| **楔焊（wedge）** vs **球焊（ball）** | 楔焊：常用鋁線，可只用超音波、在室溫做；把線壓扁成楔形；**有方向性**，焊頭要轉角度（XYZ＋θ 四軸）。球焊：金／銅線、加熱＋超音波；**沒有方向性**，只要 XYZ 三軸，所以比較快 | [8] UF 講義、TWI、NAVSEA；[15] | 高 |
| 球焊占大多數封裝（講義稱約 93%，楔焊約 5%） | 講義年代不明 | [8] UF | 低（**不上片**） |

## 5. 一條線的動作順序（念稿與畫面依據）
1. **打火成球**：EFO 放電，線尾燒成一顆小金屬球（FAB）。〔[1][7] 高〕
2. **第一焊點（球焊）**：劈刀帶著球往下，壓在晶片焊墊上，同時加壓＋超音波振動＋底下加熱，球被壓扁黏住。〔[1] 高〕
3. **拉線弧（looping）**：劈刀抬起、一邊放線，走出一道弧線（不是直線，留緩衝、避免碰到晶片邊）。〔[1] 高；「為什麼要弧」是通識，中〕
4. **移到引腳，第二焊點（stitch／魚尾）**：劈刀壓在引腳上，用尖端把線壓斷成魚尾（月牙）形接點。〔[9] Waterloo crescent bond 論文；[1] 高〕
5. **留線尾、拉斷**：劈刀抬起一小段留下線尾，線夾夾住往上拉，線從魚尾處斷開。〔[9] USPTO 4422568、7025243、8525040 高〕
6. **再打火成下一顆球**，進入下一條。〔[1] 高〕

**速度（每條幾毫秒、每秒幾條）**：
| 數字 | 出處 | 信心 |
|---|---|---|
| K&S Maxµmplus（2004）單條線循環時間降到 **63 ms**（約每秒 16 條） | [10] Thomasnet 轉載 K&S 新聞稿（摘要） | 中（舊、廠商自述） |
| ESEC 3100 球楔焊機「最高每秒 17 條」 | [10] Waterloo 設備頁（摘要） | 中 |
| ASMPT AB550（楔焊機）「每秒 9 條」，註明依封裝與材料而異 | [10] ASMPT 產品頁 | 中（廠商規格） |
| IEEE 簡報：K&S RAPID Pro 實測約 **每秒 8.5 條**（30 µm 線、320 條的測試） | [10] IEEE SCV-EPS 簡報 | 中（單一實測） |
| 其中「壓下去黏住」那一步可短到約 5 ms | [10] SEIPI 2026 研討會論文 | 中 |
| K&S 現行機型官方「每秒幾條」規格 | **查不到**（K&S 新聞稿多只寫「比前代快 10%／20%」） | 查不到 |
→ 綜合：**一秒大約十條上下（約 8～17 條，視機型與線長）**；每條約幾十到一百多毫秒。念稿用「一秒十條左右」，不寫「十幾條」。

## 6. 為什麼還大量用打線
| 內容 | 來源 | 信心 |
|---|---|---|
| 打線仍是低成本傳統封裝、中階封裝與**記憶體晶片堆疊**的主力 | [11] SemiEngineering〈Technology Advances, Shortages Seen For Wire Bonders〉（摘要） | 中 |
| TechSearch 估打線約占 **75～80%** 封裝（約四分之三） | 同上，文章日期摘要中看不到 | 低（年代不明，**不上片**；要用須開原文確認日期） |
| Yole：打線在傳統、大量的封裝仍不可少，2030 年打線設備營收約 9.78 億美元；覆晶與黏晶機是先進封裝主力 | [11] Yole 新聞（edge-ai-vision 轉載，2025/8） | 中（**只講趨勢，不上數字**） |
| 跟覆晶（flip chip）比：打線設備成熟、每台可換程式打不同晶片、成本低；覆晶要先在晶圓長凸塊、載板要對應設計 | 通識＋[11] Yole「打線服務成本敏感市場」 | 中 |
| 應用：NAND 記憶體階梯式堆疊用打線把每層接出來 | [15] USPTO 11749653（stair-step NAND） | 高 |
| 應用：功率元件、類比功率封裝用粗鋁線楔焊；車用要通過 AEC-Q100 等嚴格可靠度測試 | [15] Allen Press 論文 | 高 |
| 應用：車用微控制器 QFP 用銅線（ASE×Infineon 合作） | [12] eeNews Europe | 中 |

## 7. 公司
| 公司 | 查到的事實 | 官網／來源 | 信心 |
|---|---|---|---|
| **日月光投控（ASE，台灣，3711）** | 自稱 2008 年起量產銅線封裝、出貨超過 250 億顆銅線 IC（新聞稿年代較舊）；Gartner 曾列為全球最大封測廠（摘要稱市占 19%，年份不明） | https://ase.aseglobal.com/ （Press Room；Leadframe Packaging 頁 https://ase.aseglobal.com/?p=37） | 高（最大封測，業界共識）／中（數量）／低（19%，**不上片**） |
| **安靠（Amkor，美國）** | 自稱 20 多年銅線經驗、2006 年起所有工廠量產銅線、驗證 0.6～2.0 mil 線徑 | https://amkor.com/technology/interconnect/ ；TS105 資料表 | 中（廠商自述，未開原文） |
| **Kulicke & Soffa（K&S）** | **雙總部**：SEC 文件主要辦公室同列新加坡（23A Serangoon North Ave 5）與美國賓州 Fort Washington；註冊地仍是賓州；2010 年起把總部職能移往新加坡，2014 年新加坡「全球總部」開幕（新加坡貿工部演講）。沒查到改註冊地 | https://www.kns.com/ ；SEC 8-K（sec.gov CIK 56978）；mti.gov.sg 2014/02 演講 | 高 |
| **ASMPT（香港上市，0522）** | 打線機 AERO 系列、楔焊 AB550；排名網站列為香港公司 | https://semi.asmpt.com/ | 中（總部所在地只有二手網站；**念稿寫「香港上市的 ASMPT」最安全**） |
| **新川（Shinkawa，日本）** | 2019 年成為 Yamaha 發動機子公司、改名 Yamaha Motor Robotics Holdings；2025/7/1 與 APIC Yamada 等合併，存續公司改名 **Yamaha Robotics（ヤマハロボティクス）**。所以現在是 **Yamaha 發動機集團的 Yamaha Robotics**，「新川」品牌已併入 | https://global.yamaha-motor.com/news/2025/0212/yrh.html | 高（2025 合併，官方新聞） |
| 市占 | ReportPrime 稱 2024 全部「接合機」營收 ASMPT 15.3%、K&S 11.9%（含各類接合機，非打線專屬） | reportprime.com | 低（**不上片**）；打線機專屬市占 **查不到** |
| 劈刀廠（國外） | SPT（Small Precision Tools，有新加坡、無錫據點）、CoorsTek Gaiser（美）、TOTO、Orbray（日）；中國有蘇州芯合、潮州三環 | 各官網 | 中 |
| **台灣劈刀廠** | **查不到**（中英文各搜一次，無可驗證的台灣量產廠） | — | 查不到 |
| **台灣打線機廠** | **查不到** | — | 查不到 |

## 8. 生活比喻候選（對應物理機制，審片人檢查）
| 比喻 | 對應的動作 | 一致嗎 | 建議 |
|---|---|---|---|
| **用打火機燒尼龍線頭，線尾縮成一顆小圓球** | EFO 放電讓線端熔化、表面張力縮成球 | 一致（真的是瞬間熔化線端，只有成球這一步有熔化） | **推薦** |
| **把兩塊黏土壓緊、來回搓，搓掉表面那層灰，兩塊就黏成一塊** | 壓力＋超音波摩擦破氧化層→乾淨金屬原子互相擴散 | 大致一致（固態接合、不靠膠不靠焊錫）；黏土是塑性變形，金屬還有擴散，細節不同 | **推薦**（原理幕） |
| **縫紉機的針：線從針孔穿出、一上一下** | 劈刀中間有孔、線從孔裡出來、上下壓 | 構造一致；但縫紉是刺穿布，打線不刺穿，只壓上去 | **推薦**（零件幕），旁白說「不是刺穿，是壓上去」 |
| 拉電線：從電線桿牽一條有弧度的線到另一根 | 線弧從焊墊拉到引腳，刻意留弧 | 一致（形狀）；不解釋接點原理 | 備用（線弧幕） |
| 熨斗加熱再搓 | 加熱＋摩擦 | 半一致；但熨斗會讓人聯想「熱融膠融化」 | 不建議 |
| 蜘蛛吐絲從一點拉到另一點 | 邊放線邊移動 | 形狀一致；蜘蛛絲靠黏液，會誤導成「膠黏」 | 不建議 |
| 釘書機 | 往下壓 | **誤導**：釘書針是刺穿再折腳 | 不用 |
| 拉麵 | 拉線 | **誤導**：線不是被拉長拉細，線材出廠就這麼細 | 不用 |
| **「焊錫融化黏住」** | — | **錯誤**：打線沒有焊錫，焊墊也沒融化（只有成球那一下線端熔化） | 禁用；旁白要主動說「不是焊錫」 |

## 9. 分類（上片守則）
- **已確定**：流程位置（黏晶→打線→封膠）；線兩端（晶片焊墊→引腳／載板）；線材種類與 15～50 µm 線徑；銅線因成本取代金線、缺點（硬、易氧化需保護氣、易壓壞焊墊）；劈刀陶瓷、中間有孔；EFO 成球；熱＋壓＋超音波的固態接合、不是焊錫；60／120 kHz；球焊無方向、楔焊有方向；一條線的六步順序；K&S 雙總部；新川併入 Yamaha Robotics（2025/7/1）。
- **分析預期／產業說法（片中說「業界普遍認為」）**：打線仍是傳統與中階封裝、記憶體堆疊主力；高金價加速改用 PCC。
- **示意**：所有比喻；畫面裡的速度與尺寸比例。
- **尚未確定／查不到**：打線占封裝比例的最新可信數字；K&S 現行機型官方每秒條數；打線機專屬市占；台灣劈刀廠、台灣打線機廠；ASMPT 總部所在地的一手來源。

## 10. 適合念稿的白話數字（≤2 個）
1. **「一條線大約只有頭髮的三分之一粗」**（或「比頭髮細好幾倍」）
   依據：主流細線 15～25 µm〔[4] 高〕；頭髮常見 60～80 µm（Wolfram 2003 綜述，BioNumbers 收錄）〔[14] 中高〕→ 25 µm ÷ 70 µm ≈ 1／3，15 µm 時約 1／5。念「三分之一」是保守取法。**信心：高（線徑）×中高（頭髮）＝中高**。不要用「17～181 µm」那個頭髮範圍（原始出處是 1999 學生網頁）。
2. **「一秒大約打十條線」**
   依據：K&S RAPID Pro 實測 8.5 條／秒、ASMPT AB550 規格 9 條／秒、ESEC 3100 最高 17 條／秒、K&S 2004 機型 63 ms／條〔[10] 各為中〕。多來源落在 8～17，念「大約十條」不誇大。**信心：中**。要更準須開 K&S 官網規格（kns.com 本次連不到）。

## 11. 查不到／有疑義
1. **打線占封裝比例**：只有 SemiEngineering 引 TechSearch「75～80%」，文章日期在摘要看不到；UF 講義「球焊 93%」年代不明。→ 都不上片。〔低〕
2. **K&S 現行機型每秒條數**：官方新聞稿只寫相對提升（+10%、+20%）。〔查不到〕
3. **熱超音波溫度沒有單一「標準值」**：研究從 110 到 175 °C、舊專利寫 175～300 °C。念稿只說「一百多度」。〔中〕
4. **PCC 是否需要保護氣**：一份來源稱 PCC「不需要 forming gas」，但多數實務仍吹氮或氮氫氣，不同說法 → 念稿只說「銅線要吹保護氣」，不講 PCC 細節。〔有疑義〕
5. **ASMPT 總部**：只查到二手排名網站寫香港；集團在新加坡也有半導體事業據點。→ 念稿用「香港上市的 ASMPT」。〔中〕
6. **台灣劈刀廠、台灣打線機廠**：中英文搜尋都沒有可驗證的量產廠商。〔查不到〕
7. **ASE「最大封測、市占 19%」**：「最大」是業界共識，19% 年份不明，不上片。〔低〕
8. **bond finger（焊指）**：業界用語，專利多寫 contact pad／bond site；本次未取得權威定義原文。〔中〕
9. 網路限制：wikipedia、kns.com、amkor.com、semiengineering.com、uwaterloo.ca、thomasnet 無法開原文，上表相關條目只依搜尋摘要。

## 12. 來源
[1] University of Waterloo CAMJ：effectofefo_ap.pdf、2008_shah.pdf、2014_gomes.pdf（https://uwaterloo.ca/centre-advanced-materials-joining/sites/default/files/uploads/files/effectofefo_ap.pdf 等）——流程五步、EFO、參數、加熱台溫度、ESEC 3100 128 kHz、95% N₂＋5% H₂。
[2] Cal Poly：https://digitalcommons.calpoly.edu/ime_fac/43 、https://digitalcommons.calpoly.edu/theses/177 ——60 kHz 與 120 kHz。
[3] Fraunhofer（publica-rest.fraunhofer.de）——超音波破氧化層、≤150 °C；USPTO 5894983（傳統 60～100 kHz、175～300 °C）。
[4] Tanaka https://tanaka-preciousmetals.com/en/?p=119 ；Kaisertech https://kaisertech.co.uk/content/wire-bonding-in-microelectronics-your-bonding-wire-guide 、https://kaisertech.co.uk/pd-coated-copper-bonding-wire-pcc ；Neyco https://neyco.fr/en/our-products/materiaux/fils-de-bonding/bonding-wire ；Amkor https://amkor.com/technology/interconnect/ 。
[5] NTU 鍾志偉講義 https://personal.ntu.edu.sg/mzwzhong/Wire%20bonding%20using%20copper%20wire.pdf 、https://personal.ntu.edu.sg/mzwzhong/Copper%20Wire%20Bonding%20Concerns%20and%20Best%20Practices.pdf ；USPTO 8198737；https://dev.smtnet.com/library/files/upload/Copper-Wire-Bond-Failure-Mechanisms.pdf 。
[6] USPTO 6325269、6715658、7249702；Orbray https://www.orbray.com/en/product/jewel/product/capillary.html ；TOTO https://jp.toto.com/en/products/ceramics/bonding/ ；CoorsTek Gaiser https://www.circuitnet.com/news/uploads/2/Evolution_of_the_Ceramic_Capillary_CoorsTek_Gaiser.pdf ；SPT https://assets.testequity.com/te1/Documents/pdf/spt-bonding-capillaries-bonding-evolution-brochure.pdf 。
[7] USPTO 4653681（線夾）、6062462（EFO 成球大小）、7025243（焊頭）、6439448（換能器）。
[8] UF 講義 https://nrf.aux.eng.ufl.edu/_files/documents/3201.pdf ；TWI https://www.twi-global.com/technical-knowledge/faqs/what-is-wire-bonding ；NAVSEA Crane 微電路組裝文件。
[9] USPTO 4422568、7025243、8525040（線尾與拉斷）、5448165（反打）；Waterloo Jaesik Jay Lee 論文 https://uwspace.uwaterloo.ca/handle/10012/3858 （crescent／tail bond）。
[10] ASMPT AB550 https://semi.asmpt.com/en/products/opto-photonics/wire-bonding/wedge-bonding/ab550 ；Waterloo 設備頁 https://uwaterloo.ca/centre-advanced-materials-joining/node/479 ；IEEE SCV-EPS https://r6.ieee.org/scv-eps/wp-content/uploads/sites/58/2025/06/Aug-28-Basil.pdf ；Thomasnet https://news.thomasnet.com/fullstory/ic-ball-bonder-offers-35-29647 ；SEIPI https://seipi.org.ph/wp-content/uploads/2026/01/34TH-ANTS_ENHANCING-UNIT-PER-HOUR-UPH-FOR-XDFN-1X1-PCC-WIRE-DEVICES-VIA-DOE-METHODOLOGY.pdf 。
[11] SemiEngineering https://semiengineering.com/technology-advances-shortages-seen-for-wire-bonders 、https://semiengineering.com/wirebonding-is-here-to-stay ；Yole（edge-ai-vision 轉載）https://www.edge-ai-vision.com/2025/08/advanced-packaging-fuels-transformation-in-back-end-equipment-tcb-and-hybrid-bonding-to-lead-1-3-billion-market-expansion-by-2030/ ；World Gold Council https://www.gold.org/goldhub/research/gold-demand-trends/gold-demand-trends-q3-2026/technology 。
[12] ASE https://ase.aseglobal.com/ （Press Room）；eeNews Europe https://www.eenewseurope.com/en/infineon-ase-plan-to-utilize-copper-in-chip-wire-bonding/ ；Amkor TS105 https://amkormarcomexternal.blob.core.windows.net/amkordotcom/wp-content/uploads/2018/02/CopperWirebond_TS105.pdf ；K&S SEC https://www.sec.gov/Archives/edgar/data/56978/000005697824000024/klic-20240121.htm ；新加坡貿工部 https://www.mti.gov.sg/Newsroom/Speeches/2014/02/Mr-S-Iswaran-at-the-Opening-Ceremony-of-Kulicke-And-Soffas-Global-Headquarters ；Yamaha https://global.yamaha-motor.com/news/2025/0212/yrh.html ；ReportPrime https://www.reportprime.com/semiconductor-bonder-r3247/company 。
[13] Semiconductor Digest https://sst.semiconductor-digest.com/?p=35559 ；USPTO 9196557、8058098。
[14] BioNumbers https://bionumbers.hms.harvard.edu/bionumber.aspx?id=106856 （及 id=114258、116402）；Physics Factbook https://hypertextbook.com/facts/1999/BrianLey.shtml （僅作反例：17～181 µm 出處弱）。
[15] USPTO 11749653（NAND 階梯堆疊）；Allen Press 粗鋁線可靠度 https://meridian.allenpress.com/ism/article-abstract/2016/1/000234/187898/Reliability-of-Heavy-Gage-Aluminum-Wire-bonds 。

## 13. 庫力索法（K&S）畫面國旗的依據（2026/11/27 頻道負責人指示）
- 公司註冊地：美國賓州（Pennsylvania）；SEC 文件同列營運總部新加坡與美國賓州 Fort Washington，2014 年新加坡全球總部開幕（見 §7 來源）。信心：中高。
- 畫面處理：2D 卡用美國國旗，名牌旁小字註「國旗＝註冊地美國」；念稿不提總部所在地。
