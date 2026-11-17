# 產生 videos/tech-icdesign/model.json（改這支再重產）。座標：x 右、y 上、z 朝觀眾（俯視時畫面上方＝-z）；各站以 x 偏移分開，鏡頭切換。
# S x=0 電晶體＋五層金屬（爆炸剖析、訊號流動）｜D x=60 設計流程（規格→程式→模擬→布局繞線→光罩）｜M x=120 光罩曝光（光源→光罩→鏡組→晶圓）｜Z x=180 整顆晶片＋設計電腦（公司引線）
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

palette = {"dark": "#3F4E6B", "dark2": "#2E3340", "steel": "#9AA8BE", "steel2": "#7D8AA1", "steelHi": "#C5D0E2", "cu": "#C98A3E", "cuHi": "#E8A45E",
 "si": "#B8C2D6", "siTop": "#CBD4E4", "siDk": "#8A98B4", "sti": "#E2E8F2", "white": "#F6F2E8", "paper": "#FFFDF8", "slot": "#2A2E3B",
 "nSi": "#7FB6E8", "pSi": "#EDA0B5", "nSD": "#2F7FE0", "pSD": "#E0536F", "gate": "#F2A93B", "ct": "#D5DCE8", "via": "#9AA8BE",
 "m1": "#F08A24", "m2": "#E8613C", "m3": "#8A5CE0", "m4": "#2A9D8F", "m5": "#2F6FE0",
 "elec": "#FFFFFF", "elecRim": "#1F6FEB", "elecTrail": "#38B6FF", "gOn": "#FFC23D",
 "cpu": "#3F6FD8", "cpu2": "#6B93EA", "npu": "#7A5CE0", "npu2": "#A58CF2", "mem": "#2A9D8F", "mem2": "#4CBDAE", "io": "#F2A93B", "io2": "#F6C46B",
 "code1": "#2A9D8F", "code2": "#F2A93B", "code3": "#6B93EA", "code4": "#E8613C", "wv1": "#38B6FF", "wv2": "#FFB020", "wv3": "#14A38B",
 "glass": "#CFE6F5", "chrome": "#1E2433", "beam": "#8E7CFF", "beamHi": "#C7BFFF", "lens": "#9EC3E8", "wafer": "#B4C2DA", "die": "#7FA4E0", "dieHi": "#E8613C",
 "screen": "#14213D", "led": "#FF5A1F", "lp_heat": "#FF7A2F", "lp_bad": "#E0472F", "lp_sig": "#38B6FF", "lp_sigRim": "#1F6FEB", "lp_good": "#14A38B", "lp_warm": "#FFB020", "dashC": "#E0472F"}
