# 三支「做出一個東西」的影片用圖：只複製實測截圖、裁切放大、畫圈，畫面內容不改。用法：python3 scripts/caffaine/make-three-display.py
from PIL import Image, ImageDraw, ImageFont
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
OR = (232, 97, 60)
def out(slug): o = os.path.join(R, "public", "caffaine-" + slug); os.makedirs(o, exist_ok=True); return o
def t(slug): return os.path.join(R, "videos", "caffaine-" + slug, "tests")
def cp(slug, pairs):
    for s, dst in pairs: Image.open(os.path.join(t(slug), s + ".png")).convert("RGB").save(os.path.join(out(slug), dst + ".png"), optimize=True)
def zoom(slug, src, box, k, ring, dst):
    im = Image.open(os.path.join(t(slug), src + ".png")).convert("RGB"); z = im.crop(box).resize((int((box[2] - box[0]) * k), int((box[3] - box[1]) * k)), Image.LANCZOS)
    d = ImageDraw.Draw(z); x, y, w, h = ring; d.rounded_rectangle(((x - box[0]) * k, (y - box[1]) * k, (x - box[0] + w) * k, (y - box[1] + h) * k), radius=22, outline=OR, width=10)
    z.save(os.path.join(out(slug), dst + ".png"), optimize=True); print(slug, dst, z.size)
# 記帳
cp("budget-app", [("01-first-a-empty", "empty"), ("01-first-b-filling", "filling"), ("01-first-c-after", "after"), ("01-first-d-reload", "reload"), ("01-first-c-after", "bug-raw"), ("02-fix-f-delete", "fix-delete")])
zoom("budget-app", "01-first-c-after", (100, 690, 390, 800), 3.6, (319, 706, 48, 46), "bug-zoom")
# 邀請
cp("invite-page", [("01-first-a-top", "first-top"), ("01-first-b-form", "form"), ("01-first-c-list", "list"), ("01-first-d-reload", "bug-raw"), ("02-fix-a-top", "fix-top"), ("02-fix-c-list", "fix-list"), ("02-fix-d-reload", "fix-reload")])
zoom("invite-page", "01-first-a-top", (20, 650, 390, 800), 3.0, (24, 686, 334, 100), "bug-zoom")
# 行程
cp("trip-plan", [("02-fix-a-top", "fix-top"), ("01-first-a-top", "bug-raw"), ("01-first-b-checked", "checked"), ("02-fix-c-reload", "reload"), ("01-first-d-full", "full")])
a = Image.open(os.path.join(t("trip-plan"), "01-first-a-top.png")).convert("RGB").crop((60, 40, 330, 100)); b = Image.open(os.path.join(t("trip-plan"), "01-first-b-checked.png")).convert("RGB").crop((60, 40, 330, 100))
k = 3.9; W, H = int(270 * k), int(60 * k); z = Image.new("RGB", (W, H * 2 + 20), (250, 246, 236)); z.paste(a.resize((W, H), Image.LANCZOS), (0, 0)); z.paste(b.resize((W, H), Image.LANCZOS), (0, H + 20))
d = ImageDraw.Draw(z); d.rounded_rectangle((int(64 * k), int(20 * k), int(206 * k), int(57 * k)), radius=22, outline=OR, width=10); d.rounded_rectangle((int(64 * k), H + 20 + int(20 * k), int(206 * k), H + 20 + int(57 * k)), radius=22, outline=OR, width=10)
z.save(os.path.join(out("trip-plan"), "bug-zoom.png"), optimize=True); print("trip zoom", z.size)
