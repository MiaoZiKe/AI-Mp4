# scratch generator (not committed): writes videos/tech-hbm/model.json
import json, math
R = lambda x: round(x, 3)
parts = []; layers = []; anchors = {}; actions = {}
LAYERS = {}
def layer(i, outline=None):
    if i not in LAYERS:
        LAYERS[i] = True; d = {"id": i, "z": 0, "k": 0}
        if outline: d["outline"] = outline
        layers.append(d)
def box(pid, lay, mat, size, pos, at=None, rot=None, shape="box"):
    layer(lay)
    p = {"id": pid, "layer": lay, "shape": shape, "size": size, "pos": [R(v) for v in pos], "mat": mat}
    if at: p["at"] = [[R(v) for v in a] for a in at]
    if rot: p["rot"] = rot
    parts.append(p); return pid
def cyl(pid, lay, mat, r, h, pos, vertical=True, at=None):
    return box(pid, lay, mat, [r, h], pos, at=at, rot=[90, 0, 0] if vertical else None, shape="cyl")
def anchor(name, lay, p, dx=100, dy=-80): anchors[name] = {"layer": lay, "p": [R(v) for v in p], "dx": dx, "dy": dy}

palette = {"dram":"#2A7F8F","dram2":"#3F9AA5","orange":"#F08A24","orangeHi":"#FFB257","cu":"#C98A3E","cuHi":"#E8A45E","liner":"#BCD5F0","slot":"#2A2E3B","si":"#B8C2D6","siTop":"#CBD4E4","siDk":"#9AA6BD",
 "glue":"#E8B64C","carrier":"#D6E8F8","adh":"#F2D15C","wheelM":"#8F9DB5","teeth":"#2B3A55","cardW":"#F6F2E8","coralC":"#E0472F","plasma":"#9B6BFF","ddrPcb":"#2F6E55","chipBk":"#2E3340",
 "steel":"#9AA8BE","steel2":"#7D8AA1","dark":"#3F4E6B","lp_melt":"#FF5A1F","lp_heat":"#FF7A2F","lp_good":"#14A38B","lp_sig":"#38B6FF","lp_sigRim":"#1F6FEB","lp_proc":"#FF9F1C","lp_bad":"#E0472F","water":"#7CD4FF","dashC":"#E0472F"}
def M(color, **k): return {"kind":"std","color":color,"rough":0.45,"metal":0.1,**k}
materials = {
 "dram": M("dram", rough=.35), "dram2": M("dram2", rough=.35), "orange": M("orange", rough=.35, metal=.35, env=.5), "orangeHi": M("orangeHi"),
 "cu": M("cu", rough=.3, metal=.9, env=.6), "cuHi": M("cuHi", rough=.25, metal=.9, env=.8), "liner": M("liner"), "slot": {"kind":"unlit","color":"slot"},
 "si": M("si", rough=.35, metal=.35, env=.5), "siTop": M("siTop", rough=.3, metal=.4, env=.6), "siDk": M("siDk", rough=.4, metal=.3),
 "glue": {"kind":"phys","color":"glue","rough":.2,"metal":0,"clearcoat":.6,"opacity":.62,"env":.4},
 "carrier": {"kind":"phys","color":"carrier","rough":.1,"metal":0,"clearcoat":.8,"opacity":.5,"env":.5}, "adh": M("adh", rough=.5),
 "wheelM": M("wheelM", rough=.3, metal=.85, env=.7), "teeth": M("teeth", rough=.4, metal=.5), "cardW": M("cardW", rough=.55),
 "coralC": {"kind":"unlit","color":"coralC"}, "plasma": {"kind":"unlit","color":"plasma","opacity":.75}, "ddrPcb": M("ddrPcb", rough=.6), "chipBk": M("chipBk", rough=.35, metal=.3),
 "steel": M("steel", rough=.3, metal=.85, env=.5), "steel2": M("steel2", rough=.35, metal=.8), "dark": M("dark", rough=.5, metal=.2),
 "traces": M("siTop", rough=.3, metal=.5, tex="traces", texScale=.5, env=.7), "dash": {"kind":"unlit","color":"dashC"}, "bandB": {"kind":"unlit","color":"lp_sig","opacity":.28},
}
mm = lambda k: "m_"+k
materials = {mm(k): v for k, v in materials.items()}
for k, v in materials.items():
    if isinstance(v.get("color"), str) and not v["color"].startswith("lp_"): pass

