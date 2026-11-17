# node scripts/caffaine/autoscript.mjs caffaine-pdf-cite --force && python3 videos/caffaine-pdf-cite/build.py
import json
F = "videos/caffaine-pdf-cite/script.json"; d = json.load(open(F)); S = {s["id"]: s["props"] for s in d["scenes"]}
txt = open("videos/caffaine-pdf-cite/tests/answer-A.txt", encoding="utf-8").read().split("\n")
ln = lambda k: next(i + 1 for i, t in enumerate(txt) if k in t)
keys = ["每位讀者一次最多可借", "借期為 21 天", "每本書每天罰款"]
p = S["s04"]; p["lines"] = [{"t": txt[ln(k) - 1].strip(), "n": ln(k), "at": "start-1" if i == 0 else f"k1+{i*12}", "dur": 26} for i, k in enumerate(keys)]
p["tags"] = [{"text": "沒有任何頁碼", "at": "k1", "color": "wrong"}, {"text": "要自己翻 4 頁", "at": "k2", "color": "note"}]
p["hl"] = 2; p["hlAt"] = "k3"; p["before"] = 0; p["size"] = 44
p = S["s06"]; p.update(native=[795, 560], ring=[70, 150, 600, 300], note="第三頁", stamp="頁", zoom={"src": "caffaine-pdf-cite/p3-zoom.png", "w": 960, "h": 453, "cap": "放大：罰款與賠償"})
json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)
