#!/usr/bin/env python3
"""liguligu-hike2022 素材（第 2 版，2026/11/21）：PIL 自繪灰階簡圖 → out/<slug>/assets-raw/photos/，再 make-photos.py 轉成 public/dossier/<slug>/*.jpg（寬 1400）。
數字全部來自 research.md（F1／F2／F3／F5／F7／F10／F11），只畫查到的點，零起算、同一刻度；中間沒查到的升息點不畫（用虛線表示「中間沒畫」）。
上片尺寸 × 圖內字級：versus 下方圖 920×310（×1.06）→ 1400 寬的圖縮 0.70 倍，字 ≥48px；hook 右圖 356×360 → 0.27 倍，字 ≥120px；
claim 圖 470×470 → 0.36 倍，字 ≥88px；pending 日曆 445×430 → 0.34 倍，字 ≥90px；ask 圖 920×380 → 0.70 倍，字 ≥56px。上片後都 ≥30px。
用法：python3 videos/liguligu-hike2022/draw-assets.py && python3 scripts/dossier/make-photos.py liguligu-hike2022"""
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
    (x0, y0), (x1, y1) = a, b
    L = ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5
    k = 0
    while k < L:
        e = min(k + on, L)
        d.line([x0 + (x1 - x0) * k / L, y0 + (y1 - y0) * k / L, x0 + (x1 - x0) * e / L, y0 + (y1 - y0) * e / L], fill=fill, width=w)
        k += on + off


def dashed_box(d, x0, y0, x1, y1, w=8):
    for a, b in (((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))):
        dashed(d, a, b, w=w, on=26, off=16)


def hatch(d, x0, y0, x1, y1, gap=26, w=6, fill=MID):
    """斜線填色（「一年內升上去的那一段」）"""
    for k in range(int(x0 - (y1 - y0)), int(x1), gap):
        a, b = (k, y1), (k + (y1 - y0), y0)
        # 裁到框內
        if a[0] < x0: a = (x0, y1 - (x0 - a[0]))
        if b[0] > x1: b = (x1, y0 + (b[0] - x1))
        if a[0] < b[0]: d.line([a, b], fill=fill, width=w)


# ── climb（s01 hook 右圖）：利率上限只畫查到的點：2022/3/16 0.50%（F1）→ 2022/12/14 4.50%（F2）；2026/9/16 4.00%（F5）；12/9 只是市場預期（F10）→ 問號
im = Image.new('L', (1400, 1416), BG); d = ImageDraw.Draw(im)
txt(d, (60, 40), '利率上限', 130)
base, top, vmax = 1150, 330, 5
Y = lambda v: base - (base - top) * v / vmax
for g in (1, 2, 3, 4, 5):
    d.line([60, Y(g), 1340, Y(g)], fill=LT, width=5)
d.line([60, base, 1340, base], fill=INK, width=12)
p1, p2, p3, p4 = (130, Y(0.5)), (560, Y(4.5)), (1000, Y(4.0)), (1230, Y(4.25))
d.line([p1, p2], fill=INK, width=26)                      # 2022 一年內：0.5 → 4.5（中間 7 次升息不各別畫）
dashed(d, p2, p3, w=12, on=40, off=30, fill=MID)          # 2023–2026 中間沒畫
dashed(d, p3, p4, w=12, on=40, off=30)                    # 12/9 市場預期，未確定
for p in (p1, p2, p3): d.ellipse([p[0] - 34, p[1] - 34, p[0] + 34, p[1] + 34], fill=INK)
txt(d, (p1[0] + 60, p1[1] + 6), '0.5', 120, INK, 'lm')
txt(d, (p2[0], p2[1] - 50), '4.5', 130, INK, 'mb')
txt(d, (p3[0] - 30, p3[1] - 50), '4.0', 130, INK, 'mb')
txt(d, (p4[0] + 40, p4[1] - 20), '？', 190, INK, 'mb')
txt(d, (130, base + 40), '2022', 120, INK, 'lt', bold=2)
txt(d, (1300, base + 40), '2026', 120, INK, 'rt', bold=2)
im.save(f'{OUT}/climb.png')

