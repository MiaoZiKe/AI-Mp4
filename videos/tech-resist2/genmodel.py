# tech-resist2 產生器：python3 videos/tech-resist2/genmodel.py → model.json，並先跑 genscript.py、再把各幕 3D 動作與 2D 卡併進 script.json
# 光阻-2：塗上去、洗出來的機器（塗佈顯影機＋曝光機一組，黃光區）。
# 座標：x 右、y 上、z 朝觀眾；單位約 10 cm（示意，非實際比例）。只有一站：
#   塗佈顯影機（機櫃前面剖開）x −8～7：中央機械手臂；左＝旋塗杯 C；左後＝加熱板 HP1（軟烤／硬烤）；後＝加熱板 HP2（曝後烤）；
#   右前＝顯影杯 D；右後＝曝光機介面台 IF；最左外＝晶圓盒載入口。右邊 x 7.4～17＝曝光機（外殼、觀察窗、傳送口）。
# 晶圓搬運用零件庫的 arm（kin 關節鏈），每一趟自己算反運動學、寫 props.kin；被夾的晶圓每一趟一個圖層（放下那一幀換成下一站的同樣晶圓）。
# 旋轉用 rotate 的 angle＋hold（轉整數圈、加速再減速、停回原角度），所以轉完再被夾走不會跳角度。
# 所有動作的 at 都寫成「幕id:cue±幀」（cue 來自 timeline.json；配音重跑 align 後重跑本檔即可）。
import json, math, os, random, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))
R = lambda x: round(x, 3)
rnd = random.Random(20261208)
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
def staves(pid, lay, mat, cx, r, y0, y1, n=12, a0=186, a1=354, t=.12, cz=0.0, full=False):
    """圓筒用 n 片板拼（預設只留 z<0 的後半圈＝剖開；full＝整圈）。用板拼而不是 tube：手臂穿模檢查用包圍盒，tube 的包圍盒會把杯子裡面整個算成實心。"""
    if full: a0, a1 = 0, 360 - 360 / n
    step = (a1 - a0) / (n - 1); w = 2 * math.pi * r * (step / 360) * 1.04
    for k in range(n):
        a = math.radians(a0 + step * k)
        box(f"{pid}{k}", lay, mat, [w, y1 - y0, t], [cx + r * math.cos(a), (y0 + y1) / 2, cz + r * math.sin(a)], rot=[0, R(-(math.degrees(a) + 90)), 0])
def air(pid, lay, lo, hi):
    lay = "air"     # 只給 flow-check 用的空間框：全部放在一直藏著的圖層（手臂穿模檢查只看看得到的）
    box(pid, lay, "air", [hi[i] - lo[i] for i in range(3)], [(lo[i] + hi[i]) / 2 for i in range(3)])

palette = {"floor": "#E3E9F1", "floorG": "#A8B4C6", "wall": "#EFE4BE", "wall2": "#DCCD98", "ffu": "#F7F1DA", "ffuG": "#CBBF94", "lamp": "#FFD54A",
 "cab": "#EEF2F7", "cab2": "#D7DEE8", "cabD": "#4A5873", "seam": "#8E9BB0", "steel": "#A9B6CA", "steel2": "#7F8CA3", "steelHi": "#C9D3E2",
 "cup": "#E9EDF2", "cupIn": "#7E8BA3", "chuck": "#5D6A82", "wafer": "#B4C2DA", "die": "#7FA4E0", "notch": "#2E3340",
 "resist": "#D9822B", "resistR": "#9E5410", "resistL": "#E9A55A", "lat": "#B8742E", "expo": "#8E5BD8", "expoR": "#5B33A8",
 "dev": "#6F8CF0", "devR": "#3E5CC8", "diw": "#5CC8F0", "diwR": "#2A9FD8", "solv": "#9AA7BA", "solvR": "#66738A",
 "heat": "#FF7A2F", "heatR": "#E04A1A", "plate": "#8A93A3", "cu": "#D9873A", "pvdf": "#F2F2EE", "pfa": "#EFEAE0",
 "led": "#14C38E", "ledA": "#FF9F1C", "ledR": "#C9372C", "screen": "#2E6FD8", "euv": "#9B6BFF", "euvR": "#6A3FD8", "glassD": "#3A4560",
 "scan": "#F4F6FA", "scan2": "#E2E7EF", "hvY": "#FFC21A"}
def M(color, **k): return {"kind": "std", "color": color, "rough": .45, "metal": .1, **k}
U = lambda c, o=None: {"kind": "unlit", "color": c, **({"opacity": o} if o is not None else {})}
materials = {
 "floor": M("floor", rough=.55, metal=0), "floorG": U("floorG"), "wall": M("wall", rough=.7, metal=0), "wall2": M("wall2", rough=.7, metal=0),
 "ffu": U("ffu"), "ffuG": U("ffuG"), "lamp": {"kind": "std", "color": "lamp", "emissive": "lamp", "ei": .8},
 "cab": M("cab", rough=.45, metal=.1), "cab2": M("cab2", rough=.5, metal=.1), "cabD": M("cabD", rough=.5, metal=.3), "seam": U("seam"),
 "cabPanel": {"kind": "phys", "color": "#F7F9FC", "rough": .3, "metal": 0, "clearcoat": .5, "env": .5},
 "steel": M("steel", rough=.28, metal=.88, env=.7, tex="brushed", texScale=2), "steel2": M("steel2", rough=.35, metal=.8, env=.6), "steelHi": M("steelHi", rough=.22, metal=.9, env=.9),
 "cup": {"kind": "phys", "color": "cup", "rough": .25, "metal": 0, "clearcoat": .7, "env": .5}, "cupIn": M("cupIn", rough=.5, metal=.2),
 "chuck": M("chuck", rough=.4, metal=.6), "notch": U("notch"),
 "wafer": {"kind": "phys", "color": "wafer", "rough": .08, "metal": .45, "clearcoat": 1, "env": 1.0},
 "die": M("die", rough=.22, metal=.55, tex="traces", texScale=.35, env=.9),
 "resist": {"kind": "phys", "color": "resist", "rough": .15, "metal": 0, "clearcoat": 1, "env": .7},
 "resistL": {"kind": "phys", "color": "resistL", "rough": .2, "metal": 0, "clearcoat": .8, "opacity": .9},
 "lat": {"kind": "phys", "color": "lat", "rough": .15, "metal": 0, "clearcoat": 1, "env": .7},
 "expo": {"kind": "phys", "color": "expo", "rough": .15, "metal": 0, "clearcoat": 1, "env": .7},
 "devFilm": U("dev", .45), "diwFilm": U("diw", .4),
 "plate": M("plate", rough=.35, metal=.7, env=.6), "cu": M("cu", rough=.3, metal=.92, env=.8, tex="brushed", texScale=.8),
 "pvdf": M("pvdf", rough=.55, metal=0), "pfa": {"kind": "phys", "color": "pfa", "rough": .3, "metal": 0, "clearcoat": .5, "opacity": .85},
 "led": {"kind": "std", "color": "led", "emissive": "led", "ei": .9}, "ledA": {"kind": "std", "color": "ledA", "emissive": "ledA", "ei": .6}, "ledR": {"kind": "std", "color": "ledR", "emissive": "ledR", "ei": .3},
 "screen": {"kind": "screen", "color": "screen", "ei": .7}, "screenUI": U("#BFD8FF"),
 "scan": {"kind": "phys", "color": "scan", "rough": .35, "metal": 0, "clearcoat": .6, "env": .5}, "scan2": M("scan2", rough=.5, metal=.1),
 "glassD": {"kind": "phys", "color": "glassD", "rough": .05, "metal": .2, "clearcoat": 1, "env": 1.0}, "euvU": U("euv"),
 "hvY": U("hvY"), "air": U("#FFFFFF", .0),
}
materials = {"m_" + k: v for k, v in materials.items()}
def flowx(key, lay, path, shape="dot", n=4, lanes=1, gap=.2, ldir=(1, 0, 0), size=.1, rate=1.0, color="diw", rim="diwR", trail=0, band=None, bandO=.5, rimO=.6):
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
def turn(key, lay, ps, cx, cz, turns):
    """轉整數圈：加速→減速→停回原角度（angle＋hold；轉多久＝run 的 ramp）"""
    layer(lay); actions[key] = {"type": "rotate", "layer": lay, "parts": ps, "axis": [0, 1, 0], "pivot": [R(cx), 0, R(cz)], "angle": 360 * turns, "hold": True}
