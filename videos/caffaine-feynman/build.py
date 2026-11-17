# node scripts/caffaine/autoscript.mjs caffaine-feynman --force && python3 videos/caffaine-feynman/build.py
import json
F = "videos/caffaine-feynman/script.json"; d = json.load(open(F)); S = {s["id"]: s["props"] for s in d["scenes"]}
d["noEnSub"] = True
for s in d["scenes"]: s["subtitle"]["en"] = ""   # Andy 11/17：畫面不放英文副字幕
p = S["s01"]; p["rows"] = [{"big": "看懂", "unit": "≠", "at": "start-10", "color": "primary", "size": 240, "usize": 190}, {"big": "學會", "unit": "", "at": "start+22", "color": "wrong", "size": 240, "usize": 110}]; p["q"] = {"text": "怎麼逼自己真的學會？", "at": "k3"}
p = S["s02"]
for n, (ic, sub) in zip(p["nodes"], [("bubble", "國中生版"), ("pencil", "用自己的話"), ("mag", "還反問你"), ("check", "一句話")]): n["icon"] = ic; n["sub"] = sub
for n, c in zip(p["nodes"], ["primary", "sky", "wrong", "right"]): n["color"] = c
p["nodes"][0]["at"] = "k1"
p = S["s03"]; p["title"] = "和 AI 對話（複利）"
p["msgs"] = [{"who": "me", "text": "用國中生聽得懂的話解釋複利", "typeAt": "start+4", "typeDur": 24, "at": "k1"}, {"who": "ai", "text": "利息會變成新的本金，繼續幫你賺錢", "at": "k2"}, {"who": "me", "text": "複利就是每年固定領利息", "at": "k4"}]; p.pop("chips", None)
p = S["s04"]; p.update(native=[400, 720], ring=[12, 140, 376, 150], note="抓到我講錯的", noteAt="k1", scanAt="k1+20", stampAt="k3", stamp="抓", zoom={"src": "caffaine-feynman/cardC-zoom.png", "w": 960, "h": 560, "cap": "放大：固定領利息，是單利"})
p = S["s05"]; p["title"] = "和 AI 對話（複利）"
p["msgs"] = [{"who": "me", "text": "再簡化成一句話，我要講給同事聽", "typeAt": "start+4", "typeDur": 26, "at": "start+34"}, {"who": "ai", "text": "複利就是「利滾利」——把賺到的利息留下來繼續幫你賺錢", "at": "k2"}]; p.pop("chips", None)
p = S["s06"]; p["w"] = 640
for k, lab, c in (("top", "只看", "plum"), ("bottom", "講一遍", "right")): p[k].update(label=lab, color=c, native=[640, 300], crop=[0, 0, 640, 300])
p["top"]["at"] = "start+2"; p["bottom"]["at"] = "k1+34"; p["mids"] = [{"text": "卡住＝還沒懂", "at": "k3", "color": "right"}]
p = S["s07"]; p["itemH"] = 124; p["itemFs"] = 44
p["head"] = {"text": "四步提示詞", "at": "start-1", "color": "note"}
txt = ["用國中生聽得懂的話解釋◯◯", "換我講：◯◯就是⋯⋯", "抓出我講錯的，再問我一題", "把正確版本簡化成一句話"]
p["items"] = [{"text": t, "sub": "", "at": f"start+{6 + i * 16}", "color": ["primary", "sky", "wrong", "right"][i]} for i, t in enumerate(txt)]
p["stamp"] = {"text": "費曼", "at": "k2", "color": "note"}
json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)
