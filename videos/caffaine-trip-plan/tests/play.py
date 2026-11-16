# 手機尺寸（390x844，觸控）操作行程頁：數項目、勾選、看計數、重新整理後勾選還在不在，並核對行程文字。用法：python3 play.py <id>
import sys, os, json, re
from playwright.sync_api import sync_playwright
d = os.path.dirname(os.path.abspath(__file__)); i = sys.argv[1]; out = {}
src = open(os.path.join(d, "itinerary.txt"), encoding="utf8").read()
n_src = len(re.findall(r"^\d{1,2}:\d{2} ", src, re.M)); out["草稿裡的行程數"] = n_src
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"])
    c = b.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    p = c.new_page(); errs = []; p.on("pageerror", lambda e: errs.append(str(e)))
    p.goto("file://" + os.path.join(d, i + ".html")); p.wait_for_timeout(500)
    out["頁面上的項目數"] = p.locator(".timeline-item").count(); out["一開始的計數"] = p.inner_text("#counter")
    p.screenshot(path=os.path.join(d, f"{i}-a-top.png"))
    out["時間文字"] = [t.strip() for t in p.locator(".timeline-item .time, .timeline-item [class*=time]").all_inner_texts()][:14]
    for k in (0, 1, 2): p.locator(".item-checkbox").nth(k).tap(); p.wait_for_timeout(150)
    out["勾 3 項後計數"] = p.inner_text("#counter"); p.screenshot(path=os.path.join(d, f"{i}-b-checked.png"))
    p.reload(); p.wait_for_timeout(500)
    out["重新整理後計數"] = p.inner_text("#counter"); out["重新整理後勾選數"] = p.locator(".item-checkbox:checked").count()
    p.screenshot(path=os.path.join(d, f"{i}-c-reload.png")); p.screenshot(path=os.path.join(d, f"{i}-d-full.png"), full_page=True)
    out["錯誤"] = errs; json.dump(out, open(os.path.join(d, f"{i}-result.json"), "w"), ensure_ascii=False, indent=1); print(json.dumps(out, ensure_ascii=False)); b.close()
