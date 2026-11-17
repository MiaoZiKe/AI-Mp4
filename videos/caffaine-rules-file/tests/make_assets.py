# 影片用圖：沒規則／有規則兩張回覆卡。文字取自 tests/A-run1.json、B-run1.json 的 replyText，節錄、去掉表情符號與粗體符號，標「節錄」。
import json, re, subprocess
A = json.load(open("tests/A-run1.json"))["replyText"]; B = json.load(open("tests/B-run1.json"))["replyText"]
n = lambda t: len(re.sub(r"\s", "", t))
css = """body{margin:0;width:400px;height:720px;background:#fff;font-family:"WenQuanYi Zen Hei",sans-serif;color:#1c2233;position:relative}
h3{position:absolute;left:18px;top:14px;margin:0;font-size:27px;color:#4B5675}
.b{position:absolute;left:12px;width:376px;border-radius:16px;padding:10px 14px;box-sizing:border-box;font-size:29px;font-weight:900;line-height:1.3}
.bad{background:#FDE8E4;color:#B3321C}.ok{background:#E3F6EE;color:#14795F}.dim{background:#F1F2F6;color:#6a7185}
.sc{position:absolute;left:0;width:100%;top:640px;text-align:center;font-size:44px;font-weight:900}"""
def card(tag, title, blocks, foot, color):
    h = "".join(f"<div class='b {c}' style='top:{y}px'>{t}</div>" for y, c, t in blocks)
    open(f"tests/{tag}.html", "w").write(f"<!doctype html><meta charset=utf-8><style>{css}</style><h3>{title}</h3>{h}<div class=sc style='color:{color}'>{foot}</div>")
    subprocess.run(["python3", "../../scripts/caffaine/html2png.py", f"tests/{tag}.html", f"../../public/caffaine-rules-file/{tag}.png", "400", "720", "2"], check=True)
card("cardA", "沒規則（節錄）", [
    (66, "dim", "選項一：標準有禮貌"),
    (128, "bad", "各位好，下週三的產品會議要調整到週四下午三點，原因是客戶臨時出差，⋯謝謝！"),
    (310, "dim", "選項二：簡短高效"),
    (372, "bad", "跟大家說一下，下週三的產品會議改期囉！⋯請大家幫忙更新行事曆，謝謝～"),
    (554, "dim", "選項三：輕鬆口語　⋯")], f"全文 {n(A)} 字", "#B3321C")
card("cardB", "有規則（全文）", [
    (66, "ok", "下週三產品會議改至週四下午三點。"),
    (170, "ok", "‧原因：客戶臨時出差"),
    (240, "ok", "‧時間：週四 15:00"),
    (310, "ok", "‧待會更新行事曆邀約")], f"全文 {n(B)} 字", "#14795F")
print(n(A), n(B)); print(B)
