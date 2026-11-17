# caffaine-excel-formula 念稿（無聲版，未配旁白；2026/11/17）

結構：S4 計時挑戰
AI 用法：叫 AI 寫 Excel 公式，再用 LibreOffice 驗算
延伸自：T2 實測式、T1 日常素材變成可用的成品（題型見 docs/channels/caffaine-variety-plan-1117.md 第 0B 節）
領域：工作（銷售表）；成品是否為網頁：否
結尾行動：收藏指令＋留言關鍵字
主旨（一句）：公式叫 AI 寫很快，但要貼上去驗算；算錯就把結果告訴它。
標題：一分鐘內叫 AI 寫三條 Excel 公式
查證日：2026/11/17
留言關鍵字：公式
封面：一分鐘三條公式|AI 寫得出來嗎
封面副標：真的算過
追蹤：三條公式:primary,真的算過:right,算出零:wrong

| # | 念稿 | view | 素材 | tone | 重點詞 | 來源 | 狀態 | 英 |
|---|---|---|---|---|---|---|---|---|
| s01 | 一分鐘內，叫 AI 寫三條 Excel 公式，還要算得對。 | kinetic | 60\|秒挑戰 | event | 一分鐘、三條、算得對 | gemini-3.5-flash-lite 實測；虛構銷售表 | 已確定・實測 | One minute: have AI write | three Excel formulas, all correct. |
| s02 | 我先說表格長怎樣，再一條一條問。 | chat | 請寫放在 G2 的公式：區域是「北」而且金額大於 5000 的那些訂單，金額加總。 | fix | 表格長怎樣、一條一條問 | 提示詞原文（節錄；實測用的同一句） | 已確定・實測 | I describe the sheet first, | then ask one formula at a time. |
| s03 | 第一條，北區、大於五千的加總，它給了這條公式。 | editor | videos/caffaine-excel-formula/tests/answer-G2.txt | principle | 第一條、北區、公式 | 實測節錄：gemini-3.5-flash-lite | 已確定・實測（節錄） | Formula one: North region, over 5,000. | It gave this. |
| s04 | 三條公式，一共用了八點五秒。 | kinetic | 8.5\|秒 | event | 三條公式、八點五秒 | 實測 2026/11/17：三次請求回應秒數相加（不含貼上驗算） | 已確定・實測 | Three formulas: | 8.5 seconds in total from AI. |
| s05 | 我用 LibreOffice 真的算一遍，兩條對，一條算出零。 | lens | caffaine-excel-formula/sheet-before.png | bug | LibreOffice、兩條對、算出零 | LibreOffice 24.2 實際重算；標準答案由 Python 直接加總 | 已確定・實測 | I recalculated in LibreOffice. | Two right, one came out as zero. |
| s06 | 第二條日期用斜線，在 LibreOffice 認不出，改橫線就行。 | split | caffaine-excel-formula/card-first.png\|caffaine-excel-formula/card-fixed.png | bug | 斜線、認不出、橫線 | 對照實驗：斜線 0，橫線 75301 | 已確定・實測 | Dates with slashes: LibreOffice can't read. | Dashes work. |
| s07 | 我把結果告訴它：算出零，請修。 | chat | 我貼進去算出來是 0，但 10 月明明有資料，不該是 0。請修正 | fix | 結果告訴它、算出零、請修 | 提示詞原文（節錄；實測用的同一句） | 已確定・實測 | I told it the result: zero. | Please fix it. |
| s08 | 修完算出七萬五千三百零一，三條全對。 | check | 三條都對\|G2　51801 北區大於五千\|G3　75301 十月金額\|G4　3 位業務 | principle | 七萬五千三百零一、三條全對 | 標準答案由 Python 直接加總；修正版也由 LibreOffice 算出 | 已確定・實測 | Fixed: 75,301. | All three right. |
| s09 | 不過這是 LibreOffice 驗算，真的 Excel 還不知道。 | kinetic | LibreOffice\|不是 Excel\|Excel 也一樣？ | unknown | LibreOffice、真的 Excel、還不知道 | 只在 LibreOffice 24.2 驗算，沒有在 Excel 本體測過 | 查不到・還沒測 | But I checked in LibreOffice. | Real Excel: unknown. |
| s10 | 所以做法：講清楚欄位、貼上驗算、算錯就把結果告訴它。 | flow | 講清楚欄位\|貼上驗算\|算錯告訴它 | fix | 講清楚欄位、貼上驗算、算錯 | 做法整理 | | So: describe columns, paste and check, | and report wrong results back. |
| s11 | 留言「公式」，拿這三題的提示詞。 | claim | 公式\|想要這三題的提示詞\|三題原句＋驗算做法 | claim | 公式、提示詞 | 提示詞整理在 CaffAIne 網站 | | Comment "公式" to get | the three prompts. |
