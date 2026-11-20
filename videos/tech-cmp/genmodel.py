# 產生 videos/tech-cmp/model.json（改這支再重產）。座標：x 右、y 上、z 朝觀眾；各站以 x 偏移分開。
# T x=0 CMP 機台｜H x=60 研磨頭爆炸剖析｜W x=120 晶圓表面近景（凹凸膜、研磨液、磨粒、磨平）
import json, math
R = lambda x: round(x, 3)
parts = []; layers = []; anchors = {}; actions = {}
LAYERS = {}
def layer(i):
    if i not in LAYERS:
        LAYERS[i] = True; layers.append({"id": i, "z": 0, "k": 0})
def box(pid, lay, mat, size, pos, at=None, rot=None, shape="box", **kw):
    layer(lay)
    p = {"id": pid, "layer": lay, "shape": shape, "size": [R(v) for v in size], "pos": [R(v) for v in pos], "mat": "m_" + mat}
    if at: p["at"] = [[R(v) for v in a] for a in at]
    if rot: p["rot"] = rot
    p.update(kw); parts.append(p); return pid
# 圓柱：axis 指長軸方向（x／y／z）
def cyl(pid, lay, mat, r, h, pos, axis="y", at=None):
    rot = {"y": [90, 0, 0], "x": [0, 90, 0], "z": None}[axis]
    return box(pid, lay, mat, [r, h], pos, at=at, rot=rot, shape="cyl")
def tube(pid, lay, mat, ro, ri, ln, pos, axis="x"):
    rot = {"y": [90, 0, 0], "x": [0, 90, 0], "z": None}[axis]
    return box(pid, lay, mat, [ro, ri, ln], pos, rot=rot, shape="tube")
def anchor(name, lay, p, dx=100, dy=-80): anchors[name] = {"layer": lay, "p": [R(v) for v in p], "dx": dx, "dy": dy}

palette = {"dark": "#3F4E6B", "dark2": "#2E3340", "steel": "#9AA8BE", "steel2": "#7D8AA1", "steelHi": "#C5D0E2", "cu": "#C98A3E", "cuHi": "#E8A45E", "cuDk": "#9C6A2C",
 "orange": "#F08A24", "dram": "#2A7F8F", "dram2": "#3F9AA5", "si": "#B8C2D6", "siTop": "#CBD4E4", "pcbG": "#2F6E55", "paste": "#8E96A6", "glass": "#CFE6F5",
 "waterB": "#5CC8FF", "waterBd": "#2F7FE0", "hotR": "#E0472F", "warm": "#FFB020", "airB": "#9FD3FF", "cloud": "#FF8A3D", "pipeB": "#2F7FE0", "pipeR": "#D8432C",
 "brass": "#D6B25E", "oring": "#E0472F", "led": "#FF5A1F", "white": "#F6F2E8", "slot": "#2A2E3B", "cube": "#FF7A2F", "cableCu": "#E08A3E",
 "lp_heat": "#FF7A2F", "lp_bad": "#E0472F", "lp_sig": "#38B6FF", "lp_sigRim": "#1F6FEB", "lp_proc": "#FF9F1C", "lp_good": "#14A38B", "lp_warm": "#FFB020", "lp_melt": "#FF5A1F", "dashC": "#E0472F"}
def M(color, **k): return {"kind": "std", "color": color, "rough": 0.45, "metal": 0.1, **k}
def G(color, op, **k): return {"kind": "phys", "color": color, "rough": 0.1, "metal": 0, "clearcoat": 0.8, "opacity": op, "env": 0.5, **k}
def flow(key, lay, path, n=4, lanes=1, gap=.2, ldir=(1, 0, 0), size=.1, rate=1.0, color="lp_sig", rim="lp_sigRim", trail=3):
    layer(lay)
    actions[key] = {"type": "flow", "layer": lay, "path": [[R(v) for v in p] for p in path], "n": n, "lanes": lanes, "laneGap": gap, "laneDir": list(ldir), "size": size, "shape": "dot",
                    "rate": rate, "color": color, "rim": rim, "rimScale": 1.6, "rimO": .45, "trail": trail, "trailGap": .03, "trailColor": color, "track": False}
def glow(key, lay, ps, color="lp_heat", steady=True, g=.9, freq=2.2):
    layer(lay)
    d = {"type": "pulse", "layer": lay, "parts": ps, "color": color, "glow": g, "halo": 0}
    if steady: d["steady"] = True
    else: d["freq"] = freq
    actions[key] = d

