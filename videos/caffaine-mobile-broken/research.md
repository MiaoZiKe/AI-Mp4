# caffaine-mobile-broken 查證（2026/11/17）

主旨（一句）：叫 AI 做網站，手機版看不到價格欄；一句話只修一半，要把想看到的樣子說清楚。

## 實測做法（原文在 tests/，不改字）
- 工具：Gemini API（純文字，沒開搜尋工具）。第一版 tests/01-first.json＝gemini-3.5-flash（modelVersion gemini-3.6-flash，2026-11-17 03:25 台北）；第一版額度用完後，修正兩輪改用 gemini-3-flash-preview（02-fix、03-fix2，03:35–03:36）。同一段對話換模型接續，這點在 README 與 caption 都要照實說。
- 提示（01）：做咖啡店介紹網頁，有頂部選單、四欄價目表（品名、尺寸、熱量、價格）、三個推薦商品卡、聯絡資訊，只輸出單檔 HTML。輸出 tests/01-first.html。
- Playwright（tests/shot.py、table.py、sect.py，無頭 Chromium，viewport 390×844、DPR 2、觸控）：頁面本身沒有整頁橫向溢出（scrollWidth 390），但價目表寬 443px，包在 overflow-x:auto 容器裡（容器寬 326px），「價格」欄右緣在 443px，畫面寬 390px，所以第一屏看不到價格（table.py：priceVisible false）。
- 這不是「整頁爆版」：整頁沒橫向捲動。我們實測到的是「價格欄被擠出畫面」。標題與旁白都照這個講。
- 第一次修正 tests/02-fix.json：「價格欄被擠到畫面外，請修好，其他不要動」。結果表格設 min-width 500px、能左右滑；價格欄右緣 532px，畫面 390px，仍要滑才看到（priceVisible false）。
- 第二次修正 tests/03-fix2.json：「不要橫向滑動，手機寬度每個品項改成一張小卡片，電腦寬度維持表格」。結果手機寬度每品項一張卡，尺寸、熱量、價格都在畫面內（priceVisible true，wrapperScrollable false，整頁 scrollWidth 390）。
- 沒測：電腦寬度是否真的維持表格（只下了指令，沒截圖驗證）；圖片（外部網址，沙盒連不到，截圖是破圖，不當證據）。

## 數字／事實（3）
390 像素手機寬度／價格欄被擠出畫面（修一次仍要滑）／說清楚後價格直接看得到（實測 1 次、1 個網頁、1 個模型）。

## 不寫
「整頁爆版」（實測整頁沒橫向溢出）；「電腦版沒事」（沒測）；「一句話修好」（實測要兩句）；任何網頁／模型都會這樣（只試一個）。
