# ASML EUV 曝光機：從光源到晶圓的物理規格（給 3D 動畫師）

查證日期：2026/11/25｜查證方式：WebSearch 摘要（讀不到原文全文，只能引用摘要講到的內容）
信心度：**高**＝兩個以上獨立來源一致，或 ASML／ZEISS 官方明講｜**中**＝只有一個可靠來源，或來源之間有小落差｜**低**＝推算或單一間接來源｜**查不到**＝找過但沒有可引用的數字

> 總原則：EUV（13.5 奈米）**人眼看不見**、在空氣中會被吸收，整條光路都在真空裡。動畫上所有「看得到的光」都是示意，畫面要標「示意，實際不可見」。

---

## 1. 錫滴

| 項目 | 數值 | 信心 | 來源與分歧 |
|---|---|---|---|
| 直徑 | 約 25–30 微米（µm） | 高 | ASML〈The hottest thing about ASML machines〉：約 25 µm；美國專利 US11506986（微影熱控）：約 30 µm；Laser Focus World〈Pre-pulse technology scales EUV source power〉：原始直徑約 30 µm。**分歧**：官方 25、專利與期刊 30，動畫寫「約 25–30 微米」即可 |
| 頻率 | 每秒約 5 萬顆（50 kHz） | 高 | ASML 官網：流程每秒重複 5 萬次；專利 US11506986：約 50 kHz；arXiv 2311.01384：約 50 kHz |
| 速度 | 約 70 公尺／秒 | 高 | ASML 官網：70 m/s；專利 US11506986：約 70 m/s（另有 Frontiers 期刊寫 60 m/s，同量級） |
| 方向 | 從噴嘴射出成一串，穿過雷射焦點 | 中 | ASML 官網摘要用「落下中的錫滴（falling droplet）」描述；但各家專利圖多畫成**水平或斜向射出**、另一側有錫滴接收器。**查不到** NXE 的實際噴出角度。動畫建議：錫滴從畫面一側噴出、穿過焦點、進入對側接收器，不必強調「垂直落下」 |
| 相鄰兩顆間距 | 約 1.4 毫米（推算） | 低 | 自己算：70 m/s ÷ 50,000 = 1.4 mm。沒有來源直接寫 |
| 未來 | 每秒 10 萬顆、每顆打 3 發（2 發預脈衝＋1 發主脈衝），目標 2030 年 1000 W | 中 | heise.de〈ASML will shoot tin droplets 300,000 times per second〉（媒體報導，單一來源） |

## 2. 雷射（預脈衝＋主脈衝）

| 項目 | 數值 | 信心 | 來源與分歧 |
|---|---|---|---|
| 主脈衝雷射 | CO2 雷射，波長 10.6 µm（紅外線，看不見） | 高 | arXiv 2311.01384；多篇 ASML／Cymer 專利 |
| 雷射功率 | 20 kW 以上；新機到約 27–40 kW | 中 | ASML 投影片（Scribd 轉載）：>20 kW 脈衝；專利 US11506986：至少 20 kW、例如 27 kW；heise.de：最高約 40 kW。**分歧**是機型世代不同，不是互相矛盾 |
| 每顆錫滴挨幾發 | 2 發：弱的預脈衝＋強的主脈衝 → 雷射每秒約 10 萬發 | 高 | ASML〈hottest thing〉頁；ASML〈light and lasers〉頁 |
| 預脈衝效果 | 把錫滴打扁成「薄餅／圓盤」，增加主脈衝打得到的面積 | 高 | ASML 官網（pancake）；Laser Focus World；arXiv 2311.01384（thin liquid tin disk） |
| 圓盤尺寸 | 從約 30 µm 攤開到 100 µm 以上、到「數百微米」 | 中 | Laser Focus World：>100 µm；arXiv 2311.01384：直徑數百微米。沒有 ASML 官方數字 |
| 圓盤厚度 | 比原錫滴薄很多（沒有數字） | 查不到 | 只有「厚度變薄」的定性描述 |
| 攤開速度 | 半徑方向約 90 m/s（實驗室 2 µm 雷射研究） | 低 | arXiv 2103.14758，非 ASML 機台 |
| 預脈衝→主脈衝時間差 | 約 0–4 微秒（µs） | 中 | 專利 US11224115 等：數微秒（例 3–4 µs）；arXiv 2103.14758：0–3 µs，用時間差控制圓盤大小 |
| 主脈衝長度 | 數十奈秒（ns） | 中 | 專利（同上）：tens of nanoseconds |
| 雷射進入方向 | **穿過收集鏡正中央的孔**，從收集鏡背面打向錫滴 | 中 | 專利 US10917959／US11723141（EUV radiation modification）：雷射穿過收集鏡的孔打到錫滴。台積電、Cymer 專利圖多半也是這樣畫；但沒有 ASML 官方文字逐字確認 NXE |
| 雷射光束粗細 | 查不到 | 查不到 | 專利只說「聚焦點可調、要和圓盤大小匹配」，沒有數字。動畫建議：在收集鏡孔附近畫成約手指粗的錐形光束，越近錫滴越細，標「示意」 |
| 雷射放哪裡 | 雷射主體放在**無塵室樓下的次無塵室（subfab）**，光束經導光系統往上送進光源腔 | 中 | 專利（laser system on subfab floor below clean room floor）；另一系列 Cymer 專利〈Drive laser delivery systems〉〈Beam transport system〉講導光鏡組。單一專利群，無官方圖示 |

