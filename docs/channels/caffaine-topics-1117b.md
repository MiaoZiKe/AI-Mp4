# CaffAIne 題材候選清單（2026/11/17 第二版，只定主題、不做影片）

背景：前兩批題材被擁有者退回（「主題太糟糕、開頭不夠吸引人、內文同一套模板」），他要的是「如何更有效率用 AI、AI 還有哪些小技能」，並補充「先訂好主題；GitHub 搬運先做」。參考三則 aiposthub 貼文：A＝爆紅作品背後的規格式 prompt、B＝新工具 N 種用法、C＝精選清單＋查證＋安裝前三件事。

## 先讀：查證方法與限制
- 查證日 2026/11/17（台北）。WebSearch 關鍵字共 20 組以上（Claude／ChatGPT／Gemini／Canva／CapCut／Higgsfield 新功能、GitHub 熱門、Skills、Karpathy、AI 審 AI、提問法、Abyssal Garden 等），三類來源：官方（GitHub 倉庫頁、OpenAI／Anthropic 發布紀錄的搜尋摘要）、GitHub 倉庫頁（本次用 WebFetch 直接讀，星數與授權取自頁面）、媒體或社群（TechCrunch、Digital Trends、TechRepublic、dev.to、aiposthub 等的搜尋摘要）。
- **這個環境只能直接打開 github.com**；OpenAI、Anthropic、Google、Higgsfield、TechCrunch 等官網打不開，所以「官方出處」欄多半是「搜尋摘要引用官方發布紀錄，原文未親讀」，已逐條標示。
- **星數**：全部是 2026/11/17 讀 GitHub 倉庫頁當天的數字，各站數字彼此差很多（例如 obra/superpowers 有站寫 20.1 萬、有站寫 31.5 萬，倉庫頁寫 318.8k），一律以倉庫頁為準。**「近期增長」只有第三方整理（hyperautomationlabs 11/15 週榜、blockchain.news），我們自己沒有歷史數字，標「第三方整理」。**
- **查不到**：A 的「Abyssal Garden 97 KB、Fable 5.2、180 FPS」——搜尋找不到任何來源，只能引擁有者提供的貼文，標「查不到第二來源」，不能寫成事實。
- 實測能力：可用 Gemini API；OpenAI 額度用完。所以 ChatGPT 功能只能「示意＋媒體報導」，不能宣稱「我們測過」。

## 一、新功能／新工具 N 種用法（5 個）

