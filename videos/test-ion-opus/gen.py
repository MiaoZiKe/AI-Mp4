# test-ion-opus 產生器：python3 videos/test-ion-opus/gen.py → model.json、script.json、timeline.json、storyboard.json
# 離子佈植機：離子源 → 加速管（分段電極環）→ 分析磁鐵（90° 轉彎、濾掉太重太輕的）→ 射束管線 → 掃描板 → 終端站（晶圓上下機械掃描）→ 剖面放大（摻雜層）
# 單位約 20 cm；地板 y=0；射束高度 y=5。所有座標在這裡算，不手改 json。
import json, math, os, random
D = os.path.dirname(os.path.abspath(__file__))
R2 = lambda v: round(v, 3)
rnd = random.Random(20261120)
FPS = 30; TOTAL = 420

parts, layers, acts, anchors = [], {}, {}, {}
def L(lid, **kw):
    if lid not in layers: layers[lid] = {"id": lid, "z": 0, "k": 0, **kw}
    return lid
def P(layer, shape, size, pos, mat, rot=None, at=None, pid=None, **kw):
    L(layer)
    d = {"layer": layer, "shape": shape, "size": [R2(x) for x in size], "pos": [R2(x) for x in pos], "mat": mat}
    if rot: d["rot"] = [R2(x) for x in rot]
    if at: d["at"] = [[R2(c) for c in a] for a in at]
    if pid: d["id"] = pid
    d.update(kw); parts.append(d); return d
def box(layer, x0, x1, y0, y1, z0, z1, mat, **kw):
    return P(layer, "box", [x1 - x0, y1 - y0, z1 - z0], [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], mat, **kw)

# ── 色票與材質 ──
pal = {}
mats = {
  "floorT": {"kind": "std", "color": "#E3E9F1", "rough": 0.55, "metal": 0},
  "floorP": {"kind": "std", "color": "#CBD4E0", "rough": 0.8, "metal": 0},
  "floorG": {"kind": "unlit", "color": "#A8B4C6"},
  "ceilF": {"kind": "unlit", "color": "#F7FAFE"},
  "ceilG": {"kind": "unlit", "color": "#C4CEDC"},
  "ceilL": {"kind": "unlit", "color": "#FFFFFF"},
  "wall": {"kind": "std", "color": "#DCE4EE", "rough": 0.7, "metal": 0},
  "wallSeam": {"kind": "unlit", "color": "#BFCADA"},
  "farTool": {"kind": "std", "color": "#C9D3E1", "rough": 0.6, "metal": 0},
  "farTool2": {"kind": "std", "color": "#B7C3D4", "rough": 0.6, "metal": 0},
  "farDark": {"kind": "std", "color": "#8E9BB0", "rough": 0.6, "metal": 0},
  "cab": {"kind": "std", "color": "#EEF2F7", "rough": 0.45, "metal": 0.1},
  "cabPanel": {"kind": "phys", "color": "#F7F9FC", "rough": 0.3, "metal": 0, "clearcoat": 0.5, "env": 0.5},
  "cabDark": {"kind": "std", "color": "#4A5873", "rough": 0.5, "metal": 0.3},
  "seam": {"kind": "unlit", "color": "#7F8CA3"},
  "vent": {"kind": "unlit", "color": "#5D6A82"},
  "screw": {"kind": "std", "color": "#9AA8BE", "rough": 0.25, "metal": 0.9, "env": 0.6},
  "steel": {"kind": "std", "color": "#A9B6CA", "rough": 0.28, "metal": 0.88, "env": 0.7, "tex": "brushed", "texScale": 2},
  "steel2": {"kind": "std", "color": "#7F8CA3", "rough": 0.35, "metal": 0.8, "env": 0.6},
  "flange": {"kind": "std", "color": "#C3CDDC", "rough": 0.22, "metal": 0.92, "env": 0.9},
  "ceramic": {"kind": "phys", "color": "#F4F1EA", "rough": 0.25, "metal": 0, "clearcoat": 0.6, "env": 0.4},
  "glass": {"kind": "phys", "color": "#CFE2F7", "rough": 0.08, "metal": 0, "clearcoat": 1, "opacity": 0.22, "env": 0.6},
  "glassTube": {"kind": "phys", "color": "#D6E6F8", "rough": 0.08, "metal": 0, "clearcoat": 1, "opacity": 0.18, "env": 0.5},
  "yoke": {"kind": "std", "color": "#33415C", "rough": 0.45, "metal": 0.55, "env": 0.5},
  "yoke2": {"kind": "std", "color": "#46557A", "rough": 0.4, "metal": 0.5, "env": 0.5},
  "pole": {"kind": "std", "color": "#8A97AE", "rough": 0.3, "metal": 0.85, "env": 0.7},
  "coil": {"kind": "std", "color": "#D9873A", "rough": 0.3, "metal": 0.92, "env": 0.8, "tex": "brushed", "texScale": 0.8},
  "coilLine": {"kind": "unlit", "color": "#8F4E16"},
  "chamberIn": {"kind": "std", "color": "#5B6A86", "rough": 0.5, "metal": 0.5},
  "hvY": {"kind": "unlit", "color": "#FFC21A"},
  "hvK": {"kind": "unlit", "color": "#1E2433"},
  "ledG": {"kind": "std", "color": "#14C38E", "emissive": "#14C38E", "ei": 0.9},
  "ledB": {"kind": "std", "color": "#1F6FEB", "emissive": "#1F6FEB", "ei": 0.8},
  "ledA": {"kind": "std", "color": "#FF9F1C", "emissive": "#FF9F1C", "ei": 0.6},
  "ledR": {"kind": "std", "color": "#C9372C", "emissive": "#C9372C", "ei": 0.3},
  "lampOff": {"kind": "std", "color": "#C9D2DF", "rough": 0.3},
  "screen": {"kind": "screen", "color": "#2E6FD8", "ei": 0.7},
  "screenUI": {"kind": "unlit", "color": "#BFD8FF"},
  "pump": {"kind": "std", "color": "#B9C4D4", "rough": 0.3, "metal": 0.8, "env": 0.6},
  "pumpDark": {"kind": "std", "color": "#4E5A72", "rough": 0.5, "metal": 0.3},
  "hose": {"kind": "std", "color": "#8C99AF", "rough": 0.4, "metal": 0.7},
  "duct": {"kind": "std", "color": "#C7D0DD", "rough": 0.35, "metal": 0.7, "env": 0.5},
  "plasma": {"kind": "unlit", "color": "#C77DFF"},
  "srcIn": {"kind": "std", "color": "#3B465E", "rough": 0.5, "metal": 0.5},
  "beam": {"kind": "unlit", "color": "#FFB24A", "opacity": 0.28},
  "ion": {"kind": "std", "color": "#FF7A1A", "emissive": "#FF7A1A", "ei": 0.55, "rough": 0.3},
  "ionHeavy": {"kind": "std", "color": "#7C5CD6", "emissive": "#7C5CD6", "ei": 0.45, "rough": 0.3},
  "ionLight": {"kind": "std", "color": "#12A88A", "emissive": "#12A88A", "ei": 0.45, "rough": 0.3},
  "plus": {"kind": "unlit", "color": "#FFFFFF"},
  "tr1": {"kind": "unlit", "color": "#FF8A24", "opacity": 0.7},
  "tr2": {"kind": "unlit", "color": "#FFA04A", "opacity": 0.45},
  "tr3": {"kind": "unlit", "color": "#FFB873", "opacity": 0.25},
  "trH1": {"kind": "unlit", "color": "#9C84E6", "opacity": 0.5}, "trH2": {"kind": "unlit", "color": "#B6A5EE", "opacity": 0.3}, "trH3": {"kind": "unlit", "color": "#CFC4F5", "opacity": 0.16},
  "trL1": {"kind": "unlit", "color": "#3FC4A8", "opacity": 0.5}, "trL2": {"kind": "unlit", "color": "#7AD8C4", "opacity": 0.3}, "trL3": {"kind": "unlit", "color": "#B0E9DC", "opacity": 0.16},
  "spark": {"kind": "unlit", "color": "#FFE066"},
  "sparkW": {"kind": "unlit", "color": "#FFFFFF"},
  "wafer": {"kind": "phys", "color": "#B4C2DA", "rough": 0.08, "metal": 0.45, "clearcoat": 1, "env": 1.0},
  "die": {"kind": "std", "color": "#7FA4E0", "rough": 0.22, "metal": 0.55, "tex": "traces", "texScale": 0.35, "env": 0.9},
  "platen": {"kind": "std", "color": "#5D6A82", "rough": 0.4, "metal": 0.6},
  "dose": {"kind": "unlit", "color": "#FF9F1C", "opacity": 0.32},
  "spot": {"kind": "unlit", "color": "#FFE7A8"},
  "si": {"kind": "std", "color": "#AFC0DA", "rough": 0.45, "metal": 0.25},
  "siFace": {"kind": "unlit", "color": "#D7E2F2"},
  "lattice": {"kind": "unlit", "color": "#8EA3C4"},
  "oxideTop": {"kind": "unlit", "color": "#EEF3FA"},
  "d1": {"kind": "unlit", "color": "#FFE3B8", "opacity": 0.85}, "d2": {"kind": "unlit", "color": "#FFC77A", "opacity": 0.85}, "d3": {"kind": "unlit", "color": "#FF9F1C", "opacity": 0.9},
  "insetFrame": {"kind": "unlit", "color": "#1F6FEB"},
  "rp": {"kind": "unlit", "color": "#C2441F"},
  "shadowC": {"kind": "unlit", "color": "#9AA7BB", "opacity": 0.35},
  "stripeY": {"kind": "unlit", "color": "#F5B700"}, "stripeK": {"kind": "unlit", "color": "#2A2F3A"},
}
for k in list(mats): pal[k] = mats[k]["color"]