palette.update({"film": "#2A9D8F", "film2": "#33B3A3", "film3": "#47C7B5", "layA": "#4FA3E8", "layB": "#F0A030", "ion": "#8B7CFF", "plasma": "#B8A6FF", "atomG": "#E8B33D",
                "purge": "#8E96A6", "siF": "#A9B7D6", "siB": "#8091B8", "latt": "#5E6F9B", "gasA": "#38B6FF", "gasB": "#FF9F1C", "filmG": "#D9A93C", "fill": "#5E8FB0", "magN": "#D8432C", "magS": "#2F7FE0", "pad": "#34456E"})
def M(color, **k): return {"kind": "std", "color": color, "rough": 0.45, "metal": 0.1, **k}
materials = {
 "dark": M("dark", rough=.5, metal=.2), "dark2": M("dark2", rough=.35, metal=.3), "steel": M("steel", rough=.3, metal=.85, env=.5), "steel2": M("steel2", rough=.35, metal=.8),
 "steelHi": M("steelHi", rough=.25, metal=.8, env=.7), "si": M("si", rough=.35, metal=.35, env=.5), "siTop": M("siTop", rough=.3, metal=.4, env=.6),
 "white": M("white", rough=.55), "slot": {"kind": "unlit", "color": "slot"}, "led": {"kind": "unlit", "color": "led"}, "gold": M("brass", rough=.25, metal=.95, env=.8),
 "cu": M("cu", rough=.3, metal=.9, env=.6) if False else M("brass", rough=.3, metal=.9, env=.6),
 "film": M("film", rough=.3, metal=.3, env=.6), "film2": M("film2", rough=.3, metal=.3, env=.6), "film3": M("film3", rough=.3, metal=.3, env=.6),
 "layA": M("layA", rough=.3, metal=.2, env=.6), "layB": M("layB", rough=.3, metal=.2, env=.6), "filmG": M("filmG", rough=.25, metal=.9, env=.8), "fill": M("fill", rough=.35, metal=.3, env=.5),
 "magN": M("magN", rough=.4, metal=.3), "magS": M("magS", rough=.4, metal=.3), "pad": M("pad", rough=.5, metal=.3, env=.2), "siF": M("siF", rough=.55, metal=.05, env=.15), "siB": M("siB", rough=.55, metal=.05, env=.15), "latt": M("latt", rough=.5, metal=.1, env=.1),
 "pipeB": M("pipeB", rough=.35, metal=.4), "orange": M("orange", rough=.35, metal=.35) if False else M("lp_proc", rough=.35, metal=.35),
 "plasma": {"kind": "unlit", "color": "plasma", "opacity": .16}, "hotc": {"kind": "unlit", "color": "lp_heat", "opacity": .5},
 "grn": M("pcbG", rough=.55) if False else M("film", rough=.55),
}
materials = {"m_" + k: v for k, v in materials.items()}
def ring(pid, lay, mat, ro, ri, h, pos): return tube(pid, lay, mat, ro, ri, h, pos, axis="y")
def ring_pts(n, r, y=0): return [[r * math.cos(2 * math.pi * i / n), y, r * math.sin(2 * math.pi * i / n)] for i in range(n)]
def hexgrid(rmax, pitch):
    pts = []
    for j in range(-8, 9):
        for i in range(-8, 9):
            x = (i + .5 * (j % 2)) * pitch; z = j * pitch * .866
            if x * x + z * z <= rmax * rmax: pts.append([x, 0, z])
    return pts


# ───────── 新增色票與材質（CMP） ─────────
palette.update({"padB": "#34456E", "padG": "#222B47", "padHi": "#4B5F90", "slurry": "#7C9CFF", "slurryRim": "#3B5BDB", "grit": "#F2C14E", "gritRim": "#B8860B",
  "mol": "#FF5A8A", "mol2": "#B5163F", "flake": "#B07A45", "flakeRim": "#7A4E24", "dia": "#BFE6FF", "diaDk": "#5F8FB5", "uv": "#8B7CFF", "uvRim": "#4F3FD0", "focus": "#FFB020",
  "press": "#E8613C", "bumpC": "#47C7B5", "softC": "#8FE0D0", "rot": "#2F7FE0", "tank": "#DDE4F0", "slurryBox": "#B9C8FF"})
