"""tech-target 腳本產生器：python3 videos/tech-target/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
濺鍍靶材（科技透明圈 系列 2「代工的供應商」第 13 集；上一集 2-12：台灣自己的設備廠；下一集 2-14：前驅物）。
旁白、cue、字幕、hook、片尾卡、hud、voice 與各幕 3D 動作（shot／shift／run／labels／overlay）都在這支；cue 來自 timeline.json，配音後重跑本檔即可。
2D 卡：src/components/three/HudTarget.tsx（target-*）。構造與物理：physics-spec.md；模組清單：visual-spec.md。
Andy 第 18 條：念稿與字幕不用 FOUP／負載鎖等術語縮寫；第 21、22 條：念稿避開「上」、「量測」寫「測量」。"""
import json, re, os, math, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
SX = INFO["SX"]; DX = INFO["DX"]
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook",
 "前一集說看靶材。靶材到底是什麼？一塊會被打掉原子的金屬板。",
 ["前一集說看靶材", "靶材到底是什麼？", "一塊會被打掉原子", "的金屬板"],
 ["Last time: on to the target.", "What is a target?", "A metal plate whose atoms", "get knocked off."],
 [("prev", "前一集"), ("q", "到底是什麼"), ("plate", "金屬板")],
 ["靶材", "金屬板"], ["應材集濺鍍原理；專利 US6740212 等"]),
("s2", "mechanism",
 "拆開陰極總成。頂端是高壓供電，接著是磁鐵，磁鐵會轉。",
 ["拆開陰極總成", "頂端是高壓供電", "接著是磁鐵", "磁鐵會轉"],
 ["Open the cathode assembly.", "At the top, the high-voltage feed;", "then the magnets,", "and the magnets rotate."],
 [("open", "拆開"), ("hv", "高壓供電"), ("mag", "接著是磁鐵"), ("spin", "會轉")],
 ["高壓", "磁鐵"], ["平面磁控陰極通則；專利 US6740212、US5407551"]),
("s3", "mechanism",
 "底下是冷卻水，專門帶走熱。背板靠一層焊料，跟靶材接在一起。",
 ["底下是冷卻水", "專門帶走熱", "背板靠一層焊料", "跟靶材接在一起"],
 ["Below it, cooling water", "carries the heat away.", "A backing plate, bonded with a solder layer,", "joins the target."],
 [("water", "冷卻水"), ("heat", "帶走熱"), ("back", "背板"), ("solder", "焊料"), ("tgt", "靶材")],
 ["冷卻水", "背板", "焊料"], ["專利 US8342383、US5593082"]),
("s4", "mechanism",
 "最底下是靶材，周圍一圈遮蔽環，只讓正面被打。",
 ["最底下是靶材", "周圍一圈遮蔽環", "只讓正面被打"],
 ["At the bottom, the target,", "with a shield ring around it,", "so only its face gets hit."],
 [("tgt", "靶材"), ("shield", "遮蔽環"), ("face", "正面被打")],
 ["靶材", "遮蔽環"], ["暗區遮蔽環通則（專利文獻有此概念，示意）"]),
("s5", "mechanism",
 "通入氬氣，再加高壓，氬氣被電成電漿，離子被吸向靶材，一撞，金屬原子就飛出來。",
 ["通入氬氣", "再加高壓", "氬氣被電成電漿", "離子被吸向靶材", "一撞金屬原子就飛出來"],
 ["Argon gas flows in,", "high voltage is applied,", "the gas becomes plasma,", "ions are pulled to the target,", "one hit and metal atoms fly out."],
 [("gas", "通入氬氣"), ("volt", "高壓"), ("pla", "電成電漿"), ("ion", "離子被吸向"), ("hit", "一撞"), ("atom", "金屬原子")],
 ["氬氣", "電漿", "原子"], ["專利 US6740212（約 2–5 mTorr、數百伏）；教科書通則"]),
("s6", "mechanism",
 "原子朝前方散開，正前方最多，越斜越少，落到晶圓，堆成一層薄膜。",
 ["原子朝前方散開", "正前方最多", "越斜越少", "落到晶圓", "堆成一層薄膜"],
 ["Atoms spread out ahead,", "most straight ahead,", "fewer the more slanted,", "land on the wafer,", "and build up a thin film."],
 [("spread", "散開"), ("center", "正前方最多"), ("side", "越斜越少"), ("wafer", "落到晶圓"), ("film", "薄膜")],
 ["正前方", "薄膜"], ["專利 US7504006（濺出原子約服從餘弦分布）；示意"]),
