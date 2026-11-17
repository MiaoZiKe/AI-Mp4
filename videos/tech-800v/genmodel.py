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

# ───────── R：機櫃（框、電源架、六層伺服器、兩側直立銅排、側櫃、細銅排）─────────
RW, RD, RH = 8.0, 5.0, 7.8
TW = 6.0                   # 伺服器托盤寬（兩側各留 1 單位給銅排與夾片）
box("rk_base","rk",mm("dark"),[RW+0.8,0.3,RD+0.4],[0,0.15,0])
box("rk_top","rk",mm("dark"),[RW+0.8,0.25,RD+0.4],[0,RH+0.12,0])
for sx in (-1,1):
    for sz in (-1,1): box(f"rk_p{sx}{sz}","rk",mm("steel2"),[0.28,RH,0.28],[sx*(RW/2+0.3),RH/2+0.15,sz*(RD/2-0.1)])
SHY=0.3; SHH=1.5
box("sh_body","rack",mm("shelf"),[RW-0.6,SHH,RD-1.4],[0,SHY+SHH/2,0.2])
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
TRY=[2.45+k*0.82 for k in range(6)]
BZ=-0.6; BX=3.7
for k,y in enumerate(TRY):
    L=f"tr{k}"
    box(f"tr{k}_b",L,mm("steel2"),[TW,0.56,RD-1.2],[0,y,0.1])
    box(f"tr{k}_f",L,mm("louv"),[TW-0.6,0.3,0.05],[0,y,0.1+(RD-1.2)/2+0.02])
    box(f"tr{k}_hole",L,mm("slot"),[0.18,0.2,0.05],[0,y,0.1+(RD-1.2)/2+0.05],at=[[ -2.4+j*0.42,0,0] for j in range(12)])
    box(f"tr{k}_led",L,mm("led"),[0.14,0.14,0.05],[TW/2-0.5,y+0.17,0.1+(RD-1.2)/2+0.05])
    for sx in (-1,1):   # 兩側銅夾片：由銅排伸到托盤側面
        box(f"tr{k}_cl{sx}",L,mm("cu"),[0.55,0.4,0.45],[sx*(TW/2+0.2),y,BZ]); box(f"tr{k}_cu{sx}",L,mm("cuHi"),[0.55,0.05,0.47],[sx*(TW/2+0.2),y+0.22,BZ])
BY0=SHY+SHH; BY1=RH-0.15; BH=BY1-BY0
for s,sx in (("a",-BX),("b",BX)):
    box(f"bus{s}","busT",mm("cu"),[0.8,BH,0.6],[sx,(BY0+BY1)/2,BZ])
    box(f"bus{s}_hi","busT",mm("cuHi"),[0.66,BH,0.06],[sx,(BY0+BY1)/2,BZ+0.31])
    for j,y in enumerate([BY0+0.35,BY1-0.35]): cyl(f"bus{s}_bolt{j}","busT",mm("bolt"),0.1,0.1,[sx,y,BZ+0.34])
    box(f"bus{s}_sl","busT",mm("sleeve"),[1.0,BH*0.98,0.8],[sx,(BY0+BY1)/2,BZ])
    box(f"thin{s}","busN",mm("cuHi"),[0.21,BH,0.16],[sx,(BY0+BY1)/2,BZ+0.22])
    box(f"thin{s}_sl","busN",mm("sleeve"),[0.5,BH*0.98,0.5],[sx,(BY0+BY1)/2,BZ])
SCX=RW/2+2.9
box("sc_body","sc",mm("shelf"),[3.0,RH-0.2,RD-0.8],[SCX,(RH-0.2)/2+0.3,-0.2])
box("sc_louv","sc",mm("louv"),[2.4,0.1,0.05],[SCX,3.0,-0.2+(RD-0.8)/2+0.02],at=[[0,k*0.32,0] for k in range(12)])
box("sc_led","sc",mm("led"),[0.14,0.14,0.05],[SCX+1.0,RH-0.4,-0.2+(RD-0.8)/2+0.03])
box("sc_br","sc",mm("cuHi"),[SCX-BX-0.2,0.22,0.3],[(SCX+BX)/2-0.1,RH-0.5,BZ])
cyl("sc_fan","sc",mm("louv"),0.8,0.05,[SCX,RH-1.4,-0.2+(RD-0.8)/2+0.03])
anchor("rk_bus","busT",[BX+0.4,(BY0+BY1)/2+1.6,BZ+0.3],dx=140,dy=-60)
anchor("rk_shelf","rack",[RW/2-0.6,SHY+SHH/2,FZ0],dx=130,dy=60)
anchor("rk_sc","sc",[SCX+1.5,5.2,-0.2],dx=60,dy=-80)
anchor("rk_thin","busN",[BX+0.1,(BY0+BY1)/2+1.0,BZ+0.3],dx=140,dy=-60)

