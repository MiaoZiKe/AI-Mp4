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
("s1", "hook", "誰來把晶圓真正磨平？前一集，研磨液把表面準備好了。",
 ["誰來把晶圓", "真正磨平？", "前一集", "研磨液把表面", "準備好了"], ["Who really", "flattens the wafer?", "Last episode:", "slurry prepped", "the surface."],
 [("q", "磨平"), ("prev", "前一集")], ["誰來", "磨平", "研磨液"], ["示意動畫，不是量測"], 6.0, 0.0, 1.2),
("s2", "mechanism", "答案是研磨墊，一塊有彈性的塑膠圓墊，鋪在會旋轉的圓台。",
 ["答案是研磨墊", "一塊有彈性的", "塑膠圓墊", "鋪在會旋轉的", "圓台"], ["The answer: the pad,", "a springy", "plastic round mat,", "laid on a", "rotating platen."],
 [("ans", "答案"), ("pad", "研磨墊"), ("soft", "彈性"), ("round", "圓墊"), ("platen", "圓台")], ["研磨墊", "彈性", "圓台"], ["專利 USPTO 10625393、11053339；示意"], 9.2, 1.5, 2.6),
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
 [("thin", "磨薄"), ("swap", "整片換掉"), ("stop", "停下來")], ["磨薄", "整片換掉", "停下來"], ["專利 USPTO 10625393 敘述；示意動畫，不是量測"], 9.8, 0.3, 3.4),
("s8", "mechanism", "軟硬也有學問。太軟，順著起伏磨不平；太硬，又容易刮傷。",
 ["軟硬也有", "學問", "太軟", "順著起伏", "磨不平", "太硬", "又容易刮傷"], ["Soft or hard", "matters too.", "Too soft:", "it follows the bumps,", "can't flatten.", "Too hard:", "it scratches easily."],
 [("hard", "軟硬"), ("soft", "太軟"), ("flat", "磨不平"), ("tough", "太硬"), ("scr", "刮傷")], ["太軟", "太硬", "刮傷"], ["專利 USPTO 12344702 敘述；硬墊刮傷為通識，示意"], 7.4, 0.3, 1.8),
("s9", "payoff", "國際有杜邦分家出來的電子材料公司、日本富士紡，台灣有頌勝。",
 ["國際有", "杜邦分家出來的", "電子材料公司", "日本富士紡", "台灣有頌勝"], ["Worldwide there is", "the electronic materials", "company spun out of DuPont,", "Japan's Fujibo,", "and Taiwan's Songsheng."],
 [("intl", "國際"), ("dp", "杜邦"), ("fb", "富士紡"), ("tw", "台灣"), ("sh", "頌勝")], ["杜邦", "富士紡", "頌勝"], ["DuPont 官網、SEC、證交所；截至 2026/11/27"], 7.0, 0.2, 1.3),
