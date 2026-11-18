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
 "glassD": "#3B4D6B", "mull": "#AEB9CC", "duct": "#B9C3D3", "yellow": "#F2C230", "asph": "#5F6878", "paint": "#F4F1E8", "cpu": "#E8883A", "cache": "#F2B24A", "npu": "#3F7FE0", "sram": "#2FA38F", "gpuC": "#7A5BD6", "ioC": "#14A3B8", "wirePk": "#E84FA3", "wireCy": "#38D5E8", "wireYl": "#FFD54A", "sealM": "#D8DDE8", "dieIn": "#6F95D6", "dieCore": "#E8883A", "pipeB": "#2F7FE0", "lp_heat": "#FF7A2F", "lp_bad": "#E0472F", "lp_sig": "#38B6FF", "lp_sigRim": "#1F6FEB", "lp_proc": "#FF9F1C", "lp_good": "#14A38B", "lp_warm": "#FFB020", "lp_vio": "#8E5CF0"}
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
 "glassD": M("glassD", rough=.25, metal=.4, env=.8), "mull": M("mull", rough=.4, metal=.5), "duct": M("duct", rough=.35, metal=.6, env=.6), "yellow": M("yellow", rough=.5), "asph": M("asph", rough=.95, metal=0), "paint": M("paint", rough=.6),
 "cpu": M("cpu", rough=.4, metal=.3, tex="traces", texScale=.3), "cache": M("cache", rough=.4, metal=.3, tex="traces", texScale=.22), "npu": M("npu", rough=.4, metal=.3, tex="traces", texScale=.3), "sram": M("sram", rough=.4, metal=.3, tex="traces", texScale=.16), "gpuC": M("gpuC", rough=.4, metal=.3, tex="traces", texScale=.3), "ioC": M("ioC", rough=.4, metal=.3),
 "wirePk": M("wirePk", rough=.3, metal=.6), "wireCy": M("wireCy", rough=.3, metal=.6), "wireYl": M("wireYl", rough=.3, metal=.7), "sealM": M("sealM", rough=.25, metal=.9, env=.9), "dieIn": M("dieIn", rough=.35, metal=.4), "dieCore": M("dieCore", rough=.4, metal=.3),
 "pipeB": M("pipeB", rough=.35, metal=.4),
 "violet": {"kind": "unlit", "color": "violet", "opacity": .85}, "steam": {"kind": "unlit", "color": "steam", "opacity": .45},
}
materials = {"m_" + k: v for k, v in materials.items()}