def M(color, **k): return {"kind": "std", "color": color, "rough": 0.45, "metal": 0.1, **k}
materials.update({"m_" + k: v for k, v in {
 "padB": M("padB", rough=.8, metal=.05, env=.1), "padG": M("padG", rough=.9, metal=0, env=.05), "padHi": M("padHi", rough=.7, metal=.05),
 "dia": M("dia", rough=.15, metal=.9, env=.9), "diaDk": M("diaDk", rough=.4, metal=.6, env=.4), "grit": M("grit", rough=.3, metal=.6, env=.5),
 "tank": M("tank", rough=.5, metal=.1), "tankB": M("slurry", rough=.4, metal=.2),
 "pipe": M("steelHi", rough=.3, metal=.8, env=.7), "bump": M("bumpC", rough=.3, metal=.3, env=.6), "soft": {"kind": "unlit", "color": "softC", "opacity": .8},
 "slurryBox": {"kind": "unlit", "color": "slurryBox", "opacity": .17}, "lightBox": {"kind": "unlit", "color": "uv", "opacity": .05},
 "focusPl": {"kind": "unlit", "color": "focus", "opacity": .55}, "membrane": M("padHi", rough=.5, metal=.05), "memC": M("press", rough=.5, metal=.05),
 "rotM": {"kind": "unlit", "color": "focus"}, "air": {"kind": "unlit", "color": "airB", "opacity": .12},
}.items()})
def flowx(key, lay, path, shape="dot", n=4, lanes=1, gap=.2, ldir=(1, 0, 0), size=.1, rate=1.0, color="lp_sig", rim="lp_sigRim", trail=0, band=None, bandO=.5, free=False, track=False, rimO=.6):
    layer(lay)
    d = {"type": "flow", "layer": lay, "path": [[R(v) for v in p] for p in path], "n": n, "lanes": lanes, "laneGap": gap, "laneDir": list(ldir), "size": size, "shape": shape,
         "rate": rate, "color": color, "rim": rim, "rimScale": 1.5, "rimO": rimO, "trail": trail, "trailGap": .03, "trailColor": color, "track": track}
    if band: d["band"] = band; d["bandO"] = bandO
    if free: d["free"] = True
    actions[key] = d
def arc_pts(cx, cz, r, y, a0, a1, n=20):
    """圓弧上的點（角度＝度；平台轉向：角度遞減）"""
    return [[cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), y, cz + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))] for i in range(n + 1)]
def spiral(cx, cz, r0, r1, y, a0, a1, n=24):
    return [[cx + (r0 + (r1 - r0) * i / n) * math.cos(math.radians(a0 + (a1 - a0) * i / n)), y, cz + (r0 + (r1 - r0) * i / n) * math.sin(math.radians(a0 + (a1 - a0) * i / n))] for i in range(n + 1)]
def rotate(key, lay, parts_, pivot, rps=None, swing=None, freq=.4, ramp=True):
    layer(lay)
    d = {"type": "rotate", "parts": parts_, "axis": [0, 1, 0], "pivot": pivot, "layer": lay}
    if swing is not None: d["swing"] = swing; d["freq"] = freq
    else: d["rps"] = rps; d["rampSpin"] = ramp
    actions[key] = d
def vib(key, lay, ps, axis, amp, freq):
    layer(lay); actions[key] = {"type": "vibrate", "layer": lay, "parts": ps, "axis": axis, "amp": amp, "freq": freq}

# ═════════ T：CMP 機台 x=0 ═════════
TX = 0; PT = 3.2           # 墊面高度
HX = 2.2                   # 研磨頭中心 x（z=0）
box("t_floor", "t_body", "dark2", [36, .3, 30], [TX, .15, 0], bevel=.04)
box("t_cab", "t_body", "dark2", [17, 2.0, 15], [TX, 1.3, 0], bevel=.08)
box("t_cabline", "t_body", "steel2", [17.1, .12, 15.1], [TX, 2.28, 0])
for i, sx in enumerate((-6.2, 0, 6.2)): box(f"t_cabpanel{i}", "t_body", "dark", [4.8, 1.4, .1], [TX + sx, 1.2, 7.55])
box("t_cabled", "t_body", "led", [.9, .1, .04], [TX + 7.3, 1.8, 7.62])
# 研磨盤＋研磨墊（會轉）
cyl("t_platen", "t_plat", "steel", 6.6, .6, [TX, 2.6, 0], axis="y")
cyl("t_pbolt", "t_plat", "steelHi", .18, .1, [TX, 2.93, 0], axis="y", at=ring_pts(24, 6.45))
box("t_pmark", "t_plat", "rotM", [.55, .1, .5], [TX + 6.45, 2.97, 0])
cyl("t_pad", "t_plat", "padB", 6.3, .3, [TX, 3.05, 0], axis="y")
GR = [1.4, 2.6, 3.8, 5.0, 6.0]
for i, rr_ in enumerate(GR): tube(f"t_gr{i}", "t_plat", "padG", rr_ + .07, rr_ - .07, .05, [TX, PT + .005, 0], axis="y")
RAD = []
for i in range(8):
    a = i * 45
    box(f"t_rad{i}", "t_plat", "padG", [5.4, .05, .14], [TX + 3.3 * math.cos(math.radians(a)) + .0, PT + .005, 3.3 * math.sin(math.radians(a))], rot=[0, -a, 0]); RAD.append(f"t_rad{i}")
