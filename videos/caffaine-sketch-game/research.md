# caffaine-sketch-game 查證（2026/11/16）

## 實測做法（原文在 tests/，不改字）
- 草圖：`tests/make-sketch.py` 用程式畫的手繪風線稿（抖動線條、固定 seed），tests/sketch.png（720x1080）。**不是人手畫的**，片中旁白與畫面都明講「用程式畫的手繪風」。
- 工具：Gemini API（能看圖），請求模型 gemini-3.5-flash（modelVersion gemini-3.6-flash）。gemini-3.8-flash 連線卡住沒回，改用 3.5。
- 第一次 tests/01-first.json（2026-11-16 15:55 台北，回應 34.1 秒）：附 sketch.png＋「這是我手繪的一張遊戲草圖。請照這張圖做成一個可以玩的小遊戲，只輸出一個完整的單檔 HTML……」（注意：我的提示詞寫「我手繪的」，實際是程式畫的；片中不用這句話）。輸出 tests/01-first.html（506 行）。
- Playwright（tests/play.py、phone.py、sweep.py，無頭 Chromium）：開啟、按空白鍵開始、鍵盤左右移動；手機尺寸 390x844 觸控也能開始並移動。第一版沒有 JS 錯誤，鍵盤操作後分數 1、漏接 3 後出現「遊戲結束」。
- 翻車（實測看到）：結束畫面上，掉落的星星（半透明）疊在「點擊或按空白鍵重新開始」的字後面（tests/01-first-e-later.png）；星星剛出現時，細線也會碰到左上角分數框（01-first-b-play1.png、01-first-phone.png）。不是壞掉，是小毛病，片中講「小毛病」。
- 修正 tests/02-fix.json（16:01，46.5 秒）：多輪對話，把第一版回答帶回去，說「結束畫面星星畫在文字後面蓋住了『重新開始』的字、星星一出現會壓到分數框，請修好這兩點，其他不要動」。tests/02-fix.html（501 行）。
- 驗證修好：02-fix-e-later.png 結束畫面星星在方框上方、字清楚；sweep.py 用滑鼠按住左右掃 12 秒（02-fix-g-sweepend.png）分數 6、漏接 0/3。只試 1 次。
## 數字／事實（4）
回應約 34 秒（<1 分鐘）／第一版能玩（鍵盤接到 1 顆）／翻車一個小毛病（星星疊字）／修好後掃動接到 6 顆（實測 1 次）。
## 不寫
- 「十分鐘」「一次就完美」「任何草圖都行」（只試了這一張、這一個模型）；人手繪草圖的辨識效果（沒測）；遊戲好不好玩。
## 影片素材
public/caffaine-sketch-game/ 內為 tests 截圖的縮圖／加註（bug.png 圈起處為後加標示），由 tests/make-display.py 產生，畫面內容不改。
