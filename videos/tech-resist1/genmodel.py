# tech-resist1 產生器：python3 videos/tech-resist1/genmodel.py → model.json，並先跑 genscript.py、再把各幕 3D 動作與 2D 卡併進 script.json
# 光阻-1：照到光就會變的膠（系列 2「代工的供應商」第 5 集）。
# 座標：x 右、y 上、z 朝觀眾；示意，非實際比例。各站以 x 偏移分開，鏡頭一次只看一站：
#   A x=0    晶圓台（旋轉夾頭、集液杯、塗了光阻的 12 吋晶圓＋晶粒、光阻瓶、點膠噴嘴）               s2、s14
#   B x=30   正型光阻剖面塊＝主角（矽基板、待刻薄膜、光阻層 7 欄、正面看得到高分子長鏈；上方鏡頭＋光罩（玻璃＋鉻條）；
#            光帶只從透光處照進去，照到的欄長鏈斷開、變色；顯影液一層蓋上去，照到的欄被洗掉）       s1、s3、s4、s5
#   N x=46   負型光阻剖面塊（同樣曝光，照到的欄長出交聯網；顯影後沒照到的欄被洗掉）               s5
#   C x=72   化學放大分子特寫（三條高分子主鏈＋保護基、光酸產生劑、光子打中→放出酸（H⁺）、烤盤加熱→酸沿鏈一路把保護基拆掉）  s6、s7、s8
#   D x=102  ArF 對 EUV：兩塊光阻，上面光子密度不同；s10 顯影後 EUV 那塊線條隨機斷線、橋接          s9、s10
#   E x=130  金屬氧化物光阻：左邊化學放大（光子穿過）、右邊金屬氧化物團簇（光子被吸住、團簇發亮）      s11
#   F x=158  材料倉：化學品櫃＋光阻瓶＋桶槽；x=176 光阻工廠（外牆窗格、屋頂空調、排氣管、儲槽、管架） s13（11/24 刪掉公司名稱句 s12，材料倉不再入鏡）
# 所有動作的 at 都寫成「幕id:cue±幀」（cue 來自 timeline.json；配音重跑 align 後重跑本檔即可）。
import json, math, os, random, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))
R = lambda x: round(x, 3)
rnd = random.Random(20261207)
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
def air(pid, lay, lo, hi):
    box(pid, lay, "air", [hi[i] - lo[i] for i in range(3)], [(lo[i] + hi[i]) / 2 for i in range(3)])

palette = {"floor": "#F1ECD9", "floorG": "#C9BE98", "wall": "#F5EFD2", "wall2": "#E2D7AE", "ffu": "#FBF7E6", "lamp": "#FFE79A",
 "cab": "#EEF2F7", "cab2": "#D7DEE8", "cabD": "#4A5873", "steel": "#A9B6CA", "steel2": "#7F8CA3", "steelHi": "#C9D3E2",
 "si": "#7F8DA6", "siTop": "#9AA8C0", "film": "#3FB6C8", "resist": "#E9A23B", "resistL": "#FFD27A", "chain": "#8A4B12", "pac": "#2F7FE0",
 "lit": "#FFE36A", "net": "#14A38B", "dev": "#7FB8F2", "devR": "#3C86D8", "chrome": "#2B3038", "glass": "#D6E6F8", "lens": "#BFD9F5",
 "duv": "#4E6CFF", "duvR": "#2A44D0", "euv": "#9B4DFF", "euvR": "#6A22D0", "carbon": "#59606C", "pg": "#F2A33A", "pgR": "#C47A14",
 "oh": "#14A38B", "pag": "#8E44D8", "pagR": "#5E1FA0", "acid": "#E0472F", "acidR": "#9E2A1A", "plus": "#FFFFFF", "heat": "#FF7A2F", "hot": "#FFB23F",
 "sn": "#B8C2D0", "ox": "#E0472F", "lig": "#4FB070", "bad": "#D4231A",
 "bottle": "#6B3A12", "bottleL": "#8A5220", "cap": "#F4F6FA", "label": "#FFFFFF", "drum": "#E6EBF2", "drumB": "#2F6FD8",
 "bld": "#E9EEF5", "bld2": "#C9D3E1", "win": "#7FA6D8", "roof": "#B9C3D2", "tank": "#DDE3EC", "led": "#14C38E", "screen": "#2E6FD8", "die": "#7FA4E0", "mirror": "#C8D5EA"}
def M(color, **k): return {"kind": "std", "color": color, "rough": .45, "metal": .1, **k}
U = lambda c, o=None: {"kind": "unlit", "color": c, **({"opacity": o} if o is not None else {})}
materials = {
 "floor": M("floor", rough=.6, metal=0), "floorG": U("floorG"), "wall": M("wall", rough=.7, metal=0), "wall2": M("wall2", rough=.7, metal=0), "ffu": U("ffu"), "lamp": U("lamp"),
 "cab": M("cab", rough=.45, metal=.1), "cab2": M("cab2", rough=.5, metal=.1), "cabD": M("cabD", rough=.5, metal=.3),
 "steel": M("steel", rough=.28, metal=.88, env=.7, tex="brushed", texScale=2), "steel2": M("steel2", rough=.35, metal=.8, env=.6), "steelHi": M("steelHi", rough=.22, metal=.9, env=.9),
 "si": M("si", rough=.35, metal=.5, env=.6), "siTop": M("siTop", rough=.3, metal=.5, env=.7), "film": M("film", rough=.3, metal=.3, env=.6),
 "resist": {"kind": "phys", "color": "resist", "rough": .25, "metal": 0, "clearcoat": .8, "env": .6},
 "resistC": {"kind": "phys", "color": "resist", "rough": .2, "metal": 0, "clearcoat": 1, "opacity": .78, "env": .8},
 "chain": M("chain", rough=.4, metal=.1), "pac": M("pac", rough=.35, metal=.1), "net": {"kind": "std", "color": "net", "emissive": "net", "ei": .35, "rough": .3},
 "dev": {"kind": "phys", "color": "dev", "rough": .05, "metal": 0, "clearcoat": 1, "opacity": .55, "env": .9},
 "chrome": M("chrome", rough=.2, metal=.9, env=.8), "glass": {"kind": "phys", "color": "glass", "rough": .08, "metal": 0, "clearcoat": 1, "opacity": .3, "env": .6},
 "lens": {"kind": "phys", "color": "lens", "rough": .05, "metal": 0, "clearcoat": 1, "env": 1.0},
 "carbon": M("carbon", rough=.4, metal=.2, env=.5), "pg": M("pg", rough=.35, metal=.05), "oh": {"kind": "std", "color": "oh", "emissive": "oh", "ei": .3, "rough": .3},
 "pag": M("pag", rough=.3, metal=.1), "pagRing": M("#B98AE8", rough=.3, metal=.1),
 "acid": {"kind": "std", "color": "acid", "emissive": "acid", "ei": .5, "rough": .3}, "plus": U("plus"),
 "coil": {"kind": "std", "color": "#B4542A", "emissive": "heat", "ei": .2, "rough": .5},
 "sn": M("sn", rough=.2, metal=.9, env=1.0), "ox": M("ox", rough=.35, metal=.05), "lig": M("lig", rough=.35, metal=.05), "bad": U("bad"),
 "bottle": {"kind": "phys", "color": "bottle", "rough": .12, "metal": 0, "clearcoat": 1, "env": .9}, "bottleL": M("bottleL", rough=.3),
 "cap": M("cap", rough=.5, metal=0), "label": U("label"), "drum": M("drum", rough=.4, metal=.2), "drumB": M("drumB", rough=.4, metal=.2),
 "bld": M("bld", rough=.6, metal=0), "bld2": M("bld2", rough=.6, metal=0), "win": {"kind": "phys", "color": "win", "rough": .1, "metal": .3, "clearcoat": 1, "env": 1.0},
 "roof": M("roof", rough=.6, metal=.2), "tank": M("tank", rough=.3, metal=.7, env=.8),
 "led": {"kind": "std", "color": "led", "emissive": "led", "ei": .9}, "screen": {"kind": "screen", "color": "screen", "ei": .7}, "screenUI": U("#BFD8FF"),
 "die": M("die", rough=.22, metal=.55, tex="traces", texScale=.35, env=.9), "mirror": {"kind": "phys", "color": "mirror", "rough": .04, "metal": .55, "clearcoat": 1, "env": 1.2},
 "air": U("#FFFFFF", .0),
}
materials = {"m_" + k: v for k, v in materials.items()}
def flowx(key, lay, path, shape="dot", n=4, lanes=1, gap=.2, ldir=(1, 0, 0), size=.1, rate=1.0, color="duv", rim="duvR", trail=0, band=None, bandO=.5, rimO=.6):
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
    layer(lay); actions[key] = {"type": "vibrate", "layer": lay, "parts": ps, "axis": list(axis), "amp": amp, "freq": freq}
