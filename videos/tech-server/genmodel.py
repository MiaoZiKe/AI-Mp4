# scratch generator (not committed): writes videos/tech-server/model.json
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


palette.update({"pwr":"#F5B83D","pwrHi":"#FFD36B","coolB":"#3FA9F5","hotO":"#FF7A2F","rackFr":"#2B3548","trayB":"#3A4A66","trayF":"#5B6C8C","green":"#2E8B57","nic":"#4C6FD6"})
for k, c in (("pwr", "pwr"), ("pwrHi", "pwrHi"), ("rackFr", "rackFr"), ("trayB", "trayB"), ("trayF", "trayF"), ("green", "green"), ("nic", "nic")):
    materials[mm(k)] = M(c, rough=.4, metal=.3)
materials[mm("coolB")] = {"kind":"phys","color":"coolB","rough":.15,"metal":0,"clearcoat":.7,"opacity":.8,"env":.5}
materials[mm("hotO")] = {"kind":"phys","color":"hotO","rough":.15,"metal":0,"clearcoat":.7,"opacity":.85,"env":.5}
materials[mm("cable")] = M("cu", rough=.35, metal=.8, env=.6)

lib = []
# ───────── R：機櫃（x=0） ─────────
W, D = 4.6, 3.2; PITCH = 0.22; TH = 0.17; Y0 = 0.35
# 由下到上：電源 2、運算 9、交換器 9、運算 9、電源 2
SLOTS = ["pw"]*2 + ["c"]*9 + ["sw"]*9 + ["c"]*9 + ["pw"]*2
HR = Y0 + len(SLOTS)*PITCH + 0.2   # 機櫃高
ci = si = pi = 0; SLOTY = {}
for n, kind in enumerate(SLOTS):
    y = Y0 + n*PITCH + TH/2
    if kind == "c":
        L = f"c{ci}"; ci += 1
        box(f"{L}_b", L, mm("trayB"), [W-0.55, TH, D-0.3], [0, y, 0])
        box(f"{L}_f", L, mm("trayF"), [W-0.5, TH, 0.05], [0, y, D/2-0.12])
        box(f"{L}_v", L, mm("slot"), [0.07, 0.1, 0.02], [0, y, D/2-0.085], at=[[ -1.6+0.3*k, 0, 0] for k in range(12)])
        box(f"{L}_led", L, mm("lp_good") if False else mm("green"), [0.07, 0.05, 0.03], [W/2-0.55, y, D/2-0.085])
        box(f"{L}_rl", L, mm("steel"), [0.06, 0.07, D-0.4], [W/2-0.3, y, 0], at=[[-(W-0.6), 0, 0]])   # 兩側滑軌
    elif kind == "sw":
        L = f"sw{si}"; si += 1
        box(f"{L}_b", L, mm("orange"), [W-0.55, TH, D-0.3], [0, y, 0])
        box(f"{L}_f", L, mm("orangeHi"), [W-0.5, TH, 0.05], [0, y, D/2-0.12])
        box(f"{L}_v", L, mm("slot"), [0.1, 0.1, 0.02], [0, y, D/2-0.085], at=[[-1.7+0.22*k, 0, 0] for k in range(16)])
    else:
        L = f"pw{pi}"; pi += 1
        box(f"{L}_b", L, mm("pwr"), [W-0.55, TH, D-0.3], [0, y, 0])
        box(f"{L}_f", L, mm("pwrHi"), [W-0.5, TH, 0.05], [0, y, D/2-0.12])
        box(f"{L}_v", L, mm("slot"), [0.5, 0.09, 0.02], [0, y, D/2-0.085], at=[[-1.5+0.75*k, 0, 0] for k in range(5)])
    SLOTY[L] = y
