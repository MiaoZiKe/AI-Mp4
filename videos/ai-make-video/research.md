# research.md — 用 AI 從零做出一支短影音（AI 頻道樣片）

查證日：2026/11/13（台灣時間凌晨）。查證方式：WebSearch（搜尋結果摘要）。**WebFetch 這次開不了任何原始頁面**（見第 6 節），所以下面的「原文」都是搜尋摘要裡引到的句子，不是我逐頁讀過的全文。狀態欄照實寫。

## 1. 事實表

狀態：已確定＝多個獨立來源一致，或官方頁面的句子出現在搜尋摘要裡；分析預期＝合理推論但不是誰公告的事實；尚未確定＝來源互相打架或只有單一二手來源。

| 編號 | 事實 | 來源（日期） | 狀態 | 旁白有沒有用 |
|---|---|---|---|---|
| F1 | 本頻道上一支片（what-is-server）旁白 267 字，人聲 61.2 秒，換算約每分鐘 262 字（每秒 4.4 字）。 | 本 repo `videos/what-is-server/voice.md`、`script.md`（2026/11/12 實測） | 已確定（自己量的；只代表「這個音色、這種語速」，不是通用常數） | 有：句 6「我們實測，一分鐘大概兩百六十個字」 |
| F2 | 這支片的配音是文字轉語音（Gemini TTS，音色 Iapetus），不是真人錄音；稿子由 AI 先寫初稿，再由人查證、修改。 | 本 repo 製作流程（CLAUDE.md「配音流程」） | 已確定，**但有前提**：正式製作時如果改成真人配音或真人寫稿，句 1、句 2 就要改 | 有：句 1、句 2 |
| F3 | Gemini API 有文字轉語音，可以用自然語言指定語氣、口音、速度（官方文件用語：controllable）。 | Google AI for Developers「Speech generation (text-to-speech)」 https://ai.google.dev/gemini-api/docs/speech-generation ；Google 部落格 https://blog.google/technology/developers/gemini-2-5-text-to-speech/ （2025/12） | 已確定（官方文件句子出現在搜尋摘要） | 間接：句 7「把稿子貼進配音工具，讓電腦念出來」。旁白不講品牌 |
| F4 | Google 自己寫明 Gemini 會出錯：「Gemini will make mistakes… could provide inaccurate information」；介面固定提示「Gemini can make mistakes, so double-check it」。 | Gemini Apps FAQ https://gemini.google.com/faq ；說明中心 https://support.google.com/gemini/answer/16279220 | 已確定（官方句子出現在搜尋摘要）。「講得跟真的一樣順」是我對「語句通順但內容錯」的白話描述，不是官方用語 | 有：句 11、句 12 |
| F5 | YouTube 在 2025/7/15 更新合作夥伴計畫（營利）規範：把「重複性內容（repetitious content）」改名為「不真實內容（inauthentic content）」，講清楚大量製造、重複的內容不符合營利資格。YouTube 自己說這是把既有規則講清楚，不是新規則；不管是不是用 AI 做的都適用；違規可能整個頻道失去營利。 | Search Engine Journal https://searchenginejournal.com/youtube-targets-mass-produced-content-in-monetization-update/550337/ ；Social Media Today https://www.socialmediatoday.com/news/youtube-clarifies-monetization-update-inauthentic-repeated-content/752892/ ；ppc.land https://ppc.land/youtube-clarifies-inauthentic-content-policy-changes/ ；Tubefilter https://www.tubefilter.com/?p=187130 （皆 2025/7） | 已確定（四家以上二手報導一致）。**官方政策頁沒有直接讀到**（support.google.com 連不上），確切用字以官方為準 | 有：句 13「YouTube 2025 年也講明了，大量複製的內容不能分潤」 |
| F6 | YouTube 要求創作者揭露「看起來像真的」的 AI 生成或大幅變造內容；明顯不真實的內容、小幅修改不用揭露。揭露不會限制觸及，也不影響營利資格。揭露選項 2024/3 開始推出。 | YouTube 說明中心「Disclosing use of altered or synthetic content」 https://support.google.com/youtube/answer/14328491 ；YouTube 官方部落格 https://blog.youtube/news-and-events/disclosing-ai-generated-content （2024/3/18） | 已確定（官方句子出現在搜尋摘要）。「2025/5 起強制」只有單一二手來源 → 尚未確定 | 沒有（放 caption 與下一集備用） |
| F7 | 剪輯軟體有「自動字幕」（語音轉文字）；YouTube 說明寫自動字幕可能因口音、雜訊而出錯，要創作者檢查修改。 | CapCut 說明 https://www.capcut.com/help/how-to-recognise-subtitles ；YouTube 說明「Use automatic captioning」 https://support.google.com/youtube/answer/6373554 | 已確定 | 有：句 9「字幕讓軟體自動上，再自己看一遍」 |
| F8 | 台灣著作權法第 10 條：著作人於著作完成時享有著作權。自己拍的照片，原則上自己是著作人（照片要有最起碼的創意；被拍的人、別人的作品是另一回事）。 | 著作權法條文 https://6laws.net/6law/laws/著作權法.html ；智慧財產局函釋（104/2/11，搜尋摘要轉述） | 已確定（法條）；細節只讀到二手整理 | 間接：句 8「貼自己拍的照片」。旁白沒有講「版權」兩個字，不下法律結論 |
| F9 | TWNIC《2025 台灣網路報告》：過去三個月有 78.46% 的成年民眾看過短影音，已超過社群媒體（76.86%）；用過生成式 AI 的約 43.19%。調查 2025/7/28–9/1，18 歲以上，有效樣本 2,142 份，2025/12/17 發布。 | 聯合報 https://udn.com/news/story/7266/9225269 ；數位時代 https://www.bnext.com.tw/article/85569/2025-taiwan-internet-report ；報告 PDF https://report.twnic.tw/2025/en/assets/download/TWNIC_TaiwanInternetReport_2025_CH_summary.pdf | 已確定（多家報導一致；PDF 沒打開）。2026 年版截至 2026/11/13 沒查到（往年在 12 月發布） | 沒有（封面、caption 可用） |
| F10 | 同一份報告：「一天看數次」49.98%。 | 同 F9 | **尚未確定母體**：是「全體受訪者」還是「有看短影音的人」，搜尋摘要看不出來（另一家報導寫「58% 每日觀看」，口徑不同） | 沒有，不要用 |
| F11 | YouTube Shorts 從 2024/10/15 起最長 3 分鐘（正方形或更高的比例）。 | Engadget、9to5Google、Search Engine Journal 等（2024/10/3–4），轉述 YouTube 官方部落格 | 已確定（二手一致） | 沒有 |
| F12 | Instagram Reels 最長 3 分鐘（2025/1）。 | Buffer、Metricool 等第三方整理 | 尚未確定（有的來源還寫 90 秒；沒找到官方原文） | 沒有，不要用 |
| F13 | TikTok 要求創作者標示「逼真的 AI 生成內容」（2023/9 起有標示工具）。 | Social Media Today https://www.socialmediatoday.com/news/tiktok-adds-new-required-labels-for-ai-generated-content/690454/ ；Search Engine Land | 已確定（二手一致）；罰則細節只有第三方部落格 → 尚未確定 | 沒有 |

