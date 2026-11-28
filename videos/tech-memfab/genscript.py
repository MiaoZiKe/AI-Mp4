"""tech-memfab 腳本產生器：python3 videos/tech-memfab/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
中游補充篇 M2：記憶體製造（前一集 M1 成熟與特殊製程代工；下一集 M3 化合物半導體 SiC／GaN）。念稿定稿於 script.md（頻道負責人 2026/11/28 核准；
念稿「前一集／細／集邦」＝字幕「上一集／矽／集邦」）。2D 卡：src/components/three/HudMemfab.tsx（memfab-*）。構造：physics-spec.md；模組：visual-spec.md。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
AS_OF = "2026/11/28"
S = [
("s1", "hook", "前一集看完成熟製程代工，記憶體又在哪做？答案是另一種晶圓廠。",
 ["前一集看完", "成熟製程代工", "記憶體又在哪做？", "答案是", "另一種晶圓廠"], ["Last time we finished", "mature-node foundries.", "So where is memory made?", "The answer:", "a different kind of fab."],
 [("prev", "前一集"), ("q", "在哪做"), ("fab", "另一種晶圓廠")], ["前一集", "記憶體", "晶圓廠"], ["示意動畫，不是量測"]),
("s2", "mechanism", "記憶體分三種。動態記憶體像書桌，好拿，但斷電就清空。",
 ["記憶體分三種", "動態記憶體像書桌", "好拿 但斷電就清空"], ["Memory comes in three kinds.", "DRAM is like a desk:", "easy to reach, wiped when power goes."],
 [("three", "分三種"), ("desk", "書桌"), ("off", "斷電")], ["動態記憶體", "書桌", "斷電"], ["Semiconductor Engineering；專利 TWI517150B；示意動畫"]),
("s3", "mechanism", "快閃記憶體有兩種：儲存型像倉庫，斷電不消失；編碼型像便條紙，記開機指令。",
 ["快閃記憶體有兩種", "儲存型像倉庫", "斷電不消失", "編碼型像便條紙", "記開機指令"], ["Flash comes in two kinds:", "NAND is like a warehouse,", "data stays without power;", "NOR is like a sticky note,", "holding boot instructions."],
 [("flash", "快閃記憶體"), ("ware", "倉庫"), ("keep", "不消失"), ("note", "便條紙"), ("boot", "開機")], ["儲存型", "編碼型", "開機"], ["SemiEngineering、TechTarget；示意動畫"]),
("s4", "mechanism", "動態記憶體每一格是開關配電容，電容又細又高，像一排筷子站著。",
 ["動態記憶體每一格", "是開關配電容", "電容又細又高", "像一排筷子站著"], ["Each DRAM cell is", "a switch plus a capacitor;", "the capacitors are thin and tall,", "like chopsticks standing in a row."],
 [("cell", "每一格"), ("sw", "開關"), ("cap", "又細又高"), ("chop", "筷子")], ["開關", "電容", "筷子"], ["Semiconductor Engineering；示意（放大，不按比例）"]),
("s5", "mechanism", "儲存型則疊三百多層薄膜，再往下鑽深孔，像千層蛋糕插吸管。",
 ["儲存型則疊", "三百多層薄膜", "再往下鑽深孔", "像千層蛋糕插吸管"], ["NAND stacks", "over three hundred thin layers,", "then drills deep holes down,", "like straws in a layer cake."],
 [("stack", "則疊"), ("n300", "三百多層"), ("drill", "鑽深孔"), ("straw", "吸管")], ["三百多層", "鑽深孔", "吸管"], ["SK 海力士（321 層）、USPTO 11302706；示意"]),
("s6", "twist", "做法特別，大廠就自己設計自己製造。三星、SK 海力士、美光，據集邦統計包辦近九成動態記憶體。",
 ["做法特別", "大廠就自己設計", "自己製造", "三星 SK 海力士 美光", "據集邦統計", "包辦近九成動態記憶體"],
 ["Because it's so specialized,", "the big players design", "and manufacture it themselves.", "Samsung, SK hynix, Micron:", "according to TrendForce,", "nearly 90% of DRAM."],
 [("spec", "做法特別"), ("idm", "自己設計"), ("make", "自己製造"), ("sam", "三星"), ("sk", "海力士"), ("mu", "美光"), ("tf", "集邦"), ("n90", "近九成")], ["自己設計", "自己製造", "近九成"],
 ["TrendForce 2026 Q2 營收市占；截至 2026/11/28"]),
("s7", "payoff", "台灣走利基型，量小、規格特別。南亞科做動態記憶體，華邦電兩種都做，旺宏主攻快閃。",
 ["台灣走利基型", "量小 規格特別", "南亞科做動態記憶體", "華邦電兩種都做", "旺宏主攻快閃"], ["Taiwan goes niche:", "small volumes, special specs.", "Nanya makes DRAM,", "Winbond makes both,", "Macronix focuses on flash."],
 [("niche", "利基型"), ("spec", "規格特別"), ("nanya", "南亞科"), ("wb", "華邦電"), ("mx", "旺宏")], ["利基型", "南亞科", "華邦電"], ["數位時代、科技新報、工商時報等報導；截至 2026/11/28"]),
("s8", "payoff", "美光在台中、桃園也有大廠，做高頻寬記憶體。",
 ["美光在台中 桃園", "也有大廠", "做高頻寬記憶體"], ["Micron also has big fabs", "in Taichung and Taoyuan,", "making high-bandwidth memory."],
 [("mu", "美光"), ("tc", "台中"), ("ty", "桃園"), ("hbm", "高頻寬")], ["美光", "台中", "高頻寬記憶體"], ["科技新報、聯合報報導；截至 2026/11/28"]),
("s9", "cta", "但電動車要耐高壓，矽晶圓撐不住。下一集看碳化矽和氮化鎵。留言記憶體廠，拿完整資料。",
 ["但電動車要耐高壓", "矽晶圓撐不住", "下一集看", "碳化矽和氮化鎵", "留言記憶體廠", "拿完整資料"],
 ["But EVs need high voltage,", "and silicon wafers can't take it.", "Next episode:", "silicon carbide and gallium nitride.", "Comment \"memory fab\"", "for the full notes."],
 [("ev", "電動車"), ("si", "撐不住"), ("next", "下一集"), ("sic", "碳化矽"), ("kw", "留言記憶體廠")], ["電動車", "碳化矽", "氮化鎵"], ["示意動畫，不是量測"]),
]
def TTS(t):
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("矽", "細"), ("光罩", "光照")]:
        t = t.replace(a, b)
    return t
scenes = []
HOLD = {"s7": 0.7}
for i, (sid, beat, nar, zh, en, cues, kws, src) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？、；]", "", z)) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？、；]", "", z)) >= 3, ("字幕短語 <3 字", sid, z)
    assert re.sub(r"[ ，。？、；：]", "", "".join(zh)) == re.sub(r"[ ，。？、；：]", "", nar), (sid, "字幕和念稿不同")
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar))
    head = 0.0 if sid == "s1" else 0.3
    hold = HOLD.get(sid, 0.6)   # 第 39 條：念完 hold 秒換幕（＋下一幕開口前 0.3 秒＝無聲 ≤1.0 秒）
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
scenes[0]["props"]["hook"] = {"kicker": "接上集：成熟製程代工", "title": "記憶體在哪做？", "size": 92, "top": 236}
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "碳化矽與氮化鎵", "trail": ["記憶體廠：自己設計、自己製造"], "comment": "記憶體廠", "logoAnim": "transparent"}}})

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
def drop(lay, at, dy=1.6, dur=12, bounce=0.06):
    """從上方受重力落下（之前不顯示）"""
    assert lay in LAYERS, lay
    VIS.append({"layer": lay, "at": T0, "until": at, "dur": dur, "dy": dy, "fallIn": True, "bounce": bounce, "opacity": 0})
C = "voice-3"
CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw):
    return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)

# ── 站 B：s2 念到「斷電」：電源燈綠→紅、模組上的資料亮點全熄（清空）；固態硬碟的亮點留著 ──
vis("bBits", [(T0, "s2:off+4")], 4); vis("bPwr", [(T0, "s2:off")], 2); vis("bPwrOff", [("s2:off", FAR)], 2)
# ── 站 C：s4 念到「開關」電荷流進電容、存了 1 的電容亮；「每一格」框出一個單元 ──
vis("cChg", [("s4:sw+10", FAR)], 8); vis("cCell", [("s4:cell-2", "s4:chop")], 4)
# ── 站 D：s5 一層層落下（16 對，示意三百多層）→ 三段由上往下鑽孔 → 填入儲存層＋通道（吸管） ──
for k in range(INFO["DN"]): vis(f"dL{k}", [(f"s5:voice+{2 + 3 * k}", FAR)], 4)   # 一層層長上去（沉積），不是掉下來
vis("dStair", [("s5:voice+52", FAR)], 6)
for s in range(3): vis(f"dHole{s}", [(f"s5:drill+{2 + 9 * s}", FAR)], 4)
vis("dFill", [("s5:straw-6", FAR)], 8)
drop("dStraw", "s5:straw-8", dy=1.4, dur=10, bounce=0.03); VIS.append(hid("dStraw", "s5:straw+40", FAR, 6))
# ── 站 N：s9 念到「電動車」閃電亮；念到「撐不住」矽晶圓裂開 ──
vis("nBolt", [("s9:ev-2", FAR)], 4); vis("nCrack", [("s9:si-2", FAR)], 3)

# ═════ 各幕（看向 x, y, 距離, 仰角）═════
AV = (0.0, -1.6, 30, 42)
BW = (INFO["BX"], -2.2, 42, 44)
BV1 = (INFO["BX"] - 2.0, -1.5, 30, 20)
BV2 = (INFO["BX"], -3.3, 40, 50)
CV = (INFO["CX"], 0.3, 33, 22)
DV = (INFO["DX"], 0.2, 33, 20)
EV = (INFO["EX"], -1.0, 52, 30)
FV = (150.0, -1.1, 37, 14)
GV = (180.0, -1.1, 37, 14)
HV = (INFO["HX"] - 0.6, -1.2, 44, 28)
NV = (INFO["NX"], -1.1, 33, 12)
def S_(at, v, dur=30, yaw=None): return shot(at, v[0], v[1], v[2], v[3], dur, yaw)
P = {}
P["s1"] = {"shot": [S_("start-30", AV, 1, yaw=0.0)], "shift": VIS,
 "run": [run("aSpin", "start-30", "s2:start", 1)],
 "labels": [lab("aDieA", "一格＝一顆記憶體晶粒", "Each square = one memory die", "amber", "fab-2", "fab+43")],
 "overlay": [sec("memfab-hook", "start", nxt("s1"), "中游補充篇・M2", "示意", {"prev": "prev", "q": "q", "fab": "fab"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "kinds", "at": CC, "dur": 1}],
 "shot": [S_(CC, BW, 1), S_("desk-8", BV1, 26)],
 "run": [run("bBitGlow", "start-10", "s3:start", 4), run("aSpin", "start-30", "start", 1), run("bSsdGlow", "start-10", "off", 4), run("bSsdSteady", "off", "s4:start", 4)],
 "labels": [lab("bDimmA", "動態記憶體（DRAM）模組", "DRAM module", "blue", "desk-4", "desk+41")],
 "overlay": [card("s2", "memfab-desk", "動態記憶體：像書桌", "示意", {"three": "three", "desk": "desk", "off": "off"})]}
P["s3"] = {"shot": [S_(CC, BV2, 1)],
 "run": [run("bNorGlow", "boot-4", "s4:start", 6), run("bBoot", "boot-2", "s4:start", 4)],
 "labels": [lab("bSsdA", "儲存型快閃（NAND）：固態硬碟", "NAND flash: SSD", "amber", "ware-4", "ware+41"),
            lab("bNorA", "編碼型快閃（NOR）：開機晶片", "NOR flash: boot chip", "blue", "note-4", "note+41")],
 "overlay": [card("s3", "memfab-flash", "快閃記憶體：斷電也不消失", "示意", {"flash": "flash", "ware": "ware", "keep": "keep", "note": "note", "boot": "boot"}, h=392, y=1000)]}
P["s4"] = {"zoom": [{"to": "dram", "at": CC, "dur": 1}],
 "shot": [S_(CC, CV, 1)],
 "run": [run("cWLGlow", "sw-4", "sw+26", 4), run("cFill", "sw+4", "cap+6", 4), run("cLeak", "cap+6", "s5:start", 6)],
 "labels": [lab("cCellA", "一格：開關＋電容", "One cell: transistor + capacitor", "amber", "cell", "cell+45"),
            lab("cCapA", "電容：又細又高", "Tall, thin capacitors", "blue", "cap+4", "cap+49"),
            lab("cWLA", "開關（字元線）", "Switch gate (word line)", "amber", "sw", "sw+45")],
 "overlay": [card("s4", "memfab-cell", "動態記憶體：一格＝開關＋電容", "示意（放大，不按比例）", {"cell": "cell", "sw": "sw", "cap": "cap", "chop": "chop"})]}
P["s5"] = {"zoom": [{"to": "nand", "at": CC, "dur": 1}],
 "shot": [S_(CC, DV, 1)],
 "run": [run("dEtch0", "drill-2", "drill+11", 3), run("dEtch1", "drill+11", "drill+20", 3), run("dEtch2", "drill+20", "straw-8", 3)],
 "labels": [lab("dStackA", "導體層／絕緣層交錯", "Alternating conductor / oxide", "amber", "n300-2", "n300+43"),
            lab("dHoleA", "由上往下鑽深孔", "Deep holes etched down", "blue", "drill", "drill+45"),
            lab("dFillA", "填入儲存層＋通道", "Charge-trap layer + channel", "amber", "straw", "straw+30")],
 "overlay": [card("s5", "memfab-nand", "儲存型快閃：疊層再鑽孔", "示意（畫 16 對，實際三百多層）", {"stack": "stack", "n300": "n300", "drill": "drill", "straw": "straw"})]}
P["s6"] = {"zoom": [{"to": "idm", "at": CC, "dur": 1}, {"to": "global", "at": "sam-4", "dur": 1}],
 "shot": [S_(CC, EV, 1), S_("sam-6", FV, 1)],
 "run": [run("eOffGlow", "idm-4", "sam", 6), run("eHand", "idm+6", "sam", 4), run("eFabGlow", "make-4", "sam", 6), run("eFan0", "start-10", "sam", 10), run("eFan1", "start-10", "sam", 10), run("eFan2", "start-10", "sam", 10), run("eFan3", "start-10", "sam", 10), run("fNod", "sam", "s7:start", 6)],
 "labels": [lab("eOffA", "設計", "Design", "blue", "idm-2", "sam-12"), lab("eFbA", "製造（晶圓廠）", "Manufacturing (fab)", "amber", "make-2", "sam-8", xy=[640, 330])],
 "overlay": [card("s6", "memfab-idm", "大廠：自己設計、自己製造", "TrendForce 2026 Q2",
                  {"spec": "spec", "idm": "idm", "make": "make", "sam": "sam", "sk": "sk", "mu": "mu", "tf": "tf", "n90": "n90"}, h=392, y=1000)]}
P["s7"] = {"zoom": [{"to": "tw", "at": CC, "dur": 1}],
 "shot": [S_(CC, GV, 1)],
 "overlay": [card("s7", "memfab-tw", "台灣：利基型記憶體", "媒體報導；截至 2026/11/28", {"niche": "niche", "spec": "spec", "nanya": "nanya", "wb": "wb", "mx": "mx"}, h=392, y=1000)]}
P["s8"] = {"zoom": [{"to": "mu", "at": CC, "dur": 1}],
 "shot": [S_(CC, HV, 1)],
 "run": [run("hTsvGlow", "hbm-4", "s9:start", 6), run("hFan0", "start-10", "s9:start", 10), run("hFan1", "start-10", "s9:start", 10)],
 "labels": [lab("hFabA", "美光台灣晶圓廠（示意）", "Micron Taiwan fab (illustrative)", "blue", "mu", "ty+30"),
            lab("hHbmA", "高頻寬記憶體：一疊十二層", "HBM: 12-high stack", "amber", "hbm-4", "hbm+41")],
 "overlay": [card("s8", "memfab-mu", "美光在台灣", "公司與媒體報導；截至 2026/11/28", {"mu": "mu", "tc": "tc", "ty": "ty", "hbm": "hbm"})]}
P["s9"] = {"zoom": [{"to": "next", "at": CC, "dur": 1}],
 "shot": [S_(CC, NV, 1)],
 "run": [run("nBoltGlow", "ev", "s10:start", 6), run("nArc", "si-2", "s10:start", 3)],
 "labels": [lab("nSiA", "耐壓不夠（示意）", "Breaks down at high voltage", "amber", "si-2", "si+36"),
            lab("nSiCA", "碳化矽", "Silicon carbide", "blue", "sic+2", "sic+47", xy=[470, 830]), lab("nGaNA", "氮化鎵", "Gallium nitride", "blue", "sic+50", "sic+95", xy=[790, 830])],
 "overlay": [sec("memfab-next", C, "s10:start", "下一集：碳化矽與氮化鎵", "留言「記憶體廠」", {"ev": "ev", "si": "si", "next": "next", "sic": "sic", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": f"查證截至 {AS_OF}", "noteAlways": True}
levels = [lv("start", "記憶體晶圓（示意）", "MEMORY WAFER", "30 cm", "3 cm"), lv("kinds", "三種記憶體（示意）", "DRAM / NAND / NOR", "15 cm", "1 cm"),
          lv("dram", "動態記憶體陣列放大（示意）", "DRAM CELL ARRAY", "1 µm", "0.1 µm"), lv("nand", "儲存型快閃疊層放大（示意）", "3D NAND STACK", "10 µm", "1 µm"),
          lv("idm", "整合元件製造廠（示意）", "IDM", "300 m", "30 m"), lv("global", "全球動態記憶體三大廠", "DRAM MAKERS", "100 cm", "10 cm"),
          lv("tw", "台灣記憶體廠", "TAIWAN MAKERS", "100 cm", "10 cm"), lv("mu", "美光台灣（示意）", "MICRON TAIWAN", "300 m", "30 m"), lv("next", "化合物半導體（下一集）", "NEXT", "30 cm", "3 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-memfab", "prevEpisode": "M1：成熟與特殊製程代工", "title": "記憶體製造（科技透明圈）", "asOf": AS_OF, "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "中游補充篇", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["記憶體製造", "另一種晶圓廠"], "sub": "動態記憶體＋儲存型＋編碼型快閃", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
for s in scenes:
    t = s.get("tts") or ""
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9]", t): bad.append((s["id"], "數字"))
    for w in ["量測", "矽", "光罩"]:
        if w in t: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
