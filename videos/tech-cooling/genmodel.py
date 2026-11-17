# 產生 videos/tech-cooling/model.json（改這支再重產）。座標：x 右、y 上、z 朝觀眾；各站以 x 偏移分開，鏡頭切換。
# H x=0 機櫃風冷對照｜P x=60 兩個杯子｜C x=120 主機板與冷板｜K x=180 冷板剖開｜R x=240 機櫃背面＋分歧管＋CDU＋乾冷器｜Q x=300 快接頭特寫
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
materials = {
 "dark": M("dark", rough=.5, metal=.2), "dark2": M("dark2", rough=.35, metal=.3), "steel": M("steel", rough=.3, metal=.85, env=.5), "steel2": M("steel2", rough=.35, metal=.8),
 "steelHi": M("steelHi", rough=.25, metal=.8, env=.7), "cu": M("cu", rough=.3, metal=.9, env=.6), "cuHi": M("cuHi", rough=.25, metal=.9, env=.8), "cuDk": M("cuDk", rough=.4, metal=.8),
 "orange": M("orange", rough=.35, metal=.35), "dram": M("dram", rough=.35), "dram2": M("dram2", rough=.35), "si": M("si", rough=.35, metal=.35, env=.5), "siTop": M("siTop", rough=.3, metal=.4, env=.6),
 "pcbG": M("pcbG", rough=.6), "paste": M("paste", rough=.7), "brass": M("brass", rough=.3, metal=.9, env=.7), "oring": M("oring", rough=.6), "white": M("white", rough=.55),
 "slot": {"kind": "unlit", "color": "slot"}, "led": {"kind": "unlit", "color": "led"}, "cube": M("cube", rough=.4, metal=.1),
 "glass": G("glass", .22), "qglass": G("steelHi", .34, metal=.2), "qglass2": G("steel2", .4, metal=.2), "glassHot": G("hotR", .0), "waterFill": G("waterB", .55, rough=.05), "airFill": G("airB", .16),
 "lid": G("glass", .26), "hotcloud": {"kind": "unlit", "color": "cloud", "opacity": .22}, "cdwin": G("glass", .12),
 "pipeB": M("pipeB", rough=.35, metal=.4), "pipeR": M("pipeR", rough=.35, metal=.4), "hxB": M("waterBd", rough=.3, metal=.7, env=.6), "hxR": M("hotR", rough=.3, metal=.7, env=.6), "traces": M("siTop", rough=.3, metal=.5, tex="traces", texScale=.5, env=.7), "trace": M("pcbG", rough=.55, tex="traces", texScale=.35), "gold": M("brass", rough=.25, metal=.95, env=.8), "rubber": M("slot", rough=.8), "lidM": M("steel", rough=.3, metal=.85, env=.6),
 "waterIn": {"kind": "unlit", "color": "waterB", "opacity": .5}, "cable": M("cableCu", rough=.3, metal=.9),
 "hv": {"kind": "unlit", "color": "lp_heat", "opacity": .5}, "dash": {"kind": "unlit", "color": "dashC"},
}
materials = {"m_" + k: v for k, v in materials.items()}

# ── 風扇：外框＋輪轂＋3 片葉片，回傳 (葉片 id 清單, 各葉片轉軸)
FANS = {}
def fan(pre, cx, cy, cz, r, axis, lay):
    """軸流風扇：方框外殼（四角螺絲）＋圓形導風圈＋輪轂與頂蓋＋7 片葉片（各自傾斜）；回傳 (葉片 id, 轉軸, 軸向)"""
    ids = []; piv = {}
    NB = 7
    if axis == "z": rr, rot, ax = [0, 0, 0], None, [0, 0, 1]
    elif axis == "y": rr, rot, ax = [0, 0, 0], [90, 0, 0], [0, 1, 0]
    else: rr, rot, ax = [0, 0, 0], [0, 90, 0], [1, 0, 0]
    def P(u, v, w):  # 風扇座標（u、v 在風扇面內，w 沿軸向）→ 世界偏移
        return {"z": [u, v, w], "y": [u, w, -v], "x": [w, v, u]}[axis]
    def pos(u, v, w): o = P(u, v, w); return [cx + o[0], cy + o[1], cz + o[2]]
    box(f"{pre}_frame", lay, "dark2", [r * 2 + .34, r * 2 + .34, .26], pos(0, 0, 0), rot=rot, shape="ring", r=.12, wall=.17, bevel=.02)
    tube(f"{pre}_ring", lay, "steel2", r + .02, r - .06, .3, pos(0, 0, 0), axis={"z": "z", "y": "y", "x": "x"}[axis])
    for k, (u, v) in enumerate(((1, 1), (-1, 1), (1, -1), (-1, -1))):
        cyl(f"{pre}_scr{k}", lay, "steelHi", .07, .08, pos(u * (r + .08), v * (r + .08), .14), axis=axis)
    cyl(f"{pre}_hub", lay, "dark2", r * .3, .22, pos(0, 0, 0), axis=axis)
    cyl(f"{pre}_cap", lay, "steel2", r * .2, .06, pos(0, 0, .13), axis=axis)
    cyl(f"{pre}_mot", lay, "dark", r * .22, .3, pos(0, 0, -.24), axis=axis)
    for k in range(NB):
        a = 360.0 / NB * k
        if axis == "z": bx, brot = [r * .9, r * .36, .035], [0, 0, a]
        elif axis == "y": bx, brot = [r * .9, .035, r * .36], [0, a, 0]
        else: bx, brot = [.035, r * .36, r * .9], [a, 0, 0]
        # 葉片沿半徑方向：先放在輪轂外側，轉軸在風扇中心
        import math as _m
        ang = _m.radians(a); off = r * .62
        if axis == "z": c = pos(off * _m.cos(ang), off * _m.sin(ang), .02)
        elif axis == "y": c = pos(off * _m.cos(ang), off * _m.sin(ang), .02)
        else: c = pos(off * _m.cos(ang), off * _m.sin(ang), .02)
        if axis == "z": brot = [0, 0, a]
        elif axis == "y": brot = [0, a, 0]
        else: brot = [-a, 0, 0]
        ids.append(box(f"{pre}_b{k}", lay + "_bl", "steelHi", bx, c, rot=brot, bevel=.01))
    for i in ids: piv[i] = [cx, cy, cz]
    return ids, piv, ax
