"""Build narration, BGM, SFX, the master mix and timeline.json from script.json.

Run with the project venv:  .venv/bin/python tools/build_audio.py
"""
import hashlib
import json
import math
import os
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly, butter, sosfilt

np.long = int  # zhtts uses the removed alias
ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "build"
CACHE = BUILD / "tts_cache"
BUILD.mkdir(exist_ok=True)
CACHE.mkdir(exist_ok=True)
SR = 48000
FPS = 30

script = json.loads((ROOT / "script.json").read_text("utf-8"))
meta = script["meta"]
SPEED = meta["voice"]["speed"]

# ---------------------------------------------------------------- TTS
_tts = None


def tts_engine():
    global _tts
    if _tts is None:
        import zhtts

        class FastTTS(zhtts.TTS):
            def prepare_input(self, input_ids):
                ids = np.expand_dims(np.array(input_ids, np.int32), 0)
                return (ids, np.array([0], np.int32),
                        np.array([1.0 / SPEED], np.float32),  # speed ratio (<1 = faster)
                        np.array([1.0], np.float32),
                        np.array([1.0], np.float32))
        _tts = FastTTS("FASTSPEECH2")
    return _tts


def synth(text):
    key = hashlib.sha1(f"{text}|{SPEED}|v2".encode()).hexdigest()[:16]
    path = CACHE / f"{key}.wav"
    if not path.exists():
        eng = tts_engine()
        audio = eng.synthesis(text)
        wavfile.write(path, 24000, np.asarray(audio, np.float32))
    sr, a = wavfile.read(path)
    a = a.astype(np.float32)
    if a.ndim > 1:
        a = a.mean(1)
    a = resample_poly(a, SR, sr).astype(np.float32)
    return trim(a)


def trim(a, thr_db=-42):
    env = np.convolve(np.abs(a), np.ones(480) / 480, mode="same")
    thr = 10 ** (thr_db / 20) * max(1e-6, np.max(np.abs(a)))
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return a
    s = max(0, idx[0] - 960)
    e = min(len(a), idx[-1] + 2400)
    out = a[s:e].copy()
    f = 240
    out[:f] *= np.linspace(0, 1, f)
    out[-f:] *= np.linspace(1, 0, f)
    return out


# ---------------------------------------------------------------- timeline
gap = meta["chunkGap"]
tail = meta["tailPad"]
lead = meta["leadIn"]
t = 0.0
segments = []
voice_clips = []
for i, seg in enumerate(script["segments"]):
    s0 = t
    cur = s0 + (lead if i else 0.25)
    chunks = []
    for c in seg["chunks"]:
        a = synth(c["tts"])
        # peak-normalise each chunk so the voice level is even
        a = a / (np.max(np.abs(a)) + 1e-9) * 0.8
        d = len(a) / SR
        chunks.append({"sub": c["sub"], "start": round(cur, 3), "end": round(cur + d, 3)})
        voice_clips.append((cur, a))
        cur += d + gap
    v_end = chunks[-1]["end"]
    end = v_end + tail + (0.7 if seg.get("kind") == "outro" else 0.0)
    segments.append({"id": seg["id"], "start": round(s0, 3), "end": round(end, 3),
                     "voiceEnd": v_end, "chunks": chunks})
    t = end

total = t
n_frames = int(math.ceil(total * FPS))
total = n_frames / FPS
N = int(round(total * SR))
print(f"total {total:.2f}s  frames {n_frames}")
for s in segments:
    print(f"  {s['id']:8s} {s['start']:6.2f} → {s['end']:6.2f}  ({s['end']-s['start']:.2f}s)")

# ---------------------------------------------------------------- narration track
voice = np.zeros(N, np.float32)
for st, a in voice_clips:
    i0 = int(st * SR)
    voice[i0:i0 + len(a)] += a[: max(0, N - i0)]

# voice EQ: gentle high-pass + presence, slight warmth via low shelf cut of rumble
sos_hp = butter(2, 90, "highpass", fs=SR, output="sos")
voice = sosfilt(sos_hp, voice).astype(np.float32)
voice *= 10 ** (-16 / 20) / (np.sqrt(np.mean(voice[np.abs(voice) > 1e-4] ** 2)) + 1e-9)

# ---------------------------------------------------------------- BGM (synthesised)
rng = np.random.default_rng(7)
tt = np.arange(N) / SR
bpm = 84
beat = 60 / bpm
bar = beat * 4


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


