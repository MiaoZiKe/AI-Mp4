import sys
sys.path.insert(0, "../../../scripts/caffaine")
from llm import gemini, tpart, fpart
M = sys.argv[1] if len(sys.argv) > 1 else "gemini-3.5-flash-lite"
A = "幫我翻譯這張菜單。"
B = "這是日本餐廳的菜單。請翻成繁體中文，每道菜用一句話說明它是什麼、主要食材和做法；菜單上標了過敏原的要照抄標出來；價格照原樣寫日圓；看不確定的就寫「不確定」。"
for n, q in [("A-translate-run1", A), ("A-translate-run2", A), ("B-explain-run1", B), ("B-explain-run2", B)]:
    r = gemini(n + ".json", M, [fpart("menu.png"), tpart(q)], retries=6); print(n, r["httpStatus"], r["modelVersion"], r["elapsedSec"], len(r["replyText"]))
