# CaffAIne 題材研調：做出一個東西 vs 原理 vs 去 AI 味（台北 2026/11/17）

> 觸發：Andy 11/17 語音：「原理可能不用說太多，大家對做出東西、實作、生活應用比較有興趣；去 AI 味也不需要太多；先驗證，或有更棒的題材；目前先以做一個東西為主。」
> 方法：WebSearch 9 組關鍵字（中英），涵蓋平台／研究報告、媒體／資料平台、同業與創作者。**WebSearch 只回摘要，進不了原文**，所以下面每個數字都標來源與信心度；找不到的明講找不到。

## 一、問題 1：哪一類表現較好

### 查到的證據
| 結論 | 證據 | 來源 | 信心 |
|---|---|---|---|
| 沒有任何公開資料直接比較「做出東西」「原理」「去 AI 味」三類的收藏／分享 | 4 組不同關鍵字（中文、英文、YouTube Shorts）都找不到對照研究，只有創作者部落格的經驗談 | 多組搜尋 | 高（是「查無」，不是「否定」） |
| 平台看的是觀看時長、重播、傳送（分享）、收藏，前 3 秒決定留存；教學類「第一、二秒就承諾價值」被多篇建議 | 部落格彙整，非平台官方 | motionbox.io、clipspeed.ai、mirra.my（Shorts 指南） | 中低（行銷部落格，無原始數據） |
| 收藏：輪播（carousel）最高；分享與留言：Reels 最高。Reels 分享率中位約 0.10%、輪播 0.08%、圖 0.07% | 22+ 萬貼文基準報告 | socialinsider.io Instagram Engagement Report／2026 Benchmarks | 中（各頁季度數字互相不一致，要看原報告才可引用） |
| 教學／框架／步驟類適合輪播，因為使用者會存起來照著做 | 同上報告的建議段 | socialinsider.io | 中 |
| 台灣 Threads 上爆紅的 AI 內容是「可直接套用的成品玩法」：AI 生圖提示詞 18 組（日系海報、拼貼、九宮格大頭貼）、「厭世上班族卡通頭像」、80 年代復古照指令 | 數位時代、TechBang 報導；**沒有查到讚數** | bnext.com.tw/article/91430、techbang.com/posts/123778 | 中（現象證據，無數字） |
| 全球實際使用 ChatGPT 的最大類是「實用指導（how-to、規劃、生活問題）」約 28%，非工作用途已占 73% | OpenAI＋哈佛 Deming 研究，約 150 萬則訊息 | openai.com/index/how-people-are-using-chatgpt、tomsguide、thehustle | 高 |
| 「去 AI 味」：找不到任何 Threads 帳號的觀看／讚／收藏數；只查到 Vocus 作者自述實測（未獨立驗證）；AI 生成視覺泛用感強會停滯，這是業界說法 | 搜不到量化資料 | vocus.cc、promptspace.in | 低 |

### 判讀
- **Andy 的方向有間接佐證，但沒有直接數據**：使用需求（OpenAI 研究）、台灣爆紅形態（成品＋可複製提示詞）、平台訊號（收藏／分享要「有用到想存」）三條線都指向「做出東西」。
- **「原理」沒有被證明比較差**，只是沒有證據顯示它會贏；單獨講原理缺乏「存起來照做」的動機（推論，標低信心）。
- **「去 AI 味」查無任何表現數據**，不能說它差，但也沒有理由把它當主力；合理做法是把它當「做東西的品質加分項」，不單獨成片。
- 我們自己的樣本才是最準的：目前沒有足夠貼文數據，建議用下面第四節的 A/B 測試自己驗證。

## 二、問題 2：「留言拿提示詞」的讀者動機

- **機制面（高信心）**：ManyChat 等工具提供「留言關鍵字→自動私訊」；官方稱 DM 轉換與回應速度高於公開回覆，創作者案例用關鍵字換取免費指南或 $10–20 數位產品（manychat.com 部落格與 success stories，屬廠商宣傳，成效數字當作行銷用語）。
- **動機面（中低信心，間接推論）**：
  1. OpenAI 研究顯示多數人用 AI 是「做事、問怎麼做」，所以要提示詞的人，目的是「複製貼上就做出結果」，而不是學原理。（高：用途分布；中：推論到動機）
  2. 台灣 Threads 的熱門提示詞全是「可複製套用、成果可曬圖」的格式（bnext 18 組、TechBang 頭像），佐證「拿了就拿去做成品」。（中）
  3. 直接調查「領提示詞的人拿去做什麼」：**找不到**（查過中文「留言提示詞 私訊」、英文 comment-keyword lead magnet，皆只有工具教學，沒有讀者端調查或留言內容）。