def spin(key, lay, ps, cx, rps, cz=0.0):
    layer(lay); actions[key] = {"type": "rotate", "layer": lay, "parts": ps, "axis": [0, 1, 0], "pivot": [R(cx), 0, R(cz)], "rps": rps, "rampSpin": True}
def lp(lay): return [p["id"] for p in parts if p["layer"] == lay]

# ═════════ 黃光區（背景，各站共用）：微影區的照明是黃光（光阻怕短波長光），地板格柵、牆面分隔、天花板過濾器、牆上管線架 ═════════
box("r_floor", "t_room", "floor", [340, .3, 44], [148, -.15, -2])   # 11/25 審片必改 4：地板牆面加長到 x=318，日本廠（x=198）後面不再是空白
box("r_grate", "t_room", "floorG", [.1, .03, 44], [88, .02, -2], at=[[-108 + 2.0 * i, 0, 0] for i in range(168)])
box("r_grate2", "t_room", "floorG", [340, .03, .1], [148, .02, -2], at=[[0, 0, -21 + 2.0 * j] for j in range(22)])
box("r_wall", "t_room", "wall", [340, 26, .4], [148, 13, -18])
box("r_wallS", "t_room", "wall2", [.12, 25.6, .45], [88, 13, -17.9], at=[[-108 + 6 * i, 0, 0] for i in range(57)])
box("r_ffu", "t_room", "ffu", [5.6, .4, 5.6], [88, 26.2, -12], at=[[-108 + 6 * i, 0, k * 6] for i in range(57) for k in (0, 1)])
box("r_lamp", "t_room", "lamp", [4.6, .12, .5], [88, 25.9, -9], at=[[-108 + 6 * i, 0, k * 6] for i in range(57) for k in (0, 1)])   # 黃光燈管
box("r_tray", "t_room", "steel2", [340, .25, .6], [148, 14.5, -16.6])
cyl("r_pipeW", "t_room", "steelHi", .18, 340, [148, 15.0, -16.6], axis="x", at=[[0, 0, 0], [0, .55, 0], [0, 1.1, 0]])

# ═════════ A：晶圓台 x=0（塗了光阻的晶圓、光阻瓶、點膠噴嘴） ═════════
AX = 0
WY = 3.62     # 晶圓上表面
box("a_base", "a_body", "cab", [9.0, 3.0, 6.0], [AX, 1.5, 0], bevel=.06)
box("a_baseP", "a_body", "cab2", [2.6, 2.0, .06], [AX, 1.4, 3.03], at=[[-2.9, 0, 0], [0, 0, 0], [2.9, 0, 0]], bevel=.02)
box("a_top", "a_body", "steel", [9.2, .2, 6.2], [AX, 3.1, 0])
tube("a_cup", "a_body", "cab2", 3.9, 3.62, 1.0, [AX, 3.5, 0])
tube("a_cupR", "a_body", "steelHi", 3.95, 3.6, .08, [AX, 4.0, 0])
cyl("a_shaft", "a_spin", "steelHi", .5, .3, [AX, 3.3, 0])
cyl("a_chuck", "a_spin", "steel2", 1.4, .12, [AX, 3.48, 0])
cyl("a_wafer", "a_spin", "mirror", 3.0, .08, [AX, WY - .04, 0])
def dies(pid, lay, cx, r, y, die=.36, gap=.05):
    pos = []; s = die + gap; n = int(r / s) + 1
    for i in range(-n, n + 1):
        for j in range(-n, n + 1):
            x, z = i * s, j * s
            if max(math.hypot(x + a * die / 2, z + b * die / 2) for a in (-1, 1) for b in (-1, 1)) < r - .12: pos.append([x, 0, z])
    box(pid, lay, "die", [die, .012, die], [cx, y, 0], at=pos); return len(pos)
ND = dies("a_die", "a_spin", AX, 3.0, WY + .004)
cyl("a_resist", "a_spin", "resistC", 2.97, .05, [AX, WY + .035, 0])          # 光阻膜（半透明琥珀，看得到底下晶粒）
tube("a_bead", "a_spin", "resist", 2.99, 2.86, .07, [AX, WY + .04, 0])        # 邊緣稍厚的一圈
box("a_notch", "a_spin", "cab2", [.18, .1, .18], [AX, WY, 2.96])
# 點膠手臂＋噴嘴（s14 下一集預告：光阻滴下、晶圓轉起來攤平）
box("a_post", "a_body", "steel2", [.5, 4.2, .5], [AX + 5.2, 5.2, -1.8])
box("a_arm", "a_body", "steel", [5.4, .4, .5], [AX + 2.7, 7.1, -1.8], bevel=.04)
box("a_armD", "a_body", "steel2", [.5, .4, 1.8], [AX, 7.1, -.9])
cyl("a_noz", "a_body", "steelHi", .16, .9, [AX, 6.5, 0])
cyl("a_nozT", "a_body", "resist", .06, .3, [AX, 5.95, 0])
pipe("a_tube", "a_body", "resist", [[AX + 5.2, 7.5, -1.6], [AX + .2, 7.5, -1.6], [AX + .2, 7.5, 0]], .05)
# 光阻瓶（棕色玻璃加侖瓶，避光）×2＋貼標＋白蓋
for k, (bx, bz) in enumerate([(AX + 6.8, 1.8), (AX + 8.4, 1.0)]):
    cyl(f"a_btl{k}", "a_btl", "bottle", .78, 2.2, [bx, 1.1, bz])
    cyl(f"a_btlS{k}", "a_btl", "bottle", .5, .4, [bx, 2.4, bz])
    cyl(f"a_btlN{k}", "a_btl", "bottle", .28, .4, [bx, 2.75, bz])
    cyl(f"a_btlC{k}", "a_btl", "cap", .32, .3, [bx, 3.05, bz])
    tube(f"a_btlL{k}", "a_btl", "label", .8, .77, .8, [bx, 1.1, bz])
    box(f"a_btlH{k}", "a_btl", "bottleL", [.12, .9, .4], [bx + .82, 1.5, bz])
flowx("a_drop", "a_body", [[AX, 5.8, 0], [AX, WY + .12, 0]], shape="liquid", n=3, size=.14, rate=.7, color="resist", rim="chain", band=.06, bandO=.9)
SPI = [[AX + .25 * t * math.cos(t), WY + .07, .25 * t * math.sin(t)] for t in [i * .45 for i in range(26)]]
flowx("a_spread", "a_spin", SPI, shape="liquid", n=6, size=.1, rate=.5, color="resist", rim="chain", band=.08, bandO=.7)
spin("a_rot", "a_spin", lp("a_spin"), AX, .9)
glow("a_shine", "a_spin", ["a_resist"], "lit", steady=False, g=.35, freq=.6)
anchor("a_resA", "a_spin", [AX + 1.6, WY + .05, 1.6], dx=200, dy=60)
anchor("a_waferA", "a_spin", [AX - 2.2, WY, 1.4], dx=-190, dy=70)
anchor("a_btlA", "a_btl", [AX + 6.8, 2.6, 2.4], dx=150, dy=-90)
anchor("a_nozA", "a_body", [AX, 6.2, 0], dx=-180, dy=-80)