def M(color, **k): return {"kind": "std", "color": color, "rough": 0.45, "metal": 0.1, **k}
def G(color, op, **k): return {"kind": "phys", "color": color, "rough": 0.1, "metal": 0, "clearcoat": 0.8, "opacity": op, "env": 0.5, **k}
materials = {
 "dark": M("dark", rough=.5, metal=.2), "dark2": M("dark2", rough=.35, metal=.3), "steel": M("steel", rough=.3, metal=.85, env=.5), "steel2": M("steel2", rough=.35, metal=.8),
 "steelHi": M("steelHi", rough=.25, metal=.8, env=.7), "cu": M("cu", rough=.3, metal=.9, env=.6), "cuHi": M("cuHi", rough=.25, metal=.9, env=.8),
 "si": M("si", rough=.55, metal=.15), "siDk": M("siDk", rough=.55, metal=.2), "siTop": M("siTop", rough=.3, metal=.4, tex="traces", texScale=.5, env=.7), "sti": M("sti", rough=.4, metal=0),
 "white": M("white", rough=.55), "paper": M("paper", rough=.7, metal=0), "slot": {"kind": "unlit", "color": "slot"},
 "nSi": M("nSi", rough=.4, metal=.1), "pSi": M("pSi", rough=.4, metal=.1), "nSD": M("nSD", rough=.35, metal=.2), "pSD": M("pSD", rough=.35, metal=.2),
 "gate": M("gate", rough=.3, metal=.9, tex="brushed", texScale=1.6, env=.6), "ct": M("ct", rough=.3, metal=.85, env=.6), "via": M("via", rough=.3, metal=.85, env=.6),
 "m1": M("m1", rough=.28, metal=.9, tex="brushed", texScale=1.8, env=.6), "m2": M("m2", rough=.28, metal=.9, tex="brushed", texScale=1.8, env=.6),
 "m3": M("m3", rough=.28, metal=.85, tex="brushed", texScale=1.8, env=.6), "m4": M("m4", rough=.28, metal=.85, tex="brushed", texScale=1.8, env=.6), "m5": M("m5", rough=.25, metal=.85, tex="brushed", texScale=2.0, env=.7),
 "cpu": M("cpu", rough=.4, metal=.2), "cpu2": M("cpu2", rough=.4, metal=.2), "npu": M("npu", rough=.4, metal=.2), "npu2": M("npu2", rough=.4, metal=.2),
 "mem": M("mem", rough=.4, metal=.2), "mem2": M("mem2", rough=.4, metal=.2), "io": M("io", rough=.35, metal=.4), "io2": M("io2", rough=.35, metal=.4),
 "code1": {"kind": "unlit", "color": "code1"}, "code2": {"kind": "unlit", "color": "code2"}, "code3": {"kind": "unlit", "color": "code3"}, "code4": {"kind": "unlit", "color": "code4"},
 "wv1": {"kind": "unlit", "color": "wv1"}, "wv2": {"kind": "unlit", "color": "wv2"}, "wv3": {"kind": "unlit", "color": "wv3"}, "cur": {"kind": "unlit", "color": "lp_bad"},
 "glass": G("glass", .3), "chrome": M("chrome", rough=.3, metal=.5), "lens": G("lens", .5), "wafer": {"kind": "phys", "color": "wafer", "rough": .1, "metal": .4, "clearcoat": 1, "env": .8},
 "die": M("die", rough=.3, metal=.5, tex="traces", texScale=.35, env=.8), "dieHi": M("dieHi", rough=.3, metal=.4), "screen": {"kind": "screen", "color": "screen", "rough": .2, "env": .4},
 "beam": {"kind": "unlit", "color": "beam", "opacity": .34}, "beamHi": {"kind": "unlit", "color": "beamHi", "opacity": .55}, "led": {"kind": "unlit", "color": "led"},
 "rt1": {"kind": "unlit", "color": "m1"}, "rt2": {"kind": "unlit", "color": "m4"},
}
materials = {"m_" + k: v for k, v in materials.items()}

def flow(key, lay, path, n=3, lanes=1, gap=.2, ldir=(1, 0, 0), size=.3, rate=.5, color="elec", rim="elecRim", trail=3, **kw):
    layer(lay)
    d = {"type": "flow", "layer": lay, "path": path, "n": n, "lanes": lanes, "laneGap": gap, "laneDir": list(ldir), "size": size, "shape": "dot",
         "rate": rate, "color": color, "rim": rim, "rimScale": 1.7, "rimO": .45, "trail": trail, "trailGap": .03, "trailColor": "elecTrail", "track": False}
    d.update(kw); actions[key] = d
def pt(lay, x, y, z): return {"layer": lay, "p": [R(x), R(y), R(z)]}
def glow(key, lay, ps, color="gOn", steady=True, g=.9, freq=2.2):
    layer(lay)
    d = {"type": "pulse", "layer": lay, "parts": ps, "color": color, "glow": g, "halo": 0}
    if steady: d["steady"] = True
    else: d["freq"] = freq
    actions[key] = d

