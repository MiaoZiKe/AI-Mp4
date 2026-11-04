"""Stage 4: score + SFX synthesised with numpy, narration placed frame-exactly,
music ducked -6 dB under narration, loudness -16 LUFS, true peak <= -1 dBTP."""
import json, math, os, sys
import numpy as np, soundfile as sf
from scipy.signal import lfilter, butter, sosfilt, resample_poly
sys.path.insert(0, os.path.dirname(__file__))
import film
from scenes import DISSOLVES, CAM

ROOT = film.ROOT
SR = 48000
DUR = 66.0
N = int(SR * DUR)
TL = film.TL
rng = np.random.default_rng(2026)
t_all = np.arange(N) / SR


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a * sr), int(d * sr), int(r * sr)
    sus = max(n - a - d - r, 0)
    env = np.concatenate([np.linspace(0, 1, a, endpoint=False), np.linspace(1, s, d, endpoint=False),
                          np.full(sus, s), np.linspace(s, 0, r)])
    return env[:n] if len(env) >= n else np.pad(env, (0, n - len(env)))


def osc(freq, n, kind="sine", phase=0.0, detune=0.0):
    tt = np.arange(n) / SR
    ph = 2 * np.pi * freq * (1 + detune) * tt + phase
    if kind == "sine":
        return np.sin(ph)
    if kind == "tri":
        return 2 / np.pi * np.arcsin(np.sin(ph))
    raise ValueError


def add(buf, sig, t0, gain=1.0, pan=0.0):
    i = int(round(t0 * SR))
    if i >= N:
        return
    j = min(N, i + len(sig))
    s = sig[:j - i] * gain
    l, r = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
    buf[i:j, 0] += s * l * 1.414
    buf[i:j, 1] += s * r * 1.414


def lowpass(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x, axis=0)


def highpass(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)


def _comb(x, d, g):
    """y[n] = x[n-d] + g*y[n-d]  (block-recursive, exact)"""
    y = np.zeros(len(x) + d)
    xp = np.concatenate([np.zeros(d), x])
    for k in range(d, len(y), d):
        e = min(k + d, len(y))
        y[k:e] = xp[k - d:e - d] + g * y[k - d:e - d]
    return y[d:] if False else y[:len(x)]


def _allpass(x, d, g):
    """y[n] = -g x[n] + x[n-d] + g y[n-d]"""
    y = np.zeros(len(x))
    xd = np.concatenate([np.zeros(d), x])[:len(x)]
    v = -g * x + xd
    for k in range(0, len(x), d):
        e = min(k + d, len(x))
        y[k:e] = v[k:e] + (g * y[k - d:e - d] if k >= d else 0)
    return y


def reverb(x, mix=0.3, size=1.0):
    """Schroeder/Freeverb-style: 8 parallel feedback combs + 4 series allpasses per channel,
    high-frequency damping applied to the wet path."""
    out = np.zeros_like(x)
    combs = [1557, 1617, 1491, 1422, 1277, 1356, 1188, 1116]
    for ch in range(2):
        acc = np.zeros(len(x))
        for d in combs:
            acc += _comb(x[:, ch], int(d * size * SR / 44100) + ch * 23, 0.83)
        for d in (556, 441, 341, 225):
            acc = _allpass(acc, int(d * SR / 44100) + ch * 7, 0.5)
        out[:, ch] = acc / len(combs)
    out = lowpass(out, 5500)
    return x * (1 - mix) + out * mix * 2.0


# ------------------------------------------------------------- music -----
# Fmaj7 -> Am7 -> Dm9 -> Bbmaj7 (bars of 4 s)
CHORDS = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60, 64], [46, 50, 53, 57]]
ROOTS = [41, 45, 38, 46]
BAR = 4.0