def fan_group(key, lay, items, rps=3):
    ids = []; piv = {}; ax = None
    for it in items:
        a, p, ax = fan(*it, lay)
        ids += a; piv.update(p)
    actions[key] = {"type": "rotate", "parts": ids, "axis": ax, "pivots": piv, "rps": rps, "rampSpin": True, "layer": lay + "_bl"}
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

# ═════════ H：機櫃風冷對照 ═════════
HX0 = 0
box("rk_body", "rk", "dark", [5.6, 8.6, 3.2], [HX0, 4.3, 0])
box("rk_top", "rk", "dark2", [5.7, .16, 3.3], [HX0, 8.68, 0])
box("rk_base", "rk", "dark2", [5.7, .3, 3.3], [HX0, .15, 0])
FY = [1.5 + 1.9 * k for k in range(4)]
fl = []
for c, fx in enumerate((-1.45, 1.45)):
    for k, fy in enumerate(FY): fl.append((f"hf{c}{k}", HX0 + fx, fy, 1.64, .82, "z"))
fan_group("h_fans", "hfan", fl, rps=3.2)
box("rk_led", "rk_led", "led", [.5, .14, .04], [HX0, 1.0, 1.64], at=[[0, k * .95, 0] for k in range(8)])
box("rk_grill", "rk", "slot", [5.0, .1, .04], [HX0, 8.2, 1.62])
glow("h_body", "rk", ["rk_body", "rk_top"], "lp_heat", steady=True, g=.55)
glow("h_leds", "rk_led", ["rk_led"], "lp_bad", steady=False, g=1.0, freq=2.8)
box("rk_cloud", "cloud", "hotcloud", [5.4, 1.4, 3.0], [HX0, 9.5, 0])
# 氣流：風扇吹出只推一小段（藍），熱氣從頂與背面往上冒（橘）
for c, fx in enumerate((-1.45, 1.45)):
    flow(f"h_air{c}", "hfan_bl", [[HX0 + fx, FY[0], 2.2], [HX0 + fx, FY[0], 4.4]], n=3, lanes=4, gap=1.9, ldir=(0, 1, 0), size=.1, rate=.9, color="lp_sig", rim="lp_sigRim")
flow("h_hot", "rk", [[HX0 - 1.8, 8.9, -.2], [HX0 - 1.6, 12.6, .3]], n=4, lanes=5, gap=.9, ldir=(1, 0, 0), size=.14, rate=.55, color="lp_heat", rim="lp_heat")
flow("h_hotb", "rk", [[HX0, 2.0, -1.8], [HX0, 2.2, -5.0]], n=3, lanes=4, gap=1.7, ldir=(0, 1, 0), size=.13, rate=.5, color="lp_heat", rim="lp_heat")
anchor("rk", "rk", [HX0 + 2.8, 6.0, 1.6], dx=130, dy=-60)
anchor("rk_top", "rk", [HX0 + 0.6, 8.7, 0.8], dx=150, dy=60)
# 銅排（s9）
box("rk_bus", "bus", "cable", [.3, 8.2, .22], [HX0 + 3.15, 4.3, 0])
box("rk_bus2", "bus", "cable", [.3, 8.2, .22], [HX0 - 3.15, 4.3, 0])
glow("h_bus", "bus", ["rk_bus", "rk_bus2"], "lp_proc", steady=False, g=.9, freq=2.5)

# ═════════ P：兩個杯子 ═════════
PX = 60; CX = (-2.7, 2.7)
for side, cx in zip("ab", CX):
    cyl(f"cup_{side}", f"cup_{side}", "glass", 1.45, 3.6, [PX + cx, 1.9, 0], axis="y")
    cyl(f"cup_{side}_base", f"cup_{side}", "steel2", 1.55, .16, [PX + cx, .08, 0], axis="y")
cyl("cup_a_air", "cup_a_air", "airFill", 1.36, 2.8, [PX + CX[0], 1.6, 0], axis="y")
cyl("cup_b_water", "cup_b_w", "waterFill", 1.36, 2.8, [PX + CX[1], 1.6, 0], axis="y")
CB = .5
box("cube_a0", "cube_a0", "cube", [CB, CB, CB], [PX + CX[0], .5, 0], rot=[0, 20, 0])
for j in range(3):
    pts = [(-.36, -.36), (.36, -.36), (-.36, .36), (.36, .36)]
    box(f"cube_b{j}", f"cube_b{j}", "cube", [CB, CB, CB], [PX + CX[1], .52 + j * .52, 0], at=[[x, 0, z] for x, z in pts])
