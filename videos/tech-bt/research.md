# 3-9 BT 載板與 T-glass 缺料｜研究筆記

查證日期：2026/11/27（台灣時間）。查證方式：網路搜尋。**本次環境無法直接打開多數網頁**（trendforce.com、technews.tw、ctee.com.tw、tomshardware.com、mpbxchange.com 都連不到），所以下面多數條目根據搜尋結果摘要轉述，沒有逐字讀過原文；信心因此比讀過原文的低一級。上片前若網路允許，優先補讀：日東紡 IR 資料（2026/11/5 決算說明）、TrendForce 2025/11/24 T-glass 專文、Digitimes 2026/11/6 報導。

## 十行摘要（最適合上片、來源最穩的事實）

1. BT 樹脂是三菱瓦斯化學（MGC）在 1974 年開發的耐熱樹脂（雙馬來醯亞胺＋三嗪），1978 年前後專利與上市。
2. BT 載板＝玻纖布浸 BT 樹脂、壓上銅箔做成的「硬核心板」，再鑽孔、鍍銅、做線路、上防焊；主要用在記憶體、手機晶片、射頻模組。
3. ABF 載板的絕緣增層膜本身沒有玻纖布，線可以畫得更細，用在 CPU、GPU、AI 晶片；但 ABF 載板中間的核心板一樣要玻纖布。
4. 矽晶片的熱膨脹係數約 2.6–3 ppm/°C，一般有機載板約 15–20 ppm/°C；兩者熱脹冷縮不一樣，就會翹曲、焊點出問題。
5. T-glass（低熱膨脹玻纖布，Low-CTE）是一種高矽、高鋁、含鎂、不含硼的特殊玻璃纖維，比一般 E-glass 更不怕熱脹、更硬。
6. 日東紡（Nittobo）被多家媒體與研調引述占全球 T-glass 約九成。（媒體報導，引述 TrendForce／Tom's Hardware）
7. AI 晶片載板變大、層數變多，把 T-glass 優先吸走，BT 載板分到的料更少；高盛 2025 年 10 月報告預估 BT 用料有「兩位數百分比」短缺。（分析預期）
8. 蘋果、高通都被報導為了這塊布四處找貨（Nikkei Asia 2026/1 報導，MacRumors 等轉述）。
9. 日東紡 2026/11/5 說明會宣布再加碼約 200 億日圓（台灣＋福島），目標 2029 年度產能是 2025 年度的 3.6 倍；福島新廠預計 2027 年 7 月出貨。（媒體報導，引述日經）
10. 台玻的 Low-CTE 布已通過認證、開始出貨，董事長預估供不應求延續到 2027 年；中國也有廠商投資 T-glass，但認證進度不明。

### 可以放上畫面的說法（安全）
- BT 樹脂＝三菱瓦斯化學 1974 年開發（第 1 條）
- BT 載板＝玻纖布＋樹脂＋銅箔的硬核心；ABF＝不含玻纖布的增層膜，線更細（第 5–7、13–16 條）
- 矽約 3 ppm、載板約 15–20 ppm，熱膨脹不同會翹（第 22 條）：畫面可寫「矽 ≈3、一般載板 ≈15–20（ppm/°C）」
- T-glass 成分方向（高矽高鋁、含鎂、不含硼；第 20 條）——不寫精確百分比
- 「日東紡約占九成」要附「媒體報導」或「研調估計」標籤（第 27 條）
- 日東紡 2029 年度產能 3.6 倍（2025 年度為基準），標「公司說明會、媒體轉述」（第 31 條）
- 「AI 載板把 T-glass 吸走，BT 先缺」標「分析師普遍認為」（第 34 條）
- 玻璃基板：標「尚未量產（截至 2026/11/27）」（第 51–55 條）

### 不上畫面的數字
- 各家 BT 市占（景碩第一還是南電第一，說法互相矛盾）
- BT 漲價幅度（大和 70%、高盛 10%／38%／41%、單季 20–30%）——都是外資預估且互相差很多，且頻道不給投資建議
- 目標價、股價、營收
- T-glass 精確 CTE（2.8 ppm 是單一報導）、E-glass 約 5.5 ppm（本次沒找到來源）
- BT 交期 >70 週（單一法人報告轉述）

---

## A. BT 載板是什麼

