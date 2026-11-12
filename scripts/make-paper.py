"""styleVersion 3（桌面紙拼貼）素材產生器：全部點陣 PNG，固定 seed，可重現。
用法：python3 scripts/make-paper.py [slug] [--skin=desk|blueprint|newsprint|notebook|sticky] [--photos=DIR] [--only=函式,函式]
      （slug 預設 what-is-server；skin 預設讀 videos/<slug>/script.json 的 skin，沒有就是 desk）
輸出：public/v3/<slug>/*.png ＋ meta.json（每張圖的尺寸與「紙本體」在圖內的位置；圖四邊有烤好的落影留白）
來源：紙材函式在 scripts/styleframes/paper.py；照片在 out/<slug>/assets-raw/photos/（Pexels，見 videos/<slug>/assets.md；做法見 docs/style-v3/photos-howto.md）。
每支片自己的設定（可選）：videos/<slug>/assets.json＝{ "photos": { "<檔名不含副檔名>": { crop, focus, shape, frames, tone, lift, blur } }, "papers": { "<紙材名>": { w, h, color, torn, cut, radius, shadow } } }
色票：預設（desk）寫在下面的 A；其他 skin 讀 src/theme-v3-skins.json（和 src/theme.ts 的 THEME_V3.skins 同一份）。
public/v3/ 不 commit（.gitignore）。"""
import os, sys, json, glob, zlib, numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'styleframes'))
from paper import *  # noqa

_args = [a for a in sys.argv[1:] if not a.startswith('--')]
SLUG = _args[0] if _args else 'what-is-server'
ROOT = os.path.abspath(os.path.join(HERE, '..'))
def _opt(k, d=None):
    v = [a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith(f'--{k}=')]
    return v[0] if v else d
RAW = _opt('photos') or os.path.join(ROOT, 'out', SLUG, 'assets-raw', 'photos')
O = os.path.join(ROOT, 'public', 'v3', SLUG); os.makedirs(O, exist_ok=True)
# 色表＝src/theme.ts THEME_V3（兩邊要一致）
A = dict(desk='#EFE6D4', mat='#2F4A3A', white='#FFFDF7', kraft='#C9A66B', red='#D9482B', yellow='#F2B632', blue='#1F3A5F', mint='#7DB7A0', ink='#1E1B16',
         navy2='#152B49', cream='#F6F0E0', night='#22304F', dawn='#F6DFA0', sky='#BFD9E6')
# ---------- skin：換色票與桌面紙紋（src/theme-v3-skins.json；desk＝上面的預設值，一個字都不改） ----------
_sp = os.path.join(ROOT, 'videos', SLUG, 'script.json')
SKIN = _opt('skin') or (json.load(open(_sp)).get('skin') if os.path.exists(_sp) else None) or 'desk'
SKINS = json.load(open(os.path.join(ROOT, 'src', 'theme-v3-skins.json')))
if SKIN not in SKINS: sys.exit(f'✖ skin「{SKIN}」不存在（{"／".join(SKINS)}）')
SK = SKINS[SKIN]
if SKIN != 'desk':
    for k in ('desk', 'mat', 'kraft', 'red', 'yellow', 'blue', 'mint', 'ink'): A[k] = SK.get(k, A[k])
    A['white'] = SK.get('paper', A['white']); A.update(SK.get('extra', {}))
_cp = os.path.join(ROOT, 'videos', SLUG, 'assets.json')
CFG = json.load(open(_cp)) if os.path.exists(_cp) else {}
# 舊片（what-is-server，desk）照原本的流程跑，產出的檔案一張都不變；其他片走通用流程（generic／photos／custom）
LEGACY = SLUG == 'what-is-server' and SKIN == 'desk'
meta = {}

def save(img, name, body=None):
    img.save(os.path.join(O, name + '.png'))
    meta[name] = dict(w=img.size[0], h=img.size[1], body=list(body) if body else [0, 0, img.size[0], img.size[1]])

def sh(img, pad=40, name=None, **kw):
    """加落影並存檔；body＝紙本體在圖內的位置"""
    out = shadow(img, pad=pad, **kw)
    if name: save(out, name, (pad, pad, img.size[0], img.size[1]))
    return out

# ---------- 可平鋪的紙紋（桌面、切割墊）：四邊接得起來，鏡頭在大桌面上平移時用 CSS repeat ----------
def tile_noise(w, h, seed, scale):
    r = np.random.default_rng(seed)
    sw, sh_ = max(2, round(w / scale)), max(2, round(h / scale))
    g = r.random((sh_, sw)).astype(np.float32)
    g = np.pad(g, 2, mode='wrap')
    big = np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize((round(w * (sw + 4) / sw), round(h * (sh_ + 4) / sh_)), Image.BICUBIC)).astype(np.float32)
    ox, oy = round(2 * w / sw), round(2 * h / sh_)
    return big[oy:oy + h, ox:ox + w] / 127.5 - 1

