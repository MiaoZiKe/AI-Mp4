#!/usr/bin/env python3
"""停頓密度檢查（交件四關之一，2026/11/22）。
用法：python3 scripts/dossier/pause-density.py <slug> [--file 成品或 wav] [--json 路徑] [--min 0.25] [--db -45]
抓全片「≥0.25 秒的停頓」（10ms RMS 低於 −45 dBFS 的連續區段，只看第一個字到最後一個字之間），
用 timeline.json 的字時間把每個停頓對到念稿（script.json 的 tts）的標點位置：
  句內（兩個 。？！ 之間、非逗號處）有停頓 → error（人耳聽成斷斷續續）
  逗號／頓號處 ≤0.45 秒的自然停頓 → 只列出（info），不計入總數；>0.45 秒算句中停頓（error）（主控 11/22 定義）
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

# 字時間：直接對「念稿 tts 全文」做強制對齊（scripts/fa.py，本機不花請求）。
# 不能用 timeline.json 的 charTimes：那是對字幕 subtitle.zh 的（阿拉伯數字一字一格、與 tts 唸法字數不同），
# 用 tts 的字索引去查會整段偏移，停頓會被誤對到句中（2026/11/22 hike2022 第 5 版 6 處誤報的原因）。
PUNCT_SENT, PUNCT_COMMA = "。？！?!", "，、,"
texts = [s.get("tts") or s["narration"] for s in sc["scenes"] if not s.get("silent")]
n_sent = sum(max(1, sum(t.count(c) for c in PUNCT_SENT)) for t in texts)
full = "".join(texts)
rec = os.path.join(ROOT, "public", tl["recording"]["file"])
py = os.path.join(ROOT, ".venv/bin/python")
if not os.path.exists(py): py = "python3"
fa = json.loads(subprocess.run([py, os.path.join(ROOT, "scripts/fa.py")], input=json.dumps([{"id": "rec", "file": rec, "text": full}]).encode(), cwd=ROOT, capture_output=True).stdout)[0]
if not fa.get("ok"): sys.exit("✖ 強制對齊失敗")
units = fa["chars"] if "chars" in fa else fa.get("units")
# 每個有聲字：後面接什麼標點（取到下一個有聲字之前的第一個標點；句末優先）
chars = []  # (start_sec, after, ch, ctx)
for k, u in enumerate(units):
    nxt = units[k + 1]["i"] if k + 1 < len(units) else len(full)
    gap = full[u["i"] + 1:nxt]
    aft = "s" if any(c in PUNCT_SENT for c in gap) or k == len(units) - 1 else ("c" if any(c in PUNCT_COMMA for c in gap) else "")
    chars.append((u["start"], aft, u["ch"], k))
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
    ctx = "".join(c[2] for c in chars[max(0, i - 2):i + 1]) + "｜" + "".join(c[2] for c in chars[i + 1:i + 4])
    pauses.append({"start": round(float(a), 2), "dur": round(float(b - a), 2), "kind": kind, "afterCharIndex": i, "context": ctx})

errs, infos = [], []
# 主控 11/22：script.json 的 voice.acceptedPauses＝[{ "sec": 秒, "note": 理由 }] 逐處接受（±0.15 秒），降為 info 並照樣計入總數
accepted = (sc.get("voice") or {}).get("acceptedPauses") or []
def _acc(p): return next((a for a in accepted if abs(float(a["sec"]) - p["start"]) <= 0.15), None)
for p in pauses:
    a = _acc(p)
    if a and p["kind"] in ("inside_sentence", "comma"):
        p["accepted"] = a.get("note", "已接受"); infos.append(f"{p['start']:.2f}s 停頓 {p['dur']:.2f} 秒（{p['context']}）：主控已接受（{p['accepted']}）"); continue
    if p["kind"] == "inside_sentence": errs.append(f"{p['start']:.2f}s 句內停頓 {p['dur']:.2f} 秒（{p['context']}，念稿該處沒有標點）")
    elif p["kind"] == "comma":
        if p["dur"] > 0.45: errs.append(f"{p['start']:.2f}s 逗號處停頓 {p['dur']:.2f} 秒 >0.45（算句中停頓）")
        else: infos.append(f"{p['start']:.2f}s 逗號處自然停頓 {p['dur']:.2f} 秒（不計入總數）")
limit = n_sent + 2
# 主控 11/22 定義：TTS 在逗號自然念出、≤0.45 秒的停頓不算、不計入總數
counted = [q for q in pauses if not (q["kind"] == "comma" and q["dur"] <= 0.45)]
if len(counted) > limit: errs.append(f"全片 ≥{MINP} 秒停頓（不含逗號自然停頓）{len(counted)} 處 > 句數 {n_sent}＋2 = {limit}")
res = {"slug": slug, "file": os.path.relpath(path, ROOT), "sentences": n_sent, "pauseCount": len(pauses), "limit": limit, "firstSec": round(float(first), 2), "lastSec": round(float(last), 2), "chars": len(chars), "countedPauses": len(counted), "pauses": pauses, "errors": errs, "info": infos, "ok": not errs}
out = JOUT or os.path.join(ROOT, "out", slug, "pause-density.json")
os.makedirs(os.path.dirname(out), exist_ok=True); json.dump(res, open(out, "w"), ensure_ascii=False, indent=2)
print(f"停頓密度：{len(pauses)} 處 ≥{MINP}s（句數 {n_sent}，上限 {limit}）；句內 {sum(p['kind']=='inside_sentence' for p in pauses)}、逗號 {len(infos)}、句末／幕界 {sum(p['kind']=='sentence_end' for p in pauses)}")
for m in infos[:8]: print("  ℹ " + m)
for m in errs: print("  ✖ " + m)
sys.exit(1 if errs else 0)