## 3. 電漿發光

| 項目 | 數值 | 信心 | 來源與分歧 |
|---|---|---|---|
| 電漿溫度 | 約 50 萬度（K），比太陽表面熱 | 高 | ASML〈hottest thing〉頁；Bits & Chips〈Tracing the path of light〉（錫原子被剝掉多達 13 個電子） |
| 波長 | 13.5 奈米，2% 頻寬內才算可用 | 高 | ASML〈light and lasers〉；多篇論文（in-band 2% bandwidth） |
| 能量轉換率 | 雷射能量約 2–4% 變成可用 EUV（研究紀錄約 3.2%） | 中 | 專利：CO2 驅動約 2–4%；Purdue 2012 論文模擬約 3%；另一研究 3.2%。ASML 自家較新的數字（常被說約 5–6%）**查不到可引用來源** |
| 每次發光持續多久 | 查不到直接量測值；**推估**與主脈衝同量級（數十奈秒） | 低 | 只有主脈衝長度「數十奈秒」可引用；發光時間是推論 |
| 發光方向 | **不是完美的四面八方**：主要射向迎著雷射的那半個球面，偏離電漿膨脹方向會變弱 | 中 | Purdue／Harilal 2014 論文：13.5 nm 強度隨角度下降；另一研究：對微影有用的是「面向雷射的半球」。這與收集鏡蓋在雷射來向那一側的設計一致 |
| 動畫慣用色 | **查不到 ASML 官方指定顏色** | 查不到 | ASML〈hot machines〉、〈optical engineering jobs〉頁都有嵌入影片，但搜尋摘要沒有描述顏色。動畫建議見第 10 節 |

## 4. 收集鏡（Collector）

| 項目 | 數值 | 信心 | 來源與分歧 |
|---|---|---|---|
| 形狀 | 橢球面凹鏡（像車頭燈反射罩），近垂直入射的鉬／矽多層膜 | 高 | Bits & Chips（headlight 形狀）；專利（第一焦點 F1 放光源、第二焦點 F2 是中間焦點 IF） |
| 幾何 | 第一焦點＝電漿點；第二焦點＝中間焦點（IF），IF 是光源模組與曝光機本體的交界口 | 高 | 專利 EP2083328 等（source at F1, IF at F2） |
| 尺寸 | 直徑 660 mm 以上、鏡面深度（矢高）150 mm 以上、約 50 kg；NXE:3100 世代 | 中 | Fraunhofer IOF 2009 年報（T. Feigl）。單一來源，且是早期機型；新機型尺寸**查不到** |
| 收光立體角 | 約 5.5 球面度（sr），約等於從電漿看出去半錐角約 83°（推算），接近半個球 | 中 | 同上 Fraunhofer；半錐角是自己用 2π(1−cosθ)=5.5 算的 |
| 反射率 | 中心區約 64–65%、外圈 57–64% | 中 | 同上 Fraunhofer |
| 中央孔 | 有，讓 CO2 雷射穿過；射向孔的 EUV 等於浪費 | 中 | 專利 US10917959 系列 |
| 到 IF 的距離、IF 端光錐角 | **NXE 的數字查不到** | 查不到 | 唯一找到的數字是另一種設計（Wolter 掠射式，EP1901126）：光源到 IF 1500 mm、IF 端 NA 0.139（約 8°）。**這不是 NXE 的 LPP 收集鏡，不可直接套用** |
| IF 開口方向 | 一份專利描述 IF 單元對準收集鏡法線、開口朝曝光機內 | 低 | 專利 US9826615（單一來源） |
| 壽命 | 錫屑會弄髒，通常一年多換一次乾淨的收集鏡 | 中 | Bits & Chips（媒體） |

