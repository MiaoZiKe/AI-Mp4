# tech-clean 產生器：python3 videos/tech-clean/genmodel.py → model.json，並先跑 genscript.py、再把各幕 3D 動作與 2D 卡併進 script.json
# 座標：x 右、y 上、z 朝觀眾；單位約 10 cm（示意，非實際比例）。三站以 x 偏移分開，鏡頭一次只看一站：
#   T x=0   單片清洗機（無塵室；機櫃剖開：旋轉夾頭＋晶圓、防濺杯、線性噴嘴臂三個噴頭、兆音波棒、四種藥液瓶與管路）＋右邊批次濕式清洗槽   s1 s6–s11
#   A x=60  灰化腔（石英管＋射頻線圈＋氧氣管、擋板、加熱夾頭；晶圓上光阻：焦硬外殼＋底下光阻＋殘渣）                          s3–s5
#   X x=120 線路剖面（基板、氧化層、六條線；一顆線寬一半大的顆粒卡在兩條線中間 → 短路）                                      s2
# 所有動作的 at 都寫成「幕id:cue±幀」（cue 來自 timeline.json；改稿重跑 align 後重跑本檔即可）。
import json, math, os, random, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))
R = lambda x: round(x, 3)
rnd = random.Random(20261121)
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
    """兩點之間的圓管（只准沿 x／y／z 軸）"""
    d = [b[i] - a[i] for i in range(3)]; ax = max(range(3), key=lambda i: abs(d[i])); ln = abs(d[ax])
    c = [(a[i] + b[i]) / 2 for i in range(3)]
    return cyl(pid, lay, mat, r, ln, c, axis="xyz"[ax])
def pipe(pid, lay, mat, pts, r):
    for k in range(len(pts) - 1): seg(f"{pid}{k}", lay, mat, pts[k], pts[k + 1], r)
    sph(f"{pid}J", lay, mat, r * 1.15, pts[1], at=[[p[i] - pts[1][i] for i in range(3)] for p in pts[1:-1]])

palette = {"floor": "#E3E9F1", "floorG": "#A8B4C6", "wall": "#DCE4EE", "wall2": "#C9D3E1", "ffu": "#F4F7FB", "ffuG": "#C4CEDC",
 "cab": "#EEF2F7", "cab2": "#D7DEE8", "cabD": "#4A5873", "seam": "#8E9BB0", "steel": "#A9B6CA", "steel2": "#7F8CA3", "steelHi": "#C9D3E2",
 "cup": "#E9EDF2", "cupIn": "#7E8BA3", "chuck": "#5D6A82", "pin": "#D6DCE6", "wafer": "#B4C2DA", "die": "#7FA4E0", "notch": "#2E3340",
 "pvdf": "#F2F2EE", "pfa": "#EFEAE0", "led": "#14C38E", "ledA": "#FF9F1C", "ledR": "#C9372C", "screen": "#2E6FD8",
 "sc1": "#2F7FE0", "sc1R": "#1C5DB0", "sc2": "#F0A030", "sc2R": "#B87410", "diw": "#5CC8F0", "diwR": "#2A9FD8", "ipa": "#9B7BE0", "ipaR": "#6E4FC0",
 "spm": "#C9A227", "dirt": "#5B4A3A", "dirtR": "#2E241A", "mega": "#14A38B", "megaR": "#0E7A68",
 "quartz": "#D6E6F8", "cu": "#D9873A", "cuD": "#8F4E16", "plasma": "#B07CFF", "oRad": "#FF5A5A", "oRadR": "#B02020", "o2": "#5C8FE0", "o2R": "#2F5FB0",
 "co2": "#8A96A8", "co2R": "#58647A", "resist": "#D9822B", "crust": "#4A2A14", "residue": "#7A5230", "heat": "#FF7A2F", "heatR": "#E04A1A",
 "si": "#AFC0DA", "ox": "#E4ECF6", "line": "#C98A3E", "lineHi": "#E8A45E", "bad": "#E0472F", "badR": "#9E2A1A", "ok": "#14A38B", "spark": "#FFE066",
 "tank1": "#4FA3E8", "tank2": "#F0B44A", "tank3": "#7FD3F0", "tank4": "#B79BE8"}
def M(color, **k): return {"kind": "std", "color": color, "rough": .45, "metal": .1, **k}
U = lambda c, o=None: {"kind": "unlit", "color": c, **({"opacity": o} if o is not None else {})}
materials = {
 "floor": M("floor", rough=.55, metal=0), "floorG": U("floorG"), "wall": M("wall", rough=.7, metal=0), "wall2": M("wall2", rough=.7, metal=0),
 "ffu": U("ffu"), "ffuG": U("ffuG"), "cab": M("cab", rough=.45, metal=.1), "cab2": M("cab2", rough=.5, metal=.1),
 "cabPanel": {"kind": "phys", "color": "#F7F9FC", "rough": .3, "metal": 0, "clearcoat": .5, "env": .5}, "cabD": M("cabD", rough=.5, metal=.3), "seam": U("seam"),
 "steel": M("steel", rough=.28, metal=.88, env=.7, tex="brushed", texScale=2), "steel2": M("steel2", rough=.35, metal=.8, env=.6), "steelHi": M("steelHi", rough=.22, metal=.9, env=.9),
 "cup": {"kind": "phys", "color": "cup", "rough": .25, "metal": 0, "clearcoat": .7, "env": .5}, "cupIn": M("cupIn", rough=.5, metal=.2),
 "chuck": M("chuck", rough=.4, metal=.6), "pin": M("pin", rough=.3, metal=.2), "notch": U("notch"),
 "wafer": {"kind": "phys", "color": "wafer", "rough": .08, "metal": .45, "clearcoat": 1, "env": 1.0},
 "die": M("die", rough=.22, metal=.55, tex="traces", texScale=.35, env=.9),
 "pvdf": M("pvdf", rough=.55, metal=0), "pfa": {"kind": "phys", "color": "pfa", "rough": .3, "metal": 0, "clearcoat": .5, "opacity": .85},
 "led": {"kind": "std", "color": "led", "emissive": "led", "ei": .9}, "ledA": {"kind": "std", "color": "ledA", "emissive": "ledA", "ei": .6}, "ledR": {"kind": "std", "color": "ledR", "emissive": "ledR", "ei": .3},
 "screen": {"kind": "screen", "color": "screen", "ei": .7}, "screenUI": U("#BFD8FF"),
 "sc1": M("sc1", rough=.3, metal=.1), "sc2": M("sc2", rough=.3, metal=.1), "diw": M("diw", rough=.3, metal=.1), "ipa": M("ipa", rough=.3, metal=.1),
 "bottle1": {"kind": "phys", "color": "sc1", "rough": .2, "metal": 0, "clearcoat": .8, "opacity": .8}, "bottle2": {"kind": "phys", "color": "sc2", "rough": .2, "metal": 0, "clearcoat": .8, "opacity": .8},
 "bottle3": {"kind": "phys", "color": "diw", "rough": .2, "metal": 0, "clearcoat": .8, "opacity": .8}, "bottle4": {"kind": "phys", "color": "ipa", "rough": .2, "metal": 0, "clearcoat": .8, "opacity": .8},
 "film1": U("sc1", .42), "film2": U("sc2", .45), "film3": U("diw", .42), "film4": U("ipa", .5),
 "dirt": M("dirt", rough=.8, metal=0), "mega": M("mega", rough=.3, metal=.5, env=.6), "megaFace": U("mega"),
 "air": U("#FFFFFF", .0), "quartz": {"kind": "phys", "color": "quartz", "rough": .08, "metal": 0, "clearcoat": 1, "opacity": .22, "env": .6},
 "cu": M("cu", rough=.3, metal=.92, env=.8, tex="brushed", texScale=.8), "plasma": U("plasma", .3), "resist": M("resist", rough=.5, metal=0), "crust": M("crust", rough=.8, metal=0),
 "residue": M("residue", rough=.8, metal=0), "heat": M("chuck", rough=.4, metal=.6), "si": M("si", rough=.45, metal=.25), "siFace": U("#D7E2F2"),
 "ox": M("ox", rough=.3, metal=0), "line": M("line", rough=.3, metal=.85, env=.6), "bad": U("bad"), "spark": U("spark"),
 "tank1": U("tank1"), "tank2": U("tank2"), "tank3": U("tank3"), "tank4": U("tank4"), "hvY": U("#FFC21A"), "tick": U("ledA"),
}
materials = {"m_" + k: v for k, v in materials.items()}
def flowx(key, lay, path, shape="dot", n=4, lanes=1, gap=.2, ldir=(1, 0, 0), size=.1, rate=1.0, color="diw", rim="diwR", trail=0, band=None, bandO=.5, rimO=.6, jitter=0):
    layer(lay)
    d = {"type": "flow", "layer": lay, "path": [[R(v) for v in p] for p in path], "n": n, "lanes": lanes, "laneGap": gap, "laneDir": list(ldir), "size": size, "shape": shape,
         "rate": rate, "color": color, "rim": rim, "rimScale": 1.5, "rimO": rimO, "trail": trail, "trailGap": .03, "trailColor": color, "track": False}
    if band: d["band"] = band; d["bandO"] = bandO
    if jitter: d["jitter"] = jitter
    actions[key] = d
