# tech-implant 產生器：python3 videos/tech-implant/genmodel.py → model.json，並把 3D 動作（zoom/shot/shift/run/labels/overlay）併進 script.json
# （先跑 genscript.py 產生旁白、cue、字幕；本檔讀 timeline.json 的 cue 幀數，所有動作的 at 都寫成「幕id:cue±幀」）
# 主角機台沿用 videos/test-ion-opus/gen.py（Andy 看過的比較片），補四個缺點（visual-spec.md 第一節）與新零件。
# 離子佈植機：離子源 → 加速管（分段電極環）→ 分析磁鐵（90° 轉彎、濾掉太重太輕的）→ 射束管線 → 掃描板 → 終端站（晶圓上下機械掃描）→ 剖面放大（摻雜層）
# 單位約 20 cm；地板 y=0；射束高度 y=5。所有座標在這裡算，不手改 json。
import json, math, os, random
D = os.path.dirname(os.path.abspath(__file__))
R2 = lambda v: round(v, 3)
rnd = random.Random(20261120)
FPS = 30
TL = json.load(open(os.path.join(D, "timeline.json")))
CUES = []  # (幀, 幕id, cue id)
SC_ = {}
for s in TL["scenes"]:
    SC_[s["id"]] = s
    CUES.append((s["startFrame"], s["id"], "start"))
    for c in s.get("cues", []): CUES.append((c["frame"], s["id"], c["id"]))
CUES.sort()
def cf(sid, cue="start"):
    s = SC_[sid]
    if cue == "start": return s["startFrame"]
    if cue == "end": return s["voiceEndFrame"]
    return next(c["frame"] for c in s["cues"] if c["id"] == cue)
def A(f):
    """絕對幀 → 「幕id:cue±幀」（取不晚於 f 的最近一個 cue）"""
    f = int(round(f))
    if f < 0: return f"s1:start-{-f}"
    best = CUES[0]
    for c in CUES:
        if c[0] <= f: best = c
    d = f - best[0]
    return f"{best[1]}:{best[2]}" + (f"+{d}" if d else "")
def C(sid, cue="start", d=0): return A(cf(sid, cue) + d)
END = TL["totalFrames"]

parts, layers, acts, anchors = [], {}, {}, {}
def L(lid, **kw):
    if lid not in layers: layers[lid] = {"id": lid, "z": 0, "k": 0, **kw}
    return lid
def P(layer, shape, size, pos, mat, rot=None, at=None, pid=None, **kw):
    L(layer)
    d = {"layer": layer, "shape": shape, "size": [R2(x) for x in size], "pos": [R2(x) for x in pos], "mat": mat}
    if rot: d["rot"] = [R2(x) for x in rot]
    if at: d["at"] = [[R2(c) for c in a] for a in at]
    if pid: d["id"] = pid
    d.update(kw); parts.append(d); return d
def box(layer, x0, x1, y0, y1, z0, z1, mat, **kw):
    return P(layer, "box", [x1 - x0, y1 - y0, z1 - z0], [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], mat, **kw)

# ── 色票與材質 ──
pal = {}
mats = {
  "floorT": {"kind": "std", "color": "#E3E9F1", "rough": 0.55, "metal": 0},
  "floorP": {"kind": "std", "color": "#CBD4E0", "rough": 0.8, "metal": 0},
  "floorG": {"kind": "unlit", "color": "#A8B4C6"},
  "ceilF": {"kind": "unlit", "color": "#F7FAFE"},
  "ceilG": {"kind": "unlit", "color": "#C4CEDC"},
  "ceilL": {"kind": "unlit", "color": "#FFFFFF"},
  "wall": {"kind": "std", "color": "#DCE4EE", "rough": 0.7, "metal": 0},
  "wallSeam": {"kind": "unlit", "color": "#BFCADA"},
  "farTool": {"kind": "std", "color": "#C9D3E1", "rough": 0.6, "metal": 0},
  "farTool2": {"kind": "std", "color": "#B7C3D4", "rough": 0.6, "metal": 0},
  "farDark": {"kind": "std", "color": "#8E9BB0", "rough": 0.6, "metal": 0},
  "cab": {"kind": "std", "color": "#EEF2F7", "rough": 0.45, "metal": 0.1},
  "cabPanel": {"kind": "phys", "color": "#F7F9FC", "rough": 0.3, "metal": 0, "clearcoat": 0.5, "env": 0.5},
  "cabDark": {"kind": "std", "color": "#4A5873", "rough": 0.5, "metal": 0.3},
  "seam": {"kind": "unlit", "color": "#7F8CA3"},
  "vent": {"kind": "unlit", "color": "#5D6A82"},
  "screw": {"kind": "std", "color": "#9AA8BE", "rough": 0.25, "metal": 0.9, "env": 0.6},
  "steel": {"kind": "std", "color": "#A9B6CA", "rough": 0.28, "metal": 0.88, "env": 0.7, "tex": "brushed", "texScale": 2},
  "steel2": {"kind": "std", "color": "#7F8CA3", "rough": 0.35, "metal": 0.8, "env": 0.6},
  "flange": {"kind": "std", "color": "#C3CDDC", "rough": 0.22, "metal": 0.92, "env": 0.9},
  "ceramic": {"kind": "phys", "color": "#F4F1EA", "rough": 0.25, "metal": 0, "clearcoat": 0.6, "env": 0.4},
  "glass": {"kind": "phys", "color": "#CFE2F7", "rough": 0.08, "metal": 0, "clearcoat": 1, "opacity": 0.22, "env": 0.6},
  "glassTube": {"kind": "phys", "color": "#D6E6F8", "rough": 0.08, "metal": 0, "clearcoat": 1, "opacity": 0.18, "env": 0.5},
  "yoke": {"kind": "std", "color": "#33415C", "rough": 0.45, "metal": 0.55, "env": 0.5},
  "yoke2": {"kind": "std", "color": "#46557A", "rough": 0.4, "metal": 0.5, "env": 0.5},
  "pole": {"kind": "std", "color": "#8A97AE", "rough": 0.3, "metal": 0.85, "env": 0.7},
  "coil": {"kind": "std", "color": "#D9873A", "rough": 0.3, "metal": 0.92, "env": 0.8, "tex": "brushed", "texScale": 0.8},
  "coilLine": {"kind": "unlit", "color": "#8F4E16"},
  "chamberIn": {"kind": "std", "color": "#5B6A86", "rough": 0.5, "metal": 0.5},
  "hvY": {"kind": "unlit", "color": "#FFC21A"},
  "hvK": {"kind": "unlit", "color": "#1E2433"},
  "ledG": {"kind": "std", "color": "#14C38E", "emissive": "#14C38E", "ei": 0.9},
  "ledB": {"kind": "std", "color": "#1F6FEB", "emissive": "#1F6FEB", "ei": 0.8},
  "ledA": {"kind": "std", "color": "#FF9F1C", "emissive": "#FF9F1C", "ei": 0.6},
  "ledR": {"kind": "std", "color": "#C9372C", "emissive": "#C9372C", "ei": 0.3},
  "lampOff": {"kind": "std", "color": "#C9D2DF", "rough": 0.3},
  "screen": {"kind": "screen", "color": "#2E6FD8", "ei": 0.7},
  "screenUI": {"kind": "unlit", "color": "#BFD8FF"},
  "pump": {"kind": "std", "color": "#B9C4D4", "rough": 0.3, "metal": 0.8, "env": 0.6},
  "pumpDark": {"kind": "std", "color": "#4E5A72", "rough": 0.5, "metal": 0.3},
  "hose": {"kind": "std", "color": "#8C99AF", "rough": 0.4, "metal": 0.7},
  "duct": {"kind": "std", "color": "#C7D0DD", "rough": 0.35, "metal": 0.7, "env": 0.5},
  "plasma": {"kind": "unlit", "color": "#C77DFF"},
  "srcIn": {"kind": "std", "color": "#3B465E", "rough": 0.5, "metal": 0.5},
  "beam": {"kind": "unlit", "color": "#FFB24A", "opacity": 0.28},
  "ion": {"kind": "std", "color": "#FF7A1A", "emissive": "#FF7A1A", "ei": 0.55, "rough": 0.3},
  "ionHeavy": {"kind": "std", "color": "#7C5CD6", "emissive": "#7C5CD6", "ei": 0.45, "rough": 0.3},
  "ionLight": {"kind": "std", "color": "#12A88A", "emissive": "#12A88A", "ei": 0.45, "rough": 0.3},
  "plus": {"kind": "unlit", "color": "#FFFFFF"},
  "tr1": {"kind": "unlit", "color": "#FF8A24", "opacity": 0.7},
  "tr2": {"kind": "unlit", "color": "#FFA04A", "opacity": 0.45},
  "tr3": {"kind": "unlit", "color": "#FFB873", "opacity": 0.25},
  "trH1": {"kind": "unlit", "color": "#9C84E6", "opacity": 0.5}, "trH2": {"kind": "unlit", "color": "#B6A5EE", "opacity": 0.3}, "trH3": {"kind": "unlit", "color": "#CFC4F5", "opacity": 0.16},
  "trL1": {"kind": "unlit", "color": "#3FC4A8", "opacity": 0.5}, "trL2": {"kind": "unlit", "color": "#7AD8C4", "opacity": 0.3}, "trL3": {"kind": "unlit", "color": "#B0E9DC", "opacity": 0.16},
  "spark": {"kind": "unlit", "color": "#FFE066"},
  "sparkW": {"kind": "unlit", "color": "#FFFFFF"},
  "wafer": {"kind": "phys", "color": "#B4C2DA", "rough": 0.08, "metal": 0.45, "clearcoat": 1, "env": 1.0},
  "die": {"kind": "std", "color": "#7FA4E0", "rough": 0.22, "metal": 0.55, "tex": "traces", "texScale": 0.35, "env": 0.9},
  "platen": {"kind": "std", "color": "#5D6A82", "rough": 0.4, "metal": 0.6},
  "dose": {"kind": "unlit", "color": "#FF9F1C", "opacity": 0.32},
  "spot": {"kind": "unlit", "color": "#FFE7A8"},
  "si": {"kind": "std", "color": "#AFC0DA", "rough": 0.45, "metal": 0.25},
  "siFace": {"kind": "unlit", "color": "#D7E2F2"},
  "lattice": {"kind": "unlit", "color": "#8EA3C4"},
  "oxideTop": {"kind": "unlit", "color": "#EEF3FA"},
  "d1": {"kind": "unlit", "color": "#FFE3B8", "opacity": 0.85}, "d2": {"kind": "unlit", "color": "#FFC77A", "opacity": 0.85}, "d3": {"kind": "unlit", "color": "#FF9F1C", "opacity": 0.9},
  "insetFrame": {"kind": "unlit", "color": "#1F6FEB"},
  "rp": {"kind": "unlit", "color": "#C2441F"},
  "shadowC": {"kind": "unlit", "color": "#9AA7BB", "opacity": 0.35},
  "stripeY": {"kind": "unlit", "color": "#F5B700"}, "stripeK": {"kind": "unlit", "color": "#2A2F3A"},
}
# ── tech-implant 新增材質 ──
def lerp_hex(a, b, t):
    a = [int(a[i:i + 2], 16) for i in (1, 3, 5)]; b = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(x + (y - x) * t):02X}" for x, y in zip(a, b))
for k in range(19):  # 電極環：電位由低（深藍）到高（淺藍）
    mats[f"e{k}"] = {"kind": "std", "color": lerp_hex("#1E3A8A", "#9CC9FF", k / 18), "rough": 0.25, "metal": 0.85, "env": 0.8}
