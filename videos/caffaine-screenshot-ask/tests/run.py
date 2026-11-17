# 實測：同一張自製示意截圖，三種送法各問兩次（gemini-3-flash-preview，Gemini API 圖片輸入）。
# 依序送出（平行送會被 429 限流）；429 會自動等一下再重送。
import sys
sys.path.insert(0, "../../../scripts/caffaine")
from llm import gemini, tpart, fpart
Q = "這是我手機上的畫面，我看不懂。請告訴我它在說什麼、為什麼會這樣、我該怎麼辦，請一步一步說。"
M = "gemini-3-flash-preview"
for k, f in [("A-full", "screen.png"), ("B-small", "screen-small.png"), ("C-cropped", "screen-cropped.png")]:
    for r in (1, 2):
        x = gemini(f"{k}-run{r}.json", M, [fpart(f), tpart(Q)], retries=6); print(k, r, x["httpStatus"], x["modelVersion"], x["elapsedSec"])
