"""tech-pkgmat 腳本產生器：python3 videos/tech-pkgmat/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
封裝材料（科技透明圈 系列 3 第 3 集；前一集 3-2 封裝打線；下一集 3-4 封裝-2 覆晶）。念稿定稿於 script.md（一字不改；念稿「常華」＝字幕「長華」）。
2D 卡：src/components/three/HudPkgmat.tsx（pkg-*）。構造與物理：physics-spec.md；模組清單：visual-spec.md。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
S = [
("s1", "hook", "晶片還光著，要怎麼保護？前一集線接好了，這集看封裝材料。",
 ["晶片還光著", "要怎麼保護？", "前一集線接好了", "這集看封裝材料"], ["The chip is still bare.", "How do we protect it?", "Last episode: the wires were bonded.", "Now: packaging materials."],
 [("bare", "光著"), ("prot", "保護"), ("prev", "前一集"), ("mat", "封裝材料")], ["光著", "前一集", "封裝材料"], ["示意動畫，不是量測"], 6.0, 0.0, 1.2),
("s2", "mechanism", "晶片先放進導線架，一片薄薄的銅，四周伸出金屬腳。",
 ["晶片先放進導線架", "一片薄薄的銅", "四周伸出金屬腳"], ["The chip goes onto a lead frame,", "a thin sheet of copper,", "with metal leads all around."],
 [("lf", "導線架"), ("cu", "薄薄的銅"), ("leg", "金屬腳")], ["導線架", "銅", "金屬腳"], ["專利 USPTO 9466556、6686651；示意"], 6.0, 0.3, 1.2),
("s3", "mechanism", "量大的像餅乾模，一壓成形；腳細的用藥水蝕刻。",
 ["量大的像餅乾模", "一壓成形", "腳細的用藥水蝕刻"], ["In volume, like a cookie cutter:", "one press and it's formed;", "fine leads are etched with chemicals."],
 [("big", "量大"), ("cookie", "餅乾模"), ("press", "一壓"), ("etch", "蝕刻")], ["餅乾模", "一壓成形", "蝕刻"], ["專利 USPTO RE43818、7618845；示意動畫"], 6.6, 0.3, 1.5),
("s4", "mechanism", "再灌封裝膠，黑色環氧樹脂，大約八成是細砂。",
 ["再灌封裝膠", "黑色環氧樹脂", "大約八成是細砂"], ["Next, the mold compound:", "black epoxy resin,", "about 80% fine silica sand."],
 [("emc", "封裝膠"), ("epoxy", "環氧樹脂"), ("sand", "八成")], ["封裝膠", "環氧樹脂", "八成"], ["論文 PMC6416563 等（填料約七到九成，依配方而異）"], 5.6, 0.3, 1.3),
("s5", "mechanism", "膠加熱變軟擠進模具，像灌布丁包住晶片和金線，但它越熱越硬。",
 ["膠加熱變軟", "擠進模具", "像灌布丁", "包住晶片和金線", "但它越熱越硬"], ["Heated, it softens", "and is squeezed into the mold,", "like pouring pudding,", "wrapping the chip and wires,", "but it hardens as it heats."],
 [("soft", "變軟"), ("mold", "擠進模具"), ("pud", "布丁"), ("wrap", "包住"), ("hard", "越熱越硬")], ["變軟", "布丁", "越熱越硬"], ["論文 PMC6416563、PMC8197812；示意動畫，不是量測"], 7.6, 0.3, 1.6),
("s6", "mechanism", "硬了擋住濕氣和碰撞，晶片有了殼。",
 ["硬了擋住濕氣", "和碰撞", "晶片有了殼"], ["Once hard, it blocks moisture", "and impacts;", "the chip now has a shell."],
 [("wet", "濕氣"), ("hit", "碰撞"), ("shell", "殼")], ["濕氣", "碰撞", "殼"], ["專利 USPTO 11254563；示意"], 8.2, 0.3, 1.2),
("s7", "mechanism", "腳太多的，改在底部種錫球，零點幾毫米，當腳焊到電路板。",
 ["腳太多的", "改在底部種錫球", "零點幾毫米", "當腳焊到電路板"], ["When there are too many leads,", "solder balls are planted underneath,", "a few tenths of a millimeter,", "soldered to the board as legs."],
 [("many", "腳太多"), ("ball", "錫球"), ("mm", "毫米"), ("pcb", "電路板")], ["錫球", "零點幾毫米", "電路板"], ["專利 USPTO 6119927、5482736；錫球型錄；示意"], 6.6, 0.3, 1.3),
("s8", "mechanism", "但晶片和電路板熱脹冷縮不一樣，錫球會被扯裂。",
 ["但晶片和電路板", "熱脹冷縮不一樣", "錫球會被扯裂"], ["But the chip and the board", "expand differently with heat,", "so the solder joints get torn."],
 [("cte", "熱脹冷縮"), ("crack", "扯裂")], ["熱脹冷縮", "扯裂"], ["專利 USPTO 5710071、6015722；示意動畫"], 6.4, 0.3, 1.6),
("s9", "mechanism", "所以縫裡點底部填充膠，像茶滲進兩片玻璃之間，硬了黏成一塊，把力量分散開。",
 ["所以縫裡點", "底部填充膠", "像茶滲進", "兩片玻璃之間", "硬了黏成一塊", "把力量分散開"], ["So into the gap goes", "underfill,", "seeping in like tea", "between two panes of glass,", "curing into one piece", "that spreads the force."],
 [("uf", "底部填充"), ("tea", "茶"), ("glue", "黏成一塊"), ("spread", "分散")], ["底部填充", "茶", "分散"], ["專利 USPTO 5710071、6015722；NASA JPL 報告；示意"], 8.0, 0.3, 1.6),
("s10", "payoff", "導線架有長華、界霖，封裝膠有日本住友電木。",
 ["導線架有長華 界霖", "封裝膠有日本住友電木"], ["Lead frames: Taiwan's 6548 and 5285;", "mold compound: Japan's Sumitomo Bakelite."],
 [("lf2", "導線架"), ("cw", "長華"), ("sb", "住友電木")], ["長華", "界霖", "住友電木"], ["證交所簡報、財經媒體；截至 2026/11/27"], 5.4, 0.3, 1.2),
("s11", "cta", "晶片若自己長凸塊倒扣，就不用打線。倒過來好在哪？下一集看覆晶。留言錫球，拿完整資料。",
 ["晶片若自己長凸塊", "倒扣就不用打線", "倒過來好在哪？", "下一集看覆晶", "留言錫球", "拿完整資料"], ["If the chip grows its own bumps", "and flips down, no wires are needed.", "Why flip it?", "Next episode: flip chip.", "Comment \"solder ball\"", "for the full notes."],
 [("bump", "凸塊"), ("flip", "倒扣"), ("why", "好在哪"), ("next", "下一集"), ("kw", "留言錫球")], ["凸塊", "覆晶", "錫球"], ["示意動畫，不是量測"], 8.3, 0.2, 1.2),
]
def TTS(t):
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("矽", "細"), ("光罩", "光照"), ("長華", "常華")]:
        t = t.replace(a, b)
    return t
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, dur, head, tail) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？、；]", "", z)) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？、；]", "", z)) >= 3, ("字幕短語 <3 字", sid, z)
    assert re.sub(r"[ ，。？、；]", "", "".join(zh)) == re.sub(r"[ ，。？、；]", "", nar), (sid, "字幕和念稿不同")
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar)); hold = 0.85 if sid == "s10" else 0.6
    if sid == "s11": head = 0.0
    dur = round(head + nch / 5.2 + 0.2 + hold, 1)  # 第 39 條：念完 0.6 秒換幕；s10 公司卡第 40 條多留 0.4
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
scenes[0]["props"]["hook"] = {"kicker": "接上集：線接好了", "title": "怎麼保護？", "size": 120, "top": 236}
scenes.append({"id": "s12", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "覆晶", "trail": ["晶片穿好衣服、長好腳"], "comment": "錫球", "logoAnim": "transparent"}}})

# ═════════ 工具 ═════════
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

# ── 站 P：沖壓三下（每下：滑塊受重力加速落下、撞擊、回程；銅帶送一格）、蝕刻噴藥、銅片逐格被吃掉 ──
STROKES = ["s3:press-16", "s3:press+6", "s3:press+26"]   # 第三下撞擊在切到蝕刻線（etch−20）之前
for t in STROKES:
    VIS.append({"layer": "pRam", "at": t, "until": off(t, 10), "dur": 8, "dy": -0.75, "fallOut": True, "bounce": 0.04, "press": ["pPress"], "pressAmt": 0.02})
    VIS.append(mv("pStrip", off(t, 18), FAR, 8, dx=0.22))
vis("peSheet0", [(T0, "s3:etch+4")], 1); vis("peSheet1", [("s3:etch+4", "s3:etch+22")], 1); vis("peSheet2", [("s3:etch+22", FAR)], 1)
# ── 站 M：料餅變矮、柱塞往上推、膠從流道到模穴逐格前進，越熱越硬（變黑）──
FILL = INFO["FILL"]
vis("mPel0", [(T0, "s5:mold+4")], 1); vis("mPel1", [("s5:mold+4", "s5:mold+26")], 1); vis("mPel2", [("s5:mold+26", FAR)], 1)
for l in ["mPlunger", "mPel0", "mPel1", "mPel2"]: VIS.append(mv(l, "s5:mold", FAR, 46, dy=0.55))  # 料餅跟著柱塞一起往上
vis("mRup", [("s5:mold+2", FAR)], 1)
for f in FILL:
    side, k = int(f[2]), int(f[4])
    t = f"s5:mold+{4 + 4 * k}" if f.startswith("mR") else f"s5:mold+{16 + 6 * k}"
    vis(f, [(t, FAR)], 1)
vis("mCure", [("s5:hard-4", FAR)], 8)   # 念到「越熱越硬」就由褐轉黑
vis("mWire", [(T0, "s5:mold+30")], 4); vis("mWireS", [("s5:mold+30", FAR)], 4)   # 沖線：膠流到時線弧往流動方向偏、留下
# ── 站 Q：小石子掉下彈開；爆炸（外殼拿開 → 晶片與金線抬起 → 組回）──
VIS.append({"layer": "qPebble", "at": T0, "until": "s6:hit-10", "dur": 12, "dy": 3.0, "fallIn": True, "bounce": 0.35, "opacity": 0})
vis("qPebble", [("s6:hit-12", "s6:shell+20")], 4)
QE1 = "s6:start+2"; QE2 = "s6:start+49"; QAS = "s6:start+96"   # 第 39 條：爆炸在旁白期間做完並組回（本幕 114 幀，112 幀前全部落回）
VIS += [mv("qBody", QE1, QAS, 16, dy=3.4), mv("qPebble", QE1, QAS, 16, dy=3.4), mv("qChip", QE2, off(QAS, -4), 16, dy=1.0)]
# ── 站 B：助焊劑點 → 錫球一顆顆落下（重力、小彈）→ 回焊 ──
vis("bFlux", [("s7:ball-14", FAR)], 4)
for i in range(8): VIS.append({"layer": f"bB{i}", "at": T0, "until": f"s7:ball+{3 * i}", "dur": 14, "dy": 2.4, "fallIn": True, "bounce": 0.08, "opacity": 0})
# ── 站 T：裂縫兩階段 ──
vis("tCrack0", [("s8:crack-8", FAR)], 2); vis("tCrack1", [("s8:crack-2", FAR)], 2)
# ── 站 U：針降下點膠、膠逐格被吸進縫（越往內越慢）、膠角 ──
VIS.append(mv("uNeedle", T0, "s9:uf-12", 14, dy=1.2))
UT = [6, 14, 24, 36, 50, 66]
for k in range(INFO["UFX"]): vis(f"uF{k}", [(f"s9:uf+{UT[k]}", FAR)], 3)
vis("uFillet", [("s9:uf+8", FAR)], 3); vis("uFilletL", [("s9:uf+70", FAR)], 3)
VIS.append(mv("uNeedle", "s9:uf+72", FAR, 14, dy=1.2))
# ── 站 F：翻面後落到基板 ──
VIS.append(mv("fChip", "s11:flip+20", FAR, 16, dy=-1.95))
vis("fChip", [(T0, FAR)])

# ═════ 各幕 ═════
LV0 = (0.0, -1.6, 64, 40)         # 鉤子：模型壓低，讓出上方大字
LV = (0.0, -3.4, 56, 40)          # 站 L 導線架俯視斜角（看向 x, y, 距離, 仰角）
PV = (26.6, 1.0, 30, 12)          # 站 P 沖壓機近景
PE = (36.5, -0.2, 26, 26)         # 站 P 蝕刻線近景
M4 = (69.2, 0.6, 19, 12)          # 站 M 料餅與填料放大
M5 = (60.0, 0.4, 26, 3)           # 站 M 模具剖面
QV = (90.0, 1.4, 42, 14)         # 站 Q 封裝（爆炸）
BJ = (118.0, 0.9, 22, 30)         # 站 B 植球近景
BM = (128.0, 0.4, 22, 30)         # 站 B 焊到電路板近景
TV = (150.0, 1.2, 31, 6)          # 站 T 錫點剖面
UV = (175.0, 1.4, 31, 6)          # 站 U 底部填充剖面
VV = (196.0, -1.0, 39, 14)        # 站 V 供應商
FV = (222.0, -0.2, 24, 18)        # 站 F 覆晶預告
def S_(at, v, dur=30, yaw=None): return shot(at, v[0], v[1], v[2], v[3], dur, yaw)
P = {}
P["s1"] = {"shot": [S_("start-30", LV0, 1, yaw=0.0)], "shift": VIS,
 "run": [run("lChipGlow", "start-30", "s2:start", 6)],
 "overlay": [sec("pkg-hook", "start", nxt("s1"), "系列 3・第 3 集", "示意，放大", {"bare": "bare", "prot": "prot", "prev": "prev", "mat": "mat"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "unit", "at": "start-10", "dur": 1}, {"to": "unit", "at": CC, "dur": 1}],
 "shot": [S_(CC, LV, 1)],
 "labels": [lab("lPadA", "晶片座：晶片坐在這", "Die pad", "blue", "lf", "lf+45"),
            lab("lLeadA", "金屬腳（引腳）", "Leads", "amber", "leg-12", "leg+33")],
 "overlay": [card("s2", "pkg-lf", "導線架：銅做的骨架與腳", "示意（不標尺寸）", {"lf": "lf", "cu": "cu", "leg": "leg"})]}
P["s3"] = {"zoom": [{"to": "fab", "at": CC, "dur": 1}],
 "shot": [S_(CC, PV, 1), S_("etch-20", PE, 1)],
 "run": [run("ppFlySpin", "start-30", "s4:start", 10)] + [run(f"peSpray{i}", "etch-8", "etch+30", 4) for i in range(5)],
 "labels": [lab("pPunchA", "沖壓：沖頭一壓就成形", "Stamping", "amber", "cookie", "cookie+45"),
            lab("pEtchA", "蝕刻：光阻蓋住的留下", "Etching", "blue", "etch-18", "etch+27")],
 "overlay": [card("s3", "pkg-make", "兩種做法：沖壓、蝕刻", "示意", {"big": "big", "cookie": "cookie", "press": "press", "etch": "etch"})]}
P["s4"] = {"zoom": [{"to": "mold", "at": CC, "dur": 1}],
 "shot": [S_(CC, M4, 1)],
 "labels": [lab("mPelletA", "料餅（環氧樹脂封裝膠）", "Mold compound pellet", "amber", "emc", "emc+45"),
            lab("mFillerA", "放大：約八成是細砂（示意）", "Mostly silica filler", "blue", "sand", "sand+45")],
 "overlay": [card("s4", "pkg-emc", "封裝膠：環氧樹脂＋細砂", "填料約七到九成，依配方而異", {"emc": "emc", "epoxy": "epoxy", "sand": "sand"})]}
P["s5"] = {"shot": [S_(CC, M5, 1)],
 "run": [run("mHeatGlow", "start-6", "s6:start", 8), run("mPelHot", "soft-6", "mold+30", 6), run("mFlowL", "mold", "mold+50", 6), run("mFlowR", "mold", "mold+50", 6)],
 "labels": [lab("mPotA", "料筒：柱塞往上推", "Pot & plunger", "amber", "soft", "soft+45"),
            lab("mCavA", "模穴（剖開示意）", "Mold cavity (cutaway)", "blue", "pud", "pud+45"),
            lab("mHeatA", "模具加熱，越熱越硬（約 175 度）", "Heat cures it", "amber", "hard", "hard+45")],
 "overlay": [card("s5", "pkg-mold", "轉移成型：像灌布丁", "示意（不標壓力）", {"soft": "soft", "mold": "mold", "pud": "pud", "wrap": "wrap", "hard": "hard"})]}
P["s6"] = {"zoom": [{"to": "unit", "at": CC, "dur": 1}],
 "shot": [S_(CC, QV, 1)],
 "run": [run("qRain", "wet-4", "shell-6", 4)],
 "labels": [lab("qBodyA", "封裝膠外殼", "Mold-compound shell", "amber", off(QE1, 8), off(QE1, 53), xy=[760, 330]),
            lab("qChipA", "裡面：晶片、金線、導線架", "Inside: chip, wires, lead frame", "blue", off(QE2, 8), off(QE2, 53), xy=[600, 330])],
 "overlay": [card("s6", "pkg-shell", "外殼擋什麼", "示意（封裝膠導熱不好，散熱靠金屬）", {"wet": "wet", "hit": "hit", "shell": "shell"})]}
P["s7"] = {"zoom": [{"to": "unit", "at": CC, "dur": 1}],
 "shot": [S_(CC, BJ, 1), S_("pcb-14", BM, 1)],
 "run": [run("bReflow", "mm", "pcb+20", 6)],
 "labels": [lab("bBallA", "錫球：零點幾毫米", "Solder balls", "amber", "ball", "ball+45"),
            lab("bPCBA", "焊到電路板", "Soldered to the board", "blue", "pcb-12", "pcb+33")],
 "overlay": [card("s7", "pkg-ball", "腳太多：底部種錫球", "示意", {"many": "many", "ball": "ball", "mm": "mm", "pcb": "pcb"})]}
P["s8"] = {"zoom": [{"to": "joint", "at": CC, "dur": 1}],
 "shot": [S_(CC, TV, 1)],
 "run": [run("tBoardL", "cte-6", "s9:start", 8), run("tBoardR", "cte-6", "s9:start", 8), run("tShear0", "cte-6", "s9:start", 8), run("tShear1", "cte-6", "s9:start", 8), run("tShear4", "cte-6", "s9:start", 8), run("tShear5", "cte-6", "s9:start", 8), run("tHot", "cte-6", "s9:start", 8)],
 "labels": [lab("tPcbA", "電路板受熱伸縮得比較多", "Board expands more", "amber", "cte", "cte+45"),
            lab("tCrackA", "錫點被剪出裂縫", "Joint cracks", "blue", "crack-19", "crack+26")],
 "overlay": [card("s8", "pkg-cte", "熱脹冷縮不一樣：錫點被剪", "示意，位移放大", {"cte": "cte", "crack": "crack"})]}
P["s9"] = {"shot": [S_(CC, UV, 1)],
 "run": [run("uDrip", "uf-6", "uf+70", 4), run("uCure", "glue", "spread", 6), run("uBoardL", "spread-6", "s10:start", 8), run("uBoardR", "spread-6", "s10:start", 8), run("uShear0", "spread-6", "s10:start", 8), run("uShear1", "spread-6", "s10:start", 8), run("uShear4", "spread-6", "s10:start", 8), run("uShear5", "spread-6", "s10:start", 8), run("uHot", "spread-6", "s10:start", 8)],
 "labels": [lab("uNeedleA", "點膠針：沿邊點膠", "Dispense needle", "amber", "uf", "uf+45"),
            lab("uFillA", "毛細作用：自己吸進縫", "Capillary flow", "blue", "uf+47", "uf+92", xy=[420, 300]),
            lab("uBallA", "錫點只微微擺動", "Joints barely move", "amber", "spread-8", "spread+37")],
 "overlay": [card("s9", "pkg-uf", "底部填充：像茶滲進玻璃縫", "示意（不保證不裂，是分散應力）", {"uf": "uf", "tea": "tea", "glue": "glue", "spread": "spread"})]}
P["s10"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [S_(CC, VV, 1)],
 "labels": [lab("vA0", "導線架", "Lead frames", "amber", "lf2", "lf2+45"),
            lab("vA2", "封裝膠料餅", "Mold compound", "blue", "sb", "sb+45")],
 "overlay": [card("s10", "pkg-co", "封裝材料供應商", "證交所、財經媒體；截至 2026/11/27", {"lf2": "lf2", "cw": "cw", "sb": "sb"}, h=392, y=1000)]}
P["s11"] = {"zoom": [{"to": "unit", "at": CC, "dur": 1}],
 "shot": [S_(CC, FV, 1)],
 "run": [run("fFlip", "flip-10", "flip+18", 24)],
 "labels": [lab("fChipA", "晶片自己長凸塊", "Chip with its own bumps", "amber", "bump", "bump+45"),
            lab("fSubA", "倒扣到基板", "Flipped onto the substrate", "blue", "flip+40", "flip+85")],
 "overlay": [sec("pkg-next", C, "s12:start", "下一集：覆晶", "留言「錫球」", {"bump": "bump", "flip": "flip", "next": "next", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("unit", "封裝（示意，放大）", "PACKAGE", "15 mm", "1 mm"), lv("fab", "導線架做法（示意）", "LEAD FRAME MAKING", "100 cm", "10 cm"), lv("mold", "轉移成型（剖開示意）", "TRANSFER MOLDING", "30 cm", "5 cm"),
          lv("joint", "錫點剖面（示意，放大）", "SOLDER JOINT SECTION", "15 mm", "1 mm"), lv("co", "封裝材料供應商", "SUPPLIERS", "100 cm", "10 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-pkgmat", "prevEpisode": "3-2：封裝打線", "title": "封裝材料（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b", "_說明": "旁白金手指第三版；本支子聊天室不送 TTS，由頻道負責人配音"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["封裝材料", "晶片的衣服和腳"], "sub": "導線架、封裝膠、錫球", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
for s in scenes:
    t = s.get("tts") or ""
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
    for w in ["量測", "矽", "長華"]:
        if w in t: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
