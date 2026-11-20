# 產生 videos/tech-metrology/model.json（改這支再重產）。座標：x 右、y 上、z 朝觀眾；各站以 x 偏移分開，鏡頭只看一站。
# T x=0   量測島（無塵室黃光區：量測機台剖開看到三個量測頭、曝光機、晶圓盒、手臂與檢出盒）  s7 s8
# F x=60  膜厚量測頭（光源臂→偏振片→膜層→分析片→偵測臂→光譜儀；兩道反射光）          s3
# E x=120 電子束量線寬（CD-SEM 鏡柱：電子槍→聚光鏡→偏轉線圈→物鏡；腔內線路剖面＋偵測器） s4
# O x=180 疊對光柵（下層藍灰、上層橘；0 與 ±1 階繞射光；左右偵測器）                    s5
# D x=240 缺陷檢測（晶圓＋光帶掃描＋缺陷色點；電子束複檢鏡柱；s9 放行＋離子束預告）     s6 s9
# P x=300 線路疊層（磨平的膜、上下兩層線路差兩奈米；s2 一層層拆開）                      s1 s2
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
def cyl(pid, lay, mat, r, h, pos, axis="y", at=None, rot=None):
    rr = rot or {"y": [90, 0, 0], "x": [0, 90, 0], "z": None}[axis]
    return box(pid, lay, mat, [r, h], pos, at=at, rot=rr, shape="cyl")
def tube(pid, lay, mat, ro, ri, ln, pos, axis="y", at=None):
    rot = {"y": [90, 0, 0], "x": [0, 90, 0], "z": None}[axis]
    return box(pid, lay, mat, [ro, ri, ln], pos, rot=rot, shape="tube", at=at)
def sph(pid, lay, mat, r, pos, at=None): return box(pid, lay, mat, [r], pos, at=at, shape="sphere")
def anchor(name, lay, p, dx=100, dy=-80): anchors[name] = {"layer": lay, "p": [R(v) for v in p], "dx": dx, "dy": dy}
def rod(pid, lay, mat, a, b, r):
    """兩點之間的圓柱（只在 xy 平面內斜放）"""
    dx, dy = b[0] - a[0], b[1] - a[1]; ln = math.hypot(dx, dy); ang = math.degrees(math.atan2(dy, dx))
    return box(pid, lay, mat, [r, ln], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, a[2]], rot=[0, 90, ang], shape="cyl")

palette = {"dark": "#3F4E6B", "dark2": "#2E3340", "steel": "#9AA8BE", "steel2": "#7D8AA1", "steelHi": "#C5D0E2", "white": "#F2EFE8", "panel": "#DCE1EA", "panel2": "#C7CFDC",
 "led": "#FF5A1F", "ledG": "#2BD47F", "ledA": "#FFB020", "slot": "#2A2E3B", "brass": "#D6B25E", "cu": "#C98A3E", "cuHi": "#E8A45E",
 "si": "#8091B8", "siTop": "#A9B7D6", "film": "#2A9D8F", "film2": "#47C7B5", "ox": "#7FC8C0", "gate": "#F0A030", "m1": "#C98A3E", "m2": "#E07A3A",
 "grB": "#5B6E96", "grO": "#F08A24", "wall": "#F3E7C4", "wall2": "#E9D9A8", "floorG": "#9AA3B2", "floorD": "#6E7787", "ffu": "#E6EAF0", "rail": "#B9C2D0",
 "foup": "#EDEFF3", "foupD": "#8E98AA", "bin": "#D8432C", "binEdge": "#9E2A1A", "scanner": "#E4E8EF", "scanner2": "#B8C2D2", "src": "#C9D2E0",
 "lampC": "#FFE7A8", "pol": "#7FD3FF", "spec": "#2E3340", "glassB": "#BFE6FF",
 "lp_heat": "#FF7A2F", "lp_bad": "#E0472F", "lp_sig": "#38B6FF", "lp_sigRim": "#1F6FEB", "lp_proc": "#FF9F1C", "lp_good": "#14A38B", "lp_warm": "#FFB020",
 "litW": "#FFF3C8", "litWRim": "#FFB020", "litA": "#FFB45A", "litARim": "#E0752A", "litC": "#6FC8FF", "litCRim": "#1F7FD0", "fringe": "#FFD36B",
 "eBeam": "#38B6FF", "eBeamRim": "#1F6FEB", "eSec": "#8BE8FF", "eSecRim": "#2A9FD8", "defO": "#FF7A1F", "defRim": "#C24A00", "part": "#6B5A4A",
 "ion": "#E0472F", "ionRim": "#9E2A1A", "data": "#2F7FE0", "band": "#FFF6D0", "ok": "#14A38B",
 "rainbow0": "#7B5CFF", "rainbow1": "#2F7FE0", "rainbow2": "#14A38B", "rainbow3": "#F2C14E", "rainbow4": "#F08A24", "rainbow5": "#E0472F"}
def M(color, **k): return {"kind": "std", "color": color, "rough": 0.45, "metal": 0.1, **k}
materials = {
 "dark": M("dark", rough=.5, metal=.2), "dark2": M("dark2", rough=.35, metal=.3), "steel": M("steel", rough=.3, metal=.85, env=.5), "steel2": M("steel2", rough=.35, metal=.8),
 "steelHi": M("steelHi", rough=.25, metal=.8, env=.7), "white": M("white", rough=.55), "panel": M("panel", rough=.5, metal=.05), "panel2": M("panel2", rough=.5, metal=.1),
 "slot": {"kind": "unlit", "color": "slot"}, "led": {"kind": "unlit", "color": "led"}, "ledG": {"kind": "unlit", "color": "ledG"}, "ledA": {"kind": "unlit", "color": "ledA"},
 "gold": M("brass", rough=.25, metal=.95, env=.8), "cu": M("cu", rough=.3, metal=.9, env=.6), "cuHi": M("cuHi", rough=.3, metal=.85, env=.7),
 "si": M("si", rough=.45, metal=.3, env=.4), "siTop": M("siTop", rough=.15, metal=.6, env=.9), "film": M("film", rough=.3, metal=.3, env=.6), "film2": M("film2", rough=.3, metal=.3, env=.6),
 "ox": M("ox", rough=.25, metal=.2, env=.6), "gate": M("gate", rough=.35, metal=.3), "m1": M("m1", rough=.3, metal=.85, env=.6), "m2": M("m2", rough=.3, metal=.6, env=.5),
 "grB": M("grB", rough=.35, metal=.5, env=.5), "grO": M("grO", rough=.35, metal=.3, env=.5),
 "wall": M("wall", rough=.8), "wall2": M("wall2", rough=.8), "floorG": M("floorG", rough=.6, metal=.4), "floorD": M("floorD", rough=.6, metal=.5), "ffu": M("ffu", rough=.6), "rail": M("rail", rough=.3, metal=.8),
 "foup": M("foup", rough=.5), "foupD": M("foupD", rough=.5, metal=.2), "bin": M("bin", rough=.5), "binEdge": M("binEdge", rough=.5),
 "scanner": M("scanner", rough=.5, metal=.05), "scanner2": M("scanner2", rough=.45, metal=.2), "src": M("src", rough=.3, metal=.7, env=.6),
 "lamp": {"kind": "unlit", "color": "lampC"}, "pol": M("pol", rough=.15, metal=.2, env=.9), "spec": M("spec", rough=.4, metal=.3), "glass": M("glassB", rough=.1, metal=.3, env=.9),
 "r0": {"kind": "unlit", "color": "rainbow0"}, "r1": {"kind": "unlit", "color": "rainbow1"}, "r2": {"kind": "unlit", "color": "rainbow2"}, "r3": {"kind": "unlit", "color": "rainbow3"}, "r4": {"kind": "unlit", "color": "rainbow4"}, "r5": {"kind": "unlit", "color": "rainbow5"},
 "fringe": {"kind": "unlit", "color": "fringe"}, "band": {"kind": "unlit", "color": "band"}, "defO": {"kind": "unlit", "color": "defO"}, "okG": {"kind": "unlit", "color": "ok"},
 "part": M("part", rough=.8, metal=.05), "edgeLit": {"kind": "unlit", "color": "eSec"}, "beamE": {"kind": "unlit", "color": "eBeam", "opacity": .85},
 "lightBox": {"kind": "unlit", "color": "glassB", "opacity": .05}, "vac": {"kind": "unlit", "color": "glassB", "opacity": .06}, "ionBox": {"kind": "unlit", "color": "ion", "opacity": .05},
 "tick": {"kind": "unlit", "color": "lp_warm"}, "red": {"kind": "unlit", "color": "lp_bad"}, "dataC": M("data", rough=.4, metal=.3),
 "wafer": M("siTop", rough=.12, metal=.65, env=.95), "die": M("si", rough=.3, metal=.5, env=.6), "screen": M("dark2", rough=.3, metal=.2),
}
materials = {"m_" + k: v for k, v in materials.items()}
def flowx(key, lay, path, shape="dot", n=4, lanes=1, gap=.2, ldir=(1, 0, 0), size=.1, rate=1.0, color="lp_sig", rim="lp_sigRim", trail=0, band=None, bandO=.5, track=False, rimO=.6, keep=None):
    layer(lay)
    d = {"type": "flow", "layer": lay, "path": [[R(v) for v in p] for p in path], "n": n, "lanes": lanes, "laneGap": gap, "laneDir": list(ldir), "size": size, "shape": shape,
         "rate": rate, "color": color, "rim": rim, "rimScale": 1.5, "rimO": rimO, "trail": trail, "trailGap": .03, "trailColor": color, "track": track}
    if band: d["band"] = band; d["bandO"] = bandO
    actions[key] = d
