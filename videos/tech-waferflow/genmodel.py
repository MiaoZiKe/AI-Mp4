# 產生 videos/tech-waferflow/model.json（改這支再重產）。座標：x 右、y 上、z 朝觀眾。
# W x=0 晶圓（開場）｜S x=60 晶圓剖面方塊＋各步驟設備（沉積／塗光阻／曝光／顯影／蝕刻／去光阻／離子佈植）｜C x=120 CMP 研磨機｜K x=180 一層一層疊上去
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
def cyl(pid, lay, mat, r, h, pos, axis="y", at=None):
    rot = {"y": [90, 0, 0], "x": [0, 90, 0], "z": None}[axis]
    return box(pid, lay, mat, [r, h], pos, at=at, rot=rot, shape="cyl")
def tube(pid, lay, mat, ro, ri, ln, pos, axis="x"):
    rot = {"y": [90, 0, 0], "x": [0, 90, 0], "z": None}[axis]
    return box(pid, lay, mat, [ro, ri, ln], pos, rot=rot, shape="tube")
def anchor(name, lay, p, dx=100, dy=-80): anchors[name] = {"layer": lay, "p": [R(v) for v in p], "dx": dx, "dy": dy}

palette = {"dark": "#3F4E6B", "dark2": "#2E3340", "steel": "#9AA8BE", "steel2": "#7D8AA1", "steelHi": "#C5D0E2", "cu": "#C98A3E", "cuHi": "#E8A45E", "cuDk": "#9C6A2C",
 "silicon": "#7F93B4", "siTop": "#CBD4E4", "white": "#F6F2E8", "slot": "#2A2E3B", "brass": "#D6B25E",
 "oxide": "#9CCBE6", "metalL": "#E0A03A", "resist": "#8A63D2", "dope": "#2BAE8E", "beamL": "#FFE066", "reticleG": "#BCD3EA", "chrome": "#2B2F3C",
 "pod": "#EFEBDF", "plasma": "#B06CFF", "pad": "#6E7C96", "padG": "#4F5B72", "tankB": "#2F7FE0", "tankR": "#D8432C", "slurry": "#F3F0E6", "diamond": "#E9C45A", "waterB": "#5CC8FF",
 "wafer": "#9FB3D1", "die": "#5E7FB0",
 "lp_heat": "#FF7A2F", "lp_bad": "#E0472F", "lp_sig": "#38B6FF", "lp_sigRim": "#1F6FEB", "lp_proc": "#FF9F1C", "lp_good": "#14A38B", "lp_warm": "#FFB020",
 "lp_ion": "#7A4DFF", "lp_ionRim": "#4B2BD0", "lp_ox": "#5BB6E8", "lp_mt": "#F0A030", "lp_res": "#A07CF0", "lp_light": "#FFC800", "lp_slur": "#FFFFFF"}
def M(color, **k): return {"kind": "std", "color": color, "rough": 0.45, "metal": 0.1, **k}
materials = {
 "dark": M("dark", rough=.5, metal=.2), "dark2": M("dark2", rough=.35, metal=.3), "steel": M("steel", rough=.3, metal=.85, env=.5), "steel2": M("steel2", rough=.35, metal=.8),
 "steelHi": M("steelHi", rough=.25, metal=.8, env=.7), "cu": M("cu", rough=.3, metal=.9, env=.6), "cuHi": M("cuHi", rough=.25, metal=.9, env=.8),
 "silicon": M("silicon", rough=.35, metal=.35, env=.5), "oxide": M("oxide", rough=.25, metal=.15, env=.6), "metalL": M("metalL", rough=.28, metal=.9, env=.7),
 "resist": M("resist", rough=.45, metal=.05), "dope": M("dope", rough=.4, metal=.1), "reticleG": M("reticleG", rough=.15, metal=.2, env=.6), "chrome": M("chrome", rough=.35, metal=.5),
 "pod": M("pod", rough=.5), "pad": M("pad", rough=.8), "padG": M("padG", rough=.9), "tankB": M("tankB", rough=.4, metal=.3), "tankR": M("tankR", rough=.4, metal=.3), "white": M("white", rough=.55),
 "diamond": M("diamond", rough=.2, metal=.9, env=.8), "brass": M("brass", rough=.3, metal=.9, env=.7), "slurry": M("slurry", rough=.6), "slot": {"kind": "unlit", "color": "slot"},
 "wafer": M("wafer", rough=.25, metal=.5, env=.7), "die": M("die", rough=.3, metal=.3),
 "beam": {"kind": "unlit", "color": "beamL", "opacity": .34}, "beamW": {"kind": "unlit", "color": "beamL", "opacity": .12},
 "plasmaV": {"kind": "unlit", "color": "plasma", "opacity": .26},
}
materials = {"m_" + k: v for k, v in materials.items()}

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
def rotate(key, lay, ps, pivot, axis=(0, 1, 0), rps=.5):
    layer(lay)
    actions[key] = {"type": "rotate", "parts": ps, "axis": list(axis), "pivots": {i: pivot for i in ps}, "rps": rps, "rampSpin": True, "layer": lay}

