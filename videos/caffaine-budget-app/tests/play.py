# 手機尺寸（390x844，觸控）實際操作記帳小工具並截圖。用法：python3 play.py <id>
import sys, os, json
from playwright.sync_api import sync_playwright
d = os.path.dirname(os.path.abspath(__file__)); i = sys.argv[1]
rows = [("85", "餐飲", "早餐"), ("30", "交通", "捷運"), ("260", "娛樂", "電影"), ("120", "餐飲", "午餐")]
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"])
    c = b.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    p = c.new_page(); errs = []; p.on("pageerror", lambda e: errs.append(str(e)))
    p.goto("file://" + os.path.join(d, i + ".html")); p.wait_for_timeout(500)
    p.screenshot(path=os.path.join(d, f"{i}-a-empty.png"))
    for n, (amt, cat, note) in enumerate(rows):
        p.fill("#amountInput", amt); p.tap(f'.cat-btn[data-category="{cat}"]'); p.fill("#noteInput", note)
        if n == 1: p.screenshot(path=os.path.join(d, f"{i}-b-filling.png"))
        p.tap("#addBtn"); p.wait_for_timeout(200)
    p.screenshot(path=os.path.join(d, f"{i}-c-after.png"))
    p.screenshot(path=os.path.join(d, f"{i}-c-after-full.png"), full_page=True)
    total = p.inner_text("#totalAmount"); sums = {k: p.inner_text("#" + k) for k in ["sumFood", "sumTransport", "sumEntertainment", "sumOther"]}
    p.reload(); p.wait_for_timeout(500)
    total2 = p.inner_text("#totalAmount"); p.screenshot(path=os.path.join(d, f"{i}-d-reload.png"))
    n_rec = p.locator("#recordList > *").count()
    res = {"expected_total": sum(int(r[0]) for r in rows), "total": total, "sums": sums, "total_after_reload": total2, "record_items_after_reload": n_rec, "errors": errs}
    json.dump(res, open(os.path.join(d, f"{i}-result.json"), "w"), ensure_ascii=False, indent=1); print(res); b.close()
