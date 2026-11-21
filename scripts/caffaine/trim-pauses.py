#!/usr/bin/env python3
"""後製現有人聲（不送 TTS、不重新配音）：句中停頓縮短、片頭補底噪、換幕純數位靜音換成底噪。
用法（依序）：
  python3 scripts/caffaine/trim-pauses.py prep <slug> [--dry]   # 備份 → 剪每幕音檔的句中停頓、片頭補 0.3 秒底噪、改 tts-manifest
  NODE_USE_ENV_PROXY=1 ALIGN_GAP_MIN=0.6 ALIGN_BEAT_GAP=0.7 npm run align <slug> -- --force   # 讀現成音檔重排時間軸（fa.py 本機對齊，不送 TTS），重疊 voice.wav
  python3 scripts/caffaine/trim-pauses.py fill <slug>            # voice.wav 裡純數位靜音（樣本全 0）換成同一段錄音擷取的底噪（長度不變）
  python3 scripts/caffaine/trim-pauses.py check <slug>           # 量 voice.wav：句中 ≥0.25 秒停頓、全片停頓數、數位靜音
備份檔都叫 *.orig-1122.*（已存在就不覆蓋，所以可重跑 prep：永遠從原檔開始剪）。
規則：只剪「逗號／頓號／冒號／分號／無標點」處、≥0.22 秒的停頓，剪點在靜音區內、前後各留 ≥65ms，接縫 10ms 交叉淡化；句號後的停頓不動。"""
import json, os, shutil, sys, wave
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
THR = 10 ** (-35 / 20)          # silencedetect -35dB
MIN_CUT = 0.22                  # 句中停頓 ≥ 這麼長才剪
KEEP = 0.065                    # 剪點離靜音區邊緣（秒），≥40ms 規格
XF = 0.010                      # 交叉淡化
PAD = 0.30                      # 片頭底噪
PUNCT = set("，。？！、：；「」『』（）()…— \n\t,.?!:;\"'")
MID = set("，、：；,:;")

def rd(p):
    with wave.open(p) as w:
        sr, n = w.getframerate(), w.getnframes(); a = np.frombuffer(w.readframes(n), "<i2").astype(np.float64)
        ch = w.getnchannels()
    if ch > 1: a = a.reshape(-1, ch).mean(1)
    return a, sr
