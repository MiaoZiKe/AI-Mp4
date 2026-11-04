"""Stage 3 post: voice chain + synthesized room tone + synthesized music bed with sidechain ducking,
then loudness normalisation to -14 LUFS / -1 dBTP.  Output: audio/mix.wav (48k stereo)."""
import json, subprocess, numpy as np, soundfile as sf

SR = 48000
rng = np.random.default_rng(7)
V = json.load(open("voice_timing.json"))

def ff(*args):
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *args], check=True)

# 1) voice chain: highpass 80Hz, de-ess, gentle compression
ff("-i", "audio/voice_dry.wav", "-af",
   "aresample=48000,highpass=f=80:poles=2,deesser=i=0.35:m=0.5:f=0.5,"
   "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2",
   "-ac", "1", "audio/voice_proc.wav")
voice, _ = sf.read("audio/voice_proc.wav", dtype="float32")
N = len(voice); T = N / SR; t = np.arange(N) / SR

def rms(x): return np.sqrt(np.mean(x**2) + 1e-12)
speech_mask = np.zeros(N, bool)
for p in V["pages"]:
    speech_mask[int(p["voice_start"]*SR):int(p["voice_end"]*SR)] = True
v_rms = rms(voice[speech_mask])

# 2) room tone: pink noise (Voss-McCartney approx via 1/f filtering), -50 dB re speech
def pink(n):
    w = rng.standard_normal(n).astype(np.float32)
    f = np.fft.rfft(w); k = np.arange(len(f)); k[0] = 1
    f /= np.sqrt(k); x = np.fft.irfft(f, n).astype(np.float32)
    return x / rms(x)
room = np.stack([pink(N), pink(N)], 1) * v_rms * 10**(-50/20)

# 3) music bed: low news pad + light beat, A minor  Am-F-C-G, 92 BPM
BPM = 92; beat = 60 / BPM; bar = 4 * beat
def note(m): return 440 * 2 ** ((m - 69) / 12)
prog = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]]  # Am F C G (voicings)
roots = [45, 41, 48, 43]
def onepole(x, fc):
    a = np.exp(-2*np.pi*fc/SR); y = np.empty_like(x); s = 0.0
    # vectorised IIR via lfilter-free approach: use cumulative trick in blocks
    from scipy.signal import lfilter
    return lfilter([1-a], [1, -a], x)
pad = np.zeros((N, 2), np.float32)
chord_len = 2 * bar
for ci in range(int(T / chord_len) + 2):
    s0 = ci * chord_len; idx0 = int(s0*SR); idx1 = min(N, int((s0 + chord_len + 0.8)*SR))
    if idx0 >= N: break
    tt = np.arange(idx1 - idx0) / SR
    env = np.minimum(1, tt/1.2) * np.minimum(1, np.maximum(0, (chord_len + 0.8 - tt))/1.2)
    ch = prog[ci % 4]; seg = np.zeros((len(tt), 2))
    for m in ch:
        for det, pan in [(-0.08, 0.2), (0.08, 0.8)]:
            f0 = note(m) * 2**(det/12)
            ph = rng.uniform(0, 2*np.pi)
            saw = 2*((f0*tt + ph/(2*np.pi)) % 1) - 1        # saw, filtered later
            tri = np.sin(2*np.pi*f0*tt + ph)
            w = 0.35*saw + 0.65*tri
            seg[:, 0] += w*(1-pan); seg[:, 1] += w*pan
    sub = np.sin(2*np.pi*note(roots[ci % 4])*tt) * 0.9
    seg += sub[:, None]
    seg *= env[:, None]
    pad[idx0:idx1] += seg.astype(np.float32)
for c in range(2):
    lfo = 900 + 500*np.sin(2*np.pi*t/9.0)               # slow filter movement
    pad[:, c] = onepole(onepole(pad[:, c], 1100), 1400)
drums = np.zeros(N, np.float32)
def place(sig, at, gain):
    i = int(at*SR); j = min(N, i+len(sig))
    if i < N: drums[i:j] += gain*sig[:j-i]
kt = np.arange(int(0.35*SR))/SR
kick = np.sin(2*np.pi*(48*kt + 60*(1-np.exp(-kt*30))/30)) * np.exp(-kt*9)
ht = np.arange(int(0.06*SR))/SR
hat_n = rng.standard_normal(len(ht)); hat_n = np.diff(np.concatenate([[0], hat_n]))
hat = hat_n*np.exp(-ht*70)
rt = np.arange(int(0.12*SR))/SR
rim = (np.sin(2*np.pi*820*rt)*0.6 + rng.standard_normal(len(rt))*0.25)*np.exp(-rt*45)
nbeats = int(T/beat) + 1
for b in range(nbeats):
    at = b*beat
    if b % 4 in (0, 2): place(kick, at, 0.9)
    if b % 4 in (1, 3): place(rim, at, 0.22)
    place(hat, at + beat/2, 0.16); place(hat, at, 0.08)
drums = onepole(drums, 6000)
music = pad / rms(pad) * 0.8 + np.stack([drums, drums], 1) / rms(drums) * 0.45
# fades
fi = np.minimum(1, t/0.6); fo = np.minimum(1, np.maximum(0, T - t)/1.8)
music *= (fi*fo)[:, None]
music = music / rms(music) * v_rms * 10**(-22/20)

# 4) sidechain ducking driven by the voice envelope (attack 40ms, release 300ms), 7 dB
env = np.abs(voice); env = onepole(env, 12)
act = np.clip((20*np.log10(env/v_rms + 1e-9) + 30) / 12, 0, 1)   # 0 = silence, 1 = speaking
g = np.empty(N); s = 0.0
aA = np.exp(-1/(0.040*SR)); aR = np.exp(-1/(0.300*SR))
for i in range(N):
    x = act[i]; s = aA*s + (1-aA)*x if x > s else aR*s + (1-aR)*x; g[i] = s
duck = 10**(-7*g/20)
music *= duck[:, None]

mix = np.stack([voice, voice], 1) + music + room
sf.write("audio/premix.wav", mix.astype(np.float32), SR, subtype="FLOAT")

# 5) loudness: two-pass loudnorm to -14 LUFS, TP -1
out = subprocess.run(["ffmpeg", "-hide_banner", "-i", "audio/premix.wav", "-af",
                      "loudnorm=I=-14:TP=-1.5:LRA=7:print_format=json", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
js = json.loads(out[out.rindex("{"):out.rindex("}")+1])
ff("-i", "audio/premix.wav", "-af",
   f"loudnorm=I=-14:TP=-1.5:LRA=7:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
   f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,"
   "alimiter=limit=0.84:attack=2:release=50:level=false,aresample=48000",
   "-ar", "48000", "-c:a", "pcm_s16le", "audio/mix.wav")
print("mixed", round(T, 2), "s; first pass", js["input_i"], js["input_tp"])
