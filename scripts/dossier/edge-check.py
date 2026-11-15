#!/usr/bin/env python3
"""python3 scripts/dossier/edge-check.py <slug> [--every=0.25] → 量成片每隔幾秒的上、下留白（連續沒有內容的列數）。
使用者 2026/11/15：畫面頂端與底端不准留大片空白；頂端或底端連續 60px 以上沒內容＝error。
「有內容」＝一列裡至少 6 個像素的亮度 ≥ 90（底色、6% 格線、地圖點陣都比這暗，不算內容）。非零結束＝有 error。"""
import subprocess, sys, os
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
slug = sys.argv[1]
every = float(next((a.split('=')[1] for a in sys.argv if a.startswith('--every=')), 0.25))
mp4 = os.path.join(ROOT, 'out', f'{slug}.mp4')
W, H, LIM, TH, MINPX = 1080, 1920, 60, 90, 6
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', mp4, '-vf', f'fps=1/{every},format=gray', '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W)
worst_t = worst_b = 0; bad = []
for i, fr in enumerate(frames):
    rows = np.where((fr >= TH).sum(axis=1) >= MINPX)[0]
    top = int(rows[0]) if len(rows) else H
    bot = int(H - 1 - rows[-1]) if len(rows) else H
    worst_t, worst_b = max(worst_t, top), max(worst_b, bot)
    if top > LIM or bot > LIM: bad.append((round(i * every, 2), top, bot))
print(f'{slug}: {len(frames)} 格（每 {every} 秒）；上方留白最多 {worst_t}px、下方最多 {worst_b}px（上限 {LIM}）')
for t, a, b in bad[:20]: print(f'  ✖ {t:6.2f}s  上 {a}px  下 {b}px')
sys.exit(1 if bad else 0)
