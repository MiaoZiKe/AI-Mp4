# node scripts/caffaine/autoscript.mjs caffaine-two-ai-duel --force && python3 videos/caffaine-two-ai-duel/build.py
import json
F = "videos/caffaine-two-ai-duel/script.json"; d = json.load(open(F)); S = {s["id"]: s["props"] for s in d["scenes"]}
P = "caffaine-two-ai-duel/"
txt = open("videos/caffaine-two-ai-duel/tests/data.txt", encoding="utf-8").read().strip().split("\n")
p = S["s01"]; [p.pop(k, None) for k in ("layout", "top", "bottom")]
p.update(left={"src": P + "b35.png", "label": "3.5 輕量版", "color": "wrong", "at": "start-1", "native": [400, 500], "crop": [0, 0, 400, 500]}, right={"src": P + "b31.png", "label": "3.1 輕量版", "color": "right", "at": "k2", "native": [400, 500], "crop": [0, 0, 400, 500]}, mid={"text": "VS", "at": "k3"}, aiAt="start+8", size="big", wl=340, wr=340)
p = S["s02"]; sel = [(2, "重複貼上", "k1"), (7, "一百八十", "k2"), (12, "退款", "k3")]
p["lines"] = [{"t": txt[n - 1], "n": n, "at": "start-1" if i == 0 else f"k{i}+6", "dur": 22, "mark": m, "markAt": k} for i, (n, m, k) in enumerate(sel)]
p["before"] = 0; p["size"] = 46; p["hl"] = 2; p["hlAt"] = "k3"; p["tags"] = [{"text": "還有 9 行正常的", "at": "k1", "color": "note"}]
p = S["s06"]; p.update(native=[400, 500], ring=[18, 193, 364, 68], note="交通小計", stamp="少", zoom={"src": P + "b35-zoom.png", "w": 960, "h": 383, "cap": "放大：交通 195（標準 210）"})
json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)
