#!/usr/bin/env python3
"""科技透明圈片尾招牌音（AI 科技感，2026/11/15 Andy：「需要有音效，讓人為之一亮，像是 Netflix 的效果，但我們偏 AI 科技感」）。

用法：python3 scripts/three/sfx-logo-tech.py <輸出.wav> [--fps 30]
- 全部用 numpy 合成（正弦、掃頻、包絡、延遲回音），不用任何現成音檔，不模仿任何品牌的旋律或音色。
- 參數全部固定（亂數 seed 固定），每支片產生的聲音一模一樣；**鎖定那一聲（主音）是頻道招牌音，以後每支片都用同一段，不要改參數**。
- 只用乾淨的正弦類音色，不加白噪音（使用者嫌過「聲音不清、有雜音」）；交件前用頻譜檢查有沒有毛刺。
- 時間對齊片尾卡「透明圈」動畫（src/components/three/hudLayout.ts 的 ENDCARD_TC；LogoAnims.tsx 的 Transparent），單位＝片尾卡開始後第幾幀：
    飛入 0–10：低音量數位粒子聲（短促高音小點）
    掃描 11–25：資料流的嗶啾聲（更小、更快）
    疊合 14–34：上升掃頻（riser），張力往上推
    震動音（v8，Andy：「在結尾 LOGO 圓圈出現震動的那畫面需要有音效」）：畫面震動的每一幀都有一個撞擊＝低頻「咚」＋玻璃撞擊（幾個不成倍數的正弦泛音、快速衰減），
      音量照震動幅度（LogoAnims.tsx 的 shake／lockShake）：撞合 27／29／31／33（玻璃層、外框、晶片、電路各砸一下，幅度 1.60／1.64／1.53／1.53，玻璃音一層比一層高），
      鎖定 34（幅度 2.4＋橫向 1.44，最大）＝主音＋最重的震動音（低一點、拖長的玻璃撞擊）
    鎖定 34：主音＝低頻厚重撞擊（音高往下掉的正弦）＋明亮合成和弦（九和弦、慢慢散開）＋回音尾巴
    頻道名逐字 34／36／38／40／42：很輕的數位點擊
    下一支 52：短的確認音（兩個音往上）
- 輸出 48 kHz 立體聲 wav，第 0 個樣本＝片尾卡第 0 幀。音量平衡已經做在這裡（v8 起）：鎖定前的聲音整組 ×0.275（主音的 −11.2 dB）、主音那組在鎖定後 0.8 秒起
  花 0.8 秒降到 ×0.5625；混音只乘一個固定倍數（tech-2nm ×22）再過 limiter（scripts/three/mix-endsting.sh；目標片尾段約 −11 LUFS、true peak ≤ −1 dBTP）。
"""
import sys, wave, struct
import numpy as np

SR = 48000
FPS = float(sys.argv[sys.argv.index("--fps") + 1]) if "--fps" in sys.argv else 30.0
OUT = sys.argv[1]
DUR = 3.4  # 秒（片尾卡約 3.17 秒，尾巴多留一點，混音時會在片尾截掉）
rng = np.random.default_rng(20261115)
t_all = np.arange(int(DUR * SR)) / SR
L = np.zeros_like(t_all); R = np.zeros_like(t_all)
fr = lambda n: n / FPS  # 幀 → 秒

def add(sig, at, pan=0.0, gain=1.0):
    """把一段聲音放到 at 秒；pan −1（左）～ +1（右），等功率"""
    i = int(at * SR); n = min(len(sig), len(L) - i)
    if n <= 0: return
    a = (pan + 1) * np.pi / 4
    L[i:i + n] += sig[:n] * np.cos(a) * gain; R[i:i + n] += sig[:n] * np.sin(a) * gain

def env(n, a, d, shape=4.0):
    """a 秒線性起音、之後指數衰減（d＝衰減到約 −35 dB 的秒數）；結尾 3 ms 淡出，避免喀聲"""
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-shape * np.maximum(0, t - a) / d)
    k = min(n, int(0.003 * SR)); e[-k:] *= np.linspace(1, 0, k)
    return e

