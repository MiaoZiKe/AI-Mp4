# caffaine-say-idk 念稿（無聲版，未配旁白；2026/11/17）

結構：S3 三個技巧清單
AI 用法：叫 AI 資料沒寫就說不知道，不要亂編（防編造）
延伸自：T2 實測式、T6 精選清單（題型見 docs/channels/caffaine-variety-plan-1117.md 第 0B 節）
領域：店家客服；成品是否為網頁：否
結尾行動：留言關鍵字拿提示詞
主旨（一句）：叫 AI 資料沒寫就說沒寫，它就不編。
標題：讓 AI 老實說不知道
查證日：2026/11/17
留言關鍵字：不知道
封面：AI 愛亂編|三招讓它說不知道
封面副標：五題實測，兩招有用
追蹤：亂編:wrong,資料沒寫:right,三招:primary

| # | 念稿 | view | 素材 | tone | 重點詞 | 來源 | 狀態 | 英 |
|---|---|---|---|---|---|---|---|---|
| s01 | 客服 AI 愛亂編？用三招，讓它老實說不知道。 | chat | 有沒有 Wi-Fi 可以用？ | event | 愛亂編、三招、不知道 | gemini-3.5-flash-lite 實測；虛構早餐店 | 已確定・實測 | Does a support AI make things up? | Three tricks to make it admit it doesn't know. |
| s02 | 我給它一份只有五行的早餐店資料，再問五件資料裡沒有的事。 | editor | videos/caffaine-say-idk/tests/shop.txt | principle | 五行、早餐店資料、沒有的事 | 自製虛構店家資料（shop.txt） | 情境示意・虛構 | I gave it five lines about a shop, | then asked five things not in it. |
| s03 | 什麼規定都不加，五題全編，連 Wi-Fi 都說成沒有。 | check | 什麼規定都不加\|素食？說蛋餅可以做素食\|外送？說沒有外送\|Wi-Fi？說沒有 Wi-Fi | bug | 不加、五題全編、Wi-Fi | 實測 2026/11/17：五題都把沒寫的事說成事實（人工判讀） | 已確定・實測 1 次 | No rules added: all five made up, | even "no Wi-Fi" stated as fact. |
| s04 | 第一招，只根據資料，編的剩兩題。 | kinetic | 5→2\|題編造 | fix | 第一招、只根據資料、兩題 | 實測 2026/11/17：「請只根據上面的店家資料回答」 | 已確定・實測 1 次 | Trick 1: use only the data. | Made-up answers: 5 down to 2. |
| s05 | 第二招，准許它說資料裡沒有寫。 | chat | 如果資料裡沒有寫，就回答「資料裡沒有寫」，不要猜。 | fix | 第二招、准許、沒有寫 | 提示詞原句（實測用的同一句） | 已確定・實測 | Trick 2: give it permission | to say "it isn't written". |
| s06 | 結果五題全都老實說沒寫，一題都沒編。 | check | 加了這句：五題都說沒寫\|素食？資料裡沒有寫\|外送？資料裡沒有寫\|Wi-Fi？資料裡沒有寫 | principle | 五題、沒寫、沒編 | 實測 2026/11/17：五題都說資料沒寫（人工判讀） | 已確定・實測 1 次 | All five: honestly "not written". | Zero made-up. |
| s07 | 第三招，先引用原文，沒用，五題還是都編。 | editor | videos/caffaine-say-idk/tests/answer-3-U3.txt | bug | 第三招、先引用原文、都編 | 實測節錄：gemini-3.5-flash-lite | 已確定・實測（節錄） | Trick 3: quote the source first. | It didn't help. Still five made up. |
| s08 | 不過我只試一份五行資料、一個模型，長文件還不知道。 | kinetic | 5\|行資料\|長文件會怎樣？ | unknown | 五行資料、一個模型、還不知道 | 只測 1 份五行資料、1 個模型、每格 1 次 | 查不到・還沒測 | But only a five-line source, one model. | Long documents: unknown. |
| s09 | 所以最有用的是那句：資料沒寫，就說沒寫。 | flow | 給資料\|加一句規定\|核對回答 | fix | 最有用、資料沒寫、說沒寫 | 做法整理 | | So the useful line is: | if it's not written, say so. |
| s10 | 留言「不知道」，拿這三句規定的提示詞。 | claim | 不知道\|想要三句規定的提示詞\|三招原句＋實測結果 | claim | 不知道、提示詞 | 提示詞整理在 CaffAIne 網站 | | Comment "不知道" to get | the prompts for all three tricks. |
