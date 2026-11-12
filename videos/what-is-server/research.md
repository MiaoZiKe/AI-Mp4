# research.md — 什麼是 Server（伺服器）

- slug：`what-is-server`｜系列第 1 集｜目標片長 45–75 秒（styleVersion 2）
- 查證日：2026/11/12（台灣時間）。所有數字以這天查到的公開資料為準。
- 查證方式：WebSearch。**限制**：本次工作環境無法直接打開原始網頁（例如 srgresearch.com 被網路設定擋下），所以數字是「搜尋結果摘要＋多個二手來源互相比對」，沒有逐一點進原文核對。表中「核對程度」欄有標示；進正式製作前，標「二手」的數字若要上畫面，建議再點原文確認一次。
- 沒有登入或爬取 IG／TikTok；「爆紅短影音鉤子」只查到公開的鉤子寫法文章，**沒有查到同主題爆紅影片的實際觀看數與標題**（見第 3 節說明）。

---

## 1. 白話定義（已確定，屬通識）

| 要講的事 | 白話說法 | 備註 |
|---|---|---|
| Server 是什麼 | 一台「專門幫別人做事」的電腦。你的手機開口要東西，它負責把東西送回來。 | Server 這個英文字本來就是「服務的人」；中文「伺服器」＝伺候、服務的機器。 |
| 誰在跟它要東西 | 你的手機、電腦，叫做 Client（客戶端）＝客人。 | 第一集只需要「你的手機」這個說法，Client 可以不出現。 |
| 一來一回 | 手機送出「請求」→ Server 處理 → 把結果「回應」回來。滑一下 IG，就是一次請求。 | 業界叫 request／response。 |
| 是硬體還是軟體 | 兩個都叫 Server：那台機器是，機器上負責回應的程式也是。 | 第一集講「機器」就好，軟體留到後面集數。 |
| 和家裡電腦差在哪 | 本質一樣是電腦（有 CPU、記憶體、硬碟），差在「工作條件」：24 小時不關機、同時服務很多人、壞一個零件不能停。 | 所以常見雙電源、可以不關機抽換硬碟、會自動糾錯的記憶體（ECC）、扁平機身一台台插進機櫃。 |
| 它長什麼樣、放哪裡 | 像披薩盒一樣扁的機器，一櫃一櫃疊起來，放在叫「資料中心」（機房）的大房子裡，有冷氣、備用電力、門禁。 | 資料中心細節留給第 3 集。 |

來源：Supermicro 名詞解釋、Lenovo 名詞解釋、Computer Hope、servermall／cycle.io 的 server vs PC 說明（見來源清單 S1–S4）。

### 日常例子（對應畫面可用）

| 情境 | 背後發生的事 | 可用數字 |
|---|---|---|
| 滑 IG | 照片影片不在你手機裡，是手機每滑一下就向 Meta 的 Server 要一次 | 台灣 IG 用戶約 1,360 萬（2026/4，NapoleonCat 依 Meta 廣告資料**估計**）S13 |
| LINE 傳訊 | 訊息先送到 LINE 的 Server，再轉給對方 | 台灣月活躍用戶 2,200 萬（截至 2026/5 底，LINE 台灣主管公開說法，媒體轉述）S12 |
| 網購下單 | 庫存、訂單、付款都是 Server 在記帳 | — |
| 搶票當機 | 同一秒太多人來要東西，Server 或後面的付款系統排不過來 | 2015 年拓元賣張惠妹演唱會：預估 20 萬人同時上線搶 12 萬張票、開約 1,300 台虛擬機器、12 分鐘賣完，卡在付款端（銀行每秒約 30 筆，售票端每秒 200–300 筆）S11 |

> 注意：不要說「LINE 的聊天紀錄都存在 Server」。LINE 的訊息會經過 Server 轉送，但長期聊天紀錄主要在使用者裝置與備份，這句容易講錯。講「訊息先經過 Server 再到對方手上」才安全。

---