PLAT = ["t_platen", "t_pbolt", "t_pmark", "t_pad"] + [f"t_gr{i}" for i in range(len(GR))] + RAD
rotate("t_spinP", "t_plat", PLAT, [TX, PT, 0], rps=.12)
# 研磨頭（轉＋可上下）
cyl("t_hring", "t_head", "steel2", 2.3, .5, [TX + HX, 3.45, 0], axis="y") if False else tube("t_hring", "t_head", "steel2", 2.3, 1.85, .5, [TX + HX, 3.45, 0], axis="y")
cyl("t_hbody", "t_head", "steel", 2.2, .8, [TX + HX, 4.1, 0], axis="y")
cyl("t_hflange", "t_head", "steelHi", 2.4, .22, [TX + HX, 4.6, 0], axis="y")
cyl("t_hbolt", "t_head", "steel2", .13, .1, [TX + HX, 4.75, 0], axis="y", at=ring_pts(12, 2.05))
cyl("t_hhub", "t_head", "dark", .95, .5, [TX + HX, 4.95, 0], axis="y")
cyl("t_hshaft", "t_head", "steelHi", .6, 2.6, [TX + HX, 6.5, 0], axis="y")
box("t_hmark", "t_head", "rotM", [.5, .1, .5], [TX + HX + 1.95, 4.74, 0])
HEAD = ["t_hring", "t_hbody", "t_hflange", "t_hbolt", "t_hhub", "t_hshaft", "t_hmark"]
rotate("t_spinH", "t_head", HEAD, [TX + HX, 4.0, 0], rps=.22)
box("t_hhouse", "t_arm", "dark2", [2.2, 1.7, 2.2], [TX + HX, 8.5, 0], bevel=.08)
box("t_hhled", "t_arm", "led", [.7, .1, .04], [TX + HX, 8.2, 1.14])
box("t_boom", "t_arm", "steel", [1.9, 1.2, 8.6], [TX + HX, 8.5, -4.6], bevel=.06)
cyl("t_col", "t_arm", "steel2", 1.15, 8.3, [TX + HX, 4.45, -9.0], axis="y")
cyl("t_colcap", "t_arm", "steelHi", 1.3, .3, [TX + HX, 8.7, -9.0], axis="y")
# 修整器（立柱＋擺臂＋鑽石碟，會來回掃）
PX, PZ = -6.4, -6.4
cyl("t_cpost", "t_cond", "steel2", .85, 5.2, [TX + PX, 2.9, PZ], axis="y")
cyl("t_cpostcap", "t_cond", "steelHi", 1.0, .25, [TX + PX, 5.55, PZ], axis="y")
D2 = math.sqrt(.5); LA = 6.2
box("t_carm", "t_cond", "steelHi", [LA, .5, .75], [TX + PX + D2 * LA / 2, 5.0, PZ + D2 * LA / 2], rot=[0, -45, 0], bevel=.04)
DX, DZ = TX + PX + D2 * LA, PZ + D2 * LA
cyl("t_cjoint", "t_cond", "dark", .55, .9, [DX, 4.55, DZ], axis="y")
cyl("t_cdisc", "t_cond", "dia", 1.25, .3, [DX, 3.37, DZ], axis="y")
dots = []
for rr_, nn in ((.45, 6), (.8, 11), (1.1, 16)): dots += [[rr_ * math.cos(2 * math.pi * i / nn), 0, rr_ * math.sin(2 * math.pi * i / nn)] for i in range(nn)]
box("t_cdots", "t_cond", "grit", [.07], [DX, 3.56, DZ], at=dots, shape="sphere")
COND = ["t_carm", "t_cjoint", "t_cdisc", "t_cdots", "t_cpostcap"]
rotate("t_sweep", "t_cond", COND, [TX + PX, 3.4, PZ], swing=17, freq=.3)
# 研磨液供應：儲液桶＋管＋噴嘴
NX, NZ = TX - 4.0, 3.0
box("t_tank", "t_slu", "tank", [3.4, 4.6, 3.6], [TX - 11.0, 2.3, NZ], bevel=.1)
cyl("t_tankcap", "t_slu", "tankB", 1.1, .3, [TX - 11.0, 4.75, NZ], axis="y")
cyl("t_pipe", "t_slu", "pipe", .24, 7.0, [TX - 7.5, 5.2, NZ], axis="x")
cyl("t_collar", "t_slu", "steelHi", .36, .22, [TX - 9.5, 5.2, NZ], axis="x", at=[[0, 0, 0], [2.4, 0, 0], [4.6, 0, 0]])
box("t_elbow", "t_slu", "pipe", [.6], [NX, 5.2, NZ], shape="sphere") if False else None
cyl("t_elbow", "t_slu", "pipe", .34, .34, [NX, 5.2, NZ], axis="y")
cyl("t_noz", "t_slu", "pipe", .24, 1.8, [NX, 4.4, NZ], axis="y")
cyl("t_noztip", "t_slu", "steelHi", .3, .2, [NX, 3.55, NZ], axis="y")
# 側邊：晶圓盒載入口、控制櫃
box("t_foup", "t_side", "white", [3.0, 3.4, 3.2], [TX + 11.0, 2.0, 3.2], bevel=.1)
box("t_foupd", "t_side", "dark", [2.0, 1.5, .08], [TX + 11.0, 2.2, 4.84])
box("t_fouph", "t_side", "steelHi", [1.6, .2, .5], [TX + 11.0, 3.9, 3.2])
box("t_ctrl", "t_side", "dark2", [3.0, 6.0, 3.4], [TX + 11.0, 3.15, -3.0], bevel=.08)
box("t_ctrlscr", "t_side", "dark", [2.2, 1.6, .08], [TX + 11.0, 4.4, -1.26])
box("t_ctrlled", "t_side", "led", [.8, .1, .04], [TX + 11.0, 3.2, -1.28])
box("t_ctrlvent", "t_side", "steel2", [2.4, .08, .06], [TX + 11.0, 1.2, -1.28], at=[[0, .2 * i, 0] for i in range(6)])
glow("t_ledlit", "t_side", ["t_ctrlled", "t_cabled"], "lp_good", steady=False, g=.9, freq=1.6)
glow("t_hglow", "t_head", ["t_hring"], "lp_proc", steady=True, g=.7)
# 旋轉弧形箭頭、壓力箭頭（流動物只在零件範圍內）
flowx("t_arcP", "t_plat", arc_pts(TX, 0, 5.6, PT + .06, 150, -110, 22), shape="arrow", n=3, size=.26, rate=.35, color="rot", rim="rot", track=True)
flowx("t_arcH", "t_head", arc_pts(TX + HX, 0, 1.55, 4.8, 150, -110, 22), shape="arrow", n=2, size=.2, rate=.45, color="rot", rim="rot", track=True)
flowx("t_pres", "t_head", [[TX + HX, 7.6, 0], [TX + HX, 5.2, 0]], shape="arrow", n=3, size=.3, rate=.9, color="press", rim="press", lanes=2, gap=.5, ldir=(1, 0, 0))
flowx("t_presH", "t_head", [[TX + HX, 4.65, 0], [TX + HX, 3.9, 0]], shape="arrow", n=3, size=.26, rate=.9, color="press", rim="press", lanes=5, gap=.7, ldir=(1, 0, 0))
# 研磨液：管內連續液體帶 → 噴嘴滴下 → 被墊帶往研磨頭（弧線）
flowx("t_slPipe", "t_slu", [[TX - 11.0, 5.2, NZ], [NX, 5.2, NZ], [NX, 3.5, NZ]], shape="liquid", n=5, size=.2, rate=.8, color="slurry", rim="slurryRim", band=.12, bandO=.55)
flowx("t_slDrop", "t_slu", [[NX, 3.52, NZ], [NX, 3.24, NZ]], shape="liquid", n=3, size=.18, rate=1.0, color="slurry", rim="slurryRim", band=.1, bandO=.55)
flowx("t_slPad", "t_plat", spiral(TX, 0, 5.0, 3.3, PT + .05, 143, 15, 26), shape="liquid", n=6, size=.2, rate=.4, color="slurry", rim="slurryRim", band=.2, bandO=.5)
flowx("t_slGrit", "t_plat", spiral(TX, 0, 5.0, 3.3, PT + .1, 143, 15, 26), shape="grit", n=10, size=.12, rate=.4, color="grit", rim="gritRim", rimO=.9)
# 碎屑：從晶圓下被帶向盤緣；鑽石碟掃過處往外飛
flowx("t_flk", "t_plat", [[TX + 3.2, PT + .12, 1.2], [TX + 4.6, PT + .15, 3.2], [TX + 5.6, PT + .12, 3.8]], shape="flake", n=5, size=.13, rate=.45, color="flake", rim="flakeRim", rimO=.8)
flowx("t_flkC", "t_plat", [[DX, PT + .15, DZ], [DX - 1.8, PT + .15, DZ - 1.6], [DX - 2.6, PT + .12, DZ - 2.3]], shape="flake", n=5, size=.12, rate=.5, color="flake", rim="flakeRim", lanes=3, gap=.6, ldir=(1, 0, -1))
anchor("t_head", "t_head", [TX + HX + 2.1, 4.4, 1.2], dx=150, dy=-90)
anchor("t_plat", "t_plat", [TX - 5.8, PT, 1.6], dx=-150, dy=60)
anchor("t_pad", "t_plat", [TX + 0.5, PT, 4.6], dx=140, dy=100)
anchor("t_noz", "t_slu", [NX - .3, 4.4, NZ + .2], dx=-150, dy=-70)
anchor("t_tank", "t_slu", [TX - 11.0 - 1.2, 4.0, NZ + 1.8], dx=-130, dy=-30)
anchor("t_cond", "t_cond", [DX - 1.2, 3.5, DZ + .6], dx=-150, dy=30)
anchor("t_body", "t_body", [TX + 7.0, 1.4, 7.5], dx=130, dy=60)
anchor("t_cdisc", "t_cond", [DX + .9, 3.5, DZ - .5], dx=130, dy=-110)