# ═════════ S：電晶體＋五層金屬（平面 34×18；高度由下往上堆；每層一個 layer，爆炸時各自 dy） ═════════
# 一顆反相器：PMOS 在畫面上方（z 負）、NMOS 在下方（z 正）；三條閘極（中間那條是主角，兩側是鄰居）；訊號 M5→M4→M3→M2→M1→閘極，輸出再原路往上
# 俯視圖 art ic-cell（src/components/three/HudIc.tsx）用同一份座標：畫面 y＝-z。
SY = {"sub": 0.0, "dev": 1.0, "ct": 2.4, "m1": 3.0, "v1": 3.6, "m2": 4.2, "v2": 4.8, "m3": 5.4, "v3": 6.0, "m4": 6.6, "v4": 7.2, "m5": 7.8}
box("sub_body", "sub", "si", [34, 1.0, 18], [0, .5, 0], bevel=.1)
box("sub_sti", "sub", "sti", [34, .14, 4.6], [0, 1.0, 0], bevel=.02)
box("sub_sti2", "sub", "sti", [34, .14, 3.2], [0, 1.0, 0], at=[[0, 0, -7.4], [0, 0, 7.4]], bevel=.02)
# 主動區（兩條）＋源極汲極
box("pStrip", "dev", "pSi", [34, .5, 3.4], [0, 1.25, -4])
box("nStrip", "dev", "nSi", [34, .5, 3.4], [0, 1.25, 4])
box("pSDm", "dev", "pSD", [5.2, .9, 3.6], [0, 1.45, -4], at=[[-4.5, 0, 0], [4.5, 0, 0]], bevel=.05)
box("nSDm", "dev", "nSD", [5.2, .9, 3.6], [0, 1.45, 4], at=[[-4.5, 0, 0], [4.5, 0, 0]], bevel=.05)
box("pSDn", "dev", "pSD", [3.6, .9, 3.6], [0, 1.45, -4], at=[[-14.2, 0, 0], [14.2, 0, 0]], bevel=.05)
box("nSDn", "dev", "nSD", [3.6, .9, 3.6], [0, 1.45, 4], at=[[-14.2, 0, 0], [14.2, 0, 0]], bevel=.05)
box("gates", "dev", "gate", [1.6, 1.4, 14.4], [0, 1.7, 0], at=[[-9, 0, 0], [0, 0, 0], [9, 0, 0]], bevel=.08)
# 接點：源極汲極 4 顆＋閘極 1 顆
cyl("ct_sd", "ct", "ct", .55, .6, [0, 2.7, 0], axis="y", at=[[-4.5, 0, -4], [-4.5, 0, 4], [4.5, 0, -4], [4.5, 0, 4], [0, 0, 0]])
# M1：電源軌（上 VDD、下 VSS）、兩個電源接腳、輸出直段＋橫段、輸入腳
box("m1_rail", "m1", "m1", [34, .6, 1.6], [0, 3.3, 0], at=[[0, 0, -8], [0, 0, 8]], bevel=.05)
box("m1_tapP", "m1", "m1", [1.6, .6, 4.0], [-4.5, 3.3, -6], bevel=.05)
box("m1_tapN", "m1", "m1", [1.6, .6, 4.0], [-4.5, 3.3, 6], bevel=.05)
box("m1_out", "m1", "m1", [1.6, .6, 8.8], [4.5, 3.3, 0], bevel=.05)
box("m1_outH", "m1", "m1", [3.9, .6, 1.4], [6.25, 3.3, 0], bevel=.05)
box("m1_in", "m1", "m1", [3.9, .6, 1.4], [-1.5, 3.3, 0], bevel=.05)
cyl("v1_v", "v1", "via", .5, .6, [0, 3.9, 0], axis="y", at=[[-3, 0, 0], [8, 0, 0]])
box("m2_in", "m2", "m2", [1.4, .6, 5.8], [-3, 4.5, 2.15], bevel=.05)
box("m2_out", "m2", "m2", [1.4, .6, 5.8], [8, 4.5, -2.15], bevel=.05)
box("m2_bg", "m2", "m2", [1.4, .6, 16], [0, 4.5, 0], at=[[-8, 0, 0], [12, 0, 0], [-15, 0, 0]], bevel=.05)
cyl("v2_v", "v2", "via", .5, .6, [0, 5.1, 0], axis="y", at=[[-3, 0, 5], [8, 0, -5]])
box("m3_in", "m3", "m3", [10.4, .6, 1.4], [-7.5, 5.7, 5], bevel=.05)
box("m3_out", "m3", "m3", [7.4, .6, 1.4], [11, 5.7, -5], bevel=.05)
box("m3_bg", "m3", "m3", [11, .6, 1.4], [0, 5.7, 0], at=[[-11.5, 0, 0], [0, 0, -8], [0, 0, 8]], bevel=.05)
box("m3_bg2", "m3", "m3", [7, .6, 1.4], [13.5, 5.7, 2.5], bevel=.05)
cyl("v3_v", "v3", "via", .5, .6, [0, 6.3, 0], axis="y", at=[[-12, 0, 5], [14, 0, -5]])
box("m4_in", "m4", "m4", [1.4, .6, 11.4], [-12, 6.9, 0], bevel=.05)
box("m4_out", "m4", "m4", [1.4, .6, 11.4], [14, 6.9, 0], bevel=.05)
box("m4_bg", "m4", "m4", [1.4, .6, 16], [0, 6.9, 0], at=[[-6, 0, 0], [3, 0, 0]], bevel=.05)
cyl("v4_v", "v4", "via", .55, .6, [0, 7.5, 0], axis="y", at=[[-12, 0, -5], [14, 0, 5]])
box("m5_in", "m5", "m5", [6, 1.2, 2.0], [-14, 8.4, -5], bevel=.08)
box("m5_out", "m5", "m5", [4, 1.2, 2.0], [15, 8.4, 5], bevel=.08)
box("m5_bg", "m5", "m5", [34, 1.2, 2.0], [0, 8.4, 0], bevel=.08)
LAYER_Y = {"sub": .5, "dev": 1.7, "ct": 2.7, "m1": 3.3, "v1": 3.9, "m2": 4.5, "v2": 5.1, "m3": 5.7, "v3": 6.3, "m4": 6.9, "v4": 7.5, "m5": 8.4}
# 訊號路徑（輸入：M5 左端→往下穿過各層→閘極；輸出：汲極→往上穿過各層→M5 右端）
Y = LAYER_Y
IN = [pt("m5", -17, Y["m5"], -5), pt("m5", -12, Y["m5"], -5), pt("m4", -12, Y["m4"], -5), pt("m4", -12, Y["m4"], 5), pt("m3", -12, Y["m3"], 5), pt("m3", -3, Y["m3"], 5),
      pt("m2", -3, Y["m2"], 5), pt("m2", -3, Y["m2"], 0), pt("m1", -3, Y["m1"], 0), pt("m1", 0, Y["m1"], 0), pt("dev", 0, 2.3, 0)]
