# tech-mask1 產生器：python3 videos/tech-mask1/genmodel.py → model.json，並先跑 genscript.py、再把各幕 3D 動作與 2D 卡併進 script.json
# 座標：x 右、y 上、z 朝觀眾；單位示意（非實際比例）。六站以 x 偏移分開，鏡頭一次只看一站：
#   D x=0    DUV 穿透式光路（照明→石英＋鉻光罩→護膜→縮小 4 倍鏡頭→晶圓光阻；光被鉻擋住處斷開、穿過開口的收斂到晶圓）   s1–s4
#   G x=40   玻璃測試：深紫外光穿過石英、極紫外光在表面被吃掉                                                                   s5
#   E x=70   EUV 反射式光罩剖面（靜電吸盤、背面導電層、低熱膨脹玻璃、鉬／矽 40 對、保護層、吸收層；斜射光被反射或被吸收）     s6–s7
#   H x=100  整片光罩（6 吋見方石英板、圖案區、對位記號、條碼、護膜框＋薄膜、灰塵落在膜上）                                     s8、s11
#   L x=130  一整套光罩（三疊各 20 片）＋檢查中的一片（掃描光帶、缺陷點）                                                         s9
#   B x=160  空白光罩：兩疊 EUV 空白光罩＋前面一片分層拆開                                                                        s10
# 所有動作的 at 都寫成「幕id:cue±幀」（cue 來自 timeline.json；配音重跑 align 後重跑本檔即可）。
import json, math, os, random, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))
R = lambda x: round(x, 3)
rnd = random.Random(20261205)
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

def M(color, **k): return {"kind": "std", "color": color, "rough": .45, "metal": .1, **k}

palette = {"floor": "#E3E9F1", "floorG": "#A8B4C6", "wall": "#DCE4EE", "wall2": "#C9D3E1", "ffu": "#F4F7FB",
 "cab": "#EEF2F7", "cab2": "#D7DEE8", "cabD": "#4A5873", "steel": "#A9B6CA", "steel2": "#7F8CA3", "steelHi": "#C9D3E2", "granite": "#5B6170",
 "quartz": "#CFE3F6", "chrome": "#3A3F48", "chromeHi": "#626A78", "ule": "#E7D7BE", "mo": "#4E5A70", "si": "#C3CFE2", "ru": "#C9B79C", "absb": "#262A31", "crn": "#6E6A62",
 "lens": "#BFD9F5", "mirror": "#C8D5EA", "resist": "#E8A23A", "expo": "#4F8DFF", "film": "#E6EEF8", "dust": "#7B6F60",
 "duv": "#2F6BFF", "duvR": "#1C4FD0", "euv": "#8B5CF6", "euvR": "#5B21B6", "hot": "#FF7A2F", "led": "#14C38E", "ledA": "#FF9F1C", "screen": "#2E6FD8",
 "label": "#F2F5FA", "bar": "#1F2430", "ok": "#14A38B", "bad": "#E0472F", "scan": "#FFF6D0"}
