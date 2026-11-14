# short-tech 研究筆記：「兩奈米」不是尺寸（查證日 2026/11/14）

題目：手機晶片說的「兩奈米」到底是什麼？從手機一路放大到電晶體，拆開一顆奈米片電晶體看真實尺寸。
畫面：Powers of Ten 式的無限縮放（手機 → 主機板 → 晶片 → 電晶體陣列 → 一顆電晶體）＋ 3D 爆炸圖＋深色科技 HUD。

## 旁白用到的事實

| # | 旁白說法 | 事實 | 狀態 | 來源 |
|---|---|---|---|---|
| F1 | 「兩奈米，不是量得到的尺寸」 | 製程節點名稱大約從 1990 年代末起就不再對應閘極長度或任何實際尺寸，現在是世代名稱。IBM 自己的 2 奈米發表也說明「2nm」不指晶片上某個實際尺寸。Intel 前執行長 2021 年也公開說業界的命名「不再對應任何特定量測」。 | 已確定 | WikiChip「Technology node」：https://en.wikichip.org/wiki/technology_node ；NY CREATES 轉述 IBM 發表：https://ny-creates.org/ibm-research-debuts-2nm-test-chip-with-50-billion-transistors/ ；SDxCentral（Intel 改名）：https://www.sdxcentral.com/articles/news/intel-ceo-calls-nanometers-meaningless-rebrands-process-tech/2021/07/ |
| F2 | 「手機晶片，裡頭上百億個電晶體」 | Apple A17 Pro（2023，3 奈米世代）官方公布約 190 億個電晶體；前一代 A16 約 160 億。片中不講品牌，只說「上百億」。 | 已確定 | Apple Newsroom iPhone 15 Pro 發表（2023/9/12）；整理見 https://en.wikipedia.org/wiki/Apple_A17 、Tom's Hardware https://tomshardware.com/news/apple-a17-pro-3nm-iphone-15-pro |
| F3 | 「是三片疊起的薄片」（奈米片、閘極全環繞） | IBM 2021/5/6 發表的 2 奈米試作晶片：每顆電晶體是三層奈米片（nanosheet），閘極從四面包住（GAA）。台積電 N2 也是第一個用奈米片 GAA 電晶體的世代，官網寫 2025 第四季如期量產。 | 已確定 | IBM Newsroom：https://newsroom.ibm.com/2021-05-06-IBM-Unveils-Worlds-First-2-Nanometer-Chip-Technology,-Opening-a-New-Frontier-for-Semiconductors ；HPCwire：https://www.hpcwire.com/2021/05/06/ibm-research-debuts-2nm-test-chip-with-50-billion-transistors/ ；TechSpot（台積電 N2 量產）：https://www.techspot.com/news/110755-tsmc-2nm-n2-process-officially-enters-volume-production.html ；Tom's Hardware：https://tomshardware.com/tech-industry/semiconductors/tsmc-begins-quietly-volume-production-of-2nm-class-chips-first-gaa-transistor-for-tsmc-claims-up-to-15-percent-improvement-at-iso-power |
| F4 | 「一片五奈米厚，間距四十四奈米」 | IBM 2 奈米試作晶片：奈米片每片寬約 40nm、高（厚）約 5nm；閘極間距（pitch）約 44nm；閘極長度約 12nm。 | 已確定（IBM 試作晶片的公開數字） | HPCwire 同上；AnandTech「IBM Creates First 2nm Chip」報導 44nm 閘極間距、12nm 閘極長度（anandtech.com 這個環境連不到，數字由 HPCwire 與搜尋摘要交叉確認） |
| F5 | （畫面）HUD 尺寸刻度 | 手機約 15 cm；晶片一片約 1 cm（指甲大小，IBM 用語 fingernail-sized）；奈米片 40nm × 5nm；閘極間距 44nm。 | 已確定（量級） | 同上 |

## 寫稿時的分寸