def tile_tex(w, h, color, seed, grain=5, blotch=6):
    r = np.random.default_rng(seed)
    c = np.array(hexrgb(color), np.float32)
    g = np.pad(r.normal(0, grain, (h, w)).astype(np.float32), 8, mode='wrap')
    g = np.asarray(Image.fromarray(np.clip(g + 128, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32)[8:-8, 8:-8] - 128
    lum = g + blotch * tile_noise(w, h, seed + 1, 90) + blotch * 0.6 * tile_noise(w, h, seed + 2, 22)
    fb = Image.new('L', (w, h), 128); d = ImageDraw.Draw(fb)
    for _ in range(int(w * h / 9000)):
        x, y = int(r.integers(0, w)), int(r.integers(0, h)); a = r.random() * np.pi; L = int(r.integers(8, 34)); f = int(128 + r.choice([-1, 1]) * r.integers(10, 26))
        for dx in (-w, 0, w):
            for dy in (-h, 0, h):
                d.line([(x + dx, y + dy), (x + dx + np.cos(a) * L, y + dy + np.sin(a) * L)], fill=f, width=1)
    lum += (np.asarray(fb.filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32) - 128) * 0.55
    return np.clip(c[None, None, :] + lum[:, :, None], 0, 255)

def tint(t, mask, color, k):
    """把 t（RGB float）在 mask（0..1）的地方往 color 靠 k 成"""
    m = (mask * k)[:, :, None]
    return t * (1 - m) + np.array(hexrgb(color), np.float32)[None, None] * m

def desk_tile():
    """桌面紙紋（1080×1920 可平鋪）。線條、斑點的對比都壓在 30/255 以內：覆蓋率檢查（cov2.py）才不會把桌面紋路算成「有東西」"""
    W, H = 1080, 1920; kind = SK.get('deskKind', 'plain')
    if kind == 'plain': return tile_tex(W, H, A['desk'], 11)
    if kind == 'grid':      # 藍圖方格紙：30px 細格、120px 粗格（兩個方向都整除）
        t = tile_tex(W, H, A['desk'], 11, grain=4, blotch=5)
        g = Image.new('L', (W, H), 0); d = ImageDraw.Draw(g)
        for x in range(0, W, 30): d.line([(x, 0), (x, H)], fill=255 if x % 120 == 0 else 120, width=2 if x % 120 == 0 else 1)
        for y in range(0, H, 30): d.line([(0, y), (W, y)], fill=255 if y % 120 == 0 else 120, width=2 if y % 120 == 0 else 1)
        return tint(t, np.asarray(g).astype(np.float32) / 255 * (0.8 + 0.2 * tile_noise(W, H, 5, 120)), SK.get('deskLine', '#FFFFFF'), 0.17)
    if kind == 'ruled':     # 橫線筆記本：每 60px 一條淡藍線
        t = tile_tex(W, H, A['desk'], 11, grain=4, blotch=4)
        g = Image.new('L', (W, H), 0); d = ImageDraw.Draw(g)
        for y in range(30, H, 60): d.line([(0, y), (W, y)], fill=255, width=2)
        return tint(t, np.asarray(g).astype(np.float32) / 255, SK.get('deskLine', '#9DB9DA'), 0.3)
    if kind == 'cork':      # 軟木板：大塊色斑＋細碎顆粒（深、淺兩種）
        t = tile_tex(W, H, A['desk'], 11, grain=6, blotch=9)
        r = np.random.default_rng(13); sp = np.zeros((H, W), np.float32)
        for n, amp, rad in ((5200, -13, 3), (3800, 9, 2), (900, -10, 5)):
            xs, ys = r.integers(0, W, n), r.integers(0, H, n)
            im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im)
            for x, y in zip(xs, ys):
                rr = int(r.integers(1, rad + 1))
                for dx in (-W, 0, W):
                    for dy in (-H, 0, H): d.ellipse((x + dx - rr, y + dy - rr, x + dx + rr, y + dy + rr), fill=255)
            sp += np.asarray(im.filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255 * amp
        return np.clip(t + sp[:, :, None], 0, 255)
    if kind == 'board':     # 白板：很細的紋理＋擦過的淡痕
        t = tile_tex(W, H, A['desk'], 11, grain=2, blotch=2)
        sm = np.clip(tile_noise(W, H, 14, 260) * 0.5 + tile_noise(W, H, 15, 70) * 0.5, 0, 1)
        return np.clip(t - 9 * sm[:, :, None] * np.array([1.0, 0.95, 0.85], np.float32), 0, 255)
    sys.exit(f'✖ deskKind「{kind}」不存在')

def backgrounds():
    save(Image.fromarray(desk_tile().astype(np.uint8)), 'desk')
    W, H = 1500, 1800   # 切割墊：60px 細格、300px 粗格，兩個方向都整除
    t = tile_tex(W, H, A['mat'], 12, grain=5, blotch=5)
    g = Image.new('L', (W, H), 0); d = ImageDraw.Draw(g)
    for x in range(0, W, 60): d.line([(x, 0), (x, H)], fill=70 if x % 300 else 150, width=1 if x % 300 else 2)
    for y in range(0, H, 60): d.line([(0, y), (W, y)], fill=70 if y % 300 else 150, width=1 if y % 300 else 2)
    t = t + (np.asarray(g).astype(np.float32) / 255 * (0.75 + 0.25 * tile_noise(W, H, 5, 120)))[:, :, None] * np.array([70, 95, 80], np.float32)
    r = np.random.default_rng(3); sc = Image.new('L', (W, H), 0); d = ImageDraw.Draw(sc)   # 刀痕（不跨邊）
    for _ in range(22):
        x, y = int(r.integers(200, W - 200)), int(r.integers(200, H - 200)); a = r.random() * np.pi; L = int(r.integers(60, 190))
        d.line([(x, y), (x + np.cos(a) * L, y + np.sin(a) * L)], fill=int(r.integers(40, 110)), width=1)
    t = t + (np.asarray(sc.filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) / 255 * 38)[:, :, None]
    save(Image.fromarray(np.clip(t, 0, 255).astype(np.uint8)), 'mat')
    # 暗角（螢幕固定的一層；桌面平移時不跟著動）
    y, x = np.mgrid[0:960, 0:540]
    dd = np.sqrt(((x - 270) / 270) ** 2 + ((y - 480) / 480) ** 2) / np.sqrt(2)
    al = (np.clip(dd, 0, 1) ** 2.2 * 255).astype(np.uint8)
    v = Image.merge('RGBA', (Image.new('L', (540, 960), 40), Image.new('L', (540, 960), 30), Image.new('L', (540, 960), 15), Image.fromarray(al)))
    save(v.resize((1080, 1920), Image.BICUBIC), 'vignette')

# ---------- 形狀工具：任意遮罩 → 有紙紋、剪刀邊、厚度的色紙 ----------
def wobble(mask, seed, amp=2.0, scale=38):
    """把遮罩邊緣弄得微微不齊（剪刀感）。mask：L 影像"""
    w, h = mask.size
    m = np.asarray(mask.filter(ImageFilter.GaussianBlur(amp))).astype(np.float32) / 255
    m = m + 0.22 * noise2d(w, h, seed, scale) + 0.10 * noise2d(w, h, seed + 1, 9)
    hard = Image.fromarray(((m > 0.5) * 255).astype(np.uint8))
    return hard.filter(ImageFilter.GaussianBlur(0.7))

def shape(mask, color, seed, grain=6, edge=2.0):
    m = wobble(mask, seed + 50, edge) if edge else mask
    w, h = m.size
    ma = np.asarray(m).astype(np.float32) / 255
    tex = paper_tex(w, h, color, seed, grain=grain)
    s2 = np.asarray(m.transform(m.size, Image.AFFINE, (1, 0, 1.5, 0, 1, 1.5))).astype(np.float32) / 255
    h2 = np.asarray(m.transform(m.size, Image.AFFINE, (1, 0, -1.5, 0, 1, -1.5))).astype(np.float32) / 255
    tex = tex - 16 * np.clip(ma - s2, 0, 1)[:, :, None] + 10 * np.clip(ma - h2, 0, 1)[:, :, None]
    return to_img(tex, ma)

def M(w, h, S=3):
    im = Image.new('L', (w * S, h * S), 0); return im, ImageDraw.Draw(im), S
def done(im, w, h): return im.resize((w, h), Image.LANCZOS)

def layer(c, img, xy, angle=0, **kw):
    """把一層色紙（含小落影）貼到 c 上；xy＝紙本體左上角"""
    kw = dict(dict(pad=12, off=(2, 4), blur=3, alpha=0.42), **kw)
    s = shadow(img, **kw)
    paste(c, s, (xy[0] - kw['pad'], xy[1] - kw['pad']), angle)

def canvas(w, h): return Image.new('RGBA', (w, h), (0, 0, 0, 0))

# ---------- 紙條、標籤、膠帶、筆觸 ----------
def papers():
    sh(sheet(920, 500, A['white'], 21, torn='lr'), name='strip-hook')
    sh(sheet(952, 232, A['white'], 22, torn='lr'), name='caption', off=(3, 7), blur=8, alpha=0.4)
    sh(sheet(560, 300, A['white'], 24, torn='rb'), name='label')
    sh(sheet(420, 150, A['white'], 27, torn='l'), name='label-s', pad=30, off=(4, 8), blur=7)
    sh(sheet(760, 250, A['red'], 25, torn='lr', grain=6), name='strip-red', off=(6, 12), blur=11, alpha=0.5, color=(5, 15, 10))
    sh(sheet(330, 132, A['red'], 28, torn='r', grain=6), name='tag-red', pad=30, off=(4, 8), blur=7, alpha=0.45)
    sh(sheet(760, 250, A['white'], 29, torn='lr'), name='strip-white')
    sh(sheet(680, 62, A['kraft'], 26, torn='r'), name='src', pad=20, off=(2, 4), blur=4, alpha=0.3)
    sh(sheet(900, 620, A['white'], 30, torn='b'), name='sheet-big', pad=60, off=(8, 16), blur=16, alpha=0.5, color=(5, 15, 10))
    sh(sheet(620, 300, A['yellow'], 36, torn='tl', grain=6), name='strip-yellow')
    # 蓋滿畫面的大色紙（轉場用）：比畫面大，邊緣出血
    sh(sheet(1240, 2200, A['kraft'], 34, torn='t', tear=14), name='sheet-kraft', pad=60, off=(0, -14), blur=22, alpha=0.5)
    sh(sheet(1240, 2200, A['white'], 35, torn='t', tear=14), name='sheet-cream', pad=60, off=(0, -14), blur=22, alpha=0.5)
    sh(sheet(1240, 1500, A['night'], 37, torn='r', tear=12, grain=6), name='sheet-night', pad=50, off=(6, 12), blur=14, alpha=0.5, color=(5, 15, 10))
    sh(sheet(1240, 1500, A['dawn'], 38, torn='l', tear=12, grain=6), name='sheet-dawn', pad=50, off=(6, 12), blur=14, alpha=0.5, color=(5, 15, 10))
    for n, c, s in (('y', A['yellow'], 31), ('m', A['mint'], 32), ('r', A['red'], 33)):
        sh(tape(190, 56, c, s, 0.86), name=f'tape-{n}', pad=14, off=(1, 2), blur=2, alpha=0.22)
    # 麥克筆底（芥末黃，寬高比約 3:1～4:1，CSS 會拉到字寬）、底線、圈、叉
    for i, (w, h, s) in enumerate(((330, 84, 41), (250, 84, 42), (300, 96, 43))):
        save(marker(w, h, A['yellow'], s), f'mark-{i}')
    save(marker(420, 30, A['red'], 46, alpha=0.95), 'underline')
    # 圈：手畫橢圓環，起筆收筆不接合
    w, h = 460, 190; im, d, S = M(w, h)
    r = np.random.default_rng(47); pts_o = []
    for k in range(0, 372, 4):
        t = np.deg2rad(k - 100); wob = 1 + 0.035 * np.sin(t * 3 + 1) + (k / 372) * 0.05
        pts_o.append(((w / 2 + (w / 2 - 16) * np.cos(t) * wob) * S, (h / 2 + (h / 2 - 16) * np.sin(t) * wob) * S))
    d.line(pts_o, fill=255, width=11 * S, joint='curve')
    save(shape(done(im, w, h), A['red'], 48, grain=3, edge=1.2), 'circle')
    for k, pts in enumerate((((14, 16), (116, 118)), ((114, 12), (18, 120)))):   # 叉：兩筆分開存，依序擦出
        im, d, S = M(132, 132); d.line([(x * S, y * S) for x, y in pts], fill=255, width=15 * S)
        save(shape(done(im, 132, 132), A['red'], 49 + k, grain=3, edge=1.2), f'cross-{k}')
    for i in range(6):
        sh(sheet(74, 22, A['white'] if i % 2 else A['yellow'], 50 + i), name=f'dash-{i}', pad=10, off=(1, 3), blur=2, alpha=0.35)
    im, d, S = M(30, 30); d.ellipse((2 * S, 2 * S, 28 * S, 28 * S), fill=255)
    save(shape(done(im, 30, 30), A['red'], 60, edge=0), 'dot')

# ---------- 手機（Pexels 358627 去背成貼紙，螢幕留給 HTML） ----------
def kitchen_src():
    im = Image.open(os.path.join(RAW, 'kitchen.jpg')).convert('RGB')   # 鍋柄品牌小字糊掉
    box = (2900, 1150, 3500, 1750); reg = im.crop(box).filter(ImageFilter.GaussianBlur(26))
    m = Image.new('L', reg.size, 0); ImageDraw.Draw(m).rectangle((70, 70, reg.width - 70, reg.height - 70), fill=255)
    im.paste(reg, box[:2], m.filter(ImageFilter.GaussianBlur(40)))
    return im

def phone():
    im = Image.open(os.path.join(RAW, 'phone-desk.jpg')).convert('RGB')
    K = im.width / 1100; u = np.array([0.907, 0.421]); u /= np.linalg.norm(u); v = np.array([-u[1], u[0]]); s = 300 / 900 * K
    P = lambda X, Y: tuple(np.array([722, 311]) * K + (X - 450) * s * u + (Y - 750) * s * v)
    quad = [P(152, 104), P(787, 104), P(774, 1382), P(90, 1382)]
    W, H = 600, 1164
    ph = im.transform((W, H), Image.PERSPECTIVE, homography([(0, 0), (W, 0), (W, H), (0, H)], quad), Image.BICUBIC)
    m = Image.new('L', (W * 2, H * 2), 0); ImageDraw.Draw(m).rounded_rectangle((6, 6, W * 2 - 7, H * 2 - 7), radius=108, fill=255)
    m = m.resize((W, H), Image.LANCZOS)
    a = np.asarray(ph).astype(np.float32) * 0.92 + 8
    dark = np.median(a[H - 32:H - 28, 250:500].reshape(-1, 3), axis=0); a[H - 24:, :] = dark; a[H - 48:, :140] = dark; a[H - 120:, :16] = dark   # 去背殘邊：左下角透視校正後還留一小塊桌面木紋，用機身邊緣的顏色補掉
    ph = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); ph.putalpha(m)
    bw = 13; big = Image.new('L', (W + 2 * bw, H + 2 * bw), 0); big.paste(m, (bw, bw))
    ea = np.asarray(big.filter(ImageFilter.MaxFilter(2 * bw + 1))).astype(np.float32) / 255
    ea = ea * edge_mask(W + 2 * bw, H + 2 * bw, 71, (2.5,) * 4, (90,) * 4)
    st = to_img(paper_tex(W + 2 * bw, H + 2 * bw, A['white'], 72, grain=4, blotch=3), ea)
    st.alpha_composite(ph, (bw, bw))
    save(shadow(st, pad=50, off=(7, 13), blur=13, alpha=0.38), 'phone', (50 + bw, 50 + bw, W, H))

# ---------- 機櫃（色紙一層一層疊） ----------
def dot(r, color, seed):
    im, d, S = M(2 * r + 2, 2 * r + 2); d.ellipse((S, S, (2 * r + 1) * S, (2 * r + 1) * S), fill=255)
    return shadow(shape(done(im, 2 * r + 2, 2 * r + 2), color, seed, grain=4, edge=0), pad=6, off=(1, 2), blur=1.5, alpha=0.4)

def rack():
    W, H = 560, 940; r = np.random.default_rng(81)
    c = canvas(W, H)
    c.alpha_composite(sheet(W, H, A['blue'], 82, cut=2.2))
    c.alpha_composite(sheet(W - 64, H - 70, A['navy2'], 83, cut=1.6), (32, 36))
    creams = ['#F6F0E0', '#EFE7D2', '#F9F4E8', '#EAE0C8']
    for i in range(10):
        uw, uh = 440 + int(r.integers(-6, 6)), 66
        un = sheet(uw, uh, creams[i % 4], 90 + i, cut=1.6)
        vent = sheet(176, 34, '#24456E', 110 + i, cut=1.0); dv = ImageDraw.Draw(vent)
        for k in range(11):
            for j in range(2): dv.ellipse((10 + k * 14.4, 7 + j * 12, 17 + k * 14.4, 14 + j * 12), fill=(16, 30, 52, 255))
        un.alpha_composite(vent, (16, 16))
        un.alpha_composite(sheet(92, 12, A['kraft'], 130 + i, cut=0.8), (214, 27))
        cols = [A['mint'], A['mint'], A['yellow']] if i not in (3, 7) else [A['mint'], A['yellow'], A['yellow']]
        for k, col in enumerate(cols): un.alpha_composite(dot(9, col, 150 + i * 3 + k), (uw - 118 + k * 32, 16))
        un = shadow(un, pad=14, off=(2, 4), blur=3, alpha=0.5, color=(5, 10, 25))
        paste(c, un, (60 - 14 + r.integers(-5, 6), 62 - 14 + i * 82 + r.integers(-2, 3)), angle=float(r.uniform(-0.7, 0.7)))
    for x in (70, W - 170): c.alpha_composite(sheet(100, 20, A['navy2'], 170 + x), (x, H - 22))
    save(shadow(c, pad=56, off=(9, 16), blur=15, alpha=0.4), 'rack', (56, 56, W, H))
    s = c.resize((280, 470), Image.LANCZOS)   # 機櫃牆用的小張（落影照小尺寸重烤）
    save(shadow(s, pad=30, off=(5, 9), blur=8, alpha=0.4), 'rack-s', (30, 30, 280, 470))

# ---------- 出餐口：牆（窗洞透明）＋窗內（亮／暗的廚房照片 Pexels 2881725）＋鐵捲門＋前景（窗框、掛單、檯面、服務鈴、遮雨棚） ----------
PASS = dict(W=900, H=930, ox=110, oy=200, ow=680, oh=430)
def pass_window():
    W, H, ox, oy, ow, oh = (PASS[k] for k in ('W', 'H', 'ox', 'oy', 'ow', 'oh'))
    wall = paper_tex(W, H - 60, '#F3EAD6', 201, grain=5)
    tl = Image.new('L', (W, H - 60), 0); d = ImageDraw.Draw(tl)
    for x in range(0, W, 75): d.line([(x, 640), (x, H)], fill=255, width=2)
    for y in range(640, H, 75): d.line([(0, y), (W, y)], fill=255, width=2)
    wall = wall - (np.asarray(tl.filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255 * 26)[:, :, None]
    al = edge_mask(W, H - 60, 202, (2, 2, 2, 2), (150,) * 4)
    al[oy - 60:oy - 60 + oh, ox:ox + ow] = 0   # 窗洞
    c = canvas(W, H); c.alpha_composite(to_img(wall, al), (0, 60))
    full = canvas(W, H); full.alpha_composite(to_img(wall, edge_mask(W, H - 60, 202, (2, 2, 2, 2), (150,) * 4)), (0, 60))
    shd = shadow(full, pad=60, off=(10, 18), blur=18, alpha=0.55, color=(5, 15, 10))   # 落影用沒有洞的輪廓
    px = np.asarray(shd).copy(); body = np.asarray(c)
    reg = px[60:60 + H, 60:60 + W]; hole = np.zeros((H, W), bool); hole[oy:oy + oh, ox:ox + ow] = True
    reg[hole] = 0; px[60:60 + H, 60:60 + W] = reg
    save(Image.fromarray(px), 'pass-wall', (60, 60, W, H))
    # 窗內照片：亮（營業中）與暗（出事）
    k = kitchen_src().crop((0, 560, 4000, 560 + int(4000 * oh / ow))).resize((ow, oh), Image.LANCZOS)
    def inner(arr, seed):
        im = Image.fromarray(film_grain(arr, seed, 4).astype(np.uint8)).convert('RGBA')
        ish = Image.new('L', (ow, oh), 0); ImageDraw.Draw(ish).rectangle((0, 0, ow, 46), fill=150); ImageDraw.Draw(ish).rectangle((0, 0, 30, oh), fill=110)
        im.alpha_composite(Image.merge('RGBA', (Image.new('L', (ow, oh), 0),) * 3 + (ish.filter(ImageFilter.GaussianBlur(22)),)))
        return im
    lit = duotone(k, '#2A1E12', '#FFF1D2', gamma=0.85, keep=0.55, contrast=1.05)
    save(inner(lit, 5), 'kitchen-lit')
    save(inner(duotone(k, '#0B1522', '#8FA0A8', gamma=1.25, keep=0.3, contrast=1.1) * 0.6, 6), 'kitchen-dark')
    # 鐵捲門：橫紋紙一條一條疊（比窗洞略高，可逐格下拉）
    sw, shh = ow, oh + 20; s = canvas(sw, shh)
    for i in range(10):
        sl = sheet(sw, 48, '#8E9AA3' if i % 2 else '#A3ADB4', 300 + i, cut=1.0, grain=5)
        layer(s, sl, (0, i * 45), pad=8, off=(0, 3), blur=2, alpha=0.5)
    s.alpha_composite(sheet(sw, 26, '#5C6770', 320, cut=1.0), (0, shh - 26))
    s.alpha_composite(sheet(120, 12, A['ink'], 321, cut=0.6), (sw // 2 - 60, shh - 19))
    save(s, 'shutter')
    # 前景
    c = canvas(W, H); fw = 26
    for i, (x, y, w, h) in enumerate(((ox - fw, oy - fw, ow + 2 * fw, fw), (ox - fw, oy + oh, ow + 2 * fw, fw), (ox - fw, oy, fw, oh), (ox + ow, oy, fw, oh))):
        layer(c, sheet(w, h, A['blue'], 210 + i, cut=1.2), (x, y), alpha=0.45)
    hg = canvas(W, H)   # 窗內掛的點餐單（另存 pass-hang：畫在鐵捲門後面，門拉下來會蓋住）
    layer(hg, sheet(ow - 40, 14, A['kraft'], 220, cut=1), (ox + 20, oy + 16), pad=10, off=(1, 3), blur=2, alpha=0.5)
    r = np.random.default_rng(221)
    for i in range(5):
        t = sheet(78, int(r.integers(104, 150)), '#D9D5C8', 222 + i, cut=1.2); dt = ImageDraw.Draw(t)
        for j in range(4): dt.line([(12, 22 + j * 20), (12 + int(r.integers(26, 54)), 22 + j * 20)], fill=(120, 118, 110, 255), width=4)
        paste(hg, shadow(t, pad=10, off=(2, 4), blur=3, alpha=0.5), (ox + 56 + i * 118 + r.integers(-10, 10) - 10, oy + 22 - 10), angle=float(r.uniform(-4, 4)))
    save(hg, 'pass-hang')
    layer(c, sheet(800, 70, A['kraft'], 230, cut=1.6), (50, oy + oh + 10), pad=24, off=(4, 10), blur=8, alpha=0.45)
    by = oy + oh + 12
    im, d, S = M(124, 62); d.pieslice((0, 0, 124 * S - 1, 124 * S - 1), 180, 360, fill=255)
    c.alpha_composite(dot(10, A['blue'], 232), (598 + 62 - 17, by - 62 - 24))
    layer(c, shape(done(im, 124, 62), A['yellow'], 231, edge=0), (598, by - 62 - 8), pad=10, off=(2, 3), blur=3, alpha=0.4)
    layer(c, sheet(150, 16, A['blue'], 233, cut=0.8), (585, by - 12), pad=10, off=(2, 3), blur=2, alpha=0.4)
    for i in range(8):
        w, h = 116, 176
        t = paper_tex(w, h, A['red'] if i % 2 == 0 else A['white'], 240 + i, grain=5)
        m = Image.new('L', (w * 2, h * 2), 0); dm = ImageDraw.Draw(m); dm.rectangle((0, 0, w * 2, h * 2 - w), fill=255); dm.ellipse((0, h * 2 - 2 * w, w * 2 - 1, h * 2 - 1), fill=255)
        ma = np.asarray(m.resize((w, h), Image.LANCZOS)).astype(np.float32) / 255 * edge_mask(w, h, 250 + i, (0, 1.5, 0, 1.5), (80,) * 4)
        paste(c, shadow(to_img(t, ma), pad=16, off=(3, 7), blur=5, alpha=0.42), (i * 112 - 16 + 2, 0 - 16 + int(r.integers(-3, 4))), angle=float(r.uniform(-0.6, 0.6)))
    layer(c, sheet(W, 26, A['blue'], 260, cut=1.2), (0, 0), pad=10, alpha=0.4)
    save(c, 'pass-front')
    meta['pass'] = dict(w=W, h=H, body=[0, 0, W, H], window=[ox, oy, ow, oh])

# ---------- 小物件（色紙疊；每樣至少兩層＋紙紋＋不齊的剪邊＋落影） ----------
def small():
    # 沖印照片：白邊＋薄荷天空＋兩座山＋太陽
    c = sheet(210, 180, A['white'], 400, cut=1.2)
    pic = sheet(182, 126, A['sky'], 401, cut=0.8)
    for k, (pts, col) in enumerate((([(0, 126), (70, 44), (140, 126)], A['mint']), ([(64, 126), (128, 66), (182, 118), (182, 126)], A['blue']))):
        im, d, S = M(182, 126); d.polygon([(x * S, y * S) for x, y in pts], fill=255)
        pic.alpha_composite(shadow(shape(done(im, 182, 126), col, 402 + k, edge=1.2), pad=0, off=(1, 2), blur=1.5, alpha=0.35))
    pic.alpha_composite(dot(15, A['yellow'], 404), (128, 14))
    pm = Image.new('L', pic.size, 0); ImageDraw.Draw(pm).rectangle((1, 1, 180, 124), fill=255)
    pic.putalpha(Image.fromarray(np.minimum(np.asarray(pic.split()[3]), np.asarray(pm))))
    c.alpha_composite(pic, (14, 14))
    sh(c, name='photo', pad=24, off=(3, 6), blur=6, alpha=0.4)
    # 信封：牛皮色底＋較深的封口三角＋紅圓封蠟
    c = sheet(220, 150, A['kraft'], 410, cut=1.4)
    im, d, S = M(220, 150); d.polygon([(4 * S, 3 * S), (216 * S, 3 * S), (110 * S, 92 * S)], fill=255)
    c.alpha_composite(shadow(shape(done(im, 220, 150), '#B58F52', 411, edge=1.2), pad=0, off=(1, 3), blur=2, alpha=0.4))
    c.alpha_composite(dot(13, A['red'], 412), (110 - 19, 78))
    sh(c, name='envelope', pad=24, off=(3, 6), blur=6, alpha=0.4)
    # 愛心：紅紙＋白色襯底（貼紙邊）
    def heart(w, h, inset):
        im, d, S = M(w, h); r_ = (w / 2 - inset) / 2 + inset * 0.2
        cx1, cx2, cy = w * 0.29, w * 0.71, h * 0.33; rr = w * 0.27 - inset
        d.ellipse(((cx1 - rr) * S, (cy - rr) * S, (cx1 + rr) * S, (cy + rr) * S), fill=255); d.ellipse(((cx2 - rr) * S, (cy - rr) * S, (cx2 + rr) * S, (cy + rr) * S), fill=255)
        d.polygon([((cx1 - rr * 0.93) * S, (cy + rr * 0.38) * S), (cx1 * S, cy * S), (cx2 * S, cy * S), ((cx2 + rr * 0.93) * S, (cy + rr * 0.38) * S), (w / 2 * S, (h - 6 - inset * 1.3) * S)], fill=255)
        return done(im, w, h)
    c = shape(heart(180, 170, 0), A['white'], 420, edge=1.2); c.alpha_composite(shape(heart(180, 170, 12), A['red'], 421, edge=1.4))
    sh(c, name='heart', pad=24, off=(3, 6), blur=6, alpha=0.4)
    # 小單：白紙（下緣撕邊）＋牛皮色頭＋小相片圖樣（不寫字）
    c = sheet(150, 190, A['white'], 430, torn='b', tear=6)
    c.alpha_composite(sheet(150, 30, A['kraft'], 431, cut=0.8), (0, 0))
    p = sheet(96, 72, A['sky'], 432, cut=0.8); im, d, S = M(96, 72); d.polygon([(6 * S, 72 * S), (44 * S, 26 * S), (90 * S, 72 * S)], fill=255)
    p.alpha_composite(shape(done(im, 96, 72), A['mint'], 433, edge=1.0)); p.alpha_composite(dot(8, A['yellow'], 434), (64, 6))
    layer(c, p, (27, 48), pad=8, off=(1, 2), blur=2, alpha=0.35)
    dt = ImageDraw.Draw(c)
    for j in range(2): dt.line([(27, 140 + j * 18), (27 + (96 if j == 0 else 60), 140 + j * 18)], fill=(150, 146, 136, 255), width=5)
    sh(c, name='ticket', pad=20, off=(3, 6), blur=5, alpha=0.4)
    # 設定單：三個勾選格（第二格之後由畫面打紅叉）
    c = sheet(300, 330, A['white'], 440, torn='b', tear=6)
    c.alpha_composite(sheet(300, 44, A['blue'], 441, cut=0.8), (0, 0))
    dt = ImageDraw.Draw(c)
    for j in range(3):
        y = 78 + j * 80
        dt.rounded_rectangle((30, y, 82, y + 52), radius=6, outline=(30, 27, 22, 255), width=5)
        dt.line([(108, y + 16), (108 + (150, 120, 160)[j], y + 16)], fill=(150, 146, 136, 255), width=7)
        dt.line([(108, y + 38), (108 + (90, 140, 70)[j], y + 38)], fill=(190, 186, 176, 255), width=7)
        if j != 1: dt.line([(38, y + 26), (52, y + 42), (76, y + 10)], fill=(31, 58, 95, 255), width=8, joint='curve')
    sh(c, name='ticket-config', pad=30, off=(4, 8), blur=7, alpha=0.42)
    meta['ticket-config']['box2'] = [30, 78 + 80, 52, 52]
    # 掛鎖：深藍鎖環（環形紙）＋芥末黃鎖身＋牛皮色底板＋鑰匙孔
    W, H = 260, 320; c = canvas(W, H)
    im, d, S = M(W, H); d.ellipse((50 * S, 8 * S, 210 * S, 220 * S), fill=255); d.ellipse((86 * S, 46 * S, 174 * S, 220 * S), fill=0); d.rectangle((0, 150 * S, W * S, H * S), fill=0)
    d.rectangle((50 * S, 110 * S, 86 * S, 170 * S), fill=255); d.rectangle((174 * S, 110 * S, 210 * S, 170 * S), fill=255)
    layer(c, shape(done(im, W, H), A['blue'], 450, edge=1.4), (0, 0), pad=0, off=(2, 4), blur=3, alpha=0.4)
    im, d, S = M(240, 176); d.rounded_rectangle((2 * S, 2 * S, 238 * S, 174 * S), radius=26 * S, fill=255)
    layer(c, shape(done(im, 240, 176), '#B58F52', 451, edge=1.4), (10, 140), pad=10)
    im, d, S = M(214, 152); d.rounded_rectangle((2 * S, 2 * S, 212 * S, 150 * S), radius=20 * S, fill=255)
    layer(c, shape(done(im, 214, 152), A['yellow'], 452, edge=1.4), (23, 150), pad=10)
    im, d, S = M(60, 84); d.ellipse((8 * S, 2 * S, 52 * S, 46 * S), fill=255); d.polygon([(22 * S, 34 * S), (38 * S, 34 * S), (44 * S, 82 * S), (16 * S, 82 * S)], fill=255)
    layer(c, shape(done(im, 60, 84), A['ink'], 453, edge=1.0), (100, 184), pad=6, off=(1, 2), blur=1.5)
    sh(c, name='lock', pad=30, off=(5, 9), blur=8, alpha=0.45)
    # 紙雲：淺藍底層（錯位）＋白色上層；圓弧一個一個疊，邊緣不齊
    def cloud_mask(w, h, k):
        im, d, S = M(w, h)
        for cx, cy, rr in ((0.2, 0.64, 0.15), (0.38, 0.50, 0.20), (0.6, 0.46, 0.22), (0.8, 0.62, 0.16), (0.5, 0.66, 0.2)):
            R = rr * w * k; d.ellipse(((cx * w - R) * S, (cy * h - R) * S, (cx * w + R) * S, (cy * h + R) * S), fill=255)
        d.rounded_rectangle((w * 0.1 * S, h * 0.55 * S, w * 0.9 * S, h * (0.55 + 0.33 * k) * S), radius=int(h * 0.16 * S), fill=255)
        return done(im, w, h)
    W, H = 520, 300; c = canvas(W + 30, H + 30)
    layer(c, shape(cloud_mask(W, H, 1.0), A['sky'], 460, edge=2.2), (26, 22), pad=0, off=(2, 4), blur=3, alpha=0.3)
    layer(c, shape(cloud_mask(W, H, 0.95), A['white'], 461, edge=2.2), (4, 2), pad=14, off=(3, 6), blur=5, alpha=0.3)
    sh(c, name='cloud', pad=40, off=(6, 12), blur=12, alpha=0.32)
    # 月亮（彎月，淡黃）與太陽（圓＋短紙條光芒）
    im, d, S = M(200, 200); d.ellipse((6 * S, 6 * S, 194 * S, 194 * S), fill=255); d.ellipse((64 * S, -14 * S, 236 * S, 158 * S), fill=0)
    sh(shape(done(im, 200, 200), '#F8E9B0', 470, edge=1.4), name='moon', pad=24, off=(3, 6), blur=6, alpha=0.5, color=(5, 10, 25))
    c = canvas(260, 260)
    for k in range(8):
        ry = sheet(34, 14, A['yellow'], 472 + k, cut=0.8); a = k * 45
        rr = ry.rotate(-a, resample=Image.BICUBIC, expand=True)
        c.alpha_composite(rr, (int(130 + 108 * np.cos(np.deg2rad(a)) - rr.width / 2), int(130 + 108 * np.sin(np.deg2rad(a)) - rr.height / 2)))
    im, d, S = M(170, 170); d.ellipse((3 * S, 3 * S, 167 * S, 167 * S), fill=255)
    layer(c, shape(done(im, 170, 170), A['yellow'], 471, edge=1.4), (45, 45), pad=10)
    im, d, S = M(118, 118); d.ellipse((3 * S, 3 * S, 115 * S, 115 * S), fill=255)
    layer(c, shape(done(im, 118, 118), '#F7CE6B', 480, edge=1.2), (71, 71), pad=6, off=(1, 2), blur=2, alpha=0.3)
    sh(c, name='sun', pad=24, off=(3, 6), blur=6, alpha=0.4)
    # 問號：字形剪紙（紅）＋白色襯底
    font = next((f for f in ('/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf', '/usr/share/fonts/opentype/inter/Inter-Bold.otf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf') if os.path.exists(f)), None)
    W, H = 260, 360; im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im)
    d.text((W / 2, H / 2), '?', font=ImageFont.truetype(font, 330), fill=255, anchor='mm')
    c = shape(im.filter(ImageFilter.MaxFilter(25)), A['white'], 490, edge=1.6); c.alpha_composite(shape(im, A['red'], 491, edge=1.0))
    sh(c, name='qmark', pad=30, off=(4, 8), blur=7, alpha=0.42)

# ---------- 拍立得（白框＋機房實拍照片；Pexels 325229 走道、1148820 機櫃特寫） ----------
def polaroids():
    # top＝裁掉來源上緣的比例（機櫃特寫上緣有一張看得出反字的線材標籤）；lift＝提亮（走道那張原圖偏暗，手機上看不出是機房）
    for name, src, top, lift in (('polaroid-aisle', 'aisle.jpg', 0, 1.0), ('polaroid-rack', 'rack-close.jpg', 0.12, 0)):
        im = Image.open(os.path.join(RAW, src)).convert('RGB')
        tw, th = 440, 330; r = tw / th
        if top: im = im.crop((0, int(im.height * top), im.width, im.height))
        w, h = im.size
        cw, ch = (int(h * r), h) if w / h > r else (w, int(w / r))
        ph = im.crop(((w - cw) // 2, (h - ch) // 2, (w - cw) // 2 + cw, (h - ch) // 2 + ch)).resize((tw, th), Image.LANCZOS)
        a = np.asarray(ph).astype(np.float32)
        if lift: a = 255 * (a / 255) ** 0.5 * 1.08; a = (a - 150) * 1.22 + 162   # 走道那張再提亮、拉對比（縮圖下原本偏灰悶）
        else: a = (a - 128) * 0.92 + 132
        a = np.clip(a, 0, 255); a = a * np.array([1.03, 1.0, 0.94], np.float32)   # 沖印感：對比略降、偏暖
        ph = Image.fromarray(film_grain(a, 500, 3).astype(np.uint8)).convert('RGBA')
        c = sheet(500, 470, A['white'], 501 if 'aisle' in name else 502, cut=1.2)
        c.alpha_composite(ph, (30, 30))
        ed = ImageDraw.Draw(c); ed.rectangle((29, 29, 30 + tw, 30 + th), outline=(210, 204, 190, 255), width=1)
        sh(c, name=name, pad=40, off=(6, 12), blur=11, alpha=0.45)
        meta[name]['caption'] = [30, 372, 440, 80]

# ====================== 通用紙片（每支新片都有；what-is-server 舊片不產生） ======================
COLORS = ('white', 'yellow', 'red', 'blue', 'mint', 'kraft', 'ink')
def col(c): return A[c] if c in A else c          # 色名（角色）或 #hex

def rounded(w, h, color, seed, radius, grain=6, edge=1.2):
    im, d, S = M(w, h); d.rounded_rectangle((2 * S, 2 * S, (w - 2) * S, (h - 2) * S), radius=radius * S, fill=255)
    return shape(done(im, w, h), color, seed, grain=grain, edge=edge)

def note(w, h, color, seed):
    """便利貼：剪刀邊，上緣一條背膠略深、下緣微微翹起（較暗）"""
    im = sheet(w, h, color, seed, cut=1.0, grain=5)
    a = np.asarray(im).astype(np.float32); y = np.arange(h, dtype=np.float32)[:, None]
    sh_ = -7 * (y < h * 0.13) - 20 * np.clip((y - h * 0.8) / (h * 0.2), 0, 1) ** 2
    a[:, :, :3] = np.clip(a[:, :, :3] + sh_[:, :, None], 0, 255)
    return Image.fromarray(a.astype(np.uint8), 'RGBA')

def generic():
    for i, c in enumerate(COLORS):
        if c != 'ink':
            sh(note(420, 420, A[c], 600 + i), name=f'note-{c}', pad=40, off=(5, 11), blur=10, alpha=0.36)      # 便條／便利貼
            sh(sheet(640, 400, A[c], 610 + i, cut=1.6, grain=6), name=f'card-{c}', pad=40, off=(5, 10), blur=10, alpha=0.4)   # 大數字、重點卡
        sh(sheet(640, 110, A[c], 620 + i, cut=1.6, grain=6), name=f'block-{c}', pad=24, off=(3, 7), blur=6, alpha=0.42)       # 堆疊方塊的一層
        sh(sheet(900, 76, A[c], 630 + i, cut=1.4, grain=6), name=f'bar-{c}', pad=20, off=(3, 6), blur=5, alpha=0.4)            # 橫的長條
        sh(sheet(76, 900, A[c], 640 + i, cut=1.4, grain=6), name=f'barv-{c}', pad=20, off=(3, 6), blur=5, alpha=0.4)           # 直的長條
        sh(sheet(240, 14, A[c], 650 + i, cut=0.8, grain=4), name=f'seg-{c}', pad=10, off=(1, 3), blur=2, alpha=0.35)           # 折線的一段
        im, d, S = M(34, 34); d.ellipse((2 * S, 2 * S, 32 * S, 32 * S), fill=255)
        nd = shape(done(im, 34, 34), A['white'], 660 + i, edge=0)
        im, d, S = M(34, 34); d.ellipse((7 * S, 7 * S, 27 * S, 27 * S), fill=255)
        nd.alpha_composite(shape(done(im, 34, 34), A[c] if c != 'white' else A['ink'], 670 + i, edge=0))
        sh(nd, name=f'node-{c}', pad=8, off=(1, 2), blur=2, alpha=0.4)                                                        # 折線的轉折點
        # 紙箭頭（朝右）：箭身＋箭頭一刀剪成
        w, h = 320, 130; im, d, S = M(w, h)
        d.polygon([(4 * S, 44 * S), (196 * S, 44 * S), (196 * S, 6 * S), (316 * S, 65 * S), (196 * S, 124 * S), (196 * S, 86 * S), (4 * S, 86 * S)], fill=255)
        sh(shape(done(im, w, h), A[c], 680 + i, edge=1.4), name=f'arrow-{c}', pad=24, off=(3, 7), blur=6, alpha=0.4)
    sh(sheet(900, 10, A['ink'], 690, cut=0.6, grain=4), name='rule', pad=8, off=(1, 2), blur=1.5, alpha=0.3)                   # 圖表基線
    sh(sheet(900, 10, A['white'], 691, cut=0.6, grain=4), name='rule-w', pad=8, off=(1, 2), blur=1.5, alpha=0.3)
    for n, c, s in (('y', A['yellow'], 692), ('r', A['red'], 693), ('w', A['white'], 694)):                                    # 虛線終點的小箭頭（朝右）
        im, d, S = M(64, 64); d.polygon([(6 * S, 6 * S), (60 * S, 32 * S), (6 * S, 58 * S)], fill=255)
        sh(shape(done(im, 64, 64), c, s, edge=1.0), name=f'arrowhead-{n}', pad=10, off=(1, 3), blur=2, alpha=0.35)
    for n, c, s in (('red', A['red'], 695), ('blue', A['blue'], 696), ('yellow', A['yellow'], 697)):                           # 圖釘
        im, d, S = M(56, 56); d.ellipse((3 * S, 3 * S, 53 * S, 53 * S), fill=255)
        pn = shape(done(im, 56, 56), c, s, grain=3, edge=0)
        im, d, S = M(56, 56); d.ellipse((14 * S, 11 * S, 32 * S, 29 * S), fill=255)
        hl = np.asarray(shape(done(im, 56, 56), A['white'], s + 20, grain=2, edge=0)).copy(); hl[:, :, 3] = (hl[:, :, 3] * 0.45).astype(np.uint8)
        pn.alpha_composite(Image.fromarray(hl, 'RGBA'))
        sh(pn, name=f'pin-{n}', pad=16, off=(4, 8), blur=5, alpha=0.5)
    for n, c, s in (('b', A['blue'], 698), ('w', A['white'], 699), ('k', A['kraft'], 700)):                                    # 多兩三種膠帶
        sh(tape(190, 56, c, s, 0.86), name=f'tape-{n}', pad=14, off=(1, 2), blur=2, alpha=0.22)

def phone_paper():
    """沒有手機實拍照片時的紙手機（深色圓角機身＋白色貼紙邊；螢幕由 PhoneMock 的 HTML 畫）"""
    W, H = 600, 1164; bw = 13
    body = rounded(W, H, A['ink'], 710, 56, grain=4, edge=0.6)
    im, d, S = M(W, H); d.rounded_rectangle((26 * S, 26 * S, (W - 26) * S, (H - 26) * S), radius=36 * S, fill=255)
    body.alpha_composite(shape(done(im, W, H), '#2E3338', 711, grain=3, edge=0))
    st = rounded(W + 2 * bw, H + 2 * bw, A['white'], 712, 56 + bw, grain=4, edge=1.6)
    st.alpha_composite(body, (bw, bw))
    save(shadow(st, pad=50, off=(7, 13), blur=13, alpha=0.38), 'phone', (50 + bw, 50 + bw, W, H))

def tone(a, kind, seed, lift=0):
    """照片調色（a＝RGB float）：warm 沖印暖調（desk）、cool 偏冷去飽和（blueprint）、news 黑白報紙（newsprint）、soft 柔和粉暖（notebook）、plain 幾乎不動（sticky）"""
    if lift: a = 255 * (a / 255) ** (1 / (1 + lift))
    l = (a @ np.array([0.299, 0.587, 0.114], np.float32))[:, :, None]
    if kind == 'news':
        g = np.clip((l - 128) * 1.18 + 132, 0, 255)
        a = g * (np.array(hexrgb(A['white']), np.float32) / 255)[None, None] * 0.97 + 6
        return film_grain(a, seed, 7)
    if kind == 'cool': a = (a * 0.62 + l * 0.38 - 128) * 1.04 + 128; a = a * np.array([0.95, 1.0, 1.06], np.float32)
    elif kind == 'soft': a = a * 0.88 + 26; a = a * np.array([1.04, 0.99, 0.96], np.float32)
    elif kind == 'plain': a = (a - 128) * 1.03 + 129
    else: a = (a - 128) * 0.92 + 132; a = a * np.array([1.03, 1.0, 0.94], np.float32)
    return film_grain(np.clip(a, 0, 255), seed, 3)

def fit(im, tw, th, focus=(0.5, 0.5)):
    w, h = im.size; r = tw / th
    cw, ch = (int(h * r), h) if w / h > r else (w, int(w / r))
    x = int((w - cw) * focus[0]); y = int((h - ch) * focus[1])
    return im.crop((x, y, x + cw, y + ch)).resize((tw, th), Image.LANCZOS)

SHAPES = dict(land=dict(pol=(440, 330), prt=(640, 440)), port=dict(pol=(380, 470), prt=(460, 620)), sq=dict(pol=(410, 410), prt=(520, 520)))
def photos():
    """out/<slug>/assets-raw/photos/ 裡每一張照片 → polaroid-<名>（拍立得，下方可寫字）、print-<名>（沖印照片，細白邊）；newsprint 另有 clip-<名>（撕下來的剪報）。
    檔名（不含副檔名）就是紙材名的後半；每張的裁切、形狀、調色可在 videos/<slug>/assets.json 的 photos 指定。"""
    files = sorted(f for f in glob.glob(os.path.join(RAW, '*')) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')))
    for f in files:
        stem = os.path.splitext(os.path.basename(f))[0]
        if LEGACY and stem in ('aisle', 'rack-close', 'kitchen', 'phone-desk'): continue
        if stem == 'phone-desk': continue                                   # 手機去背用的原圖，不做成照片
        c = CFG.get('photos', {}).get(stem, {})
        seed = zlib.crc32(stem.encode()) % 100000
        im = Image.open(f).convert('RGB')
        if c.get('crop'): l, t, r_, b = c['crop']; im = im.crop((int(im.width * l), int(im.height * t), int(im.width * r_), int(im.height * b)))
        for bx in c.get('blur', []):                                         # 要糊掉的區塊（人臉、商標、看得出字的招牌）：[左, 上, 右, 下]，都是 0–1 的比例
            box = (int(im.width * bx[0]), int(im.height * bx[1]), int(im.width * bx[2]), int(im.height * bx[3]))
            im.paste(im.crop(box).filter(ImageFilter.GaussianBlur(max(8, (box[2] - box[0]) // 8))), box[:2])
        ar = im.width / im.height
        shp = c.get('shape') or ('land' if ar > 1.15 else 'port' if ar < 0.87 else 'sq')
        kind = c.get('tone') or SK.get('photo', 'warm'); focus = c.get('focus', (0.5, 0.5))
        frames = c.get('frames') or (['polaroid', 'print'] + (['clip'] if kind == 'news' else []))
        def pic(tw, th): return Image.fromarray(tone(np.asarray(fit(im, tw, th, focus)).astype(np.float32), kind, seed, c.get('lift', 0)).astype(np.uint8)).convert('RGBA')
        if 'polaroid' in frames:
            tw, th = SHAPES[shp]['pol']
            s_ = sheet(tw + 60, th + 140, A['white'], seed + 1, cut=1.2); s_.alpha_composite(pic(tw, th), (30, 30))
            ImageDraw.Draw(s_).rectangle((29, 29, 30 + tw, 30 + th), outline=(0, 0, 0, 40), width=1)
            sh(s_, name=f'polaroid-{stem}', pad=40, off=(6, 12), blur=11, alpha=0.45)
            meta[f'polaroid-{stem}']['caption'] = [30, th + 42, tw, 80]
        if 'print' in frames:
            tw, th = SHAPES[shp]['prt']
            s_ = sheet(tw + 28, th + 28, A['white'], seed + 2, cut=1.2); s_.alpha_composite(pic(tw, th), (14, 14))
            sh(s_, name=f'print-{stem}', pad=40, off=(6, 12), blur=11, alpha=0.45)
        if 'clip' in frames:
            tw, th = SHAPES[shp]['pol']; tw, th = int(tw * 1.1), int(th * 1.1)
            s_ = sheet(tw + 48, th + 150, A['white'], seed + 3, torn='rb', tear=8); s_.alpha_composite(pic(tw, th), (24, 24))
            d = ImageDraw.Draw(s_); r = np.random.default_rng(seed + 4); g = hexrgb(A['ink'])
            for j in range(4):                                               # 假的內文（灰條，不寫字）
                d.line([(24, th + 48 + j * 22), (24 + int(tw * (0.96 if j < 3 else r.uniform(0.4, 0.7))), th + 48 + j * 22)], fill=g + (70,), width=7)
            sh(s_, name=f'clip-{stem}', pad=40, off=(6, 12), blur=11, alpha=0.45)
            meta[f'clip-{stem}']['caption'] = [24, th + 30, tw, 100]

def custom():
    """videos/<slug>/assets.json 的 papers：自訂尺寸的色紙（堆疊方塊的每一層、特別大的標題條…）。
    { "<名>": { "w": 520, "h": 90, "color": "blue"｜"#RRGGBB", "torn": "lr", "cut": 1.6, "radius": 12, "kind": "sheet"｜"note", "shadow": "s"｜"m"｜"l" } }"""
    SH = dict(s=dict(pad=20, off=(2, 5), blur=4, alpha=0.4), m=dict(pad=40, off=(5, 9), blur=9, alpha=0.4), l=dict(pad=60, off=(8, 16), blur=16, alpha=0.45))
    for name, c in CFG.get('papers', {}).items():
        seed = zlib.crc32(name.encode()) % 100000; w, h = int(c['w']), int(c['h']); color = col(c.get('color', 'white'))
        if c.get('radius'): im = rounded(w, h, color, seed, c['radius'])
        elif c.get('kind') == 'note': im = note(w, h, color, seed)
        else: im = sheet(w, h, color, seed, torn=c.get('torn', ''), cut=c.get('cut', 1.6), grain=c.get('grain', 6))
        sh(im, name=name, **SH[c.get('shadow', 'm' if min(w, h) > 120 else 's')])

if __name__ == '__main__':
    only = [a[7:].split(',') for a in sys.argv if a.startswith('--only=')]   # --only=phone,polaroids：只重做這幾組，其餘沿用現有 meta.json
    if only:
        meta.update(json.load(open(os.path.join(O, 'meta.json'))))
        for f in only[0]: globals()[f]()
    elif LEGACY:
        backgrounds(); papers(); phone(); rack(); pass_window(); small(); polaroids()
    else:
        backgrounds(); papers(); small(); generic()
        phone() if os.path.exists(os.path.join(RAW, 'phone-desk.jpg')) else phone_paper()
        photos(); custom()
    if not LEGACY: meta['_info'] = dict(w=0, h=0, body=[0, 0, 0, 0], skin=SKIN)
    json.dump(meta, open(os.path.join(O, 'meta.json'), 'w'), indent=1)
    print(f'✔ {len(meta)} 項 → public/v3/{SLUG}/（meta.json）')
