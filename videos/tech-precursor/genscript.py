"""tech-precursor 腳本產生器：python3 videos/tech-precursor/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
前驅物（科技透明圈 系列 2「代工的供應商」第 14 集；上一集 2-13：濺鍍靶材；下一集 2-15：特用氣體）。
旁白、cue、字幕、hook、片尾卡、hud、voice 與各幕 3D 動作（shot／shift／run／labels／overlay）都在這支；cue 來自 timeline.json，配音後重跑本檔即可。
2D 卡：src/components/three/HudPrecursor.tsx（precursor-*）。構造與物理：physics-spec.md；模組清單：visual-spec.md。
Andy 11-27 第 27 條：念稿 ≤260 字、片長 70～80 秒、一幕一件事最多 1 個新名詞、關鍵畫面念完後留 ≥1.2 秒只有畫面（holdSec，同時寫進 pauseAfter 給配音後的時間軸）；
第 28 條：至少 3 個生活比喻；第 29 條：爆炸分解步驟全部做完。第 18 條：念稿不用縮寫術語；第 21、22 條：念稿避開「上」、「量測」。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
SITES = INFO["SITES"]
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, 無聲幕長秒, 尾端只有畫面秒數)
S = [
("s1", "hook", "上一集說，改用氣體原料。氣體，從哪來？",
 ["上一集說", "改用氣體原料", "氣體，從哪來？"], ["Last time: switch", "to gas raw materials.", "Where does gas come from?"],
 [("prev", "上一集"), ("q", "從哪來")], ["氣體原料", "從哪來"], ["示意動畫，不是量測"], 5.2, 1.2),
("s2", "mechanism", "這種原料叫前驅物，像做菜前備好的醬料，裝在氣櫃裡，有液體也有固體。",
 ["這種原料叫前驅物", "像做菜前備好", "的醬料", "裝在氣櫃裡", "有液體也有固體"], ["This raw material is a precursor,", "like a sauce prepared", "before cooking,", "kept in a gas cabinet,", "as liquid or solid."],
 [("name", "前驅物"), ("sauce", "醬料"), ("cab", "氣櫃"), ("solid", "固體")], ["前驅物", "醬料", "固體"], ["默克（Merck）產品頁；Entegris 部落格；示意"], 7.4, 1.2),
("s3", "mechanism", "先拆開起泡器，裡面有液體和一根插管。",
 ["先拆開起泡器", "裡面有液體", "和一根插管"], ["First, open the bubbler:", "it holds liquid", "and one dip tube."],
 [("open", "拆開"), ("bub", "起泡器"), ("liq", "液體"), ("dip", "插管")], ["起泡器", "液體", "插管"], ["Strem 起泡器文章；專利 US7562672；示意"], 11.4, 1.3),
("s4", "mechanism", "旁邊還有載氣、加熱的管子，和閥。",
 ["旁邊還有載氣", "加熱的管子", "和閥"], ["Beside it: carrier gas,", "heated pipes,", "and valves."],
 [("gas", "載氣"), ("pipe", "管子"), ("valve", "閥")], ["載氣", "加熱", "閥"], ["專利 US8518484、WO2004010463、US6941963；示意"], 12.2, 1.3),
("s5", "mechanism", "載氣吹進液體，像在飲料裡吹泡泡，把香味帶出來。",
 ["載氣吹進液體", "像在飲料裡", "吹泡泡", "把香味帶出來"], ["Carrier gas blows into the liquid,", "like blowing bubbles", "in a drink,", "carrying the aroma out."],
 [("blow", "吹進液體"), ("bubble", "吹泡泡"), ("scent", "香味")], ["載氣", "泡泡", "香味"], ["專利 US7562672；氣泡飽和論文；示意動畫"], 6.0, 1.3),
("s6", "mechanism", "管子要比瓶子再熱些，蒸氣遇冷，就像冷杯子凝水珠。",
 ["管子要比瓶子", "再熱些", "蒸氣遇冷", "就像冷杯子", "凝水珠"], ["The pipe must run hotter", "than the bottle.", "Vapor meeting cold", "is like a cold glass", "beading with water."],
 [("hot", "再熱些"), ("cold", "遇冷"), ("drop", "凝水珠")], ["再熱些", "遇冷", "凝水珠"], ["專利 WO2004010463、US8518484；示意動畫，不是量測"], 5.8, 1.3),
("s7", "mechanism", "閥一開一關，每次只送一小團蒸氣進去。",
 ["閥一開一關", "每次只送", "一小團蒸氣進去"], ["The valve opens and closes,", "sending only", "a small puff of vapor."],
 [("open", "一開"), ("close", "一關"), ("puff", "一小團")], ["一開一關", "一小團"], ["專利 US6941963；示意動畫，不是量測"], 5.0, 1.3),
("s8", "mechanism", "到了表面，像刷油漆，一次刷一層，刷滿就停。一圈大約一個原子的厚度。",
 ["到了表面", "像刷油漆", "一次刷一層", "刷滿就停", "一圈大約", "一個原子的厚度"], ["At the surface, like painting,", "one coat at a time,", "stop when covered.", "Each cycle is about", "one atom", "thick."],
 [("paint", "刷油漆"), ("one", "一次刷一層"), ("full", "刷滿就停"), ("atom", "一個原子")], ["刷油漆", "刷滿就停", "原子"], ["Puurunen 2005；教學範例；示意動畫"], 8.4, 1.3),
("s9", "mechanism", "原料要非常乾淨，混進一顆雜質金屬原子，晶片就可能出問題。",
 ["原料要非常乾淨", "混進一顆", "雜質金屬原子", "晶片就可能", "出問題"], ["The material must be very clean:", "one stray", "metal atom", "can make a chip", "go wrong."],
 [("clean", "非常乾淨"), ("atom", "雜質"), ("bad", "出問題")], ["乾淨", "雜質", "出問題"], ["廠商指南（J&K、Merck）；示意動畫，不是量測"], 5.2, 1.3),
("s10", "payoff", "全球少數幾家供應，德國默克、法國液空，台灣有興櫃的宇川精材。",
 ["全球少數幾家供應", "德國默克", "法國液空", "台灣有興櫃的", "宇川精材"], ["Only a few suppliers worldwide:", "Merck of Germany,", "Air Liquide of France,", "and Taiwan's Pentapro,", "listed on the emerging board."],
 [("few", "少數幾家"), ("de", "默克"), ("fr", "液空"), ("tw", "宇川")], ["德國", "法國", "台灣"], ["Merck、Air Liquide、櫃買中心；截至 2026/11/27"], 5.6, 1.2),
("s11", "cta", "下一集，製程用的氣體，看特用氣體。留言前驅物，拿完整資料。",
 ["下一集", "製程用的氣體", "看特用氣體", "留言前驅物", "拿完整資料"], ["Next episode:", "the gases used in process,", "specialty gases.", "Comment \"precursor\"", "for the full notes."],
 [("next", "下一集"), ("gas", "特用氣體"), ("kw", "留言")], ["特用氣體", "前驅物"], ["示意動畫，不是量測"], 4.2, 1.0),
]
def TTS(t):
    t = t.replace("上集", "上一集").replace("上一一集", "上一集").replace("矽", "細").replace("光罩", "光照")
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("上百片", "一百多片")]:
        t = t.replace(a, b)  # Andy 11-26 規範第 21 條：念稿避開「上」
    return t
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, dur, tail) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？]", "", z)) <= 11, (sid, z)
    for c in cues: assert c[1] in nar, (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar)); hold = round(max(tail, dur - 0.2 - nch / 5.2), 1)   # 念完之後只有畫面的秒數（無聲估計：每秒 5.2 字）
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
scenes[0]["props"]["hook"] = {"kicker": "接上集：改用氣體原料", "title": "氣體從哪來？", "size": 118, "top": 236}
scenes.append({"id": "s12", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "特用氣體", "trail": ["製程用的氣體"], "comment": "前驅物", "logoAnim": "transparent"}}})

# ═════════ 工具 ═════════
FAR = "s12:start+400"
def run(i, at, until=None, ramp=6, **kw):
    d = {"id": i, "at": at, "ramp": ramp}
    if until: d["until"] = until
    d.update(kw); return d
def lab(part, text, en, color, at, until, xy=None, **kw):
    d = {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until}
    if xy: d["xy"] = xy
    d.update(kw); return d
YAW = [0.0]
def shot(at, x, y, d, elev, dur=30, yaw=None):
    o = {"at": at, "dur": dur, "x": x, "y": y, "d": d, "elev": elev}
    if yaw is not None and abs(yaw - YAW[0]) > 1e-6: o["yaw"] = round(yaw - YAW[0], 4); YAW[0] = yaw
    return o
def hid(lay, a, b, dur=10, o=0): return {"layer": lay, "at": a, "until": b, "opacity": o, "dur": dur}
def mv(lay, a, b, dur=22, **kw):
    d = {"layer": lay, "at": a, "until": b, "dur": dur}; d.update(kw); return d
def sec(kind, at, until, title, tag, t=None, y=1066, h=330, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag}
    if t is not None: d["t"] = {k: {"at": v} for k, v in t.items()}
    d.update(kw); return d

LAYERS = [l["id"] for l in MODEL["layers"] if not l.get("bg")]
VIS = []
T0 = "s1:start-40"
def vis(lay, wins, dur=3):
    """依「可見區間」清單產生隱藏：區間之外全藏。區間 (a, b)；a＝T0 表示一開始就看得到；b＝FAR 表示一直看到片尾"""
    assert lay in LAYERS, lay
    prev = T0
    for a, b in wins:
        if a != T0: VIS.append(hid(lay, prev, a, dur))
        prev = b
    if prev != FAR: VIS.append(hid(lay, prev, FAR, dur))
BACK = "s4:start+272"       # 爆炸組回的起點（s4 尾端的遠景）
A_ALL = ["cabBase", "cabWall", "cabDoor", "bbBase", "vshell", "liq", "lid", "dip", "jack", "mfc", "vtrim"]
A_WIN = [(T0, "s2:cab+16"), ("s3:start-6", "s4:start+70"), ("s4:start+242", "s6:start-2"), ("s11:start-6", FAR)]
for l in A_ALL: vis(l, A_WIN)
vis("gsrc", [A_WIN[1], A_WIN[2]])   # 減壓閥在 s1、s2 不入鏡（起泡器大特寫不切到左邊的閥）
for l in ["ampBase", "ampShell", "ampLid", "ampT0", "ampT1", "ampT2", "ampT3"]: vis(l, [("s2:cab+12", "s3:start-2")])
HL = ["hline", "hjk0", "hjk1", "hjk2", "pfilShell", "pfilCore"]
for l in HL: vis(l, [("s4:start+72", "s5:start-2")])
B_ALL = ["vbox", "vfront", "vbase", "vblock", "vdiaA", "vdiaB", "vdiaP", "vpipes"]
for l in B_ALL: vis(l, [("s4:start+170", "s5:start-2"), ("s7:start-10", "s8:start-2")])
for l in ["chb", "cwf", "cpump"]: vis(l, [("s7:start-10", "s8:start-2")])
for l in ["hotCmp", "coldCmp", "cmpValve"]: vis(l, [("s6:start-10", "s7:start-2")])
vis("crust1", [("s6:cold+4", "s7:start-2")]); vis("crust2", [("s6:cold+40", "s7:start-2")]); vis("crust3", [("s6:cold+78", "s7:start-2")])
# D 站（晶圓表面分子）：八個位置各自在 TMA 反應時（one+4k）換成「鋁＋甲基」，水反應時（atom-14+4k）換成新的羥基
D_END = "s10:start-2"
for l in ["supBase"]: vis(l, [("s10:start-6", "s11:start-2")])
for i, c in enumerate(["de", "fr", "tw"]):
    vis(f"sup{i}", [("s10:start-6", "s11:start-2")])
    VIS.append(hid(f"sup{i}", "s10:start-6", f"s10:{c}-4", 6, 0.3))
for l in ["sub", "surf"]: vis(l, [("s8:start-8", D_END)])
for k in range(len(SITES)):
    r, w = f"s8:one+{4 * k}", f"s8:atom{-14 + 4 * k:+d}"
    vis(f"h{k}", [("s8:start-8", r)]); vis(f"al{k}", [(r, D_END)]); vis(f"me{k}", [(r, w)]); vis(f"oh2{k}", [(w, D_END)])
vis("film", [("s8:atom+22", D_END)]); vis("imp", [("s9:atom-4", D_END)])
# 氣櫃外殼：s1 一開始就是幽靈（看得到裡面的起泡器在動）；s2 念到「氣櫃」前蓋回實體、前門推回；s3 念到「拆開」門滑開、外殼淡成幽靈
GHOST_CAB = ["cabWall"]
VIS += [hid("cabWall", T0, "s2:cab-2", 10, 0.14)]
VIS += [mv("cabDoor", T0, "s2:cab-2", 14, dx=-12.0), hid("cabDoor", T0, "s2:cab-2", 1, 0)]
VIS += [hid("vshell", T0, "s2:cab+14", 8, 0.2), hid("jack", T0, "s2:cab+14", 8, 0.3)]
BACKALL = (BACK, FAR)
# 氣櫃 s2 把門推回 → s3 拆開時滑開、外殼淡成幽靈；爆炸 6 步（門→蓋與進出氣閥→加熱套→插管→外殼剖開看液體與頂部空間）
EXPL = [mv("cabDoor", "s3:start+48", "s6:start-2", 14, dx=-12.0), hid("cabWall", "s3:start+48", "s6:start-2", 14, 0.14),
        mv("lid", "s3:open+50", BACK, 26, dy=8.0), mv("jack", "s3:open+104", BACK, 26, dy=7.0), mv("dip", "s3:open+158", BACK, 26, dy=5.0),
        hid("vshell", "s3:open+212", BACK, 16, 0.18)]
# s4：載氣流量控制往左拉；加熱管路保溫套逐段剝開；閥塊上抬、隔膜與彈簧分開；最後遠景一起組回
EXPL += [mv("mfc", "s4:start+6", BACK, 24, dx=-4.2),
         mv("hjk0", "s4:start+84", BACK, 18, dy=1.7), mv("hjk1", "s4:start+96", BACK, 18, dy=1.7), mv("hjk2", "s4:start+108", BACK, 18, dy=1.7),
         mv("vblock", "s4:start+182", BACK, 26, dy=6.0), mv("vdiaA", "s4:start+186", BACK, 24, dy=3.2), mv("vdiaB", "s4:start+186", BACK, 24, dy=3.2), mv("vdiaP", "s4:start+186", BACK, 24, dy=3.2),
         hid("vfront", "s4:start+170", "s4:start+272", 10, 0.18),
         hid("pfilShell", "s4:start+126", BACK, 10, 0.18), mv("pfilCore", "s4:start+130", BACK, 24, dy=2.8)]
# 固體安瓿短版爆炸（s2 後半）：蓋升起、托盤一層層升起
EXPL += [mv("ampLid", "s2:cab+20", FAR, 18, dy=5.0), mv("ampT3", "s2:cab+30", FAR, 18, dy=3.6), mv("ampT2", "s2:cab+36", FAR, 18, dy=2.4), mv("ampT1", "s2:cab+42", FAR, 18, dy=1.2),
         hid("ampShell", "s2:cab+48", FAR, 12, 0.2)]
# s11：回到 s1 的起泡器大特寫（門打開、外殼幽靈），呼應「氣體從哪來」
EXPL += [mv("cabDoor", "s11:start-6", FAR, 4, dx=-12.0), hid("cabWall", "s11:start-6", FAR, 4, 0.14), hid("vshell", "s11:start-6", FAR, 4, 0.2), hid("jack", "s11:start-6", FAR, 4, 0.3)]
# 閥運作（s7）：隔膜 A 一開一關（微回彈）
OPEN = [mv("vdiaA", "s7:open-2", "s7:close-4", 7, dy=0.32)]
P = {}
S1X, S1Y, S1D = -0.3, 3.6, 38   # s1、s2 共用的起泡器大特寫（不切到左側減壓閥）
P["s1"] = {"shot": [shot("start-30", S1X, S1Y, S1D + 2, 12, 1, yaw=-0.2), shot("start", S1X, S1Y, S1D, 14, 150)],
 "shift": VIS + EXPL + OPEN,
 "run": [run("jackGlow", "start-30", "s2:cab+14", 1), run("liqWarm", "start-30", "s2:cab+14", 1), run("bubA", "start-30", "s2:cab+14", 1), run("bubB", "start-30", "s2:cab+14", 1), run("bubC", "start-30", "s2:cab+14", 1), run("vapHi", "start-30", "s2:cab+14", 1), run("ripple", "start-30", "s2:cab+14", 1), run("carrierIn", "start-30", "s2:cab+14", 1)],
 "overlay": [sec("precursor-hook", "q", "s2:start-5", "系列 2・第 14 集", "示意，非實際比例", {"prev": "prev", "q": "q"})]}
P["s2"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}],
 "shot": [shot("start", S1X, S1Y, S1D, 14, 1), shot("cab+12", -26.0, 2.4, 34, 20, 1, yaw=-0.1)],
 "run": [run("ampHeat", "cab+16", "s3:start-2", 10), run("sublime", "cab+44", "s3:start-2", 8), run("jackGlow", "start", "cab+14", 6)],
 "labels": [lab("amp", "固體：托盤疊層", "Solid: stacked trays", "amber", "cab+48", "s3:start-14")],
 "overlay": [sec("precursor-kinds", "start+20", "s3:start-5", "前驅物：原料的外型", "示意", {"name": "name", "sauce": "sauce", "cab": "cab", "solid": "solid"})]}
P["s3"] = {"shot": [shot("start", -2.5, 4.4, 34, 10, 1, yaw=0.0), shot("start+50", 0.0, 3.9, 46, 18, 1), shot("open+52", 0.0, 7.6, 60, 22, 40), shot("open+206", 0.0, 4.6, 50, 22, 24)],
 "run": [run("bubA", "start", "open+210", 6), run("bubB", "start", "open+210", 6)],
 "labels": [lab("cab", "氣櫃", "Gas cabinet", "amber", "start+2", "start+48"),
            lab("lid", "進出氣閥", "In/out valves", "blue", "open+56", "open+102"),
            lab("jack", "加熱套", "Heating jacket", "amber", "open+110", "open+156"),
            lab("dip", "插管", "Dip tube", "blue", "open+164", "open+210"),
            lab("liq", "液體", "Liquid", "amber", "open+218", "open+264"),
            lab("headspace", "頂部空間", "Headspace", "blue", "open+270", "open+316")],
 "overlay": [sec("precursor-bubbler", "start+20", "s4:start-5", "起泡器怎麼拆", "示意", {"cab": "open", "lid": "open+56", "jack": "open+110", "dip": "open+164", "liq": "open+218", "head": "open+270"})]}
P["s4"] = {"shot": [shot("start", -4.0, 5.4, 52, 18, 1, yaw=0.0), shot("start+72", 13.0, 3.2, 40, 28, 1), shot("start+124", 9.5, 3.4, 38, 28, 24), shot("start+176", 24.0, 4.8, 40, 30, 1),
                    shot("start+242", 8.0, 3.0, 104, 36, 1), shot("start+290", 5.8, 2.8, 68, 34, 22)],
 "run": [run("tapeGlowV", "start+170", FAR, 6), run("tapeFlash", "start+312", "start+342", 6), run("tapeOn", "start+342", FAR, 8), run("mfcLed", "start+312", FAR, 6), run("ledA", "start+200", FAR, 6)],
 "labels": [lab("mfc", "載氣流量控制", "Carrier gas MFC", "amber", "start+26", "start+72"),
            lab("hline", "加熱管路", "Heated line", "amber", "start+78", "start+124"),
            lab("pfil", "微粒過濾器", "Particle filter", "blue", "start+128", "start+174"),
            lab("vblock", "脈衝閥", "Pulse valve", "blue", "start+184", "start+228", xy=[200, 330]),
            lab("seat", "閥座", "Valve seat", "amber", "start+228", "start+272")],
 "overlay": [sec("precursor-path", "start+78", "s5:start-5", "送料路徑：一路加熱保溫", "示意", {"gas": "start+26", "pipe": "start+80", "valve": "start+186", "back": BACK}, y=1046, h=346)]}
P["s5"] = {"shot": [shot("start-4", 0.0, 3.2, 38, 10, 1, yaw=0.0)],
 "run": [run(i, "blow-6", "s6:start-4", 8) for i in ("bubA", "bubB", "bubC", "ripple", "carrierIn")] + [run("jackGlow", "start", "s6:start-4", 8), run("liqWarm", "start", "s6:start-4", 8), run("vapLow", "blow-2", "scent-10", 8), run("vapHi", "scent-10", "s6:start-4", 10)],
 "shift": [hid("vshell", "start-2", "s6:start-2", 8, 0.16), hid("jack", "start-2", "s6:start-2", 8, 0.24)],
 "labels": [lab("dipTip", "燒結頭：細氣泡", "Sintered tip", "amber", "blow", "bubble-4"),
            lab("liq", "氣泡帶走蒸氣", "Bubbles carry vapor", "blue", "bubble+6", "s6:start-14")],
 "overlay": [sec("precursor-bubble", "start+24", "s6:start-5", "起泡器剖面", "示意（不標溫度）", {"blow": "blow", "bubble": "bubble", "scent": "scent"})]}
P["s6"] = {"shot": [shot("start-4", 13.4, 2.6, 36, 36, 1, yaw=0.0)],
 "run": [run("tapeGlow", "start", "s7:start-4", 8), run("hotFlow", "hot-10", "s7:start-4", 8), run("coldFlowA", "hot-10", "cold+90", 8), run("coldFlowB", "cold+92", "s7:start-4", 8)],
 "labels": [lab("hotL", "有加熱：蒸氣順暢", "Heated: vapor flows", "amber", "hot", "cold-4"),
            lab("coldL", "沒加熱：冷點", "Unheated: cold spot", "blue", "cold+4", "s7:start-14")],
 "overlay": [sec("precursor-cold", "start+24", "s7:start-5", "冷杯子凝水珠", "示意（不標溫度）", {"hot": "hot", "cold": "cold", "drop": "drop"})]}
P["s7"] = {"shot": [shot("start-4", 31.0, 3.4, 54, 26, 1, yaw=0.0), shot("puff-8", 39.5, 3.0, 58, 26, 30)],
 "run": [run("pulseA", "open-2", "close+60", 6), run("purgeN", "close+56", "s8:start-6", 6), run("ledA", "open-6", "close+4", 4), run("tapeGlow", "start", "s8:start-4", 8)],
 "shift": [hid("vblock", "start-8", "s8:start-2", 8, 0.28), hid("vfront", "start-8", "s8:start-2", 8, 0.12)],
 "labels": [lab("vblock", "脈衝閥開", "Valve open", "amber", "open-2", "close-6"),
            lab("chamber", "進腔體", "To chamber", "blue", "puff+12", "s8:start-14")],
 "overlay": [sec("precursor-pulse", "start+30", "s8:start-5", "閥一開一關，一小團", "示意（不標秒數）", {"open": "open", "close": "close", "puff": "puff"})]}
P["s8"] = {"shot": [shot("start-4", 58.0, 0.2, 34, 40, 1, yaw=0.0), shot("one-10", 58.0, 0.4, 28, 44, 30), shot("atom-30", 58.0, 0.4, 30, 38, 30)],
 "run": [run("tmaIn", "paint-6", "one+44", 6), run("ch4Out", "one+4", "one+60", 6), run("tmaBnc", "full-16", "full+36", 6), run("purge1", "full+38", "full+92", 6),
         run("h2oIn", "atom-56", "atom-2", 6), run("ch4Out2", "atom-14", "atom+34", 6), run("purge1", "atom+36", "s9:start-6", 6)],
 "labels": [lab("site", "表面位置", "Surface sites", "blue", "start+6", "paint-2"),
            lab("tma", "鋁原料分子", "Precursor molecule", "amber", "paint+2", "one+30"),
            lab("purgeA", "吹淨", "Purge", "blue", "full+34", "full+68"),
            lab("filmA", "多一層薄片", "One more layer", "amber", "atom+30", "s9:start-14")],
 "overlay": [sec("precursor-ald", "start+24", "s9:start-5", "ALD 一圈：刷一層就停", "教學範例：鋁原料與水（示意）", {"paint": "paint", "one": "one", "full": "full", "atom": "atom"}, y=1046, h=346)]}
P["s9"] = {"shot": [shot("start-4", 59.6, 0.2, 26, 42, 1, yaw=0.0)],
 "run": [run("impDrop", "atom-18", "bad+30", 4), run("impGlow", "atom+10", "s10:start-6", 8)],
 "labels": [lab("impA", "雜質金屬原子", "Stray metal atom", "amber", "atom+12", "s10:start-14")],
 "overlay": [sec("precursor-purity", "start+24", "s10:start-5", "乾淨有兩把尺", "示意：要求到 ppb 等級", {"clean": "clean", "atom": "atom", "bad": "bad"})]}
P["s10"] = {"zoom": [{"to": "co", "at": "start-4", "dur": 1}], "shot": [shot("start-4", 40.0, 2.6, 56, 24, 1)],
 "overlay": [sec("precursor-co", "start-4", "s11:start-14", "供應商", "Merck 官網、Air Liquide 新聞稿、櫃買中心；截至 2026/11/27", {"few": "few", "de": "de", "fr": "fr", "tw": "tw"}, h=392, y=1000)]}
P["s11"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}], "shot": [shot("start-4", S1X, S1Y, S1D, 14, 1, yaw=0.0)],
 "run": [run("bubA", "start-8", FAR, 6), run("bubB", "start-8", FAR, 6), run("jackGlow", "start-8", FAR, 6), run("liqWarm", "start-8", FAR, 6), run("vapHi", "start-8", FAR, 6)],
 "overlay": [sec("precursor-next", "start+24", "s12:start-5", "接下來", "下一集：特用氣體", {"next": "next", "gas": "gas", "kw": "kw"})]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("tool", "前驅物送料系統（示意）", "PRECURSOR DELIVERY", "60 cm", "10 cm"), lv("co", "前驅物供應商", "PRECURSOR SUPPLIERS", "60 cm", "10 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-precursor", "prevEpisode": "2-13：濺鍍靶材", "title": "前驅物（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b",
                 "_說明": "旁白金手指：2.5＋Iapetus＋說明 B 原句（沉穩專業）；音高關卡 tts-pitch-take.sh；本支尚未配音"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["前驅物", "怎麼送？"], "sub": "原子層沉積的原料", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
    for w in ["FOUP", "EFEM", "負載鎖", "SCARA", "量測"]:
        if w in (s.get("narration") or "") + s["subtitle"]["zh"]: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