## 2. 事實表（有感數字）

狀態：**已確定**＝事件或官方／機構公布的統計；**估計**＝研究機構或第三方推估、口徑不一；**預測**＝對未來的推估。

| # | 事實 | 數字 | 狀態 | 資料日期 | 來源 | 核對程度 |
|---|---|---|---|---|---|---|
| F1 | 全球「超大型」資料中心數量（Synergy 口徑：大型雲端業者營運的大型機房） | 1,360 座，其中美國 580 座；占全球資料中心容量 48% | 估計（研究機構統計） | 2025 年第 4 季底 | S5 | 二手，多來源一致 |
| F2 | 還在蓋或規劃中的超大型資料中心 | 約 800–915 座（803 是 2025Q4 版，915 是 2026/8 更新） | 估計 | 2025Q4／2026/8 | S5 | 二手，數字隨季更新 |
| F3 | 全球所有資料中心數量 | 約 1.2 萬座，美國占約 45%（另一來源 Statista 2026/4：美國 4,184 座） | 估計，**各家口徑差很大**，不建議上大字 | 2025/11、2026/4 | S6 | 二手 |
| F4 | 「超大型」的常見門檻 | 至少 5,000 台伺服器、約 1 萬平方英尺（IDC 的說法，非官方統一定義） | 估計／慣例 | — | S7 | 二手 |
| F5 | 全球資料中心用電 | 2024 年約 415 TWh（太瓦時），約占全球用電 1.5% | 估計（IEA） | 2024；報告 2025/4 發布 | S8 | 二手，多來源一致 |
| F6 | 用電預測 | 2030 年約 945 TWh，接近全球用電 3%（IEA 基準情境） | 預測 | 報告 2025/4 | S8 | 二手，多來源一致 |
| F7 | Meta 大當機 | 2021/10/4，Facebook、IG、WhatsApp、Messenger 同時斷線約 6 小時；原因是自家網路設定改錯，不是被駭 | 已確定 | 2021/10/4 | S9 | 多來源一致；時長各家寫 5–7 小時，用「約 6 小時」。2026/11/12 事實審查再以 ThousandEyes、ZDNet、The Register、NetBlocks 比對一致；Meta 原文已於 2026/11/12 晚上讀到（第 7 節第 9 點）：原因確認；時長與起訖時間原文沒寫，仍是二手。見第 7 節 |
| F8 | 同上，受影響人數 | 約 30–35 億用戶（路透 35 億、Facebook 自述 30 億） | 估計 | 2021/10 | S9 | 二手，寫「約 30 億」較保守 |
| F9 | AWS 大當機 | 2025/10/20，亞馬遜雲端美國東部機房出問題，Snapchat、Fortnite、Airbnb、Reddit 等一起受影響 | 已確定 | 2025/10/20 | S10 | 多來源一致 |
| F10 | 同上，災情規模 | Downdetector 全球累計超過 1,700 萬則回報，是 2025 年最大的一次（Ookla 年終統計；當天 18:00 GMT 為 1,100 萬） | 估計（使用者回報數，不等於受影響人數） | 2025 年底統計 | S10 | 二手 |
| F11 | 台灣廠商在 AI 伺服器的全球占比 | 約 9 成（經濟部 2024 年的說法；一般伺服器 83%） | 估計，**資料是 2024 年的**；口徑是「台灣廠商出貨」，工廠很多在海外，不等於「在台灣生產」 | 2024/3 報導 | S14 | 二手（未找到經濟部原始文件） |
| F12 | AI 伺服器出貨成長 | 2026 年全球出貨量年增約 31%（TrendForce 2026/8/3 上修） | 預測 | 2026/8/3 | S15 | 二手 |
| F13 | AI 伺服器出貨台數 | 2026 年全球超過 250 萬台，廣達、鴻海、緯穎都在前五大供應商（DIGITIMES 預估） | 預測 | 2026 | S16 | 二手 |
| F14 | 台灣五大代工廠營收 | 2026 年第 1 季鴻海、緯創、廣達、緯穎、英業達合計營收超過新台幣 2 兆元 | 已確定（公司公告營收，媒體彙整） | 2026Q1 | S17 | 二手 |
| F15 | 鴻海自述市占 | 董事長說法：全球 AI 伺服器約占 4 成以上 | 公司說法，非獨立統計，**不建議上畫面** | 2026 | S15、S17 | 二手 |
| F16 | Google 在台灣的資料中心 | 彰化彰濱工業區，2013 年啟用，是 Google 在亞洲最早一批資料中心之一 | 已確定 | 2013 | S18 | 多來源一致；投資金額說法不一（1 億～6 億美元），不引用金額 |