def glow(key, lay, ps, color="heat", steady=True, g=.9, freq=2.2, halo=0):
    layer(lay)
    d = {"type": "pulse", "layer": lay, "parts": ps, "color": color, "glow": g, "halo": halo}
    if steady: d["steady"] = True
    else: d["freq"] = freq
    actions[key] = d

# ═════════ T：單片清洗機 x=0 ═════════
# 無塵室（背景）
box("r_floor", "t_room", "floor", [90, .3, 40], [8, -.15, -2])
box("r_grate", "t_room", "floorG", [.1, .03, 40], [8, .02, -2], at=[[-44 + 2.0 * i, 0, 0] for i in range(45)])
box("r_grate2", "t_room", "floorG", [90, .03, .1], [8, .02, -2], at=[[0, 0, -19 + 2.0 * j] for j in range(20)])
box("r_wall", "t_room", "wall", [90, 18, .4], [8, 9, -16])
box("r_wallS", "t_room", "wall2", [.12, 17.6, .45], [8, 9, -15.9], at=[[-40 + 6 * i, 0, 0] for i in range(14)])
box("r_ffu", "t_room", "ffu", [5.6, .4, 5.6], [8, 18.2, -10], at=[[-36 + 6 * i, 0, k * 6] for i in range(13) for k in (0, 1)])
box("r_ffuG", "t_room", "ffuG", [5.4, .05, .06], [8, 17.98, -10], at=[[-36 + 6 * i, 0, k * 6 - 2.4 + .6 * j] for i in range(13) for k in (0, 1) for j in range(9)])
# 遠處機台輪廓
box("r_far", "t_room", "cab2", [9, 9, 6], [-22, 4.5, -9], at=[[0, 0, 0], [-11, 0, 0]], bevel=.1)
box("r_farD", "t_room", "cabD", [4, 1.2, .1], [-22, 6.5, -5.95], at=[[0, 0, 0], [-11, 0, 0]])
# 機櫃（前面剖開）：底座、背板、側板、頂板＋過濾器、前框
CW, CD0, CD1, CH = 9.0, -5.4, 3.6, 11.0     # 機櫃半寬、後緣 z、前緣 z、高
DECK = 2.0
box("c_base", "c_body", "cab", [2 * CW, DECK, CD1 - CD0], [0, DECK / 2, (CD0 + CD1) / 2], bevel=.06)
box("c_baseP", "c_body", "cabPanel", [3.4, 1.4, .08], [0, 1.0, CD1 + .04], at=[[-7 + 3.5 * i, 0, 0] for i in range(5)], bevel=.02)
box("c_vent", "c_body", "seam", [2.4, .05, .1], [0, 1.0, CD1 + .09], at=[[-7 + 3.5 * i, -.3 + .15 * j, 0] for i in range(5) for j in range(5)])
sph("c_screw", "c_body", "steelHi", .06, [0, 1.0, CD1 + .1], at=[[-7 + 3.5 * i + sx * 1.55, sy * .58, 0] for i in range(5) for sx in (-1, 1) for sy in (-1, 1)])
box("c_back", "c_body", "cab", [2 * CW, CH - DECK, .3], [0, (DECK + CH) / 2, CD0 + .15], bevel=.04)
box("c_side", "c_body", "cab", [.3, CH - DECK, CD1 - CD0], [0, (DECK + CH) / 2, (CD0 + CD1) / 2], at=[[-CW + .15, 0, 0], [CW - .15, 0, 0]], bevel=.04)
box("c_roof", "c_body", "cab", [2 * CW + .4, .5, CD1 - CD0 + .4], [0, CH + .25, (CD0 + CD1) / 2], bevel=.05)
box("c_ffu", "c_body", "ffu", [2 * CW - 2, .7, CD1 - CD0 - 1.4], [0, CH + .85, (CD0 + CD1) / 2], bevel=.05)
box("c_ffuG", "c_body", "ffuG", [2 * CW - 2.2, .05, .08], [0, CH + 1.22, (CD0 + CD1) / 2], at=[[0, 0, -3.6 + .6 * j] for j in range(13)])
box("c_frame", "c_body", "steelHi", [.32, CH - DECK, .32], [0, (DECK + CH) / 2, CD1 - .1], at=[[-CW + .16, 0, 0], [CW - .16, 0, 0]])
box("c_frameT", "c_body", "steelHi", [2 * CW, .32, .32], [0, CH - .16, CD1 - .1])
box("c_deck", "c_body", "cab2", [2 * CW - .6, .12, CD1 - CD0 - .4], [0, DECK + .06, (CD0 + CD1) / 2])
box("c_hv", "c_body", "hvY", [.9, .9, .05], [CW - 1.4, 1.2, CD1 + .1], rot=[0, 0, 45])
# 狀態燈柱、側面控制螢幕
cyl("c_tw", "c_body", "steel2", .12, 1.4, [CW - .8, CH + 1.3, CD1 - .8])
cyl("c_twG", "c_body", "led", .26, .4, [CW - .8, CH + 2.15, CD1 - .8])
cyl("c_twA", "c_body", "ledA", .26, .4, [CW - .8, CH + 2.6, CD1 - .8])
cyl("c_twR", "c_body", "ledR", .26, .4, [CW - .8, CH + 3.05, CD1 - .8])
box("c_scr", "c_body", "screen", [.12, 2.4, 3.4], [-CW - .2, 7.0, 1.0], bevel=.03)
box("c_scrUI", "c_body", "screenUI", [.05, .12, 2.6], [-CW - .28, 7.0, 1.0], at=[[0, -.8 + .4 * j, 0] for j in range(5)])
# 載入口與晶圓傳送盒（左外側）
box("c_lp", "c_lp", "steel2", [3.0, 4.0, 3.2], [-CW - 2.0, 2.0, 1.2], bevel=.05)
box("c_foup", "c_lp", "pvdf", [2.6, 2.6, 2.6], [-CW - 2.0, 5.3, 1.2], bevel=.12)
box("c_foupD", "c_lp", "cab2", [2.0, 2.0, .08], [-CW - 2.0, 5.3, 2.54])
box("c_foupH", "c_lp", "steelHi", [1.4, .25, .5], [-CW - 2.0, 6.75, 1.2])
# 旋轉模組：馬達、主軸、防濺杯（杯底、杯壁、內唇、排液管）、夾頭、夾持銷、晶圓（晶粒格、缺口）
WY = 3.47; WR = 3.0; WT = WY + .025
cyl("s_motor", "s_mod", "cabD", 1.2, 1.2, [0, DECK + .7, 0])
cyl("s_spindle", "s_mod", "steelHi", .45, 1.0, [0, 2.6, 0])
cyl("s_cupB", "s_mod", "cupIn", 4.3, .2, [0, 2.3, 0])
tube("s_cup", "s_mod", "cup", 4.45, 4.25, 1.55, [0, 3.15, 0])
tube("s_lip", "s_mod", "cup", 4.45, 3.55, .14, [0, 3.95, 0])
tube("s_lipR", "s_mod", "steelHi", 4.47, 4.38, .06, [0, 4.04, 0])
tube("s_cupRib", "s_mod", "cupIn", 4.47, 4.4, .05, [0, 2.7, 0], at=[[0, 0, 0], [0, .45, 0]])
cyl("s_drain", "s_mod", "pfa", .22, 1.0, [0, 1.7, 0], at=[[-3.4, 0, -1.2], [3.4, 0, -1.2]])
cyl("s_exh", "s_mod", "steel2", .35, 2.6, [0, 1.6, -4.2], axis="z")
SPIN = []
SPIN.append(cyl("s_chuck", "s_mod", "chuck", 2.7, .22, [0, 3.2, 0]))
SPIN.append(tube("s_chuckR", "s_mod", "steelHi", 2.72, 2.4, .04, [0, 3.32, 0]))
PIN = [[3.07 * math.cos(2 * math.pi * k / 6), 0, 3.07 * math.sin(2 * math.pi * k / 6)] for k in range(6)]
SPIN.append(cyl("s_pin", "s_mod", "pin", .11, .36, [0, 3.38, 0], at=PIN))
SPIN.append(cyl("s_pinC", "s_mod", "steel2", .15, .08, [0, 3.56, 0], at=PIN))
SPIN.append(box("s_arm", "s_mod", "chuck", [5.6, .1, .3], [0, 3.27, 0], rot=[0, 0, 0], at=[[0, 0, 0]]))
SPIN.append(box("s_arm2", "s_mod", "chuck", [.3, .1, 5.6], [0, 3.27, 0]))
SPIN.append(cyl("s_wf", "s_wf", "wafer", WR, .05, [0, WY, 0]))
DIES = [(i * .52, j * .52) for i in range(-6, 7) for j in range(-6, 7) if math.hypot(abs(i * .52) + .26, abs(j * .52) + .26) < 2.8]
SPIN.append(box("s_die", "s_wf", "die", [.46, .015, .46], [0, WT + .006, 0], at=[[a, 0, b] for a, b in DIES]))
SPIN.append(box("s_notch", "s_wf", "notch", [.3, .02, .14], [0, WT + .01, WR - .1]))
# 髒污顆粒（洗之前；跟著晶圓轉，被沖走時淡掉）
DIRT = [[r * math.cos(a), 0, r * math.sin(a)] for r, a in [(rnd.uniform(.4, 2.7), rnd.uniform(0, 6.283)) for _ in range(26)]]
SPIN.append(sph("s_dirt", "s_dirt", "dirt", .07, [0, WT + .05, 0], at=DIRT))
actions["spin"] = {"type": "rotate", "parts": SPIN, "axis": [0, 1, 0], "pivot": [0, 0, 0], "rps": .9, "rampSpin": True, "layer": "s_mod"}
# 晶圓上的液膜（每種藥液一片，換藥時換顏色）；乾燥用：異丙醇液膜切成 7 圈，從中心往外一圈圈消失
for k, (nm, mt) in enumerate([("f_sc1", "film1"), ("f_sc2", "film2"), ("f_diw", "film3")]):
    cyl(nm, nm, mt, WR - .02, .02, [0, WT + .02 + .004 * k, 0])