def glow(key, lay, ps, color="lp_heat", steady=True, g=.9, freq=2.2):
    layer(lay)
    d = {"type": "pulse", "layer": lay, "parts": ps, "color": color, "glow": g, "halo": 0}
    if steady: d["steady"] = True
    else: d["freq"] = freq
    actions[key] = d
def swing(key, lay, ps, pivot, axis, deg, freq):
    layer(lay); actions[key] = {"type": "rotate", "parts": ps, "axis": axis, "pivot": pivot, "layer": lay, "swing": deg, "freq": freq}
def trace(key, lay, a, b, amp=.5, cycles=3, rate=1.0, color="lp_sig", up=(0, 1, 0)):
    layer(lay); actions[key] = {"type": "trace", "layer": lay, "from": [R(v) for v in a], "to": [R(v) for v in b], "amp": amp, "cycles": cycles, "rate": rate, "color": color, "up": list(up)}
def ring_pts(n, r, y=0): return [[r * math.cos(2 * math.pi * i / n), y, r * math.sin(2 * math.pi * i / n)] for i in range(n)]

# ═════════ T：量測島 x=0（無塵室黃光區） ═════════
TX = 0; FY = .3          # 地板面
box("t_floor", "t_room", "floorG", [70, .3, 40], [TX - 8, .15, 0])
box("t_grate", "t_room", "floorD", [.12, .04, 40], [TX - 8, .31, 0], at=[[-34 + 2.0 * i, 0, 0] for i in range(35)])
box("t_grate2", "t_room", "floorD", [70, .04, .12], [TX - 8, .31, 0], at=[[0, 0, -19 + 2.0 * j] for j in range(20)])
box("t_wall", "t_room", "wall", [70, 17, .4], [TX - 8, 8.8, -17], bevel=.04)
box("t_wallband", "t_room", "wall2", [70, .5, .45], [TX - 8, 4.0, -16.9])
box("t_ffu", "t_room", "ffu", [8.6, .5, 4.6], [TX - 8, 17.0, -14.6], at=[[-30 + 9.2 * i, 0, 0] for i in range(7)], bevel=.04)
box("t_ffug", "t_room", "panel2", [8.4, .06, .08], [TX - 8, 16.72, -14.6], at=[[-30 + 9.2 * i, 0, -2.2 + .55 * j] for i in range(7) for j in range(9)])
box("t_lamp", "t_room", "ledA", [6.0, .16, .4], [TX - 8, 15.6, -16.7], at=[[-28 + 11 * i, 0, 0] for i in range(6)])
# 天花板自動搬運軌道（OHT）＋吊架
box("t_oht", "t_room", "rail", [70, .5, .9], [TX - 8, 14.4, -9.5], bevel=.04)
box("t_ohtH", "t_room", "steel2", [.2, 3.0, .2], [TX - 8, 16.0, -9.5], at=[[-30 + 10 * i, 0, 0] for i in range(7)])
# 背景：第二台量測機台輪廓（淡）、管線
box("t_bg2", "t_room", "panel2", [9, 8, 7], [TX + 18, 4.3, -11], bevel=.1)
box("t_bg2d", "t_room", "panel", [6, 3, .1], [TX + 18, 5.0, -7.45])
cyl("t_pipeW", "t_room", "steelHi", .22, 60, [TX - 8, 12.5, -16.4], axis="x", at=[[0, 0, 0], [0, -.7, 0]])