# ═════════ B／N：光阻層剖面塊（主角） ═════════
NC = 7; CW = 12 / NC
EXP = (1, 3, 5)                 # 光罩透光的欄
Y_SUB, Y_FILM, Y_RT = 1.4, 1.75, 3.35
ROWS = [2.0, 2.4, 2.8, 3.15]
def block(P, X, neg):
    lay_s = f"{P}_sub"
    box(f"{P}_si", lay_s, "si", [12, Y_SUB, 4], [X, Y_SUB / 2, 0], bevel=.03)
    box(f"{P}_siL", lay_s, "siTop", [12.02, .03, .03], [X, 0, 2.0], at=[[0, .35 * j, 0] for j in range(1, 4)])     # 剖面上的晶格紋
    box(f"{P}_film", lay_s, "film", [12, Y_FILM - Y_SUB, 4], [X, (Y_SUB + Y_FILM) / 2, 0])
    box(f"{P}_stage", lay_s, "steel2", [13.2, .5, 5.0], [X, -.25, 0], bevel=.04)                                     # 載台
    for c in range(NC):
        cx = X - 6 + CW * (c + .5); L = f"{P}_c{c}"
        box(f"{P}_m{c}", L, "resist", [CW + .002, Y_RT - Y_FILM, 4], [cx, (Y_FILM + Y_RT) / 2, 0])
        beads, sides = [], []
        for r_, ry in enumerate(ROWS):
            for b in range(7):
                bx = -CW / 2 + .12 + b * (CW - .24) / 6
                beads.append([bx, ry - (Y_FILM + Y_RT) / 2 + .07 * math.sin(b * 1.7 + r_ * 2.1 + c), 2.04])
                if (b + r_) % 3 == 0: sides.append([bx, ry - (Y_FILM + Y_RT) / 2 + .16, 2.06])
        sph(f"{P}_bd{c}", L, "chain", .085, [cx, (Y_FILM + Y_RT) / 2, 0], at=beads)
        sph(f"{P}_pc{c}", L, "pac", .065, [cx, (Y_FILM + Y_RT) / 2, 0], at=sides)            # 感光成分
        bl = f"{P}_b{c}"
        bonds = [[-CW / 2 + .12 + (b + .5) * (CW - .24) / 6, ry - (Y_FILM + Y_RT) / 2 + .07 * math.sin((b + .5) * 1.7 + r_ * 2.1 + c), 2.04] for r_, ry in enumerate(ROWS) for b in range(6)]
        bonds += [[-CW / 2, ry - (Y_FILM + Y_RT) / 2, 2.04] for ry in ROWS]                       # 跨欄的那一段
        cyl(f"{P}_bn{c}", bl, "chain", .03, (CW - .24) / 6, [cx, (Y_FILM + Y_RT) / 2, 0], axis="x", at=bonds)
        if neg and c in EXP:
            xl = [[-CW / 2 + .12 + b * (CW - .24) / 6, (ROWS[r_] + ROWS[r_ + 1]) / 2 - (Y_FILM + Y_RT) / 2, 2.05] for r_ in range(3) for b in range(0, 7, 2)]
            cyl(f"{P}_xl{c}", f"{P}_x{c}", "net", .035, .38, [cx, (Y_FILM + Y_RT) / 2, 0], axis="y", at=xl)
    # 曝光機鏡頭（示意，只畫最下面一節）＋光罩（石英玻璃＋鉻條＋外框＋夾具）
    cyl(f"{P}_lensH", f"{P}_opt", "cabD", 3.2, 1.4, [X, 7.7, 0])
    cyl(f"{P}_lensG", f"{P}_opt", "lens", 2.7, .2, [X, 6.95, 0])
    tube(f"{P}_lensR", f"{P}_opt", "steelHi", 3.25, 2.7, .25, [X, 6.98, 0])
    box(f"{P}_mg", f"{P}_mask", "glass", [12.4, .25, 4.6], [X, 5.4, 0])
    for c in range(NC):
        if c not in EXP: box(f"{P}_cr{c}", f"{P}_mask", "chrome", [CW, .06, 4.4], [X - 6 + CW * (c + .5), 5.25, 0])
    box(f"{P}_mfr", f"{P}_mask", "steel2", [.3, .35, 4.8], [X, 5.4, 0], at=[[-6.35, 0, 0], [6.35, 0, 0]])
    box(f"{P}_mcl", f"{P}_mask", "steel", [.8, .5, .8], [X, 5.65, 0], at=[[-6.35, 0, -2.0], [6.35, 0, -2.0], [-6.35, 0, 2.0], [6.35, 0, 2.0]])
    # 光：鏡頭射下來；透光處一路照進光阻，鉻條處在光罩上面就斷掉
    for c in range(NC):
        cx = X - 6 + CW * (c + .5)
        if c in EXP:
            flowx(f"{P}_L{c}", f"{P}_opt", [[cx, 6.8, .6], [cx, Y_RT + .02, .6]], shape="liquid", n=4, lanes=3, gap=.45, size=.12, rate=.9, color="duv", rim="duvR", band=.1, bandO=.75)
        else:
            flowx(f"{P}_L{c}", f"{P}_opt", [[cx, 6.8, .6], [cx, 5.55, .6]], shape="liquid", n=2, lanes=3, gap=.45, size=.12, rate=.9, color="duv", rim="duvR", band=.1, bandO=.55)
    # 顯影液：噴嘴＋一層液體蓋上整片
    box(f"{P}_devL", f"{P}_dev", "dev", [12, .28, 4], [X, Y_RT + .14, 0])
    cyl(f"{P}_dnoz", f"{P}_dn", "steelHi", .18, 1.0, [X - 4.8, 4.6, .8])
    flowx(f"{P}_dflow", f"{P}_dn", [[X - 4.8, 4.05, .8], [X - 4.8, Y_RT + .3, .8], [X + 5.6, Y_RT + .22, .8]], shape="liquid", n=5, size=.12, rate=.6, color="dev", rim="devR", band=.07, bandO=.8)
    for c in EXP:
        glow(f"{P}_chg{c}", f"{P}_c{c}", [f"{P}_m{c}"], "lit", steady=True, g=.55)
        vib(f"{P}_jit{c}", f"{P}_c{c}", [f"{P}_bd{c}", f"{P}_pc{c}"], (0, 1, 0), .05, 6)
        if neg: glow(f"{P}_netG{c}", f"{P}_x{c}", [f"{P}_xl{c}"], "net", steady=False, g=.8, freq=1.4)
    air(f"{P}_airL", f"{P}_opt", [X - 6.2, Y_RT, -.2], [X + 6.2, 6.9, 1.4])
BX, NX = 30, 43   # 11/25：NX 46→43，兩塊間距 4→1，鏡頭可再放大
block("p", BX, False); block("n", NX, True)
anchor("p_resA", "p_c0", [BX - 6 + CW * .5, 3.0, 2.0], dx=-170, dy=-70)
anchor("p_maskA", "p_mask", [BX + 5.6, 5.4, 2.2], dx=150, dy=-60)
anchor("p_expA", "p_c3", [BX, 2.6, 2.0], dx=180, dy=110)
anchor("p_devA", "p_dev", [BX + 3.4, Y_RT + .25, 2.0], dx=180, dy=-80)
anchor("p_keepA", "p_c4", [BX - 6 + CW * 4.5, 3.2, 2.0], dx=200, dy=100)
anchor("p_filmA", "p_sub", [BX - 4.4, 1.55, 2.0], dx=-160, dy=90)
anchor("n_netA", "n_c3", [NX, 2.6, 2.0], dx=180, dy=110)
anchor("n_keepA", "n_c5", [NX - 6 + CW * 5.5, 3.2, 2.0], dx=180, dy=-80)
anchor("p_posA", "p_c1", [BX - 6 + CW * 1.5, 3.3, 2.0], dx=-150, dy=-120)
anchor("n_negA", "n_c1", [NX - 6 + CW * 1.5, 3.3, 2.0], dx=150, dy=-120)