| # | 功能（推出日） | 鉤子（≤14 字） | 畫面 | 查證 | 出處 | 能實測？ | 熱度理由 |
|---|---|---|---|---|---|---|---|
| N1 | ChatGPT Images 2.6：做 GIF＋存參考圖用 @名字叫出（2026/11/4） | 「ChatGPT 會做 GIF 了」 | 螢幕操作示意＋前後對照（靜態圖→GIF） | 已確定（多家媒體＋OpenAI 發布紀錄摘要）；各方案可用範圍報導不一致，標「逐步開放」 | [OpenAI 發布紀錄](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)（摘要引用，未親讀）、[mixed-news](https://mixed-news.com/en/chatgpt-images-26-gifs-reference-images-openai/)、[TechRepublic](https://www.techrepublic.com/article/news-chatgpt-images-2-6-gif-creation/) | 不能（OpenAI 額度用完）；只能示意 | 前表 YT 同題 Shorts 93,059 觀看（Jerry_AI，11/5），是同類最高之一 |
| N2 | Gemini Notebook（原 NotebookLM）把筆記變成可分享互動網站（2026/11/16 宣布） | 「筆記一句話變網站」 | 螢幕操作示意：貼資料→輸入「make me a site」→網站 | 媒體報導（unite.ai、Digital Trends、newsbytes 都寫 11/16）；Google 官方稿原文未親讀；逐步開放、僅網頁版 | [Digital Trends](https://www.digitaltrends.com/computing/gemini-notebook-can-now-turn-your-notes-into-interactive-websites/)、[unite.ai](https://www.unite.ai/google-adds-shareable-interactive-sites-to-gemini-notebook/) | 部分：Gemini API 可實測「資料→單頁互動 HTML」，不是同一個按鈕，要標示 | 最新（昨天）、成品看得到、可分享；NotebookLM 同類 YT 單支 3.9 萬（許博，10/28） |
| N3 | Claude Whiteboards＋Sheets（Meetings 同批預告）（約 2026/11/10） | 「Claude 能開會、排白板」 | 螢幕操作示意＋清單卡（三個新東西各一張） | 媒體報導（TechCrunch 11/10、India TV 11/16 等）；**Meetings 狀態各家不一致（beta／即將推出）**，Whiteboards／Sheets 為付費方案 beta；台灣可用性查不到 | [TechCrunch](https://techcrunch.com/2026/11/10/anthropic-launches-claude-meetings-to-turn-workplace-discussions-into-plans-and-tasks/)、[iClarified](https://www.iclarified.com/103419/anthropic-launches-claude-sheets-and-whiteboards-previews-meetings) | 不能（無 Claude 付費介面可錄）；只能示意 | YT 同題 6.1 萬（Jerry_AI，11/11）；上班族直接相關 |
| N4 | Higgsfield Miracle：影片拆圖層、改單一物件（2026/11/6，私人測試） | 「影片能像 PS 一樣改圖層」 | 作品展示示意（官方示範）＋提醒卡「還在候補」 | 媒體報導＋官方說法，**無獨立測試**；僅候補名單，沒有價格與日期 | [aiposthub](https://www.aiposthub.com/higgsfield-miracle-layered-video-post-production-private-beta/)（即擁有者參考貼文）、[Higgsfield Miracle 頁](https://higgsfield.ai/miracle)（摘要） | 不能（私人測試） | 擁有者給的參考 B 同題；但沒人能用＝容易變廣告，**不推薦** |
| N5 | NotebookLM 手機錄音直接變筆記（約 2026/10/28） | 「手機錄一段就成筆記」 | 螢幕操作示意 | 只有一支 YT Shorts 佐證（許博，3.9 萬觀看），官方出處**查不到** | [YT Shorts](https://www.youtube.com/shorts/vorpu0_wXYk) | 否 | 日期已 20 天、單一來源，列備選 |

另查：Canva 近 3 週只有 10/30 的 Canva Brush（媒體報導，僅 Pro）、CapCut 桌機 AI 放大（只有一頁比較文章、未驗證）——證據太弱，不列入。

## 二、精選清單／GitHub 搬運（8 個；星數＝2026/11/17 讀倉庫頁）

| # | repo | 鉤子 | 做什麼（一句） | 星數／授權（11/17） | 近期增長 | 怎麼裝 | 安裝風險 | 畫面 | 查證 |
|---|---|---|---|---|---|---|---|---|---|
| G1 | [forrestchang/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)（現屬 multica-ai） | 「一份 65 行檔，23 萬星」 | 把 Karpathy 公開講過的四個壞習慣寫成四條規則：先想再做、保持簡單、只改該改的、先定驗收標準 | 233.8k｜MIT（另有來源指 GitHub 未偵測到 LICENSE 檔，README 寫 MIT） | 10/23 約 22.3 萬→10/30 約 22.7 萬→今 23.4 萬（第三方快照＋本次頁面） | `/plugin marketplace add forrestchang/andrej-karpathy-skills` 或下載 CLAUDE.md | 低：純文字規則；**社群專案，不是 Karpathy 或 Anthropic 官方**，片中必須寫 | 清單卡＋前後對照（同一題有無這四句） | 已確定（倉庫頁）；「出自 Karpathy 說法」為二手轉述，標「社群整理」 |
| G2 | [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop) | 「讓 AI 別再寫出 AI 味」 | 一份規則檔，讓模型自己刪掉套話、排比、機械節奏，附 5 項自評分 | 19.0k｜MIT | 查不到 | 加入為技能；Claude Projects 上傳 SKILL.md；或貼進自訂指令 | 低：純文字；注意它只減少明顯套路，不是偵測器 | 前後對照（同一段文案前後）← 最強畫面 | 已確定（倉庫頁）；與擁有者參考 C 吻合 |
| G3 | [Zackriya-Solutions/meeting-minutes（Meetily）](https://github.com/Zackriya-Solutions/meeting-minutes) | 「會議錄音不用上傳雲端」 | 本機錄音、轉文字、做摘要的開源會議助理 | 32.8k｜MIT | 查不到 | Windows 安裝檔／macOS .dmg／Linux 套件 | 中：預設本機處理，**若選雲端模型摘要，逐字稿會送出**；Windows 需 AVX2 CPU | 螢幕操作示意＋提醒卡 | 已確定（倉庫頁）；沒有實際用過，只能寫「還沒實測」 |
| G4 | [NVIDIA/SkillSpector](https://github.com/NVIDIA/SkillSpector) | 「裝技能前先掃毒」 | 靜態掃描 AI 技能檔：惡意模式、提示注入、外洩、供應鏈，給 0–100 風險分 | 26.5k｜Apache-2.0 | 第三方週榜列名（11/15）；數字查不到 | `uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git` | 中：需命令列與 Python 3.13，對一般上班族門檻高；掃不出來不等於安全 | 清單卡（C 貼文「安裝前三件事」的延伸） | 已確定（倉庫頁） |
| G5 | [anthropics/skills](https://github.com/anthropics/skills) | 「Claude 官方 19 萬星技能庫」 | 官方示範技能：Word／PDF／PPT／Excel 等，教 Claude 照固定方法做事 | 196.3k｜多數 Apache-2.0（頁面無授權徽章，部分文件技能另有條款） | 11/10 有站寫 191,742→今 196.3k | `/plugin marketplace add anthropics/skills` | 低；**官方聲明為示範與教育用途，重要工作先自行測試**；Claude.ai 範例技能僅付費方案 | 清單卡輪播 | 已確定（倉庫頁） |
| G6 | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | 「讓 Claude 記得上次聊了什麼」 | 自動記錄每次工作、壓縮後塞回下次對話，當持久記憶 | 117.8k｜Apache-2.0 | 查不到 | `npx claude-mem install` | **中高**：預設開匿名使用統計；記憶經你選的模型供應商處理；資料存 ~/.claude-mem，雲端同步須自己開 | 清單卡＋風險提醒 | 已確定（倉庫頁）；與參考 C「11.5 萬星」吻合 |
| G7 | [vercel-labs/skills（find-skills）](https://github.com/vercel-labs/skills) | 「不知道有什麼技能，問它」 | 命令列技能搜尋與安裝：`npx skills find 關鍵字` | 39.7k｜MIT | 查不到（各站 3.6～4 萬不一） | `npx skills add vercel-labs/agent-skills`，需 Node 22.20+ | 中：技能是別人寫的，裝前自己讀；頁面沒說明 find-skills 本身，僅見資料夾 | 螢幕操作示意 | 倉庫頁證實有資料夾與 find 指令；**「find-skills 做什麼」第二來源為市集站摘要** |
| G8 | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 「讓 AI 做的介面不像 AI 做的」 | 設計知識技能庫：配色、字型、版型規則 | 150.6k｜MIT | 查不到 | 外掛市集或 `npm i -g ui-ux-pro-max-cli` 後 `uipro init --ai claude` | 低～中：需 Python 3；全域 npm 套件 | 前後對照（同一頁面有無技能） | 已確定（倉庫頁）；效果好壞**待實測** |

已看但**不列入**：morluto/rea（46.5 萬星、逆向工程類，灰色用途且對上班族無用）；pingdotgg/t3code（6.3 萬星、本週 +9,668 為第三方整理；偏工程師）；Meta Astryx（設計系統，偏前端）；obra/superpowers（31.9 萬星，MIT，偏軟體開發方法論，可當 G1 的備案）；OpenCut（9.87 萬星，開源剪映替代，但作者寫明正在重寫、要用舊版 classic，且無內建 AI，做起來容易誤導，備選）；plannotator（1.28 萬星，工程師審 AI 計畫用）。

## 三、效率小技巧（5 個，能實測者優先）

| # | 招式 | 鉤子 | 畫面 | 查證 | 出處 | 實測 | 熱度理由 |
|---|---|---|---|---|---|---|---|
| E1 | 開工前先叫 AI 問你 3 個問題（來自 Karpathy 四原則的「先想再做、有疑問就問」） | 「別急著叫 AI 做，先叫它問你」 | 前後對照（同一個模糊需求：直接做 vs 先反問）＋逐步揭曉 | 方法有倉庫頁依據（G1 第 1 條）；「提問後品質提升」**待我們自己實測**；官方提示指南沒有明確寫這招，不能說成官方建議 | [G1 倉庫頁](https://github.com/multica-ai/andrej-karpathy-skills)、搜尋摘要（網誌做法，非官方） | **可**：Gemini API 做 A／B，同題各跑一次、由人評分 | YT「Karpathy 4 個提示技巧」3.85 萬（11/13）、Claude 工程師三招 3.6 萬（10/18） |
| E2 | AI 審 AI：用「全新對話」或另一家模型檢查剛產出的答案 | 「叫另一個 AI 挑你剛生成的錯」 | 前後對照（含故意埋錯）；作品展示 | 部分已確定：有 arXiv 2610.01471 摘要（二手）顯示跨模型審查抓出約 56.7%、同模型兩輪 42.7% 的人工埋入錯誤；另有研究指兩個模型同時答錯時 60% 錯在同一個答案——**不能說「一定有用」**；原論文未親讀 | [agentpatterns 摘要](https://agentpatterns.ai/verification/cross-model-review-independence/) | **可**：Gemini 兩個模型互審，埋 3 個錯看抓到幾個 | 與參考 A「安排另一個 AI 當評審」同招，但我們有實測可講 |
| E3 | 把規格寫出來再叫 AI 做（A 貼文的核心：視覺與效能優先順序、禁用函式庫、目標硬體） | 「作品好看，是因為 prompt 像規格書」 | 作品展示＋清單卡（規格書五欄） | **A 的 Abyssal Garden／97 KB／180 FPS 查不到任何來源，僅擁有者貼文**；另有 TheNewStack 摘要說 Fable 的 demo prompt 近似「設計簡報加技術規格」，且 Saltline 為「一個籠統 prompt」，兩說互相矛盾 | 查不到（原貼文）；[TheNewStack 摘要](https://thenewstack.io/claude-fable-game-demos/) | **可**：同一個需求「一句話」vs「五欄規格」，用 Gemini 各做一個小頁面 | 熱度高但事實不穩，**實測成立前不當成「爆紅作品」講**，只講「規格寫法」 |
| E4 | 長資料放前面、問題放最後 | 「同一份文件，問題放哪裡差很多」 | 前後對照 | 官方提示指南的說法，來源為二手文章摘要，**未讀官方原文，待查** | 搜尋摘要（見上） | 可（Gemini，但差異可能很小，需多次） | 小招、容易講成「玄學」，備選 |
| E5 | 把常用做法存成技能／自訂指令，下次一句話叫出 | 「同一段話別再貼第二次」 | 螢幕操作示意＋清單卡 | 有官方技能格式依據（anthropics/skills 頁面：每個技能一個資料夾加 SKILL.md） | [anthropics/skills](https://github.com/anthropics/skills) | 部分（Gemini 沒有同款，只能示意） | 與 G2、G5 重疊，可併入清單類 |

## 全部候選數：18（新功能 5＋GitHub 8＋小技巧 5）

## 推薦 6 支（GitHub 3、新功能 1、小技巧 2）

排序依據：①證據站得住腳（倉庫頁或多家媒體）②一般上班族用得上 ③開頭第 0 秒有反差或數字 ④我們能自己做出「前後對照」。

| 順序 | 類型 | 題目 | 第 0 秒鉤子 | 畫面 | 查證狀態 | 為什麼 |
|---|---|---|---|---|---|---|
| 1 | GitHub 清單 | G2 stop-slop | 「讓 AI 別再寫出 AI 味」（或「19.0k 星的一份規則檔」） | 前後對照：同一段公司公告，改前改後 | 已確定（倉庫頁）；效果用 Gemini 實測後才說「有用」 | 痛點最精準（第一批策略 C2 類收藏率 0.37～0.60），畫面最強，風險最低 |
| 2 | GitHub 清單 | G1 Karpathy 四原則（23.4 萬星） | 「23 萬星，其實是 65 行字」 | 清單卡四張＋前後對照 | 已確定（倉庫頁）；Karpathy 出處標「社群整理，非官方」 | 數字有反差、規則本身人人都能轉成日常提問；可與第 4 支（E1）連成系列 |
| 3 | GitHub 清單＋風險 | G3 Meetily 本機會議紀錄（3.28 萬星） | 「會議錄音不上傳雲端」 | 螢幕操作示意＋風險提醒卡（選雲端摘要就會送出逐字稿） | 已確定（倉庫頁）；沒實測，片中明寫 | 上班族最常用的場景；仿參考 C「安裝前注意」格式 |
| 4 | 小技巧 | E1 先叫 AI 問你 3 個問題 | 「別叫 AI 做，先叫它問你」 | 同一模糊需求，A／B 兩欄 | 待實測（Gemini） | 零安裝、人人能用；我們能自己出證據，避免模板感 |
| 5 | 小技巧 | E2 AI 審 AI | 「叫另一個 AI 挑你的錯」 | 埋 3 個錯，看抓到幾個 | 部分已確定＋待實測，片中給實測數字 | 與 A 的「AI 當評審」同招，但是我們自己的數據 |
| 6 | 新功能 | N1 ChatGPT Images 2.6 做 GIF＋參考圖 | 「ChatGPT 會做 GIF 了」 | 螢幕操作示意；明寫「示意，非我們實測」 | 已確定（多家媒體＋OpenAI 紀錄摘要）；範圍「逐步開放」 | 同題 YT 9.3 萬是新功能類最高之一；唯一缺點是我們不能實測，所以只排 1 支，改用示意補 |

備選：N2（Gemini 互動網站，昨天剛出，若確認 Google 官方稿與台灣可用就升第 6）、G4（SkillSpector，接在 G6 之後講「裝技能前掃毒」）、G6（claude-mem，風險最需要講清楚）。**不做**：N4 Higgsfield Miracle（只有候補、無獨立測試）。

## 待確認／未解事項
1. Karpathy 四原則的「出自 Karpathy」只有社群整理，片中用語定為「社群整理自 Karpathy 的公開說法」。
2. 新功能類的官方原文都讀不到；上片前需換有網路權限的環境，核對 OpenAI 發布紀錄與 Google 官方稿。
3. 星數會變：上片當天重讀倉庫頁，片中寫「截至 11/17」。

## Andy 11/17 複選與查證補強（2026/11/17 台北，各支 `videos/caffaine-<slug>/research.md`）

| 題目 | slug | 狀態 | 重點／修正 |
|---|---|---|---|
| G1 Karpathy 四原則 | gh-karpathy | 可做（標註社群整理） | 親數原檔 65 行（44 行有字、2,357 位元組）；星數 233.8k、分叉 23.3k；出處「Karpathy」僅二手，原貼文讀不到；main 分支無 LICENSE 檔（README 寫 MIT） |
| G8 ui-ux-pro-max | gh-uiux | 可做但要標註 | 150.6k 星、MIT；README 現版 80 種風格／192 配色／74 字體／120 UX 指南（第三方舊數字 67／96 不引用）；效果無獨立實測，只能示意 |
| G3 Meetily | gh-meetily | 可做但要標註 | 32.8k 星；選雲端摘要逐字稿會送出；PRO 每月 10 美元；中文逐字稿能力查不到；我們不能實測 |
| G5 anthropics/skills | gh-anthropic-skills | 可做 | 196.3k 星；`skills/` 19 個資料夾；官方說明頁寫 Free 也可用（需開程式碼執行），README 寫付費方案＝衝突，片中不講方案 |
| G7 find-skills | gh-find-skills | 可做 | 讀到 SKILL.md 原檔（141 行，三道品質檢查）；vercel-labs/skills 39.7k 星；安裝量數字各站不一不引用；安裝指令各源不同，上片前自跑確認 |
| E3 prompt 寫成規格書 | spec-prompt | 可做但要標註 | AI 郵報貼文數字再搜仍查不到，不引用；研究結論分歧（規格不一定越詳細越好）；用 Gemini 自己做 A/B（不量 FPS）後才定開頭數字 |
| N2 Gemini Notebook 網站 | gemini-notebook-site | 可做（官方稿未讀） | 11/16，多家媒體一致，網頁版全球、手機即將；是否限付費、台灣、分享保存期限不明；與 N5 勿相鄰排程 |
| N3 Claude 白板＋試算表 | claude-whiteboard | 可做但要標註 | 官方公告 11/10（白板、試算表、Claude Data）、Meetings 11/12；白板／試算表 beta 付費方案，Meetings 僅 Team／Enterprise 先支援 Google Meet，說法不一；台灣查不到；只能示意 |
| N4 Higgsfield Miracle | higgsfield-miracle | **建議延後** | 只有候補名單、無價格、無日期、無獨立測試，會變廣告；若要做，改成「候補中新工具怎麼判斷」清單卡 |
| N5 手機錄音變筆記 | notebooklm-voice | 可做但要標註 | 已由單一來源補到多家媒體（9to5Google 10/27、Digital Trends、Android Authority 等）；9/15 公布、10 月底廣泛推出；1 小時、只留逐字稿說法不一；方案與中文未知 |

建議排程：避免相鄰——G1／G5 同為清單卡、N2／N5 同為 Gemini Notebook；N4 延後不排。
