# 用滑鼠按住左右掃動籃子，證明接得到星星、分數會增加（分數畫在 canvas 裡，用截圖看）。用法：python3 sweep.py <id>
import sys, os
from playwright.sync_api import sync_playwright
d = os.path.dirname(os.path.abspath(__file__)); i = sys.argv[1]
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"])
    p = b.new_page(viewport={"width": 540, "height": 960})
    p.goto("file://" + os.path.join(d, i + ".html")); p.wait_for_timeout(600)
    p.keyboard.press("Space"); p.wait_for_timeout(300)
    p.mouse.move(60, 700); p.mouse.down()
    for k in range(40):
        for x in (60, 120, 180, 240, 300, 360, 420, 480):
            p.mouse.move(x, 700); p.wait_for_timeout(25)
        if k == 6: p.screenshot(path=os.path.join(d, f"{i}-f-sweep.png"))
    p.mouse.up(); p.screenshot(path=os.path.join(d, f"{i}-g-sweepend.png")); b.close()