RINGS = [(0, .45)] + [(.45 + .4 * i, .85 + .4 * i) for i in range(6)]
RINGS[-1] = (RINGS[-1][0], WR - .02)
for i, (ri, ro) in enumerate(RINGS):
    if ri == 0: cyl(f"f_ipa{i}", f"f_ipa{i}", "film4", ro, .025, [0, WT + .03, 0])
    else: tube(f"f_ipa{i}", f"f_ipa{i}", "film4", ro, ri, .025, [0, WT + .03, 0])
# 噴嘴臂：後方橫樑（線性滑軌＋拖鏈）、右側立柱；滑座（layer s_noz）帶三個噴頭（藥液／超純水／異丙醇）
BY, BZ = 7.4, -2.2
box("n_beam", "n_rail", "steel", [10.4, .55, .6], [3.4, BY, BZ], bevel=.04)
box("n_rail", "n_rail", "steelHi", [10.2, .1, .2], [3.4, BY + .32, BZ + .1])
box("n_post", "n_rail", "steel2", [.6, BY - DECK, .6], [8.3, (BY + DECK) / 2, BZ])
box("n_chain", "n_rail", "cabD", [.36, .22, .4], [0, BY + .55, BZ - .1], at=[[-1.4 + .42 * i, 0, 0] for i in range(24)])
box("n_car", "s_noz", "cab", [1.3, 1.0, 1.0], [0, BY, BZ + .6], bevel=.05)
box("n_carL", "s_noz", "led", [.3, .1, .03], [0, BY + .2, BZ + 1.11])
box("n_armH", "s_noz", "steelHi", [.45, .4, 2.0], [0, BY - .2, -.6])
cyl("n_body", "s_noz", "steel", .28, 2.0, [0, 6.2, 0])
box("n_head", "s_noz", "cab2", [1.1, .5, .55], [0, 5.0, 0], bevel=.05)
TIPX = {"sc": -.32, "diw": 0, "ipa": .32}
for nm, x in TIPX.items():
    cyl(f"n_tip_{nm}", "s_noz", "pfa", .08, .5, [x, 4.55, 0])
tube("n_tipR", "s_noz", "sc1", .12, .085, .06, [TIPX["sc"], 4.72, 0])
tube("n_tipR2", "s_noz", "diw", .12, .085, .06, [TIPX["diw"], 4.72, 0])
tube("n_tipR3", "s_noz", "ipa", .12, .085, .06, [TIPX["ipa"], 4.72, 0])
box("n_spray", "s_noz", "air", [2.0, 1.1, 1.3], [0, 3.95, 0])     # 噴霧所在的空間（看不見；給 flow-check 用）
TIPY = 4.29
def fan(key, x0, color, rim, n=3, size=.085, rate=1.5):
    """扇形水霧：噴嘴口往下展開成一片扇（五條液帶＋水滴）"""
    for j, (dx, dz) in enumerate([(-.55, -.18), (-.28, -.09), (0, 0), (.28, .09), (.55, .18)]):
        flowx(f"{key}{j}", "s_noz", [[x0, TIPY, 0], [x0 + dx * .45, (TIPY + WT) / 2, dz * .45], [x0 + dx, WT + .03, dz]], shape="liquid", n=n, size=size, rate=rate, color=color, rim=rim, band=.035, bandO=.55)
fan("sp_sc1_", TIPX["sc"], "sc1", "sc1R"); fan("sp_sc2_", TIPX["sc"], "sc2", "sc2R"); fan("sp_diw_", TIPX["diw"], "diw", "diwR"); fan("sp_ipa_", TIPX["ipa"], "ipa", "ipaR")
# 晶圓表面：液膜沿螺旋往外流（晶圓逆時針轉，液體被甩得往外並往後拖）；邊緣甩出的水滴打到杯壁再流下
def spiral(a0, r0=.35, r1=WR - .05, turn=.9, n=12, y=WT + .035):
    return [[(r0 + (r1 - r0) * t / n) * math.cos(a0 + turn * t / n), y, (r0 + (r1 - r0) * t / n) * math.sin(a0 + turn * t / n)] for t in range(n + 1)]