OUT = [pt("dev", 4.5, 2.3, 0), pt("m1", 4.5, Y["m1"], 0), pt("m1", 8, Y["m1"], 0), pt("m2", 8, Y["m2"], 0), pt("m2", 8, Y["m2"], -5), pt("m3", 8, Y["m3"], -5), pt("m3", 14, Y["m3"], -5),
       pt("m4", 14, Y["m4"], -5), pt("m4", 14, Y["m4"], 5), pt("m5", 14, Y["m5"], 5), pt("m5", 17, Y["m5"], 5)]
flow("s_in", "m5", IN, n=4, size=.5, rate=.32, drive=True, minVisible=.35, rest=18, restO=.6)
flow("s_out", "m5", OUT, n=4, size=.5, rate=.32, drive=True, minVisible=.35, rest=18, restO=.6)
glow("s_gate", "dev", ["gates"], "gOn", steady=True, g=.8)
anchor("a_sub", "sub", [14.5, .5, 8.8], dx=130, dy=60)
anchor("a_dev", "dev", [-15.5, 1.7, 8], dx=-140, dy=60)
anchor("a_ct", "ct", [4.5, 2.7, 4], dx=150, dy=20)
anchor("a_m1", "m1", [14, 3.3, 8], dx=150, dy=20)
anchor("a_m2", "m2", [12, 4.5, 8], dx=150, dy=-10)
anchor("a_m3", "m3", [14, 5.7, 8], dx=150, dy=-10)
anchor("a_m4", "m4", [3, 6.9, 8], dx=150, dy=-30)
anchor("a_m5", "m5", [16, 8.4, 8.4], dx=140, dy=-50)
anchor("a_via", "v2", [8, 5.1, -5], dx=150, dy=-40)

