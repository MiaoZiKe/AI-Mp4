# node scripts/caffaine/autoscript.mjs caffaine-rules-file --force && python3 videos/caffaine-rules-file/build.py
import json
F = "videos/caffaine-rules-file/script.json"; d = json.load(open(F)); S = {s["id"]: s["props"] for s in d["scenes"]}
d["noEnSub"] = True
for s in d["scenes"]: s["subtitle"]["en"] = ""   # Andy 11/17：畫面不放英文副字幕
P = "caffaine-rules-file/"
p = S["s01"]; [p.pop(k, None) for k in ("layout", "top", "bottom")]
p.update(left={"src": P + "cardA.png", "label": "沒規則", "color": "wrong", "at": "start-1", "native": [400, 720], "crop": [0, 0, 400, 720]}, right={"src": P + "cardB.png", "label": "有規則", "color": "right", "at": "k2", "native": [400, 720], "crop": [0, 0, 400, 720]}, mid={"text": "VS", "at": "k3"}, aiAt="start+6", size="big", wl=380, wr=380)
p = S["s02"]; p["msgs"] = [{"who": "me", "text": "回覆同事：會議改週四三點", "typeAt": "start+4", "typeDur": 24, "at": "start+30"}, {"who": "ai", "text": "給你三種版本：標準、簡短、輕鬆", "at": "k2"}, {"who": "me", "text": "太長了，改短", "at": "k3"}]; p.pop("chips", None)
p = S["s03"]; p["file"] = "規則檔.txt"; p["status2"] = "四項規則"
L = ["我是行銷部專案經理，同事都很忙，我要的是能直接貼進群組的訊息。", "口氣：直接、不客套。", "格式：第一行只放結論，後面最多三點條列，全文不超過 80 字。", "禁忌：不寫「您好」「謝謝」「希望」這類開場或結尾，不用表情符號。"]
p["lines"] = [{"t": t, "n": i + 1, "at": ("start+4" if i == 0 else f"k{i + 2}"), "dur": 26} for i, t in enumerate(L)]; p["before"] = 0; p["hl"] = 0; p["hlAt"] = "k5"; p["size"] = 40
p = S["s04"]
for n, (ic, sub) in zip(p["nodes"], [("bubble", "ChatGPT"), ("star", "Gemini（原 Gem）"), ("file", "Claude 專案")]): n["icon"] = ic; n["sub"] = sub
p["nodes"][0]["color"] = "primary"; p["nodes"][1]["color"] = "note"; p["nodes"][2]["color"] = "right"
p["chip"] = "貼一次，之後每次新對話都先讀過"; p["chipAt"] = "k4"; p["chipColor"] = "right"; p["chipCenter"] = True; p["chipTop"] = 60
p = S["s05"]; p["items"] = [{"t": "沒規則", "h": 0.32, "color": "wrong"}, {"t": "有規則", "h": 1.0, "color": "right"}]; p["chips"] = [{"text": "平均 1.6 分", "at": "k2", "color": "wrong"}, {"text": "次次 5 分", "at": "k3", "color": "right"}]; p["note"] = "示意：長短依分數；各跑 5 次，滿分 5"
p = S["s06"]; p["rows"] = [{"big": "寫一次", "unit": "每次照做", "at": "start-10", "color": "right", "size": 170, "usize": 90}, {"big": "先讀過", "unit": "再回答", "at": "start+22", "color": "primary", "size": 170, "usize": 90}]
json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)