for j in range(8):
    flowx(f"sheet{j}", "s_mod", spiral(j * math.pi / 4), shape="liquid", n=3, size=.08, rate=.55, color="diw", rim="diwR", band=.03, bandO=.35)
def edge_path(a):
    c, s = math.cos(a), math.sin(a); t = (-s, c)
    p = lambda r, y, tw: [r * c + tw * t[0], y, r * s + tw * t[1]]
    return [p(WR - .02, WT + .04, 0), p(3.6, 3.78, .45), p(4.15, 3.55, .8), p(4.12, 2.55, .85)]
for j in range(10):
    flowx(f"fling{j}", "s_mod", edge_path(j * 2 * math.pi / 10 + .3), shape="liquid", n=2, size=.11, rate=.9, color="diw", rim="diwR", band=.01, bandO=0)
# 顆粒被沖走：沿螺旋到邊緣、甩出去
for j in range(6):
    a = j * 2 * math.pi / 6 + .7
    flowx(f"grit{j}", "s_mod", spiral(a, r0=.8, n=10)[:-1] + edge_path(a + .9)[:3], shape="grit", n=2, size=.09, rate=.42, color="dirt", rim="dirtR")
# 兆音波棒（layer s_mega）：從左邊的臂伸到晶圓上方，平的換能器面貼近液膜；聲波一圈圈往下打進液膜
MY = WT + .32
box("m_bar", "s_mega", "mega", [2.9, .3, .6], [-1.55, MY + .15, 0], bevel=.04)
box("m_face", "s_mega", "megaFace", [2.8, .03, .5], [-1.55, MY - .01, 0])
box("m_fin", "s_mega", "steelHi", [.06, .2, .55], [-1.55, MY + .4, 0], at=[[-1.2 + .3 * i, 0, 0] for i in range(9)])
box("m_armV", "s_mega", "steel2", [.35, 2.9, .35], [-2.9, MY + 1.75, 0])
box("m_armH", "s_mega", "steel2", [3.6, .35, .35], [-4.6, MY + 3.05, 0])
cyl("m_cable", "s_mega", "cabD", .1, 2.6, [-3.0, MY + 1.5, .3])
box("m_post", "m_post", "steel2", [.6, MY + 3.2 - DECK, .6], [-6.3, (MY + 3.2 + DECK) / 2, 0])
box("m_space", "s_mega", "air", [3.2, .5, .9], [-1.55, (WT + MY) / 2, 0])
for j, x in enumerate([-2.6, -1.55, -.5]):
    actions[f"mwave{j}"] = {"type": "wave", "layer": "s_mega", "from": [R(x), R(MY - .03), 0], "dir": [0, -1, 0], "reach": .26, "count": 3, "r0": .12, "spread": 2.2, "rate": 1.3, "phase": j / 3, "width": .2, "color": "mega"}
for j in range(4):
    a = 2.6 + j * .35
    flowx(f"mgrit{j}", "s_mod", [[-1.55 + (j - 1.5) * .6, WT + .06, .1], [-1.55 + (j - 1.5) * .6 - .2, WT + .18, .5], [-1.2 + (j - 1.5) * .5, WT + .1, 1.6], [(WR + .4) * math.cos(a), 3.7, (WR + .4) * math.sin(a)]], shape="grit", n=2, size=.08, rate=.5, color="dirt", rim="dirtR")
glow("megaOn", "s_mega", ["m_face"], "mega", steady=False, g=1.0, freq=4.0)
# 藥液瓶（後方：SC1 藍、SC2 琥珀、超純水青、異丙醇紫）＋閥＋管路（瓶頂 → 上 → 往右 → 立柱頂 → 橫樑端）
BOT = [("sc1", "bottle1", -6.2), ("sc2", "bottle2", -4.9), ("diw", "bottle3", -3.6), ("ipa", "bottle4", -2.3)]
for k, (nm, mt, x) in enumerate(BOT):
    cyl(f"b_{nm}", "b_rack", mt, .48, 2.3, [x, DECK + 1.25, CD0 + 1.0])
    cyl(f"b_cap{nm}", "b_rack", "pvdf", .3, .3, [x, DECK + 2.55, CD0 + 1.0])
    box(f"b_valve{nm}", "b_rack", "pvdf", [.55, .45, .55], [x, DECK + 3.4, CD0 + 1.0], bevel=.04)
    box(f"b_vh{nm}", "b_rack", nm, [.18, .3, .18], [x, DECK + 3.75, CD0 + 1.0])
    yy = 9.0 + .32 * k; zz = CD0 + 1.0
    pts = [[x, DECK + 2.7, zz], [x, yy, zz], [8.3 + .0, yy, zz], [8.3, yy, BZ - .5 + .0], [8.3, BY + .3, BZ - .5]]
    pipe(f"p_{nm}", "b_pipe", "pfa", pts, .1)
    box(f"p_band{nm}", "b_pipe", nm, [.24, .1, .24], [x, DECK + 4.4, zz])
    flowx(f"pf_{nm}", "b_pipe", pts, shape="liquid", n=4, size=.12, rate=.6, color=nm, rim=nm + "R", band=.07, bandO=.75)
box("b_rack", "b_rack", "steel2", [5.4, .15, 1.4], [-4.25, DECK + .08, CD0 + 1.0])
box("b_rackP", "b_rack", "steel2", [.12, 3.6, .12], [-4.25, DECK + 1.8, CD0 + .35], at=[[-2.6, 0, 0], [2.6, 0, 0]])
# 批次濕式清洗槽（右邊，s10 指台灣辛耘、弘塑的濕製程）
WX = 16.5
box("w_body", "w_bench", "cab2", [13, 3.6, 5.2], [WX, 1.8, -1.0], bevel=.06)
box("w_baseP", "w_bench", "cabPanel", [2.8, 2.6, .08], [WX, 1.6, 1.64], at=[[-4.8 + 3.2 * i, 0, 0] for i in range(4)], bevel=.02)
box("w_rim", "w_bench", "steelHi", [2.9, .14, .16], [WX, 3.7, -1.0], at=[[-4.8 + 3.2 * i, 0, sz * 1.72] for i in range(4) for sz in (-1, 1)])
box("w_rimZ", "w_bench", "steelHi", [.16, .14, 3.6], [WX, 3.7, -1.0], at=[[-4.8 + 3.2 * i + sx * 1.37, 0, 0] for i in range(4) for sx in (-1, 1)])
for i in range(4): box(f"w_tank{i}", "w_bench", f"tank{i + 1}", [2.6, .05, 3.3], [WX - 4.8 + 3.2 * i, 3.64, -1.0])
box("w_postG", "w_bench", "steel2", [.4, 6.0, .4], [WX, 6.6, -3.4], at=[[-6.2, 0, 0], [6.2, 0, 0]])
box("w_beamG", "w_bench", "steel", [12.8, .5, .5], [WX, 9.4, -3.4])
box("w_hood", "w_bench", "cabD", [13.2, .5, 5.6], [WX, 10.0, -1.0], bevel=.05)
box("w_robot", "w_bench", "cab2", [1.4, 2.6, 1.0], [WX - 1.6, 7.9, -2.6], bevel=.04)
box("w_cass", "w_bench", "pfa", [2.0, 1.6, 1.6], [WX - 1.6, 5.4, -1.0], bevel=.06)
box("w_slot", "w_bench", "steelHi", [.04, 1.4, 1.5], [WX - 1.6, 5.4, -1.0], at=[[-.8 + .16 * i, 0, 0] for i in range(11)])
box("w_scr", "w_bench", "screen", [2.4, 1.6, .1], [WX + 4.8, 6.2, -3.1], bevel=.03)
# 動作與標註
glow("ledG", "c_body", ["c_twG", "n_carL"], "led", steady=False, g=.9, freq=1.2)
for nm in ("sc1", "sc2", "diw", "ipa"): glow(f"vOn_{nm}", "b_rack", [f"b_vh{nm}"], nm, steady=False, g=1.0, freq=2.0)
anchor("t_tool", "c_body", [-CW + 1.0, CH, CD1], dx=-60, dy=-110)
anchor("t_wf", "s_wf", [WR * .7, WT, WR * .7], dx=150, dy=110)
anchor("t_wfL", "s_wf", [-WR * .7, WT, WR * .7], dx=-150, dy=110)
anchor("t_chuck", "s_mod", [2.5, 3.2, 1.3], dx=170, dy=150)
anchor("t_cup", "s_mod", [-4.4, 3.6, 1.0], dx=-140, dy=80)
anchor("t_noz", "s_noz", [.6, 5.0, .3], dx=150, dy=-90)
anchor("t_tipL", "s_noz", [-.3, 4.4, .2], dx=-170, dy=-120)
anchor("t_beam", "n_rail", [6.0, BY + .3, BZ], dx=110, dy=-80)
anchor("t_mega", "s_mega", [-3.0, MY + .3, .3], dx=-150, dy=-100)
anchor("t_edge", "s_mod", [3.9, 3.7, 1.6], dx=140, dy=30)
anchor("t_bot", "b_rack", [-4.3, DECK + 3.6, CD0 + 1.4], dx=-120, dy=-110)
anchor("t_sc1", "b_rack", [-6.2, DECK + 2.0, CD0 + 1.5], dx=-110, dy=-60)
anchor("t_wb", "w_bench", [WX + 3.0, 3.7, 1.6], dx=90, dy=-150)
anchor("t_lp", "c_lp", [-CW - 2.0, 6.6, 2.5], dx=-80, dy=-90)

