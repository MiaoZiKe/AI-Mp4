"""tech-tel 腳本產生器：python3 videos/tech-tel/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
設備五大-4：東京威力科創（科技透明圈 系列「代工的供應商」第 10 集；上一集設備五大-3：科林研發（結尾：刻之前，光阻得先塗好、顯影好，下一集看東京威力科創）；
下一集設備五大-5：科磊（量測檢測））。主軸＝批次直立爐管；副軸＝塗佈顯影（s1、s10）；低溫蝕刻一句帶過（s11）。
2D 卡：src/components/three/HudTel.tsx（tel-*）。構造與物理：physics-spec.md；模組清單：visual-spec.md。
2026/11/26 Andy 第 18 條：念稿與字幕不用 FOUP／EFEM／負載鎖這類易誤聽術語（一律「晶圓盒」），英文縮寫只出現在畫面標籤。"""
import json, re, os, math, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook",
 "上集說光阻得先塗好，誰來塗？東京威力科創，塗佈顯影機約九成是它的。",
 ["上集說光阻得先塗好", "誰來塗？", "東京威力科創", "塗佈顯影機約九成是它的"],
 ["Last time: the resist must be coated first.", "Who coats it?", "Tokyo Electron.", "It makes about 90% of coater-developers."],
 [("prev", "光阻得先塗好"), ("who", "誰來塗"), ("tel", "東京威力科創"), ("nine", "九成")],
 ["塗佈顯影", "九成"], ["TEL 法說會（2025 市占，引述 Gartner）"]),
("s2", "mechanism",
 "它還有一台直立式爐管，一次把上百片晶圓一起加熱。",
 ["它還有一台直立式爐管", "一次把上百片晶圓", "一起加熱"],
 ["It also builds vertical furnaces,", "heating over a hundred wafers", "at once."],
 [("furn", "直立式爐管"), ("batch", "上百片"), ("heat", "一起加熱")],
 ["爐管", "上百片"], ["TEL 產品線；立式爐專利（通用構造）"]),
("s3", "mechanism",
 "拆開看，最外面是加熱器，裡面是兩層石英管，晶圓疊在晶舟上，底下是保溫座，裝回去就是一台爐管。",
 ["拆開看", "最外面是加熱器", "裡面是兩層石英管", "晶圓疊在晶舟上", "底下是保溫座", "裝回去就是一台爐管"],
 ["Let's take it apart.", "Outside: the heater,", "inside: two quartz tubes,", "wafers stacked on a boat,", "an insulating pedestal below —", "put back together, that is the furnace."],
 [("open", "拆開"), ("heat", "加熱器"), ("tube", "石英管"), ("boat", "晶舟"), ("cap", "保溫座"), ("back", "裝回去")],
 ["加熱器", "石英管", "晶舟"], ["立式爐專利（通用構造，非 TEL 官方圖）"]),
("s4", "mechanism",
 "手臂一次夾起五片，轉身升高，一層層插進晶舟。",
 ["手臂一次夾起五片", "轉身升高", "一層層插進晶舟"],
 ["The arm lifts five wafers at a time,", "turns and rises,", "and slots them into the boat."],
 [("arm", "手臂"), ("five", "五片"), ("turn", "轉身升高"), ("ins", "插進晶舟")],
 ["五片", "晶舟"], ["立式爐專利（通用構造）"]),
("s5", "mechanism",
 "擋板滑開，升降機先加速再減速，把整舟推進爐管。",
 ["擋板滑開", "升降機先加速再減速", "把整舟推進爐管"],
 ["The shutter slides open;", "the elevator speeds up, then slows,", "pushing the whole boat into the tube."],
 [("shut", "擋板滑開"), ("acc", "先加速"), ("dec", "再減速"), ("push", "推進爐管")],
 ["升降機", "爐管"], ["立式爐專利（通用構造）"]),
("s6", "mechanism",
 "加熱器分好幾區，熱從管外往裡傳，最後才輪到晶圓。",
 ["加熱器分好幾區", "熱從管外往裡傳", "最後才輪到晶圓"],
 ["The heater has several zones;", "heat travels from outside in,", "reaching the wafers last."],
 [("zone", "好幾區"), ("out", "管外往裡傳"), ("wafer", "輪到晶圓")],
 ["分區", "往裡傳"], ["立式爐專利（多區加熱，通用構造）；分區數示意"]),
