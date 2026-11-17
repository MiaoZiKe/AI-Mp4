# 產生 videos/tech-deposition/model.json（改這支再重產）。座標：x 右、y 上、z 朝觀眾；各站以 x 偏移分開。
# T x=0 沉積機台｜C x=60 反應腔爆炸剖析｜W x=120 CVD 溝槽晶圓｜S x=180 濺鍍腔｜V x=240 兩種鋪法對照｜A x=300 ALD｜E x=360 結尾研磨
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
                "purge": "#8E96A6", "gasA": "#38B6FF", "gasB": "#FF9F1C", "filmG": "#D9A93C", "fill": "#5E8FB0", "magN": "#D8432C", "magS": "#2F7FE0", "pad": "#6E7A92"})
def M(color, **k): return {"kind": "std", "color": color, "rough": 0.45, "metal": 0.1, **k}
materials = {
 "dark": M("dark", rough=.5, metal=.2), "dark2": M("dark2", rough=.35, metal=.3), "steel": M("steel", rough=.3, metal=.85, env=.5), "steel2": M("steel2", rough=.35, metal=.8),
 "steelHi": M("steelHi", rough=.25, metal=.8, env=.7), "si": M("si", rough=.35, metal=.35, env=.5), "siTop": M("siTop", rough=.3, metal=.4, env=.6),
 "white": M("white", rough=.55), "slot": {"kind": "unlit", "color": "slot"}, "led": {"kind": "unlit", "color": "led"}, "gold": M("brass", rough=.25, metal=.95, env=.8),
 "cu": M("cu", rough=.3, metal=.9, env=.6) if False else M("brass", rough=.3, metal=.9, env=.6),
 "film": M("film", rough=.3, metal=.3, env=.6), "film2": M("film2", rough=.3, metal=.3, env=.6), "film3": M("film3", rough=.3, metal=.3, env=.6),
 "layA": M("layA", rough=.3, metal=.2, env=.6), "layB": M("layB", rough=.3, metal=.2, env=.6), "filmG": M("filmG", rough=.25, metal=.9, env=.8), "fill": M("fill", rough=.35, metal=.3, env=.5),
 "magN": M("magN", rough=.4, metal=.3), "magS": M("magS", rough=.4, metal=.3), "pad": M("pad", rough=.5, metal=.5, env=.4),
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

# ═════════ T：沉積機台（叢集式） x=0 ═════════
TX = 0
box("t_floor", "t_body", "dark2", [30, .3, 30], [TX, .15, 0], bevel=.04)
cyl("t_core", "t_body", "steel", 5.0, 2.6, [TX, 1.6, 0], axis="y")
cyl("t_corelid", "t_body", "steelHi", 4.5, .3, [TX, 3.05, 0], axis="y")
ring("t_corering", "t_body", "steel2", 5.15, 4.7, .3, [TX, 2.8, 0])
cyl("t_corebolt", "t_body", "steelHi", .16, .1, [TX, 3.25, 0], axis="y", at=ring_pts(16, 4.8))
# 中央機械手臂（兩節連桿＋手掌，繞中心轉）
cyl("t_armbase", "t_arm", "dark", .9, 1.0, [TX, 3.7, 0], axis="y")
box("t_arm1", "t_arm", "steelHi", [3.4, .32, .7], [TX + 1.5, 4.25, 0], bevel=.04)
box("t_arm2", "t_arm", "steel", [3.2, .28, .6], [TX + 3.0, 4.6, 0], bevel=.04)
cyl("t_armj", "t_arm", "dark", .5, .5, [TX + 3.1, 4.4, 0], axis="y")
box("t_hand", "t_arm", "steelHi", [2.0, .12, 1.6], [TX + 4.4, 4.9, 0], bevel=.03)
wafer_ = {"part": "wafer", "id": "t_wf", "pos": [TX + 4.4, 5.0, 0], "r": .8, "chuck": False, "bad": 0, "step": .3}
actions["t_spin"] = {"type": "rotate", "parts": ["t_arm1", "t_arm2", "t_armj", "t_hand", "t_armbase"], "axis": [0, 1, 0], "pivot": [TX, 4.4, 0], "rps": .06, "rampSpin": True, "layer": "t_arm"}
# 四個製程腔（左右各一在側面，兩個在後）
MODS = [(-9.0, -2.0), (9.0, -2.0), (-5.6, -9.0), (5.6, -9.0)]
for i, (mx, mz) in enumerate(MODS):
    box(f"t_mod{i}", "t_mods", "dark2", [6.2, 3.6, 6.2], [TX + mx, 1.8, mz], bevel=.08)
    box(f"t_modface{i}", "t_mods", "dark", [5.4, 2.6, .12], [TX + mx, 1.9, mz + 3.15 if mz > -5 else mz + 3.15])
    cyl(f"t_modlid{i}", "t_mods", "steelHi", 2.2, .5, [TX + mx, 3.85, mz], axis="y")
    cyl(f"t_modcap{i}", "t_mods", "steel2", 1.2, .3, [TX + mx, 4.25, mz], axis="y")
    cyl(f"t_modgas{i}", "t_mods", "pipeB", .22, 2.2, [TX + mx, 5.3, mz], axis="y")
    box(f"t_modmfc{i}", "t_mods", "dark", [1.1, .9, .9], [TX + mx, 6.2, mz], bevel=.05)
    box(f"t_modled{i}", "t_mods", "led", [.9, .1, .04], [TX + mx - 1.6, 3.2, mz + 3.18] if True else [0, 0, 0])
    ax = math.atan2(mz, mx)
    # 閘門（連到中央傳送腔）
    gx = TX + mx * .62; gz = mz * .62
    box(f"t_slit{i}", "t_mods", "steel2", [2.4, 1.6, 2.4], [gx, 1.5, gz], bevel=.06)
box("t_efem", "t_front", "steel", [15, 4.6, 2.8], [TX, 2.3, 9.8], bevel=.08)
box("t_efemwin", "t_front", "dark", [6.0, 1.6, .1], [TX, 3.0, 11.25])
box("t_efemled", "t_front", "led", [.8, .1, .04], [TX + 6.0, 4.0, 11.25])
for i, sx in enumerate((-4.2, 4.2)):
    box(f"t_foup{i}", "t_front", "white", [3.0, 3.6, 3.2], [TX + sx, 2.4, 13.4], bevel=.1)
    box(f"t_foupd{i}", "t_front", "dark", [2.0, 1.6, .08], [TX + sx, 2.6, 15.04])
    box(f"t_fouph{i}", "t_front", "steelHi", [1.6, .2, .5], [TX + sx, 4.4, 13.4])
box("t_ll", "t_front", "steel2", [3.4, 1.8, 3.0], [TX, 1.5, 6.8], at=[[-2.3, 0, 0], [2.3, 0, 0]], bevel=.06)
box("t_cab", "t_cab", "dark2", [4.0, 5.0, 4.0], [TX + 12.5, 2.5, 5.0], at=[[0, 0, 0], [0, 0, -4.4], [0, 0, -8.8]], bevel=.08)
box("t_cabled", "t_cab", "led", [.6, .1, .04], [TX + 10.45, 3.8, 5.0], at=[[0, 0, 0], [0, 0, -4.4], [0, 0, -8.8]])
cyl("t_tgt", "t_tgt", "gold", 1.7, .4, [TX + 9.0, 4.55, -2.0], axis="y")
cyl("t_tgtr", "t_tgt", "steelHi", 1.95, .2, [TX + 9.0, 4.3, -2.0], axis="y")
box("t_mag", "t_tgt", "magN", [2.4, .5, .6], [TX + 9.0, 5.0, -2.0], at=[[0, 0, -.8], [0, 0, .8]], bevel=.03)
glow("t_modlit", "t_mods", ["t_modlid0", "t_modlid1", "t_modlid2", "t_modlid3"], "lp_good", steady=False, g=.9, freq=1.8)
glow("t_ledlit", "t_front", ["t_efemled"], "lp_bad", steady=False, g=1.0, freq=2.4)
anchor("t_mod", "t_mods", [TX - 9.0 + 1.8, 4.2, -2.0 + 1.0], dx=-140, dy=-90)
anchor("t_body", "t_body", [TX + 4.6, 2.0, 2.4], dx=150, dy=70)
anchor("t_core", "t_arm", [TX + 1.2, 4.4, 0.4], dx=-150, dy=90)
anchor("t_foup", "t_front", [TX - 4.2, 3.4, 13.4], dx=-130, dy=-50)
anchor("t_tgt", "t_tgt", [TX + 9.0 + 1.4, 4.7, -2.0 + 1.0], dx=140, dy=-130)
anchor("t_modR", "t_mods", [TX + 9.0 - 1.8, 4.2, -2.0 + 1.0], dx=140, dy=-90)

# ═════════ C：反應腔爆炸剖析 x=60 ═════════
CX = 60
cyl("ch_floor", "ch_base", "dark2", 5.2, .4, [CX, .2, 0], axis="y")
ring("ch_slot", "ch_base", "slot", 3.6, 3.2, .06, [CX, .43, 0])
cyl("ch_bolt", "ch_base", "steelHi", .14, .1, [CX, .45, 0], axis="y", at=ring_pts(12, 4.7))
ring("ch_body", "ch_body", "steel", 4.3, 3.95, 3.6, [CX, 2.2, 0])
ring("ch_flange", "ch_body", "steelHi", 4.7, 3.9, .26, [CX, 4.0, 0])
cyl("ch_fbolt", "ch_body", "steel2", .13, .1, [CX, 4.16, 0], axis="y", at=ring_pts(18, 4.3))
box("ch_ribs", "ch_body", "steel2", [.14, 3.2, .5], [CX, 2.2, 0], at=[[4.38 * math.cos(a), 0, 4.38 * math.sin(a)] for a in [i * math.pi / 3 for i in range(6)]], bevel=.02)
tube("ch_stub", "ch_body", "steel2", .85, .62, 4.4, [CX + 5.4, 1.0, 0], axis="x")
ring("ch_stubfl", "ch_body", "steelHi", 1.1, .62, .22, [CX + 7.5, 1.0, 0]) if False else tube("ch_stubfl", "ch_body", "steelHi", 1.1, .62, .22, [CX + 7.7, 1.0, 0], axis="x")
box("ch_pump", "ch_pump", "dark2", [3.6, 2.8, 3.2], [CX + 9.8, 1.4, 0], bevel=.08)
box("ch_pumpfin", "ch_pump", "steel2", [.12, 2.2, 2.8], [CX + 9.8, 1.5, 0], at=[[-1.2 + .3 * i, 0, 0] for i in range(9)])
cyl("ch_pumpfan", "ch_pump", "dark", .9, .2, [CX + 9.8, 2.9, 0], axis="y")
box("ch_pumpled", "ch_pump", "led", [.5, .1, .04], [CX + 8.1, 2.4, 1.62])
# 加熱座
cyl("ch_stem", "ch_ht", "steel2", .55, 1.5, [CX, 1.15, 0], axis="y")
cyl("ch_hdisc", "ch_ht", "steel", 2.95, .55, [CX, 2.0, 0], axis="y")
ring("ch_hring", "ch_ht", "hotc", 2.75, 2.45, .05, [CX, 2.3, 0])
cyl("ch_pin", "ch_ht", "steelHi", .08, .45, [CX, 2.4, 0], axis="y", at=ring_pts(3, 1.7))
box("ch_hpwr", "ch_ht", "dark", [.8, .5, .5], [CX - 1.2, .9, 0]) if False else None
cyl("ch_hcable", "ch_ht", "dark", .16, 2.0, [CX - 1.2, .9, 0], axis="y")
glow("ch_hot", "ch_ht", ["ch_hring", "ch_hdisc"], "lp_heat", steady=True, g=.95)
# 晶圓
parts_lib = [{"part": "wafer", "id": "cwf", "pos": [CX, 2.27, 0], "r": 2.55, "t": .08, "chuck": False, "bad": 0, "step": .6}]
# 噴氣頭
cyl("ch_face", "ch_sh", "steel", 3.35, .22, [CX, 3.0, 0], axis="y")
cyl("ch_hole", "ch_sh", "slot", .09, .03, [CX, 3.125, 0], axis="y", at=hexgrid(3.0, .52))
ring("ch_plen", "ch_sh", "steel2", 3.7, 3.35, .55, [CX, 3.3, 0])
cyl("ch_shbolt", "ch_sh", "steelHi", .1, .08, [CX, 3.6, 0], axis="y", at=ring_pts(12, 3.5))
# 上蓋與進氣
cyl("ch_cap", "ch_lid", "steelHi", 4.1, .42, [CX, 4.35, 0], axis="y")
cyl("ch_capc", "ch_lid", "steel2", 1.5, .3, [CX, 4.7, 0], axis="y")
cyl("ch_in", "ch_lid", "pipeB", .38, 3.0, [CX, 6.2, 0], axis="y")
cyl("ch_inh", "ch_lid", "pipeB", .38, 6.0, [CX - 3.0, 7.7, 0], axis="x")
box("ch_valve", "ch_lid", "dark", [1.3, 1.3, 1.3], [CX - 4.4, 7.7, 0], bevel=.06)
cyl("ch_inbolt", "ch_lid", "steelHi", .12, .1, [CX, 4.6, 0], axis="y", at=ring_pts(10, 3.7))
CHD = {"ch_lid": 6.0, "ch_sh": 3.2, "cwf": 1.4}   # 爆炸位移（y）
# 腔內氣流（絕對座標＝爆炸後位置；層固定不移動）
SHY = 3.0 + CHD["ch_sh"]; WY = 2.33 + CHD["cwf"]
flow("c_in", "c_gas", [[CX - 6.0, 7.7 + CHD["ch_lid"], 0], [CX, 7.7 + CHD["ch_lid"], 0], [CX, SHY + 1.0, 0]], n=4, size=.17, rate=.9, color="lp_sig", rim="lp_sigRim", trail=3)
flow("c_show", "c_gas", [[CX, SHY + .1, 0], [CX, WY + .15, 0]], n=3, lanes=7, gap=.8, ldir=(1, 0, 0), size=.11, rate=1.1, color="lp_sig", rim="lp_sigRim", trail=3)
flow("c_showb", "c_gas", [[CX, SHY + .1, 0], [CX, WY + .15, 0]], n=3, lanes=5, gap=.8, ldir=(0, 0, 1), size=.11, rate=1.1, color="lp_sig", rim="lp_sigRim", trail=3)
flow("c_outL", "c_gas", [[CX - .3, WY + .2, 0], [CX - 3.5, WY + .2, 0], [CX - 3.5, .9, 0], [CX - 2.2, .75, 0]], n=4, size=.13, rate=.9, color="lp_bad", rim="lp_bad", trail=3)
flow("c_outR", "c_gas", [[CX + .3, WY + .2, 0], [CX + 3.5, WY + .2, 0], [CX + 3.5, .9, 0], [CX + 3.5, 1.0, 0], [CX + 12.0, 1.0, 0]], n=5, size=.13, rate=1.0, color="lp_bad", rim="lp_bad", trail=3)
anchor("ch_lid", "ch_lid", [CX + 2.8, 4.5, 2.0], dx=150, dy=-60)
anchor("ch_in", "ch_lid", [CX, 7.4, 0], dx=-150, dy=-40)
anchor("ch_sh", "ch_sh", [CX + 3.0, 3.1, 1.6], dx=150, dy=-50)
anchor("ch_wf", "cwf", [CX + 2.0, 2.4, 1.6], dx=150, dy=30)
anchor("ch_ht", "ch_ht", [CX - 2.4, 2.0, 1.8], dx=-150, dy=40)
anchor("ch_body", "ch_body", [CX - 3.6, 2.0, 2.0], dx=-150, dy=80)
anchor("ch_slot", "ch_base", [CX - 3.4, .43, 0], dx=-140, dy=70)
anchor("ch_stub", "ch_body", [CX + 5.0, 1.4, 0], dx=60, dy=-120)

# ═════════ 溝槽晶圓共用建構 ═════════
BW, FW, TW, D, FH = 10.4, 3.6, 2.4, 4.0, 3.4    # 基板寬、鰭寬、溝槽寬、深度（z）、鰭高
FT = 1.0 + FH                                   # 鰭頂 y＝4.4
def trench(pre, cx, lay_si=None):
    L = lay_si or f"{pre}_si"
    box(f"{pre}_base", L, "si", [BW, 1.0, D], [cx, .5, 0], bevel=.03)
    box(f"{pre}_fin", L, "siTop", [FW, FH, D], [cx, 2.7, 0], at=[[-3.0, 0, 0], [3.0, 0, 0]], bevel=.03)
    return L
def conf(pre, idx, off, t, mat, lay):
    """共形膜一層：頂、兩側壁、底（第 idx 層，內縮量 off）"""
    xin = TW / 2 - off - t
    box(f"{pre}_t{idx}", lay, mat, [FW + 3.0 - 0.0 - 0 + 0 - (xin + 3.0 - 1.2) * 0 - 0, t, D][0:1] + [t, D], [cx_of[pre], FT + off + t / 2, 0], at=None) if False else None
    w = 4.8 - xin
    for s in (-1, 1):
        box(f"{pre}_t{idx}_{'l' if s < 0 else 'r'}", lay, mat, [w, t, D], [cx_of[pre] + s * (xin + w / 2), FT + off + t / 2, 0])
        box(f"{pre}_w{idx}_{'l' if s < 0 else 'r'}", lay, mat, [t, FH + off, D], [cx_of[pre] + s * (TW / 2 - off - t / 2), 1.0 + off + (FH + off) / 2 - off * 0, 0])
    box(f"{pre}_f{idx}", lay, mat, [2 * xin, t, D], [cx_of[pre], 1.0 + off + t / 2, 0])
cx_of = {}
def conf_layers(pre, cx, specs):
    """specs＝[(層id, 材質, 厚)]，依序往內疊"""
    cx_of[pre] = cx; off = 0
    for i, (lay, mat, t) in enumerate(specs):
        layer(lay); conf(pre, i, off, t, mat, lay); off += t
def pvd_film(pre, cx, lay, mat, top=.55, wall=.07, floor=.3, over=.4):
    cx_of[pre] = cx
    for s in (-1, 1):
        n = 'l' if s < 0 else 'r'
        xin = TW / 2 - over
        box(f"{pre}_top_{n}", lay, mat, [4.8 - xin, top, D], [cx + s * (xin + (4.8 - xin) / 2), FT + top / 2, 0])
        box(f"{pre}_wall_{n}", lay, mat, [wall, 1.5, D], [cx + s * (TW / 2 - wall / 2), FT - .75, 0])
    box(f"{pre}_floor", lay, mat, [TW - 2 * wall, floor, D], [cx, 1.0 + floor / 2, 0])
    box(f"{pre}_pinch", lay, mat, [TW - 2 * over, .12, D], [cx, FT + top + .06, 0]) if False else None
def dots_on(pid, lay, mat, r, pos, pts): return box(pid, lay, mat, [r], pos, at=pts, shape="sphere")

# ═════════ W：CVD 晶圓溝槽 x=120 ═════════
WX = 120
trench("w", WX); cx_of["w"] = WX
conf_layers("w", WX, [("w_f1", "film", .22), ("w_f2", "film2", .22), ("w_f3", "film3", .22)])
glow("w_hot", "w_si", ["w_base", "w_fin"], "lp_heat", steady=True, g=.55)
cyl("w_heater", "w_si", "steel2", 6.2, .5, [WX, -.25, 0], axis="y")
# 分子流：藍（氣體 A）、橘（氣體 B）由上往下；反應後灰色副產物往上
for nm, xs, color, rim in (("w_ga", -4.2, "lp_sig", "lp_sigRim"), ("w_gb", -2.9, "lp_proc", "lp_proc")):
    pass
flow("w_ga", "w_gas", [[WX - 3.2, 8.4, 0], [WX - 3.2, FT + .4, 0]], n=3, lanes=3, gap=1.2, ldir=(0, 0, 1), size=.16, rate=1.0, color="lp_sig", rim="lp_sigRim")
flow("w_gb", "w_gas", [[WX + 3.2, 8.4, 0], [WX + 3.2, FT + .4, 0]], n=3, lanes=3, gap=1.2, ldir=(0, 0, 1), size=.16, rate=1.0, color="lp_proc", rim="lp_proc")
flow("w_gta", "w_gas", [[WX - .5, 8.4, 0], [WX - .5, 1.9, 0]], n=4, lanes=3, gap=.8, ldir=(0, 0, 1), size=.13, rate=.9, color="lp_sig", rim="lp_sigRim")
flow("w_gtb", "w_gas", [[WX + .5, 8.4, 0], [WX + .5, 1.9, 0]], n=4, lanes=3, gap=.8, ldir=(0, 0, 1), size=.13, rate=.9, color="lp_proc", rim="lp_proc")
flow("w_by", "w_gas", [[WX - 4.0, FT + .6, 0], [WX - 4.0, 8.4, 0]], n=3, lanes=3, gap=1.2, ldir=(0, 0, 1), size=.11, rate=.55, color="purge", rim="purge")
flow("w_by2", "w_gas", [[WX + 4.0, FT + .6, 0], [WX + 4.0, 8.4, 0]], n=3, lanes=3, gap=1.2, ldir=(0, 0, 1), size=.11, rate=.55, color="purge", rim="purge")
anchor("w_hot", "w_si", [WX + 4.6, 3.0, 2.0], dx=150, dy=-30)
anchor("w_film", "w_f1", [WX + 3.0, FT + .35, 2.0], dx=150, dy=-70)
anchor("w_trench", "w_si", [WX, 3.2, 2.0], dx=0, dy=-130)
anchor("w_gas", "w_gas", [WX - 3.2, 7.0, 0], dx=-150, dy=-20)

# ═════════ S：濺鍍腔 x=180 ═════════
SX = 180
trench("s", SX); cx_of["s"] = SX
layer("s_f"); pvd_film("s", SX, "s_f", "filmG")
cyl("s_stage", "s_si", "steel2", 6.2, .5, [SX, -.25, 0], axis="y")
box("s_tgt", "s_tgt", "gold", [9.4, .7, 5.2], [SX, 9.2, 0], bevel=.06)
box("s_back", "s_tgt", "steelHi", [10.0, .5, 5.8], [SX, 9.85, 0], bevel=.04)
box("s_mag", "s_mag", "magN", [1.2, .8, 4.8], [SX - 3.0, 10.5, 0], at=[[0, 0, 0], [6.0, 0, 0]], bevel=.04)
box("s_magS", "s_mag", "magS", [1.2, .8, 4.8], [SX, 10.5, 0], bevel=.04)
box("s_yoke", "s_mag", "dark", [8.6, .3, 5.0], [SX, 11.05, 0])
box("s_wallB", "s_wall", "dark2", [13.6, 12.4, .3], [SX, 6.2, -3.2])
box("s_wallL", "s_wall", "dark2", [.3, 12.4, 6.4], [SX - 6.7, 6.2, 0])
box("s_wallR", "s_wall", "dark2", [.3, 12.4, 6.4], [SX + 6.7, 6.2, 0])
box("s_plasma", "s_plasma", "plasma", [9.0, 3.6, 4.8], [SX, 7.0, 0])
box("s_shield", "s_wall", "steel2", [.3, 3.6, 6.0], [SX - 5.5, 7.0, 0], at=[[0, 0, 0], [11.0, 0, 0]])
# 氬離子往上撞靶（藍紫）、靶材原子往下落（金）
flow("s_ion", "s_fx", [[SX, 5.6, 0], [SX, 8.7, 0]], n=3, lanes=5, gap=1.6, ldir=(1, 0, 0), size=.16, rate=1.1, color="ion", rim="ion", trail=3)
flow("s_ionb", "s_fx", [[SX, 5.6, 0], [SX, 8.7, 0]], n=3, lanes=3, gap=1.3, ldir=(0, 0, 1), size=.16, rate=1.1, color="ion", rim="ion", trail=3)
flow("s_at", "s_fx", [[SX, 8.7, 0], [SX, FT + .75, 0]], n=3, lanes=7, gap=1.2, ldir=(1, 0, 0), size=.12, rate=.8, color="atomG", rim="atomG", trail=3)
flow("s_atb", "s_fx", [[SX - 2.4, 8.7, 0], [SX - 3.4, FT + .75, 0]], n=3, lanes=3, gap=1.3, ldir=(0, 0, 1), size=.12, rate=.8, color="atomG", rim="atomG", trail=3)
flow("s_atc", "s_fx", [[SX + 2.4, 8.7, 0], [SX + 3.4, FT + .75, 0]], n=3, lanes=3, gap=1.3, ldir=(0, 0, 1), size=.12, rate=.8, color="atomG", rim="atomG", trail=3)
flow("s_atd", "s_fx", [[SX + 1.0, 8.7, 0], [SX + .2, 1.6, 0]], n=3, lanes=2, gap=1.0, ldir=(0, 0, 1), size=.12, rate=.8, color="atomG", rim="atomG", trail=3)
glow("s_glow", "s_plasma", ["s_plasma"], "ion", steady=False, g=.6, freq=2.0)
anchor("s_tgt", "s_tgt", [SX + 3.8, 9.2, 2.0], dx=150, dy=-40)
anchor("s_mag", "s_mag", [SX + 3.4, 10.6, 2.0], dx=150, dy=-30)
anchor("s_ion", "s_fx", [SX - 4.0, 7.0, 0], dx=-150, dy=-20)
anchor("s_film", "s_f", [SX + 3.0, FT + .5, 2.0], dx=150, dy=-50)
anchor("s_wafer", "s_si", [SX - 4.6, 3.0, 2.0], dx=-150, dy=30)

# ═════════ V：兩種鋪法對照 x=240 ═════════
VX = 240; VL = VX - 5.6; VR = VX + 5.6
trench("vl", VL); trench("vr", VR)
layer("v_pvd"); pvd_film("vl", VL, "v_pvd", "film", top=.6, wall=.07, floor=.28, over=.5)
conf_layers("vr", VR, [("v_ald", "film", .26)])
anchor("v_top", "v_pvd", [VL - 3.6, FT + .6, 2.0], dx=-130, dy=-70)
anchor("v_side", "v_pvd", [VL + 1.2, 3.2, 2.0], dx=120, dy=-90)
anchor("v_tr", "vl_si", [VL, 3.2, 2.0], dx=0, dy=-150)
anchor("v_even", "v_ald", [VR + 3.6, FT + .3, 2.0], dx=130, dy=-70)
anchor("v_even2", "v_ald", [VR - 1.0, 2.8, 2.0], dx=-120, dy=-110)
cyl("v_stageL", "vl_si", "steel2", 6.0, .5, [VL, -.25, 0], axis="y") if False else None

# ═════════ A：ALD x=300 ═════════
AX = 300
trench("a", AX); cx_of["a"] = AX
ALDT = .13
conf_layers("a", AX, [(f"a_{c}{i}", "layA" if c == "A" else "layB", ALDT) for i in range(3) for c in "AB"])
cyl("a_stage", "a_si", "steel2", 6.2, .5, [AX, -.25, 0], axis="y")
def pulse(key, kind):
    col = {"A": ("gasA", "lp_sigRim"), "B": ("gasB", "lp_proc"), "P": ("purge", "purge")}[kind[0] if kind[0] in "AB" else "P"]
    up = kind.startswith("P")
    y0, y1 = (FT + .5, 8.4) if up else (8.4, FT + .5)
    y2, y3 = (1.8, 8.4) if up else (8.4, 1.8)
    sz = .12 if up else .15
    flow(key + "t", "a_gas", [[AX, y0, 0], [AX, y1, 0]], n=3, lanes=7, gap=1.4, ldir=(1, 0, 0), size=sz, rate=.9, color=col[0], rim=col[1])
    flow(key + "i", "a_gas", [[AX, y2, 0], [AX, y3, 0]], n=4, lanes=3, gap=.8, ldir=(0, 0, 1), size=sz, rate=.9, color=col[0], rim=col[1])
for c in range(1, 4):
    for x in ("A", "PA", "B", "PB"): pulse(f"a_{x}{c}", x)
anchor("a_film", "a_A0", [AX + 3.6, FT + .2, 2.0], dx=150, dy=-60)
anchor("a_trench", "a_si", [AX, 3.2, 2.0], dx=0, dy=-120)
anchor("a_gas", "a_gas", [AX - 3.4, 7.0, 0], dx=-150, dy=-20)

# ═════════ E：結尾（凹凸、研磨） x=360 ═════════
EX = 360
trench("e", EX)
box("e_fillt", "e_bump", "fill", [4.8 - 1.2, 1.2, D], [EX, FT + .6, 0], at=[[-3.0, 0, 0], [3.0, 0, 0]], bevel=.0) if False else None
box("e_bumpfin", "e_bump", "film", [3.6, 1.2, D], [EX, FT + .6, 0], at=[[-3.0, 0, 0], [3.0, 0, 0]])
box("e_bumpfill", "e_bump", "film", [2.4, FH, D], [EX, 1.0 + FH / 2, 0])
box("e_flat", "e_flat", "film3", [BW, .45, D], [EX, FT + .225, 0])
box("e_flatfill", "e_flat", "film3", [2.4, FH, D], [EX, 1.0 + FH / 2, 0])
box("e_pad", "e_pad", "pad", [BW + 1.2, .6, D + 1.2], [EX, 7.4, 0], bevel=.05)
box("e_padarm", "e_pad", "steel2", [.7, 2.0, .7], [EX, 8.7, 0])
cyl("e_padgrid", "e_pad", "dark", .14, .06, [EX, 7.07, 0], axis="y", at=[[-4.6 + 1.15 * i, 0, -2.2 + 1.1 * j] for i in range(9) for j in range(5)])
glow("e_padglow", "e_pad", ["e_pad"], "lp_sig", steady=False, g=.3, freq=1.4)
anchor("e_bump", "e_bump", [EX + 3.0, FT + 1.2, 2.0], dx=150, dy=-70)
anchor("e_dip", "e_bump", [EX, FT + .1, 2.0], dx=-140, dy=-120)
anchor("e_pad", "e_pad", [EX + 4.2, 7.6, 2.2], dx=150, dy=-20)

layers = [l for l in layers]
model = {
 "name": "tech-deposition：薄膜沉積。零件用基本形狀＋庫的 wafer（genmodel.py 產生）。站別：T 機台 x=0、C 反應腔爆炸剖析 x=60、W CVD 溝槽 x=120、S 濺鍍 x=180、V 兩種鋪法對照 x=240、A ALD x=300、E 結尾 x=360。",
 "unit": "示意，非實際比例", "size": {"w": 14, "h": 2, "r": .1, "t": 6},
 "palette": palette, "materials": materials, "layers": layers, "anchors": anchors,
 "parts": parts_lib + [wafer_] + parts, "actions": actions,
 "pose": {"yaw0": 0, "yawIso": 0, "drift": 0},
 "camera": {"stand": {"d": 24, "elev": 24, "y": 4}},
 "fx": {"dpr": 1, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
}
json.dump(model, open("/home/user/ai-mp4/videos/tech-deposition/model.json", "w"), ensure_ascii=False, indent=1)
print("parts", len(parts), "layers", len(layers), "actions", len(actions))