def flow(key, layer, path, n, lanes, gap, laneDir, size, rate, color="lp_proc", rim="lp_proc", shape="dot"):
    actions[key] = {"type":"flow","layer":layer,"path":path,"n":n,"lanes":lanes,"laneGap":gap,"laneDir":laneDir,"size":size,"shape":shape,"rate":rate,"color":color,"rim":rim,"rimScale":1.6,"rimO":0.45,"trail":3,"trailGap":0.03,"trailColor":color,"track":False}
ZF=BZ+0.34
flow("r_cur","busT",[[-BX,BY0+0.1,ZF],[-BX,BY1-0.1,ZF]],6,2,0.22,[1,0,0],0.09,1.3)
flow("r_cur2","busT",[[BX,BY0+0.1,ZF],[BX,BY1-0.1,ZF]],6,2,0.22,[1,0,0],0.09,1.3)
flow("r_curN","busN",[[-BX,BY0+0.1,BZ+0.32],[-BX,BY1-0.1,BZ+0.32]],3,1,0.2,[1,0,0],0.08,1.1)
flow("r_curN2","busN",[[BX,BY0+0.1,BZ+0.32],[BX,BY1-0.1,BZ+0.32]],3,1,0.2,[1,0,0],0.08,1.1)
for k,y in enumerate(TRY):
    flow(f"r_br{k}",f"tr{k}",[[BX,y,ZF],[TW/2-0.05,y,ZF]],2,1,0.2,[0,1,0],0.08,1.0)
    flow(f"r_bl{k}",f"tr{k}",[[-BX,y,ZF],[-TW/2+0.05,y,ZF]],2,1,0.2,[0,1,0],0.08,1.0)
actions["r_air"]={"preset":"stream","layer":"rk","path":[[-1.4,TRY[2],RD/2+1.4],[-1.4,TRY[2],-RD/2-0.5]],"n":5,"shape":"arrow","rate":0.7,"color":"air","size":0.2}
actions["r_air2"]={"preset":"stream","layer":"rk","path":[[1.4,TRY[4],RD/2+1.4],[1.4,TRY[4],-RD/2-0.5]],"n":5,"shape":"arrow","rate":0.7,"color":"air","size":0.2}
actions["r_air3"]={"preset":"stream","layer":"rack","path":[[-2.5,SHY+0.55,RD/2+1.2],[-2.5,SHY+0.55,-RD/2]],"n":4,"shape":"arrow","rate":0.8,"color":"air","size":0.2}
actions["r_hot"]={"type":"pulse","layer":"busT","parts":["busa","busb"],"color":"lp_bad","steady":True,"glow":0.9,"halo":0}
actions["r_heat"]={"preset":"heat-spread","layer":"busT","from":{"layer":"busT","p":[BX,(BY0+BY1)/2,BZ+0.4]},"dir":[1,0,0],"reach":1.8,"count":3,"r0":0.5,"spread":0.5,"rate":0.8,"color":"lp_bad"}
actions["r_shelf"]={"type":"pulse","layer":"rack","parts":["sh_body"],"color":"lp_proc","steady":True,"glow":0.5,"halo":0}
actions["r_fan"]={"type":"rotate","parts":FANB,"axis":[0,0,1],"pivots":{f"fan_b{i}{q}":[FANC[i],SHY+0.55,FZ0+0.04] for i in range(6) for q in range(2)},"rps":4,"rampSpin":True,"layer":"rack"}
actions["r_scglow"]={"type":"pulse","layer":"sc","parts":["sc_body"],"color":"lp_proc","steady":True,"glow":0.45,"halo":0}
flow("r_sc","sc",[[SCX-1.4,RH-0.5,BZ+0.2],[BX+0.5,RH-0.5,BZ+0.2]],5,1,0.2,[0,1,0],0.1,1.3)