glow("p_air", "cup_a_air", ["cup_a_air"], "lp_bad", steady=True, g=.85)
glow("p_wat", "cup_b_w", ["cup_b_water"], "lp_warm", steady=True, g=.5)
anchor("cup_a", "cup_a", [PX + CX[0] - 1.45, 2.8, 0], dx=-120, dy=-60)
anchor("cup_b", "cup_b", [PX + CX[1] + 1.45, 2.8, 0], dx=120, dy=-60)

# ═════════ C：主機板＋GPU＋冷板 ═════════
CXX = 120
parts_lib = []
parts_lib.append({"part": "pcb", "id": "bd", "pos": [CXX, 0, 0], "w": 12.4, "d": 9.4, "t": .3, "pads": False})
parts_lib.append({"part": "substrate", "id": "gp", "pos": [CXX, .3, 0], "w": 4.2, "d": 4.2, "t": .2, "pads": True, "caps": True})
box("c_trace", "c_pcbx", "trace", [12.2, .012, 9.2], [CXX, .306, 0])
box("c_slot", "c_pcbx", "dark2", [7.6, .42, .55], [CXX - 1.0, .51, 4.15])
box("c_slotg", "c_pcbx", "gold", [.06, .02, .42], [CXX - 4.6, .73, 4.15], at=[[.2 * i, 0, 0] for i in range(38)])
box("c_pwr", "c_pcbx", "dark", [1.4, .55, .9], [CXX + 5.0, .58, 3.5], at=[[0, 0, 0], [0, 0, -1.2]])
cyl("c_hole", "c_pcbx", "steelHi", .24, .05, [CXX, .33, 0], axis="y", at=[[-5.6, 0, -4.2], [5.6, 0, -4.2], [-5.6, 0, 4.2 - .9], [5.6, 0, 3.0 - .9]])
box("c_res", "c_pcbx", "dark", [.22, .1, .12], [CXX - 3.2, .36, 0], at=[[.34 * i, 0, .24 * j] for i in range(6) for j in range(-8, 9, 4)])
box("c_lab", "c_pcbx", "white", [1.4, .012, .5], [CXX - 4.5, .312, -3.4])
box("c_bga", "c_pcbx", "gold", [.12, .02, .12], [CXX, .525, 0], at=[[.42 * i - 1.6, 0, .42 * j - 1.7] for i in range(8) for j in range(9) if (i < 1 or i > 6 or j < 1 or j > 7)])
parts_lib.append({"part": "die", "id": "gd", "pos": [CXX, .5, 0], "w": 2.2, "d": 2.5, "t": .3, "bumps": False})
box("c_hbm", "c_hbm", "dram", [.9, .26, 1.05], [CXX, .63, 0], at=[[-1.55, 0, -.7], [-1.55, 0, .7], [1.55, 0, -.7], [1.55, 0, .7]])
# 電源元件（電感、功率晶片、電容）
box("c_ind", "c_vrm", "dark2", [.62, .4, .62], [CXX + 4.6, .5, 0], at=[[0, 0, z] for z in (-3.0, -2.2, -1.4, -.6, .2, 1.0, 1.8, 2.6)], bevel=.04)
box("c_mos", "c_vrm", "slot", [.5, .12, .4], [CXX + 5.4, .36, 0], at=[[0, 0, z] for z in (-3.0, -2.2, -1.4, -.6, .2, 1.0, 1.8, 2.6)])
cyl("c_cap", "c_vrm", "steelHi", .2, .45, [CXX + 3.4, .52, 0], axis="y", at=[[0, 0, z] for z in (-3.0, -2.2, -1.4, -.6, .2, 1.0, 1.8, 2.6)])
box("c_mem", "c_vrm", "dark2", [1.0, .16, .7], [CXX - 4.5, .38, 0], at=[[0, 0, z] for z in (-3.0, -1.8, -.6, .6, 1.8, 3.0)])
glow("c_vrmhot", "c_vrm", ["c_ind", "c_mos", "c_mem"], "lp_heat", steady=False, g=.8, freq=2.6)
glow("c_die", "gd", ["gd_body"], "lp_heat", steady=True, g=.9)
# 原來的散熱片（底板＋14 片鰭＋兩支熱管）
box("hs_base", "hs", "steel", [4.4, .3, 4.4], [CXX, .95, 0])
box("hs_fin", "hs", "steelHi", [.1, 1.7, 4.0], [CXX, 1.95, 0], at=[[-2.0 + .31 * i, 0, 0] for i in range(14)])
cyl("hs_pipe", "hs", "cu", .14, 4.0, [CXX, 1.3, 0], axis="x", at=[[0, 0, -1.0], [0, 0, 1.0]])
# 導熱膏
box("c_paste", "paste", "paste", [2.2, .04, 2.5], [CXX, .82, 0])
# 冷板（銅）：本體、蓋、兩個接口、四顆彈簧螺絲
CPY = .86
box("cp_body", "cp", "cu", [3.8, .6, 3.8], [CXX, CPY + .3, 0], bevel=.03)
box("cp_lid", "cp", "cuDk", [3.4, .12, 3.4], [CXX, CPY + .66, 0])
box("cp_ribs", "cp", "cuHi", [.1, .08, 3.0], [CXX, CPY + .74, 0], at=[[-1.3 + .26 * i, 0, 0] for i in range(11)])
cyl("cp_pin", "cp", "steelHi", .24, .72, [CXX - .95, CPY + 1.1, -1.3], axis="y")
cyl("cp_pout", "cp", "steelHi", .24, .72, [CXX + .95, CPY + 1.1, -1.3], axis="y")
for i, (sx, sz) in enumerate(((-1.7, -1.7), (1.7, -1.7), (-1.7, 1.7), (1.7, 1.7))):
    cyl(f"cp_scr{i}", "cp", "steelHi", .17, .5, [CXX + sx, CPY + .85, sz], axis="y")
    tube(f"cp_spr{i}", "cp", "steel2", .26, .19, .2, [CXX + sx, CPY + .62, sz], axis="y")