### 截至 2026/11/12 尚未確定／沒查到
- 「台灣占全球 AI 伺服器 9 成」沒有找到 2025–2026 年的官方更新數字；片中若使用要寫「經濟部 2024 年估計約九成」，或改用不帶數字的說法「全世界的 AI 伺服器，大多是台灣廠商做的」。
- 單一公司（Google、Microsoft、Meta）到底有幾台伺服器：公司沒有公布，網路上的「幾百萬台」都是推估，**不使用**。
- 「一座資料中心用電等於幾萬戶家庭」這類換算沒有找到可靠來源，**不使用**。
- 同主題爆紅短影音的實際觀看數：沒查到。

### 投資相關
片中提到廣達、緯穎、鴻海只講「台灣廠商在做伺服器」這個事實，不提股價、不評論前景；需要談市場時用「分析師普遍認為…」。

---

## 3. 觀眾口味：鉤子與常見誤解

### 3.1 查到的鉤子寫法（公開文章）
- 鉤子三個方向：引發好奇、挑動情緒（反差、驚訝）、直接講好處（Dcard 社群小編板整理）S19
- 第一句話在前 0.5 秒就用大字打在畫面上；約 4 成首次觀看是靜音自動播放，所以開頭一定要有字（opus.pro 2026 整理，數字來源為該文自述，當參考）S20
- 3–5 秒內破題（數位時代 podcast）S21
- 以上是通則。**同主題（Server／伺服器）爆紅短影音的標題與觀看數沒有查到**，下面的鉤子句是依這些通則＋本片事實表自己擬的，不是抄自某支爆紅影片。

### 3.2 可用鉤子句（10 句，皆 ≤10 個字；英文單字算 1 個字）

| # | 鉤子 | 類型 | 對應事實 | 評語 |
|---|---|---|---|---|
| H1 | 你的 IG 照片住哪裡？ | 好奇＋切身 | 定義 | **首選**。零門檻、和「你」有關、不需要數字查證；英文只有 IG，好念。 |
| H2 | IG 掛了 6 小時 | 事件＋數字 | F7 | **次選**。有數字、有畫面感；但 2021 年的事，要寫年份。 |
| H3 | Server 其實是服務生 | 反差 | 定義（字源） | 很好記，和餐廳比喻直接接上；英文 Server 第一秒就出現，配音要咬清楚。 |
| H4 | 雲端其實在地上 | 反差 | 定義 | 適合留到第 2 集當鉤子，第 1 集可當結尾懸念。 |
| H5 | 20 萬人搶 12 萬張票 | 數字＋共鳴 | S11 | 台灣人都搶過票；資料是 2015 年，要標年份。 |
| H6 | 九成 AI 伺服器台灣做 | 在地驕傲 | F11 | 數字是 2024 年估計，適合第 5 集，不適合當第 1 集鉤子。 |
| H7 | 它 24 小時不關機 | 擬人 | 定義 | 安全但偏弱，適合當中段小標。 |
| H8 | 一當機，1,700 萬人哀號 | 事件＋數字 | F10 | 「1,700 萬」是回報數不是人數，要改成「1,700 萬則災情回報」才準確，字數會超過。 |
| H9 | 全球 1.5% 的電給它 | 數字 | F5 | 適合第 3 集（資料中心）。 |
| H10 | 你每天用它 100 次 | 切身 | 無來源 | 「100 次」沒有來源，**不可用數字版**；可改「你每天都在用它」。 |

