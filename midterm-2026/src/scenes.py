"""Editorial data-motion design (one visual system). Every pixel is drawn by code (numpy + Pillow)."""
import math
import numpy as np
from common import *

BG0 = hex2rgb("#0A1120"); BG1 = hex2rgb("#162741")
GOLD = hex2rgb("#F5B841"); TXT = hex2rgb("#F4F1EA"); MUTE = hex2rgb("#8C9BB3"); LINE = hex2rgb("#2A3D5C")
CARD = hex2rgb("#13213A"); CARD2 = hex2rgb("#1B2D4C"); GREY = hex2rgb("#6E7A8E")
RED, BLUE = party_pair(4, 214, 0.56, 0.66)      # identical HLS lightness & saturation
TITLES = ["2026 美國期中選舉", "參議院結果", "眾議院結果", "權力結構", "三大政策焦點", "市場反應", "對台灣的影響", "歷史怎麼說", "重點整理"]

_BG = None
_GRID = None
def dot_grid():
    global _GRID
    if _GRID is None:
        m = np.zeros((H, W), np.float32)
        for y in range(0, H, 60):
            for x in range(60, W, 60):
                m[y:y + 3, x:x + 3] = 1
        m[:250] = 0; m[1440:] = 0
        _GRID = m
    return _GRID
def background():
    global _BG
    if _BG is None:
        xx, yy = grid_xy()
        k = (yy / H)[..., None]
        bg = BG1 * (1 - k) + BG0 * k
        g = cached_noise(H, W, 300, 3, 2)[..., None]
        _BG = (bg * (0.92 + 0.12 * g)).astype(np.float32)
    return _BG.copy()

def chrome(img, ctx, cam):
    t, i = ctx.t, ctx.seg["index"]
    # drifting dotted grid
    g = np.roll(dot_grid(), int(t * 12) % 60, axis=0)[..., None] * 0.8
    img *= (1 - g); img += g * LINE
    # top progress segments
    n = len(TITLES); gap = 10; x0 = 72; w = (W - 144 - gap * (n - 1)) / n
    for j in range(n):
        xa = x0 + j * (w + gap)
        comp(img, poly_mask(rrect_pts(xa, 84, xa + w, 92, 4)), LINE)
        f = 1.0 if j < i else (ctx.k if j == i else 0)
        if f > 0:
            comp(img, poly_mask(rrect_pts(xa, 84, xa + w * f, 92, 4)), GOLD)
    # kicker + title
    a = 1.0 if i == 0 else prog(t, 0.0, 0.35)
    draw_text(img, f"{i+1:02d} / {n:02d}", 72, 150, 32, GOLD, name="sans_k", anchor="lt", alpha=a)
    draw_text(img, TITLES[i], 72 - 30 * (1 - a), 196, 74, TXT, name="sans_k", anchor="lt", alpha=a)
    # footer: data date & sources
    draw_text(img, f"資料：AP・NBC・Fox News・CNN・鉅亨網等｜截至 {ctx.tl['data_date']}（美東）", 540, 1712, 26, MUTE,
              name="sans_m")

def subtitle(img, ctx):
    # subtitle: dark panel with gold rule, 64 px side margins, ≥260 px above bottom
    if ctx.sub_alpha:
        x0, y0, x1, y1 = SUB_LEFT, SUB_TOP + 20, SUB_RIGHT, SUB_BOTTOM - 20
        comp(img, poly_mask(rrect_pts(x0, y0, x1, y1, 22)), hex2rgb("#050A14"), 0.88)
        comp(img, poly_mask(rrect_pts(x0, y0, x0 + 12, y1, 6)), GOLD)
        draw_text(img, ctx.seg["subtitle"], (x0 + x1) / 2 + 6, (y0 + y1) / 2 - 4, 68, TXT, name="sans_k")

def card(img, x0, y0, x1, y1, cam, a=1.0, col=CARD, r=28, border=None):
    if border is not None:
        comp(img, poly_mask(cam(rrect_pts(x0 - 3, y0 - 3, x1 + 3, y1 + 3, r + 3))), border, a)
    comp(img, poly_mask(cam(rrect_pts(x0, y0, x1, y1, r))), col, a)

def T(img, s, x, y, size, col, cam, name="sans_k", anchor="mm", a=1.0):
    draw_text(img, s, x, y, size, col, name=name, anchor=anchor, cam=cam, alpha=a)

def dot(img, x, y, r, col, a=1.0):
    comp(img, poly_mask(ellipse_pts(x, y, r, r, n=20)), col, a)

