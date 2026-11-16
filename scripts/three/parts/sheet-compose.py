#!/usr/bin/env python3
# python3 scripts/three/parts/sheet-compose.py：把 out/parts-sheet/ 的零件圖（NN.png）與動作畫面（mN.png）拼成 docs/three-parts-sheet.png（≤2 MB）。
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
OUT = os.path.join(ROOT, "out/parts-sheet")
FONT = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
fb, fs_ = ImageFont.truetype(FONT, 22), ImageFont.truetype(FONT, 15)
labels = json.load(open(os.path.join(OUT, "labels.json"))); motions = json.load(open(os.path.join(OUT, "motions.json")))
CW, CH, LH, COLS, PAD = 420, 340, 46, 5, 8
Y0, Y1 = 400, 1340  # 從 1080×1920 的畫面中間切出主素材那一帶
def cell(path, title, sub):
    im = Image.open(path).convert("RGB").crop((0, Y0, 1080, Y1)).resize((CW, round(CW * (Y1 - Y0) / 1080 * 1.0)), Image.LANCZOS)
    im = im.crop((0, 0, CW, min(CH, im.height)))
    c = Image.new("RGB", (CW, CH + LH), (245, 247, 252)); c.paste(im, (0, 0))
    d = ImageDraw.Draw(c); d.text((8, CH + 3), title, font=fb, fill=(20, 33, 61)); d.text((8, CH + 27), sub, font=fs_, fill=(90, 100, 125)); return c
cells = [cell(os.path.join(OUT, f"{i:02d}.png"), t, s) for i, (n, t, s) in enumerate(labels)]
mcells = [cell(os.path.join(OUT, f"m{i}.png"), t, "videos/sample-parts 畫面") for i, (f, t) in enumerate(motions)]
rows = (len(cells) + COLS - 1) // COLS
W = COLS * CW + (COLS + 1) * PAD; H0 = 70
H = H0 + rows * (CH + LH + PAD) + 60 + (CH + LH + PAD) + PAD
sheet = Image.new("RGB", (W, H), (255, 255, 255)); d = ImageDraw.Draw(sheet)
d.text((PAD, 14), "科技片零件與動作庫：零件總表（上）與動作預設（下）", font=ImageFont.truetype(FONT, 30), fill=(20, 33, 61))
d.text((PAD, 48), "model.json 寫 { \"part\": \"名稱\", ... } 即可引用；參數與動作見 docs/three-parts.md。比例與配色為示意。", font=fs_, fill=(90, 100, 125))
for i, c in enumerate(cells): sheet.paste(c, (PAD + (i % COLS) * (CW + PAD), H0 + (i // COLS) * (CH + LH + PAD)))
y = H0 + rows * (CH + LH + PAD); d.text((PAD, y + 14), "動作預設（腳本層 props.motion＋模型層 actions preset）", font=fb, fill=(20, 33, 61)); y += 60
for i, c in enumerate(mcells): sheet.paste(c, (PAD + i * (CW + PAD), y))
out = os.path.join(ROOT, "docs/three-parts-sheet.png")
q = sheet.quantize(colors=200, method=Image.MEDIANCUT, dither=Image.NONE); q.save(out, optimize=True)
print("✔", out, os.path.getsize(out) // 1024, "KB", sheet.size)