("s7", "mechanism",
 "氣體從噴氣管的小孔橫著掃過晶圓，再從夾縫往下抽走。",
 ["氣體從噴氣管的小孔", "橫著掃過晶圓", "再從夾縫往下抽走"],
 ["Gas jets from holes in the injector,", "sweeping across the wafers,", "then is pumped down through the gap."],
 [("inj", "噴氣管"), ("cross", "橫著掃過"), ("down", "夾縫")],
 ["噴氣管", "抽走"], ["立式爐專利（雙層管、噴氣管、排氣口，通用構造）"]),
("s8", "mechanism",
 "氣體在表面反應，薄膜一層層長厚，上百片一起長。",
 ["氣體在表面反應", "薄膜一層層長厚", "上百片一起長"],
 ["The gas reacts on the surface;", "the film thickens layer by layer,", "on a hundred wafers at once."],
 [("react", "表面反應"), ("film", "一層層長厚"), ("all", "上百片")],
 ["薄膜", "長厚"], ["化學氣相沉積通則（physics-spec 2B）"]),
("s9", "twist",
 "一次上百片很有效率；但一爐出問題，受影響的就是整批晶圓。",
 ["一次上百片很有效率", "但一爐出問題", "受影響的就是整批晶圓"],
 ["A hundred at once is efficient,", "but if one run goes wrong,", "the whole boat is affected."],
 [("eff", "很有效率"), ("bad", "出問題"), ("boat", "整批晶圓")],
 ["有效率", "整批"], ["批次製程通則（分析）"]),
("s10", "mechanism",
 "回到開頭的塗佈顯影，光阻滴在中央，一轉就甩成薄膜，轉越快越薄。",
 ["回到開頭的塗佈顯影", "光阻滴在中央", "一轉就甩成薄膜", "轉越快越薄"],
 ["Back to coating:", "resist drops onto the center,", "one spin flings it into a thin film —", "the faster, the thinner."],
 [("back", "塗佈顯影"), ("drop", "光阻滴在中央"), ("spin", "一轉"), ("thin", "越快越薄")],
 ["光阻", "越快越薄"], ["旋轉塗佈通則（教科書）"]),
("s11", "payoff",
 "東京威力是日本公司，它發表的蝕刻做到零下七十度；台南營運中心，零件就近維修。",
 ["東京威力是日本公司", "它發表的蝕刻做到零下七十度", "台南營運中心", "零件就近維修"],
 ["Tokyo Electron is a Japanese company;", "its published etch runs at minus 70 °C.", "Its Tainan operation center", "repairs parts locally."],
 [("jp", "日本公司"), ("cryo", "零下七十度"), ("tn", "台南"), ("rep", "就近維修")],
 ["日本", "台南"], ["TEL 財報；TEL 論文；TechNews 2024/12/3"]),
("s12", "cta",
 "怎麼確認每一步都做對？下一集看量測檢測的科磊。留言東京威力，拿完整資料。",
 ["怎麼確認每一步都做對？", "下一集看量測檢測的科磊", "留言東京威力，拿完整資料"],
 ["How do we know each step went right?", "Next: KLA, metrology and inspection.", "Comment \"東京威力\" for the full notes."],
 [("chk", "做對"), ("next", "科磊"), ("kw", "留言東京威力")],
 ["量測", "科磊"], ["示意動畫，不是量測"]),
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
scenes[2]["durationSec"] = max(scenes[2]["durationSec"], 9.0)   # s3 爆炸分解：四張標籤各 ≥1.5 秒；「保溫座」念完就組回，停 ≥1.5 秒才移鏡
scenes[3]["durationSec"] = max(scenes[3]["durationSec"], 6.2)   # 手臂：停 1.3 秒給叉片標籤＋一趟取放 4.7 秒（配音後 s4 要 ≥6 秒）
scenes[0]["props"]["hook"] = {"kicker": "接上集：光阻要先塗好", "title": "誰來塗光阻？", "size": 120, "top": 236}
scenes.append({"id": "s13", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "科磊", "trail": ["量測", "檢測"], "comment": "東京威力", "logoAnim": "transparent"}}})

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
YAW = [0.0]
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
YB = -0.35
YCUT = -0.85   # 剖開鏡頭轉到右前方，正對切面看線圈、石英管、晶圓
SX = lambda x, z=0.0: round(x * math.cos(YB) + z * math.sin(YB), 2)   # 爐管鏡頭 yaw −0.35：世界座標 → 鏡頭的 x（塗佈區、放大台 yaw 0，直接用 x）
LIFT = INFO["LIFT"]; CX, CY, FL = INFO["CX"], INFO["CY"], INFO["FL"]; FLY = INFO["FLY"]

