# 三題 Excel 公式：各問 gemini-3-flash-preview 一次（計時＝從送出到收到回答），再用 LibreOffice 真的算一遍，對 Python 直接算出的標準答案。
import sys, json, re, subprocess, shutil, os, openpyxl
sys.path.insert(0, "../../../scripts/caffaine")
from llm import gemini, tpart
M = sys.argv[1] if len(sys.argv) > 1 else "gemini-3.5-flash-lite"
LAY = "我的 Excel 資料在工作表「明細」的 A1:E21，第 1 列是標題，第 2 到 21 列是 20 筆資料：A 欄日期（真正的日期格式）、B 欄業務、C 欄區域（北／中／南）、D 欄品項、E 欄金額。\n請給我可以直接貼進指定儲存格的 Excel 公式，只要一行、開頭是 =，不要其他文字。不要用 Excel 365 才有的 UNIQUE、FILTER、XLOOKUP、LET 這類新函數，也不要用要按 Ctrl+Shift+Enter 的陣列公式。"
tasks = {"G2": "請寫放在 G2 的公式：區域是「北」而且金額大於 5000 的那些訂單，金額加總。",
         "G3": "請寫放在 G3 的公式：2026 年 10 月的金額加總（用日期欄判斷）。",
         "G4": "請寫放在 G4 的公式：總共有幾位不同的業務（名字重複只算一位）。"}
res = {}
for cell, t in tasks.items():
    r = gemini(f"ask-{cell}.json", M, [tpart(LAY + "\n\n" + t)], retries=6)
    m = re.search(r"=[^\n`]+", r["replyText"]); res[cell] = {"seconds": r["elapsedSec"], "formula": m.group(0).strip() if m else None, "raw": r["replyText"].strip(), "model": r["modelVersion"]}
    print(cell, r["elapsedSec"], res[cell]["formula"], flush=True)
wb = openpyxl.load_workbook("data.xlsx"); ws = wb["明細"]
for cell, d in res.items(): ws[cell] = d["formula"]
wb.save("check.xlsx")
os.makedirs("lo", exist_ok=True)
subprocess.run(["soffice", "--headless", "--convert-to", "xlsx", "--outdir", "lo", "check.xlsx"], check=True, capture_output=True, timeout=180)
v = openpyxl.load_workbook("lo/check.xlsx", data_only=True)["明細"]; exp = json.load(open("expected.json"))
for cell in res: res[cell]["libreoffice_value"] = v[cell].value; res[cell]["expected"] = exp[cell]; res[cell]["correct"] = (v[cell].value == exp[cell])
res["_total_seconds"] = round(sum(d["seconds"] for k, d in res.items() if k != "_total_seconds"), 2)
json.dump(res, open("result.json", "w"), ensure_ascii=False, indent=1); print(json.dumps({k: (d if k == "_total_seconds" else [d["formula"], d["libreoffice_value"], d["expected"], d["correct"]]) for k, d in res.items()}, ensure_ascii=False))
