# tech-mask2 產生器：python3 videos/tech-mask2/genmodel.py → model.json，並先跑 genscript.py、再把各幕 3D 動作與 2D 卡併進 script.json
# 光罩-2：誰做光罩、怎麼運送。座標：x 右、y 上、z 朝觀眾；各站比例不同（示意，非實際比例）。五站以 x 偏移分開，鏡頭一次只看一站：
#   F x=0    廠區：晶圓廠＋自有光罩廠（天橋送光罩）｜專業光罩廠三棟（日本兩家、美國一家）＋台灣光罩；光罩盒沿道路送出        s2、s3、s4
#   E x=30   電子束寫入機（主角之一）：防震台、真空腔（前半剖開）、XY 平台、光罩基板（石英＋鉻＋光阻）、電子光學鏡筒（後半剖開：
#            電子槍、陽極、三組磁透鏡線圈、光闌、偏轉板）；單束（s5）／多束陣列（s6）；寫過的地方一條條出現            s5、s6
#   I x=55   光罩檢測機：花崗岩平台、XY 平台、光罩、光學頭＋檢測光束掃過；找到一顆瑕疵（紅）→ 旁邊晶圓每顆晶粒同一處都紅      s7
#   P x=80   極紫外光光罩傳送盒（主角）：外盒（底座＋上蓋＋機械手法蘭＋四個鎖扣）、內盒（金屬底板＋金屬上蓋＋密封面）、光罩    s1、s8、s10
#   V x=110  曝光機裝載腔：真空腔剖開＋真空泵（空氣分子被抽走）、外盒停在裝載埠外、內盒進腔後才打開；
#            光罩上到光罩台，極紫外光（紫色光束）打到光罩反射到下方晶圓的光阻上（下一集預告）                         s9、s11
# 流動物照 lessons 54：電子＝小藍點拖尾（2D 卡上帶「－」）、光＝直線光束＋光點、空氣分子＝雙球分子形、灰塵＝灰色小碎粒、光罩盒在路上＝小方塊。
# 所有動作的 at 都寫成「幕id:cue±幀」（cue 來自 timeline.json；配音重跑 align 後重跑本檔即可）。
import json, math, os, random, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(D, "..", ".."))
# 3D 貼圖：國旗（Brand.tsx 程式繪製）＋廠牌（public/logos 官方原檔，不改色；沒有原檔的用文字名牌）→ public/tex/brand/（不進 git）
TEX = ["flag:JP", "flag:US", "flag:TW", "flag:KR", "logo:tsmc", "logo:intel", "logo:samsung", "logo:tekscend", "logo:entegris", "logo:gudeng", "text:tmc=台灣光罩|2338"]
TEX += ["logo:dnp" if os.path.exists(os.path.join(ROOT, "public/logos/dnp.svg")) else "text:dnpT=大日本印刷|DNP",
        "logo:photronics" if os.path.exists(os.path.join(ROOT, "public/logos/photronics.svg")) else "text:phrT=Photronics|"]
subprocess.run(["node", os.path.join(ROOT, "scripts/three/make-brand-tex.mjs"), "tech-mask2", *TEX], check=True, stdout=subprocess.DEVNULL)
R = lambda x: round(x, 3)
rnd = random.Random(20261206)
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
 "copper": "#C9763A", "granite": "#3E4350", "ground": "#CBD5C0", "road": "#6B7280", "roadL": "#F4F1E6",
 "fab": "#E9EDF3", "fabR": "#8FA3BF", "capR": "#2F7FE0", "merR": "#E58A1F", "twR": "#14A38B", "win": "#7FA6D8", "glassB": "#BFD5EE",
 "quartz": "#D6E6F8", "chrome": "#3A3F48", "resist": "#E8A33C", "line": "#2F5FB0", "absorb": "#1F3F8F",
 "pod": "#FBFBF8", "podD": "#AEB4BC", "podR": "#B5BCC6", "latch": "#4A5873", "inner": "#7D8AA0", "innerD": "#55627A", "seal": "#14C38E",
 "ele": "#2F7FE0", "eleR": "#1C5DB0", "euv": "#8B5CF6", "euvR": "#6D3FD8", "insp": "#38C6D9", "def": "#E0472F", "dust": "#8A8F98", "dustR": "#5E636B",
 "airM": "#9CC3FF", "airR": "#5C95F0", "die": "#7FA4E0", "mirror": "#C8D5EA", "led": "#14C38E", "ledA": "#FF9F1C", "screen": "#2E6FD8", "truck": "#E9EDF3", "truckC": "#2F7FE0",
 "sea": "#9DC1E3", "rim": "#6F8DB0", "grid": "#C9DDF0", "gridD": "#6F8FB5", "land": "#E6EDD2", "pad": "#D3D8DE", "clean": "#F7F9FB", "seam": "#C3CCD8", "roof": "#B7C1CE", "tank": "#EEF1F4",
 "pinR": "#2F7FE0", "route": "#E58A1F"}
def M(color, **k): return {"kind": "std", "color": color, "rough": .45, "metal": .1, **k}
U = lambda c, o=None: {"kind": "unlit", "color": c, **({"opacity": o} if o is not None else {})}
materials = {
 "floor": M("floor", rough=.55, metal=0), "floorG": U("floorG"), "wall": M("wall", rough=.7, metal=0), "wall2": M("wall2", rough=.7, metal=0), "ffu": U("ffu"),
 "conc": M("conc", rough=.85, metal=0), "concD": M("concD", rough=.85, metal=0), "ground": M("ground", rough=.9, metal=0),
 "road": M("road", rough=.85, metal=0), "roadL": U("roadL"),
 "cab": M("cab", rough=.45, metal=.1), "cab2": M("cab2", rough=.5, metal=.1), "cabD": M("cabD", rough=.5, metal=.3),
 "cabPanel": {"kind": "phys", "color": "#F7F9FC", "rough": .3, "metal": 0, "clearcoat": .5, "env": .5},
 "steel": M("steel", rough=.28, metal=.88, env=.7, tex="brushed", texScale=2), "steel2": M("steel2", rough=.35, metal=.8, env=.6), "steelHi": M("steelHi", rough=.22, metal=.9, env=.9),
 "copper": M("copper", rough=.3, metal=.9, env=.7), "granite": M("granite", rough=.7, metal=.1),
 "fab": M("fab", rough=.6, metal=0), "fabR": M("fabR", rough=.6, metal=.2), "capR": M("capR", rough=.5, metal=.1), "merR": M("merR", rough=.5, metal=.1), "twR": M("twR", rough=.5, metal=.1),
 "win": M("win", rough=.15, metal=.4, env=.8), "glassB": {"kind": "phys", "color": "glassB", "rough": .08, "metal": 0, "clearcoat": 1, "opacity": .35, "env": .6},
 "quartz": {"kind": "phys", "color": "quartz", "rough": .06, "metal": 0, "clearcoat": 1, "env": .9},
 "chrome": M("chrome", rough=.2, metal=.9, env=.9), "resist": {"kind": "phys", "color": "resist", "rough": .3, "metal": 0, "clearcoat": .6, "env": .5},
 "line": M("line", rough=.3, metal=.3), "absorb": M("absorb", rough=.25, metal=.6, tex="traces", texScale=.5, env=.8),
 "pod": {"kind": "phys", "color": "pod", "rough": .35, "metal": 0, "clearcoat": .5, "env": .5}, "podD": M("podD", rough=.5, metal=0), "podR": M("podR", rough=.4, metal=.2),
 "latch": M("latch", rough=.4, metal=.5), "inner": M("inner", rough=.2, metal=.9, env=1.0, tex="brushed", texScale=1.2), "innerD": M("innerD", rough=.3, metal=.85, env=.8),
 "seal": {"kind": "std", "color": "seal", "emissive": "seal", "ei": .5}, "die": M("die", rough=.22, metal=.55, tex="traces", texScale=.35, env=.9),
 "mirror": {"kind": "phys", "color": "mirror", "rough": .04, "metal": .55, "clearcoat": 1, "env": 1.2},
 "cath": U("#FFE9A8"), "euvB": U("euv", .55), "inspB": U("insp", .5), "def": {"kind": "std", "color": "def", "emissive": "def", "ei": .6},
 "led": {"kind": "std", "color": "led", "emissive": "led", "ei": .9}, "ledA": {"kind": "std", "color": "ledA", "emissive": "ledA", "ei": .6},
 "screen": {"kind": "screen", "color": "screen", "ei": .7}, "screenUI": U("#BFD8FF"),
 "truck": M("truck", rough=.4, metal=.2), "truckC": M("truckC", rough=.4, metal=.2), "tire": M("#2F3136", rough=.8, metal=0),
 "air": U("#FFFFFF", .0), "eleB": U("ele", .55), "defR": U("def", .9),
 "sea": M("sea", rough=.6, metal=0), "rim": M("rim", rough=.5, metal=.2), "grid": U("grid"), "gridD": U("gridD"), "land": M("land", rough=.8, metal=0),
 "pad": M("pad", rough=.85, metal=0), "clean": {"kind": "phys", "color": "clean", "rough": .35, "metal": 0, "clearcoat": .4, "env": .4}, "seam": U("seam"), "roof": M("roof", rough=.6, metal=.3),
 "tank": M("tank", rough=.3, metal=.4, env=.6), "pinR": U("pinR", .85), "pinB": U("#7FB7FF", .35), "route": U("route"),
}
materials = {"m_" + k: v for k, v in materials.items()}
def flowx(key, lay, path, shape="dot", n=4, lanes=1, gap=.2, ldir=(1, 0, 0), size=.1, rate=1.0, color="ele", rim="eleR", trail=0, band=None, bandO=.5, rimO=.6):
    layer(lay)
    d = {"type": "flow", "layer": lay, "path": [[R(v) for v in p] for p in path], "n": n, "lanes": lanes, "laneGap": gap, "laneDir": list(ldir), "size": size, "shape": shape,
         "rate": rate, "color": color, "rim": rim, "rimScale": 1.5, "rimO": rimO, "trail": trail, "trailGap": .03, "trailColor": color, "track": False}
    if band: d["band"] = band; d["bandO"] = bandO
    actions[key] = d
def glow(key, lay, ps, color="ele", steady=True, g=.9, freq=2.2, halo=0):
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