# ═════════ F：廠區（4 棟廠房排成 2×2＋公用設施；窗格、樓層線、屋頂設備、管線架、道路標線）═════════
FX0 = 0
box("f_ground", "f_gnd", "ground", [26, .3, 24], [FX0, -.15, -.5], bevel=.03)
box("f_road", "f_gnd", "asph", [26, .04, 1.9], [FX0, .02, 8.6])
box("f_lane", "f_gnd", "paint", [.8, .02, .1], [FX0, .05, 8.6], at=[[-12 + 2.0 * i, 0, 0] for i in range(13)])
box("f_edge", "f_gnd", "paint", [26, .02, .06], [FX0, .05, 8.6], at=[[0, 0, -.88], [0, 0, .88]])
box("f_zebra", "f_gnd", "paint", [.3, .02, 1.5], [FX0, .05, 8.6], at=[[.55 * i - 2.2, 0, 0] for i in range(9)])
box("f_stop", "f_gnd", "paint", [.14, .02, .9], [FX0 - 3.6, .05, 8.6])
box("f_walk", "f_gnd", "asph", [1.6, .03, 12.0], [FX0, .02, -.4])
box("f_walkl", "f_gnd", "yellow", [.06, .02, 11.6], [FX0, .05, -.4], at=[[-.7, 0, 0], [.7, 0, 0]])
box("f_cross", "f_gnd", "paint", [26, .02, .06], [FX0, .05, -1.6], at=[[0, 0, 0]])
# 停車格線（左右兩側）
box("f_park", "f_gnd", "paint", [.05, .02, .9], [FX0, .05, 6.9], at=[[-11.0 + .95 * i, 0, 0] for i in range(8)])
BLD = [("bA", "aBlue", 5.6, 4.6, 4.6, -3.6, 3.0), ("bB", "aOrange", 4.8, 3.5, 4.2, 3.8, 3.0), ("bC", "aTeal", 3.8, 2.7, 3.8, -3.6, -5.8), ("bD", "aPurple", 4.2, 3.1, 3.8, 3.8, -5.8)]
FC = {}
for bid, acc, w, h, d, c, zc in BLD:
    FC[bid] = c
    box(f"{bid}_body", bid, "wall", [w, h, d], [c, h / 2, zc], bevel=.04)
    box(f"{bid}_base", bid, "wallD", [w + .1, .5, d + .1], [c, .25, zc])
    box(f"{bid}_roof", bid, "roof", [w + .24, .2, d + .24], [c, h + .1, zc], bevel=.03)
    # 樓層線（每 1.0 一道，前面與兩側）＋外牆色帶
    nfl = int((h - .5) / 1.0)
    box(f"{bid}_flf", bid, "wallD", [w + .08, .06, .06], [c, 0, zc + d / 2 + .03], at=[[0, 1.0 * k + .55, 0] for k in range(nfl)])
    box(f"{bid}_fls", bid, "wallD", [.06, .06, d + .08], [c, 0, zc], at=[[sx * (w / 2 + .03), 1.0 * k + .55, 0] for k in range(nfl) for sx in (-1, 1)])
    box(f"{bid}_band", bid, acc, [w + .06, .36, d + .06], [c, h - .42, zc], bevel=.02)
    # 窗格：前牆 n 欄 × 樓層列；兩側牆
    n = int((w - .7) / .62); nr = max(1, nfl - 1)
    wy = [1.05 + 1.0 * k for k in range(nr)]
    box(f"{bid}_win", bid, "glassD", [.4, .5, .05], [c, 0, zc + d / 2 + .04], at=[[(i - (n - 1) / 2) * .62, y, 0] for i in range(n) for y in wy])
    box(f"{bid}_winf", bid, "mull", [.46, .56, .03], [c, 0, zc + d / 2 + .025], at=[[(i - (n - 1) / 2) * .62, y, 0] for i in range(n) for y in wy])
    ns = int((d - .7) / .62)
    box(f"{bid}_wins", bid, "glassD", [.05, .5, .4], [c, 0, zc], at=[[sx * (w / 2 + .04), y, (i - (ns - 1) / 2) * .62] for i in range(ns) for y in wy for sx in (-1, 1)])
    # 門（卷門＋人行門）與雨遮
    box(f"{bid}_door", bid, "dark2", [1.2, 1.05, .08], [c, .58, zc + d / 2 + .05])
    box(f"{bid}_dstr", bid, "yellow", [1.2, .06, .09], [c, .5, zc + d / 2 + .06], at=[[0, .2, 0], [0, -.2, 0]])
    box(f"{bid}_canopy", bid, "steel2", [1.8, .08, .6], [c, 1.25, zc + d / 2 + .3])
    # 屋頂：女兒牆、空調箱（上面風扇）、排氣管（直管＋彎頭＋管帽）、橫向風管、樓梯間
    pw = .1
    box(f"{bid}_par", bid, "wallD", [w + .3, .3, pw], [c, h + .35, zc], at=[[0, 0, d / 2 + .1], [0, 0, -d / 2 - .1]])
    box(f"{bid}_par2", bid, "wallD", [pw, .3, d + .3], [c, h + .35, zc], at=[[w / 2 + .1, 0, 0], [-w / 2 - .1, 0, 0]])
    box(f"{bid}_hv", bid, "duct", [1.0, .55, .85], [c, h + .5, zc], at=[[-w / 2 + .9, 0, -d / 4], [-w / 2 + .9, 0, d / 4 - .1], [w / 2 - .9, 0, -d / 4]], bevel=.03)
    cyl(f"{bid}_hvf", bid, "dark2", .34, .05, [c, h + .8, zc], axis="y", at=[[-w / 2 + .9, 0, -d / 4], [-w / 2 + .9, 0, d / 4 - .1], [w / 2 - .9, 0, -d / 4]])
    cyl(f"{bid}_hvh", bid, "steel2", .08, .08, [c, h + .86, zc], axis="y", at=[[-w / 2 + .9, 0, -d / 4], [-w / 2 + .9, 0, d / 4 - .1], [w / 2 - .9, 0, -d / 4]])
    cyl(f"{bid}_ex", bid, "steelHi", .13, .9, [c, h + .65, zc], axis="y", at=[[w / 2 - .5, 0, d / 4], [w / 2 - .95, 0, d / 4 + .1], [w / 2 - 1.4, 0, d / 4]])
    cyl(f"{bid}_exc", bid, "steel", .2, .06, [c, h + 1.13, zc], axis="y", at=[[w / 2 - .5, 0, d / 4], [w / 2 - .95, 0, d / 4 + .1], [w / 2 - 1.4, 0, d / 4]])
    cyl(f"{bid}_duct", bid, "duct", .14, w * .55, [c - .3, h + .42, zc + d / 2 - .4], axis="x")
    box(f"{bid}_stair", bid, "wall", [.7, .5, .7], [c, h + .45, zc], at=[[w / 2 - .6, 0, -d / 2 + .6]], bevel=.03)
    anchor(bid, bid, [c + (w / 2 - .5) * (1 if c > 0 else -1), h + .15, zc + d / 2 - .3], dx=(150 if c > 0 else -150) if zc > 0 else (110 if c > 0 else -110), dy=(-170 if zc > 0 else 290))
    anchor(bid + "_l", bid, [c - (w / 2 - .5), h + .15, zc + d / 2 - .3], dx=-150, dy=-170)
    anchor(bid + "_f", bid, [c, h - .6, zc + d / 2 + .08], dx=0, dy=-110)
# 管線架：A↔B 之間橫跨三管、前後排之間高架三管＋支柱與橫梁
for k, (mt, yy) in enumerate((("steel", 2.5), ("pipeB", 2.75), ("aOrange", 3.0))):
    cyl(f"f_prx{k}", "f_util", mt, .09, 2.2, [FX0 + .1, yy, 3.0], axis="x")
for k, (mt, xx) in enumerate((("steel", -.15), ("pipeB", .1), ("aOrange", .35))):
    cyl(f"f_prz{k}", "f_util", mt, .09, 8.6, [FX0 + xx + .1, 2.2 + .22 * k, -1.4], axis="z")
