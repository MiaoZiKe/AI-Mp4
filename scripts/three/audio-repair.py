#!/usr/bin/env python3
"""成片音軌修補：把「純 0 的數位靜音／死寂段」改成附近錄音的底噪，接縫做 15ms 等功率交叉淡化。
（2026-11-21 Andy：「全部影片 前面聲音斷斷續續 需要避免後續發生」；規則 tw-rotation docs/marketing/channels/video_logic.md「〇、音訊不斷續」）

用法：python3 scripts/three/audio-repair.py <輸入.mp4> -o <輸出.mp4> [--slug tech-xxx | --end 片尾卡開始秒] [--no-check]
      python3 scripts/three/audio-repair.py <voice.wav> -o <voice.wav> --stem   （align.mjs 產生人聲軌後自動呼叫）
  --stem：輸入輸出都是 wav（16-bit，取樣率與聲道照原檔）；另外做片頭 0.3 秒淡入、全條加 −90 dBFS TPDF dither
  --slug：讀 videos/<slug>/storyboard.json 最後一幕開始秒當片尾卡起點（招牌音那段不動）
  --end ：直接給片尾卡開始秒；兩個都沒給就整條都修（不建議）
  只處理音軌：影像 -c:v copy；取樣數與原檔相同（片長、音畫對齊不變）。修完自動跑 scripts/dossier/audio-check.py，沒過 exit 1。

做法：
  1. 解出音軌（原取樣率、原聲道數，f32）。
  2. 找「死寂段」：5ms 短時音量 < −85 dBFS 連續 ≥10ms 的區段（含純 0 與 AAC 解出來 −140 dBFS 的殘渣），只看 0.05 秒之後、片尾卡開始 −0.05 秒之前。
  3. 每段在前後 1.5 秒內找最安靜、但不是死寂（−84～−50 dBFS）的 40ms 真實錄音當底噪樣本，
     用它的頻譜形狀做隨機相位雜訊，音量＝樣本音量（夾在 −80～−55 dBFS；找不到就 −80 dBFS）。
  4. 雜訊蓋滿死寂段，兩端各延伸 15ms 與原聲做等功率交叉淡化（cos／sin）。
  5. 片尾卡開始前 0.05 秒起的樣本一個都不改。
"""
import json, os, subprocess, sys
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
args = sys.argv[1:]
def opt(name, default=None):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
OUT, SLUG, END = opt("-o"), opt("--slug"), opt("--end")
NOCHECK, STEM = "--no-check" in args, "--stem" in args
for f in ("--no-check", "--stem"):
    if f in args: args.remove(f)
if len(args) != 1 or not OUT: sys.exit(__doc__)
SRC = args[0]

WIN, DEAD_DB, DEAD_MIN = 0.005, -85.0, 0.010
XF, START_SKIP, STING_GUARD = 0.015, 0.05, 0.05
FLOOR_LO, FLOOR_HI, FLOOR_DEFAULT, REF_LEN, SEARCH = -80.0, -55.0, -80.0, 0.040, 1.5
HEAD_FADE, DITHER_DB = 0.3, -90.0

def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=sample_rate,channels,bit_rate",
                        "-of", "json", path], capture_output=True, text=True, check=True)
    s = json.loads(r.stdout)["streams"][0]
    return int(s["sample_rate"]), int(s["channels"]), int(s.get("bit_rate") or 192000)

def end_sec():
    if END is not None: return float(END)
    if SLUG:
        p = os.path.join(ROOT, "videos", SLUG, "storyboard.json")
        sb = json.load(open(p)); e = sb["scenes"][-1]
        return float(e.get("startSec", e["startFrame"] / sb.get("fps", 30)))
    return None

def level_db(x, sr):
    w = int(WIN * sr); m = (x.astype(np.float64) ** 2).mean(axis=1)
    c = np.concatenate([[0], np.cumsum(m)]); idx = np.arange(0, len(m) - w + 1, w)
    return idx, np.maximum(10 * np.log10((c[idx + w] - c[idx]) / w + 1e-20), -200.0), w