# ═════════ 室內背景（E、I、P、V 共用；F 是室外廠區，另有地面） ═════════
box("r_floor", "t_room", "floor", [110, .3, 40], [80, -.15, -2])
box("r_grate", "t_room", "floorG", [.1, .03, 40], [80, .02, -2], at=[[-54 + 2.0 * i, 0, 0] for i in range(55)])
box("r_grate2", "t_room", "floorG", [110, .03, .1], [80, .02, -2], at=[[0, 0, -19 + 2.0 * j] for j in range(20)])
box("r_wall", "t_room", "wall", [110, 26, .4], [80, 13, -16])
box("r_wallS", "t_room", "wall2", [.12, 25.6, .45], [80, 13, -15.9], at=[[-54 + 6 * i, 0, 0] for i in range(19)])
box("r_ffu", "t_room", "ffu", [5.6, .4, 5.6], [80, 26.2, -10], at=[[-54 + 6 * i, 0, k * 6] for i in range(19) for k in (0, 1)])
box("r_tray", "t_room", "steel2", [110, .25, .6], [80, 14.5, -14.6])
cyl("r_pipeW", "t_room", "steelHi", .18, 110, [80, 15.0, -14.6], axis="x", at=[[0, 0, 0], [0, .55, 0], [0, 1.1, 0]])

# ═════════ F：地圖桌 x=-40（2026/11/24 v3 重做：Andy「動畫太簡陋，有國家就標上國旗，有公司就附上 LOGO」） ═════════
# 一張地圖桌（海＝淺藍桌面、經緯線），陸地是 Natural Earth 1:50m 的國界輪廓擠出（map.json，公有領域）：韓國、日本、台灣（亞洲一個比例）、美國本土（另一個比例，中間虛線＝比例不同）。
# 每個據點是一座有識別度的迷你廠區：潔淨室廠房（白色外牆板＋接縫、橫向窗帶、屋頂空調箱＋風扇、排氣管）、氮氣儲槽、卸貨門、
# 白色廠牌掛官方 LOGO（public/logos 原檔轉貼圖，不改色；台灣光罩找不到原檔→文字名牌）、旗桿掛國旗（Brand.tsx 程式繪製，官方比例）、
# 地上的定位光圈＋光柱（念到才亮）。自有光罩廠＝晶圓廠旁邊的小廠，用玻璃天橋接過去（光罩盒在天橋裡來回）；
# 專業光罩廠出貨＝光罩盒上潔淨物流車→沿弧線航線（虛點＋移動的光罩盒）送到客戶晶圓廠（灰色、無 LOGO，示意）。
FX = -40
MAPJ = json.load(open(os.path.join(D, "map.json")))["rings"]
def PA(lon, lat): return (FX - 11 + (lon - 132.5) * .9, -(lat - 33.5) * 1.08)      # 亞洲（韓、日、台）
def PU(lon, lat): return (FX + 12.5 + (lon + 96) * .32, -(lat - 37) * .4)            # 美國本土
TWC = PA(120.95, 23.7)
def PT(lon, lat):                                                                   # 台灣：在亞洲比例上再放大 1.8 倍（示意，廠區才放得下）
    x, z = PA(lon, lat); return (TWC[0] + (x - TWC[0]) * 1.8, TWC[1] + (z - TWC[1]) * 1.8)
PROJ = {"US": PU, "TW": PT, "JP": PA, "KR": PA}
LAND_T = .22; LAND_Y = .15 + LAND_T / 2; TOP = .15 + LAND_T                        # 海面 y≈.15，陸地頂面 y＝TOP
def inside(x, z, ring):
    c = False
    for i in range(len(ring)):
        x1, z1 = ring[i]; x2, z2 = ring[i - 1]
        if (z1 > z) != (z2 > z) and x < (x2 - x1) * (z - z1) / (z2 - z1) + x1: c = not c
    return c
LANDP = []
box("m_sea", "m_base", "sea", [50, .3, 30], [FX, 0, 0], bevel=.08)
box("m_rim", "m_base", "rim", [50.6, .5, 30.6], [FX, -.12, 0], bevel=.1)
box("m_latA", "m_base", "grid", [25, .012, .04], [FX - 11, .156, 0], at=[[0, 0, -(la - 33.5) * 1.08] for la in range(25, 46, 5)])
box("m_lonA", "m_base", "grid", [.04, .012, 28], [FX - 11, .156, 0], at=[[(lo - 132.5) * .9, 0, 0] for lo in range(120, 146, 5)])
box("m_latU", "m_base", "grid", [19, .012, .04], [FX + 12.5, .156, 0], at=[[0, 0, -(la - 37) * .4] for la in range(25, 50, 5)])
box("m_lonU", "m_base", "grid", [.04, .012, 10], [FX + 12.5, .156, 0], at=[[(lo + 96) * .32, 0, 0] for lo in range(-120, -69, 10)])
box("m_brk", "m_base", "gridD", [.08, .02, .5], [FX + 1.9, .16, 0], at=[[0, 0, -13 + .9 * i] for i in range(30)])   # 比例不同的分界（虛線）
for cc, rings in MAPJ.items():
    proj = PROJ[cc]
    for k, ring in enumerate(rings):
        P = [proj(lo, la) for lo, la in ring]
        xs = [p[0] for p in P]; zs = [p[1] for p in P]; cx, cz = (min(xs) + max(xs)) / 2, (min(zs) + max(zs)) / 2
        LANDP.append([(x, z) for x, z in P])
        box(f"m_{cc}{k}", "m_land", "land", [max(xs) - min(xs), max(zs) - min(zs), LAND_T], [cx, LAND_Y, cz], shape="poly", rot=[-90, 0, 0], pts=[[R(x - cx), R(-(z - cz))] for x, z in P])
def onland(x, z): return any(inside(x, z, r) for r in LANDP)
# ── 廠區零件 ──
SIGN = json.load(open(os.path.join(ROOT, "public/tex/brand/meta.json")))
def tex(name):
    materials["m_t_" + name] = {"kind": "unlit", "color": "#FFFFFF", "img": f"tex/brand/{name}.png"}; return "t_" + name
def plate(pid, lay, name, w, cx, cy, cz):
    a = SIGN[name]["aspect"]; h = w / a
    box(pid, lay, tex(name), [w, h], [cx, cy, cz], shape="plane", uv01=True, shadow=False); return h
def plant(pid, lay, x, z, w, d, h, roof, sign=None, flag=None, gen=False):
    """一座潔淨室廠房（w 寬、d 深、h 高，左下前角在 x-w/2, z+d/2）；sign＝廠牌貼圖、flag＝國旗貼圖"""
    y0 = TOP
    box(f"{pid}Pad", lay, "pad", [w + .5, .04, d + .55], [x, y0 + .02, z + .1])
    box(f"{pid}B", lay, "clean" if not gen else "fab", [w, h, d], [x, y0 + h / 2, z], bevel=.02)
    nseam = max(2, int(w / .14))
    box(f"{pid}Sm", lay, "seam", [.012, h * .92, .01], [x - w / 2, y0 + h / 2, z + d / 2 + .006], at=[[w * (i + 1) / (nseam + 1), 0, 0] for i in range(nseam)])
    box(f"{pid}Wn", lay, "win", [w * .9, h * .12, .012], [x, y0 + h * .72, z + d / 2 + .008])
    box(f"{pid}Bd", lay, roof, [w + .02, h * .07, d + .02], [x, y0 + h * .93, z])
    box(f"{pid}R", lay, "roof", [w + .04, .03, d + .04], [x, y0 + h + .015, z])
    na = max(2, int(w / .3))
    box(f"{pid}Ah", lay, "steel2", [.16, .08, .12], [x - w / 2 + .14, y0 + h + .07, z - d * .15], at=[[(w - .28) * i / (na - 1), 0, 0] for i in range(na)], bevel=.01)
    cyl(f"{pid}Fn", lay, "cabD", .035, .02, [x - w / 2 + .14, y0 + h + .12, z - d * .15], at=[[(w - .28) * i / (na - 1) + s * .04, 0, 0] for i in range(na) for s in (-1, 1)])
    cyl(f"{pid}St", lay, "steelHi", .022, .22, [x + w / 2 - .1, y0 + h + .11, z + d * .25], at=[[0, 0, 0], [-.09, 0, 0]])
    box(f"{pid}Dk", lay, "cabD", [.16, .12, .012], [x + w * .3, y0 + .06, z + d / 2 + .008])
    if not gen:
        cyl(f"{pid}N2", lay, "tank", .055, .3, [x + w / 2 + .14, y0 + .15, z - d * .2])
        cyl(f"{pid}N2b", lay, "tank", .055, .3, [x + w / 2 + .14, y0 + .15, z + d * .05])
    if sign:
        sw = min(.62, w * .9); sh = SIGN[sign]["aspect"] and sw / SIGN[sign]["aspect"]
        cyl(f"{pid}Sp", lay, "steel2", .012, .16, [x - w / 2 + .05, y0 + .08, z + d / 2 + .3], at=[[0, 0, 0], [sw - .1, 0, 0]])
        plate(f"{pid}Sg", lay, sign, sw, x - w / 2 + sw / 2, y0 + .16 + sh / 2, z + d / 2 + .3)
    if flag:
        ph_ = .62
        cyl(f"{pid}Fp", lay, "steelHi", .01, ph_, [x + w / 2 + .1, y0 + ph_ / 2, z + d / 2 + .25])
        sph(f"{pid}Fb", lay, "steelHi", .018, [x + w / 2 + .1, y0 + ph_ + .01, z + d / 2 + .25])
        fw = .26; plate(f"{pid}Fg", lay, flag, fw, x + w / 2 + .1 + fw / 2 + .01, y0 + ph_ - fw / SIGN[flag]["aspect"] / 2 - .02, z + d / 2 + .25)
def pin(pid, lay, x, z, r=.75):
    tube(f"{pid}Ring", lay, "pinR", r, r - .04, .02, [x, TOP + .05, z])
    cyl(f"{pid}Beam", lay, "pinB", .02, 1.3, [x, TOP + .9, z - r * .6])
    sph(f"{pid}Head", lay, "pinR", .05, [x, TOP + 1.56, z - r * .6])