1. BT 樹脂（Bismaleimide-Triazine，雙馬來醯亞胺–三嗪）由三菱瓦斯化學（MGC）於 1974 年開發，是用拜耳開發的三嗪樹脂（氰酸酯）和雙馬來醯亞胺熱聚合而成的耐熱熱固性樹脂｜日本熱硬化性樹脂工業會刊物（J-STAGE，networkpolymer 1984 年 5 卷 1 期），https://www.jstage.jst.go.jp/article/networkpolymer1980/5/1/5_23/_article｜信心：高｜狀態：已確定
2. BT 樹脂關鍵美國專利 US 4,110,364 屬三菱瓦斯化學，1978 年；另有資料稱 BT 樹脂 1978 年開始上市、MGC 1980 年代初開始供應積層板｜USPTO 專利與 Wikipedia「BT-Epoxy」條目，https://www.wikipedia.org/wiki/BT-Epoxy｜信心：中（上市年份各來源略不同）｜狀態：已確定（1974 開發）／上市年份以「1970 年代末」描述較安全
3. 化學結構：氰酸酯三聚成「三嗪環」，加上雙馬來醯亞胺的「醯亞胺環」，交聯密度高、耐熱；缺點是固化後偏脆，後來各家做改質｜USPTO 專利（BT 組成物相關，如 US 4456712、US 5886134）、Polymer Innovation Blog，https://polymerinnovationblog.com/?p=7835｜信心：中｜狀態：已確定
4. BT 基板的強項：耐高溫高濕（壓力鍋測試 PCT）、抗金屬離子遷移、耐熱、介電特性好、吸濕低｜USPTO 專利（thermosetting resin composition，US 8217099）｜信心：中（專利說法）｜狀態：已確定
5. MGC 自述：BT 積層板「以我們自己發明的 BT 樹脂為基礎」，廣泛用於 IC 塑膠封裝與高頻元件｜三菱瓦斯化學產品頁「Laminated materials for printed circuit boards (BT materials)」，https://d3nxinunz3v6qf.cloudfront.net/eng/products/sc/btprint｜信心：高（原廠）｜狀態：已確定
6. MGC 的產品分兩類：銅箔基板（核心板，型號前綴 CCL，例：CCL-HL832NX）與預浸材（prepreg，半硬化 B-stage，前綴 GHPL／GEPL，例：GHPL-830NX）｜同上 MGC 產品頁（搜尋摘要）｜信心：中｜狀態：已確定
7. 結構白話：玻纖布浸樹脂＝預浸材；預浸材疊起來、兩面壓銅箔、加熱固化＝銅箔基板（CCL，核心板）。載板就在這塊核心上做線路｜綜合 MGC 產品頁、Tom's Hardware 2026「state of ABF substrates」（核心是 glass-reinforced resin core，CCL 是結構骨幹），https://www.tomshardware.com/tech-industry/semiconductors/the-state-of-abf-substrates-in-data-center-silicon-in-2026-solving-the-supply-crunch-and-material-wall-beneath-every-ai-accelerator｜信心：中高｜狀態：已確定
8. 製程大致順序：核心板備料 → 鑽孔（BT 硬、難鑽，常用雷射加電漿除膠渣）→ 化學鍍銅、電鍍填孔 → 影像轉移做線路 → 疊壓更多層 → 防焊綠漆 → 表面處理（鎳金等）→ 檢查（對位、導通、翹曲）｜PCB 廠技術部落格（bestpcbs.com、JLCPCB blog）與 Sabancı 大學 HDI 論文，https://research.sabanciuniv.edu/42996/1/Ekin%20As%C4%B1m%20%C3%96zek.pdf｜信心：中（流程是通用 PCB 流程，細節依產品）｜狀態：已確定（概念層級）
9. 層數：記憶體、手機用 BT 載板常見 2–6 層左右（本次**沒有找到權威來源**，僅廠商部落格泛稱）｜bestpcbs.com 等廠商頁｜信心：低｜狀態：尚未確定（畫面不要寫層數）
10. BT 的玻纖布表面讓銅牙比較深，蝕刻細線較難控制，所以 BT 很難做到很細的訊號線（專利原文：難以達到 20/20 µm）｜USPTO 專利「Package substrate with dual material build-up layers」（US 7602062／US 8163642）｜信心：中｜狀態：已確定（物理原因）
11. 「超過七成的有機 IC 封裝載板用 BT 系統」——只有 PCB 業者行銷頁的說法，沒有方法論｜atlaspcb.com BT Resin IC Substrate，https://www.atlaspcb.com/materials/bt-resin-substrate/｜信心：低｜狀態：尚未確定（不上片）
12. BT 的 Tg（玻璃轉移溫度）：本次沒找到 MGC 官方數字；搜到的約 170°C 屬別的環氧／BMI 系統，不能用｜搜尋結果整理｜信心：低｜狀態：尚未確定（畫面只說「很耐熱」）

