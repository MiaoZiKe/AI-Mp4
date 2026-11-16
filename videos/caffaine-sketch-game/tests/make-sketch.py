# 用程式畫一張「手繪風」草圖（抖動線條）：接星星小遊戲。固定 seed。
import random, math
from PIL import Image, ImageDraw, ImageFont
random.seed(7)
W, H = 720, 1080
im = Image.new("RGB", (W, H), (250, 246, 236))
d = ImageDraw.Draw(im)
def wob(pts, w=5, closed=False, jit=3):
    pts = list(pts) + ([pts[0]] if closed else [])
    out = []
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(2, int(math.hypot(x1-x0, y1-y0) // 14))
        for i in range(n):
            t = i / n
            out.append((x0 + (x1-x0)*t + random.uniform(-jit, jit), y0 + (y1-y0)*t + random.uniform(-jit, jit)))
    out.append(pts[-1])
    d.line(out, fill=(40, 40, 60), width=w, joint="curve")
def rect(x0, y0, x1, y1, **k): wob([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], closed=True, **k)
def star(cx, cy, r):
    p = []
    for i in range(10):
        a = -math.pi/2 + i*math.pi/5
        rr = r if i % 2 == 0 else r*0.45
        p.append((cx + rr*math.cos(a), cy + rr*math.sin(a)))
    wob(p, closed=True, w=4, jit=2)
def fnt(s):
    for f in ["/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"]:
        try: return ImageFont.truetype(f, s)
        except Exception: pass
    return ImageFont.load_default()
rect(30, 30, 690, 1050, w=6)                       # 螢幕外框
rect(50, 50, 260, 130, w=4)                        # 分數框
d.text((62, 66), "分數 0", font=fnt(34), fill=(40, 40, 60))
for (x, y, r) in [(180, 260, 40), (420, 400, 40), (580, 220, 40), (300, 600, 40)]:
    star(x, y, r)
    wob([(x, y-r-12), (x, y-r-52)], w=3, jit=1)    # 往下掉的短線
wob([(180, 330), (180, 380)], w=3, jit=1)
# 小人＋籃子
wob([(330, 900), (390, 900), (380, 950), (340, 950)], closed=True, w=5)   # 籃子
d.ellipse((345, 840, 375, 870), outline=(40, 40, 60), width=5)           # 頭
wob([(360, 870), (360, 900)], w=5, jit=1)
# 左右箭頭
wob([(110, 990), (60, 990)], w=5, jit=1); wob([(75, 975), (60, 990), (75, 1005)], w=5, jit=1)
wob([(610, 990), (660, 990)], w=5, jit=1); wob([(645, 975), (660, 990), (645, 1005)], w=5, jit=1)
d.text((400, 62), "接到星星 +1 分\n漏掉 3 顆就結束", font=fnt(30), fill=(40, 40, 60))

im.save("sketch.png")
print("ok", im.size)