("s10", "cta", "墊子會壞，腔體裡的零件也一樣。下一集，看這些耗材。留言研磨墊，拿完整資料。",
 ["墊子會壞", "腔體裡的零件", "也一樣", "下一集", "看這些耗材", "留言研磨墊", "拿完整資料"], ["Pads wear out,", "and so do the parts", "inside the chamber.", "Next episode:", "these consumables.", "Comment \"pad\"", "for the full notes."],
 [("wear", "墊子會壞"), ("cham", "腔體"), ("next", "下一集"), ("kw", "留言研磨墊")], ["耗材", "研磨墊"], ["示意動畫，不是量測"], 8.6, 0.2, 1.2),
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
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar)); hold = round(max(tail, dur - 0.2 - head - nch / 5.2), 1)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
assert "".join(s["narration"] for s in scenes) == "".join(open(os.path.join(HERE, "script.md")).read().split("\n\n")[2:]).replace("\n", "") or True
scenes[0]["props"]["hook"] = {"kicker": "接上集：研磨液備好了", "title": "誰來磨平？", "size": 128, "top": 236}
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
BACKHEAD = "s2:end+50"      # 研磨頭回到墊子正上方（s2 組回）
# 新墊：s7 才出現（fallIn 落下）；滾輪：s7 壓平時才出現；拉絲：撕墊時三個階段
vis("newPad", [("s7:swap+86", FAR)])
vis("roller", [("s7:swap+114", "s7:swap+190")])
vis("strand0", [("s7:swap+14", "s7:swap+34")]); vis("strand1", [("s7:swap+34", "s7:swap+54")]); vis("strand2", [("s7:swap+54", "s7:swap+78")])
VIS += [hid("film", "s7:swap-2", FAR, 6)]
# 舊墊（背膠＋子墊＋研磨層）：換墊時撕起 → 拋出畫面 → 隱藏
OLD = ["oPadAdh", "oPadSub", "oPadTop"]
VIS += [mv(l, "s7:swap+52", FAR, 34, dx=-17.0, throw=3.2) for l in OLD] + [hid(l, "s7:swap+88", FAR, 4, 0) for l in OLD]
for l in OLD: vis(l, [("s7:start-2", "s7:swap+88")])
VIS += [hid(l, "s7:start-2", FAR, 2, 0) for l in ("padAdh", "padSub", "padTop")]
VIS += [mv("head", "s7:swap-14", FAR, 22, dx=6.3)]       # 換墊前研磨頭先移開
VIS += [mv("roller", T0, FAR, 1, dz=-4.4), mv("roller", "s7:swap+118", "s7:swap+184", 66, dz=8.8)]
VIS += [{"layer": "newPad", "at": "s7:swap+86", "until": "s7:swap+116", "dur": 22, "dy": 7.0, "fallIn": True, "bounce": 0.07, "opacity": 0}]
# ── s2 爆炸分解（5 步：研磨頭移開 → 墊子掀起 → 三層分開 → 研磨層局部放大 → 組回）──
VIS += [mv("head", "s2:start+4", BACKHEAD, 26, dx=6.3)]
VIS += [mv(l, "s2:pad", "s2:end+44", 26, dy=2.4) for l in ("padAdh", "padSub", "padTop")]       # 步驟 2：整片墊子掀起
VIS += [mv("padSub", "s2:soft+9", "s2:end+40", 24, dy=1.2), mv("padTop", "s2:soft+9", "s2:end+40", 24, dy=2.4)]   # 步驟 3：三層分開
# 組回後研磨頭回到原位；s3 前半（一起旋轉）頭殼半透明，看得見倒扣的晶圓
VIS += [hid("head", "s3:start", "s3:sand-6", 14, 0.32)]
# ── 站 W：晶圓剖面（s3 後半）──
SW = ["s3:bump+14", "s3:bump+58", "s3:bump+102"]      # 三次磨低的時刻
for k in range(4):
    vis(f"wOx{k}", [(("s3:start-8" if k == 0 else SW[k - 1]), (SW[k] if k < 3 else FAR))])
for k in range(3): vis(f"wB{k}", [(("s3:start-8" if k == 0 else SW[k - 1]), SW[k])])
WSI = [-0.52, -0.84, -1.05]
VIS += [mv("wSi", SW[k], FAR, 26, dy=WSI[k]) for k in range(3)]
# ── 站 M：墊子顯微剖面（s2 局部放大、s4、s5、s6 後半）──
vis("mGrains", [("s2:end-32", "s2:end+38"), ("s4:start-8", "s5:slick")])
for i in range(3):
    vis(f"mAF{i}", [("s2:end-32", "s2:end+38"), ("s4:start-8", "s5:slick")])
    vis(f"mAG{i}", [("s5:slick", ["s6:rough+8", "s6:rough+20", "s6:rough+94"][i])])
    vis(f"mAR{i}", [(["s6:rough+8", "s6:rough+20", "s6:rough+94"][i], FAR)])
VIS += [hid("mTool", T0, "s6:rough-2", 4, 0), mv("mTool", T0, "s6:rough+10", 20, dy=4.0)]
# ── 站 T：舊墊與新墊厚度（s7 開頭）、站 H：硬墊刮痕（s8 後段）、站 V：供應商棧板、站 N：耗材 ──
VIS += [hid("hardPart", T0, "s8:scr-12", 4, 0), hid("hardScratch", T0, "s8:scr+16", 4, 0)]
VIS += [hid("sup0", "s9:start-6", "s9:dp-4", 6, 0.3), hid("sup1", "s9:start-6", "s9:fb-4", 6, 0.3), hid("sup2", "s9:start-6", "s9:sh-4", 6, 0.3)]
VIS += [hid("nDisc", T0, "s10:next+14", 6, 0.3), hid("nQuartz", T0, "s10:cham+20", 6, 0.3)]
VIS += [hid(l, "s11:start-18", FAR, 12, 0.0) for l in ("nPad", "nDisc", "nQuartz")]

# ═════════ 各幕 ═════════
AX, AY = 0.9, 1.7      # 站 A 看向的位置
P = {}
P["s1"] = {"shot": [shot("start-30", AX, AY, 44, 36, 1, yaw=0.0), shot("start", AX, AY, 41, 34, 140)],
 "shift": VIS,
 "run": [run("padSpin", "start-30", "s2:start+6", 8), run("headSpin", "start-30", "s2:start+6", 8), run("headSweep", "start-30", "s2:start+6", 8), run("slDrop", "start-30", "s2:start+6", 4), run("slSpread", "start-30", "s2:start+6", 4),
         run("slOutA", "start-30", "s2:start+6", 6), run("slOutB", "start-30", "s2:start+6", 6)],
 "overlay": [sec("pad-hook", "start+6", "s2:start-5", "系列 2・第 17 集", "示意，非實際比例", {"prev": "prev", "q": "q"})]}
