# node scripts/caffaine/autoscript.mjs caffaine-chatgpt-gif --force && python3 videos/caffaine-chatgpt-gif/build.py
import json
from PIL import Image
F = "videos/caffaine-chatgpt-gif/script.json"; d = json.load(open(F)); S = {s["id"]: s["props"] for s in d["scenes"]}
P = "caffaine-chatgpt-gif/"
Image.open("public/caffaine-chatgpt-gif/m1.png").crop((32, 880, 748, 1080)).save("public/caffaine-chatgpt-gif/m1-zoom.png")
p = S["s01"]; p["rows"] = [{"big": "ChatGPT", "unit": "", "at": "start-10", "color": "primary", "size": 160, "usize": 110}, {"big": "會做 GIF 了", "unit": "", "at": "start-4", "color": "wrong", "size": 150, "usize": 110}]; p["q"] = {"text": "怎麼用？", "at": "start+14"}
p = S["s03"]; p.update(native=[390, 844], crop=[0, 260, 390, 300], ring=[16, 492, 358, 52], note="可調速度、改單格", stamp="調", zoom={"src": P + "m1-zoom.png", "w": 716, "h": 200, "cap": "放大：調速、改單格"})
p = S["s02"]; p["chips"][1]["at"] = "k3+14"
p = S["s05"]; p["kwAt"] = "k1+16"; p["allAt"] = "k2-8"
json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)

