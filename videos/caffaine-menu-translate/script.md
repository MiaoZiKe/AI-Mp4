# caffaine-menu-translate 念稿（無聲版，未配旁白；2026/11/17）

結構：S5 常見錯誤 vs 正確（只說翻譯 vs 說清楚要什麼）
AI 用法：拍外文菜單叫 AI 翻譯並解釋
延伸自：T2 實測式、T1 日常素材變成可用的成品（題型見 docs/channels/caffaine-variety-plan-1117.md 第 0B 節）
領域：旅遊（外文菜單）；成品是否為網頁：否
結尾行動：留言關鍵字拿提示詞
主旨（一句）：叫 AI 解釋菜單，說明會多出來，但那是它補的，過敏原要問店家。
標題：拍一張外文菜單，叫 AI 翻譯並解釋
查證日：2026/11/17
留言關鍵字：菜單
封面：外文菜單|只說翻譯夠嗎
封面副標：兩種問法實測
追蹤：只說翻譯:wrong,說清楚:right,AI 補的:note

| # | 念稿 | view | 素材 | tone | 重點詞 | 來源 | 狀態 | 英 |
|---|---|---|---|---|---|---|---|---|
| s01 | 拍一張外文菜單，叫 AI 翻譯，只說翻譯，夠嗎？ | device | caffaine-menu-translate/phone.png | event | 外文菜單、翻譯、夠嗎 | gemini-3.5-flash-lite 實測；程式畫的示意菜單 | 已確定・實測 | Photo of a foreign menu. | Is "just translate" enough? |
| s02 | 第一種問法，只說：幫我翻譯這張菜單。 | chat | 幫我翻譯這張菜單。 | bug | 第一種問法、翻譯、菜單 | 提問原句（實測用的同一句） | 已確定・實測 | Way one, just say: | "Translate this menu for me." |
| s03 | 結果品名、價格、過敏提示都對，一道也沒錯。 | check | 兩次回答對照菜單\|品名　8 道全對\|價格　8 道全對\|菜單印的過敏提示　4 項全帶到 | principle | 品名、價格、過敏提示 | 人工逐項對照菜單（兩次實測） | 已確定・實測 2 次 | Names, prices, printed allergy notes: | all correct, none wrong. |
| s04 | 可是親子丼，第二次它只留日文名，沒說是什麼。 | lens | caffaine-menu-translate/a2card.png | bug | 親子丼、第二次、沒說是什麼 | 實測 2026/11/17：只說翻譯版第二次回答 | 已確定・實測 1 次 | But "oyakodon" the second time: | just the name, no explanation. |
| s05 | 第二種問法，請它說明做法、食材，標出過敏原。 | chat | 請翻成繁體中文，每道菜用一句話說明它是什麼、主要食材和做法；菜單上標了過敏原的要照抄標出來 | fix | 第二種問法、說明、過敏原 | 提問原句（節錄；實測用的同一句） | 已確定・實測 | Way two: ask for the method, | ingredients, and allergy notes. |
| s06 | 每道菜都多了說明，像親子丼：雞肉洋蔥淋蛋，蓋在飯上。 | editor | videos/caffaine-menu-translate/tests/answer-B.txt | principle | 每道菜、親子丼、淋蛋 | 實測節錄：gemini-3.5-flash-lite（說清楚版） | 已確定・實測（節錄） | Every dish got a note. Oyakodon: | chicken and onion under egg, over rice. |
| s07 | 但洋蔥、叉燒、蔥花，菜單根本沒印，是它補的，沒有一道標不確定。 | kinetic | 0\|道標不確定 | bug | 菜單根本沒印、是它補的、沒有一道標不確定 | 實測 2026/11/17：說清楚版兩次回答都沒有「不確定」 | 已確定・實測 2 次 | Onion, chashu, scallion aren't on the menu. | It added them, and flagged none. |
| s08 | 不過我只用一張自製菜單、一個模型，真的店家的菜單，還不知道。 | kinetic | 1\|張自製菜單\|真的店家菜單？ | unknown | 一張自製菜單、一個模型、還不知道 | 只測 1 張自製菜單、1 個模型、每種問法 2 次 | 查不到・還沒測 | But one made-up menu, one model. | Real restaurants: unknown. |
| s09 | 所以做法：拍清楚、要說明、過敏原一定問店家。 | flow | 拍清楚\|要說明\|過敏問店家 | fix | 拍清楚、要說明、問店家 | 做法整理；過敏相關請以店家說明為準 | | So: shoot it clearly, ask for notes, | and ask the staff about allergies. |
| s10 | 留言「菜單」，拿這句說清楚的提示詞。 | claim | 菜單\|想要說清楚的提示詞\|提問原句＋三步 | claim | 菜單、提示詞 | 提示詞整理在 CaffAIne 網站 | | Comment "菜單" to get | the prompt that asks for notes. |
