# 手機 390 寬，捲到價目表，截圖（量價格欄是否在畫面內）。用法：python3 table.py <id>
import sys, os, json
from playwright.sync_api import sync_playwright
d = os.path.dirname(os.path.abspath(__file__)); i = sys.argv[1]
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"])
    c = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    p = c.new_page(); p.goto("file://" + os.path.join(d, i + ".html")); p.wait_for_timeout(600)
    r = p.evaluate("""() => { const t = document.querySelector('table'); t.scrollIntoView({block:'start'}); window.scrollBy(0,-90);
      const th = [...t.querySelectorAll('th')].pop(); const rc = th.getBoundingClientRect(); const w = t.parentElement;
      return {priceHeaderRight: Math.round(rc.right), priceHeaderLeft: Math.round(rc.left), viewport: innerWidth, wrapperScrollable: w.scrollWidth > w.clientWidth, wrapperClient: w.clientWidth, wrapperScroll: w.scrollWidth, priceVisible: rc.right <= innerWidth + 1}; }""")
    print(json.dumps(r, ensure_ascii=False)); json.dump(r, open(os.path.join(d, i + "-table.json"), "w"), ensure_ascii=False)
    p.wait_for_timeout(300); p.screenshot(path=os.path.join(d, i + "-table.png")); b.close()