HX = {"H": 0, "W": 60, "X": 120, "Y": 180, "Z": 240}

# ───────── 庫零件（interposer、die、pcb、substrate）用 part 寫法 ─────────
lib = []
# ───────── H：封裝全貌（hero 12 層 HBM、AI 晶片、中介層、信用卡、旁邊的 HBM） ─────────
DRAM_N = 12; PITCH = 0.084; BASEH = 0.12; HW = 2.0
def hbm(prefix, x, z, y0, sliced):
    """HBM 一疊：橘色基底晶片＋12 片 DRAM（每片下面一條琥珀膠）。sliced＝每片自己一層（hero 用，落下動畫）"""
    L0 = prefix
    box(f"{prefix}_base", f"{prefix}_b" if sliced else L0, mm("orange"), [HW+0.16, BASEH, HW+0.16], [x, y0+BASEH/2, z])
    if sliced:
        for i in range(DRAM_N):
            L = f"{prefix}_s{i}"; yb = y0 + BASEH + i*PITCH
            box(f"{prefix}_g{i}", L, mm("glue"), [HW+0.05, 0.018, HW+0.05], [x, yb+0.009, z])
            box(f"{prefix}_d{i}", L, mm("dram") if i%2==0 else mm("dram2"), [HW, 0.066, HW], [x, yb+0.018+0.033, z])
        box(f"{prefix}_cap", f"{prefix}_s{DRAM_N-1}", mm("siTop"), [HW-0.3, 0.006, HW-0.3], [x, y0+BASEH+DRAM_N*PITCH+0.001, z])
    else:
        gat = [[0, i*PITCH, 0] for i in range(DRAM_N)]
        box(f"{prefix}_gl", L0, mm("glue"), [HW+0.05, 0.018, HW+0.05], [x, y0+BASEH+0.009, z], at=gat)
        box(f"{prefix}_dA", L0, mm("dram"), [HW, 0.066, HW], [x, y0+BASEH+0.051, z], at=[a for k,a in enumerate(gat) if k%2==0])
        box(f"{prefix}_dB", L0, mm("dram2"), [HW, 0.066, HW], [x, y0+BASEH+0.051, z], at=[a for k,a in enumerate(gat) if k%2==1])
    return y0 + BASEH + DRAM_N*PITCH

IPY = 0.14
lib.append({"part":"interposer","id":"ip","pos":[0,0,0],"w":12.6,"d":6.8,"t":0.14,"rdl":24,"tsv":False,"label":{"dx":-120,"dy":60}})
lib.append({"part":"die","id":"ai","pos":[0,IPY,-1.0],"w":3.4,"d":3.0,"t":0.42,"bumps":False,"label":{"dx":-130,"dy":-90}})
TOPH = hbm("hm", 2.0, 2.0, IPY, True)      # hero（前右）
hbm("h2", 3.9, -1.0, IPY, False)            # 右後
hbm("h3", -3.9, -1.0, IPY, False)           # 左後
anchor("hm_top", "hm_s11", [2.0+HW/2, TOPH, 2.0], dx=110, dy=-110)
anchor("hm_base", "hm_b", [2.0+HW/2+0.08, IPY+BASEH/2, 2.0], dx=120, dy=60)
# 信用卡（側視，垂直放大同比例）
CARDT = 1.19
box("card_body", "card", mm("cardW"), [2.6, CARDT, 2.2], [-1.9, IPY+CARDT/2, 2.0], shape="slab")
parts[-1]["bevel"] = 0.04
box("card_strip", "card", mm("dark"), [2.6, 0.01, 0.5], [-1.9, IPY+CARDT+0.003, 1.7])   # 磁條（空白無字，示意）
anchor("card", "card", [-1.9-1.3, IPY+CARDT, 2.0], dx=-150, dy=-100)
# 資料線被擋（p4）：從 hero 右側拉出一把細線，擠在一起
SX0 = 2.0+HW/2+0.08
at = []
for i in range(DRAM_N):
    for k in (-0.55, 0, 0.55): at.append([0, i*PITCH, k])