# 水管：藍進（接 pin）、紅出（接 pout），從冷板往後方升起
cyl("hose_in_v", "hose", "pipeB", .17, 1.7, [CXX - .95, CPY + 1.95, -1.3], axis="y")
cyl("hose_in_h", "hose", "pipeB", .17, 3.4, [CXX - .95, CPY + 2.8, -3.0], axis="z")
cyl("hose_out_v", "hose", "pipeR", .17, 1.7, [CXX + .95, CPY + 1.95, -1.3], axis="y")
cyl("hose_out_h", "hose", "pipeR", .17, 3.4, [CXX + .95, CPY + 2.8, -3.0], axis="z")
flow("c_win", "hose", [[CXX - .95, CPY + 2.8, -4.6], [CXX - .95, CPY + 2.8, -1.4], [CXX - .95, CPY + .9, -1.3]], n=3, size=.12, rate=.8)
flow("c_wout", "hose", [[CXX + .95, CPY + .9, -1.3], [CXX + .95, CPY + 2.8, -1.4], [CXX + .95, CPY + 2.8, -4.6]], n=3, size=.12, rate=.8, color="lp_bad", rim="lp_bad")
# 小風扇（朝電源元件吹）＋氣流
fan_group("c_fan", "cfan", [("cf0", CXX + 8.4, 1.4, 0, 1.0, "x")], rps=3.6)
box("cf_stand", "cfan", "dark2", [.4, 2.8, 2.4], [CXX + 8.9, 1.4, 0])
flow("c_air", "cfan_bl", [[CXX + 7.7, 1.2, 0], [CXX + 5.0, 1.0, 0]], n=4, lanes=5, gap=.55, ldir=(0, 0, 1), size=.1, rate=1.2, color="lp_sig", rim="lp_sigRim")
flow("c_hotair", "c_vrm", [[CXX + 4.6, 1.3, -1.8], [CXX + 4.6, 3.8, -1.6]], n=4, lanes=5, gap=.9, ldir=(0, 0, 1), size=.12, rate=.6, color="lp_heat", rim="lp_heat")
anchor("c_gpu", "gd", [CXX + 1.1, .85, 1.2], dx=130, dy=-70)
anchor("c_hs", "hs", [CXX + 2.2, 1.9, 2.0], dx=130, dy=-90)
anchor("c_cp", "cp", [CXX + 1.9, CPY + .4, 1.9], dx=130, dy=-70)
anchor("c_vrm", "c_vrm", [CXX + 5.0, .7, 2.6], dx=130, dy=-60)

# ═════════ K：冷板（爆炸剖析→蓋子移走、看水流） ═════════
KX = 180
box("k_die", "k_die", "si", [3.4, .5, 3.4], [KX, .25, 0], bevel=.03)
box("k_ckt", "k_die", "traces", [3.0, .05, 3.0], [KX, .525, 0])
box("k_bump", "k_die", "gold", [.1, .04, .1], [KX, .0, 0], at=[[-1.4 + .35 * i, 0, -1.4 + .35 * j] for i in range(9) for j in range(9)])
box("k_paste", "k_paste", "paste", [3.4, .05, 3.4], [KX, .56, 0])
box("k_base", "k_base", "cu", [8.6, .6, 7.2], [KX, .9, 0], bevel=.04)
NW = 25
WALLZ = [-2.88 + .24 * k for k in range(NW)]
box("k_wall", "k_wall", "cuHi", [6.0, 1.0, .1], [KX, 1.7, 0], at=[[0, 0, z] for z in WALLZ])
box("k_fw", "k_frame", "cuDk", [8.6, 1.0, .3], [KX, 1.7, 3.45], at=[[0, 0, 0], [0, 0, -6.9]])
box("k_ew", "k_frame", "cuDk", [.3, 1.0, 7.2], [KX, 1.7, 0], at=[[-4.15, 0, 0], [4.15, 0, 0]])
cyl("k_bolt0", "k_frame", "steelHi", .16, .1, [KX, 2.2, 0], axis="y", at=[[x, 0, z] for x in (-3.9, -1.3, 1.3, 3.9) for z in (-3.3, 3.3)])
box("k_oring", "k_oring", "oring", [8.1, 6.7, .1], [KX, 2.28, 0], rot=[90, 0, 0], shape="ring", r=.3, wall=.14)
box("k_lid", "k_lid", "lidM", [8.6, .28, 7.2], [KX, 2.5, 0], bevel=.05)
cyl("k_lbolt", "k_lid", "steelHi", .2, .14, [KX, 2.72, 0], axis="y", at=[[x, 0, z] for x in (-3.9, -1.3, 1.3, 3.9) for z in (-3.3, 3.3)])
box("k_lrib", "k_lid", "steel2", [8.0, .1, .16], [KX, 2.68, 0], at=[[0, 0, z] for z in (-2.4, 0, 2.4)])
tube("k_pin", "k_pipe", "pipeB", .55, .4, 2.6, [KX - 5.6, 1.7, 0], axis="x")
tube("k_pout", "k_pipe", "pipeR", .55, .4, 2.6, [KX + 5.6, 1.7, 0], axis="x")
tube("k_pinc", "k_pipe", "steelHi", .72, .5, .32, [KX - 4.4, 1.7, 0], axis="x")
tube("k_poutc", "k_pipe", "steelHi", .72, .5, .32, [KX + 4.4, 1.7, 0], axis="x")
box("k_pnut", "k_pipe", "steel2", [.4, 1.5, 1.5], [KX, 1.7, 0], at=[[-6.5, 0, 0], [6.5, 0, 0]], rot=None)
# 水流：藍→琥珀→紅（三段），24 條通道各一排光點；進出管各一道
for nm, x0, x1, c in (("k_f1", -4.0, -1.35, "lp_sig"), ("k_f2", -1.45, 1.45, "lp_warm"), ("k_f3", 1.35, 4.0, "lp_bad")):
    flow(nm, "k_water", [[KX + x0, 1.62, 0], [KX + x1, 1.62, 0]], n=3, lanes=24, gap=.24, ldir=(0, 0, 1), size=.065, rate=1.1, color=c, rim=c, trail=3)
