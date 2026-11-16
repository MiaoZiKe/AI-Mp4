# 用 Playwright 開 390 寬量測並截圖。用法：python3 shot.py <id>
import sys, os, json
from playwright.sync_api import sync_playwright
d = os.path.dirname(os.path.abspath(__file__)); i = sys.argv[1]
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"])
    c = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    p = c.new_page(); p.goto("file://" + os.path.join(d, i + ".html")); p.wait_for_timeout(800)
    m = p.evaluate("""() => { const W = innerWidth; const sw = document.documentElement.scrollWidth;
      const wide = [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > W + 1).slice(0, 8).map(e => ({tag: e.tagName, cls: e.className, text: (e.innerText||'').slice(0,20), right: Math.round(e.getBoundingClientRect().right)}));
      const small = [...document.querySelectorAll('body *')].filter(e => e.children.length===0 && (e.innerText||'').trim() && parseFloat(getComputedStyle(e).fontSize) < 12).length;
      return {innerWidth: W, scrollWidth: sw, overflowX: sw > W, wide, small, meta: !!document.querySelector('meta[name=viewport]')}; }""")
    print(json.dumps(m, ensure_ascii=False))
    p.screenshot(path=os.path.join(d, i + "-m-top.png"))
    p.screenshot(path=os.path.join(d, i + "-m-full.png"), full_page=True)
    json.dump(m, open(os.path.join(d, i + "-m.json"), "w"), ensure_ascii=False, indent=1)
    b.close()