("s7", "mechanism",
 "磁鐵把電子困在一圈跑道裡打轉，電漿就集中在這一圈。",
 ["磁鐵把電子", "困在一圈跑道裡打轉", "電漿就集中在這一圈"],
 ["Magnets trap electrons", "circling a racetrack,", "so the plasma stays on this ring."],
 [("elec", "電子"), ("race", "跑道"), ("conc", "電漿就集中")],
 ["電子", "跑道"], ["專利 US6740212、US5407551（磁場把高能電子困住）；示意"]),
("s8", "mechanism",
 "所以這一圈被吃出溝，越吃越深。快見底就得換，一塊大約只用到一成半到四成。",
 ["所以這一圈被吃出溝", "越吃越深", "快見底就得換", "一塊大約只用到", "一成半到四成"],
 ["So this ring wears into a groove,", "deeper and deeper.", "Near the bottom, it must be replaced:", "a block gets used only to about", "15 to 40 percent."],
 [("groove", "吃出溝"), ("deep", "越吃越深"), ("swap", "得換"), ("pct", "一成半到四成")],
 ["吃出溝", "換", "四成"], ["專利 US5407551（平面磁控靶利用率約 15–40%）；示意"]),
("s9", "mechanism",
 "靶材怎麼來？先精煉，再放進真空爐融化，倒成金屬塊，用鍛壓機打實。",
 ["靶材怎麼來？", "先精煉", "再放進真空爐融化", "倒成金屬塊", "用鍛壓機打實"],
 ["Where does a target come from?", "First refining,", "then melting in a vacuum furnace,", "cast into a block,", "and forged dense."],
 [("q", "怎麼來"), ("refine", "精煉"), ("furnace", "真空爐"), ("ingot", "金屬塊"), ("forge", "鍛壓機")],
 ["精煉", "真空爐", "鍛壓"], ["專利 US6451135、US7740717；示意"]),
("s10", "mechanism",
 "接著軋成薄板，再加熱退火，晶粒變細又均勻。再車成圓盤，最後接合到背板。",
 ["接著軋成薄板", "再加熱退火", "晶粒變細又均勻", "再車成圓盤", "最後接合到背板"],
 ["Next, rolled into a thin plate,", "then heated and annealed,", "grains turn fine and even.", "Then turned into a disc,", "and finally bonded to the backing plate."],
 [("roll", "軋成薄板"), ("anneal", "加熱退火"), ("grain", "晶粒變細"), ("lathe", "車成圓盤"), ("bond", "接合")],
 ["軋", "退火", "接合"], ["專利 US6451135、US6478902；示意"]),
("s11", "payoff",
 "日本 JX 金屬，據報約占六成；美國有漢威聯合分出的新公司；台灣有光洋科。",
 ["日本 JX 金屬", "據報約占六成", "美國有漢威聯合", "分出的新公司", "台灣有光洋科"],
 ["Japan's JX Metals,", "reportedly about 60 percent;", "in the US, a company", "spun out of Honeywell;", "in Taiwan, Solar Applied Materials."],
 [("jx", "JX"), ("sixty", "約占六成"), ("us", "美國"), ("tw", "台灣有光洋科")],
 ["日本", "美國", "台灣"], ["技術新報 2026/3/11；Honeywell 新聞稿"]),
("s12", "cta",
 "下一集，更薄的膜改用氣體原料，看前驅物。留言靶材，拿完整資料。",
 ["下一集", "更薄的膜改用氣體原料", "看前驅物", "留言靶材", "拿完整資料"],
 ["Next episode:", "thinner films use gas raw materials,", "so we look at precursors.", "Comment \"target\"", "for the full notes."],
 [("next", "下一集"), ("gas", "氣體原料"), ("pre", "前驅物"), ("kw", "留言")],
 ["氣體原料", "前驅物"], ["示意動畫，不是量測"]),
]
def TTS(t):
    t = t.replace("上集", "上一集").replace("上一一集", "上一集").replace("矽", "細").replace("光罩", "光照")
    t = t.replace("JX", "J X")
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("上百片", "一百多片")]:
        t = t.replace(a, b)  # Andy 11-26 規範第 21 條：念稿避開「上」
    return t
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？]", "", z)) <= 11, (sid, z)
    for c in cues: assert c[1] in nar, (sid, c)
    n = len(re.sub(r"[，。？！、；：\s]", "", nar))
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": max(4.6, round(n / 4.5 - 0.6, 1))}
    if i < len(S) - 1: sc["pauseAfter"] = 0.6
    scenes.append(sc)
