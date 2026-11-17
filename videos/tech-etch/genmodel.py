# 產生 videos/tech-etch/model.json（改這支再重產）。座標：x 右、y 上、z 朝觀眾；各站以 x 偏移分開，鏡頭切換。
# M x=0 蝕刻機（群集式機台）｜C x=60 反應腔剖開（電容耦合電漿）｜W x=120 晶圓剖面（深孔一點一點刻深）
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

anchor = None
def anchor(name, lay, p, dx=100, dy=-80): anchors[name] = {"layer": lay, "p": [R(v) for v in p], "dx": dx, "dy": dy}

palette = {"dark": "#3F4E6B", "dark2": "#2E3340", "steel": "#9AA8BE", "steel2": "#7D8AA1", "steelHi": "#C5D0E2", "cu": "#C98A3E", "cuHi": "#E8A45E", "cuDk": "#9C6A2C",
 "orange": "#F08A24", "si": "#B8C2D6", "siTop": "#CBD4E4", "pcbG": "#2F6E55", "glass": "#CFE6F5", "brass": "#D6B25E", "white": "#F6F2E8", "slot": "#2A2E3B", "led": "#FF5A1F",
 "ceramic": "#EDE3CF", "quartz": "#D3E3EA", "oxide": "#8FC1E3", "nitride": "#F0C27A", "resist": "#E2573A", "film": "#14A38B", "plasma": "#A66BFF", "plasmaHi": "#D8B8FF",
 "pipeB": "#2F7FE0", "pipeR": "#D8432C", "waterB": "#5CC8FF", "foup": "#F2EFE6", "wfTop": "#6D7FA8", "wfPat": "#8FA0C8", "green": "#2F9E6E",
 "lp_heat": "#FF7A2F", "lp_bad": "#E0472F", "lp_sig": "#38B6FF", "lp_sigRim": "#1F6FEB", "lp_proc": "#FF9F1C", "lp_good": "#14A38B", "lp_warm": "#FFB020", "lp_ion": "#E8337F", "lp_pl": "#A66BFF"}
def M(color, **k): return {"kind": "std", "color": color, "rough": 0.45, "metal": 0.1, **k}
def G(color, op, **k): return {"kind": "phys", "color": color, "rough": 0.1, "metal": 0, "clearcoat": 0.8, "opacity": op, "env": 0.5, **k}
materials = {
 "dark": M("dark", rough=.5, metal=.2), "dark2": M("dark2", rough=.35, metal=.3), "steel": M("steel", rough=.3, metal=.85, env=.5), "steel2": M("steel2", rough=.35, metal=.8),
 "steelHi": M("steelHi", rough=.25, metal=.8, env=.7), "cu": M("cu", rough=.3, metal=.9, env=.6), "cuHi": M("cuHi", rough=.25, metal=.9, env=.8), "cuDk": M("cuDk", rough=.4, metal=.8),
 "orange": M("orange", rough=.35, metal=.35), "si": M("si", rough=.3, metal=.4, env=.6), "siTop": M("siTop", rough=.25, metal=.5, env=.8), "white": M("white", rough=.55), "brass": M("brass", rough=.3, metal=.9, env=.7),
 "ceramic": M("ceramic", rough=.5, metal=.05), "quartz": M("quartz", rough=.2, metal=.1, env=.7), "oxide": M("oxide", rough=.4), "nitride": M("nitride", rough=.4), "resist": M("resist", rough=.5),
 "film": M("film", rough=.45, metal=.1), "foup": M("foup", rough=.5), "wfTop": M("wfTop", rough=.2, metal=.6, env=.9), "wfPat": M("wfPat", rough=.3, metal=.5, env=.8),
 "slot": {"kind": "unlit", "color": "slot"}, "led": {"kind": "unlit", "color": "led"}, "green": {"kind": "unlit", "color": "green"},
 "glass": G("glass", .22), "pumpglass": G("steelHi", .3, metal=.2), "chuckglass": G("steel2", .36, metal=.2), "plasma": G("plasma", .3, env=.2), "plasmaS": G("plasmaHi", .5, env=.2),
 "pipeB": M("pipeB", rough=.35, metal=.4), "pipeR": M("pipeR", rough=.35, metal=.4), "gold": M("brass", rough=.25, metal=.95, env=.8), "rubber": M("slot", rough=.8),
 "glowwin": {"kind": "unlit", "color": "plasma", "opacity": .55}, "ionM": {"kind": "unlit", "color": "lp_ion"},
}
materials = {"m_" + k: v for k, v in materials.items()}