# ═════════ C：化學放大分子特寫 x=72 ═════════
CX = 72
box("c_slab", "c_bgk", "resist", [15, 8.0, .6], [CX, 4.4, -2.2])                 # 背後的光阻基質
box("c_hot", "c_plate", "steel", [15, .7, 5.0], [CX, .35, 0], bevel=.05)          # 烤盤
box("c_coil", "c_plate", "coil", [14.2, .05, .16], [CX, .72, 0], at=[[0, 0, -2.0 + .5 * j] for j in range(9)])
box("c_hotS", "c_plate", "cabD", [15.2, .3, 5.2], [CX, -.15, 0])
box("c_wf", "c_plate", "si", [14.6, .25, 4.6], [CX, .83, 0])                      # 晶圓切面（上面就是光阻）
BB = [2.4, 4.4, 6.4]                                                           # 三條主鏈的高度
PGL = {}
for ci, by in enumerate(BB):
    pts = [[CX - 6.6 + .55 * i, by + (.16 if i % 2 else -.16), 0] for i in range(25)]
    sph(f"c_bb{ci}", "c_mol", "carbon", .16, [0, 0, 0], at=pts)
    for i in range(24):
        a, b = pts[i], pts[i + 1]; mx = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0]
        cyl(f"c_bbB{ci}_{i}", "c_mol", "carbon", .06, .5, mx, axis="x")
    for i in range(1, 25, 2):
        up = 1 if (i // 2) % 2 == 0 else -1
        p0 = pts[i]; tip = [p0[0], p0[1] + up * .55, .25]
        seg(f"c_st{ci}_{i}", "c_mol", "carbon", [p0[0], p0[1], .1], [p0[0], p0[1] + up * .5, .1], .045)
        L = f"c_pg{ci}_{i}"
        sph(f"c_pgS{ci}_{i}", L, "pg", .17, tip, at=[[0, 0, 0], [.2, up * .2, 0], [-.2, up * .2, 0]])
        sph(f"c_oh{ci}_{i}", f"c_oh{ci}_{i}", "oh", .14, tip)
        PGL[(ci, i)] = (L, f"c_oh{ci}_{i}", tip)
PAG = [[CX - 4.8, 3.4, .3], [CX + 1.2, 5.4, .3], [CX + 4.6, 3.4, .3]]
for k, p in enumerate(PAG):
    sph(f"c_pag{k}", "c_pag", "pag", .26, p)
    for j in range(3):
        a = math.radians(90 + 120 * j); q = [p[0] + .45 * math.cos(a), p[1] + .45 * math.sin(a), p[2]]
        cyl(f"c_pagR{k}_{j}", "c_pag", "pagRing", .2, .07, q, axis="z")
glow("c_pagG", "c_pag", ["c_pag0"], "lit", steady=False, g=.9, freq=2.0, halo=.4)
# 光子打中第一個光酸產生劑
flowx("c_hv", "c_mol", [[CX - 4.8, 10.5, .3], [PAG[0][0], PAG[0][1] + .3, .3]], shape="liquid", n=3, lanes=1, size=.16, rate=.8, color="duv", rim="duvR", band=.12, bandO=.8)
# 酸（H⁺）：紅球＋白色十字
def acid(name, p):
    sph(f"{name}S", name, "acid", .24, p)
    box(f"{name}P", name, "plus", [.32, .08, .04], [p[0], p[1], p[2] + .26])        # 正離子「＋」
    box(f"{name}Q", name, "plus", [.08, .32, .04], [p[0], p[1], p[2] + .26])
acid("c_a0", [PAG[0][0] + .5, PAG[0][1] + .45, .3])
acid("c_a1", [PAG[2][0] - .5, PAG[2][1] + .45, .3])
glow("c_a0G", "c_a0", ["c_a0S"], "acid", steady=False, g=.8, freq=2.4, halo=.6)
glow("c_a1G", "c_a1", ["c_a1S"], "acid", steady=False, g=.8, freq=2.4, halo=.6)
# 酸沿主鏈一路跳：經過的每個保護基被拆掉（片中：酸是觸媒，用完還在）
HOP1 = [[CX - 4.3, 3.85, .5]] + [[PGL[(1, i)][2][0], PGL[(1, i)][2][1] + (.32 if PGL[(1, i)][2][1] > BB[1] else -.32), .55] for i in range(1, 25, 2)]
flowx("c_hop0", "c_mol", HOP1, shape="dot", n=1, size=.2, rate=.3, color="acid", rim="acidR", trail=6)
HOP2 = [[CX + 4.1, 3.85, .5]] + [[PGL[(0, i)][2][0], PGL[(0, i)][2][1] + (.32 if PGL[(0, i)][2][1] > BB[0] else -.32), .55] for i in range(23, 0, -2)]
flowx("c_hop1", "c_mol", HOP2, shape="dot", n=1, size=.2, rate=.3, color="acid", rim="acidR", trail=6)
actions["c_hop0"]["plus"] = actions["c_hop1"]["plus"] = True          # 流動的酸 H⁺ 也標「＋」（正離子）
glow("c_coilOn", "c_plate", ["c_coil"], "heat", steady=True, g=.95)
for j, x in enumerate([-4.5, 0, 4.5]):
    actions[f"c_wave{j}"] = {"type": "wave", "layer": "c_plate", "from": [R(CX + x), 1.0, 2.2], "dir": [0, 1, 0], "reach": 1.0, "count": 3, "r0": .14, "spread": 1.2, "rate": 1.2, "phase": j / 3, "width": .18, "color": "heat"}
air("c_airM", "c_mol", [CX - 7, 1.6, -.3], [CX + 7, 10.6, .9])
anchor("c_chainA", "c_mol", [CX - 6.0, BB[2] + .2, .2], dx=-150, dy=-90)
anchor("c_pgA", "c_mol", [CX + 5.0, BB[2] + .6, .3], dx=150, dy=-90)
anchor("c_pagA", "c_pag", [PAG[0][0] - .3, PAG[0][1], .3], dx=-170, dy=60)
anchor("c_acidA", "c_a0", [PAG[0][0] + .5, PAG[0][1] + .45, .3], dx=170, dy=-110)
anchor("c_plateA", "c_plate", [CX + 5.5, .7, 2.4], dx=160, dy=60)
anchor("c_ohA", "c_mol", [CX - 2.0, BB[1] - .6, .3], dx=-170, dy=80)

# ═════════ D：ArF 對 EUV x=102 ═════════
DX = 102
def pad(P, x):
    box(f"{P}_st", f"{P}_pad", "steel2", [7.6, .4, 4.6], [x, .2, 0], bevel=.04)
    box(f"{P}_si", f"{P}_pad", "si", [7.2, .7, 4.2], [x, .75, 0])
    box(f"{P}_rs", f"{P}_rs", "resist", [7.2, .45, 4.2], [x, 1.325, 0])
    for j in range(5): box(f"{P}_ln{j}", f"{P}_ln", "resist", [.6, .45, 4.0], [x - 2.8 + 1.4 * j, 1.325, 0])
pad("da", DX - 5); pad("de", DX + 5)
# EUV 印出來的線：一條斷掉、兩條黏在一起
parts[:] = [p for p in parts if p["id"] not in ("de_ln1", "de_ln2")]
box("de_ln1a", "de_ln", "resist", [.6, .45, 1.6], [DX + 5 - 1.4, 1.325, -1.2])
box("de_ln1b", "de_ln", "resist", [.6, .45, 1.7], [DX + 5 - 1.4, 1.325, 1.15])
box("de_ln2", "de_ln", "resist", [.6, .45, 4.0], [DX + 5, 1.325, 0])
box("de_brg", "de_ln", "resist", [.9, .38, .7], [DX + 5 + .7, 1.29, .6])           # 橋接
tube("de_mk0", "de_bad", "bad", .62, .52, .05, [DX + 5 - 1.4, 1.6, .02])
tube("de_mk1", "de_bad", "bad", .62, .52, .05, [DX + 5 + .7, 1.6, .6])
glow("de_badG", "de_bad", ["de_mk0", "de_mk1"], "bad", steady=False, g=.9, freq=1.6, halo=.4)
# 光子：ArF 密、小；EUV 疏、大（同樣能量，光子數約 1/14）
flowx("da_ph", "da_pad", [[DX - 5, 8.5, 0], [DX - 5, 1.6, 0]], shape="dot", n=7, lanes=7, gap=.9, size=.08, rate=1.1, color="duv", rim="duvR", trail=2)
flowx("da_ph2", "da_pad", [[DX - 5, 8.5, -1.2], [DX - 5, 1.6, -1.2]], shape="dot", n=7, lanes=7, gap=.9, size=.08, rate=1.25, color="duv", rim="duvR", trail=2)
flowx("de_ph", "de_pad", [[DX + 5, 8.5, 0], [DX + 5, 1.6, 0]], shape="dot", n=1, lanes=3, gap=2.1, size=.2, rate=.45, color="euv", rim="euvR", trail=4)
# 光阻表面被打到的點：ArF 均勻、EUV 東一點西一點
HA = [[rnd.uniform(-3.3, 3.3), 0, rnd.uniform(-1.9, 1.9)] for _ in range(70)]
HE = [[rnd.uniform(-3.3, 3.3), 0, rnd.uniform(-1.9, 1.9)] for _ in range(6)]
cyl("da_hit", "da_hit", "lit", .1, .02, [DX - 5, 1.56, 0], at=HA)
cyl("de_hit", "de_hit", "lit", .26, .02, [DX + 5, 1.56, 0], at=HE)
materials["m_lit"] = {"kind": "unlit", "color": "#FFE36A"}
box("d_srcA", "d_src", "cabD", [3.0, 1.0, 2.6], [DX - 5, 9.3, 0], bevel=.05)
box("d_srcE", "d_src", "cabD", [3.0, 1.0, 2.6], [DX + 5, 9.3, 0], bevel=.05)
box("d_srcAL", "d_src", "lens", [2.4, .1, 2.0], [DX - 5, 8.75, 0]); box("d_srcEL", "d_src", "lens", [2.4, .1, 2.0], [DX + 5, 8.75, 0])
air("d_airA", "da_pad", [DX - 8.6, 1.5, -2.2], [DX - 1.4, 8.6, 2.2]); air("d_airE", "de_pad", [DX + 1.4, 1.5, -2.2], [DX + 8.6, 8.6, 2.2])
anchor("da_A", "d_src", [DX - 6.5, 9.3, 1.3], dx=-120, dy=-60)
anchor("de_A", "d_src", [DX + 6.5, 9.3, 1.3], dx=120, dy=-60)
anchor("de_brkA", "de_bad", [DX + 5 - 1.4, 1.6, 0], dx=-160, dy=90)
anchor("de_brgA", "de_bad", [DX + 5.7, 1.6, .6], dx=170, dy=90)

# ═════════ E：金屬氧化物光阻 x=130 ═════════
EX = 130
for P, x in (("ec", EX - 4.5), ("em", EX + 4.5)):
    box(f"{P}_st", f"{P}_pad", "steel2", [7.0, .4, 4.2], [x, .2, 0], bevel=.04)
    box(f"{P}_si", f"{P}_pad", "si", [6.6, .7, 3.8], [x, .75, 0])
# 左：化學放大（鬆的鏈，光子大多穿過去）
for j, yy in enumerate([1.7, 2.4, 3.1]):
    sph(f"ec_bb{j}", "ec_pad", "carbon", .13, [EX - 4.5, yy, 0], at=[[-2.8 + .47 * i, .1 * (1 if i % 2 else -1), 0] for i in range(13)])
# 右：金屬氧化物團簇（錫原子核心＋氧＋有機配位基）
CL = [[-1.8, 1.9, .2], [.3, 2.6, -.3], [2.0, 1.85, .4], [-.8, 3.2, .5], [1.4, 3.3, -.2]]
for k, c in enumerate(CL):
    cc = [EX + 4.5 + c[0], c[1], c[2]]
    sph(f"em_sn{k}", "em_core", "sn", .2, cc, at=[[.2, .2, .2], [-.2, -.2, .2], [-.2, .2, -.2], [.2, -.2, -.2]])
    sph(f"em_o{k}", "em_pad", "ox", .11, cc, at=[[.38, 0, 0], [-.38, 0, 0], [0, .38, 0], [0, -.38, 0], [0, 0, .38], [0, 0, -.38]])
    for j in range(5):
        a = math.radians(j * 72 + k * 20); e = [cc[0] + .75 * math.cos(a), cc[1] + .75 * math.sin(a), cc[2] + .2]
        seg(f"em_lg{k}_{j}", "em_pad", "lig", [cc[0] + .4 * math.cos(a), cc[1] + .4 * math.sin(a), cc[2] + .2], e, .035)
        sph(f"em_lt{k}_{j}", "em_pad", "lig", .08, e)
glow("em_coreG", "em_core", lp("em_core"), "lit", steady=False, g=.9, freq=1.8, halo=.5)
flowx("ec_ph", "ec_pad", [[EX - 4.5, 8.5, 0], [EX - 4.5, .8, 0]], shape="dot", n=1, lanes=3, gap=1.6, size=.2, rate=.5, color="euv", rim="euvR", trail=4)
flowx("em_ph", "em_pad", [[EX + 4.5 - .3, 8.5, 0], [EX + 4.5 - .3, 3.3, 0]], shape="dot", n=1, lanes=3, gap=1.6, size=.2, rate=.5, color="euv", rim="euvR", trail=4)
air("e_airC", "ec_pad", [EX - 8, .4, -2], [EX - 1, 8.6, 2]); air("e_airM", "em_pad", [EX + 1, .4, -2], [EX + 8, 8.6, 2])
anchor("ec_A", "ec_pad", [EX - 7.0, 2.6, .2], dx=-120, dy=-110)
anchor("em_A", "em_core", [EX + 6.5, 2.0, .6], dx=120, dy=-110)

# ═════════ F：材料倉 x=158、光阻工廠 x=176 ═════════
FX = 158
box("f_cab", "f_cab", "cab", [9.0, 7.6, .3], [FX, 3.8, -2.2])
box("f_side", "f_cab", "cab2", [.3, 7.6, 4.4], [FX, 3.8, 0], at=[[-4.5, 0, 0], [4.5, 0, 0]])
box("f_top", "f_cab", "cab2", [9.3, .3, 4.4], [FX, 7.6, 0])
box("f_sh", "f_cab", "steel", [8.7, .14, 4.2], [FX, 0, 0], at=[[0, .3, 0], [0, 2.9, 0], [0, 5.4, 0]])
box("f_door", "f_cab", "cab", [4.2, 7.4, .12], [FX - 6.3, 3.8, 1.2], rot=[0, -60, 0])
box("f_sign", "f_cab", "drumB", [2.2, .5, .04], [FX, 7.15, 2.2])
BTL = [[-3.3 + 1.32 * i, y, .8] for y in (.37, 2.97) for i in range(6)]
for k, (bx, by, bz) in enumerate(BTL):
    cyl(f"f_b{k}", "f_btl", "bottle", .5, 1.6, [FX + bx, by + .8, bz])
    cyl(f"f_bn{k}", "f_btl", "bottle", .2, .4, [FX + bx, by + 1.8, bz])
    cyl(f"f_bc{k}", "f_btl", "cap", .23, .25, [FX + bx, by + 2.1, bz])
    tube(f"f_bl{k}", "f_btl", "label", .52, .49, .55, [FX + bx, by + .8, bz])
cyl("f_drum", "f_btl", "drum", .9, 2.0, [FX + 0, 6.45, .5], at=[[-2.6, 0, 0], [0, 0, 0], [2.6, 0, 0]])
tube("f_drumB", "f_btl", "drumB", .92, .88, .25, [FX, 6.45, .5], at=[[-2.6, .6, 0], [0, .6, 0], [2.6, .6, 0], [-2.6, -.6, 0], [0, -.6, 0], [2.6, -.6, 0]])
# 光阻工廠（台灣新廠示意，規劃中）
TX = 176
box("t_bld", "t_fab", "bld", [12, 5.5, 7], [TX, 2.75, -1.5], bevel=.05)
box("t_band", "t_fab", "bld2", [12.05, .25, 7.05], [TX, 0, -1.5], at=[[0, 1.9, 0], [0, 3.8, 0]])
box("t_win", "t_fab", "win", [.9, .9, .05], [TX, 0, 2.03], at=[[-5 + 1.25 * i, y, 0] for i in range(9) for y in (1.0, 2.85, 4.7)])
box("t_roofU", "t_fab", "roof", [1.6, .8, 1.4], [TX, 5.9, 0], at=[[-4 + 2.6 * i, 0, -3] for i in range(4)])
cyl("t_stack", "t_fab", "steelHi", .3, 2.6, [TX, 6.8, -4.0], at=[[-4.5, 0, 0], [4.5, 0, 0]])
cyl("t_tank", "t_fab", "tank", 1.1, 3.8, [TX + 8.3, 1.9, 0], at=[[0, 0, -3.2], [0, 0, -.6], [0, 0, 2.0]])
sph("t_tankD", "t_fab", "tank", 1.1, [TX + 8.3, 3.8, 0], at=[[0, 0, -3.2], [0, 0, -.6], [0, 0, 2.0]], scale=[1, .4, 1])
box("t_rack", "t_fab", "steel2", [.18, 4.2, .18], [TX + 6.4, 2.1, 0], at=[[0, 0, z] for z in (-4, -1.5, 1, 3.5)])
cyl("t_rackP", "t_fab", "steelHi", .14, 8.0, [TX + 6.4, 4.0, -.25], axis="z", at=[[0, 0, 0], [0, .35, 0], [0, .7, 0]])
box("t_gate", "t_fab", "bld2", [3.0, 2.2, .1], [TX - 2.0, 1.1, 2.05])
glow("t_lit", "t_fab", ["t_win"], "lit", steady=False, g=.4, freq=.5)
anchor("f_btlA", "f_btl", [FX - 3.3, 3.8, .8], dx=-150, dy=-90)
anchor("f_drumA", "f_btl", [FX + 2.6, 7.3, .6], dx=150, dy=-60)
anchor("t_fabA", "t_fab", [TX - 3.0, 5.6, 1.0], dx=-150, dy=-90)
anchor("t_tankA", "t_fab", [TX + 8.3, 4.2, 2.0], dx=150, dy=-80)
# ═════════ J：日本光阻廠 x=198（s13 開頭念「以日本廠為主」；2026/11/24 審片必改 2：念到時不能是空地板）══════════
# 廠房＋鋸齒屋頂＋屋頂機組＋排氣塔＋正面捷時雅官方 LOGO 廠牌（Commons 原檔經 thumb.php 轉 PNG，不改色）＋日本國旗旗桿（念到升旗）＋門口光阻桶
ROOT = os.path.normpath(os.path.join(D, "..", ".."))
subprocess.run(["node", os.path.join(ROOT, "scripts/three/make-brand-tex.mjs"), "tech-resist1", "flag:JP", "flag:TW", "logo:jsr"], check=True, stdout=subprocess.DEVNULL)
SIGN = json.load(open(os.path.join(ROOT, "public/tex/brand/meta.json")))
def tex(name):
    materials["m_t_" + name] = {"kind": "unlit", "color": "#FFFFFF", "img": f"tex/brand/{name}.png"}; return "t_" + name
def plate(pid, lay, name, w, cx, cy, cz):
    h = w / SIGN[name]["aspect"]; box(pid, lay, tex(name), [w, h], [cx, cy, cz], shape="plane", uv01=True, shadow=False); return h
JX = 198
materials["m_drum"] = M("#C8701E", rough=.45, metal=.3); materials["m_drumL"] = M("#3A3F48", rough=.4, metal=.5)
box("j_bld", "j_fab", "bld", [9, 4.2, 6], [JX, 2.1, -1.5], bevel=.05)
box("j_band", "j_fab", "bld2", [9.05, .25, 6.05], [JX, 2.4, -1.5])
box("j_win", "j_fab", "win", [8.4, .45, .05], [JX, 3.3, 1.53])
box("j_saw", "j_fab", "roof", [2.3, .14, 6.1], [JX, 4.55, -1.5], rot=[0, 0, -24], at=[[-3.3 + 2.2 * i, 0, 0] for i in range(4)])
box("j_ahu", "j_fab", "bld2", [1.2, .6, 1.0], [JX, 5.0, -3.6], at=[[-3 + 2 * i, 0, 0] for i in range(4)], bevel=.03)
cyl("j_stack", "j_fab", "steelHi", .28, 2.4, [JX + 3.6, 5.6, -3.8], at=[[0, 0, 0], [-.8, 0, 0]])
box("j_door", "j_fab", "bld2", [2.0, 1.8, .06], [JX + 2.8, .9, 1.52])
box("j_sgB", "j_fab", "steel2", [2.5, 2.5, .06], [JX - 1.6, 1.55, 1.53])
plate("j_sg", "j_fab", "sign-jsr", 2.3, JX - 1.6, 1.55, 1.58)
cyl("j_fp", "j_fab", "steelHi", .06, 5.2, [JX - 5.6, 2.6, 2.2]); sph("j_fb", "j_fab", "steelHi", .1, [JX - 5.6, 5.22, 2.2])
_fh = 1.5 / SIGN["flag-JP"]["aspect"]
box("j_fgB", "j_flag", "steel2", [1.58, _fh + .08, .02], [JX - 5.6 + .81, 5.2 - _fh / 2 - .06, 2.18])
plate("j_fg", "j_flag", "flag-JP", 1.5, JX - 5.6 + .81, 5.2 - _fh / 2 - .06, 2.2)
cyl("j_drum", "j_drum", "drum", .45, 1.0, [JX + 1.4, .5, 3.2], at=[[0, 0, 0], [1.0, 0, 0], [2.0, 0, 0], [.5, 1.0, 0], [1.5, 1.0, 0]])
cyl("j_drumL", "j_drum", "drumL", .47, .06, [JX + 1.4, 1.0, 3.2], at=[[0, 0, 0], [1.0, 0, 0], [2.0, 0, 0], [.5, 1.0, 0], [1.5, 1.0, 0]])
anchor("j_fabA", "j_fab", [JX - 1.0, 4.8, -1.0], dx=-150, dy=-90)
anchor("j_drumA", "j_drum", [JX + 2.4, 1.6, 3.2], dx=150, dy=-80)

# 主素材框（看不見；給 layout-check 判斷「卡片／標籤有沒有蓋到主體中央」）：每段只亮鏡頭對準的那一個，其他層全部標 bg
materials["m_proxy"] = {"kind": "unlit", "color": "#FFFFFF", "opacity": 0}
PXB = {"px_a": (AX - 4.0, AX + 4.0, 3.0, 4.2, -4.0, 4.0), "px_a2": (AX - 4.0, AX + 6.0, 3.0, 7.4, -4.0, 4.0), "px_br": (BX - 6.0, BX + 6.0, 0, Y_RT, -2.0, 2.0),
       "px_b": (BX - 6.2, BX + 6.2, 0, 8.4, -2.2, 2.2), "px_bn": (BX - 6.2, NX + 6.2, 0, 8.4, -2.2, 2.2),
       "px_c": (CX - 6.8, CX + 6.8, 1.6, 7.2, -.4, .6), "px_d": (DX - 8.6, DX + 8.6, .2, 2.0, -2.2, 2.2),
       "px_e": (EX - 8.0, EX + 8.0, .4, 3.8, -2.0, 2.0), "px_f": (FX - 4.6, FX + 4.6, 0, 7.8, -2.2, 2.2), "px_t": (TX - 6.0, TX + 9.4, 0, 5.6, -4.5, 2.2), "px_j": (JX - 4.5, JX + 4.5, 0, 4.6, -4.5, 3.6)}
for lid, (x0, x1, y0, y1, z0, z1) in PXB.items():
    box(lid, lid, "proxy", [x1 - x0, y1 - y0, z1 - z0], [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2])
for l in layers:
    if not l["id"].startswith("px_"): l["bg"] = True
model = {
 "name": "tech-resist1：光阻-1。站別：A 晶圓台 x=0、B 正型剖面 x=30、N 負型剖面 x=46、C 化學放大分子 x=72、D ArF 對 EUV x=102、E 金屬氧化物 x=130、F 材料倉 x=158／工廠 x=176（genmodel.py 產生）",
 "unit": "示意，非實際比例", "size": {"w": 14, "h": 2, "r": .1, "t": 6},
 "palette": palette, "materials": materials, "layers": layers, "anchors": anchors, "parts": parts, "actions": actions,
 "pose": {"yaw0": 0, "yawIso": 0, "drift": 0},
 "camera": {"stand": {"d": 60, "elev": 22, "y": 4}},
 "fx": {"dpr": 1, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
}
json.dump(model, open(os.path.join(D, "model.json"), "w"), ensure_ascii=False, indent=1)
print("零件", len(parts), "層", len(layers), "動作", len(actions), "晶粒", ND)

# ═════════════════ 各幕 props（併進 script.json） ═════════════════
subprocess.run([sys.executable, os.path.join(D, "genscript.py")], check=True)
sp = os.path.join(D, "script.json"); script = json.load(open(sp))
HIDE = "s1:start-40"; FAR = "s15:start+400"; EARLY = "s1:start-300"
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

VIS = []
# 正型：s3 念「斷開」照到的欄長鏈斷開；s4 念「洗掉」照到的欄溶掉（顯影液 s4 dev 蓋上、keep 後退掉）
for c in EXP:
    VIS.append(hid(f"p_b{c}", "s3:break", FAR, 8))
    VIS.append(hid(f"p_c{c}", "s4:wash", FAR, 36))
    VIS.append(hid(f"n_b{c}", "s5:net-24", FAR, 8))
    VIS.append(hid(f"n_x{c}", HIDE, "s5:net", 14))
for c in range(NC):
    if c not in EXP: VIS.append(hid(f"n_c{c}", "s5:stay", FAR, 36))
VIS += [hid("p_dev", HIDE, "s4:dev", 16), hid("p_dev", "s4:keep+12", FAR, 20), hid("p_dn", HIDE, "s4:start", 6), hid("p_dn", "s4:keep+12", FAR, 10),
        hid("n_dev", HIDE, "s5:net+16", 16), hid("n_dev", "s5:stay+30", FAR, 20), hid("n_dn", HIDE, "s5:net+6", 6), hid("n_dn", "s5:stay+30", FAR, 10),
        hid("p_mask", "s4:start", "s15:start+500", 12), hid("p_opt", "s4:start", "s15:start+500", 12),
        hid("n_mask", "s5:stay-8", "s15:start+500", 12), hid("n_opt", "s5:stay-8", "s15:start+500", 12)]
# 化學放大：s7 念「放出一點酸」酸出現；s8 念「烘烤」第一個酸開始跳（球先收起來，由流動的酸接手），念「幾百次」第二個酸也開始
VIS += [hid("c_a0", HIDE, "s7:acid", 10), hid("c_a0", "s8:bake+10", FAR, 6), hid("c_a1", HIDE, "s8:hund-10", 10), hid("c_a1", "s8:hund+4", FAR, 6)]
hopIdx = list(range(1, 25, 2))
for k, i in enumerate(hopIdx):
    L, O, _ = PGL[(1, i)]
    t = f"s8:bake+{16 + 8 * k}"
    VIS += [mv(L, t, FAR, dur=12, dy=.9, opacity=0), hid(O, HIDE, t, 8)]
for k, i in enumerate(list(range(23, 0, -2))):
    L, O, _ = PGL[(0, i)]; t = f"s8:hund+{8 + 8 * k}"
    VIS += [mv(L, t, FAR, dur=12, dy=-.9, opacity=0), hid(O, HIDE, t, 8)]
for (ci, i), (L, O, _) in PGL.items():
    if ci == 2: VIS.append(hid(O, HIDE, FAR, 1))
# EUV：s10 念「隨機斷掉」光阻層換成印好的線（ArF 那塊線條完整），念「黏在一起」標出橋接
VIS += [hid("da_ln", HIDE, "s10:uneven", 14), hid("da_rs", "s10:uneven", FAR, 14), hid("de_ln", HIDE, "s10:uneven", 14), hid("de_rs", "s10:uneven", FAR, 14),
        hid("da_hit", HIDE, "s9:same", 8), hid("de_hit", HIDE, "s9:frac", 8), hid("da_hit", "s10:uneven", FAR, 8), hid("de_hit", "s10:uneven", FAR, 8),
        hid("de_bad", HIDE, "s10:brk", 8)]
VIS += [hid("j_flag", HIDE, "s13:jp", 6), mv("j_flag", HIDE, "s13:jp+8", dur=24, dy=-1.2), hid("t_fab", HIDE, "s13:yl-6", 14), hid("d_src", "s10:start-4", FAR, 10)]   # s10 推近後光源收起來，不壓頂端讀數
PXW = {"px_b": [(EARLY, "s2:start-4"), ("s3:start+30", "s3:hit")], "px_br": [("s3:hit", "s5:start-4")], "px_bn": [("s5:start+30", "s6:start-4")], "px_a": [("s2:start+30", "s3:start-4")],
       "px_a2": [("s14:start+30", FAR)], "px_c": [("s6:start+30", "s9:start-4")], "px_d": [("s9:start+30", "s11:start-4")], "px_e": [("s11:start+30", "s13:start-4")],
       "px_j": [("s13:start+30", "s13:tw-4")], "px_t": [("s13:tw+26", "s14:start-4")]}
for lid, wins in PXW.items():
    prev = "s1:start-400"
    for a_, b_ in wins:
        VIS.append({"layer": lid, "at": prev, "until": a_, "opacity": 0, "dur": 1}); prev = b_
    VIS.append({"layer": lid, "at": prev, "until": "s15:start+500", "opacity": 0, "dur": 1})
LIGHT = lambda P, a, b: [run(f"{P}_L{c}", a, b, 8) for c in range(NC)]
UP = 0.052                      # 主體中心要在畫面中心上方約 280px（卡片在 930 以下），鏡頭目標往下移 UP×d
def S(at, x, cy, d, elev, dur=24): return shot(at, x, R(cy - UP * d), d, elev, dur)
LX, RX, LY = 300, 780, 300           # 標籤只放頂端兩格（左／右），不進卡片範圍
P = {}
P["s1"] = {"zoom": [{"to": "film", "at": "start-30", "dur": 1}],
 "shot": [S("start-30", BX, 5.2, 52, 14, 1), S("light", BX, 5.4, 54, 16, 60)],
 "shift": VIS,
 "run": LIGHT("p", "start-30", "s2:start") + [run(f"p_chg{c}", "change", "s2:start", 8) for c in EXP] + [run(f"p_jit{c}", "change", "s2:start", 8) for c in EXP],
 "overlay": [sec("pr1-hook", "chip", "s2:start-2", "代工的供應商：光阻", "示意，非實際比例", {"chip": "chip", "glue": "glue", "light": "light", "change": "change"}, y=950, h=330)]}
P["s2"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 30}],
 "shot": [S("start-4", AX, 3.6, 40, 34, 30)],
 "run": [run("a_shine", "pr", "s3:start", 8)],
 "labels": [lab("a_resA", "光阻膜", "Photoresist film", "amber", "pr", "s3:start-4", xy=[RX, LY]), lab("a_waferA", "晶圓", "Wafer", "blue", "coat", "s3:start-4", xy=[LX, LY])],
 "overlay": [sec("pr1-what", "start+5", "s3:start-2", "光阻：感光高分子", "EPFL；Wevolver", {"pr": "pr", "poly": "poly", "coat": "coat"})]}