- **資料缺口與補法**：我們自己的貼文留言／私訊就是第一手資料。建議每篇「留言拿提示詞」在私訊最後加一句「你打算拿它做什麼？」，累積 2–3 週後統計（需 Andy 同意才加，屬對外互動）。

## 三、問題 3：20 個「一般人做出一個東西」題目

可實測欄＝容器內能否真實做（Gemini API 文字／生圖、Playwright 瀏覽器、ffmpeg；不用手機 App、真人照片、付費帳號）。成品皆是「可截圖給觀眾看到的東西」，實測以我們跑出的真實輸出為準，不編造。

| # | 領域 | 鉤子（一句） | 做出的成品 | 工具（免費優先） | 容器可實測 | 優先 |
|---|---|---|---|---|---|---|
| 1 | 工作 | 開完會 3 分鐘出會議紀要＋待辦表 | 一頁會議紀要＋待辦清單 | Gemini／ChatGPT 免費版（貼逐字稿） | 能：Gemini API 餵範例逐字稿 | S |
| 2 | 工作 | 老闆要週報，5 分鐘交 | 一份週報（本週完成／卡點／下週） | 同上 | 能 | S |
| 3 | 工作 | 把一堆亂數字變成一頁看得懂的圖表網頁 | 可開啟的圖表小網頁 | Gemini 生成 HTML＋Chart.js | 能：API 生碼，Playwright 截圖驗證 | S |
| 4 | 工作 | 5 分鐘做一份 10 頁簡報大綱＋講稿 | 簡報大綱與逐頁講稿 | Gemini、Google 簡報 | 能做文字；匯入簡報 App 不實測 | A |
| 5 | 做圖 | 一句話做一張活動海報 | 一張海報圖 | Gemini 生圖／Canva 免費 | 能：Gemini 生圖（要先確認 API 生圖可用） | S |
| 6 | 做圖 | 同一張商品圖 5 種風格 | 5 張風格對照 | Gemini 生圖 | 能（用產生的物件圖，不用真人） | A |
| 7 | 做圖 | 自己的 LINE 貼圖 8 張草稿 | 8 格貼圖草稿圖 | Gemini 生圖 | 能做草稿；上架 LINE 不實測 | B |
| 8 | 做影片 | 一段文字變 30 秒說明短片 | 帶字幕的短片 | Gemini 腳本＋TTS＋ffmpeg | 能：容器已有 Remotion／ffmpeg 流程 | S |
| 9 | 做影片 | 把長影片剪成 3 支短影音字幕檔 | 3 段切點＋字幕 SRT | Gemini 分段、ffmpeg 切 | 能（用授權影片或我方自製素材） | A |
| 10 | 生活 | 冰箱剩這幾樣，7 天晚餐＋採買清單 | 一週菜單＋購物清單 | Gemini | 能 | S |
| 11 | 生活 | 一個月旅行 3 天行程＋預算表 | 逐日行程表＋預算 | Gemini，搭 Google 地圖查證 | 能做文字；景點營業時間需查證，要標「請再確認」 | A |
| 12 | 生活 | 每月帳目貼進去，自動分類出花費圓餅圖 | 分類表＋圓餅圖網頁 | Gemini 生成 HTML＋Chart.js | 能：Playwright 截圖（用假資料標「示意」） | A |
| 13 | 生活 | 寫一封不失禮的拒絕／催款／道歉信 | 三種語氣的信件版本 | Gemini | 能 | A |
| 14 | 副業 | 一小時做出自己的接案報價單網頁 | 可列印的報價單網頁 | Gemini 生成 HTML | 能：Playwright 截圖 | A |
| 15 | 副業 | 一週 7 篇 IG 貼文文案＋主題行事曆 | 內容行事曆表 | Gemini | 能 | B（與我方業務重疊，易變廣告感） |
| 16 | 副業 | 商品上架文案＋SEO 標題 | 商品頁文案 | Gemini | 能 | B |
| 17 | 學習 | 把一本書／一篇文章變成 10 張記憶卡 | 閃卡＋小測驗網頁（可翻面） | Gemini 生成 HTML | 能：Playwright 操作翻卡並錄影 | S |
| 18 | 學習 | 多益／考試 30 天讀書計畫表 | 逐日計畫表 | Gemini | 能 | B |
| 19 | 家庭 | 給小孩的睡前故事（主角是他的玩具名字） | 3 段故事＋插圖 | Gemini 文字＋生圖 | 能（插圖用卡通，不用真人） | A |
| 20 | 家庭 | 全家家務輪值表＋獎勵點數網頁 | 可勾選的家務表網頁 | Gemini 生成 HTML | 能：Playwright 操作勾選 | A |

