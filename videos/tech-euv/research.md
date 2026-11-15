# 曝光機：光比線還粗，怎麼畫得出來？（科技透明圈 第 2 支・tech-euv）

查證截至 2026/11/15。本文會整理成「科技透明圈」精選文章（留言「曝光機」拿完整資料）。
狀態標記：**已確定**（官方文件、教科書或多個獨立來源一致）／**廠商規格**（廠商公布，非實測）／**估算**（照公開數字推算，非實測）。

## 一句話

晶片上的線比畫它的光還細：以前用 193 奈米的光，一次只能畫到約 40 奈米；更細就要同一層分好幾次畫。極紫外光（EUV）把波長縮到 13.5 奈米，代價是光要自己做、整台機器要抽真空、只能用反射鏡，光到晶圓只剩約 2%。

## 數字與來源

| # | 說法（影片裡怎麼講） | 數字 | 狀態 | 來源（查詢日 2026/11/15） |
|---|---|---|---|---|
| 1 | 上一代曝光（浸潤式 ArF）用的光 | 波長 193 nm | 已確定 | SemiEngineering〈7nm lithography choices〉、Semiwiki〈Multiple patterning vs EUV〉；ASML 官網 DUV 產品頁 |
| 2 | 193 nm 的光一次只畫得出約 40 奈米的線 | 單次曝光極限約 40 nm 半間距（half-pitch） | 已確定（業界共識，約略值） | SemiEngineering〈Multi-patterning problems grow〉、Semiwiki：「193 nm 浸潤式在約 40 nm 半間距達到物理極限」 |
| 3 | 光比線粗約五倍 | 193 ÷ 40 ≈ 4.8 | 估算（由 1、2 推算） | 同上 |
| 4 | 更細的線要同一層分好幾次畫 | 16/14 奈米世代兩次、7 奈米世代四次（四重曝光） | 已確定 | SemiEngineering〈7nm lithography choices〉：浸潤式在 16/14nm 需要雙重曝光、7nm 需要四重曝光 |
| 5 | 極紫外光的波長 | 13.5 nm | 已確定 | ASML NXE:3600D 產品頁；TRUMPF〈Flashes of light in a vacuum〉 |
| 6 | 連空氣都會吸掉，只能在真空裡 | — | 已確定 | EUV 微影相關專利與教材（EUV 幾乎被所有物質強烈吸收，光路要在真空中）；Wikipedia〈Extreme ultraviolet lithography〉 |
| 7 | 每秒約五萬顆錫滴 | 錫滴直徑約 20 µm、每秒約 50,000 顆 | 廠商說明（雷射供應商公布，約略值） | TRUMPF〈Generation of EUV radiation using a CO2 high-power laser system and tin〉、〈Flashes of light in a vacuum〉 |
| 8 | 雷射每顆打兩下，打成電漿發光 | 預脈衝把錫滴打扁、主脈衝打成數十萬度的電漿，發出 13.5 nm 的光；主雷射平均約 20 kW | 廠商說明 | TRUMPF 同上 |
| 9 | 能量轉換很低 | 約 5% 的雷射能量變成可用的 EUV | 廠商說明（約略值） | TRUMPF 同上（影片沒有用這個數字） |
| 10 | 玻璃也會吸光，所以全部用反射鏡；光罩也是反射式 | 照明至少 2 面＋投影 6 面＋反射式光罩 | 已確定 | Wikipedia〈Extreme ultraviolet lithography〉；EUV 光罩專利（光罩用鉬／矽多層膜，和反射鏡一樣） |
| 11 | 鏡面是鉬和矽疊幾十層，每面最多反射約七成 | 鉬／矽多層膜在 13.5 nm 的反射率約 70%（實驗室約 68.5%） | 已確定（理論與實驗值） | 熱穩定多層膜反射鏡專利（約 70%）；SPIE 論文（68.5%）；Laser Focus World：收集鏡實際 >55% |
| 12 | 從光源到晶圓反射十幾次 | 約 11 次反射 | 已確定（系統配置） | Wikipedia〈Extreme ultraviolet lithography〉 |
| 13 | 到晶圓只剩約百分之二 | 約 2% | 估算（0.7 的 11 次方 ≈ 2%；來源只有 Wikipedia 一處，沒有獨立的第二來源，畫面標「估算」） | Wikipedia〈Extreme ultraviolet lithography〉 |
| 14 | 廠商標示最細可以印 13 奈米 | 解析度 13 nm、數值孔徑 0.33 | 廠商規格，非實測 | ASML NXE:3600D 產品頁 |
| 15 | 一小時約 160 片（影片沒有用） | 160 片／小時（劑量 30 mJ/cm²） | 廠商規格，非實測 | ASML NXE:3600D 產品頁；SemiWiki〈ASML EUV update at SPIE〉 |
| 16 | 台積電 2019 年起，關鍵幾層改用它印 | N7+ 於 2019 年第二季量產，只在少數關鍵層用 EUV | 已確定（台積電新聞稿；「業界首個商用 EUV 製程」是台積電自己的說法） | 台積電新聞稿（pr.tsmc.com）；Tom's Hardware〈TSMC Starts Shipping EUV N7+ Chips〉；Bits&Chips |
| 17 | 下一支：晶圓良率 | 良率＝一片晶圓上好晶片的比例，和缺陷密度、晶片面積有關 | 已確定（定義） | WikiChip〈Yield〉；良率模型教材（Poisson 模型 Y = e^(−D0·A)） |

