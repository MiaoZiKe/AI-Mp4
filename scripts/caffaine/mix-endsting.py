#!/usr/bin/env python3
"""把 CaffAIne 片尾招牌音調到目標響度，輸出 wav（可選：疊在原音軌的片尾卡開始處）。
用法：python3 scripts/caffaine/mix-endsting.py <招牌音.wav> <輸出.wav> [--src 原音軌或mp4] [--at 片尾卡開始秒數] [--dur 總長秒] [--lufs -14] [--peak -2]
- 只乘一個固定倍數再過 limiter（alimiter limit 0.85＝−1.4 dBFS、attack 5 ms、release 60 ms、latency=1：補回 lookahead 的延遲，撞擊音準確對到畫面那一幀）；
  程式自己疊代倍數，直到「片尾段」積分響度＝目標（預設 −14 LUFS，2026/11/16 Andy 要柔和一點）、true peak ≤ −2 dBTP。
- 有 --src 時：原音軌補到 --dur 秒，招牌音延遲到 --at 再疊上；量的是 --at 之後的片尾段。沒有 --src：只有招牌音（交 mp3 用）。
"""
import re, subprocess, sys, tempfile, os

def arg(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default
sting, out = sys.argv[1], sys.argv[2]
src, at, dur, target = arg("--src"), float(arg("--at", 0)), float(arg("--dur", 3.4)), float(arg("--lufs", -14))
PK = float(arg("--peak", -2)); LIM = 10 ** ((PK - 0.8) / 20)
ms = int(round(at * 1000))

def build(g, dst):
    if src:
        fc = f"[0:a]aresample=48000,apad=whole_dur={dur}[bg];[1:a]adelay={ms}|{ms},volume={g:.4f},alimiter=limit={LIM:.4f}:attack=5:release=60:level=disabled:latency=1[s];[bg][s]amix=inputs=2:normalize=0:duration=first,alimiter=limit={LIM:.4f}:attack=3:release=60:level=disabled[o]"
        cmd = ["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-i", sting, "-filter_complex", fc, "-map", "[o]", "-t", str(dur), "-ar", "48000", "-c:a", "pcm_s16le", dst]
    else:
        fc = f"[0:a]volume={g:.4f},alimiter=limit={LIM:.4f}:attack=5:release=60:level=disabled:latency=1[o]"
        cmd = ["ffmpeg", "-loglevel", "error", "-y", "-i", sting, "-filter_complex", fc, "-map", "[o]", "-ar", "48000", "-c:a", "pcm_s16le", dst]
    subprocess.run(cmd, check=True)

def measure(path):
    r = subprocess.run(["ffmpeg", "-nostats", "-ss", str(at), "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    tail = r[r.rindex("Summary:"):]
    return float(re.search(r"I:\s+(-?[\d.]+) LUFS", tail).group(1)), float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", tail).group(1))

g = 10.0
tmp = out + ".tmp.wav"
for it in range(8):
    build(g, tmp); i, p = measure(tmp)
    print(f"  倍數 {g:.2f} → 片尾段 {i:.1f} LUFS、true peak {p:.2f} dBTP")
    if abs(i - target) < 0.15 and p <= PK: break
    g *= 10 ** ((target - i) / 20)
os.replace(tmp, out)
print(f"✔ {out}：片尾段 {i:.1f} LUFS、true peak {p:.2f} dBTP（倍數 {g:.2f}）")
