# 產生 videos/tech-etch/script.json（改這支再重產）
import json
MX, CX, WX = 0, 60, 120
HIDE = "s1:start-40"; FAR = "s11:end+400"
def off(c, n): return f"{c}{'+' if n >= 0 else '-'}{abs(n)}"
def Q(s, c, n=0): return off(f"{s}:{c}", n)   # 跨幕引用
import re
def A(ref, n):   # 在已有偏移的引用上再加 n 幀
    m = re.fullmatch(r"(.*?)([+-]\d+)?", ref); base = m.group(1); k = int(m.group(2) or 0) + n
    return f"{base}{'+' if k >= 0 else '-'}{abs(k)}"
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
def hide(layer, until, dur=2): return {"layer": layer, "at": HIDE, "until": until, "opacity": 0, "dur": dur}
def gone(layer, at, dur=8): return {"layer": layer, "at": at, "until": FAR, "opacity": 0, "dur": dur}
scenes = []

# 孔裡 8 個塞子（p7 最上層）被打掉的時刻（跨幕）；保護膜四組出現的時刻
PT = {7: Q("s5", "hit", 8), 6: Q("s5", "hit", 22), 5: Q("s5", "bit", 2), 4: Q("s5", "surf", 0), 3: Q("s6", "wall", 8), 2: Q("s6", "film", 14), 1: Q("s6", "side", 0), 0: Q("s6", "straight", 0)}
FT = {3: Q("s6", "film", 0), 2: Q("s6", "film", 8), 1: Q("s6", "film", 26), 0: Q("s6", "straight", 12)}

# ───────── s1 鉤子（W 晶圓剖面）─────────
scenes.append(scene("s1", "hook", 1,
    "快閃記憶體有種洞，寬約一百奈米，深卻超過一萬奈米。怎麼挖，才能又深又直？",
    ["快閃記憶體有種洞", "寬約一百奈米", "深卻超過一萬奈米", "怎麼挖，才能又深又直？"],
    ["Flash memory has a kind of hole,", "about 100 nanometers wide,", "yet over 10,000 nanometers deep.", "How do you dig it deep and straight?"],
    ["一百奈米", "一萬奈米", "又深又直"],
    [cue("mem", "快閃記憶體"), cue("wide", "寬約一百奈米"), cue("deep", "超過一萬奈米"), cue("q", "怎麼挖")],
    {"hook": {"kicker": "快閃記憶體的洞｜廠商公布", "title": "深是寬的 100 倍", "size": 120, "top": 236},
     "zoom": [{"to": "sect", "at": "start-30", "dur": 1}],
     "shot": [shot("start-30", WX, 3.0, 33, 14, 1)],
     "shift": [hide(f"w_p{i}", "s2:start") for i in range(8)] + [hide(f"w_f{g}", FT[g]) for g in range(4)] + [hide("w_fill", Q("s10", "fill", -4)), hide("plasma", Q("s4", "plasma", -6))],
     "run": [run("w_ionall", "start-30", "s2:start-2", 8)],
     "labels": [lab("w_stack", "交疊的膜層", "Stacked films", "blue", "mem", "wide-4"), lab("w_hole", "洞（寬約 100 奈米）", "Hole, ~100 nm wide", "coral", "wide", "s2:start-8"), lab("w_mask", "光阻遮罩", "Photoresist mask", "amber", "deep", "s2:start-8")],
     "overlay": [sec("etch-dim", "mem", "s2:start-16", 940, 330, "洞的比例", "示意：實際約 1 比 100", {"mem": "s1:mem", "wide": "s1:wide", "deep": "s1:deep", "q": "s1:q"})]},
    ["Kihara 等人研究摘要；Semiconductor Engineering"], pause=0.7))