SITES = {}
def site(key, cc, lon, lat, kind, roof, sign, flag):
    x, z = PROJ[cc](lon, lat)
    if not onland(x, z): print("⚠ 據點不在陸地上", key, round(x, 2), round(z, 2))
    lay = f"f_{key}"; SITES[key] = (x, z)
    if kind == "captive":
        plant(f"{lay}F", lay, x - .45, z, 1.1, .7, .5, "fabR", gen=True)                  # 晶圓廠（大）
        plant(f"{lay}M", lay, x + .62, z + .05, .55, .45, .32, roof, sign=sign, flag=flag)  # 自有光罩廠（小）
        box(f"{lay}Br", lay, "glassB", [.32, .1, .14], [x + .2, TOP + .26, z + .02])        # 玻璃天橋
        box(f"{lay}BrF", lay, "steel2", [.34, .02, .16], [x + .2, TOP + .2, z + .02])
    elif kind == "merchant":
        plant(f"{lay}M", lay, x, z, .8, .55, .36, roof, sign=sign, flag=flag)
    else:
        plant(f"{lay}C", lay, x, z, .7, .45, .34, "fabR", gen=True)                         # 客戶晶圓廠（灰、無 LOGO）
    pin(f"{lay}P", f"{lay}_pin", x, z, 1.15 if kind == "captive" else .62)
    glow(f"{lay}On", f"{lay}_pin", [f"{lay}PRing", f"{lay}PBeam", f"{lay}PHead"], roof if kind != "cust" else "fabR", steady=False, g=1.0, freq=1.6, halo=.6)
    return x, z
# 自有光罩廠（s2）：台積電（新竹）、英特爾（奧勒岡）、三星（華城）
site("tsmc", "TW", 121.2, 24.8, "captive", "capR", "sign-tsmc", "flag-TW")
site("intel", "US", -122.9, 45.4, "captive", "capR", "sign-intel", "flag-US")
site("ss", "KR", 127.05, 37.2, "captive", "capR", "sign-samsung", "flag-KR")
# 專業光罩廠（s3）：大日本印刷、Tekscend（都在東京周邊的埼玉）、Photronics（康乃狄克）；台灣光罩（s4，新竹）
site("dnp", "JP", 139.0, 36.1, "merchant", "merR", "sign-dnp" if "sign-dnp" in SIGN else "sign-dnpT", "flag-JP")
site("tek", "JP", 140.15, 35.75, "merchant", "merR", "sign-tekscend", "flag-JP")
site("phr", "US", -73.4, 41.6, "merchant", "merR", "sign-photronics" if "sign-photronics" in SIGN else "sign-phrT", "flag-US")
site("tmc", "TW", 120.75, 24.05, "merchant", "twR", "sign-tmc", "flag-TW")
# 客戶晶圓廠（示意，無 LOGO）：台灣南部、韓國東南、美國德州
site("cTW", "TW", 120.45, 23.0, "cust", "fabR", None, None)
site("cKR", "KR", 128.7, 35.95, "cust", "fabR", None, None)
site("cUS", "US", -97.7, 31.0, "cust", "fabR", None, None)
# 天橋裡的光罩盒（自有光罩廠 → 晶圓廠，s2 念「改版最快」來回跑）
for k in ("tsmc", "intel", "ss"):
    x, z = SITES[k]
    flowx(f"f_{k}Br", f"f_{k}", [[x + .38, TOP + .26, z + .02], [x + .02, TOP + .26, z + .02]], shape="grit", n=2, size=.07, rate=.9, color="pod", rim="podR")
    air(f"f_{k}BrA", f"f_{k}", [x - .02, TOP + .2, z - .06], [x + .42, TOP + .32, z + .1])
# 航線：專業光罩廠 → 客戶（弧線虛點＋移動的光罩盒，方向＝光罩盒前進方向）
def route(key, lay, a, b, hgt, n_dash=26):
    (x0, z0), (x1, z1) = a, b
    pts = []
    for i in range(n_dash + 1):
        t = i / n_dash; pts.append([x0 + (x1 - x0) * t, TOP + .25 + 4 * hgt * t * (1 - t), z0 + (z1 - z0) * t])
    sph(f"{key}D", lay, "route", .035, [0, 0, 0], at=[[R(p[0]), R(p[1]), R(p[2])] for p in pts[1:-1]])
    flowx(f"{key}F", lay, [pts[i] for i in range(0, n_dash + 1, 2)], shape="grit", n=3, size=.13, rate=.32, color="pod", rim="podR")
    ex, ez = pts[-1][0] - pts[-3][0], pts[-1][2] - pts[-3][2]; ang = math.degrees(math.atan2(-ez, ex))
    for sgn in (-1, 1):
        a2 = math.radians(ang + 180 + sgn * 32); L2 = .34
        box(f"{key}H{sgn + 1}", lay, "route", [L2, .04, .07], [R(pts[-1][0] + math.cos(a2) * L2 / 2), R(pts[-1][1]), R(pts[-1][2] - math.sin(a2) * L2 / 2)], rot=[0, R(ang + 180 + sgn * 32), 0])
    lo = [min(p[i] for p in pts) - .2 for i in range(3)]; hi = [max(p[i] for p in pts) + .2 for i in range(3)]
    air(f"{key}A", lay, lo, hi)
route("f_rDNP", "f_rDNP", (SITES["dnp"][0] - .3, SITES["dnp"][1] + .5), (SITES["cTW"][0] + .3, SITES["cTW"][1] - .3), 2.2)
route("f_rTEK", "f_rTEK", (SITES["tek"][0] - .2, SITES["tek"][1] + .4), (SITES["cKR"][0] + .35, SITES["cKR"][1]), 1.6)
route("f_rPHR", "f_rPHR", (SITES["phr"][0] - .3, SITES["phr"][1] + .3), (SITES["cUS"][0] + .3, SITES["cUS"][1] - .2), 1.4)
route("f_rTMC", "f_rTMC", (SITES["tmc"][0] + .1, SITES["tmc"][1] + .45), (SITES["cTW"][0] + .05, SITES["cTW"][1] - .35), .6, 12)
# 潔淨物流車（s4：台灣光罩出貨；光罩盒先推上車、車再開往南部客戶）
TMX, TMZ = SITES["tmc"]; VX0, VZ0 = TMX + .55, TMZ + .55
box("f_vanB", "f_van", "truck", [.36, .2, .18], [VX0, TOP + .14, VZ0], bevel=.02)
box("f_vanC", "f_van", "truckC", [.13, .16, .17], [VX0 + .24, TOP + .12, VZ0], bevel=.02)
box("f_vanW", "f_van", "win", [.012, .07, .14], [VX0 + .305, TOP + .15, VZ0])
box("f_vanS", "f_van", "truckC", [.36, .03, .185], [VX0, TOP + .19, VZ0])
cyl("f_vanT", "f_van", "tire", .035, .03, [VX0, TOP + .04, VZ0], axis="z", at=[[x_, 0, s * .09] for x_ in (-.11, .1, .24) for s in (-1, 1)])
box("f_vanP", "f_vanP", "pod", [.09, .07, .09], [TMX + .3, TOP + .09, TMZ + .36], bevel=.01)          # 光罩盒（先放在卸貨門口）
ST, SI, SS, SD, SK, SP, SM, SC = (SITES[k] for k in ("tsmc", "intel", "ss", "dnp", "tek", "phr", "tmc", "cTW"))
anchor("m_twA", "m_land", [TWC[0] - .2, TOP, TWC[1] - 1.6], dx=-150, dy=-80)
anchor("f_tsmcA", "f_tsmc", [SITES["tsmc"][0] + .6, TOP + .4, SITES["tsmc"][1]], dx=-150, dy=-80)
anchor("f_intelA", "f_intel", [SITES["intel"][0] + .6, TOP + .4, SITES["intel"][1]], dx=150, dy=-80)
anchor("f_ssA", "f_ss", [SITES["ss"][0] + .6, TOP + .4, SITES["ss"][1]], dx=-150, dy=-80)
anchor("f_dnpA", "f_dnp", [SITES["dnp"][0], TOP + .4, SITES["dnp"][1]], dx=-150, dy=-80)
anchor("f_tekA", "f_tek", [SITES["tek"][0], TOP + .4, SITES["tek"][1]], dx=150, dy=-80)
anchor("f_phrA", "f_phr", [SITES["phr"][0], TOP + .4, SITES["phr"][1]], dx=150, dy=-80)
anchor("f_tmcA", "f_tmc", [SITES["tmc"][0], TOP + .4, SITES["tmc"][1]], dx=150, dy=60)
anchor("f_cTWA", "f_cTW", [SITES["cTW"][0], TOP + .3, SITES["cTW"][1]], dx=150, dy=60)
anchor("f_vanA", "f_van", [VX0, TOP + .2, VZ0], dx=150, dy=60)

