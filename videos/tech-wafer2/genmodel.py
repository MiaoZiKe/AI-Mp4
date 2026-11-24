# tech-wafer2 產生器：python3 videos/tech-wafer2/genmodel.py → model.json，並先跑 genscript.py、再把各幕 3D 動作與 2D 卡併進 script.json
# 座標：x 右、y 上、z 朝觀眾；單位約 10 cm（示意，非實際比例）。四站以 x 偏移分開，鏡頭一次只看一站：
#   E x=0    磊晶爐＝主角（單片式反應腔剖開：下燈組＋金色反射板、後半上燈組、石英下罩、夾環後半圈、石墨承座＋預熱環＋石英三腳架、
#            晶圓＋缺口；左側進氣歧管＋7 噴嘴、氣瓶櫃（三氯矽烷／氫氣／摻雜氣）；右側排氣口→洗滌塔；右後傳送腔＋機械手叉送晶圓）  s1、s3、s4
#   K x=30   晶圓桌：12 吋拋光、12 吋磊晶（青色新層）、8 吋、6 吋，晶圓盒                                                 s2、s6、s7–s10
#   P x=60   原子剖面：底材（摻很多雜質，紅）＋磊晶層（照底下排列、雜質很少）                                                s5
#   M x=90   光罩（石英板＋鉻圖案＋護膜框）懸在晶圓上（下一集預告）                                                         s11
# 所有動作的 at 都寫成「幕id:cue±幀」（cue 來自 timeline.json；配音重跑 align 後重跑本檔即可）。
# 所有動作的 at 都寫成「幕id:cue±幀」（cue 來自 timeline.json；配音重跑 align 後重跑本檔即可）。
import json, math, os, random, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))
R = lambda x: round(x, 3)
rnd = random.Random(20261204)
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

palette = {"floor": "#E3E9F1", "floorG": "#A8B4C6", "wall": "#DCE4EE", "wall2": "#C9D3E1", "ffu": "#F4F7FB", "conc": "#C9CDD3", "concD": "#A9AEB6",
 "cab": "#EEF2F7", "cab2": "#D7DEE8", "cabD": "#4A5873", "steel": "#A9B6CA", "steel2": "#7F8CA3", "steelHi": "#C9D3E2",
 "sand": "#E9DCBC", "sandD": "#CDB98E", "coal": "#2F3136", "graphite": "#3B4049", "graphiteL": "#59606C", "felt": "#4B4F57",
 "brick": "#C8704A", "brickD": "#9E4F31", "copper": "#C9763A", "heat": "#FF7A2F", "hot": "#FFB23F", "arc": "#FFF4C8", "melt": "#FF8A2A",
 "mgsi": "#8C9099", "poly": "#9AA4B4", "ingot": "#55627E", "ridge": "#D7E2F2", "crucible": "#F4F1EA", "quartz": "#D6E6F8",
 "tcs": "#4FB070", "tcsR": "#2E8A4D", "h2": "#9CC3FF", "ar": "#5C95F0", "arR": "#2F6BD0", "co": "#8A96A8", "coR": "#58647A",
 "wire": "#D8DEE8", "grit": "#FFFFFF", "slurry": "#9EC5F0", "slurryR": "#4F8FD6", "pad": "#D8BE86", "padG": "#B39A63",
 "rough": "#A3AAB6", "mirror": "#C8D5EA", "die": "#7FA4E0", "epi": "#38C6D9", "pvdf": "#EFEAE0", "led": "#14C38E", "ledA": "#FF9F1C",
 "screen": "#2E6FD8", "si": "#9DB0CF", "siB": "#C3CFE2", "imp": "#E0472F", "impR": "#9E2A1A", "ele": "#2F7FE0", "eleR": "#1C5DB0"}
