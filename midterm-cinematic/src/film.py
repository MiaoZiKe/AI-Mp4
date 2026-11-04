"""Procedural renderer for the film.  Everything on screen is generated here
from numpy noise, signed-distance shapes and vector paths — no external images.

Coordinate system: "stage" = 1920x804 design space.  A camera (zoom Z about
screen centre + pan) is applied per depth d (0 = infinitely far, 1 = foreground)
which gives parallax.
"""
import json, math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scipy.ndimage import gaussian_filter, zoom as ndzoom, binary_dilation

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, FPS = 1920, 804, 24
CX, CY = W / 2, H / 2
TL = json.load(open(os.path.join(ROOT, "timeline.json"), encoding="utf-8"))
FONT_B = os.path.join(ROOT, "assets/fonts/NotoSerifTC-Bold.otf")
FONT_R = os.path.join(ROOT, "assets/fonts/NotoSerifTC-Regular.otf")


def hexc(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255.0


# palette (from the brief)
C_NIGHT0, C_NIGHT1, C_NIGHT2 = hexc("#1A1838"), hexc("#3B3470"), hexc("#6E63B0")
C_CLOUD_LIT, C_GOLD = hexc("#B9B2E6"), hexc("#F2C46B")
C_RED, C_BLUE = hexc("#B5564F"), hexc("#4F6FB0")
C_CREAM = hexc("#F4EEDF")


def lum(c):
    return float(0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2])


# equalise luminance of the two party-symbol clouds (fairness)
_LT = (lum(C_RED) + lum(C_BLUE)) / 2
C_RED_EQ, C_BLUE_EQ = C_RED * _LT / lum(C_RED), C_BLUE * _LT / lum(C_BLUE)


# ----------------------------------------------------------------- easing ---
def clamp01(x):
    return np.clip(x, 0.0, 1.0)


def smooth(x):
    x = clamp01(x)
    return x * x * (3 - 2 * x)


def ease(x):  # smootherstep, ease-in-out
    x = clamp01(x)
    return x * x * x * (x * (x * 6 - 15) + 10)


def ramp(t, a, b):
    return float(smooth((t - a) / (b - a)))


def window(t, a, b, fi=0.5, fo=0.5):
    return ramp(t, a, a + fi) * (1 - ramp(t, b - fo, b))


def lerp(a, b, k):
    return a + (b - a) * k


def hermite_track(keys, t):
    """keys: list of (t, v0, v1, ...). Cubic Hermite with Catmull-Rom tangents,
    zero tangents at ends (ease-in / ease-out)."""
    ts = np.array([k[0] for k in keys]); vs = np.array([k[1:] for k in keys], float)
    if t <= ts[0]:
        return vs[0]
    if t >= ts[-1]:
        return vs[-1]
    i = int(np.searchsorted(ts, t) - 1)
    n = len(ts)

    def tan(j):
        if j == 0 or j == n - 1:
            return np.zeros(vs.shape[1])
        return (vs[j + 1] - vs[j - 1]) / (ts[j + 1] - ts[j - 1])

    h = ts[i + 1] - ts[i]; u = (t - ts[i]) / h
    h00 = 2 * u ** 3 - 3 * u ** 2 + 1; h10 = u ** 3 - 2 * u ** 2 + u
    h01 = -2 * u ** 3 + 3 * u ** 2; h11 = u ** 3 - u ** 2
    return h00 * vs[i] + h10 * h * tan(i) + h01 * vs[i + 1] + h11 * h * tan(i + 1)


# ------------------------------------------------------------ timeline ----
# Shot groups (continuous camera inside a group, cross-dissolve between groups)
#  A: scenes 1-3 (0-32.6)  B: scene 4 flight  C: scene 5 island  D: scene 6 sunrise
DISSOLVES = [("A", "B", 31.85, 32.65), ("B", "C", 45.55, 46.45), ("C", "D", 57.65, 58.45)]

CAM = {
    "A": [(0.0, 1.00, 0, 70), (8.0, 1.015, 0, 0), (14.0, 1.045, 0, -12), (19.5, 1.09, 12, -36),
          (26.0, 1.27, 52, -150), (33.0, 1.34, 62, -190)],
    "B": [(31.5, 1.08, -30, 25), (38.0, 1.03, 0, 0), (46.5, 1.07, 30, -20)],
    "C": [(45.5, 1.00, 0, 18), (52.0, 1.06, -10, 0), (58.5, 1.13, -25, -18)],
    "D": [(57.5, 1.14, 60, -30), (66.0, 1.00, 0, 0)],
}