DUR = {"s1": 5.8, "s2": 6.4, "s3": 7.2, "s4": 5.4, "s5": 8.2, "s6": 6.6, "s7": 5.6, "s8": 7.8, "s9": 9.0, "s10": 11.0, "s11": 7.0, "s12": 5.6}
for sc in scenes:
    if sc["id"] in DUR: sc["durationSec"] = DUR[sc["id"]]
scenes[1]["pauseAfter"] = 0.7
scenes[0]["props"]["hook"] = {"kicker": "接上集：看濺鍍靶材", "title": "靶材是什麼？", "size": 118, "top": 236}
scenes.append({"id": "s13", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "前驅物", "trail": ["氣體原料"], "comment": "靶材", "logoAnim": "transparent"}}})

# ═════════ 工具 ═════════
FAR = "s13:start+400"
def run(i, at, until=None, ramp=6, **kw):
    d = {"id": i, "at": at, "ramp": ramp}
    if until: d["until"] = until
    d.update(kw); return d
def lab(part, text, en, color, at, until, xy=None, **kw):
    d = {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until}
    if xy: d["xy"] = xy
    d.update(kw); return d
YAW = [0.0]   # 引擎的 shot.yaw 是「增量」且各格累加；這裡改成寫絕對角度（弧度），由程式換算增量（相機繞世界原點轉，遠處的站要保持 0 才不會被甩出畫面）
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
def show(lay, a, b, dur=8):
    """預設藏著的層：a～b 之間顯示（淡入淡出）"""
    return [hid(lay, "s1:start-40", a, dur), hid(lay, b, FAR, dur)]

LAYERS = [l["id"] for l in MODEL["layers"] if not l.get("bg")]
CATH = ["chamber", "gas", "pump", "chuck", "wf", "film1", "film2", "film3", "shield", "ins", "oring1", "oring2", "oring3", "tgt", "solder", "back", "water", "pipes", "mag", "lid", "hv", "plasma", "hitL"]
STA = ["rf", "rfElyt", "rfCath", "rfCathThick", "rfAnode", "fn", "fnCoil", "fnPool", "fnIngot", "fnHot", "ml", "mlRoll", "mlIn", "mlOut", "lt", "ltTab", "ltTool", "ltF1", "ltF2", "ltF3", "bd", "bdBack", "bdS0", "bdS1", "bdS2", "bdPress", "bdHeat"]
DSP = ["dspBase", "tgtDsp", "tgtD0", "tgtD1", "tgtD2", "tgtD3", "tgtWarn", "tgtNew"]
RACK = ["rack", "rkJP", "rkUS", "rkTW"]
for l in CATH + STA + DSP + RACK: assert l in LAYERS, l
VIS = []
T0 = "s1:start-40"
def vis(lay, wins, dur=8):
    """依「可見區間」清單產生隱藏：區間之外全藏（淡入淡出）。區間 (a, b)，a＝T0 表示一開始就看得到；b＝FAR 表示一直看到片尾"""
    prev = T0
    for a, b in wins:
        if a != T0: VIS.append(hid(lay, prev, a, dur))
        prev = b
    if prev != FAR: VIS.append(hid(lay, prev, FAR, dur))