box("f_prp", "f_util", "steel2", [.14, 2.4, .14], [FX0 + .1, 1.2, -1.4], at=[[0, 0, z] for z in (-5.2, -3.6, -2.0, -.4, 1.2, 2.8)])
box("f_prb", "f_util", "steel2", [1.0, .1, .14], [FX0 + .1, 2.4, -1.4], at=[[0, 0, z] for z in (-5.2, -3.6, -2.0, -.4, 1.2, 2.8)])
# 公用設施：排氣塔（冒蒸氣）、冷卻水塔、冰水機
cyl("f_stack", "f_util", "steelHi", .3, 4.2, [FX0 + 9.0, 2.1, -10.0], axis="y", at=[[0, 0, 0], [1.1, 0, 0]])
cyl("f_stackc", "f_util", "orange", .34, .3, [FX0 + 9.0, 4.2, -10.0], axis="y", at=[[0, 0, 0], [1.1, 0, 0]])
cyl("f_stackb", "f_util", "paint", .31, .12, [FX0 + 9.0, 1.2, -10.0], axis="y", at=[[0, 0, 0], [1.1, 0, 0], [0, 1.4, 0], [1.1, 1.4, 0]])
box("f_tower", "f_util", "wallD", [2.2, 1.3, 1.8], [FX0 - 9.0, .65, -10.0], at=[[0, 0, 0], [2.6, 0, 0]], bevel=.04)
cyl("f_tfan", "f_util", "dark2", .62, .12, [FX0 - 9.0, 1.36, -10.0], axis="y", at=[[0, 0, 0], [2.6, 0, 0]])
box("f_tlv", "f_util", "slot", [1.9, .06, .05], [FX0 - 9.0, .35, -9.08], at=[[2.6 * k, .2 * j, 0] for k in range(2) for j in range(4)])
cyl("f_chill", "f_util", "steel", .75, 1.5, [FX0 - 3.0, .75, -10.4], axis="y", at=[[0, 0, 0], [1.8, 0, 0], [3.6, 0, 0]])
box("f_off", "f_bg", "wall", [3.4, 2.0, 2.2], [FX0 - 9.8, 1.0, 2.0], bevel=.04)
box("f_offb", "f_bg", "aBlue", [3.46, .26, 2.26], [FX0 - 9.8, 1.7, 2.0])
box("f_offw", "f_bg", "glassD", [.4, .4, .05], [FX0 - 9.8, 1.0, 3.12], at=[[.6 * i - 1.2, 0, 0] for i in range(5)])
box("f_wh", "f_bg", "wallD", [3.0, 1.6, 4.4], [FX0 + 10.6, .8, .6], bevel=.04)
box("f_whr", "f_bg", "roof", [3.2, .16, 4.6], [FX0 + 10.6, 1.68, .6])
box("f_whd", "f_bg", "dark2", [.8, .9, .06], [FX0 + 9.12, .5, 1.8], at=[[0, 0, 0], [0, 0, -1.2], [0, 0, 1.2]])
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
box("f_vanw", "f_van", "glassD", [.5, .3, .03], [FX0 - 9.9, .8, 8.6], at=[[0, 0, .4], [0, 0, -.4]])
cyl("f_vanwh", "f_van", "dark2", .26, .2, [FX0 - 11.0, .26, 8.6], axis="z", at=[[-.5, 0, .4], [.5, 0, .4], [-.5, 0, -.4], [.5, 0, -.4]])
box("f_car", "f_bg", "aOrange", [.62, .3, .34], [FX0 + 9.0, .2, 6.9], at=[[.95 * i, 0, 0] for i in range(4)], bevel=.04)
box("f_car2", "f_bg", "aBlue", [.62, .3, .34], [FX0 - 11.0, .2, 6.9], at=[[.95 * i, 0, 0] for i in range(4)], bevel=.04)

# ═════════ C：無塵室（x=60）；天車（OHT）夾取傳送盒（FOUP）═════════
CX = 60; FL = 1.25  # 架高地板上表面
def foup_closed(pre, cx, cy, cz, lb, ld, lw):
    """關著的傳送盒：本體、側面條紋與側把手、頂部把手（柱＋圓盤凸緣）、正面門（兩個鎖孔）、門後晶圓槽線；cy＝本體中心高"""
    box(f"{pre}_b", lb, "foup", [.95, 1.1, .95], [cx, cy, cz], bevel=.05)
    box(f"{pre}_str", lb, "foupD", [.02, .07, .72], [cx, cy, cz], at=[[sx * .485, .3 - .2 * k, 0] for k in range(5) for sx in (-1, 1)])
    box(f"{pre}_sh", lb, "foupD", [.1, .1, .3], [cx, cy + .1, cz], at=[[sx * .52, 0, 0] for sx in (-1, 1)])
    cyl(f"{pre}_hs", lb, "foupD", .07, .2, [cx, cy + .65, cz], axis="y")
    cyl(f"{pre}_hd", lb, "foupD", .24, .06, [cx, cy + .78, cz], axis="y")
    box(f"{pre}_slot", lw, "steelHi", [.7, .02, .02], [cx, cy, cz + .47], at=[[0, .36 - .08 * k, 0] for k in range(10)])
    box(f"{pre}_door", ld, "foupD", [.84, .94, .05], [cx, cy, cz + .5], bevel=.02)
    cyl(f"{pre}_lk", ld, "dark2", .06, .03, [cx, cy + .2, cz + .53], axis="z", at=[[-.22, 0, 0], [.22, 0, 0]])
    box(f"{pre}_win", ld, "win", [.34, .18, .02], [cx, cy - .22, cz + .53])
box("c_slab", "c_floor", "dark2", [20.8, .3, 8.8], [CX, -.15, 0])
cyl("c_ped", "c_floor", "steel2", .1, .95, [CX, .62, 0], axis="y", at=[[-9 + 1.5 * i, 0, -3.0 + 1.5 * j] for i in range(13) for j in range(5)])
box("c_beam", "c_floor", "steel2", [20.2, .06, .08], [CX, .22, 0], at=[[0, 0, -3.0 + 1.5 * j] for j in range(5)])
box("c_deck", "c_floor", "floorC", [20.4, .25, 8.4], [CX, FL - .125, 0], bevel=.02)
box("c_tx", "c_floor", "tile", [.05, .02, 8.4], [CX, FL + .005, 0], at=[[-9.5 + 1.0 * i, 0, 0] for i in range(20)])
box("c_tz", "c_floor", "tile", [20.4, .02, .05], [CX, FL + .005, 0], at=[[0, 0, -3.5 + 1.0 * j] for j in range(8)])
box("c_grate", "c_floor", "slot", [.78, .03, .78], [CX, FL + .02, 3.0], at=[[-9 + 1.0 * i, 0, 0] for i in range(19)])
box("c_grateb", "c_floor", "steel2", [.7, .03, .06], [CX, FL + .04, 3.0], at=[[-9 + 1.0 * i, 0, .13 * k - .26] for i in range(19) for k in range(5)])
box("c_safe", "c_floor", "yellow", [19.6, .02, .1], [CX, FL + .03, 2.0])
box("c_back", "c_wall", "wall", [20.8, 9.2, .3], [CX, 4.6, -4.35], bevel=.02)
box("c_bandw", "c_wall", "aBlue", [20.8, .3, .32], [CX, 1.6, -4.34])
box("c_pnl", "c_wall", "wallD", [.05, 6.5, .06], [CX, 5.2, -4.18], at=[[-9.5 + 1.9 * i, 0, 0] for i in range(11)])
box("c_pnlh", "c_wall", "wallD", [20.4, .05, .06], [CX, 2.2, -4.18], at=[[0, 1.4 * k, 0] for k in range(4)])
for sgn, nm in ((-1, "l"), (1, "r")):
    box(f"c_ch_{nm}", "c_wall", "dark", [.9, 8.4, .2], [CX + sgn * 9.85, 4.55, 2.9], bevel=.02)
    box(f"c_chg_{nm}", "c_wall", "slot", [.7, .05, .05], [CX + sgn * 9.85, 4.55, 3.02], at=[[0, .3 * k - 3.6, 0] for k in range(25)])
    box(f"c_chf_{nm}", "c_wall", "steel2", [1.0, .12, .5], [CX + sgn * 9.85, .62, 2.9])
