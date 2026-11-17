# 影片用圖 cardC：AI 老師回覆（節錄）。每一句都是 tests/step3-run2.json replyText 的原文片段，標「節錄」。
import json, subprocess
from PIL import Image
t = json.load(open("tests/step3-run2.json"))["replyText"]
parts = ["你只答對了一半喔！", "如果像你說的「銀行每年固定給你一筆利息」，那是單利。", "複利是把你每年賺到的利息，**加進原本的錢裡面**", "第二年我要用多少錢去計算 10% 的利息？"]
for x in parts: assert x in t, x
css = """body{margin:0;width:400px;height:720px;background:#fff;font-family:"WenQuanYi Zen Hei",sans-serif;color:#1c2233;position:relative}
h3{position:absolute;left:18px;top:14px;margin:0;font-size:27px;color:#4B5675}
.b{position:absolute;left:12px;width:376px;border-radius:16px;padding:10px 14px;box-sizing:border-box;font-size:29px;font-weight:900;line-height:1.32}
.n{background:#F1F2F6;color:#3b4258}.bad{background:#FDE8E4;color:#B3321C}.ok{background:#E3F6EE;color:#14795F}.q{background:#FFF2C6;color:#7a5a00}"""
blocks = [(60, "n", "你只答對了一半喔！", 70), (140, "bad", "如果像你說的「銀行每年固定給你一筆利息」，那是單利。", 150), (306, "ok", "複利是把你每年賺到的利息，加進原本的錢裡面⋯", 150), (470, "q", "第二年我要用多少錢去計算 10% 的利息？", 150)]
h = "".join(f"<div class='b {c}' style='top:{y}px;height:{hh}px'>{s}</div>" for y, c, s, hh in blocks)
open("tests/cardC.html", "w").write(f"<!doctype html><meta charset=utf-8><style>{css}</style><h3>AI 老師的回覆（節錄）</h3>{h}")
subprocess.run(["python3", "../../scripts/caffaine/html2png.py", "tests/cardC.html", "../../public/caffaine-feynman/cardC.png", "400", "720", "2"], check=True)
Image.open("../../public/caffaine-feynman/cardC.png").crop((16, 270, 784, 718)).resize((960, 560), Image.LANCZOS).save("../../public/caffaine-feynman/cardC-zoom.png")
# 概念對照卡（示意，非實測資料）
css2 = """body{margin:0;width:640px;height:300px;font-family:"WenQuanYi Zen Hei",sans-serif;position:relative}
.t{position:absolute;left:30px;top:28px;font-size:46px;font-weight:900}.s{position:absolute;left:30px;top:120px;font-size:38px;font-weight:700;line-height:1.35;width:580px}"""
for tag, bg, fg, t, s in [("cardD", "#F1F2F6", "#3b4258", "只看 AI 講", "每一句都點頭，<br>覺得自己懂了"), ("cardE", "#FFF2C6", "#7a5a00", "自己講一遍", "一卡住，就知道<br>哪裡還沒懂")]:
    open(f"tests/{tag}.html", "w").write(f"<!doctype html><meta charset=utf-8><style>{css2}body{{background:{bg};color:{fg}}}</style><div class=t>{t}</div><div class=s>{s}</div>")
    subprocess.run(["python3", "../../scripts/caffaine/html2png.py", f"tests/{tag}.html", f"../../public/caffaine-feynman/{tag}.png", "640", "300", "2"], check=True)