## 2. 旁白用到的說法 → 查證狀態（逐句）

| 句 | 說法 | 依據 | 狀態 |
|---|---|---|---|
| 1 | 這個聲音不是真人錄的 | F2 | 已確定（前提：正式版用 TTS） |
| 2 | 稿子也是 AI 先寫的 | F2 | 已確定（前提同上） |
| 3 | 照五張便利貼，你也做得出一支 | 作法建議，不是事實陳述 | 建議 |
| 4 | 一支片只講一件事 | 本頻道寫作規範 | 建議 |
| 5 | 跟 AI 講清楚觀眾是誰、要幾個字 | 作法建議 | 建議 |
| 6 | 我們實測，一分鐘大概兩百六十個字 | F1 | 已確定（自己量的，有說「我們實測」「大概」） |
| 7 | 把稿子貼進配音工具，讓電腦念出來 | F3 | 已確定 |
| 8 | 聲音先做好，再照著聲音貼自己拍的照片 | 本頻道流程（配音是時鐘）；F8 | 建議 |
| 9 | 字幕讓軟體自動上，再自己看一遍 | F7 | 已確定 |
| 10–12 | 最容易出事的不是工具；AI 會把錯的事講得很順；數字要查來源 | F4 | 已確定（官方承認會出錯）；「一樣順」是描述 |
| 13 | YouTube 2025 年講明：大量複製的內容不能分潤 | F5 | 已確定（二手一致；官方頁未直接讀） |
| 14 | AI 幫你動手，動腦的還是你 | 觀點 | 觀點 |
| 15–17 | 提問、下一集預告 | — | — |