# ═════════ E：電子束寫入機 x=30 ═════════
EX = 30
box("e_base", "e_body", "cab", [7.0, 1.0, 5.6], [EX, .5, 0], bevel=.06)
box("e_baseP", "e_body", "cabPanel", [2.0, .6, .06], [EX, .5, 2.83], at=[[-2.3, 0, 0], [0, 0, 0], [2.3, 0, 0]], bevel=.02)
cyl("e_iso", "e_body", "steel2", .45, .5, [EX, 1.25, 0], at=[[sx * 2.6, 0, sz * 2.0] for sx in (-1, 1) for sz in (-1, 1)])
box("e_gran", "e_body", "granite", [6.4, .5, 5.0], [EX, 1.75, 0])
# 真空腔：後牆、左右牆、頂板（前半剖開，看得到裡面）
CY0, CY1 = 2.0, 4.6
box("e_chB", "e_body", "steel", [6.0, CY1 - CY0, .25], [EX, (CY0 + CY1) / 2, -2.2])
box("e_chS", "e_body", "steel", [.25, CY1 - CY0, 4.4], [EX, (CY0 + CY1) / 2, 0], at=[[-2.9, 0, 0], [2.9, 0, 0]])
box("e_chT", "e_body", "steel2", [6.0, .3, 2.6], [EX, CY1 + .15, -.9])
box("e_chTF", "e_body", "steel2", [6.0, .3, .5], [EX, CY1 + .15, 1.95])
box("e_chRib", "e_body", "steel2", [.12, CY1 - CY0, .12], [EX, (CY0 + CY1) / 2, -2.05], at=[[-2.0 + 1.0 * i, 0, 0] for i in range(5)])
box("e_port", "e_body", "steelHi", [.15, .9, .9], [EX - 3.1, 3.3, 0])
cyl("e_portW", "e_body", "glassB", .3, .06, [EX - 3.18, 3.3, 0], axis="x")
# XY 平台
box("e_railX", "e_body", "steelHi", [4.8, .12, .16], [EX, 2.1, 0], at=[[0, 0, -1.0], [0, 0, 1.0]])
box("e_carY", "e_stage", "steel2", [2.6, .2, 2.6], [EX, 2.28, 0], bevel=.03)
box("e_railY", "e_stage", "steelHi", [.16, .1, 2.4], [EX, 2.43, 0], at=[[-.9, 0, 0], [.9, 0, 0]])
box("e_top", "e_stage", "steel", [2.3, .16, 2.3], [EX, 2.56, 0], bevel=.03)
box("e_qz", "e_stage", "quartz", [1.9, .28, 1.9], [EX, 2.78, 0], bevel=.02)
box("e_cr", "e_stage", "chrome", [1.9, .03, 1.9], [EX, 2.935, 0])
box("e_rs", "e_stage", "resist", [1.9, .03, 1.9], [EX, 2.965, 0])
# 寫過的地方（一條條出現）：單束 12 條、多束一次 6 塊
for k in range(12):
    box(f"e_ln{k}", f"e_ln{k}", "line", [1.5, .012, .06], [EX, 2.985, -.72 + .13 * k])
for k in range(6):
    box(f"e_blk{k}", f"e_blk{k}", "line", [.42, .012, 1.5], [EX - .8 + .32 * k, 2.987, 0], at=[[0, 0, 0]])
# 電子光學鏡筒（後半剖開）
COL0, COL1 = 4.8, 10.6
staves("e_col", "e_col", "steelHi", EX, .95, COL0, COL1, n=10, t=.14)
tube("e_colR", "e_col", "steel2", 1.05, .95, .18, [EX, 0, 0], at=[[0, COL0 + .1, 0], [0, 7.2, 0], [0, 9.0, 0], [0, COL1 - .1, 0]])
# 電子槍：陰極尖（發亮）＋韋乃特帽＋陽極板
cyl("e_gunB", "e_col", "cabD", .5, .6, [EX, 10.25, 0])
box("e_cath", "e_col", "cath", [.08, .25, .08], [EX, 9.9, 0])
tube("e_weh", "e_col", "steel2", .35, .12, .14, [EX, 9.72, 0])
tube("e_anode", "e_col", "steel", .7, .08, .1, [EX, 9.35, 0])
# 三組磁透鏡：銅線圈＋鐵殼
for j, yy in enumerate([8.4, 7.0, 5.6]):
    tube(f"e_coil{j}", "e_col", "copper", .72, .24, .42, [EX, yy, 0])
    tube(f"e_yoke{j}", "e_col", "steel2", .82, .72, .5, [EX, yy, 0])
    box(f"e_coilT{j}", "e_col", "copper", [.6, .04, .06], [EX, yy, 0], at=[[0, -.15 + .1 * i, -.6] for i in range(4)])
tube("e_apt", "e_col", "steel", .6, .05, .05, [EX, 7.75, 0])
box("e_defl", "e_col", "steelHi", [.06, .45, .3], [EX, 6.3, 0], at=[[-.28, 0, 0], [.28, 0, 0]])
box("e_defl2", "e_col", "steelHi", [.3, .45, .06], [EX, 6.3, -.28])
cyl("e_obj", "e_col", "steel2", .45, .35, [EX, 5.0, 0])
# 高壓電纜、離子泵、控制櫃、渦輪泵
pipe("e_hv", "e_col", "cabD", [[EX, 10.55, 0], [EX, 11.4, 0], [EX + 3.8, 11.4, -1.2], [EX + 3.8, 5.2, -1.2]], .1)
box("e_ip", "e_col", "steel", [.6, .8, .6], [EX - 1.35, 8.0, -.3], at=[[0, 0, 0], [0, -2.0, 0]], bevel=.04)
box("e_cab", "e_ctl", "cab", [2.0, 5.0, 2.0], [EX + 4.6, 2.5, -.8], bevel=.06)
box("e_scr", "e_ctl", "screen", [1.5, 1.0, .04], [EX + 4.6, 3.6, .22])
box("e_scrL", "e_ctl", "screenUI", [1.1, .05, .02], [EX + 4.6, 3.3, .25], at=[[0, .15 * i, 0] for i in range(5)])
box("e_led", "e_ctl", "led", [.14, .14, .04], [EX + 4.1, 4.6, .22], at=[[.3 * i, 0, 0] for i in range(4)])
glow("e_ledG", "e_ctl", ["e_led"], "led", steady=False, g=.8, freq=1.0)
cyl("e_tmp", "e_ctl", "steelHi", .5, 1.2, [EX - 3.9, 1.6, -.8])
cyl("e_tmpF", "e_ctl", "steel2", .62, .12, [EX - 3.9, 2.25, -.8])
pipe("e_vac", "e_ctl", "steel2", [[EX - 3.9, 2.3, -.8], [EX - 3.9, 3.0, -.8], [EX - 3.05, 3.0, -.8]], .18)
# 單束：電子從陰極往下，穿過三組透鏡收成一點，打到光阻上
flowx("e_beam", "e_col", [[EX, 9.75, 0], [EX, 7.0, 0], [EX, 3.0, 0]], shape="dot", n=9, size=.07, rate=1.4, color="ele", rim="eleR", trail=3)
sph("e_spot", "e_col", "cath", .07, [EX, 2.99, 0])
cyl("e_beamL", "e_beamL", "eleB", .025, 6.9, [EX, 6.45, 0])
glow("e_beamOn", "e_beamL", ["e_beamL"], "ele", steady=False, g=1.0, freq=5.0, halo=.5)
glow("e_spotOn", "e_col", ["e_spot"], "ele", steady=False, g=1.0, freq=6.0, halo=.8)
glow("e_cathOn", "e_col", ["e_cath"], "#FFE9A8", steady=False, g=1.0, freq=3.0, halo=.6)
glow("e_coilOn", "e_col", ["e_coil0", "e_coil1", "e_coil2"], "copper", steady=True, g=.45)
air("e_airB", "e_col", [EX - .4, 2.9, -.4], [EX + .4, 9.9, .4])
# 多束：光闌陣列板（8×8 孔）＋電子束陣列（s6 才出現）
box("e_aap", "e_mb", "steel", [1.3, .06, 1.3], [EX, 8.0, 0])
box("e_aapH", "e_mb", "cabD", [.06, .065, .06], [EX, 8.0, 0], at=[[-.56 + .16 * i, 0, -.56 + .16 * j] for i in range(8) for j in range(8)])
for j in range(8):
    z = -.56 + .16 * j
    flowx(f"e_mbF{j}", "e_mb", [[EX - .56, 7.95, z], [EX - .56 * .7, 3.0, z * .7]], shape="dot", n=3, lanes=8, gap=.16, ldir=(1, 0, 0), size=.035, rate=1.6, color="ele", rim="eleR", trail=2)
air("e_airM", "e_mb", [EX - .7, 2.9, -.7], [EX + .7, 8.1, .7])
vib("e_scan", "e_stage", lp("e_stage") + [f"e_ln{k}" for k in range(12)] + [f"e_blk{k}" for k in range(6)], "x", .08, .8)
anchor("e_colA", "e_col", [EX - .95, 7.0, 0], dx=-170, dy=-80)
anchor("e_cathA", "e_col", [EX + .1, 9.9, 0], dx=170, dy=-80)
anchor("e_qzA", "e_stage", [EX - .95, 2.78, .9], dx=-170, dy=60)
anchor("e_rsA", "e_stage", [EX + .9, 2.97, .7], dx=170, dy=60)
anchor("e_mbA", "e_mb", [EX + .6, 8.0, .3], dx=170, dy=-70)

# ═════════ I：光罩檢測機 x=55 ═════════
IX = 55
box("i_base", "i_body", "cab", [6.4, 1.2, 4.6], [IX, .6, 0], bevel=.06)
box("i_baseP", "i_body", "cabPanel", [1.8, .7, .06], [IX, .6, 2.33], at=[[-2.0, 0, 0], [0, 0, 0], [2.0, 0, 0]], bevel=.02)
box("i_gran", "i_body", "granite", [5.8, .6, 4.0], [IX, 1.5, 0])
box("i_bridge", "i_body", "steel", [.6, 3.6, .7], [IX, 3.6, -1.6], at=[[-2.5, 0, 0], [2.5, 0, 0]])
box("i_beam", "i_body", "steel", [5.6, .6, .8], [IX, 5.6, -1.6], bevel=.04)
box("i_rail", "i_body", "steelHi", [4.4, .1, .14], [IX, 1.86, 0], at=[[0, 0, -.9], [0, 0, .9]])
box("i_stg", "i_body", "steel2", [2.6, .2, 2.6], [IX, 1.95, 0], bevel=.03)
box("i_qz", "i_body", "quartz", [2.0, .26, 2.0], [IX, 2.18, 0], bevel=.02)
box("i_abs", "i_body", "absorb", [1.6, .02, 1.6], [IX, 2.32, 0])
box("i_head", "i_head", "cabD", [1.0, 1.6, 1.0], [IX - 1.2, 4.6, -.6], bevel=.05)
cyl("i_obj", "i_head", "steelHi", .25, .9, [IX - 1.2, 3.4, -.6])
box("i_arm", "i_head", "steel2", [.4, .4, 1.2], [IX - 1.2, 5.4, -1.2])
cyl("i_ray", "i_head", "inspB", .05, .55, [IX - 1.2, 2.66, -.6])
glow("i_rayOn", "i_head", ["i_ray"], "insp", steady=False, g=1.0, freq=4.0, halo=.6)
sph("i_def", "i_def", "def", .07, [IX + .35, 2.345, .3])
glow("i_defOn", "i_def", ["i_def", "i_defR"], "def", steady=False, g=1.0, freq=2.4, halo=1.0)
tube("i_defR", "i_def", "defR", .26, .2, .02, [IX + .35, 2.36, .3])
box("i_scanB", "i_head", "inspB", [.12, .012, 1.8], [IX - 1.2, 2.34, -.6 + .6])
glow("i_scanOn", "i_head", ["i_scanB"], "insp", steady=False, g=1.0, freq=3.0, halo=.4)
# 旁邊：晶圓（晶粒格），每顆晶粒同一處出現紅點（瑕疵重複印）
WIX, WIY = IX + 4.6, 2.2
box("i_tab", "i_wf", "cab2", [3.0, 2.0, 3.0], [WIX, 1.0, .4], bevel=.05)
cyl("i_wf", "i_wf", "mirror", 1.25, .05, [WIX, WIY + .03, .4])
DIES = []
for i in range(-4, 5):
    for j in range(-4, 5):
        x, z = i * .26, j * .26
        if math.hypot(abs(x) + .11, abs(z) + .11) < 1.18: DIES.append([x, 0, z])