mats.update({
  "ringHi": {"kind": "unlit", "color": "#7CC4FF"},
  "gasCab": {"kind": "std", "color": "#E4EAF2", "rough": 0.45, "metal": 0.1},
  "cylBody": {"kind": "std", "color": "#D9DEE6", "rough": 0.3, "metal": 0.75, "env": 0.7, "tex": "brushed", "texScale": 1.5},
  "cylP": {"kind": "std", "color": "#12A88A", "rough": 0.35, "metal": 0.2},
  "cylB": {"kind": "std", "color": "#E2552E", "rough": 0.35, "metal": 0.2},
  "warnW": {"kind": "unlit", "color": "#FFFFFF"},
  "gauge": {"kind": "unlit", "color": "#F8FAFD"}, "gaugeN": {"kind": "unlit", "color": "#C9372C"},
  "molP": {"kind": "unlit", "color": "#12A88A"}, "molPR": {"kind": "unlit", "color": "#0B6E5A"},
  "molB": {"kind": "unlit", "color": "#E2552E"}, "molBR": {"kind": "unlit", "color": "#8F2E14"},
  "elec": {"kind": "unlit", "color": "#2FA8FF"}, "elecR": {"kind": "unlit", "color": "#FFFFFF"},
  "field": {"kind": "unlit", "color": "#4FA3FF"},
  "filament": {"kind": "std", "color": "#FFB347", "emissive": "#FF8A24", "ei": 0.2, "rough": 0.4},
  "resist": {"kind": "std", "color": "#9E2A2B", "rough": 0.35, "metal": 0.05},
  "resistHard": {"kind": "std", "color": "#4A2A18", "rough": 0.8, "metal": 0},
  "crack": {"kind": "unlit", "color": "#1C0E06"},
  "flake": {"kind": "unlit", "color": "#6B3A1E"}, "flakeR": {"kind": "unlit", "color": "#2E170A"},
  "dust": {"kind": "unlit", "color": "#5B5F66"},
  "zoneN": {"kind": "unlit", "color": "#14B8A6"}, "zoneP": {"kind": "unlit", "color": "#F05A28"},
  "lensRing": {"kind": "std", "color": "#2B3A55", "rough": 0.3, "metal": 0.8, "env": 0.7},
  "lens": {"kind": "phys", "color": "#E8F3FF", "rough": 0.03, "metal": 0, "clearcoat": 1, "opacity": 0.16, "env": 1.0},
  "farHi": {"kind": "unlit", "color": "#FF9F1C", "opacity": 0.32},
  "hiAmber": {"kind": "unlit", "color": "#FF9F1C"},
  "d4": {"kind": "unlit", "color": "#E2552E", "opacity": 0.9},
  "dopP": {"kind": "std", "color": "#12A88A", "emissive": "#12A88A", "ei": 0.4, "rough": 0.3},
  "dopB": {"kind": "std", "color": "#E2552E", "emissive": "#E2552E", "ei": 0.4, "rough": 0.3},
  "holeW": {"kind": "unlit", "color": "#FFFFFF"},
  "check": {"kind": "unlit", "color": "#14A38B"},
  "zoneNt": {"kind": "unlit", "color": "#14B8A6", "opacity": 0.2}, "zonePt": {"kind": "unlit", "color": "#F05A28", "opacity": 0.2},
})
for k in list(mats): pal[k] = mats[k]["color"]

# ── 場景：高架地板、天花板過濾器格、背牆、遠處機台 ──
BG = "room"
X0, X1, Z0, Z1 = -30, 30, -26, 22
box(BG, X0, X1, -0.3, 0, Z0, Z1, "floorT")
T = 2.4
nx = int((X1 - X0) / T); nz = int((Z1 - Z0) / T)
# 地板格線（細長方條）＋每塊磚中間的多孔區
P(BG, "box", [X1 - X0, 0.012, 0.05], [0, 0.006, 0], "floorG", at=[[0, 0, Z0 + i * T] for i in range(nz + 1)])
P(BG, "box", [0.05, 0.012, Z1 - Z0], [0, 0.006, (Z0 + Z1) / 2], "floorG", at=[[X0 + i * T, 0, -(Z0 + Z1) / 2] for i in range(nx + 1)])
perf = [[X0 + (i + 0.5) * T, 0, Z0 + (j + 0.5) * T] for i in range(nx) for j in range(nz) if (i + j) % 3 == 0]
P(BG, "box", [1.5, 0.008, 1.5], [0, 0.004, 0], "floorP", at=perf)
# 天花板（朝下的面，從上方看不到）：過濾器面板、T 型骨架、燈條
CY = 14.5
P(BG, "plane", [X1 - X0, Z1 - Z0], [0, CY, (Z0 + Z1) / 2], "ceilF", rot=[90, 0, 0])
P(BG, "plane", [X1 - X0, 0.12], [0, CY - 0.01, 0], "ceilG", rot=[90, 0, 0], at=[[0, 0, Z0 + i * T] for i in range(nz + 1)])
P(BG, "plane", [0.12, Z1 - Z0], [0, CY - 0.01, (Z0 + Z1) / 2], "ceilG", rot=[90, 0, 0], at=[[X0 + i * T, 0, -(Z0 + Z1) / 2] for i in range(nx + 1)])
P(BG, "plane", [1.6, 1.6], [0, CY - 0.005, 0], "ceilG", rot=[90, 0, 0], at=[[X0 + (i + 0.5) * T, 0, Z0 + (j + 0.5) * T] for i in range(nx) for j in range(nz) if (i + j) % 2 == 1], r=0.05)
P(BG, "plane", [0.3, Z1 - Z0], [0, CY - 0.02, (Z0 + Z1) / 2], "ceilL", rot=[90, 0, 0], at=[[X0 + (i + 0.5) * T * 3, 0, -(Z0 + Z1) / 2] for i in range(int(nx / 3))])
# 背牆（朝前）＋牆面分格
P(BG, "plane", [X1 - X0, CY], [0, CY / 2, Z0], "wall")
P(BG, "plane", [0.06, CY], [0, CY / 2, Z0 + 0.01], "wallSeam", at=[[X0 + i * 3.0, 0, 0] for i in range(21)])
P(BG, "plane", [X1 - X0, 0.06], [0, 3.0, Z0 + 0.01], "wallSeam")
# 遠處的機台輪廓（被霧淡化）
far = []
for (x, z, w, h, d) in [(-22, -19, 6, 7.5, 4), (-13, -21, 5, 6, 3.5), (-5, -20.5, 7, 8.5, 4), (6, -21, 5, 6.5, 3.5), (15, -19.5, 7, 7.8, 4.5), (24, -18, 5, 6, 4), (-25, 2, 4, 7, 6), (25, 4, 4, 7.5, 7)]:
    box(BG, x - w / 2, x + w / 2, 0, h, z - d / 2, z + d / 2, "farTool")
    if (x, z) == (-5, -20.5):
        box("farHi", x - w / 2 - 0.12, x + w / 2 + 0.12, -0.02, h + 0.12, z - d / 2 - 0.12, z + d / 2 + 0.12, "farHi")
        anchors["farAx"] = {"layer": BG, "p": [x + w / 2, h * 0.8, z + d / 2], "dx": -40, "dy": -150}
    box(BG, x - w / 2 + 0.3, x + w / 2 - 0.3, h * 0.45, h * 0.92, z + d / 2, z + d / 2 + 0.04, "farTool2")
    box(BG, x - w / 2, x + w / 2, 0, 0.5, z + d / 2, z + d / 2 + 0.05, "farDark")
    box(BG, x + w / 2 - 1.2, x + w / 2 - 0.4, h * 0.6, h * 0.75, z + d / 2 + 0.05, z + d / 2 + 0.08, "screen")
# 建築柱
for (x, z) in [(-18, -12), (18, -12)]:
    box(BG, x - 0.7, x + 0.7, 0, CY, z - 0.7, z + 0.7, "wall")

# ── 共用小零件 ──
def screws_z(layer, pts, z, r=0.055):  # 正面（+z）螺絲
    P(layer, "cyl", [r, 0.04], [0, 0, z], "screw", at=[[x, y, 0] for x, y in pts])
def screws_x(layer, pts, x, r=0.055):  # 側面（+x）螺絲
    P(layer, "cyl", [r, 0.04], [x, 0, 0], "screw", rot=[0, 90, 0], at=[[0, y, z] for y, z in pts])
def panel_front(layer, x0, x1, y0, y1, z, cols=2, rows=1, vent=False):
    """+z 面上的分件面板：面板之間有縫、四角螺絲、可加百葉"""
    g = 0.05; w = (x1 - x0) / cols; h = (y1 - y0) / rows; sc = []
    for i in range(cols):
        for j in range(rows):
            a, b, c, d = x0 + i * w + g, x0 + (i + 1) * w - g, y0 + j * h + g, y0 + (j + 1) * h - g
            box(layer, a, b, c, d, z, z + 0.04, "cabPanel")
            sc += [(a + 0.12, c + 0.12), (b - 0.12, c + 0.12), (a + 0.12, d - 0.12), (b - 0.12, d - 0.12)]
            if vent and j == 0:
                P(layer, "box", [b - a - 0.5, 0.04, 0.02], [(a + b) / 2, 0, z + 0.05], "vent", at=[[0, c + 0.35 + k * 0.14, 0] for k in range(5)])
    box(layer, x0, x1, y0, y1, z - 0.02, z + 0.005, "seam")
    screws_z(layer, sc, z + 0.06)
def panel_side(layer, z0, z1, y0, y1, x, cols=2, rows=1, vent=False):
    g = 0.05; w = (z1 - z0) / cols; h = (y1 - y0) / rows; sc = []
    for i in range(cols):
        for j in range(rows):
            a, b, c, d = z0 + i * w + g, z0 + (i + 1) * w - g, y0 + j * h + g, y0 + (j + 1) * h - g
            box(layer, x, x + 0.04, c, d, a, b, "cabPanel")
            sc += [(c + 0.12, a + 0.12), (c + 0.12, b - 0.12), (d - 0.12, a + 0.12), (d - 0.12, b - 0.12)]
            if vent and j == 0:
                P(layer, "box", [0.02, 0.04, b - a - 0.5], [x + 0.05, 0, (a + b) / 2], "vent", at=[[0, c + 0.35 + k * 0.14, 0] for k in range(5)])
    box(layer, x - 0.005, x + 0.02, y0, y1, z0, z1, "seam")
    screws_x(layer, sc, x + 0.06)
def hv_sign(layer, x, y, z, s=0.55, face="z"):
    """高壓警示：黃色菱形＋黑框＋黑色閃電"""
    if face == "z":
        P(layer, "box", [s, s, 0.02], [x, y, z], "hvK", rot=[0, 0, 45])
        P(layer, "box", [s * 0.84, s * 0.84, 0.02], [x, y, z + 0.012], "hvY", rot=[0, 0, 45])
        for (dx, dy, ln, a) in [(0.03, 0.09, 0.26, 70), (-0.01, -0.01, 0.16, 0), (-0.04, -0.11, 0.26, 70)]:
            P(layer, "box", [ln * s / 0.55, 0.045 * s / 0.55, 0.02], [x + dx * s / 0.55, y + dy * s / 0.55, z + 0.024], "hvK", rot=[0, 0, a])
    else:
        P(layer, "box", [0.02, s, s], [x, y, z], "hvK", rot=[45, 0, 0])
        P(layer, "box", [0.02, s * 0.84, s * 0.84], [x + 0.012, y, z], "hvY", rot=[45, 0, 0])
        for (dz, dy, ln, a) in [(-0.03, 0.09, 0.26, 70), (0.01, -0.01, 0.16, 0), (0.04, -0.11, 0.26, 70)]:
            P(layer, "box", [0.02, 0.045 * s / 0.55, ln * s / 0.55], [x + 0.024, y + dy * s / 0.55, z + dz * s / 0.55], "hvK", rot=[a, 0, 0])
def flange_x(layer, x, y, z, ro, ri, t=0.16, n=10):
    P(layer, "tube", [ro, ri, t], [x, y, z], "flange", rot=[0, 90, 0])
    rb = (ro + ri) / 2 + 0.04
    P(layer, "cyl", [0.045, t + 0.08], [x, y, z], "screw", rot=[0, 90, 0], at=[[0, rb * math.cos(2 * math.pi * k / n), rb * math.sin(2 * math.pi * k / n)] for k in range(n)])
def flange_z(layer, x, y, z, ro, ri, t=0.16, n=10):
    P(layer, "tube", [ro, ri, t], [x, y, z], "flange")
    rb = (ro + ri) / 2 + 0.04
    P(layer, "cyl", [0.045, t + 0.08], [x, y, z], "screw", at=[[rb * math.cos(2 * math.pi * k / n), rb * math.sin(2 * math.pi * k / n), 0] for k in range(n)])
def rod(layer, a, b, r, mat, **kw):
    dx, dy, dz = b[0] - a[0], b[1] - a[1], b[2] - a[2]; ln = math.sqrt(dx * dx + dy * dy + dz * dz)
    # 圓柱預設沿 z：先繞 x 轉 rx（抬頭），再繞 y 轉 ry
    ry = math.degrees(math.atan2(dx, dz)); rx = math.degrees(math.atan2(-dy, math.hypot(dx, dz)))
    return P(layer, "cyl", [r, ln], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], mat, rot=[rx, ry, 0], **kw)
def pipe(layer, pts, r, mat="hose"):
    for a, b in zip(pts, pts[1:]): rod(layer, a, b, r, mat)
    for p in pts[1:-1]: P(layer, "sphere", [r * 1.02], p, mat)
def contact(layer, x0, x1, z0, z1):  # 腳下的接觸陰影
    P(layer, "plane", [x1 - x0 + 0.5, z1 - z0 + 0.5], [(x0 + x1) / 2, 0.02, (z0 + z1) / 2], "shadowC", rot=[-90, 0, 0], r=0.4)

YB = 5.0  # 射束高度
M = "tool"
# ── 1. 離子源與高壓端子櫃（左前）──
SX = -7.25  # 引出口
box(M, -11.2, -6.3, 0, 3.7, 1.6, 6.4, "cab"); contact(M, -11.2, -6.3, 1.6, 6.4)
panel_front(M, -11.1, -6.4, 0.25, 3.55, 6.4, cols=3, rows=2, vent=True)
panel_side(M, 1.7, 6.3, 0.25, 3.55, -6.3, cols=2, rows=2, vent=True)
box(M, -11.2, -6.3, 3.7, 3.85, 1.6, 6.4, "cabDark")
hv_sign(M, -8.75, 2.75, 6.47, 0.7)
hv_sign(M, -6.23, 2.75, 4.0, 0.7, face="x")
# 狀態燈列
P(M, "cyl", [0.07, 0.05], [-10.6, 3.3, 6.47], "ledG"); P(M, "cyl", [0.07, 0.05], [-10.35, 3.3, 6.47], "ledB"); P(M, "cyl", [0.07, 0.05], [-10.1, 3.3, 6.47], "ledA")
# 地上的黃黑警戒線（高壓區）
for i in range(26):
    x = -11.6 + i * 0.4
    P(M, "box", [0.2, 0.012, 0.16], [x, 0.012, 6.9], "stripeY" if i % 2 == 0 else "stripeK")