def chord_at(t):
    return int(t // BAR) % 4


def music():
    buf = np.zeros((N, 2))
    nb = int(math.ceil(DUR / BAR))
    for b in range(nb):
        t0 = b * BAR
        ci = b % 4
        notes = CHORDS[ci]
        if t0 >= 58.0:           # sunrise: rising chords Bbmaj7 -> C -> Fmaj9
            pass
        n = int((BAR + 2.0) * SR)
        env = adsr(n, 1.2, 0.8, 0.75, 2.0)
        for k, m in enumerate(notes):
            v = (osc(midi(m), n, "sine", detune=-0.002) + osc(midi(m), n, "tri", detune=0.003) * 0.5
                 + osc(midi(m + 12), n, "sine", detune=0.001) * 0.18)
            add(buf, v * env, t0, 0.055, pan=(k - 1.5) * 0.35)
        bass = osc(midi(ROOTS[ci]), n) + 0.3 * osc(midi(ROOTS[ci] + 12), n)
        add(buf, bass * adsr(n, 0.4, 1.0, 0.6, 1.8), t0, 0.09)
    # sparse melody (chord tones, gentle triangle + ADSR)
    beat = 60 / 72.0
    pattern = [0, None, 2, 1, None, 3, 2, None]
    k = 0
    tt = 4.0
    while tt < 57.5:
        ci = chord_at(tt)
        deg = pattern[k % len(pattern)]
        if deg is not None and not (32 <= tt < 46):
            m = CHORDS[ci][deg % len(CHORDS[ci])] + 12
            n = int(beat * 2.2 * SR)
            v = osc(midi(m), n, "tri") * 0.7 + osc(midi(m), n, "sine") * 0.5
            add(buf, v * adsr(n, 0.02, 0.4, 0.35, 0.9), tt, 0.05, pan=0.25 * math.sin(k))
        tt += beat; k += 1
    # flight-like section: light arpeggios over the data panels
    st = beat / 4
    tt = 32.0; k = 0
    while tt < 46.0:
        ci = chord_at(tt)
        ns = CHORDS[ci] + [CHORDS[ci][1] + 12]
        seq = ns + ns[-2:0:-1]
        m = seq[k % len(seq)] + 12
        n = int(0.35 * SR)
        v = osc(midi(m), n, "tri") + 0.3 * osc(midi(m) * 2, n)
        g = 0.032 * (0.75 + 0.25 * (k % 4 == 0)) * film.ramp(tt, 32.0, 33.0) * (1 - film.ramp(tt, 45.0, 46.0))
        add(buf, v * adsr(n, 0.004, 0.12, 0.25, 0.2), tt, g, pan=0.5 * math.sin(k * 0.7))
        tt += st; k += 1
    # sunrise: rising chords 58-66
    rise = [(58.0, [46, 50, 53, 57, 62]), (60.0, [48, 52, 55, 60, 64]), (62.0, [41, 48, 53, 57, 60, 67]), (63.8, [53, 57, 60, 64, 67, 72])]
    for i, (t0, notes) in enumerate(rise):
        n = int((DUR - t0 + 0.5) * SR) if i == len(rise) - 1 else int(3.2 * SR)
        env = adsr(n, 0.9, 0.6, 0.8, 1.6 if i < 3 else n / SR * 0.55)
        for k, m in enumerate(notes):
            v = osc(midi(m), n, "sine") + 0.4 * osc(midi(m), n, "tri", detune=0.004)
            add(buf, v * env, t0, 0.05 * (1 + 0.15 * i), pan=(k - 2.5) * 0.25)
    # bars 58+ were written by the loop too; fade those pads under the rising chords
    fade = np.ones(N); i0 = int(57.5 * SR); fade[i0:] = np.linspace(1, 0.35, N - i0)
    # global intro fade-in
    fade[:int(2.5 * SR)] *= np.linspace(0, 1, int(2.5 * SR)) ** 1.5
    buf *= fade[:, None]
    buf[-int(1.2 * SR):] *= np.linspace(1, 0, int(1.2 * SR))[:, None] ** 2
    return buf


# ------------------------------------------------------------- SFX -------
def noise(n):
    return rng.standard_normal(n)


def whoosh(dur=1.0, f0=300, f1=2400):
    n = int(dur * SR)
    x = noise(n)
    out = np.zeros(n)
    seg = 512
    for i in range(0, n, seg):
        u = i / n
        fc = f0 * (f1 / f0) ** math.sin(u * math.pi)
        sos = butter(2, [fc * 0.6, min(fc * 1.6, SR / 2 - 100)], "band", fs=SR, output="sos")
        out[i:i + seg] = sosfilt(sos, x[i:i + seg])
    return out * np.sin(np.linspace(0, np.pi, n)) ** 1.5


def chime(f=1567.98, dur=2.2):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * d) for r, a, d in ((1, 1, 2.2), (2.76, 0.35, 4), (5.4, 0.15, 7), (2.0, 0.2, 3)))
    return x * adsr(n, 0.003, 0.1, 1, 0.05)


