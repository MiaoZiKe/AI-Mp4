# 產生 videos/tech-800v/model.json（八百伏特：機櫃供電、銅排粗細、逐級降壓）
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
def cyl(pid, lay, mat, r, h, pos, vertical=False, at=None):
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


# 追加材質／色票
palette.update({"air":"#8FD3F4","shelf":"#F08A24","led":"#14A38B","fanB":"#46526B","bolt":"#C9CFDB","wire":"#E8613C"})
materials.update({mm("air"):{"kind":"unlit","color":"air","opacity":.8}, mm("shelf"):M("shelf",rough=.4,metal=.3,env=.5), mm("led"):{"kind":"unlit","color":"led"},
  mm("fanB"):M("fanB",rough=.5,metal=.3), mm("bolt"):M("bolt",rough=.25,metal=.9,env=.7),
  mm("sleeve"):{"kind":"phys","color":"carrier","rough":.15,"metal":0,"clearcoat":.7,"opacity":.35,"env":.4},
  mm("louv"):M("dark",rough=.5,metal=.4), mm("lampOff"):M("cardW",rough=.4)})
HX = {"R":0, "C":60, "D":120}
lib = []

# ───────── R：機櫃（框、電源架、六層伺服器、背後粗銅排、側櫃、細銅排）─────────
RW, RD, RH = 8.0, 5.0, 7.8
box("rk_base","rk",mm("dark"),[RW+0.4,0.3,RD+0.4],[0,0.15,0])
box("rk_top","rk",mm("dark"),[RW+0.4,0.25,RD+0.4],[0,RH+0.12,0])
for sx in (-1,1):
    for sz in (-1,1): box(f"rk_p{sx}{sz}","rk",mm("steel2"),[0.28,RH,0.28],[sx*RW/2,RH/2+0.15,sz*(RD/2-0.1)])
for k in range(6):   # 側邊導軌（每層一對，讓伺服器看起來「插在櫃裡」）
    y=2.45+k*0.82
    box(f"rk_r{k}","rk",mm("steel"),[0.08,0.06,RD-0.5],[-RW/2+0.4,y-0.33,0]); box(f"rk_q{k}","rk",mm("steel"),[0.08,0.06,RD-0.5],[RW/2-0.4,y-0.33,0])
# 電源架（橘）：六個抽屜＋風扇
SHY=0.3; SHH=1.5
box("sh_body","rack",mm("shelf"),[RW-0.9,SHH,RD-1.4],[0,SHY+SHH/2,0.2])
box("sh_slit","rack",mm("louv"),[1.08,SHH-0.5,0.05],[0,SHY+SHH/2,0.2+(RD-1.4)/2+0.02],at=[[(i-2.5)*1.25,0,0] for i in range(6)])
box("sh_led","rack",mm("led"),[0.12,0.12,0.05],[0,SHY+SHH-0.2,0.2+(RD-1.4)/2+0.03],at=[[(i-2.5)*1.25,0,0] for i in range(6)])
FANC=[(i-2.5)*1.25 for i in range(6)]
FZ0=0.2+(RD-1.4)/2+0.05
for i,fx in enumerate(FANC):
    cyl(f"fan_ring{i}","rack",mm("louv"),0.36,0.05,[fx,SHY+0.55,FZ0])
    for q in range(2):
        box(f"fan_b{i}{q}","rack",mm("fanB"),[0.62,0.08,0.03] if q==0 else [0.08,0.62,0.03],[fx,SHY+0.55,FZ0+0.04])
    cyl(f"fan_h{i}","rack",mm("bolt"),0.07,0.06,[fx,SHY+0.55,FZ0+0.07])
