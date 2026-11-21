#!/usr/bin/env python3
"""liguligu-hike2022 素材（第 3 版重寫，2026/11/21）：PIL 自繪資料圖 → out/<slug>/assets-raw/photos/，再 make-photos.py 轉成 public/dossier/<slug>/*.jpg（寬 1400）。
第 3 版：七張都改成彩色（assets.json 的 photos.<名稱>.color＝true，make-photos 不轉灰階），主體放大、字加大；配色照 THEME_DOSSIER（src/theme.ts）：
底 panel #151B26、字 text #ECEEF1／text2 #AEB6C2／text3 #8A93A1、2022（過去）＝accent 紅 #D8483A／#F06A5A、2026（現在）＝cool #6FB7C6、未定＝虛線＋問號。
數字全部來自 research.md（F1／F2／F3／F5／F7／F10／F11），只畫查到的點，零起算、同一刻度；中間沒查到的升息點不畫（用虛線表示「中間沒畫」）。
每張圖在片中「分段畫出」（plan.json 的 photoSteps／photoStepP／photoDir），所以版面照畫出的順序排：先畫的在左（right）或在上（down）。
上片尺寸 × 圖內字級：hook 右圖 356×360 → 1400 寬的圖縮 0.254 倍，字 ≥124px；claim 圖 470×470 → 0.336 倍，字 ≥92px；
versus 下方圖 920×310 → 0.657 倍，字 ≥48px；pending 圖 445×430 → 0.318 倍，字 ≥96px；ask 圖 920×380 → 0.657 倍，字 ≥48px。上片後都 ≥30px。
用法：python3 videos/liguligu-hike2022/draw-assets.py && python3 scripts/dossier/make-photos.py liguligu-hike2022"""
from PIL import Image, ImageDraw, ImageFont
import os
SLUG = 'liguligu-hike2022'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'out', SLUG, 'assets-raw', 'photos')
os.makedirs(OUT, exist_ok=True)
FP = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
F = lambda s: ImageFont.truetype(FP, s)
# THEME_DOSSIER 色票（改色先改 src/theme.ts，再改這裡）
BG, GRID = (21, 27, 38), (52, 61, 77)
TXT, TXT2, TXT3 = (236, 238, 241), (174, 182, 194), (138, 147, 161)
RED, REDT, COOL, PAPER = (216, 72, 58), (240, 106, 90), (111, 183, 198), (232, 228, 216)


def txt(d, xy, t, s, fill=TXT, anchor='la', bold=3):
    d.text(xy, t, font=F(s), fill=fill, anchor=anchor, stroke_width=bold, stroke_fill=fill)


def dashed(d, a, b, w=10, on=34, off=22, fill=TXT):
    (x0, y0), (x1, y1) = a, b
    L = ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5
    k = 0
    while k < L:
        e = min(k + on, L)
        d.line([x0 + (x1 - x0) * k / L, y0 + (y1 - y0) * k / L, x0 + (x1 - x0) * e / L, y0 + (y1 - y0) * e / L], fill=fill, width=w)
        k += on + off


def dashed_box(d, x0, y0, x1, y1, w=8, fill=TXT):
    for a, b in (((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))):
        dashed(d, a, b, w=w, on=26, off=16, fill=fill)


def dot(d, p, r, fill):
    d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=fill)


def new(w, h):
    im = Image.new('RGB', (w, h), BG)
    return im, ImageDraw.Draw(im)


# ── climb（s01 hook 右圖，分段畫出 right）：利率上限只畫查到的點：2022/3/16 0.5%（F1）→ 2022/12/14 4.5%（F2）；2026/9/16 4.0%（F5）；12 月只是市場預期（F10）→ 問號
im, d = new(1400, 1416)
txt(d, (60, 40), '利率上限', 132, TXT2)
base, top, vmax = 1150, 340, 5
Y = lambda v: base - (base - top) * v / vmax
for g in (1, 2, 3, 4, 5): d.line([60, Y(g), 1340, Y(g)], fill=GRID, width=5)
d.line([60, base, 1340, base], fill=TXT3, width=12)
p1, p2, p3, p4 = (150, Y(0.5)), (560, Y(4.5)), (1010, Y(4.0)), (1240, Y(4.25))
d.line([p1, p2], fill=RED, width=34)                      # 2022 一年內：0.5 → 4.5（中間 7 次升息不各別畫）
dashed(d, p2, p3, w=12, on=40, off=30, fill=TXT3)         # 2023–2026 中間沒畫
dashed(d, p3, p4, w=14, on=40, off=30, fill=COOL)         # 12 月：市場預期，未確定
for p, c in ((p1, RED), (p2, RED), (p3, COOL)): dot(d, p, 40, c)
txt(d, (p1[0] + 64, p1[1] + 4), '0.5', 128, REDT, 'lm')
txt(d, (p2[0], p2[1] - 56), '4.5', 140, REDT, 'mb')
txt(d, (p3[0] - 30, p3[1] - 56), '4.0', 140, COOL, 'mb')
txt(d, (p4[0] + 50, p4[1] - 20), '？', 200, COOL, 'mb')
txt(d, (150, base + 40), '2022', 128, REDT, 'lt', bold=2)
txt(d, (1320, base + 40), '2026', 128, COOL, 'rt', bold=2)
im.save(f'{OUT}/climb.png')