# ═════════ H：研磨頭爆炸剖析 x=60（由下而上：墊、晶圓、固定環、橡膠膜、頭體、轉軸） ═════════
HXX = 60
cyl("h_pad", "h_pad", "padB", 3.7, .5, [HXX, .25, 0], axis="y")
for i, rr_ in enumerate((1.2, 2.2, 3.2)): tube(f"h_gr{i}", "h_pad", "padG", rr_ + .07, rr_ - .07, .05, [HXX, .53, 0], axis="y")
# 晶圓（正面朝下）：圓盤＋缺口；上面（背面）是素面
cyl("h_wf", "h_wf", "wafer" if "m_wafer" in materials else "siTop", 2.0, .12, [HXX, .6, 0], axis="y")
box("h_wfnotch", "h_wf", "dark", [.3, .13, .3], [HXX + 1.95, .6, 0])
cyl("h_wfring", "h_wf", "steelHi", 2.0, .02, [HXX, .67, 0], axis="y")
# 固定環
tube("h_ring", "h_rg", "steel2", 2.75, 2.15, .55, [HXX, 1.0, 0], axis="y")
cyl("h_ringb", "h_rg", "steelHi", .12, .1, [HXX, 1.3, 0], axis="y", at=ring_pts(16, 2.45))
# 橡膠膜（分區同心環＋氣孔）
cyl("h_mem", "h_mem", "membrane", 2.15, .1, [HXX, .95, 0], axis="y")
for i, rr_ in enumerate((.9, 1.5, 2.05)): tube(f"h_zone{i}", "h_mem", "memC", rr_ + .08, rr_ - .08, .05, [HXX, 1.02, 0], axis="y")
cyl("h_memport", "h_mem", "dark", .06, .05, [HXX, 1.03, 0], axis="y", at=[[1.2 * math.cos(2 * math.pi * i / 6), 0, 1.2 * math.sin(2 * math.pi * i / 6)] for i in range(6)])
# 頭體（有氣孔通道）
cyl("h_body", "h_body", "steel", 2.7, .8, [HXX, 1.5, 0], axis="y")
cyl("h_bodyb", "h_body", "steelHi", .13, .1, [HXX, 1.95, 0], axis="y", at=ring_pts(14, 2.3))
cyl("h_airp", "h_body", "dark", .12, .06, [HXX, 1.93, 0], axis="y", at=[[1.0 * math.cos(2 * math.pi * i / 3), 0, 1.0 * math.sin(2 * math.pi * i / 3)] for i in range(3)])
# 轉軸＋接頭
cyl("h_hub", "h_shaft", "dark", 1.0, .5, [HXX, 2.2, 0], axis="y")
cyl("h_shaft", "h_shaft", "steelHi", .6, 2.4, [HXX, 3.6, 0], axis="y")
cyl("h_union", "h_shaft", "steel2", .85, .3, [HXX, 4.6, 0], axis="y")
box("h_hose", "h_shaft", "pipeB", [.3, .3, 2.0], [HXX + 1.2, 4.7, 1.0], rot=None)
# 爆炸後座標（y 位移）：晶圓 +0.9、固定環 +2.2、橡膠膜 +3.5、頭體 +5.0、轉軸 +6.6（script shift 對應）
HD = {"h_wf": 0.9, "h_rg": 2.2, "h_mem": 3.5, "h_body": 5.0, "h_shaft": 6.6}
# 氣壓箭頭：氣從轉軸接頭進頭體氣室、膜被往下推（箭頭畫在頭體與轉軸範圍內）
flowx("h_air", "h_body", [[HXX + 1.2, 6.6 + 4.7, 1.0], [HXX + 1.2, 6.6 + 4.7, 1.0]], free=True) if False else None
flowx("h_pres", "h_mem", [[HXX, 3.5 + 1.1, 0], [HXX, 3.5 + .9, 0]], shape="arrow", n=1, size=.1) if False else None