# 機櫃框
box("fr_post", "frame", mm("rackFr"), [0.14, HR, 0.14], [0, HR/2, 0], at=[[sx*(W/2), 0, sz*(D/2)] for sx in (-1, 1) for sz in (-1, 1)])
box("fr_top", "frame", mm("rackFr"), [W+0.14, 0.12, D+0.14], [0, HR+0.06, 0])
box("fr_bot", "frame", mm("rackFr"), [W+0.14, 0.2, D+0.14], [0, 0.1, 0])
# 背面（z<0）：銅線背板、銅排、冷卻液歧管
BZ = -D/2 - 0.22
box("sp_body", "spine", mm("cable"), [0.7, PITCH*27, 0.35], [0, Y0+PITCH*15.5, BZ])   # 九層交換器那一段加上下運算層，垂直銅線束
box("sp_arm2", "spine", mm("cable"), [1.5, 0.03, 0.05], [-1.1, 0, BZ+0.15], at=[[0, Y0+PITCH*(2+k)+TH/2 if k<9 else Y0+PITCH*(11+k)+TH/2, 0] for k in range(18)])
box("sp_arm3", "spine", mm("cable"), [1.5, 0.03, 0.05], [1.1, 0, BZ+0.15], at=[[0, Y0+PITCH*(2+k)+TH/2 if k<9 else Y0+PITCH*(11+k)+TH/2, 0] for k in range(18)])
box("bus_l", "bus", mm("cu"), [0.26, HR-0.4, 0.1], [-W/2+0.45, HR/2, BZ+0.1])
box("bus_r", "bus", mm("cuHi"), [0.26, HR-0.4, 0.1], [W/2-0.45, HR/2, BZ+0.1])
box("mf_c", "cool", mm("coolB"), [0.2, HR-0.4, 0.2], [W/2+0.45, HR/2, BZ+0.05])
box("mf_h", "cool", mm("hotO"), [0.2, HR-0.4, 0.2], [W/2+0.85, HR/2, BZ+0.05])
box("mf_stub_c", "cool", mm("coolB"), [0.45, 0.07, 0.07], [W/2+0.25, 0, BZ+0.05], at=[[0, Y0+PITCH*(2+k)+TH/2 if k<9 else Y0+PITCH*(11+k)+TH/2, 0] for k in range(18)])
box("mf_stub_h", "cool", mm("hotO"), [0.85, 0.07, 0.07], [W/2+0.45, 0, BZ+0.05], at=[[0, Y0+PITCH*(2+k)+TH/2 if k<9 else Y0+PITCH*(11+k)+TH/2, 0] for k in range(18)])
# 冷卻液分配單元 CDU（機櫃旁）
box("cdu_b", "cdu", mm("steel2"), [1.5, 2.2, 1.6], [W/2+2.0, 1.1, BZ+0.4])
box("cdu_pc", "cdu", mm("coolB"), [0.2, 0.2, 1.4], [W/2+1.3, 2.3, BZ+0.4])
box("cdu_ph", "cdu", mm("hotO"), [0.2, 0.2, 1.4], [W/2+1.62, 2.55, BZ+0.4])
for fi, fy in enumerate((1.5, 0.7)):
    cyl(f"cdu_fh{fi}", "cdu", mm("steel"), 0.1, 0.05, [W/2+2.0, fy, BZ+0.4+0.82], vertical=False)
    for b in range(3): box(f"cdu_fb{fi}{b}", "cdu", mm("slot"), [0.62, 0.12, 0.03], [W/2+2.0, fy, BZ+0.4+0.83], rot=[0, 0, 60*b])
    actions[f"cdu_fan{fi}"] = {"type": "rotate", "parts": [f"cdu_fh{fi}"]+[f"cdu_fb{fi}{b}" for b in range(3)], "axis": [0, 0, 1], "pivot": [W/2+2.0, fy, BZ+0.4+0.83], "rps": 2.0, "rampSpin": True, "layer": "cdu"}
anchor("r_top", "frame", [W/2, HR, D/2], dx=120, dy=-60)
anchor("r_gpu", "c3", [-W/2+0.3, SLOTY["c3"], D/2], dx=-150, dy=-70)
anchor("r_sw", "sw4", [-W/2+0.3, SLOTY["sw4"], D/2], dx=-150, dy=20)
anchor("r_pw", "pw0", [-W/2+0.3, SLOTY["pw0"], D/2], dx=-150, dy=40)
anchor("r_spine", "spine", [0.35, HR/2, BZ], dx=130, dy=-30)
anchor("r_mf", "cool", [W/2+0.85, HR*0.7, BZ+0.05], dx=130, dy=-30)
anchor("r_cdu", "cdu", [W/2+2.7, 1.8, BZ+0.4], dx=120, dy=-60)