prog = [[50, 57, 60, 64, 65], [46, 53, 57, 62, 65], [41, 48, 57, 60, 64], [48, 55, 59, 62, 67]]  # Dm9 Bbmaj7 F C
pad = np.zeros(N, np.float32)
for b in range(int(total / bar) + 2):
    chord = prog[b % 4]
    s = int(b * bar * SR)
    L = int(bar * SR * 1.15)
    seg_t = np.arange(L) / SR
    env = np.minimum(1, seg_t / 0.9) * np.minimum(1, np.maximum(0, (bar * 1.15 - seg_t) / 0.9))
    sig = np.zeros(L, np.float32)
    for m in chord:
        f = midi(m)
        for det in (-0.12, 0.0, 0.12):
            ff = f * 2 ** (det / 12)
            ph = rng.random() * 2 * np.pi
            # soft triangle-ish tone: fundamental + few odd harmonics
            sig += (np.sin(2 * np.pi * ff * seg_t + ph) + 0.18 * np.sin(6 * np.pi * ff * seg_t + ph)) / 3
    sig *= env / len(chord)
    if s >= N:
        break
    e = min(N, s + L)
    pad[s:e] += sig[: e - s]
pad = sosfilt(butter(2, 1800, "lowpass", fs=SR, output="sos"), pad)
pad *= 1 + 0.08 * np.sin(2 * np.pi * 0.2 * tt)

beats = np.zeros(N, np.float32)
kick_t = np.arange(int(0.25 * SR)) / SR
kick = np.sin(2 * np.pi * (48 + 70 * np.exp(-kick_t * 30)) * kick_t) * np.exp(-kick_t * 14)
hat = rng.standard_normal(int(0.05 * SR)).astype(np.float32)
hat = sosfilt(butter(2, 7000, "highpass", fs=SR, output="sos"), hat) * np.exp(-np.arange(len(hat)) / SR * 90)
tick = np.sin(2 * np.pi * 1975 * kick_t[:2400]) * np.exp(-kick_t[:2400] * 60)
nb = int(total / beat) + 1
for k in range(nb):
    s = int(k * beat * SR)
    if k % 4 in (0, 2) or (k % 8 == 7):
        e = min(N, s + len(kick)); beats[s:e] += 0.9 * kick[: max(0, e - s)]
    hs = int((k + 0.5) * beat * SR)
    e = min(N, hs + len(hat)); beats[hs:e] += 0.25 * hat[: max(0, e - hs)]
    if k % 4 == 3:
        e = min(N, s + len(tick)); beats[s:e] += 0.05 * tick[: max(0, e - s)]
bgm = pad * 1.0 + beats * 0.55
fade = np.minimum(1, tt / 0.8) * np.minimum(1, (total - tt) / 1.2)
bgm *= fade
bgm_rms = np.sqrt(np.mean(bgm ** 2)) + 1e-9
bgm *= 10 ** (-22 / 20) / bgm_rms  # -22 dBFS RMS

# ducking: -6 dB while narration is speaking
act = np.zeros(N, np.float32)
for s in segments:
    for c in s["chunks"]:
        act[int(c["start"] * SR):int(c["end"] * SR)] = 1
win = int(0.25 * SR)
act_s = np.convolve(act, np.ones(win) / win, mode="same")
duck = 10 ** (-6 * np.clip(act_s * 1.6, 0, 1) / 20)
bgm *= duck

# ---------------------------------------------------------------- SFX
sfx = np.zeros(N, np.float32)
events = []


def add(at, sig, gain):
    i0 = int(at * SR)
    e = min(N, i0 + len(sig))
    if i0 < N:
        sfx[i0:e] += gain * sig[: e - i0]


def beep():
    x = np.arange(int(0.09 * SR)) / SR
    return (np.sin(2 * np.pi * 1320 * x) * np.minimum(1, x / 0.004) * np.exp(-x * 30)).astype(np.float32)


def typing(n=5):
    out = np.zeros(int(0.06 * SR * n + 0.05 * SR), np.float32)
    for k in range(n):
        cl = rng.standard_normal(int(0.012 * SR)).astype(np.float32)
        cl = sosfilt(butter(2, [1800, 5200], "bandpass", fs=SR, output="sos"), cl)
        cl *= np.exp(-np.arange(len(cl)) / SR * 400)
        s = int((k * 0.06 + rng.random() * 0.015) * SR)
        out[s:s + len(cl)] += cl * (0.7 + 0.3 * rng.random())
    return out