# 量測機台：底座、背板、左右側板、頂板（前面剖開，看得到裡面的三個量測頭與載台）
MW, MD, MH = 16.0, 9.0, 7.6; MB = FY + .8   # 機台內部底面
box("m_base", "m_body", "panel2", [MW + .6, .8, MD + .6], [TX, FY + .4, 0], bevel=.06)
box("m_back", "m_body", "panel", [MW, MH, .5], [TX, MB + MH / 2, -MD / 2 + .25], bevel=.06)
box("m_side", "m_body", "panel", [.5, MH, MD], [TX, MB + MH / 2, 0], at=[[-MW / 2 + .25, 0, 0], [MW / 2 - .25, 0, 0]], bevel=.06)
box("m_roof", "m_body", "panel", [MW + .4, .6, MD + .4], [TX, MB + MH + .3, 0], bevel=.06)
box("m_frame", "m_body", "steelHi", [.3, MH, .3], [TX, MB + MH / 2, MD / 2 - .1], at=[[-MW / 2 + .2, 0, 0], [MW / 2 - .2, 0, 0]])
box("m_frameT", "m_body", "steelHi", [MW, .3, .3], [TX, MB + MH - .15, MD / 2 - .1])
box("m_seam", "m_body", "panel2", [.05, MH - .4, .06], [TX, MB + MH / 2, -MD / 2 + .52], at=[[-4, 0, 0], [0, 0, 0], [4, 0, 0]])
box("m_seamS", "m_body", "panel2", [.06, MH - .4, .05], [TX, MB + MH / 2, 0], at=[[-MW / 2 - .01, 0, -1.5], [-MW / 2 - .01, 0, 1.5], [MW / 2 + .01, 0, -1.5], [MW / 2 + .01, 0, 1.5]])
box("m_ffuTop", "m_body", "ffu", [MW - 2, .7, MD - 2], [TX, MB + MH + .95, 0], bevel=.05)
box("m_ffuG", "m_body", "panel2", [MW - 2.2, .06, .08], [TX, MB + MH + 1.32, 0], at=[[0, 0, -3 + .6 * j] for j in range(11)])
box("m_ffuG2", "m_body", "panel2", [.08, .06, MD - 2.2], [TX, MB + MH + 1.32, 0], at=[[-6.6 + .6 * i, 0, 0] for i in range(23)])
# 狀態燈柱（綠／琥珀／紅）
cyl("m_tower", "m_body", "steel2", .12, 1.4, [TX + MW / 2 - .6, MB + MH + 1.3, MD / 2 - .8], axis="y")
cyl("m_twG", "m_body", "ledG", .26, .4, [TX + MW / 2 - .6, MB + MH + 2.15, MD / 2 - .8], axis="y")
cyl("m_twA", "m_body", "ledA", .26, .4, [TX + MW / 2 - .6, MB + MH + 2.6, MD / 2 - .8], axis="y")
cyl("m_twR", "m_body", "led", .26, .4, [TX + MW / 2 - .6, MB + MH + 3.05, MD / 2 - .8], axis="y")
# 下方線槽（機台前方地板上）
box("m_tray", "m_body", "steel2", [MW + 6, .35, .9], [TX - 3, FY + .18, MD / 2 + 1.0])
box("m_trayC", "m_body", "dark2", [MW + 5.6, .14, .5], [TX - 3, FY + .38, MD / 2 + 1.0])
# 載台：X／Y 雙軸滑軌＋線性馬達線圈＋真空吸盤（同心環）＋晶圓（含晶粒格）
SY = MB + .3
box("m_railX", "m_stage", "rail", [MW - 2, .25, .4], [TX, SY, 0], at=[[0, 0, -2.4], [0, 0, 2.4]])
box("m_coil", "m_stage", "cu", [.5, .2, .5], [TX, SY + .2, -2.4], at=[[-6 + 1.0 * i, 0, 0] for i in range(13)])
box("m_slide", "m_stage", "steel2", [5.4, .4, 6.0], [TX, SY + .45, 0], bevel=.04)
box("m_railY", "m_stage", "rail", [.35, .2, 5.6], [TX, SY + .75, 0], at=[[-2.0, 0, 0], [2.0, 0, 0]])
cyl("m_chuck", "m_stage", "steel", 2.3, .35, [TX, SY + 1.0, 0], axis="y")
tube("m_chR", "m_stage", "steelHi", 1.9, 1.75, .04, [TX, SY + 1.19, 0], at=[[0, 0, 0]])
tube("m_chR2", "m_stage", "steelHi", 1.2, 1.08, .04, [TX, SY + 1.19, 0])
cyl("m_wf", "m_stage", "wafer", 2.0, .06, [TX, SY + 1.22, 0], axis="y")
WC = [(i * .42, j * .42) for i in range(-4, 5) for j in range(-4, 5) if math.hypot(i * .42, j * .42) < 1.6]
box("m_die", "m_stage", "die", [.36, .02, .36], [TX, SY + 1.26, 0], at=[[a, 0, b] for a, b in WC])
WTOP = SY + 1.27
# 三個量測頭（從頂板吊下）：左＝光學量測頭（膜厚、疊對）、中＝電子束鏡柱（穿出頂板）、右＝光學缺陷檢測頭（光帶）
HL, HC, HR = TX - 4.8, TX, TX + 4.8
box("m_hangL", "m_heads", "steel2", [.5, 2.2, .5], [HL, MB + MH - 1.1, 0])
box("m_optL", "m_heads", "dark", [2.4, 1.4, 1.8], [HL, MB + MH - 2.9, 0], bevel=.06)
cyl("m_optLlens", "m_heads", "glass", .4, .6, [HL - .6, MB + MH - 3.9, 0], axis="y")
cyl("m_optLlens2", "m_heads", "glass", .4, .6, [HL + .6, MB + MH - 3.9, 0], axis="y")
box("m_optLled", "m_heads", "ledG", [.5, .12, .04], [HL, MB + MH - 2.5, .92])
cyl("m_semCol", "m_heads", "steelHi", .7, 6.2, [HC, MB + MH - .2, 0], axis="y")
cyl("m_semRing", "m_heads", "cu", .82, .35, [HC, MB + MH - .2, 0], axis="y", at=[[0, -1.2, 0], [0, .4, 0], [0, 1.8, 0]])
cyl("m_semTip", "m_heads", "steel2", .4, .9, [HC, MB + MH - 3.7, 0], axis="y")
cyl("m_semGun", "m_heads", "dark", .55, .9, [HC, MB + MH + 3.3, 0], axis="y")
box("m_hangR", "m_heads", "steel2", [.5, 2.2, .5], [HR, MB + MH - 1.1, 0])
box("m_insp", "m_heads", "dark", [2.6, 1.2, 2.2], [HR, MB + MH - 2.8, 0], bevel=.06)
box("m_inspSlit", "m_heads", "band", [2.2, .08, .25], [HR, MB + MH - 3.45, 0])
cyl("m_inspBF", "m_heads", "glass", .3, .5, [HR - .8, MB + MH - 3.6, .6], axis="y")
cyl("m_inspDF", "m_heads", "glass", .3, .5, [HR + .8, MB + MH - 3.6, .6], axis="y")
# 光罩檢查抽屜（華洋精機：光罩微粒檢測）：機台右側外掛，光罩＋護膜框
box("m_rbox", "m_ret", "panel2", [2.4, 2.6, 3.6], [TX + MW / 2 + 1.25, MB + 1.3, 1.5], bevel=.05)
box("m_ret", "m_ret", "glass", [1.8, .12, 1.8], [TX + MW / 2 + 1.25, MB + 2.7, 1.5])
box("m_retF", "m_ret", "dark2", [1.9, .2, .12], [TX + MW / 2 + 1.25, MB + 2.82, 1.5], at=[[0, 0, -.9], [0, 0, .9]])
box("m_retP", "m_ret", "cuHi", [1.2, .02, 1.2], [TX + MW / 2 + 1.25, MB + 2.77, 1.5])
# 晶圓傳送盒（FOUP）與載入口（左前方）
FXC = TX - MW / 2 - 2.6
box("m_efem", "m_foup", "panel", [4.2, 5.2, MD - 1], [FXC, FY + 2.6, -.5], bevel=.06)
box("m_lp", "m_foup", "steel2", [3.6, .3, 3.4], [FXC, FY + 2.0, MD / 2 + .6], bevel=.03)
box("m_foup", "m_foup", "foup", [3.0, 3.0, 3.0], [FXC, FY + 3.65, MD / 2 + .6], bevel=.12)
box("m_foupD", "m_foup", "foupD", [2.2, 2.2, .08], [FXC, FY + 3.65, MD / 2 + 2.13])
box("m_foupH", "m_foup", "steelHi", [1.6, .25, .6], [FXC, FY + 5.3, MD / 2 + .6])
box("m_lpled", "m_foup", "ledG", [.6, .1, .04], [FXC, FY + 1.3, MD / 2 - 1.0 + .01])
glow("m_leds", "m_body", ["m_twG", "m_optLled", "m_lpled"], "lp_good", steady=False, g=.9, freq=1.4)
# 曝光機（回饋終點，左邊）：外殼＋光源腔（圓筒）＋光罩台＋晶圓台視窗（看得到載台與晶圓）＋資料線
SXC = TX - 21
box("s_body", "s_body", "scanner", [12, 8, 9], [SXC, FY + 4.0, -.5], bevel=.1)
box("s_seam", "s_body", "scanner2", [.06, 7.6, .06], [SXC, FY + 4.0, 4.01], at=[[-3, 0, 0], [3, 0, 0]])
box("s_top", "s_body", "scanner2", [6, 1.4, 5], [SXC + 1.5, FY + 8.7, -.5], bevel=.06)
box("s_mask", "s_body", "steelHi", [4.4, .3, 3.0], [SXC + 1.5, FY + 9.55, -.5])
cyl("s_src", "s_body", "src", 1.8, 5, [SXC - 7.6, FY + 3.2, -.5], axis="x")
cyl("s_srcB", "s_body", "steelHi", .12, .2, [SXC - 7.6, FY + 3.2, -.5], axis="x", at=[[-2.3 + 1.15 * i, 1.8 * math.cos(a), 1.8 * math.sin(a)] for i in range(5) for a in (0.5, 1.5, 2.6, 3.7, 4.8, 5.8)])
box("s_win", "s_body", "slot", [5.6, 2.4, .1], [SXC + .5, FY + 2.0, 4.0])
box("s_stage", "s_stage", "steel2", [3.6, .5, 2.0], [SXC + .5, FY + 1.5, 3.2])
cyl("s_wf", "s_stage", "wafer", .85, .06, [SXC + .5, FY + 1.8, 3.2], axis="y")
box("s_led", "s_body", "ledG", [.8, .1, .04], [SXC + 4.6, FY + 6.6, 4.02])
# 資料線（量測機 → 曝光機）：地板線槽上的一條藍色線
DY = FY + .5
box("d_cable", "d_line", "dataC", [MW / 2 + 12.6 - 6 + 4.0, .18, .18], [(TX - MW / 2 - 1 + SXC + 6) / 2 - 2.0, DY, 6.0])
box("d_cableU", "d_line", "dataC", [.18, 1.4, .18], [TX - MW / 2 + .6, DY + .6, 6.0], at=[[0, 0, 0], [SXC + 6 - (TX - MW / 2 + .6) - 1.0, 0, 0]])
box("d_cableZ", "d_line", "dataC", [.18, .18, 1.6], [TX - MW / 2 + .6, DY + 1.3, 5.2])
flowx("t_data", "d_line", [[TX - MW / 2 + .6, DY + 1.25, 6.0], [TX - MW / 2 + .6, DY, 6.0], [SXC + 5.0, DY, 6.0], [SXC + 5.0, DY + 1.25, 6.0]], shape="arrow", n=5, size=.34, rate=.7, color="data", rim="data")
# 手臂與檢出盒（右前方）：出片台上的晶圓（有缺陷）→ 手臂夾起 → 放進紅色檢出盒
AXB, AZB = TX + 1.6, MD / 2 + 4.2
L1A, L2A = 3.0, 2.6
PX0 = AXB + L1A + L2A            # 取料位置 x
box("a_table", "a_tab", "steel2", [3.2, .7, 3.2], [PX0, FY + .35, AZB], bevel=.04)
cyl("a_post", "a_tab", "steelHi", .25, .2, [PX0, FY + .8, AZB], axis="y", at=[[-.9, 0, 0], [.9, 0, 0], [0, 0, -.9]])
WBOT = FY + .9
cyl("a_wf", "a_wf", "wafer", 1.25, .06, [PX0, WBOT + .03, AZB], axis="y")
box("a_wfdie", "a_wf", "die", [.34, .02, .34], [PX0, WBOT + .07, AZB], at=[[i * .4, 0, j * .4] for i in range(-2, 3) for j in range(-2, 3) if math.hypot(i * .4, j * .4) < 1.0])
sph("a_wfdef", "a_wf", "defO", .1, [PX0 + .3, WBOT + .14, AZB - .3], at=[[0, 0, 0], [-.6, 0, .5]])
TO = [-1.6, 3.4]
BINX, BINZ = PX0 + TO[0], AZB + TO[1]
parts_lib = [{"part": "arm", "id": "ar", "layer": "a_arm", "pos": [AXB, FY + .04, AZB], "h": 3.0, "l1": L1A, "l2": L2A, "drop": .9, "to": TO, "gw": 2.5},
             {"part": "bin", "id": "rb", "layer": "a_bin", "pos": [BINX, FY, BINZ], "w": 3.4, "d": 3.4, "h": .6}]
