"""tech-lam 腳本產生器：python3 videos/tech-lam/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
設備五大-3：科林研發（蝕刻）（科技透明圈 系列「代工的供應商」第 9 集；上一集設備五大-2：應用材料（結尾：把多的刻掉，下一集看科林研發）；
下一集設備五大-4：東京威力科創（主軸批次爐管、塗佈顯影））。
旁白、cue、字幕、hook、片尾卡、hud、voice 與各幕 3D 動作（shot／shift／run／kin／labels／overlay）都在這支；cue 來自 timeline.json，配音後重跑本檔即可。
2D 卡：src/components/three/HudLam.tsx（lam-*）。構造與物理：physics-spec.md；模組清單：visual-spec.md。"""
import json, re, os, math, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]; FAC = INFO["FACETS"]
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook",
 "上集說把多的刻掉，怎麼刻？科林研發的蝕刻機，又直又深。",
 ["上集說把多的刻掉", "怎麼刻？", "科林研發的蝕刻機", "又直又深"],
 ["Last time: etch away the excess.", "But how?", "Lam Research's etch tools,", "straight and deep."],
 [("prev", "把多的刻掉"), ("how", "怎麼刻"), ("lam", "科林研發"), ("deep", "又直又深")],
 ["蝕刻", "科林研發"], ["科林研發官網；Lam 新聞稿（Sense.i 2020/3/3）"]),
("s2", "mechanism",
 "中間是真空傳送腔，手臂先加速再減速，把晶圓送進蝕刻腔。",
 ["中間是真空傳送腔", "手臂先加速再減速", "把晶圓送進蝕刻腔"],
 ["In the middle: a vacuum transfer chamber.", "The arm speeds up, then slows down,", "and sets the wafer into an etch chamber."],
 [("mid", "真空傳送腔"), ("arm", "手臂"), ("acc", "先加速"), ("dec", "再減速"), ("put", "送進蝕刻腔")],
 ["傳送腔", "蝕刻腔"], ["Lam Sense.i 新聞稿；集群設備專利（示意佈局）"]),
("s3", "mechanism",
 "我們拆開一個腔，最上面是一圈圈的線圈，下面是陶瓷做的窗，再下面是靜電吸盤，最外圈是邊緣環。",
 ["我們拆開一個腔", "最上面是一圈圈的線圈", "下面是陶瓷做的窗", "再下面是靜電吸盤", "最外圈是邊緣環"],
 ["Let's open one chamber.", "On top: rings of coil,", "below that, a ceramic window,", "then the electrostatic chuck,", "and the edge ring around it."],
 [("open", "拆開"), ("coil", "線圈"), ("win", "陶瓷做的窗"), ("esc", "靜電吸盤"), ("ring", "邊緣環")],
 ["線圈", "靜電吸盤", "邊緣環"], ["Lam 專利 US9384948、US10056231"]),
("s4", "mechanism",
 "射頻穿過陶瓷窗，把氣體點成會發光的電漿。",
 ["射頻穿過陶瓷窗", "把氣體點成", "會發光的電漿"],
 ["RF power passes through the window,", "turning the gas into", "a glowing plasma."],
 [("rf", "射頻"), ("gas", "氣體"), ("glow", "發光的電漿")],
 ["射頻", "電漿"], ["Lam 專利 US9053908；電漿蝕刻通則"]),
("s5", "mechanism",
 "吸盤加上偏壓，離子被往下加速，幾乎垂直撞向晶圓。",
 ["吸盤加上偏壓", "離子被往下加速", "幾乎垂直撞向晶圓"],
 ["A bias is applied to the chuck,", "ions accelerate downward", "and strike the wafer almost vertically."],
 [("bias", "偏壓"), ("ion", "離子"), ("down", "往下加速"), ("hit", "垂直撞向")],
 ["偏壓", "離子"], ["反應性離子蝕刻通則（physics-spec 3.1）"]),
