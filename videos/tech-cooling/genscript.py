# 產生 videos/tech-cooling/script.json（改這支再重產）
import json
HX, PX, CXX, KX, RX, QX = 0, 60, 120, 180, 240, 300
CDX = RX + 9.8; DCX = RX + 21.0
HIDE = "s1:start-40"; FAR = "s10:end+400"
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

# ───────── s1 鉤子（H 風冷對照）─────────
scenes.append(scene("s1", "hook", 1,
    "一整櫃 AI 伺服器，要吃一百二十千瓦的電。電最後都變成熱，風扇吹得走嗎？",
    ["一整櫃 AI 伺服器", "要吃一百二十千瓦的電", "電最後都變成熱", "風扇吹得走嗎？"],
    ["One rack of AI servers", "draws 120 kilowatts.", "All that power ends up as heat.", "Can fans blow it away?"],
    ["一百二十千瓦", "變成熱", "風扇"],
    [cue("rack", "一整櫃"), cue("kw", "一百二十千瓦"), cue("heat", "變成熱"), cue("fan", "風扇")],
    {"hook": {"kicker": "廠商公布｜風扇吹得走嗎？", "title": "1 櫃＝120 kW", "size": 120, "top": 236},
     "zoom": [{"to": "pk", "at": "start-30", "dur": 1}],
     "shot": [shot("start-30", HX, 4.0, 36, 16, 1)],
     "shift": [hide_until("cloud", off("heat", 4), dy=-0.4, dur=14)],
     "run": [run("h_fans", "start-30", "s2:start-2", 8), run("h_leds", "kw", "s2:start-2", 6), run("h_air0", "fan", "s2:start-2", 6), run("h_air1", "fan", "s2:start-2", 6),
             run("h_hot", "heat", "s2:start-2", 8), run("h_hotb", "heat+6", "s2:start-2", 8)],
     "labels": [lab("rk", "AI 伺服器機櫃", "One AI rack", "blue", "rack", "kw-6"), lab("rk", "風扇牆（風冷）", "Fan wall (air cooling)", "amber", "fan", "s1:end-8")],
     "overlay": [stamp("廠商公布", "kw", "s2:start-2", "blue", 44, x=210, y=330)]},
    ["NVIDIA GB200 使用手冊；Vertiv 2024/11"], pause=0.7))

# ───────── s2 水比空氣強（P）─────────
scenes.append(scene("s2", "mechanism", 2,
    "吹不走。同樣體積，水能帶走的熱，大約是空氣的三千四百多倍。所以改讓水來搬熱。",
    ["吹不走", "同樣體積", "水能帶走的熱", "大約是空氣的三千四百多倍", "所以改讓水來搬熱"],
    ["It can't.", "For the same volume,", "water carries away", "about 3,400 times more heat than air.", "So let water carry the heat."],
    ["吹不走", "三千四百多倍", "讓水來搬熱"],
    [cue("no", "吹不走"), cue("same", "同樣體積"), cue("carry", "水能帶走"), cue("times", "三千四百多倍"), cue("water", "讓水來搬熱")],
    {"zoom": [{"to": "pk", "at": "start-18", "dur": 1}],
     "shot": [shot("start-4", PX, -1.5, 34, 16, 1)],
     "shift": [gone("cloud", "start-2", 1), fall("cube_a0", off("same", 10), press=None, dy=4.0, bounce=0.1)] +
              [fall(f"cube_b{j}", off("carry", 4 + 12 * j), dy=4.0, bounce=0.06) for j in range(3)],
     "run": [run("p_air", off("same", 22), "s3:start-2", 8), run("p_wat", "water", "s3:start-2", 8)],
     "labels": [lab("cup_a", "空氣", "Air", "coral", "no", "s3:start-2"), lab("cup_b", "水", "Water", "blue", "same", "s3:start-2")],
     "overlay": [sec("cool-cups", "same-6", "s3:start-16", 920, 330, "同樣大小的杯子", "示意：同體積、升高 1 度", {"same": "same", "carry": "carry", "times": "times", "water": "water"})]},
    ["Upsite；Data Center Frontier；Introl（體積熱容）"], pause=0.7))

