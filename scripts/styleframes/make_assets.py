"""風格樣張素材：本機紙材（方向 A）＋照片處理（方向 B）。輸出到 out/what-is-server/styleframes/assets/（不 commit）。
用法：python3 scripts/styleframes/make_assets.py"""
import os, json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from paper import *

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
RAW = os.path.join(ROOT, 'out/what-is-server/assets-raw/photos')
O = os.path.join(ROOT, 'out/what-is-server/styleframes/assets'); os.makedirs(O, exist_ok=True)
A = dict(desk='#EFE6D4', mat='#2F4A3A', white='#FFFDF7', kraft='#C9A66B', red='#D9482B', yellow='#F2B632', blue='#1F3A5F', mint='#7DB7A0', ink='#1E1B16')
B = dict(dark='#0E1320', light='#E9E4D8', yellow='#F4E04D', orange='#FF6B35')
meta = {}
def save(img, name):
    img.save(os.path.join(O, name)); meta[name] = img.size

def vignette(w, h, strength=0.12, power=2.2):
    y, x = np.mgrid[0:h, 0:w]
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2) / np.sqrt(2)
    return 1 - strength * d ** power

# ---------- 方向 A：桌面與切割墊 ----------
def a_backgrounds():
    t = paper_tex(1080, 1920, A['desk'], 11, grain=5, blotch=6)
    t *= vignette(1080, 1920, 0.10)[:, :, None]
    save(Image.fromarray(np.clip(t, 0, 255).astype(np.uint8)), 'a-desk.png')
    t = paper_tex(1080, 1920, A['mat'], 12, grain=5, blotch=5)
    g = Image.new('L', (1080, 1920), 0); d = ImageDraw.Draw(g)
    for x in range(30, 1080, 60): d.line([(x, 0), (x, 1920)], fill=70 if (x - 30) % 300 else 150, width=1 if (x - 30) % 300 else 2)
    for y in range(0, 1920, 60): d.line([(0, y), (1080, y)], fill=70 if y % 300 else 150, width=1 if y % 300 else 2)
    ga = np.asarray(g).astype(np.float32) / 255 * (0.75 + 0.25 * noise2d(1080, 1920, 5, 120))
    t = t + ga[:, :, None] * np.array([70, 95, 80], np.float32)
    r = np.random.default_rng(3); sc = Image.new('L', (1080, 1920), 0); d = ImageDraw.Draw(sc)   # 刀痕
    for _ in range(26):
        x, y = r.integers(0, 1080), r.integers(0, 1920); a = r.random() * np.pi; L = r.integers(80, 420)
        d.line([(x, y), (x + np.cos(a) * L, y + np.sin(a) * L)], fill=int(r.integers(40, 110)), width=1)
    t = t + (np.asarray(sc.filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) / 255 * 38)[:, :, None]
    t *= vignette(1080, 1920, 0.22)[:, :, None]
    save(Image.fromarray(np.clip(t, 0, 255).astype(np.uint8)), 'a-mat.png')

