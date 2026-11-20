# 產生 videos/test-ion-sonnet/model.json 與 script.json（改這支再重產）。
# 座標：x 右、y 上、z 朝觀眾（design 座標，鏡頭再用 yaw 轉）。1 單位約 25 cm。
# 離子是真的零件（帶「＋」的球），每顆離子一層；位移用 props.shift 的幾種緩動組出來：
#   a²（fallOut）＝加速、2a−a²（throw 線性＋fallOut 反向）＝減速、二次貝茲曲線 x＝R(2t−t²)、z＝R t²＝轉彎。
import json, math, sys
R = lambda x: round(x, 3)
parts = []; layers = []; anchors = {}; actions = {}
LAYERS = {}
_n = [0]
def layer(i, bg=False):
    if i not in LAYERS:
        LAYERS[i] = True
        d = {"id": i, "z": 0, "k": 0}
        if bg: d["bg"] = True
        layers.append(d)
def add(lay, shape, mat, size, pos, at=None, rot=None, pid=None, scale=None, **kw):
    layer(lay)
    _n[0] += 1
    p = {"id": pid or f"p{_n[0]}", "layer": lay, "shape": shape, "size": [R(v) for v in size], "pos": [R(v) for v in pos], "mat": "m_" + mat}
    if at: p["at"] = [[R(v) for v in a] for a in at]
    if rot: p["rot"] = [R(v) for v in rot]
    if scale: p["scale"] = scale
    p.update(kw); parts.append(p); return p["id"]
def box(lay, mat, size, pos, **kw): return add(lay, "box", mat, size, pos, **kw)
def sph(lay, mat, r, pos, **kw): return add(lay, "sphere", mat, [r], pos, **kw)
AX = {"x": [0, 90, 0], "y": [90, 0, 0], "z": None}
def cyl(lay, mat, r, h, pos, axis="z", **kw): return add(lay, "cyl", mat, [r, h], pos, rot=AX[axis], **kw)
def tube(lay, mat, ro, ri, h, pos, axis="z", **kw): return add(lay, "tube", mat, [ro, ri, h], pos, rot=AX[axis], **kw)
def anchor(name, lay, p, dx=100, dy=-80): anchors[name] = {"layer": lay, "p": [R(v) for v in p], "dx": dx, "dy": dy}
def aim(a, b):
    d = [b[i] - a[i] for i in range(3)]; ln = math.sqrt(sum(x * x for x in d)) or 1e-6; u = [x / ln for x in d]
    return ln, [(a[i] + b[i]) / 2 for i in range(3)], [math.degrees(math.asin(-u[1])), math.degrees(math.atan2(u[0], u[2])), 0]
def seg_cyl(lay, mat, r, a, b, grow=0.06):
    ln, mid, rot = aim(a, b); return add(lay, "cyl", mat, [r, ln + grow], mid, rot=rot)
def seg_box(lay, mat, w, h, a, b, grow=0.05):
    """沿水平線段（只轉 y）的長方體：長度沿線段、寬 w、高 h，中心在 a、b 中點"""
    dx, dz = b[0] - a[0], b[2] - a[2]; ln = math.hypot(dx, dz)
    return add(lay, "box", mat, [w, h, ln + grow], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], rot=[0, math.degrees(math.atan2(dx, dz)), 0])

# ───────────── 色票與材質 ─────────────
palette = {
    "floor": "#D8DEE7", "floorLn": "#B9C3D0", "hole": "#98A4B5", "wall": "#E6EAF0", "wallD": "#C6CFDB", "ffu": "#F7F9FC", "ffuFr": "#A9B5C5", "lamp": "#FFFFFF",
    "cab": "#E8ECF2", "cabEdge": "#BFC8D4", "panelD": "#29324A", "panelM": "#44506A", "steel": "#A5B2C6", "steelD": "#6F7D96", "chrome": "#D2DBE8", "pump": "#59667F",
    "copper": "#CC8B40", "copperD": "#9B6528", "blue": "#2F80ED", "blueD": "#1D4E9E", "yellow": "#F5B82E", "red": "#D93A2B", "green": "#27B07F", "amber": "#F29A2E", "black": "#1A1F2C",
    "glass": "#A9CCEE", "glassB": "#BBD4F2", "plasma": "#8B5CF6", "plasmaG": "#C4B0FF",
    "ion": "#F0553A", "ionH": "#2F5FD0", "ionL": "#14B38F", "plus": "#FFFFFF", "spark": "#FFD84A", "sparkW": "#FFFFFF", "beam": "#FF8A66",
    "si": "#BFCCE0", "siD": "#93A4C2", "atom": "#6C7DA6", "atom2": "#8A9BC2", "oxide": "#9FB3D6",
    "b0": "#7FE0E8", "b1": "#4FC3E8", "b2": "#2F9BEA", "b3": "#2F6FE0", "b4": "#4A5BD6", "b5": "#6B62D0", "b6": "#8A70CC", "b7": "#A98AD0", "b8": "#C3A6DA",
    "magGlow": "#6FB2FF", "lp_bad": "#E0472F",
}
def M(color, **k): return {"kind": "std", "color": color, "rough": 0.5, "metal": 0.1, **k}
materials = {
    "floor": M("floor", rough=.8), "floorLn": M("floorLn", rough=.9), "hole": M("hole", rough=.9), "wall": M("wall", rough=.85), "wallD": M("wallD", rough=.8),
    "ffu": M("ffu", rough=.7), "ffuFr": M("ffuFr", rough=.5, metal=.5), "lamp": {"kind": "unlit", "color": "lamp"},
    "cab": M("cab", rough=.45, metal=.15, env=.4), "cabEdge": M("cabEdge", rough=.5, metal=.3), "panelD": M("panelD", rough=.35, metal=.3, env=.6), "panelM": M("panelM", rough=.4, metal=.3),
    "steel": M("steel", rough=.3, metal=.85, env=.6), "steelD": M("steelD", rough=.4, metal=.7), "chrome": M("chrome", rough=.15, metal=.95, env=1.0), "pump": M("pump", rough=.4, metal=.6),
    "copper": M("copper", rough=.3, metal=.9, env=.7), "copperD": M("copperD", rough=.35, metal=.85), "blue": M("blue", rough=.4, metal=.2), "blueD": M("blueD", rough=.4, metal=.25),
    "yellow": M("yellow", rough=.5), "red": M("red", rough=.5), "black": M("black", rough=.6),
    "ledG": {"kind": "unlit", "color": "green"}, "ledR": {"kind": "unlit", "color": "red"}, "ledA": {"kind": "unlit", "color": "amber"}, "ledB": {"kind": "unlit", "color": "blue"},
    "glass": {"kind": "phys", "color": "glass", "rough": 0.1, "metal": 0, "clearcoat": 0.8, "opacity": 0.2, "env": 0.5},
    "glassL": {"kind": "phys", "color": "glassB", "rough": 0.1, "metal": 0, "clearcoat": 0.8, "opacity": 0.12, "env": 0.5},
    "glassTop": {"kind": "phys", "color": "glassB", "rough": 0.1, "metal": 0, "clearcoat": 0.8, "opacity": 0.28, "env": 0.5},
    "plasma": {"kind": "std", "color": "plasma", "rough": .3, "metal": 0, "emissive": "plasma", "ei": 0.7},
    "plasmaHalo": {"kind": "unlit", "color": "plasmaG", "opacity": 0.28},
    "si": M("si", rough=.35, metal=.4, env=.5), "siD": M("siD", rough=.4, metal=.5), "atom": M("atom", rough=.3, metal=.5, env=.5), "atom2": M("atom2", rough=.35, metal=.4),
    "oxide": {"kind": "phys", "color": "oxide", "rough": .2, "metal": 0, "clearcoat": .8, "opacity": .55},
    "spark": {"kind": "unlit", "color": "spark"}, "sparkW": {"kind": "unlit", "color": "sparkW"}, "sparkHalo": {"kind": "unlit", "color": "spark", "opacity": 0.5},
    "beamC": {"kind": "unlit", "color": "beam", "opacity": 0.22}, "spot": {"kind": "unlit", "color": "ion", "opacity": 0.8},
    "coilG": {"kind": "std", "color": "copper", "rough": .3, "metal": .9, "env": .7},
}
# 離子（三種：對的離子珊瑚色、太重的藍色大球、太輕的青綠小球），每種有本體、加號、光暈、三階拖尾
for t, c in (("c", "ion"), ("h", "ionH"), ("l", "ionL")):
    materials[f"ion_{t}"] = {"kind": "std", "color": c, "rough": .25, "metal": .1, "emissive": c, "ei": 0.45}
    materials[f"halo_{t}"] = {"kind": "unlit", "color": c, "opacity": 0.2}
    for k, op in ((1, .55), (2, .36), (3, .2)):
        materials[f"g{k}_{t}"] = {"kind": "std", "color": c, "rough": .4, "metal": 0, "emissive": c, "ei": 0.6, "opacity": op}