# ───────── s2 機台→反應腔（M → C）─────────
scenes.append(scene("s2", "mechanism", 2,
    "答案是蝕刻機。晶圓放進反應腔，先抽成接近真空。",
    ["答案是蝕刻機", "晶圓放進反應腔", "先抽成接近真空"],
    ["The answer is an etch tool.", "The wafer goes into a reaction chamber,", "which is first pumped to near vacuum."],
    ["蝕刻機", "反應腔", "真空"],
    [cue("ans", "答案是"), cue("tool", "蝕刻機"), cue("wf", "晶圓放進"), cue("cham", "反應腔"), cue("vac", "抽成"), cue("near", "接近真空")],
    {"zoom": [{"to": "mach", "at": "start-6", "dur": 1}, {"to": "cham", "at": "cham-16", "dur": 36}],
     "shot": [shot("start-2", MX, 2.0, 46, 16, 1), shot("cham-16", CX + 3.5, 1.5, 52, 18, 36)],
     "shift": [{"layer": "m_wafer", "at": "wf", "until": "s8:start-40", "dx": -4.2, "dur": 28}, {"layer": "m_arm", "at": "wf", "until": "s8:start-40", "dx": -4.2, "dur": 28}],
     "run": [run("c_vac", "vac", "s3:start+30", 6), run("c_rot", off("vac", -10), "s8:start-2", 10)],
     "labels": [lab("m_tool", "蝕刻機（群集式）", "Etch tool", "blue", "tool", "cham-18"), lab("m_wf", "晶圓", "Wafer", "amber", "wf", "cham-18"),
                lab("c_shell", "反應腔", "Reaction chamber", "blue", "cham+10", "s3:start-4"), lab("c_port", "抽氣幫浦", "Vacuum pump", "amber", "vac", "s3:start-4")],
     "overlay": [stamp("接近真空", "near", "s3:start-2", "blue", 44, x=760, y=330)]},
    ["通用示意；Semiconductor Engineering；Lam、TEL 產品說明"], pause=0.7))

# ───────── s3 爆炸剖析反應腔（C）─────────
scenes.append(scene("s3", "mechanism", 3,
    "上面是噴氣頭，下面是吸住晶圓的靜電吸盤，廢氣從抽氣口抽走。",
    ["上面是噴氣頭", "下面是吸住晶圓的靜電吸盤", "廢氣從抽氣口抽走"],
    ["Up top is the showerhead,", "below is the electrostatic chuck that holds the wafer,", "and waste gas is pumped out the exhaust port."],
    ["噴氣頭", "靜電吸盤", "抽氣口"],
    [cue("in", "上面"), cue("sh", "噴氣頭"), cue("esc", "靜電吸盤"), cue("wafer", "晶圓"), cue("exh", "廢氣"), cue("port", "抽氣口")],
    {"shot": [shot("start-2", CX + 2, 4.3, 62, 18, 16)],
     "shift": [{"layer": "ch_lid", "at": "in+4", "until": "s4:start-8", "dy": 5.0, "dur": 22}, {"layer": "ch_top", "at": "in+4", "until": "s4:start-8", "dy": 5.0, "dur": 22},
               {"layer": "ch_sh", "at": "sh-10", "until": "s4:start-8", "dy": 2.6, "dur": 22}, {"layer": "ch_wf", "at": "wafer-12", "until": "s4:start-8", "dy": 2.2, "dur": 20},
               {"layer": "ch_ring", "at": "wafer-12", "until": "s4:start-8", "dy": 1.2, "dur": 20}],
     "run": [run("c_exh", "exh", "s8:start-2", 6)],
     "labels": [lab("c_sh", "噴氣頭（上電極）", "Showerhead (top electrode)", "amber", "sh", "s4:start-14"), lab("c_esc", "靜電吸盤（下電極）", "Electrostatic chuck (bottom electrode)", "blue", "esc", "s4:start-14"),
                lab("c_wf", "晶圓", "Wafer", "coral", "wafer", "s4:start-14"), lab("c_port", "抽氣口", "Exhaust port", "amber", "port", "s4:start-14")]},
    ["通用電容耦合電漿蝕刻腔示意；Kyocera／TOTO 靜電吸盤產品頁"], pause=0.7))

