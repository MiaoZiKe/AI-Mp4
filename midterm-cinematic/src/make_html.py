"""Single self-contained HTML player. Embeds the MP4 as base64 when the result
stays under ~60 MB; otherwise references midterm-cinematic.mp4 in the same folder."""
import base64, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "output")
mp4 = os.path.join(OUT, "midterm-cinematic.mp4")
tl = json.load(open(os.path.join(ROOT, "timeline.json"), encoding="utf-8"))
size = os.path.getsize(mp4)
if size * 4 / 3 < 60e6:
    src = "data:video/mp4;base64," + base64.b64encode(open(mp4, "rb").read()).decode()
    mode = "embedded (base64)"
else:
    src = "midterm-cinematic.mp4"
    mode = "linked (same folder)"

html = f"""<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>選後的世界</title>
<style>
  :root {{ --bg:#0d0c22; --ink:#f4eedf; --muted:#b9b2e6; --gold:#f2c46b; }}
  @media (prefers-color-scheme: light) {{ :root:not([data-theme="dark"]) {{ --bg:#0d0c22; }} }}
  * {{ box-sizing:border-box; }}
  html,body {{ margin:0; background:var(--bg); color:var(--ink); font-family:"Noto Serif TC","Songti TC",serif; }}
  main {{ max-width:1280px; margin:0 auto; padding:24px 16px 40px; }}
  .frame {{ position:relative; width:100%; aspect-ratio:1920/804; background:#000; border-radius:10px; overflow:hidden;
           box-shadow:0 20px 60px rgba(0,0,0,.55), 0 0 0 1px rgba(185,178,230,.15); }}
  video {{ width:100%; height:100%; display:block; }}
  h1 {{ font-size:clamp(20px,3vw,30px); margin:18px 0 4px; letter-spacing:.06em; }}
  p {{ color:var(--muted); line-height:1.7; margin:6px 0; font-size:15px; }}
  .brand {{ color:var(--gold); letter-spacing:.08em; }}
</style>
</head>
<body>
<main>
  <div class="frame"><video src="{src}" controls playsinline preload="auto"></video></div>
  <h1>美國期中選舉：選後的世界會怎麼走？</h1>
  <p class="brand">{tl['brand']} {tl['handle']}</p>
  <p>66 秒程序化資料短片：畫面與音樂都由 Python 程式逐格繪製、合成，沒有使用 AI 生圖或影片模型。資料截至 {tl['data_date']}，僅供參考，不構成投資建議。</p>
</main>
</body>
</html>
"""
open(os.path.join(OUT, "midterm-cinematic.html"), "w", encoding="utf-8").write(html)
print("html", mode, round(os.path.getsize(os.path.join(OUT, "midterm-cinematic.html")) / 1e6, 1), "MB")