## 3. 鉤子（三個，選了 A）

- **A（採用）「你現在聽到的聲音，不是真人錄的。」** 第一秒就讓觀眾回頭聽聲音，而且整支片本身就是證據。接「連稿子也是 AI 先寫的」，再接「照五張便利貼你也做得出來」。風險：等於在旁白裡講明這支片用了 AI。專案規則是「片中不加 AI 標示」，我的理解是不貼「AI 生成」的角標；這支的題目就是教人用 AI 做片，自己講出來是內容不是標示。**如果不想自曝，改用 B。**
- **B「做一支一分鐘的短影音，稿子只要兩百六十個字。」** 用數字把門檻講小（F1）。比較平，但安全。
- **C「台灣每十個大人，將近八個在滑短影音。那做的人呢？」** 用 F9 的 78.46%。有數字、有台灣感，但離「教學」遠一步，要多花一句才接回來。

## 4. 常見誤解

- M1「丟一句話給 AI，整支片就出來了。」— 做得出來，但錯誤沒人查、每支長得一樣。平台對大量複製的內容不給營利（F5）。
- M2「AI 寫的就是對的。」— 官方自己都說會出錯（F4）。數字、日期、人名一定要回頭查。
- M3「要先買很多工具、要會剪接。」— 五步裡真正要人做的是：定題目、查證、挑照片、看最後一遍。
- M4「用 AI 做的片平台會懲罰。」— YouTube 的營利規則看的是「大量複製、沒有自己的東西」，不是有沒有用 AI（F5）；揭露逼真的 AI 內容也不會降觸及（F6）。
- M5「畫面要先做。」— 先做聲音，畫面跟著聲音的時間走，才不會對不上嘴。
- M6「網路上的圖都可以拿來用。」— 不行。自己拍的最單純（F8）。

## 5. 可用的比喻

- **五張便利貼（採用）**：題目、稿子、聲音、畫面、剪接。一張一件事，貼在白板上，做完一張撕一張。剛好是 sticky 這個外觀。
- **AI 是手，你是腦**（句 14）：AI 很快，但不知道什麼是對的、什麼值得講。
- 實習生：做得快、很有自信、會出錯，所以交出來的東西你要看過。（沒放進旁白，留給留言回覆用）
- 便當：飯（聲音）先盛好，菜（照片）再一格一格擺上去。（沒用，怕和第一支片的廚房比喻重複）

## 6. 沒查到、連不到的

- **WebFetch 全部失敗（主機不在這個雲端環境的網路允許清單）**：`news.pts.org.tw`、`support.google.com`、`blog.youtube`、`support.tiktok.com`。試過各一次，沒有再試別的站，也沒有繞過。要讀原文，得在環境的網路設定放行這些主機。
- 因此沒有逐字核對的：YouTube「不真實內容」政策的官方中文用字（F5）、揭露規定的完整例外清單（F6，例如「只用 AI 寫稿、合成旁白配非寫實畫面」要不要勾）、TWNIC 報告 PDF 內文（F9、F10）。
- F10 的母體、F12 的官方出處、F13 的罰則：沒查到可靠來源，都沒用在旁白。
- 「觀眾幾秒內決定要不要滑走」這類數字：沒有找到可信的一手來源，旁白和畫面都不寫。
- Gemini TTS 模型是否已有更新版（有二手文章提到 3.1）：尚未確定，不影響旁白。