box("c_ceil", "c_ceil", "wallD", [20.8, .6, 8.8], [CX, 9.5, 0], bevel=.02)
FFX = [-9 + 2 * i for i in range(10)]
box("c_ffu", "c_ceil", "ffu", [1.86, .45, 1.86], [CX, 8.78, 0], at=[[x, 0, z] for x in FFX for z in (-2.9, -.95, 1.0, 2.95)], bevel=.04)
box("c_flt", "c_ceil", "filter", [1.58, .05, 1.58], [CX, 8.52, 0], at=[[x, 0, z] for x in FFX for z in (-2.9, -.95, 1.0, 2.95)])
box("c_fltg", "c_ceil", "steel2", [1.58, .02, .03], [CX, 8.5, 0], at=[[x, 0, z + .3 * k - .6] for x in FFX for z in (-2.9, -.95, 1.0, 2.95) for k in range(5)])
cyl("c_ffh", "c_ceil", "steel2", .06, .5, [CX, 9.1, 0], axis="y", at=[[x, 0, z] for x in FFX[::2] for z in (-2.9, 1.0)])
TOOLX = [-6.5, .5, 7.5]
for k, tx in enumerate(TOOLX):
    box(f"c_t{k}_b", "c_tools", "wall", [4.4, 3.6, 2.8], [CX + tx, FL + 1.8, -.5], bevel=.05)
    box(f"c_t{k}_p", "c_tools", "win", [3.6, 1.7, .06], [CX + tx, FL + 2.1, .93])
    box(f"c_t{k}_s", "c_tools", "aBlue", [4.5, .26, 2.9], [CX + tx, FL + 3.0, -.5], bevel=.02)
    box(f"c_t{k}_top", "c_tools", "roof", [4.5, .12, 2.9], [CX + tx, FL + 3.66, -.5])
    box(f"c_t{k}_scr", "c_tools", "led", [.7, .45, .03], [CX + tx - 1.2, FL + 2.5, .97])
    box(f"c_t{k}_lv", "c_tools", "slot", [1.4, .04, .03], [CX + tx + .9, FL + 1.2, .97], at=[[0, .1 * j, 0] for j in range(8)])
    box(f"c_t{k}_hd", "c_tools", "steelHi", [.5, .06, .06], [CX + tx + 1.7, FL + 2.0, 1.0])
    box(f"c_t{k}_duct", "c_tools", "duct", [.6, .7, .6], [CX + tx - 1.2, FL + 4.1, -1.0], bevel=.03)
    cyl(f"c_t{k}_lt", "c_tools", "steel", .06, .6, [CX + tx + 1.9, FL + 4.0, -1.5], axis="y")
    cyl(f"c_t{k}_lg", "c_tools", "ledG", .1, .14, [CX + tx + 1.9, FL + 4.38, -1.5], axis="y")
    box(f"c_t{k}_lp", "c_tools", "steel", [1.5, .16, 1.1], [CX + tx, FL + 1.35, 1.45], bevel=.02)
    box(f"c_t{k}_lpb", "c_tools", "dark2", [1.5, .14, .06], [CX + tx, FL + 1.43, 2.0])
anchor("c_tool", "c_tools", [CX + .5 + 2.2, FL + 3.1, .9], dx=140, dy=-60)
LP = FL + 1.43
FCY = LP + .55
foup_closed("o_f", CX + TOOLX[0], FCY, 1.45, "of", "ofd", "ofw")
foup_closed("c_sf2", CX + TOOLX[2], FCY, 1.45, "c_sfoup", "c_sfoup", "c_sfoup")
glow("o_foupHi", "of", ["o_f_b"], "lp_proc", steady=True, g=.5)
RY = 7.2; RZ = 1.7
box("o_rail", "o_rail", "steel", [20.2, .2, .45], [CX, RY, RZ], bevel=.02)
box("o_rail2", "o_rail", "steelHi", [20.2, .06, .5], [CX, RY + .13, RZ])
box("o_railm", "o_rail", "wireYl", [20.0, .04, .08], [CX, RY - .12, RZ], at=[[0, 0, .15], [0, 0, -.15]])
cyl("o_hang", "o_rail", "steel2", .06, 1.3, [CX, RY + .75, RZ], axis="y", at=[[-9 + 3 * i, 0, 0] for i in range(7)])
box("o_hangc", "o_rail", "steel2", [.4, .08, .5], [CX, RY + 1.35, RZ], at=[[-9 + 3 * i, 0, 0] for i in range(7)])
OX0 = TOOLX[0]; GY = FCY + .55 + .43 + 1.95
box("o_veh", "ov", "dark", [1.9, .62, 1.05], [CX + OX0, RY - .5, RZ], bevel=.05)
box("o_vehc", "ov", "aOrange", [1.5, .12, 1.09], [CX + OX0, RY - .12, RZ])
box("o_vehl", "ov", "ledG", [.2, .06, .03], [CX + OX0, RY - .5, RZ + .53])
box("o_conn", "ov", "steel2", [.3, .3, .35], [CX + OX0, RY - .02, RZ], at=[[-.55, 0, 0], [.55, 0, 0]])
cyl("o_whl", "ov", "dark2", .13, .12, [CX + OX0, RY - .02, RZ + .3], axis="z", at=[[-.55, 0, 0], [.55, 0, 0], [-.55, 0, -.6], [.55, 0, -.6]])
for i in range(5):
    cyl(f"o_belt{i}", f"ob{i}", "dark2", .04, .6, [CX + OX0, 6.33, RZ], axis="y", at=[[-.34, 0, 0], [.34, 0, 0]])
