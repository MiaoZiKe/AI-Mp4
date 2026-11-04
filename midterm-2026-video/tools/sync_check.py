"""Measure subtitle-appearance time (video) vs narration onset (audio) in the final MP4."""
import subprocess, sys, json, numpy as np
src = sys.argv[1]; tl = json.load(open('timeline.json')); fps = tl['fps']
# video: per-frame mean darkness of the subtitle band (navy box => dark); text change also changes the band
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', 'crop=952:200:64:1452,scale=238:50,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
band = np.frombuffer(raw, np.uint8).reshape(-1, 50, 238).astype(np.float32)
dark = (band < 90).mean(axis=(1, 2))
# audio: 10 ms RMS envelope
a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout, np.int16).astype(np.float32) / 32768
hop = 160; env = np.sqrt(np.convolve(a ** 2, np.ones(hop) / hop, 'same'))[::hop]
db = 20 * np.log10(env + 1e-9)
errs = []
for sc in tl['scenes']:
    for g in sc['segments']:
        s = g['start']
        # subtitle: find the darkness dip (old box fading out / empty band), then the first frame where the new box is >50% in
        f0, f1 = max(1, int((s - 0.3) * fps)), int((s + 0.5) * fps)
        seg = dark[f0:f1]; target = dark[int((s + 0.45) * fps)]
        k = int(np.argmin(seg)); lo = seg[k]
        fs = next((f0 + k + i for i, v in enumerate(seg[k:]) if v - lo > 0.5 * (target - lo)), None)
        ts = fs / fps if fs is not None else None
        # audio: local minimum just before the line, then first 10 ms frame 10 dB above it
        i0 = max(0, int((s - 0.15) * 100)); i1 = int((s + 0.4) * 100)
        m = i0 + int(np.argmin(db[i0:int((s + 0.05) * 100)])); ta = next((i / 100 for i in range(m, i1) if db[i] > db[m] + 10), None)
        e = None if (ta is None or ts is None) else ts - ta; errs.append(abs(e) if e is not None else 9)
        print(f"{g['sub'][:14]:<16} expected {s:6.2f}  subtitle {ts:6.2f}  voice {ta if ta is None else round(ta, 2)!s:>6}  Δ {e if e is None else round(e, 3)}")
print('max |Δ| =', round(max(errs), 3), 's ->', 'PASS (≤0.1s)' if max(errs) <= 0.1 else 'CHECK')