# ── rate26（s02 claim，分段畫出 right）：2026/9/16 升息後利率區間上緣 4.00%（F5）；12 月虛線格＝市場預期（F10，CME FedWatch／Polymarket），未確定
im, d = new(1400, 1400)
txt(d, (60, 40), '利率上限', 124, TXT2)
base, top, vmax = 1110, 330, 5
Y = lambda v: base - (base - top) * v / vmax
for g in (1, 2, 3, 4, 5): d.line([60, Y(g), 1340, Y(g)], fill=GRID, width=5)
d.rectangle([110, Y(4.0), 650, base], fill=COOL)
txt(d, (380, Y(4.0) - 26), '4.00%', 160, COOL, 'mb')
txt(d, (380, base + 34), '9/16 後', 112, TXT, 'mt')
d.rectangle([790, Y(4.0), 1300, base], fill=(60, 92, 102))
dashed_box(d, 790, Y(4.25) - 8, 1300, Y(4.0), w=12, fill=COOL)
txt(d, (1045, Y(4.25) - 34), '？', 210, COOL, 'mb')
txt(d, (1045, base + 34), '12 月預期', 112, TXT, 'mt')
d.line([60, base, 1340, base], fill=TXT3, width=12)
im.save(f'{OUT}/rate26.png')

# ── thermo（s03 versus 下方，分段畫出 right＝水銀往右升）：物價年增率兩支溫度計，同一刻度 0–10%：2022/6 9.1%（F3，紅）、2026/9 3.7%（F7，青）
W, H = 1400, 472
im, d = new(W, H)
X0, X1, vmax = 410, 1230, 10
X = lambda v: X0 + (X1 - X0) * v / vmax
for g in (0, 2, 4, 6, 8, 10):
    d.line([X(g), 30, X(g), 382], fill=GRID, width=4)
    txt(d, (X(g), 396), f'{g}' if g < 10 else '10%', 54, TXT3, 'mt', bold=1)
for k, (lab, v, c, ct) in enumerate((('2022/6', 9.1, RED, REDT), ('2026/9', 3.7, COOL, COOL))):
    cy = 110 + k * 168
    txt(d, (24, cy), lab, 70, ct, 'lm')
    dot(d, (X0 - 14, cy), 64, c)                                               # 溫度計的球
    d.rounded_rectangle([X0, cy - 40, X1 + 14, cy + 40], radius=40, outline=TXT3, width=6)
    d.rounded_rectangle([X0, cy - 28, X(v), cy + 28], radius=28, fill=c)    # 水銀（零起算）
    if v < 6: txt(d, (X(v) + 30, cy - 2), f'{v}%', 96, ct, 'lm')
    else: txt(d, (X(v) - 24, cy - 2), f'{v}%', 80, BG, 'rm')
im.save(f'{OUT}/thermo.png')

# ── level（s04 versus 下方，分段畫出 down＝先 2022 列、再現在列）：同一刻度 0–5%。2022：起點 0.5（F1）一年升到 4.5（F2）；現在：起點已在 4.0（F5），12 月再升只是預期（F10）
im, d = new(W, H)
X0, X1, vmax = 250, 1250, 5
X = lambda v: X0 + (X1 - X0) * v / vmax
hh = 66
# 2022（紅）：起點 0.5 一個點，箭頭拉到 4.5
cy = 100
txt(d, (24, cy), '2022', 76, REDT, 'lm')
d.rectangle([X0, cy - hh, X1, cy + hh], outline=GRID, width=4)
d.rectangle([X0, cy - hh, X(0.5), cy + hh], fill=RED)
d.rectangle([X(0.5), cy - 22, X(4.5) - 50, cy + 22], fill=REDT)
d.polygon([(X(4.5) - 60, cy - 54), (X(4.5), cy), (X(4.5) - 60, cy + 54)], fill=REDT)
d.rounded_rectangle([X(2.5) - 300, cy - 44, X(2.5) + 300, cy + 44], radius=12, fill=BG)
txt(d, (X(2.5), cy), '從 0.5 起，一年 +4', 64, REDT, 'mm')
txt(d, (X(4.5) + 16, cy), '4.5', 76, REDT, 'lm')
# 現在（青）：起點就在 4.0；12 月虛線格＋問號
cy = 290
txt(d, (24, cy), '現在', 76, COOL, 'lm')
d.rectangle([X0, cy - hh, X1, cy + hh], outline=GRID, width=4)
d.rectangle([X0, cy - hh, X(4.0), cy + hh], fill=COOL)
txt(d, (X(2.0), cy), '起點就在 4', 76, BG, 'mm')
dashed_box(d, X(4.0), cy - hh, X(4.25), cy + hh, fill=COOL)
txt(d, (X(4.25) + 16, cy), '12月？', 60, COOL, 'lm')
for g in range(6): txt(d, (X(g), 400), f'{g}%', 52, TXT3, 'mt', bold=1)
im.save(f'{OUT}/level.png')