# ── 場景：高架地板、天花板過濾器格、背牆、遠處機台 ──
BG = "room"
X0, X1, Z0, Z1 = -30, 30, -26, 22
box(BG, X0, X1, -0.3, 0, Z0, Z1, "floorT")
T = 2.4
nx = int((X1 - X0) / T); nz = int((Z1 - Z0) / T)
# 地板格線（細長方條）＋每塊磚中間的多孔區
P(BG, "box", [X1 - X0, 0.012, 0.05], [0, 0.006, 0], "floorG", at=[[0, 0, Z0 + i * T] for i in range(nz + 1)])
P(BG, "box", [0.05, 0.012, Z1 - Z0], [0, 0.006, (Z0 + Z1) / 2], "floorG", at=[[X0 + i * T, 0, -(Z0 + Z1) / 2] for i in range(nx + 1)])
perf = [[X0 + (i + 0.5) * T, 0, Z0 + (j + 0.5) * T] for i in range(nx) for j in range(nz) if (i + j) % 3 == 0]
P(BG, "box", [1.5, 0.008, 1.5], [0, 0.004, 0], "floorP", at=perf)
# 天花板（朝下的面，從上方看不到）：過濾器面板、T 型骨架、燈條
CY = 14.5
P(BG, "plane", [X1 - X0, Z1 - Z0], [0, CY, (Z0 + Z1) / 2], "ceilF", rot=[90, 0, 0])
P(BG, "plane", [X1 - X0, 0.12], [0, CY - 0.01, 0], "ceilG", rot=[90, 0, 0], at=[[0, 0, Z0 + i * T] for i in range(nz + 1)])
P(BG, "plane", [0.12, Z1 - Z0], [0, CY - 0.01, (Z0 + Z1) / 2], "ceilG", rot=[90, 0, 0], at=[[X0 + i * T, 0, -(Z0 + Z1) / 2] for i in range(nx + 1)])
P(BG, "plane", [1.6, 1.6], [0, CY - 0.005, 0], "ceilG", rot=[90, 0, 0], at=[[X0 + (i + 0.5) * T, 0, Z0 + (j + 0.5) * T] for i in range(nx) for j in range(nz) if (i + j) % 2 == 1], r=0.05)
P(BG, "plane", [0.3, Z1 - Z0], [0, CY - 0.02, (Z0 + Z1) / 2], "ceilL", rot=[90, 0, 0], at=[[X0 + (i + 0.5) * T * 3, 0, -(Z0 + Z1) / 2] for i in range(int(nx / 3))])
# 背牆（朝前）＋牆面分格
P(BG, "plane", [X1 - X0, CY], [0, CY / 2, Z0], "wall")
P(BG, "plane", [0.06, CY], [0, CY / 2, Z0 + 0.01], "wallSeam", at=[[X0 + i * 3.0, 0, 0] for i in range(21)])
P(BG, "plane", [X1 - X0, 0.06], [0, 3.0, Z0 + 0.01], "wallSeam")
# 遠處的機台輪廓（被霧淡化）
far = []
for (x, z, w, h, d) in [(-22, -19, 6, 7.5, 4), (-13, -21, 5, 6, 3.5), (-5, -20.5, 7, 8.5, 4), (6, -21, 5, 6.5, 3.5), (15, -19.5, 7, 7.8, 4.5), (24, -18, 5, 6, 4), (-25, 2, 4, 7, 6), (25, 4, 4, 7.5, 7)]:
    box(BG, x - w / 2, x + w / 2, 0, h, z - d / 2, z + d / 2, "farTool")
    box(BG, x - w / 2 + 0.3, x + w / 2 - 0.3, h * 0.45, h * 0.92, z + d / 2, z + d / 2 + 0.04, "farTool2")
    box(BG, x - w / 2, x + w / 2, 0, 0.5, z + d / 2, z + d / 2 + 0.05, "farDark")
    box(BG, x + w / 2 - 1.2, x + w / 2 - 0.4, h * 0.6, h * 0.75, z + d / 2 + 0.05, z + d / 2 + 0.08, "screen")
# 建築柱
for (x, z) in [(-18, -12), (18, -12)]:
    box(BG, x - 0.7, x + 0.7, 0, CY, z - 0.7, z + 0.7, "wall")

# ── 共用小零件 ──
def screws_z(layer, pts, z, r=0.055):  # 正面（+z）螺絲
    P(layer, "cyl", [r, 0.04], [0, 0, z], "screw", at=[[x, y, 0] for x, y in pts])
def screws_x(layer, pts, x, r=0.055):  # 側面（+x）螺絲
    P(layer, "cyl", [r, 0.04], [x, 0, 0], "screw", rot=[0, 90, 0], at=[[0, y, z] for y, z in pts])
def panel_front(layer, x0, x1, y0, y1, z, cols=2, rows=1, vent=False):
    """+z 面上的分件面板：面板之間有縫、四角螺絲、可加百葉"""
    g = 0.05; w = (x1 - x0) / cols; h = (y1 - y0) / rows; sc = []
    for i in range(cols):
        for j in range(rows):
            a, b, c, d = x0 + i * w + g, x0 + (i + 1) * w - g, y0 + j * h + g, y0 + (j + 1) * h - g
            box(layer, a, b, c, d, z, z + 0.04, "cabPanel")
            sc += [(a + 0.12, c + 0.12), (b - 0.12, c + 0.12), (a + 0.12, d - 0.12), (b - 0.12, d - 0.12)]
            if vent and j == 0:
                P(layer, "box", [b - a - 0.5, 0.04, 0.02], [(a + b) / 2, 0, z + 0.05], "vent", at=[[0, c + 0.35 + k * 0.14, 0] for k in range(5)])
    box(layer, x0, x1, y0, y1, z - 0.02, z + 0.005, "seam")
    screws_z(layer, sc, z + 0.06)
def panel_side(layer, z0, z1, y0, y1, x, cols=2, rows=1, vent=False):
    g = 0.05; w = (z1 - z0) / cols; h = (y1 - y0) / rows; sc = []
    for i in range(cols):
        for j in range(rows):
            a, b, c, d = z0 + i * w + g, z0 + (i + 1) * w - g, y0 + j * h + g, y0 + (j + 1) * h - g
            box(layer, x, x + 0.04, c, d, a, b, "cabPanel")
            sc += [(c + 0.12, a + 0.12), (c + 0.12, b - 0.12), (d - 0.12, a + 0.12), (d - 0.12, b - 0.12)]
            if vent and j == 0:
                P(layer, "box", [0.02, 0.04, b - a - 0.5], [x + 0.05, 0, (a + b) / 2], "vent", at=[[0, c + 0.35 + k * 0.14, 0] for k in range(5)])
    box(layer, x - 0.005, x + 0.02, y0, y1, z0, z1, "seam")
    screws_x(layer, sc, x + 0.06)