def lp(lay): return [p["id"] for p in parts if p["layer"] == lay]

# ═════════ 共用尺寸 ═════════
DECK = 2.0                    # 機台檯面
CUPR = 2.1                    # 杯半徑（≥2：板子斜角的包圍盒才不會碰到晶圓）
WY, WTH, WR = 3.40, .08, 1.2  # 晶圓中心高、厚、半徑（所有模組的晶圓同一個高度，手臂才不用換高度）
WB, WT = WY - WTH / 2, WY + WTH / 2
C = (-4.4, 1.2); H1 = (-3.0, -3.4); H2 = (1.2, -4.6); IF = (4.7, -2.2); DV = (4.0, 2.2)
SX0, SX1 = 7.4, 17.0          # 曝光機外殼 x 範圍
SLIDE = 5.6                   # 介面台 → 曝光機裡面

# ═════════ 黃光區（背景）：地板格柵、黃色牆面（黃光燈）、天花板過濾器、燈條 ═════════
box("r_floor", "t_room", "floor", [80, .3, 40], [4, -.15, -2])
box("r_grate", "t_room", "floorG", [.1, .03, 40], [4, .02, -2], at=[[-38 + 2.0 * i, 0, 0] for i in range(39)])
box("r_grate2", "t_room", "floorG", [80, .03, .1], [4, .02, -2], at=[[0, 0, -19 + 2.0 * j] for j in range(20)])
box("r_wall", "t_room", "wall", [80, 20, .4], [4, 10, -13])
box("r_wallS", "t_room", "wall2", [.12, 19.6, .45], [4, 10, -12.9], at=[[-36 + 6 * i, 0, 0] for i in range(13)])
box("r_lamp", "t_room", "lamp", [4.6, .18, .3], [4, 18.6, -12.7], at=[[-30 + 8 * i, 0, 0] for i in range(9)])
box("r_ffu", "t_room", "ffu", [5.6, .4, 5.6], [4, 19.4, -8], at=[[-30 + 6 * i, 0, k * 6] for i in range(11) for k in (0, 1)])
box("r_ffuG", "t_room", "ffuG", [5.4, .05, .06], [4, 19.18, -8], at=[[-30 + 6 * i, 0, k * 6 - 2.4 + .6 * j] for i in range(11) for k in (0, 1) for j in range(9)])
pipe("r_duct", "t_room", "steel2", [[-12, 14.5, -11.6], [20, 14.5, -11.6]], .45)
box("r_tray", "t_room", "steel2", [32, .12, 1.2], [4, 13.2, -11.8])
box("r_trayC", "t_room", "cabD", [.12, .3, 1.1], [4, 13.4, -11.8], at=[[-15 + 1.0 * i, 0, 0] for i in range(31)])

# ═════════ 塗佈顯影機機櫃（前面剖開） ═════════
TX0, TX1, TZ0, TZ1, TH = -7.8, 7.4, -7.4, 4.2, 8.2
box("k_base", "k_body", "cab", [TX1 - TX0, DECK, TZ1 - TZ0], [(TX0 + TX1) / 2, DECK / 2, (TZ0 + TZ1) / 2], bevel=.06)
box("k_baseP", "k_body", "cabPanel", [2.6, 1.4, .08], [0, 1.0, TZ1 + .04], at=[[-6.2 + 2.9 * i, 0, 0] for i in range(5)], bevel=.02)
box("k_vent", "k_body", "seam", [1.8, .05, .1], [0, 1.0, TZ1 + .09], at=[[-6.2 + 2.9 * i, -.3 + .15 * j, 0] for i in range(5) for j in range(5)])
sph("k_screw", "k_body", "steelHi", .06, [0, 1.0, TZ1 + .1], at=[[-6.2 + 2.9 * i + sx * 1.15, sy * .58, 0] for i in range(5) for sx in (-1, 1) for sy in (-1, 1)])
box("k_back", "k_body", "cab", [TX1 - TX0, TH - DECK, .3], [(TX0 + TX1) / 2, (DECK + TH) / 2, TZ0 + .15], bevel=.04)
box("k_backP", "k_body", "cab2", [2.6, 2.2, .06], [0, 6.6, TZ0 + .33], at=[[-6.2 + 2.9 * i, 0, 0] for i in range(5)])
box("k_side", "k_body", "cab", [.3, TH - DECK, TZ1 - TZ0], [TX0 + .15, (DECK + TH) / 2, (TZ0 + TZ1) / 2], bevel=.04)
# （頂板拿掉＝剖開，鏡頭從上往下看得到模組；空氣過濾器改放在黃光區天花板）
box("k_post", "k_body", "steelHi", [.3, TH - DECK, .3], [0, (DECK + TH) / 2, TZ1 - .15], at=[[TX0 + .15, 0, 0], [TX1 - .15, 0, 0]])
box("k_beam", "k_body", "steelHi", [TX1 - TX0, .3, .3], [(TX0 + TX1) / 2, TH - .15, TZ1 - .15])
box("k_deck", "k_body", "cab2", [TX1 - TX0 - .6, .1, TZ1 - TZ0 - .5], [(TX0 + TX1) / 2, DECK + .05, (TZ0 + TZ1) / 2])
box("k_hv", "k_body", "hvY", [.8, .8, .05], [TX1 - 1.2, 1.2, TZ1 + .1], rot=[0, 0, 45])
cyl("k_tw", "k_body", "steel2", .12, 1.3, [TX0 + .8, TH + 1.1, TZ1 - .8])
cyl("k_twG", "k_body", "led", .24, .38, [TX0 + .8, TH + 1.95, TZ1 - .8])
cyl("k_twA", "k_body", "ledA", .24, .38, [TX0 + .8, TH + 2.36, TZ1 - .8])
cyl("k_twR", "k_body", "ledR", .24, .38, [TX0 + .8, TH + 2.77, TZ1 - .8])
box("k_scr", "k_body", "screen", [.12, 2.2, 3.0], [TX0 - .2, 6.4, 1.0], bevel=.03)
box("k_scrUI", "k_body", "screenUI", [.05, .12, 2.3], [TX0 - .28, 6.4, 1.0], at=[[0, -.7 + .35 * j, 0] for j in range(5)])
# 載入口：晶圓盒（左外側）
box("k_lp", "k_lp", "steel2", [2.4, 3.6, 3.0], [TX0 - 1.4, 1.8, -1.2], bevel=.05)
box("k_foup", "k_lp", "pvdf", [2.3, 2.3, 2.3], [TX0 - 1.4, 4.8, -1.2], bevel=.12)
box("k_foupD", "k_lp", "cab2", [1.8, 1.8, .08], [TX0 - 1.4, 4.8, -.02])
box("k_foupH", "k_lp", "steelHi", [1.2, .22, .45], [TX0 - 1.4, 6.08, -1.2])
# 藥液櫃（後方）：光阻瓶、顯影液瓶、純水，管線接到兩個杯
BOT = [("resist", -6.6), ("dev", -5.7), ("diw", -4.8)]
for nm, x in BOT:
    mt = {"resist": "resist", "dev": "devFilm", "diw": "diwFilm"}[nm]
    cyl(f"b_{nm}", "b_rack", "pfa", .36, 1.9, [x, DECK + 1.0, TZ0 + 1.0])
    cyl(f"b_liq{nm}", "b_rack", mt if nm == "resist" else "pvdf", .3, 1.3, [x, DECK + .75, TZ0 + 1.0])
    cyl(f"b_cap{nm}", "b_rack", "pvdf", .22, .25, [x, DECK + 2.08, TZ0 + 1.0])
