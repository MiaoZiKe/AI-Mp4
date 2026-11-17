# caffaine-ask-first 念稿（無聲版，未配旁白；2026/11/17）

類型：小技巧（AI 用法）
結構：S8 兩種做法對決（A 直接做／B 先問三題），左右兩欄對照
版型：開頭鏡 split（左右兩張結果卡）；主畫面手法＝五條事實表打分（同一張表打兩邊）＋長條計分
AI 用法：叫 AI 先問你三個問題，再做事
延伸自：T2 實測式；方法依據是 Karpathy 四原則社群整理的「有疑問先問」（非官方）
領域：上班族訂聚餐（虛構情境）；成品是否為網頁：否
結尾行動：收藏指令（下次先加一句）＋留言關鍵字拿提示詞與測試原文
開頭邏輯（照哩股哩股）：第 0 幀＝「0 分 vs 5 分」這個反差＋旁白第一句「差在哪？」→ 中段逐一回答（事實表、A 的猜測、B 的流程、計分）→ 回扣答案＋提問＋關鍵字
主旨（一句）：想偷懶不一次寫完條件，就叫 AI 先問你三個問題。
標題：別叫 AI 做，先叫它問你
查證日：2026/11/17
留言關鍵字：先問我
封面：別叫 AI 做|先叫它問你三個問題
封面副標：同一句話，直接做 0 分
追蹤：先問:right,直接做:wrong,條件:primary

重點數字：零分／三個問題／四到五分（配音時前後各 0.3～0.5 秒停頓）

| # | 念稿 | view | 素材 | tone | 重點詞 | 來源 | 狀態 | 英 |
|---|---|---|---|---|---|---|---|---|
| s01 | 同一句話交給 AI，直接做，零分。先叫它問三個問題再做，拿到四到五分。差在哪？ | split | caffaine-ask-first/cardA.png\|caffaine-ask-first/cardB.png | event | 直接做、先叫它問三個問題、差在哪 | 實測 2026/11/17：gemini-3.5-flash-lite，各 2 次 | 已確定・實測 | Same sentence to an AI. | Do it right away: 0. Ask three questions first: 4 to 5. Why? |
| s02 | 我只丟一句：幫我規劃下週的部門聚餐。 | chat | 幫我規劃下週的部門聚餐。 | principle | 一句、部門聚餐 | 虛構情境；題目原句（tests/rubric.md） | 情境示意・虛構 | I sent one line: | plan next week's team dinner. |
| s03 | 但我腦中有五件事，人數、預算、素食、日期、地點。 | check | 腦中的五件事（只有我們知道）\|12 人，每人 600 元以內\|2 人吃素\|週四晚上，信義區走路 10 分鐘 | bug | 五件事、素食、地點 | 事實表（tests/rubric.md，跑之前先寫） | 情境示意・虛構 | But I had five things in mind: | headcount, budget, vegetarians, date, place. |
| s04 | 直接做的那邊，自己猜了人數和預算，五條全沒中。 | lens | caffaine-ask-first/cardA.png | bug | 自己猜了、人數和預算、全沒中 | 實測 2026/11/17：A 兩次都 0／5（tests/A-run1.json） | 已確定・實測 | The do-it-now side guessed headcount | and budget. It hit none of the five. |
| s06 | 兩次結果，直接做都是零分；先問，一次四分，一次五分。 | chart | A 第 1 次\|A 第 2 次\|B 第 1 次\|B 第 2 次 | principle | 都是零分、一次四分、一次五分 | 實測 2026/11/17：A 0／0；B 4／5 | 已確定・實測 | Do it now: 0 both times. | Ask first: 4 once, 5 once. |
| s07 | 那次四分，缺素食，因為它沒問，我也沒講。 | kinetic | 4／5\|缺素食\|它沒問，我就沒講 | bug | 四分、缺素食、沒問 | 實測 2026/11/17：B 第 1 次沒有素食 | 已確定・實測 | The 4 missed vegetarian: | it didn't ask, I didn't say. |
| s08 | 所以差別不在 AI 變聰明，是你先把條件交給它。 | flow | 你的條件\|交給 AI\|才開始做 | fix | 條件、交給它 | 實測結論整理 | | So it's not a smarter AI. | You handed over the conditions first. |
| s10 | 存起來，下次先加一句：先問我三個問題。留言「先問我」，我把提示詞和測試原文給你。 | claim | 先問我\|想要先問我三個問題的提示詞\|提示詞＋測試原文 | claim | 先問我三個問題、先問我 | 提示詞整理在 CaffAIne 網站 | | Save this. | Comment "先問我" to get the prompt. |