建議第 1 集：HookTitle 用 H1（或 H2 當數字版備案），H3 放在「機制」幕當記憶點，H4 放結尾帶第 2 集。

### 3.3 一般人最常見的誤解／疑問（6 個）

| # | 誤解或疑問 | 正確說法 | 第幾集解 |
|---|---|---|---|
| M1 | 「伺服器是很神祕的超級電腦」 | 本質就是電腦，差別是它的工作是服務別人、24 小時不停 | 第 1 集 |
| M2 | 「IG 的照片、影片存在我手機裡」 | 大部分在遠端的 Server，手機每次打開才去要 | 第 1 集 |
| M3 | 「App 打不開，是我手機或網路壞了」 | 也可能是對方的 Server 出事（2021 Meta、2025 AWS） | 第 1 集 |
| M4 | 「雲端在天上、是看不到的東西」 | 雲端就是別人蓋好的一大堆 Server，放在地上的資料中心 | 第 2 集 |
| M5 | 「大公司只有一台很大的伺服器」 | 是幾千、幾萬台分散在世界各地，一起分工、互相備援 | 第 3、4 集 |
| M6 | 「我家電腦可以當伺服器嗎？」 | 可以，技術上任何電腦都能當；難的是不關機、不斷線、同時服務很多人 | 第 1 集可帶一句 |

---

## 4. 生活比喻（3 個）與評估

| 比喻 | 對應 | 優點 | 會誤導的地方 | 評分 |
|---|---|---|---|---|
| **A. 餐廳（你點餐、廚房出餐）** | 你的手機＝客人；請求＝點餐；Server＝廚房加出餐的人；回應＝上菜；當機＝尖峰時段爆單 | Server 英文本來就有「服務生」的意思，一聽就記得；「點餐→出餐」剛好是一來一回；搶票當機＝爆單，直覺；後面每一集都能延伸 | (1) 服務生只端菜，Server 是連「煮」都做，要講成「廚房」而不是只有服務生；(2) 餐廳一次服務幾十桌，Server 是同時幾萬人，規模感要另外用數字補；(3) 會讓人以為有「人」在處理，要補一句「全是機器自動做」 | **最貼切，建議採用** |
| B. 便利商店（24 小時、到處都有） | Server＝店；24 小時營業；很多分店 | 台灣人最熟，「24 小時不打烊」「到處都有分店」很貼 | 便利商店賣的是現成商品，講不出「依你的要求現做」；分店的概念其實是 CDN（第 4 集），放第 1 集會搶戲 | 留給第 4 集 CDN 用 |
| C. 圖書館櫃台（你借書、館員去書庫拿） | 請求＝借書單；Server＝館員＋書庫 | 很適合講「東西不在你手上，要去拿」 | 只講到「拿資料」，講不到「運算」（算推薦、算訂單）；現在多數人少去圖書館，畫面沒共鳴；書借走就沒了，資料是複製不是借走 | 不建議 |

系列內比喻一致性（都用餐廳）：第 1 集廚房 → 第 2 集「不自己開廚房，租別人的」＝雲端 → 第 3 集「整棟都是廚房的大樓」＝資料中心 → 第 4 集「在你家附近開分店」＝CDN → 第 5 集「請特級主廚、買超貴的爐子」＝AI 伺服器。

---

## 5. 系列規劃（5 集）

系列名暫定：「一分鐘搞懂網路背後」（沿用頻道標籤「國際白話講」）。