def M(color, **k): return {"kind": "std", "color": color, "rough": .45, "metal": .1, **k}
U = lambda c, o=None: {"kind": "unlit", "color": c, **({"opacity": o} if o is not None else {})}
materials = {
 "floor": M("floor", rough=.55, metal=0), "floorG": U("floorG"), "wall": M("wall", rough=.7, metal=0), "wall2": M("wall2", rough=.7, metal=0), "ffu": U("ffu"),
 "conc": M("conc", rough=.85, metal=0), "concD": M("concD", rough=.85, metal=0),
 "cab": M("cab", rough=.45, metal=.1), "cab2": M("cab2", rough=.5, metal=.1), "cabD": M("cabD", rough=.5, metal=.3),
 "cabPanel": {"kind": "phys", "color": "#F7F9FC", "rough": .3, "metal": 0, "clearcoat": .5, "env": .5},
 "steel": M("steel", rough=.28, metal=.88, env=.7, tex="brushed", texScale=2), "steel2": M("steel2", rough=.35, metal=.8, env=.6), "steelHi": M("steelHi", rough=.22, metal=.9, env=.9),
 "sand": M("sand", rough=.9, metal=0), "sandD": M("sandD", rough=.9, metal=0), "coal": M("coal", rough=.8, metal=.1),
 "graphite": M("graphite", rough=.6, metal=.3, env=.4), "graphiteL": M("graphiteL", rough=.55, metal=.3, env=.4), "felt": M("felt", rough=.95, metal=0),
 "brick": M("brick", rough=.9, metal=0), "brickD": M("brickD", rough=.9, metal=0), "copper": M("copper", rough=.3, metal=.9, env=.7),
 "arc": U("arc"), "hotU": U("hot"),
 "melt": {"kind": "std", "color": "#F06A10", "emissive": "#E2560F", "ei": .6, "rough": .12, "metal": .3},
 "mgsi": M("mgsi", rough=.5, metal=.6, env=.6), "poly": M("poly", rough=.4, metal=.6, env=.7),
 "ingot": {"kind": "phys", "color": "ingot", "rough": .18, "metal": .75, "clearcoat": .6, "env": 1.0}, "ridge": M("ridge", rough=.2, metal=.8, env=.9),
 "crucible": M("crucible", rough=.6, metal=0), "glass": {"kind": "phys", "color": "quartz", "rough": .08, "metal": 0, "clearcoat": 1, "opacity": .22, "env": .6},
 "rough": M("rough", rough=.75, metal=.4, tex="brushed", texScale=.6), "mirror": {"kind": "phys", "color": "mirror", "rough": .04, "metal": .55, "clearcoat": 1, "env": 1.2},
 "die": M("die", rough=.22, metal=.55, tex="traces", texScale=.35, env=.9), "epi": {"kind": "phys", "color": "epi", "rough": .1, "metal": .1, "clearcoat": 1, "opacity": .55, "env": .8},
 "wire": M("wire", rough=.2, metal=.9, env=.9), "pad": M("pad", rough=.8, metal=0), "padG": U("padG"), "pvdf": {"kind": "phys", "color": "pvdf", "rough": .3, "metal": 0, "clearcoat": .5},
 "led": {"kind": "std", "color": "led", "emissive": "led", "ei": .9}, "ledA": {"kind": "std", "color": "ledA", "emissive": "ledA", "ei": .6},
 "screen": {"kind": "screen", "color": "screen", "ei": .7}, "screenUI": U("#BFD8FF"),
 "si": M("si", rough=.3, metal=.4, env=.7), "siB": M("siB", rough=.4, metal=.2), "imp": {"kind": "std", "color": "imp", "emissive": "imp", "ei": .35, "rough": .3},
 "tcs": M("tcs", rough=.3, metal=.1), "air": U("#FFFFFF", .0),
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


# 本集多出來的顏色與材質
palette.update({"gold": "#D9A93A", "goldD": "#A87B1E", "lamp": "#FFF1C9", "lampG": "#FFC85A", "susc": "#3A3F48", "sic": "#55606E", "chrome": "#3C4250", "uv": "#7B5CFF", "uvR": "#4F35C9",
                "siE": "#8FD8E2", "siEB": "#BFE9EF", "bottleG": "#4FB070", "bottleB": "#6E9EE8", "bottleA": "#F0A530", "h2": "#9CC3FF", "h2R": "#5C8FE0"})
materials.update({"m_gold": M("gold", rough=.25, metal=.95, env=1.0), "m_goldD": M("goldD", rough=.35, metal=.9, env=.8),
                  "m_lamp": {"kind": "phys", "color": "lamp", "rough": .1, "metal": 0, "clearcoat": 1, "env": .6}, "m_susc": M("susc", rough=.55, metal=.3, env=.4),
                  "m_sic": M("sic", rough=.45, metal=.3, env=.5), "m_chrome": M("chrome", rough=.2, metal=.9, env=.9),
                  "m_mask": {"kind": "phys", "color": "#E8F1FB", "rough": .05, "metal": 0, "clearcoat": 1, "opacity": .35, "env": .9},
                  "m_siE": M("siE", rough=.3, metal=.3, env=.7), "m_siEB": M("siEB", rough=.4, metal=.1),
                  "m_bottleG": M("bottleG", rough=.35, metal=.5, env=.6), "m_bottleB": M("bottleB", rough=.35, metal=.5, env=.6), "m_bottleA": M("bottleA", rough=.35, metal=.5, env=.6)})

# ═════════ 廠房（背景，各站共用） ═════════
box("r_floor", "t_room", "floor", [140, .3, 40], [45, -.15, -2])
box("r_grate", "t_room", "floorG", [.1, .03, 40], [45, .02, -2], at=[[-69 + 2.0 * i, 0, 0] for i in range(70)])
box("r_grate2", "t_room", "floorG", [140, .03, .1], [45, .02, -2], at=[[0, 0, -19 + 2.0 * j] for j in range(20)])
box("r_wall", "t_room", "wall", [140, 26, .4], [45, 13, -16])
box("r_wallS", "t_room", "wall2", [.12, 25.6, .45], [45, 13, -15.9], at=[[-69 + 6 * i, 0, 0] for i in range(24)])
box("r_ffu", "t_room", "ffu", [5.6, .4, 5.6], [45, 26.2, -10], at=[[-69 + 6 * i, 0, k * 6] for i in range(24) for k in (0, 1)])
box("r_tray", "t_room", "steel2", [140, .25, .6], [45, 14.5, -14.6])
cyl("r_pipeW", "t_room", "steelHi", .18, 140, [45, 15.0, -14.6], axis="x", at=[[0, 0, 0], [0, .55, 0], [0, 1.1, 0]])

# ═════════ E：磊晶爐 x=0（主角） ═════════
EX = 0
WY = 4.16                      # 晶圓中心高度（放在承座上）
box("e_base", "e_body", "cab", [9.0, 3.0, 6.4], [EX, 1.5, 0], bevel=.06)
box("e_baseP", "e_body", "cabPanel", [2.6, 2.0, .06], [EX, 1.5, 3.23], at=[[-3.0, 0, 0], [0, 0, 0], [3.0, 0, 0]], bevel=.02)
box("e_baseV", "e_body", "cab2", [2.0, .06, .04], [EX, 1.0, 3.27], at=[[-3.0, .3 * j, 0] for j in range(4)] + [[3.0, .3 * j, 0] for j in range(4)])   # 散熱百葉
box("e_top", "e_body", "steel", [7.2, .3, 6.0], [EX, 3.15, 0], bevel=.03)
# 下燈組：金色反射板＋12 支鹵素燈管（沿 x）
cyl("e_refL", "e_lamp", "gold", 2.85, .1, [EX, 3.36, 0])
tube("e_refLR", "e_lamp", "goldD", 2.95, 2.8, .5, [EX, 3.55, 0])
cyl("e_lampL", "e_lamp", "lamp", .085, 4.6, [EX, 3.55, 0], axis="x", at=[[0, 0, -2.2 + .4 * j] for j in range(12)])
box("e_lampLE", "e_lamp", "steel2", [.22, .22, .22], [EX, 3.55, 0], at=[[sx * 2.4, 0, -2.2 + .4 * j] for sx in (-1, 1) for j in range(12)])   # 燈座
# 石英下罩（透明）＋夾環後半圈（剖開，前半拿掉看得到裡面）
sph("e_domeL", "e_body", "glass", 2.75, [EX, 3.95, 0], scale=[1, .16, 1])
staves("e_ring", "e_body", "steelHi", EX, 2.95, 3.85, 4.6, n=14, a0=196, a1=344, t=.38)
staves("e_ringB", "e_body", "steel2", EX, 2.95, 4.6, 4.72, n=14, a0=196, a1=344, t=.5)
# 上燈組（只有後半，剖開）：外殼、金色反射板、6 支燈管
box("e_upH", "e_lampU", "cabD", [6.2, .9, 2.6], [EX, 5.85, -1.75], bevel=.05)
box("e_refU", "e_lampU", "gold", [5.6, .08, 2.3], [EX, 5.37, -1.65])
cyl("e_lampU", "e_lampU", "lamp", .085, 4.8, [EX, 5.22, 0], axis="x", at=[[0, 0, -2.6 + .38 * j] for j in range(6)])
box("e_upPost", "e_lampU", "steel2", [.35, 1.6, .35], [EX, 4.9, -2.6], at=[[-2.9, 0, 0], [2.9, 0, 0]])
# 承座（石墨鍍碳化矽）＋預熱環＋石英三腳架＋轉軸
cyl("e_susc", "e_susc", "susc", 1.82, .16, [EX, 4.05, 0])
box("e_suscM", "e_susc", "sic", [.22, .03, .1], [EX, 4.14, 0], at=[[1.68 * math.cos(math.radians(a)), 0, 1.68 * math.sin(math.radians(a))] for a in range(0, 360, 30)])   # 承座邊緣刻痕（看得出在轉）
cyl("e_pin", "e_susc", "sic", .07, .04, [EX, 4.135, 0], at=[[.9 * math.cos(math.radians(a)), 0, .9 * math.sin(math.radians(a))] for a in (90, 210, 330)])
tube("e_pre", "e_body", "sic", 2.4, 1.9, .14, [EX, 4.05, 0])
cyl("e_shaft", "e_body", "glass", .14, 1.0, [EX, 3.45, 0])
for k, a in enumerate((30, 150, 270)):
    ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
    box(f"e_arm{k}", "e_body", "glass", [1.5, .08, .1], [EX + .75 * ca, 3.92, .75 * sa], rot=[0, R(-a), 0])
# 晶圓＋缺口；磊晶層三層（念「長出一層」一層一層出現）
cyl("e_w", "e_wafer", "mirror", 1.5, .05, [EX, WY, 0])
box("e_notch", "e_wafer", "susc", [.12, .06, .12], [EX + 1.45, WY + .005, 0])
box("e_flat", "e_wafer", "steelHi", [.5, .012, .06], [EX - .9, WY + .028, .3])          # 一道反光線（看得出晶圓在轉）
for g in range(3): cyl(f"e_g{g}", f"e_g{g}", "epi", 1.5, .024, [EX, WY + .037 + .024 * g, 0])
# 左側進氣：歧管＋7 噴嘴；氣瓶櫃（三氯矽烷綠、氫氣藍、摻雜氣橘）
box("e_inj", "e_gas", "steel", [.55, .6, 4.2], [EX - 3.35, 4.3, 0], bevel=.04)
cyl("e_noz", "e_gas", "steelHi", .09, .4, [EX - 2.95, 4.3, 0], axis="x", at=[[0, 0, -1.5 + .5 * j] for j in range(7)])
box("e_gc", "e_gas", "cab", [2.6, 6.4, 2.2], [EX - 8.4, 3.2, -1.6], bevel=.06)
box("e_gcIn", "e_gas", "cabD", [2.2, 5.4, .05], [EX - 8.4, 3.2, -.49])
for k, (mat, x) in enumerate([("bottleG", -.7), ("bottleB", 0), ("bottleA", .7)]):
    cyl(f"e_bt{k}", "e_gas", mat, .3, 3.6, [EX - 8.4 + x, 2.4, -1.0])
    cyl(f"e_btC{k}", "e_gas", "steelHi", .14, .5, [EX - 8.4 + x, 4.45, -1.0])
    cyl(f"e_btV{k}", "e_gas", "steel2", .06, .5, [EX - 8.4 + x, 4.8, -1.0], axis="z")
box("e_gcW", "e_gas", "glass", [2.3, 5.6, .06], [EX - 8.4, 3.2, -.47])
pipe("e_gp", "e_gas", "steel2", [[EX - 8.4, 6.4, -1.6], [EX - 8.4, 6.9, -1.6], [EX - 5.0, 6.9, -1.6], [EX - 5.0, 6.9, 0], [EX - 5.0, 4.3, 0], [EX - 3.65, 4.3, 0]], .13)
box("e_mfc", "e_gas", "steelHi", [.7, .5, .5], [EX - 5.0, 5.6, 0], at=[[0, 0, 0]], bevel=.04)                 # 流量控制器
box("e_mfcL", "e_gas", "led", [.12, .12, .04], [EX - 5.0, 5.7, .27])
# 右側排氣口（比晶圓低，氣體掠過晶圓再往下抽走）→ 洗滌塔
box("e_exh", "e_gas", "steel", [.55, .45, 4.2], [EX + 3.35, 3.78, 0], bevel=.04)
pipe("e_exP", "e_gas", "steel2", [[EX + 3.6, 3.78, 1.6], [EX + 5.4, 3.78, 1.6], [EX + 5.4, 3.78, 3.0], [EX + 5.4, 1.6, 3.0]], .26)
box("e_scr", "e_gas", "cabD", [1.8, 1.6, 1.6], [EX + 5.4, .8, 3.0], bevel=.05)
# 傳送腔＋機械手叉（右後）：s3 念「送進反應腔」手叉載著晶圓從右邊伸進來、放下、退回
box("e_tc", "e_tc", "cab", [3.2, 2.8, 3.4], [EX + 10.0, 4.2, -.4], bevel=.06)
box("e_tcS", "e_tc", "cabD", [.08, .6, 3.4], [EX + 8.38, 4.75, -.2])                     # 狹縫閥
box("e_tcL", "e_tc", "cab2", [3.0, .06, 3.2], [EX + 10.0, 5.65, -.4])
box("e_tcLeg", "e_tc", "steel2", [.3, 2.8, .3], [EX + 10.0, 1.4, -.4], at=[[sx * 1.3, 0, sz * 1.4] for sx in (-1, 1) for sz in (-1, 1)])
cyl("e_tcLed", "e_tc", "led", .14, .2, [EX + 11.2, 5.8, .9])
BL = 7.6                       # 手叉伸進來的距離
box("e_blade", "e_blade", "steelHi", [3.8, .06, .7], [EX + BL + .6, WY + .55, 0], bevel=.01)
box("e_bladeF", "e_blade", "steelHi", [1.4, .06, .22], [EX + BL - .9, WY + .55, 0], at=[[0, 0, -.32], [0, 0, .32]])
box("e_wrist", "e_blade", "steel2", [.6, .3, .8], [EX + BL + 2.6, WY + .55, 0], bevel=.04)
# 控制螢幕（底座前左）
box("e_scrn", "e_body", "screen", [1.6, 1.1, .06], [EX - 3.0, 2.0, 3.27], bevel=.03)
box("e_scrnUI", "e_body", "screenUI", [1.2, .07, .02], [EX - 3.0, 1.7, 3.31], at=[[0, .18 * j, 0] for j in range(5)])
cyl("e_tw", "e_body", "steel2", .08, 1.0, [EX + 4.1, 3.8, 2.9])
cyl("e_twG", "e_body", "led", .17, .26, [EX + 4.1, 4.4, 2.9])
# 流動：含矽氣體（三氯矽烷，綠色分子）從左側噴嘴掠過晶圓、從右側排氣口往下抽走；氫氣（藍色雙原子分子）同路；
#       矽原子（實心單球）從氣流落到晶圓表面黏住；燈管發光、熱往上
for j, z in enumerate([-1.0, -.35, .3, .95]):
    flowx(f"e_tcs{j}", "e_gas", [[EX - 2.75, 4.3, z], [EX - 1.2, 4.38, z], [EX + 1.2, 4.38, z * .9], [EX + 2.8, 4.1, z * .9], [EX + 3.1, 3.82, z * .9]], shape="mol", n=4, size=.13, rate=.45, color="tcs", rim="tcsR")
for j, z in enumerate([-1.3, 1.25]):
    flowx(f"e_h2{j}", "e_gas", [[EX - 2.75, 4.32, z], [EX, 4.42, z], [EX + 2.8, 4.12, z], [EX + 3.1, 3.82, z]], shape="mol", n=3, size=.09, rate=.55, color="h2", rim="h2R")
flowx("e_gIn", "e_gas", [[EX - 8.4, 6.4, -1.6], [EX - 8.4, 6.9, -1.6], [EX - 5.0, 6.9, -1.6], [EX - 5.0, 6.9, 0], [EX - 5.0, 4.3, 0], [EX - 3.65, 4.3, 0]], shape="liquid", n=6, size=.09, rate=.6, color="tcs", rim="tcsR", band=.07, bandO=.6)
for j, (x, z) in enumerate([(-.8, -.5), (.2, .6), (.9, -.3), (-.2, .1), (.5, -.9), (-.6, .8)]):
    flowx(f"e_dep{j}", "e_wafer", [[EX + x, 4.62, z], [EX + x * .97, WY + .06, z * .97]], shape="dot", n=2, size=.08, rate=.7 + .05 * j, color="si", rim="eleR", rimO=.4)
air("e_airG", "e_gas", [EX - 3.0, 3.75, -1.6], [EX + 3.3, 4.5, 1.6])
glow("e_lampOn", "e_lamp", ["e_lampL"], "lampG", steady=True, g=1.0, halo=.3)
glow("e_lampUOn", "e_lampU", ["e_lampU"], "lampG", steady=True, g=1.0, halo=.3)
glow("e_refOn", "e_lamp", ["e_refL"], "lampG", steady=True, g=.35)
glow("e_hot", "e_wafer", ["e_w"], "heat", steady=True, g=.45)
glow("e_suscHot", "e_susc", ["e_susc"], "heat", steady=True, g=.5)
glow("e_noz", "e_gas", ["e_noz"], "tcs", steady=False, g=.6, freq=1.4)
glow("e_ledG", "e_body", ["e_twG"], "led", steady=False, g=.9, freq=1.2)
for g in range(3): glow(f"e_g{g}On", f"e_g{g}", [f"e_g{g}"], "epi", steady=False, g=.6, freq=1.3)
spin("e_rotS", "e_susc", lp("e_susc"), EX, .35)
spin("e_rotW", "e_wafer", ["e_w", "e_notch", "e_flat"], EX, .35)
for g in range(3): spin(f"e_rotG{g}", f"e_g{g}", [f"e_g{g}"], EX, .35)
actions["e_heatW"] = {"type": "wave", "layer": "e_lampU", "from": [EX, 4.5, .9], "dir": [0, 1, 0], "reach": 1.0, "count": 3, "r0": .14, "spread": 1.6, "rate": 1.2, "phase": 0, "width": .2, "color": "heat"}
anchor("e_tcA", "e_tc", [EX + 8.6, 5.0, 1.2], dx=150, dy=-80)
anchor("e_lampA", "e_lamp", [EX - 2.1, 3.55, 2.0], dx=150, dy=60)
anchor("e_gasA", "e_gas", [EX + 1.5, 4.4, 1.2], dx=-160, dy=-60)
anchor("e_suscA", "e_body", [EX - 1.75, 4.1, .6], dx=170, dy=60)
anchor("e_epiA", "e_body", [EX + .4, WY + .1, .9], dx=170, dy=-70)
anchor("e_wA", "e_wafer", [EX - .6, WY + .05, .9], dx=-170, dy=60)

# ═════════ K：晶圓桌 x=30（12 吋拋光、12 吋磊晶、8 吋、6 吋） ═════════
KX = 30; KY = 2.42
box("k_tab", "k_tab", "cab2", [12.4, .35, 5.0], [KX + .6, 2.2, 0], bevel=.04)
box("k_leg", "k_tab", "steel2", [.3, 2.0, .3], [KX + .6, 1.0, 0], at=[[sx * 5.9, 0, sz * 2.2] for sx in (-1, 1) for sz in (-1, 1)])
box("k_foup", "k_tab", "pvdf", [2.6, 2.4, 2.4], [KX + 4.6, 3.6, -1.6], bevel=.14)
box("k_foupD", "k_tab", "cab2", [2.1, 1.9, .08], [KX + 4.6, 3.6, -.36])
box("k_foupS", "k_tab", "steel2", [2.0, .03, .06], [KX + 4.6, 2.8, -.3], at=[[0, .14 * j, 0] for j in range(12)])     # 盒內晶圓槽
W12P, W12E, W8, W6 = KX - 4.2, KX - .7, KX + 2.4, KX + 4.9
def wafer_flat(pid, lay, cx, r, cz=0.0, mat="mirror"):
    cyl(pid, lay, mat, r, .05, [cx, KY, cz])
    box(pid + "N", lay, "cab2", [.1, .06, .1], [cx, KY + .005, cz + r - .04])
    box(pid + "S", lay, "steelHi", [r * .5, .012, .05], [cx - r * .35, KY + .028, cz - r * .3], rot=[0, 30, 0])
wafer_flat("k_p12", "k_p12", W12P, 1.5)
wafer_flat("k_e12", "k_e12", W12E, 1.5)
cyl("k_e12L", "k_e12", "epi", 1.5, .04, [W12E, KY + .045, 0])
box("k_e12C", "k_e12", "siE", [1.5, .04, .04], [W12E + .75, KY + .045, 0])                 # 青色新層的切邊（看得出是一層）
wafer_flat("k_w8", "k_w8", W8, 1.0, cz=.6)
wafer_flat("k_w6", "k_w6", W6, .75, cz=1.2)
# 2026/11/24 審片：拋光晶圓幕補細節（倒角邊緣環、雷射刻號）；尺寸幕補 8／6 吋開放式晶圓匣（斜放、看得到一片片直立的晶圓）
tube("k_p12E", "k_p12", "steelHi", 1.5, 1.42, .06, [W12P, KY + .005, 0])
box("k_p12M", "k_p12", "cabD", [.03, .012, .03], [W12P - .45, KY + .03, 1.18], at=[[.05 * i, 0, 0] for i in range(10)])
def cassette(pre, lay, cx, cz, r, n=6):
    w = r * 2 + .2
    box(f"{pre}_sd", lay, "pvdf", [.08, r * 1.5, r * 1.6], [cx, KY + r * .75, cz], at=[[-w / 2, 0, 0], [w / 2, 0, 0]])
    box(f"{pre}_bk", lay, "pvdf", [w, .08, r * 1.6], [cx, KY + .04, cz])
    box(f"{pre}_rb", lay, "steel2", [w, .05, .04], [cx, KY + .1, cz], at=[[0, 0, -r * .7 + j * r * 1.4 / (n - 1)] for j in range(n)])
    cyl(f"{pre}_w", lay, "mirror", r * .92, .03, [cx, KY + r * .95, cz], rot=[0, 0, 0], at=[[0, 0, -r * .7 + j * r * 1.4 / (n - 1)] for j in range(n)])
cassette("k_c8", "k_w8", W8, -1.6, .7)
cassette("k_c6", "k_w6", W6, -1.3, .55)
glow("k_p12On", "k_p12", ["k_p12"], "#FFFFFF", steady=False, g=.45, freq=1.1)
glow("k_e12On", "k_e12", ["k_e12L"], "epi", steady=False, g=.6, freq=1.3)
glow("k_w8On", "k_w8", ["k_w8"], "#FFFFFF", steady=False, g=.45, freq=1.1)
glow("k_w6On", "k_w6", ["k_w6"], "#FFFFFF", steady=False, g=.45, freq=1.1)
anchor("k_p12A", "k_p12", [W12P - .9, KY, .9], dx=-160, dy=60)
anchor("k_e12A", "k_e12", [W12E + .5, KY + .05, -.9], dx=150, dy=-80)
anchor("k_w8A", "k_w8", [W8 + .4, KY, .6 - .8], dx=150, dy=-80)
anchor("k_w6A", "k_w6", [W6 + .4, KY, 1.2 + .5], dx=150, dy=60)

# ═════════ P：原子剖面 x=60（底材摻很多、磊晶層摻很少） ═════════
PX = 60; SPc = 1.0
SUB = [(i, j) for i in range(-4, 5) for j in (1, 2, 3)]
EPI = [(i, j) for i in range(-4, 5) for j in (4, 5, 6)]
DOP_S = {(-3, 1), (0, 1), (3, 1), (-1, 2), (2, 2), (-4, 3), (1, 3), (4, 2)}           # 底材：摻很多
DOP_E = {(2, 5)}                                                                       # 磊晶層：摻很少
for z in (0, -1):
    sph(f"x_sub{z}", "x_sub", "si", .26, [PX, 0, 0], at=[[i * SPc, j * SPc, z * SPc] for i, j in SUB if (i, j) not in DOP_S or z])
for j in (4, 5, 6):
    sph(f"x_epi{j}", f"x_e{j}", "siE", .26, [PX, 0, 0], at=[[i * SPc, j * SPc, z * SPc] for i in range(-4, 5) for z in (0, -1) if not ((i, j) in DOP_E and z == 0)])
    box(f"x_eb{j}", f"x_e{j}", "siEB", [SPc, .07, .07], [PX + SPc / 2, j * SPc, 0], at=[[i * SPc, 0, z] for i in range(-4, 4) for z in (0, -1)])
    box(f"x_ev{j}", f"x_e{j}", "siEB", [.07, SPc, .07], [PX, (j - .5) * SPc, 0], at=[[i * SPc, 0, z] for i in range(-4, 5) for z in (0, -1)])
box("x_bx", "x_sub", "siB", [SPc, .07, .07], [PX + SPc / 2, 0, 0], at=[[i * SPc, j * SPc, z] for i in range(-4, 4) for j in (1, 2, 3) for z in (0, -1)])
box("x_by", "x_sub", "siB", [.07, SPc, .07], [PX, SPc / 2, 0], at=[[i * SPc, j * SPc, z] for i in range(-4, 5) for j in (1, 2) for z in (0, -1)])
box("x_bz", "x_sub", "siB", [.07, .07, SPc], [PX, 0, -SPc / 2], at=[[i * SPc, j * SPc, 0] for i in range(-4, 5) for j in range(1, 7)])
box("x_base", "x_sub", "siB", [9.6, .5, 2.4], [PX, .45, -.5])
sph("x_dS", "x_dS", "imp", .3, [PX, 0, 0], at=[[i * SPc, j * SPc, 0] for i, j in sorted(DOP_S)])
sph("x_dE", "x_dE", "imp", .3, [PX, 0, 0], at=[[i * SPc, j * SPc, 0] for i, j in sorted(DOP_E)])
box("x_line", "x_sub", "ledA", [9.4, .05, .05], [PX, 3.5, .45])                        # 底材／磊晶層交界線
glow("x_dSOn", "x_dS", ["x_dS"], "imp", steady=False, g=.9, freq=2.0, halo=.5)
glow("x_dEOn", "x_dE", ["x_dE"], "imp", steady=False, g=.9, freq=2.0, halo=.6)
glow("x_lineOn", "x_sub", ["x_line"], "ledA", steady=True, g=.8)
anchor("x_epiA", "x_e6", [PX + 3.5, 6.0, .2], dx=170, dy=-60)
anchor("x_subA", "x_sub", [PX - 3.5, 1.5, .2], dx=-170, dy=60)
anchor("x_dEA", "x_dE", [PX + 2.0, 5.0, .3], dx=170, dy=-80)
anchor("x_dSA", "x_dS", [PX - 3.0, 1.0, .3], dx=-170, dy=60)

# ═════════ M：光罩 x=90（下一集預告） ═════════
MX = 90; MY = 4.4
box("m_tab", "m_tab", "cab2", [6.4, .35, 4.6], [MX, 2.2, 0], bevel=.04)
box("m_leg", "m_tab", "steel2", [.3, 2.0, .3], [MX, 1.0, 0], at=[[sx * 2.9, 0, sz * 2.0] for sx in (-1, 1) for sz in (-1, 1)])
cyl("m_w", "m_w", "mirror", 1.5, .05, [MX, 2.42, 0])
cyl("m_wL", "m_w", "epi", 1.5, .03, [MX, 2.465, 0])
box("m_plate", "m_mask", "mask", [3.4, .12, 3.4], [MX, MY, 0])
PAT = [[x * .36, 0, z * .36] for x in range(-3, 4) for z in range(-3, 4) if (x + z) % 2 == 0]
box("m_cr", "m_mask", "chrome", [.24, .02, .24], [MX, MY + .07, 0], at=PAT)
box("m_crL", "m_mask", "chrome", [2.6, .02, .05], [MX, MY + .07, 0], at=[[0, 0, -1.4], [0, 0, 1.4]])
box("m_fr", "m_mask", "steel2", [3.5, .25, .08], [MX, MY + .2, 0], at=[[0, 0, -1.71], [0, 0, 1.71]])
box("m_frS", "m_mask", "steel2", [.08, .25, 3.5], [MX, MY + .2, 0], at=[[-1.71, 0, 0], [1.71, 0, 0]])
flowx("m_uv", "m_mask", [[MX + .2, 7.6, .3], [MX + .2, MY + .12, .3]], shape="liquid", n=4, size=.1, rate=.8, color="uv", rim="uvR", band=.12, bandO=.5)
box("m_src", "m_mask", "cabD", [1.4, 1.0, 1.4], [MX + .2, 8.1, .3], bevel=.05)
air("m_airU", "m_mask", [MX - .2, MY + .1, -.1], [MX + .6, 7.6, .7])
glow("m_on", "m_mask", ["m_cr"], "uv", steady=False, g=.5, freq=1.2)
anchor("m_maskA", "m_mask", [MX + 1.6, MY + .1, .8], dx=170, dy=-70)
anchor("m_wA", "m_w", [MX - 1.2, 2.45, .8], dx=-170, dy=60)

# ═════════ T：台灣四家晶圓廠 x=138（s7–s10） ═════════
# 2026/11/24 審片必改：s7–s10 原本是「四片平面圓盤擺桌上」→ 改成四棟看得出是晶圓廠的廠房（鋸齒屋頂、屋頂空調、排氣塔、潔淨室側翼、
# 亮燈窗帶、門口晶圓盒），門口擺該公司的主力產品：環球晶＝12 吋晶圓疊、台勝科＝12 吋晶圓盒、合晶＝6／8 吋晶圓疊（一個標籤）、
# 嘉晶＝矽／碳化矽／氮化鎵三片磊晶晶圓。念到哪家，鏡頭推到那棟、廠房落下、窗帶亮起。公司識別＝3D 標籤（國旗）＋2D 卡（官方 LOGO＋國旗）。
materials.update({"m_" + k: v for k, v in {
 "win": {"kind": "std", "color": "#BFD8FF", "emissive": "#9CC3FF", "ei": .35, "rough": .2, "metal": .1},
 "roofS": M("#B7C3D4", rough=.5, metal=.3), "signB": M("#1D4293", rough=.4, metal=.1), "signA": M("#F2A21E", rough=.4, metal=.1),
 "signT": M("#00857C", rough=.4, metal=.1), "signP": M("#6A4FB3", rough=.4, metal=.1),
 "gan": {"kind": "phys", "color": "#7FA8E8", "rough": .1, "metal": .2, "clearcoat": 1, "env": .9}, "sicW": M("#5E7A6A", rough=.3, metal=.4, env=.7),
 "pvdf": {"kind": "phys", "color": "#EFEAE0", "rough": .3, "metal": 0, "clearcoat": .5}, "conc": M("#C9CDD3", rough=.85, metal=0)}.items()})
ROOT = os.path.normpath(os.path.join(D, "..", ".."))
TEX = ["flag:TW", "flag:JP", "logo:globalwafers", "logo:fst", "text:wwT=合晶|6182", "text:epiT=嘉晶|3016"]
subprocess.run(["node", os.path.join(ROOT, "scripts/three/make-brand-tex.mjs"), "tech-wafer2", *TEX], check=True, stdout=subprocess.DEVNULL)
SIGN = json.load(open(os.path.join(ROOT, "public/tex/brand/meta.json")))
def tex(name):
    materials["m_t_" + name] = {"kind": "unlit", "color": "#FFFFFF", "img": f"tex/brand/{name}.png"}; return "t_" + name
def plate(pid, lay, name, w, cx, cy, cz):
    h = w / SIGN[name]["aspect"]
    box(pid, lay, tex(name), [w, h], [cx, cy, cz], shape="plane", uv01=True, shadow=False); return h
def fab(pre, lay, x, z, sign, s=1.0, anc=None, logo=None, flag=None, flay=None, kind="std"):
    """一棟晶圓廠（原點在地面中心，s＝縮放）。kind：std｜tall（高一層＋屋頂塔）｜tanks（側邊三座原料儲槽）｜twin（雙廠房）｜dome（圓頂潔淨室）
    logo＝正面廠牌貼圖、flag＝旗桿國旗貼圖（flay＝國旗自己的層，念到時升旗）"""
    S_ = lambda v: [R(a * s) for a in v]
    P_ = lambda dx, dy, dz: [x + dx * s, dy * s, z + dz * s]
    hh = 3.2 if kind == "tall" else 2.4
    box(f"{pre}_pl", lay, "conc", S_([5.6, .3, 4.2]), P_(0, .15, 0))
    box(f"{pre}_hall", lay, "wall", S_([4.2, hh, 3.0]), P_(-.4, .3 + hh / 2, 0), bevel=.05)
    box(f"{pre}_rib", lay, "wall2", S_([.08, hh - .1, .06]), P_(-.4, .3 + hh / 2, 1.52), at=[[R(k * .7 * s), 0, 0] for k in range(-3, 4)])
    box(f"{pre}_win", lay, "win", S_([3.9, .34, .05]), P_(-.4, hh - .35, 1.53))
    box(f"{pre}_saw", lay, "roofS", S_([1.45, .12, 3.1]), P_(-.4, hh + .58, 0), rot=[0, 0, -24], at=[[R(k * 1.38 * s), 0, 0] for k in (-1, 0, 1)])
    box(f"{pre}_sawG", lay, "win", S_([.05, .5, 3.0]), P_(-.4, hh + .55, 0), at=[[R((k * 1.38 + .66) * s), 0, 0] for k in (-1, 0, 1)])
    box(f"{pre}_ahu", lay, "cab2", S_([.8, .5, .8]), P_(-.4, hh + .85, 0), at=[[R(-1.3 * s), 0, R(-.8 * s)], [R(.2 * s), 0, R(-.8 * s)]], bevel=.03)
    cyl(f"{pre}_fan", lay, "steel2", .28 * s, .08 * s, P_(-.4, hh + 1.13, 0), at=[[R(-1.3 * s), 0, R(-.8 * s)], [R(.2 * s), 0, R(-.8 * s)]])
    cyl(f"{pre}_stk", lay, "steelHi", .17 * s, 1.9 * s, P_(1.2, hh + .95, -1.1), at=[[0, 0, 0], [R(-.5 * s), 0, 0]])
    box(f"{pre}_cr", lay, "cab", S_([1.5, 1.7, 2.6]), P_(2.45, 1.15, -.1), bevel=.04)
    box(f"{pre}_crW", lay, "win", S_([1.2, .22, .05]), P_(2.45, 1.55, 1.21))
    box(f"{pre}_door", lay, "cabD", S_([.9, 1.0, .05]), P_(-1.6, .8, 1.53))
    box(f"{pre}_sign", lay, sign, S_([4.2, .12, .08]), P_(-.4, .36, 1.56))          # 公司色的勒腳色帶
    box(f"{pre}_foup", lay, "pvdf", S_([.42, .42, .42]), P_(1.6, .51, 1.75), at=[[R(i * .48 * s), R(j * .44 * s), 0] for i in (0, 1) for j in (0, 1)], bevel=.03)
    if kind == "tall":
        box(f"{pre}_twr", lay, "wall2", S_([1.2, 1.4, 1.2]), P_(-1.6, hh + 1.0, -.6), bevel=.04)
        box(f"{pre}_twrW", lay, "win", S_([1.0, .16, .04]), P_(-1.6, hh + 1.3, .02))
    if kind == "tanks":
        cyl(f"{pre}_tk", lay, "steelHi", .42 * s, 2.4 * s, P_(-2.95, 1.5, -.9), at=[[0, 0, 0], [0, 0, R(.95 * s)], [0, 0, R(1.9 * s)]])
        sph(f"{pre}_tkD", lay, "steelHi", .42 * s, P_(-2.95, 2.7, -.9), at=[[0, 0, 0], [0, 0, R(.95 * s)], [0, 0, R(1.9 * s)]])
    if kind == "twin":
        box(f"{pre}_h2", lay, "wall2", S_([2.0, 1.8, 2.2]), P_(-.9, 1.2, -2.6), bevel=.04)
        cyl(f"{pre}_stk2", lay, "steelHi", .2 * s, 2.6 * s, P_(-1.6, 3.3, -2.6), at=[[0, 0, 0], [R(.6 * s), 0, 0], [R(1.2 * s), 0, 0]])
    if kind == "dome":
        sph(f"{pre}_dm", lay, "wall2", 1.0 * s, P_(-.4, hh + .3, -.4), scale=[1.4, .55, 1.0])
    if logo:                                                                                       # 正面廠牌（貼圖）
        sw = 2.3 * s; sh = sw / SIGN[logo]["aspect"]
        box(f"{pre}_sgB", lay, "cabD", [sw + .12 * s, sh + .12 * s, .06], P_(.3, 1.25, 1.585))
        plate(f"{pre}_sg", lay, logo, sw, *P_(.3, 1.25, 1.62))
    if flag:                                                                                       # 旗桿＋國旗
        ph = 4.2 * s
        cyl(f"{pre}_fp", lay, "steelHi", .05 * s, ph, P_(2.75, ph / s / 2 + .3, 1.85))
        sph(f"{pre}_fb", lay, "steelHi", .09 * s, P_(2.75, ph / s + .32, 1.85))
        fw = 1.15 * s; fh = fw / SIGN[flag]["aspect"]
        plate(f"{pre}_fg", flay or lay, flag, fw, *P_(2.75 + 1.15 / 2 + .06, ph / s + .3 - fh / s / 2 - .06, 1.85))
    if anc: anchor(anc, lay, P_(-.4, hh + .9, .6), dx=0, dy=-120)
    return [f"{pre}_win", f"{pre}_sawG", f"{pre}_crW"]
TX = 138
TWF = [("gw", "signA", -13.5), ("fst", "signB", -4.5), ("ww", "signT", 4.5), ("epi", "signP", 13.5)]
box("t_ground", "t_site", "floor", [70, .1, 40], [TX, -.05, -2])
box("t_pad", "t_site", "conc", [36, .2, 9], [TX, .1, .5])
box("t_road", "t_site", "cabD", [34, .03, 1.4], [TX, .21, 4.6])
box("t_lane", "t_site", "ffu", [.8, .02, .12], [TX, .23, 4.6], at=[[-16 + 2 * i, 0, 0] for i in range(17)])
# 2026/11/24 審片 6.8（W1）：四家輪廓要一眼不同 → 不共用 fab()，各畫一種：
#   環球晶＝廠房群（主廠＋左側第二廠＋空橋＋晶圓盒堆）｜台勝科＝12 吋大型單棟（高、平頂、屋頂機組排、三支高煙囪、藍色腰帶）
#   合晶＝較小的雙斜頂廠房＋門口晶舟｜嘉晶＝磊晶爐棚（開放式鋼構棚，棚下三座鐘罩磊晶爐，跟 s3 反應腔同款語彙）
materials.update({"m_" + k: v for k, v in {"wallG": M("#D9E3EE", rough=.7, metal=0), "wallW": M("#F4F6F9", rough=.6, metal=0), "wallY": M("#E9DFCC", rough=.7, metal=0),
  "wallM": M("#D6E8E0", rough=.7, metal=0), "beltB": M("#2F6BD0", rough=.4, metal=.1), "roofG": M("#9AA6B8", rough=.5, metal=.4)}.items()})
def sign_on(pre, lay, name, cx, cy, cz, w):
    h = w / SIGN[name]["aspect"]
    box(f"{pre}_sgB", lay, "cabD", [w + .14, h + .14, .06], [cx, cy, cz - .02]); plate(f"{pre}_sg", lay, name, w, cx, cy, cz + .02)
def pole(pre, lay, flay, name, x, z, ph=4.4):
    cyl(f"{pre}_fp", lay, "steelHi", .05, ph, [x, .3 + ph / 2, z]); sph(f"{pre}_fb", lay, "steelHi", .09, [x, ph + .32, z])
    fw = 1.1; fh = fw / SIGN[name]["aspect"]
    box(f"{pre}_fgB", flay, "cabD", [fw + .08, fh + .08, .02], [x + fw / 2 + .06, ph + .3 - fh / 2 - .06, z - .02])   # 深色襯板：白底國旗在淺牆前也看得清
    plate(f"{pre}_fg", flay, name, fw, x + fw / 2 + .06, ph + .3 - fh / 2 - .06, z)
def saw(pre, lay, cx, y, z, w, d, n=3):
    st = w / n
    box(f"{pre}_saw", lay, "roofS", [st * 1.05, .12, d + .1], [cx, y, z], rot=[0, 0, -24], at=[[R(-w / 2 + st * (i + .5)), 0, 0] for i in range(n)])
    box(f"{pre}_sawG", lay, "win", [.05, .46, d], [cx, y - .03, z], at=[[R(-w / 2 + st * (i + 1) - .05), 0, 0] for i in range(n)])
WINS = {}
# ── 環球晶：廠房群 ──
x0, z0, L0 = TX - 13.5, -.6, "t_fab0"
box("g_pl", L0, "conc", [8.4, .3, 4.6], [x0 - 1.2, .15, z0])
box("g_h1", L0, "wallG", [4.6, 2.6, 3.0], [x0 + .4, 1.6, z0], bevel=.05); saw("g_h1", L0, x0 + .4, 3.1, z0, 4.6, 3.0, 3)
box("g_h2", L0, "wall2", [3.0, 2.0, 2.6], [x0 - 3.6, 1.3, z0 - .3], bevel=.05); saw("g_h2", L0, x0 - 3.6, 2.5, z0 - .3, 3.0, 2.6, 2)
box("g_br", L0, "win", [1.0, .5, .8], [x0 - 1.85, 2.0, z0 + .2])
box("g_w1", L0, "win", [4.3, .3, .05], [x0 + .4, 2.35, z0 + 1.53]); box("g_w2", L0, "win", [2.7, .26, .05], [x0 - 3.6, 1.85, z0 + 1.03])
box("g_ahu", L0, "cab2", [.7, .45, .7], [x0 + .4, 3.55, z0 - .8], at=[[-1.4, 0, 0], [0, 0, 0], [1.4, 0, 0]], bevel=.03)
box("g_door", L0, "cabD", [1.0, 1.1, .05], [x0 + 1.9, .85, z0 + 1.53])
sign_on("g", L0, "sign-globalwafers", x0 - .3, 1.15, z0 + 1.56, 2.0)
pole("g", L0, "t_flag0", "flag-TW", x0 - 2.5, z0 + 2.0)
WINS[0] = ["g_w1", "g_w2", "g_h1_sawG", "g_h2_sawG"]
anchor("t_gwA", L0, [x0 + .4, 3.6, z0], dx=0, dy=-120)
# ── 台勝科：12 吋大型單棟 ──
x1, z1, L1 = TX - 4.5, -.8, "t_fab1"
box("f_pl", L1, "conc", [6.6, .3, 4.8], [x1, .15, z1])
box("f_h", L1, "wallW", [5.6, 4.0, 3.6], [x1, 2.3, z1], bevel=.05)
box("f_belt", L1, "beltB", [5.62, .35, 3.62], [x1, 3.2, z1])
box("f_w", L1, "win", [5.3, .32, .05], [x1, 2.55, z1 + 1.83])
box("f_roof", L1, "roofG", [5.7, .12, 3.7], [x1, 4.36, z1])
box("f_ahu", L1, "cab2", [.7, .5, .7], [x1, 4.67, z1 - .5], at=[[-2.0 + 1.0 * i, 0, 0] for i in range(5)], bevel=.03)
cyl("f_stk", L1, "steelHi", .26, 3.4, [x1 + 1.6, 6.0, z1 - 1.2], at=[[0, 0, 0], [.75, 0, 0], [1.5, 0, 0]])
box("f_door", L1, "cabD", [1.2, 1.4, .05], [x1 + 1.9, 1.0, z1 + 1.83])
sign_on("f", L1, "sign-fst", x1 + .1, 1.45, z1 + 1.86, 2.2)   # 台勝科官方 LOGO（Commons 原檔經 thumb.php 轉 PNG）
pole("f", L1, "t_flag1", "flag-TW", x1 + 2.0, z1 + 2.2, ph=4.0)
WINS[1] = ["f_w"]
anchor("t_fstA", L1, [x1, 4.6, z1], dx=0, dy=-120)
# ── 合晶：較小的雙斜頂廠房 ──
x2, z2, L2 = TX + 4.5, -.4, "t_fab2"
box("w_pl", L2, "conc", [5.0, .3, 4.0], [x2, .15, z2])
box("w_h", L2, "wallY", [3.8, 2.0, 2.8], [x2, 1.3, z2], bevel=.05)
box("w_rf", L2, "roofG", [2.1, .12, 3.0], [x2, 0, z2], rot=[0, 0, 0], at=[[-.95, 2.62, 0]], shape="box")
box("w_rf2", L2, "roofG", [2.1, .12, 3.0], [x2, 0, z2], at=[[.95, 2.62, 0]])
for p_ in parts[-2:]: p_["rot"] = [0, 0, 22 if p_["id"] == "w_rf" else -22]
box("w_gab", L2, "wallY", [3.8, .02, .02], [x2, 2.3, z2 + 1.41])
box("w_w", L2, "win", [3.4, .26, .05], [x2, 1.75, z2 + 1.43])
cyl("w_stk", L2, "steelHi", .16, 1.6, [x2 + 1.3, 3.0, z2 - .9])
box("w_door", L2, "cabD", [.8, .9, .05], [x2 + 1.3, .75, z2 + 1.43])
sign_on("w", L2, "sign-wwT", x2 - .6, 1.0, z2 + 1.46, 1.7)
pole("w", L2, "t_flag2", "flag-TW", x2 - 2.6, z2 + 1.9, ph=3.8)
WINS[2] = ["w_w"]
anchor("t_wwF", L2, [x2, 2.9, z2], dx=0, dy=-120)
# ── 嘉晶：磊晶爐棚 ──
x3, z3, L3 = TX + 13.5, -.6, "t_fab3"
box("e2_pl", L3, "conc", [6.0, .3, 4.4], [x3, .15, z3])
box("e2_back", L3, "wallM", [5.4, 3.0, .3], [x3, 1.8, z3 - 1.8])
box("e2_col", L3, "steel2", [.22, 3.0, .22], [x3, 1.8, z3], at=[[sx * 2.6, 0, sz * 1.7] for sx in (-1, 1) for sz in (-1, 1)])
box("e2_roof", L3, "roofG", [5.8, .16, 3.9], [x3, 3.35, z3])
box("e2_beam", L3, "steel2", [5.6, .2, .18], [x3, 3.15, z3 + 1.7])
for j in range(3):
    ex = x3 - 1.7 + 1.7 * j
    box(f"e2_rb{j}", L3, "cab", [1.2, .9, 1.2], [ex, .75, z3 - .3], bevel=.04)
    tube(f"e2_ring{j}", L3, "gold", .5, .4, .14, [ex, 1.27, z3 - .3])
    sph(f"e2_bell{j}", L3, "glass", .46, [ex, 1.34, z3 - .3], scale=[1, .9, 1])
    sph(f"e2_glow{j}", L3, "lamp", .28, [ex, 1.38, z3 - .3], scale=[1, .7, 1])
    cyl(f"e2_gas{j}", L3, "steelHi", .06, 1.6, [ex + .45, 2.0, z3 - .9])
sign_on("e2", L3, "sign-epiT", x3, 2.75, z3 + 1.8, 2.0)
pole("e2", L3, "t_flag3", "flag-TW", x3 - 3.2, z3 + 2.0)
WINS[3] = [f"e2_glow{j}" for j in range(3)]
anchor("t_epiA", L3, [x3, 3.5, z3], dx=0, dy=-120)
for k in range(4):
    glow(f"t_on{k}", f"t_fab{k}", WINS[k], "#FFC85A" if k == 3 else "#9CC3FF", steady=False, g=.7, freq=1.2)
PY_ = .32
for k, (cid, sg, dx) in enumerate(TWF): box(f"t_dock{k}", f"t_prod{k}", "cab2", [2.6, .3, 1.6], [TX + dx + (2.8 if k == 1 else .6), .15, 2.9], bevel=.03)   # 台勝科的晶圓盒放到右前方，不擋廠牌
# 環球晶：12 吋晶圓疊（鏡面）
cyl("t_gwS", "t_prod0", "mirror", .72, .05, [TX - 13.5 + .6, PY_ + .03, 2.9], at=[[0, .07 * j, 0] for j in range(8)])
# 台勝科：12 吋晶圓盒（前開）×2
box("t_fstB", "t_prod1", "pvdf", [.9, .85, .85], [TX - 4.5 + 2.8, PY_ + .43, 2.9], at=[[-.55, 0, 0], [.55, 0, 0]], bevel=.08)
box("t_fstD", "t_prod1", "cab2", [.7, .65, .04], [TX - 4.5 + 2.8, PY_ + .43, 3.33], at=[[-.55, 0, 0], [.55, 0, 0]])
# 合晶：8 吋＋6 吋晶圓疊（同一組）
cyl("t_ww8", "t_prod2", "mirror", .5, .05, [TX + 4.5 + .1, PY_ + .03, 2.9], at=[[0, .07 * j, 0] for j in range(6)])
cyl("t_ww6", "t_prod2", "mirror", .38, .05, [TX + 4.5 + 1.2, PY_ + .03, 2.9], at=[[0, .07 * j, 0] for j in range(6)])
# 嘉晶：矽／碳化矽／氮化鎵三片磊晶晶圓（顏色不同）
for j, mt in enumerate(["epi", "sicW", "gan"]):
    cyl(f"t_ep{j}", "t_prod3", "mirror", .4, .05, [TX + 13.5 - .25 + .85 * j, PY_ + .03, 2.9])
    cyl(f"t_epL{j}", "t_prod3", mt, .4, .03, [TX + 13.5 - .25 + .85 * j, PY_ + .07, 2.9])
cyl("t_fp2", "t_fab1", "steelHi", .05, 3.2, [TX - 4.5 + 3.5, 1.9, -.8 + 2.2])
sph("t_fb2", "t_fab1", "steelHi", .09, [TX - 4.5 + 3.5, 3.52, -.8 + 2.2])
box("t_fgB2", "t_flagJ", "cabD", [1.18, 1.1 / SIGN["flag-JP"]["aspect"] + .08, .02], [TX - 4.5 + 3.5 + .61, 3.5 - 1.1 / SIGN["flag-JP"]["aspect"] / 2 - .06, -.8 + 2.2 - .02])
plate("t_fg2", "t_flagJ", "flag-JP", 1.1, TX - 4.5 + 3.5 + .61, 3.5 - 1.1 / SIGN["flag-JP"]["aspect"] / 2 - .06, -.8 + 2.2)
anchor("t_jpA", "t_flagJ", [TX - 4.5 + 3.5 + .6, 3.2, -.8 + 2.2], dx=0, dy=120)
anchor("t_wwA", "t_prod2", [TX + 4.5 + .6, PY_ + .4, 2.9], dx=0, dy=110)
anchor("t_sicA", "t_prod3", [TX + 13.5 + .6, PY_ + .1, 2.9], dx=0, dy=110)

# ═════════ M2：下一集光罩預告 x=180（光源→光罩（6 吋方形石英板＋鉻圖案＋護膜框）→縮小投影鏡筒→晶圓） ═════════
# 2026/11/24 審片必改：原本的預告「淺盤比晶圓還大又懸空」→ 照實際比例（光罩邊長約晶圓直徑一半），放在曝光機的光罩台上，光往下穿過鏡筒縮小 4 倍打在晶圓上
NX = 180
box("n_base", "n_tool", "cab", [5.4, 2.0, 4.0], [NX, 1.0, 0], bevel=.06)
box("n_baseP", "n_tool", "cabPanel", [1.6, 1.3, .06], [NX, 1.0, 2.03], at=[[-1.8, 0, 0], [0, 0, 0], [1.8, 0, 0]], bevel=.02)
box("n_chuck", "n_tool", "steel2", [3.6, .25, 3.6], [NX, 2.12, 0])
cyl("n_w", "n_w", "mirror", 1.5, .05, [NX, 2.28, 0])
cyl("n_wL", "n_w", "epi", 1.5, .03, [NX, 2.32, 0])
box("n_col", "n_tool", "steel2", [.35, 7.2, .35], [NX, 0, 0], at=[[-2.4, 5.6 - 4.6 + 3.6, -1.6], [2.4, 4.6, -1.6]])
tube("n_lens", "n_tool", "steelHi", .85, .7, 2.0, [NX, 4.0, 0])
cyl("n_lensG", "n_tool", "mask", .7, .08, [NX, 0, 0], at=[[0, 3.3, 0], [0, 4.0, 0], [0, 4.7, 0]])
box("n_stage", "n_tool", "steel", [3.4, .2, 2.6], [NX, 5.6, 0])
box("n_stageH", "n_tool", "cabD", [1.9, .22, 1.9], [NX, 5.6, 0])
MY2 = 5.82
box("n_plate", "n_mask", "mask", [1.52, .1, 1.52], [NX, MY2, 0])
PAT2 = [[x * .17, 0, z * .17] for x in range(-3, 4) for z in range(-3, 4) if (x + z) % 2 == 0]
box("n_cr", "n_mask", "chrome", [.12, .015, .12], [NX, MY2 - .058, 0], at=PAT2)
box("n_pf", "n_mask", "steel2", [1.4, .16, .05], [NX, MY2 - .14, 0], at=[[0, 0, -.68], [0, 0, .68]])
box("n_pfS", "n_mask", "steel2", [.05, .16, 1.4], [NX, MY2 - .14, 0], at=[[-.68, 0, 0], [.68, 0, 0]])
box("n_pel", "n_mask", "glass" if "m_glass" in materials else "mask", [1.36, .01, 1.36], [NX, MY2 - .22, 0])
box("n_src", "n_tool", "cabD", [1.6, 1.0, 1.6], [NX, 8.0, 0], bevel=.05)
flowx("n_uv", "n_mask", [[NX, 7.5, 0], [NX, MY2 + .1, 0], [NX, 4.0, 0], [NX, 2.36, 0]], shape="liquid", n=5, size=.1, rate=.8, color="uv", rim="uvR", band=.14, bandO=.5)
air("n_airU", "n_mask", [NX - .5, 2.3, -.5], [NX + .5, 7.5, .5])
glow("n_on", "n_mask", ["n_cr"], "uv", steady=False, g=.5, freq=1.2)
glow("n_wOn", "n_w", ["n_wL"], "uv", steady=False, g=.5, freq=1.2)
anchor("n_maskA", "n_mask", [NX + .8, MY2, .8], dx=170, dy=-70)
anchor("n_wA", "n_w", [NX - 1.2, 2.3, .8], dx=-170, dy=60)

# 主素材框（看不見；給 layout-check 判斷「卡片／標籤有沒有蓋到主體中央」）：每段只亮鏡頭對準的那一個，其他層全部標 bg
materials["m_proxy"] = {"kind": "unlit", "color": "#FFFFFF", "opacity": 0}
PXB = {"px_ew": (EX - 4.0, EX + 4.0, 3.1, 6.3, -3.0, 3.0), "px_ec": (EX - 2.2, EX + 2.2, 3.9, 4.6, -2.0, 2.0),
       "px_kp": (W12P - 1.5, W12P + 1.5, KY - .05, KY + .1, -1.5, 1.5), "px_kall": (W12P - 1.5, W6 + .8, KY - .05, KY + .1, -1.5, 2.0),
       "px_lat": (PX - 4.4, PX + 4.4, .7, 6.4, -1.3, .4), "px_m": (NX - 1.8, NX + 1.8, 2.1, 8.5, -1.8, 1.8),
       "px_t0": (TX - 16.5, TX - 10, .2, 3.6, -2.2, 3.7), "px_t1": (TX - 7.5, TX - 1, .2, 3.6, -2.2, 3.7), "px_t2": (TX + 1.5, TX + 8, .2, 3.6, -2.2, 3.7), "px_t3": (TX + 10.5, TX + 17, .2, 3.6, -2.2, 3.7)}
for lid, (x0, x1, y0, y1, z0, z1) in PXB.items():
    box(lid, lid, "proxy", [x1 - x0, y1 - y0, z1 - z0], [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2])
for l in layers:
    if not l["id"].startswith("px_"): l["bg"] = True
model = {
 "name": "tech-wafer2：矽晶圓-2。站別：E 磊晶爐 x=0、K 晶圓桌 x=30、P 原子剖面 x=60、M 光罩 x=90（genmodel.py 產生）",
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
def hid(lay, a, b, dur=6): return {"layer": lay, "at": a, "until": b, "opacity": 0, "dur": dur}
def mv(lay, at, until, dur=14, dx=0, dy=0, dz=0, **kw):
    d = {"layer": lay, "at": at, "until": until, "dur": dur, "dx": dx, "dy": dy, "dz": dz}; d.update(kw); return d
def fall(lay, at, until, dy=1.4, bounce=.08):
    return {"layer": lay, "at": at, "until": until, "dy": dy, "opacity": 0, "dur": 12, "fallIn": True, "bounce": bounce}
def sec(kind, at, until, title, tag, t, y=930, h=330, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag, "t": {k: {"at": v} for k, v in t.items()}}
    d.update(kw); return d

RESET = "s2:start+20"
VIS = [
 # 磊晶爐：s1 已經在長（三層都在）；s2 鏡頭離開時把新層藏起、晶圓退回傳送腔（右邊 +BL、抬高 .55 放在手叉上）；
 #         s3 念「送進反應腔」前手叉載著晶圓伸進來，念到後放下、手叉退回；s4 念「照底下的排列」起新層一層層長出來
 hid("e_g0", RESET, "s4:atom", 18), hid("e_g1", RESET, "s4:atom+30", 18), hid("e_g2", RESET, "s4:layer", 18),
 mv("e_wafer", RESET, "s3:start+6", dur=40, dx=BL), mv("e_wafer", RESET, "s3:in+14", dur=14, dy=.55),
 mv("e_blade", "s3:start+6", "s3:in+30", dur=40, dx=-BL),
 # 晶圓桌：磊晶晶圓 s1–s5 藏著（s6 才和其他尺寸一起出現；先只看拋光晶圓）
 hid("k_e12", HIDE, "s6:start", 10), hid("k_w8", HIDE, "s6:w8-6", 12), hid("k_w6", HIDE, "s6:w8+8", 12),
 # 原子剖面：s5 開頭磊晶層三排照底下的排列一排排落下黏住
 fall("x_e4", HIDE, "s5:start+8", dy=1.2), fall("x_e5", HIDE, "s5:start+20", dy=1.2), fall("x_e6", HIDE, "s5:start+32", dy=1.2), fall("x_dE", HIDE, "s5:start+20", dy=1.2),
 # 光罩：念「靠光罩」從上方降下來
 mv("n_mask", HIDE, "s11:mask-4", dur=24, dy=2.0), hid("n_mask", HIDE, "s11:mask-4", 10),
] + [fall(f"t_fab{k}", HIDE, f"s{7 + k}:{c}" if k else "s7:start-2", dy=2.2, bounce=.1) for k, (c, _, _) in enumerate(TWF)] \
  + [x for k, (c, _, _) in enumerate(TWF) for x in (hid(f"t_flag{k}", HIDE, f"s{7 + k}:{c}", 6), mv(f"t_flag{k}", HIDE, f"s{7 + k}:{c}+10", dur=22, dy=-.9))] \
  + [hid("t_flagJ", HIDE, "s8:jv", 6), mv("t_flagJ", HIDE, "s8:jv+8", dur=22, dy=-.9)] \
  + [fall(f"t_prod{k}", HIDE, f"s{7 + k}:{c}+10", dy=1.0, bounce=.08) for k, (c, _, _) in enumerate(TWF)]
PXW = {"px_ew": [(EARLY, "s2:start-4"), ("s3:start+30", "s4:start-4")], "px_ec": [("s4:start+30", "s5:start-4")], "px_kp": [("s2:start+30", "s3:start-4")],
       "px_lat": [("s5:start+30", "s6:start-4")], "px_kall": [("s6:start+30", "s7:start-4")], "px_m": [("s11:start+30", FAR)],
       "px_t0": [("s7:start+30", "s8:start-4")], "px_t1": [("s8:start+30", "s9:start-4")], "px_t2": [("s9:start+30", "s10:start-4")], "px_t3": [("s10:start+30", "s11:start-4")]}
for lid, wins in PXW.items():
    prev = "s1:start-400"
    for a_, b_ in wins:
        VIS.append({"layer": lid, "at": prev, "until": a_, "opacity": 0, "dur": 1}); prev = b_
    VIS.append({"layer": lid, "at": prev, "until": "s12:start+500", "opacity": 0, "dur": 1})
EPIRUN = lambda a, b: ([run(x, a, b, 10) for x in ("e_lampOn", "e_lampUOn", "e_refOn", "e_hot", "e_suscHot", "e_heatW")] + [run(x, a, b, 12) for x in ("e_rotS", "e_rotW", "e_rotG0", "e_rotG1", "e_rotG2")]
                      + [run(f"e_tcs{j}", a, b, 8) for j in range(4)] + [run(f"e_h2{j}", a, b, 8) for j in range(2)] + [run("e_gIn", a, b, 8), run("e_noz", a, b, 6)])
CO = lambda focus, t: sec("w2-co", "start+6", "s%d:start-2" % (int(t["sid"][1:]) + 1), "台灣誰在做", "2025 營收：公司公告", {k: v for k, v in t.items() if k != "sid"}, focus=focus)
P = {}
P["s1"] = {"zoom": [{"to": "tool", "at": "start-30", "dur": 1}],
 "shot": [shot("start-30", EX, 3.4, 38, 24, 1), shot("epi", EX, 3.4, 37, 28, 60)],
 "shift": VIS,
 "run": EPIRUN("start-30", "s2:start") + [run(f"e_dep{j}", "start-30", "s2:start", 6) for j in range(6)] + [run(f"e_g{g}On", "epi", "s2:start", 6) for g in range(3)] + [run("e_ledG", "start-30", FAR, 1)],
 "labels": [],
 "overlay": [sec("w2-hook", "same", "s2:start-2", "代工的供應商：矽晶圓", "示意，非實際比例", {"same": "same", "pol": "pol", "grow": "grow", "epi": "epi", "why": "why"})]}
P["s2"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", W12P, 1.8, 26, 30, 30), shot("polw", W12P, 1.6, 17, 40, 50)],
 "run": [run("k_p12On", "polw", "s3:start", 6)],
 "labels": [lab("k_p12A", "拋光晶圓", "Polished wafer", "blue", "polw", "s3:start-4")],
 "overlay": [sec("w2-pol", "start+6", "s3:start-2", "拋光晶圓：整片一樣", "示意，非實際比例", {"last": "last", "polw": "polw", "same": "same"})]}
P["s3"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", EX + 2.4, 3.0, 46, 22, 30), shot("in+30", EX, 3.2, 40, 26, 40)],
 "run": [run("e_lampOn", "lamp", "s5:start", 10), run("e_lampUOn", "lamp", "s5:start", 10), run("e_refOn", "lamp", "s5:start", 10), run("e_hot", "deg", "s5:start", 16), run("e_suscHot", "deg", "s5:start", 16),
         run("e_heatW", "deg", "s5:start", 8), run("e_gIn", "gas-12", "s5:start", 8), run("e_noz", "gas", "s5:start", 6)] + [run(f"e_tcs{j}", "gas", "s5:start", 8) for j in range(4)] + [run(f"e_h2{j}", "gas", "s5:start", 8) for j in range(2)]
        + [run("e_ledG", "start", FAR, 1)],
 "labels": [lab("e_tcA", "傳送腔→反應腔", "Into the chamber", "blue", "in-10", "lamp+20", xy=[780, 300]), lab("e_lampA", "鹵素燈管", "Halogen lamps", "coral", "lamp", "s4:start-4", xy=[300, 300]),
            lab("e_gasA", "含矽氣體＋氫氣", "SiHCl₃ + H₂", "amber", "gas", "s4:start-4", xy=[780, 300])],
 "overlay": [sec("w2-cvd", "start+6", "s4:start-2", "磊晶爐：加熱＋通氣", "USPTO 8038793", {"in": "in", "lamp": "lamp", "deg": "deg-30", "gas": "gas"})]}
P["s4"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", EX, 3.6, 21, 32, 30)],
 "run": [run(x, "spin", "s5:start", 14) for x in ("e_rotS", "e_rotW", "e_rotG0", "e_rotG1", "e_rotG2")] + [run(f"e_dep{j}", "atom-10", "s5:start", 6) for j in range(6)]
        + [run("e_g0On", "atom", "s5:start", 6), run("e_g1On", "atom+30", "s5:start", 6), run("e_g2On", "layer", "s5:start", 6)],
 "labels": [lab("e_suscA", "托盤在轉", "Susceptor spins", "blue", "spin", "s5:start-4", xy=[260, 300]), lab("e_epiA", "新的單晶矽層", "New crystal layer", "amber", "layer", "s5:start-4", xy=[780, 300])],
 "overlay": [sec("w2-grow", "start+6", "s5:start-2", "原子照底下排列", "示意，非實際比例", {"spin": "spin", "atom": "atom", "lay": "layer"})]}
P["s5"] = {"zoom": [{"to": "atom", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", PX, 1.6, 40, 12, 30)],
 "run": [run("x_lineOn", "adj", "s6:start", 8), run("x_dSOn", "heavy", "s6:start", 6), run("x_dEOn", "light", "s6:start", 6)],
 "labels": [lab("x_dSA", "底材：雜質多", "Heavily doped", "coral", "heavy", "s6:start-4", xy=[300, 300]), lab("x_epiA", "磊晶層：雜質少", "Lightly doped", "blue", "light", "s6:start-4", xy=[780, 300])],
 "overlay": [sec("w2-dope", "start+6", "s6:start-2", "雜質濃度分開調", "Okmetic；USPTO 5306939", {"adj": "adj", "heavy": "heavy", "light": "light", "power": "power"})]}
P["s6"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", KX + .3, 1.2, 44, 44, 30)],
 "run": [run("k_p12On", "w12", "s7:start", 6), run("k_e12On", "w12", "s7:start", 6), run("k_w8On", "w8", "s7:start", 6), run("k_w6On", "w8+8", "s7:start", 6)],
 "labels": [lab("k_p12A", "12 吋", "300 mm", "blue", "w12", "s7:start-10", xy=[250, 300]), lab("k_w8A", "8 吋", "200 mm", "amber", "w8", "s7:start-10", xy=[640, 300]), lab("k_w6A", "6 吋", "150 mm", "amber", "w8+8", "s7:start-10", xy=[880, 300])],
 "overlay": [sec("w2-size", "start+6", "s7:start-2", "尺寸分工", "台勝科法說；TrendForce", {"size": "size", "w12": "w12", "w8": "w8", "pw": "pw"})]}
# s7–s10：台灣四家（2026/11/24 審片必改：廠房＋產品＋國旗；台勝科另標「日本勝高合資」＋日本旗；合晶只留一個標籤）
TFX = {c: TX + dx for c, _, dx in TWF}
for k, (sid, focus, labs, t) in enumerate([
    ("s7", "gw", [dict(lab("t_gwA", "環球晶 6488", "Taiwan", "amber", "gw", "s8:start-4", xy=[540, 360]), flag="TW")], {"sid": "s7", "gw": "gw", "top5": "top5", "rev": "rev"}),
    ("s8", "fst", [dict(lab("t_fstA", "台勝科 3532", "Taiwan", "blue", "fst", "s9:start-4", xy=[300, 330]), flag="TW"),
                   dict(lab("t_jpA", "勝高（合資）", "SUMCO, Japan", "coral", "jv", "s9:start-4", xy=[800, 330]), flag="JP")], {"sid": "s8", "fst": "fst", "jv": "jv", "main": "main", "p70": "p70"}),
    ("s9", "ww", [dict(lab("t_wwF", "合晶 6182", "Taiwan", "amber", "ww", "s10:start-4", xy=[540, 360]), flag="TW"),
                  lab("t_wwA", "6 吋＋8 吋", "150 / 200 mm", "blue", "p68", "s10:start-4", xy=[540, 830])], {"sid": "s9", "ww": "ww", "p68": "p68", "pwr": "pwr", "x12": "x12"}),
    ("s10", "epi", [dict(lab("t_epiA", "嘉晶 3016", "Taiwan", "blue", "epi", "s11:start-4", xy=[760, 340]), flag="TW"),
                    lab("t_sicA", "矽／碳化矽／氮化鎵", "Si / SiC / GaN epi", "amber", "sic", "s11:start-4", xy=[540, 830])], {"sid": "s10", "epi": "epi", "si": "si", "sic": "sic", "gan": "gan"})]):
    fx = TFX[focus]
    P[sid] = {"zoom": [{"to": "plant", "at": "start-4", "dur": 30}],
              "shot": [shot("start-1" if k == 0 else focus + "-10", fx + .4, *{1: (.6, 36, 16)}.get(k, (-.6, 28, 18)), 1 if k == 0 else 30)],
              "run": [run(f"t_on{k}", focus, "s11:start", 6)], "labels": labs, "overlay": [CO(focus, t)]}
P["s11"] = {"zoom": [{"to": "litho", "at": "start-1", "dur": 1}],
 "shot": [shot("start-4", NX, 3.6, 34, 20, 1)],
 "run": [run("n_uv", "mask+10", "s12:start", 6), run("n_on", "mask+10", "s12:start", 6), run("n_wOn", "mask+30", "s12:start", 6)],
 "labels": [lab("n_wA", "晶圓備好了", "Wafer ready", "blue", "ready", "kw-10", xy=[280, 760]), lab("n_maskA", "光罩（下一集）", "Photomask (next)", "amber", "mask", "kw-10", xy=[800, 360])],
 "overlay": [sec("w2-next", "start+6", "kw-10", "下一集：光罩", "光罩-1：晶片的底片", {"ready": "ready", "print": "print", "mask": "mask", "next": "next", "kw": "kw"})]}
for sc in script["scenes"]:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])
json.dump(script, open(sp, "w"), ensure_ascii=False, indent=1)
print("script props 併入", len(P), "幕")
