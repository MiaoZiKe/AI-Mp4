# 用 Playwright 把三份 HTML 各截一張首屏（1280x800）和整頁縮圖。
import os
from playwright.sync_api import sync_playwright
d = os.path.dirname(os.path.abspath(__file__))
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"])
    p = b.new_page(viewport={"width": 1280, "height": 800})
    for i in ["01-plain", "01b-plain-run2", "02-styled"]:
        p.goto("file://" + os.path.join(d, i + ".html")); p.wait_for_timeout(1500)
        p.screenshot(path=os.path.join(d, i + "-hero.png"))
        p.screenshot(path=os.path.join(d, i + "-full.png"), full_page=True)
        print(i, p.evaluate("document.documentElement.scrollHeight"))
    b.close()