# ── rate26（s02 claim）：2026/9/16 升息後利率區間上緣 4.00%（F5）；12/9 虛線格＝市場預期（F10），未確定
im = Image.new('L', (1400, 1400), BG); d = ImageDraw.Draw(im)
txt(d, (60, 40), '利率上限', 120)
base, top, vmax = 1130, 330, 5
Y = lambda v: base - (base - top) * v / vmax
for g in (1, 2, 3, 4, 5):
    d.line([60, Y(g), 1340, Y(g)], fill=LT, width=5)
d.rectangle([140, Y(4.0), 640, base], fill=INK)
txt(d, (390, Y(4.0) - 24), '4.00%', 150, INK, 'mb')
txt(d, (390, base + 30), '9/16 後', 110, INK, 'mt')
d.rectangle([780, Y(4.0), 1280, base], fill=150)
dashed_box(d, 780, Y(4.25) - 6, 1280, Y(4.0), w=12)
txt(d, (1030, Y(4.25) - 30), '？', 200, INK, 'mb')
txt(d, (1030, base + 30), '12/9 預期', 110, INK, 'mt')
d.line([60, base, 1340, base], fill=INK, width=12)
im.save(f'{OUT}/rate26.png')

# ── thermo（s03 versus 下方）：物價年增率兩支橫放的溫度計，同一刻度 0–10%：2022/6 9.1%（F3）、2026/9 3.7%（F7）
W, H = 1400, 472
im = Image.new('L', (W, H), BG); d = ImageDraw.Draw(im)
X0, X1, vmax = 380, 1130, 10
X = lambda v: X0 + (X1 - X0) * v / vmax
for g in (0, 3, 6, 9):
    d.line([X(g), 40, X(g), 380], fill=LT, width=4)
    txt(d, (X(g), 392), f'{g}', 52, MID, 'mt', bold=1)
txt(d, (X(10), 392), '%', 52, MID, 'mt', bold=1)
for k, (lab, v) in enumerate((('2022/6', 9.1), ('2026/9', 3.7))):
    cy = 110 + k * 170
    txt(d, (40, cy), lab, 64, INK, 'lm')
    d.ellipse([X0 - 66, cy - 52, X0 + 38, cy + 52], fill=INK)                 # 溫度計的球
    d.rounded_rectangle([X0, cy - 28, X1 + 10, cy + 28], radius=28, outline=INK, width=6)
    d.rounded_rectangle([X0, cy - 18, X(v), cy + 18], radius=18, fill=INK)  # 水銀（零起算）
    txt(d, (X1 + 40, cy - 2), f'{v}%', 72, INK, 'lm')
im.save(f'{OUT}/thermo.png')

# ── level（s04 versus 下方）：兩條水位尺，同一刻度 0–5%。2022：起點 0.5（F1）一年升到 4.5（F2）；現在：起點已在 4.0（F5），12/9 再升只是預期（F10）
im = Image.new('L', (W, H), BG); d = ImageDraw.Draw(im)
X0, X1, vmax = 260, 1260, 5
X = lambda v: X0 + (X1 - X0) * v / vmax
for g in range(6):
    d.line([X(g), 40, X(g), 380], fill=LT, width=4)
    txt(d, (X(g), 392), f'{g}%', 50, MID, 'mt', bold=1)
# 2022
cy, hh = 120, 62
txt(d, (40, cy), '2022', 64, INK, 'lm')
d.rectangle([X0, cy - hh, X1, cy + hh], outline=MID, width=4)
d.rectangle([X0, cy - hh, X(0.5), cy + hh], fill=INK)
hatch(d, X(0.5), cy - hh, X(4.5), cy + hh)
d.rectangle([X(0.5), cy - hh, X(4.5), cy + hh], outline=INK, width=6)
d.rounded_rectangle([X(2.5) - 190, cy - 40, X(2.5) + 190, cy + 40], radius=12, fill=BG)
txt(d, (X(2.5), cy), '一年 +4', 64, INK, 'mm')
txt(d, (X(4.5) + 16, cy), '4.5', 64, INK, 'lm')
# 現在
cy = 290
txt(d, (40, cy), '現在', 64, INK, 'lm')
d.rectangle([X0, cy - hh, X1, cy + hh], outline=MID, width=4)
d.rectangle([X0, cy - hh, X(4.0), cy + hh], fill=INK)
txt(d, (X(2.0), cy), '起點已在 4', 64, BG, 'mm')
dashed_box(d, X(4.0), cy - hh, X(4.25), cy + hh)
txt(d, (X(4.25) + 14, cy), '12/9？', 56, INK, 'lm')
im.save(f'{OUT}/level.png')

