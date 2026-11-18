# 產生 videos/tech-foundry/model.json（改這支再重產）。座標：x 右、y 上、z 朝觀眾；各站以 x 偏移分開，鏡頭切換。
# F x=0 廠區（4 棟廠房）｜C x=60 無塵室（天車軌道＋傳送盒＋機台＋氣流）｜T x=120 機台內（搬運手臂＋反應腔）｜W x=180 晶圓｜D x=240 晶粒爆炸剖析
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

palette = {"dark": "#3F4E6B", "dark2": "#2E3340", "steel": "#9AA8BE", "steel2": "#7D8AA1", "steelHi": "#C5D0E2", "cu": "#C98A3E", "cuHi": "#E8A45E", "cuDk": "#9C6A2C",
 "orange": "#F08A24", "si": "#B8C2D6", "siTop": "#CBD4E4", "brass": "#D6B25E", "slot": "#2A2E3B", "white": "#F6F2E8", "pcbG": "#2F6E55",
 "wall": "#E3E9F2", "wallD": "#C3CDDD", "roof": "#5B6678", "win": "#43536F", "ground": "#D3D9E3", "tree": "#6BB38A", "road": "#7C8696", "aBlue": "#2F7FE0", "aOrange": "#F08A24", "aTeal": "#14A38B", "aPurple": "#7A5BD6",
 "floorC": "#AAB5C6", "tile": "#C9D1DE", "ffu": "#EEF2F8", "filter": "#56637C", "foup": "#F2B24A", "foupD": "#C98A22", "wafer": "#C3CCDC", "waferHi": "#DDE4F0",
 "ox": "#DDE1EA", "oxD": "#C6CCDA", "pass": "#8B97B3", "gateO": "#F08A24", "sdB": "#2F7FE0", "violet": "#8E5CF0", "steam": "#FFFFFF", "dust": "#E0472F", "led": "#FF5A1F", "ledG": "#2BC48A",
 "lp_heat": "#FF7A2F", "lp_bad": "#E0472F", "lp_sig": "#38B6FF", "lp_sigRim": "#1F6FEB", "lp_proc": "#FF9F1C", "lp_good": "#14A38B", "lp_warm": "#FFB020", "lp_vio": "#8E5CF0"}
def M(color, **k): return {"kind": "std", "color": color, "rough": 0.45, "metal": 0.1, **k}
materials = {
 "dark": M("dark", rough=.5, metal=.2), "dark2": M("dark2", rough=.35, metal=.3), "steel": M("steel", rough=.3, metal=.85, env=.5), "steel2": M("steel2", rough=.35, metal=.8),
 "steelHi": M("steelHi", rough=.25, metal=.8, env=.7), "cu": M("cu", rough=.3, metal=.9, env=.6), "cuHi": M("cuHi", rough=.25, metal=.9, env=.8), "cuDk": M("cuDk", rough=.4, metal=.8),
 "orange": M("orange", rough=.35, metal=.35), "si": M("si", rough=.35, metal=.35, env=.5), "siTop": M("siTop", rough=.3, metal=.4, env=.6), "gold": M("brass", rough=.25, metal=.95, env=.8),
 "white": M("white", rough=.55), "slot": {"kind": "unlit", "color": "slot"}, "led": {"kind": "unlit", "color": "led"}, "ledG": {"kind": "unlit", "color": "ledG"},
 "wall": M("wall", rough=.7, metal=.05), "wallD": M("wallD", rough=.65, metal=.05), "roof": M("roof", rough=.6, metal=.15), "win": M("win", rough=.4, metal=.2),
 "ground": M("ground", rough=.85, metal=0), "tree": M("tree", rough=.9, metal=0), "road": M("road", rough=.9, metal=0),
 "aBlue": M("aBlue", rough=.45, metal=.15), "aOrange": M("aOrange", rough=.45, metal=.15), "aTeal": M("aTeal", rough=.45, metal=.15), "aPurple": M("aPurple", rough=.45, metal=.15),
 "floorC": M("floorC", rough=.6, metal=.2), "tile": M("tile", rough=.55, metal=.1), "ffu": M("ffu", rough=.55, metal=.1), "filter": M("filter", rough=.8),
 "foup": M("foup", rough=.4, metal=.05), "foupD": M("foupD", rough=.45, metal=.1), "wafer": M("wafer", rough=.25, metal=.7, env=.8), "waferHi": M("waferHi", rough=.2, metal=.7, env=.9),
 "ox": M("ox", rough=.6, metal=.05), "oxD": M("oxD", rough=.6, metal=.05), "pass": M("pass", rough=.5, metal=.2), "gateO": M("gateO", rough=.35, metal=.35), "sdB": M("sdB", rough=.4, metal=.2),
 "traces": M("siTop", rough=.3, metal=.5, tex="traces", texScale=.5, env=.7),
 "violet": {"kind": "unlit", "color": "violet", "opacity": .85}, "steam": {"kind": "unlit", "color": "steam", "opacity": .45},
}
materials = {"m_" + k: v for k, v in materials.items()}

