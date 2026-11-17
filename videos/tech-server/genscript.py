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
for L in ("cp0", "cp1", "tcool", "hs0", "hs1", "fan0", "fan1", "fan2", "fan3"): s1_shift.append(hide_until(L, "s1:end+400", dy=0))
scenes.append(scene("s1", "hook", 1,
    "一櫃 AI 伺服器，約一點四公噸，跟一台小客車差不多重，耗電一百多千瓦。裡面到底裝了什麼？",
    ["一櫃 AI 伺服器", "約一點四公噸", "跟一台小客車差不多重", "耗電一百多千瓦", "裡面到底裝了什麼？"],
    ["One rack of AI servers", "weighs about 1.4 tonnes,", "about as heavy as a small car,", "and draws over a hundred kilowatts.", "What is actually inside?"],
    ["一點四公噸", "小客車", "一百多千瓦"],
    [cue("rack", "一櫃"), cue("ton", "一點四公噸"), cue("car", "小客車"), cue("kw", "一百多千瓦"), cue("what", "裝了什麼")],
    {"hook": {"kicker": "NVL72 機櫃｜廠商規格", "title": "1 櫃 ≈ 1.4 噸", "size": 120, "top": 236},
     "zoom": [{"to": "pk", "at": "start-30", "dur": 1}],
     "shot": [{"at": "start-30", "dur": 1, "x": 0.4, "y": 4.0, "d": 30, "elev": 12}],
     "shift": s1_shift,
     "run": [run("r_cglow", "kw", "what+30", 6)],
     "labels": [],
     "overlay": [stamp("約 1.4 公噸", "ton", "s2:start-2", "amber", 46, x=300, y=1130, avoid=False),
                 stamp("≈ 小客車", "car", "s2:start-2", "blue", 46, x=780, y=1130, avoid=False),
                 stamp("120–132 kW", "kw", "s2:start-2", "coral", 46, x=540, y=1270, avoid=False)]},
    ["NVIDIA；HPE、Supermicro 規格"], pause=0.7))

# ───────────── s2 72 顆 GPU ─────────────
scenes.append(scene("s2", "you", 2,
    "拆開看，有七十二顆 GPU，也就是做運算的 AI 晶片。",
    ["拆開看", "有七十二顆 GPU", "也就是做運算的", "AI 晶片"],
    ["Open it up:", "there are 72 GPUs,", "the chips that do", "the AI computing."],
    ["七十二顆", "AI 晶片"],
    [cue("open", "拆開看"), cue("gpu", "七十二顆"), cue("chip", "AI 晶片")],
    {"zoom": [{"to": "pk", "at": "start-2", "dur": 1}], "shot": [{"at": "start-2", "dur": 14, "x": 0.4, "y": RACK_Y, "d": RACK_D, "elev": 10}],
     "shift": [],
     "run": [run("r_cglow", "open", "s3:start-2", 6)],
     "labels": [lab("r_gpu", "運算托盤（GPU）", "compute tray", "amber", "gpu", "s3:start-2")],
     "overlay": [{"type": "section", "kind": "srv-count", "at": "start+2", "until": "s4:start-14", "x": 64, "y": 1030, "w": 952, "h": 400, "avoid": False, "title": "一櫃裡有幾顆", "tag": "示意",
                  "t": {"tray": {"at": "open"}, "gpu": {"at": "gpu"}, "cpu": {"at": "s3:cpu"}}},
                 stamp("廠商公布", "gpu+10", "s3:start-2", "blue", 40, x=830, y=340, avoid=False)]},
    ["NVIDIA 文件；SemiAnalysis"]))

# ───────────── s3 托盤特寫（R → T）─────────────
s3_shift = [{"layer": "c8", "at": "tray", "until": "s4:start-2", "dz": 3.3, "dy": 0, "dx": 0, "dur": 18}]
scenes.append(scene("s3", "mechanism", 3,
    "它們分在十八層托盤，每層四顆，旁邊配兩顆 CPU。",
    ["它們分在十八層托盤", "每層四顆", "旁邊配兩顆 CPU"],
    ["They sit on eighteen trays,", "four per tray,", "beside two CPUs."],
    ["十八層托盤", "每層四顆", "兩顆"],
    [cue("tray", "十八層托盤"), cue("four", "每層四顆"), cue("cpu", "兩顆")],
    {"shot": [{"at": "start-2", "dur": 1, "x": 0.4, "y": RACK_Y, "d": RACK_D, "elev": 10},
              {"at": "four-4", "dur": 1, "x": TX, "y": -2.6, "d": 40, "elev": 56}],
     "shift": s3_shift,
     "run": [run("t_gpuhot", "four", "s4:start-2", 6), run("t_gpuhot1", "four+8", "s4:start-2", 6), run("t_data", "four", "s4:start-2", 6), run("t_rear", "four+10", "s4:start-2", 6), run("t_rear2", "four+10", "s4:start-2", 6), run("t_pwr", "four", "s4:start-2", 6)],
     "labels": [lab("t_gpu", "GPU × 4", "4 GPUs", "amber", "four+6", "s4:start-2"), lab("t_cpu", "CPU × 2", "2 CPUs", "blue", "cpu", "s4:start-2")],
     "overlay": []},
    ["NVIDIA：每托盤 4 GPU＋2 Grace CPU"], pause=0.7))