P["s3"] = {"zoom": [{"to": "film", "at": "start-4", "dur": 30}],
 "shot": [S("start-4", BX, 4.2, 54, 14, 30), S("hit", BX, 1.8, 42, 12, 40)],
 "run": LIGHT("p", "mask", "s4:start") + [run(f"p_chg{c}", "break", "s4:wash+20", 8) for c in EXP] + [run(f"p_jit{c}", "break", "s4:start", 8) for c in EXP],
 "labels": [lab("p_maskA", "光罩擋光", "Mask", "blue", "mask", "break-10", xy=[870, 340]), lab("p_resA", "長鏈斷開", "Break", "coral", "break", "s4:start-4", xy=[210, 340])],   # 11/25 審片必改 2：一次只亮一張、縮窄避開光罩載台與左上 HUD
 "overlay": [sec("pr1-expose", "start+5", "s4:start-2", "曝光：分子斷開", "Wevolver；EPFL", {"mask": "mask", "hit": "hit", "break": "break", "alter": "alter"})]}
P["s4"] = {"zoom": [{"to": "film", "at": "start-4", "dur": 1}],
 "shot": [S("start-4", BX, 1.8, 42, 18, 30)],
 "run": [run("p_dflow", "dev-10", "keep+10", 8)],
 "labels": [lab("p_devA", "顯影液", "Developer", "blue", "dev", "s5:start-4", xy=[RX, LY]), lab("p_resA", "沒照到的留下", "Unexposed stays", "amber", "keep", "s5:start-4", xy=[LX, LY])],
 "overlay": [sec("pr1-pos", "start+5", "s5:start-2", "正型：照到的被洗掉", "Wevolver；USPTO 11016386", {"pos": "pos", "dev": "dev", "wash": "wash", "keep": "keep"})]}