# ═════════ 全片可見度：每幕只留要看的模組，其他直接隱藏（不留淡淡的殘影）═════════
ALL = [l["id"] for l in MODEL["layers"] if not l.get("bg")]
COAT = {"coatCab", "coat", "noz", "rs0", "rs1", "rs2", "rs3", "rs4", "rsT", "rsB"}
FILM = {"film"} | {f"fl{n}" for n in range(INFO["NF"])}
TUBE = {"heatL", "heatR", "heatTop", "otube", "itube", "mani", "boat", "bgap", "cap"}
FURN = set(ALL) - COAT - FILM
SHOW = {"s1": COAT, "s2": FURN, "s3": TUBE | {"shut", "elev", "elevCol", "lae", "sign"}, "s4": {"rb", "rbCol", "foup", "wf5", "fop", "boat", "bgap"},
        "s5": (TUBE - {"heatL", "heatR", "heatTop"}) | {"shut", "elev", "elevCol", "lae", "sign"}, "s6": TUBE - {"heatR"}, "s7": (TUBE - {"heatR", "heatL", "heatTop"}) | {"bz"}, "s8": FILM, "s9": TUBE - {"heatR"},
        "s10": COAT, "s11": FURN, "s12": FILM}
ORDER = [f"s{i}" for i in range(1, 13)]
VIS = []
for l in ALL:
    span = None
    for i, sid in enumerate(ORDER):
        b = "s1:start-40" if i == 0 else f"{sid}:start+6" if sid == "s2" else f"{sid}:start+0"    # 新的模組等鏡頭到位才出現（s2 等鉤子大字收掉）
        a = b   # 舊的模組一直留到新模組出現那一幀才換掉（不留空桌面；粒子與液滴另外提早收）
        if l not in SHOW[sid]:
            if span is None: span = a
        elif span is not None: VIS.append(hid(l, span, b, 1)); span = None   # 同一幀交接
    if span is not None: VIS.append(hid(l, span, FAR, 1))
# 光阻（稠液體）：連續細絲落下 → 中央堆成一坨 → 起轉後四圈由內往外鋪開（厚、深橘）→「越薄」時換成甩薄後的淡色薄膜
for i in range(4):
    VIS += [hid(f"rs{i}", "s1:start-40", f"s1:start+{20 + i * 8}", 8), hid(f"rs{i}", "s1:nine", add("s10:spin", 6 + i * 8), 20), hid(f"rs{i}", "s10:thin", FAR, 20)]
VIS += [hid("rs4", "s1:start-40", "s1:nine-2", 20), hid("rs4", "s2:start-20", "s10:thin-2", 20),
        hid("rsT", "s1:start+30", "s10:drop-6", 6), hid("rsT", "s10:spin+6", FAR, 8), hid("rsB", "s1:start+40", "s10:drop+2", 8), hid("rsB", "s10:spin+14", FAR, 12)]
