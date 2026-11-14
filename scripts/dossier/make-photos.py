#!/usr/bin/env python3
"""python3 scripts/dossier/make-photos.py <slug> → public/dossier/<slug>/<名稱>.jpg（不 commit）
檔案室式（stage: "dossier"）用的照片：把 out/<slug>/assets-raw/photos/ 的原圖做成黑白、低對比（暗部抬高、亮部壓低）、寬 1400px。
裁切讀 videos/<slug>/assets.json 的 photos.<名稱>.crop（[x0, y0, x1, y1]，0–1）。來源與授權記在 videos/<slug>/assets.md。"""
import json, os, sys
from PIL import Image, ImageOps
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
slug = sys.argv[1]
src = os.path.join(ROOT, 'out', slug, 'assets-raw', 'photos')
dst = os.path.join(ROOT, 'public', 'dossier', slug)
os.makedirs(dst, exist_ok=True)
ap = os.path.join(ROOT, 'videos', slug, 'assets.json')
spec = json.load(open(ap)).get('photos', {}) if os.path.exists(ap) else {}
LO, HI = 26, 176  # 輸出的最暗與最亮（0–255）：整張壓在中間，不搶字
for fn in sorted(os.listdir(src)):
    name, ext = os.path.splitext(fn)
    if ext.lower() not in ('.jpg', '.jpeg', '.png'): continue
    im = ImageOps.exif_transpose(Image.open(os.path.join(src, fn))).convert('L')
    c = spec.get(name, {}).get('crop')
    if c: im = im.crop((int(c[0] * im.width), int(c[1] * im.height), int(c[2] * im.width), int(c[3] * im.height)))
    im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
    im = ImageOps.autocontrast(im, cutoff=1).point(lambda v: round(LO + v * (HI - LO) / 255))
    out = os.path.join(dst, name + '.jpg')
    im.save(out, quality=88)
    print(f'✔ {os.path.relpath(out, ROOT)}  {im.size[0]}×{im.size[1]}')