# ── 陰極總成的圖層：每一幕只留要講的（主素材框才不會被不相干的零件撐大，標籤與卡片才找得到空位） ──
ASM = []                                         # s5 組回時只有下半截的零件回來（上半截在 s3 起就退場了，鏡頭只看下面），s12 才全部回來
BACKALL = ("s12:start-8", FAR)
for l in ("hv", "lid", "oring1", "mag"): vis(l, [(T0, "s3:start-6")] + ASM + [BACKALL])
for l in ("water", "pipes"): vis(l, [(T0, "s4:start-6")] + ASM + [BACKALL])
vis("tgt", [(T0, "s8:start-2"), BACKALL])
VIS.append(hid("shield", "s5:start+4", "s5:volt+10", 24, 0.22)); VIS.append(hid("ins", "s5:start+4", "s5:volt+10", 24, 0.25))   # 靶座外殼先淡出，看得到背板在上、靶面朝下
for l in ("back", "solder"): vis(l, [(T0, "s8:start-2"), BACKALL])
for l in ("ins", "oring2", "oring3"): vis(l, [(T0, "s2:open-8"), ("s3:start-6", "s8:start-2"), BACKALL])
vis("shield", [(T0, "s2:open-8"), ("s4:start-6", "s8:start-2"), BACKALL])
for l in ("chamber", "gas"): vis(l, [(T0, "s2:open-8"), ("s5:start-12", "s8:start-2"), BACKALL])
for l in ("chuck", "wf"): vis(l, [(T0, "s2:open-8"), ("s5:start-12", "s8:start-2"), BACKALL])
for l in ("gasEq", "pump"): vis(l, [(T0, "s2:open-8"), BACKALL])
for l in ("plasma", "hitL"): vis(l, [(T0, "s2:open-6"), ("s5:volt-8", "s8:start-2"), BACKALL])
vis("film1", [("s6:wafer-4", "s6:film+20")]); vis("film2", [("s6:film+10", "s6:film+60")]); vis("film3", [("s6:film+50", "s8:start-2"), BACKALL])
# ── 展示台（s8）、處理站（s9～s10：下一站先出現、鏡頭到位後上一站才收，鏡頭平移途中不會是空地板）、展示架（s11） ──
CUTT = lambda sc: f"{sc}:start-4"   # 跨區域換景：鏡頭硬切的那一幀
for l in ("dspBase", "tgtDsp"): vis(l, [("s8:start-16", "s9:start-2")])
vis("tgtD0", [("s8:start-16", "s8:groove-2")]); vis("tgtD1", [("s8:groove-2", "s8:deep-2")]); vis("tgtD2", [("s8:deep-2", "s8:deep+22")]); vis("tgtD3", [("s8:deep+22", "s9:start-2")])
vis("tgtWarn", [("s8:deep+34", "s9:start-2")]); vis("tgtNew", [("s8:swap-14", "s9:start-2")])
for l in ("rf", "rfElyt", "rfCath", "rfAnode"): vis(l, [("s9:start-18", "s9:furnace+34")])
vis("rfCathThick", [("s9:refine+10", "s9:furnace+34")])
for l in ("fn", "fnCoil", "fnIngot", "fnHot"): vis(l, [("s9:furnace-20", "s9:forge+10")])
vis("fnPool", [("s9:furnace-4", "s9:forge+10")])
for l in ("fg", "fgRam"): vis(l, [("s9:forge-24", "s10:roll+40")])
vis("fgIng0", [("s9:forge-24", "s9:forge+16")]); vis("fgIng1", [("s9:forge+12", "s10:roll+40")])
for l in ("ml", "mlRoll", "mlIn"): vis(l, [("s10:start-18", "s10:anneal+40")])
vis("mlOut", [("s10:roll+60", "s10:anneal+40")])
for l in ("an", "anPlate"): vis(l, [("s10:anneal-24", "s10:lathe+40")])
vis("anHot", [("s10:anneal-24", "s10:anneal+120")]); vis("anElem", [("s10:anneal-24", "s10:lathe+40")])
for l in ("lt", "ltTab", "ltTool"): vis(l, [("s10:lathe-24", "s10:bond+40")])
vis("ltF1", [("s10:lathe+30", "s10:bond+40")]); vis("ltF2", [("s10:lathe+62", "s10:bond+40")]); vis("ltF3", [("s10:lathe+94", "s10:bond+40")])
for l in ("bd", "bdBack", "bdPress", "bdHeat"): vis(l, [("s10:bond-24", "s11:start-2")])
vis("bdS0", [("s10:bond-8", "s10:bond+40")]); vis("bdS1", [("s10:bond+30", "s10:bond+60")]); vis("bdS2", [("s10:bond+52", "s11:start-2")])
vis("rack", [("s11:start-18", "s12:start-2")]); vis("rkJP", [("s11:jx-6", "s12:start-2")]); vis("rkUS", [("s11:us-6", "s12:start-2")]); vis("rkTW", [("s11:tw-6", "s12:start-2")])

