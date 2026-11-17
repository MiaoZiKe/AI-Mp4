# 影片用圖（public/caffaine-excel-formula/）：用 LibreOffice 實際算出的數字畫成示意試算表
import json, subprocess, os
R = json.load(open("tests/result.json")); X = json.load(open("tests/result-fix.json"))
css = """body{margin:0;font-family:"WenQuanYi Zen Hei",sans-serif;background:#fff;color:#1c2233}table{border-collapse:collapse;width:100%}td,th{border:2px solid #cfd5e6;padding:10px 14px;font-size:30px;text-align:left}th{background:#EEF2FC}.bad{background:#FDE8E4;color:#B3321C;font-weight:900}.ok{background:#E3F6EE;color:#14795F;font-weight:900}.t{font-size:26px;color:#6b7390;margin:10px 0}"""
def sheet(g3, g3ok, name, extra=""):
    h = f"""<!doctype html><meta charset=utf-8><style>{css}body{{width:540px;padding:20px;box-sizing:border-box}}</style>
<div class=t>示意試算表（虛構銷售明細，20 筆）｜LibreOffice 實際算出</div>
<table><tr><th>儲存格</th><th>要算什麼</th><th>結果</th></tr>
<tr><td>G2</td><td>北區、金額&gt;5000 的加總</td><td class=ok>{R['G2']['libreoffice_value']:,}</td></tr>
<tr><td>G3</td><td>2026 年 10 月金額加總</td><td class={'ok' if g3ok else 'bad'}>{g3:,}</td></tr>
<tr><td>G4</td><td>不同業務有幾位</td><td class=ok>{R['G4']['libreoffice_value']}</td></tr></table>{extra}"""
    open(f"tests/{name}.html", "w").write(h); subprocess.run(["python3", "../../scripts/caffaine/html2png.py", f"tests/{name}.html", f"../../public/caffaine-excel-formula/{name}.png", "540", "420", "2"], check=True)
sheet(R["G3"]["libreoffice_value"], False, "sheet-before"); sheet(X["libreoffice_value"], True, "sheet-after")
def card(name, title, formula, val, ok):
    f = formula.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    h = f"""<!doctype html><meta charset=utf-8><style>{css}body{{width:1280px;height:800px;padding:50px;box-sizing:border-box;background:#fff}}.f{{font-family:monospace,"WenQuanYi Zen Hei";font-size:58px;line-height:1.35;word-break:break-all;background:#F4F6FD;border-radius:20px;padding:24px;margin-top:20px}}.v{{font-size:170px;font-weight:900;margin-top:50px;color:{'#14795F' if ok else '#B3321C'}}}h2{{font-size:56px;margin:0}}</style>
<h2>{title}</h2><div class=f>{f}</div><div class=v>算出 {val:,}</div>"""
    open(f"tests/{name}.html", "w").write(h); subprocess.run(["python3", "../../scripts/caffaine/html2png.py", f"tests/{name}.html", f"../../public/caffaine-excel-formula/{name}.png", "1280", "800"], check=True)
card("card-first", "第一次給的公式（G3）", R["G3"]["formula"], R["G3"]["libreoffice_value"], False)
card("card-fixed", "請它修過的公式（G3）", X["formula"], X["libreoffice_value"], True)