P["s5"] = {"zoom": [{"to": "film", "at": "start-4", "dur": 1}],
 "shot": [S("start-4", (BX + NX) / 2, 4.4, 87, 14, 30)],   # 11/25 審片必改 3：118→96（主素材放大約 1.2 倍，兩塊仍在畫面內）
 "run": LIGHT("n", "start", "net-10") + [run(f"n_netG{c}", "net", "s6:start", 8) for c in EXP] + [run(f"n_chg{c}", "start+6", "s6:start", 8) for c in EXP] + [run("n_dflow", "net+6", "stay+20", 8)],
 "labels": [lab("p_posA", "正型", "Positive", "blue", "neg", "s6:start-4", xy=[LX, LY]), lab("n_negA", "負型", "Negative", "amber", "neg", "s6:start-4", xy=[RX, LY])],
 "overlay": [sec("pr1-neg", "start+5", "s6:start-2", "正型 vs 負型", "Wevolver；EPFL", {"neg": "neg", "net": "net", "stay": "stay"})]}
P["s6"] = {"zoom": [{"to": "mol", "at": "start-4", "dur": 30}],
 "shot": [S("start-4", CX, 4.4, 55, 10, 30)],
 "labels": [lab("c_chainA", "高分子主鏈", "Polymer chain", "blue", "thin", "s7:start-4", xy=[LX, LY]), lab("c_pgA", "保護基", "Protecting group", "amber", "weak", "s7:start-4", xy=[RX, LY])],
 "overlay": [sec("pr1-why", "start+5", "s7:start-2", "線越細，光越不夠用", "IBM RJ10223", {"thin": "thin", "weak": "weak", "car": "car"})]}
