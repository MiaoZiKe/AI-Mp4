# research.md — CoWoS 是什麼（科技頻道樣片）

查證日期：2026/11/12（台灣時間 11/13 凌晨）。狀態分三種：**已確定**（官方資料或多個來源一致）、**分析預期**（法人、研調、媒體的估計）、**尚未確定**。

## 0. 查證方式與限制（先講清楚）

- 這次只能用網路搜尋的摘要查證，**沒有一頁是親自打開讀完原文的**。兩個想開的站都被這個雲端環境的網路設定擋下：`3dfabric.tsmc.com`（台積電 CoWoS 官方技術頁）、`www.trendforce.com`。照規定沒有繞過，也沒有再試其他站。
- 所以下面每一條的「來源」是搜尋結果指到的網址與摘要內容。結構類的說法（三層怎麼疊）多個來源一致，風險低；數字類（產能）都是法人估計，各家差很多，旁白只用了最保守的一種講法。
- 第二輪複查（同日稍晚）：再試了 `3dfabric.tsmc.com`、`pr.tsmc.com`，一樣解析不到（不在這個環境允許的網域內），照規定停止再開其他站，改用搜尋多查五次交叉比對。複查改了四處：F5 補了 Chip Scale Review 的出處；F6 拿掉查不到的「2011 年發表」；F7 補上「第一個客戶」兩種說法不一致；F11 補上 2026/10/15 法說會「後段產能確實有些短缺」的報導；格羅方德協議找到第二個出處。旁白一個字都不用改。
- 要補強：請在網路設定放行 `3dfabric.tsmc.com`、`pr.tsmc.com`、`investor.tsmc.com`、`technews.tw`、`www.trendforce.com`，配音前把 F1–F4、F9、F10 的原文讀一次。

## 1. 事實表