# ═════════ F：廠區（4 棟廠房排成 2×2＋公用設施）═════════
FX0 = 0
box("f_ground", "f_gnd", "ground", [26, .3, 24], [FX0, -.15, -.5], bevel=.03)
box("f_road", "f_gnd", "road", [26, .04, 1.8], [FX0, .02, 8.6])
box("f_lane", "f_gnd", "white", [.8, .02, .12], [FX0, .05, 8.6], at=[[-13 + 2.4 * i, 0, 0] for i in range(11)])
box("f_walk", "f_gnd", "road", [1.6, .03, 12.0], [FX0, .02, -.4])
BLD = [("bA", "aBlue", 5.6, 4.6, 4.6, -3.6, 3.0), ("bB", "aOrange", 4.8, 3.5, 4.2, 3.8, 3.0), ("bC", "aTeal", 3.8, 2.7, 3.8, -3.6, -5.8), ("bD", "aPurple", 4.2, 3.1, 3.8, 3.8, -5.8)]
FC = {}
for bid, acc, w, h, d, c, zc in BLD:
    FC[bid] = c
    box(f"{bid}_body", bid, "wall", [w, h, d], [c, h / 2, zc], bevel=.04)
    box(f"{bid}_band", bid, acc, [w + .06, .42, d + .06], [c, h - .62, zc], bevel=.02)
    box(f"{bid}_base", bid, "wallD", [w + .1, .5, d + .1], [c, .25, zc])
    box(f"{bid}_roof", bid, "roof", [w + .24, .2, d + .24], [c, h + .1, zc], bevel=.03)
    n = int((w - .6) / .62)
    box(f"{bid}_pan", bid, "win", [.34, h - 1.7, .06], [c, (h - 1.7) / 2 + .6, zc + d / 2 + .03], at=[[(i - (n - 1) / 2) * .62, 0, 0] for i in range(n)])
    box(f"{bid}_door", bid, "dark2", [1.1, 1.15, .08], [c, .62, zc + d / 2 + .05])
    box(f"{bid}_hv", bid, "steelHi", [.9, .5, .8], [c, h + .45, zc], at=[[-w / 2 + 1.0, 0, -.5], [w / 2 - 1.0, 0, .3]], bevel=.03)
    cyl(f"{bid}_vent", bid, "steel", .12, .8, [c, h + .6, zc], axis="y", at=[[-.4, 0, .9], [.4, 0, .9], [0, 0, -.8]])
    anchor(bid, bid, [c + (w / 2 - .5) * (1 if c > 0 else -1), h + .15, zc + d / 2 - .3], dx=(150 if c > 0 else -150) if zc > 0 else (110 if c > 0 else -110), dy=(-170 if zc > 0 else 290))
    anchor(bid + "_l", bid, [c - (w / 2 - .5), h + .15, zc + d / 2 - .3], dx=-150, dy=-170)
    anchor(bid + "_f", bid, [c, h - .6, zc + d / 2 + .08], dx=0, dy=-110)
