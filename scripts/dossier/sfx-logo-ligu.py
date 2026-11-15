#!/usr/bin/env python3
"""python3 scripts/dossier/sfx-logo-ligu.py <輸出.wav>  → 哩股哩股片尾招牌音（2026/11/15 所有頻道規則：片尾 LOGO 要有音效）。
風格：冷靜、國際新聞——低沉的定音撞擊＋銅鐘般的不成倍數泛音＋小調九和弦長尾；不熱鬧、不用噪音，只用正弦類音色，參數固定（每支片同一段＝頻道招牌音）。
時間對準 src/theme.ts 的 DOSSIER_END.f（片尾卡開始後第幾幀，30fps）：粒子匯聚 0–22（越來越密的細點）、L 實心 22、i 身 24、\ni 點蓋章 28→36（下滑音）、36＝撞擊（主音，全段最大聲）、第二圈衝擊波 40、字標 40/43/46/49、查到底 54、下一集 66。輸出 48 kHz 立體聲、3.6 秒，峰值 −6 dBFS，混音時再乘倍數。"""
import sys, wave
import numpy as np
SR, FPS, DUR = 48000, 30, 3.6
F = {"solid": 22, "stem": 24, "stamp": 28, "impact": 36, "ring2": 40, "name": [40, 43, 46, 49], "tag": 54, "next": 66}
n = int(SR * DUR); out = np.zeros(n)
t_of = lambda fr: fr / FPS
def add(sig, at):
    i = int(round(at * SR)); j = min(n, i + len(sig)); out[i:j] += sig[: j - i]
def env(L, a, d):
    t = np.arange(L) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def tone(f, L, a, d, g):
    t = np.arange(L) / SR; return g * np.sin(2 * np.pi * f * t) * env(L, a, d)
def glide(f0, f1, L, g, shape=2):
    t = np.arange(L) / SR; f = f0 * (f1 / f0) ** (t / t[-1]); ph = 2 * np.pi * np.cumsum(f) / SR
    return g * np.sin(ph) * (t / t[-1]) ** shape
rnd = np.random.default_rng(20261115)
# 1. 資料粒子匯聚（0–22 幀）：一串越來越密、音高往上的細點（像資料一筆一筆歸檔）＋底下一條很輕的上滑音
for k in range(26):
    fr = 2 + 20 * (k / 25) ** 0.7; f0 = 1500 + 1400 * (k / 25) + rnd.uniform(-60, 60)
    add(tone(f0, int(0.04 * SR), 0.0005, 0.01, 0.025 + 0.02 * k / 25), t_of(fr))
add(glide(220, 520, int(0.7 * SR), 0.05), t_of(1))
# 2. L 實心化（22）與 i 身升起（24）：兩聲低「托」
add(tone(150, int(0.12 * SR), 0.002, 0.04, 0.22), t_of(F["solid"])); add(tone(200, int(0.1 * SR), 0.002, 0.03, 0.14), t_of(F["stem"]))
# 3. i 點像印章壓下（28→36）：往下掉的滑音，越來越近
L = int((F["impact"] - F["stamp"]) / FPS * SR); add(glide(1300, 420, L, 0.12, 1.5), t_of(F["stamp"]))
# 4. 撞擊（36，主音，全段最大聲）：低頻定音（音高往下掉）＋銅鐘泛音＋D 小調九和弦長尾
L = int(2.4 * SR); t = np.arange(L) / SR
f = 40 + 75 * np.exp(-t / 0.05); thump = 1.0 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(L, 0.001, 0.34)
bell = sum(g * np.sin(2 * np.pi * 392 * r * t) * env(L, 0.001, d) for r, g, d in [(1, 0.34, 1.2), (2.76, 0.2, 0.7), (5.40, 0.11, 0.4), (8.93, 0.06, 0.22)])
chord = sum(0.10 * np.sin(2 * np.pi * fq * t) * env(L, 0.015, 1.3) for fq in (146.83, 220.0, 293.66, 349.23, 329.63))
hit = thump + bell + chord
for dly, g in ((0.11, 0.26), (0.23, 0.15), (0.37, 0.09)):
    k = int(dly * SR); hit[k:] += g * hit[: L - k]
add(hit, t_of(F["impact"]))
# 5. 第二圈衝擊波（40）：較輕的高一個八度鐘聲
add(sum(g * np.sin(2 * np.pi * 784 * r * np.arange(int(0.8 * SR)) / SR) * env(int(0.8 * SR), 0.001, d) for r, g, d in [(1, 0.08, 0.5), (2.76, 0.04, 0.25)]), t_of(F["ring2"]))
# 6. 字標逐字：輕點；｜查到底：一聲輕的
for fr in F["name"]: add(tone(2350, int(0.05 * SR), 0.0005, 0.012, 0.06), t_of(fr))
add(tone(1760, int(0.12 * SR), 0.002, 0.04, 0.05), t_of(F["tag"]))
# 7. 下一集：兩個音往上
add(tone(880, int(0.18 * SR), 0.004, 0.07, 0.08), t_of(F["next"])); add(tone(1174.66, int(0.3 * SR), 0.004, 0.1, 0.08), t_of(F["next"]) + 0.09)
fade = np.ones(n); fade[-int(0.25 * SR):] = np.linspace(1, 0, int(0.25 * SR)); out *= fade
out *= 10 ** (-6 / 20) / np.max(np.abs(out))
st = np.stack([out, out], 1); pcm = (st * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"✔ {sys.argv[1]}  {DUR}s；撞擊在 {t_of(F['impact']):.3f}s（片尾卡第 {F['impact']} 幀）")