parts_lib = []
# ═════════ W：晶圓（開場，x=0）═════════
parts_lib.append({"part": "wafer", "id": "wf", "pos": [0, 0, 0], "r": 4.6, "t": .1, "step": .58, "bad": 0})
rotate("w_spin", "wf", ["wf_body", "wf_dies"], [0, .05, 0], rps=.12)
anchor("w_wafer", "wf", [3.2, .1, 3.2], dx=140, dy=-60)

# ═════════ S：晶圓剖面方塊（x=60）═════════
SX = 60
LN = [-5.4 + 1.8 * k for k in range(7)]      # 7 條線（受保護處）
GP = [-4.5 + 1.8 * k for k in range(6)]      # 6 個縫（被曝光／被蝕刻處）
YS = 1.4; YO = YS + .35; YM = YO + .3; YR = YM + .4   # 各層頂面
chk = box("s_chuck", "chuck", "dark2", [6.6, .4], [SX, -.2, 0], shape="cyl", rot=[90, 0, 0])
cyl("s_post", "chuck", "steel2", 1.3, .5, [SX, -.65, 0], axis="y")
mk = [box(f"s_mk{i}", "chuck_mk", "white", [.5, .06, 1.6], [SX + 6.0 * math.cos(math.radians(60 * i)), .02, 6.0 * math.sin(math.radians(60 * i))], rot=[0, -60 * i, 0]) for i in range(6)]
rotate("s_spin", "chuck_mk", mk, [SX, .02, 0], rps=.9)
box("s_sub", "sub", "silicon", [11.8, YS, 5], [SX, YS / 2, 0], bevel=.02)
box("s_dp", "dp", "dope", [.8, .5, 5.06], [SX, YS - .25, 0], at=[[g, 0, 0] for g in GP])
glow("s_dpg", "dp", ["s_dp"], "lp_good", steady=True, g=.7)
box("s_ox", "ox", "oxide", [11.8, .35, 5], [SX, YS + .175, 0])
box("s_mtl", "mt_line", "metalL", [1.0, .3, 5], [SX, YO + .15, 0], at=[[x, 0, 0] for x in LN])
box("s_mtg", "mt_gap", "metalL", [.8, .3, 5], [SX, YO + .15, 0], at=[[x, 0, 0] for x in GP])
box("s_rsl", "rs_line", "resist", [1.0, .4, 5], [SX, YM + .2, 0], at=[[x, 0, 0] for x in LN])
box("s_rsg", "rs_gap", "resist", [.8, .4, 5], [SX, YM + .2, 0], at=[[x, 0, 0] for x in GP])
glow("s_rsx", "rs_gap", ["s_rsg"], "lp_proc", steady=True, g=1.0)
# 標名用錨點（爆炸時跟著各層移動）
anchor("a_sub", "sub", [SX + 5.9, YS * .5, 2.5], dx=150, dy=40)
anchor("a_ox", "ox", [SX + 5.9, YS + .17, 2.5], dx=150, dy=-5)
anchor("a_mt", "mt_line", [SX + 5.4, YO + .15, 2.5], dx=150, dy=-45)
anchor("a_rs", "rs_line", [SX + 5.4, YM + .2, 2.5], dx=150, dy=-85)
anchor("a_dp", "dp", [SX + 4.5, YS - .25, 2.55], dx=150, dy=60)
anchor("a_gap", "rs_gap", [SX - 4.5, YM + .4, 2.5], dx=-150, dy=-70)
anchor("a_mtgap", "mt_line", [SX - 4.9, YO + .3, 2.5], dx=-150, dy=-60)
anchor("a_mtl", "mt_line", [SX - 5.4, YO + .3, 2.5], dx=-150, dy=-20)

