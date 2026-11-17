# caffaine-pdf-cite 念稿（無聲版，未配旁白；2026/11/17）

結構：S2 前後對照
AI 用法：叫 AI 只照講義原文回答，每句附頁碼（查證、防編造）
延伸自：T4 前後對照、T2 實測式（題型見 docs/channels/caffaine-variety-plan-1117.md 第 0B 節）
領域：學習與文件（社區圖書館須知）；成品是否為網頁：否
結尾行動：收藏指令＋留言關鍵字
主旨（一句）：叫 AI 只照原文答、每句附頁碼，我才查得到它有沒有編。
標題：叫 AI 只照原文回答，附頁碼
查證日：2026/11/17
留言關鍵字：頁碼
封面：只照原文回答|每句附頁碼
封面副標：四頁講義實測
追蹤：只照原文:right,附頁碼:primary,沒說哪一頁:wrong

| # | 念稿 | view | 素材 | tone | 重點詞 | 來源 | 狀態 | 英 |
|---|---|---|---|---|---|---|---|---|
| s01 | 一份四頁的講義，叫 AI 只照原文回答，每句附頁碼。 | browser | caffaine-pdf-cite/p1.png\|caffaine-pdf-cite/p3.png | event | 四頁的講義、只照原文、附頁碼 | gemini-3-flash-preview 實測；虛構講義 | 已確定・實測 | A four-page handout. Tell AI: | answer only from it, cite the page. |
| s02 | 我只多加一句：只根據原文回答，每句標頁碼。 | chat | 請只根據文件原文回答，每一句話後面用括號標上頁碼 | fix | 多加一句、只根據原文、標頁碼 | 提示詞原句（實測用的同一句） | 已確定・實測 | I added one sentence: | answer only from the text, cite pages. |
| s03 | 沒加這句，答案也對，但沒說哪一頁；加了，每句都有頁碼。 | split | 6 本,每天罰款 2 元,100 元手續費\|6 本（第 1 頁）,每天罰款 2 元（第 3 頁）,100 元（第 3 頁）\|借書本數,逾期罰款,遺失手續費\|tests/A-free-run1.json\|tests/B-cite-run1.json | bug | 答案也對、沒說哪一頁、每句都有頁碼 | 實測 2026/11/17（節錄）：同一份講義、同一題 | 已確定・實測 1 次 | Without it: right, but no page. | With it: every line has a page. |
| s04 | 沒有頁碼，我得自己翻四頁去找。 | editor | videos/caffaine-pdf-cite/tests/answer-A.txt | bug | 沒有頁碼、自己翻、四頁 | 實測節錄：gemini-3-flash-preview（不限制版） | 已確定・實測（節錄） | No page numbers: | I'd have to flip through four pages. |
| s05 | 有頁碼，我只翻被標的位置，五個頁碼全對。 | check | 五個頁碼全對\|6 本　第 1 頁\|每天 2 元　第 3 頁\|賠償加 100 元　第 3 頁 | principle | 有頁碼、被標的位置、全對 | 人工逐頁對照講義（第一次實測） | 已確定・實測 1 次 | With pages, I check only those spots. | All five page numbers are right. |
| s06 | 像第三頁，罰款和賠償，原文就在那裡。 | lens | caffaine-pdf-cite/p3-lens.png | principle | 第三頁、罰款和賠償、原文 | 虛構講義第 3 頁 | 已確定・原文 | Like page 3: fines and compensation, | the source text is right there. |
| s07 | 影印這題，文件根本沒寫，兩種版本都老實說沒寫。 | kinetic | 影印\|文件沒寫\|兩個版本都沒編 | principle | 影印、文件根本沒寫、沒寫 | 實測 2026/11/17：兩個版本都說文件沒提到影印 | 已確定・實測 1 次 | Photocopying isn't in the file. | Both versions honestly said so. |
| s08 | 不過這份只有四頁，更長的文件會不會編，還不知道。 | kinetic | 4\|頁講義\|更長的文件會怎樣？ | unknown | 只有四頁、更長的文件、還不知道 | 只測 1 份四頁講義、1 個模型、每種問法 1 次 | 查不到・還沒測 | But it's only four pages. | Longer documents: unknown. |
| s09 | 所以做法：貼文件、規定附頁碼、翻到那頁核對。 | flow | 貼文件\|規定附頁碼\|核對那頁 | fix | 貼文件、附頁碼、核對 | 做法整理 | | So: paste the file, require page numbers, | and check those pages. |
| s10 | 留言「頁碼」，拿這句規定的提示詞。 | claim | 頁碼\|想要只照原文回答的提示詞\|規定原句＋用法 | claim | 頁碼、提示詞 | 提示詞整理在 CaffAIne 網站 | | Comment "頁碼" to get | the rule sentence. |