box("i_die", "i_wf", "die", [.22, .012, .22], [WIX, WIY + .06, .4], at=DIES)
sph("i_rep", "i_rep", "def", .035, [WIX + .05, WIY + .08, .45], at=DIES)
glow("i_repOn", "i_rep", ["i_rep"], "def", steady=False, g=.9, freq=2.4, halo=.5)
anchor("i_headA", "i_head", [IX - 1.7, 4.6, -.1], dx=-170, dy=-60)
anchor("i_defA", "i_def", [IX + .35, 2.35, .3], dx=170, dy=-90)
anchor("i_wfA", "i_wf", [WIX + 1.0, WIY + .1, 1.2], dx=150, dy=60)

# ═════════ P：極紫外光光罩傳送盒 x=80（主角） ═════════
PX = 80; PY = 2.4
box("p_tab", "p_tab", "cab2", [12, .4, 9], [PX, PY - .7, 0], bevel=.05)
box("p_leg", "p_tab", "steel2", [.35, PY - .9, .35], [PX, (PY - .9) / 2, 0], at=[[sx * 5.5, 0, sz * 4.0] for sx in (-1, 1) for sz in (-1, 1)])
# 外盒底座（高分子）：底板＋側裙＋三個運動定位槽＋四個鎖扣座
box("p_ob", "p_ob", "pod", [8.0, .6, 8.0], [PX, PY - .2, 0], bevel=.12)
box("p_obRib", "p_ob", "podD", [7.6, .1, .14], [PX, PY - .55, 0], at=[[0, 0, -3.3 + 1.1 * i] for i in range(7)])
box("p_obK", "p_ob", "podR", [.6, .08, .25], [PX, PY + .12, 0], at=[[0, 0, 3.4], [-2.95, 0, -1.7], [2.95, 0, -1.7]], rot=[0, 0, 0])
box("p_obL", "p_ob", "latch", [.9, .5, .25], [PX, PY - .1, 0], at=[[0, 0, 4.1], [0, 0, -4.1]])
box("p_obL2", "p_ob", "latch", [.25, .5, .9], [PX, PY - .1, 0], at=[[4.1, 0, 0], [-4.1, 0, 0]])
# 內盒底板（金屬）＋支撐銷＋定位銷
box("p_ib", "p_ib", "inner", [6.0, .45, 6.0], [PX, PY + .32, 0], bevel=.05)
box("p_ibG", "p_ib", "innerD", [6.0, .05, .08], [PX, PY + .56, 0], at=[[0, 0, -2.9], [0, 0, 2.9]])
box("p_ibG2", "p_ib", "innerD", [.08, .05, 6.0], [PX, PY + .56, 0], at=[[-2.9, 0, 0], [2.9, 0, 0]])
cyl("p_pin", "p_ib", "steelHi", .14, .25, [PX, PY + .67, 0], at=[[sx * 2.1, 0, sz * 2.1] for sx in (-1, 1) for sz in (-1, 1)])
box("p_seal", "p_seal", "seal", [6.02, .03, 6.02], [PX, PY + .57, 0])
# 光罩：石英厚板＋吸收層圖案區＋邊框
RY = PY + .95
box("p_ret", "p_ret", "quartz", [4.6, .28, 4.6], [PX, RY, 0], bevel=.03)
box("p_retA", "p_ret", "absorb", [3.6, .02, 3.6], [PX, RY + .15, 0])
box("p_retF", "p_ret", "chrome", [4.4, .015, .1], [PX, RY + .148, 0], at=[[0, 0, -2.0], [0, 0, 2.0]])
box("p_retM", "p_ret", "chrome", [.25, .016, .1], [PX, RY + .15, 0], at=[[1.5, 0, 2.15], [-1.5, 0, 2.15]])
# 內盒上蓋（金屬）：蓋板＋頂部濾片＋壓銷
box("p_ic", "p_ic", "inner", [6.0, 1.0, 6.0], [PX, PY + 1.6, 0], bevel=.06)
cyl("p_icF", "p_ic", "podD", .9, .04, [PX, PY + 2.12, 0])
box("p_icR", "p_ic", "innerD", [6.02, .05, 6.02], [PX, PY + 1.1, 0])
cyl("p_icP", "p_ic", "steelHi", .12, .2, [PX, PY + 2.15, 0], at=[[sx * 2.4, 0, sz * 2.4] for sx in (-1, 1) for sz in (-1, 1)])
# 外盒上蓋：蓋體＋頂部機械手法蘭＋兩側把手＋鎖扣
box("p_oc", "p_oc", "pod", [8.0, 2.4, 8.0], [PX, PY + 1.3, 0], bevel=.25)
box("p_ocN", "p_oc", "podR", [2.0, .4, 2.0], [PX, PY + 2.7, 0], bevel=.05)
box("p_ocF", "p_oc", "pod", [3.6, .22, 3.6], [PX, PY + 3.0, 0], bevel=.04)
box("p_ocH", "p_oc", "podR", [.3, .3, 3.0], [PX, PY + 1.6, 0], at=[[-4.15, 0, 0], [4.15, 0, 0]], bevel=.04)
box("p_ocRib", "p_oc", "podD", [7.0, .06, .1], [PX, PY + 2.48, 0], at=[[0, 0, -2.6 + 1.3 * i] for i in range(5)])
box("p_ocL", "p_oc", "latch", [.8, .35, .2], [PX, PY + .2, 4.06])
box("p_ocE", "p_oc", "podD", [8.04, .14, 8.04], [PX, PY + .2, 0])                                  # 外盒下緣灰色邊條（看得出是蓋子）
box("p_ocW", "p_oc", "podD", [2.4, .9, .04], [PX, PY + 1.3, 4.01])                                    # 正面識別窗框
box("p_ocWg", "p_oc", "glassB", [2.2, .7, .03], [PX, PY + 1.3, 4.03])
cyl("p_icRv", "p_ic", "steelHi", .07, .06, [PX, PY + 2.13, 0], at=[[sx * (2.75 - .5 * i), 0, sz * 2.75] for sx in (-1, 1) for sz in (-1, 1) for i in range(4)])  # 內盒上蓋鉚釘
cyl("p_ibRv", "p_ib", "steelHi", .06, .05, [PX, PY + .56, 0], at=[[sx * 2.75, 0, (i - 2) * 1.3] for sx in (-1, 1) for i in range(5)])
# 灰塵：飄過來撞到外盒就彈開
flowx("p_dust", "p_dust", [[PX - 7.0, PY + 5.0, 1.5], [PX - 2.0, PY + 3.25, 1.0], [PX - 5.5, PY + 4.8, 2.5]], shape="grit", n=6, lanes=3, gap=1.4, ldir=(0, 0, 1), size=.12, rate=.35, color="dust", rim="dustR")
air("p_airD", "p_dust", [PX - 7.2, PY + 3.1, -.2], [PX - 1.8, PY + 5.2, 4.2])
glow("p_ocOn", "p_oc", ["p_oc", "p_ocF"], "#7FB7FF", steady=False, g=.4, freq=1.4)
glow("p_icOn", "p_ic", ["p_ic"], "#7FB7FF", steady=False, g=.55, freq=1.6)
glow("p_sealOn", "p_seal", ["p_seal"], "seal", steady=False, g=.9, freq=2.0, halo=.5)
glow("p_retOn", "p_ret", ["p_retA"], "#7FB7FF", steady=False, g=.5, freq=1.4)
def stand(pid, lay, name, flag, x, z, w=3.6):
    h = w / SIGN[name]["aspect"]; y0 = PY - .5
    box(f"{pid}Bs", lay, "steel2", [w * .5, .12, .6], [x, y0 + .06, z])
    cyl(f"{pid}Po", lay, "steel2", .06, 1.2, [x, y0 + .6, z])
    plate(f"{pid}Sg", lay, name, w, x, y0 + 1.2 + h / 2, z)
    top = y0 + 1.2 + h                                                     # 旗桿立在廠牌右上角後面，旗子在廠牌上方
    cyl(f"{pid}Fp", lay, "steelHi", .03, 1.7, [x + w / 2 - .25, top + .85, z - .05])
    sph(f"{pid}Fb", lay, "steelHi", .06, [x + w / 2 - .25, top + 1.72, z - .05])
    fw = 1.3; plate(f"{pid}Fg", lay, flag, fw, x + w / 2 - .25 - fw / 2 - .03, top + 1.65 - fw / SIGN[flag]["aspect"] / 2, z - .05)
stand("p_ent", "p_ent", "sign-entegris", "flag-US", PX - 6.9, 0.5, w=4.8)
stand("p_gd", "p_gd", "sign-gudeng", "flag-TW", PX + 6.9, 0.5, w=4.8)
anchor("p_entA", "p_ent", [PX - 3.6, PY + 3.4, -5.2], dx=-170, dy=-60)
anchor("p_gdA", "p_gd", [PX + 2.4, PY + 3.4, -5.2], dx=170, dy=-60)
anchor("p_ocA", "p_oc", [PX + 3.6, PY + 2.3, 2.5], dx=170, dy=-80)
anchor("p_icA", "p_ic", [PX + 2.8, PY + 1.8, 2.4], dx=170, dy=-40)
anchor("p_retA", "p_ret", [PX - 2.0, RY + .15, 1.8], dx=-170, dy=-40)
anchor("p_obA", "p_ob", [PX - 3.6, PY, 3.6], dx=-170, dy=60)
anchor("p_sealA", "p_seal", [PX + 3.0, PY + .57, 2.8], dx=170, dy=60)