def ding():
    x = np.arange(int(0.9 * SR)) / SR
    s = 0.6 * np.sin(2 * np.pi * 1760 * x) + 0.35 * np.sin(2 * np.pi * 2637 * x) + 0.12 * np.sin(2 * np.pi * 3520 * x)
    return (s * np.minimum(1, x / 0.003) * np.exp(-x * 6)).astype(np.float32)


def pop():
    x = np.arange(int(0.12 * SR)) / SR
    f = 520 * np.exp(-x * 22) + 140
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.minimum(1, x / 0.002) * np.exp(-x * 32)).astype(np.float32)


for i, s in enumerate(segments):
    seg = script["segments"][i]
    st = s["start"]
    if i > 0:
        add(st, beep(), 0.16); events.append({"t": st, "type": "beep"})
    add(st + 0.08, typing(6), 0.10); events.append({"t": st + 0.08, "type": "typing"})
    if seg.get("kind") != "outro":  # sculpture rises out of its plinth
        add(st + 0.32, pop(), 0.30); events.append({"t": st + 0.32, "type": "pop"})
    big = seg.get("big", {})
    if big.get("type") in ("count", "versus", "fraction", "keyword"):
        land = st + 0.45 + 1.1
        s["countStart"] = round(st + 0.45, 3)
        s["countEnd"] = round(land, 3)
        add(land, ding(), 0.12); events.append({"t": land, "type": "ding"})

# ---------------------------------------------------------------- mix
mix = voice + bgm + sfx
mix = np.stack([mix, mix], 1)
# subtle stereo width on BGM
mix[:, 0] += 0.04 * np.roll(bgm, 240)
mix[:, 1] -= 0.04 * np.roll(bgm, 240)
peak = np.max(np.abs(mix))
if peak > 0.98:
    mix *= 0.98 / peak
wavfile.write(BUILD / "mix_raw.wav", SR, mix.astype(np.float32))
wavfile.write(BUILD / "voice.wav", SR, voice.astype(np.float32))

# two-pass loudnorm → -14 LUFS
r = subprocess.run(["ffmpeg", "-hide_banner", "-y", "-i", str(BUILD / "mix_raw.wav"), "-af",
                    "loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True)
js = r.stderr[r.stderr.rfind("{"): r.stderr.rfind("}") + 1]
m = json.loads(js)
af = (f"loudnorm=I=-14:TP=-1.0:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(BUILD / "mix_raw.wav"),
                "-af", af + ",aresample=48000", "-c:a", "pcm_s16le", str(BUILD / "mix.wav")], check=True)

# ---------------------------------------------------------------- per-frame spectrum of narration
BANDS = 28
edges = np.geomspace(110, 6500, BANDS + 1)
nfft = 2048
freqs = np.fft.rfftfreq(nfft, 1 / SR)
hann = np.hanning(nfft)
spec = np.zeros((n_frames, BANDS), np.float32)
rms = np.zeros(n_frames, np.float32)
for f in range(n_frames):
    c = int((f + 0.5) / FPS * SR)
    w = voice[max(0, c - nfft // 2): c + nfft // 2]
    if len(w) < nfft:
        w = np.pad(w, (0, nfft - len(w)))
    rms[f] = np.sqrt(np.mean(w ** 2))
    X = np.abs(np.fft.rfft(w * hann))
    for b in range(BANDS):
        sel = (freqs >= edges[b]) & (freqs < edges[b + 1])
        spec[f, b] = X[sel].mean() if sel.any() else 0
spec = np.log1p(spec * 8)
spec /= np.percentile(spec[spec > 0], 99) + 1e-9
spec = np.clip(spec, 0, 1)
rms = np.clip(rms / (np.percentile(rms, 98) + 1e-9), 0, 1)

timeline = {
    "fps": FPS, "frames": n_frames, "duration": total,
    "segments": segments, "events": events,
    "spectrum": [[int(v * 255) for v in row] for row in spec],
    "rms": [int(v * 255) for v in rms],
}
(BUILD / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False), "utf-8")

# subtitle file for reference / QA
def ts(x):
    h = int(x // 3600); mnt = int(x % 3600 // 60); s = x % 60
    return f"{h:02d}:{mnt:02d}:{s:06.3f}".replace(".", ",")
lines = []
k = 1
for s in segments:
    for c in s["chunks"]:
        lines += [str(k), f"{ts(c['start'])} --> {ts(c['end'])}", c["sub"], ""]
        k += 1
(BUILD / "subtitles.srt").write_text("\n".join(lines), "utf-8")
print("ok", m["input_i"], "LUFS in")