materials["plus"] = {"kind": "std", "color": "plus", "rough": .3, "metal": 0, "emissive": "plus", "ei": 0.9}
for i in range(9):
    materials[f"band{i}"] = {"kind": "unlit", "color": f"b{i}", "opacity": 0.5}
materials = {("m_" + k): v for k, v in materials.items()}

# ───────────── 常數 ─────────────
BY = 7.5            # 射束高度
RT = 1.1           # 射束管半徑
E0 = (-21.0, BY, 8.0)     # 離子出離子源的位置
M0 = (-4.5, 8.0)    # 分析磁鐵入口（x,z）
BZ = 9.0            # 磁鐵彎道尺寸（二次貝茲控制點在 (M0.x+9, 8)，終點 (M0.x+9, 8-9)）
M1 = (M0[0] + BZ, 8.0 - BZ)   # 磁鐵出口 (4.5, -1)
LEG2_END = -19.0    # 第二段直管終點 z
DROP_Z = -24.0      # 往下彎的角落 z（也是晶圓中心 z）
NOZ_Y = 3.5         # 噴嘴出口高度
WAF = (4.5, 1.5, DROP_Z)      # 晶圓中心（表面高度約 1.56）
XS = (27.0, 0.0, -24.0)       # 剖面放大面板的中心 x、z
XS_TOP = 7.2
def bez(t, p0, p1, p2): return [(1 - t) ** 2 * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i] for i in range(len(p0))]
CEN = [bez(i / 200, M0, (M0[0] + BZ, 8.0), M1) for i in range(201)]   # 磁鐵裡的中心線（x,z）
def dist_center(x, z): return min(math.hypot(x - a, z - b) for a, b in CEN)

# ═══════════════ 背景：無塵室 ═══════════════
BG = "bg"
layer(BG, bg=True)
box(BG, "floor", [200, 0.4, 190], [0, -0.2, -20])
# 高架地板格線（每格 2）
xs = [i * 2 for i in range(-45, 46)]
zs = [i * 2 for i in range(-50, 22)]
box(BG, "floorLn", [190, 0.03, 0.09], [0, 0.01, 0], at=[[0, 0, z] for z in zs])
box(BG, "floorLn", [0.09, 0.03, 150], [0, 0.011, -26], at=[[x, 0, 0] for x in xs])
# 透氣孔（每格中央一個，隔格）
holes = [[x + 1, 0, z + 1] for x in xs[:-1] for z in zs[:-1] if (round(x / 2) + round(z / 2)) % 2 == 0 and -34 <= x <= 56 and -52 <= z <= 14]
box(BG, "hole", [0.55, 0.025, 0.55], [0, 0.012, 0], at=holes)
# 機台底下的地面黃黑安全線（框住整條機台）
for (cx, cz, w, d) in [(-8, 4, 42, 15), (4.5, -17, 17, 32)]:
    pass
def floor_frame(x0, x1, z0, z1, mat="yellow", t=0.35):
    y = 0.02
    box(BG, mat, [x1 - x0, 0.03, t], [(x0 + x1) / 2, y, z0]); box(BG, mat, [x1 - x0, 0.03, t], [(x0 + x1) / 2, y, z1])
    box(BG, mat, [t, 0.03, z1 - z0], [x0, y, (z0 + z1) / 2]); box(BG, mat, [t, 0.03, z1 - z0], [x1, y, (z0 + z1) / 2])
floor_frame(-34, 12, 1.5, 15.5); floor_frame(-3.5, 14.5, -33.5, 1.5)
# 後牆（含上緣一排天花板過濾器格＋燈）
box(BG, "wall", [200, 46, 0.8], [0, 23, -78])
for x in range(-96, 97, 8): box(BG, "wallD", [0.12, 36, 0.12], [x, 18, -77.5])
box(BG, "ffuFr", [200, 0.5, 2.0], [0, 40, -76.8]); box(BG, "ffuFr", [200, 0.5, 2.0], [0, 29.5, -76.8])
ffu = [[x, 0, 0] for x in range(-96, 97, 6)]
box(BG, "ffu", [5.4, 9.4, 0.3], [0, 34.8, -77.2], at=ffu)
box(BG, "ffuFr", [0.4, 10.2, 0.5], [0, 34.8, -77.0], at=[[x + 3, 0, 0] for x in range(-96, 97, 6)])
box(BG, "lamp", [4.0, 0.25, 0.4], [0, 42.5, -76.6], at=[[x, 0, 0] for x in range(-90, 91, 12)])
# 左右側牆（遠）
box(BG, "wall", [0.8, 46, 190], [-96, 23, -20]); box(BG, "wall", [0.8, 46, 190], [96, 23, -20])
# 天花板過濾器格：後方一片（只在最遠處，避免擋住鏡頭）
box(BG, "ffuFr", [200, 0.5, 20], [0, 45.5, -66])
box(BG, "ffu", [5.4, 0.3, 5.4], [0, 45.2, -66], at=[[x, 0, z] for x in range(-96, 97, 6) for z in (-72, -66, -60)])
# 遠處的其他機台輪廓
def far_tool(name, cx, cz, w, h, d, col_led=("ledG", "ledA")):
    L = "far_" + name; layer(L, bg=True)
    box(L, "cab", [w, h, d], [cx, h / 2, cz]); box(L, "cabEdge", [w + 0.4, 0.5, d + 0.4], [cx, 0.25, cz]); box(L, "cabEdge", [w + 0.3, 0.4, d + 0.3], [cx, h + 0.2, cz])
    box(L, "panelD", [w * 0.62, h * 0.52, 0.15], [cx - w * 0.12, h * 0.55, cz + d / 2 + 0.08])
    box(L, "panelM", [w * 0.62 - 0.6, 0.12, 0.05], [cx - w * 0.12, h * 0.55 + 0.4, cz + d / 2 + 0.2], at=[[0, 0, 0], [0, -0.9, 0], [0, -1.8, 0]])
    box(L, "cabEdge", [0.1, h - 0.6, 0.1], [cx + w * 0.34, h / 2, cz + d / 2 + 0.06])
    box(L, "steelD", [0.35, 2.4, 0.35], [cx + w / 2 - 0.9, h + 1.4, cz - d / 2 + 0.9])
    sph(L, "ledG", 0.3, [cx + w / 2 - 0.9, h + 2.2, cz - d / 2 + 0.9]); sph(L, "ledA", 0.3, [cx + w / 2 - 0.9, h + 2.8, cz - d / 2 + 0.9])
    cyl(L, "pump", 0.9, 3.0, [cx + w / 2 + 1.2, 1.6, cz], axis="y"); box(L, "steelD", [1.6, 0.18, 0.6], [cx + w / 2 + 0.5, 3.2, cz])
far_tool("a", -48, -44, 15, 10, 11); far_tool("b", -22, -52, 13, 9, 10); far_tool("c", -4, -52, 14, 11, 12); far_tool("d", 56, -42, 14, 10, 11)
far_tool("e", 52, -4, 10, 9, 16); far_tool("f", -52, -8, 10, 9, 16)
box(BG, "steelD", [60, 0.25, 1.4], [0, 13.5, -58], at=[[0, 0, 0]])   # 天花板的纜線槽
box(BG, "steelD", [0.25, 12.5, 0.25], [0, 7.2, -58], at=[[x, 0, 0] for x in (-28, -8, 14, 30)])