def tone(f, dur, a=0.002, d=None, harm=((1, 1.0),), detune=0.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(g * np.sin(2 * np.pi * f * m * (1 + detune) * t) for m, g in harm)
    return s * env(n, a, d or dur)

# ── 1. 飛入 0–10：數位粒子（短促、高音、輕） ──
for k in range(9):
    at = fr(rng.uniform(0, 10)); f = rng.choice([2093, 2349, 2637, 3136, 3520])
    add(tone(f, 0.045, a=0.001, d=0.04, harm=((1, 1), (2, 0.15))), at, pan=rng.uniform(-0.7, 0.7), gain=0.06)

# ── 2. 掃描 11–25：資料流嗶啾（每 1.5 幀一個，音高跟著掃描帶往上走） ──
for k in range(10):
    at = fr(11 + k * 1.5); f = 1760 * 2 ** (k / 14)
    n = int(0.03 * SR); t = np.arange(n) / SR
    chirp = np.sin(2 * np.pi * (f * t + 0.5 * f * 0.6 * t * t / 0.03)) * env(n, 0.001, 0.028)
    add(chirp, at, pan=-0.5 + k / 9, gain=0.045)

# ── 3. 疊合 14–34：上升掃頻（兩道微微錯開的正弦＋八度，越接近鎖定越大聲），撞合 27／29／31／33 輕嗒 ──
a0, a1 = fr(14), fr(34)
n = int((a1 - a0) * SR); t = np.arange(n) / SR; u = t / (a1 - a0)
f = 180 * (1800 / 180) ** (u ** 1.6)                      # 指數上升 180 → 1800 Hz
ph = 2 * np.pi * np.cumsum(f) / SR
riser = (np.sin(ph) + 0.6 * np.sin(ph * 1.004 + 0.3) + 0.25 * np.sin(2 * ph)) * (u ** 2.2)
riser *= np.minimum(1, (1 - u) * 400 + 0.0) ** 0.5           # 最後 ~2.5 ms 收掉，讓主音乾淨地蓋上
add(riser, a0, pan=0, gain=0.11)

# ── 3b. 震動音（v8）：每一次畫面震動對準那一幀，一個「咚」＋一個玻璃撞擊；音量照震動幅度（÷1.6） ──
GLASS = ((1.0, 1.0, 0.30), (2.32, 0.5, 0.18), (4.25, 0.28, 0.11), (6.63, 0.15, 0.07))   # （泛音倍率、音量、衰減秒）：玻璃／金屬板不成倍數的泛音
def glass(f, dur=0.5, slow=1.0, side=0.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(g * np.sin(2 * np.pi * f * m * (1 + side) * t) * env(n, 0.0015, d * slow, shape=4.0) for m, g, d in GLASS)
    return s
def thud(f0=140, f1=55, dur=0.28, d=0.22):
    n = int(dur * SR); t = np.arange(n) / SR
    fb = f1 + (f0 - f1) * np.exp(-t / 0.025)
    return np.sin(2 * np.pi * np.cumsum(fb) / SR) * env(n, 0.002, d, shape=4.0)
def shake_hit(at, amp, fg, slow=1.0, gt=0.136, gg=0.052):
    k = amp / 1.6
    add(thud(), at, gain=gt * k)
    add(glass(fg, 0.9 * slow, slow, -0.0015), at, pan=-0.35, gain=gg * k); add(glass(fg, 0.9 * slow, slow, 0.0015), at, pan=0.35, gain=gg * k)
SHAKES = [(27, 1.60, 1568.0), (29, 1.64, 1760.0), (31, 1.53, 1975.5), (33, 1.53, 2217.5)]   # （片尾卡幀、震動幅度、玻璃音高）
for nfr, amp, fg in SHAKES: shake_hit(fr(nfr), amp, fg)

# ── 鎖定前的聲音（上面全部）整組收進 PRE；下面鎖定那組另外算 ──
PRE_L, PRE_R = L.copy(), R.copy(); L[:] = 0; R[:] = 0

# ── 4. 鎖定 34：招牌主音（固定，不要改） ──
LOCK = fr(34)
# 4a 低頻撞擊：正弦音高 120 → 46 Hz（80 ms 內掉下來），1.1 秒衰減；加一個很短的 1.2 kHz 起音讓「咚」有邊
n = int(1.4 * SR); t = np.arange(n) / SR
fb = 46 + (120 - 46) * np.exp(-t / 0.035)
boom = np.sin(2 * np.pi * np.cumsum(fb) / SR) * env(n, 0.003, 1.1, shape=3.2)
boom += 0.35 * np.sin(2 * np.pi * 92 * t) * env(n, 0.003, 0.5)
click = np.sin(2 * np.pi * 1200 * t[: int(0.012 * SR)]) * env(int(0.012 * SR), 0.0005, 0.01)
add(boom, LOCK, gain=0.6); add(click, LOCK, gain=0.12)
# 4b 明亮和弦：Fmaj9 開放排列（F3 C4 A4 E5 G5 C6），每個音左右微微走音形成寬度，起音 6 ms、衰減 2 秒
CHORD = [174.61, 261.63, 440.00, 659.25, 783.99, 1046.50]
for j, fq in enumerate(CHORD):
    g = [0.35, 0.3, 0.32, 0.28, 0.24, 0.18][j]
    hl = tone(fq, 2.2, a=0.006, d=2.0, harm=((1, 1), (2, 0.18), (3, 0.05)), detune=-0.0012)
    hr = tone(fq, 2.2, a=0.006, d=2.0, harm=((1, 1), (2, 0.18), (3, 0.05)), detune=+0.0012)
    i = int(LOCK * SR); m = min(len(hl), len(L) - i)
    L[i:i + m] += hl[:m] * g * 0.5; R[i:i + m] += hr[:m] * g * 0.5
# 4b' 鎖定那一下的震動音（v8，幅度 2.4，全段最大）：比撞合低、拖長的玻璃撞擊＋一個較高的「咚」疊在主音上
shake_hit(LOCK, 2.4, 1318.5, slow=2.2, gt=0.55, gg=0.4)
# 4c 亮點：和弦上方一個晶亮的高音（E7 附近），很短
add(tone(2637.0, 0.6, a=0.002, d=0.5), LOCK + 0.012, pan=0.25, gain=0.05)
# 4d 回音尾巴：主音和弦的延遲回音（多個分接、逐漸變小、一階低通變暗），不用噪音殘響，聲音乾淨
dry_L, dry_R = L.copy(), R.copy()
i0 = int(LOCK * SR)
for k, (ms, g) in enumerate([(73, 0.32), (151, 0.24), (229, 0.18), (317, 0.13), (419, 0.09), (541, 0.06)]):
    d = int(ms / 1000 * SR)
    for src, dst, pan in ((dry_L, L, k % 2), (dry_R, R, (k + 1) % 2)):
        seg = src[i0:].copy()
        # 一階低通（每多一次回音更暗）
        alpha = 0.25 + 0.08 * k; y = np.empty_like(seg); acc = 0.0
        for q in range(len(seg)): acc += alpha * (seg[q] - acc); y[q] = acc
        m = min(len(seg), len(dst) - i0 - d)
        if m > 0: dst[i0 + d: i0 + d + m] += y[:m] * g * (0.8 if pan else 1.0)

# ── 5. 頻道名逐字 34–42：很輕的數位點擊 ──
for k in range(5):
    add(tone(3136 * 2 ** (k / 24), 0.018, a=0.0008, d=0.015), fr(34 + 2 * k) + 0.02, pan=-0.4 + 0.2 * k, gain=0.035)

# ── 6. 下一支 52：短確認音（G5 → D6，各 90 ms） ──
add(tone(783.99, 0.12, a=0.003, d=0.1, harm=((1, 1), (2, 0.12))), fr(52), gain=0.14)
add(tone(1174.66, 0.18, a=0.003, d=0.16, harm=((1, 1), (2, 0.12))), fr(52) + 0.085, gain=0.14)

# ── 音量平衡（v8，原本 v7 在混音包絡裡做）：鎖定前 ×0.275；主音那組鎖定後 0.8 秒起 0.8 秒內降到 ×0.406 ──
tt = np.arange(len(L)) / SR
tail = np.interp(tt, [LOCK + 0.8, LOCK + 1.6], [1.0, 9 / 16])
L = PRE_L * (4.4 / 16) + L * tail; R = PRE_R * (4.4 / 16) + R * tail
SHAKE_TIMES = [fr(n) for n, _, _ in SHAKES] + [LOCK]

# ── 輸出（峰值先正規化到 −3 dBFS，混音時再依響度調整） ──
peak = max(np.abs(L).max(), np.abs(R).max()); sc = 10 ** (-3 / 20) / peak
data = np.stack([L * sc, R * sc], axis=1).astype(np.float32)
with wave.open(OUT, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(data, -1, 1) * 32767).astype("<i2").tobytes())
print(f"✔ {OUT}：{DUR} 秒、48 kHz 立體聲；主音在 {LOCK:.3f} 秒（片尾卡第 34 幀）；震動音 " + "、".join(f"{x:.3f}" for x in SHAKE_TIMES) + " 秒")
