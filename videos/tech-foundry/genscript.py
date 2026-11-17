# 產生 videos/tech-foundry/script.json（改這支再重產）
import json
FX, CX, TX, WX, DX = 0, 60, 120, 180, 240
FAR = "s9:end+400"
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
def sh(layer, at, dur=20, until=FAR, **kw):
    d = {"layer": layer, "at": at, "until": until, "dur": dur}; d.update(kw); return d
scenes = []

# ───────── s1 鉤子（F 廠區）─────────
scenes.append(scene("s1", "hook", 1,
    "晶圓代工，超過七成二的營收，都是台積電的。蘋果、輝達為什麼不自己蓋廠？",
    ["晶圓代工", "超過七成二的營收", "都是台積電的", "蘋果、輝達", "為什麼不自己蓋廠？"],
    ["Global wafer foundry:", "over 72% of revenue", "belongs to TSMC.", "Apple, NVIDIA,", "why don't they build their own fabs?"],
    ["七成二", "台積電", "不自己蓋廠"],
    [cue("wc", "晶圓代工"), cue("pct", "七成二"), cue("tsmc", "台積電"), cue("ask", "不自己蓋廠")],
    {"hook": {"kicker": "TrendForce 2026 年第二季｜誰在代工？", "title": "台積電 72.5%", "size": 96, "top": 236},
     "zoom": [{"to": "fab", "at": "start-30", "dur": 1}],
     "shot": [shot("start-30", FX, -2.6, 72, 36, 1)],
     "shift": [sh("f_van", "start-20", dur=70, dx=9.0)],
     "run": [run("f_steam", "start-30", "s2:start-2", 8), run("f_hotA", "tsmc", "s2:start-2", 8)],
     "labels": [],
     "overlay": [sec("fdy-share", "start+20", "s2:start-12", 930, 320, "全球晶圓代工營收占比", "TrendForce・2026 年第二季", {"wc": "wc", "pct": "pct", "tsmc": "tsmc", "ask": "ask"})]},
    ["TrendForce 2026/9/9 新聞稿（2Q26）"], pause=0.7))

# ───────── s2 為什麼不自己蓋（F）─────────
scenes.append(scene("s2", "mechanism", 2,
    "蓋一座先進晶圓廠，要一百億美元以上，訂單不夠大就攤不平，所以設計公司只管設計，製造交給代工廠。",
    ["蓋一座先進晶圓廠", "要一百億美元以上", "訂單不夠大就攤不平", "所以設計公司只管設計", "製造交給代工廠"],
    ["Building one leading-edge fab", "costs over $10 billion,", "too much without huge orders.", "So design firms just design,", "and leave manufacturing to foundries."],
    ["一百億美元", "攤不平", "只管設計", "代工廠"],
    [cue("build", "蓋一座"), cue("cost", "一百億美元"), cue("nofit", "攤不平"), cue("design", "只管設計"), cue("fab", "交給代工廠")],
    {"zoom": [{"to": "fab", "at": "start-6", "dur": 1}],
     "shot": [shot("start-2", FX - 0.6, -2.6, 64, 36, 16)],
     "run": [run("f_hotA", "build", "s3:start-2", 8), run("f_steam", "start-4", "s3:start-2", 8)],
     "labels": [lab("bA", "一座先進晶圓廠", "One leading-edge fab", "blue", "build", "nofit-6")],
     "overlay": [sec("fdy-why", "start+2", "s3:start-12", 930, 320, "設計 與 製造 分開", "媒體報導・數位時代、經理人", {"build": "build", "cost": "cost", "nofit": "nofit", "design": "design", "fab": "fab"})]},
    ["數位時代、經理人報導"], pause=0.7))

