#!/usr/bin/env python3
"""CaffAIne 片尾招牌音（2026/11/15）：八位元／小機器人音色，溫暖不刺耳，全部用 numpy 合成（不用任何外部音檔、不加白噪音）。
用法：python3 scripts/caffaine/sfx-caffaine.py <輸出.wav>
- 時間全部讀 src/components/ai-iso/caffaineTimeline.json（畫面 CaffEnd.tsx 讀同一份）：撞擊音在 hits[].f 那一幀的開頭，和畫面震動同一幀。
- 結構（幀＝LOGO 動畫開始後第幾幀，30fps；v2：白卡杯動畫）：
    0       0.2 秒內抓耳朵：上揚掃頻＋亮的鐘聲
    2–18    白卡翻起：階梯式上升的「咻」
    16      落地：拍一下（hits land）
    18–30   一格格拼杯子：逐列的小嗒聲＋上升掃頻
    30      鎖定：低頻厚撞擊（hits lock）＋C 大調脈衝和弦＋掃描光的上滑音＋亮晶晶琶音
    38      蒸氣：往上的泡泡音；42／45 游標閃兩下
    44–59   C a f f n e：招牌旋律前六個音 C5 E5 G5 E5 C6 E6
    62      AI 藍色塊「啪」蓋上（hits stamp）：撞擊＋咔＋第七音 D6
    65      I 彈出：第八音 G6 拖長＋明亮收尾和弦
    70／73  標語「叮叮」；80 留言列投幣音
- 招牌旋律與音色參數固定，以後每支片都用同一段，不要改。輸出 48 kHz 立體聲 wav，峰值先正規化到 −3 dBFS，混音（mix-endsting.py）再調響度。
"""
import json, sys, wave
import numpy as np
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TL = json.loads((ROOT / "src/components/ai-iso/caffaineTimeline.json").read_text())
SR, FPS, DUR = 48000, float(TL["fps"]), 3.9
n_all = int(DUR * SR)
L = np.zeros(n_all); R = np.zeros(n_all)
fr = lambda n: n / FPS
rng = np.random.default_rng(20261115)

def add(sig, at, pan=0.0, gain=1.0):
    i = int(round(at * SR)); n = min(len(sig), n_all - i)
    if n <= 0: return
    a = (pan + 1) * np.pi / 4
    L[i:i + n] += sig[:n] * np.cos(a) * gain; R[i:i + n] += sig[:n] * np.sin(a) * gain

def env(n, a, d, shape=4.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-shape * np.maximum(0, t - a) / d)
    k = min(n, int(0.004 * SR)); e[-k:] *= np.linspace(1, 0, k)
    return e

def lowpass(x, fc):
    a = 1 - np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y

def pulse(f, n, duty=0.5, hmax=9, det=0.0):
    """柔和的脈衝波（前 hmax 個諧波、1/n 衰減）＝八位元電子音，但不刺耳"""
    t = np.arange(n) / SR
    s = np.zeros(n)
    for h in range(1, hmax + 1):
        if f * h > 7000: break
        s += np.sin(np.pi * h * duty) / h * np.sin(2 * np.pi * f * (1 + det) * h * t)
    return s * 1.4

def note(f, dur, a=0.004, d=None, duty=0.25, hmax=9, lp=4200, det=0.0):
    n = int(dur * SR)
    return lowpass(pulse(f, n, duty, hmax, det), lp) * env(n, a, d or dur)

SOFT = "--classic" not in sys.argv   # 2026/11/16 Andy：「聲音有點太大聲，稍微柔和點」→ 預設柔和版；--classic 是舊版
def thud(f0, f1, dur, d, tau=0.03):
    n = int(dur * SR); t = np.arange(n) / SR
    fb = f1 + (f0 - f1) * np.exp(-t / tau)
    return np.sin(2 * np.pi * np.cumsum(fb) / SR) * env(n, 0.006 if SOFT else 0.002, d, 3.5) * (0.62 if SOFT else 1)   # 柔和：低頻撞擊起音放慢、音量收