def a_papers():
    save(shadow(sheet(920, 500, A['white'], 21, torn='lr')), 'a-strip-hook.png')
    save(shadow(sheet(952, 232, A['white'], 22, torn='lr'), off=(3, 6), blur=7, alpha=0.3), 'a-caption.png')
    save(shadow(sheet(952, 232, A['white'], 23, torn='lr'), off=(3, 7), blur=8, alpha=0.5, color=(5, 15, 10)), 'a-caption-dark.png')
    save(shadow(sheet(560, 300, A['white'], 24, torn='rb')), 'a-label.png')
    save(shadow(sheet(760, 250, A['red'], 25, torn='lr', grain=6), off=(6, 12), blur=11, alpha=0.55, color=(5, 15, 10)), 'a-red.png')
    save(shadow(sheet(470, 62, A['kraft'], 26, torn='r'), pad=20, off=(2, 4), blur=4, alpha=0.3), 'a-src.png')
    for n, c, s in (('y', A['yellow'], 31), ('m', A['mint'], 32), ('r', A['red'], 33)):
        save(shadow(tape(190, 56, c, s, 0.86), pad=14, off=(1, 2), blur=2, alpha=0.22), f'a-tape-{n}.png')
    for w, h, s in ((330, 84, 41), (250, 84, 42), (300, 96, 43), (230, 92, 44), (220, 84, 45)):
        save(marker(w, h, A['yellow'], s), f'a-mark-{w}.png')
    for i in range(6):
        save(shadow(sheet(74, 22, A['white'] if i % 2 else A['yellow'], 50 + i), pad=10, off=(1, 3), blur=2, alpha=0.35), f'a-dash-{i}.png')
    d = sheet(26, 26, A['red'], 60); m = Image.new('L', (26, 26), 0); ImageDraw.Draw(m).ellipse((1, 1, 24, 24), fill=255); d.putalpha(m)
    save(d, 'a-dot.png')

# ---------- 手機（Pexels 358627，俯拍，無人） ----------
def kitchen_src():
    """廚房照片；把握把上的品牌小字糊掉（不露出商標）"""
    im = Image.open(os.path.join(RAW, 'kitchen.jpg')).convert('RGB')
    box = (2900, 1150, 3500, 1750); reg = im.crop(box).filter(ImageFilter.GaussianBlur(26))
    m = Image.new('L', reg.size, 0); ImageDraw.Draw(m).rectangle((70, 70, reg.width - 70, reg.height - 70), fill=255)
    im.paste(reg, box[:2], m.filter(ImageFilter.GaussianBlur(40)))
    return im

def phone_src():
    im = Image.open(os.path.join(RAW, 'phone-desk.jpg')).convert('RGB')
    K = im.width / 1100; u = np.array([0.907, 0.421]); u /= np.linalg.norm(u); v = np.array([-u[1], u[0]]); s = 300 / 900 * K
    P = lambda X, Y: tuple(np.array([722, 311]) * K + (X - 450) * s * u + (Y - 750) * s * v)
    quad = [P(152, 104), P(787, 104), P(774, 1382), P(90, 1382)]   # 機身四角：左上、右上、右下、左下
    return im, quad
SCREEN = (0.062, 0.088, 0.938, 0.868)   # 螢幕在機身內的比例（左、上、右、下）

def a_phone():
    im, quad = phone_src(); W, H = 600, 1164
    co = homography([(0, 0), (W, 0), (W, H), (0, H)], quad)
    ph = im.transform((W, H), Image.PERSPECTIVE, co, Image.BICUBIC)
    m = Image.new('L', (W * 2, H * 2), 0); ImageDraw.Draw(m).rounded_rectangle((6, 6, W * 2 - 7, H * 2 - 7), radius=108, fill=255)
    m = m.resize((W, H), Image.LANCZOS)
    a = np.asarray(ph).astype(np.float32); a = a * 0.92 + 8; ph = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); ph.putalpha(m)
    bw = 13; big = Image.new('L', (W + 2 * bw, H + 2 * bw), 0); big.paste(m, (bw, bw))
    edge = big.filter(ImageFilter.MaxFilter(2 * bw + 1))
    ea = np.asarray(edge).astype(np.float32) / 255
    ea = ea * edge_mask(W + 2 * bw, H + 2 * bw, 71, (2.5, 2.5, 2.5, 2.5), (90, 90, 90, 90))   # 剪刀邊微微不齊
    st = to_img(paper_tex(W + 2 * bw, H + 2 * bw, A['white'], 72, grain=4, blotch=3), ea)
    st.alpha_composite(ph, (bw, bw))
    save(shadow(st, pad=50, off=(7, 13), blur=13, alpha=0.38), 'a-phone.png')
    meta['a-phone-body'] = [50 + bw, 50 + bw, W, H]