# 高壓籠：四根柱＋上框（壓克力板很淡）
for (x, z) in [(-11.1, 1.7), (-6.4, 1.7), (-11.1, 6.3), (-6.4, 6.3)]:
    box(M, x - 0.08, x + 0.08, 3.85, 7.6, z - 0.08, z + 0.08, "steel2")
box(M, -11.1, -6.4, 7.5, 7.62, 1.62, 1.78, "steel2"); box(M, -11.1, -6.4, 7.5, 7.62, 6.22, 6.38, "steel2")
box(M, -11.18, -11.02, 7.5, 7.62, 1.7, 6.3, "steel2"); box(M, -6.48, -6.32, 7.5, 7.62, 1.7, 6.3, "steel2")
hv_sign(M, -6.4, 6.9, 6.39, 0.42)
# 離子源腔體（看得到裡面的電漿）
box(M, -9.9, -7.6, 3.9, 6.1, 2.9, 3.1, "srcIn")           # 背板
box(M, -9.9, -7.6, 3.9, 4.15, 3.1, 5.1, "steel"); box(M, -9.9, -7.6, 5.85, 6.1, 3.1, 5.1, "steel")  # 底、頂
box(M, -9.9, -9.65, 4.15, 5.85, 3.1, 5.1, "steel"); box(M, -7.85, -7.6, 4.15, 5.85, 3.1, 5.1, "steel")  # 左右
# 前面板＝窗框（中間 1.5×1.1 開窗）＋玻璃
box(M, -9.65, -7.85, 4.15, 4.45, 4.95, 5.1, "steel"); box(M, -9.65, -7.85, 5.55, 5.85, 4.95, 5.1, "steel")
box(M, -9.65, -9.5, 4.45, 5.55, 4.95, 5.1, "steel"); box(M, -8.0, -7.85, 4.45, 5.55, 4.95, 5.1, "steel")
P(M, "plane", [1.5, 1.1], [-8.75, 5.0, 5.12], "glass", r=0.08)
# 腔內：燈絲（螺旋＝三段小線圈）、陽極壁
P(M, "tube", [0.09, 0.06, 0.05], [-9.35, 5.0, 4.0], "filament", rot=[0, 90, 0], at=[[k * 0.07, 0, 0] for k in range(6)], pid="filament")
P(M, "cyl", [0.03, 0.9], [-9.5, 5.0, 3.6], "ceramic", rot=[90, 0, 0])
P("plasma", "box", [1.1, 0.7, 0.9], [-8.7, 5.0, 4.0], "plasma", pid="plasmaCore")
P(M, "tube", [0.85, 0.62, 0.1], [-8.75, 5.0, 5.14], "flange")
screws_z(M, [(-9.75, 4.05), (-7.75, 4.05), (-9.75, 5.95), (-7.75, 5.95)], 5.15)
flange_x(M, -7.55, YB, 4.0, 0.95, 0.35, 0.2, 12)
# 頂上的燈絲饋通、氣體管線
P(M, "cyl", [0.12, 0.5], [-8.75, 6.35, 4.0], "ceramic", rot=[90, 0, 0], at=[[-0.45, 0, 0], [0.45, 0, 0]])
P(M, "cyl", [0.06, 0.25], [-8.75, 6.7, 4.0], "flange", rot=[90, 0, 0], at=[[-0.45, 0, 0], [0.45, 0, 0]])
# 引出區的絕緣罩（很淡的透明殼；電場箭頭在裡面）
box(M, -7.62, -6.86, 4.3, 5.7, 3.3, 4.7, "glassTube")
# ── 1b. 氣瓶櫃（離子源左邊）：兩只鋼瓶 PH₃、BF₃＋瓶頭閥＋壓力表＋不鏽鋼管 ──
GX0, GX1, GZ0, GZ1, GH = -16.2, -12.3, 2.0, 6.0, 7.0
box(M, GX0, GX1, 0, 0.3, GZ0, GZ1, "cabDark"); contact(M, GX0, GX1, GZ0, GZ1)
box(M, GX0, GX0 + 0.12, 0, GH, GZ0, GZ1, "gasCab"); box(M, GX1 - 0.12, GX1, 0, GH, GZ0, GZ1, "gasCab")
box(M, GX0, GX1, 0, GH, GZ0, GZ0 + 0.12, "gasCab"); box(M, GX0, GX1, GH - 0.25, GH, GZ0, GZ1, "gasCab")
box(M, GX0, GX1, GH, GH + 0.08, GZ0, GZ1, "cabDark")
P(M, "cyl", [0.42, 0.1], [GX0 + 1.2, GH + 0.2, GZ0 + 1.0], "duct", rot=[90, 0, 0])  # 排氣口
P(M, "cyl", [0.3, CY - GH], [GX0 + 1.2, (GH + CY) / 2, GZ0 + 1.0], "duct", rot=[90, 0, 0])
# 前門：框＋玻璃（看得到鋼瓶）
for (a, b, c, d) in [(GX0, GX1, 0.3, 0.55), (GX0, GX1, GH - 0.5, GH - 0.25), (GX0, GX0 + 0.25, 0.3, GH - 0.25), (GX1 - 0.25, GX1, 0.3, GH - 0.25), ((GX0 + GX1) / 2 - 0.08, (GX0 + GX1) / 2 + 0.08, 0.3, GH - 0.25)]:
    box(M, a, b, c, d, GZ1 - 0.1, GZ1, "steel2")
P(M, "plane", [GX1 - GX0 - 0.4, GH - 1.0], [(GX0 + GX1) / 2, GH / 2, GZ1 + 0.01], "glass")
P(M, "cyl", [0.05, 0.6], [GX1 - 0.45, GH / 2, GZ1 + 0.08], "steel2", rot=[90, 0, 0], at=[[-(GX1 - GX0) / 2 + 0.3, 0, 0], [0, 0, 0]])  # 門把
hv_sign(M, GX0 + 0.75, GH - 0.95, GZ1 + 0.03, 0.5)
P(M, "box", [1.0, 0.35, 0.02], [GX1 - 1.0, GH - 0.95, GZ1 + 0.03], "hvY")  # 毒氣警示牌（黃底）
P(M, "box", [0.8, 0.06, 0.02], [GX1 - 1.0, GH - 0.95, GZ1 + 0.045], "hvK", at=[[0, -0.08, 0], [0, 0.08, 0]])
GAS = {}
for gi, (gx, gm, gid) in enumerate([(GX0 + 1.0, "cylP", "cylP"), (GX0 + 2.75, "cylB", "cylB")]):
    gz = (GZ0 + GZ1) / 2 + 0.2
    P(M, "cyl", [0.55, 4.0], [gx, 0.3 + 2.0, gz], "cylBody", rot=[90, 0, 0], pid=gid + "Body")
    P(M, "sphere", [0.55], [gx, 4.3, gz], "cylBody", scale=[1, 0.55, 1])
    P(M, "cyl", [0.562, 0.7], [gx, 3.4, gz], gm, rot=[90, 0, 0], pid=gid)            # 色帶（標示氣體種類）
    P(M, "cyl", [0.565, 0.08], [gx, 3.85, gz], "warnW", rot=[90, 0, 0])
    P(M, "cyl", [0.565, 0.12], [gx, 1.0, gz], "steel2", rot=[90, 0, 0])               # 固定帶
    box(M, gx - 0.7, gx + 0.7, 0.95, 1.05, GZ0 + 0.12, gz - 0.5, "steel2")
    P(M, "cyl", [0.16, 0.45], [gx, 4.75, gz], "flange", rot=[90, 0, 0])               # 瓶頭閥
    P(M, "cyl", [0.22, 0.1], [gx, 5.0, gz], "pumpDark", rot=[0, 0, 0], pid=None)      # 手輪
    P(M, "cyl", [0.2, 0.1], [gx + 0.32, 5.25, gz + 0.12], "screw", rot=[0, 0, 0])      # 壓力表
    P(M, "cyl", [0.16, 0.02], [gx + 0.32, 5.25, gz + 0.18], "gauge")
    P(M, "box", [0.02, 0.13, 0.01], [gx + 0.32, 5.29, gz + 0.2], "gaugeN", rot=[0, 0, -30])
    P(M, "cyl", [0.05, 0.4], [gx + 0.16, 5.25, gz], "steel", rot=[0, 90, 0])
    GAS[gid] = (gx, gz)
# 管線：瓶頭閥 → 往上 → 往右穿出櫃子 → 高壓籠 → 進腔體左壁
def vpipe(layer, x, y0, y1, z, r, mat):
    P(layer, "cyl", [r, abs(y1 - y0)], [x, (y0 + y1) / 2, z], mat, rot=[90, 0, 0])
def xpipe(layer, x0, x1, y, z, r, mat):
    P(layer, "cyl", [r, abs(x1 - x0)], [(x0 + x1) / 2, y, z], mat, rot=[0, 90, 0])
def zpipe(layer, x, y, z0, z1, r, mat):
    P(layer, "cyl", [r, abs(z1 - z0)], [x, y, (z0 + z1) / 2], mat)
GPATH = {}
for gid, (yy, zz) in [("cylP", (6.55, 3.6)), ("cylB", (6.25, 4.4))]:
    gx, gz = GAS[gid]
    vpipe(M, gx, 5.0, yy, gz, 0.07, "steel"); P(M, "sphere", [0.075], [gx, yy, gz], "steel")
    if abs(gz - zz) > 0.01:
        zpipe(M, gx, yy, gz, zz, 0.07, "steel"); P(M, "sphere", [0.075], [gx, yy, zz], "steel")
    xpipe(M, gx, -10.2, yy, zz, 0.07, "steel"); P(M, "sphere", [0.075], [-10.2, yy, zz], "steel")
    vpipe(M, -10.2, yy, 5.0, zz, 0.07, "steel"); P(M, "sphere", [0.075], [-10.2, 5.0, zz], "steel")
    xpipe(M, -10.2, -9.65, 5.0, zz, 0.07, "steel")
    P(M, "tube", [0.13, 0.07, 0.12], [-11.6, yy, zz], "flange", rot=[0, 90, 0])   # 接頭環
    P(M, "tube", [0.13, 0.07, 0.12], [gx + 0.9, yy, zz], "flange", rot=[0, 90, 0])
    P(M, "box", [0.24, 0.3, 0.24], [-12.9, yy, zz], "steel2")                      # 氣動閥
    GPATH[gid] = [[gx, 4.9, gz], [gx, yy, gz]] + ([[gx, yy, zz]] if abs(gz - zz) > 0.01 else []) + [[-10.2, yy, zz], [-10.2, 5.0, zz], [-9.65, 5.0, zz]]
anchors["cylP"] = {"layer": M, "p": [GAS["cylP"][0], 3.4, GAS["cylP"][1] + 0.55], "dx": -60, "dy": 150}
anchors["cylB"] = {"layer": M, "p": [GAS["cylB"][0], 3.4, GAS["cylB"][1] + 0.55], "dx": 70, "dy": 190}
anchors["gascab"] = {"layer": M, "p": [GX0 + 0.3, GH - 0.3, GZ1], "dx": -20, "dy": -170}
# 引出電極（兩片帶狹縫的板）
for x in [-7.15, -6.95]:
    box(M, x - 0.03, x + 0.03, 4.25, 4.82, 3.25, 4.75, "steel2"); box(M, x - 0.03, x + 0.03, 5.18, 5.75, 3.25, 4.75, "steel2")
# 燈塔
for k, mt in enumerate(["ledG", "lampOff", "ledR"]):
    P(M if k else "lamp", "cyl", [0.16, 0.26], [-10.7, 4.05 + k * 0.27, 6.0], mt, rot=[90, 0, 0], pid=("lampG" if k == 0 else None))
P(M, "cyl", [0.05, 0.3], [-10.7, 3.95, 6.0], "steel2", rot=[90, 0, 0])

# ── 2. 加速管：分段電極環＋玻璃絕緣段（看得到裡面）──
TX0, TX1, TZ = -6.85, 1.0, 4.0
n_el = 18
for k in range(n_el + 1):
    x = TX0 + (TX1 - TX0) * k / n_el
    P(M, "tube", [0.74 if k % 3 else 0.86, 0.52, 0.07], [x, YB, TZ], f"e{k}", rot=[0, 90, 0], pid=f"ring{k}")
