"""tech-probe1 腳本產生器：python3 videos/tech-probe1/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
探針卡-1：幾萬根針一次戳一整片（科技透明圈 系列 2 第 21 集；前一集 2-20 水氣電；下一集 2-22 探針卡-2）。念稿定稿於 script.md（**一字不改**）。
旁白、cue、字幕、hook、片尾卡、hud、voice 與各幕 3D 動作（shot／shift／run／labels／overlay）都在這支；cue 來自 timeline.json，配音後重跑本檔即可。
2D 卡：src/components/three/HudProbe1.tsx（probe1-*）。構造與物理：physics-spec.md；模組清單：visual-spec.md。
規範：Andy 第 13 條（每幕 ≥4.5 秒、標籤 ≥1.5 秒一次一張）、第 27 條（念完留白 holdSec）、第 28 條（比喻都有畫面）、第 29 條（爆炸分解全部做完）、第 32 條（出處列只放真實來源）。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, 無聲幕長秒, 開口前只有畫面秒, 念完後最少只有畫面秒)
S = [
("s1", "hook", "哪顆晶片是好的，怎麼知道？前一集水氣電備齊，晶圓做完了，一片有好幾百顆晶片。",
 ["哪顆晶片是好的", "怎麼知道？", "前一集水氣電備齊", "晶圓做完了", "一片有好幾百顆晶片"], ["Which chips are good?", "How do we know?", "Last episode: utilities in place,", "the wafers are done,", "each holds hundreds of chips."],
 [("q", "哪顆"), ("know", "怎麼知道"), ("prev", "前一集"), ("done", "晶圓做完"), ("many", "好幾百顆")], ["哪顆", "前一集", "好幾百顆"], ["示意動畫，不是量測（每片晶片數依晶片大小而異）"], 7.9, 0.0, 1.2),
("s2", "mechanism", "切開之前，先一顆顆通電測試，叫晶圓測試。",
 ["切開之前", "先一顆顆通電測試", "叫晶圓測試"], ["Before dicing,", "each chip is powered and tested,", "called wafer test."],
 [("cut", "切開"), ("each", "一顆顆"), ("name", "晶圓測試")], ["切開之前", "通電測試", "晶圓測試"], ["專利 USPTO 5909121、6130545；示意"], 5.6, 0.3, 1.3),
("s3", "mechanism", "靠的是探針卡。它像一枚針很多的印章，一次蓋下去，每根針碰一個接點。",
 ["靠的是探針卡", "它像一枚", "針很多的印章", "一次蓋下去", "每根針碰一個接點"], ["It relies on the probe card.", "It's like a", "stamp full of needles:", "press once,", "and each needle touches one pad."],
 [("card", "探針卡"), ("stamp", "印章"), ("down", "蓋下去"), ("each", "每根針")], ["探針卡", "印章", "接點"], ["專利 USPTO 5909121、6130545；示意動畫，不是量測"], 8.4, 0.3, 1.6),
("s4", "mechanism", "接點的間距，小到比一根頭髮還窄。",
 ["接點的間距", "小到比一根頭髮還窄"], ["The pad spacing", "is narrower than a hair."],
 [("gap", "間距"), ("hair", "頭髮")], ["間距", "頭髮"], ["專利 US9194887；BioNumbers 106856；示意"], 6.9, 0.0, 1.2),
("s5", "mechanism", "針有彈性，像彈簧筆，壓下去會彎。這樣每根針的壓力才平均。",
 ["針有彈性", "像彈簧筆", "壓下去會彎", "這樣每根針的", "壓力才平均"], ["The needles are springy,", "like a spring-loaded pen:", "they bend when pressed,", "so every needle's", "force evens out."],
 [("spring", "彈性"), ("pen", "彈簧筆"), ("bend", "壓下去"), ("even", "平均")], ["彈性", "彈簧筆", "平均"], ["專利 USPTO 5909121（探針受壓彎曲）；示意動畫，不是量測"], 7.6, 0.3, 1.3),
("s6", "mechanism", "接點表面有層氧化膜，不導電。針會輕輕刮動，像用指甲刮掉生鏽處，才接通電。",
 ["接點表面", "有層氧化膜", "不導電", "針會輕輕刮動", "像用指甲", "刮掉生鏽處", "才接通電"], ["The pad surface", "has an oxide film", "that doesn't conduct.", "The needle scrubs gently,", "like a fingernail", "scraping off rust,", "and then current flows."],
 [("ox", "氧化膜"), ("insul", "不導電"), ("scrub", "刮動"), ("nail", "指甲"), ("on", "接通電")], ["氧化膜", "刮動", "指甲"], ["專利 USPTO 5909121、6121058；示意動畫"], 8.6, 0.3, 1.4),
("s7", "mechanism", "針的做法在進化，從斜插的粗針，到垂直站著，再到半導體技術做的微針。",
 ["針的做法在進化", "從斜插的粗針", "到垂直站著", "再到半導體", "技術做的微針"], ["Needle designs evolved:", "from slanted thick needles,", "to needles standing upright,", "and then to", "chip-process micro needles."],
 [("evo", "進化"), ("cant", "斜插"), ("vert", "垂直"), ("mems", "微針")], ["斜插", "垂直", "微針"], ["數位時代 84752；專利 US9194887；示意"], 7.8, 0.3, 1.2),
("s8", "mechanism", "一張卡的針，可以多到好幾萬根。針越多，越難壓得一樣平。",
 ["一張卡的針", "可以多到好幾萬根", "針越多", "越難壓得一樣平"], ["One card's needles", "can reach tens of thousands.", "The more needles,", "the harder to press them evenly."],
 [("card8", "一張卡"), ("many", "好幾萬根"), ("more", "針越多"), ("flat", "一樣平")], ["好幾萬根", "針越多", "一樣平"], ["數位時代 84752（報導）；示意"], 7.8, 0.3, 1.5),
("s9", "mechanism", "針的後面是測試機。像出題老師，送訊號進去，看晶片答對沒有。",
 ["針的後面", "是測試機", "像出題老師", "送訊號進去", "看晶片答對沒有"], ["Behind the needles", "is the tester,", "like a teacher setting questions:", "it sends signals in", "and checks the chip's answers."],
 [("tester", "測試機"), ("teacher", "出題老師"), ("send", "送訊號"), ("ans", "答對")], ["測試機", "出題老師", "答對"], ["專利 USPTO 5909121、6130545；示意動畫，不是量測"], 7.4, 0.3, 1.3),
("s10", "cta", "沒通過的晶片，會被標記起來。這麼精細的卡，誰做的？下一集看。留言探針卡，拿完整資料。",
 ["沒通過的晶片", "會被標記起來", "這麼精細的卡", "誰做的？", "下一集看", "留言探針卡", "拿完整資料"], ["Chips that fail", "get marked.", "Such a precise card:", "who makes it?", "Next episode.", "Comment \"probe card\"", "for the full notes."],
 [("fail", "沒通過"), ("mark", "標記"), ("who", "誰做的"), ("next", "下一集"), ("kw", "留言探針卡")], ["沒通過", "標記", "探針卡"], ["專利 USPTO 4928002；示意"], 8.2, 0.2, 1.2),
]
def TTS(t):
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("矽", "細"), ("光罩", "光照")]:
        t = t.replace(a, b)
    return t
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, dur, head, tail) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？]", "", z)) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？]", "", z)) >= 3, ("字幕短語 <3 字會被併入下一段、英文對位跑掉", sid, z)
    assert re.sub(r"[，。？]", "", "".join(zh)) == re.sub(r"[，。？]", "", nar), (sid, "字幕和念稿不同")
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar)); hold = round(max(tail, dur - 0.2 - head - nch / 5.2), 1)
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
scenes[0]["props"]["hook"] = {"kicker": "接上集：水氣電備齊", "title": "哪顆是好的？", "size": 120, "top": 236}
scenes.append({"id": "s11", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "誰做探針卡", "trail": ["幾萬根針，一次蓋下去"], "comment": "探針卡", "logoAnim": "transparent"}}})

# ═════════ 工具 ═════════
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
def off(base, n):
    """'s5:bend' + n 幀 → 's5:bend+n'"""
    m = re.match(r"^(.*?)([+-]\d+)?$", base); b, k = m.group(1), int(m.group(2) or 0) + n
    return f"{b}{'+' if k >= 0 else '-'}{abs(k)}"

LAYERS = [l["id"] for l in MODEL["layers"] if not l.get("bg")]
VIS = []
def vis(lay, wins, dur=3):
    """依「可見區間」清單產生隱藏：區間之外全藏。a＝T0 表示一開始就看得到；b＝FAR 表示一直看到片尾"""
    assert lay in LAYERS, lay
    prev = T0
    for a, b in wins:
        if a != T0: VIS.append(hid(lay, prev, a, dur))
        prev = b
    if prev != FAR: VIS.append(hid(lay, prev, FAR, dur))
C = "voice-3"
CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw):
    return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)

# ── 站 N：晶圓抬起＋針逐格彎曲（s5 全部五根；s6 再壓一次並看中間那根刮破氧化膜）──
GAP, OD, NS, NIDS = INFO["GAP"], INFO["OD"], INFO["NSTEP"], INFO["NIDS"]
NWIN = {f"nN{i}_{k}": [] for i in range(5) for k in ["r"] + list(range(NS + 1))}
def press(appr, od0, step, rel=None):
    """appr＝開始抬起（14 幀到 GAP）；od0＝開始過驅動；每 step 幀再抬 OD/NS；rel＝放開（None＝不放）"""
    until = rel or FAR
    for l in NIDS:
        VIS.append(mv(l, appr, until, 14, dy=GAP))
        for k in range(1, NS + 1): VIS.append(mv(l, off(od0, step * (k - 1)), until, step, dy=round(OD / NS, 4)))
    return [(appr, od0, step, rel)]
PRESS = press("s5:bend-16", "s5:bend", 3, "s5:end+10") + press("s6:scrub-18", "s6:scrub-2", 5)
# 每根針、每個狀態的可見區間
for i in range(5):
    t = []   # (幀字串, 狀態)
    for appr, od0, step, rel in PRESS:
        t.append((off(od0, -1), 0))
        for k in range(1, NS + 1): t.append((off(od0, step * (k - 1) + step // 2), k))
        if rel: t.append((off(rel, 2), "r"))
    st = [(T0, "r")] + t
    for j, (a, k) in enumerate(st):
        b = st[j + 1][0] if j + 1 < len(st) else FAR
        NWIN[f"nN{i}_{k}"].append((a, b))
for lay, w in NWIN.items():
    if not w: vis(lay, [], 1); continue
    vis(lay, w, 1)
for k in range(1, NS + 1): vis(f"nScr{k}", [(off("s6:scrub-2", 5 * (k - 1) + 2), FAR)], 1)

# ── 站 E：探針卡爆炸分解（s4：接口、加固板、主板、彈簧針板；s8：空間轉換器、導板、針林、組回）──
E1 = "s4:hair+47"; E2 = off(E1, 16); E3 = "s4:hair+94"; E4 = off(E3, 16)   # 一張標籤兩步：接口＋加固板、主板＋彈簧針板（各步仍分開動、各自停住）
F1 = "s8:card8"; F2 = off(F1, 16); F3 = "s8:card8+47"; FT = "s8:card8+94"; ASM = "s8:card8+150"   # 第 5、6 步一張標籤（各自分開動）
VIS += [mv("eDock", E1, off(ASM, 9), 24, dy=5.0)]
VIS += [mv("eScrew", E2, off(ASM, 16), 12, dy=0.5), mv("eScrew", off(E2, 14), off(ASM, 7), 22, dy=3.4), mv("eStiff", off(E2, 14), off(ASM, 7), 22, dy=3.4)]
VIS += [mv("ePCB", E3, off(ASM, 5), 22, dy=2.2), mv("eIP", E4, off(ASM, 3), 22, dy=1.2)]
VIS += [mv("eST", F1, off(ASM, 2), 18, dy=0.55), mv("eLG", F2, off(ASM, 1), 18, dy=-0.35), mv("eUG", F2, off(ASM, 1), 18, dy=0.12)]
VIS += [mv("eNdl", F3, ASM, 20, dy=-1.0), mv("eTipHi", F3, ASM, 20, dy=-1.0)]
vis("eTipHi", [(off(FT, -2), off(ASM, 40))], 4)
VIS += [mv("eHair", T0, "s4:hair-12", 14, dx=-3.0)]
vis("eHair", [("s4:hair-14", "s4:hair+60")], 6)

# ── 站 A：吸盤 XY 平台與 Z（s2 對位→一顆顆測；s3 印章蓋下去）──
XY = ["aXcar", "aY", "aZ"]
VIS += [mv(l, "s2:cut-4", "s2:cut+28", 20, dx=-4.6) for l in XY]
ZUP = []
for k, b in enumerate(["s2:each+22", "s2:each+54", "s2:each+86"]):
    VIS.append(mv("aZ", b, off(b, 16), 8, dy=0.75)); ZUP.append(b)
    if k < 2: VIS += [mv(l, off(b, 25), FAR, 6, dx=0.19) for l in XY]
VIS.append(mv("aZ", "s3:down-8", "s4:start+20", 10, dy=0.75))
VIS.append(mv("aZ", "s9:send-14", "s10:start+20", 10, dy=0.75))
VIS += [hid(l, "s9:send-14", "s10:start", 8, 0.25) for l in ("aBase", "aRail", "aMan", "aTester")]

# ── 站 W：測試位置框沿一列步進、壞晶片打墨點（s10）──
WS = INFO["WSTEPS"]; WP = INFO["WP"]
vis("wSite", [("s10:start-6", FAR)], 1); vis("wInkDone", [("s10:start-6", FAR)], 1)
STEPT = [f"s10:start+{4 + 14 * k}" for k in range(1, WS)]
VIS += [mv("wSite", t, FAR, 8, dx=round(2 * WP, 3)) for t in STEPT]
for s in range(WS):
    vis(f"wStep{s}", [((off(STEPT[s], 2) if s < WS - 1 else off(STEPT[-1], 18)), FAR)], 2)
vis("wQ", [(T0, "s2:start")], 2)
# ── 站 K：三種針型（念到才從幽靈變實體）──
for l, cue in [("kCant", "s7:cant"), ("kcDie", "s7:cant"), ("kVert", "s7:vert"), ("kvDie", "s7:vert"), ("kMems", "s7:mems"), ("kmDie", "s7:mems")]:
    VIS.append(hid(l, T0, off(cue, -6), 6, 0.22))
for l, cue in [("kcDie", "s7:cant"), ("kvDie", "s7:vert"), ("kmDie", "s7:mems")]:
    VIS.append(mv(l, off(cue, 4), off(cue, 22), 8, dy=0.12, spring={"tau": 4, "period": 10}))

# 近景時畫面外的層調淡（看不到，只讓版面檢查的主素材框只算畫面裡的東西）
VIS += [hid(l, "s3:card+20", "s4:start", 1, 0.25) for l in ("aBase", "aRail", "aMan", "aTester", "aCable")]
VIS += [hid(l, "s4:start-12", "s4:hair+34", 10, 0.25) for l in ("eDock", "eScrew", "eStiff")] + [hid("ePCB", "s4:start-12", "s4:hair+34", 10, 0.28)]
VIS += [hid("nST", "s6:start-2", "s7:start", 1, 0.25)]
VIS += [hid(l, "s8:voice-8", off(ASM, -4), 1, 0.25) for l in ("eDock", "eScrew", "eStiff", "ePCB", "eIP")]
# ═════ 各幕 ═════
AO = (2.0, 3.2, 80, 14)          # 站 A 全景（看向 x, y, 距離, 仰角）
AT = (1.2, 7.9, 30, 3)           # 站 A 測試時推近腔體（測試頭、探針卡、吸盤頂著）
AC = (0.2, 7.3, 34, -3)           # 站 A 吸盤與探針卡近景（前方低角度）
WV = (30.0, -1.2, 36, 58)        # 站 W 晶圓俯視
EU = (60.05, 2.75, 8.5, -9)        # 站 E 針尖底面近景
EO = (60.0, 4.6, 42, 12)         # 站 E 爆炸全景
EC = (60.05, 1.95, 15, 10)       # 站 E 拆開後的下半部近景（空間轉換器、導板、針林）
EA = (60.0, 5.4, 30, 12)         # 站 E 組回途中（上面幾層從高處落回）
EA2 = (60.0, 4.5, 28, 12)        # 站 E 組回後推近
NV = (90.3, 2.6, 42, 4)          # 站 N 五根針
NC = (90.8, 3.2, 22, 6)          # 站 N 中間那根針尖近景
KV = (120.0, 2.6, 46, 14)        # 站 K 三種針型
def S_(at, v, dur=30, yaw=None): return shot(at, v[0], v[1], v[2], v[3], dur, yaw)
P = {}
P["s1"] = {"shot": [S_("start-30", (30.0, 0.2, 50, 58), 1, yaw=0.0)], "shift": VIS,
 "run": [run("wQPulse", "start-30", "s2:start", 6)],
 "overlay": [sec("probe1-hook", "start", nxt("s1"), "系列 2・第 21 集", "示意，非實際比例", {"q": "q", "prev": "prev", "done": "done", "many": "many"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "wafer", "at": "start-10", "dur": 1}, {"to": "prober", "at": CC, "dur": 1}],   # 第一個 key 讓鉤子大字在換幕前退完
 "shot": [S_(CC, AO, 1)],
 "run": [run("aTipGlow", off(b, 10), off(b, 18), 3) for b in ZUP],
 "labels": [lab("aCamA", "對位相機", "Alignment camera", "blue", "cut+6", "cut+52"),
            lab("aWafer", "晶圓（還沒切開）", "Wafer, not yet diced", "amber", "name", "name+46")],
 "overlay": [card("s2", "probe1-flow", "晶圓測試：切開之前先測", "示意", {"cut": "cut", "each": "each", "name": "name"})]}
P["s3"] = {"shot": [S_(CC, AO, 1), S_("card+20", AC, 28)],
 "run": [run("aTipGlow", "down+2", "s4:start", 4)],
 "labels": [lab("aCardA", "探針卡", "Probe card", "amber", "card", "card+46"),
            lab("aChuck", "吸盤把晶圓頂到針尖", "Chuck lifts wafer to the tips", "blue", "down+2", "down+48")],
 "overlay": [card("s3", "probe1-stamp", "像一枚針很多的印章", "示意（不標針數）", {"card": "card", "stamp": "stamp", "down": "down", "each": "each"})]}
P["s4"] = {"zoom": [{"to": "card", "at": CC, "dur": 1}],
 "shot": [S_(CC, EU, 1), S_("hair+20", EO, 24)],
 "labels": [lab("eHairA", "一根頭髮（比針距寬）", "A hair: wider than the pitch", "amber", "hair", "hair+45", xy=[700, 990]),
            lab("eDockA", "測試頭接口、加固板（撐住總壓力）", "Test-head interface & stiffener", "blue", E1, off(E1, 45)),
            lab("ePCBA", "主板、彈簧針板", "Main PCB & spring-pin interposer", "amber", E3, off(E3, 45))],
 "overlay": [card("s4", "probe1-pitch", "接點間距 vs 一根頭髮", "最密處；示意，不按比例", {"gap": "gap", "hair": "hair"})]}
P["s5"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [S_(CC, NV, 1)],
 "labels": [lab("nNdlA", "探針（有彈性）", "Probe: springy", "amber", "spring-6", "spring+40"),
            lab("nTipNg", "最晚碰到的那根", "Last one to touch", "blue", "bend+10", "bend+56")],
 "overlay": [card("s5", "probe1-spring", "像彈簧筆：壓下去會彎", "示意（不標力量）", {"spring": "spring", "pen": "pen", "bend": "bend", "even": "even"})]}
P["s6"] = {"shot": [S_(CC, NC, 1)],
 "run": [run("nDebris", "scrub+8", "scrub+44", 4), run("nCurrent", "on", "s7:start", 6), run("nGlowOk", "on", "s7:start", 6)],
 "labels": [lab("nOxA", "氧化膜（不導電）", "Oxide film: insulating", "blue", "ox", "ox+46"),
            lab("nScrA", "刮開處露出金屬", "Scrubbed: bare metal", "amber", "scrub+24", "scrub+69"),
            lab("nOnA", "接通", "Contact made", "blue", "on", "on+46")],
 "overlay": [card("s6", "probe1-scrub", "像用指甲刮掉生鏽處", "示意（不標刮痕尺寸）", {"ox": "ox", "insul": "insul", "scrub": "scrub", "nail": "nail", "on": "on"})]}
P["s7"] = {"zoom": [{"to": "types", "at": CC, "dur": 1}],
 "shot": [S_(CC, KV, 1)],
 "run": [run("kcBuzz", "cant+4", "cant+24", 4)],
 "labels": [lab("kCantA", "懸臂式：斜插的粗針", "Cantilever", "amber", "cant-12", "cant+34"),
            lab("kVertA", "垂直式：站著的針", "Vertical", "blue", "vert+2", "vert+48"),
            lab("kMemsA", "微機電：半導體製程做的", "MEMS", "amber", "mems", "mems+46")],
 "overlay": [card("s7", "probe1-types", "針的做法在進化", "示意", {"evo": "evo", "cant": "cant", "vert": "vert", "mems": "mems"})]}
P["s8"] = {"zoom": [{"to": "card", "at": CC, "dur": 1}],
 "shot": [S_(CC, EC, 1), S_(off(ASM, -4), EA, 1), S_(off(ASM, 30), EA2, 14)],
 "run": [run("etHiPulse", off(FT, -2), off(ASM, 40), 4)],
 "labels": [lab("eSTA", "空間轉換器、上下導板（孔位錯開）", "Space transformer & guide plates", "blue", F1, off(F1, 45), xy=[540, 985]),
            lab("eNdlA", "探針：可多到好幾萬根（報導）", "Probes: tens of thousands", "blue", F3, off(F3, 45), xy=[540, 985]),
            lab("eTipA", "針尖高低不一（示意放大）", "Uneven tip heights", "amber", FT, off(FT, 45), xy=[540, 985])],
 "overlay": [card("s8", "probe1-count", "針越多，越難壓平", "數位時代報導；示意", {"card8": "card8", "many": "many", "more": "more", "flat": "flat"})]}
P["s9"] = {"zoom": [{"to": "prober", "at": CC, "dur": 1}],
 "shot": [S_(CC, AO, 1), S_("send-14", AT, 24)],
 "run": [run("sigDown", "send-4", "s10:start", 6), run("sigUp", "ans-6", "s10:start", 6), run("thLed", "send", "s10:start", 4), run("aTipGlow", "send-4", "s10:start", 4)],
 "labels": [lab("aTester", "測試機", "Tester", "amber", "tester", "tester+46"),
            lab("aCable", "訊號走排線、經探針卡到針", "Signals via cables & card", "blue", "send", "send+46")],
 "overlay": [card("s9", "probe1-tester", "測試機像出題老師", "示意", {"tester": "tester", "teacher": "teacher", "send": "send", "ans": "ans"})]}
P["s10"] = {"zoom": [{"to": "wafer", "at": CC, "dur": 1}],
 "shot": [S_(CC, WV, 1)],
 "run": [run("wSitePulse", "start", "s11:start", 4)],
 "labels": [lab("wInkA", "沒通過：標記起來（示意）", "Failed: marked", "amber", "mark", "mark+46")],
 "overlay": [sec("probe1-next", C, "s11:start", "沒通過的會被標記", "下一集：誰做探針卡", {"fail": "fail", "mark": "mark", "who": "who", "next": "next", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("wafer", "晶圓（示意）", "WAFER", "300 mm", "30 mm"), lv("prober", "針測機台（示意）", "WAFER PROBER", "200 cm", "20 cm"), lv("card", "探針卡分解（示意，放大）", "PROBE CARD", "30 cm", "5 cm"),
          lv("micro", "針尖剖面（示意，放大）", "PROBE TIP SECTION", "140 µm", "10 µm"), lv("types", "三種探針（示意）", "PROBE TYPES", "5 mm", "1 mm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-probe1", "prevEpisode": "2-20：水氣電", "title": "探針卡-1（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b",
                 "_說明": "旁白金手指第三版；本支子聊天室不送 TTS，由頻道負責人配音"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["探針卡", "幾萬根針一次蓋"], "sub": "哪顆晶片是好的？", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
    for w in ["量測", "MEMS"]:
        if w in (s.get("narration") or "") + s["subtitle"]["zh"]: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