def hv_sign(layer, x, y, z, s=0.55, face="z"):
    """高壓警示：黃色菱形＋黑框＋黑色閃電"""
    if face == "z":
        P(layer, "box", [s, s, 0.02], [x, y, z], "hvK", rot=[0, 0, 45])
        P(layer, "box", [s * 0.84, s * 0.84, 0.02], [x, y, z + 0.012], "hvY", rot=[0, 0, 45])
        for (dx, dy, ln, a) in [(0.03, 0.09, 0.26, 70), (-0.01, -0.01, 0.16, 0), (-0.04, -0.11, 0.26, 70)]:
            P(layer, "box", [ln * s / 0.55, 0.045 * s / 0.55, 0.02], [x + dx * s / 0.55, y + dy * s / 0.55, z + 0.024], "hvK", rot=[0, 0, a])
    else:
        P(layer, "box", [0.02, s, s], [x, y, z], "hvK", rot=[45, 0, 0])
        P(layer, "box", [0.02, s * 0.84, s * 0.84], [x + 0.012, y, z], "hvY", rot=[45, 0, 0])
        for (dz, dy, ln, a) in [(-0.03, 0.09, 0.26, 70), (0.01, -0.01, 0.16, 0), (0.04, -0.11, 0.26, 70)]:
            P(layer, "box", [0.02, 0.045 * s / 0.55, ln * s / 0.55], [x + 0.024, y + dy * s / 0.55, z + dz * s / 0.55], "hvK", rot=[a, 0, 0])
def flange_x(layer, x, y, z, ro, ri, t=0.16, n=10):
    P(layer, "tube", [ro, ri, t], [x, y, z], "flange", rot=[0, 90, 0])
    rb = (ro + ri) / 2 + 0.04
    P(layer, "cyl", [0.045, t + 0.08], [x, y, z], "screw", rot=[0, 90, 0], at=[[0, rb * math.cos(2 * math.pi * k / n), rb * math.sin(2 * math.pi * k / n)] for k in range(n)])
def flange_z(layer, x, y, z, ro, ri, t=0.16, n=10):
    P(layer, "tube", [ro, ri, t], [x, y, z], "flange")
    rb = (ro + ri) / 2 + 0.04
    P(layer, "cyl", [0.045, t + 0.08], [x, y, z], "screw", at=[[rb * math.cos(2 * math.pi * k / n), rb * math.sin(2 * math.pi * k / n), 0] for k in range(n)])
def rod(layer, a, b, r, mat, **kw):
    dx, dy, dz = b[0] - a[0], b[1] - a[1], b[2] - a[2]; ln = math.sqrt(dx * dx + dy * dy + dz * dz)
    # 圓柱預設沿 z：先繞 x 轉 rx（抬頭），再繞 y 轉 ry
    ry = math.degrees(math.atan2(dx, dz)); rx = math.degrees(math.atan2(-dy, math.hypot(dx, dz)))
    return P(layer, "cyl", [r, ln], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], mat, rot=[rx, ry, 0], **kw)
def pipe(layer, pts, r, mat="hose"):
    for a, b in zip(pts, pts[1:]): rod(layer, a, b, r, mat)
    for p in pts[1:-1]: P(layer, "sphere", [r * 1.02], p, mat)
def contact(layer, x0, x1, z0, z1):  # 腳下的接觸陰影
    P(layer, "plane", [x1 - x0 + 0.5, z1 - z0 + 0.5], [(x0 + x1) / 2, 0.02, (z0 + z1) / 2], "shadowC", rot=[-90, 0, 0], r=0.4)

YB = 5.0  # 射束高度
M = "tool"
# ── 1. 離子源與高壓端子櫃（左前）──
SX = -7.25  # 引出口
box(M, -11.2, -6.3, 0, 3.7, 1.6, 6.4, "cab"); contact(M, -11.2, -6.3, 1.6, 6.4)
panel_front(M, -11.1, -6.4, 0.25, 3.55, 6.4, cols=3, rows=2, vent=True)
panel_side(M, 1.7, 6.3, 0.25, 3.55, -6.3, cols=2, rows=2, vent=True)
box(M, -11.2, -6.3, 3.7, 3.85, 1.6, 6.4, "cabDark")
hv_sign(M, -8.75, 2.75, 6.47, 0.7)
hv_sign(M, -6.23, 2.75, 4.0, 0.7, face="x")
# 狀態燈列
P(M, "cyl", [0.07, 0.05], [-10.6, 3.3, 6.47], "ledG"); P(M, "cyl", [0.07, 0.05], [-10.35, 3.3, 6.47], "ledB"); P(M, "cyl", [0.07, 0.05], [-10.1, 3.3, 6.47], "ledA")
# 地上的黃黑警戒線（高壓區）
for i in range(26):
    x = -11.6 + i * 0.4
    P(M, "box", [0.2, 0.012, 0.16], [x, 0.012, 6.9], "stripeY" if i % 2 == 0 else "stripeK")
# 高壓籠：四根柱＋上框（壓克力板很淡）
for (x, z) in [(-11.1, 1.7), (-6.4, 1.7), (-11.1, 6.3), (-6.4, 6.3)]:
    box(M, x - 0.08, x + 0.08, 3.85, 7.6, z - 0.08, z + 0.08, "steel2")
box(M, -11.1, -6.4, 7.5, 7.62, 1.62, 1.78, "steel2"); box(M, -11.1, -6.4, 7.5, 7.62, 6.22, 6.38, "steel2")
box(M, -11.18, -11.02, 7.5, 7.62, 1.7, 6.3, "steel2"); box(M, -6.48, -6.32, 7.5, 7.62, 1.7, 6.3, "steel2")
hv_sign(M, -6.4, 6.9, 6.39, 0.42)
# 離子源腔體（看得到裡面的電漿）
box(M, -9.9, -7.6, 3.9, 6.1, 2.9, 5.1, "steel")
box(M, -9.6, -7.9, 4.3, 5.7, 5.1, 5.14, "seam")
P(M, "plane", [1.5, 1.1], [-8.75, 5.0, 5.16], "glass", r=0.08)
box(M, -9.3, -8.2, 4.6, 5.4, 4.2, 4.9, "srcIn")
P("plasma", "box", [0.9, 0.5, 0.4], [-8.75, 5.0, 4.75], "plasma", pid="plasmaCore")
P(M, "tube", [0.85, 0.62, 0.1], [-8.75, 5.0, 5.18], "flange")
screws_z(M, [(-9.75, 4.05), (-7.75, 4.05), (-9.75, 5.95), (-7.75, 5.95)], 5.15)
flange_x(M, -7.55, YB, 4.0, 0.95, 0.35, 0.2, 12)
# 頂上的燈絲饋通、氣體管線
P(M, "cyl", [0.12, 0.5], [-8.75, 6.35, 4.0], "ceramic", rot=[90, 0, 0], at=[[-0.45, 0, 0], [0.45, 0, 0]])
P(M, "cyl", [0.06, 0.25], [-8.75, 6.7, 4.0], "flange", rot=[90, 0, 0], at=[[-0.45, 0, 0], [0.45, 0, 0]])
pipe(M, [(-9.9, 5.4, 3.4), (-10.6, 5.4, 3.4), (-10.6, 8.3, 3.4), (-10.6, 8.3, -6.5)], 0.07, "steel")
pipe(M, [(-9.9, 5.6, 3.8), (-10.85, 5.6, 3.8), (-10.85, 8.0, 3.8), (-10.85, 8.0, -6.5)], 0.06, "hose")
# 引出電極（兩片帶狹縫的板）
for x in [-7.15, -6.95]:
    box(M, x - 0.03, x + 0.03, 4.25, 4.82, 3.25, 4.75, "steel2"); box(M, x - 0.03, x + 0.03, 5.18, 5.75, 3.25, 4.75, "steel2")
