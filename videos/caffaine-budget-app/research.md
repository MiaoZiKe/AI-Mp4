# caffaine-budget-app 查證（2026/11/17）

主旨（一句）：一句話交代需求，AI 就做出手機能用的記帳網頁；點「刪」會直接刪是個小毛病，叫它先確認就好。

## 實測做法（原文在 tests/，不改字）
- 工具：Gemini API（沒有開搜尋與程式執行），模型 **gemini-3.5-flash-lite**。原因：慣用的 gemini-3.5-flash（modelVersion gemini-3.6-flash）當天免費額度（20 次／天）已用完，回 429；改用同樣能用的 flash-lite，三支都用同一個模型。畫面與念稿一律標「Gemini 實測」，不講成 3.6 flash。
- 流程：tests/01-first.json（2026-11-17 台北，Gemini API 單檔 HTML）→ tests/play.py、edge.py（Playwright 手機 390×844 觸控）→ 翻車 → tests/02-fix.json（多輪：把第一版帶回去，只說「刪除前先確認，其他不要動」）→ tests/del.py 驗證。
- 瀏覽器：Playwright 無頭 Chromium，視窗 390×844、觸控、`is_mobile`。

## 數字／事實
1. 能用：連記 4 筆（85、30、260、120），本月總計 495、分類合計餐飲 205／交通 30／娛樂 260／其他 0，畫面與預期一致（tests/01-first-result.json）
2. 重新整理後 4 筆都在（資料存在瀏覽器 localStorage）
3. 邊界：空白金額、負數會跳「請輸入正確金額」；小數與很大的數可以記（tests/01-first-edge.json）
4. 翻車（實測）：點一下「刪」沒有任何視窗，紀錄立刻消失（tests/01-first-del.json）
5. 修好（1 次）：取消後兩筆都在（345→345）、確定後剩一筆（345→85），視窗文字「確定要刪除這筆紀錄嗎？」（tests/02-fix-del.json）；其他功能重測仍正常（02-fix-result.json）

## 還不知道（片中要講）
- 只試 1 個模型、1 種工具；別的需求（匯出、圖表、多人）沒測。

## 不寫
- 「任何人都能一次做到完美」「所有模型都這樣」「很安全」（只測了這個模型、這一份需求）；不給投資或其他建議；沒有真人與真實商標（人名、店名皆虛構）。

## 影片素材
public/caffaine-budget-app/ 內為 tests 截圖與放大圖（由 scripts/caffaine/make-three-display.py 產生，只縮放與畫圈，畫面內容不改）。念稿與畫面都由 scripts/caffaine/make-three-scripts.py 產生 script.json。
