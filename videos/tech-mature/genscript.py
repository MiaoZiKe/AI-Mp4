"""tech-mature 腳本產生器：python3 videos/tech-mature/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
中游補充篇 M1：成熟與特殊製程代工（系列 2 結束後、系列 3 之前；開場接系列 1「晶圓代工」；下一集 M2「記憶體製造」）。念稿定稿於 script.md，一字不改。
產生：python3 videos/tech-mature/genscript.py → node scripts/three/silent-timeline.mjs tech-mature → 再跑一次本檔（cue 來自 timeline.json）。
2D 卡：src/components/three/HudMature.tsx（mature-*）。構造與物理：physics-spec.md；來源：research.md。寫法照 tech-glass/genscript.py。
Andy 規則：第 38 條不加運作音效；第 39 條旁白間無聲 ≤1 秒（念完留 0.6 秒）；第 40 條公司卡 ≥1.2 秒×家數＋1.5、念完最後一家後 ≥1 秒才換幕（s5、s6 共用一張公司卡，跨兩幕）。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
ASOF = "2026/11/28"
# (id, beat, 念稿（＝script.md 原文）, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, 開口前只有畫面秒)；字幕可用阿拉伯數字，念稿用中文數字
S = [
("s1", "hook", "前一集晶圓測完。每顆晶片都要三奈米嗎？",
 ["前一集晶圓測完", "每顆晶片", "都要 3 奈米嗎？"], ["Last episode, the wafer was fully tested.", "Does every chip", "need 3 nm?"],
 [("prev", "前一集"), ("chip", "每顆晶片"), ("nm3", "奈米"), ("q", "都要")], ["3 奈米", "先進"], ["示意，非特定手機"], 0.0),
("s2", "you", "不用。系列一講先進，二十八奈米以上叫成熟製程，像家常菜，天天少不了。",
 ["不用，系列一講先進", "28 奈米以上", "叫成熟製程", "像家常菜", "天天少不了"], ["No. Series one covered advanced nodes;", "28 nm and above", "is called a mature process,", "like home cooking:", "you need it every day."],
 [("no", "不用"), ("adv", "講先進"), ("n28", "奈米以上"), ("mature", "成熟製程"), ("dish", "家常菜"), ("daily", "天天少不了")], ["成熟製程", "家常菜"], ["TrendForce（28 奈米以上口徑）；示意"], 0.2),
("s3", "mechanism", "因為很多晶片管的是電。功率元件像水龍頭，控制大電流；電源管理晶片像配電盤，把電分好。",
 ["因為很多晶片", "管的是電", "功率元件像水龍頭", "控制大電流", "電源管理晶片", "像配電盤", "把電分好"], ["Because many chips", "handle power.", "A power device is like a faucet,", "switching big currents;", "a power-management chip", "is like a breaker panel,", "sharing the power out."],
 [("elec", "管的是電"), ("pwr", "功率元件"), ("tap", "水龍頭"), ("big", "大電流"), ("pmic", "電源管理"), ("board", "配電盤"), ("split", "把電分好")], ["功率元件", "水龍頭", "配電盤"], ["示意動畫，不是量測（不標電壓、電流）"], 0.3),
("s4", "mechanism", "還有驅動晶片，叫螢幕每個小點亮起來。多在八吋、十二吋廠做。",
 ["還有驅動晶片", "叫螢幕每個小點", "亮起來", "多在 8 吋", "12 吋廠做"], ["And driver chips", "tell every tiny dot on the screen", "to light up.", "They're mostly made in 8-inch", "and 12-inch fabs."],
 [("ddi", "驅動晶片"), ("pixel", "小點"), ("lit", "亮起來"), ("w8", "多在"), ("w12", "廠做")], ["驅動晶片", "8 吋", "12 吋"], ["Evertiq 2026/5、TrendForce（轉述）；示意"], 0.3),
("s5", "payoff", "台灣有三家。聯電，據 TrendForce 統計是全球第四大代工廠，強項是驅動晶片。",
 ["台灣有三家：聯電", "據 TrendForce 統計", "是全球第四大代工廠", "強項是驅動晶片"], ["Taiwan has three. First, UMC:", "per TrendForce,", "the world's No. 4 foundry,", "strong in driver chips."],
 [("tw", "台灣有三家"), ("umc", "聯電"), ("fourth", "第四大"), ("strong", "強項")], ["聯電", "第四大"], ["TrendForce 2026/9/9（2Q26 排名）；數位時代 2026/4"], 0.3),
("s6", "payoff", "世界先進，台積電也持股，主力是功率和電源晶片。力積電，除了記憶體，也幫人代工。",
 ["世界先進", "台積電也持股", "主力是功率和電源晶片", "力積電", "除了記憶體", "也幫人代工"], ["Vanguard (VIS),", "partly owned by TSMC,", "mainly makes power chips.", "Powerchip (PSMC):", "besides memory,", "it also makes chips for others."],
 [("vis", "世界先進"), ("tsmc", "台積電"), ("power", "功率"), ("psmc", "力積電"), ("mem", "記憶體"), ("fd", "代工")], ["世界先進", "力積電"], ["中央社；鏡週刊；科技新報 2026/7；聯合報"], 0.3),
("s7", "twist", "但中國在大擴產。據 TrendForce 預估，前十大成熟產能裡，中國廠將超過四分之一。",
 ["但中國在大擴產", "據 TrendForce 預估", "前十大成熟產能裡", "中國廠將超過", "四分之一"], ["But China is expanding fast.", "TrendForce projects", "that of the top ten's mature capacity,", "Chinese fabs will hold", "over a quarter."],
 [("cn", "中國在大擴產"), ("tf", "TrendForce"), ("top", "前十大"), ("over", "將超過"), ("quarter", "四分之一")], ["中國", "四分之一"], [f"TrendForce（分析預期：2025 年底超過 25%）；科技新報"], 0.3),
("s8", "twist", "新廠一直蓋，像夜市開滿攤，價格被壓低，所以台廠轉向車用、AI 伺服器電源較難的晶片。",
 ["新廠一直蓋", "像夜市開滿攤", "價格被壓低", "所以台廠轉向", "車用・AI 伺服器電源", "較難的晶片"], ["New fabs keep going up,", "like a night market full of stalls,", "so prices get pushed down.", "So Taiwan fabs are shifting", "to cars and AI server power:", "the harder chips."],
 [("fab", "新廠"), ("stall", "夜市"), ("many", "開滿攤"), ("price", "價格"), ("shift", "台廠轉向"), ("car", "車用"), ("ai", "AI"), ("hard", "較難")], ["夜市", "價格", "車用"], [f"TrendForce、Evertiq（分析預期）；截至 {ASOF}"], 0.3),
("s9", "cta", "成熟製程拚品項，下一集看更拚量的記憶體製造。留言成熟製程，拿完整資料。",
 ["成熟製程拚品項", "下一集看更拚量的", "記憶體製造", "留言「成熟製程」", "拿完整資料"], ["Mature nodes compete on variety;", "next, a chip that competes on volume:", "memory manufacturing.", "Comment \"mature process\"", "for the full notes."],
 [("item", "拚品項"), ("next", "下一集"), ("mem", "記憶體製造"), ("kw", "留言")], ["記憶體", "成熟製程"], [f"截至 {ASOF}；示意"], 0.3),
]
HOLD = 0.6
def em(z): return sum(0.55 if re.match(r"[A-Za-z0-9 ]", c) else 1 for c in re.sub(r"[，。？「」]", "", z))
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, head) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert em(z) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？、：「」]", "", z)) >= 3, ("字幕短語 <3 字", sid, z)
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar))
    hold = HOLD; dur = round(0.2 + head + nch / 5.2 + hold, 1)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": nar,
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
md = open(os.path.join(HERE, "script.md")).read()
for s in scenes: assert s["tts"] in md, ("念稿和 script.md 不一致", s["id"])
scenes[0]["props"]["hook"] = {"kicker": "接上集：晶圓測完了", "title": "都要 3 奈米？", "size": 120, "top": 272}
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "記憶體製造", "trail": ["中游補充篇 M2"], "comment": "成熟製程", "logoAnim": "transparent"}}})

# ═════════ 工具（照 tech-glass）═════════
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
def card(sid, kind, title, tag, t=None, until=None, **kw):
    return sec(kind, C, until or nxt(sid), title, tag, t, cut=True, **kw)

X = INFO
# ── 站 K（s1–s2，s3 後半）：先進 SoC 藍框（念「奈米」）→ 其他晶片橘框（念「成熟製程」）；s3 念「電源管理」時電從電池經功率開關進電源管理 IC，再分給 SoC、記憶體、螢幕 ──
vis("kGlow", [("s1:nm3-4", "s3:start")], 2)
# ── 站 P（s3 前半）：剖面念「管的是電」往上下分開、逐層標名 → 念「水龍頭」合回 → 念「大電流」閘極亮、通道亮、電流由下往上 ──
PL = ["pDrain", "pSub", "pDrift", "pBody", "pGate", "pSrcN", "pMetal", "pWire"]
for i, l in enumerate(PL): VIS.append(mv(l, f"s3:start{2 + 2 * i:+d}", "s3:tap+12", 12, dy=round(0.55 * i, 2)))
vis("pChan", [("s3:tap+20", "s4:start")], 2)
# ── 站 D（s4）：驅動 IC 念到後逐列點亮（每列晚 3 幀）；晶圓念「多在」落下 8 吋、「廠做」落下 12 吋 ──
for r in range(X["PYN"]): vis(f"dRow{r}", [(f"s4:pixel{-6 + 3 * r:+d}", FAR)], 1)
drop("dW8", "s4:w8-6", 2.0, 12); drop("dW12", "s4:w12-20", 2.0, 12)
# ── 站 F（s5–s6）：國旗念「台灣」；聯電、世界先進、力積電念到才落下；廠前產品樣本跟著落下 ──
drop("fFlag", "s5:tw-6", 3.0, 12); drop("fUmc", "s5:umc-8", 2.0, 14); drop("fVis", "s6:vis-8", 2.0, 14); drop("fPsmc", "s6:psmc-8", 2.0, 14)
drop("fProd", "s5:strong-6", 2.0, 12)
# ── 站 C（s7–s8）：國旗念「中國」；新廠一座座冒出（s7 念「中國在大擴產」起 3 座，s8 念「新廠」「夜市」「好多攤」再 6 座）；價格柱念「價格」往下沉 ──
drop("cFlag", "s7:cn-6", 1.0, 10)
for i, at in enumerate(["s7:cn+4", "s7:cn+14", "s7:cn+24", "s8:fab", "s8:stall", "s8:many"]): drop(f"cFab{i + 3}", at, 2.0, 12, 0.08)
drop("cPrice", "s8:fab-4", 1.0, 10)
drop("cSign", "s7:tf", 2.0, 12)
VIS.append(mv("cPrice", "s8:price-2", FAR, 30, dy=-3.2))
# ── 站 T（s8 後半）：車與機櫃念「台廠轉向」才出現；逆變器電流念「車用」、電源供應器念「AI」──
drop("tCar", "s8:shift+4", 2.0, 12); drop("tInv", "s8:shift+8", 2.0, 12); drop("tRack", "s8:shift+10", 3.0, 14); drop("tPsu", "s8:shift+14", 3.0, 14)
# ── 站 N（s9）：記憶體模組念「下一集」落下，名牌念「記憶體製造」 ──
drop("nDimm", "s9:next-6", 3.0, 14); drop("nSign", "s9:mem-4", 2.0, 12)

KX, KT, PX, PZ, PPX, DX, FX, CX, TX, NX = X["KX"], X["KT"], X["PX"], X["PZ"], X["PPX"], X["DX"], X["FX"], X["CX"], X["TX"], X["NX"]
# ═════ 各幕 ═════
P = {}
P["s1"] = {"shot": [shot("start-30", KX, 0.5, 36, 52, 1, yaw=0.0), shot("start", KX, 0.5, 34, 50, 60), shot("q-6", KX, 0.5, 38, 48, 40)],
 "shift": VIS,
 "run": [run("kAdv", "nm3-6", "s2:mature-4", 6)],
 "labels": [lab("kSoc", "處理器（先進製程）", "Processor (advanced node)", "blue", "chip-4", "end")],
 "overlay": [sec("mature-hook", "start", nxt("s1"), "中游補充篇 M1", "示意，非特定手機", {"prev": "prev", "nm3": "nm3", "q": "q"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "board", "at": "start-8", "dur": 1}],
 "shot": [shot(CC, KX, 0.5, 38, 48, 1), shot("mature", KX, 0.5, 36, 50, 40)],
 "run": [run("kMat", "mature-4", "s3:start", 6), run("kAdv", "start", "mature-4", 4)],
 "labels": [lab("kPmic", "電源管理晶片", "Power-management IC", "amber", "mature-2", "end"), lab("kMos", "功率元件", "Power devices", "amber", "mature+2", "end")],
 "overlay": [card("s2", "mature-dish", "成熟製程：28 奈米以上", "示意", {"no": "no", "n28": "n28", "dish": "dish", "daily": "daily"})]}
P["s3"] = {"zoom": [{"to": "device", "at": CC, "dur": 1}, {"to": "board", "at": "board-2", "dur": 1}],
 "shot": [shot(CC, PPX + 1.0, 3.0, 44, 14, 1, yaw=0.0), shot("tap+14", PPX + 0.8, 2.8, 45, 14, 30), shot("board-2", KX - 0.5, 0.5, 36, 52, 1)],
 "run": [run("pGateOn", "tap+14", "board-2", 4), run("pChanOn", "tap+18", "board-2", 4), run("pCur", "tap+20", "board-2", 6), run("pPkgCur", "tap+20", "board-2", 6),
         run("kPowIn", "board-2", "s4:start", 6), run("kPowSoc", "board+4", "s4:start", 6), run("kPowMem", "board+10", "s4:start", 6), run("kPowDisp", "split-6", "s4:start", 6)],
 "labels": [lab("pDrain", "汲極金屬＋N+ 基板", "Drain metal + N+ substrate", "blue", "start+6", "elec+12"),
            lab("pDrift", "N− 漂移層＋P 本體", "N− drift layer + P body", "blue", "start+8", "elec+12"),
            lab("pGate", "溝槽閘極（多晶矽＋氧化層）", "Trench gate: poly-Si in oxide", "amber", "elec+14", "tap+6"), lab("pMetal", "源極：N+、金屬、打線", "Source: N+, metal, bond wires", "blue", "elec+16", "tap+12"),
            lab("pChan", "閘極＝把手：通道打開，電流往上", "Gate = handle: channel opens, current flows up", "amber", "tap+16", "board-2"),
            lab("kPmic", "電源管理晶片", "Power-management IC", "amber", "board-2", "end")],
 "overlay": [card("s3", "mature-power", "晶片管電：開關與分配", "示意，不標電壓", {"elec": "elec", "tap": "tap", "big": "big", "board": "board", "split": "split"})]}
P["s4"] = {"zoom": [{"to": "panel", "at": CC, "dur": 1}],
 "shot": [shot(CC, DX - 1.0, -1.2, 32, 56, 1), shot("w8+4", DX + 10.2, 0.0, 39, 40, 18)],
 "run": [run("dFpcSig", "ddi-4", "s5:start", 6), run("dSig", "pixel-6", "s5:start", 6)],
 "labels": [lab("dDdi", "驅動晶片（貼在玻璃上）", "Driver IC on glass", "amber", "ddi-2", "w8+4"),
            lab("dW8", "8 吋（200 mm）", "8-inch (200 mm)", "blue", "w8+6", "end", xy=[300, 300]), lab("dW12", "12 吋（300 mm）", "12-inch (300 mm)", "blue", "w12-16", "end", xy=[740, 470])],
 "overlay": [card("s4", "mature-ddi", "驅動晶片點亮螢幕", "示意", {"ddi": "ddi", "pixel": "pixel", "w8": "w8", "w12": "w12"})]}
P["s5"] = {"zoom": [{"to": "fab", "at": CC, "dur": 1}],
 "shot": [shot(CC, FX + 0.3, -1.8, 48, 26, 1), shot("strong", FX, -1.8, 47, 27, 40)],
 "labels": [lab("fProd", "驅動晶片", "Driver ICs", "amber", "strong", "end")],
 "overlay": [card("s5", "mature-tw", "台灣三家成熟製程代工", f"公司公布、研究機構、媒體；截至 {ASOF}", {"tw": "tw", "umc": "umc", "vis": "s6:vis", "psmc": "s6:psmc"}, until="s7:voice-3", h=400, y=990)]}
P["s6"] = {"zoom": [{"to": "fab", "at": CC, "dur": 1}],
 "shot": [shot("start", FX, -1.8, 48, 28, 60)],
 "labels": []}
P["s7"] = {"zoom": [{"to": "fab", "at": CC, "dur": 1}],
 "shot": [shot(CC, CX - 2.6, 0.0, 35, 30, 1), shot("top", CX - 2.6, 0.0, 34, 32, 40)],
 "labels": [],
 "overlay": [card("s7", "mature-cn", "中國成熟製程擴產", "分析預期（TrendForce 預估）", {"cn": "cn", "tf": "tf", "quarter": "quarter"})]}
P["s8"] = {"zoom": [{"to": "fab", "at": CC, "dur": 1}],
 "shot": [shot(CC, CX - 2.4, 0.0, 35, 32, 1), shot("shift+4", TX - 3.0, 1.0, 42, 20, 1)],
 "run": [run("tInvCur", "car-2", "s9:start", 6), run("tPsuCur", "ai-2", "s9:start", 6), run("tLeds", "shift", "s9:start", 6), run("tFanSpin", "ai-4", "s9:start", 6)],
 "labels": [lab("cPrice", "價格被壓低", "Prices pushed down", "amber", "price-4", "shift+4"), lab("tInv", "逆變器的功率模組", "Inverter power modules", "amber", "car-2", "end", xy=[490, 470]),
            lab("tPsu", "AI 伺服器電源", "AI server power supplies", "amber", "ai-2", "end", xy=[560, 300])],
 "overlay": [card("s8", "mature-market", "新廠變多，台廠轉向", f"分析預期；截至 {ASOF}", {"stall": "stall", "price": "price", "car": "car", "ai": "ai"})]}
P["s9"] = {"zoom": [{"to": "fab", "at": CC, "dur": 1}],
 "shot": [shot(CC, NX, 1.4, 38, 18, 1), shot("start", NX, 1.4, 40, 18, 120)],
 "run": [run("nSig", "mem-4", "s10:start", 6)],
 "labels": [lab("nDimm", "記憶體（下一集）", "Memory (next episode)", "blue", "mem-2", "end")],
 "overlay": [card("s9", "mature-next", "下一集：記憶體製造", f"截至 {ASOF}", {"item": "item", "next": "next", "kw": "kw"})]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": f"查證截至 {ASOF}", "noteAlways": True}
levels = [lv("phone", "手機主機板（示意）", "PHONE MAINBOARD", "15 cm", "1 cm"), lv("board", "手機主機板（示意）", "PHONE MAINBOARD", "15 cm", "1 cm"),
          lv("device", "功率元件剖面（示意）", "POWER MOSFET CROSS-SECTION", "20 µm", "2 µm"), lv("panel", "螢幕與晶圓（示意）", "PANEL AND WAFERS", "50 cm", "10 cm"),
          lv("fab", "產業（示意）", "INDUSTRY", "100 m", "10 m")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-mature", "prevEpisode": "2-22：探針卡-2（系列 1：晶圓代工）", "title": "成熟與特殊製程代工（科技透明圈）", "asOf": ASOF, "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "中游補充篇", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b",
                 "_說明": "旁白金手指第三版（tech-andy-fixes 第 34 條）；第 43 條 API 配音由 tts-pitch-take.sh"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["不是每顆晶片", "都要 3 奈米"], "sub": "成熟製程撐起一大半", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
_tlp = os.path.join(HERE, "timeline.json")
_tl = {x["id"]: x for x in json.load(open(_tlp))["scenes"]} if os.path.exists(_tlp) else {}
print("念稿字數", n, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
if _tl:
    def fr(sid, a):
        if ":" in a: sid, a = a.split(":")
        m = re.match(r"([a-z0-9]+?)([+-]\d+)?$", a); c, o = m.group(1), int(m.group(2) or 0); t = _tl[sid]
        b = {"start": t["startFrame"], "voice": t["voiceStartFrame"], "end": t["startFrame"] + t["durationFrames"]}.get(c)
        return (b if b is not None else next(x["frame"] for x in t["cues"] if x["id"] == c)) + o
    short = [(sc["id"], l["text"], fr(sc["id"], l["until"]) - fr(sc["id"], l["at"])) for sc in scenes for l in sc["props"].get("labels", [])]
    print("標籤 <45 幀：", [x for x in short if x[2] < 45])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
