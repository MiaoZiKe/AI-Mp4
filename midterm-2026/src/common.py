"""Shared engine: camera, anti-aliased polygon rasteriser, text, easing, data-viz helpers."""
import math, colorsys
from functools import lru_cache
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
FONT_DIR = ROOT / "assets" / "fonts"
FONTS = {
    "sans": FONT_DIR / "NotoSansTC-Bold.ttf",
    "sans_m": FONT_DIR / "NotoSansTC-Medium.ttf",
    "sans_k": FONT_DIR / "NotoSansTC-Black.ttf",
    "serif": FONT_DIR / "NotoSerifTC-Bold.ttf",
    "serif_k": FONT_DIR / "NotoSerifTC-Black.ttf",
}
W, H = 1080, 1920
SUB_TOP, SUB_BOTTOM = 1452, 1652          # subtitle box: inside bottom quarter, ≥260 px above bottom edge
SUB_LEFT, SUB_RIGHT = 64, W - 64


# ───────────────────────── maths / easing ─────────────────────────
def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x

def ease(x):                      # ease-in-out (cubic)
    x = clamp(x)
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2

def ease_out(x):
    x = clamp(x); return 1 - (1 - x) ** 3

def ease_back(x):
    x = clamp(x); c = 1.70158; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

def prog(t, a, b):                # eased progress of t through [a,b]
    return ease((t - a) / max(1e-6, b - a))

def lerp(a, b, k):
    return a + (b - a) * k

def hex2rgb(h):
    h = h.lstrip("#"); return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32)

def hls(c):
    return colorsys.rgb_to_hls(*[float(v) for v in c])

def party_pair(hue_r, hue_b, light, sat):
    """Red & blue with identical HLS lightness and saturation -> equal visual weight."""
    r = np.array(colorsys.hls_to_rgb(hue_r / 360, light, sat), np.float32)
    b = np.array(colorsys.hls_to_rgb(hue_b / 360, light, sat), np.float32)
    return r, b


# ───────────────────────── camera ─────────────────────────
class Cam:
    """world (1080×1920 design space) -> screen. z = zoom about (fx,fy); px,py = pan."""
    def __init__(self, z=1.0, px=0.0, py=0.0, fx=540, fy=960, rot=0.0):
        self.z, self.px, self.py, self.fx, self.fy, self.rot = z, px, py, fx, fy, rot
    def __call__(self, pts):
        p = np.asarray(pts, np.float32).reshape(-1, 2)
        x = (p[:, 0] - self.fx) * self.z
        y = (p[:, 1] - self.fy) * self.z
        if self.rot:
            c, s = math.cos(self.rot), math.sin(self.rot)
            x, y = x * c - y * s, x * s + y * c
        return np.stack([x + self.fx + self.px, y + self.fy + self.py], 1)
    def s(self, v):
        return v * self.z

IDENT = Cam()

def camera_move(t, dur, kind="push", amt=0.06, seed=0):
    """Gentle ease-in-out push-in or pan across the whole segment (never static)."""
    k = ease(t / dur)
    wob = 0.004 * math.sin(t * 1.3 + seed)
    if kind == "push":
        return Cam(z=1.0 + amt * k + wob, py=-12 * k)
    if kind == "pull":
        return Cam(z=1.0 + amt * (1 - k) + wob)
    if kind == "panl":
        return Cam(z=1.04 + wob, px=lerp(30, -30, k))
    if kind == "panr":
        return Cam(z=1.04 + wob, px=lerp(-30, 30, k))
    if kind == "rise":
        return Cam(z=1.03 + 0.03 * k, py=lerp(24, -24, k))
    return Cam()


