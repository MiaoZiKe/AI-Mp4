# 扇出型與晶圓級封裝：查證紀錄（系列 3 第 5 集，科技透明圈）
查證日：2026-11-27。分類：已確定／媒體報導／分析推測／查不到（截至 2026/11/27）。

## 1. 技術（念稿與動畫依據）
| 項目 | 內容 | 來源 | 信心 |
|---|---|---|---|
| 晶圓級封裝（WLCSP，扇入型） | 晶圓還沒切就做好重佈線層與錫球，切開即成品；封裝面積約不超過晶片 1.2 倍，用在手機等小型裝置；重佈線層多為銅＋高分子絕緣層，把原本的焊墊移到錫球位置 | USPTO 9576912（WLCSP edge protection 背景段）、8624359 | 高 |
| 扇入的限制 | 錫球只能放在晶片面積內，球距有下限，接點數受限（標準 WLP 約數百個 I/O） | USPTO 8093722、8482136 | 中（專利背景敘述；不上片數字） |
| 扇出型（FOWLP）流程（晶片先放 chip-first） | 晶圓切割 → 挑好晶片精準排在暫時載盤 → 模封灌滿（環氧模料）成「重組晶圓」→ 拆載盤 → 做重佈線層（RDL）→ 植球 → 切割 | Chip Scale Review 2022 May/June p.38；USPTO 8772087、8999756（reconstituted wafer） | 高 |
| 晶片後放（chip-last／RDL-first） | 先做重佈線層，再用覆晶接合把晶片放上去後模封；避開 chip-first 的晶片偏移 | 日月光 Fan-Out Packaging 頁（廠商說法） | 中 |
| 翹曲 | 矽熱膨脹係數約 2–3 ppm/°C、模封料 >8 ppm/°C；模料與介電層固化應力 → 重組晶圓翹曲（模封後常呈「笑臉」形） | USPTO（reconstituted wafer 專利背景）；Chip Scale Review 2022 | 高（機制）／不上片數字 |
| 晶片偏移（die shift） | 模封時模料流動、樹脂固化收縮把晶片推歪，後面重佈線層會對不準；對策：調整式曝光（掃描實際位置再改線路） | USPTO 8772087 背景；Chip Scale Review 2022 | 高 |
| 台積電 InFO | 整合扇出型（Integrated Fan-Out），高密度重佈線層＋穿模銅柱（TIV）；InFO-PoP 沒有有機載板與 C4 凸塊；2016 年起大量出貨，用在 Apple A10（iPhone 7） | 台積電官網 3dfabric.tsmc.com InFO 頁；EE Times／Yole（A10 拆解）；MacRumors 2016/8/10 | 高 |

## 2. 公司
| 公司 | 內容 | 來源 | 分類 |
|---|---|---|---|
| 台積電（2330，台灣） | InFO 2016 年起量產、用於手機處理器 | 台積電官網；Yole | 已確定 |
| 力成（6239，台灣） | 扇出型面板級封裝（FOPLP），515×510 mm 方形面板；公司說良率已超過九成、客戶含 AMD、博通（媒體轉述），預計 2027 年中量產；購入友達新竹廠作基地 | 自由時報 ec.ltn.com.tw 5553359（2026/8）；經濟日報 money.udn.com 5607/9502946、9775554；財報狗 statementdog 17521 | 媒體報導（量產時程＝分析預期；客戶名單為媒體轉述，不上片） |
| 日月光（3711，台灣） | 扇出型封裝（chip-first、chip-last）產品頁 | ase.aseglobal.com Fan-Out Packaging | 廠商說法；本集不上公司卡（公司段限 2 家） |
**不要寫**：力成「已量產」FOPLP（截至 2026/11/27 尚未確定）；客戶名單；良率數字；「台積電發明扇出型」（扇出型早於 InFO，InFO 是台積電的版本）。

## 3. 比喻清單
| 比喻 | 幕 | 對應物理動作 | 風險 |
|---|---|---|---|
| 小便條寫滿電話 | s4 | 扇入型錫球只能放在晶片面積內，接點一多就放不下 | 無 |
| 餅乾排進烤盤、倒滿巧克力 | s5 | 好晶片排在載盤（間距拉大）→ 模封料灌滿縫隙 → 硬化成一片重組晶圓 | 輕微：巧克力是熔化倒入；模封是加熱加壓灌模，畫面標「模封（加熱加壓）」 |
| 延長線 | s6 | 重佈線層的銅線把晶片焊墊延伸到外圍模料區，錫球放到外圍 | 無 |

## 4. 分類
- 已確定：WLCSP 與扇出型流程、重佈線層、翹曲與晶片偏移機制、台積電 InFO 2016 起量產。
- 媒體報導／分析預期：力成 FOPLP 進度、2027 年中量產（截至 2026/11/27 尚未確定）。
- 查不到：力成 FOPLP 確切客戶（公司未正式公告名單）；各家扇出型市占。

## 5. 來源
[1] 台積電 InFO：https://3dfabric.tsmc.com/english/dedicatedFoundry/technology/InFO.htm
[2] Yole：New packaging for Apple's iPhone 7 A10 processor（yolegroup.com）；MacRumors 2016/08/10、2015/11/06
[3] Chip Scale Review 2022 May/June p.38（chipscalereview.com）
[4] USPTO 8772087、8999756、9576912、8624359、8093722、8482136
[5] 日月光 Fan-Out Packaging：https://ase.aseglobal.com/?p=45
[6] 自由時報 ec.ltn.com.tw/article/breakingnews/5553359；經濟日報 money.udn.com/money/story/5607/9502946、9775554；財報狗 statementdog.com/news/17521