def flow(key, lay, path, n=4, lanes=1, gap=.2, ldir=(1, 0, 0), size=.1, rate=1.0, color="lp_sig", rim="lp_sigRim", trail=3, shape="dot"):
    layer(lay)
    actions[key] = {"type": "flow", "layer": lay, "path": [[R(v) for v in p] for p in path], "n": n, "lanes": lanes, "laneGap": gap, "laneDir": list(ldir), "size": size, "shape": shape,
                    "rate": rate, "color": color, "rim": rim, "rimScale": 1.6, "rimO": .45, "trail": trail, "trailGap": .03, "trailColor": color, "track": False}
def glow(key, lay, ps, color="lp_heat", steady=True, g=.9, freq=2.2):
    layer(lay)
    d = {"type": "pulse", "layer": lay, "parts": ps, "color": color, "glow": g, "halo": 0}
    if steady: d["steady"] = True
    else: d["freq"] = freq
    actions[key] = d
def rotor(pre, lay, cx, cy, cz, r, nb, a0=0):
    """沿 x 軸的轉子盤：輪轂＋nb 片葉片；回傳 (葉片 id 清單, 各葉片轉軸)"""
    ids = []; piv = {}
    cyl(f"{pre}_hub", lay, "dark2", r * .28, .22, [cx, cy, cz], axis="x")
    for k in range(nb):
        a = a0 + 360.0 / nb * k; ang = math.radians(a); off = r * .62
        i = box(f"{pre}_b{k}", lay + "_bl", "steelHi", [.05, r * .34, r * .8], [cx, cy + off * math.cos(ang), cz + off * math.sin(ang)], rot=[-a, 0, 0], bevel=.01)
        ids.append(i); piv[i] = [cx, cy, cz]
    return ids, piv

# ═════════ M：蝕刻機（群集式機台：中央傳送腔＋三個反應腔＋前端裝載區） ═════════
MX = 0
box("m_tf_base", "m_tf", "dark2", [6.6, .5, 6.6], [MX, .25, 0])
for i, (sx, sz, w, d) in enumerate(((0, -3.15, 6.6, .3), (-3.15, 0, .3, 6.0), (3.15, 0, .3, 6.0))):
    box(f"m_tf_w{i}", "m_tf", "dark2", [w, 1.5, d], [MX + sx, 1.25, sz], bevel=.03)
box("m_tf_wf", "m_tf", "dark2", [6.6, 1.5, .3], [MX, 1.25, 3.15], bevel=.03)
box("m_tf_rim", "m_tf", "steel2", [6.8, .1, .1], [MX, 2.05, 3.2]); box("m_tf_rim2", "m_tf", "steel2", [6.8, .1, .1], [MX, 2.05, -3.2])
# 機器手臂：底座、第一節、可伸縮的第二節＋載台＋晶圓
cyl("m_rb_base", "m_tf", "steel", .6, .55, [MX, .78, 0], axis="y")
box("m_rb_l1", "m_tf", "steelHi", [2.2, .22, .5], [MX - .9, 1.2, 0], bevel=.03)
box("m_rb_l2", "m_arm", "steel", [2.6, .2, .42], [MX - 1.7, 1.45, 0], bevel=.03)
box("m_rb_bl", "m_arm", "steel2", [1.9, .08, .8], [MX - 3.1, 1.6, 0])
cyl("m_wf", "m_wafer", "siTop", .95, .07, [MX - 3.1, 1.69, 0], axis="y")
cyl("m_wf_n", "m_wafer", "wfPat", .6, .075, [MX - 3.1, 1.69, 0], axis="y")
# 反應腔三個
CH = [("L", -5.7, 0), ("R", 5.7, 0), ("B", 0, -5.7)]
for nm, cx, cz in CH:
    box(f"m_c{nm}_body", f"m_c{nm}", "steel", [4.2, 3.4, 4.2], [MX + cx, 1.7, cz], bevel=.05)
    box(f"m_c{nm}_lid", f"m_c{nm}", "dark", [4.3, .5, 4.3], [MX + cx, 3.65, cz], bevel=.05)
    box(f"m_c{nm}_rf", f"m_c{nm}", "steelHi", [1.6, 1.1, 1.4], [MX + cx, 4.45, cz], bevel=.05)
    box(f"m_c{nm}_led", f"m_c{nm}", "led", [.5, .1, .04], [MX + cx, 4.45, cz + .72])
    cyl(f"m_c{nm}_gas", f"m_c{nm}", "steel2", .14, 1.5, [MX + cx + 1.3, 4.4, cz - .6], axis="y")
    cyl(f"m_c{nm}_gas2", f"m_c{nm}", "steel2", .14, 1.3, [MX + cx + 1.3, 5.1, cz - .6 + .65], axis="z")
    box(f"m_c{nm}_win", f"m_c{nm}", "glass", [1.3, .8, .06], [MX + cx, 2.1, cz + 2.13])
    box(f"m_c{nm}_pl", f"m_c{nm}", "glowwin", [1.2, .7, .1], [MX + cx, 2.1, cz + 2.05])
    box(f"m_c{nm}_foot", f"m_c{nm}", "dark2", [4.4, .25, 4.4], [MX + cx, .12, cz])
