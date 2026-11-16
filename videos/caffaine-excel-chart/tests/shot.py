# 用 Playwright 開圖表網頁，載入過程連拍＋點切換鈕，證明會動。用法：python3 shot.py <id>
import sys, os, json
from playwright.sync_api import sync_playwright
d = os.path.dirname(os.path.abspath(__file__)); i = sys.argv[1]
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"])
    p = b.new_page(viewport={"width": 960, "height": 760}); errs = []
    p.on("pageerror", lambda e: errs.append(str(e))); p.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    p.goto("file://" + os.path.join(d, i + ".html"))
    for k, t in enumerate([60, 250, 500, 1500, 3500]):
        p.wait_for_timeout(t if k == 0 else t - [60, 250, 500, 1500, 3500][k - 1]); p.screenshot(path=os.path.join(d, f"{i}-a{k}.png"))
    btns = p.query_selector_all("button")
    print("按鈕", [x.inner_text() for x in btns])
    if len(btns) > 2:
        btns[2].click(); p.wait_for_timeout(120); p.screenshot(path=os.path.join(d, f"{i}-b0.png"))
        p.wait_for_timeout(1500); p.screenshot(path=os.path.join(d, f"{i}-b1.png"))
    print("錯誤：", errs or "無"); b.close()