## 影片裡刻意不說的

- 不說哪一家設備多少錢（各報導數字不一）。
- 不說高數值孔徑（High-NA）機台的解析度：本支只講 0.33 NA 這一代。
- 「光比線粗五倍」用的是 193 nm 對 40 nm 半間距；不同層、不同製程的實際線寬不同，畫面標「約」。
- EUV 是看不見的光，畫面上的紫色光點是示意。

## 寫成文章時的段落

1. 光比線還粗：193 nm 的光、40 nm 的線，以及多重曝光。
2. 極紫外光：13.5 nm，為什麼要真空。
3. 光怎麼做出來：錫滴、兩道雷射、電漿。
4. 光怎麼帶到晶圓：鉬／矽多層反射鏡、反射式光罩、約 11 次反射、約 2%。
5. 結果：13 nm（廠商規格），台積電 2019 年 N7+ 開始在關鍵層使用。
6. 下一支：印完之後，每一顆都能用嗎？（晶圓良率）

## 來源網址

- ASML NXE:3600D：https://www.asml.com/en/products/euv-lithography-systems/twinscan-nxe-3600d
- TRUMPF EUV 光源：https://www.trumpf.com/en_CN/anwendungen/euv-lithography/ 、https://www.trumpf.com/en_GB/magazine/flashes-of-light-in-a-vacuum
- SemiEngineering：https://semiengineering.com/7nm-lithography-choices 、https://semiengineering.com/multi-patterning-problems-grow
- Semiwiki：https://semiwiki.com/semiconductor-services/2607-semicon-multiple-patterning-vs-euv-round-1 、https://semiwiki.com/semiconductor-services/techinsights/314387-asml-euv-update-at-spie/
- Laser Focus World（多層膜反射鏡）：https://www.laserfocusworld.com/optics/article/16566714/optics-for-scanning-multilayer-mirrors-enable-nextgeneration-euv-lithography
- 多層膜反射率專利：https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/7920323
- Wikipedia〈Extreme ultraviolet lithography〉（鏡片數、約 2%）：https://en.wikipedia.org/wiki/Extreme_ultraviolet_lithography
- 台積電 N7+：https://www.tomshardware.com/news/tsmc-amd-euv-n7-7nm-process,40575.html 、https://bits-chips.com/article/tsmcs-first-euv-process-reaches-high-volume-status
- WikiChip 良率：https://en.wikichip.org/wiki/yield

## 研究工具紀錄

- 2026/11/15 起可以讀 YouTube 逐字稿做題材研究（只拿事實與題目、不照抄、出處要寫；YouTuber 說法沒有一手來源佐證一律標「分析推測」）。本支的數字全部來自上表的一手或廠商來源，**沒有使用 YouTube 逐字稿**。
