# scratch generator (not committed): writes videos/tech-server/script.json
import json
TX = 150
HIDE = "s1:start-40"      # 一開始就藏起來的起點
FAR = "s10:end+400"

def sh(layer, at, until=None, **kw):
    d = {"layer": layer, "at": at}
    if until: d["until"] = until
    d.update(kw); return d
def hide_until(layer, until, dy=None, dur=2):
    d = {"layer": layer, "at": HIDE, "until": until, "opacity": 0, "dur": dur}
    if dy is not None: d["dy"] = dy
    return d
def gone(layer, at, dur=6): return {"layer": layer, "at": at, "until": FAR, "opacity": 0, "dur": dur}
def fall(layer, until, press=None, dy=1.2, bounce=0.07):
    d = {"layer": layer, "at": HIDE, "until": until, "dy": dy, "opacity": 0, "dur": 12, "fallIn": True, "bounce": bounce}
    if press: d["press"] = press; d["pressAmt"] = 0.012
    return d
def off(c, n): return f"{c}{'+' if n >= 0 else '-'}{abs(n)}"
def run(i, at, until=None, ramp=None, **kw):
    d = {"id": i, "at": at}
    if until: d["until"] = until
    if ramp: d["ramp"] = ramp
    d.update(kw); return d
def lab(part, text, en, color, at, until): return {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until}
def stamp(text, at, until, color="amber", size=44, rot=-4, **kw):
    d = {"type": "stamp", "at": at, "until": until, "text": text, "color": color, "size": size, "rot": rot}
    d.update(kw); return d