# ───────── C：兩條銅排並排（54 V 粗、800 V 先同粗、之後換成細）─────────
CX=HX["C"]; BL=9.5; T=1.8; YU=5.8; YD=1.0
def lug(pid, lay, x, y, z):
    box(pid, lay, mm("cuHi"), [0.9,0.7,0.14], [x,y,z]); cyl(pid+"_b1",lay,mm("bolt"),0.09,0.12,[x-0.2,y+0.18,z+0.1]); cyl(pid+"_b2",lay,mm("bolt"),0.09,0.12,[x+0.2,y-0.18,z+0.1])
for tag,yc in (("u",YU),("d",YD)):
    # 電源端（左，橘盒）與負載端（右，發光塊）
    box(f"c{tag}_src","c"+tag+"S",mm("shelf"),[2.2,2.6,2.6],[CX-BL/2-1.7,yc,0]); box(f"c{tag}_srcl","c"+tag+"S",mm("louv"),[1.4,0.1,0.05],[CX-BL/2-1.7,yc,1.32],at=[[0,k*0.34-0.5,0] for k in range(4)])
    box(f"c{tag}_load","c"+tag+"L",mm("dark"),[2.2,2.6,2.6],[CX+BL/2+1.7,yc,0]); box(f"c{tag}_lamp","c"+tag+"L",mm("lampOff"),[1.5,1.5,0.08],[CX+BL/2+1.7,yc,1.32])
    # 粗銅排（兩者起初同粗，邊長 1.0）
    box(f"c{tag}_bar","c"+tag+"B",mm("cu"),[BL,T,T],[CX,yc,0]); box(f"c{tag}_hi","c"+tag+"B",mm("cuHi"),[BL-0.3,0.1,T+0.02],[CX,yc+T/2-0.04,0])
    box(f"c{tag}_slv","c"+tag+"B",mm("sleeve"),[1.6,T+0.25,T+0.25],[CX,yc,0],at=[[-BL/2+1.0,0,0],[BL/2-1.0,0,0]])
    lug(f"c{tag}_lg0","c"+tag+"B",CX-BL/2-0.2,yc,T/2+0.07); lug(f"c{tag}_lg1","c"+tag+"B",CX+BL/2+0.2,yc,T/2+0.07)
# 細銅排（取代下條：截面約 1/15）
box("cd_thin","cdT",mm("cuHi"),[BL,T/3.85,T/3.85],[CX,YD,0]); lug("cd_tlg0","cdT",CX-BL/2-0.2,YD,T/7.7+0.07); lug("cd_tlg1","cdT",CX+BL/2+0.2,YD,T/7.7+0.07)
for p in parts[-6:]: pass
anchor("c_up","cuB",[CX-BL/2+0.6,YU+1.0,0.7],dx=-60,dy=-110); anchor("c_dn","cdB",[CX+BL/2-1.2,YD-1.0,0.7],dx=60,dy=100)
anchor("c_thin","cdT",[CX+BL/2-1.6,YD+0.1,0.2],dx=60,dy=-120)
# C 的電流：上＝很密（54 V 18,519 A 示意），下＝稀疏（1,250 A）
flow("c_up","cuB",[[CX-BL/2,YU,T/2+0.06],[CX+BL/2,YU,T/2+0.06]],10,5,0.22,[0,1,0],0.085,1.7)
flow("c_dn","cdB",[[CX-BL/2,YD,T/2+0.06],[CX+BL/2,YD,T/2+0.06]],2,2,0.4,[0,1,0],0.09,1.0)
flow("c_dnT","cdT",[[CX-BL/2,YD,0.2],[CX+BL/2,YD,0.2]],2,1,0.2,[0,1,0],0.08,1.0)
actions["c_hot"]={"type":"pulse","layer":"cuB","parts":["cu_bar"],"color":"lp_bad","steady":True,"glow":0.95,"halo":0}
actions["c_heat"]={"preset":"heat-spread","layer":"cuB","from":{"layer":"cuB","p":[CX,YU,0]},"dir":[0,1,0],"reach":2.4,"count":4,"r0":0.7,"spread":0.55,"rate":0.9,"color":"lp_bad"}
actions["c_heat2"]={"preset":"heat-spread","layer":"cuB","from":{"layer":"cuB","p":[CX+3,YU,0]},"dir":[0,1,0],"reach":2.2,"count":3,"r0":0.7,"spread":0.55,"rate":0.8,"color":"lp_heat"}
actions["c_lampU"]={"type":"pulse","layer":"cuL","parts":["cu_lamp"],"color":"lp_proc","steady":True,"glow":1,"halo":0}
actions["c_lampD"]={"type":"pulse","layer":"cdL","parts":["cd_lamp"],"color":"lp_proc","steady":True,"glow":1,"halo":0}
actions["c_srcU"]={"type":"pulse","layer":"cuS","parts":["cu_src"],"color":"lp_proc","steady":True,"glow":0.5,"halo":0}
actions["c_srcD"]={"type":"pulse","layer":"cdS","parts":["cd_src"],"color":"lp_proc","steady":True,"glow":0.5,"halo":0}