## B. BT 和 ABF 差在哪

13. ABF（味之素增層膜）是絕緣增層膜，本身不含玻纖布，方便雷射鑽微孔；玻纖在中間的核心板｜Polymer Innovation Blog「build-up films for flip chip substrates」，https://polymerinnovationblog.com/polymers-in-electronic-packaging-build-up-films-for-flip-chip-semiconductor-substrates-part-one/；Cadence PCB blog，https://resources.pcb.cadence.com/blog/why-ajinomoto-build-up-film-abf-is-used-in-ic-packaging｜信心：高｜狀態：已確定
14. 線寬線距大致：BT 減成法難低於約 40/40 µm、MSAP 約 25/25 µm；ABF 以 SAP 做增層可到約 18/18 µm（較舊專利）；Kyocera 2024 年 FCBGA 型錄：ABF 量產 9/12 µm、樣品 5/5 µm｜USPTO 專利 US 7707716；Kyocera FCBGA organic substrates 2024 型錄，https://spain.kyocera.com/uploads/eu/DB_SC_FCBGA_organic_substrates_A4_2024_web.pdf｜信心：中（數字依廠、依年份差很多）｜狀態：已確定（方向：ABF 線更細）；畫面只寫「ABF 線更細」
15. 習慣分工：FC-CSP（手機晶片等較小封裝）常用 BT；FCBGA（大顆 CPU／GPU）常用 ABF。不是硬規則｜USPTO 專利「Chip carrier and manufacturing method」（US 11227824）｜信心：中｜狀態：已確定（一般分工）
16. BT 載板營收主要來自記憶體與手機；韓國載板以 BT 為大宗（約 75%），應用以 DRAM、NAND 與手機 SiP、AiP、RF 模組為主；台、日主攻 ABF｜中央社 2023/6/2「台日聚焦ABF 韓廠攻BT板」，https://www.cna.com.tw/news/afe/202306020116.aspx｜信心：中高（2023 年資料）｜狀態：已確定（當時）
17. BT 用途：DRAM／NAND 封裝、記憶卡與 SSD 控制晶片、手機 AP、RF 模組、相機模組、LED｜綜合 TrendForce 2025/6 研究摘要（BT 延誤影響 SSD 控制晶片、手機與車用儲存封裝），https://www.trendforce.com/research/download/RP250624DC；中央社 2023｜信心：中高｜狀態：已確定
18. LG Innotek 自 2016 年起在 RF-SiP 載板市場居主導地位，FC-CSP 載板市占全球前段（以手機 AP 客戶為主），並拿到 GDDR7 用 FC-CSP 訂單｜Digital Today（韓）／Asiae 2026 報導，https://www.digitaltoday.co.kr/en/view/66298/lg-innotek-shifts-business-focus-from-smartphone-substrates-to-ai-servers｜信心：中｜狀態：已確定（媒體報導）
19. 成本：一般認知 ABF 高階載板比 BT 貴得多，但本次**沒有找到可引用的價差數字**｜—｜信心：低｜狀態：尚未確定（畫面不比價）

## C. T-glass：低熱膨脹玻纖布