# ═════════ D：設計流程（x=60）：規格→程式→模擬驗證→布局繞線→光罩（五塊板子，左到右） ═════════
DX = 60
XS = [-13, -6.5, 0, 6.5, 13]
SL = [5.2, .5, 6.8]
box("d_table", "d_tab", "dark2", [34, .2, 9.2], [DX, -.1, 0], bevel=.04)
# 1 規格：白紙＋標題條＋文字行＋勾選框
box("sp_base", "sp", "paper", SL, [DX + XS[0], .25, 0], bevel=.04)
box("sp_head", "sp", "dieHi", [3.0, .06, .5], [DX + XS[0] - .4, .53, -2.6])
box("sp_line", "sp", "steel2", [3.9, .05, .26], [DX + XS[0], .53, -1.4], at=[[0, 0, .75 * i] for i in range(5)])
box("sp_short", "sp", "steel2", [2.2, .05, .26], [DX + XS[0] - .85, .53, 2.35])
box("sp_chk", "sp", "cpu", [.42, .06, .42], [DX + XS[0] - 2.0, .54, -1.4], at=[[0, 0, 1.5 * i] for i in range(3)])
# 2 程式（RTL）：深色編輯器＋彩色程式行（縮排不同）
box("rt_base", "rt", "dark", SL, [DX + XS[1], .25, 0], bevel=.04)
CODE = [(0, 2.2, "code3"), (.5, 3.0, "code2"), (.5, 1.9, "code1"), (1.0, 3.3, "code1"), (1.0, 2.4, "code4"), (1.0, 3.0, "code2"), (.5, 1.4, "code3"), (.5, 2.8, "code1"), (0, 1.6, "code2")]
for i, (ind, ln, c) in enumerate(CODE):
    box(f"rt_l{i}", "rt", c, [ln, .05, .3], [DX + XS[1] - 2.3 + ind + ln / 2, .53, -2.9 + .72 * i])
# 3 模擬驗證：深色螢幕＋三條波形（方波）＋游標
box("sm_base", "sm", "dark", SL, [DX + XS[2], .25, 0], bevel=.04)
def square(prefix, z, c, segs):
    x = -2.2
    for i, (ln, hi) in enumerate(segs):
        box(f"{prefix}{i}", "sm", c, [ln, .05, .2], [DX + XS[2] + x + ln / 2, .53, z - (.55 if hi else 0)])
        x += ln
        if i < len(segs) - 1: box(f"{prefix}t{i}", "sm", c, [.18, .05, .75], [DX + XS[2] + x, .53, z - .27])
square("w1", -2.0, "wv1", [(.7, 0), (.7, 1), (.7, 0), (.7, 1), (.7, 0), (.7, 1)])
square("w2", 0.0, "wv2", [(1.4, 1), (.7, 0), (.7, 1), (1.4, 0)])
square("w3", 2.0, "wv3", [(.7, 0), (2.1, 1), (.7, 0), (.7, 1)])
box("sm_cur", "sm_cur", "cur", [.12, .07, 6.2], [DX + XS[2] - 2.3, .55, 0])
# 4 布局繞線：晶片底板＋功能區塊＋繞線（兩組線分兩層出現）
box("pr_base", "pr", "dark2", SL, [DX + XS[3], .25, 0], bevel=.04)
for i, (bx, bz, bw, bd, c) in enumerate([(-1.2, -1.7, 2.2, 2.2, "cpu"), (1.2, -1.7, 2.0, 2.2, "npu"), (-1.2, 1.2, 2.2, 1.8, "mem"), (1.2, 1.2, 2.0, 1.8, "io")]):
    box(f"pr_blk{i}", "pr", c, [bw, .12, bd], [DX + XS[3] + bx, .56, bz])