| 集 | 主題 | 一句話主張 | 開場鉤子候選 |
|---|---|---|---|
| 1 | Server 伺服器 | Server 就是一台 24 小時幫你出餐的電腦，你每滑一下手機都在跟它點餐。 | 你的 IG 照片住哪裡？ |
| 2 | 雲端 Cloud | 雲端不在天上，是租別人早就蓋好的 Server 來用。 | 雲端其實在地上 |
| 3 | 資料中心 | 上萬台 Server 住在同一棟大樓，最怕的是熱和停電。 | 全球 1.5% 的電給它 |
| 4 | CDN | 影片不卡，是因為有人把一份複本先放到離你最近的地方。 | 為什麼 Netflix 不會卡？（需另查證） |
| 5 | AI 伺服器 | AI 伺服器是裝了超貴晶片的 Server，全世界大多是台灣廠商做的。 | 九成 AI 伺服器台灣做（標 2024 估計） |

### 第 1 集起承轉合建議（給寫稿的人）
- 起（hook）：你的 IG 照片住哪裡？不在你手機裡。
- 承（you＋mechanism）：你每滑一下，手機就向一台叫 Server 的電腦「點餐」，它把照片「出餐」給你。Server 就是 24 小時不關機、專門服務別人的電腦。
- 轉（twist）：所以它一出事，全世界一起停。2021 年 Meta 設定改錯，IG、FB 斷線約 6 小時；台灣搶票當機也是同一件事，太多人同一秒點餐。
- 合（payoff）：下次 App 打不開，先別急著重開機，可能是對方的廚房爆單了。
- CTA＋懸念：那這麼多 Server 到底放在哪？大家說的「雲端」其實不在天上。下一集講。CTA 提問範例：「你印象最深的一次當機是哪一次？」（不寫分享給／傳給／標記）

### 第 1 集結尾懸念（帶到第 2 集）
> 「那問題來了，這麼多 Server 到底放在哪裡？大家常說的『雲端』，其實根本不在天上。下一集告訴你。」

### 配音相關提醒（依使用者補充：不要像 AI、咬字清楚、英文也要清楚）
- 第 1 集英文單字控制在 Server、IG、LINE、App 這幾個，全是台灣人平常就會直接講的字；BGP、DNS、CDN、request 這類縮寫第 1 集不要出現。
- 英文字前後留半形空白、避免連續兩個英文字相鄰（例如不要寫「Meta Server」連著念），讓每個英文字都落在句子的重音位置。
- 數字只留 1–2 個最有感的（建議「6 小時」加一個搶票數字），太多數字聽起來像播報。
- 句子用「你」開頭、問句和短句交錯，比較像真人在聊天。

---

## 6. 來源清單

（查詢日皆為 2026/11/12；「二手」＝本次只讀到搜尋摘要或轉述，未開原文）