# ───────── s4 氣體→電漿（C，運作動畫 A）─────────
scenes.append(scene("s4", "mechanism", 4,
    "氣體從噴氣頭灌進來，一通上射頻電，就被打成電漿，發出光。",
    ["氣體從噴氣頭灌進來", "一通上射頻電", "就被打成電漿", "發出光"],
    ["Gas pours in through the showerhead,", "RF power switches on,", "and the gas is struck into plasma,", "glowing."],
    ["氣體", "射頻電", "電漿"],
    [cue("gas", "氣體"), cue("in", "灌進來"), cue("rf", "射頻電"), cue("plasma", "電漿"), cue("glow", "發出光")],
    {"shot": [shot("start-2", CX + 1, 2.4, 42, 18, 18)],
     "run": [run("c_gin", "gas", "s8:start-2", 6), run("c_gsh", "in", "s5:hit-14", 6), run("c_gsh2", "in", "s5:hit-14", 6), run("c_rf", "rf", "s5:hit-14", 6), run("c_rfb", "rf", "s5:hit-14", 6), run("c_pl", off("plasma", -6), "s8:start-2", 8)],
     "labels": [lab("c_gas", "氣體進來", "Gas in", "blue", "gas", "rf-6"), lab("c_rfa", "射頻電", "RF power", "amber", "rf", "s5:start-6"), lab("c_pl", "電漿區", "Plasma", "coral", "plasma", "s5:start-6")],
     "overlay": [sec("etch-gas", "start+2", "s5:start-16", 930, 335, "氣體怎麼變電漿", "示意，非實際比例", {"gas": "s4:gas", "in": "s4:in", "rf": "s4:rf", "plasma": "s4:plasma", "glow": "s4:glow"})]},
    ["MKS 蝕刻技術說明；美國專利 US4253907"], pause=0.7))

# ───────── s5 離子往下打（C → W，運作動畫 B）─────────
scenes.append(scene("s5", "mechanism", 5,
    "電漿裡的離子帶電，被電場往下拉，垂直撞向晶圓，一點一點打掉表面。",
    ["電漿裡的離子帶電", "被電場往下拉", "垂直撞向晶圓", "一點一點打掉表面"],
    ["Ions in the plasma carry charge,", "get pulled down by the electric field,", "slam straight into the wafer,", "chipping the surface away bit by bit."],
    ["離子", "往下拉", "垂直撞向", "一點一點"],
    [cue("ion", "離子"), cue("charge", "帶電"), cue("field", "電場"), cue("pull", "往下拉"), cue("hit", "垂直撞向"), cue("bit", "一點一點"), cue("surf", "打掉表面")],
    {"zoom": [{"to": "sect", "at": "hit-24", "dur": 36}],
     "shot": [shot("start-2", CX + 1, 3.0, 40, 18, 16), shot("hit-24", WX, 2.7, 34, 14, 36)],
     "shift": [gone(f"w_p{i}", PT[i], 10) for i in (7, 6, 5, 4)],
     "run": [run("c_ion", "ion", "hit-8", 6), run("c_ion2", "ion", "hit-8", 6), run("c_efield", "field", "hit-8", 6),
             run("w_ion0", off("hit", -4), A(PT[6], 8), 6), run("w_ion1", A(PT[6], 8), Q("s6", "wall", 14), 6)],
     "labels": [lab("c_ionlab", "離子（帶正電）", "Ions (positive)", "coral", "ion", "hit-26"), lab("w_mask", "光阻遮罩", "Mask", "amber", "bit", "s6:start-6")],
     "overlay": [sec("etch-sect", "hit-10", "s8:start-16", 940, 330, "孔一點一點變深", "示意，非實際比例",
                     {**{f"p{i}": PT[i] for i in range(8)}, **{f"f{g}": FT[g] for g in range(4)}, "hit": "s5:hit", "film": "s6:film", "straight": "s6:straight", "side": "s6:side"})]},
    ["MKS；美國專利；成大設備手冊"], pause=0.7))