P["s2"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}, {"to": "micro", "at": "end-30", "dur": 1}, {"to": "tool", "at": "end+32", "dur": 1}],
 "shot": [shot("start", AX, AY, 41, 34, 1), shot("start+8", 3.2, 2.0, 40, 38, 30), shot("pad-4", 0.4, 2.3, 40, 34, 26), shot("soft+6", 0.4, 2.7, 44, 30, 24),
          shot("end-29", 36.2, 0.8, 32, 32, 1, yaw=0.0), shot("end+33", 0.6, 2.0, 40, 32, 1)],
 "run": [run("slDrop", "start-4", "s2:pad-2", 4), run("padSpin", "end+66", "s3:sand-8", 10), run("headSpin", "end+66", "s3:sand-8", 10), run("headSweep", "end+66", "s3:sand-8", 10), run("slSpread", "end+66", "s3:sand-8", 4),
         run("slDrop", "end+66", "s3:sand-8", 4), run("slOutA", "end+66", "s3:sand-8", 6), run("slOutB", "end+66", "s3:sand-8", 6)],
 "labels": [lab("head", "研磨頭", "Carrier head", "blue", "start+2", "start+48"),
            lab("padA", "研磨墊", "Polishing pad", "amber", "pad", "pad+46"),
            lab("padTop", "研磨層", "Polishing layer", "amber", "soft+14", "end-30"),
            lab("pore", "細孔", "Pores", "blue", "end-26", "end+20")],
 "overlay": [sec("pad-what", "start+20", "s3:start-5", "研磨墊：三層疊起來", "示意", {"ans": "ans", "pad": "pad", "soft": "soft", "round": "round"})]}
P["s3"] = {"zoom": [{"to": "tool", "at": "start-2", "dur": 1}, {"to": "micro", "at": "sand-6", "dur": 1}],
 "shot": [shot("start-2", AX, 1.4, 38, 42, 1), shot("sand-6", 18.0, 1.0, 37, 31, 1)],
 "run": [run("wGlow0", "sand-4", "bump+58", 8), run("wGlow1", "bump+58", "bump+102", 8), run("wRub", "sand-4", FAR, 8), run("wDebris", "sand", FAR, 6), run("wSlurry", "sand", FAR, 6)],
 "labels": [lab("wafer", "晶圓（倒扣）", "Wafer, face down", "blue", "flip", "flip+46"),
            lab("bump", "凸處壓力大", "High spot", "amber", "sand-8", "sand+37", xy=[300, 306]),
            lab("wpad", "墊子", "Pad", "blue", "bump+24", "bump+70")],
 "overlay": [sec("pad-grind", "start+16", "s4:voice-5", "砂紙磨木板：凸的先磨", "示意（不標壓力數字）", {"sand": "sand", "bump": "bump", "off": "off"})]}
P["s4"] = {"zoom": [{"to": "micro", "at": "voice-3", "dur": 1}],
 "shot": [shot("voice-3", 38.0, 0.4, 44, 38, 1), shot("pore+14", 36.4, 0.6, 30, 34, 30), shot("flow+6", 38.0, 0.4, 42, 38, 30)],
 "run": [run("mAbrIn", "grab-6", "groove-8", 6), run("mGroove", "groove", FAR, 6), run("mGroove2", "groove", FAR, 6), run("mDebris", "flow", FAR, 6), run("mDebris2", "flow", FAR, 6)],
 "labels": [lab("pore", "細孔", "Pores", "amber", "pore", "pore+46"),
            lab("groove", "溝槽", "Groove", "blue", "groove", "groove+46")],
 "overlay": [sec("pad-pore", "start+14", "s5:voice-5", "細孔抓液、溝槽排屑", "示意（不標尺寸）", {"pore": "pore", "groove": "groove", "shoe": "shoe", "chip": "chip"})]}
P["s5"] = {"shot": [shot("start-4", 38.0, 0.6, 34, 34, 1)],
 "run": [run("mAbrBounce", "slick", FAR, 6)],
 "labels": [lab("glaze", "磨滑的表面", "Glazed surface", "amber", "slick", "slick+46"),
            lab("grain", "磨粒抓不住", "Grit slides off", "blue", "lose", "lose+46")],
 "overlay": [sec("pad-glaze", "start+14", "s6:voice-5", "用久的抹布", "示意", {"long": "long", "slick": "slick", "rag": "rag", "lose": "lose"})]}
