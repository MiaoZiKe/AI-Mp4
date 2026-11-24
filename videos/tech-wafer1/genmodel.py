# tech-wafer1 產生器：python3 videos/tech-wafer1/genmodel.py → model.json，並先跑 genscript.py、再把各幕 3D 動作與 2D 卡併進 script.json
# 座標：x 右、y 上、z 朝觀眾；單位約 10 cm（示意，非實際比例）。六站以 x 偏移分開，鏡頭一次只看一站：
#   Q x=0    電弧爐（石英砂堆＋輸送帶、三支石墨電極、電弧、一氧化碳排氣、出料口流出冶金級矽進盛桶、成品矽塊）      s2
#   S x=24   西門子法（矽＋氯化氫反應槽→蒸餾塔（剖開看到塔盤與上升蒸氣）→鐘罩反應爐（剖開，四組 U 形矽棒越長越粗））  s4
#   C x=48   拉晶爐＝主角（爐體剖開：保溫層、石墨加熱器、石墨承座＋石英坩堝、熔湯、熱遮罩、晶種夾頭、晶種／晶頸／肩部／晶身；
#            上方拉晶室、收線機構；氬氣由上往下流、熱往上冒；晶棒與坩堝反向旋轉；多晶矽塊落進坩堝→熔掉）                s1、s5、s6、s10
#   W x=72   線鋸（兩支導輪＋上下兩層鑽石線網、晶棒 16 片往下切、切完抬起分開）；x=81 拋光機（轉盤＋拋光墊溝槽、載具頭、研磨液）  s7、s10
#   K x=100  8 吋與 12 吋鏡面晶圓（晶粒格）、晶圓盒、磊晶層（下一集預告）；後方台灣三棟廠房                                 s9、s11
#   F x=125  全球五家矽晶圓廠（2026/11/24 審片後新增；晶格站移到 x=-26，免得 s10→s11 鏡頭橫移時掃過晶格）               s10
#   P x=-26  矽晶格（原子＋鍵）裡一顆雜質原子、電子流繞過它                                                              s3
# 所有動作的 at 都寫成「幕id:cue±幀」（cue 來自 timeline.json；配音重跑 align 後重跑本檔即可）。
import json, math, os, random, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))
R = lambda x: round(x, 3)
rnd = random.Random(20261124)
parts = []; layers = []; anchors = {}; actions = {}
LAYERS = {}
def layer(i, bg=False):
    if i not in LAYERS:
        LAYERS[i] = {"id": i, "z": 0, "k": 0}; layers.append(LAYERS[i])
    if bg: LAYERS[i]["bg"] = True
    return i
def box(pid, lay, mat, size, pos, at=None, rot=None, shape="box", **kw):
    layer(lay)
    p = {"id": pid, "layer": lay, "shape": shape, "size": [R(v) for v in size], "pos": [R(v) for v in pos], "mat": "m_" + mat}
    if at: p["at"] = [[R(v) for v in a] for a in at]
    if rot: p["rot"] = rot
    p.update(kw); parts.append(p); return pid
def cyl(pid, lay, mat, r, h, pos, axis="y", at=None, rot=None):
    rr = rot or {"y": [90, 0, 0], "x": [0, 90, 0], "z": None}[axis]
    return box(pid, lay, mat, [r, h], pos, at=at, rot=rr, shape="cyl")
def tube(pid, lay, mat, ro, ri, ln, pos, axis="y", at=None):
    rot = {"y": [90, 0, 0], "x": [0, 90, 0], "z": None}[axis]
    return box(pid, lay, mat, [ro, ri, ln], pos, rot=rot, shape="tube", at=at)
def sph(pid, lay, mat, r, pos, at=None, scale=None):
    kw = {"scale": scale} if scale else {}
    return box(pid, lay, mat, [r], pos, at=at, shape="sphere", **kw)
def anchor(name, lay, p, dx=100, dy=-80): anchors[name] = {"layer": lay, "p": [R(v) for v in p], "dx": dx, "dy": dy}
def seg(pid, lay, mat, a, b, r):
    d = [b[i] - a[i] for i in range(3)]; ax = max(range(3), key=lambda i: abs(d[i])); ln = abs(d[ax])
    c = [(a[i] + b[i]) / 2 for i in range(3)]
    return cyl(pid, lay, mat, r, ln, c, axis="xyz"[ax])
def pipe(pid, lay, mat, pts, r):
    for k in range(len(pts) - 1): seg(f"{pid}{k}", lay, mat, pts[k], pts[k + 1], r)
    if len(pts) > 2: sph(f"{pid}J", lay, mat, r * 1.15, pts[1], at=[[p[i] - pts[1][i] for i in range(3)] for p in pts[1:-1]])
def staves(pid, lay, mat, cx, r, y0, y1, n=12, a0=186, a1=354, t=.3, cz=0.0):
    """後半圈剖開的圓筒（只留 z<0 那半圈），n 片板。"""
    step = (a1 - a0) / (n - 1); w = 2 * math.pi * r * (step / 360) * 1.04
    for k in range(n):
        a = math.radians(a0 + step * k)
        box(f"{pid}{k}", lay, mat, [w, y1 - y0, t], [cx + r * math.cos(a), (y0 + y1) / 2, cz + r * math.sin(a)], rot=[0, R(-(math.degrees(a) + 90)), 0])
def air(pid, lay, lo, hi):
    box(pid, lay, "air", [hi[i] - lo[i] for i in range(3)], [(lo[i] + hi[i]) / 2 for i in range(3)])

palette = {"floor": "#E3E9F1", "floorG": "#A8B4C6", "wall": "#DCE4EE", "wall2": "#C9D3E1", "ffu": "#F4F7FB", "conc": "#C9CDD3", "concD": "#A9AEB6",
 "cab": "#EEF2F7", "cab2": "#D7DEE8", "cabD": "#4A5873", "steel": "#A9B6CA", "steel2": "#7F8CA3", "steelHi": "#C9D3E2",
 "sand": "#E9DCBC", "sandD": "#CDB98E", "coal": "#2F3136", "graphite": "#3B4049", "graphiteL": "#59606C", "felt": "#4B4F57",
 "brick": "#C8704A", "brickD": "#9E4F31", "copper": "#C9763A", "heat": "#FF7A2F", "hot": "#FFB23F", "arc": "#FFF4C8", "melt": "#FF8A2A",
 "mgsi": "#8C9099", "poly": "#9AA4B4", "ingot": "#55627E", "ridge": "#D7E2F2", "crucible": "#F4F1EA", "quartz": "#D6E6F8",
 "tcs": "#4FB070", "tcsR": "#2E8A4D", "h2": "#9CC3FF", "ar": "#5C95F0", "arR": "#2F6BD0", "co": "#8A96A8", "coR": "#58647A",
 "wire": "#D8DEE8", "grit": "#FFFFFF", "slurry": "#9EC5F0", "slurryR": "#4F8FD6", "pad": "#D8BE86", "padG": "#B39A63",
 "rough": "#A3AAB6", "mirror": "#C8D5EA", "die": "#7FA4E0", "epi": "#38C6D9", "pvdf": "#EFEAE0", "led": "#14C38E", "ledA": "#FF9F1C",
 "screen": "#2E6FD8", "si": "#9DB0CF", "siB": "#C3CFE2", "imp": "#E0472F", "impR": "#9E2A1A", "ele": "#2F7FE0", "eleR": "#1C5DB0"}
def M(color, **k): return {"kind": "std", "color": color, "rough": .45, "metal": .1, **k}
U = lambda c, o=None: {"kind": "unlit", "color": c, **({"opacity": o} if o is not None else {})}
materials = {
 "floor": M("floor", rough=.55, metal=0), "floorG": U("floorG"), "wall": M("wall", rough=.7, metal=0), "wall2": M("wall2", rough=.7, metal=0), "ffu": U("ffu"),
 "conc": M("conc", rough=.85, metal=0), "concD": M("concD", rough=.85, metal=0),
 "cab": M("cab", rough=.45, metal=.1), "cab2": M("cab2", rough=.5, metal=.1), "cabD": M("cabD", rough=.5, metal=.3),
 "cabPanel": {"kind": "phys", "color": "#F7F9FC", "rough": .3, "metal": 0, "clearcoat": .5, "env": .5},
 "steel": M("steel", rough=.28, metal=.88, env=.7, tex="brushed", texScale=2), "steel2": M("steel2", rough=.35, metal=.8, env=.6), "steelHi": M("steelHi", rough=.22, metal=.9, env=.9),
 "sand": M("sand", rough=.9, metal=0), "sandD": M("sandD", rough=.9, metal=0), "coal": M("coal", rough=.8, metal=.1),
 "graphite": M("graphite", rough=.6, metal=.3, env=.4), "graphiteL": M("graphiteL", rough=.55, metal=.3, env=.4), "felt": M("felt", rough=.95, metal=0),
 "brick": M("brick", rough=.9, metal=0), "brickD": M("brickD", rough=.9, metal=0), "copper": M("copper", rough=.3, metal=.9, env=.7),
 "arc": U("arc"), "hotU": U("hot"),
 "melt": {"kind": "std", "color": "#F06A10", "emissive": "#E2560F", "ei": .6, "rough": .12, "metal": .3},
 "mgsi": M("mgsi", rough=.5, metal=.6, env=.6), "poly": M("poly", rough=.4, metal=.6, env=.7),
 "ingot": {"kind": "phys", "color": "ingot", "rough": .18, "metal": .75, "clearcoat": .6, "env": 1.0}, "ridge": M("ridge", rough=.2, metal=.8, env=.9),
 "crucible": M("crucible", rough=.6, metal=0), "glass": {"kind": "phys", "color": "quartz", "rough": .08, "metal": 0, "clearcoat": 1, "opacity": .22, "env": .6},
 "rough": M("rough", rough=.75, metal=.4, tex="brushed", texScale=.6), "mirror": {"kind": "phys", "color": "mirror", "rough": .04, "metal": .55, "clearcoat": 1, "env": 1.2},
 "die": M("die", rough=.22, metal=.55, tex="traces", texScale=.35, env=.9), "epi": {"kind": "phys", "color": "epi", "rough": .1, "metal": .1, "clearcoat": 1, "opacity": .55, "env": .8},
 "wire": M("wire", rough=.2, metal=.9, env=.9), "pad": M("pad", rough=.8, metal=0), "padG": U("padG"), "pvdf": {"kind": "phys", "color": "pvdf", "rough": .3, "metal": 0, "clearcoat": .5},
 "led": {"kind": "std", "color": "led", "emissive": "led", "ei": .9}, "ledA": {"kind": "std", "color": "ledA", "emissive": "ledA", "ei": .6},
 "screen": {"kind": "screen", "color": "screen", "ei": .7}, "screenUI": U("#BFD8FF"),
 "si": M("si", rough=.3, metal=.4, env=.7), "siB": M("siB", rough=.4, metal=.2), "imp": {"kind": "std", "color": "imp", "emissive": "imp", "ei": .35, "rough": .3},
 "tcs": M("tcs", rough=.3, metal=.1), "air": U("#FFFFFF", .0),
}
materials = {"m_" + k: v for k, v in materials.items()}
def flowx(key, lay, path, shape="dot", n=4, lanes=1, gap=.2, ldir=(1, 0, 0), size=.1, rate=1.0, color="ar", rim="arR", trail=0, band=None, bandO=.5, rimO=.6):
    layer(lay)
    d = {"type": "flow", "layer": lay, "path": [[R(v) for v in p] for p in path], "n": n, "lanes": lanes, "laneGap": gap, "laneDir": list(ldir), "size": size, "shape": shape,
         "rate": rate, "color": color, "rim": rim, "rimScale": 1.5, "rimO": rimO, "trail": trail, "trailGap": .03, "trailColor": color, "track": False}
    if band: d["band"] = band; d["bandO"] = bandO
    actions[key] = d