P["s7"] = {"zoom": [{"to": "mol", "at": "start-4", "dur": 1}],
 "shot": [S("start-4", CX, 4.4, 52, 10, 30)],
 "run": [run("c_hv", "hv-6", "s8:start", 6), run("c_pagG", "pag", "s8:start", 8), run("c_a0G", "acid", "s8:bake+10", 6)],
 "labels": [lab("c_pagA", "光酸產生劑", "Photoacid generator", "blue", "pag", "s8:start-4", xy=[LX, LY]), lab("c_acidA", "酸 H⁺", "Acid", "coral", "acid", "s8:start-4", xy=[RX, LY])],
 "overlay": [sec("pr1-pag", "start+5", "s8:start-2", "光酸產生劑放酸", "IBM RJ10223", {"hv": "hv", "pag": "pag", "acid": "acid"})]}
P["s8"] = {"zoom": [{"to": "mol", "at": "start-4", "dur": 1}],
 "shot": [S("start-4", CX, 4.4, 55, 10, 30)],
 "run": [run("c_coilOn", "bake-4", "s9:start", 10)] + [run(f"c_wave{j}", "bake", "s9:start", 6) for j in range(3)] + [run("c_hop0", "bake+10", "s9:start", 4), run("c_hop1", "hund", "s9:start", 4), run("c_a1G", "hund-10", "hund+6", 6)],
 "labels": [lab("c_plateA", "烤盤加熱", "Post-exposure bake", "coral", "bake", "s9:start-4", xy=[RX, LY]), lab("c_ohA", "保護基被拆掉", "Group removed", "amber", "chain", "s9:start-4", xy=[LX, LY])],
 "overlay": [sec("pr1-peb", "start+5", "s9:start-2", "一個酸，反應幾百次", "IBM RJ10223", {"bake": "bake", "one": "one", "chain": "chain", "hund": "hund"})]}
