"""tech-wirebond 腳本產生器：python3 videos/tech-wirebond/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
封裝打線（科技透明圈 系列 3「封裝」第 2 集；前一集 3-1：晶圓切割與薄化；下一集 3-3：封裝材料）。
念稿以 script.md 為準（逐字比對）；旁白、cue、字幕、hook、片尾卡、hud、voice 與各幕 3D 動作（shot／shift／run／labels／overlay）都在這支。
cue 來自 timeline.json（無聲估算或配音後的對齊），配音後重跑本檔即可。2D 卡：src/components/three/HudWirebond.tsx（wb-*）。構造與物理：physics-spec.md；研究：research.md。
規則：tech-andy-fixes 第 13 條（每幕 ≥4.5 秒、標籤 ≥45 幀一次一張）、第 27 條（≤260 字、關鍵畫面念完留 ≥1.2 秒）、第 28 條（≥3 個比喻）、第 29 條（爆炸分解全部做完）。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, 幕長秒, 尾端只有畫面秒數)
S = [
("s1", "hook", "晶片切好了，電怎麼接出來？前一集切晶圓，這一集看打線。",
 ["晶片切好了", "電怎麼接出來？", "前一集切晶圓", "這一集看打線"], ["The chips are cut.", "How does power get out?", "Last episode: dicing.", "This one: wire bonding."],
 [("chip", "晶片"), ("out", "接出來"), ("prev", "前一集"), ("wb", "打線")], ["電怎麼接出來", "打線"], ["示意動畫，不是量測"], 6.5, 1.3),
("s2", "mechanism", "晶片邊緣的小方塊叫焊墊，要用細線接到外面的金屬腳。",
 ["晶片邊緣的小方塊", "叫焊墊", "要用細線", "接到外面的金屬腳"], ["The small squares at the edge", "are bond pads.", "Fine wires", "connect them to the metal leads."],
 [("edge", "邊緣"), ("pad", "焊墊"), ("wire", "細線"), ("lead", "金屬腳")], ["焊墊", "金屬腳"], ["示意動畫，不是量測"], 6.0, 1.2),
("s3", "mechanism", "打線機的針叫劈刀，像縫紉機針，線從中間穿出，約頭髮三分之一粗。",
 ["打線機的針", "叫劈刀", "像縫紉機針", "線從中間穿出", "約頭髮三分之一粗"], ["The bonder's needle", "is called a capillary.", "Like a sewing needle,", "the wire comes out the middle,", "about a third of a hair thick."],
 [("bonder", "打線機"), ("cap", "劈刀"), ("sew", "縫紉機"), ("mid", "中間穿出"), ("hair", "頭髮")], ["劈刀", "縫紉機針", "頭髮"], ["K&S、ASMPT 設備文件；線徑見 research.md"], 9.0, 2.6),
("s4", "mechanism", "先放電燒線頭，像打火機燒尼龍線，縮成小圓球。",
 ["先放電燒線頭", "像打火機燒尼龍線", "縮成小圓球"], ["First a spark melts the tip,", "like a lighter on nylon thread,", "shrinking into a tiny ball."],
 [("spark", "放電"), ("lighter", "打火機"), ("ball", "小圓球")], ["放電", "小圓球"], ["K&S 技術文件；示意，不是量測"], 6.0, 1.6),
("s5", "mechanism", "劈刀把小球壓在焊墊，加熱，再用超音波來回搓。",
 ["劈刀把小球", "壓在焊墊", "加熱", "再用超音波來回搓"], ["The capillary presses the ball", "onto the pad,", "adds heat,", "and scrubs it with ultrasound."],
 [("press", "壓在焊墊"), ("heat", "加熱"), ("us", "超音波"), ("rub", "來回搓")], ["壓在焊墊", "超音波"], ["熱超音波接合文獻；示意，不是量測"], 6.2, 1.8),
("s6", "mechanism", "像兩塊黏土搓掉表面的灰，就黏成一塊，不是融化。",
 ["像兩塊黏土", "搓掉表面的灰", "就黏成一塊", "不是融化"], ["Like two lumps of clay,", "rub off the dust,", "and they become one,", "without melting."],
 [("clay", "黏土"), ("dust", "表面的灰"), ("one", "黏成一塊"), ("melt", "不是融化")], ["黏土", "不是融化"], ["熱超音波接合文獻；示意，不是量測"], 6.6, 1.8),
("s7", "mechanism", "再拉出一道弧線，壓在外面的腳，線夾一拉就斷了。",
 ["再拉出一道弧線", "壓在外面的腳", "線夾一拉", "就斷了"], ["Then it draws a loop,", "presses onto the lead,", "the clamp pulls,", "and the wire snaps."],
 [("arc", "弧線"), ("foot", "外面的腳"), ("clamp", "線夾"), ("cut", "斷了")], ["弧線", "線夾"], ["K&S 技術文件；示意，不是量測"], 7.8, 2.2),
("s8", "payoff", "一秒約打十條，又快又便宜，所以手機、汽車很多晶片還靠它。",
 ["一秒約打十條", "又快又便宜", "所以手機汽車", "很多晶片還靠它"], ["About ten wires a second,", "fast and cheap,", "so many chips in phones and cars", "still rely on it."],
 [("ten", "十條"), ("cheap", "便宜"), ("phone", "手機"), ("still", "還靠它")], ["十條", "便宜"], ["K&S、ASMPT 機型規格（每秒 8.5～17 條）"], 7.0, 1.4),
("s9", "mechanism", "線以前用金，因為金太貴，多換成銅，但銅會氧化，要吹保護氣。",
 ["線以前用金", "因為金太貴", "多換成銅", "但銅會氧化", "要吹保護氣"], ["Wires used to be gold.", "Gold is too expensive,", "so most switched to copper.", "But copper oxidizes,", "so it needs shielding gas."],
 [("gold", "用金"), ("pricey", "太貴"), ("cu", "換成銅"), ("ox", "氧化"), ("gas", "保護氣")], ["金", "銅", "保護氣"], ["日月光、安靠公司資料；銅線文獻"], 7.6, 1.4),
("s10", "payoff", "封裝廠有日月光、安靠，打線機大廠是庫力索法。",
 ["封裝廠有日月光", "安靠", "打線機大廠", "是庫力索法"], ["Packaging houses: ASE,", "Amkor.", "The big bonder maker", "is Kulicke & Soffa."],
 [("ase", "日月光"), ("amkor", "安靠"), ("maker", "打線機大廠"), ("kns", "庫力索法")], ["日月光", "安靠", "庫力索法"], ["日月光、安靠、K&S 官網；截至 11/27"], 5.6, 1.2),
("s11", "cta", "線接好了，晶片還光著。下一集看封裝材料：導線架、封裝膠、錫球。金線會被銅取代嗎？留言打線，拿完整資料。",
 ["線接好了", "晶片還光著", "下一集看封裝材料", "導線架封裝膠錫球", "金線會被銅取代嗎？", "留言打線", "拿完整資料"], ["The wires are done,", "but the chip is still bare.", "Next: packaging materials,", "lead frames, mold, solder balls.", "Will copper replace gold?", "Comment \"wire bonding\"", "for the full notes."],
 [("done", "接好了"), ("bare", "光著"), ("next", "下一集"), ("mat", "導線架"), ("q", "取代嗎"), ("kw", "留言")], ["封裝材料", "金線", "銅"], ["示意動畫，不是量測"], 9.4, 1.2),
]
SAMEPARA = set()
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, dur, tail) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？、：]", "", z)) <= 11, (sid, z)
    assert "".join(re.sub(r"[ ，。？、：]", "", z) for z in zh) == re.sub(r"[ ，。？、：]", "", nar), (sid, "字幕與念稿不一致")
    for c in cues: assert c[1] in "".join(re.sub(r"[，。？！、；：\s]", "", z) for z in zh), (sid, c)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": nar,
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": tail}
    if i < len(S) - 1: sc["pauseAfter"] = tail
    scenes.append(sc)
scenes[0]["props"]["hook"] = {"kicker": "接上集：晶片切好了", "title": "電怎麼接出來？", "size": 112, "top": 236}
scenes.append({"id": "s12", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "封裝材料", "trail": ["導線架、封裝膠、錫球"], "comment": "打線", "logoAnim": "transparent"}}})

# ═════════ 工具 ═════════
FAR = "s12:start+400"
def run(i, at, until=None, ramp=6, **kw):
    d = {"id": i, "at": at, "ramp": ramp}
    if until: d["until"] = until
    d.update(kw); return d
def lab(part, text, en, color, at, until, xy=None, **kw):
    d = {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until}
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
def off(tok, n):
    """cue 字串加減幀：'s5:press' + 3 → 's5:press+3'"""
    m = re.match(r"^(.*?)([+-]\d+)?$", tok); base, o = m.group(1), int(m.group(2) or 0) + n
    return f"{base}{o:+d}" if o else base

LAYERS = [l["id"] for l in MODEL["layers"] if l["id"] != "floorAll"]
VIS = []
T0 = "s1:start-40"
USED = set()
def vis(lay, wins, dur=1):
    """依「可見區間」清單產生隱藏：區間之外全藏。區間 (a, b[, 淡入幀])；a＝T0 一開始就看得到；b＝FAR 看到片尾"""
    assert lay in LAYERS, lay
    USED.add(lay)
    prev = T0
    for w in wins:
        a, b = w[0], w[1]; d = w[2] if len(w) > 2 else dur
        if a != T0: VIS.append(hid(lay, prev, a, d))
        prev = b
    if prev != FAR: VIS.append(hid(lay, prev, FAR, dur))

# ── 各站可見區間 ──
A_ALL = [(T0, "s3:start-1"), ("s8:start-1", "s9:start-1"), ("s11:start-1", FAR)]
for l in ["lfA", "dieA"]: vis(l, A_ALL)
vis("padGlowA", [("s1:out-4", "s2:lead-6"), ("s2:pad-6", "s2:wire")])
vis("leadGlowA", [("s2:lead-6", "s3:start-1")])
WG = 14
for g in range(WG): vis(f"wA{g}", [(f"s8:start+{4 + 3 * g}", "s9:start-1"), ("s11:start-1", FAR)])
for l in ["bdBase", "bdDeck", "bdHood", "bdXY", "bdHead", "bdSpool", "bdClamp", "bdHorn", "bdCap", "bdEfo", "bdCam", "bdLf"]: vis(l, [("s3:start-1", "s4:start-1"), ("s10:start-1", "s11:start-1")])
C_ALL = [("s4:start-1", "s6:start-1"), ("s7:start-1", "s8:start-1")]
for l in ["cHeat", "cDie", "cDieBg", "cLead", "cLeadBg", "cEfo", "cCap", "cCapUp", "cJawLl", "cJawRl"]: vis(l, C_ALL)
# 線尾：燒球前在；第二焊點拉斷後又在（下一顆球之前）
vis("cTail", [("s4:start-1", "s4:spark+6"), ("s7:cut", "s7:cut+40")])
vis("cBall", [("s4:spark+6", "s5:press")] + [("s7:cut+40", "s8:start-1")])
vis("cSpark", [("s4:spark-2", "s4:spark+10"), ("s7:cut+32", "s7:cut+42")])
vis("cBallB", [("s5:press", "s6:start-1"), ("s7:start-1", "s8:start-1")])
vis("cUS", [("s5:us-4", "s5:rub+30"), ("s7:foot-2", "s7:foot+16")]); vis("cGlow", [("s5:heat-2", "s6:start-1"), ("s7:start-1", "s7:arc")])
vis("cStitch", [("s7:foot", "s8:start-1")]); vis("cTail2", [])
LOOP = INFO["LOOP"]; NL = len(LOOP) - 1
STEP = 5; L0 = "s7:arc-18"
for i in range(NL): vis(f"cW{i}", [(off(L0, STEP * i + STEP - 1), "s8:start-1")])
D_ALL = [("s6:start-1", "s7:start-1")]
for l in ["dSi", "dPad", "dBall", "dNeckL", "dHeat", "dArrow"]: vis(l, D_ALL)
vis("dOx", [("s6:start-1", "s6:dust+30")], 1); VIS.append(hid("dOx", "s6:dust-6", "s7:start-1", 30, 0))
vis("dImc", [("s6:dust+10", "s7:start-1")], 14)
E_ALL = [("s9:start-1", "s10:start-1")]
for l in ["eBase", "eAu", "eCu", "eSpool", "eUp"]: vis(l, E_ALL)
vis("eGas", [("s9:gas-6", "s10:start-1")], 8); vis("eCuOx", [("s9:ox-4", "s9:gas+6")], 4); vis("eCrack", [])
vis("moldA", [("s11:next-6", FAR)]); vis("ballsA", [("s11:mat+10", FAR)])

# ── 劈刀組的動作（cCap＋球＋線尾＋夾爪一起走；位移是累加的）──
MOVL = ["cCap", "cCapUp", "cBall", "cTail", "cJawLl", "cJawRl"]
def MOVE(at, dur, dx=0.0, dy=0.0, dz=0.0):
    return [mv(l, at, FAR, dur, dx=round(dx, 3), dy=round(dy, 3), dz=round(dz, 3)) for l in MOVL]
TIPOFF = 0.15                                       # 尖端在線上方一點
HOVY, PADY, CX, LEADX, LEADY = INFO["HOVY"], INFO["PADY"], INFO["CX"], INFO["LEADX"], INFO["LEADY"]
CAPM = []
dy1 = (PADY + 0.45) - HOVY
CAPM += MOVE("s5:press-14", 14, dy=dy1)                                      # 下壓到焊墊
cur = [CX, PADY + 0.45]
for i in range(1, NL + 1):                                                    # 沿線弧走（線從劈刀拉出）
    nx_, ny_ = LOOP[i][0], LOOP[i][1] + TIPOFF + (0.1 if i == NL else 0)
    CAPM += MOVE(off(L0, STEP * (i - 1)), STEP + 1, dx=nx_ - cur[0], dy=ny_ - cur[1]); cur = [nx_, ny_]
CAPM += [mv("cJawLl", "s7:clamp-4", FAR, 6, dx=0.2), mv("cJawRl", "s7:clamp-4", FAR, 6, dx=-0.2)]     # 線夾夾住
CAPM += MOVE("s7:cut-4", 8, dy=2.6)                                           # 夾著往上拉 → 線斷，線尾留在劈刀下
CAPM += [mv("cJawLl", "s7:cut+6", FAR, 6, dx=-0.2), mv("cJawRl", "s7:cut+6", FAR, 6, dx=0.2)]       # 線夾放開
cur[1] += 2.6
CAPM += MOVE("s7:cut+10", 18, dx=CX - cur[0], dy=HOVY - cur[1], dz=-3.2)     # 回到下一個焊墊正上方，準備燒下一顆球

# 爆炸分解（s3：打線機焊頭）：①護罩淡出 ②線軸上移 ③換能器＋劈刀往前抽出 ④線夾往左 ⑤打火棒往右 ⑥相機往上；講完組回
B3 = "s3:hair+40"
EXPL = [hid("bdHood", "s3:bonder+6", B3, 12, 0.12),
        mv("bdSpool", "s3:cap-6", B3, 20, dy=1.6), mv("bdHorn", "s3:cap+4", B3, 22, dz=2.2), mv("bdCap", "s3:cap+4", B3, 22, dz=2.2),
        mv("bdClamp", "s3:sew+2", B3, 20, dx=-1.4), mv("bdEfo", "s3:mid-4", B3, 20, dx=1.6), mv("bdCam", "s3:mid+6", B3, 20, dy=1.4, dx=0.6)]
P = {}
X0, X1, X2, X3, X5 = INFO["X0"], INFO["X1"], INFO["X2"], INFO["X3"], INFO["X5"]
DKY = INFO["DK"]
# ─── s1：晶片切好了，電怎麼接出來？ ───
P["s1"] = {"shot": [shot("start-30", X0, -4.0, 62, 42, 1, yaw=0.0), shot("start", X0, -4.0, 56, 40, 150), shot("out", X0 + 1.0, -3.0, 46, 46, 60)],
 "shift": VIS + CAPM + EXPL,
 "run": [run("padPulseA", "out-4", "s2:wire", 6)],
 "overlay": [sec("wb-hook", "start+24", "s2:start-8", "系列 3・第 2 集", "示意", {"prev": "prev", "chip": "chip", "out": "out", "wb": "wb"})]}
# ─── s2：焊墊與金屬腳 ───
P["s2"] = {"shot": [shot("start-1", X0 + 2.0, -2.5, 36, 52, 1), shot("lead-14", X0 + 3.0, -3.0, 40, 48, 30)],
 "run": [run("padPulseA", "start", "wire", 6), run("leadPulseA", "lead-6", "s3:start-2", 6)],
 "labels": [lab("padA", "焊墊", "Bond pad", "amber", "pad-6", "pad+39"), lab("leadA", "金屬腳（引腳）", "Lead", "blue", "pad+40", "pad+85")],
 "overlay": [sec("wb-path", "start+20", "s3:start-8", "要接起來的兩端", "示意", {"pad": "pad", "wire": "wire", "lead": "lead"})]}
# ─── s3：打線機＋焊頭爆炸分解 ───
P["s3"] = {"shot": [shot("start-1", X1, 6.0, 52, 18, 1, yaw=0.0), shot("cap-20", X1 + 0.3, DKY + 2.4, 26, 14, 26), shot("cap+200", X1, 6.0, 46, 18, 22)],
 "run": [run("bdHeat", "start", "s4:start-2", 6), run("bdSpin", "start+10", "cap-8", 8)],
 "labels": [lab("bonder", "打線機", "Wire bonder", "amber", "start+6", "start+51"), lab("capB", "劈刀（陶瓷細針）", "Capillary", "amber", "cap+6", "cap+51"),
            lab("clamp", "線夾", "Wire clamp", "blue", "cap+52", "cap+97"), lab("efo", "打火棒", "EFO wand", "blue", "cap+98", "cap+143"), lab("spool", "線軸（金線）", "Wire spool", "amber", "cap+148", "cap+193")],
 "overlay": [sec("wb-needle", "start+24", "s4:start-8", "像縫紉機針，但不是刺穿", "示意（線徑見 research.md）", {"cap": "cap", "sew": "sew", "mid": "mid", "hair": "hair"})]}
# ─── s4：放電燒線頭 → 小圓球 ───
P["s4"] = {"shot": [shot("start-1", X2 + 1.0, 6.5, 32, 8, 1, yaw=0.0), shot("spark-10", X2 - 0.5, 7.6, 36, 8, 24)],
 "run": [run("cArcFlash", "spark-2", "spark+10", 2)],
 "labels": [lab("cEfoA", "打火棒放電", "EFO spark", "blue", "spark-8", "spark+37"), lab("cFabA", "小圓球", "Free air ball", "amber", "spark+38", "spark+83")],
 "overlay": [sec("wb-steps", "start+20", "s6:start-8", "打一條線的步驟", "示意", {"s1": "spark", "s2": "s5:press", "s3": "s7:arc", "s4": "s7:foot", "s5": "s7:cut"})]}
# ─── s5：壓在焊墊、加熱、超音波 ───
P["s5"] = {"shot": [shot("start-1", X2 - 0.5, 7.0, 26, 8, 1), shot("press-16", X2 - 1.0, 5.4, 22, 10, 16)],
 "run": [run("cHeatOn", "heat-4", "s6:start-2", 6), run("cBondHot", "heat", "s6:start-2", 6), run("cUSvib", "us", "rub+30", 4), run("cUSring", "us", "rub+30", 4)],
 "labels": [lab("cBallA", "第一焊點（壓扁的球）", "First bond (ball)", "amber", "press+4", "press+49"), lab("cCapA", "超音波來回搓", "Ultrasonic scrub", "blue", "us-2", "us+43")]}
# ─── s6：焊點剖面：搓掉氧化膜、原子擠進去 ───
P["s6"] = {"shot": [shot("start-1", X3, 6.0, 44, 14, 1, yaw=0.0), shot("dust-10", X3, 6.0, 36, 16, 30)],
 "run": [run("dScrub", "start", "one+10", 4), run("dOxBreak", "dust-10", "one", 6), run("dOxBreakR", "dust-10", "one", 6), run("dAuDown", "one-6", "s7:start-2", 8), run("dAlUp", "one-6", "s7:start-2", 8),
         run("dHeatOn", "start", "s7:start-2", 6), run("dImcGlow", "one", "s7:start-2", 8)],
 "labels": [lab("dOxA", "表面那層灰（氧化膜）", "Oxide film", "blue", "clay+2", "clay+47"), lab("dImcA", "接合層：原子擠在一起", "Bond layer", "amber", "one-2", "one+43")],
 "overlay": [sec("wb-clay", "start+20", "s7:start-8", "像搓黏土，不是焊錫", "示意（溫度約一百多度）", {"clay": "clay", "dust": "dust", "one": "one", "melt": "melt"})]}
# ─── s7：拉弧線 → 第二焊點 → 線夾拉斷 ───
P["s7"] = {"shot": [shot("start-1", X2 + 3.5, 2.5, 40, 10, 1, yaw=0.0), shot("cut+12", X2 + 1.5, 5.5, 46, 10, 30)],
 "run": [run("cUSvib", "foot-2", "foot+16", 4), run("cUSring", "foot-2", "foot+16", 4), run("cHeatOn", "start", "s8:start-2", 6), run("cArcFlash", "cut+32", "cut+42", 2)],
 "labels": [lab("cLoopA", "線弧", "Wire loop", "amber", "arc-2", "arc+43"), lab("cStitchA", "第二焊點（魚尾形）", "Second bond (stitch)", "amber", "arc+48", "arc+93"),
            lab("cClampA", "線夾拉斷", "Clamp snaps wire", "blue", "arc+98", "arc+143", xy=[330, 980])],
 "overlay": [sec("wb-steps", "start+16", "s8:start-8", "打一條線的步驟", "示意", {"s1": "s4:spark", "s2": "s5:press", "s3": "arc", "s4": "foot", "s5": "cut"})]}
# ─── s8：一秒約十條，整顆晶片打完 ───
P["s8"] = {"shot": [shot("start-1", X0, -3.5, 48, 44, 1, yaw=0.0), shot("cheap", X0, -4.0, 56, 40, 60)],
 "run": [run("currentA", "phone", "s9:start-2", 8)],
 "labels": [lab("wireA", "金線（一條一條打）", "Gold wires", "amber", "ten+4", "ten+49")],
 "overlay": [sec("wb-speed", "start+20", "s9:start-8", "又快又便宜", "K&S、ASMPT 機型規格（示意）", {"ten": "ten", "cheap": "cheap", "phone": "phone", "still": "still"})]}
# ─── s9：金線 → 銅線，保護氣 ───
P["s9"] = {"shot": [shot("start-1", X5, 9.0, 90, 10, 1, yaw=0.0), shot("cu-6", X5 + 5.0, 7.0, 60, 10, 30)],
 "run": [run("eGasFlow", "gas-4", "s10:start-2", 8)],
 "labels": [lab("eAuA", "金線", "Gold wire", "amber", "gold-2", "gold+43"), lab("eCuA", "銅線", "Copper wire", "amber", "cu-2", "cu+43"), lab("eGasA", "保護氣（氮氫混合）", "Shielding gas", "blue", "gas-2", "gas+43")],
 "overlay": [sec("wb-cu", "start+20", "s10:start-8", "金線換銅線", "日月光、安靠公司資料（示意，不標價格）", {"gold": "gold", "pricey": "pricey", "cu": "cu", "ox": "ox", "gas": "gas"})]}
# ─── s10：公司 ───
P["s10"] = {"shot": [shot("start-1", X1, 6.0, 50, 16, 1, yaw=0.0)],
 "run": [run("bdHeat", "start", "s11:start-2", 6), run("bdBob", "start", "s11:start-2", 6)],
 "overlay": [sec("wb-co", "start-4", "s11:start-14", "打線產業", "日月光、安靠、K&S 官網；截至 11/27", {"ase": "ase", "amkor": "amkor", "maker": "maker", "kns": "kns"}, h=392, y=1000)]}
# ─── s11：預告封裝材料 ───
P["s11"] = {"shot": [shot("start-1", X0 + 2.0, -4.0, 58, 40, 1, yaw=0.0), shot("next-6", X0 + 3.0, -4.0, 66, 38, 40)],
 "shift": [mv("moldA", T0, "s11:next+4", 20, dy=2.5)],
 "overlay": [sec("wb-next", "start+20", "s12:start-8", "接下來", "下一集：封裝材料", {"done": "done", "bare": "bare", "next": "next", "mat": "mat", "q": "q", "kw": "kw"})]}
ZOOMS = {'s2': 'pkg', 's3': 'tool', 's4': 'cap', 's6': 'micro', 's7': 'cap', 's8': 'pkg', 's9': 'cu', 's10': 'co', 's11': 'pkg'}
for sid, lvz in ZOOMS.items(): P[sid]["zoom"] = [{"to": lvz, "at": "start-10", "dur": 1}]
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])
missing = [l for l in LAYERS if l not in USED and l != "floorAll"]

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("pkg", "導線架上的晶片（示意）", "LEAD FRAME + DIE", "20 mm", "1 mm"), lv("tool", "打線機（示意）", "WIRE BONDER", "1.5 m", "10 cm"),
          lv("cap", "劈刀特寫（示意）", "CAPILLARY CLOSE-UP", "300 µm", "25 µm"), lv("micro", "焊點剖面（示意）", "BALL BOND SECTION", "50 µm", "5 µm"),
          lv("cu", "金線與銅線（示意）", "GOLD VS COPPER", "300 µm", "25 µm"), lv("co", "打線產業", "WIRE BONDING INDUSTRY", "1.5 m", "10 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-wirebond", "prevEpisode": "3-1：晶圓切割與薄化", "title": "封裝打線（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "封裝", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b",
                 "_說明": "旁白金手指：照 tech-andy-fixes 第 34 條；Andy 在 AI Studio 錄音後上傳，用 recording-timeline 接時間軸；本支尚未配音"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["打線", "電怎麼接出來？"], "sub": "封裝第一步", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
for s in scenes:
    t = s.get("tts") or ""
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if "量測" in t or "矽" in t: bad.append((s["id"], "量測／矽"))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
md = open(os.path.join(HERE, "script.md"), encoding="utf8").read().split("## 可直接貼 AI Studio 的念稿")[1].split("## 字幕與念稿差異")[0]
md_paras = [p.strip() for p in md.split("\n") if p.strip() and not p.startswith("（")]
mine = [s["tts"] for s in scenes if s.get("tts")]
if md_paras != mine: bad.append(("念稿與 script.md 不一致", [m for m in mine if m not in md_paras]))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes], "未使用的層", missing)
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(mine))