def cue(i, t): return {"id": i, "text": t}
def scene(i, beat, para, tts, zh, en, kw, cues, props, src, pause=None, narr=None):
    s = {"id": i, "beat": beat, "para": para, "narration": narr or tts, "tts": tts,
         "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)}, "keywords": kw, "cues": cues, "component": "ThreeScene", "props": props, "sources": src}
    if pause: s["pauseAfter"] = pause
    assert len(zh) == len(en), (i, len(zh), len(en))
    return s


SLOTORD = ["pw0", "pw1"] + [f"c{i}" for i in range(9)] + [f"sw{i}" for i in range(9)] + [f"c{i}" for i in range(9, 18)] + ["pw2", "pw3"]
RACK_Y, RACK_D = 1.9, 34
scenes = []

# ───────────── s1 鉤子（機櫃整個疊起來）─────────────
s1_shift = [fall("frame", off("start", 2), dy=1.2)]
for n, L in enumerate(SLOTORD):
    s1_shift.append(fall(L, off("start", 4 + 2 * n), press=[SLOTORD[n - 1] if n else "frame"], dy=1.1, bounce=0.04))
for L in ("spine", "bus", "cool", "cdu"): s1_shift.append(hide_until(L, "s1:end+400", dy=0))
for L in ("cp0", "cp1", "cpb0", "cpb1", "tcool", "hs0", "hs1", "fan0", "fan1", "fan2", "fan3"): s1_shift.append(hide_until(L, "s1:end+400", dy=0))
s1_shift.append({"layer": "c8", "at": "what", "until": "s2:start-2", "dz": 1.4, "dy": 0, "dx": 0, "dur": 16})
scenes.append(scene("s1", "hook", 1,
    "一櫃 AI 伺服器，約一點四公噸，跟一台小客車差不多重，耗電一百多千瓦。裡面到底裝了什麼？",
    ["一櫃 AI 伺服器", "約一點四公噸", "跟一台小客車差不多重", "耗電一百多千瓦", "裡面到底裝了什麼？"],
    ["One rack of AI servers", "weighs about 1.4 tonnes,", "about as heavy as a small car,", "and draws over a hundred kilowatts.", "What is actually inside?"],
    ["一點四公噸", "小客車", "一百多千瓦"],
    [cue("rack", "一櫃"), cue("ton", "一點四公噸"), cue("car", "小客車"), cue("kw", "一百多千瓦"), cue("what", "裝了什麼")],
    {"hook": {"kicker": "NVL72 機櫃｜廠商規格", "title": "1 櫃 ≈ 1.4 噸", "size": 120, "top": 236},
     "zoom": [{"to": "rack", "at": "start-30", "dur": 1}],
     "shot": [{"at": "start-30", "dur": 1, "x": 0.4, "y": 4.0, "d": 30, "elev": 12}],
     "shift": s1_shift,
     "run": [run("r_cglow", "kw", "what+30", 6)],
     "labels": [],
     "overlay": [stamp("約 1.4 公噸", "ton", "s2:start-2", "amber", 46, x=300, y=1130, avoid=False),
                 stamp("≈ 小客車", "car", "s2:start-2", "blue", 46, x=780, y=1130, avoid=False),
                 stamp("120–132 kW", "kw", "s2:start-2", "coral", 46, x=300, y=1270, avoid=False),
                 stamp("裡面？", "what", "s2:start-2", "blue", 46, x=780, y=1270, avoid=False)]},
    ["NVIDIA；HPE、Supermicro 規格"], pause=0.7))

# ───────────── s2 72 顆 GPU ─────────────
scenes.append(scene("s2", "you", 2,
    "拆開看，有七十二顆 GPU，也就是做運算的 AI 晶片。",
    ["拆開看", "有七十二顆 GPU", "也就是做運算的", "AI 晶片"],
    ["Open it up:", "there are 72 GPUs,", "the chips that do", "the AI computing."],
    ["七十二顆", "AI 晶片"],
    [cue("open", "拆開看"), cue("gpu", "七十二顆"), cue("calc", "做運算"), cue("chip", "AI 晶片")],
    {"zoom": [{"to": "rack", "at": "start-2", "dur": 1}], "shot": [{"at": "start-2", "dur": 14, "x": 0.4, "y": RACK_Y, "d": RACK_D, "elev": 10}],
     "shift": [{"layer": "frame", "at": "open", "until": "s3:start-2", "opacity": 0.3, "dur": 10}],
     "run": [run("r_cglow", "calc", "s3:start-2", 6)],
     "labels": [lab("r_gpu", "運算托盤（GPU）", "compute tray", "amber", "gpu", "s3:start-2")],
     "overlay": [{"type": "section", "kind": "srv-count", "at": "start+2", "until": "s4:start-14", "x": 64, "y": 1030, "w": 952, "h": 400, "avoid": False, "title": "一櫃裡有幾顆", "tag": "示意",
                  "t": {"tray": {"at": "open"}, "gpu": {"at": "gpu"}, "cpu": {"at": "s3:cpu"}}},
                 stamp("廠商公布", "chip", "s3:start-2", "blue", 40, x=830, y=340, avoid=False)]},
    ["NVIDIA 文件；SemiAnalysis"]))

# ───────────── s3 托盤特寫（R → T）─────────────
s3_shift = [{"layer": "c8", "at": "tray", "until": "s4:start-2", "dz": 3.3, "dy": 0, "dx": 0, "dur": 18}]
# 托盤 2.5D 爆炸剖析：電路板留底，供電／連接器、模組、晶片依序拉開，s4 開頭組回去
for L in ("vrm0", "vrm1", "tpw", "trc", "tp_nic"): s3_shift.append({"layer": L, "at": "four+8", "until": "s4:start-2", "dy": 1.7, "dur": 20})
for L in ("sc0", "sc1"): s3_shift.append({"layer": L, "at": "four+14", "until": "s4:start-2", "dy": 3.4, "dur": 20})
for L in ("sc0_c", "sc0_g0", "sc0_g1", "sc1_c", "sc1_g0", "sc1_g1"): s3_shift.append({"layer": L, "at": "four+20", "until": "s4:start-2", "dy": 5.1, "dur": 20})
scenes.append(scene("s3", "mechanism", 3,
    "它們分在十八層托盤，每層四顆，旁邊配兩顆 CPU。",
    ["它們分在十八層托盤", "每層四顆", "旁邊配兩顆 CPU"],
    ["They sit on eighteen trays,", "four per tray,", "beside two CPUs."],
    ["十八層托盤", "每層四顆", "兩顆"],
    [cue("tray", "十八層托盤"), cue("four", "每層四顆"), cue("cpu", "兩顆")],
    {"zoom": [{"to": "board", "at": "four-8", "dur": 30}],
     "shot": [{"at": "start-2", "dur": 1, "x": 0.4, "y": RACK_Y, "d": RACK_D, "elev": 10},
              {"at": "four-4", "dur": 1, "x": TX, "y": -2.6, "d": 40, "elev": 56},
              {"at": "four+6", "dur": 24, "x": TX, "y": 0.2, "d": 56, "elev": 36}],
     "shift": s3_shift,
     "run": [run("r_c8glow", "tray", "four-6", 6), run("t_gpuhot", "four", "s4:start-2", 6), run("t_gpuhot1", "four+8", "s4:start-2", 6), run("t_data", "four", "s4:start-2", 6),
             run("t_cpuglow", "cpu-4", "s4:start-2", 6), run("t_rear", "four+10", "s4:start-2", 6), run("t_rear2", "four+10", "s4:start-2", 6), run("t_pwr", "four", "s4:start-2", 6), run("t_vrm", "four", "s4:start-2", 6), run("t_vrm0", "four+6", "s4:start-2", 6), run("t_vrm1", "four+6", "s4:start-2", 6)],
     "labels": [lab("t_pcbA", "電路板 PCB", "circuit board", "blue", "four+10", "s4:start-2"), lab("t_vrmA", "供電模組 VRM", "power stages", "blue", "four+10", "s4:start-2"), lab("t_gpu", "GPU × 4", "4 GPUs", "amber", "four+24", "s4:start-2"), lab("t_cpu", "CPU × 2", "2 CPUs", "blue", "cpu-2", "s4:start-2")],
     "overlay": []},
    ["NVIDIA：每托盤 4 GPU＋2 Grace CPU"], pause=0.7))

# ───────────── s4 為什麼整櫃（T → R 背面）─────────────
scenes.append(scene("s4", "mechanism", 4,
    "為什麼要整櫃一起設計？因為七十二顆要像一顆一樣工作，得不停傳資料。",
    ["為什麼要整櫃一起設計？", "因為七十二顆", "要像一顆一樣工作", "得不停傳資料"],
    ["Why design the whole rack together?", "Because the 72 chips", "must work like one,", "and keep passing data."],
    ["像一顆", "不停傳資料"],
    [cue("why", "整櫃一起設計"), cue("seventy", "七十二顆"), cue("one", "像一顆"), cue("talk", "不停傳資料")],
    {"zoom": [{"to": "rack", "at": "start-6", "dur": 30}],
     "shot": [{"at": "start-2", "dur": 1, "x": 0.4, "y": RACK_Y, "d": RACK_D, "elev": 12},
              {"at": "one-10", "dur": 28, "x": 0, "y": RACK_Y, "d": RACK_D, "elev": 12, "yaw": 2.4}],
     "shift": [hide_until("spine", "one", dy=0)],
     "run": [run("r_frglow", "why", "seventy", 6), run("r_cglow", "seventy", "one", 6), run("d_spine", "talk", "s5:start-2", 6), run("d_spine2", "talk", "s5:start-2", 6)],
     "labels": [],
     "overlay": [stamp("整櫃一起設計", "why", "seventy", "amber", 44, x=300, y=330, avoid=False),
                 {"type": "section", "kind": "srv-mesh", "at": "start+2", "until": "s6:start-14", "x": 64, "y": 1030, "w": 952, "h": 400, "avoid": False, "title": "72 顆怎麼變一顆", "tag": "示意",
                  "t": {"one": {"at": "one"}, "link": {"at": "talk"}, "cable": {"at": "s5:cable"}, "find": {"at": "s5:find"}, "rest": {"at": "s5:rest"}}}]},
    ["NVIDIA 技術部落格：72 GPU 為單一 NVLink 網域"], pause=0.7))

# ───────────── s5 交換器與銅線 ─────────────
scenes.append(scene("s5", "mechanism", 5,
    "中間九層交換器，用五千多條銅線串起來，每顆 GPU 都找得到另外七十一顆。",
    ["中間九層交換器", "用五千多條銅線串起來", "每顆 GPU 都找得到", "另外七十一顆"],
    ["Nine switch trays in the middle,", "linked by over 5,000 copper cables,", "so every GPU can reach", "the other 71."],
    ["九層交換器", "五千多條銅線", "七十一顆"],
    [cue("sw", "九層交換器"), cue("cable", "五千多條銅線"), cue("find", "找得到"), cue("rest", "七十一顆")],
    {"shot": [{"at": "start-2", "dur": 1, "x": 0, "y": RACK_Y, "d": RACK_D, "elev": 12}],
     "shift": [],
     "run": [run("r_swglow", "sw", "cable", 6), run("d_spine", "cable-8", "s6:start-2", 6), run("d_spine2", "cable-8", "s6:start-2", 6), run("d_arms", "find", "s6:start-2", 6)],
     "labels": [lab("r_sw", "交換器 ×9", "9 switch trays", "blue", "sw", "s6:start-2"), lab("r_spine", "銅線背板", "copper spine", "amber", "cable", "s6:start-2")],
     "overlay": [stamp("超過 5,000 條", "cable+4", "find", "amber", 44, x=290, y=330, avoid=False), stamp("每顆都連到", "find", "rest", "blue", 44, x=290, y=330, avoid=False), stamp("另外 71 顆", "rest", "s6:start-2", "coral", 44, x=290, y=330, avoid=False)]},
    ["NVIDIA 技術部落格；Supermicro"], pause=0.7))

# ───────────── s6 電 → 熱（最後一句切到托盤）─────────────
scenes.append(scene("s6", "mechanism", 6,
    "電從電源層進來，順著銅排送到每一層，最後都變成熱。",
    ["電從電源層進來", "順著銅排送到每一層", "最後都變成熱"],
    ["Power comes in from the power shelves,", "runs down the copper busbars to every tray,", "and ends up as heat."],
    ["電源層", "銅排", "變成熱"],
    [cue("in", "電源層"), cue("bus", "銅排"), cue("heat", "變成熱")],
    {"zoom": [{"to": "board", "at": "heat-10", "dur": 30}],
     "shot": [{"at": "start-2", "dur": 1, "x": 0, "y": RACK_Y, "d": RACK_D, "elev": 12},
              {"at": "heat-6", "dur": 1, "x": TX, "y": -2.6, "d": 40, "elev": 56, "yaw": -2.4}],
     "shift": [hide_until("bus", "bus-14", dy=0)] + [fall(L, "heat-6", dy=1.0, bounce=0.03) for L in ("hs0", "hs1")] + [fall(L, "heat-6", dy=0.8, bounce=0.02) for L in ("fan0", "fan1", "fan2", "fan3")],
     "run": [run("r_pwglow", "in-6", "bus+10", 6), run("p_arm_l", "bus+6", "s7:start-2", 6), run("p_arm_r", "bus+6", "s7:start-2", 6), run("p_up", "bus", "heat-8", 6), run("p_dn", "bus", "heat-8", 6), run("p_up2", "bus", "heat-8", 6), run("p_dn2", "bus", "heat-8", 6),
             run("t_vrm", "heat-6", "s7:start-2", 6), run("t_vrm0", "heat-4", "s7:start-2", 6), run("t_vrm1", "heat-4", "s7:start-2", 6), run("t_pwr", "heat-6", "s7:start-2", 6)],
     "labels": [lab("r_pw", "電源層", "power shelf", "amber", "in", "heat-8")],
     "overlay": [{"type": "section", "kind": "srv-power", "at": "start+2", "until": "s7:start-14", "x": 64, "y": 1030, "w": 952, "h": 400, "avoid": False, "title": "電怎麼進來", "tag": "示意",
                  "t": {"in": {"at": "in"}, "bus": {"at": "bus"}, "heat": {"at": "heat"}}}]},
    ["NVIDIA；Gigabyte 資料表（電源層）；規格 120–132 kW"], pause=0.7))

# ───────────── s7 液冷（T → R）─────────────
FANS = ["fan0", "fan1", "fan2", "fan3"]
s7_shift = [{"layer": L, "at": "liq-12", "until": FAR, "dy": 2.2, "opacity": 0, "dur": 10} for L in ("hs0", "hs1")] + [{"layer": L, "at": "liq-12", "until": FAR, "dz": 1.2, "opacity": 0, "dur": 8} for L in FANS]
s7_shift += [{**hide_until(L, k, dy=0.9, dur=10), "fallIn": True, "bounce": 0.05} for L, k in (("cpb0", "liq-8"), ("cp0", "liq-6"), ("cpb1", "liq-4"), ("cp1", "liq-2"))]
s7_shift += [{"layer": L, "at": "chipf", "until": "out-10", "dy": 2.4, "dur": 16} for L in ("cp0", "cp1")]
s7_shift += [
             hide_until("tcool", "chipf-6", dy=0, dur=6), hide_until("cool", "out-12", dy=0), hide_until("cdu", "out-12", dy=0)]
scenes.append(scene("s7", "mechanism", 7,
    "風吹不動了。所以改用冷卻液，流過晶片，把熱帶出機櫃外。",
    ["風吹不動了", "所以改用冷卻液", "流過晶片", "把熱帶出機櫃外"],
    ["Air can't keep up.", "So coolant is used instead,", "flowing over the chips", "and carrying the heat out of the rack."],
    ["風吹不動", "冷卻液", "帶出機櫃外"],
    [cue("air", "風吹不動"), cue("liq", "冷卻液"), cue("chipf", "流過晶片"), cue("out", "帶出機櫃外")],
    {"zoom": [{"to": "plate", "at": "chipf-28", "dur": 30}, {"to": "rack", "at": "out-8", "dur": 30}],
     "shot": [{"at": "chipf-22", "dur": 14, "x": TX-3.05, "y": -0.6, "d": 20, "elev": 36},
              {"at": "out-4", "dur": 1, "x": -1.6, "y": RACK_Y, "d": RACK_D, "elev": 12, "yaw": 2.55}],
     "shift": s7_shift,
     "run": [run("t_gpuhot", "s6:heat-4", "chipf+14", 6), run("t_gpuhot1", "s6:heat-4", "chipf+14", 6), run("hs0_waves", "air", "liq-12", 6), run("hs1_waves", "air", "liq-12", 6),
             run("fan0_spin", "air-4", "liq-8", 8), run("fan1_spin", "air-4", "liq-8", 8), run("fan2_spin", "air-4", "liq-8", 8), run("fan3_spin", "air-4", "liq-8", 8),
             run("t_air", "air", "liq-10", 6), run("t_air2", "air+2", "liq-10", 6), run("t_air3", "air+4", "liq-10", 6), run("t_air4", "air+6", "liq-10", 6),
             run("t_cold", "chipf", "out", 6), run("t_hot", "chipf+8", "out", 6), run("t_data", "s6:heat", "out", 6), run("t_rear", "s6:heat", "out", 6), run("t_rear2", "s6:heat", "out", 6), run("t_pwr", "s6:heat", "out", 6),
             run("c_cold", "out", "s8a:start-2", 6), run("c_hot", "out", "s8a:start-2", 6), run("c_arm_c", "out", "s8a:start-2", 6), run("c_arm_h", "out+6", "s8a:start-2", 6),
             run("cdu_fan0", "out", "s8a:start-2", 6), run("cdu_fan1", "out", "s8a:start-2", 6)],
     "labels": [lab("t_lid", "蓋板", "lid", "amber", "chipf+6", "out-8"), lab("t_base", "銅底板＋水道", "copper base with channels", "blue", "chipf+8", "out-8"), lab("t_gpu", "晶片", "GPU die", "amber", "chipf+10", "out-8")],
     "overlay": [{"type": "section", "kind": "srv-cool", "at": "start+2", "until": "s8a:start-14", "x": 64, "y": 1030, "w": 952, "h": 400, "avoid": False, "title": "風冷 → 液冷", "tag": "示意",
                  "t": {"air": {"at": "air"}, "liq": {"at": "liq"}, "out": {"at": "out"}}}]},
    ["NVIDIA；DCD（晶片與交換器液冷）"], pause=0.7))

# ───────────── s8a／s8b 哪些公司在做（引線從名字拉到機櫃對應部位）─────────────
scenes.append(scene("s8a", "payoff", 8,
    "做這些的，有鴻海、廣達、緯穎組裝，台達電做電源。",
    ["做這些的", "有鴻海 廣達", "緯穎組裝", "台達電做電源"],
    ["Who builds this:", "Foxconn and Quanta", "and Wiwynn assemble,", "Delta does the power."],
    ["鴻海", "台達電"],
    [cue("intro", "做這些的"), cue("fox", "鴻海"), cue("wiw", "緯穎"), cue("pw", "台達電")],
    {"shot": [{"at": "start-2", "dur": 1, "x": 0.6, "y": 2.2, "d": 34, "elev": 12, "yaw": -2.2}],
     "shift": [{"layer": "bus", "at": "start", "until": FAR, "opacity": 0, "dur": 6}],
     "run": [run("r_frglow", "intro", "fox", 6), run("r_cglow", "fox", "wiw", 6), run("r_cut", "wiw", "pw", 6), run("r_pwglow", "pw", "s8b:start-2", 6), run("p_arm_l", "pw", "s8b:start-2", 6), run("p_arm_r", "pw", "s8b:start-2", 6)],
     "labels": [lab("r_top", "鴻海、廣達　組裝", "assembly", "amber", "fox-4", "s8b:start-2"), lab("r_top2", "緯穎　組裝", "assembly", "amber", "wiw-4", "s8b:start-2"), lab("r_pw", "台達電　電源層", "power shelf", "blue", "pw-4", "s8b:start-2")],
     "overlay": []},
    ["數位時代、科技新報、Yam 新聞（媒體報導）"], pause=0.7))
scenes.append(scene("s8b", "payoff", 8,
    "奇鋐和雙鴻做散熱，川湖做滑軌，勤誠做機殼。",
    ["奇鋐和雙鴻做散熱", "川湖做滑軌", "勤誠做機殼"],
    ["AVC and Auras do cooling,", "King Slide does rails,", "Chenbro the chassis."],
    ["散熱", "滑軌", "機殼"],
    [cue("cl", "奇鋐"), cue("rail", "川湖"), cue("shell", "勤誠")],
    {"shot": [{"at": "start-2", "dur": 1, "x": 0.6, "y": 2.2, "d": 34, "elev": 12}],
     "shift": [{"layer": "c8", "at": "rail-6", "until": "s9:start-2", "dz": 2.4, "dy": 0, "dx": 0, "dur": 20}],
     "run": [run("c_cold", "cl-6", "rail", 6), run("c_hot", "cl-6", "rail", 6), run("c_arm_c", "cl-6", "rail", 6), run("c_arm_h", "cl-6", "rail", 6), run("cdu_fan0", "cl-6", "rail", 6), run("r_c8glow", "rail", "shell", 6), run("r_frglow", "shell", "s9:start-2", 6)],
     "labels": [lab("r_mf", "奇鋐、雙鴻　散熱", "cooling", "blue", "cl-4", "s9:start-2"), lab("r_rail", "川湖　滑軌", "rails", "amber", "rail-4", "s9:start-2"), lab("r_chas", "勤誠　機殼", "chassis", "blue", "shell-4", "s9:start-2")],
     "overlay": []},
    ["經濟日報、自由時報、科技新報（媒體報導）"], pause=0.7))

# ───────────── s9 結尾 ─────────────
scenes.append(scene("s9", "cta", 9,
    "晶片、電源、風扇全塞進同一個櫃子，會產生大量的熱，所以要用特殊方法冷卻。下一支，來看液冷。想要完整解說，留言伺服器。",
    ["晶片 電源 風扇", "全塞進同一個櫃子", "會產生大量的熱", "所以要用特殊方法冷卻", "下一支", "來看液冷", "想要完整解說", "留言伺服器"],
    ["Chips, power, fans", "all packed into one cabinet,", "producing a lot of heat,", "so special cooling is needed.", "Next:", "liquid cooling.", "For the full notes,", "comment \"伺服器\"."],
    ["大量的熱", "液冷", "伺服器"],
    [cue("chip", "晶片"), cue("pwr", "電源"), cue("fan", "風扇"), cue("one", "同一個櫃子"), cue("heat", "大量的熱"), cue("cool", "特殊方法"), cue("next", "下一支"), cue("liquid", "液冷"), cue("full", "完整解說"), cue("kw", "留言伺服器")],
    {"shot": [{"at": "start-2", "dur": 1, "x": 1.6, "y": RACK_Y, "d": RACK_D, "elev": 12, "yaw": 1.65}],
     "shift": [],
     "run": [run("r_cglow", "chip", "pwr", 6), run("p_up", "pwr", "fan", 6), run("p_arm_l", "pwr", "fan", 6), run("cdu_fan0", "fan", "next", 6), run("r_frglow", "one", "heat", 6),
             run("r_cut", "heat-6", "cool+10", 6), run("r_heat", "heat", "cool+10", 6), run("c_cold", "cool", "kw", 6), run("c_hot", "cool+4", "kw", 6), run("c_arm_c", "cool", "kw", 6), run("c_arm_h", "cool+6", "kw", 6)],
     "labels": [lab("r_cdu", "冷卻液分配單元", "coolant unit", "blue", "cool", "next")],
     "overlay": [stamp("大量的熱", "heat", "cool-6", "coral", 48, x=690, y=250, avoid=False), stamp("特殊方法冷卻", "cool", "next-6", "blue", 44, x=640, y=250, avoid=False),
                 stamp("下一支", "next", "liquid-6", "amber", 48, x=690, y=250, avoid=False), stamp("液冷", "liquid", "full-6", "amber", 56, x=690, y=250, avoid=False),
                 stamp("完整解說", "full", "kw-6", "blue", 48, x=690, y=250, avoid=False), stamp("留言「伺服器」", "kw", "s10:start", "coral", 44, x=620, y=250, avoid=False)]},
    ["下一支：11/21（六）液冷（已排定）"]))

# ───────────── s10 片尾卡 ─────────────
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene",
               "props": {"endCard": {"next": "液冷", "trail": ["72 顆 GPU", "銅線", "電", "熱"], "at": "s9:kw-8", "comment": "伺服器", "logoAnim": "transparent"}}, "sources": []})