box("m_slot", "m_cL", "slot", [.06, .6, 2.2], [MX - 3.78, 1.65, 0])
# 前端裝載區（EFEM）與三個晶圓盒
box("m_ef", "m_ef", "dark", [8.2, 2.9, 2.6], [MX, 1.45, 4.7], bevel=.05)
box("m_ef_top", "m_ef", "steel2", [8.3, .2, 2.7], [MX, 3.0, 4.7])
box("m_ef_win", "m_ef", "glass", [3.6, 1.1, .06], [MX, 1.9, 6.02]); box("m_ef_led", "m_ef", "green", [.8, .1, .04], [MX + 3.0, 2.6, 6.02])
for k, fx in enumerate((-2.5, 0, 2.5)):
    box(f"m_fp{k}", "m_foup", "dark2", [1.7, .5, 1.5], [MX + fx, .25, 7.15], bevel=.04)
    box(f"m_foup{k}", "m_foup", "foup", [1.25, 1.35, 1.2], [MX + fx, 1.2, 7.15], bevel=.08)
    box(f"m_fwin{k}", "m_foup", "glass", [.9, .7, .05], [MX + fx, 1.2, 7.78]); cyl(f"m_fh{k}", "m_foup", "steel2", .08, .6, [MX + fx, 2.0, 7.15], axis="x")
for i, y in enumerate((1.0, 1.4)):
    box(f"m_cab{i}", "m_tf", "slot", [.8, .05, .05], [MX - 3.0, y, 3.34])
anchor("m_v1", "m_tf", [MX, 3.0, 0], dx=-190, dy=-120); anchor("m_v2", "m_tf", [MX, 3.0, 0], dx=0, dy=-150); anchor("m_v3", "m_tf", [MX, 3.0, 0], dx=190, dy=-120)
anchor("m_tool", "m_tf", [MX + 3.2, 2.0, 3.2], dx=150, dy=-60)
anchor("m_cL", "m_cL", [MX - 5.7 - .8, 3.2, 2.2], dx=-150, dy=-70)