# ───────── s3 無塵室氣流（C）─────────
scenes.append(scene("s3", "mechanism", 3,
    "走進代工廠，無塵室的空氣一直往下吹，把灰塵帶走。",
    ["走進代工廠", "無塵室的空氣一直往下吹", "把灰塵帶走"],
    ["Step inside a foundry:", "cleanroom air blows straight down", "and carries the dust away."],
    ["無塵室", "往下吹", "灰塵"],
    [cue("enter", "走進"), cue("air", "往下吹"), cue("dust", "灰塵")],
    {"zoom": [{"to": "room", "at": "start-6", "dur": 40}], "shot": [shot("start-2", CX, 2.0, 46, 12, 18)],
     "run": [run("a_dn1", off("air", -8), "s4:start-2", 8), run("a_dn2", off("air", -4), "s4:start-2", 8), run("a_dust", "dust", "s4:start-2", 8),
             run("a_ul", off("air", 10), "s4:start-2", 8), run("a_ur", off("air", 10), "s4:start-2", 8), run("a_ucl", off("air", 14), "s4:start-2", 8), run("a_ucr", off("air", 14), "s4:start-2", 8),
             run("a_upl", off("air", 24), "s4:start-2", 8), run("a_upr", off("air", 24), "s4:start-2", 8)],
     "labels": [lab("c_ffu", "天花板的風扇濾網", "Fan filter units", "blue", "enter", "air+20"), lab("c_grate", "格柵地板", "Perforated floor", "amber", "dust", "s4:start-6")],
     "overlay": [sec("fdy-air", "start+2", "s4:start-14", 930, 320, "無塵室剖面", "示意・氣流為示意", {"enter": "enter", "air": "air", "dust": "dust"})]},
    ["SemiconductorX；MKS 無塵室氣流介紹（FFU 垂直氣流）"], pause=0.7))

# ───────── s4 傳送盒 → 軌道 → 機台 → 手臂（C → T）─────────
OHT = ["ov", "ob0", "ob1", "ob2", "ob3", "ob4", "og", "of"]
dyb = {"ob0": 0.0, "ob1": -.55, "ob2": -1.1, "ob3": -1.65, "ob4": -2.2, "og": -2.2, "of": -2.2}
sh4 = [sh(l, off("rail", -6), 64, dx=9.0) for l in OHT]
sh4 += [sh(l, off("tool", -4), 30, dy=v) for l, v in dyb.items() if v]
Z = -2.2; ARM = "arm"
def ext(at, sign=1, wafer=False, dur=16):
    z = Z * sign
    r = [sh("rp1", at, dur, dz=z / 3), sh("rp2", at, dur, dz=2 * z / 3), sh("rbl", at, dur, dz=z)]
    if wafer: r.append(sh("tw", at, dur, dz=z))
    return r
armshift = (ext(off(ARM, 0)) + [sh("rbl", off(ARM, 20), 5, dy=.07), sh("tw", off(ARM, 20), 5, dy=.07)] + ext(off(ARM, 26), -1, True) +
            [sh(l, off(ARM, 46), 26, dx=7.2) for l in ("rb", "rp1", "rp2", "rbl", "tw")] + ext(off(ARM, 76), 1, True) +
            [sh("rbl", off(ARM, 94), 4, dy=-.07), sh("tw", off(ARM, 94), 4, dy=-.07)] + ext(off(ARM, 100), -1, False))
