"""tech-cufoil 腳本產生器：python3 videos/tech-cufoil/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
PCB-2：銅箔與玻纖布（科技透明圈 系列 3 第 12 集；前一集 3-11 銅箔基板；下一集 3-13 伺服器主機板）。念稿定稿於 script.md。
2D 卡：src/components/three/HudCufoil.tsx（cuf-*）。構造與物理：physics-spec.md；模組清單：visual-spec.md。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
S = [
("s1", "hook", "布要多平、銅要多光滑？前一集換了樹脂，布和銅也得升級。",
 ["布要多平", "銅要多光滑？", "前一集換了樹脂", "布和銅也得升級"], ["How flat must the cloth be,", "how smooth the copper?", "Last time the resin changed,", "so cloth and copper must upgrade too."],
 [("flat", "布要多平"), ("smooth", "銅要多光滑"), ("resin", "換了樹脂"), ("up", "也得升級")], ["布", "銅", "升級"], ["接續 3-11 銅箔基板；示意動畫，不是量測"]),
("s2", "mechanism", "銅箔是電鍍的，銅從藥水長到轉動滾筒，再撕下來，像煎潤餅皮。",
 ["銅箔是電鍍的", "銅從藥水", "長到轉動滾筒", "再撕下來", "像煎潤餅皮"], ["Copper foil is electroplated:", "copper from the solution", "grows onto a turning drum,", "then is peeled off,", "like making a spring-roll wrapper."],
 [("plate", "電鍍"), ("grow", "長到轉動滾筒"), ("peel", "撕下來"), ("crepe", "潤餅皮")], ["電鍍", "滾筒", "潤餅皮"], ["De Nora、專利 US4240894；示意（電鍍，不是加熱）"]),
("s3", "mechanism", "貼滾筒那面光滑，另一面長滿小銅瘤，像魔鬼氈，咬住樹脂。",
 ["貼滾筒那面光滑", "另一面長滿小銅瘤", "像魔鬼氈", "咬住樹脂"], ["The drum side is smooth;", "the other side is covered in tiny nodules,", "like Velcro,", "gripping the resin."],
 [("shiny", "光滑"), ("nod", "小銅瘤"), ("velcro", "魔鬼氈"), ("bite", "咬住樹脂")], ["光滑", "小銅瘤", "魔鬼氈"], ["專利 EP1308539；示意（放大，不按比例）"]),
("s4", "mechanism", "但伺服器訊號快，大多擠在表面走，越粗越繞，像在洗衣板跑步。",
 ["但伺服器訊號快", "大多擠在表面走", "越粗越繞", "像在洗衣板跑步"], ["But server signals are fast,", "and mostly crowd along the copper surface;", "the rougher, the longer the path,", "like running on a washboard."],
 [("fast", "訊號快"), ("surf", "擠在表面"), ("bend", "越粗越繞"), ("board", "洗衣板")], ["表面", "越繞", "洗衣板"], ["Rogers、Altium 技術文章；示意動畫，不是量測"]),
("s5", "twist", "所以要用低粗糙度銅箔，做得更平又要黏得牢，這最難。",
 ["所以要用", "低粗糙度銅箔", "做得更平", "又要黏得牢", "這最難"], ["So use", "low-profile copper foil:", "flatter,", "yet still firmly bonded —", "that's the hardest part."],
 [("low", "低粗糙度"), ("flat", "更平"), ("glue", "黏得牢"), ("hard", "最難")], ["低粗糙度", "更平", "黏得牢"], ["IPC 技術論文 E5&S24_01、專利 US10765010；示意"]),
("s6", "mechanism", "玻纖布是玻璃拉成細絲、捻成紗，再一經一緯織成布，像編竹蓆。",
 ["玻纖布是", "玻璃拉成細絲", "捻成紗", "再一經一緯織成布", "像編竹蓆"], ["Glass fabric:", "glass drawn into fine filaments,", "twisted into yarn,", "then woven warp over weft,", "like weaving a bamboo mat."],
 [("draw", "拉成細絲"), ("twist", "捻成紗"), ("weave", "一經一緯"), ("mat", "竹蓆")], ["細絲", "紗", "竹蓆"], ["Isola、Intel 技術文件、IPC-4412；示意（放大）"]),
("s7", "mechanism", "紗和空隙讓訊號快慢不一，一對訊號就對不齊。",
 ["紗和空隙", "讓訊號快慢不一", "一對訊號", "就對不齊"], ["Yarn and gaps", "make signals travel at different speeds,", "so a signal pair", "falls out of step."],
 [("yarn", "紗和空隙"), ("speed", "快慢不一"), ("pair", "一對訊號"), ("skew", "對不齊")], ["空隙", "快慢不一", "對不齊"], ["Isola、PCD&F 技術文章；示意動畫，不是量測"]),
("s8", "twist", "所以把紗攤平，像梳開辮子，再換低介電玻璃，訊號更快、損耗更少。",
 ["所以把紗攤平", "像梳開辮子", "再換低介電玻璃", "訊號更快", "損耗更少"], ["So spread the yarn flat,", "like combing out a braid,", "then switch to low-Dk glass:", "faster signals,", "less loss."],
 [("flat", "攤平"), ("braid", "辮子"), ("lowdk", "低介電"), ("fast", "訊號更快")], ["攤平", "辮子", "低介電"], ["Isola、Intel、專利 US11191158；示意"]),
("s9", "payoff", "台灣金居做低粗糙度銅箔；台玻和富喬做低介電玻纖布，都在擴產。",
 ["台灣金居", "做低粗糙度銅箔", "台玻和富喬", "做低介電玻纖布", "都在擴產"], ["In Taiwan, Co-Tech", "makes low-profile copper foil;", "Taiwan Glass and Fulltech", "make low-Dk glass fabric —", "all expanding capacity."],
 [("cotech", "金居"), ("tglass", "台玻"), ("fulltech", "富喬"), ("exp", "擴產")], ["金居", "台玻", "富喬"], ["工商時報、經濟日報等報導；擴產為公司說法"]),
("s10", "cta", "布和銅升級好，最後做成主機板。下一集，看人工智慧伺服器主機板，為什麼越疊越多層。留言玻纖布，拿完整資料。",
 ["布和銅升級好", "最後做成主機板", "下一集", "看人工智慧伺服器主機板", "為什麼越疊越多層", "留言玻纖布", "拿完整資料"],
 ["With cloth and copper upgraded,", "they finally become a motherboard.", "Next time:", "the AI server motherboard —", "why it keeps adding layers.", "Comment \"glass fabric\"", "for the full notes."],
 [("up", "升級好"), ("mb", "做成主機板"), ("next", "下一集"), ("stack", "越疊越多層"), ("kw", "留言玻纖布")], ["主機板", "多層", "玻纖布"], ["示意動畫，不是量測"]),
]
def TTS(t):
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("矽", "細"), ("光罩", "光照")]:
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
md = open(os.path.join(HERE, "script.md")).read().split("## 可直接貼")[1].split("\n## ")[0].split("\n\n")[1:]
paras = [p.strip() for p in md if p.strip()]
assert [s["tts"] for s in scenes] == paras, ("念稿與 script.md 不同", [s["tts"] for s in scenes], paras)
scenes[0]["props"]["hook"] = {"kicker": "接上集：樹脂換了，布和銅也得升級", "title": "銅要多光滑？", "size": 104, "top": 236}
scenes.append({"id": "s11", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "伺服器主機板", "trail": ["銅箔要平又黏得牢、玻纖布要攤平換低介電"], "comment": "玻纖布", "logoAnim": "transparent"}}})

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

# ── 站 E：s2 一開口電解銅箔機拆開、逐件掛名牌，念到「長到轉動滾筒」前組回（第 17、29 條） ──
for l, kw in [("eDrum", {"dy": 3.6}), ("eCuArc", {"dy": 3.6}), ("eFrame", {"dy": 3.6}), ("eRect", {"dx": -2.4}), ("eFoil", {"dx": 3.0}), ("eTankF", {"dz": 2.6})]:   # r2：滾筒上移超過一個半徑、槽前壁往前、整流器往左
    VIS.append(mv(l, "s2:voice+2", "s2:grow+10", 14, **kw))
# ── 站 F：小銅瘤念到才長出；樹脂念到「咬住樹脂」才從上方壓下來 ──
vis("fNod", [("s3:nod-4", FAR)], 6)
VIS.append(hid("fDrum", T0, FAR, 1))   # 放大剖面只留樣品本身（滾筒會把主素材中心拉進卡片區）；R 站展示架 r2 開回來
drop("fResin", "s3:bite", dy=1.2, dur=12, bounce=0.03)
# ── 站 R：s4 只有粗銅箔；s5 念到「低粗糙度」才放上低粗糙度那片（下面），「黏得牢」才放樹脂 ──
drop("rSmooth", "s5:low", dy=1.2, dur=12, bounce=0.04); drop("rGlue", "s5:glue", dy=0.8, dur=10, bounce=0.03); drop("rGlueEdge", "s5:glue", dy=0.8, dur=10, bounce=0.03)
# ── 站 X：圓紗 → 攤平 → 換低介電玻璃 ──
vis("xRound", [(T0, "s8:flat")], 6); vis("xMid0", [("s8:flat", "s8:flat+6")], 6); vis("xMid1", [("s8:flat+6", "s8:flat+12")], 6); vis("xFlat", [("s8:flat+12", "s8:lowdk")], 6); vis("xFlatLD", [("s8:lowdk", FAR)], 8)   # r2：圓→扁分四段連續壓扁（約 18 幀）
# ── 站 K：三家念到才落下 ──
for i, c in enumerate(["cotech", "tglass", "fulltech"]): drop(f"kMod{i}", f"s9:{c}-2", dy=1.6, dur=12, bounce=0.05)
# ── 站 N：銅／膠片×3／銅 依序落下 → 上熱板壓下（念完「升級好」）；右邊主機板念到「做成主機板」才落下 ──
for i in range(5): drop(f"nL{i}", f"s10:voice+{2 + 5 * i}", dy=1.4, dur=10, bounce=0.04)
NPRESS = round(5.0 - INFO["NSTOP"], 3)
VIS.append(mv("nTop", "s10:up+20", FAR, 16, dy=-NPRESS))
drop("nMb", "s10:mb-6", dy=1.4, dur=12, bounce=0.04)

# ═════ 各幕（看向 x, y, 距離, 仰角）═════
HV = (0.0, -0.3, 36, 24)
EV = (33.4, 1.4, 48, 10); EV2 = EV; EVX = (33.6, 2.6, 62, 12)   # r2：拆開時拉遠，整流器與上移的滾筒完整入框     # 不推近：推近時機台下半出框、主素材中心掉進卡片區
FV = (70.0, 2.2, 15, 8)
RV = (104.0, 4.0, 19, 6); RV2 = (104.0, 2.3, 22, 8)   # r2：s4 推近粗銅箔（展示架入框）；s5 念到「低粗糙度」稍拉遠，上下兩片都大
GV = (146.0, 4.4, 36, 14); GV2 = (153.0, 3.8, 30, 24)   # r2：念「拉絲、捻紗」看熔爐到捻紗架，念「一經一緯」推到織布機
WV = (192.6, 2.4, 30, 86)
XV = (230.6, 2.4, 30, 86)
KV = (268.0, 1.2, 47, 26)
NV = (307.6, 2.2, 54, 30)   # r2：熱壓機（含液壓缸）與加大的主機板都入框
if os.environ.get("VIEWS"): globals().update({k: tuple(v) for k, v in json.loads(os.environ["VIEWS"]).items()})   # 開發用：調鏡頭
def S_(at, v, dur=30, yaw=None): return shot(at, v[0], v[1], v[2], v[3], dur, yaw)
P = {}
P["s1"] = {"zoom": [{"to": "start", "at": "end-16", "dur": 1}],   # 鉤子大字在第一個 zoom 鍵淡出：放在 H 站換站前收完
 "shot": [S_("start-30", HV, 1, yaw=0.0)], "shift": VIS,
 "run": [run("hSig", "start-30", "s2:start", 4), run("hPeel", "smooth-6", "s2:start", 14)],
 "labels": [lab("hCloth", "玻纖布（浸樹脂）", "Glass fabric in resin", "blue", "flat", "flat+45"),
            lab("hCu", "銅箔（掀起一角：底下是玻纖布）", "Copper foil, corner lifted", "amber", "smooth", "smooth+45")],
 "overlay": [sec("cuf-hook", "start", nxt("s1"), "系列 3・第 12 集", "示意", {"flat": "flat", "smooth": "smooth", "resin": "resin", "up": "up"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "drum", "at": CC, "dur": 1}],
 "shot": [S_(CC, EVX, 1), S_("grow+8", EV, 22)],
 "run": [run(x, "start-30", "s3:start", 8) for x in ["eDrumSpin", "eGuideSpin", "eRollSpin"]] + [run("eAnode", "plate-4", "s3:start", 6)] + [run(f"eIon{i}", "plate", "s3:start", 4) for i in range(3)] + [run("eFoil", "peel-6", "s3:start", 4)],
 "labels": [lab("eRectA", "整流器：送直流電", "Rectifier (DC)", "blue", "voice+4", "voice+16", xy=[660, 300]),
            lab("eDrum", "鈦滾筒＝陰極", "Titanium drum = cathode", "amber", "voice+24", "voice+38"),
            lab("eAnode", "弧形陽極，泡在硫酸銅藥水", "Arc anode in copper sulfate", "amber", "voice+46", "grow+8"),
            lab("eDrum", "銅在藥水裡越長越厚", "Copper thickens in the solution", "amber", "grow+12", "peel-2", xy=[560, 250]),
            lab("eRoll", "撕下銅箔、捲起來", "Peel and wind the foil", "amber", "peel+2", "peel+47")],
 "overlay": [card("s2", "cuf-drum", "電解銅箔：長在滾筒，再撕下來", "示意（電鍍，不是加熱）", {"plate": "plate", "grow": "grow", "peel": "peel", "crepe": "crepe"})]}
P["s3"] = {"zoom": [{"to": "foil", "at": CC, "dur": 1}],
 "shot": [S_(CC, FV, 1)],
 "run": [run("fShiny", "shiny-4", "s4:start", 6), run("fNodPop", "nod-4", "s4:start", 6)],
 "labels": [lab("fShiny", "光面：貼滾筒那面（撕下後再處理）", "Drum side: smooth", "blue", "shiny", "nod-2"),
            lab("fNod", "粗面：小銅瘤", "Matte side: nodules", "amber", "nod", "bite-8", xy=[760, 330]),
            lab("fResin", "樹脂被銅瘤咬住", "Resin gripped by nodules", "blue", "bite+4", "bite+40", xy=[330, 330])],
 "overlay": [card("s3", "cuf-nod", "光面與粗面：小銅瘤像魔鬼氈", "示意（放大，不按比例）", {"shiny": "shiny", "nod": "nod", "velcro": "velcro", "bite": "bite"})]}
P["s4"] = {"zoom": [{"to": "skin", "at": CC, "dur": 1}],
 "shot": [S_(CC, RV, 1)],
 "run": [run("rSigR", "fast-4", "s6:start", 4), run("rSkin", "surf-4", "s6:start", 6)],
 "labels": [lab("rRough", "訊號擠在表面，繞路、越走越弱", "Signal hugs the surface and fades", "amber", "surf", "surf+45")],
 "overlay": [card("s4", "cuf-skin", "訊號走銅表面：像在洗衣板跑步", "示意（不標頻率與粗糙度）", {"fast": "fast", "surf": "surf", "bend": "bend", "board": "board"})]}
P["s5"] = {"shot": [S_("low-6", RV2, 24)],
 "run": [run("rSigS", "low+8", "s6:start", 4), run("rLift", "hard-4", "s6:start", 12)],
 "labels": [lab("rSmooth", "低粗糙度：路直、耗得少", "Low profile: less loss", "blue", "low+4", "low+49"),
            lab("rGlue", "還要黏得住樹脂", "Must still bond to resin", "amber", "glue+2", "hard-6"), lab("rLift", "太平：樹脂翹起一角", "Too smooth: resin lifts", "amber", "hard", "end-2", xy=[700, 360])],
 "overlay": [card("s5", "cuf-hvlp", "低粗糙度銅箔：平和黏得牢互相拉扯", "示意", {"low": "low", "flat": "flat", "glue": "glue", "hard": "hard"})]}
P["s6"] = {"zoom": [{"to": "loom", "at": CC, "dur": 1}],
 "run": [run("gBush", "start-30", "s7:start", 8), run("gDraw", "start-10", "s7:start", 4), run("gBobSpin", "start-10", "s7:start", 8)] + [run(f"gTw{i}", "twist-6", "s7:start", 8) for i in range(4)] + [run("gYarnRun", "twist-6", "s7:start", 6)] + [run(x, "weave-6", "s7:start", 8) for x in ["gShedA", "gShedB", "gRapierGo", "gReedBeat", "gClothSpin", "gWarpSpin"]],
 "shot": [S_(CC, GV, 1), S_("weave-10", GV2, 22)],
 "labels": [lab("gBush", "白金漏板：熔融玻璃拉成絲", "Bushing: glass drawn into filaments", "amber", "draw-2", "twist-3"),
            lab("gTwist", "捻紗", "Twisting", "blue", "twist", "weave-2"),
            lab("gLoom", "織布機：劍桿穿緯", "Loom: rapier inserts weft", "amber", "weave", "weave+45", xy=[540, 262])],
 "overlay": [card("s6", "cuf-weave", "玻纖布：拉絲、捻紗、平織", "示意（放大）", {"draw": "draw", "twist": "twist", "weave": "weave", "mat": "mat"})]}
P["s7"] = {"zoom": [{"to": "weave", "at": CC, "dur": 1}],
 "shot": [S_(CC, WV, 1)],
 "run": [run("wYarnGlow", "yarn-4", "s8:start", 6), run("wGapGlow", "yarn-4", "s8:start", 6), run("wSigA", "speed-4", "s8:start", 4), run("wSigB", "speed-4", "s8:start", 4), run("wLampB", "pair", "s8:start", 4), run("wLampA", "skew", "s8:start", 4)],
 "labels": [lab("wA", "走在紗上：慢", "Over the yarn: slower", "amber", "speed", "speed+45"),
            lab("wB", "走在空隙上：快", "Over the gap: faster", "blue", "speed+2", "speed+47")],
 "overlay": [card("s7", "cuf-skew", "玻纖效應：一對訊號對不齊", "示意（速度差放大）", {"yarn": "yarn", "speed": "speed", "pair": "pair", "skew": "skew"})]}
P["s8"] = {"zoom": [{"to": "spread", "at": CC, "dur": 1}],
 "shot": [S_(CC, XV, 1)],
 "run": [run("xSigA0", "start-10", "flat", 4), run("xSigB0", "start-10", "flat", 4), run("xSigA1", "flat+6", "lowdk", 4), run("xSigB1", "flat+6", "lowdk", 4),
         run("xSigA2", "lowdk+6", "s9:start", 4), run("xSigB2", "lowdk+6", "s9:start", 4), run("xLdGlow", "lowdk", "s9:start", 6), run("xLampAB", "braid", "s9:start", 4)],
 "labels": [lab("xFlat", "開纖：紗攤平、空隙變小", "Spread glass: flatter yarn", "blue", "flat+2", "flat+47"),
            lab("xLd", "低介電玻璃", "Low-Dk glass", "amber", "lowdk+2", "lowdk+47")],
 "overlay": [card("s8", "cuf-spread", "開纖＋低介電玻璃", "示意（不標介電常數）", {"flat": "flat", "braid": "braid", "lowdk": "lowdk", "fast": "fast"})]}
# 第 40 條：三家公司 → 卡片完整顯示 ≥ 1.2×3＋1.5＝5.1 秒；不夠就把卡片與 s9 鏡頭延到 s10 開頭，延長幀數依 timeline.json 自動算
_tl = {x["id"]: x for x in json.load(open(os.path.join(HERE, "timeline.json")))["scenes"]} if os.path.exists(os.path.join(HERE, "timeline.json")) else {}
if "s9" in _tl and "s10" in _tl:
    _c0, _c1 = _tl["s9"]["voiceStartFrame"] - 3, _tl["s10"]["voiceStartFrame"] - 3
    CO_N = max(0, 153 - (_c1 - _c0), (_tl["s9"]["voiceEndFrame"] + 30) - _c1)
else:
    CO_N = 0
EXT, EXTC = f"voice{CO_N - 3:+d}", f"voice{CO_N - 4:+d}"
CO = ("cuf-co", "銅箔與玻纖布供應商（台灣）", "媒體報導；截至 2026/11/28")
P["s9"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [S_(CC, KV, 1)],
 "run": [run("kGlow", "exp-4", "s10:start", 6)],
 "overlay": [sec(CO[0], C, nxt("s9"), CO[1], CO[2], {"cotech": "cotech", "tglass": "tglass", "fulltech": "fulltech"}, cut=True, h=392, y=1000)]}
P["s10"] = {"zoom": [{"to": "next", "at": EXTC, "dur": 1}],
 "shot": [S_(EXTC, NV, 1)],
 "run": [run("nHeat", "up+16", "s11:start", 8), run("nSig", "mb+8", "s11:start", 4)],
 "labels": [lab("nStack", "銅箔＋膠片＋銅箔：壓合", "Lamination", "amber", "up+18", "mb-4"),
            lab("nMb", "伺服器主機板：板邊越疊越多層", "Server motherboard: more layers", "blue", "stack-4", "stack+41", xy=[540, 270])],
 "overlay": ([sec(CO[0], C, EXT, CO[1], CO[2], {"cotech": "s9:cotech", "tglass": "s9:tglass", "fulltech": "s9:fulltech"}, cut=True, h=392, y=1000)] if CO_N else []) + [sec("cuf-next", EXT, "s11:start", "下一集：伺服器主機板", "留言「玻纖布」", {"up": "up", "mb": "mb", "next": "next", "stack": "stack", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/28", "noteAlways": True}
levels = [lv("start", "銅箔基板（示意，厚度放大）", "COPPER-CLAD LAMINATE", "10 cm", "1 cm"), lv("drum", "電解銅箔機（示意）", "ED COPPER FOIL", "1 m", "10 cm"),
          lv("foil", "銅箔剖面（放大示意）", "FOIL CROSS-SECTION", "20 µm", "2 µm"), lv("skin", "訊號走銅表面（示意）", "SKIN EFFECT", "20 µm", "2 µm"),
          lv("loom", "拉絲、捻紗、織布（示意）", "GLASS FABRIC", "1 m", "10 cm"), lv("weave", "玻纖效應（示意）", "FIBER WEAVE EFFECT", "1 mm", "0.1 mm"),
          lv("spread", "開纖與低介電玻璃（示意）", "SPREAD / LOW-DK GLASS", "1 mm", "0.1 mm"), lv("co", "銅箔與玻纖布供應商", "SUPPLIERS", "100 cm", "10 cm"), lv("next", "壓合與主機板（下一集）", "NEXT", "50 cm", "5 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-cufoil", "prevEpisode": "3-11：銅箔基板", "title": "銅箔與玻纖布（科技透明圈）", "asOf": "2026/11/28", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b", "_說明": "旁白金手指第三版"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["銅箔與玻纖布", "電路板的原料"], "sub": "要平、要黏得牢", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
for s in scenes:
    t = s.get("tts") or ""
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
    for w in ["量測", "矽"]:
        if w in t: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