# ═══════════════ 離子源（高壓終端櫃）═══════════════
S = "src"; layer(S)
SX, SZ = -26.0, 8.0
box(S, "steelD", [9.4, 0.8, 9.4], [SX, 0.4, SZ])
box(S, "cab", [8.4, 12.5, 8.4], [SX, 7.05, SZ])
box(S, "cabEdge", [8.7, 0.4, 8.7], [SX, 13.5, SZ]); box(S, "cabEdge", [8.7, 0.35, 8.7], [SX, 1.0, SZ])
box(S, "panelD", [6.4, 7.0, 0.15], [SX, 6.2, SZ + 4.25])                       # 正面深色面板
box(S, "panelM", [5.9, 0.08, 0.06], [SX, 6.2, SZ + 4.36], at=[[0, y, 0] for y in (-2.9, -1.9, -0.9, 0.1, 1.1, 2.1, 3.0)])  # 面板橫線
box(S, "cabEdge", [0.1, 12.2, 0.12], [SX, 7.05, SZ + 4.22], at=[[-3.9, 0, 0], [3.9, 0, 0], [0, 0, 0]])   # 門縫
box(S, "cabEdge", [8.3, 0.1, 0.12], [SX, 3.3, SZ + 4.22]); box(S, "cabEdge", [8.3, 0.1, 0.12], [SX, 10.2, SZ + 4.22])
for k, m in enumerate(["ledG", "ledG", "ledG", "ledA", "ledR", "ledB"]):
    sph(S, m, 0.17, [SX - 2.2 + k * 0.62, 8.9, SZ + 4.4])
for sx_ in (-3.1, 3.1):                                                          # 螺絲
    for sy_ in (3.2, 9.3): cyl(S, "chrome", 0.12, 0.1, [SX + sx_, sy_, SZ + 4.34])
cyl(S, "chrome", 0.12, 0.1, [SX, 6.2, SZ + 4.34], at=[[x, y, 0] for x in (-3.8, 3.8) for y in (-4.4, 4.4)] if False else None)
cyl(S, "chrome", 0.13, 0.1, [SX, 7.05, SZ + 4.24], at=[[x, y, 0] for x in (-3.95, 3.95) for y in (-5.7, 5.7, 0)])
for k in range(8): box(S, "panelD", [3.3, 0.12, 0.08], [SX, 1.9 + k * 0.28, SZ + 4.24])      # 散熱格柵
box(S, "yellow", [2.3, 1.9, 0.08], [SX - 4.9 + 0.0, 8.6, SZ + 4.3]) if False else None
box(S, "yellow", [2.4, 2.0, 0.08], [SX - 2.5, 11.7, SZ + 4.25])                  # 高壓警示牌
box(S, "black", [0.95, 0.95, 0.06], [SX - 2.5, 11.75, SZ + 4.3], rot=[0, 0, 45])
box(S, "yellow", [0.12, 0.5, 0.06], [SX - 2.5, 11.85, SZ + 4.34]); box(S, "yellow", [0.12, 0.12, 0.06], [SX - 2.5, 11.45, SZ + 4.34])
box(S, "red", [2.4, 0.22, 0.08], [SX - 2.5, 10.6, SZ + 4.25])
box(S, "yellow", [0.5, 0.18, 0.08], [SX + 2.2, 11.7, SZ + 4.25], at=[[i * 0.7, 0, 0] for i in range(-2, 3)])  # 黃黑斜紋條（簡化）
box(S, "black", [0.3, 0.18, 0.08], [SX + 2.55, 11.7, SZ + 4.25], at=[[i * 0.7, 0, 0] for i in range(-2, 2)])
sph(S, "chrome", 2.1, [SX, 15.2, SZ], scale=[1, 0.75, 1])                          # 高壓圓頂
cyl(S, "steelD", 0.9, 1.4, [SX, 14.1, SZ], axis="y")
# 氣瓶與氣管
cyl(S, "blueD", 0.8, 4.4, [SX - 6.5, 2.6, SZ + 1.2], axis="y"); sph(S, "blueD", 0.8, [SX - 6.5, 4.8, SZ + 1.2], scale=[1, 0.6, 1]); cyl(S, "chrome", 0.2, 0.7, [SX - 6.5, 5.5, SZ + 1.2], axis="y")
cyl(S, "chrome", 0.12, 3.0, [SX - 5.2, 5.5, SZ + 1.2], axis="x"); cyl(S, "chrome", 0.12, 2.2, [SX - 3.7, 5.5 + 0, SZ + 1.2], axis="y") if False else None
box(S, "steelD", [0.3, 0.3, 0.3], [SX - 6.5, 6.0, SZ + 1.2])
# 離子源頭（水平圓筒＋玻璃觀察窗＋電漿）
cyl(S, "steelD", 1.95, 3.6, [SX + 2.7 + 0.0, BY, SZ], axis="x") if False else None
HX = -22.7
cyl(S, "steel", 1.95, 3.0, [HX, BY, SZ], axis="x"); tube(S, "chrome", 2.2, 1.65, 0.35, [HX + 1.45, BY, SZ], axis="x"); tube(S, "chrome", 2.2, 1.65, 0.35, [HX - 1.45, BY, SZ], axis="x")
cyl(S, "chrome", 1.15, 0.5, [HX, BY + 1.85, SZ], axis="y")
add(S, "cyl", "glassTop", [0.95, 0.3], [HX, BY + 2.18, SZ], rot=AX["y"])
sph(S, "plasma", 0.62, [HX, BY + 1.7, SZ], pid="plasma"); sph(S, "plasmaHalo", 1.0, [HX, BY + 1.7, SZ])
tube(S, "chrome", 2.0, 1.55, 0.25, [HX + 1.7, BY, SZ], axis="x")
cyl(S, "chrome", 0.14, 0.6, [HX, BY, SZ], at=[[1.7 * math.cos(a), 1.7 * math.sin(a), 1.62] for a in [i * math.pi / 4 for i in range(8)]]) if False else None
# 抽出電極：兩片小板
box(S, "chrome", [0.15, 2.4, 2.4], [-21.15, BY, SZ]); box(S, "chrome", [0.12, 1.6, 1.6], [-20.95, BY, SZ])
# 源頭的支撐基座與纜線
box(S, "steelD", [3.6, BY - 3.0 - 1.9, 1.8], [HX, (BY - 1.9 + 3.0) / 2, SZ])
box(S, "cabEdge", [3.6, 0.3, 4.2], [HX, 3.0, SZ])
seg_cyl(S, "red", 0.13, (SX, 16.7, SZ), (SX + 3.2, 11.6, SZ + 1.5)); seg_cyl(S, "red", 0.13, (SX + 3.2, 11.6, SZ + 1.5), (-20.3, 9.0, SZ + 1.9)) if False else None
anchor("a_src", S, [HX, BY + 2.4, SZ], dx=-170, dy=-70)

# ═══════════════ 加速管（分段電極環）═══════════════
A = "acc"; layer(A)
AX0, AX1 = -20.6, M0[0]
cyl(A, "glass", RT, AX1 - AX0 + 0.05, [(AX0 + AX1) / 2, BY, 8.0], axis="x", pid="acc_tube")
ring_x = [AX0 + 1.6 + i * 1.6 for i in range(10)]
for i, x in enumerate(ring_x):
    tube(A, "chrome", 2.15, 1.5, 0.32, [x, BY, 8.0], axis="x", pid=f"acc_r{i}")
    tube(A, "copperD", 1.85, 1.52, 0.12, [x + 0.24, BY, 8.0], axis="x")
rods = []
for k in range(6):
    a = k * math.pi / 3
    rods.append([0, 1.95 * math.sin(a), 1.95 * math.cos(a)])
cyl(A, "steelD", 0.1, ring_x[-1] - ring_x[0] + 0.3, [(ring_x[0] + ring_x[-1]) / 2, BY, 8.0], axis="x", at=rods)
# 環與環之間的絕緣陶瓷塊（短、細，不擋離子）
for i in range(len(ring_x) - 1):
    cx = (ring_x[i] + ring_x[i + 1]) / 2
    cyl(A, "cab", 0.28, 0.9, [cx, BY - 1.5, 8.0], axis="x", at=[[0, 0, 0], [0, 0.0, 0]] if False else None)