# 燈塔
for k, mt in enumerate(["ledG", "lampOff", "ledR"]):
    P(M if k else "lamp", "cyl", [0.16, 0.26], [-10.7, 4.05 + k * 0.27, 6.0], mt, rot=[90, 0, 0], pid=("lampG" if k == 0 else None))
P(M, "cyl", [0.05, 0.3], [-10.7, 3.95, 6.0], "steel2", rot=[90, 0, 0])

# ── 2. 加速管：分段電極環＋玻璃絕緣段（看得到裡面）──
TX0, TX1, TZ = -6.85, 1.0, 4.0
n_el = 18
for k in range(n_el + 1):
    x = TX0 + (TX1 - TX0) * k / n_el
    P(M, "tube", [0.74 if k % 3 else 0.86, 0.52, 0.06], [x, YB, TZ], "flange", rot=[0, 90, 0])
P(M, "tube", [0.6, 0.52, TX1 - TX0], [(TX0 + TX1) / 2, YB, TZ], "glassTube", rot=[0, 90, 0])
# 均壓電阻（外側細桿）與絕緣支柱
for a in [40, 140, 220]:
    r = 0.78
    rod(M, (TX0, YB + r * math.sin(math.radians(a)), TZ + r * math.cos(math.radians(a))), (TX1, YB + r * math.sin(math.radians(a)), TZ + r * math.cos(math.radians(a))), 0.03, "ceramic")
flange_x(M, TX1 + 0.12, YB, TZ, 1.05, 0.45, 0.22, 12)
for x in [-5.2, -1.6]:
    P(M, "cyl", [0.16, YB - 0.9], [x, (YB - 0.9) / 2, TZ], "ceramic", rot=[90, 0, 0])
    P(M, "tube", [0.24, 0.16, 0.08], [x, 0.0, TZ], "steel2", rot=[90, 0, 0], at=[[0, k * 0.5 + 0.6, 0] for k in range(7)])
    box(M, x - 0.5, x + 0.5, 0, 0.15, TZ - 0.5, TZ + 0.5, "steel2")
    box(M, x - 0.55, x + 0.55, YB - 0.95, YB - 0.85, TZ - 0.35, TZ + 0.35, "steel2")
hv_sign(M, -3.4, YB - 1.5, TZ + 0.2, 0.5)
anchors["tube"] = {"layer": M, "p": [-4.6, YB + 0.75, TZ], "dx": -60, "dy": -260}
anchors["src"] = {"layer": M, "p": [-8.75, 6.1, 4.0], "dx": -80, "dy": -160}

# ── 3. 分析磁鐵（90° 轉彎）──
CX, CZ, RR = 1.6, 1.0, 3.0   # 入口 (1.6, 4) 往 +x；出口 (4.6, 1) 往 −z
def apos(r, th):  # 以磁鐵中心為圓心、角度 th（0＝入口）
    return (CX + r * math.sin(th), CZ + r * math.cos(th))
NS = 12
top = "magTop"
for i in range(NS):
    th = (i + 0.5) / NS * math.pi / 2; dg = math.degrees(th)
    def seg(layer, r, rw, y0, y1, mat, extra=1.02):
        x, z = apos(r, th); ln = 2 * r * math.sin(math.pi / 4 / NS) * extra
        P(layer, "box", [ln, y1 - y0, rw], [x, (y0 + y1) / 2, z], mat, rot=[0, dg, 0])
    seg(M, RR, 2.2, 3.35, 4.0, "yoke")         # 下軛
    seg(M, RR, 1.3, 4.0, 4.6, "pole")          # 下磁極
    seg(top, RR, 1.3, 5.4, 6.0, "pole")        # 上磁極
    seg(top, RR, 2.2, 6.0, 6.65, "yoke")       # 上軛
    seg(M, RR + 1.62, 0.36, 3.35, 5.0, "yoke2")  # 外側回路鐵芯（下半）
    seg(top, RR + 1.62, 0.36, 5.0, 6.65, "yoke2")
    for (rc, lay, y0, y1) in [(RR - 0.85, M, 4.0, 4.55), (RR + 0.85, M, 4.0, 4.55), (RR - 0.85, top, 5.45, 6.0), (RR + 0.85, top, 5.45, 6.0)]:
        seg(lay, rc, 0.36, y0, y1, "coil")
        seg(lay, rc, 0.38, y0 + 0.17, y0 + 0.19, "coilLine", 1.0); seg(lay, rc, 0.38, y0 + 0.36, y0 + 0.38, "coilLine", 1.0)
    # 真空飛行腔的內外壁
    seg(M, RR - 0.6, 0.06, 4.6, 5.4, "chamberIn"); seg(M, RR + 0.6, 0.06, 4.6, 5.4, "chamberIn")
    seg(M, RR, 1.26, 4.6, 4.62, "chamberIn")
# 線圈兩端的彎頭（入口、出口外側）
for th, s in [(0, -1), (math.pi / 2, 1)]:
    for (lay, y0, y1) in [(M, 4.0, 4.55), (top, 5.45, 6.0)]:
        for rr_ in [RR - 0.85, RR + 0.85]:
            x, z = apos(rr_, th)
            tx, tz = math.cos(th), -math.sin(th)
            P(lay, "cyl", [0.2, y1 - y0], [x + s * 0.22 * tx, (y0 + y1) / 2, z + s * 0.22 * tz], "coil", rot=[90, 0, 0])
        x0, z0 = apos(RR, th); tx, tz = math.cos(th), -math.sin(th)
        P(lay, "box", [0.36, y1 - y0, 1.7], [x0 + s * 0.4 * tx, (y0 + y1) / 2, z0 + s * 0.4 * tz], "coil", rot=[0, math.degrees(th), 0])
# 上軛的螺絲（沿弧線）
P(top, "cyl", [0.06, 0.04], [0, 6.67, 0], "screw", rot=[90, 0, 0], at=[[*apos(r, (k + 0.5) / 8 * math.pi / 2)[:1], 0, apos(r, (k + 0.5) / 8 * math.pi / 2)[1]] for k in range(8) for r in (RR - 0.9, RR + 0.9)])
# 磁鐵底座
box(M, 0.4, 6.4, 0, 3.35, -0.8, 5.4, "cab"); contact(M, 0.4, 6.4, -0.8, 5.4)
panel_front(M, 0.5, 6.3, 0.25, 3.2, 5.4, cols=3, rows=1, vent=True)
panel_side(M, -0.7, 5.3, 0.25, 3.2, 6.4, cols=3, rows=1)
hv_sign(M, 3.4, 2.4, 5.47, 0.6)
P(M, "cyl", [0.07, 0.05], [5.6, 2.9, 5.47], "ledG"); P(M, "cyl", [0.07, 0.05], [5.85, 2.9, 5.47], "ledA")
# 電源線（磁鐵線圈接到櫃子）
pipe(M, [(apos(RR + 1.8, 0.6)[0], 4.2, apos(RR + 1.8, 0.6)[1]), (5.9, 3.4, 4.6)], 0.09, "pumpDark")
anchors["mag"] = {"layer": M, "p": [apos(RR + 1.6, math.pi / 4)[0], 4.9, apos(RR + 1.6, math.pi / 4)[1]], "dx": 90, "dy": -150}