# ═════════ 爆炸分解（s2～s4）：沿軸線實際分開，一次一張標籤；s5 開頭組回 ═════════
BACK = "s5:start+2"
EXPLODE = [mv("hv", "s2:open-4", BACK, 26, dy=10.0), mv("lid", "s2:open-2", BACK, 26, dy=8.4), mv("oring1", "s2:open-2", BACK, 26, dy=7.6),
           mv("mag", "s2:mag-8", BACK, 28, dy=5.6),
           mv("water", "s3:water-8", BACK, 24, dy=2.8), mv("pipes", "s3:water-8", BACK, 24, dy=2.8), mv("oring2", "s3:water-8", BACK, 24, dy=1.0), mv("ins", "s3:water-4", BACK, 22, dy=0.5), mv("oring3", "s3:water-4", BACK, 22, dy=0.2),
           mv("back", "s3:back-8", BACK, 24, dy=1.4), mv("solder", "s3:solder-8", BACK, 24, dy=0.7),
           mv("shield", "s4:shield-8", BACK, 24, dy=-2.2)]
P = {}
P["s1"] = {"shot": [shot("start-30", 0, 4.2, 74, 22, 1, yaw=-0.2), shot("start", 0.4, 4.4, 66, 24, 120)],
 "shift": VIS + EXPLODE,
 "run": [run("plasmaGlow", "start-30", "s2:start-10", 1), run("magSpin", "start-30", "s2:open-8", 1), run("magShaftSpin", "start-30", "s2:open-8", 1), run("waterFlow", "start-30", "s2:open-8", 1), run("ion0", "start-30", "s2:start-10", 1), run("ion2", "start-30", "s2:start-10", 1), run("ion4", "start-30", "s2:start-10", 1)],
 "overlay": [sec("target-hook", "q", "s2:start-5", "系列 2・第 13 集", "示意，非實際比例", {"prev": "prev", "q": "q", "plate": "plate"})]}
P["s2"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}],
 "shot": [shot("start", 0.2, 9.0, 82, 26, 30, yaw=-0.25), shot("mag-4", 0.2, 11.6, 52, 22, 36)],
 "run": [run("magSpin", "spin-6", "s3:start", 10), run("magShaftSpin", "spin-6", "s3:start", 10), run("drvSpin", "spin-6", "s3:start", 10)],
 "labels": [lab("hv", "高壓接頭", "HV feed", "amber", "hv-2", "mag+12"),
            lab("mag", "磁鐵組", "Magnets", "blue", "mag+14", "s3:start-4")],
 "overlay": [sec("target-top", "start+24", "s3:start-12", "拆開陰極：供電與磁鐵", "示意", {"hv": "hv", "mag": "mag", "spin": "spin"})]}
P["s3"] = {"shot": [shot("start", 0.2, 6.2, 52, 24, 30)],
 "run": [run("waterFlow", "water-6", "s4:start-8", 8)],
 "labels": [lab("water", "冷卻水腔", "Water jacket", "blue", "water-2", "back-4"),
            lab("back", "背板", "Backing", "amber", "back-2", "solder+8"),
            lab("solder", "焊層", "Solder", "blue", "solder+10", "s4:start-4")],
 "overlay": [sec("target-cool", "start+24", "s4:start-5", "熱怎麼被帶走", "示意（溫度不是量測）", {"water": "water", "heat": "heat", "back": "back", "solder": "solder", "tgt": "tgt"})]}
P["s4"] = {"shot": [shot("start", 0.2, 3.2, 38, 16, 30), shot("shield-6", 0.2, 1.8, 26, 14, 30)],
 "labels": [lab("tgt", "靶材", "Target", "amber", "tgt-2", "shield+6"),
            lab("shield", "遮蔽環", "Shield", "blue", "shield+8", "s5:start-4")],
 "overlay": [sec("target-shield", "start+24", "s5:start-14", "靶材與遮蔽環", "示意", {"tgt": "tgt", "shield": "shield", "face": "face"})]}
P["s5"] = {"shot": [shot("start", 0.0, 2.5, 50, 6, 30, yaw=-0.2), shot("pla-6", 0.0, 2.3, 36, 4, 36)],
 "run": [run(f"gas{i}", "gas-4", "s6:start", 8) for i in range(4)] + [run("plasmaGlow", "pla-8", "s8:start-8", 8)] + [run(f"ion{i}", "ion-6", "s8:start-8", 6) for i in range(6)] + [run("hitGlow", "hit-2", "s8:start-8", 6)] + [run(f"atom{i}", "atom-2", "s8:start-8", 6) for i in range(21)],
 "labels": [lab("gas", "氬氣入口", "Argon in", "blue", "gas-2", "pla-14"),
            lab("plasma", "電漿環", "Plasma ring", "amber", "pla-12", "ion+24"),
            lab("ion", "氬離子", "Ar ions", "blue", "ion+26", "hit+30"),
            lab("hit", "撞擊點", "Impact", "amber", "hit+32", "s6:start-4")],
 "overlay": [sec("target-sect", "start+40", "s6:start-5", "陰極剖面", "示意（非實機尺寸）", {"gas": "gas", "volt": "volt", "pla": "pla", "ion": "ion", "hit": "hit", "atom": "atom"})]}