P(M, "tube", [0.6, 0.52, TX1 - TX0], [(TX0 + TX1) / 2, YB, TZ], "glassTube", rot=[0, 90, 0])
# 均壓電阻（外側細桿）與絕緣支柱
for a in [40, 140, 220]:
    r = 0.78
    rod(M, (TX0, YB + r * math.sin(math.radians(a)), TZ + r * math.cos(math.radians(a))), (TX1, YB + r * math.sin(math.radians(a)), TZ + r * math.cos(math.radians(a))), 0.03, "ceramic")
flange_x(M, TX1 + 0.12, YB, TZ, 1.05, 0.45, 0.22, 12)
for x in [-5.2, -1.6]:
    P(M, "cyl", [0.16, YB - 0.9], [x, (YB - 0.9) / 2, TZ], "ceramic", rot=[90, 0, 0])
    P(M, "tube", [0.24, 0.16, 0.08], [x, 0.0, TZ], "steel2", rot=[90, 0, 0], at=[[0, k * 0.5 + 0.6, 0] for k in range(7)])
    box(M, x - 0.5, x + 0.5, 0, 0.15, TZ - 0.5, TZ + 0.5, "steel2")
    box(M, x - 0.55, x + 0.55, YB - 0.95, YB - 0.85, TZ - 0.35, TZ + 0.35, "steel2")
hv_sign(M, -3.4, YB - 1.5, TZ + 0.2, 0.5)
anchors["tube"] = {"layer": M, "p": [-4.6, YB + 0.75, TZ], "dx": -60, "dy": -260}
anchors["src"] = {"layer": M, "p": [-8.75, 6.1, 4.0], "dx": -80, "dy": -160}

# ── 3. 分析磁鐵（90° 轉彎）──
CX, CZ, RR = 1.6, 1.0, 3.0   # 入口 (1.6, 4) 往 +x；出口 (4.6, 1) 往 −z
def apos(r, th):  # 以磁鐵中心為圓心、角度 th（0＝入口）
    return (CX + r * math.sin(th), CZ + r * math.cos(th))
NS = 12
top = "magTop"
for i in range(NS):
    th = (i + 0.5) / NS * math.pi / 2; dg = math.degrees(th)
    def seg(layer, r, rw, y0, y1, mat, extra=1.02):
        x, z = apos(r, th); ln = 2 * r * math.sin(math.pi / 4 / NS) * extra
        P(layer, "box", [ln, y1 - y0, rw], [x, (y0 + y1) / 2, z], mat, rot=[0, dg, 0])
    seg(M, RR, 2.2, 3.35, 4.0, "yoke")         # 下軛
    seg(M, RR, 1.3, 4.0, 4.6, "pole")          # 下磁極
    seg(top, RR, 1.3, 5.4, 6.0, "pole")        # 上磁極
    seg(top, RR, 2.2, 6.0, 6.65, "yoke")       # 上軛
    seg(M, RR + 1.62, 0.36, 3.35, 5.0, "yoke2")  # 外側回路鐵芯（下半）
    seg(top, RR + 1.62, 0.36, 5.0, 6.65, "yoke2")
    for (rc, lay, y0, y1) in [(RR - 0.85, M, 4.0, 4.55), (RR + 0.85, M, 4.0, 4.55), (RR - 0.85, top, 5.45, 6.0), (RR + 0.85, top, 5.45, 6.0)]:
        seg(lay, rc, 0.36, y0, y1, "coil")
        seg(lay, rc, 0.38, y0 + 0.17, y0 + 0.19, "coilLine", 1.0); seg(lay, rc, 0.38, y0 + 0.36, y0 + 0.38, "coilLine", 1.0)
    # 真空飛行腔的內外壁
    seg(M, RR - 0.6, 0.06, 4.6, 5.4, "chamberIn"); seg(M, RR + 0.6, 0.06, 4.6, 5.4, "chamberIn")
    seg(M, RR, 1.26, 4.6, 4.62, "chamberIn")
# 線圈兩端的彎頭（入口、出口外側）
for th, s in [(0, -1), (math.pi / 2, 1)]:
    for (lay, y0, y1) in [(M, 4.0, 4.55), (top, 5.45, 6.0)]:
        for rr_ in [RR - 0.85, RR + 0.85]:
            x, z = apos(rr_, th)
            tx, tz = math.cos(th), -math.sin(th)
            P(lay, "cyl", [0.2, y1 - y0], [x + s * 0.22 * tx, (y0 + y1) / 2, z + s * 0.22 * tz], "coil", rot=[90, 0, 0])
        x0, z0 = apos(RR, th); tx, tz = math.cos(th), -math.sin(th)
        P(lay, "box", [0.36, y1 - y0, 1.7], [x0 + s * 0.4 * tx, (y0 + y1) / 2, z0 + s * 0.4 * tz], "coil", rot=[0, math.degrees(th), 0])
# 上軛的螺絲（沿弧線）
P(top, "cyl", [0.06, 0.04], [0, 6.67, 0], "screw", rot=[90, 0, 0], at=[[*apos(r, (k + 0.5) / 8 * math.pi / 2)[:1], 0, apos(r, (k + 0.5) / 8 * math.pi / 2)[1]] for k in range(8) for r in (RR - 0.9, RR + 0.9)])
# 磁鐵底座
box(M, 0.4, 6.4, 0, 3.35, -0.8, 5.4, "cab"); contact(M, 0.4, 6.4, -0.8, 5.4)
panel_front(M, 0.5, 6.3, 0.25, 3.2, 5.4, cols=3, rows=1, vent=True)
panel_side(M, -0.7, 5.3, 0.25, 3.2, 6.4, cols=3, rows=1)
hv_sign(M, 3.4, 2.4, 5.47, 0.6)
P(M, "cyl", [0.07, 0.05], [5.6, 2.9, 5.47], "ledG"); P(M, "cyl", [0.07, 0.05], [5.85, 2.9, 5.47], "ledA")
# 電源線（磁鐵線圈接到櫃子）
pipe(M, [(apos(RR + 1.8, 0.6)[0], 4.2, apos(RR + 1.8, 0.6)[1]), (5.9, 3.4, 4.6)], 0.09, "pumpDark")
anchors["mag"] = {"layer": M, "p": [apos(RR + 1.6, math.pi / 4)[0], 4.9, apos(RR + 1.6, math.pi / 4)[1]], "dx": 90, "dy": -150}

# ── 4. 射束管線、解析狹縫、掃描板、真空幫浦 ──
BX = 4.6
# 出口到解析狹縫
P(M, "tube", [0.55, 0.45, 0.8], [BX, YB, 0.35], "steel")
flange_z(M, BX, YB, 0.8, 0.85, 0.45)
box(M, BX - 1.0, BX - 0.25, YB - 1.0, YB + 1.0, -0.12, 0.0, "steel2"); box(M, BX + 0.25, BX + 1.0, YB - 1.0, YB + 1.0, -0.12, 0.0, "steel2")
box(M, BX - 0.25, BX + 0.25, YB - 1.0, YB - 0.3, -0.12, 0.0, "steel2"); box(M, BX - 0.25, BX + 0.25, YB + 0.3, YB + 1.0, -0.12, 0.0, "steel2")
flange_z(M, BX, YB, -0.2, 0.85, 0.45)
P(M, "tube", [0.55, 0.45, 1.1], [BX, YB, -0.8], "steel")
flange_z(M, BX, YB, -1.4, 0.9, 0.45, 0.18, 12)
# 掃描段：透明觀察管，裡面兩片掃描板
SZ0, SZ1 = -1.5, -3.6
P(M, "tube", [0.95, 0.88, SZ0 - SZ1], [BX, YB, (SZ0 + SZ1) / 2], "glassTube")
box(M, BX - 0.62, BX - 0.56, YB - 0.55, YB + 0.55, SZ1 + 0.25, SZ0 - 0.25, "flange"); box(M, BX + 0.56, BX + 0.62, YB - 0.55, YB + 0.55, SZ1 + 0.25, SZ0 - 0.25, "flange")
P(M, "cyl", [0.04, 0.9], [BX, YB + 0.9, (SZ0 + SZ1) / 2], "ceramic", rot=[90, 0, 0], at=[[-0.59, 0, 0], [0.59, 0, 0]])
flange_z(M, BX, YB, SZ1 - 0.08, 1.15, 0.45, 0.18, 12)
P(M, "tube", [0.7, 0.55, 0.65], [BX, YB, SZ1 - 0.45], "steel")
# 渦輪幫浦（掛在管線下方）＋前段管路＋乾式幫浦
def turbo(x, y, z):
    P(M, "cyl", [0.5, 1.2], [x, y - 0.6, z], "pump", rot=[90, 0, 0])
    P(M, "tube", [0.62, 0.5, 0.1], [x, y - 0.08, z], "flange", rot=[90, 0, 0])
    P(M, "tube", [0.53, 0.5, 0.04], [x, 0, z], "pumpDark", rot=[90, 0, 0], at=[[0, y - 0.3 - k * 0.18, 0] for k in range(5)])
    P(M, "cyl", [0.3, 0.4], [x, y - 1.4, z], "pumpDark", rot=[90, 0, 0])
    P(M, "cyl", [0.06, 0.05], [x + 0.5, y - 0.7, z], "ledG", rot=[0, 90, 0])
turbo(BX, YB - 0.55, -0.8); P(M, "cyl", [0.3, 0.12], [BX, YB - 0.5, -0.8], "steel2", rot=[90, 0, 0])
pipe(M, [(BX, YB - 2.1, -0.8), (BX, 1.0, -0.8), (BX + 2.0, 1.0, -0.8), (BX + 2.0, 1.0, 1.8), (BX + 2.6, 1.0, 1.8)], 0.12)
box(M, BX + 2.6, BX + 4.4, 0, 1.6, 1.0, 2.6, "pumpDark"); contact(M, BX + 2.6, BX + 4.4, 1.0, 2.6)
P(M, "box", [0.04, 1.1, 1.3], [BX + 4.42, 0.8, 1.8], "vent", at=[[0, 0, 0]])
P(M, "box", [1.6, 0.04, 0.02], [BX + 3.5, 0, 2.62], "vent", at=[[0, 0.3 + k * 0.16, 0] for k in range(7)])
P(M, "cyl", [0.45, 0.9], [BX + 3.5, 1.6 + 0.45, 1.8], "pump", rot=[0, 90, 0])
P(M, "cyl", [0.07, 0.05], [BX + 2.85, 1.35, 2.63], "ledG")
# 管線支架
for z in [-0.8, -2.55]:
    box(M, BX - 0.12, BX + 0.12, 0, YB - 0.9 if z != -0.8 else 1.8, z - 0.12, z + 0.12, "steel2")
box(M, BX - 0.5, BX + 0.5, 0, 0.12, -3.05, -2.05, "steel2")

# ── 5. 終端站（玻璃前牆＋右牆，看得到晶圓）──
EX0, EX1, EY0, EY1, EZ0, EZ1 = 2.3, 6.9, 2.3, 7.8, -8.8, -4.3
box(M, EX0 - 0.3, EX1 + 0.3, 0, EY0, EZ0 - 0.3, EZ1 + 0.3, "cab"); contact(M, EX0 - 0.3, EX1 + 0.3, EZ0 - 0.3, EZ1 + 0.3)
panel_front(M, EX0 - 0.2, EX1 + 0.2, 0.25, EY0 - 0.15, EZ1 + 0.3, cols=2, rows=1, vent=True)
panel_side(M, EZ0 - 0.2, EZ1 + 0.2, 0.25, EY0 - 0.15, EX1 + 0.3, cols=2, rows=1, vent=True)
hv_sign(M, EX1 + 0.32, 1.2, EZ1 - 0.5, 0.55, face="x")
# 框架邊（12 條稜）
fr = 0.14
for (x, z) in [(EX0, EZ0), (EX1, EZ0), (EX0, EZ1), (EX1, EZ1)]:
    box(M, x - fr, x + fr, EY0, EY1, z - fr, z + fr, "steel2")
for y in [EY0, EY1]:
    box(M, EX0, EX1, y - fr, y + fr, EZ0 - fr, EZ0 + fr, "steel2"); box(M, EX0, EX1, y - fr, y + fr, EZ1 - fr, EZ1 + fr, "steel2")
    box(M, EX0 - fr, EX0 + fr, y - fr, y + fr, EZ0, EZ1, "steel2"); box(M, EX1 - fr, EX1 + fr, y - fr, y + fr, EZ0, EZ1, "steel2")