# 兩端法蘭
tube(A, "chrome", 1.75, RT, 0.3, [AX0 + 0.1, BY, 8.0], axis="x"); tube(A, "chrome", 1.75, RT, 0.3, [AX1 - 0.1, BY, 8.0], axis="x")
cyl(A, "chrome", 0.09, 0.45, [AX0 + 0.1, BY, 8.0], axis="x", at=[[0, 1.5 * math.sin(i * math.pi / 4), 1.5 * math.cos(i * math.pi / 4)] for i in range(8)])
cyl(A, "chrome", 0.09, 0.45, [AX1 - 0.1, BY, 8.0], axis="x", at=[[0, 1.5 * math.sin(i * math.pi / 4), 1.5 * math.cos(i * math.pi / 4)] for i in range(8)])
# 支撐桁架
box(A, "steelD", [AX1 - AX0, 0.4, 2.0], [(AX0 + AX1) / 2, BY - 2.4, 8.0]); box(A, "cabEdge", [AX1 - AX0, 0.2, 2.4], [(AX0 + AX1) / 2, BY - 2.65, 8.0])
for x in (-18.5, -12.5, -6.5):
    box(A, "cab", [0.9, BY - 2.8, 1.5], [x, (BY - 2.8) / 2, 8.0]); box(A, "steelD", [1.5, 0.3, 2.2], [x, 0.15, 8.0])
    box(A, "steelD", [0.15, BY - 3.4, 0.15], [x, (BY - 3.4) / 2 + 0.3, 8.0], at=[[0.5, 0, 0.8], [-0.5, 0, 0.8], [0.5, 0, -0.8], [-0.5, 0, -0.8]])
# 真空幫浦（從管子中段接下去）
cyl(A, "chrome", 0.55, BY - 1.0 - 3.6, [-12.5, (BY - 1.0 + 3.6) / 2 + 0.0, 10.0], axis="y") if False else None
seg_cyl(A, "steel", 0.55, (-12.5, BY - 0.85, 8.0), (-12.5, BY - 0.85, 11.2)); seg_cyl(A, "steel", 0.55, (-12.5, BY - 0.85, 11.2), (-12.5, 3.7, 11.2)) if False else None
cyl(A, "steel", 0.55, 3.6, [-12.5, BY - 0.85, 9.5], axis="z")
tube(A, "chrome", 0.95, 0.5, 0.25, [-12.5, BY - 0.85, 11.35], axis="z")
cyl(A, "steel", 0.55, BY - 0.85 - 3.8, [-12.5, (BY - 0.85 + 3.8) / 2, 11.5], axis="y")
cyl(A, "pump", 1.55, 3.2, [-12.5, 2.2, 11.5], axis="y"); cyl(A, "chrome", 1.62, 0.18, [-12.5, 3.9, 11.5], axis="y")
for i in range(4): cyl(A, "steelD", 1.62, 0.12, [-12.5, 0.9 + i * 0.7, 11.5], axis="y")
sph(A, "ledG", 0.14, [-12.5, 3.2, 13.1])
# 高壓電纜（從高壓圓頂拉到第一環）
seg_cyl(A, "red", 0.11, (-26.0, 16.5, 8.0), (-24.2, 17.8, 8.0)) if False else None
anchor("a_acc", A, [-12.5, BY + 1.6, 8.0], dx=-30, dy=-150)

# ═══════════════ 分析磁鐵 ═══════════════
G = "mag"; layer(G)
for i in range(24):
    a, b = bez(i / 24, M0, (M0[0] + BZ, 8.0), M1), bez((i + 1) / 24, M0, (M0[0] + BZ, 8.0), M1)
    seg_cyl(G, "glass", RT, (a[0], BY, a[1]), (b[0], BY, b[1]), grow=0.12)
tube(G, "chrome", 1.75, RT, 0.3, [M0[0] + 0.1, BY, 8.0], axis="x"); tube(G, "chrome", 1.75, RT, 0.3, [M1[0], BY, M1[1] - 0.1], axis="z")
# 下軛鐵（整條彎道）與下層、上層外殼（半透明）
PL = 12
pts = [bez(i / PL, M0, (M0[0] + BZ, 8.0), M1) for i in range(PL + 1)]
for i in range(PL):
    a, b = (pts[i][0], BY - 3.1, pts[i][1]), (pts[i + 1][0], BY - 3.1, pts[i + 1][1])
    seg_box(G, "blue", 6.0, 0.7, a, b, grow=0.9)
    a2, b2 = (pts[i][0], BY + 3.0, pts[i][1]), (pts[i + 1][0], BY + 3.0, pts[i + 1][1])
    seg_box(G, "glassTop", 6.0, 0.35, a2, b2, grow=0.9)
    # 外側與內側立板（鐵芯外殼）
for i in range(PL):
    a, b = pts[i], pts[i + 1]
    dx, dz = b[0] - a[0], b[1] - a[1]; ln = math.hypot(dx, dz); nx, nz = -dz / ln, dx / ln
    for s in (1, -1):
        seg_box(G, "glassTop", 0.3, 5.4, (a[0] + s * 3.0 * nx, BY - 0.2, a[1] + s * 3.0 * nz), (b[0] + s * 3.0 * nx, BY - 0.2, b[1] + s * 3.0 * nz), grow=0.8)
        seg_box(G, "chrome", 0.5, 0.18, (a[0] + s * 3.0 * nx, BY + 2.6, a[1] + s * 3.0 * nz), (b[0] + s * 3.0 * nx, BY + 2.6, b[1] + s * 3.0 * nz), grow=0.8)
# 線圈（銅）：兩處、各上下一組；每組兩圈同心、中間銅色交錯
COIL_T = (0.3, 0.7)
coil_ids = []
for t in COIL_T:
    cx, cz = bez(t, M0, (M0[0] + BZ, 8.0), M1)
    for sy in (1, -1):
        y = BY + sy * 2.0
        coil_ids.append(tube(G, "copper", 2.4, 1.85, 0.9, [cx, y, cz], axis="y", pid=f"coil_{t}_{sy}_a"))
        coil_ids.append(tube(G, "copperD", 1.88, 1.3, 0.95, [cx, y, cz], axis="y", pid=f"coil_{t}_{sy}_b"))
        cyl(G, "steel", 1.2, 1.3, [cx, BY + sy * 2.05, cz], axis="y")
        tube(G, "chrome", 2.45, 2.35, 0.2, [cx, y + sy * 0.55, cz], axis="y")