flowx("h_air", "h_shaft", [[HXX + 1.2, 4.7, 2.0], [HXX + 1.2, 4.7, .1], [HXX + .15, 4.7, .1]], shape="arrow", n=3, size=.22, rate=.8, color="press", rim="press")
flowx("h_presB", "h_body", [[HXX, 1.82, 0], [HXX, 1.2, 0]], shape="arrow", n=2, lanes=5, gap=.8, ldir=(1, 0, 0), size=.26, rate=.8, color="press", rim="press")
flowx("h_presM", "h_mem", [[HXX, 1.15, 0], [HXX, .85, 0]], shape="arrow", n=2, lanes=5, gap=.8, ldir=(1, 0, 0), size=.24, rate=.8, color="press", rim="press")
anchor("h_shaft", "h_shaft", [HXX + .6, 4.8 + HD["h_shaft"] - 1.0, 0], dx=150, dy=-30)
anchor("h_body", "h_body", [HXX + 2.4, 1.5, 0], dx=150, dy=-20)
anchor("h_mem", "h_mem", [HXX + 2.1, .95, 0], dx=150, dy=0)
anchor("h_ring", "h_rg", [HXX + 2.6, 1.0, 0], dx=150, dy=20)
anchor("h_wf", "h_wf", [HXX + 1.9, .6, 0], dx=150, dy=30)
anchor("h_pad", "h_pad", [HXX + 3.4, .3, 0], dx=150, dy=60)

