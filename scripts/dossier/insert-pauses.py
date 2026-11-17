#!/usr/bin/env python3
"""哩股哩股：旁白段落間與句間補停頓（剪輯插靜音，只加不減；不重配音、不改念稿）。
用法：python3 scripts/dossier/insert-pauses.py <slug> [錄音 wav，預設 public/audio/<slug>/voice-api.wav] [--scene 0.7] [--sentence 0.3] [--out 路徑] [--scene-map s05=1.3 --nums 十一倍,十二月 --num-pad 0.4]
做法：scripts/fa.py（CTC 強制對齊，本機）找每幕起訖與幕內句末（。？！）前後字的時間，
在兩字之間「原本的靜音」裡找能量最低的一段、取中點切開，補靜音到目標長度；接縫各加 5ms 淡出／淡入。逗號不動。
輸出 <錄音>.paused.wav（預設 public/audio/<slug>/voice-api.paused.wav），並印出每處插了多少秒。"""
import json, os, subprocess, sys, wave
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
args = sys.argv[1:]
def opt(name, default):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
SCENE = float(opt("--scene", 0.7)); SENT = float(opt("--sentence", 0.3)); OUT = opt("--out", None)
SMAP = {a.split("=")[0]: float(a.split("=")[1]) for a in opt("--scene-map", "").split(",") if "=" in a}  # 個別段落停頓（幕id=秒，段落＝該幕結束到下一幕開口）
NUMS = [x for x in opt("--nums", "").split(",") if x]; NUMPAD = float(opt("--num-pad", 0.4))  # 重點數字前後補停頓（11/17 加）
if not args: sys.exit(__doc__)
slug = args[0]
rec = args[1] if len(args) > 1 else f"public/audio/{slug}/voice-api.wav"
OUT = OUT or rec.replace(".wav", ".paused.wav")
script = json.load(open(f"{ROOT}/videos/{slug}/script.json"))
scenes = [s for s in script["scenes"] if not s.get("silent")]
texts = [s.get("tts") or s["narration"] for s in scenes]
py = f"{ROOT}/.venv/bin/python" if os.path.exists(f"{ROOT}/.venv/bin/python") else "python3"
fa = json.loads(subprocess.run([py, f"{ROOT}/scripts/fa.py"], input=json.dumps([{"id": "rec", "file": rec, "text": "".join(texts)}]).encode(),
                               cwd=ROOT, capture_output=True, check=True).stdout)[0]
units = fa["units"]

w = wave.open(f"{ROOT}/{rec}"); sr, ch, sw, n = w.getframerate(), w.getnchannels(), w.getsampwidth(), w.getnframes()
assert sw == 2, "只支援 16-bit wav"
x = np.frombuffer(w.readframes(n), dtype=np.int16).reshape(-1, ch).astype(np.float32); w.close()
mono = np.abs(x).mean(axis=1)
win = int(sr * 0.01)
rms = np.sqrt(np.convolve(mono ** 2, np.ones(win) / win, mode="same"))

def cut_point(e, s):
    """e＝前一字結束、s＝後一字開始（秒）：回傳落在靜音裡的切點（樣本）。取兩者之間能量最低的連續一段的中點。"""
    a, b = int(e * sr), int(s * sr)
    if b - a < win: return (a + b) // 2
    seg = rms[a:b]; thr = max(seg.min() * 1.5, 10.0)
    quiet = seg <= thr
    # 找最長的連續安靜段
    best, cur, bs = (0, 0), 0, 0
    for i, q in enumerate(quiet):
        if q:
            if cur == 0: bs = i
            cur += 1
            if cur > best[1]: best = (bs, cur)
        else: cur = 0
    return a + best[0] + best[1] // 2

def silence_len(c, thr=330):
    """切點所在那段真正的靜音長度（秒）：從切點向兩側延伸到能量超過 −40 dBFS 為止。"""
    lo = hi = c
    while lo > 0 and rms[lo] < thr: lo -= 1
    while hi < len(rms) - 1 and rms[hi] < thr: hi += 1
    return (hi - lo) / sr

