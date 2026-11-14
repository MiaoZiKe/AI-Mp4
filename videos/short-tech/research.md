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