動畫幾何建議：收集鏡是一個大碗，碗口朝前（朝 IF 方向）；電漿在碗前方約碗深處（F1），光從電漿射到碗面、反射後**收斂**成一個光錐，尖端落在遠處的 IF（F2）。實際張角查不到，建議收斂光錐半角畫 8–15°（示意）。

## 5. 照明系統（Illuminator）

| 項目 | 內容 | 信心 | 來源 |
|---|---|---|---|
| 進入點 | 光從 IF 進入照明系統後是**發散**的 | 高 | 幾何必然（IF 是焦點，過焦點後擴散） |
| 場面鏡（field facet mirror） | 由很多小鏡片組成的「複眼」，把光切成許多小光束，每片小鏡的形狀＝曝光縫的形狀 | 高 | 多篇 ZEISS 專利（US10976668、US9823577 等） |
| 光瞳面鏡（pupil facet mirror） | 每片場面鏡對應一片（或兩片）光瞳面鏡，形成許多「二次光源」；挑選哪些小鏡亮，決定照明形狀（環形、雙極等） | 高 | 同上專利（每對 field／pupil facet＝一個光通道；二次光源在 pupil facet 上） |
| 後續轉像鏡 | 光瞳面鏡後再約 3 面鏡把各小光束疊到光罩上，均勻照亮一條縫 | 中 | 專利 US8817233 系列（three reflecting mirrors downstream of pupil facet mirror） |
| 照明鏡總數 | NXE 約 4 面；High-NA 減為 3 面，光變成幾乎水平射入曝光機 | 中 | Bits & Chips（ZEISS 把照明鏡從 4 面減到 3 面，光幾乎水平進入） |
| 光到光罩時的形狀 | **一條彎彎的弧形窄縫**，寬約 26 mm（光罩上是 4 倍＝約 104 mm） | 中 | SPIE 論文〈Scanner arc illumination and impact on EUV photomasks〉（標題即「弧形照明」）；ZEISS 2012 表格：場寬 26 mm／4 倍。縫的高度（掃描方向）**查不到** |

動畫建議：IF 之後光錐先張開打在場面鏡（一整片馬賽克小方塊），反射成很多細光束交叉到光瞳面鏡（圓形排列的小圓鏡），再匯聚成一條**彎月形光帶**打到光罩。

## 6. 光罩

| 項目 | 數值 | 信心 | 來源與分歧 |
|---|---|---|---|
| 類型 | 反射式（多層膜鏡＋吸收層圖案），不是透光 | 高 | ASML〈optical engineering jobs〉頁（光從光罩反射後進入投影光學）；所有 EUV 文獻 |
| 斜入射角 | 主光線約 6°（從光罩法線量） | 高 | ZEISS 專利（主光線入射角最多 6°）；ZEISS 2015 Heil 投影片（光罩端主光線角 6°） |
| 為什麼要斜 | 反射式光罩，入射與反射光要分開；但斜入射會在吸收層邊緣造成陰影（光罩 3D 效應） | 高 | SPIE BACUS 2013 newsletter；SPIE 9776 論文 |
| 光罩可用角度上限 | 約 ±11°，0.33 NA＋4 倍已接近上限，所以 High-NA 改用 4×／8× 變形設計 | 中 | ASML 論文（SPIE 10450）摘要 |
| 光罩朝向 | 光罩通常**圖案面朝下**，光從下方打上去再反射往下進投影鏡組 | 低 | 未查到可引用文字；常見示意圖如此畫。動畫若不確定，維持「光罩在上方、光從下斜打上去」即可 |