box(M, EX0, EX1, EY1, EY1 + 0.25, EZ0, EZ1, "steel")  # 頂蓋
box(M, EX0 + 0.3, EX1 - 0.3, EY1 + 0.25, EY1 + 0.29, EZ0 + 0.3, EZ1 - 0.3, "seam")
P(M, "cyl", [0.06, 0.04], [0, EY1 + 0.3, 0], "screw", rot=[90, 0, 0], at=[[x, 0, z] for x in (EX0 + 0.2, EX1 - 0.2) for z in (EZ0 + 0.2, (EZ0 + EZ1) / 2, EZ1 - 0.2)])
box(M, EX0, EX0 + 0.1, EY0, EY1, EZ0, EZ1, "steel")      # 左牆（不透明）
box(M, EX0, EX1, EY0, EY1, EZ0, EZ0 + 0.1, "chamberIn")  # 背牆
P(M, "plane", [EX1 - EX0, EY1 - EY0], [(EX0 + EX1) / 2, (EY0 + EY1) / 2, EZ1], "glass")          # 前牆玻璃
P(M, "plane", [EZ1 - EZ0, EY1 - EY0], [EX1, (EY0 + EY1) / 2, (EZ0 + EZ1) / 2], "glass", rot=[0, 90, 0])  # 右牆玻璃
flange_z(M, BX, YB, EZ1 + 0.05, 1.0, 0.45, 0.16, 12)
P(M, "tube", [0.62, 0.5, abs(SZ1 - 0.8 - EZ1)], [BX, YB, (SZ1 - 0.8 + EZ1) / 2], "steel")
turbo(EX0 + 1.0, EY0, EZ0 + 1.0)
# 掃描驅動柱（背牆上）＋晶圓、載台、手臂（一起上下移動）
box(M, BX - 0.3, BX + 0.3, EY0 + 0.1, EY1 - 0.1, EZ0 + 0.1, EZ0 + 0.45, "steel2")
box(M, BX - 0.06, BX + 0.06, EY0 + 0.3, EY1 - 0.3, EZ0 + 0.45, EZ0 + 0.5, "seam")
WZ = -6.75; WR = 1.45; W = "wfr"
P(W, "cyl", [WR + 0.2, 0.22], [BX, YB, WZ - 0.13], "platen", pid="w_platen")
P(W, "box", [0.5, 0.5, abs(EZ0 + 0.5 - (WZ - 0.24))], [BX, YB, (EZ0 + 0.5 + WZ - 0.24) / 2], "steel2", pid="w_arm")
P(W, "cyl", [WR, 0.04], [BX, YB, WZ], "wafer", pid="w_body")
cells = []
st = 0.26; K = int(WR / st) + 1
for i in range(-K, K + 1):
    for j in range(-K, K + 1):
        x, y = i * st, j * st; h = (st - 0.035) / 2
        if all(math.hypot(x + a, y + b) < WR * 0.96 for a in (-h, h) for b in (-h, h)): cells.append([x, y, 0])
P(W, "box", [st - 0.035, st - 0.035, 0.012], [BX, YB, WZ + 0.026], "die", at=cells, pid="w_dies")
P(W, "box", [0.3, 0.06, 0.03], [BX, YB - WR + 0.03, WZ + 0.02], "platen", pid="w_notch")
P("dose", "cyl", [WR * 0.97, 0.006], [BX, YB, WZ + 0.046], "dose", pid="w_dose")
P("spot", "cyl", [0.2, 0.006], [BX, YB, WZ + 0.052], "spot", pid="spot")
P("spot", "tube", [0.34, 0.24, 0.006], [BX, YB, WZ + 0.052], "dose", pid="spotRing")
# 光阻（暗紅，每顆晶粒中間留一條開口）、焦硬光阻、摻雜區、灰塵
DW = st - 0.035; OPN = 0.075; RW = (DW - OPN) / 2
res = [[c[0] + sgn * (OPN / 2 + RW / 2), c[1], 0] for c in cells for sgn in (-1, 1)]
P("resist", "box", [RW, DW, 0.008], [BX, YB, WZ + 0.036], "resist", at=res, pid="w_res")
P("rhard", "box", [RW, DW, 0.008], [BX, YB, WZ + 0.038], "resistHard", at=res, pid="w_rhard")
crk = [[c[0] + sgn * (OPN / 2 + RW / 2) + (rnd.random() - 0.5) * 0.03, c[1] + (rnd.random() - 0.5) * 0.08, 0] for c in cells for sgn in (-1, 1) if rnd.random() < 0.55]
P("rhard", "box", [0.012, DW * 0.7, 0.004], [BX, YB, WZ + 0.044], "crack", at=crk, rot=[0, 0, 18], pid="w_crack")
colN = [[c[0], c[1], 0] for c in cells if round(c[0] / st) % 2 == 0]; colP = [[c[0], c[1], 0] for c in cells if round(c[0] / st) % 2 != 0]
P("zone", "box", [OPN, DW, 0.006], [BX, YB, WZ + 0.034], "zoneN", at=colN, pid="w_zoneN")
P("zone", "box", [OPN, DW, 0.006], [BX, YB, WZ + 0.034], "zoneP", at=colP, pid="w_zoneP")
dust = []
while len(dust) < 34:
    x, y = (rnd.random() * 2 - 1) * WR, (rnd.random() * 2 - 1) * WR
    if math.hypot(x, y) < WR * 0.92: dust.append([x, y, 0])
P("dust", "sphere", [0.028], [BX, YB, WZ + 0.05], "dust", at=dust, pid="w_dust")
WPARTS = ["w_platen", "w_arm", "w_body", "w_dies", "w_notch", "w_dose", "w_res"]
# 放大鏡：晶圓上的方框（2×2 顆晶粒）＋金屬圈＋鏡片＋握把
SQX, SQY, SQ = BX + 2 * st, YB + 1.5 * st, 2 * st
for (dx, dy, w, h) in [(0, SQ / 2, SQ + 0.04, 0.035), (0, -SQ / 2, SQ + 0.04, 0.035), (-SQ / 2, 0, 0.035, SQ), (SQ / 2, 0, 0.035, SQ)]:
    P("magSq", "box", [w, h, 0.012], [SQX + dx, SQY + dy, WZ + 0.06], "insetFrame")
P("magRing", "tube", [0.5, 0.42, 0.09], [SQX, SQY, WZ + 0.55], "lensRing")
P("magRing", "cyl", [0.43, 0.012], [SQX, SQY, WZ + 0.55], "lens")
P("magRing", "box", [0.1, 0.18, 0.012], [SQX - 0.2, SQY + 0.24, WZ + 0.562], "warnW", rot=[0, 0, 40])  # 鏡片反光
rod("magRing", (SQX + 0.36, SQY - 0.36, WZ + 0.55), (SQX + 0.95, SQY - 0.95, WZ + 0.55), 0.06, "lensRing")
anchors["resist"] = {"layer": "resist", "p": [BX - 0.6, YB + 0.7, WZ + 0.04], "dx": -170, "dy": -150}
anchors["zone"] = {"layer": "zone", "p": [BX - 0.5, YB - 0.4, WZ + 0.04], "dx": -170, "dy": 120}
anchors["rhard"] = {"layer": "rhard", "p": [BX + 0.6, YB + 0.6, WZ + 0.04], "dx": 150, "dy": -150}
anchors["wafer"] = {"layer": W, "p": [BX + 0.9, YB + 0.6, WZ], "dx": 140, "dy": -120}
anchors["end"] = {"layer": M, "p": [EX1, EY1 - 0.4, EZ1], "dx": 90, "dy": -120}
anchors["endTop"] = {"layer": M, "p": [(EX0 + EX1) / 2, EY1 + 0.25, (EZ0 + EZ1) / 2], "dx": 60, "dy": -170}
# 控制台（右前）
box(M, 8.3, 9.9, 0, 4.2, -3.4, -2.2, "cab"); contact(M, 8.3, 9.9, -3.4, -2.2)
box(M, 8.45, 9.75, 2.6, 3.9, -2.2, -2.16, "cabDark"); box(M, 8.55, 9.65, 2.7, 3.8, -2.16, -2.14, "screen")
P(M, "box", [0.7, 0.06, 0.01], [8.9, 0, -2.13], "screenUI", at=[[0, 3.6 - k * 0.2, 0] for k in range(5)])
P(M, "cyl", [0.07, 0.05], [8.6, 2.3, -2.17], "ledG"); P(M, "cyl", [0.07, 0.05], [8.85, 2.3, -2.17], "ledB")
panel_front(M, 8.35, 9.85, 0.25, 2.05, -2.2, cols=1, rows=2)
# 背面設備櫃（氣體櫃、電源櫃）＋排氣管到天花板
box(M, -11.5, 1.8, 0, 8.6, -9.6, -6.6, "cab"); contact(M, -11.5, 1.8, -9.6, -6.6)
panel_front(M, -11.4, 1.7, 0.3, 8.4, -6.6, cols=6, rows=3, vent=True)
box(M, -11.5, 1.8, 8.6, 8.8, -9.6, -6.6, "cabDark")
for i, x in enumerate([-10.6, -8.4, -6.2, -4.0, -1.8, 0.4]):
    P(M, "cyl", [0.07, 0.05], [x, 7.9, -6.53], "ledG" if i % 3 else "ledB")
hv_sign(M, -5.2, 6.4, -6.52, 0.6)
for x in [-9.5, -3.5]:
    P(M, "cyl", [0.42, CY - 8.8], [x, (8.8 + CY) / 2, -8.1], "duct", rot=[90, 0, 0])
    P(M, "tube", [0.5, 0.42, 0.12], [x, 0, -8.1], "flange", rot=[90, 0, 0], at=[[0, 9.6, 0], [0, 12.0, 0]])
P(M, "cyl", [0.3, CY - EY1 - 0.3], [EX1 - 0.6, (EY1 + 0.3 + CY) / 2, EZ0 + 0.6], "duct", rot=[90, 0, 0])
P(M, "tube", [0.38, 0.3, 0.1], [EX1 - 0.6, EY1 + 1.2, EZ0 + 0.6], "flange", rot=[90, 0, 0])


anchors["plasma"] = {"layer": M, "p": [-8.75, 5.55, 5.1], "dx": -80, "dy": -170}
anchors["extract"] = {"layer": M, "p": [-7.05, 5.75, 4.7], "dx": 110, "dy": -200}

# ── 6. 晶圓剖面放大（放在終端站右邊、跟晶圓同高；用放大鏡方框＋四條引線連回晶圓）──
YAW_END = -0.72
RY = -YAW_END  # 剖面板面向鏡頭
SC = (BX + 5.3, 7.0, -6.3); BW, BH, BD = 4.4, 2.7, 0.6
def lp(x, y, z):  # 剖面的區域座標 → 模型座標（繞 y 轉 RY）
    c, s = math.cos(RY), math.sin(RY)
    return (SC[0] + x * c + z * s, SC[1] + y, SC[2] - x * s + z * c)
SEC = "sec"
dg = math.degrees(RY)
P(SEC, "box", [BW, BH, BD], lp(0, 0, 0), "si", rot=[0, dg, 0])
P(SEC, "plane", [BW - 0.02, BH - 0.02], lp(0, 0, BD / 2 + 0.005), "siFace", rot=[0, dg, 0])
P(SEC, "plane", [BW, 0.1], lp(0, BH / 2 - 0.05, BD / 2 + 0.008), "oxideTop", rot=[0, dg, 0])
NLX, NLY = 16, 9
def latp(i, j, dz=0.012): return list(lp(-BW / 2 + 0.25 + i * (BW - 0.5) / (NLX - 1), -BH / 2 + 0.22 + j * (BH - 0.5) / (NLY - 1), BD / 2 + dz))
# 矽晶格：原子＋鍵（橫、直細條）
P(SEC, "sphere", [0.045], [0, 0, 0], "lattice", at=[latp(i, j) for i in range(NLX) for j in range(NLY)])
gx_, gy_ = (BW - 0.5) / (NLX - 1), (BH - 0.5) / (NLY - 1)
P(SEC, "box", [gx_, 0.012, 0.01], [0, 0, 0], "lattice", rot=[0, dg, 0], at=[list(lp(-BW / 2 + 0.25 + (i + 0.5) * gx_, -BH / 2 + 0.22 + j * gy_, BD / 2 + 0.01)) for i in range(NLX - 1) for j in range(NLY)])
P(SEC, "box", [0.012, gy_, 0.01], [0, 0, 0], "lattice", rot=[0, dg, 0], at=[list(lp(-BW / 2 + 0.25 + i * gx_, -BH / 2 + 0.22 + (j + 0.5) * gy_, BD / 2 + 0.01)) for i in range(NLX) for j in range(NLY - 1)])
fz = BD / 2 + 0.02
for (x, y, w, h) in [(0, BH / 2 + 0.05, BW + 0.2, 0.1), (0, -BH / 2 - 0.05, BW + 0.2, 0.1), (-BW / 2 - 0.05, 0, 0.1, BH), (BW / 2 + 0.05, 0, 0.1, BH)]:
    P(SEC, "box", [w, h, 0.06], lp(x, y, fz), "insetFrame", rot=[0, dg, 0])
# 深度尺：左側刻度＋停止深度虛線
RP = 0.7
ytop = BH / 2 - 0.1
for k in range(7):
    P(SEC, "box", [0.18 if k % 3 == 0 else 0.1, 0.025, 0.02], lp(-BW / 2 + 0.12, ytop - k * 0.3, BD / 2 + 0.03), "hvK", rot=[0, dg, 0])