def camera(g, t):
    z, px, py = hermite_track(CAM[g], t)
    return float(z), float(px), float(py)


def cam_xf(cam, d):
    """returns (zl, ox, oy) so that screen = C + (stage - C)*zl + (ox, oy)"""
    z, px, py = cam
    return 1 + (z - 1) * d, px * d, py * d


def to_screen(cam, d, x, y):
    zl, ox, oy = cam_xf(cam, d)
    return CX + (x - CX) * zl + ox, CY + (y - CY) * zl + oy, zl


def dawn(t, g):
    if g in ("A", "B"):
        return 0.22 * ramp(t, 41.0, 46.5)
    return lerp(0.30, 0.72, ramp(t, 45.5, 57.5)) + 0.28 * ramp(t, 57.5, 64.0)


def flight_speed(t):
    """multiplier of cloud scroll speed (travel)."""
    return 1 + 5.0 * ramp(t, 31.0, 33.5) - 3.6 * ramp(t, 43.0, 47.0)


_SCROLL = None


def scroll_s(t):
    """integral of flight_speed (seconds of 'base travel'), precomputed table."""
    global _SCROLL
    if _SCROLL is None:
        ts = np.arange(0, 67, 1 / 240.0)
        sp = np.array([flight_speed(x) for x in ts])
        _SCROLL = (ts, np.concatenate([[0], np.cumsum(sp[:-1]) / 240.0]))
    return float(np.interp(t, *_SCROLL))


# crane & balance animation shared with audio.py
CRANE_FLAP_HZ = {"fly": 1.55, "glide": 0.9}


def balance_angle(t):
    t0 = 25.3
    if t < t0:
        return math.radians(11.0)
    k = t - t0
    return math.radians(11.0) * math.exp(-k / 1.55) * math.cos(2 * math.pi * k / 1.9)


def balance_click_times():
    t0 = 25.3; out = []
    for k in range(1, 12):
        tt = t0 + k * 0.95
        if 11.0 * math.exp(-(tt - t0) / 1.55) > 0.8 and tt < 31.8:
            out.append(round(tt, 3))
    return out


def icon_cues():
    return [c for c in TL["cues"] if c.get("icon")]


CHIP_SITES = [(121.56, 25.04), (121.20, 24.95), (120.97, 24.80), (120.68, 24.15),
              (120.45, 23.48), (120.27, 23.10), (120.31, 22.63)]


def chip_times():
    return [47.3 + i * 0.62 for i in range(len(CHIP_SITES))]


def crane_wing_state(t, mode):
    """(theta1, theta2) wing joint angles in radians."""
    if mode == "fold":
        return 0.62 + 0.04 * math.sin(t * 2.0), 0.12
    if mode == "spread":
        return 0.95 + 0.06 * math.sin(t * 2.3), 0.25 + 0.05 * math.sin(t * 2.3 - 0.7)
    hz = CRANE_FLAP_HZ[mode]
    amp = 0.95 if mode == "fly" else 0.45
    ph = 2 * math.pi * hz * t
    return 0.38 + amp * 0.8 * math.sin(ph), 0.35 * math.sin(ph - 0.9)


# ------------------------------------------------------------ noise ------
def fbm(h, w, rng, beta=2.4, fmin=1 / 500.0, fmax=0.5):
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.rfftfreq(w)[None, :]
    f = np.sqrt(fx * fx + fy * fy)
    amp = np.where((f >= fmin) & (f <= fmax), np.maximum(f, 1e-9) ** (-beta / 2), 0)
    ph = rng.normal(size=amp.shape) + 1j * rng.normal(size=amp.shape)
    n = np.fft.irfft2(amp * ph, s=(h, w))
    n -= n.mean(); n /= n.std() + 1e-9
    return n.astype(np.float32)