("s6", "mechanism",
 "自由基到處亂飛負責反應，產物變成氣體，被泵抽走。",
 ["自由基到處亂飛", "負責反應", "產物變成氣體", "被泵抽走"],
 ["Radicals wander everywhere", "and drive the chemistry;", "the products turn into gas", "and get pumped away."],
 [("rad", "自由基"), ("react", "負責反應"), ("gas", "變成氣體"), ("pump", "被泵抽走")],
 ["自由基", "抽走"], ["電漿蝕刻通則；JVSTA 計算研究"]),
("s7", "mechanism",
 "孔壁長一層保護膜，所以只往下刻，不往旁邊啃。",
 ["孔壁長一層保護膜", "所以只往下刻", "不往旁邊啃"],
 ["A protective film grows on the hole walls,", "so it etches only downward,", "not sideways."],
 [("wall", "孔壁"), ("film", "保護膜"), ("down", "只往下刻"), ("side", "不往旁邊")],
 ["保護膜", "往下"], ["側壁鈍化通則（physics-spec 3.2）"]),
("s8", "mechanism",
 "記憶孔的深度是寬度的一百倍以上，越深越難刻。",
 ["記憶孔的深度", "是寬度的一百倍以上", "越深越難刻"],
 ["A memory hole is over", "a hundred times deeper than wide;", "the deeper it gets, the harder."],
 [("hole", "記憶孔"), ("ratio", "一百倍以上"), ("hard", "越深越難刻")],
 ["記憶孔", "一百倍"], ["Lam Cryo 3.0 新聞稿；SemiEngineering"]),
("s9", "twist",
 "科林說，晶圓冷到零下幾十度，孔更直，速度快兩倍以上。",
 ["科林說", "晶圓冷到零下幾十度", "孔更直", "速度快兩倍以上"],
 ["Lam says that chilling the wafer", "to tens of degrees below zero", "makes holes straighter", "and etching over twice as fast."],
 [("say", "科林說"), ("cold", "零下幾十度"), ("str", "孔更直"), ("fast", "兩倍以上")],
 ["零下", "兩倍"], ["Lam Cryo 3.0 新聞稿（公司說法）；EE Times Japan"]),
("s10", "mechanism",
 "更細的用原子層蝕刻，改質、沖洗、移除、再沖洗，一圈只剝一層原子。",
 ["更細的用原子層蝕刻", "改質、沖洗", "移除、再沖洗", "一圈只剝一層原子"],
 ["Finer work uses atomic layer etching:", "modify, purge,", "remove, purge again —", "one atomic layer per cycle."],
 [("ale", "原子層蝕刻"), ("mod", "改質"), ("rm", "移除"), ("one", "一層原子")],
 ["原子層蝕刻", "一層"], ["Kanarik 等（Lam）；JVSTA 35 031306"]),
("s11", "payoff",
 "科林研發是美國公司，全球第三大設備商，台灣從新竹到高雄都有據點。",
 ["科林研發是美國公司", "全球第三大設備商", "台灣從新竹到高雄", "都有據點"],
 ["Lam Research is a US company,", "the world's No. 3 chip-equipment maker,", "with sites in Taiwan", "from Hsinchu to Kaohsiung."],
 [("us", "美國公司"), ("no3", "第三大"), ("tw", "新竹到高雄")],
 ["美國", "第三大", "新竹"], ["Lam 10-K；TechInsights；TechNews 2024/12/23"]),
("s12", "cta",
 "刻之前，光阻得先塗好、顯影好，下一集看東京威力科創。留言科林，拿完整資料。",
 ["刻之前", "光阻得先塗好、顯影好", "下一集看東京威力科創", "留言科林，拿完整資料"],
 ["Before etching,", "the resist must be coated and developed.", "Next: Tokyo Electron.", "Comment \"科林\" for the full notes."],
 [("before", "刻之前"), ("coat", "塗好"), ("next", "東京威力科創"), ("kw", "留言科林")],
 ["光阻", "東京威力科創"], ["示意動畫，不是量測"]),
]
SUBST = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
def TTS(t):
    t = t.replace("上集", "上一集")
    for r in SUBST:
        if r["from"] != "上集": t = t.replace(r["from"], r["to"])
    return t
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for c in cues: assert c[1] in nar, (sid, c)
    n = len(re.sub(r"[，。？！、；：\s]", "", nar))
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": max(4.6, round(n / 4.5 - 0.6, 1))}
    if i < len(S) - 1: sc["pauseAfter"] = 0.6
    scenes.append(sc)