scenes.append(scene("s4", "mechanism", 4,
    "晶圓裝在傳送盒裡，沿著天花板的軌道，送進機台。機械手臂再把晶圓一片片放進去。",
    ["晶圓裝在傳送盒裡", "沿著天花板的軌道", "送進機台", "機械手臂再把晶圓", "一片片放進去"],
    ["Wafers ride in a carrier pod,", "along the ceiling rail,", "into the tool.", "Then a robot arm", "places them in one by one."],
    ["傳送盒", "軌道", "機械手臂"],
    [cue("box", "傳送盒"), cue("rail", "軌道"), cue("tool", "送進機台"), cue("arm", "機械手臂"), cue("put", "放進去")],
    {"zoom": [{"to": "room", "at": "start-6", "dur": 1}, {"to": "tool", "at": off("arm", -20), "dur": 40}],
     "shot": [shot("start-2", CX - 4.0, 2.0, 42, 12, 18), shot(off("rail", 4), CX - 2.0, 2.0, 42, 12, 60), shot(off("tool", 30), TX, -.8, 26, 34, 30)],
     "shift": sh4 + armshift,
     "run": [run("o_foupHi", "box", off("rail", -6), 6), run("t_gas", off(ARM, 104), "s5:start-2", 6), run("t_plasma", off(ARM, 110), "s5:start-2", 8)],
     "labels": [lab("o_foup", "晶圓傳送盒（FOUP）", "Wafer carrier (FOUP)", "amber", "box", off("rail", 20)), lab("o_rail", "天花板軌道", "Overhead rail", "blue", "rail", "tool"),
                lab("t_wafer", "25 片晶圓為一盒", "25 wafers per pod", "amber", off("tool", 40), off(ARM, -4)), lab("t_arm", "機械手臂", "Robot arm", "blue", off(ARM, 18), off(ARM, 70)), lab("t_ch", "反應腔", "Process chamber", "amber", "put", "s5:start-6")],
     "overlay": [sec("fdy-path", "start+2", "s5:start-12", 930, 320, "晶圓怎麼進機台", "示意", {"box": "box", "rail": "rail", "tool": "tool", "arm": "arm", "put": "put"})]},
    ["SEMI FOUP 標準；Entegris、Muratec"], pause=1.2))

# ───────── s5 晶圓 → 晶粒爆炸剖析（W → D）─────────
DL = ["d_tr", "d_m1", "d_m2", "d_m3", "d_m4", "d_top"]
EXK = {"d_tr": 1.3, "d_m1": 2.6, "d_m2": 3.8, "d_m3": 5.0, "d_m4": 6.2, "d_top": 7.6}
sh5 = [sh("wf_pick", "dies+10", 26, dy=1.2)]
sh5 += [sh(l, "open+8", 26, until="metal+40", dy=v) for l, v in EXK.items()]
scenes.append(scene("s5", "mechanism", 5,
    "放大晶圓，上面排滿晶粒。拆開一顆，底下是電晶體，上面疊著一層層金屬線。",
    ["放大晶圓", "上面排滿晶粒", "拆開一顆", "底下是電晶體", "上面疊著一層層金屬線"],
    ["Zoom in on the wafer:", "it's covered in dies.", "Take one apart:", "transistors at the bottom,", "layers of metal wiring on top."],
    ["晶粒", "電晶體", "金屬線"],
    [cue("zw", "放大晶圓"), cue("dies", "排滿晶粒"), cue("open", "拆開一顆"), cue("tr", "電晶體"), cue("metal", "一層層金屬線")],
    {"zoom": [{"to": "wafer", "at": "start-6", "dur": 36}, {"to": "die", "at": off("open", -16), "dur": 36}],
     "shot": [shot("start-2", WX, -2.2, 24, 38, 18), shot(off("open", -16), DX, 0.5, 52, 32, 34)],
     "shift": sh5,
     "run": [run("d_gateOn", "tr", "s6:start-2", 6), run("d_sig", off("metal", 44), "s6:start-2", 6)],
     "labels": [lab("w_die", "一顆晶粒", "One die", "amber", "dies", off("open", -18)), lab("d_tr", "電晶體", "Transistors", "amber", "tr", "metal+40"), lab("d_m1", "金屬線（多層）", "Metal wiring layers", "blue", "metal", "metal+40"),
                lab("d_top", "接點", "Pads", "blue", "metal", "metal+40"), lab("d_si", "矽基板", "Silicon", "coral", "open+14", "metal+40")],
     "overlay": [sec("fdy-die", "start+2", "s6:start-12", 930, 320, "一顆晶粒的剖面", "示意，非實際比例", {"zw": "zw", "dies": "dies", "open": "open", "tr": "tr", "metal": "metal", "sig": "metal+44"})]},
    ["台積電、Intel 技術文件"], pause=1.2))