# ───────── D：降壓路徑（電源側櫃 800 V → 細銅排 → 模組 A 800→50 → 模組 B 50→12 → 晶片板 約 1 V；越往後電流越大、導體越粗）─────────
DX=HX["D"]; DY=3.0
box("d_sc","dS",mm("shelf"),[2.2,5.6,2.6],[DX-6.6,2.8,0]); box("d_scl","dS",mm("louv"),[1.7,0.1,0.05],[DX-6.6,3.0,1.32],at=[[0,k*0.32-0.2,0] for k in range(10)]); box("d_scled","dS",mm("led"),[0.14,0.14,0.05],[DX-6.0,5.0,1.33])
box("d_b1","dB1",mm("cuHi"),[2.2,0.3,0.3],[DX-4.4,DY,0]); box("d_b2","dB2",mm("cu"),[2.0,0.7,0.7],[DX+0.1,DY,0]); box("d_b3","dB3",mm("cu"),[1.6,1.2,1.2],[DX+3.4,DY,0])
for nm,lay,x in (("b1","dB1",DX-4.0),("b2","dB2",DX-0.4),("b3","dB3",DX+3.0)): cyl(f"d_{nm}_bolt",lay,mm("bolt"),0.11,0.12,[x,DY,0.2])
for nm,x,w,h in (("mA",DX-2.2,2.4,2.8),("mB",DX+1.8,2.2,2.2)):
    box(f"d_{nm}","d"+nm,mm("louv"),[w,h,2.6],[x,h/2+0.9,0]); box(f"d_{nm}_pl","d"+nm,mm("steel"),[w-0.4,0.1,2.2],[x,h+0.95,0])
    box(f"d_{nm}_lab","d"+nm,mm("steel"),[w-0.8,0.5,0.05],[x,h/2+0.9,1.32])
    lib.append({"part":"heatsink","id":"d_"+nm+"_hs","pos":[x,h+1.0,0],"w":w-0.4,"d":2.2,"base":0.1,"fins":7,"finH":1.1,"finT":0.08})