box("b_shelf", "b_rack", "steel2", [3.0, .12, 1.2], [-5.7, DECK + .06, TZ0 + 1.0])
box("b_label", "b_rack", "resist", [.5, .2, .03], [-6.6, DECK + 1.5, TZ0 + 1.37])
pipe("b_pR", "b_pipe", "pfa", [[-6.6, DECK + .25, TZ0 + 1.5], [-6.6, DECK + .25, C[1] - 1.2], [C[0] - 2.7, DECK + .25, C[1] - 1.2]], .08)
pipe("b_pD", "b_pipe", "pfa", [[-5.7, DECK + .25, TZ0 + 1.5], [-5.7, DECK + .25, TZ0 + 1.9], [6.6, DECK + .25, TZ0 + 1.9], [6.6, DECK + .25, DV[1] - 2.95]], .08)

# ═════════ 旋塗杯 C：馬達、主軸、真空吸盤、防濺杯（杯壁、內唇、排液、排氣）、晶圓、光阻噴嘴臂 ═════════
def cup(pre, lay, cx, cz):
    cyl(f"{pre}_motor", lay, "cabD", .7, .9, [cx, DECK + .5, cz])
    cyl(f"{pre}_spindle", lay, "steelHi", .2, WB - DECK - .25, [cx, (WB + DECK) / 2, cz])
    cyl(f"{pre}_cupB", lay, "cupIn", CUPR - .05, .14, [cx, DECK + .2, cz])
    staves(f"{pre}_cup", lay, "cup", cx, CUPR, DECK + .2, WT + .42, n=28, t=.1, cz=cz, full=True)
    staves(f"{pre}_lipR", lay, "steelHi", cx, CUPR + .06, WT + .38, WT + .46, n=28, t=.05, cz=cz, full=True)
    staves(f"{pre}_rib", lay, "cupIn", cx, CUPR + .06, DECK + .78, DECK + .84, n=28, t=.05, cz=cz, full=True)
    cyl(f"{pre}_drain", lay, "pfa", .14, .8, [cx - 1.3, DECK - .2, cz - .5])
    pipe(f"{pre}_exh", lay, "steel2", [[cx + 1.4, DECK + .35, cz - .8], [cx + 1.4, DECK + .35, cz - 2.2], [cx + 1.4, DECK - .4, cz - 2.2]], .22)
CH_PARTS = {}
def chuck(pre, lay, cx, cz):
    a = cyl(f"{pre}_chuck", lay, "chuck", .7, .2, [cx, WB - .112, cz])
    b = tube(f"{pre}_chuckR", lay, "steelHi", .72, .6, .03, [cx, WB - .027, cz])
    c = box(f"{pre}_vac", lay, "cabD", [.9, .015, .05], [cx, WB - .02, cz], at=[[0, 0, 0]])
    d = box(f"{pre}_vac2", lay, "cabD", [.05, .015, .9], [cx, WB - .02, cz])
    return [a, b, c, d]
DIE_STEP = .34
DIES = [(i * DIE_STEP, j * DIE_STEP) for i in range(-4, 5) for j in range(-4, 5) if math.hypot(abs(i * DIE_STEP) + .16, abs(j * DIE_STEP) + .16) < WR - .08]
NST = 9; SW = 2 * WR / NST     # 光阻條紋（曝光圖案示意：沿 z 的長條，奇數條＝照到光）
def stripes(i):
    x = -WR + SW * (i + .5); half = math.sqrt(max(0, WR * WR - (abs(x) + SW / 2) ** 2)) - .03
    return x, half
def wafer(pre, lay, cx, cz, film=None, latent=None, ex_lay=None, dies=True):
    """晶圓（＋晶粒格）＋光阻：film＝整片光阻材質；latent＝條紋（未照光材質, 照光材質, 照光條紋的圖層）"""
    ps = [cyl(f"{pre}_wf", lay, "wafer", WR, WTH, [cx, WY, cz])]
    if dies: ps.append(box(f"{pre}_die", lay, "die", [.29, .012, .29], [cx, WT + .006, cz], at=[[a, 0, b] for a, b in DIES]))
    ps.append(box(f"{pre}_notch", lay, "notch", [.16, .02, .08], [cx, WT + .01, cz + WR - .05]))
    if film: ps.append(cyl(f"{pre}_film", lay, film, WR - .02, .05, [cx, WT + .028, cz]))
    if latent:
        un, ex, exl = latent
        for i in range(NST):
            x, half = stripes(i)
            if half <= 0: continue
            if i % 2 == 0: ps.append(box(f"{pre}_un{i}", lay, un, [SW, .05, 2 * half], [cx + x, WT + .028, cz]))
            else: box(f"{pre}_ex{i}", exl, ex, [SW, .05, 2 * half], [cx + x, WT + .028, cz])
    return ps
cup("c", "c_mod", *C)
CHK_C = chuck("c", "c_mod", *C)
WA = wafer("wA", "wA", *C)                       # 裸晶圓（s1、s3 轉）
RINGS = [(0, .32)] + [(.32 + .15 * i, .47 + .15 * i) for i in range(6)]
RINGS[-1] = (RINGS[-1][0], WR - .02)
for i, (ri, ro) in enumerate(RINGS):            # 光阻從中心往外鋪開（一圈一圈出現）
    if ri == 0: cyl(f"r{i}", f"cr{i}", "resist", ro, .05, [C[0], WT + .028, C[1]])
    else: tube(f"r{i}", f"cr{i}", "resist", ro, ri, .05, [C[0], WT + .028, C[1]])
wafer("wA2", "wA2", *C, film="resist")         # 塗好的晶圓（等手臂來夾）
turn("spinC1", "c_mod", CHK_C + WA, C[0], C[1], 9)
turn("spinC2", "c_mod", CHK_C + WA, C[0], C[1], 16)
# 光阻噴嘴臂（layer c_noz）：預設停在晶圓中心上方；收回時往左移
NY = WT + .95
box("cn_post", "c_npost", "steel2", [.4, NY + .6 - DECK, .4], [C[0] - 2.7, (NY + .6 + DECK) / 2, C[1] - 1.2])
box("cn_arm", "c_noz", "steelHi", [2.9, .22, .3], [C[0] - 1.3, NY + .5, C[1]], bevel=.03)
box("cn_armZ", "c_noz", "steelHi", [.3, .22, 1.2], [C[0] - 2.7, NY + .5, C[1] - .6], bevel=.03)
box("cn_head", "c_noz", "cab2", [.5, .45, .45], [C[0], NY + .25, C[1]], bevel=.04)
cyl("cn_tip", "c_noz", "pfa", .06, .4, [C[0], NY - .15, C[1]])
tube("cn_tipR", "c_noz", "resist", .1, .065, .06, [C[0], NY, C[1]])
box("cn_led", "c_noz", "led", [.2, .06, .03], [C[0], NY + .35, C[1] + .24])
cyl("cn_hose", "c_noz", "pfa", .06, 2.6, [C[0] - 1.3, NY + .72, C[1]], axis="x")
TIPY = NY - .35
air("cn_space", "c_noz", [C[0] - .5, WT, C[1] - .5], [C[0] + .5, TIPY + .1, C[1] + .5])
flowx("c_drop", "c_noz", [[C[0], TIPY, C[1]], [C[0], WT + .06, C[1]]], shape="liquid", n=3, size=.13, rate=1.1, color="resist", rim="resistR")
def spiral(cx, cz, a0, r0=.25, r1=WR - .05, tw=.9, n=12, y=WT + .06):
    return [[cx + (r0 + (r1 - r0) * t / n) * math.cos(a0 + tw * t / n), y, cz + (r0 + (r1 - r0) * t / n) * math.sin(a0 + tw * t / n)] for t in range(n + 1)]