20. 成分（約略，重量比）：T-glass 約 SiO₂ 64–66%、Al₂O₃ 24–26%、MgO 9–11%、不含 B₂O₃；E-glass 約 SiO₂ 52–56%、Al₂O₃ 12–16%、CaO 20–25%、B₂O₃ 5–10%｜Isola「Glass Fabric」簡報（2022），https://www.isola-group.com/wp-content/uploads/Isola-Glass-Fabric-04_2022.pdf（搜尋摘要表格對齊有亂，需看原檔）｜信心：中｜狀態：已確定（方向）；精確百分比不上片
21. T-glass 熱膨脹小、模數高（硬），缺點是空心纖維較多、比較難做；E-glass 與 L-glass 熱膨脹匹配差、模數低｜USPTO 專利（glass composition with low CTE，US 8728964 一類）｜信心：中｜狀態：已確定
22. 矽的熱膨脹係數約 2.6（部分資料 3.2）ppm/°C；有機載板約 15–20 ppm/°C；兩者差太多是封裝翹曲的根本原因，翹曲會讓焊球沒焊上或彼此短路｜USPTO 專利（US 8877552 等）、ECTC 2015 論文，https://www.lamar.edu/engineering/_files/documents/mechanical/dr.-fan-publications/2015/ECTC%202015%20SHen.pdf；Semiconductor Engineering「Controlling Warpage In Advanced Packages」，https://semiengineering.com/controlling-warpage-in-advanced-packages｜信心：高｜狀態：已確定
23. 用低膨脹材料降低載板等效 CTE，整個封裝的翹曲會變小（但載板本身可能比較容易翹，所以要搭配設計）｜IBM Research「Effects of low CTE materials on thermal deformation of organic substrates」，https://research.ibm.com/publications/effects-of-low-cte-materials-on-thermal-deformation-of-organic-substrates-in-flip-chip-package-application｜信心：高｜狀態：已確定
24. 實際板材差異範例：Panasonic 低 CTE 載板材料 R-G515S 的 X-Y 方向 CTE 約 4–6 ppm/°C，同系列用一般玻纖布約 6–8；R-1515V 約 3–5｜Panasonic 產品頁，https://industrial.panasonic.com/ww/products/pt/lexcm-gx/lexcmgxrg515｜信心：高（原廠，但這是板材值不是纖維值）｜狀態：已確定
25. 日東紡現行 T-glass 熱膨脹約 2.8 ppm，下一代預計改善約 30% 到 2.0 ppm，2028 年推出，客戶可能包括 NVIDIA、Apple｜TrendForce 2026/2/4（引述日經），https://www.trendforce.com/news/2026/02/04/news-nittobo-reportedly-plans-2028-next-gen-t-glass-customers-may-include-nvidia-apple-and-others/｜信心：中（媒體轉述）｜狀態：分析預期（下一代）
26. 另一類特殊布是「低介電（Low-Dk／Low-Df）」：NE-glass、Low-Dk1／Dk2、石英布 Q-glass，目的在高速訊號少損耗，用在伺服器主機板、交換器板；T-glass 目的則是尺寸穩定、不翹。Q-glass 性能最好但最貴、太硬傷鑽孔良率，尚未大量採用｜TrendForce 2025/11/24「What is glass fiber fabric and why is T-glass critical for AI servers」，https://www.trendforce.com/news/2025/11/24/news-what-is-glass-fiber-fabric-and-why-is-t-glass-critical-for-ai-servers-a-deep-dive/（無法直接開啟，依摘要）｜信心：中｜狀態：已確定（分類）／Q-glass 普及：尚未確定

## D. 為什麼缺、缺多久

