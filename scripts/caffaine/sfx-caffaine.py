#!/usr/bin/env python3
"""CaffAIne 片尾招牌音（2026/11/15）：八位元／小機器人音色，溫暖不刺耳，全部用 numpy 合成（不用任何外部音檔、不加白噪音）。
用法：python3 scripts/caffaine/sfx-caffaine.py <輸出.wav>
- 時間全部讀 src/components/ai-iso/caffaineTimeline.json（畫面 CaffEnd.tsx 讀同一份）：撞擊音在 hits[].f 那一幀的開頭，和畫面震動同一幀。
- 結構（幀＝片尾卡開始後第幾幀，30fps）：
    0–24    方塊飛入：階梯式上升的「咻」＋方塊到位的小嗒聲（時間取自方塊到位幀）
    18      拼合「啵」＋輕撞擊（hits close）
    26      鎖定：重撞擊（音高往下掉的低音）＋C 大調脈衝和弦＋往上的亮晶晶琶音（hits lock）
    31      回彈：小撞擊（hits rebound）
    32–41   蒸氣：輕輕往上滑的泡泡音
    36–57   「C a f f A I n e」八個字母一字一音＝固定招牌旋律 C5 E5 G5 E5 C6 E6 D6 G6（AI 兩字較亮較長，e 收尾拖長）
    62／65  標語「叮叮」
    74      留言列：一個小小的投幣音
- 招牌旋律與音色參數固定，以後每支片都用同一段，不要改。輸出 48 kHz 立體聲 wav，峰值先正規化到 −3 dBFS，混音（mix-endsting.py）再調響度。
"""
import json, sys, wave
import numpy as np
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TL = json.loads((ROOT / "src/components/ai-iso/caffaineTimeline.json").read_text())
SR, FPS, DUR = 48000, float(TL["fps"]), 3.6
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

def thud(f0, f1, dur, d, tau=0.03):
    n = int(dur * SR); t = np.arange(n) / SR
    fb = f1 + (f0 - f1) * np.exp(-t / tau)
    return np.sin(2 * np.pi * np.cumsum(fb) / SR) * env(n, 0.002, d, 3.5)

def bell(f, dur, d):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.08) + 0.2 * np.sin(2 * np.pi * f * 4.1 * t) * np.exp(-t / 0.04)) * env(n, 0.002, d, 4.0)

# 1. 飛入「咻」：階梯式上升（每 25 ms 一階、半音），越接近鎖定越大聲；到位的小嗒聲取自方塊到位幀
fa = TL["frameArrive"]; ca = TL["cupArrive"]
t0, t1 = 0.0, fr(ca[1])
steps = int((t1 - t0) / 0.025)
for k in range(steps):
    u = k / steps; f = 196 * 2 ** (u * 3.6)
    add(note(f, 0.04, a=0.002, d=0.03, duty=0.5, lp=2800), t0 + k * 0.025, pan=-0.6 + 1.2 * u, gain=0.05 + 0.1 * u * u)
PENTA = [1568.0, 1760.0, 2093.0, 2349.0, 2637.0]
for k in range(14):
    at = fr(fa[0] + (ca[1] - fa[0]) * (k / 13.0))
    add(note(PENTA[k % 5], 0.035, a=0.001, d=0.03, duty=0.5, lp=3600), at, pan=rng.uniform(-0.6, 0.6), gain=0.05)

# 2. 撞擊（對準 hits 的幀）
hit = {h["kind"]: h for h in TL["hits"]}
c = hit["close"]; at = fr(c["f"])
add(thud(120, 62, 0.22, 0.16), at, gain=0.55 * c["amp"] / 0.35 * 0.6)
add(thud(900, 320, 0.07, 0.05, tau=0.02), at, gain=0.22)                       # 啵
l = hit["lock"]; at = fr(l["f"])
add(thud(135, 44, 0.9, 0.7, tau=0.04), at, gain=1.1)                            # 重撞擊：低音往下掉
add(thud(420, 120, 0.12, 0.08, tau=0.015), at, gain=0.35)                       # 撞擊的「咚」邊
for j, fq in enumerate([261.63, 329.63, 392.0, 523.25]):                        # C 大調脈衝和弦
    add(note(fq, 1.3, a=0.006, d=1.0, duty=0.5, hmax=7, lp=2600, det=-0.0015), at, pan=-0.3, gain=0.2)
    add(note(fq, 1.3, a=0.006, d=1.0, duty=0.5, hmax=7, lp=2600, det=+0.0015), at, pan=0.3, gain=0.2)