P["s6"] = {"shot": [shot("start", 0.0, 2.0, 40, 8, 30), shot("wafer-6", 0.0, 1.3, 28, 14, 28)],
 "run": [run("atomScat", "spread", "s8:start-8", 6)],
 "labels": [lab("atom", "金屬原子", "Atoms", "amber", "spread-2", "wafer-4"),
            lab("wafer", "晶圓", "Wafer", "blue", "wafer-2", "s7:start-4")],
 "overlay": [sec("target-cos", "start+24", "s7:start-5", "原子往哪裡飛", "示意", {"spread": "spread", "center": "center", "side": "side", "wafer": "wafer", "film": "film"})]}
P["s7"] = {"shot": [shot("start", 0.0, 1.9, 40, 9, 30, yaw=-0.35)],
 "run": [run(f"field{i}", "race-6", "s8:start-8", 6) for i in range(4)] + [run("elec", "elec-4", "s8:start-8", 6)],
 "labels": [lab("elec", "電子", "Electrons", "amber", "elec-2", "race+8"),
            lab("field", "磁場線", "Field lines", "blue", "race+10", "s8:start-14")],
 "overlay": [sec("target-race", "start+24", "s8:start-14", "磁場跑道（由上往下看）", "示意", {"elec": "elec", "race": "race", "conc": "conc"})]}
P["s8"] = {"shot": [shot("start-4", DX, 0.4, 40, 30, 1, yaw=0.0)],
 "shift": [mv("tgtDsp", "swap-6", FAR, 30, dy=2.8, opacity=0), mv("tgtD3", "swap-6", FAR, 30, dy=2.8, opacity=0), mv("tgtWarn", "swap-6", FAR, 30, dy=2.8, opacity=0), mv("tgtNew", "s1:start-40", "swap+2", 30, dy=2.8, opacity=0)],
 "labels": [lab("dsp", "用過的靶", "Used target", "amber", "groove-2", "deep+22"),
            lab("groove", "侵蝕溝", "Groove", "blue", "deep+24", "swap+15"),
            lab("newT", "新靶材", "New target", "amber", "swap+17", "s9:start-14")],
 "overlay": [sec("target-groove", "start+24", "s9:start-14", "侵蝕溝一路變深", "示意（深度不是量測）", {"groove": "groove", "deep": "deep", "swap": "swap", "pct": "pct"})]}
P["s9"] = {"zoom": [{"to": "line", "at": "start-4", "dur": 1}], "shot": [shot("start-4", SX["rf"] + 0.8, 1.0, 34, 24, 1), shot("furnace-8", SX["fn"] + 0.6, 1.5, 40, 22, 36), shot("forge-12", SX["fg"] + 0.4, 2.2, 40, 20, 36)],
 "run": [run(f"rfIon{i}", "refine", "furnace+20", 6) for i in range(3)] + [run("fnPoolGlow", "furnace-4", "forge+10", 8)],
 "shift": [mv("fnIngot", "ingot-10", FAR, 66, dy=-0.9), mv("fnHot", "ingot-10", FAR, 66, dy=-0.9), mv("fgRam", "forge+6", "forge+20", 9, dy=-1.3), mv("fgRam", "forge+36", "forge+48", 9, dy=-1.3)],
 "labels": [lab("rfTank", "精煉槽", "Refining cell", "blue", "refine-2", "furnace+14"),
            lab("furnace", "真空爐", "Vacuum furnace", "amber", "furnace+16", "forge-6"),
            lab("forge", "鍛壓機", "Forging press", "blue", "forge-4", "s10:start-14")],
 "overlay": [sec("target-line", "start+24", "s10:start-14", "靶怎麼做：前半段", "示意（不標溫度、道次）", {"q": "q", "refine": "refine", "furnace": "furnace", "ingot": "ingot", "forge": "forge"})]}
