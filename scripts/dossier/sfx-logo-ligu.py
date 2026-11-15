#!/usr/bin/env python3
"""python3 scripts/dossier/sfx-logo-ligu.py <輸出.wav> [data|power|chip]  → 哩股哩股片尾招牌音（2026/11/15 所有頻道規則：片尾 LOGO 要有音效）。
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
THEME = sys.argv[2] if len(sys.argv) > 2 else "data"   # data｜power｜chip（script.json 最後一幕 props.endCard.theme）
def grain(f0, ms, g):   # 很短的正弦顆粒（模擬電弧劈啪；不用噪音）
    return tone(f0, int(ms / 1000 * SR), 0.0003, ms / 4000, g)
def common_tail():
    for fr in F["name"]: add(tone(2350, int(0.05 * SR), 0.0005, 0.012, 0.06), t_of(fr))
    add(tone(1760, int(0.12 * SR), 0.002, 0.04, 0.05), t_of(F["tag"]))
    add(tone(880, int(0.18 * SR), 0.004, 0.07, 0.08), t_of(F["next"])); add(tone(1174.66, int(0.3 * SR), 0.004, 0.1, 0.08), t_of(F["next"]) + 0.09)
def thump(f_lo=40, f_hi=75, d=0.34, g=1.0, L=2.4):
    L = int(L * SR); tt = np.arange(L) / SR; f = f_lo + f_hi * np.exp(-tt / 0.05)
    return g * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(L, 0.001, d)
def bell(base=392, g=1.0, L=2.4):
    L = int(L * SR); tt = np.arange(L) / SR
    return g * sum(gg * np.sin(2 * np.pi * base * r * tt) * env(L, 0.001, d) for r, gg, d in [(1, 0.34, 1.2), (2.76, 0.2, 0.7), (5.40, 0.11, 0.4), (8.93, 0.06, 0.22)])
def chord(g=1.0, L=2.4):
    L = int(L * SR); tt = np.arange(L) / SR
    return g * sum(0.10 * np.sin(2 * np.pi * fq * tt) * env(L, 0.015, 1.3) for fq in (146.83, 220.0, 293.66, 349.23, 329.63))
def echo(x):
    L = len(x)
    for dly, g in ((0.11, 0.26), (0.23, 0.15), (0.37, 0.09)):
        k = int(dly * SR); x[k:] += g * x[: L - k]
    return x
def pad(*xs):
    L = max(len(x) for x in xs); return sum(np.pad(x, (0, L - len(x))) for x in xs)
if THEME == "power":
    # 1. 電網通電：60 Hz 嗡聲（美國電網頻率）加泛音，0–36 幀慢慢變大；電弧頭一路劈啪（正弦顆粒）
    L = int(1.25 * SR); tt = np.arange(L) / SR; ramp = (tt / tt[-1]) ** 1.5
    hum = sum(g * np.sin(2 * np.pi * fq * tt) for fq, g in ((60, 0.04), (120, 0.05), (180, 0.05), (240, 0.04), (360, 0.03))) * ramp
    add(hum, 0)
    for k in range(70):
        fr = rnd.uniform(1, 22); add(grain(rnd.uniform(2200, 6500), rnd.uniform(4, 9), rnd.uniform(0.02, 0.05)), t_of(fr))
    add(tone(150, int(0.12 * SR), 0.002, 0.04, 0.2), t_of(F["solid"])); add(tone(200, int(0.1 * SR), 0.002, 0.03, 0.12), t_of(F["stem"]))
    L = int((F["impact"] - F["stamp"]) / FPS * SR); add(glide(180, 620, L, 0.12), t_of(F["stamp"]))
    # 2. 合閘（36）：電弧爆裂「啪」（80 ms 內 90 顆高頻顆粒）＋金屬合閘聲（不成倍數泛音）＋低頻撞擊＋嗡聲突然變大再衰減
    for k in range(90):
        add(grain(rnd.uniform(1800, 7000), rnd.uniform(3, 8), rnd.uniform(0.03, 0.06) * (1 - k / 110)), t_of(F["impact"]) + rnd.uniform(0, 0.08))
    L2 = int(1.6 * SR); tt = np.arange(L2) / SR
    clank = sum(g * np.sin(2 * np.pi * fq * tt) * env(L2, 0.0005, d) for fq, g, d in ((1180, 0.22, 0.35), (1830, 0.16, 0.25), (2610, 0.1, 0.18), (3420, 0.06, 0.12)))
    hum2 = sum(g * np.sin(2 * np.pi * fq * tt) for fq, g in ((60, 0.08), (120, 0.1), (180, 0.08), (240, 0.06), (360, 0.04))) * env(L2, 0.002, 0.55)
    add(echo(pad(thump(g=0.7), clank * 1.6, hum2, bell(392, 0.8), chord(0.8))), t_of(F["impact"]))
    for k in range(25): add(grain(rnd.uniform(2500, 6000), rnd.uniform(3, 6), 0.03), t_of(F["ring2"]) + rnd.uniform(0, 0.06))
elif THEME == "chip":
    # 1. 晶片走線：每條走線接上 L 時一聲短數位脈衝（奇次泛音近似方波），音高照五聲音階往上
    scale = [880, 987.77, 1174.66, 1318.51, 1567.98, 1760]
    for k in range(14):
        fr = 2 + 20 * k / 13; f0 = scale[k % len(scale)] * (1 if k < 7 else 2) / (1 if k < 7 else 1.5)
        Lb = int(0.05 * SR); tt = np.arange(Lb) / SR
        add(sum(np.sin(2 * np.pi * f0 * h * tt) / h for h in (1, 3, 5)) * 0.04 * env(Lb, 0.0005, 0.015), t_of(fr))
    add(tone(150, int(0.12 * SR), 0.002, 0.04, 0.22), t_of(F["solid"])); add(tone(200, int(0.1 * SR), 0.002, 0.03, 0.14), t_of(F["stem"]))
    L = int((F["impact"] - F["stamp"]) / FPS * SR); add(glide(1300, 420, L, 0.12, 1.5), t_of(F["stamp"]))
    # 2. 簽名蓋章（36）：重的印章落下（低頻撞擊＋木頭般的 220 Hz 敲擊）＋銅鐘＋和弦；三個頭銜閃過各一聲兩音嗶
    L2 = int(0.5 * SR); knock = sum(g * np.sin(2 * np.pi * fq * np.arange(L2) / SR) * env(L2, 0.0005, d) for fq, g, d in ((220, 0.35, 0.09), (563, 0.15, 0.05)))
    add(echo(pad(thump(g=1.1), knock, bell(392, 1.0), chord(1.0))), t_of(F["impact"]))
    for j in range(3):
        a = t_of(F["impact"] + 2 + j * 3); add(tone(1318.51, int(0.06 * SR), 0.001, 0.02, 0.06), a); add(tone(1760, int(0.08 * SR), 0.001, 0.03, 0.06), a + 0.04)
else:
    # data：資料點歸檔
    for k in range(26):
        fr = 2 + 20 * (k / 25) ** 0.7; f0 = 1500 + 1400 * (k / 25) + rnd.uniform(-60, 60)
        add(tone(f0, int(0.04 * SR), 0.0005, 0.01, 0.025 + 0.02 * k / 25), t_of(fr))
    add(glide(220, 520, int(0.7 * SR), 0.05), t_of(1))
    add(tone(150, int(0.12 * SR), 0.002, 0.04, 0.22), t_of(F["solid"])); add(tone(200, int(0.1 * SR), 0.002, 0.03, 0.14), t_of(F["stem"]))
    L = int((F["impact"] - F["stamp"]) / FPS * SR); add(glide(1300, 420, L, 0.12, 1.5), t_of(F["stamp"]))
    add(echo(pad(thump(), bell(), chord())), t_of(F["impact"]))
    add(sum(g * np.sin(2 * np.pi * 784 * r * np.arange(int(0.8 * SR)) / SR) * env(int(0.8 * SR), 0.001, d) for r, g, d in [(1, 0.08, 0.5), (2.76, 0.04, 0.25)]), t_of(F["ring2"]))
common_tail()
fade = np.ones(n); fade[-int(0.25 * SR):] = np.linspace(1, 0, int(0.25 * SR)); out *= fade
out *= 10 ** (-6 / 20) / np.max(np.abs(out))
# 各主題的響度在 mix-final.sh 用第 6 個參數（主題）補到片尾段約 −11.5 LUFS
st = np.stack([out, out], 1); pcm = (st * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"✔ {sys.argv[1]}  {DUR}s；撞擊在 {t_of(F['impact']):.3f}s（片尾卡第 {F['impact']} 幀）")