# ── 4. 射束管線、解析狹縫、掃描板、真空幫浦 ──
BX = 4.6
# 出口到解析狹縫
P(M, "tube", [0.55, 0.45, 0.8], [BX, YB, 0.35], "steel")
flange_z(M, BX, YB, 0.8, 0.85, 0.45)
box(M, BX - 1.0, BX - 0.25, YB - 1.0, YB + 1.0, -0.12, 0.0, "steel2"); box(M, BX + 0.25, BX + 1.0, YB - 1.0, YB + 1.0, -0.12, 0.0, "steel2")
box(M, BX - 0.25, BX + 0.25, YB - 1.0, YB - 0.3, -0.12, 0.0, "steel2"); box(M, BX - 0.25, BX + 0.25, YB + 0.3, YB + 1.0, -0.12, 0.0, "steel2")
flange_z(M, BX, YB, -0.2, 0.85, 0.45)
P(M, "tube", [0.55, 0.45, 1.1], [BX, YB, -0.8], "steel")
flange_z(M, BX, YB, -1.4, 0.9, 0.45, 0.18, 12)
# 掃描段：透明觀察管，裡面兩片掃描板
SZ0, SZ1 = -1.5, -3.6
P(M, "tube", [0.95, 0.88, SZ0 - SZ1], [BX, YB, (SZ0 + SZ1) / 2], "glassTube")
box(M, BX - 0.62, BX - 0.56, YB - 0.55, YB + 0.55, SZ1 + 0.25, SZ0 - 0.25, "flange"); box(M, BX + 0.56, BX + 0.62, YB - 0.55, YB + 0.55, SZ1 + 0.25, SZ0 - 0.25, "flange")
P(M, "cyl", [0.04, 0.9], [BX, YB + 0.9, (SZ0 + SZ1) / 2], "ceramic", rot=[90, 0, 0], at=[[-0.59, 0, 0], [0.59, 0, 0]])
flange_z(M, BX, YB, SZ1 - 0.08, 1.15, 0.45, 0.18, 12)
P(M, "tube", [0.7, 0.55, 0.65], [BX, YB, SZ1 - 0.45], "steel")
# 渦輪幫浦（掛在管線下方）＋前段管路＋乾式幫浦
def turbo(x, y, z):
    P(M, "cyl", [0.5, 1.2], [x, y - 0.6, z], "pump", rot=[90, 0, 0])
    P(M, "tube", [0.62, 0.5, 0.1], [x, y - 0.08, z], "flange", rot=[90, 0, 0])
    P(M, "tube", [0.53, 0.5, 0.04], [x, 0, z], "pumpDark", rot=[90, 0, 0], at=[[0, y - 0.3 - k * 0.18, 0] for k in range(5)])
    P(M, "cyl", [0.3, 0.4], [x, y - 1.4, z], "pumpDark", rot=[90, 0, 0])
    P(M, "cyl", [0.06, 0.05], [x + 0.5, y - 0.7, z], "ledG", rot=[0, 90, 0])
turbo(BX, YB - 0.55, -0.8); P(M, "cyl", [0.3, 0.12], [BX, YB - 0.5, -0.8], "steel2", rot=[90, 0, 0])
pipe(M, [(BX, YB - 2.1, -0.8), (BX, 1.0, -0.8), (BX + 2.0, 1.0, -0.8), (BX + 2.0, 1.0, 1.8), (BX + 2.6, 1.0, 1.8)], 0.12)
box(M, BX + 2.6, BX + 4.4, 0, 1.6, 1.0, 2.6, "pumpDark"); contact(M, BX + 2.6, BX + 4.4, 1.0, 2.6)
P(M, "box", [0.04, 1.1, 1.3], [BX + 4.42, 0.8, 1.8], "vent", at=[[0, 0, 0]])
P(M, "box", [1.6, 0.04, 0.02], [BX + 3.5, 0, 2.62], "vent", at=[[0, 0.3 + k * 0.16, 0] for k in range(7)])
P(M, "cyl", [0.45, 0.9], [BX + 3.5, 1.6 + 0.45, 1.8], "pump", rot=[0, 90, 0])
P(M, "cyl", [0.07, 0.05], [BX + 2.85, 1.35, 2.63], "ledG")
# 管線支架
for z in [-0.8, -2.55]:
    box(M, BX - 0.12, BX + 0.12, 0, YB - 0.9 if z != -0.8 else 1.8, z - 0.12, z + 0.12, "steel2")
box(M, BX - 0.5, BX + 0.5, 0, 0.12, -3.05, -2.05, "steel2")

# ── 5. 終端站（玻璃前牆＋右牆，看得到晶圓）──
EX0, EX1, EY0, EY1, EZ0, EZ1 = 2.3, 6.9, 2.3, 7.8, -8.8, -4.3
box(M, EX0 - 0.3, EX1 + 0.3, 0, EY0, EZ0 - 0.3, EZ1 + 0.3, "cab"); contact(M, EX0 - 0.3, EX1 + 0.3, EZ0 - 0.3, EZ1 + 0.3)
panel_front(M, EX0 - 0.2, EX1 + 0.2, 0.25, EY0 - 0.15, EZ1 + 0.3, cols=2, rows=1, vent=True)
panel_side(M, EZ0 - 0.2, EZ1 + 0.2, 0.25, EY0 - 0.15, EX1 + 0.3, cols=2, rows=1, vent=True)
hv_sign(M, EX1 + 0.32, 1.2, EZ1 - 0.5, 0.55, face="x")
# 框架邊（12 條稜）
fr = 0.14
for (x, z) in [(EX0, EZ0), (EX1, EZ0), (EX0, EZ1), (EX1, EZ1)]:
    box(M, x - fr, x + fr, EY0, EY1, z - fr, z + fr, "steel2")
for y in [EY0, EY1]:
    box(M, EX0, EX1, y - fr, y + fr, EZ0 - fr, EZ0 + fr, "steel2"); box(M, EX0, EX1, y - fr, y + fr, EZ1 - fr, EZ1 + fr, "steel2")
    box(M, EX0 - fr, EX0 + fr, y - fr, y + fr, EZ0, EZ1, "steel2"); box(M, EX1 - fr, EX1 + fr, y - fr, y + fr, EZ0, EZ1, "steel2")
box(M, EX0, EX1, EY1, EY1 + 0.25, EZ0, EZ1, "steel")  # 頂蓋
box(M, EX0 + 0.3, EX1 - 0.3, EY1 + 0.25, EY1 + 0.29, EZ0 + 0.3, EZ1 - 0.3, "seam")
P(M, "cyl", [0.06, 0.04], [0, EY1 + 0.3, 0], "screw", rot=[90, 0, 0], at=[[x, 0, z] for x in (EX0 + 0.2, EX1 - 0.2) for z in (EZ0 + 0.2, (EZ0 + EZ1) / 2, EZ1 - 0.2)])
box(M, EX0, EX0 + 0.1, EY0, EY1, EZ0, EZ1, "steel")      # 左牆（不透明）
box(M, EX0, EX1, EY0, EY1, EZ0, EZ0 + 0.1, "chamberIn")  # 背牆
P(M, "plane", [EX1 - EX0, EY1 - EY0], [(EX0 + EX1) / 2, (EY0 + EY1) / 2, EZ1], "glass")          # 前牆玻璃
P(M, "plane", [EZ1 - EZ0, EY1 - EY0], [EX1, (EY0 + EY1) / 2, (EZ0 + EZ1) / 2], "glass", rot=[0, 90, 0])  # 右牆玻璃
flange_z(M, BX, YB, EZ1 + 0.05, 1.0, 0.45, 0.16, 12)
P(M, "tube", [0.62, 0.5, abs(SZ1 - 0.8 - EZ1)], [BX, YB, (SZ1 - 0.8 + EZ1) / 2], "steel")
turbo(EX0 + 1.0, EY0, EZ0 + 1.0)
# 掃描驅動柱（背牆上）＋晶圓、載台、手臂（一起上下移動）
box(M, BX - 0.3, BX + 0.3, EY0 + 0.1, EY1 - 0.1, EZ0 + 0.1, EZ0 + 0.45, "steel2")
box(M, BX - 0.06, BX + 0.06, EY0 + 0.3, EY1 - 0.3, EZ0 + 0.45, EZ0 + 0.5, "seam")
WZ = -6.75; WR = 1.45; W = "wfr"
P(W, "cyl", [WR + 0.2, 0.22], [BX, YB, WZ - 0.13], "platen", pid="w_platen")
P(W, "box", [0.5, 0.5, abs(EZ0 + 0.5 - (WZ - 0.24))], [BX, YB, (EZ0 + 0.5 + WZ - 0.24) / 2], "steel2", pid="w_arm")
P(W, "cyl", [WR, 0.04], [BX, YB, WZ], "wafer", pid="w_body")
cells = []
st = 0.26; K = int(WR / st) + 1
for i in range(-K, K + 1):
    for j in range(-K, K + 1):
        x, y = i * st, j * st; h = (st - 0.035) / 2
        if all(math.hypot(x + a, y + b) < WR * 0.96 for a in (-h, h) for b in (-h, h)): cells.append([x, y, 0])