def arrow(img, x, y, size, up, col, cam, a=1.0):
    s = size
    pts = [(x, y - s), (x + s * 0.8, y), (x + s * 0.3, y), (x + s * 0.3, y + s), (x - s * 0.3, y + s), (x - s * 0.3, y), (x - s * 0.8, y)]
    if not up:
        pts = [(px, 2 * y - py) for px, py in pts]
    comp(img, poly_mask(cam(pts)), col, a)

# ─────────────────────────── scenes ───────────────────────────
def s_hook(img, t, cam):
    k = 0.35 + 0.65 * prog(t, 0.0, 0.8)
    T(img, "2026", 540, 520, 300, GOLD, cam, a=k)
    T(img, "美國期中選舉結果", 540, 730, 84, TXT, cam, a=prog(t, 0.5, 1.1))
    for j, (lab, sub) in enumerate((("參議院", "民主黨取得多數"), ("眾議院", "民主黨取得多數"))):
        kk = ease_back(clamp((t - 1.2 - 0.35 * j) / 0.6))
        x = 300 + 480 * j + (1 - kk) * 200 * (1 if j else -1)
        card(img, x - 210, 850, x + 210, 1080, cam, kk, CARD2)
        comp(img, poly_mask(cam(rrect_pts(x - 210, 850, x + 210, 868, 9))), BLUE, kk)
        T(img, lab, x, 925, 52, TXT, cam, a=kk)
        T(img, sub, x, 1005, 40, BLUE * 0.5 + TXT * 0.5, cam, name="sans", a=kk)
    q = prog(t, 3.6, 4.2)
    T(img, "對市場、對台灣", 540, 1200, 70, TXT, cam, a=q)
    T(img, "影響在哪裡？", 540, 1300, 70, GOLD, cam, a=prog(t, 4.0, 4.6))

def s_senate(img, t, cam):
    N_D, N_R, N_T = 54, 44, 100
    pos, d = hemicycle(N_T, 540, 900, 190, 420, 5)
    k = clamp((t - 0.4) / 2.8)
    for i, (x, y) in enumerate(cam(pos)):
        lab, f = seat_fill_state(i, N_D, N_R, N_T, k)
        dot(img, x, y, cam.s(d), LINE)
        if f > 0:
            dot(img, x, y, cam.s(d) * (0.4 + 0.6 * ease_back(f)), {"d": BLUE, "r": RED, "u": GREY}[lab])
    (mx, a0), (_, a1) = cam([(540, 455), (540, 490)])
    comp(img, stroke_mask([(mx, a0), (mx, a1)], 4), GOLD)
    T(img, "過半 51 席", 540, 425, 32, GOLD, cam)
    T(img, "計票中 2", 540, 830, 40, TXT, cam, a=prog(t, 3.0, 3.4))
    T(img, "阿拉斯加・密西西比", 540, 878, 28, MUTE, cam, name="sans", a=prog(t, 3.0, 3.4))
    for x, lab, n, col in ((250, "民主黨＊", N_D, BLUE), (830, "共和黨", N_R, RED)):
        T(img, str(countup(n, k)), x, 1050, 150, col, cam)
        T(img, lab, x, 1160, 44, TXT, cam)
    T(img, "＊含 2 位與民主黨同黨團的獨立派", 540, 1260, 30, MUTE, cam, name="sans", a=prog(t, 1.0, 1.5))
    T(img, "民主黨淨增 7 席", 540, 1340, 44, GOLD, cam, a=prog(t, 3.6, 4.1))

def s_house(img, t, cam):
    D, R, U = 228, 139, 68           # AP-called seats; U = still counting
    cols, rows = 29, 15
    k = clamp((t - 0.3) / 3.0)
    x0, y0, step = 540 - (cols - 1) * 15, 420, 30
    order = ["d"] * D + ["u"] * U + ["r"] * R          # column-major fill: D from left, R from right
    for c in range(cols):
        for r in range(rows):
            i = c * rows + r
            lab = order[i]
            if lab == "d":
                f = clamp(k * max(D, R) - i)
            elif lab == "r":
                f = clamp(k * max(D, R) - (434 - i))
            else:
                f = clamp((k - 0.8) / 0.2)
            (x, y), = cam([(x0 + c * step, y0 + r * step)])
            dot(img, x, y, cam.s(10), LINE)
            if f > 0:
                dot(img, x, y, cam.s(11) * (0.4 + 0.6 * ease_back(f)), {"d": BLUE, "r": RED, "u": GREY}[lab])
    # majority marker after seat 218 (column 14, row 7)
    mx = x0 + 14.5 * step
    (ax, ay0), (_, ay1) = cam([(mx, y0 - 30), (mx, y0 + rows * step)])
    comp(img, stroke_mask([(ax, ay0), (ax, ay1)], 4), GOLD, prog(t, 0.8, 1.2))
    T(img, "過半 218", mx, y0 - 58, 32, GOLD, cam, a=prog(t, 0.8, 1.2))
    for x, lab, n, col in ((250, "民主黨", D, BLUE), (830, "共和黨", R, RED)):
        T(img, str(countup(n, k)), x, 1000, 140, col, cam)
        T(img, lab + "（已判定）", x, 1105, 38, TXT, cam)
    T(img, f"計票中 約 {U} 席", 540, 1200, 44, TXT, cam, a=prog(t, 3.0, 3.4))
    T(img, "依 AP 11/4 統計，最終席次仍會變動", 540, 1270, 30, MUTE, cam, name="sans", a=prog(t, 3.2, 3.6))

