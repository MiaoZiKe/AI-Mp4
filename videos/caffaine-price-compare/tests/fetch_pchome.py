"""PChome 24h 搜尋頁（一般瀏覽器讀取；1 次搜尋、只取前 10 筆畫面上看得到的商品名與價格）。用法：python3 fetch_pchome.py "<關鍵字>" <輸出前綴>"""
import json, sys, time, datetime
from urllib.parse import quote
from playwright.sync_api import sync_playwright
EXE = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"
kw, out = sys.argv[1], sys.argv[2]
t0 = time.time(); got = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE); pg = b.new_page(locale="zh-TW", viewport={"width": 1280, "height": 2400})
    pg.goto(f"https://24h.pchome.com.tw/search/?q={quote(kw)}", wait_until="load", timeout=60000)
    pg.wait_for_timeout(8000)
    got["url"] = pg.url; got["title"] = pg.title()
    got["text"] = pg.inner_text("body")[:6000]
    pg.screenshot(path=out + ".png")
    open(out + ".html", "w").write(pg.content())
    b.close()
got["elapsedSec"] = round(time.time() - t0, 1); got["fetchedAtTaipei"] = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).isoformat(timespec="seconds")
json.dump(got, open(out + ".json", "w"), ensure_ascii=False, indent=1)
print(got["elapsedSec"], got["title"]); print(got["text"][:1500])