# ───────────────────────── raster primitives ─────────────────────────
def poly_mask(pts, ss=3, pad=2):
    """Anti-aliased polygon coverage mask. Returns (mask float32, x0, y0) or None."""
    p = np.asarray(pts, np.float32)
    x0 = int(math.floor(p[:, 0].min())) - pad; y0 = int(math.floor(p[:, 1].min())) - pad
    x1 = int(math.ceil(p[:, 0].max())) + pad; y1 = int(math.ceil(p[:, 1].max())) + pad
    if x1 < 0 or y1 < 0 or x0 > W + 400 or y0 > H + 400 or x1 - x0 < 1 or y1 - y0 < 1:
        return None
    w, h = x1 - x0, y1 - y0
    if w * h > 6_000_000:
        ss = 1
    im = Image.new("L", (w * ss, h * ss), 0)
    q = ((p - [x0, y0]) * ss).ravel().tolist()
    ImageDraw.Draw(im).polygon(q, fill=255)
    if ss > 1:
        im = im.resize((w, h), Image.BOX)
    return np.asarray(im, np.float32) / 255.0, x0, y0

def stroke_mask(pts, width, closed=False, ss=3):
    p = np.asarray(pts, np.float32)
    pad = int(width) + 3
    x0 = int(math.floor(p[:, 0].min())) - pad; y0 = int(math.floor(p[:, 1].min())) - pad
    x1 = int(math.ceil(p[:, 0].max())) + pad; y1 = int(math.ceil(p[:, 1].max())) + pad
    w, h = max(1, x1 - x0), max(1, y1 - y0)
    if w * h > 6_000_000:
        ss = 1
    im = Image.new("L", (w * ss, h * ss), 0)
    q = ((p - [x0, y0]) * ss)
    if closed:
        q = np.vstack([q, q[:1]])
    d = ImageDraw.Draw(im)
    d.line(q.ravel().tolist(), fill=255, width=max(1, int(round(width * ss))), joint="curve")
    r = width * ss / 2
    for (a, b) in (q[0], q[-1]):
        d.ellipse([a - r, b - r, a + r, b + r], fill=255)
    if ss > 1:
        im = im.resize((w, h), Image.BOX)
    return np.asarray(im, np.float32) / 255.0, x0, y0

def comp(dst, m, color, alpha=1.0):
    """Composite colour through coverage mask m=(mask,x0,y0) into dst (H×W×C or H×W)."""
    if m is None:
        return
    mask, x0, y0 = m
    hh, ww = dst.shape[:2]
    mh, mw = mask.shape
    ax0, ay0 = max(0, x0), max(0, y0)
    ax1, ay1 = min(ww, x0 + mw), min(hh, y0 + mh)
    if ax1 <= ax0 or ay1 <= ay0:
        return
    a = mask[ay0 - y0:ay1 - y0, ax0 - x0:ax1 - x0] * alpha
    reg = dst[ay0:ay1, ax0:ax1]
    if dst.ndim == 3:
        a = a[..., None]
        reg *= (1 - a); reg += a * np.asarray(color, np.float32)
    else:
        reg *= (1 - a); reg += a * float(color)

def paste_mask(dst_mask, m, mode="max"):
    if m is None:
        return
    mask, x0, y0 = m
    hh, ww = dst_mask.shape
    mh, mw = mask.shape
    ax0, ay0 = max(0, x0), max(0, y0)
    ax1, ay1 = min(ww, x0 + mw), min(hh, y0 + mh)
    if ax1 <= ax0 or ay1 <= ay0:
        return
    sub = mask[ay0 - y0:ay1 - y0, ax0 - x0:ax1 - x0]
    if mode == "max":
        np.maximum(dst_mask[ay0:ay1, ax0:ax1], sub, out=dst_mask[ay0:ay1, ax0:ax1])
    else:
        dst_mask[ay0:ay1, ax0:ax1] *= (1 - sub)

def ellipse_pts(cx, cy, rx, ry, ang=0.0, n=48, wobble=0.0, freq=0, phase=0.0):
    th = np.linspace(0, 2 * np.pi, n, endpoint=False)
    r = 1 + wobble * np.sin(freq * th + phase)
    x = np.cos(th) * rx * r; y = np.sin(th) * ry * r
    c, s = math.cos(ang), math.sin(ang)
    return np.stack([cx + x * c - y * s, cy + x * s + y * c], 1)

