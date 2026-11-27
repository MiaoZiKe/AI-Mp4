"""tech-fanout 腳本產生器：python3 videos/tech-fanout/genscript.py → script.json（先跑 gen-model.mjs 產 model.json）
扇出型與晶圓級封裝（科技透明圈 系列 3 第 5 集；前一集 3-4 覆晶；下一集 3-6 先進封裝設備）。念稿定稿於 script.md（一字不改）。
2D 卡：src/components/three/HudFanout.tsx（fo-*）。構造與物理：physics-spec.md。
Andy 規範：第 27 條念稿 ≤260 字；第 28 條 ≥3 比喻；第 29 條爆炸分解步驟做完；第 32 條出處列只放真實來源；
第 39 條旁白之間無聲 ≤1 秒（念完留白 0.6 秒＋下一幕開口前 0.3 秒）；第 40 條公司卡 ≥1.2 秒×公司數＋1.5 秒、念完最後一家後 ≥1 秒。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
AX0, BXc, CXc, DXc, EXc, FXc, GXc, HXc = (INFO[k] for k in ("AX0", "BXc", "CXc", "DXc", "EXc", "FXc", "GXc", "HXc"))
SRC_TSMC = "台積電 InFO 技術頁"
SRC_PAT = "Chip Scale Review 2022；USPTO 8772087"
# (id, beat, 旁白（字幕原文）, 中文字幕行, 英文字幕行, cues, keywords, sources, 開口前秒)
S = [
("s1", "hook", "不用載板，線要怎麼拉出去？前一集，覆晶還得靠載板拉線。",
 ["不用載板", "線要怎麼拉出去？", "前一集", "覆晶還得", "靠載板拉線"], ["Without a substrate,", "how do the wires get out?", "Last episode:", "flip chip still", "relies on a substrate."],
 [("sub", "載板"), ("out", "拉出去"), ("prev", "前一集"), ("flip", "覆晶")], ["載板", "拉出去", "覆晶"], [SRC_TSMC + "；示意動畫，不是量測"], 0.0),
("s2", "mechanism", "晶片越做越小，接點卻越來越多，底下塞不下錫球。",
 ["晶片越做越小", "接點卻越來越多", "底下塞不下錫球"], ["Chips keep shrinking,", "yet contacts keep multiplying,", "leaving no room for solder balls."],
 [("small", "越做越小"), ("more", "越來越多"), ("nofit", "塞不下")], ["接點", "錫球"], ["USPTO 8093722、8482136；示意動畫，不是量測"], 0.3),
("s3", "mechanism", "晶圓級封裝，是晶圓還沒切，就先做好線路和錫球，切開就跟晶片差不多大。",
 ["晶圓級封裝", "是晶圓還沒切", "就先做好", "線路和錫球", "切開就跟晶片", "差不多大"], ["Wafer-level packaging:", "before the wafer is cut,", "it already gets", "its wiring and solder balls;", "once cut, it is about", "the size of the chip."],
 [("wlp", "晶圓級封裝"), ("uncut", "還沒切"), ("balls", "線路和錫球"), ("cut", "切開"), ("same", "差不多大")], ["晶圓級封裝", "錫球", "差不多大"], ["USPTO 9576912、8624359；示意動畫，不是量測"], 0.3),
("s4", "mechanism", "可是接點只能擠在晶片範圍裡，像小便條寫滿電話，很快就寫不下。",
 ["可是接點", "只能擠在晶片範圍裡", "像小便條", "寫滿電話", "很快就寫不下"], ["But the contacts", "must fit inside the chip,", "like a sticky note", "full of phone numbers:", "it soon runs out of room."],
 [("only", "只能擠"), ("note", "小便條"), ("phone", "電話"), ("full", "寫不下")], ["晶片範圍", "小便條"], ["USPTO 8093722；示意動畫，不是量測"], 0.3),
("s5", "mechanism", "扇出型先把好晶片排進載盤，再灌滿塑膠，像餅乾排進烤盤倒滿巧克力，變成一片新晶圓。",
 ["扇出型先把", "好晶片排進載盤", "再灌滿塑膠", "像餅乾排進烤盤", "倒滿巧克力", "變成一片新晶圓"], ["Fan-out first places", "good chips on a carrier,", "then fills it with plastic,", "like cookies on a tray", "covered in chocolate,", "making a brand-new wafer."],
 [("fo", "扇出型"), ("place", "排進載盤"), ("fill", "灌滿塑膠"), ("cookie", "餅乾"), ("choco", "巧克力"), ("new", "新晶圓")], ["扇出型", "餅乾", "新晶圓"], [SRC_PAT + "（重組晶圓）"], 0.3),
("s6", "mechanism", "再鋪重佈線層，銅線像延長線，從晶片拉到外圍，錫球就有地方放。",
 ["再鋪重佈線層", "銅線像延長線", "從晶片拉到外圍", "錫球就有地方放"], ["Next comes a redistribution layer:", "copper lines, like extension cords,", "run from the chip to the edge,", "so the solder balls have room."],
 [("rdl", "重佈線層"), ("cord", "延長線"), ("outer", "外圍"), ("ball", "錫球")], ["重佈線層", "延長線", "外圍"], ["台積電 InFO 技術頁；Chip Scale Review 2022"], 0.3),
("s7", "twist", "難處是塑膠和晶片熱脹冷縮不同，整片會翹，晶片被擠歪，線就對不準。",
 ["難處是塑膠和晶片", "熱脹冷縮不同", "整片會翹", "晶片被擠歪", "線就對不準"], ["The catch: plastic and chips", "expand differently with heat,", "so the whole wafer warps,", "chips get pushed off,", "and the lines miss their targets."],
 [("cte", "熱脹冷縮"), ("warp", "會翹"), ("shift", "擠歪"), ("miss", "對不準")], ["熱脹冷縮", "翹", "擠歪"], ["Chip Scale Review 2022；USPTO 8772087"], 0.3),
("s8", "payoff", "台積電的整合扇出型，2016 年起用在手機處理器；力成正把它做到方形面板。",
 ["台積電的", "整合扇出型", "2016 年起", "用在手機處理器", "力成正把它", "做到方形面板"], ["TSMC's", "InFO (Integrated Fan-Out)", "since 2016", "has been in phone processors;", "Powertech is taking fan-out", "to square panels."],
 [("tsmc", "台積電"), ("info", "整合扇出型"), ("y2016", "2016"), ("phone", "手機處理器"), ("ptc", "力成"), ("panel", "方形面板")], ["台積電", "整合扇出型", "力成"], ["台積電 InFO 技術頁；Yole；經濟日報"], 0.3),
("s9", "cta", "好幾顆晶片封在一起，需要更精密的機台。下一集，看先進封裝設備。留言扇出，拿完整資料。",
 ["好幾顆晶片", "封在一起", "需要更精密的機台", "下一集", "看先進封裝設備", "留言扇出", "拿完整資料"], ["Several chips", "packed together", "need more precise machines.", "Next episode:", "advanced packaging tools.", "Comment \"扇出\"", "for the full notes."],
 [("multi", "好幾顆"), ("tool", "機台"), ("next", "下一集"), ("kw", "留言扇出")], ["精密", "先進封裝設備", "扇出"], ["示意動畫，不是量測"], 0.2),
]
def TTS(t):
    t = t.replace("2016 年", "二零一六年").replace("上集", "上一集").replace("矽", "細").replace("光罩", "光照")
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("上百片", "一百多片")]:
        t = t.replace(a, b)
    return t
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, head) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？]", "", z)) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？]", "", z)) >= 3, ("字幕短語 <3 字", sid, z)
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", "") .replace("2016年", "2016 年") or c[1] in "".join(zh), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", TTS(nar)))
    hold = 0.6; dur = round(head + nch / 4.7 + hold + 0.05, 1)  # Andy 第 39 條：念完 0.6 秒＋下一幕開口前 0.3 秒＝無聲 0.9 秒
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar), "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues], "component": "ThreeScene", "sources": src, "props": {}, "durationSec": max(dur, 4.6), "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
scenes[0]["props"]["hook"] = {"kicker": "接上集：覆晶還得靠載板", "title": "不用載板？", "size": 120, "top": 236}
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "先進封裝設備", "trail": ["線做在晶圓，晶片拉得出去"], "comment": "扇出", "logoAnim": "transparent"}}})
FAR = "s10:start+400"; T0 = "s1:start-40"
def run(i, at, until=None, ramp=6, **kw):
    d = {"id": i, "at": at, "ramp": ramp}
    if until: d["until"] = until
    d.update(kw); return d
def lab(part, text, en, color, at, until, xy=None, **kw):
    d = {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until, "cut": True}
    if xy: d["xy"] = xy
    d.update(kw); return d
DF = 1.8
YAW = [0.0]
def shot(at, x, y, d, elev, dur=30, yaw=None):
    o = {"at": at, "dur": dur, "x": x, "y": y, "d": round(d * DF, 1), "elev": elev}
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
C = "voice-3"; CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw): return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)

# ── 站 B：切割刀沿切割道（z＝4.0）走一刀，切口跟著刀一段段亮；切完退出；頂出那顆：吸嘴下降→頂針往上頂→一起抬起
VIS += [mv("bSaw", "s3:uncut", FAR, 40, dx=20.0), mv("bSaw", "s3:cut-8", FAR, 12, dx=14.0)]
for k in range(8): vis(f"bKerf{k}", [(f"s3:uncut{int(2 * (5.4 + 2.2 * k)):+d}", FAR)], 1)
vis("bCross", [("s3:uncut+40", FAR)], 4)
VIS += [mv("bCollet", T0, FAR, 1, dy=2.6), mv("bCollet", "s3:cut-8", FAR, 8, dy=-2.5), mv("bCollet", "s3:cut+8", FAR, 16, dy=2.4)]
VIS += [mv("bEject", "s3:cut", FAR, 6, dy=0.3), mv("bEject", "s3:cut+26", FAR, 8, dy=-0.3)]
VIS += [mv("bPick", "s3:cut+8", FAR, 16, dy=2.4)]
# ── 站 C：錫球一排排落到焊墊（s2:more 起），最後放不下的紅球被擠開滾走（s2:nofit）
for r in range(7):
    VIS += [{"layer": f"cRow{r}", "at": T0, "until": f"s2:small{6 * r - 4:+d}", "dur": 12, "dy": 3.0, "fallIn": True, "bounce": 0.06, "opacity": 0}]
VIS += [{"layer": "cExtra", "at": T0, "until": "s2:nofit-6", "dur": 12, "dy": 3.0, "fallIn": True, "bounce": 0.1}, mv("cExtra", "s2:nofit+14", FAR, 20, dz=3.0, dy=-1.9, throw=0.6)]
vis("cExtra", [("s2:nofit-18", "s4:start")])
# ── 站 D：取放頭一顆一顆放（移到晶片盤→下降吸→抬→移到載盤空格→下降放→抬），兩顆；退回待命 → 點膠（連續料柱）→ 料由中心往外攤開（中心厚、外圈薄、邊緣唇）→ 點膠架移開 → 上模壓下、料被壓平、加熱 → 上模抬起露出新晶圓
HX0, HZ0, TRX, TRZ, DR = INFO["HX0"], INFO["HZ0"], INFO["TRX"], INFO["TRZ"], INFO["DR"]
def F5(n): return f"s5:fo{n:+d}"
PK = (TRX - 1.2, TRZ); TG = [(DXc + DR[2], DR[3]), (DXc + DR[3], DR[3])]
def head(at, dur, dx=0.0, dz=0.0, dy=0.0, carry=None):
    out = [mv("dHead", F5(at), FAR, dur, dx=round(dx, 3), dz=round(dz, 3), dy=round(dy, 3))]
    if dx: out.append(mv("dHeadX", F5(at), FAR, dur, dx=round(dx, 3)))
    if carry: out.append(mv(carry, F5(at), FAR, dur, dx=round(dx, 3), dz=round(dz, 3), dy=round(dy, 3)))
    return out
pos = [HX0, HZ0]; t = 0
def go(x, z, dur=12, carry=None):
    global t
    VIS.extend(head(t, dur, dx=x - pos[0], dz=z - pos[1], carry=carry)); pos[0], pos[1] = x, z; t += dur
for k, (tx, tz) in enumerate(TG):
    go(*PK); VIS.extend(head(t, 4, dy=-0.5)); t += 5; VIS.extend(head(t, 4, dy=0.5, carry=f"dCarry{k}")); t += 4
    go(tx, tz, carry=f"dCarry{k}"); VIS.extend(head(t, 4, dy=-0.29, carry=f"dCarry{k}")); t += 5; VIS.extend(head(t, 4, dy=0.29)); t += 4
go(DXc + 10.6, HZ0); T_PARK = t
POUR = T_PARK
for k in range(4): vis(f"dMold{k}", [(F5(POUR + 4 + 9 * k), FAR)], 1)
vis("dDisp", [(F5(POUR - 10), FAR)], 4); VIS += [mv("dDisp", F5(POUR + 44), FAR, 12, dx=-12.0)]
VIS += [mv("dChase", T0, FAR, 1, dy=2.0), mv("dChase", "s5:choco-6", FAR, 14, dy=-4.9), mv("dChase", "s5:new-6", FAR, 14, dy=4.9)]
vis("dChase", [(F5(POUR + 30), FAR)], 4)
VIS += [mv("dMold0", "s5:choco+6", FAR, 6, dy=-0.45), mv("dMold1", "s5:choco+6", FAR, 6, dy=-0.25), mv("dMold2", "s5:choco+6", FAR, 6, dy=-0.1)]
# ── 站 E：製作方向（重組晶圓翻面、重佈線面朝上）：上層依序往上分開 → 外圍銅線長出 → 組回停 0.5 秒 → 錫球從上方落到外圍焊墊
UPS = {"ePi2": (2.1, "-6"), "eRdl": (1.4, "+4"), "eRdlOut": (1.4, "+4"), "ePi1": (0.7, "+14")}
for l, (d, o) in UPS.items(): VIS += [mv(l, "s6:rdl" + o, "s6:outer", 14, dy=d)]
vis("eRdlOut", [("s6:cord+4", FAR)], 10)
VIS += [{"layer": "eBall", "at": T0, "until": "s6:outer+14", "dur": 12, "dy": 1.6, "fallIn": True, "bounce": 0.08, "opacity": 0}]
# ── 站 F：加熱→冷卻後整片邊緣往上翹（10 圈、每圈高差小）；被推歪那顆跟著所在那一圈抬高、往外移出原位虛框；導通孔留在原位對不準（紅叉）
NR, FSK = INFO["NR"], INFO["FSK"]
WY = [round(1.25 * ((k + 0.5) / NR) ** 2, 3) for k in range(NR)]
for k in range(1, NR): VIS += [mv(f"fR{k}", "s7:warp-4", FAR, 18, dy=WY[k])]
for g in INFO["FDGK"]: VIS += [mv(f"fD{g}", "s7:warp-4", FAR, 18, dy=WY[g])]  # 晶片跟著碰到的最高那一圈走，不被切
for l in ("fShift", "fGhost", "fArrow", "fMiss"): VIS += [mv(l, "s7:warp-4", FAR, 18, dy=WY[INFO["FSKD"]])]
VIS += [mv("fShift", "s7:shift", FAR, 14, dx=0.95)]
vis("fGhost", [("s7:shift-2", FAR)], 1); vis("fArrow", [("s7:shift-4", "s7:shift+34")], 4); vis("fMiss", [("s7:miss-8", FAR)], 1)
# ── 站 G：兩座展台全程不透明；InFO-PoP 記憶體封裝在 info 時疊下來
VIS += [{"layer": "gMem", "at": T0, "until": "s8:info+4", "dur": 16, "dy": 2.5, "fallIn": True, "bounce": 0.05, "opacity": 0}]
# ═════ 各幕 ═════
P = {}
P["s1"] = {"shot": [shot("start-30", AX0 + 8, 1.6, 27, 28, 1, yaw=0.0), shot("prev-2", AX0 - 8, 1.6, 27, 28, 1)], "shift": VIS,
 "labels": [lab("aRdlA", "沒有載板：重佈線層", "No substrate: RDL", "amber", "sub+4", "sub+49"), lab("aSubA", "載板（前一集）", "Substrate (last episode)", "blue", "flip-6", "flip+39")],
 "overlay": [sec("fo-hook", "start", nxt("s1"), "系列 3・第 5 集", "示意，非實際比例", {"sub": "sub", "out": "out", "prev": "prev", "flip": "flip"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, CXc, -1.2, 22, 40, 1)],
 "labels": [lab("cPadA", "焊墊越來越多", "More and more pads", "blue", "more-6", "more+39"), lab("cExtraA", "放不下", "No room", "amber", "nofit+2", "nofit+47")],
 "overlay": [card("s2", "fo-fanin", "接點多、晶片小", "示意", {"small": "small", "more": "more", "nofit": "nofit"})]}
P["s3"] = {"zoom": [{"to": "wafer", "at": CC, "dur": 1}],
 "shot": [shot(CC, BXc - 0.5, -2.2, 32, 40, 1), shot("cut-2", BXc + 2.6, 1.4, 15, 14, 20)],
 "run": [run("bSpin", "start-20", "cut", 6), run("bCoolant", "uncut", "cut", 6)],
 "labels": [lab("bWaferA", "每格晶片已有錫球", "Balls on every die", "blue", "balls-20", "balls+25"), lab("bPickA", "切開＝成品", "Cut = finished", "amber", "cut+20", "cut+65")],
 "overlay": [card("s3", "fo-wlp", "晶圓級封裝", "示意", {"wlp": "wlp", "uncut": "uncut", "balls": "balls", "cut": "cut", "same": "same"})]}
P["s4"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, CXc, -1.2, 22, 62, 1)],
 "run": [run("cEdgeGlow", "only", "full+20", 6)],
 "labels": [lab("cEdgeA", "晶片範圍（扇入）", "Chip outline (fan-in)", "amber", "only", "only+45")],
 "overlay": [card("s4", "fo-note", "小便條寫滿電話", "示意", {"only": "only", "note": "note", "phone": "phone", "full": "full"})]}
P["s5"] = {"zoom": [{"to": "panel", "at": CC, "dur": 1}],
 "shot": [shot(CC, DXc, 1.0, 44, 32, 1)],
 "run": [run("dPour", F5(POUR), F5(POUR + 40), 6), run("dHeat", "choco+8", "new-6", 6)],
 "labels": [lab("dHeadA", "取放頭：一顆一顆放", "Pick-and-place, one by one", "blue", F5(2), F5(47)), lab("dMoldA", "模封料（稠，往外攤開）", "Mold compound flows out", "amber", F5(POUR + 8), F5(POUR + 53)), lab("dChaseA", "上模壓下、加熱", "Mold press + heat", "blue", "choco-2", "choco+43")],
 "overlay": [card("s5", "fo-recon", "餅乾排進烤盤倒巧克力", "示意（晶片先放）", {"place": "place", "fill": "fill", "cookie": "cookie", "new": "new"})]}
P["s6"] = {"zoom": [{"to": "pkg", "at": CC, "dur": 1}],
 "shot": [shot(CC, EXc, -0.2, 18, 28, 1), shot("rdl-6", EXc, 1.1, 20, 28, 16), shot("outer+2", EXc, 0.0, 17, 30, 12)],
 "run": [run("eCuGrow", "cord+4", "outer", 6), run("eCuGrow2", "cord+4", "outer", 6)],
 "labels": [lab("eDieA", "晶片埋在模封料", "Chip in mold", "blue", "rdl-12", "rdl+33"), lab("ePi1A", "介電層＋導通孔", "Dielectric + vias", "amber", "rdl+35", "rdl+80"), lab("eRdlA", "重佈線層（銅線）", "RDL copper lines", "amber", "rdl+82", "rdl+127"), lab("eBallA", "球下金屬墊＋錫球（晶片外）", "UBM pads + balls, outside the chip", "blue", "outer+30", "outer+75")],
 "overlay": [card("s6", "fo-rdl", "延長線拉到外圍", "示意", {"rdl": "rdl", "cord": "cord", "outer": "outer", "ball": "ball"})]}
P["s7"] = {"zoom": [{"to": "panel", "at": CC, "dur": 1}],
 "shot": [shot(CC, FXc + 0.8, -3.4, 36, 42, 1)],
 "run": [run("fHot", "cte-6", "warp", 6), run("fFlow", "shift-12", "shift+20", 6)],
 "labels": [lab("fWarpA", "整片邊緣翹起", "Edges warp up", "amber", "warp", "warp+31"), lab("fMissA", "晶片被推離原位 → 導通孔對不準", "Chip pushed off, via misses", "amber", "shift+2", "miss+37")],
 "overlay": [card("s7", "fo-warp", "熱脹冷縮不同", "示意（不標數字）", {"cte": "cte", "warp": "warp", "shift": "shift", "miss": "miss"})]}
P["s8"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [shot(CC, GXc, 0.4, 50, 22, 1)],
 "run": [run("gAHot", "tsmc-4", "tsmc+40", 4), run("gBHot", "ptc-4", "ptc+40", 4)],
 "overlay": [card("s8", "fo-co", "扇出型封裝：台灣廠", "台積電官網、Yole、經濟日報；截至 2026/11/27", {"tsmc": "tsmc", "info": "info", "phone": "phone", "ptc": "ptc", "panel": "panel"}, h=392, y=1000)]}
P["s9"] = {"zoom": [{"to": "multi", "at": CC, "dur": 1}],
 "run": [run("hLamp", "start", FAR, 6)],
 "shot": [shot(CC, HXc + 1, 0.4, 44, 22, 1)],
 "labels": [lab("hPkgA", "三顆晶片封在一起", "Three chips in one package", "blue", "multi", "multi+45"), lab("hToolA", "下一集：設備", "Next: the tools", "amber", "next-4", "next+41")],
 "overlay": [sec("fo-next", C, "s10:start", "接下來", "下一集：先進封裝設備", {"next": "next", "kw": "kw", "tool": "tool", "multi": "multi"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])
lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("pkg", "封裝剖面（示意）", "PACKAGE CROSS-SECTION", "10 mm", "1 mm"), lv("micro", "晶片底面（示意）", "CHIP UNDERSIDE", "10 mm", "1 mm"), lv("wafer", "晶圓（示意）", "WAFER", "300 mm", "10 mm"),
          lv("panel", "重組晶圓（示意）", "RECONSTITUTED WAFER", "300 mm", "10 mm"), lv("co", "扇出型封裝廠", "SUPPLIERS", "10 mm", "1 mm"), lv("multi", "多晶片封裝與設備（示意）", "MULTI-CHIP PACKAGE", "100 mm", "10 mm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-fanout", "prevEpisode": "3-4：覆晶", "title": "扇出型與晶圓級封裝（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "封裝", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b", "_說明": "旁白金手指；Andy 在 AI Studio 錄音；本支不送 TTS"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定產品"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["不用載板", "線怎麼拉出去"], "sub": "扇出型與晶圓級封裝", "frame": 40}, "sample": False, "scenes": scenes}
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
print("念稿字數", n, "問題", bad, "無聲估計片長", round(sum(s["durationSec"] for s in scenes), 1), "秒")
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
