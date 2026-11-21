#!/usr/bin/env python3
"""哩股哩股：旁白段落間與句間補停頓（剪輯插靜音，只加不減；不重配音、不改念稿）。
用法：python3 scripts/dossier/insert-pauses.py <slug> [錄音 wav，預設 public/audio/<slug>/voice-api.wav] [--scene 0.7] [--sentence 0.3] [--out 路徑] [--scene-map s05=1.3 --nums 十一倍,十二月 --num-pad 0.4]
做法：scripts/fa.py（CTC 強制對齊，本機）找每幕起訖與幕內句末（。？！）前後字的時間，
在兩字之間「原本的靜音」裡找能量最低的一段、取中點切開，補靜音到目標長度。逗號不動。
輸出 <錄音>.paused.wav（預設 public/audio/<slug>/voice-api.paused.wav），並印出每處插了多少秒。
2026/11/21 起（音訊不斷續，docs/channels/audio-continuity-rule.md）：
  - 補的不是純 0，是照這條錄音量到的底噪（−90～−60 dBFS，固定 seed）；接縫改等功率交叉淡化 --xfade 15ms（舊版 5ms 淡出淡入接純 0）。
  - 切點那 10ms 要 ≤ −50 dBFS、而且連續安靜 ≥30ms，不然就是兩字連在一起（常見於 --nums 的數字前後）：跳過、印 ⚠，不硬切（--force-cut 才照舊切）。
  - 錄音尾巴若夾著 Gemini 回應裡的 C2PA 憑證區塊（舊版 voice-take 當成聲音存進來，約 0.16 秒 −8 dBFS 雜訊），先剪掉。
  - 片頭留空 --lead 0.3：第一個字起音不到 0.3 秒就在前面補底噪，檔頭 25ms 淡入、檔尾 20ms 淡出（--lead 0 不補）。"""
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
XF = float(opt("--xfade", 15)) / 1000; LEAD = float(opt("--lead", 0.3)); FORCE = "--force-cut" in args
if FORCE: args.remove("--force-cut")
MINQ = float(opt("--min-quiet", 30)) / 1000; QDB = float(opt("--quiet-db", -50)); SEEK = float(opt("--seek", 0)) / 1000  # 切點門檻（11/22 加）：--seek 80＝找不到安靜點時，在句界 ±80ms 取能量最低的 10ms 窗口
SMAX = float(opt("--scene-max", 0)); NUMS = [x for x in opt("--nums", "").split(",") if x]; NUMPAD = float(opt("--num-pad", 0.4))  # 重點數字前後補停頓（11/17 加）
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
pcm = w.readframes(n); w.close()
# 舊版 voice-take 把 Gemini 回的整個 WAV（含 RIFF 檔頭與尾端 C2PA 區塊）當成 PCM：尾端那段要剪掉，不然成片在旁白最後有 0.16 秒雜訊
k = pcm.find(b"C2PA", max(0, len(pcm) - (1 << 16)))
if k >= 0 and pcm[k + 8:k + 16].find(b"jumb") >= 0:
    print(f"  剪掉尾端 C2PA 區塊 {len(pcm) - k} bytes（{(len(pcm) - k) / (sr * ch * 2):.3f} 秒，不是聲音）"); pcm = pcm[:k - (k % (ch * 2))]
x = np.frombuffer(pcm, dtype=np.int16).reshape(-1, ch).astype(np.float32); n = len(x)
mono = np.abs(x).mean(axis=1)
win = int(sr * 0.01)
rms = np.sqrt(np.convolve(mono ** 2, np.ones(win) / win, mode="same"))

QMAX = 32768 * 10 ** (QDB / 20)  # 切點要 ≤ --quiet-db（預設 −50 dBFS）
_q = rms[(rms > 0) & (rms < QMAX)]
FLOOR = float(np.clip(np.median(_q) if len(_q) else 3.0, 32768 * 10 ** (-90 / 20), 32768 * 10 ** (-60 / 20)))
_rng = np.random.default_rng(20261121)
def room(nsmp):
    """底噪：白噪音壓暗（3kHz 以上漸弱），RMS 調到這條錄音安靜段的中位數（不是純 0，接縫才不會像斷電）。"""
    if nsmp <= 0: return np.zeros((0, ch), np.float32)
    g = _rng.standard_normal((nsmp + 256, ch))
    from numpy.fft import rfft, irfft
    f = rfft(g, axis=0); fr = np.arange(f.shape[0]) / (2 * f.shape[0]) * sr
    f *= (1 / np.sqrt(1 + (fr / 3000) ** 2))[:, None]  # 偏暗的底噪
    y = irfft(f, n=len(g), axis=0)[128:128 + nsmp]
    return (y / (np.sqrt((y ** 2).mean()) + 1e-9) * FLOOR).astype(np.float32)
def xjoin(a, b, nx):
    """等功率交叉淡化接起 a、b（重疊 nx 個樣本，總長少 nx）。"""
    nx = min(nx, len(a), len(b))
    if nx <= 0: return np.concatenate([a, b])
    t = np.linspace(0, np.pi / 2, nx, dtype=np.float32)[:, None]
    return np.concatenate([a[:-nx], a[-nx:] * np.cos(t) + b[:nx] * np.sin(t), b[nx:]])