def glow(key, lay, ps, color="heat", steady=True, g=.9, freq=2.2, halo=0):
    layer(lay)
    d = {"type": "pulse", "layer": lay, "parts": ps, "color": color, "glow": g, "halo": halo}
    if steady: d["steady"] = True
    else: d["freq"] = freq
    actions[key] = d
def vib(key, lay, ps, axis, amp, freq):
    layer(lay); actions[key] = {"type": "vibrate", "layer": lay, "parts": ps, "axis": axis, "amp": amp, "freq": freq}
def spin(key, lay, ps, cx, rps, cz=0.0, axis=(0, 1, 0)):
    layer(lay); actions[key] = {"type": "rotate", "layer": lay, "parts": ps, "axis": list(axis), "pivot": [R(cx), 0, R(cz)], "rps": rps, "rampSpin": True}
def lp(lay): return [p["id"] for p in parts if p["layer"] == lay]

# ═════════ 廠房（背景，各站共用） ═════════
box("r_floor", "t_room", "floor", [174, .3, 40], [53, -.15, -2])
box("r_grate", "t_room", "floorG", [.1, .03, 40], [60, .02, -2], at=[[-79 + 2.0 * i, 0, 0] for i in range(80)])
box("r_grate2", "t_room", "floorG", [160, .03, .1], [60, .02, -2], at=[[0, 0, -19 + 2.0 * j] for j in range(20)])
box("r_wall", "t_room", "wall", [174, 26, .4], [53, 13, -16])
box("r_wallS", "t_room", "wall2", [.12, 25.6, .45], [60, 13, -15.9], at=[[-78 + 6 * i, 0, 0] for i in range(27)])
box("r_ffu", "t_room", "ffu", [5.6, .4, 5.6], [60, 26.2, -10], at=[[-78 + 6 * i, 0, k * 6] for i in range(27) for k in (0, 1)])
box("r_tray", "t_room", "steel2", [160, .25, .6], [60, 14.5, -14.6])                                       # 牆上管線架
cyl("r_pipeW", "t_room", "steelHi", .18, 160, [60, 15.0, -14.6], axis="x", at=[[0, 0, 0], [0, .55, 0], [0, 1.1, 0]])

# ═════════ Q：電弧爐 x=0（冶金級矽） ═════════
QX = 0
cyl("q_pad", "q_body", "conc", 4.6, .6, [QX, .3, 0])
staves("q_shell", "q_body", "steel2", QX, 3.6, .6, 4.0, n=12, t=.28)
staves("q_lin", "q_body", "brick", QX, 3.22, .6, 3.8, n=12, t=.4)
box("q_brickL", "q_body", "brickD", [.04, .04, .05], [QX, 0, 0], at=[[3.0 * math.cos(math.radians(a)), .9 + .45 * j, 3.0 * math.sin(math.radians(a)) + .2] for a in range(190, 351, 20) for j in range(7)])
cyl("q_hearth", "q_body", "brickD", 3.5, .5, [QX, .85, 0])
GR = []
for _ in range(330):
    rr = 2.85 * math.sqrt(rnd.random()); a = rnd.random() * 2 * math.pi
    GR.append([rr * math.cos(a), 1.2 + 1.5 * (1 - (rr / 2.95) ** 2) + rnd.random() * .25, rr * math.sin(a)])
sph("q_grain", "q_body", "sand", .17, [QX, 0, 0], at=GR)
COK = []
for _ in range(70):
    rr = 2.7 * math.sqrt(rnd.random()); a = rnd.random() * 2 * math.pi
    COK.append([rr * math.cos(a), 1.3 + 1.4 * (1 - (rr / 2.95) ** 2) + rnd.random() * .25, rr * math.sin(a)])
box("q_coke", "q_body", "coal", [.3, .24, .28], [QX, 0, 0], at=COK, rot=[20, 35, 10])
EL = [(1.3 * math.cos(math.radians(a)), 1.3 * math.sin(math.radians(a))) for a in (90, 210, 330)]
for k, (ex, ez) in enumerate(EL):
    cyl(f"q_el{k}", "q_el", "graphite", .42, 6.6, [QX + ex, 5.6, ez])
    box(f"q_elJ{k}", "q_el", "graphiteL", [.86, .06, .86], [QX + ex, 0, ez], at=[[0, 4.0 + 1.6 * j, 0] for j in range(3)])     # 電極接頭的接縫
    tube(f"q_clamp{k}", "q_el", "copper", .62, .42, .55, [QX + ex, 7.6, ez])
    seg(f"q_bus{k}", "q_el", "copper", [QX + ex, 7.6, ez - .5], [QX + ex, 7.6, -4.4], .14)
    sph(f"q_arc{k}", "q_arc", "arc", .5, [QX + ex, 2.35, ez])
box("q_mast", "q_el", "steel2", [.9, 9.4, .9], [QX, 4.7 + .6, -4.8])
box("q_xf", "q_el", "cabD", [3.2, 2.8, 2.2], [QX - 4.2, 2.0, -5.6], bevel=.06)
box("q_xfF", "q_el", "steel2", [.08, 2.2, 1.8], [QX - 2.55, 2.0, -5.6], at=[[0, 0, 0]])
tube("q_hood", "q_el", "steel", 3.9, 1.95, .5, [QX, 9.6, 0])
pipe("q_duct", "q_el", "steel2", [[QX + 2.8, 9.9, -1.6], [QX + 2.8, 12.6, -1.6], [QX + 2.8, 12.6, -6.0]], .55)
# 出料口＋盛桶（冶金級矽流出）
box("q_spout", "q_body", "brickD", [.6, .32, 1.4], [QX + 2.75, 1.25, 2.75], rot=[0, -45, 0])
tube("q_ladle", "q_lad", "steel2", .95, .78, 1.0, [QX + 4.4, .5, 4.4])
cyl("q_ladB", "q_lad", "steel2", .95, .12, [QX + 4.4, .06, 4.4])
cyl("q_ladM", "q_lad", "melt", .78, .12, [QX + 4.4, .8, 4.4])
# 石英砂堆＋輸送帶（左）、焦炭堆、成品矽塊（右後）
SP = []
for _ in range(260):
    rr = 2.2 * math.sqrt(rnd.random()); a = rnd.random() * 2 * math.pi
    SP.append([rr * math.cos(a), .2 + 1.7 * (1 - rr / 2.25) + rnd.random() * .15, rr * math.sin(a)])
sph("q_pile", "q_sand", "sand", .2, [QX - 8.6, 0, 2.0], at=SP)
sph("q_pileD", "q_sand", "sandD", .2, [QX - 8.6, 0, 2.0], at=[[p[0] * .98 + .07, p[1] - .05, p[2] * .98] for p in SP[::3]])
CP = []
for _ in range(90):
    rr = 1.5 * math.sqrt(rnd.random()); a = rnd.random() * 2 * math.pi
    CP.append([rr * math.cos(a), .15 + 1.0 * (1 - rr / 1.55) + rnd.random() * .1, rr * math.sin(a)])
box("q_coalP", "q_sand", "coal", [.32, .26, .3], [QX - 8.4, 0, -3.2], at=CP, rot=[15, 30, 20])
BL0, BL1 = (QX - 7.2, 1.6), (QX - 3.6, 6.2)
bl = math.hypot(BL1[0] - BL0[0], BL1[1] - BL0[1]); ba = math.degrees(math.atan2(BL1[1] - BL0[1], BL1[0] - BL0[0]))
box("q_belt", "q_sand", "cabD", [bl, .18, 1.2], [(BL0[0] + BL1[0]) / 2, (BL0[1] + BL1[1]) / 2, 0], rot=[0, 0, R(ba)])
box("q_beltL", "q_sand", "steel2", [.2, .2, .1], [0, 0, 0], at=[[BL0[0] + (BL1[0] - BL0[0]) * t, BL0[1] + (BL1[1] - BL0[1]) * t - .2, s * .62] for t in (.1, .3, .5, .7, .9) for s in (-1, 1)])
box("q_leg", "q_sand", "steel2", [.18, 1, .18], [0, 0, 0], at=[[BL0[0] + (BL1[0] - BL0[0]) * t, (BL0[1] + (BL1[1] - BL0[1]) * t) / 2, s * .55] for t in (.25, .75) for s in (-1, 1)])
for p in parts[-1:]:
    p["at"] = [[a[0], a[1], a[2]] for a in p["at"]]