27. 日東紡約占全球 T-glass 市場九成（另一說 NER-glass 約 60–70%）｜TrendForce 2026/2/4；Tom's Hardware（Fukushima 擴產報導），https://www.tomshardware.com/tech-industry/shortages-of-crucial-chip-packaging-material-threatens-ai-accelerator-supply-chains-nittobos-fukushima-plant-is-tripling-capacity-but-itll-take-years-before-market｜信心：中（研調估計，非官方；另有部落格說 100%，不採用）｜狀態：媒體報導／研調估計
28. 缺料從 2024 年底就開始影響先進封裝｜Digitimes 2025/7/9，https://www.digitimes.com/news/a20250709PD210/substrate-cowos-2024-supply-chain-expansion.html｜信心：中｜狀態：已確定（媒體報導）
29. 2025 年 5 月：Tom's Hardware 報導 MGC（BT 原料最大供應商）交貨延遲，可能使 NAND 快閃記憶體控制晶片供應吃緊、成本上升，起因是台積電先進封裝需求排擠｜Tom's Hardware「AI chip boom sparks BT substrate materials shortage」，https://www.tomshardware.com/tech-industry/semiconductors/ai-chip-boom-sparks-bt-substrate-materials-shortage-tsmcs-huge-demand-causes-supply-disruptions-for-nand-flash-controllers-ssds｜信心：中｜狀態：媒體報導
30. 日東紡 2025 年 8 月宣布：在福島投資約 150 億日圓蓋玻纖布新廠，原規劃 2028 年度產能為 2025 年度的 3 倍，新廠 2027 年 7 月出貨；計畫獲日本經濟安全保障供應確保計畫與福島補助｜MarketScreener 轉載日東紡公告「Notice Regarding Expansion of Glass Cloth Production Capacity」，https://www.marketscreener.com/news/nitto-boseki-notice-regarding-expansion-of-glass-cloth-production-capacity-ce7c50dcd18ff226；聯合報「日東紡宣布高階載板玻纖布三倍大擴廠」，https://udn.com/news/story/7240/8972038｜信心：中高（有公司公告）｜狀態：已確定（計畫）
31. 日東紡 2026/11/5 決算說明會：再加碼約 200 億日圓擴充台灣與福島設備，目標 2029 年度 T-glass 產能為 2025 年度的 3.6 倍；年度營收目標由 1,410 億日圓上修到 1,430 億日圓（8 月後第二次上修）；社長說 2030 年度以後要更大規模投資，仍在評估｜Digitimes 2026/11/6「Nittobo's T-Glass supply crunch deepens despite 3.6-fold capacity expansion plan」，https://www.digitimes.com/news/a20261106VL215/nittobo-production-investment-materials-expansion.html；科技新報財經 2026/11/6，https://finance.technews.tw/2026/11/06/fiberglass-cloth-boom-nitto-boseki-raises-forecast-boosts-t-glass-expansion/（兩者都無法打開，依摘要）；iNEWS 轉述｜信心：中（多家媒體一致，未見官方簡報原文）｜狀態：已確定（公司宣布的目標）／能否達成：尚未確定
32. 日東紡 2026/10：Low-CTE 玻纖布供不應求、產線滿載，社長說需求大到擴產趕不上｜科技新報 2026/10/6「玻纖布廠日東紡：T-Glass 供不應求、滿載生產」，https://technews.tw/2026/10/06/nittobo-t-glass-lines-running-at-full-capacity/（依摘要）｜信心：中｜狀態：已確定（公司表態，媒體轉述）
33. 價格：日東紡 2026/8 表示先前規劃的漲價已大致實施完成、目前沒有追加漲價計畫（5 月也說維持期初價格）；若中東局勢讓能源成本居高才會再評估｜TrendForce 2026/8/6「Nittobo Raises FY2027 Net Profit Forecast by JPY 3B; No Further T-Glass Price Hikes Planned」，https://www.trendforce.com/news/2026/08/06/news-nittobo-raises-fy2027-net-profit-forecast-by-jpy-3b-no-further-t-glass-price-hikes-planned/；工商時報 2026/5/23，https://www.ctee.com.tw/news/20260523700479-430502｜信心：中｜狀態：已確定（公司表態）
34. 高盛（2025/10）：AI 客戶把 T-glass 拉去做高階 ABF 載板，BT 載板拿不到同樣的料，未來數月到數季 BT 用 T-glass 會有「兩位數百分比」短缺，衝擊手機 SoC｜Wccftech 2025/10「A Key Component For Smartphone SoCs Now Faces Prolonged Double-Digit Percentage Shortage」，https://wccftech.com/a-key-component-for-smartphone-socs-now-faces-prolonged-double-digit-percentage-shortage/；科技新報 2025/10/8｜信心：中｜狀態：分析預期
35. 一般 E 級玻纖布多用在低層數 ABF、BT、PCB；AI 伺服器高層數 ABF 與高層數 PCB 用 Low-Dk 等高階布｜投資媒體整理（搜尋摘要，來源 ctee／wantrich 2025）｜信心：低中｜狀態：已確定（概念）
36. 蘋果、高通找料：Nikkei Asia 報導蘋果派人到日本、進駐日東紡的客戶三菱瓦斯化學；高通接觸較小的供應商 Unitika（產量遠小於日東紡）｜MacRumors 2026/1/14「Apple Struggling With Key Material Shortage」，https://www.macrumors.com/2026/01/14/apple-struggling-with-key-material-shortage/；9to5Mac 2026/1/13｜信心：中（二手轉述日經）｜狀態：媒體報導
37. NVIDIA、Microsoft、Google、Amazon 被報導已預訂日東紡今年大部分高階玻纖布產能；NVIDIA、AMD 曾派人到日東紡總部｜Tom's Hardware「Glass cloth could be the next great AI shortage」，https://www.tomshardware.com/tech-industry/artificial-intelligence/glass-cloth-could-be-the-next-great-ai-shortage-as-major-manufacturers-scramble-to-secure-critical-material-japanese-manufacturer-courted-by-apple-nvidia-google-and-amazon（引述日經；無法打開）｜信心：中｜狀態：媒體報導
38. 元大分析師：供應商已不再給交期｜同上 Tom's Hardware（摘要）｜信心：低中｜狀態：媒體報導
39. AI 載板越做越大：Counterpoint 指出規格走向超過 100×100 mm、層數 20+ 到 40+；載板越大，核心層的 T-glass 用量跟著加倍｜Counterpoint「From T-Glass Crisis to Capacity Erosion: The Multi-Year Substrate Shortage」，https://counterpointresearch.com/en/reports/From-T-Glass-Crisis-Capacity-Erosion-The-Multi-Year-Substrate-Shortage；Tom's Hardware 2026 ABF 專文｜信心：中（研調摘要）｜狀態：分析預期
40. 南亞塑膠與日東紡合作：到 2027 年由南亞代織日東紡全球特殊玻纖布的約 20%；日東紡供應南亞第二代低介電玻纖紗原料｜TrendForce 2025/11/28「Nittobo Expands Glass Fiber Output with Nan Ya」，https://trendforce.com/news/2025/11/28/news-nittobo-expands-glass-fiber-output-with-nan-ya-nan-ya-to-handle-20-by-2027-amid-ai-surge；Digitimes 2025/11/30｜信心：中高（雙方宣布）｜狀態：已確定（計畫）
41. 日東紡在台子公司福隆玻璃纖維在嘉義民雄工業區增設 T-glass 產線，2026 年 2 月舉行量產典禮；日東紡另規劃台灣產能到 2028 年 3 月比 2025 年翻倍｜自由財經「日東紡在台擴充T-Glass產能 福隆玻纖公司供應鏈啟動」，https://ec.ltn.com.tw/article/breakingnews/5340179；TrendForce 2026/2/4（引述日經）｜信心：中｜狀態：已確定（媒體報導）
42. 台玻：T-glass（Low-CTE）已通過國內外客戶認證、出貨；2026 年投入約 20 億元擴產 Low-Dk 與 Low-CTE；董事長林伯豐預估供不應求延續到 2027 年｜鉅亨網「台玻T-glass獲認證、高階玻纖布持續出貨」，https://news.cnyes.com/news/id/6633660；工商時報 2026/10/21「供應吃緊 台玻、富喬點火」，https://www.ctee.com.tw/news/20261021700283-439901｜信心：中｜狀態：已確定（公司說法）／量能大小：尚未確定
43. 富喬：低熱膨脹產品（FLE）2025 年第四季小量出貨、擴大認證，2026 年 7 月仍在優化生產學習曲線；**沒找到已正式通過大客戶認證的公告**｜搜尋摘要（富喬法說，2025Q3、2026/7）｜信心：低｜狀態：尚未確定（截至 2026/11/27）
44. 中國：中材科技旗下泰山玻纖的低 CTE 布產能被稱為中國國內第一；光遠新材 2026/7 被報導投資約 10 億美元在河南擴 T-glass 與低介電布；中國巨石擴電子布。另有台灣報導說中國廠良率與穩定度仍落後｜TrendForce 2026/7/3「China's Chip Material Suppliers Challenge Japanese Dominance; Guangyuan Invests US$1B in T-Glass」，https://www.trendforce.com/news/2026/07/03/news-chinas-chip-material-suppliers-challenge-japanese-dominance-guangyuan-invests-us1b-in-t-glass/；CompositesWorld（Kingboard、Jushi），https://www.compositesworld.com/news/kingboard-jushi-ramp-up-glass-fiber-output-as-ai-reshapes-pcb-demand｜信心：中低｜狀態：尚未確定（哪家通過哪個客戶認證不明）
45. BT 載板漲價：台灣載板廠 2025 年 7 月起調漲 BT 報價，記憶體相關品項（DDR4／DDR5、控制 IC）漲幅被報導高達 25%｜TrendForce（?p=42467，依摘要）；投資媒體｜信心：中低｜狀態：媒體報導（數字不上片）
46. 2026 年外資對 BT 漲價看法分歧：大和預估 2026 年 BT 漲逾 70%、第三四季單季 20–30%；高盛預估 2026 年 BT 均價約漲 10%、供需缺口擴大到 2028；美系外資認為第四季只有個位數｜工商時報 2026/7/17、旺得富 2026/7/16、2026/10/16（依摘要）｜信心：低（預估互相矛盾）｜狀態：分析預期（**不上片**）
47. 南電法說：BT 相關原物料漲勢趨緩，目前無意自 2026 年第 4 季再調漲 BT 載板價格；ABF 用的 T-glass 仍吃緊；另一份法人報告說南電 BT 訂單交期超過 70 週、第四季仍在議價｜經濟日報 money.udn.com/money/story/5607/9731359；旺得富 2026/9/16（依摘要，日期未完全確認）｜信心：中低｜狀態：已確定（公司說法）／交期：分析師說法
48. 有外資報告稱亞洲已有兩家載板廠停接部分 BT 訂單，把共用製程產能轉去 ABF；部分韓台廠退出一般型 BT 市場｜科技新報財經 2026/7/14、旺得富 2026/7/16（依摘要）｜信心：低｜狀態：分析師說法（不點名、不上片）