flow("k_fin", "k_water", [[KX - 7.6, 1.7, 0], [KX - 4.4, 1.7, 0]], n=3, size=.2, rate=.9, color="lp_sig", rim="lp_sigRim")
flow("k_fout", "k_water", [[KX + 4.4, 1.7, 0], [KX + 7.6, 1.7, 0]], n=3, size=.2, rate=.9, color="lp_bad", rim="lp_bad")
glow("k_diehot", "k_die", ["k_die"], "lp_heat", steady=True, g=1.0)
glow("k_basehot", "k_base", ["k_base"], "lp_heat", steady=False, g=.7, freq=1.6)
actions["k_heat"] = {"preset": "heat-spread", "layer": "k_die", "from": {"layer": "k_die", "p": [KX, .56, 0]}, "dir": [0, 1, 0], "reach": 1.8, "count": 3, "r0": .6, "spread": .5, "rate": .7}
anchor("k_die", "k_die", [KX + 1.7, .3, 1.7], dx=150, dy=60)
anchor("k_paste", "k_paste", [KX + 1.7, .56, 1.7], dx=150, dy=-10)
anchor("k_basea", "k_base", [KX + 4.3, .9, 1.5], dx=140, dy=-30)
anchor("k_wall", "k_wall", [KX - 3.0, 1.9, 3.0], dx=-150, dy=-60)
anchor("k_lid", "k_lid", [KX + 4.3, 2.5, 2.4], dx=130, dy=-100)
anchor("k_orng", "k_oring", [KX - 4.0, 2.28, 1.0], dx=-150, dy=-60)
anchor("k_in", "k_pipe", [KX - 6.9, 2.0, 0], dx=-120, dy=-90)
anchor("k_out", "k_pipe", [KX + 6.9, 2.0, 0], dx=120, dy=-90)

# ═════════ R：機櫃背面＋分歧管＋CDU＋乾冷器 ═════════
RX = 240
TY = [1.0 + 1.25 * k for k in range(6)]
for i, (sx, sz) in enumerate(((-2.8, -1.5), (2.8, -1.5), (-2.8, 1.4), (2.8, 1.4))):
    box(f"r_post{i}", "r_rack", "dark2", [.22, 8.6, .22], [RX + sx, 4.3, sz])
