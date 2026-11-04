"""Build the full soundtrack: narration (placed by timeline.json), synthesized BGM pad with ducking, stamp + whoosh SFX.
Output: build/mix.wav (48 kHz stereo). Final -14 LUFS normalisation is done by ffmpeg loudnorm in tools/build.sh."""
import json, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import resample_poly, butter, sosfilt
SR = 48000
tl = json.load(open('timeline.json')); D = tl['duration'] + 0.4
N = int(D * SR); t = np.arange(N) / SR
rng = np.random.default_rng(7)
meter = pyln.Meter(SR)
def norm(x, lufs): return x * 10 ** ((lufs - meter.integrated_loudness(x)) / 20)

# ---------- narration ----------
voice = np.zeros(N)
for sc in tl['scenes']:
    for g in sc['segments']:
        x, sr = sf.read(g['file']); x = resample_poly(x, SR, sr)
        i = int(round(g['start'] * SR)); voice[i:i + len(x)] += x[:N - i]
voice = norm(voice, -15.0)

# ---------- BGM: slow news-style pad (Dm9 – Bbmaj7 – Fmaj7/A – Csus2), 4 s per chord ----------
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
chords = [[50, 57, 60, 64, 65], [46, 53, 57, 60, 62], [45, 53, 57, 60, 64], [48, 55, 60, 62, 67]]
bar = 4.0; pad = np.zeros(N); bass = np.zeros(N); pulse = np.zeros(N)
nb = int(np.ceil(D / bar)) + 1
for b in range(nb):
    ch = chords[b % 4]; s0 = b * bar - 0.6; s1 = s0 + bar + 1.2
    i0, i1 = max(0, int(s0 * SR)), min(N, int(s1 * SR))
    if i0 >= i1: continue
    tt = t[i0:i1] - s0; L = s1 - s0
    env = np.clip(tt / 0.9, 0, 1) * np.clip((L - tt) / 0.9, 0, 1); env = env ** 1.5
    for m in ch[1:]:
        f = mtof(m + 12)
        for det in (-0.12, 0.0, 0.11):          # detuned voices
            ff = f * 2 ** (det / 12)
            for h in range(1, 7):               # soft saw: few harmonics, steep roll-off
                pad[i0:i1] += env * np.sin(2 * np.pi * ff * h * tt + h * det) / (h ** 1.6)
    bass[i0:i1] += env * np.sin(2 * np.pi * mtof(ch[0] - 12) * tt)
    # gentle "newsroom" pulse: muted root pluck on every beat
    for k in range(4):
        p0 = b * bar + k * 1.0; j0 = int(p0 * SR); j1 = min(N, j0 + int(0.5 * SR))
        if j0 < 0 or j0 >= N: continue
        tp = t[j0:j1] - p0
        pulse[j0:j1] += np.exp(-tp * 9) * np.sin(2 * np.pi * mtof(ch[0] + 12) * tp) * (1.0 if k == 0 else 0.55)
lfo = 0.85 + 0.15 * np.sin(2 * np.pi * t / 7.0)
bgm = pad * lfo / np.abs(pad).max() + 0.35 * bass / np.abs(bass).max() + 0.12 * pulse / np.abs(pulse).max()
bgm = sosfilt(butter(2, 3200, 'low', fs=SR, output='sos'), bgm)
fade = np.clip(t / 1.5, 0, 1) * np.clip((D - t) / 1.5, 0, 1)
bgm = norm(bgm * fade, -22.0)                   # BGM sits at -22 LUFS before ducking

# ---------- ducking: -6 dB while narration plays (40 ms attack / 250 ms release) ----------
act = np.zeros(N)
for sc in tl['scenes']:
    for g in sc['segments']: act[int((g['start'] - 0.05) * SR):int((g['end'] + 0.05) * SR)] = 1
duck = np.zeros(N); a_up, a_dn = 1 - np.exp(-1 / (0.04 * SR)), 1 - np.exp(-1 / (0.25 * SR)); y = 0.0
for i in range(N):
    y += (a_up if act[i] > y else a_dn) * (act[i] - y); duck[i] = y
bgm *= 10 ** (-6 * duck / 20)

# ---------- SFX ----------
sfx = np.zeros(N)
def add(x, at, gain_db):
    i = int(at * SR); n = min(len(x), N - i)
    if n > 0: sfx[i:i + n] += x[:n] * 10 ** (gain_db / 20) / np.abs(x).max()
def stamp():
    n = int(0.45 * SR); tt = np.arange(n) / SR
    thump = np.sin(2 * np.pi * (55 * tt + 70 / 12 * (1 - np.exp(-12 * tt)))) * np.exp(-tt * 14)
    noise = sosfilt(butter(2, [300, 2500], 'band', fs=SR, output='sos'), rng.standard_normal(n)) * np.exp(-tt * 40)
    click = np.zeros(n); click[:96] = np.hanning(192)[96:] * rng.standard_normal(96)
    return thump + 0.6 * noise + 0.3 * click
def whoosh(L=0.5):
    n = int(L * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n)
    out = np.zeros(n); y = 0.0
    fc = 300 + 2600 * np.sin(np.pi * tt / L) ** 2          # sweeping one-pole low-pass
    a = 1 - np.exp(-2 * np.pi * fc / SR)
    for i in range(n): y += a[i] * (x[i] - y); out[i] = y
    out = sosfilt(butter(1, 180, 'high', fs=SR, output='sos'), out)
    return out * np.sin(np.pi * tt / L) ** 2
add(stamp(), 0.35, -9)                                   # BREAKING stamp
s0 = tl['scenes'][0]['segments'][0]['start']
add(stamp(), s0 + 0.9, -16); add(stamp(), s0 + 1.0, -17)  # 計票中 stamps (quieter)
half = tl['transition'] / 2
for sc in tl['scenes'][1:]: add(whoosh(), sc['start'] - half - 0.05, -20)

mix = voice + bgm + sfx
peak = np.abs(mix).max()
if peak > 0.95: mix *= 0.95 / peak
st = np.stack([mix, mix], 1)
# subtle stereo width on BGM only
st[:, 0] += 0.0; sf.write('build/mix.wav', st, SR, subtype='PCM_24')
for name, x in [('voice', voice), ('bgm(ducked)', bgm), ('mix', mix)]:
    print(name, round(meter.integrated_loudness(x), 1), 'LUFS')