# ───────── s6 洞壁保護膜（W，運作動畫 C）─────────
scenes.append(scene("s6", "mechanism", 6,
    "只往下打還不夠，所以洞壁留一層保護膜，側面不被刻到，洞才挖得直。",
    ["只往下打還不夠", "所以洞壁留一層保護膜", "側面不被刻到", "洞才挖得直"],
    ["Hitting straight down isn't enough,", "so a protective film is left on the hole walls,", "keeping the sides from being etched,", "so the hole stays straight."],
    ["保護膜", "不被刻到", "挖得直"],
    [cue("not", "只往下打還不夠"), cue("wall", "洞壁"), cue("film", "保護膜"), cue("side", "側面不被刻到"), cue("straight", "洞才挖得直")],
    {"shot": [shot("start-2", WX, 2.7, 34, 14, 1)],
     "shift": [gone(f"w_p{i}", PT[i], 10) for i in (3, 2, 1, 0)],
     "run": [run("w_ion2", Q("s6", "wall", 14), A(PT[2], 8), 6), run("w_ion3", A(PT[2], 8), A(PT[0], 8), 6), run("w_ion4", A(PT[0], 8), "s8:start-2", 6), run("w_by", "wall", "s8:start-2", 6)],
     "labels": [lab("w_wall", "洞壁保護膜", "Protective film", "blue", "film", "s8:start-8"), lab("w_hole", "底部繼續被打深", "Bottom keeps etching", "coral", "straight", "s8:start-8")]},
    ["美國專利 US7166233；清大論文；MKS"], pause=0.7))

# ───────── s8 誰在做（國際，M）─────────
scenes.append(scene("s8", "payoff", 8,
    "做這種機器的不多，主要是科林研發、東京威力科創、應用材料。",
    ["做這種機器的不多", "主要是科林研發", "東京威力科創", "應用材料"],
    ["Few companies can build such a tool,", "mainly Lam Research,", "Tokyo Electron,", "and Applied Materials."],
    ["科林研發", "東京威力科創", "應用材料"],
    [cue("few", "做這種機器的不多"), cue("lam", "科林研發"), cue("tel", "東京威力科創"), cue("amat", "應用材料")],
    {"zoom": [{"to": "mach", "at": "start-6", "dur": 40}],
     "shot": [shot("start-2", MX, 1.6, 46, 16, 40)],
     "labels": [lab("m_v1", "科林研發", "Lam Research", "amber", "lam", "s9:start-8"), lab("m_v2", "東京威力科創", "Tokyo Electron", "amber", "tel", "s9:start-8"), lab("m_v3", "應用材料", "Applied Materials", "amber", "amat", "s9:start-8")],
     "overlay": [stamp("媒體報導：自由時報", "few", "s9:start-2", "blue", 36, x=640, y=330)]},
    ["自由時報 2025；法說會整理"], pause=0.7))

# ───────── s9 台灣誰在做（引線指到反應腔對應部位）─────────
scenes.append(scene("s9", "payoff", 9,
    "台灣沒有整機廠，但有零件，京鼎代工模組，瑞耘做腔體零件，翔名做耗材。",
    ["台灣沒有整機廠", "但有零件", "京鼎代工模組", "瑞耘做腔體零件", "翔名做耗材"],
    ["Taiwan has no full-tool maker,", "but it does make parts:", "AIC makes tool modules on contract,", "Finesse makes chamber parts,", "and Hiwin Tech makes consumables."],
    ["京鼎", "瑞耘", "翔名"],
    [cue("no", "沒有整機廠"), cue("parts", "但有零件"), cue("jd", "京鼎"), cue("ry", "瑞耘"), cue("xm", "翔名")],
    {"zoom": [{"to": "cham", "at": "start-6", "dur": 36}],
     "shot": [shot("start-2", CX + 1, 2.0, 46, 18, 36)],
     "labels": [lab("c_shell", "京鼎：代工設備模組", "Tool modules (contract)", "amber", "jd", "s10:start-8"), lab("c_sh", "瑞耘：腔體零件", "Chamber parts", "amber", "ry", "s10:start-8"), lab("c_ln", "翔名：耗材", "Consumables", "amber", "xm", "s10:start-8")],
     "overlay": [stamp("媒體報導", "parts", "s10:start-2", "blue", 40, x=800, y=330)]},
    ["媒體報導：優分析、財訊、經濟日報（京鼎、瑞耘、翔名）"], pause=0.7))