anchor("t_bin", "a_bin", [BINX + 1.7, FY + .6, BINZ + 1.7], dx=170, dy=-130)
anchor("t_arm", "a_tab", [PX0 + 1.4, FY + .8, AZB + 1.4], dx=140, dy=-20)
anchor("t_tool", "m_body", [TX + MW / 2, MB + MH, MD / 2], dx=110, dy=-90)
anchor("t_optL", "m_heads", [HL - 1.2, MB + MH - 3.2, .9], dx=-120, dy=-60)
anchor("t_sem", "m_heads", [HC + .7, MB + MH + 2.0, 0], dx=200, dy=-180)
anchor("t_semR", "m_heads", [HC - .7, MB + MH + 1.0, 0], dx=-160, dy=-40)
anchor("t_insp", "m_heads", [HR + 1.3, MB + MH - 2.6, 1.1], dx=130, dy=-60)
anchor("t_ret", "m_ret", [TX + MW / 2 + 2.4, MB + 2.75, 2.4], dx=40, dy=-260)
anchor("t_wf", "m_stage", [TX + 1.8, WTOP, 1.0], dx=120, dy=70)
anchor("t_foup", "m_foup", [FXC - 1.5, FY + 4.5, MD / 2 + 2.0], dx=-110, dy=-50)
anchor("t_scan", "s_body", [SXC + 2.0, FY + 8.0, 4.0], dx=60, dy=-120)
anchor("t_sstage", "s_stage", [SXC + 2.2, FY + 1.6, 4.0], dx=110, dy=60)
anchor("t_data", "d_line", [SXC + 9.0, DY, 6.0], dx=60, dy=90)

