"""tech-ccl 腳本產生器：python3 videos/tech-ccl/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
PCB-1：銅箔基板（科技透明圈 系列 3 第 11 集；前一集 3-10 玻璃基板；下一集 3-12 銅箔與玻纖布）。念稿定稿於 script.md（一字不改；念稿「台耀」＝字幕「台燿」）。
2D 卡：src/components/three/HudCcl.tsx（ccl-*）。構造與物理：physics-spec.md；模組清單：visual-spec.md。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
S = [
("s1", "hook", "載板看完了，主機板又是什麼做的？前一集看玻璃基板，這集看最常見的銅箔基板。",
 ["載板看完了", "主機板又是什麼做的？", "前一集看玻璃基板", "這集看最常見的", "銅箔基板"], ["Done with substrates.", "So what is a motherboard made of?", "Last episode: glass substrates.", "This time, the most common one:", "copper-clad laminate."],
 [("sub", "載板"), ("q", "什麼做的"), ("prev", "前一集"), ("ccl", "銅箔基板")], ["主機板", "前一集", "銅箔基板"], ["示意動畫，不是量測"]),
("s2", "mechanism", "它像夾心餅乾，中間是浸過樹脂的玻纖布，兩面貼銅箔。",
 ["它像夾心餅乾", "中間是浸過樹脂的", "玻纖布", "兩面貼銅箔"], ["It's like a sandwich cookie:", "in the middle, resin-soaked", "glass fabric,", "with copper foil on both sides."],
 [("cookie", "夾心餅乾"), ("fab", "玻纖布"), ("cu", "兩面貼銅箔")], ["夾心餅乾", "樹脂", "銅箔"], ["數位時代、專利 USPTO 4918812；示意（厚度放大）"]),
("s3", "mechanism", "玻纖布是玻璃絲織的布，像紗窗，撐住形狀。",
 ["玻纖布是", "玻璃絲織的布", "像紗窗", "撐住形狀"], ["Glass fabric is", "cloth woven from glass yarn,", "like a window screen,", "holding the shape."],
 [("glass", "玻璃絲"), ("screen", "紗窗"), ("hold", "撐住形狀")], ["玻璃絲", "紗窗", "撐住"], ["Isola 玻纖布型錄、IPC-4412；示意（放大）"]),
("s4", "mechanism", "布先泡樹脂，像紙巾吸飽醬汁，烘到半乾變膠片。",
 ["布先泡樹脂", "像紙巾吸飽醬汁", "烘到半乾變膠片"], ["The cloth is soaked in resin,", "like a paper towel soaking up sauce,", "then baked half-dry into prepreg."],
 [("soak", "泡樹脂"), ("towel", "紙巾"), ("dry", "烘到半乾"), ("pp", "膠片")], ["泡樹脂", "紙巾", "膠片"], ["專利 USPTO 4918812、11414532；示意動畫"]),
("s5", "mechanism", "疊好膠片、鋪好銅箔，又熱又壓，樹脂融了再變硬，整片黏成一塊。",
 ["疊好膠片", "鋪好銅箔", "又熱又壓", "樹脂融了再變硬", "整片黏成一塊"], ["Stack the prepreg,", "lay the copper foil,", "heat and press:", "the resin melts, then hardens,", "bonding it all into one sheet."],
 [("stack", "疊好膠片"), ("foil", "鋪好銅箔"), ("press", "又熱又壓"), ("melt", "融了"), ("glue", "黏成一塊")], ["膠片", "又熱又壓", "黏成一塊"], ["專利 USPTO 4918812、11414532；示意動畫，不是量測"]),
("s6", "mechanism", "板廠再把銅蝕刻成線路，訊號就沿著線路跑。",
 ["板廠再把銅", "蝕刻成線路", "訊號就沿著線路跑"], ["The board maker then", "etches the copper into traces,", "and signals run along them."],
 [("etch", "蝕刻"), ("run", "訊號就沿著")], ["蝕刻", "線路", "訊號"], ["數位時代、專利 USPTO 4918812；示意動畫"]),
("s7", "mechanism", "但人工智慧伺服器的訊號又快又多，一般材料會吃掉訊號，像在泥巴路跑步。",
 ["但人工智慧伺服器的", "訊號又快又多", "一般材料會吃掉訊號", "像在泥巴路跑步"], ["But in AI servers,", "signals are fast and many;", "ordinary material eats the signal,", "like running on a muddy road."],
 [("ai", "人工智慧伺服器"), ("fast", "又快又多"), ("eat", "吃掉訊號"), ("mud", "泥巴路")], ["人工智慧伺服器", "吃掉訊號", "泥巴路"], ["Altium、NextPCB 技術文章；示意動畫，不是量測"]),
("s8", "twist", "所以換成低損耗樹脂，吃掉的只剩大約十分之一，像把泥巴路鋪成跑道。",
 ["所以換成低損耗樹脂", "吃掉的只剩", "大約十分之一", "像把泥巴路鋪成跑道"], ["So switch to low-loss resin:", "the loss drops to", "about one tenth,", "like paving the mud into a track."],
 [("low", "低損耗樹脂"), ("tenth", "十分之一"), ("track", "跑道")], ["低損耗", "十分之一", "跑道"], ["Altium、NextPCB 技術文章；依材料與頻率而異"]),
("s9", "payoff", "台灣有台光電、聯茂、台燿，都在做這種高階基板。",
 ["台灣有台光電 聯茂 台燿", "都在做這種高階基板"], ["Taiwan has Elite Material, ITEQ and TUC,", "all making these high-end laminates."],
 [("tw", "台灣"), ("emc", "台光電"), ("iteq", "聯茂"), ("tuc", "台燿"), ("hi", "高階基板")], ["台光電", "聯茂", "台燿"], ["公司官網、財經媒體；截至 2026/11/28"]),
("s10", "cta", "樹脂換了，布和銅也得一起升級。布要多平、銅要多光滑？下一集看銅箔與玻纖布。留言銅箔基板，拿完整資料。",
 ["樹脂換了", "布和銅也得一起升級", "布要多平", "銅要多光滑？", "下一集看銅箔與玻纖布", "留言銅箔基板", "拿完整資料"],
 ["The resin has changed,", "so cloth and copper must upgrade too.", "How flat must the cloth be,", "how smooth the copper?", "Next: copper foil and glass fabric.", "Comment \"copper-clad laminate\"", "for the full notes."],
 [("up", "一起升級"), ("flat", "布要多平"), ("smooth", "銅要多光滑"), ("next", "下一集"), ("kw", "留言銅箔基板")], ["銅箔", "玻纖布", "銅箔基板"], ["示意動畫，不是量測"]),
]
def TTS(t):
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("矽", "細"), ("光罩", "光照"), ("台燿", "台耀")]:
        t = t.replace(a, b)
    return t
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？、；]", "", z)) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？、；]", "", z)) >= 3, ("字幕短語 <3 字", sid, z)
    assert re.sub(r"[ ，。？、；]", "", "".join(zh)) == re.sub(r"[ ，。？、；]", "", nar), (sid, "字幕和念稿不同")
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar))
    head = 0.0 if sid == "s1" else 0.3
    hold = 0.6   # 第 39 條：念完 0.6 秒換幕（＋下一幕開口前 0.3 秒＝無聲 0.9 秒）
    dur = round(head + nch / 5.2 + 0.2 + hold, 1)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
md = open(os.path.join(HERE, "script.md")).read().split("---")[0].split("\n\n")[1:]
paras = [p.strip() for p in md if p.strip()]
assert [s["tts"] for s in scenes] == paras, ("念稿與 script.md 不同", [s["tts"] for s in scenes], paras)
scenes[0]["props"]["hook"] = {"kicker": "接上集：電路板的原料", "title": "主機板是什麼做的？", "size": 92, "top": 236}
scenes.append({"id": "s11", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "銅箔與玻纖布", "trail": ["銅箔基板：銅箔＋膠片＋銅箔"], "comment": "銅箔基板", "logoAnim": "transparent"}}})

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
def drop(lay, at, dy=1.6, dur=12, bounce=0.06):
    """從上方受重力落下（之前不顯示）"""
    VIS.append({"layer": lay, "at": T0, "until": at, "dur": dur, "dy": dy, "fallIn": True, "bounce": bounce, "opacity": 0})
C = "voice-3"
CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw):
    return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)

# ── 站 K：s1 做好的電路板 → s2 換成銅箔基板夾心（爆炸：上銅箔與三張膠片往上分開，念到「兩面貼銅箔」再疊回） ──
vis("kPCB", [(T0, "s2:voice-4")], 1)
for l in ["kCuB", "kPP0", "kPP1", "kPP2", "kCuT"]: vis(l, [("s2:voice-4", FAR)], 1)
vis("kCookie", [("s2:cookie-4", FAR)], 6)
for k, (l, dy) in enumerate([("kPP0", 0.7), ("kPP1", 1.4), ("kPP2", 2.1), ("kCuT", 2.9)]):
    VIS.append(mv(l, f"s2:cookie+{2 + 3 * k}", f"s2:cu+{9 - 3 * k}", 12, dy=dy))   # 由上往下依序疊回：先落銅箔前的膠片…最後上銅箔
# ── 站 G：緯紗一根根織進去（從上方落下就位），念到「撐住形狀」整片亮一下 ──
for j in range(INFO["GN"]): drop(f"gF{j}", f"s3:voice+{4 + 7 * j}", dy=0.8, dur=10, bounce=0.04)
vis("gFil", [("s3:glass-6", FAR)], 6)
# ── 站 R：膠片一張張落到堆上（裁刀每下一張） ──
for k in range(6):
    drop(f"rPP{k}", f"s4:pp-{30 - 6 * k}", dy=0.5, dur=6, bounce=0.03)
    VIS.append({"layer": "rCutter", "at": f"s4:pp-{36 - 6 * k}", "until": f"s4:pp-{33 - 6 * k}", "dur": 3, "dy": -0.55, "fallOut": True, "bounce": 0.02})
# ── 站 H：一疊依序落下 → 上熱板壓下 → 樹脂從邊緣擠出 → 固化變深色 ──
HSEQ = [("hCuB", "s5:voice"), ("hPP0", "s5:stack+2"), ("hPP1", "s5:stack+7"), ("hPP2", "s5:stack+12"), ("hPP3", "s5:stack+17"), ("hCuT", "s5:foil"), ("hPlT", "s5:foil+8")]
for l, t in HSEQ: drop(l, t, dy=1.4, dur=10, bounce=0.04)
HPRESS = round(5.2 - INFO["HTOP"], 3)
VIS.append(mv("hTop", "s5:press-4", FAR, 16, dy=-HPRESS))
vis("hBleed", [("s5:melt", FAR)], 10); vis("hCore", [("s5:glue-4", FAR)], 12)
# ── 站 E：整片銅 → 噴藥 → 只剩線路 ──
vis("eCu0", [(T0, "s6:etch+18")], 10); vis("eTr", [("s6:etch+6", FAR)], 6)
# ── 站 S：s7 只有一般材料那道；s8 念到「低損耗」才放上低損耗那道 ──
drop("sLaneB", "s8:low", dy=1.2, dur=12, bounce=0.05); drop("sRxB", "s8:low", dy=1.2, dur=12, bounce=0.05)

# ═════ 各幕（看向 x, y, 距離, 仰角）═════
KV1 = (0.0, -0.6, 30, 38)     # 鉤子：做好的電路板
KV2 = (1.6, 1.4, 28, 16)      # 夾心爆炸（低角度看分層）
GV = (30.0, -1.2, 24, 46)      # 玻纖布織紋
RV = (61.4, 1.9, 33, 10)      # 含浸線側面
HV = (96.0, 2.6, 36, 8)       # 熱壓機
EV = (125.0, 0.6, 24, 42)     # 蝕刻線
SV = (155.0, 0.4, 30, 36)     # 損耗對照
VV = (185.0, 1.9, 36, 12)     # 供應商
NV = (215.0, 0.6, 26, 22)     # 下一集
def S_(at, v, dur=30, yaw=None): return shot(at, v[0], v[1], v[2], v[3], dur, yaw)
P = {}
P["s1"] = {"shot": [S_("start-30", KV1, 1, yaw=0.0)], "shift": VIS,
 "run": [run("kSig", "start-30", "s2:start", 4)],
 "overlay": [sec("ccl-hook", "start", nxt("s1"), "系列 3・第 11 集", "示意", {"sub": "sub", "q": "q", "prev": "prev", "ccl": "ccl"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "start", "at": "start-10", "dur": 1}, {"to": "pcb", "at": CC, "dur": 1}],
 "shot": [S_(CC, KV2, 1)],
 "labels": [lab("kCuTA", "銅箔：導電，之後做成線路", "Copper foil", "amber", "cookie+8", "cookie+53"),
            lab("kPPA", "膠片：玻纖布＋樹脂", "Prepreg: glass fabric + resin", "blue", "fab", "fab+45")],
 "overlay": [card("s2", "ccl-sand", "像夾心餅乾：銅箔／膠片／銅箔", "示意（厚度放大）", {"cookie": "cookie", "fab": "fab", "cu": "cu"})]}
P["s3"] = {"zoom": [{"to": "glass", "at": CC, "dur": 1}],
 "shot": [S_(CC, GV, 1)],
 "run": [run("gGlow", "hold-4", "s4:start", 6)],
 "labels": [lab("gFilA", "一根紗＝很多根玻璃絲", "Yarn = many glass filaments", "amber", "glass-3", "screen+1"),
            lab("gWarpA", "經紗緯紗上下交錯", "Warp and weft interlace", "blue", "screen+3", "screen+48")],
 "overlay": [card("s3", "ccl-fab", "玻纖布：玻璃絲織成，像紗窗", "示意（放大，不按比例）", {"glass": "glass", "screen": "screen", "hold": "hold"})]}
P["s4"] = {"zoom": [{"to": "treat", "at": CC, "dur": 1}],
 "shot": [S_(CC, RV, 1)],
 "run": [run("rUnSpin", "start-30", "s5:start", 10), run("rWebDryF", "start-30", "s5:start", 4), run("rWebWetF", "start-30", "s5:start", 4),
         run("rDrip", "towel-6", "s5:start", 4), run("rHeatGlow", "dry-6", "s5:start", 8), run("rHotAir", "dry-4", "s5:start", 6)],
 "labels": [lab("rTankA", "樹脂槽：布整片泡進去", "Resin bath", "amber", "soak", "soak+45"),
            lab("rOvenA", "烘箱：烘到半固化", "Oven: half-cured", "blue", "dry-8", "dry+37")],
 "overlay": [card("s4", "ccl-pp", "含浸：像紙巾吸飽醬汁", "示意（半乾＝半固化）", {"soak": "soak", "towel": "towel", "dry": "dry", "pp": "pp"})]}
P["s5"] = {"zoom": [{"to": "press", "at": CC, "dur": 1}],
 "shot": [S_(CC, HV, 1)],
 "run": [run("hHeat", "press-8", "s6:start", 8), run("hStackHot", "press+4", "glue", 8)],
 "labels": [lab("hPPA", "膠片四張，兩面鋪銅箔", "Prepreg stack + copper foil", "amber", "stack", "stack+45", xy=[400, 990]),
            lab("hTopA", "熱板壓下：又熱又壓", "Heated platens press", "blue", "press+2", "press+47", xy=[400, 990]),
            lab("hBleedA", "樹脂融了擠出一點，再變硬", "Resin flows, then cures", "amber", "glue-6", "glue+39", xy=[470, 990])],
 "overlay": [card("s5", "ccl-press", "熱壓：樹脂先融、再變硬", "示意（不標溫度與壓力）", {"stack": "stack", "foil": "foil", "press": "press", "melt": "melt", "glue": "glue"})]}
P["s6"] = {"zoom": [{"to": "etch", "at": CC, "dur": 1}],
 "shot": [S_(CC, EV, 1)],
 "run": [run("eSpray", "etch-10", "etch+30", 4)] + [run(f"eSig{k}", "run-4", "s7:start", 4) for k in range(3)],
 "labels": [lab("eSprayA", "藥水把多的銅吃掉", "Etchant removes copper", "amber", "etch-6", "etch+39"),
            lab("eSigA", "訊號沿著線路跑", "Signals run on the traces", "blue", "run", "run+45")],
 "overlay": [card("s6", "ccl-etch", "板廠：銅蝕刻成線路", "示意", {"etch": "etch", "run": "run"})]}
P["s7"] = {"zoom": [{"to": "loss", "at": CC, "dur": 1}],
 "shot": [S_(CC, SV, 1)],
 "run": [run("sA0", "start-10", "s9:start", 4), run("sA1", "start-10", "s9:start", 4), run("sA2", "start-10", "s9:start", 4), run("sSrvLed", "start-10", "s9:start", 4)],
 "labels": [lab("sLaneAA", "一般材料", "Ordinary material", "amber", "fast", "fast+45"),
            lab("sRxAA", "訊號被吃掉，到這只剩一點", "Signal fades", "blue", "eat", "eat+45")],
 "overlay": [card("s7", "ccl-mud", "一般材料：像在泥巴路跑步", "示意（光點大小＝訊號強弱）", {"ai": "ai", "fast": "fast", "eat": "eat", "mud": "mud"})]}
P["s8"] = {"run": [run("sB", "low+10", "s9:start", 4), run("sRxBGlow", "low+30", "s9:start", 6)],
 "labels": [lab("sLaneBA", "低損耗樹脂", "Low-loss resin", "blue", "low", "low+45"),
            lab("sRxBA", "到終點幾乎不減", "Arrives almost intact", "amber", "tenth+2", "tenth+47")],
 "overlay": [card("s8", "ccl-track", "低損耗：吃掉的只剩約十分之一", "推算；依材料與頻率而異", {"low": "low", "tenth": "tenth", "track": "track"})]}
# 第 40 條：三家公司 → 卡片完整顯示 ≥ 1.2×3＋1.5＝5.1 秒；不夠就把卡片與 s9 鏡頭延到 s10 開頭（照 tech-pad r7／tech-pkgmat r2），延長幀數依 timeline.json 自動算
_tl = {x["id"]: x for x in json.load(open(os.path.join(HERE, "timeline.json")))["scenes"]} if os.path.exists(os.path.join(HERE, "timeline.json")) else {}
if "s9" in _tl and "s10" in _tl:
    _c0, _c1 = _tl["s9"]["voiceStartFrame"] - 3, _tl["s10"]["voiceStartFrame"] - 3
    CO_N = max(0, 153 - (_c1 - _c0), (_tl["s9"]["voiceEndFrame"] + 30) - _c1)
else:
    CO_N = 0
EXT, EXTC = f"voice{CO_N - 3:+d}", f"voice{CO_N - 4:+d}"
CO = ("ccl-co", "銅箔基板供應商（台灣）", "公司官網、財經媒體；截至 2026/11/28")
P["s9"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [S_(CC, VV, 1)],
 "labels": [lab("vA1", "高階銅箔基板（示意）", "High-end laminates", "amber", "hi-6", "hi+39")],
 "overlay": [sec(CO[0], C, nxt("s9"), CO[1], CO[2], {"emc": "emc", "iteq": "iteq", "tuc": "tuc", "hi": "hi"}, cut=True, h=392, y=1000)]}
P["s10"] = {"zoom": [{"to": "next", "at": EXTC, "dur": 1}],
 "shot": [S_(EXTC, NV, 1)],
 "run": [run("nCuSpin", EXT, "s11:start", 10), run("nGlSpin", EXT, "s11:start", 10)],
 "labels": [lab("nGlA", "玻纖布：要多平？", "Glass fabric: how flat?", "blue", "flat-4", "flat+41"),
            lab("nCuA", "銅箔：要多光滑？", "Copper foil: how smooth?", "amber", "flat+43", "flat+88")],
 "overlay": ([sec(CO[0], C, EXT, CO[1], CO[2], {"emc": "s9:emc", "iteq": "s9:iteq", "tuc": "s9:tuc", "hi": "s9:hi"}, cut=True, h=392, y=1000)] if CO_N else []) + [sec("ccl-next", EXT, "s11:start", "下一集：銅箔與玻纖布", "留言「銅箔基板」", {"up": "up", "flat": "flat", "smooth": "smooth", "next": "next", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/28", "noteAlways": True}
levels = [lv("start", "電路板（示意）", "CIRCUIT BOARD", "10 cm", "1 cm"), lv("pcb", "銅箔基板（示意，厚度放大）", "COPPER-CLAD LAMINATE", "10 cm", "1 cm"),
          lv("glass", "玻纖布放大（示意）", "GLASS FABRIC", "1 mm", "0.1 mm"), lv("treat", "含浸線（示意）", "PREPREG TREATER", "10 m", "1 m"),
          lv("press", "熱壓機（示意）", "LAMINATION PRESS", "5 m", "1 m"), lv("etch", "蝕刻成線路（示意）", "ETCHING", "50 cm", "5 cm"),
          lv("loss", "損耗對照（示意）", "SIGNAL LOSS", "50 cm", "5 cm"), lv("co", "銅箔基板供應商", "SUPPLIERS", "100 cm", "10 cm"), lv("next", "銅箔與玻纖布（下一集）", "NEXT", "100 cm", "10 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-ccl", "prevEpisode": "3-10：玻璃基板", "title": "銅箔基板（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b", "_說明": "旁白金手指第三版；本支子聊天室不送 TTS，由頻道負責人配音"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["銅箔基板", "電路板的原料"], "sub": "銅箔＋膠片＋銅箔", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
for s in scenes:
    t = s.get("tts") or ""
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
    for w in ["量測", "矽", "台燿"]:
        if w in t: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