# ───────── T：運算托盤特寫（x=60） ─────────
TX = 150
lib.append({"part": "pcb", "id": "tp", "pos": [TX, 0, 0], "w": 15.6, "d": 9.8, "t": 0.14, "pads": False})
TY = 0.14
MODX = [-3.9, 3.9]
for mi, mx in enumerate(MODX):
    lib.append({"part": "substrate", "id": f"sc{mi}", "pos": [TX+mx, TY, 0], "w": 6.2, "d": 4.2, "t": 0.22, "pads": False, "caps": False})
    top = TY + 0.22
    box(f"cpu{mi}", f"sc{mi}_c", mm("green"), [1.4, 0.34, 1.4], [TX+mx-2.1, top+0.17, 0])
    for gi, gx in enumerate((-0.2, 1.9)):
        box(f"gpu{mi}{gi}", f"sc{mi}_g{gi}", mm("siTop"), [1.7, 0.42, 2.0], [TX+mx+gx, top+0.21, 0])
        box(f"hb{mi}{gi}", f"sc{mi}_g{gi}", mm("dram"), [1.5, 0.3, 0.5], [TX+mx+gx, top+0.15, 0], at=[[0, 0, -1.35], [0, 0, 1.35]])
    box(f"mem{mi}", f"sc{mi}_c", mm("chipBk"), [0.35, 0.12, 0.8], [TX+mx-2.7, top+0.06, 0], at=[[0, 0, -1.4], [0, 0, 1.4], [0.5, 0, -1.4], [0.5, 0, 1.4]])
    # 冷板（銅）蓋在 GPU 上
    box(f"cp{mi}", f"cp{mi}", mm("cuHi"), [4.0, 0.3, 2.5], [TX+mx+0.85, top+0.42+0.15, 0])
    box(f"cpfin", f"cp{mi}", mm("cu"), [3.6, 0.02, 0.06], [TX+mx+0.85, top+0.42+0.31, 0], at=[[0, 0, -0.9+0.3*k] for k in range(7)])

# 風冷版：散熱鰭片（疊在 GPU 上，液冷時換成冷板）、前緣風扇、後緣背板連接器、電源接頭
for mi, mx in enumerate(MODX):
    lib.append({"part": "heatsink", "id": f"hs{mi}", "pos": [TX+mx+0.85, TY+0.22+0.42, 0], "w": 4.0, "d": 2.5, "base": 0.12, "fins": 12, "finH": 1.1, "finT": 0.05})
FANX = [-5.2, -1.75, 1.75, 5.2]; FAN_IDS = []
for fi, fx in enumerate(FANX):
    L = f"fan{fi}"
    box(f"{L}_fr", L, mm("dark"), [2.7, 1.5, 0.7], [TX+fx, TY+0.14+0.75, 3.1])
    cyl(f"{L}_hub", L, mm("steel"), 0.28, 0.9, [TX+fx, TY+0.14+0.75, 3.1], vertical=False)
    for b in range(3):
        box(f"{L}_bl{b}", L, mm("wheelM"), [1.1, 0.34, 0.06], [TX+fx, TY+0.14+0.75, 3.52], rot=[0, 0, 60*b])
    FAN_IDS += [f"{L}_hub"] + [f"{L}_bl{b}" for b in range(3)]
    actions[f"{L}_spin"] = {"type": "rotate", "parts": [f"{L}_hub"] + [f"{L}_bl{b}" for b in range(3)], "axis": [0, 0, 1], "pivot": [TX+fx, TY+0.14+0.75, 3.52], "rps": 2.6, "rampSpin": True, "layer": L}
# 後緣背板連接器（接銅線）與電源接頭
box("rc", "trc", mm("steel2"), [2.6, 0.9, 0.7], [TX, TY+0.45+0.07, -4.6], at=[[-3.9, 0, 0], [3.9, 0, 0]])
box("rc_pin", "trc", mm("cuHi"), [0.12, 0.5, 0.1], [TX, TY+0.5, -4.2], at=[[-3.9+0.38*k, 0, 0] for k in range(-3, 4)]+[[3.9+0.38*k, 0, 0] for k in range(-3, 4)])
box("pw_in", "tpw", mm("pwr"), [1.4, 0.6, 0.8], [TX+7.0, TY+0.3+0.07, -3.0])
box("pw_bar", "tpw", mm("cu"), [0.14, 0.1, 6.4], [TX+6.4, TY+0.35, -0.6], at=[[0, 0, 0]])

