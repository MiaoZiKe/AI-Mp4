"""tech-abfsub 腳本產生器：python3 videos/tech-abfsub/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
ABF-2：ABF 載板（科技透明圈 系列 3 第 8 集；前一集 3-7：ABF 膜；下一集 3-9：BT 載板）。念稿定稿於 script.md（一字不改）。
產生：python3 videos/tech-abfsub/genscript.py → node scripts/three/silent-timeline.mjs tech-abfsub → 再跑一次本檔（cue 來自 timeline.json）。
2D 卡：src/components/three/HudAbfsub.tsx（abs-*）。構造與物理：physics-spec.md；來源：research.md。
Andy 規則：念稿 ≤260 字、一幕一件事、≥3 個比喻、數字 ≤2、爆炸分解步驟全做完、出處列只放真實來源；第 39 條旁白間無聲 ≤1 秒（念完留 0.6 秒）；第 40 條公司卡顯示時間。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, 無聲幕長秒（參考）, 開口前只有畫面秒, 念完後最少只有畫面秒)
S = [
("s1", "hook", "整塊載板，怎麼做出來？前一集，味之素的膜備好了。",
 ["整塊載板", "怎麼做出來？", "前一集", "味之素的膜備好了"], ["A whole substrate:", "how is it made?", "Last episode:", "Ajinomoto's film was ready."],
 [("q", "做出來"), ("prev", "前一集"), ("film", "膜")], ["載板", "做出來"], ["ECTC 2023（85 mm 有機載板實例）；示意動畫，不是量測"], 5, 0.0, 0.6),
("s2", "you", "載板夾在晶片和主機板中間，把細密的接點，拉成大顆的錫球。",
 ["載板夾在", "晶片和主機板中間", "把細密的接點", "拉成大顆的錫球"], ["The substrate sits", "between the chip and the motherboard,", "turning tiny dense contacts", "into big solder balls."],
 [("chip", "晶片"), ("mb", "主機板"), ("fine", "細密"), ("ball", "錫球")], ["晶片", "主機板", "錫球"], ["USPTO 12068300、8993378（覆晶球柵陣列結構）；示意"], 6, 0.3, 0.6),
("s3", "mechanism", "先做一塊硬的核心板，鑽穿、鍍銅、把孔補平，像先打好地基。",
 ["先做一塊硬的", "核心板", "鑽穿鍍銅", "把孔補平", "像先打好地基"], ["First, a stiff", "core board:", "drill through, plate copper,", "fill the holes flat,", "like laying a foundation."],
 [("core", "核心板"), ("drill", "鑽穿"), ("plate", "鍍銅"), ("fill", "補平"), ("base", "地基")], ["核心板", "鑽穿", "地基"], ["USPTO 8877565、9578755（核心鑽孔、鍍銅、塞孔）；示意"], 6, 0.3, 0.6),
("s4", "mechanism", "接著兩面同時往外蓋，兩邊一樣厚，板子才不會翹。",
 ["接著兩面", "同時往外蓋", "兩邊一樣厚", "板子才不會翹"], ["Then both sides", "build outward together,", "equally thick on each side,", "so the board won't warp."],
 [("two", "兩面"), ("out", "往外蓋"), ("even", "一樣厚"), ("warp", "不會翹")], ["兩面", "一樣厚", "不會翹"], ["iNEMI 大尺寸載板翹曲專題；USPTO 6969674；示意"], 5, 0.3, 0.6),
("s5", "mechanism", "每一層都重複貼膜、打洞、鍍銅，一層接通一層。",
 ["每一層都重複", "貼膜打洞鍍銅", "一層接通一層"], ["Every layer repeats:", "laminate film, drill, plate copper,", "each layer linked to the next."],
 [("film", "貼膜"), ("hole", "打洞"), ("cu", "鍍銅"), ("link", "接通")], ["貼膜", "打洞", "鍍銅"], ["MKS ESI Geode A 規格；旭化成 LDI 乾膜；示意動畫，不是量測"], 5, 0.3, 0.6),
("s6", "mechanism", "人工智慧晶片接腳超多，載板要做到接近十公分見方。",
 ["人工智慧晶片", "接腳超多", "載板要做到", "接近十公分見方"], ["AI chips have", "a huge number of pins,", "so the substrate grows", "to nearly 10 cm square."],
 [("ai", "人工智慧"), ("pins", "接腳"), ("ten", "十公分")], ["接腳", "十公分"], ["Ibiden；Counterpoint；Tom's Hardware；示意"], 5, 0.3, 0.6),
("s7", "twist", "兩面加起來二十多層。每多一層，就多一次出錯的機會，像闖關，一關失手就全毀。",
 ["兩面加起來", "二十多層", "每多一層", "就多一次出錯的機會", "像闖關", "一關失手就全毀"], ["Both sides together:", "twenty-plus layers.", "Each extra layer", "is one more chance to fail,", "like a game of levels:", "lose one, lose it all."],
 [("twenty", "二十多層"), ("more", "每多一層"), ("err", "出錯"), ("game", "闖關"), ("fail", "失手")], ["二十多層", "出錯", "闖關"], ["Ibiden 10-X-10；Counterpoint；SemiEngineering；示意"], 7, 0.3, 0.6),
("s8", "twist", "板子越大、層數越多，受熱越容易翹，像烤過頭的餅乾。",
 ["板子越大", "層數越多", "受熱越容易翹", "像烤過頭的餅乾"], ["The bigger the board", "and the more layers,", "the more it warps when heated,", "like an over-baked cookie."],
 [("big", "越大"), ("layers", "層數"), ("heat", "受熱"), ("cookie", "餅乾")], ["受熱", "翹", "餅乾"], ["iNEMI 大尺寸載板翹曲專題；ECTC 2023；示意動畫，不是量測"], 5, 0.3, 0.6),
("s9", "payoff", "台灣有欣興、南電、景碩，跟日本大廠搶單。",
 ["台灣有欣興", "南電景碩", "跟日本大廠搶單"], ["In Taiwan: Unimicron,", "Nan Ya PCB and Kinsus,", "competing with Japan's leaders."],
 [("tw", "台灣"), ("uni", "欣興"), ("nya", "南電"), ("kin", "景碩"), ("jp", "日本")], ["欣興", "南電", "景碩"], ["經濟日報；口袋學堂；Ibiden IR；截至 2026/11/27"], 5, 0.2, 0.6),
("s10", "cta", "不是每顆晶片都用得起這麼貴的載板。下一集，看另一種常見的載板。留言載板，拿完整資料。",
 ["不是每顆晶片", "都用得起", "這麼貴的載板", "下一集", "看另一種", "常見的載板", "留言載板", "拿完整資料"], ["Not every chip", "can afford", "such an expensive substrate.", "Next episode:", "another", "common substrate.", "Comment \"substrate\"", "for the full notes."],
 [("cost", "這麼貴"), ("next", "下一集"), ("other", "另一種"), ("kw", "留言載板")], ["載板", "下一集"], ["IEEE EPS 載板技術專文；Digitimes 2024/3/20；示意"], 7, 0.2, 0.6),
]
HOLD = 0.6          # 念完後只有畫面的秒數（＋下一幕 headSec 0.2～0.3 ≤ 1.0；第 39 條）
def TTS(t):
    t = t.replace("矽", "細")
    for a, b in [("上一集", "前一集"), ("量測", "測量")]:
        t = t.replace(a, b)
    return t
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, dur, head, tail) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？]", "", z)) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？]", "", z)) >= 3, ("字幕短語 <3 字會被併入下一段、英文對位跑掉", sid, z)
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar))
    # Andy 第 39 條（11-27 晚）：旁白之間的無聲 ≤1.0 秒＝本幕 holdSec＋下一幕 headSec；運作動畫在念的期間做完。幕長由念稿長度算（表上的幕長只當上限參考）
    hold = HOLD; dur = round(0.2 + head + nch / 5.2 + hold, 1)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
md = open(os.path.join(HERE, "script.md")).read()
for s in scenes: assert s["tts"] in md, ("念稿和 script.md 不一致", s["id"])
scenes[0]["props"]["hook"] = {"kicker": "接上集：膜備好了", "title": "載板怎麼做？", "size": 120, "top": 272}
scenes.append({"id": "s11", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "BT 載板", "trail": ["另一種常見的載板"], "comment": "載板", "logoAnim": "transparent"}}})

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
def drop(lay, at, dy=6.0, dur=16, bounce=0.06):
    """從上方落下（受重力、落地小彈跳）：at 之前藏在上方，at 開始落下"""
    vis(lay, [(at, FAR)], 1)
    VIS.append({"layer": lay, "at": T0, "until": at, "dur": dur, "dy": dy, "fallIn": True, "bounce": bounce, "opacity": 0})
# 換幕規則（照 tech-pad r1）：每幕的 3D 鏡頭、2D 卡、字幕、出處列在「字幕窗起點＝本幕 voice-3」同一幀換（卡片 cut：1 幀就位、1 幀收走）
C = "voice-3"
CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw):
    return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)

# ── 站 A（s1、s2）：s2 爆炸分解：晶片往上、載板往上、錫球與主機板留著 → 組回 ──
VIS += [mv("chip", "s2:chip-8", "s2:ball+12", 16, dy=2.8), mv("chipGlow", "s2:chip-8", "s2:ball+12", 16, dy=2.8), mv("sub", "s2:mb-8", "s2:ball+8", 16, dy=1.4), mv("bumps", "s2:mb-8", "s2:ball+8", 16, dy=1.4)]
# ── 站 B（s3～s5）：鑽孔 → 孔壁鍍銅 → 樹脂塞孔 → 刮平；兩面同時貼第 1 層膜；每層：雷射打洞 → 銅長進孔與線路 → 下一層膜 ──
VIS += [mv("bDrill", "s3:drill-6", "s3:drill+12", 12, dy=-3.4)]                 # 下鑽穿透 → 退刀
vis("bDrill", [(T0, "s3:drill+26")], 1)
vis("bPlug0", [(T0, "s3:drill+6")], 1); vis("bHole", [("s3:drill+6", FAR)], 1)
vis("bWall0", [("s3:plate-4", FAR)], 1); vis("bWall1", [("s3:plate+8", FAR)], 1)      # 孔壁銅：先薄後厚
for k in range(INFO["RS"]): vis(f"bResin{k}", [(f"s3:fill{k * 4 - 6:+d}", FAR)], 1)    # 樹脂由孔口往下灌
vis("bResinBump", [("s3:fill+8", "s3:base-4")], 1)
vis("bBlade", [("s3:base-16", "s3:base+8")], 1); VIS += [mv("bBlade", "s3:base-16", FAR, 18, dx=6.4)]   # 刮刀由左往右掃過
vis("bCap", [("s3:base-4", FAR)], 1)
def press(lay, at, dy):
    """膜壓合：在看不見時先停在外側，at 那一幀出現、往板子壓過去（不淡入、不靠重力）"""
    vis(lay, [(at, FAR)], 1); VIS.append(mv(lay, T0, at, 8, dy=dy))
FILM = {0: "s4:out-6", 1: "s5:cu+4", 2: "s5:link-2"}
HOLE = {0: "s5:hole-2", 1: "s5:cu+12", 2: "s5:link+6"}
FILL = {0: "s5:cu-2", 1: "s5:cu+20", 2: "s5:link+14"}
for k in range(3):
    for side in ("t", "b"):
        press(f"bF{k}{side}", FILM[k], 1.0 if side == "t" else -1.0)
        vis(f"bH{k}{side}", [(HOLE[k], FILL[k])], 1)
        vis(f"bV{k}{side}", [(FILL[k], FAR)], 1)
vis("bLaserT", [("s5:voice-3", FAR)], 1); vis("bLaserB", [("s5:voice-3", FAR)], 1)
BEAM = {0: ("s5:hole-8", "s5:hole-2"), 1: ("s5:cu+6", "s5:cu+12"), 2: ("s5:link+0", "s5:link+6")}   # 光束只在打孔那幾幀
vis("bBeamT", list(BEAM.values()), 1)
vis("bBeamB", list(BEAM.values()), 1)
BL = INFO["BL"]
for k, t in ((1, "s5:cu+2"), (2, "s5:link-6")):                                    # 打完一層，雷射頭往外退一層
    VIS += [mv(l, t, FAR, 6, dy=BL) for l in ("bLaserT", "bBeamT")] + [mv(l, t, FAR, 6, dy=-BL) for l in ("bLaserB", "bBeamB")]
# ── 站 E（s7）：二十多層逐層亮綠，第 15 層亮紅 → 整片紅、蓋✗ ──
EN, EBAD = INFO["EN"], INFO["EBAD"]
C0 = EN // 2                                                                         # 核心＝第 C0−1、C0 層
for k in range(EN):
    if k in (C0 - 1, C0): vis(f"eOk{k}", [("s7:twenty-14", FAR)], 1); continue          # 核心先亮
    i = (k - (C0 + 1)) if k > C0 else (C0 - 2 - k)                                      # 往外第 i 圈（上下同時）
    if k == EBAD: vis(f"eOk{k}", [("s7:err-4", FAR)], 1)
    elif i < EBAD - (C0 + 1): vis(f"eOk{k}", [(f"s7:twenty{i * 4 - 10:+d}", FAR)], 1)
    else: vis(f"eOk{k}", [], 1)
vis("eFail", [("s7:fail-4", FAR)], 3); vis("eX", [("s7:fail", FAR)], 2)
# ── 站 F（s8）：受熱發橘，各段往上翹（離中心越遠翹越高＝拋物線） ──
vis("fB0", [(T0, "s8:heat")], 1); vis("fB1", [("s8:heat", "s8:heat+8")], 1); vis("fB2", [("s8:heat+8", "s8:heat+16")], 1); vis("fB3", [("s8:heat+16", FAR)], 1)
# ── 站 G（s9）：三只紙箱念到才落下 ──
drop("g0", "s9:uni-8", 3.0, 12); drop("g1", "s9:nya-8", 3.0, 12); drop("g2", "s9:kin-8", 3.0, 12)
# ── 站 H（s10）：金線念到「另一種」才出現 ──
vis("hWire", [("s10:other-4", FAR)], 2)
# 第 40 條：公司卡（4 家：欣興、南電、景碩、揖斐電）完整顯示 ≥1.2×4＋1.5＝6.3 秒（189 幀），念完最後一家後 ≥1.0 秒；s9 不夠長時卡片與 s9 鏡頭延到 s10 開頭（延長期間 s10 鏡頭不動）。延長幀數依 timeline.json 自動算。
_tl = {x["id"]: x for x in json.load(open(os.path.join(HERE, "timeline.json")))["scenes"]} if os.path.exists(os.path.join(HERE, "timeline.json")) else {}
if "s9" in _tl and "s10" in _tl:
    _c0, _c1 = _tl["s9"]["voiceStartFrame"] - 3, _tl["s10"]["voiceStartFrame"] - 3
    _kin = next((c["frame"] for c in _tl["s9"]["cues"] if c["id"] == "kin"), _c0)
    CO_N = max(0, 195 - (_c1 - _c0), (_kin + 12 + 30) - _c1)   # 189 幀＋6 幀餘裕
else:
    CO_N = 0
EXT, EXTC = f"voice{CO_N - 3:+d}", f"voice{CO_N - 4:+d}"
# ── 每一站只在用到它的幕出現 ──
def W(k): return f"s{k}:voice-6"
def E(k): return f"s{k}:voice-1"
STA = {"A": (lambda l: l in ("balls", "sub", "chip", "chipGlow", "bumps"), [(T0, E(3))]),
       "B": (lambda l: re.match(r"^b[A-Z0-9]", l) is not None, [(W(3), E(6))]), "D": (lambda l: re.match(r"^d[A-Z0-9]", l) is not None, [(W(6), E(7))]),
       "E": (lambda l: re.match(r"^e[A-Z0-9]", l) is not None, [(W(7), E(8))]), "F": (lambda l: re.match(r"^f[A-Z0-9]", l) is not None, [(W(8), E(9))]),
       "G": (lambda l: re.match(r"^g[A-Z0-9]", l) is not None, [(W(9), "s10:" + EXT)]), "H": (lambda l: re.match(r"^h[A-Z0-9]", l) is not None, [(W(10), FAR)])}
for nm, (pred, wins) in STA.items():
    for l in LAYERS:
        if pred(l):
            prev = T0
            for a, b in wins:
                if a != T0: VIS.append(hid(l, prev, a, 1))
                prev = b
            if prev != FAR: VIS.append(hid(l, prev, FAR, 1))
VIS += [hid("mb", E(3), FAR, 1)]

# ═════ 各幕 ═════
P = {}
P["s1"] = {"shot": [shot("start-30", 0.0, 0.2, 64, 34, 1, yaw=0.0), shot("start", 0.0, 0.2, 60, 32, 150)],
 "shift": VIS,
 "run": [run("chipGlow", "start-30", "s2:start+6", 8)],
 "overlay": [sec("abs-hook", "start", nxt("s1"), "系列 3・第 8 集", "示意，非實際比例", {"q": "q", "prev": "prev", "film": "film"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "tool", "at": "start-8", "dur": 1}],
 "shot": [shot(CC, 0.0, 0.0, 56, 18, 1), shot("chip", 0.0, 0.4, 56, 16, 30)],
 "labels": [lab("chip", "晶片", "Chip", "blue", C, "chip+30"), lab("sub", "載板（頂面接細密凸塊）", "Substrate: fine bumps on top", "amber", "chip+32", "fine+24"), lab("balls", "大顆錫球，焊到主機板", "Big solder balls to the board", "blue", "fine+26", "ball+28")],
 "overlay": [card("s2", "abs-role", "晶片底下的轉接板", "示意", {"chip": "chip", "mb": "mb", "fine": "fine", "ball": "ball"})]}
BX = INFO["BX"]
P["s3"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, BX, 3.4, 54, 16, 1)],
 "run": [run("drillSpin", "drill-14", "drill+20", 8), run("drillChips", "drill-4", "drill+20", 4)],
 "labels": [lab("core", "核心板（玻纖＋樹脂）", "Core: glass fiber + resin", "amber", C, "plate-2", xy=[380, 300]), lab("resin", "孔壁鍍銅、樹脂塞平", "Plated hole, resin-filled", "blue", "plate", "base+30", xy=[730, 360])],
 "overlay": [card("s3", "abs-core", "先打好地基", "示意（不標孔徑）", {"core": "core", "drill": "drill", "plate": "plate", "fill": "fill", "base": "base"})]}
P["s4"] = {"shot": [shot(CC, BX, 3.0, 54, 14, 1)],
 "labels": [lab("filmT", "兩面同時貼膜", "Film on both sides", "amber", "out-4", "warp+20")],
 "overlay": [card("s4", "abs-sym", "兩邊一樣厚才不翹", "示意", {"two": "two", "out": "out", "even": "even", "warp": "warp"})]}
P["s5"] = {"shot": [shot(CC, BX + 1.0, 3.4, 56, 14, 1)],
 "run": [run("laserPulseT", "hole-8", "link+8", 4), run("laserPulseB", "hole-8", "link+8", 4)],
 "labels": [lab("via", "雷射打洞→銅填滿（停在下一層銅）", "Laser via, filled with copper", "amber", "hole-4", "link+30")],
 "overlay": [card("s5", "abs-layer", "一層三步", "示意（細節見前一集）", {"film": "film", "hole": "hole", "cu": "cu", "link": "link"})]}
P["s6"] = {"zoom": [{"to": "tool", "at": CC, "dur": 1}],
 "shot": [shot(CC, INFO["DX"] - 0.5, -5.6, 74, 42, 1)],
 "labels": [lab("dSmall", "一般晶片的載板", "A typical substrate", "blue", C, "ai+44"), lab("dBig", "人工智慧晶片的載板", "AI chip substrate", "amber", "ai+46", "ten-2"), lab("dRuler", "接近十公分", "Nearly 10 cm", "amber", "ten", "ten+46")],
 "overlay": [card("s6", "abs-size", "接近十公分見方", "Ibiden 路線圖、Counterpoint；示意", {"ai": "ai", "pins": "pins", "ten": "ten"})]}
P["s7"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, INFO["EX"], 2.2, 56, 12, 1)],
 "run": [run("failPulse", "fail", FAR, 8)],
 "labels": [lab("eStack", "兩面加起來二十多層", "20+ layers, both sides", "blue", "twenty", "err-6"), lab("eBad", "一層出錯", "One layer fails", "amber", "err-4", "fail+36")],
 "overlay": [card("s7", "abs-yield", "像闖關", "示意，非實際良率", {"twenty": "twenty", "more": "more", "err": "err", "game": "game", "fail": "fail"})]}
P["s8"] = {"shot": [shot(CC, INFO["FX"], 1.2, 50, 16, 1)],
 "run": [run("heatGlow", "heat-4", FAR, 8)],
 "labels": [lab("fWarp", "受熱翹起（示意）", "Warps when heated", "amber", "heat", "cookie+20")],
 "overlay": [card("s8", "abs-warp", "像烤過頭的餅乾", "示意（不標翹曲量）", {"big": "big", "layers": "layers", "heat": "heat", "cookie": "cookie"})]}
P["s9"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [shot(CC, INFO["PX"], -2.6, 78, 10, 1)],
 "overlay": [card("s9", "abs-co", "ABF 載板：相關公司", "公開資訊；截至 2026/11/27", {"tw": "tw", "uni": "uni", "nya": "nya", "kin": "kin", "jp": "jp"}, h=392, y=1000)]}
P["s10"] = {"zoom": [{"to": "tool", "at": EXTC, "dur": 1}],
 "shot": [shot(EXTC, INFO["HX2"], -2.4, 30, 34, 1)],
 "run": [run("wirePulse", "other", FAR, 8)],
 "labels": [lab("hSub", "另一種常見的載板（下一集）", "Another common substrate (next)", "blue", "other", "kw+30")],
 "overlay": ([sec("abs-co", C, EXT, "ABF 載板：相關公司", "公開資訊；截至 2026/11/27", {"tw": "s9:tw", "uni": "s9:uni", "nya": "s9:nya", "kin": "s9:kin", "jp": "s9:jp"}, h=392, y=1000, cut=True)] if CO_N else []) + [sec("abs-next", EXT, "s11:start", "接下來", "下一集：BT 載板", {"cost": "cost", "next": "next", "other": "other", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("tool", "載板與封裝（示意）", "PACKAGE SUBSTRATE", "30 cm", "5 cm"), lv("micro", "載板剖面放大（示意）", "SUBSTRATE CROSS-SECTION", "1 mm", "100 µm"), lv("co", "相關公司", "COMPANIES", "100 cm", "10 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-abfsub", "prevEpisode": "3-7：ABF 膜", "title": "ABF 載板（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "晶片往下游走", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b",
                 "_說明": "旁白金手指第三版（tech-andy-fixes 第 34 條）；本支未配音、不送 TTS"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["ABF 載板", "怎麼做？"], "sub": "核心板兩面一層層蓋", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
    for w in ["量測", "ABF", "BT"]:
        if w in (s.get("narration") or "") + s["subtitle"]["zh"]: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
