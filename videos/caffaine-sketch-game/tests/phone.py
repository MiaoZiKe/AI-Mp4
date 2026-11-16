# 手機尺寸（390x844，觸控）打開小遊戲，點畫面開始、點右側移動，截圖。用法：python3 phone.py <id>
import sys, os
from playwright.sync_api import sync_playwright
d = os.path.dirname(os.path.abspath(__file__)); i = sys.argv[1]
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"])
    c = b.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    p = c.new_page(); errs = []; p.on("pageerror", lambda e: errs.append(str(e)))
    p.goto("file://" + os.path.join(d, i + ".html")); p.wait_for_timeout(600)
    p.touchscreen.tap(195, 400); p.wait_for_timeout(1200)
    p.touchscreen.tap(330, 700); p.wait_for_timeout(1500)
    p.screenshot(path=os.path.join(d, f"{i}-phone.png"))
    print("錯誤：", errs or "無"); b.close()