box("sl_lines", "sideLines", mm("coralC"), [1.7, 0.016, 0.03], [SX0+0.85, IPY+BASEH+0.05, 2.0], at=at)
box("sl_bundle", "sideLines", mm("coralC"), [0.5, 1.0, 1.9], [SX0+2.15, IPY+0.6, 2.0])
anchor("sl", "sideLines", [SX0+2.4, IPY+1.1, 2.0], dx=120, dy=-60)
# 寬帶（p2）：HBM 底面到 AI 晶片的一條帶
box("band_plane", "band", mm("bandB"), [2.0, 0.01, 2.4], [1.7, IPY+0.006, 0.6])

# ───────── W：兩排對照（64 vs 2048） ─────────
WX = HX["W"]
# 後排：一般電腦記憶體（模組）→ 處理器
lib.append({"part":"pcb","id":"dd","pos":[WX-4.3,0,-3.6],"w":5.0,"d":1.5,"t":0.12,"pads":False})
box("dd_chips", "dd", mm("chipBk"), [0.7,0.12,0.5], [WX-4.3, 0.12+0.06, -3.6], at=[[-1.8,0,0],[-1.05,0,0],[-0.3,0,0],[0.45,0,0],[1.2,0,0],[1.9,0,0]])
box("dd_fing", "dd", mm("cu"), [4.6,0.01,0.08], [WX-4.3, 0.123, -3.6+0.62])
lib.append({"part":"substrate","id":"cp","pos":[WX+4.3,0,-3.6],"w":3.0,"d":3.0,"t":0.2,"pads":False,"caps":False})
box("cp_die", "cp", mm("siTop"), [1.6,0.2,1.6], [WX+4.3, 0.2+0.1, -3.6])
# 前排：HBM → AI 晶片
lib.append({"part":"interposer","id":"wip","pos":[WX,0,1.6],"w":13,"d":3.4,"t":0.14,"rdl":14,"tsv":False})
box("wh_base","wh",mm("orange"),[HW+0.16,BASEH,HW+0.16],[WX-4.3,IPY+BASEH/2,1.6])
box("wh_gl","wh",mm("glue"),[HW+0.05,0.018,HW+0.05],[WX-4.3,IPY+BASEH+0.009,1.6],at=[[0,i*PITCH,0] for i in range(DRAM_N)])
box("wh_dA","wh",mm("dram"),[HW,0.066,HW],[WX-4.3,IPY+BASEH+0.051,1.6],at=[[0,i*PITCH,0] for i in range(0,DRAM_N,2)])
box("wh_dB","wh",mm("dram2"),[HW,0.066,HW],[WX-4.3,IPY+BASEH+0.051,1.6],at=[[0,i*PITCH,0] for i in range(1,DRAM_N,2)])
lib.append({"part":"die","id":"wai","pos":[WX+4.3,IPY,1.6],"w":3.0,"d":2.6,"t":0.42,"bumps":False})

# ───────── X：晶圓局部剖面（TSV 加工） ─────────
XX = HX["X"]; BW = 7.2; BY = 3.2; BZ = 2.4; SLOT_X = [R(-3.0+0.5*i) for i in range(13)][::2]  # 7 孔
SLOT_X = [R(-3.0+0.5*i) for i in range(13)]   # 13 孔（剖面前緣），頂面另有 14×10 密集陣列
HOLE_TOP = BY; HOLE_BOT = 1.0; HD = HOLE_TOP-HOLE_BOT   # 2.2
FZ = BZ/2   # 前面 z
XP = []  # 會跟著翻面的零件 id
def xbox(pid, lay, mat, size, pos, at=None):
    box(pid, lay, mat, size, [XX+pos[0], pos[1], pos[2]], at=at); XP.append(pid)
# 本體：下半（連同要磨掉的四片）
xbox("x_body", "x_body", mm("si"), [BW, BY-1.0, BZ], [0, 1.0+(BY-1.0)/2, 0])
for k in range(4):   # u0 在最下面 y 0..0.25（翻面後在最上面，先被磨掉）
    xbox(f"x_u{k}", f"x_u{k}", mm("siDk") if k%2 else mm("si"), [BW, 0.25, BZ], [0, 0.125+0.25*k, 0])