def s_divided(img, t, cam):
    # balance beam: tilts then settles level (damped)
    ang = 0.22 * math.exp(-t * 0.9) * math.cos(t * 3.2) if t > 0.3 else 0.22
    cx, cy = 540, 560
    L = 330
    c, s = math.cos(ang), math.sin(ang)
    ends = [(cx - L * c, cy - L * s), (cx + L * c, cy + L * s)]
    comp(img, poly_mask(cam([(cx, cy), (cx - 60, 900), (cx + 60, 900)])), CARD2)
    comp(img, stroke_mask(cam([ends[0], ends[1]]), 10), TXT)
    dot(img, *cam([(cx, cy)])[0], cam.s(16), GOLD)
    for j, (ex, ey) in enumerate(ends):
        col = RED if j == 0 else BLUE
        comp(img, stroke_mask(cam([(ex, ey), (ex - 90, ey + 150)]), 3), MUTE)
        comp(img, stroke_mask(cam([(ex, ey), (ex + 90, ey + 150)]), 3), MUTE)
        comp(img, poly_mask(cam([(ex - 120, ey + 150), (ex + 120, ey + 150), (ex + 80, ey + 200), (ex - 80, ey + 200)])), col)
        T(img, "白宮" if j == 0 else "國會兩院", ex, ey + 250, 52, TXT, cam)
        T(img, "共和黨" if j == 0 else "民主黨", ex, ey + 315, 40, col * 0.6 + TXT * 0.4, cam)
    T(img, "分裂政府", 540, 1000, 96, GOLD, cam, a=prog(t, 1.5, 2.0))
    # veto override thresholds
    a = prog(t, 2.4, 2.9)
    T(img, "推翻總統否決需三分之二", 540, 1110, 40, TXT, cam, a=a)
    for j, (lab, have, need, tot) in enumerate((("眾議院", 228, 290, 435), ("參議院", 54, 67, 100))):
        y = 1190 + j * 90; x0, x1 = 300, 960
        T(img, lab, 120, y, 38, TXT, cam, anchor="lm", a=a)
        card(img, x0, y - 18, x1, y + 18, cam, a, LINE, 18)
        f = have / tot * prog(t, 2.6, 3.6)
        card(img, x0, y - 18, x0 + (x1 - x0) * f, y + 18, cam, a, BLUE, 18)
        nx = x0 + (x1 - x0) * need / tot
        comp(img, stroke_mask(cam([(nx, y - 32), (nx, y + 32)]), 5), GOLD, a)
        T(img, f"{have} / 需 {need}", nx + 12, y - 45, 28, GOLD, cam, anchor="lm", name="sans", a=a)

def s_policy(img, t, cam):
    items = [("預算", "臨時撥款撐到 12/11", "跛腳鴨國會 11/9 返院；新國會 2027 年 1 月就任", 0.2),
             ("關稅", "主導權仍在白宮", "國會席次不足推翻否決，預期以聽證、監督為主", 2.3),
             ("科技", "AI・資料中心・晶片出口", "市場預期國會審查加強，立大法仍需兩黨合作", 4.4)]
    for j, (tag, head, body, t0) in enumerate(items):
        kk = ease_out(clamp((t - t0) / 0.5)); y = 370 + j * 325
        x = 72 + (1 - kk) * 120
        card(img, x, y, x + 936, y + 300, cam, kk, CARD2 if t > t0 + 0.3 else CARD)
        comp(img, poly_mask(cam(rrect_pts(x + 30, y + 34, x + 170, y + 92, 14))), GOLD, kk)
        T(img, tag, x + 100, y + 61, 38, BG0, cam, a=kk)
        T(img, head, x + 30, y + 155, 54, TXT, cam, anchor="lm", a=kk)
        T(img, body, x + 30, y + 235, 30, MUTE, cam, anchor="lm", name="sans", a=kk)

