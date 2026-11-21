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
    hold_pass(slug, d)
    json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)
    print("ok", slug, ",".join(scenes))


# ───────── 落定後至少停 1.5 秒（playbook 第二十節第 3 點）─────────
# 每幕最後一個動作（所有 at／xxxAt 解析成幀，at 有 dur 的算 at+dur）落定後到「下一幕開始」若 < HOLD 幀，
# 就把該幕所有事件依「離幕首越遠移越多」的比例往前移（最後一個移 d 幀、幕首不動），順序不變、仍以 cue 為基準寫成 cue±幀。
# 旁白、cue 時間、pauseAfter 都不動。量測用 scripts/caffaine/hold-check.py。
import re
HOLD = 45
_R = re.compile(r"^(start|voice|end|exit|k\d+)([+-]\d+)?$")
def hold_pass(slug, d, hold=HOLD):
    SB = os.path.join(os.path.dirname(__file__), "..", "..", "videos", slug, "storyboard.json")
    if not os.path.exists(SB): return
    sb = json.load(open(SB))["scenes"]
    for i, s in enumerate(sb):
        sp = next((x for x in d["scenes"] if x["id"] == s["id"]), None)
        if not sp: continue
        v = s.get("voice") or {"startFrame": s["startFrame"], "endFrame": s["startFrame"] + s["durationFrames"]}
        base = {"start": s["startFrame"], "voice": v["startFrame"], "end": v["endFrame"], "exit": s["startFrame"] + s["durationFrames"]}
        for c in s["cues"]: base[c["id"]] = c["frame"]
        def res(t):
            m = _R.match(t) if isinstance(t, str) else None
            return (m[1], int(m[2] or 0)) if m and m[1] in base else None
        refs = []   # (容器, 鍵, 基準, 偏移, 額外 dur)
        def walk(o):
            if isinstance(o, dict):
                for k, val in o.items():
                    if (k == "at" or k.endswith("At")) and res(val):
                        b, off = res(val); refs.append((o, k, b, off, o["dur"] if k == "at" and isinstance(o.get("dur"), (int, float)) and o["dur"] < 100 else 0))
                    else: walk(val)
            elif isinstance(o, list):
                for x in o: walk(x)
        walk(sp["props"])
        if not refs: continue
        end = sb[i + 1]["startFrame"] if i + 1 < len(sb) else s["startFrame"] + s["durationFrames"]
        last = max(base[b] + off + dur for _, _, b, off, dur in refs); need = last - (end - hold)
        if need <= 0: continue
        span = max(1, last - s["startFrame"])
        for o, k, b, off, dur in refs:
            f = base[b] + off; shift = round(need * min(1, max(0, (f + dur - s["startFrame"]) / span)))
            o[k] = f"{b}{off - shift:+d}" if off - shift else b
        print(f"  hold {s['id']}: 最後動作提前 {need} 幀（{need / 30:.2f}s）")
