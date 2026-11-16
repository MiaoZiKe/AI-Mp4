# 把實測截圖整理成影片用的圖（public/caffaine-sketch-game/）：只縮圖與加一個圈起來的框，畫面內容不改。
from PIL import Image, ImageDraw
import os
d = os.path.dirname(os.path.abspath(__file__)); o = os.path.join(d, "..", "..", "..", "public", "caffaine-sketch-game"); os.makedirs(o, exist_ok=True)
sk = Image.open(os.path.join(d, "sketch.png")).convert("RGB"); sk.thumbnail((540, 810)); c = Image.new("RGB", (540, 960), (250, 246, 236)); c.paste(sk, (0, (960 - sk.height) // 2)); c.save(os.path.join(o, "sketch.png"), optimize=True)
for src, dst in [("01-first-a-start", "first-start"), ("01-first-d-right", "first-play"), ("02-fix-e-later", "fix-end"), ("02-fix-g-sweepend", "fix-score")]:
    Image.open(os.path.join(d, src + ".png")).convert("RGB").save(os.path.join(o, dst + ".png"), optimize=True)
b = Image.open(os.path.join(d, "01-first-e-later.png")).convert("RGB"); dr = ImageDraw.Draw(b)
dr.rounded_rectangle((130, 440, 410, 520), radius=14, outline=(232, 97, 60), width=7); b.save(os.path.join(o, "bug.png"), optimize=True)
# 放大圈出：從原圖切出「最終得分＋星星＋重新開始」那一塊放大，再圈起星星疊在字上的地方（畫面內容不改）
raw = Image.open(os.path.join(d, "01-first-e-later.png")).convert("RGB"); box = (70, 340, 470, 560)
z = raw.crop(box).resize((1052, 578), Image.LANCZOS); zd = ImageDraw.Draw(z); k = 1052 / 400
zd.rounded_rectangle(((130 - 70) * k, (440 - 340) * k, (410 - 70) * k, (520 - 340) * k), radius=26, outline=(232, 97, 60), width=12); z.save(os.path.join(o, "bug-zoom.png"), optimize=True)
Image.open(os.path.join(d, "01-first-phone.png")).convert("RGB").save(os.path.join(o, "first-phone.png"), optimize=True)
print(os.listdir(o))