box("q_chute", "q_sand", "steel", [2.6, .14, 1.0], [QX - 2.6, 5.5, 0], rot=[0, 0, -32])
GT = BL1[1] + .14
flowx("q_feed", "q_sand", [[BL0[0] + .3, BL0[1] + .2, 0], [BL1[0], GT, 0], [QX - 3.6, GT - .05, 0], [QX - 1.5, 4.8, 0], [QX - 1.0, 3.2, 0]], shape="grit", n=12, lanes=3, gap=.3, ldir=(0, 0, 1), size=.13, rate=.35, color="sand", rim="sandD")
air("q_airF", "q_sand", [QX - 3.8, 3.0, -.6], [QX - .8, 6.4, .6])
LUMP = [[rnd.uniform(-1.1, 1.1), .35 + rnd.random() * .5 * (1 - abs(x) / 1.2), rnd.uniform(-.8, .8)] for x in [rnd.uniform(-1, 1) for _ in range(46)]]
box("q_pallet", "q_mg", "cab2", [2.8, .25, 2.0], [QX + 7.4, .13, -.6])
box("q_lump", "q_mg", "mgsi", [.42, .34, .38], [QX + 7.4, 0, -.6], at=LUMP, rot=[18, 40, 12])
# 流動：一氧化碳往上排、熔融矽從出料口流進盛桶、電弧閃
for j, (x, z) in enumerate([(-1.4, .6), (.2, 1.6), (1.5, .2), (-.4, -1.2)]):
    flowx(f"q_co{j}", "q_body", [[QX + x, 3.0, z], [QX + x * 1.15, 6.2, z * 1.1], [QX + x * 1.3, 9.3, z * 1.2]], shape="mol", n=4, size=.15, rate=.5, color="co", rim="coR")
air("q_airC", "q_body", [QX - 2.5, 2.6, -1.8], [QX + 2.5, 9.6, 2.4])
flowx("q_tap", "q_lad", [[QX + 2.3, 1.3, 2.3], [QX + 3.15, 1.22, 3.15], [QX + 3.75, 1.0, 3.75], [QX + 4.15, .82, 4.15]], shape="liquid", n=5, size=.13, rate=.7, color="melt", rim="heat", band=.12, bandO=.85)
air("q_airT", "q_lad", [QX + 2.2, .7, 2.2], [QX + 4.4, 1.5, 4.4])
glow("q_arcOn", "q_arc", [f"q_arc{k}" for k in range(3)], "arc", steady=False, g=1.0, freq=7.0, halo=1.0)
glow("q_hot", "q_body", ["q_hearth", "q_coke"], "heat", steady=True, g=.55)
glow("q_ladHot", "q_lad", ["q_ladM"], "hot", steady=False, g=.8, freq=1.4)
glow("q_sandOn", "q_sand", ["q_pile"], "hot", steady=False, g=.35, freq=1.6)
anchor("q_sandA", "q_sand", [QX - 8.6, 1.6, 2.4], dx=-120, dy=-110)
anchor("q_elA", "q_el", [QX - 1.13, 7.0, -.65], dx=-170, dy=-80)
anchor("q_coA", "q_body", [QX + 1.4, 7.6, .4], dx=160, dy=-80)
anchor("q_mgA", "q_lad", [QX + 4.4, 1.0, 4.4], dx=170, dy=40)
anchor("q_lumpA", "q_mg", [QX + 7.4, .7, -.6], dx=150, dy=-60)

# ═════════ S：西門子法 x=24（多晶矽） ═════════
SX = 24
box("s_stand", "s_body", "cab", [6.8, 1.2, 6.8], [SX, .6, 0], bevel=.06)
box("s_standP", "s_body", "cabPanel", [2.0, .8, .06], [SX, .6, 3.43], at=[[-2.2, 0, 0], [0, 0, 0], [2.2, 0, 0]], bevel=.02)
cyl("s_plate", "s_body", "steel", 3.25, .4, [SX, 1.4, 0])
staves("s_bell", "s_body", "steelHi", SX, 3.05, 1.6, 8.0, n=12, t=.22)
tube("s_jacket", "s_body", "steel2", 3.12, 3.0, .12, [SX, 0, 0], at=[[0, 2.4 + 1.1 * j, 0] for j in range(6)])
sph("s_dome", "s_body", "glass", 3.05, [SX, 8.0, 0], scale=[1, .48, 1])
tube("s_fl", "s_body", "steel", 3.4, 3.0, .3, [SX, 1.75, 0])
HP = [(-1.2, -.95), (1.2, -.95), (-1.2, .95), (1.2, .95)]
LEG = .55; RY0, RY1 = 1.65, 6.9
def hairpin(pref, lay, mat, r):
    for k, (hx, hz) in enumerate(HP):
        for s in (-1, 1): cyl(f"{pref}{k}{'ab'[s > 0]}", lay, mat, r, RY1 - RY0, [SX + hx + s * LEG, (RY0 + RY1) / 2, hz])
        cyl(f"{pref}{k}t", lay, mat, r, 2 * LEG + r * 1.6, [SX + hx, RY1, hz], axis="x")
hairpin("s_core", "s_rod", "poly", .11)
hairpin("s_ga", "s_g1", "poly", .22)
hairpin("s_gb", "s_g2", "poly", .33)
hairpin("s_gc", "s_g3", "poly", .44)
cyl("s_feed", "s_body", "copper", .2, .6, [SX, .95, 0], at=[[hx + s * LEG, 0, hz] for hx, hz in HP for s in (-1, 1)])
cyl("s_noz", "s_body", "steelHi", .16, .4, [SX, 1.8, 0], at=[[0, 0, 0], [-2.2, 0, 0], [2.2, 0, 0]])
# 矽＋氯化氫的反應槽 → 蒸餾塔（剖開）→ 管線進鐘罩
DX = SX - 6.0
staves("s_col", "s_dist", "steel", DX, 1.0, 0, 10.0, n=8, t=.16)
cyl("s_tray", "s_dist", "steel2", .95, .06, [DX, 0, 0], at=[[0, .8 + .78 * j, 0] for j in range(12)])
cyl("s_colTop", "s_dist", "steel2", 1.05, .4, [DX, 10.2, 0])
cyl("s_colBot", "s_dist", "steel2", 1.05, .5, [DX, .25, 0])
cyl("s_cond", "s_dist", "steelHi", .55, 1.6, [DX + 1.3, 11.0, -.6], axis="x")
cyl("s_fbr", "s_dist", "cab2", .85, 4.4, [DX - 3.0, 2.2, 1.2])
tube("s_fbrR", "s_dist", "steel2", .9, .85, .12, [DX - 3.0, 0, 1.2], at=[[0, .7 + .9 * j, 0] for j in range(5)])
pipe("s_p1", "s_dist", "steel2", [[DX - 3.0, 4.2, 1.2], [DX - 3.0, 4.9, 1.2], [DX - .9, 4.9, .4]], .14)
pipe("s_p2", "s_dist", "steel2", [[DX + .9, 1.2, .3], [DX + 2.6, 1.2, .3], [DX + 2.6, 1.9, 2.0], [SX - 2.2, 1.9, 2.0], [SX - 2.2, 1.9, .2]], .13)
for j in range(4):
    flowx(f"s_vap{j}", "s_dist", [[DX - .5 + .33 * j, .9, .2], [DX - .4 + .3 * j, 5.0, .25], [DX - .5 + .33 * j, 9.6, .2]], shape="mol", n=5, size=.12, rate=.55, color="tcs", rim="tcsR")
air("s_airD", "s_dist", [DX - 1.0, .5, -.2], [DX + 1.0, 10.0, .6])
flowx("s_pin", "s_dist", [[DX - 3.0, 4.2, 1.2], [DX - 3.0, 4.9, 1.2], [DX - .9, 4.9, .4]], shape="liquid", n=3, size=.1, rate=.6, color="tcs", rim="tcsR", band=.07, bandO=.7)
flowx("s_pout", "s_dist", [[DX + .9, 1.2, .3], [DX + 2.6, 1.2, .3], [DX + 2.6, 1.9, 2.0], [SX - 2.2, 1.9, 2.0], [SX - 2.2, 1.9, .2]], shape="liquid", n=6, size=.1, rate=.7, color="tcs", rim="tcsR", band=.07, bandO=.7)
# 鐘罩內：氣體從底下噴嘴往上、繞過矽棒；矽沉積到棒上（綠色分子撞上棒面）；剩下的往牆邊排出
for j, x in enumerate([-2.2, 0, 2.2]):
    flowx(f"s_gas{j}", "s_body", [[SX + x, 1.9, 0], [SX + x * .8, 4.4, 0], [SX + x * .5, 7.4, 0], [SX + x * .2 + .1, 8.6, 0]], shape="mol", n=5, size=.14, rate=.5, color="tcs", rim="tcsR")
for j, (hx, hz) in enumerate(HP):
    tx = SX + hx + (LEG + .5) * (1 if hx > 0 else -1) * -1
    flowx(f"s_dep{j}", "s_body", [[SX + hx * .2, 2.4 + j * .9, 0], [SX + hx + LEG * (-1 if hx > 0 else 1) * 1, 2.6 + j * .9, hz * .55]], shape="dot", n=3, size=.1, rate=.8, color="tcs", rim="tcsR")
air("s_airB", "s_body", [SX - 2.8, 1.6, -1.6], [SX + 2.8, 8.8, 1.6])
glow("s_rodHot", "s_rod", lp("s_rod"), "hot", steady=True, g=.9, halo=.4)
for g in ("s_g1", "s_g2", "s_g3"): glow(f"{g}Hot", g, lp(g), "heat", steady=True, g=.7)
# 成品：多晶矽塊（接 s5 放進坩堝）
box("s_bin", "s_out", "steel2", [2.4, .9, .1], [SX + 5.6, .45, 2.0], at=[[0, 0, -1.0], [0, 0, 1.0]])
box("s_binS", "s_out", "steel2", [.1, .9, 2.0], [SX + 5.6, .45, 2.0], at=[[-1.2, 0, 0], [1.2, 0, 0]])
box("s_chunks", "s_out", "poly", [.36, .3, .34], [SX + 5.6, 0, 2.0], at=[[rnd.uniform(-.95, .95), .3 + rnd.random() * .55, rnd.uniform(-.75, .75)] for _ in range(36)], rot=[22, 37, 14])
anchor("s_colA", "s_dist", [DX - .9, 7.5, 0], dx=-150, dy=-90)
anchor("s_fbrA", "s_dist", [DX - 3.0, 4.4, 1.2], dx=-150, dy=40)
anchor("s_rodA", "s_g3", [SX + 1.75, 5.2, .95], dx=180, dy=-60)
anchor("s_polyA", "s_out", [SX + 5.6, .9, 2.0], dx=150, dy=40)

