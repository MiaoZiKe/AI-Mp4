# 把實測截圖整理成影片用的圖（public/caffaine-sketch-game/）：只縮圖與加一個圈起來的框，畫面內容不改。
from PIL import Image, ImageDraw
import os
d = os.path.dirname(os.path.abspath(__file__)); o = os.path.join(d, "..", "..", "..", "public", "caffaine-sketch-game"); os.makedirs(o, exist_ok=True)
sk = Image.open(os.path.join(d, "sketch.png")).convert("RGB"); sk.thumbnail((540, 810)); c = Image.new("RGB", (540, 960), (250, 246, 236)); c.paste(sk, (0, (960 - sk.height) // 2)); c.save(os.path.join(o, "sketch.png"), optimize=True)
for src, dst in [("01-first-a-start", "first-start"), ("01-first-d-right", "first-play"), ("02-fix-e-later", "fix-end"), ("02-fix-g-sweepend", "fix-score")]:
    Image.open(os.path.join(d, src + ".png")).convert("RGB").save(os.path.join(o, dst + ".png"), optimize=True)
b = Image.open(os.path.join(d, "01-first-e-later.png")).convert("RGB"); dr = ImageDraw.Draw(b)
dr.rounded_rectangle((130, 440, 410, 520), radius=14, outline=(232, 97, 60), width=7); b.save(os.path.join(o, "bug.png"), optimize=True)
print(os.listdir(o))