xbox("x_ckt", "x_ckt", mm("traces"), [BW, 0.08, BZ], [0, BY+0.04, 0])
# 孔：4 段（從上往下，一段一段「咚」下去）＋襯層
SEG = 4; sh = HD/SEG
for s in range(SEG):
    ytop = HOLE_TOP - s*sh
    xbox(f"x_ln{s}", f"x_ho{s}", mm("liner"), [0.2, sh, 0.02], [0, ytop-sh/2, FZ+0.004], at=[[x,0,0] for x in SLOT_X])
    xbox(f"x_sl{s}", f"x_ho{s}", mm("slot"), [0.13, sh, 0.02], [0, ytop-sh/2, FZ+0.012], at=[[x,0,0] for x in SLOT_X])
# 孔口（頂面）：前排 7 個＋密集一整片（幾萬個）
dense = [[-3.25+0.5*i, 0, -1.05+0.233*j] for i in range(14) for j in range(10)]   # 14×10＝140 孔（示意：實際每層數萬個）
xbox("x_dense", "x_dense", mm("slot"), [0.12, 0.012, 0.12], [0, BY+0.087, 0], at=dense)
# 銅：5 段，由下往上長滿
CN = 5; cs = HD/CN
for s in range(CN):
    ybot = HOLE_BOT + s*cs
    xbox(f"x_cu{s}", f"x_cu{s}", mm("cuHi") if s==CN-1 else mm("cu"), [0.1, cs, 0.02], [0, ybot+cs/2, FZ+0.02], at=[[x,0,0] for x in SLOT_X])
xbox("x_ovf", "x_ovf", mm("cu"), [BW-0.2, 0.05, BZ-0.1], [0, BY+0.105, 0])   # 溢出的銅（再被磨平）
# 露出的銅柱頭（背面磨薄後亮起）
xbox("x_tip", "x_tip", mm("cuHi"), [0.12, 0.03, 0.12], [0, HOLE_BOT-0.012, FZ-0.14], at=[[x,0,0] for x in SLOT_X])
# 載板與黏著層（翻面後在最下面）
box("x_adh", "x_carrier", mm("adh"), [BW-0.4, 0.1, BZ-0.1], [XX, -0.05, 0])
box("x_car", "x_carrier", mm("carrier"), [BW+1.0, 0.4, BZ+0.6], [XX, -0.3, 0])
# CMP 磨平板
box("x_cmp", "x_cmp", mm("steel2"), [BW+0.6, 0.35, BZ+0.4], [XX, BY+0.5, 0])
box("x_cmpN", "x_cmp", mm("dark"), [0.5, 1.4, 0.5], [XX, BY+1.4, 0])
# 磨輪（杯形，繞垂直軸轉）
WHY = 3.5
cyl("x_wh_hub", "x_wheel", mm("wheelM"), 1.1, 0.55, [XX, WHY+0.45, 0])
box("x_wh_ring", "x_wheel", mm("teeth"), [2.5, 1.95, 0.45], [XX, WHY+0.1, 0], rot=[90,0,0], shape="tube")
cyl("x_wh_spin", "x_wheel", mm("steel"), 0.4, 0.25, [XX, WHY+0.85, 0])
box("x_wh_gold", "x_wheel", mm("cuHi"), [0.16,0.12,0.4], [XX, WHY-0.1, 0], at=[[math.cos(a)*2.2,0,math.sin(a)*2.2] for a in [i*math.pi/6 for i in range(12)]])
WHEEL_IDS = ["x_wh_hub","x_wh_ring","x_wh_spin","x_wh_gold"]
anchor("x_cut", "x_body", [XX+BW/2, 2.2, FZ], dx=130, dy=-70)
anchor("x_top", "x_ckt", [XX+BW/2, BY+0.08, 0], dx=130, dy=-100)
anchor("x_car", "x_carrier", [XX-BW/2-0.5, -0.3, FZ], dx=-140, dy=60)