## E. 主要廠商

49. 台灣：景碩（Kinsus）、南電（Nan Ya PCB）、欣興（Unimicron）都同時做 ABF 與 BT。外資報告引述的 BT 占營收比重：景碩約 33%、南電約 28%、欣興約 13%（景碩 2025/8 自述 ABF 約四成、BT 三到四成）｜旺得富 2026/7/16（大和報告轉述）；經濟日報 2025（景碩說明）；口袋學堂（南電 BT 約 30%）｜信心：中（比重數字是報告轉述）｜狀態：已確定（三家都做 BT）／比重不上片
50. 誰是 BT 第一名：來源互相矛盾（有說景碩、有市調說南電約 15%）；以國家算，2025 年韓國 BT 載板合計約 36.4% 居首、台灣約 29.4% 第二（市調摘要）。韓國主要 BT 廠：Simmtech（記憶體模組板、DRAM BOC 板自稱全球市占第一）、LG Innotek（FC-CSP／RF-SiP）、Daeduck；日本 Ibiden、Shinko 以 ABF/FCBGA 為主｜BigGo Finance 市調摘要、SEMI 會員目錄 Simmtech 頁，https://www.semi.org/en/resources/member-directory/simmtech；MIDA（馬來西亞投資局）Simmtech 介紹｜信心：低（排名）／中（名單）｜狀態：尚未確定（**畫面不寫「第一名」**，只寫「台灣、韓國是 BT 主要產地」）
51. 材料端：BT 樹脂與 BT 銅箔基板＝三菱瓦斯化學（被稱為 BT 原料最大供應商，並在泰國子公司擴充預浸材設備）；玻纖布＝日東紡為主，台玻、南亞、富喬、中國廠追趕｜Tom's Hardware 2025/5（MGC 為最大 BT 原料供應商）；ChemXplore「MGC expands BT materials production at MGC Electrotechno Thailand」，https://chemxplore.com/news/bt-materials-capacity-expansion-thailand｜信心：中｜狀態：已確定