# 沉積：蓮蓬頭（氣體往下噴）
box("d_plen", "t_dep", "dark2", [11.2, .9, 4.8], [SX, 6.4, 0], bevel=.05)
box("d_plate", "t_dep", "steelHi", [11.0, .3, 4.6], [SX, 5.75, 0], bevel=.03)
cyl("d_tip", "t_dep", "steel2", .11, .4, [SX, 5.4, 0], axis="y", at=[[x, 0, z] for x in [-4.8 + 1.2 * i for i in range(9)] for z in (-1.6, 0, 1.6)])
cyl("d_feed", "t_dep", "steel", .45, 1.6, [SX, 7.7, 0], axis="y")
cyl("d_flange", "t_dep", "steelHi", .8, .25, [SX, 8.6, 0], axis="y")
cyl("d_side", "t_dep", "steel2", .22, 7.0, [SX + 3.3, 7.8, 0], axis="x")
cyl("d_sidev", "t_dep", "steel2", .22, 1.6, [SX + 6.8, 7.0, 0], axis="y")
for nm, y1, c, rim in (("d_ox", 1.45, "lp_ox", "lp_ox"), ("d_mt", 1.8, "lp_mt", "lp_mt")):
    for zi, z in enumerate((1.5, -1.2)):
        flow(f"{nm}{zi}", "t_dep_f", [[SX, 5.2, z], [SX, y1, z]], n=3, lanes=9, gap=1.2, ldir=(1, 0, 0), size=.12, rate=1.0, color=c, rim=rim)
anchor("d_head", "t_dep", [SX + 5.4, 6.0, 2.4], dx=140, dy=-60)

# 塗光阻：噴嘴滴下
cyl("r_noz", "t_res", "steelHi", .32, 1.5, [SX, 5.9, 0], axis="y")
cyl("r_tip", "t_res", "steel2", .14, .7, [SX, 5.0, 0], axis="y")
box("r_arm", "t_res", "dark2", [7.4, .55, .7], [SX + 3.9, 6.5, 0], bevel=.04)
cyl("r_col", "t_res", "steel", .55, 4.2, [SX + 7.8, 4.4, 0], axis="y")
cyl("r_bot", "t_res", "resist", .5, .9, [SX + 7.2, 7.4, 0], axis="y")
flow("r_drip", "t_res_f", [[SX, 4.6, 0], [SX, 2.6, 0]], n=4, size=.2, rate=.8, color="lp_res", rim="lp_res")
anchor("r_nozzle", "t_res", [SX + .3, 5.6, .5], dx=150, dy=-60)