# ───────── s6 先進 vs 成熟（F）─────────
scenes.append(scene("s6", "mechanism", 6,
    "做出這些的方法叫製程，分兩邊。七奈米以下是先進，做手機和 AI 晶片。二十八奈米以上是成熟，做車用和電源管理晶片。",
    ["做出這些的方法叫製程", "分兩邊", "七奈米以下是先進", "做手機和 AI 晶片", "二十八奈米以上是成熟", "做車用和電源管理晶片"],
    ["The method is called a process node,", "and there are two sides.", "Below 7 nm is advanced:", "phone and AI chips.", "28 nm and above is mature:", "car and power-management chips."],
    ["製程", "先進", "成熟"],
    [cue("two", "分兩邊"), cue("adv", "先進"), cue("phone", "手機"), cue("mat", "成熟"), cue("car", "車用")],
    {"zoom": [{"to": "fab", "at": "start-6", "dur": 40}],
     "shot": [shot("start-2", FX, -2.6, 72, 36, 30)],
     "run": [run("f_hotA", "adv", off("mat", -10), 8), run("f_hotB", "mat", "s7:start-2", 8), run("f_hotC", off("mat", 6), "s7:start-2", 8)],
     "labels": [lab("bA_f", "先進製程廠區", "Leading-edge fabs", "blue", "adv", off("mat", -8)), lab("bB_f", "成熟製程廠區", "Mature-node fabs", "amber", "mat", "s7:start-6")],
     "overlay": [sec("fdy-nodes", "start+2", "s7:start-12", 930, 320, "先進 vs 成熟", "各家分類略有不同・台積電以 7 奈米為界", {"two": "two", "adv": "adv", "phone": "phone", "mat": "mat", "car": "car"})]},
    ["TSMC 6-K 2026Q3；technews（成熟製程）"], pause=0.7))

# ───────── s7 各家做什麼（引線指到廠區）─────────
scenes.append(scene("s7", "payoff", 7,
    "所以各家分工不同。台積電從先進做到成熟，聯電主攻成熟，世界先進主力是八吋電源管理，力積電做記憶體與驅動晶片。",
    ["所以各家分工不同", "台積電從先進做到成熟", "聯電主攻成熟", "世界先進", "主力是八吋電源管理", "力積電", "做記憶體與驅動晶片"],
    ["So each has its own niche.", "TSMC runs from leading-edge to mature,", "UMC focuses on mature nodes,", "Vanguard's mainstay", "is 8-inch power-management chips,", "and PSMC", "makes memory and driver chips."],
    ["台積電", "聯電", "世界先進", "力積電"],
    [cue("div", "分工不同"), cue("ts", "台積電"), cue("um", "聯電"), cue("vi", "世界先進"), cue("ps", "力積電")],
    {"zoom": [{"to": "fab", "at": "start-6", "dur": 1}],
     "shot": [shot("start-2", FX, -2.6, 72, 36, 20)],
     "run": [run("f_hotA", "ts", off("um", -10), 8), run("f_hotB", "ts", "s8:start-2", 8), run("f_hotC", "vi", "s8:start-2", 8), run("f_hotD", "ps", "s8:start-2", 8)],
     "labels": [lab("bA", "台積電 先進＋成熟", "TSMC", "blue", "ts", "s8:start-6"), lab("bB", "聯電 成熟製程", "UMC", "amber", "um", "s8:start-6"),
                lab("bC", "世界先進 8吋", "Vanguard", "amber", "vi", "s8:start-6"), lab("bD", "力積電 記憶體", "PSMC", "blue", "ps", "s8:start-6")],
     "overlay": [sec("fdy-who", "start+2", "s8:start-12", 930, 320, "各家主力", "公司法說・媒體報導", {"div": "div", "ts": "ts", "um": "um", "vi": "vi", "ps": "ps"})]},
    ["台積電、聯電、世界先進、力積電法說"], pause=0.7))

