#!/usr/bin/env python3
"""音訊不斷續檢查（全頻道可用；哩股哩股 make.mjs 在混音後自動跑）。
用法：python3 scripts/dossier/audio-check.py <slug> [--file 成品或 wav] [--end 片尾卡開始秒] [--json 輸出路徑] [--quiet]
  沒給 --file：依序找 out/<slug>.mp4、out/web/<slug>/video.mp4、out/web/<slug>/<slug>.mp4
  沒給 --end：讀 videos/<slug>/storyboard.json 最後一幕的開始秒（沒有就整條都查）
擋下（exit 1）的情況，門檻是 2026/11/21 量 6 支哩股哩股成品與「沒動過的 TTS 原音」訂的（docs/channels/audio-dropout-report.md）：
  Z 數位靜音：連續 ≥30ms 樣本值全為 0（開頭前 0.05 秒、片尾卡開始之後不算）。
  C 斷音：5ms 短時音量 ≥ −40 dBFS 在 10ms 內掉 ≥40 dB（字被切斷、接縫硬切；沒動過的 TTS 原音 0 次）。
  R 死寂起音：5ms 短時音量 ≤ −85 dBFS 在 10ms 內升 ≥35 dB（從數位靜音直接跳回人聲；原音 0 次）。
  N C2PA：輸入是 wav 時，data 裡夾著 Gemini 回應的 C2PA 憑證區塊（播出來是 0.16 秒 −8 dBFS 雜訊）。
  C／R 排除：片頭 0.3 秒（淡入區）、片尾卡開始前 0.05 秒起（招牌音撞擊）。
只警告：片頭留空（第一個字起音 < 0.25 秒，播放器常吃掉第一個字）。
註：字面上的「50ms 內 >20 dB」會把正常人聲也擋掉（沒動過的 TTS 原音每支有 93–164 處 50ms 內掉 >35 dB），所以改用上面量過的 C／R。"""
import json, os, subprocess, sys
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
args = sys.argv[1:]
def opt(name, default=None):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
FILE, END, JOUT = opt("--file"), opt("--end"), opt("--json")
QUIET = "--quiet" in args
if QUIET: args.remove("--quiet")
if not args and not FILE: sys.exit(__doc__)
slug = args[0] if args else None

SR, WIN = 48000, 0.005
ZERO_MS, START_SKIP, FADE_ZONE, STING_GUARD = 30, 0.05, 0.3, 0.05
C_FROM, C_DROP, R_FROM, R_RISE, K = -40.0, 40.0, -85.0, 35.0, 2  # K 個 5ms 窗＝10ms
LEAD_WARN = 0.25

def find_file():
    if FILE: return FILE if os.path.isabs(FILE) else os.path.join(ROOT, FILE)
    for p in (f"out/{slug}.mp4", f"out/web/{slug}/video.mp4", f"out/web/{slug}/{slug}.mp4"):
        if os.path.exists(os.path.join(ROOT, p)) and os.path.getsize(os.path.join(ROOT, p)) > 0: return os.path.join(ROOT, p)
    sys.exit(f"✖ 找不到 {slug} 的成品（out/{slug}.mp4 或 out/web/{slug}/）")

def end_sec():
    if END is not None: return float(END)
    p = os.path.join(ROOT, "videos", slug or "", "storyboard.json")
    if slug and os.path.exists(p):
        sb = json.load(open(p)); e = sb["scenes"][-1]
        return float(e.get("startSec", e["startFrame"] / sb.get("fps", 30)))
    return None

path = find_file()
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-map", "0:a:0", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, np.float32).reshape(-1, 2)
if not len(x): sys.exit(f"✖ {path} 沒有音軌")
dur = len(x) / SR
end = end_sec()
lim = min(end, dur) if end is not None else dur

