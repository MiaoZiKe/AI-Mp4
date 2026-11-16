# 八百伏特：AI 機櫃為什麼要把電壓拉高（科技透明圈 第 9 支・tech-800v）

查證截至 2026/11/16。**發布當天（11/22）再查一次 800V 量產與出貨時程（台達、光寶等報導），更新「查證截至」日期。**
排程：2026/11/22（日）20:00（`TZ=Asia/Taipei date -d 2026-11-22 +%A` → Sunday），類別「原理」，接 tech-cooling 片尾「電線加粗，還是電壓拉高？下一支，來看八百伏特」；片尾預告 11/23（一）「伺服器的電源供應器」（topic_tree 第二週第 1 支）。
鏈上位置：伺服器／系統廠節點的拓展（供電）。
狀態標記：已確定／廠商公布／廠商估算／媒體報導（寫明哪家）／廠商目標值（非實測）／查不到。
研究工具：只用 WebSearch（摘要）。來源三類：一手（NVIDIA 技術部落格〈800 V HVDC architecture〉、Schneider Electric 部落格、Infineon／Arrow 技術文件）、研究（SemiAnalysis〈Inside the 800VDC revolution〉）、媒體（科技新報、工商時報、優分析、鉅亨網）。

## 一句話

功率＝電壓×電流。AI 機櫃朝一百萬瓦（1 MW）走，用 54 伏特送電要一萬八千多安培，NVIDIA 估計光銅排就要約 200 公斤；改成 800 伏特直流，電流降到約 1,250 安培，同一條導線的發熱（I²R）少約 220 倍。代價是要多一級降壓：晶片核心只吃約 0.8～1.2 伏特，800 V 要一路降下來，而且 800V 的接頭、電源櫃以前都沒有現成品。NVIDIA 規劃 2027 年 Kyber 機櫃全面採用。

## 數字與來源

| # | 說法 | 數字 | 狀態 | 來源（查詢日 2026/11/16） | 信心 |
|---|---|---|---|---|---|
| 1 | 用 54 伏特送一百萬瓦進機櫃，光銅排廠商估計就要兩百公斤 | 1 MW 機櫃用 54 VDC 需最多約 200 kg 銅排；1 GW 資料中心的機櫃銅排可能要 20 萬公斤 | 廠商估算（NVIDIA） | NVIDIA 技術部落格〈NVIDIA 800 V HVDC Architecture Will Power the Next Generation of AI Factories〉（2025/5）；SemiAnalysis〈Inside the 800VDC revolution〉（同樣寫約 200 kg） | 中高（兩份來源一致，但都源自 NVIDIA 估算；畫面標「廠商估算」） |
| 2 | 現在的 AI 機櫃，電先降到五十幾伏特，再沿銅排送到每台伺服器 | 目前機櫃內用 48～54 VDC 電源架＋銅排 | 已確定 | NVIDIA 部落格同上；SemiAnalysis 同上；NVIDIA DGX GB200 使用手冊（電源架、銅排） | 高 |
| 3 | 功率等於電壓乘電流 | P＝V×I | 已確定（物理） | 基本電學 | 高 |
| 4 | 54 伏特要一萬八千多安培；800 伏特只要一千兩百多安培 | 1,000,000 ÷ 54 ≈ 18,519 A；1,000,000 ÷ 800 ＝ 1,250 A | 已確定（算式，自己算） | 由 #3 | 高 |
| 5 | 發熱跟電流平方成正比；電流少十五倍，同一條線損耗少兩百多倍 | 導線損耗 P＝I²R；18,519 ÷ 1,250 ≈ 14.8 倍 → 14.8² ≈ 219 倍（同一條導線、同電阻） | 已確定（算式；假設同一條導線） | 基本電學 | 高（畫面標「同一條線的估算」） |
| 6 | 晶片本身只吃一伏特上下，電壓越高要降越多次 | GPU 核心電壓約 0.8～1.2 V（降壓比可達 60:1）；常見兩段：48 V → 12 V → 1 V 以下 | 已確定 | Arrow〈PCIM Demo GPU〉（2026/8）；Power Systems Design〈Optimizing the 800 V to 48 V／50 V power path〉；Vicor〈Powering AI processors using a 48V FPA〉 | 高 |
| 7 | 每降一次就要一級電源；八百伏特的接頭以前沒有現成的 | 台達電主管：800V 規格的連接器過去不存在，需全部客製化 | 媒體報導（科技新報） | 科技新報〈造價等於一台保時捷！台達電祭出固態變壓器〉 | 中（單一媒體引述公司主管） |
| 8 | 廠商規劃 2027 年機櫃開始全面改用 800 伏特直流 | 800 VDC 全面量產與 NVIDIA Kyber 機櫃（2027）同步；SemiAnalysis：2026 年底／2027 年初先以電源側櫃改裝 | 廠商目標值（非實測） | NVIDIA 部落格同上；SemiAnalysis 同上 | 中高 |
| 9 | 整套改完能省多少，廠商目標是總成本少三成，還沒有實際機房的數字 | NVIDIA：目標最多降低 30% 總持有成本（TCO）；Infineon 實測單顆 800→50 V 轉換器滿載約 98%（單一元件，不是整套機房） | 廠商目標值（非實測）／查不到整套機房實測（截至 2026/11/16） | NVIDIA 部落格同上；Power Systems Design 同上 | 中（畫面標「廠商目標，非實測」） |
| 10 | （畫面小字，Vendor）台灣電源廠 | 台達電 GTC 2026 展出整套 800V 電源櫃（科技新報 2026/3/28）；台達電表示 800V 系統 2026 Q3 提前量產（優分析）；光寶 800V MW 級電源櫃 2026 年底小量（工商時報 2026/6/7；科技新報另一篇寫 11 月小量，兩說不一） | 媒體報導 | technews.tw/2026/03/28/800-vdc-delta/；uanalyze.com.tw/articles/8794749262；ctee.com.tw/news/20260607700012-430201；technews.tw/?p=1638634 | 中（只放小字，不推薦個股；光寶時程兩說並列） |
| 11 | （不念）機櫃功耗 | Vera Rubin 機櫃 >300 kW、Rubin Ultra 預估 600 kW 級；Kyber 目標 1 MW 級 | 媒體報導／廠商目標 | 科技新報〈台達電子德國研發中心啟用〉；Schneider Electric〈The 1 MW AI IT rack is coming〉（2025/10/16） | 中 |
| 12 | （不念）54 V 電源架佔空間 | Kyber 若用 54 V，電源架最多要佔 64U，沒空間放運算 | 廠商估算（NVIDIA） | NVIDIA 部落格同上 | 中（文章用） |