# 曝光：光源→光罩→鏡頭→光線穿過縫隙
YR_ = 6.9
box("e_lamp", "t_exp", "dark2", [10.4, 1.8, 5.0], [SX, 9.9, 0], bevel=.06)
box("e_cond", "t_exp", "reticleG", [11.6, .5, 5.2], [SX, 8.7, 0], bevel=.05)
box("e_lampled", "t_exp", "brass", [1.2, .3, 1.0], [SX, 9.1, 0], at=[[x, 0, 0] for x in (-4, -2, 0, 2, 4)])
box("e_ret", "t_exp", "reticleG", [13.0, .18, 5.6], [SX, YR_, 0], bevel=.02)
box("e_cr", "t_exp", "chrome", [1.0, .22, 5.6], [SX, YR_ + .2, 0], at=[[x, 0, 0] for x in LN])
box("e_rail", "t_exp", "steel2", [14.6, .32, .9], [SX, YR_ - .05, 0], at=[[0, 0, -3.3], [0, 0, 3.3]], bevel=.03)
box("e_endb", "t_exp", "dark2", [1.0, 1.2, 7.4], [SX, YR_ - .05, 0], at=[[-7.8, 0, 0], [7.8, 0, 0]], bevel=.04)
cyl("e_post", "t_exp", "dark2", .35, 5.4, [SX, 4.4, 0], axis="y", at=[[x, 0, z] for x in (-7.8, 7.8) for z in (-3.3, 3.3)])
for i, y in enumerate((4.3, 4.9, 5.5)):
    tube(f"e_lens{i}", "t_exp", "steelHi", 7.0, 6.5, .55, [SX, y, 0], axis="y")
tube("e_lensb", "t_exp", "brass", 7.04, 6.9, .08, [SX, 4.9, 0], axis="y")
box("e_shaft", "t_exp_l", "beam", [.8, YR_ - 2.5 - .2, 5.0], [SX, (YR_ - .2 + 2.5) / 2, 0], at=[[g, 0, 0] for g in GP])
box("e_wide", "t_exp_w", "beamW", [12.0, 8.4 - YR_ - .4, 5.2], [SX, (8.4 + YR_ + .4) / 2, 0])
flow("e_ray", "t_exp_f", [[SX, YR_ - .4, 0], [SX, 2.6, 0]], n=4, lanes=6, gap=1.8, ldir=(1, 0, 0), size=.13, rate=1.6, color="lp_light", rim="lp_light")
flow("e_rayw", "t_exp_f", [[SX, 8.4, 0], [SX, YR_ + .5, 0]], n=3, lanes=9, gap=1.3, ldir=(1, 0, 0), size=.11, rate=1.2, color="lp_light", rim="lp_light")
glow("e_lampg", "t_exp", ["e_lampled"], "lp_light", steady=False, g=1.0, freq=3.0)
# 光罩盒（家登）：放在光罩台旁
box("e_pod", "t_pod", "pod", [3.2, 1.5, 3.2], [SX + 11.8, YR_ + .4, 0], bevel=.12)
box("e_podh", "t_pod", "dark2", [1.4, .35, 1.0], [SX + 11.8, YR_ + 1.4, 0], bevel=.08)
box("e_podl", "t_pod", "steel2", [.3, .5, 3.3], [SX + 11.8, YR_ + .4, 0], at=[[-1.1, 0, 0], [1.1, 0, 0]])
box("e_podw", "t_pod", "reticleG", [2.3, .1, 2.3], [SX + 11.8, YR_ - .5, 0])
anchor("e_lensA", "t_exp", [SX + 7.0, 4.9, 0], dx=150, dy=-30)
anchor("e_retA", "t_exp", [SX - 6.4, YR_ + .3, 2.8], dx=-150, dy=-60)
anchor("e_podA", "t_pod", [SX + 12.6, YR_ + .5, 1.6], dx=100, dy=-80)

# 顯影／去光阻：藥水噴桿＋儲液桶（兩套，顏色不同）
def spray(pre, lay, flay, side, tank, fcol, ylab):
    s = 1 if side > 0 else -1
    box(f"{pre}_bar", lay, "steel2", [11.6, .5, 1.0], [SX, 4.9, 0], bevel=.05)
    cyl(f"{pre}_tip", lay, "steelHi", .1, .35, [SX, 4.55, 0], axis="y", at=[[-5.4 + .9 * i, 0, z] for i in range(13) for z in (0,)])
    cyl(f"{pre}_hose", lay, "steel2", .22, 3.6, [SX + s * 7.6, 4.9, 0], axis="x")
    cyl(f"{pre}_hosev", lay, "steel2", .22, 3.4, [SX + s * 9.5, 3.2, 0], axis="y")
    cyl(f"{pre}_tank", lay, tank, 1.25, 3.0, [SX + s * 9.5, 1.5, 0], axis="y")
    tube(f"{pre}_band", lay, "white", 1.3, 1.2, .35, [SX + s * 9.5, 2.1, 0], axis="y")
    flow(f"{pre}_flow", flay, [[SX, 4.4, 0], [SX, 2.6, 0]], n=4, lanes=13, gap=.9, ldir=(1, 0, 0), size=.11, rate=.9, color=fcol, rim=fcol)
    anchor(f"{pre}_A", lay, [SX + s * 9.5, 3.0, 1.2], dx=130 * s, dy=-70)