# 公用設施：排氣塔（冒蒸氣）、冷卻水塔、冰水機
cyl("f_stack", "f_util", "steelHi", .3, 4.2, [FX0 + 9.0, 2.1, -10.0], axis="y", at=[[0, 0, 0], [1.1, 0, 0]])
cyl("f_stackc", "f_util", "orange", .34, .3, [FX0 + 9.0, 4.2, -10.0], axis="y", at=[[0, 0, 0], [1.1, 0, 0]])
box("f_tower", "f_util", "wallD", [2.2, 1.3, 1.8], [FX0 - 9.0, .65, -10.0], at=[[0, 0, 0], [2.6, 0, 0]], bevel=.04)
cyl("f_tfan", "f_util", "dark2", .62, .12, [FX0 - 9.0, 1.36, -10.0], axis="y", at=[[0, 0, 0], [2.6, 0, 0]])
cyl("f_chill", "f_util", "steel", .75, 1.5, [FX0 - 3.0, .75, -10.4], axis="y", at=[[0, 0, 0], [1.8, 0, 0], [3.6, 0, 0]])
box("f_off", "f_bg", "wall", [3.4, 2.0, 2.2], [FX0 - 9.8, 1.0, 2.0], bevel=.04)
box("f_offb", "f_bg", "aBlue", [3.46, .26, 2.26], [FX0 - 9.8, 1.7, 2.0])
box("f_wh", "f_bg", "wallD", [3.0, 1.6, 4.4], [FX0 + 10.6, .8, .6], bevel=.04)
box("f_whr", "f_bg", "roof", [3.2, .16, 4.6], [FX0 + 10.6, 1.68, .6])
box("f_trunk", "f_bg", "cuDk", [.16, .6, .16], [FX0, .3, 10.4], at=[[-13 + 2.0 * i, 0, 0] for i in range(14)])
cyl("f_tree", "f_bg", "tree", .55, .9, [FX0, 1.0, 10.4], axis="y", at=[[-13 + 2.0 * i, 0, 0] for i in range(14)])
flow("f_steam", "f_steamL", [[FX0 + 9.0, 4.5, -10.0], [FX0 + 9.3, 8.8, -9.6]], n=5, lanes=2, gap=1.1, ldir=(1, 0, 0), size=.34, rate=.55, color="steam", rim="steam", trail=2)
glow("f_hotA", "bA", ["bA_band"], "lp_sigRim", steady=False, g=.8, freq=1.8)
glow("f_hotB", "bB", ["bB_band"], "lp_proc", steady=False, g=.8, freq=1.8)
glow("f_hotC", "bC", ["bC_band"], "lp_proc", steady=False, g=.8, freq=1.8)
glow("f_hotD", "bD", ["bD_band"], "lp_good", steady=False, g=.8, freq=1.8)
# 貨車（運晶圓盒的小車）
box("f_van", "f_van", "wall", [1.7, .9, .8], [FX0 - 11.0, .75, 8.6], bevel=.05)
box("f_vanc", "f_van", "aBlue", [.7, .7, .78], [FX0 - 9.9, .65, 8.6], bevel=.05)
cyl("f_vanw", "f_van", "dark2", .26, .2, [FX0 - 11.0, .26, 8.6], axis="z", at=[[-.5, 0, .4], [.5, 0, .4], [-.5, 0, -.4], [.5, 0, -.4]])