P(SEC, "box", [0.025, 1.8, 0.02], lp(-BW / 2 + 0.06, ytop - 0.9, BD / 2 + 0.03), "hvK", rot=[0, dg, 0])
P("secRp", "box", [0.16, 0.03, 0.02], [0, 0, 0], "rp", rot=[0, dg, 0], at=[list(lp(-BW / 2 + 0.45 + k * 0.3, ytop - RP, BD / 2 + 0.04)) for k in range(13)])
band = [("d1", 0.40, 0.50), ("d2", 0.50, 0.61), ("d3", 0.61, 0.79), ("d2", 0.79, 0.90), ("d1", 0.90, 1.0)]
for i, (mt, a, b) in enumerate(band):
    P("secBand", "plane", [BW - 0.12, b - a], lp(0.03, ytop - (a + b) / 2, BD / 2 + 0.016 + i * 0.0005), mt, rot=[0, dg, 0])
# 劑量加大：中間那層變濃（d4 疊上去）
P("secBand2", "plane", [BW - 0.12, 0.2], lp(0.03, ytop - RP, BD / 2 + 0.019), "d4", rot=[0, dg, 0])
anchors["magTop"] = {"layer": top, "p": list((lambda q: (q[0], 6.65, q[1]))(apos(RR, math.pi / 4))), "dx": 120, "dy": -120}
anchors["flight"] = {"layer": M, "p": list((lambda q: (q[0], 5.0, q[1]))(apos(RR + 0.6, math.pi * 0.3))), "dx": 130, "dy": 110}
anchors["sec"] = {"layer": SEC, "p": list(lp(BW / 2, BH / 2, BD / 2)), "dx": 40, "dy": -150}
anchors["secBand"] = {"layer": "secBand", "p": list(lp(BW / 2, ytop - RP, BD / 2)), "dx": 60, "dy": 140}
# 放大鏡引線：晶圓上方框四角 → 剖面卡四角
for (sx, sy, cx_, cy_) in [(-1, 1, -1, 1), (1, 1, 1, 1), (-1, -1, -1, -1), (1, -1, 1, -1)]:
    rod("magLine", (SQX + sx * SQ / 2, SQY + sy * SQ / 2, WZ + 0.07), lp(cx_ * (BW / 2 + 0.1), cy_ * (BH / 2 + 0.1), BD / 2), 0.022, "insetFrame")
# s2：磷（多一顆電子）、硼（留下電洞）示範
PI_, PJ = 4, 5; BI, BJ = 11, 5
pP, pB = latp(PI_, PJ, 0.03), latp(BI, BJ, 0.03)
P("s2P", "sphere", [0.12], pP, "dopP")
P("s2Pe", "sphere", [0.06], [pP[0] + 0.24 * math.cos(RY), pP[1] + 0.1, pP[2] - 0.24 * math.sin(RY)], "elec", pid="s2e")
P("s2B", "sphere", [0.12], pB, "dopB")
hb = latp(BI + 1, BJ, 0.03)
P("s2Bh", "tube", [0.11, 0.075, 0.02], hb, "holeW", rot=[0, dg, 0], pid="s2hole")
P("s2N", "plane", [BW / 2 - 0.2, BH - 0.3], lp(-BW / 4, 0, BD / 2 + 0.014), "zoneNt", rot=[0, dg, 0])
P("s2Pz", "plane", [BW / 2 - 0.2, BH - 0.3], lp(BW / 4, 0, BD / 2 + 0.014), "zonePt", rot=[0, dg, 0])
anchors["s2P"] = {"layer": "s2P", "p": pP, "dx": -120, "dy": -170}
anchors["s2B"] = {"layer": "s2B", "p": pB, "dx": 110, "dy": -170}

# ── 7. 射束（淡淡的光束：加速管、磁鐵弧線、管線、掃描扇形）──
BM = "beamL"
rod(BM, (SX, YB, TZ), (CX, YB, TZ), 0.07, "beam")
for i in range(NS):
    a0, a1 = i / NS * math.pi / 2, (i + 1) / NS * math.pi / 2
    p0, p1 = apos(RR, a0), apos(RR, a1)
    rod(BM, (p0[0], YB, p0[1]), (p1[0], YB, p1[1]), 0.07, "beam")
rod(BM, (BX, YB, CZ), (BX, YB, (SZ0 + SZ1) / 2), 0.07, "beam")
PIV = [BX, YB, (SZ0 + SZ1) / 2]
LF = abs(WZ - PIV[2])
rod("fan", tuple(PIV), (BX, YB, WZ + 0.05), 0.05, "beam", pid="fanRod")

# ── 8. 離子：帶「＋」的小球＋三顆拖尾（延遲 2/4/6 幀，越快拖越長）──
F_SWEEP, F_MOVE = cf("s7", "sweep"), cf("s7", "move")
SCAN_F, SCAN_A = 1.1, LF * math.sin(math.radians(15))
shifts = []
def S(**kw): shifts.append(kw)
def add_ion(n, kind, f0, path_fn, big=1.0):
    r = {"ok": 0.2, "heavy": 0.25, "light": 0.15}[kind] * big
    mc = {"ok": "ion", "heavy": "ionHeavy", "light": "ionLight"}[kind]
    tm = {"ok": ["tr1", "tr2", "tr3"], "heavy": ["trH1", "trH2", "trH3"], "light": ["trL1", "trL2", "trL3"]}[kind]
    segs, end_f, hit = path_fn()
    for j in range(4):
        lid = f"i{n}" + ("" if j == 0 else f"t{j}")
        d = 2 * j
        if j == 0:
            P(lid, "sphere", [r], [SX, YB, TZ], mc)
            P(lid, "box", [r * 1.3, r * 0.32, r * 2.2], [SX, YB, TZ], "plus")
            P(lid, "box", [r * 0.32, r * 1.3, r * 2.2], [SX, YB, TZ], "plus")
        else:
            P(lid, "sphere", [r * (0.95 - 0.18 * j)], [SX, YB, TZ], tm[j - 1])
        S(layer=lid, at="s1:start-60", until=A(f0 + d), opacity=0, dur=1)
        t = f0 + d
        for (k, du, dx, dy, dz) in segs:
            sh = {"layer": lid, "at": A(t), "dur": R2(du), "dx": R2(dx), "dy": R2(dy), "dz": R2(dz)}
            if k == "acc": sh.update(fallOut=True, bounce=0)
            else: sh.update(throw=0)
            shifts.append(sh); t += du
        S(layer=lid, at=A(end_f + d), opacity=0, dur=2)
    return hit
TA = 54; DA = CX - SX; V = 2 * DA / TA
def lin(p0, p1):
    dx, dz = p1[0] - p0[0], p1[1] - p0[1]; return ("lin", math.hypot(dx, dz) / V, dx, 0, dz)
def path_ok(f0):
    def fn():
        segs = [("acc", TA, DA, 0, 0)]
        pts = [apos(RR, i / NS * math.pi / 2) for i in range(NS + 1)]
        segs += [lin(a, b) for a, b in zip(pts, pts[1:])]
        segs.append(lin((BX, CZ), (BX, PIV[2])))
        t_arr = f0 + TA + sum(s[1] for s in segs[1:]) + LF / V
        xo = SCAN_A * math.sin(2 * math.pi * SCAN_F * (t_arr - F_SWEEP) / FPS) if F_SWEEP + 4 <= t_arr <= cf("s7", "end") + 20 else 0.0
        segs.append(("lin", math.hypot(LF, xo) / V, xo, 0, WZ + 0.06 - PIV[2]))
        end = f0 + sum(s[1] for s in segs)
        return segs, end, None
    return fn
def path_bad(f0, rad, inner):
    def fn():
        segs = [("acc", TA, DA, 0, 0)]
        wall = (RR - 0.6 + 0.1) if inner else (RR + 0.6 - 0.12)
        cz = 4.0 - rad; ph, step = 0.0, math.radians(3)
        pts = [(CX, 4.0)]
        while ph < math.pi / 2:
            ph += step
            p = (CX + rad * math.sin(ph), cz + rad * math.cos(ph))
            dd = math.hypot(p[0] - CX, p[1] - CZ)
            pts.append(p)
            if (inner and dd <= wall) or ((not inner) and dd >= wall): break
        keep = pts[::3] + ([pts[-1]] if (len(pts) - 1) % 3 else [])
        segs += [lin(a, b) for a, b in zip(keep, keep[1:])]
        end = f0 + sum(s[1] for s in segs)
        hp = keep[-1]; nrm = ((hp[0] - CX), (hp[1] - CZ)); ln = math.hypot(*nrm); nrm = (nrm[0] / ln, nrm[1] / ln)
        return segs, end, (hp, nrm if not inner else (-nrm[0], -nrm[1]), end)
    return fn