# ───────── s3 換冷板（C）─────────
scenes.append(scene("s3", "mechanism", 3,
    "晶片上面不再裝一片片的散熱片，改貼一塊金屬做的冷板。",
    ["晶片上面", "不再裝一片片的散熱片", "改貼一塊金屬做的冷板"],
    ["On top of the chip,", "no more rows of heat-sink fins,", "a metal cold plate is mounted instead."],
    ["散熱片", "冷板"],
    [cue("chip", "晶片上面"), cue("fin", "不再裝"), cue("plate", "改貼")],
    {"shot": [shot("start-2", CXX, 1.2, 24, 30, 1)],
     "shift": [hide_until("paste", off("plate", -14), dy=0.3), fall("cp", "plate", press=None, dy=3.6, bounce=0.1), hide_until("hose", off("plate", 12), dy=0.5, dur=10),
               {"layer": "hs", "at": "fin", "until": FAR, "dy": 4.2, "dx": -3.0, "opacity": 0, "dur": 22}],
     "run": [run("c_die", "chip", off("plate", 30), 6), run("c_win", off("plate", 20), "s5:start-2", 8), run("c_wout", off("plate", 26), "s5:start-2", 8)],
     "labels": [lab("c_gpu", "GPU 晶片", "GPU chip", "amber", "chip", "fin"), lab("c_hs", "散熱片（風冷）", "Heat sink (air)", "coral", "fin", off("plate", -6))]},
    ["HPE；Data Center Frontier（direct-to-chip）"], pause=0.7))

# ───────── s4 冷板內部（K，運作動畫 A）─────────
scenes.append(scene("s4", "mechanism", 4,
    "冷板裡面有很細的水道。冷水從一端進去，吸飽了熱，再從另一端流出來。",
    ["冷板裡面有很細的水道", "冷水從一端進去", "吸飽了熱", "再從另一端流出來"],
    ["Inside the plate are very fine channels.", "Cool water goes in at one end,", "soaks up the heat,", "and leaves at the other end."],
    ["很細的水道", "吸飽了熱", "流出來"],
    [cue("chan", "很細的水道"), cue("inn", "進去"), cue("hot", "吸飽了熱"), cue("out", "流出來")],
    {"shot": [shot("start-2", KX, -2.0, 34, 46, 1), shot("inn", KX, -1.6, 30, 48, 30)],
     "run": [run("k_diehot", "start-10", "s5:start-2", 6), run("k_heat", "chan+10", "s5:start-2", 6), run("k_basehot", off("hot", -16), "s5:start-2", 8),
             run("k_fin", off("inn", -6), "s5:start-2", 6), run("k_f1", "inn", "s5:start-2", 6), run("k_f2", off("hot", -8), "s5:start-2", 6), run("k_f3", off("out", -10), "s5:start-2", 6), run("k_fout", off("out", -2), "s5:start-2", 6)],
     "labels": [lab("k_die", "晶片（發熱）", "Chip (heat source)", "amber", "start", "inn"), lab("k_wall", "微通道銅牆", "Micro-channel walls", "blue", "chan", "inn+20")],
     "overlay": [sec("cool-plate", "start+2", "s5:start-16", 930, 335, "冷板剖開", "示意，非實際比例・水流與溫度為示意", {"chan": "chan", "inn": "inn", "hot": "hot", "out": "out"})]},
    ["Data Center Frontier；Fibermall；運作示意"], pause=0.7))

# ───────── s5 分歧管與快接頭（R → Q，運作動畫 B）─────────
scenes.append(scene("s5", "mechanism", 5,
    "熱水去哪？每台伺服器的水管，先接到機櫃背後的總水管。插拔用快接頭，拔掉也不會漏水。",
    ["熱水去哪？", "每台伺服器的水管", "先接到機櫃背後的總水管", "插拔用快接頭", "拔掉也不會漏水"],
    ["Where does the hot water go?", "Each server's hose", "first joins the main pipe behind the rack.", "Plug and unplug with quick disconnects,", "and pulling one out doesn't leak."],
    ["總水管", "快接頭", "不會漏水"],
    [cue("where", "熱水去哪"), cue("pipe", "水管"), cue("mani", "總水管"), cue("qd", "快接頭"), cue("pull", "拔掉"), cue("dry", "不會漏水")],
    {"shot": [shot("start-2", RX, 2.2, 40, 8, 1), shot("qd-10", QX, 1.5, 20, 12, 18)],
     "shift": [
        # 快接頭拔開：公端整組往右抽、兩個閥芯被彈簧推回關住、中段水消失；念完再插回
        {"layer": l, "at": "pull", "until": off("dry", 10), "dx": 3.4, "dur": 18} for l in ("qm", "qm_pop", "qm_w", "qm_hose", "qm_sp0", "qm_sp1", "qm_sp2", "qm_sp3", "qm_sp4")] + [
        {"layer": "qf_pop", "at": "pull", "until": off("dry", 10), "dx": 1.25, "dur": 14},
        {"layer": "qm_pop", "at": "pull", "until": off("dry", 10), "dx": -1.15, "dur": 14}] + [
        {"layer": f"qf_sp{i}", "at": "pull", "until": off("dry", 10), "dx": 1.25 * (i + 1) / 5, "dur": 14} for i in range(5)] + [
        {"layer": f"qm_sp{i}", "at": "pull", "until": off("dry", 10), "dx": -1.15 * (5 - i) / 5, "dur": 14} for i in range(5)] + [
        {"layer": "q_mid", "at": "pull", "until": off("dry", 10), "opacity": 0, "dur": 6}],
     "run": [run("r_f_rr", "where", "s7:end", 6), run("r_f_ru", off("where", 8), "s7:end", 6), run("r_f_rt", off("where", 30), "s7:end", 6), run("r_f_br", "pipe", "s7:end", 6),
             run("r_f_bu", off("pipe", 8), "s7:end", 6), run("r_f_bb", "mani", "s7:end", 6), run("q_flowc", off("qd", 8), "pull", 4)],
     "labels": [lab("r_man", "總水管（分歧管）", "Manifold", "blue", "mani", "qd-12"), lab("q_pop", "閥芯", "Valve", "amber", off("qd", 14), "dry+4"), lab("q_spring", "彈簧", "Spring", "blue", "pull", "dry+4"), lab("q_body", "富世達 快接頭", "Quick disconnects", "amber", off("qd", 4), "pull-6")],
     "overlay": [sec("cool-loop", "start+2", "s6:start-2", 930, 310, "一條迴路", "示意", {"plate": "start", "mani": "mani", "cdu": "s6:start-8", "dry": "s6:start-6", "loop": "s6:start-4"}),
                 stamp("拔開：0 滴", "pull+8", "dry+4", "blue", 44, x=800, y=340)]},
    ["Eaton、Boyd 產品頁；經濟日報（快接頭）"], pause=0.7))

