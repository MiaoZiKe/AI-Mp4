# CaffAIne 長期有用題材研究：IG／Threads／YouTube 爆紅樣本（2026/11/17）

依據：擁有者 2026/11/17 要求「找 IG／Threads 上爆紅的 AI 內容，主軸是長期使用都會有幫助的能力（提示詞、對答、省 Token、學習、拆解問題、專案／記憶／規則檔、AI 剪輯），不是用一次就沒了的生活小招」。方法限制：不直接爬 instagram.com／threads.com；用 WebSearch 找公開摘要與整理文章，YouTube 用搜尋頁讀觀看數。既有資料見 `caffaine-strategy-1116.md`、`caffaine-variety-plan-1117.md` §0B。

## 結論先講

1. **能驗證的數字裡，觀看最大宗是「官方示範」與「規則檔／專案／上下文管理」**：Claude 官方《The CLAUDE.md file》625,168、《Context Management in Claude Code》467,058（#35、#36；官方大頻道，不代表小帳號做得到）。
2. **學習法有一支超大樣本**：《Learn Anything FASTER With ChatGPT》545,361（#23，3 年前長尾，不是近期爆紅）。
3. **小帳號近期能看到的是 2～5 萬級**：Karpathy 4 個提問技巧 38,541（#6）、高度深度廣度三招 36,086（#7）、Grok Bot 5 條規則 48,084（#8）——都是「一組可照抄的問法」。
4. **省 Token 題材真實觀看偏低（中位數約 1.7 千）**，但「caveman」這種瘋傳 prompt 在 Reddit 有 10K 票（#22）。省 Token 的價值在「會自己量、不被騙」，不在轉述招數。
5. **「讓 AI 先問你」切中通病、但數字看不到**：只找到媒體整理與電子報（#13～#15），沒有可驗證互動數，可做、但不能宣稱它爆。
6. **Threads 的數字一個都沒取得**；IG 只有擁有者提供的舊數據（不是新查到的）。限制全寫在最後一節。

## 一、爆紅樣本表

抓取日 2026-11-17（IG 項目為擁有者 2026-11-16 提供）。YouTube 觀看數取自搜尋結果的 viewCountText 原文；「約N個月前」是 YouTube 顯示的相對時間，不是精確日期。共 53 筆，其中 40 筆有確切或約略觀看數。

## 一、爆紅樣本表

抓取日 2026-11-17（IG 項目為擁有者 2026-11-16 提供）。YouTube 觀看數取自搜尋結果的 viewCountText 原文；「約N個月前」是 YouTube 顯示的相對時間，不是精確日期。編號供下文引用。