# ═════════ V：曝光機裝載腔＋光罩台 x=110 ═════════
VX = 110; VY = 1.6
box("v_base", "v_body", "cab", [13, 1.6, 6.4], [VX, .8, 0], bevel=.06)
box("v_baseP", "v_body", "cabPanel", [2.4, 1.0, .06], [VX, .8, 3.23], at=[[-4.5 + 3.0 * i, 0, 0] for i in range(4)], bevel=.02)
# 裝載埠（外盒停這裡，在腔外）
LPX = VX - 4.6
box("v_lp", "v_body", "steel2", [2.6, .3, 2.6], [LPX, VY + .15, 0], bevel=.03)
box("v_lpB", "v_lpod", "pod", [2.3, .3, 2.3], [LPX, VY + .45, 0], bevel=.06)
box("v_lpC", "v_lpC", "pod", [2.3, 1.3, 2.3], [LPX, VY + 1.3, 0], bevel=.12)
box("v_lpE", "v_lpC", "podD", [2.34, .1, 2.34], [LPX, VY + .7, 0])
box("v_lpF", "v_lpC", "podR", [.8, .2, .8], [LPX, VY + 2.05, 0])
# 真空腔（前半剖開）：後牆、左右牆、頂板、閘門
VC0, VC1 = VX - 3.0, VX + 1.6
box("v_chB", "v_body", "steel", [VC1 - VC0, 3.2, .25], [(VC0 + VC1) / 2, VY + 1.6, -1.6])
box("v_chS", "v_body", "steel", [.25, 3.2, 3.2], [VC1, VY + 1.6, 0])
box("v_chT", "v_body", "steel2", [VC1 - VC0, .25, 3.2], [(VC0 + VC1) / 2, VY + 3.3, 0])
box("v_chF", "v_body", "steel2", [VC1 - VC0, .12, .12], [(VC0 + VC1) / 2, VY, 1.55], at=[[0, 0, 0], [0, 3.2, 0]])
box("v_gate", "v_gate", "steelHi", [.2, 2.4, 2.6], [VC0, VY + 1.4, 0])
box("v_gateF", "v_body", "steel2", [.3, .3, 3.0], [VC0, VY + 2.8, 0])
box("v_shelf", "v_body", "steel2", [2.4, .12, 2.4], [VX - .7, VY + .6, 0])
# 真空泵（右後）＋抽氣管
cyl("v_pump", "v_body", "steelHi", .55, 1.4, [VX + 2.6, VY + .7, -1.2])
cyl("v_pumpF", "v_body", "steel2", .68, .14, [VX + 2.6, VY + 1.45, -1.2])
pipe("v_pp", "v_body", "steel2", [[VX + 2.6, VY + 1.5, -1.2], [VX + 2.6, VY + 2.4, -1.2], [VX + 1.7, VY + 2.4, -1.2]], .2)
# 內盒（進腔後才打開）：底板＋光罩＋上蓋
box("v_ib", "v_ib", "inner", [2.1, .3, 2.1], [VX - .7, VY + .82, 0], bevel=.03)
box("v_ret", "v_ret", "quartz", [1.6, .14, 1.6], [VX - .7, VY + 1.04, 0], bevel=.02)
box("v_retA", "v_ret", "absorb", [1.2, .015, 1.2], [VX - .7, VY + 1.115, 0])
box("v_ic", "v_ic", "inner", [2.1, .5, 2.1], [VX - .7, VY + 1.3, 0], bevel=.03)
glow("v_icOn", "v_ic", ["v_ic"], "#7FB7FF", steady=False, g=.5, freq=1.6)
# 空氣分子被抽走（雙球分子形）
for j, (x, y, z) in enumerate([(-2.2, 2.6, .8), (-1.0, 3.0, -.6), (.4, 2.2, .9), (-1.8, 1.4, -.8)]):
    flowx(f"v_air{j}", "v_body", [[VX + x, VY + y, z], [VX + .9, VY + 2.4, -1.0], [VX + 1.7, VY + 2.4, -1.2], [VX + 2.6, VY + 1.6, -1.2]], shape="mol", n=3, size=.12, rate=.45, color="airM", rim="airR")
air("v_airA", "v_body", [VC0 + .2, VY + .9, -1.3], [VX + 2.7, VY + 3.2, 1.2])
# 腔外的灰塵：飄到外盒就彈開
flowx("v_dust", "v_lpod", [[LPX - 3.0, VY + 4.0, 1.0], [LPX - .6, VY + 2.75, .6], [LPX - 2.5, VY + 4.2, 1.8]], shape="grit", n=5, lanes=2, gap=1.0, ldir=(0, 0, 1), size=.08, rate=.35, color="dust", rim="dustR")
air("v_airD", "v_lpod", [LPX - 3.2, VY + 2.6, .2], [LPX - .4, VY + 4.3, 2.4])
# 光罩台＋極紫外光：光從左上打到光罩（反射式）→ 往下打到晶圓的光阻上（下一集）
SX_ = VX + 5.0
box("v_rs", "v_scan", "steel2", [2.6, .35, 2.2], [SX_, VY + 3.6, 0], bevel=.03)
box("v_rsR", "v_scan", "quartz", [1.6, .14, 1.6], [SX_, VY + 3.36, 0])
box("v_rsA", "v_scan", "absorb", [1.2, .015, 1.2], [SX_, VY + 3.28, 0])
box("v_post", "v_scan", "steel", [.4, 3.0, .4], [SX_ - 1.6, VY + 2.3, -1.0])
box("v_wch", "v_scan", "steel2", [2.4, .3, 2.4], [SX_, VY + .6, 0], bevel=.03)
cyl("v_wf", "v_scan", "mirror", 1.0, .05, [SX_, VY + .8, 0])
cyl("v_pr", "v_pr", "resist", 1.0, .08, [SX_, VY + .865, 0])
box("v_sbase", "v_scan", "cab", [3.4, .5, 3.0], [SX_, VY + .2, 0], bevel=.05)
box("v_sbaseP", "v_scan", "cabPanel", [1.2, .3, .04], [SX_, VY + .2, 1.52], at=[[-.8, 0, 0], [.8, 0, 0]])
for i in range(8):
    box(f"v_prL{i}", f"v_prL{i}", "line", [1.5 - .12 * abs(i - 3.5), .02, .08], [SX_, VY + .915, -.62 + .177 * i])
seg("v_inB", "v_scan", "euvB", [SX_ - 3.4, VY + 3.25, 0], [SX_, VY + 3.25, 0], .07)
seg("v_outB", "v_scan", "euvB", [SX_, VY + 3.25, 0], [SX_, VY + .9, 0], .07)
flowx("v_euvF", "v_scan", [[SX_ - 3.4, VY + 3.2, 0], [SX_, VY + 3.2, 0], [SX_, VY + .9, 0]], shape="dot", n=8, size=.07, rate=1.2, color="euv", rim="euvR", trail=3)
air("v_airE", "v_scan", [SX_ - 3.5, VY + .8, -.2], [SX_ + .2, VY + 3.4, .2])
glow("v_euvOn", "v_scan", ["v_inB", "v_outB"], "euv", steady=False, g=1.0, freq=3.0, halo=.6)
glow("v_prOn", "v_pr", ["v_pr"], "resist", steady=False, g=.6, freq=1.4)
anchor("v_gateA", "v_gate", [VC0, VY + 2.6, 1.2], dx=-170, dy=-80)
anchor("v_icA", "v_ic", [VX - .2, VY + 1.5, .9], dx=170, dy=-60)
anchor("v_pumpA", "v_body", [VX + 2.6, VY + .9, -.6], dx=170, dy=60)
anchor("v_lpA", "v_lpC", [LPX - 1.0, VY + 1.6, 1.0], dx=-170, dy=60)
anchor("v_rsA", "v_scan", [SX_ + 1.2, VY + 3.6, .8], dx=170, dy=-60)
anchor("v_prA", "v_pr", [SX_ + .8, VY + .86, .6], dx=170, dy=60)
anchor("v_euvA", "v_scan", [SX_ - 2.4, VY + 3.25, 0], dx=-170, dy=-80)

# 主素材框（看不見；給 layout-check 判斷主體位置）：每段只亮鏡頭對準的那一個，其他層全部標 bg
materials["m_proxy"] = {"kind": "unlit", "color": "#FFFFFF", "opacity": 0}
PXB = {"px_cap": (ST[0] - 1.1, ST[0] + 1.1, TOP, TOP + .7, ST[1] - .5, ST[1] + .6), "px_mer": (SD[0] - 1, SK[0] + 1, TOP, TOP + .8, -3.2, -1.2), "px_mer2": (SP[0] - 1, SP[0] + 1, TOP, TOP + .8, -2.8, -.8), "px_tw": (SM[0] - .6, SM[0] + .6, TOP, TOP + .7, SM[1] - .4, SM[1] + .9),
       "px_eb": (EX - 3.2, EX + 3.2, 1.8, 10.8, -2.2, 2.2), "px_ins": (IX - 2.9, WIX + 1.4, 1.6, 5.9, -2.0, 1.8),
       "px_map": (SS[0] + 1.5, SD[0] + 1, TOP, TOP + 1.2, -4, 2), "px_pod": (PX - 4.2, PX + 4.2, PY - .6, PY + 3.2, -4.2, 4.2), "px_podX": (PX - 4.2, PX + 4.2, PY - .6, PY + 8.6, -4.2, 4.2),
       "px_vac": (LPX - 1.4, VX + 3.2, VY, VY + 3.5, -1.6, 1.6), "px_scan": (SX_ - 1.1, SX_ + 1.1, VY + .6, VY + 1.0, -1.2, 1.2)}
for lid, (x0, x1, y0, y1, z0, z1) in PXB.items():
    box(lid, lid, "proxy", [x1 - x0, y1 - y0, z1 - z0], [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2])
for l in layers:
    if not l["id"].startswith("px_"): l["bg"] = True