def wood_click():
    n = int(0.12 * SR)
    tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * 820 * tt) * np.exp(-tt * 70) + 0.6 * np.sin(2 * np.pi * 1630 * tt) * np.exp(-tt * 110)
    tick = highpass(noise(n), 2500) * np.exp(-tt * 300) * 0.5
    return body + tick


def blip(f):
    n = int(0.09 * SR)
    tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f * tt) * np.exp(-tt * 45)


def sfx():
    buf = np.zeros((N, 2))
    # wind bed: filtered white noise, slow swells
    w = lowpass(noise(N), 600, 2) * (0.55 + 0.45 * np.sin(2 * np.pi * t_all / 9.0) * np.sin(2 * np.pi * t_all / 5.3))
    w = np.stack([w, np.roll(w, 2400)], 1)
    buf += w * 0.018
    # seat-fill ticks (Senate 8.6s, House 15.0s): soft blips, identical for both sides
    for t_fill, n_seats, D, R in ((8.6, 100, 54, 44), (15.0, 435, 228, 139)):
        rate = n_seats / 3.0
        for j in range(0, max(D, R), max(1, n_seats // 60)):
            tt = t_fill + j / rate
            if j < D:
                add(buf, blip(1320 + 4 * (j % 7)), tt, 0.035, pan=-0.6)
            if j < R:
                add(buf, blip(1320 + 4 * (j % 7)), tt, 0.035, pan=0.6)
    # camera trucks + dissolves
    add(buf, whoosh(2.0, 250, 1800), 13.5, 0.22)
    for a, b, t0, t1 in DISSOLVES:
        add(buf, whoosh(1.2, 300, 2200), t0 - 0.3, 0.14)
    keys = CAM["S4"]
    for i in range(2, len(keys) - 1, 2):     # panel-to-panel moves start at the hold end
        add(buf, whoosh(1.0, 350, 2600), keys[i][0] - 0.1, 0.16, pan=0.3)
    # balance wooden 'clicks' at swing extremes (scenes.shot_S3 uses balance_angle(t + 3.6))
    for tc in film.balance_click_times():
        tt = tc - 3.6
        if 21.2 < tt < 31.6:
            add(buf, wood_click(), tt, 0.32, pan=0.0)
    # icon chimes on each panel
    for c, f in zip(film.icon_cues(), (1174.66, 1318.51, 1567.98, 1760.0)):
        add(buf, chime(f), c["caption_in_frame"] / 24 - 0.1, 0.10, pan=-0.2)
    # chip lights over Taiwan
    for i, tc in enumerate(film.chip_times()):
        add(buf, chime(2093.0 * 2 ** ([0, 2, 4, 7, 9, 12, 14][i] / 12), 1.4), tc, 0.05, pan=-0.4)
    # sunrise: soft rising tone 58-64
    n = int(6.5 * SR)
    tt = np.arange(n) / SR
    f = 220 * 2 ** (tt / 6.5 * 1.0)
    ph = 2 * np.pi * np.cumsum(f) / SR
    rise = (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)) * adsr(n, 2.5, 1.0, 0.8, 2.5)
    add(buf, lowpass(rise, 2500), 58.0, 0.06)
    return buf


# ------------------------------------------------------------- VO --------
def narration():
    buf = np.zeros((N, 2)); env = np.zeros(N)
    for c in TL["cues"]:
        x, sr = sf.read(os.path.join(ROOT, c["vo_file"]), dtype="float64")
        assert sr == SR
        i = c["vo_start_frame"] * SR // 24          # exactly on the caption's first frame
        j = min(N, i + len(x))
        x = highpass(x, 80)
        buf[i:j, 0] += x[:j - i]; buf[i:j, 1] += x[:j - i]
        env[i:j] = 1.0
    # smooth ducking envelope (attack 120 ms, release 400 ms)
    k = np.ones(int(0.12 * SR)) / int(0.12 * SR)
    env = np.minimum(1, np.convolve(env, np.ones(int(0.4 * SR)), "same") > 0).astype(float)
    env = np.convolve(env, k, "same")
    return buf, env


def true_peak_db(x):
    up = resample_poly(x, 4, 1, axis=0)
    return 20 * np.log10(np.max(np.abs(up)) + 1e-12)


def tp_limit(x, ceiling_db=-1.3, look_ms=3.0, rel_ms=80.0):
    """look-ahead limiter on the 4x-oversampled (true) peak envelope."""
    c = 10 ** (ceiling_db / 20)
    up = np.abs(resample_poly(x, 4, 1, axis=0)).max(axis=1)
    pk = up[:len(up) // 4 * 4].reshape(-1, 4).max(axis=1)
    pk = np.pad(pk, (0, len(x) - len(pk)), mode="edge")
    g = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    L = int(look_ms * SR / 1000)
    from scipy.ndimage import minimum_filter1d
    g = minimum_filter1d(g, 2 * L + 1)          # look-ahead (attack before the peak)
    a = math.exp(-1 / (rel_ms * SR / 1000))
    out = lfilter([1 - a], [1, -a], g)           # smooth release
    g = np.minimum(g, np.maximum(out, g))
    g = np.convolve(g, np.ones(L) / L, "same")
    return x * np.minimum(g, 1.0)[:, None]


def main():
    import pyloudnorm as pyln
    mus = reverb(music(), 0.35, 1.1)
    fx = reverb(sfx(), 0.25, 0.9)
    vo, env = narration()
    duck = 10 ** (-6 / 20)
    gain = 1 - (1 - duck) * env
    mix = mus * gain[:, None] * 1.0 + fx * (0.6 + 0.4 * gain[:, None]) + reverb(vo, 0.08, 0.6) * 1.0
    meter = pyln.Meter(SR)
    for _ in range(6):     # normalise -> true-peak limit -> re-measure until both targets hold
        lufs = meter.integrated_loudness(mix)
        mix = mix * 10 ** ((-16 - lufs) / 20)
        mix = tp_limit(mix, ceiling_db=-1.3)
        lufs = meter.integrated_loudness(mix); tp = true_peak_db(mix)
        if abs(lufs + 16) < 0.1 and tp <= -1.0:
            break
    out = os.path.join(ROOT, "build", "mix.wav")
    sf.write(out, mix.astype(np.float32), SR, subtype="FLOAT")
    # stems for reference
    print(f"integrated {lufs:.2f} LUFS, true peak {tp:.2f} dBTP, duration {len(mix) / SR:.3f}s")
    json.dump({"lufs": round(lufs, 2), "true_peak_dbtp": round(tp, 2)}, open(os.path.join(ROOT, "build", "audio_stats.json"), "w"))


if __name__ == "__main__":
    main()