ions = []
n = 0
MIX0, MIX1 = cf("s6", "all") - TA, cf("s6", "pass") - TA - 6   # 在磁鐵入口出現混合離子的時段（換算成發射幀）
def launch(f0, big=1.0, allow_bad=True):
    global n
    kind = "ok"
    if allow_bad and MIX0 <= f0 <= MIX1 and n % 3 != 0: kind = "heavy" if (n // 3 + n) % 2 == 0 else "light"
    fn = path_ok(f0) if kind == "ok" else path_bad(f0, 5.6 if kind == "heavy" else 1.85, kind == "light")
    ions.append((n, kind, f0, add_ion(n, kind, f0, fn, big))); n += 1
# s1：開場就有稀疏的離子在跑（遠景放大 2 倍）；念到「打進去」密集發射
for f0 in range(-70, cf("s1", "shoot") - 10, 16): launch(f0, 2.0, False)
for f0 in range(cf("s1", "shoot") - 2, cf("s1", "end") - 10, 6): launch(f0, 2.0, False)
# s3：念「一路飛過」時，四顆大離子沿整條射束線走一趟
for f0 in range(cf("s3", "line") - 6, cf("s3", "line") + 24, 8): launch(f0, 2.0, False)
# s4 引出 → s5 加速 → s6 篩選（混合）→ s7 掃描
for f0 in range(cf("s4", "pull") - 4, cf("s7", "end") - 88, 7): launch(f0, 1.0, True)
# 撞壁火花
runs = []
for (nn, kind, f0, hit) in ions:
    if not hit: continue
    (hx, hz), (nx_, nz_), fe = hit
    lid = f"spk{nn}"
    P(lid, "sphere", [0.09], [hx, YB, hz], "sparkW")
    for a in range(4):
        P(lid, "box", [0.42, 0.035, 0.035], [hx, YB, hz], "spark", rot=[0, a * 45, 0])
    P(lid, "box", [0.035, 0.36, 0.035], [hx, YB, hz], "spark")
    S(layer=lid, at="s1:start-60", until=A(fe), opacity=0, dur=1)
    S(layer=lid, at=A(fe + 3), opacity=0, dur=7)
    acts[f"wv{nn}"] = {"type": "wave", "layer": M, "from": [R2(hx), YB, R2(hz)], "dir": [R2(nx_), 0, R2(nz_)], "reach": 0.5, "count": 2, "r0": 0.05, "spread": 0.7, "rate": 2.2, "color": "spark"}
    runs.append({"id": f"wv{nn}", "at": A(fe), "until": A(fe + 10), "ramp": 3})

# ── 剖面裡的離子：從上方打進矽，越走越慢（指數衰減），停在 RP 附近 ──
def sec_ion(lid0, x, dep, fe, r=0.11):
    for j in range(3):
        lid = lid0 + ("" if j == 0 else f"t{j}")
        p = lp(x, ytop - dep, BD / 2 + 0.07)
        if j == 0:
            P(lid, "sphere", [r], p, "ion")
            P(lid, "box", [r * 1.25, r * 0.3, 0.2], p, "plus", rot=[0, dg, 0]); P(lid, "box", [r * 0.3, r * 1.25, 0.2], p, "plus", rot=[0, dg, 0])
        else:
            P(lid, "sphere", [r * (1 - 0.25 * j)], p, "tr1" if j == 1 else "tr2")
        S(layer=lid, at="s1:start-60", until=A(fe + 2 * j), opacity=0, dur=1)
        S(layer=lid, at="s1:start-60", until=A(fe + 2 * j), dy=R2(dep + 1.5), dur=1, spring={"tau": 6, "period": 600})
        if j: S(layer=lid, at=A(fe + 26), opacity=0, dur=8)
        S(layer=lid, at=C("s9", "start", -4), opacity=0, dur=6)
F_IN = cf("s8", "in")
for k in range(22):
    x = -BW / 2 + 0.55 + (k * 0.618 % 1) * (BW - 1.1)
    dep = RP + (rnd.random() + rnd.random() + rnd.random() - 1.5) * 0.17
    sec_ion(f"si{k}", x, dep, F_IN + k * 2)
# 能量加大：再打一批，停得更深（DEEP）
DEEP = 0.32
for k in range(12):
    x = -BW / 2 + 0.55 + ((k + 0.31) * 0.618 % 1) * (BW - 1.1)
    dep = RP + DEEP + (rnd.random() + rnd.random() + rnd.random() - 1.5) * 0.17
    sec_ion(f"sj{k}", x, dep, cf("s8", "energy") + 4 + k * 2, 0.12)
# 撞擊閃光（離子一路撞晶格）
for k in range(10):
    x = -BW / 2 + 0.6 + (k * 0.37 % 1) * (BW - 1.2); y = ytop - 0.15 - (k * 0.53 % 1) * 0.5
    lid = f"sf{k}"; P(lid, "sphere", [0.07], lp(x, y, BD / 2 + 0.09), "sparkW")
    for a in (45, 135): P(lid, "box", [0.24, 0.025, 0.02], lp(x, y, BD / 2 + 0.09), "spark", rot=[0, dg, a])
    f1 = cf("s8", "slow") + k * 3
    S(layer=lid, at="s1:start-60", until=A(f1), opacity=0, dur=1); S(layer=lid, at=A(f1 + 3), opacity=0, dur=5)

# ── 動作 ──
acts["plasmaGlow"] = {"type": "pulse", "parts": ["plasmaCore"], "color": "plasma", "freq": 3, "glow": 0.9, "halo": 1.6}
acts["filament"] = {"type": "pulse", "parts": ["filament"], "color": "filament", "steady": True, "glow": 1, "halo": 0.5}
acts["lampOn"] = {"type": "pulse", "parts": ["lampG"], "color": "ledG", "steady": True, "glow": 0.9, "halo": 0}
acts["waferScan"] = {"type": "vibrate", "parts": WPARTS, "axis": [0, 1, 0], "amp": 0.55, "freq": 0.3}
acts["spotX"] = {"type": "vibrate", "parts": ["spot", "spotRing"], "axis": [1, 0, 0], "amp": R2(SCAN_A), "freq": SCAN_F}
acts["fanSwing"] = {"type": "rotate", "parts": ["fanRod"], "axis": [0, 1, 0], "pivot": PIV, "swing": -15, "freq": SCAN_F}
acts["spotGlow"] = {"type": "pulse", "parts": ["spot"], "color": "spot", "steady": True, "glow": 1, "halo": 0.9}
for k in range(19):
    acts[f"ring{k}"] = {"type": "pulse", "parts": [f"ring{k}"], "color": "ringHi", "steady": True, "glow": 0.12 + 0.3 * k / 18, "halo": 0.15 + 0.3 * k / 18}
acts["cylPOn"] = {"type": "pulse", "parts": ["cylP"], "color": "cylP", "freq": 1.4, "glow": 0.9, "halo": 0.9}
acts["cylBOn"] = {"type": "pulse", "parts": ["cylB"], "color": "cylB", "freq": 1.4, "glow": 0.9, "halo": 0.9}
acts["s2eSpin"] = {"type": "rotate", "parts": ["s2e"], "axis": [R2(math.sin(RY)), 0, R2(math.cos(RY))], "pivot": [R2(v) for v in pP], "rps": 0.8}
acts["s2holeP"] = {"type": "pulse", "parts": ["s2hole"], "color": "holeW", "freq": 1.6, "glow": 1, "halo": 0.6}
def flowx(key, path, shape="dot", n=4, size=0.12, rate=0.6, color="molP", rim="molPR", lanes=1, gap=0.2, ldir=(1, 0, 0), rimO=0.8, jitter=0):
    acts[key] = {"type": "flow", "layer": M, "path": [[R2(v) for v in p] for p in path], "n": n, "lanes": lanes, "laneGap": gap, "laneDir": list(ldir), "size": size, "shape": shape,
                 "rate": rate, "color": color, "rim": rim, "rimScale": 1.5, "rimO": rimO, "trail": 0, "trailGap": 0.03, "trailColor": color, "track": False}
    if jitter: acts[key]["jitter"] = jitter
flowx("molP", GPATH["cylP"] + [[-9.2, 5.0, 3.6]], "mol", n=7, size=0.14, rate=0.28, color="molP", rim="molPR")
flowx("molB", GPATH["cylB"] + [[-9.2, 5.0, 4.4]], "mol", n=7, size=0.14, rate=0.28, color="molB", rim="molBR")
hel = [[-9.45 + 1.3 * t / 40, 5.0 + 0.32 * math.sin(t * 0.9), 4.0 + 0.32 * math.cos(t * 0.9)] for t in range(41)]
flowx("elec", hel, "dot", n=9, size=0.05, rate=0.55, color="elec", rim="elecR", rimO=0.9)
flowx("field", [[-7.55, YB, TZ], [-6.9, YB, TZ]], "arrow", n=3, size=0.12, rate=0.9, color="field", rim="field", lanes=3, gap=0.28, ldir=(0, 1, 0))
fl = [[BX + 0.4, YB + 0.9, WZ + 0.12], [BX + 0.55, YB + 0.2, WZ + 0.35], [BX + 0.75, YB - 0.9, WZ + 0.55], [BX + 0.9, YB - 2.2, WZ + 0.7]]
flowx("flakes", fl, "flake", n=6, size=0.04, rate=0.35, color="flake", rim="flakeR", lanes=3, gap=0.5, ldir=(1, 0, 0))

F = lambda sid, cue="start", d=0: C(sid, cue, d)
first_hit = cf("s1", "start")
runs += [
  {"id": "lampOn", "at": "s1:start-30", "ramp": 1},
  {"id": "plasmaGlow", "at": "s1:start-30", "ramp": 1},
  {"id": "filament", "at": F("s4", "plasma", -6), "until": F("s5", "start", 10), "ramp": 8},
  {"id": "molP", "at": F("s4", "gas", -2), "until": F("s5", "start"), "ramp": 8},
  {"id": "molB", "at": F("s4", "gas", 6), "until": F("s5", "start"), "ramp": 8},
  {"id": "elec", "at": F("s4", "plasma", -2), "until": F("s5", "start", 10), "ramp": 8},
  {"id": "cylPOn", "at": F("s4", "ph3", -2), "until": F("s4", "bf3", -4), "ramp": 4},
  {"id": "cylBOn", "at": F("s4", "bf3", -2), "until": F("s4", "pull", -4), "ramp": 4},
  {"id": "field", "at": F("s4", "pull", -4), "until": F("s5", "fast"), "ramp": 6},
  {"id": "waferScan", "at": F("s7", "move", -2), "until": F("s7", "end", 6), "ramp": 14},
  {"id": "spotX", "at": F("s7", "sweep", -4), "until": F("s7", "end", 10), "ramp": 4},
  {"id": "fanSwing", "at": F("s7", "sweep", -4), "until": F("s7", "end", 10), "ramp": 4},
  {"id": "spotGlow", "at": F("s7", "enter", -2), "until": F("s7", "end", 12), "ramp": 6},
  {"id": "s2eSpin", "at": F("s2", "ph", 12), "until": F("s3", "start"), "ramp": 6},
  {"id": "s2holeP", "at": F("s2", "hole", -2), "until": F("s3", "start"), "ramp": 4},
  {"id": "flakes", "at": F("s10", "hard", 10), "until": F("s11", "start", 30), "ramp": 10},
]
for k in range(19):
    runs.append({"id": f"ring{k}", "at": F("s5", "ring", 2 + k * 2), "until": F("s6", "start", 4), "ramp": 4})

# 顯示／隱藏
HIDE = "s1:start-60"
def hid(layer, a, b, dur=6, **kw): S(layer=layer, at=a, until=b, opacity=0, dur=dur, **kw)
FAR_ = F("s11", "start", 400)
hid(BM, HIDE, F("s1", "start", -40), 2)                           # 光束一開始就在
hid("fan", HIDE, F("s7", "sweep", -4), 6); hid("spot", HIDE, F("s7", "enter", -2), 6)
hid("dose", HIDE, F("s7", "sweep"), 70)                          # 掃過處漸漸變橘
hid("dose", F("s10", "zone", -6), FAR_, 10)
S(layer="resist", at=HIDE, until=F("s3", "mask", 2), dz=0.4, opacity=0, dur=8, fallIn=True, bounce=0.05)  # 光阻：念到「光阻」才從前面落到表面
hid("rhard", HIDE, F("s10", "hard", -2), 18)
hid("zone", HIDE, F("s10", "zone", -2), 14)
hid("dust", HIDE, F("s10", "dirty", -2), 8)
hid("farHi", HIDE, F("s9", "ax", -2), 4); hid("farHi", F("s9", "gas", -4), FAR_, 6)
# 放大鏡、方框、引線、剖面：s2 與 s8 才出現
for lay, d0 in [("magSq", 0), ("magRing", 4), ("magLine", 8), (SEC, 10)]:
    hid(lay, HIDE, F("s2", "start", d0), 8); hid(lay, F("s3", "start", -2), F("s8", "start", d0), 8); hid(lay, F("s9", "start", -4), FAR_, 6)
S(layer="magRing", at=HIDE, until=F("s2", "start", 4), dz=1.2, dur=10, fallIn=True, bounce=0.06)
S(layer="magRing", at=F("s3", "start", -2), until=F("s8", "start", 4), dz=1.2, dur=10, fallIn=True, bounce=0.06)
for lay, a, b in [("s2P", F("s2", "ph", -2), F("s3", "start", -4)), ("s2Pe", F("s2", "ph", 10), F("s3", "start", -4)), ("s2B", F("s2", "bo", -2), F("s3", "start", -4)), ("s2Bh", F("s2", "hole", -4), F("s3", "start", -4)),
                  ("s2N", F("s2", "ntype", -2), F("s3", "start", -4)), ("s2Pz", F("s2", "ptype", -2), F("s3", "start", -4))]:
    hid(lay, HIDE, a, 6); hid(lay, b, FAR_, 6)
S(layer="s2P", at=HIDE, until=F("s2", "ph", -2), dy=1.4, dur=12, fallIn=True, bounce=0.08)
S(layer="s2B", at=HIDE, until=F("s2", "bo", -2), dy=1.4, dur=12, fallIn=True, bounce=0.08)
hid("secRp", HIDE, F("s8", "stop", -2), 8); hid("secRp", F("s9", "start", -4), FAR_, 6)
hid("secBand", HIDE, F("s8", "stop", 2), 30); hid("secBand", F("s9", "start", -4), FAR_, 6)
hid("secBand2", HIDE, F("s8", "dose", 2), 30); hid("secBand2", F("s9", "start", -4), FAR_, 6)
# 能量加大 → 停止深度虛線與摻雜區一起往下移
for lay in ["secRp", "secBand", "secBand2"]:
    S(layer=lay, at=F("s8", "energy", 6), until=FAR_, dy=-DEEP, dur=24)
# 分析磁鐵上半部掀起來（看得到裡面轉彎），之後放回去
S(layer=top, at=F("s6", "start", 2), until=F("s7", "start", -6), dy=6.0, dz=-9.0, dur=26)

# ── 鏡頭（目標點換算：鏡頭看向 (x,y,0)，要對準 z≠0 的點就把 y 往回推、距離補上）──
YAW0 = -0.28
def shot(at, focus, D_, elev, yaw_total, dur):
    x, y, z = focus; c, s = math.cos(yaw_total), math.sin(yaw_total)
    xr, zr = x * c + z * s, -x * s + z * c
    e = math.radians(elev); sdist = zr / math.cos(e)
    return {"at": at, "dur": dur, "x": R2(xr), "y": R2(y - zr * math.tan(e)), "d": R2(D_ + sdist), "elev": elev, "yaw": R2(yaw_total - shot.yaw)}
shot.yaw = YAW0
SHOTS = {}
def mk(sid, at, focus, D_, elev, yaw, dur):
    r = shot(at, focus, D_, elev, yaw, dur); shot.yaw = yaw; SHOTS.setdefault(sid, []).append(r)
FULL = ((-4.4, 4.0, -0.6), 82, 12, -0.18)
WAF = ((BX + 0.1, YB - 0.9, WZ), 13.5, 8, -0.62)
SECV = ((BX + 3.3, 4.8, -6.3), 25, 9, YAW_END)
mk("s1", "s1:start-30", FULL[0], FULL[1], FULL[2], FULL[3], 1)
mk("s1", "s1:start", (-4.2, 4.1, -0.6), 76, 12, -0.22, 220)
mk("s2", F("s2", "start", -6), *SECV, 34)
mk("s3", F("s3", "start", -6), *WAF, 30)
mk("s3", F("s3", "line", -8), FULL[0], FULL[1], FULL[2], FULL[3], 36)
mk("s4", F("s4", "start", -8), (-11.2, 3.4, 3.6), 28, 12, -0.12, 30)
mk("s5", F("s5", "start", -8), (-5.6, 4.3, 4.0), 11, 14, -0.3, 28)
mk("s5", F("s5", "fast", -6), (-2.4, 4.3, 4.0), 11, 14, -0.34, 64)
mk("s5", F("s5", "v", -10), (-0.6, 4.3, 4.0), 12, 15, -0.38, 50)
mk("s6", F("s6", "start", -4), (3.4, 5.0, 4.4), 32, 52, -0.5, 30)
mk("s7", F("s7", "start", -6), (BX + 0.2, 4.0, -6.0), 22, 14, YAW_END, 30)
mk("s8", F("s8", "start", -6), *SECV, 30)
mk("s9", F("s9", "start", -6), (-5.0, 4.2, -1.0), 88, 14, -0.18, 30)
mk("s10", F("s10", "start", -6), *WAF, 30)
mk("s10", F("s10", "hard", -6), (BX + 0.3, YB - 0.6, WZ), 10.5, 8, -0.62, 40)

# ── 標籤（同時最多 4 張）──
def lab(part, text, en, color, at, until): return {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until}
LABELS = {
 "s3": [lab("resist", "光阻（遮罩）", "Photoresist mask", "coral", F("s3", "mask", 4), F("s3", "line", -10)),
        lab("src", "離子源", "Ion source", "amber", F("s3", "src"), F("s4", "start", 8)),
        lab("tube", "加速管", "Accelerator tube", "blue", F("s3", "acc"), F("s4", "start", 8)),
        lab("mag", "分析磁鐵", "Analyzer magnet", "amber", F("s3", "mag"), F("s4", "start", 8)),
        lab("end", "終端站", "End station", "blue", F("s3", "end", -8), F("s4", "start", 8))],
 "s4": [lab("plasma", "電漿", "Plasma", "amber", F("s4", "plasma"), F("s4", "pull", -6)),
        lab("cylP", "磷化氫 PH₃", "Phosphine", "blue", F("s4", "ph3"), F("s5", "start", -4)),
        lab("cylB", "三氟化硼 BF₃", "Boron trifluoride", "coral", F("s4", "bf3"), F("s5", "start", -4)),
        lab("extract", "引出電極", "Extraction electrodes", "blue", F("s4", "pull"), F("s5", "start", -4))],
 "s5": [lab("tube", "電極環", "Electrode rings", "blue", F("s5", "ring"), F("s5", "v", -10))],
 "s6": [lab("magTop", "上磁軛（掀開）", "Upper yoke, lifted", "blue", F("s6", "all", -4), F("s6", "miss", -8)),
        lab("flight", "飛行腔", "Flight chamber", "amber", F("s6", "bend"), F("s7", "start", -6))],
 "s7": [lab("end", "終端站", "End station", "blue", F("s7", "enter"), F("s7", "every", -6)),
        lab("wafer", "晶圓上下動", "Wafer moves", "amber", F("s7", "move"), F("s8", "start", -6))],
 "s8": [lab("secBand", "摻雜區", "Doped layer", "amber", F("s8", "stop", 4), F("s9", "start", -6))],
 "s9": [lab("endTop", "應用材料", "Applied Materials", "blue", F("s9", "am"), F("s10", "start", -6)),
        lab("farAx", "亞舍立", "Axcelis", "amber", F("s9", "ax"), F("s10", "start", -6)),
        lab("gascab", "兆捷（台灣）", "Implant gas", "coral", F("s9", "jc", -10), F("s10", "start", -6))],
 "s10": [lab("zone", "導電區域", "Doped zones", "blue", F("s10", "zone", 4), F("s10", "hard", -6)),
         lab("rhard", "光阻焦硬", "Hardened resist", "coral", F("s10", "hard", 6), F("s10", "kw", -10))],
}
# ── 2D 卡（HudImplant.tsx，kind 以 imp- 開頭） ──
def sec_(kind, sid, at, until, t, y=930, h=330, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "t": {k: {"at": v} for k, v in t.items()}}
    d.update(kw); return d
OVER = {
 "s1": [sec_("imp-hook", "s1", F("s1", "start"), F("s2", "start", -2), {"ok": F("s1", "ok"), "no": F("s1", "no"), "shoot": F("s1", "shoot"), "speed": F("s1", "speed")}, title="接上一支", tag="示意舉例")],
 "s2": [sec_("imp-np", "s2", F("s2", "start", 2), F("s3", "start", -2), {k: F("s2", k) for k in ["pure", "ph", "ntype", "bo", "hole", "ptype"]}, title="摻雜讓矽導電", tag="示意，非實際比例")],
 "s3": [sec_("imp-mask", "s3", F("s3", "start", 2), F("s4", "start", -2), {k: F("s3", k) for k in ["mask", "line", "src", "acc", "mag", "end"]}, title="遮罩與射束線", tag="示意，非實際比例")],
 "s4": [sec_("imp-src", "s4", F("s4", "start", 2), F("s5", "start", -2), {k: F("s4", k) for k in ["gas", "plasma", "ph3", "bf3", "pull"]}, title="離子源剖面", tag="示意")],
 "s5": [sec_("imp-acc", "s5", F("s5", "start", 2), F("s6", "start", -2), {k: F("s5", k) for k in ["ring", "fast", "kev", "v"]}, title="一環環加電壓", tag="示意舉例：100 keV 硼離子")],
 "s6": [sec_("imp-sel", "s6", F("s6", "start", 2), F("s7", "start", -2), {k: F("s6", k) for k in ["all", "bend", "miss", "wall", "pass"]}, title="磁鐵分選", tag="俯視示意")],
 "s7": [sec_("imp-scan", "s7", F("s7", "start", 2), F("s8", "start", -2), {k: F("s7", k) for k in ["enter", "sweep", "move", "every", "same"]}, title="左右掃上下動", tag="示意軌跡")],
 "s8": [sec_("imp-cmp", "s8", F("s8", "start", 2), F("s9", "start", -2), {k: F("s8", k) for k in ["in", "slow", "stop", "energy", "dose"]}, title="深度與濃度", tag="示意")],
 "s9": [sec_("imp-co", "s9", F("s9", "start", 2), F("s10", "start", -2), {k: F("s9", k) for k in ["am", "ax", "gas", "jc"]}, title="誰在做", tag="廠商公布／媒體報導")],
 "s10": [sec_("imp-next", "s10", F("s10", "start", 2), F("s10", "kw", -10), {k: F("s10", k) for k in ["zone", "hard", "dirty", "next", "kw"]}, title="接下來", tag="下一支：清洗")],
}
ZOOM = {"s1": [{"to": "tool", "at": "start-30", "dur": 1}], "s2": [{"to": "wafer", "at": "start+4", "dur": 30}], "s3": [{"to": "tool", "at": "start-2", "dur": 26}],
        "s6": [{"to": "magnet", "at": "start", "dur": 26}], "s7": [{"to": "tool", "at": "start", "dur": 24}], "s8": [{"to": "wafer", "at": "start+4", "dur": 30}], "s9": [{"to": "tool", "at": "start-2", "dur": 26}]}

# ── 主素材與背景分層：機台貼地的櫃體、底座、管路（最低點 < 2.0）與後方設備、控制台、通天花板的排氣管 → 背景層（bg，不算主素材）；
#    射束高度的零件（離子源腔體、加速管、磁鐵、射束管、終端站、晶圓）才是主素材，卡片不准蓋到它們的中央。
def _half_y(p):
    sz = p["size"]; sh = p["shape"]; rot = p.get("rot", [0, 0, 0])
    if sh == "sphere": return sz[0]
    if sh in ("cyl", "tube"):
        L_ = (sz[1] if sh == "cyl" else sz[2]) / 2; r = sz[0]
        return L_ if abs(abs(rot[0]) - 90) < 1 else r
    if sh == "plane": return sz[1] / 2
    if any(abs(v) % 180 for v in rot): return max(sz) / 2
    return sz[1] / 2
for p in parts:
    if p["layer"] != M: continue
    ys = [p["pos"][1] + a_[1] for a_ in p.get("at", [[0, 0, 0]])]; xs = [p["pos"][0] + a_[0] for a_ in p.get("at", [[0, 0, 0]])]; zs = [p["pos"][2] + a_[2] for a_ in p.get("at", [[0, 0, 0]])]
    lo, hi = min(ys) - _half_y(p), max(ys) + _half_y(p); cx_, cz_ = sum(xs) / len(xs), sum(zs) / len(zs)
    if (cz_ < -6.5 and cx_ < 2.0) or cx_ > 8.2 or lo > 8.85: p["layer"] = "aux"
    elif lo < 2.0: p["layer"] = "base"
    elif cx_ < -6.3: p["layer"] = "srcH"
    elif cx_ < 0.9 and cz_ > 2.5: p["layer"] = "accH"
    elif cz_ > 0.55: p["layer"] = "magH"
    elif cz_ > -4.2: p["layer"] = "lineH"
    else: p["layer"] = "endH"
for lid in ("aux", "base", "srcH", "accH", "magH", "lineH", "endH"): L(lid)
# 主素材框（給版面檢查用，畫面上看不到）：每一幕鏡頭對準的主體，用實際零件的範圍算出一個框，只在那一幕顯示；
# 其他所有層都標 bg（版面檢查只認這個框）。理由：近景時整台機台的層外框會投影到鏡頭後面、變成無限大，檢查失去意義。
mats["proxy"] = {"kind": "unlit", "color": "#FFFFFF", "opacity": 0}
def pbox(lid, x0, x1, y0, y1, z0, z1): box(lid, x0, x1, y0, y1, z0, z1, "proxy")
secC = [lp(sx * BW / 2, sy * BH / 2, sz * BD / 2) for sx in (-1, 1) for sy in (-1, 1) for sz in (-1, 1)]
PX = {  # 視窗＝鏡頭飛到定位之後 → 下一次鏡頭開始移動之前（飛行中不認主體）
  "px_full": ((-16.2, 7.2, 2.0, 8.8, -8.8, 6.4), [("s1:start-60", F("s2", "start", -6)), (F("s3", "line", 28), F("s4", "start", -8)), (F("s9", "start", 24), F("s10", "start", -6))]),
  "px_wafer": ((BX - WR - 0.2, BX + WR + 0.2, YB - WR - 0.2, YB + WR + 0.2, WZ - 0.3, WZ + 0.3), [(F("s3", "start", 24), F("s3", "line", -8)), (F("s10", "start", 24), F("s11", "start", 100))]),
  "px_sec": ((BX - WR - 0.2, max(c[0] for c in secC), YB - WR - 0.2, max(c[1] for c in secC), min(WZ - 0.3, min(c[2] for c in secC)), max(WZ + 0.6, max(c[2] for c in secC))), [(F("s2", "start", 28), F("s3", "start", -6)), (F("s8", "start", 24), F("s9", "start", -6))]),
  "px_src": ((-16.2, -6.3, 3.0, 7.7, 2.0, 6.4), [(F("s4", "start", 22), F("s5", "start", -8))]),
  "px_acc": ((-7.0, 1.2, 4.1, 5.9, 3.1, 4.9), [(F("s5", "start", 20), F("s6", "start", -4))]),
  "px_mag": ((1.4, 6.5, 3.35, 6.65, -0.8, 5.4), [(F("s6", "start", 26), F("s7", "start", -6))]),
  "px_end": ((EX0, EX1, EY0, EY1, EZ0, EZ1), [(F("s7", "start", 24), F("s8", "start", -6))]),
}
for lid, (bx_, wins) in PX.items():
    pbox(lid, *bx_)
    prev = "s1:start-60"
    for (a_, b_) in wins:
        S(layer=lid, at=prev, until=a_, opacity=0, dur=1); prev = b_
    S(layer=lid, at=prev, until=F("s11", "start", 400), opacity=0, dur=1)
for lid in layers:
    if not lid.startswith("px_"): layers[lid]["bg"] = True
model = {
  "name": "tech-implant：離子佈植機（氣瓶櫃→離子源→加速管→分析磁鐵→射束管線→終端站→剖面摻雜層），genmodel.py 產生",
  "unit": "約 20 cm", "size": {"w": 20, "h": 0.2, "r": 0.1, "t": 14},
  "palette": pal, "materials": mats, "layers": list(layers.values()), "anchors": anchors, "parts": parts, "actions": acts,
  "pose": {"yaw0": YAW0, "yawIso": 0, "drift": 0},
  "camera": {"stand": {"d": 72, "elev": 12, "y": 5}, "outro": {"d": 0}},
  "fx": {"dpr": 1.25, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": True, "dust": False, "vaporSprites": False, "shimmer": False, "glow": False, "sweep": False},
}
json.dump(model, open(os.path.join(D, "model.json"), "w"), ensure_ascii=False, indent=1)
# script.json：先跑 genscript.py（旁白、cue、字幕），再把 3D 動作併進去
import subprocess, sys
subprocess.run([sys.executable, os.path.join(D, "genscript.py")], check=True)
sp = os.path.join(D, "script.json"); script = json.load(open(sp))
for sc in script["scenes"]:
    sid = sc["id"]; pr = sc.setdefault("props", {})
    pr.pop("_endCard說明", None)
    if sid == "s1": pr["hook"] = {"kicker": "接量測｜離子打進矽", "title": "秒速1,300公里", "size": 120, "top": 236}
    if sid in ZOOM: pr["zoom"] = ZOOM[sid]
    if sid == "s7": sc["sources"] = ["機械式掃描通則；Berkeley EE143 講義"]
    if sid in SHOTS: pr["shot"] = SHOTS[sid]
    if sid in LABELS: pr["labels"] = LABELS[sid]
    if sid in OVER: pr["overlay"] = OVER[sid]
    if sid == "s1": pr["shift"] = shifts; pr["run"] = runs
json.dump(script, open(sp, "w"), ensure_ascii=False, indent=1)
print(f"零件 {len(parts)}、層 {len(layers)}、shift {len(shifts)}、動作 {len(acts)}、離子 {len(ions)}（錯的 {sum(1 for i in ions if i[1] != 'ok')}）")