# ═════════ C：拉晶爐 x=48（主角） ═════════
CX = 48
YM = 5.0                     # 熔湯液面
LB = 3.6                     # 晶身長
BODY0, BODY1 = YM, YM + LB   # 晶身（最終位置）
SH1 = BODY1 + .7             # 肩部頂
NK1 = SH1 + .8               # 晶頸頂＝晶種底
SD1 = NK1 + .5               # 晶種頂
LIFT = NK1 - YM              # 沒長之前整根要往下沉多少（5.1）
box("c_frame", "c_body", "cab", [10.4, 1.3, 8.6], [CX, .65, 0], bevel=.06)
box("c_frameP", "c_body", "cabPanel", [2.6, .9, .06], [CX, .65, 4.33], at=[[-3.2, 0, 0], [0, 0, 0], [3.2, 0, 0]], bevel=.02)
cyl("c_floorD", "c_body", "steel2", 4.15, .3, [CX, 1.45, 0])
staves("c_wall", "c_body", "steel", CX, 4.05, 1.3, 9.0, n=14, t=.3)
box("c_rib", "c_body", "steel2", [.14, 7.6, .14], [CX, 5.15, 0], at=[[4.2 * math.cos(math.radians(a)), 0, 4.2 * math.sin(math.radians(a))] for a in (186, 230, 270, 310, 354)])
tube("c_lid", "c_body", "steel", 4.25, 1.45, .45, [CX, 9.2, 0])
tube("c_valve", "c_body", "steel2", 1.85, 1.42, .6, [CX, 9.7, 0])
staves("c_pull", "c_body", "steel2", CX, 1.5, 10.0, 17.0, n=8, t=.18)
cyl("c_head", "c_body", "cabD", 1.3, 2.6, [CX, 18.3, 0])
box("c_motor", "c_body", "steel2", [1.2, 1.0, 1.0], [CX + 1.6, 18.6, 0], bevel=.05)
cyl("c_vp", "c_body", "steelHi", .45, .5, [CX - 3.6, 6.4, -1.9], axis="x")              # 觀察窗
cyl("c_vpG", "c_body", "hotU", .3, .52, [CX - 3.62, 6.4, -1.9], axis="x")
staves("c_felt", "c_body", "felt", CX, 3.3, 1.7, 7.4, n=12, t=.5)
staves("c_heater", "c_heat", "graphite", CX, 2.62, 2.3, 6.2, n=13, t=.16)
box("c_heatS", "c_heat", "graphiteL", [.06, 3.4, .18], [CX, 0, 0], at=[[2.5 * math.cos(math.radians(a)), 4.25 - (.35 if k % 2 else -.35), 2.5 * math.sin(math.radians(a))] for k, a in enumerate(range(193, 350, 13))])
cyl("c_elec", "c_heat", "copper", .22, 1.1, [CX, 1.85, 0], at=[[-2.62, 0, -.3], [2.62, 0, -.3]])
staves("c_shield", "c_body", "graphiteL", CX, 1.42, 6.0, 7.6, n=8, t=.14)
cyl("c_ped", "c_body", "felt", 2.3, 1.55, [CX, 2.38, 0])                                  # 坩堝底座（擋住沉在下面的晶棒）
cyl("c_shaft", "c_body", "steelHi", .35, 1.0, [CX, 1.8, 0])
# 轉動的承座＋坩堝＋熔湯
tube("c_susc", "c_cru", "graphite", 2.18, 2.0, 2.5, [CX, 4.4, 0])
cyl("c_suscB", "c_cru", "graphite", 2.18, .25, [CX, 3.25, 0])
box("c_suscR", "c_cru", "graphiteL", [.12, 2.3, .1], [CX, 4.4, 0], at=[[2.2 * math.cos(math.radians(a)), 0, 2.2 * math.sin(math.radians(a))] for a in range(0, 360, 30)], rot=None)
tube("c_cruc", "c_cru", "crucible", 1.98, 1.84, 2.3, [CX, 4.55, 0])
cyl("c_crucB", "c_cru", "crucible", 1.98, .2, [CX, 3.45, 0])
tube("c_rim", "c_cru", "crucible", 2.02, 1.82, .08, [CX, 5.72, 0])
cyl("c_meltB", "c_melt", "melt", 1.84, YM - 3.55, [CX, (YM + 3.55) / 2, 0])
tube("c_men", "c_men", "hotU", 1.16, 1.0, .05, [CX, YM + .03, 0])                            # 晶棒和熔湯交界的亮環
# 晶種＋夾頭＋會動的那段鋼索（c_seed）、單晶（c_xtal：晶頸、肩部、晶身、四條晶稜）
cyl("c_seedP", "c_seed", "ridge", .13, SD1 - NK1, [CX, (NK1 + SD1) / 2, 0])
cyl("c_chuck", "c_seed", "steelHi", .32, .5, [CX, SD1 + .25, 0])
cyl("c_chuckB", "c_seed", "steel2", .05, .12, [CX, SD1 + .25, 0], at=[[.33 * math.cos(math.radians(a)), 0, .33 * math.sin(math.radians(a))] for a in range(0, 360, 90)])
cyl("c_cableM", "c_seed", "steelHi", .035, LIFT + .3, [CX, SD1 + .5 + (LIFT + .3) / 2, 0])
cyl("c_cableS", "c_cab", "steelHi", .035, 17.0 - (SD1 + .5), [CX, (17.0 + SD1 + .5) / 2, 0])
cyl("c_neck", "c_xtal", "ingot", .08, NK1 - SH1, [CX, (SH1 + NK1) / 2, 0])
NSH = 8
for k in range(NSH):
    t0 = k / NSH; r = .14 + (1.0 - .14) * (1 - math.cos(math.pi / 2 * (1 - t0))) if False else .14 + .86 * (1 - (k / (NSH - 1))) ** .8
    cyl(f"c_sh{k}", "c_xtal", "ingot", R(r), .7 / NSH + .005, [CX, BODY1 + .7 * (k + .5) / NSH, 0])
cyl("c_bodyX", "c_xtal", "ingot", 1.0, LB, [CX, (BODY0 + BODY1) / 2, 0])
box("c_ridge", "c_xtal", "ridge", [.07, LB + .5, .07], [CX, (BODY0 + BODY1 + .5) / 2, 0], at=[[1.0 * math.cos(math.radians(a)), 0, 1.0 * math.sin(math.radians(a))] for a in (0, 90, 180, 270)])
tube("c_ring", "c_xtal", "ridge", 1.02, .99, .03, [CX, 0, 0], at=[[0, BODY0 + .5 + .6 * j, 0] for j in range(6)])    # 生長紋
# 多晶矽塊（s5 落進坩堝，再熔掉）
CH = [[rnd.uniform(-1.3, 1.3), 3.85 + rnd.random() * 1.5, rnd.uniform(-1.3, 1.3)] for _ in range(60)]
CH = [c for c in CH if math.hypot(c[0], c[2]) < 1.5][:34]
box("c_chunk", "c_chunk", "poly", [.42, .36, .4], [CX, 0, 0], at=CH, rot=[24, 33, 17])
# 旁邊的控制櫃、氬氣瓶、真空泵
box("c_cab", "c_side", "cab", [2.6, 7.0, 2.4], [CX + 7.4, 3.5, -1.0], bevel=.06)
box("c_scr", "c_side", "screen", [1.8, 1.3, .06], [CX + 7.4, 5.4, .23], bevel=.03)
box("c_scrUI", "c_side", "screenUI", [1.4, .08, .02], [CX + 7.4, 5.0, .27], at=[[0, .2 * j, 0] for j in range(5)])
cyl("c_tw", "c_side", "steel2", .1, 1.2, [CX + 8.3, 7.6, -.3])
cyl("c_twG", "c_side", "led", .2, .3, [CX + 8.3, 8.3, -.3])
cyl("c_ar", "c_side", "steelHi", .4, 4.2, [CX - 7.0, 2.1, -2.6], at=[[0, 0, 0], [1.0, 0, 0]])
pipe("c_arP", "c_side", "steel2", [[CX - 6.5, 4.4, -2.6], [CX - 6.5, 16.4, -2.6], [CX - 1.5, 16.4, -.4]], .12)
box("c_vac", "c_side", "cabD", [2.0, 1.6, 1.8], [CX - 6.6, .8, 2.0], bevel=.05)
pipe("c_vacP", "c_side", "steel2", [[CX - 3.8, 1.6, 1.2], [CX - 5.6, 1.6, 1.8]], .28)
# 流動：氬氣從上往下沿晶棒流、掠過液面、從坩堝外側往下排出；熱從液面往上冒
for j, (ox, oz) in enumerate([(1.22, .25), (-1.22, .3)]):
    sgn = 1 if ox > 0 else -1
    flowx(f"c_arF{j}", "c_body", [[CX + ox, 15.6, oz], [CX + ox, 6.2, oz], [CX + sgn * 1.7, YM + .25, oz], [CX + sgn * 2.1, 6.0, oz], [CX + sgn * 2.38, 5.4, oz], [CX + sgn * 2.38, 2.6, oz], [CX + sgn * 3.0, 1.75, oz]],
          shape="dot", n=9, size=.09, rate=.35, color="ar", rim="arR", trail=3)
air("c_airA", "c_body", [CX - 3.1, 1.5, -.2], [CX + 3.1, 15.8, .6])
for j, x in enumerate([-1.45, 1.45]):
    actions[f"c_wave{j}"] = {"type": "wave", "layer": "c_melt", "from": [R(CX + x), YM + .15, .4], "dir": [0, 1, 0], "reach": 1.1, "count": 3, "r0": .14, "spread": 1.4, "rate": 1.4, "phase": j / 2, "width": .2, "color": "heat"}