FANB=[f"fan_b{i}{q}" for i in range(6) for q in range(2)]
# 六層伺服器托盤＋前面板縫與燈＋背後銅夾片
TRY=[2.45+k*0.82 for k in range(6)]
for k,y in enumerate(TRY):
    L=f"tr{k}"
    box(f"tr{k}_b",L,mm("steel2"),[RW-1.0,0.56,RD-1.2],[0,y,0.1])
    box(f"tr{k}_f",L,mm("louv"),[RW-1.6,0.3,0.05],[0,y,0.1+(RD-1.2)/2+0.02])
    box(f"tr{k}_hole",L,mm("slot"),[0.18,0.2,0.05],[0,y,0.1+(RD-1.2)/2+0.05],at=[[ -3.1+j*0.42,0,0] for j in range(15)])
    box(f"tr{k}_led",L,mm("led"),[0.14,0.14,0.05],[RW/2-0.9,y+0.17,0.1+(RD-1.2)/2+0.05])
    box(f"tr{k}_cl",L,mm("cu"),[1.1,0.38,0.4],[0,y,-RD/2+0.95]); 
    box(f"tr{k}_cl2",L,mm("cuHi"),[1.1,0.05,0.42],[0,y+0.2,-RD/2+0.95])
# 背後直立銅排（正負兩條）＋絕緣套＋螺栓；粗＝54 V
BZ=-RD/2+0.55; BY0=SHY+SHH; BY1=RH-0.15; BH=BY1-BY0
for s,sx in (("a",-0.78),("b",0.78)):
    box(f"bus{s}","busT",mm("cu"),[1.15,BH,0.55],[sx,(BY0+BY1)/2,BZ])
    box(f"bus{s}_hi","busT",mm("cuHi"),[1.0,BH,0.06],[sx,(BY0+BY1)/2,BZ+0.29])
    for j,y in enumerate([BY0+0.35,BY1-0.35]): cyl(f"bus{s}_bolt{j}","busT",mm("bolt"),0.1,0.1,[sx,y,BZ+0.34])
    # 細銅排（800 V；截面約 1/15，邊長約 1/3.9），一開始隱藏
    box(f"thin{s}","busN",mm("cuHi"),[0.3,BH,0.14],[sx,(BY0+BY1)/2,BZ+0.2])
box("bus_sl","busT",mm("sleeve"),[0.5,BH,0.7],[0,(BY0+BY1)/2,BZ])
box("bus_sl2","busN",mm("sleeve"),[0.5,BH,0.7],[0,(BY0+BY1)/2,BZ]) 
# 側櫃（800 V 電源側櫃）：滑進來
SCX=RW/2+2.6
box("sc_body","sc",mm("shelf"),[3.0,RH-0.2,RD-0.8],[SCX,(RH-0.2)/2+0.3,-0.2])
box("sc_louv","sc",mm("louv"),[2.4,0.1,0.05],[SCX,3.0,-0.2+(RD-0.8)/2+0.02],at=[[0,k*0.32,0] for k in range(12)])
box("sc_led","sc",mm("led"),[0.14,0.14,0.05],[SCX+1.0,RH-0.4,-0.2+(RD-0.8)/2+0.03])
box("sc_br","sc",mm("cuHi"),[SCX-RW/2+0.4,0.2,0.3],[(SCX+RW/2)/2-0.6,RH-0.5,BZ+0.1])   # 連到銅排的橫向連接排
cyl("sc_fan","sc",mm("louv"),0.8,0.05,[SCX,RH-1.4,-0.2+(RD-0.8)/2+0.03])
SCF=["sc_fan"]
anchor("rk_bus","busT",[0.78+0.5,(BY0+BY1)/2+1.4,BZ+0.3],dx=170,dy=-40)
anchor("rk_shelf","rack",[RW/2-0.6,SHY+SHH/2,FZ0],dx=130,dy=50)
anchor("rk_tray","tr3",[RW/2-0.5,TRY[3],0.1+(RD-1.2)/2],dx=140,dy=-30)
anchor("rk_clip","tr4",[0.6,TRY[4],BZ+0.7],dx=-150,dy=-50)
anchor("rk_sc","sc",[SCX+1.5,5.2,-0.2],dx=110,dy=-60)
anchor("rk_thin","busN",[0.78+0.2,(BY0+BY1)/2+0.6,BZ+0.3],dx=170,dy=-40)

