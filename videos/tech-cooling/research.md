# 液冷：一櫃伺服器一百二十千瓦，風扇吹不走（科技透明圈 第 8 支・tech-cooling）

查證截至 2026/11/16。**發布當天（11/21）再查一次機櫃功耗、全液冷平台的報導，更新「查證截至」日期。**
排程：2026/11/21（六）20:00（`TZ=Asia/Taipei date -d 2026-11-21 +%A` → Saturday），類別「運作」，接 11/20（五）「伺服器到底是什麼」（**那支的片尾要預告「一櫃這麼耗電，熱怎麼散？下一支，來看液冷」**）；片尾預告 11/22（日）「八百伏特」。
鏈上位置：伺服器／系統廠節點的拓展子題（散熱）。
狀態標記：已確定／廠商公布／媒體報導（寫明哪家）／估算／廠商目標值（非實測）／查不到。
研究工具：只用 WebSearch（摘要）。來源三類：一手（NVIDIA DGX GB200 使用手冊、NVIDIA 部落格、Vertiv 參考設計）、產業媒體與研究（Data Center Frontier、Upsite、The Register、DIGITIMES）、台灣財經媒體（經濟日報、優分析、104 職場力轉載）。

## 一句話

一櫃 72 顆 GPU 的 AI 機櫃大約吃 120 千瓦，遠超過風冷能處理的程度（各來源說法約 20～80 千瓦不等），所以改成直接液冷：晶片上貼冷板，冷水流過冷板帶走熱，經分歧管與快接頭匯到冷卻液分配裝置（CDU），把熱交給機房冷卻水。同體積的水能帶走的熱約是空氣的 3,400 倍以上。

## 數字與來源

