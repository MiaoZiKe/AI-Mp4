#!/usr/bin/env python3
"""運作音效的三種混音取向（Andy 2026/11/27：「改完之後沒有比較好，幫我找人優化」）。依賴：python3＋numpy。

  A 頻段分離：不靠大幅壓低。音效依頻段拆成低（<300 Hz）／中（300～4 kHz）／高（>4 kHz）三條：
      中頻（人聲所在）永遠挖掉 A_MID_CUT_DB，低頻嗡聲與高頻嘶聲照常；旁白講話時整體只再輕壓 A_DUCK_DB（4～6 dB），
      放開 ≥ 0.8 秒。整條音效平穩連續，講話時不會消失。關卡＝人聲頻段（1～4 kHz）音效比旁白低 ≥14 dB。
  B 底噪＋重點：整片一條很穩的機房底噪（低頻轟＋風扇泛音＋高頻空氣，1～4 kHz 幾乎沒有；不隨旁白起伏），
      只有關鍵動作（clunk、閥門、thump）是事件音，每個事件自動移到旁白停頓處（找不到夠長的停頓就縮短、降音量保留）。
      關卡＝人聲頻段（1～4 kHz）≥14 dB，並逐事件確認。
  C 上一版改良：保留「講話區段壓低」，但壓低量固定 C_DUCK_DB（−12 dB）、放開改 C_RELEASE_S（≥1 秒長尾），
      不再逐區段變動壓低量；整體音量改成全片一個固定係數（不夠 14 dB 就整條降，不逐區段加壓），消除停頓冒出來的感覺。
      關卡＝講話窗全頻段 ≥14 dB（同舊版）。

用法（add-sfx.sh --style 會呼叫，也可單獨用）：
  python3 sfx-styles.py mix <A|B|C> <原旁白音軌.wav 48k16bit> <cues-table.json> <輸出.wav> [--end 片尾卡秒] [--report r.json]
  python3 sfx-styles.py check <A|B|C> <原旁白音軌.wav> <成片解碼音軌.wav> [--end 秒] [--report r.json]   不過關結束碼 1
  python3 sfx-styles.py plot <voice.wav> <圖.png> A=<final_A.wav> B=<final_B.wav> C=<final_C.wav> [--end 秒]   增益／頻譜對照圖（需 matplotlib）
三版共用擬真音色（sfx-synth.py 的 REAL 模式：多層疊合、隨機微變化、輕微殘響；固定 seed）。
"""
import sys, os, json, math, importlib.util
import numpy as np