def fbm1d(w, rng, beta=2.2, fmin=1 / 900.0):
    f = np.fft.rfftfreq(w)
    amp = np.where(f >= fmin, np.maximum(f, 1e-9) ** (-beta / 2), 0)
    n = np.fft.irfft(amp * (rng.normal(size=f.shape) + 1j * rng.normal(size=f.shape)), n=w)
    n -= n.mean(); n /= n.std() + 1e-9
    return n.astype(np.float32)


def shift(a, dx, dy):
    """periodic in x, clamped in y"""
    out = np.roll(a, -dx, axis=1)
    if dy < 0:
        out = np.concatenate([np.repeat(out[:1], -dy, 0), out[:dy]], 0)
    elif dy > 0:
        out = np.concatenate([out[dy:], np.repeat(out[-1:], dy, 0)], 0)
    return out


# ------------------------------------------------------------ assets -----
A = {}
STRIP_W = 2560
LAYERS = [  # name, seed, top_pad, height, feature scale, blur, fog, depth, base speed px/s
    dict(seed=11, pad=120, h=560, sc=0.55, blur=2.2, fog=0.66, d=0.22, v=5.0),
    dict(seed=23, pad=120, h=520, sc=0.75, blur=1.2, fog=0.45, d=0.42, v=9.0),
    dict(seed=37, pad=120, h=460, sc=1.00, blur=0.6, fog=0.16, d=0.68, v=15.0),
    dict(seed=51, pad=130, h=420, sc=1.35, blur=0.0, fog=0.00, d=1.00, v=24.0),
]
# layer cloud-top y (stage) per world
TOPS = {"A": [432, 480, 556, 655], "B": [None, None, 660, 735]}


def build_moon():
    S = 720; r = 66
    y, x = np.mgrid[0:S, 0:S].astype(np.float32) - S / 2
    rr = np.sqrt(x * x + y * y)
    rng = np.random.default_rng(5)
    tex = gaussian_filter(fbm(256, 256, rng, beta=3.0, fmin=1 / 200.0), 2)
    tex = ndzoom(tex, (2 * r + 4) / 256, order=1)
    T = np.zeros((S, S), np.float32)
    o = S // 2 - r - 2; T[o:o + tex.shape[0], o:o + tex.shape[1]] = tex[:S - o, :S - o]
    disk = clamp01(r + 0.5 - rr)
    nz = np.sqrt(clamp01(1 - (rr / r) ** 2))
    shade = (0.78 + 0.22 * nz) * (1 - 0.10 * smooth((T + 0.3) / 1.2))
    moon_rgb = np.array([0.99, 0.96, 0.88], np.float32) * shade[..., None]
    halo = (0.55 * np.exp(-np.maximum(rr - r, 0) / 26) + 0.30 * np.exp(-np.maximum(rr - r, 0) / 110)
            + 0.12 * np.exp(-np.maximum(rr - r, 0) / 300)) * (rr > r - 2)
    halo = halo * clamp01((S / 2 - 8 - rr) / 120)
    halo_rgb = halo[..., None] * np.array([0.72, 0.68, 0.98], np.float32)
    return dict(disk=disk, rgb=moon_rgb, halo=halo_rgb.astype(np.float32), S=S)


def build_stars():
    rng = np.random.default_rng(7)
    n = 1500
    x = rng.uniform(-260, W + 260, n); y = rng.uniform(-200, 640, n) ** 1.0
    y = -200 + (rng.uniform(0, 1, n) ** 1.35) * 840
    b = 0.22 + 1.25 * rng.uniform(0, 1, n) ** 2.4
    big = rng.uniform(0, 1, n) < 0.06
    b[big] *= 1.6
    f = rng.uniform(0.15, 1.6, n); ph = rng.uniform(0, 2 * np.pi, n)
    col = np.stack([np.full(n, 0.92), np.full(n, 0.92), np.full(n, 1.0)], 1)
    warm = rng.uniform(0, 1, n) < 0.18; col[warm] = [1.0, 0.92, 0.78]
    blue = rng.uniform(0, 1, n) < 0.25; col[blue] = [0.78, 0.84, 1.0]
    return dict(x=x, y=y, b=b, big=big, f=f, ph=ph, col=col.astype(np.float32))