box("r_top", "r_rack", "dark2", [5.8, .16, 3.2], [RX, 8.68, 0])
box("r_base", "r_rack", "dark2", [5.8, .2, 3.2], [RX, .1, 0])
box("r_tray", "r_tray", "steel", [5.2, .9, 2.7], [RX, 0, -.2], at=[[0, t, 0] for t in TY])
box("r_trayf", "r_tray", "dark", [4.6, .5, .05], [RX, 0, 1.17], at=[[0, t, 0] for t in TY])
box("r_trayled", "r_tray", "led", [.12, .12, .04], [RX - 1.6, 0, 1.19], at=[[k * .3, t, 0] for t in TY for k in range(5)])
cyl("r_manB", "r_man", "pipeB", .26, 7.6, [RX - 2.45, 4.35, 1.55], axis="y")
cyl("r_manR", "r_man", "pipeR", .26, 7.2, [RX + 2.45, 4.6, 1.55], axis="y")
cyl("r_brB", "r_br", "pipeB", .13, .95, [RX - 1.97, 0, 1.55], axis="x", at=[[0, t + .1, 0] for t in TY])
cyl("r_brR", "r_br", "pipeR", .13, .95, [RX + 1.97, 0, 1.55], axis="x", at=[[0, t + .1, 0] for t in TY])
cyl("r_qdB", "r_qd", "steelHi", .24, .5, [RX - 1.5, 0, 1.45], axis="z", at=[[0, t + .1, 0] for t in TY])
cyl("r_qdR", "r_qd", "steelHi", .24, .5, [RX + 1.5, 0, 1.45], axis="z", at=[[0, t + .1, 0] for t in TY])
cyl("r_qdBc", "r_qd", "pipeB", .3, .12, [RX - 1.5, 0, 1.72], axis="z", at=[[0, t + .1, 0] for t in TY])
cyl("r_qdRc", "r_qd", "pipeR", .3, .12, [RX + 1.5, 0, 1.72], axis="z", at=[[0, t + .1, 0] for t in TY])
# CDU
CDX = RX + 9.8
box("u_body", "u_cdu", "dark2", [4.8, 8.2, .14], [CDX, 4.1, -1.2])
box("u_side", "u_cdu", "dark2", [.14, 8.2, 3.2], [CDX + 2.4, 4.1, .4])
box("u_sideL", "u_cdu", "dark2", [.14, 8.2, 3.2], [CDX - 2.4, 4.1, .4])
box("u_top", "u_cdu", "dark2", [4.9, .16, 3.3], [CDX, 8.24, .4])
box("u_base", "u_cdu", "dark2", [4.9, .22, 3.3], [CDX, .11, .4])
box("u_rail", "u_cdu", "steel2", [4.6, .12, .12], [CDX, 0, 1.95], at=[[0, y, 0] for y in (.9, 3.1, 5.0, 7.0)])
box("u_vent", "u_cdu", "slot", [.9, .08, .06], [CDX + 1.5, 0, -1.12], at=[[0, 7.6 - .22 * i, 0] for i in range(6)])
box("u_plate", "u_cdu", "steelHi", [1.6, .5, .05], [CDX + 1.5, 7.2, 1.97])
# 板式熱交換器：14 片板（藍紅交替、每片一層，爆炸時可散開）＋外框、墊片
HXPL = [-1.3 + .2 * i for i in range(14)]
for i, x in enumerate(HXPL):
    box(f"u_pl{i}", f"u_pl{i}", "hxR" if i % 2 else "hxB", [.1, 3.6, 2.2], [CDX + x, 4.4, .4], bevel=.01)
    box(f"u_plg{i}", f"u_pl{i}", "rubber", [.12, 3.7, .06], [CDX + x, 4.4, 1.5])
box("u_hxTop", "u_hxf", "steel", [3.2, .14, 2.4], [CDX, 6.3, .4], bevel=.02); box("u_hxBot", "u_hxf", "steel", [3.2, .14, 2.4], [CDX, 2.5, .4], bevel=.02)
cyl("u_hxbolt", "u_hxf", "steelHi", .1, 3.8, [CDX, 4.4, .4], axis="y", at=[[-1.55, 0, -.9], [1.55, 0, -.9], [-1.55, 0, 1.7], [1.55, 0, 1.7]])
# 幫浦：泵殼＋馬達＋葉輪
cyl("u_pump", "u_pump", "steel", .85, .8, [CDX - .2, 1.3, .6], axis="z")
cyl("u_motor", "u_pump", "dark", .55, .9, [CDX - .2, 1.3, 1.5], axis="z")
cyl("u_pctr", "u_pump", "steelHi", .16, .1, [CDX - .2, 1.3, 1.02], axis="z")
imp = [box(f"u_imp{k}", "u_impl", "cuHi", [1.2, .16, .08], [CDX - .2, 1.3, .98], rot=[0, 0, 36 * k]) for k in range(5)]
actions["u_impl"] = {"type": "rotate", "parts": imp, "axis": [0, 0, 1], "pivots": {i: [CDX - .2, 1.3, .98] for i in imp}, "rps": 3.4, "rampSpin": True, "layer": "u_impl"}
# 一次側管路（機櫃迴路）：紅進（上）、藍出（下）；二次側管路（機房冷卻水）
PZ = 1.0
cyl("p_redTop", "p_pipe", "pipeR", .26, CDX - 1.0 - (RX + 2.45), [(CDX - 1.0 + RX + 2.45) / 2, 7.9, 1.55], axis="x")
cyl("p_redDn", "p_pipe", "pipeR", .26, 1.7, [CDX - 1.0, 7.05, 1.55], axis="y")
cyl("p_manR2", "p_pipe", "pipeR", .26, .5, [RX + 2.45, 7.95, 1.55], axis="y")
cyl("p_blueBot", "p_pipe", "pipeB", .26, (CDX - 1.0) - (RX - 2.45), [(CDX - 1.0 + RX - 2.45) / 2, .45, 1.55], axis="x")
cyl("p_blueUp", "p_pipe", "pipeB", .26, 2.1, [CDX - 1.0, 1.5, 1.55], axis="y")
# 二次側（右）：暖水往乾冷器、冷水回來
DCX = RX + 21.0
cyl("q_hotOut", "p_pipe2", "pipeR", .26, DCX - 1.0 - (CDX + 2.4), [(DCX - 1.0 + CDX + 2.4) / 2, 6.0, 1.55], axis="x")
cyl("q_hotDn", "p_pipe2", "pipeR", .26, 4.2, [DCX - 1.0, 4.0, 1.55], axis="y")
cyl("q_coldIn", "p_pipe2", "pipeB", .26, DCX + 1.0 - (CDX + 2.4), [(DCX + 1.0 + CDX + 2.4) / 2, .6, 1.55], axis="x")
cyl("q_coldUp", "p_pipe2", "pipeB", .26, 1.6, [DCX + 1.0, 1.4, 1.55], axis="y")
cyl("q_hxIn", "p_pipe", "pipeB", .26, 1.5, [CDX + 1.6, 1.3, 1.55], axis="y")
cyl("q_hxOut", "p_pipe", "pipeR", .26, 2.2, [CDX + 1.6, 4.9, 1.55], axis="y")
# 乾冷器：機身＋盤管鰭片＋3 顆風扇
box("d_body", "d_dc", "dark", [5.4, 1.8, 3.2], [DCX, .9, 0])
box("d_fin", "d_dc", "steelHi", [.08, 1.2, 2.8], [DCX, .9, 0], at=[[-2.4 + .24 * i, 0, 0] for i in range(21)])
fan_group("d_fans", "dfan", [(f"df{i}", DCX + dx, 1.84, 0, .78, "y") for i, dx in enumerate((-1.8, 0, 1.8))], rps=3)
box("d_cloud", "dcl", "hotcloud", [5.0, 2.6, 2.8], [DCX, 3.5, 0])
# 迴路上的光點：primary（機櫃迴路）
flow("r_f_bb", "r_flow", [[CDX - 1.0, .45, 1.55], [RX - 2.45, .45, 1.55]], n=4, size=.22, rate=.8, color="lp_sig", rim="lp_sigRim")
flow("r_f_bu", "r_flow", [[RX - 2.45, .5, 1.55], [RX - 2.45, 7.9, 1.55]], n=5, size=.22, rate=.8, color="lp_sig", rim="lp_sigRim")
flow("r_f_br", "r_flow", [[RX - 2.4, 1.1, 1.55], [RX - 1.5, 1.1, 1.55], [RX - 1.5, 1.1, 1.2]], n=3, lanes=6, gap=1.25, ldir=(0, 1, 0), size=.2, rate=.9, color="lp_sig", rim="lp_sigRim")
flow("r_f_rr", "r_flow", [[RX + 1.5, 1.1, 1.2], [RX + 1.5, 1.1, 1.55], [RX + 2.4, 1.1, 1.55]], n=3, lanes=6, gap=1.25, ldir=(0, 1, 0), size=.2, rate=.9, color="lp_bad", rim="lp_bad")
flow("r_f_ru", "r_flow", [[RX + 2.45, 1.0, 1.55], [RX + 2.45, 7.9, 1.55]], n=5, size=.22, rate=.8, color="lp_bad", rim="lp_bad")
flow("r_f_rt", "r_flow", [[RX + 2.45, 7.9, 1.55], [CDX - 1.0, 7.9, 1.55], [CDX - 1.0, 6.3, 1.0]], n=5, size=.22, rate=.8, color="lp_bad", rim="lp_bad")
# 熱交換器內：熱側由上往下（紅→暖→藍），冷側由下往上（藍→暖→紅），逆向
HYX = CDX
for nm, y0, y1, c in (("u_h1", 6.0, 5.0, "lp_bad"), ("u_h2", 5.0, 3.8, "lp_warm"), ("u_h3", 3.8, 2.7, "lp_sig")):
    flow(nm, "u_flow", [[HYX, y0, 1.1], [HYX, y1, 1.1]], n=3, lanes=7, gap=.38, ldir=(1, 0, 0), size=.08, rate=1.0, color=c, rim=c)
