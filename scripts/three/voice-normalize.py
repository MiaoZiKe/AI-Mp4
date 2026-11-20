#!/usr/bin/env python3
"""科技片配音統一（基準＝曝光機 tech-euv）：量測 → 音高（PSOLA，保留共振峰）→ 變速（atempo）→ 停頓 → 等化 → 音量與限幅 → 驗收。
全程不送 TTS 請求，只處理 public/audio/<slug>/.take-*.raw.orig.wav（Gemini 原始錄音）。

用法（都在專案根目錄跑，用 .venv 的 python）：
  .venv/bin/python scripts/three/voice-normalize.py <slug> --check      只量原始錄音，判定「可處理／建議重配」，不寫檔
  .venv/bin/python scripts/three/voice-normalize.py <slug>              處理並寫回 .take-*.raw.wav（舊檔備份到 out/old-<slug>-take/）
  .venv/bin/python scripts/three/voice-normalize.py <slug> --out=x.wav  處理但寫到別的路徑（試做，不動正式檔）
  .venv/bin/python scripts/three/voice-normalize.py --measure a.wav [--chars=N]   量任何一個音檔（和基準同一把尺）
  .venv/bin/python scripts/three/voice-normalize.py --make-ref <曝光機 raw.wav> --chars=248   重做基準檔 voice-ref-euv.json
  選項：--tempo=1.18（指定倍數）、--no-pitch、--no-eq、--pause-cap=0.70、--pause-knee=0.30、--pause-ratio=0.5、--orig=<原始檔>、--chars=N
處理完接著跑：bash scripts/three/make-tech.sh <slug> --dry   （resplit → align → validate → layout-check）

需要：ffmpeg、numpy、praat-parselmouth（.venv/bin/pip install praat-parselmouth）。
為什麼這樣做（2026/11/20 解析，數據在 docs/voice-normalize.md）：
  1. 音高不用 ffmpeg rubberband（降 4.5 半音時諧波糊掉、70Hz 以下多 12–15 dB 轟鳴，就是「爆音」），也不用 asetrate
     （共振峰一起往下掉 5–10%，聽起來像換了一個人）。改用 Praat 的 PSOLA：只動音高、共振峰不動。
  2. 音高不是整條平移：Gemini 偏高的那幾次其實是「起伏變大」（高的更高、低的差不多）。所以用
     f' = 基準中位數 ×（f ÷ 原中位數）^k，k＝基準起伏 ÷ 原起伏（只縮不放，下限 0.80）。
  3. 變速只用 atempo，倍數＝基準「扣掉停頓的語速」÷ 原始的，上限 1.25；要超過就是該重配。
  4. 最後才做音量：先高通 70Hz、對基準頻譜做 ±6 dB 以內的等化，再把響度拉到 −16 LUFS、限幅在 −2 dBFS，
     align 的 loudnorm 就不必再動態壓縮。
"""
import json, os, re, shutil, subprocess, sys, tempfile, time, glob
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
REF_PATH = os.path.join(HERE, "voice-ref-euv.json")
SR = 24000
EDGES = [100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 11500]

# 上限與驗收範圍（改這裡要同時改 docs/voice-normalize.md）
LIM = dict(
    tempo_max=1.25,          # atempo 上限；需要更快＝重配
    pitch_shift_max_st=3.0,  # 中位數要移超過 3 半音＝重配
    k_min=0.80,              # 起伏最多縮到 80%
    eq_max_db=6.0,           # 等化每一段最多 ±6 dB
    pause_cap=0.70,          # 處理後單一停頓上限（秒）
    pause_knee=0.30,         # 這個長度以下的停頓不動（句子之間至少留這麼久）
    pause_ratio=0.5,         # 超過 knee 的部分留幾成（1＝不縮）；基準片的句中停頓中位數只有 0.15 秒
    tempo_bias=1.02,         # 變速倍數＝基準÷原始×這個值（略快 2%，換少壓一點停頓）
)
ACCEPT = dict(               # 處理後要落在這裡（相對基準）
    f0_med_st=0.6,           # 音高中位數 ±0.6 半音
    range_st=(-2.5, 1.5),    # 10–90 百分位起伏（半音）相對基準
    artic=(-0.20, 0.25),     # 扣掉停頓的語速（字/秒）相對基準
    formant_pct=4.0,         # F1–F3 相對「原始錄音」最多偏 4%
    hnr_drop=1.5,            # 諧波清晰度（HNR）相對原始最多掉 1.5 dB
    sub70_db=-27.0,          # 70Hz 以下能量占比上限（dB）；基準 −31.8，rubberband 降 4.5 半音那版 −20
    peak_db=-1.0,            # 取樣峰值上限
    band_db=3.5,             # 三段頻帶（<300／300–3k／3k–8k）占比相對基準
)