# ── discount（s05 versus 下方，分段畫出 down）：折現示意（分析推測，非估值模型、不標數字）：同一筆未來獲利，利率低時折回現在比較多，利率高時比較少
im, d = new(W, H)
txt(d, (24, 24), '同一筆未來獲利，折回現在值多少', 60, TXT2, 'lt', bold=2)
for k, (lab, pv, c) in enumerate((('利率低', 300, COOL), ('利率高', 120, RED))):
    cy = 196 + k * 170
    txt(d, (24, cy), lab, 72, c if k == 0 else REDT, 'lm')
    d.rectangle([270, cy - 62, 640, cy + 62], fill=PAPER)
    txt(d, (455, cy), '未來獲利', 60, BG, 'mm')
    d.line([664, cy, 740, cy], fill=TXT2, width=12)
    d.polygon([(736, cy - 30), (780, cy), (736, cy + 30)], fill=TXT2)
    d.rectangle([806, cy - 62, 806 + pv, cy + 62], fill=c)
    txt(d, (806 + pv + 22, cy), '現在值' if k == 0 else '現在值少', 64, c if k == 0 else REDT, 'lm')
im.save(f'{OUT}/discount.png')

# ── dates（s06 pending 左，分段畫出 down）：日程（F11，預計）：11/21 查證 → 12/9 聯準會決議（預計）→ 12/10 11 月物價（預計）
im, d = new(1400, 1350)
xs = 150
d.line([xs, 150, xs, 1200], fill=GRID, width=12)
rows = ((190, '11/21', '查證截至今天', TXT3, TXT2), (610, '12/9', '聯準會決議', RED, REDT), (1030, '12/10', '11 月物價', COOL, COOL))
for y, dd, lab, c, ct in rows:
    dot(d, (xs, y), 70, c)
    dot(d, (xs, y), 34, BG)
    txt(d, (290, y - 20), dd, 190, ct, 'lb')
    txt(d, (290, y + 30), lab, 110, TXT, 'lt')
txt(d, (1360, 1330), '日期為預計', 96, TXT3, 'rb', bold=1)
im.save(f'{OUT}/dates.png')

# ── steps（s07 ask，分段畫出 right）：首尾呼應 hook 的線，寬版：2022/3 0.5 → 2022/12 4.5（紅實線）；2026/9 4.0（青）；12 月半格虛線＋問號（未決定）
# 下方約 210px 留空：片中這張圖底部會打上結論「通膨低、起點高」，線與標籤都畫在上半部，不和結論疊字
im, d = new(1400, 579)
base, top, vmax = 330, 150, 5
Y = lambda v: base - (base - top) * v / vmax
d.line([60, base, 1340, base], fill=TXT3, width=8)
p1, p2, p3, p4 = (440, Y(0.5)), (720, Y(4.5)), (1020, Y(4.0)), (1170, Y(4.25))
d.line([p1, p2], fill=RED, width=22)
dashed(d, p2, p3, w=10, fill=TXT3)
dashed(d, p3, p4, w=12, fill=COOL)
for p, c in ((p1, RED), (p2, RED), (p3, COOL)): dot(d, p, 28, c)
txt(d, (p1[0] - 44, p1[1]), '2022・0.5%', 56, REDT, 'rm')
txt(d, (p2[0] - 44, p2[1] + 10), '4.5%', 64, REDT, 'rm')
txt(d, (p3[0], p3[1] + 44), '2026・4.0%', 56, COOL, 'mt')
txt(d, (p4[0] + 30, p4[1]), '？', 100, COOL, 'lm')
im.save(f'{OUT}/steps.png')
for old in ('dec2026.png',):
    if os.path.exists(f'{OUT}/{old}'): os.remove(f'{OUT}/{old}')
print('ok', os.path.normpath(OUT))