def wr(p, a, sr):
    with wave.open(p, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(np.clip(np.round(a), -32768, 32767).astype("<i2").tobytes())
def bak(p):
    b = p.replace(".wav", ".orig-1122.wav") if p.endswith(".wav") else p.replace(".json", ".orig-1122.json")
    if not os.path.exists(b): shutil.copy2(p, b)
    return b

def silences(a, sr, thr=THR, win=0.002):
    """連續低於門檻的區段 [(start_sec, end_sec)]（用 2ms 視窗最大絕對值，和 silencedetect 同量級）"""
    n = int(sr * win); m = len(a) // n
    e = np.abs(a[: m * n] / 32768).reshape(m, n).max(1)
    q = e < thr; out = []; i = 0
    while i < m:
        if q[i]:
            j = i
            while j < m and q[j]: j += 1
            out.append((i * win, j * win)); i = j
        else: i += 1
    return out

def scene_texts(slug):
    man = json.load(open(f"{ROOT}/videos/{slug}/tts-manifest.json"))
    return man, {s["id"]: s for s in man["scenes"]}

def punct_after(text, k):
    """念稿 text 裡第 k 個（0 起算）非標點字之後緊接的標點串"""
    c = -1; i = 0
    while i < len(text):
        if text[i] not in PUNCT: c += 1
        if c == k:
            j = i + 1; s = ""
            while j < len(text) and text[j] in PUNCT:
                s += text[j]; j += 1
            return s
        i += 1
    return ""

def prep(slug, dry=False):
    base = f"{ROOT}/public/audio/{slug}"
    man, byid = scene_texts(slug)
    tl = json.load(open(f"{ROOT}/videos/{slug}/timeline.json"))
    for p in (f"{ROOT}/videos/{slug}/tts-manifest.json", f"{ROOT}/videos/{slug}/timeline.json", f"{ROOT}/videos/{slug}/storyboard.json"):
        if not dry: bak(p)
    if not dry: bak(f"{base}/voice.wav")
    bank = []; report = []
    for idx, sc in enumerate(man["scenes"]):
        f = f"{ROOT}/public/{sc['file']}"
        o = f.replace(".wav", ".orig-1122.wav")
        if not os.path.exists(o) and not dry: shutil.copy2(f, o)
        src = o if os.path.exists(o) else f
        a, sr = rd(src)
        ts = next(x for x in tl["scenes"] if x["id"] == sc["id"])
        words = ts["words"]  # 逐字（不含標點）；ts 可能是上一輪 align 的結果
        head, tail = sc["headSec"], sc["tailSec"]
        runs = [(s, e) for s, e in silences(a, sr) if s > head + 0.02 and e < tail - 0.02 and e - s >= 0.10]
        cuts = []
        for s, e in runs:
            prev = [k for k, w in enumerate(words) if w["end"] <= s + 0.06]
            k = prev[-1] if prev else -1
            p = punct_after(sc["text"], k) if k >= 0 else ""
            kind = "句間" if any(ch in "。？！.?!" for ch in p) else "句中"
            bank.append(a[int((s + 0.05) * sr): int((e - 0.05) * sr)]) if e - s > 0.2 else None
            report.append((sc["id"], round(s, 2), round(e - s, 2), kind, p or "（無標點）"))
            if kind == "句中" and e - s >= MIN_CUT: cuts.append((s, e))
        # 由後往前剪（時間不位移）
        out = a.copy(); removed = []
        for s, e in sorted(cuts, reverse=True):
            c0 = int((s + KEEP) * sr); c1 = int((e - KEEP) * sr); x = int(XF * sr)
            fo = np.linspace(1, 0, x); fi = 1 - fo
            mix = out[c0 - x:c0] * fo + out[c1:c1 + x] * fi
            out = np.concatenate([out[: c0 - x], mix, out[c1 + x:]])
            removed.append((s, e, (c1 - c0 + x) / sr))
        gone = sum(r[2] for r in removed)
        padsec = 0.0
        if idx == 0:
            padsec = PAD  # 片頭底噪：先放空，bank 湊完再補（此處先記）
        sc["_removed"] = [(round(s, 3), round(e, 3), round(d, 3)) for s, e, d in removed]
        sc["_out"] = out; sc["_sr"] = sr; sc["_gone"] = gone; sc["_pad"] = padsec
    if dry:
        for r in report: print(*r)
        for sc in man["scenes"]: print(sc["id"], "要剪", sc["_removed"])
        return
    # 底噪庫：靜音區中段（兩側各留 50ms）拼起來，接縫交叉淡化
    noise = np.concatenate(bank) if bank else np.zeros(int(1 * 24000))
    nz = noise.copy()
    for sc in man["scenes"]:
        out, sr = sc["_out"], sc["_sr"]
        if sc["_pad"]:
            n = int(PAD * sr); pad = take_noise(noise, n)
            fade = np.linspace(0, 1, int(0.01 * sr)); out = np.concatenate([pad, out])
            sc["headSec"] = round(sc["headSec"] + PAD, 3)
        wr(f"{ROOT}/public/{sc['file']}", out, sr)
        sc["sec"] = round(len(out) / sr, 3)
        sc["tailSec"] = round(sc["tailSec"] - sc["_gone"] + sc["_pad"], 3)
        for k in ("_out", "_sr", "_gone", "_pad"): sc.pop(k)
        if "_removed" in sc: print(sc["id"], "剪", sc.pop("_removed"), "→ 新長", sc["sec"])
    json.dump(man, open(f"{ROOT}/videos/{slug}/tts-manifest.json", "w"), ensure_ascii=False, indent=2)
    wr(f"{base}/noise-bank.wav", noise, 24000)
    print("底噪庫", round(len(noise) / 24000, 2), "秒，RMS dBFS", round(20 * np.log10(np.sqrt((noise ** 2).mean()) / 32768 + 1e-12), 1))
    for r in report: print(*r)

def take_noise(bank, n, start=0):
    """從底噪庫取 n 個樣本（不夠就循環，接縫 50ms 交叉淡化）"""
    if len(bank) == 0: return np.zeros(n)
    if len(bank) >= n + start: return bank[start:start + n].copy()
    L = len(bank); x = min(int(0.05 * 24000), L // 4) if L > 100 else 0
    out = bank[start % L:].copy()
    while len(out) < n:
        nxt = bank
        if x:
            fo = np.linspace(1, 0, x); out = np.concatenate([out[:-x], out[-x:] * fo + nxt[:x] * (1 - fo), nxt[x:]])
        else: out = np.concatenate([out, nxt])
    return out[:n]

def fill(slug):
    base = f"{ROOT}/public/audio/{slug}"
    tl = json.load(open(f"{ROOT}/videos/{slug}/timeline.json"))
    g = 10 ** ((tl["voice"]["lufs"] - tl["voice"]["lufsIn"]) / 20)   # align 的整條 loudnorm 增益
    bank, bsr = rd(f"{base}/noise-bank.wav")
    a, sr = rd(f"{base}/voice.wav")
    up = np.interp(np.arange(0, len(bank) * sr / bsr) * bsr / sr, np.arange(len(bank)), bank) * g
    z = (a == 0); idx = np.flatnonzero(np.diff(np.concatenate([[0], z.astype(np.int8), [0]])))
    runs = list(zip(idx[::2], idx[1::2])); pos = 0; nfill = 0; tot = 0
    for s, e in runs:
        if e - s < int(0.004 * sr): continue
        seg = take_noise(up, e - s, pos % max(1, len(up) // 2)); pos += (e - s)
        r = min(int(0.005 * sr), (e - s) // 2); w = np.ones(e - s); w[:r] = np.linspace(0, 1, r); w[-r:] = np.linspace(1, 0, r)
        a[s:e] = np.round(seg * w); nfill += 1; tot += e - s
    # 若底噪振幅太小造成新的長串 0，改用 ±1 抖動補上
    z = (a == 0); idx = np.flatnonzero(np.diff(np.concatenate([[0], z.astype(np.int8), [0]]))); runs = list(zip(idx[::2], idx[1::2]))
    rng = np.random.default_rng(1122)
    for s, e in runs:
        if e - s >= int(0.012 * sr):
            a[s:e] += rng.choice([-1, 0, 1], size=e - s, p=[.35, .3, .35])
    wr(f"{base}/voice.wav", a, sr)
    print(f"填底噪 {nfill} 段，共 {tot / sr:.2f} 秒；增益 {20 * np.log10(g):.2f} dB；底噪庫 RMS {20 * np.log10(np.sqrt((up ** 2).mean()) / 32768 + 1e-12):.1f} dBFS")

def check(slug):
    import subprocess, re
    p = f"{ROOT}/public/audio/{slug}/voice.wav"
    o = subprocess.run(["ffmpeg", "-hide_banner", "-i", p, "-af", "silencedetect=n=-35dB:d=0.25", "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", o)]; du = [float(x) for x in re.findall(r"silence_duration: ([\d.]+)", o)]
    for s, d in zip(st, du): print(f"  停頓 {s:6.2f} 秒 {d:.2f}")
    print("silencedetect ≥0.25 秒共", len(st), "處")
    a, sr = rd(p); z = (a == 0); idx = np.flatnonzero(np.diff(np.concatenate([[0], z.astype(np.int8), [0]]))); runs = list(zip(idx[::2], idx[1::2]))
    print("全 0 連續 ≥30ms：", sum(1 for s, e in runs if e - s >= 0.03 * sr), "處；總長", round(len(a) / sr, 2))

if __name__ == "__main__":
    if len(sys.argv) < 3: sys.exit(__doc__)
    cmd, slug = sys.argv[1], sys.argv[2]
    {"prep": lambda: prep(slug, "--dry" in sys.argv), "fill": lambda: fill(slug), "check": lambda: check(slug)}[cmd]()