# ═════════ C：反應腔剖開（電容耦合電漿蝕刻腔：上電極＝噴氣頭、下電極＝靜電吸盤，右側抽氣） ═════════
CX = 60
# 外殼：底座、背牆、左右牆（前面開口＝剖開）
box("ch_base", "ch_shell", "dark2", [9.2, .5, 8.4], [CX, .25, 0], bevel=.04)
box("ch_back", "ch_shell", "steel", [8.8, 5.6, .35], [CX, 3.3, -4.0], bevel=.04)
box("ch_left", "ch_shell", "steel", [.35, 5.6, 8.0], [CX - 4.2, 3.3, 0], bevel=.04)
box("ch_right", "ch_shell", "steel", [.35, 5.6, 8.0], [CX + 4.2, 3.3, 0], bevel=.04)
box("ch_ribs", "ch_shell", "steel2", [.12, 5.0, .12], [CX - 4.2, 3.3, 4.05], at=[[0, 0, 0], [8.4, 0, 0]])
box("ch_band", "ch_shell", "steel2", [8.9, .14, .14], [CX, 0, -4.0], at=[[0, 1.6, 0], [0, 3.3, 0], [0, 5.0, 0]])
box("ch_bolt", "ch_shell", "steelHi", [.16, .16, .08], [CX - 4.2, 0, 4.1], at=[[0, 1.0 + .7 * i, 0] for i in range(7)] + [[8.4, 1.0 + .7 * i, 0] for i in range(7)])
# 內襯（石英／氧化釔塗層的白色板；會被電漿慢慢磨掉，是耗材）
box("ch_ln_b", "ch_liner", "quartz", [7.8, 4.7, .15], [CX, 3.0, -3.75]); box("ch_ln_l", "ch_liner", "quartz", [.15, 4.7, 7.4], [CX - 3.85, 3.0, 0]); box("ch_ln_r", "ch_liner", "quartz", [.15, 4.7, 7.4], [CX + 3.85, 3.0, 0])
# 下電極：陰極底座（有冷卻水道）、靜電吸盤、晶圓、聚焦環
cyl("ch_cath", "ch_cath", "chuckglass", 2.95, 1.0, [CX, 1.0, 0], axis="y")
cyl("ch_cath_in", "ch_cath", "steel2", 2.55, .12, [CX, .56, 0], axis="y")
cyl("ch_esc", "ch_esc", "ceramic", 2.55, .5, [CX, 1.75, 0], axis="y")
cyl("ch_esc_pin", "ch_esc", "steelHi", .06, .05, [CX, 2.02, 0], axis="y", at=[[1.0 * math.cos(math.radians(a)) * r, 0, 1.0 * math.sin(math.radians(a)) * r] for r in (0.8, 1.6) for a in range(0, 360, 60)])
box("ch_feedB", "ch_cath", "cu", [.36, 1.0, .36], [CX, 0.0, 0], bevel=.02)
cyl("ch_wf", "ch_wf", "si", 2.3, .14, [CX, 2.07, 0], axis="y")
cyl("ch_wftop", "ch_wf", "wfTop", 2.22, .02, [CX, 2.15, 0], axis="y")
box("ch_wfpat", "ch_wf", "wfPat", [.44, .015, .44], [CX, 2.165, 0], at=[[.55 * i, 0, .55 * j] for i in range(-3, 4) for j in range(-3, 4) if (i * i + j * j) <= 9])
tube("ch_ring", "ch_ring", "quartz", 2.95, 2.4, .3, [CX, 2.1, 0], axis="y")
# 抽氣擋板環（氣體從晶圓周圍的縫抽走）
tube("ch_baf", "ch_baf", "slot", 3.85, 3.0, .12, [CX, .62, 0], axis="y")
# 上電極＝噴氣頭：底板（打滿小孔）、氣室、蓋；蓋板上有氣體管與射頻棒
cyl("ch_sh", "ch_sh", "steelHi", 2.75, .45, [CX, 5.15, 0], axis="y")
box("ch_shh", "ch_sh", "slot", [.1, .05, .1], [CX, 4.91, 0], at=[[.45 * i, 0, .45 * j] for i in range(-5, 6) for j in range(-5, 6) if (i * i + j * j) <= 25])
cyl("ch_plen", "ch_sh", "steel2", 1.7, .5, [CX, 5.65, 0], axis="y")
cyl("ch_shring", "ch_sh", "dark2", 2.9, .16, [CX, 5.1, 0], axis="y")
box("ch_lid", "ch_lid", "dark", [9.2, .55, 8.4], [CX, 6.35, 0], bevel=.05)
box("ch_lidbolt", "ch_lid", "steelHi", [.2, .1, .2], [CX, 6.68, 0], at=[[x, 0, z] for x in (-4.0, -1.35, 1.35, 4.0) for z in (-3.6, 3.6)])
cyl("ch_gtube", "ch_top", "steel", .26, 2.4, [CX - .9, 7.1, 0], axis="y")
cyl("ch_gpipe", "ch_top", "steel", .26, 4.7, [CX - 3.25, 8.2, 0], axis="x")
cyl("ch_gelb", "ch_top", "steel", .26, 2.0, [CX - .9, 8.2 - 1.0, 0], axis="y")
box("ch_gbox", "ch_top", "dark", [1.1, 1.0, 1.0], [CX - 5.9, 8.2, 0], bevel=.05); box("ch_gled", "ch_top", "green", [.3, .08, .04], [CX - 5.9, 8.45, .52])
cyl("ch_rfrod", "ch_top", "cuHi", .17, 2.6, [CX + .9, 7.2, 0], axis="y")
cyl("ch_rfrod2", "ch_top", "cuHi", .17, 3.0, [CX + 2.4, 8.4, 0], axis="x")
box("ch_match", "ch_top", "steelHi", [1.8, 1.4, 1.4], [CX + 4.2, 8.4, 0], bevel=.05); box("ch_mled", "ch_top", "led", [.5, .1, .04], [CX + 4.2, 8.6, .72])
# 偏壓射頻：從下方接上陰極
box("ch_bmatch", "ch_cath", "steelHi", [1.5, 1.0, 1.2], [CX + 2.0, -.8, 0], bevel=.05); cyl("ch_brod", "ch_cath", "cuHi", .15, 2.2, [CX + 1.0, -.5, 0], axis="x")
# 電漿：兩團發光體（主體＋靠近晶圓的鞘層）
cyl("ch_plasma", "plasma", "plasma", 2.5, 2.5, [CX, 3.55, 0], axis="y")
cyl("ch_sheath", "plasma", "plasmaS", 2.4, .35, [CX, 2.38, 0], axis="y")
cyl("ch_sheath2", "plasma", "plasmaS", 2.4, .3, [CX, 4.72, 0], axis="y")
# 抽氣：側壁開口→閘閥→渦輪分子幫浦（透明外殼看得到轉子）
box("ch_gv", "ch_port", "dark2", [.9, 1.8, 1.8], [CX + 4.95, 1.5, 0], bevel=.04)
cyl("ch_duct", "ch_port", "steel", .95, 2.2, [CX + 6.4, 1.5, 0], axis="x")
tube("ch_ph", "ch_port", "pumpglass", 1.5, 1.38, 4.2, [CX + 9.6, 1.5, 0], axis="x")
cyl("ch_pcap", "ch_port", "steel2", 1.55, .3, [CX + 11.8, 1.5, 0], axis="x")
cyl("ch_pbase", "ch_port", "dark", 1.0, .9, [CX + 12.4, 1.5, 0], axis="x")
cyl("ch_pshaft", "ch_port", "steel2", .16, 3.8, [CX + 9.8, 1.5, 0], axis="x")
rid = []; rp = {}
for j, xx in enumerate((8.3, 9.1, 9.9, 10.7)):
    a, p = rotor(f"ch_r{j}", "ch_rot", CX + xx, 1.5, 0, 1.15, 8, a0=j * 11); rid += a; rp.update(p)
