# 第三題（G3）在 LibreOffice 算出 0：把這個結果告訴它，請它修，再驗算一次。
import sys, json, re, subprocess, os, openpyxl
sys.path.insert(0, "../../../scripts/caffaine")
from llm import gemini, tpart
M = sys.argv[1] if len(sys.argv) > 1 else "gemini-3.5-flash-lite"
first = json.load(open("result.json"))["G3"]
q = f"你剛剛給我放在 G3 的公式是：\n{first['formula']}\n\n我貼進去算出來是 0，但 10 月明明有資料，不該是 0。請修正，一樣只要一行、開頭是 =，不要其他文字，也不要用 365 才有的新函數。"
r = gemini("fix-G3.json", M, [tpart(q)], retries=6); m = re.search(r"=[^\n`]+", r["replyText"]); f = m.group(0).strip(); print(r["elapsedSec"], f)
wb = openpyxl.load_workbook("data.xlsx"); ws = wb["明細"]; ws["G3"] = f; wb.save("check-fix.xlsx")
subprocess.run(["soffice", "--headless", "--convert-to", "xlsx", "--outdir", "lo", "check-fix.xlsx"], check=True, capture_output=True, timeout=180)
v = openpyxl.load_workbook("lo/check-fix.xlsx", data_only=True)["明細"]["G3"].value
res = {"seconds": r["elapsedSec"], "formula": f, "libreoffice_value": v, "expected": 75301, "correct": v == 75301, "model": r["modelVersion"]}
json.dump(res, open("result-fix.json", "w"), ensure_ascii=False, indent=1); print(res)