# ───────── Y：疊合特寫（正方形晶粒，取放、對位、熱壓、灌膠） ─────────
YX = HX["Y"]; DW = 4.2; DT = 0.30; GAP = 0.08; BT = 0.5; PX = [R(-2.7+0.9*i) for i in range(7)]
box("y_base", "y_base", mm("orange"), [DW+0.6, BT, DW+0.6], [YX, BT/2, 0])
box("y_base_pil", "y_base", mm("cuHi"), [0.17, BT, 0.02], [YX, BT/2, (DW+0.6)/2+0.012], at=[[x,0,0] for x in PX])
box("y_base_bump", "y_base", mm("steel"), [0.16], [YX, -0.02, 0], at=[[x, 0, z] for x in (-1.8,-0.6,0.6,1.8) for z in (-1.8,-0.6,0.6,1.8)], shape="sphere")
def die_y(i, cx, y0, bumps=True):
    L = f"y_d{i}"
    box(f"y_d{i}_body", L, mm("dram") if i%2==1 else mm("dram2"), [DW, DT, DW], [cx, y0+DT/2, 0])
    box(f"y_d{i}_pil", L, mm("cuHi"), [0.17, DT, 0.02], [cx, y0+DT/2, DW/2+0.012], at=[[x,0,0] for x in PX])
    box(f"y_d{i}_top", L, mm("siTop"), [DW-0.5, 0.006, DW-0.5], [cx, y0+DT+0.002, 0])
    if bumps:
        box(f"y_d{i}_bp", L, mm("steel"), [0.13], [cx, y0-GAP/2, 0], at=[[x, 0, z] for x in PX for z in (-1.8,-0.6,0.6,1.8)], shape="sphere")
    return L
Y_Y0 = [BT+GAP+k*(DT+GAP) for k in range(5)]
for k in range(3): die_y(k+1, YX, Y_Y0[k])
# 第 4 片：托盤上
TRX = YX+7.8
box("y_tray", "y_tray", mm("steel2"), [DW+1.4, 0.2, DW+1.4], [TRX, -0.1, 0])
die_y(4, TRX, 0.0)
# 對位十字（晶粒上與下層上）
box("y_align", "y_align", mm("coralC"), [0.5,0.01,0.05], [YX, Y_Y0[2]+DT+0.02, DW/2-0.3], at=[[-DW/2+0.3,0,0],[DW/2-0.3,0,0]])
box("y_alignV", "y_align", mm("coralC"), [0.05,0.01,0.5], [YX, Y_Y0[2]+DT+0.02, DW/2-0.3], at=[[-DW/2+0.3,0,0],[DW/2-0.3,0,0]])
# 吸嘴（平板真空吸頭）
NZY = 0.30+1.2
box("y_nz_plate", "y_nz", mm("steel"), [DW*0.8, 0.28, DW*0.8], [TRX, NZY+0.14, 0])
cyl("y_nz_neck", "y_nz", mm("steel2"), 0.35, 1.0, [TRX, NZY+0.78, 0])
box("y_nz_arm", "y_nz", mm("steel2"), [0.5, 3.0, 0.5], [TRX, NZY+2.6, 0])
box("y_nz_hole", "y_nz", mm("slot"), [0.28,0.02,0.28], [TRX, NZY-0.005, 0], at=[[-0.7,0,-0.7],[0.7,0,-0.7],[-0.7,0,0.7],[0.7,0,0.7],[0,0,0]])
actions["y_nz_suck"] = {"type":"pulse","layer":"y_nz","parts":["y_nz_plate"],"color":"lp_good","steady":True,"glow":0.95,"halo":0}
# 熱壓頭
BHY = Y_Y0[3]+DT+1.2
box("y_bh_plate", "y_bh", mm("steel"), [DW+0.4, 0.4, DW+0.4], [YX, BHY+0.2, 0])
box("y_bh_blk", "y_bh", mm("dark"), [DW-0.4, 0.9, DW-0.4], [YX, BHY+0.85, 0])
cyl("y_bh_neck", "y_bh", mm("steel2"), 0.55, 1.2, [YX, BHY+1.9, 0])
box("y_bh_arm", "y_bh", mm("steel2"), [0.6, 3.0, 0.6], [YX, BHY+3.5, 0])
actions["y_bh_heat"] = {"type":"pulse","layer":"y_bh","parts":["y_bh_plate","y_bh_blk"],"color":"lp_heat","steady":True,"glow":0.85,"halo":0}
actions["y_melt4"] = {"type":"pulse","layer":"y_d4","parts":["y_d4_bp"],"color":"lp_melt","steady":True,"glow":1,"halo":0}
# 灌膠：四條由左到右
UFW = DW+0.3
for q in range(4):
    x0 = YX - UFW/2 + (q+0.5)*UFW/4
    box(f"y_uf{q}", f"y_uf{q}", mm("glue"), [UFW/4, GAP, DW+0.1], [x0, 0, 0], at=[[0, Y_Y0[k]-GAP/2, 0] for k in range(1,5)])