for i in range(6): box(f"pr_a{i}", "pr_r1", "rt1", [.09, .05, 1.2], [DX + XS[3] - 2.2 + .35 * i, .55, -2.4])
box("pr_h1", "pr_r1", "rt1", [4.6, .05, .1], [DX + XS[3], .55, 0], at=[[0, 0, -.45], [0, 0, -.2], [0, 0, .05], [0, 0, .3]])
box("pr_v1", "pr_r2", "rt2", [.1, .05, 5.2], [DX + XS[3], .56, 0], at=[[-.4, 0, 0], [-.15, 0, 0], [.1, 0, 0], [.35, 0, 0]])
box("pr_pad", "pr", "steelHi", [.18, .06, .18], [DX + XS[3], .55, 0], at=[[-2.35 + .5 * i, 0, 3.2] for i in range(10)] + [[-2.35 + .5 * i, 0, -3.2] for i in range(10)])
# 5 光罩：玻璃板＋鉻圖案＋金屬框
box("mk_glass", "mk", "glass", [5.2, .3, 5.2], [DX + XS[4], .3, 0], bevel=.03)
box("mk_frame", "mk", "steel2", [5.6, .18, .22], [DX + XS[4], .3, 0], at=[[0, 0, -2.7], [0, 0, 2.7]])
box("mk_frame2", "mk", "steel2", [.22, .18, 5.6], [DX + XS[4], .3, 0], at=[[-2.7, 0, 0], [2.7, 0, 0]])
PAT = [(-.55, -.55, .7, .7), (.45, -.6, .9, .4), (.4, .1, .5, .9), (-.5, .35, .9, .3), (-.1, .0, .25, .25), (.1, -.1, .1, .5), (-.8, 0.05, .3, .1), (.78, -.85, .3, .1)]
for i, (px, pz, pw, pd) in enumerate(PAT):
    box(f"mk_p{i}", "mk", "chrome", [pw * 2.6, .06, pd * 2.6], [DX + XS[4] + px * 2.2, .5, pz * 2.2])
# 箭頭路徑（資料往下一步流）＋每塊板的亮起
for i in range(4):
    x0 = DX + XS[i] + 2.7; x1 = DX + XS[i + 1] - 2.7
    flow(f"d_f{i}", "d_flow", [[R(x0), 1.0, 0], [R(x1), 1.0, 0]], n=3, size=.26, rate=.9, drive=False)
for k, (nm, ps) in enumerate((("sp", ["sp_base"]), ("rt", ["rt_base"]), ("sm", ["sm_base"]), ("pr", ["pr_base"]), ("mk", ["mk_glass"]))):
    glow(f"d_on{k}", nm, ps, "gOn", steady=True, g=.55)
for k, nm in enumerate(("sp", "rt", "sm", "pr", "mk")):
    anchor(f"d_a{k}", nm, [DX + XS[k] + 2.4, .5, 3.4], dx=60 if k < 4 else 100, dy=90)

# ═════════ M：光罩曝光（x=120）：光源→光罩→鏡組→晶圓（垂直一柱） ═════════
MX = 120
box("m_src", "m_src", "dark2", [4.2, 1.8, 4.2], [MX, 15.0, 0], bevel=.12)
cyl("m_srcT", "m_src", "steel2", 1.3, .5, [MX, 16.1, 0], axis="y")
cyl("m_lamp", "m_lamp", "beamHi", 1.7, .2, [MX, 14.0, 0], axis="y")
# 照明光（光源到光罩，粗）
cyl("m_beam1", "m_beam1", "beam", 2.6, 3.4, [MX, 11.5, 0], axis="y")
# 光罩（上方）：玻璃板＋底面鉻圖案（大）＋金屬框
box("m_mask", "m_mask", "glass", [6.4, .22, 6.4], [MX, 9.8, 0], bevel=.03)
box("m_mfr", "m_mask", "steel2", [7.0, .3, .34], [MX, 9.8, 0], at=[[0, 0, -3.3], [0, 0, 3.3]], bevel=.03)
box("m_mfr2", "m_mask", "steel2", [.34, .3, 6.6], [MX, 9.8, 0], at=[[-3.3, 0, 0], [3.3, 0, 0]], bevel=.03)
for i, (px, pz, pw, pd) in enumerate(PAT):
    box(f"m_mp{i}", "m_mask", "chrome", [pw * 2.6, .08, pd * 2.6], [MX + px * 2.2, 9.65, pz * 2.2])