actions["c_rot"] = {"type": "rotate", "parts": rid, "axis": [1, 0, 0], "pivots": rp, "rps": 3.2, "rampSpin": True, "layer": "ch_rot_bl"}
box("ch_pled", "ch_port", "led", [.1, .3, .04], [CX + 12.4, 2.7, 0])
# 運作：氣體進（藍）→噴氣頭→往下；離子往下（粉紅）；廢氣往右抽走（橘）
flow("c_gin", "ch_flow", [[CX - 5.4, 8.2, 0], [CX - .9, 8.2, 0], [CX - .9, 5.9, 0]], n=4, size=.17, rate=.9, color="lp_sig", rim="lp_sigRim")
flow("c_gsh", "ch_flow", [[CX, 4.85, 0], [CX, 3.4, 0]], n=3, lanes=9, gap=.5, ldir=(1, 0, 0), size=.08, rate=.8, color="lp_sig", rim="lp_sigRim")
flow("c_gsh2", "ch_flow", [[CX, 4.85, 0], [CX, 3.6, 0]], n=3, lanes=5, gap=.9, ldir=(0, 0, 1), size=.08, rate=.8, color="lp_sig", rim="lp_sigRim")
flow("c_ion", "ch_flow", [[CX, 4.6, 0], [CX, 2.3, 0]], n=4, lanes=9, gap=.5, ldir=(1, 0, 0), size=.11, rate=1.3, color="lp_ion", rim="lp_ion", trail=4)
flow("c_ion2", "ch_flow", [[CX, 4.6, 0], [CX, 2.3, 0]], n=4, lanes=5, gap=.9, ldir=(0, 0, 1), size=.11, rate=1.3, color="lp_ion", rim="lp_ion", trail=4)
flow("c_efield", "ch_flow", [[CX, 4.5, 0], [CX, 2.5, 0]], n=2, lanes=3, gap=1.8, ldir=(1, 0, 0), size=.2, rate=.7, color="lp_proc", rim="lp_proc", shape="arrow", trail=0)
flow("c_exh", "ch_flow", [[CX + 2.8, 2.7, 0], [CX + 3.5, 1.4, 0], [CX + 8.0, 1.5, 0], [CX + 11.6, 1.5, 0]], n=6, lanes=3, gap=.4, ldir=(0, 0, 1), size=.12, rate=1.0, color="lp_proc", rim="lp_proc")
flow("c_vac", "ch_flow", [[CX - 1.0, 3.8, 0], [CX + 2.2, 3.2, 0], [CX + 3.4, 1.5, 0], [CX + 8.0, 1.5, 0]], n=6, lanes=4, gap=.8, ldir=(0, 0, 1), size=.07, rate=1.1, color="lp_sigRim", rim="lp_sigRim")
glow("c_pl", "plasma", ["ch_plasma", "ch_sheath", "ch_sheath2"], "lp_pl", steady=False, g=.9, freq=3.4)
glow("c_rf", "ch_top", ["ch_rfrod", "ch_rfrod2"], "lp_proc", steady=False, g=1.0, freq=3.0)
glow("c_rfb", "ch_cath", ["ch_brod"], "lp_proc", steady=False, g=1.0, freq=3.0)
glow("c_cold", "ch_esc", ["ch_esc"], "lp_sig", steady=True, g=.55)
# 低溫冷卻：陰極內水道繞一圈、兩條冷凍機水管
chill = [[CX - 6.8, 1.0, .45], [CX - 2.3, 1.0, .45]] + [[CX + 2.3 * math.cos(math.radians(t)), 1.0, 2.3 * math.sin(math.radians(t))] for t in range(170, -171, -20)] + [[CX - 2.3, 1.0, -.45], [CX - 6.8, 1.0, -.45]]
cyl("ch_hoseB", "ch_cool", "pipeB", .22, 4.5, [CX - 5.0, 1.0, .45], axis="x"); cyl("ch_hoseR", "ch_cool", "pipeR", .22, 4.5, [CX - 5.0, 1.0, -.45], axis="x")
box("ch_chiller", "ch_cool", "dark", [1.6, 1.8, 1.4], [CX - 7.5, 1.0, 0], bevel=.05); box("ch_chled", "ch_cool", "led", [.4, .08, .04], [CX - 7.5, 1.7, .72])
flow("c_chill", "ch_cool_f", chill, n=7, size=.15, rate=.9, color="lp_sig", rim="lp_sigRim")
anchor("c_sh", "ch_sh", [CX + 2.3, 5.2, 1.5], dx=150, dy=-70); anchor("c_esc", "ch_esc", [CX + 2.55, 1.75, 0.6], dx=240, dy=150)
anchor("c_wf", "ch_wf", [CX - 2.0, 2.2, 1.2], dx=-150, dy=-100); anchor("c_port", "ch_port", [CX + 6.4, 2.0, 1.0], dx=130, dy=-90)
anchor("c_pl", "plasma", [CX + 2.4, 3.6, 1.0], dx=150, dy=-60); anchor("c_ring", "ch_ring", [CX - 2.9, 2.2, 1.0], dx=-150, dy=-60)
anchor("c_ln", "ch_liner", [CX - 3.85, 4.2, 1.5], dx=-150, dy=-60); anchor("c_shell", "ch_shell", [CX - 4.2, 3.0, 3.8], dx=-150, dy=-40)
anchor("c_cath", "ch_cath", [CX - 2.9, 1.0, 1.0], dx=-150, dy=60)