# ═════════ A：灰化腔 x=60 ═════════
AX = 60; AWY = 3.925; AWT = AWY + .025
box("a_base", "a_base", "cab", [12, 3.0, 8.4], [AX, 1.5, 0], bevel=.06)
box("a_baseP", "a_base", "cabPanel", [3.4, 2.2, .08], [AX, 1.5, 4.24], at=[[-3.8, 0, 0], [0, 0, 0], [3.8, 0, 0]], bevel=.02)
sph("a_screw", "a_base", "steelHi", .06, [AX, 1.5, 4.3], at=[[-3.8 + 3.8 * i + sx * 1.55, sy * .95, 0] for i in range(3) for sx in (-1, 1) for sy in (-1, 1)])
cyl("a_flB", "a_ch", "steel", 3.95, .3, [AX, 3.15, 0])
tube("a_wall", "a_ch", "quartz", 3.65, 3.45, 2.9, [AX, 4.75, 0])
tube("a_flT", "a_ch", "steel", 3.95, 3.05, .3, [AX, 6.35, 0])
cyl("a_lid", "a_ch", "steel2", 3.95, .25, [AX, 6.62, 0])
BOLT = [[3.78 * math.cos(2 * math.pi * k / 16), 0, 3.78 * math.sin(2 * math.pi * k / 16)] for k in range(16)]
cyl("a_bolt", "a_ch", "steelHi", .1, .18, [AX, 3.38, 0], at=BOLT)
cyl("a_boltT", "a_ch", "steelHi", .1, .18, [AX, 6.86, 0], at=BOLT)
box("a_post", "a_ch", "steelHi", [.18, 2.9, .18], [AX, 4.75, 0], at=[[3.55 * math.cos(a), 0, 3.55 * math.sin(a)] for a in (.5, 2.6, 3.7, 5.8)])
# 上方電漿源：石英管＋射頻線圈（銅管）＋匹配箱＋氧氣管
cyl("a_qz", "a_src", "quartz", 1.15, 2.6, [AX, 8.2, 0])
cyl("a_qzCap", "a_src", "steel", 1.3, .3, [AX, 9.6, 0])
tube("a_coil", "a_src", "cu", 1.42, 1.28, .14, [AX, 7.4, 0], at=[[0, .38 * i, 0] for i in range(5)])
box("a_match", "a_src", "cabD", [2.0, 2.2, 1.6], [AX + 3.4, 8.2, -.6], bevel=.06)
box("a_matchL", "a_src", "led", [.4, .1, .03], [AX + 3.4, 8.9, .21])
cyl("a_rfC", "a_src", "cu", .12, 1.7, [AX + 1.85, 8.0, 0], axis="x")
pipe("a_o2", "a_gas", "steelHi", [[AX - 6.0, 10.4, 0], [AX, 10.4, 0], [AX, 9.75, 0]], .12)
box("a_gbox", "a_gas", "cab2", [1.6, 2.4, 1.4], [AX - 6.0, 9.4, 0], bevel=.05)
box("a_gboxL", "a_gas", "sc1", [1.0, .3, .05], [AX - 6.0, 9.8, .72])
# 擋板（打孔板）、加熱夾頭（加熱環）、頂針、晶圓、光阻（底層光阻、焦硬外殼、殘渣）
cyl("a_baffle", "a_in", "steelHi", 3.35, .12, [AX, 5.75, 0])
HOLES = [[x, 0, z] for x in [i * .55 for i in range(-5, 6)] for z in [j * .55 for j in range(-5, 6)] if math.hypot(x, z) < 3.0]
cyl("a_hole", "a_in", "cabD", .1, .14, [AX, 5.75, 0], at=HOLES)
cyl("a_chuck", "a_in", "heat", 3.0, .55, [AX, 3.6, 0])
tube("a_heatR", "a_in", "cu", 3.02, 2.9, .06, [AX, 3.6, 0], at=[[0, -.15, 0], [0, 0, 0], [0, .15, 0]])
cyl("a_wf", "a_in", "wafer", 2.8, .05, [AX, AWY, 0])
cyl("a_resist", "a_res", "resist", 2.72, .14, [AX, AWT + .07, 0])
cyl("a_crust", "a_crust", "crust", 2.72, .045, [AX, AWT + .162, 0])
RES = [[r * math.cos(a), 0, r * math.sin(a)] for r, a in [(rnd.uniform(.3, 2.5), rnd.uniform(0, 6.283)) for _ in range(30)]]
sph("a_residue", "a_rsd", "residue", .08, [AX, AWT + .03, 0], at=RES, scale=[1, .5, 1])
BUB = [[r * math.cos(a), 0, r * math.sin(a)] for r, a in [(rnd.uniform(.3, 2.4), rnd.uniform(0, 6.283)) for _ in range(14)]]
sph("a_bub", "a_bub", "resist", .17, [AX, AWT + .18, 0], at=BUB, scale=[1, .7, 1])
box("a_crack", "a_bub", "bad", [.5, .02, .05], [AX, AWT + .19, 0], at=[[b[0], 0, b[2]] for b in BUB[:8]], rot=[0, 35, 0])
sph("a_plasma", "a_pl", "plasma", 3.0, [AX, 4.85, 0], scale=[1, .2, 1])
cyl("a_plasmaQ", "a_pl", "plasma", 1.0, 2.2, [AX, 8.1, 0])
# 排氣：腔體右下的管＋真空幫浦
pipe("a_exh", "a_exh", "steel2", [[AX + 3.6, 3.5, 0], [AX + 6.2, 3.5, 0], [AX + 6.2, 1.0, 0]], .4)
cyl("a_pump", "a_exh", "steel", .9, 2.0, [AX + 6.2, 1.0, 0])
cyl("a_pumpF", "a_exh", "steelHi", 1.05, .18, [AX + 6.2, 2.05, 0])
box("a_gasSp", "a_in", "air", [6.6, 1.9, 6.6], [AX, 4.85, 0])   # 腔內空間（看不見；給 flow-check 用）
flowx("o2in", "a_gas", [[AX - 6.0, 10.4, 0], [AX, 10.4, 0], [AX, 9.0, 0], [AX, 7.0, 0]], shape="mol", n=6, size=.16, rate=.4, color="o2", rim="o2R")
for j, z in enumerate([-1.6, -.5, .6, 1.7]):
    flowx(f"orad{j}", "a_in", [[AX, 5.62, z], [AX, AWT + .25, z]], shape="dot", n=3, lanes=5, gap=.9, ldir=(1, 0, 0), size=.07, rate=1.1, color="oRad", rim="oRadR", trail=2)
