"""Data-cinema compositor: 2026 US midterms — results & impact.

Six shots, all procedural:
 S1 0-8    starfield + nebula; 100 seat-dots assemble into a hemicycle; title
 S2 8-20   Senate hemicycle fills (D 54 / R 44 / 2 counting) -> camera trucks
           to the House hemicycle (snapshot D 228 / R 139 / 68 uncalled)
 S3 20-32  executive vs legislative monoliths under a balance beam that settles level
 S4 32-46  camera trucks along four glass data panels (budget, tariffs, AI, markets)
 S5 46-58  Taiwan outline drawn in light, chip sites, TAIEX close & intraday range
 S6 58-66  dawn horizon; history bar chart; summary; brand
"""
import math
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter
from film import *

FADE_F = 10
DISSOLVES = [("S12", "S3", 19.75, 20.45), ("S3", "S4", 31.65, 32.35), ("S4", "S5", 45.65, 46.35), ("S5", "S6", 57.65, 58.35)]
CAM = {
    "S12": [(0.0, 1.10, 0, 60), (8.0, 1.0, 0, 0), (13.4, 1.03, -20, -6), (15.6, 1.02, -1620, -6), (20.5, 1.07, -1660, -14)],
    "S3": [(19.7, 1.00, 30, 10), (26.0, 1.05, 0, 0), (32.4, 1.10, -20, -12)],
    "S4": [],
    "S5": [(45.6, 1.06, 40, 12), (52.0, 1.02, 0, 0), (58.4, 1.07, -30, -8)],
    "S6": [(57.6, 1.08, 0, 20), (66.0, 1.0, 0, 0)],
}
PANEL_DX = 1150
_k = [(30.6, 1.05, 220, 0)]
_t0s = [c["caption_in_frame"] / FPS for c in icon_cues()]
for i, t0 in enumerate(_t0s):
    t_end = _t0s[i + 1] - 1.1 if i + 1 < len(_t0s) else 46.4
    _k.append((t0 - 0.25 if i else 32.2, 1.02, -PANEL_DX * i + 30, 0))
    _k.append((t_end, 1.035, -PANEL_DX * i - 50, 0))
CAM["S4"] = _k

BLUE = C_BLUE_EQ * 1.55
RED = C_RED_EQ * 1.55
GREY = np.array([0.62, 0.60, 0.74], np.float32)
INK = np.array([0.93, 0.90, 0.84], np.float32)


def ease_track(keys, t):
    ts = [k[0] for k in keys]
    if t <= ts[0]:
        return np.array(keys[0][1:])
    if t >= ts[-1]:
        return np.array(keys[-1][1:])
    i = int(np.searchsorted(ts, t) - 1)
    u = float(ease((t - ts[i]) / (ts[i + 1] - ts[i])))
    return np.array(keys[i][1:]) * (1 - u) + np.array(keys[i + 1][1:]) * u


def camera(g, t):
    z, px, py = (ease_track if g == "S4" else hermite_track)(CAM[g], t)
    return float(z), float(px), float(py)


# ------------------------------------------------------------ vector layer
class Vec:
    """2x supersampled RGBA vector layer -> (rgb, alpha) at 1x."""
    K = 2

    def __init__(self):
        self.im = Image.new("RGBA", (W * self.K, H * self.K), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)

    def c(self, col, a=1.0):
        return tuple(int(255 * min(1, max(0, v))) for v in col) + (int(255 * min(1, max(0, a))),)

    def P(self, pts):
        return [(x * self.K, y * self.K) for x, y in pts]

    def circle(self, x, y, r, col, a=1.0, outline=None, width=1):
        K = self.K
        self.d.ellipse([(x - r) * K, (y - r) * K, (x + r) * K, (y + r) * K], fill=self.c(col, a) if col is not None else None,
                       outline=self.c(outline, a) if outline is not None else None, width=int(width * K))

    def line(self, pts, col, a=1.0, width=2):
        if a <= 0:
            return
        self.d.line(self.P(pts), fill=self.c(col, a), width=max(1, int(width * self.K)), joint="curve")

    def poly(self, pts, col, a=1.0, outline=None, width=2):
        self.d.polygon(self.P(pts), fill=self.c(col, a) if col is not None else None,
                       outline=self.c(outline, a) if outline is not None else None, width=int(width * self.K))

    def rrect(self, x0, y0, x1, y1, r, col, a=1.0, outline=None, oa=1.0, width=2):
        if x1 - x0 < 1 or y1 - y0 < 1:
            return
        K = self.K
        r = min(r, (x1 - x0) / 2, (y1 - y0) / 2)
        self.d.rounded_rectangle([x0 * K, y0 * K, x1 * K, y1 * K], radius=r * K, fill=self.c(col, a) if col is not None else None,
                                 outline=self.c(outline, oa) if outline is not None else None, width=int(width * K))

    def result(self):
        sm = self.im.resize((W, H), Image.BOX)
        arr = np.asarray(sm, np.float32) / 255
        return arr[..., :3], arr[..., 3]