P(W, "box", [st - 0.035, st - 0.035, 0.012], [BX, YB, WZ + 0.026], "die", at=cells, pid="w_dies")
P(W, "box", [0.3, 0.06, 0.03], [BX, YB - WR + 0.03, WZ + 0.02], "platen", pid="w_notch")
P("dose", "cyl", [WR * 0.97, 0.006], [BX, YB, WZ + 0.036], "dose", pid="w_dose")
P("spot", "cyl", [0.2, 0.006], [BX, YB, WZ + 0.042], "spot", pid="spot")
P("spot", "tube", [0.34, 0.24, 0.006], [BX, YB, WZ + 0.042], "dose", pid="spotRing")
anchors["wafer"] = {"layer": W, "p": [BX + 0.9, YB + 0.6, WZ], "dx": 120, "dy": 60}
# 控制台（右前）
box(M, 8.3, 9.9, 0, 4.2, -3.4, -2.2, "cab"); contact(M, 8.3, 9.9, -3.4, -2.2)
box(M, 8.45, 9.75, 2.6, 3.9, -2.2, -2.16, "cabDark"); box(M, 8.55, 9.65, 2.7, 3.8, -2.16, -2.14, "screen")
P(M, "box", [0.7, 0.06, 0.01], [8.9, 0, -2.13], "screenUI", at=[[0, 3.6 - k * 0.2, 0] for k in range(5)])
P(M, "cyl", [0.07, 0.05], [8.6, 2.3, -2.17], "ledG"); P(M, "cyl", [0.07, 0.05], [8.85, 2.3, -2.17], "ledB")
panel_front(M, 8.35, 9.85, 0.25, 2.05, -2.2, cols=1, rows=2)
# 背面設備櫃（氣體櫃、電源櫃）＋排氣管到天花板
box(M, -11.5, 1.8, 0, 8.6, -9.6, -6.6, "cab"); contact(M, -11.5, 1.8, -9.6, -6.6)
panel_front(M, -11.4, 1.7, 0.3, 8.4, -6.6, cols=6, rows=3, vent=True)
box(M, -11.5, 1.8, 8.6, 8.8, -9.6, -6.6, "cabDark")
for i, x in enumerate([-10.6, -8.4, -6.2, -4.0, -1.8, 0.4]):
    P(M, "cyl", [0.07, 0.05], [x, 7.9, -6.53], "ledG" if i % 3 else "ledB")
hv_sign(M, -5.2, 6.4, -6.52, 0.6)
for x in [-9.5, -3.5]:
    P(M, "cyl", [0.42, CY - 8.8], [x, (8.8 + CY) / 2, -8.1], "duct", rot=[90, 0, 0])
    P(M, "tube", [0.5, 0.42, 0.12], [x, 0, -8.1], "flange", rot=[90, 0, 0], at=[[0, 9.6, 0], [0, 12.0, 0]])
P(M, "cyl", [0.3, CY - EY1 - 0.3], [EX1 - 0.6, (EY1 + 0.3 + CY) / 2, EZ0 + 0.6], "duct", rot=[90, 0, 0])
P(M, "tube", [0.38, 0.3, 0.1], [EX1 - 0.6, EY1 + 1.2, EZ0 + 0.6], "flange", rot=[90, 0, 0])

# ── 6. 晶圓剖面放大（終端站上方，面向最後的鏡頭）──
YAW_END = -0.72
RY = -YAW_END  # 剖面板面向鏡頭
SC = (BX - 0.2, 10.9, -6.4); BW, BH, BD = 4.6, 2.8, 0.8
def lp(x, y, z):  # 剖面的區域座標 → 模型座標（繞 y 轉 RY）
    c, s = math.cos(RY), math.sin(RY)
    return (SC[0] + x * c + z * s, SC[1] + y, SC[2] - x * s + z * c)
SEC = "sec"
dg = math.degrees(RY)
P(SEC, "box", [BW, BH, BD], lp(0, 0, 0), "si", rot=[0, dg, 0])
P(SEC, "plane", [BW - 0.02, BH - 0.02], lp(0, 0, BD / 2 + 0.005), "siFace", rot=[0, dg, 0])
P(SEC, "plane", [BW, 0.1], lp(0, BH / 2 - 0.05, BD / 2 + 0.008), "oxideTop", rot=[0, dg, 0])
lat = [list(lp(-BW / 2 + 0.25 + i * (BW - 0.5) / 15, -BH / 2 + 0.22 + j * (BH - 0.5) / 8, BD / 2 + 0.012)) for i in range(16) for j in range(9)]
P(SEC, "sphere", [0.035], [0, 0, 0], "lattice", at=lat)
for t in [0.09, 0.05]:  # 外框
    pass
fz = BD / 2 + 0.02
for (x, y, w, h) in [(0, BH / 2 + 0.05, BW + 0.2, 0.1), (0, -BH / 2 - 0.05, BW + 0.2, 0.1), (-BW / 2 - 0.05, 0, 0.1, BH), (BW / 2 + 0.05, 0, 0.1, BH)]:
    P(SEC, "box", [w, h, 0.06], lp(x, y, fz), "insetFrame", rot=[0, dg, 0])
# 深度尺：左側刻度＋停止深度虛線
RP = 0.75  # 停止深度（從表面往下）
ytop = BH / 2 - 0.1
for k in range(6):
    P(SEC, "box", [0.18 if k % 5 == 0 else 0.1, 0.025, 0.02], lp(-BW / 2 + 0.12, ytop - k * 0.3, BD / 2 + 0.03), "hvK", rot=[0, dg, 0])
P(SEC, "box", [0.025, 1.5, 0.02], lp(-BW / 2 + 0.06, ytop - 0.75, BD / 2 + 0.03), "hvK", rot=[0, dg, 0])
P("secRp", "box", [0.16, 0.03, 0.02], [0, 0, 0], "rp", rot=[0, dg, 0], at=[list(lp(-BW / 2 + 0.45 + k * 0.3, ytop - RP, BD / 2 + 0.04)) for k in range(14)])
# 摻雜區（顏色漸層：淡→濃→淡）
band = [("d1", 0.42, 0.52), ("d2", 0.52, 0.64), ("d3", 0.64, 0.86), ("d2", 0.86, 0.98), ("d1", 0.98, 1.1)]
for i, (mt, a, b) in enumerate(band):
    P("secBand", "plane", [BW - 0.12, b - a], lp(0.03, ytop - (a + b) / 2, BD / 2 + 0.016 + i * 0.0005), mt, rot=[0, dg, 0])
anchors["sec"] = {"layer": SEC, "p": list(lp(BW / 2, 0.4, BD / 2)), "dx": 60, "dy": -170}

# ── 7. 射束（淡淡的光束：加速管、磁鐵弧線、管線、掃描扇形）──
BM = "beamL"
rod(BM, (SX, YB, TZ), (CX, YB, TZ), 0.07, "beam")
for i in range(NS):
    a0, a1 = i / NS * math.pi / 2, (i + 1) / NS * math.pi / 2
    p0, p1 = apos(RR, a0), apos(RR, a1)
    rod(BM, (p0[0], YB, p0[1]), (p1[0], YB, p1[1]), 0.07, "beam")
rod(BM, (BX, YB, CZ), (BX, YB, (SZ0 + SZ1) / 2), 0.07, "beam")
PIV = [BX, YB, (SZ0 + SZ1) / 2]
LF = abs(WZ - PIV[2])
rod("fan", tuple(PIV), (BX, YB, WZ + 0.05), 0.05, "beam", pid="fanRod")