## F. 下一集鉤子：玻璃基板

52. 玻璃基板（glass core substrate）＝把載板中間的「玻纖布＋樹脂」有機核心，換成一整片玻璃；玻璃更平、更硬、熱膨脹可調得接近矽｜Intel 2023/9/18 新聞稿（Business Wire），https://www.businesswire.com/news/home/20230918184888/en｜信心：高｜狀態：已確定（概念）
53. Intel 2023 年說完整玻璃基板方案在「這個十年的後半」上市；2026 年 1 月在 NEPCON Japan 展出搭配 EMIB 的厚核心玻璃基板；2025/8 曾有將技術授權外部的報導，Intel 否認放棄研發｜Intel 2023 新聞稿；TrendForce（?p=52267）；TechPowerUp 2025/8/22，https://www.techpowerup.com/340210/intel-wont-abandon-glass-substrates-will-license-tech-to-externals｜信心：中｜狀態：已確定（展示）／量產時程：尚未確定
54. SKC 旗下 Absolics：2026 年第一季產出量產樣品、目標 2026 年底量產（時程曾從 2024 下半年一路延後）；三星電機 2026/7 與東友精細化工成立合資公司做玻璃核心，目標 2027 下半年量產｜TrendForce 2026/4/15「Korea Challenges Intel on Glass Substrate Standards as Absolics, Samsung Accelerate」，https://www.trendforce.com/news/2026/04/15/news-korea-challenges-intel-on-glass-substrate-standards-as-absolics-samsung-accelerate-commercialization/｜信心：中｜狀態：分析預期
55. 截至 2026/11/27，沒有查到任何一家已正式商業量產玻璃核心載板｜IRZ「Three years after Intel's promise, glass chip substrates still have no commercial product」，https://irz.fr/en/articles/verre-remplace-pas-encore-organique-en/｜信心：中｜狀態：尚未確定（截至 2026/11/27 尚未量產）
56. 友達董事長彭双浪：玻璃基板約 2–3 年成熟，進入 AI 先進封裝供應鏈｜BigGo Finance 報導，https://finance.biggo.com/news/a80c0af2-ba7c-4f14-bd43-53736a203370｜信心：中低｜狀態：分析預期

