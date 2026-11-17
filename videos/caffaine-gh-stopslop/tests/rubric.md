# 評分規則（先寫，再跑；2026/11/17）
對同一則回答，程式數四項（score.py，不憑感覺）：
1. 破折號（—）個數（倉庫規則第 6 條「No em dashes」）
2. 套話片語命中數：phrases.md 開場清單（Here's the thing / It turns out / The truth is / Let me be clear …）、強調拐杖（Let that sink in / This matters because / Make no mistake）、商業用語（game-changer / navigate / lean into / landscape / moving forward / circle back / deep dive / on the same page / unpack / double down）
3. 副詞：-ly 結尾字、加 really / just / literally / honestly / simply / actually / truly（規則：Kill all adverbs）
4. 「不是 X，而是 Y」句型：出現 "not just"、"not only"、"It's not … it's"、"isn't … it's" 的次數
另記總字數。分數越低越少套路。不評「好不好看」。
題目（固定）：請寫一則給全公司的簡短公告（120 字以內，英文）：從 12/1 起，報帳一律改用新系統送出，11/30 之後紙本單據不再受理。

## 補充（第一題跑完後、第二題跑之前追加；追加原因：第一題是公文口吻，四項程式指標兩邊都是 0，量不出差別）
- 第二題（跑之前先寫）：Write a short LinkedIn-style post (under 100 words, English) about why our team switched to a new expense system. 同樣四項程式指標，另加第 5 項人工判讀：有沒有寫出題目沒給的事實（編造）。
- 第一題的人工判讀也補第 5 項（只判讀，不改前面已記下的分數）。

## 記錄：評分程式的錯（2026/11/17 做影片時發現並修正）
第一版 score.py 把「actually」同時算進「-ly 結尾」與「副詞清單」兩次，所以 B-base-run1 的副詞被算成 5；修正成每個字只算一次後是 4。規則文字沒改，只修程式；score.json 已用修正後的重算。
