"""紙材與照片處理（Pillow＋numpy，固定 seed）。風格樣張用的一次性工具，不屬於正式管線。"""
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

def hexrgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def noise2d(w, h, seed, scale):
    r = np.random.default_rng(seed)
    sw, sh = max(2, int(w / scale) + 2), max(2, int(h / scale) + 2)
    small = Image.fromarray((r.random((sh, sw)) * 255).astype(np.uint8))
    return np.asarray(small.resize((w, h), Image.BICUBIC)).astype(np.float32) / 127.5 - 1

def noise1d(n, seed, scale):
    r = np.random.default_rng(seed)
    k = max(2, int(n / scale) + 3)
    pts = r.random(k) * 2 - 1
    x = np.linspace(0, k - 1.001, n)
    i = x.astype(int); t = x - i; t = t * t * (3 - 2 * t)
    return pts[i] * (1 - t) + pts[i + 1] * t

def paper_tex(w, h, color, seed, grain=7, blotch=5, fibers=True):
    """有紙紋的色紙（RGB float array）"""
    r = np.random.default_rng(seed)
    c = np.array(hexrgb(color) if isinstance(color, str) else color, np.float32)
    lum = r.normal(0, grain, (h, w)).astype(np.float32)
    lum = np.asarray(Image.fromarray(np.clip(lum + 128, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) - 128
    lum += blotch * noise2d(w, h, seed + 1, 90) + blotch * 0.6 * noise2d(w, h, seed + 2, 22)
    if fibers:
        fb = Image.new('L', (w, h), 128); d = ImageDraw.Draw(fb)
        for _ in range(int(w * h / 9000)):
            x, y = r.integers(0, w), r.integers(0, h); a = r.random() * np.pi; L = r.integers(8, 34)
            d.line([(x, y), (x + np.cos(a) * L, y + np.sin(a) * L)], fill=int(128 + r.choice([-1, 1]) * r.integers(10, 26)), width=1)
        lum += (np.asarray(fb.filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32) - 128) * 0.55
    return np.clip(c[None, None, :] + lum[:, :, None], 0, 255)

def edge_mask(w, h, seed, amp=(1.5, 1.5, 1.5, 1.5), scale=(60, 60, 60, 60), fine=0.0):
    """四邊不規則的遮罩（上右下左各自的振幅 px）。回傳 0..1 float"""
    S = 2; W, H = w * S, h * S
    X = np.arange(W)[None, :]; Y = np.arange(H)[:, None]
    def disp(n, i):
        a = amp[i] * S
        d = a * (0.5 + 0.5 * noise1d(n, seed + 10 * i, scale[i] * S))
        if fine: d = d + fine * S * (0.5 + 0.5 * noise1d(n, seed + 10 * i + 5, 5 * S)) * (amp[i] > 3)
        return d
    T = disp(W, 0)[None, :]; R = disp(H, 1)[:, None]; B = disp(W, 2)[None, :]; Lf = disp(H, 3)[:, None]
    m = (Y >= T) & (Y <= H - 1 - B) & (X >= Lf) & (X <= W - 1 - R)
    return np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((w, h), Image.LANCZOS)).astype(np.float32) / 255

def to_img(rgb, alpha):
    a = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), a]), 'RGBA')

def sheet(w, h, color, seed, torn='', cut=1.4, tear=9, core='#FFFDF7', grain=7):
    """一張紙。torn 傳 't','r','b','l' 的組合＝撕邊（露出白色紙芯），其餘是剪刀邊（微微不直）"""
    idx = {'t': 0, 'r': 1, 'b': 2, 'l': 3}
    amp = [cut] * 4; sc = [140] * 4
    for k in torn: amp[idx[k]] = tear; sc[idx[k]] = 26
    m = edge_mask(w, h, seed, amp, sc, fine=2.5)
    tex = paper_tex(w, h, color, seed, grain=grain)
    if torn:
        amp2 = [a + (7 if a > 3 else 0) for a in amp]
        inner = edge_mask(w, h, seed + 3, amp2, sc, fine=3.5)
        inner = np.minimum(inner, m)
        cz = paper_tex(w, h, core, seed + 7, grain=5, fibers=False)
        tex = tex * inner[:, :, None] + cz * (1 - inner[:, :, None])
    # 紙的厚度：左上亮、右下暗的細邊
    mi = Image.fromarray((m * 255).astype(np.uint8))
    sh = np.asarray(mi.transform(mi.size, Image.AFFINE, (1, 0, 1.5, 0, 1, 1.5))).astype(np.float32) / 255
    hl = np.asarray(mi.transform(mi.size, Image.AFFINE, (1, 0, -1.5, 0, 1, -1.5))).astype(np.float32) / 255
    tex = tex - 16 * np.clip(m - sh, 0, 1)[:, :, None] + 10 * np.clip(m - hl, 0, 1)[:, :, None]
    return to_img(tex, m)