box("o_grip", "og", "steel", [1.15, .22, 1.0], [CX + OX0, GY, RZ], bevel=.02)
box("o_gripm", "og", "dark", [.7, .14, .4], [CX + OX0, GY + .17, RZ])
box("o_jl", "ogl", "steelHi", [.12, .24, .6], [CX + OX0 - .52, GY - .2, RZ], bevel=.015)
box("o_jr", "ogr", "steelHi", [.12, .24, .6], [CX + OX0 + .52, GY - .2, RZ], bevel=.015)
box("o_jlp", "ogl", "dark", [.06, .12, .5], [CX + OX0 - .44, GY - .2, RZ])
box("o_jrp", "ogr", "dark", [.06, .12, .5], [CX + OX0 + .44, GY - .2, RZ])
anchor("o_foup", "of", [CX + OX0 + .5, FCY + .2, RZ + .5], dx=130, dy=-70)
anchor("o_rail", "o_rail", [CX - 4.0, RY + .1, RZ + .25], dx=-120, dy=-60)
anchor("c_ffu", "c_ceil", [CX - 6.9, 8.55, 3.5], dx=-110, dy=80)
anchor("c_grate", "c_floor", [CX - 4.0, FL + .05, 3.45], dx=-120, dy=60)
anchor("c_tool0", "c_tools", [CX + TOOLX[1] - 1.5, FL + 3.1, .95], dx=-130, dy=70)
for zz, nm in ((3.55, "a_dn1"), (2.4, "a_dn2")):
    flow(nm, "a_air", [[CX - 9, 8.4, zz], [CX - 9, FL + .1, zz]], n=3, lanes=19, gap=1.0, ldir=(1, 0, 0), size=.06, rate=.9, color="lp_sig", rim="lp_sigRim", trail=9)
flow("a_dust", "a_dust", [[CX - 8.5, 5.0, 3.0], [CX - 8.5, FL + .1, 3.0]], n=3, lanes=9, gap=2.0, ldir=(1, 0, 0), size=.11, rate=.7, color="lp_bad", rim="lp_bad", trail=2)
flow("a_ul", "a_floor", [[CX - 1, .55, 3.0], [CX - 9.8, .55, 3.0]], n=3, lanes=1, size=.07, rate=.8, color="lp_sig", rim="lp_sigRim", trail=9)
flow("a_ur", "a_floor", [[CX + 1, .55, 3.0], [CX + 9.8, .55, 3.0]], n=3, lanes=1, size=.07, rate=.8, color="lp_sig", rim="lp_sigRim", trail=9)
flow("a_ucl", "a_floor", [[CX - 1, .55, 2.5], [CX - 9.8, .55, 2.5]], n=3, lanes=1, size=.07, rate=.8, color="lp_sig", rim="lp_sigRim", trail=9)
flow("a_ucr", "a_floor", [[CX + 1, .55, 2.5], [CX + 9.8, .55, 2.5]], n=3, lanes=1, size=.07, rate=.8, color="lp_sig", rim="lp_sigRim", trail=9)
flow("a_upl", "a_floor", [[CX - 9.85, .6, 3.05], [CX - 9.85, 8.4, 3.05]], n=4, lanes=1, size=.07, rate=.7, color="lp_sig", rim="lp_sigRim", trail=9)
flow("a_upr", "a_floor", [[CX + 9.85, .6, 3.05], [CX + 9.85, 8.4, 3.05]], n=4, lanes=1, size=.07, rate=.7, color="lp_sig", rim="lp_sigRim", trail=9)