# ───────── s6 CDU 換熱（R，運作動畫 C）─────────
scenes.append(scene("s6", "mechanism", 6,
    "再送到一台換熱的機器，把熱交給機房的冷卻水，降溫之後送回來，一直循環。",
    ["再送到一台換熱的機器", "把熱交給機房的冷卻水", "降溫之後送回來", "一直循環"],
    ["Then it goes to a heat-exchange machine,", "which hands the heat to the building's cooling water,", "and the cooled water returns,", "round and round."],
    ["換熱的機器", "冷卻水", "循環"],
    [cue("cdu", "換熱的機器"), cue("give", "把熱交給"), cue("cool", "降溫"), cue("loop", "一直循環")],
    {"shot": [shot("start-2", RX + 5.5, 2.4, 36, 10, 1), shot("cdu-6", CDX, 2.4, 30, 10, 26), shot("cool", RX + 15.0, 0.4, 42, 12, 40), shot("loop", RX + 11.0, 0.0, 48, 12, 40)],
     "run": [run("u_impl", off("cdu", -10), "s7:end", 8), run("u_h1", "give", "s7:end", 6), run("u_h2", off("give", 4), "s7:end", 6), run("u_h3", off("give", 8), "s7:end", 6),
             run("u_c1", off("give", 2), "s7:end", 6), run("u_c2", off("give", 6), "s7:end", 6), run("u_c3", off("give", 10), "s7:end", 6), run("u_hot", "cdu", "s7:end", 6),
             run("u_out", "cool", "s7:end", 6), run("q_f1", "give", "s7:end", 6), run("q_f2", off("give", 14), "s7:end", 6), run("q_f3", off("cool", 6), "s7:end", 6),
             run("d_fans", off("give", 10), "s7:end", 8), run("d_air", "cool", "s7:end", 6)],
     "labels": [lab("u_hx", "板式熱交換器", "Plate heat exchanger", "amber", "cdu", "give+30"), lab("u_pump", "幫浦", "Pump", "blue", off("cdu", 10), "give+30"), lab("d_dc", "乾冷器（機房外）", "Dry cooler", "amber", "cool", "loop-34")],
     "overlay": [sec("cool-hx", "start+2", "loop-6", 930, 310, "熱交換器剖面", "示意：兩邊水不混，隔著金屬片傳熱", {"cdu": "cdu", "give": "give", "cool": "cool"}),
                 sec("cool-loop", "loop-6", "s7:start-2", 930, 310, "一條迴路", "示意", {"plate": "start", "mani": "start", "cdu": "start", "dry": "start", "loop": "start"})]},
    ["QCT；Eaton；HPE；運作示意"], pause=0.7))

# ───────── s7 台灣誰在做（引線指到 3D 模型對應部位）─────────
scenes.append(scene("s7", "payoff", 7,
    "台灣的奇鋐、雙鴻做冷板，台達電做換熱的機器，高力做熱交換的零件。",
    ["台灣的奇鋐、雙鴻做冷板", "台達電做換熱的機器", "高力做熱交換的零件"],
    ["In Taiwan, AVC and Auras make cold plates,", "Delta makes the heat-exchange machine,", "and Kaori makes the heat-exchanger parts."],
    ["奇鋐", "台達電", "高力"],
    [cue("qh", "奇鋐"), cue("dt", "台達電"), cue("gl", "高力")],
    {"shot": [shot("start-2", KX, -2.0, 34, 46, 1), shot("dt-14", CDX, 2.4, 30, 10, 26), shot("gl-10", CDX, 2.4, 30, 10, 20)],
     "labels": [lab("k_lid", "奇鋐、雙鴻：冷板", "Cold plates", "amber", "qh", "dt-10"), lab("u_cdu", "台達電：CDU", "CDU", "amber", "dt", "gl-8"), lab("u_hx", "高力：熱交換器", "Heat exchanger", "amber", "gl", "s8:start-10")]},
    ["媒體報導：鉅亨、優分析"]))

