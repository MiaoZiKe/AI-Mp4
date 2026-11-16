標題：同一句話問 AI 兩次，答案為什麼不一樣（量產套版驗證）
查證日：2026/11/16
留言關鍵字：兩次
封面：同一句話問兩次|答案不一樣
封面副標：AI 是一個字一個字挑的
追蹤：同一句話:note,AI 抽字:primary,答案不同:wrong

| # | 念稿 | view | 素材 | tone | 重點詞 | 來源 | 狀態 | 英 |
|---|---|---|---|---|---|---|---|---|
| s01 | 同一份會議紀錄、同一句話，我問 AI 兩次，答案卻不一樣。 | kinetic | 同一句\|×2 | event | 同一句話、兩次、不一樣 | Gemini 實測 2026/11/16（虛構紀錄，情境示意） | 已確定・實測 | Same notes, same sentence. | I asked AI twice. The answers differed. |
| s02 | 兩次都是同一句：幫我整理這份會議紀錄。 | chat | 幫我整理這份會議紀錄。 | event | 兩次都是同一句、整理這份會議紀錄 | Gemini 實測 2026/11/16：兩次提示詞逐字相同 | 已確定・實測 | Both times, one sentence: | “Please organize these meeting notes.” |
| s03 | 第一次寫行銷經理，第二次寫待指派。 | split | 行銷經理,指派「雙十二客服排班」負責人,11 月底前\|待指派,排定雙十二檔期的客服排班,11 月底前\|負責人,事項,期限\|tests/01-casual.json\|tests/01b-casual-run2.json | bug | 第一次、第二次、待指派 | Gemini 實測 2026/11/16（虛構紀錄）；兩次執行 | 已確定・實測 2 次 | First: marketing manager. | Second: “unassigned”. |
| s04 | 原文寫還沒指派，所以第二次對了，第一次是猜的。 | editor | videos/caffaine-meeting-todo/tests/source-text.txt | bug | 指派、第二次對了、第一次是猜的 | 會議紀錄虛構情境 | 已確定・原文 | The notes say “not yet assigned”: | the 2nd was right, the 1st was a guess. |
| s05 | 為什麼？因為 AI 是一個字一個字挑，像抽籤。這次抽到行銷經理，下次就可能抽到待指派。 | draw | 雙十二客服排班，負責人是\|行銷經理\|待指派\|客服主管\|未指定 | principle | 抽籤、抽到行銷經理、抽到待指派 | 一般原理示意；字是舉例 | 公認原理・示意 | Why? AI picks one word at a time, | like a lottery. Next time, another. |
| s06 | 像丟骰子，同一顆丟兩次，點數不一定一樣。 | draw | 同一顆骰子，丟兩次 | principle | 丟骰子、丟兩次、點數不一定一樣 | 日常比喻，示意 | 日常比喻・示意 | Like dice: roll the same die twice, | the numbers can differ. |
| s07 | 常見的字比較容易被抽到，但不保證每次一樣。 | chart |  | principle | 常見的字、容易被抽到、不保證 | 一般原理示意；不是實際機率 | 公認原理・示意 | Common words are likelier to be drawn, | but no guarantee of the same result. |
| s08 | 不過我只測了這份紀錄，別份會不會這樣，還不知道。 | kinetic | 1\|份紀錄\|別份會不會一樣？ | unknown | 只測了這份紀錄、別份 | Gemini 實測 2026/11/16；只測一份紀錄 | 查不到・還沒測 | But I only tested this one set of notes. | Whether others do this, unknown. |
| s09 | 所以重要的事，問兩次，對一對。 | flow | 問兩次\|對一對\|回原文核對 | fix | 重要的事、問兩次、對一對 | 做法整理（示意） |  | So for important things, | ask twice and compare. |
| s10 | 或者規定它，只根據資料，沒寫的填未指定，我們試了一次，它照做。 | check | 規定它\|只根據資料\|沒寫的填未指定\|試了一次它照做 | fix | 只根據資料、沒寫的填未指定、試了一次 | Gemini 實測 2026/11/16；只試 1 次 | 已確定・實測（1 次） | Or set a rule: use only the data, | write “unspecified” if missing. |
| s11 | 留言「兩次」，拿這兩招的提示詞。 | claim | 兩次\|想要問兩次與規定的提示詞 | claim | 兩次、提示詞 | 提示詞與測試紀錄整理在 CaffAIne 網站（情境示意） |  | Comment “兩次” to get | the prompts for both tricks. |