| 編號 | 事實 | 來源（連結／日期） | 狀態 | 旁白用在哪 |
|---|---|---|---|---|
| F1 | CoWoS 全名 Chip-on-Wafer-on-Substrate，是台積電的先進封裝技術，屬於 2.5D 封裝（晶片水平並排，不是垂直堆疊） | 台積電 3DFabric 技術頁 https://3dfabric.tsmc.com/chinese/dedicatedFoundry/technology/cowos.htm （沒開成）；科技新報 2025/9/8 https://technews.tw/2025/09/08/what-is-cowos-copos-cowop/ ；鉅亨 https://hao.cnyes.com/post/81358 （日期沒確認） | 已確定 | 句 3 |
| F2 | 「封裝」是把做好的晶片接上對外線路並保護起來的後段工序 | 同 F1 的科普文；通識 | 已確定（通識） | 句 4 |
| F3 | 結構由上到下三層：最上面是晶片（GPU 這類邏輯晶片，和 HBM 記憶體並排）→ 中間是中介層（interposer）→ 最下面是基板（substrate），基板再接到外部電路板。晶片用微凸塊（micro bump）接中介層；中介層裡有金屬線連接不同晶片，並用矽穿孔（TSV）往下連到基板 | 同 F1；penchan.co https://penchan.co/market/ai/supply-chain/cowos/ （日期沒確認）；名稱拆解 CoW＝晶片放上中介層晶圓、WoS＝再放上基板，見 TrendForce 2026/8/5 https://www.trendforce.com/news/2026/08/05/news-tsmc-reportedly-expands-outsourcing-of-key-cowos-front-end-step-to-osats-amid-rising-nvidia-asic-demand/ （沒開成） | 已確定 | 句 5–8 |
| F4 | 中介層依材質分三種：CoWoS-S（一整片矽中介層）、CoWoS-R（RDL 重佈線層，有機材料）、CoWoS-L（RDL 裡埋小塊矽橋 LSI）。目前最高階 AI 晶片多用 CoWoS-L | 同 F1；Tom's Hardware（台積電技術論壇報導）https://www.tomshardware.com/tech-industry/tsmc-mulls-massive-1000w-class-multi-chiplet-processors-with-40x-the-performance-of-standard-models | 已確定（分類）；「多用 L」是媒體描述 | 句 8 只說「通常用矽做」，不說「一整片矽」 |
| F5 | 為什麼要中介層：晶片這一側的微凸塊間距大約 30–60 微米（常見說法 40 微米），基板這一側的 C4 凸塊間距約 130 微米；基板的線做不到那麼細，中介層用晶圓製程做出細很多的線，把密的接點「轉」到粗的那一側，同時讓邏輯晶片和 HBM 之間走很短的線 | 台積電 Hot Chips 2021 簡報（PDF）https://www.hc33.hotchips.org/assets/program/tutorials/2021%20HotChips%20TSMC%20Packaging%20Technologies%20for%20Chiplets%20and%203D_0819%20publish_public.pdf ；ECTC 2023 論文（搜尋摘要）；SemiWiki 2022 技術論壇整理 https://semiwiki.com/semiconductor-manufacturers/tsmc/314439-tsmc-2022-technology-symposium-review-advanced-packaging-development/ ；Chip Scale Review 2022/3–4 月號（搜尋摘要：CoWoS 微凸塊約 35 微米、C4 約 130 微米）https://chipscalereview.com/wp-content/uploads/flipbook/25/files/basic-html/page38.html | 已確定（數字是量級，各代不同；Hot Chips 簡報裡的 130 微米是列在 InFO_oS 那一欄，CoWoS 的 130 微米出自 Chip Scale Review） | 句 9–11；旁白不念數字，畫面只寫「密／粗」 |
| F6 | CoWoS 在 2012 年推出（台積電自己的時間表把 2012 年列為第一個客戶產品；「2011 年發表」複查時查不到出處，只查到 2011 年有一篇 ECTC 論文，所以不寫），第一個產品是替賽靈思（Xilinx）做的 28 奈米 FPGA（四顆並排放在矽中介層上）；2013/10 兩家公司宣布量產 | 台積電新聞稿 2013/10 https://pr.tsmc.com/english/news/1792 ；WikiChip https://en.wikichip.org/wiki/CoWoS ；SemiWiki https://semiwiki.com/semiconductor-manufacturers/tsmc/366052-the-chronicle-of-tsmc-cowos | 已確定 | 句 12「十幾年前就有了」 |
| F7 | 剛推出時幾乎沒有客戶：蔣尚義回憶 CoWoS 剛推出時沒有訂單，高通主管說太貴，後來才請余振華做出較便宜的 InFO | 經理人 https://www.managertoday.com.tw/articles/view/67355 ；數位時代 https://www.bnext.com.tw/article/76589/chiang-talk-about-china-janis ；科技新報 2018/4/22 https://technews.tw/2018/04/22/tsmc-packaging-technology/ ；TrendForce 2023/9/4 https://www.trendforce.com/news/2023/09/04/news-chiang-shang-yi-former-tsmc-co-coo-shares-china-experience-and-cowos-development/ （沒開成，搜尋摘要） | 已確定（屬當事人 2023/9 受訪的回憶，原話是一開始沒什麼生意）。**第一個客戶是誰，兩種說法不一致**：台積電時間表與 SemiWiki 寫賽靈思（2012），蔣尚義受訪說是華為。旁白兩邊都不提，只說「幾乎沒訂單」 | 句 12 |
| F8 | AI 加速晶片需要在運算晶片旁邊放很多顆 HBM（高頻寬記憶體，本身是多層記憶體晶片疊起來的）：台積電路線圖寫 3.3 倍光罩尺寸可放 8 顆 HBM、5.5 倍可放 12 顆 | Tom's Hardware（2026 技術論壇）https://www.tomshardware.com/tech-industry/semiconductors/tsmcs-details-next-gen-cowos-roadmap-over-14-reticle-packages-and-48x-leap-in-compute-power-expected-by-2029-massive-size-enables-24-hbm5e-stacks-and-additional-memory-bandwidth-jump ；TrendForce 2025/5/2 https://www.trendforce.com/news/2025/05/02/news-wafer-level-packaging-showdown-tsmc-scales-up-cowos-reticle-size-as-intel-readies-foveros-s/ （沒開成） | 已確定（路線圖數字） | 句 13、18、19；旁白不念顆數 |
| F9 | 封裝越做越大：2026/10/15 法說會，魏哲家說台積電已量產 5 倍光罩尺寸的先進封裝，正在開發 9 倍、14 倍，並推進面板級的 CoPoS；也說 CoWoS 仍是客戶首選 | 經濟日報 https://money.udn.com/money/story/5612/9816830 ；中時 2026/10/15 https://www.chinatimes.com/realtimenews/20261015003623-260410 ；風傳媒 https://www.storm.mg/article/11172764 | 已確定（媒體轉述法說會；逐字稿沒讀到） | 句 15 前半 |
| F10 | 產能（台積電沒有公布，全部是法人或研調估計）：2025 年底約每月 7 萬片 → 2026 年底約 11.5 萬片（中央社／商周引法人）；其他估計 12 萬、13 萬、14 萬片；2027 年底估 17–22 萬片 | 商周轉載中央社 https://www.businessweekly.com.tw/business/blog/3020420 （2026 年，日期沒確認）；旺得富 2026/10/8 https://wantrich.chinatimes.com/news/20261008900006-420101 ；SemiWiki https://semiwiki.com/semiconductor-manufacturers/tsmc/373574-tsmcs-cowos-capacity-to-double-by-2028-and-rivals-will-still-win-orders/ | **分析預期** | 句 14：用最低的一組（7 萬 → 11.5 萬，＋64%）講「多一半以上」，並明講「法人估」 |
| F11 | 供給仍然吃緊：2026/4/16 法說會報導寫「先進封裝產能持續吃緊」；中央社／商周標題「CoWoS 供不應求，台積電加碼擴產」；2026/10/8 報導「擴產速度仍難完全跟上需求」；另有報導說台積電把部分前段步驟外包給封測廠 | 科技新報 2026/4/16 https://finance.technews.tw/2026/04/16/intel-emib-copos/ ；同 F10 兩篇；TrendForce 2026/8/5（同 F3） ；優分析（轉鉅亨）2026/10/15〈台積電法說〉攜手格羅方德生產中介層 魏哲家：後段產能確實有些短缺 https://uanalyze.com.tw/articles/1414957168 | **分析預期**（媒體與法人的判斷）。2026/10/15 法說會有一則報導標題寫魏哲家說「後段產能確實有些短缺」，但只有這一個出處、逐字稿沒讀到；另一則搜尋摘要寫他說「仍供不應求」，複查時找不到對應原文（查到的「供不應求」原話是 2024、2025 年法說會的）。所以旁白維持「外界多半認為」 | 句 15 後半：「外界多半認為還不夠」 |
| F12 | 「AI 晶片供不應求、CoWoS 是出貨瓶頸之一」是近三年媒體與研調的普遍說法；瓶頸不只 CoWoS，還有 HBM、基板、測試 | 同 F1、F10；搜尋摘要提到良率、HBM、基板、測試也可能是瓶頸 | 分析預期（普遍說法） | 句 1–2：寫「問題不只在晶片本身」「還有一關」，不說「全都卡在 CoWoS」 |