scenes[0]["props"]["hook"] = {"kicker": "接上集：把多的刻掉", "title": "怎麼刻掉多的？", "size": 120, "top": 236}
scenes.append({"id": "s13", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "東京威力科創", "trail": ["爐管", "塗佈顯影"], "comment": "科林", "logoAnim": "transparent"}}})

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
YAW = [INFO.get("_", 0) or 0.0]   # 目前累積的鏡頭 yaw 增量（shot 的 yaw 是增量，這裡用「目標總角」換算）
def shot(at, x, y, d, elev, dur=30, yaw_to=None):
    o = {"at": at, "dur": dur, "x": x, "y": y, "d": d, "elev": elev}
    if yaw_to is not None:
        inc = yaw_to - YAW[0]
        if abs(inc) > 1e-4: o["yaw"] = round(inc, 4)
        YAW[0] = yaw_to
    return o
def hid(lay, a, b, dur=10, o=0): return {"layer": lay, "at": a, "until": b, "opacity": o, "dur": dur}
def mv(lay, a, b, dur=22, **kw):
    d = {"layer": lay, "at": a, "until": b, "dur": dur}; d.update(kw); return d
def sec(kind, at, until, title, tag, t=None, y=1066, h=330, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag}
    if t is not None: d["t"] = {k: {"at": v} for k, v in t.items()}
    d.update(kw); return d
def add(c, n):
    m = re.match(r"([^+-]+)([+-]\d+)?$", c); k = int(m.group(2) or 0) + n
    return f"{m.group(1)}{'+' if k >= 0 else '-'}{abs(k)}"
pol = lambda a, r: (r * math.cos(math.radians(a)), r * math.sin(math.radians(a)))
PM = INFO["PM"]; HAR = INFO["HAR"]
X1 = PM["pm1"][0] - 0.7      # pm1（0°）在總 yaw＝0 時位於螢幕 x≈10.4
X4 = PM["pm4"][0] + 0.7      # pm4（180°）用同一個 yaw，從另一側看
NSEG = HAR["NSEG"]
SX = lambda x, z=3.0: round(x * math.cos(-0.3) + z * math.sin(-0.3), 2)   # 模型基礎 yaw −0.3：世界座標 → 鏡頭的 x

# ═════════ 全片可見度 ═════════
H2 = INFO["H2"]; AXL = INFO["ALEX"]
VIS = [hid("pm1Glow", "s1:start-40", "s4:glow-6", 12), hid("pm1Mask", "s1:start-40", "s4:start", 8)]
# 剖面塊（s8）：12 節依時間一節一節出現，間隔越來越長（越深越慢）
HOLE_OFF = [0, 6, 12, 19, 27, 36, 46, 57, 69, 82, 96, 110]
for k, o in enumerate(HOLE_OFF): VIS.append(hid(f"hole{k}", "s1:start-40", add("s8:start-4", o), 8))
# 單孔放大（s7）：孔一節節往下；保護膜晚一節才長上去（孔底永遠沒有膜＝被離子打掉）
H2_AT = ["s7:start-2", "s7:wall+10", "s7:film", "s7:film+18", "s7:down", "s7:side"]
for k, a in enumerate(H2_AT):
    VIS.append(hid(f"h2s{k}", "s1:start-40", a, 8))
    VIS.append(hid(f"h2p{k}", "s1:start-40", add(H2_AT[k + 1], 6) if k + 1 < len(H2_AT) else FAR, 12))
