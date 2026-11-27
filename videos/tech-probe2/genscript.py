"""tech-probe2 腳本產生器：python3 videos/tech-probe2/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
探針卡-2：誰在做（科技透明圈 系列 2 第 22 集收尾；前一集 2-21：探針卡-1；下一個系列 3 第一集：晶圓切割與薄化）。念稿定稿於 script.md，**一字不改**。
旁白、cue、字幕、hook、片尾卡、hud、voice 與各幕 3D 動作（shot／shift／run／labels／overlay）都在這支；cue 來自 timeline.json，配音後重跑本檔即可。
2D 卡：src/components/three/HudProbe2.tsx（probe2-*）。構造與物理：physics-spec.md；模組清單與爆炸步驟對照：visual-spec.md。
規範：Andy 第 27 條（念稿 ≤260 字、關鍵畫面念完留 ≥1.2 秒）、第 28 條（≥3 個比喻）、第 29 條（爆炸步驟全做完）、第 32 條（出處列只放真實來源）。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
# (id, beat, 旁白（字幕原文）, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, 無聲幕長秒, 開口前只有畫面秒, 念完後最少只有畫面秒)
S = [
("s1", "hook", "這麼精細的卡，誰做得出來？前一集，一張探針卡有好幾萬根針。",
 ["這麼精細的卡", "誰做得出來？", "前一集", "一張探針卡", "有好幾萬根針"], ["A card this precise:", "who can make it?", "Last episode:", "one probe card", "holds tens of thousands of needles."],
 [("q", "誰做得出來"), ("prev", "前一集"), ("card", "探針卡"), ("needle", "好幾萬根針")], ["探針卡", "好幾萬根針"], ["示意動畫，不是量測"], 0, 0.0, 0.7),
("s2", "mechanism", "全球由少數幾家主導。美國的 FormFactor，八成營收都來自探針卡。",
 ["全球由少數幾家主導", "美國的", "FormFactor", "八成營收", "都來自探針卡"], ["A few companies lead worldwide.", "In the US,", "FormFactor", "gets about 80% of revenue", "from probe cards."],
 [("few", "少數幾家"), ("us", "美國"), ("ff", "FormFactor"), ("pct", "八成營收")], ["少數幾家", "FormFactor", "八成"], ["FormFactor 2025 財報；TrendForce 2026/6"], 0, 0.2, 0.7),
("s3", "mechanism", "針越多越難。像一次把一萬個圖釘壓進軟木板，高度差一點，就有幾根壓不到。",
 ["針越多越難", "像一次把一萬個", "圖釘壓進軟木板", "高度差一點", "就有幾根壓不到"], ["More needles, more trouble.", "Like pressing ten thousand", "pins into a corkboard at once:", "a tiny height difference,", "and some never touch."],
 [("more", "針越多越難"), ("pin", "圖釘"), ("gap", "高度差"), ("miss", "壓不到")], ["圖釘", "高度差", "壓不到"], ["示意動畫，不是量測（不標針數、針壓）"], 0, 0.3, 0.7),
("s4", "payoff", "台灣有旺矽。據報導，它的垂直式和懸臂式探針卡，在台廠排第一。",
 ["台灣有旺矽", "據報導", "它的垂直式", "和懸臂式探針卡", "在台廠排第一"], ["Taiwan has MPI.", "Media report", "its vertical", "and cantilever probe cards", "rank first among Taiwan makers."],
 [("tw", "台灣"), ("mpi", "旺矽"), ("rep", "據報導"), ("vert", "垂直式"), ("cant", "懸臂式"), ("first", "排第一")], ["旺矽", "垂直式", "懸臂式"], ["工商時報、旺得富（公司說法，媒體轉述）"], 0, 0.2, 0.7),
("s5", "payoff", "還有精測，做探針卡和測試板，客戶多是手機和 AI 晶片大廠。",
 ["還有精測", "做探針卡", "和測試板", "客戶多是手機", "和 AI 晶片大廠"], ["There's also CHPT,", "making probe cards", "and test boards;", "customers are mostly phone", "and AI chip giants."],
 [("chpt", "精測"), ("card", "探針卡"), ("board", "測試板"), ("phone", "手機"), ("ai", "AI")], ["精測", "測試板", "AI"], ["科技新報、鉅亨網（媒體報導）"], 0, 0.2, 0.7),
("s6", "mechanism", "探針卡其實是耗材。針會磨損，像鉛筆越寫越短，要定期保養更換。",
 ["探針卡其實是耗材", "針會磨損", "像鉛筆越寫越短", "要定期保養更換"], ["A probe card is actually a consumable.", "The needles wear down,", "like a pencil getting shorter,", "so they need regular care and replacement."],
 [("cons", "耗材"), ("wear", "磨損"), ("pencil", "鉛筆"), ("care", "保養"), ("swap", "更換")], ["耗材", "磨損", "鉛筆"], ["專利 USPTO 5961728（探針針尖清潔）；示意動畫，不是量測"], 0, 0.3, 0.85),
("s7", "twist", "AI 晶片腳數多、間距小，卡越做越難，台廠正趕過來。",
 ["AI 晶片腳數多", "間距小", "卡越做越難", "台廠正趕過來"], ["AI chips have many pins", "packed close together,", "so cards get harder to make,", "and Taiwan makers are catching up."],
 [("pins", "腳數多"), ("pitch", "間距小"), ("hard", "越做越難"), ("tw", "台廠")], ["腳數多", "間距小", "台廠"], ["TrendForce 2026/6（RP260626XO3，研究機構）；示意動畫"], 0, 0.0, 0.85),
("s8", "payoff", "設備、材料、廠務、測試，一片晶圓終於做完也測完了。",
 ["設備・材料", "廠務・測試", "一片晶圓", "終於做完也測完了"], ["Equipment, materials,", "facilities, testing:", "one wafer", "is finally made and tested."],
 [("eq", "設備"), ("mat", "材料"), ("fac", "廠務"), ("test", "測試"), ("done", "做完")], ["設備", "廠務", "測完"], ["示意動畫，不是量測"], 0, 0.0, 0.7),
("s9", "cta", "下一個系列，晶片往下游走。第一集，晶圓切割與薄化。留言探針卡廠，拿完整資料。",
 ["下一個系列", "晶片往下游走", "第一集", "晶圓切割與薄化", "留言探針卡廠", "拿完整資料"], ["Next series:", "chips move downstream.", "Episode one:", "wafer dicing and thinning.", "Comment \"probe card makers\"", "for the full notes."],
 [("next", "下一個系列"), ("down", "下游"), ("ep", "第一集"), ("dice", "切割"), ("kw", "留言探針卡廠")], ["下游", "切割", "探針卡廠"], ["示意動畫，不是量測"], 0, 0.2, 0.8),
]
def TTS(t): return t.replace("矽", "細")
def em(z): return sum(0.55 if re.match(r"[A-Za-z0-9 ]", c) else 1 for c in re.sub(r"[，。？]", "", z))
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, dur, head, tail) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert em(z) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？、]", "", z)) >= 3, ("字幕短語 <3 字", sid, z)
    for c in cues: assert c[1] in nar and c[1] in "".join(zh), (sid, c)
    # 第 39 條：念完留白 ≤1.0 秒；幕長＝開口前＋字數/5.2＋留白＋0.2，最短 4.5 秒
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar)); hold = tail
    dur = max(4.5, round(head + nch / 5.2 + hold + 0.2, 1)); hold = round(dur - head - nch / 5.2 - 0.2, 2) if dur == 4.5 else hold
    assert dur <= 10 and hold <= 1.0, (sid, dur, hold)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
md = open(os.path.join(HERE, "script.md")).read().split("---")[0].split("\n\n")[1:]
paras = [p.strip() for p in md if p.strip()]
assert [s["tts"] for s in scenes] == paras, ("念稿不一致", [s["tts"] for s in scenes], paras)
scenes[0]["props"]["hook"] = {"kicker": "接上集：好幾萬根針", "title": "誰做得出來？", "size": 120, "top": 236}
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "晶圓切割與薄化", "trail": ["系列 3：晶片往下游走"], "comment": "探針卡廠", "logoAnim": "transparent"}}})

# ═════════ 工具 ═════════
FAR = "s10:start+400"
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
# 換幕規則：3D 鏡頭、2D 卡、字幕、出處列在「字幕窗起點＝本幕 voice-3」同一幀換（卡片 cut：1 幀就位、1 幀收走）
C = "voice-3"
CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw): return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)
CARD = INFO["CARD"]
# ── 站 A：探針卡抬起、翻面（s1）→ 針高地圖（s3 開頭）→ 爆炸分解（s7）→ 組回、翻回、放回卡座（s7 念完後）→ 晶圓送出、晶粒一列列亮綠（s8）──
LIFT_A, LIFT_B = "s1:card-2", "s8:start+26"     # 抬高 → 翻面 → … → s7 組回、翻回後才放回卡座（落到 s8 開頭）
VIS += [mv(l, LIFT_A, LIFT_B, 20, dy=INFO["LIFT"]) for l in CARD]
vis("hmap", [("s3:more+6", "s3:pin-8")]); vis("laser", [("s3:start-2", "s3:pin-8")]); vis("lzRail", [("s3:start-2", "s3:pin-8")])
# s7 爆炸：②上下導板沿軸線展開（針林還穿在上導板）③前排一列針抽出、往鏡頭飄 ⑤空間轉換器往右上滑開、露出針尾焊墊 ⑧依反序組回
S7B = "s7:tw+4"
# 每一步做完停住再下一步；三張標籤各 45 幀、一次一張；組回順序：空間轉換器 → 前排針 → 導板與針林
RA = "s7:hard+93"
# 依序：②導板展開（間隙拉大）→ ③前排一列針整排抽出、往鏡頭與上方飄 → ⑤空間轉換器（等前一張標籤收掉才動）→ ⑧反序組回；組回後停住，s8 開頭才翻回、放下
# 第 39 條：一開口就拆、念完前組回；兩步兩張標籤（一次一張、各 45 幀）：①導板沿軸線展開＋前排一列針往左整排抽出 → ②空間轉換器往右上滑開 → 全拆停約 1 秒 → 反序組回（空間轉換器 → 前排針 → 導板與針林，各隔 6 幀）
EV = lambda n: f"s7:voice{n:+d}"
VIS += [mv(l, EV(2), EV(107), 16, dy=d) for l, d in (("lgp", 2.7), ("spc", 1.55), ("ugp", 0.45), ("nd", 1.0), ("ndRow", 1.0))]
VIS += [mv("ndRow", EV(10), EV(101), 14, dy=1.2, dx=-2.3),   # 往側邊（左）整排抽出
        mv("st", EV(50), EV(95), 12, dx=3.4, dy=0.25)]
# 鏡頭在高處看翻面的卡片時（s3 開頭、s7 爆炸），下方的載台與晶圓在 2D 卡後面、看不到：這兩段收起來（不算進主素材範圍），拉遠前再出現
for l in ["chuck", "wafer"]: vis(l, [(T0, "s3:start-6"), ("s3:pin-8", "s7:start-6"), ("s8:voice-4", FAR)], dur=8)
# s8：晶圓測完，載台沿導軌送到右側裝卸區；晶粒一列一列亮綠（設備、材料、廠務、測試）
for l in ["chuck", "wafer"] + [f"dieOk{k}" for k in range(INFO["DROWS"])]: VIS.append(mv(l, "s8:voice", FAR, 30, dx=9.4))
for k, cue in enumerate(["eq", "mat", "fac", "test"]): vis(f"dieOk{k}", [(f"s8:{cue}+14", FAR)])
# ── 站 M：一排針（s3 後半）：雷射掃過量針尖高度 → 整個頭壓下（一部分碰到、一部分壓不到）→ 超壓：針彎曲吸收高度差、全部碰到 ──
HEADM = ["mSt", "mUg", "mLg", "mNs", "mNb", "mHmap"]
OFF0, OVR = INFO["OFF0"], INFO["OVR"]
DOWN1, DOWN2 = "s3:gap-18", "s3:miss"   # 第 39 條：超壓在念「壓不到」時接著做完（念完前落定）
VIS += [mv(l, DOWN1, FAR, 24, dy=-OFF0) for l in HEADM]   # 超壓不做：念稿沒講，第 39 條也不允許念完後再演；s3 停在「壓不到」
VIS += [mv("mLaser", "s3:pin-2", FAR, 40, dx=12.8)]
vis("mLaser", [("s3:pin-9", "s3:pin+44")]); vis("mHmap", [("s3:pin+14", "s3:gap+10")])
vis("mNs", [(T0, FAR)]); vis("mNb", [])
vis("mC1", [("s3:gap+8", FAR)]); vis("mGap", [("s3:gap+8", FAR)]); vis("mC2", [])
# ── 站 W：單根針（s6）：接觸刮擦 → 磨鈍變短沾汙 → 清針片滑進、來回磨、粉末飛出 → 鑽子夾走舊針、新針落下 ──
# 第 39 條：清針與換針都在念的期間做完；舊針整根移開那條線之後新針才進來，換針整段約 1.5 秒；標籤一次一張、各 ≥45 幀
# 「磨損」針尖變鈍沾汙 → 清針片滑進、壓下來回磨約 0.9 秒（汙垢掉光，針尖仍是磨短的平頭）→ 鑷子從右邊進來夾住 → 舊針連鑷子往右上拔走、離開那條線
# →「保養」第二把鑷子夾著新針（尖、亮）從左上斜送進導板孔 → 放開、往左上退出，念完前收完
vis("wTipNew", [(T0, "s6:wear+6")]); vis("wTipWorn", [("s6:wear+6", "s6:care-2")]); vis("wDep", [("s6:wear+6", "s6:pencil+20")])
vis("wTipClean", [])
VIS += [mv("wPadL", "s6:wear+12", FAR, 10, dx=-8.0)]
VIS += [mv("wSheet", T0, "s6:wear+12", 10, dx=8.0)]
VIS += [mv(l, "s6:pencil+4", "s6:pencil+28", 6, dy=-0.13) for l in ("wNdl", "wTipWorn", "wDep")]
VIS += [mv("wTwz", T0, "s6:pencil+34", 8, dx=3.0, dy=0.2)]
VIS += [mv(l, "s6:pencil+36", FAR, 14, dx=3.0, dy=4.0) for l in ("wTwz", "wNdl", "wTipWorn")]
vis("wNdl", [(T0, "s6:care-2")]); vis("wTwz", [("s6:pencil+24", "s6:care-2")])
VIS += [mv(l, T0, "s6:care-2", 14, dx=-3.0, dy=4.0) for l in ("wNew", "wTwz2")]   # care−2 起 14 幀送到孔裡（舊針 care−17 已移開那條線）
VIS += [mv("wTwz2", "s6:care+16", FAR, 8, dx=-3.0, dy=4.0)]   # 放開停 2 幀後退出，念完那一幀收完
vis("wNew", [("s6:care-2", FAR)]); vis("wTwz2", [("s6:care-2", "s6:care+26")])   # 新針從左上斜送進導板孔

# ═════ 各幕 ═════
AX = 1.0
P = {}
P["s1"] = {"shot": [shot("start-30", 1.6, 2.4, 46, 28, 1, yaw=0.0), shot("start", 1.6, 2.4, 44, 28, 100), shot("card-2", 0.6, 6.5, 40, 40, 36)],
 "shift": VIS,
 "run": [run("touch", "start-30", "s1:card-4", 8), run("testLed", "start-30", "s1:card", 6), run("flip", "s1:needle-8", "s1:needle-7", 26)],
 "labels": [lab("card", "探針卡", "Probe card", "amber", "card", "card+36"),
            lab("needleFace", "針面", "Needle side", "blue", "needle+14", "needle+48")],
 "overlay": [sec("probe2-hook", "start", nxt("s1"), "系列 2・第 22 集（收尾）", "示意，非實際比例", {"prev": "prev", "q": "q", "needle": "needle"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "map", "at": "start-14", "dur": 1}],
 "shot": [shot(CC, INFO["FFX"] + 0.6, 1.6, 24, 22, 1)],   # 第 40 條：公司卡亮著時鏡頭不動
 "run": [run("ffPin", "us-4", "s3:start", 8)],
 "labels": [lab("ffFab", "美國探針卡廠", "US probe card maker", "blue", "ff", "ff+48", flag="US")],
 "overlay": [card("s2", "probe2-ff", "全球少數幾家主導", "FormFactor 2025 財報；TrendForce", {"few": "few", "us": "us", "ff": "ff", "pct": "pct"})]}
P["s3"] = {"zoom": [{"to": "card", "at": CC, "dur": 1}, {"to": "micro", "at": "pin-9", "dur": 1}],
 "shot": [shot(CC, 0.3, 7.3, 28, 44, 1), shot("pin-9", INFO["MX"], 3.9, 38, 10, 1)],
 "run": [run("lzScan", "start-2", "pin-8", 6), run("hmapGlow", "more+6", "pin-8", 6), run("mOk1", "gap+8", "s4:start", 6), run("mGapP", "gap+8", "s4:start", 6)],
 "labels": [lab("hmap", "針尖高度圖", "Tip height map", "amber", "more+6", "pin-10"),
            lab("mGap", "壓不到", "Not touching", "amber", "gap+12", "miss+30")],
 "overlay": [card("s3", "probe2-pin", "一萬個圖釘壓進軟木板", "示意（不標針數、針壓）", {"more": "more", "pin": "pin", "gap": "gap", "miss": "miss", "flex": "end+40"})]}
P["s4"] = {"zoom": [{"to": "map", "at": CC, "dur": 1}],
 "shot": [shot(CC, INFO["MPX"] + 0.4, 1.6, 20, 22, 1)],
 "run": [run("mpiPin", "tw-4", "s5:start", 8)],
 "labels": [lab("mpiFab", "旺矽（新竹）", "MPI, Hsinchu", "amber", "mpi", "mpi+48", flag="TW")],
 "overlay": [card("s4", "probe2-mpi", "台灣：旺矽 MPI", "公司說法，媒體轉述", {"tw": "tw", "mpi": "mpi", "rep": "rep", "vert": "vert", "cant": "cant", "first": "first"})]}
P["s5"] = {"zoom": [{"to": "map", "at": CC, "dur": 1}],
 "shot": [shot(CC, INFO["CHX"] - 0.2, 1.4, 21, 22, 1)],
 "run": [run("chPin", "chpt-4", "s6:start", 8)],
 "labels": [lab("chFab", "精測（平鎮）", "CHPT, Pingzhen", "blue", "chpt", "chpt+48", flag="TW")],
 "overlay": [card("s5", "probe2-chpt", "台灣：中華精測 CHPT", "媒體報導", {"chpt": "chpt", "card": "card", "board": "board", "phone": "phone", "ai": "ai"})]}
P["s6"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, INFO["WX"], 4.0, 24, 10, 1), shot("wear+4", INFO["WX"] + 0.3, 3.4, 19, 10, 30), shot("wear+4", INFO["WX"] + 0.8, 5.0, 30, 10, 14)],
 "run": [run("wTouch", "start-4", "wear+10", 8), run("wScrubAct", "start-4", "wear+10", 8), run("wContact", "start-4", "wear+10", 8),
         run("wPolish", "pencil+4", "pencil+28", 8), run("wDust", "pencil+6", "pencil+28", 6), run("wDust2", "pencil+8", "pencil+28", 6)],
 "labels": [lab("wTip", "針尖磨耗處", "Tip wear zone", "amber", "cons-16", "cons+29"),
            lab("wSheetA", "清針片", "Cleaning sheet", "blue", "wear+6", "pencil+34", xy=[230, 400]),
            lab("wNewA", "換上新針", "New needle", "amber", "care-2", "care+44", xy=[800, 430])],
 "overlay": [card("s6", "probe2-wear", "像鉛筆越寫越短", "示意（不標壽命次數）", {"cons": "cons", "wear": "wear", "pencil": "pencil", "care": "care", "swap": "swap"})]}
P["s7"] = {"zoom": [{"to": "card", "at": CC, "dur": 1}],
 "shot": [shot(CC, 1.4, 7.6, 34, 36, 1)],
 "run": [],
 "labels": [lab("lgp", "導板展開・抽出一排針", "Guide plates apart, a row out", "amber", "voice+4", "voice+49"),
            lab("st", "空間轉換器", "Space transformer", "blue", "voice+50", "voice+95")],
 "overlay": [card("s7", "probe2-ai", "AI 晶片：卡越做越難", "TrendForce 2026/6", {"pins": "pins", "pitch": "pitch", "hard": "hard", "tw": "tw"})]}
P["s8"] = {"zoom": [{"to": "card", "at": CC, "dur": 1}],
 "shot": [shot(CC, 3.0, 3.2, 46, 32, 1), shot("done-10", 8.4, 2.6, 31, 46, 34)],
 "run": [run("flipBack", "start", "start+1", 24), run("testLed", "eq", FAR, 6)],
 "labels": [lab("probe2", "測完的晶圓", "Tested wafer", "blue", "done", "done+48")],
 "overlay": [card("s8", "probe2-recap", "系列 2 收尾", "示意", {"eq": "eq", "mat": "mat", "fac": "fac", "test": "test", "done": "done"})]}
P["s9"] = {"zoom": [{"to": "next", "at": CC, "dur": 1}],
 "shot": [shot(CC, INFO["DX"] + 0.5, 1.8, 36, 44, 1), shot("dice-4", INFO["DX"] + 0.9, 1.9, 30, 34, 30)],
 "run": [run("bladeSpin", "start-4", FAR, 30)],
 "labels": [lab("dFrameA", "貼膜環框", "Tape frame", "amber", "down", "down+46"),
            lab("dBladeA", "切割刀", "Dicing blade", "blue", "dice", "dice+46")],
 "overlay": [sec("probe2-next", C, "s10:start", "接下來", "系列 3 預告", {"next": "next", "down": "down", "ep": "ep", "dice": "dice", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("card", "探針卡與探針台（示意）", "PROBE CARD & PROBER", "30 cm", "1 cm"), lv("map", "探針卡廠（示意位置）", "PROBE CARD MAKERS", "200 m", "50 m"),
          lv("micro", "探針放大（示意）", "PROBE CLOSE-UP", "1 cm", "1 mm"), lv("next", "下一個系列（預告）", "NEXT SERIES", "30 cm", "1 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-probe2", "prevEpisode": "2-21：探針卡-1", "title": "探針卡-2：誰在做（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b",
                 "_說明": "旁白金手指：依 docs/prompts/tech-旁白金手指.md；本子聊天室不配音、不送 TTS"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["探針卡", "誰做得出來？"], "sub": "一張卡好幾萬根針", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9]", t): bad.append((s["id"], "數字"))
    for w in ["量測", "上一集"]:
        if w in (s.get("narration") or "") + s["subtitle"]["zh"]: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes], "hold", [s.get("holdSec") for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