# ───────────── s4 為什麼整櫃（T → R 背面）─────────────
s4_shift = [{"layer": "c8", "at": "tray", "until": "s4:start-2", "dz": 3.3, "dy": 0, "dx": 0, "dur": 18}]
scenes.append(scene("s4", "mechanism", 4,
    "為什麼要整櫃一起設計？因為七十二顆要像一顆一樣工作，彼此得不停傳資料。",
    ["為什麼要整櫃一起設計？", "因為七十二顆", "要像一顆一樣工作", "彼此得不停傳資料"],
    ["Why design the whole rack together?", "Because the 72 chips", "must work like one,", "and keep passing data to each other."],
    ["像一顆", "不停傳資料"],
    [cue("why", "整櫃一起設計"), cue("seventy", "七十二顆"), cue("one", "像一顆"), cue("talk", "不停傳資料")],
    {"shot": [{"at": "start-2", "dur": 1, "x": 0.4, "y": RACK_Y, "d": RACK_D, "elev": 12},
              {"at": "one", "dur": 28, "x": 0, "y": RACK_Y, "d": RACK_D, "elev": 12, "yaw": 2.4}],
     "shift": [hide_until("spine", "talk-10", dy=0)],
     "run": [run("r_cglow", "seventy", "talk", 6), run("d_spine", "talk", "s5:start-2", 6), run("d_spine2", "talk", "s5:start-2", 6)],
     "labels": [],
     "overlay": [{"type": "section", "kind": "srv-mesh", "at": "start+2", "until": "s6:start-14", "x": 64, "y": 1030, "w": 952, "h": 400, "avoid": False, "title": "72 顆怎麼變一顆", "tag": "示意",
                  "t": {"one": {"at": "one"}, "link": {"at": "s5:sw"}, "cable": {"at": "s5:cable"}, "find": {"at": "s5:find"}}}]},
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
     "run": [run("r_swglow", "sw", "s6:start-2", 6), run("d_spine", "cable-8", "s6:start-2", 6), run("d_spine2", "cable-8", "s6:start-2", 6), run("d_arms", "cable", "s6:start-2", 6)],
     "labels": [lab("r_spine", "銅線背板", "copper spine", "amber", "cable", "s6:start-2"), lab("r_sw", "交換器 ×9", "9 switch trays", "blue", "sw", "s6:start-2")],
     "overlay": [stamp("超過 5,000 條", "cable+4", "s6:start-2", "amber", 44, x=290, y=330, avoid=False)]},
    ["NVIDIA 技術部落格；Supermicro"], pause=0.7))

# ───────────── s6 電 → 熱 ─────────────
scenes.append(scene("s6", "mechanism", 6,
    "電從電源層進來，順著銅排送到每一層。這麼大的電流，最後都變成熱。",
    ["電從電源層進來", "順著銅排送到每一層", "這麼大的電流", "最後都變成熱"],
    ["Power comes in from the power shelves,", "runs down the copper busbars to every tray.", "A current this big", "ends up as heat."],
    ["電源層", "銅排", "變成熱"],
    [cue("in", "電源層"), cue("bus", "銅排"), cue("big", "這麼大"), cue("heat", "變成熱")],
    {"shot": [{"at": "start-2", "dur": 1, "x": 0, "y": RACK_Y, "d": RACK_D, "elev": 12}],
     "shift": [hide_until("bus", "bus-14", dy=0)],
     "run": [run("r_pwglow", "in-6", "bus+10", 6), run("p_arm_l", "bus+6", "s7:start-2", 6), run("p_arm_r", "bus+6", "s7:start-2", 6), run("p_up", "bus", "s7:start-2", 6), run("p_dn", "bus", "s7:start-2", 6), run("p_up2", "bus", "s7:start-2", 6), run("p_dn2", "bus", "s7:start-2", 6),
             run("r_cut", "heat-10", "s7:start-2", 6), run("r_heat", "heat", "s7:start-2", 6)],
     "labels": [lab("r_pw", "電源層", "power shelf", "amber", "in", "s7:start-2")],
     "overlay": [{"type": "section", "kind": "srv-power", "at": "start+2", "until": "s7:start-14", "x": 64, "y": 1030, "w": 952, "h": 400, "avoid": False, "title": "電怎麼進來、變成什麼", "tag": "示意",
                  "t": {"in": {"at": "in"}, "bus": {"at": "bus"}, "heat": {"at": "heat"}}}]},
    ["NVIDIA；Gigabyte 資料表（電源層）；規格 120–132 kW"], pause=0.7))

