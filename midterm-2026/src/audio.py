"""Music (numpy synthesis), transition SFX, narration placement, ducking (−6 dB under VO),
loudness normalisation to −14 LUFS and true-peak ceiling ≤ −1 dBTP."""
import json, sys
from pathlib import Path
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly
import pyloudnorm as pyln

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "timeline.json").read_text())
SR = TL["sample_rate"]; N = int(TL["duration"] * SR) + SR // 10
rng = np.random.default_rng(7)

def env_adsr(n, a, d, s, r):
    t = np.arange(n) / SR
    e = np.where(t < a, t / a, np.where(t < a + d, 1 - (1 - s) * (t - a) / d, s)).astype(np.float32)
    rel = np.clip((n / SR - t) / r, 0, 1) if r else 1
    return e * rel

def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x).astype(np.float32)
def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x).astype(np.float32)

def midi(m): return 440 * 2 ** ((m - 69) / 12)

BPM = 96; beat = 60 / BPM; bar = 4 * beat
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]   # Am F C G
music = np.zeros(N, np.float32)
t_all = np.arange(N) / SR
nbars = int(TL["duration"] / bar) + 2
for b in range(nbars):
    ch = CHORDS[b % 4]; t0 = b * bar; i0 = int(t0 * SR); n = int(bar * SR) + int(0.6 * SR)
    if i0 >= N: break
    n = min(n, N - i0); tt = np.arange(n) / SR
    # pad: detuned saws, low-passed
    pad = np.zeros(n, np.float32)
    for m in ch:
        for det in (-0.12, 0.12):
            f = midi(m + det)
            pad += (2 * ((tt * f) % 1) - 1).astype(np.float32)
    pad = lp(pad, 900) * env_adsr(n, 0.6, 0.5, 0.8, 0.6) * 0.035
    # bass
    fb = midi(ch[0] - 24)
    bass = np.sin(2 * np.pi * fb * tt).astype(np.float32) * env_adsr(n, 0.02, 0.4, 0.6, 0.4) * 0.12
    # pluck arpeggio (8ths)
    arp = np.zeros(n, np.float32)
    seq = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12, ch[0] + 24, ch[2] + 12, ch[1] + 12, ch[2] + 12]
    for k, m in enumerate(seq):
        j0 = int(k * beat / 2 * SR); nn = min(int(0.45 * SR), n - j0)
        if nn <= 0: continue
        ts = np.arange(nn) / SR
        arp[j0:j0 + nn] += (np.sin(2 * np.pi * midi(m) * ts) + 0.3 * np.sin(4 * np.pi * midi(m) * ts)) * np.exp(-ts * 9) * 0.05
    # ticks on beats 2 & 4 + soft kick on 1 & 3
    perc = np.zeros(n, np.float32)
    for k in range(4):
        j0 = int(k * beat * SR); nn = min(int(0.12 * SR), n - j0)
        if nn <= 0: continue
        ts = np.arange(nn) / SR
        if k % 2:
            perc[j0:j0 + nn] += hp(rng.normal(0, 1, nn).astype(np.float32), 7000) * np.exp(-ts * 60) * 0.03
        else:
            perc[j0:j0 + nn] += np.sin(2 * np.pi * (50 + 80 * np.exp(-ts * 30)) * ts) * np.exp(-ts * 18) * 0.14
    music[i0:i0 + n] += pad + bass + arp + perc
fade = np.ones(N, np.float32); fi = int(0.8 * SR); fo = int(2.0 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo); music *= fade

# narration
vo = np.zeros(N, np.float32)
for s in TL["segments"]:
    sr, a = wavfile.read(ROOT / s["vo_file"]); a = a.astype(np.float32) / 32768
    if sr != SR: a = resample_poly(a, SR, sr).astype(np.float32)
    i0 = int(round(s["vo_start"] * SR)); vo[i0:i0 + len(a)] += a[: N - i0]
# ducking: −6 dB on music while VO active (smoothed)
act = np.zeros(N, np.float32)
for s in TL["segments"]:
    i0 = int(s["vo_start"] * SR); act[i0:i0 + int(s["vo_duration"] * SR)] = 1
k = int(0.12 * SR); act = np.convolve(act, np.ones(k) / k, "same").astype(np.float32)
music *= 10 ** (-6 * act / 20)
# transition whooshes (filtered-noise sweep) + soft click at band pass
sfx = np.zeros(N, np.float32)
for tr in TL["transitions"]:
    c = tr["start_frame"] / TL["fps"]; i0 = int(c * SR); n = int(0.45 * SR)
    nz = rng.normal(0, 1, n).astype(np.float32)
    ts = np.arange(n) / SR
    bands = [hp(lp(nz, f), f * 0.5) for f in (800, 2000, 5000)]
    w = np.clip(ts / 0.45, 0, 1)
    sw = bands[0] * (1 - w) + bands[1] * (1 - abs(w - 0.5) * 2) + bands[2] * w
    sfx[i0:i0 + n] += sw * np.sin(np.pi * w) ** 2 * 0.22
mix = vo * 1.0 + music * 1.0 + sfx
meter = pyln.Meter(SR)
mix = pyln.normalize.loudness(mix, meter.integrated_loudness(np.stack([mix, mix], 1)), -14.0).astype(np.float32)
def limit(mix):
    from scipy.ndimage import maximum_filter1d, uniform_filter1d
    for _ in range(5):
        up = resample_poly(mix, 4, 1)
        if 20 * np.log10(np.abs(up).max()) <= -1.5:
            break
        pk = np.abs(up).reshape(-1, 4).max(1)[:len(mix)]
        pk = np.pad(pk, (0, len(mix) - len(pk)))
        g = np.minimum(1.0, 10 ** (-1.8 / 20) / (pk + 1e-9))
        w = int(0.004 * SR)
        g = uniform_filter1d(-maximum_filter1d(-g, size=2 * w + 1), size=w)
        mix = (mix * g).astype(np.float32)
    return mix
# true-peak limiting with loudness re-targeting (iterate so both −14 LUFS and ≤ −1 dBTP hold)
for _ in range(8):
    mix = limit(mix)
    L = meter.integrated_loudness(np.stack([mix, mix], 1))
    if abs(L + 14) < 0.05:
        break
    mix = (mix * 10 ** ((-14 - L) / 20)).astype(np.float32)
mix = limit(mix)
up = resample_poly(mix, 4, 1)
print("LUFS %.2f  TP %.2f dBTP" % (meter.integrated_loudness(np.stack([mix, mix], 1)), 20 * np.log10(np.abs(up).max())))
out = ROOT / "build" / "mix.wav"
wavfile.write(out, SR, np.stack([mix, mix], 1))
print(out)
