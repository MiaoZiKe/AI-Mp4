# tech-oxidation 產生器：python3 videos/tech-oxidation/genmodel.py → model.json，並先跑 genscript.py、再把各幕 3D 動作與 2D 卡併進 script.json
# 座標：x 右、y 上、z 朝觀眾；單位約 10 cm（示意，非實際比例）。三站以 x 偏移分開，鏡頭一次只看一站：
#   F x=0    立式爐管（無塵室；機櫃剖開：半圈加熱器＋加熱線圈、石英管＋圓頂、晶舟 32 片、升降機、氧氣／水氣管、排氣、晶圓盒）   s2–s4、s10
#   R x=18   單片快速熱處理腔（燈管陣列抬高看得到、石英窗、晶圓、邊環、測溫棒）                                            s8、s10
#   Z x=30   雷射退火台（龍門架、雷射源、雷射頭左右掃、晶圓上一條發熱線）                                                  s1、s9、s10
#   X x=60   晶格剖面（矽原子＋鍵；被撞亂的原子、卡在縫裡的離子；活化後歸位、擴散、氧化層與光阻）                          s5–s7、s11
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
    d = [b[i] - a[i] for i in range(3)]; ax = max(range(3), key=lambda i: abs(d[i])); ln = abs(d[ax])
    c = [(a[i] + b[i]) / 2 for i in range(3)]
    return cyl(pid, lay, mat, r, ln, c, axis="xyz"[ax])
def pipe(pid, lay, mat, pts, r):
    for k in range(len(pts) - 1): seg(f"{pid}{k}", lay, mat, pts[k], pts[k + 1], r)
    sph(f"{pid}J", lay, mat, r * 1.15, pts[1], at=[[p[i] - pts[1][i] for i in range(3)] for p in pts[1:-1]])

palette = {"floor": "#E3E9F1", "floorG": "#A8B4C6", "wall": "#DCE4EE", "wall2": "#C9D3E1", "ffu": "#F4F7FB", "ffuG": "#C4CEDC",
 "cab": "#EEF2F7", "cab2": "#D7DEE8", "cabD": "#4A5873", "seam": "#8E9BB0", "steel": "#A9B6CA", "steel2": "#7F8CA3", "steelHi": "#C9D3E2",
 "insul": "#E8E2D6", "insulD": "#C9BFAE", "coil": "#C9763A", "heat": "#FF7A2F", "heatR": "#E04A1A", "hot": "#FFB23F",
 "quartz": "#D6E6F8", "wafer": "#B4C2DA", "die": "#7FA4E0", "ox": "#8FA8E8", "pfa": "#EFEAE0", "led": "#14C38E", "ledA": "#FF9F1C", "ledR": "#C9372C",
 "screen": "#2E6FD8", "o2": "#3E7FE0", "o2R": "#1F55B0", "h2o": "#5CC8F0", "h2oR": "#2A9FD8", "exh": "#8A96A8", "exhR": "#58647A",
 "lamp": "#F6F1DE", "laser": "#E8433A", "laserR": "#B02020", "si": "#9DB0CF", "siB": "#C3CFE2", "ion": "#E0572F", "ionR": "#9E2A1A",
 "cur": "#2F7FE0", "curR": "#1C5DB0", "resist": "#D9822B", "oxL": "#DDE6F7", "pvdf": "#F2F2EE", "bad": "#E0472F", "batch": "#F5B83D"}
def M(color, **k): return {"kind": "std", "color": color, "rough": .45, "metal": .1, **k}
U = lambda c, o=None: {"kind": "unlit", "color": c, **({"opacity": o} if o is not None else {})}
materials = {
 "floor": M("floor", rough=.55, metal=0), "floorG": U("floorG"), "wall": M("wall", rough=.7, metal=0), "wall2": M("wall2", rough=.7, metal=0),
 "ffu": U("ffu"), "ffuG": U("ffuG"), "cab": M("cab", rough=.45, metal=.1), "cab2": M("cab2", rough=.5, metal=.1),
 "cabPanel": {"kind": "phys", "color": "#F7F9FC", "rough": .3, "metal": 0, "clearcoat": .5, "env": .5}, "cabD": M("cabD", rough=.5, metal=.3), "seam": U("seam"),
 "steel": M("steel", rough=.28, metal=.88, env=.7, tex="brushed", texScale=2), "steel2": M("steel2", rough=.35, metal=.8, env=.6), "steelHi": M("steelHi", rough=.22, metal=.9, env=.9),
 "insul": M("insul", rough=.9, metal=0), "insulD": M("insulD", rough=.9, metal=0), "coil": M("coil", rough=.35, metal=.85, env=.7),
 "quartz": {"kind": "phys", "color": "quartz", "rough": .08, "metal": 0, "clearcoat": 1, "opacity": .24, "env": .6},
 "quartzRod": {"kind": "phys", "color": "quartz", "rough": .1, "metal": 0, "clearcoat": 1, "opacity": .7, "env": .6},
 "wafer": {"kind": "phys", "color": "wafer", "rough": .08, "metal": .45, "clearcoat": 1, "env": 1.0},
 "die": M("die", rough=.22, metal=.55, tex="traces", texScale=.35, env=.9), "ox": M("ox", rough=.2, metal=.2, env=.8),
 "pfa": {"kind": "phys", "color": "pfa", "rough": .3, "metal": 0, "clearcoat": .5}, "pvdf": M("pvdf", rough=.55, metal=0),
 "led": {"kind": "std", "color": "led", "emissive": "led", "ei": .9}, "ledA": {"kind": "std", "color": "ledA", "emissive": "ledA", "ei": .6}, "ledR": {"kind": "std", "color": "ledR", "emissive": "ledR", "ei": .3},
 "screen": {"kind": "screen", "color": "screen", "ei": .7}, "screenUI": U("#BFD8FF"),
 "o2": M("o2", rough=.3, metal=.1), "h2o": M("h2o", rough=.3, metal=.1), "lamp": {"kind": "phys", "color": "lamp", "rough": .15, "metal": 0, "clearcoat": 1, "env": .8},
 "laser": U("laser"), "laserBeam": U("laser", .85), "hotLine": U("hot"), "lens": {"kind": "phys", "color": "#9FD2FF", "rough": .05, "metal": 0, "clearcoat": 1, "env": 1},
 "si": M("si", rough=.3, metal=.4, env=.7), "siB": M("siB", rough=.4, metal=.2), "ion": M("ion", rough=.3, metal=.2), "oxL": M("oxL", rough=.35, metal=0), "resist": M("resist", rough=.5, metal=0),
 "air": U("#FFFFFF", .0), "tick": U("ledA"),
}
materials = {"m_" + k: v for k, v in materials.items()}
def flowx(key, lay, path, shape="dot", n=4, lanes=1, gap=.2, ldir=(1, 0, 0), size=.1, rate=1.0, color="o2", rim="o2R", trail=0, band=None, bandO=.5, rimO=.6):
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