# 供電模組（VRM）：每個 GPU 模組後方一排，電源接頭 → VRM → 晶片
for mi, mx in enumerate(MODX):
    box(f"vrm{mi}_ic", f"vrm{mi}", mm("chipBk"), [0.55, 0.26, 0.5], [TX+mx, TY+0.13+0.07, -2.85], at=[[-2.5+0.85*k, 0, 0] for k in range(7)])
    box(f"vrm{mi}_ind", f"vrm{mi}", mm("cuHi"), [0.4, 0.3, 0.4], [TX+mx, TY+0.15+0.07, -3.55], at=[[-2.5+0.85*k, 0, 0] for k in range(7)])
    box(f"vrm{mi}_cap", f"vrm{mi}", mm("steel"), [0.28, 0.34, 0.28], [TX+mx, TY+0.17+0.07, -4.1], at=[[-2.5+0.6*k, 0, 0] for k in range(10)], shape="cyl")
# 網卡（前緣）
box("nic", "tp_nic", mm("nic"), [1.6, 0.16, 0.9], [TX, TY+0.08+0.07, 3.9], at=[[-4.5, 0, 0], [4.5, 0, 0]])
# 冷卻液管：中央兩條沿 z，分支進冷板
PY = TY + 0.22 + 0.42 + 0.16
box("tb_c", "tcool", mm("coolB"), [0.28, 0.28, 8.0], [TX-0.4, PY, 0.7], shape="box")
box("tb_h", "tcool", mm("hotO"), [0.28, 0.28, 8.0], [TX+0.4, PY, 0.7])
box("tb_sc", "tcool", mm("coolB"), [1.0, 0.18, 0.18], [TX, PY, 0], at=[[-2.0, 0, 1.4], [-2.0, 0, -1.4]])
box("tb_sh", "tcool", mm("hotO"), [1.0, 0.18, 0.18], [TX, PY, 0], at=[[2.0, 0, 1.0], [2.0, 0, -1.0]])
anchor("r_rail", "c8", [W/2-0.3, SLOTY["c8"], D/2], dx=150, dy=-60)
anchor("r_chas", "c12", [-W/2+0.3, SLOTY["c12"], D/2], dx=-150, dy=-40)
anchor("t_gpu", "sc0_g0", [TX+MODX[0]-0.2+0.85, TY+0.22+0.42, 1.0], dx=-130, dy=-80)
anchor("t_cpu", "sc0_c", [TX+MODX[0]-2.1+0.7, TY+0.22+0.34, 0.7], dx=-140, dy=60)
anchor("t_cp", "cp0", [TX+MODX[0]+0.85+2.0, PY, 0], dx=130, dy=-50)
anchor("t_nic", "tp_nic", [TX-4.5+0.8, TY+0.2, 3.9], dx=-140, dy=40)

def flow(key, layer, path, n, lanes, gap, laneDir, size, rate, color="lp_sig", rim="lp_sigRim", shape="dot"):
    actions[key] = {"type":"flow","layer":layer,"path":path,"n":n,"lanes":lanes,"laneGap":gap,"laneDir":laneDir,"size":size,"shape":shape,"rate":rate,"color":color,"rim":rim,"rimScale":1.6,"rimO":0.45,"trail":3,"trailGap":0.03,"trailColor":color,"track":False}