# ═════════ F：膜厚量測頭 x=60（剖面：光在 z=3.25 平面上走，膜與基板深 6） ═════════
FX = 60; ZP = 3.15
box("f_base", "f_stage", "dark2", [20, .6, 7], [FX, .3, 0], bevel=.04)
box("f_rail", "f_stage", "rail", [18, .2, .5], [FX, .7, 0], at=[[0, 0, -2.4], [0, 0, 2.4]])
box("f_coil", "f_stage", "cu", [.6, .16, .5], [FX, .86, -2.4], at=[[-8 + 1.0 * i, 0, 0] for i in range(17)])
box("f_chuck", "f_wf", "steel", [17, .6, 6.2], [FX, 1.1, 0], bevel=.04)
box("f_chG", "f_wf", "steelHi", [16.6, .04, .1], [FX, 1.42, 0], at=[[0, 0, -2.4 + .8 * j] for j in range(7)])
box("f_si", "f_wf", "si", [16, 2.0, 6], [FX, 2.4, 0])
box("f_film", "f_wf", "film", [16, 1.4, 6], [FX, 4.1, 0])
FT = 4.8; FB = 3.4                       # 膜頂、膜底
box("f_filmTop", "f_wf", "film2", [16, .04, 6], [FX, FT + .02, 0])
# 厚度標尺（左側）
box("f_tick", "f_wf", "tick", [.08, 1.4, .08], [FX - 7.4, 4.1, ZP], at=[[0, 0, 0]])
box("f_tickH", "f_wf", "tick", [.5, .08, .08], [FX - 7.4, 0, ZP], at=[[0, FB, 0], [0, FT, 0]])
# 光源臂（左上）：燈罩、燈、光纖接頭、斜臂、偏振片
P0 = (FX, FT); LA = (FX - 6.8, FT + 6.3); RA1 = (FX + 6.8, FT + 6.3)
BQ = (FX + 1.05, FB); Q = (FX + 2.1, FT); RA2 = (FX + 2.1 + 6.8, FT + 6.3)
ang = math.degrees(math.atan2(LA[1] - P0[1], LA[0] - P0[0]))
box("f_lampH", "f_lamp", "dark", [2.2, 1.6, 1.8], [LA[0] - .9, LA[1] + .9, 0], bevel=.08)
cyl("f_lampCap", "f_lamp", "steel", .7, .5, [LA[0] - .9, LA[1] + 1.95, 0], axis="y")
cyl("f_lampBulb", "f_lamp", "lamp", .35, .3, [LA[0] - .2, LA[1] + .55, ZP - 2.4], axis="y")
cyl("f_fiber", "f_lamp", "steel2", .15, 2.4, [LA[0] - 2.4, LA[1] + .9, 0], axis="x")
rod("f_armL", "f_lamp", "steel2", (LA[0] - .2, LA[1] + .2, -1.2), (P0[0] - 2.4, P0[1] + 2.25, -1.2), .2)
cyl("f_pol", "f_pol", "pol", .75, .12, [FX - 4.1, FT + 3.8, ZP - .2], axis="z")
tube("f_polR", "f_pol", "steelHi", .85, .72, .18, [FX - 4.1, FT + 3.8, ZP - .2], axis="z")
# 偵測臂（右上）：分析片、偵測器（收兩道光）、光譜儀（彩色條紋）
cyl("f_ana", "f_det", "pol", .75, .12, [FX + 5.0, FT + 4.6, ZP - .2], axis="z")
tube("f_anaR", "f_det", "steelHi", .85, .72, .18, [FX + 5.0, FT + 4.6, ZP - .2], axis="z")
box("f_detH", "f_det", "dark", [4.0, 1.4, 1.8], [FX + 7.8, FT + 7.0, ZP - 1.2], bevel=.08)
box("f_detWin", "f_det", "glass", [3.4, .1, .9], [FX + 7.8, FT + 6.28, ZP - .6])
box("f_fr", "f_det", "fringe", [.18, .04, .9], [FX + 7.8, FT + 6.22, ZP - .6], at=[[-1.5 + .38 * i, 0, 0] for i in range(9) if i % 2 == 0])
box("f_spec", "f_spec", "spec", [4.6, 2.6, 1.6], [FX + 7.8, FT + 9.2, ZP - 1.4], bevel=.08)
for i in range(6): box(f"f_sp{i}", "f_spec", f"r{i}", [.6, 1.6, .06], [FX + 6.0 + .72 * i, FT + 9.2, ZP - .58])
box("f_specScr", "f_spec", "screen", [4.2, 1.6, .06], [FX + 7.8, FT + 11.6, ZP - 1.0])
box("f_specPost", "f_spec", "steel2", [.3, 1.0, .3], [FX + 7.8, FT + 10.7, ZP - 1.4])
# 光的空間（流動物在這裡面走；很淡）
box("f_lightbox", "f_lite", "lightBox", [17, 9.5, .5], [FX + 1.0, FT + 4.6, ZP])
flowx("f_in", "f_lite", [[LA[0] + .3, LA[1] - .28, ZP], [P0[0], P0[1] + .02, ZP]], shape="liquid", n=5, size=.24, rate=.9, color="litW", rim="litWRim", band=.09, bandO=.85)
flowx("f_r1", "f_lite", [[P0[0], P0[1] + .02, ZP], [RA1[0] - .4, RA1[1] - .37, ZP]], shape="liquid", n=5, size=.22, rate=.9, color="litA", rim="litARim", band=.08, bandO=.8)
flowx("f_r2", "f_lite", [[P0[0], P0[1], ZP], [BQ[0], BQ[1] + .02, ZP], [Q[0], Q[1], ZP], [RA2[0] - 1.2, RA2[1] - 1.1, ZP]], shape="liquid", n=6, size=.22, rate=.8, color="litC", rim="litCRim", band=.08, bandO=.8)
glow("f_hitP", "f_wf", ["f_filmTop"], "lp_warm", steady=False, g=.5, freq=1.4)
glow("f_lampOn", "f_lamp", ["f_lampBulb"], "lp_warm", steady=True, g=1.0)
glow("f_fringe", "f_det", ["f_fr", "f_detWin"], "lp_warm", steady=False, g=1.0, freq=2.6)
glow("f_specOn", "f_spec", [f"f_sp{i}" for i in range(6)], "lp_warm", steady=False, g=.45, freq=1.2)
trace("f_wave", "f_spec", [FX + 5.9, FT + 11.6, ZP - .9], [FX + 9.7, FT + 11.6, ZP - .9], amp=.45, cycles=3, rate=.8, color="lp_warm")
anchor("f_lamp", "f_lamp", [LA[0] - 2.0, LA[1] + 1.7, .9], dx=-90, dy=-60)
anchor("f_pol", "f_pol", [FX - 4.6, FT + 4.4, ZP], dx=-150, dy=-20)
anchor("f_film", "f_wf", [FX - 6.0, FT - .3, 3.0], dx=-120, dy=40)
anchor("f_si", "f_wf", [FX + 6.0, 2.4, 3.0], dx=120, dy=50)
anchor("f_det", "f_det", [FX + 9.8, FT + 7.0, ZP - .3], dx=110, dy=20)
anchor("f_spec", "f_spec", [FX + 10.1, FT + 9.6, ZP - .6], dx=100, dy=-40)
anchor("f_top", "f_lite", [P0[0] - .2, P0[1] + .1, ZP], dx=-150, dy=-90)
anchor("f_bot", "f_lite", [BQ[0] + .2, BQ[1], ZP], dx=150, dy=70)