# 鏡組（縮小）：三段鏡筒（上寬下窄）＋鏡片
for i, (rr_, y, h) in enumerate(((3.6, 7.2, 1.0), (3.0, 5.7, 1.2), (2.2, 4.2, 1.2))):
    tube(f"m_lt{i}", "m_lens", "steel", rr_, rr_ - .35, h, [MX, y, 0], axis="y")
    cyl(f"m_ld{i}", "m_lens", "lens", rr_ - .35, .22, [MX, y, 0], axis="y")
    cyl(f"m_lr{i}", "m_lens", "steelHi", rr_ + .08, .16, [MX, y + h / 2 + .08, 0], axis="y")
# 縮小後的細光束
cyl("m_beam2", "m_beam2", "beam", .5, 2.8, [MX, 2.1, 0], axis="y")
cyl("m_spot", "m_spot", "beamHi", .8, .06, [MX, .72, 0], axis="y")
# 晶圓台＋晶圓＋晶粒陣列
cyl("m_chuck", "m_wafer", "steel2", 4.6, .5, [MX, .25, 0], axis="y")
cyl("m_wf", "m_wafer", "wafer", 4.1, .14, [MX, .57, 0], axis="y")
DIES = [(i, j) for i in range(-3, 4) for j in range(-3, 4) if (i * i + j * j) <= 9.5]
box("m_dies", "m_wafer", "die", [.85, .05, .85], [MX, .67, 0], at=[[i * 1.1, 0, j * 1.1] for (i, j) in DIES if (i, j) != (0, 0)])
box("m_die0", "m_die0", "die", [.85, .05, .85], [MX, .67, 0])
# 印上去的圖案（縮小到 1/4）：出現在中央那一顆
for i, (px, pz, pw, pd) in enumerate(PAT):
    box(f"m_wp{i}", "m_print", "dieHi", [pw * .65, .05, pd * .65], [MX + px * .55, .71, pz * .55])
glow("m_light", "m_lamp", ["m_lamp"], "beamHi", steady=True, g=.9)
glow("m_hit", "m_die0", ["m_die0"], "beamHi", steady=False, g=.9, freq=3.0)
flow("m_ray1", "m_beam1", [[MX, 13.6, 0], [MX, 9.9, 0]], n=4, lanes=3, gap=1.0, ldir=(1, 0, 0), size=.2, rate=.8, color="beamHi", rim="beam", trail=2)
flow("m_ray2", "m_beam2", [[MX, 9.5, 0], [MX, 3.2, 0], [MX, .8, 0]], n=5, size=.2, rate=.9, color="beamHi", rim="beam", trail=3)
anchor("m_a_src", "m_src", [MX + 2.1, 15.0, 1.5], dx=130, dy=-30)
anchor("m_a_mask", "m_mask", [MX + 3.2, 9.8, 2.0], dx=140, dy=-20)
anchor("m_a_lens", "m_lens", [MX + 3.0, 5.7, 1.5], dx=140, dy=-10)
anchor("m_a_wafer", "m_wafer", [MX + 4.0, .6, 1.2], dx=140, dy=30)
anchor("m_a_print", "m_print", [MX + .5, .72, .6], dx=-150, dy=40)

