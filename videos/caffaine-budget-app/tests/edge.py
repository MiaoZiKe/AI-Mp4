# 邊界測試：空白金額、負數、小數、刪除。用法：python3 edge.py <id>
import sys, os, json
from playwright.sync_api import sync_playwright
d = os.path.dirname(os.path.abspath(__file__)); i = sys.argv[1]; out = {}
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"])
    c = b.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    p = c.new_page(); dialogs = []; p.on("dialog", lambda dg: (dialogs.append(dg.message), dg.accept()))
    p.goto("file://" + os.path.join(d, i + ".html")); p.wait_for_timeout(400)
    def add(amt, note=""):
        p.fill("#amountInput", amt); p.fill("#noteInput", note); p.tap("#addBtn"); p.wait_for_timeout(200)
        return p.inner_text("#totalAmount"), p.locator("#recordList .delete-btn").count()
    out["空白金額"] = add("")
    out["負數 -50"] = add("-50", "負數")
    out["小數 12.5"] = add("12.5", "小數")
    out["很大 99999999999"] = add("99999999999", "很大")
    p.screenshot(path=os.path.join(d, f"{i}-e-edge.png"))
    p.tap("#recordList .delete-btn"); p.wait_for_timeout(200)
    out["點一下刪之後"] = (p.inner_text("#totalAmount"), p.locator("#recordList .delete-btn").count())
    out["跳出的視窗"] = dialogs
    json.dump(out, open(os.path.join(d, f"{i}-edge.json"), "w"), ensure_ascii=False, indent=1); print(json.dumps(out, ensure_ascii=False)); b.close()