def edge_path(cx, cz, a):
    c, s = math.cos(a), math.sin(a); t = (-s, c)
    p = lambda r, y, tw: [cx + r * c + tw * t[0], y, cz + r * s + tw * t[1]]
    return [p(WR - .02, WT + .05, 0), p(1.6, WT + .3, .22), p(CUPR - .1, WT + .2, .38), p(CUPR - .1, DECK + .5, .4)]
for j in range(8):
    flowx(f"c_sheet{j}", "c_mod", spiral(*C, j * math.pi / 4), shape="liquid", n=3, size=.07, rate=.6, color="resist", rim="resistR", band=.03, bandO=.45)
for j in range(10):
    flowx(f"c_fling{j}", "c_mod", edge_path(*C, j * 2 * math.pi / 10 + .3), shape="liquid", n=2, size=.09, rate=.9, color="resist", rim="resistR", band=.01, bandO=0)
air("c_space", "c_mod", [C[0] - 2.1, DECK + .3, C[1] - 2.1], [C[0] + 2.1, WT + .45, C[1] + 2.1])

# ═════════ 加熱板 HP1、HP2：底座、加熱盤（加熱線圈）、三根頂針、後半圈剖開的蓋子、排氣管 ═════════
def hotplate(pre, lay, hx, hz):
    box(f"{pre}_base", lay, "cab2", [3.8, WB - .24 - DECK, 3.8], [hx, (WB - .24 + DECK) / 2, hz], bevel=.05)
    box(f"{pre}_baseP", lay, "cabPanel", [3.0, .8, .05], [hx, (WB + DECK) / 2 - .1, hz + 1.92])
    box(f"{pre}_baseL", lay, "led", [.3, .08, .03], [hx + 1.2, (WB + DECK) / 2 + .15, hz + 1.95])
    p1 = cyl(f"{pre}_plate", lay, "plate", 1.3, .18, [hx, WB - .14, hz])
    p2 = tube(f"{pre}_coil", lay, "cu", 1.1, 1.02, .02, [hx, WB - .045, hz], at=[[0, 0, 0]])
    p3 = tube(f"{pre}_coil2", lay, "cu", .74, .66, .02, [hx, WB - .045, hz])
    p4 = tube(f"{pre}_coil3", lay, "cu", .38, .30, .02, [hx, WB - .045, hz])
    cyl(f"{pre}_pin", lay, "steelHi", .05, .05, [hx, WB - .037, hz], at=[[.8 * math.cos(a), 0, .8 * math.sin(a)] for a in (0.5, 2.6, 4.7)])
    staves(f"{pre}_lid", lay, "steel", hx, 2.0, WB - .05, WT + .45, n=13, cz=hz)
    staves(f"{pre}_lidR", lay, "steelHi", hx, 2.04, WT + .4, WT + .48, n=13, t=.05, cz=hz)
    pipe(f"{pre}_exh", lay, "steel2", [[hx, WT + .2, hz - 2.0], [hx, WT + .2, hz - 2.5], [hx, DECK + .3, hz - 2.5]], .18)
    return [p1, p2, p3, p4]
HP1P = hotplate("h1", "h1_mod", *H1)
HP2P = hotplate("h2", "h2_mod", *H2)
for pre, (hx, hz), lay in (("h1", H1, "h1_mod"), ("h2", H2, "h2_mod")):
    glow(f"{pre}_heat", lay, [f"{pre}_plate", f"{pre}_coil", f"{pre}_coil2", f"{pre}_coil3"], "heat", steady=True, g=.85)
    for j, (dx, dz) in enumerate([(-.6, .2), (.1, -.3), (.7, .3)]):
        actions[f"{pre}_wave{j}"] = {"type": "wave", "layer": lay, "from": [R(hx + dx), R(WT + .08), R(hz + dz)], "dir": [0, 1, 0], "reach": .7, "count": 3, "r0": .1, "spread": 1.3, "rate": 1.3, "phase": j / 3, "width": .16, "color": "heat"}
    air(f"{pre}_space", lay, [hx - 1.5, WB, hz - 2.0], [hx + 1.5, WT + .9, hz + 1.5])
# 溶劑蒸氣（分子形）：從膜面往上、從蓋子後面的排氣口出去
for j, (dx, dz) in enumerate([(-.7, .3), (-.2, -.2), (.3, .4), (.8, -.1)]):
    hx, hz = H1
    flowx(f"h1_solv{j}", "h1_mod", [[hx + dx, WT + .1, hz + dz], [hx + dx * .6, WT + .7, hz + dz * .5], [hx, WT + .35, hz - 1.2], [hx, WT + .2, hz - 1.95]], shape="mol", n=3, size=.1, rate=.45, color="solv", rim="solvR")

# ═════════ 顯影杯 D：同一種杯；縫隙噴嘴（顯影液扇形）沿 x 掃過；側邊純水噴嘴；甩乾 ═════════
cup("d", "d_mod", *DV)
CHK_D = chuck("d", "d_mod", *DV)
# 顯影液液膜（puddle）、沖水液膜
cyl("d_puddle", "d_pud", "devFilm", WR - .02, .1, [DV[0], WT + .08, DV[1]])
cyl("d_water", "d_wat", "diwFilm", WR - .02, .08, [DV[0], WT + .07, DV[1]])
# 縫隙噴嘴（layer d_slit）：家在晶圓左邊外側；掃過去再回來
SLX = DV[0] - 1.75
box("ds_bar", "d_slit", "cab2", [.22, .2, 2.7], [SLX, WT + .4, DV[1]], bevel=.03)
box("ds_lip", "d_slit", "devFilm", [.08, .04, 2.6], [SLX, WT + .28, DV[1]])
box("ds_arm", "d_slit", "steelHi", [.24, .16, 1.3], [SLX, WT + .42, DV[1] - 1.95], bevel=.03)
box("ds_armV", "d_slit", "steelHi", [.22, WT + .42 - DECK - .3, .22], [SLX, (WT + .42 + DECK + .3) / 2, DV[1] - 2.6])
box("ds_rail", "d_rail", "steel2", [4.2, .16, .3], [DV[0], DECK + .3, DV[1] - 2.6])
box("ds_led", "d_slit", "led", [.05, .06, .3], [SLX - .12, WT + .4, DV[1] + 1.0])
air("ds_space", "d_slit", [SLX - .15, WT, DV[1] - 1.4], [SLX + .15, WT + .3, DV[1] + 1.4])
flowx("d_devSpray", "d_slit", [[SLX, WT + .26, DV[1]], [SLX, WT + .09, DV[1]]], shape="liquid", n=3, lanes=6, gap=.42, ldir=(0, 0, 1), size=.08, rate=1.5, color="dev", rim="devR", band=.03, bandO=.5)
# 側邊純水噴嘴（固定，斜噴到中心，扇形）
RN = (DV[0] + 1.55, WT + .4, DV[1] - 1.55)
box("dr_post", "d_rin", "steel2", [.3, RN[1] - DECK, .3], [RN[0] + .75, (RN[1] + DECK) / 2, RN[2] - .75])
box("dr_arm", "d_rin", "steelHi", [1.1, .18, .18], [RN[0] + .375, RN[1] + .05, RN[2] - .375], rot=[0, 45, 0])
cyl("dr_tip", "d_rin", "pfa", .07, .3, [RN[0], RN[1] - .1, RN[2]])
for j, (dx, dz) in enumerate([(-.35, .12), (-.1, .38), (.12, -.1), (-.5, .45), (0, 0)]):
    flowx(f"d_rinse{j}", "d_rin", [[RN[0], RN[1] - .22, RN[2]], [DV[0] + .4 + dx * .5, WT + .35, DV[1] - .4 + dz * .5], [DV[0] + dx, WT + .08, DV[1] + dz]], shape="liquid", n=3, size=.07, rate=1.4, color="diw", rim="diwR", band=.03, bandO=.5)