_sp = importlib.util.spec_from_file_location('sfx_synth', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx-synth.py'))
syn = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(syn)
SR = syn.SR; db = syn.db; HOP = int(0.02 * SR)

BAND = (1000.0, 4000.0)       # 人聲清晰度頻段
GATE_DB = 14.0                # 硬關卡
MARGIN_DB = 1.5               # 混音時多留的餘裕（AAC 誤差）
LEVEL_BELOW = -10.0           # 同舊版：未壓低時 sfx 動音段比旁白講話段低 10 dB

# --- A
A_MID = (300.0, 4000.0); A_MID_CUT_DB = -13.0; A_DUCK_DB = -5.0; A_HOLE_DB = -22.0; A_FULL_GATE_DB = 8.0   # 1～4 kHz 再多挖 A_HOLE_DB（300～1k 只挖 A_MID_CUT_DB）
A_ATTACK_S = 0.18; A_RELEASE_S = 0.9; A_LEAD_S = 0.15; A_GAP_FILL_S = 0.8
# --- B
B_BED_BELOW = -26.0           # 底噪 RMS 比旁白講話段 RMS 低（再受 1～4 kHz 關卡限制）
B_EVENT_BELOW = -9.0          # 事件音 20 ms 峰值窗比旁白講話段 RMS 低
B_EVENT_KINDS = ('clunk', 'valve', 'thump')
B_EVENT_LEN = dict(clunk=0.22, valve=0.10, thump=0.28)    # 事件音「有感」的長度（之後是自然尾巴）
B_SHIFT_BACK_S = 0.30; B_SHIFT_FWD_S = 0.90               # 事件可以往前／往後移多少
B_MIN_PAUSE_S = 0.12
# --- C
C_DUCK_DB = -12.0; C_ATTACK_S = 0.08; C_RELEASE_S = 1.3; C_LEAD_S = 0.15; C_GAP_FILL_S = 0.8


def bandpass(x, lo=None, hi=None, slope=4.0):
    return np.stack([syn.fft_filter(c, lo, hi, slope) for c in x])

def rms_db(x, hop=HOP):
    return 20 * np.log10(syn.frame_rms(x, hop) + 1e-12)

def speech_mask(ve, end_n):
    m = np.zeros(len(ve), bool); lim = min(end_n, len(ve))
    m[:lim] = ve[:lim] > ve[:lim].max() * db(-26)
    return m

def fill_gaps(m, sec):
    f = m.copy(); idx = np.where(m)[0]
    for a, b in zip(idx[:-1], idx[1:]):
        if 1 < b - a <= int(sec / 0.02): f[a:b] = True
    return f

def regions(f):
    r = []; st = None
    for i in range(len(f) + 1):
        on = i < len(f) and f[i]
        if on and st is None: st = i
        if not on and st is not None: r.append((st, i)); st = None
    return r

def smooth_db(tgt, attack_s, release_s):
    """dB 上的一階平滑：往下（壓低）用 attack、往上（放開）用 release。"""
    a_dn = math.exp(-0.02 / attack_s); a_up = math.exp(-0.02 / release_s)
    cur = np.zeros(len(tgt)); c = 0.0
    for i, t in enumerate(tgt):
        c = t + (c - t) * (a_dn if t < c else a_up); cur[i] = c
    return cur

def duck_curve(filled, duck_db, lead_s, attack_s, release_s):
    tgt = np.zeros(len(filled)); lead = int(lead_s / 0.02)
    for r0, r1 in regions(filled): tgt[max(0, r0 - lead):r1] = duck_db
    return smooth_db(tgt, attack_s, release_s)

def apply_curve(x, curve):
    xs = (np.arange(len(curve)) + 0.5) * HOP
    return x * (10 ** (np.interp(np.arange(x.shape[1]), xs, curve) / 20))[None, :]

def fade_end(x, end):
    if end is None: return x
    i = int(end * SR); k = int(0.1 * SR)
    x[:, max(0, i - k):i] *= np.linspace(1, 0, min(k, i)); x[:, i:] = 0
    return x

def calibrate(s, ve, spk):
    """同舊版：sfx 動音段 RMS 比旁白講話段低 LEVEL_BELOW，瞬間峰值軟限幅在平均的 3 倍。"""
    sm = syn.frame_rms(s, HOP); act = sm > sm.max() * db(-40)
    r = float(np.sqrt((sm[act] ** 2).mean())); cap = 3.0 * r; s = np.tanh(s / cap) * cap
    sm = syn.frame_rms(s, HOP); r = float(np.sqrt((sm[act] ** 2).mean()))
    return s * (float(np.sqrt((ve[spk] ** 2).mean())) * db(LEVEL_BELOW) / r)

def band_mask(v, spk):
    """人聲頻段關卡只看「旁白在 1～4 kHz 真的有聲音」的窗（比該頻段最大值低 26 dB 以內）；沒有人聲能量的窗沒東西可遮。"""
    vb = syn.frame_rms(bandpass(v, *BAND), HOP); n = min(len(vb), len(spk))
    m = np.zeros(len(spk), bool); m[:n] = spk[:n] & (vb[:n] > vb[:n][spk[:n]].max() * db(-26)); return m

def peak_guard(s, v, mask, band, release_s, iters=4, gate=None):
    """快速峰值護欄：只把「差距不到門檻」的窗（含前後各 1 窗）瞬間壓到門檻＋餘裕，之後用 release_s 慢慢放開。
    band＝(lo,hi) 只動該頻段的成分（A、B 用，其餘頻段不受影響）；band=None 動全頻段（C 用）。"""
    gate = GATE_DB if gate is None else gate
    for _ in range(iters):
        if band: part = bandpass(s, *band); rest = s - part
        else: part = s; rest = 0
        gp = np.full(len(mask), 99.0); ve = syn.frame_rms(bandpass(v, *band) if band else v, HOP); se = syn.frame_rms(part, HOP)
        nn = min(len(ve), len(se), len(mask)); gp[:nn] = 20 * np.log10(ve[:nn] / np.maximum(se[:nn], 1e-9))
        need = np.where(mask, np.minimum(0, gp - (gate + MARGIN_DB)), 0.0)      # 負數＝要壓幾 dB
        if need.min() >= -0.05: break
        nd = need.copy()
        for d in (1, 2): nd = np.minimum(nd, np.minimum(np.roll(need, d), np.roll(need, -d)))
        cur = smooth_db(nd - 0.3 * (nd < 0), 0.004, release_s)
        part = apply_curve(part, cur); s = rest + part
    return s

def load(voice):
    v = syn.read_wav(voice)
    return np.vstack([v, v]) if v.shape[0] == 1 else v

def render(cues, total, end, kinds=None, exclude=None):
    syn.REAL = True
    c = [z for z in cues if (kinds is None or z['kind'] in kinds) and (exclude is None or z['kind'] not in exclude)]
    buf, _ = syn.render_cues(c, total, end)
    return buf


def gaps_of(v, s, spk, band=None):
    """講話窗逐窗：旁白 vs 音效 的 dB 差。band＝(lo,hi) 只看該頻段。"""
    if band: v = bandpass(v, *band); s = bandpass(s, *band)
    ve = syn.frame_rms(v, HOP); se = syn.frame_rms(s, HOP)
    n = min(len(ve), len(se), len(spk))
    g = 20 * np.log10(ve[:n] / np.maximum(se[:n], 1e-9))
    return g[spk[:n]]


# ================================================================ A
def mix_A(v, cues, total, end):
    n = v.shape[1]; ve = syn.frame_rms(v, HOP)
    spk = speech_mask(ve, int((end or n / SR) * SR) // HOP); filled = fill_gaps(spk, A_GAP_FILL_S)
    s = render(cues, total, end)
    s = np.pad(s, ((0, 0), (0, max(0, n - s.shape[1]))))[:, :n]
    lo = bandpass(s, None, A_MID[0], 3.0); hi = bandpass(s, A_MID[1], None, 3.0)
    mid = s - lo - hi
    s = calibrate(s, ve, spk); lo = bandpass(s, None, A_MID[0], 3.0); hi = bandpass(s, A_MID[1], None, 3.0); mid = s - lo - hi
    core = bandpass(mid, *BAND)                                   # 1～4 kHz 是旁白清晰度最要緊的一段
    s = lo + hi + (mid - core) * db(A_MID_CUT_DB) + core * db(A_MID_CUT_DB + A_HOLE_DB)   # 永遠挖掉人聲頻段（不是只在講話時）
    s = apply_curve(s, duck_curve(filled, A_DUCK_DB, A_LEAD_S, A_ATTACK_S, A_RELEASE_S))   # 講話時只再輕壓 5 dB，≥0.9 s 放開
    s = peak_guard(s, v, spk, None, 0.8, gate=A_FULL_GATE_DB)    # 全頻段次要護欄（低頻嗡聲不准蓋到小聲的字）：只動最差的幾窗，0.8 s 放開
    s = peak_guard(s, v, band_mask(v, spk), BAND, 0.15)           # 只護欄 1～4 kHz 的瞬間峰值（clunk／閥門的尖音），低頻與高頻不動
    return s, spk, dict(duck_db=A_DUCK_DB, mid_cut_db=A_MID_CUT_DB, hole_db=A_HOLE_DB, release_s=A_RELEASE_S)


# ================================================================ B
def bed(n, end):
    """機房底噪：棕噪低頻轟（<200 Hz）＋風扇葉片泛音（60/120/180 Hz，緩慢起伏）＋高頻空氣（>5.5 kHz）。1～4 kHz 用陡峭濾波幾乎清空。"""
    t = np.arange(n) / SR; out = np.zeros((2, n))
    for ch in range(2):
        low = syn.fft_filter(np.cumsum(syn.white(n)), 25, 200, 3.0)   # 棕噪（FFT 濾波去掉直流漂移）
        low /= np.std(low) + 1e-9
        fan = sum(a * np.sin(2 * np.pi * f * (1 + 0.002 * np.sin(2 * np.pi * 0.07 * t + ch)) * t + 1.7 * ch + k)
                  for k, (f, a) in enumerate([(60.0, 0.8), (120.0, 0.55), (180.0, 0.28)]))
        fan *= 1 + 0.12 * np.sin(2 * np.pi * 0.11 * t + ch)
        air = syn.fft_filter(syn.white(n), 5500, 11000, 3.0); air /= np.std(air) + 1e-9
        out[ch] = 0.9 * low + 0.45 * fan + 0.07 * air
    k = int(1.5 * SR); out[:, :k] *= np.linspace(0, 1, k) ** 2          # 開頭 1.5 秒淡入
    return fade_end(out, end)

def find_pause_slots(spk, n_frames):
    """旁白停頓清單（秒）：連續非講話窗；開頭尾端也算。"""
    out = []; st = None
    for i in range(n_frames + 1):
        off = i < n_frames and not spk[i]
        if off and st is None: st = i
        if not off and st is not None:
            if (i - st) * 0.02 >= B_MIN_PAUSE_S: out.append((st * 0.02, i * 0.02))
            st = None
    return out

def mix_B(v, cues, total, end):
    n = v.shape[1]; ve = syn.frame_rms(v, HOP)
    spk = speech_mask(ve, int((end or n / SR) * SR) // HOP)
    voice_rms = float(np.sqrt((ve[spk] ** 2).mean()))
    pauses = find_pause_slots(spk, len(ve))
    # ① 底噪
    b = bed(n, end)
    # ② 事件：clunk／valve／thump 搬到停頓
    ev = [dict(c) for c in cues if c['kind'] in B_EVENT_KINDS and (end is None or c['t'] < end - 0.3)]
    # 同一組動作的 clunk 靠得很近（<0.25 s）只留第一個，避免連續敲擊塞滿停頓
    ev.sort(key=lambda z: z['t']); keep = []
    for e in ev:
        if keep and e['t'] - keep[-1]['t'] < 0.25: continue
        keep.append(e)
    ev = keep
    placed = []; used = []
    for e in ev:
        L = B_EVENT_LEN[e['kind']]; t0 = e['t']; best = None
        for p0, p1 in pauses:
            if p1 < t0 - B_SHIFT_BACK_S - 0.05 or p0 > t0 + B_SHIFT_FWD_S: continue
            if any(abs(p0 - u) < 1e-6 for u in used): continue
            room_len = p1 - p0
            tt = min(max(t0, p0 + 0.01), max(p0 + 0.01, p1 - min(L, room_len) - 0.01))
            if tt < t0 - B_SHIFT_BACK_S: continue
            cost = abs(tt - t0) + (0 if room_len >= L + 0.03 else 0.6 * (L - room_len))
            if best is None or cost < best[0]: best = (cost, tt, room_len, p0, p1)
        if best is None:                       # 附近沒有停頓：原位縮小（−14 dB）保留，讓動作還有一點聲音
            placed.append(dict(t=t0, kind=e['kind'], gain=-14.0, trim=L * 0.6, moved=0.0, fit='縮小原位')); continue
        _, tt, room_len, p0, p1 = best; used.append(p0)
        fit = room_len >= L + 0.03
        g = 0.0 if fit else float(np.clip(20 * math.log10(max(room_len, 0.05) / L), -12, 0))   # 停頓不夠就縮小
        placed.append(dict(t=tt, kind=e['kind'], gain=g, trim=(None if fit else max(room_len - 0.02, 0.06)), moved=tt - t0, fit='放進停頓' if fit else '縮小塞入'))
    syn.REAL = True
    ebuf = np.zeros((2, n)); ref = voice_rms * db(B_EVENT_BELOW)
    for p, e in zip(placed, ev):
        c = dict(t=0.0, kind=p['kind'], dur=0.0, pan=e.get('pan', 0.5), params=e.get('params') or {}, gain=0.0)
        one, _ = syn.render_cues([c], 1.2, None)
        one = one[:, :int(1.2 * SR)]
        if p['trim']:
            k = int(p['trim'] * SR); f = int(min(0.04, p['trim'] / 2) * SR)
            one[:, k:] = 0; one[:, max(0, k - f):k] *= np.linspace(1, 0, min(f, k))
        pk = np.max(np.abs(syn.frame_rms(one, HOP))) + 1e-9
        one = one / pk * ref * db(p['gain'])
        i0 = int(p['t'] * SR); m = min(one.shape[1], n - i0)
        if m > 0: ebuf[:, i0:i0 + m] += one[:, :m]
    ebuf = fade_end(ebuf, end)
    # ③ 底噪音量：RMS 比旁白講話段低 B_BED_BELOW，再受 1～4 kHz 關卡限制
    bg = voice_rms * db(B_BED_BELOW) / (np.sqrt((syn.frame_rms(b, HOP)[:int((end or n / SR) / 0.02)] ** 2).mean()) + 1e-9)
    b = b * bg
    # ④ 1～4 kHz 護欄：底噪沒有這段，只會動到事件音的尖音
    s = b + ebuf
    s = peak_guard(s, v, band_mask(v, spk), BAND, 0.15)
    info = dict(bed_below_db=B_BED_BELOW, events=len(placed), moved_n=sum(1 for p in placed if abs(p['moved']) > 0.02),
                fit_in_pause=sum(1 for p in placed if p['fit'] == '放進停頓'), shrunk=sum(1 for p in placed if p['fit'] != '放進停頓'),
                mean_shift_s=round(float(np.mean([abs(p['moved']) for p in placed])), 3) if placed else 0)
    return s, spk, info


# ================================================================ C
def mix_C(v, cues, total, end):
    n = v.shape[1]; ve = syn.frame_rms(v, HOP)
    spk = speech_mask(ve, int((end or n / SR) * SR) // HOP); filled = fill_gaps(spk, C_GAP_FILL_S)
    s = render(cues, total, end)
    s = np.pad(s, ((0, 0), (0, max(0, n - s.shape[1]))))[:, :n]
    sm = syn.frame_rms(s, HOP); act = sm > sm.max() * db(-40)
    sfx_rms = float(np.sqrt((sm[act] ** 2).mean())); voice_rms = float(np.sqrt((ve[spk] ** 2).mean()))
    cap = 3.0 * sfx_rms; s = np.tanh(s / cap) * cap
    sm = syn.frame_rms(s, HOP); sfx_rms = float(np.sqrt((sm[act] ** 2).mean()))
    s = s * (voice_rms * db(LEVEL_BELOW) / sfx_rms)
    s = apply_curve(s, duck_curve(filled, C_DUCK_DB, C_LEAD_S, C_ATTACK_S, C_RELEASE_S))   # 固定 −12 dB，放開 1.3 s
    s = peak_guard(s, v, spk, None, 0.4)                                                   # 只剩零星尖峰超標：快壓、0.4 s 放開（不再逐區段變動壓低量）
    return s, spk, dict(duck_db=C_DUCK_DB, release_s=C_RELEASE_S)


MIXERS = dict(A=mix_A, B=mix_B, C=mix_C)


def stats(v, s, end, hop_s=0.02):
    """講話中聽得到的程度、停頓時音量變化、人聲頻段差距（s＝音效成分，成片殘差或混音前的音效軌）。"""
    n = min(v.shape[1], s.shape[1]); v = v[:, :n]; s = s[:, :n]
    ve = syn.frame_rms(v, HOP); se = syn.frame_rms(s, HOP)
    nf = min(len(ve), len(se)); ve = ve[:nf]; se = se[:nf]
    lim = int((end or n / SR) * SR) // HOP
    spk = np.zeros(nf, bool); spk[:lim] = ve[:lim] > ve[:lim].max() * db(-26)
    inside = np.zeros(nf, bool); inside[:lim] = True
    pause = inside & ~spk
    voice_rms = float(np.sqrt((ve[spk] ** 2).mean()))
    gb = 20 * np.log10(ve[spk] / np.maximum(se[spk], 1e-9))
    gp = gaps_of(v, s, band_mask(v, spk), BAND)
    sdb = 20 * np.log10(se + 1e-12)
    # 「有音效」的窗才算（避免靜音窗把平均拉低）：全片 sfx 響度前 85% 的窗
    thr = np.percentile(sdb[inside], 15)
    sp_l = sdb[spk & (sdb > thr)]; pa_l = sdb[pause & (sdb > thr)]
    sp_med = float(np.median(sp_l)) if len(sp_l) else float('nan'); pa_med = float(np.median(pa_l)) if len(pa_l) else float('nan')
    pa90 = float(np.percentile(pa_l, 90)) if len(pa_l) else float('nan')   # 停頓裡最大聲的那一批窗（冒出來的程度）
    # 以 0.5 秒為塊看相鄰塊的 dB 跳動（斷斷續續感）：越小越平穩
    blk = int(0.5 / 0.02); k = (inside.sum() // blk)
    bl = np.array([10 * np.log10((se[i * blk:(i + 1) * blk] ** 2).mean() + 1e-14) for i in range(k)])
    jump = float(np.mean(np.abs(np.diff(bl)))) if len(bl) > 1 else 0.0
    return dict(
        speech_sfx_below_voice_db=round(float(np.median(gb)), 1),         # 講話中音效比旁白低多少（中位數）
        speech_gap_worst_db=round(float(gb.min()), 1),                    # 全頻段最差窗
        band_gap_median_db=round(float(np.median(gp)), 1),                # 1～4 kHz 中位數
        band_gap_worst_db=round(float(gp.min()), 1),                      # 1～4 kHz 最差窗（人聲清晰度關卡）
        sfx_level_speech_db=round(sp_med - 20 * math.log10(voice_rms), 1),   # 講話時音效相對旁白講話 RMS 的 dB
        sfx_level_pause_db=round(pa_med - 20 * math.log10(voice_rms), 1),
        pause_minus_speech_db=round(pa_med - sp_med, 1),
        pause_p90_minus_speech_db=round(pa90 - sp_med, 1),               # 停頓時最大聲 10% 的窗比講話中位數大幾 dB（冒出來的幅度）                  # 停頓時比講話時大聲幾 dB（越小越不會「冒出來」）
        block_jump_db=round(jump, 1),                                     # 0.5 秒塊與塊之間的平均跳動（越小越平穩）
        speech_windows=int(spk.sum()), pause_windows=int(pause.sum()),
        windows_below_14_band=int((gp < GATE_DB).sum()), windows_below_14_full=int((gb < GATE_DB).sum()))


def cmd_mix(a):
    st, voice, cj, out = a[0], a[1], a[2], a[3]
    end = float(a[a.index('--end') + 1]) if '--end' in a else None
    d = json.load(open(cj)); cues = d['cues'] if isinstance(d, dict) else d
    end = end if end is not None else (d.get('endCardSec') if isinstance(d, dict) else None)
    v = load(voice); n = v.shape[1]; total = n / SR
    s, spk, info = MIXERS[st](v, cues, total, end)
    s = fade_end(s, end)
    stt = stats(v, s, end)
    print(f'[風格 {st}] {json.dumps(info, ensure_ascii=False)}')
    print(f'[風格 {st}] 混音前量測 {json.dumps(stt, ensure_ascii=False)}')
    gate = stt['speech_gap_worst_db'] if st == 'C' else stt['band_gap_worst_db']
    if gate < GATE_DB: sys.exit(f'錯誤：風格 {st} 講話窗最小差距 {gate} dB < {GATE_DB}，不輸出')
    syn.write_wav(out, v + s)
    if '--report' in a: json.dump(dict(style=st, info=info, stats=stt), open(a[a.index('--report') + 1], 'w'), ensure_ascii=False, indent=1)


def cmd_check(a):
    st, voice, dec = a[0], a[1], a[2]
    end = float(a[a.index('--end') + 1]) if '--end' in a else None
    v = syn.read_wav(voice); f = syn.read_wav(dec)
    n = min(v.shape[1], f.shape[1]); v = v[:, :n]; f = f[:, :n]
    c = np.fft.irfft(np.fft.rfft(f[0]) * np.conj(np.fft.rfft(v[0])), n=2 * n)
    lag = int(np.argmax(c)); lag = lag if lag < n else lag - 2 * n
    if lag: f = np.roll(f, -lag, axis=1)
    k = (f * v).sum() / (v * v).sum(); res = f - k * v
    stt = stats(k * v, res, end)
    gate = stt['speech_gap_worst_db'] if st == 'C' else stt['band_gap_worst_db']
    name = '全頻段' if st == 'C' else '人聲頻段 1～4 kHz'
    print(f'成片解碼後 [{st}] {name}講話窗最小差距 {gate} dB（門檻 {GATE_DB}；<14 的窗 {stt["windows_below_14_full" if st == "C" else "windows_below_14_band"]} 個；對齊偏移 {lag} 樣本）')
    print(f'成片解碼後量測 {json.dumps(stt, ensure_ascii=False)}')
    if '--report' in a: json.dump(dict(style=st, stats=stt), open(a[a.index('--report') + 1], 'w'), ensure_ascii=False, indent=1)
    if gate < GATE_DB: sys.exit(1)


def cmd_plot(a):
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    for fn in ('Noto Sans CJK TC', 'Noto Sans CJK JP', 'WenQuanYi Zen Hei', 'Droid Sans Fallback'):
        try:
            from matplotlib import font_manager as fm
            if any(fn in x.name for x in fm.fontManager.ttflist): plt.rcParams['font.sans-serif'] = [fn]; break
        except Exception: pass
    plt.rcParams['axes.unicode_minus'] = False
    voice = syn.read_wav(a[0]); end = float(a[a.index('--end') + 1]) if '--end' in a else None
    vs = {x.split('=')[0]: x.split('=')[1] for x in a[2:] if '=' in x and not x.startswith('--')}
    n0 = voice.shape[1]; lim = int((end or n0 / SR) * SR)
    fig, ax = plt.subplots(3, 1, figsize=(15, 11), gridspec_kw=dict(height_ratios=[1.2, 1, 1]))
    t = (np.arange(n0 // HOP) + 0.5) * 0.02; ve = syn.frame_rms(voice, HOP)
    spk = speech_mask(ve, lim // HOP)
    ax[0].fill_between(t, -70, 0, where=np.append(spk, False)[:len(t)] if len(spk) < len(t) else spk[:len(t)], color='#f2c14e', alpha=.25, step='mid', label='旁白講話區')
    col = dict(A='#2a7f8f', B='#e8613c', C='#6b5b95')
    spec = {}
    for k, p in vs.items():
        f = syn.read_wav(p); n = min(n0, f.shape[1]); c = np.fft.irfft(np.fft.rfft(f[0, :n]) * np.conj(np.fft.rfft(voice[0, :n])), n=2 * n)
        lag = int(np.argmax(c)); lag = lag if lag < n else lag - 2 * n
        f = np.roll(f, -lag, axis=1)[:, :n]; kk = (f * voice[:, :n]).sum() / (voice[:, :n] ** 2).sum(); res = f - kk * voice[:, :n]
        se = syn.frame_rms(res, HOP); ax[0].plot(t[:len(se)], 20 * np.log10(se[:len(t)] + 1e-9), color=col.get(k), lw=1.0, label=f'{k} 音效（成片殘差）')
        spec[k] = res[:, :lim].mean(0)
    ax[0].plot(t, 20 * np.log10(ve[:len(t)] + 1e-9), color='#14213d', lw=.8, alpha=.7, label='旁白')
    ax[0].set_ylim(-80, -5); ax[0].set_xlim(0, (end or n0 / SR)); ax[0].set_ylabel('dBFS（20 ms RMS）'); ax[0].set_title('三版音效增益走向（講話區底色）'); ax[0].legend(ncol=5, fontsize=8); ax[0].grid(alpha=.2)
    # 每版在講話窗 vs 停頓窗的 sfx dB 分佈
    for k, sp in spec.items():
        se = syn.frame_rms(np.vstack([sp, sp]), HOP); ml = min(len(se), len(spk)); s_db = 20 * np.log10(se[:ml] + 1e-9)
        ax[1].hist(s_db[spk[:ml]], bins=60, range=(-80, -15), histtype='step', color=col.get(k), lw=1.6, label=f'{k} 講話中')
        ax[1].hist(s_db[~spk[:ml]][:lim // HOP], bins=60, range=(-80, -15), histtype='step', color=col.get(k), lw=1.2, ls='--', label=f'{k} 停頓')
    ax[1].set_title('音效響度分佈：實線＝講話中，虛線＝停頓（兩者越近越不會一下有一下沒）'); ax[1].set_xlabel('dBFS'); ax[1].legend(ncol=6, fontsize=8); ax[1].grid(alpha=.2)
    # 講話期間的音效頻譜（平均）＋旁白頻譜
    seg = np.concatenate([voice[0, i * HOP:(i + 1) * HOP] for i in np.where(spk)[0]]);
    def psd(x):
        w = 8192; m = len(x) // w; X = np.abs(np.fft.rfft(x[:m * w].reshape(m, w) * np.hanning(w), axis=1)) ** 2
        return np.fft.rfftfreq(w, 1 / SR), 10 * np.log10(X.mean(0) + 1e-14)
    fq, pv = psd(seg); ax[2].semilogx(fq[1:], pv[1:], color='#14213d', lw=1.6, label='旁白（講話窗）')
    for k, sp in spec.items():
        parts = np.concatenate([sp[i * HOP:(i + 1) * HOP] for i in np.where(spk)[0]]); fq, ps = psd(parts); ax[2].semilogx(fq[1:], ps[1:], color=col.get(k), lw=1.2, label=f'{k} 音效（講話窗）')
    ax[2].axvspan(*BAND, color='#f2c14e', alpha=.2, label='人聲清晰度 1～4 kHz'); ax[2].set_xlim(30, 20000); ax[2].set_title('講話期間頻譜：音效 vs 旁白'); ax[2].set_xlabel('Hz'); ax[2].set_ylabel('dB'); ax[2].legend(ncol=5, fontsize=8); ax[2].grid(alpha=.2, which='both')
    fig.tight_layout(); os.makedirs(os.path.dirname(a[1]) or '.', exist_ok=True); fig.savefig(a[1], dpi=110); print('圖 →', a[1])


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a or a[0] not in ('mix', 'check', 'plot'): print(__doc__); sys.exit(1)
    {'mix': cmd_mix, 'check': cmd_check, 'plot': cmd_plot}[a[0]](a[1:])
