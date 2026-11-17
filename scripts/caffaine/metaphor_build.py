"""比喻畫面（IsoMetaphor.tsx）的套版小工具：保留每幕原有的 tag／track／kw／status／asOf，只換 view 與其 props。
用法（各片 build.py）：from metaphor_build import apply; apply("caffaine-xxx", {"s01": {...}}, keywords={"s04": [...]})
念稿、字幕、cue 不動；keywords 只在要多一個動畫卡點時才給（會同步改 cues，字幕必須含該詞）。"""
import json, sys, os
KEEP = ("tag", "tagColor", "track", "kw", "status", "statusAt", "asOf")
def apply(slug, scenes, keywords=None, pause=None):
    F = os.path.join(os.path.dirname(__file__), "..", "..", "videos", slug, "script.json"); d = json.load(open(F)); by = {s["id"]: s for s in d["scenes"]}
    d["noEnSub"] = True
    for s in d["scenes"]: s["subtitle"]["en"] = ""
    for sid, new in scenes.items():
        s = by[sid]; old = s["props"]; keep = {k: old[k] for k in KEEP if k in old}
        s["props"] = {**keep, **new}
    for sid, kws in (keywords or {}).items():
        s = by[sid]; s["keywords"] = [kws[0]]; s["cues"] = [{"id": f"k{i + 1}", "text": t} for i, t in enumerate(kws)]
        for t in kws: assert t in s["subtitle"]["zh"].replace("\n", ""), f"{sid}: 字幕沒有「{t}」"
    for sid, sec in (pause or {}).items(): by[sid]["pauseAfter"] = sec
    json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)
    print("ok", slug, ",".join(scenes))
