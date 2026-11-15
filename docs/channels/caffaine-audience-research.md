# CaffAIne 受眾與選題研調（2026-11-16）

> 起因：Andy 2026-11-16「你的題材太難，你幫我研調目前平台上 IG AI 相關的影片通常什麼類型最受歡迎……雖然介紹 AI，但是 AI 的內容其他人看到卻與他無關就沒有用，目前全世界大家依賴 AI 通常會是如何加速效率、創業、創造價值……所以幫我方向改一下」。
> 上一版題材（Claude Code 101 的代理循環、權限模式、Skill、MCP）被判定太難、跟一般人無關，作廢。
> 研調日期：2026-11-15（台北）。

## 一、研究方法與限制（先讀這節）

- 方法：WebSearch 約 20 組關鍵字（中英文，涵蓋 IG Reels、Threads、YouTube Shorts、小紅書／抖音、comment-to-DM 自動化、台灣上班族 AI 使用調查、公平交易法廣告規範、Reels 演算法訊號、NotebookLM 會議紀錄題材）。
- **限制一：WebFetch 在這個環境被擋**（favikon.com、technews.tw 皆無法解析），所以所有引用都只是搜尋摘要，不是讀過全文。依專案規矩，摘要是線索不是事實。
- **限制二：IG 與 Threads 單支貼文的觀看／按讚數，搜尋引擎幾乎查不到**（社群平台內容不被索引，第三方報告多為行銷部落格與工具商）。下面表格裡「具體爆紅例子＋數字」**大部分查不到，已照實標「查不到」，沒有編造**。
- **限制三：台灣 IG／Threads AI 教學帳號的追蹤數與爆紅案例**，本次搜尋只找到零星個案（見表），沒有找到經過驗證的「百萬觀看」台灣案例。
- 因此本文的結論分兩種：**有證據的**（調查數據、平台機制、已知趨勢，標高／中信心）與**依機制推論的**（選題方向，標低～中信心）。選題方向的最終驗證要靠 CaffAIne 自己上線後的數據（見第六節 A/B 追蹤建議）。

## 二、熱門類型表

信心度：高＝兩個以上獨立來源且含官方；中＝一個可信來源或兩個行銷來源互相吻合；低＝單一行銷／自述來源。

