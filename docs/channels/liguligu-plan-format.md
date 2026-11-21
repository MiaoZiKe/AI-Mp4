# 哩股哩股 plan.json 格式（寫稿只填文字與數字）

`videos/<slug>/plan.json` → `node scripts/dossier/build-script.mjs <slug>` → `script.json`（補 id、keywords、cues、片尾卡、頻道固定設定），再 `npm run validate <slug>`。範本在 `scripts/dossier/templates/<鏡型>.json`，版面參數已固定成審查較好的寫法。照片檔另做：`public/dossier/<slug>/<photoName>.jpg`（`make-photos.py`）。

## 頂層
`slug`、`title`、`asOf`（YYYY/M/D，畫面「查證截至」）、`thesis`（一句主旨）、`endCard: { comment（2–4 字，最後一句念稿要念到）, next（下一集題目） }`、`cover: { title: ["兩行","封面字"], sub }`；可選 `voice`（預設 Charon／gemini-3.8-flash-tts／liguligu）、`places`（news.places）、`link`。

## 每一幕
`{ type, narration, tts?, subtitle: {zh, en}, cues: [...], fields: {...}, sources: [...], keywords?, beat?, hold? }`
- `cues`：依念稿順序的詞（字面要出現在 narration 或 tts），個數由鏡型規定；畫面動作對這些詞（對應範本裡的 c1、c2…）。
- `sources`：一行出處陣列（≤30 全形字）；`subtitle.zh` 用 `\n` 斷行，每段 ≤13 全形字，英文用 ` | ` 分段。
- 所有 `fields` 都是必填（有預設的除外）；**空字串會被擋下，所以不會有空卡**。填了用不到的欄位也會報錯。
- 每幕都要有 `dateline`（電頭，例「TOKYO・2026/11/16」≤22 全形字）；`lt`（≤6 字欄目籤，有預設）；`place` 可選（要在 `places`）。
- 狀態標籤 kind：`confirmed`｜`report`｜`none`（分析推測）｜`pending`。沒讀原文只能標 `report`／`none`，不標 confirmed。照片圖說要有「示意」。

## 鏡型與欄位（括號＝預設）
1. **hook**（必為第 1 幕，4 cue：開場詞／標記詞／輔助詞／數字詞）：kicker, span, num（要含數字）, numText(%), line2, mark, docTitle, docDate(asOf), docField, docFill, calloutLabel, calloutText, tagText, tagKind(report), dateline, lt(事件)
2. **claim**（說法引句，4 cue：標題詞／誰說／引文大字詞／收尾）：head, headMark, photoName, photoCaption, photoDate, quoteBy, quotePre, quoteBig, quotePost(空), mastName, mastDate, tagText, tagKind(report), note(選填), dateline, lt(查證)
3. **versus**（兩欄對照，4 cue：引子／右欄誰說／右欄說法／左欄說法）：leftHead, leftDoc, leftBig, leftSrc, leftTag, leftKind(report), rightHead, rightBig（字串或兩行陣列，每行 ≤4 字）, rightSrc, rightTag, rightKind(report), rightMast, rightMastDate, mid(？), dateline, lt(兩種說法)。兩欄標題、出處一開始就在，大字念到才蓋上
4. **notequal**（A≠B，5 cue：A 詞／第一列／符號與第一列標籤／B 詞／第二列）：a, b, op(≠，或 vs), opLabel(不等於), row1, row1Tag, row1Kind(report), row2, row2Tag, row2Kind(report), dateline, lt(對照)。只有字，不要連放兩幕，旁邊的幕要有照片或圖
5. **timeline**（4 cue：左卡打字／左卡標記／間隔天數／右卡事件）：photoName, photoCaption, days（日期陣列）, gapNum, gapPre(只隔), gapUnit(天), leftTitle, leftDate, leftSub, leftLines（2 行陣列）, rightLabel, rightDate, rightLines（2 行陣列）, tagText(已確定), tagKind(confirmed), axisLabel(時間軸), dateline, lt(發生了什麼)
6. **pending**（還不知道，4 cue：日期／左列事件／右列疑問／還不知道）：photoName, photoCaption, leftRow, rightTitle, rightField(（未公布）), rightRow, tagText(截至 asOf 尚未確定), dateline, lt(還不知道)
7. **ask**（最後內容幕，4 cue：問句前半／問句後半／下一集題目／留言詞）：headLine1, headLine2, headMark1, headMark2, comment 由 endCard 帶入, photoName, nextTitle, dateline, lt(提問)。之後 build 自動接片尾卡（3.6 秒）

## 選填欄位（2026/11/21，沒填就是原本的樣子；各範本 `_meta.optional` 有全文）
- 有照片的鏡型（hook、claim、versus、pending、ask）：`photoSteps`（陣列，簡圖分段畫出的時間點，每個點擦出下一段；`events.mjs` 會算進事件）、`photoStepP`（每段畫到的比例 0–1，個數＝photoSteps＋1）、`photoDir`（right｜down）、`photoColor: true`（彩色資料圖不蓋暗色；`assets.json` 的 `photos.<名稱>.color: true` 讓 make-photos 保留彩色）。
- versus `leftCount`／`rightCount`、claim `quoteCount`：大字裡的數字從 0 跳到定值。versus 另有 `leftBigAt` 等時間欄位（兩欄同一幀出現用）。
- ask `nextAt`／`photoAt`／`titleAt`／`frameAt`：結論卡提早出、停 ≥1.5 秒。
- 範例：`videos/liguligu-hike2022/plan.json`（第 3 版）。

## 寫稿提醒（審查「下次避免」）
每鏡要有主素材（照片、文件框、圖表）＋一個對上關鍵詞的細節；不用通用照片（會議桌、鐵塔）；一支一題；原文沒讀就不當主論點；反駁前先在畫面放出誰說過那句。
