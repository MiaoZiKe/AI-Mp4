"""tech-parts 腳本產生器：python3 videos/tech-parts/genscript.py → script.json（先跑 gen-model.mjs 產 model.json）
零組件耗材（科技透明圈 系列 2「代工的供應商」第 18 集；前一集 2-17：研磨墊；下一集 2-19：無塵室）。念稿定稿於 script.md（一字不改，念稿「矽」寫「細」）。
2D 卡：src/components/three/HudParts.tsx（parts-*）。構造與物理：physics-spec.md；模組清單：visual-spec.md。
Andy 規範：第 27 條念稿 ≤260 字、關鍵畫面念完留 ≥1.2 秒（holdSec／headSec）；第 28 條 ≥3 個比喻；第 29 條爆炸分解步驟做完；第 32 條出處列只放真實來源。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
BXB = INFO["bs"]["xb"]; COXB = INFO["co"]["xb"]; AXC = INFO["AX"]
XP, XK, XR, SX = 162, 210, 265, 96
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, 無聲幕長秒, 開口前只有畫面秒, 念完後最少只有畫面秒)
S = [
("s1", "hook", "機台腔體裡，還有哪些零件一直被消耗？前一集，研磨墊磨壞就換。",
 ["機台腔體裡", "還有哪些零件", "一直被消耗？", "前一集", "研磨墊磨壞", "就換"], ["Inside the chamber,", "which parts keep", "getting used up?", "Last episode:", "a worn pad", "gets replaced."],
 [("cham", "腔體"), ("used", "消耗"), ("prev", "前一集"), ("pad", "研磨墊")], ["腔體", "消耗", "研磨墊"], ["示意動畫，不是量測"], 6.0, 0.0, 1.2),
("s2", "mechanism", "蝕刻時腔體裡有電漿，像海浪不停拍礁石，晶圓之外，零件也一起被打薄。",
 ["蝕刻時", "腔體裡有電漿", "像海浪", "不停拍礁石", "晶圓之外", "零件也一起", "被打薄"], ["During etching,", "the chamber holds plasma,", "like waves", "pounding a reef.", "Beyond the wafer,", "parts get", "thinned too."],
 [("plasma", "電漿"), ("wave", "海浪"), ("reef", "礁石"), ("out", "之外"), ("thin", "被打薄")], ["電漿", "海浪", "打薄"], ["CoorsTek 蝕刻應用頁；示意動畫，不是量測"], 9.0, 0.3, 2.4),
("s3", "mechanism", "晶圓外圍有一圈環，用石英或矽做成。像把桌面往外多接一圈，邊緣的電漿才跟中間一樣均勻。",
 ["晶圓外圍有一圈環", "用石英或矽做成", "像把桌面", "往外多接一圈", "邊緣的電漿", "才跟中間一樣均勻"], ["Around the wafer sits a ring,", "made of quartz or silicon.", "Like extending a table", "outward by one more ring,", "so the edge plasma", "matches the middle."],
 [("wafer", "晶圓"), ("ring", "一圈環"), ("quartz", "石英"), ("table", "桌面"), ("ext", "往外"), ("even", "均勻")], ["圈環", "桌面", "均勻"], ["CoorsTek 蝕刻頁、Market Publishers 石英環報告；示意"], 10.0, 0.3, 1.9),
("s4", "mechanism", "晶圓躺在靜電吸盤，被靜電吸住，像摩擦過的氣球黏在牆。吸盤表面是陶瓷。",
 ["晶圓躺在", "靜電吸盤", "被靜電吸住", "像摩擦過的", "氣球黏在牆", "吸盤表面", "是陶瓷"], ["The wafer lies", "on the chuck,", "held by static,", "like a rubbed", "balloon on a wall.", "The chuck's surface", "is ceramic."],
 [("lie", "躺在"), ("chuck", "靜電吸盤"), ("clamp", "吸住"), ("balloon", "氣球"), ("face", "表面"), ("cer", "陶瓷")], ["靜電", "氣球", "陶瓷"], ["TechNews 2025/2/5 TOTO 靜電吸盤報導；示意動畫，不是量測"], 10.0, 0.3, 1.5),
("s5", "mechanism", "陶瓷也貼在腔體內壁，因為耐電漿，不容易掉渣。",
 ["陶瓷也貼在", "腔體內壁", "因為耐電漿", "不容易掉渣"], ["Ceramic also lines", "the chamber wall,", "because it resists plasma", "and rarely sheds grit."],
 [("wall", "內壁"), ("resist", "耐電漿"), ("shed", "掉渣")], ["陶瓷", "耐電漿", "掉渣"], ["CoorsTek 蝕刻應用頁；示意動畫，不是量測"], 6.0, 0.3, 1.3),
("s6", "mechanism", "這些零件被電漿慢慢打薄，尺寸一變，電漿就跟著變，所以用一段時間就要換。",
 ["這些零件", "被電漿慢慢打薄", "尺寸一變", "電漿就跟著變", "所以用一段時間", "就要換"], ["These parts are", "slowly thinned by plasma.", "Once the size changes,", "the plasma changes too,", "so after a while", "they must be replaced."],
 [("slow", "慢慢"), ("size", "尺寸"), ("plasma", "跟著變"), ("time", "一段時間"), ("swap", "要換")], ["打薄", "尺寸", "要換"], ["示意動畫，不是量測"], 9.0, 0.3, 2.4),
("s7", "mechanism", "旁邊的真空泵、閥門和電源，也要定期保養。",
 ["旁邊的真空泵", "閥門和電源", "也要定期保養"], ["Nearby, the vacuum pump,", "valves and power supply", "also need regular service."],
 [("pump", "真空泵"), ("valve", "閥門"), ("power", "電源"), ("serv", "保養")], ["真空泵", "閥門", "電源"], ["示意動畫，不是量測"], 6.5, 0.3, 1.4),
("s8", "payoff", "日本有東陶，台灣有台灣精材和翔名，都做這類耗材。",
 ["日本有東陶", "台灣有", "台灣精材", "和翔名", "都做這類耗材"], ["Japan has TOTO,", "Taiwan has", "Forcera Materials", "and Feedback Technology,", "all making such parts."],
 [("jp", "日本"), ("toto", "東陶"), ("tw", "台灣精材"), ("xm", "翔名"), ("kind", "這類")], ["東陶", "台灣精材", "翔名"], ["TechNews 2025/2/5、2/20；Money Weekly"], 6.5, 0.3, 1.3),
("s9", "cta", "零件和機台，都放在一個超乾淨的房間。下一集，看無塵室。留言耗材，拿完整資料。",
 ["零件和機台", "都放在一個", "超乾淨的房間", "下一集", "看無塵室", "留言耗材", "拿完整資料"], ["Parts and tools", "all sit in", "an ultra-clean room.", "Next episode:", "the cleanroom.", "Comment \"parts\"", "for the full notes."],
 [("parts", "零件"), ("mach", "機台"), ("clean", "超乾淨"), ("next", "下一集"), ("kw", "留言耗材")], ["超乾淨", "無塵室", "耗材"], ["示意動畫，不是量測"], 8.4, 0.2, 1.3),
]
def TTS(t):
    t = t.replace("上集", "上一集").replace("上一一集", "上一集").replace("矽", "細").replace("光罩", "光照")
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("上百片", "一百多片")]:
        t = t.replace(a, b)
    return t
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, dur, head, tail) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？]", "", z)) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？]", "", z)) >= 3, ("字幕短語 <3 字", sid, z)
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar)); hold = round(max(tail, dur - 0.2 - head - nch / 5.2), 1)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar), "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues], "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
scenes[0]["props"]["hook"] = {"kicker": "接上集：研磨墊磨壞就換", "title": "一直被打薄", "size": 120, "top": 236}
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "無塵室", "trail": ["零件會壞，工廠要乾淨"], "comment": "耗材", "logoAnim": "transparent"}}})
FAR = "s10:start+400"; T0 = "s1:start-40"
def run(i, at, until=None, ramp=6, **kw):
    d = {"id": i, "at": at, "ramp": ramp}
    if until: d["until"] = until
    d.update(kw); return d
def lab(part, text, en, color, at, until, xy=None, **kw):
    d = {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until, "cut": True}
    if xy: d["xy"] = xy
    d.update(kw); return d
DF = 1.8
YAW = [0.0]
def shot(at, x, y, d, elev, dur=30, yaw=None):
    o = {"at": at, "dur": dur, "x": x, "y": y, "d": round(d * DF, 1), "elev": elev}
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
def vis(lay, wins, dur=3):
    assert lay in LAYERS, lay
    prev = T0
    for a, b in wins:
        if a != T0: VIS.append(hid(lay, prev, a, dur))
        prev = b
    if prev != FAR: VIS.append(hid(lay, prev, FAR, dur))
C = "voice-3"; CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw): return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)
# ── 狀態層（每個狀態層只在該幕出現）──
for k in (1, 2, 3): pass
VIS += [hid("bSl3", "s3:start-2", FAR, 2, 1) if False else {"layer": "bSl3", "at": "s2:reef+6", "until": "s3:start-2", "opacity": 0, "dur": 20}]
VIS += [{"layer": "bSl2", "at": "s2:out+12", "until": "s3:start-2", "opacity": 0, "dur": 20}, {"layer": "bSl1", "at": "s2:thin", "until": "s3:start-2", "opacity": 0, "dur": 20}, {"layer": "bSl0", "at": "s2:thin+35", "until": "s3:start-2", "opacity": 0, "dur": 20}]
vis("bGauge0", [(T0, "s2:reef+6")]); vis("bGauge1", [("s2:reef+6", "s2:out+12")]); vis("bGauge2", [("s2:out+12", "s2:thin")]); vis("bGauge3", [("s2:thin", "s3:start-2")])
vis("bTopLine", [("s2:reef+6", "s3:start-2")]); vis("bSpark", [("s2:reef-2", "s3:start-2")])
# S 站：晶圓先在上方，念到躺在才落下；電荷與箭頭
VIS += [{"layer": "sWafer", "at": T0, "until": "s4:lie+2", "dur": 20, "dy": 4.0, "fallIn": True, "bounce": 0.07, "opacity": 0}] if False else []
VIS += [{"layer": "sWafer", "at": T0, "until": "s4:lie", "dur": 22, "dy": 4.0, "fallIn": True, "bounce": 0.07}]
# s4 爆炸（physics-spec §2.2）：①chuck 盤面＋晶圓一起上移（晶圓被吸在盤面上）→②clamp 電極露出、正負電荷亮、向下箭頭 →③balloon 電極層上移、露出氦氣層 →④balloon+18 氦氣層上移、與冷卻基座分開 →⑤face 組回（晶圓仍被吸住），face+24 起再壓一次
UP = ["sWafer", "sTop", "sArrows"]
VIS += [mv(l, "s4:chuck+10", "s4:cer+40", 22, dy=1.5) for l in UP]
VIS += [mv(l, "s4:balloon", "s4:cer+40", 20, dy=0.9) for l in UP + ["sElec"]]
VIS += [mv(l, "s4:balloon+18", "s4:cer+40", 20, dy=0.8) for l in UP + ["sElec", "sHe"]]
VIS += [mv(l, "s4:balloon+30", "s4:cer+40", 16, dy=0.7) for l in ("sWafer", "sArrows")]  # 晶圓再抬一點，露出晶圓與盤面之間的氦氣（組回後不顯示氦氣點，免得穿出晶圓）
vis("sArrows", [("s4:clamp-4", "s4:clamp+40"), ("s4:cer+62", "s4:cer+104")])
# A 站：s3 晶圓抬起、環抬起；s5 內襯拉開
VIS += [mv("pins", "s3:wafer", "s3:table-34", 22, dy=1.0), mv("wafer", "s3:wafer", "s3:table-34", 22, dy=1.0), mv("ring", "s3:ring", "s3:table-30", 24, dy=2.4)]
VIS += [mv("liner", "s5:start+12", "s5:resist-6", 26, dz=3.2)]
# C 站：更換（夾具與舊環一起抬起、移開；備用新環落到舊環位置）
SWP0 = 12
def W(n): return f"s6:time+{SWP0 + n}"
VIS += [mv("cArm", T0, FAR, 1, dy=4.0), mv("cArm", W(-6), FAR, 26, dy=-4.0), hid("cArm", T0, W(-10), 2, 0)]
VIS += [mv("cArm", W(20), FAR, 24, dy=3.0), mv("cORing", W(20), FAR, 24, dy=3.0), mv("cOldCrumb", W(20), FAR, 24, dy=3.0)]
VIS += [mv("cArm", W(52), FAR, 26, dx=9.0), mv("cORing", W(52), FAR, 26, dx=9.0, throw=1.0), mv("cOldCrumb", W(52), FAR, 26, dx=9.0)]
VIS += [hid("cORing", W(80), FAR, 6, 0), hid("cOldCrumb", W(80), FAR, 6, 0)]
VIS += [{"layer": "cNewRing", "at": T0, "until": W(74), "dur": 20, "dy": 5.0, "fallIn": True, "bounce": 0.06, "opacity": 0}]
vis("cPlO0", [(T0, "s6:plasma")]); vis("cPlO1", [("s6:plasma", FAR)]); vis("cPlO1S", [("s6:plasma", FAR)]); vis("cEdgeLine", [("s6:plasma", FAR)])
vis("cBrO", [("s6:slow+10", FAR)]); vis("cBrN", [("s6:slow+10", FAR)])
# K 站：念到才從幽靈變實體
# K 站：三座展台全程不透明（LOGO、國旗不准半透明）；念到哪家，哪家台面亮一下（kAHot／kBHot／kCHot）
# R 站：零件與機台
VIS += [hid("rParts", T0, "s9:parts-2", 4, 0.3), {"layer": "rTool", "at": T0, "until": "s9:mach-2", "dur": 22, "dy": 6.0, "fallIn": True, "bounce": 0.06, "opacity": 0}]
VIS += [hid("rTool", "s10:start+14", FAR, 4, 0), hid("rParts", "s10:start+14", FAR, 4, 0)]
# P 站：一次亮一件
actP = ("pPump", "pValve", "pPower")
# ═════ 各幕 ═════
P = {}
P["s1"] = {"shot": [shot("start-30", 0.4, 3.0, 40, 28, 1, yaw=0.0), shot("start", 0.4, 3.0, 38, 26, 140)], "shift": VIS,
 "run": [run("ionA0", "start-30", "s2:start+6", 4), run("ionA1", "start-30", "s2:start+6", 4), run("ionA2", "start-30", "s2:start+6", 4), run("plasmaGlow", "start-30", "s2:start+6", 6), run("liningHot", "used", "prev", 8), run("ringHot", "used", "prev", 8)],
 "labels": [lab("ringA", "邊緣環", "Edge ring", "amber", "used", "used+46")],
 "overlay": [sec("parts-hook", "start", nxt("s1"), "系列 2・第 18 集", "示意，非實際比例", {"prev": "prev", "pad": "pad", "used": "used"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "tool", "at": "start-14", "dur": 1}, {"to": "micro", "at": "reef-2", "dur": 1}],
 "shot": [shot("start", 0.4, 3.0, 38, 26, 1), shot("start+8", 0.4, 3.2, 32, 24, 40), shot("reef-2", 33.4, 1.1, 21, 22, 1)],
 "run": [run("ionA0", "start-30", "reef-2", 4), run("ionA1", "start-30", "reef-2", 4), run("ionA2", "start-30", "reef-2", 4), run("plasmaGlow", "start-30", "reef-2", 6)]
       + [run(f"bIon{i}", "reef-2", FAR, 6) for i in range(5)] + [run("bPlGlow", "reef-2", FAR, 6), run("bSparkP", "reef-2", FAR, 6), run("bDebris", "reef+6", FAR, 6), run("bDebris2", "reef+16", FAR, 6)],
 "labels": [lab("plasmaA", "電漿", "Plasma", "blue", "plasma", "plasma+46"), lab("bSpark", "離子撞擊", "Ion impact", "amber", "reef+3", "reef+47"), lab("bRing", "邊緣環", "Edge ring", "blue", "out+27", "out+73"), lab("bLineA", "被打掉的部分", "Material lost", "amber", "thin+34", "thin+80")],
 "overlay": [card("s2", "parts-wave", "電漿像海浪拍礁石", "示意", {"plasma": "plasma", "wave": "wave", "reef": "reef", "thin": "thin"})]}
P["s3"] = {"zoom": [{"to": "tool", "at": CC, "dur": 1}, {"to": "micro", "at": "table-4", "dur": 1}],
 "shot": [shot(CC, 0.2, 2.4, 32, 30, 1), shot("table-4", 33.4, 1.1, 21, 22, 1)],
 "run": [run("ionA0", "start", "table-30", 4), run("plasmaGlow", "start", "table-30", 6), run("bPlGlow", "table-4", FAR, 6), run("bField0", "table+6", FAR, 8), run("bField1", "table+16", FAR, 8), run("bRingGlow", "even", FAR, 8)],
 "labels": [lab("waferA", "晶圓", "Wafer", "blue", "wafer-4", "wafer+42"), lab("ringA", "邊緣環（石英或矽）", "Edge ring (quartz or silicon)", "amber", "ring+14", "table-11"), lab("bStep", "階梯內緣", "Stepped inner edge", "blue", "table+10", "table+56")],
 "overlay": [card("s3", "parts-ring", "桌面往外多接一圈", "示意（等位線為示意）", {"table": "table", "ext": "ext", "even": "even"})]}
P["s4"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, SX, 1.1, 19, 26, 1), shot("balloon+4", SX, 1.9, 19, 26, 20), shot("cer+40", SX, 0.1, 16.5, 40, 24)],
 "run": [run("sHeFlow", "balloon+30", "cer+40", 8), run("sHeFlow2", "balloon+30", "cer+40", 8), run("sPlusGlow", "clamp+10", "s4:end+30", 6), run("sMinusGlow", "clamp+10", "s4:end+30", 6), run("sArrowP", "clamp-4", "clamp+40", 4), run("sArrowP", "cer+62", "cer+104", 4), run("sWaterFlow", "cer+30", "s4:end+30", 8)],
 "labels": [lab("sWafer", "晶圓", "Wafer", "blue", "lie-6", "lie+39"), lab("sTop", "靜電吸盤", "Electrostatic chuck", "amber", "chuck+30", "chuck+75"), lab("sElec", "電極", "Electrode", "blue", "clamp+36", "clamp+81"), lab("sHeA", "氦氣冷卻", "Helium cooling", "blue", "balloon+42", "balloon+87"), lab("sTop", "陶瓷盤面", "Ceramic face", "amber", "cer+30", "cer+75")],
 "overlay": [card("s4", "parts-esc", "氣球黏牆：靜電吸附", "示意（施加電壓）", {"lie": "lie", "clamp": "clamp", "balloon": "balloon", "cer": "cer"})]}
P["s5"] = {"zoom": [{"to": "tool", "at": CC, "dur": 1}, {"to": "micro", "at": "resist-4", "dur": 1}],
 "shot": [shot(CC, 0.2, 3.4, 36, 24, 1), shot("resist-4", 128.0, 0.0, 33, 22, 1)],
 "run": [run("ionA0", "start", "resist-4", 4), run("plasmaGlow", "start", "resist-4", 6), run("eIonC", "resist-4", FAR, 6), run("eIonM", "resist-4", FAR, 6), run("eBounceC", "resist", FAR, 6), run("eDebrisM", "shed-20", FAR, 6), run("eSparkC", "resist", FAR, 6), run("eSparkM", "resist", FAR, 6)],
 "labels": [lab("linerA", "陶瓷內襯", "Ceramic liner", "amber", "start+8", "start+54"), lab("eCerA", "陶瓷：平整", "Ceramic: smooth", "blue", "resist+4", "resist+50"), lab("eMetA", "金屬：被打花", "Metal: pitted", "amber", "shed+13", "shed+59")],
 "overlay": [card("s5", "parts-liner", "耐電漿、不掉渣", "示意", {"wall": "wall", "resist": "resist", "shed": "shed"})]}
P["s6"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, 63.0, 0.1, 32, 22, 1)],
 "run": [run("cPlPulseN", "start", FAR, 6), run("cPlPulseO", "start", "plasma", 6), run("cPlPulseP", "plasma", FAR, 6), run("cIonN", "start", FAR, 6), run("cIonO", "start", "time", 6)],
 "labels": [lab("cNew", "新環", "New ring", "blue", "slow-28", "slow+17"), lab("cOld", "舊環", "Old ring", "amber", "size-1", "size+44"), lab("cPlO", "電漿邊緣偏移", "Plasma edge shifts", "amber", "plasma+8", "plasma+53"), lab("cArmA", "夾具換環", "Gripper swaps ring", "blue", "time+23", "time+68")],
 "overlay": [card("s6", "parts-wear", "尺寸變了，電漿跟著變", "示意（不標壽命時數）", {"slow": "slow", "size": "size", "plasma": "plasma", "swap": "swap"})]}
P["s7"] = {"zoom": [{"to": "aux", "at": CC, "dur": 1}],
 "shot": [shot(CC, XP - 0.6, 0.0, 25.5, 20, 1)],
 "run": [run("pFan", "start", FAR, 8), run("pExhaust", "start", FAR, 6), run("pPumpHot", "pump", "valve", 6), run("pValveHot", "valve", "power", 6), run("pWheel", "valve", FAR, 8), run("pPowerHot", "power", "s8:start", 6)],
 "labels": [lab("pPumpA", "真空泵", "Vacuum pump", "blue", "pump-12", "pump+32"), lab("pValveA", "閥門", "Valve", "amber", "valve+16", "valve+60"), lab("pPowerA", "射頻電源", "RF power supply", "blue", "power+45", "power+90")],
 "overlay": [card("s7", "parts-aux", "週邊也要定期保養", "示意", {"pump": "pump", "valve": "valve", "power": "power", "serv": "serv"})]}
P["s8"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [shot(CC, XK + 1.1, -0.7, 33, 22, 1)],
 "run": [run("kAHot", "toto-4", "toto+40", 4), run("kBHot", "tw-4", "tw+28", 4), run("kCHot", "xm-4", "xm+40", 4)],
 "overlay": [card("s8", "parts-co", "零組件耗材供應商", "TechNews、Money Weekly；截至 2026/11/27", {"jp": "jp", "toto": "toto", "tw": "tw", "xm": "xm"}, h=392, y=1000)]}
P["s9"] = {"zoom": [{"to": "room", "at": CC, "dur": 1}],
 "shot": [shot(CC, XR, 0.5, 40, 20, 1)],
 "run": [run(f"rAir{k}", "start-30", FAR, 8) for k in range(3)] + [run("rFfuPulse", "clean", FAR, 8)],
 "labels": [lab("rPartsA", "零件推車", "Parts cart", "amber", "parts", "parts+46"), lab("rToolA", "機台", "Tool", "blue", "mach+30", "mach+76"), lab("rFfuA", "潔淨空氣往下送", "Clean air flows down", "amber", "clean+40", "clean+86")],
 "overlay": [sec("parts-next", C, "s10:start", "接下來", "下一集：無塵室", {"next": "next", "kw": "kw", "clean": "clean"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])
lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("tool", "蝕刻腔體（示意）", "ETCH CHAMBER", "100 cm", "10 cm"), lv("micro", "零件剖面（示意）", "PART CROSS-SECTION", "10 cm", "1 cm"), lv("co", "耗材供應商", "SUPPLIERS", "100 cm", "10 cm"), lv("aux", "週邊設備（示意）", "SUPPORT EQUIPMENT", "100 cm", "10 cm"), lv("room", "無塵室（示意）", "CLEANROOM", "10 m", "1 m")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-parts", "prevEpisode": "2-17：研磨墊", "title": "零組件耗材（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b", "_說明": "旁白金手指：2.5＋Iapetus＋說明 B 原句；Andy 在 AI Studio 錄音；本支不送 TTS"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["零件", "一直被打薄"], "sub": "腔體裡被消耗的零件", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(sum(s["durationSec"] for s in scenes), 1), "秒")
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