spray("v", "t_dev", "t_dev_f", +1, "tankB", "waterB", 0)
spray("x", "t_str", "t_str_f", -1, "tankR", "lp_proc", 0)

# 蝕刻：電漿腔（上電極＋電漿＋離子往下打）
box("t_top", "t_etch", "steel", [11.8, .5, 5.2], [SX, 7.2, 0], bevel=.05)
box("t_topp", "t_etch", "steelHi", [11.0, .2, 4.6], [SX, 6.85, 0], bevel=.02)
cyl("t_gas", "t_etch", "steel2", .45, 1.4, [SX, 8.2, 0], axis="y")
cyl("t_gasf", "t_etch", "steelHi", .8, .25, [SX, 9.0, 0], axis="y")
cyl("t_rf", "t_etch", "cu", .2, 5.6, [SX + 3.4, 8.0, 0], axis="x")
box("t_rfbox", "t_etch", "dark2", [1.8, 1.2, 1.4], [SX + 6.5, 8.0, 0], bevel=.06)
cyl("t_post", "t_etch", "dark2", .3, 7.4, [SX, 3.6, 0], axis="y", at=[[x, 0, z] for x in (-6.5, 6.5) for z in (-3.4, 3.4)])
box("t_plasma", "t_etch_p", "plasmaV", [11.4, 3.4, 5.0], [SX, 4.8, 0])
glow("t_plg", "t_etch_p", ["t_plasma"], "lp_ion", steady=False, g=.9, freq=3.2)
for zi, z in enumerate((1.4, -1.2)):
    flow(f"t_ion{zi}", "t_etch_f", [[SX, 6.4, z], [SX, 2.15, z]], n=4, lanes=6, gap=1.8, ldir=(1, 0, 0), size=.13, rate=1.5, color="lp_ion", rim="lp_ionRim")
flow("t_blk", "t_etch_f", [[SX, 6.4, 0], [SX, 2.6, 0]], n=3, lanes=7, gap=1.8, ldir=(1, 0, 0), size=.1, rate=1.3, color="lp_ion", rim="lp_ionRim")
for k, (x, z) in enumerate(((-3.0, 3.1), (3.0, 3.1))):
    cyl(f"t_pi{k}", "t_etch", "steelHi", .12, .5, [SX + x, 6.55, z], axis="y")
anchor("t_plA", "t_etch_p", [SX - 5.7, 4.8, 2.6], dx=-150, dy=-40)
anchor("t_elA", "t_etch", [SX + 5.8, 7.3, 2.6], dx=130, dy=-70)
anchor("t_topA", "t_etch", [SX - 5.6, 7.2, 2.7], dx=-150, dy=-70)

# 離子佈植：離子源＋加速管＋掃描板，離子往下打進矽
box("i_src", "t_imp", "dark2", [3.4, 2.0, 3.4], [SX, 11.9, 0], bevel=.08)
cyl("i_col", "t_imp", "steel", .8, 3.0, [SX, 9.6, 0], axis="y")
for i, y in enumerate((8.4, 9.0, 9.6, 10.2, 10.8)):
    tube(f"i_ring{i}", "t_imp", "steelHi", 1.55, .85, .28, [SX, y, 0], axis="y")
