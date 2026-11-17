# AI 伺服器：一櫃比一台小客車還重（科技透明圈 第 7 支・tech-server）

查證截至 2026/11/17。**發布當天（11/20）要再查：重量與耗電是否有新世代（GB300／Vera Rubin）更新、各組裝廠市占，並更新「查證截至」日期。**
排程：2026/11/20（五）20:00；接 tech-hbm 片尾「下一支，來看伺服器到底是什麼」；片尾預告 11/21（六）「液冷」。
鏈上位置：先進封裝 → HBM → **伺服器（整櫃）** → 液冷（本支拓展子題：熱怎麼帶走）。
狀態標記：已確定／廠商公布／媒體報導（寫誰）／估算／查不到。研究工具：WebSearch（摘要），至少兩個獨立來源。

## 一句話
AI 伺服器不是一台電腦，是「一整櫃」：72 顆 GPU 要像一顆晶片一樣工作，所以交換器、銅線、電源、冷卻液管路都要跟機櫃一起設計；一櫃約 1.3–1.5 公噸、約 120–132 kW。

## 數字與來源（以 NVIDIA GB200 NVL72 為例）
| # | 說法 | 數字 | 狀態 | 來源 | 信心 |
|---|---|---|---|---|---|
| 1 | 一櫃 72 顆 GPU，分在 18 層運算托盤，每層 4 顆 GPU＋2 顆 Grace CPU（共 36 顆 CPU） | 18 compute trays × (4 GPU + 2 CPU)；9 層 NVLink 交換器托盤 | 廠商公布 | NVIDIA 文件〈Understanding Your Grace-Blackwell Systems〉、NVIDIA 技術部落格；SemiAnalysis〈GB200 hardware architecture〉；Supermicro SRS-GB200-NVL72 | 高 |
| 2 | 72 顆 GPU 成一個 NVLink 網域，用 9 層交換器與機櫃背後超過 5,000 條銅線連起來 | 每顆 GPU 18 條 NVLink；NVIDIA 稱「超過 5,000 條高效能銅纜」；總頻寬約 130 TB/s | 廠商公布 | NVIDIA 技術部落格；Cudo Compute 規格頁；DCD 報導 | 高 |
| 3 | 一櫃耗電 | 約 120 kW（多數來源）；Supermicro 列 132 kW；HPE 額定 132 kW、設計尖峰約 192 kW | 廠商公布（各家不同） | Supermicro、HPE 規格頁；Introl 部署指南 | 中高（旁白用「一百多千瓦」，不說單一精確值） |
| 4 | 一櫃重量 | 約 1.32–1.36 公噸；HPE 滿載 3,245 磅≈1.47 公噸；Introl：約 1,500 kg 壓在 0.8 平方公尺 | 廠商公布／媒體（來源不一致） | HPE 規格、Introl、Cudo | 中（旁白「約一點四公噸」，畫面標「各家規格 1.3–1.5 公噸」；小客車重約 1.2–1.6 公噸，屬常識級對照，標「約」） |
| 5 | 冷卻：CPU、GPU、交換器用液冷（機櫃內或排內 CDU），網路與儲存模組仍是風冷 | 直接液冷；機內 CDU 可處理約 250 kW 熱量（Thinkmate） | 廠商公布 | DCD 報導、SemiAnalysis、Thinkmate | 高 |
| 6 | 銅線比光纖省電 | 被動銅纜不耗電；一說可省約 20 kW／櫃 | 媒體報導 | 搜尋摘要（NVIDIA 說法被轉述） | 中（不上旁白） |
| 7 | 電源：機櫃內有電源層（power shelf），把交流電轉成直流，再由銅排（busbar）送到每一層 | 例：Gigabyte 規格列 3 層 1U 33 kW 電源層 | 廠商公布 | Gigabyte 資料表；TechRadar（48V 大電流） | 中（只畫示意，不標電壓數字） |
| 8 | 台灣組裝：鴻海、廣達、緯穎、緯創 | NVIDIA 點名 11 家參與 GB200 NVL72，含台積電、鴻海、緯創、廣達；法人估計廣達與鴻海各超過 35%，其後緯穎；GB200 機櫃主要由鴻海代工 | 廠商點名＋媒體估計 | 數位時代（bnext）、Yam 新聞 2026/8、財訊、科技新報 2025/6 | 中（市占是估計且各家不一，不上畫面數字） |
| 9 | 電源：台達電；光寶為第二供應商 | 台達電被稱為電源與 BBU 龍頭（市占過半，媒體估計） | 媒體報導 | 搜尋摘要（財經媒體） | 中（只念名字，不念占比） |
| 10 | 散熱／液冷：奇鋐、雙鴻 | 被列為散熱與液冷供應鏈 | 媒體報導 | 同 #8 | 中 |
| 11 | 滑軌：川湖；機殼：勤誠 | 川湖供應 NVL72／NVL36 滑軌，公司稱 AI 伺服器市占逾五成；勤誠被 NVIDIA 指定為 GB200 MGX 2U 機殼夥伴（2024 年中報導） | 公司說法／媒體報導 | 經濟日報、自由時報、財訊轉述 | 中（2024 年報導，發布前要再查） |
| 12 | 各家真實出貨量、毛利、市占的完整數字 | 查不到官方完整數字 | 查不到（截至 2026/11/17） | 各家法說會只講部分 | — |

## 影片裡刻意不說的
- 不放股票代號、不排名誰好誰壞、不講市占百分比、不給投資建議；公司名只當「有公開報導在做」。
- 不說單一精確耗電（各家 120–132 kW 不同）；不說哪一家良率或出貨。
- 不寫 GB300／Vera Rubin 數字（版本之間差異大，發布前再查）。

## 查不到或低信心
- 川湖、勤誠的最新出貨與營收；各家 NVL72 實際出貨比例；銅線省電量的原始出處。

## 寫成文章時的段落
1. 一櫃有什麼（72 GPU／36 CPU／18＋9 層托盤）。2. 為什麼整櫃設計（NVLink 銅線背板）。3. 電怎麼進來。4. 熱怎麼出去（風冷→液冷）。5. 台灣誰在做。6. 下一支：液冷。

## 來源網址
- NVIDIA 文件 https://docs.nvidia.com/multi-node-nvlink-systems/multi-node-tuning-guide/system.html
- NVIDIA 部落格 https://developer.nvidia.com/blog/nvidia-gb200-nvl72-delivers-trillion-parameter-llm-training-and-real-time-inference/
- DCD https://datacenterdynamics.com/en/news/nvidia-announces-liquid-cooled-gb200-nvl72-system-with-72-blackwell-gpus
- SemiAnalysis https://semianalysis.substack.com/p/gb200-hardware-architecture-and-component
- Supermicro https://supermicro.com/en/products/system/gpu/48u/srs-gb200-nvl72 ；HPE https://www.hpe.com/il/en/collaterals/collateral.a50009224enw.html
- Introl https://introl.com/blog/gb200-nvl72-deployment-72-gpu-liquid-cooled ；Cudo https://www.cudocompute.com/products/nvidia-gb200-nvl72
- 數位時代 https://www.bnext.com.tw/article/83298/nvidia-friends-2025 ；科技新報 https://technews.tw/2025/06/09/chatgpt-brain/ ；Yam https://n.yam.com/Article/20260806600761
- 川湖 https://ec.ltn.com.tw/article/breakingnews/5632927 ；勤誠／川湖 https://technews.tw/2024/07/03/gb200-tw/