# ALE 原子格（s10）：兩圈，每圈 44 幀：改質 12 → 沖洗 8 → 移除 12（變色那層往上飛走）→ 沖洗 8
ALE = INFO["ALE"]; C0 = "s10:mod-6"; ALE_RUN = []
for c in range(2):
    b = add(C0, c * 44)
    VIS += [hid(f"aleG{c}", "s1:start-40", add(b, 8), 6), hid(f"aleL{c}", add(b, 8), FAR, 4),
            mv(f"aleG{c}", add(b, 24), FAR, 12, dy=1.6), hid(f"aleG{c}", add(b, 28), FAR, 8)]
    ALE_RUN += [run(ALE["CL"][c], b, add(b, 12), 4), run(ALE["P"][c], add(b, 12), add(b, 20), 4), run(ALE["AR"][c], add(b, 20), add(b, 32), 4), run(ALE["P"][c], add(b, 32), add(b, 40), 4)]

# ═════════ s2 真空手臂（關節鏈 kin）：裝載閘取片 → 縮回 → 轉向（先加速再減速）→ 伸進 pm1 → 放到升降銷 → 刀片退出 → 吸盤升起托住 ═════════
def pose(a, al): return {"j1": round(-a + al, 2), "j2": round(-2 * al, 2), "j3": round(al, 2)}
def alpha_for(dist): return round(math.degrees(math.acos((dist - INFO["BL"]) / (2 * INFO["L1"]))), 2)
DLL = INFO["AP"] + 0.8 + 2.2; DPM = INFO["AP"] + 0.8 + INFO["RR"]
A_LL, A_PM = alpha_for(DLL), alpha_for(DPM)     # 伸到吸盤正中央（放片偏差 0）
FOLD = 85
KIN0 = {"arm": "vr", "at": "s1:start-40", "keys": [[0, {**pose(FAC["llL"], FOLD), "lift": 0}]]}
K2 = "s2:start+12"
keys2 = [[0, {**pose(FAC["llL"], FOLD), "lift": 0}], [20, pose(FAC["llL"], A_LL)], [26, {"lift": 0.02}], [34, {"lift": 0.22}],
         [52, pose(FAC["llL"], FOLD)], [86, pose(FAC["pm1"], FOLD)], [106, pose(FAC["pm1"], A_PM)], [112, {"lift": 0.02}], [122, {"lift": -0.15}],
         [142, pose(FAC["pm1"], FOLD)], [152, {"lift": 0}]]
KIN2 = {"arm": "vr", "at": K2, "keys": keys2, "carry": [{"layer": "wf", "grab": 26, "release": 112}]}
S2 = [mv("vd_llL", "s1:start-40", add(K2, 56), 10, dy=-1.2),
      mv("vd_pm1", add(K2, 70), add(K2, 146), 10, dy=-1.2),
      mv("pm1Esc", "s1:start-40", add(K2, 144), 16, dy=-0.7), mv("pm1Ring", "s1:start-40", add(K2, 144), 16, dy=-0.7)]

# ═════════ s3 爆炸分解（pm1）：拆機順序每段錯開 6 幀；「邊緣環」念到後開始組回（18 幀緩入緩出），組好停住再移鏡 ═════════
EXP_A, EXP_B = "s3:open-4", "s3:ring+2"
EXPLODE = [mv("pm1Lid", EXP_A, EXP_B, 18, dy=5.0), mv("pm1Coil", add(EXP_A, 6), EXP_B, 18, dy=3.6),
           mv("pm1Win", add(EXP_A, 12), EXP_B, 18, dy=2.2), mv("pm1Ring", add(EXP_A, 18), EXP_B, 18, dy=1.0),
           mv("pm1Pump", add(EXP_A, 24), EXP_B, 18, dy=-1.2),
           hid("pm1Body", add(EXP_A, -2), EXP_B, 14, 0.12)]
