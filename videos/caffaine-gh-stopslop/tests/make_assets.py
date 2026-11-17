# 影片用圖（public/caffaine-gh-stopslop/）：第二題（LinkedIn 風貼文）第 1 次的回答節錄；文字逐字取自 tests/B-base-run1.json、B-rules-run1.json
import subprocess
css = """body{margin:0;width:400px;height:720px;background:#fff;font-family:"WenQuanYi Zen Hei","DejaVu Sans",sans-serif;color:#1c2233;position:relative}
h3{position:absolute;left:18px;top:12px;margin:0;font-size:25px;color:#4B5675}
.r{position:absolute;left:12px;width:376px;height:128px;border-radius:12px;padding:6px 12px;box-sizing:border-box;font-size:30px;line-height:1.3;font-weight:700;background:#F4F6FB}
b{background:#FFE08A;color:#7a4b00;padding:0 3px;border-radius:5px}
.f{position:absolute;left:0;width:100%;top:668px;text-align:center;font-size:30px;font-weight:900}"""
def card(tag, title, rows, foot, color):
    h = "".join(f"<div class=r style='top:{52 + i * 152}px'>{t}</div>" for i, t in enumerate(rows))
    open(f"tests/{tag}.html", "w").write(f"<!doctype html><meta charset=utf-8><style>{css}</style><h3>{title}</h3>{h}<div class=f style='color:{color}'>{foot}</div>")
    subprocess.run(["python3", "../../scripts/caffaine/html2png.py", f"tests/{tag}.html", f"../../public/caffaine-gh-stopslop/{tag}.png", "400", "720", "2"], check=True)
card("cardL", "沒加規則（第 1 次，節錄）", ["Receipt chaos is <b>officially</b> a thing of the past!", "Our team <b>just</b> made the switch to a brand-new…", "…what <b>actually</b> matters<b>—</b>building great things.", "Here’s to working smarter, not harder!"], "86 字｜副詞 4｜破折號 1", "#B3321C")
card("cardR", "加了規則檔（第 1 次，節錄）", ["Our old expense system cost us two weeks every month.", "We switched to Ramp last Monday.", "Employees scan receipts with their phones.", "Work should not involve paperwork."], "46 字｜副詞 1｜破折號 0", "#14795F")
from PIL import Image
Image.open("../../public/caffaine-gh-stopslop/cardR.png").crop((16, 104, 784, 420)).resize((960, 395), Image.LANCZOS).save("../../public/caffaine-gh-stopslop/cardR-zoom.png")