def bell(f, dur, d):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.08) + 0.2 * np.sin(2 * np.pi * f * 4.1 * t) * np.exp(-t / 0.04)) * env(n, 0.003 if SOFT else 0.002, d, 4.0) * (0.78 if SOFT else 1)   # 柔和：鐘聲高頻稍收


# 0. 0.2 秒內抓耳朵：上揚掃頻＋亮的鐘聲
n = int(0.17 * SR); t = np.arange(n) / SR
fsw = 320 * (2600 / 320) ** (t / 0.17); sw = np.sin(2 * np.pi * np.cumsum(fsw) / SR) * env(n, 0.03 if SOFT else 0.01, 0.17, 2.0)   # 柔和：掃頻起音放慢
add(sw, 0.0, gain=0.35)
add(bell(2093.0, 0.8, 0.5), 0.0, pan=-0.15, gain=0.34); add(bell(2637.0, 0.6, 0.4), 0.035, pan=0.15, gain=0.24)

# 1. 白卡翻起 f2–f18：階梯式上升的「咻」
fl = TL["flip"]; a0, a1 = fr(fl[0]), fr(fl[1]); steps = int((a1 - a0) / 0.02)
for k in range(steps):
    u = k / steps; f = 240 * 2 ** (u * 3.2)
    add(note(f, 0.035, a=0.002, d=0.03, duty=0.5, lp=2600), a0 + k * 0.02, pan=-0.5 + u, gain=0.05 + 0.07 * u)

# 2. 拼杯子 f18–f30：逐列小嗒聲＋上升掃頻
cs, st = TL["cupStart"], TL["cupRowStep"]
PENTA = [1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0]
for r in range(11):
    add(note(PENTA[r % 6], 0.04, a=0.001, d=0.03, duty=0.5, lp=3800), fr(cs + r * st), pan=-0.5 + r * 0.1, gain=0.06)
b0, b1 = fr(cs), fr(TL["lock"]); n = int((b1 - b0) * SR); t = np.arange(n) / SR; u = t / (b1 - b0)
fr_ = 220 * (1700 / 220) ** (u ** 1.5); rs = np.sin(2 * np.pi * np.cumsum(fr_) / SR) * (u ** 2.2); rs[-int(0.003 * SR):] = 0
add(rs, b0, gain=0.10)

# 3. 撞擊（對準 hits 的幀）：落地、鎖定、蓋章
hit = {h["kind"]: h for h in TL["hits"]}
at = fr(hit["land"]["f"])
add(thud(150, 70, 0.25, 0.18), at, gain=0.7); add(thud(900, 320, 0.06, 0.04, tau=0.02), at, gain=0.2)
at = fr(hit["lock"]["f"])
add(thud(150, 38, 1.1, 0.9, tau=0.045), at, gain=1.3)                           # 低頻厚度
add(thud(70, 48, 0.9, 0.7, tau=0.2), at, gain=0.6)
add(thud(430, 120, 0.12, 0.08, tau=0.015), at, gain=0.4)
for fq in [261.63, 329.63, 392.0, 523.25, 587.33]:                              # C 大調九和弦的脈衝音
    for det, pan in ((-0.0015, -0.3), (0.0015, 0.3)):
        add(note(fq, 1.5, a=0.006, d=1.1, duty=0.5, hmax=7, lp=2800, det=det), at, pan=pan, gain=0.17)
sa, sb = fr(TL["scan"][0]), fr(TL["scan"][1]); n = int((sb - sa) * SR); t = np.arange(n) / SR
fs_ = 500 * (2800 / 500) ** (t / (sb - sa)); sc = np.sin(2 * np.pi * np.cumsum(fs_) / SR) * env(n, 0.02, sb - sa, 2.5) * (1 + 0.25 * np.sin(2 * np.pi * 28 * t))
add(sc, sa, gain=0.16)                                                          # 掃描光
for j, fq in enumerate([1046.5, 1318.51, 1567.98, 2093.0, 2637.0]):
    add(note(fq, 0.2, a=0.002, d=0.15, duty=0.25, lp=5600), at + 0.02 + j * 0.04, pan=-0.4 + 0.2 * j, gain=0.17)