# ───────── s10 結尾：答案→下一支 ─────────
scenes.append(scene("s10", "cta", 10,
    "又深又直，靠電漿往下打，加上洞壁保護。洞挖好還得填回材料，所以下一支，來看薄膜沉積。想要完整解說，留言蝕刻。",
    ["又深又直", "靠電漿往下打", "加上洞壁保護", "洞挖好還得填回材料", "所以下一支", "來看薄膜沉積", "想要完整解說", "留言蝕刻"],
    ["Deep and straight,", "thanks to plasma ions hitting downward,", "plus the wall protection.", "Once dug, the hole must be filled with material,", "so next:", "thin-film deposition.", "For the full notes,", "comment \"蝕刻\"."],
    ["電漿", "洞壁保護", "薄膜沉積", "蝕刻"],
    [cue("ans", "又深又直"), cue("ion", "電漿往下打"), cue("prot", "洞壁保護"), cue("fill", "填回材料"), cue("next", "下一支"), cue("dep", "薄膜沉積"), cue("full", "想要完整解說"), cue("kw", "留言蝕刻")],
    {"zoom": [{"to": "sect", "at": "start-6", "dur": 40}],
     "shot": [shot("start-2", WX, 2.7, 34, 14, 40)],
     "run": [run("w_ionall", "ion", off("fill", -6), 6)],
     "labels": [lab("w_wall", "洞壁保護膜", "Protective film", "blue", "prot", "fill-4"), lab("w_hole", "填回材料", "Fill material", "amber", "fill", "full-6")],
     "overlay": [sec("etch-next", "start+2", "kw-14", 930, 300, "又深又直靠兩件事", "示意", {"ans": "s10:ans", "ion": "s10:ion", "prot": "s10:prot", "fill": "s10:fill", "next": "s10:next", "dep": "s10:dep"}),
                 stamp("完整解說在留言", "full", "kw-14", "blue", 36, x=780, y=336, avoid=False)]},
    ["下一支：薄膜沉積"]))

# ───────── s11 片尾卡 ─────────
scenes.append({"id": "s11", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene",
               "props": {"endCard": {"next": "薄膜沉積", "trail": ["洞很深", "電漿", "洞壁保護", "蝕刻機"], "at": "s10:kw-8", "comment": "蝕刻", "logoAnim": "transparent"}}, "sources": []})

script = {
 "slug": "tech-etch", "title": "蝕刻機：把圖形刻進晶圓（科技透明圈）", "asOf": "2026/11/18", "styleVersion": 3, "stage": "three",
 "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
 "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
           "_說明": "念稿：docs/prompts/tech-etch-旁白.txt；整篇 1 次請求"},
 "hud": {"levels": [{"id": "mach", "label": "蝕刻機", "en": "ETCH TOOL", "field": "3 m", "ruler": "1 m", "art": "none", "handoff3D": True, "readout": True, "note": "查證截至 2026/11/18", "noteAlways": True},
                    {"id": "cham", "label": "反應腔", "en": "CHAMBER", "field": "30 cm", "ruler": "10 cm", "art": "none", "readout": True, "note": "查證截至 2026/11/18", "noteAlways": True},
                    {"id": "sect", "label": "晶圓剖面", "en": "WAFER SECTION", "field": "3 µm", "ruler": "1 µm", "art": "none", "readout": True, "note": "查證截至 2026/11/18", "noteAlways": True}],
         "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例・電漿與離子為示意"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
 "cover": {"title": ["洞又深又直", "靠電漿往下打"], "sub": "蝕刻機", "frame": 40},
 "sample": False, "scenes": scenes,
}
json.dump(script, open("/home/user/ai-mp4/videos/tech-etch/script.json", "w"), ensure_ascii=False, indent=1)
print("ok", len(scenes))