# ═════════ 無塵室（背景，三站共用 x −20～44） ═════════
box("r_floor", "t_room", "floor", [80, .3, 40], [12, -.15, -2])
box("r_grate", "t_room", "floorG", [.1, .03, 40], [12, .02, -2], at=[[-39 + 2.0 * i, 0, 0] for i in range(40)])
box("r_grate2", "t_room", "floorG", [80, .03, .1], [12, .02, -2], at=[[0, 0, -19 + 2.0 * j] for j in range(20)])
box("r_wall", "t_room", "wall", [80, 22, .4], [12, 11, -16])
box("r_wallS", "t_room", "wall2", [.12, 21.6, .45], [12, 11, -15.9], at=[[-36 + 6 * i, 0, 0] for i in range(14)])
box("r_ffu", "t_room", "ffu", [5.6, .4, 5.6], [12, 22.2, -10], at=[[-36 + 6 * i, 0, k * 6] for i in range(13) for k in (0, 1)])
box("r_far", "t_room", "cab2", [7, 14, 6], [-16, 7, -10], at=[[0, 0, 0], [-9, 0, 0]], bevel=.1)
box("r_farD", "t_room", "cabD", [3.6, 1.2, .1], [-16, 10, -6.95], at=[[0, 0, 0], [-9, 0, 0]])

# ═════════ F：立式爐管 x=0 ═════════
FX = 0
CW, CZ0, CZ1, CH = 4.6, -4.2, 3.0, 18.4
box("f_base", "f_body", "cab", [2 * CW, 1.0, CZ1 - CZ0], [FX, .5, (CZ0 + CZ1) / 2], bevel=.05)
box("f_baseP", "f_body", "cabPanel", [2.6, .7, .06], [FX, .5, CZ1 + .03], at=[[-2.8, 0, 0], [0, 0, 0], [2.8, 0, 0]], bevel=.02)
box("f_back", "f_body", "cab", [2 * CW, CH - 1, .3], [FX, (CH + 1) / 2, CZ0 + .15], bevel=.04)
box("f_side", "f_body", "cab", [.3, CH - 1, CZ1 - CZ0], [FX, (CH + 1) / 2, (CZ0 + CZ1) / 2], at=[[-CW + .15, 0, 0], [CW - .15, 0, 0]], bevel=.04)
box("f_roof", "f_body", "cab", [2 * CW + .3, .5, CZ1 - CZ0 + .3], [FX, CH + .25, (CZ0 + CZ1) / 2], bevel=.05)
box("f_frame", "f_body", "steelHi", [.3, CH - 1, .3], [FX, (CH + 1) / 2, CZ1 - .1], at=[[-CW + .15, 0, 0], [CW - .15, 0, 0]])
box("f_mid", "f_body", "cab2", [2 * CW - .6, .3, CZ1 - CZ0 - .4], [FX, 6.8, (CZ0 + CZ1) / 2 - .3])     # 爐體與下方裝載區的隔板
box("f_ffu", "f_body", "ffu", [2 * CW - 1.4, .4, 2.0], [FX, 6.0, CZ0 + 1.2])                       # 裝載區的過濾器
cyl("f_tw", "f_body", "steel2", .12, 1.2, [CW - .6, CH + 1.1, CZ1 - .7])
cyl("f_twG", "f_body", "led", .24, .36, [CW - .6, CH + 1.9, CZ1 - .7])
cyl("f_twA", "f_body", "ledA", .24, .36, [CW - .6, CH + 2.3, CZ1 - .7])
box("f_scr", "f_body", "screen", [.12, 2.2, 3.0], [CW + .2, 10.0, .4], bevel=.03)
box("f_scrUI", "f_body", "screenUI", [.05, .12, 2.3], [CW + .28, 10.0, .4], at=[[0, -.7 + .35 * j, 0] for j in range(5)])
# 加熱器（後半圈剖開）：保溫材質板 11 片＋頂環；裡面一圈圈加熱線圈；石英管＋圓頂；底部法蘭
HY0, HY1 = 7.4, 16.2
for k in range(11):
    a = math.radians(190 + 16 * k); r = 2.75
    box(f"f_stave{k}", "f_heat", "insul", [.82, HY1 - HY0, .36], [FX + r * math.cos(a), (HY0 + HY1) / 2, r * math.sin(a)], rot=[0, R(-(math.degrees(a) + 90)), 0])
