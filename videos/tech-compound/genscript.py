"""tech-compound 腳本產生器：python3 videos/tech-compound/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
中游補充篇 M3：化合物半導體 碳化矽／氮化鎵（前一集 M2 記憶體製造；下一集 M4 再生晶圓）。念稿定稿於 script.md（頻道負責人 2026/11/28 核准；
念稿「前一集／細」＝字幕「上一集／矽」）。2D 卡：src/components/three/HudCompound.tsx（cp-*）。構造：physics-spec.md；模組：visual-spec.md。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
AS_OF = "2026/11/28"
S = [
("s1", "hook", "前一集說矽撐不住，那換什麼？答案是碳化矽和氮化鎵，專門扛高壓。",
 ["前一集說矽撐不住", "那換什麼？", "答案是碳化矽", "和氮化鎵", "專門扛高壓"], ["Last time: silicon can't take it.", "So what replaces it?", "The answer: silicon carbide", "and gallium nitride,", "built for high voltage."],
 [("prev", "前一集"), ("q", "換什麼"), ("sic", "碳化矽"), ("gan", "氮化鎵"), ("hv", "扛高壓")], ["碳化矽", "氮化鎵", "高壓"], ["示意動畫，不是量測"]),
("s2", "mechanism", "關鍵叫能隙，就是電子跳過去的門檻。門檻太低，電壓一高就漏電。",
 ["關鍵叫能隙", "就是電子", "跳過去的門檻", "門檻太低", "電壓一高就漏電"], ["The key is the band gap:", "the hurdle electrons", "must jump over.", "If the hurdle is low,", "high voltage makes it leak."],
 [("gap", "能隙"), ("elec", "電子"), ("bar", "跳過去的門檻"), ("low", "門檻太低"), ("leak", "漏電")], ["能隙", "門檻", "漏電"], ["半導體物理通則（National Academies）；示意"]),
("s3", "mechanism", "碳化矽和氮化鎵的門檻，大約是矽的三倍，像把堤防加高，擋得住高電壓。",
 ["碳化矽和氮化鎵", "的門檻", "大約是矽的三倍", "像把堤防加高", "擋得住高電壓"], ["For silicon carbide and gallium nitride,", "the hurdle is", "about three times silicon's,", "like raising a levee:", "it holds back high voltage."],
 [("wide", "的門檻"), ("x3", "三倍"), ("dam", "堤防"), ("hold", "擋得住")], ["三倍", "堤防", "高電壓"], ["能隙：National Academies、Infineon、Mouser"]),
("s4", "payoff", "所以碳化矽用在電動車，把電池的電轉給馬達，耗損更少。",
 ["所以碳化矽", "用在電動車", "把電池的電", "轉給馬達", "耗損更少"], ["So silicon carbide", "goes into EVs,", "taking battery power", "to the motor", "with less loss."],
 [("ev", "電動車"), ("bat", "電池"), ("motor", "馬達"), ("loss", "耗損更少")], ["電動車", "馬達", "耗損"], ["System Plus 拆解報告、IDTechEx；示意"]),
("s5", "payoff", "氮化鎵開關特別快，做成快充頭和 AI 機房電源，體積更小。",
 ["氮化鎵開關特別快", "做成快充頭", "和 AI 機房電源", "體積更小"], ["Gallium nitride switches very fast,", "so it goes into fast chargers", "and AI data-center power,", "making them smaller."],
 [("fast", "開關特別快"), ("chg", "快充頭"), ("ai", "機房電源"), ("small", "體積更小")], ["開關", "快充頭", "體積"], ["Infineon 寬能隙資料；示意"]),
("s6", "twist", "但碳化矽很難做。爐子比煉鋼還熱，氣體像結霜一樣慢慢凝結，一週多才幾公分。",
 ["但碳化矽很難做", "爐子比煉鋼還熱", "氣體像結霜一樣", "慢慢凝結", "一週多才幾公分"], ["But silicon carbide is hard to make.", "The furnace is hotter than steelmaking;", "the vapor, like frost,", "slowly condenses:", "a week-plus for a few centimeters."],
 [("hard", "很難做"), ("hot", "比煉鋼還熱"), ("frost", "結霜"), ("slow", "一週多")], ["很難做", "結霜", "幾公分"], ["科技新報 2019/10/02、2021/09/24；示意"]),
("s7", "mechanism", "氮化鎵則是在矽晶圓表面，鋪一層薄薄的晶體，這叫磊晶。",
 ["氮化鎵則是", "在矽晶圓表面", "鋪一層薄薄的晶體", "這叫磊晶"], ["Gallium nitride, instead,", "goes on a silicon wafer's surface", "as a thin crystal layer:", "this is called epitaxy."],
 [("si", "矽晶圓表面"), ("film", "薄薄的晶體"), ("epi", "這叫磊晶")], ["矽晶圓", "磊晶"], ["工商時報 2025/07/04（矽基氮化鎵）；示意"]),
("s8", "payoff", "台灣分成三段。環球晶做基板，嘉晶做磊晶，漢磊做元件代工。",
 ["台灣分成三段", "環球晶做基板", "嘉晶做磊晶", "漢磊做元件代工"], ["Taiwan splits it into three steps:", "GlobalWafers makes substrates,", "Episil-Precision does epitaxy,", "Episil Technologies makes the devices."],
 [("three", "三段"), ("gw", "環球晶"), ("epw", "嘉晶"), ("hl", "漢磊")], ["環球晶", "嘉晶", "漢磊"], ["工商時報、鉅亨網、科技新報報導；截至 2026/11/28"]),
("s9", "cta", "不管哪種晶圓都不便宜，所以工廠拿來測機台的片子，用完磨掉一層還能再用。下一集看再生晶圓。留言化合物，拿完整資料。",
 ["不管哪種晶圓", "都不便宜", "所以工廠拿來", "測機台的片子", "用完磨掉一層", "還能再用", "下一集看再生晶圓", "留言化合物", "拿完整資料"],
 ["Whatever the wafer,", "none are cheap,", "so the wafers factories use", "to test their machines", "get a layer ground off", "and are used again.", "Next: reclaimed wafers.", "Comment \"compound\"", "for the full notes."],
 [("cost", "不便宜"), ("test", "測機台"), ("grind", "磨掉一層"), ("next", "下一集"), ("kw", "留言化合物")], ["不便宜", "再生晶圓"], ["示意動畫，不是量測"]),
]
def TTS(t):
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("矽", "細"), ("光罩", "光照")]:
        t = t.replace(a, b)
    return t
scenes = []
HOLD = {}
for i, (sid, beat, nar, zh, en, cues, kws, src) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？、；]", "", z)) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？、；]", "", z)) >= 3, ("字幕短語 <3 字", sid, z)
    for e in en: assert len(e) <= 42, (sid, e)
    assert re.sub(r"[ ，。？、；：]", "", "".join(zh)) == re.sub(r"[ ，。？、；：]", "", nar), (sid, "字幕和念稿不同")
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar))
    head = 0.0 if sid == "s1" else 0.3
    hold = HOLD.get(sid, 0.6)   # 第 39 條：念完 hold 秒換幕（＋下一幕開口前 0.3 秒＝無聲 ≤1.0 秒）
    dur = round(head + nch / 5.2 + 0.2 + hold, 1)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": max(4.6, dur), "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
md = open(os.path.join(HERE, "script.md")).read().split("---")[0].split("\n\n")[1:]
paras = [p.strip() for p in md if p.strip()]
assert [s["tts"] for s in scenes] == paras, ("念稿與 script.md 不同", [s["tts"] for s in scenes], paras)
scenes[0]["props"]["hook"] = {"kicker": "接上集：矽撐不住高壓", "title": "那換什麼？", "size": 92, "top": 236}
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "再生晶圓", "trail": ["化合物半導體：碳化矽與氮化鎵"], "comment": "化合物", "logoAnim": "transparent"}}})

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
C = "voice-3"
CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw):
    return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)
def tk(*ks): return {k: k for k in ks}

# ── 站 A：念到「前一集」閃電＋放電光穿過矽；念到碳化矽、氮化鎵綠圈亮 ──
vis("aBolt", [("s1:prev", FAR)], 3); vis("aArc", [("s1:prev+6", FAR)], 3); vis("aOk", [("s1:sic", FAR)], 4)
# ── 站 B：跳上門檻的電子（矽）在念到「門檻太低」才出現 ──
vis("bLeak", [("s2:low", FAR)], 3)
ACT = MODEL["actions"]
# ── 站 C：爆炸分解 9 層（念到「碳化矽」前就拆開，一層一層往上分開，逐層標名），念到「馬達」後才組回 ──
CBACK = "s4:motor+6"
EXP = []
for k, (lay, dy) in enumerate([("cLid", 4.4), ("cGel", 3.7), ("cCase", 3.0), ("cWire", 2.3), ("cDie", 1.75), ("cSol2", 1.3), ("cDbc", 0.85), ("cSol1", 0.42)]):
    EXP.append(mv(lay, f"s4:start+{2 + k * 2}", CBACK, 14, dy=dy))
# 組回後上蓋半透明（剖開示意）：交流出現時看得到晶片在開關閃動
VIS.append(hid("cLid", "s4:motor+10", "s5:start", 8, 0.22))
# ── 站 D：快充爆炸分解（上蓋最高、零件、電路板，零件層與板子拉開 1.0），念到「體積更小」前才組回；組回後上蓋半透明（剖開示意）露出小變壓器，旁邊矽充電頭虛線框＋大變壓器 ──
DBACK = "s5:small-10"
EXP += [mv("dShellT", "s5:start+2", DBACK, 14, dy=3.1), mv("dParts", "s5:start+5", DBACK, 14, dy=2.0), mv("dPcb", "s5:start+8", DBACK, 14, dy=1.0)]
VIS.append(hid("dShellT", "s5:small+4", "s6:start", 10, 0.22))
vis("dGhost", [("s5:small-14", FAR)], 8)
# ── 站 E：長晶爐沿軸線爆炸（上蓋法蘭最高 → 線圈 → 雙層水冷石英管 → 石墨氈 → 坩堝蓋＋晶種）：每層整個越過下一層的頂端；念到「結霜」後組回，組回後外層變淡＝剖開示意 ──
EBACK = "s6:frost-10"
for k, (lay, dy) in enumerate([("eHead", 17.0), ("eCoil", 16.6), ("eQtz", 11.0), ("eFelt", 5.6), ("eLid", 1.2)]):
    EXP.append(mv(lay, f"s6:start+{2 + k * 3}", EBACK, 16, dy=dy))
for lay, o in [("eHead", 0.3), ("eCoil", 0.22), ("eQtz", 0.07), ("eFelt", 0.07), ("eCru", 0.1)]:
    VIS.append(hid(lay, "s6:frost+2", "s7:start", 10, o))
vis("eHot", [("s6:hot", FAR)], 6)
vis("eBoule1", [("s6:frost+24", "s6:slow-6")], 4); vis("eBoule2", [("s6:slow-6", "s6:slow+24")], 4); vis("eBoule3", [("s6:slow+24", FAR)], 4)
# ── 站 F：噴氣頭沿吊臂抬起看到矽晶圓（念到「矽晶圓表面」），落回後腔體與噴氣頭變半透明（剖開示意），噴氣、薄膜出現 ──
EXP.append(mv("fShow", "s7:start-14", "s7:si+2", 14, dy=2.4))
VIS.append(hid("fBody", "s7:si+6", "s8:start", 10, 0.16)); VIS.append(hid("fShow", "s7:si+6", "s8:start", 10, 0.62))
vis("fFilm", [("s7:film+4", FAR)], 14)
# ── 站 H（r2：晶圓全程有東西托著／夾著，不懸空）：上下料座中間的頂桿把測試片頂到翻面夾爪 → 頂桿退下、夾爪夾著翻面（圖案朝下）
#    → 載頭沿龍門橫梁（滑座＋主軸座一起）移到上下料座上方、下降吸片、抬起、移回墊上壓下研磨（全程 EASE.move 加減速）
#    → 研磨液停 → 載頭帶片抬起、移回夾爪放下、退回；夾爪翻正、頂桿頂住放回座上（露出亮面）。載頭移動路徑在 z 0.4，研磨液細流在 z −1.0，且回程前細流已停
#    垂直位移（相對模型位置）：晶圓 0 →+1.09（頂起）→+1.59（被載頭吸起）→−0.11（壓在墊上）→+1.59 →+1.09（放回夾爪）→0；載頭 +1.2 →+1.7 →+1.2（吸片）→+1.7 →0（研磨）→+1.7 →+1.2（放片）→+1.7
WAF = ["hUsed", "hPat"]
for lay in WAF:
    EXP += [mv(lay, "s9:test-46", "s9:next+76", 12, dy=1.09), mv(lay, "s9:test+12", "s9:next+24", 10, dy=0.5),
            mv(lay, "s9:grind-4", "s9:next-10", 10, dy=-1.7), mv(lay, "s9:test+22", "s9:next+2", 20, dx=6.5)]
EXP += [mv("hLift", "s9:test-46", "s9:test-32", 12, dy=1.09), mv("hLift", "s9:next+62", "s9:next+76", 12, dy=1.09)]
EXP += [mv("hHead", "s9:start-30", "s9:grind-4", 10, dy=1.2), mv("hHead", "s9:next-10", FAR, 10, dy=1.2),
        mv("hHead", "s9:test-30", "s9:test+2", 10, dy=0.5), mv("hHead", "s9:test+12", "s9:grind-4", 10, dy=0.5),
        mv("hHead", "s9:next-10", "s9:next+24", 10, dy=0.5), mv("hHead", "s9:next+36", FAR, 8, dy=0.5)]
for lay in ["hHead", "hCarr"]:
    EXP += [mv(lay, "s9:test-20", "s9:test+22", 20, dx=-6.5), mv(lay, "s9:next+2", "s9:next+44", 20, dx=-6.5)]
vis("hPat", [(T0, "s9:grind+20")], 16)

# ═════ 各幕（看向 x, y, 距離, 仰角）═════
AV = (INFO["AX"], 0.4, 40, 24)
BVsi = (INFO["BX"] - 4.2, 1.9, 21, 12)
BV2 = (INFO["BX"], 2.0, 47, 14)
CV1 = (INFO["CX"], 3.4, 33, 20)
CVm = (INFO["CX"] - 3.0, 2.4, 46, 20)
CV2 = (INFO["CX"] - 1.0, 0.9, 74, 22)
DVe = (INFO["DX"] - 2.0, 1.4, 24, 28)
DV = (INFO["DX"] + 0.6, 1.0, 38, 26)
EV1 = (INFO["EX"], 14.5, 86, 8)
EV2 = (INFO["EX"], 1.2, 44, 10)
FV = (INFO["FX"], 3.4, 38, 24)
FV2 = (INFO["FX"], 2.0, 40, 20)
GV = (INFO["GX"], 0.4, 44, 12)
HV = (INFO["HX"] - 0.3, 1.2, 30, 26)
def S_(at, v, dur=30, yaw=None): return shot(at, v[0], v[1], v[2], v[3], dur, yaw)
P = {}
P["s1"] = {"shot": [S_("start-30", AV, 1, yaw=0.0)], "shift": VIS + EXP, "zoom": [{"to": "start", "at": "s2:start-12", "dur": 1}],
 "run": [run("aArcPulse", "prev+6", "s2:start", 3), run("aBoltGlow", "prev", "s2:start", 4)],
 "labels": [lab("aSiA", "矽：耐壓不夠（示意）", "Silicon: breaks down", "amber", "prev+6", "sic-4"),
            lab("aWideA", "碳化矽、氮化鎵：專扛高壓", "SiC & GaN: built for high voltage", "blue", "sic", "s2:start-4")],
 "overlay": [sec("cp-hook", "start", nxt("s1"), "中游補充篇・M3", "示意", tk("prev", "q", "sic", "gan", "hv"), cut=True)]}
P["s2"] = {"zoom": [{"to": "gap", "at": CC, "dur": 1}],
 "shot": [S_(CC, BVsi, 1)],
 "run": [run("bSiElGlow", "elec-2", "s4:start", 4), run("bSiNeedle", "low", "leak+20", 4), run("bSiLeak", "low", "s4:start", 4)],
 "labels": [lab("bSiGapA", "能隙＝門檻（1.12 eV）", "Band gap = the hurdle (1.12 eV)", "amber", "gap", "low-4"),
            lab("bSiCbA", "門檻低：電子跳上導帶＝漏電", "Low hurdle: electrons jump = leak", "blue", "low+4", "s3:start-4")],
 "overlay": [card("s2", "cp-gap", "能隙：電子要跳過的門檻", "示意，非真實能帶", tk("gap", "elec", "bar", "low", "leak"))]}
P["s3"] = {"shot": [S_(CC, BV2, 1)],
 "run": [run("bScTry", "x3", "s4:start", 4), run("bScNeedle", "dam", "s4:start", 4)],
 "labels": [lab("bScGapA", "碳化矽門檻 3.26 eV：約矽的 3 倍", "SiC hurdle 3.26 eV: ~3x silicon", "amber", "wide", "hold-4"),
            lab("bScVbA", "電子跳不過去", "Electrons can't get over", "blue", "hold-2", "s4:start-4")],
 "overlay": [card("s3", "cp-dam", "門檻高＝堤防高", "能隙 eV：教科書數值", tk("wide", "x3", "dam", "hold"))]}
P["s4"] = {"zoom": [{"to": "ev", "at": CC, "dur": 1}],
 "shot": [S_(CC, CV1, 1), S_("bat-6", CVm, 22), S_("motor-4", CV2, 24)],
 "run": [run("cDcFlow", "bat", "s5:start", 4), run("cShaftSpin", "motor", "s5:start", 10), run("cDieSw", "bat", "s5:start", 4), run("cDieHeat", "loss-4", "s5:start", 6)]
        + [run(k, "motor-4", "s5:start", 6) for k in ACT if k.startswith("cAc")],
 "labels": [lab("cDbcA", "針鰭銅底板＋銲料＋陶瓷基板", "Pin-fin Cu base + solder + DBC ceramic", "blue", "start+8", "start+54"),
            lab("cDieA", "碳化矽晶片＋鍵合線＋外殼端子", "SiC dies + bond wires + housing", "amber", "start+56", "motor+2"),
            lab("cMotA", "馬達：三相交流（來回擺）", "Motor: 3-phase AC (alternating)", "amber", "motor+4", "s5:start-4")],
 "overlay": [dict(card("s4", "cp-ev", "電動車：電池 → 模組 → 馬達", "示意（發熱不是量測）", tk("ev", "bat", "motor", "loss")), at="start+14")]}
P["s5"] = {"zoom": [{"to": "gan", "at": CC, "dur": 1}],
 "shot": [S_(CC, DVe, 1), S_("small-16", DV, 20)],
 "run": [run("dGanPulse", "fast-4", "s6:start", 4), run("dPwrFlow", "ai", "s6:start", 4)],
 "labels": [lab("dGanA", "氮化鎵晶片＋電路板走線／過孔", "GaN chip + PCB traces / vias", "amber", "fast-14", "fast+34"),
            lab("dXfA", "變壓器（開關快就能做小）", "Transformer (small thanks to fast switching)", "amber", "fast+36", "small-14"),
            lab("dGhostA", "同功率矽充電頭：變壓器大很多", "Silicon charger: much bigger transformer", "amber", "small-12", "s6:start-4")],
 "overlay": [card("s5", "cp-gan", "氮化鎵：開關快、體積小", "示意（體積比例示意）", tk("fast", "chg", "ai", "small"), h=392, y=1000)]}
P["s6"] = {"zoom": [{"to": "pvt", "at": CC, "dur": 1}],
 "shot": [S_(CC, EV1, 1), S_("frost-11", EV2, 22)],
 "run": [run("eCoilGlow", "hot-6", "s7:start", 6), run("eHotPulse", "hot", "s7:start", 6), run("ePowGlow", "hot", "s7:start", 8),
         run("eVapor", "frost+4", "s7:start", 6), run("eVapor2", "frost+4", "s7:start", 6), run("eVapor3", "frost+4", "s7:start", 6)],
 "labels": [lab("eHeadA", "上蓋法蘭＋感應線圈（銅管通水）", "Top flange + water-cooled induction coil", "blue", "start+6", "start+52"),
            lab("eQtzA", "雙層水冷石英管＋石墨氈保溫", "Water-cooled quartz + graphite felt", "amber", "start+53", "frost-12"),
            lab("eCruPA", "坩堝底最熱：粉末昇華", "Hottest at bottom: powder sublimes", "amber", "frost+2", "slow+1", xy=[430, 925]),
            lab("eSeedA", "晶種較冷：氣體凝結，晶錠往下長", "Cooler seed: vapor condenses, boule grows", "blue", "slow+3", "s7:start-4")],
 "overlay": [dict(card("s6", "cp-pvt", "碳化矽長晶：像結霜", "剖開示意（數字：媒體報導）", tk("hard", "hot", "frost", "slow"), h=392, y=1000), at="frost+30")]}
P["s7"] = {"zoom": [{"to": "epi", "at": CC, "dur": 1}],
 "shot": [S_(CC, FV, 1), S_("si", FV2, 20)],
 "run": [run("fSusSpin", "start-10", "s8:start", 10), run("fHeatGlow", "start-10", "s8:start", 6)]
        + [run(k, "si+20", "s8:start", 6) for k in ACT if k.startswith("fGas")],
 "labels": [lab("fWafA", "噴氣頭抬起：承盤上 6 片矽晶圓", "Showerhead up: 6 Si wafers on susceptor", "blue", "start+6", "si+8", xy=[595, 980]),
            lab("fShowHA", "噴氣頭：含鎵氣體＋氨氣往下噴", "Showerhead sprays Ga precursor + NH3", "amber", "si+16", "film+18", xy=[540, 360]),
            lab("fFilmA", "氮化鎵薄膜（磊晶，膜厚放大）", "GaN film (epitaxy, thickness exaggerated)", "blue", "film+20", "s8:start-4", xy=[540, 360])],
 "overlay": [card("s7", "cp-epi", "磊晶：鋪一層薄薄的晶體", "剖開示意（膜厚放大）", tk("si", "film", "epi"))]}
P["s8"] = {"zoom": [{"to": "tw", "at": CC, "dur": 1}],
 "shot": [S_(CC, GV, 1)],
 "overlay": [card("s8", "cp-tw", "台灣：基板 → 磊晶 → 元件代工", "媒體報導；截至 2026/11/28", tk("three", "gw", "epw", "hl"), h=392, y=1000)]}
P["s9"] = {"zoom": [{"to": "next", "at": CC, "dur": 1}],
 "shot": [S_(CC, HV, 1)],
 "run": [run("hPlatenSpin", "start-10", "s10:start", 10), run("hHeadSpin", "grind-4", "next-8", 10), run("hCondSpin", "start-10", "s10:start", 10), run("hCondSweep", "start-10", "s10:start", 10),
         run("hSlurry", "start", "next-14", 6), run("hSlurrySpread", "start+10", "next+10", 8), run("hFlip", "test-18", "next+46", 14), run("hGripFlip", "test-18", "next+46", 14)],
 "labels": [lab("hUsedA", "測機台用過的片子：頂起、翻面", "Used test wafer: lifted, flipped", "amber", "cost-2", "test-8"),
            lab("hHeadA", "載頭移過去吸片，送到墊上", "Carrier picks it up, moves to the pad", "blue", "test-6", "grind-6"),
            lab("hPadA", "載頭壓在墊上＋研磨液：磨掉一層", "Pad + slurry grind a layer off", "blue", "grind-4", "next-4"),
            lab("hCondA", "鑽石修整器：保持墊面粗糙", "Diamond conditioner keeps the pad rough", "amber", "next-2", "next+46"),
            lab("hShinyA", "放回翻正：露出亮面，再用", "Back face-up: shiny again, reused", "amber", "next+56", "s10:start-4")],
 "overlay": [sec("cp-next", C, "s10:start", "下一集：再生晶圓", "留言「化合物」", tk("cost", "test", "grind", "next", "kw"), cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": f"查證截至 {AS_OF}", "noteAlways": True}
levels = [lv("start", "矽／碳化矽／氮化鎵晶圓（示意）", "Si / SiC / GaN WAFERS", "30 cm", "3 cm"), lv("gap", "能隙示意台（示意）", "BAND GAP", "20 cm", "2 cm"),
          lv("ev", "電動車功率模組（示意）", "EV POWER MODULE", "50 cm", "5 cm"), lv("gan", "氮化鎵快充（示意）", "GaN CHARGER", "10 cm", "1 cm"),
          lv("pvt", "碳化矽長晶爐（剖開示意）", "SiC PVT FURNACE", "2 m", "20 cm"), lv("epi", "氮化鎵磊晶爐（剖開示意）", "GaN EPITAXY REACTOR", "1 m", "10 cm"),
          lv("tw", "台灣化合物半導體三段", "TAIWAN SUPPLY CHAIN", "100 cm", "10 cm"), lv("next", "研磨台（下一集：再生晶圓）", "NEXT: RECLAIM", "1 m", "10 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-compound", "prevEpisode": "M2：記憶體製造", "title": "化合物半導體（科技透明圈）", "asOf": AS_OF, "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "中游補充篇", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["碳化矽", "氮化鎵"], "sub": "化合物半導體：專門扛高壓", "frame": 40}, "sample": False, "scenes": scenes}
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