## G. 比喻候選（對應的物理）

57. **鋼筋混凝土**：玻纖布＝鋼筋、樹脂＝水泥、銅箔＝牆上的水電管線。物理：纖維撐住強度與尺寸，樹脂把纖維黏成一體並絕緣｜比喻，非事實陳述｜—｜—
58. **布做的骨架／繡花繃**：玻纖布像繃緊的布，讓整塊板「不縮不脹」；T-glass＝特別不怕熱的布。物理：低 CTE、高模數抑制面內膨脹｜比喻｜—｜—
59. **烤鬆餅黏烤盤**：矽晶片（約 3 ppm）和載板（約 15–20 ppm）一起受熱，一個脹得少一個脹得多，就像貼在一起的兩張紙一熱就捲起來（雙金屬片原理）＝翹曲｜比喻（物理＝熱膨脹不匹配造成彎曲，雙金屬片效應）｜—｜—
60. **夾心餅乾**：核心板是中間硬的餅乾，ABF 增層膜是兩面一層層塗上去的奶油（細線畫在奶油上）；BT 載板是「整片都是加了布的餅乾」。物理：增層膜無玻纖、易雷射鑽孔與細線；BT 有玻纖、硬但線較粗｜比喻｜—｜—
61. **大家搶同一家麵粉**：AI 載板、手機、記憶體都要同一種特殊布，最大的那家（約九成）產量只能慢慢加，大客戶先拿走，小訂單排隊。物理／經濟：單一供應商＋擴產週期長（新廠約 1.5–2 年）｜比喻｜—｜—

## 未能開啟的網站（需要網路權限才能補讀）
www.trendforce.com、technews.tw／finance.technews.tw、www.ctee.com.tw、www.tomshardware.com、www.mpbxchange.com。以上條目依搜尋摘要撰寫。

## 上片前待查（建模時列入，2026/11/28）
- [ ] 日東紡 IR 原文（2026/11/5 決算說明會資料）：確認「再加碼約 200 億日圓、2029 年度產能為 2025 年度 3.6 倍」與台灣（嘉義）、福島兩地擴廠的原文說法（第 31、41 條目前只依媒體摘要）。
- [ ] TrendForce 2025/11/24 T-glass 專文、2026/2/4「約九成」原文：確認「約九成」的口徑（全球 T-glass 市占、研調估計），決定畫面標「媒體報導」或「研調估計」（第 26、27 條）。
- [ ] 台玻低膨脹布「通過認證、出貨」的最新說法（第 42 條；鉅亨網、工商時報）。
- [ ] 各公司官方 LOGO 原檔（日東紡、台玻、景碩、南電、欣興）：目前用文字名牌，見 assets.md。