tube("f_hcap", "f_heat", "insulD", 3.05, 2.2, .5, [FX, HY1 + .25, 0])
tube("f_hbot", "f_heat", "insulD", 3.05, 2.4, .4, [FX, HY0 - .1, 0])
COILS = [[0, HY0 + .5 + .78 * i, 0] for i in range(11)]
tube("f_coil", "f_heat", "coil", 2.48, 2.4, .1, [FX, 0, 0], at=COILS)
tube("f_qz", "f_qz", "quartz", 1.95, 1.84, HY1 - HY0 + .2, [FX, (HY0 + HY1) / 2, 0])
sph("f_dome", "f_qz", "quartz", 1.95, [FX, HY1 + .1, 0], scale=[1, .38, 1])
tube("f_fl", "f_qz", "steel", 2.35, 1.9, .5, [FX, HY0 - .45, 0])
cyl("f_tc", "f_qz", "quartzRod", .08, HY1 - HY0 - .4, [FX - 1.65, (HY0 + HY1) / 2, -.6])          # 熱電偶護管
# 晶舟（layer f_boat，定義在「已送進爐管」的位置；s2 之前往下移 6.4 停在裝載區）
WN, WY0, WS, WR = 32, 8.2, .22, 1.5
WAF = [[0, WS * i, 0] for i in range(WN)]
cyl("f_wf", "f_boat", "wafer", WR, .045, [FX, WY0, 0], at=WAF)
cyl("f_wfOx", "f_ox", "ox", WR + .02, .07, [FX, WY0, 0], at=WAF)
for k, a in enumerate((200, 270, 340)):
    cyl(f"f_rod{k}", "f_boat", "quartzRod", .07, WS * WN + .5, [FX + 1.56 * math.cos(math.radians(a)), WY0 + WS * WN / 2 - .2, 1.56 * math.sin(math.radians(a))])
cyl("f_bTop", "f_boat", "quartzRod", 1.62, .1, [FX, WY0 + WS * WN + .05, 0])
cyl("f_bBot", "f_boat", "quartzRod", 1.62, .1, [FX, WY0 - .3, 0])
cyl("f_ped", "f_boat", "insul", .75, 1.2, [FX, WY0 - .95, 0])
cyl("f_cap", "f_boat", "steel", 2.3, .25, [FX, WY0 - 1.65, 0])
box("f_arm", "f_boat", "steel2", [3.2, .3, .6], [FX + 1.9, WY0 - 1.9, -1.2])
cyl("f_screw", "f_lift", "steelHi", .16, 8.0, [FX + 3.5, 4.8, -1.2])
box("f_rail", "f_lift", "steel2", [.4, 8.0, .4], [FX + 3.9, 4.8, -1.2])
# 氧氣管（藍）、水氣管（青）從右上進圓頂；排氣從底部法蘭往右下
GY = CH - .8
pipe("f_o2p", "f_gas", "o2", [[FX + CW - .6, 12.0, -1.6], [FX + CW - .6, GY, -1.6], [FX, GY, -1.6], [FX, HY1 + .7, -1.6]], .14)
pipe("f_h2op", "f_gas", "h2o", [[FX + CW - 1.2, 12.0, -2.4], [FX + CW - 1.2, GY - .5, -2.4], [FX + .5, GY - .5, -2.4], [FX + .5, HY1 + .6, -2.4]], .12)
box("f_gbox", "f_gas", "cab2", [1.4, 2.6, 2.2], [FX + CW - .9, 10.6, -2.0], bevel=.05)
box("f_valve", "f_gas", "pvdf", [.5, .4, .5], [FX + CW - .6, 13.0, -1.6], at=[[0, 0, 0], [-.6, .6, -.8]], bevel=.04)
pipe("f_exh", "f_gas", "steel2", [[FX + 2.3, HY0 - .45, .6], [FX + CW - .5, HY0 - .45, .6], [FX + CW - .5, 1.2, .6]], .3)
# 晶圓盒裝載口（左外側）
box("f_lp", "f_lp", "steel2", [2.6, 3.6, 2.8], [FX - CW - 1.6, 1.8, 1.0], bevel=.05)
box("f_foup", "f_lp", "pvdf", [2.3, 2.3, 2.3], [FX - CW - 1.6, 4.8, 1.0], at=[[0, 0, 0], [0, 2.4, 0]], bevel=.12)
box("f_foupD", "f_lp", "cab2", [1.8, 1.8, .08], [FX - CW - 1.6, 4.8, 2.18], at=[[0, 0, 0], [0, 2.4, 0]])
box("f_air", "f_qz", "air", [3.6, HY1 - HY0, 3.6], [FX, (HY0 + HY1) / 2, 0])     # 管內空間（看不見；給 flow-check 用）
for j, x in enumerate([-1.0, 0, 1.0]):
    flowx(f"o2in{j}", "f_qz", [[FX + x * .4, HY1 + .5, 0], [FX + x, HY1 - .6, 1.2], [FX + x, HY0 + 1.2, 1.2]], shape="mol", n=5, size=.16, rate=.45, color="o2", rim="o2R")
    flowx(f"h2oin{j}", "f_qz", [[FX + x * .4 + .2, HY1 + .5, 0], [FX + x + .2, HY1 - .6, 1.3], [FX + x + .2, HY0 + 1.2, 1.3]], shape="mol", n=7, size=.13, rate=.75, color="h2o", rim="h2oR")
