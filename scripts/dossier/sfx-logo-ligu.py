#!/usr/bin/env python3
"""python3 scripts/dossier/sfx-logo-ligu.py <輸出.wav>  → 哩股哩股片尾招牌音（2026/11/15 所有頻道規則：片尾 LOGO 要有音效）。
風格：冷靜、國際新聞——低沉的定音撞擊＋銅鐘般的不成倍數泛音＋小調九和弦長尾；不熱鬧、不用噪音，只用正弦類音色，參數固定（每支片同一段＝頻道招牌音）。
時間對準 src/theme.ts 的 DOSSIER_END.f（片尾卡開始後第幾幀，30fps）：L 豎畫 2、i 身 10（輕「托」）、i 點落下 16→28（上滑音）、
28＝撞擊（主音，全段最大聲）、字標逐字 30/33/36/39（輕點）、下一集 54（兩個音往上）。輸出 48 kHz 立體聲、3.4 秒，峰值 −6 dBFS，混音時再乘倍數。"""
import sys, wave
import numpy as np
SR, FPS, DUR = 48000, 30, 3.4
F = {"lv": 2, "stem": 10, "drop": 16, "impact": 28, "name": [30, 33, 36, 39], "next": 54}
n = int(SR * DUR); out = np.zeros(n)
t_of = lambda fr: fr / FPS
def add(sig, at):
    i = int(round(at * SR)); j = min(n, i + len(sig)); out[i:j] += sig[: j - i]
def env(L, a, d):
    t = np.arange(L) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def tone(f, L, a, d, g):
    t = np.arange(L) / SR; return g * np.sin(2 * np.pi * f * t) * env(L, a, d)
def glide(f0, f1, L, g):
    t = np.arange(L) / SR; f = f0 * (f1 / f0) ** (t / t[-1]); ph = 2 * np.pi * np.cumsum(f) / SR
    return g * np.sin(ph) * (t / t[-1]) ** 2
# 1. L 與 i 身就位：很輕的低音「托」
for fr in (F["lv"], F["stem"]): add(tone(180, int(0.08 * SR), 0.002, 0.025, 0.12), t_of(fr))
# 2. i 點落下：上滑音（越來越近）
L = int((F["impact"] - F["drop"]) / FPS * SR); add(glide(320, 960, L, 0.10), t_of(F["drop"]))
# 3. 撞擊（主音）：低頻定音（音高往下掉）＋銅鐘泛音＋小調九和弦長尾
L = int(2.6 * SR); t = np.arange(L) / SR
f = 42 + 70 * np.exp(-t / 0.05); thump = 0.9 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(L, 0.001, 0.32)
bell = sum(g * np.sin(2 * np.pi * 392 * r * t) * env(L, 0.001, d) for r, g, d in [(1, 0.32, 1.2), (2.76, 0.18, 0.7), (5.40, 0.10, 0.4), (8.93, 0.05, 0.22)])
chord = sum(0.10 * np.sin(2 * np.pi * fq * t) * env(L, 0.015, 1.4) for fq in (146.83, 220.0, 293.66, 349.23, 329.63))
hit = thump + bell + chord
for dly, g in ((0.11, 0.28), (0.23, 0.17), (0.37, 0.10)):   # 簡單的回音尾巴（不是噪音殘響）
    k = int(dly * SR); hit[k:] += g * hit[: L - k]
add(hit, t_of(F["impact"]))
# 4. 字標逐字：輕點
for fr in F["name"]: add(tone(2350, int(0.05 * SR), 0.0005, 0.012, 0.07), t_of(fr))
# 5. 下一集：兩個音往上
add(tone(880, int(0.18 * SR), 0.004, 0.07, 0.09), t_of(F["next"])); add(tone(1174.66, int(0.3 * SR), 0.004, 0.1, 0.09), t_of(F["next"]) + 0.09)
fade = np.ones(n); fade[-int(0.25 * SR):] = np.linspace(1, 0, int(0.25 * SR)); out *= fade
out *= 10 ** (-6 / 20) / np.max(np.abs(out))
st = np.stack([out, out], 1); pcm = (st * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"✔ {sys.argv[1]}  {DUR}s；撞擊在 {t_of(F['impact']):.3f}s（片尾卡第 {F['impact']} 幀）")