# ───────────── s7 液冷（T → R）─────────────
FANS = ["fan0", "fan1", "fan2", "fan3"]
s7_shift = [fall(L, "start", dy=1.0, bounce=0.03) for L in ("hs0", "hs1")] + [fall(L, "start", dy=0.8, bounce=0.02) for L in FANS]
# 風冷件在念到「冷卻液」前退場，冷板落下、冷卻液管出現
s7_shift += [{"layer": L, "at": "liq-12", "until": FAR, "dy": 2.2, "opacity": 0, "dur": 10} for L in ("hs0", "hs1")] + [{"layer": L, "at": "liq-12", "until": FAR, "dz": 1.2, "opacity": 0, "dur": 8} for L in FANS]
s7_shift += [{**hide_until("cp0", "liq-6", dy=0.9, dur=10), "fallIn": True, "bounce": 0.05}, {**hide_until("cp1", "liq-2", dy=0.9, dur=10), "fallIn": True, "bounce": 0.05},
             hide_until("tcool", "liq-6", dy=0, dur=6), hide_until("cool", "out-12", dy=0), hide_until("cdu", "out-12", dy=0)]
scenes.append(scene("s7", "mechanism", 7,
    "風吹不動了。所以改用冷卻液，流過晶片，把熱帶出機櫃外。",
    ["風吹不動了", "所以改用冷卻液", "流過晶片", "把熱帶出機櫃外"],
    ["Air can't keep up.", "So coolant is used instead,", "flowing over the chips", "and carrying the heat out of the rack."],
    ["風吹不動", "冷卻液", "帶出機櫃外"],
    [cue("air", "風吹不動"), cue("liq", "冷卻液"), cue("chipf", "流過晶片"), cue("out", "帶出機櫃外")],
    {"shot": [{"at": "start-2", "dur": 1, "x": TX, "y": -2.6, "d": 40, "elev": 56, "yaw": -2.4},
              {"at": "out-4", "dur": 1, "x": -1.6, "y": RACK_Y, "d": RACK_D, "elev": 12, "yaw": 2.55}],
     "shift": s7_shift,
     "run": [run("t_gpuhot", "start", "chipf+14", 6), run("t_gpuhot1", "start", "chipf+14", 6), run("hs0_heat", "air", "liq-12", 6), run("hs1_heat", "air", "liq-12", 6), run("hs0_waves", "air", "liq-12", 6), run("hs1_waves", "air", "liq-12", 6),
             run("fan0_spin", "start", "liq-8", 8), run("fan1_spin", "start", "liq-8", 8), run("fan2_spin", "start", "liq-8", 8), run("fan3_spin", "start", "liq-8", 8),
             run("t_air", "air-6", "liq-10", 6), run("t_air2", "air-4", "liq-10", 6), run("t_air3", "air-2", "liq-10", 6), run("t_air4", "air", "liq-10", 6),
             run("t_cold", "liq", "out", 6), run("t_hot", "chipf", "out", 6), run("t_data", "start", "out", 6), run("t_rear", "start", "out", 6), run("t_rear2", "start", "out", 6), run("t_pwr", "start", "out", 6),
             run("c_cold", "out", "s8:start-2", 6), run("c_hot", "out", "s8:start-2", 6), run("c_arm_c", "out", "s8:start-2", 6), run("c_arm_h", "out+6", "s8:start-2", 6),
             run("cdu_fan0", "out", "s8:start-2", 6), run("cdu_fan1", "out", "s8:start-2", 6)],
     "labels": [lab("t_cp", "冷板（銅）", "cold plate", "blue", "liq+6", "out-6")],
     "overlay": [{"type": "section", "kind": "srv-cool", "at": "start+2", "until": "s8:start-14", "x": 64, "y": 1030, "w": 952, "h": 400, "avoid": False, "title": "風冷 → 液冷", "tag": "示意",
                  "t": {"air": {"at": "air"}, "liq": {"at": "liq"}, "out": {"at": "out"}}}]},
    ["NVIDIA；DCD（晶片與交換器液冷）"], pause=0.7))