- 片中數字（5nm、44nm）是 **IBM 2021 公開的 2 奈米試作晶片**，不是某一支手機或台積電 N2 的量測值：出處列寫清楚。
- 台積電沒有公開 N2 的閘極間距（搜尋只找到 IEDM 2024 論文標題，沒有全文數字）：**截至 2026/11/14 尚未確定**，片中不寫台積電的尺寸、不說「你手機裡的就是 44 奈米」。
- 「上百億」用的是 A17 Pro（3 奈米世代）的官方數字；不說是兩奈米手機晶片的數字。
- 3D 電晶體模型是示意，比例照 IBM 數字（片厚 5、片寬 40、間距 44），不是電子顯微鏡照片。
- 結尾「怎麼印上去？」預告的是光刻（IBM 試作晶片前段用 EUV 曝光，HPCwire／IBM Research 頁有寫），下一支要再查。

## 沒用到但查過的

- 台積電 N2 相對 N3E：同功耗效能 +10–15%、同效能功耗 −25–30%、混合設計密度 +15%（公司目標值）。
- IBM 試作晶片「指甲大小放 500 億個電晶體」：是試作晶片，不是手機晶片，所以旁白不用。
- 坊間常見「N2 閘極間距 45nm／48nm」：48nm 是台積電 CFET 研究，45nm 是 Intel RibbonFET 研究，都不是 N2，不用。

## 2026/11/14 複查
- F3／F4 再用 WebSearch 確認：三層奈米片、每片約 5nm 厚 × 40nm 寬、閘極長 12nm、間距 44nm、整疊約 75nm 高；IBM 也說「2nm」不對應晶片上任何實際尺寸。來源：Tom's Hardware https://www.tomshardware.com/news/ibm-unveils-worlds-first-2nm-chip-with-nanosheet-tech-intel-and-samsung-to-benefit ；Semiconductor Digest https://www.semiconductor-digest.com/ibm-unveils-worlds-first-2-nm-chip-technology/ ；SemiWiki https://semiwiki.com/semiconductor-manufacturers/tsmc/298875-is-ibms-2nm-announcement-actually-a-2nm-node/ 。另一篇 Semiconductor Digest 寫片寬約 14nm，和其他來源的 40nm 不合，判定為筆誤，不採用。
- 同一批報導寫這顆試作晶片前段製程首次用 EUV 曝光：結尾預告「怎麼印？」（光刻）有根據，下一支再細查。

## 2026/11/14 第二版：奈米片電晶體的結構與開關（補素材細節與運作動畫用）

查法：WebSearch（只拿得到搜尋摘要）。**打不開的站**：`www.imec-int.com`、`www.allaboutcircuits.com`（這個環境的網路白名單沒有，WebFetch 直接失敗）；`anandtech.com` 先前也連不到。下面凡是寫「搜尋摘要」的，都沒有讀到原文全文。
狀態分三種：**已確定**（多個來源一致、屬教科書等級）／**示意簡化**（結構存在，但片中的形狀、厚度、顏色是自己畫的）／**沒查到**（片中不講、不標）。

### 各部位（3D 模型與圖例用）