for nm, y0, y1, c in (("u_c1", 2.7, 3.8, "lp_sig"), ("u_c2", 3.8, 5.0, "lp_warm"), ("u_c3", 5.0, 6.0, "lp_bad")):
    flow(nm, "u_flow", [[HYX, y0, -.3], [HYX, y1, -.3]], n=3, lanes=7, gap=.38, ldir=(1, 0, 0), size=.08, rate=1.0, color=c, rim=c)
flow("u_out", "u_flow", [[CDX - 1.0, 2.5, 1.55], [CDX - 1.0, .45, 1.55]], n=3, size=.14, rate=.9, color="lp_sig", rim="lp_sigRim")
# secondary
flow("q_f1", "q_flow", [[CDX + 1.6, 1.0, 1.55], [CDX + 1.6, 5.2, 1.55]], n=3, size=.14, rate=.8, color="lp_sig", rim="lp_sigRim")
flow("q_f2", "q_flow", [[CDX + 2.4, 6.0, 1.55], [DCX - 1.0, 6.0, 1.55], [DCX - 1.0, 2.0, 1.55]], n=5, size=.14, rate=.8, color="lp_bad", rim="lp_bad")
flow("q_f3", "q_flow", [[DCX + 1.0, 1.6, 1.55], [DCX + 1.0, .6, 1.55], [CDX + 2.4, .6, 1.55], [CDX + 1.6, .6, 1.55]], n=5, size=.14, rate=.8, color="lp_sig", rim="lp_sigRim")
flow("d_air", "dfan_bl", [[DCX - 1.8, 2.4, 0], [DCX - 1.8, 4.6, 0]], n=3, lanes=3, gap=1.8, ldir=(1, 0, 0), size=.1, rate=.9, color="lp_heat", rim="lp_heat")
glow("u_hot", "u_pl1", ["u_pl1"], "lp_bad", steady=False, g=.5, freq=1.4)
anchor("r_hot", "r_man", [RX + 2.8, 5.5, 1.7], dx=150, dy=-40)
anchor("r_br", "r_br", [RX - 2.0, 4.6, 1.7], dx=-150, dy=-60)
anchor("r_man", "r_man", [RX - 2.8, 6.0, 1.7], dx=-150, dy=-40)
anchor("r_qd", "r_qd", [RX - 1.5, 4.3, 1.75], dx=-120, dy=-110)
anchor("u_cdu", "u_cdu", [CDX + 2.4, 6.6, 1.0], dx=130, dy=-60)
anchor("u_hx", "u_hxf", [CDX + 1.6, 6.3, 1.4], dx=130, dy=-60)
anchor("u_pump", "u_pump", [CDX - 1.0, 1.0, 1.6], dx=-140, dy=60)
anchor("d_dc", "d_dc", [DCX + 2.7, 1.2, 1.6], dx=100, dy=-90)