# ═════════ W：晶圓表面近景 x=120（凹凸膜→磨平；墊、研磨液、磨粒、藥劑、碎屑） ═════════
WX = 120
BW, FW, TW, D, FH = 10.4, 3.6, 2.4, 4.0, 3.4
FT = 1.0 + FH; SKIN = .45; FLAT = FT + SKIN        # 4.4 / 4.85
box("w_base", "w_si", "siB", [BW, 1.0, D], [WX, .5, 0], bevel=.03)
box("w_fin", "w_si", "siF", [FW, FH, D], [WX, 2.7, 0], at=[[-3.0, 0, 0], [3.0, 0, 0]], bevel=.03)
pts = [[-4.75 + .5 * i, y, 0] for i in range(20) for y in (.28, .72)]
for fx in (-3.0, 3.0): pts += [[fx - 1.5 + .5 * i + .25, 1.3 + .5 * j, 0] for i in range(7) for j in range(6)]
box("w_lat", "w_si", "latt", [.11], [WX, 0, D / 2 + .02], at=pts, shape="sphere")
box("w_fill", "w_film", "bump", [TW, FH, D], [WX, 2.7, 0])
box("w_fillo", "w_film", "bump", [.4, FH, D], [WX, 2.7, 0], at=[[-5.0, 0, 0], [5.0, 0, 0]])
box("w_skin", "w_film", "bump", [BW, SKIN, D], [WX, FT + SKIN / 2, 0])
box("w_b1", "w_b1", "bump", [3.6, 1.0, D], [WX, FLAT + .5, 0], at=[[-3.0, 0, 0], [3.0, 0, 0]], bevel=.04)
box("w_b2", "w_b2", "bump", [3.6, .45, D], [WX, FLAT + .225, 0], at=[[-3.0, 0, 0], [3.0, 0, 0]], bevel=.03)
glow("w_softlit", "w_b1", ["w_b1"], "lp_proc", steady=False, g=.55, freq=1.8)
# 凸起頂端被藥劑軟化的亮面（薄片貼在頂面）
box("w_soft1", "w_soft", "soft", [3.5, .05, D - .1], [WX, FLAT + 1.03, 0], at=[[-3.0, 0, 0], [3.0, 0, 0]])
# 曝光焦平面（s2 用）與光束空間
box("w_focus", "w_foc", "focusPl", [BW + 2.4, .06, D + 1.4], [WX, FLAT + .03, 0])
box("w_lightbox", "w_lite", "lightBox", [BW + 1.0, 7.6, D + .6], [WX, FLAT + 4.3, 0])
box("w_litelens", "w_lite", "steel", [BW + 1.4, .4, D + .8], [WX, FLAT + 8.3, 0], bevel=.05)
# 研磨墊（上方、底面有凸點）＋研磨液層
box("w_pad", "w_pad", "padB", [BW + 1.8, 1.0, D + 1.2], [WX, 8.2, 0], bevel=.05)
box("w_padgr", "w_pad", "padG", [.18, .06, D + 1.2], [WX, 8.72, 0], at=[[-4.2 + 1.4 * i, 0, 0] for i in range(7)])
box("w_asp", "w_pad", "padHi", [.34], [WX, 7.62, 0], at=[[-4.6 + 1.15 * i, 0, -1.2 + 1.2 * j] for i in range(9) for j in range(3)], shape="sphere")
box("w_slbox", "w_slr", "slurryBox", [BW + 1.2, 1.7, D + .4], [WX, 6.62, 0])
VIB = ["w_pad", "w_padgr", "w_asp"]
vib("w_slide", "w_pad", VIB, [1, 0, 0], .45, .7)
# 流動物
flowx("w_grit", "w_slr", [[WX - 5.4, 6.1, 0], [WX + 5.4, 6.1, 0]], shape="grit", n=7, lanes=3, gap=1.0, ldir=(0, 0, 1), size=.2, rate=.3, color="grit", rim="gritRim", rimO=.9)
flowx("w_mol", "w_slr", [[WX - 3.0, 7.3, 0], [WX - 3.0, 6.0, 0]], shape="mol", n=3, lanes=5, gap=1.5, ldir=(1, 0, 0), size=.28, rate=.55, color="mol", rim="mol2")
flowx("w_liq", "w_slr", [[WX - 5.6, 6.9, 0], [WX + 5.6, 6.9, 0]], shape="liquid", n=6, lanes=2, gap=1.2, ldir=(0, 0, 1), size=.2, rate=.35, color="slurry", rim="slurryRim", band=.1, bandO=.4)
flowx("w_flk", "w_slr", [[WX - 3.0, 6.1, 0], [WX - 1.6, 6.6, 0], [WX + .6, 7.0, 0]], shape="flake", n=4, lanes=3, gap=1.2, ldir=(0, 0, 1), size=.16, rate=.4, color="flake", rim="flakeRim")
flowx("w_flk2", "w_slr", [[WX + 3.0, 6.1, 0], [WX + 4.4, 6.5, 0], [WX + 5.4, 7.0, 0]], shape="flake", n=4, lanes=3, gap=1.2, ldir=(0, 0, 1), size=.16, rate=.4, color="flake", rim="flakeRim")
flowx("w_pres", "w_pad", [[WX, 8.65, 0], [WX, 7.85, 0]], shape="arrow", n=2, lanes=5, gap=2.0, ldir=(1, 0, 0), size=.36, rate=.8, color="press", rim="press")
# 光束：從透鏡往下聚到焦平面（凸起頂端在焦平面之上，失焦）
for i, x in enumerate((-4.2, -2.1, 0.0, 2.1, 4.2)):
    flowx(f"w_ray{i}", "w_lite", [[WX + x, FLAT + 8.0, 0], [WX + x * .5, FLAT + .3, 0]], shape="dot", n=3, lanes=3, gap=1.2, ldir=(0, 0, 1), size=.16, rate=.9, color="uv", rim="uvRim", trail=3)
