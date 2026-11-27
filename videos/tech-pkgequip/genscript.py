"""tech-pkgequip 腳本產生器：python3 videos/tech-pkgequip/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
先進封裝設備（科技透明圈 系列 3 第 6 集；前一集 3-5 扇出型與晶圓級封裝；下一集 3-7 ABF 膜）。念稿定稿於 script.md（**一字不改**，本檔逐段比對）。
2D 卡：src/components/three/HudPkgequip.tsx（pe-*）。構造與物理：physics-spec.md；模組清單與爆炸步驟對應：visual-spec.md。
Andy 第 39 條：旁白之間的無聲 ≤1 秒（每幕念完留 0.85 秒）；第 40 條：公司卡 ≥1.2×家數＋1.5 秒（不夠就延到下一幕開頭）；第 18、21、22 條：念稿無縮寫、無「上」「量測」。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook", "晶片怎麼精準疊在一起？前一集說，晶片封在一起，需要更精密的機台。",
 ["晶片怎麼精準", "疊在一起？", "前一集說", "晶片封在一起", "需要更精密的機台"], ["How do chips get stacked", "so precisely?", "Last episode said", "packing chips together", "needs more precise tools."],
 [("q", "精準"), ("prev", "前一集"), ("tool", "精密的機台")], ["精準", "前一集", "精密的機台"], ["示意動畫，不是量測"]),
("s2", "mechanism", "先進封裝像組電腦，每一步都有專門的機台。",
 ["先進封裝像組電腦", "每一步都有", "專門的機台"], ["Packaging is like building a PC;", "every step has", "its own machine."],
 [("pc", "組電腦"), ("step", "每一步")], ["先進封裝", "組電腦"], ["SemiAnalysis CoWoS 供應鏈分析；USPTO 11967546；示意"]),
("s3", "mechanism", "接合機吸起晶片翻面，對準中介層放下，誤差比頭髮細得多。",
 ["接合機吸起晶片翻面", "對準中介層放下", "誤差比頭髮細得多"], ["The bonder picks up and flips the chip,", "aligns it to the interposer,", "with error far finer than a hair."],
 [("bond", "接合機"), ("flip", "翻面"), ("align", "對準"), ("hair", "頭髮")], ["接合機", "翻面", "頭髮"], ["ASMPT 覆晶接合機規格；SemiAnalysis；示意"]),
("s4", "mechanism", "記憶體要疊十幾層，熱壓接合機邊加熱邊加壓，像熨斗燙貼布，一層一層壓好。",
 ["記憶體要疊十幾層", "熱壓接合機", "邊加熱邊加壓", "像熨斗燙貼布", "一層一層壓好"], ["Memory stacks a dozen-plus layers;", "the thermo-compression bonder", "heats and presses at once,", "like ironing on a patch,", "layer by layer."],
 [("mem", "記憶體"), ("tcb", "熱壓接合機"), ("heat", "邊加熱"), ("iron", "熨斗"), ("layer", "一層一層")], ["十幾層", "熱壓接合機", "熨斗"], ["SemiAnalysis；USPTO 9252130；示意"]),
("s5", "mechanism", "晶片底下的縫要補膠，點膠機沿邊滴膠，膠自己鑽進縫裡，像水滲進磁磚縫。",
 ["晶片底下的縫要補膠", "點膠機沿邊滴膠", "膠自己鑽進縫裡", "像水滲進磁磚縫"], ["The gap under the chip needs glue;", "the dispenser drips along the edge,", "the glue wicks into the gap,", "like water seeping into tile grout."],
 [("gap", "縫要補膠"), ("disp", "點膠機"), ("wick", "鑽進"), ("tile", "磁磚")], ["補膠", "點膠機", "磁磚縫"], ["USPTO 8546191（毛細底部填膠）；示意動畫"]),
("s6", "mechanism", "有些晶圓得先貼到載板，再壓膜、烘烤，讓整片不翹。",
 ["有些晶圓得先貼到載板", "再壓膜、烘烤", "讓整片不翹"], ["Some wafers first go onto a carrier,", "then get laminated and baked", "so the whole wafer stays flat."],
 [("car", "載板"), ("lam", "壓膜"), ("flat", "不翹")], ["載板", "壓膜、烘烤", "不翹"], ["USPTO 11967546；工商時報 2026/4/10；示意"]),
("s7", "mechanism", "每做完一步，光學檢測機就拍照比對，揪出歪掉、缺膠的地方，像海關驗行李。",
 ["每做完一步", "光學檢測機就拍照比對", "揪出歪掉、缺膠的地方", "像海關驗行李"], ["After every step,", "the optical inspector shoots and compares,", "catching shifted chips and missing glue,", "like customs checking luggage."],
 [("step", "每做完"), ("aoi", "光學檢測機"), ("ng", "歪掉"), ("customs", "海關")], ["光學檢測機", "歪掉、缺膠", "海關"], ["萬潤、均豪公開資料；示意動畫，不是量測"]),
("s8", "payoff", "韓國韓美做記憶體的熱壓接合機；台灣有萬潤做點膠和檢測，志聖做壓膜烘烤。",
 ["韓國韓美做記憶體的", "熱壓接合機", "台灣有萬潤", "做點膠和檢測", "志聖做壓膜烘烤"], ["Korea's Hanmi makes memory", "thermo-compression bonders;", "in Taiwan, All Ring", "does dispensing and inspection,", "C Sun does lamination and baking."],
 [("kr", "韓美"), ("tw", "台灣"), ("ar", "萬潤"), ("cs", "志聖"), ("bake", "壓膜烘烤")], ["韓美", "萬潤", "志聖"], ["Asia Economy、TrendForce、工商時報"]),
("s9", "cta", "封好了，訊號還要靠載板拉出去。下一集，看載板裡的絕緣膜。留言封裝設備，拿完整資料。",
 ["封好了", "訊號還要靠載板拉出去", "下一集", "看載板裡的絕緣膜", "留言封裝設備", "拿完整資料"], ["Once packaged,", "signals exit through the substrate.", "Next episode:", "the insulating film inside it.", "Comment \"packaging tools\"", "for the full notes."],
 [("done", "封好了"), ("sub", "載板拉"), ("next", "下一集"), ("kw", "留言封裝設備")], ["載板", "絕緣膜", "封裝設備"], ["示意動畫，不是量測"]),
]
def TTS(t):
    t = t.replace("上集", "上一集").replace("上一一集", "上一集").replace("矽", "細").replace("光罩", "光照")
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("上百片", "一百多片")]:
        t = t.replace(a, b)
    return t
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    assert re.sub(r"[ 、]", "", "".join(zh)) == re.sub(r"[，。、；]", "", nar), (sid, "字幕與旁白文字不同")
    for z in zh: assert len(re.sub(r"[ ，。？]", "", z)) <= 11, (sid, z)
    for e in en: assert len(e) <= 42, (sid, e)
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    # Andy 第 39 條：念完留白 0.85 秒（＋silent-timeline 開口前 4 幀＝兩幕人聲間隔 1.00 秒）
    head = 0.0; hold = 0.85
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar)); dur = max(4.5, round(head + 0.2 + nch / 5.2 + hold, 1))
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
md = open(os.path.join(HERE, "script.md")).read()
blk = md.split("## 可直接貼 AI Studio 的念稿")[1].split("## 字幕與念稿差異")[0]
paras = [p.strip() for p in blk.split("\n\n")[1:] if p.strip()]
assert paras == [s["narration"] for s in scenes], ("念稿與 script.md 不同", paras)
scenes[0]["props"]["hook"] = {"kicker": "接上集：好幾顆晶片封在一起", "title": "記憶體疊 12 層", "size": 110, "top": 236}
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "ABF 膜", "trail": ["封好了，訊號靠載板拉出去"], "comment": "封裝設備", "logoAnim": "transparent"}}})

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

# ── s1：三顆晶片懸在中介層晶圓上方對位，念到「精密的機台」時落下 ──
VIS += [mv("wDies", "s1:tool", FAR, 18, dy=-1.15)]
# ── s2：晶圓盒沿 U 形軌走（前排往右） ──
VIS += [mv("lnFoup", "s2:voice", FAR, 110, dx=17.5)]
# ── s3 覆晶接合機：①外殼頂蓋與前窗往上掀開 ②對位相機往前抽出 ③組回；運作：頂針頂起→翻轉器翻面→接合頭接手→移到晶圓→放下 ──
B = INFO
VIS += [mv("bHood", "s3:voice-3", FAR, 18, dy=3.0), hid("bHood", "s3:voice+22", FAR, 10, 0)]   # 掀開後淡出（講內部時蓋子不擋）
VIS += [mv("bCam", "s3:align-2", "s3:align+40", 14, dz=1.6)]
vis("bPick", [(T0, "s3:flip-6")], 1); vis("bFlipDie", [("s3:flip-6", "s3:flip+22")], 1); vis("bCarry", [("s3:flip+22", FAR)], 1)
DXH, DZH = round(B["CX"] - 0.45 - B["HX0"], 3), -0.2
for l in ("bHead", "bCarry"):
    VIS += [mv(l, "s3:flip+24", FAR, 20, dx=DXH, dz=DZH)]
VIS += [mv("bHead", "s3:hair-14", "s3:hair+8", 12, dy=-0.9), mv("bCarry", "s3:hair-14", FAR, 12, dy=-0.9)]
# ── s4 熱壓接合：外罩左右分開（爆炸 2.2-1）→ 組回；疊層先有 8 層，念到「熱壓接合機」起再一層一層壓 4 層（每層：頭下壓、停、抬起） ──
VIS += [mv("tCoverL", "s4:voice-3", "s4:heat-6", 16, dx=-1.3), mv("tCoverR", "s4:voice-3", "s4:heat-6", 16, dx=1.3)]
TOP = lambda k: INFO["LAYY"][k] + 0.06 + 0.16
THY = INFO["LAYY"][11] + 0.22 + 1.2
for j, k in enumerate(range(8, 12)):
    t = f"s4:tcb+{j * 24}"
    drop = round(THY - TOP(k), 3)
    for l in ("tHead", "tCoverL", "tCoverR"):
        VIS += [mv(l, t, f"s4:tcb+{j * 24 + 12}", 8, dy=-drop)]
    VIS += [{"layer": f"tL{k}", "at": T0, "until": t, "dur": 8, "dy": round(drop, 3), "fallIn": True, "bounce": 0.0, "opacity": 0, "press": [f"tL{k - 1}"], "pressAmt": 0.03}]
# ── s5 點膠：點膠頭沿晶片左緣（z 方向）走；膠前緣由左往右分段推進（先快後慢）；最後右側膠邊 ──
VIS += [mv("dHead", "s5:disp", FAR, 70, dz=-3.6)]
UFT = [8, 18, 30, 44, 60, 78]
for k in range(6): vis(f"dUf{k}", [(f"s5:disp+{UFT[k]}", FAR)], 4)
vis("dFilL", [("s5:disp+6", FAR)], 4); vis("dFilR", [("s5:disp+84", FAR)], 4)
# ── s6 載板：滾輪由左往右滾過（翹起的晶圓依序被壓平），再整片送進烤箱 ──
VIS += [mv("cRoller", "s6:lam-10", FAR, 46, dx=6.4)]
for l in ("cCarrier", "cWafL", "cWafR"):
    VIS += [mv(l, "s6:flat+6", FAR, 26, dx=round(INFO["OX"] - INFO["CWX"], 3), dy=0.4)]
# ── s7 檢測：異常紅框念到「歪掉」才出現 ──
vis("aFlag", [("s7:ng-4", FAR)], 2)
# ── s9 載板：封好的晶片落到載板 ──
VIS += [{"layer": "sPkg", "at": T0, "until": "s9:done-6", "dur": 14, "dy": 2.5, "fallIn": True, "bounce": 0.04, "opacity": 0, "press": ["sSub"], "pressAmt": 0.03}]
VIS += [hid("sAbfGlow", T0, "s9:sub+48", 4, 0)]

P = {}
P["s1"] = {"zoom": [{"to": "room", "at": "start", "dur": 1}],
 "shot": [shot("start-30", 0.0, 0.17, 39, 30, 1, yaw=0.0), shot("start", 0.0, 0.17, 36.5, 30, 170)],
 "shift": VIS,
 "run": [run("wAlign", "start-30", "s2:start+4", 6)],
 "labels": [lab("wDie", "晶片對位中", "Chips being aligned", "amber", "q+6", "q+52")],
 "overlay": [sec("pe-hook", "start", nxt("s1"), "系列 3・第 6 集", "示意，非特定廠牌", {"q": "q", "prev": "prev", "tool": "tool"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "room", "at": "voice-18", "dur": 1}, {"to": "room", "at": CC, "dur": 1}],
 "shot": [shot(CC, 34.0, -2.22, 64.5, 32, 1)],
 "run": [run("lnFlow", "voice", "s3:start+4", 6), run("lnLamp", "pc", "s3:start+4", 6)],
 "labels": [lab("line0", "封裝線：五站", "Packaging line: 5 stations", "blue", "pc", "pc+46")],
 "overlay": [card("s2", "pe-line", "像組電腦：一站一台機台", "示意", {"pc": "pc", "step": "step"})]}
P["s3"] = {"zoom": [{"to": "room", "at": CC, "dur": 1}],
 "shot": [shot(CC, 78.0, 2.58, 49.5, 22, 1)],
 "run": [run("bPinUp", "flip-24", "flip-4", 6), run("bFlipTurn", "flip-4", FAR, 14), run("bSuck", "flip-8", "s4:start+4", 4), run("bCamGlow", "align+2", "align+40", 4)],
 "labels": [lab("bDeck", "接合機（外殼掀開）", "Flip-chip bonder", "blue", "voice-2", "voice+44", xy=[390, 962]),
            lab("bCam", "對位相機", "Alignment camera", "amber", "align", "align+46"),
            lab("bWafer", "放到中介層：誤差比頭髮細", "Placed far finer than a hair", "blue", "hair", "hair+46")],
 "overlay": [card("s3", "pe-flip", "翻面、對位、放下", "示意（不標精度數字）", {"bond": "bond", "flip": "flip", "align": "align", "hair": "hair"})]}
P["s4"] = {"zoom": [{"to": "room", "at": CC, "dur": 1}],
 "shot": [shot(CC, 112.0, 3.25, 49.5, 12, 1)],
 "run": [run("tHeat", "tcb-6", "s5:start+4", 10), run("tFilGlow", "tcb+8", "s5:start+4", 6)],
 "labels": [lab("tHeater", "加熱器（外罩分開）", "Heater", "amber", "voice-2", "voice+44"),
            lab("tNcf", "加熱＋加壓：膠膜擠出膠邊", "Heat + pressure", "amber", "heat+4", "heat+50"),
            lab("tStack", "記憶體疊層（示意 12 層）", "Memory stack (12 layers)", "blue", "layer+2", "layer+48")],
 "overlay": [card("s4", "pe-tcb", "像熨斗燙貼布：加熱又加壓", "示意（不標溫度、壓力）", {"mem": "mem", "tcb": "tcb", "heat": "heat", "iron": "iron", "ly": "layer"})]}
P["s5"] = {"zoom": [{"to": "room", "at": CC, "dur": 1}],
 "shot": [shot(CC, 142.0, 1.45, 41.0, 10, 1)],
 "run": [run("dDrop", "disp", "s6:start+4", 4), run("dWick", "disp+8", "s6:start+4", 6), run("dHot", "start", "s6:start+4", 6)],
 "labels": [lab("dNeedle", "點膠針頭", "Dispensing needle", "amber", "disp", "disp+46"),
            lab("dUf", "膠自己鑽進縫（毛細作用）", "Capillary flow", "blue", "disp+50", "disp+96")],
 "overlay": [card("s5", "pe-uf", "像水滲進磁磚縫", "示意（縫放大）", {"gap": "gap", "disp": "disp", "wick": "wick", "tile": "tile"})]}
P["s6"] = {"zoom": [{"to": "room", "at": CC, "dur": 1}],
 "shot": [shot(CC, 170.2, -0.26, 54.0, 22, 1)],
 "run": [run("cRoll", "lam-10", "lam+36", 6), run("cFlatL", "lam+2", FAR, 12), run("cFlatR", "lam+22", FAR, 12), run("cOvenHeat", "flat", "s7:start+4", 6)],
 "labels": [lab("cWafer", "晶圓貼到玻璃載板", "Wafer on a glass carrier", "blue", "car-2", "car+44"),
            lab("cRoll", "壓膜滾輪：翹起的地方被壓平", "Laminating roller", "amber", "car+48", "car+94")],
 "overlay": [card("s6", "pe-warp", "壓膜、烘烤：讓整片不翹", "示意（不標溫度）", {"car": "car", "lam": "lam", "flat": "flat"})]}
P["s7"] = {"zoom": [{"to": "room", "at": CC, "dur": 1}],
 "shot": [shot(CC, 208.0, 2.1, 44.0, 25, 1)],
 "run": [run("aScan", "start", "s8:start+4", 10), run("aRing", "aoi", "s8:start+4", 4), run("aNg", "ng-4", "s8:start+4", 4)],
 "labels": [lab("aCam", "相機頭（來回掃描）", "Camera head", "blue", "aoi", "aoi+46"),
            lab("aNg", "歪掉、缺膠（紅框）", "Shifted / missing glue", "amber", "ng+4", "ng+50")],
 "overlay": [card("s7", "pe-aoi", "像海關驗行李：拍照比對", "示意", {"step": "step", "aoi": "aoi", "ng": "ng", "customs": "customs"})]}
P["s8"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [shot(CC, 242.0, -1.08, 53.0, 20, 1)],
 "run": [run("kGlow", "kr", "s9:start+60", 6)],
 "overlay": [card("s8", "pe-co", "先進封裝設備廠", "報導；截至 2026/11/27", {"kr": "kr", "tw": "tw", "ar": "ar", "cs": "cs", "bake": "bake"})]}
# Andy 第 40 條：公司卡（3 家）完整顯示 ≥5.1 秒；不夠就連同 s8 鏡頭延到 s9 開頭（延長期間 s9 鏡頭不動）。延長幀數依 timeline.json 算
_tlp = os.path.join(HERE, "timeline.json")
_tl = {x["id"]: x for x in json.load(open(_tlp))["scenes"]} if os.path.exists(_tlp) else {}
CO_MIN = 153
CO_N = max(0, CO_MIN - ((_tl["s9"]["voiceStartFrame"] - 3) - (_tl["s8"]["voiceStartFrame"] - 3))) if "s9" in _tl and "s8" in _tl else 0
EXT, EXTC = f"voice{CO_N - 3:+d}", f"voice{CO_N - 4:+d}"
P["s9"] = {"zoom": [{"to": "room", "at": EXTC, "dur": 1}],
 "shot": [shot(EXTC, 276.0, -0.75, 41.0, 14, 1)],
 "run": [run("sSig", "sub", FAR, 6), run("sAbf", "sub+48", FAR, 6)],
 "labels": [lab("sPkg", "封好的晶片放到載板", "Package onto the substrate", "blue", "sub", "sub+46"), lab("sAbf", "載板裡的絕緣膜（下一集）", "Insulating film (next)", "amber", "sub+50", "sub+96")],
 "overlay": ([sec("pe-co", C, EXT, "先進封裝設備廠", "報導；截至 2026/11/27", {"kr": "s8:kr", "tw": "s8:tw", "ar": "s8:ar", "cs": "s8:cs", "bake": "s8:bake"}, cut=True)] if CO_N else [])
            + [sec("pe-next", EXT, "s10:start", "接下來", "下一集：ABF 膜", {"done": "done", "sub": "sub", "next": "next", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("room", "先進封裝設備（示意）", "ADVANCED PACKAGING TOOLS", "2 m", "50 cm"), lv("co", "先進封裝設備廠", "TOOL MAKERS", "2 m", "50 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-pkgequip", "prevEpisode": "3-5：扇出型與晶圓級封裝", "title": "先進封裝設備（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "AI 晶片怎麼做", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b",
                 "_說明": "旁白金手指：照 docs/prompts/tech-旁白金手指.md；本支子聊天室不配音、不送 TTS"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["先進封裝", "靠哪些機台？"], "sub": "接合、熱壓、點膠、壓烤、檢測", "frame": 40}, "sample": False, "scenes": scenes}
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
tot = sum(s["durationSec"] for s in scenes)
print("公司卡延到 s9 開頭幀數", CO_N)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
chk = subprocess.run(["node", "-e", 'import("./scripts/validate.mjs").then(({splitPhrases,SUB_MAX_EM_V2,clean})=>{const s=JSON.parse(require("fs").readFileSync("videos/tech-pkgequip/script.json","utf8"));let bad=[];for(const c of s.scenes){if(!c.subtitle.zh)continue;const z=splitPhrases(c.subtitle.zh,c.keywords,SUB_MAX_EM_V2),e=c.subtitle.en.split("|");if(z.length!==e.length||z.some(x=>clean(x).length<3))bad.push(c.id+":"+z.join("/"))}console.log(bad.length?"字幕切段不符 "+bad.join(" "):"字幕切段 OK");process.exit(bad.length?1:0)})'], cwd=os.path.join(HERE, "..", ".."), capture_output=True, text=True)
print(chk.stdout.strip()); assert chk.returncode == 0, chk.stdout