glow("c_heatOn", "c_heat", lp("c_heat")[:-1], "heat", steady=True, g=.95)
glow("c_heatP", "c_heat", ["c_heater0", "c_heater6", "c_heater12"], "hot", steady=False, g=.5, freq=1.2)
glow("c_meltOn", "c_melt", ["c_meltB"], "heat", steady=False, g=.3, freq=.9)
glow("c_menOn", "c_men", ["c_men"], "hot", steady=False, g=1.0, freq=2.0, halo=.5)
glow("c_chunkHot", "c_chunk", ["c_chunk"], "heat", steady=True, g=.8)
glow("c_seedOn", "c_seed", ["c_seedP"], "hot", steady=False, g=.8, freq=1.6)
glow("c_ledG", "c_side", ["c_twG"], "led", steady=False, g=.9, freq=1.2)
SPIN_X = lp("c_xtal"); SPIN_S = lp("c_seed")
spin("c_rotX", "c_xtal", SPIN_X, CX, .22)
spin("c_rotS", "c_seed", SPIN_S, CX, .22)
spin("c_rotC", "c_cru", lp("c_cru"), CX, -.12)
anchor("c_toolA", "c_body", [CX + 1.5, 14.0, 0], dx=160, dy=-80)
anchor("c_ingA", "c_xtal", [CX + 1.0, BODY0 + 2.2, .6], dx=170, dy=-40)
anchor("c_seedA", "c_seed", [CX + .13, NK1 + .25, 0], dx=170, dy=-70)
anchor("c_crucA", "c_cru", [CX - 2.0, 5.2, 1.0], dx=-170, dy=60)
anchor("c_heatA", "c_heat", [CX + 2.55, 3.4, -.6], dx=170, dy=60)
anchor("c_chunkA", "c_chunk", [CX - .6, 5.3, .4], dx=-170, dy=-80)
anchor("c_meltA", "c_melt", [CX + 1.3, YM, .9], dx=170, dy=40)
anchor("c_arA", "c_body", [CX - 1.22, 12.0, .3], dx=-160, dy=-40)

# ═════════ W：線鋸 x=72、拋光機 x=81 ═════════
WX = 72
box("w_base", "w_saw", "cab", [8.4, 1.8, 5.6], [WX, .9, 0], bevel=.06)
box("w_baseP", "w_saw", "cabPanel", [2.4, 1.2, .06], [WX, .9, 2.83], at=[[-2.7, 0, 0], [0, 0, 0], [2.7, 0, 0]], bevel=.02)
box("w_post", "w_saw", "steel2", [.6, 7.8, 4.8], [WX, 5.7, 0], at=[[-3.9, 0, 0], [3.9, 0, 0]])
box("w_top", "w_saw", "steel", [8.4, .7, 4.8], [WX, 9.6, 0], bevel=.04)
box("w_slide", "w_saw", "steelHi", [.3, 2.6, .3], [WX, 8.0, 0], at=[[-.9, 0, -1.6], [.9, 0, -1.6]])
RLX, RLY, RLR = 2.4, 3.2, .8
for s in (-1, 1):
    cyl(f"w_roll{'ab'[s > 0]}", "w_saw", "steelHi", RLR, 4.4, [WX + s * RLX, RLY, 0], axis="z")
    tube(f"w_groove{'ab'[s > 0]}", "w_saw", "steel2", RLR + .02, RLR - .02, .04, [WX + s * RLX, RLY, 0], axis="z", at=[[0, 0, -1.9 + .16 * j] for j in range(25)])
    cyl(f"w_hub{'ab'[s > 0]}", "w_saw", "steel2", .35, .4, [WX + s * RLX, RLY, 2.35], axis="z")
WZ = [-1.92 + .16 * j for j in range(25)]
cyl("w_wireT", "w_saw", "wire", .025, 2 * RLX, [WX, RLY + RLR + .02, 0], axis="x", at=[[0, 0, z] for z in WZ])
cyl("w_wireB", "w_saw", "wire", .025, 2 * RLX, [WX, RLY - RLR - .02, 0], axis="x", at=[[0, 0, z] for z in WZ])
box("w_noz", "w_saw", "steel", [.3, .3, 4.2], [WX - 1.6, 5.0, 0])
flowx("w_wireF", "w_saw", [[WX - RLX, RLY + RLR + .06, -1.92], [WX + RLX, RLY + RLR + .06, -1.92]], shape="grit", n=4, lanes=25, gap=.16, ldir=(0, 0, 1), size=.05, rate=1.6, color="grit", rim="wire", rimO=.4)
flowx("w_cool", "w_saw", [[WX - 1.6, 4.85, -1.6], [WX - 1.3, 4.05, -1.6]], shape="liquid", n=3, lanes=6, gap=.64, ldir=(0, 0, 1), size=.08, rate=1.0, color="slurry", rim="slurryR", band=.05, bandO=.6)
air("w_airS", "w_saw", [WX - RLX, 3.9, -2.0], [WX + RLX, 5.1, 2.0])
# 晶棒（橫放，16 片）＋黏著樑
NSL, SLT = 16, .24
IGY = 5.45
for k in range(NSL):
    z = -1.8 + SLT * (k + .5)
    cyl(f"w_sl{k}", f"w_sl{k}", "ingot", 1.0, SLT - .004, [WX, IGY, z], axis="z")
box("w_beam", "w_hold", "graphiteL", [1.0, .4, 4.0], [WX, IGY + 1.18, 0])
box("w_plate", "w_hold", "steel", [2.2, .35, 4.3], [WX, IGY + 1.55, 0], bevel=.03)
cyl("w_rod", "w_hold", "steelHi", .15, 1.6, [WX, IGY + 2.5, 0])
# 拋光機
PX0 = WX + 9.0
box("p_base", "p_pol", "cab", [6.6, 1.6, 6.6], [PX0, .8, 0], bevel=.06)
box("p_baseP", "p_pol", "cabPanel", [2.0, 1.0, .06], [PX0, .8, 3.33], at=[[-2.2, 0, 0], [0, 0, 0], [2.2, 0, 0]], bevel=.02)
cyl("p_plat", "p_plat", "steel", 2.7, .3, [PX0, 1.75, 0])
cyl("p_pad", "p_plat", "pad", 2.62, .06, [PX0, 1.93, 0])
tube("p_padR", "p_plat", "padG", 0, 0, 0, [PX0, 1.965, 0]) if False else None
for j, rr in enumerate([.7, 1.3, 1.9, 2.45]):
    tube(f"p_padR{j}", "p_plat", "padG", rr + .03, rr, .012, [PX0, 1.967, 0])
for j in range(6):
    box(f"p_padL{j}", "p_plat", "padG", [5.1, .012, .05], [PX0, 1.968, 0], rot=[0, 30 * j, 0])
HX = PX0 + 1.1
cyl("p_head", "p_head", "steelHi", 1.05, .45, [HX, 2.42, 0])
tube("p_headR", "p_head", "steel2", 1.08, 1.0, .12, [HX, 2.25, 0])
cyl("p_headB", "p_head", "steel2", .08, .1, [HX, 2.66, 0], at=[[.75 * math.cos(math.radians(a)), 0, .75 * math.sin(math.radians(a))] for a in range(0, 360, 45)])
cyl("p_shaft", "p_head", "steel2", .22, 1.9, [HX, 3.6, 0])
box("p_arm", "p_head", "steel", [3.0, .45, .6], [HX + 1.4, 4.6, 0], bevel=.04)
box("p_post", "p_pol", "steel2", [.7, 3.4, .7], [PX0 + 3.0, 3.0, -.2])
cyl("p_wr", "p_wr", "rough", .98, .05, [HX, 2.0, 0])
cyl("p_wm", "p_wm", "mirror", .98, .05, [HX, 2.0, 0])
pipe("p_sl", "p_pol", "steel2", [[PX0 - 3.0, 4.2, -.6], [PX0 - .4, 4.2, -.6], [PX0 - .4, 2.8, -.6]], .08)
flowx("p_slF", "p_pol", [[PX0 - .4, 2.72, -.6], [PX0 - .4, 2.0, -.6]], shape="liquid", n=3, size=.09, rate=.9, color="slurry", rim="slurryR", band=.06, bandO=.7)
air("p_airP", "p_pol", [PX0 - .6, 1.9, -.8], [PX0 - .2, 2.8, -.4])
spin("p_rotP", "p_plat", lp("p_plat"), PX0, .5)
spin("p_rotH", "p_head", ["p_head", "p_headR", "p_headB"], HX, .7)
glow("p_shine", "p_wm", ["p_wm"], "#FFFFFF", steady=False, g=.5, freq=1.3)
anchor("w_wireA", "w_saw", [WX + 1.6, RLY + RLR, 1.9], dx=170, dy=60)
anchor("w_ingA", f"w_sl{NSL - 1}", [WX - .7, IGY + .7, 1.8], dx=-170, dy=-60)
anchor("w_sliceA", f"w_sl{NSL - 1}", [WX - .9, IGY, 1.8], dx=-170, dy=40)
anchor("p_padA", "p_plat", [PX0 - 1.6, 1.95, 1.4], dx=-170, dy=60)
anchor("p_wmA", "p_wm", [HX + .5, 2.05, .6], dx=170, dy=60)
anchor("p_headA", "p_head", [HX + .9, 2.5, .3], dx=170, dy=-60)

# ═════════ K：8 吋與 12 吋晶圓 x=100 ═════════
KX = 100
box("k_tab", "k_tab", "cab2", [9.4, .35, 5.2], [KX, 2.2, 0], bevel=.04)
box("k_leg", "k_tab", "steel2", [.3, 2.0, .3], [KX, 1.0, 0], at=[[sx * 4.4, 0, sz * 2.3] for sx in (-1, 1) for sz in (-1, 1)])
box("k_foup", "k_tab", "pvdf", [2.6, 2.4, 2.4], [KX + 3.4, 3.6, -1.4], bevel=.14)
box("k_foupD", "k_tab", "cab2", [2.1, 1.9, .08], [KX + 3.4, 3.6, -.16])
def wafer_dies(pid, lay, cx, r, y, die=.27, gap=.04):
    pts = []; s = die + gap; n = int(r / s) + 1
    for i in range(-n, n + 1):
        for j in range(-n, n + 1):
            x, z = i * s, j * s
            if math.hypot(abs(x) + die / 2, abs(z) + die / 2) < r - .06: pts.append([x, 0, z])
    box(pid, lay, "die", [die, .012, die], [cx, y, 0], at=pts); return len(pts)