at = fr(hit["stamp"]["f"])
add(thud(220, 80, 0.4, 0.3, tau=0.02), at, gain=1.0); add(thud(1500, 300, 0.05, 0.03, tau=0.012), at, gain=0.45)

# 4. 蒸氣泡泡、游標閃兩下
a0 = fr(TL["steamStart"]); n = int(0.42 * SR); t = np.arange(n) / SR
f = 600 * (1700 / 600) ** (t / 0.42); add(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.04, 0.36, 3.0), a0, gain=0.05)
for fm in (TL["cursor"][0], TL["cursor"][0] + 6):
    add(note(1318.51, 0.05, a=0.002, d=0.04, duty=0.5, lp=3500), fr(fm), gain=0.09)

# 5. 招牌旋律八音（固定）：前六個對準 C a f f n e，第七個是 AI 蓋章，第八個是 I 彈出（拖長＋收尾和弦）
NOTES = TL["notes"]
for i, (fq, fm) in enumerate(zip(NOTES, TL["noteFrames"])):
    at = fr(fm); bright = i >= 6; last = i == 7
    dur = 1.5 if last else (0.4 if bright else 0.2); g = 0.40 if bright else 0.30
    pre = note(fq * 0.944, 0.016, a=0.001, d=0.012, duty=0.5, lp=3600)
    add(pre, at - 0.002, pan=-0.35 + 0.1 * i, gain=g * 0.6)
    add(note(fq, dur, a=0.003, d=dur * (0.9 if last else 0.75), duty=0.25, lp=4800, det=-0.001), at, pan=-0.35 + 0.1 * i, gain=g)
    add(note(fq, dur, a=0.003, d=dur * (0.9 if last else 0.75), duty=0.5, hmax=5, lp=3600, det=0.001), at, pan=-0.35 + 0.1 * i, gain=g * 0.55)
    if bright: add(note(fq * 2, dur * 0.7, a=0.003, d=dur * 0.5, duty=0.5, hmax=3, lp=6200), at, gain=0.18)
    if i % 2 == 0 and not bright: add(note(fq / 2, 0.16, a=0.004, d=0.12, duty=0.5, hmax=4, lp=900), at, gain=0.16)
at = fr(TL["noteFrames"][7])
for fq in [523.25, 659.25, 783.99, 1174.66]:                                    # 明亮的收尾和弦 Cadd9
    add(note(fq, 1.6, a=0.006, d=1.2, duty=0.5, hmax=7, lp=3200, det=-0.0012), at, pan=-0.25, gain=0.14)
    add(note(fq, 1.6, a=0.006, d=1.2, duty=0.5, hmax=7, lp=3200, det=0.0012), at, pan=0.25, gain=0.14)
for j, fq in enumerate([2093.0, 2637.0, 3136.0]): add(bell(fq, 0.7, 0.5), at + 0.05 + j * 0.06, gain=0.1)

# 6. 標語叮叮、留言列投幣音
add(bell(1567.98, 0.5, 0.35), fr(TL["tagline"]), pan=-0.2, gain=0.28)
add(bell(2093.0, 0.6, 0.45), fr(TL["tagline2"]), pan=0.2, gain=0.28)
k0 = fr(TL["keyword"])
add(note(987.77, 0.07, a=0.002, d=0.05, duty=0.5, lp=4200), k0, gain=0.18)
add(note(1318.51, 0.2, a=0.002, d=0.15, duty=0.5, lp=4200), k0 + 0.07, gain=0.18)

if SOFT:  # 整體再過兩段 4.6 kHz 低通（12 dB/oct）：去掉尖的泛音，旋律、時間點不變
    L = lowpass(lowpass(L, 4600), 4600); R = lowpass(lowpass(R, 4600), 4600)
peak = max(np.abs(L).max(), np.abs(R).max()); sc = 10 ** (-3 / 20) / peak
data = np.stack([L * sc, R * sc], axis=1)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(data, -1, 1) * 32767).astype("<i2").tobytes())
print(f"✔ {sys.argv[1]}：{DUR} 秒、48 kHz 立體聲；撞擊音幀 " + "、".join(str(h["f"]) for h in TL["hits"]) + "；旋律音幀 " + "、".join(map(str, TL["noteFrames"])))
