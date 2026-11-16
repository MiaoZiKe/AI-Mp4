# caffaine-trip-plan 查證（2026/11/17）

主旨（一句）：把亂排的行程草稿貼給 AI，做成一頁手機能點、能勾選的行程表；開頭的總數寫錯叫它改。

## 實測做法（原文在 tests/，不改字）
- 工具：Gemini API（沒有開搜尋與程式執行），模型 **gemini-3.5-flash-lite**。原因：慣用的 gemini-3.5-flash（modelVersion gemini-3.6-flash）當天免費額度（20 次／天）已用完，回 429；改用同樣能用的 flash-lite，三支都用同一個模型。畫面與念稿一律標「Gemini 實測」，不講成 3.6 flash。
- 流程：tests/01-first.json（2026-11-17，Gemini API；提示詞前面附 tests/itinerary.txt 虛構草稿 11 行）→ tests/play.py（Playwright 手機 390×844 觸控，勾 3 項、重新整理）→ 翻車 → tests/02-fix.json（多輪）→ play.py 驗證。
- 瀏覽器：Playwright 無頭 Chromium，視窗 390×844、觸控、`is_mobile`。

## 數字／事實
1. 草稿 11 行（台南兩天一夜，虛構、標情境示意）；頁面做出 12 個項目（把「10:15 到台南站、轉計程車寄行李」拆成獨立一項）
2. 分兩天、時間軸、每項有時間／地點／怎麼去；勾 3 項計數變 3，重新整理後仍勾 3 項（tests/01-first-result.json）
3. 翻車（實測）：一打開頂端寫「已完成 0 / 11 項」，勾一下就變「/ 12 項」，總數對不上
4. 修好（1 次）：一打開「0 / 12」、勾三項「3 / 12」、重新整理仍「3 / 12」（tests/02-fix-result.json）

## 還不知道（片中要講）
- 只用 1 份虛構草稿、1 個模型；真的出門時好不好用沒測。

## 不寫
- 「任何人都能一次做到完美」「所有模型都這樣」「很安全」（只測了這個模型、這一份需求）；不給投資或其他建議；沒有真人與真實商標（人名、店名皆虛構）。

## 影片素材
public/caffaine-trip-plan/ 內為 tests 截圖與放大圖（由 scripts/caffaine/make-three-display.py 產生，只縮放與畫圈，畫面內容不改）。念稿與畫面都由 scripts/caffaine/make-three-scripts.py 產生 script.json。