model = {
 "name": "tech-mask2：光罩-2。站別：F 廠區 x=0、E 電子束寫入機 x=30、I 檢測機 x=55、P 光罩盒 x=80、V 裝載腔／光罩台 x=110（genmodel.py 產生）",
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
def fall(lay, until, dy=1.4, bounce=.08, at=HIDE):
    return {"layer": lay, "at": at, "until": until, "dy": dy, "opacity": 0, "dur": 12, "fallIn": True, "bounce": bounce}
def sec(kind, at, until, title, tag, t, y=930, h=330, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag, "t": {k: {"at": v} for k, v in t.items()}}
    d.update(kw); return d

VIS = [
 # F：台灣光罩 s4 念到才落下
 fall("f_tmc", "s4:tmc", dy=2.0, bounce=.1),
 hid("f_tsmc_pin", HIDE, "s2:tsmc", 4), hid("f_intel_pin", HIDE, "s2:intel", 4), hid("f_ss_pin", HIDE, "s2:ss", 4),
 hid("f_tsmc_pin", "s2:fast-8", FAR, 6), hid("f_intel_pin", "s2:fast-8", FAR, 6), hid("f_ss_pin", "s2:fast-8", FAR, 6),
 hid("f_dnp_pin", HIDE, "s3:jp", 4), hid("f_tek_pin", HIDE, "s3:jp+8", 4), hid("f_phr_pin", HIDE, "s3:us", 4),
 hid("f_cTW_pin", HIDE, "s3:mer", 4), hid("f_cKR_pin", HIDE, "s3:mer+6", 4), hid("f_cUS_pin", HIDE, "s3:mer+12", 4), hid("f_cKR_pin", "s4:start", FAR, 4), hid("f_cUS_pin", "s4:start", FAR, 4),
 hid("f_rDNP", HIDE, "s3:mer", 6), hid("f_rTEK", HIDE, "s3:mer+6", 6), hid("f_rPHR", HIDE, "s3:mer+12", 6), hid("f_rTMC", HIDE, "s4:mat+30", 6),
 hid("f_rDNP", "s4:start", FAR, 4), hid("f_rTEK", "s4:start", FAR, 4), hid("f_rPHR", "s4:start", FAR, 4), fall("f_tmc_pin", "s4:tmc", dy=2.0, bounce=.1),
 # 物流車：念「成熟製程」光罩盒從卸貨門推上車（往右前），車再沿路開往南部客戶（z 往觀眾、x 往左）
 hid("f_vanP", HIDE, "s4:tmc+14", 4), hid("f_van", HIDE, "s4:tmc+14", 4),
 mv("f_vanP", "s4:mat", FAR, dur=12, dx=VX0 - (SITES["tmc"][0] + .3), dy=.12, dz=VZ0 - (SITES["tmc"][1] + .36)),
 mv("f_van", "s4:mat+14", FAR, dur=26, dz=.7), mv("f_vanP", "s4:mat+14", FAR, dur=26, dz=.7),
 mv("f_van", "s4:mat+40", FAR, dur=30, dx=-.55, dz=.35), mv("f_vanP", "s4:mat+40", FAR, dur=30, dx=-.55, dz=.35),
 # E：寫過的線一條條出現（s5 念「一筆筆寫上去」）；多束 s6 才出現、單束 s6 收掉；多束一次寫一整塊
 hid("e_mb", HIDE, "s6:all-6", 8), hid("e_mb", "s7:start", FAR, 4),
] + [hid(f"e_ln{k}", HIDE, f"s5:wr+{k * 5}" if k else "s5:wr", 4) for k in range(12)] + [
 hid(f"e_blk{k}", HIDE, f"s6:all+{4 + k * 8}", 4) for k in range(6)] + [
 # I：瑕疵 s7 念「一個瑕疵」才亮；晶圓上每顆晶粒的紅點念「每次曝光」才出現；檢測頭來回掃
 hid("i_def", HIDE, "s7:def", 6), hid("i_rep", HIDE, "s7:rep", 10),
 mv("i_head", "s7:start", "s7:def", dur=40, dx=1.55, dz=.9),
 # P：s1 念「怎麼送進」外盒上蓋抬起；s8 爆炸分層（外盒上蓋最高、內盒上蓋中間、光罩先懸在上面，念「裝進光罩盒」才放下）；s10 合回
 mv("p_oc", HIDE, "s1:how", dur=14, dy=3.8), mv("p_ic", HIDE, "s1:how-6", dur=14, dy=1.9),
 mv("p_ob", "s8:start-4", "s10:start", dur=26, dy=-1.4),
 mv("v_lpC", "s9:start-30", "s9:vac", dur=14, dy=1.6),
 hid("e_beamL", HIDE, "s5:eb", 4), hid("e_beamL", "s6:slow", FAR, 4),
 fall("p_ent", "s10:ent", dy=2.0, bounce=.1), fall("p_gd", "s10:gd", dy=2.0, bounce=.1), hid("p_ent", "s11:start", FAR, 1), hid("p_gd", "s11:start", FAR, 1),
 hid("v_body", "s11:start-4", FAR, 8), hid("v_lpC", "s11:start-4", FAR, 8), hid("v_lpod", "s11:start-4", FAR, 8), hid("v_ib", "s11:start-4", FAR, 8), hid("v_ret", "s11:start-4", FAR, 8), hid("v_ic", "s11:start-4", FAR, 8),
 mv("p_oc", "s8:start-4", "s10:start", dur=26, dy=6.6), mv("p_ic", "s8:start-4", "s10:start", dur=26, dy=3.4),
 mv("p_ret", "s8:start-4", "s8:pod+4", dur=26, dy=1.8),
 # V：內盒從裝載埠搬進腔（x 往右），閘門關上，念「才打開」內盒上蓋抬起；s11 光罩搬到光罩台（同一份光罩，另做一片在光罩台上，念「光罩到了」才出現）
 mv("v_ib", "s9:start-30", "s9:why", dur=30, dx=-3.9), mv("v_ret", "s9:start-30", "s9:why", dur=30, dx=-3.9), mv("v_ic", "s9:start-30", "s9:why", dur=30, dx=-3.9),
 mv("v_gate", "s9:start-30", "s9:why+34", dur=14, dy=2.6),
 mv("v_ic", "s9:open", "s10:start", dur=20, dy=1.0),
 *[hid(f"v_prL{i}", HIDE, f"s11:light+{4 * i}", 4) for i in range(8)],
]
PXW = {"px_pod": [(EARLY, "s2:start-4"), ("s10:start+30", "s11:start-4")], "px_cap": [("s2:fast+24", "s3:start-4")], "px_mer": [("s3:start+30", "s3:us-8")], "px_mer2": [("s3:us+26", "s4:start-4")],
       "px_tw": [("s4:start+30", "s5:start-4")], "px_map": [("s2:start+30", "s2:fast-8")], "px_eb": [("s5:start+30", "s7:start-4")], "px_ins": [("s7:start+30", "s8:start-4")],
       "px_podX": [("s8:start+30", "s9:start-4")], "px_vac": [("s9:start+30", "s10:start-4")], "px_scan": [("s11:start+30", FAR)]}
for lid, wins in PXW.items():
    prev = "s1:start-400"
    for a_, b_ in wins:
        VIS.append({"layer": lid, "at": prev, "until": a_, "opacity": 0, "dur": 1}); prev = b_
    VIS.append({"layer": lid, "at": prev, "until": "s12:start+500", "opacity": 0, "dur": 1})
P = {}
P["s1"] = {"zoom": [{"to": "pod", "at": "start-30", "dur": 1}],
 "shot": [shot("start-30", PX, PY + .6, 50, 26, 1), shot("how", PX, PY + .2, 46, 24, 60)],
 "shift": VIS,
 "run": [run("p_retOn", "start-30", "how", 6), run("p_icOn", "how", "s2:start", 6), run("p_ocOn", "how+10", "s2:start", 6)],
 "labels": [],
 "overlay": [sec("mk2-hook", "prev", "s2:start-8", "代工的供應商：光罩", "示意，非實際比例", {"prev": "prev", "who": "who", "how": "how", "scan": "scan"})]}
def shotZ(at, X, Z, deff, elev, dur=24, Y=None):
    """看向地圖上 (X, TOP, Z) 這一點（鏡頭只能看 z=0 的平面：換算成看 z=0 的高度與距離）"""
    e = math.radians(elev); y = (TOP if Y is None else Y) - Z * math.tan(e)
    return shot(at, R(X), R(y), R(deff + Z / math.cos(e)), elev, dur)
ST, SI, SS, SD, SK, SP, SM, SC = (SITES[k] for k in ("tsmc", "intel", "ss", "dnp", "tek", "phr", "tmc", "cTW"))
def LG(part, text, en, color, at, until, xy, logo=None, flag=None):
    d = lab(part, text, en, color, at, until, xy=xy)
    if logo: d["logo"] = logo
    if flag: d["flag"] = flag
    return d
DNPL = "dnp" if os.path.exists(os.path.join(ROOT, "public/logos/dnp.svg")) else None
PHRL = "photronics" if os.path.exists(os.path.join(ROOT, "public/logos/photronics.svg")) else None
# s2：地圖全景（台灣、韓國、美國三個自有光罩廠），念到哪家哪家的定位光柱亮、標籤（LOGO＋國旗）出來；念「改版最快」推近台積電：光罩盒在天橋裡來回
P["s2"] = {"zoom": [{"to": "plant", "at": "start-4", "dur": 30}],
 "shot": [shotZ("start-4", -48.5, 6.0, 128, 58, 30), shotZ("fast-6", ST[0] + .1, ST[1] + .7, 7.5, 36, 30)],
 "run": [run("f_tsmcOn", "tsmc", "s3:start", 6), run("f_intelOn", "intel", "s3:start", 6), run("f_ssOn", "ss", "s3:start", 6)] +
        [run(f"f_{k}Br", "fast-10", "s3:start", 8) for k in ("tsmc", "intel", "ss")],
 "labels": [LG("f_tsmcA", "台積電", "TSMC", "blue", "tsmc", "fast-8", [700, 720], "tsmc", "TW"), LG("f_intelA", "英特爾", "Intel", "blue", "intel", "fast-8", [810, 300], "intel", "US"),
            LG("f_ssA", "三星", "Samsung", "blue", "ss", "fast-8", [270, 300], "samsung", "KR"),
            lab("f_tsmcA", "光罩廠在隔壁", "Next door", "amber", "fast", "s3:start-4", xy=[760, 300])],
 "overlay": [sec("mk2-cap", "start+4", "s3:start-8", "晶圓廠自己做光罩", "Semiconductor Engineering", {"adv": "adv", "tsmc": "tsmc", "intel": "intel", "ss": "ss", "fast": "fast"})]}
# s3：拉到太平洋全景：日本兩家（東京周邊）、美國一家（東岸）；念「專業光罩廠」三條出貨航線開始跑（光罩盒沿弧線飛往客戶晶圓廠）
P["s3"] = {"zoom": [{"to": "plant", "at": "start-4", "dur": 1}],
 "shot": [shotZ("start-4", SD[0] + 1.0, SD[1] + 1.6, 22, 46, 30), shotZ("jp-12", (SD[0] + SK[0]) / 2, SD[1] + 1.0, 7.0, 36, 26), shotZ("us-6", SP[0], SP[1] + .9, 6.0, 36, 30)],
 "run": [run("f_rDNPF", "mer", "s5:start", 8), run("f_rTEKF", "mer+6", "s5:start", 8), run("f_rPHRF", "mer+12", "s5:start", 8),
         run("f_dnpOn", "jp", "s4:start", 6), run("f_tekOn", "jp+8", "s4:start", 6), run("f_phrOn", "us", "s4:start", 6),
         run("f_cTWOn", "mer", "s4:start", 6), run("f_cKROn", "mer+6", "s4:start", 6), run("f_cUSOn", "mer+12", "s4:start", 6)],
 "labels": [LG("f_dnpA", "大日本印刷", "DNP", "amber", "jp", "us-8", [260, 300], DNPL, "JP"), LG("f_tekA", "Tekscend", "ex-Toppan", "amber", "jp+8", "us-8", [790, 300], "tekscend", "JP"),
            LG("f_phrA", "Photronics", "US", "blue", "us", "s4:start-10", [790, 300], PHRL, "US")],
 "overlay": [sec("mk2-mer", "start+4", "s4:start-8", "專業光罩廠", "SemiEng；Photronics 10-K", {"mer": "mer", "jp": "jp", "us": "us"})]}
# s4：推近台灣：念「台灣光罩」廠區落下、光柱亮；念「成熟製程」光罩盒推上潔淨物流車，車沿路開往南部客戶晶圓廠
P["s4"] = {"zoom": [{"to": "plant", "at": "start-4", "dur": 1}],
 "shot": [shotZ("start-4", TWC[0] + .3, TWC[1] + 1.2, 44, 54, 26), shotZ("tmc", SM[0] + .15, SM[1] + .95, 7.5, 38, 30)],
 "run": [run("f_tmcOn", "tmc", "s5:start", 6), run("f_cTWOn", "mat", "s5:start", 6), run("f_rTMCF", "mat+30", "s5:start", 8)],
 "labels": [LG("m_twA", "台灣", "Taiwan", "blue", "start-2", "tmc+16", [270, 300], None, "TW"),
            LG("f_tmcA", "台灣光罩", "Taiwan Mask", "blue", "tmc", "s5:start-4", [720, 300], None, "TW"),
            lab("f_vanA", "潔淨物流車", "Clean logistics", "amber", "mat", "s5:start-4", xy=[810, 853])],
 "overlay": [sec("mk2-tw", "start+4", "s5:start-8", "台灣光罩（2338）", "公司說法", {"tmc": "tmc", "mat": "mat"})]}
P["s5"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", EX, 2.94, 47, 14, 30)],
 "run": [run("e_cathOn", "eb-6", "s7:start", 6), run("e_coilOn", "eb-6", "s7:start", 8), run("e_beam", "eb", "s6:slow", 8), run("e_spotOn", "eb+10", "s6:slow", 6), run("e_beamOn", "eb", "s6:slow", 6),
         run("e_scan", "wr", "s7:start", 10), run("e_ledG", "start", "s7:start", 1)],
 "labels": [lab("e_qzA", "石英板＋鉻", "Quartz + chrome", "blue", "qz", "s6:start-4", xy=[270, 853]), lab("e_rsA", "光阻", "Resist", "amber", "res", "s6:start-4", xy=[810, 853]),
            lab("e_colA", "電子束鏡筒", "E-beam column", "blue", "eb", "s6:start-4", xy=[270, 300]), lab("e_cathA", "電子槍", "Electron gun", "coral", "eb+8", "s6:start-4", xy=[810, 300])],
 "overlay": [sec("mk2-eb", "start+4", "s6:start-8", "電子束寫入", "USPTO 7220531", {"how": "how", "qz": "qz", "cr": "cr", "res": "res", "eb": "eb", "wr": "wr"})]}
P["s6"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}],
 "shot": [shot("start-4", EX, 3.0, 47, 15, 30)],
 "run": [run(f"e_mbF{j}", "all-6", "s7:start", 8) for j in range(8)] + [run("e_spotOn", "start", "slow", 6)],
 "labels": [lab("e_colA", "一道太慢", "One beam: slow", "coral", "slow", "all-6", xy=[270, 300]), lab("e_mbA", "多束一起寫", "Multi-beam", "blue", "all-6", "s7:start-4", xy=[810, 300])],
 "overlay": [sec("mk2-mb", "start+4", "s7:start-8", "單束 vs 多束", "IMS；NuFlare", {"fine": "fine", "slow": "slow", "adv": "adv", "n26": "n26", "all": "all"})]}
