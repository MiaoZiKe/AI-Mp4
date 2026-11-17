# caffaine-screenshot-ask 念稿（無聲版，未配旁白；2026/11/17）

結構：S9 迷你教學（一步一步）
AI 用法：把截圖丟給 AI，直接問看不懂的畫面（讀圖）
延伸自：T1 日常素材變成可用的成品、T2 實測式（題型見 docs/channels/caffaine-variety-plan-1117.md 第 0B 節）
領域：生活（手機畫面）；成品是否為網頁：否
結尾行動：留言關鍵字拿提示詞
主旨（一句）：看不懂的畫面，截圖整張丟給 AI，再叫它一步一步說。
標題：看不懂的畫面，截圖問 AI
查證日：2026/11/17
留言關鍵字：截圖
封面：看不懂的畫面|截圖直接問 AI
封面副標：三步，一張截圖
追蹤：截圖:primary,一步一步:right,只截一半:wrong

| # | 念稿 | view | 素材 | tone | 重點詞 | 來源 | 狀態 | 英 |
|---|---|---|---|---|---|---|---|---|
| s01 | 手機跳出看不懂的畫面，截圖丟給 AI，直接問它。 | lens | caffaine-screenshot-ask/screen.png | event | 看不懂、截圖、直接問 | gemini-3-flash-preview 實測；自製示意畫面 | 已確定・實測 | A phone screen you can't read? | Screenshot it, ask AI directly. |
| s02 | 第一步，截圖，把有紅字的那一塊截進去。 | device | caffaine-screenshot-ask/screen.png | fix | 第一步、截圖、紅字 | 自製示意畫面，非真實 App | 做法・示意 | Step 1: take a screenshot, | and keep the red text in it. |
| s03 | 第二步，問它：這是什麼，我該怎麼辦，請一步一步說。 | chat | 請告訴我它在說什麼、為什麼會這樣、我該怎麼辦，請一步一步說。 | fix | 第二步、怎麼辦、一步一步 | 提問原文（實測用的同一句） | 已確定・實測 | Step 2: ask what it is, | what to do, one step at a time. |
| s04 | 它讀出只剩 0.3 GB、至少要 1 GB，叫我按「管理儲存空間」。 | editor | videos/caffaine-screenshot-ask/tests/answer-A-run2.txt | principle | 0.3 GB、1 GB、管理儲存空間 | 實測節錄：gemini-3-flash-preview | 已確定・實測（節錄） | It read 0.3 GB left, 1 GB needed, | and told me to tap "Manage storage". |
| s05 | 第三步，照畫面對一次數字，我對過，沒讀錯。 | check | 對照畫面\|0.3 GB　剩餘空間\|1 GB　需要的空間\|紅字　儲存空間不足 | principle | 第三步、數字、沒讀錯 | 人工逐項對照畫面（兩次實測各一次） | 已確定・實測 2 次 | Step 3: check the numbers on screen. | I did. It read them right. |
| s06 | 圖縮到很小，數字還是讀對；但只截一半，沒截到紅字，它就開始猜。 | split | caffaine-screenshot-ask/small-up.png\|caffaine-screenshot-ask/cropped.png | bug | 縮到很小、只截一半、開始猜 | 實測 2026/11/17：縮小版與只截一半版各問 2 次 | 已確定・實測 2 次 | Shrunk to 1/8 width: still right. | Cropped: no red text, so it guessed. |
| s07 | 兩次都先猜沒連 Wi-Fi，其實真正的原因是空間不足。 | kinetic | 猜 Wi-Fi\|\|其實是空間 | bug | 先猜、Wi-Fi、空間不足 | 實測 2026/11/17：只截一半版兩次回答都先列 Wi-Fi | 已確定・實測 2 次 | Both times it guessed Wi-Fi first. | The real cause was low storage. |
| s08 | 不過我只試一張自製畫面、一個模型，別的畫面還不知道。 | kinetic | 1\|張自製畫面\|別的畫面會怎樣？ | unknown | 一張自製畫面、一個模型、還不知道 | 只測 1 張自製畫面、1 個模型 | 查不到・還沒測 | But I tried only one made-up screen | and one model. Others: unknown. |
| s09 | 所以三步：截圖截完整、一步一步問、照畫面核對。 | flow | 截完整\|一步一步問\|照畫面核對 | fix | 截完整、一步一步問、核對 | 做法整理 | | So, three steps: capture it all, | ask step by step, check the screen. |
| s10 | 留言「截圖」，拿這句提問提示詞。 | claim | 截圖\|想要這句提問的提示詞\|提問原句＋三步 | claim | 截圖、提示詞 | 提示詞整理在 CaffAIne 網站 | | Comment "截圖" to get | the prompt for this question. |