TAIWAN = [(121.52, 25.30), (121.60, 25.27), (121.75, 25.15), (121.93, 25.03), (121.83, 24.85),
          (121.85, 24.58), (121.73, 24.30), (121.62, 24.00), (121.48, 23.60), (121.37, 23.15),
          (121.18, 22.78), (120.95, 22.45), (120.86, 22.10), (120.84, 21.90), (120.72, 21.95),
          (120.70, 22.15), (120.60, 22.33), (120.43, 22.50), (120.28, 22.60), (120.20, 22.85),
          (120.10, 23.05), (120.13, 23.35), (120.16, 23.60), (120.27, 23.90), (120.43, 24.20),
          (120.60, 24.42), (120.80, 24.65), (120.95, 24.85), (121.05, 25.03), (121.27, 25.12),
          (121.42, 25.20)]


def tw_xy(lon, lat, k=150.0, squash=0.56):
    return ((lon - 120.98) * k * math.cos(math.radians(23.7)), -(lat - 23.6) * k * squash)


def build_textures():
    rng = np.random.default_rng(17)
    A["dust"] = dict(x=rng.uniform(-400, W + 2400, 420), y=rng.uniform(-50, H + 50, 420),
                     d=rng.uniform(0.3, 1.0, 420), ph=rng.uniform(0, 6.3, 420))


def build_nebula():
    """large fBm colour field (purple/indigo) for the sky, 3 channels, tiled x."""
    rng = np.random.default_rng(23)
    h, w = 640, 2048
    n1 = fbm(h, w, rng, beta=3.0, fmin=1 / 700.0); n2 = fbm(h, w, rng, beta=2.4, fmin=1 / 300.0)
    dens = clamp01(0.5 * n1 + 0.25 * n2 - 0.1) ** 1.6
    hue = smooth((n2 + 1.2) / 2.4)[..., None]
    col = (C_NIGHT2 * (1 - hue) + np.array([0.32, 0.42, 0.78], np.float32) * hue) * dens[..., None] * 0.55
    out = []
    for c in range(3):
        out.append(Image.fromarray(np.ascontiguousarray(np.tile(col[..., c].astype(np.float32), (1, 3))), "F"))
    return out


def build_all():
    if A:
        return A
    A["moon"] = build_moon(); A["stars"] = build_stars(); build_textures()
    A["nebula"] = build_nebula()
    A["icons"] = {k: build_icon(k) for k in ("tax", "container", "chip", "kline")}
    A["font_cap"] = ImageFont.truetype(FONT_B, 46)
    A["cap_cache"] = {}
    return A


# ------------------------------------------------------------ blitting ---
def blit_over(dst, rgb, a, x, y):
    """straight-alpha composite of (h,w,3)/(h,w) at top-left (x,y)."""
    h, w = a.shape
    x, y = int(round(x)), int(round(y))
    x0, y0, x1, y1 = max(x, 0), max(y, 0), min(x + w, W), min(y + h, H)
    if x0 >= x1 or y0 >= y1:
        return
    sa = a[y0 - y:y1 - y, x0 - x:x1 - x, None]
    dst[y0:y1, x0:x1] = dst[y0:y1, x0:x1] * (1 - sa) + rgb[y0 - y:y1 - y, x0 - x:x1 - x] * sa


def blit_add(dst, rgb, x, y, k=1.0):
    h, w = rgb.shape[:2]
    x, y = int(round(x)), int(round(y))
    x0, y0, x1, y1 = max(x, 0), max(y, 0), min(x + w, W), min(y + h, H)
    if x0 >= x1 or y0 >= y1:
        return
    dst[y0:y1, x0:x1] += k * rgb[y0 - y:y1 - y, x0 - x:x1 - x]


def resize_rgba(rgb, a, s):
    """scale float rgb/alpha by s (premultiplied resampling)."""
    h, w = a.shape
    nw, nh = max(1, int(round(w * s))), max(1, int(round(h * s)))
    pre = np.concatenate([rgb * a[..., None], a[..., None]], 2)
    out = np.stack([np.asarray(Image.fromarray(pre[..., c], "F").resize((nw, nh), Image.BILINEAR if s > 0.6 else Image.BOX))
                    for c in range(4)], 2)
    al = np.clip(out[..., 3], 0, 1)
    rgb2 = out[..., :3] / np.maximum(al[..., None], 1e-4)
    return np.clip(rgb2, 0, 4), al