for j, z in enumerate([-1.2, 0, 1.2]):
    flowx(f"co2{j}", "a_in", [[AX - 1.5 + j, AWT + .25, z], [AX + .6 + j * .5, 4.7, z * .6], [AX + 3.3, 3.6, z * .2], [AX + 6.2, 3.5, 0], [AX + 6.2, 1.6, 0]], shape="mol", n=4, size=.13, rate=.35, color="co2", rim="co2R")
for j in range(6):
    a = j * 1.05 + .4; r = 1.0 + .25 * j
    flowx(f"flake{j}", "a_in", [[AX + r * math.cos(a), AWT + .2, r * math.sin(a)], [AX + (r + .5) * math.cos(a), AWT + 1.0, (r + .5) * math.sin(a)], [AX + (r + 1.0) * math.cos(a), AWT + .7, (r + 1.0) * math.sin(a)], [AX + (r + 1.2) * math.cos(a), AWT + .1, (r + 1.2) * math.sin(a)]], shape="flake", n=2, size=.09, rate=.8, color="crust", rim="dirtR")
glow("a_plGlow", "a_pl", ["a_plasma", "a_plasmaQ"], "plasma", steady=False, g=.9, freq=2.6, halo=1.2)
glow("a_coilOn", "a_src", ["a_coil"], "heat", steady=False, g=.6, freq=3.0)
glow("a_heatWarm", "a_in", ["a_chuck", "a_heatR"], "heat", steady=True, g=.55)
glow("a_heatHot", "a_in", ["a_chuck", "a_heatR"], "bad", steady=False, g=.9, freq=3.0)
glow("a_crackOn", "a_bub", ["a_crack"], "bad", steady=False, g=1.0, freq=4.0)
anchor("a_crust", "a_crust", [AX + 2.2, AWT + .18, 1.6], dx=150, dy=70)
anchor("a_resist", "a_res", [AX - 2.3, AWT + .1, 1.4], dx=-140, dy=90)
anchor("a_plasma", "a_pl", [AX + 2.6, 4.9, 1.6], dx=160, dy=-40)
anchor("a_src", "a_src", [AX - 1.3, 8.4, .5], dx=-150, dy=-40)
anchor("a_o2", "a_gas", [AX - 6.0, 10.6, .7], dx=-60, dy=-90)
anchor("a_chuck", "a_in", [AX + 3.0, 3.55, .5], dx=160, dy=90)
anchor("a_bub", "a_bub", [AX - 1.0, AWT + .2, 1.8], dx=-150, dy=70)
anchor("a_exh", "a_exh", [AX + 6.2, 2.4, .8], dx=110, dy=60)
anchor("a_rsd", "a_rsd", [AX + 1.5, AWT + .05, 1.8], dx=150, dy=80)

# ═════════ X：線路剖面 x=120 ═════════
XX = 120
box("x_si", "x_sub", "si", [13, 2.0, 5], [XX, 1.0, 0])
box("x_siF", "x_sub", "siFace", [12.9, 1.9, .02], [XX, 1.0, 2.51])
box("x_ox", "x_sub", "ox", [13, .25, 5], [XX, 2.125, 0])
LXS = [-4.5 + 1.8 * i for i in range(6)]
box("x_line", "x_line", "line", [1.2, 1.6, 4.6], [XX, 3.05, 0], at=[[x, 0, 0] for i, x in enumerate(LXS) if i not in (2, 3)], bevel=.04)
box("x_l2", "x_l2", "line", [1.2, 1.6, 4.6], [XX + LXS[2], 3.05, 0], bevel=.04)
box("x_l3", "x_l3", "line", [1.2, 1.6, 4.6], [XX + LXS[3], 3.05, 0], bevel=.04)
box("x_tick", "x_mark", "tick", [1.2, .06, .06], [XX + LXS[1], 4.15, 2.4])
box("x_tickV", "x_mark", "tick", [.06, .4, .06], [XX + LXS[1], 4.15, 2.4], at=[[-.6, 0, 0], [.6, 0, 0]])
sph("x_pt", "x_pt", "dirt", .31, [XX, 3.55, 1.0])
tube("x_spark", "x_spk", "spark", .7, .5, .04, [XX, 3.55, 1.0], axis="z")
box("x_flowBox", "x_spk", "air", [2.6, .8, .6], [XX, 3.55, 1.0])
flowx("x_cur", "x_spk", [[XX - 1.4, 3.55, 1.0], [XX + 1.4, 3.55, 1.0]], shape="arrow", n=4, size=.18, rate=1.4, color="bad", rim="badR")
glow("x_short", "x_l2", ["x_l2", "x_l3"], "bad", steady=False, g=.9, freq=3.0)
glow("x_sparkOn", "x_spk", ["x_spark"], "spark", steady=False, g=1.0, freq=5.0, halo=.8)
anchor("x_line", "x_line", [XX + LXS[1], 4.2, 2.3], dx=-120, dy=-90)
anchor("x_pt", "x_pt", [XX + .2, 3.8, 1.2], dx=150, dy=-120)
anchor("x_short", "x_l2", [XX + LXS[2] - .3, 3.0, 2.3], dx=-160, dy=60)

# 主素材框（看不見；給 layout-check 判斷「卡片／標籤有沒有蓋到主體中央」）：每一段只亮鏡頭對準的那一個，其他層全部標 bg
materials["m_proxy"] = {"kind": "unlit", "color": "#FFFFFF", "opacity": 0}
PXB = {"px_tool": (-9.4, 9.4, 0, 13.2, -5.4, 3.6), "px_wf": (-3.4, 3.4, 3.3, 4.6, -3.4, 3.4), "px_ash": (AX - 4.0, AX + 4.0, 3.0, 9.8, -4.0, 4.0),
       "px_x": (XX - 6.5, XX + 6.5, 0, 3.9, -2.5, 2.5), "px_all": (-9.4, 23.2, 0, 11.0, -5.4, 3.6), "px_cup": (-4.5, 4.5, 2.2, 5.0, -4.5, 4.5)}
for lid, (x0, x1, y0, y1, z0, z1) in PXB.items():
    box(lid, lid, "proxy", [x1 - x0, y1 - y0, z1 - z0], [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2])
for l in layers:
    if not l["id"].startswith("px_"): l["bg"] = True