def rect_pts(x0, y0, x1, y1):
    return np.array([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], np.float32)

def rrect_pts(x0, y0, x1, y1, r, n=8):
    r = min(r, (x1 - x0) / 2, (y1 - y0) / 2)
    pts = []
    for cx, cy, a0 in ((x1 - r, y0 + r, -90), (x1 - r, y1 - r, 0), (x0 + r, y1 - r, 90), (x0 + r, y0 + r, 180)):
        for k in range(n + 1):
            a = math.radians(a0 + 90 * k / n)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return np.array(pts, np.float32)

def fill(arr, color):
    arr[:] = np.asarray(color, np.float32)


# ───────────────────────── text ─────────────────────────
@lru_cache(maxsize=256)
def font(name, size):
    return ImageFont.truetype(str(FONTS[name]), int(size))

@lru_cache(maxsize=1024)
def _text_img(text, name, size, stroke, spacing):
    f = font(name, size)
    lines = text.split("\n")
    bbs = [f.getbbox(l or " ", stroke_width=stroke) for l in lines]
    lh = int(size * (1.0 + spacing))
    w = max(b[2] - min(0, b[0]) for b in bbs) + 2 * stroke + 4
    h = lh * (len(lines) - 1) + (bbs[-1][3]) + 2 * stroke + 4
    im = Image.new("L", (w, h), 0); d = ImageDraw.Draw(im)
    fill_im = Image.new("L", (w, h), 0); df = ImageDraw.Draw(fill_im)
    for i, l in enumerate(lines):
        lw = bbs[i][2] - bbs[i][0]
        x = (w - lw) / 2 - bbs[i][0]
        if stroke:
            d.text((x, i * lh + stroke), l, font=f, fill=255, stroke_width=stroke, stroke_fill=255)
        df.text((x, i * lh + stroke), l, font=f, fill=255)
    return (np.asarray(fill_im, np.float32) / 255.0, (np.asarray(im, np.float32) / 255.0 if stroke else None))

def text_masks(text, x, y, size, name="sans", anchor="mm", stroke=0, spacing=0.25, cam=None):
    """Returns (fill_mask, stroke_mask_or_None) as comp-able tuples, positioned in screen space."""
    if cam is not None:
        (x, y), = cam([(x, y)]); size = cam.s(size); stroke = int(round(cam.s(stroke)))
    size = max(6, int(round(size)))
    f, s = _text_img(text, name, size, stroke, spacing)
    h, w = f.shape
    ax = {"l": 0, "m": 0.5, "r": 1}[anchor[0]]; ay = {"t": 0, "m": 0.5, "b": 1}[anchor[1]]
    x0 = int(round(x - w * ax)); y0 = int(round(y - h * ay))
    return (f, x0, y0), ((s, x0, y0) if s is not None else None)

def draw_text(dst, text, x, y, size, color, name="sans", anchor="mm", stroke=0, stroke_color=(0, 0, 0),
              alpha=1.0, spacing=0.25, cam=None):
    fm, sm = text_masks(text, x, y, size, name, anchor, stroke, spacing, cam)
    if sm is not None:
        comp(dst, sm, stroke_color, alpha)
    comp(dst, fm, color, alpha)
    return fm

def text_size(text, size, name="sans", spacing=0.25):
    f, _ = _text_img(text, name, int(size), 0, spacing)
    return f.shape[1], f.shape[0]


# ───────────────────────── data-viz helpers ─────────────────────────
def hemicycle(n, cx, cy, r0, r1, rows):
    """Parliament layout; returns positions ordered left->right (by angle) and dot radius."""
    radii = np.linspace(r0, r1, rows)
    tot_len = sum(np.pi * r for r in radii)
    counts = [int(round(n * np.pi * r / tot_len)) for r in radii]
    counts[-1] += n - sum(counts)
    pts = []
    for r, c in zip(radii, counts):
        for k in range(c):
            a = np.pi * (1 - (k + 0.5) / c) if c > 1 else np.pi / 2
            pts.append((a, cx + r * math.cos(a), cy - r * math.sin(a)))
    pts.sort(key=lambda p: -p[0])
    dot = (r1 - r0) / max(1, rows - 1) * 0.42 if rows > 1 else 10
    return np.array([[p[1], p[2]] for p in pts], np.float32), dot

