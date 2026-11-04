"""Cover image (1080×1920), same visual system as the video."""
import sys, math
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import *
from scenes import background, BLUE, RED, GREY, GOLD, TXT, MUTE, LINE, CARD2, dot, card, T
from PIL import Image

img = background(); cam = IDENT
T(img, "2026", 540, 330, 260, GOLD, cam)
T(img, "美國期中選舉", 540, 540, 110, TXT, cam)
T(img, "結果與影響", 540, 680, 110, TXT, cam)
pos, d = hemicycle(100, 540, 1190, 150, 350, 5)
for i, (x, y) in enumerate(pos):
    lab = seat_colors(54, 44, 100)[i]
    dot(img, x, y, d, {"d": BLUE, "r": RED, "u": GREY}[lab])
T(img, "參議院", 540, 1125, 40, MUTE, cam, name="sans")
T(img, "54 : 44", 540, 1175, 64, TXT, cam)
for j, (a, b) in enumerate((("眾議院", "民主黨過半"), ("政府型態", "分裂政府"))):
    x = 300 + 480 * j
    card(img, x - 210, 1260, x + 210, 1450, cam, 1, CARD2)
    T(img, a, x, 1310, 36, MUTE, cam, name="sans")
    T(img, b, x, 1385, 54, GOLD, cam)
T(img, "美股・美債・台股 一次看懂", 540, 1550, 52, TXT, cam)
T(img, "資料截至 2026/11/04（美東）・計票中數字以保守口徑", 540, 1640, 30, MUTE, cam, name="sans")
Image.fromarray(to_u8(img)).save(Path(__file__).resolve().parent.parent / "output" / "cover.png")
print("ok")
