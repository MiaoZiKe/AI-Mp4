# 手機 390 寬，只截價目表那一區（不含固定的頂端選單）。用法：python3 sect.py <id>
import sys, os
from playwright.sync_api import sync_playwright
d = os.path.dirname(os.path.abspath(__file__)); i = sys.argv[1]
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"])
    c = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    p = c.new_page(); p.goto("file://" + os.path.join(d, i + ".html")); p.wait_for_timeout(600)
    h = p.evaluate_handle("document.querySelector('table').closest('section') || document.querySelector('table').parentElement")
    h.as_element().screenshot(path=os.path.join(d, i + "-sect.png")); b.close()