# ═════════ E：電子束量線寬 x=120（鏡柱由上而下：電子槍、聚光鏡、偏轉線圈、物鏡；腔內線路剖面、偵測器） ═════════
EX = 120
box("e_ch", "e_ch", "panel2", [16, .6, 7], [EX, .3, 0], bevel=.04)
box("e_chB", "e_ch", "panel", [16, 9.6, .4], [EX, 5.4, -3.3], bevel=.04)
box("e_chT", "e_ch", "panel", [16, .5, 7], [EX, 10.45, 0], bevel=.04)
box("e_chS", "e_ch", "panel", [.4, 9.6, 7], [EX, 5.4, 0], at=[[-7.8, 0, 0], [7.8, 0, 0]])
box("e_vac", "e_vac", "vac", [15.0, 9.4, 6.4], [EX, 5.4, 0])
cyl("e_port", "e_ch", "steelHi", .5, .5, [EX - 7.95, 7.6, 1.5], axis="x", at=[[0, 0, 0], [0, -3, 0]])
# 樣品：基板＋5 根線條（略寬的底腳＝微傾斜的側壁）
box("e_sub", "e_smp", "si", [13, 1.2, 4.6], [EX, 1.2, 0])
LX = [-4.4, -2.2, 0, 2.2, 4.4]
box("e_line", "e_smp", "m1", [1.1, 1.5, 4.0], [EX, 2.55, 0], at=[[x, 0, 0] for x in LX], bevel=.05)
box("e_foot", "e_smp", "m1", [1.35, .25, 4.0], [EX, 1.92, 0], at=[[x, 0, 0] for x in LX])
LT = 3.3
box("e_edge", "e_edge", "edgeLit", [.1, 1.5, 4.04], [EX, 2.55, 0], at=[[x + s * .58, 0, 0] for x in LX for s in (-1, 1)])
# 鏡柱（從腔頂往上）
CB = 10.7
cyl("e_obj", "e_col", "steel", 1.6, 1.6, [EX, CB + .8, 0], axis="y")
cyl("e_objCoil", "e_col", "cu", 1.72, .7, [EX, CB + .8, 0], axis="y")
cyl("e_objPole", "e_col", "steelHi", .45, .9, [EX, CB - .3, 0], axis="y")
cyl("e_defl", "e_col", "steel2", 1.1, 1.4, [EX, CB + 2.4, 0], axis="y")
box("e_deflC", "e_col", "cuHi", [.5, 1.0, .5], [EX, CB + 2.4, 0], at=[[1.15, 0, 0], [-1.15, 0, 0], [0, 0, 1.15], [0, 0, -1.15]])
cyl("e_cond", "e_col", "steel", 1.35, 1.4, [EX, CB + 4.1, 0], axis="y")
cyl("e_condCoil", "e_col", "cu", 1.45, .6, [EX, CB + 4.1, 0], axis="y")
cyl("e_ring", "e_col", "steelHi", 1.25, .18, [EX, CB + 1.7, 0], axis="y", at=[[0, 0, 0], [0, 1.6, 0], [0, 3.2, 0], [0, 4.9, 0]])
cyl("e_gun", "e_col", "dark", 1.0, 1.6, [EX, CB + 5.7, 0], axis="y")
cyl("e_gunIns", "e_col", "white", .7, .8, [EX, CB + 6.9, 0], axis="y")
cyl("e_gunTop", "e_col", "steelHi", .5, .4, [EX, CB + 7.5, 0], axis="y")
cyl("e_hv", "e_col", "dark2", .18, 1.6, [EX + .6, CB + 8.2, 0], axis="y")
# 二次電子偵測器（右上、斜向樣品）＋訊號螢幕（左，牆上）
box("e_det", "e_det", "dark", [1.6, 1.0, 1.4], [EX + 4.4, 6.0, 0], bevel=.06, rot=[0, 0, -30])
box("e_detGrid", "e_det", "steelHi", [.06, .8, 1.2], [EX + 3.62, 5.6, 0], rot=[0, 0, -30])
cyl("e_detArm", "e_det", "steel2", .2, 3.0, [EX + 5.9, 7.3, 0], axis="y", rot=[90, 0, -30])
box("e_scr", "e_scr", "screen", [5.2, 3.0, .2], [EX - 4.3, 7.3, -3.0], bevel=.04)
box("e_scrBase", "e_scr", "tick", [4.6, .04, .05], [EX - 4.3, 6.4, -2.88])
trace("e_wave", "e_scr", [EX - 6.5, 6.6, -2.85], [EX - 2.1, 6.6, -2.85], amp=.9, cycles=5, rate=1.2, color="eSec", up=(0, 1, 0))
# 電子：鏡柱內主電子（細束、直下）；下段光柱會左右擺（偏轉線圈掃描）；邊緣放出的二次電子沿短弧被偵測器吸過去
flowx("e_pri", "e_col", [[EX, CB + 6.1, 0], [EX, CB - .7, 0]], shape="dot", n=7, size=.1, rate=1.4, color="eBeam", rim="eBeamRim", trail=3)
cyl("e_beam", "e_beam", "beamE", .07, CB - .8 - LT, [EX, (CB - .8 + LT) / 2, 0], axis="y")
swing("e_scan", "e_beam", ["e_beam"], [EX, CB - .8, 0], [0, 0, 1], 22, .45)
for k, x in enumerate((-2.2 + .58, 0 - .58, 0 + .58, 2.2 - .58)):
    flowx(f"e_sec{k}", "e_vac", [[EX + x, LT + .05, .4], [EX + x + .9, LT + 1.4, .4], [EX + 2.6, 5.0, .2], [EX + 3.6, 5.6, 0]], shape="dot", n=3, size=.07, rate=1.1, color="eSec", rim="eSecRim", trail=2)
glow("e_edgeOn", "e_edge", ["e_edge"], "lp_sig", steady=False, g=1.0, freq=2.0)
glow("e_gunOn", "e_col", ["e_gunTop"], "lp_warm", steady=True, g=.9)
glow("e_deflOn", "e_col", ["e_deflC"], "lp_proc", steady=False, g=.8, freq=1.8)
anchor("e_gun", "e_col", [EX - 1.0, CB + 5.9, .9], dx=-150, dy=-40)
anchor("e_cond", "e_col", [EX + 1.45, CB + 4.1, .6], dx=150, dy=-50)
anchor("e_defl", "e_col", [EX - 1.4, CB + 2.4, .6], dx=-150, dy=0)
anchor("e_obj", "e_col", [EX + 1.7, CB + .8, .6], dx=150, dy=-10)
anchor("e_det", "e_det", [EX + 5.0, 6.4, .7], dx=200, dy=-90)
anchor("e_edge", "e_edge", [EX + .58, LT, 2.0], dx=120, dy=90)
anchor("e_line", "e_smp", [EX - 4.4, LT, 2.0], dx=-120, dy=90)
anchor("e_scr", "e_scr", [EX - 4.3, 8.8, -2.9], dx=-60, dy=-80)

# ═════════ O：疊對光柵 x=180 ═════════
OX = 180
box("o_base", "o_sub", "dark2", [18, .6, 7], [OX, .3, 0], bevel=.04)
box("o_si", "o_sub", "si", [16, 1.4, 6], [OX, 1.3, 0])
GP = 2.0; GX = [-5 + GP * i for i in range(6)]
box("o_lo", "o_lo", "grB", [1.0, .8, 5.6], [OX, 2.4, 0], at=[[x, 0, 0] for x in GX], bevel=.03)
box("o_mid", "o_mid", "ox", [16, .9, 6], [OX, 3.25, 0])
box("o_up", "o_up", "grO", [1.0, .7, 5.6], [OX, 4.05, 0], at=[[x, 0, 0] for x in GX], bevel=.03)
box("o_mark", "o_up", "tick", [.08, .9, .08], [OX + GX[2] - .5, 4.05, 2.9], at=[[0, 0, 0]])
box("o_markLo", "o_lo", "tick", [.08, 1.8, .08], [OX + GX[2] - .5, 2.9, 2.9])
# 光源（頂部）＋左右偵測器（各有一根支架立在底座上）
box("o_srcH", "o_opt", "dark", [2.4, 1.4, 1.8], [OX, 14.0, 0], bevel=.06)
cyl("o_srcL", "o_opt", "glass", .5, .4, [OX, 13.2, 0], axis="y")
for s, nm in ((1, "P"), (-1, "N")):
    box(f"o_det{nm}", "o_opt", "dark", [2.0, 1.4, 1.6], [OX + s * 8.6, 12.4, 0], bevel=.06, rot=[0, 0, s * 35])
    box(f"o_det{nm}W", "o_opt", "glass", [1.4, .1, 1.0], [OX + s * 8.15, 11.75, 0], rot=[0, 0, s * 35])
    box(f"o_post{nm}", "o_opt", "steel2", [.3, 11.5, .3], [OX + s * 9.4, 6.0, -1.0])
