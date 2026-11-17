# node scripts/caffaine/autoscript.mjs caffaine-gh-stopslop --force && python3 videos/caffaine-gh-stopslop/build.py
import json
F = "videos/caffaine-gh-stopslop/script.json"; d = json.load(open(F)); S = {s["id"]: s["props"] for s in d["scenes"]}
P = "caffaine-gh-stopslop/"
p = S["s01"]; p["rows"] = [{"big": "讓 AI 別再", "unit": "", "at": "start-10", "color": "primary", "size": 150, "usize": 110}, {"big": "寫出 AI 味", "unit": "", "at": "start-4", "color": "wrong", "size": 150, "usize": 110}]; p["q"] = {"text": "真的有用嗎？", "at": "start+14"}
p = S["s02"]; src = open("videos/caffaine-gh-stopslop/tests/SKILL.md", encoding="utf-8").read().split("\n")
sel = [(35, "adverbs", "k1"), (43, "Em-dash", "k2"), (25, "No em dashes", "k2+8")]
p["lines"] = [{"t": src[n - 1].strip(), "n": n, "at": "start-1" if i == 0 else f"k1+{i * 8}", "dur": 22, "mark": m, "markAt": k} for i, (n, m, k) in enumerate(sel)]
p["before"] = 0; p["size"] = 38; p["hl"] = 1; p["hlAt"] = "k2"; p["file"] = "SKILL.md"
p = S["s03"]; [p.pop(k, None) for k in ("layout", "top", "bottom")]
p.update(left={"src": P + "cardL.png", "label": "沒加規則", "color": "wrong", "at": "start-1", "native": [400, 720], "crop": [0, 0, 400, 720]}, right={"src": P + "cardR.png", "label": "加規則檔", "color": "right", "at": "start+12", "native": [400, 720], "crop": [0, 0, 400, 720]}, mid={"text": "VS", "at": "start+26"}, aiAt="start+8", size="big", wl=380, wr=380)
p = S["s04"]; p.update(native=[400, 720], ring=[12, 52, 376, 280], note="題目沒給的事", stamp="編", zoom={"src": P + "cardR-zoom.png", "w": 960, "h": 395, "cap": "放大：Ramp、兩週"})
p = S["s05"]; lines = open("videos/caffaine-gh-stopslop/tests/A-rules-run1.txt", encoding="utf-8").read().split("\n")
p["lines"] = [{"t": lines[i].strip(), "n": i + 1, "at": "start-1" if k == 0 else "k1+6", "dur": 22} for k, i in enumerate([0, 4])]
p["lines"][1]["mark"] = "cuts processing time from weeks to days"; p["lines"][1]["markAt"] = "k3"
p["before"] = 0; p["size"] = 38; p["hl"] = 1; p["hlAt"] = "k3"; p["file"] = "公告第 1 次（加規則）"
json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)
