#!/usr/bin/env python3
"""停頓密度檢查（交件四關之一，2026/11/22）。
用法：python3 scripts/dossier/pause-density.py <slug> [--file 成品或 wav] [--json 路徑] [--min 0.25] [--db -45]
抓全片「≥0.25 秒的停頓」（10ms RMS 低於 −45 dBFS 的連續區段，只看第一個字到最後一個字之間），
用 timeline.json 的字時間把每個停頓對到念稿（script.json 的 tts）的標點位置：
  句內（兩個 。？！ 之間、非逗號處）有停頓 → error（人耳聽成斷斷續續）
  逗號／頓號處的停頓 → 只列出（info）
  句末或幕界的停頓 → 正常
規則：全片 ≥0.25 秒停頓數 ≤ 句數＋2，否則 error。exit 1＝不過。
沒給 --file：用 timeline.json 的 recording.file（旁白 wav）；成品 mp4 也可（會用 timeline 的 voice 區間，片尾卡不算）。"""
import json, os, re, subprocess, sys, bisect
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
args = sys.argv[1:]
def opt(name, default=None):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
FILE, JOUT = opt("--file"), opt("--json")
MINP, DB = float(opt("--min", 0.25)), float(opt("--db", -45))
if not args: sys.exit(__doc__)
slug = args[0]
tl = json.load(open(os.path.join(ROOT, "videos", slug, "timeline.json")))
sc = json.load(open(os.path.join(ROOT, "videos", slug, "script.json")))
fps = tl["fps"]
path = FILE if FILE else os.path.join(ROOT, "public", tl["recording"]["file"])
if not os.path.isabs(path): path = os.path.join(ROOT, path)
SR = 16000
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-map", "0:a:0", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, np.float32)
if not len(x): sys.exit(f"✖ {path} 沒有音軌")

# 字時間（絕對秒）＋該字後面的標點種類
PUNCT_SENT, PUNCT_COMMA = "。？！?!", "，、,"
SKIP = re.compile(r"[\s：；「」『』（）()・｜|—–\-\"'“”‘’…%]")
chars = []  # (start_sec, after: 's'|'c'|'')
tl_scenes = {s["id"]: s for s in tl["scenes"]}
n_sent = 0
for s in [s for s in sc["scenes"] if not s.get("silent")]:
    t = s.get("tts") or s["narration"]
    ts = tl_scenes.get(s["id"])
    if not ts or "charTimes" not in ts: continue
    base = ts["voiceStartFrame"] / fps
    k = 0; seq = []
    for ch in t:
        if ch in PUNCT_SENT + PUNCT_COMMA:
            if seq: seq[-1][1] = "s" if ch in PUNCT_SENT else ("c" if seq[-1][1] != "s" else "s")
            continue
        if SKIP.match(ch): continue
        seq.append([ch, ""])
    n_sent += sum(1 for c in seq if c[1] == "s") or 1
    for i, (ch, aft) in enumerate(seq):
        if i < len(ts["charTimes"]):
            chars.append((base + ts["charTimes"][i], "s" if (i == len(seq) - 1) else aft))
if not chars: sys.exit("✖ timeline.json 沒有 charTimes（要先跑對齊）")
starts = [c[0] for c in chars]
first, last = starts[0], starts[-1] + 0.3

# 10ms RMS → 停頓
W = SR // 100
n = len(x) // W
rms = np.sqrt(np.mean(x[: n * W].reshape(n, W) ** 2, axis=1) + 1e-12)
db = 20 * np.log10(rms)
quiet = (db < DB).astype(np.int8)
d = np.diff(np.concatenate([[0], quiet, [0]]))
qs, qe = np.where(d == 1)[0] * 0.01, np.where(d == -1)[0] * 0.01
pauses = []
for a, b in zip(qs, qe):
    if b - a < MINP or a < first - 0.01 or a > last: continue
    b = min(b, last)
    if b - a < MINP: continue
    # 停頓開始前最後一個字
    i = bisect.bisect_right(starts, a - 0.05) - 1
    i = max(i, 0)
    aft = chars[i][1]
    kind = "sentence_end" if aft == "s" else ("comma" if aft == "c" else "inside_sentence")
    pauses.append({"start": round(float(a), 2), "dur": round(float(b - a), 2), "kind": kind, "afterCharIndex": i})

errs, infos = [], []
for p in pauses:
    if p["kind"] == "inside_sentence": errs.append(f"{p['start']:.2f}s 句內停頓 {p['dur']:.2f} 秒（第 {p['afterCharIndex']} 字後，念稿該處沒有標點）")
    elif p["kind"] == "comma": infos.append(f"{p['start']:.2f}s 逗號處停頓 {p['dur']:.2f} 秒")
limit = n_sent + 2
if len(pauses) > limit: errs.append(f"全片 ≥{MINP} 秒停頓 {len(pauses)} 處 > 句數 {n_sent}＋2 = {limit}")
res = {"slug": slug, "file": os.path.relpath(path, ROOT), "sentences": n_sent, "pauseCount": len(pauses), "limit": limit, "pauses": pauses, "errors": errs, "info": infos, "ok": not errs}
out = JOUT or os.path.join(ROOT, "out", slug, "pause-density.json")
os.makedirs(os.path.dirname(out), exist_ok=True); json.dump(res, open(out, "w"), ensure_ascii=False, indent=2)
print(f"停頓密度：{len(pauses)} 處 ≥{MINP}s（句數 {n_sent}，上限 {limit}）；句內 {sum(p['kind']=='inside_sentence' for p in pauses)}、逗號 {len(infos)}、句末／幕界 {sum(p['kind']=='sentence_end' for p in pauses)}")
for m in infos[:8]: print("  ℹ " + m)
for m in errs: print("  ✖ " + m)
sys.exit(1 if errs else 0)