# ═════════ 剖開 ═════════
CUT = [hid("pm1Pump", "s2:put-34", "s3:start-8", 12), hid("pm1Body", "s2:put-34", "s3:open-6", 12, 0.04), hid("pm1Lid", "s2:put-34", "s3:open-6", 12, 0.0),
       hid("pm1Body", "s4:start+14", "s7:start-8", 14, 0.08), hid("pm1Lid", "s4:start+14", "s7:start-8", 14, 0.0),
       hid("pm4Body", "s9:start-14", "s10:start-14", 14, 0.12), hid("pm4Lid", "s9:start-14", "s10:start-14", 14, 0.0),
       hid("tcLid", "s2:start-12", "s3:start-6", 12, 0.0),
       hid("pm1Pump", "s4:start+14", "s6:start-8", 12)]
# ═════════ 焦點窗接力：鏡頭推近時焦點以外的模組淡出（相鄰兩窗都不是焦點就一直保持淡出）═════════
ALL = [l["id"] for l in MODEL["layers"] if not l.get("bg")]
isS2 = lambda l: l in ("tc", "vr", "wf", "main", "llL", "llLDoor", "llLLid", "v_llL", "vd_llL", "v_pm1", "vd_pm1") or l.startswith("pm1")
isPM1 = lambda l: l.startswith("pm1") or l in ("wf", "vd_pm1", "v_pm1")
isPM4 = lambda l: l.startswith("pm4")
isHAR = lambda l: l == "har" or l.startswith("hole")
isH2 = lambda l: l == "har2" or l.startswith("h2")
isALE = lambda l: l.startswith("ale")
isPM1v = lambda l: isPM1(l) or l == "vr"
WIN = [(isS2, "s2:start-6", "s2:put-34"), (isPM1v, "s2:put-34", "s3:start-2"), (isPM1, "s3:start-2", "s7:start-10"), (isH2, "s7:start-10", "s8:start-10"), (isHAR, "s8:start-10", "s9:start-18"),
       (isPM4, "s9:start-18", "s10:start-18"), (isALE, "s10:start-18", "s11:start+24"), (isHAR, "s12:start-2", FAR)]
FOCUS = []
for l in ALL:
    span = None
    for pred, a, b in WIN:
        if pred(l):
            if span: FOCUS.append({"layer": l, "at": span[0], "until": span[1], "opacity": 0, "dur": 14}); span = None
            continue
        if span and span[1] == a: span[1] = b
        else:
            if span: FOCUS.append({"layer": l, "at": span[0], "until": span[1], "opacity": 0, "dur": 14})
            span = [a, b]
    if span: FOCUS.append({"layer": l, "at": span[0], "until": span[1], "opacity": 0, "dur": 14})

P = {}
# s1：整台平台（前端 EFEM 正面銘板、三個 FOUP、六角傳送腔、四個蝕刻腔、後面氣櫃與射頻櫃）
P["s1"] = {"shot": [shot("start-30", 0, -1.3, 182, 28, 1, yaw_to=0.0), shot("start", 0, -1.3, 175, 30, 90)],
 "shift": VIS + S2 + EXPLODE + CUT + FOCUS, "kin": [KIN0],
 "run": [run("status", "start-30", FAR, 1), run("tower", "start-30", FAR, 1), run("ffuAir", "start-30", "s3:start", 1), run("ccpGlow", "start-30", "s3:start", 1), run("chillFlow", "start-30", "s3:start", 1)],
 "labels": [lab("sign", "科林研發", "Lam Research", "amber", "lam", "s2:start-4", logo="lam")],
 "overlay": [sec("lam-hook", "how", "s2:start-5", "設備五大-3", "示意佈局，非實際機型", {"prev": "prev", "how": "how", "lam": "lam", "deep": "deep"})]}