| 部位（圖例名稱） | 真實情況 | 片中怎麼畫 | 狀態 | 來源 |
|---|---|---|---|---|
| 矽基板 | 矽晶圓；片堆正下方留一條凸起的矽（sub-fin） | 深灰藍底板＋中間一條淺一階的矽 | 已確定／形狀示意 | IEEE Spectrum 2019（Ye、Ernst、Khare）；Semiconductor Engineering |
| 隔離氧化層（淺溝槽隔離 STI） | 相鄰元件之間挖溝填氧化物，互相絕緣 | 矽條兩側各一條深藍氧化物 | 已確定／厚度示意 | 同上（製程通則） |
| 奈米片通道 | 先長一疊矽／矽鍺交替的磊晶層，再把矽鍺蝕刻掉，留下懸空的矽薄片；IBM 試作晶片每顆三片，片厚約 5 nm、片寬約 40 nm | 三片青色薄片，只存在於閘極與間隔層底下（源極／汲極之間） | 已確定（三片、5 nm、40 nm 是 IBM 試作晶片數字） | IEEE Spectrum 2019；IEEE Spectrum（Intel stacked nanosheets，Samuel K. Moore）；F3／F4 的來源 |
| 源極／汲極 | 在薄片兩端磊晶長出來的摻雜矽（或矽鍺），和每一片的端面相接 | 兩塊藍色方塊（真實外形有斜面，畫成方塊） | 已確定／形狀示意 | Semiconductor Engineering「What's different about next-gen transistors」（搜尋摘要）；USPTO 專利 10903317 等 |
| 高介電層 | 包住每一片通道的閘極介電層，常見材料是氧化鉿（HfO₂）一類，底下還有一層很薄的界面氧化層 | 每片薄片外面一圈半透明紫色套子 | 已確定（材料類別）／厚度示意；**實際厚度沒查到可靠數字，片中不標** | USPTO 專利 11069577、10553495（搜尋摘要：high-k 如 HfO₂、功函數金屬如 TiN） |
| 閘極金屬 | 功函數金屬（例如 TiN 一類）加填充金屬，填滿片與片之間並包住上下左右四面；IBM 試作晶片閘極長約 12 nm | 金色「梳子」：上方一塊、兩側各一根柱、片與片之間的夾層 | 已確定（四面包住、12 nm）／分件方式是示意 | IEEE Spectrum 2019；專利同上 |
| 內側間隔層 | 片與片之間、閘極和源極／汲極之間的絕緣塊，把兩者隔開並降低寄生電容；也在挖掉矽鍺時保護源極／汲極 | 綠色小塊，夾在薄片之間的兩端 | 已確定 | USPTO 專利 10903317、11195912、11374128；Semiconductor Engineering（搜尋摘要） |
| 間隔層（閘極側壁） | 閘極兩側的絕緣側壁 | 半透明灰藍色薄牆 | 已確定／厚度示意（有分析者估 IBM 試作晶片約 5 nm，是作者自己估的，不是 IBM 公布，片中不標） | SemiWiki（F4 複查的那篇） |
| 接點 | 源極／汲極上方的金屬接點，底下有一層矽化物降低電阻；金屬常見鎢、鈷，最窄處有用釕 | 銀灰色長條；閘極另有一顆小接點。矽化物沒畫 | 已確定（材料類別，專利文獻）／形狀示意 | USPTO 專利 10204828（Co、Ru 取代 W）、nanosheet trench silicide 專利（搜尋摘要） |
| 銅連線 | 接點上方的第一層金屬線，往上還有十幾層 | 三條銅色短線（源極、汲極、閘極各一條），只畫一層 | 示意簡化（先進製程最底層金屬不一定是銅，**沒查到 2 奈米世代的確定材料**，圖例只寫「銅連線」是泛稱） | 沒有專門來源 |

沒畫的：底部介電隔離（IBM 試作晶片有，Semiconductor Digest 轉述 IBM：靠它才能把閘極縮到 12 nm）、層間介電質（零件之間其實填滿絕緣材料，畫了就看不到裡面）、矽化物、上面十幾層金屬。

### 典型尺寸量級

| 項目 | 數字 | 狀態 |
|---|---|---|
| 片厚 | 約 5 nm（IBM 試作晶片）；專利文獻常見 5–9 nm | 已確定（IBM）／量級 |
| 片寬 | 約 40 nm（IBM 試作晶片） | 已確定（IBM） |
| 片與片的垂直間距 | 專利文獻寫 5–15 nm，另有來源寫最小約 7–8 nm | 量級；**IBM 試作晶片沒查到**，模型用 5 nm 的空隙是示意 |
| 閘極長 | 約 12 nm（IBM） | 已確定（IBM） |
| 閘極間距 | 約 44 nm（IBM）；imec 路線圖 2 奈米級約 48 nm（Tom's Hardware 轉述 imec 2026 路線圖） | 已確定（IBM）／路線圖數字 |
| 工作電壓 | **沒查到** IBM 試作晶片的電壓 | 片中只標「低／高」，不標伏特數 |

### 怎麼開、怎麼關