def resize_f(img, s):
    h, w = img.shape[:2]
    nw, nh = max(1, int(round(w * s))), max(1, int(round(h * s)))
    if img.ndim == 2:
        return np.asarray(Image.fromarray(img, "F").resize((nw, nh), Image.BILINEAR))
    return np.stack([np.asarray(Image.fromarray(np.ascontiguousarray(img[..., c]), "F").resize((nw, nh), Image.BILINEAR))
                     for c in range(img.shape[2])], 2)


# ------------------------------------------------------------ sky --------
def sky(world, D, hz):
    ys = np.arange(H, dtype=np.float32)
    if world == "A":
        top = lerp(np.array([0.035, 0.03, 0.10]), np.array([0.10, 0.09, 0.24]), D)
        mid = lerp(C_NIGHT0, np.array([0.25, 0.20, 0.42]), D)
        hor = lerp(C_NIGHT1 * 1.05, np.array([0.75, 0.52, 0.52]), D)
    else:
        top = lerp(np.array([0.06, 0.05, 0.17]), np.array([0.20, 0.20, 0.45]), D)
        mid = lerp(np.array([0.24, 0.20, 0.45]), np.array([0.55, 0.48, 0.75]), D)
        hor = lerp(np.array([0.70, 0.48, 0.52]), np.array([1.0, 0.80, 0.52]), D)
    k1 = clamp01(ys / (hz * 0.62))[:, None]
    k2 = clamp01((ys - hz * 0.62) / (hz * 0.38))[:, None] ** 1.4
    col = np.where(ys[:, None] < hz * 0.62, top + (mid - top) * smooth(k1), mid + (hor - mid) * k2)
    col = np.where(ys[:, None] > hz, hor, col)
    return np.broadcast_to(col[:, None, :], (H, W, 3)).astype(np.float32).copy()


def draw_stars(img, t, cam, fade, hz):
    S = A["stars"]
    zl, ox, oy = cam_xf(cam, 0.06)
    sx = CX + (S["x"] - CX) * zl + ox; sy = CY + (S["y"] - CY) * zl + oy
    tw = 0.62 + 0.38 * np.sin(2 * np.pi * S["f"] * t + S["ph"]) * np.sin(0.37 * np.pi * S["f"] * t + 2 * S["ph"])
    b = S["b"] * tw * fade * clamp01((hz + 40 - sy) / 120)
    ok = (sx > 1) & (sx < W - 2) & (sy > 1) & (sy < H - 2) & (b > 0.004)
    sx, sy, b, col, big = sx[ok], sy[ok], b[ok], S["col"][ok], S["big"][ok]
    ix, iy = np.floor(sx).astype(int), np.floor(sy).astype(int)
    fx, fy = sx - ix, sy - iy
    acc = np.zeros((H * W, 3), np.float32)
    for dx, dy, wgt in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
        np.add.at(acc, (iy + dy) * W + ix + dx, col * (b * wgt)[:, None])
    acc = acc.reshape(H, W, 3)
    glow = np.zeros((H, W), np.float32)
    np.add.at(glow, (iy[big], ix[big]), b[big] * 3.0)
    glow = gaussian_filter(glow, 2.2)
    img += acc * 1.15 + glow[..., None] * np.array([0.8, 0.82, 1.0], np.float32)


def draw_moon(img, cam, mx, my, fade, pale=False):
    M = A["moon"]; S = M["S"]
    x, y, _ = to_screen(cam, 0.1, mx, my)
    if pale:   # daytime moon: additive, washed out by the sky
        blit_add(img, (M["rgb"] * M["disk"][..., None]) * 0.35 * fade + M["halo"] * 0.25 * fade, x - S / 2, y - S / 2)
        return x, y
    blit_add(img, M["halo"] * fade, x - S / 2, y - S / 2)
    blit_over(img, M["rgb"], M["disk"] * fade, x - S / 2, y - S / 2)
    return x, y


