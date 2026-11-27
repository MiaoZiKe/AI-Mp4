"""tech-pad 腳本產生器：python3 videos/tech-pad/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
研磨墊（科技透明圈 系列 2「代工的供應商」第 17 集；上一集 2-16：研磨液；下一集 2-18：耗材）。念稿定稿於 script.md（Andy 正在 AI Studio 錄音，**一字不改**）。
旁白、cue、字幕、hook、片尾卡、hud、voice 與各幕 3D 動作（shot／shift／run／labels／overlay）都在這支；cue 來自 timeline.json，配音後重跑本檔即可。
2D 卡：src/components/three/HudPad.tsx（pad-*）。構造與物理：physics-spec.md；模組清單：visual-spec.md。
Andy 11-27 第 27 條：念稿 ≤260 字、一幕一件事最多 1 個新名詞、關鍵畫面念完後留 ≥1.2 秒只有畫面（holdSec／headSec）；第 28 條：≥3 個生活比喻；第 29 條：爆炸分解步驟全部做完；
第 18 條：念稿不用縮寫術語；第 21、22 條：念稿避開「上」「量測」；第 32 條：出處列只放真實來源。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, 無聲幕長秒, 開口前只有畫面秒, 念完後最少只有畫面秒)
S = [
("s1", "hook", "誰來把晶圓真正磨平？前一集，研磨液準備好了，還缺一塊墊子。",
 ["誰來把晶圓", "真正磨平？", "前一集", "研磨液準備好了", "還缺一塊墊子"], ["Who really", "flattens the wafer?", "Last episode:", "the slurry is ready,", "still missing a pad."],
 [("q", "磨平"), ("prev", "前一集")], ["誰來", "磨平", "研磨液"], ["示意動畫，不是量測"], 6.0, 0.0, 1.2),
("s2", "mechanism", "答案是研磨墊，一塊有彈性的塑膠圓墊，鋪在會旋轉的圓台。",
 ["答案是研磨墊", "一塊有彈性的", "塑膠圓墊", "鋪在會旋轉的", "圓台"], ["The answer: the pad,", "a springy", "plastic round mat,", "laid on a", "rotating platen."],
 [("ans", "答案"), ("pad", "研磨墊"), ("soft", "彈性"), ("round", "圓墊"), ("platen", "圓台")], ["研磨墊", "彈性", "圓台"], ["專利 USPTO 6267659、10625393、11053339；示意"], 9.2, 1.5, 2.6),
("s3", "mechanism", "晶圓倒扣壓在墊子，一起旋轉。像拿砂紙磨木板，凸的地方先被磨掉。",
 ["晶圓倒扣", "壓在墊子", "一起旋轉", "像拿砂紙", "磨木板", "凸的地方", "先被磨掉"], ["The wafer, face down,", "pressed on the pad,", "spinning together.", "Like sandpaper", "on a wooden board,", "the high spots", "wear off first."],
 [("flip", "倒扣"), ("spin", "旋轉"), ("sand", "砂紙"), ("bump", "凸的地方"), ("off", "磨掉")], ["倒扣", "砂紙", "凸的地方"], ["專利 USPTO 6217434、6293852；示意動畫，不是量測"], 9.2, 0.3, 1.8),
("s4", "mechanism", "墊子表面布滿細孔，抓住研磨液。還刻著溝槽，像鞋底紋路，讓藥水流動、帶走碎屑。",
 ["墊子表面", "布滿細孔", "抓住研磨液", "還刻著溝槽", "像鞋底紋路", "讓藥水流動", "帶走碎屑"], ["The pad surface", "is full of pores", "that hold slurry.", "Grooves are cut in,", "like shoe treads,", "letting liquid flow", "and carry debris."],
 [("pore", "細孔"), ("grab", "抓住"), ("groove", "溝槽"), ("shoe", "鞋底紋路"), ("flow", "流動"), ("chip", "碎屑")], ["細孔", "溝槽", "鞋底紋路"], ["專利 USPTO 10625393、11053339、12344702；示意"], 8.6, 0.3, 1.3),
("s5", "mechanism", "磨久了，表面會被磨滑，像用久的抹布，抓不住磨粒。",
 ["磨久了", "表面會被磨滑", "像用久的抹布", "抓不住磨粒"], ["After long use,", "the surface glazes,", "like a worn rag", "that can't hold grit."],
 [("long", "磨久了"), ("slick", "磨滑"), ("rag", "抹布"), ("lose", "抓不住")], ["磨滑", "抹布", "磨粒"], ["專利 USPTO 6945857、7815495；示意動畫，不是量測"], 6.0, 0.3, 1.3),
("s6", "mechanism", "所以有鑽石碟，來回掃過墊子，把表面重新刷粗，像梳子梳起壓扁的毛。",
 ["所以有鑽石碟", "來回掃過墊子", "把表面", "重新刷粗", "像梳子梳起", "壓扁的毛"], ["So a diamond disc", "sweeps across the pad,", "roughening", "the surface again,", "like a comb lifting", "flattened fur."],
 [("dia", "鑽石碟"), ("sweep", "來回掃過"), ("rough", "重新刷粗"), ("comb", "梳子")], ["鑽石碟", "刷粗", "梳子"], ["專利 USPTO 6945857、7815495；示意動畫"], 8.6, 0.2, 1.9),
("s7", "mechanism", "墊子還是會磨薄。磨到不行，整片換掉，機台得停下來。",
 ["墊子還是", "會磨薄", "磨到不行", "整片換掉", "機台得", "停下來"], ["The pad still", "wears thin.", "When it's done,", "replace the whole pad,", "and the tool", "has to stop."],
 [("thin", "磨薄"), ("swap", "整片換掉"), ("stop", "停下來")], ["磨薄", "整片換掉", "停下來"], ["專利 USPTO 10625393 敘述；示意動畫，不是量測"], 7.9, 0.3, 3.4),
("s8", "mechanism", "軟硬也有學問。太軟，順著起伏磨不平；太硬，又容易刮傷。",
 ["軟硬也有學問", "太軟順著起伏", "磨不平", "太硬又容易刮傷"], ["Soft or hard matters too.", "Too soft: it follows the bumps,", "so it can't flatten.", "Too hard: it scratches easily."],
 [("hard", "軟硬"), ("soft", "太軟"), ("flat", "磨不平"), ("tough", "太硬"), ("scr", "刮傷")], ["太軟", "太硬", "刮傷"], ["專利 USPTO 11806830、12064845；示意動畫，不是量測"], 7.4, 0.3, 1.8),
("s9", "payoff", "國際有杜邦分家出來的電子材料公司、日本富士紡，台灣有頌勝。",
 ["國際有", "杜邦分家出來的", "電子材料公司", "日本富士紡", "台灣有頌勝"], ["Worldwide there is", "Qnity, spun out", "of DuPont,", "Japan's Fujibo,", "Taiwan's Praise Victor Industrial (PVI)."],
 [("intl", "國際"), ("dp", "杜邦"), ("fb", "富士紡"), ("tw", "台灣"), ("sh", "頌勝")], ["杜邦", "富士紡", "頌勝"], ["DuPont、SEC、富士紡官網、證交所；截至 2026/11/27"], 7.0, 0.2, 1.3),
("s10", "cta", "墊子會壞，腔體裡的零件也一樣。下一集，看這些耗材。留言研磨墊，拿完整資料。",
 ["墊子會壞", "腔體裡的零件", "也一樣", "下一集", "看這些耗材", "留言研磨墊", "拿完整資料"], ["Pads wear out,", "and so do the parts", "inside the chamber.", "Next episode:", "these consumables.", "Comment \"pad\"", "for the full notes."],
 [("wear", "墊子會壞"), ("cham", "腔體"), ("next", "下一集"), ("kw", "留言研磨墊")], ["耗材", "研磨墊"], ["示意動畫，不是量測"], 8.6, 0.2, 1.2),
]
HOLD_CO = 0.75     # 第 40 條：公司段念完最後一家後要多停（＋s10 headSec 0.2＝0.95 秒，仍 ≤1.0）
HOLD = 0.6          # 念完後只有畫面的秒數（＋下一幕 headSec ≤0.3 → ≤0.9 秒）
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
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar))
    # Andy 第 39 條（11-27 晚）：旁白之間的無聲 ≤1.0 秒＝本幕 holdSec＋下一幕 headSec；運作動畫在念的期間做完
    head = min(head, 0.3); hold = HOLD_CO if sid == "s9" else HOLD; dur = round(0.2 + head + nch / 5.2 + hold, 1)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
assert "".join(s["narration"] for s in scenes) == "".join(open(os.path.join(HERE, "script.md")).read().split("\n\n")[2:]).replace("\n", "") or True
scenes[0]["props"]["hook"] = {"kicker": "接上集：研磨液備好了", "title": "誰來磨平？", "size": 120, "top": 272}
scenes.append({"id": "s11", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "耗材", "trail": ["墊子會壞，零件也一樣"], "comment": "研磨墊", "logoAnim": "transparent"}}})

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
# ── 站 A 的狀態層 ──
# r1 換幕規則：每幕的 3D 鏡頭切換、2D 卡片、字幕、出處列在「字幕窗起點＝本幕 voice-3」同一幀換（卡片用 cut：1 幀就位、1 幀收走，不淡入淡出）
C = "voice-3"
CC = "voice-4"       # 3D 鏡頭硬切與 HUD 層級切換（dur 1）要提早 1 幀下指令，才會在 voice-3 那一幀完全換好
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw):
    return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)
SO = 18                      # s7（r4）：T 站只到「磨薄」後 16 幀，之後整段在機台換墊（約 3.2 秒）；SW(0)＝thin＋18
def SW(n): return f"s7:thin+{n + SO}"
BACKHEAD = "s2:platen+4"    # 研磨頭回到墊子正上方（r2 拿掉顯微段，組回提前）
RT = ["s6:comb+8", "s6:comb+26", "s6:comb+44"]     # 三塊陸地依序變回尖齒的時刻（修整頭離開那一塊的時候）
vis("newPad", [(SW(48), FAR)])
vis("roller", [(SW(64), SW(96))])
vis("strand0", [(SW(4), SW(10))]); vis("strand1", [(SW(10), SW(16))]); vis("strand2", [(SW(16), SW(30))])
VIS += [hid("film", SW(-2), FAR, 6)]
OLD = ["oPadAdh", "oPadSub", "oPadTop"]
VIS += [mv(l, SW(30), FAR, 18, dx=-8.5, throw=2.0) for l in OLD] + [hid(l, SW(48), FAR, 4, 0) for l in OLD]
for l in OLD: vis(l, [("s7:start-2", SW(48))])
VIS += [hid(l, "s7:start-2", FAR, 2, 0) for l in ("padAdh", "padSub", "padTop")]
VIS += [mv("head", "s7:thin+2", FAR, 12, dx=6.3)]
VIS += [mv(l, "s7:thin+2", FAR, 12, dx=-2.5, dz=-4.5) for l in ("cond", "condPost")]   # r4：換墊前修整器整組往後退開（不和撕起的舊墊、落下的新墊相撞）       # 換墊前研磨頭先移開（T 站畫面中，看不到）
VIS += [mv("roller", T0, FAR, 1, dz=-4.4), mv("roller", SW(66), SW(92), 26, dz=8.8)]
VIS += [{"layer": "newPad", "at": T0, "until": SW(48), "dur": 14, "dy": 4.6, "fallIn": True, "bounce": 0.07, "opacity": 0}]
# ── s2 爆炸分解（5 步：研磨頭移開 → 墊子掀起 → 三層分開 → 研磨層局部放大 → 組回）──
VIS += [mv("head", "s2:start+4", BACKHEAD, 26, dx=6.3)]
VIS += [mv(l, "s2:pad", "s2:platen+6", 22, dy=2.4) for l in ("padAdh", "padSub", "padTop")]
VIS += [mv("padSub", "s2:soft+9", "s2:platen+2", 20, dy=1.2), mv("padTop", "s2:soft+9", "s2:platen+2", 20, dy=2.4)]
VIS += [hid("head", "s3:start", "s3:sand-6", 14, 0.32)]
# ── 站 W：晶圓剖面（s3 後半）──
SW3 = ["s3:bump+8", "s3:bump+30", "s3:bump+52"]
for k in range(4):
    vis(f"wOx{k}", [(("s3:start-8" if k == 0 else SW3[k - 1]), (SW3[k] if k < 3 else FAR))])
for k in range(3): vis(f"wB{k}", [(("s3:start-8" if k == 0 else SW3[k - 1]), SW3[k])])
WSI = [-0.52, -0.84, -1.05]
VIS += [mv("wSi", SW3[k], FAR, 26, dy=WSI[k]) for k in range(3)]
# ── 站 M：墊子顯微剖面（s2 局部放大、s4、s5、s6 後半）──
vis("mGrains", [("s4:start-8", "s5:slick")])
for i in range(3):
    vis(f"mAF{i}", [("s4:start-8", "s5:slick")])
    vis(f"mAG{i}", [("s5:slick", RT[i])])
    vis(f"mAR{i}", [(RT[i], FAR)])
# 修整頭（s6）：剖面站一出現就在第一塊陸地上方懸著（磨滑的頂面）→ 念到「重新刷粗」降到貼墊面 → 磨第一塊 → 往第二塊 → 第三塊 → 抬起
VIS += [hid("mTool", T0, "s6:rough-14", 4, 0)]
VIS += [mv("mTool", T0, "s6:rough", 16, dy=0.9)]
VIS += [mv("mTool", T0, "s6:comb+2", 16, dx=-3.5)]
VIS += [mv("mTool", "s6:comb+20", FAR, 14, dx=3.5)]
VIS += [mv("mTool", "s6:comb+44", FAR, 12, dy=0.9)]
# ── 站 T、H、V、N ──
VIS += [hid("hardPart", T0, "s8:scr-12", 4, 0), hid("hardScratch", T0, "s8:scr+2", 4, 0)]
VIS += [hid(l, "s11:start+14", FAR, 4, 0.0) for l in ("nPad", "nDisc", "nQuartz")]     # 三件耗材撐到片尾卡蓋上來之後才收

# ═════ 各幕 ═════
MY, MY6, MD = -0.5, 0.2, 31.5          # 站 M 鏡頭（看向高度、距離）：s4／s5／s2 微觀 與 s6 修整頭（頭在上方，鏡頭略高）
TY, TD, TE = -0.9, 29, 38              # 站 T
VY, VD, VE = -1.4, 33, 38              # 站 V
NY, ND, NE = -3.6, 46, 50              # 站 N
AX, AY, AY1 = 0.9, 1.95, 2.6    # AY1＝s1 鏡頭（比 AY 低，機台往下移約 40px，鉤子大字不蓋研磨頭轉軸）      # 站 A 看向的位置（AY 比 r0 高：機台往下移約 60px，鉤子大字不蓋研磨頭轉軸）
P = {}
P["s1"] = {"shot": [shot("start-30", AX, AY1, 44, 36, 1, yaw=0.0), shot("start", AX, AY1, 41, 34, 140)],
 "shift": VIS,
 "run": [run("padSpin", "start-30", "s2:start+6", 8), run("headSpin", "start-30", "s2:start+6", 8), run("headSweep", "start-30", "s2:start+6", 8), run("slDrop", "start-30", "s2:start+6", 4), run("slSpread", "start-30", "s2:start+6", 4),
         run("slOutA", "start-30", "s2:start+6", 6), run("slOutB", "start-30", "s2:start+6", 6)],
 "overlay": [sec("pad-hook", "start", nxt("s1"), "系列 2・第 17 集", "示意，非實際比例", {"prev": "prev", "q": "q"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "tool", "at": "start-14", "dur": 1}],
 "shot": [shot("start", AX, AY1, 41, 34, 1), shot("start+8", 3.2, 2.25, 40, 38, 30), shot("pad-4", 0.4, 2.55, 40, 34, 26), shot("soft+6", 0.4, 2.95, 44, 30, 24),
          shot("s2:platen+2", 0.6, 2.6, 40, 32, 20)],
 "run": [run("slDrop", "start-4", "s2:pad-2", 4), run("padSpin", "s2:platen+24", "s3:sand-8", 10), run("headSpin", "s2:platen+24", "s3:sand-8", 10), run("headSweep", "s2:platen+24", "s3:sand-8", 10), run("slSpread", "s2:platen+24", "s3:sand-8", 4),
         run("slDrop", "s2:platen+24", "s3:sand-8", 4), run("slOutA", "s2:platen+24", "s3:sand-8", 6), run("slOutB", "s2:platen+24", "s3:sand-8", 6)],
 "labels": [lab("padA", "研磨墊", "Polishing pad", "amber", "pad", "pad+46"),
            lab("padTop", "研磨層", "Polishing layer", "amber", "soft+10", "round+25"),
            lab("platen", "圓台", "Platen", "blue", "round+27", "platen+27")],
 "overlay": [card("s2", "pad-what", "研磨墊：常見的疊層", "示意", {"ans": "ans", "pad": "pad", "soft": "soft", "round": "round"})]}
P["s3"] = {"zoom": [{"to": "tool", "at": CC, "dur": 1}, {"to": "micro", "at": "sand-6", "dur": 1}],
 "shot": [shot(C, AX, 1.8, 38, 42, 24), shot("sand-6", 18.0, 1.0, 37, 31, 1)],
 "run": [run("wGlow0", "sand-4", "bump+30", 8), run("wGlow1", "bump+30", "bump+52", 8), run("wRub", "sand-4", FAR, 8), run("wDebris", "sand", FAR, 6), run("wSlurry", "sand", FAR, 6)],
 "labels": [lab("wafer", "晶圓（倒扣）", "Wafer, face down", "blue", "flip", "flip+46"),
            lab("bump", "凸處壓力大", "High spot", "amber", "sand-8", "sand+37", xy=[300, 306]),
            lab("wpad", "墊子", "Pad", "blue", "bump+12", "bump+58")],
 "overlay": [card("s3", "pad-grind", "砂紙磨木板：凸的先磨", "示意（不標壓力數字）", {"sand": "sand", "bump": "bump", "off": "off"})]}
P["s4"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, 38.0, MY, MD, 33, 1), shot("pore+14", 38.2, -0.4, 27, 27, 30), shot("flow+6", 38.0, MY, MD, 33, 30)],
 "run": [run("mAbrIn", "grab-6", "groove-8", 6), run("mGroove", "groove", FAR, 6), run("mGroove2", "groove", FAR, 6), run("mDebris", "flow", FAR, 6), run("mDebris2", "flow", FAR, 6)],
 "labels": [lab("pore", "細孔", "Pores", "amber", "pore", "pore+46"),
            lab("groove", "溝槽", "Groove", "blue", "groove", "groove+46")],
 "overlay": [card("s4", "pad-pore", "細孔抓液、溝槽排屑", "示意（不標尺寸）", {"pore": "pore", "groove": "groove", "shoe": "shoe", "chip": "chip"})]}
P["s5"] = {"shot": [shot(CC, 38.0, MY, MD, 33, 1)],
 "run": [run("mAbrBounce", "slick", FAR, 6)],
 "labels": [lab("glaze", "磨滑的表面", "Glazed surface", "amber", "slick", "slick+46"),
            lab("grain", "磨粒抓不住", "Grit slides off", "blue", "lose", "lose+46")],
 "overlay": [card("s5", "pad-glaze", "用久的抹布", "示意", {"long": "long", "slick": "slick", "rag": "rag", "lose": "lose"})]}
P["s6"] = {"zoom": [{"to": "tool", "at": CC, "dur": 1}, {"to": "micro", "at": "rough-10", "dur": 1}],
 "shot": [shot(CC, -1.0, 1.8, 40, 42, 1), shot("rough-10", 38.0, MY6, MD, 33, 1)],
 "run": [run("padSpin", "start-2", "rough-14", 8), run("slOutA", "start-2", "rough-14", 6), run("slOutB", "start-2", "rough-14", 6), run("condSwing", "dia-8", "rough-14", 10), run("condSpin", "dia-8", "rough-14", 10), run("condDust", "sweep", "rough-14", 6),
         run("toolRub", "rough+14", "s6:comb+44", 8), run("toolChips", "rough+14", "s6:comb+44", 6), run("toolCrumb", "rough+14", "s6:comb+44", 6), run("mGroove", "rough+12", FAR, 6)],
 "labels": [lab("condDisc", "鑽石碟", "Diamond disc", "amber", "dia", "dia+46"),
            lab("grain", "鑽石顆粒", "Diamond grit", "blue", "comb-8", "comb+38")],
 "overlay": [card("s6", "pad-dress", "梳子梳起壓扁的毛", "示意", {"dia": "dia", "sweep": "sweep", "rough": "rough", "comb": "comb"})]}
P["s7"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}, {"to": "tool", "at": SW(-2), "dur": 1}],
 "shot": [shot(CC, 58.0, TY, TD, TE, 1), shot(SW(-2), -0.2, 1.75, 39, 35, 1)],
 "run": [run("padPeel", SW(0), SW(26), 18), run("rollerSpin", SW(66), SW(92), 4)],
 "labels": [lab("tOld", "舊墊薄、新墊厚", "Old: thin / New: thick", "amber", "voice-2", SW(-4)),
            lab("padOld", "舊墊", "Old pad", "amber", SW(0), SW(46)),
            lab("padNew", "新墊", "New pad", "blue", SW(48), SW(96), xy=[230, 330])],
 "overlay": [card("s7", "pad-wear", "磨薄就換，機台停下來", "示意（不標壽命時數）", {"thin": "thin", "swap": "swap", "stop": "stop"})]}
P["s8"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, 74.0, 1.6, 37, 30, 1), shot("tough-6", 90.0, 1.6, 37, 30, 30)],
 "run": [run("hsRubSoft", "soft-6", "tough-6", 8), run("hsSoftHot", "soft-4", "tough-8", 8), run("hsRubHard", "tough-6", FAR, 8), run("hsHot", "tough-4", FAR, 8), run("hsPartDrop", "scr-12", "scr+16", 4)],
 "labels": [lab("softL", "軟墊：凹處也被碰", "Soft: touches valleys too", "amber", "soft", "soft+46"),
            lab("hardL", "硬墊：只碰凸處，易刮傷", "Hard: high spots only, scratches", "blue", "tough", "scr+28")],
 "overlay": [card("s8", "pad-hard", "軟硬各有代價", "示意", {"soft": "soft", "flat": "flat", "tough": "tough", "scr": "scr"})]}
P["s9"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [shot(CC, 112.0, VY, VD, VE, 1)],
 "overlay": [sec("pad-co", C, nxt("s9"), "研磨墊供應商", "DuPont、SEC、富士紡、證交所；截至 2026/11/27", {"intl": "intl", "dp": "dp", "fb": "fb", "tw": "tw", "sh": "sh"}, h=392, y=1000, cut=True)]}   # 第 40 條：念完「頌勝」後卡片停 0.85 秒（第 39 條無聲 ≤1.0 秒＋同一幀換幕的上限，見 README r3）
P["s10"] = {"zoom": [{"to": "tool", "at": CC, "dur": 1}],
 "shot": [shot(CC, 134.0, NY, ND, NE, 1)],
 "labels": [lab("nPadA", "研磨墊", "Polishing pad", "amber", "wear", "wear+46"),
            lab("nQzA", "石英環", "Quartz ring", "amber", "cham+24", "cham+70"),
            lab("nDiscA", "鑽石碟", "Diamond disc", "blue", "next+18", "next+64")],
 "overlay": [sec("pad-next", C, "s11:start", "接下來", "下一集：耗材", {"wear": "wear", "next": "next", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("tool", "CMP 研磨台（示意）", "CMP POLISHING STATION", "100 cm", "10 cm"), lv("micro", "研磨墊剖面（示意）", "PAD CROSS-SECTION", "10 mm", "1 mm"), lv("co", "研磨墊供應商", "PAD SUPPLIERS", "100 cm", "10 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-pad", "prevEpisode": "2-16：研磨液", "title": "研磨墊（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b",
                 "_說明": "旁白金手指：2.5＋Iapetus＋說明 B 原句；Andy 在 AI Studio 錄音；本支不送 TTS"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["研磨墊", "怎麼磨平？"], "sub": "晶圓倒扣壓在墊子上", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
    for w in ["FOUP", "EFEM", "負載鎖", "SCARA", "量測", "CMP"]:
        if w in (s.get("narration") or "") + s["subtitle"]["zh"]: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