flowx("f_o2pf", "f_gas", [[FX + CW - .6, 12.0, -1.6], [FX + CW - .6, GY, -1.6], [FX, GY, -1.6], [FX, HY1 + .7, -1.6]], shape="liquid", n=4, size=.13, rate=.6, color="o2", rim="o2R", band=.08, bandO=.7)
flowx("f_h2opf", "f_gas", [[FX + CW - 1.2, 12.0, -2.4], [FX + CW - 1.2, GY - .5, -2.4], [FX + .5, GY - .5, -2.4], [FX + .5, HY1 + .6, -2.4]], shape="liquid", n=5, size=.11, rate=.9, color="h2o", rim="h2oR", band=.07, bandO=.7)
flowx("f_exhf", "f_gas", [[FX + 2.3, HY0 - .45, .6], [FX + CW - .5, HY0 - .45, .6], [FX + CW - .5, 1.6, .6]], shape="mol", n=4, size=.14, rate=.4, color="exh", rim="exhR")
glow("f_heatOn", "f_heat", ["f_coil"], "heat", steady=True, g=.95)
glow("f_heatPulse", "f_heat", ["f_coil"], "hot", steady=False, g=.6, freq=1.2)
glow("f_batchOn", "f_boat", ["f_wf"], "batch", steady=False, g=.7, freq=1.6)
glow("f_ledG", "f_body", ["f_twG"], "led", steady=False, g=.9, freq=1.2)
anchor("f_tube", "f_qz", [FX + 1.9, 13.6, .6], dx=170, dy=-60)
anchor("f_coilA", "f_heat", [FX - 2.4, 14.8, -.6], dx=-170, dy=-60)
anchor("f_boatA", "f_boat", [FX + 1.4, WY0 + 2.0, 1.0], dx=180, dy=40)
anchor("f_boatL", "f_boat", [FX - 1.4, WY0 + 3.5, 1.0], dx=-180, dy=40)
anchor("f_o2A", "f_gas", [FX + CW - .6, 15.0, -1.6], dx=120, dy=-80)
anchor("f_h2oA", "f_gas", [FX + 1.8, GY - .5, -2.4], dx=-90, dy=-110)
anchor("f_tool", "f_body", [FX - CW + .3, CH, CZ1], dx=-80, dy=-90)

# ═════════ R：單片快速熱處理腔 x=18 ═════════
RX = 18
box("r_base", "r_body", "cab", [7.6, 3.6, 6.4], [RX, 1.8, 0], bevel=.06)
box("r_baseP", "r_body", "cabPanel", [2.2, 2.4, .06], [RX, 1.8, 3.23], at=[[-2.5, 0, 0], [0, 0, 0], [2.5, 0, 0]], bevel=.02)
cyl("r_bot", "r_ch", "steel2", 3.2, .2, [RX, 3.7, 0])
tube("r_wall", "r_ch", "steel", 3.25, 2.95, .75, [RX, 4.15, 0])
cyl("r_pyro", "r_ch", "steelHi", .1, .35, [RX, 3.95, 0], at=[[-1.0, 0, .3], [0, 0, -.4], [1.0, 0, .3]])
tube("r_ring", "r_ch", "steelHi", 1.72, 1.42, .06, [RX, 4.42, 0])
cyl("r_wf", "r_wf", "wafer", 1.5, .045, [RX, 4.48, 0])
box("r_die", "r_wf", "die", [.36, .012, .36], [RX, 4.51, 0], at=[[i * .42, 0, j * .42] for i in range(-3, 4) for j in range(-3, 4) if math.hypot(abs(i * .42) + .2, abs(j * .42) + .2) < 1.42])
cyl("r_win", "r_ch", "quartz", 3.0, .1, [RX, 4.62, 0])
for k, a in enumerate((30, 150, 270)):
    cyl(f"r_post{k}", "r_ch", "steel2", .15, 2.0, [RX + 3.05 * math.cos(math.radians(a)), 5.55, 3.05 * math.sin(math.radians(a))])
cyl("r_head", "r_lamp", "cabD", 3.25, .55, [RX, 6.83, 0])
tube("r_headR", "r_lamp", "steelHi", 3.28, 3.1, .08, [RX, 6.55, 0])
LAMPS = [[(i + (j % 2) * .5) * .52, 0, j * .45] for j in range(-6, 7) for i in range(-6, 7) if math.hypot((i + (j % 2) * .5) * .52, j * .45) < 2.75]
cyl("r_lampB", "r_lamp", "lamp", .17, .7, [RX, 6.2, 0], at=LAMPS)
pipe("r_cool", "r_lamp", "o2", [[RX - 3.3, 7.3, -1.2], [RX - 3.3, 7.3, 1.2], [RX + 3.3, 7.3, 1.2]], .1)
box("r_air", "r_lamp", "air", [6.0, 1.8, 6.0], [RX, 5.4, 0])
for j, x in enumerate([-1.6, 0, 1.6]):
    actions[f"r_wave{j}"] = {"type": "wave", "layer": "r_lamp", "from": [R(RX + x), 5.8, .4], "dir": [0, -1, 0], "reach": .9, "count": 3, "r0": .16, "spread": 1.8, "rate": 1.6, "phase": j / 3, "width": .22, "color": "heat"}