# ═════════ W：晶圓剖面（交疊膜層上挖一個深孔；孔裡的「塞子」一塊一塊被打掉＝一點一點刻深） ═════════
WX = 120
NL = 8; LH = .5; Y0 = 1.2; HW = .8; HD = .4  # 層數、每層厚、堆疊底部 y、孔寬、孔的半徑（剖面看到的深度）
box("w_sub", "w_sub", "si", [8, 1.2, 3.0], [WX, .6, -1.5], bevel=.03)
for i in range(NL):
    yc = Y0 + LH / 2 + LH * i; mat = "oxide" if i % 2 == 0 else "nitride"
    box(f"w_l{i}", f"w_l{i}", mat, [3.6, LH - .02, 3.0], [WX - 2.2, yc, -1.5], at=[[0, 0, 0], [4.4, 0, 0]])
    box(f"w_lb{i}", f"w_l{i}", mat, [HW, LH - .02, 3.0 - HD], [WX, yc, -(3.0 + HD) / 2])
    box(f"w_p{i}", f"w_p{i}", mat, [HW, LH - .02, HD], [WX, yc, -HD / 2])   # 塞子：會被打掉的部分
YM = Y0 + LH * NL
box("w_mask", "w_mask", "resist", [3.6, .5, 3.0], [WX - 2.2, YM + .25, -1.5], at=[[0, 0, 0], [4.4, 0, 0]], bevel=.03)
box("w_maskb", "w_mask", "resist", [HW, .5, 3.0 - HD], [WX, YM + .25, -(3.0 + HD) / 2], bevel=.03)
# 洞壁保護膜（青綠）：四組，各蓋住兩層的洞壁
for g in range(4):
    yl = Y0 + LH * 2 * g + LH           # 這組兩層的中心
    box(f"w_f{g}", f"w_f{g}", "film", [.07, LH * 2 - .03, HD], [WX - HW / 2 - .035, yl, -HD / 2], at=[[0, 0, 0], [HW + .07, 0, 0]])
    box(f"w_fb{g}", f"w_f{g}", "film", [HW, LH * 2 - .03, .07], [WX, yl, -HD - .035])
