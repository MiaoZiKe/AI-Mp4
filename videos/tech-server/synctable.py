# 產生「逐句念稿 ↔ 該時刻畫面」對照表：python3 videos/tech-server/synctable.py <mp4>
import json, subprocess, sys, os, re
V = "videos/tech-server"; mp4 = sys.argv[1]; out = "out/tech-server-sync"; os.makedirs(out, exist_ok=True)
sb = json.load(open(f"{V}/storyboard.json")); sc = {x["id"]: x for x in json.load(open(f"{V}/script.json"))["scenes"]}; fps = sb["fps"]
rows = ["# tech-server v2 逐句念稿 ↔ 該時刻畫面（每句字幕開始後 0.3 秒取一格）", "", "| # | 場次 | 時間 | 念稿（字幕） | 該句對到的畫面事件（cue 觸發） | 截圖 |", "|---|---|---|---|---|---|"]
n = 0
def ev(props, cid):
    r = []
    for k in ("run", "labels", "stamp", "shift", "overlay"):
        for it in props.get(k, []) or []:
            at = str(it.get("at", ""))
            if re.match(re.escape(cid) + r"([+-]\d+)?$", at):
                r.append({"run": "動作", "labels": "引線標籤", "shift": "位移", "overlay": "疊層"}.get(k, k) + "：" + str(it.get("id") or it.get("text") or it.get("layer") or it.get("kind") or it.get("type")))
            for tk, tv in (it.get("t") or {}).items():
                if isinstance(tv, dict) and re.match(re.escape(cid) + r"([+-]\d+)?$", str(tv.get("at", ""))): r.append(f"2D 卡「{it.get('title','')}」段 {tk}")
    return "、".join(dict.fromkeys(r)) or "（接續上一事件）"
for s in sb["scenes"]:
    if not s.get("subtitles"): continue
    props = sc[s["id"]]["props"]
    for p in s["subtitles"]:
        n += 1; f = p["startFrame"] + 9; t = f / fps
        cs = [c for c in s["cues"] if p["startFrame"] - 4 <= c["frame"] < p["endFrame"]]
        desc = "；".join(f"[{c['text']}] " + ev(props, c["id"]) for c in cs) or "（無 cue，沿用上一事件）"
        img = f"{out}/{n:02d}.jpg"
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{t:.3f}", "-i", mp4, "-frames:v", "1", "-vf", "scale=360:-1", img], check=True)
        rows.append(f"| {n} | {s['id']} | {t:.1f}s | {p['zh']} | {desc} | ![]({img}) |")
open(f"{V}/sync-table.md", "w").write("\n".join(rows) + "\n")
from PIL import Image
ims = [Image.open(f"{out}/{i:02d}.jpg") for i in range(1, n + 1)]; w, h = ims[0].size; cols = 8; rws = (n + cols - 1) // cols
W = Image.new("RGB", (w * cols, h * rws), "white")
for i, im in enumerate(ims): W.paste(im, ((i % cols) * w, (i // cols) * h))
W.save("out/tech-server.v2-sync.jpg", quality=80); print(n, "rows")
