# node scripts/caffaine/autoscript.mjs caffaine-excel-formula --force && python3 videos/caffaine-excel-formula/build.py
import json
F = "videos/caffaine-excel-formula/script.json"; d = json.load(open(F)); S = {s["id"]: s["props"] for s in d["scenes"]}
txt = open("videos/caffaine-excel-formula/tests/answer-G2.txt", encoding="utf-8").read().split("\n")
p = S["s03"]; p["lines"] = [{"t": txt[0].strip(), "n": 1, "at": "start-1", "dur": 40, "mark": "SUMIFS", "markAt": "k3"}]; p["before"] = 0; p["after"] = 0; p["size"] = 48; p["hl"] = 0; p["hlAt"] = "k3"
p["tags"] = [{"text": "北區＋大於 5000", "at": "k2", "color": "note"}]
p = S["s05"]; p.update(native=[540, 420], ring=[0, 190, 540, 100], note="其中一條", stamp="0", zoom={"src": "caffaine-excel-formula/sheet-zoom.png", "w": 960, "h": 213, "cap": "放大：G3 算出 0"})
p = S["s06"]; p["top"]["label"] = "第一次：斜線"; p["bottom"]["label"] = "修過：橫線"
p["mids"] = []
S["s09"]["rows"] = [{"big": "LibreOffice", "unit": "", "at": "start-10", "color": "plum", "size": 118, "usize": 100}, {"big": "不是 Excel", "unit": "", "at": "k3", "color": "wrong", "size": 150, "usize": 100}]
json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)