# ═════════ C：無塵室（x=60）═════════
CX = 60; FL = 1.25  # 架高地板上表面
box("c_slab", "c_floor", "dark2", [20.8, .3, 8.8], [CX, -.15, 0])
cyl("c_ped", "c_floor", "steel2", .1, .95, [CX, .62, 0], axis="y", at=[[-9 + 1.5 * i, 0, -3.0 + 1.5 * j] for i in range(13) for j in range(5)])
box("c_deck", "c_floor", "floorC", [20.4, .25, 8.4], [CX, FL - .125, 0], bevel=.02)
box("c_tx", "c_floor", "tile", [.05, .02, 8.4], [CX, FL + .005, 0], at=[[-9.5 + 1.0 * i, 0, 0] for i in range(20)])
box("c_tz", "c_floor", "tile", [20.4, .02, .05], [CX, FL + .005, 0], at=[[0, 0, -3.5 + 1.0 * j] for j in range(8)])
box("c_grate", "c_floor", "slot", [.78, .03, .78], [CX, FL + .02, 3.0], at=[[-9 + 1.0 * i, 0, 0] for i in range(19)] + [[-9 + 1.0 * i, 0, 2.0 - 3.0] for i in range(0)])
box("c_back", "c_wall", "wall", [20.8, 9.2, .3], [CX, 4.6, -4.35], bevel=.02)
box("c_bandw", "c_wall", "aBlue", [20.8, .3, .32], [CX, 1.6, -4.34])
box("c_pnl", "c_wall", "wallD", [.05, 6.5, .06], [CX, 5.2, -4.18], at=[[-9.5 + 1.9 * i, 0, 0] for i in range(11)])
for sgn, nm in ((-1, "l"), (1, "r")):
    box(f"c_ch_{nm}", "c_wall", "dark", [.9, 8.4, .2], [CX + sgn * 9.85, 4.55, 2.9], bevel=.02)
    box(f"c_chf_{nm}", "c_wall", "steel2", [1.0, .12, .5], [CX + sgn * 9.85, .62, 2.9])
box("c_ceil", "c_ceil", "wallD", [20.8, .6, 8.8], [CX, 9.5, 0], bevel=.02)
FFX = [-9 + 2 * i for i in range(10)]
box("c_ffu", "c_ceil", "ffu", [1.86, .45, 1.86], [CX, 8.78, 0], at=[[x, 0, z] for x in FFX for z in (-2.9, -.95, 1.0, 2.95)], bevel=.04)
box("c_flt", "c_ceil", "filter", [1.58, .05, 1.58], [CX, 8.52, 0], at=[[x, 0, z] for x in FFX for z in (-2.9, -.95, 1.0, 2.95)])
# 機台 3 台（沿 x 排開）
TOOLX = [-6.5, .5, 7.5]
for k, tx in enumerate(TOOLX):
    box(f"c_t{k}_b", "c_tools", "wall", [4.4, 3.6, 2.8], [CX + tx, FL + 1.8, -.5], bevel=.05)
    box(f"c_t{k}_p", "c_tools", "win", [3.6, 1.7, .06], [CX + tx, FL + 2.1, .93])
    box(f"c_t{k}_s", "c_tools", "aBlue", [4.5, .26, 2.9], [CX + tx, FL + 3.0, -.5], bevel=.02)
    box(f"c_t{k}_top", "c_tools", "roof", [4.5, .12, 2.9], [CX + tx, FL + 3.66, -.5])
    cyl(f"c_t{k}_lt", "c_tools", "steel", .06, .6, [CX + tx + 1.9, FL + 4.0, -1.5], axis="y")
    cyl(f"c_t{k}_lg", "c_tools", "ledG", .1, .14, [CX + tx + 1.9, FL + 4.38, -1.5], axis="y")
    box(f"c_t{k}_lp", "c_tools", "steel", [1.5, .16, 1.1], [CX + tx, FL + 1.35, 1.45], bevel=.02)
anchor("c_tool", "c_tools", [CX + .5 + 2.2, FL + 3.1, .9], dx=140, dy=-60)
# 靜止的傳送盒（停在另外兩台機台的裝載口）
for k in (0, 2):
    box(f"c_sf{k}", "c_sfoup", "foup", [.95, 1.1, .95], [CX + TOOLX[k], FL + 1.43 + .55, 1.45], bevel=.05)
    box(f"c_sfh{k}", "c_sfoup", "foupD", [.45, .14, .45], [CX + TOOLX[k], FL + 2.62, 1.45], bevel=.03)