| # | 平台 | 帳號 | 標題／第一句 | 形式 | 互動數字 | 連結 | 日期 |
|---|---|---|---|---|---|---|---|
| 1 | YouTube | 洋拉图 | 如何让ChatGPT帮你写出优质论文 提问技巧及注意事项 | 口播／螢幕（<4 分鐘篩選，細節未驗證） | 64,502 觀看 | [連結](https://www.youtube.com/watch?v=dsYFinYEdJ8) | 約3年前 |
| 2 | YouTube | Anthropic（官方） | Behind the prompt: Prompting tips for Claude.ai | 官方示範 | 111,389 觀看 | [連結](https://www.youtube.com/watch?v=OfUn6HjwXhI) | 約3年前 |
| 3 | YouTube | Google（官方） | How to write an AI prompt | 官方教學 | 112,580 觀看 | [連結](https://www.youtube.com/watch?v=QAKtNOWsaHI) | 約6個月前 |
| 4 | YouTube | Google Cloud Tech | Tips to becoming a world-class Prompt Engineer | 官方教學 | 72,493 觀看 | [連結](https://www.youtube.com/watch?v=RywP7cCYUWE) | 約3年前 |
| 5 | YouTube | Microsoft | How to create a great Microsoft Copilot prompt | 官方教學 | 103,125 觀看 | [連結](https://www.youtube.com/watch?v=9b0LOSjq39w) | 約2年前 |
| 6 | YouTube Shorts | Jordan Blake | Andrej Karpathy reveals 4 AI prompting tricks | 直式短片 | 38,541 觀看 | [連結](https://www.youtube.com/shorts/tBExSHBCOU0) | 2026-11-13 |
| 7 | YouTube Shorts | fOx Hsiao | Claude 工程師教你用 AI 更有野心：高度、深度、廣度三招，附可照抄的指令 | 直式短片（結尾拋問題） | 36,086 觀看 | [連結](https://www.youtube.com/shorts/S4zR_F1MRRo) | 2026-10-18 |
| 8 | YouTube Shorts | Jerry_AI 工具X實作X新 | 別自己讀！直接丟給你的Grok Bot｜2 分鐘看懂 Grok Bot 指南 5 條規則 | 直式短片 | 48,084 觀看 | [連結](https://www.youtube.com/shorts/9B5_dMPoVnU) | 約3週前（抓取日） |
| 9 | YouTube Shorts | 浩想不打工 | 别再抄提示词模板了！官方公布最新提问法 | 直式短片 | 869 觀看 | [連結](https://www.youtube.com/shorts/JSx5AqyLP8o) | 2026-11-14 |
| 10 | YouTube | 效率Andy | 3分鐘客製你的ChatGPT：官方推薦提示詞技巧 | 口播／螢幕 | 242 觀看 | [連結](https://www.youtube.com/watch?v=WvCQG_HYmaI) | 約2年前 |
| 11 | YouTube | 吴限可能 | AI提示詞技巧｜加一句話 ChatGPT答案由60分變90分 | 短片 | 8 觀看 | [連結](https://www.youtube.com/watch?v=Eb6bfywOMvo) | 約4週前 |
| 12 | Instagram | pratiiksaini | 一個 prompt 做完十件事 | 看不到（擁有者提供數據，無連結） | 約 53K 讚 | （無連結） | 2026-11-16 抓取 |
| 13 | Threads／文章 | （媒體整理，原貼文看不到） | Anthropic 工程師 Thariq 的「盲點巡查」：動工前先讓 AI 挑出你沒想到的未知，問完再執行 | 文章／提示詞 | 看不到 | [連結](https://www.bnext.com.tw/article/91490/anthropic-engineer-blind-spot-prompt) | 演講 2026-07-01；報導日未確認 |
| 14 | Substack | Ruben Hassid | How to ask AI once（寫前先讓模型問最多 5 個澄清問題） | 電子報 | 看不到 | [連結](https://ruben.substack.com/p/how-to-ask-ai-once) | 2025-10（依搜尋摘要） |
| 15 | 文章 | bnext 數位時代 | ChatGPT 提示詞技巧（含「你還需要哪些背景資訊」問法） | 文章 | 看不到 | [連結](https://www.bnext.com.tw/article/84991/chatgpt-prompt-tips) | 未確認 |
| 16 | YouTube | BytePage | How to Save Claude Code Tokens Usage｜5 ways | 教學 | 11,299 觀看 | [連結](https://www.youtube.com/watch?v=FD08nrQ3C-c) | 約3個月前 |
| 17 | YouTube | Lvl 99 TechSkillz | How to Convert PDF to Markdown and Save Claude Tokens | 螢幕錄影 | 13,510 觀看 | [連結](https://www.youtube.com/watch?v=mphjbQYOVtI) | 約4個月前 |
| 18 | YouTube | CuCreate | The Fastest Way to Save Claude Tokens (PDF Trick) | 短片 | 1,694 觀看 | [連結](https://www.youtube.com/watch?v=_wzRReHpGRo) | 約3個月前 |
| 19 | YouTube | 陈乔维Justin | 一个Skill能帮你节省90%的Token! | 口播 | 678 觀看 | [連結](https://www.youtube.com/watch?v=BIVSNYfdV2c) | 約2個月前 |
| 20 | YouTube | AI航海员 | 5个Codex配置小动作，解除Codex token额度超限 | 口播／螢幕 | 1,777 觀看 | [連結](https://www.youtube.com/watch?v=UXkY_cgKs7U) | 約4個月前 |
| 21 | YouTube | AI创客笔记 | Claude Code 太烧 Token？5 招每月省一半 | 口播 | 14 觀看 | [連結](https://www.youtube.com/watch?v=lozcWbiJl2g) | 約4個月前 |
| 22 | Reddit／GitHub | Julius Brussee（caveman） | 讓 Claude 用「原始人」語氣回答省 token 的 prompt／skill | 貼文＋開源專案 | 看不到 | [連結](https://decrypt.co/363440/devs-claude-talk-like-a-caveman-cut-costs-work-better) | 2026（decrypt 報導：r/ClaudeAI 超過 10K 票、400+ 留言；GitHub 星數各報導 2 萬～10 萬不一，實測省 14～21%，宣稱 75%） |
| 23 | YouTube | Ken's Room | Learn Anything FASTER With ChatGPT (5 ChatGPT Prompts For Studying) | 螢幕錄影＋口播 | 545,361 觀看 | [連結](https://www.youtube.com/watch?v=bIgg91Mqd-k) | 約3年前 |
| 24 | YouTube | 蘋果99 | NotebookLM 實測（Shorts） | 直式短片 | 460,000 觀看（約數） | [連結](https://www.youtube.com/shorts/0zUL7Tf0lU0) | 近 12 個月內（日期讀不到；觀看為約數） |
| 25 | YouTube | TVBS NEWS | 黃仁勳每天用這「四種AI」學習 | 新聞專訪 | 57,221 觀看 | [連結](https://www.youtube.com/watch?v=ekOwaEH54Iw) | 約1年前 |
| 26 | YouTube | Hive Academy 蜂巢研究所 | 學嘢快10倍！AI + 費曼學習法，你永遠唔使死記硬背 | 口播 | 29,947 觀看 | [連結](https://www.youtube.com/watch?v=pYnk6vq7iOE) | 約10個月前 |
| 27 | YouTube | 达姐AI说 | Gemini重磅更新！内置Notebooks+NotebookLM，打造你的AI知识库系统｜3个真实场景演示 | 螢幕示範 | 10,578 觀看 | [連結](https://www.youtube.com/watch?v=NsSMbDF9kbE) | 約7個月前 |
| 28 | YouTube | Google for Education | The "Socratic Tutor" using Gemini Notebook | 官方教學 | 5,682 觀看 | [連結](https://www.youtube.com/watch?v=WfC2tna6kA4) | 約10個月前 |
| 29 | YouTube | Calvin Cheung | 費曼學習方法教學 feynman ai tutorial | 口播 | 5,900 觀看 | [連結](https://www.youtube.com/watch?v=b49K7rrGydk) | 約1年前 |
| 30 | 媒體 | Tom's Guide | This viral ChatGPT prompt can teach you anything | 文章 | 看不到 | [連結](https://www.tomsguide.com/ai/this-viral-chatgpt-prompt-can-teach-you-anything-and-im-officially-hooked) | 2025（搜尋摘要）；原貼文數字看不到 |
| 31 | YouTube | 居鲁仕 | 一颗橘子教会你反推提示词 | 口播＋示範 | 2,669 觀看 | [連結](https://www.youtube.com/watch?v=5Ce9uht-PQU) | 約7個月前 |
| 32 | YouTube Shorts | 志祺七七 | 學習 AI 工具沒有意義？（工具會過時、底層邏輯不會） | 口播 | 48,607 觀看 | [連結](https://www.youtube.com/shorts/hqkaHo8qKmk) | 2026-08-24 |
| 33 | YouTube | 劉毅 YiTalk | 你的AI产出像垃圾，是你没有学会苏格拉底式的提问！ | 口播 | 53 觀看 | [連結](https://www.youtube.com/watch?v=ZUVzdgB26iw) | 約6個月前 |
| 34 | YouTube | 秦π | AI 时代最稀缺的能力：定义问题 | 口播 | 4 觀看 | [連結](https://www.youtube.com/watch?v=4bicXlovMjI) | 約4個月前 |
| 35 | YouTube | Claude（官方） | The CLAUDE.md file | 官方示範 | 625,168 觀看 | [連結](https://www.youtube.com/watch?v=O0FGCxkHM-U) | 約6個月前 |
| 36 | YouTube | Claude（官方） | Context Management in Claude Code | 官方示範 | 467,058 觀看 | [連結](https://www.youtube.com/watch?v=eW3oTyfeWZ0) | 約5個月前 |
| 37 | YouTube | Sabrina Ramonov | How to Use Claude AI in 2026 (Complete Beginner Guide) | 螢幕錄影 | 209,134 觀看 | [連結](https://www.youtube.com/watch?v=4tDCltcLTJU) | 約7個月前 |
| 38 | YouTube | Harsh Singh | Claude Project - how to use?（Shorts 標籤） | 短片 | 42,787 觀看 | [連結](https://www.youtube.com/watch?v=-QTq1i5AamY) | 約4個月前 |
| 39 | YouTube Shorts | Jerry_AI 工具X實作X新 | Claude Code 別再每步都盯！Claude 工程師 Lydia 的五項重點架構 | 直式短片 | 18,254 觀看 | [連結](https://www.youtube.com/shorts/rGfYyAHgb6s) | 2026-11-14 |
| 40 | YouTube | Tutorialytics | How to Make Claude Remember Your Chat History (2026 Full Guide) | 螢幕錄影 | 4,424 觀看 | [連結](https://www.youtube.com/watch?v=UapKx9_B1Dc) | 約7個月前 |
| 41 | YouTube | 科技兔 | ChatGPT 與 OpenAI Codex 個人化自訂指令與記憶設定教學 | 螢幕錄影 | 583 觀看 | [連結](https://www.youtube.com/watch?v=W_ngHkQAV3Y) | 約6個月前 |
| 42 | Instagram | asksui | Claude＋Remotion 做動畫 | 看不到（擁有者提供，約 1,592 粉） | 約 64 千觀看 | （無連結） | 2026-11-16 抓取 |
| 43 | Instagram | michonmotion | Claude 接 Higgsfield 做影片 | 看不到 | 約 23K 讚 | （無連結） | 2026-11-16 抓取 |
| 44 | YouTube | 傑克 IT 誌 | 拒絕 AI 盲盒！Claude Code 串接 Pencil MCP，直接生成 Remotion 動畫代碼 | 螢幕錄影 | 5,465 觀看 | [連結](https://www.youtube.com/watch?v=TWiIi_oIBUw) | 約9個月前 |
| 45 | YouTube | Vincent's AI Lab | I Turned Claude Code + Remotion into Product Launch Motion Design | 螢幕錄影 | 4,019 觀看 | [連結](https://www.youtube.com/watch?v=iShab28B_ak) | 約3個月前 |
| 46 | YouTube | Outclaw AI | AI Video Using Claude Code & OpenMontage (Hyperframes + Remotion) | 螢幕錄影 | 2,573 觀看 | [連結](https://www.youtube.com/watch?v=bUVsuk50mHo) | 約4個月前 |
| 47 | YouTube | 痞凱踏踏 PKstep | 剪映AI配音教學｜自動產生聲音旁白和對話 | 螢幕錄影 | 15,399 觀看 | [連結](https://www.youtube.com/watch?v=PvK95ZbyGds) | 約2年前 |
| 48 | YouTube | 六六AI研究所 | 如何用Codex自动完成视频剪辑（附教程） | 螢幕錄影 | 3,226 觀看 | [連結](https://www.youtube.com/watch?v=l6JeJLoH3Iw) | 約2個月前 |
| 49 | 部落格 | nahid（kit.com） | How I hit 1M views using one Claude skill（做影片封面的 skill） | 文章 | 看不到 | [連結](https://nahid-s-notebook.kit.com/posts/how-i-hit-1m-views-using-one-claude-skill) | 約12天前（搜尋時）；100 萬只見於標題，未能驗證 |
| 50 | Instagram | jasonxtsai | 7 個 skill 去 AI 味 | 輪播（推測） | 1,499 讚 | （無連結） | 2026-11-16 抓取 |
| 51 | Instagram | jasonxtsai | Skills 精簡 15 個 | 輪播（推測）；留言 1,616 受關鍵字 CTA 影響 | 804 讚 | （無連結） | 2026-11-16 抓取 |
| 52 | Instagram | aiposthub | UI 沒 AI 味（收藏 444） | 看不到 | 879 讚 | （無連結） | 2026-11-16 抓取 |
| 53 | Instagram | ai_bytes.lab | AI 寫前端停在 2019（約 1,711 粉） | 看不到 | 約 81 千觀看 | （無連結） | 2026-11-16 抓取 |


## 二、主題聚類

中位數只算有數字的樣本；YouTube 觀看與 IG 讚不能混算，分開列；「看不到」不計入。各帳號大小差很多（官方大頻道 vs 幾百觀看的小帳號），中位數只能看量級，不能當預期值。

| 類別 | 樣本數 | 編號 | 觀看中位數 | 讚中位數 |
|---|---|---|---|---|
| A 提示詞框架／問法技巧 | 12 | #1～#12 | 48,084（YouTube 觀看，11 筆） | 53,000（IG 讚，1 筆） |
| B 讓 AI 先問你（澄清、盲點巡查） | 3 | #13～#15 | 無 | 無 |
| C 省 Token／額度 | 7 | #16～#22 | 1,735（YouTube 觀看，6 筆） | 無 |
| D 用 AI 學習新知識（費曼、NotebookLM、蘇格拉底） | 8 | #23～#30 | 29,947（YouTube 觀看，7 筆） | 無 |
| E 拆解問題／底層心法 | 4 | #31～#34 | 1,361（YouTube 觀看，4 筆） | 無 |
| F 記憶、專案、規則檔、長期工作流 | 7 | #35～#41 | 42,787（YouTube 觀看，7 筆） | 無 |
| G AI 剪輯／做影片 | 8 | #42～#49 | 4,019（YouTube 觀看，5 筆） | 23,000（IG 讚，1 筆） |
| H 輸出品質（去 AI 味）清單 | 4 | #50～#53 | 無 | 879（IG 讚，3 筆） |

全部有數字的 YouTube 40 筆，觀看中位數 12,404（受官方大頻道與 3 年前長尾影響偏高）。

讀法：
- **F 記憶／專案／規則檔、A 提示詞問法、D 學習法**三類中位數 3～5 萬，前 10 名全落在這三類；但前 10 名裡多數是官方或 2～3 年前的長尾。
- **C 省 Token、E 底層心法、G 剪輯**中位數只有 1～4 千，多半是新片或小帳號，不能解讀成「不吃香」，只能說沒看到爆款證據。
- **B 讓 AI 先問你**沒有數字。

### 前 10 名（只算有數字的 YouTube，依觀看排序）

| 名次 | 編號 | 標題 | 帳號 | 觀看 | 備註 |
|---|---|---|---|---|---|
| 1 | #35 | The CLAUDE.md file | Claude（官方） | 625,168 | 約 6 個月前，官方 |
| 2 | #23 | Learn Anything FASTER With ChatGPT | Ken's Room | 545,361 | 約 3 年前，長尾 |
| 3 | #36 | Context Management in Claude Code | Claude（官方） | 467,058 | 約 5 個月前，官方 |
| 4 | #24 | NotebookLM 實測 | 蘋果99 | 約 460,000 | 日期讀不到、觀看為約數 |
| 5 | #37 | How to Use Claude AI in 2026 | Sabrina Ramonov | 209,134 | 約 7 個月前 |
| 6 | #3 | How to write an AI prompt | Google | 112,580 | 約 6 個月前，官方 |
| 7 | #2 | Behind the prompt: Prompting tips for Claude.ai | Anthropic | 111,389 | 約 3 年前，官方 |
| 8 | #5 | How to create a great Microsoft Copilot prompt | Microsoft | 103,125 | 約 2 年前，官方 |
| 9 | #4 | Tips to becoming a world-class Prompt Engineer | Google Cloud Tech | 72,493 | 約 3 年前，官方 |
| 10 | #1 | 如何让ChatGPT帮你写出优质论文 提问技巧 | 洋拉图 | 64,502 | 約 3 年前 |

另：IG 項目（擁有者提供）數字最大的是 pratiiksaini「一個 prompt 做完十件事」約 53K 讚（#12）、ai_bytes.lab 約 8.1 萬觀看（#53）、asksui「Claude＋Remotion 做動畫」約 6.4 萬觀看（#42）。近期（2026/10～11）小帳號 Shorts 前段班見 #6、#7、#8（3.6～4.8 萬）。

## 三、鉤子句型歸納（14 種）

只收樣本裡真的出現過的標題或第一句；編號對應樣本表。

| # | 句型 | 原句例子 | 編號 |
|---|---|---|---|
| 1 | 數字＋承諾 | 「Claude Code 太烧 Token？5 招每月省一半」 | #21 |
| 2 | 名人／官方背書 | 「Andrej Karpathy reveals 4 AI prompting tricks」「Claude 工程師教你用 AI 更有野心」 | #6 #7 |
| 3 | 否定舊做法 | 「别再抄提示词模板了！官方公布最新提问法」 | #9 |
| 4 | 命令式省力 | 「別自己讀！直接丟給你的Grok Bot」 | #8 |
| 5 | 痛點質問 | 「你的AI产出像垃圾，是你没有学会苏格拉底式的提问！」 | #33 |
| 6 | 一句話升級 | 「加一句話 ChatGPT答案由60分變90分」 | #11 |
| 7 | 時間或速度承諾 | 「3分鐘客製你的ChatGPT」「Learn Anything FASTER With ChatGPT」 | #10 #23 |
| 8 | 具體量化 | 「一个Skill能帮你节省90%的Token!」 | #19 |
| 9 | 反直覺／翻案 | 「為什麼改 Prompt 省不了錢？」；「提示詞越寫越長反而害了你！」 | YouTube 搜尋結果、bnext 標題，未列入表 |
| 10 | 結果先行＋門檻低 | 「我只說一句話，ChatGPT就自動剪輯做好影片」 | 搜尋結果，未列入表 |
| 11 | 提問反思 | 「AI幫你整理完知識，你就真的學會了嗎？」「學習 AI 工具沒有意義？」 | #32 |
| 12 | 秘密／你不知道 | 「3 SECRET ChatGPT Commands You Need to Try!」 | 既有 variety-plan 表 #27 |
| 13 | 日常物件類比 | 「一颗橘子教会你反推提示词」 | #31 |
| 14 | 官方直述 | 「The CLAUDE.md file」「How to write an AI prompt」 | #35 #3 |

CaffAIne 套用：我們的第 0 秒大字是中文、≤14 字。上面句型裡「否定舊做法」「痛點質問」「一句話升級」「具體量化」最容易縮成 14 字。

## 四、給 CaffAIne 的 15 個選題

共同規則：只做「照著做就能長期用」的方法；每支都要有一個可複製的範本或一套做法，並在本機實測、數字以實測為準；第 0 秒大字 ≤14 字。

| # | 主題 | 第 0 秒大字 | 觀眾帶走什麼 | 對應爆紅樣本 | 為什麼長期有用 |
|---|---|---|---|---|---|
| 名次 | 編號 | 標題 | 帳號 | 觀看 | 備註 |
|---|---|---|---|---|---|
| 1 | #35 | The CLAUDE.md file | Claude（官方） | 625,168 | 約 6 個月前，官方 |
| 2 | #23 | Learn Anything FASTER With ChatGPT | Ken's Room | 545,361 | 約 3 年前，長尾 |
| 3 | #36 | Context Management in Claude Code | Claude（官方） | 467,058 | 約 5 個月前，官方 |
| 4 | #24 | NotebookLM 實測 | 蘋果99 | 約 460,000 | 日期讀不到、觀看為約數 |
| 5 | #37 | How to Use Claude AI in 2026 | Sabrina Ramonov | 209,134 | 約 7 個月前 |
| 6 | #3 | How to write an AI prompt | Google | 112,580 | 約 6 個月前，官方 |
| 7 | #2 | Behind the prompt: Prompting tips for Claude.ai | Anthropic | 111,389 | 約 3 年前，官方 |
| 8 | #5 | How to create a great Microsoft Copilot prompt | Microsoft | 103,125 | 約 2 年前，官方 |
| 9 | #4 | Tips to becoming a world-class Prompt Engineer | Google Cloud Tech | 72,493 | 約 3 年前，官方 |
| 10 | #1 | 如何让ChatGPT帮你写出优质论文 提问技巧 | 洋拉图 | 64,502 | 約 3 年前 |ICS

建議順序（【推測】依樣本觀看與可實測度）：先做第 13、12、4、8 題（有 3 萬以上對照或官方大量觀看），再做第 2、3 題（數字看不到但切中通病），省 Token（第 6、7 題）放中段，影片類（第 15 題）是我們自己的製作流程，隨時可做。

## 五、查不到與限制

- **Threads：沒有任何一筆可驗證的貼文互動數字。** WebSearch 對 `threads.net` 被工具擋掉（回 400）；一般搜尋只回到媒體文章。已知的 Threads 現象（AI 改圖、ChatGPT 髮型分析洗版、「@meta.ai」提問）只有媒體敘述，沒有讚數。
- **IG：沒有新查到單支貼文的讚、留言、收藏。** `instagram.com` 限定搜尋只回帳號頁（摘要寫 god of prompt 約 34 萬粉、Daily Prompter 約 59 萬粉、Maverick Maltin 約 100 萬粉），沒有單支數字；表中 IG 項目全部來自擁有者 11/16 提供的數據，無連結。
- **YouTube 是補充數據，不等於 IG／Threads 表現**：結果混有 2～3 年前長尾與官方大頻道，觀看中位數會偏高；沒有收藏、留言數；「約N個月前」是相對時間。#24 蘋果99 的 46 萬為約數、日期讀不到（來自既有 variety-plan 記錄）。
- **YouTube 關鍵字**：這次 22 組（中英文）各取前 10：ChatGPT 提示詞 技巧、AI 省 token 技巧、用 AI 學習 新知識、prompt engineering tips、save tokens Claude ChatGPT、learn anything with ChatGPT prompt、Claude Code CLAUDE.md memory tips、Claude 專案 自訂指令 長期記憶、NotebookLM 學習 新知識、費曼學習法 ChatGPT、AI 拆解問題 提示詞、AI 提示詞 框架 CRISPE、ChatGPT 記憶 自訂指令 設定、Claude Remotion 影片 製作、AI 自動剪輯 短影音 CapCut、Claude projects tutorial、ChatGPT prompts that save hours、AI study prompt Socratic tutor；另有 4 組讀不到資料：AI 剪輯 影片 教學、ChatGPT 讓AI先問你問題 提示詞、Claude Code CLAUDE.md 規則檔、reduce token usage Claude Code tips。部分組只回 4～8 筆。
- **WebSearch 關鍵字（中英文共 14 組，含 IG 限定網域）**：Threads 提示詞 技巧 爆紅 讓AI先問你；IG 提示詞 收藏 ChatGPT 技巧 輪播 萬讚；prompt engineering tips instagram reel viral likes ChatGPT；save tokens ChatGPT Claude tips viral post Threads；Feynman technique ChatGPT prompt learn anything viral instagram；Claude Projects custom instructions memory CLAUDE.md tips instagram reel；AI 剪輯 影片 Threads IG 爆紅 Claude Remotion 自動剪輯；Threads AI 拆解問題 第一性原理 提示詞；instagram.com 限定提示詞搜尋；threads.com／threads.net 限定（失敗）；caveman prompt 省 token；Threads 臺灣 AI 創作者 爆紅；Ruben Hassid 澄清問題 prompt；Anthropic 工程師 盲點巡查 Thariq。
- **摘要會自己湊**：搜尋回應曾把不同文章內容混在一起（例：簡立峰「你還需要哪些背景資訊」問法無法確認出處，所以只把 bnext 該篇列為來源、互動數字寫「看不到」）。caveman 的 GitHub 星數各報導從 2 萬到 10 萬不等，只引 decrypt 的「Reddit 10K 票、400+ 留言」與獨立實測 14～21%（宣稱 75%），其餘不採。「100 萬觀看」（#49 nahid）只出現在標題，未驗證。
- **專案、規則檔的細節沒有逐條核對官方文件**：第 6、12、13 題的做法來自搜尋到的官方與第三方摘要；上片前要重查官方說明，並以本機實測為準。
- **選題的「為什麼長期有用」是依樣本與常識判斷【推測】**，不是某則貼文說的。

連結來源（本次搜尋）：[bnext 盲點巡查](https://www.bnext.com.tw/article/91490/anthropic-engineer-blind-spot-prompt)、[decrypt caveman](https://decrypt.co/363440/devs-claude-talk-like-a-caveman-cut-costs-work-better)、[Ruben Hassid](https://ruben.substack.com/p/how-to-ask-ai-once)、[Tom's Guide](https://www.tomsguide.com/ai/this-viral-chatgpt-prompt-can-teach-you-anything-and-im-officially-hooked)。