air("dr_space", "d_rin", [DV[0] - .6, WT, DV[1] - 1.3], [RN[0] + .1, RN[1], DV[1] + .6])
for j in range(10):
    flowx(f"d_fling{j}", "d_mod", edge_path(*DV, j * 2 * math.pi / 10 + .1), shape="liquid", n=2, size=.08, rate=.95, color="diw", rim="diwR", band=.01, bandO=0)
air("d_space", "d_mod", [DV[0] - 2.1, DECK + .3, DV[1] - 2.1], [DV[0] + 2.1, WT + .45, DV[1] + 2.1])

# ═════════ 介面台 IF ＋ 曝光機 ═════════
box("i_base", "i_mod", "cab2", [2.4, WB - .2 - DECK, 2.4], [IF[0], (WB - .2 + DECK) / 2, IF[1]], bevel=.05)
cyl("i_stage", "i_mod", "plate", .9, .14, [IF[0], WB - .13, IF[1]])
cyl("i_pin", "i_mod", "steelHi", .05, .06, [IF[0], WB - .042, IF[1]], at=[[.6 * math.cos(a), 0, .6 * math.sin(a)] for a in (0.5, 2.6, 4.7)])
box("i_rail", "i_mod", "steel2", [SX0 - IF[0] + .6, .1, .3], [(IF[0] + SX0) / 2 + .3, WB - .25, IF[1] - 1.0])
box("i_rail2", "i_mod", "steel2", [SX0 - IF[0] + .6, .1, .3], [(IF[0] + SX0) / 2 + .3, WB - .25, IF[1] + 1.0])
box("i_lbl", "i_mod", "hvY", [.9, .3, .04], [IF[0], (WB + DECK) / 2, IF[1] + 1.22])
# 曝光機外殼：大機櫃、前面板分格、觀察窗（深色玻璃，曝光時裡面發紫光）、傳送口、頂上管線、狀態燈
SY = 9.6
box("s_body", "s_body", "scan", [SX1 - SX0, SY, 10.0], [(SX0 + SX1) / 2, SY / 2, -1.0], bevel=.08)
box("s_panel", "s_body", "scan2", [2.9, 3.6, .06], [SX0 + 1.8, 2.3, 4.03], at=[[3.1 * i, 0, 0] for i in range(3)], bevel=.02)
box("s_panelS", "s_body", "seam", [.05, 8.8, .06], [SX0, SY / 2, 4.04], at=[[3.2 * i, 0, 0] for i in range(1, 3)])
box("s_band", "s_body", "cabD", [SX1 - SX0, .4, .06], [(SX0 + SX1) / 2, 4.6, 4.04])
box("s_win", "s_body", "glassD", [3.6, 2.6, .08], [SX0 + 6.0, 6.9, 4.04], bevel=.04)
box("s_winF", "s_body", "steelHi", [3.8, .12, .1], [SX0 + 6.0, 6.9, 4.07], at=[[0, -1.36, 0], [0, 1.36, 0]])
box("s_winF2", "s_body", "steelHi", [.12, 2.84, .1], [SX0 + 6.0, 6.9, 4.07], at=[[-1.86, 0, 0], [1.86, 0, 0]])
box("s_slot", "s_body", "cabD", [.06, .7, 3.0], [SX0 - .03, WY, IF[1]])
box("s_slotF", "s_body", "steelHi", [.08, .12, 3.2], [SX0 - .05, WY, IF[1]], at=[[0, -.42, 0], [0, .42, 0]])
box("s_tw", "s_body", "steel2", [.2, 1.0, .2], [SX1 - .8, SY + .5, 3.2])
cyl("s_twG", "s_body", "led", .22, .34, [SX1 - .8, SY + 1.2, 3.2])
cyl("s_twB", "s_body", "euvU", .22, .34, [SX1 - .8, SY + 1.56, 3.2])
pipe("s_pipe", "s_body", "steel2", [[SX0 + 1.0, SY, -4.0], [SX0 + 1.0, SY + 1.4, -4.0], [SX1 - 1.0, SY + 1.4, -4.0]], .3)
box("s_scr", "s_body", "screen", [2.0, 1.3, .08], [SX0 + 1.8, 6.9, 4.05], bevel=.03)
box("s_scrUI", "s_body", "screenUI", [1.5, .1, .04], [SX0 + 1.8, 6.9, 4.1], at=[[0, -.4 + .27 * j, 0] for j in range(4)])
# 觀察窗裡的光（看得到的只有窗內：光束直直往下、照到晶圓台的位置）
box("s_beamSp", "s_light", "air", [3.2, 2.4, .2], [SX0 + 6.0, 6.9, 4.1])
flowx("s_beam", "s_light", [[SX0 + 6.0, 8.0, 4.12], [SX0 + 6.0, 5.8, 4.12]], shape="liquid", n=4, lanes=5, gap=.5, ldir=(1, 0, 0), size=.06, rate=2.2, color="euv", rim="euvR", band=.05, bandO=.7)
glow("s_winOn", "s_body", ["s_win", "s_twB"], "euv", steady=False, g=.9, freq=3.0, halo=.6)

# ═════════ 中央機械手臂（零件庫 arm，kin 關節鏈） ═════════
FB = 4.05                         # 手臂停著時指尖底部高度（要高過杯唇 WT+.5）
DROP = .9
L1, L2, GW = 3.0, 2.6, 2.5
# 零件庫：指尖底部＝pos.y + h − 0.53 − drop（見 scripts/three/parts/parts.mjs arm）
# 零件庫 arm：指尖底部＝pos.y + h − drop − 0.53（scripts/three/parts/parts.mjs）→ h＝FB − DECK + drop + 0.53
lib = [{"part": "arm", "id": "rb", "layer": "a_arm", "pos": [0, DECK + .1, 0], "h": R(FB - DECK - .1 + DROP + .53), "l1": L1, "l2": L2, "drop": DROP, "gw": GW}]
GRAB = R(FB - (WB + .02))
box("a_ped", "a_ped", "cabD", [1.6, .1, 1.6], [0, DECK + .05, 0], bevel=.03)
box("a_pedL", "a_ped", "led", [.4, .06, .03], [0, DECK + .07, .82])
def ik(t, elbow=1):
    X, Y = t[0], -t[1]; d = math.hypot(X, Y)
    cb = (d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2); b2 = elbow * math.acos(max(-1, min(1, cb)))
    a1 = math.atan2(Y, X) - math.atan2(L2 * math.sin(b2), L1 + L2 * math.cos(b2))
    j1, j2 = math.degrees(a1), math.degrees(b2)
    j1 = (j1 + 180) % 360 - 180          # 關節上下限 ±170：換成同一個方向的等價角
    return {"j1": R(j1), "j2": R(j2), "j3": R(-(j1 + j2))}
# 各站的姿態（elbow 選讓前臂不擋鏡頭的那一邊）
POSE = {"C": ik(C, 1), "H1": ik(H1, 1), "H2": ik(H2, -1), "IF": ik(IF, -1), "DV": ik(DV, -1)}
def with_(p, **kw): d = dict(p); d.update(kw); return d
def leg(frm, to):
    """一趟搬運的關鍵格（從 frm 站姿態出發 → 轉到取料站 frm 上方 → 下降夾住 → 抬起 → 轉到 to → 下降放下（微回彈）→ 抬起）"""
    A, B = POSE[frm], POSE[to]
    ob = lambda p, k: with_(p, j1=R(p["j1"] + k))
    keys = [[0, with_(A, lift=0, claw=0)], [8, {"lift": GRAB}], [13, {"claw": .12}], [19, {"lift": -.15}],
            [41, ob(B, 1.6)], [46, dict(B)], [53, {"lift": R(GRAB + .01)}], [56, {"lift": GRAB}], [59, {"claw": 0}], [66, {"lift": 0}]]
    return keys, 13, 59        # 夾住、放開（相對 at 的幀）
