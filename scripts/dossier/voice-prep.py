#!/usr/bin/env python3
"""混音前整理旁白 wav：剪掉夾在 PCM 裡的 Gemini C2PA 憑證區塊（舊版 voice-take 存進來的，約 0.16 秒 −8 dBFS 雜訊），印出第一個字的起音秒數。
用法：python3 scripts/dossier/voice-prep.py <旁白.wav> <輸出.wav>   （stdout 只印起音秒數，給 mix-final.sh 算片頭淡入長度）"""
import sys, wave
import numpy as np
if len(sys.argv) < 3: sys.exit(__doc__)
w = wave.open(sys.argv[1]); sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth(); pcm = w.readframes(w.getnframes()); w.close()
assert sw == 2, "只支援 16-bit wav"
if pcm[:4] == b"RIFF" and pcm[8:12] == b"WAVE":  # 外層檔頭包著整個內層 WAV：取內層 data
    o = 12
    while o + 8 <= len(pcm):
        cid, n = pcm[o:o + 4], int.from_bytes(pcm[o + 4:o + 8], "little")
        if cid == b"data": pcm = pcm[o + 8:o + 8 + n]; break
        o += 8 + n + (n & 1)
k = pcm.find(b"C2PA", max(0, len(pcm) - (1 << 16)))
if k >= 0 and pcm[k + 8:k + 16].find(b"jumb") >= 0:
    print(f"voice-prep：剪掉尾端 C2PA 區塊 {len(pcm) - k} bytes", file=sys.stderr); pcm = pcm[:k - (k % (ch * 2))]
with wave.open(sys.argv[2], "wb") as o:
    o.setnchannels(ch); o.setsampwidth(2); o.setframerate(sr); o.writeframes(pcm)
x = np.frombuffer(pcm, np.int16).reshape(-1, ch).astype(np.float64).mean(axis=1)
win = max(1, int(sr * 0.01)); n = len(x) // win
r = np.sqrt((x[:n * win].reshape(n, win) ** 2).mean(axis=1)) / 32768
on = np.where(r > 10 ** (-40 / 20))[0]
print(f"{(on[0] * win / sr if len(on) else 0):.3f}")
