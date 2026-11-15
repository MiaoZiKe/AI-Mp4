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

## 第二輪補查：曝光機結構與運作順序（供動畫規格 `device-spec.md` 使用）

查證截至 2026/11/15。來源三類：A 原廠與一手技術說明（ASML 產品頁、TRUMPF 技術說明）；B 論文／專利／研討會（SPIE、euvlitho.com、USPTO 專利）；C 科普與媒體（Laser Focus World、Wikipedia、Semiwiki、photonics.com）。WebSearch 只拿得到摘要，沒有讀過全文；表中數字都至少對照兩處摘要，單一來源者標明。

| # | 項目 | 數值／事實 | 狀態 | 信心 | 來源類別與網址 |
|---|---|---|---|---|---|
| 1 | 錫滴 | 直徑約 20–30 µm（TRUMPF 稱約 20，Laser Focus World 稱約 30）；頻率 50 kHz | 廠商說明／趨勢文章 | 中高 | A/C：TRUMPF 磁誌、https://www.laserfocusworld.com/articles/2017/08/the-secret-of-euv-generation.html |
| 2 | 預脈衝＋主脈衝 | 預脈衝把錫滴打扁、膨脹、部分蒸發，主脈衝再轉成電漿，轉換效率提高；每顆兩下 | 已確定 | 高 | C/B：同上；專利 https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/9826615 |
| 3 | 驅動雷射 | CO2 雷射 MOPA 架構（種子＋放大），平均功率約 20 kW 以上；轉換效率約 3–5% | 廠商說明 | 中 | C：Laser Focus World；種子與放大器在地下層（sub-fab），光束由傳輸系統送入真空腔（ASML 簡報摘要，中信心） |
| 4 | 預／主脈衝光點 | 預脈衝約 100 µm 光點、主約 400 µm（單一 ASML 簡報摘要） | 單一來源 | 低 | B：euvlitho.com 簡報（https://www.euvlitho.com/2017/S1.pdf） |
| 5 | 電漿 | 數十萬度（TRUMPF）；向各方向發 13.5 nm | 廠商說明 | 中 | A |
| 6 | 收集鏡 | 彎曲的 Mo/Si 多層膜橢球面鏡，把電漿光收到「中間焦點」；錫碎屑是最大問題，用氫氣流與磁場把錫離子推向捕集器 | 已確定（專利與專文） | 高 | B：https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/9826615 、https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10877190 |
| 7 | 氫氣與錫 | 氫吸收 EUV 最少，用來沖刷收集鏡；錫與氫生成 SnH₄（氣態）被抽走；有加熱的導流片（約 100–400°C）與接錫槽（catcher）回收錫，可回供產生器 | 已確定（專利） | 高 | B：專利 https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10871647 、https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12061423 |
| 8 | 中間焦點 | 光源與掃描機的交界，收集鏡把光收到這一點 | 已確定 | 高 | C |
| 9 | 光學鏡數 | 至少 2 面照明（聚光）多層膜鏡＋6 面投影鏡＋反射式光罩；具體機型照明鏡可更多（場鏡面、瞳鏡面為多小鏡面組成） | 已確定（至少值） | 中高 | B：https://core.ac.uk/download/71162026.pdf（摘要）；Wikipedia |
| 10 | 多層膜 | Mo/Si 約 40 對，週期約 6.9–7.0 nm（Mo 約 2.8 nm、Si 約 4.1 nm）；理論反射率上限約 72%，實驗約 68–70%；每面約吸收 30% | 已確定 | 高 | B/C：多篇摘要一致（NASA 時代資料 6.89 nm、Kassel 70%、專利約 70%） |
| 11 | 反射式光罩 | 低熱膨脹基板＋約 40 對以上 Mo/Si 多層膜＋吸收層（目前 TaBN）；光 6° 斜入射；吸收層厚度加斜入射產生陰影（3D 光罩效應） | 已確定 | 高 | B：SPIE JM3 論文、imec 2022 摘要、專利 https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8663878 |
| 12 | 縮小與掃描 | 4× 縮小、NA 0.33、最大曝光場 26×33 mm；光罩台與晶圓台沿同軸同步反向掃描，速度比＝縮小倍率；掃完一格再步進 | 廠商規格＋已確定 | 高（速度數值查不到） | A/B：ASML 官網 NXE:3400B 頁、https://en.wikipedia.org/wiki/Extreme_ultraviolet_lithography |
| 13 | 反射次數與穿透 | 約 11 次反射、約 2% 到晶圓（0.7¹¹ ≈ 2%）；其他來源給 1%（單篇文章）、一份專利估六面投影鏡含光罩約 12% 以下；結論 1–12% 取決於設計與計算範圍 | 估算 | 中低 | C/B：Wikipedia；https://www.all-about-industries.com/new-approach-for-euv-lithography-more-efficient-and-cheaper-than-asmls-standard-a-649b74b720bda2d4ea3bf4f7cbcbcc7f/；專利 6333961 |
| 14 | 吸收 | EUV 被幾乎所有材料（含空氣、玻璃）強烈吸收，光路必須真空、且用反射 | 已確定 | 高 | C |

### 與念稿的對照（念稿未改）

- 全部事實與上表一致，沒有衝突。
- 提醒 1：「疊上幾十層」——一對鉬＋矽為一個單元，約 40–50 對＝80–100 層；兩種算法都是「幾十」，畫面以「對」標。
- 提醒 2：「一次就印得出來」——最細的層（約 5／3 nm 世代）仍有 EUV 雙重曝光；影片已限定「光夠短」，畫面標「關鍵層」較穩。
- 提醒 3：「約百分之二」只有 Wikipedia 單點明說，補查看到 1%–12% 的範圍；已在畫面標「估算」，建議保留。
- 提醒 4：錫滴直徑兩家來源差 20 與 30 µm，影片只講「每秒五萬顆」，不要在畫面寫單一值，寫「約 20–30 µm」。

### 低信心點

預／主脈衝光點大小與間隔（單一簡報摘要）；電漿溫度（「數十萬度」未取得數值來源）；照明鏡數（不同文章 2–4 面，畫面以「示意」處理）；錫滴速度與間距（沒有可靠來源，不標數字）；掃描速度（無）；「約 2%」的 11 次反射分解（光罩與瞳孔填充損失未計）。