def shadow(img, pad=40, off=(5, 9), blur=9, alpha=0.34, color=(40, 30, 15)):
    """把落影烤進 PNG。回傳圖比原圖四邊各多 pad"""
    w, h = img.size
    out = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    a = img.split()[3]
    sh = Image.new('L', out.size, 0); sh.paste(a, (pad + off[0], pad + off[1]))
    sh = sh.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * alpha))
    # 貼近紙邊的一圈較深的接觸陰影
    sh2 = Image.new('L', out.size, 0); sh2.paste(a, (pad + 1, pad + 2))
    sh2 = sh2.filter(ImageFilter.GaussianBlur(2)).point(lambda v: int(v * alpha * 0.7))
    out.paste(Image.new('RGBA', out.size, color + (0,)), (0, 0))
    out.putalpha(Image.fromarray(np.maximum(np.asarray(sh), np.asarray(sh2))))
    out.alpha_composite(img, (pad, pad))
    return out

def paste(base, img, xy, angle=0):
    """把一張 RGBA 貼到 base 上（可旋轉）"""
    if angle: img = img.rotate(angle, resample=Image.BICUBIC, expand=True)
    base.alpha_composite(img, (int(xy[0]), int(xy[1])))

def tape(w, h, color, seed, alpha=0.8):
    tex = paper_tex(w, h, color, seed, grain=5, blotch=3, fibers=False)
    y = np.arange(h)[:, None]
    tex += 5 * np.sin(y / 2.2)[:, :, None]
    m = np.ones((h, w), np.float32)
    r = np.random.default_rng(seed)
    X = np.arange(w)[None, :]; Y = np.arange(h)[:, None]
    tooth = 7
    zz = np.abs(((Y + r.integers(0, tooth)) % (2 * tooth)) - tooth) * 0.9
    m = ((X >= zz) & (X <= w - 1 - zz[::-1])).astype(np.float32)
    return to_img(tex, m * alpha)

def marker(w, h, color, seed, alpha=0.92):
    """麥克筆／螢光筆一筆：上下緣不平、筆頭略圓、有橫向筆觸"""
    m = edge_mask(w, h, seed, (h * 0.13, 10, h * 0.13, 10), (45, 12, 45, 12))
    tex = paper_tex(w, h, color, seed, grain=3, blotch=3, fibers=False)
    streak = noise1d(h, seed + 9, 3)[:, None] * 0.08 + noise2d(w, h, seed + 4, 60) * 0.06
    return to_img(tex, m * np.clip(alpha + streak, 0, 1))

def duotone(im, dark, light, gamma=1.0, keep=0.0, contrast=1.0):
    """照片轉雙色調（暗部 dark、亮部 light）；keep＝保留多少原色"""
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    l = (a @ np.array([0.299, 0.587, 0.114], np.float32)) / 255
    l = np.clip((l - 0.5) * contrast + 0.5, 0, 1) ** gamma
    d = np.array(hexrgb(dark), np.float32); li = np.array(hexrgb(light), np.float32)
    out = d[None, None] + (li - d)[None, None] * l[:, :, None]
    out = out * (1 - keep) + a * keep
    return np.clip(out, 0, 255)

def film_grain(arr, seed, s=6):
    r = np.random.default_rng(seed)
    return np.clip(arr + r.normal(0, s, arr.shape[:2])[:, :, None], 0, 255)

def homography(dst, src):
    """PIL PERSPECTIVE 係數：輸出座標 dst[i] 對到來源座標 src[i]"""
    A = []; b = []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    return tuple(np.linalg.solve(np.array(A, float), np.array(b, float)))