anchor("y_stack", "y_d3", [YX+DW/2, Y_Y0[2]+DT, DW/2], dx=130, dy=-90)
anchor("y_base", "y_base", [YX+(DW+0.6)/2, BT/2, DW/2], dx=130, dy=40)
anchor("y_d4", "y_d4", [TRX+DW/2, DT, DW/2], dx=120, dy=-100)
# 通路電流（驗證，由上往下）
top3 = Y_Y0[2]+DT
actions["y_cur"] = {"type":"flow","layer":"y_d3","path":[[YX,top3+0.05,DW/2+0.08],[YX,0.1,DW/2+0.08]],"n":3,"lanes":7,"laneGap":0.9,"laneDir":[1,0,0],"size":0.1,"shape":"dot","rate":1.3,"color":"lp_proc","rim":"lp_proc","rimScale":1.5,"rimO":0.4,"trail":3,"trailGap":0.03,"trailColor":"lp_proc","track":False}

# ───────── Z：8 層 vs 12 層同高 ─────────
ZX = HX["Z"]; TOT = 1.2; ZW = 3.0
for side, n, cxs in (("a", 8, -2.6), ("b", 12, 2.6)):
    t = TOT/n
    box(f"z{side}_base", f"z{side}_base", mm("orange"), [ZW+0.2, 0.18, ZW+0.2], [ZX+cxs, 0.09, 0])
    for i in range(n):
        yb = 0.18 + i*t
        box(f"z{side}_d{i}", f"z{side}_{i}", mm("dram") if i%2==0 else mm("dram2"), [ZW, t*0.8, ZW], [ZX+cxs, yb+t*0.5, 0])
        box(f"z{side}_g{i}", f"z{side}_{i}", mm("glue"), [ZW+0.04, t*0.2, ZW+0.04], [ZX+cxs, yb+t*0.1, 0])
lib.append({"part":"alignframe","id":"zl","pos":[ZX,0.18+TOT+0.02,0],"w":9.6,"d":3.8,"t":0.035,"dash":0.35})
anchor("za", "za_base", [ZX-2.6+ZW/2, 0.18+TOT*0.5, ZW/2], dx=-120, dy=-90)
anchor("zb", "zb_base", [ZX+2.6+ZW/2, 0.18+TOT*0.5, ZW/2], dx=120, dy=-90)


# ───────── 機櫃剪影（s8 預告）：在 H 後方 ─────────
box("rk_body", "rk", mm("dark"), [16, 7.0, 5], [0, 3.5, -9.5])
box("rk_slit", "rk", mm("chipBk"), [14.6, 0.5, 0.1], [0, 0.9, -6.95], at=[[0,k*1.35,0] for k in range(5)])
box("rk_led", "rk", mm("lp_ledx") if False else mm("steel"), [0.12,0.12,0.05], [-6.5, 1.35, -6.93], at=[[k*0.5,j*1.35,0] for k in range(6) for j in range(5)])
box("rk_tray", "rk_tray", mm("steel2"), [14.4, 0.15, 3.4], [0, 2.4, -5.2])
anchor("rk", "rk", [8.0, 5.5, -7.0], dx=-140, dy=-60)