P["s10"] = {"shot": [shot("start", SX["ml"] + 0.4, 2.2, 34, 22, 36), shot("anneal-17", SX["an"], 1.4, 36, 20, 36), shot("lathe-17", SX["lt"], 1.8, 30, 32, 38), shot("bond-17", SX["bd"], 2.0, 30, 22, 38)],
 "run": [run("rollRU", "roll-4", "anneal-4", 8), run("rollRL", "roll-4", "anneal-4", 8), run("rollBU", "roll-4", "anneal-4", 8), run("rollBL", "roll-4", "anneal-4", 8), run("mlTable", "roll-4", "anneal-4", 8), run("mlSpray", "roll-4", "anneal-4", 6), run("anHeat", "anneal-6", "lathe-4", 12),
         run("ltSpin", "lathe-6", "bond-4", 10), run("ltCool", "lathe+10", "bond-4", 6)] + [run(f"ltChip{i}", "lathe+14", "bond-4", 6) for i in range(3)] + [run("bdHeat", "bond-10", FAR, 12)],
 "shift": [mv("mlIn", "s1:start-40", "roll+4", 70, dx=-3.2), hid("mlIn", "roll+66", FAR, 6), mv("mlOut", "roll+60", FAR, 80, dx=1.5),
           mv("ltTool", "lathe+8", FAR, 110, dx=1.9), mv("bdPress", "s1:start-40", "bond+34", 44, dy=3.2)],
 "labels": [lab("mill", "軋機", "Rolling mill", "amber", "roll-2", "anneal-10"),
            lab("anneal", "退火爐", "Annealing furnace", "blue", "anneal-8", "lathe-14"),
            lab("lathe", "立式車床", "Vertical lathe", "amber", "lathe-12", "bond-4"),
            lab("bond", "壓合台", "Bonding press", "blue", "bond-2", "s11:start-14")],
 "overlay": [sec("target-grain", "start+24", "s11:start-14", "靶怎麼做：後半段", "示意（晶粒大小示意）", {"roll": "roll", "anneal": "anneal", "grain": "grain", "lathe": "lathe", "bond": "bond"})]}
P["s11"] = {"zoom": [{"to": "co", "at": "start-4", "dur": 1}], "shot": [shot("start-4", 0, 2.0, 44, 12, 1)],
 "labels": [lab("rkJX", "JX 金屬", "Japan", "amber", "jx-2", "us-6", flag="JP"),
            lab("rkSol", "Solstice", "United States", "blue", "us-2", "tw-10", flag="US"),
            lab("rkSolar", "光洋科 1785", "Taiwan", "amber", "tw-8", "s12:start-8", flag="TW")],
 "overlay": [sec("target-co", "start+24", "s12:start-14", "做靶材的公司", "技術新報、公司新聞稿、公司資料", {"jx": "jx", "sixty": "sixty", "us": "us", "tw": "tw"}, h=360, y=1040)]}
P["s12"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}], "shot": [shot("start-4", 0.4, 4.4, 74, 24, 1, yaw=-0.2)],
 "run": [run(f"gas{i}", "gas", FAR, 8) for i in range(4)],
 "overlay": [sec("target-next", "start+24", "s13:start-5", "接下來", "下一集：前驅物", {"next": "next", "gas": "gas", "pre": "pre", "kw": "kw"})]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("tool", "平面磁控陰極總成（示意）", "PLANAR MAGNETRON CATHODE", "60 cm", "10 cm"), lv("line", "靶材怎麼做（示意）", "HOW A TARGET IS MADE", "60 cm", "10 cm"), lv("co", "做靶材的公司", "TARGET MAKERS", "60 cm", "10 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-target", "prevEpisode": "2-12：台灣自己的設備廠", "title": "濺鍍靶材（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
                 "_說明": "旁白金手指：2.5＋Iapetus＋說明 B（捲舌音要念清楚）；音高關卡 tts-pitch-take.sh（120～135 Hz）；本支尚未配音"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["靶材", "是什麼？"], "sub": "濺鍍靶材", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
BANNED = ["FOUP", "EFEM", "負載鎖", "SCARA", "量測"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9A-Za-z]", t.replace("J X", "")): bad.append((s["id"], "數字或英文"))
    for w in BANNED:
        if w in (s.get("narration") or "") + s["subtitle"]["zh"]: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] + s.get("pauseAfter", 0) for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