# ───────── s8 沒全包（C）─────────
scenes.append(scene("s8", "twist", 8,
    "不過冷板不是全包，還有一到兩成的熱，要靠風扇帶走。",
    ["不過冷板不是全包", "還有一到兩成的熱", "要靠風扇帶走"],
    ["But the cold plate doesn't cover everything,", "one to two tenths of the heat", "still needs fans to carry it off."],
    ["不是全包", "一到兩成"],
    [cue("notall", "不是全包"), cue("pct", "一到兩成"), cue("fan", "風扇")],
    {"shot": [shot("start-2", CXX + 3.4, -0.3, 22, 32, 1)],
     "run": [run("c_vrmhot", "notall", "s9:start-2", 6), run("c_hotair", "pct", "s9:start-2", 6), run("c_fan", off("pct", 8), "s9:start-2", 8), run("c_air", "fan", "s9:start-2", 6),
             run("c_win", "start-4", "s9:start-2", 6), run("c_wout", "start-4", "s9:start-2", 6)],
     "labels": [],
     "overlay": [sec("cool-split", "start+2", "s9:start-16", 940, 300, "熱怎麼帶走", "業界說法・示意", {"notall": "notall", "pct": "pct", "fan": "fan"})]},
    ["Data Center Frontier（業界說法）"], pause=0.7))

# ───────── s9 結尾（H）─────────
scenes.append(scene("s9", "cta", 9,
    "機櫃還會更耗電，電線要加粗，還是電壓拉高？下一支，來看八百伏特。想要完整解說，留言液冷。",
    ["機櫃還會更耗電", "電線要加粗", "還是電壓拉高？", "下一支", "來看八百伏特", "想要完整解說", "留言液冷"],
    ["Racks will draw even more power.", "Thicker wires,", "or higher voltage?", "Next:", "800-volt power.", "For the full notes,", "comment \"液冷\"."],
    ["更耗電", "電壓拉高", "液冷"],
    [cue("more", "更耗電"), cue("wire", "電線要加粗"), cue("volt", "電壓拉高"), cue("next", "下一支"), cue("v8", "八百伏特"), cue("full", "想要完整解說"), cue("kw", "留言液冷")],
    {"shot": [shot("start-2", HX, 3.4, 36, 16, 1)],
     "shift": [hide_until("bus", off("wire", -4), dy=0, dur=10)],
     "run": [run("h_bus", "wire", "s10:start", 6)],
     "labels": [lab("rk", "一櫃還會更耗電", "Even more power", "amber", "more", "wire-4")],
     "overlay": [sec("cool-next", "start+2", "kw-14", 930, 300, "耗電還在往上", "示意", {"more": "more", "wire": "wire", "volt": "volt", "next": "next", "v8": "v8"}), stamp("完整解說在留言", "full", "kw-14", "blue", 36, x=780, y=336, avoid=False)]},
    ["科技新報；下一支 11/22 八百伏特"]))

# ───────── s10 片尾卡 ─────────
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene",
               "props": {"endCard": {"next": "八百伏特", "trail": ["風冷不夠", "冷板", "快接頭", "CDU"], "at": "s9:kw-8", "comment": "液冷", "logoAnim": "transparent"}}, "sources": []})

script = {
 "slug": "tech-cooling", "title": "液冷：一櫃 AI 伺服器吃一百二十千瓦，水怎麼把熱搬走（科技透明圈 第 8 支）", "asOf": "2026/11/21", "styleVersion": 3, "stage": "three",
 "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
 "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
           "_說明": "念稿：docs/prompts/tech-cooling-旁白.txt；整篇 1 次請求"},
 "hud": {"levels": [{"id": "pk", "label": "液冷迴路", "en": "LIQUID COOLING", "field": "示意", "ruler": "示意", "art": "none", "handoff3D": True, "readout": False,
                      "note": "查證截至 2026/11/21", "noteAlways": True}],
         "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例・水流與溫度為示意"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
 "cover": {"title": ["風扇吹不走", "改讓水搬熱"], "sub": "液冷", "frame": 40},
 "sample": False, "scenes": scenes,
}
json.dump(script, open("/home/user/ai-mp4/videos/tech-cooling/script.json", "w"), ensure_ascii=False, indent=1)
print("ok", len(scenes))