model = {
 "name": "tech-clean：清洗。站別：T 單片清洗機 x=0（＋批次濕式清洗槽 x=24）、A 灰化腔 x=60、X 線路剖面 x=120（genmodel.py 產生）",
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
HIDE = "s1:start-40"; FAR = "s12:start+400"
def off(c, n): return f"{c}{'+' if n >= 0 else '-'}{abs(n)}"
def run(i, at, until=None, ramp=6, **kw):
    d = {"id": i, "at": at, "ramp": ramp}
    if until: d["until"] = until
    d.update(kw); return d
def lab(part, text, en, color, at, until): return {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until}
def shot(at, x, y, d, elev, dur=24): return {"at": at, "dur": dur, "x": x, "y": y, "d": d, "elev": elev}
def hid(lay, a, b, dur=6): return {"layer": lay, "at": a, "until": b, "opacity": 0, "dur": dur}
def mv(lay, at, until, dur=14, dx=0, dy=0, dz=0, **kw):
    d = {"layer": lay, "at": at, "until": until, "dur": dur, "dx": dx, "dy": dy, "dz": dz}; d.update(kw); return d
def fall(lay, until, dy=1.4, bounce=.08):
    return {"layer": lay, "at": HIDE, "until": until, "dy": dy, "opacity": 0, "dur": 12, "fallIn": True, "bounce": bounce}
def sec(kind, at, until, title, tag, t, y=930, h=330, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag, "t": {k: {"at": v} for k, v in t.items()}}
    d.update(kw); return d
def spray(chem, at, until, ramp=4): return [run(f"sp_{chem}_{j}", at, until, ramp) for j in range(5)]

# 全片可見性（shift 是全片的，放在 s1）
VIS = [
 # 液膜：s1 用超純水膜；s6 藥液（SC1）；s8 SC1 → SC2 → 超純水；s9 異丙醇從中心往外乾
 hid("f_sc1", HIDE, "s6:spin-4", 8), hid("f_sc1", "s8:sc2-2", FAR, 10),
 hid("f_sc2", HIDE, "s8:sc2-2", 10), hid("f_sc2", "s8:rinse-2", FAR, 10),
 hid("f_diw", "s1:why+20", "s8:rinse-2", 10), hid("f_diw", "s9:ipa+6", FAR, 14),
 # 髒顆粒：s1 一開始有、被沖走；s6 再出現一批、甩走；s7 剩下黏緊的幾顆（同一層，s7 先回來再淡掉）
 hid("s_dirt", "s1:dirty+40", "s6:start", 30), hid("s_dirt", "s6:fling+10", "s7:stuck-4", 30), hid("s_dirt", "s7:away+4", FAR, 26),
 # 兆音波棒：s7 念到「兆音波」才降下來，s8 起升回去
 mv("s_mega", HIDE, "s7:mega-10", dur=18, dy=3.2, dx=-2.0), mv("s_mega", "s8:start", FAR, dur=18, dy=3.2, dx=-2.0),
 # 灰化腔：電漿、外殼、底下光阻、殘渣、氣泡
 hid("a_pl", HIDE, "s3:plasma-4", 10), hid("a_pl", "s5:spm", FAR, 10),
 mv("a_crust", "s3:slow", FAR, dur=60, opacity=.45), hid("a_crust", "s5:through-4", FAR, 18),
 hid("a_res", "s5:warm+6", FAR, 40),
 hid("a_rsd", HIDE, "s5:warm+24", 10), hid("a_rsd", "s5:spm+8", FAR, 30),
 hid("a_bub", HIDE, "s4:gas-2", 4), hid("a_bub", "s5:start", FAR, 6),
 mv("a_bub", "s4:gas-2", "s5:start", dur=30, dy=.06),
 # 線路剖面：顆粒落下、火花
 fall("x_pt", "s2:half-4", dy=2.4, bounce=.1), hid("x_spk", HIDE, "s2:short-2", 4), hid("x_mark", HIDE, "s2:width", 6),
]
for i in range(len(RINGS)):
    VIS += [hid(f"f_ipa{i}", HIDE, "s9:ipa+4", 10), hid(f"f_ipa{i}", off("s9:front", -8 + 7 * i), FAR, 8)]
# 噴嘴：s6 從中心掃到邊緣兩趟；s1 一趟
SWEEP = [mv("s_noz", "s1:hard", "s1:why", dur=50, dx=2.6), mv("s_noz", "s6:sweep-6", "s6:sweep+50", dur=44, dx=2.7), mv("s_noz", "s6:sweep+62", "s6:fling+60", dur=44, dx=2.7),
         mv("s_noz", "s8:turn", "s8:rinse+30", dur=40, dx=1.2), mv("s_noz", "s9:ipa-4", "s9:front+46", dur=60, dx=2.6)]

PXW = {"px_tool": [("s8:start+30", "s9:start-4")], "px_cup": [("s1:start-40", "s2:start-4")], "px_wf": [("s6:start+30", "s8:start-4"), ("s9:start+30", "s10:start-4"), ("s11:start+30", FAR)],
       "px_ash": [("s3:start+30", "s6:start-4")], "px_x": [("s2:start+30", "s3:start-4")], "px_all": [("s10:start+34", "s11:start-4")]}
for lid, wins in PXW.items():
    prev = "s1:start-60"
    for a_, b_ in wins:
        VIS.append({"layer": lid, "at": prev, "until": a_, "opacity": 0, "dur": 1}); prev = b_
    VIS.append({"layer": lid, "at": prev, "until": "s12:start+500", "opacity": 0, "dur": 1})
P = {}
P["s1"] = {"zoom": [{"to": "tool", "at": "start-30", "dur": 1}],
 "shot": [shot("start-30", 0, 1.6, 66, 20, 1), shot("hard", 0, 1.2, 58, 22, 90)],
 "shift": VIS + SWEEP,
 "run": [run("spin", "start-30", "s2:start+10", 1), run("ledG", "start-30", FAR, 1)] + spray("diw", "start-30", "s2:start") + [run(f"sheet{j}", "start-30", "s2:start", 1) for j in range(8)]
        + [run(f"fling{j}", "start-20", "s2:start", 4) for j in range(10)] + [run(f"grit{j}", "dirty", "why+20", 6) for j in range(6)] + [run("pf_diw", "start-30", "s2:start", 1), run("vOn_diw", "start-30", "s2:start", 1)],
 "labels": [lab("t_wf", "表面有顆粒", "Particles on the surface", "coral", "dirty", "n50-6"), lab("t_noz", "噴嘴：一直沖", "Rinse nozzle", "blue", "n50", "s2:start-4")],
 "overlay": [sec("cln-hook", "prev", "s2:start-2", "接上一支：離子佈植", "業界整理", {"prev": "prev", "hard": "hard", "dirty": "dirty", "n50": "n50", "why": "why"})]}
P["s2"] = {"zoom": [{"to": "surface", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", XX, .4, 40, 18, 30), shot("short-6", XX + .2, .8, 34, 16, 30)],
 "run": [run("x_short", "short", "s3:start", 4), run("x_sparkOn", "short", "s3:start", 2), run("x_cur", "short+4", "s3:start", 4)],
 "labels": [lab("x_line", "線寬：幾十奈米", "Line width", "blue", "width+6", "short-4"), lab("x_pt", "線寬一半大的顆粒", "Half-width particle", "coral", "half+6", "short-4"), lab("x_short", "兩條線被接通：短路", "Short circuit", "coral", "short+6", "s3:start-4")],
 "overlay": [sec("cln-kill", "start+2", "s3:start-2", "一顆顆粒就夠", "示意，非實際比例", {"width": "width", "half": "half", "short": "short"})]}
P["s3"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", AX, .9, 50, 20, 30), shot("plasma-6", AX + .2, 1.2, 40, 22, 40)],
 "run": [run("o2in", "plasma-14", "s5:spm", 8), run("a_coilOn", "plasma-6", "s5:spm", 6), run("a_plGlow", "plasma-4", "s5:spm", 8)] + [run(f"orad{j}", "slow-4", "s5:spm", 8) for j in range(4)] + [run(f"co2{j}", "slow+10", "s5:spm", 8) for j in range(3)],
 "labels": [lab("a_crust", "焦硬的殼", "Hardened crust", "coral", "crust", "s4:start-4"), lab("a_src", "氧電漿", "Oxygen plasma", "blue", "plasma", "ash-4"), lab("a_plasma", "灰化：低溫慢慢燒掉", "Ashing", "amber", "ash", "s4:start-4")],
 "overlay": [sec("cln-ash", "start+2", "s4:start-2", "灰化：燒掉硬殼", "示意，非實際比例", {"strip": "strip", "crust": "crust", "plasma": "plasma", "slow": "slow", "ash": "ash"})]}
P["s4"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 1}],
 "shot": [shot("start-4", AX + .2, 1.6, 42, 24, 30)],
 "run": [run("a_heatHot", "hot", "s5:start", 6), run("a_crackOn", "pop", "s5:start", 4)] + [run(f"flake{j}", "spray-4", "s5:start", 4) for j in range(6)],
 "labels": [lab("a_chuck", "如果直接高溫", "If heated fast", "coral", "hot+4", "pop-6"), lab("a_bub", "底下光阻冒氣", "Resist outgasses", "amber", "gas+4", "s5:start-4"), lab("a_crust", "殼被撐破、碎片噴出", "Crust pops", "coral", "pop+6", "s5:start-4")],
 "overlay": [sec("cln-pop", "start+2", "s5:start-2", "為什麼不能高溫", "示意", {"hot": "hot", "gas": "gas", "pop": "pop", "spray": "spray"})]}
P["s5"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 1}],
 "shot": [shot("start-4", AX, .9, 42, 22, 30)],
 "run": [run("a_heatWarm", "warm-4", "s6:start", 10)],
 "labels": [lab("a_rsd", "殘渣", "Residue", "amber", "warm+30", "s6:start-4"), lab("a_chuck", "殼穿了才加溫", "Then heat up", "amber", "warm", "s6:start-4")],
 "overlay": [sec("cln-spm", "start+2", "s6:start-2", "先穿殼，再燒，再溶", "示意", {"through": "through", "warm": "warm", "spm": "spm"})]}
