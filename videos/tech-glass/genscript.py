"""tech-glass 腳本產生器：python3 videos/tech-glass/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
3-10：玻璃基板（科技透明圈 系列 3 第 10 集；前一集 3-9：BT 載板；下一集 3-11：銅箔基板）。念稿定稿於 script.md（頻道負責人 2026/11/27 定稿，一字不改）。
產生：python3 videos/tech-glass/genscript.py → node scripts/three/silent-timeline.mjs tech-glass → 再跑一次本檔（cue 來自 timeline.json）。
2D 卡：src/components/three/HudGlass.tsx（glass-*）。構造與物理：physics-spec.md；來源：research.md。寫法照 tech-bt/genscript.py。
Andy 規則：第 38 條不加運作音效；第 39 條旁白間無聲 ≤1 秒（念完留 0.6 秒）；第 40 條公司卡 ≥1.2 秒×家數＋1.5、念完最後一家後 ≥1 秒才換幕（不足就把卡片延到下一幕開頭）。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
ASOF = "2026/11/28"
# (id, beat, 念稿（＝script.md 原文）, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, 開口前只有畫面秒)
S = [
("s1", "hook", "玻璃做的載板，到底好在哪？接上一集，來看玻璃基板。",
 ["玻璃做的載板", "到底好在哪？", "接上一集", "來看玻璃基板"], ["A substrate made of glass:", "what's so good about it?", "Picking up from last episode,", "let's look at glass substrates."],
 [("glass", "玻璃做的"), ("good", "好在哪"), ("prev", "上一集"), ("gs", "玻璃基板")], ["玻璃", "載板"], ["Intel 新聞稿 2023/9/18；示意"], 0.0),
("s2", "you", "載板中間有塊芯板，平常是玻纖布泡樹脂做的。玻璃基板，就是把這塊換成一片玻璃。",
 ["載板中間有塊芯板", "平常是玻纖布", "泡樹脂做的", "玻璃基板", "就是把這塊", "換成一片玻璃"], ["In the middle of a substrate is a core,", "usually glass-fiber cloth", "soaked in resin.", "A glass substrate", "simply swaps that piece", "for a sheet of glass."],
 [("core", "芯板"), ("cloth", "玻纖布"), ("resin", "泡樹脂"), ("gs", "玻璃基板"), ("swap", "換成一片玻璃")], ["芯板", "玻纖布", "玻璃"], ["Intel 新聞稿 2023/9/18；示意"], 0.3),
("s3", "mechanism", "樹脂一受熱就會翹，像餅乾烤過邊會捲起來。晶片越大越翹，線就拉不細。",
 ["樹脂一受熱", "就會翹", "像餅乾烤過", "邊會捲起來", "晶片越大越翹", "線就拉不細"], ["Heat the resin", "and it warps,", "like a cookie after baking:", "its edges curl up.", "The bigger the chip, the worse,", "so lines can't get finer."],
 [("heat", "受熱"), ("warp", "就會翹"), ("cookie", "餅乾"), ("curl", "捲起來"), ("big", "晶片越大"), ("line", "拉不細")], ["受熱", "翹", "餅乾"], ["Intel 新聞稿 2023/9/18；示意，誇大"], 0.3),
("s4", "mechanism", "玻璃很平，受熱也不太變形，像在平的地磚上畫線，比地毯上細。英特爾說，線路密度可到十倍。",
 ["玻璃很平", "受熱也不太變形", "像在平的地磚上畫線", "比地毯上細", "英特爾說", "線路密度可到十倍"], ["Glass is flat", "and barely deforms when heated,", "like drawing lines on flat tiles:", "finer than on a carpet.", "Intel says", "wiring density can reach 10x."],
 [("flat", "很平"), ("heat", "受熱"), ("tile", "地磚"), ("carpet", "地毯"), ("intel", "英特爾"), ("ten", "十倍")], ["很平", "地磚", "十倍"], ["Intel 新聞稿 2023/9/18（英特爾自己的說法）；示意"], 0.3),
("s5", "twist", "但玻璃不導電，上下要接通，得打很多穿孔再鍍銅，像在玻璃窗上鑽洞，玻璃脆，一不小心就裂。",
 ["但玻璃不導電", "上下要接通", "得打很多穿孔", "再鍍銅", "像在玻璃窗上鑽洞", "玻璃脆", "一不小心就裂"], ["But glass doesn't conduct.", "To connect top and bottom,", "you make many through-holes", "and plate them with copper,", "like drilling a window pane.", "Glass is brittle:", "one slip and it cracks."],
 [("ins", "不導電"), ("conn", "接通"), ("hole", "穿孔"), ("cu", "鍍銅"), ("window", "玻璃窗"), ("brittle", "玻璃脆"), ("crack", "就裂")], ["穿孔", "鍍銅", "裂"], ["LPKF（LIDE）；MDPI Micromachines 2023；示意"], 0.3),
("s6", "payoff", "英特爾、三星電機都在做，還有一家南韓公司在美國蓋了專廠，台灣也有廠商在送樣。",
 ["英特爾、三星電機", "都在做", "還有一家南韓公司", "在美國蓋了專廠", "台灣也有廠商", "在送樣"], ["Intel and Samsung Electro-Mechanics", "are both working on it.", "A South Korean company", "built a dedicated plant in the US,", "and Taiwanese makers", "are sending samples."],
 [("intel", "英特爾"), ("sem", "三星電機"), ("kr", "南韓"), ("us", "美國"), ("tw", "台灣"), ("sample", "送樣")], ["英特爾", "三星電機", "送樣"], [f"SK 新聞；TrendForce；數位時代；截至 {ASOF}"], 0.3),
("s7", "payoff", "可是量產一延再延，多數說最快二零二七年以後，截至十一月底還沒確定。",
 ["可是量產", "一延再延", "多數說最快", "2027 年以後", "截至十一月底", "還沒確定"], ["But mass production", "keeps slipping.", "Most say the earliest", "is 2027 or later;", "as of late November,", "nothing is confirmed."],
 [("mass", "量產"), ("delay", "一延再延"), ("most", "多數"), ("early", "最快"), ("asof", "截至"), ("unk", "還沒確定")], ["量產", "一延再延", "還沒確定"], [f"TrendForce；科技新報；分析預期，截至 {ASOF}"], 0.3),
("s8", "cta", "所以現在主角還是樹脂芯板。下一集，看電路板最常見的銅箔基板。留言 玻璃基板，拿完整資料。",
 ["所以現在主角", "還是樹脂芯板", "下一集", "看電路板最常見的", "銅箔基板", "留言「玻璃基板」", "拿完整資料"], ["So for now, the star", "is still the resin core.", "Next episode:", "the most common circuit-board material,", "copper-clad laminate.", "Comment \"glass substrate\"", "for the full notes."],
 [("now", "主角"), ("resin", "樹脂芯板"), ("next", "下一集"), ("pcb", "電路板"), ("ccl", "銅箔基板"), ("kw", "留言")], ["樹脂芯板", "銅箔基板", "留言"], [f"截至 {ASOF}；示意"], 0.3),
]
HOLD = 0.6          # 念完後只有畫面的秒數（＋下一幕 headSec 0.2～0.3 ≤ 1.0；第 39 條）
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, head) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？]", "", z)) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？]", "", z)) >= 3, ("字幕短語 <3 字會被併入下一段、英文對位跑掉", sid, z)
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
scenes[0]["props"]["hook"] = {"kicker": "接上集：布再改還是會脹", "title": "玻璃做的載板？", "size": 120, "top": 272}
scenes.append({"id": "s9", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "銅箔基板", "trail": ["電路板最常見的材料"], "comment": "玻璃基板", "logoAnim": "transparent"}}})

# ═════════ 工具（照 tech-bt）═════════
FAR = "s9:start+400"
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

# ── 第 40 條：公司卡延長（依 timeline.json 自動算）──
_tlp = os.path.join(HERE, "timeline.json")
_tl = {x["id"]: x for x in json.load(open(_tlp))["scenes"]} if os.path.exists(_tlp) else {}
def ext_frames(sid, n, last_cue, name_len):
    nx = f"s{int(sid[1:]) + 1}"
    if sid not in _tl or nx not in _tl: return 0
    c0, c1 = _tl[sid]["voiceStartFrame"] - 3, _tl[nx]["voiceStartFrame"] - 3
    lc = next((c["frame"] for c in _tl[sid]["cues"] if c["id"] == last_cue), c0)
    need = round(max(3.5, 1.2 * n + 1.5) * 30) + 6
    return max(0, need - (c1 - c0), (lc + name_len * 6 + 30 + 3) - c1)
# s6 卡上 5 家（英特爾、三星電機、Absolics、欣興、群創）；最後念到的是「台灣」（廠商）＋「送樣」
EXTN = {"s7": ext_frames("s6", 5, "sample", 2)}
def SA(sid):
    n = EXTN.get(sid, 0); return f"voice{n - 3:+d}" if n else C
def SC(sid):
    n = EXTN.get(sid, 0); return f"voice{n - 4:+d}" if n else CC
def ENDV(sid):
    nx = f"s{int(sid[1:]) + 1}"; n = EXTN.get(nx, 0); return f"{nx}:voice{n - 1:+d}" if n else f"{nx}:voice-1"
def card(sid, kind, title, tag, t=None, **kw):
    return sec(kind, SA(sid), nxt(sid), title, tag, t, cut=True, **kw)
def carry(sid):
    if not EXTN.get(sid): return []
    pv = f"s{int(sid[1:]) - 1}"; o = json.loads(json.dumps(next(x for x in P[pv]["overlay"] if x.get("type") == "section")))
    o["at"], o["until"] = C, SA(sid)
    if "t" in o: o["t"] = {k: {"at": (v["at"] if ":" in v["at"] else f"{pv}:{v['at']}")} for k, v in o["t"].items()}
    return [o]

X = INFO
# ── 站 K（s1–s2）：爆炸剖面（上增層＋晶片往上、下增層＋錫球往下）→ 樹脂芯板往左抽走 → 玻璃芯板從右滑進來 → 合回 ──
UP = ["kT1", "kT2", "kT3", "kT4", "kSMt", "kChip"]; DN = ["kB1", "kB2", "kB3", "kB4", "kSMb", "kBalls"]
for i, l in enumerate(UP): VIS.append(mv(l, f"s2:core{-8 + i:+d}", "s2:swap+26", 16, dy=round(0.9 + i * 0.12, 2)))
for i, l in enumerate(DN): VIS.append(mv(l, f"s2:core{-8 + i:+d}", "s2:swap+26", 16, dy=-round(0.9 + i * 0.12, 2)))
VIS.append(mv("kCore", "s2:gs-2", FAR, 18, dx=-14.0)); vis("kCore", [(T0, "s2:swap+16")], 1)
vis("kGlass", [("s2:gs+6", FAR)], 1); VIS.append(mv("kGlass", T0, "s2:swap-8", 18, dx=14.0))
# ── 站 W（s3–s4）：加熱；樹脂兩端翹（念「就會翹」）；換大晶片翹更多；玻璃那片一直平；直尺念「很平」才放上去 ──
vis("wChipS", [(T0, "s3:big-2")], 1); vis("wChipB", [("s3:big-2", FAR)], 1); drop("wChipB", "s3:big-2", 0.5, 8)
drop("wRule", "s4:flat-4", 1.5, 12)
# ── 站 T（s5）：改質線一排排出現（雷射掃過）→ 蝕刻液＋開孔 → 鍍銅；鑽頭往下 → 裂紋、兩半分開 ──
vis("tMod0", [("s5:ins+6", "s5:hole+14")], 1); vis("tMod1", [("s5:conn-2", "s5:hole+14")], 1); vis("tMod2", [("s5:conn+10", "s5:hole+14")], 1)
vis("tEtchL", [("s5:hole-2", "s5:cu+4")], 2); vis("tHole", [("s5:hole+10", "s5:cu+8")], 2); vis("tCu", [("s5:cu-2", FAR)], 2)
VIS.append(mv("tDrill", T0, "s5:brittle-8", 14, dy=0.9))
vis("tCrack", [("s5:crack-6", FAR)], 1)
for l in ("tFrame", "tHead", "tBeamL", "tTank"): vis(l, [(T0, "s5:window+8")], 1); vis("tChips", [("s5:brittle+6", FAR)], 1)
VIS += [mv("tCoupL", "s5:crack-2", FAR, 8, dx=-0.18), mv("tCoupR", "s5:crack-2", FAR, 8, dx=0.18)]
# ── 站 C（s6）：念到才落下（英特爾＋美國旗、三星電機＋南韓旗、南韓公司的美國廠、台灣兩家＋台灣旗）；送樣箱往前送 ──
drop("cIntel", "s6:intel-8", 5.0, 14); drop("cfIntel", "s6:intel-2", 5.0, 14)
drop("cSem", "s6:sem-8", 5.0, 14); drop("cfSem", "s6:sem-2", 5.0, 14)
drop("cAbs", "s6:kr-8", 5.0, 14); drop("cfAbs", "s6:us-6", 5.0, 14)
drop("cUni", "s6:tw-8", 4.0, 14); drop("cInno", "s6:tw-4", 4.0, 14); drop("cfTw", "s6:tw", 4.0, 14)
drop("cBoxU", "s6:sample-10", 2.0, 10); drop("cBoxI", "s6:sample-6", 2.0, 10)
VIS += [mv("cBoxU", "s6:sample+8", FAR, 26, dz=2.2), mv("cBoxI", "s6:sample+12", FAR, 26, dz=2.2)]
# ── 站 Q（s7）：推車往 2027 推（量產）→ 被推回（一延再延）→ 2028 以後路標落下；冷熱循環一直跑；「尚未確定」牌念到才落下 ──
VIS.append(mv("qCart", "s7:mass-4", "s7:delay+10", 28, dx=6.2))
drop("qP28", "s7:most-4", 4.0, 14); drop("qUnk", "s7:unk-6", 3.0, 12)
# ── 站 N（s8）：銅箔基板一疊，最上面一組念「銅箔基板」才蓋上；招牌念到才落下 ──
drop("nTop", "s8:ccl-6", 2.0, 14); drop("nSign", "s8:ccl", 3.0, 12)

# ── 每一站只在用到它的幕出現 ──
def W(k): return f"s{k}:voice-6"
def E(k): return f"s{k}:voice-1"
STA = {"k": [(T0, E(3))], "w": [(W(3), E(5))], "t": [(W(5), E(6))], "c": [(W(6), ENDV("s6"))], "q": [(W(7) if not EXTN.get("s7") else f"s7:voice{EXTN['s7'] - 6:+d}", E(8))], "n": [(W(8), FAR)]}
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
P["s1"] = {"shot": [shot("start-30", X["KX"], 1.2, 36, 30, 1, yaw=0.0), shot("start", X["KX"], 1.0, 34, 26, 60), shot("prev-6", X["KX"], 1.4, 30, 14, 40)],
 "shift": VIS,
 "run": [run("kSig", "start-30", "s2:gs", 8), run("kSig2", "start-30", "s2:gs", 8)],
 "labels": [lab("kChip", "AI 晶片", "AI chip", "blue", "start+10", "gs")],
 "overlay": [sec("glass-hook", "start", nxt("s1"), "系列 3・第 10 集", "示意，非實際比例", {"glass": "glass", "good": "good", "prev": "prev", "gs": "gs"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "micro", "at": "start-8", "dur": 1}],
 "shot": [shot(CC, X["KX"], -0.8, 28, 12, 1), shot("gs-6", X["KX"] + 1.5, -0.8, 32, 12, 24)],
 "labels": [lab("kCore", "樹脂芯板（玻纖布＋樹脂）", "Resin core: glass cloth + resin", "amber", "core-2", "gs-2"),
            lab("kGlass", "玻璃芯板（穿孔鍍銅）", "Glass core with copper vias", "blue", "swap-4", "end")],
 "overlay": [card("s2", "glass-swap", "芯板換成一片玻璃", "示意", {"core": "core", "cloth": "cloth", "resin": "resin", "gs": "gs", "swap": "swap"})]}
P["s3"] = {"zoom": [{"to": "tool", "at": CC, "dur": 1}],
 "shot": [shot(CC, X["WX"] - 3.4, -0.4, 20, 16, 1)],
 "run": [run("wHeatGlow", "start-10", "s5:start", 8), run("wLampOn", "start-10", "s5:start", 8), run("wHotUp", "start-10", "s5:start", 6),
         run("wWarpL", "warp-6", "s5:start", 18), run("wWarpR", "warp-6", "s5:start", 18), run("wWarpL2", "big+4", "s5:start", 18), run("wWarpR2", "big+4", "s5:start", 18)],
 "labels": [lab("wRes", "樹脂芯板：受熱翹", "Resin core warps when heated", "amber", "heat-4", "big-4"), lab("wRes", "換大晶片：翹更多", "Bigger chip: more warp", "amber", "big-2", "end", xy=[540, 330])],
 "overlay": [card("s3", "glass-cookie", "樹脂受熱會翹", "示意，誇大", {"heat": "heat", "warp": "warp", "cookie": "cookie", "curl": "curl", "big": "big", "line": "line"})]}
P["s4"] = {"zoom": [{"to": "tool", "at": CC, "dur": 1}],
 "shot": [shot(CC, X["WX"] + 0.4, -1.2, 32, 18, 1), shot("intel-6", X["WX"] + 3.8, -0.2, 18, 22, 30)],
 "labels": [lab("wGlass", "玻璃芯板：貼平直尺", "Glass core stays flat", "blue", "flat-2", "intel-8"), lab("wLines", "線更細、更密", "Finer, denser lines", "blue", "intel-6", "end")],
 "overlay": [card("s4", "glass-tile", "玻璃很平，線畫得細", "英特爾 2023/9 說法；示意", {"flat": "flat", "tile": "tile", "carpet": "carpet", "intel": "intel", "ten": "ten"})]}
P["s5"] = {"zoom": [{"to": "tool", "at": CC, "dur": 1}],
 "shot": [shot(CC, X["TX"] + 1.5, 0.6, 34, 22, 1), shot("window+6", X["CPX"], 0.2, 20, 18, 26)],
 "run": [run("tScan", "start", "hole+12", 6), run("tLaserPulse", "start", "hole+12", 4), run("tEtchFlow", "hole-2", "cu+4", 6), run("tEtchBath", "hole-2", "s6:start", 6),
         run("tCuIons", "cu-4", "window", 6), run("tSig", "cu+16", "s6:start", 6), run("tDrillSpin", "window+6", "s6:start", 8), run("tChipsFly", "brittle+6", "crack+20", 4)],
 "labels": [lab("tMod", "雷射改質", "Laser modification", "amber", "ins", "hole-4"), lab("tCu", "蝕刻開孔→鍍銅接通", "Etch holes, then plate copper", "blue", "hole-2", "window+4"), lab("tCrack", "直接鑽：玻璃裂", "Drilling cracks it", "amber", "window+28", "end", xy=[790, 440])],
 "overlay": [card("s5", "glass-tgv", "玻璃穿孔（TGV）", "示意，不標孔徑", {"ins": "ins", "conn": "conn", "hole": "hole", "cu": "cu", "window": "window", "crack": "crack"})]}
P["s6"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [shot(CC, X["CX"] + 0.6, -0.4, 66, 28, 1)],
 "labels": [lab("cUni", "台灣廠商：送樣", "Taiwan makers: sampling", "amber", "tw-2", "end")],
 "overlay": [card("s6", "glass-co", "誰在做玻璃基板", f"公司說法、媒體報導；截至 {ASOF}", {"intel": "intel", "sem": "sem", "kr": "kr", "us": "us", "tw": "tw", "sample": "sample"}, h=400, y=990)]}
P["s7"] = {"zoom": [{"to": "co", "at": SC("s7"), "dur": 1}],
 "shot": [shot(SC("s7"), X["QX"] - 0.5, -0.4, 46, 20, 1)],
 "run": [run("qHot", "start", "s8:start", 6), run("qCold", "start", "s8:start", 6), run("qLampHot", "start", "s8:start", 6), run("qLampCold", "start", "s8:start", 6)],
 "labels": [lab("qTest", "可靠性測試：冷熱循環", "Reliability test: thermal cycling", "blue", SA("s7"), "early+6"), lab("qP27", "多數說：最快 2027 以後", "Most say: 2027 at the earliest", "amber", "early+8", "end")],
 "overlay": [card("s7", "glass-road", "量產一延再延", f"分析預期；截至 {ASOF} 尚未確定", {"mass": "mass", "delay": "delay", "most": "most", "early": "early", "unk": "unk"})]}
P["s8"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [shot(CC, X["NX"] + 1.5, -0.6, 52, 26, 1), shot("start", X["NX"] + 1.5, -0.6, 56, 28, 120)],
 "labels": [lab("nStack", "銅箔基板（下一集）", "Copper-clad laminate (next)", "blue", "ccl-2", "end")],
 "overlay": [card("s8", "glass-next", "下一集：銅箔基板", f"截至 {ASOF}", {"now": "now", "next": "next", "ccl": "ccl", "kw": "kw"})]}
for sid in EXTN:
    if EXTN[sid]: P[sid]["overlay"] = carry(sid) + P[sid]["overlay"]
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": f"查證截至 {ASOF}", "noteAlways": True}
levels = [lv("pkg", "AI 晶片封裝（示意）", "AI CHIP PACKAGE", "30 mm", "5 mm"), lv("micro", "載板爆炸剖面（示意）", "SUBSTRATE EXPLODED VIEW", "10 mm", "1 mm"),
          lv("tool", "實驗台（示意）", "LAB BENCH", "100 cm", "10 cm"), lv("co", "產業（示意）", "INDUSTRY", "100 m", "10 m")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-glass", "prevEpisode": "3-9：BT 載板", "title": "玻璃基板（科技透明圈）", "asOf": ASOF, "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "晶片往下游走", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b",
                 "_說明": "旁白金手指第三版（tech-andy-fixes 第 34 條）；第 43 條 API 配音由 tts-pitch-take.sh"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["玻璃基板", "好在哪？"], "sub": "芯板換成一片玻璃", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if re.search(r"[0-9a-z]|[A-Z]{2}", t): bad.append((s["id"], "數字或英文（大寫字母要拆開念）"))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes], "公司卡延長", EXTN)
if _tl:
    def fr(sid, a):
        if ":" in a: sid, a = a.split(":")
        m = re.match(r"([a-z0-9]+?)([+-]\d+)?$", a); c, o = m.group(1), int(m.group(2) or 0); t = _tl[sid]
        b = {"start": t["startFrame"], "voice": t["voiceStartFrame"], "end": t["startFrame"] + t["durationFrames"]}.get(c)
        return (b if b is not None else next(x["frame"] for x in t["cues"] if x["id"] == c)) + o
    short = [(sc["id"], l["text"], fr(sc["id"], l["until"]) - fr(sc["id"], l["at"])) for sc in scenes for l in sc["props"].get("labels", [])]
    print("標籤 <45 幀：", [x for x in short if x[2] < 45])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