# ── discount（s05 versus 下方）：折現示意（分析推測，非估值模型、不標數字）：同一筆未來獲利，利率低時折回現在比較多，利率高時比較少
im = Image.new('L', (W, H), BG); d = ImageDraw.Draw(im)
txt(d, (40, 40), '同一筆未來獲利，折回現在值多少', 56, INK, 'lt', bold=2)
for k, (lab, pv) in enumerate((('利率低', 340), ('利率高', 150))):
    cy = 200 + k * 160
    txt(d, (40, cy), lab, 60, INK, 'lm')
    d.rectangle([260, cy - 50, 620, cy + 50], fill=150)
    txt(d, (440, cy), '未來獲利', 56, INK, 'mm')
    d.line([650, cy, 730, cy], fill=INK, width=10)
    d.polygon([(730, cy - 26), (770, cy), (730, cy + 26)], fill=INK)
    d.rectangle([800, cy - 50, 800 + pv, cy + 50], fill=INK)
    txt(d, (800 + pv + 20, cy), '現在值' if pv > 300 else '現在值較少', 56, INK, 'lm')
im.save(f'{OUT}/discount.png')

# ── dec2026（s06 pending）：2026 年 12 月日曆（12/1 是星期二），框 9 日（聯準會決議，預計）與 10 日（11 月物價，預計）（F11）
im = Image.new('L', (1400, 1350), BG); d = ImageDraw.Draw(im)
txt(d, (60, 24), '2026 年 12 月', 120)
cols, x0, y0, cw, ch = ['日', '一', '二', '三', '四', '五', '六'], 40, 190, 190, 176
for i, c in enumerate(cols): txt(d, (x0 + i * cw + cw / 2, y0), c, 90, MID, 'mt', bold=1)
day, row = 1, 0
while day <= 31:
    for wd in range(7):
        if row == 0 and wd < 2: continue
        if day > 31: break
        cx, cy = x0 + wd * cw + cw / 2, y0 + 120 + row * ch + ch / 2 - 10
        hot = day in (9, 10)
        if hot: d.rectangle([cx - 86, cy - 80, cx + 86, cy + 80], outline=INK, width=14 if day == 9 else 8)
        txt(d, (cx, cy), str(day), 120 if hot else 96, INK if hot else MID, 'mm', bold=3 if hot else 1)
        day += 1
    row += 1
im.save(f'{OUT}/dec2026.png')

# ── steps（s07 ask）：首尾呼應 hook 的線，寬版：2022/3 0.5 → 2022/12 4.5（實線）；2026/9 4.0；12/9 半格虛線＋問號（未決定）
im = Image.new('L', (1400, 579), BG); d = ImageDraw.Draw(im)
base, top, vmax = 470, 110, 5
Y = lambda v: base - (base - top) * v / vmax
d.line([60, base, 1340, base], fill=INK, width=8)
p1, p2, p3, p4 = (260, Y(0.5)), (600, Y(4.5)), (1000, Y(4.0)), (1190, Y(4.25))
d.line([p1, p2], fill=INK, width=16)
dashed(d, p2, p3, w=8, fill=MID)
dashed(d, p3, p4, w=8)
for p in (p1, p2, p3): d.ellipse([p[0] - 22, p[1] - 22, p[0] + 22, p[1] + 22], fill=INK)
txt(d, (p1[0] - 34, p1[1] - 16), '0.5%', 64, INK, 'rb')
txt(d, (p2[0], p2[1] - 30), '4.5%', 64, INK, 'mb')
txt(d, (p3[0] - 40, p3[1] - 30), '4.0%', 64, INK, 'mb')
txt(d, (p4[0] + 70, p4[1] + 10), '？', 130, INK, 'mb')
txt(d, (260, base + 20), '2022', 60, MID, 'lt', bold=1)
txt(d, (1000, base + 20), '2026', 60, MID, 'mt', bold=1)
im.save(f'{OUT}/steps.png')
print('ok', os.path.normpath(OUT))