# 天車軌道（懸在天花板下）：軌道、吊桿、天車本體、吊帶、夾具、傳送盒
RY = 7.2; RZ = 1.7
box("o_rail", "o_rail", "steel", [20.2, .2, .45], [CX, RY, RZ], bevel=.02)
box("o_rail2", "o_rail", "steelHi", [20.2, .06, .5], [CX, RY + .13, RZ])
cyl("o_hang", "o_rail", "steel2", .06, 1.3, [CX, RY + .75, RZ], axis="y", at=[[-9 + 3 * i, 0, 0] for i in range(7)])
OX0 = -8.5; FY0 = 5.55   # 起點 x 與傳送盒（懸吊時）中心高
box("o_veh", "ov", "dark", [1.9, .62, 1.05], [CX + OX0, RY - .5, RZ], bevel=.05)
box("o_vehc", "ov", "aOrange", [1.5, .12, 1.09], [CX + OX0, RY - .12, RZ])
box("o_conn", "ov", "steel2", [.3, .3, .35], [CX + OX0, RY - .02, RZ], at=[[-.55, 0, 0], [.55, 0, 0]])
cyl("o_whl", "ov", "dark2", .13, .12, [CX + OX0, RY - .02, RZ + .3], axis="z", at=[[-.55, 0, 0], [.55, 0, 0], [-.55, 0, -.6], [.55, 0, -.6]])
for i in range(5):
    cyl(f"o_belt{i}", f"ob{i}", "dark2", .04, .6, [CX + OX0, 6.32, RZ], axis="y", at=[[-.34, 0, 0], [.34, 0, 0]])
box("o_grip", "og", "steel", [1.15, .22, 1.15], [CX + OX0, FY0 + .55 + .11, RZ], bevel=.02)
box("o_fp", "of", "foup", [.95, 1.1, .95], [CX + OX0, FY0, RZ], bevel=.05)
box("o_fh", "of", "foupD", [.45, .14, .45], [CX + OX0, FY0 + .62, RZ], bevel=.03)
box("o_fw", "of", "win", [.6, .5, .04], [CX + OX0, FY0 - .1, RZ + .49])
glow("o_foupHi", "of", ["o_fp"], "lp_proc", steady=True, g=.5)
OHT_LAYERS = ["ov", "ob0", "ob1", "ob2", "ob3", "ob4", "og", "of"]
anchor("o_foup", "of", [CX + OX0 + .5, FY0 + .2, RZ + .5], dx=130, dy=-70)
anchor("o_rail", "o_rail", [CX - 4.0, RY + .1, RZ + .25], dx=-120, dy=-60)
anchor("c_ffu", "c_ceil", [CX - 6.9, 8.55, 3.5], dx=-110, dy=80)
anchor("c_grate", "c_floor", [CX - 4.0, FL + .05, 3.45], dx=-120, dy=60)
anchor("c_tool0", "c_tools", [CX + TOOLX[1] - 1.5, FL + 3.1, .95], dx=-130, dy=70)
# 氣流：FFU 往下（藍）、帶灰塵（橘小點）一起穿過格柵、在架高地板下往兩側、沿回風牆往上
for zz, nm in ((3.55, "a_dn1"), (2.4, "a_dn2")):
    flow(nm, "a_air", [[CX - 9, 8.4, zz], [CX - 9, FL + .1, zz]], n=3, lanes=19, gap=1.0, ldir=(1, 0, 0), size=.1, rate=.9, color="lp_sig", rim="lp_sigRim")
flow("a_dust", "a_dust", [[CX - 8.5, 5.0, 3.0], [CX - 8.5, FL + .1, 3.0]], n=3, lanes=9, gap=2.0, ldir=(1, 0, 0), size=.13, rate=.7, color="lp_bad", rim="lp_bad", trail=2)
flow("a_ul", "a_floor", [[CX - 1, .55, 3.0], [CX - 9.8, .55, 3.0]], n=3, lanes=1, size=.16, rate=.8, color="lp_sig", rim="lp_sigRim")
flow("a_ur", "a_floor", [[CX + 1, .55, 3.0], [CX + 9.8, .55, 3.0]], n=3, lanes=1, size=.16, rate=.8, color="lp_sig", rim="lp_sigRim")
flow("a_ucl", "a_floor", [[CX - 1, .55, 2.5], [CX - 9.8, .55, 2.5]], n=3, lanes=1, size=.16, rate=.8, color="lp_sig", rim="lp_sigRim")
flow("a_ucr", "a_floor", [[CX + 1, .55, 2.5], [CX + 9.8, .55, 2.5]], n=3, lanes=1, size=.16, rate=.8, color="lp_sig", rim="lp_sigRim")
flow("a_upl", "a_floor", [[CX - 9.85, .6, 3.05], [CX - 9.85, 8.4, 3.05]], n=4, lanes=1, size=.16, rate=.7, color="lp_sig", rim="lp_sigRim")
flow("a_upr", "a_floor", [[CX + 9.85, .6, 3.05], [CX + 9.85, 8.4, 3.05]], n=4, lanes=1, size=.16, rate=.7, color="lp_sig", rim="lp_sigRim")

