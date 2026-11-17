# 影片用圖（public/caffaine-menu-translate/）
import json, re, subprocess
from PIL import Image
P = "../../public/caffaine-menu-translate/"
m = Image.open("tests/menu.png"); bg = Image.new("RGB", (1080, 1920), "#E9DFC8"); bg.paste(m, (0, (1920 - m.size[1]) // 2 - 120)); bg.resize((540, 960), Image.LANCZOS).save(P + "phone.png")
def clean(t): return re.sub(r"\*+", "", t)
a2 = json.load(open("tests/A-translate-run2.json"))["answer"].split("\n")
items = [clean(l.strip().lstrip("*").strip()).strip("()（）*").strip() if False else clean(l.strip().lstrip("*").strip()) for l in a2 if l.strip().startswith("*") and "示意菜單" not in l][:10]
css = """body{margin:0;width:540px;height:560px;background:#fff;font-family:"IPAGothic","WenQuanYi Zen Hei",sans-serif;color:#1c2233;padding:16px 20px;box-sizing:border-box}h3{margin:0 0 8px;font-size:24px;color:#6b7390}div.i{font-size:29px;line-height:1.35;padding:7px 0;border-bottom:2px solid #eef0f6}div.n{font-size:22px;color:#6b7390;padding:0 0 6px}"""
body = "".join((f"<div class=n>{x}</div>" if x.startswith("※") else f"<div class=i>{x}</div>") for x in items)
open("tests/a2card.html", "w").write(f"<!doctype html><meta charset=utf-8><style>{css}</style><h3>只說「幫我翻譯」的回答（第二次）</h3>{body}")
subprocess.run(["python3", "../../scripts/caffaine/html2png.py", "tests/a2card.html", P + "a2card.png", "540", "560", "2"], check=True)
open("tests/answer-B.txt", "w").write(clean(json.load(open("tests/B-explain-run1.json"))["answer"]))