glow("r_lampOn", "r_lamp", ["r_lampB"], "hot", steady=True, g=1.0, halo=.6)
glow("r_wfHot", "r_wf", ["r_wf"], "heat", steady=True, g=.85)
anchor("r_lampA", "r_lamp", [RX + 2.6, 6.2, 1.2], dx=170, dy=-60)
anchor("r_wfA", "r_wf", [RX - 1.2, 4.5, 1.0], dx=-170, dy=70)
anchor("r_tool", "r_lamp", [RX + 2.0, 7.1, 0], dx=110, dy=-110)

# ═════════ Z：雷射退火台 x=30 ═════════
ZX = 30
box("z_base", "z_body", "cab", [7.6, 3.0, 6.4], [ZX, 1.5, 0], bevel=.06)
box("z_baseP", "z_body", "cabPanel", [2.2, 2.0, .06], [ZX, 1.5, 3.23], at=[[-2.5, 0, 0], [0, 0, 0], [2.5, 0, 0]], bevel=.02)
box("z_stage", "z_body", "steel", [5.4, .3, 4.4], [ZX, 3.15, 0], bevel=.04)
cyl("z_chuck", "z_body", "steel2", 1.8, .3, [ZX, 3.45, 0])
cyl("z_wf", "z_wf", "wafer", 1.5, .045, [ZX, 3.63, 0])
box("z_die", "z_wf", "die", [.36, .012, .36], [ZX, 3.66, 0], at=[[i * .42, 0, j * .42] for i in range(-3, 4) for j in range(-3, 4) if math.hypot(abs(i * .42) + .2, abs(j * .42) + .2) < 1.42])
box("z_post", "z_gan", "steel2", [.5, 5.2, .5], [ZX, 5.6, -2.2], at=[[-3.4, 0, 0], [3.4, 0, 0]])
box("z_beam", "z_gan", "steel", [7.4, .6, .7], [ZX, 8.4, -2.2], bevel=.04)
box("z_rail", "z_gan", "steelHi", [7.2, .1, .2], [ZX, 8.75, -1.95])
box("z_src", "z_gan", "cabD", [2.4, 1.3, 1.4], [ZX - 2.2, 9.4, -2.2], bevel=.06)
box("z_srcL", "z_gan", "laser", [.5, .12, .03], [ZX - 2.2, 9.6, -1.48])
LZ = ["z_car", "z_arm", "z_head", "z_lens", "z_ray", "z_line", "z_glowL"]
box("z_car", "z_head", "cab", [1.1, .9, .8], [ZX, 8.4, -1.5], bevel=.05)
box("z_arm", "z_head", "steelHi", [.4, .35, 1.6], [ZX, 7.9, -.8])
box("z_head", "z_head", "cab2", [.9, 1.3, .9], [ZX, 7.0, 0], bevel=.05)
cyl("z_lens", "z_head", "lens", .28, .25, [ZX, 6.25, 0])
LY0, LY1 = 3.66, 6.12
cyl("z_ray", "z_head", "laserBeam", .06, LY1 - LY0, [ZX, (LY0 + LY1) / 2, 0])
box("z_line", "z_head", "hotLine", [.12, .02, 2.0], [ZX, 3.675, 0])
box("z_glowL", "z_head", "hotLine", [.34, .012, 2.0], [ZX, 3.67, 0])
vib("z_scan", "z_head", LZ, [1, 0, 0], 1.1, .55)
glow("z_hotOn", "z_head", ["z_line", "z_glowL", "z_ray"], "hot", steady=False, g=1.0, freq=6.0, halo=.9)
anchor("z_headA", "z_head", [ZX + .5, 7.0, .4], dx=160, dy=-70)
anchor("z_lineA", "z_head", [ZX, 3.7, 1.0], dx=-160, dy=80)
anchor("z_tool", "z_gan", [ZX + 3.4, 8.6, -2.0], dx=100, dy=-80)

# ═════════ X：晶格剖面 x=60 ═════════
XX = 60; SP = 1.0; NX, NY = 11, 6
ION = [(-4, 6), (-2, 5), (0, 6), (1, 5), (3, 6), (4, 5)]
DMG = [((-3, 6), (.42, .38, .55)), ((-1, 5), (-.4, .42, .5)), ((-1, 4), (.35, -.4, .6)), ((2, 6), (-.45, .35, .5)), ((2, 4), (.4, .4, .55)), ((3, 5), (-.38, -.42, .6)), ((0, 4), (.45, .3, .5))]
IONSET = set(ION); DMGSET = {p for p, _ in DMG}
SITES = [(i, j) for i in range(-5, 6) for j in range(1, NY + 1)]
G = [[], [], []]
for (i, j) in SITES:
    for z in (0, -1):
        if z == 0 and ((i, j) in IONSET or (i, j) in DMGSET): continue
        G[(i + j) % 3].append([i * SP, j * SP, z * SP])
