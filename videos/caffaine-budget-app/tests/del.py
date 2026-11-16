# 刪除測試：第一次按刪除有沒有確認、按取消會不會保留、按確定才刪。用法：python3 del.py <id>
import sys, os, json
from playwright.sync_api import sync_playwright
d = os.path.dirname(os.path.abspath(__file__)); i = sys.argv[1]; out = {}
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"])
    c = b.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    p = c.new_page(); log = []; mode = {"accept": False}
    p.on("dialog", lambda dg: (log.append(dg.message), dg.accept() if mode["accept"] else dg.dismiss()))
    p.goto("file://" + os.path.join(d, i + ".html")); p.wait_for_timeout(400)
    for amt, cat, note in [("85", "餐飲", "早餐"), ("260", "娛樂", "電影")]:
        p.fill("#amountInput", amt); p.tap(f'.cat-btn[data-category="{cat}"]'); p.fill("#noteInput", note); p.tap("#addBtn"); p.wait_for_timeout(200)
    out["新增兩筆後"] = (p.inner_text("#totalAmount"), p.locator("#recordList .delete-btn").count())
    p.tap("#recordList .delete-btn"); p.wait_for_timeout(300)
    out["按刪除（取消）後"] = (p.inner_text("#totalAmount"), p.locator("#recordList .delete-btn").count())
    p.screenshot(path=os.path.join(d, f"{i}-f-delete.png"))
    mode["accept"] = True; p.tap("#recordList .delete-btn"); p.wait_for_timeout(300)
    out["按刪除（確定）後"] = (p.inner_text("#totalAmount"), p.locator("#recordList .delete-btn").count()); out["跳出的視窗"] = log
    json.dump(out, open(os.path.join(d, f"{i}-del.json"), "w"), ensure_ascii=False, indent=1); print(json.dumps(out, ensure_ascii=False)); b.close()