# 電流（R）：由電源架往上沿銅排（正負兩條），光點又多又密；每層夾片分岔電流；散熱氣流
def flow(key, layer, path, n, lanes, gap, laneDir, size, rate, color="lp_proc", rim="lp_proc", shape="dot"):
    actions[key] = {"type":"flow","layer":layer,"path":path,"n":n,"lanes":lanes,"laneGap":gap,"laneDir":laneDir,"size":size,"shape":shape,"rate":rate,"color":color,"rim":rim,"rimScale":1.6,"rimO":0.45,"trail":3,"trailGap":0.03,"trailColor":color,"track":False}
flow("r_cur","busT",[[-0.78,BY0+0.1,BZ+0.36],[-0.78,BY1-0.1,BZ+0.36]],9,3,0.3,[1,0,0],0.13,1.5)
flow("r_cur2","busT",[[0.78,BY0+0.1,BZ+0.36],[0.78,BY1-0.1,BZ+0.36]],9,3,0.3,[1,0,0],0.13,1.5)
flow("r_curN","busN",[[-0.78,BY0+0.1,BZ+0.3],[-0.78,BY1-0.1,BZ+0.3]],3,1,0.2,[1,0,0],0.1,1.2)
flow("r_curN2","busN",[[0.78,BY0+0.1,BZ+0.3],[0.78,BY1-0.1,BZ+0.3]],3,1,0.2,[1,0,0],0.1,1.2)
for k,y in enumerate(TRY):
    flow(f"r_br{k}",f"tr{k}",[[0,y,BZ+0.5],[0,y,-0.3]],3,2,0.25,[0,1,0],0.1,1.1)
# 氣流：由前（z 大）往後吸過每層（淺藍箭頭）
actions["r_air"]={"preset":"stream","layer":"rk","path":[[-1.8,TRY[2],RD/2+1.4],[-1.8,TRY[2],-RD/2-0.5]],"n":6,"shape":"arrow","rate":0.7,"color":"air","size":0.2}
actions["r_air2"]={"preset":"stream","layer":"rk","path":[[1.8,TRY[4],RD/2+1.4],[1.8,TRY[4],-RD/2-0.5]],"n":6,"shape":"arrow","rate":0.7,"color":"air","size":0.2}
actions["r_air3"]={"preset":"stream","layer":"rack","path":[[-2.5,SHY+0.55,RD/2+1.2],[-2.5,SHY+0.55,-RD/2]],"n":5,"shape":"arrow","rate":0.8,"color":"air","size":0.2}
# 銅排發熱：由銅色漸紅（steady pulse 加 ramp）＋熱浪
actions["r_hot"]={"type":"pulse","layer":"busT","parts":["busa","busb"],"color":"lp_bad","steady":True,"glow":0.9,"halo":0}
actions["r_heat"]={"preset":"heat-spread","layer":"busT","from":{"layer":"busT","p":[0,(BY0+BY1)/2,BZ+0.4]},"dir":[0,0,1],"reach":2.2,"count":3,"r0":0.6,"spread":0.6,"rate":0.8,"color":"lp_bad"}
actions["r_shelf"]={"type":"pulse","layer":"rack","parts":["sh_body"],"color":"lp_proc","steady":True,"glow":0.5,"halo":0}
actions["r_fan"]={"type":"rotate","parts":FANB,"axis":[0,0,1],"pivots":{f"fan_b{i}{q}":[FANC[i],SHY+0.55,FZ0+0.04] for i in range(6) for q in range(2)},"rps":4,"rampSpin":True,"layer":"rack"}
actions["r_scglow"]={"type":"pulse","layer":"sc","parts":["sc_body"],"color":"lp_proc","steady":True,"glow":0.45,"halo":0}
flow("r_sc","sc",[[SCX-1.4,RH-0.5,BZ+0.2],[RW/2-0.3,RH-0.5,BZ+0.2]],5,2,0.25,[0,0,1],0.12,1.3)