# ═════════ Q：快接頭特寫 ═════════
QX = 300; QY = 3.0
# 母端（左）：外套、後壁、閥芯、彈簧（5 圈，每圈各一層，才拉得開）、水
tube("qf_body", "qf", "qglass", 1.06, .88, 2.8, [QX - 1.0, QY, 0], axis="x")
tube("qf_ring", "qf", "steel2", 1.18, 1.0, .3, [QX - 2.2, QY, 0], axis="x")
cyl("qf_back", "qf", "steel2", .9, .16, [QX - 2.32, QY, 0], axis="x")
cyl("qf_pop", "qf_pop", "brass", .52, .3, [QX - 1.55, QY, 0], axis="x")
cyl("qf_stem", "qf_pop", "brass", .12, .9, [QX - 1.9, QY, 0], axis="x")
for i in range(5): tube(f"qf_sp{i}", f"qf_sp{i}", "steel", .34, .28, .06, [QX - 2.1 + .14 * i, QY, 0], axis="x")
cyl("qf_w", "qf_w", "waterIn", .7, .8, [QX - 2.7, QY, 0], axis="x")
cyl("qf_hose", "qf_hose", "pipeB", .5, 2.2, [QX - 3.6, QY, 0], axis="x")
cyl("qf_hosew", "qf_hose", "waterIn", .36, 2.2, [QX - 3.6, QY, 0], axis="x")
# 公端（右）：本體、插入的鼻端、領環、閥芯、彈簧、水
tube("qm_nose", "qm", "qglass2", .78, .62, 3.2, [QX + .8, QY, 0], axis="x")
tube("qm_collar", "qm", "steel2", 1.12, .66, .32, [QX + .55, QY, 0], axis="x")
tube("qm_body", "qm", "qglass", .98, .62, 1.5, [QX + 2.3, QY, 0], axis="x")
cyl("qm_back", "qm", "steel2", .62, .16, [QX + 3.0, QY, 0], axis="x")
cyl("qm_pop", "qm_pop", "brass", .46, .3, [QX + .5, QY, 0], axis="x")
cyl("qm_stem", "qm_pop", "brass", .12, .9, [QX + 1.0, QY, 0], axis="x")
for i in range(5): tube(f"qm_sp{i}", f"qm_sp{i}", "steel", .3, .24, .06, [QX + 1.1 + .14 * i, QY, 0], axis="x")
cyl("qm_w", "qm_w", "waterIn", .56, 1.0, [QX + 2.4, QY, 0], axis="x")
cyl("qm_hose", "qm_hose", "pipeB", .5, 2.2, [QX + 4.2, QY, 0], axis="x")
cyl("qm_hosew", "qm_hose", "waterIn", .36, 2.2, [QX + 4.2, QY, 0], axis="x")
tube("q_oring", "qf", "oring", .88, .78, .1, [QX - .1, QY, 0], axis="x")
cyl("q_mid", "q_mid", "waterIn", .56, 1.8, [QX - .6, QY, 0], axis="x")
flow("q_flowc", "q_mid", [[QX - 5.0, QY, 0], [QX + 5.0, QY, 0]], n=4, lanes=3, gap=.28, ldir=(0, 1, 0), size=.12, rate=1.0, color="lp_sig", rim="lp_sigRim")
anchor("q_pop", "qf_pop", [QX - 1.55, QY + .6, .5], dx=-130, dy=-90)
anchor("q_spring", "qm_sp0", [QX + 1.2, QY + .45, .4], dx=130, dy=-90)
anchor("q_body", "qf", [QX - 1.6, QY + 1.1, 0.4], dx=-150, dy=-80)
anchor("q_or", "qf", [QX - .1, QY + 1.0, 0], dx=0, dy=-120)

model = {
 "name": "tech-cooling：液冷。零件用基本形狀＋庫的 pcb／substrate／die（genmodel.py 產生）。站別：H 機櫃風冷 x=0、P 杯子 x=60、C 主機板 x=120、K 冷板剖開 x=180、R 機櫃背面＋CDU＋乾冷器 x=240、Q 快接頭特寫 x=300。",
 "unit": "示意，非實際比例", "size": {"w": 14, "h": 2, "r": .1, "t": 6},
 "palette": palette, "materials": materials, "layers": layers, "anchors": anchors,
 "parts": parts_lib + parts, "actions": actions,
 "pose": {"yaw0": 0, "yawIso": 0, "drift": 0},
 "camera": {"stand": {"d": 24, "elev": 24, "y": 4}},
 "fx": {"dpr": 1, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
}
json.dump(model, open("/home/user/ai-mp4/videos/tech-cooling/model.json", "w"), ensure_ascii=False, indent=1)
print("parts", len(parts), "layers", len(layers), "actions", len(actions))