# ═════════ Z：整顆晶片＋設計電腦（x=180） ═════════
ZX = 180
box("z_base", "z_die", "siDk", [14.4, .7, 14.4], [ZX, .35, 0], bevel=.08)
box("z_top", "z_die", "siTop", [13.8, .06, 13.8], [ZX, .73, 0])
box("z_ring", "z_die", "steelHi", [.5, .12, .5], [ZX, .8, 0], at=[[-6.5 + 1.0 * i, 0, 6.5] for i in range(14)] + [[-6.5 + 1.0 * i, 0, -6.5] for i in range(14)] + [[6.5, 0, -5.5 + 1.0 * i] for i in range(12)] + [[-6.5, 0, -5.5 + 1.0 * i] for i in range(12)])
# CPU：2×2 核心
box("z_cpuF", "z_cpu", "cpu", [5.6, .5, 5.2], [ZX - 3.6, 1.0, -3.7], bevel=.05)
box("z_core", "z_cpu", "cpu2", [2.2, .5, 2.0], [ZX - 3.6, 1.4, -3.7], at=[[-1.2, 0, -1.1], [1.2, 0, -1.1], [-1.2, 0, 1.1], [1.2, 0, 1.1]], bevel=.05)
# NPU：3×3 運算單元
box("z_npuF", "z_npu", "npu", [6.2, .5, 5.2], [ZX + 3.4, 1.0, -3.7], bevel=.05)
box("z_mac", "z_npu", "npu2", [1.5, .4, 1.3], [ZX + 3.4, 1.35, -3.7], at=[[-1.8 + 1.8 * i, 0, -1.5 + 1.5 * j] for i in range(3) for j in range(3)], bevel=.04)
# 記憶體：條紋
box("z_memF", "z_mem", "mem", [5.6, .5, 4.2], [ZX - 3.6, 1.0, 2.6], bevel=.05)
box("z_bar", "z_mem", "mem2", [.45, .4, 3.4], [ZX - 3.6, 1.35, 2.6], at=[[-2.3 + .575 * i, 0, 0] for i in range(9)], bevel=.03)
# 輸入輸出：一排小介面
box("z_ioF", "z_io", "io", [6.2, .5, 4.2], [ZX + 3.4, 1.0, 2.6], bevel=.05)
box("z_port", "z_io", "io2", [.9, .4, 3.2], [ZX + 3.4, 1.35, 2.6], at=[[-2.4 + 1.2 * i, 0, 0] for i in range(5)], bevel=.03)
# 設計電腦（螢幕＋支架＋鍵盤）
MXZ = ZX + 12.8
box("z_mon", "z_mon", "dark2", [6.6, 4.4, .4], [MXZ, 3.4, 1.0], bevel=.08)
box("z_scr", "z_mon", "screen", [6.0, 3.8, .06], [MXZ, 3.4, 1.24])
box("z_stand", "z_mon", "dark", [.8, 1.4, .5], [MXZ, .95, 1.0])
box("z_foot", "z_mon", "dark", [3.0, .2, 2.0], [MXZ, .1, 1.0], bevel=.04)
box("z_kb", "z_mon", "dark2", [4.2, .16, 1.3], [MXZ, .08, 3.0], bevel=.04)
# 螢幕上的版圖：小色塊與走線
for i, (bx, by, bw, bh, c) in enumerate([(-1.6, 1.0, 2.0, 1.2, "cpu"), (.8, 1.0, 2.2, 1.2, "npu"), (-1.6, -.5, 2.0, 1.0, "mem"), (.8, -.5, 2.2, 1.0, "io")]):
    box(f"z_sb{i}", "z_mon", c, [bw, bh, .05], [MXZ + bx, 3.4 + by, 1.29])
box("z_sl", "z_mon", "rt1", [.05, 3.2, .04], [MXZ, 3.4, 1.3], at=[[-2.5 + .35 * i, 0, 0] for i in range(14)])
anchor("z_cpu", "z_cpu", [ZX - 3.6, 1.65, -3.7], dx=-150, dy=-80)
anchor("z_mem", "z_mem", [ZX - 3.6, 1.6, 2.6], dx=-150, dy=80)
anchor("z_die", "z_die", [ZX + 7.2, .5, 4.5], dx=150, dy=90)
anchor("z_mon", "z_mon", [MXZ, 5.6, 1.0], dx=100, dy=-70)

# 動作：游標、板子亮度由 script 用 shift／run 觸發
model = {
 "name": "tech-icdesign：一顆晶片怎麼從規格變成光罩", "unit": "示意，非實際比例", "size": {"w": 34, "h": 18, "r": 0.4, "t": 16},
 "palette": palette, "materials": materials, "layers": layers, "parts": parts, "anchors": anchors, "actions": actions,
 "pose": {"yaw0": 0, "yawIso": 0, "drift": 0},
 "camera": {"stand": {"d": 84, "elev": 89, "y": 0}, "explode": {"d": 84, "elev": 89, "y": 0}},
 "fx": {"dpr": 1, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
 "viewer": None,
}
json.dump(model, open("/home/user/ai-mp4/videos/tech-icdesign/model.json", "w"), ensure_ascii=False, indent=1)
print("parts", len(parts), "layers", len(layers), "actions", len(actions))