# ═════════ T：機台內（x=120）：關節搬運臂（肩→肘→腕→叉狀取片刀）＋ 開門的傳送盒（右）＋反應腔（左）═════════
TX = 120; AX = TX; AZ = -.3; WR = .95
L1, L2 = 2.4, 2.0
YF = 1.19            # 取片刀（叉）中心高；刀面 1.215，晶圓底 1.24
YE = YF + .75; YS = YE + .3
box("t_floor", "t_body", "dark2", [17.4, .3, 8.6], [TX, .15, -.3], bevel=.03)
box("t_back", "t_body", "wall", [17.4, 3.8, .22], [TX, 2.1, -4.5], bevel=.02)
box("t_wl", "t_body", "wall", [.22, 3.8, 8.2], [TX - 8.6, 2.1, -.3], bevel=.02)
box("t_wr", "t_body", "wall", [.22, 3.8, 8.2], [TX + 8.6, 2.1, -.3], bevel=.02)
box("t_band", "t_body", "aBlue", [17.5, .3, .26], [TX, 3.9, -4.5])
box("t_btop", "t_body", "win", [16.4, .8, .06], [TX, 2.6, -4.37])
box("t_bffu", "t_body", "ffu", [1.5, .22, .5], [TX, 3.55, -4.15], at=[[-7.2 + 1.8 * i, 0, 0] for i in range(9)], bevel=.03)
box("t_bled", "t_body", "ledG", [.12, .1, .03], [TX, 1.4, -4.37], at=[[-7.8 + .5 * i, 0, 0] for i in range(32)])
# 搬運臂：底座、立柱、肩→大臂→肘→小臂→腕→升降→叉（兩根叉齒＋手掌＋橫桿）
ARM = []
def A(pid, lay, mat, size, pos, **kw): box(pid, lay, mat, size, pos, **kw); ARM.append(pid); return pid
def AC(pid, lay, mat, r, h, pos, axis="y"): cyl(pid, lay, mat, r, h, pos, axis=axis); ARM.append(pid); return pid
AC("t_abase", "t_arm0", "dark", .9, .36, [AX, .48, AZ]); AC("t_abase2", "t_arm0", "aOrange", .93, .06, [AX, .68, AZ])
AC("t_acol", "t_arm0", "steel", .38, YS - .2 - .7, [AX, .7 + (YS - .2 - .7) / 2, AZ])
AC("t_shoulder", "t_arm", "steel2", .38, .42, [AX, YS, AZ])
A("t_link1", "t_arm", "steel", [L1, .26, .46], [AX + L1 / 2, YS, AZ], bevel=.03)
A("t_link1c", "t_arm", "aBlue", [L1 * .8, .27, .12], [AX + L1 / 2, YS + .005, AZ])
AC("t_elbow", "t_arm", "steel2", .3, YS - YE + .4, [AX + L1, (YS + YE) / 2, AZ])
A("t_link2", "t_arm", "steel", [L2, .22, .38], [AX + L1 + L2 / 2, YE, AZ], bevel=.03)
A("t_link2c", "t_arm", "aBlue", [L2 * .75, .23, .1], [AX + L1 + L2 / 2, YE + .005, AZ])
AC("t_hubw", "t_arm", "steel2", .22, .34, [AX + L1 + L2, YE, AZ])
WX0 = AX + L1 + L2
AC("t_quill", "t_arm", "steel2", .07, YE - YF + .1, [WX0, (YE + YF) / 2 - .05, AZ])
A("t_hand", "t_arm", "dark", [.5, .1, .56], [WX0 + .05, YF - .02, AZ], bevel=.02)
A("t_tines", "t_arm", "steelHi", [2.5, .05, .12], [WX0 + .1 + 1.25, YF, AZ], at=[[0, 0, -.3], [0, 0, .3]], bevel=.01)
A("t_bar", "t_arm", "steel2", [.12, .05, .72], [WX0 + .12, YF, AZ])
A("t_pad", "t_arm", "orange", [.1, .02, .1], [WX0 + .1 + 1.55, YF + .02, AZ], at=[[.5, 0, -.3], [.5, 0, .3], [-.7, 0, -.3], [-.7, 0, .3]])
# 傳送盒（右，朝 −x 開口，門已降到裝載口裡）：底板、頂板、背板、兩側板、晶圓槽齒、頂部把手、門框、裝載口與定位銷
RR = 4.7; FXC = TX + RR; FB = .9
box("t_lp", "t_lp", "steel", [3.2, .5, 3.3], [FXC, .55, AZ], bevel=.03)
box("t_lpd", "t_lp", "dark2", [.12, .12, 2.9], [FXC - 1.6, .62, AZ])
cyl("t_lpin", "t_lp", "steelHi", .07, .08, [FXC, .84, AZ], axis="y", at=[[-.9, 0, -1.0], [-.9, 0, 1.0], [.9, 0, 0]])
H = 2.22; TOPY = FB + H
box("t_fbot", "t_foup", "foup", [2.3, .16, 2.9], [FXC, FB, AZ], bevel=.03)
box("t_ftop", "t_foup", "foup", [2.3, .16, 2.9], [FXC, TOPY, AZ], bevel=.03)
box("t_fbk", "t_foup", "foupD", [.12, H, 2.9], [FXC + 1.15, FB + H / 2, AZ], bevel=.02)
box("t_fsd", "t_foup", "foup", [2.3, H, .12], [FXC, FB + H / 2, AZ], at=[[0, 0, -1.39], [0, 0, 1.39]], bevel=.02)
box("t_fsg", "t_foup", "foupD", [.02, H - .2, .3], [FXC - 1.17, FB + H / 2, AZ], at=[[0, 0, -1.39], [0, 0, 1.39]])
box("t_ftooth", "t_foup", "foupD", [1.9, .03, .3], [FXC, 1.26, AZ], at=[[0, .17 * k, sz] for k in range(11) for sz in (-1.2, 1.2)])
cyl("t_fh", "t_foup", "foupD", .09, .24, [FXC, TOPY + .2, AZ], axis="y")
cyl("t_fh2", "t_foup", "foupD", .3, .07, [FXC, TOPY + .34, AZ], axis="y")
box("t_ffr", "t_foup", "steelHi", [.08, H + .2, .08], [FXC - 1.17, FB + H / 2, AZ], at=[[0, 0, -1.46], [0, 0, 1.46]])
box("t_ffr2", "t_foup", "steelHi", [.08, .08, 3.0], [FXC - 1.17, FB + H + .1, AZ], at=[[0, 0, 0], [0, -H - .2, 0]])
# 晶圓：最底下一片（tw）有晶粒格與反光，上面 10 片留在盒子裡
WY0 = 1.26
cyl("t_wf", "t_wafers", "wafer", WR, .04, [FXC, WY0, AZ], axis="y", at=[[0, .17 * i, 0] for i in range(1, 11)])
cyl("t_wfr", "t_wafers", "waferHi", WR - .05, .042, [FXC, WY0, AZ], axis="y", at=[[0, .17 * i, 0] for i in range(1, 11)])
cyl("t_tw", "tw", "waferHi", WR, .04, [FXC, WY0, AZ], axis="y")
cyl("t_twr", "tw", "steelHi", WR * .5, .042, [FXC, WY0, AZ], axis="y")
TWD = [(i * .25, j * .25) for i in range(-3, 4) for j in range(-3, 4) if math.hypot(i * .25, j * .25) < .74]
box("t_twd", "tw", "dieIn", [.2, .006, .2], [FXC, WY0 + .023, AZ], at=[[a, 0, b] for a, b in TWD])
box("t_twc", "tw", "dieCore", [.09, .008, .09], [FXC, WY0 + .026, AZ], at=[[a, 0, b] for a, b in TWD])
# 反應腔（左，槽口朝 +x）：下塊、上塊、後端實心塊（前面留 2.5 深的取片槽）、圓頂、視窗、氣體管、晶圓座（三條，讓叉齒穿過）
CHW = TX - RR; CHX = TX - (RR - 1.15) - 2.0      # 晶圓中心、機身中心（機身 4.0 深，槽口面在 TX−(RR−1.15)）
SLIT = CHX + 2.0
box("t_cl", "t_ch", "dark", [4.0, .8, 3.0], [CHX, .7, AZ], bevel=.04)
box("t_cu", "t_ch", "dark", [4.0, .7, 3.0], [CHX, 1.85, AZ], bevel=.04)
box("t_crear", "t_ch", "dark", [1.5, .4, 3.0], [CHX - 1.25, 1.3, AZ])
box("t_cbase", "t_ch", "steel2", [4.1, .3, 3.1], [CHX, .45, AZ])
box("t_cband", "t_ch", "aOrange", [4.04, .12, 3.04], [CHX, 1.5, AZ])
box("t_cbolt", "t_ch", "steelHi", [.08, .08, .08], [SLIT + .02, 0, AZ], at=[[0, .55 + .2 * j, -1.2 + .8 * k] for j in range(2) for k in range(4)])
for _k, _z in enumerate((0, -.62, .62)): box(f"t_cch{_k}", "t_ch", "steel", [1.4, .04, .2], [CHW, 1.15, AZ + _z], bevel=.01)
cyl("t_cdome", "t_ch", "steel", 1.05, .7, [CHW, 2.5, AZ], axis="y")
cyl("t_cvp", "t_cvp", "violet", .55, .06, [CHW, 2.88, AZ], axis="y")
cyl("t_cgas", "t_ch", "steel2", .16, 1.4, [CHW, 3.55, AZ], axis="y")
box("t_cgas2", "t_ch", "steel2", [.4, .16, .4], [CHW, 4.3, AZ])
glow("t_plasma", "t_cvp", ["t_cvp"], "lp_vio", steady=False, g=1.0, freq=2.4)
flow("t_gas", "t_gasL", [[CHW, 4.5, AZ], [CHW, 2.95, AZ]], n=4, size=.11, rate=.9, color="lp_proc", rim="lp_proc", trail=3)
cyl("t_gasr", "t_ch", "dark2", .1, 3.2, [CHW - 1.3, 3.0, AZ - .8], axis="y")
anchor("t_foup", "t_foup", [FXC - 1.2, TOPY, AZ + 1.2], dx=-120, dy=-60)
anchor("t_wafer", "t_wafers", [FXC + .5, 2.0, AZ + 1.0], dx=130, dy=80)
anchor("t_arm", "t_arm0", [AX - .9, .7, AZ + .4], dx=-60, dy=160)
anchor("t_ch", "t_ch", [CHX - 1.5, 2.0, AZ + 1.5], dx=-120, dy=-60)
KIN_ARM = {"layer": "t_arm", "tip": "lift", "size": L1 + L2, "grip": [R(WX0 + 1.55), R(YF + .045), AZ],
  "joints": [
    {"id": "j1", "type": "rot", "axis": [0, 1, 0], "pivot": [AX, YS, AZ], "parts": ["t_shoulder", "t_link1", "t_link1c", "t_elbow"], "min": -170, "max": 170},
    {"id": "j2", "parent": "j1", "type": "rot", "axis": [0, 1, 0], "pivot": [AX + L1, YE, AZ], "parts": ["t_link2", "t_link2c", "t_hubw"], "min": -170, "max": 170},
    {"id": "j3", "parent": "j2", "type": "rot", "axis": [0, 1, 0], "pivot": [WX0, YE, AZ], "parts": [], "min": -340, "max": 340},
    {"id": "lift", "parent": "j3", "type": "slide", "axis": [0, 1, 0], "parts": ["t_quill", "t_hand", "t_tines", "t_bar", "t_pad"], "min": -.2, "max": .2}],
  "body": ARM, "info": {}}
