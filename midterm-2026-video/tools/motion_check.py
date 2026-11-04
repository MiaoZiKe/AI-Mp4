"""Detect frozen frames (no change), sudden jumps and near-blank frames in a rendered video."""
import subprocess, sys, json, numpy as np
src = sys.argv[1]; W, H = 216, 384
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
f = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))
content = f[:, 70:280, :]                 # scene region only (exclude masthead/subtitle)
std = content.std(axis=(1, 2))
tl = json.load(open('timeline.json')); fps = tl['fps']
bounds = [round(s['start'] * fps) for s in tl['scenes'][1:]]
frozen = [i for i, x in enumerate(d) if x < 0.002]
print('frames', len(f), 'mean diff', d.mean().round(3), 'max diff', d.max().round(2), 'at', int(d.argmax()) / fps)
print('frozen pairs (diff<0.002):', len(frozen), frozen[:20])
big = [(i / fps, round(float(x), 2)) for i, x in enumerate(d) if x > 6 * np.median(d) + 1.5 and not any(abs(i - b) <= 8 for b in bounds)]
print('jumps outside transitions:', big[:20])
print('min content std', std.min().round(2), 'at', int(std.argmin()) / fps, '(paper-only frame would be ~<3)')
for b in bounds: print(f'transition {b/fps:.2f}s diffs', np.round(d[b-7:b+7], 2).tolist(), 'content std', round(float(std[b]), 1))