tube("i_mag", "t_imp", "cu", 2.4, 1.0, .8, [SX, 7.5, 0], axis="y")
box("i_scan", "t_imp", "dark2", [12.4, .7, 5.4], [SX, 6.4, 0], bevel=.06)
box("i_plate", "t_imp", "steelHi", [12.0, .12, 5.0], [SX, 5.95, 0])
for zi, z in enumerate((1.4, -1.2)):
    flow(f"i_gap{zi}", "t_imp_f", [[SX, 5.8, z], [SX, 1.0, z]], n=4, lanes=6, gap=1.8, ldir=(1, 0, 0), size=.13, rate=1.5, color="lp_ion", rim="lp_ionRim")
flow("i_line", "t_imp_f", [[SX, 5.8, 0], [SX, 2.15, 0]], n=3, lanes=7, gap=1.8, ldir=(1, 0, 0), size=.11, rate=1.3, color="lp_ion", rim="lp_ionRim")
flow("i_beam", "t_imp_f", [[SX, 11.0, 0], [SX, 7.0, 0]], n=5, size=.22, rate=1.1, color="lp_ion", rim="lp_ionRim")
glow("i_srcg", "t_imp", ["i_src"], "lp_ion", steady=False, g=.6, freq=2.4)
anchor("i_srcA", "t_imp", [SX + 1.7, 12.0, 1.8], dx=130, dy=-30)
anchor("i_colA", "t_imp", [SX + 1.6, 9.6, 1.5], dx=140, dy=-30)
anchor("i_scanA", "t_imp", [SX + 6.2, 6.4, 2.8], dx=130, dy=-60)

# ═════════ C：CMP 研磨機（x=120）═════════
CX = 120
cyl("m_plat", "m_plat", "dark2", 5.7, .7, [CX, .35, 0], axis="y")
cyl("m_pad", "m_plat", "pad", 5.4, .18, [CX, .79, 0], axis="y")
for i, (ro, ri) in enumerate(((1.7, 1.6), (3.1, 3.0), (4.5, 4.4))):
    tube(f"m_g{i}", "m_plat", "padG", ro, ri, .03, [CX, .895, 0], axis="y")
box("m_mk", "m_plat", "white", [.5, .02, 1.0], [CX, .9, 0], at=[[3.2 * math.cos(math.radians(a)), 0, 3.2 * math.sin(math.radians(a))] for a in range(0, 360, 90)])
cyl("m_shaft0", "m_base", "steel2", 1.1, 1.2, [CX, -.6, 0], axis="y")
WCX = CX + 1.9
cyl("m_wafer", "m_head", "wafer", 1.9, .1, [WCX, .98, 0], axis="y")
tube("m_ring", "m_head", "steelHi", 2.25, 1.95, .42, [WCX, 1.25, 0], axis="y")
cyl("m_head", "m_head", "dark", 2.1, 1.1, [WCX, 2.0, 0], axis="y")
cyl("m_cap", "m_head", "steel2", 1.0, .4, [WCX, 2.8, 0], axis="y")
box("m_hmk", "m_head", "white", [.4, .06, .4], [WCX, 2.58, 0], at=[[1.6, 0, 0]])
cyl("m_hshaft", "m_head_s", "steel", .45, 2.6, [WCX, 4.3, 0], axis="y")
box("m_harm", "m_head_s", "dark2", [6.4, .8, 1.3], [WCX + 3.2, 5.9, 0], bevel=.05)
cyl("m_col", "m_head_s", "steel", .95, 6.4, [CX + 7.4, 3.0, 0], axis="y")
rotate("m_padspin", "m_plat", ["m_pad", "m_g0", "m_g1", "m_g2", "m_mk", "m_plat"], [CX, .5, 0], rps=.45)
rotate("m_headspin", "m_head", ["m_wafer", "m_ring", "m_head", "m_cap", "m_hmk"], [WCX, 1.5, 0], rps=.7)
# 研磨液
cyl("m_sl", "m_slurry", "steel2", .14, 3.4, [CX - 5.2, 3.7, 0], axis="x")
cyl("m_slv", "m_slurry", "steel2", .14, 2.9, [CX - 3.5, 2.35, 0], axis="y")
cyl("m_slt", "m_slurry", "slurry", 1.0, 2.6, [CX - 7.0, 1.3, 0], axis="y")
box("m_slb", "m_slurry", "steelHi", [.5, .5, .5], [CX - 3.5, .85, 0], rot=[0, 45, 0])
flow("m_slf", "m_slurry_f", [[CX - 3.5, .85, 0], [CX - 3.4, .93, 0]], n=3, lanes=5, gap=.3, ldir=(0, 0, 1), size=.16, rate=.9, color="lp_slur", rim="lp_slur")
# 修整器：鑽石碟（中砂）
cyl("m_ccol", "m_cond", "steel", .5, 3.6, [CX - 1.0, 1.8, -5.9], axis="y")
box("m_carm", "m_cond", "dark2", [.6, .5, 4.4], [CX - 1.0, 3.3, -3.9], bevel=.04)
cyl("m_cstub", "m_cond", "steel2", .28, 2.0, [CX - 1.0, 2.2, -1.9], axis="y")
cyl("m_disc", "m_cond", "diamond", 1.05, .22, [CX - 1.0, 1.1, -1.9], axis="y")
box("m_grit", "m_cond", "brass", [.1, .06, .1], [CX - 1.0, 1.24, -1.9], at=[[.55 * math.cos(math.radians(a)), 0, .55 * math.sin(math.radians(a))] for a in range(0, 360, 40)])
actions["m_sweep"] = {"type": "vibrate", "parts": ["m_disc", "m_grit", "m_cstub", "m_carm"], "axis": [1, 0, 0], "amp": .9, "freq": .8, "layer": "m_cond"}
anchor("m_padA", "m_plat", [CX + 4.6, .9, 2.8], dx=130, dy=-50)
anchor("m_headA", "m_head", [WCX + 2.2, 2.0, 1.4], dx=130, dy=-60)
anchor("m_slA", "m_slurry", [CX - 7.0, 2.4, 1.0], dx=-130, dy=-50)
anchor("m_discA", "m_cond", [CX - 2.0, 1.1, -1.5], dx=-150, dy=-60)