| # | 說法 | 數字 | 狀態 | 來源（查詢日 2026/11/16） | 信心 |
|---|---|---|---|---|---|
| 1 | 一櫃 AI 伺服器要吃一百二十千瓦 | GB200 NVL72 機櫃約 120 kW（NVIDIA 使用手冊）；廠商頁面寫 120～132 kW；Vertiv 參考設計最高 132 kW | 廠商公布 | NVIDIA DGX GB200 User Guide（Hardware）；Vertiv／451 Research 報告（2024/11/4）；DataCrunch 部落格 | 高 |
| 2 | 風扇已經吹不走這麼多熱 | 風冷上限各家說法不同：約 20 kW（加後門熱交換可到更高）、60～80 kW；The Register：4 台風冷 DGX B200（約 60 kW）已逼近標準風冷機櫃極限 | 媒體報導／業界說法（數字不一） | The Register（2024/3/27）；coradvisors（2026/8）；longform 產業整理 | 中（旁白不念風冷上限數字，只說「吹不走」；畫面標「業界說法約 60～80 kW，各家不同」） |
| 3 | 同樣一杯的體積，水能帶走的熱，大約是空氣的三千四百多倍 | 體積熱容：水 4.18 MJ/m³·K、空氣約 0.0012 → 約 3,450 倍；Data Center Frontier 寫 3,500 倍；Introl 寫 3,300 倍 | 已確定（物性計算） | Upsite〈Data Center Cooling Effectiveness Versus Efficiency〉；Data Center Frontier〈New Liquid Cooling Designs〉；Introl（2025） | 高（是「單位體積能裝的熱」，不是整體散熱效率倍數；畫面標「同體積、升高 1 度能帶走的熱」） |
| 4 | 晶片上面改貼金屬冷板，裡面有細水道 | 直接液冷（direct-to-chip）：冷板貼在 CPU／GPU 上，冷卻液在板內通道流動，不碰電子零件 | 已確定 | Data Center Frontier 同上；HPE〈What is liquid cooling〉 | 高 |
| 5 | 水管接到機櫃背後的分歧管，插拔用快接頭，拔掉也不會漏 | 分歧管（manifold）分配冷卻液到各冷板；快接頭（quick disconnect）可熱插拔不漏液 | 已確定（作法） | 經濟日報、優分析的液冷產業整理（2026）；DIGITIMES GTC 2026 觀察（冷板、快接頭、inner manifold 重要性提升） | 高 |
| 6 | 熱水送到冷卻液分配裝置，把熱交給機房冷卻水，降溫再送回來 | CDU 以熱交換器把機櫃內迴路的熱交給設施側冷卻水 | 已確定（作法） | 同 #5；HPE 同上 | 高 |
| 7 | 冷板也不是全包，還有一到兩成的熱要靠風扇 | 冷板一般捕捉 80～90%，10～20% 仍需空氣帶走 | 業界說法 | Data Center Frontier（引述）；moduledge（HPE 拆分約 115 kW 液冷＋17 kW 風冷，次級來源） | 中（旁白用「業界的說法是」） |
| 8 | 媒體報導，廠商下一代的平台改成全液冷、不裝風扇 | DIGITIMES GTC 2026 觀察：NVIDIA Rubin 平台全面採用全液冷、無風扇、模組化冷板設計 | 媒體報導（DIGITIMES） | DIGITIMES 研究報告目錄頁（2026） | 中（只有一家媒體摘要，發布當天再查第二個來源；查不到就把這句改成「廠商下一代平台還要更耗電」） |
| 9 | 漏水的機率、冷卻液多久要換，各家沒有公布統一的數字 | 查不到公開的統一可靠度數據 | 查不到（截至 2026/11/16） | WebSearch 關鍵字「液冷 漏液 機率」「coolant replacement interval data center」都只有廠商行銷文 | — |
| 10 | 機櫃還會更耗電（下一支八百伏特） | Vera Rubin 機櫃已超過 300 kW、Rubin Ultra 預估 600 kW 級 | 媒體報導（科技新報） | 科技新報〈台達電子德國研發中心啟用，加強 800V 電源研發〉 | 中 |
| 11 | （畫面小字，Vendor）台灣液冷零件廠 | 奇鋐、雙鴻被點名供應冷板、分歧管、CDU、快接頭；健策、富世達等也被提及 | 媒體報導（經濟日報、優分析、玉山證券文章） | money.udn.com 5607/9137791；uanalyze.com.tw；esunsec.com.tw | 中（只放畫面小字＋出處，不排名、不推薦個股） |
| 12 | （不念）液冷滲透率 | 2026 年 AI 伺服器液冷滲透率破 50%（證券文章）／2027 年 53%→59%（優分析，基準年不同） | 分析推測 | 玉山證券文章；優分析 | 低中（口徑不一，不上影片） |

## 影片裡刻意不說的
- 不說「水冷比風冷省多少電」（各家數字差很大，多為廠商行銷）。
- 不談浸沒式液冷（題目會散；留給完整解說文章）。
- Vendor 只放畫面小字＋出處，不念股票代號、不推薦。

## 寫成文章時的段落
1. 為什麼風扇不夠：機櫃功耗演進。
2. 水跟空氣差在哪：體積熱容 3,450 倍的算法。
3. 冷板、分歧管、快接頭、CDU 一條迴路走一遍。
4. 冷板沒抓到的那一到兩成。
5. 台灣誰在做（媒體點名的零件廠，附出處）。
6. 下一支：八百伏特。

## 來源網址
- NVIDIA DGX GB200 使用手冊：https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html
- Vertiv／451 Research：https://prod.vertiv.cn/4ad4c4/globalassets/campaigns/ai-hub/451research_reprint_vertiv_04nov2024.pdf
- The Register：https://www.theregister.com/2024/03/27/nvidia_blackwell_efficiency/
- Upsite：https://www.upsite.com/blog/data-center-cooling-effectiveness-versus-efficiency/
- Data Center Frontier：https://www.datacenterfrontier.com/special-reports/article/11427966/new-liquid-cooling-designs-refine-options-for-data-centers
- HPE：https://www.hpe.com/us/en/what-is/liquid-cooling.html
- DIGITIMES：https://www.digitimes.com.tw/tech/rpt/SubChannel_3_HKC.asp?CnlID=3&cat=HKC
- 經濟日報：https://money.udn.com/money/story/5607/9137791
- 科技新報（800V 研發）：https://technews.tw/?p=1558171