def composite_vec(img, v, glow=0.9):
    rgb, a = v.result()
    if glow > 0:
        pre = rgb * a[..., None]
        small = pre.reshape(H // 4, 4, W // 4, 4, 3).mean(axis=(1, 3))
        gl = gaussian_filter(small, (2.0, 2.0, 0)) * 0.9 + gaussian_filter(small, (7, 7, 0)) * 0.8
        up = np.stack([np.asarray(Image.fromarray(np.ascontiguousarray(gl[..., c]), "F").resize((W, H), Image.BILINEAR))
                       for c in range(3)], 2)
        img += up * glow
    img[:] = img * (1 - a[..., None]) + rgb * a[..., None]


# ------------------------------------------------------------ background --
def background(t, cam, D=0.0, grid=1.0):
    ys = np.arange(H, dtype=np.float32)[:, None]
    hz = 560 + cam[2] * 0.3
    top = lerp(np.array([0.030, 0.027, 0.085]), np.array([0.10, 0.09, 0.25]), D)
    mid = lerp(C_NIGHT0, np.array([0.32, 0.25, 0.46]), D)
    hor = lerp(C_NIGHT1, np.array([0.95, 0.68, 0.45]), D)
    k = clamp01(ys / hz)
    col = np.where(k < 0.6, top + (mid - top) * smooth(k / 0.6), mid + (hor - mid) * clamp01((k - 0.6) / 0.4) ** 1.5)
    below = clamp01((ys - hz) / (H - hz))
    floor = hor * (1 - below ** 0.5) * 0.55 + np.array([0.04, 0.035, 0.10]) * below ** 0.5
    col = np.where(ys > hz, floor, col)
    img = np.broadcast_to(col[:, None, :], (H, W, 3)).astype(np.float32).copy()
    # nebula (parallax d=0.12)
    zl, ox, oy = cam_xf(cam, 0.12)
    sc = (t * 3.0) % 2048
    data = (1 / zl, 0, CX - (CX + ox) / zl + sc + 2048, 0, 1 / zl, CY - (CY + oy) / zl + 20)
    neb = np.stack([np.asarray(ch.transform((W, H), Image.AFFINE, data, resample=Image.BILINEAR)) for ch in A["nebula"]], 2)
    neb *= clamp01((hz + 40 - np.arange(H)[:, None, None]) / 260)
    img += neb * (1 - 0.6 * D)
    draw_stars(img, t, cam, 1.0 - 0.8 * D, hz)
    if D > 0:   # dawn glow on the horizon
        xx = np.arange(W, dtype=np.float32)[None, :]
        r = np.sqrt((xx - 1300) ** 2 + ((ys - hz) * 2.2) ** 2)
        img += ((0.55 * np.exp(-r / 160) + 0.30 * np.exp(-r / 600)) * D)[..., None] * np.array([1.0, 0.75, 0.42], np.float32)
    if grid > 0:   # perspective data grid on the floor
        r0 = int(hz) + 1
        yy = np.arange(r0, H, dtype=np.float32)[:, None]
        zdep = 900.0 / (yy - hz + 2)
        xw = (np.arange(W, dtype=np.float32)[None, :] - CX - cam[1] * 0.6) * zdep / 300.0
        zl_ = zdep + t * 1.6
        lx = np.abs(((xw + 0.5) % 1.0) - 0.5) / (zdep / 300.0 + 1e-3)
        lz = np.abs(((zl_ + 0.5) % 1.0) - 0.5) / (zdep * 0.012 + 1e-3)
        gl = clamp01(1.4 - lx * 0.9) + clamp01(1.2 - lz * 0.8)
        fade = clamp01((yy - hz) / 160) * clamp01(1.0 - (yy - hz) / 600 * 0.3)
        gc = lerp(C_NIGHT2 * 1.1, C_GOLD, D * 0.7)
        img[r0:] += (clamp01(gl) * fade * 0.20 * grid)[..., None] * gc
        img += (np.exp(-((ys - hz) / 6.0) ** 2) * 0.10)[..., None] * hor
    Dd = A["dust"]   # floating dust with depth parallax
    sx = (Dd["x"] + cam[1] * Dd["d"] - t * 6 * Dd["d"]) % (W + 200) - 100
    sy = Dd["y"] + cam[2] * Dd["d"] + 8 * np.sin(t * 0.4 + Dd["ph"])
    ok = (sx > 1) & (sx < W - 2) & (sy > 1) & (sy < H - 2)
    b = (0.10 + 0.25 * Dd["d"]) * (0.6 + 0.4 * np.sin(t * 1.3 + Dd["ph"] * 3))
    np.add.at(img, (sy[ok].astype(int), sx[ok].astype(int)), (b[ok][:, None] * np.array([0.8, 0.78, 1.0])).astype(np.float32))
    return img, hz


# ------------------------------------------------------------ hemicycles --
def hemicycle(n, r_in, r_out, rows):
    """parliament layout; positions sorted left->right by angle, plus dot radius."""
    radii = np.linspace(r_in, r_out, rows)
    counts = np.round(n * radii / radii.sum()).astype(int)
    counts[-1] += n - counts.sum()
    pts = []
    for r, c in zip(radii, counts):
        for k in range(c):
            pts.append((math.pi * (1 - (k + 0.5) / c), r))
    pts.sort(key=lambda p: (-p[0], p[1]))
    xy = np.array([(r * math.cos(a), -r * math.sin(a)) for a, r in pts])
    return xy, (r_out - r_in) / rows * 0.36


SEN_XY, SEN_DOT = hemicycle(100, 150, 330, 6)
HOU_XY, HOU_DOT = hemicycle(435, 140, 360, 12)
SEN_C = (960, 520); HOU_C = (960 + 1620, 520)
SENATE = dict(D=54, R=44, U=2, majority=51)
HOUSE = dict(D=228, R=139, U=68, majority=218)   # 13News Now snapshot, 11/04 a.m. (see research.md)


def draw_chamber(v, texts, t, cam, center, xy, dot, spec, t_fill, t_appear, scatter_from=None, alpha=1.0):
    x0, y0, z = to_screen(cam, 1.0, *center)
    n = len(xy)
    lab = np.array(["D"] * spec["D"] + ["U"] * spec["U"] + ["R"] * spec["R"])
    rng = np.random.default_rng(n)
    delays = rng.uniform(0, 0.8, n)
    fill_k = np.zeros(n)
    rate = n / 3.0   # identical seats-per-second for both parties (blue from the left, red from the right)
    for idx_list in (np.arange(spec["D"]), np.arange(n - 1, n - 1 - spec["R"], -1)):
        for j, idx in enumerate(idx_list):
            fill_k[idx] = clamp01((t - t_fill - j / rate) / 0.25)
    for i in range(n):
        px, py = xy[i]
        k_app = clamp01((t - t_appear - (i / n) * 0.9) / 0.5)
        if scatter_from is not None:
            u = ease((t - t_appear - delays[i]) / 2.6)
            px, py = lerp(scatter_from[i][0], px, u), lerp(scatter_from[i][1], py, u)
            k_app = 1.0
        if k_app <= 0:
            continue
        f = fill_k[i]
        if lab[i] == "U":
            pul = 0.55 + 0.45 * math.sin(t * 4.0 + i)
            col = GREY * (0.6 + 0.4 * pul) if t > t_fill else GREY * 0.55
        else:
            col = GREY * 0.55 * (1 - f) + (BLUE if lab[i] == "D" else RED) * f
        r = dot * z * (0.6 + 0.4 * k_app) * (1 + 0.35 * math.sin(f * math.pi))
        v.circle(x0 + px * z, y0 + py * z, r, col, alpha * k_app)
    if t > t_fill + 0.3:   # majority marker
        a_m = ramp(t, t_fill + 0.3, t_fill + 1.0) * alpha
        m = spec["majority"]
        ang_m = math.atan2(-(xy[m - 1][1] + xy[m][1]) / 2, (xy[m - 1][0] + xy[m][0]) / 2)
        rr = np.hypot(*xy.T)
        r_in, r_out = rr.min() - 22, rr.max() + 26
        p_in = (x0 + r_in * math.cos(ang_m) * z, y0 - r_in * math.sin(ang_m) * z)
        p_out = (x0 + r_out * math.cos(ang_m) * z, y0 - r_out * math.sin(ang_m) * z)
        v.line([p_in, p_out], C_GOLD, 0.9 * a_m, 2.5)
        texts.append(("過半 " + str(m), 24, C_GOLD, p_out[0] + 62 * z, p_out[1] + 4 * z, a_m))
    return x0, y0, z


def chamber_labels(texts, t, x0, y0, z, spec, t_fill, title, alpha, note=None):
    a = ramp(t, t_fill + 0.4, t_fill + 1.2) * alpha
    texts.append((title, 40, INK, x0, y0 - 432 * z, alpha * ramp(t, t_fill - 1.0, t_fill - 0.2)))
    if a <= 0:
        return
    texts.append(("民主黨", 26, INK * 0.9, x0 - 250 * z, y0 + 48 * z, a))
    texts.append((str(spec["D"]), 64, BLUE * 1.15, x0 - 250 * z, y0 + 102 * z, a))
    texts.append(("共和黨", 26, INK * 0.9, x0 + 250 * z, y0 + 48 * z, a))
    texts.append((str(spec["R"]), 64, RED * 1.15, x0 + 250 * z, y0 + 102 * z, a))
    texts.append(("計票中", 24, GREY, x0, y0 + 40 * z, a))
    texts.append((str(spec["U"]), 44, GREY * 1.2, x0, y0 + 86 * z, a))
    if note:
        texts.append((note, 19, GREY, x0, y0 + 142 * z, a * 0.9))


# ------------------------------------------------------------ shots ------
_SCAT = np.stack([np.random.default_rng(4).uniform(-900, 900, 100), np.random.default_rng(5).uniform(-520, 120, 100)], 1)


def shot_S12(t):
    cam = camera("S12", t)
    img, hz = background(t, cam)
    v = Vec(); texts = []
    x0, y0, z = draw_chamber(v, texts, t, cam, SEN_C, SEN_XY, SEN_DOT, SENATE, t_fill=8.6, t_appear=4.2,
                             scatter_from=_SCAT, alpha=ramp(t, 3.6, 4.6))
    chamber_labels(texts, t, x0, y0, z, SENATE, 8.6, "參議院 100 席", 1.0)
    if t > 13.0:
        x0, y0, z = draw_chamber(v, texts, t, cam, HOU_C, HOU_XY, HOU_DOT, HOUSE, t_fill=15.0, t_appear=13.6)
        chamber_labels(texts, t, x0, y0, z, HOUSE, 15.0, "眾議院 435 席", 1.0,
                       note="眾院席次為 11/04 上午開票快照（13News Now），仍持續更新")
    composite_vec(img, v, 0.8)
    for tx in texts:
        draw_text(img, *tx, spacing=0.06)
    return img


def monolith(v, texts, cx, base_y, w, h, z, tint, a, title, party, pill, a_pill):
    x0, x1 = cx - w / 2 * z, cx + w / 2 * z
    y0, y1 = base_y - h * z, base_y
    v.rrect(x0, y0, x1, y1, 10 * z, tint * 0.35 + C_NIGHT0 * 0.65, 0.78 * a, outline=tint * 0.9 + 0.15, oa=0.95 * a, width=2.5)
    for k in range(4, 8):
        yy = y0 + k * (y1 - y0) / 8
        v.line([(x0 + 14 * z, yy), (x1 - 14 * z, yy)], tint * 0.6 + 0.2, 0.22 * a, 1.2)
    v.rrect(x0 + 14 * z, y0 + 14 * z, x1 - 14 * z, y0 + 22 * z, 3, tint * 1.2 + 0.1, 0.95 * a)
    texts.append((title, 46, INK, cx, y0 + 74 * z, a))
    texts.append((party, 30, INK * 0.95, cx, y0 + 132 * z, a))
    if a_pill > 0:
        pw, py = 250 * z, y0 + 210 * z
        v.rrect(cx - pw / 2, py - 25 * z, cx + pw / 2, py + 25 * z, 24 * z, C_GOLD * 0.25, 0.85 * a_pill, outline=C_GOLD, oa=a_pill, width=2)
        texts.append((pill, 26, np.array([1.0, 0.92, 0.72]), cx, py, a_pill))


def shot_S3(t):
    cam = camera("S3", t)
    img, hz = background(t, cam)
    v = Vec(); texts = []
    z = cam[0]
    a = ramp(t, 19.9, 20.9)
    L = to_screen(cam, 1.0, 700, 600); R = to_screen(cam, 1.0, 1220, 600)
    rise = (1 - ease((t - 19.9) / 1.3)) * 80
    a_pill = ramp(t, 26.5, 27.2)
    monolith(v, texts, L[0], L[1] + rise, 300, 330, z, RED, a, "行政", "白宮・共和黨", "否決權・關稅權限", a_pill)
    monolith(v, texts, R[0], R[1] + rise, 300, 330, z, BLUE, a, "立法", "國會・民主黨", "預算・監督", a_pill)
    ab = ramp(t, 21.2, 22.2)
    if ab > 0:   # balance beam: starts tilted, damped swing, settles level
        pv = to_screen(cam, 1.0, 960, 180)
        phi = balance_angle(t + 3.6)
        Lb = 300 * z
        ends = [(pv[0] - Lb * math.cos(phi), pv[1] - Lb * math.sin(phi)), (pv[0] + Lb * math.cos(phi), pv[1] + Lb * math.sin(phi))]
        v.poly([(pv[0] - 22 * z, pv[1] + 44 * z), (pv[0], pv[1] + 6 * z), (pv[0] + 22 * z, pv[1] + 44 * z)], None, ab, outline=C_GOLD, width=3)
        v.line(ends, C_GOLD, ab, 5)
        v.circle(pv[0], pv[1], 9 * z, C_GOLD, ab)
        for (ex, ey), top in zip(ends, (L, R)):
            v.circle(ex, ey, 7 * z, C_GOLD, ab)
            v.line([(ex, ey), (ex, top[1] + rise - 330 * z)], C_GOLD, 0.5 * ab, 2)
        texts.append(("分裂政府：權力相互制衡", 30, np.array([1.0, 0.9, 0.66]), pv[0], pv[1] - 52 * z, ramp(t, 28.6, 29.6)))
    composite_vec(img, v, 0.7)
    for tx in texts:
        draw_text(img, *tx, spacing=0.06)
    return img


PANELS = [
    dict(icon="tax", title="預算與舉債上限", lines=["撥款法案需兩黨協商", "舉債上限問題預計 2027 年底前浮現"]),
    dict(icon="container", title="關稅", lines=["IEEPA 關稅已被最高法院判定違法", "232 條等關稅屬行政部門授權"]),
    dict(icon="chip", title="AI 與資料中心", lines=["市場預期監管審查與成本可能增加", "選後 AI 概念股一度承壓"]),
    dict(icon="kline", title="選後市場　11/04 盤中", lines=[]),
]
MARKET = [("道瓊", 2.8, 2.8, "+2.8%"), ("S&P 500", 1.7, 1.7, "+1.7%"), ("那斯達克", 2.0, 2.0, "+2.0%"),
          ("10年期殖利率", -0.05, 0.8, "4.95→4.90%"), ("美元指數", -0.32, 0.6, "−0.32%")]


def draw_text_left(img, txt, size, col, x, y, a):
    if a <= 0.002:
        return
    rgb, al, sh = text_sprite(txt, size, col, FONT_B if size >= 30 else FONT_R, 0.04, True)
    h, w = al.shape
    blit_over(img, np.zeros_like(rgb) + np.array([0.03, 0.02, 0.08], np.float32), sh * a, x - 18, y - h / 2 + 3)
    blit_over(img, rgb, al * a, x - 20, y - h / 2)


def shot_S4(t):
    cam = camera("S4", t)
    img, hz = background(t, cam)
    v = Vec(); texts = []; icons = []
    for i, (P, cue) in enumerate(zip(PANELS, icon_cues())):
        t0 = cue["caption_in_frame"] / FPS
        cx, cy, z = to_screen(cam, 1.0, 960 + PANEL_DX * i, 345)
        if cx < -700 or cx > W + 700:
            continue
        a = ramp(t, t0 - 1.0, t0 - 0.2) if i > 0 else ramp(t, 31.7, 32.5)
        w2, h2 = 480 * z, 235 * z
        v.rrect(cx - w2, cy - h2, cx + w2, cy + h2, 26 * z, np.array([0.16, 0.14, 0.36]), 0.62 * a,
                outline=np.array([0.75, 0.70, 1.0]), oa=0.55 * a, width=2)
        ia = ramp(t, t0 - 0.75, t0 - 0.15)
        icons.append((P["icon"], cx - 310 * z, cy, 0.95 * z * (0.85 + 0.15 * ease((t - t0) / 0.6)), ia * a))
        tx = cx - 140 * z
        if P["lines"]:
            texts.append((P["title"], 48, INK, tx, cy - 85 * z, a * ia))
            for j, ln in enumerate(P["lines"]):
                texts.append((ln, 29, INK * 0.86, tx, cy - 5 * z + j * 54 * z, ramp(t, t0 - 0.2 + 0.35 * j, t0 + 0.4 + 0.35 * j) * a))
        else:
            texts.append((P["title"], 38, INK, tx, cy - 160 * z, a * ia))
            for j, (name, val, mag, lab) in enumerate(MARKET):
                yy = cy - 98 * z + j * 54 * z
                aj = ramp(t, t0 - 0.4 + 0.2 * j, t0 + 0.1 + 0.2 * j) * a
                grow = ease((t - t0 + 0.3 - 0.2 * j) / 1.0)
                texts.append((name, 25, INK * 0.9, tx, yy, aj))
                bx0 = tx + 175 * z
                ln = max(mag * 60 * z * grow, 4 * z * grow)
                col = C_GOLD if val > 0 else np.array([0.62, 0.66, 0.98])
                v.rrect(bx0, yy - 13 * z, bx0 + ln, yy + 13 * z, 6 * z, col, 0.92 * aj)
                texts.append((lab, 24, col * 1.05, bx0 + ln + 14 * z, yy, aj))
            texts.append(("來源：Yahoo Finance、Morningstar 等盤中報導", 18, GREY, tx, cy + 196 * z, a * ia * 0.9))
    composite_vec(img, v, 0.5)
    for kind, x, y, s, a in icons:
        if a <= 0:
            continue
        I = A["icons"][kind]
        aa = resize_f(I["a"], s); gg = resize_f(I["glow"], s)
        h, w = aa.shape
        blit_add(img, (gg * a)[..., None] * C_GOLD, x - w / 2, y - h / 2)
        blit_over(img, np.zeros((h, w, 3), np.float32) + np.array([1.0, 0.9, 0.66], np.float32), aa * a, x - w / 2, y - h / 2)
    for tx in texts:
        draw_text_left(img, *tx)
    return img


TW_K = 118.0


def tw_pt(lon, lat):
    return ((lon - 120.98) * TW_K * math.cos(math.radians(23.7)), -(lat - 23.6) * TW_K)


def shot_S5(t):
    cam = camera("S5", t)
    img, hz = background(t, cam, D=0.12 * ramp(t, 46, 58))
    v = Vec(); texts = []
    cx, cy, z = to_screen(cam, 1.0, 640, 340)
    P = [(cx + x * z, cy + y * z) for x, y in (tw_pt(lo, la) for lo, la in TAIWAN + [TAIWAN[0]])]
    seg = np.hypot(np.diff([p[0] for p in P]), np.diff([p[1] for p in P]))
    k = ease((t - 46.0) / 2.6)
    if k >= 1:
        v.poly(P[:-1], np.array([0.20, 0.20, 0.42]), 0.85 * ramp(t, 47.8, 48.8), outline=C_GOLD, width=3)
    elif k > 0:   # outline drawn as a travelling stroke of light
        L = k * seg.sum(); acc = 0; path = [P[0]]
        for i, sl in enumerate(seg):
            if acc + sl >= L:
                f = (L - acc) / sl
                path.append((lerp(P[i][0], P[i + 1][0], f), lerp(P[i][1], P[i + 1][1], f))); break
            acc += sl; path.append(P[i + 1])
        v.line(path, C_GOLD, 1.0, 3)
        v.circle(path[-1][0], path[-1][1], 6, np.array([1, 0.95, 0.8]), 1.0)
    for (lo, la), tc in zip(CHIP_SITES, chip_times()):   # chip-shaped lights at semiconductor clusters
        if t < tc:
            continue
        kk = t - tc
        pop = 1 + 0.5 * math.exp(-kk * 5) * math.sin(kk * 14)
        x, y = tw_pt(lo, la); X, Y = cx + x * z, cy + y * z
        s = 8 * z * pop
        v.rrect(X - s, Y - s, X + s, Y + s, 2, C_GOLD, 0.95)
        v.rrect(X - s * 0.45, Y - s * 0.45, X + s * 0.45, Y + s * 0.45, 1, np.array([0.3, 0.25, 0.5]), 0.9)
        for o in (-0.5, 0, 0.5):
            v.line([(X + o * s * 1.4, Y - s), (X + o * s * 1.4, Y - s - 5 * z)], C_GOLD, 0.9, 1.5)
            v.line([(X + o * s * 1.4, Y + s), (X + o * s * 1.4, Y + s + 5 * z)], C_GOLD, 0.9, 1.5)
            v.line([(X - s, Y + o * s * 1.4), (X - s - 5 * z, Y + o * s * 1.4)], C_GOLD, 0.9, 1.5)
            v.line([(X + s, Y + o * s * 1.4), (X + s + 5 * z, Y + o * s * 1.4)], C_GOLD, 0.9, 1.5)
    texts.append(("台灣", 30, INK, cx - 170 * z, cy - 160 * z, ramp(t, 47.0, 47.8)))
    px_, py_, _ = to_screen(cam, 1.0, 1290, 290)
    a = ramp(t, 46.6, 47.4)
    texts.append(("台股加權指數　11/04 收盤", 32, INK * 0.92, px_, py_ - 140 * z, a))
    texts.append(("42,948.91", 96, np.array([1.0, 0.90, 0.66]), px_, py_ - 40 * z, ramp(t, 47.0, 47.9)))
    ar = ramp(t, 48.6, 49.6)
    bw = 420 * z * ease((t - 48.6) / 1.0)
    v.rrect(px_ - 210 * z, py_ + 62 * z, px_ - 210 * z + bw, py_ + 74 * z, 6 * z, np.array([0.62, 0.66, 0.98]), 0.9 * ar)
    v.line([(px_ - 210 * z, py_ + 50 * z), (px_ - 210 * z, py_ + 86 * z)], INK, 0.8 * ar, 2)
    v.line([(px_ + 210 * z, py_ + 50 * z), (px_ + 210 * z, py_ + 86 * z)], INK, 0.8 * ar * ramp(t, 49.4, 49.7), 2)
    texts.append(("盤中震幅 1,885.72 點", 30, INK * 0.92, px_, py_ + 116 * z, ar))
    texts.append(("來源：中央社", 18, GREY, px_, py_ + 156 * z, ar * 0.9))
    for (lab, yy, aa) in (("晶片 232 關稅", 500, ramp(t, 52.5, 53.2)), ("AI 供應鏈審查", 572, ramp(t, 53.6, 54.3))):
        X, Y, _ = to_screen(cam, 1.0, 1290, yy)
        v.rrect(X - 150 * z, Y - 28 * z, X + 150 * z, Y + 28 * z, 26 * z, C_GOLD * 0.22, 0.85 * aa, outline=C_GOLD, oa=aa, width=2)
        texts.append((lab, 28, np.array([1.0, 0.92, 0.72]), X, Y, aa))
    composite_vec(img, v, 0.9)
    for tx in texts:
        draw_text(img, *tx, spacing=0.04)
    return img


HIST = [("BNY", 16.6, "{:.1f}%"), ("Hartford Funds", 15.17, "{:.2f}%"), ("Oxford Economics", 15.0, "約{:.0f}%")]


def shot_S6(t):
    cam = camera("S6", t)
    D = lerp(0.35, 1.0, ease((t - 57.6) / 6.0))
    img, hz = background(t, cam, D=D)
    v = Vec(); texts = []
    a = ramp(t, 57.8, 58.6) * (1 - ramp(t, 63.2, 63.9))
    cx, cy, z = to_screen(cam, 1.0, 960, 320)
    texts.append(("期中選舉後 12 個月　S&P 500 平均漲幅", 36, INK, cx, cy - 215 * z, a))
    texts.append(("1950 年以來　各機構統計", 22, INK * 0.8, cx, cy - 170 * z, a))
    base = cy + 150 * z
    for j, (name, val, fmt) in enumerate(HIST):
        x = cx + (j - 1) * 270 * z
        g = ease((t - 58.6 - 0.25 * j) / 1.2)
        hgt = val / 16.6 * 230 * z * g
        v.rrect(x - 55 * z, base - hgt, x + 55 * z, base, 8 * z, C_GOLD * 0.85, 0.85 * a)
        texts.append((fmt.format(val), 34, np.array([1.0, 0.92, 0.70]), x, base - hgt - 32 * z, a * ramp(g, 0.85, 1.0)))
        texts.append((name, 22, INK * 0.9, x, base + 30 * z, a))
    v.line([(cx - 420 * z, base), (cx + 420 * z, base)], INK, 0.6 * a, 2)
    texts.append(("過去績效不代表未來", 20, GREY * 1.2, cx, base + 70 * z, a))
    composite_vec(img, v, 0.25)
    for tx in texts:
        draw_text(img, *tx, spacing=0.04)
    return img


SHOTS = {"S12": shot_S12, "S3": shot_S3, "S4": shot_S4, "S5": shot_S5, "S6": shot_S6}


def group_weights(t):
    for a, b, t0, t1 in DISSOLVES:
        if t0 <= t < t1:
            k = float(ease((t - t0) / (t1 - t0)))
            return [(a, 1 - k), (b, k)]
    g = "S12"
    for a, b, t0, t1 in DISSOLVES:
        if t >= t1:
            g = b
    return [(g, 1.0)]


# ------------------------------------------------------------ post -------
_VIG = None


def post(img, f):
    global _VIG
    if _VIG is None:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - CX) / CX) ** 2 + ((yy - CY) / (CY * 1.25)) ** 2)
        _VIG = (1 - 0.42 * clamp01(r - 0.35) ** 1.6)[..., None].astype(np.float32)
    small = img.reshape(H // 4, 4, W // 4, 4, 3).mean(axis=(1, 3))
    br = np.maximum(small - 0.62, 0)
    bl = gaussian_filter(br, (3, 3, 0)) * 0.6 + gaussian_filter(br, (12, 12, 0)) * 0.7
    up = np.stack([np.asarray(Image.fromarray(np.ascontiguousarray(bl[..., c]), "F").resize((W, H), Image.BILINEAR)) for c in range(3)], 2)
    return (img + up * 0.5) * _VIG


def tonemap(img):
    x = np.maximum(img, 0)
    return np.where(x < 0.82, x, 0.82 + 0.18 * np.tanh((x - 0.82) / 0.18))


def grain(img, f):
    """per-frame film grain, generated at 1/2 resolution and softened (organic clumps,
    and far kinder to the H.264 encoder than per-pixel white noise)."""
    n = np.random.default_rng(1000 + f).standard_normal((H // 2, W // 2), dtype=np.float32)
    n = gaussian_filter(n, 0.8) * 1.9
    n = np.asarray(Image.fromarray(n, "F").resize((W, H), Image.BILINEAR))
    lum_ = img.mean(axis=2, keepdims=True)
    return img + n[..., None] * (0.004 + 0.005 * (1 - clamp01(lum_)))


def captions(img, f):
    t = f / FPS
    cues = TL["cues"]
    for i, c in enumerate(cues):
        fi, fo = c["caption_in_frame"], c["caption_out_frame"]
        if i + 1 < len(cues):
            fo = min(fo, cues[i + 1]["caption_in_frame"])
        if fi <= f <= fo:
            a = min(1.0, (f - fi + 1) / FADE_F, (fo - f + 1) / FADE_F)
            draw_text(img, c["caption"], 46, C_CREAM, CX, H - 62, smooth(a), spacing=0.08)
    for card in TL["cards"]:
        a = window(t, card["t0"], card["t1"], 0.6, 0.6) if card["kind"] == "brand_open" else ramp(t, card["t0"], card["t0"] + 0.6)
        if a <= 0:
            continue
        y0 = 300 if card["kind"] == "brand_open" else 330
        draw_text(img, TL["brand"], 74, C_CREAM, CX, y0, a, spacing=0.14)
        draw_text(img, TL["handle"], 30, C_GOLD, CX, y0 + 72, a, font=FONT_R, spacing=0.04)
        wl = 150 * ease(a)
        for s_ in (-1, 1):
            xa, xb = sorted((CX + s_ * 250, CX + s_ * (250 + wl)))
            img[y0 + 70:y0 + 72, int(xa):int(xb)] = img[y0 + 70:y0 + 72, int(xa):int(xb)] * (1 - a) + C_GOLD * a
        if card["kind"] == "brand_close":
            draw_text(img, "資料截至 " + TL["data_date"], 24, np.array([0.92, 0.88, 0.80]), CX, y0 + 128, a, font=FONT_R, spacing=0.06)


def render_frame(f):
    t = f / FPS
    acc = None
    for g, wgt in group_weights(t):
        im = SHOTS[g](t)
        acc = im * wgt if acc is None else acc + im * wgt
    img = post(acc, f)
    img = img * (1 - 0.45 * ramp(t, 63.8, 66.0))
    img = tonemap(img)
    captions(img, f)
    img = grain(img, f)
    return (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)