## 7. 投影鏡組（Projection Optics，ZEISS 製）

| 項目 | 數值 | 信心 | 來源與分歧 |
|---|---|---|---|
| NXE（Low-NA） | 6 面反射鏡、NA 0.33、縮小 4 倍、光路總長約 1.65 m、場寬 26 mm | 高 | ZEISS 2012 EUVL Symposium（M. Lowisch）表格；6 面鏡也與 Laser Focus World「六鏡投影透光約 12%」一致 |
| High-NA（EXE） | NA 0.55；**變形（anamorphic）**：縫方向 4 倍、掃描方向 8 倍；出瞳中央有遮擋（中間有洞） | 高 | ASML 論文（SPIE 10450）；ZEISS Heil 2015 投影片 |
| High-NA 鏡數 | **查不到官方數字**（常被說 8 面，但找到的只有 ZEISS「0.60 NA 研究設計用 8 面」與「示意圖」） | 低 | ZEISS 2012 表格（0.60 NA 選項 8 面，非量產品）；ZEISS 2011 投影片（標明僅供示意） |
| High-NA 鏡子大小 | 約為 NXE 的 2 倍大、10 倍重，重數百公斤 | 高 | ZEISS 官網〈High-NA-EUV lithography〉 |
| 光路形狀 | 光在 6 面鏡之間**上下來回折返**（Z 字形），從光罩下來，最後由最下面那面鏡打到晶圓 | 中 | 多篇反射式投影專利（US7154586 等）的結構；ZEISS 未公布實際處方 |

動畫建議：投影鏡組畫成一個高筒，光從頂端斜進來，在左右兩側的鏡子之間 Z 字形往下折 5～6 次，光束整體**逐漸收斂**，最後細細一束打在晶圓上的弧形縫。

## 8. 到晶圓

| 項目 | 數值 | 信心 | 來源與分歧 |
|---|---|---|---|
| 曝光場 | NXE 全場 26 × 33 mm；High-NA 半場 26 × 16.5 mm | 高 | ZEISS Heil 2015（26 mm 縫寬、26 × 16.5 半場）；ZEISS 2012（26 mm／4 倍）。33 mm 是由「半場 16.5 mm」反推的全場高度，與業界標準一致 |
| 曝光方式 | 掃描：只有一條弧形縫亮著，光罩台與晶圓台**反方向**同步移動，把整個場掃過去 | 高 | ASML〈mechanics and mechatronics〉頁（兩台反向加速）；ZEISS 專利（slit／scan） |
| 速度比 | 光罩台移動距離＝晶圓台的 4 倍（High-NA 掃描方向 8 倍） | 高 | 由縮小倍率直接得出；ASML 官網「光罩要移動得更遠更快」 |
| 加速度 | EXE：光罩台 32 g、晶圓台 8 g；換算 NXE 約光罩台 8 g、晶圓台 4 g | 中 | ASML〈5 things you should know about High NA〉（EXE 光罩台 32 g＝NXE 的 4 倍；晶圓台 8 g＝NXE 的 2 倍）。**分歧**：ASML〈mechanics and mechatronics〉頁寫晶圓 5 g、光罩 15 g（約 150 m/s²），沒標機型。兩個都是 ASML 官方，可能是不同世代 |
| 掃描速度（m/s） | 查不到 | 查不到 | ASML NXE:3800E 只寫「更快的晶圓台」，沒數字 |
| 產能 | NXE:3800E 目標每小時 220 片以上（30 mJ/cm²） | 中 | ASML 2023 投影片（euvlitho.com P62） |
| 光到晶圓剩多少 | 不到 1%（由光源出來的 EUV 到晶圓） | 高 | Laser Focus World：6 鏡投影透光約 12%，加上照明與反射光罩後不到 1%；專利：12 面以上鏡子時不到 1% 能到晶圓。每面鏡反射率約 67–70%（專利／Laser Focus World） |