# ------------------------------------------------------------ icons ------
def build_icon(kind):
    K = 3; S = 320; O = 50
    im = Image.new("L", (S * K, S * K), 0); d = ImageDraw.Draw(im)
    w = 7 * K
    R = lambda *p: [(v + O) * K for v in p]
    if kind == "tax":
        d.line(R(50, 30, 140, 30, 170, 60, 170, 190, 50, 190, 50, 30), fill=255, width=w, joint="curve")
        d.line(R(140, 30, 140, 60, 170, 60), fill=255, width=w, joint="curve")
        for yy in (80, 104, 128):
            d.line(R(72, yy, 128, yy), fill=255, width=w)
        d.ellipse(R(80, 146, 96, 162), outline=255, width=5 * K); d.ellipse(R(128, 164, 144, 180), outline=255, width=5 * K)
        d.line(R(140, 146, 84, 180), fill=255, width=5 * K)
    elif kind == "container":
        d.polygon(R(30, 80, 150, 80, 190, 56, 70, 56), outline=255, width=w)
        d.line(R(30, 80, 30, 170, 150, 170, 150, 80), fill=255, width=w, joint="curve")
        d.line(R(150, 170, 190, 146, 190, 56), fill=255, width=w, joint="curve")
        for xx in range(48, 150, 17):
            d.line(R(xx, 92, xx, 158), fill=255, width=3 * K)
        d.line(R(60, 196, 160, 196), fill=180, width=4 * K)
    elif kind == "chip":
        d.rounded_rectangle(R(55, 55, 165, 165), radius=10 * K, outline=255, width=w)
        d.rectangle(R(85, 85, 135, 135), outline=255, width=5 * K)
        for i in range(5):
            p = 70 + i * 20
            for seg in (R(p, 20, p, 55), R(p, 165, p, 200), R(20, p, 55, p), R(165, p, 200, p)):
                d.line(seg, fill=255, width=4 * K)
    elif kind == "kline":
        d.line(R(24, 24, 24, 196, 200, 196), fill=255, width=5 * K, joint="curve")
        cand = [(52, 150, 120, 168, 105), (84, 130, 98, 150, 88), (116, 128, 112, 140, 100), (148, 98, 70, 112, 60), (180, 70, 40, 84, 30)]
        for x, o, c, lo, hi in cand:
            top, bot = min(o, c), max(o, c)
            d.line(R(x, hi, x, max(lo, bot) + 14), fill=255, width=4 * K)
            d.rectangle(R(x - 10, top, x + 10, bot), fill=0, outline=255, width=4 * K)
        d.line(R(40, 160, 92, 118, 130, 122, 196, 46), fill=200, width=3 * K, joint="curve")
    a = np.asarray(im.resize((S, S), Image.LANCZOS), np.float32) / 255
    glow = gaussian_filter(a, 5) * 1.4 + gaussian_filter(a, 16) * 1.6
    return dict(a=a, glow=glow, S=S)


# ------------------------------------------------------------ text -------
def text_sprite(txt, size, color, font=FONT_B, spacing=0.06, shadow=True):
    key = (txt, size, tuple(np.round(color, 3)), font)
    cache = A.setdefault("txt_cache", {})
    if key in cache:
        return cache[key]
    f = ImageFont.truetype(font, size)
    chars = list(txt)
    widths = [f.getlength(c) for c in chars]
    gap = size * spacing
    tw = int(sum(widths) + gap * (len(chars) - 1)) + 40
    th = int(size * 1.6) + 40
    m = Image.new("L", (tw, th), 0); d = ImageDraw.Draw(m)
    x = 20
    for c, w_ in zip(chars, widths):
        d.text((x, 20), c, font=f, fill=255); x += w_ + gap
    a = np.asarray(m, np.float32) / 255
    sh = gaussian_filter(a, size * 0.10) * 0.85 if shadow else None
    rgb = np.broadcast_to(np.asarray(color, np.float32), a.shape + (3,)).copy()
    cache[key] = (rgb, a, sh)
    return cache[key]


def draw_text(img, txt, size, color, cx, cy, alpha, font=FONT_B, spacing=0.06, shadow=True):
    if alpha <= 0.002:
        return
    rgb, a, sh = text_sprite(txt, size, color, font, spacing, shadow)
    h, w = a.shape
    x, y = cx - w / 2, cy - h / 2
    if sh is not None:
        blit_over(img, np.zeros_like(rgb) + np.array([0.03, 0.02, 0.08], np.float32), sh * alpha, x + 2, y + 3)
    blit_over(img, rgb, a * alpha, x, y)