P["s9"] = {"zoom": [{"to": "film", "at": "start-4", "dur": 30}],
 "shot": [S("start-4", DX, 1.1, 70, 12, 30), S("euv", DX, 2.9, 56, 12, 36)],          # 11/24 推近：念到 EUV 時推到主物件
 "run": [run("da_ph", "euv-10", "s10:uneven", 6), run("da_ph2", "euv-10", "s10:uneven", 6), run("de_ph", "euv", "s10:uneven", 6)],
 "labels": [lab("da_A", "ArF 深紫外光", "ArF 193 nm", "blue", "euv", "s10:start-4", xy=[LX, LY]), lab("de_A", "EUV 極紫外光", "EUV 13.5 nm", "amber", "euv", "s10:start-4", xy=[RX, LY])],
 "overlay": [sec("pr1-euv", "start+5", "s10:start-2", "同樣能量比光子", "arXiv 2405.11717", {"euv": "euv", "same": "same", "frac": "frac"})]}
P["s10"] = {"zoom": [{"to": "film", "at": "start-4", "dur": 1}],
 "shot": [S("start-4", DX, 1.2, 52, 36, 30), S("brk-14", DX + 2.6, 1.2, 42, 40, 30)],  # 11/24 推近：缺陷那塊
 "run": [run("de_badG", "brk", "s11:start", 8)],
 "labels": [lab("de_brkA", "斷線", "Line break", "coral", "brk", "s11:start-4", xy=[LX, LY]), lab("de_brgA", "黏在一起", "Bridge", "coral", "brg", "s11:start-4", xy=[RX, LY])],
 "overlay": [sec("pr1-stoch", "start+5", "s11:start-2", "光子少→隨機缺陷", "JM3 17(4)；SemiEngineering", {"few": "few", "uneven": "uneven", "brk": "brk", "brg": "brg"})]}
P["s11"] = {"zoom": [{"to": "mol", "at": "start-4", "dur": 30}],
 "shot": [S("start-4", EX, 2.1, 66, 12, 30), S("try", EX, 2.0, 48, 16, 36)],          # 11/24 推近
 "run": [run("ec_ph", "try", "s13:start", 6), run("em_ph", "try", "s13:start", 6), run("em_coreG", "abs", "s13:start", 8)],
 "labels": [lab("ec_A", "化學放大", "Chemically amplified", "blue", "try", "s13:start-4", xy=[LX, LY]), lab("em_A", "金屬氧化物", "Metal oxide", "amber", "abs", "s13:start-4", xy=[RX, LY])],
 "overlay": [sec("pr1-mor", "start+5", "s13:start-2", "金屬氧化物光阻", "SemiEngineering；JSR 2025/9", {"try": "try", "abs": "abs", "mor": "mor"})]}
P["s13"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 30}],
 "shot": [S("start-4", JX, 2.6, 52, 18, 30), S("tw-4", TX + 1.7, 2.8, 66, 18, 30)],
 "run": [run("t_lit", "yl", "s14:start", 8)],
 "labels": [dict(lab("j_fabA", "日本光阻廠", "Japan", "coral", "jp", "tw-6", xy=[LX - 40, LY]), flag="JP"), dict(lab("j_drumA", "捷時雅 JSR", "光阻桶", "blue", "jp+12", "tw-6", xy=[850, 480]), logo="jsr"), dict(lab("t_fabA", "雲林光阻廠", "Plant (schematic)", "amber", "yl", "s14:start-4", xy=[LX + 20, LY]), flag="TW"), lab("t_tankA", "原料儲槽", "Raw tanks", "blue", "y28", "s14:start-4", xy=[RX, LY])],
 "overlay": [sec("pr1-tw", "start+5", "s14:start-2", "台灣：在地生產光阻", "日經、Tom's Hardware（媒體報導）", {"tw": "tw", "jv": "jv", "yl": "yl", "y28": "y28"})]}
P["s14"] = {"zoom": [{"to": "wafer", "at": "start-4", "dur": 30}],
 "shot": [S("start-4", AX + .4, 4.2, 34, 28, 30)],
 "run": [run("a_drop", "start+10", "flat", 6), run("a_rot", "start+20", FAR, 14), run("a_spread", "start+30", FAR, 8)],
 "labels": [lab("a_nozA", "滴下光阻", "Resist dispense", "amber", "start+10", "kw-10", xy=[LX, LY]), lab("a_resA", "轉起來攤平", "Spin to spread", "blue", "flat", "kw-10", xy=[RX, LY])],
 "overlay": [sec("pr1-next", "start+5", "kw-10", "下一集：塗佈顯影機", "光阻-2", {"ok": "ok", "flat": "flat", "next": "next", "track": "track"})]}
for sc in script["scenes"]:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])
json.dump(script, open(sp, "w"), ensure_ascii=False, indent=1)
print("script props 併入", len(P), "幕")