# 薄膜（s8）：六層一層層長上去
for n in range(INFO["NF"]): VIS.append(hid(f"fl{n}", "s1:start-40", add("s8:react", 4 + n * 16), 8))
# ═════════ s4 晶圓搬運手臂：晶圓盒取五片 → 縮回 → 轉身並升高（先加速再減速）→ 伸進晶舟空格 → 放下 → 縮回 → 回原位 ═════════
K4 = "s4:start+24"   # 配音後 s4 只有 5.6 秒：先停 0.8 秒讓「五支叉片」標籤指得到叉片本身，再開始取片
DZB = round(INFO["slotGap0"] - INFO["fslot20"], 4); FG = INFO["FG"]   # 晶圓盒第 20 格 → 晶舟空格的高度差；叉片頂到晶圓底的間隙
keys4 = [[0, {"z": 0, "th": 0, "ex": 0}], [18, {"ex": 3.8}], [24, {"z": FG}], [30, {"z": FG + 0.02}], [46, {"ex": 0}],
         [74, {"th": -180, "z": DZB + FG + 0.02}], [92, {"ex": 3.4}], [97, {"z": DZB + FG}], [103, {"z": DZB}], [118, {"ex": 0}], [140, {"th": 0, "z": 0}]]
KIN0 = {"arm": "rb", "at": "s1:start-40", "keys": [[0, {"z": 0, "th": 0, "ex": 0}]]}
KIN4 = {"arm": "rb", "at": K4, "keys": keys4, "carry": [{"layer": "wf5", "grab": 24, "release": 97}]}
SWAP = [hid("wf5", add(K4, 98), FAR, 1), hid("bgap", "s1:start-40", add(K4, 97), 1)]   # 放下那一幀換成晶舟上的同位置晶圓（之後跟著晶舟一起升）
# ═════════ s3 爆炸分解（晶舟在下方裝載位置，爐管是空的）：頂蓋往上 → 加熱器左右兩半往兩側掀開 → 外石英管往上抽出；「保溫座」念到後組回（18 幀緩入緩出），停住才移鏡 ═════════
EXP_A, EXP_B = "s3:open-4", "s3:cap+2"
EXPLODE = [mv("heatTop", EXP_A, EXP_B, 18, dy=11.6), mv("heatL", add(EXP_A, 6), EXP_B, 18, dx=-6.5), mv("heatR", add(EXP_A, 6), EXP_B, 18, dx=6.5),
           mv("otube", add(EXP_A, 12), EXP_B, 18, dy=11.2)]
# ═════════ s5 擋板滑開 → 晶舟、保溫座、密封蓋、托臂一起往上（60 幀緩入緩出）═════════
LIFTS = [mv("shut", "s5:shut-4", FAR, 20, dx=4.4)] + [mv(l, "s5:acc-6", FAR, 60, dy=LIFT) for l in ("boat", "bgap", "cap", "elev")]
# ═════════ 剖開：s6～s9 加熱器右半隱藏，看得到裡面的線圈、石英管與晶舟 ═════════
CUT = []

P = {}
# 換到距離很遠的區（塗佈區、爐管、放大台）一律同一幀切鏡（不在空桌面上平移）；同一區內才平移
# 鏡頭（x＝鏡頭座標、y＝看的高度、距離、仰角）：主素材要整個落在頁首下緣到示意卡上緣之間（layout-check 量 mainSamples）
CAM = {"s1a": (CX, 5.4, 40, 28), "s1": (CX, 5.2, 38, 28), "s2": (SX(2.5), 8.3, 126, 12), "s3": (SX(0.5), 12.6, 172, 10), "s4": (SX(5.8), 3.4, 61, 16),
       "s4b": (SX(7.4), 5.6, 64, 14), "s5": (SX(0.0), 9.5, 100, 10), "s6": (SX(0.0), 16.4, 75, 8), "s7": (FL, 14.2, 22, 13), "s7b": (SX(0.0), 16.8, 62, 7), "s8": (FL, 3.2, 49, 8), "s9": (SX(0.0), 16.4, 75, 8),
       "s10": (CX, 5.2, 38, 28), "s11": (SX(2.5), 8.3, 126, 12), "s12": (FL, 3.2, 49, 8)}
P["s1"] = {"shot": [shot("start-30", *CAM["s1a"], 1, yaw_to=0.0), shot("start", *CAM["s1"], 120)],
 "shift": VIS + SWAP + EXPLODE + LIFTS + CUT, "kin": [KIN0, KIN4],
 "run": [run("spin", "start-30", "s2:start", 12), *[run(f"fling{i}", "start+10", "s2:start-18", 6) for i in range(5)], run("tower", "start-30", FAR, 1), run("status", "start-30", FAR, 1)],
  "overlay": [sec("tel-hook", "who", "s2:start-20", "設備五大-4", "示意，非實際機型", {"prev": "prev", "who": "who", "tel": "tel", "nine": "nine"})]}