# ───────── C：兩條銅排並排（54 V 粗、800 V 先同粗、之後換成細）─────────
CX=HX["C"]; BL=11.0
def lug(pid, lay, x, y, z):
    box(pid, lay, mm("cuHi"), [0.9,0.7,0.14], [x,y,z]); cyl(pid+"_b1",lay,mm("bolt"),0.09,0.12,[x-0.2,y+0.18,z+0.1]); cyl(pid+"_b2",lay,mm("bolt"),0.09,0.12,[x+0.2,y-0.18,z+0.1])
for tag,yc in (("u",3.3),("d",0.95)):
    # 電源端（左，橘盒）與負載端（右，發光塊）
    box(f"c{tag}_src","c"+tag+"S",mm("shelf"),[1.6,1.5,1.5],[CX-BL/2-1.4,yc,0]); box(f"c{tag}_srcl","c"+tag+"S",mm("louv"),[1.1,0.08,0.05],[CX-BL/2-1.4,yc,0.78],at=[[0,k*0.26-0.4,0] for k in range(4)])
    box(f"c{tag}_load","c"+tag+"L",mm("dark"),[1.6,1.5,1.5],[CX+BL/2+1.4,yc,0]); box(f"c{tag}_lamp","c"+tag+"L",mm("lampOff"),[1.0,0.9,0.08],[CX+BL/2+1.4,yc,0.78])
    # 粗銅排（兩者起初同粗，邊長 1.0）
    box(f"c{tag}_bar","c"+tag+"B",mm("cu"),[BL,1.0,1.0],[CX,yc,0]); box(f"c{tag}_hi","c"+tag+"B",mm("cuHi"),[BL-0.3,0.08,1.02],[CX,yc+0.46,0])
    box(f"c{tag}_slv","c"+tag+"B",mm("sleeve"),[1.8,1.2,1.2],[CX,yc,0],at=[[-BL/2+1.1,0,0],[BL/2-1.1,0,0]])
    lug(f"c{tag}_lg0","c"+tag+"B",CX-BL/2-0.2,yc,0.57); lug(f"c{tag}_lg1","c"+tag+"B",CX+BL/2+0.2,yc,0.57)
# 細銅排（取代下條：截面約 1/15）
box("cd_thin","cdT",mm("cuHi"),[BL,0.26,0.26],[CX,0.95,0]); lug("cd_tlg0","cdT",CX-BL/2-0.2,0.95,0.2); lug("cd_tlg1","cdT",CX+BL/2+0.2,0.95,0.2)
for p in parts[-6:]: pass
anchor("c_up","cuB",[CX-BL/2+0.6,3.3+0.6,0.5],dx=-60,dy=-110); anchor("c_dn","cdB",[CX+BL/2-1.2,0.95-0.6,0.5],dx=60,dy=100)
anchor("c_thin","cdT",[CX+BL/2-1.6,0.95+0.15,0.2],dx=60,dy=-120)
# C 的電流：上＝很密（54 V 18,519 A 示意），下＝稀疏（1,250 A）
flow("c_up","cuB",[[CX-BL/2,3.3,0.56],[CX+BL/2,3.3,0.56]],14,5,0.18,[0,1,0],0.12,1.9)
flow("c_dn","cdB",[[CX-BL/2,0.95,0.56],[CX+BL/2,0.95,0.56]],3,2,0.3,[0,1,0],0.12,1.1)
flow("c_dnT","cdT",[[CX-BL/2,0.95,0.2],[CX+BL/2,0.95,0.2]],3,1,0.2,[0,1,0],0.1,1.1)
actions["c_hot"]={"type":"pulse","layer":"cuB","parts":["cu_bar"],"color":"lp_bad","steady":True,"glow":0.95,"halo":0}
actions["c_heat"]={"preset":"heat-spread","layer":"cuB","from":{"layer":"cuB","p":[CX,3.3,0]},"dir":[0,1,0],"reach":2.4,"count":4,"r0":0.7,"spread":0.55,"rate":0.9,"color":"lp_bad"}
actions["c_heat2"]={"preset":"heat-spread","layer":"cuB","from":{"layer":"cuB","p":[CX+3,3.3,0]},"dir":[0,1,0],"reach":2.2,"count":3,"r0":0.7,"spread":0.55,"rate":0.8,"color":"lp_heat"}
actions["c_lampU"]={"type":"pulse","layer":"cuL","parts":["cu_lamp"],"color":"lp_proc","steady":True,"glow":1,"halo":0}
actions["c_lampD"]={"type":"pulse","layer":"cdL","parts":["cd_lamp"],"color":"lp_proc","steady":True,"glow":1,"halo":0}
actions["c_srcU"]={"type":"pulse","layer":"cuS","parts":["cu_src"],"color":"lp_proc","steady":True,"glow":0.5,"halo":0}
actions["c_srcD"]={"type":"pulse","layer":"cdS","parts":["cd_src"],"color":"lp_proc","steady":True,"glow":0.5,"halo":0}

