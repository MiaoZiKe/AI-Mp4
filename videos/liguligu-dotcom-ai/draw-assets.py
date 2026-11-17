#!/usr/bin/env python3
"""liguligu-dotcom-ai 素材（第 3 版）：PIL 自繪灰階圖，輸出 out/<slug>/assets-raw/photos/，再 make-photos.py 轉黑白。
數字全來自 research.md（F1／F4／F6／6 節補註），圖內不放小於 56px 的字（上片尺寸約 0.57 倍）。"""
from PIL import Image, ImageDraw, ImageFont
import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'out', 'liguligu-dotcom-ai', 'assets-raw', 'photos')
os.makedirs(OUT, exist_ok=True)
FP = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
F = lambda s: ImageFont.truetype(FP, s)
BG, INK, MID, LT = 245, 20, 110, 205
def txt(d, xy, t, s, fill=INK, anchor='la', bold=3):
    d.text(xy, t, font=F(s), fill=fill, anchor=anchor, stroke_width=bold, stroke_fill=fill)
# story：上方留 130px 空帶給「1999→2026」日期標，兩張關鍵詞卡
im = Image.new('L', (1400, 1400), BG); d = ImageDraw.Draw(im)
for i, (yr, kw, sub) in enumerate([('1999', '網路', '上網、網站'), ('2026', 'AI', '模型、晶片')]):
    y0 = 140 + i * 640
    d.rectangle([40, y0, 1360, y0 + 590], outline=INK, width=8, fill=255 if i == 0 else 232)
    txt(d, (90, y0 + 25), yr, 150, MID)
    txt(d, (90, y0 + 190), kw, 260)
    txt(d, (90, y0 + 490), sub, 70, MID, bold=1)
    if i == 0:
        d.rectangle([820, y0 + 120, 1280, y0 + 470], outline=INK, width=10)
        d.line([820, y0 + 200, 1280, y0 + 200], fill=INK, width=10)
        for k in range(3): d.ellipse([850 + k * 50, y0 + 145, 876 + k * 50, y0 + 171], fill=INK)
        d.rectangle([860, y0 + 250, 1240, y0 + 290], fill=LT); d.rectangle([860, y0 + 320, 1100, y0 + 360], fill=LT)
    else:
        d.rectangle([880, y0 + 170, 1220, y0 + 510], outline=INK, width=10)
        d.rectangle([950, y0 + 240, 1150, y0 + 440], fill=INK)
        for k in range(4):
            x = 915 + k * 85
            d.line([x, y0 + 120, x, y0 + 170], fill=INK, width=10); d.line([x, y0 + 510, x, y0 + 560], fill=INK, width=10)
txt(d, (700, 735), '＝', 120, INK, 'mm')
im.save(f'{OUT}/story.png')
# capex：真實資料點 2025 約 4,100、2026 計畫約 7,200（億美元），零起算、有刻度
im = Image.new('L', (1400, 1400), BG); d = ImageDraw.Draw(im)
txt(d, (60, 40), '四大雲端 資本支出', 84)
txt(d, (60, 150), '單位：億美元', 64, MID, bold=1)
base, top, vmax = 1200, 330, 8000
Y = lambda v: base - (base - top) * v / vmax
for g in (2000, 4000, 6000, 8000):
    d.line([60, Y(g), 1340, Y(g)], fill=LT, width=4)
    txt(d, (1340, Y(g) - 6), f'{g:,}', 56, MID, 'rb', bold=1)
for x, v, lab, col in [(150, 4100, '2025', 150), (740, 7200, '2026 計畫', 20)]:
    d.rectangle([x, Y(v), x + 470, base], fill=col)
    txt(d, (x + 235, Y(v) - 20), f'{v:,}', 150, INK, 'mb')
    txt(d, (x + 235, base + 30), lab, 100, INK, 'mt')
d.line([60, base, 1340, base], fill=INK, width=8)
im.save(f'{OUT}/capex.png')
# nasdaq26：Nasdaq 綜合兩個收盤點（零起算）：2026/10/6 27,599.89（紀錄高點）、2026/11/5 24,315
im = Image.new('L', (1400, 1350), BG); d = ImageDraw.Draw(im)
txt(d, (60, 30), 'Nasdaq 綜合 收盤', 84)
base, top, vmax = 1050, 250, 30000
Y = lambda v: base - (base - top) * v / vmax
for g in (10000, 20000, 30000):
    d.line([60, Y(g), 1340, Y(g)], fill=LT, width=4)
    txt(d, (60, Y(g) - 66), f'{g:,}', 56, MID, 'la', bold=1)
d.line([60, base, 1340, base], fill=INK, width=8)
p1, p2 = (330, Y(27599.89)), (830, Y(24315))
d.line([p1, p2], fill=INK, width=14)
for p in (p1, p2): d.ellipse([p[0] - 24, p[1] - 24, p[0] + 24, p[1] + 24], fill=INK)
txt(d, (p1[0], p1[1] + 190), '27,600', 120, INK, 'mt'); txt(d, (p1[0], base + 20), '10/6 高點', 70, INK, 'mt')
txt(d, (p2[0], p2[1] + 190), '24,315', 120, INK, 'mt'); txt(d, (p2[0], base + 20), '11/5', 70, INK, 'mt')
txt(d, (1330, 790), '跌逾10%', 160, INK, 'ra')
im.save(f'{OUT}/nasdaq26.png')
# nikkei89：只放大數字（日期與名稱在圖說）；上方留空帶、下方不放東西（下一集標題會蓋在下緣）
im = Image.new('L', (1400, 578), BG); d = ImageDraw.Draw(im)
txt(d, (700, 215), '38,915', 250, INK, 'mm')
im.save(f'{OUT}/nikkei89.png')
