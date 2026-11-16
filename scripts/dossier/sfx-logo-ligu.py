#!/usr/bin/env python3
"""python3 scripts/dossier/sfx-logo-ligu.py <輸出.wav>  → 哩股哩股片尾招牌音（固定一套，每集都用同一段；使用者 2026/11/15「依據頻道風格進行設計」「以後都會統一」）。
風格：國際新聞片頭的氣勢——定音鼓漸強＋上升的銅管般音墊，查證章蓋下那一幀＝定音鼓重擊＋低頻＋銅鐘泛音＋D 小調九和弦長尾；短、有記憶點。
只用正弦類音色（加法合成），不加噪音；參數與亂數 seed 固定。時間對準 src/theme.ts 的 DOSSIER_END.f（片尾卡第幾幀，30fps）：
各地新聞點脈衝 0–14（高音輕鈴）、定音鼓漸強 4/9/13/16/19/21、音墊 4→36 漸強、22 L 實心、24 i 身、28→36 章壓下（上滑弦音）、
36 撞擊（全段最大聲）、41 第二圈震波（高音鐘）、40/43/46/49 字標、54 查到底、66 下一集。輸出 48 kHz 立體聲 3.6 秒、峰值 −6 dBFS（混音時乘倍數）。"""
import sys, wave
import numpy as np
SR, FPS, DUR = 48000, 30, 3.6
F = {"solid": 22, "stem": 24, "stamp": 28, "impact": 36, "ring2": 41, "name": [40, 43, 46, 49], "tag": 54, "next": 66}
CITY = [k * 1.1 for k in range(12)]   # 和 FRAGS 的 d 大致對齊（畫面上是 k*1.1＋亂數 0–2）
n = int(SR * DUR); out = np.zeros(n)
t_of = lambda fr: fr / FPS
def add(sig, at):
    i = int(round(at * SR)); j = min(n, i + len(sig)); out[i:j] += sig[: j - i]
def env(L, a, d):
    t = np.arange(L) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def tone(f, L, a, d, g):
    t = np.arange(L) / SR; return g * np.sin(2 * np.pi * f * t) * env(L, a, d)
def timpani(f0, g, d=0.5, L=1.2):   # 定音鼓：基音略往下掉＋不成倍數的鼓面泛音
    L = int(L * SR); t = np.arange(L) / SR; f = f0 * (1 + 0.12 * np.exp(-t / 0.03))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return g * (np.sin(ph) * env(L, 0.002, d) + 0.5 * np.sin(1.5 * ph) * env(L, 0.002, d * 0.6) + 0.3 * np.sin(1.99 * ph) * env(L, 0.002, d * 0.4))
def brass(freqs, L, a, d, g):       # 銅管般音墊：每個音 1–6 次泛音（1/h）
    t = np.arange(L) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)
    return g * sum(sum(np.sin(2 * np.pi * fq * h * t) / h for h in range(1, 7)) for fq in freqs) * e / len(freqs)
# 1. 世界各地新聞點脈衝：高音輕鈴
for k, fr in enumerate(CITY): add(tone(1760 + 120 * (k % 4), int(0.12 * SR), 0.001, 0.04, 0.03), t_of(fr))
# 2. 定音鼓漸強（碎片陸續到）
for fr, g in zip((4, 9, 13, 16, 19, 21), (0.12, 0.16, 0.2, 0.25, 0.3, 0.36)): add(timpani(73.42, g, 0.25, 0.6), t_of(fr))
# 3. 上升音墊：D 小調（D3 A3 F4）從 4 幀漸強到 36 幀；最後 8 幀上面加一條上滑弦音 A4→D5
L = int((F["impact"] - 4) / FPS * SR); t = np.arange(L) / SR
pad = brass((146.83, 220.0, 349.23), L, 0.05, 99, 0.22) * (t / t[-1]) ** 2
add(pad, t_of(4))
L2 = int((F["impact"] - F["stamp"]) / FPS * SR); t2 = np.arange(L2) / SR; fr2 = 440 * (587.33 / 440) ** (t2 / t2[-1])
add(0.08 * sum(np.sin(2 * np.pi * np.cumsum(fr2 * h) / SR) / h for h in (1, 2, 3)) * (t2 / t2[-1]), t_of(F["stamp"]))
# 4. L 實心、i 身升起
add(tone(150, int(0.12 * SR), 0.002, 0.04, 0.18), t_of(F["solid"])); add(tone(200, int(0.1 * SR), 0.002, 0.03, 0.12), t_of(F["stem"]))
# 5. 查證章蓋下（36，主音）：定音鼓重擊＋低頻＋銅鐘＋D 小調九和弦銅管長尾，帶回音
L = int(2.5 * SR); t = np.arange(L) / SR
f = 38 + 70 * np.exp(-t / 0.05); sub = 0.9 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(L, 0.001, 0.4)
bell = sum(g * np.sin(2 * np.pi * 392 * r * t) * env(L, 0.001, d) for r, g, d in [(1, 0.3, 1.2), (2.76, 0.18, 0.7), (5.40, 0.1, 0.4), (8.93, 0.05, 0.22)])
hit = sub + np.pad(timpani(73.42, 0.9, 0.7, 2.5), (0, 0))[:L] + bell + brass((146.83, 220.0, 293.66, 349.23, 329.63), L, 0.01, 1.1, 0.55)
for dly, g in ((0.11, 0.24), (0.23, 0.14), (0.37, 0.08)):
    k = int(dly * SR); hit[k:] += g * hit[: L - k]
add(hit, t_of(F["impact"]))
# 6. 第二圈震波：高音鐘
L = int(0.9 * SR); add(sum(g * np.sin(2 * np.pi * 784 * r * np.arange(L) / SR) * env(L, 0.001, d) for r, g, d in [(1, 0.07, 0.5), (2.76, 0.035, 0.25)]), t_of(F["ring2"]))
# 7. 字標逐字、查到底、下一集
for fr in F["name"]: add(tone(2350, int(0.05 * SR), 0.0005, 0.012, 0.05), t_of(fr))
add(tone(1760, int(0.12 * SR), 0.002, 0.04, 0.045), t_of(F["tag"]))
add(tone(880, int(0.18 * SR), 0.004, 0.07, 0.07), t_of(F["next"])); add(tone(1174.66, int(0.3 * SR), 0.004, 0.1, 0.07), t_of(F["next"]) + 0.09)
fade = np.ones(n); fade[-int(0.25 * SR):] = np.linspace(1, 0, int(0.25 * SR)); out *= fade
out *= 10 ** (-6 / 20) / np.max(np.abs(out))
st = np.stack([out, out], 1); pcm = (st * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"✔ {sys.argv[1]}  {DUR}s；查證章撞擊在 {t_of(F['impact']):.3f}s（片尾卡第 {F['impact']} 幀）")
