# 產生 videos/tech-cmp/script.json（改這支再重產）
import json
TX, HXX, WX = 0, 60, 120
HIDE = "s1:start-40"; FAR = "s11:end+400"
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
def scene(i, beat, para, tts, zh, en, kw, cues, props, src, pause=None):
    s = {"id": i, "beat": beat, "para": para, "narration": tts, "tts": tts,
         "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)}, "keywords": kw, "cues": cues, "component": "ThreeScene", "props": props, "sources": src}
    if pause: s["pauseAfter"] = pause
    assert len(zh) == len(en), (i, len(zh), len(en))
    for c in cues: assert c["text"] in tts, (i, c)
    return s
def sec(kind, at, until, y, h, title, tag, t, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag, "t": {k: {"at": v} for k, v in t.items()}}
    d.update(kw); return d
def shot(at, x, y, d, elev, dur=14): return {"at": at, "dur": dur, "x": x, "y": y, "d": d, "elev": elev}

scenes = []
HX = 2.2
def hid(layer, a, b, dur=2): return {"layer": layer, "at": a, "until": b, "opacity": 0, "dur": dur}
def runs_seq(ids, at, until, ramp=6): return [run(i, at, until, ramp) for i in ids]
SL = ["t_slPipe", "t_slDrop", "t_slPad", "t_slGrit"]
# 共用：W 站（晶圓表面近景）各層的可見時段
def w_layers():
    return [hid("w_b2", HIDE, "s8:fast+4"), hid("w_b2", "s8:flat-6", FAR),
            hid("w_b1", "s8:fast+4", FAR),
            hid("w_soft", HIDE, "s6:soft-4"), hid("w_soft", "s8:fast+4", FAR),
            hid("w_pad", HIDE, "s6:start-2"), hid("w_pad", "s9:start-2", FAR), hid("w_slr", HIDE, "s6:start-2"), hid("w_slr", "s9:start-2", FAR),
            hid("w_foc", HIDE, "s2:depth-4"), hid("w_foc", "s3:start-2", "s10:start-2"),
            hid("w_lite", "s3:start-2", "s10:start-2")]
W_SHIFT = w_layers()

# ───────── s1 鉤子（W：凹凸的膜） ─────────
scenes.append(scene("s1", "hook", 1,
    "上一支的膜，長得凹凸不平。下一層曝光，光就會對不準。那要怎麼把它磨平？",
    ["上一支的膜", "長得凹凸不平", "下一層曝光", "光就會對不準", "那要怎麼把它磨平？"],
    ["Last time's film", "grew bumpy and uneven.", "For the next exposure,", "the light won't focus right.", "So how do we grind it flat?"],
    ["凹凸不平", "對不準", "磨平"],
    [cue("prev", "上一支的膜"), cue("bump", "凹凸不平"), cue("expo", "下一層曝光"), cue("mis", "對不準"), cue("ask", "怎麼把它磨平")],
    {"hook": {"kicker": "接上一支｜怎麼磨平？", "title": "膜凹凸不平", "size": 120, "top": 236},
     "zoom": [{"to": "surface", "at": "start-30", "dur": 1}],
     "shot": [shot("start-30", WX, 2.0, 76, 14, 1)],
     "shift": W_SHIFT,
     "run": [run("w_softlit", "start", "expo-4", 6)] + [run(f"w_ray{i}", "expo", "s3:start-2", 6) for i in range(5)] + [run("w_bumpbad", "mis", "s3:start-2", 8)],
     "labels": [lab("w_b1", "凸起", "Bump", "coral", "bump", "expo-6"), lab("w_dip", "凹下去", "Dip", "blue", "bump+8", "expo-6"), lab("w_lens", "曝光的光", "Exposure light", "amber", "expo", "ask-4")],
     "overlay": [sec("cmp-prev", "prev+4", "s2:start-2", 930, 330, "上一支的結果", "示意，非實際比例", {"bump": "bump", "mis": "mis", "ask": "ask"})]},
    ["上一支：薄膜沉積；曝光景深通則"], pause=0.7))

# ───────── s2 為什麼要磨平（W：焦平面與失焦） ─────────
scenes.append(scene("s2", "mechanism", 2,
    "曝光的景深很淺，高低差太大，圖案就會糊掉，所以每長一層，就要磨平。",
    ["曝光的景深很淺", "高低差太大", "圖案就會糊掉", "所以每長一層", "就要磨平"],
    ["Exposure depth of focus is shallow,", "the height gap is too big,", "so patterns blur.", "So after every layer,", "we must grind it flat."],
    ["景深很淺", "高低差", "磨平"],
    [cue("depth", "景深很淺"), cue("diff", "高低差太大"), cue("blur", "圖案就會糊掉"), cue("layer", "每長一層"), cue("flat", "就要磨平")],
    {"zoom": [{"to": "surface", "at": "start-4", "dur": 1}],
     "shot": [shot("start-2", WX, 2.0, 76, 14, 1)],
     "shift": W_SHIFT,
     "run": [run(f"w_ray{i}", "start-2", "s3:start-2", 4) for i in range(5)] + [run("w_bumpbad", "diff", "s3:start-2", 8)],
     "labels": [lab("w_focus", "對焦的那一層", "Focus plane", "amber", "depth", "diff-6"), lab("w_b1", "凸起失焦", "Out of focus", "coral", "blur", "flat-4")],
     "overlay": [sec("cmp-why", "start+2", "s3:start-2", 930, 340, "為什麼要磨平", "示意：曝光景深", {"depth": "depth", "diff": "diff", "blur": "blur", "flat": "flat"})]},
    ["曝光景深通則；科技新報「什麼是 CMP」"], pause=0.7))

# ───────── s3 CMP 是什麼（T：機台全景，研磨頭下壓） ─────────
scenes.append(scene("s3", "mechanism", 3,
    "這叫化學機械研磨，晶圓朝下，壓在旋轉的研磨墊上，一邊磨，一邊淋研磨液。",
    ["這叫化學機械研磨", "晶圓朝下", "壓在旋轉的研磨墊上", "一邊磨", "一邊淋研磨液"],
    ["This is chemical mechanical polishing:", "wafer face down,", "pressed onto a spinning pad,", "grinding as it goes,", "while slurry pours on."],
    ["化學機械研磨", "朝下", "研磨液"],
    [cue("cmp", "化學機械研磨"), cue("wafer", "晶圓朝下"), cue("pad", "旋轉的研磨墊"), cue("slurry", "淋研磨液")],
    {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
     "shot": [shot("start-2", TX + 0.6, -2.0, 92, 36, 1)],
     "shift": [{"layer": "t_head", "at": HIDE, "until": "wafer+2", "dy": 1.7, "dur": 2, "spring": {"tau": 7, "period": 20}},
               {"layer": "t_head", "at": "cmp+20", "until": "wafer-4", "dy": 0.4, "dur": 10}] + W_SHIFT,
     "run": [run("t_ledlit", "start-30", "s10:start", 2), run("t_spinP", "pad", "s10:start", 24), run("t_spinH", "wafer+10", "s10:start", 24), run("t_pres", "wafer+4", "s4:start", 8), run("t_presH", "wafer+4", "s4:start", 8)]
            + [run(i, "slurry", "s4:start", 6) for i in SL],
     "labels": [lab("t_head", "研磨頭", "Carrier head", "amber", "wafer", "pad-4"), lab("t_plat", "研磨盤與研磨墊", "Platen and pad", "blue", "pad", "slurry-6"), lab("t_noz", "研磨液噴嘴", "Slurry nozzle", "coral", "slurry", "s4:start-6")],
     "overlay": [sec("cmp-tool", "start+2", "s4:start-2", 930, 340, "機台的樣子", "示意，非實際比例", {"wafer": "wafer", "pad": "pad", "slurry": "slurry"})]},
    ["專利 US 6796885 等；科技新報「什麼是 CMP」"], pause=0.7))

# ───────── s4 研磨頭爆炸剖析（H） ─────────
EXP_END = "s5:start-4"
scenes.append(scene("s4", "mechanism", 4,
    "研磨頭夾住晶圓往下壓。拆開來看，有轉軸、頭體、橡膠膜、固定環，氣壓把膜往下推。",
    ["研磨頭夾住晶圓往下壓", "拆開來看", "有轉軸、頭體", "橡膠膜、固定環", "氣壓把膜往下推"],
    ["The carrier head clamps the wafer and presses down.", "Take it apart:", "a shaft, a head body,", "a rubber membrane, a retaining ring,", "and air pressure pushes the membrane down."],
    ["研磨頭", "橡膠膜", "氣壓"],
    [cue("clamp", "夾住晶圓"), cue("split", "拆開來看"), cue("sh", "轉軸"), cue("bd", "頭體"), cue("mm", "橡膠膜"), cue("rg", "固定環"), cue("air", "氣壓把膜")],
    {"zoom": [{"to": "head", "at": "start-6", "dur": 1}],
     "shot": [shot("start-2", HXX, -1.2, 60, 22, 1), shot("split-4", HXX, 1.4, 60, 22, 28)],
     "shift": [{"layer": "h_shaft", "at": "split", "until": EXP_END, "dy": 6.6, "dur": 24}, {"layer": "h_body", "at": "split+6", "until": EXP_END, "dy": 5.0, "dur": 24}, {"layer": "h_mem", "at": "split+12", "until": EXP_END, "dy": 3.5, "dur": 24},
               {"layer": "h_rg", "at": "split+18", "until": EXP_END, "dy": 2.2, "dur": 24}, {"layer": "h_wf", "at": "split+24", "until": EXP_END, "dy": 0.9, "dur": 24}],
     "run": [run("h_air", "air-6", EXP_END, 6), run("h_presB", "air", EXP_END, 6), run("h_presM", "air+8", EXP_END, 6)],
     "labels": [lab("h_wf", "晶圓（朝下）", "Wafer, face down", "coral", "clamp", "sh-6"), lab("h_shaft", "轉軸", "Shaft", "blue", "sh", "mm-8"), lab("h_body", "頭體", "Head body", "amber", "bd", "air+20"), lab("h_mem", "橡膠膜", "Membrane", "coral", "mm", "air+30"), lab("h_ring", "固定環", "Retaining ring", "blue", "rg", "air+30")],
     "overlay": [sec("cmp-head", "start+2", "s5:start-2", 930, 340, "研磨頭拆開", "示意，非實際比例", {"wf": "clamp", "sh": "sh", "bd": "bd", "mm": "mm", "rg": "rg", "air": "air"})]},
    ["專利：研磨頭與固定環"], pause=0.7))

# ───────── s5 兩個盤同向不同速（T） ─────────
scenes.append(scene("s5", "mechanism", 5,
    "研磨盤和研磨頭同方向轉，只是轉速不同，晶圓每一點都磨得到。",
    ["研磨盤和研磨頭", "同方向轉", "只是轉速不同", "晶圓每一點都磨得到"],
    ["The platen and the head", "spin the same way,", "only at different speeds,", "so every point on the wafer gets ground."],
    ["同方向轉", "轉速不同", "每一點"],
    [cue("who", "研磨盤和研磨頭"), cue("same", "同方向轉"), cue("diff", "轉速不同"), cue("even", "每一點都磨得到")],
    {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
     "shot": [shot("start-2", TX + 1.2, -2.0, 90, 38, 1)],
     "shift": W_SHIFT,
     "run": [run("t_arcP", "same", "even+30", 6), run("t_arcH", "same+6", "even+30", 6), run("t_flk", "even", "s6:start", 6)],
     "labels": [lab("t_plat", "研磨盤：轉得慢", "Platen: slower", "blue", "who", "diff+10"), lab("t_head", "研磨頭：轉得快", "Head: faster", "amber", "same", "even-4")],
     "overlay": [sec("cmp-spin", "start+2", "s6:start-8", 930, 340, "同向、不同速", "示意：俯視", {"same": "same", "diff": "diff", "even": "even"})]},
    ["專利通則；CMP 設備說明"], pause=0.7))

# ───────── s6 研磨液（W） ─────────
scenes.append(scene("s6", "mechanism", 6,
    "研磨液有細小磨粒，還有讓表面變軟的藥劑，藥劑軟化，磨粒刮掉。",
    ["研磨液有細小磨粒", "還有讓表面變軟的藥劑", "藥劑軟化", "磨粒刮掉"],
    ["Slurry carries tiny abrasive grains,", "and a chemical that softens the surface.", "The chemical softens,", "the grains scrape it off."],
    ["磨粒", "藥劑", "刮掉"],
    [cue("slurry", "研磨液有"), cue("grit", "細小磨粒"), cue("chem", "讓表面變軟的藥劑"), cue("soft", "藥劑軟化"), cue("scrape", "磨粒刮掉")],
    {"zoom": [{"to": "surface", "at": "start-4", "dur": 1}],
     "shot": [shot("start-2", WX, 2.8, 62, 12, 1)],
     "shift": W_SHIFT,
     "run": [run("w_slide", "start", "s9:start-2", 10), run("w_liq", "slurry", "s7:start-2", 6), run("w_grit", "grit", "s7:start-2", 6), run("w_mol", "chem", "s7:start-2", 6), run("w_softlit", "soft", "s7:start-2", 8), run("w_flk", "scrape", "s7:start-2", 6), run("w_flk2", "scrape+8", "s7:start-2", 6)],
     "labels": [lab("w_pad", "研磨墊", "Pad", "blue", "slurry", "chem-6"), lab("w_grit", "磨粒：負責刮", "Abrasive grains", "amber", "grit", "soft-4"), lab("w_b1", "藥劑讓表面變軟", "Chemical softens", "coral", "chem", "scrape+10")],
     "overlay": [sec("cmp-slurry", "start+2", "s7:start-2", 930, 340, "研磨液裡有什麼", "示意，非實際比例", {"grit": "grit", "chem": "chem", "soft": "soft", "scrape": "scrape"})]},
    ["專利：研磨液含磨粒與化學藥劑；科技新報"], pause=0.7))

# ───────── s7 鑽石碟修整（T） ─────────
scenes.append(scene("s7", "mechanism", 7,
    "墊子會被碎屑塞住，所以鑽石碟來回掃過，把墊面刮新。",
    ["墊子會被碎屑塞住", "所以鑽石碟來回掃過", "把墊面刮新"],
    ["The pad clogs with debris,", "so a diamond disc sweeps back and forth", "and scrapes the surface fresh."],
    ["碎屑", "鑽石碟", "刮新"],
    [cue("clog", "碎屑塞住"), cue("disc", "鑽石碟來回掃過"), cue("fresh", "墊面刮新")],
    {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
     "shot": [shot("start-2", TX - 1.0, -2.0, 84, 38, 1)],
     "shift": W_SHIFT,
     "run": [run("t_flk", "start", "disc", 4), run("t_sweep", "disc-6", "s9:start", 14), run("t_flkC", "disc", "s9:start", 6)] + [run(i, "start", "s8:start", 4) for i in SL],
     "labels": [lab("t_pad", "被碎屑塞住的墊面", "Clogged pad", "coral", "clog", "disc-4"), lab("t_cdisc", "鑽石碟（修整器）", "Diamond conditioner", "amber", "disc", "s8:start-6")],
     "overlay": [sec("cmp-cond", "start+2", "s8:start-2", 930, 340, "修整器刮新墊面", "示意，非實際比例", {"clog": "clog", "disc": "disc", "fresh": "fresh"})]},
    ["專利 US 6796885（conditioning arm）；財訊、優分析"], pause=0.7))

# ───────── s8 磨平（W） ─────────
scenes.append(scene("s8", "payoff", 8,
    "凸起處壓力大磨得快，凹處磨得慢，最後就變平了。",
    ["凸起處壓力大磨得快", "凹處磨得慢", "最後就變平了"],
    ["Bumps take more pressure and wear faster,", "dips wear slowly,", "and in the end it is flat."],
    ["壓力大", "磨得快", "變平"],
    [cue("press", "壓力大"), cue("fast", "磨得快"), cue("low", "凹處磨得慢"), cue("flat", "變平")],
    {"zoom": [{"to": "surface", "at": "start-4", "dur": 1}],
     "shot": [shot("start-2", WX, 2.8, 62, 12, 1)],
     "shift": W_SHIFT,
     "run": [run("w_slide", "start-2", "s9:start-2", 6), run("w_liq", "start", "s9:start-2", 4), run("w_grit", "start", "s9:start-2", 4), run("w_pres", "press-4", "flat+20", 6), run("w_flk", "fast", "flat+20", 6), run("w_flk2", "fast+6", "flat+20", 6)],
     "labels": [lab("w_b1", "凸起：壓力大", "Bump: more pressure", "coral", "press", "low-4"), lab("w_dip", "凹處：磨得慢", "Dip: slower", "blue", "low", "flat+4"), lab("w_pad", "研磨墊", "Pad", "amber", "flat", "s9:start-16")],
     "overlay": [sec("cmp-flat", "start+2", "s9:start-2", 930, 340, "凸起先被磨掉", "示意，非實際比例", {"press": "press", "low": "low", "flat": "flat"})]},
    ["CMP 平坦化通則（壓力與移除率成正比）"], pause=0.7))

# ───────── s9 誰在做（T，引線） ─────────
scenes.append(scene("s9", "payoff", 9,
    "機台有應用材料和荏原，研磨液有英特格和富士軟片，研磨墊有杜邦和頌勝，鑽石碟是中砂。",
    ["機台有應用材料和荏原", "研磨液有英特格和富士軟片", "研磨墊有杜邦和頌勝", "鑽石碟是中砂"],
    ["Tools: Applied Materials and Ebara.", "Slurry: Entegris and Fujifilm.", "Pads: DuPont and Soulbrain-Taiwan's Songsheng.", "Diamond discs: Kinik (Taiwan)."],
    ["應用材料", "研磨液", "頌勝", "中砂"],
    [cue("am", "應用材料"), cue("eb", "荏原"), cue("sl", "研磨液有"), cue("ent", "英特格"), cue("fuji", "富士軟片"), cue("pd", "杜邦"), cue("ss", "頌勝"), cue("zs", "中砂"), cue("disc", "鑽石碟是")],
    {"zoom": [{"to": "tool", "at": "start-4", "dur": 30}],
     "shot": [shot("start-2", TX + 0.6, -2.0, 92, 36, 1)],
     "shift": W_SHIFT,
     "run": [run("t_sweep", "start-4", "s10:start", 8)] + [run(i, "start", "s10:start", 4) for i in SL],
     "labels": [lab("t_body", "機台：應用材料、荏原", "Tools", "amber", "am", "sl-6"), lab("t_tank", "研磨液：英特格、富士軟片", "Slurry", "coral", "sl", "pd-6"), lab("t_pad", "研磨墊：杜邦", "Pad", "blue", "pd", "ss-4"), lab("t_plat", "研磨墊：頌勝（台灣）", "Pad (Taiwan)", "blue", "ss", "zs-6"), lab("t_cdisc", "鑽石碟：中砂（台灣）", "Diamond disc (Taiwan)", "amber", "zs", "s10:start-6")],
     "overlay": [sec("cmp-co", "start+2", "s10:start-2", 965, 300, "誰在做", "媒體報導", {"mc": "am", "sl": "ent", "pd": "pd", "ss": "ss", "zs": "zs"})]},
    ["市場研究頁；財訊；工商時報；優分析"], pause=0.7))

# ───────── s10 結尾（W：磨平後對焦） ─────────
scenes.append(scene("s10", "cta", 10,
    "所以每長一層，就磨平一次，下一層才對得準。但磨完真的平嗎？下一支，看量測檢測。留言研磨，看完整解說。",
    ["所以每長一層", "就磨平一次", "下一層才對得準", "但磨完真的平嗎？", "下一支", "看量測檢測", "留言研磨", "看完整解說"],
    ["So after every layer,", "we grind it flat once,", "so the next layer lines up.", "But is it really flat?", "Next:", "metrology and inspection.", "Comment \"研磨\"", "for the full notes."],
    ["磨平", "對得準", "量測檢測", "研磨"],
    [cue("so", "所以每長一層"), cue("once", "就磨平一次"), cue("fit", "下一層才對得準"), cue("ask", "真的平嗎"), cue("next", "下一支"), cue("mea", "量測檢測"), cue("kw", "留言研磨"), cue("full", "看完整解說")],
    {"zoom": [{"to": "surface", "at": "start-4", "dur": 1}],
     "shot": [shot("start-2", WX, 2.0, 76, 14, 1)],
     "shift": W_SHIFT,
     "run": [run(f"w_ray{i}", "fit-6", FAR, 6) for i in range(5)],
     "labels": [lab("w_focus", "全部對焦", "All in focus", "amber", "fit", "next-6")],
     "overlay": [sec("cmp-step", "start+2", "kw-14", 940, 250, "接下來", "下一支：量測檢測", {"dep": "so", "cmp": "once", "next": "next"}), stamp("留言「研磨」", "kw", "kw+60", "blue", 36, x=780, y=336, avoid=False)]},
    ["製程通則；下一支：量測檢測"]))
scenes.append({"id": "s11", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene",
               "props": {"endCard": {"next": "量測檢測", "trail": ["量測", "檢測", "奈米級"], "at": "s10:kw-8", "comment": "研磨", "logoAnim": "transparent"}}, "sources": []})

NOTE = "查證截至 2026/11/20"
script = {
 "slug": "tech-cmp", "title": "化學機械研磨：每一層都要磨平（科技透明圈）", "asOf": "2026/11/20", "styleVersion": 3, "stage": "three",
 "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
 "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
           "_說明": "念稿：docs/prompts/tech-cmp-旁白.txt；整篇 1 次請求"},
 "hud": {"levels": [{"id": "tool", "label": "CMP 機台", "en": "CMP TOOL", "field": "3 m", "ruler": "1 m", "art": "none", "handoff3D": True, "readout": True, "note": NOTE, "noteAlways": True},
                    {"id": "head", "label": "研磨頭", "en": "CARRIER HEAD", "field": "30 cm", "ruler": "10 cm", "art": "none", "readout": True, "note": NOTE, "noteAlways": True},
                    {"id": "surface", "label": "晶圓表面", "en": "WAFER SURFACE", "field": "300 nm", "ruler": "100 nm", "art": "none", "readout": True, "note": NOTE, "noteAlways": True}],
         "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
 "cover": {"title": ["每一層", "都要磨平"], "sub": "化學機械研磨", "frame": 40},
 "sample": False, "scenes": scenes,
}
json.dump(script, open("/home/user/ai-mp4/videos/tech-cmp/script.json", "w"), ensure_ascii=False, indent=1)
print("ok", len(scenes), "字數", sum(len(s["tts"]) for s in scenes if "tts" in s))