# s2：俯角看進傳送腔（蓋子淡出）→ 結尾切近 pm1 看升降銷接片、刀片退出、吸盤升起
P["s2"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}],
 "shot": [shot("start-4", 3.5, 4.0, 84, 62, 30, yaw_to=0.0), shot("put-30", X1 - 1.2, 3.6, 60, 30, 26)], "kin": [KIN2],
 "run": [run("llReady", "start-30", "s3:start", 4)],
 "labels": [lab("vr", "真空手臂（型式示意）", "Vacuum robot", "amber", "arm-4", "put-32"), lab("wafer", "升降銷接片", "Lift pins", "blue", "put-2", "s3:start-6")],
 "overlay": [sec("lam-move", "start+2", "s3:start-5", "手臂搬運", "示意", {"mid": "mid", "arm": "arm", "acc": "acc", "dec": "dec", "put": "put"})]}
P["s3"] = {"shot": [shot("start-8", X1, 4.6, 100, 14, 34)],
 "labels": [lab("coil", "線圈（內外兩組）", "Coil", "amber", "coil-6", "win-8"), lab("win", "介電窗（陶瓷）", "Dielectric window", "blue", "win-6", "esc-8"),
            lab("esc", "靜電吸盤", "Electrostatic chuck", "amber", "esc-6", "ring-8"), lab("ring", "邊緣環", "Edge ring", "blue", "ring-6", "s4:start+12")],
 "overlay": [sec("lam-stack", "start+6", "s4:start-5", "蝕刻腔拆開", "示意", {"open": "open", "coil": "coil", "win": "win", "esc": "esc", "ring": "ring"})]}
P["s4"] = {"shot": [shot("start", X1, 3.7, 40, 10, 26)],
 "run": [run("coilHot", "rf-4", "s7:start", 10), run("match1", "rf-4", "s7:start", 6), run("gasIn", "start+20", "s7:start", 8), run("icpGlow", "glow-6", "s7:start", 12)],
 "labels": [lab("plasma", "電漿（顏色示意）", "Plasma", "blue", "glow", "s5:start-4")],
 "overlay": [sec("lam-plasma", "start+2", "s5:start-5", "點亮電漿", "示意", {"rf": "rf", "gas": "gas", "glow": "glow"})]}
P["s5"] = {"shot": [shot("start-2", X1, 3.7, 40, 6, 30)],
 "run": [run(f"ion{i}", "ion-4", "s7:start", 8) for i in range(5)],
 "labels": [lab("wafer", "離子垂直往下", "Ions accelerate down", "amber", "ion", "s6:start-10")],
 "overlay": [sec("lam-ion", "start+2", "s6:start-5", "離子往下加速", "示意", {"bias": "bias", "ion": "ion", "down": "down", "hit": "hit"})]}
P["s6"] = {"shot": [shot("start-2", X1, 1.8, 55, 8, 32)],
 "run": [run(f"rad{i}", "rad-6", "s7:start", 8) for i in range(6)] + [run(f"byp{i}", "gas-4", "s7:start", 8) for i in range(4)] + [run("turbo", "start", "s7:start+10", 20)],
 "labels": [lab("rad", "自由基（亂飛）", "Radicals", "amber", "rad+8", "gas-8"), lab("pump", "渦輪分子泵", "Turbo pump", "blue", "gas-6", "s7:start-12")],
 "overlay": [sec("lam-rad", "start+2", "s7:start-5", "自由基與產物", "示意", {"rad": "rad", "react": "react", "gas": "gas", "pump": "pump"})]}
# s7：推近單孔剖面（放大示意）：孔一節節往下、孔壁長保護膜、孔底被離子打掉
P["s7"] = {"shot": [shot("start-10", SX(H2["X"]), 2.6, 68, 6, 22)],
 "run": [run("h2Ion0", "start", "film", 6), run("h2Byp0", "start+6", "film", 6), run("h2Ion1", "film", "down", 6), run("h2Byp1", "film", "down", 6), run("h2Ion2", "down", "s8:start", 6), run("h2Byp2", "down", "s8:start", 6)],
 "labels": [lab("h2wall", "孔壁保護膜", "Sidewall film", "amber", "film+4", "s8:start-12")],
 "overlay": [sec("lam-wall", "start+2", "s8:start-5", "側壁保護膜", "放大示意", {"wall": "wall", "film": "film", "down": "down", "side": "side"})]}
