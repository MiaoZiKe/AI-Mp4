#!/usr/bin/env python3
"""liguligu-hike2022 素材（第 5 版整支重做，2026/11/22；第 3 版起彩色）：PIL 自繪資料圖 → out/<slug>/assets-raw/photos/，再 make-photos.py 轉成 public/dossier/<slug>/*.jpg（寬 1400）。
第 3 版：七張都改成彩色（assets.json 的 photos.<名稱>.color＝true，make-photos 不轉灰階），主體放大、字加大；配色照 THEME_DOSSIER（src/theme.ts）：
底 panel #151B26、字 text #ECEEF1／text2 #AEB6C2／text3 #8A93A1、2022（過去）＝accent 紅 #D8483A／#F06A5A、2026（現在）＝cool #6FB7C6、未定＝虛線＋問號。
數字全部來自 research.md（F1／F2／F3／F5／F7／F10／F11），只畫查到的點，零起算、同一刻度；中間沒查到的升息點不畫（用虛線表示「中間沒畫」）。
每張圖在片中「分段畫出」（plan.json 的 photoSteps／photoStepP／photoDir），所以版面照畫出的順序排：先畫的在左（right）或在上（down）。
上片尺寸 × 圖內字級：hook 右圖 356×360 → 1400 寬的圖縮 0.254 倍，字 ≥124px；claim 圖 470×470 → 0.336 倍，字 ≥92px；
versus 下方圖 920×310 → 0.657 倍，字 ≥48px；pending 圖 445×430 → 0.318 倍，字 ≥96px；ask 圖 920×380 → 0.657 倍，字 ≥48px。上片後都 ≥30px。
第 5 版：六張＝climb（s01）、y2022（s02）、same（s03）、level（s04）、dates（s05）、steps（s06）；標籤一律放在線段「外側」（數字在點的上方或下方、不和虛線同高），Andy 11/22 指出 4b 版「4.0 ?」標籤和線段相疊。
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



def save(im, name):
    im.save(f'{OUT}/{name}.png')


# ── climb（s01 hook 右圖 356×360，分段畫出 right）：利率上限只畫查到的點：2022/3/16 0.5%（F1）→ 2022/12/14 4.5%（F2）；2026/9/16 4.0%（F5）；12 月只是市場預期（F10）→ 問號
# 標籤位置：0.5 在點的右下、4.5 在點的正上方、4.0 在點的正下方（虛線從左上方進來，不壓字）、問號在預期點正上方
im, d = new(1400, 1416)
txt(d, (60, 40), '利率上限', 132, TXT2)
base, top, vmax = 1110, 380, 5
Y = lambda v: base - (base - top) * v / vmax
for g in (1, 2, 3, 4, 5): d.line([60, Y(g), 1340, Y(g)], fill=GRID, width=5)
d.line([60, base, 1340, base], fill=TXT3, width=12)
p1, p2, p3, p4 = (170, Y(0.5)), (520, Y(4.5)), (980, Y(4.0)), (1230, Y(4.25))
d.line([p1, p2], fill=RED, width=34)
dashed(d, (p2[0] + 50, p2[1]), (p3[0] - 50, p3[1]), w=12, on=40, off=30, fill=TXT3)
dashed(d, (p3[0] + 46, p3[1]), (p4[0] - 30, p4[1]), w=14, on=40, off=30, fill=COOL)
for p, c in ((p1, RED), (p2, RED), (p3, COOL)): dot(d, p, 42, c)
dashed_box(d, p4[0] - 34, p4[1] - 34, p4[0] + 34, p4[1] + 34, w=8, fill=COOL)
txt(d, (p1[0] + 70, p1[1] - 10), '0.5', 128, REDT, 'lb')
txt(d, (p2[0], p2[1] - 64), '4.5', 140, REDT, 'mb')
txt(d, (p3[0], p3[1] + 66), '4.0', 140, COOL, 'mt')
txt(d, (p4[0], p4[1] - 60), '？', 190, COOL, 'mb')
txt(d, (150, base + 40), '2022', 128, REDT, 'lt', bold=2)
txt(d, (1320, base + 40), '2026', 128, COOL, 'rt', bold=2)
save(im, 'climb')

# ── y2022（s02 versus 下方 920×310，分段畫出 right）：2022 年一條時間軸：3/16 首次升息上限 0.5%（F1）→ 12/14 第 7 次升息上限 4.5%（F2）
# 第 7 版：拿掉「6 月物價」旗子與「利率上限（%）」標題（9.1% 由右欄卡片念到才出），圖撐滿高度、加橫向格線，擦出時不會有一大塊空
W, H = 1400, 472
im, d = new(W, H)
X0, X1 = 90, 1330
X = lambda m: X0 + (X1 - X0) * (m - 1) / 12          # m＝月份（1＝1/1），可小數
base, top, vmax = 390, 112, 5
Y = lambda v: base - (base - top) * v / vmax
for g in (1, 2, 3, 4, 5): d.line([X0 - 30, Y(g), X1 + 30, Y(g)], fill=GRID, width=4)
d.line([X0 - 30, base, X1 + 30, base], fill=TXT3, width=8)
for m in (1, 4, 7, 10): txt(d, (X(m), base + 14), f'{m} 月', 50, TXT3, 'mt', bold=1)
a, b = (X(3.5), Y(0.5)), (X(12.45), Y(4.5))
d.line([a, b], fill=RED, width=22)
dot(d, a, 28, RED); dot(d, b, 28, RED)
txt(d, (a[0] - 34, a[1] - 22), '3/16  0.5%', 62, REDT, 'rb')          # 標籤在點的左上方，線往右上走，不壓線
txt(d, (b[0] - 48, b[1] - 30), '12/14  4.5%', 66, REDT, 'rb')
txt(d, (30, 10), '2022 年', 96, TXT2, 'lt', bold=2)
save(im, 'y2022')

# ── same（s03 versus 下方 920×310，分段畫出 down）：哪裡一樣（只放查到的）：在升息 2022/3/16 起（F1）｜2026/9/16 又升（F5）；物價 2022/6 9.1%（F3）｜11/10 高於預期（F8）；科技股 那斯達克 −33%（F4）｜輝達跟著跌（11/10）
im, d = new(W, H)
cols = (430, 900)        # 2022 欄、現在欄的左緣
txt(d, (cols[0], 14), '2022', 64, REDT, 'lt', bold=2)
txt(d, (cols[1], 14), '現在', 64, COOL, 'lt', bold=2)
rows = (('升息', '3/16 起升', '9/16 又升'), ('物價', '年增 9.1%', '高於預期'), ('科技股', '那斯達克跌', '輝達跟著跌'))
for k, (lab, l, r) in enumerate(rows):
    y = 150 + k * 112
    d.line([24, y - 46, 1376, y - 46], fill=GRID, width=4)
    txt(d, (24, y), lab, 66, TXT, 'lm')
    dot(d, (cols[0] - 40, y), 18, RED); txt(d, (cols[0], y), l, 62, REDT, 'lm')
    dot(d, (cols[1] - 40, y), 18, COOL); txt(d, (cols[1], y), r, 62, COOL, 'lm')
save(im, 'same')

# ── level（s04 versus 下方 920×310，分段畫出 down，三列＝物價｜2022 起點｜現在起點）：第 7 版重畫，物價列在最上面（念到物價就能先擦出來），三列之間各有 26px 空縫當停點
# 物價 2022/6 9.1%（F3）、2026/9 3.7%（F6）刻度 0–10；起點 2022：0.5（F1）一年升到 4.5（F2）；現在已在 4.0（F5），12 月再升只是預期（F10）；起點兩列刻度 0–5
im, d = new(W, H)
hh = 62
X0, X1 = 250, 1110
XA = lambda v: X0 + (X1 - X0) * v / 10
cy = 75
txt(d, (24, cy), '物價', 76, TXT, 'lm')
d.rectangle([X0, cy - hh, XA(9.1), cy + hh], fill=RED)
d.rectangle([X0, cy - 30, XA(3.7), cy + 30], fill=COOL)
txt(d, (X0 + 20, cy), '現在 3.7%', 52, BG, 'lm', bold=2)
txt(d, (XA(3.7) + 36, cy), '2022/6', 52, BG, 'lm', bold=2)
txt(d, (XA(9.1) + 24, cy), '9.1%', 84, REDT, 'lm')
X = lambda v: X0 + (X1 - X0) * v / 5
cy = 225
txt(d, (24, cy), '2022', 76, REDT, 'lm')
d.rectangle([X0, cy - hh, X(0.5), cy + hh], fill=RED)
d.rectangle([X(0.5), cy - 20, X(4.5) - 56, cy + 20], fill=REDT)
d.polygon([(X(4.5) - 64, cy - 52), (X(4.5), cy), (X(4.5) - 64, cy + 52)], fill=REDT)
txt(d, (X(0.5) + 24, cy - 32), '起點 0.5', 54, TXT, 'lb', bold=2)
txt(d, (X(4.5) + 24, cy), '4.5', 84, REDT, 'lm')
cy = 375
txt(d, (24, cy), '現在', 76, COOL, 'lm')
d.rectangle([X0, cy - hh, X(4.0), cy + hh], fill=COOL)
txt(d, (X(2.0), cy), '起點已在 4', 72, BG, 'mm')
dashed_box(d, X(4.0) + 6, cy - hh, X(4.25), cy + hh, w=8, fill=COOL)
txt(d, (X(4.25) + 24, cy), '12 月？', 60, COOL, 'lm')
save(im, 'level')

# ── dates（s05 pending 左，分段畫出 down）：日程（F11，預計）：11/21 查證 → 12/9 聯準會決議（預計）→ 12/10 11 月物價（預計）
# 第 7 版：卡片加高到 445×540（plan.json cardH＝540），圖 1400×1698，三項之間各有空縫當停點，下方不再空
im, d = new(1400, 1698)
xs = 150
d.line([xs, 200, xs, 1560], fill=GRID, width=12)
for y, dd, lab, c, ct in ((250, '11/21', '查證截至今天', TXT3, TXT2), (790, '12/9', '聯準會決議', RED, REDT), (1330, '12/10', '11 月物價', COOL, COOL)):
    dot(d, (xs, y), 70, c)
    dot(d, (xs, y), 34, BG)
    txt(d, (290, y - 20), dd, 200, ct, 'lb')
    txt(d, (290, y + 36), lab, 116, TXT, 'lt')
txt(d, (1360, 1672), '日期為預計', 96, TXT3, 'rb', bold=1)
save(im, 'dates')

# ── steps（s06 ask 920×380，分段畫出 right）：首尾呼應 hook 的線：2022/3 0.5 → 2022/12 4.5（紅實線）；2026/9 4.0（青）；12 月虛線格＋問號（未決定）
# 第 5 版：標籤全部放在點的上方或下方（4b 版「4.5%」壓在點上、「2026・4.0% ?」和虛線同高）；下方約 210px 留給結論字
im, d = new(1400, 579)
base, top, vmax = 330, 170, 5
Y = lambda v: base - (base - top) * v / vmax
d.line([60, base, 1340, base], fill=TXT3, width=8)
p1, p2, p3, p4 = (390, Y(0.5)), (700, Y(4.5)), (1030, Y(4.0)), (1230, Y(4.25))
d.line([p1, p2], fill=RED, width=22)
dashed(d, (p2[0] + 36, p2[1]), (p3[0] - 36, p3[1]), w=10, fill=TXT3)
dashed(d, (p3[0] + 36, p3[1]), (p4[0] - 26, p4[1]), w=12, fill=COOL)
for p, c in ((p1, RED), (p2, RED), (p3, COOL)): dot(d, p, 28, c)
dashed_box(d, p4[0] - 24, p4[1] - 24, p4[0] + 24, p4[1] + 24, w=6, fill=COOL)
txt(d, (p1[0] - 46, p1[1] - 12), '2022・0.5%', 54, REDT, 'rb')     # 點的左上方，不碰底線
txt(d, (p2[0], p2[1] - 40), '4.5%', 62, REDT, 'mb')
txt(d, (p3[0], p3[1] + 40), '2026・4.0%', 54, COOL, 'mt')
txt(d, (p4[0], p4[1] - 36), '？', 96, COOL, 'mb')
save(im, 'steps')
for old in ('dec2026', 'rate26', 'thermo', 'discount'):
    for ext in ('png',):
        if os.path.exists(f'{OUT}/{old}.{ext}'): os.remove(f'{OUT}/{old}.{ext}')
print('ok', os.path.normpath(OUT))