| # | 片中的說法／畫法 | 事實 | 狀態 | 來源 |
|---|---|---|---|---|
| O1 | 「閘極加上電壓，電子就穿過這三片」；Vg 條由低到高、中間閘極亮起、薄片表面亮起一層、光點由源極流到汲極 | 閘極電壓超過臨界電壓時，閘極正下方聚集電子形成反轉層，這一層就是源極和汲極之間的通道；n 型元件的載子是電子，從源極出發、在汲極離開（「源極」就是載子的來源） | 已確定（教科書） | Toshiba 半導體 FAQ「How do n-channel MOSFETs work」；NPTEL MOSFET 講義；Wikipedia MOSFET |
| O2 | 小標「電子 e⁻ →」「電流方向 ←」 | 電流方向的慣例是正電荷移動的方向，所以和電子流相反：n 型元件電子由源極到汲極，電流由汲極到源極 | 已確定（電學慣例；搜尋結果沒有直接寫這一句，屬通則） | 通則 |
| O3 | 「電壓降下就關」；Vg 條降回低、通道那一層消失、光點停住淡出 | 閘極電壓低於臨界電壓時沒有反轉層，源極與汲極之間不導通（實際上仍有很小的漏電流，不是零） | 已確定 | 同 O1 |
| O4 | 「四面包住，漏電更少」；對照卡：鰭式（閘極包三面）底部有幾顆漏電小點，奈米片（包四面）只剩一顆淡淡的 | 鰭式的閘極包住鰭的上面和兩側，底部連著基板，是漏電路徑；奈米片每一片四面都被閘極包住，閘極對通道的控制更好，短通道效應與關閉時的漏電較低。但不是零：最下面那片和基板之間仍有寄生路徑，所以才需要底部介電隔離 | 已確定（定性）；**「少多少」各來源數字差很多**（有模擬只差一點點，有二手文章寫差很多），片中不給數字 | IEEE Spectrum 2019（「電流流過被閘極完全包住的幾片矽，減少漏電路徑、提高驅動電流」）；ProQuest 收錄的 TCAD 比較（DIBL 18.5→15.4 mV/V）；Research Square 預印本（鰭式底部介面是漏電路徑）；Semiconductor Digest（IBM 底部介電隔離） |

示意簡化（片中出處列寫「運作為示意」）：
- 真實的反轉層只有幾奈米厚，而且 5 nm 厚的薄片幾乎整片都會導通；片中畫成「薄片外面亮起一層」是為了看得出通道是閘極感應出來的。
- 光點的數量、速度、大小都不代表真實的電子數或速度；電子也不是排隊走的小球。
- 開關一次實際上是皮秒等級，片中放慢成約 3 秒。
- 為了看到裡面，運作段把閘極、間隔層、接點、銅線變半透明。
- 光點從銅線往下進源極、穿過三片、從汲極往上回到銅線：路徑方向正確，但接點與源極之間的矽化物等細節沒畫。
- 對照卡的鰭式剖面是通用畫法，不是特定製程；漏電小點的顆數（5 對 1）沒有數字意義。

### 各級縮放圖補的細節（都是幾何示意，不仿任何機型）

- 手機內部常見的東西：主機板、電池、鏡頭模組、屏蔽罩、排線（板對板連接）、無線充電線圈、喇叭、振動馬達、充電孔：通則，沒有逐項找來源；位置是自己排的。
- 手機主晶片的封裝：行動處理器主流是覆晶封裝（裸晶正面朝下，用凸塊接到封裝基板，基板底下用錫球接主機板）；凸塊間距可到 40–150 µm、錫球間距約 0.35–0.4 mm。狀態：已確定。來源：Samsung Electro-Mechanics 封裝基板產品頁（FCCSP 用於行動處理器）、JCET fcCuBE 文件、STATS ChipPAC 論文（都是搜尋摘要）。片中的凸塊與錫球顆數是示意。
- 晶片上的功能區塊（CPU／GPU／NPU／MODEM／ISP／CACHE／I/O）：手機系統單晶片確實包含這些功能，但**區塊大小與位置是自己排的**，不是任何一顆晶片的佈局。
- 電晶體陣列：標準元件列有電源軌、主動區、垂直的閘極條、接點、上層金屬線：通則；密度只是示意（真實 15 µm 寬的畫面裡有三百多條閘極，畫不出來）。
