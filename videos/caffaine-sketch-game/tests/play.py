# 用 Playwright 真的打開 HTML 小遊戲、截圖、按鍵盤，檢查能不能玩。用法：python3 play.py <id>
import sys, os, re
from playwright.sync_api import sync_playwright
d = os.path.dirname(os.path.abspath(__file__)); i = sys.argv[1]
errs = []
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"])
    p = b.new_page(viewport={"width": 540, "height": 960})
    p.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
    p.on("console", lambda m: m.type == "error" and errs.append("console: " + m.text))
    p.goto("file://" + os.path.join(d, i + ".html")); p.wait_for_timeout(800)
    shot = lambda n: p.screenshot(path=os.path.join(d, f"{i}-{n}.png"))
    txt = lambda: re.sub(r"\s+", " ", p.evaluate("document.body.innerText"))[:200]
    shot("a-start"); print("開始畫面文字：", txt())
    p.mouse.click(270, 480); p.keyboard.press("Space"); p.keyboard.press("Enter"); p.wait_for_timeout(1500)
    shot("b-play1"); print("玩 1.5 秒後：", txt())
    p.keyboard.down("ArrowLeft"); p.wait_for_timeout(1500); p.keyboard.up("ArrowLeft"); shot("c-left")
    p.keyboard.down("ArrowRight"); p.wait_for_timeout(3000); p.keyboard.up("ArrowRight"); shot("d-right")
    p.wait_for_timeout(6000); shot("e-later"); print("再 6 秒後：", txt())
    print("錯誤：", " | ".join(errs) if errs else "無")
    b.close()
