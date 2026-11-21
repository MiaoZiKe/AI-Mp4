#!/usr/bin/env python3
"""把一支成片的旁白音高與音色亮度對齊到金手指（Andy 2026/11/22：「這不能都選同一個音高 亮度 嗎?」）。

不重配、不重渲：只處理成片的音軌，影像直接複製。
  1. 音高：量兩邊的音高中位數，用 rubberband 移調（保留共振峰、長度不變，所以字幕與畫面對齊不變）。
  2. 亮度：量兩邊說話段的長期平均頻譜（1/3 八度），差多少就用 firequalizer 補多少（±12 dB 內）。
  3. 響度：補回處理前的整體響度。片尾卡那段（招牌音）原樣保留，不處理。

用法：.venv/bin/python scripts/three/voice-match.py <來源.mp4> <來源旁白結束秒> <金手指.mp4> <金手指旁白結束秒> <輸出.mp4>
"""
import json, subprocess, sys, tempfile, os
import numpy as np
import parselmouth

src, src_end, ref, ref_end, out = sys.argv[1], float(sys.argv[2]), sys.argv[3], float(sys.argv[4]), sys.argv[5]
tmp = tempfile.mkdtemp(prefix="vmatch-", dir=os.path.join(os.path.dirname(out) or ".", ""))
SR = 48000

def sh(*a):
    subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def extract(f, t0, t1, name):
    p = os.path.join(tmp, name)
    sh("ffmpeg", "-y", "-ss", str(t0), "-to", str(t1), "-i", f, "-vn", "-ac", "2", "-ar", str(SR), "-c:a", "pcm_s16le", p)
    return p

def f0_median(p):
    s = parselmouth.Sound(p).convert_to_mono()
    f = s.to_pitch(pitch_floor=60, pitch_ceiling=300).selected_array["frequency"]
    return float(np.median(f[f > 0]))

BANDS = [80 * 2 ** (i / 3) for i in range(0, 22)]  # 80 Hz ~ 10 kHz，1/3 八度

def ltas_db(p):
    s = parselmouth.Sound(p).convert_to_mono()
    x = s.values[0]
    n = 4096
    frames = [x[i:i + n] for i in range(0, len(x) - n, n // 2)]
    rms = np.array([np.sqrt(np.mean(fr ** 2)) for fr in frames])
    keep = rms > np.percentile(rms, 40)  # 只取說話段
    spec = np.zeros(n // 2 + 1)
    w = np.hanning(n)
    for fr, k in zip(frames, keep):
        if k:
            spec += np.abs(np.fft.rfft(fr * w)) ** 2
    freqs = np.fft.rfftfreq(n, 1 / s.sampling_frequency)
    out = []
    for fc in BANDS:
        lo, hi = fc / 2 ** (1 / 6), fc * 2 ** (1 / 6)
        m = (freqs >= lo) & (freqs < hi)
        out.append(10 * np.log10(spec[m].mean() + 1e-20))
    out = np.array(out)
    return out - out.mean()

def centroid(p):
    return round(parselmouth.Sound(p).convert_to_mono().to_spectrum().get_centre_of_gravity())

def lufs(p):
    r = subprocess.run(["ffmpeg", "-i", p, "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(json.loads(r[r.rindex("{"):])["input_i"])

a = extract(src, 0, src_end, "src.wav")
b = extract(ref, 0, ref_end, "ref.wav")
fa, fb = f0_median(a), f0_median(b)
ratio = fb / fa
shifted = os.path.join(tmp, "shift.wav")
sh("ffmpeg", "-y", "-i", a, "-af", f"rubberband=pitch={ratio:.5f}:formant=preserved:pitchq=quality", shifted)
gain = np.clip(ltas_db(b) - ltas_db(shifted), -12, 12)
gain = np.convolve(np.pad(gain, 1, mode="edge"), [0.25, 0.5, 0.25], mode="valid")  # 平滑，避免怪聲
entries = ";".join(f"entry({fc:.0f},{g:.2f})" for fc, g in zip(BANDS, gain))
eq = os.path.join(tmp, "eq.wav")
sh("ffmpeg", "-y", "-i", shifted, "-af", f"firequalizer=gain_entry='{entries}'", eq)
dv = lufs(a) - lufs(eq)
fixed = os.path.join(tmp, "fixed.wav")
sh("ffmpeg", "-y", "-i", eq, "-af", f"volume={dv:.2f}dB,alimiter=limit=0.95", fixed)
tail = extract(src, src_end, 9999, "tail.wav")
full = os.path.join(tmp, "full.wav")
sh("ffmpeg", "-y", "-i", fixed, "-i", tail, "-filter_complex", "[0][1]concat=n=2:v=0:a=1", full)
sh("ffmpeg", "-y", "-i", src, "-i", full, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", out)
res = {
    "金手指": {"音高": round(fb, 1), "亮度": centroid(b)},
    "處理前": {"音高": round(fa, 1), "亮度": centroid(a)},
    "處理後": {"音高": round(f0_median(fixed), 1), "亮度": centroid(fixed)},
    "移調倍率": round(ratio, 4),
    "等化（dB，80Hz～10kHz）": [round(float(g), 1) for g in gain],
}
print(json.dumps(res, ensure_ascii=False))