### 查了但不採用

| 說法 | 為什麼不用 |
|---|---|
| 「輝達拿走 CoWoS 一半以上／六成產能」 | 配額不公開，只有供應鏈估計，而且這次搜尋沒找到可靠出處 |
| 「台積電和格羅方德簽 5 年 20 億美元協議生產中介層」 | 複查找到出處：優分析 2026/10/15 的法說會報導寫格羅方德 10/8 宣布、矽中介層預計 2028 年上半年擴大量產（https://uanalyze.com.tw/articles/1414957168）。但只有這一則、原文沒讀到，而且和「三層是什麼」這條主線無關。**尚未確定（單一來源），不用** |
| 「供需缺口 20%、年底縮到 10%」 | 單一來源轉述 |
| 「賽靈思當年一個月只下 50 片」 | 單一二手來源 |
| 微凸塊 40 微米、C4 130 微米這類數字 | 是對的量級，但各世代不同，念出來容易被抓錯，只留在這份文件 |

## 2. 觀眾會被吸引的鉤子（三個）

1. **「AI 晶片老是不夠賣，問題不只在晶片本身。」**（採用）反直覺：大家以為難的是做晶片，結果還有一關在「包起來」。畫面大字「AI 晶片卡在這 3 層」。
2. 「這技術十幾年前就有了，一開始幾乎沒訂單。」冷板凳變搶手貨的故事（放在轉折段）。
3. 「新聞天天講 CoWoS 產能，你知道那是在算什麼嗎？」從新聞標題切入（放在收尾回扣）。

## 3. 常見誤解

| 編號 | 誤解 | 實際 |
|---|---|---|
| M1 | CoWoS 是一種晶片／一種製程（像 3 奈米） | 是封裝：晶片做好之後怎麼接、怎麼疊 |
| M2 | CoWoS 是把晶片一顆一顆往上疊（3D） | 是 2.5D：晶片並排放在中介層上。往上疊的是 HBM 自己內部，還有台積電另一項技術 SoIC |
| M3 | 封裝就是套個塑膠殼，沒技術 | 中介層是用晶圓製程做的，線比基板細很多 |
| M4 | 中介層一定是一整片矽 | CoWoS-S 是；CoWoS-R 是有機重佈線層，CoWoS-L 是重佈線層加小塊矽橋 |
| M5 | 產能幾萬片＝幾萬顆晶片 | 單位是晶圓片數（每月）；一片能切出幾顆要看封裝多大，封裝越大顆數越少（這句是推論，旁白沒講） |
| M6 | AI 晶片缺貨全都是 CoWoS 的錯 | 它是瓶頸之一，HBM、基板、測試也是 |
| M7 | 只有台積電能做 | 日月光、艾克爾等封測廠也有相關產能，英特爾有 EMIB、三星也有自己的方案 |

## 4. 可用的比喻

| 比喻 | 對應 | 用在哪 | 限制 |
|---|---|---|---|
| A. 三層（像三明治／千層） | 晶片／中介層／基板 | 主軸，句 5–8、16 | 只說「三層」，不說三明治，避免太可愛 |
| B. 轉接板 | 中介層把密的接點轉到粗的線路 | 句 11（採用） | 中介層不只轉接，還負責晶片之間互連；所以同一句補「讓兩邊靠得近、傳得快」 |
| C. 細巷子接大馬路要有匝道 | 接點間距不合 | 備用，畫面可以用「密／粗」兩張紙示意 | 沒用在旁白 |
| D. 大樓 | HBM 內部是疊起來的 | 句 19，當下一集的鉤子 | 只講 HBM 自己是疊的，不要讓人以為 CoWoS 是疊的（見 M2） |

## 5. 下一集可以接的題目

HBM 為什麼要疊（片尾卡已預告）；之後可接 CoPoS／面板級封裝、矽光子。