# 四角立柱與腳架
for i in (0, PL // 3, 2 * PL // 3, PL):
    for s in (1, -1):
        if i == PL: nx, nz = 1, 0
        elif i == 0: nx, nz = 0, 1
        else:
            a, b = pts[i], pts[i + 1]; dx, dz = b[0] - a[0], b[1] - a[1]; ln = math.hypot(dx, dz); nx, nz = -dz / ln, dx / ln
        px, pz = pts[i][0] + s * 3.0 * nx, pts[i][1] + s * 3.0 * nz
        box(G, "cab", [0.9, BY - 3.45, 0.9], [px, (BY - 3.45) / 2, pz]); box(G, "steelD", [1.4, 0.25, 1.4], [px, 0.125, pz])
cyl(G, "chrome", 0.1, 0.5, [0, 0, 0], at=[[pts[i][0] + 3.0 * (-(pts[i + 1][1] - pts[i][1])) / max(1e-6, math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])), BY + 2.6 + 0.25, pts[i][1] + 3.0 * (pts[i + 1][0] - pts[i][0]) / max(1e-6, math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]))] for i in range(PL)], axis="y") if False else None
box(G, "red", [1.6, 0.9, 0.08], [pts[2][0] - 1.0, BY + 0.9, pts[2][1] + 3.4]) if False else None
mid = bez(0.5, M0, (M0[0] + BZ, 8.0), M1)
box(G, "yellow", [1.9, 1.3, 0.08], [pts[PL // 2][0] - 2.4, BY - 0.3, pts[PL // 2][1] + 2.95], rot=[0, 45 - 0, 0]) if False else None
anchor("a_mag", G, [mid[0] + 0.4, BY + 3.5, mid[1] + 0.4], dx=150, dy=-130)

# ═══════════════ 第二段射束管線（法蘭、四極透鏡、掃描板、閘閥、波紋管）═══════════════
B = "beam"; layer(B)
X2 = M1[0]
def leg_z(z0, z1): return (z0 + z1) / 2, abs(z1 - z0)
cz_, ln_ = leg_z(M1[1], LEG2_END)
cyl(B, "glass", RT, ln_ + 0.1, [X2, BY, cz_], axis="z")
for z in (-3.5, -7.5, -11.5, -15.5, -19.0):
    tube(B, "chrome", 1.75, RT, 0.3, [X2, BY, z], axis="z")
    cyl(B, "chrome", 0.09, 0.45, [X2, BY, z], axis="z", at=[[1.5 * math.cos(i * math.pi / 4), 1.5 * math.sin(i * math.pi / 4), 0] for i in range(8)])
# 四極透鏡（四根磁極＋線圈塊，不遮住離子）
for zc in (-5.3,):
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2
        cyl(B, "blueD", 0.4, 2.4, [X2 + 1.85 * math.cos(a), BY + 1.85 * math.sin(a), zc], axis="z")
        box(B, "copper", [1.0, 1.0, 1.3], [X2 + 2.6 * math.cos(a), BY + 2.6 * math.sin(a), zc])
    tube(B, "chrome", 3.2, 3.0, 0.15, [X2, BY, zc - 1.25], axis="z"); tube(B, "chrome", 3.2, 3.0, 0.15, [X2, BY, zc + 1.25], axis="z")
# 掃描板（上下兩片）＋纜線
for sy in (1, -1):
    box(B, "chrome", [2.4, 0.14, 3.2], [X2, BY + sy * 1.6, -9.4]); box(B, "steelD", [0.1, 0.9, 3.2], [X2 + 1.2, BY + sy * 2.05, -9.4])
box(B, "glassTop", [3.0, 0.2, 4.0], [X2, BY + 2.75, -9.4]); box(B, "panelM", [3.0, 0.3, 4.0], [X2, BY - 2.75, -9.4])
seg_cyl(B, "red", 0.09, (X2 + 1.0, BY + 2.4, -9.4), (X2 + 3.2, BY + 3.4, -9.4)); seg_cyl(B, "black", 0.09, (X2 + 1.0, BY - 2.4, -9.4), (X2 + 3.2, BY - 3.4, -9.4))
# 閘閥
box(B, "cab", [3.6, 4.2, 1.1], [X2, BY - 0.0, -13.5]); box(B, "yellow", [3.62, 0.5, 1.12], [X2, BY + 1.7, -13.5]); tube(B, "red", 0.8, 0.26, 0.2, [X2, BY - 0.3, -12.85], axis="z")
cyl(B, "chrome", 0.1, 0.2, [X2, BY, -13.5], axis="z", at=[[x, y, 0.62] for x in (-1.5, 1.5) for y in (-1.8, 1.8)])
# 波紋管
for i in range(7): tube(B, "chrome" if i % 2 == 0 else "steelD", 1.5, RT - 0.05, 0.22, [X2, BY, -16.4 + i * 0.28], axis="z")
# 底下的樑與腳架、真空幫浦
box(B, "steelD", [0.9, 0.5, 19.6], [X2, BY - 2.5, cz_]); box(B, "cabEdge", [1.4, 0.2, 19.6], [X2, BY - 2.75, cz_])
for z in (-2.2, -7.5, -11.6, -17.5):
    box(B, "cab", [0.9, BY - 2.8, 1.2], [X2, (BY - 2.8) / 2, z]); box(B, "steelD", [1.8, 0.3, 1.8], [X2, 0.15, z])
cyl(B, "steel", 0.55, 3.4, [X2 + 1.6, BY - 0.85, -7.0], axis="x") if False else None
seg_cyl(B, "steel", 0.5, (X2, BY - 0.85, -7.3), (X2 + 3.0, BY - 0.85, -7.3)) if False else None
cyl(B, "steel", 0.55, 3.0, [X2 + 1.5, BY - 0.85, -7.3], axis="x"); cyl(B, "steel", 0.55, BY - 0.85 - 3.0, [X2 + 3.0, (BY - 0.85 + 3.0) / 2, -7.3], axis="y")
cyl(B, "pump", 1.5, 3.0, [X2 + 3.0, 1.6, -7.3], axis="y"); cyl(B, "chrome", 1.58, 0.16, [X2 + 3.0, 3.18, -7.3], axis="y")
for i in range(3): cyl(B, "steelD", 1.58, 0.1, [X2 + 3.0, 0.7 + i * 0.7, -7.3], axis="y")
anchor("a_leg", B, [X2, BY + 2.4, -9.4], dx=130, dy=-80)

# 往下彎進終端站（二次貝茲：(z=-19,y=7.5) → 角 (z=-24,y=7.5) → (z=-24,y=3.5)）
DR = "drop"; layer(DR)
for i in range(10):
    a = bez(i / 10, (LEG2_END, BY), (DROP_Z, BY), (DROP_Z, NOZ_Y)); b = bez((i + 1) / 10, (LEG2_END, BY), (DROP_Z, BY), (DROP_Z, NOZ_Y))
    seg_cyl(DR, "glass", RT, (X2, a[1], a[0]), (X2, b[1], b[0]), grow=0.12)
tube(DR, "chrome", 1.75, RT, 0.3, [X2, NOZ_Y + 0.2, DROP_Z], axis="y"); tube(DR, "steel", 2.2, 1.3, 0.4, [X2, NOZ_Y - 0.15, DROP_Z], axis="y")
cyl(DR, "cab", 1.25, 0.6, [X2, NOZ_Y + 1.0, DROP_Z], axis="y") if False else None
box(DR, "steelD", [0.9, BY - 1.0, 0.9], [X2, (BY - 1.0 + 0.5) / 2 + 0.0, DROP_Z - 1.8]) if False else None
box(DR, "cab", [1.1, 4.2, 1.1], [X2, 2.1 + 2.0, DROP_Z - 2.6]) if False else None
box(DR, "cab", [0.9, BY - 0.9, 0.9], [X2, (BY - 0.9) / 2, DROP_Z - 2.6]); box(DR, "steelD", [1.6, 0.3, 1.6], [X2, 0.15, DROP_Z - 2.6])
box(DR, "steelD", [0.6, 0.5, 2.9], [X2, BY - 0.9, DROP_Z - 1.3]) if False else None

# ═══════════════ 終端站（晶圓載台、玻璃防護罩、光束斑）═══════════════
ES = "es"; layer(ES)
EX, EZ = WAF[0], WAF[2]
box(ES, "cab", [16, 1.0, 16], [EX, 0.5, EZ]); box(ES, "cabEdge", [16.4, 0.3, 16.4], [EX, 0.15, EZ])
box(ES, "cabEdge", [16.2, 0.25, 16.2], [EX, 1.0, EZ])
for k in range(8):   # 黃黑警示條（前緣）
    box(ES, "yellow" if k % 2 == 0 else "black", [1.0, 0.04, 0.6], [EX - 7.0 + k * 2.0, 1.14, EZ + 7.5])
box(ES, "panelD", [6, 0.7, 0.1], [EX - 3.5, 0.55, EZ + 8.05]); sph(ES, "ledG", 0.14, [EX - 5.5, 0.55, EZ + 8.15]); sph(ES, "ledA", 0.14, [EX - 5.0, 0.55, EZ + 8.15]); sph(ES, "ledR", 0.14, [EX - 4.5, 0.55, EZ + 8.15])
box(ES, "panelD", [10.5, 0.14, 1.4], [EX, 1.1, EZ]) if False else None
# 防護罩：四根立柱＋玻璃板
for sx in (-1, 1):
    for sz in (-1, 1): box(ES, "steel", [0.5, 4.0, 0.5], [EX + sx * 7.2, 3.0, EZ + sz * 7.2])
box(ES, "steel", [14.9, 0.35, 0.35], [EX, 5.0, EZ + 7.2]); box(ES, "steel", [14.9, 0.35, 0.35], [EX, 5.0, EZ - 7.2])
box(ES, "steel", [0.35, 0.35, 14.9], [EX + 7.2, 5.0, EZ]); box(ES, "steel", [0.35, 0.35, 14.9], [EX - 7.2, 5.0, EZ])
box(ES, "glassL", [14.6, 3.6, 0.1], [EX, 3.0, EZ + 7.2]); box(ES, "glassL", [0.1, 3.6, 14.6], [EX + 7.2, 3.0, EZ]); box(ES, "glassL", [0.1, 3.6, 14.6], [EX - 7.2, 3.0, EZ])
# 側邊：晶圓匣（FOUP）與幫浦
box(ES, "cab", [3.2, 4.2, 3.2], [EX - 12.0, 3.1, EZ + 1.0]); box(ES, "panelD", [2.6, 1.3, 0.1], [EX - 12.0, 3.6, EZ + 2.65])
for k in range(5): box(ES, "chrome", [2.3, 0.06, 0.05], [EX - 12.0, 2.3 + k * 0.4, EZ + 2.7])
box(ES, "steelD", [3.4, 0.3, 3.4], [EX - 12.0, 1.0 + 0.0, EZ + 1.0]); box(ES, "steelD", [0.9, 1.0, 0.9], [EX - 12.0, 0.5, EZ + 1.0])
cyl(ES, "steel", 0.5, 3.2, [EX - 9.0, 1.9 + 0.0, EZ + 1.0], axis="x") if False else None
box(ES, "cab", [3.2, 0.5, 1.0], [EX - 9.0, 3.4, EZ + 1.0]) if False else None
cyl(ES, "pump", 1.9, 4.2, [EX + 12.0, 2.1, EZ - 1.5], axis="y"); cyl(ES, "chrome", 2.0, 0.2, [EX + 12.0, 4.3, EZ - 1.5], axis="y")
for i in range(5): cyl(ES, "steelD", 2.0, 0.1, [EX + 12.0, 0.7 + i * 0.7, EZ - 1.5], axis="y")
seg_cyl(ES, "steel", 0.55, (EX + 9.0, 1.4, EZ - 1.5), (EX + 12.0, 1.4, EZ - 1.5)) if False else None
cyl(ES, "steel", 0.55, 3.2, [EX + 9.8, 2.0, EZ - 1.5], axis="x")
# 晶圓載台滑軌
box(ES, "panelD", [11.0, 0.08, 1.6], [EX, 1.06, EZ])
# 光束斑（晶圓上的亮點）
SP = "spot"; layer(SP)
cyl(SP, "spot", 0.55, 0.05, [EX, WAF[1] + 0.12, EZ], axis="y", pid="spot_c")
add(SP, "cyl", "beamC", [0.5, 2.0], [EX, NOZ_Y - 1.0, EZ], rot=AX["y"], pid="beam_v")
anchor("a_es", ES, [EX, 2.0, EZ + 1.0], dx=-120, dy=60)
# 晶圓（零件庫）
parts.append({"part": "wafer", "id": "wf", "pos": [WAF[0], WAF[1], WAF[2]], "r": 3.4, "step": 0.62, "gap": 0.07, "bad": 0, "postH": 0.4, "label": {"dx": 100, "dy": 60}})

# ═══════════════ 剖面放大面板（矽、晶格、摻雜帶）═══════════════
XL = "xs"; layer(XL)
XCX, XCZ = XS[0], XS[2]
W_, H_, D_ = 12.0, 6.4, 1.0
YC = XS_TOP - H_ / 2
box(XL, "si", [W_, H_, D_], [XCX, YC, XCZ]); box(XL, "siD", [W_ + 0.3, 0.35, D_ + 0.3], [XCX, YC - H_ / 2 - 0.17, XCZ])
box(XL, "chrome", [W_ + 0.4, 0.12, 0.12], [XCX, XS_TOP + 0.0, XCZ + D_ / 2 + 0.06]) if False else None
box(XL, "chrome", [0.14, H_ + 0.3, 0.14], [XCX, YC - 0.1, XCZ + D_ / 2 + 0.07], at=[[-W_ / 2, 0, 0], [W_ / 2, 0, 0]])
box(XL, "chrome", [W_ + 0.14, 0.14, 0.14], [XCX, XS_TOP + 0.0, XCZ + D_ / 2 + 0.07], at=[[0, 0, 0]])
# 晶格原子（兩組錯位，前面）
sph(XL, "atom", 0.19, [XCX, YC - 0.05, XCZ + D_ / 2 + 0.03], pid="xs_atoms1") if False else None
nx_, ny_ = 21, 11
step = 0.56
p1 = {"id": "xs_atoms1", "layer": XL, "shape": "sphere", "size": [0.17], "pos": [XCX, YC - 0.1, XCZ + D_ / 2 + 0.05], "grid": {"n": [nx_, ny_], "step": [step, step]}, "mat": "m_atom"}
p2 = {"id": "xs_atoms2", "layer": XL, "shape": "sphere", "size": [0.12], "pos": [XCX + step / 2, YC - 0.1 + step / 2, XCZ + D_ / 2 + 0.05], "grid": {"n": [nx_ - 1, ny_ - 1], "step": [step, step]}, "mat": "m_atom2"}
parts.extend([p1, p2])
anchor("a_dope", "band3", [XCX - 4.5, XS_TOP - 2.0, XCZ + 0.9], dx=-120, dy=-110)
# 摻雜帶（深度分佈的高斯形：峰值約在 1.9 深）
NB = 9
for i in range(NB):
    L_ = f"band{i}"; layer(L_)
    cy = XS_TOP - 0.28 - i * 0.55
    gau = math.exp(-((0.28 + i * 0.55 - 1.9) / 1.15) ** 2)
    base = {"id": f"band{i}_p", "layer": L_, "shape": "box", "size": [W_ - 0.1, 0.55, 0.14], "pos": [XCX, cy, XCZ + D_ / 2 + 0.3], "mat": f"m_band{i}"}
    parts.append(base)
    materials[f"m_band{i}"]["opacity"] = round(0.18 + 0.62 * gau, 3)
# 面板底座
box(XL, "cab", [W_ + 1.2, 0.7, D_ + 1.2], [XCX, 0.35, XCZ]); box(XL, "cabEdge", [W_ + 1.5, 0.2, D_ + 1.5], [XCX, 0.1, XCZ])
box(XL, "steelD", [0.5, 0.7, 0.5], [XCX, YC - H_ / 2 - 0.55, XCZ], at=[[-W_ / 2 + 0.6, 0, 0], [W_ / 2 - 0.6, 0, 0]])
# 氧化層薄膜（表面）
box(XL, "oxide", [W_, 0.18, D_ + 0.05], [XCX, XS_TOP + 0.09, XCZ])
# 連到晶圓的虛線與放大框
ZL = "zoomline"; layer(ZL)
dots = [[x, 0, 0] for x in [WAF[0] + 4.4 + i * 0.95 for i in range(int((XCX - W_ / 2 - 0.8 - WAF[0] - 4.4) / 0.95))]]
box(ZL, "steel", [0.5, 0.06, 0.12], [0, 1.9, WAF[2]], at=dots)
tube(ZL, "red", 1.25, 1.1, 0.06, [WAF[0], WAF[1] + 0.1, WAF[2]], axis="y")
box(ZL, "red", [0.12, 3.0, 0.12], [XCX - W_ / 2 - 0.5, 4.5, XCZ + D_ / 2 + 0.05], at=[[0, 0, 0]]) if False else None
box(ZL, "red", [W_ + 1.0, 0.1, 0.1], [XCX, XS_TOP + 0.6, XCZ + D_ / 2 + 0.1]); box(ZL, "red", [W_ + 1.0, 0.1, 0.1], [XCX, YC - H_ / 2 - 0.6, XCZ + D_ / 2 + 0.1])
box(ZL, "red", [0.1, H_ + 1.3, 0.1], [XCX - W_ / 2 - 0.5, YC, XCZ + D_ / 2 + 0.1]); box(ZL, "red", [0.1, H_ + 1.3, 0.1], [XCX + W_ / 2 + 0.5, YC, XCZ + D_ / 2 + 0.1])

# ═══════════════ 離子（每顆一層＋三階拖尾）═══════════════
def ion_layers(name, kind, start, r):
    """kind c／h／l；start＝起始座標；回傳這顆離子的所有層 id（本體層、拖尾層）"""
    Lb = f"{name}"
    layer(Lb)
    sph(Lb, f"ion_{kind}", r, start); sph(Lb, f"halo_{kind}", r * 1.9, start)
    for ax_, size in ((0, [r * 2.6, 0.12, 0.12]), (1, [0.12, r * 2.6, 0.12]), (2, [0.12, 0.12, r * 2.6])):
        box(Lb, "plus", size, start)
    ids = [Lb]
    for k, f in ((1, 0.82), (2, 0.64), (3, 0.46)):
        Lg = f"{name}g{k}"; layer(Lg); sph(Lg, f"g{k}_{kind}", r * f, start); ids.append(Lg)
    return ids
LAGS = (3, 6, 9)       # 拖尾每一階落後的幀數（速度愈快，拖得愈長）
shifts = []
def A_(f): return f"s1:start{'+' if f >= 0 else '-'}{abs(int(round(f)))}"
def sh(layer_, at, dur, dx=0, dy=0, dz=0, **kw):
    d = {"layer": layer_, "at": A_(at), "dur": max(1, int(round(dur)))}
    if dx: d["dx"] = R(dx)
    if dy: d["dy"] = R(dy)
    if dz: d["dz"] = R(dz)
    d.update(kw); return d
def lin(layer_, at, dur, dx=0, dy=0, dz=0): return sh(layer_, at, dur, dx, dy, dz, throw=0)
def acc(layer_, at, dur, dx=0, dy=0, dz=0): return sh(layer_, at, dur, dx, dy, dz, fallOut=True)
def hide(layer_, until, dur=2): return sh(layer_, -40, dur, opacity=0, until=A_(until))
def vanish(layer_, at, dur=3): return sh(layer_, at, dur, opacity=0)

LA = abs(M0[0] - E0[0])     # 加速段長度
DA = 96                      # 加速段幀數
V0 = 0.16                    # 出發時已有的速度比例
V_END = LA * (V0 + 2 * (1 - V0)) / DA     # 加速結束時的速度（單位/幀）
ions = []       # (名稱, kind, r, t0, 轉彎比例 s, 結果)
ORDER = [("c", 1.0), ("l", 0.55), ("c", 1.0), ("h", 1.6), ("c", 1.0), ("l", 0.55), ("c", 1.0), ("h", 1.6)]
T0 = 88
GAP = 8
R_ION = {"c": 0.42, "h": 0.58, "l": 0.30}
sparks = []
events = {}
for n, (kind, s) in enumerate(ORDER):
    name = f"ion{n}"; r = R_ION[kind]; t0 = T0 + n * GAP
    ids = ion_layers(name, kind, E0, r)
    lags = (0,) + LAGS
    # 彎道參數：相同的二次貝茲，但尺寸乘 s（太重＝大圈、太輕＝小圈）
    Rs = BZ * s; thr = RT - r - 0.02
    th = 1.0
    if kind != "c":
        for i in range(1, 1001):
            t = i / 1000
            x = M0[0] + Rs * (2 * t - t * t); z = 8.0 - Rs * t * t
            if dist_center(x, z) >= thr: th = t; break
    dur_b = 2 * Rs * th / V_END
    tB = t0 + DA
    hit = None
    for ids_i, lag in zip(ids, lags):
        sh_list = shifts
        sh_list.append(hide(ids_i, t0 + lag))
        sh_list.append(lin(ids_i, t0 + lag, DA, dx=LA * V0))
        sh_list.append(acc(ids_i, t0 + lag, DA, dx=LA * (1 - V0)))
        # 彎道：x 方向線性 2·R·th、再扣掉 R·th² 的 a²；z 方向 −R·th² 的 a²
        sh_list.append(lin(ids_i, tB + lag, dur_b, dx=2 * Rs * th))
        sh_list.append(acc(ids_i, tB + lag, dur_b, dx=-Rs * th * th, dz=-Rs * th * th))
        if kind != "c":
            sh_list.append(vanish(ids_i, tB + dur_b + lag, 3))
    if kind != "c":
        hx = M0[0] + Rs * (2 * th - th * th); hz = 8.0 - Rs * th * th
        cx_, cz_ = min(CEN, key=lambda p: math.hypot(hx - p[0], hz - p[1]))
        nrm = (hx - cx_, hz - cz_); nl = math.hypot(*nrm) or 1; nrm = (nrm[0] / nl, nrm[1] / nl)
        sparks.append((n, tB + dur_b, hx, hz, nrm, kind))
        events[name] = ("hit", tB + dur_b)
    else:
        # 第二段：出磁鐵後直管加速（初速 v1 ＝彎道結束時的速度）、再彎進終端站、最後打到晶圓
        v1 = 2 * BZ / dur_b      # 彎道結束時每幀移動量（z 方向）
        tC = tB + dur_b
        L2 = abs(LEG2_END - M1[1]); DC = 46
        lin_c = v1 * DC
        quad = L2 - lin_c
        if quad < 1: quad = 1; DC = L2 / (v1 + 0.5)
        for ids_i, lag in zip(ids, lags):
            shifts.append(lin(ids_i, tC + lag, DC, dz=-lin_c)); shifts.append(acc(ids_i, tC + lag, DC, dz=-(L2 - lin_c)))
        v2 = (lin_c + 2 * (L2 - lin_c)) / DC
        tD = tC + DC
        # 下彎：(Δz=-5, Δy=-4) 二次貝茲 P0=(0,0) P1=(-5,0) P2=(-5,-4)：z＝-5(2t−t²)、y＝-4t²
        DD = 2 * 5 / v2
        for ids_i, lag in zip(ids, lags):
            shifts.append(lin(ids_i, tD + lag, DD, dz=-10)); shifts.append(acc(ids_i, tD + lag, DD, dz=5, dy=-4))
        tE = tD + DD
        # 噴嘴到晶圓：2.0 單位向下，進到晶圓表面後消失
        DE = 8
        for ids_i, lag in zip(ids, lags):
            shifts.append(lin(ids_i, tE + lag, DE, dy=-1.0)); shifts.append(acc(ids_i, tE + lag, DE, dy=-1.0 + 0.0))
            shifts.append(vanish(ids_i, tE + DE + lag - 1, 3))
        events[name] = ("wafer", tE + DE)
# 火花：兩階段（先小圈亮白、再大圈散開），每次撞壁兩層
for (n, t, hx, hz, nrm, kind) in sparks:
    for ph, (rad, cnt, rr, dur) in enumerate(((0.6, 7, 0.14, 6), (1.3, 8, 0.1, 8))):
        L_ = f"spark{n}_{ph}"; layer(L_)
        base = (hx, BY + 0.1, hz)
        for k in range(cnt):
            a = 2 * math.pi * k / cnt + 0.5 * n
            ox, oz = rad * math.cos(a) * 0.9 - nrm[0] * rad * 0.6, rad * math.sin(a) * 0.9 - nrm[1] * rad * 0.6
            sph(L_, "sparkW" if ph == 0 else "spark", rr, [base[0] + ox, base[1] + rad * 0.5 * (k % 3 - 1), base[2] + oz])
        if ph == 0: sph(L_, "sparkHalo", 0.9, list(base))
        t_on = t + ph * 3
        shifts.append(hide(L_, t_on)); shifts.append(vanish(L_, t_on + dur, 3))
# 晶圓掃描（左右來回、起迄減速）＋光束斑
T_SC = 318
shifts.append(sh("wf", T_SC, 46, dx=-2.6)); shifts.append(sh("wf", T_SC + 56, 62, dx=5.2)); shifts.append(sh("wf", T_SC + 130, 50, dx=-2.6))
shifts.append(hide("spot", 312, 6))
shifts.append(sh("wf_pick", 0, 1)) if False else None
shifts.append(vanish("spot", 372, 8))
# 面板與連線的出現
shifts.append(hide("xs", 352, 16)); shifts.append(hide("zoomline", 346, 16))
for i in range(NB): shifts.append(hide(f"band{i}", 398 + i * 2, 12))
shifts.append(vanish("zoomline", 410, 8)) if False else None

# 剖面裡的離子：從上方落下 → 進矽表面後減速停在不同深度
XS_ION = []
depths = [1.7, 2.3, 1.2, 1.9, 2.8, 1.5, 2.1, 1.0, 2.5]
xoff = [-4.6, -3.4, -2.3, -1.2, -0.1, 1.0, 2.2, 3.3, 4.5]
XT0 = 374
for i in range(9):
    name = f"xi{i}"; r = 0.22
    sx_ = XCX + xoff[i]; st = (sx_, XS_TOP + 5.0, XCZ + D_ / 2 + 0.55)
    ids = ion_layers(name, "c", st, r)
    t0 = XT0 + i * 3
    DAIR = 14; dair = 5.0
    DSI = 3.6 * depths[i]
    for ids_i, lag in zip(ids, (0, 2, 4, 6)):
        shifts.append(hide(ids_i, t0 + lag))
        shifts.append(acc(ids_i, t0 + lag, DAIR, dy=-dair))
        shifts.append(lin(ids_i, t0 + DAIR + lag, DSI, dy=-2 * depths[i])); shifts.append(acc(ids_i, t0 + DAIR + lag, DSI, dy=depths[i]))
        if lag > 0: shifts.append(vanish(ids_i, t0 + DAIR + DSI + lag - 4, 4))
    XS_ION.append(t0 + DAIR + DSI)

# ═══════════════ 動作（脈衝、振動、旋轉）═══════════════
actions["plasmaPulse"] = {"type": "pulse", "layer": S, "parts": ["plasma"], "color": "plasmaG", "freq": 2.4, "glow": 0.85, "halo": 2.4, "at": [-22.7, BY + 1.7, 8.0]}
actions["coilGlow"] = {"type": "pulse", "layer": G, "parts": coil_ids, "color": "magGlow", "freq": 1.4, "glow": 0.55, "halo": 0}
actions["waferSpin"] = {"type": "rotate", "parts": ["@wf:body", "@wf:dies"], "axis": [0, 1, 0], "rps": 0.1, "rampSpin": True}
actions["latticeJitter"] = {"type": "vibrate", "parts": ["xs_atoms1", "xs_atoms2"], "axis": [1, 0.3, 0], "amp": 0.05, "freq": 9}
actions["spotPulse"] = {"type": "pulse", "layer": SP, "parts": ["spot_c"], "color": "ion", "freq": 3.2, "glow": 0.9, "halo": 0}

# ═══════════════ 鏡頭 ═══════════════
YAW0 = 0.76
TAN = lambda deg: math.tan(math.radians(deg))
def cam(P, yaw, d, elev):
    c, s = math.cos(yaw), math.sin(yaw)
    xp = P[0] * c + P[2] * s; zp = -P[0] * s + P[2] * c
    return {"x": R(xp), "y": R(P[1] - zp * TAN(elev)), "d": d, "elev": elev}
shots = []
YT = [YAW0]
def shot(at, dur, P, d, elev, yaw_inc=0.0):
    YT[0] += yaw_inc
    c = cam(P, YT[0], d, elev); c.update({"at": A_(at), "dur": dur})
    if yaw_inc: c["yaw"] = R(yaw_inc)
    shots.append(c)
# s1 全景（慢慢推近）：機台沿對角線往上排，直式畫面剛好塞滿
shot(-30, 1, (-8, 5.5, -7), 138, 27)
shot(0, 88, (-8, 5.5, -6), 100, 38, yaw_inc=-0.06)
# s2 加速管：鏡頭繞到管子與畫面水平
shot(78, 46, (-13.0, BY, 8.0), 58, 40, yaw_inc=-0.62)
shot(132, 70, (-8.0, BY, 8.0), 50, 42)
# s3 磁鐵（偏俯視）
shot(204, 36, (0.0, BY, 4.0), 44, 56, yaw_inc=0.22)
# s4 終端站 → 剖面
shot(288, 40, (4.5, 3.5, -17.0), 58, 55, yaw_inc=-YT[0] + 0.0 + 0.0 - 0.0 if False else -0.30)
shot(326, 34, (4.5, 1.8, -24.0), 27, 68)
shot(368, 38, (XCX, YC + 0.2, XCZ), 27, 8, yaw_inc=-YT[0])

# ═══════════════ 輸出 model.json ═══════════════
model = {
    "name": "test-ion-sonnet：離子佈植機（離子源→加速管→分析磁鐵→射束管線→終端站→晶圓剖面）",
    "unit": "1 單位約 25 cm",
    "size": {"w": 70, "h": 20, "r": 0.1, "t": 20},
    "palette": palette, "materials": materials, "layers": layers, "anchors": anchors, "parts": parts, "actions": actions,
    "pose": {"yaw0": YAW0, "yawIso": 0, "drift": 0},
    "camera": {"stand": {"d": 150, "elev": 30, "y": 4.5}},
    "fx": {"dpr": 1.25, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
}
json.dump(model, open("videos/test-ion-sonnet/model.json", "w"), ensure_ascii=False, indent=1)

# ═══════════════ script.json ═══════════════
def scene(i, dur, props, beat):
    return {"id": f"s{i}", "beat": beat, "narration": "（無旁白）", "tts": "（無旁白）", "subtitle": {"zh": "", "en": ""}, "keywords": [],
            "cues": [], "component": "ThreeScene", "props": props, "sources": ["示意動畫，非實際比例"], "durationSec": dur}
SD = [3.0, 4.0, 3.0, 4.5]
S1 = {"shot": [s for s in shots if True], "zoom": [{"to": "tool", "at": "start-30", "dur": 1}],
      "run": [{"id": "plasmaPulse", "at": "start-30", "until": "s4:start+200", "ramp": 4}],
      "labels": [{"part": "a_src", "text": "離子源", "en": "Ion source", "color": "amber", "at": "start+34", "until": "s2:start+40"}],
      "shift": shifts}
S2 = {"labels": [{"part": "a_acc", "text": "加速管", "en": "Accelerator", "color": "blue", "at": "start+30", "until": "s3:start-4"}]}
S3 = {"labels": [{"part": "a_mag", "text": "分析磁鐵", "en": "Analyzing magnet", "color": "coral", "at": "start+12", "until": "s4:start+4"}],
      "run": [{"id": "coilGlow", "at": "start-6", "until": "s4:start+14", "ramp": 10}]}
S4 = {"zoom": [{"to": "wafer", "at": "start+26", "dur": 24}, {"to": "silicon", "at": "start+68", "dur": 28}],
      "labels": [{"part": "a_dope", "text": "摻雜區", "en": "Doped layer", "color": "mint", "at": "start+108", "until": "start+400"}],
      "run": [{"id": "waferSpin", "at": "start+16", "until": "start+80", "ramp": 16}, {"id": "spotPulse", "at": "start+22", "until": "start+72", "ramp": 4},
              {"id": "latticeJitter", "at": "start+74", "ramp": 12}]}
script = {
    "slug": "test-ion-sonnet", "title": "離子佈植：離子怎麼被打進晶圓（模型比較測試，Sonnet）", "asOf": "2026/11/20", "styleVersion": 3, "stage": "three",
    "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
    "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b", "_說明": "無聲測試片，不送 TTS"},
    "hud": {"levels": [
        {"id": "tool", "label": "離子佈植機", "en": "ION IMPLANTER", "field": "10 m", "ruler": "2 m", "art": "none", "handoff3D": True, "readout": False, "note": "示意動畫，非實際比例", "noteAlways": True},
        {"id": "wafer", "label": "晶圓表面", "en": "WAFER SURFACE", "field": "30 cm", "ruler": "10 cm", "art": "none", "readout": False, "note": "示意動畫，非實際比例", "noteAlways": True},
        {"id": "silicon", "label": "矽晶格剖面", "en": "SILICON CROSS-SECTION", "field": "100 nm", "ruler": "20 nm", "art": "none", "readout": False, "note": "示意動畫，非實際比例", "noteAlways": True}],
        "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
    "cover": {"title": ["離子怎麼", "打進晶圓"], "sub": "離子佈植", "frame": 40}, "sample": True,
    "scenes": [scene(1, SD[0], S1, "hook"), scene(2, SD[1], S2, "mechanism"), scene(3, SD[2], S3, "mechanism"), scene(4, SD[3], S4, "payoff")],
}
json.dump(script, open("videos/test-ion-sonnet/script.json", "w"), ensure_ascii=False, indent=1)
print("parts", len(parts), "layers", len(layers), "shifts", len(shifts), "ion events", events, "dur_b etc V_END", round(V_END, 3))
