# node scripts/caffaine/autoscript.mjs caffaine-say-idk --force && python3 videos/caffaine-say-idk/build.py
import json
F = "videos/caffaine-say-idk/script.json"; d = json.load(open(F)); S = {s["id"]: s["props"] for s in d["scenes"]}
S["s04"]["rows"] = [{"big": "5→2", "unit": "題編造", "at": "start-10", "color": "fix" if False else "sky", "size": 230, "usize": 110}, {"big": "只剩兩題", "unit": "", "at": "k3", "color": "wrong", "size": 150, "usize": 110}]
p = S["s07"]; p["size"] = 44; p["hl"] = 1; p["hlAt"] = "k3"
if len(p["lines"]) > 1: p["lines"][1]["mark"] = "沒有提供免費的 Wi-Fi"; p["lines"][1]["markAt"] = "k3"
p = S["s02"]; p["lines"] = [{"t": t.strip(), "n": i + 1, "at": "start-1" if i == 0 else f"k1+{i*6}", "dur": 20} for i, t in enumerate(open("videos/caffaine-say-idk/tests/shop.txt", encoding="utf-8").read().strip().split("\n"))]; p["size"] = 40; p["before"] = 0; p["hl"] = 4; p["hlAt"] = "k3"
json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)
