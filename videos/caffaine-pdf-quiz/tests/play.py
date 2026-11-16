# 實測作答：答對、答錯、同一題連點兩個選項，看分數怎麼算，並截圖。用法：python3 play.py <id> 
import sys, os, json
from playwright.sync_api import sync_playwright
d = os.path.dirname(os.path.abspath(__file__)); i = sys.argv[1]
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"])
    p = b.new_page(viewport={"width": 520, "height": 820}); errs = []
    p.on("pageerror", lambda e: errs.append(str(e)))
    p.goto("file://" + os.path.join(d, i + ".html")); p.wait_for_timeout(400)
    p.screenshot(path=os.path.join(d, f"{i}-q1.png"))
    opts = lambda: p.query_selector_all("#options-container button")
    log = []
    # Q1：先點錯的（第 1 個），再點對的（第 3 個，連點）
    opts()[0].click(); p.wait_for_timeout(200); p.screenshot(path=os.path.join(d, f"{i}-q1-wrong.png"))
    log.append("Q1 點錯：" + p.inner_text("#feedback"))
    try: opts()[2].click(timeout=800); log.append("Q1 之後還能再點選項")
    except Exception as e: log.append("Q1 之後不能再點（已鎖）")
    p.wait_for_timeout(200); log.append("Q1 連點後回饋：" + p.inner_text("#feedback"))
    answers = [None, 3, 1, 2]
    for k, a in enumerate(answers[1:], start=2):
        p.click("#next-btn"); p.wait_for_timeout(200)
        opts()[a].click(); p.wait_for_timeout(200)
        if k == 2: p.screenshot(path=os.path.join(d, f"{i}-q2-right.png"))
    p.click("#next-btn"); p.wait_for_timeout(200)
    opts()[3].click(); p.wait_for_timeout(200)
    p.click("#next-btn"); p.wait_for_timeout(300)
    log.append("最終：" + p.inner_text("#score-display"))
    p.screenshot(path=os.path.join(d, f"{i}-end.png"))
    print("\n".join(log)); print("錯誤：", errs or "無")
    open(os.path.join(d, i + "-play.txt"), "w").write("\n".join(log) + "\n（Q1 答錯、Q2–Q5 答對，期望 4/5）\n"); b.close()