for g in range(3): sph(f"x_si{g}", "x_lat", "si", .26, [XX, 0, 0], at=G[g])
box("x_bx", "x_lat", "siB", [SP, .07, .07], [XX + SP / 2, 0, 0], at=[[i * SP, j * SP, z] for i in range(-5, 5) for j in range(1, NY + 1) for z in (0, -1)])
box("x_by", "x_lat", "siB", [.07, SP, .07], [XX, SP / 2, 0], at=[[i * SP, j * SP, z] for i in range(-5, 6) for j in range(1, NY) for z in (0, -1)])
box("x_bz", "x_lat", "siB", [.07, .07, SP], [XX, 0, -SP / 2], at=[[i * SP, j * SP, 0] for i in range(-5, 6) for j in range(1, NY + 1)])
box("x_base", "x_lat", "siB", [11.6, .5, 2.4], [XX, .45, -.5])
DM = []
for k, ((i, j), d) in enumerate(DMG):
    sph(f"x_d{k}", f"x_d{k}", "si", .26, [XX + i * SP, j * SP, 0]); DM.append(f"x_d{k}")
IONS = []
for k, (i, j) in enumerate(ION):
    sph(f"x_i{k}", f"x_i{k}", "ion", .31, [XX + i * SP, j * SP, 0]); IONS.append(f"x_i{k}")
box("x_oxL", "x_ox", "oxL", [11.6, .45, 2.4], [XX, NY * SP + .55, -.5])
box("x_res", "x_res", "resist", [11.6, .5, 2.4], [XX, NY * SP + 1.05, -.5])
box("x_curA", "x_cur", "air", [12.0, .9, .9], [XX, 5.5, .45])
flowx("x_cur", "x_cur", [[XX - 5.6, 5.5, .45], [XX + 5.6, 5.5, .45]], shape="arrow", n=6, size=.2, rate=.8, color="cur", rim="curR")
for g, (fq, ax) in enumerate([(5.0, [1, 0, 0]), (6.3, [0, 1, 0]), (7.1, [.7, .7, 0])]):
    vib(f"x_jit{g}", "x_lat", [f"x_si{g}"], ax, .06, fq)
vib("x_jitD", "x_lat", DM, [.6, .8, 0], .08, 5.6)
vib("x_jitI", "x_lat", IONS, [.8, .6, 0], .07, 6.6)
glow("x_ionGlow", "x_lat", IONS, "ion", steady=False, g=.8, freq=2.4)
glow("x_latHot", "x_lat", ["x_si0", "x_si1", "x_si2"], "heat", steady=True, g=.35)
anchor("x_ionA", "x_i0", [XX - 4 * SP, 6 * SP, .3], dx=-150, dy=-110)
anchor("x_ionB", "x_i4", [XX + 3 * SP, 6 * SP, .3], dx=150, dy=-110)
anchor("x_dmgA", "x_d4", [XX + 2 * SP, 4 * SP, .5], dx=170, dy=70)
anchor("x_latA", "x_lat", [XX - 5 * SP, 2 * SP, 0], dx=-130, dy=80)
anchor("x_oxA", "x_ox", [XX + 4.5, NY * SP + .7, .7], dx=150, dy=-90)
anchor("x_resA", "x_res", [XX - 4.5, NY * SP + 1.3, .7], dx=-150, dy=-90)
anchor("x_curL", "x_cur", [XX + 4.5, 5.5, .45], dx=160, dy=60)

# 主素材框（看不見；給 layout-check 判斷「卡片／標籤有沒有蓋到主體中央」）：每段只亮鏡頭對準的那一個，其他層全部標 bg
materials["m_proxy"] = {"kind": "unlit", "color": "#FFFFFF", "opacity": 0}
PXB = {"px_furn": (-4.6, 4.6, 1.0, 18.4, -4.2, 3.0), "px_rtp": (RX - 3.3, RX + 3.3, 3.6, 7.1, -3.3, 3.3), "px_laser": (ZX - 2.6, ZX + 2.6, 3.0, 6.6, -1.8, 1.8),
       "px_lat": (XX - 5.4, XX + 5.4, .2, 6.4, -1.3, .9), "px_all": (-6.2, ZX + 3.8, 0, 18.4, -4.2, 3.2)}
for lid, (x0, x1, y0, y1, z0, z1) in PXB.items():
    box(lid, lid, "proxy", [x1 - x0, y1 - y0, z1 - z0], [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2])
for l in layers:
    if not l["id"].startswith("px_"): l["bg"] = True