glow("w_bumpbad", "w_b1", ["w_b1"], "lp_bad", steady=False, g=.85, freq=2.2)
anchor("w_b1", "w_b1", [WX + 3.0, FLAT + 1.0, 2.0], dx=150, dy=-60)
anchor("w_dip", "w_film", [WX, FLAT, 2.0], dx=-130, dy=-120)
anchor("w_pad", "w_pad", [WX + 5.9, 8.2, 1.4], dx=140, dy=-30)
anchor("w_grit", "w_slr", [WX + 5.8, 6.6, 1.4], dx=140, dy=20)
anchor("w_lens", "w_lite", [WX + 6.0, FLAT + 8.3, 1.0], dx=140, dy=-20)
anchor("w_focus", "w_lite", [WX - 6.2, FLAT, 2.0], dx=-140, dy=-60)
anchor("w_si", "w_si", [WX + 5.0, .6, 2.0], dx=140, dy=40)

model = {
 "name": "tech-cmp：化學機械研磨。站別：T 機台 x=0、H 研磨頭爆炸剖析 x=60、W 晶圓表面近景 x=120。",
 "unit": "示意，非實際比例", "size": {"w": 14, "h": 2, "r": .1, "t": 6},
 "palette": palette, "materials": materials, "layers": layers, "anchors": anchors,
 "parts": parts, "actions": actions,
 "pose": {"yaw0": 0, "yawIso": 0, "drift": 0},
 "camera": {"stand": {"d": 24, "elev": 24, "y": 4}},
 "fx": {"dpr": 1, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
}
json.dump(model, open("/home/user/ai-mp4/videos/tech-cmp/model.json", "w"), ensure_ascii=False, indent=1)
print("parts", len(parts), "layers", len(layers), "actions", len(actions))