for j, fq in enumerate([1046.5, 1318.51, 1567.98, 2093.0]):                     # 亮晶晶往上
    add(note(fq, 0.18, a=0.002, d=0.14, duty=0.25, lp=5200), at + 0.02 + j * 0.035, pan=-0.3 + 0.2 * j, gain=0.17)
r = hit["rebound"]; at = fr(r["f"])
add(thud(105, 55, 0.3, 0.2), at, gain=0.9)
add(note(784.0, 0.12, a=0.003, d=0.09, duty=0.5, lp=3000), at, gain=0.1)

# 3. 蒸氣：往上滑的泡泡音（很輕）
a0 = fr(TL["steamStart"] + 2); n = int(0.36 * SR); t = np.arange(n) / SR
f = 600 * (1500 / 600) ** (t / 0.36); sg = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.03, 0.3, 3.0)
add(sg, a0, gain=0.05)

# 4. 八個字母＝招牌旋律（固定）
NOTES = TL["notes"]
for i, (fq, fm) in enumerate(zip(NOTES, TL["letters"])):
    at = fr(fm); ai = i in (4, 5); last = i == 7
    dur = 1.3 if last else (0.34 if ai else 0.2)
    g = 0.30 if not ai else 0.38
    if last: g = 0.40
    pre = note(fq * 0.944, 0.016, a=0.001, d=0.012, duty=0.5, lp=3600)          # 起音前一個半音的小滑音，像八位元「嗶」
    add(pre, at - 0.002, pan=-0.35 + 0.1 * i, gain=g * 0.6)
    add(note(fq, dur, a=0.003, d=dur * (0.9 if last else 0.75), duty=0.25, lp=4600, det=-0.001), at, pan=-0.35 + 0.1 * i, gain=g)
    add(note(fq, dur, a=0.003, d=dur * (0.9 if last else 0.75), duty=0.5, hmax=5, lp=3600, det=0.001), at, pan=-0.35 + 0.1 * i, gain=g * 0.55)
    if ai or last: add(note(fq * 2, dur * 0.7, a=0.003, d=dur * 0.5, duty=0.5, hmax=3, lp=6000), at, gain=0.16)   # AI 與收尾的字再疊高八度＝最亮
    if i % 2 == 0 and not ai and not last: add(note(fq / 2, 0.16, a=0.004, d=0.12, duty=0.5, hmax=4, lp=900), at, gain=0.16)  # 底下一個很輕的低八度，旋律比較厚

# 5. 標語叮叮、留言列投幣音
add(bell(1567.98, 0.5, 0.35), fr(TL["tagline"]), pan=-0.2, gain=0.28)
add(bell(2093.0, 0.6, 0.45), fr(TL["tagline2"]), pan=0.2, gain=0.28)
k0 = fr(TL["keyword"])
add(note(987.77, 0.07, a=0.002, d=0.05, duty=0.5, lp=4200), k0, gain=0.18)
add(note(1318.51, 0.2, a=0.002, d=0.15, duty=0.5, lp=4200), k0 + 0.07, gain=0.18)

peak = max(np.abs(L).max(), np.abs(R).max()); sc = 10 ** (-3 / 20) / peak
data = np.stack([L * sc, R * sc], axis=1)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(data, -1, 1) * 32767).astype("<i2").tobytes())
print(f"✔ {sys.argv[1]}：{DUR} 秒、48 kHz 立體聲；撞擊音幀 " + "、".join(str(h["f"]) for h in TL["hits"]) + "；字母音幀 " + "、".join(map(str, TL["letters"])))