U = lambda c, o=None: {"kind": "unlit", "color": c, **({"opacity": o} if o is not None else {})}
materials = {
 "floor": M("floor", rough=.55, metal=0), "floorG": U("floorG"), "wall": M("wall", rough=.7, metal=0), "wall2": M("wall2", rough=.7, metal=0), "ffu": U("ffu"),
 "cab": M("cab", rough=.45, metal=.1), "cab2": M("cab2", rough=.5, metal=.1), "cabD": M("cabD", rough=.5, metal=.3),
 "steel": M("steel", rough=.28, metal=.88, env=.7, tex="brushed", texScale=2), "steel2": M("steel2", rough=.35, metal=.8, env=.6), "steelHi": M("steelHi", rough=.22, metal=.9, env=.9),
 "granite": M("granite", rough=.7, metal=.05),
 "quartz": {"kind": "phys", "color": "quartz", "rough": .05, "metal": 0, "clearcoat": 1, "opacity": .38, "env": .9},
 "chrome": M("chrome", rough=.25, metal=.85, env=.8), "pattern": M("chrome", rough=.25, metal=.8, env=.8, tex="traces", texScale=.5), "chromeHi": M("chromeHi", rough=.2, metal=.9, env=.9),
 "ule": M("ule", rough=.25, metal=0, env=.5), "mo": M("mo", rough=.3, metal=.8, env=.7), "si": M("si", rough=.3, metal=.3, env=.6), "ru": M("ru", rough=.25, metal=.8, env=.8),
 "absb": M("absb", rough=.5, metal=.4), "crn": M("crn", rough=.4, metal=.7),
 "lens": {"kind": "phys", "color": "lens", "rough": .03, "metal": 0, "clearcoat": 1, "opacity": .4, "env": 1.0},
 "mirror": {"kind": "phys", "color": "mirror", "rough": .04, "metal": .55, "clearcoat": 1, "env": 1.2},
 "resist": {"kind": "phys", "color": "resist", "rough": .2, "metal": 0, "clearcoat": .6, "opacity": .85},
 "expo": {"kind": "std", "color": "expo", "emissive": "expo", "ei": .7},
 "film": {"kind": "phys", "color": "film", "rough": .05, "metal": 0, "clearcoat": 1, "opacity": .2, "env": .9},
 "dust": M("dust", rough=.9, metal=0),
 "duvU": U("duv"), "euvU": U("euv"), "scan": U("scan", .85),
 "led": {"kind": "std", "color": "led", "emissive": "led", "ei": .9}, "ledA": {"kind": "std", "color": "ledA", "emissive": "ledA", "ei": .6},
 "screen": {"kind": "screen", "color": "screen", "ei": .7}, "label": M("label", rough=.6, metal=0), "bar": U("bar"),
 "air": U("#FFFFFF", .0),
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

def frame4(pid, lay, mat, cx, cy, cz, w, d, h, t):
    """矩形框（4 條邊），外尺寸 w×d、高 h、壁厚 t（護膜框、機架）"""
    box(pid, lay, mat, [w, h, t], [cx, cy, cz], at=[[0, 0, -(d - t) / 2], [0, 0, (d - t) / 2]])
    box(pid + "S", lay, mat, [t, h, d - 2 * t], [cx, cy, cz], at=[[-(w - t) / 2, 0, 0], [(w - t) / 2, 0, 0]])
def cross(pid, lay, mat, cx, pts, s=.36, t=.05, y=0):
    box(pid, lay, mat, [s, t, t * 1.4], [cx, y, 0], at=pts); box(pid + "v", lay, mat, [t * 1.4, t, s], [cx, y, 0], at=pts)

# ═════════ 廠房（背景，各站共用） ═════════
box("r_floor", "t_room", "floor", [190, .3, 40], [75, -.15, -2])
box("r_grate", "t_room", "floorG", [.1, .03, 40], [75, .02, -2], at=[[-94 + 2.0 * i, 0, 0] for i in range(95)])
box("r_grate2", "t_room", "floorG", [190, .03, .1], [75, .02, -2], at=[[0, 0, -19 + 2.0 * j] for j in range(20)])
box("r_wall", "t_room", "wall", [190, 30, .4], [75, 15, -16])
box("r_wallS", "t_room", "wall2", [.12, 29.6, .45], [75, 15, -15.9], at=[[-93 + 6 * i, 0, 0] for i in range(32)])
box("r_ffu", "t_room", "ffu", [5.6, .4, 5.6], [75, 30.2, -10], at=[[-93 + 6 * i, 0, k * 6] for i in range(32) for k in (0, 1)])
box("r_tray", "t_room", "steel2", [190, .25, .6], [75, 17.5, -14.6])
cyl("r_pipeW", "t_room", "steelHi", .18, 190, [75, 18.0, -14.6], axis="x", at=[[0, 0, 0], [0, .55, 0], [0, 1.1, 0]])

# ═════════ D：DUV 穿透式光路 x=0（照明 → 光罩（石英＋鉻）→ 護膜 → 縮小鏡頭 → 晶圓光阻） ═════════
DX = 0.0
O = [-2.4, -1.2, 0.0, 1.2, 2.4]          # 鉻的開口（光罩上的線條），寬 OW
OW, MY, MT = .5, 11.0, .5                # 光罩中心高度、石英厚度
MB = MY - MT / 2                          # 石英下表面（鉻在這裡）
CRT = .09
box("d_base", "d_base", "granite", [12, 1.0, 8], [DX, .5, 0], bevel=.06)
box("d_baseF", "d_base", "steel2", [12.2, .12, 8.2], [DX, 1.04, 0])
box("d_post", "d_frame", "steel2", [.7, 15.6, .7], [DX, 8.8, -3.6], at=[[-5.4, 0, 0], [5.4, 0, 0]], bevel=.04)
box("d_beam", "d_frame", "steel2", [11.5, .6, .7], [DX, 0, -3.6], at=[[0, 9.0, 0], [0, 12.6, 0], [0, 16.3, 0]], bevel=.04)
# 晶圓台＋晶圓＋光阻＋曝光出來的線條（縮小 4 倍）
cyl("d_chuck", "d_wf", "steel", 3.4, .45, [DX, 1.33, 0])
box("d_stageX", "d_wf", "cabD", [8.4, .3, 1.0], [DX, 1.25, 0], at=[[0, 0, -3.0], [0, 0, 3.0]])
cyl("d_wafer", "d_wf", "mirror", 3.0, .07, [DX, 1.59, 0])
cyl("d_resist", "d_wf", "resist", 2.97, .04, [DX, 1.645, 0])
box("d_img", "d_img", "expo", [OW / 4, .02, 1.6], [DX, 1.675, 0], at=[[x / 4, 0, 0] for x in O])
# 縮小投影鏡頭（鏡筒後半剖開，看得到 4 片鏡片）
staves("d_barrel", "d_lens", "steel2", DX, 2.5, 2.4, 8.6, n=12, t=.22)
tube("d_flange", "d_lens", "steel", 2.75, 2.2, .3, [DX, 8.6, 0]); tube("d_flangeB", "d_lens", "steel", 2.75, 2.2, .3, [DX, 2.4, 0])
for j, (yy, rr) in enumerate([(7.7, 2.15), (6.35, 1.85), (5.0, 1.55), (3.55, 1.25)]):
    cyl(f"d_ln{j}", "d_lensG", "lens", rr, .42, [DX, yy, 0])
    tube(f"d_lnR{j}", "d_lens", "steelHi", rr + .16, rr - .02, .16, [DX, yy, 0])
# 光罩台＋光罩（石英板，鉻在下表面，有開口）＋護膜（框＋薄膜，在圖案那一面）
box("d_mrail", "d_ms", "steel", [1.1, .45, 7.8], [DX, MY - .05, 0], at=[[-4.75, 0, 0], [4.75, 0, 0]], bevel=.04)
box("d_mclamp", "d_ms", "cabD", [.6, .3, .8], [DX, MY + .38, 0], at=[[sx * 4.4, 0, sz * 3.0] for sx in (-1, 1) for sz in (-1, 1)])
box("d_quartz", "d_mask", "quartz", [8.4, MT, 7.2], [DX, MY, 0], bevel=.03)
CR = []
edges = [-4.0] + sum([[x - OW / 2, x + OW / 2] for x in O], []) + [4.0]
for a, b in zip(edges[0::2], edges[1::2]): CR.append(((a + b) / 2, b - a))
for k, (cx, w) in enumerate(CR):
    box(f"d_cr{k}", "d_cr", "chrome", [w, CRT, 6.4], [DX + cx, MB - CRT / 2, 0])
frame4("d_pf", "d_pel", "steel", DX, MB - CRT - .28, 0, 7.0, 6.8, .5, .22)
box("d_pmem", "d_pel", "film", [6.6, .012, 6.4], [DX, MB - CRT - .53, 0])
# 照明（光源外殼＋聚光鏡＋出光窗）
box("d_ill", "d_ill", "cabD", [7.2, 2.4, 5.4], [DX, 15.2, -.4], bevel=.1)
box("d_illP", "d_ill", "cab2", [6.2, 1.6, .06], [DX, 15.3, 2.32])
box("d_illV", "d_ill", "steel2", [.08, 1.4, .06], [DX, 15.3, 2.36], at=[[-2.4 + .6 * i, 0, 0] for i in range(9)])
cyl("d_cond", "d_ill", "lens", 3.0, .34, [DX, 13.7, 0])
box("d_win", "d_win", "duvU", [5.6, .06, 5.0], [DX, 13.95, 0])
box("d_led", "d_ill", "led", [.22, .22, .06], [DX + 3.0, 16.0, 2.34])
# 光：上面整片平行光（9 道）；鉻擋住的 4 道停在鉻上（斷開）；穿過開口的 5 道經鏡頭收斂到晶圓（縮小 4 倍）
ZB = 0.0
flowx("d_in", "d_beam", [[DX, 13.5, ZB], [DX, MB + .01, ZB]], shape="liquid", n=4, lanes=9, gap=.6, size=.16, rate=.9, color="duv", rim="duvR", band=.09, bandO=.75)
for i, x in enumerate(O):
    flowx(f"d_out{i}", "d_beam", [[DX + x, MB - CRT - .02, ZB], [DX + x, 8.75, ZB], [DX + x / 4, 1.69, ZB]], shape="liquid", n=4, size=.15, rate=.9, color="duv", rim="duvR", band=.08, bandO=.8)
glow("d_imgOn", "d_img", ["d_img"], "expo", steady=False, g=.8, freq=1.6)
glow("d_crOn", "d_cr", [p["id"] for p in parts if p["layer"] == "d_cr"], "#9AA3B5", steady=False, g=.5, freq=1.4)
glow("d_qzOn", "d_mask", ["d_quartz"], "#9CC8FF", steady=False, g=.4, freq=1.2)
glow("d_lnOn", "d_lensG", lp("d_lensG"), "#9CC8FF", steady=False, g=.4, freq=1.2)
air("d_airB", "d_beam", [DX - 3.0, 1.6, -.4], [DX + 3.0, 13.6, .4])
anchor("d_maskA", "d_mask", [DX + 3.6, MY + .2, 3.4], dx=170, dy=-60)
anchor("d_qzA", "d_mask", [DX - 3.0, MY + .2, 3.4], dx=-170, dy=-70)
anchor("d_crA", "d_cr", [DX + 3.0, MB - .05, 3.0], dx=170, dy=70)
anchor("d_passA", "d_beam", [DX - 1.2, MB - .8, 0], dx=-170, dy=70)
anchor("d_blockA", "d_cr", [DX + .6, MB, 3.0], dx=170, dy=-80)
anchor("d_lensA", "d_lensG", [DX + 2.0, 6.35, .6], dx=170, dy=-40)
anchor("d_wafA", "d_wf", [DX + 2.6, 1.6, 1.4], dx=170, dy=40)
anchor("d_imgA", "d_img", [DX + .6, 1.68, .6], dx=-170, dy=50)
anchor("d_lightA", "d_ill", [DX - 3.0, 13.9, 1.6], dx=-160, dy=-40)

# ═════════ G：玻璃測試（DUV 穿過、EUV 被吃掉）x=40 ═════════
GX = 40.0
G1, G2 = GX - 3.2, GX + 3.2
box("g_tab", "g_tab", "cab2", [12, .3, 4.6], [GX, 2.3, 0], bevel=.04)
box("g_leg", "g_tab", "steel2", [.3, 2.15, .3], [GX, 1.08, 0], at=[[sx * 5.6, 0, sz * 2.0] for sx in (-1, 1) for sz in (-1, 1)])
for gx in (G1, G2):
    box(f"g_det{int(gx)}", "g_tab", "screen", [2.6, .08, 2.6], [gx, 2.5, 0])
    box(f"g_post{int(gx)}", "g_tab", "steel", [.25, 2.6, .25], [gx, 3.75, 0], at=[[-1.55, 0, -1.1], [1.55, 0, -1.1]])
    box(f"g_blk{int(gx)}", "g_glass", "quartz", [3.0, 1.6, 2.6], [gx, 5.6, 0], bevel=.04)
    box(f"g_src{int(gx)}", "g_src", "cabD", [1.8, 1.4, 1.6], [gx, 11.0, 0], bevel=.06)
    cyl(f"g_noz{int(gx)}", "g_src", "steel", .35, .5, [gx, 10.1, 0])
    box(f"g_hang{int(gx)}", "g_src", "steel2", [.25, 3.5, .25], [gx, 13.4, 0])
box("g_spotD", "g_spot", "duvU", [.5, .02, .5], [G1, 2.56, 0])
cyl("g_spotE", "g_spotE", "euvU", .3, .03, [G2, 6.42, 0])
flowx("g_duv", "g_beam", [[G1, 9.85, 0], [G1, 2.58, 0]], shape="liquid", n=5, size=.18, rate=.9, color="duv", rim="duvR", band=.1, bandO=.8)
flowx("g_euv", "g_beam", [[G2, 9.85, 0], [G2, 6.42, 0]], shape="liquid", n=4, size=.18, rate=.9, color="euv", rim="euvR", band=.1, bandO=.8)
glow("g_spotDOn", "g_spot", ["g_spotD"], "duv", steady=False, g=.9, freq=2.0, halo=.4)
glow("g_spotEOn", "g_spotE", ["g_spotE"], "euv", steady=False, g=1.0, freq=2.4, halo=.6)
glow("g_blkHot", "g_glass", [f"g_blk{int(G2)}"], "hot", steady=True, g=.35)
air("g_airB", "g_beam", [GX - 4, 2.4, -.4], [GX + 4, 10, .4])
anchor("g_duvA", "g_glass", [G1 - 1.4, 6.2, 1.3], dx=-150, dy=-80)
anchor("g_euvA", "g_spotE", [G2 + .2, 6.42, .3], dx=160, dy=-90)
anchor("g_passA", "g_spot", [G1 - .3, 2.56, 1.0], dx=-150, dy=70)

# ═════════ E：EUV 反射式光罩剖面 x=70（靜電吸盤、背面導電層、低熱膨脹玻璃、鉬／矽 40 對、保護層、吸收層） ═════════
EX = 70.0
W_E, D_E = 10.0, 4.0
Y0 = 5.25; PAIR = .06; NP = 40; YML = Y0 + PAIR * NP; YCAP = YML + .05
A_X = [-3.0, -1.0, 1.4, 3.2]; A_W, A_H = .8, .6; YA = YCAP + A_H
box("e_chuck", "e_chuck", "cabD", [W_E + 1.2, 1.0, D_E + .8], [EX, 3.5, 0], bevel=.05)
box("e_chuckE", "e_chuck", "steelHi", [W_E + .4, .06, D_E], [EX, 4.02, 0])
box("e_ped", "e_chuck", "steel2", [3, 3, 2.5], [EX, 1.5, 0], bevel=.05)
box("e_crn", "e_sub", "crn", [W_E, .05, D_E], [EX, 4.075, 0])
box("e_ule", "e_sub", "ule", [W_E, 1.15, D_E], [EX, 4.675, 0])
box("e_mo", "e_ml", "mo", [W_E, .026, D_E], [EX, 0, 0], at=[[0, Y0 + k * PAIR + .013, 0] for k in range(NP)])
box("e_si", "e_ml", "si", [W_E, .034, D_E], [EX, 0, 0], at=[[0, Y0 + k * PAIR + .026 + .017, 0] for k in range(NP)])
box("e_ru", "e_cap", "ru", [W_E, .05, D_E], [EX, YML + .025, 0])
for k, ax in enumerate(A_X):
    box(f"e_abs{k}", "e_abs", "absb", [A_W, A_H, D_E], [EX + ax, YCAP + A_H / 2, 0], bevel=.02)
# 入射光（左上斜照，示意角度放大）；打在吸收層上的停住，打在多層膜上的彈回右上
L_X = [-4.0, -3.0, -2.0, -1.0, 0.0, 1.4, 2.2, 3.2]
HIT = [x for x in L_X if any(abs(x - a) < A_W / 2 for a in A_X)]
DXI, YT = 2.6, 12.6
ZE = .6
for i, x in enumerate(L_X):
    if x in HIT:
        t = (YT - YA) / (YT - YCAP); xh = x - DXI + DXI * t
        flowx(f"e_in{i}", "e_beam", [[EX + x - DXI, YT, ZE], [EX + xh, YA + .01, ZE]], shape="liquid", n=3, size=.16, rate=.9, color="euv", rim="euvR", band=.075, bandO=.8)
    else:
        flowx(f"e_in{i}", "e_beam", [[EX + x - DXI, YT, ZE], [EX + x, YCAP + .01, ZE], [EX + x + DXI, YT, ZE]], shape="liquid", n=5, size=.16, rate=.9, color="euv", rim="euvR", band=.075, bandO=.8)
glow("e_mlOn", "e_ml", ["e_mo", "e_si"], "#B9A6FF", steady=False, g=.55, freq=1.5)
glow("e_absOn", "e_abs", lp("e_abs"), "hot", steady=False, g=.6, freq=1.8)
box("e_src", "e_src", "cabD", [2.2, 1.4, 1.8], [EX - 6.6, YT + .6, ZE], rot=[0, 0, -28], bevel=.06)
box("e_out", "e_src", "cab2", [2.2, 1.4, 1.8], [EX + 6.6, YT + .6, ZE], rot=[0, 0, 28], bevel=.06)
box("e_outS", "e_src", "screen", [1.8, .06, 1.4], [EX + 6.22, YT - .05, ZE], rot=[0, 0, 28])
air("e_airB", "e_beam", [EX - 6.6, YCAP, ZE - .3], [EX + 6.6, YT, ZE + .3])
anchor("e_mlA", "e_ml", [EX + 4.6, Y0 + 1.2, 2.0], dx=170, dy=80)
anchor("e_uleA", "e_sub", [EX - 4.4, 4.6, 2.0], dx=-170, dy=70)
anchor("e_absA", "e_abs", [EX - 1.0, YA, 2.0], dx=-150, dy=-110)
anchor("e_reflA", "e_beam", [EX + 2.0, 9.0, ZE], dx=170, dy=-60)
anchor("e_capA", "e_cap", [EX + 4.4, YCAP, 2.0], dx=170, dy=-40)

# ═════════ H：整片光罩（6 吋見方石英板、圖案區、對位記號、條碼、護膜框＋薄膜、灰塵）x=100 ═════════
HX = 100.0; HY = 3.0
box("h_tab", "h_tab", "cab2", [13, .35, 11], [HX, HY - .6, 0], bevel=.05)
box("h_leg", "h_tab", "steel2", [.35, HY - .8, .35], [HX, (HY - .8) / 2, 0], at=[[sx * 6.0, 0, sz * 5.0] for sx in (-1, 1) for sz in (-1, 1)])
box("h_pin", "h_tab", "steelHi", [.5, .32, .5], [HX, HY - .27, 0], at=[[sx * 3.6, 0, sz * 3.6] for sx in (-1, 1) for sz in (-1, 1)])
box("h_qz", "h_mask", "quartz", [8, .5, 8], [HX, HY + .14, 0], bevel=.04)
box("h_pat", "h_mask", "pattern", [5.6, .03, 5.6], [HX, HY + .405, 0])
box("h_patE", "h_mask", "chrome", [8, .02, 8], [HX, HY + .395, 0])
box("h_patW", "h_mask", "quartz", [5.8, .025, 5.8], [HX, HY + .4, 0])
cross("h_mk", "h_mask", "chromeHi", HX, [[sx * 3.4, 0, sz * 3.4] for sx in (-1, 1) for sz in (-1, 1)], y=HY + .42)
box("h_bc", "h_mask", "bar", [.08, .02, .5], [HX, HY + .42, 0], at=[[-1.5 + .14 * i + (.05 if i % 3 == 0 else 0), 0, 3.6] for i in range(20)])
frame4("h_pf", "h_pel", "steel", HX, HY + .66, 0, 6.5, 6.5, .5, .2)
box("h_mem", "h_mem", "film", [6.3, .012, 6.3], [HX, HY + .915, 0])
glow("h_memOn", "h_mem", ["h_mem"], "#FFFFFF", steady=False, g=.45, freq=1.1)
glow("h_patOn", "h_mask", ["h_pat"], "#7FB7FF", steady=False, g=.5, freq=1.4)
DUST = [[-1.6, 0, -.8], [1.2, 0, 1.4], [.3, 0, -1.9], [2.0, 0, -.4], [-.6, 0, 1.0], [-2.2, 0, 1.9]]
sph("h_dust", "h_dust", "dust", .11, [HX, HY + .99, 0], at=DUST, scale=[1, .7, 1])
sph("h_dust2", "h_dust2", "dust", .08, [HX, HY + .97, 0], at=[[-1.0, 0, -2.4], [2.4, 0, 1.8], [.9, 0, .1]])
glow("h_dustOn", "h_dust", ["h_dust"], "bad", steady=False, g=.8, freq=2.0, halo=.3)
anchor("h_maskA", "h_mask", [HX + 3.9, HY + .4, 3.6], dx=170, dy=60)
anchor("h_patA", "h_mask", [HX - 2.0, HY + .41, 2.2], dx=-170, dy=70)
anchor("h_pelA", "h_pel", [HX + 3.2, HY + .9, -3.2], dx=170, dy=-80)
anchor("h_memA", "h_mem", [HX - 2.4, HY + .92, -2.4], dx=-170, dy=-80)
anchor("h_dustA", "h_dust", [HX + 1.2, HY + 1.0, 1.4], dx=170, dy=-50)

# ═════════ L：一整套光罩（三疊各 20 片，共 60 片）＋檢查中的一片（掃描光帶）x=130 ═════════
LX = 130.0
box("l_tab", "l_tab", "cab2", [20, .35, 8], [LX, 2.0, -1.0], bevel=.05)
box("l_leg", "l_tab", "steel2", [.35, 1.85, .35], [LX, .92, -1.0], at=[[sx * 9.4, 0, sz * 3.6] for sx in (-1, 1) for sz in (-1, 1)])
NL = 20
for g, sx in enumerate((-6.2, 0.0, 6.2)):
    lay = f"l_st{g}"
    box(f"l_q{g}", lay, "quartz", [4.0, .12, 4.0], [LX + sx, 0, -1.6], at=[[0, 2.25 + k * .2, 0] for k in range(NL)])
    box(f"l_p{g}", lay, "pattern", [3.0, .02, 3.0], [LX + sx, 0, -1.6], at=[[0, 2.32 + k * .2, 0] for k in range(NL)])
    box(f"l_s{g}", lay, "steel", [.12, .2, 4.0], [LX + sx, 0, -1.6], at=[[sd * 2.1, 2.25 + k * .2, 0] for k in range(NL) for sd in (-1, 1)])
box("l_one", "l_one", "quartz", [4.6, .14, 4.6], [LX, 2.6, 2.4])
box("l_oneP", "l_one", "pattern", [3.6, .02, 3.6], [LX, 2.68, 2.4])
box("l_def", "l_def", "absb", [.16, .03, .16], [LX + .9, 2.7, 2.0])
glow("l_defOn", "l_def", ["l_def"], "bad", steady=False, g=1.0, freq=2.4, halo=.5)
box("l_scan", "l_scan", "scan", [.16, .03, 3.8], [LX - 1.9, 2.72, 2.4])
box("l_gan", "l_one", "steel2", [.3, 1.6, .3], [LX, 3.4, 2.4], at=[[-2.6, 0, -2.3], [2.6, 0, -2.3]])
box("l_ganT", "l_one", "steel", [5.5, .3, .4], [LX, 4.2, .1])
glow("l_stOn", "l_st0", lp("l_st0"), "#9CC8FF", steady=False, g=.35, freq=1.2)
anchor("l_setA", "l_st2", [LX + 6.2, 6.25, -.2], dx=150, dy=-80)
anchor("l_oneA", "l_one", [LX - 2.0, 2.68, 4.4], dx=-170, dy=50)
anchor("l_defA", "l_def", [LX + .9, 2.72, 2.0], dx=170, dy=40)

# ═════════ B：空白光罩（還沒畫圖）：兩疊 EUV 空白光罩＋前面一片分層拆開 x=160 ═════════
BX = 160.0
box("b_tab", "b_tab", "cab2", [16, .35, 8], [BX, 2.0, -.6], bevel=.05)
box("b_leg", "b_tab", "steel2", [.35, 1.85, .35], [BX, .92, -.6], at=[[sx * 7.4, 0, sz * 3.6] for sx in (-1, 1) for sz in (-1, 1)])
def blank_stack(pid, cx, n=12):
    box(pid + "g", pid, "ule", [3.6, .14, 3.6], [cx, 0, -2.2], at=[[0, 2.27 + k * .2, 0] for k in range(n)])
    box(pid + "m", pid, "mo", [3.6, .03, 3.6], [cx, 0, -2.2], at=[[0, 2.355 + k * .2, 0] for k in range(n)])
    box(pid + "a", pid, "absb", [3.6, .02, 3.6], [cx, 0, -2.2], at=[[0, 2.38 + k * .2, 0] for k in range(n)])
blank_stack("b_s1", BX - 4.4); blank_stack("b_s2", BX + 4.4)
# 前面一片拆開（由下到上）：背面導電層、低熱膨脹玻璃、鉬／矽多層膜（示意 10 對）、保護層、整片吸收層（還沒畫圖）
FZ = 1.6
box("b_e0", "b_e0", "crn", [4.4, .05, 3.4], [BX, 2.22, FZ])
box("b_e1", "b_e1", "ule", [4.4, .4, 3.4], [BX, 2.47, FZ])
box("b_e2m", "b_e2", "mo", [4.4, .03, 3.4], [BX, 0, FZ], at=[[0, 2.7 + k * .07, 0] for k in range(10)])
box("b_e2s", "b_e2", "si", [4.4, .04, 3.4], [BX, 0, FZ], at=[[0, 2.735 + k * .07, 0] for k in range(10)])
box("b_e3", "b_e3", "ru", [4.4, .04, 3.4], [BX, 3.4, FZ])
box("b_e4", "b_e4", "absb", [4.4, .12, 3.4], [BX, 3.48, FZ])
glow("b_e2On", "b_e2", ["b_e2m", "b_e2s"], "#B9A6FF", steady=False, g=.45, freq=1.3)
glow("b_s1On", "b_s1", lp("b_s1"), "#FFD08A", steady=False, g=.35, freq=1.2)
glow("b_s2On", "b_s2", lp("b_s2"), "#FFD08A", steady=False, g=.35, freq=1.2)
anchor("b_blankA", "b_e4", [BX + 2.2, 3.54, FZ + 1.7], dx=160, dy=-60)
anchor("b_mlA", "b_e2", [BX - 2.2, 3.0, FZ + 1.7], dx=-160, dy=60)
anchor("b_s1A", "b_s1", [BX - 4.4, 4.7, -2.2], dx=-140, dy=-100)
anchor("b_s2A", "b_s2", [BX + 4.4, 4.7, -2.2], dx=140, dy=-100)

# 主素材框（看不見；給 layout-check 判斷「卡片／標籤有沒有蓋到主體中央」）：每段只亮鏡頭對準的那一個，其他層全部標 bg
materials["m_proxy"] = {"kind": "unlit", "color": "#FFFFFF", "opacity": 0}
PXB = {"px_d": (DX - 5.0, DX + 5.0, 1.0, 16.4, -3.0, 3.0), "px_dm": (DX - 4.2, DX + 4.2, MB - .9, MY + .45, -3.6, 3.6),
       "px_g": (G1 - 1.6, G2 + 1.6, 2.4, 11.8, -1.3, 1.3), "px_e": (EX - 5.0, EX + 5.0, 3.0, YT, -2.0, 2.0),
       "px_h": (HX - 4.0, HX + 4.0, HY - .2, HY + 1.0, -4.0, 4.0), "px_l": (LX - 8.2, LX + 8.2, 2.2, 6.3, -3.6, 4.7),
       "px_b": (BX - 6.2, BX + 6.2, 2.2, 5.1, -4.0, 3.3)}
for lid, (x0, x1, y0, y1, z0, z1) in PXB.items():
    box(lid, lid, "proxy", [x1 - x0, y1 - y0, z1 - z0], [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2])
for l in layers:
    if not l["id"].startswith("px_"): l["bg"] = True
model = {
 "name": "tech-mask1：光罩-1。站別：D DUV 穿透式光路 x=0、G 玻璃測試 x=40、E EUV 反射式光罩剖面 x=70、H 整片光罩＋護膜 x=100、L 一整套光罩 x=130、B 空白光罩 x=160（genmodel.py 產生）",
 "unit": "示意，非實際比例", "size": {"w": 14, "h": 2, "r": .1, "t": 6},
 "palette": palette, "materials": materials, "layers": layers, "anchors": anchors, "parts": parts, "actions": actions,
 "pose": {"yaw0": 0, "yawIso": 0, "drift": 0},
 "camera": {"stand": {"d": 60, "elev": 22, "y": 4}},
 "fx": {"dpr": 1, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
}
json.dump(model, open(os.path.join(D, "model.json"), "w"), ensure_ascii=False, indent=1)
print("零件", len(parts), "層", len(layers), "動作", len(actions))

# ═════════════════ 各幕 props（併進 script.json） ═════════════════
subprocess.run([sys.executable, os.path.join(D, "genscript.py")], check=True)
sp = os.path.join(D, "script.json"); script = json.load(open(sp))
HIDE = "s1:start-40"; FAR = "s12:start+400"; EARLY = "s1:start-300"
def run(i, at, until=None, ramp=6, **kw):
    d = {"id": i, "at": at, "ramp": ramp}
    if until: d["until"] = until
    d.update(kw); return d
def lab(part, text, en, color, at, until, xy=None):
    d = {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until}
    if xy: d["xy"] = xy
    return d
def shot(at, x, y, d, elev, dur=24): return {"at": at, "dur": dur, "x": x, "y": y, "d": d, "elev": elev}
def fit(at, lid, elev, dur=24, hmax=370, wmax=700, cy=578, zoom=1.0):
    """依主素材框自動算鏡頭：框投影後高 ≤hmax、寬 ≤wmax，框中心落在畫面 y≈cy（卡片在 y930 以下，標籤放兩側）。
    畫面換算：fov 26°、畫布放大 1.26 → 距離 d 時每單位約 3013/d px；鏡頭看的點投影在 y≈788。"""
    x0, x1, y0, y1, z0, z1 = PXB[lid]; e = math.radians(elev)
    he = (y1 - y0) * math.cos(e) + (z1 - z0) * math.sin(e); w = (x1 - x0)
    d = max(he * 3013 / hmax, w * 3013 / wmax) / zoom
    yc = (y0 + y1) / 2 - ((788 - cy) * d / 3013) / math.cos(e)
    return shot(at, R((x0 + x1) / 2), R(yc), R(d), elev, dur)
def hid(lay, a, b, dur=6): return {"layer": lay, "at": a, "until": b, "opacity": 0, "dur": dur}
def mv(lay, at, until, dur=14, dx=0, dy=0, dz=0, **kw):
    d = {"layer": lay, "at": at, "until": until, "dur": dur, "dx": dx, "dy": dy, "dz": dz}; d.update(kw); return d
def fall(lay, at, until, dy=3.0, bounce=.05):
    return {"layer": lay, "at": at, "until": until, "dy": dy, "opacity": 0, "dur": 16, "fallIn": True, "bounce": bounce}
def sec(kind, at, until, title, tag, t, y=930, h=330, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag, "t": {k: {"at": v} for k, v in t.items()}}
    d.update(kw); return d

VIS = [
 # D：曝光出來的線條在念「投影到晶圓上」才出現（s1 開場時已經印好一次，s2 起先藏起來）
 hid("d_img", "s2:start+10", "s4:wafer", 10),
 # H：灰塵 s8 念「灰塵落在膜上」才掉下來
 fall("h_dust", HIDE, "s8:dust"), fall("h_dust2", HIDE, "s8:dust+12"),
 # L：三疊光罩依序出現（念「幾十片」）；有缺陷的點念「不能有缺陷」才閃；掃描光帶從左掃到右
 hid("l_st1", HIDE, "s9:many+10", 10), hid("l_st2", HIDE, "s9:many+22", 10),
 hid("l_def", HIDE, "s9:def", 6), hid("l_scan", HIDE, "s9:def-24", 6), mv("l_scan", "s9:def-24", FAR, dur=70, dx=3.8),
 # B：前面那片空白光罩念「還沒畫圖的白紙」一層層拆開
 mv("b_e1", "s10:paper", FAR, dur=22, dy=.35), mv("b_e2", "s10:paper", FAR, dur=22, dy=.75), mv("b_e3", "s10:paper", FAR, dur=22, dy=1.15), mv("b_e4", "s10:paper", FAR, dur=22, dy=1.55),
]
PXW = {"px_d": [(EARLY, "s2:start-4"), ("s4:start+30", "s5:start-4")], "px_dm": [("s2:start+30", "s4:start-4")], "px_g": [("s5:start+30", "s6:start-4")],
       "px_e": [("s6:start+30", "s8:start-4")], "px_h": [("s8:start+30", "s9:start-4"), ("s11:start+30", FAR)], "px_l": [("s9:start+30", "s10:start-4")],
       "px_b": [("s10:start+30", "s11:start-4")]}
for lid, wins in PXW.items():
    prev = "s1:start-400"
    for a_, b_ in wins:
        VIS.append({"layer": lid, "at": prev, "until": a_, "opacity": 0, "dur": 1}); prev = b_
    VIS.append({"layer": lid, "at": prev, "until": "s12:start+500", "opacity": 0, "dur": 1})
DOUT = [f"d_out{i}" for i in range(len(O))]
DUVRUN = lambda a, b: [run("d_in", a, b, 8)] + [run(x, a, b, 8) for x in DOUT]
EIN = [f"e_in{i}" for i in range(len(L_X))]
P = {}
P["s1"] = {"zoom": [{"to": "tool", "at": "start-30", "dur": 1}],
 "shot": [fit("start-30", "px_d", 10, 1, hmax=400, cy=705), fit("film", "px_d", 12, 60, hmax=400, cy=705)],
 "shift": VIS,
 "run": DUVRUN("start-30", "s2:start+20") + [run("d_imgOn", "start-30", "s2:start", 6), run("d_crOn", "mask", "s2:start", 6)],
 "labels": [lab("d_lightA", "光", "Light", "blue", "light", "s2:start-4"), lab("d_maskA", "光罩", "Photomask", "amber", "mask", "s2:start-4"),
            lab("d_wafA", "晶圓", "Wafer", "blue", "film", "s2:start-4")],
 "overlay": [sec("mk1-hook", "chip", "s2:start-2", "代工的供應商：光罩", "示意，非實際比例", {"chip": "chip", "light": "light", "film": "film", "mask": "mask"})]}
P["s2"] = {"zoom": [{"to": "cut", "at": "start-4", "dur": 30}],
 "shot": [fit("start-4", "px_dm", 14, 30)],
 "run": [run("d_qzOn", "quartz", "cr", 6), run("d_crOn", "cr", "s3:start", 6)],
 "labels": [lab("d_qzA", "石英玻璃", "Quartz", "blue", "quartz", "s3:start-4"), lab("d_crA", "鉻（刻出電路）", "Chrome pattern", "amber", "cr", "s3:start-4")],
 "overlay": [sec("mk1-cr", "start+6", "s3:start-2", "傳統光罩：石英＋鉻", "USPTO 7767365", {"quartz": "quartz", "cr": "cr", "pat": "pat"})]}
P["s3"] = {"zoom": [{"to": "cut", "at": "start-4", "dur": 1}],
 "shot": [fit("start-4", "px_dm", 12, 30)],
 "run": [run("d_in", "duv", "s4:start+40", 8)] + [run(x, "pass", "s4:start+40", 8) for x in DOUT],
 "labels": [lab("d_blockA", "鉻擋住：光斷開", "Blocked", "coral", "block", "s4:start-4"), lab("d_passA", "玻璃透光", "Passes", "blue", "pass", "s4:start-4")],
 "overlay": [sec("mk1-duv", "start+6", "s4:start-2", "鉻擋光、玻璃透光", "示意，非實際比例", {"duv": "duv", "block": "block", "pass": "pass", "carry": "carry"})]}
P["s4"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [fit("start-4", "px_d", 10, 34)],
 "run": DUVRUN("start", "s5:start") + [run("d_lnOn", "lens", "s5:start", 6), run("d_imgOn", "wafer", "s5:start", 6)],
 "labels": [lab("d_lensA", "縮小鏡頭", "Reduction lens", "blue", "lens", "s5:start-4"), lab("d_imgA", "縮小 4 倍的圖案", "Pattern ÷4", "amber", "wafer", "s5:start-4"),
            lab("d_maskA", "光罩：圖案大 4 倍", "Mask: 4× larger", "amber", "x4", "s5:start-4")],
 "overlay": [sec("mk1-x4", "start+6", "s5:start-2", "縮小 4 倍投影", "ASML 光罩設計手冊", {"lens": "lens", "x4": "x4", "wafer": "wafer"})]}
P["s5"] = {"zoom": [{"to": "cut", "at": "start-4", "dur": 30}],
 "shot": [fit("start-4", "px_g", 10, 30)],
 "run": [run("g_duv", "start", "s6:start", 8), run("g_spotDOn", "start+10", "s6:start", 6), run("g_euv", "euv", "s6:start", 8), run("g_spotEOn", "eat", "s6:start", 6), run("g_blkHot", "eat", "s6:start", 10)],
 "labels": [lab("g_duvA", "深紫外光：穿過", "DUV passes", "blue", "start+6", "s6:start-4"), lab("g_euvA", "極紫外光：被吃掉", "EUV absorbed", "coral", "eat", "s6:start-4")],
 "overlay": [sec("mk1-euv", "start+6", "s6:start-2", "玻璃擋住極紫外光", "Wikipedia EUV lithography", {"euv": "euv", "eat": "eat", "no": "no"})]}
P["s6"] = {"zoom": [{"to": "layer", "at": "start-4", "dur": 30}],
 "shot": [fit("start-4", "px_e", 12, 30)],
 "run": [run(x, "refl", "s8:start", 8) for x in EIN] + [run("e_mlOn", "mo", "s7:start", 6)],
 "labels": [lab("e_uleA", "低熱膨脹玻璃", "Low-expansion glass", "amber", "refl", "s7:start-4"), lab("e_mlA", "鉬／矽 約 40 對", "Mo/Si ×40 pairs", "blue", "mo", "s7:start-4"),
            lab("e_reflA", "反射回去", "Reflected", "blue", "mirror", "s7:start-4")],
 "overlay": [sec("mk1-ml", "start+6", "s7:start-2", "反射式光罩：多層膜", "USPTO 11846881", {"refl": "refl", "mo": "mo", "n40": "n40", "mirror": "mirror"})]}
P["s7"] = {"zoom": [{"to": "cut", "at": "start-4", "dur": 30}],
 "shot": [fit("start-4", "px_e", 16, 30, zoom=1.1)],
 "run": [run("e_absOn", "abs", "s8:start", 6)],
 "labels": [lab("e_absA", "吸收層：不反光", "Absorber", "coral", "abs", "s8:start-4"), lab("e_reflA", "帶著圖案的反射光", "Patterned light", "blue", "pattern", "s8:start-4")],
 "overlay": [sec("mk1-abs", "start+6", "s8:start-2", "吸收層畫出電路", "USPTO 12353120", {"abs": "abs", "dark": "dark", "pattern": "pattern"})]}
P["s8"] = {"zoom": [{"to": "mask", "at": "start-4", "dur": 30}],
 "shot": [fit("start-4", "px_h", 34, 30)],
 "run": [run("h_memOn", "pel", "s9:start", 6), run("h_dustOn", "dust+16", "focus+30", 6), run("h_patOn", "no", "s9:start", 6)],
 "labels": [lab("h_pelA", "護膜框", "Pellicle frame", "blue", "pel", "s9:start-4"), lab("h_memA", "護膜（薄膜）", "Pellicle film", "blue", "pel+8", "s9:start-4"),
            lab("h_dustA", "灰塵在膜上", "Dust on the film", "coral", "dust+16", "s9:start-4")],
 "overlay": [sec("mk1-pel", "start+6", "s9:start-2", "護膜：灰塵對不到焦", "USPTO 11635681", {"pel": "pel", "dust": "dust", "focus": "focus", "no": "no"})]}
P["s9"] = {"zoom": [{"to": "mask", "at": "start-4", "dur": 30}],
 "shot": [fit("start-4", "px_l", 22, 30)],
 "run": [run("l_stOn", "many", "def", 6), run("l_defOn", "def", "s10:start", 6)],
 "labels": [lab("l_setA", "一整套：幾十片", "A full mask set", "blue", "many", "s10:start-4"), lab("l_defA", "一個缺陷就不能用", "One defect = reject", "coral", "def", "s10:start-4")],
 "overlay": [sec("mk1-cost", "start+6", "s10:start-2", "幾十片、上千萬", "IC Knowledge；IBS；SemiAnalysis", {"many": "many", "def": "def", "cost": "cost"})]}
P["s10"] = {"zoom": [{"to": "mask", "at": "start-4", "dur": 30}],
 "shot": [fit("start-4", "px_b", 22, 30)],
 "run": [run("b_e2On", "paper", "s11:start", 6), run("b_s1On", "hoya", "s11:start", 6), run("b_s2On", "agc", "s11:start", 6)],
 "labels": [lab("b_blankA", "空白光罩（還沒畫圖）", "Mask blank", "amber", "blank", "s11:start-4"), lab("b_s1A", "豪雅 HOYA", "Japan", "blue", "hoya", "s11:start-4"),
            lab("b_s2A", "旭硝子 AGC", "Japan", "blue", "agc", "s11:start-4")],
 "overlay": [sec("mk1-co", "start+6", "s11:start-2", "上游：空白光罩誰做", "QYResearch；Morningstar", {"blank": "blank", "paper": "paper", "euv": "euv", "jp": "jp", "hoya": "hoya", "agc": "agc"})]}
P["s11"] = {"zoom": [{"to": "mask", "at": "start-4", "dur": 30}],
 "shot": [fit("start-4", "px_h", 30, 34)],
 "run": [run("h_patOn", "who", FAR, 6)],
 "shift": [hid("h_dust", "s11:start-6", FAR, 4), hid("h_dust2", "s11:start-6", FAR, 4)],
 "labels": [lab("h_patA", "誰畫上電路？", "Who draws it?", "amber", "who", "kw-10")],
 "overlay": [sec("mk1-next", "start+6", "kw-10", "白紙有了，接下來呢？", "光罩-2 預告", {"paper": "paper", "who": "who", "ship": "ship", "next": "next", "kw": "kw"})]}
for sc in script["scenes"]:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])
json.dump(script, open(sp, "w"), ensure_ascii=False, indent=1)
print("script props 併入", len(P), "幕")