W12X, W8X, WY = KX + .6, KX - 3.0, 2.42
cyl("k_w12", "k_w12", "mirror", 1.5, .05, [W12X, WY, 0])
N12 = wafer_dies("k_d12", "k_w12", W12X, 1.5, WY + .03)
box("k_notch12", "k_w12", "cab2", [.1, .06, .1], [W12X, WY, 1.47])
cyl("k_w8", "k_w8", "mirror", 1.0, .05, [W8X, WY, 0])
N8 = wafer_dies("k_d8", "k_w8", W8X, 1.0, WY + .03)
box("k_notch8", "k_w8", "cab2", [.08, .06, .08], [W8X, WY, .98])
cyl("k_epi", "k_epi", "epi", 1.5, .04, [W12X, WY + .07, 0])
glow("k_shine12", "k_w12", ["k_w12"], "#FFFFFF", steady=False, g=.45, freq=1.1)
glow("k_d12On", "k_w12", ["k_d12"], "#7FB7FF", steady=False, g=.6, freq=1.6)
glow("k_epiOn", "k_epi", ["k_epi"], "epi", steady=False, g=.6, freq=1.4)
anchor("k_w12A", "k_w12", [W12X + 1.2, WY, .8], dx=170, dy=60)
anchor("k_w8A", "k_w8", [W8X - .8, WY, .6], dx=-160, dy=60)
anchor("k_epiA", "k_epi", [W12X + 1.0, WY + .08, -.6], dx=170, dy=-70)

# ═════════ P：矽晶格＋雜質 x=125 ═════════
PX = -26; SPc = 1.0
IMP = (1, 3)
G = [[], [], []]
for i in range(-4, 5):
    for j in range(1, 6):
        for z in (0, -1):
            if z == 0 and (i, j) == IMP: continue
            G[(i + j) % 3].append([i * SPc, j * SPc, z * SPc])
for g in range(3): sph(f"x_si{g}", "x_lat", "si", .26, [PX, 0, 0], at=G[g])
box("x_bx", "x_lat", "siB", [SPc, .07, .07], [PX + SPc / 2, 0, 0], at=[[i * SPc, j * SPc, z] for i in range(-4, 4) for j in range(1, 6) for z in (0, -1)])
box("x_by", "x_lat", "siB", [.07, SPc, .07], [PX, SPc / 2, 0], at=[[i * SPc, j * SPc, z] for i in range(-4, 5) for j in range(1, 5) for z in (0, -1)])
box("x_bz", "x_lat", "siB", [.07, .07, SPc], [PX, 0, -SPc / 2], at=[[i * SPc, j * SPc, 0] for i in range(-4, 5) for j in range(1, 6)])
box("x_base", "x_lat", "siB", [9.6, .5, 2.4], [PX, .45, -.5])
sph("x_imp", "x_imp", "imp", .36, [PX + IMP[0] * SPc, IMP[1] * SPc, 0])
glow("x_impOn", "x_imp", ["x_imp"], "imp", steady=False, g=.9, freq=2.0, halo=.6)
for j, yy in enumerate([2.5, 3.5]):
    bend = [[PX - 4.6, yy, .45], [PX + .2, yy, .45], [PX + 1.0, yy + (.45 if yy > 3 else -.45), .8], [PX + 1.8, yy, .45], [PX + 4.6, yy, .45]]
    flowx(f"x_ele{j}", "x_lat", bend, shape="dot", n=7, size=.12, rate=.55, color="ele", rim="eleR", trail=3)
air("x_airE", "x_lat", [PX - 4.8, 1.8, -.2], [PX + 4.8, 4.2, 1.1])
anchor("x_siA", "x_lat", [PX - 3.0, 5.0, .2], dx=-150, dy=-90)
anchor("x_impA", "x_imp", [PX + 1.0, 3.3, .3], dx=170, dy=-100)

# ═════════ F：全球五家矽晶圓廠 x=150（s10）／K 後方台灣三家（s11） ═════════
# 2026/11/24 審片必改：s10「全球誰在做」主畫面要換成跟公司有關的場景 → 五棟看得出是晶圓廠的廠房（鋸齒屋頂、屋頂空調、排氣塔、
# 潔淨室側翼、亮燈窗帶、門口晶圓盒），念到哪家就落下那一棟、窗帶亮起；念「超過八成」時五棟的晶圓盒沿虛線流到前方集貨台。
# 公司識別＝3D 標籤（中文名＋國旗）與 2D 卡（官方 LOGO＋國旗）；廠房招牌只用公司色塊，不畫 LOGO（LOGO 只用原檔）。
materials.update({"m_" + k: v for k, v in {
 "win": {"kind": "std", "color": "#BFD8FF", "emissive": "#9CC3FF", "ei": .35, "rough": .2, "metal": .1},
 "roofS": M("#B7C3D4", rough=.5, metal=.3), "signB": M("#1D4293", rough=.4, metal=.1), "signA": M("#F2A21E", rough=.4, metal=.1),
 "signR": M("#D9363E", rough=.4, metal=.1), "signT": M("#00857C", rough=.4, metal=.1), "signP": M("#6A4FB3", rough=.4, metal=.1)}.items()})
def fab(pre, lay, x, z, sign, s=1.0, anc=None):
    """一棟晶圓廠（原點在地面中心，s＝縮放）"""
    S_ = lambda v: [R(a * s) for a in v]
    P_ = lambda dx, dy, dz: [x + dx * s, dy * s, z + dz * s]
    box(f"{pre}_pl", lay, "conc", S_([5.6, .3, 4.2]), P_(0, .15, 0))
    box(f"{pre}_hall", lay, "wall", S_([4.2, 2.4, 3.0]), P_(-.4, 1.5, 0), bevel=.05)
    box(f"{pre}_rib", lay, "wall2", S_([.08, 2.3, .06]), P_(-.4, 1.5, 1.52), at=[[R(k * .7 * s), 0, 0] for k in range(-3, 4)])
    box(f"{pre}_win", lay, "win", S_([3.9, .34, .05]), P_(-.4, 2.05, 1.53))
    box(f"{pre}_saw", lay, "roofS", S_([1.45, .12, 3.1]), P_(-.4, 2.98, 0), rot=[0, 0, -24], at=[[R(k * 1.38 * s), 0, 0] for k in (-1, 0, 1)])
    box(f"{pre}_sawG", lay, "win", S_([.05, .5, 3.0]), P_(-.4, 2.95, 0), at=[[R((k * 1.38 + .66) * s), 0, 0] for k in (-1, 0, 1)])
    box(f"{pre}_ahu", lay, "cab2", S_([.8, .5, .8]), P_(-.4, 3.25, 0), at=[[R(-1.3 * s), 0, R(-.8 * s)], [R(.2 * s), 0, R(-.8 * s)]], bevel=.03)
    cyl(f"{pre}_fan", lay, "steel2", .28 * s, .08 * s, P_(-.4, 3.53, 0), at=[[R(-1.3 * s), 0, R(-.8 * s)], [R(.2 * s), 0, R(-.8 * s)]])
    cyl(f"{pre}_stk", lay, "steelHi", .17 * s, 1.9 * s, P_(1.2, 3.35, -1.1), at=[[0, 0, 0], [R(-.5 * s), 0, 0]])
    box(f"{pre}_cr", lay, "cab", S_([1.5, 1.7, 2.6]), P_(2.45, 1.15, -.1), bevel=.04)
    box(f"{pre}_crW", lay, "win", S_([1.2, .22, .05]), P_(2.45, 1.55, 1.21))
    box(f"{pre}_door", lay, "cabD", S_([.9, 1.0, .05]), P_(-1.6, .8, 1.53))
    box(f"{pre}_sign", lay, sign, S_([1.9, .5, .07]), P_(.55, 1.05, 1.55))
    box(f"{pre}_foup", lay, "pvdf", S_([.42, .42, .42]), P_(1.6, .51, 1.75), at=[[R(i * .48 * s), R(j * .44 * s), 0] for i in (0, 1) for j in (0, 1)], bevel=.03)
    if anc: anchor(anc, lay, P_(-.4, 3.3, .6), dx=0, dy=-120)
    return [f"{pre}_win", f"{pre}_sawG", f"{pre}_crW"]
FX = 125
FABS = [("shin", "signB", "JP"), ("sumco", "signR", "JP"), ("gw", "signA", "TW"), ("sil", "signT", "DE"), ("sk", "signP", "KR")]
FAB_POS = [(-6.4, -3.2), (-3.2, 2.2), (0, -3.2), (6.4, -3.2), (3.2, 2.2)]      # 後排 3 棟（信越、環球晶、世創）、前排 2 棟（勝高、SK）
for k, ((cid, sg, _), (dx, dz)) in enumerate(zip(FABS, FAB_POS)):
    wins = fab(f"f{k}", f"f_fab{k}", FX + dx, dz, sg, anc=f"f_{cid}A")
    glow(f"f_on{k}", f"f_fab{k}", wins, "#9CC3FF", steady=False, g=.7, freq=1.2)
box("f_pad", "f_site", "conc", [24, .2, 15], [FX, .1, .4])
box("f_road", "f_site", "cabD", [22, .03, 1.2], [FX, .21, 5.9])
box("f_lane", "f_site", "ffu", [.8, .02, .12], [FX, .23, 5.9], at=[[-10 + 2 * i, 0, 0] for i in range(11)])
box("f_dock", "f_hub", "cab2", [3.6, .4, 2.0], [FX, .2, 7.4], bevel=.04)
box("f_hubB", "f_hub", "pvdf", [.42, .42, .42], [FX, .61, 7.4], at=[[-1.2 + .48 * i, .44 * j, -.5 + .5 * m] for i in range(6) for j in range(2) for m in range(3)], bevel=.03)
for k, (dx, dz) in enumerate(FAB_POS):
    flowx(f"f_ship{k}", "f_site", [[FX + dx + 1.8, .4, dz + 1.9], [FX + dx + 1.8, .4, 5.9], [FX, .4, 5.9], [FX, .4, 6.6]], shape="dot", n=3, size=.2, rate=.45, color="#FFFFFF", rim="steel2", trail=2)