# Z：數位靜音
z = np.all(x == 0, axis=1).astype(np.int8)
d = np.diff(np.concatenate([[0], z, [0]]))
zs, ze = np.where(d == 1)[0] / SR, np.where(d == -1)[0] / SR
issues = []
for a, b in zip(zs, ze):
    a2, b2 = max(a, START_SKIP), min(b, lim)
    if (b2 - a2) * 1000 >= ZERO_MS: issues.append({"t": round(float(a2), 3), "kind": "Z", "ms": round(float((b2 - a2) * 1000)), "msg": f"數位靜音 {((b2-a2)*1000):.0f}ms"})

# 5ms 短時音量
m = (x.astype(np.float64) ** 2).mean(axis=1); w = int(WIN * SR)
c = np.concatenate([[0], np.cumsum(m)]); idx = np.arange(0, len(m) - w, w)
db = np.maximum(10 * np.log10((c[idx + w] - c[idx]) / w + 1e-20), -120.0)
t = idx / SR
ok = (t >= FADE_ZONE) & (t < (lim - STING_GUARD))
a_, b_ = db[:-K], db[K:]
chop = ok[:-K] & (a_ >= C_FROM) & (a_ - b_ >= C_DROP)
rise = ok[:-K] & (a_ <= R_FROM) & (b_ - a_ >= R_RISE)
def collapse(mask, kind, fmt):
    last = -1
    for i in np.where(mask)[0]:
        if t[i] - last < 0.05: continue  # 同一處只記一次
        last = t[i]; issues.append({"t": round(float(t[i]), 3), "kind": kind, "msg": fmt(a_[i], b_[i])})
collapse(chop, "C", lambda p, q: f"斷音 {p:.0f}→{q:.0f} dBFS／10ms")
collapse(rise, "R", lambda p, q: f"死寂起音 {p:.0f}→{q:.0f} dBFS／10ms")
issues.sort(key=lambda r: r["t"])

# 片頭留空（只警告）
on = np.where(db > -40)[0]
onset = float(t[on[0]]) if len(on) else None
warns = []
if onset is not None and onset < LEAD_WARN: warns.append(f"片頭留空不足：第一個字起音 {onset:.2f} 秒（建議 ≥0.3 秒，片頭再淡入）")

# N：wav 的 data 區塊裡夾著 Gemini 的 C2PA 憑證區塊（會被當成 0.16 秒雜訊播出來）
if path.lower().endswith(".wav"):
    b = open(path, "rb").read(); k = b.find(b"C2PA", 44)
    if k >= 0 and b[k + 8:k + 16].find(b"jumb") >= 0: issues.append({"t": round((k - 44) / max(1, len(b) - 44) * dur, 3), "kind": "N", "msg": "PCM 裡夾著 C2PA 區塊（不是聲音），先過 voice-prep.py／insert-pauses.py"})
cnt = {k: sum(1 for r in issues if r["kind"] == k) for k in "ZCRN"}
first6 = [r for r in issues if r["t"] < 6]
res = {"file": os.path.relpath(path, ROOT), "durationSec": round(dur, 2), "endCardSec": end, "onsetSec": onset, "counts": cnt,
       "first6s": len(first6), "issues": issues, "warns": warns, "pass": not issues}
if JOUT: json.dump(res, open(JOUT if os.path.isabs(JOUT) else os.path.join(ROOT, JOUT), "w"), ensure_ascii=False, indent=1)
if not QUIET:
    for r in issues[:12]: print(f"  {r['kind']} {r['t']:7.3f}s  {r['msg']}")
    if len(issues) > 12: print(f"  …另 {len(issues) - 12} 處")
    for wmsg in warns: print("  ⚠ " + wmsg)
mark = "✔" if not issues else "✖"
print(f"{mark} audio-check {res['file']}：Z 數位靜音 {cnt['Z']}、C 斷音 {cnt['C']}、R 死寂起音 {cnt['R']}" + (f"、N C2PA {cnt['N']}" if cnt['N'] else "") + f"（前 6 秒 {len(first6)} 處）；起音 {onset if onset is None else round(onset, 2)} 秒"
      + (f"；片尾卡 {end:.2f} 秒起不查" if end is not None else ""))
sys.exit(0 if not issues else 1)