# ───────── D：降壓路徑（電源側櫃 800 V → 細銅排 → 模組 A 800→50 → 模組 B 50→12 → 晶片板 約 1 V；越往後電流越大、導體越粗）─────────
DX=HX["D"]
def vcb(pid, lay, x, y, z, w, h, d, mat="m_louv"): box(pid, lay, mat if mat.startswith("m_") else mm(mat), [w,h,d], [x,y,z])
# 電源側櫃
box("d_sc","dS",mm("shelf"),[2.4,4.4,2.4],[DX-9.2,2.2,0]); box("d_scl","dS",mm("louv"),[1.8,0.08,0.05],[DX-9.2,3.0,1.22],at=[[0,k*0.28,0] for k in range(8)]); box("d_scled","dS",mm("led"),[0.14,0.14,0.05],[DX-8.5,4.0,1.23])
# 母線（細→中→粗）
box("d_b1","dB1",mm("cuHi"),[4.0,0.26,0.26],[DX-6.0,2.4,0]); box("d_b2","dB2",mm("cu"),[3.0,0.55,0.55],[DX-0.9,2.4,0]); box("d_b3","dB3",mm("cu"),[2.4,0.95,0.95],[DX+3.9,2.4,0])
for nm,lay,x in (("b1","dB1",DX-4.0),("b2","dB2",DX-2.4),("b3","dB3",DX+2.7)): cyl(f"d_{nm}_bolt",lay,mm("bolt"),0.1,0.1,[x,2.4,0.3])
# 模組 A、B（黑盒＋散熱鰭＋接線）
for nm,x,w,h in (("mA",DX-3.0,2.2,2.0),("mB",DX+1.4,2.0,1.6)):
    box(f"d_{nm}","d"+nm,mm("louv"),[w,h,2.2],[x,h/2+1.4,0]); box(f"d_{nm}_pl","d"+nm,mm("steel"),[w-0.4,0.08,1.9],[x,h+1.44,0])
    lib.append({"part":"heatsink","id":"d_"+nm+"_hs","pos":[x,h+1.48,0],"w":w-0.4,"d":1.9,"base":0.1,"fins":7,"finH":0.9,"finT":0.07})
