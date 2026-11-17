# 影片用圖：把兩個模型第一次的回答畫成卡片，和標準答案不同的格子標紅（public/caffaine-two-ai-duel/）
import json, subprocess
S = json.load(open("tests/score.json")); STD = {"餐飲": (4, 450), "交通": (4, 210), "娛樂": (3, 280), "總額": (None, 940)}
css = """body{margin:0;width:400px;height:500px;background:#fff;font-family:"WenQuanYi Zen Hei",sans-serif;color:#1c2233;padding:18px;box-sizing:border-box}h3{margin:0 0 12px;font-size:26px}table{border-collapse:collapse;width:100%}td,th{border:2px solid #cfd5e6;padding:10px 12px;font-size:34px;text-align:center}th{background:#EEF2FC;font-size:28px}.bad{background:#FDE8E4;color:#B3321C;font-weight:900}.ok{background:#E3F6EE;color:#14795F}.sc{margin-top:14px;font-size:44px;font-weight:900;text-align:center}"""
for tag, key in [("b35", "gemini-3.5-flash-lite-run1"), ("b31", "gemini-3.1-flash-lite-run1")]:
    r = S[key]; rows = r["rows"]; name = key.rsplit("-run", 1)[0]
    body = ""
    for k in ["餐飲", "交通", "娛樂", "總額"]:
        n, v = rows[k]; sn, sv = STD[k]
        body += f"<tr><td>{k}</td><td class={'ok' if sn is None or n == sn else 'bad'}>{n}</td><td class={'ok' if v == sv else 'bad'}>{v}</td></tr>"
    open(f"tests/{tag}.html", "w").write(f"<!doctype html><meta charset=utf-8><style>{css}</style><h3>{name}</h3><table><tr><th>類別</th><th>筆數</th><th>小計</th></tr>{body}</table><div class=sc>{r['score']} / 8 分</div>")
    subprocess.run(["python3", "../../scripts/caffaine/html2png.py", f"tests/{tag}.html", f"../../public/caffaine-two-ai-duel/{tag}.png", "400", "500", "2"], check=True)
from PIL import Image
Image.open("../../public/caffaine-two-ai-duel/b35.png").crop((36, 250, 764, 540)).resize((960, 383), Image.LANCZOS).save("../../public/caffaine-two-ai-duel/b35-zoom.png")
