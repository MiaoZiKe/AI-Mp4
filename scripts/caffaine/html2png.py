"""把 HTML 檔轉成 PNG（Playwright／Chromium）。用法：python3 scripts/caffaine/html2png.py in.html out.png [寬 高] [縮放]
HTML 要自己用 @font-face 以外的系統字型（WenQuanYi 中文、IPAGothic 日文）；不讀外部網路。"""
import sys
from playwright.sync_api import sync_playwright
src, out = sys.argv[1], sys.argv[2]
w, h = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (540, 960)
z = float(sys.argv[5]) if len(sys.argv) > 5 else 1
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"]); pg = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=z)
    import os; pg.goto("file://" + os.path.abspath(src)); pg.wait_for_timeout(200); pg.screenshot(path=out); b.close()
print(out)
