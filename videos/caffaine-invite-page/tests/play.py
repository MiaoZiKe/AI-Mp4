# 手機尺寸（390x844，觸控）操作邀請頁並截圖：倒數、點回覆、填名字送出、重新整理後名單還在不在。用法：python3 play.py <id>
import sys, os, json
from playwright.sync_api import sync_playwright
d = os.path.dirname(os.path.abspath(__file__)); i = sys.argv[1]; out = {}
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"])
    c = b.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    p = c.new_page(); errs = []; dl = []; p.on("pageerror", lambda e: errs.append(str(e))); p.on("dialog", lambda dg: (dl.append(dg.message), dg.accept()))
    p.goto("file://" + os.path.join(d, i + ".html")); p.wait_for_timeout(600)
    out["倒數文字"] = p.inner_text("#countdown"); out["頁面今天"] = p.evaluate("new Date().toString()")
    p.screenshot(path=os.path.join(d, f"{i}-a-top.png"))
    out["名單人數（還沒送出前）"] = p.inner_text("#guest-count")
    for n, (nm, sel) in enumerate([("阿凱", ".btn-yes"), ("阿美", ".btn-maybe"), ("小林", ".btn-no")]):
        p.tap(sel); p.wait_for_timeout(300); p.fill("#guest-name", nm)
        if n == 0: p.screenshot(path=os.path.join(d, f"{i}-b-form.png"))
        p.tap(".modal-btn"); p.wait_for_timeout(400)
    out["名單人數"] = p.inner_text("#guest-count"); p.locator("#guest-tags").scroll_into_view_if_needed(); p.screenshot(path=os.path.join(d, f"{i}-c-list.png"))
    p.reload(); p.wait_for_timeout(500); out["重新整理後名單人數"] = p.inner_text("#guest-count")
    p.screenshot(path=os.path.join(d, f"{i}-d-reload.png")); out["錯誤"] = errs; out["跳出視窗"] = dl
    json.dump(out, open(os.path.join(d, f"{i}-result.json"), "w"), ensure_ascii=False, indent=1); print(json.dumps(out, ensure_ascii=False)); b.close()