def swing(frm, to, dur=40):
    A, B = POSE[frm], POSE[to]
    return [[0, with_(A, lift=0, claw=0)], [dur, dict(B)]]

model = {
 "name": "tech-resist2：光阻-2 塗佈顯影機。一站：塗佈顯影機（旋塗杯 C、加熱板 HP1／HP2、顯影杯 D、介面台 IF、中央手臂）＋右邊曝光機（genmodel.py 產生）",
 "unit": "示意，非實際比例", "size": {"w": 14, "h": 2, "r": .1, "t": 6},
}
# 被搬的晶圓（每一站一個圖層；放下那一幀換成下一個）
WB_ = wafer("wB", "wB", *H1, film="resist")                                  # HP1 上（軟烤）
WC_ = wafer("wC", "wC", *IF, film="resist")                                  # 介面台（送進曝光機）
WC2 = wafer("wC2", "wC2", *IF, latent=("resist", "lat", "wC2"))              # 曝光完（看不見的圖案：顏色只差一點點）
WD_ = wafer("wD", "wD", *H2, latent=("resist", "lat", "wD"))                 # HP2（曝後烤：照到光的條紋變色）
for i in range(NST):
    if i % 2:
        x, half = stripes(i); box(f"wD_ex{i}", "wD", "lat", [SW, .05, 2 * half], [H2[0] + x, WT + .028, H2[1]])
WE = wafer("wE", "wE", *DV, latent=("resist", "expo", "wE_ex"))              # 顯影杯（照到光的條紋溶掉）
turn("spinD", "d_mod", CHK_D + WE, DV[0], DV[1], 6)
glow("wD_react", "wD", [f"wD_ex{i}" for i in range(NST) if i % 2], "expo", steady=True, g=.9)
glow("i_ledOn", "i_mod", ["i_lbl"], "hvY", steady=False, g=.8, freq=2.0)
glow("k_ledG", "k_body", ["k_twG", "cn_led", "ds_led", "a_pedL", "h1_baseL", "h2_baseL"], "led", steady=False, g=.9, freq=1.2)

# 錨點（標籤引線接的地方）
anchor("t_track", "k_body", [TX0 + 1.0, TH, TZ1], dx=-60, dy=-120)
# 2026/11/24（tech-andy-fixes 審片反覆退件：念到公司就要有廠牌）：s10 念「東京威力科創」時機台頂端亮出廠牌（官方 LOGO 有原檔就貼原檔，否則公司名牌）
ROOT = os.path.normpath(os.path.join(D, "..", ".."))
_TEL = "logo:tel" if os.path.exists(os.path.join(ROOT, "public/logos/tel.png")) else "text:telT=東京威力科創|Tokyo Electron"
subprocess.run(["node", os.path.join(ROOT, "scripts/three/make-brand-tex.mjs"), "tech-resist2", "flag:JP", "flag:TW", _TEL], check=True, stdout=subprocess.DEVNULL)
SIGN = json.load(open(os.path.join(ROOT, "public/tex/brand/meta.json")))
def tex(name):
    materials["m_t_" + name] = {"kind": "unlit", "color": "#FFFFFF", "img": f"tex/brand/{name}.png"}; return "t_" + name
def plate(pid, lay, name, w, cx, cy, cz):
    h = w / SIGN[name]["aspect"]; box(pid, lay, tex(name), [w, h], [cx, cy, cz], shape="plane", uv01=True, shadow=False); return h
_SG = "sign-tel" if _TEL.startswith("logo:") else "sign-telT"
_sw = 3.4; _sh = _sw / SIGN[_SG]["aspect"]
box("k_sgB", "k_sign", "steel2", [_sw + .2, _sh + .2, .08], [TX0 + 3.2, TH + .2 + _sh / 2, TZ1 - .4])
plate("k_sg", "k_sign", _SG, _sw, TX0 + 3.2, TH + .2 + _sh / 2, TZ1 - .34)
_fh = 1.6 / SIGN["flag-JP"]["aspect"]
plate("k_fgJ", "k_sign", "flag-JP", 1.6, TX0 + 3.2 + _sw / 2 + 1.0, TH + .2 + _fh / 2, TZ1 - .34)
anchor("t_scan", "s_body", [SX0 + 2.0, SY, 4.0], dx=60, dy=-110)
anchor("t_cup", "c_mod", [C[0] - 1.9, WT + .4, C[1] + .6], dx=-140, dy=90)
anchor("t_wfC", "c_mod", [C[0] + .8, WT + .05, C[1] + .8], dx=150, dy=110)
anchor("t_noz", "c_noz", [C[0] + .25, NY + .3, C[1]], dx=130, dy=-110)
anchor("t_h1", "h1_mod", [H1[0] - 1.5, WT + .6, H1[1]], dx=-150, dy=-60)
anchor("t_h1w", "h1_mod", [H1[0] + .9, WT + .05, H1[1] + .6], dx=150, dy=90)
anchor("t_h2", "h2_mod", [H2[0] + 1.5, WT + .6, H2[1]], dx=140, dy=-90)
anchor("t_arm", "a_ped", [0, DECK + .1, .8], dx=-120, dy=120)
anchor("t_if", "i_mod", [IF[0] + .8, WT, IF[1] + .9], dx=120, dy=120)
anchor("t_dev", "d_mod", [DV[0] + 1.9, WT + .4, DV[1] + .6], dx=140, dy=90)
anchor("t_slit", "d_slit", [SLX, WT + .8, DV[1] + 1.3], dx=-140, dy=-80)
anchor("t_rin", "d_rin", [RN[0], RN[1], RN[2]], dx=140, dy=-90)
anchor("t_win", "s_body", [SX0 + 6.0, 8.2, 4.1], dx=110, dy=-120)
anchor("t_wfD", "d_mod", [DV[0] - .6, WT + .05, DV[1] + .9], dx=-150, dy=110)

# 主素材框（看不見；給 layout-check）：每段只亮鏡頭對準的那一個，其他層全部標 bg
materials["m_proxy"] = {"kind": "unlit", "color": "#FFFFFF", "opacity": 0}
PXB = {"px_all": (TX0 + 1.5, SX0 + 2.5, DECK, WT + .5, TZ0 + 2.0, TZ1 - 1.0), "px_trk": (TX0, TX1, DECK, 6.0, TZ0 + 1, TZ1),
       "px_c": (C[0] - 2.0, C[0] + 2.0, WB - .4, NY + .6, C[1] - 2.0, C[1] + 2.0), "px_cw": (C[0] - 1.3, C[0] + 1.3, WB, WT + .3, C[1] - 1.3, C[1] + 1.3),
       "px_h1": (H1[0] - 1.9, H1[0] + 1.9, DECK, WT + .5, H1[1] - 1.9, H1[1] + 1.9), "px_if": (IF[0] - 1.3, SX0 + .4, DECK, WT + .6, IF[1] - 1.5, IF[1] + 1.5),
       "px_h2": (H2[0] - 1.9, H2[0] + 1.9, DECK, WT + .5, H2[1] - 1.9, H2[1] + 1.9), "px_d": (DV[0] - 2.1, DV[0] + 2.1, DECK, WT + .5, DV[1] - 2.1, DV[1] + 2.1)}
for lid, (x0, x1, y0, y1, z0, z1) in PXB.items():
    box(lid, lid, "proxy", [.02, .02, .02], [x0, y0, z0], at=[[dx, dy, dz] for dx in (0, x1 - x0) for dy in (0, y1 - y0) for dz in (0, z1 - z0)])