def s_market(img, t, cam):
    T(img, "11/4 美東盤中（收盤以官方為準）", 540, 385, 34, MUTE, cam, name="sans")
    tiles = [("道瓊工業指數", "+2.4%～2.9%", True, "約 +1,240～1,515 點"),
             ("10 年期美債殖利率", "≈ 4.9%", False, "避險買盤推升債價"),
             ("美元指數", "≈ −0.3%", False, "美元對主要貨幣走弱")]
    for j, (name, val, up, note) in enumerate(tiles):
        kk = ease_back(clamp((t - 0.3 - 0.9 * j) / 0.5)); y = 440 + j * 285
        card(img, 72, y, 1008, y + 250, cam, kk, CARD2)
        T(img, name, 112, y + 60, 40, MUTE, cam, anchor="lm", name="sans", a=kk)
        T(img, val, 112, y + 138, 88, TXT if not up else GOLD, cam, anchor="lm", a=kk)
        T(img, note, 112, y + 215, 28, MUTE, cam, anchor="lm", name="sans", a=kk)
        bounce = 10 * math.sin(t * 5 + j) * kk
        arrow(img, 900, y + 130 + bounce, 60, up, GOLD if up else MUTE, cam, kk)
    T(img, "開票初期美股期貨一度下跌，之後翻揚", 540, 1340, 36, TXT, cam, name="sans", a=prog(t, 3.2, 3.7))

TW = [(121.54, 25.30), (121.75, 25.16), (122.00, 25.01), (121.86, 24.75), (121.85, 24.45), (121.70, 24.20), (121.62, 23.98),
      (121.50, 23.50), (121.38, 23.10), (121.15, 22.75), (120.92, 22.40), (120.85, 21.90), (120.72, 21.93), (120.62, 22.30),
      (120.42, 22.50), (120.28, 22.60), (120.15, 22.90), (120.08, 23.05), (120.12, 23.40), (120.15, 23.70), (120.30, 23.95),
      (120.45, 24.20), (120.65, 24.55), (120.90, 24.85), (121.05, 25.05), (121.25, 25.10), (121.40, 25.20)]
PARKS = [("竹科", 120.99, 24.78), ("中科", 120.61, 24.21), ("南科", 120.27, 23.10), ("高雄", 120.35, 22.75)]
def geo(lon, lat, cx=275, cy=905, s=290):
    return cx + (lon - 121.0) * s * math.cos(math.radians(23.7)), cy - (lat - 23.6) * s

def s_taiwan(img, t, cam):
    pts = np.array([geo(*p) for p in TW])
    k = prog(t, 0.1, 1.4)
    comp(img, poly_mask(cam(pts)), CARD2, k)
    n = len(pts); m = max(2, int(n * k) + 1)
    path = np.vstack([pts, pts[:1]])[:m + 1]
    comp(img, stroke_mask(cam(path), 5), GOLD)
    for j, (nm, lo, la) in enumerate(PARKS):
        kk = ease_back(clamp((t - 1.2 - 0.3 * j) / 0.4))
        if kk <= 0:
            continue
        (x, y), = cam([geo(lo, la)])
        pulse = 1 + 0.5 * ((t * 1.5 + j * 0.3) % 1)
        dot(img, x, y, cam.s(22) * pulse, GOLD, 0.25 * kk * (2 - pulse))
        dot(img, x, y, cam.s(11) * kk, GOLD)
        T(img, nm, geo(lo, la)[0] + 28, geo(lo, la)[1], 30, TXT, cam, anchor="lm", name="sans", a=kk)
    rows = [("加權指數 11/4 收盤", "42,948.91", "−358.63（−0.83%）"), ("台積電 11/4 收盤", "2,260 元", "−35 元（−1.53%）")]
    for j, (a_, b_, c_) in enumerate(rows):
        kk = ease_out(clamp((t - 0.6 - 0.8 * j) / 0.5)); y = 400 + j * 290
        card(img, 560, y, 1008, y + 250, cam, kk, CARD2)
        T(img, a_, 592, y + 55, 32, MUTE, cam, anchor="lm", name="sans", a=kk)
        T(img, b_, 592, y + 135, 72, TXT, cam, anchor="lm", a=kk)
        T(img, c_, 592, y + 210, 36, MUTE * 0.4 + TXT * 0.6, cam, anchor="lm", a=kk)
    a = prog(t, 3.0, 3.5)
    card(img, 560, 1010, 1008, 1250, cam, a, CARD)
    T(img, "半導體關稅：", 592, 1060, 34, GOLD, cam, anchor="lm", a=a)
    T(img, "主導權仍在白宮", 592, 1110, 34, TXT, cam, anchor="lm", name="sans", a=a)
    T(img, "選後焦點：AI 審查", 592, 1170, 34, GOLD, cam, anchor="lm", a=a)
    T(img, "牽動晶片供應鏈", 592, 1215, 34, TXT, cam, anchor="lm", name="sans", a=a)
    T(img, "註：11/4 台股交易時段多在開票過程中", 540, 1340, 30, MUTE, cam, name="sans", a=prog(t, 3.6, 4.0))

