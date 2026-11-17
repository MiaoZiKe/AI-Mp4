# 影片用圖（public/caffaine-ask-first/）：把回答整理成 5 條事實表的對照卡；文字取自 tests/A-run1.json、B-run2.json，整理過、標「整理」
import subprocess
css = """body{margin:0;width:400px;height:720px;background:#fff;font-family:"WenQuanYi Zen Hei",sans-serif;color:#1c2233;position:relative}
h3{position:absolute;left:18px;top:14px;margin:0;font-size:25px;color:#4B5675}
.r{position:absolute;left:12px;width:376px;height:100px;border-radius:14px;display:flex;align-items:center;padding:0 12px;box-sizing:border-box;font-size:31px;font-weight:900;white-space:nowrap}
.ok{background:#E3F6EE;color:#14795F}.bad{background:#FDE8E4;color:#B3321C}.no{background:#F1F2F6;color:#6a7185}
.sc{position:absolute;left:0;width:100%;top:640px;text-align:center;font-size:56px;font-weight:900}"""
def card(tag, title, rows, score, color):
    h = "".join(f"<div class='r {c}' style='top:{66 + i * 112}px'>{t}</div>" for i, (t, c) in enumerate(rows))
    open(f"tests/{tag}.html", "w").write(f"<!doctype html><meta charset=utf-8><style>{css}</style><h3>{title}</h3>{h}<div class=sc style='color:{color}'>{score} / 5</div>")
    subprocess.run(["python3", "../../scripts/caffaine/html2png.py", f"tests/{tag}.html", f"../../public/caffaine-ask-first/{tag}.png", "400", "720", "2"], check=True)
card("cardA", "A 直接做（第 1 次，整理）", [("人數 10-15 人（猜）", "bad"), ("預算 $1,200-1,500（猜）", "bad"), ("週三或週四（猜）", "bad"), ("素食安排：沒有", "no"), ("信義區：沒有", "no")], 0, "#B3321C")
card("cardB", "B 先問 3 題（第 2 次，整理）", [("12 人", "ok"), ("總預算 7,200 內", "ok"), ("素食 2 人專屬", "ok"), ("週四晚上", "ok"), ("信義區 步行 5-8 分", "ok")], 5, "#14795F")
from PIL import Image
Image.open("../../public/caffaine-ask-first/cardA.png").crop((16, 120, 784, 568)).resize((960, 560), Image.LANCZOS).save("../../public/caffaine-ask-first/cardA-zoom.png")