## 9. 整機尺寸與模組相對位置

| 項目 | 內容 | 信心 | 來源與分歧 |
|---|---|---|---|
| 重量 | Low-NA 約 180 噸；High-NA 約 150–165 噸 | 中 | igorslab（約 180 噸，沒寫機型）；Tom's Hardware（EXE:5000 約 33 萬磅≈150 噸）；Data Center Knowledge 轉 Bloomberg（約 165 噸）。**分歧**：High-NA 150 vs 165 噸，且有報導說 High-NA 比 Low-NA 輕，與直覺相反，畫面不要寫精確噸數 |
| 運輸 | 約 40 個貨櫃、20 輛卡車、3 架 747；High-NA 250 箱（含 13 個大貨櫃） | 中 | Asia Times 2021；Reuters 解說（約 40 個貨櫃）；High-NA 數字來自 Intel 交機報導 |
| 長寬高 | 查不到可引用的公尺數 | 查不到 | 常見說法「像一台公車大小」沒有找到可靠出處 |
| 相對位置 | ① CO2 雷射在**樓下 subfab**，導光往上；② 光源腔（錫滴＋收集鏡）在主機**一側後方**；③ IF 後光進入照明系統；④ 光罩台在**上層**；⑤ 投影鏡組在中間；⑥ 晶圓台在**最下層** | 中 | ①：雷射放 subfab 的專利；②～⑥：ASML〈hottest thing〉頁列的組件（光源、光學柱、光罩、晶圓台）與 ASML 光路描述（光源→照明→光罩→投影→晶圓）；High-NA 光「幾乎水平」進入（Bits & Chips）。實際尺寸比例查不到 |

## 10. 給動畫師的光路建議

| 段落 | 光錐方向 | 亮度 | 顏色建議 | 標註 |
|---|---|---|---|---|
| CO2 雷射（預脈衝） | 從收集鏡中央孔往外，**收斂**到錫滴 | 弱、短閃一下 | 暗紅／橘紅（紅外線慣例） | 「雷射（紅外線，示意）」 |
| CO2 雷射（主脈衝） | 同上，比預脈衝粗、亮 | 強閃 | 亮橘紅 | 同上 |
| 電漿 | 一個小點，向面對雷射的半球**發散** | 全片最亮的點，白熱核心 | 中心白、外圈藍紫 | 「約 50 萬度電漿」「13.5 奈米，實際不可見」 |
| 電漿→收集鏡 | 發散 | 亮 | 藍紫 | 示意 |
| 收集鏡→IF | **收斂**成光錐，尖端在 IF | 亮度降一級（反射率約 65%） | 藍紫 | 「中間焦點」 |
| IF→場面鏡 | **發散** | 再降 | 藍紫 | |
| 場面鏡→光瞳面鏡→光罩 | 切成多束細光，交叉後匯聚成弧形帶 | 再降 | 藍紫，細束可半透明 | 「複眼鏡」 |
| 光罩→投影鏡組 | 帶著圖案（可畫成光束裡有線條紋路），Z 字形折返 | 每反射一次暗一些（每面約 70%） | 藍紫 | 「縮小 4 倍」 |
| 投影鏡組→晶圓 | **收斂**到一條弧形縫 | 最暗（不到光源的 1%） | 藍紫 | 「光掃過晶圓，示意」 |

- 顏色：**查不到 ASML 官方指定色**。13.5 nm 在紫外線再往外，媒體與教學影片習慣用藍紫或紫色代表「比紫光還短」；雷射紅外線習慣用紅橘。這是業界常見做法，不是官方規定。
- 速度：真實每秒 5 萬次，動畫要放慢到能看清，畫面標「放慢示意」；錫滴與圓盤放大數千倍，標「放大示意」。
- 亮度衰減要看得出來，但最後打到晶圓的光不能暗到看不見——建議用「越往後越細、越淡」表現，不要直接讓光消失。
- 每段反射鏡都標「多層膜反射鏡」，反射角度不必準，但**光罩要明顯是斜進斜出**（約 6°，可誇張成 15° 讓觀眾看得懂，標示意）。
- 掃描動作：光罩台與晶圓台反方向移動，光罩台移動距離畫成晶圓台的 4 倍。