model = {
 "name": "tech-oxidation：氧化與熱處理。站別：F 立式爐管 x=0、R 快速熱處理腔 x=18、Z 雷射退火台 x=30、X 晶格剖面 x=60（genmodel.py 產生）",
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

VIS = [
 # 晶舟：s2 念到「排進爐管」才升進去；s4 起停在爐管裡
 mv("f_boat", HIDE, "s2:tube", dur=50, dy=-6.4),
 # 氧化層：念到「長成二氧化矽」才在每片晶圓上長出來
 hid("f_ox", HIDE, "s2:grow", 40), mv("f_ox", HIDE, "s2:tube", dur=50, dy=-6.4),
 # 晶格：被撞亂的原子 s6 念到「排回整齊」逐顆歸位；離子 s6 念到「補進原子的位置」逐顆補進，s7 擴散出去（下一站前回原位）
 hid("x_ox", HIDE, "s11:done", 20), fall("x_res", "s11:resist", dy=1.6),
]
for k, ((i, j), d) in enumerate(DMG):
    VIS.append(mv(f"x_d{k}", HIDE, off("s6:order", 3 * k), dur=18, dx=d[0], dy=d[1], dz=d[2]))
IOFF = [(.5, .5, .3), (.5, -.5, .3), (-.5, .5, .3), (.5, .5, .3), (-.5, -.5, .3), (-.5, .5, .3)]
IDIF = [(-1.6, -2.4, 0), (-1.2, -3.3, .3), (.6, -3.6, 0), (1.4, -2.6, .3), (1.9, -3.8, 0), (2.3, -2.2, .3)]
for k in range(len(ION)):
    o, df = IOFF[k], IDIF[k]
    VIS.append(mv(f"x_i{k}", HIDE, off("s6:site", 4 * k), dur=16, dx=o[0], dy=o[1], dz=o[2]))
    VIS.append(mv(f"x_i{k}", off("s7:diff", 2 * k), "s8:start+20", dur=40, dx=df[0], dy=df[1], dz=df[2]))

PXW = {"px_laser": [("s1:start-40", "s2:start-4"), ("s9:start+30", "s10:start-4")], "px_furn": [("s2:start+30", "s5:start-4")], "px_lat": [("s5:start+30", "s8:start-4"), ("s11:start+30", FAR)],
       "px_rtp": [("s8:start+30", "s9:start-4")], "px_all": [("s10:start+34", "s11:start-4")]}
for lid, wins in PXW.items():
    prev = "s1:start-60"
    for a_, b_ in wins:
        VIS.append({"layer": lid, "at": prev, "until": a_, "opacity": 0, "dur": 1}); prev = b_
    VIS.append({"layer": lid, "at": prev, "until": "s12:start+500", "opacity": 0, "dur": 1})
P = {}
P["s1"] = {"zoom": [{"to": "tool", "at": "start-30", "dur": 1}],
 "shot": [shot("start-30", ZX, 3.2, 30, 26, 1), shot("k1000", ZX, 3.0, 27, 28, 80)],
 "shift": VIS,
 "run": [run("z_scan", "start-30", "s2:start", 1), run("z_hotOn", "start-30", "s2:start", 1), run("f_ledG", "start-30", FAR, 1)],
 "labels": [lab("z_headA", "雷射頭左右掃", "Laser head scans", "blue", "heat", "s2:start-4"), lab("z_lineA", "只有這一條在發燙", "Only this line is hot", "coral", "k1000", "s2:start-4")],
 "overlay": [sec("ox-hook", "prev", "s2:start-2", "接上一支：清洗", "應用材料產品說明", {"prev": "prev", "heat": "heat", "k1000": "k1000", "ms": "ms", "why": "why"})]}
P["s2"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", FX, 6.0, 70, 14, 30), shot("temp", FX, 6.2, 66, 14, 50)],
 "run": [run("f_heatOn", "temp-4", "s5:start", 12), run("f_heatPulse", "temp", "s5:start", 12)] + [run(f"o2in{j}", "o2", "s3:wet", 8) for j in range(3)] + [run("f_o2pf", "o2-12", "s5:start", 8), run("f_exhf", "o2+20", "s5:start", 8)],
 "labels": [lab("f_boatA", "晶舟", "Wafer boat", "blue", "tube", "temp-4", xy=[220, 640]), lab("f_coilA", "加熱線圈", "Heater coils", "coral", "temp", "s3:start-4"), lab("f_o2A", "氧氣", "Oxygen", "blue", "o2", "s3:start-4")],
 "overlay": [sec("ox-grow", "start+2", "s3:start-2", "熱氧化：矽長成二氧化矽", "示意，非實際比例", {"ox": "ox", "tube": "tube", "o2": "o2", "temp": "temp", "grow": "grow"})]}
P["s3"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}],
 "shot": [shot("start-4", FX, 6.4, 62, 14, 30)],
 "run": [run(f"h2oin{j}", "wet", "s4:start+10", 8) for j in range(3)] + [run("f_h2opf", "wet-12", "s4:start+10", 8)],
 "labels": [lab("f_tube", "乾式：只通氧氣", "Dry: O₂ only", "blue", "dry", "wet-4"), lab("f_h2oA", "濕式：加水氣", "Wet: add steam", "amber", "wet", "s4:start-4")],
 "overlay": [sec("ox-dw", "start+2", "s4:start-2", "乾式 vs 濕式", "示意", {"dry": "dry", "dense": "dense", "wet": "wet", "fast": "fast"})]}
P["s4"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}],
 "shot": [shot("start-4", FX, 6.0, 66, 12, 30)],
 "run": [run("f_batchOn", "batch", "dirt", 6)],
 "labels": [lab("f_boatL", "一管一百多片", "100+ wafers per batch", "amber", "batch", "s5:start-4")],
 "overlay": [sec("ox-batch", "start+2", "s5:start-2", "表面乾淨才長得均勻", "示意", {"batch": "batch", "dirt": "dirt", "uneven": "uneven", "clean": "clean"})]}