anchor("f_hubA", "f_hub", [FX, 1.2, 7.4], dx=0, dy=110)
# 台灣三家（s11，K 站晶圓桌後方，縮小 0.62）
TWF = [("tw", "signA", -5.6), ("fst", "signB", 0), ("ww", "signT", 5.6)]
for k, (cid, sg, dx) in enumerate(TWF):
    wins = fab(f"t{k}", f"k_fab{k}", KX + dx, -6.6, sg, s=.8, anc=f"k_{cid}A")
    glow(f"k_on{k}", f"k_fab{k}", wins, "#9CC3FF", steady=False, g=.7, freq=1.2)
spin("k_spin12", "k_w12", ["k_w12", "k_d12", "k_notch12"], W12X, .06)

# 主素材框（看不見；給 layout-check 判斷「卡片／標籤有沒有蓋到主體中央」）：每段只亮鏡頭對準的那一個，其他層全部標 bg
materials["m_proxy"] = {"kind": "unlit", "color": "#FFFFFF", "opacity": 0}
PXB = {"px_arc": (QX - 4.2, QX + 4.8, .3, 9.9, -4.0, 4.6), "px_sie": (DX - 1.2, SX + 3.4, .2, 10.4, -3.2, 3.2),
       "px_czm": (CX - 4.2, CX + 4.2, 1.4, 7.8, -4.2, 4.2), "px_czc": (CX - 4.2, CX + 4.2, 1.4, 11.2, -4.2, 4.2),
       "px_saw": (WX - 4.2, WX + 4.2, 1.8, 10.0, -2.4, 2.4), "px_pol": (PX0 - 3.3, PX0 + 3.3, 1.6, 4.9, -3.3, 3.3),
       "px_k": (W8X - 1.1, W12X + 1.6, 2.2, 2.6, -1.6, 1.6), "px_lat": (PX - 4.4, PX + 4.4, .2, 5.6, -1.3, .9), "px_fab": (FX - 9.2, FX + 9.6, .2, 3.6, -5.3, 4.3)}
for lid, (x0, x1, y0, y1, z0, z1) in PXB.items():
    box(lid, lid, "proxy", [x1 - x0, y1 - y0, z1 - z0], [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2])
for l in layers:
    if not l["id"].startswith("px_"): l["bg"] = True