def seat_colors(n_d, n_r, n_total):
    """Index list: 'd' from the left, 'r' from the right, 'u' (計票中) in the middle."""
    return ["d"] * n_d + ["u"] * (n_total - n_d - n_r) + ["r"] * n_r

def seat_fill_state(i, n_d, n_r, n_total, k):
    """k in [0,1] animation progress; both parties fill at the same pace from their sides."""
    lab = seat_colors(n_d, n_r, n_total)[i]
    if lab == "d":
        return lab, clamp(k * max(n_d, n_r) - i)        # i-th D seat
    if lab == "r":
        j = n_total - 1 - i
        return lab, clamp(k * max(n_d, n_r) - j)
    return lab, clamp((k - 0.85) / 0.15)

def countup(v, k):
    return int(round(v * ease_out(k)))


# ───────────────────────── image utilities ─────────────────────────
def to_u8(a):
    return (np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)

def from_pil(im):
    return np.asarray(im, np.float32) / 255.0

def gblur(a, r):
    """Gaussian blur of float array (H×W or H×W×3) via PIL (fast C)."""
    if a.ndim == 2:
        im = Image.fromarray(to_u8(a), "L")
        return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), np.float32) / 255.0
    im = Image.fromarray(to_u8(a), "RGB")
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), np.float32) / 255.0

def gblur_f(a, r, down=4):
    """Blur at reduced resolution (for big radii) keeping float precision via 16-bit trick."""
    h, w = a.shape[:2]
    small = Image.fromarray(to_u8(a)).resize((w // down, h // down), Image.BILINEAR)
    small = small.filter(ImageFilter.GaussianBlur(r / down))
    return np.asarray(small.resize((w, h), Image.BILINEAR), np.float32) / 255.0

def value_noise(h, w, cell, seed=0, octaves=3):
    """Smooth fractal value noise in [0,1] (numpy, bilinear-upsampled random grids)."""
    rng = np.random.default_rng(seed)
    out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for o in range(octaves):
        c = max(2, int(cell / (2 ** o)))
        gh, gw = h // c + 2, w // c + 2
        g = rng.random((gh, gw)).astype(np.float32)
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((gw * c, gh * c), Image.BICUBIC)
        out += amp * np.asarray(im, np.float32)[:h, :w] / 255.0
        tot += amp; amp *= 0.5
    return out / tot

@lru_cache(maxsize=16)
def cached_noise(h, w, cell, seed, octaves=3):
    return value_noise(h, w, cell, seed, octaves)

def vignette(h=H, w=W, strength=0.5, radius=0.75):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / math.sqrt(2)
    return 1 - strength * np.clip((d - radius * 0.5) / (1 - radius * 0.5), 0, 1) ** 2

@lru_cache(maxsize=4)
def cached_vignette(strength, radius):
    return vignette(H, W, strength, radius)

@lru_cache(maxsize=2)
def grid_xy():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    return xx, yy


# ───────────────────────── context ─────────────────────────
class Ctx:
    def __init__(self, seg, t, frame, tl):
        self.seg, self.t, self.frame, self.tl = seg, t, frame, tl
        self.dur = seg["duration"]
        self.k = t / self.dur
        self.rng = np.random.default_rng(frame * 7919 + 13)
        # subtitle visibility exactly from narration onset to narration end (frame accurate)
        gf = seg["start_frame"] + int(round(t * tl["fps"]))
        self.sub_alpha = 1.0 if seg["sub_start_frame"] <= gf < seg["sub_end_frame"] else 0.0
        self.global_frame = gf