# ═════════ K：一層一層疊上去（x=180）═════════
KX = 180
box("k_base", "k_base", "silicon", [11.8, 1.0, 5], [KX, .5, 0], bevel=.02)
NK = 12; LY = .36
for k in range(NK):
    y0 = 1.0 + k * LY
    lay = f"k{k}"
    box(f"k{k}_ox", lay, "oxide", [11.8, .2, 5], [KX, y0 + .1, 0])
    if k % 2 == 0:
        box(f"k{k}_mt", lay, "metalL", [1.0, .16, 5], [KX, y0 + .28, 0], at=[[x, 0, 0] for x in LN])
    else:
        box(f"k{k}_mt", lay, "metalL", [11.8, .16, .9], [KX, y0 + .28, 0], at=[[0, 0, z] for z in (-2.0, -.67, .67, 2.0)])
anchor("k_top", "k11", [KX + 5.9, 1.0 + NK * LY - .1, 2.5], dx=150, dy=-30)
anchor("k_bot", "k_base", [KX + 5.9, .5, 2.5], dx=150, dy=40)
anchor("k_mid", "k5", [KX + 5.9, 1.0 + 5.5 * LY, 2.5], dx=150, dy=-5)

model = {
 "name": "tech-waferflow：一片晶圓的流程。零件用基本形狀＋庫的 wafer（genmodel.py 產生）。站別：W 晶圓 x=0、S 剖面方塊與各步驟設備 x=60、C CMP 研磨機 x=120、K 疊層 x=180。",
 "unit": "示意，非實際比例", "size": {"w": 14, "h": 2, "r": .1, "t": 6},
 "palette": palette, "materials": materials, "layers": layers, "anchors": anchors,
 "parts": parts_lib + parts, "actions": actions,
 "pose": {"yaw0": 0, "yawIso": 0, "drift": 0},
 "camera": {"stand": {"d": 24, "elev": 24, "y": 4}},
 "fx": {"dpr": 1, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
}
json.dump(model, open("/home/user/ai-mp4/videos/tech-waferflow/model.json", "w"), ensure_ascii=False, indent=1)
print("parts", len(parts), "layers", len(layers), "actions", len(actions))