P["s8"] = {"shot": [shot("start-10", SX(HAR["HX"]), 1.4, 104, 4, 18)],
 "run": [run("harIon0", "start", "start+19", 6), run("harByp0", "start", "start+19", 6), run("harIon1", "start+19", "start+46", 6), run("harByp1", "start+19", "start+46", 6),
         run("harIon2", "start+46", "start+82", 6), run("harByp2", "start+46", "start+82", 6), run("harIon3", "start+82", "s9:start", 6), run("harByp3", "start+82", "s9:start", 6)],
 "labels": [lab("harHole", "深是寬的百倍", "Aspect ratio >100:1", "blue", "ratio-4", "s9:start-22")],
 "overlay": [sec("lam-har", "start+2", "s9:start-5", "記憶孔變深", "比例示意", {"hole": "hole", "ratio": "ratio", "hard": "hard"})]}
P["s9"] = {"shot": [shot("start-18", X4, 3.05, 38, 10, 24)],
 "run": [run("cryoGlow", "start", "s10:start", 10), run("cryoEsc", "cold-6", "s10:start", 8), run("cryoVapor", "cold-4", "s10:start", 8)],
 "labels": [lab("pm4", "低溫蝕刻腔", "Cryogenic etch", "blue", "start+6", "cold-6"), lab("escB4", "低溫吸盤", "Cryo chuck", "amber", "cold-4", "s10:start-20")],
 "overlay": [sec("lam-cryo", "start+2", "s10:start-5", "低溫蝕刻", "公司說法；溫度示意", {"say": "say", "cold": "cold", "str": "str", "fast": "fast"})]}
# s10：推近原子格（概念圖）：兩圈改質 → 沖洗 → 移除 → 沖洗，一圈剝掉一層
P["s10"] = {"shot": [shot("start-20", 16, 2.0, 120, 14, 12), shot("start-8", SX(AXL), -2.8, 60, 14, 16)], "run": ALE_RUN,
 "labels": [lab("ale", "一圈一層", "One layer per cycle", "amber", "one-4", "s11:start-4")],
 "overlay": [sec("lam-ale", "start+2", "s11:start-5", "原子層蝕刻", "概念圖", {"ale": "ale", "mod": "mod", "rm": "rm", "one": "one"})]}
P["s11"] = {"shot": [shot("start-14", 0, -1.3, 175, 26, 34)],
 "run": [run("ccpGlow", "start", FAR, 8)],
 "labels": [lab("sign", "科林研發", "Lam Research", "amber", "us", "s12:start-4", logo="lam")],
 "overlay": [sec("lam-co", "start+2", "s12:start-5", "科林研發", "公司財報、研究機構、媒體", {"us": "us", "no3": "no3", "tw": "tw"}, h=360, y=1040)]}
P["s12"] = {"shot": [shot("start-2", HAR["HX"], 1.4, 104, 10, 34)],
 "labels": [lab("harHole", "刻好的記憶孔", "Finished holes", "amber", "before", "s13:start-4")],
 "overlay": [sec("lam-next", "start+2", "s13:start-5", "接下來", "下一集：設備五大-4", {"before": "before", "coat": "coat", "next": "next", "kw": "kw"})]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/26", "noteAlways": True}
levels = [lv("tool", "多腔蝕刻平台（示意）", "ETCH CLUSTER", "4 m", "1 m")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-lam", "prevEpisode": "設備五大-2：應用材料", "title": "設備五大-3：科林研發（科技透明圈）", "asOf": "2026/11/26", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
                 "_說明": "旁白：2.5＋Iapetus＋說明 B（捲舌音要念清楚）；音高關卡 tts-pitch-take.sh（112～126 Hz）；本支尚未配音"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定機型"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["怎麼刻得", "又直又深？"], "sub": "設備五大-3：科林研發", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
for s in scenes:
    t = s.get("tts") or ""
    for r in SUBST:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] + s.get("pauseAfter", 0) for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
