# caffaine-gh-stopslop 查證（2026/11/17）
主旨：stop-slop 規則檔讓 AI 少了套路，但實測多編了題目沒給的事。結構 S2。

## 倉庫（讀頁日 2026/11/17，WebFetch 讀 github.com 倉庫頁；原檔用 raw.githubusercontent.com 逐字讀）
- hardikpandya/stop-slop：頁面顯示 19.0k 星（只有四捨五入的數字，沒有精確值）、MIT（側欄與 README 都寫）、12 commits，最後 commit 日期頁面沒顯示。
- SKILL.md（原文存在 tests/SKILL.md）：8 條核心規則（刪填充句、打破公式結構、用主動語態、具體、讓讀者在場、變化節奏、信任讀者、刪名言句）、快速檢查（問「有沒有副詞？Kill them」「有沒有破折號？Remove it」）、5 項 1–10 自評分（低於 35／50 就重寫）。另有 references/phrases.md、structures.md、examples.md。
- 片中講「刪掉副詞、不用破折號」＝SKILL.md 第 35、43、25 行原文。

## 實測（原始請求與回應在 tests/，不改字）
- 模型：gemini-3.5-flash-lite（Gemini API generateContent，純文字，沒開搜尋）。「加規則」＝把 SKILL.md＋references/phrases.md＋references/structures.md 原文當 systemInstruction；「不加規則」＝沒有 systemInstruction。
- 評分規則先寫（tests/rubric.md），程式計數（tests/score.py、score.json）：破折號、套話片語、副詞、「不是 X 而是 Y」、字數；另人工判讀「有沒有編造題目沒給的事」。
- 題目 A（公司公告，英文，tests/base-*、rules-*）：兩邊程式四項全 0（公文口吻本來就沒有這些套路），只有字數 78→53、92→56。人工判讀：加規則第 1 次寫了題目沒給的「The new system cuts processing time from weeks to days」和「Finance will reject any paper submissions」，第 2 次沒有明顯編造。
- 題目 B（LinkedIn 風貼文，tests/B-*）：不加規則第 1 次 86 字、副詞 4（officially、just×2、actually）、破折號 1；加規則第 1 次 46 字、副詞 1（automatically）、破折號 0。第 2 次：100 字、副詞 2、破折號 0 → 63 字、副詞 1。**人工判讀：加規則兩次都編了題目沒給的事**（第 1 次 Ramp、Slack、「cost us two weeks every month」；第 2 次 three weeks、Friday、engineering team 拿回週末）；不加規則的兩次也有編（5 seconds、reimbursements in days），所以「只有加規則才編」不成立，片中只說「加規則後也編了」。
- 評分程式的錯：第一版把 actually 算兩次（副詞 5），修正後是 4；已改程式並記在 rubric.md 末段。片中用修正後的數字。

## 片中數字／事實（≤5、≤6）
一萬九千顆星（19.0k，四捨五入）／副詞 4→1／破折號 1→0／字少快一半（86→46）／Ramp 與每月兩週（題目沒給）／公告題第 1 次編造（兩次有一次）／只測英文。

## 還不知道
- 只測英文兩題、各 2 次、1 個模型；中文有沒有用不知道（規則本身是英文寫的，如 no em dashes）。
- 「再加一句不要加我沒給的事實」有沒有擋住編造：沒測（片中標「建議・未實測」）。
- 「加規則兩次都編」的原因：可能是規則要求「具體」，模型就補具體細節——這是推測，沒有證據，片中不講。
- 效果與倉庫星數無關；也不是 AI 偵測器能不能辨識的問題（倉庫自己也說只減少明顯套路）。