cuts = []  # (sample, insert_sec, label, gap)
want = {}  # 同一個切點只留最大的目標：(前一字 i) → (目標, 標籤, e, s)
def want_gap(ui, target, label, e, s):
    if ui not in want or want[ui][0] < target: want[ui] = (target, label, e, s)
off = 0
for k, t in enumerate(texts):
    us = [u for u in units if off <= u["i"] < off + len(t)]
    # 句末：。？！ 之後（幕內），取其前最後一字與其後第一字
    for p, chh in enumerate(t):
        if chh in "。？！?!" and p < len(t) - 1:
            before = [u for u in us if u["i"] < off + p]; after = [u for u in us if u["i"] > off + p]
            if before and after:
                e, s = before[-1]["end"], after[0]["start"]
                want_gap(before[-1]["i"], SENT, f"{scenes[k]['id']} 句末「{t[max(0,p-3):p+1]}」", e, s)
    if k + 1 < len(texts):
        nxt = [u for u in units if off + len(t) <= u["i"] < off + len(t) + len(texts[k + 1])]
        e, s = us[-1]["end"], nxt[0]["start"]
        want_gap(us[-1]["i"], SMAP.get(scenes[k]["id"], SCENE), f"{scenes[k]['id']}→{scenes[k+1]['id']} 段落", e, s)
    for ph in NUMS:  # 重點數字前後
        q = t.find(ph)
        while q >= 0:
            qe = q + len(ph)
            if q > 0 and t[q-1] not in "。？！?!":
                b4 = [u for u in us if u["i"] < off + q]; af = [u for u in us if u["i"] >= off + q]
                if b4 and af: want_gap(b4[-1]["i"], NUMPAD, f"{scenes[k]['id']} 數字前「{ph}」", b4[-1]["end"], af[0]["start"])
            if qe < len(t) and t[qe] not in "。？！?!嗎吧呢的了":
                b4 = [u for u in us if u["i"] < off + qe]; af = [u for u in us if u["i"] >= off + qe]
                if b4 and af: want_gap(b4[-1]["i"], NUMPAD, f"{scenes[k]['id']} 數字後「{ph}」", b4[-1]["end"], af[0]["start"])
            q = t.find(ph, qe)
    off += len(t)
for ui, (target, label, e, s_) in want.items():
    c = cut_point(e, s_); g = silence_len(c)
    if target - g > 0.005: cuts.append((c, target - g, label, g))
    else: print(f"  {label} 已有 {g:.2f} 秒（對齊間隔 {s_-e:.2f}），不動")

cuts.sort()
f5 = int(sr * 0.005)
pieces, prev = [], 0
for smp, ins, label, gap in cuts:
    seg = x[prev:smp].copy()
    if len(seg) > f5: seg[-f5:] *= np.linspace(1, 0, f5)[:, None]
    pieces.append(seg); pieces.append(np.zeros((int(round(ins * sr)), ch), np.float32)); prev = smp
    print(f"  +{ins:.2f} 秒  {label}  原間隔 {gap:.2f} → {gap+ins:.2f}（切點 {smp/sr:.3f} 秒）")
tail = x[prev:].copy()
if cuts and len(tail) > f5: tail[:f5] *= np.linspace(0, 1, f5)[:, None]
pieces.append(tail)
y = np.concatenate(pieces)
with wave.open(f"{ROOT}/{OUT}", "wb") as o:
    o.setnchannels(ch); o.setsampwidth(2); o.setframerate(sr); o.writeframes(np.clip(y, -32768, 32767).astype(np.int16).tobytes())
tot = sum(c[1] for c in cuts)
print(f"✔ {OUT}：{len(cuts)} 處、共加 {tot:.2f} 秒（{n/sr:.2f} → {len(y)/sr:.2f} 秒）；對齊信心 {fa['confidence']}")