P["s7"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", IX + 1.6, 1.38, 34.8, 24, 30)],
 "run": [run("i_rayOn", "ins", "s8:start", 6), run("i_scanOn", "ins", "def", 6), run("i_defOn", "def", "s8:start", 6), run("i_repOn", "rep", "s8:start", 6)],
 "labels": [lab("i_headA", "檢測頭", "Inspection head", "blue", "ins", "s8:start-4", xy=[270, 300]), lab("i_defA", "一個瑕疵", "One defect", "coral", "def", "s8:start-4", xy=[810, 300]),
            lab("i_wfA", "每顆都印上", "Every die", "coral", "rep", "s8:start-4", xy=[810, 853])],
 "overlay": [sec("mk2-ins", "start+4", "s8:start-8", "為什麼要檢查", "Lasertec；SemiEng", {"ins": "ins", "def": "def", "rep": "rep"})]}
P["s8"] = {"zoom": [{"to": "pod", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", PX, PY + .17, 53.6, 18, 30)],
 "run": [run("p_retOn", "pod", "two", 6), run("p_ocOn", "out", "s9:start", 6), run("p_dust", "out-6", "s9:start", 8), run("p_icOn", "inn", "s9:start", 6), run("p_sealOn", "inn+8", "s9:start", 6)],
 "labels": [lab("p_ocA", "外盒", "Outer pod", "amber", "out", "s9:start-4", xy=[810, 300]), lab("p_icA", "金屬內盒", "Inner pod", "blue", "inn", "s9:start-4", xy=[810, 853]),
            lab("p_retA", "光罩", "Reticle", "blue", "pod", "s9:start-4", xy=[270, 300]), lab("p_obA", "外盒底座", "Outer base", "amber", "two", "s9:start-4", xy=[270, 853])],
 "overlay": [sec("mk2-pod", "start+4", "s9:start-8", "光罩盒：兩層", "Entegris；SEMATECH", {"pod": "pod", "euv": "euv", "two": "two", "out": "out", "inn": "inn"})]}
P["s9"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", VX - 1.6, VY - .57, 34.5, 20, 30), shot("vac-4", VX - .9, VY + .3, 22, 22, 30)],
 "run": [run("v_dust", "start", "s10:start", 8)] + [run(f"v_air{j}", "vac-4", "s10:start", 8) for j in range(4)] + [run("v_icOn", "open", "s10:start", 6)],
 "labels": [lab("v_lpA", "① 外盒留外面", "Stays outside", "amber", "start+6", "vac", xy=[270, 853]), lab("v_gateA", "② 內盒進腔", "Inner pod in", "blue", "why+10", "vac-8", xy=[810, 320]),
            lab("v_pumpA", "③ 抽真空", "Pump down", "blue", "vac", "s10:start-4", xy=[810, 853]), lab("v_icA", "④ 真空裡才開", "Opens in vacuum", "coral", "open", "s10:start-4", xy=[270, 300])],
 "overlay": [sec("mk2-vac", "start+4", "s10:start-8", "很難加保護膜", "USPTO 7477358；SPIE", {"why": "why", "film": "film", "vac": "vac", "open": "open"})]}
P["s10"] = {"zoom": [{"to": "pod", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", PX, PY - .6, 60, 22, 30)],
 "run": [run("p_ocOn", "cert", "s11:start", 6), run("p_sealOn", "gd", "s11:start", 6)],
 "labels": [],  # 兩家的 LOGO＋國旗做成 3D 廠牌立在盒子後面（p_ent／p_gd），中文名稱在 2D 卡
 "overlay": [sec("mk2-co", "start+4", "s11:start-8", "誰做光罩盒", "Entegris 2018；中央社 2018", {"cert": "cert", "ent": "ent", "gd": "gd"})]}
P["s11"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
 "shot": [shot("start-4", SX_ - .9, VY + .8, 15, 22, 1)],
 "run": [run("v_euvOn", "arr", FAR, 6), run("v_euvF", "arr", FAR, 8), run("v_prOn", "glue", FAR, 6)],
 "labels": [lab("v_rsA", "光罩", "Reticle", "blue", "arr", "kw-10", xy=[900, 300]), lab("v_euvA", "極紫外光", "EUV light", "coral", "arr+10", "kw-10", xy=[230, 300]),
            lab("v_prA", "光阻", "Resist (next)", "amber", "glue", "kw-10", xy=[230, 640])],
 "overlay": [sec("mk2-next", "start+2", "kw-10", "還要一層膠", "示意動畫", {"arr": "arr", "glue": "glue", "light": "light", "next": "next", "kw": "kw"})]}
for sc in script["scenes"]:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])
json.dump(script, open(sp, "w"), ensure_ascii=False, indent=1)
print("script props 併入", len(P), "幕")