# ── 8. 離子：帶「＋」的小球＋三顆拖尾（延遲 2/4/6 幀，越快拖越長）──
SCAN_F, SCAN_A = 1.1, LF * math.sin(math.radians(15))  # 射束左右掃描頻率（Hz）與在晶圓上的幅度
shifts = []
def S(**kw): shifts.append(kw)
def add_ion(n, kind, f0, path_fn):
    """kind：ok／heavy／light。path_fn 回傳 [(類型, 幀數, dx,dy,dz)]，起點＝引出口"""
    r = {"ok": 0.2, "heavy": 0.25, "light": 0.15}[kind]
    mc = {"ok": "ion", "heavy": "ionHeavy", "light": "ionLight"}[kind]
    tm = {"ok": ["tr1", "tr2", "tr3"], "heavy": ["trH1", "trH2", "trH3"], "light": ["trL1", "trL2", "trL3"]}[kind]
    segs, end_f, hit = path_fn()
    for j in range(4):
        lid = f"i{n}" + ("" if j == 0 else f"t{j}")
        d = 2 * j
        if j == 0:
            P(lid, "sphere", [r], [SX, YB, TZ], mc)
            P(lid, "box", [r * 1.3, r * 0.32, r * 2.2], [SX, YB, TZ], "plus")
            P(lid, "box", [r * 0.32, r * 1.3, r * 2.2], [SX, YB, TZ], "plus")
        else:
            P(lid, "sphere", [r * (0.95 - 0.18 * j)], [SX, YB, TZ], tm[j - 1])
        S(layer=lid, at=f"start-40", until=f"start+{f0 + d}", opacity=0, dur=1)
        t = f0 + d
        for (k, du, dx, dy, dz) in segs:
            sh = {"layer": lid, "at": f"start+{int(round(t))}", "dur": R2(du), "dx": R2(dx), "dy": R2(dy), "dz": R2(dz)}
            if k == "acc": sh.update(fallOut=True, bounce=0)
            else: sh.update(throw=0)
            shifts.append(sh); t += du
        S(layer=lid, at=f"start+{int(round(end_f + d))}", opacity=0, dur=2)
    return hit
TA = 54; DA = CX - SX; V = 2 * DA / TA   # 加速段：等加速度，末速 V（單位／幀）
def lin(p0, p1):
    dx, dz = p1[0] - p0[0], p1[1] - p0[1]; return ("lin", math.hypot(dx, dz) / V, dx, 0, dz)
def path_ok(f0):
    def fn():
        segs = [("acc", TA, DA, 0, 0)]
        pts = [apos(RR, i / NS * math.pi / 2) for i in range(NS + 1)]
        segs += [lin(a, b) for a, b in zip(pts, pts[1:])]
        segs.append(lin((BX, CZ), (BX, PIV[2])))
        t_arr = f0 + TA + sum(s[1] for s in segs[1:]) + LF / V
        xo = SCAN_A * math.sin(2 * math.pi * SCAN_F * t_arr / FPS)
        segs.append(("lin", math.hypot(LF, xo) / V, xo, 0, WZ + 0.06 - PIV[2]))
        end = f0 + sum(s[1] for s in segs)
        return segs, end, None
    return fn
def path_bad(f0, rad, inner):
    def fn():
        segs = [("acc", TA, DA, 0, 0)]
        cz = 4.0 - rad; wall = (RR - 0.6 + 0.1) if inner else (RR + 0.6 - 0.12)
        ph, step = 0.0, math.radians(3)
        pts = [(CX, 4.0)]
        while ph < math.pi / 2:
            ph += step
            p = (CX + rad * math.sin(ph), cz + rad * math.cos(ph))
            dd = math.hypot(p[0] - CX, p[1] - CZ)
            if (inner and dd <= wall) or ((not inner) and dd >= wall):
                pts.append(p); break
            pts.append(p)
        # 每 4 小段合成一段（減少 shift 數）
        keep = pts[::3] + ([pts[-1]] if (len(pts) - 1) % 3 else [])
        segs += [lin(a, b) for a, b in zip(keep, keep[1:])]
        end = f0 + sum(s[1] for s in segs)
        hp = keep[-1]; nrm = ((hp[0] - CX), (hp[1] - CZ)); ln = math.hypot(*nrm); nrm = (nrm[0] / ln, nrm[1] / ln)
        return segs, end, (hp, nrm if not inner else (-nrm[0], -nrm[1]), end)
    return fn