script = {
 "slug": "tech-server", "title": "AI 伺服器：一櫃約 1.4 噸，裡面到底裝了什麼（科技透明圈 第 7 支）", "asOf": "2026/11/20", "styleVersion": 3, "stage": "three",
 "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
 "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
           "_說明": "念稿：docs/prompts/tech-server-旁白.txt；API 整篇 1 次請求"},
 "hud": {"levels": [{"id": "rack", "label": "AI 伺服器機櫃", "en": "AI SERVER RACK", "field": "2 m", "ruler": "50 cm", "art": "none", "handoff3D": True, "readout": True, "note": "查證截至 2026/11/20", "noteAlways": True},
                    {"id": "board", "label": "運算托盤", "en": "COMPUTE TRAY", "field": "30 cm", "ruler": "10 cm", "art": "none", "readout": True, "note": "查證截至 2026/11/20", "noteAlways": True},
                    {"id": "plate", "label": "冷板", "en": "COLD PLATE", "field": "10 cm", "ruler": "2 cm", "art": "none", "readout": True, "note": "查證截至 2026/11/20", "noteAlways": True}],
         "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例・運作為示意"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
 "cover": {"title": ["一櫃 1.4 噸", "裡面裝什麼"], "sub": "AI 伺服器", "frame": 40},
 "sample": False,
 "scenes": scenes,
}
json.dump(script, open("/home/user/ai-mp4/videos/tech-server/script.json", "w"), ensure_ascii=False, indent=1)
print("ok", len(scenes))