- S1 Supermicro 名詞解釋：伺服器 — https://www.supermicro.com/zh_tw/glossary/server
- S2 Lenovo 名詞解釋：What is a computer server — https://www.lenovo.com/hk/zh/glossary/what-is-a-computer-server/
- S3 Computer Hope：Server — https://www.computerhope.com/jargon/s/server.htm
- S4 Server vs PC 差異 — https://servermall.com/blog/server-vs-pc-practical-differences-in-real-life/ ；https://cycle.io/learn/understanding-server-components
- S5 Synergy Research Group：超大型資料中心 1,360 座（2025Q4）、占容量 48%、2031 年預估 67% — https://www.srgresearch.com/articles/hyperscale-operators-to-account-for-67-of-all-data-center-capacity-by-2031 ；轉述 https://www.ciodive.com/news/hyperscalers-two-thirds-data-center-capacity-2031/817016/ ；2026Q1 市場排名 https://techinsights.com/blog/hyperscalers-global-datacenter-capacity-Q1-2026 （二手；srgresearch.com 在本環境打不開）
- S6 全球資料中心總數估計 — https://www.cargoson.com/en/blog/number-of-data-centers-by-country （Cloudscene 資料，2025/11）；https://statista.com/statistics/1228433/data-centers-worldwide-by-country/ （2026/4）
- S7 超大型資料中心定義（IDC 5,000 台）— https://www.vertiv.com/en-us/about/news-and-insights/articles/educational-articles/what-is-a-hyperscale-data-center/ ；https://www.ibm.com/topics/hyperscale
- S8 IEA《Energy and AI》（2025/4）— https://www.iea.org/reports/energy-and-ai/executive-summary ；https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai
- S9 2021/10/4 Meta 當機 — Meta 工程部落格 https://engineering.fb.com/2021/10/04/networking-traffic/outage/ ；Cloudflare https://blog.cloudflare.com/october-2021-facebook-outage ；Krebs https://krebsonsecurity.com/2021/10/what-happened-to-facebook-instagram-whatsapp/ ；ThousandEyes https://www.thousandeyes.com/blog/4-reasons-facebook-went-down-so-badly-last-week
- S10 2025/10/20 AWS 當機 — https://thenewstack.io/a-cascade-of-failures-a-breakdown-of-the-massive-aws-outage/ ；https://www.tomsguide.com/news/live/amazon-outage-october-2025 ；Ookla 年終統計轉述 https://www.fonearena.com/blog/471254/largest-outages-2025-ookla.html ；https://betanews.com/article/2025s-biggest-internet-outages-and-what-caused-them
- S11 拓元售票（2015 張惠妹演唱會）— https://www.ithome.com.tw/news/94531 ；https://www.ithome.com.tw/news/94530 ；https://www.ithome.com.tw/voice/94536
- S12 LINE 台灣 2,200 萬月活躍（截至 2026/5 底）— https://www.bnext.com.tw/article/91351/line-taiwan-make-every-conversation-become-the-deal.
- S13 台灣 IG 用戶估計（2026/4）— https://stats.napoleoncat.com/instagram-users-in-taiwan/2026/04/ ；DataReportal Digital 2026: Taiwan https://datareportal.com/reports/digital-2026-taiwan
- S14 台灣 AI 伺服器占比約 9 成（經濟部，2024）— https://apps.digitimes.com/news/a20240327PD203.html ；https://technews.tw/?p=1208319 ；https://www.tomshardware.com/tech-industry/artificial-intelligence/taiwan-produces-90-of-the-worlds-ai-servers-raising-concerns-as-us-china-trade-conflicts-continue-to-simmer
- S15 TrendForce 2026/8/3：2026 年 AI 伺服器出貨年增上修至近 31% — https://www.trendforce.com/presscenter/news/20260803-13161.html ；中央社 https://www.cna.com.tw/news/afe/202608030244.aspx
- S16 DIGITIMES 預估 2026 年 AI 伺服器逾 250 萬台（轉述）— https://uanalyze.com.tw/articles/2840357961
- S17 2026Q1 五大代工營收破 2 兆 — https://news.tvbs.com.tw/tech/3177410
- S18 Google 彰化資料中心 — https://www.ithome.com.tw/news/69945 ；https://www.ithome.com.tw/news/164213 ；https://www.techbang.com/posts/7117
- S19 Dcard 社群小編板：短影音鉤子 8 種類型 — https://www.dcard.tw/f/social_media_editors/p/258634540
- S20 opus.pro：8 Things All Viral TikToks Do in the First 3 Seconds (2026) — https://www.opus.pro/blog/viral-tiktoks-first-3-seconds-2026
- S21 數位時代 podcast（短影音開頭）— https://www.bnext.com.tw/podcast/409/bn-sound-20230903190837-tfehuwcp ；經理人 https://www.managertoday.com.tw/articles/view/70780

## 7. 審查後修正（2026/11/12）

事實審查者另外用 WebSearch 查過一輪（engineering.fb.com、blog.cloudflare.com 仍被網路設定擋下，沒有人讀到 Meta 原文）。下面幾點修正或補充前面各節，script.md 第 2 版已照改。