def sh(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, **kw)


def dec(path, sr=SR):
    r = sh(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"])
    if r.returncode: sys.exit("ffmpeg 讀不到 " + path + "\n" + r.stderr.decode()[-300:])
    return np.frombuffer(r.stdout, dtype=np.float32).astype(np.float64)


def write_wav(path, x, sr=SR):
    import wave
    y = np.clip(x, -1, 1); y = (y * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(y.tobytes())


def frames(x, n, h):
    k = 1 + (len(x) - n) // h
    return x[np.arange(n)[None, :] + h * np.arange(k)[:, None]]


def find_pauses(x, sr=SR, thr_db=-38, minlen=0.10):
    """回傳 (說話起點秒, 終點秒, [(停頓起點秒, 長度秒)…])；門檻＝說話音量 95 百分位往下 38 dB"""
    n, h = int(.02 * sr), int(.005 * sr)
    rms = np.sqrt((frames(x, n, h) ** 2).mean(1))
    sil = rms < np.percentile(rms, 95) * 10 ** (thr_db / 20)
    sp = np.where(~sil)[0]; a, b = sp[0], sp[-1]
    runs, i = [], a
    while i <= b:
        if sil[i]:
            j = i
            while j <= b and sil[j]: j += 1
            if (j - i) * h / sr >= minlen: runs.append((i * h / sr, (j - i) * h / sr))
            i = j
        else: i += 1
    return a * h / sr, (b * h + n) / sr, runs


def ltas(x, sr=SR):
    """只算有聲音的地方；回傳各頻帶占 100–11500Hz 總能量的 dB，以及 70Hz 以下占全部的 dB"""
    F = frames(x, 2048, 1024); e = np.sqrt((F ** 2).mean(1)); F = F[e > np.percentile(e, 95) * 10 ** (-30 / 20)]
    S = (np.abs(np.fft.rfft(F * np.hanning(2048))) ** 2).mean(0); fr = np.fft.rfftfreq(2048, 1 / sr)
    tot = S[(fr >= EDGES[0]) & (fr < EDGES[-1])].sum()
    bands = [10 * np.log10(S[(fr >= a) & (fr < b)].sum() / tot + 1e-12) for a, b in zip(EDGES, EDGES[1:])]
    N = len(x); P = np.abs(np.fft.rfft(x)) ** 2; f2 = np.fft.rfftfreq(N, 1 / sr)
    sub = 10 * np.log10(P[(f2 >= 15) & (f2 < 70)].sum() / P.sum() + 1e-12)
    g = lambda a, b: float(10 * np.log10(S[(fr >= a) & (fr < b)].sum() / tot + 1e-12))
    return [round(float(v), 2) for v in bands], round(float(sub), 1), dict(lo=round(g(100, 300), 1), mid=round(g(300, 3000), 1), hi=round(g(3000, 8000), 1))


def loudness(path):
    e = sh(["ffmpeg", "-nostats", "-hide_banner", "-i", path, "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"], text=True).stderr
    e = e[e.rfind("Summary:"):]
    g = lambda k: float(re.search(k + r":\s+(-?[\d.]+)", e).group(1))
    return dict(lufs=g("I"), lra=g("LRA"), tp=g("Peak"))


def measure(path, chars=None):
    import parselmouth as pm
    x = dec(path)
    s = pm.Sound(x, sampling_frequency=SR)
    pit = s.to_pitch_ac(time_step=0.01, pitch_floor=60, pitch_ceiling=350, voicing_threshold=0.5, octave_jump_cost=0.5)
    fq = pit.selected_array["frequency"]; f = fq[fq > 0]; L = 12 * np.log2(f)
    fm = s.to_formant_burg(time_step=0.01, max_number_of_formants=5, maximum_formant=5000)
    F = np.array([[fm.get_value_at_time(k, t) for k in (1, 2, 3)] for t, q in zip(pit.xs(), fq) if q > 0]); F = F[~np.isnan(F).any(1)]
    hn = s.to_harmonicity_cc(0.01, 60, 0.1, 1.0).values; hn = hn[hn > -100]
    a, b, runs = find_pauses(x); ds = np.array([d for _, d in runs]) if runs else np.zeros(1)
    bands, sub, b3 = ltas(x)
    x48 = dec(path, 48000); pk = float(np.abs(x48).max())
    m = dict(sec=round(len(x) / SR, 2), speech_span=round(b - a, 2), pause_total=round(float(ds.sum()), 2), pause_n=len(runs),
             pause_med=round(float(np.median(ds)), 2), pause_max=round(float(ds.max()), 2),
             pause_lt03=int((ds < .3).sum()), pause_03_055=int(((ds >= .3) & (ds < .55)).sum()), pause_ge055=int((ds >= .55).sum()),
             f0_med=round(float(np.median(f)), 1), f0_p10=round(float(np.percentile(f, 10)), 1), f0_p90=round(float(np.percentile(f, 90)), 1),
             f0_sd_st=round(float(L.std()), 2), f0_range_st=round(float(np.percentile(L, 90) - np.percentile(L, 10)), 2),
             F1=int(np.median(F[:, 0])), F2=int(np.median(F[:, 1])), F3=int(np.median(F[:, 2])), hnr=round(float(hn.mean()), 1),
             sub70_db=sub, bands3=b3, ltas=bands, peak_db=round(20 * np.log10(pk + 1e-12), 2), clipped=int((np.abs(x48) >= 0.99).sum()))
    m.update(loudness(path))
    if chars:
        m.update(chars=chars, cps_incl=round(chars / (b - a), 2), cps_artic=round(chars / (b - a - ds.sum()), 2))
    return m


def count_chars(slug):
    sc = json.load(open(os.path.join(ROOT, "videos", slug, "script.json")))
    return sum(len(re.findall(r"[一-鿿]", q.get("tts") or q.get("narration") or "")) for q in sc["scenes"] if not q.get("silent"))


def psola(x, src_med, ref_med, k):
    import parselmouth as pm
    from parselmouth.praat import call
    s = pm.Sound(x, sampling_frequency=SR)
    man = call(s, "To Manipulation", 0.01, 60, 350)
    pt = call(man, "Extract pitch tier")
    call(pt, "Formula", f"{ref_med}*exp({k}*ln(self/{src_med}))")
    call([pt, man], "Replace pitch tier")
    return call(man, "Get resynthesis (overlap-add)").values[0].astype(np.float64)


def cap_pauses(x, cap, knee, ratio, sr=SR):
    """停頓整理（從靜音正中間拿掉、接點 12ms 交叉淡化）：超過 knee 秒的部分只留 ratio 倍，再超過 cap 的剪到 cap。
    knee 以下（逗號的小停頓）不動，所以句子之間至少還有 knee 秒。回傳 (新訊號, 動了幾處, 共剪掉幾秒)"""
    _, _, runs = find_pauses(x, sr)
    out, pos, n, cut = [], 0, 0, 0.0
    xf = int(.012 * sr)
    for st, d in runs:
        new = min(cap, d if d <= knee else knee + (d - knee) * ratio)
        if d - new < 0.03: continue
        rm = d - new; mid = st + d / 2
        a, b = int((mid - rm / 2) * sr), int((mid + rm / 2) * sr)
        seg = x[pos:a].copy(); tail = x[b:b + xf]
        if len(seg) >= xf and len(tail) == xf:
            w = np.linspace(0, 1, xf); seg[-xf:] = seg[-xf:] * (1 - w) + tail * w; pos = b + xf
        else: pos = b
        out.append(seg); n += 1; cut += rm
    out.append(x[pos:])
    return np.concatenate(out), n, round(cut, 2)


def eq_filter(src_bands, ref_bands, maxdb):
    g = np.array(ref_bands) - np.array(src_bands)
    g = np.convolve(np.pad(g, 1, mode="edge"), [.25, .5, .25], mode="valid")
    g = np.clip(g, -maxdb, maxdb)
    cs = [np.sqrt(a * b) for a, b in zip(EDGES, EDGES[1:])]
    ent = ["entry(0,0)", "entry(80,0)"] + [f"entry({c:.0f},{v:.2f})" for c, v in zip(cs, g)] + [f"entry(12000,{g[-1]:.2f})"]
    return "firequalizer=gain_entry='" + ";".join(ent) + "':delay=0.02", [round(float(v), 1) for v in g]


def ff_apply(xin, af):
    with tempfile.TemporaryDirectory() as td:
        a, b = os.path.join(td, "a.wav"), os.path.join(td, "b.wav")
        write_wav(a, xin)
        r = sh(["ffmpeg", "-v", "error", "-y", "-i", a, "-af", af, "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", b])
        if r.returncode: sys.exit("ffmpeg 濾鏡失敗：" + af + "\n" + r.stderr.decode()[-400:])
        return dec(b)


def verdict_raw(m, ref):
    """原始錄音能不能處理到接近基準；回傳 (建議重配的理由[], 提醒[])"""
    bad, warn = [], []
    dst = 12 * np.log2(m["f0_med"] / ref["f0_med"])
    if abs(dst) > LIM["pitch_shift_max_st"]: bad.append(f"音高中位數差基準 {dst:+.1f} 半音（上限 ±{LIM['pitch_shift_max_st']}）")
    if "cps_artic" in m:
        t = ref["cps_artic"] / m["cps_artic"]
        if t > LIM["tempo_max"]: bad.append(f"講得太慢：要加速 {t:.2f} 倍才到基準（上限 {LIM['tempo_max']}）")
        if t < 0.95: warn.append(f"原始就比基準快（{m['cps_artic']} 字/秒），不減速，照原速")
    if m["f0_range_st"] / ref["f0_range_st"] > 1 / LIM["k_min"]: warn.append(f"音高起伏 {m['f0_range_st']} 半音，比基準 {ref['f0_range_st']} 大很多，縮到下限後仍會偏戲劇化")
    if m["clipped"] > 0 or m["tp"] > 0: warn.append(f"原始錄音峰值頂滿（換算 48kHz 後 ≥0.99 的取樣 {m['clipped']} 個、真峰值 {m['tp']} dBTP）；腳本會先降 3 dB 再處理，重音聽起來破就重配")
    if m["bands3"]["hi"] - ref["bands3"]["hi"] < -LIM["eq_max_db"]: warn.append(f"高頻（3–8kHz）比基準少 {ref['bands3']['hi'] - m['bands3']['hi']:.1f} dB，等化補到上限仍會偏悶")
    return bad, warn


def check_out(m, src, ref):
    rows = []
    def row(name, val, lo, hi, unit=""):
        rows.append((name, val, f"{lo}～{hi}{unit}", lo <= val <= hi))
    row("音高中位數差基準（半音）", round(12 * np.log2(m["f0_med"] / ref["f0_med"]), 2), -ACCEPT["f0_med_st"], ACCEPT["f0_med_st"])
    row("音高起伏差基準（半音，10–90%）", round(m["f0_range_st"] - ref["f0_range_st"], 2), *ACCEPT["range_st"])
    if "cps_artic" in m: row("扣停頓語速差基準（字/秒）", round(m["cps_artic"] - ref["cps_artic"], 2), *ACCEPT["artic"])
    for k in ("F1", "F2", "F3"):
        row(f"{k} 相對原始錄音（%）", round((m[k] / src[k] - 1) * 100, 1), -ACCEPT["formant_pct"], ACCEPT["formant_pct"])
    row("諧波清晰度 HNR 相對原始（dB）", round(m["hnr"] - src["hnr"], 1), -ACCEPT["hnr_drop"], 99)
    row("70Hz 以下能量占比（dB）", m["sub70_db"], -99, ACCEPT["sub70_db"])
    row("取樣峰值（dBFS）", m["peak_db"], -99, ACCEPT["peak_db"])
    row("超過 0.99 的取樣數（48kHz）", m["clipped"], 0, 0)
    row("響度（LUFS）", m["lufs"], -17.5, -15.0)
    for k, n in (("lo", "100–300Hz"), ("mid", "300–3kHz"), ("hi", "3–8kHz")):
        row(f"{n} 占比差基準（dB）", round(m["bands3"][k] - ref["bands3"][k], 1), -ACCEPT["band_db"], ACCEPT["band_db"])
    row("最長停頓（秒）", m["pause_max"], 0, LIM["pause_cap"] + 0.06)
    return rows


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    opt = dict(a[2:].split("=", 1) if "=" in a else (a[2:], True) for a in sys.argv[1:] if a.startswith("--"))
    os.chdir(ROOT)
    if "make-ref" in opt:
        m = measure(args[0], int(opt["chars"])); m["_file"] = args[0]; m["_說明"] = "曝光機（tech-euv）處理後整篇錄音的量測值；voice-normalize.py 的基準"
        json.dump(m, open(REF_PATH, "w"), ensure_ascii=False, indent=1); print("寫了", REF_PATH); return
    if "measure" in opt:
        print(json.dumps(measure(args[0], int(opt["chars"]) if "chars" in opt else None), ensure_ascii=False)); return
    if not args: sys.exit(__doc__)
    slug = args[0]; ref = json.load(open(REF_PATH))
    chars = int(opt["chars"]) if "chars" in opt else count_chars(slug)
    pub = os.path.join("public", "audio", slug)
    orig = opt.get("orig")
    if not orig:
        c = sorted(glob.glob(os.path.join(pub, ".take-*.raw.orig.wav")), key=os.path.getmtime)
        if not c: sys.exit(f"找不到 {pub}/.take-*.raw.orig.wav（原始錄音）；用 --orig=<檔> 指定")
        orig = c[-1]
    raw = orig.replace(".raw.orig.wav", ".raw.wav")
    print(f"■ {slug}｜原始錄音 {orig}｜念稿 {chars} 字")
    src = measure(orig, chars)
    bad, warn = verdict_raw(src, ref)
    print(f"  原始：音高 {src['f0_med']} Hz（基準 {ref['f0_med']}）、起伏 {src['f0_range_st']} 半音（基準 {ref['f0_range_st']}）、扣停頓 {src['cps_artic']} 字/秒（基準 {ref['cps_artic']}）、"
          f"含停頓 {src['cps_incl']}、峰值 {src['peak_db']} dBFS、高頻占比 {src['bands3']['hi']} dB（基準 {ref['bands3']['hi']}）")
    for w in warn: print("  ⚠", w)
    for b in bad: print("  ✖ 建議重配：", b)
    if "check" in opt:
        print("  判定：" + ("建議重配（同一份念稿再生成一次）" if bad else "可以處理")); sys.exit(1 if bad else 0)

    x = dec(orig); log = {}
    # 0. 先降 3 dB 留空間（Gemini 給的錄音常常頂滿，取樣間峰值會超過滿刻度）
    x = x * 0.707
    # 1. 音高（PSOLA）
    dst = 12 * np.log2(src["f0_med"] / ref["f0_med"])
    k = float(np.clip(ref["f0_range_st"] / src["f0_range_st"], LIM["k_min"], 1.0))
    if "no-pitch" in opt or (abs(dst) < 0.5 and k > 0.93):
        log["pitch"] = "不動（差距在 0.5 半音內）"
    else:
        tgt = src["f0_med"] * 2 ** (-np.clip(dst, -LIM["pitch_shift_max_st"], LIM["pitch_shift_max_st"]) / 12)
        x = psola(x, src["f0_med"], tgt, k)
        log["pitch"] = f"PSOLA：中位數 {src['f0_med']}→{tgt:.1f} Hz（{-dst:+.2f} 半音）、起伏 ×{k:.2f}"
    # 2. 變速（atempo）
    tempo = float(opt["tempo"]) if "tempo" in opt else float(np.clip(ref["cps_artic"] / src["cps_artic"] * LIM["tempo_bias"], 1.0, LIM["tempo_max"]))
    if abs(tempo - 1) > 0.005: x = ff_apply(x, f"atempo={tempo:.4f}")
    log["tempo"] = f"atempo {tempo:.3f}"
    # 3. 停頓上限
    cap = float(opt.get("pause-cap", LIM["pause_cap"]))
    knee, ratio = float(opt.get("pause-knee", LIM["pause_knee"])), float(opt.get("pause-ratio", LIM["pause_ratio"]))
    x, n, cut = cap_pauses(x, cap, knee, ratio)
    log["pause"] = f"停頓：超過 {knee} 秒的部分留 {ratio} 倍、上限 {cap} 秒，動了 {n} 處（共剪 {cut} 秒）"
    # 4. 高通＋等化
    af = ["highpass=f=70:poles=2"]
    if "no-eq" not in opt:
        b, _, _ = ltas(ff_apply(x, af[0]))
        f, g = eq_filter(b, ref["ltas"], LIM["eq_max_db"]); af.append(f); log["eq"] = "各頻帶增益 dB（100Hz→11.5kHz）：" + " ".join(f"{v:+.1f}" for v in g)
    x = ff_apply(x, ",".join(af))
    # 5. 音量：拉到 −16 LUFS，峰值用限幅器壓在 −2 dBFS（48kHz 下做，避免取樣間峰值）
    with tempfile.TemporaryDirectory() as td:
        a, b = os.path.join(td, "a.wav"), os.path.join(td, "b.wav"); write_wav(a, x)
        gain = -16.0 - loudness(a)["lufs"]
        for _ in range(3):
            sh(["ffmpeg", "-v", "error", "-y", "-i", a, "-af", f"aresample=48000,volume={gain:.2f}dB,alimiter=limit=0.794:attack=3:release=40:level=disabled,aresample={SR}", "-ac", "1", "-c:a", "pcm_s16le", b])
            d = -16.0 - loudness(b)["lufs"]
            if abs(d) < 0.15: break
            gain += d
        log["level"] = f"增益 {gain:+.1f} dB、限幅 −2 dBFS"
        out = opt.get("out") or raw
        if not opt.get("out") and os.path.exists(raw):
            bk = os.path.join("out", f"old-{slug}-take"); os.makedirs(bk, exist_ok=True)
            shutil.copy2(raw, os.path.join(bk, os.path.basename(raw) + "." + time.strftime("%m%d-%H%M%S")))
            print(f"  舊的 {raw} 備份到 {bk}/")
        shutil.copy2(b, out)
    # 6. 驗收
    m = measure(out, chars); rows = check_out(m, src, ref); ok = all(r[3] for r in rows)
    print("  處理：" + "｜".join(f"{v}" for v in log.values()))
    print(f"  結果：{out}｜{m['sec']} 秒｜音高 {m['f0_med']} Hz｜扣停頓 {m['cps_artic']}、含停頓 {m['cps_incl']} 字/秒｜{m['lufs']} LUFS、峰值 {m['peak_db']} dBFS")
    for name, val, rng, good in rows: print(f"  {'✔' if good else '✖'} {name}：{val}（要 {rng}）")
    rep = dict(slug=slug, orig=orig, out=out, chars=chars, steps=log, source=src, result=m, reference={k: v for k, v in ref.items() if not k.startswith("_")},
               checks=[dict(name=a, value=b, range=c, ok=bool(d)) for a, b, c, d in rows], rawWarnings=warn, rawRedo=bad, ok=bool(ok))
    rp = os.path.join("out", f"{slug}-voice-normalize.json"); os.makedirs("out", exist_ok=True); json.dump(rep, open(rp, "w"), ensure_ascii=False, indent=1)
    print(f"  報告 {rp}｜" + ("✔ 全部通過；接著跑 bash scripts/three/make-tech.sh " + slug + " --dry" if ok else "✖ 有項目沒過，先不要渲染"))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
