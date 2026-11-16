"""ETMall 東森購物網：開首頁、在搜尋框輸入關鍵字按 Enter（一般使用者的做法，1 次搜尋），取畫面文字。用法：python3 fetch_etmall.py "<關鍵字>" <輸出前綴>"""
import json, sys, time, datetime
from playwright.sync_api import sync_playwright
EXE = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"
kw, out = sys.argv[1], sys.argv[2]
t0 = time.time(); got = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE); pg = b.new_page(locale="zh-TW", viewport={"width": 1280, "height": 2400})
    pg.goto("https://www.etmall.com.tw/", wait_until="load", timeout=60000); pg.wait_for_timeout(4000)
    pg.fill("input[type=search]", kw); pg.keyboard.press("Enter"); pg.wait_for_timeout(9000)
    got["url"] = pg.url; got["title"] = pg.title(); got["text"] = pg.inner_text("body")[:8000]
    pg.screenshot(path=out + ".png"); open(out + ".html", "w").write(pg.content())
    b.close()
got["elapsedSec"] = round(time.time() - t0, 1); got["fetchedAtTaipei"] = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).isoformat(timespec="seconds")
json.dump(got, open(out + ".json", "w"), ensure_ascii=False, indent=1)
print(got["elapsedSec"], got["url"], got["title"]); print(got["text"][:1500])
