"""tech-chem 腳本產生器：python3 videos/tech-chem/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
濕式化學品與研磨液（科技透明圈 系列 2「代工的供應商」第 16 集；上一集 2-15：特用氣體；下一集 2-17：研磨墊）。
念稿一個字都不改（script.md 定稿，Andy 正在 AI Studio 錄音）；旁白、cue、字幕、hook、片尾卡、hud、voice 與各幕 3D 動作（shot／shift／run／labels／overlay）都在這支。
cue 來自 timeline.json（無聲估算或配音後的對齊），配音後重跑本檔即可。2D 卡：src/components/three/HudChem.tsx（chem-*）。構造與物理：physics-spec.md；模組清單：visual-spec.md。
Andy 11-27 第 27 條：念稿 ≤260 字、一幕一件事最多 1 個新名詞、關鍵畫面念完後留 ≥1.2 秒只有畫面（holdSec，同時寫進 pauseAfter）；第 28 條：≥3 個生活比喻；第 29 條：爆炸分解步驟全部做完。
第 18 條：念稿不用縮寫術語；第 21、22 條：念稿避開「上」、「量測」；第 32 條：出處列不放上一集／前一集／預告。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, 幕長秒, 尾端只有畫面秒數)
S = [
("s1", "hook", "一桶藥水，為什麼連一粒灰都不行？前一集看完氣體，這一集換看液體。",
 ["一桶藥水", "為什麼連一粒灰", "都不行？", "前一集看完氣體", "這一集換看液體"], ["One drum of chemicals,", "why not even one speck", "of dust?", "Last episode: gases.", "This episode: liquids."],
 [("liq", "藥水"), ("dust", "一粒灰"), ("prev", "前一集")], ["液體", "一粒灰"], ["示意動畫，不是量測"], 7.0, 0.8),
("s2", "mechanism", "晶圓要洗、要蝕刻、要磨平，每一步都靠液體，統稱濕式化學品。",
 ["晶圓要洗", "要蝕刻", "要磨平", "每一步都靠液體", "統稱濕式化學品"], ["Wafers get washed,", "etched,", "and polished flat.", "Every step relies on liquids,", "called wet chemicals."],
 [("wash", "要洗"), ("etch", "蝕刻"), ("polish", "磨平"), ("name", "濕式化學品")], ["洗", "蝕刻", "磨平", "濕式化學品"], ["經濟日報（電子級化學品用途）", "科技新報〈什麼是 CMP〉"], 6.1, 0.8),
("s3", "mechanism", "它們多乾淨？像一座游泳池，只准混進一小匙雜質。",
 ["它們多乾淨？", "像一座游泳池", "只准混進", "一小匙雜質"], ["How clean are they?", "Like a swimming pool", "allowed only", "one teaspoon of impurity."],
 [("q", "多乾淨"), ("pool", "游泳池"), ("spoon", "一小匙")], ["多乾淨", "游泳池", "一小匙"], ["比喻為自行換算；示意，不是量測"], 5.6, 0.8),
("s4", "mechanism", "藥水從廠外大槽出發，沿管線送到機台旁，",
 ["藥水從廠外大槽出發", "沿管線送到機台旁"], ["Chemicals leave the outdoor tank,", "travel by pipe to the tool,"],
 [("tank", "大槽"), ("pipe", "管線"), ("desk", "機台旁")], ["大槽", "管線"], ["Air Liquide、3M 文件；示意，不是量測"], 5.3, 0.8),
("s4c", "mechanism", "像自來水廠送水，但每一段都不准掉渣。",
 ["像自來水廠送水", "但每一段", "都不准掉渣"], ["like a water works,", "but every segment", "must shed no particles."],
 [("water", "自來水廠"), ("clean", "不准掉渣")], ["自來水廠", "不准掉渣"], ["Air Liquide、3M 文件；示意，不是量測"], 5.4, 0.8),
("s5", "mechanism", "管子用塑膠，不用鐵。就像檸檬汁不裝鐵杯，酸會咬下金屬，污染晶圓。",
 ["管子用塑膠", "不用鐵", "就像檸檬汁", "不裝鐵杯", "酸會咬下金屬", "污染晶圓"], ["Pipes are plastic,", "not iron.", "Like lemon juice", "never in an iron cup,", "acid bites off metal", "and contaminates the wafer."],
 [("plastic", "塑膠"), ("iron", "不用鐵"), ("lemon", "檸檬汁"), ("cup", "鐵杯"), ("bite", "咬下金屬"), ("dirty", "污染")], ["塑膠", "檸檬汁", "咬下金屬"], ["SEMI F57、SEMI C90", "示意動畫，不是量測"], 6.8, 0.8),
("s6", "mechanism", "研磨液更特別，藥水裡混著極細的磨粒，像含細砂的洗面乳，砂磨、藥水溶，一起動手。",
 ["研磨液更特別", "藥水裡混著", "極細的磨粒", "像含細砂的洗面乳", "砂磨藥水溶", "一起動手"], ["Slurry is special:", "tiny abrasive grains", "mixed into the liquid,", "like a scrub with fine sand.", "Grains grind, chemistry dissolves,", "together."],
 [("slurry", "研磨液"), ("grain", "磨粒"), ("wash", "洗面乳"), ("sand", "砂磨"), ("chem", "藥水溶"), ("both", "一起動手")], ["研磨液", "磨粒", "一起動手"], ["科技新報〈什麼是 CMP〉", "3M 研磨液應用文件"], 8.1, 0.8),
("s7b", "mechanism", "磨粒最怕結塊，會刮傷晶圓。所以槽裡一直攪動、循環過濾，像不停攪拌的豆漿，才不會沉底。",
 ["磨粒最怕結塊", "會刮傷晶圓", "所以槽裡一直攪動", "循環過濾", "像不停攪拌的豆漿", "才不會沉底"], ["Grains hate clumping,", "it scratches the wafer.", "So the tank keeps stirring,", "recirculating and filtering,", "like soy milk kept stirred", "so it never sinks."],
 [("lump", "結塊"), ("scratch", "刮傷"), ("so", "所以"), ("stir", "攪動"), ("loop", "循環"), ("filter", "過濾"), ("soy", "豆漿"), ("sink", "沉底")], ["結塊", "刮傷", "攪動", "循環過濾"], ["Air Liquide、3M 文件；示意，不是量測"], 8.8, 0.8),
("s8", "payoff", "國際有英特格，台灣有中華化做硫酸，三福化做顯影液。",
 ["國際有英特格", "台灣有中華化", "做硫酸", "三福化", "做顯影液"], ["Internationally: Entegris.", "In Taiwan: Chung Hwa Chemical", "makes sulfuric acid,", "San Fu Chemical", "makes developer."],
 [("intl", "英特格"), ("chc", "中華化"), ("acid", "硫酸"), ("sanfu", "三福化"), ("dev", "顯影液")], ["英特格", "中華化", "三福化"], ["Entegris 官網、經濟日報、Yahoo 股市；截至 11/27"], 5.8, 0.85),
("s9", "cta", "液體有了，還缺一塊把晶圓磨平的墊子。下一集，看研磨墊。留言化學品，拿完整資料。",
 ["液體有了", "還缺一塊", "把晶圓磨平的墊子", "下一集", "看研磨墊", "留言化學品", "拿完整資料"], ["Liquids are ready,", "but one piece is missing,", "the pad that polishes wafers flat.", "Next episode:", "the polishing pad.", "Comment \"chemicals\"", "for the full notes."],
 [("pad", "墊子"), ("next", "下一集"), ("pad2", "研磨墊"), ("kw", "留言")], ["研磨墊", "化學品"], ["示意動畫，不是量測"], 8.1, 0.8),
]
def TTS(t):
    t = t.replace("上集", "上一集").replace("上一一集", "上一集").replace("矽", "細").replace("光罩", "光照")
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("上百片", "一百多片")]:
        t = t.replace(a, b)
    return t
SAMEPARA = {"s4c"}   # 同一句念稿拆成幾幕：para 相同，TTS 時連成一段
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, dur, tail) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？、]", "", z)) <= 11, (sid, z)
    assert "".join(re.sub(r"[ ，。？、]", "", z) for z in zh) == re.sub(r"[ ，。？、]", "", nar), (sid, "字幕與念稿不一致")
    for c in cues: assert c[1] in "".join(re.sub(r"[，。？！、；：\s]", "", z) for z in zh), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar)); hold = tail   # 11-27 第 39 條：念完後留白 ≤0.85 秒（幕間無聲 ≤1 秒）
    sc = {"id": sid, "beat": beat, "para": i + 1 - sum(1 for q in S[:i + 1] if q[0] in SAMEPARA), "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
scenes[0]["props"]["hook"] = {"kicker": "接上集：看完氣體，換看液體", "title": "一粒灰都不行？", "size": 118, "top": 236}
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "研磨墊", "trail": ["把晶圓磨平的墊子"], "comment": "化學品", "logoAnim": "transparent"}}})

# ═════════ 工具 ═════════
FAR = "s10:start+400"
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

C = lambda n: f"s4c:clean{n:+d}"      # 「不准掉渣」起算
W = lambda n: f"s4c:water{n:+d}"      # 「自來水廠」起算
DK = lambda n: f"s4:desk{n:+d}"       # 「機台旁」起算
OVL = C(146)                          # 迴路遠景的零件淡入
LAYERS = [l["id"] for l in MODEL["layers"] if not l.get("bg")]
VIS = []
T0 = "s1:start-40"
USED = set()
def vis(lay, wins, dur=1):
    """依「可見區間」清單產生隱藏：區間之外全藏。區間 (a, b)；a＝T0 表示一開始就看得到；b＝FAR 表示一直看到片尾"""
    assert lay in LAYERS, lay
    USED.add(lay)
    prev = T0
    for w in wins:
        a, b = w[0], w[1]; d = w[2] if len(w) > 2 else dur     # 第三格＝這一段淡入／前一段淡出的幀數
        if a != T0: VIS.append(hid(lay, prev, a, d))
        prev = b
    if prev != FAR: VIS.append(hid(lay, prev, FAR, dur))
# ── 各站可見區間 ──
vis("drum", [(T0, "s2:start-1")]); vis("dustS1", [(T0, "s2:start-1")])
vis("magS1", [("s1:liq+4", "s2:start-1")])
for l in ["jugs", "wfS2"]: vis(l, [("s2:start-1", "s3:start-1")])
vis("wfFilm", [("s2:wash+6", "s3:start-1")])
for l in ["pool", "spoon"]: vis(l, [("s3:start-1", "s3:spoon+34")])
vis("pipeI", [("s3:spoon+32", "s4:start-1")])
S4 = ("s4:start-1", "s5:start-1")
for l in ["tank", "tankFit", "berm", "tport"]: vis(l, [("s4:start-1", "s4:desk-2", 1)])
vis("loopIn", [("s4:start-1", "s4:desk-2", 1)])
for l in ["rack", "loopOut", "loopRet", "vmbBox", "vmbFront", "vmbIn", "dtBase", "dtWall", "dtDoor", "dtTank", "dtStir", "dtFloat", "dtPump", "pouShell", "pouCore", "pouFit", "feedL", "scBody", "scCup", "scChuck", "scArm", "wsBase", "wsWall", "wsDoor", "wsTank"]: vis(l, [])
for l in ["cdsFrame", "cdsBase", "cdsWall", "cdsDoor", "cdsPump", "cdsValve", "cdsFilter", "cdsCore", "cdsMeas", "cdsPipe"]:
    vis(l, [S4])
vis("ironPipe", [("s5:start-1", "s6:start-1")]); vis("ironAcid", [("s5:start-1", "s6:start-1")]); vis("pfaPipe", [("s5:start-1", "s6:start-1")]); vis("pfaAcid", [("s5:start-1", "s6:start-1")]); vis("lemon", [("s5:start-1", "s6:start-1")])
vis("rustA", [("s5:bite", "s6:start-1")]); vis("rustB", [("s5:bite+18", "s6:start-1")]); vis("rustC", [("s5:bite+36", "s6:start-1")])
S6 = ("s6:start-1", "s7b:stir-2")
for l in ["slBlock", "wfSurf", "slPad", "grainFree", "bumpHi"]: vis(l, [S6])
vis("grainPress", [("s6:sand-8", "s7b:stir-2")]); vis("oxMol", [("s6:chem-10", "s7b:stir-2")]); vis("debris", [("s6:sand+18", "s7b:stir-2")]); vis("bumpLo", [("s6:sand+20", "s7b:stir-2")]); vis("oxFilm", [S6])
vis("lump", [("s7b:start-4", "s7b:stir-2")])
for i in range(6): vis(f"scr{i}", [(f"s7b:scratch+{6 * i + 4}", "s7b:stir-2")])
VIS += [hid("bumpHi", "s6:sand+20", "s7b:stir-2", 30, 0), hid("oxFilm", "s6:chem+2", "s7b:stir-2", 54, 0)]
S7 = ("s7b:stir-2", "s8:start-1")
for l in ["slBase", "slWall", "slDoor", "slTankA", "slLiq", "slLid", "slStir", "slTankB", "slLumps", "slPump", "slFilter", "slFCore", "slPipe", "slN2"]: vis(l, [S7])
vis("slTrap", [("s7b:end-96", "s8:start-1")]); vis("slSed", [S7])
VIS.append(hid("slLumps", "s7b:stir+10", "s8:start-1", 40, 0))   # r2：結塊被迴路抽走，槽底結塊在標籤期間（stir+44～+89）淡掉，念到「才不會沉底」時槽底已乾淨
S8 = ("s8:start-1", "s9:start-1")
for l in ["palletC", "co0", "co1", "co2"]: vis(l, [S8])
for l in ["pdBase", "pdPad", "pdRing", "pdArm", "pdPuddle"]: vis(l, [("s9:start-2", FAR)])
EXPL = []
# s4／s4c：管理櫃爆炸分解（規格 §2.1 五步，r2）：句子是一口氣念完的（s4＋s4c），所以句中不停（pauseAfter ≤0.4），分解動作跨兩幕、全部綁 cue；
# ①前門滑開半扇（門與側板留淡影、外框線全程在）②泵與閥島沿 X 軸分開 ③過濾器殼沿 Z 軸向前抽出一個身位（停 ≥1.5 秒）④濾芯上移露出褶疊膜 ⑤流量計與壓力轉換器上移；念完「掉渣」後組回、停留，再拉遠到迴路
R4 = "s4c:start+112"
EXPL += [mv("cdsDoor", DK(0), R4, 14, dx=9.5), hid("cdsDoor", DK(0), R4, 12, 0.18), hid("cdsWall", DK(0), R4, 12, 0.2),
         mv("cdsPump", "s4c:start+4", R4, 18, dx=-4.8), mv("cdsValve", "s4c:start+4", R4, 18, dx=-1.8),
         mv("cdsFilter", "s4c:start+50", R4, 18, dz=9.0), mv("cdsCore", "s4c:start+66", R4, 18, dy=5.2, dz=9.0)]
# s7：研磨液槽組：①槽蓋掀開看攪拌槳 ②槽內結塊被迴路抽走 ③濾芯沿軸線拉開，濾膜卡住大顆粒 ④組回
B7 = "s7b:end-44"   # r5：綁幕尾，配音後幕長變動仍在幕尾前 ≥15 幀組回
F7 = "s7b:end-92"   # 過濾標籤與濾芯拉開同時開始（標籤依序：攪拌→結塊被抽走→過濾，一次一張）
EXPL += [mv("slDoor", "s7b:stir-2", "s8:start-2", 14, dx=24.0), hid("slWall", "s7b:stir-2", "s8:start-2", 14, 0.14), mv("slLid", "s7b:stir-4", B7, 22, dy=6.0),
         hid("slFilter", F7, B7, 12, 0.2), mv("slFCore", F7, B7, 24, dy=8.5), mv("slTrap", F7, B7, 24, dy=8.5)]
# s7 開頭：結塊的大顆粒夾在墊與晶圓之間，一次劃出刮痕
EXPL += [mv("lump", "s7b:scratch-14", "s7b:stir-2", 30, dx=9.0)]
P = {}
# ─── s1：一桶藥水，一粒灰 ───
P["s1"] = {"shot": [shot("start-30", -87.0, 6.0, 50, 12, 1, yaw=0.0), shot("start", -87.0, 6.0, 48, 13, 150), shot("dust-6", -87.0, 6.0, 47, 13, 90)],
 "shift": VIS + EXPL,
 "run": [run("dustDrift", "start", "s2:start-2", 6), run("dustGlow", "liq", "s2:start-2", 6)],
 "overlay": [sec("chem-hook", "q0", "s2:start-8", "系列 2・第 16 集", "示意，非實際比例", {"prev": "prev", "liq": "liq", "dust": "dust"})]}
P["s1"]["overlay"][0]["at"] = "start+24"
# ─── s2：洗、蝕刻、磨平，三種藥水 ───
P["s2"] = {"zoom": [{"to": "tool", "at": "start-10", "dur": 1}],
 "shot": [shot("start-1", -62.0, 3.2, 46, 16, 1, yaw=0.0), shot("etch-8", -61.0, 3.4, 48, 18, 40)],
 "run": [run("waferSpin", "start", "s3:start-2", 8), run("pourA", "wash-6", "etch-6", 6), run("spreadA", "wash", "etch-6", 6), run("capA", "wash-6", "etch-6", 6),
         run("pourB", "etch-6", "polish-6", 6), run("capB", "etch-6", "polish-6", 6), run("pourC", "polish-6", "name-4", 6), run("capC", "polish-6", "name-4", 6),
         run("capA", "name", "s3:start-1", 8), run("capB", "name", "s3:start-1", 8), run("capC", "name", "s3:start-1", 8)],
 "labels": [lab("jugA", "清洗液", "Clean", "blue", "wash-4", "wash+41"), lab("jugB", "蝕刻液", "Etch", "amber", "etch+25", "etch+70"), lab("jugC", "研磨液", "Slurry", "blue", "name-4", "name+41")],
 "overlay": [sec("chem-kinds", "start+24", "s3:start-8", "三種藥水，各做一件事", "示意", {"wash": "wash", "etch": "etch", "polish": "polish", "name": "name"})]}
# ─── s3：游泳池一小匙 → 管內雜質比例 ───
P["s3"] = {"shot": [shot("start-1", -33.0, 2.4, 40, 26, 1, yaw=0.0), shot("pool-8", -32.5, 2.4, 36, 24, 30), shot("spoon+44", -14.0, 3.0, 52, 14, 1)],
 "run": [run("spoonDrip", "spoon-6", "spoon+34", 4), run("poolRipple", "spoon+10", "spoon+34", 4), run("ionsBlue", "spoon+34", "s4:start-4", 8), run("ionsRed", "spoon+34", "s4:start-4", 8)],
 "labels": [lab("pool", "一座游泳池", "A swimming pool", "blue", "pool-7", "spoon-2"), lab("spoon", "一小匙", "One teaspoon", "amber", "spoon-1", "spoon+44", xy=[839, 1070])],
 "overlay": [sec("chem-pool", "start+20", "s4:start-10", "游泳池裡的一小匙", "示意（自行換算，不是量測）", {"q": "q", "pool": "pool", "spoon": "spoon"})]}
# ─── s4（r2 併回兩幕：s4b 只有 1.9 秒，違反每幕 ≥4.5 秒）：s4 大槽→塑膠管線→管理櫃近景→泵與閥島分開；s4c 爆炸其餘步驟→迴路遠景→旋轉清洗腔 ───
P["s4"] = {"shot": [shot("start-1", 9.0, 6.5, 74, 18, 1, yaw=0.0), shot("start+96", 27.0, 9.0, 64, 20, 12)],
 "run": [run("supFlow", "start", "s4:desk-22", 10), run("tankLevel", "start", "s4:desk-2", 6), run("cdsFlow", DK(-10), "s4c:start+2", 10), run("pumpBeat", DK(-10), "s4c:start+2", 10), run("pumpLed", DK(-10), "s4c:start+2", 8)],
 "labels": [lab("tank", "大宗儲槽", "Bulk tank", "amber", "tank-8", "tank+37", xy=[450, 300]), lab("sup", "塑膠管線", "Plastic piping", "blue", "pipe+2", "pipe+47"),
            lab("cdsTop", "化學品管理櫃", "Chemical cabinet", "amber", "desk-4", "desk+41", xy=[600, 895])],
 "overlay": [sec("chem-path", "start+30", "s5:start-2", "送液路徑：一路過濾、一路循環", "示意（不標流量與壓力）", {"tank": "tank", "pipe": "pipe", "desk": "desk", "water": "s4c:water", "clean": "s4c:clean", "back": R4})]}
# ─── s4c（11-27 第 39 條：爆炸在念的期間做完）：泵與閥島分開→過濾器抽出、濾芯拉出→念完「掉渣」組回，迴路一起流動 ───
P["s4c"] = {"shot": [shot("start+2", 23.5, 7.5, 66, 22, 18, yaw=0.5), shot("start+92", 31.0, 9.5, 62, 22, 18)],
 "run": [run("cdsFlow", R4, "s5:start-4", 10), run("pumpBeat", R4, "s5:start-4", 10), run("pumpLed", R4, "s5:start-4", 8), run("supFlow", R4, "s5:start-4", 10)],
 "labels": [lab("pump", "泵與閥島", "Pump & valve island", "blue", "start+10", "start+55", xy=[300, 980]), lab("cfilter", "過濾器（褶疊濾芯）", "Filter (pleated membrane)", "amber", "start+57", "start+102")]}
# ─── s5：管子用塑膠，不用鐵（酸咬金屬） ───
P["s5"] = {"shot": [shot("start-1", 152.0, 3.8, 60, 16, 1, yaw=0.0), shot("lemon-14", 135.0, 2.8, 46, 16, 34), shot("bite-10", 152.0, 3.8, 56, 18, 36)],
 "run": [run("pfFlow", "start", "s6:start-4", 8), run("irFlow", "start", "s6:start-4", 8), run("lemonDrip", "lemon-4", "bite-12", 6),
         run("irBubbles", "bite", "s6:start-4", 8), run("rustFlow", "bite+20", "s6:start-4", 8), run("rustGlowA", "bite", "s6:start-4", 8)],
 "labels": [lab("pfaP", "塑膠管：乾淨", "Plastic: clean", "blue", "plastic-8", "lemon-3"), lab("cup", "鐵杯", "Iron cup", "amber", "lemon+2", "bite-5"), lab("rustP", "鐵管內壁：被酸溶出", "Iron: dissolved by acid", "amber", "bite+4", "s6:start-14")],
 "overlay": [sec("chem-pipe", "start+24", "s6:start-8", "酸咬金屬", "示意：多數藥水管線用氟塑膠", {"plastic": "plastic", "iron": "iron", "lemon": "lemon", "bite": "bite"})]}
# ─── s6：研磨液＝磨粒＋藥劑 ───
P["s6"] = {"shot": [shot("start-1", 182.0, 5.8, 56, 8, 1, yaw=0.0), shot("grain-6", 183.0, 5.8, 48, 10, 36), shot("sand-12", 182.0, 5.8, 48, 12, 36)],
 "run": [run("brown", "start", "s7b:stir-2", 8), run("drift", "start", "s7b:stir-2", 8), run("padPress", "sand-6", "s7b:stir-2", 8), run("grit", "sand+20", "s7b:stir-2", 8), run("oxIn", "chem-8", "s7b:stir-2", 8)],
 "labels": [lab("slurry", "研磨液（放大）", "Slurry (magnified)", "blue", "slurry+2", "grain-6"), lab("grain", "磨粒", "Abrasive grain", "amber", "grain-2", "grain+43"), lab("bump", "凸起處被磨薄", "High spot gets thinner", "amber", "sand-15", "sand+30"),
            lab("ox", "藥劑溶出氧化層", "Chemistry dissolves oxide", "blue", "sand+32", "s7b:start-6")],
 "overlay": [sec("chem-slurry", "start+24", "s7b:start-8", "磨粒磨、藥劑溶", "示意（不標粒徑與濃度）", {"slurry": "slurry", "grain": "grain", "wash": "wash", "sand": "sand", "chem": "chem", "both": "both"})]}
# ─── s7（拆兩幕，r1）：s7 結塊刮傷；s7b 槽裡攪動、循環過濾（槽組爆炸分解） ───
P["s7b"] = {"shot": [shot("start-1", 181.0, 4.2, 54, 10, 1, yaw=0.0), shot("stir-2", 218.0, 7.5, 92, 16, 1), shot("stir+4", 214.0, 8.0, 76, 20, 24), shot("end-96", 220.0, 7.0, 76, 22, 22)],
 "run": [run("stirSpin", "stir+6", "s8:start-4", 10), run("suspend", "stir+6", "s8:start-4", 10), run("n2Mist", "stir-2", "s8:start-4", 8), run("sedWarn", "stir-2", "loop+4", 6),
         run("sedFlow", "stir+6", "end-92", 8), run("loopA", "loop+2", "s8:start-4", 10), run("catchFx", "end-90", "end-44", 8)],
 "labels": [lab("lumpL", "結塊的大顆粒", "Clumped grain", "amber", "start+6", "lump+30"), lab("scratchL", "刮痕", "Scratch", "amber", "lump+32", "stir-6"),
            lab("sed", "攪拌，結塊被抽走", "Stirred, clumps pulled away", "amber", "stir+2", "end-94", xy=[560, 320]), lab("filt", "過濾", "Filter", "blue", "end-92", "end-46")],
 "overlay": [sec("chem-stir", "start+24", "s8:start-8", "不讓磨粒結塊", "示意", {"lump": "lump", "scratch": "scratch", "stir": "stir", "loop": "loop", "filter": "filter", "soy": "soy"})]}
# ─── s8：公司（英特格、中華化、三福化） ───
P["s8"] = {"zoom": [{"to": "co", "at": "start-1", "dur": 1}], "shot": [shot("start-1", 258.0, 4.6, 72, 14, 1, yaw=0.0)],
 "overlay": [sec("chem-co", "start-4", "s9:start-6", "供應商", "Entegris 官網、經濟日報、Yahoo 股市；截至 11/27", {"intl": "intl", "chc": "chc", "acid": "acid", "sanfu": "sanfu", "dev": "dev"}, h=392, y=1000)]}
# ─── s9：預告研磨墊（一角） ───
P["s9"] = {"zoom": [{"to": "tool", "at": "start-1", "dur": 1}], "shot": [shot("start-1", 292.0, 3.0, 72, 34, 1, yaw=0.0), shot("next-6", 295.0, 2.6, 76, 30, 40)],
 "run": [run("padSpin", "start-6", FAR, 10), run("padDrip", "start", FAR, 6), run("padSpread", "start+10", FAR, 8), run("padRipple", "start+10", FAR, 6)],
 "overlay": [sec("chem-next", "start+24", "s10:start-8", "接下來", "下一集：研磨墊", {"pad": "pad", "next": "next", "kw": "kw"})]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("tool", "濕式化學品送液系統（示意）", "WET CHEMICAL DELIVERY", "120 cm", "10 cm"), lv("co", "濕式化學品供應商", "CHEMICAL SUPPLIERS", "60 cm", "10 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-chem", "prevEpisode": "2-15：特用氣體", "title": "濕式化學品與研磨液（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b",
                 "_說明": "旁白金手指：2.5＋Iapetus＋說明 B 原句；Andy 在 AI Studio 錄音後上傳，用 recording-timeline 接時間軸；本支尚未配音"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["濕式化學品", "怎麼送？"], "sub": "藥水與研磨液", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
    for w in ["FOUP", "EFEM", "負載鎖", "SCARA", "量測"]:
        if w in (s.get("narration") or "") + s["subtitle"]["zh"]: bad.append((s["id"], w))
# 念稿與 script.md 逐字比對（念稿凍結）
md = open(os.path.join(HERE, "script.md"), encoding="utf8").read().split("## 可直接貼 AI Studio 的念稿")[1].split("## 字幕與念稿差異")[0]
md_paras = [p.strip() for p in md.split("\n") if p.strip() and not p.startswith("（") and "每幕之間空一行" not in p]
def grouped():
    g = []
    for s in scenes:
        if not s.get("tts"): continue
        if g and g[-1][0] == s["para"]: g[-1][1] += s["tts"]
        else: g.append([s["para"], s["tts"]])
    return [x[1] for x in g]
mine = grouped()
if md_paras[-len(mine):] != mine: bad.append(("念稿與 script.md 不一致", [m for m in mine if m not in md_paras]))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes], "未使用的層", [l for l in LAYERS if l not in USED and not l.startswith("scr")][:60])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(grouped()))