P["s2"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}],
 "shot": [shot("start+6", *CAM["s2"], 1, yaw_to=YB)],
 "run": [run("lae", "start", "s3:start-30", 8)],
 "labels": [lab("boat", "晶舟（一次上百片）", "Wafer boat", "amber", "batch", "heat-2"), lab("upper", "爐管裝在上半部機殼裡", "Furnace inside upper cabinet", "blue", "heat", "s3:start-20")],
 "overlay": [sec("tel-tool", "start+2", "s3:start-20", "直立式爐管", "示意", {"furn": "furn", "batch": "batch", "heat": "heat"})]}
P["s3"] = {"shot": [shot("start-14", *CAM["s3"], 14, yaw_to=YB)],
 "labels": [lab("heat", "加熱器（剖開示意）", "Heater (cutaway)", "amber", "heat-4", "tube-6"), lab("otube", "石英管（內外兩層）", "Quartz tubes", "blue", "tube-4", "boat-6"),
            lab("boat", "晶舟（石英）", "Wafer boat", "amber", "boat-4", "cap-6"), lab("cap", "保溫座＋密封蓋", "Pedestal & seal cap", "blue", "cap-4", "back+28")],
 "overlay": [sec("tel-stack", "start+6", "s4:start-20", "爐管拆開", "示意", {"open": "open", "heat": "heat", "tube": "tube", "boat": "boat", "cap": "cap"})]}
P["s4"] = {"shot": [shot("start-1", *CAM["s4"], 2, yaw_to=YB), shot("start+46", *CAM["s4b"], 20)],
 "labels": [lab("foup", "晶圓盒（FOUP）", "Wafer pod", "blue", "start+50", "s5:start-20"), lab("fork", "五支叉片：一次五片", "5-blade fork", "amber", "start+2", "start+46")],
 "overlay": [sec("tel-load", "start+2", "s5:start-20", "裝晶舟", "示意", {"arm": "arm", "five": "five", "turn": "turn", "ins": "ins"})]}
P["s5"] = {"shot": [shot("start-14", *CAM["s5"], 14, yaw_to=YB)],
 "labels": [lab("shut", "爐口擋板", "Shutter", "blue", "shut-2", "acc-6"), lab("elev", "晶舟升降機", "Boat elevator", "amber", "acc", "s6:start-20")],
 "overlay": [sec("tel-lift", "start+2", "s6:start-20", "送進爐管", "示意", {"shut": "shut", "acc": "acc", "dec": "dec", "push": "push"})]}
P["s6"] = {"shot": [shot("start-14", *CAM["s6"], 14, yaw_to=YCUT)],
 "run": [*[run(f"zone{i}", add("s6:zone", -4 + 6 * i), "s10:start", 10) for i in range(5)], run("coilGlow", "zone", "s10:start", 10),
         run("tubeWarm", "out+6", "s7:start-20", 14), *[run(f"heatIn{i}", "out-4", "s7:start-18", 8) for i in range(3)], run("edgeWarm", "wafer-4", "s7:start-20", 10), run("waferWarm", "wafer+14", "s7:start-20", 20)],
 "labels": [lab("zone", "加熱線圈（分區）", "Heater zones", "amber", "zone-2", "wafer-8"), lab("waferHot", "晶圓最後才熱", "Wafers heat last", "blue", "wafer-2", "s7:start-20")],
 "overlay": [sec("tel-heat", "start+2", "s7:start-20", "熱由外往內", "示意", {"zone": "zone", "out": "out", "wafer": "wafer"})]}
