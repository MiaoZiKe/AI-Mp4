"""量每一幕「最後動作落定 → 幕結束」秒數。用法：python3 scripts/caffaine/hold-check.py <slug> [門檻秒=1.5]
落定＝props 裡所有 at 字串（cue／start／voice／end 加減幀）解析成幀，取最大；同一物件有 dur 的算 at+dur。"""
import json, re, sys
slug = sys.argv[1]; thr = float(sys.argv[2]) if len(sys.argv) > 2 else 1.5
sb = json.load(open(f"videos/{slug}/storyboard.json")); sc = json.load(open(f"videos/{slug}/script.json"))["scenes"]
R = re.compile(r"^(start|voice|end|exit|k\d+)([+-]\d+)?$")
def res(s, t):
    m = R.match(t)
    if not m: return None
    v = s.get("voice") or {"startFrame": s["startFrame"], "endFrame": s["startFrame"] + s["durationFrames"]}
    b = {"start": s["startFrame"], "voice": v["startFrame"], "end": v["endFrame"], "exit": s["startFrame"] + s["durationFrames"]}.get(m[1])
    if b is None: b = next(c["frame"] for c in s["cues"] if c["id"] == m[1])
    return b + int(m[2] or 0)
def walk(o, s, out):
    if isinstance(o, dict):
        a = o.get("at"); 
        if isinstance(a, str):
            f = res(s, a)
            if f is not None: out.append(f + (o["dur"] if isinstance(o.get("dur"), (int, float)) and o["dur"] < 100 else 0))
        for k, v in o.items():
            if k.endswith("At") and isinstance(v, str):
                f = res(s, v)
                if f is not None: out.append(f)
            walk(v, s, out)
    elif isinstance(o, list):
        for v in o: walk(v, s, out)
bad = 0; mn = 99
for i, s in enumerate(sb["scenes"]):
    sp = next((x for x in sc if x["id"] == s["id"]), None)
    if not sp or s["component"] != "IsoScene": print(s["id"], "(非比喻幕，略過)"); continue
    out = []; walk(sp["props"], s, out)
    if not out: continue
    last = max(out); end = sb["scenes"][i + 1]["startFrame"] if i + 1 < len(sb["scenes"]) else s["startFrame"] + s["durationFrames"]; h = (end - last) / 30; mn = min(mn, h)
    ok = h >= thr; bad += not ok
    print(f'{s["id"]} 落定@{(last - s["startFrame"]) / 30:.2f}s 幕長{s["durationFrames"] / 30:.2f}s 落定後{h:.2f}s {"OK" if ok else "不足"}')
print(f"最小 {mn:.2f}s，不足 {bad} 幕")
