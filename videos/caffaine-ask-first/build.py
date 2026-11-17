# node scripts/caffaine/autoscript.mjs caffaine-ask-first --force && python3 videos/caffaine-ask-first/build.py
import json
F = "videos/caffaine-ask-first/script.json"; d = json.load(open(F)); S = {s["id"]: s["props"] for s in d["scenes"]}
P = "caffaine-ask-first/"
p = S["s01"]; [p.pop(k, None) for k in ("layout", "top", "bottom")]
p.update(left={"src": P + "cardA.png", "label": "A 直接做", "color": "wrong", "at": "start-1", "native": [400, 720], "crop": [0, 0, 400, 720]}, right={"src": P + "cardB.png", "label": "B 先問三題", "color": "right", "at": "start+12", "native": [400, 720], "crop": [0, 0, 400, 720]}, mid={"text": "VS", "at": "start+26"}, aiAt="start+8", size="big", wl=380, wr=380)
p = S["s04"]; p.update(native=[400, 720], ring=[12, 66, 376, 212], note="自己猜的", stamp="猜", zoom={"src": P + "cardA-zoom.png", "w": 960, "h": 560, "cap": "放大：人數、預算都是它猜的"})
p = S["s05"]; p["kind"] = "bars"; p["items"] = [{"t": "A①", "h": 0.03, "color": "wrong"}, {"t": "A②", "h": 0.03, "color": "wrong"}, {"t": "B①", "h": 0.8, "color": "sky"}, {"t": "B②", "h": 1.0, "color": "right"}]; p["chips"] = [{"text": "0／0　　4／5", "at": "k2", "color": "note"}]; p["note"] = "示意：長短依分數，滿分 5；各 2 次"
json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)