---

## 查不到的項目（截至 2026/11/25）

1. 錫滴在 NXE 內的實際噴出方向（水平或垂直）。
2. CO2 雷射光束直徑、聚焦點大小。
3. 單次 EUV 發光持續時間（只能推估與主脈衝同為數十奈秒）。
4. NXE 收集鏡到 IF 的距離與 IF 端光錐張角（找到的 0.139 NA 是另一種掠射式設計，不可用）。
5. 照明縫在掃描方向的高度。
6. High-NA 投影鏡組的鏡子數量（常說 8 面，但沒有官方可引用文字）。
7. 光罩台／晶圓台的掃描速度（m/s）。
8. 整機長寬高。
9. ASML 官方動畫的光線配色。

## 來源清單

- ASML〈The hottest thing about ASML machines〉https://www.asml.com/en/discover/hot-machines
- ASML〈Light and lasers〉https://www.asml.com/en/technology/lithography-principles/light-and-lasers
- ASML〈Mechanics and mechatronics〉https://asml.com/en/technology/lithography-principles/mechanics-and-mechatronics
- ASML〈5 things you should know about High NA EUV lithography〉https://www.asml.com/en/news/stories/2024/5-things-high-na-euv
- ASML〈Optical engineering jobs〉https://www.asml.com/en/careers/technical-fields/optical-engineering-jobs
- ASML NXE:3800E 投影片（euvlitho.com 2023 P62）https://euvlitho.com/2023/P62.pdf
- ZEISS〈High-NA EUV lithography〉https://www.zeiss.com/semiconductor-manufacturing-technology/inspiring-technology/high-na-euv-lithography.html
- ZEISS M. Lowisch，EUVL Symposium 2012 https://euvlsymposium.lbl.gov/pdf/2012/pres/M.%20Lowisch.pdf
- ZEISS T. Heil，EUVL Symposium 2015 https://euvlsymposium.lbl.gov/pdf/2015/Oral_Wednesday/Session9_EUV%20Lithography%20Extendibility/S9.2_Heil.pdf
- ASML High-NA 論文 SPIE 10450 https://ebooks.spiedigitallibrary.org/conference-proceedings-of-spie/10450/104500W/
- Fraunhofer IOF 2009 年報（T. Feigl，收集鏡）https://www.iof.fraunhofer.de/content/dam/iof/en/documents/publications/annual-report/2009/Beitrag_T_Feigl.pdf
- Bits & Chips〈Tracing the path of light through an EUV scanner〉https://bits-chips.com/article/tracing-the-path-of-light-through-an-euv-scanner/（付費牆，只讀到開頭）
- Laser Focus World〈Pre-pulse technology scales EUV source power〉https://www.laserfocusworld.com/lasers-sources/article/16557052/lithography-pre-pulse-technology-scales-euv-source-power
- Laser Focus World〈Multilayer mirrors enable next-generation EUV lithography〉https://www.laserfocusworld.com/optics/article/16566714/
- heise.de〈ASML will shoot tin droplets 300,000 times per second〉https://heise.de/-11187649
- arXiv 2311.01384（錫滴受雷射變形模擬）；arXiv 2103.14758（預成形圓盤靶）；arXiv 2502.06417
- Purdue CMUXE 2012 POP 論文；Harilal 2014 POP 論文
- 美國專利：US11506986、US11224115、US10917959、US11723141、US9826615、US10976668、US9823577、US8817233、US8604452／US8829478（雷射導光）；歐洲專利 EP1901126（Wolter 設計，非 NXE）、EP2083328
- SPIE BACUS Newsletter 2013/5；SPIE 9231〈Scanner arc illumination and impact on EUV photomasks〉
- 重量與運輸：Tom's Hardware、Data Center Knowledge（轉 Bloomberg）、Asia Times 2021、Reuters 解說、igorslab