def quiet_cut(e, s):
    """在 e−0.06～s+0.06 秒裡找 ≤ −50 dBFS 的最長連續段；不到 30ms 回傳 None（兩字連著念，不能切）。"""
    a, b = max(0, int((e - 0.06) * sr)), min(len(rms) - 1, int((s + 0.06) * sr))
    if b <= a: return None
    q = rms[a:b] <= QMAX
    best, cur, bs = (0, 0), 0, 0
    for i, v in enumerate(q):
        if v:
            if cur == 0: bs = i
            cur += 1
            if cur > best[1]: best = (bs, cur)
        else: cur = 0
    if best[1] < int(MINQ * sr):
        if SEEK > 0:  # 沒有夠長的安靜：句界 ±SEEK 內能量最低的 10ms 窗口
            a2, b2 = max(0, int((e - SEEK) * sr)), min(len(rms) - 1, int((s + SEEK) * sr))
            if b2 > a2: return a2 + int(np.argmin(rms[a2:b2]))
        return None
    seg = rms[a + best[0]:a + best[0] + best[1]]
    # 安靜段裡最低的那一點附近（避開邊緣 10ms）
    m = int(0.01 * sr); inner = seg[m:-m] if len(seg) > 2 * m + 1 else seg
    return a + best[0] + (m if len(seg) > 2 * m + 1 else 0) + int(np.argmin(inner))

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
skipped = []
for ui, (target, label, e, s_) in want.items():
    c = quiet_cut(e, s_)
    if c is None:
        if not FORCE:
            skipped.append(label); print(f"  ⚠ 跳過 {label}：兩字之間沒有 ≥30ms 的安靜（≤ −50 dBFS），硬切會把字切斷（要硬切加 --force-cut）"); continue
        c = cut_point(e, s_)
    g = silence_len(c)
    if target - g > 0.005: cuts.append((c, target - g, label, g))
    elif SMAX and "段落" in label and g - SMAX > 0.005: cuts.append((c, SMAX - g, label, g))  # 超過上限：剪掉多出來的靜音
    else: print(f"  {label} 已有 {g:.2f} 秒（對齊間隔 {s_-e:.2f}），不動")

cuts.sort()
nx = int(sr * XF)
y, prev, splice = np.zeros((0, ch), np.float32), 0, False
def put(seg):
    """接上一段原錄音：前一個動作是插底噪／剪靜音時用交叉淡化接，否則直接接（原本就連續）。"""
    global y, splice
    y = xjoin(y, seg, nx) if (splice and len(y)) else np.concatenate([y, seg]); splice = False
for smp, ins, label, gap in cuts:
    if ins < 0:  # 剪靜音：切點兩側各去掉一半（都在靜音內），交叉淡化接起（重疊的 nx 也算在剪掉的長度裡）
        tot = max(0, int(round(-ins * sr)) - nx); h1 = tot // 2; h2 = tot - h1
        put(x[prev:smp - h1]); prev = smp + h2; splice = True
        print(f"  {ins:.2f} 秒  {label}  原間隔 {gap:.2f} → {gap+ins:.2f}（剪）"); continue
    put(x[prev:smp])
    y = xjoin(y, room(int(round(ins * sr)) + 2 * nx), nx); prev = smp; splice = True  # 底噪多做 2×nx，兩個接縫各重疊掉一份
    print(f"  +{ins:.2f} 秒  {label}  原間隔 {gap:.2f} → {gap+ins:.2f}（切點 {smp/sr:.3f} 秒）")
put(x[prev:])
lead = 0.0
if LEAD > 0 and units and units[0]["start"] < LEAD:
    lead = LEAD - units[0]["start"]; y = xjoin(room(int(round(lead * sr)) + nx), y, nx)
    print(f"  片頭補底噪 {lead:.2f} 秒（首字起音 {units[0]['start']:.2f} → {LEAD:.2f} 秒）")
fi, fo = int(sr * 0.025), int(sr * 0.02)
y[:fi] *= np.sin(np.linspace(0, np.pi / 2, fi, dtype=np.float32))[:, None]; y[-fo:] *= np.cos(np.linspace(0, np.pi / 2, fo, dtype=np.float32))[:, None]
with wave.open(f"{ROOT}/{OUT}", "wb") as o:
    o.setnchannels(ch); o.setsampwidth(2); o.setframerate(sr); o.writeframes(np.clip(y, -32768, 32767).astype(np.int16).tobytes())
tot = sum(c[1] for c in cuts)  # 含負值（剪掉）
print(f"✔ {OUT}：{len(cuts)} 處、共加 {tot:.2f} 秒（{n/sr:.2f} → {len(y)/sr:.2f} 秒）；對齊信心 {fa['confidence']}；底噪 {20*np.log10(FLOOR/32768):.0f} dBFS、接縫交叉淡化 {XF*1000:.0f}ms"
      + (f"；片頭補 {lead:.2f} 秒" if lead else "") + (f"；跳過 {len(skipped)} 處連音" if skipped else ""))