1. **「照片大部分不在手機裡」不精確。** 滑到的那一刻照片已經下載並暫存在手機（App 會快取、預先抓取）。正確說法是「原本不放在手機裡，要用時才去拿」。第 1 節日常例子與誤解 M2 的講法以此為準。
2. **「很遠的電腦」被推翻。** Meta 在台灣有節點，也在電信業者機房放快取設備（依據是第三方彙整 Netify，不是 Meta 官方資料），照片常從台灣境內送出。改說「別人的電腦」；「離你近不近」留給第 4 集（CDN）。
3. **F7 的性質要講準。** 2021/10/4 那次 Server 本身沒壞，是例行維護的一道指令切斷骨幹網路，BGP／DNS 跟著失效，外界連不到 Meta 的機房；稽核工具有 bug 沒擋下。官方說法是 faulty configuration change，排除被駭。旁白用「自己改錯設定，等於把廚房的門鎖死」，不說成 Server 壞掉。當時公司名是 Facebook, Inc.（2021/10/28 才改名 Meta），旁白不講公司名。
4. **F7 的時間（二手，ThousandEyes）。** 約 15:39 UTC 開始，DNS 於 21:20 UTC 恢復（約 5 小時 40 分），使用者端全面恢復約 22:50 UTC（近 7 小時）。換成台灣時間是 10/4 23:39 到 10/5 05:20–06:50，所以旁白說「台灣這邊，差不多從半夜掛到天亮」。WhatsApp、Messenger 也一起中斷，旁白只提 IG 跟臉書。
5. **LINE。** 訊息由伺服器轉送這點成立（即使有 Letter Sealing 端對端加密，伺服器只是讀不到內容）。第 2 版旁白已不講這句，LINE 只當成「打不開」的例子。
6. **「伺服器」讀音。** 伺是多音字，這裡念 ㄙˋ。教育部辭典條目沒查到，依台灣通行讀法判斷。
7. **「雲端在地上」。** 絕大多數正確，但有海底資料中心的實驗案例（微軟 Natick）；第 2 集寫稿用「幾乎都在地上的機房裡」。
8. 補充來源：ThousandEyes https://www.thousandeyes.com/blog/facebook-outage-analysis ；ZDNet https://www.zdnet.com.au/article/facebooks-giant-outage-this-change-caused-all-the-problems/ ；The Register https://www.theregister.com/2021/10/06/facebook_outage_explained_in_detail/ ；NetBlocks https://netblocks.org/reports/facebook-whatsapp-instagram-messenger-down-globally-in-extended-service-outage-JA6pPkyQ ；Netify https://www.netify.ai/resources/cdn/meta-cdn/country/tw
9. **Meta 原文核對（2026/11/12 晚上，engineering.fb.com 已放行）。** 兩篇都逐字讀過，作者 Santosh Janardhan。
   - 2021/10/4〈Update about the October 4th outage〉https://engineering.fb.com/2021/10/04/networking-traffic/outage/ ：「configuration changes on the backbone routers that coordinate network traffic between our data centers caused issues that interrupted this communication」；「there was no malicious activity behind this outage — its root cause was a faulty configuration change on our end」；沒有證據顯示用戶資料外洩。
   - 2021/10/5〈More details about the October 4 outage〉https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/ ：例行維護時下了一道評估骨幹容量的指令，「unintentionally took down all the connections in our backbone network, effectively disconnecting Facebook data centers globally」；稽核工具有 bug 沒擋下；DNS 伺服器「became unreachable even though they were still operational」；「an outage caused not by malicious activity, but an error of our own making」。
   - 和旁白對照：句 13「他們公司自己改錯設定」「把廚房的門鎖死」（機器沒壞、連不進去）成立，不用改。
   - **原文沒有的**：兩篇都沒寫中斷多久，也沒寫開始與恢復的時間。「約 6 小時」和「台灣 10/4 23:39 到 10/5 清晨」仍只來自第 4 點的二手來源。www.thousandeyes.com 今天被網路設定擋下（代理回 403），沒有重讀。畫面出處帶因此改成「來源：Meta 工程部落格、ThousandEyes 2021/10」。