# ═════════ T：機台內（x=120）：裝載口＋傳送盒（開門）＋搬運手臂（伸縮臂＋載台）＋反應腔 ═════════
TX = 120; WR = .95; FZ = -1.7
box("t_floor", "t_body", "dark2", [12, .3, 7.4], [TX, .15, -.2], bevel=.03)
box("t_back", "t_body", "wall", [12, 3.8, .22], [TX, 2.1, -3.55], bevel=.02)
box("t_wl", "t_body", "wall", [.22, 3.8, 7.0], [TX - 5.9, 2.1, -.2], bevel=.02)
box("t_wr", "t_body", "wall", [.22, 3.8, 7.0], [TX + 5.9, 2.1, -.2], bevel=.02)
box("t_band", "t_body", "aBlue", [12.1, .3, .26], [TX, 3.9, -3.55])
box("t_btop", "t_body", "win", [11.2, .8, .06], [TX, 2.6, -3.42])
box("t_rail", "t_rail", "steel", [11, .12, .5], [TX, .36, 1.2], bevel=.02)
box("t_rail2", "t_rail", "dark", [11, .08, .12], [TX, .3, 1.2], at=[[0, 0, -.38], [0, 0, .38]])
# 裝載口＋傳送盒（正面的門已打開）
box("t_lp", "t_lp", "steel", [3.0, .5, 2.7], [TX - 3.6, .55, FZ], bevel=.03)
FB = .8
box("t_fbot", "t_foup", "foup", [2.4, .16, 2.3], [TX - 3.6, FB, FZ], bevel=.03)
box("t_ftop", "t_foup", "foup", [2.4, .16, 2.3], [TX - 3.6, FB + 2.34, FZ], bevel=.03)
box("t_fbk", "t_foup", "foupD", [2.4, 2.4, .12], [TX - 3.6, FB + 1.17, FZ - 1.1], bevel=.02)
box("t_fsd", "t_foup", "foup", [.12, 2.4, 2.3], [TX - 3.6, FB + 1.17, FZ], at=[[-1.14, 0, 0], [1.14, 0, 0]], bevel=.02)
cyl("t_fh", "t_foup", "foupD", .22, .18, [TX - 3.6, FB + 2.52, FZ], axis="y")
cyl("t_fh2", "t_foup", "foupD", .42, .06, [TX - 3.6, FB + 2.66, FZ], axis="y")
box("t_fslot", "t_foup", "foupD", [.06, .04, 1.8], [TX - 3.6, FB + .3, FZ], at=[[sx, .17 * i, 0] for i in range(1, 11) for sx in (-1.05, 1.05)])
# 晶圓：最底下一片是要被搬走的（獨立層 tw），上面 10 片留在盒子裡
WY = FB + .12 + .04
cyl("t_wf", "t_wafers", "wafer", WR, .04, [TX - 3.6, WY + .17, FZ], axis="y", at=[[0, .17 * i, 0] for i in range(1, 11)])
cyl("t_tw", "tw", "waferHi", WR, .04, [TX - 3.6, WY, FZ], axis="y")
cyl("t_twr", "tw", "steelHi", WR * .55, .042, [TX - 3.6, WY, FZ], axis="y")
# 搬運手臂：底座＋伸縮臂（三節疊起）＋載片刀；整組沿軌道走
RZ0 = 1.2
box("t_rb", "rb", "dark", [1.6, .5, 1.4], [TX - 3.6, .6, RZ0], bevel=.04)
box("t_rbl", "rb", "aOrange", [1.62, .08, 1.42], [TX - 3.6, .85, RZ0])
cyl("t_rbm", "rb", "steel2", .34, .5, [TX - 3.6, 1.1, RZ0 + .3], axis="y")
box("t_p1", "rp1", "steel", [1.1, .1, 2.1], [TX - 3.6, .98, RZ0], bevel=.02)
box("t_p2", "rp2", "steel2", [.95, .09, 2.1], [TX - 3.6, .875, RZ0 - .0], bevel=.02)
box("t_bl", "rbl", "steelHi", [.7, .06, 2.4], [TX - 3.6, .78, RZ0 + .0], bevel=.01)
box("t_blc", "rbl", "gold", [.74, .062, .3], [TX - 3.6, .78, RZ0 - 1.0])
# 反應腔
CHX = TX + 3.6
box("t_cb", "t_ch", "dark", [3.2, 1.0, 3.0], [CHX, .8, FZ], bevel=.05)
box("t_cbase", "t_ch", "steel2", [3.3, .3, 3.1], [CHX, .45, FZ])
box("t_cslit", "t_ch", "slot", [2.2, .3, .06], [CHX, .95, FZ + 1.52])
box("t_cband", "t_ch", "aOrange", [3.24, .14, 3.04], [CHX, 1.32, FZ])
cyl("t_cdome", "t_ch", "steel", 1.05, .7, [CHX, 1.7, FZ], axis="y")
cyl("t_cvp", "t_cvp", "violet", .55, .06, [CHX, 2.08, FZ], axis="y")
cyl("t_cgas", "t_ch", "steel2", .16, 1.5, [CHX, 2.8, FZ], axis="y")
box("t_cgas2", "t_ch", "steel2", [.4, .16, .4], [CHX, 3.6, FZ + .0])
glow("t_plasma", "t_cvp", ["t_cvp"], "lp_vio", steady=False, g=1.0, freq=2.4)
glow("t_chhot", "t_cband", ["t_cband"], "lp_proc", steady=False, g=.7, freq=2.0) if False else None
flow("t_gas", "t_gasL", [[CHX, 3.9, FZ], [CHX, 2.2, FZ]], n=4, size=.13, rate=.9, color="lp_proc", rim="lp_proc")
cyl("t_gasr", "t_ch", "dark2", .1, 3.2, [CHX + 1.2, 2.7, FZ - .8], axis="y")
# 標註點
anchor("t_foup", "t_foup", [TX - 3.6 - 1.2, FB + 2.4, FZ + 1.1], dx=-120, dy=-60)
anchor("t_wafer", "t_wafers", [TX - 3.6 + .9, FB + 1.4, FZ + 1.1], dx=-130, dy=80)
anchor("t_arm", "rb", [TX - 3.6 - .8, .8, RZ0 + .6], dx=-80, dy=160)
anchor("t_ch", "t_ch", [CHX + 1.5, 1.7, FZ + 1.5], dx=120, dy=-60)