model = {
 "name": "tech-wafer1：矽晶圓-1。站別：Q 電弧爐 x=0、S 西門子法 x=24、C 拉晶爐 x=48、W 線鋸 x=72／拋光 x=81、K 晶圓 x=100、P 晶格 x=125（genmodel.py 產生）",
 "unit": "示意，非實際比例", "size": {"w": 14, "h": 2, "r": .1, "t": 6},
 "palette": palette, "materials": materials, "layers": layers, "anchors": anchors, "parts": parts, "actions": actions,
 "pose": {"yaw0": 0, "yawIso": 0, "drift": 0},
 "camera": {"stand": {"d": 60, "elev": 22, "y": 4}},
 "fx": {"dpr": 1, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
}
json.dump(model, open(os.path.join(D, "model.json"), "w"), ensure_ascii=False, indent=1)
print("零件", len(parts), "層", len(layers), "動作", len(actions), "12吋晶粒", N12, "8吋晶粒", N8)

# ═════════════════ 各幕 props（併進 script.json） ═════════════════
subprocess.run([sys.executable, os.path.join(D, "genscript.py")], check=True)
sp = os.path.join(D, "script.json"); script = json.load(open(sp))
HIDE = "s1:start-40"; FAR = "s12:start+400"; EARLY = "s1:start-300"
def off(c, n): return f"{c}{'+' if n >= 0 else '-'}{abs(n)}"
def run(i, at, until=None, ramp=6, **kw):
    d = {"id": i, "at": at, "ramp": ramp}
    if until: d["until"] = until
    d.update(kw); return d
def lab(part, text, en, color, at, until, xy=None):
    d = {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until}
    if xy: d["xy"] = xy
    return d
def shot(at, x, y, d, elev, dur=24): return {"at": at, "dur": dur, "x": x, "y": y, "d": d, "elev": elev}
def hid(lay, a, b, dur=6): return {"layer": lay, "at": a, "until": b, "opacity": 0, "dur": dur}
def mv(lay, at, until, dur=14, dx=0, dy=0, dz=0, **kw):
    d = {"layer": lay, "at": at, "until": until, "dur": dur, "dx": dx, "dy": dy, "dz": dz}; d.update(kw); return d
def fall(lay, until, dy=1.4, bounce=.08):
    return {"layer": lay, "at": HIDE, "until": until, "dy": dy, "opacity": 0, "dur": 12, "fallIn": True, "bounce": bounce}
def sec(kind, at, until, title, tag, t, y=930, h=330, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag, "t": {k: {"at": v} for k, v in t.items()}}
    d.update(kw); return d

RESET = "s2:start+20"
VIS = [
 # 拉晶：s1 晶棒已經在往上長（還差 2 單位）；s2 起鏡頭離開時沉回熔湯底下並藏起來；s5 熔完才出現（晶種懸在液面上 1.5）；s6 念「晶種浸下去」下降碰到液面、念「往上拉」整根慢慢長出來
 mv("c_xtal", EARLY, "s1:start+5", dur=120, dy=-2.0), mv("c_seed", EARLY, "s1:start+5", dur=120, dy=-2.0),
 mv("c_xtal", RESET, "s6:pull", dur=84, dy=-LIFT), mv("c_seed", RESET, "s6:pull", dur=84, dy=-LIFT),
 mv("c_seed", RESET, "s6:seed", dur=24, dy=1.5),
 hid("c_xtal", RESET, "s5:melt+34", 4), hid("c_seed", RESET, "s5:melt+34", 4),
 hid("c_melt", RESET, "s5:melt", 24), hid("c_men", RESET, "s6:seed+22", 8),
 fall("c_chunk", "s5:cruc", dy=1.8, bounce=.1), hid("c_chunk", "s5:melt+12", FAR, 30),
 # 西門子：矽棒越長越粗（念「長回棒子上」一層一層長出來）
 hid("s_g1", HIDE, "s4:rod", 20), hid("s_g2", HIDE, "s4:rod+24", 20), hid("s_g3", HIDE, "s4:poly", 20),
 # 線鋸：念「鑽石線」晶棒往下壓進線網切；念「切成薄片」整排抬起、一片片分開
 mv("w_hold", "s7:saw-8", FAR, dur=40, dy=-2.3), mv("w_hold", "s7:slice+4", FAR, dur=24, dy=2.9),
 # 拋光：念「就是晶圓」載具頭抬起，看到鏡面
 hid("p_wm", HIDE, "s8:pol+20", 10), hid("p_wr", "s8:pol+20", FAR, 10), mv("p_head", "s8:pol+6", FAR, dur=20, dy=1.3),
 # 下一集預告：磊晶層
 hid("k_epi", HIDE, "s11:next", 16),
 fall("f_hub", "s10:top5", dy=1.2),
] + [fall(f"f_fab{k}", f"s10:{c}", dy=2.2, bounce=.1) for k, (c, _, _) in enumerate(FABS)] + [fall(f"k_fab{k}", f"s11:{c}" + ("+4" if c == "ww" else ""), dy=1.6, bounce=.1) for k, (c, _, _) in enumerate(TWF)]
for k in range(NSL):
    VIS.append(mv(f"w_sl{k}", "s7:saw-8", FAR, dur=40, dy=-2.3))
    VIS.append(mv(f"w_sl{k}", "s7:slice+4", FAR, dur=24, dy=2.9, dz=(k - (NSL - 1) / 2) * .16))
PXW = {"px_czc": [(EARLY, "s2:start-4"), ("s6:start+30", "s7:start-4")], "px_czm": [("s5:start+30", "s6:start-4")], "px_fab": [("s10:start+30", "s11:start-4")], "px_arc": [("s2:start+30", "s3:start-4")], "px_lat": [("s3:start+30", "s4:start-4")],
       "px_sie": [("s4:start+30", "s5:start-4")], "px_saw": [("s7:start+30", "s8:start-4")], "px_pol": [("s8:start+30", "s9:start-4")],
       "px_k": [("s9:start+30", "s10:start-4"), ("s11:start+30", FAR)]}
for lid, wins in PXW.items():
    prev = "s1:start-400"
    for a_, b_ in wins:
        VIS.append({"layer": lid, "at": prev, "until": a_, "opacity": 0, "dur": 1}); prev = b_
    VIS.append({"layer": lid, "at": prev, "until": "s12:start+500", "opacity": 0, "dur": 1})
CZRUN = lambda a, b: [run("c_rotX", a, b, 12), run("c_rotS", a, b, 12), run("c_rotC", a, b, 12), run("c_heatOn", a, b, 10), run("c_heatP", a, b, 10), run("c_meltOn", a, b, 8),
                      run("c_menOn", a, b, 8), run("c_arF0", a, b, 8), run("c_arF1", a, b, 8), run("c_wave0", a, b, 6), run("c_wave1", a, b, 6)]
P = {}
P["s1"] = {"zoom": [{"to": "tool", "at": "start-30", "dur": 1}],
 "shot": [shot("start-30", CX, 5.6, 60, 16, 1), shot("how", CX, 5.6, 58, 18, 70)],
 "shift": VIS,
 "run": CZRUN("start-30", "s2:start") + [run("c_ledG", "start-30", FAR, 1)],
 "labels": [lab("c_ingA", "晶棒正在長", "An ingot growing", "blue", "how", "s2:start-4")],
 "overlay": [sec("si-hook", "chip", "s2:start-2", "代工的供應商：矽晶圓", "示意，非實際比例", {"chip": "chip", "sand": "sand", "how": "how", "mirror": "mirror"})]}
P["s2"] = {"zoom": [{"to": "plant", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", QX - 1.5, 1.2, 56, 18, 30)],
 "run": [run("q_feed", "start", "s3:start", 8), run("q_sandOn", "sio2", "carbon", 6), run("q_arcOn", "carbon-6", "s3:start", 4), run("q_hot", "carbon", "s3:start", 10)]
        + [run(f"q_co{j}", "oxy-4", "s3:start", 8) for j in range(4)] + [run("q_tap", "mg-10", "s3:start", 8), run("q_ladHot", "mg", "s3:start", 8)],
 "labels": [lab("q_sandA", "石英砂", "Quartz sand (SiO₂)", "amber", "sio2", "carbon-4"), lab("q_elA", "石墨電極放電", "Graphite arc", "blue", "carbon", "s3:start-4"),
            lab("q_coA", "一氧化碳排出", "O leaves as CO", "coral", "oxy", "s3:start-4"), lab("q_mgA", "冶金級矽", "Metallurgical Si", "blue", "mg", "s3:start-4")],
 "overlay": [sec("si-mg", "start+2", "s3:start-2", "電弧爐：砂變冶金級矽", "USPTO 9067338", {"sio2": "sio2", "carbon": "carbon", "oxy": "oxy", "p98": "p98", "mg": "mg"})]}
P["s3"] = {"zoom": [{"to": "atom", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", PX, .7, 32, 12, 30)],
 "run": [run("x_ele0", "start", "s4:start", 8), run("x_ele1", "start", "s4:start", 8), run("x_impOn", "imp", "s4:start", 6)],
 "labels": [lab("x_siA", "矽原子", "Silicon atoms", "blue", "e11", "s4:start-4"), lab("x_impA", "一顆雜質", "One impurity", "coral", "imp", "s4:start-4")],
 "overlay": [sec("si-pure", "start+2", "s4:start-2", "十一個九有多純", "Bernreuter Research", {"but": "but", "n11": "n11", "e11": "e11", "imp": "imp", "ok": "ok"})]}
P["s4"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", SX - 1.6, 1.9, 54, 16, 30)],
 "run": [run("s_pin", "gas", "s5:start", 8)] + [run(f"s_vap{j}", "dist-6", "s5:start", 8) for j in range(4)] + [run("s_pout", "dist+10", "s5:start", 8)]
        + [run(f"s_gas{j}", "rod-12", "s5:start", 8) for j in range(3)] + [run(f"s_dep{j}", "rod", "s5:start", 8) for j in range(4)]
        + [run("s_rodHot", "rod-12", "s5:start", 10), run("s_g1Hot", "rod", "s5:start", 10), run("s_g2Hot", "rod+24", "s5:start", 10), run("s_g3Hot", "poly", "s5:start", 10)],
 "labels": [lab("s_fbrA", "矽＋氯化氫→氣體", "Si + HCl → gas", "amber", "gas", "s5:start-4", xy=[300, 300]), lab("s_colA", "蒸餾塔", "Distillation", "blue", "dist", "s5:start-4", xy=[300, 853]),
            lab("s_rodA", "矽棒越長越粗", "Rods grow thicker", "coral", "rod", "s5:start-4", xy=[780, 300]), lab("s_polyA", "多晶矽", "Polysilicon", "blue", "poly", "s5:start-4", xy=[790, 853])],
 "overlay": [sec("si-siem", "start+2", "s5:start-2", "西門子法：氣體→蒸餾→長回棒", "Fraunhofer ISE；Wacker", {"siem": "siem", "gas": "gas", "dist": "dist", "rod": "rod", "poly": "poly"})]}
P["s5"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", CX, 2.6, 48, 24, 24)],
 "run": [run("c_heatOn", "heat-4", "s7:start", 10), run("c_heatP", "heat", "s7:start", 10), run("c_chunkHot", "heat", "s6:start", 12), run("c_meltOn", "melt", "s7:start", 10),
         run("c_wave0", "melt+10", "s7:start", 6), run("c_wave1", "melt+10", "s7:start", 6), run("c_rotC", "heat", "s7:start", 14)],
 "labels": [lab("c_chunkA", "多晶矽塊", "Polysilicon chunks", "blue", "cruc+10", "melt+6", xy=[290, 300]), lab("c_crucA", "石英坩堝", "Crucible", "amber", "cruc", "s6:start-4", xy=[225, 640]),
            lab("c_heatA", "石墨加熱器", "Heater", "coral", "heat", "s6:start-4", xy=[855, 640]), lab("c_meltA", "熔湯", "Silicon melt", "coral", "melt+10", "s6:start-4", xy=[780, 300])],
 "overlay": [sec("si-melt", "start+2", "s6:start-2", "多晶→熔湯", "示意，非實際比例", {"messy": "messy", "cruc": "cruc", "heat": "heat", "deg": "deg", "melt": "melt"})]}
P["s6"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}],
 "shot": [shot("start-4", CX, 3.6, 46, 24, 30), shot("pull", CX, 4.0, 50, 18, 120)],
 "run": [run("c_seedOn", "seed", "pull+20", 6)] + [run(x, "rot", "s7:start+10", 12) for x in ("c_rotX", "c_rotS")] + [run("c_menOn", "seed+18", "s7:start", 8), run("c_arF0", "pull", "s7:start", 8), run("c_arF1", "pull", "s7:start", 8)],
 "labels": [lab("c_seedA", "晶種", "Seed crystal", "amber", "seed", "pull+40", xy=[780, 300]), lab("c_crucA", "坩堝反轉", "Counter-spin", "blue", "rot", "s7:start-4", xy=[235, 720]),
            lab("c_ingA", "單晶晶棒", "Single crystal", "blue", "ingot", "s7:start-4", xy=[845, 640]), lab("c_arA", "氬氣往下吹", "Argon flows down", "blue", "line", "s7:start-4", xy=[290, 300])],
 "overlay": [sec("si-cz", "start+2", "s7:start-2", "拉晶：原子照晶種排隊", "Wikipedia；USPTO 6689209", {"seed": "seed", "rot": "rot", "pull": "pull", "line": "line", "ingot": "ingot"})]}
P["s7"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", WX, 3.2, 37, 16, 30)],
 "run": [run("w_wireF", "start", "s8:start", 6), run("w_cool", "start", "s8:start", 6)],
 "labels": [lab("w_wireA", "鑽石線", "Diamond wire", "blue", "saw", "s8:start-4"), lab("w_sliceA", "一片片薄片", "Thin slices", "amber", "slice+20", "s8:start-4")],
 "overlay": [sec("si-saw", "start+2", "s8:start-2", "線鋸切片", "Wikipedia Wafer", {"saw": "saw", "slice": "slice"})]}
P["s8"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", PX0, 1.2, 26, 26, 30)],
 "run": [run("p_rotP", "start", "s9:start", 12), run("p_rotH", "start", "pol+6", 12), run("p_slF", "start", "pol+6", 6), run("p_shine", "pol+24", "s9:start", 6)],
 "labels": [lab("p_padA", "拋光墊＋研磨液", "Pad + slurry", "blue", "grind", "s9:start-4"), lab("p_wmA", "鏡面晶圓", "Mirror wafer", "amber", "pol+24", "s9:start-4")],
 "overlay": [sec("si-pol", "start+2", "s9:start-2", "研磨→拋光", "USPTO 9108289", {"grind": "grind", "pol": "pol", "wafer": "wafer"})]}
P["s9"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", KX - 1.1, 1.4, 24, 44, 30)],
 "run": [run("k_shine12", "why", "s10:start", 6), run("k_d12On", "more", "s10:start", 8)],
 "labels": [lab("k_w12A", "12 吋", "300 mm", "blue", "why", "s10:start-4", xy=[780, 300]), lab("k_w8A", "8 吋", "200 mm", "amber", "area", "s10:start-4", xy=[300, 300])],
 "overlay": [sec("si-size", "start+2", "s10:start-2", "12 吋 vs 8 吋", "Wevolver；Wikipedia", {"why": "why", "area": "area", "more": "more"})]}
FLAB = {"shin": ("信越化學", "Japan", "blue"), "sumco": ("勝高", "Japan", "coral"), "gw": ("環球晶", "Taiwan", "amber"), "sil": ("世創", "Germany", "blue"), "sk": ("SK Siltron", "Korea", "coral")}
FXY = {"shin": [205, 360], "sumco": [300, 830], "gw": [530, 360], "sil": [840, 360], "sk": [760, 830]}
P["s10"] = {"zoom": [{"to": "plant", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", FX, -2.2, 54, 26, 30), shot("top5", FX, -2.0, 52, 30, 60)],
 "run": [run(f"f_on{k}", c, "s11:start", 6) for k, (c, _, _) in enumerate(FABS)] + [run(f"f_ship{k}", "top5", "s11:start", 8) for k in range(5)],
 "labels": [dict(lab(f"f_{c}A", FLAB[c][0], FLAB[c][1], FLAB[c][2], c, "s11:start-4", xy=FXY[c]), flag=fl) for c, _, fl in FABS],
 "overlay": [sec("si-co", "start+2", "s11:start-2", "全球誰在做", "旺得富、官股投顧報告", {"shin": "shin", "sumco": "sumco", "gw": "gw", "sil": "sil", "sk": "sk", "top5": "top5"})]}
P["s11"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", KX, 2.2, 34, 22, 34), shot("next", W12X, 1.8, 20, 34, 40)],
 "run": [run("k_shine12", "start", FAR, 6), run("k_spin12", "start-4", FAR, 12), run("k_epiOn", "next", FAR, 6)] + [run(f"k_on{k}", c, FAR, 6) for k, (c, _, _) in enumerate(TWF)],
 "labels": [dict(lab("k_twA", "環球晶", "Taiwan", "amber", "tw", "next-4", xy=[230, 360]), flag="TW"), dict(lab("k_fstA", "台勝科", "Taiwan", "blue", "fst", "next-4", xy=[540, 360]), flag="TW"),
            dict(lab("k_wwA", "合晶", "Taiwan", "blue", "ww+4", "next-4", xy=[850, 360]), flag="TW"),
            lab("k_epiA", "磊晶層（下一集）", "Epitaxial layer (next)", "blue", "next+6", "kw-10")],
 "overlay": [sec("si-next", "start+2", "kw-10", "台灣誰在做", "下一集：矽晶圓-2", {"tw": "tw", "fst": "fst", "ww": "ww", "what": "what", "next": "next", "kw": "kw"})]}
for sc in script["scenes"]:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])
json.dump(script, open(sp, "w"), ensure_ascii=False, indent=1)
print("script props 併入", len(P), "幕")
