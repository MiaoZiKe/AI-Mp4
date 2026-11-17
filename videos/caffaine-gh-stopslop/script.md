# caffaine-gh-stopslop 念稿（無聲版，未配旁白；2026/11/17）

類型：GitHub 搬運（清單型單項精讀）
結構：S2 前後對照（改前、改後、差在哪、AI 沒做好的一處、怎麼套、CTA）
版型：開頭鏡 kinetic（大字＋問號卡）；主畫面手法＝同一題左右兩張回答卡（逐字節錄）＋放大鏡圈出編造
AI 用法：把 GitHub 上的規則檔當系統提示，讓 AI 少寫套路
延伸自：T6 精選清單（單項精讀）；題型見 docs/channels/caffaine-variety-plan-1117.md 第 0B 節
領域：寫作（公司貼文／公告）；成品是否為網頁：否
結尾行動：收藏＋留言關鍵字拿規則檔連結與測試原文
開頭邏輯（照哩股哩股）：第 0 幀「讓 AI 別再寫出 AI 味」＋「真的有用嗎？」問號卡＝具體主張＋要回答的疑問 → 中段逐一回答（規則內容、測試設計、改前改後、它編了什麼）→ 回扣答案「少了套路，沒少編造」＋關鍵字
主旨（一句）：stop-slop 規則檔真的讓 AI 少了套路，但它也會多編題目沒給的事，要自己核對。
標題：讓 AI 別再寫出 AI 味
查證日：2026/11/17
留言關鍵字：去味
封面：讓 AI 別再|寫出 AI 味
封面副標：一份規則檔，實測前後對照
追蹤：規則檔:primary,少了套路:right,會編:wrong

重點數字：一萬九千顆星／副詞四個→一個／兩週（它編的）（配音時前後各 0.3～0.5 秒停頓）

| # | 念稿 | view | 素材 | tone | 重點詞 | 來源 | 狀態 | 英 |
|---|---|---|---|---|---|---|---|---|
| s01 | 讓 AI 別再寫出 AI 味，一份純文字規則檔，一萬九千顆星。真的有用嗎？ | kinetic | 讓 AI 別再\|\|真的有用嗎？ | event | 別再寫出、純文字規則檔、真的有用嗎 | 倉庫頁 2026/11/17：19.0k 星、MIT | 已確定・倉庫頁 | Make AI stop sounding like AI. | One plain-text rules file, about 19,000 stars. Does it work? |
| s02 | 倉庫叫 stop-slop，規則有刪掉副詞、不用破折號。 | editor | videos/caffaine-gh-stopslop/tests/SKILL.md | principle | 刪掉副詞、不用破折號 | hardikpandya/stop-slop 的 SKILL.md（原文） | 已確定・原文 | The repo is stop-slop. | Its rules: no adverbs, no em dashes. |
| s04 | 同一則貼文，沒加規則，四個副詞、一個破折號。放進規則檔，副詞剩一個，破折號沒了，字少快一半。 | split | caffaine-gh-stopslop/cardL.png\|caffaine-gh-stopslop/cardR.png | principle | 同一則貼文、副詞剩一個、少快一半 | 實測 2026/11/17：第 1 次，程式計數 | 已確定・實測 | Same post. Plain: four adverbs, one dash. | With rules: one adverb, no dash, nearly half the words. |
| s05 | 不過右邊多了題目沒給的事：一套叫 Ramp 的系統，每月耗掉兩週。 | lens | caffaine-gh-stopslop/cardR.png | bug | 題目沒給、Ramp、兩週 | 實測 2026/11/17：題目沒提 Ramp、兩週 | 已確定・實測 | But the right side adds facts I never gave: | a tool called Ramp, two weeks a month. |
| s06 | 公司公告再測，加規則的兩次有一次，也編了幾週縮到幾天。 | editor | videos/caffaine-gh-stopslop/tests/A-rules-run1.txt | bug | 公司公告、也編了、幾週縮到幾天 | 實測 2026/11/17：公告題第 1 次 | 已確定・實測（節錄） | Same on a company notice: | in one of two runs it invented "weeks to days". |
| s07 | 要用就貼上規則檔，再加一句：不要加我沒給的事實。 | chat | 請照上面的規則改寫這段文字，不要加我沒給的事實。 | fix | 貼上規則檔、不要加、沒給的事實 | 做法建議，我們還沒測這一句有沒有用 | 建議・未實測 | To use it, paste the rules file, then add: | do not add facts I did not give. |
| s08 | 不過只測了英文，中文有沒有用，還不知道。 | kinetic | 英文\|只測了\|中文呢？ | unknown | 只測了英文、中文有沒有用、還不知道 | 只測英文 2 題、各 2 次、1 個模型 | 查不到・還沒測 | I only tested English. | Chinese, and whether that line works: unknown. |
| s09 | 所以答案是，少了套路，沒少編造。值得收藏，留言「去味」拿規則檔連結。 | claim | 去味\|想要去 AI 味的規則檔連結\|規則檔連結＋測試原文 | claim | 少了套路、值得收藏、去味 | 規則檔連結與測試原文整理在 CaffAIne 網站 | | So: fewer clichés, not fewer inventions. | Worth saving. Comment "去味" for the link and my test logs. |
