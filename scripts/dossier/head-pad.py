#!/usr/bin/env python3
"""補片頭空檔但不動後面的時間軸：在旁白最前面補 PAD 秒靜音（預設 0.05），再從第一段 ≥0.6 秒的句間靜音裡剪掉同樣長度，
所以只有第一句往後移 PAD 秒，之後所有字的時間不變（時間軸、字幕、片尾音前空檔都不用重算）。
用法：python3 scripts/dossier/head-pad.py <in.wav> <out.wav> [PAD=0.05]   不送 TTS。"""
import subprocess, sys, numpy as np
src, dst = sys.argv[1], sys.argv[2]; pad = float(sys.argv[3]) if len(sys.argv) > 3 else 0.05
SR = 48000
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, np.float32); W = SR // 100; n = len(x) // W
db = 20 * np.log10(np.sqrt((x[:n * W].reshape(n, W) ** 2).mean(1)) + 1e-12)
q = (db < -45).astype(int); d = np.diff(np.concatenate([[0], q, [0]]))
cut = None
for a, b in zip(np.where(d == 1)[0], np.where(d == -1)[0]):
    if a > 30 and b - a >= 60: cut = (a + 10) * 0.01; break   # 句間靜音（≥0.6 秒、跳過片頭）中段起剪
if cut is None: sys.exit("找不到可剪的句間靜音")
fc = f"[0:a]atrim=0:{cut},adelay={int(pad*1000)}|{int(pad*1000)},asetpts=PTS-STARTPTS[a];[0:a]atrim={cut+pad},asetpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=0:a=1[o]"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-filter_complex", fc, "-map", "[o]", "-c:a", "pcm_s16le", dst], check=True)
print(f"補 {pad} 秒於片頭，並於 {cut:.2f} 秒（句間靜音）剪掉 {pad} 秒")