# 晶片板：lib pcb＋die＋電感小方塊
lib.append({"part":"pcb","id":"d_pcb","pos":[DX+8.2,0.9,0],"w":4.4,"d":3.4,"t":0.18,"pads":False})
lib.append({"part":"die","id":"d_die","pos":[DX+8.2,1.08,0],"w":1.5,"d":1.5,"t":0.28,"bumps":False})
for i in range(4): box(f"d_ind{i}","d_pcb",mm("chipBk"),[0.45,0.3,0.45],[DX+6.9+0.0,1.23,-1.0+i*0.67])
for i in range(4): box(f"d_ind{i}b","d_pcb",mm("chipBk"),[0.45,0.3,0.45],[DX+9.5,1.23,-1.0+i*0.67])
box("d_bridge","dB3",mm("cu"),[1.5,0.4,0.9],[DX+6.0,2.4,0])
anchor("d_sc","dS",[DX-9.2,4.5,0],dx=0,dy=-90); anchor("d_a","dmA",[DX-3.0,3.6,1.1],dx=-90,dy=-80); anchor("d_b","dmB",[DX+1.4,3.1,1.1],dx=0,dy=-110); anchor("d_c","d_die",[DX+8.2,1.4,0.75],dx=40,dy=-110)
# D 的電流（越往後越密）
flow("d_f1","dB1",[[DX-8.0,2.4,0.15],[DX-4.1,2.4,0.15]],3,1,0.2,[0,1,0],0.1,1.2)
flow("d_f2","dB2",[[DX-2.4,2.4,0.34],[DX+0.6,2.4,0.34]],6,2,0.2,[0,1,0],0.1,1.5)
flow("d_f3","dB3",[[DX+2.8,2.4,0.54],[DX+6.6,2.4,0.54]],10,4,0.2,[0,1,0],0.11,1.8)
actions["d_pA"]={"type":"pulse","layer":"dmA","parts":["d_mA"],"color":"lp_proc","steady":True,"glow":0.55,"halo":0}
actions["d_pB"]={"type":"pulse","layer":"dmB","parts":["d_mB"],"color":"lp_proc","steady":True,"glow":0.55,"halo":0}
actions["d_pS"]={"type":"pulse","layer":"dS","parts":["d_sc"],"color":"lp_proc","steady":True,"glow":0.45,"halo":0}
actions["d_pC"]={"type":"pulse","layer":"d_die","parts":["d_die_body"],"color":"lp_heat","steady":True,"glow":0.8,"halo":0}
actions["d_hA"]={"preset":"heat-spread","layer":"dmA","from":{"layer":"dmA","p":[DX-3.0,3.4,0]},"dir":[0,1,0],"reach":2.0,"count":3,"r0":0.5,"spread":0.5,"rate":0.8,"color":"lp_heat"}
actions["d_hB"]={"preset":"heat-spread","layer":"dmB","from":{"layer":"dmB","p":[DX+1.4,3.0,0]},"dir":[0,1,0],"reach":2.0,"count":3,"r0":0.5,"spread":0.5,"rate":0.8,"color":"lp_heat"}
actions["d_air"]={"preset":"stream","layer":"dmA","path":[[DX-4.6,1.6,2.0],[DX+3.0,1.6,2.0]],"n":6,"shape":"arrow","rate":0.7,"color":"air","size":0.2}

model = {
 "name":"tech-800v：八百伏特（機櫃供電）。座標：R 機櫃 x=0、C 銅排對照 x=60、D 降壓路徑 x=120。零件用基本形狀＋庫（heatsink、pcb、die）。",
 "unit":"1＝約 10 cm（示意，非實際比例）","size":{"w":14,"h":2,"r":0.1,"t":6},
 "palette":palette,"materials":materials,"layers":layers,"anchors":anchors,"parts":lib+parts,"actions":actions,
 "pose":{"yaw0":0,"yawIso":0,"drift":0},"camera":{"stand":{"d":24,"elev":24,"y":3.5}},
 "fx":{"dpr":1,"srcPx":30,"shadows":0,"ghost":False,"guides":False,"fog":False,"dust":False,"vaporSprites":False,"shimmer":False},
}
json.dump(model, open("/home/user/ai-mp4/videos/tech-800v/model.json","w"), ensure_ascii=False, indent=1)
print("parts",len(parts),"layers",len(layers))
