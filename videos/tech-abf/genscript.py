"""tech-abf 腳本產生器：python3 videos/tech-abf/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
ABF-1：ABF 膜（科技透明圈 系列 3 第 7 集；前一集 3-6 先進封裝設備；下一集 3-8 ABF 載板）。念稿定稿於 script.md，**一字不改**（逐段比對）。
做法同 videos/tech-utility/genscript.py：標籤依 timeline.json 的 cue 幀排（每張 45 幀、一次一張、不早於換鏡、放不下就略過並警告）；
Andy 第 39 條：念完到下一幕開口合計 ≤1.0 秒；第 40 條：公司卡顯示 ≥1.2×家數＋1.5 秒、念完最後一家後再停 ≥1.0 秒。2D 卡：src/components/three/HudAbf.tsx（abf-*）。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
I = MODEL["info"]
KX, MX, LX, DX, SX, AX, JX, NX = (I[k] for k in ("KX", "MX", "LX", "DX", "SX", "AX", "JX", "NX"))
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues, keywords, sources, 無聲幕長秒(由公式重算), 開口前秒, 念完後秒(由公式重算))
S = [
("s1", "hook", "載板裡的絕緣膜，到底在隔什麼？前一集說，訊號要靠載板拉出去。",
 ["載板裡的絕緣膜", "到底在隔什麼？", "前一集說", "訊號要靠載板", "拉出去"], ["The insulating film in a substrate:", "what does it separate?", "Last episode:", "signals rely on the substrate", "to get out."],
 [("film", "絕緣膜"), ("q", "隔什麼"), ("prev", "前一集"), ("sig", "訊號")], ["絕緣膜", "隔什麼", "載板"], ["示意動畫，不是量測"], 6, 0.0, 1),
("s2", "mechanism", "載板像一棟大樓，每層樓都走滿銅線。層和層中間，要鋪一層絕緣膜隔開。",
 ["載板像一棟大樓", "每層樓都走滿銅線", "層和層中間", "要鋪一層絕緣膜", "隔開"], ["A substrate is like a building:", "every floor is full of copper lines.", "Between the floors,", "a layer of insulating film", "keeps them apart."],
 [("bld", "大樓"), ("cu", "銅線"), ("mid", "中間"), ("film", "絕緣膜")], ["大樓", "銅線", "絕緣膜"], ["Polymer Innovation Blog（增層膜剖面）；示意"], 8, 0.2, 1),
("s3", "mechanism", "這層膜很薄，像貼保鮮膜一樣一張張貼，壓平之後再加熱變硬。",
 ["這層膜很薄", "像貼保鮮膜一樣", "一張張貼", "壓平之後", "再加熱變硬"], ["This film is thin,", "applied like cling wrap,", "sheet by sheet,", "pressed flat,", "then heated until it hardens."],
 [("thin", "很薄"), ("wrap", "保鮮膜"), ("stick", "一張張貼"), ("press", "壓平"), ("heat", "加熱")], ["保鮮膜", "壓平", "加熱變硬"], ["Polymer Innovation Blog、USPTO 7893542；示意"], 7, 0.2, 1),
("s4", "mechanism", "接著用雷射在膜面打出小洞，像電梯井，讓兩層銅線接通。",
 ["接著用雷射", "在膜面打出小洞", "像電梯井", "讓兩層銅線接通"], ["Next, a laser", "drills tiny holes in the film,", "like elevator shafts,", "linking two copper layers."],
 [("laser", "雷射"), ("hole", "小洞"), ("lift", "電梯井"), ("conn", "接通")], ["雷射", "小洞", "電梯井"], ["Polymer Innovation Blog（雷射微孔）；示意動畫，不是量測"], 6, 0.2, 1),
("s5", "mechanism", "再鍍一層很薄的銅當草稿，只把要走線的地方鍍厚，最後把多的草稿洗掉。",
 ["再鍍一層很薄的銅", "當草稿", "只把要走線的地方鍍厚", "最後把多的草稿", "洗掉"], ["Then a very thin copper layer", "goes on as a draft;", "only the line areas are plated thick,", "and finally the extra draft", "is washed away."],
 [("seed", "很薄的銅"), ("draft", "草稿"), ("line", "要走線"), ("thick", "鍍厚"), ("wash", "洗掉")], ["草稿", "鍍厚", "洗掉"], ["iConnect007（Dow 半加成法論文）、IPC 部落格；示意"], 8, 0.2, 1),
("s6", "mechanism", "人工智慧晶片要拉出的線太多，載板得疊到十幾層，膜也越用越多。",
 ["人工智慧晶片", "要拉出的線太多", "載板得疊到十幾層", "膜也越用越多"], ["AI chips", "need far too many lines out,", "so substrates stack to over ten layers,", "using more and more film."],
 [("ai", "人工智慧"), ("many", "太多"), ("ten", "十幾層"), ("more", "越用越多")], ["人工智慧", "十幾層", "越用越多"], ["科技新報 2026/5/30、Tom's Hardware 2026；示意"], 7, 0.2, 1),
("s7", "payoff", "做這層膜的，是日本賣味精的味之素，從做味精的化學研究延伸出來。",
 ["做這層膜的", "是日本賣味精的", "味之素", "從做味精的", "化學研究延伸出來"], ["The film is made by", "Japan's MSG maker,", "Ajinomoto,", "growing out of", "its seasoning chemistry research."],
 [("make", "做這層膜"), ("jp", "日本"), ("aji", "味之素"), ("chem", "化學研究")], ["味之素", "味精", "化學研究"], ["味之素官方新聞室、日本半導體歷史館；截至 2026/11/27"], 7, 0.2, 1),
("s8", "payoff", "高階晶片用的這種膜，超過九成五來自味之素。台灣有晶化科技，在做自己的膜。",
 ["高階晶片用的這種膜", "超過九成五", "來自味之素", "台灣有晶化科技", "在做自己的膜"], ["For high-end chips,", "over 95 percent of this film", "comes from Ajinomoto.", "In Taiwan, a local company", "makes its own film."],
 [("high", "高階晶片"), ("share", "九成五"), ("aji", "來自味之素"), ("jh", "晶化科技"), ("own", "自己的膜")], ["九成五", "味之素", "晶化科技"], ["TrendForce 引日經、科技新報、經濟日報"], 7, 0.2, 1),
("s9", "cta", "膜鋪好了，整塊載板怎麼做出來？下一集，看味之素膜做成的載板。留言 A B F，拿完整資料。",
 ["膜鋪好了", "整塊載板怎麼做出來？", "下一集", "看味之素膜做成的載板", "留言 ABF", "拿完整資料"], ["The film is in place.", "How is the whole substrate made?", "Next episode:", "substrates made with this film.", "Comment \"ABF\"", "for the full notes."],
 [("done", "膜鋪好了"), ("how", "怎麼做出來"), ("next", "下一集"), ("kw", "留言")], ["下一集", "載板", "ABF"], ["示意動畫，不是量測"], 8, 0.0, 1),
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
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？]", "", z)) >= 3, ("字幕短語 <3 字會被併入下一段、英文對位跑掉", sid, z)
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    # Andy 第 39 條（11-27 晚）：旁白之間的無聲最多 1 秒 → 念完後只留 1.0 秒；幕長＝開口前＋念稿估時＋1.0（s9 公司卡另照第 40 條檢查）
    nh = S[i + 1][9] if i + 1 < len(S) else 0.0
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar)); hold = round(1.0 - nh - (0.13 if sid in ("s8", "s9") else 0), 2); dur = round(max(4.6, head + nch / 5.2 + 0.2 + hold), 2)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
md = open(os.path.join(HERE, "script.md")).read().split("---")[0]
paras = [p.strip() for p in md.split("\n\n")[1:] if p.strip() and not p.startswith("#") and not p.startswith("念稿")]
assert [s["narration"] for s in scenes] == paras, ("念稿與 script.md 不一致", [(a["narration"], b) for a, b in zip(scenes, paras) if a["narration"] != b])
scenes[0]["props"]["hook"] = {"kicker": "接上集：訊號要靠載板拉出去", "title": "絕緣膜隔什麼？", "size": 116, "top": 236}
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "ABF 載板", "trail": ["整塊載板怎麼做出來"], "comment": "ABF", "logoAnim": "transparent"}}})

# ═════════ 時間軸（有 timeline.json 就讀 cue 幀，用來排標籤）═════════
TL = {}
try:
    for s in json.load(open(os.path.join(HERE, "timeline.json")))["scenes"]:
        TL[s["id"]] = {"cue": {c["id"]: c["frame"] for c in s.get("cues", [])}, "vs": s.get("voiceStartFrame"), "ve": s.get("voiceEndFrame"), "st": s.get("startFrame"), "n": s.get("durationFrames")}
except Exception:
    pass
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
LEN = 45
def seq(sid, items):
    """items：[(part, 中文, 英文, 色, cue, 提前幀)]；依序排、每張 LEN 幀、一次一張；回傳 labels（at／until 寫成「cue+N」）"""
    out, prev_end = [], None
    for it in items:
        part, t, e, col, cue, off = it[:6]; xy = it[6] if len(it) > 6 else None
        if cue in ("end", "voice", "start"):
            base = {"end": TL.get(sid, {}).get("ve"), "voice": TL.get(sid, {}).get("vs"), "start": TL.get(sid, {}).get("st")}[cue]
        else:
            base = TL.get(sid, {}).get("cue", {}).get(cue)
        n = -off
        if cue == "end" and base is not None and TL[sid]["cue"]:
            # precheck 把「end」當幕尾（引擎是收聲），改寫成最後一個 cue＋N，兩邊意思一致
            lc = max(TL[sid]["cue"], key=lambda q: TL[sid]["cue"][q]); n = base - off - TL[sid]["cue"][lc]; cue, base, off = lc, TL[sid]["cue"][lc], -n
        if base is not None and prev_end is not None and base + n < prev_end + 2: n = prev_end + 2 - base
        if base is not None and TL.get(sid, {}).get("vs") is not None and base + n < TL[sid]["vs"] - 2: n = TL[sid]["vs"] - 2 - base   # 不早於本幕換鏡那一幀
        if base is not None:
            ids = [x[0] for x in S]; k = ids.index(sid)
            lim = (TL[ids[k + 1]]["vs"] - 10) if k + 1 < len(ids) and ids[k + 1] in TL else None
            if lim is not None and base + n + LEN > lim:
                print(f"⚠ {sid} 標籤「{t}」放不下（結束 {base + n + LEN} > 下一幕字幕起點 {lim}），略過"); continue
        out.append(lab(part, t, e, col, f"{cue}{n:+d}", f"{cue}{n + LEN:+d}", xy))
        prev_end = (base + n + LEN) if base is not None else None
    return out
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
C = "voice-3"          # 換幕：3D 鏡頭、HUD 層級、2D 卡、字幕、出處列在字幕窗起點同一幀換
CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw): return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)


# ═════ 站 K：爆炸分解（physics-spec §2：1 晶片抬起 → 2 載板離開主機板 → 3 一層層分開 → 4 切到放大剖面 → 5 組回）═════
KLAY = ["kBalls", "kSMb", "kB4", "kB3", "kB2", "kB1", "kCore", "kT1", "kT2", "kT3", "kT4", "kSMt", "kChip"]
KDY = [0.3, 0.45, 0.6, 1.2, 1.8, 2.4, 3.0, 3.6, 4.2, 4.8, 5.4, 6.0, 6.8]
DN = "s9:done"
VIS += [mv("kChip", "s1:sig+4", "s2:bld", 18, dy=1.2)]                                       # 步驟 1：晶片抬離載板
for i, (l, d) in enumerate(zip(KLAY, KDY)):                                                  # 步驟 2＋3：載板離開主機板、一層層分開（由上往下依序）；步驟 5：念「膜鋪好了」時由下往上落回
    VIS.append(mv(l, f"s2:bld-{(len(KLAY) - 1 - i) * 2}", f"{DN}+{i}", 12, dy=d))
# ── 站 L：膜從膜捲滑到芯板 → 撕保護膜 → 壓板下降壓平（抽真空、加熱）→ 變硬（顏色變深）→ 壓板抬起 → 撕承載膜 ──
for l in ("lResin", "lPet", "lCover"): VIS.append(mv(l, T0, "s3:thin", 22, dx=-5.5))
vis("lCover", [(T0, "s3:wrap+10")], 4)
VIS += [mv("lTop", "s3:press-10", "s3:heat-26", 10, dy=-3.1)]
vis("lCured", [])
VIS += [mv(l, T0, FAR, 1, dx=17.0, dz=1.2) for l in ("lOven", "lOvFan")]   # 烘烤爐放到壓膜機右邊（不被膜捲擋住）
vis("lPet", [(T0, "s3:heat-6")], 4)
# ── 站 D：雷射頭三個孔位（左→中→右），光錐只在打孔那幾幀出現，孔在打完後出現 ──
for l in ("dHead", "dBeamL"):
    VIS += [mv(l, T0, "s4:hole-8", 12, dx=-2.5), mv(l, "s4:lift-8", FAR, 12, dx=2.5)]
vis("dBeamL", [("s4:laser", "s4:laser+16"), ("s4:hole+4", "s4:hole+20"), ("s4:lift+4", "s4:lift+20")], 2)
vis("dHole0", [("s4:laser+10", FAR)], 3); vis("dHole1", [("s4:hole+14", FAR)], 3); vis("dHole2", [("s4:lift+14", FAR)], 3)
# ── 站 S：半加成法狀態 ──
vis("sSeed", [("s5:seed-16", "s5:wash+8")], 6)
vis("sEtchL", [("s5:wash-10", "s5:wash+30")], 6)
vis("dFill", [("s4:conn-24", FAR)], 6)
vis("sResist", [("s5:line-24", "s5:wash-10")], 6)
vis("sPlate1", [("s5:thick-10", "s5:thick+12")], 4)
vis("sPlate2", [("s5:thick+12", "s5:wash+8")], 4)
vis("sThin", [("s5:wash+8", FAR)], 4)
vis("sKeep", [("s5:wash+8", FAR)], 4)
# ── 站 J：念到哪家才實體（國旗獨立一層，永遠不透明）──
VIS += [hid("j1", "s7:start-6", "s8:jh-12", 6, 0.3)]

KL0 = (KX, -0.4, 40, 24)            # 站 K 合起來
KL1 = (KX, 2.0, 46, 14)            # 站 K 爆炸後
MLc = (MX, 2.4, 38, 10)
LLc = (LX - 1.0, 1.4, 42, 28)
DLc = (DX, 2.0, 32, 18)
SLc = (SX + 1.6, -0.2, 29, 18)
ALc = (AX - 0.6, -0.4, 50, 22)
JLc0 = (JX - 4.0, 1.0, 36, 14)
JLc1 = (JX + 0.4, -0.4, 58, 14)
NLc = (NX, -0.2, 32, 40)
def S_(at, c, dur=1): return shot(at, c[0], c[1], c[2], c[3], dur)
P = {}
P["s1"] = {"zoom": [{"to": "pkg", "at": "start-30", "dur": 1}, {"to": "pkg", "at": "q+8", "dur": 1}],
 "shot": [S_("start-30", KL0), shot("start", KL0[0], KL0[1], KL0[2] - 1.5, KL0[3], 80)],
 "shift": VIS,
 "run": [run("kSig", "start-30", "s2:bld-20", 6), run("kSig2", "start-30", "s2:bld-20", 6)],
 "labels": seq("s1", [("kSig", "訊號沿載板裡的線拉出去", "Signals routed out through the substrate", "amber", "sig", 4)]),
 "overlay": [sec("abf-hook", "start", nxt("s1"), "系列 3・第 7 集", "示意，非實際比例", {"film": "film", "q": "q", "prev": "prev", "sig": "sig"}, cut=True)]}
k2 = seq("s2", [("kT4", "每一層樓＝增層", "Each floor = a build-up layer", "blue", "bld", -10, [720, 960]), ("kTr", "銅線", "Copper lines", "amber", "cu", 2), ("mAbf", "絕緣膜（ABF）", "Insulating film (ABF)", "amber", "film", 4)])
P["s2"] = {"zoom": [{"to": "pkg", "at": CC, "dur": 1}, {"to": "micro", "at": "film-8", "dur": 1}],
 "shot": [S_(CC, KL0), shot("bld-26", KL1[0], KL1[1], KL1[2], KL1[3], 22), S_("film-8", MLc)],
 "run": [run("mSig", "film-8", "s3:voice-4", 6)],
 "labels": k2,
 "overlay": [card("s2", "abf-floor", "載板像一棟大樓", "示意", {"bld": "bld", "cu": "cu", "mid": "mid", "film": "film"})]}
P["s3"] = {"zoom": [{"to": "equip", "at": CC, "dur": 1}],
 "shot": [S_(CC, LLc), shot("press-10", LX + 2.0, 1.4, 33, 12, 20), shot("heat-18", LX + 10.0, 1.8, 26, 16, 12)],
 "run": [run("lPeelCover", "thin", "s4:voice-4", 14), run("lVacFlow", "press-10", "heat-26", 6), run("lHeatGlow", "press-4", "heat-26", 6), run("lPeelPet", "heat-22", "s4:voice-4", 10),
         run("lOvFanSpin", "start-4", "s4:voice-4", 10), run("lOvHot", "start-4", "s4:voice-4", 6)],
 "labels": seq("s3", [("lRoll", "ABF 膜捲（三層）", "ABF film roll (3 layers)", "blue", "thin", 6), ("lTop", "真空壓膜機：壓平", "Vacuum laminator", "amber", "press", 37), ("lCured", "烘烤爐：加熱變硬", "Oven cure hardens it", "amber", "heat", 6)]),
 "overlay": [card("s3", "abf-lam", "像貼保鮮膜：貼、壓、烤", "示意（不標溫度）", {"thin": "thin", "wrap": "wrap", "stick": "stick", "press": "press", "heat": "heat"})]}
P["s4"] = {"zoom": [{"to": "equip", "at": CC, "dur": 1}],
 "shot": [S_(CC, DLc)],
 "run": [run("dPlume0", "laser+4", "laser+40", 4), run("dPlume1", "hole+8", "hole+44", 4), run("dPlume2", "lift+8", "lift+44", 4), run("dLaserPulse", "laser", "lift+20", 4), run("dFillSig", "conn-18", "s5:start", 4)],
 "labels": seq("s4", [("dHead", "雷射頭：光收斂到膜面", "Laser head, focused", "blue", "laser", 2), ("dFill", "鍍銅填孔：上下兩層接通", "Plated via joins two layers", "amber", "conn", 16)]),
 "overlay": [card("s4", "abf-via", "雷射打孔，像電梯井", "示意", {"laser": "laser", "hole": "hole", "lift": "lift", "conn": "conn"})]}
P["s5"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [S_(CC, SLc)],
 "run": [run("sSeedRain", "seed-24", "seed+10", 4), run("sIonsDown", "thick-12", "thick+30", 4), run("sIons", "thick-12", "s6:voice-4", 6), run("sEtch", "wash", "wash+24", 4), run("sEtchBath", "wash-10", "wash+30", 4)],
 "labels": seq("s5", [("sSeed", "很薄的銅＝草稿", "Thin seed copper = draft", "blue", "seed", 14), ("sPlate", "只在開口鍍厚", "Plated thick in openings", "amber", "thick", 30), ("sEtch", "藥水把多的薄銅吃掉", "Etchant eats the extra seed", "amber", "wash", 16)]),
 "overlay": [card("s5", "abf-sap", "先打草稿，再描粗，再擦掉", "示意（不標線寬）", {"seed": "seed", "draft": "draft", "line": "line", "thick": "thick", "wash": "wash"})]}
P["s6"] = {"zoom": [{"to": "pkg", "at": CC, "dur": 1}],
 "shot": [S_(CC, ALc)],
 "labels": seq("s6", [("aSmall", "一般處理器載板", "Ordinary CPU substrate", "blue", "many", 4), ("aBig", "AI 晶片載板：十幾層", "AI chip substrate: 10+ layers", "amber", "ten", 4)]),
 "overlay": [card("s6", "abf-layers", "載板疊到十幾層", "報導（科技新報 2026/5/30）", {"ai": "ai", "many": "many", "ten": "ten", "more": "more"})]}
P["s7"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [S_(CC, JLc0)],
 "labels": seq("s7", [("j0", "味之素（日本）", "Ajinomoto (Japan)", "amber", "aji", 4)]),
 "overlay": [card("s7", "abf-aji", "做這層膜的：味之素", "官方新聞室；截至 2026/11/27", {"make": "make", "jp": "jp", "aji": "aji", "chem": "chem"})]}
P["s8"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [S_(CC, JLc1)],
 "labels": seq("s8", [("j1", "晶化科技（台灣）", "Taiwan film maker", "blue", "jh", 4)]),
 "overlay": [sec("abf-share", C, "s9:voice", "超過九成五來自味之素", "報導；截至 2026/11/27", {"high": "high", "share": "share", "aji": "aji", "jh": "jh", "own": "own"}, cut=True, h=392, y=1000)]}
P["s9"] = {"zoom": [{"to": "pkg", "at": "voice-1", "dur": 1}, {"to": "next", "at": "next-6", "dur": 1}],
 "shot": [S_("voice-1", KL1), shot("done+26", KL0[0], KL0[1], KL0[2], KL0[3], 14), S_("next-6", NLc)],
 "labels": seq("s9", [("nPanel", "ABF 載板（下一集）", "ABF substrate (next)", "amber", "next", -2)]),
 "overlay": [sec("abf-next", "voice", "s10:start", "接下來", "下一集：ABF 載板", {"done": "done", "how": "how", "next": "next", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])
lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("pkg", "AI 晶片載板剖面（示意）", "SUBSTRATE CROSS-SECTION", "20 mm", "5 mm"), lv("micro", "增層放大剖面（示意）", "BUILD-UP LAYERS", "100 µm", "20 µm"),
          lv("equip", "載板製程設備（示意）", "SUBSTRATE PROCESS TOOLS", "2 m", "50 cm"), lv("co", "增層膜供應商（示意）", "FILM SUPPLIERS", "50 m", "10 m"), lv("next", "ABF 載板（下一集）", "ABF SUBSTRATE PANEL", "50 cm", "10 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-abf", "prevEpisode": "3-6：先進封裝設備", "title": "ABF 膜（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "先進封裝", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b",
                 "_說明": "旁白金手指；本支無聲版，不送 TTS（配音由頻道負責人統一做）"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["ABF 膜", "載板裡的絕緣膜"], "sub": "味之素做的膜，在隔什麼？", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if "上" in t: bad.append((s["id"], "念稿有上"))
    for w in ["FOUP", "EFEM", "負載鎖", "量測"]:
        if w in (s.get("narration") or "") + s["subtitle"]["zh"]: bad.append((s["id"], w))
    for src in s.get("sources", []):
        for w in ["上一集", "前一集", "預告", "series_plan", "tech-", "通例", "通識"]:
            if w in src: bad.append((s["id"], "出處列", w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