# ---------- 機櫃（色紙一層一層疊） ----------
def dot(r, color, seed):
    d = sheet(2 * r + 2, 2 * r + 2, color, seed, grain=4); m = Image.new('L', d.size, 0)
    ImageDraw.Draw(m).ellipse((1, 1, 2 * r, 2 * r), fill=255); d.putalpha(m)
    return shadow(d, pad=6, off=(1, 2), blur=1.5, alpha=0.4)

def a_rack():
    W, H = 560, 940; r = np.random.default_rng(81)
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    c.alpha_composite(sheet(W, H, A['blue'], 82, cut=2.2))
    c.alpha_composite(sheet(W - 64, H - 70, '#152B49', 83, cut=1.6), (32, 36))
    creams = ['#F6F0E0', '#EFE7D2', '#F9F4E8', '#EAE0C8']
    for i in range(10):
        uw, uh = 440 + int(r.integers(-6, 6)), 66
        un = sheet(uw, uh, creams[i % 4], 90 + i, cut=1.6)
        vent = sheet(176, 34, '#24456E', 110 + i, cut=1.0); dv = ImageDraw.Draw(vent)
        for k in range(11):
            for j in range(2): dv.ellipse((10 + k * 14.4, 7 + j * 12, 17 + k * 14.4, 14 + j * 12), fill=(16, 30, 52, 255))
        un.alpha_composite(vent, (16, 16))
        bar = sheet(92, 12, A['kraft'], 130 + i, cut=0.8); un.alpha_composite(bar, (214, 27))
        cols = [A['mint'], A['mint'], A['yellow']] if i not in (3, 7) else [A['mint'], A['yellow'], A['yellow']]
        for k, col in enumerate(cols):
            un.alpha_composite(dot(9, col, 150 + i * 3 + k), (uw - 118 + k * 32, 16))
        un = shadow(un, pad=14, off=(2, 4), blur=3, alpha=0.5, color=(5, 10, 25))
        paste(c, un, (60 - 14 + r.integers(-5, 6), 62 - 14 + i * 82 + r.integers(-2, 3)), angle=float(r.uniform(-0.7, 0.7)))
    for x in (70, W - 170):   # 腳
        c.alpha_composite(sheet(100, 20, '#152B49', 170 + x), (x, H - 22))
    save(shadow(c, pad=56, off=(9, 16), blur=15, alpha=0.4), 'a-rack.png')
    meta['a-rack-body'] = [56, 56, W, H]