# ───────────── s8 哪些公司在做 ─────────────
scenes.append(scene("s8", "payoff", 8,
    "做這些的，有鴻海、廣達、緯穎組裝，台達電做電源，奇鋐和雙鴻做散熱，川湖做滑軌，勤誠做機殼。各家市占，公開資料查不到完整數字。",
    ["做這些的", "有鴻海、廣達、緯穎組裝", "台達電做電源", "奇鋐和雙鴻做散熱", "川湖做滑軌，勤誠做機殼", "各家市占", "公開資料查不到完整數字"],
    ["Who builds this:", "Foxconn, Quanta and Wiwynn assemble,", "Delta does power,", "AVC and Auras do cooling,", "King Slide rails, Chenbro chassis.", "Market shares?", "No complete public numbers."],
    ["鴻海", "台達電", "查不到"],
    [cue("asm", "組裝"), cue("pw", "電源"), cue("cl", "散熱"), cue("rail", "滑軌"), cue("shell", "機殼"), cue("nodata", "查不到")],
    {"shot": [{"at": "start-2", "dur": 1, "x": 0.6, "y": 2.7, "d": 37, "elev": 12, "yaw": -2.2}],
     "shift": [{"layer": "c8", "at": "rail-4", "until": "shell-6", "dz": 2.4, "dy": 0, "dx": 0, "dur": 16}],
     "run": [run("r_cglow", "asm", "pw", 6), run("r_pwglow", "pw", "cl", 6), run("c_cold", "cl", "rail", 6), run("c_hot", "cl", "rail", 6), run("c_arm_c", "cl", "rail", 6), run("c_arm_h", "cl", "rail", 6), run("cdu_fan0", "cl", "rail", 6), run("r_frglow", "shell", "nodata", 6)],
     "labels": [],
     "overlay": [{"type": "card", "at": "asm", "until": "s9:start-2", "avoid": False, "y": 990, "kicker": "媒體報導", "rows": [["組裝", "鴻海、廣達、緯穎"], ["電源", "台達電"], ["散熱", "奇鋐、雙鴻"], ["滑軌", "川湖"], ["機殼", "勤誠"]], "hi": "台達電", "hiAt": "pw", "size": 34, "foot": "查證截至 2026/11/20，非投資建議"},
                 stamp("市占查不到", "nodata", "s9:start-2", "blue", 44, x=820, y=250, avoid=False)]},
    ["數位時代、科技新報、Yam 新聞、經濟日報（媒體報導）"], pause=0.7))

# ───────────── s9 結尾 ─────────────
scenes.append(scene("s9", "cta", 9,
    "晶片、電和熱，都要搬進同一個櫃子。下一支，來看液冷。想要完整解說，留言伺服器。",
    ["晶片、電和熱", "都要搬進同一個櫃子", "下一支", "來看液冷", "想要完整解說", "留言伺服器"],
    ["Chips, power and heat", "all have to fit in one cabinet.", "Next:", "liquid cooling.", "For the full notes,", "comment \"伺服器\"."],
    ["同一個櫃子", "液冷", "伺服器"],
    [cue("all", "晶片"), cue("one", "同一個櫃子"), cue("next", "下一支"), cue("liquid", "液冷"), cue("kw", "留言伺服器")],
    {"shot": [{"at": "start-2", "dur": 1, "x": 1.6, "y": RACK_Y, "d": RACK_D, "elev": 12, "yaw": 1.65}],
     "shift": [],
     "run": [run("d_spine", "all", "one", 6), run("p_up", "all", "one", 6), run("c_cold", "one", "kw", 6), run("c_hot", "one", "kw", 6)],
     "labels": [lab("r_cdu", "冷卻液分配單元", "coolant unit", "blue", "liquid", "kw-8")],
     "overlay": [stamp("下一支：液冷", "next", "kw", "amber", 48, x=690, y=330, avoid=False)]},
    ["下一支：11/21（六）液冷（已排定）"]))

# ───────────── s10 片尾卡 ─────────────
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene",
               "props": {"endCard": {"next": "液冷", "trail": ["72 顆 GPU", "銅線", "電", "熱"], "at": "s9:kw-8", "comment": "伺服器", "logoAnim": "transparent"}}, "sources": []})

script = {
 "slug": "tech-server", "title": "AI 伺服器：一櫃約 1.4 噸，裡面到底裝了什麼（科技透明圈 第 7 支）", "asOf": "2026/11/20", "styleVersion": 3, "stage": "three",
 "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
 "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
           "_說明": "念稿：docs/prompts/tech-server-旁白.txt；API 整篇 1 次請求"},
 "hud": {"levels": [{"id": "pk", "label": "AI 伺服器機櫃", "en": "AI SERVER RACK", "field": "約 2.2 m", "ruler": "10 cm", "art": "none", "handoff3D": True, "readout": False,
                      "note": "查證截至 2026/11/20", "noteAlways": True}],
         "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例・運作為示意"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
 "cover": {"title": ["一櫃 1.4 噸", "裡面裝什麼"], "sub": "AI 伺服器", "frame": 40},
 "sample": False,
 "scenes": scenes,
}
json.dump(script, open("/home/user/ai-mp4/videos/tech-server/script.json", "w"), ensure_ascii=False, indent=1)
print("ok", len(scenes))