def ik(r, th, thf):
    X, Y = r * math.cos(math.radians(th)), r * math.sin(math.radians(th))
    cb = (X * X + Y * Y - L1 * L1 - L2 * L2) / (2 * L1 * L2); b = math.acos(max(-1, min(1, cb)))
    a1 = math.atan2(Y, X) - math.atan2(L2 * math.sin(b), L1 + L2 * math.cos(b))
    j1, j2 = math.degrees(a1), math.degrees(b)
    return {"j1": R(j1), "j2": R(j2), "j3": R(thf - (j1 + j2))}

# ═════════ W：晶圓（x=180）═════════
WXX = 180
parts_lib = [{"part": "wafer", "id": "wf", "pos": [WXX, 0, 0], "r": 3.8, "step": .6, "t": .08, "bad": 0, "pick": [1, 2], "chuck": True}]
_r, _st = 3.8, .6; _ds = _st - .07; _K = math.ceil(_r / _st); WCELLS = []
for _i in range(-_K, _K + 1):
    for _j in range(-_K, _K + 1):
        _x, _z, _h = _i * _st, _j * _st, _ds / 2
        if all(math.hypot(a, b) < _r * .97 for a, b in ((_x - _h, _z - _h), (_x + _h, _z - _h), (_x - _h, _z + _h), (_x + _h, _z + _h))) and (_i, _j) != (1, 2): WCELLS.append((R(_x), R(_z)))
box("wf_dI", "wf", "dieIn", [_ds * .8, .006, _ds * .8], [WXX, .08 + .014 + .004, 0], at=[[a, 0, b] for a, b in WCELLS])
box("wf_dC", "wf", "dieCore", [_ds * .28, .008, _ds * .28], [WXX, .08 + .014 + .007, 0], at=[[a - _ds * .18, 0, b - _ds * .18] for a, b in WCELLS])
box("wf_dN", "wf", "npu", [_ds * .22, .008, _ds * .22], [WXX, .08 + .014 + .007, 0], at=[[a + _ds * .2, 0, b + _ds * .18] for a, b in WCELLS])
box("wf_ring", "wf", "waferHi", [_r * 2 * .985, .004, _r * 2 * .985], [WXX, .08 + .002, 0], shape="ring", r=.02, wall=.1) if False else None
anchor("w_die", "wf_pick", [WXX + .6, .12, .5], dx=110, dy=-90)
anchor("w_wafer", "wf", [WXX - 3.0, .1, 2.1], dx=-120, dy=-50)