ions = []
f, n = 96, 0
while f <= 352:
    kind = "ok"
    if 150 <= f <= 286 and n % 3 == 1: kind = "heavy" if (n // 3) % 2 == 0 else "light"
    fn = path_ok(f) if kind == "ok" else path_bad(f, 5.6 if kind == "heavy" else 1.85, kind == "light")
    hit = add_ion(n, kind, f, fn)
    ions.append((n, kind, f, hit)); n += 1; f += 7
# 撞壁火花：星形小亮點（瞬間出現、6 幀淡出）＋波紋
runs = []
for (n, kind, f0, hit) in ions:
    if not hit: continue
    (hx, hz), (nx_, nz_), fe = hit
    lid = f"spk{n}"
    P(lid, "sphere", [0.09], [hx, YB, hz], "sparkW")
    for a in range(4):
        P(lid, "box", [0.42, 0.035, 0.035], [hx, YB, hz], "spark", rot=[0, a * 45, 0])
    P(lid, "box", [0.035, 0.36, 0.035], [hx, YB, hz], "spark")
    S(layer=lid, at="start-40", until=f"start+{int(round(fe))}", opacity=0, dur=1)
    S(layer=lid, at=f"start+{int(round(fe)) + 3}", opacity=0, dur=7)
    acts[f"wv{n}"] = {"type": "wave", "from": [R2(hx), YB, R2(hz)], "dir": [R2(nx_), 0, R2(nz_)], "reach": 0.5, "count": 2, "r0": 0.05, "spread": 0.7, "rate": 2.2, "color": "spark"}
    runs.append({"id": f"wv{n}", "at": f"start+{int(round(fe))}", "until": f"start+{int(round(fe)) + 10}", "ramp": 3})
# ── 剖面裡的離子：從上方打進矽，越走越慢，停在 RP 附近（固定亂數的散布）──
sec_ions = []
for k in range(22):
    x = -BW / 2 + 0.45 + (k * 0.618 % 1) * (BW - 0.9)
    dep = RP + (rnd.random() + rnd.random() + rnd.random() - 1.5) * 0.18
    fe = 318 + k * 3
    sec_ions.append((k, x, dep, fe))
    for j in range(3):
        lid = f"si{k}" + ("" if j == 0 else f"t{j}")
        p = lp(x, ytop - dep, BD / 2 + 0.07)
        if j == 0:
            P(lid, "sphere", [0.12], p, "ion")
            P(lid, "box", [0.15, 0.036, 0.2], p, "plus", rot=[0, dg, 0]); P(lid, "box", [0.036, 0.15, 0.2], p, "plus", rot=[0, dg, 0])
        else:
            P(lid, "sphere", [0.12 * (1 - 0.25 * j)], p, "tr1" if j == 1 else "tr2")
        S(layer=lid, at="start-40", until=f"start+{fe + 2 * j}", opacity=0, dur=1)
        S(layer=lid, at="start-40", until=f"start+{fe + 2 * j}", dy=R2(dep + 1.6), dur=1, spring={"tau": 6, "period": 600})
        if j: S(layer=lid, at=f"start+{fe + 26}", opacity=0, dur=8)

# ── 動作 ──
acts["plasmaGlow"] = {"type": "pulse", "parts": ["plasmaCore"], "color": "plasma", "freq": 3, "glow": 0.9, "halo": 1.6}
acts["lampOn"] = {"type": "pulse", "parts": ["lampG"], "color": "ledG", "steady": True, "glow": 0.9, "halo": 0}
acts["waferScan"] = {"type": "vibrate", "parts": ["w_platen", "w_arm", "w_body", "w_dies", "w_notch", "w_dose"], "axis": [0, 1, 0], "amp": 0.55, "freq": 0.3}
acts["spotX"] = {"type": "vibrate", "parts": ["spot", "spotRing"], "axis": [1, 0, 0], "amp": R2(SCAN_A), "freq": SCAN_F}
acts["fanSwing"] = {"type": "rotate", "parts": ["fanRod"], "axis": [0, 1, 0], "pivot": PIV, "swing": -15, "freq": SCAN_F}
acts["spotGlow"] = {"type": "pulse", "parts": ["spot"], "color": "spot", "steady": True, "glow": 1, "halo": 0.9}
first_hit = min(f0 + TA + 30 for (_, k, f0, _) in ions if k == "ok")
runs += [
  {"id": "lampOn", "at": "start-30", "ramp": 1},
  {"id": "plasmaGlow", "at": "start+78", "ramp": 14},
  {"id": "waferScan", "at": "start+150", "ramp": 20},
  {"id": "spotX", "at": f"start+{first_hit - 6}", "ramp": 1},
  {"id": "fanSwing", "at": f"start+{first_hit - 6}", "ramp": 1},
  {"id": "spotGlow", "at": f"start+{first_hit - 6}", "ramp": 8},
]
# 光束、扇形、光點、劑量、剖面：先藏起來，到時間才出現
S(layer=BM, at="start-40", until="start+92", opacity=0, dur=12)
S(layer="fan", at="start-40", until=f"start+{first_hit - 6}", opacity=0, dur=8)
S(layer="spot", at="start-40", until=f"start+{first_hit - 6}", opacity=0, dur=6)
S(layer="dose", at="start-40", until=f"start+{first_hit}", opacity=0, dur=200)
S(layer=SEC, at="start-40", until="start+296", opacity=0, dur=14); S(layer=SEC, at="start-40", until="start+296", dy=-0.8, dur=16)
overlays = [
  {"type": "legend", "at": "start+150", "until": "start+298", "x": 64, "y": 1500, "cols": 3, "colW": 292, "size": 36,
   "items": [{"text": "＋ 要的離子", "swatch": "ion"}, {"text": "太重：撞外壁", "swatch": "ionHeavy"}, {"text": "太輕：撞內壁", "swatch": "ionLight"}]},
  {"type": "legend", "at": "start+316", "until": "start+430", "x": 64, "y": 1500, "cols": 2, "colW": 440, "size": 40,
   "items": [{"text": "＋ 離子停在一定深度", "swatch": "ion"}, {"text": "摻雜區（中間最濃）", "swatch": "d3"}]},
]
S(layer="secRp", at="start-40", until="start+384", opacity=0, dur=10)
S(layer="secBand", at="start-40", until="start+336", opacity=0, dur=56)
# 分析磁鐵上半部掀起來（看得到裡面轉彎），之後放回去
S(layer=top, at="start+190", until="start+302", dy=6.0, dz=-9.0, dur=26)

# ── 鏡頭（目標點換算：鏡頭看向 (x,y,0)，要對準 z≠0 的點就把 y 往回推、距離補上）──
YAW0 = -0.28
def shot(at, focus, D, elev, yaw_total, dur):
    x, y, z = focus; c, s = math.cos(yaw_total), math.sin(yaw_total)
    xr, zr = x * c + z * s, -x * s + z * c
    e = math.radians(elev); sdist = zr / math.cos(e)
    return {"at": at, "dur": dur, "x": R2(xr), "y": R2(y - zr * math.tan(e)), "d": R2(D + sdist), "elev": elev, "yaw": R2(yaw_total - shot.yaw)}
shot.yaw = YAW0
def mk(at, focus, D, elev, yaw, dur):
    r = shot(at, focus, D, elev, yaw, dur); shot.yaw = yaw; return r
shots = [
  mk("start-30", (-1.2, 5.0, -1.0), 56, 12, YAW0, 1),
  mk("start", (-1.0, 4.8, -0.5), 47, 15, -0.32, 92),
  mk("start+88", (-3.6, 5.0, 4.0), 19, 16, -0.36, 46),
  mk("start+140", (-1.6, 5.0, 3.8), 18, 18, -0.42, 56),
  mk("start+194", (3.1, 5.0, 2.3), 23, 50, -0.5, 40),
  mk("start+300", (BX, 8.2, -6.5), 30, 13, YAW_END, 44),
  mk("start+352", (BX, 8.1, -6.5), 28, 13, YAW_END - 0.04, 60),
]

# ── 標籤（4 張）──
labels = [
  {"part": "src", "text": "離子源", "en": "Ion source", "color": "amber", "at": "start+14", "until": "start+100"},
  {"part": "tube", "text": "加速管", "en": "Accelerator column", "color": "blue", "at": "start+120", "until": "start+196"},
  {"part": "mag", "text": "分析磁鐵", "en": "Analyzer magnet", "color": "amber", "at": "start+226", "until": "start+298"},
]

model = {
  "name": "test-ion-opus：離子佈植機（離子源→加速管→分析磁鐵→射束管線→終端站→剖面摻雜層），gen.py 產生",
  "unit": "約 20 cm", "size": {"w": 20, "h": 0.2, "r": 0.1, "t": 14},
  "palette": pal, "materials": mats, "layers": list(layers.values()), "anchors": anchors, "parts": parts, "actions": acts,
  "pose": {"yaw0": YAW0, "yawIso": 0, "drift": 0},
  "camera": {"stand": {"d": 72, "elev": 12, "y": 5}, "outro": {"d": 0}},
  "fx": {"dpr": 1.25, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": True, "dust": False, "vaporSprites": False, "shimmer": False, "glow": False, "sweep": False},
}
SCN = [("s1", 0, 90, "全景"), ("s2", 90, 120, "加速"), ("s3", 210, 90, "磁鐵"), ("s4", 300, 120, "晶圓")]
scenes = []
for i, (sid, a, du, nm) in enumerate(SCN):
    pr = {"shot": [], "run": [], "shift": [], "labels": []}
    if i == 0:
        pr = {"zoom": [{"to": "ion", "at": "start-30", "dur": 1}], "shot": shots, "run": runs, "shift": shifts, "labels": labels, "overlay": overlays}
    scenes.append({"id": sid, "beat": "mechanism", "narration": "", "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "props": pr,
                   "sources": ["示意動畫：比例、速度、顏色都不是實際值"], "durationSec": du / FPS, "silent": True, "_段落": nm})
script = {
  "slug": "test-ion-opus", "title": "離子佈植機怎麼把離子打進晶圓（模型比較測試・Opus）", "asOf": "2026/11/20", "styleVersion": 3, "stage": "three",
  "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
  "voice": {"_說明": "無聲測試片，不送 TTS"},
  "hud": {"levels": [{"id": "ion", "label": "離子佈植機", "en": "ION IMPLANTER", "field": "6 m", "ruler": "1 m", "art": "none", "handoff3D": True, "readout": False, "note": "示意動畫", "noteAlways": True}],
          "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 1, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
  "cover": {"title": ["離子", "打進晶圓"], "sub": "離子佈植", "frame": 200}, "sample": True, "scenes": scenes,
}
tl_sc = []
for i, (sid, a, du, nm) in enumerate(SCN):
    tl_sc.append({"id": sid, "audio": None, "audioFrame": a, "audioSec": 0, "headSilSec": 0, "tailSilSec": 0, "startFrame": a, "durationFrames": du, "transitionFrames": 0, "transition": None,
                  "voiceStartFrame": a, "voiceEndFrame": a + du, "stillFrame": a + du - 1, "subtitleWindow": [a, a + du], "sourceWindow": [a, a + du], "lines": [], "keywords": [], "cues": [], "sub": "", "silentEstimate": True})
tl = {"version": 2, "slug": "test-ion-opus", "fps": FPS, "totalFrames": TOTAL, "totalSec": TOTAL / FPS, "gapSec": 0, "transitionFrames": 0, "silent": True, "_說明": "無聲、無字幕時間軸（gen.py 產生）", "scenes": tl_sc}
sb = {"slug": "test-ion-opus", "fps": FPS, "totalFrames": TOTAL, "totalSec": TOTAL / FPS, "scenes": [{"id": s["id"], "startFrame": s["startFrame"], "durationFrames": s["durationFrames"], "component": "ThreeScene"} for s in tl_sc]}
for nm, obj in [("model.json", model), ("script.json", script), ("timeline.json", tl), ("storyboard.json", sb)]:
    json.dump(obj, open(os.path.join(D, nm), "w"), ensure_ascii=False, indent=1)
print(f"零件 {len(parts)}、層 {len(layers)}、shift {len(shifts)}、動作 {len(acts)}、離子 {len(ions)}（錯的 {sum(1 for i in ions if i[1] != 'ok')}）")