P["s5"] = {"zoom": [{"to": "lattice", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", XX, .8, 40, 12, 30)],
 "run": [run("x_ionGlow", "ion", "s6:site", 6)],
 "labels": [lab("x_ionA", "離子卡在縫裡", "Ions in the gaps", "coral", "gap", "s6:start-4"), lab("x_dmgA", "被撞亂的原子", "Displaced atoms", "amber", "mess", "s6:start-4")],
 "overlay": [sec("ox-dmg", "start+2", "s6:start-2", "佈植之後：還不導電", "示意，非實際比例", {"anneal": "anneal", "ion": "ion", "gap": "gap", "mess": "mess", "noc": "noc"})]}
P["s6"] = {"zoom": [{"to": "lattice", "at": "start-4", "dur": 1}],
 "shot": [shot("start-4", XX, .8, 40, 12, 30)],
 "run": [run("x_latHot", "start", "s7:start+20", 10), run("x_jit0", "start", "s7:start+20", 8), run("x_jit1", "start", "s7:start+20", 8), run("x_jit2", "start", "s7:start+20", 8),
         run("x_jitD", "start", "s7:start+20", 8), run("x_jitI", "start", "s7:start+20", 8), run("x_cur", "cond", "s7:start", 8)],
 "labels": [lab("x_dmgA", "原子排回整齊", "Lattice reorders", "blue", "order", "s7:start-4", xy=[252, 311]), lab("x_ionB", "離子補進原子的位置", "Ions take lattice sites", "amber", "site", "s7:start-4", xy=[748, 790]), lab("x_curL", "開始導電", "Current flows", "blue", "cond", "s7:start-4")],
 "overlay": [sec("ox-act", "start+2", "s7:start-2", "退火：修好、活化", "示意，非實際比例", {"move": "move", "order": "order", "site": "site", "cond": "cond", "act": "act"})]}
P["s7"] = {"zoom": [{"to": "lattice", "at": "start-4", "dur": 1}],
 "shot": [shot("start-4", XX, .6, 42, 12, 30)],
 "run": [run("x_latHot", "long", "s8:start", 10), run("x_jitI", "long", "s8:start", 8), run("x_ionGlow", "diff", "s8:start", 6)],
 "labels": [lab("x_ionB", "加熱太久：離子擴散", "Too long: ions diffuse", "coral", "diff", "s8:start-4")],
 "overlay": [sec("ox-diff", "start+2", "s8:start-2", "加熱太久會怎樣", "示意", {"long": "long", "diff": "diff", "small": "small", "blur": "blur"})]}
P["s8"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", RX, 1.0, 40, 26, 30)],
 "run": [run("r_lampOn", "lamp", "peak+6", 6), run("r_wfHot", "up-6", "peak+10", 10)] + [run(f"r_wave{j}", "lamp+4", "peak", 6) for j in range(3)],
 "labels": [lab("r_lampA", "燈管陣列", "Lamp array", "amber", "lamp", "s9:start-4"), lab("r_wfA", "一次一片", "One wafer at a time", "blue", "up", "s9:start-4")],
 "overlay": [sec("ox-spike", "start+2", "s9:start-2", "尖峰退火：到頂就降", "示意", {"lamp": "lamp", "sec": "sec", "up": "up", "peak": "peak", "spike": "spike"})]}
P["s9"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", ZX, 1.2, 38, 28, 30)],
 "run": [run("z_scan", "laser-4", "s10:start+20", 6), run("z_hotOn", "laser", "s10:start+20", 6)],
 "labels": [lab("z_headA", "雷射頭", "Laser head", "blue", "laser", "s10:start-4"), lab("z_lineA", "只燒表面幾層原子", "Heats only the top layers", "coral", "top", "s10:start-4")],
 "overlay": [sec("ox-laser", "start+2", "s10:start-2", "雷射退火", "應用材料產品說明（廠商）", {"laser": "laser", "top": "top", "ms": "ms", "stay": "stay"})]}
P["s10"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", 14.0, 4.0, 110, 16, 34)],
 "run": [run("f_heatOn", "start", "s11:start", 10), run("r_lampOn", "rtp", "s11:start", 8), run("z_scan", "rtp", "s11:start", 8), run("z_hotOn", "rtp", "s11:start", 8)],
 "labels": [lab("f_tool", "國際電氣、東京威力科創", "Vertical furnace", "blue", "koku", "s11:start-4", xy=[386, 311]), lab("z_tool", "應用材料、迪恩士", "Laser anneal", "amber", "amat", "s11:start-4", xy=[774, 862])],
 "overlay": [sec("ox-co", "start+2", "s11:start-2", "誰在做", "公司產品頁、科技新報", {"koku": "koku", "tel": "tel", "rtp": "rtp", "amat": "amat", "screen": "screen", "tsmc": "tsmc"})]}
P["s11"] = {"zoom": [{"to": "lattice", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", XX, 1.6, 44, 14, 34)],
 "labels": [lab("x_oxA", "氧化層", "Oxide layer", "blue", "done+4", "next-4"), lab("x_resA", "光阻", "Photoresist", "amber", "resist+8", "next-4")],
 "overlay": [sec("ox-next", "start+2", "kw-10", "接下來", "下一支：光阻塗佈與顯影", {"done": "done", "ions": "ions", "resist": "resist", "next": "next", "kw": "kw"})]}
for sc in script["scenes"]:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])
json.dump(script, open(sp, "w"), ensure_ascii=False, indent=1)
print("script props 併入", len(P), "幕")
