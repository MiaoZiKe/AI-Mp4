"""tech-bt 腳本產生器：python3 videos/tech-bt/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
3-9：BT 載板與 T-glass 缺料（科技透明圈 系列 3 第 9 集；前一集 3-8：ABF 載板；下一集 3-10：玻璃基板）。念稿定稿於 script.md（頻道負責人核准，一字不改）。
產生：python3 videos/tech-bt/genscript.py → node scripts/three/silent-timeline.mjs tech-bt → 再跑一次本檔（cue 來自 timeline.json）。
2D 卡：src/components/three/HudBt.tsx（bt-*）。構造與物理：physics-spec.md；來源：research.md。寫法照 tech-abfsub/genscript.py。
Andy 規則：第 38 條不加運作音效；第 39 條旁白間無聲 ≤1 秒（念完留 0.6 秒）；第 40 條公司卡 ≥1.2 秒×家數＋1.5、念完最後一家後 ≥1 秒才換幕（不足就把卡片延到下一幕開頭）。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
# (id, beat, 念稿（＝script.md 原文）, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, 開口前只有畫面秒)
S = [
("s1", "hook", "便宜的載板長怎樣？前一集說，不是每顆晶片都用得起貴載板。",
 ["便宜的載板", "長怎樣？", "前一集說", "不是每顆晶片", "都用得起貴載板"], ["What does a cheaper", "substrate look like?", "Last episode:", "not every chip", "can afford a pricey one."],
 [("cheap", "便宜"), ("look", "長怎樣"), ("prev", "前一集"), ("chip", "晶片"), ("pricey", "貴載板")], ["便宜", "載板"], ["中央社 2023/6/2；示意"], 0.0),
("s2", "you", "這集看 B T 載板，骨架是玻璃纖維布，泡樹脂、壓銅箔。",
 ["這集看 BT 載板", "骨架是玻璃纖維布", "泡樹脂壓銅箔"], ["This episode: BT substrates.", "The skeleton is glass-fiber cloth,", "soaked in resin, pressed with copper foil."],
 [("bt", "載板"), ("cloth", "玻璃纖維布"), ("resin", "泡樹脂"), ("cu", "壓銅箔")], ["玻璃纖維布", "樹脂", "銅箔"], ["三菱瓦斯化學產品頁；Tom's Hardware；示意"], 0.3),
("s3", "mechanism", "像鋼筋混凝土，布當鋼筋、樹脂當水泥，又硬又耐熱。",
 ["像鋼筋混凝土", "布當鋼筋", "樹脂當水泥", "又硬又耐熱"], ["Like reinforced concrete:", "cloth is the rebar,", "resin is the cement,", "stiff and heat-resistant."],
 [("rc", "鋼筋混凝土"), ("rebar", "布當鋼筋"), ("cement", "樹脂當水泥"), ("hard", "又硬"), ("heat", "耐熱")], ["鋼筋混凝土", "耐熱"], ["J-STAGE 1984（BT 樹脂）；示意"], 0.3),
("s4", "mechanism", "記憶體和手機晶片多用它；味之素膜沒布，線更細，給人工智慧晶片。",
 ["記憶體和手機晶片", "多用它", "味之素膜沒布", "線更細", "給人工智慧晶片"], ["Memory and phone chips", "mostly use it.", "Ajinomoto film has no cloth,", "so lines are finer,", "for AI chips."],
 [("mem", "記憶體"), ("phone", "手機"), ("abf", "味之素膜"), ("nocloth", "沒布"), ("fine", "線更細"), ("ai", "人工智慧")], ["記憶體", "沒布", "線更細"], ["中央社 2023；Polymer Innovation Blog；示意"], 0.3),
("s5", "twist", "麻煩在布。晶片受熱幾乎不脹，載板脹得多，像兩人三腳不同步，一拉就翹。",
 ["麻煩在布", "晶片受熱幾乎不脹", "載板脹得多", "像兩人三腳不同步", "一拉就翹"], ["The catch is the cloth.", "Heated, the chip barely expands;", "the substrate expands a lot,", "like a three-legged race out of step:", "one pull and it warps."],
 [("cloth", "麻煩在布"), ("heat", "受熱"), ("little", "幾乎不脹"), ("much", "脹得多"), ("legs", "兩人三腳"), ("warp", "一拉就翹")], ["受熱", "兩人三腳", "翹"], ["SemiEngineering；ECTC 2015；示意，誇大"], 0.3),
("s6", "twist", "低膨脹玻璃布脹得少，能拉住載板；據報導，約九成出自日本日東紡。",
 ["低膨脹玻璃布", "脹得少", "能拉住載板", "據報導", "約九成出自", "日本日東紡"], ["Low-expansion glass cloth", "expands less", "and holds the substrate back.", "Reportedly,", "about 90% comes from", "Japan's Nittobo."],
 [("tg", "低膨脹玻璃布"), ("less", "脹得少"), ("hold", "拉住"), ("rep", "據報導"), ("ninety", "九成"), ("jp", "日本"), ("nitto", "日東紡")], ["低膨脹", "九成", "日東紡"], ["IBM Research；TrendForce 2026/2/4；媒體報導"], 0.3),
("s7", "twist", "人工智慧載板的核心也要這種布，像大店搶光麵粉，小店斷貨。",
 ["人工智慧載板的核心", "也要這種布", "像大店搶光麵粉", "小店斷貨"], ["AI substrates' cores", "need this cloth too,", "like a big shop buying up all the flour:", "small shops run out."],
 [("ai", "人工智慧載板"), ("core", "核心"), ("cloth", "這種布"), ("big", "大店"), ("flour", "麵粉"), ("small", "小店"), ("out", "斷貨")], ["核心", "麵粉", "斷貨"], ["高盛 2025/10；Counterpoint；分析師說法"], 0.3),
("s8", "payoff", "日東紡在日本、台灣擴廠，台玻的布也開始出貨。",
 ["日東紡在日本", "台灣擴廠", "台玻的布", "也開始出貨"], ["Nittobo is expanding in Japan", "and Taiwan;", "Taiwan Glass's cloth", "has started shipping too."],
 [("nitto", "日東紡"), ("jp", "日本"), ("tw", "台灣"), ("expand", "擴廠"), ("tg", "台玻"), ("ship", "出貨")], ["日東紡", "擴廠", "台玻"], ["日東紡公告；Digitimes 2026/11/6；鉅亨網"], 0.2),
("s9", "payoff", "台灣做 B T 載板的有景碩、南電、欣興，手機和記憶體多靠它們。",
 ["台灣做 BT 載板的", "有景碩南電欣興", "手機和記憶體", "多靠它們"], ["Taiwan's BT substrate makers:", "Kinsus, Nan Ya PCB, Unimicron.", "Phones and memory", "rely on them."],
 [("tw", "台灣"), ("kin", "景碩"), ("nya", "南電"), ("uni", "欣興"), ("phone", "手機"), ("mem", "記憶體")], ["景碩", "南電", "欣興"], ["經濟日報；旺得富 2026/7/16；截至 11/27"], 0.2),
("s10", "cta", "布再改還是會脹。下一集，把核心換成整片玻璃，看玻璃基板。",
 ["布再改", "還是會脹", "下一集", "把核心換成整片玻璃", "看玻璃基板"], ["Even improved cloth", "still expands.", "Next episode:", "swap the core for a solid sheet of glass:", "glass substrates."],
 [("still", "還是會脹"), ("next", "下一集"), ("core", "核心"), ("glass", "整片玻璃"), ("gs", "玻璃基板")], ["整片玻璃", "玻璃基板"], ["Intel 2023 新聞稿；IRZ；截至 2026/11/27"], 0.3),
("s11", "cta", "你覺得缺料會缺多久？留言 B T，拿完整資料。",
 ["你覺得缺料", "會缺多久？", "留言 BT", "拿完整資料"], ["How long do you think", "the shortage will last?", "Comment \"BT\"", "for the full notes."],
 [("q", "缺多久"), ("kw", "留言")], ["缺料", "留言"], ["工商時報 2026/10/21；高盛 2025/10"], 0.2),
]
HOLD = 0.6          # 念完後只有畫面的秒數（＋下一幕 headSec 0.2～0.3 ≤ 1.0；第 39 條）
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, head) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？]", "", z)) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？]", "", z)) >= 3, ("字幕短語 <3 字會被併入下一段、英文對位跑掉", sid, z)
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar))
    hold = 0.7 if sid == "s6" else HOLD; dur = round(0.2 + head + nch / 5.2 + hold, 1)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": nar,
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
md = open(os.path.join(HERE, "script.md")).read()
for s in scenes: assert s["tts"] in md, ("念稿和 script.md 不一致", s["id"])
scenes[0]["props"]["hook"] = {"kicker": "接上集：貴的 ABF 載板", "title": "便宜的載板？", "size": 120, "top": 272}
scenes.append({"id": "s12", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "玻璃基板", "trail": ["把核心換成整片玻璃"], "comment": "BT", "logoAnim": "transparent"}}})

# ═════════ 工具（照 tech-abfsub）═════════
FAR = "s12:start+400"
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
LAYERS = [l["id"] for l in MODEL["layers"] if not l.get("bg")]
ALL_LAYERS = [l["id"] for l in MODEL["layers"]]
VIS = []
def vis(lay, wins, dur=3):
    assert lay in ALL_LAYERS, lay
    prev = T0
    for a, b in wins:
        if a != T0: VIS.append(hid(lay, prev, a, dur))
        prev = b
    if prev != FAR: VIS.append(hid(lay, prev, FAR, dur))
def drop(lay, at, dy=6.0, dur=16, bounce=0.06):
    vis(lay, [(at, FAR)], 1)
    VIS.append({"layer": lay, "at": T0, "until": at, "dur": dur, "dy": dy, "fallIn": True, "bounce": bounce, "opacity": 0})
C = "voice-3"
CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"

# ── 第 40 條：公司卡延長（依 timeline.json 自動算）：完整顯示 ≥ max(3.5, 1.2×N＋1.5) 秒（＋6 幀餘裕），念完最後一家（cue＋字數×6 幀）後 ≥1.0 秒 ──
_tlp = os.path.join(HERE, "timeline.json")
_tl = {x["id"]: x for x in json.load(open(_tlp))["scenes"]} if os.path.exists(_tlp) else {}
def ext_frames(sid, n, last_cue, name_len):
    nx = f"s{int(sid[1:]) + 1}"
    if sid not in _tl or nx not in _tl: return 0
    c0, c1 = _tl[sid]["voiceStartFrame"] - 3, _tl[nx]["voiceStartFrame"] - 3
    lc = next((c["frame"] for c in _tl[sid]["cues"] if c["id"] == last_cue), c0)
    need = round(max(3.5, 1.2 * n + 1.5) * 30) + 6
    return max(0, need - (c1 - c0), (lc + name_len * 6 + 30 + 3) - c1)
EXTN = {"s7": ext_frames("s6", 1, "nitto", 3), "s9": ext_frames("s8", 2, "tg", 2), "s10": ext_frames("s9", 3, "uni", 2)}
def SA(sid):   # 本幕自己的卡片、鏡頭、標籤從這裡開始（前一幕的公司卡延長時往後挪）
    n = EXTN.get(sid, 0); return f"voice{n - 3:+d}" if n else C
def SC(sid):
    n = EXTN.get(sid, 0); return f"voice{n - 4:+d}" if n else CC
def ENDV(sid):  # 本幕的站點在下一幕開頭還要留多久
    nx = f"s{int(sid[1:]) + 1}"; n = EXTN.get(nx, 0); return f"{nx}:voice{n - 1:+d}" if n else f"{nx}:voice-1"
def card(sid, kind, title, tag, t=None, **kw):
    return sec(kind, SA(sid), nxt(sid), title, tag, t, cut=True, **kw)
def carry(sid):  # 公司卡延長：上一幕的卡片在本幕開頭再留 EXTN 幀（cue 指回上一幕）
    if not EXTN.get(sid): return []
    pv = f"s{int(sid[1:]) - 1}"; o = json.loads(json.dumps(next(x for x in P[pv]["overlay"] if x.get("type") == "section")))
    o["at"], o["until"] = C, SA(sid)
    if "t" in o: o["t"] = {k: {"at": (v["at"] if ":" in v["at"] else f"{pv}:{v['at']}")} for k, v in o["t"].items()}
    return [o]

# ── 站 B（s2）：含浸線一直在跑；疊料：下銅箔→兩張預浸材→上銅箔，上壓板壓下 ──
def slide(lay, at, dx=-6.5, dur=10):
    """從左邊上料台推進壓機：at 之前停在左邊（看不見），at 出現、往右滑進去"""
    vis(lay, [(at, FAR)], 1); VIS.append(mv(lay, T0, at, dur, dx=dx))
slide("bCuB", "s2:cloth+2"); slide("bPp0", "s2:cloth+14"); slide("bPp1", "s2:resin+6"); slide("bCuT", "s2:cu-2")
VIS += [mv("bPlaten", "s2:cu+10", FAR, 12, dy=-3.2)]
# ── 站 C（s3）：核心板往上分開（爆炸分解：下銅箔不動、兩張預浸材、上銅箔依序抬起）→ 組回 ──
for lay, dy, k in (("cPly0", 1.0, 0), ("cPly1", 2.3, 1), ("cCuT", 3.6, 2)):
    VIS.append(mv(lay, f"s3:rc{-6 + k * 3:+d}", f"s3:hard{-6 + k * 2:+d}", 14, dy=dy))
# ── 站 D（s4）：味之素膜的細線念到「線更細」才畫出來 ──
vis("dAbfLine", [("s4:fine-4", FAR)], 1)
# ── 站 E（s5）：受熱：先伸長（脹得多）再越來越彎（一拉就翹）；兩端錫球離開焊墊 ──
ENS = INFO["ENS"]
def stage_t(i):
    if i <= 8: return f"s5:much{-4 + (i - 1) * 2:+d}"
    return f"s5:warp{-6 + (i - 9) * 2:+d}"
for i in range(ENS):
    a = T0 if i == 0 else stage_t(i)
    vis(f"eS{i}", [(a, FAR if i == ENS - 1 else stage_t(i + 1))], 1)
vis("eArrC", [("s5:little-4", "s5:warp")], 2); vis("eArrS", [("s5:much-4", "s5:warp+20")], 2); vis("eOpen", [("s5:warp+4", FAR)], 2)
# ── 站 F（s6）：同時受熱，一般布翹很多、低膨脹布翹很少 ──
FNS = INFO["FNS"]
for pre in ("fA", "fB"):
    for i in range(FNS):
        a = T0 if i == 0 else f"s6:less{-6 + (i - 1) * 4:+d}"
        vis(f"{pre}{i}", [(a, FAR if i == FNS - 1 else f"s6:less{-6 + i * 4:+d}")], 1)
# ── 站 G（s7）：布捲一捲捲被拉到大店（人工智慧載板），小店空架 → 斷貨 ──
GX = INFO["GX"]
for lay in ["gCart"] + [f"gR{i}" for i in range(INFO["GN"])]:
    VIS.append(mv(lay, "s7:cloth-4", FAR, 36, dx=13.0, dz=-3.2))   # 推車（含布捲）一起開到大店門口，有加減速
vis("gOut", [("s7:out-2", FAR)], 2)
# ── 站 H（s8）：兩個棧板念到才落下 ──
drop("hP0", "s8:jp-4", 4.0, 14); drop("hP1", "s8:tg-6", 4.0, 14)
# ── 站 I（s9）：三只紙箱念到才落下；手機、記憶體模組念到才出現 ──
drop("iTag0", "s9:kin-8", 2.0, 10); drop("iTag1", "s9:nya-8", 2.0, 10); drop("iTag2", "s9:uni-8", 2.0, 10)
drop("iPhone", "s9:phone-6", 3.0, 12); drop("iDimm", "s9:mem-6", 3.0, 12)
# ── 站 J（s10）：上層與晶片抬起 → 布核心往左抽走 → 玻璃從右邊滑進來 → 上層落回 ──
VIS += [mv("jTop", "s10:core-10", "s10:gs-4", 12, dy=1.8), mv("jDie", "s10:core-10", "s10:gs-4", 12, dy=1.8)]
VIS += [mv("jCore", "s10:core+2", FAR, 16, dx=-14.0)]; vis("jCore", [(T0, "s10:glass-6")], 1)
vis("jGlass", [("s10:core+10", FAR)], 1); VIS.append(mv("jGlass", T0, "s10:glass-6", 16, dx=14.0))

# ── 每一站只在用到它的幕出現 ──
def W(k): return f"s{k}:voice-6"
def E(k): return f"s{k}:voice-1"
STA = {"a": [(T0, E(2))], "b": [(W(2), E(3))], "c": [(W(3), E(4))], "d": [(W(4), E(5))], "e": [(W(5), E(6))], "f": [(W(6), ENDV("s6"))],
       "g": [(W(7), E(8))], "h": [(W(8), ENDV("s8"))], "i": [(W(9), ENDV("s9"))], "j": [(W(10), FAR)]}
for pre, wins in STA.items():
    for l in ALL_LAYERS:
        if re.match(rf"^{pre}[A-Z0-9]", l):
            prev = T0
            for a, b in wins:
                if a != T0: VIS.append(hid(l, prev, a, 1))
                prev = b
            if prev != FAR: VIS.append(hid(l, prev, FAR, 1))

# ═════ 各幕 ═════
P = {}
X = INFO
P["s1"] = {"shot": [shot("start-30", X["AX"], 1.0, 40, 32, 1, yaw=0.0), shot("start", X["AX"], 0.6, 32, 26, 60), shot("prev-6", X["AX"] - 1.0, 0.6, 20, 10, 40)],
 "shift": VIS,
 "run": [run("chipGlow", "start-30", "s2:start+6", 8), run("wirePulse", "start-30", "s2:start+6", 8)],
 "overlay": [sec("bt-hook", "start", nxt("s1"), "系列 3・第 9 集", "示意，非實際比例", {"cheap": "cheap", "prev": "prev", "chip": "chip", "pricey": "pricey"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "line", "at": "start-8", "dur": 1}],
 "shot": [shot(CC, X["BX"] - 3.0, 3.0, 54, 20, 1), shot("cu-12", X["BX"] + 8.5, 3.4, 54, 20, 22)],
 "run": [run("rollSpin", "start-10", "s3:start", 8), run("bGuideSpin", "start-10", "s3:start", 8), run("bDipSpin", "start-10", "s3:start", 8), run("bSqASpin", "start-10", "s3:start", 8), run("bSqBSpin", "start-10", "s3:start", 8),
         run("webFlow", "start-10", "s3:start", 6), run("ovenGlow", "start-10", "s3:start", 8), run("platenHeat", "cu+10", "s3:start", 6), run("knifeCut", "start-10", "s3:start", 6), run("beadPulse", "start-10", "s3:start", 6)],
 "labels": [lab("bRoll", "玻璃纖維布捲", "Glass-fiber cloth roll", "blue", C, "bt+12"), lab("bTank", "泡樹脂（含浸）", "Resin bath", "amber", "bt+14", "cu-12"),
            lab("bPress", "疊銅箔、熱壓", "Copper foil + hot press", "amber", "cu-10", "end")],
 "overlay": [card("s2", "bt-make", "骨架是玻璃纖維布", "示意", {"bt": "bt", "cloth": "cloth", "resin": "resin", "cu": "cu"})]}
P["s3"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, X["CX"] - 1.2, -0.4, 72, 20, 1)],
 "labels": [lab("cCuT", "上銅箔、下銅箔", "Copper foil, top and bottom", "blue", C, "rebar+6"), lab("cPly", "預浸材：布＝鋼筋", "Prepreg: cloth = rebar", "amber", "rebar+8", "cement+30"),
            lab("cResin", "樹脂＝水泥（包住布）", "Resin = cement", "amber", "cement+32", "end")],
 "overlay": [card("s3", "bt-rebar", "像鋼筋混凝土", "比喻；示意", {"rc": "rc", "rebar": "rebar", "cement": "cement", "hard": "hard", "heat": "heat"})]}
P["s4"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, X["DX"], -2.4, 76, 22, 1)],
 "labels": [lab("dBt", "BT：每層有布、線粗", "BT: cloth in every layer", "amber", C, "abf-4"), lab("dAbf", "味之素膜：沒布、線細", "ABF film: no cloth, finer lines", "blue", "abf-2", "end")],
 "overlay": [card("s4", "bt-vs", "BT 和味之素膜差在哪", "示意（不標線寬）", {"mem": "mem", "phone": "phone", "abf": "abf", "nocloth": "nocloth", "fine": "fine", "ai": "ai"})]}
P["s5"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, X["EX"], -2.0, 64, 16, 1)],
 "run": [run("heatE", "heat-4", "s6:start", 8), run("openPulse", "warp+12", "s6:start", 6)],
 "labels": [lab("eDie", "晶片：幾乎不脹", "Chip: barely expands", "blue", "heat-6", "much-4"), lab("eSub", "載板：脹得多", "Substrate: expands more", "amber", "much-2", "warp-6"),
            lab("eOpen", "兩端錫球離開焊墊", "Edge balls lift off", "amber", "warp-4", "end")],
 "overlay": [card("s5", "bt-cte", "像兩人三腳不同步", "示意，誇大；數值見出處", {"cloth": "cloth", "heat": "heat", "little": "little", "much": "much", "legs": "legs", "warp": "warp"})]}
P["s6"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, X["FX"] - 0.8, -2.0, 66, 32, 1)],
 "run": [run("heatF", "tg-4", "s7:start+30", 8)],
 "labels": [lab("fA", "一般布：翹很多", "Regular cloth: warps a lot", "amber", "less-4", "hold+20"), lab("fB", "低膨脹布：翹很少", "Low-CTE cloth: warps little", "blue", "hold+22", "end")],
 "overlay": [card("s6", "bt-tglass", "低膨脹玻璃布", "媒體報導、研調估計", {"tg": "tg", "less": "less", "hold": "hold", "rep": "rep", "ninety": "ninety", "nitto": "nitto"}, h=392, y=1000)]}
P["s7"] = {"zoom": [{"to": "co", "at": SC("s7"), "dur": 1}],
 "shot": [shot(SC("s7"), X["GX"] + 1.5, 0.0, 84, 26, 1)],
 "labels": [lab("gRack", "低膨脹玻璃布捲", "Low-CTE cloth rolls", "blue", SA("s7"), "core+6"), lab("gBig", "人工智慧載板（大店）", "AI substrates (big shop)", "amber", "core+8", "small-6"),
            lab("gSmall", "BT 載板（小店）：斷貨", "BT substrates: out of stock", "amber", "small-4", "end")],
 "overlay": [card("s7", "bt-flour", "像大店搶光麵粉", "分析師普遍認為（高盛 2025/10）", {"ai": "ai", "core": "core", "big": "big", "small": "small", "out": "out"})]}
P["s8"] = {"zoom": [{"to": "line", "at": CC, "dur": 1}],
 "shot": [shot(CC, X["HX2"] + 2.5, 2.0, 76, 22, 1)],
 "run": [run("heddleA", "start-10", "s9:start+20", 6), run("heddleB", "start-10", "s9:start+20", 6), run("reedBeat", "start-10", "s9:start+20", 6), run("rapier", "start-10", "s9:start+20", 6),
         run("beamSpin", "start-10", "s9:start+20", 8), run("gearSpin", "start-10", "s9:start+20", 8), run("takeSpin", "start-10", "s9:start+20", 8)],
 "labels": [lab("hLoom", "劍桿織布機（示意）", "Rapier loom (schematic)", "blue", C, "jp+17"), lab("hP0", "日東紡擴廠、台玻出貨", "Nittobo expands; Taiwan Glass ships", "amber", "jp+19", "end")],
 "overlay": [card("s8", "bt-expand", "擴廠與新供應商", "公司說法、媒體報導；截至 2026/11/27", {"nitto": "nitto", "jp": "jp", "tw": "tw", "expand": "expand", "tg": "tg", "ship": "ship"}, h=392, y=1000)]}
P["s9"] = {"zoom": [{"to": "co", "at": SC("s9"), "dur": 1}],
 "shot": [shot(SC("s9"), X["IX"] + 2.0, 1.6, 96, 14, 1)],
 "run": [run("screenPhone", "phone", "s10:start+30", 8)],
 "labels": [lab("iPhone", "手機和記憶體", "Phones and memory", "blue", "phone-4", "end")],
 "overlay": [card("s9", "bt-co", "台灣的 BT 載板廠", "公開資訊；截至 2026/11/27", {"tw": "tw", "kin": "kin", "nya": "nya", "uni": "uni", "phone": "phone", "mem": "mem"}, h=392, y=1000)]}
P["s10"] = {"zoom": [{"to": "micro", "at": SC("s10"), "dur": 1}],
 "shot": [shot(SC("s10"), X["JX"] - 1.5, -0.6, 62, 20, 1)],
 "run": [run("tgvPulse", "gs", "s12:start", 8)],
 "labels": [lab("jCore", "布＋樹脂的核心", "Cloth + resin core", "amber", "still", "glass-8"), lab("jGlass", "整片玻璃（穿孔銅柱）", "Solid glass core", "blue", "glass-2", "gs+40")],
 "overlay": [card("s10", "bt-next", "下一集：玻璃基板", "截至 2026/11/27 尚未量產", {"still": "still", "next": "next", "core": "core", "glass": "glass", "gs": "gs"})]}
P["s11"] = {"shot": [shot(CC, X["JX"], 0.4, 44, 24, 1), shot("start", X["JX"], 0.4, 50, 26, 90)],
 "overlay": [sec("bt-cta", C, "s12:start", "換你說", "截至 2026/11/27 尚未確定何時緩解", {"q": "q", "kw": "kw"}, cut=True)]}
# 公司卡延長段：卡片留在畫面上到下一幕的 SA（延長期間下一幕鏡頭不動＝上一幕鏡頭還在）
for sid in EXTN:
    if EXTN[sid]: P[sid]["overlay"] = carry(sid) + P[sid]["overlay"]
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("tool", "手機記憶體封裝（示意）", "MEMORY PACKAGE", "30 cm", "5 cm"), lv("line", "生產線（示意）", "PRODUCTION LINE", "100 cm", "10 cm"),
          lv("micro", "載板剖面放大（示意）", "SUBSTRATE CROSS-SECTION", "1 mm", "100 µm"), lv("co", "供應鏈（示意）", "SUPPLY CHAIN", "100 cm", "10 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-bt", "prevEpisode": "3-8：ABF 載板", "title": "BT 載板與 T-glass 缺料（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "晶片往下游走", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b",
                 "_說明": "旁白金手指第三版（tech-andy-fixes 第 34 條）；本支未配音、不送 TTS"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["BT 載板", "為什麼缺料？"], "sub": "玻璃纖維布被搶光", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9a-z]|[A-Z]{2}", t): bad.append((s["id"], "數字或英文（大寫字母要拆開念）"))
    for w in ["量測", "矽", "T-glass"]:
        if w in (s.get("narration") or "") + s["subtitle"]["zh"]: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes], "公司卡延長", EXTN)
if _tl:
    def fr(sid, a):
        if ":" in a: sid, a = a.split(":")
        m = re.match(r"([a-z]+)([+-]\d+)?", a); c, o = m.group(1), int(m.group(2) or 0); t = _tl[sid]
        b = {"start": t["startFrame"], "voice": t["voiceStartFrame"], "end": t["startFrame"] + t["durationFrames"]}.get(c)
        return (b if b is not None else next(x["frame"] for x in t["cues"] if x["id"] == c)) + o
    short = [(sc["id"], l["text"], fr(sc["id"], l["until"]) - fr(sc["id"], l["at"])) for sc in scenes for l in sc["props"].get("labels", [])]
    print("標籤 <45 幀：", [x for x in short if x[2] < 45])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