## 影片裡刻意不說的
- 不說 800 V 安全規範細節（查不到定稿標準）。
- 不說價格（SemiAnalysis 每 MW 50 萬美元為分析推測），不給投資建議。
- 45% 省銅是「對 415 VAC 配電」的比較，不是對 54 V 銅排，影片不用，避免混口徑。

## 寫成文章時的段落
1. 為什麼電壓低就要粗銅排：P＝VI、I²R。
2. 現在的路徑：交流 → 54 V 電源架 → 銅排 → 12 V → 1 V。
3. 800 V 改了哪一段：電源側櫃、固態變壓器、少幾次轉換。
4. 代價：接頭、絕緣、要多一級降壓。
5. 時程與台灣電源廠（附出處，兩說並列）。
6. 下一支：拆開伺服器的電源供應器。

## 來源網址
- NVIDIA 800 V HVDC：https://developer.nvidia.com/blog/nvidia-800-v-hvdc-architecture-will-power-the-next-generation-of-ai-factories/
- SemiAnalysis：https://newsletter.semianalysis.com/p/inside-the-800vdc-revolution-part
- Schneider Electric：https://blog.se.com/datacenter/2025/10/16/the-1-mw-ai-it-rack-is-coming-and-it-needs-800-vdc-power/
- Arrow：https://www.arrow.com/en/resources/articles/2026/08/PCIM-Demo-Page-GPU.html
- Power Systems Design：https://www.powersystemsdesign.com/articles/optimizing-the-800-e2-80-afv-to-48-v50-e2-80-afv-power-path-for-ai-data-center-servers/22/23624
- Vicor：https://www.vicorpower.com/resource-library/articles/high-performance-computing/powering-ai-processors-using-a-48v-fpa
- 科技新報（台達 GTC）：https://technews.tw/2026/03/28/800-vdc-delta/ ；（固態變壓器）https://technews.tw/?p=1532108 ；（德國研發中心）https://technews.tw/?p=1558171
- 工商時報（光寶）：https://www.ctee.com.tw/news/20260607700012-430201
- 優分析（台達 Q3 量產）：https://uanalyze.com.tw/articles/8794749262