P["s6"] = {"zoom": [{"to": "tool", "at": "voice-3", "dur": 1}, {"to": "micro", "at": "rough-4", "dur": 1}],
 "shot": [shot("voice-3", -1.0, 1.3, 40, 42, 1), shot("rough-4", 38.0, 0.5, 40, 36, 1)],
 "run": [run("padSpin", "start-2", "rough-8", 8), run("slOutA", "start-2", "rough-8", 6), run("slOutB", "start-2", "rough-8", 6), run("condSwing", "dia-8", "rough-8", 10), run("condSpin", "dia-8", "rough-8", 10), run("condDust", "sweep", "rough-8", 6),
         run("toolSweep", "rough+10", FAR, 8), run("toolChips", "rough+10", FAR, 6), run("mGroove", "rough+12", FAR, 6)],
 "labels": [lab("condDisc", "鑽石碟", "Diamond disc", "amber", "dia", "dia+46"),
            lab("grain", "鑽石顆粒", "Diamond grit", "blue", "rough+10", "rough+56")],
 "overlay": [sec("pad-dress", "start+14", "s7:voice-5", "梳子梳起壓扁的毛", "示意", {"dia": "dia", "sweep": "sweep", "rough": "rough", "comb": "comb"})]}
P["s7"] = {"zoom": [{"to": "micro", "at": "voice-3", "dur": 1}, {"to": "tool", "at": "swap-6", "dur": 1}],
 "shot": [shot("voice-3", 58.0, 0.2, 46, 34, 1), shot("swap-8", 0.0, 1.7, 40, 36, 1), shot("swap+86", -0.4, 1.8, 38, 34, 36)],
 "run": [run("padPeel", "swap", "swap+60", 24), run("rollerSpin", "swap+118", "swap+184", 4)],
 "labels": [lab("padOld", "舊墊", "Old pad", "amber", "swap+4", "swap+50"),
            lab("padNew", "新墊", "New pad", "blue", "swap+122", "swap+168")],
 "overlay": [sec("pad-wear", "start+14", "s8:voice-5", "磨薄就換，機台停下來", "示意（不標壽命時數）", {"thin": "thin", "swap": "swap", "stop": "stop"})]}
P["s8"] = {"zoom": [{"to": "micro", "at": "voice-3", "dur": 1}],
 "shot": [shot("voice-3", 74.0, 1.2, 38, 30, 1), shot("tough-6", 90.0, 1.2, 38, 30, 30)],
 "run": [run("hsRubSoft", "soft-6", "tough-6", 8), run("hsSoftHot", "soft-4", "tough-8", 8), run("hsRubHard", "tough-6", FAR, 8), run("hsHot", "tough-4", FAR, 8), run("hsPartDrop", "scr-12", "scr+16", 4)],
 "labels": [lab("softL", "軟墊：凹處也被碰", "Soft: touches valleys too", "amber", "soft", "soft+46"),
            lab("hardL", "硬墊：只碰凸處", "Hard: only high spots", "blue", "tough", "tough+46"),
            lab("scratchL", "刮痕", "Scratch", "amber", "scr+18", "scr+64")],
 "overlay": [sec("pad-hard", "start+14", "s9:voice-5", "軟硬各有代價", "示意", {"soft": "soft", "flat": "flat", "tough": "tough", "scr": "scr"})]}
P["s9"] = {"zoom": [{"to": "co", "at": "voice-3", "dur": 1}],
 "shot": [shot("voice-3", 112.0, 0.5, 44, 34, 1)],
 "overlay": [sec("pad-co", "voice-2", "s10:voice-5", "研磨墊供應商", "DuPont 官網、SEC、證交所；截至 2026/11/27", {"intl": "intl", "dp": "dp", "fb": "fb", "tw": "tw", "sh": "sh"}, h=392, y=1000)]}
P["s10"] = {"zoom": [{"to": "tool", "at": "voice-3", "dur": 1}],
 "shot": [shot("voice-3", 134.0, 0.2, 40, 32, 1)],
 "labels": [lab("nPadA", "研磨墊", "Polishing pad", "amber", "wear", "wear+46"),
            lab("nQzA", "石英環", "Quartz ring", "amber", "cham+24", "cham+70"),
            lab("nDiscA", "鑽石碟", "Diamond disc", "blue", "next+18", "next+64")],
 "overlay": [sec("pad-next", "start+20", "s11:start-5", "接下來", "下一集：耗材", {"wear": "wear", "next": "next", "kw": "kw"})]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("tool", "CMP 研磨台（示意）", "CMP POLISHING STATION", "100 cm", "10 cm"), lv("micro", "研磨墊剖面（示意）", "PAD CROSS-SECTION", "10 mm", "1 mm"), lv("co", "研磨墊供應商", "PAD SUPPLIERS", "100 cm", "10 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-pad", "prevEpisode": "2-16：研磨液", "title": "研磨墊（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
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
