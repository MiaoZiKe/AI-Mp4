# caffaine-two-ai-duel 念稿（無聲版，未配旁白；2026/11/17）

結構：S8 兩個工具對決
AI 用法：同一題整理帳目，問兩個 AI，用事先寫好的評分表比誰算對
延伸自：T2 實測式（題型見 docs/channels/caffaine-variety-plan-1117.md 第 0B 節）
領域：記帳整理；成品是否為網頁：否
結尾行動：二選一提問＋留言關鍵字
主旨（一句）：同一題問兩個 AI，要先寫好評分表再看答案，而且重要的數字自己對一次。
標題：同一題問兩個 AI，誰算對
查證日：2026/11/17
留言關鍵字：對決
封面：同一題問兩個 AI|誰算對
封面副標：八項評分，兩個 Gemini 型號
追蹤：評分先寫好:right,筆數全錯:wrong,對一次:primary

| # | 念稿 | view | 素材 | tone | 重點詞 | 來源 | 狀態 | 英 |
|---|---|---|---|---|---|---|---|---|
| s01 | 同一題整理帳目，我問兩個 AI，看誰算對。 | split | caffaine-two-ai-duel/b35.png\|caffaine-two-ai-duel/b31.png | event | 同一題、兩個 AI、誰算對 | 實測：gemini-3.5-flash-lite 對 3.1-flash-lite | 已確定・實測 | Same bookkeeping question, | two AIs. Who gets it right? |
| s02 | 十二行流水帳，藏了重複貼上、中文數字和退款三個陷阱。 | editor | videos/caffaine-two-ai-duel/tests/data.txt | bug | 十二行、重複貼上、退款 | 虛構流水帳（tests/data.txt） | 情境示意・虛構 | Twelve lines, three traps: | a duplicate, Chinese numerals, a refund. |
| s03 | 看答案之前，我先算好標準答案，寫好八項評分。 | check | 標準答案（先算好）\|餐飲　450 元，4 筆\|交通　210 元，4 筆\|娛樂　280 元，3 筆　總額 940 | principle | 標準答案、先算好、八項評分 | tests/rubric.md（跑之前先寫）；人工計算 | 已確定・實測 | Before looking, I worked out the answer | and an eight-point rubric. |
| s04 | 兩個 AI 收到一模一樣的字，一個字都沒差。 | chat | 請只輸出一張表格，欄位是「類別｜筆數｜小計」，表格最後一行寫「總額」，不要其他說明。 | fix | 一模一樣、一個字、沒差 | 題目原句（節錄）；兩個模型同一句 | 已確定・實測 | Both got the exact same words, | not one character different. |
| s05 | 結果舊的三點一版五分，新的三點五版只拿三分。 | kinetic | 5\|比 3 分 | principle | 三點一版、五分、三分 | 實測 2026/11/17：第一次回答的分數（滿分 8） | 已確定・實測 1 次 | Result: the older 3.1 scored 5, | the newer 3.5 scored 3. |
| s06 | 三點五版的交通少算十五元，剛好是公車那一筆。 | lens | caffaine-two-ai-duel/b35.png | bug | 三點五版、交通少算、公車 | 實測 2026/11/17：交通小計 195，標準 210 | 已確定・實測 1 次 | 3.5 undercounted transport by 15, | exactly the bus ride. |
| s07 | 不過筆數兩個都數錯，六格全錯。 | kinetic | 6/6\|筆數數錯 | bug | 筆數、兩個都、六格全錯 | 實測 2026/11/17：兩個模型第一次回答的筆數各 3 格全不符 | 已確定・實測 1 次 | But both miscounted the rows: | all six counts were wrong. |
| s08 | 不過只出一題、各問兩次，誰比較強，還不知道。 | kinetic | 1\|題\|誰比較強？ | unknown | 只出一題、各問兩次、還不知道 | 只測 1 題、2 個模型、各 2 次 | 查不到・還沒測 | But one question, two runs each. | Who is stronger? Unknown. |
| s09 | 所以重要的數字，先算好答案，再讓 AI 算，自己對一次。 | flow | 先算答案\|同題問兩個\|逐項對分 | fix | 先算好答案、讓 AI 算、對一次 | 做法整理 | | So for numbers that matter: | work it out first, then check. |
| s10 | 你平常用哪個？留言「對決」，拿這題的原題。 | claim | 對決\|想要這題的原題與評分表\|題目＋標準答案＋評分表 | claim | 你平常用哪個、對決、原題 | 原題與評分表整理在 CaffAIne 網站 | | Which do you use? Comment "對決" | to get the question and rubric. |