P["s7"] = {"shot": [shot("start-14", *CAM["s7b"], 14, yaw_to=YB), shot("cross-12", *CAM["s7"], 1, yaw_to=0.0), shot("down-14", *CAM["s7b"], 1, yaw_to=YB)],
 "run": [run("gasFeed", "inj-8", "s8:start-18", 8), run("gasCross", "cross-4", "s8:start-18", 8), run("gasUp", "inj", "s8:start-18", 8), run("gasDown", "inj+6", "s8:start-18", 8), run("bzGas", "cross-6", "down-12", 8),
         run("exhaust", "inj+10", "s8:start-18", 8), run("pumpRun", "inj+10", "s8:start-18", 4)],
 "labels": [lab("inj", "噴氣管（多孔）", "Gas injector", "amber", "inj-2", "cross-14"), lab("bzGap", "氣體穿過晶圓間隙（放大）", "Gas between wafers", "blue", "cross+4", "down-16"), lab("exh", "夾縫往下抽到排氣口", "Down the gap to exhaust", "amber", "down+6", "s8:start-20")],
 "overlay": [sec("tel-gas", "start+2", "s8:start-20", "氣體怎麼走", "示意", {"inj": "inj", "cross": "cross", "down": "down"})]}
P["s8"] = {"shot": [shot("start", *CAM["s8"], 1, yaw_to=0.0)],
 "run": [run(f"filmGas{i}", "react-6", "s9:start-18", 8) for i in range(3)],
 "labels": [lab("film", "薄膜（放大示意）", "Film (enlarged)", "amber", "film", "s9:start-20")],
 "overlay": [sec("tel-film", "start+2", "s9:start-20", "薄膜長厚", "放大示意", {"react": "react", "film": "film", "all": "all"})]}
P["s9"] = {"shot": [shot("start", *CAM["s9"], 1, yaw_to=YCUT)],
 "labels": [lab("waferHot", "整批一起處理", "One batch", "amber", "eff", "s10:start-20")],
 "overlay": [sec("tel-batch", "start+2", "s10:start-20", "批次的取捨", "分析", {"eff": "eff", "bad": "bad", "boat": "boat"})]}
P["s10"] = {"shot": [shot("start", *CAM["s10"], 1, yaw_to=0.0)],
 "run": [run("spin", "spin-4", "s11:start", 60), *[run(f"fling{i}", "spin+16", "s11:start-22", 10) for i in range(5)]],
 "labels": [lab("noz", "光阻噴嘴", "Resist nozzle", "amber", "drop-2", "spin-6"), lab("coat", "多的光阻被甩出", "Excess flung off", "blue", "spin+4", "s11:start-26")],
 "overlay": [sec("tel-coat", "start+2", "s11:start-20", "旋轉塗佈", "示意", {"back": "back", "drop": "drop", "spin": "spin", "thin": "thin"})]}
P["s11"] = {"shot": [shot("start", *CAM["s11"], 1, yaw_to=YB)],
 "labels": [lab("sign", "東京威力科創", "Tokyo Electron", "amber", "jp", "s12:start-20", logo="tel")],
 "overlay": [sec("tel-co", "start+2", "s12:start-20", "東京威力科創", "公司財報、論文、媒體", {"jp": "jp", "cryo": "cryo", "tn": "tn", "rep": "rep"}, h=360, y=1040)]}
P["s12"] = {"shot": [shot("start", *CAM["s12"], 1, yaw_to=0.0)],
 "labels": [lab("film", "膜厚要量", "Film thickness", "amber", "chk", "s13:start-20")],
 "overlay": [sec("tel-next", "start+2", "s13:start-20", "接下來", "下一集：設備五大-5", {"chk": "chk", "next": "next", "kw": "kw"})]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/26", "noteAlways": True}
levels = [lv("tool", "直立式批次爐管（示意）", "VERTICAL FURNACE", "3 m", "1 m")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-tel", "prevEpisode": "設備五大-3：科林研發", "title": "設備五大-4：東京威力科創（科技透明圈）", "asOf": "2026/11/26", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
                 "_說明": "旁白：2.5＋Iapetus＋說明 B（捲舌音要念清楚）；音高關卡 tts-pitch-take.sh（112～126 Hz）；本支尚未配音"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定機型"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["一次烤", "上百片？"], "sub": "設備五大-4：東京威力科創", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
BANNED = ["FOUP", "EFEM", "負載鎖", "鎖"]   # 第 18 條：念稿與字幕不用易誤聽術語
for s in scenes:
    t = s.get("tts") or ""
    for r in SUBST:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
    for w in BANNED:
        if w in (s.get("narration") or "") or w in s["subtitle"]["zh"]: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] + s.get("pauseAfter", 0) for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