優先序說明：S＝先做，原因是 (1) 一般人天天遇到、(2) 成品一眼看得懂、(3) 我們能真實跑出可截圖或錄影的結果、(4) 輪播或短片都做得出來。建議首批 S 級：#1、#2、#3、#5、#8、#10、#17。

### 這 20 題的共通做法（與既有規矩相容）
- 每題必有「前後對照」：做之前（亂的原料）→ 做之後（成品）。第 0 幀就是成品，符合鉤子規矩。
- 提示詞當留言禮物，原理最多一句「為什麼這樣問比較好」。
- 示意資料一律標「示意」，不用真人照片；需要查證的（旅遊、價格）要標查證日。

## 四、建議的驗證方式（用自己的數據，不靠部落格）
1. 前 3 週，同一帳號固定比例：做出東西 6 則、原理 2 則、去 AI 味 2 則。
2. 追蹤指標：3 秒留存、收藏率、分享率、私訊／留言領取數；以各自觀看數為分母。
3. 3 週後比較；若「做出東西」收藏＋分享率不比其他兩類高，就收回這個結論。

## 結論：Andy 的判斷對不對、要修正什麼
- **方向大致對，但目前是「有間接佐證、沒有直接數字」，不是已被驗證**：OpenAI 用途研究（高信心）、台灣 Threads 爆紅格式（中）、輪播收藏／Reels 分享的基準（中）都支持「做出東西、可複製套用」；沒有任何資料證明原理或去 AI 味表現較好，也沒有證明它們較差（查無）。
- **要修正的三點**：
  1. 「原理不用太多」改成「原理壓到一句話，放在做完之後當補充」，不是完全刪除，因為可信度與「為什麼提示詞這樣寫」仍有留存價值（推論，低信心）。
  2. 「去 AI 味」不單獨成片，降為每支成品的品質檢查；查不到它自己有流量的證據。
  3. 收藏導向的教學，**輪播比短影片更強**（基準報告），所以同一題材建議「短影片＋輪播」兩個版本，不要只做影片。
- **有更棒的題材嗎**：有。比「做一個東西」更貼近需求的是「做一個你這週真的用得到的東西」（週報、會議紀要、一週菜單、家務表），對應 OpenAI 資料中最大的「實用指導」類。首批建議 #1、#2、#10、#17、#3、#5、#8。
- **限制**：搜尋只拿到摘要、進不了原文；Social Insider 各頁數字互相矛盾，引用前要看原報告；沒有查到任何一個台灣 AI 帳號的具體觀看／讚／收藏數字，所以「附帳號與數字」這項**沒有達成**，需 Andy 提供帳號截圖或由我們用自家數據補。

## 來源
- OpenAI「How People Are Using ChatGPT」https://openai.com/index/how-people-are-using-chatgpt/
- Tom's Guide 報導 https://www.tomsguide.com/ai/chatgpt/1-1-million-chatgpt-messages-analyzed-turns-out-were-mostly-just-asking-about-ourselves
- The Hustle https://thehustle.co/news/most-people-use-chatgpt-for-practical-guidance
- Social Insider Instagram Engagement Report https://www.socialinsider.io/social-media-benchmarks/instagram-engagement-report
- Social Insider 2026 Benchmarks https://www.socialinsider.io/blog/instagram-benchmark-report/
- 數位時代 18 組 AI 生圖提示詞 https://www.bnext.com.tw/article/91430/
- TechBang 厭世上班族卡通頭像 https://www.techbang.com/posts/123778-threads-ai-cartoon-avatar-generator
- Manychat 留言自動私訊 https://manychat.com/blog/the-ultimate-guide-for-instagram-comment-automation/、https://manychat.com/blog/success-stories/monty-lans/
- motionbox 2026 Reels https://motionbox.io/blog/how-to-make-ai-instagram-reels-that-go-viral-in-2026
- clipspeed／mirra.my Shorts 指南 https://www.clipspeed.ai/blog/youtube-shorts-algorithm-decoded.html、https://www.mirra.my/en/blog/youtube-shorts-ai-automation-guide