# ---------- 出餐口（色紙框＋壓暗的廚房照片 Pexels 2881725） ----------
def a_pass():
    W, H = 900, 930
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    wall = paper_tex(W, H - 60, '#F3EAD6', 201, grain=5)
    tl = Image.new('L', (W, H - 60), 0); d = ImageDraw.Draw(tl)   # 下半白磁磚
    for x in range(0, W, 75): d.line([(x, 640), (x, H)], fill=255, width=2)
    for y in range(640, H, 75): d.line([(0, y), (W, y)], fill=255, width=2)
    wall = wall - (np.asarray(tl.filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255 * 26)[:, :, None]
    c.alpha_composite(to_img(wall, edge_mask(W, H - 60, 202, (2, 2, 2, 2), (150,) * 4)), (0, 60))
    ox, oy, ow, oh = 110, 200, 680, 430
    k = kitchen_src().crop((0, 560, 4000, 560 + int(4000 * oh / ow))).resize((ow, oh), Image.LANCZOS)
    ka = duotone(k, '#0B1522', '#8FA0A8', gamma=1.25, keep=0.3, contrast=1.1) * 0.74   # 燈暗
    ka = film_grain(ka, 5, 4)
    inner = Image.fromarray(ka.astype(np.uint8)).convert('RGBA')
    ish = Image.new('L', (ow, oh), 0); ImageDraw.Draw(ish).rectangle((0, 0, ow, 46), fill=150); ImageDraw.Draw(ish).rectangle((0, 0, 30, oh), fill=110)
    inner.alpha_composite(Image.merge('RGBA', (Image.new('L', (ow, oh), 0),) * 3 + (ish.filter(ImageFilter.GaussianBlur(22)),)))
    c.alpha_composite(inner, (ox, oy))
    fw = 26   # 窗框
    for i, (x, y, w, h) in enumerate(((ox - fw, oy - fw, ow + 2 * fw, fw), (ox - fw, oy + oh, ow + 2 * fw, fw), (ox - fw, oy, fw, oh), (ox + ow, oy, fw, oh))):
        c.alpha_composite(shadow(sheet(w, h, A['blue'], 210 + i, cut=1.2), pad=12, off=(2, 4), blur=3, alpha=0.45), (x - 12, y - 12))
    # 點菜單掛軌
    c.alpha_composite(shadow(sheet(ow - 40, 14, A['kraft'], 220, cut=1), pad=10, off=(1, 3), blur=2, alpha=0.5), (ox + 20 - 10, oy + 16 - 10))
    r = np.random.default_rng(221)
    for i in range(5):
        t = sheet(78, int(r.integers(104, 150)), '#D9D5C8', 222 + i, cut=1.2); dt = ImageDraw.Draw(t)
        for j in range(4): dt.line([(12, 22 + j * 20), (12 + int(r.integers(26, 54)), 22 + j * 20)], fill=(120, 118, 110, 255), width=4)
        paste(c, shadow(t, pad=10, off=(2, 4), blur=3, alpha=0.5), (ox + 56 + i * 118 + r.integers(-10, 10) - 10, oy + 22 - 10), angle=float(r.uniform(-4, 4)))
    # 檯面
    c.alpha_composite(shadow(sheet(800, 70, A['kraft'], 230, cut=1.6), pad=24, off=(4, 10), blur=8, alpha=0.45), (50 - 24, oy + oh + 10 - 24))
    # 服務鈴
    by = oy + oh + 12
    dome = sheet(124, 62, A['yellow'], 231); m = Image.new('L', (248, 124), 0); ImageDraw.Draw(m).pieslice((2, 2, 245, 245), 180, 360, fill=255)
    dome.putalpha(m.resize((124, 62), Image.LANCZOS))
    c.alpha_composite(dot(10, A['blue'], 232), (598 + 62 - 17, by - 62 - 24))
    c.alpha_composite(shadow(dome, pad=10, off=(2, 3), blur=3, alpha=0.4), (598 - 10, by - 62 - 10 - 8))
    c.alpha_composite(shadow(sheet(150, 16, A['blue'], 233, cut=0.8), pad=10, off=(2, 3), blur=2, alpha=0.4), (585 - 10, by - 12 - 10))
    # 遮雨棚
    for i in range(8):
        w, h = 116, 176
        t = paper_tex(w, h, A['red'] if i % 2 == 0 else A['white'], 240 + i, grain=5)
        m = Image.new('L', (w * 2, h * 2), 0); dm = ImageDraw.Draw(m); dm.rectangle((0, 0, w * 2, h * 2 - w), fill=255); dm.ellipse((0, h * 2 - 2 * w, w * 2 - 1, h * 2 - 1), fill=255)
        ma = np.asarray(m.resize((w, h), Image.LANCZOS)).astype(np.float32) / 255 * edge_mask(w, h, 250 + i, (0, 1.5, 0, 1.5), (80,) * 4)
        paste(c, shadow(to_img(t, ma), pad=16, off=(3, 7), blur=5, alpha=0.42), (i * 112 - 16 + 2, 0 - 16 + int(r.integers(-3, 4))), angle=float(r.uniform(-0.6, 0.6)))
    c.alpha_composite(shadow(sheet(W, 26, A['blue'], 260, cut=1.2), pad=10, off=(2, 4), blur=3, alpha=0.4), (-10, -10 + 0))
    save(shadow(c, pad=60, off=(10, 18), blur=18, alpha=0.55, color=(5, 15, 10)), 'a-pass.png')
    meta['a-pass-body'] = [60, 60, W, H]

# ---------- 方向 B：照片 ----------
def scrim(arr, top=(0, 0, 0), bottom=(0, 0, 0)):
    """上下壓暗的漸層（top/bottom＝(起點 y, 終點 y, 最大不透明度)）"""
    h = arr.shape[0]; y = np.arange(h, dtype=np.float32); k = np.zeros(h, np.float32)
    if top[2]: k = np.maximum(k, np.clip((top[1] - y) / (top[1] - top[0]), 0, 1) ** 1.3 * top[2])
    if bottom[2]: k = np.maximum(k, np.clip((y - bottom[0]) / (bottom[1] - bottom[0]), 0, 1) ** 1.2 * bottom[2])
    d = np.array(hexrgb(B['dark']), np.float32)
    return arr * (1 - k[:, None, None]) + d[None, None] * k[:, None, None]

def finish_b(arr, name, seed):
    arr = arr * vignette(1080, 1920, 0.38, 2.0)[:, :, None]
    save(Image.fromarray(film_grain(arr, seed, 5).astype(np.uint8)), name)

def b_frames():
    # B-1：手機俯拍，轉正後機身放在畫面下半，出血到底
    im, quad = phone_src(); pad = 1700
    big = Image.fromarray(np.pad(np.asarray(im), ((pad, pad), (pad, pad), (0, 0)), mode='reflect'))
    body = (205, 690, 670, int(670 * 1.94))
    x, y, w, h = body
    co = homography([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], [(qx + pad, qy + pad) for qx, qy in quad])
    ph = big.transform((1080, 1920), Image.PERSPECTIVE, co, Image.BICUBIC)
    a = duotone(ph, B['dark'], B['light'], gamma=1.55, keep=0.12, contrast=1.1) * 0.82
    a = scrim(a, top=(180, 820, 0.86), bottom=(1150, 1800, 0.8))
    finish_b(a, 'b1-bg.png', 301); meta['b1-body'] = list(body)
    # B-2：機櫃特寫（Pexels 1148820）
    im = Image.open(os.path.join(RAW, 'rack-close.jpg')).convert('RGB')
    cw = int(im.height * 1080 / 1920 / 0.86); ch = int(cw * 1920 / 1080); x0 = 820; y0 = 180
    ph = im.crop((x0, y0, x0 + cw, y0 + ch)).resize((1080, 1920), Image.LANCZOS)
    a = duotone(ph, B['dark'], B['light'], gamma=1.15, keep=0.2, contrast=1.15) * 0.95
    a = scrim(a, top=(150, 520, 0.6), bottom=(900, 1500, 0.9))
    finish_b(a, 'b2-bg.png', 302)
    # B-3：廚房（Pexels 2881725），壓暗＝出事
    im = kitchen_src()
    cw = 3300; ch = int(cw * 1920 / 1080); ph = im.crop((350, 60, 350 + cw, 60 + ch)).resize((1080, 1920), Image.LANCZOS)
    a = duotone(ph, B['dark'], B['light'], gamma=1.35, keep=0.3, contrast=1.15) * 0.8
    a = scrim(a, top=(150, 600, 0.5), bottom=(1050, 1650, 0.85))
    finish_b(a, 'b3-bg.png', 303)
    for w, h, s, c in ((470, 190, 311, B['yellow']), (330, 132, 312, B['yellow']), (250, 92, 313, B['yellow']), (300, 92, 314, B['yellow']), (200, 92, 315, B['yellow'])):
        save(marker(w, h, c, s, alpha=0.97), f'b-mark-{w}.png')

if __name__ == '__main__':
    a_backgrounds(); a_papers(); a_phone(); a_rack(); a_pass(); b_frames()
    json.dump(meta, open(os.path.join(O, 'meta.json'), 'w'), indent=1)
    print(json.dumps(meta))