P["s6"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", .4, 1.6, 36, 34, 30)],
 "run": [run("spin", "spin-6", "s10:start", 10)] + spray("sc1", "sweep-8", "s7:start+10") + [run(f"sheet{j}", "sweep", "s10:start", 10) for j in range(8)]
        + [run(f"fling{j}", "sweep+6", "s10:start", 8) for j in range(10)] + [run(f"grit{j}", "fling-4", "s7:start", 6) for j in range(6)] + [run("pf_sc1", "single", "s7:start+10", 6), run("vOn_sc1", "single", "s7:start+10", 6)],
 "labels": [lab("t_chuck", "轉盤：晶圓吸住旋轉", "Spin chuck", "blue", "spin", "fling-4"), lab("t_noz", "噴嘴：中心→邊緣", "Nozzle sweeps out", "amber", "sweep", "s7:start-4"), lab("t_edge", "顆粒往外甩", "Flung outward", "coral", "fling", "s7:start-4")],
 "overlay": [sec("cln-spin", "start+2", "s7:start-2", "單片旋轉清洗", "俯視示意", {"single": "single", "spin": "spin", "sweep": "sweep", "fling": "fling"})]}
P["s7"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 1}],
 "shot": [shot("start-4", -1.0, 1.7, 30, 32, 30)],
 "run": spray("diw", "start", "s8:start") + [run("megaOn", "mega", "s8:start", 6)] + [run(f"mwave{j}", "mhz-6", "s8:start", 8) for j in range(3)] + [run(f"mgrit{j}", "stream", "s8:start", 6) for j in range(4)] + [run("pf_diw", "start", "s8:start", 6)],
 "labels": [lab("t_wfL", "黏太緊的小顆粒", "Stuck particles", "coral", "stuck+4", "mega-4"), lab("t_mega", "兆音波棒", "Megasonic bar", "blue", "mega", "s8:start-4"), lab("t_wf", "水流推走顆粒", "Streaming lifts them", "amber", "stream", "s8:start-4")],
 "overlay": [sec("cln-mega", "start+2", "s8:start-2", "兆音波清洗", "示意，非實際比例", {"stuck": "stuck", "mega": "mega", "mhz": "mhz", "stream": "stream", "away": "away"})]}
P["s8"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", -.6, 1.4, 52, 26, 34)],
 "run": spray("sc1", "turn", "sc2-4", 4) + spray("sc2", "sc2", "rinse-4", 4) + spray("diw", "rinse", "s9:start", 4)
        + [run("pf_sc1", "turn-10", "sc2-4", 6), run("vOn_sc1", "turn-6", "sc2-4", 4), run("pf_sc2", "sc2-14", "rinse-4", 6), run("vOn_sc2", "sc2-6", "rinse-4", 4), run("pf_diw", "rinse-14", "s9:start", 6), run("vOn_diw", "rinse-6", "s9:start", 4)],
 "labels": [lab("t_sc1", "藥液瓶：輪流送", "Chemical supply", "blue", "turn", "sc1-6"), lab("t_wf", "藍：去顆粒、有機物", "SC1: particles", "blue", "sc1", "sc2-4"), lab("t_wfL", "黃：去金屬", "SC2: metals", "amber", "sc2", "rinse-4"), lab("t_noz", "超純水沖淨", "DI water rinse", "blue", "rinse", "s9:start-4")],
 "overlay": [sec("cln-chem", "start+2", "s9:start-2", "藥液輪流換", "示意", {"turn": "turn", "sc1": "sc1", "sc2": "sc2", "rinse": "rinse"})]}
P["s9"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", .6, 1.6, 34, 40, 30)],
 "run": spray("diw", "start", "ipa-6", 4) + spray("ipa", "ipa-2", "s10:start", 4) + [run("pf_ipa", "ipa-14", "s10:start", 6), run("vOn_ipa", "ipa-6", "s10:start", 4), run("pf_diw", "start", "ipa-6", 4)],
 "labels": [lab("t_wf", "水直接甩乾：留水痕", "Water leaves marks", "coral", "mark", "ipa-4"), lab("t_tipL", "異丙醇把水換掉", "IPA replaces water", "blue", "ipa", "s10:start-4"), lab("t_wfL", "從中心往外乾", "Dries center-out", "amber", "front", "s10:start-4")],
 "overlay": [sec("cln-dry", "start+2", "s10:start-2", "乾燥不留水痕", "示意，非實際比例", {"dry": "dry", "mark": "mark", "fall": "fall", "ipa": "ipa", "front": "front"})]}
P["s10"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", 4.0, 1.4, 80, 22, 34)],
 "labels": [lab("t_tool", "單片清洗機", "SCREEN · TEL · Lam", "blue", "screen", "s11:start-4"),
            lab("t_wb", "辛耘、弘塑（台）", "Wet bench · packaging", "amber", "tw", "s11:start-4")],
 "overlay": [sec("cln-co", "start+2", "s11:start-2", "誰在做", "市場研究摘要、媒體報導", {"screen": "screen", "tel": "tel", "lam": "lam", "tw": "tw", "pkg": "pkg"})]}
P["s11"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", .2, 1.4, 30, 40, 34)],
 "labels": [lab("t_wf", "洗乾淨的表面", "Clean surface", "blue", "clean+4", "next-4")],
 "overlay": [sec("cln-next", "start+2", "kw-10", "接下來", "下一支：氧化與熱處理", {"clean": "clean", "oxide": "oxide", "heat": "heat", "next": "next", "kw": "kw"})]}
for sc in script["scenes"]:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])
json.dump(script, open(sp, "w"), ensure_ascii=False, indent=1)
print("script props 併入", len(P), "幕")