| # | 類型 | 具體例子與數據（查得到才寫） | 來源 | 信心 |
|---|---|---|---|---|
| 1 | 「一個提示詞幫你做 X」＋留言關鍵字領資料（comment-to-DM） | 工具商與教學大量描述：影片結尾叫人留言關鍵字（例如 PROMPT、GUIDE），自動私訊提示詞／懶人包；Meta 官方 API 工具（ManyChat）合法，過度觸發會被限制。**單一帳號的實際觀看數查不到。** 一則「留言關鍵字 Reels 總觸及高 3–5 倍」的說法無來源，不採用。 | [ManyChat 官方指南](https://manychat.com/blog/the-ultimate-guide-for-instagram-comment-automation/)、[getkanal](https://getkanal.com/blog/manychat-instagram)、[inro.social 範本](https://www.inro.social/templates/send-ai-prompt-from-instagram-comments) | 中（機制）／低（成效） |
| 2 | 台灣：ChatGPT 教學懶人包＋加 LINE／留言領取 | Threads 帳號 @neil.skilltree 貼文「ChatGPT 教學指令懶人包」，引導加 LINE 領取提示詞（粉絲與互動數查不到）。另有 Threads 創作者以「Open Loop 懸念結構」教口播腳本（@ai.video.master_jason）。 | [Threads 貼文](https://www.threads.com/@neil.skilltree/post/Dd2UKj5kpLE/)、[Threads 貼文](https://www.threads.com/@ai.video.master_jason/post/DJjaOekTm1r/) | 低（只證明這種玩法存在） |
| 3 | 職場效率：會議紀錄、待辦、Email、簡報（NotebookLM／ChatGPT） | 台灣媒體與人力銀行持續大量產出此題材：Bnext 兩篇（NotebookLM 會議紀錄與通知信、五招筆記轉化）、104 職場力兩篇（專有名詞表、會議紀錄）、一天一AI「散會後 3 分鐘寄出會議紀錄」。代表**台灣讀者對這類題材需求穩定**；單篇點閱數查不到。 | [Bnext](https://www.bnext.com.tw/article/89862/ai-workflow-for-meeting-summary-and-action-items)、[Bnext](https://www.bnext.com.tw/article/90875/notebooklm-3-steps-ai-meeting-minutes-and-email-notes)、[104](https://blog.104.com.tw/ai-meeting-notes-notebooklm-gemini/)、[104](https://blog.104.com.tw/efficient-meeting-notes-with-ai/) | 中 |
| 4 | 國外：職場 ChatGPT／AI 技巧（YouTube 為主） | Jeff Su（職場生產力頻道）：vidIQ 2025-06 約 128 萬訂閱、累計 7274 萬觀看；OutlierKit 稱 180 萬訂閱、9960 萬觀看（兩站不一致）。第三方稱「10 ChatGPT Life Hacks」是最多人看的 AI 生產力影片之一，**無單支觀看數**；其最高觀看是〈AI Agents, Clearly Explained〉約 450 萬（第三方）。 | [vidIQ](https://vidiq.com/youtube-stats/channel/UCwAnu01qlnVg1Ai2AbtTMaA)、[OutlierKit](https://outlierkit.com/channel/jeffsu)、[automationatlas](https://automationatlas.io/creators/jeff-su/) | 中（頻道規模）／低（單支） |
| 5 | AI 生圖／風格轉換（吉卜力風、角色化） | 2025-03-25 OpenAI 上線 ChatGPT 圖像生成，吉卜力風數日內洗版 IG 與 X；Altman 稱 GPU「快融化」並限流，免費版一天 3 張。**某帳號的 IG 觀看數查不到。** 行銷部落格稱「照片轉風格」仍是高儲存率格式（低信心）。 | [Dailydot](https://dailydot.com/culture/chatgpt-studio-ghibli/)、[Benzinga](https://www.benzinga.com/news/25/04/44645905/sam-altman-jokes-about-openais-viral-ai-tool-i-worked-10-years-on-superintelligence-and-people-just-turn-the)、[Onmanorama](https://www.onmanorama.com/entertainment/entertainment-news/2025/03/28/ghibli-style-pics-new-viral-trend-chatgpt-users.html) | 高（事件）／低（IG 成效） |
| 6 | AI 賺錢／副業（華語圈） | 小紅書教學影片宣稱「兩個月賺 100 萬」「每月多賺一兩萬」，**屬推廣內容，數字不可信**；多篇指出批量生產導致同質化。AI 寵物短劇、AI 故事短片在抖音／小紅書／視頻號有量。 | [videohighlight 轉錄](https://videohighlight.com/v/vB0Ni7q1JfY)、[36氪（歐洲站）](https://eu.36kr.com/en/p/3464619080652422)、[squarefacechan](https://squarefacechan.substack.com/p/ai-ai) | 低 |
| 7 | 大陸抖音 AI 爆款（對照用） | 2026 上半年抖音至少 9 支 AI 相關影片播放破億；最高為 AIGC 短片《早餐奶奶》2.5 億播放；AI 短劇 22.19 萬部、破億率僅 0.47%（新榜／36氪）。**偏娛樂與短劇，不是教學類，只能說明「AI 內容量大、爆款極少」。** | [新榜](https://www.newrank.cn/article/detail/34616)、[36氪](https://36kr.com/p/3893827784194564) | 中 |
| 8 | 風格化 AI 系列角色、固定集數 | 行銷部落格稱「有編號的系列」長期成長優於單支爆款（無數據）。 | [Nemo Video](https://www.nemovideo.com/blog/how-to-go-viral-instagram-reels-ai-2026)、[Stan Store](https://stan.store/blog/?p=5707) | 低 |
| 9 | 大帳號 IG 規模（參考，非特定爆款） | Favikon 美國 IG「AI 教育」榜：Evolving AI（AI 科技整理）490 萬粉、Roberto Nickson 94.5 萬粉；Socialbook：Tony Chen 310 萬粉。各站數字互相不一致。這些帳號走**「工具資訊快報」**路線，不是職場實作。 | [Favikon 榜單](https://app.favikon.com/public/ranking/creators/tech-software_ai-education_instagram_united-states/)、[Socialbook](https://socialbook.io/blog/top-20-ai-influencers-you-should-follow-in-2026/) | 低 |

### 支撐「一般人真的在用、要的是日常效率」的需求端證據

| 數據 | 來源 | 信心 |
|---|---|---|
| 公平會 2026-05 問卷（5/6–5/28，過去 6 個月用過生成式 AI 的 18 歲以上民眾，有效 1,079 份）：32.4% 每天使用；ChatGPT 87.9%、Gemini 67.8%、Claude 8.9%、NotebookLM 8.1%；整體使用率約 50.5%，使用者中 39.8% 已付費。 | [104 職場力引述](https://blog.104.com.tw/?p=256697)、[技新報](https://technews.tw/2026/04/23/ftc-to-assess-mandatory-disclosure-rules-for-ai-ads/)（同源報導；原始報告在公平會官網，**用途細項查不到**） | 中高 |
| 104《2026 員工 C.E.O. 工作價值認知調查》標題稱生成式 AI 滲透率 68%（摘要，內文用途查不到）。 | [104 部落格](https://blog.104.com.tw/2026-ceo-report-ai-quiet-quitting/) | 低中 |
| Meta AI 在台灣 Threads 開放測試，標記 @meta.ai 即公開回答（2026）；台灣約占 Threads 流量 21–22%（單一文章）。 | [塔科女子](https://www.tech-girlz.com/2026/05/threads-meta-ai.html)、[Grenade](https://grenade.tw/blog/threads-meta-ai/) | 中／低 |

## 三、共同特徵

依機制與多個行銷／教學來源互相吻合者歸納（**成效數字沒有一個是我查證過的，不要拿來當承諾**）。

1. **鉤子**：第一句講「讀者的痛」或「結果」，不講工具名。常見型：①痛點＋時間（「30 頁會議紀錄，3 分鐘變待辦」）②錯誤型（「你問 ChatGPT 都問錯了」）③Open Loop（先說會教什麼、先講痛點，最後才揭曉）④前後對照。Instagram 會讀畫面文字與口說關鍵字（行銷來源）。信心：中。
2. **長度**：實務建議 30–45 秒；Open Loop 範例壓在 40 秒內；每 2–3 秒要有資訊推進或畫面變化。信心：低中（皆教學來源，非平台公布）。
3. **露不露臉**：來源一致說「真人最有說服力，AI 只輔助」；但無臉的畫面（螢幕錄影、紙拼貼、等距插畫）也大量存在。CaffAIne 固定走等距插畫風格（`stage: "iso"`），不露臉，要靠「**實測**」補可信度（把真的輸入與真的輸出放上畫面）。信心：中。
4. **留言關鍵字拿資料**：影片末尾要求留言一個**不常見**的字（避免 LINK、GUIDE 這種大家都用的），自動私訊提示詞或懶人包。**這是對上班族的實質好處：能直接複製使用。** 注意：要用 Meta 官方 API 工具，量大且像垃圾訊息會被限制（ManyChat 說明）。信心：中。
5. **為什麼一般人覺得跟自己有關**：題目裡出現**他的場景**（會議、Email、簽約、報價、請假、履歷、租屋、報稅）＋**可量化的省下**（3 分鐘、30 頁），而不是出現模型或技術名詞。信心：中（機制推論）。
6. **平台訊號**：多個二手來源稱 Mosseri 2025-01 點名觀看時間、按讚率、分享（DM sends）為 Reels 關鍵訊號——**查不到 Mosseri 原文，需另外核對**。「第 3 秒留存 60%」「早鉤子加 40% 觸及」等數字出自行銷頁無出處，不採用。結論只留方向：**做出「想傳給同事／朋友」的內容（sends）與「值得存」的內容（清單、提示詞）。** 信心：低中。
7. **AI 標示與原創**：二手來源稱 Instagram 2026 有「AI Creator」標籤、純 AI 無個人層的內容容易被忽略（**未經官方確認**）。CaffAIne 的做法＝每支都放「我實測過的輸入與輸出」，這就是原創層。信心：低。

## 四、CaffAIne 選題方向（依預期熱度排序）

排序依據：①需求端證據（台灣 AI 日常使用普及、職場題材穩定有人寫）②「與一般人切身程度」③能用 iso 插畫＋實測畫面做出差異 ④合規風險低。**預期熱度屬判斷，不是量測。**

### 1. 會議／文件變待辦（職場文書加速）
- 好處：省時。丟進去，3 分鐘得到可貼進群組的待辦。
- 鉤子句型：「[數字] 的 [痛苦文件]，丟給 AI 之後 [時間] 變 [結果]」。
- 題目範例：①把 30 頁會議紀錄丟給 AI，3 分鐘變待辦清單 ②老闆丟來一份 50 頁報價單，30 秒找出會吃虧的地方 ③客戶一長串 LINE 訊息，AI 幫你整理成「他到底要什麼」三行。
- 不要做：不教 API／自動化串接；不處理機密文件的示範（要提醒「公司機密別直接貼」）。

### 2. 一個提示詞，做完一件日常工作（留言關鍵字領提示詞）
- 好處：複製貼上就能用，少想少寫。
- 鉤子：「這 [字數] 字的提示詞，幫我省下每週 [時間]」。
- 題目範例：①一句話把「很兇的 Email」改成客氣又不吃虧的版本 ②週報 5 分鐘寫完，提示詞留言「週報」給你 ③被客戶退件，用這段提示詞寫出不卑不亢的回覆。
- 不要做：提示詞太長、一次塞十個技巧；「通殺所有場景」的誇大說法。

### 3. 接案／小生意上手（報價、提案、合約看哪裡）
- 好處：少出錯、更像專業。
- 鉤子：「接案前一定要先問 AI 這 3 件事」。
- 題目範例：①新手接案不會報價，用 AI 把成本算成三種方案 ②客戶合約丟給 AI，先標出「付款、修改次數、違約」三處再找人看 ③一人公司的 FB 粉專，一週貼文 20 分鐘排完。
- 不要做：法律意見（只說「AI 先幫你抓重點，重大合約仍要找專業人士」）；不寫「保證賺錢」。

### 4. 求職與職涯（履歷、面試、轉職）
- 好處：多拿面試機會、少寫廢話。
- 鉤子：「同一份履歷，AI 改完之後多了這 3 個地方」。
- 題目範例：①把履歷貼給 AI，照職缺逐條找缺口 ②模擬面試：叫 AI 扮面試官問你 5 題最刁鑽的 ③「請問期望薪資？」這題 AI 怎麼幫你想答案。
- 不要做：捏造經歷；教「用 AI 灌水履歷」。

### 5. 生活效率（旅遊、搬家、報稅、比價、買東西）
- 好處：省錢、少踩雷。
- 鉤子：「[日常麻煩事]，先問 AI 這句」。
- 題目範例：①日本五天自由行，AI 排進「下雨備案」的行程 ②租屋合約看不懂，AI 用白話逐條解釋 ③三款手機規格表丟進去，直接說「適合我嗎」。
- 不要做：醫療、投資、法律的結論式建議；引用未查證的價格。

### 6. 工具快報，但只講「你今天就能用在什麼」
- 好處：不落後、知道哪個新功能能直接用。
- 鉤子：「[工具] 新功能，上班族最有用的是這一個」。
- 題目範例：①NotebookLM 新增某功能，教你用在讀長篇文件（2026 公平會調查中 NotebookLM 使用率 8.1%，仍有教育空間）②ChatGPT 新增某功能，實測是否值得付費 ③Gemini 與 ChatGPT 同一題實測對照。
- 不要做：純新聞轉述；沒有實測就下結論；功能細節未查證就上片（時事類要重查，分「已確定／分析預期／尚未確定」）。

### 7. AI 生圖（做自己用得到的，不是炫技）
- 好處：不求人做出商品圖、簡報配圖、LINE 貼圖。
- 鉤子：「一句話做出 [具體用途]，不用找設計」。
- 題目範例：①小店老闆自己做商品圖 ②簡報配圖三分鐘，風格統一 ③把手繪草圖變成名片排版。
- 不要做：模仿特定在世藝術家或工作室風格（吉卜力風有版權爭議，Dailydot 等報導 Miyazaki 的反對）；使用真人肖像。

### 8. 「AI 答錯了」提醒型（信任類內容）
- 好處：少被騙、少出錯，累積可信度，也是最適合分享給同事的內容。
- 鉤子：「AI 這樣回你，千萬不要直接照做」。
- 題目範例：①AI 幫你寫的數字，查證這 3 步 ②為什麼它講得很肯定卻是錯的（幻覺，用日常例子講）③會議紀錄 AI 常漏掉的 3 種資訊。
- 不要做：嚇人；不給解法。

### 9.（探索，先小量測）AI 副業與創業第一步
- 好處：看見可行的起手式，不是看見「月入十萬」。
- 鉤子：「你不用辭職，先用 AI 做這個小測試」。
- 題目範例：①一個週末，用 AI 做出「第一個商品頁」②用 AI 找出你的客人到底在抱怨什麼（讀評論）③報價前，用 AI 估成本與時間。
- 不要做：任何收入數字承諾；見第五節。**此類最容易觸法，建議放在第 9 位、每月最多 1 支。**

## 五、不要做的

1. **太技術**：代理循環、權限模式、Skill、MCP、API 串接、程式碼、提示詞工程術語（除非翻成「你照這句改」）。判準：**一個沒用過 ChatGPT 的同事看完，能不能照著做一次。**
2. **與一般人無關**：只講模型排名、參數量、基準測試。
3. **誇大賺錢**：「月入十萬」「躺著賺」「保證」「不用經驗」。依《公平交易法》第 21 條，廣告不實會被處分，廣告主與明知而刊載者都可能負責，網紅與廠商合寫不實內容可能一併處分；公平會 2026 年起已將運用 AI 的廣告納入監測（技新報 2026-04-23 引述，**原文需另核對**）。查不到公平會針對「AI 副業課程」的具體處分案例（已搜尋），故規則採從嚴。
4. **未實測就教**：每支都要有「實測」畫面；回答要逐行比對實測原文，標「實測…（節錄）」（沿用專案現行規則）。
5. **未標註的不確定**：功能因版本、地區、方案而異時，標「截至 YYYY/M/D」。
6. **機密與個資**：不示範貼入客戶資料、身分證、合約全文；提醒公司機密別貼。
7. **真人肖像與商標、特定在世創作者風格**：不用。
8. **無限制的留言關鍵字自動化**：只用 Meta 官方 API 工具，關鍵字罕見、一支影片一個。
9. **醫療、法律、投資的結論式建議**：只示範「整理」，不示範「判斷」。

## 六、關鍵字清單

**搜尋與標籤（繁中）**：ChatGPT 教學、AI 懶人包、AI 上班族、AI 提示詞、會議紀錄 AI、NotebookLM、Gemini 實測、AI 省時間、AI 寫 Email、AI 簡報、AI 履歷、AI 接案、AI 報價、AI 生圖、AI 提醒、AI 答錯。

**英文（對照研究用）**：ChatGPT productivity hacks, AI for work, one prompt to, comment "PROMPT", AI workflow, before and after AI, meeting notes AI, AI side hustle（僅參考，不採其承諾口吻）。

**第一批上線後要追蹤的指標（驗證本文推論）**：每支記錄①前 3 秒留存 ②完播 ③分享數（sends）④收藏數 ⑤留言關鍵字領取數。每個方向各做 2–3 支再比較，**淘汰靠數據，不靠本文排序**。

## 七、未解決與建議後續

- **WebFetch 被擋**：若要讀全文（Favikon 榜單、技新報、公平會新聞稿），需把這些網域加入雲端環境允許清單，才能補強第二節。
- 公平會 AI 使用「用途」細項（寫文件、查資料、翻譯等占比）查不到，原始報告在公平會官網，可補。
- 台灣 IG／Threads 的 AI 教學帳號實際觀看數無法由搜尋引擎得到；建議 Andy 手動列 5–10 個自己觀察到的台灣帳號，或用社群分析工具導出，我再整理成標竿表。
