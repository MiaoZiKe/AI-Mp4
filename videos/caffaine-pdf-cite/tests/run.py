import sys, json, os
sys.path.insert(0, "../../../scripts/caffaine")
from llm import gemini, tpart, fpart
M = "gemini-3-flash-preview"
A = "這是一份圖書館借閱須知。我想借書，請告訴我：一次能借幾本、借多久、逾期怎麼罰、書遺失要怎麼辦，還有館內能不能影印？"
B = A + "\n\n請只根據文件原文回答，每一句話後面用括號標上頁碼，例如（第 2 頁）。文件裡沒寫的，直接寫「文件沒寫」，不要自己補充。"
for n, q in [("A-free-run1", A), ("A-free-run2", A), ("B-cite-run1", B), ("B-cite-run2", B)]:
    if os.path.exists(n + ".json") and json.load(open(n + ".json")).get("httpStatus") == 200: print(n, "已有成功紀錄，略過"); continue
    r = gemini(n + ".json", M, [fpart("handout.pdf"), tpart(q)], retries=6); print(n, r["httpStatus"], r["modelVersion"], r["elapsedSec"], len(r["replyText"]))