# ───────── s8 結尾（F）─────────
scenes.append(scene("s8", "cta", 8,
    "設計和製造就這樣分開。下一支，看代工廠怎麼製造，一片晶圓要經過哪些流程。想要完整解說，留言代工。",
    ["設計和製造就這樣分開", "下一支", "看代工廠怎麼製造", "一片晶圓要經過哪些流程", "想要完整解說", "留言代工"],
    ["That's how design and manufacturing split.", "Next:", "how a foundry makes chips,", "the steps one wafer goes through.", "For the full notes,", "comment \"代工\"."],
    ["怎麼製造", "晶圓", "代工"],
    [cue("split", "就這樣分開"), cue("next", "下一支"), cue("how", "怎麼製造"), cue("flow", "要經過哪些流程"), cue("full", "想要完整解說"), cue("kw", "留言代工")],
    {"zoom": [{"to": "fab", "at": "start-6", "dur": 1}],
     "shot": [shot("start-2", FX, -2.6, 74, 36, 20)],
     "run": [run("f_steam", "start-4", "s9:start", 8)],
     "labels": [],
     "overlay": [sec("fdy-next", "start+2", "kw-14", 930, 300, "接下來", "示意", {"split": "split", "how": "how", "next": "next", "flow": "flow"}), stamp("完整解說在留言", "full", "kw-14", "blue", 36, x=780, y=336, avoid=False)]},
    ["下一支：一片晶圓要經過哪些流程"]))

# ───────── s9 片尾卡 ─────────
scenes.append({"id": "s9", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene",
               "props": {"endCard": {"next": "一片晶圓的流程", "trail": ["代工市占", "傳送盒", "晶粒", "先進／成熟"], "at": "s8:kw-8", "comment": "代工", "logoAnim": "transparent"}}, "sources": []})

script = {
 "slug": "tech-foundry", "title": "晶圓代工有哪幾家、各家做什麼不同（科技透明圈）", "asOf": "2026/11/24", "styleVersion": 3, "stage": "three",
 "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
 "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
           "_說明": "念稿：docs/prompts/tech-foundry-旁白.txt；整篇 1 次請求"},
 "hud": {"levels": [{"id": "fab", "label": "晶圓廠", "en": "FAB", "field": "400 m", "ruler": "100 m", "art": "none", "handoff3D": True, "readout": True, "note": "查證截至 2026/11/24", "noteAlways": True},
                    {"id": "room", "label": "無塵室", "en": "CLEANROOM", "field": "40 m", "ruler": "10 m", "art": "none", "readout": True, "note": "查證截至 2026/11/24", "noteAlways": True},
                    {"id": "tool", "label": "機台", "en": "TOOL", "field": "4 m", "ruler": "1 m", "art": "none", "readout": True, "note": "查證截至 2026/11/24", "noteAlways": True},
                    {"id": "wafer", "label": "晶圓", "en": "WAFER", "field": "40 cm", "ruler": "10 cm", "art": "none", "readout": True, "note": "查證截至 2026/11/24", "noteAlways": True},
                    {"id": "die", "label": "晶粒", "en": "DIE", "field": "4 cm", "ruler": "1 cm", "art": "none", "readout": True, "note": "查證截至 2026/11/24", "noteAlways": True}],
         "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
 "cover": {"title": ["晶片公司沒有工廠", "代工廠各做什麼"], "sub": "晶圓代工", "frame": 40},
 "sample": False, "scenes": scenes,
}
json.dump(script, open("/home/user/ai-mp4/videos/tech-foundry/script.json", "w"), ensure_ascii=False, indent=1)
n = sum(len(s["tts"].replace("，","").replace("。","").replace("？","").replace(" ","")) for s in scenes if s.get("tts"))
print("ok", len(scenes), "念稿字數(不含標點)", n)
