# 用 Playwright 量三份 HTML（1280x800）的共同點，結果印出並存 compare.txt。
import os
from playwright.sync_api import sync_playwright
d = os.path.dirname(os.path.abspath(__file__))
js = """()=>{const q=s=>[...document.querySelectorAll(s)];const h1=document.querySelector('h1');const hs=getComputedStyle(h1);
const g=q('*').filter(e=>{const c=getComputedStyle(e).gridTemplateColumns;return c&&c.split(' ').length>=3&&e.children.length>=3&&!/footer|info/.test(e.className)}).map(e=>e.className+':'+getComputedStyle(e).gridTemplateColumns.split(' ').length+'欄x'+e.children.length);
const hdr=q('header a,header button,a[class*=btn],button').map(e=>e.innerText.trim()+'['+getComputedStyle(e).borderRadius+','+getComputedStyle(e).backgroundColor+']').filter(x=>x.length>6).slice(0,5);
return {背景:getComputedStyle(document.body).backgroundColor,字色:getComputedStyle(document.body).color,主標:h1.innerText.replace(/\\s+/g,' '),主標對齊:hs.textAlign,主標字級:hs.fontSize,
 區塊標題:q('h2').map(e=>e.innerText.replace(/\\s+/g,' ').slice(0,12)),三欄區塊:g,按鈕:hdr,漸層數:document.documentElement.outerHTML.split('gradient').length-1,頁面高度:document.documentElement.scrollHeight}}"""
out = []
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", args=["--no-sandbox"])
    p = b.new_page(viewport={"width": 1280, "height": 800})
    for i in ["01-plain", "01b-plain-run2", "02-styled"]:
        p.goto("file://" + os.path.join(d, i + ".html")); p.wait_for_timeout(800)
        out.append(i + "\n" + "\n".join(f"  {k}：{v}" for k, v in p.evaluate(js).items()))
    b.close()
open(os.path.join(d, "compare.txt"), "w").write("\n\n".join(out)); print("\n\n".join(out))