# ═════════ D：晶粒爆炸剖析（x=240）；頂層是帶密封環、焊墊、區塊與走線的晶片面 ═════════
DXX = 240; DW = 6.0
def slab(pid, lay, mat, y, t): return box(pid, lay, mat, [DW, t, DW], [DXX, y, 0], bevel=.03)
y = 0.0
slab("d_si", "d_si", "si", y + .4, .8); y += .8
slab("d_ox0", "d_tr", "ox", y + .125, .25)
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
# 頂層：晶片面（密封環、焊墊、I/O 單元、區塊、走線、電源帶）
slab("d_pass", "d_top", "pass", y + .1, .2)
TY = y + .2          # 晶片面高度
box("d_seal", "d_top", "sealM", [DW - .1, .07, .12], [DXX, TY + .035, 0], at=[[0, 0, DW / 2 - .1], [0, 0, -DW / 2 + .1]])
box("d_seal2", "d_top", "sealM", [.12, .07, DW - .5], [DXX, TY + .035, 0], at=[[DW / 2 - .1, 0, 0], [-DW / 2 + .1, 0, 0]])
box("d_pad", "d_top", "gold", [.4, .08, .4], [DXX, TY + .04, 0], at=[[-2.5 + .62 * i, 0, s * 2.62] for i in range(9) for s in (-1, 1)] + [[s * 2.62, 0, -1.85 + .62 * j] for j in range(7) for s in (-1, 1)], bevel=.01)
box("d_io", "d_top", "ioC", [.34, .05, .22], [DXX, TY + .025, 0], at=[[-2.5 + .62 * i, 0, s * 2.28] for i in range(9) for s in (-1, 1)] + [[s * 2.28, 0, -1.85 + .62 * j] for j in range(7) for s in (-1, 1)])
# 區塊：CPU 2×2 核心（左上）、NPU 運算陣列（右上）、SRAM 密集格（左下）、GPU／記憶體控制器（右下）
box("d_cpu", "d_top", "cpu", [.96, .06, .96], [DXX, TY + .03, 0], at=[[-1.5 + 1.02 * i, 0, -1.5 + 1.02 * j] for i in range(2) for j in range(2)], bevel=.01)
box("d_cpuc", "d_top", "cache", [.22, .075, .22], [DXX, TY + .0375, 0], at=[[-1.5 + 1.02 * i + .22 * a - .33, 0, -1.5 + 1.02 * j + .22 * b - .33] for i in range(2) for j in range(2) for a in range(4) for b in range(4) if (a + b) % 2 == 0])
box("d_npu", "d_top", "npu", [2.0, .06, 2.0], [DXX + 1.45, TY + .03, -1.45], bevel=.01)
box("d_npuc", "d_top", "dieIn", [.2, .075, .2], [DXX + 1.45, TY + .0375, -1.45], at=[[.3 * a - .75, 0, .3 * b - .75] for a in range(6) for b in range(6)])
box("d_sram", "d_top", "sram", [2.0, .06, 2.0], [DXX - 1.45, TY + .03, 1.45], bevel=.01)
box("d_sramc", "d_top", "gold", [.09, .075, .09], [DXX - 1.45, TY + .0375, 1.45], at=[[.15 * a - .8, 0, .15 * b - .8] for a in range(12) for b in range(12) if (a * 7 + b * 3) % 5 != 0])
box("d_gpu", "d_top", "gpuC", [2.0, .06, 2.0], [DXX + 1.45, TY + .03, 1.45], bevel=.01)
box("d_gpuc", "d_top", "sealM", [1.7, .075, .07], [DXX + 1.45, TY + .0375, 1.45], at=[[0, 0, .24 * k - .84] for k in range(8)])
# 走線（粉、青、黃，橫與直）與電源帶（粗金色）
box("d_wp", "d_top", "wirePk", [2.2, .04, .035], [DXX, TY + .02, 0], at=[[.4, 0, -.05], [-.5, 0, .12], [.9, 0, .06], [-1.8, 0, -.1]])
box("d_wc", "d_top", "wireCy", [.035, .04, 2.2], [DXX, TY + .02, 0], at=[[-.05, 0, .4], [.12, 0, -.5], [.06, 0, .9], [-.1, 0, -1.7]])
box("d_wy", "d_top", "wireYl", [1.6, .04, .035], [DXX, TY + .02, 0], at=[[-1.4, 0, .06], [1.5, 0, -.08], [.2, 0, 2.3], [-.4, 0, -2.3]])
box("d_pwr", "d_top", "gold", [DW - .8, .05, .08], [DXX, TY + .025, 0], at=[[0, 0, -.52], [0, 0, .52]])
box("d_pwr2", "d_top", "gold", [.08, .05, DW - .8], [DXX, TY + .025, 0], at=[[-.52, 0, 0], [.52, 0, 0]])
YTOP = TY + .08
for lay in ("d_si", "d_tr", "d_m1", "d_m2", "d_m3", "d_m4", "d_top"): layer(lay)
SX, SZ = 1.2, 1.2
flow("d_sig", "d_flow", [[DXX + 2.62, YTOP + .4, 1.85], [DXX + 2.62, YTOP + .3, SZ], [DXX + SX, YTOP + .3, SZ], [DXX + SX, 1.25, SZ], [DXX + SX - .4, 1.25, SZ]], n=4, size=.09, rate=.8, color="lp_sig", rim="lp_sigRim", trail=5)
glow("d_gateOn", "d_tr", ["d_gate"], "lp_proc", steady=False, g=.8, freq=2.2)
anchor("d_top", "d_top", [DXX + 2.2, YTOP, 3.0], dx=140, dy=-40)
anchor("d_m4", "d_m4", [DXX + 3.0, 2.6, 1.5], dx=140, dy=-30)
anchor("d_m1", "d_m1", [DXX + 3.0, 1.7, 2.0], dx=140, dy=10)
anchor("d_tr", "d_tr", [DXX + 3.0, 1.0, 2.2], dx=140, dy=20)
anchor("d_si", "d_si", [DXX + 3.0, .4, 2.5], dx=140, dy=60)

for _l in layers:
    if _l["id"] in ("f_gnd", "f_bg", "c_floor", "c_wall", "c_ceil", "o_rail", "t_body"): _l["bg"] = True
model = {
 "name": "tech-foundry：晶圓代工。零件用基本形狀＋庫的 wafer（genmodel.py 產生）。站別：F 廠區 x=0、C 無塵室 x=60、T 機台內 x=120、W 晶圓 x=180、D 晶粒爆炸剖析 x=240。",
 "unit": "示意，非實際比例", "size": {"w": 14, "h": 2, "r": .1, "t": 6},
 "palette": palette, "materials": materials, "layers": layers, "anchors": anchors,
 "parts": parts_lib + parts, "actions": actions, "kin": {"ta": KIN_ARM},
 "pose": {"yaw0": 0, "yawIso": 0, "drift": 0},
 "camera": {"stand": {"d": 24, "elev": 24, "y": 4}},
 "fx": {"dpr": 1, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
}
json.dump(model, open("/home/user/ai-mp4/videos/tech-foundry/model.json", "w"), ensure_ascii=False, indent=1)
print("parts", len(parts), "layers", len(layers), "actions", len(actions), "YTOP", YTOP)