layer("a_arm"); layer("rb_grip")   # 零件庫手臂的兩層也先宣告成背景（不然 layout-check 會把手臂當主素材）
for l in layers:
    if not l["id"].startswith("px_"): l["bg"] = True
model.update({
 "palette": palette, "materials": materials, "layers": layers, "anchors": anchors, "parts": lib + parts, "actions": actions,
 "pose": {"yaw0": 0, "yawIso": 0, "drift": 0},
 "camera": {"stand": {"d": 60, "elev": 22, "y": 4}},
 "fx": {"dpr": 1, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
})
json.dump(model, open(os.path.join(D, "model.json"), "w"), ensure_ascii=False, indent=1)
print("零件", len(parts), "層", len(layers), "動作", len(actions), "姿態", POSE)

# ═════════════════ 各幕 props（併進 script.json） ═════════════════
subprocess.run([sys.executable, os.path.join(D, "genscript.py")], check=True)
sp = os.path.join(D, "script.json"); script = json.load(open(sp))
HIDE = "s1:start-40"; FAR = "s13:start+400"; EARLY = "s1:start-300"
def off(c, n): return f"{c}{'+' if n >= 0 else '-'}{abs(n)}"
def cue(c, n):
    """「s5:start-16」再加 n 幀"""
    base, rest = c.split(":"); import re as _re
    m = _re.match(r"([A-Za-z0-9_]+)([+-]\d+)?$", rest); k = int(m.group(2) or 0) + n
    return off(f"{base}:{m.group(1)}", k)
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
def sec(kind, at, until, title, tag, t, y=930, h=330, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag, "t": {k: {"at": v} for k, v in t.items()}}
    d.update(kw); return d

# ── 搬運時程（每一趟：at、夾住、放開） ──
LEGS = [("L0", "C", "H1", "wA2", "s5:start-16"), ("L1", "H1", "IF", "wB", "s6:start-10"),
        ("L2", "IF", "H2", "wC2", "s7:back+4"), ("L3", "H2", "DV", "wD", "s8:start-24"), ("L4", "DV", "H1", "wE", "s8:dry+24")]
KIN = {}; T = {}
for nm, a, b, item, at in LEGS:
    keys, g, r = leg(a, b)
    T[nm] = {"at": at, "grab": cue(at, g), "rel": cue(at, r), "end": cue(at, 66)}
    KIN[nm] = {"arm": "rb", "at": at, "keys": keys, "carry": [{"layer": item, "grab": g, "release": r}]}
# s1：手臂空手從介面台轉到 HP1（開場就有東西在動）；s5 第一趟從 HP1 姿態出發前先轉到 C
KIN["S0"] = {"arm": "rb", "at": "s1:start-30", "keys": swing("IF", "H1", 70)}
KIN["S1"] = {"arm": "rb", "at": "s4:nm-10", "keys": swing("H1", "C", 34)}
KIN["L0"]["keys"][0] = [0, with_(POSE["C"], lift=0, claw=0)]
SLIDE_IN = cue(T["L1"]["end"], 2)          # 放下、手臂抬起後滑進曝光機
INSIDE = cue(SLIDE_IN, 22)
VIS = [
 # 旋塗：s1 已經塗好一層（轉著）；s2 起收掉，s3 念「甩成薄膜」從中心一圈圈鋪開
 *[hid(f"cr{i}", "s2:start", cue("s3:film", -14 + 5 * i), 5) for i in range(len(RINGS))],
 # 換成「塗好的晶圓」等夾（s5 手臂來夾之前一瞬間換，外觀一樣）
 hid("wA2", HIDE, cue(T["L0"]["at"], 2), 1),
 *[hid(f"cr{i}", cue(T["L0"]["at"], 2), FAR, 1) for i in range(len(RINGS))], hid("wA", cue(T["L0"]["at"], 2), FAR, 1),
 # 每一趟放下那一幀：舊的藏起來、新的出現
 hid("wA2", T["L0"]["rel"], FAR, 1), hid("wB", HIDE, T["L0"]["rel"], 1),
 hid("wB", T["L1"]["rel"], FAR, 1), hid("wC", HIDE, T["L1"]["rel"], 1),
 mv("wC", SLIDE_IN, FAR, dur=22, dx=SLIDE), hid("wC", INSIDE, FAR, 1),
 hid("wC2", HIDE, INSIDE, 1), mv("wC2", EARLY, "s7:back-16", dur=20, dx=SLIDE),
 hid("wC2", T["L2"]["rel"], FAR, 1), hid("wD", HIDE, T["L2"]["rel"], 1),
 hid("wD", T["L3"]["rel"], FAR, 1), hid("wE", HIDE, T["L3"]["rel"], 1), hid("wE_ex", HIDE, T["L3"]["rel"], 1), hid("wE_ex", "s8:dissolve", FAR, 20),
 # 顯影杯：液膜、沖水膜
 hid("d_pud", HIDE, cue(T["L3"]["end"], 14), 10), hid("d_pud", "s8:rinse", FAR, 10),
 hid("d_wat", HIDE, "s8:rinse+4", 8), hid("d_wat", "s8:dry+10", FAR, 14),
 # 噴嘴：光阻噴嘴 s1 在中心、s2 收回、s3 念「晶圓中心」回到中心、念「高速旋轉」收回；縫隙噴嘴掃過晶圓
 mv("c_noz", "s2:start", "s3:center-14", dur=24, dx=-2.2), mv("c_noz", "s3:spin-4", FAR, dur=24, dx=-2.2),
 mv("d_slit", cue(T["L3"]["end"], 2), "s8:rinse-10", dur=34, dx=3.5),
]
PXW = {"px_all": [(EARLY, "s3:start-4"), ("s9:start+30", "s13:start+500")], "px_c": [("s3:start+30", "s4:start-4")], "px_cw": [("s4:start+30", "s5:start-22")],
       "px_h1": [("s5:start+30", "s6:start-4"), ("s8:hard+26", "s9:start-4")], "px_if": [("s6:start+30", "s7:start-4")], "px_h2": [("s7:start+30", "s8:start-4")],
       "px_d": [("s8:start+30", "s8:hard-4")]}
for lid, wins in PXW.items():
    prev = "s1:start-400"
    for a_, b_ in wins:
        VIS.append({"layer": lid, "at": prev, "until": a_, "opacity": 0, "dur": 1}); prev = b_
    VIS.append({"layer": lid, "at": prev, "until": "s13:start+600", "opacity": 0, "dur": 1})
VIS.append({"layer": "air", "at": "s1:start-400", "until": "s13:start+600", "opacity": 0, "dur": 1})
VIS.append(hid("k_sign", HIDE, "s10:tel", 8)); VIS.append(hid("k_sign", "s12:start", FAR, 8))   # 廠牌只在 s10–s11（念到東京威力科創起）
for lid in ("px_trk",):
    VIS.append({"layer": lid, "at": "s1:start-400", "until": "s13:start+600", "opacity": 0, "dur": 1})
COAT = lambda a, b: [run("c_drop", a, b, 4)] + [run(f"c_sheet{j}", a, b, 8) for j in range(8)] + [run(f"c_fling{j}", a, b, 6) for j in range(10)]
P = {}
P["s1"] = {"zoom": [{"to": "tool", "at": "start-30", "dur": 1}],
 "shot": [shot("start-30", 4.6, 2.0, 86, 34, 1), shot("stick", 4.2, 2.0, 82, 36, 70)],
 "shift": VIS,
 "kin": [KIN["S0"]],
 "run": [run("spinC1", "start-30", FAR, 130)] + COAT("start-30", "s2:start") + [run("k_ledG", "start-30", FAR, 1), run("i_ledOn", "start-30", FAR, 1)],
 "overlay": [sec("trk-hook", "who", "s2:start-5", "代工的供應商：光阻-2", "示意，非實際比例", {"who": "who", "stick": "stick", "this": "this"})]}
P["s2"] = {"zoom": [{"to": "bay", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", 4.6, 2.0, 86, 36, 30)],
 "labels": [lab("t_track", "塗佈顯影機", "Track", "amber", "name", "s3:start-4"),
            lab("t_if", "介面：進出曝光機", "Scanner interface", "coral", "inout+10", "s3:start-4", xy=[770, 347])],
 "overlay": [sec("trk-flow", "start+2", "s3:start-5", "晶圓在裡面走一圈", "示意", {"name": "name", "inout": "inout", "pass": "pass"})]}
P["s3"] = {"zoom": [{"to": "module", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", C[0], 2.0, 20, 32, 30)],
 "run": [run("spinC2", "spin-4", FAR, 180), run("c_drop", "drop-6", "spin+6", 4)] + [run(f"c_sheet{j}", "spin+4", "s5:start-20", 10) for j in range(8)] + [run(f"c_fling{j}", "film-6", "s5:start-20", 8) for j in range(10)],
 "labels": [lab("t_noz", "光阻噴嘴", "Resist nozzle", "amber", "center", "spin-2"), lab("t_wfC", "甩開、多的甩掉", "Spread and flung off", "coral", "film", "s4:start-4")],
 "overlay": [sec("trk-coat", "start+2", "s4:start-5", "旋轉塗佈", "側視示意", {"center": "center", "drop": "drop", "spin": "spin", "film": "film"})]}
P["s4"] = {"zoom": [{"to": "module", "at": "start-4", "dur": 1}],
 "shot": [shot("start-4", C[0] + .3, 1.9, 17, 42, 30)],
 "kin": [KIN["S1"]],
 "labels": [lab("t_wfC", "轉越快，膜越薄", "Faster = thinner", "blue", "fast", "s5:start-4")],
 "overlay": [sec("trk-thick", "start+2", "s5:start-5", "厚度靠轉速", "示意（轉速曲線依廠商）", {"fast": "fast", "thin": "thin", "euv": "euv", "nm": "nm"})]}
P["s5"] = {"zoom": [{"to": "module", "at": "start-4", "dur": 30}],
 "shot": [shot("start-20", -3.4, 4.5, 24, 45, 30)],
 "kin": [KIN["L0"]],
 "run": [run("h1_heat", "plate", "s6:start", 10)] + [run(f"h1_wave{j}", T["L0"]["rel"], "s6:start", 8) for j in range(3)] + [run(f"h1_solv{j}", cue(T["L0"]["rel"], 6), "s6:start", 8) for j in range(4)],
 "labels": [lab("t_arm", "機械手臂", "Transfer robot", "blue", "start", "plate-2"), lab("t_h1", "加熱板", "Hot plate", "amber", "plate", "s6:start-4"), lab("t_h1w", "溶劑蒸發", "Solvent leaves", "coral", "solv", "s6:start-4")],
 "overlay": [sec("trk-sb", "start+2", "s6:start-5", "軟烤：趕走溶劑", "示意", {"plate": "plate", "bake": "bake", "solv": "solv"})]}
P["s6"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [shot("start-10", 6.8, 3.9, 34, 38, 30)],
 "kin": [KIN["L1"]],
 "run": [run("s_winOn", "expose", "s7:start", 6), run("s_beam", "expose", "s7:start", 6)],
 "labels": [lab("t_arm", "手臂搬晶圓", "Robot handoff", "blue", "arm", "scan-2"), lab("t_if", "介面台", "Interface stage", "amber", "scan", "s7:start-4"), lab("t_win", "曝光", "Exposure", "blue", "expose", "s7:start-4")],
 "overlay": [sec("trk-exp", "start+2", "s7:start-5", "曝光：照出潛像", "示意", {"arm": "arm", "scan": "scan", "expose": "expose", "latent": "latent"})]}
P["s7"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}],
 "shot": [shot("start-4", 3.0, 4.9, 26, 45, 30)],
 "kin": [KIN["L2"]],
 "run": [run("h2_heat", "peb", "s8:start", 10)] + [run(f"h2_wave{j}", T["L2"]["rel"], "s8:start", 8) for j in range(3)] + [run("wD_react", "react-6", T["L3"]["rel"], 8)],
 "labels": [lab("t_h2", "加熱板：曝後烤", "Post-exposure bake", "amber", "peb", "s8:start-4")],
 "overlay": [sec("trk-peb", "start+2", "s8:start-5", "曝後烤：反應走完", "示意", {"back": "back", "peb": "peb", "lit": "lit", "react": "react"})]}
P["s8"] = {"zoom": [{"to": "module", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", 3.6, -0.9, 28, 45, 30), shot("hard-4", 0.5, 4.0, 34, 45, 30)],
 "kin": [KIN["L3"], KIN["L4"]],
 "run": [run("d_devSpray", cue(T["L3"]["end"], 2), "s8:rinse-12", 4), run("spinD", "dry-4", FAR, 26), run("h1_heat", T["L4"]["rel"], "s10:start", 10)]
        + [run(f"d_rinse{j}", "rinse-2", "dry+6", 4) for j in range(5)] + [run(f"d_fling{j}", "rinse+2", "dry+30", 6) for j in range(10)] + [run(f"h1_wave{j}", T["L4"]["rel"], "s10:start", 8) for j in range(3)],
 "labels": [lab("t_slit", "顯影液噴嘴", "Developer nozzle", "blue", "dev", "dissolve+10"),
            lab("t_rin", "純水沖洗", "DI water rinse", "blue", "rinse", "hard-6")],
 "overlay": [sec("trk-dev", "start+2", "s9:start-5", "顯影：洗出圖案", "示意", {"dev": "dev", "dissolve": "dissolve", "rinse": "rinse", "dry": "dry", "hard": "hard", "pattern": "pattern"})]}
P["s9"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", 4.6, 2.0, 86, 36, 30)],
 "labels": [lab("t_if", "曝光完馬上回來烤", "Straight to bake", "blue", "link", "s10:start-4")],
 "overlay": [sec("trk-wait", "start+2", "s10:start-5", "為什麼要連在一起", "專利文獻整理，示意", {"why": "why", "link": "link", "wait": "wait", "bad": "bad"})]}
P["s10"] = {"zoom": [{"to": "bay", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", 4.6, 2.0, 86, 34, 30)],
 "labels": [dict(lab("t_track", "東京威力科創", "Japan", "amber", "tel", "s11:start-4", xy=[400, 347]), flag="JP", logo="tel")],
 "overlay": [sec("trk-co", "start+2", "s11:start-5", "誰在做", "公司說法＋研究機構估計", {"tel": "tel", "euv": "euv", "all": "all"})]}
P["s11"] = {"zoom": [{"to": "bay", "at": "start-4", "dur": 1}],
 "shot": [shot("start-4", 2.0, 2.4, 64, 36, 30)],
 "labels": [dict(lab("t_track", "台南：維修中心", "Taiwan", "amber", "tainan", "s12:start-4"), flag="TW")],
 "overlay": [sec("trk-tw", "start+2", "s12:start-5", "在台灣", "公司說法、媒體報導", {"tw": "tw", "tainan": "tainan", "repair": "repair", "parts": "parts"})]}
P["s12"] = {"zoom": [{"to": "bay", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", 8.6, 3.8, 72, 26, 30)],
 "labels": [lab("t_scan", "下一集：曝光機", "Next: the scanner", "blue", "scan", "kw-10")],
 "overlay": [sec("trk-next", "start+2", "kw-10", "接下來", "下一集：設備五大-1", {"even": "even", "acc": "acc", "scan": "scan", "next": "next", "kw": "kw"})]}
for sc in script["scenes"]:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])
json.dump(script, open(sp, "w"), ensure_ascii=False, indent=1)
print("script props 併入", len(P), "幕")