lib.append({"part":"pcb","id":"d_pcb","pos":[DX+6.4,0.5,0],"w":3.8,"d":3.6,"t":0.2,"pads":False})
lib.append({"part":"die","id":"d_die","pos":[DX+6.4,0.7,0],"w":1.5,"d":1.5,"t":0.3,"bumps":False})
for i in range(4): box(f"d_ind{i}","d_pcb",mm("chipBk"),[0.5,0.34,0.5],[DX+5.4,0.87,-1.1+i*0.73])
for i in range(4): box(f"d_ind{i}b","d_pcb",mm("chipBk"),[0.5,0.34,0.5],[DX+7.4,0.87,-1.1+i*0.73])
box("d_bridge","dB3",mm("cu"),[1.2,0.5,0.9],[DX+5.0,DY,0])
box("d_stand","dB3",mm("steel2"),[0.5,DY-0.7,0.5],[DX+5.0,(DY-0.7)/2+0.7,0])
anchor("d_sc","dS",[DX-6.6,6.0,0],dx=0,dy=-90); anchor("d_a","dmA",[DX-2.2,4.6,1.3],dx=-10,dy=-170); anchor("d_b","dmB",[DX+1.8,4.1,1.3],dx=30,dy=-200); anchor("d_c","d_die",[DX+6.4,1.2,0.8],dx=50,dy=-130)
flow("d_f1","dB1",[[DX-5.4,DY,0.2],[DX-3.4,DY,0.2]],2,1,0.2,[0,1,0],0.08,1.1)
flow("d_f2","dB2",[[DX-1.0,DY,0.4],[DX+0.9,DY,0.4]],4,2,0.22,[0,1,0],0.08,1.3)
flow("d_f3","dB3",[[DX+2.6,DY,0.65],[DX+5.4,DY,0.65]],7,3,0.25,[0,1,0],0.09,1.5)
actions["d_pA"]={"type":"pulse","layer":"dmA","parts":["d_mA"],"color":"lp_proc","steady":True,"glow":0.55,"halo":0}
actions["d_pB"]={"type":"pulse","layer":"dmB","parts":["d_mB"],"color":"lp_proc","steady":True,"glow":0.55,"halo":0}
actions["d_pS"]={"type":"pulse","layer":"dS","parts":["d_sc"],"color":"lp_proc","steady":True,"glow":0.45,"halo":0}
actions["d_pC"]={"type":"pulse","layer":"d_die","parts":["d_die_body"],"color":"lp_heat","steady":True,"glow":0.8,"halo":0}
actions["d_hA"]={"preset":"heat-spread","layer":"dmA","from":{"layer":"dmA","p":[DX-2.2,4.3,0]},"dir":[0,1,0],"reach":2.0,"count":3,"r0":0.5,"spread":0.5,"rate":0.8,"color":"lp_heat"}
actions["d_hB"]={"preset":"heat-spread","layer":"dmB","from":{"layer":"dmB","p":[DX+1.8,3.7,0]},"dir":[0,1,0],"reach":2.0,"count":3,"r0":0.5,"spread":0.5,"rate":0.8,"color":"lp_heat"}
actions["d_air"]={"preset":"stream","layer":"dmA","path":[[DX-4.0,1.5,2.4],[DX+3.6,1.5,2.4]],"n":6,"shape":"arrow","rate":0.7,"color":"air","size":0.2}


# ───────── B：降壓模組近景（電路板：輸入接點、銅走線、開關晶片、電感、電容，往中間的運算晶片送約 1 V）─────────
DB=180
lib.append({"part":"pcb","id":"d_bpcb","pos":[DB,0,0],"w":9.6,"d":7.8,"t":0.22,"pads":False})
lib.append({"part":"die","id":"d_bdie","pos":[DB,0.22,0],"w":2.4,"d":2.4,"t":0.4,"bumps":False})
BYT=0.22
XS=[-2.4,-0.8,0.8,2.4]
box("b_in","d_bpcb",mm("cuHi"),[1.0,0.5,2.0],[DB-4.4,BYT+0.25,0])
for j in range(5): box(f"b_inp{j}","d_bpcb",mm("bolt"),[0.12,0.12,0.12],[DB-4.7,BYT+0.55,-0.8+0.4*j])
box("b_zbus","d_bpcb",mm("cu"),[0.4,0.06,7.8],[DB-3.7,BYT+0.04,0])
for sz in (-1,1):
    box(f"b_xbus{sz}","d_bpcb",mm("cu"),[7.2,0.06,0.4],[DB-0.1,BYT+0.04,sz*3.75])
    for i,x in enumerate(XS):
        box(f"b_mos{sz}{i}","d_bpcb",mm("chipBk"),[0.8,0.24,0.62],[DB+x,BYT+0.12,sz*3.0])
        box(f"b_pin{sz}{i}","d_bpcb",mm("bolt"),[0.7,0.05,0.08],[DB+x,BYT+0.06,sz*3.0],at=[[0,0,-0.3],[0,0,0.3]])
        box(f"b_t1{sz}{i}","d_bpcb",mm("cu"),[0.3,0.05,0.6],[DB+x,BYT+0.04,sz*3.4])
        box(f"b_ind{sz}{i}","d_bpcb",mm("chipBk"),[0.95,0.5,0.95],[DB+x,BYT+0.25,sz*2.15])
        box(f"b_indw{sz}{i}","d_bpcb",mm("cuHi"),[0.98,0.06,0.98],[DB+x,BYT+0.52,sz*2.15])
        box(f"b_t2{sz}{i}","d_bpcb",mm("cu"),[0.3,0.05,0.7],[DB+x,BYT+0.04,sz*2.65])
        cyl(f"b_cap{sz}{i}","d_bpcb",mm("steel2"),0.3,0.5,[DB+x,BYT+0.25,sz*1.55],vertical=True)
        cyl(f"b_capt{sz}{i}","d_bpcb",mm("dark"),0.22,0.05,[DB+x,BYT+0.52,sz*1.55],vertical=True)
        box(f"b_t3{sz}{i}","d_bpcb",mm("cuHi"),[0.5,0.05,0.5],[DB+x,BYT+0.04,sz*1.2])
