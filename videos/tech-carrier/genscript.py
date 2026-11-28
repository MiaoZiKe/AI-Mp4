"""tech-carrier 腳本產生器：python3 videos/tech-carrier/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
中游補充篇 M5：光罩盒與晶圓載具（前一集 M4 再生晶圓；下一集 M6 材料分析與故障分析）。念稿定稿於 script.md（頻道負責人 2026/11/28 核准，一字不改；
念稿「光照」＝字幕「光罩」）。2D 卡：src/components/three/HudCarrier.tsx（carrier-*）。構造：physics-spec.md；模組與拆解步驟：visual-spec.md。
有 timeline.json（silent-timeline 或正式對齊）時，最後會逐幕檢查標籤：一次一張、每張 ≥45 幀、不超出本幕。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
AS_OF = "2026/11/28"
S = [
("s1", "hook", "前一集說的密封盒，到底長什麼樣？怎麼擋灰塵？",
 ["前一集說的密封盒", "到底長什麼樣？", "怎麼擋灰塵？"],
 ["The sealed box from last episode:", "what does it look like?", "How does it keep dust out?"],
 [("prev", "前一集"), ("box", "密封盒"), ("look", "長什麼樣"), ("dust", "擋灰塵")], ["密封盒", "灰塵"], ["示意動畫，不是量測"]),
("s2", "mechanism", "廠裡用的叫晶圓盒，前面開門，一盒裝二十五片，像抽屜櫃。",
 ["廠裡用的叫晶圓盒", "前面開門", "一盒裝二十五片", "像抽屜櫃"],
 ["In fabs it's called a FOUP,", "opening at the front,", "holding 25 wafers per box,", "like a chest of drawers."],
 [("foup", "晶圓盒"), ("door", "前面開門"), ("n25", "二十五片"), ("drawer", "抽屜櫃")], ["晶圓盒", "二十五片", "抽屜櫃"],
 ["Wikipedia「FOUP」；Entegris FOUP 規格書；示意"]),
("s3", "mechanism", "盒底有三道溝，卡進機台的三顆凸點，一放就對準。",
 ["盒底有三道溝", "卡進機台的", "三顆凸點", "一放就對準"],
 ["Three grooves under the box", "drop onto the tool's", "three round pins,", "and it lines up by itself."],
 [("groove", "三道溝"), ("pins", "三顆凸點"), ("align", "一放就對準")], ["三道溝", "三顆凸點", "對準"],
 ["USPTO 7866480、7201276；示意動畫"]),
("s4", "mechanism", "軌道車從天花板把盒子吊到機台前，盒門跟機台一起開，晶圓不碰外面空氣。",
 ["軌道車從天花板", "把盒子吊到機台前", "盒門跟機台一起開", "晶圓不碰外面空氣"],
 ["A cart on a ceiling rail", "lowers the box to the tool;", "box door and tool door open together,", "so wafers never touch outside air."],
 [("rail", "軌道車"), ("ceil", "天花板"), ("hang", "吊到"), ("door", "盒門"), ("open", "一起開"), ("air", "外面空氣")], ["軌道車", "一起開", "空氣"],
 ["USPTO 9136149、10501271；示意動畫"]),
("s5", "mechanism", "排隊等的時候灌氮氣，趕走濕氣和氧氣，像餅乾罐放乾燥劑。",
 ["排隊等的時候", "灌氮氣", "趕走濕氣和氧氣", "像餅乾罐放乾燥劑"],
 ["While waiting in line,", "it's filled with nitrogen", "to drive out moisture and oxygen,", "like a desiccant in a cookie jar."],
 [("wait", "排隊"), ("n2", "灌氮氣"), ("moist", "濕氣"), ("o2", "氧氣"), ("jar", "餅乾罐")], ["氮氣", "濕氣", "餅乾罐"],
 ["USPTO 9508579、9174253、10923372；示意"]),
("s6", "twist", "送客戶換出貨盒，少開門，重點是防撞防震，像蛋盒。",
 ["送客戶換出貨盒", "少開門", "重點是防撞防震", "像蛋盒"],
 ["Shipping to customers uses a FOSB;", "its door rarely opens,", "the point is shock protection,", "like an egg carton."],
 [("ship", "送客戶"), ("fosb", "出貨盒"), ("less", "少開門"), ("shock", "防撞防震"), ("egg", "蛋盒")], ["出貨盒", "防撞防震", "蛋盒"],
 ["USPTO 7299603、10388554；示意動畫"]),
("s7", "mechanism", "光罩也有專屬盒子，極紫外光用的有兩層，進真空機台才打開。",
 ["光罩也有專屬盒子", "極紫外光用的", "有兩層", "進真空機台才打開"],
 ["Photomasks get their own pods;", "the EUV ones", "have two layers,", "opened only inside the vacuum tool."],
 [("mask", "光罩"), ("pod", "專屬盒子"), ("euv", "極紫外光"), ("two", "兩層"), ("vac", "真空機台"), ("open", "才打開")], ["光罩", "兩層", "真空"],
 ["Entegris EUV Pod 產品頁；USPTO 12730371"]),
("s8", "twist", "盒子自己也怕髒，塑膠會吸水放氣，所以用高純度塑膠，還要定期洗。",
 ["盒子自己也怕髒", "塑膠會吸水放氣", "所以用高純度塑膠", "還要定期洗"],
 ["The boxes get dirty too:", "plastic absorbs water and outgasses,", "so high-purity plastic is used,", "and they're washed regularly."],
 [("dirty", "怕髒"), ("absorb", "吸水"), ("out", "放氣"), ("pure", "高純度塑膠"), ("wash", "定期洗")], ["怕髒", "吸水放氣", "定期洗"],
 ["Entegris FOUP 規格書；USPTO 10923372"]),
("s9", "payoff", "台灣有家登，光罩盒起家，晶圓盒也是主力。中勤也是台灣廠，自有品牌做晶圓盒。",
 ["台灣有家登", "光罩盒起家", "晶圓盒也是主力", "中勤也是台灣廠", "自有品牌做晶圓盒"],
 ["In Taiwan, Gudeng", "started with mask pods;", "FOUPs are now a mainstay too.", "CKplas is also a Taiwanese maker,", "making FOUPs under its own brand."],
 [("tw", "台灣"), ("gd", "家登"), ("mask", "光罩盒起家"), ("foup", "晶圓盒也是主力"), ("ck", "中勤"), ("own", "自有品牌")], ["家登", "中勤", "晶圓盒"],
 ["工商時報、財報狗；中勤官網、Digitimes"]),
("s10", "cta", "盒子再乾淨，晶片還是會壞。壞在哪，要靠分析找出來，下一集看故障分析。留言晶圓盒，拿完整資料。",
 ["盒子再乾淨", "晶片還是會壞", "壞在哪", "要靠分析找出來", "下一集看故障分析", "留言晶圓盒", "拿完整資料"],
 ["However clean the box,", "chips still fail.", "Where did it fail?", "Analysis has to find out.", "Next: failure analysis.", "Comment \"FOUP\"", "for the full notes."],
 [("clean", "再乾淨"), ("bad", "會壞"), ("where", "壞在哪"), ("anal", "分析找出來"), ("next", "下一集"), ("fa", "故障分析"), ("kw", "留言晶圓盒")], ["會壞", "故障分析", "晶圓盒"],
 ["示意動畫，不是量測"]),
]
def TTS(t):
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("矽", "細"), ("光罩", "光照")]:
        t = t.replace(a, b)
    return t
RATE = 4.5   # 第 13 條：含停頓 4.3～4.6 字／秒（無聲估計用；正式配音後依對齊覆蓋）
scenes = []
HOLD = {"s1": 0.6, "s3": 0.7, "s4": 0.7, "s7": 0.7, "s9": 0.7, "s2": 0.6}   # 第 39 條：holdSec ≤0.7
for i, (sid, beat, nar, zh, en, cues, kws, src) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert 3 <= len(re.sub(r"[ ，。？、；]", "", z)) <= 11, (sid, z)
    for e in en: assert len(e) <= 42, (sid, e)
    assert re.sub(r"[ ，。？、；：]", "", "".join(zh)) == re.sub(r"[ ，。？、；：]", "", nar), (sid, "字幕和念稿不同")
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar))
    head = 0.0 if sid == "s1" else 0.3
    hold = HOLD.get(sid, 0.6)
    dur = round(head + nch / RATE + 0.2 + hold, 1)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
md = open(os.path.join(HERE, "script.md")).read().split("---")[0].split("\n\n")[1:]
paras = [p.strip() for p in md if p.strip()]
assert [s["narration"] for s in scenes] == paras, ("念稿與 script.md 不同", [s["narration"] for s in scenes], paras)
scenes[0]["props"]["hook"] = {"kicker": "接上集：再生晶圓", "title": "晶圓盒長怎樣？", "size": 92, "top": 236}
scenes.append({"id": "s11", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "材料分析與故障分析", "trail": ["光罩盒與晶圓載具：盒子擋灰塵、氮氣、防震"], "comment": "晶圓盒", "logoAnim": "transparent"}}})

# ═════════ 工具（同 tech-reclaim）═════════
FAR = "s11:start+400"
T0 = "s1:start-40"
def run(i, at, until=None, ramp=6, **kw):
    d = {"id": i, "at": at, "ramp": ramp}
    if until: d["until"] = until
    d.update(kw); return d
def lab(part, text, en, color, at, until, xy=None, **kw):
    d = {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until, "cut": True}
    if xy: d["xy"] = xy
    d.update(kw); return d
def shot(at, x, y, d, elev, dur=30):
    return {"at": at, "dur": dur, "x": x, "y": y, "d": d, "elev": elev}
def hid(lay, a, b, dur=10, o=0): return {"layer": lay, "at": a, "until": b, "opacity": o, "dur": dur}
def sec(kind, at, until, title, tag, t=None, y=1066, h=330, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag}
    if t is not None: d["t"] = {k: {"at": v} for k, v in t.items()}
    d.update(kw); return d
LAYERS = [l["id"] for l in MODEL["layers"] if not l.get("bg")]
VIS = []
def move(lay, a, b, dur=22, **kw):
    assert lay in LAYERS, lay
    d = {"layer": lay, "at": a, "until": b, "dur": dur}; d.update(kw); VIS.append(d)
C = "voice-3"
CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw):
    return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)

# ── 站 B：s2 先停組好的盒子 → 前門沿 +z 退出 → 盒殼往上抬、頂部法蘭再往上 → 逐層標名 → 盒殼與法蘭落回、前門推回（換幕前落定）──
REASM = "s2:n25+42"
move("bD", "s2:door-18", "s2:n25+58", 14, dx=INFO["B_DDX"], dz=INFO["B_DDZ"])
move("bS", "s2:door+8", REASM, 18, dy=INFO["B_SHELL"])
move("bT", "s2:door+8", REASM, 18, dy=INFO["B_SHELL"])
move("bT", "s2:door+16", "s2:n25+36", 14, dy=INFO["B_TOP"] - INFO["B_SHELL"])
# ── 站 C：s3 盒子從偏一點的位置往下（加減速）→ 溝壁碰到圓頭銷 → 水平滑到正中定位 ──
move("cFoup", T0, "s3:align-8", 20, dy=INFO["C_DROP"])
move("cFoup", T0, "s3:align+12", 12, dx=INFO["C_OFFX"], dz=INFO["C_OFFZ"])
# ── 站 D：s4 天車從右開過來 → 皮帶放下（盒子、夾爪、五段皮帶同一條緩動，皮帶一段段伸出車體）→ 夾爪張開收回 → 定位板帶盒子往機台靠 →
#    兩扇門一起往機台內退、沿導軌下降 → 第二節臂與叉子伸進盒裡、抬一點、退出（晶圓跟著叉子出來）──
NB = INFO["NBELT"]; DD = INFO["D_DROP"]
FOUPL = ["dB", "dS", "dT", "dD", "dK"]
GRIPL = ["dGrip", "dJawL", "dJawR"]
BELTL = [f"dBelt{k}" for k in range(1, NB + 1)]
for L in ["dVeh"] + GRIPL + BELTL + FOUPL: move(L, T0, "s4:rail+4", 34, dx=6.0)
for L in GRIPL + FOUPL: move(L, T0, "s4:hang-8", 30, dy=DD)
for k, L in enumerate(BELTL, 1): move(L, T0, "s4:hang-8", 30, dy=round(DD * k / NB, 3))
move("dJawL", "s4:hang+24", FAR, 6, dz=-0.36); move("dJawR", "s4:hang+24", FAR, 6, dz=0.36)
for L in GRIPL: move(L, "s4:hang+32", FAR, 26, dy=DD)
for k, L in enumerate(BELTL, 1): move(L, "s4:hang+32", FAR, 26, dy=round(DD * k / NB, 3))
for L in ["dDock"] + FOUPL: move(L, "s4:hang+38", FAR, 14, dx=-INFO["D_DOCK"])
for L in ["dD", "dPD"]:
    move(L, "s4:open-10", FAR, 12, dx=-INFO["D_DOOR_X"]); move(L, "s4:open+4", FAR, 20, dy=-INFO["D_DOOR_Y"])
move("dArm2", "s4:air-22", "s4:air+8", 20, dx=INFO["D_EXT2"]); move("dFork", "s4:air-22", "s4:air+8", 20, dx=INFO["D_EXT"])
move("dFork", "s4:air-1", FAR, 8, dy=INFO["D_LIFT"]); move("dK", "s4:air-1", FAR, 8, dy=INFO["D_LIFT"])
move("dK", "s4:air+8", FAR, 20, dx=-INFO["D_EXT"])
# ── 站 G：s7 外盒殼往上（在機台外打開）→ 金屬內盒沿軌道送進真空腔 → 艙門關 → 內盒上蓋抬起一半、光罩留在底板 ──
move("gOshell", "s7:euv-4", FAR, 22, dy=INFO["G_OUT"])
for L in ["gIn", "gIc"]: move(L, "s7:two+2", FAR, 30, dx=INFO["G_IN"])
move("gGate", T0, "s7:two+34", 14, dy=INFO["G_GATE"])
move("gIc", "s7:open-8", FAR, 16, dy=INFO["G_CUP"])

# ═════ 各幕鏡頭（看向 x, y, 距離, 仰角）═════
# 鏡頭依本站要看到的所有物件（含移動終點）的高度範圍算：主素材整個落在字幕上方的 2D 卡之上（第 2 條反覆扣分：主體被畫面邊切／被卡蓋住）
AV = (INFO["AX"], 3.0, 34, 12)
BV = (INFO["BX"], 3.0, 36, 10)
CV = (INFO["CX"], 3.2, 28, -6)
DV = (INFO["LPX"] - 0.4, 6.0, 66, 6)
EV = (INFO["EX"] + 1.6, 2.9, 36, 10)
FV = (INFO["FX"] - 1.1, 2.3, 42, 12)
GV = (INFO["GX"] + 3.7, 2.6, 39, 12)
HV = (INFO["HX"] + 0.9, 3.1, 38, 8)
TV = (INFO["TX"] + 0.9, 1.4, 38, 12)
NV = (INFO["NX"], 1.3, 26, 26)
def S_(at, v, dur=30): return shot(at, v[0], v[1], v[2], v[3], dur)
P = {}
# 標籤一次只亮一張、每張 ≥45 幀（第 13 條）；cue 間隔 <45 幀的併成一張
P["s1"] = {"shot": [S_("start-30", AV, 1)], "shift": VIS,
 "run": [run("aDust", "start", "s2:start", 1), run("aDust2", "start", "s2:start", 1)],
 "labels": [lab("aBoxA", "密封盒：裝晶圓來回送", "Sealed box: carries wafers", "blue", "start+2", "look+16"),
            lab("aDoorA", "門封住：灰塵擋在外面", "Sealed door keeps dust out", "amber", "look+19", "s2:start")],
 "overlay": [sec("carrier-hook", "start", nxt("s1"), "中游補充篇・M5", "示意", {"prev": "prev", "box": "box", "look": "look", "dust": "dust"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "foup", "at": CC, "dur": 1}],
 "shot": [S_(CC, BV, 1)],
 "labels": [lab("bTopA", "頂部法蘭：天車抓這裡", "Top flange: the hoist grips here", "blue", "start+6", "door-6"),
            lab("bDoorA", "前門＋四周密封條", "Front door + seal", "amber", "door-4", "n25-6"),
            lab("bShellA", "兩側 25 道槽齒，一格一片", "25 slots per side, one wafer each", "blue", "n25-4", REASM)],
 "overlay": [card("s2", "carrier-drawer", "晶圓盒：前開門、一盒 25 片", "示意", {"foup": "foup", "door": "door", "n25": "n25", "drawer": "drawer"})]}
P["s3"] = {"zoom": [{"to": "kc", "at": CC, "dur": 1}],
 "shot": [S_(CC, CV, 1)],
 "labels": [lab("cGrA", "盒底三道放射溝", "Three radial grooves", "blue", "groove-4", "groove+41"),
            lab("cPinA", "機台三顆圓頭銷", "Three round-head pins", "amber", "groove+43", "align+5"),
            lab("cFoupA", "一放下：自己滑到定位", "Set down: it slides into place", "blue", "align+7", "s4:start")],
 "overlay": [card("s3", "carrier-kc", "盒底：三道溝對三顆凸點", "示意（仰視）", {"groove": "groove", "pins": "pins", "align": "align"})]}
P["s4"] = {"zoom": [{"to": "oht", "at": CC, "dur": 1}],
 "shot": [S_(CC, DV, 1)],
 "labels": [lab("dOhtA", "天車（OHT）：天花板軌道", "Overhead hoist transport (OHT)", "blue", "rail+2", "hang-4"),
            lab("dPortA", "承載埠（Load port）", "Load port", "amber", "hang-2", "open-12"),
            lab("dDoorA", "盒門＋機台門一起開", "Box door + tool door open together", "blue", "open-10", "air-10"),
            lab("dArmA", "手臂取片：不碰外面空氣", "Robot picks a wafer inside", "amber", "air-8", "s5:start")],
 "overlay": [card("s4", "carrier-oht", "天車 → 承載埠 → 開門取片", "示意", {"rail": "rail", "ceil": "ceil", "hang": "hang", "door": "door", "open": "open", "air": "air"})]}
P["s5"] = {"zoom": [{"to": "purge", "at": CC, "dur": 1}],
 "shot": [S_(CC, EV, 1)],
 "run": [run("eN2Pipe", "n2-6", "s6:start", 6), run("eN2", "n2-2", "s6:start", 6),
         run("eWet1", "n2+10", "o2+6", 4), run("eWet2", "n2+12", "jar+10", 4), run("eO2a", "n2+10", "jar-4", 4), run("eO2b", "n2+14", "s6:start-4", 4)],
 "labels": [lab("eFoupA", "等待架上的晶圓盒", "A FOUP waiting on the shelf", "blue", "start", "n2-2"),
            lab("eN2A", "盒底進氣嘴：灌氮氣", "Nitrogen in through the base", "amber", "n2", "jar-6"),
            lab("eGasA", "閥件＋流量計控制氮氣", "Valve + flowmeter", "blue", "jar-2", "s6:start")],
 "overlay": [card("s5", "carrier-purge", "排隊時灌氮氣：趕走濕氣和氧氣", "示意", {"wait": "wait", "n2": "n2", "moist": "moist", "o2": "o2", "jar": "jar"})]}
P["s6"] = {"zoom": [{"to": "fosb", "at": CC, "dur": 1}],
 "shot": [S_(CC, FV, 1)],
 "run": [run("fBump", "start", "s7:start", 10), run("fBumpBox", "start", "s7:start", 10)],
 "labels": [lab("fFosbA", "出貨盒（FOSB）：少開門", "FOSB: door rarely opened", "blue", "fosb-4", "shock-6"),
            lab("fFoamA", "泡棉＋紙箱托住：防撞防震", "Foam + carton absorb the bumps", "amber", "shock-4", "s7:start")],
 "overlay": [card("s6", "carrier-egg", "出貨盒：防撞防震，像蛋盒", "示意", {"ship": "ship", "fosb": "fosb", "less": "less", "shock": "shock", "egg": "egg"})]}
P["s7"] = {"zoom": [{"to": "pod", "at": CC, "dur": 1}],
 "shot": [S_(CC, GV, 1)],
 "labels": [lab("gOutA", "外盒（高分子）：機台外打開", "Outer pod opens outside the tool", "blue", "euv-4", "two-6"),
            lab("gInA", "金屬內盒：送進真空腔", "Metal inner pod goes into vacuum", "amber", "two-4", "vac+21"),
            lab("gRetA", "真空裡才開：光罩", "Opened only in vacuum: the mask", "blue", "vac+23", "s8:start")],
 "overlay": [card("s7", "carrier-pod", "極紫外光光罩盒：兩層", "示意", {"mask": "mask", "pod": "pod", "euv": "euv", "two": "two", "vac": "vac", "open": "open"})]}
P["s8"] = {"zoom": [{"to": "clean", "at": CC, "dur": 1}],
 "shot": [S_(CC, HV, 1)],
 "run": [run("hSoak", "absorb-6", "out+4", 6), run("hOut", "out", "pure+16", 6), run("hSpin", "pure", "s9:start", 12),
         run("hMist", "pure+4", "s9:start", 6), run("hMist2", "pure+4", "s9:start", 6), run("hHot", "wash+8", "s9:start", 6)],
 "labels": [lab("hShA", "塑膠盒殼：會吸水、放氣", "Plastic shell absorbs and outgasses", "blue", "dirty", "pure-4"),
            lab("hNozA", "清洗機：噴嘴陣列＋旋轉架", "Washer: nozzle array + rotating rack", "amber", "pure-2", "s9:start")],
 "overlay": [card("s8", "carrier-clean", "盒子也怕髒：高純度塑膠＋定期洗", "示意", {"dirty": "dirty", "absorb": "absorb", "out": "out", "pure": "pure", "wash": "wash"})]}
P["s9"] = {"zoom": [{"to": "tw", "at": CC, "dur": 1}],
 "shot": [S_("start", TV, 1)],
 "labels": [lab("tFabA", "載具廠（示意）", "Carrier plant (illustrative)", "blue", "gd", "s10:start")],
 "overlay": [card("s9", "carrier-tw", "台灣的晶圓盒與光罩盒廠", "媒體報導；截至 2026/11/28", {"tw": "tw", "gd": "gd", "mask": "mask", "foup": "foup", "ck": "ck", "own": "own"})]}
P["s10"] = {"zoom": [{"to": "next", "at": CC, "dur": 1}],
 "shot": [S_("start", NV, 1)],
 "run": [run("nHotGlow", "bad", "s11:start", 4), run("nScan", "anal-12", "s11:start", 8)],
 "labels": [lab("nPkgA", "封裝晶片：四邊接腳", "Packaged chip: leads on four sides", "blue", "start+6", "bad-4"),
            lab("nHotA", "熱點：這裡壞了", "Hot spot: the failure", "amber", "bad-2", "anal-4"),
            lab("nMagA", "放大鏡掃過：找出壞點", "Scan to find the fault", "blue", "anal-2", "s11:start")],
 "overlay": [sec("carrier-next", C, "s11:start", "下一集：材料分析與故障分析", "留言「晶圓盒」", {"clean": "clean", "bad": "bad", "where": "where", "anal": "anal", "next": "next", "fa": "fa", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": f"查證截至 {AS_OF}", "noteAlways": True}
levels = [lv("start", "密封盒（示意）", "SEALED CARRIER", "60 cm", "5 cm"), lv("foup", "晶圓盒（FOUP）拆解（示意）", "FOUP", "60 cm", "5 cm"),
          lv("kc", "盒底對位（示意）", "KINEMATIC COUPLING", "60 cm", "5 cm"), lv("oht", "天車與承載埠（示意）", "OHT / LOAD PORT", "2 m", "20 cm"),
          lv("purge", "氮氣吹淨（示意）", "N2 PURGE", "1 m", "10 cm"), lv("fosb", "出貨盒（FOSB）運送（示意）", "FOSB SHIPPING", "1 m", "10 cm"),
          lv("pod", "雙層光罩盒（示意）", "EUV DUAL POD", "1 m", "10 cm"), lv("clean", "盒子清洗機（示意）", "CARRIER WASHER", "1 m", "10 cm"),
          lv("tw", "台灣載具廠", "TAIWAN MAKERS", "100 m", "10 m"), lv("next", "晶片故障（下一集）", "NEXT", "5 cm", "5 mm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-carrier", "prevEpisode": "M4：再生晶圓", "title": "光罩盒與晶圓載具（科技透明圈）", "asOf": AS_OF, "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "中游補充篇", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["光罩盒與晶圓載具", "晶圓一路不碰灰塵"], "sub": "晶圓盒→天車→氮氣→出貨盒→光罩盒", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
for s in scenes:
    t = s.get("tts") or ""
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9]", t): bad.append((s["id"], "數字"))
    for w in ["量測", "矽", "光罩"]:
        if w in t: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))

# ═════ 標籤節奏自查（有 timeline.json 才做）：一次一張、每張 ≥45 幀、不跨出本幕 ═════
TLP = os.path.join(HERE, "timeline.json")
if os.path.exists(TLP):
    TL = {s["id"]: s for s in json.load(open(TLP))["scenes"]}
    def res(tok, sid):
        m = re.match(r"^(?:(s\d+):)?([A-Za-z0-9]+)([+-]\d+)?$", tok)
        sc, base, off = m.group(1) or sid, m.group(2), int(m.group(3) or 0)
        t = TL[sc]
        if base == "start": f = t["startFrame"]
        elif base == "voice": f = t["voiceStartFrame"]
        elif base == "end": f = t["startFrame"] + t["durationFrames"]
        else: f = next(c["frame"] for c in t["cues"] if c["id"] == base)
        return f + off
    probs = []
    for s in scenes:
        labs = s["props"].get("labels", [])
        if not labs: continue
        t = TL[s["id"]]; end = t["startFrame"] + t["durationFrames"]
        iv = [(res(l["at"], s["id"]), res(l["until"], s["id"]), l["text"]) for l in labs]
        for a, b, tx in iv:
            if b - a < 45: probs.append((s["id"], tx, "只亮", b - a, "幀"))
            if b > end + 4: probs.append((s["id"], tx, "超出本幕", b - end))
        for (a1, b1, t1), (a2, b2, t2) in zip(iv, iv[1:]):
            if a2 < b1: probs.append((s["id"], t1, t2, "重疊", b1 - a2))
        print(f"  {s['id']} {t['startFrame']}–{end}（{t['durationFrames']}f）標籤", [(a - t["startFrame"], b - t["startFrame"]) for a, b, _ in iv])
    print("標籤自查：", probs if probs else "OK")