box("o_srcPost", "o_opt", "steel2", [.3, 3.0, .3], [OX, 15.8, -.8])
box("o_lightbox", "o_lite", "lightBox", [19, 11, .6], [OX, 8.7, 0])
PT = (OX, 4.42)
flowx("o_in", "o_lite", [[OX - .35, 13.0, 0], [OX - .35, PT[1] + .02, 0]], shape="liquid", n=5, size=.24, rate=.9, color="litW", rim="litWRim", band=.09, bandO=.8)
flowx("o_m0", "o_lite", [[OX + .35, PT[1] + .02, 0], [OX + .35, 13.0, 0]], shape="liquid", n=4, size=.2, rate=.9, color="litW", rim="litWRim", band=.06, bandO=.5)
flowx("o_p1", "o_lite", [[OX + .3, PT[1] + .02, 0], [OX + 7.7, 11.5, 0]], shape="liquid", n=5, size=.26, rate=.9, color="litA", rim="litARim", band=.1, bandO=.85)
flowx("o_n1", "o_lite", [[OX - .3, PT[1] + .02, 0], [OX - 7.7, 11.5, 0]], shape="liquid", n=5, size=.26, rate=.9, color="litC", rim="litCRim", band=.1, bandO=.85)
glow("o_detPon", "o_opt", ["o_detPW"], "lp_warm", steady=True, g=1.0)
glow("o_detNon", "o_opt", ["o_detNW"], "lp_sig", steady=True, g=1.0)
glow("o_offOn", "o_up", ["o_mark"], "lp_bad", steady=False, g=1.0, freq=2.2)
anchor("o_lo", "o_lo", [OX + GX[0] - .5, 2.4, 2.8], dx=-120, dy=60)
anchor("o_up", "o_up", [OX + GX[5] + .5, 4.4, 2.8], dx=240, dy=60)
anchor("o_detP", "o_opt", [OX + 9.6, 13.0, .8], dx=80, dy=-60)
anchor("o_detN", "o_opt", [OX - 9.6, 13.0, .8], dx=-80, dy=-60)
anchor("o_src", "o_opt", [OX + 1.2, 14.4, .9], dx=200, dy=-10)
anchor("o_off", "o_up", [OX + GX[2] - .5, 4.6, 2.9], dx=-130, dy=-80)

# ═════════ D：缺陷檢測 x=240（晶圓＋光帶掃描＋缺陷；電子束複檢鏡柱）；s9 放行＋離子束 ═════════
DX = 240; DWR = 4.2
parts_lib.append({"part": "wafer", "id": "dw", "pos": [DX, 1.76, 0], "r": DWR, "step": .62, "t": .08, "bad": 0, "chuck": True})
box("d_base", "d_base", "dark2", [16, .6, 12], [DX, .3, 0], bevel=.04)
box("d_railZ", "d_base", "rail", [.5, .3, 11], [DX, .75, 0], at=[[-6.6, 0, 0], [6.6, 0, 0]])
box("d_coil", "d_base", "cu", [.5, .16, .5], [DX - 6.6, .98, 0], at=[[0, 0, -5 + 1.0 * j] for j in range(11)] + [[13.2, 0, -5 + 1.0 * j] for j in range(11)])
WY = 1.76 + .08     # 晶圓面（庫的 wafer：原點在晶圓底；吸盤與支柱在下面）
# 光學檢測橋架（沿 z 掃）：兩根立柱＋橫樑＋檢測頭（明場／暗場兩個鏡頭）＋光帶
SZ0 = -DWR - .6
box("d_gPost", "d_scan", "steel2", [.6, 4.0, .8], [DX, 2.9, SZ0], at=[[-6.6, 0, 0], [6.6, 0, 0]])
box("d_gBeam", "d_scan", "panel", [14.0, .8, .9], [DX, 5.2, SZ0], bevel=.05)
box("d_head", "d_scan", "dark", [3.2, 1.6, 1.4], [DX, 4.0, SZ0], bevel=.06)
cyl("d_bf", "d_scan", "glass", .32, .6, [DX - .8, 3.0, SZ0], axis="y")
cyl("d_df", "d_scan", "glass", .32, .6, [DX + .8, 3.0, SZ0], axis="y")
box("d_band", "d_scan", "band", [9.6, .05, .32], [DX, WY + .12, SZ0])
box("d_bandBox", "d_scan", "lightBox", [9.6, 2.6, .4], [DX, WY + 1.4, SZ0])
for i in range(5): box(f"d_ray{i}", "d_scan", "band", [.06, 2.5, .06], [DX - 3.2 + 1.6 * i, WY + 1.4, SZ0], rot=[0, 0, (i - 2) * 8])
glow("d_bandOn", "d_scan", ["d_band"] + [f"d_ray{i}" for i in range(5)], "lp_warm", steady=False, g=.9, freq=2.4)
# 缺陷：顆粒（不規則團塊）、刮痕（細弧）、孔洞；每顆一層（被掃到才出現）；色點環
DEF = [(-1.8, -2.2, "p"), (1.5, -1.0, "s"), (-.6, .4, "p"), (2.4, 1.6, "h"), (-2.6, 2.3, "p")]
for i, (x, z, kd) in enumerate(DEF):
    L = f"d_def{i}"
    tube(f"d_dot{i}", L, "defO", .34, .22, .04, [DX + x, WY + .05, z])
    if kd == "p": sph(f"d_pt{i}", L, "part", .2, [DX + x, WY + .1, z], at=[[0, .06, 0], [.18, .08, .08], [-.1, .1, .15], [.07, .14, -.12]])
    elif kd == "s": box(f"d_pt{i}", L, "part", [.5, .04, .05], [DX + x, WY + .06, z], at=[[-.2, 0, -.05], [0, 0, 0], [.2, 0, .06]], rot=[0, 20, 0])
    else: cyl(f"d_pt{i}", L, "slot", .1, .05, [DX + x, WY + .05, z], axis="y")
glow("d_dotsOn", "d_def0", [f"d_dot{i}" for i in range(len(DEF))], "lp_heat", steady=False, g=1.0, freq=1.8)
# 電子束複檢鏡柱（右後方吊在橫樑上，會移到缺陷上方）
RX0, RZ0 = DX + 4.0, 3.4
box("d_rBeam", "d_rbase", "panel", [.9, .8, 12.0], [DX + 6.6, 7.4, 0], bevel=.05)
box("d_rPost", "d_rbase", "steel2", [.6, 6.6, .8], [DX + 6.6, 4.1, -5.6])
box("d_rCar", "d_rev", "steel2", [1.6, .7, 1.4], [RX0, 7.0, RZ0], bevel=.04)
box("d_rArm", "d_rev", "steel2", [2.9, .4, .5], [RX0 + 1.35, 7.4, RZ0])
cyl("d_rCol", "d_rev", "steelHi", .55, 3.8, [RX0, 4.75, RZ0], axis="y")
cyl("d_rRing", "d_rev", "cu", .64, .3, [RX0, 5.0, RZ0], axis="y", at=[[0, 0, 0], [0, 1.2, 0]])
cyl("d_rTip", "d_rev", "steel2", .28, .6, [RX0, 2.6, RZ0], axis="y")
box("d_rVac", "d_rev", "vac", [.8, 2.2, .8], [RX0, 1.4 + .1, RZ0])
flowx("d_rBeamE", "d_rev", [[RX0, 2.3, RZ0], [RX0, WY + .12, RZ0]], shape="dot", n=5, size=.07, rate=1.5, color="eBeam", rim="eBeamRim", trail=2)
# s9：離子源（頂上）＋離子束（帶＋的紅色小球，沿直線加速往下）＋放行標記
box("d_ionSrc", "d_ion", "dark", [3.6, 1.4, 2.0], [DX, 9.2, 0], bevel=.06)
cyl("d_ionLens", "d_ion", "cu", .8, .5, [DX, 8.3, 0], axis="y")
box("d_ionPost", "d_ion", "steel2", [.4, 2.0, .4], [DX, 10.6, -.6])
box("d_ionBox", "d_ion", "ionBox", [7.0, 7.0, 3.0], [DX, 4.6, 0])
flowx("d_ions", "d_ion", [[DX, 7.9, 0], [DX, WY + .15, 0]], shape="dot", n=6, lanes=5, gap=1.4, ldir=(1, 0, 0), size=.2, rate=1.3, color="ion", rim="ionRim", trail=4)
tube("d_okRing", "d_ok", "okG", DWR + .35, DWR + .15, .06, [DX, WY + .02, 0])
glow("d_okOn", "d_ok", ["d_okRing"], "lp_good", steady=True, g=1.0)
anchor("d_wf", "dw", [DX - DWR + .2, WY, 1.6], dx=-120, dy=60)
anchor("d_head", "d_scan", [DX + 1.7, 4.4, SZ0 + .7], dx=130, dy=-70)
anchor("d_def0", "d_def0", [DX - 1.8, WY + .1, -2.2], dx=-60, dy=-230)
anchor("d_def2", "d_def2", [DX - .6, WY + .1, .4], dx=-60, dy=-230)
anchor("d_rev", "d_rev", [RX0 + .6, 4.6, RZ0], dx=120, dy=-60)
anchor("d_ion", "d_ion", [DX + 1.9, 9.2, 1.0], dx=120, dy=-30)
anchor("d_map", "dw", [DX + DWR - .3, WY, 1.5], dx=130, dy=70)