# ═════════ W：晶圓（x=180）═════════
WXX = 180
parts_lib = [{"part": "wafer", "id": "wf", "pos": [WXX, 0, 0], "r": 3.8, "step": .6, "t": .08, "bad": 0, "pick": [1, 2], "chuck": True}]
anchor("w_die", "wf_pick", [WXX + .6, .12, .5], dx=110, dy=-90)
anchor("w_wafer", "wf", [WXX - 3.0, .1, 2.1], dx=-120, dy=-50)

# ═════════ D：晶粒爆炸剖析（x=240）═════════
DXX = 240; DW = 6.0
def slab(pid, lay, mat, y, t): return box(pid, lay, mat, [DW, t, DW], [DXX, y, 0], bevel=.03)
y = 0.0
slab("d_si", "d_si", "si", y + .4, .8); y += .8
slab("d_ox0", "d_tr", "ox", y + .125, .25)
# 電晶體：7×7，閘極（橘）夾在源極汲極（藍）之間
TRP = [(-2.4 + .8 * i, -2.4 + .8 * j) for i in range(7) for j in range(7)]
box("d_gate", "d_tr", "gateO", [.14, .3, .5], [DXX, y + .4, 0], at=[[a, 0, b] for a, b in TRP], bevel=.02)
box("d_sd", "d_tr", "sdB", [.2, .2, .5], [DXX, y + .35, 0], at=[[a + s, 0, b] for a, b in TRP for s in (-.24, .24)], bevel=.02)
y += .25
MET = [("d_m1", .3, 14), ("d_m2", .3, 10), ("d_m3", .34, 8), ("d_m4", .4, 5)]
for k, (lay, t, nl) in enumerate(MET):
    slab(f"{lay}_s", lay, "oxD" if k % 2 else "ox", y + t / 2, t)
    horiz = k % 2 == 0
    sp = (DW - .8) / (nl - 1)
    lines = [[0, 0, -2.6 + sp * i] if horiz else [-2.6 + sp * i, 0, 0] for i in range(nl)]
    box(f"{lay}_l", lay, "cuHi", [DW - .5, .1, .12 + .03 * k] if horiz else [.12 + .03 * k, .1, DW - .5], [DXX, y + t + .045, 0], at=lines, bevel=.01)
    cyl(f"{lay}_v", lay, "cu", .07, t, [DXX, y + t / 2, 0], axis="y", at=[[-2.4 + 1.2 * i, 0, -2.4 + 1.2 * j] for i in range(5) for j in range(5) if (i + j + k) % 2 == 0])
    y += t + .09