# 動作：X 的電漿、翻面、磨輪、CMP 等
actions["x_plasma"] = {"type":"flow","layer":"x_ho0","path":[[XX,BY+1.3,FZ+0.05],[XX,BY-0.2,FZ+0.05]],"n":4,"lanes":13,"laneGap":0.5,"laneDir":[1,0,0],"size":0.07,"shape":"dot","rate":2.0,"color":"plasma","rim":"plasma","rimScale":1.5,"rimO":0.4,"trail":3,"trailGap":0.03,"trailColor":"plasma","track":False}
palette["plasma"]="#9B6BFF"
actions["x_flip"] = {"type":"rotate","parts":XP,"axis":[0,0,1],"pivot":[XX,BY/2,0],"angle":180,"hold":True,"layer":"x_body"}
actions["x_whspin"] = {"type":"rotate","parts":WHEEL_IDS,"axis":[0,1,0],"pivot":[XX,WHY,0],"rps":3.5,"rampSpin":True,"layer":"x_wheel"}
actions["x_cmpvib"] = {"type":"vibrate","parts":["x_cmp"],"axis":[1,0,0],"amp":1.1,"freq":3,"layer":"x_cmp"}
actions["x_tipglow"] = {"type":"pulse","layer":"x_tip","parts":["x_tip"],"color":"lp_proc","steady":True,"glow":0.9,"halo":0}
actions["x_curr"] = {"type":"flow","layer":"x_cu0","path":[[XX,HOLE_TOP-0.1,FZ+0.06],[XX,HOLE_BOT+0.1,FZ+0.06]],"n":3,"lanes":7,"laneGap":0.9,"laneDir":[1,0,0],"size":0.1,"shape":"dot","rate":1.4,"color":"lp_proc","rim":"lp_proc","rimScale":1.5,"rimO":0.4,"trail":3,"trailGap":0.03,"trailColor":"lp_proc","track":False}
# H 的光點流：寬帶（p2）、被擋（p1）、W 的窄帶與寬帶
def flow(key, layer, path, n, lanes, gap, laneDir, size, rate, color="lp_sig", rim="lp_sigRim"):
    actions[key] = {"type":"flow","layer":layer,"path":path,"n":n,"lanes":lanes,"laneGap":gap,"laneDir":laneDir,"size":size,"shape":"dot","rate":rate,"color":color,"rim":rim,"rimScale":1.6,"rimO":0.45,"trail":3,"trailGap":0.03,"trailColor":color,"track":False}
flow("h_jam", "ai", [[2.0, IPY+0.5, 1.0],[1.0, IPY+0.5, -0.3]], 3, 1, 0.2, [0,0,1], 0.11, 0.55)
flow("h_band", "hm_b", [[1.9, IPY+0.25, 1.1],[1.0, IPY+0.25, -0.4]], 5, 6, 0.26, [0,0,1], 0.1, 1.3)
flow("w_narrow", "dd", [[WX-2.0, 0.4, -3.6],[WX+2.3, 0.4, -3.6]], 5, 1, 0.2, [0,0,1], 0.12, 0.9, "lp_bad", "lp_bad")
flow("w_wide", "wh", [[WX-3.2, IPY+0.3, 1.6],[WX+2.6, IPY+0.3, 1.6]], 5, 9, 0.26, [0,0,1], 0.12, 0.9)
actions["h_aihot"] = {"type":"pulse","layer":"ai","parts":["ai_body","ai_top"],"color":"lp_heat","freq":2.2,"glow":0.9,"halo":0}
actions["h_hmglow"] = {"type":"pulse","layer":"hm_s0","parts":[f"hm_d{i}" for i in range(DRAM_N)],"color":"lp_proc","freq":2.4,"glow":0.7,"halo":0}
actions["h_hmglow"]["steady"] = False

actions["h_basehot"] = {"type":"pulse","layer":"hm_b","parts":["hm_base"],"color":"lp_proc","freq":2.4,"glow":0.9,"halo":0}
actions["h_heat"] = {"preset":"heat-spread","layer":"hm_b","from":{"layer":"hm_b","p":[2.0,IPY+0.3,2.0]},"dir":[0,1,0],"reach":1.8,"count":3,"r0":0.5,"spread":0.5,"rate":0.7}
actions["h_bad"] = {"type":"pulse","layer":"hm_s6","parts":["hm_d6","hm_g6"],"color":"lp_bad","freq":3,"glow":1.0,"halo":0}
model = {
 "name": "tech-hbm：HBM（十二層記憶體）。只寫資料，零件由 scripts/three/parts/ 展開（interposer、die、pcb、substrate、alignframe）；其餘零件用基本形狀。座標：H 封裝全貌 x=0、W 兩排對照 x=60、X 晶圓剖面 x=120、Y 疊合特寫 x=180、Z 8 對 12 層 x=240。",
 "unit": "全貌 1＝約 5.5 mm（垂直放大示意）；特寫為示意，非實際比例",
 "size": {"w": 14, "h": 2, "r": 0.1, "t": 6},
 "palette": palette, "materials": materials, "layers": layers, "anchors": anchors,
 "parts": lib + parts, "actions": actions,
 "pose": {"yaw0": 0, "yawIso": 0, "drift": 0},
 "camera": {"stand": {"d": 24, "elev": 28, "y": 0.6}},
 "fx": {"dpr": 1, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
}
json.dump(model, open("/home/user/ai-mp4/videos/tech-hbm/model.json", "w"), ensure_ascii=False, indent=1)
print("parts", len(parts), "layers", len(layers))