# ═════════ P：線路疊層 x=300（s1 磨平的膜、兩層線路差兩奈米；s2 一層層拆開） ═════════
PX = 300; PW, PD = 14, 5
box("p_si", "p_si", "si", [PW, 1.4, PD], [PX, .7, 0])
box("p_gate", "p_tr", "ox", [PW, .6, PD], [PX, 1.7, 0])
box("p_gateG", "p_tr", "gate", [.5, .6, PD - .6], [PX, 2.3, 0], at=[[-6 + 1.2 * i, 0, 0] for i in range(11)], bevel=.02)
box("p_m1F", "p_m1", "film", [PW, .9, PD], [PX, 3.05, 0])
box("p_m1L", "p_m1", "m1", [.7, .6, PD - .4], [PX, 3.25, 0], at=[[-5.6 + 1.6 * i, 0, 0] for i in range(8)], bevel=.02)
box("p_m2F", "p_m2", "film", [PW, .9, PD], [PX, 3.95, 0])
box("p_m2Top", "p_m2", "film2", [PW, .04, PD], [PX, 4.42, 0])
box("p_m2L", "p_m2", "m2", [.7, .55, PD - .4], [PX, 4.72, 0], at=[[-5.6 + 1.6 * i + .18, 0, 0] for i in range(8)], bevel=.02)
box("p_vias", "p_m2", "cuHi", [.3, .9, .3], [PX, 3.95, 0], at=[[-5.6 + 1.6 * i, 0, 0] for i in range(0, 8, 2)])
# 兩奈米的錯位標記（上下兩條刻線）
box("p_tk", "p_mark", "tick", [.07, 1.9, .07], [PX - 5.6 + 1.6 * 3, 4.3, PD / 2 + .1], at=[[0, 0, 0], [.18, 0, 0]])
box("p_tkH", "p_mark", "tick", [.6, .07, .07], [PX - 5.6 + 1.6 * 3 + .09, 5.3, PD / 2 + .1])
# 量測頭（s1 掃過磨平的膜）：小鏡頭＋向下的光點
box("p_probe", "p_probe", "dark", [1.4, .9, 1.2], [PX - 5, 7.2, 0], bevel=.05)
cyl("p_probeL", "p_probe", "glass", .3, .4, [PX - 5, 6.6, 0], axis="y")
box("p_probeArm", "p_probe", "steel2", [.3, 3.0, .3], [PX - 5, 9.1, -.4])
box("p_probeBox", "p_probe", "lightBox", [.6, 2.9, .6], [PX - 5, 4.95, 0])
flowx("p_probeLt", "p_probe", [[PX - 5, 6.35, 0], [PX - 5, 3.53, 0]], shape="liquid", n=3, size=.2, rate=1.0, color="litW", rim="litWRim", band=.07, bandO=.8)
glow("p_m1bad", "p_m1", ["p_m1L"], "lp_bad", steady=False, g=.9, freq=2.0)
glow("p_waste", "p_m2", ["p_m2L", "p_m2F"], "lp_bad", steady=True, g=.55)
glow("p_ok0", "p_si", ["p_si"], "lp_good", steady=True, g=.6)
glow("p_ok1", "p_tr", ["p_gateG"], "lp_good", steady=True, g=.8)
glow("p_ok2", "p_m1", ["p_m1L"], "lp_good", steady=True, g=.8)
glow("p_ok3", "p_m2", ["p_m2L"], "lp_good", steady=True, g=.8)
sph("p_defect", "p_def", "part", .16, [PX + 2.4, 4.5, 1.2], at=[[0, 0, 0], [.14, .05, .06], [-.08, .07, .1]])
tube("p_defRing", "p_def", "defO", .45, .32, .04, [PX + 2.4, 4.46, 1.2])
glow("p_defOn", "p_def", ["p_defRing"], "lp_heat", steady=False, g=1.0, freq=2.0)
glow("p_markOn", "p_mark", ["p_tk", "p_tkH"], "lp_warm", steady=False, g=1.0, freq=2.0)
anchor("p_si", "p_si", [PX + PW / 2, .7, PD / 2], dx=110, dy=40)
anchor("p_tr", "p_tr", [PX + PW / 2, 2.0, PD / 2], dx=110, dy=20)
anchor("p_m1", "p_m1", [PX - PW / 2, 3.1, PD / 2], dx=-120, dy=110)
anchor("p_m2", "p_m2", [PX - PW / 2, 4.6, PD / 2], dx=-110, dy=-30)
anchor("p_mark", "p_mark", [PX - 5.6 + 1.6 * 3 + .3, 5.3, PD / 2], dx=170, dy=-40)
anchor("p_flat", "p_m2", [PX - 2.5, 4.42, PD / 2], dx=-130, dy=-90)
anchor("p_probe", "p_probe", [PX - 4.2, 7.4, .6], dx=120, dy=-130)
anchor("p_def", "p_def", [PX + 2.8, 4.6, 1.5], dx=120, dy=-60)

for _l in layers:
    if _l["id"] in ("t_room", "e_ch", "d_base", "f_stage", "d_rbase"): _l["bg"] = True
model = {
 "name": "tech-metrology：量測與檢測。站別：T 量測島 x=0、F 膜厚 x=60、E 電子束線寬 x=120、O 疊對 x=180、D 缺陷檢測 x=240、P 線路疊層 x=300（genmodel.py 產生）。",
 "unit": "示意，非實際比例", "size": {"w": 14, "h": 2, "r": .1, "t": 6},
 "palette": palette, "materials": materials, "layers": layers, "anchors": anchors,
 "parts": parts_lib + parts, "actions": actions,
 "pose": {"yaw0": 0, "yawIso": 0, "drift": 0},
 "camera": {"stand": {"d": 24, "elev": 24, "y": 4}},
 "fx": {"dpr": 1, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
}
json.dump(model, open("/home/user/ai-mp4/videos/tech-metrology/model.json", "w"), ensure_ascii=False, indent=1)
print("parts", len(parts), "layers", len(layers), "actions", len(actions), "WTOP", WTOP, "PX0", PX0, "BIN", BINX, BINZ)