# 運作：離子往下（對準孔）、每一階段停在目前孔底；副產物往上
for k in range(5):
    yend = YM - LH * 2 * k if k < 4 else Y0
    flow(f"w_ion{k}", "w_flow", [[WX, YM + 2.2, -.12], [WX, yend + .06, -.12]], n=3, lanes=3, gap=.22, ldir=(1, 0, 0), size=.1, rate=1.4, color="lp_ion", rim="lp_ion", trail=4)
flow("w_ionall", "w_flow", [[WX, YM + 2.2, -.12], [WX, Y0 + .06, -.12]], n=4, lanes=3, gap=.22, ldir=(1, 0, 0), size=.1, rate=1.4, color="lp_ion", rim="lp_ion", trail=4)
flow("w_by", "w_flow", [[WX, Y0 + 1.4, -.12], [WX, YM + 1.8, -.12]], n=4, lanes=2, gap=.3, ldir=(1, 0, 0), size=.07, rate=.8, color="lp_proc", rim="lp_proc", trail=2)
box("w_fill", "w_fill", "cuHi", [.5, YM - Y0 - .02, .06], [WX, (YM + Y0) / 2, -.04], bevel=.02)
anchor("w_mask", "w_mask", [WX + 2.2, YM + .25, .0], dx=150, dy=-60); anchor("w_stack", "w_l7", [WX + 2.8, Y0 + 2.5, .0], dx=150, dy=-20)
anchor("w_hole", "w_l7", [WX - .0, YM - .8, .0], dx=-160, dy=-100); anchor("w_sub", "w_sub", [WX - 3.0, .6, 0], dx=-150, dy=40)
anchor("w_wall", "w_f0", [WX - .45, Y0 + 1.0, .0], dx=-160, dy=-30)

anchor("c_cath2", "ch_cool", [CX - 4.5, 1.2, .6], dx=-60, dy=130)
anchor("m_wf", "m_wafer", [MX - 3.1, 1.8, 0], dx=0, dy=-170)
anchor("c_gas", "ch_top", [CX - 3.2, 8.2, 0], dx=-130, dy=40); anchor("c_rfa", "ch_top", [CX + 1.4, 7.9, 0], dx=150, dy=-40); anchor("c_ionlab", "plasma", [CX + 1.6, 3.3, 1.0], dx=150, dy=10)

model = {
 "name": "tech-etch：蝕刻機。零件用基本形狀（genmodel.py 產生）。站別：M 蝕刻機 x=0、C 反應腔剖開 x=60、W 晶圓剖面 x=120。",
 "unit": "示意，非實際比例", "size": {"w": 14, "h": 2, "r": .1, "t": 6},
 "palette": palette, "materials": materials, "layers": layers, "anchors": anchors,
 "parts": parts, "actions": actions,
 "pose": {"yaw0": 0, "yawIso": 0, "drift": 0},
 "camera": {"stand": {"d": 24, "elev": 24, "y": 4}},
 "fx": {"dpr": 1, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
}
json.dump(model, open("/home/user/ai-mp4/videos/tech-etch/model.json", "w"), ensure_ascii=False, indent=1)
print("parts", len(parts), "layers", len(layers), "actions", len(actions))