def s_history(img, t, cam):
    years = list(range(1950, 2023, 4))       # 19 midterm years
    for j, y_ in enumerate(years):
        c, r = j % 5, j // 5
        x = 150 + c * 195; y = 430 + r * 145
        kk = ease_back(clamp((t - 0.3 - 0.11 * j) / 0.35))
        card(img, x - 80, y - 55, x + 80, y + 55, cam, 1.0, CARD)
        card(img, x - 80, y - 55, x + 80, y + 55, cam, kk, CARD2, border=GOLD)
        T(img, str(y_), x, y - 15, 34, TXT, cam, name="sans", a=0.5 + 0.5 * kk)
        T(img, "▲ 上漲", x, y + 25, 26, GOLD, cam, a=kk)
    n = int(clamp((t - 0.3) / (0.11 * 19 + 0.3)) * 19)
    T(img, f"{n}/19", 830, 1010, 110, GOLD, cam)
    T(img, "S&P 500 期中選舉後 12 個月", 540, 1120, 40, TXT, cam, a=prog(t, 1.0, 1.5))
    T(img, "平均約 +16.6%（統計口徑不同：12%～18%）", 540, 1175, 32, MUTE, cam, name="sans", a=prog(t, 1.5, 2.0))
    T(img, "台股：1998 年後 7 次皆漲，平均約 +9.6%", 540, 1245, 32, MUTE, cam, name="sans", a=prog(t, 2.5, 3.0))
    T(img, "過去表現不代表未來", 540, 1335, 46, TXT, cam, a=prog(t, 4.0, 4.5))

def s_outro(img, t, cam):
    pts = [("1", "分裂政府", "白宮共和黨・國會民主黨"), ("2", "立法變慢", "法案需兩黨協商"), ("3", "監督變多", "關稅、AI、晶片受國會檢視")]
    for j, (n, h, b) in enumerate(pts):
        kk = ease_out(clamp((t - 0.3 - 0.6 * j) / 0.5)); y = 340 + j * 230
        card(img, 72 + (1 - kk) * 80, y, 1008, y + 200, cam, kk, CARD2)
        dot(img, *cam([(160, y + 100)])[0], cam.s(48) * kk, GOLD)
        T(img, n, 160, y + 100, 52, BG0, cam, a=kk)
        T(img, h, 240, y + 70, 56, TXT, cam, anchor="lm", a=kk)
        T(img, b, 240, y + 145, 32, MUTE, cam, anchor="lm", name="sans", a=kk)
    a = prog(t, 2.5, 3.0)
    card(img, 72, 1060, 1008, 1360, cam, a, CARD, border=LINE)
    T(img, "內容僅供參考，不構成投資建議", 540, 1130, 40, TXT, cam, a=a)
    T(img, "全片以程式逐格繪製・未使用 AI 生圖或影片模型", 540, 1205, 30, MUTE, cam, name="sans", a=a)
    T(img, "本片使用 AI 輔助製作，由真人選題與審核", 540, 1260, 30, MUTE, cam, name="sans", a=a)
    T(img, f"資料截至 {ctx_date[0]}（美東時間）", 540, 1315, 30, GOLD, cam, name="sans", a=a)

ctx_date = ["2026/11/04"]
SCENES = dict(hook=s_hook, senate=s_senate, house=s_house, divided=s_divided, policy=s_policy, market=s_market,
              taiwan=s_taiwan, history=s_history, outro=s_outro)
MOVES = dict(hook="push", senate="push", house="panr", divided="pull", policy="rise", market="push", taiwan="panl",
             history="rise", outro="pull")

def render(ctx):
    ctx_date[0] = ctx.tl["data_date"]
    img = background()
    cam = camera_move(ctx.t, ctx.dur, MOVES[ctx.seg["id"]], 0.05, seed=ctx.seg["index"])
    chrome_cam = Cam(z=1.0, px=cam.px * 0.3, py=cam.py * 0.3)
    chrome(img, ctx, chrome_cam)
    SCENES[ctx.seg["id"]](img, ctx.t, cam)
    subtitle(img, ctx)
    return img