def shaped_noise(ref, n, target_db, rng):
    """用 ref 的平均頻譜形狀做 n 個樣本的隨機相位雜訊（各聲道獨立），RMS＝target_db。"""
    ch = ref.shape[1]; out = np.zeros((n, ch))
    nfft = 1 << int(np.ceil(np.log2(max(n, 2))))
    for k in range(ch):
        seg = 512 if len(ref) >= 512 else len(ref)
        frames = [ref[i:i + seg, k] * np.hanning(seg) for i in range(0, len(ref) - seg + 1, seg // 2)] or [ref[:, k]]
        mag = np.mean([np.abs(np.fft.rfft(f, seg)) for f in frames], axis=0) + 1e-12
        f_src = np.linspace(0, 1, len(mag)); f_dst = np.linspace(0, 1, nfft // 2 + 1)
        spec = np.fft.rfft(rng.standard_normal(nfft)) * np.interp(f_dst, f_src, mag)
        y = np.fft.irfft(spec, nfft)[:n]
        out[:, k] = y
    rms = np.sqrt((out ** 2).mean()) + 1e-20
    return out * (10 ** (target_db / 20) / rms)

def main():
    sr, ch, br = probe(SRC)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-map", "0:a:0", "-f", "f32le", "-acodec", "pcm_f32le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, ch).astype(np.float64)
    n_total = len(x); dur = n_total / sr
    end = end_sec(); lim = min(end, dur) if end is not None else dur
    # 這個樣本之後一律不改（片尾卡招牌音）；--stem 的人聲軌沒有招牌音，整條都修
    protect = n_total if STEM and end is None else int(max(0.0, lim - STING_GUARD) * sr)
    idx, db, w = level_db(x, sr)
    dead = db < DEAD_DB
    d = np.diff(np.concatenate([[0], dead.astype(np.int8), [0]]))
    runs = []
    for a, b in zip(np.where(d == 1)[0], np.where(d == -1)[0]):
        s, e = idx[a], min(idx[b - 1] + w, n_total)
        s, e = max(s, int(START_SKIP * sr)), (e if e >= n_total and protect == n_total else min(e, protect - int(XF * sr)))
        if (e - s) / sr >= DEAD_MIN: runs.append((s, e))
    rng = np.random.default_rng(20261121)
    y = x.copy(); xf = int(XF * sr); refw = int(REF_LEN / WIN)
    ok = (db >= FLOOR_DEFAULT - 4) & (db <= FLOOR_HI)   # −84～−55：真實錄音裡的安靜處
    log = []
    for s, e in runs:
        # 找附近最安靜的 40ms 真實錄音
        lo, hi = max(0, s - int(SEARCH * sr)), min(protect, e + int(SEARCH * sr))
        best = None
        for j in range(len(idx) - refw):
            if idx[j] < lo or idx[j + refw] > hi: continue
            if idx[j] + refw * w > s and idx[j] < e: continue
            seg = db[j:j + refw]
            if not ok[j:j + refw].all(): continue
            v = 10 * np.log10(np.mean(10 ** (seg / 10)))
            if best is None or v < best[0]: best = (v, idx[j])
        if best is not None:
            tgt = float(np.clip(best[0], FLOOR_LO, FLOOR_HI)); ref = x[best[1]:best[1] + refw * w]
        else:
            tgt = FLOOR_DEFAULT; ref = rng.standard_normal((sr // 10, ch))
        a0, b0 = max(0, s - xf), min(protect, e + xf)
        nz = shaped_noise(ref, b0 - a0, tgt, rng)
        m_in, m_out = s - a0, b0 - e
        # 等功率交叉淡化：原聲 cos、雜訊 sin
        g_noise = np.ones(b0 - a0)
        if m_in > 0: g_noise[:m_in] = np.sin(np.linspace(0, np.pi / 2, m_in))
        if m_out > 0: g_noise[-m_out:] = np.sin(np.linspace(np.pi / 2, 0, m_out))
        g_orig = np.sqrt(1 - np.clip(g_noise, 0, 1) ** 2)
        g_orig[m_in:len(g_orig) - m_out] = 0.0
        y[a0:b0] = x[a0:b0] * g_orig[:, None] + nz * g_noise[:, None]
        log.append(f"  填 {s / sr:7.3f}～{e / sr:7.3f}s（{(e - s) / sr * 1000:.0f}ms）底噪 {tgt:.0f} dBFS" + ("" if best is not None else "（附近找不到真實底噪，用預設）"))
    assert np.array_equal(y[protect:], x[protect:])
    if STEM:
        rng2 = np.random.default_rng(90)  # −90 dBFS TPDF dither（RMS），片尾卡保護區以外
        amp = 10 ** (DITHER_DB / 20) * np.sqrt(6)  # 三角分布 RMS＝amp/√6
        y[:protect] += (rng2.uniform(-.5, .5, (protect, ch)) + rng2.uniform(-.5, .5, (protect, ch))) * amp
        nh = min(int(HEAD_FADE * sr), protect)
        y[:nh] *= (np.sin(np.linspace(0, np.pi / 2, nh)) ** 2)[:, None]
        y[:nh] += (rng2.uniform(-.5, .5, (nh, ch)) + rng2.uniform(-.5, .5, (nh, ch))) * amp  # 淡入區也保留 dither，不出現純 0
    print(f"音訊修補 {os.path.basename(SRC)}：{len(runs)} 段死寂改成底噪" + (f"；片尾卡 {end:.2f} 秒起（{protect / sr:.2f} 秒後）不動" if end is not None else "") + ("；片頭 0.3 秒淡入、−90 dBFS dither" if STEM else ""))
    for l in log: print(l)
    tmp = OUT + (".tmp.wav" if STEM else ".tmp.mp4")
    if STEM:
        pcm16 = np.round(np.clip(y, -1, 32767 / 32768) * 32768).astype("<i2")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(sr), "-ac", str(ch), "-i", "pipe:0", "-c:a", "pcm_s16le", tmp], input=pcm16.tobytes(), check=True)
        os.replace(tmp, OUT)
    else:
        pcm = np.clip(y, -1, 1).astype(np.float32).tobytes()
        cmd = ["ffmpeg", "-v", "error", "-y", "-i", SRC, "-f", "f32le", "-ar", str(sr), "-ac", str(ch), "-i", "pipe:0",
               "-map", "0:v:0", "-map", "1:a:0", "-map_metadata", "0", "-c:v", "copy", "-c:a", "aac", "-b:a", str(max(br, 192000)),
               "-movflags", "+faststart", tmp]
        subprocess.run(cmd, input=pcm, check=True)
        verify_and_move(tmp, n_total, ch)
    if NOCHECK: return
    chk = [sys.executable, os.path.join(ROOT, "scripts", "dossier", "audio-check.py")] + ([SLUG] if SLUG else []) + ["--file", os.path.abspath(OUT)]
    if end is not None: chk += ["--end", str(end)]
    sys.exit(subprocess.run(chk).returncode)

def verify_and_move(tmp, n_total, ch):
    # 片長、音畫對齊驗證：影像串流長度不變、音軌取樣數不變
    def durs(p):
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,duration,nb_frames", "-of", "json", p], capture_output=True, text=True)
        return {s["codec_type"]: (float(s["duration"]), s.get("nb_frames")) for s in json.loads(r.stdout)["streams"]}
    a, b = durs(SRC), durs(tmp)
    n_new = len(subprocess.run(["ffmpeg", "-v", "error", "-i", tmp, "-map", "0:a:0", "-f", "f32le", "-acodec", "pcm_f32le", "-"], capture_output=True).stdout) // (4 * ch)
    if a["video"] != b["video"] or abs(n_new - n_total) > 0 or abs(a["audio"][0] - b["audio"][0]) > 0.0215:
        os.remove(tmp); sys.exit(f"✖ 片長或音畫對齊變了：原 {a}／{n_total} 樣本，新 {b}／{n_new} 樣本")
    os.replace(tmp, OUT)
    print(f"  片長檢查：影像 {b['video'][0]:.3f}s／{b['video'][1]} 幀（與原檔相同）、音軌 {n_new} 樣本（與原檔相同）")

main()
