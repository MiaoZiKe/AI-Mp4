#!/usr/bin/env python3
"""liguligu-hike2022 素材：PIL 自繪灰階簡圖，輸出 out/<slug>/assets-raw/photos/，再 make-photos.py 轉成 public/dossier/<slug>/*.jpg。
數字全來自 research.md（F1／F2／F5／F11），只畫查到的點；圖內字 ≥56px（上片約 0.57 倍 → ≥32px）。"""
from PIL import Image, ImageDraw, ImageFont
import os
SLUG = 'liguligu-hike2022'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'out', SLUG, 'assets-raw', 'photos')
os.makedirs(OUT, exist_ok=True)
FP = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
F = lambda s: ImageFont.truetype(FP, s)
BG, INK, MID, LT = 245, 20, 110, 205
def txt(d, xy, t, s, fill=INK, anchor='la', bold=3):
    d.text(xy, t, font=F(s), fill=fill, anchor=anchor, stroke_width=bold, stroke_fill=fill)
def dashed(d, a, b, w=10, on=34, off=22, fill=INK):
    (x0, y0), (x1, y1) = a, b; L = ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5; k = 0
    while k < L:
        e = min(k + on, L); d.line([x0 + (x1 - x0) * k / L, y0 + (y1 - y0) * k / L, x0 + (x1 - x0) * e / L, y0 + (y1 - y0) * e / L], fill=fill, width=w); k += on + off

# rate26（s02）：利率上限水位尺，2026/9/16 升到 4.00%（區間 3.75–4.00），12/9 虛線格＝市場預期，未確定
im = Image.new('L', (1400, 1400), BG); d = ImageDraw.Draw(im)
txt(d, (60, 40), '聯準會利率上限', 84); txt(d, (60, 150), '2026', 64, MID, bold=1)
base, top, vmax = 1180, 300, 5
Y = lambda v: base - (base - top) * v / vmax
for g in (1, 2, 3, 4, 5):
    d.line([60, Y(g), 1340, Y(g)], fill=LT, width=4); txt(d, (1340, Y(g) - 6), f'{g}%', 56, MID, 'rb', bold=1)
d.rectangle([200, Y(4.0), 640, base], fill=INK)
txt(d, (420, Y(4.0) - 20), '4.00%', 120, INK, 'mb'); txt(d, (420, base + 30), '9/16 升息後', 70, INK, 'mt')
d.rectangle([780, Y(4.0), 1220, base], fill=150)
dashed(d, (780, Y(4.25)), (1220, Y(4.25))); dashed(d, (780, Y(4.25)), (780, Y(4.0))); dashed(d, (1220, Y(4.25)), (1220, Y(4.0)))
txt(d, (1000, Y(4.25) - 30), '？', 150, INK, 'mb'); txt(d, (1000, base + 30), '12/9 預期', 70, INK, 'mt')
d.line([60, base, 1340, base], fill=INK, width=8)
im.save(f'{OUT}/rate26.png')

# dec2026（s07）：2026 年 12 月日曆（12/1 是星期二），圈 9 日（利率決定，預計）與 10 日（11 月 CPI）
im = Image.new('L', (1400, 1350), BG); d = ImageDraw.Draw(im)
txt(d, (60, 30), '2026 年 12 月', 96)
cols, x0, y0, cw, ch = ['日', '一', '二', '三', '四', '五', '六'], 70, 200, 180, 190
for i, c in enumerate(cols): txt(d, (x0 + i * cw + cw / 2, y0), c, 64, MID, 'mt', bold=1)
day, row = 1, 0
while day <= 31:
    for wd in range(7):
        if row == 0 and wd < 2: continue
        if day > 31: break
        cx, cy = x0 + wd * cw + cw / 2, y0 + 110 + row * ch + ch / 2 - 20
        hot = day in (9, 10)
        if hot: d.rectangle([cx - 78, cy - 78, cx + 78, cy + 78], outline=INK, width=12 if day == 9 else 6)
        txt(d, (cx, cy), str(day), 92 if hot else 68, INK if hot else MID, 'mm', bold=3 if hot else 1)
        day += 1
    row += 1
txt(d, (60, 1300), '9 日 利率決定（預計）・10 日 11 月物價', 60, INK, 'lb', bold=2)
im.save(f'{OUT}/dec2026.png')

# steps（s08）：只畫查到的三個點：2022/3/16 上限 0.50%、2022/12/14 4.50%、2026/9/16 4.00%；中間不畫，用虛線表示；右端 12/9 問號
im = Image.new('L', (1400, 560), BG); d = ImageDraw.Draw(im)
base, top, vmax = 470, 90, 5
Y = lambda v: base - (base - top) * v / vmax
d.line([60, base, 1340, base], fill=INK, width=6)
p1, p2, p3 = (120, Y(0.5)), (520, Y(4.5)), (1000, Y(4.0))
d.line([p1, (p1[0] + 130, p1[1]), (p1[0] + 130, Y(2.5)), (p2[0] - 130, Y(2.5)), (p2[0] - 130, p2[1]), p2], fill=INK, width=12)
dashed(d, p2, p3, w=8)
dashed(d, p3, (1220, Y(4.25)), w=8)
for p in (p1, p2, p3): d.ellipse([p[0] - 20, p[1] - 20, p[0] + 20, p[1] + 20], fill=INK)
txt(d, (p1[0], p1[1] - 30), '0.5%', 60, INK, 'lb'); txt(d, (p2[0], p2[1] - 30), '4.5%', 60, INK, 'mb'); txt(d, (p3[0], p3[1] - 30), '4.0%', 60, INK, 'mb')
txt(d, (1260, Y(4.25) - 10), '？', 120, INK, 'mb')
txt(d, (120, base + 20), '2022', 56, MID, 'lt', bold=1); txt(d, (1000, base + 20), '2026', 56, MID, 'mt', bold=1)
im.save(f'{OUT}/steps.png')
print('ok', OUT)