palette.update({"lp_cool":"#3FA9F5","lp_hot":"#FF7A2F"})
YA = Y0+PITCH*2; YB = Y0+PITCH*29
# A 資料：背板垂直銅線束上下流動（兩條道），支線往交換器
flow("d_spine", "spine", [[-0.18, YA, BZ+0.2], [-0.18, YB, BZ+0.2]], 5, 3, 0.18, [1,0,0], 0.075, 1.6, "lp_sig", "lp_sigRim")
flow("d_spine2", "spine", [[0.18, YB, BZ+0.2], [0.18, YA, BZ+0.2]], 5, 3, 0.18, [1,0,0], 0.075, 1.6, "lp_sig", "lp_sigRim")
flow("d_arms", "spine", [[-1.8, Y0+PITCH*2+TH/2, BZ+0.2], [-0.4, Y0+PITCH*2+TH/2, BZ+0.2]], 3, 27, PITCH, [0,1,0], 0.08, 1.2, "lp_sig", "lp_sigRim")
flow("p_arm_l", "bus", [[-W/2+0.45, Y0+PITCH*2+TH/2, BZ+0.16], [-W/2+1.2, Y0+PITCH*2+TH/2, -D/2+0.5]], 3, 27, PITCH, [0,1,0], 0.07, 1.2, "lp_proc", "lp_proc")
flow("p_arm_r", "bus", [[W/2-0.45, Y0+PITCH*2+TH/2, BZ+0.16], [W/2-1.2, Y0+PITCH*2+TH/2, -D/2+0.5]], 3, 27, PITCH, [0,1,0], 0.07, 1.2, "lp_proc", "lp_proc")
flow("c_arm_c", "cool", [[W/2+0.45, Y0+PITCH*2+TH/2, BZ+0.05], [W/2-0.6, Y0+PITCH*2+TH/2, -D/2+0.6]], 3, 27, PITCH, [0,1,0], 0.07, 1.1, "lp_cool", "lp_cool")
flow("c_arm_h", "cool", [[W/2-0.6, Y0+PITCH*2+TH/2+0.05, -D/2+0.6], [W/2+0.85, Y0+PITCH*2+TH/2+0.05, BZ+0.05]], 3, 27, PITCH, [0,1,0], 0.07, 1.1, "lp_hot", "lp_hot")
# B 電：電源層 → 銅排往上下送
flow("p_up", "bus", [[-W/2+0.45, Y0+PITCH*29, BZ+0.18], [-W/2+0.45, Y0+PITCH*12, BZ+0.18]], 5, 1, 0.1, [1,0,0], 0.12, 1.2, "lp_proc", "lp_proc")
flow("p_dn", "bus", [[-W/2+0.45, Y0+PITCH*2, BZ+0.18], [-W/2+0.45, Y0+PITCH*11, BZ+0.18]], 5, 1, 0.1, [1,0,0], 0.12, 1.2, "lp_proc", "lp_proc")
flow("p_up2", "bus", [[W/2-0.45, Y0+PITCH*29, BZ+0.18], [W/2-0.45, Y0+PITCH*12, BZ+0.18]], 5, 1, 0.1, [1,0,0], 0.12, 1.2, "lp_proc", "lp_proc")
flow("p_dn2", "bus", [[W/2-0.45, Y0+PITCH*2, BZ+0.18], [W/2-0.45, Y0+PITCH*11, BZ+0.18]], 5, 1, 0.1, [1,0,0], 0.12, 1.2, "lp_proc", "lp_proc")
# C 冷卻液：歧管冷（下→上）、熱（上→下）、托盤內冷進熱出
flow("c_cold", "cool", [[W/2+0.45, 0.5, BZ+0.18], [W/2+0.45, HR-0.4, BZ+0.18]], 6, 1, 0.1, [1,0,0], 0.12, 1.1, "lp_cool", "lp_cool")
flow("c_hot", "cool", [[W/2+0.85, HR-0.4, BZ+0.18], [W/2+0.85, 0.5, BZ+0.18]], 6, 1, 0.1, [1,0,0], 0.12, 1.1, "lp_hot", "lp_hot")
flow("t_cold", "tcool", [[TX-0.4, PY+0.17, 4.5], [TX-0.4, PY+0.17, -3.0]], 5, 1, 0.1, [1,0,0], 0.13, 1.1, "lp_cool", "lp_cool")
flow("t_hot", "tcool", [[TX+0.4, PY+0.17, -3.0], [TX+0.4, PY+0.17, 4.5]], 5, 1, 0.1, [1,0,0], 0.13, 1.1, "lp_hot", "lp_hot")
flow("t_data", "tp_nic", [[TX-3.7, TY+0.4, 3.9], [TX-3.7, TY+0.4, 0.6]], 3, 3, 0.2, [1,0,0], 0.1, 1.2, "lp_sig", "lp_sigRim")
flow("t_vrm", "tpw", [[TX+7.0, TY+0.5, -3.0], [TX-6.4, TY+0.5, -3.0]], 5, 1, 0.1, [0,1,0], 0.1, 1.1, "lp_proc", "lp_proc")
flow("t_vrm0", "vrm0", [[TX-3.9, TY+0.45, -3.0], [TX-3.9, TY+0.45, -1.9]], 3, 6, 0.9, [1,0,0], 0.09, 1.0, "lp_proc", "lp_proc")
flow("t_vrm1", "vrm1", [[TX+3.9, TY+0.45, -3.0], [TX+3.9, TY+0.45, -1.9]], 3, 6, 0.9, [1,0,0], 0.09, 1.0, "lp_proc", "lp_proc")
flow("t_rear", "trc", [[TX-1.5, TY+0.8, -0.8], [TX-3.9, TY+0.8, -4.4]], 3, 3, 0.18, [1,0,0], 0.09, 1.3, "lp_sig", "lp_sigRim")
flow("t_rear2", "trc", [[TX+1.5, TY+0.8, -0.8], [TX+3.9, TY+0.8, -4.4]], 3, 3, 0.18, [1,0,0], 0.09, 1.3, "lp_sig", "lp_sigRim")
flow("t_pwr", "tpw", [[TX+7.0, TY+0.7, -3.0], [TX+7.0, TY+0.7, -0.6], [TX+4.6, TY+0.7, -0.6]], 4, 2, 0.16, [0,1,0], 0.1, 1.2, "lp_proc", "lp_proc")
palette["lp_air"] = "#9FB7D1"
flow("t_air", "trc", [[TX-6.2, TY+1.6, 4.8], [TX-6.2, TY+1.6, -4.2]], 4, 1, 0.1, [1,0,0], 0.15, 1.0, "lp_air", "lp_air", "arrow")
actions["t_air2"] = {**actions["t_air"], "path": [[TX-1.8, TY+2.0, 4.8], [TX-1.8, TY+2.0, -4.2]]}
actions["t_air3"] = {**actions["t_air"], "path": [[TX+1.8, TY+2.0, 4.8], [TX+1.8, TY+2.0, -4.2]]}
actions["t_air4"] = {**actions["t_air"], "path": [[TX+6.2, TY+1.6, 4.8], [TX+6.2, TY+1.6, -4.2]]}
actions["t_gpuhot"] = {"type":"pulse","layer":"sc0_g0","parts":["gpu00","gpu01"],"color":"lp_heat","freq":2.2,"glow":0.9,"halo":0}
actions["t_gpuhot1"] = {"type":"pulse","layer":"sc1_g0","parts":["gpu10","gpu11"],"color":"lp_heat","freq":2.2,"glow":0.9,"halo":0}
actions["r_cglow"] = {"type":"pulse","layer":"c0","parts":[f"c{i}_b" for i in range(18)],"color":"lp_sig","freq":2.0,"glow":0.8,"halo":0}
actions["r_swglow"] = {"type":"pulse","layer":"sw0","parts":[f"sw{i}_b" for i in range(9)],"color":"lp_proc","freq":2.4,"glow":0.8,"halo":0}
actions["r_pwglow"] = {"type":"pulse","layer":"pw0","parts":[f"pw{i}_b" for i in range(4)],"color":"lp_proc","freq":2.4,"glow":0.8,"halo":0}
actions["r_frglow"] = {"type":"pulse","layer":"frame","parts":["fr_post"],"color":"lp_sig","freq":2.0,"glow":0.8,"halo":0}
actions["r_cut"] = {"type":"pulse","layer":"c0","parts":[f"c{i}_b" for i in range(18)],"color":"lp_heat","freq":2.6,"glow":0.85,"halo":0}
actions["r_heat"] = {"preset":"heat-spread","layer":"c5","from":{"layer":"c5","p":[0, SLOTY["c5"]+0.1, 0]},"dir":[0,1,0],"reach":1.6,"count":3,"r0":0.5,"spread":0.5,"rate":0.7}
actions["t_heat"] = {"preset":"heat-spread","layer":"sc0_g0","from":{"layer":"sc0_g0","p":[TX+MODX[0]+0.7, TY+0.7, 0]},"dir":[0,1,0],"reach":1.8,"count":3,"r0":0.5,"spread":0.5,"rate":0.7}

model = {
 "name": "tech-server：AI 伺服器整櫃（NVL72 示意）。座標：R 機櫃 x=0、T 運算托盤特寫 x=60。",
 "unit": "機櫃 1 單位約 0.3 m（示意）；托盤特寫為示意，非實際比例",
 "size": {"w": 14, "h": 2, "r": 0.1, "t": 6},
 "palette": palette, "materials": materials, "layers": layers, "anchors": anchors,
 "parts": lib + parts, "actions": actions,
 "pose": {"yaw0": 0, "yawIso": 0, "drift": 0},
 "camera": {"stand": {"d": 24, "elev": 28, "y": 0.6}},
 "fx": {"dpr": 1, "srcPx": 30, "shadows": 0, "ghost": False, "guides": False, "fog": False, "dust": False, "vaporSprites": False, "shimmer": False},
}
json.dump(model, open("/home/user/ai-mp4/videos/tech-server/model.json", "w"), ensure_ascii=False, indent=1)
print("parts", len(parts), "layers", len(layers), "HR", HR)
