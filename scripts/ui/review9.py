#!/usr/bin/env python3
"""python3 scripts/ui/review9.py <slug> [spec,spec,...] → out/<slug>-review.png
仿介面動畫（stage: "ui"）的九格圖：從 out/<slug>.mp4 抽 9 個時刻排成 3×3，每格左上標「幕 id・秒數」。只有畫面，不含評分。
spec 和 scripts/v3/peek.mjs 一樣：絕對幀、"s03:old+14"、"s05:start+5"、"end:start+60"；不給就在全片平均取 9 格。時間讀 videos/<slug>/timeline.json。"""
import json, os, re, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
slug = sys.argv[1]
tl = json.load(open(os.path.join(ROOT, 'videos', slug, 'timeline.json')))
by = {s['id']: s for s in tl['scenes']}
def frame(sp):
    if re.fullmatch(r'\d+', sp): return int(sp)
    sid, at = sp.split(':'); t = by[sid]
    m = re.fullmatch(r'([^+-]+)([+-]\d+)?', at); off = int(m.group(2) or 0)
    base = t['startFrame'] if m.group(1) == 'start' else t['voiceStartFrame'] if m.group(1) == 'voice' else t['voiceEndFrame'] if m.group(1) == 'end' else next(c['frame'] for c in t['cues'] if c['id'] == m.group(1))
    return base + off
total = tl['totalFrames']
frames = [min(total - 1, max(0, frame(x))) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else [round(i * (total - 1) / 8) for i in range(9)]
assert len(frames) == 9, '要剛好 9 格'
scene_of = lambda f: [s['id'] for s in tl['scenes'] if s['startFrame'] <= f][-1]
W, H, PAD = 540, 960, 8
sheet = Image.new('RGB', (3 * W + 4 * PAD, 3 * H + 4 * PAD), (14, 16, 22))
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
mp4 = os.path.join(ROOT, 'out', f'{slug}.mp4')
with tempfile.TemporaryDirectory() as tmp:
    for i, f in enumerate(frames):
        p = os.path.join(tmp, f'{i}.png')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp4, '-vf', f'select=eq(n\\,{f}),scale={W}:{H}', '-frames:v', '1', p], check=True)
        x, y = PAD + (i % 3) * (W + PAD), PAD + (i // 3) * (H + PAD)
        sheet.paste(Image.open(p), (x, y))
        d = ImageDraw.Draw(sheet); label = f'{scene_of(f)}  {f / tl["fps"]:.1f}s'
        d.rectangle([x, y, x + d.textlength(label, font=font) + 24, y + 46], fill=(242, 244, 248)); d.text((x + 12, y + 6), label, font=font, fill=(14, 16, 22))
out = os.path.join(ROOT, 'out', f'{slug}-review.png')
sheet.save(out)
print(f'✔ {os.path.relpath(out, ROOT)}：第 {"、".join(map(str, frames))} 幀')