slab("d_pass", "d_top", "pass", y + .1, .2)
box("d_pad", "d_top", "gold", [.5, .08, .5], [DXX, y + .24, 0], at=[[-2.6 + .65 * i, 0, s * 2.7] for i in range(9) for s in (-1, 1)] + [[s * 2.7, 0, -2.0 + .8 * j] for j in range(6) for s in (-1, 1)], bevel=.01)
YTOP = y + .28
for lay in ("d_si", "d_tr", "d_m1", "d_m2", "d_m3", "d_m4", "d_top"): layer(lay)
# 電訊號（接點→往下穿過金屬層與孔→電晶體）：組裝後才跑
SX, SZ = 1.2, 1.2
flow("d_sig", "d_flow", [[DXX + 2.6, YTOP + .4, 2.7], [DXX + 2.6, YTOP + .3, SZ], [DXX + SX, YTOP + .3, SZ], [DXX + SX, 1.25, SZ], [DXX + SX - .4, 1.25, SZ]], n=4, size=.11, rate=.8, color="lp_sig", rim="lp_sigRim")
glow("d_gateOn", "d_tr", ["d_gate"], "lp_proc", steady=False, g=.8, freq=2.2)
anchor("d_top", "d_top", [DXX + 2.2, YTOP, 3.0], dx=140, dy=-40)
anchor("d_m4", "d_m4", [DXX + 3.0, 2.6, 1.5], dx=140, dy=-30)
anchor("d_m1", "d_m1", [DXX + 3.0, 1.7, 2.0], dx=140, dy=10)
anchor("d_tr", "d_tr", [DXX + 3.0, 1.0, 2.2], dx=140, dy=20)
anchor("d_si", "d_si", [DXX + 3.0, .4, 2.5], dx=140, dy=60)

for _l in layers:
    if _l["id"] in ("f_gnd", "f_bg"): _l["bg"] = True
model = {
 "name": "tech-foundry：晶圓代工。零件用基本形狀＋庫的 wafer（genmodel.py 產生）。站別：F 廠區 x=0、C 無塵室 x=60、T 機台內 x=120、W 晶圓 x=180、D 晶粒爆炸剖析 x=240。",
 "unit": "示意，非實際比例", "size": {"w": 14, "h": 2, "r": .1, "t": 6},
 "palette": palette, "materials": materials, "layers": layers, "anchors": anchors,
 "parts": parts_lib + parts, "actions": actions,
 "pose": {"yaw0": 0, "yawIso": 0, "drift": 0},
 "camera": {"stand": {"d": 24, "elev": 24, "y": 4}},
 "fx": {"dpr": 1, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
}
json.dump(model, open("/home/user/ai-mp4/videos/tech-foundry/model.json", "w"), ensure_ascii=False, indent=1)
print("parts", len(parts), "layers", len(layers), "actions", len(actions), "YTOP", YTOP)