anchor("b_die","d_bdie",[DB+1.2,BYT+0.5,1.2],dx=70,dy=-120); anchor("b_ind","d_bpcb",[DB+2.4,BYT+0.55,2.6],dx=110,dy=-60); anchor("b_mos","d_bpcb",[DB-2.4,BYT+0.25,-3.0],dx=-110,dy=-60); anchor("b_cap","d_bpcb",[DB-0.8,BYT+0.55,-1.55],dx=-130,dy=40)
flow("d_bin","d_bpcb",[[DB-4.7,BYT+0.6,0],[DB-3.7,BYT+0.1,0]],4,1,0.2,[0,1,0],0.09,1.2)
flow("d_bzT","d_bpcb",[[DB-3.7,BYT+0.1,-0.2],[DB-3.7,BYT+0.1,-3.75]],3,1,0.2,[1,0,0],0.08,1.1)
flow("d_bzB","d_bpcb",[[DB-3.7,BYT+0.1,0.2],[DB-3.7,BYT+0.1,3.75]],3,1,0.2,[1,0,0],0.08,1.1)
flow("d_bxT","d_bpcb",[[DB-3.5,BYT+0.1,-3.75],[DB+3.4,BYT+0.1,-3.75]],3,1,0.2,[0,1,0],0.08,1.2)
flow("d_bxB","d_bpcb",[[DB-3.5,BYT+0.1,3.75],[DB+3.4,BYT+0.1,3.75]],3,1,0.2,[0,1,0],0.08,1.2)
flow("d_bsT","d_bpcb",[[DB,BYT+0.1,-3.5],[DB,BYT+0.1,-1.25]],4,4,1.6,[1,0,0],0.08,1.3,"lp_sig","lp_sigRim")
flow("d_bsB","d_bpcb",[[DB,BYT+0.1,3.5],[DB,BYT+0.1,1.25]],4,4,1.6,[1,0,0],0.08,1.3,"lp_sig","lp_sigRim")
actions["d_bdieG"]={"type":"pulse","layer":"d_bdie","parts":["d_bdie_body"],"color":"lp_heat","steady":True,"glow":0.8,"halo":0}
actions["d_bmosG"]={"type":"pulse","layer":"d_bpcb","parts":[f"b_mos{s}{i}" for s in (-1,1) for i in range(4)],"color":"lp_proc","freq":3,"glow":0.8,"halo":0}
actions["d_bheat"]={"preset":"heat-spread","layer":"d_bdie","from":{"layer":"d_bdie","p":[DB,BYT+0.5,0]},"dir":[0,1,0],"reach":1.8,"count":3,"r0":0.5,"spread":0.5,"rate":0.8,"color":"lp_heat"}
actions["d_bair"]={"preset":"stream","layer":"d_bpcb","path":[[DB-5.2,1.1,-1.0],[DB+5.2,1.1,-1.0]],"n":6,"shape":"arrow","rate":0.7,"color":"air","size":0.2}
anchor("rk_sc2","sc",[SCX+1.5,3.4,-0.2],dx=70,dy=60)

model = {
 "name":"tech-800v：八百伏特（機櫃供電）。座標：R 機櫃 x=0、C 銅排對照 x=60、D 降壓路徑 x=120。零件用基本形狀＋庫（heatsink、pcb、die）。",
 "unit":"1＝約 10 cm（示意，非實際比例）","size":{"w":14,"h":2,"r":0.1,"t":6},
 "palette":palette,"materials":materials,"layers":layers,"anchors":anchors,"parts":lib+parts,"actions":actions,
 "pose":{"yaw0":0,"yawIso":0,"drift":0},"camera":{"stand":{"d":24,"elev":24,"y":3.5}},
 "fx":{"dpr":1,"srcPx":30,"shadows":0,"ghost":False,"guides":False,"fog":False,"dust":False,"vaporSprites":False,"shimmer":False},
}
json.dump(model, open("/home/user/ai-mp4/videos/tech-800v/model.json","w"), ensure_ascii=False, indent=1)
print("parts",len(parts),"layers",len(layers))
