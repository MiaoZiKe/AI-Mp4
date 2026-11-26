"""tech-kla 腳本產生器：python3 videos/tech-kla/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
設備五大-5：KLA（量測檢測）（科技透明圈 系列「代工的供應商」第 11 集；上一集設備五大-4：東京威力科創（塗光阻、顯影）；下一集 12/14：台灣自己的設備廠）。
旁白、cue、字幕、hook、片尾卡、hud、voice 與各幕 3D 動作（shot／shift／run／kin／labels／overlay）都在這支；cue 來自 timeline.json，配音後重跑本檔即可。
2D 卡：src/components/three/HudKla.tsx（kla-*）。構造與物理：physics-spec.md；模組清單：visual-spec.md。
Andy 第 18 條（11/26）：念稿與字幕不用負載鎖／FOUP／EFEM 與英文縮寫，術語原名只出現在畫面標籤。"""
import json, re, os, math, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook",
 "上一集圖案做好了，有沒有做壞？KLA 的檢測機，一片一片找。",
 ["上一集圖案做好了", "有沒有做壞？", "KLA 的檢測機", "一片一片找"],
 ["Last time the pattern was made.", "Was anything ruined?", "KLA's inspection tools", "check wafer by wafer."],
 [("prev", "圖案做好了"), ("q", "有沒有做壞"), ("kla", "檢測機")],
 ["做壞", "檢測機"], ["KLA 缺陷檢測產品頁"]),
("s2", "mechanism",
 "外殼打開，裡面有光源、物鏡、晶圓台，還有一整櫃電腦在比對。",
 ["外殼打開", "裡面有光源、物鏡、晶圓台", "還有一整櫃電腦在比對"],
 ["Open the cover:", "a light source, an objective, a wafer stage,", "and a whole cabinet of computers comparing images."],
 [("open", "外殼打開"), ("src", "光源"), ("obj", "物鏡"), ("stage", "晶圓台"), ("pc", "電腦")],
 ["光源", "物鏡", "晶圓台"], ["KLA 檢測產品頁；專利 US9410901"]),
("s3", "mechanism",
 "晶圓被手臂從晶圓盒取出，先在轉盤上轉一圈找缺口，再放上晶圓台，真空吸住。",
 ["晶圓被手臂從晶圓盒取出", "先在轉盤上轉一圈找缺口", "再放上晶圓台", "真空吸住"],
 ["A robot takes the wafer from its pod,", "spins it once to find the notch,", "sets it on the stage,", "and vacuum holds it."],
 [("foup", "晶圓盒"), ("notch", "找缺口"), ("put", "放上晶圓台"), ("vac", "真空吸住")],
 ["手臂", "缺口", "真空"], ["前端搬運通則；KLA 檢測產品頁"]),
("s4", "mechanism",
 "光源是雷射點燃的電漿，發出寬頻光，再用濾片挑出要的波段。",
 ["光源是雷射點燃的電漿", "發出寬頻光", "再用濾片挑出要的波段"],
 ["The light comes from laser-ignited plasma,", "giving broadband light,", "and filters pick the band needed."],
 [("laser", "雷射"), ("plasma", "電漿"), ("broad", "寬頻光"), ("filt", "濾片")],
 ["雷射", "電漿", "寬頻光"], ["KLA 寬頻電漿介紹頁；KLA 檢測產品頁"]),
("s5", "mechanism",
 "明場是光從正上方照下去，看反射回來的光，哪裡變暗、變了樣。",
 ["明場是光從正上方照下去", "看反射回來的光", "哪裡變暗、變了樣"],
 ["Brightfield shines straight down", "and reads the reflected light", "for spots that turn dark or look different."],
 [("bf", "明場"), ("down", "正上方照下去"), ("refl", "反射回來"), ("dark", "變暗")],
 ["明場", "反射"], ["Fraunhofer ENAS 明暗場說明"]),
("s6", "mechanism",
 "暗場是斜著打光，反射光被擋板吃掉，只收缺陷散出來的光。",
 ["暗場是斜著打光", "反射光被擋板吃掉", "只收缺陷散出來的光"],
 ["Darkfield lights at a slant;", "the mirror reflection hits a light trap,", "so only light scattered by defects is collected."],
 [("df", "暗場"), ("tilt", "斜著打光"), ("block", "擋板吃掉"), ("scat", "散出來")],
 ["暗場", "散射"], ["Fraunhofer ENAS；專利 US6288780"]),
("s7", "mechanism",
 "晶圓台一條一條來回掃，到頭先減速、轉向，再加速回到等速。",
 ["晶圓台一條一條來回掃", "到頭先減速、轉向", "再加速回到等速"],
 ["The stage scans strip by strip,", "slowing and turning at each end,", "then speeding back up to a steady pace."],
 [("scan", "來回掃"), ("slow", "減速"), ("turn", "轉向"), ("fast", "再加速")],
 ["來回掃", "減速", "加速"], ["專利 US11776859、US9410901"]),
("s8", "mechanism",
 "電腦把相鄰兩顆晶粒的影像相減，一樣的消掉，剩下的就是缺陷。光罩也要這樣檢查。",
 ["電腦把相鄰兩顆晶粒的影像相減", "一樣的消掉", "剩下的就是缺陷", "光罩也要這樣檢查"],
 ["Computers subtract images of two neighboring dies;", "what matches cancels out,", "and what's left is a defect.", "Photomasks get checked the same way."],
 [("adj", "相鄰兩顆晶粒"), ("sub", "相減"), ("cancel", "消掉"), ("defect", "就是缺陷"), ("mask", "光罩也要")],
 ["相減", "缺陷", "光罩"], ["比對通則；SPIE 13216；Lasertec（媒體報導）"]),
("s9", "mechanism",
 "量測也是它的強項，疊對是看上下兩層圖案，有沒有對準。",
 ["量測也是它的強項", "疊對是看上下兩層圖案", "有沒有對準"],
 ["Metrology is another strength:", "overlay checks whether two layers' patterns", "line up."],
 [("meas", "量測"), ("ovl", "疊對"), ("align", "有沒有對準")],
 ["量測", "疊對"], ["KLA 量測產品頁（Archer 疊對）"]),
("s10", "mechanism",
 "膜厚是用偏振光斜打進薄膜，看反射回來怎麼變，算出有多厚。",
 ["膜厚是用偏振光斜打進薄膜", "看反射回來怎麼變", "算出有多厚"],
 ["Film thickness: polarized light hits the film at a slant;", "how the reflection changes", "tells how thick it is."],
 [("pol", "偏振光"), ("refl", "反射回來"), ("thick", "有多厚")],
 ["膜厚", "偏振光"], ["KLA 量測產品頁（SpectraFilm 膜厚）；橢圓偏光通則"]),
("s11", "payoff",
 "KLA 是美國公司，專做量測和檢測，台灣總部在新竹竹北。",
 ["KLA 是美國公司", "專做量測和檢測", "台灣總部在新竹竹北"],
 ["KLA is an American company", "focused on metrology and inspection,", "with its Taiwan headquarters in Zhubei, Hsinchu."],
 [("us", "美國公司"), ("spec", "量測和檢測"), ("tw", "竹北")],
 ["美國", "量測", "竹北"], ["KLA 公司簡介；DIGITIMES；104 人力銀行"]),
("s12", "cta",
 "檢查做完了，下一集看台灣自己的設備廠。留言 KLA，拿完整資料。",
 ["檢查做完了", "下一集看台灣自己的設備廠", "留言 KLA，拿完整資料"],
 ["Inspection done.", "Next: Taiwan's own equipment makers.", "Comment \"KLA\" for the full notes."],
 [("done", "檢查做完了"), ("next", "台灣自己的設備廠"), ("kw", "留言")],
 ["台灣", "設備廠"], ["示意動畫，不是量測"]),
]
TTS = lambda t: t.replace("上集", "上一集").replace("上一一集", "上一集").replace("矽", "細").replace("光罩", "光照").replace("KLA", "K L A")
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
DUR = {"s2": 7.9, "s3": 9.8, "s4": 5.6, "s7": 6.2}
for sc in scenes:
    if sc["id"] in DUR: sc["durationSec"] = DUR[sc["id"]]
scenes[1]["pauseAfter"] = 0.7
scenes[0]["props"]["hook"] = {"kicker": "接上集：圖案做好了", "title": "有沒有做壞？", "size": 120, "top": 236}
scenes.append({"id": "s13", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "台灣設備廠", "trail": ["國產設備"], "comment": "KLA", "logoAnim": "transparent"}}})

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
def shot(at, x, y, d, elev, dur=30, yaw=None):
    o = {"at": at, "dur": dur, "x": x, "y": y, "d": d, "elev": elev}
    if yaw: o["yaw"] = round(yaw, 4)
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

# ═════════ 大氣 SCARA 手臂的逆運動學（俯視：pol 角度 a → 關節值 −a） ═════════
RB, L1, BL = INFO["RB"], INFO["L1"], INFO["BL"]
def pose(gx, gz, phi, lift=None, side=-1):
    """刀片夾取點 (gx, gz)、刀片朝向 phi（度，pol 慣例），回傳 j1/j2/j3（j2＝肘相對、j3＝腕相對）"""
    u = (math.cos(math.radians(phi)), math.sin(math.radians(phi)))
    wx, wz = gx - BL * u[0] - RB[0], gz - BL * u[1] - RB[1]
    d = max(0.3, math.hypot(wx, wz)); psi = math.degrees(math.atan2(wz, wx))
    al = math.degrees(math.acos(min(1, d / (2 * L1))))
    t1, t2 = psi + side * al, psi - side * al
    o = {"j1": round(-t1, 2), "j2": round(-(t2 - t1), 2), "j3": round(-(phi - t2), 2)}
    if lift is not None: o["lift"] = lift
    return o
def park(phi, lift=None, side=-1):
    """收臂：腕收到底座前 0.3，刀片朝 phi（晶圓整片在底座半徑 3 以內，轉向時不掃到裝載埠與預對準器）"""
    u = (math.cos(math.radians(phi)), math.sin(math.radians(phi)))
    return pose(RB[0] + (BL + 0.15) * u[0], RB[1] + (BL + 0.15) * u[1], phi, lift, side)
F1, ALN, LX = INFO["FOUP1"], INFO["ALN"], INFO["LOADX"]
LO, HI = -0.12, 0.2
K3 = "s3:start+6"
PRE = pose(F1[0] + 3.6, F1[1], 180)   # 晶圓盒口外：刀片對正盒口，直直伸進去、直直退出來
keys3 = [[0, {**PRE, "lift": LO}], [22, pose(F1[0], F1[1], 180)], [30, {"lift": 0.0}], [38, {"lift": HI}], [56, PRE], [70, park(180)], [96, park(90)],
         [114, pose(ALN[0], ALN[1], 90)], [122, {"lift": 0.0}], [128, {"lift": LO}],
         [178, {"lift": 0.0}], [186, {"lift": HI}], [206, park(90)], [226, park(0)], [248, pose(LX, 0, 0)], [256, {"lift": 0.0}], [262, {"lift": LO}], [282, park(0)]]
def unwrap(keys, prev):
    """關節角沿時間連續（每格和上一格差不超過 180°），避免內插時繞一整圈"""
    keys = [[t, dict(v)] for t, v in keys]
    last = {}
    for _, v in keys:
        for j in ("j1", "j2", "j3"):
            if j in v and j in last:
                while v[j] - last[j] > 180: v[j] -= 360
                while v[j] - last[j] < -180: v[j] += 360
            if j in v: v[j] = round(v[j], 2); last[j] = v[j]
    for j in ("j1", "j2", "j3"):   # 整條往 0 附近平移整圈（不改姿勢）
        vals = [v[j] for _, v in keys if j in v]; sh = 360 * round((max(vals) + min(vals)) / 2 / 360)
        for _, v in keys:
            if j in v: v[j] = round(v[j] - sh, 2)
    return keys
keys3 = unwrap(keys3, PRE)
KIN0 = {"arm": "ar", "at": "s1:start-40", "keys": [[0, dict(keys3[0][1])]]}
KIN3 = {"arm": "ar", "at": K3, "keys": keys3, "carry": [{"layer": "wfA", "grab": 30, "release": 122}, {"layer": "wfB", "grab": 178, "release": 256}]}
def k3(n): return add(K3, n)
# 晶圓盒前門：被裝載埠吸住往內 0.4、再往下 3.2（緩入緩出），之後關回
S3 = [mv("foup1Door", add(K3, -20), "s5:start", 10, dx=0.25), mv("foup1Door", add(K3, -10), "s4:start+20", 14, dy=-3.2)]
# 預對準器換片：wfA 放下 → wfR（轉一圈找缺口）→ wfB（手臂再取走）；同位置瞬間換，不位移
S3 += [hid("wfR", "s1:start-40", k3(123), 1), hid("wfA", k3(123), FAR, 1), hid("wfR", k3(174), FAR, 1), hid("wfB", "s1:start-40", k3(174), 1)]
# 晶圓台：一開始停在裝片位置（往 −x 5.6），吸盤先降 0.6（升降銷頂著），放片、刀片退出後吸盤升起吸住，接著整台回到物鏡正下方
STG = ["stX", "stZ", "chuck", "pins"]
S3 += [mv(l, "s1:start-40", "s4:start+8", 40, dx=round(LX - INFO["OX"], 3)) for l in STG]
S3 += [mv("chuck", "s1:start-40", k3(266), 14, dy=-0.6)]
# wfB 放到升降銷之後跟著晶圓台走（放開之後的位移才算）
S3 += [mv("wfB", "s4:start+8", FAR, 40, dx=round(INFO["OX"] - LX, 3))]

# ═════════ s2 爆炸分解：外殼掀開、模組各自沿軸線分開；一次一張標籤，講完組回才移鏡 ═════════
EXP_A, EXP_B = "s2:start+2", "s2:start+206"
EXPLODE = [mv("roof", EXP_A, EXP_B, 22, dy=6), mv("tower", EXP_A, EXP_B, 22, dy=6), mv("sign", EXP_A, EXP_B, 22, dy=6),
           mv("front", add(EXP_A, 3), EXP_B, 22, dz=7), mv("ui", add(EXP_A, 3), EXP_B, 22, dz=7), mv("efemFront", add(EXP_A, 3), EXP_B, 22, dz=5),
           hid("front", add(EXP_A, 14), EXP_B, 10), hid("ui", add(EXP_A, 14), EXP_B, 10), hid("efemFront", add(EXP_A, 14), EXP_B, 10),
           mv("srcHouse", add(EXP_A, 8), EXP_B, 22, dy=3.2, dx=-1.5), mv("src", add(EXP_A, 10), EXP_B, 22, dx=-2.6, dy=0.8), mv("fw", add(EXP_A, 10), EXP_B, 22, dx=-0.8, dy=1.4),
           mv("illum", add(EXP_A, 10), EXP_B, 22, dy=2.0), mv("lMain", add(EXP_A, 10), EXP_B, 22, dy=2.0),
           mv("det", add(EXP_A, 12), EXP_B, 22, dy=5.5), mv("head", add(EXP_A, 12), EXP_B, 22, dy=3.0), mv("obj", add(EXP_A, 12), EXP_B, 22, dy=1.6),
           mv("dfArm", add(EXP_A, 12), EXP_B, 22, dx=-1.2, dy=1.2), mv("dump", add(EXP_A, 12), EXP_B, 22, dx=1.2, dy=1.2),
           *[mv(l, add(EXP_A, 15), EXP_B, 22, dz=3.8) for l in STG], mv("pc", add(EXP_A, 15), EXP_B, 22, dx=4.5)]

# ═════════ 全片可見度 ═════════
LIGHT = ["lMain", "lBF", "lRet", "lDF", "lSpec", "lDFc", "lSpot"]
MET = ["met", "metOvl", "metEll", "wM", "lOvl", "lEllIn", "lEllOut"]
VIS = []
def show(lay, a, b, dur=8):
    """預設藏著的層：a～b 之間顯示（淡入淡出）"""
    return [hid(lay, "s1:start-40", a, dur), hid(lay, b, FAR, dur)]
LV = {"lMain": ("s4:broad-2", "s6:tilt-6"), "lBF": ("s5:down-4", "s6:tilt-6"), "lSpot": ("s5:down+2", "s8:start-6"), "lRet": ("s5:refl-4", "s6:tilt-6"),
      "lDF": ("s6:tilt-4", "s7:start-4"), "lSpec": ("s6:tilt+4", "s7:start-4"), "lDFc": ("s6:scat-4", "s7:start-4"), "lOvl": ("s9:ovl-4", "s10:start-4"),
      "lEllIn": ("s10:pol-2", "s11:start-4"), "lEllOut": ("s10:pol+6", "s11:start-4")}
for l, (a, b) in LV.items(): VIS += show(l, a, b)
# 掃描時明場光錐再亮起（晶圓在光點下移動）
VIS += [hid("lBF", "s6:tilt-6", "s7:scan-10", 8), hid("lMain", "s6:tilt-6", "s7:scan-10", 8)]
VIS += [hid("lBF", "s8:start-6", FAR, 8), hid("lMain", "s8:start-6", FAR, 8)]
# 量測站：另一台，s9 前才出現（同一位置淡入，不是瞬移）
for l in ["met", "metOvl", "metEll", "wM"]: VIS.append(hid(l, "s1:start-40", "s9:start-24", 18))

# ═════════ s7 蛇行掃描：X 一條一條來回（緩入緩出＝到頭減速、轉向、再加速），Z 每條之間跨一步 ═════════
XL = STG + ["wfB"]; ZL = ["stZ", "chuck", "pins", "wfB"]
T7 = "s7:scan-14"
SCAN = [*(mv(l, T7, FAR, 12, dx=-1.2) for l in XL), *(mv(l, T7, FAR, 10, dz=-0.9) for l in ZL)]
t = 14
for i in range(3):
    SCAN += [mv(l, add(T7, t), FAR, 36, dx=2.4 if i % 2 == 0 else -2.4) for l in XL]; t += 38
    if i < 2: SCAN += [mv(l, add(T7, t), FAR, 9, dz=0.9) for l in ZL]; t += 10
SCAN += [mv(l, add(T7, t), FAR, 14, dx=-1.2) for l in XL] + [mv(l, add(T7, t), FAR, 14, dz=-0.9) for l in ZL]

# ═════════ 剖開與隱藏（不需要的模組直接藏起來，不留糊殘影） ═════════
CUT = [hid("efemFront", "s3:start-8", "s4:start+10", 10), hid("front", "s3:start-8", "s11:start-8", 10), hid("ui", "s3:start-8", "s11:start-8", 10),
       hid("srcHouse", "s4:start-8", "s5:start+10", 10), hid("head", "s5:start-6", "s6:start+10", 10, 0.3),
       *[hid(l, "s8:start+2", "s9:start", 8) for l in ["obj", "head", "det", "bridge", "dfArm", "dump", "illum", "src", "srcHouse", "fw", "roof", "tower", "sign", "efem", "ffu", "ar", "lp1", "lp2", "foup1", "foup2", "foup1Door", "foup2Door", "aligner"]],
       *[hid(l, "s9:start-20", "s11:start-12", 14) for l in ["shell", "pc", "util", "roof", "tower", "sign"]]]

ALL = [l["id"] for l in MODEL["layers"] if not l.get("bg")]
def focus(keep, a, b):
    return [hid(l, a, b, 10) for l in ALL if l not in keep]
STAGE = STG + ["wfB"]
F_S3 = {"lp1", "lp2", "foup1", "foup2", "foup1Door", "foup2Door", "aligner", "ar", "wfA", "wfR", "wfB", *STG, "granite"}
F_S4 = {"src", "fw", "illum", "lMain", "head"}
F_S5 = {"obj", "head", "lBF", "lRet", "lSpot", "lMain", "illum", *STAGE}
F_S6 = {"obj", "dfArm", "dump", "lDF", "lSpec", "lDFc", "lSpot", "chuck", "pins", "stZ", "wfB"}
F_S7 = {*STAGE, "granite", "obj", "head", "bridge", "lBF", "lMain", "lSpot", "illum"}
F_S8 = {"wfB", "chuck", "pins", "stZ"}
F_S9 = {"met", "metOvl", "wM", "lOvl", "metEll"}
F_S9b = {"wM", "lOvl"}
F_S10 = {"metEll", "wM", "lEllIn", "lEllOut"}
FSETS = {3: F_S3, 4: F_S4, 5: F_S5, 6: F_S6, 7: F_S7, 8: F_S8, 9: F_S9, 10: F_S10}
FOCUS = []
for l in ALL:   # 每一層：連續幾幕都不在焦點裡 → 合成一段隱藏（不在換幕時閃回來）
    run_ = None
    for i in list(range(3, 11)) + [99]:
        out_ = i != 99 and l not in FSETS[i]
        if out_ and run_ is None: run_ = i
        if not out_ and run_ is not None:
            FOCUS.append(hid(l, f"s{run_}:start+2", f"s{i if i != 99 else 11}:start+14", 10)); run_ = None
# s9 推近框中框：量測站其他部分也藏
FOCUS += [hid(l, "s9:align-18", "s10:start+14", 8) for l in F_S9 - F_S9b]
P = {}
P["s1"] = {"shot": [shot("start-30", -1, 6, 125, 22, 1), shot("start", 0, 6, 115, 24, 90)],
 "shift": VIS + S3 + EXPLODE + SCAN + CUT + FOCUS, "kin": [KIN0],
 "run": [run("status", "start-30", FAR, 1), run("ffuAir", "start-30", "s4:start", 1)],
 "overlay": [sec("kla-hook", "q", "s2:start-5", "設備五大-5", "示意，非實際比例", {"prev": "prev", "q": "q", "kla": "kla"})]}
P["s2"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}], "shot": [shot("start", 0.5, 7, 108, 30, 34, yaw=0.1)],
 "labels": [lab("src", "寬頻電漿光源", "Broadband plasma source", "amber", "start+22", "start+67"),
            lab("head", "物鏡＋TDI 偵測器", "Objective & TDI sensor", "blue", "start+69", "start+114"),
            lab("stage", "高速晶圓台", "High-speed wafer stage", "amber", "start+116", "start+161"),
            lab("pc", "影像運算櫃", "Image computer", "blue", "start+163", "start+208")],
 "overlay": [sec("kla-tour", "start+2", "s3:start-5", "拆開檢測機", "示意", {"open": "open", "src": "src", "obj": "obj", "stage": "stage", "pc": "pc"})]}
P["s3"] = {"shot": [shot("start", -10.5, 5.5, 46, 34, 30, yaw=-0.1)], "kin": [KIN3],
 "run": [run("alnSpin", k3(130), k3(166), 10), run("alnLaser", k3(128), k3(172), 4)],
 "labels": [lab("foup", "晶圓盒（FOUP）", "Wafer pod", "blue", "start+6", "start+60"),
            lab("aln", "預對準器：找缺口", "Pre-aligner", "amber", k3(124), k3(174)),
            lab("ar", "大氣手臂（SCARA，型式示意）", "Atmospheric SCARA robot", "blue", k3(176), k3(222)),
            lab("stage", "真空吸盤", "Vacuum chuck", "amber", k3(224), "s4:start-4")],
 "overlay": [sec("kla-load", "start+2", "s4:start-5", "晶圓怎麼送進去", "示意", {"foup": "foup", "notch": "notch", "put": "put", "vac": "vac"})]}
P["s4"] = {"shot": [shot("start", -2.2, 11.6, 21, 14, 30)],
 "run": [run("laser", "laser-4", "s7:start", 6), run("srcGlow", "plasma-4", FAR, 8), run("fwSpin", "filt-6", "s5:start", 10)],
 "labels": [lab("laser", "雷射（點燃電漿）", "Pump laser", "amber", "laser-2", "plasma-2"),
            lab("plasma", "電漿燈泡：寬頻光", "Laser-sustained plasma", "blue", "plasma", "filt-4"),
            lab("fw", "濾片轉盤：選波段", "Filter wheel", "amber", "filt-2", "s5:start-4")],
 "overlay": [sec("kla-src", "start+24", "s5:start-5", "寬頻電漿光源", "示意（光譜不是量測）", {"laser": "laser", "plasma": "plasma", "broad": "broad", "filt": "filt"})]}
P["s5"] = {"shot": [shot("start", 1.6, 9, 24, 8, 32)],
 "run": [run("bfPulse", "down-4", "s6:tilt-6", 8), run("spot", "down", "s8:start", 8)],
 "labels": [lab("bf", "明場：垂直照、收反射", "Brightfield", "blue", "down", "s6:start-4")],
 "overlay": [sec("kla-bf", "start+24", "s6:start-5", "明場（側視）", "示意", {"bf": "bf", "down": "down", "refl": "refl", "dark": "dark"})]}
P["s6"] = {"shot": [shot("start", 1.8, 8.8, 20, 6, 32)],
 "run": [run("dfPulse", "tilt-4", "s7:start", 8), run("defGlow", "scat-6", "s9:start", 6)] + [run(f"scat{i}", "scat-4", "s7:start-2", 6) for i in range(7)],
 "labels": [lab("df", "暗場：斜射照明", "Oblique darkfield light", "amber", "tilt-2", "block-2"),
            lab("dump", "吸光擋板", "Light trap", "blue", "block", "scat-4"), lab("obj", "物鏡只收散射光", "Objective collects scatter", "amber", "scat-2", "s7:start-4")],
 "overlay": [sec("kla-df", "start+24", "s7:start-5", "暗場（側視）", "示意", {"df": "df", "tilt": "tilt", "block": "block", "scat": "scat"})]}
P["s7"] = {"shot": [shot("start", 1.8, 7, 42, 28, 32, yaw=0.08)],
 "labels": [lab("stage", "X／Z 雙軸晶圓台", "X/Z scanning stage", "amber", "scan-6", "turn-2"), lab("iso", "氣墊隔振腳", "Air isolators", "blue", "turn", "s8:start-4")],
 "overlay": [sec("kla-scan", "start+24", "s8:start-5", "蛇行掃描與速度", "示意（速度不是量測）", {"scan": "scan", "slow": "slow", "turn": "turn", "fast": "fast"})]}
P["s8"] = {"shot": [shot("start", 2.0, 6, 17, 72, 30)],
 "run": [run("dieHi", "adj-4", "s9:start", 6), run("defRing", "defect-6", "s9:start", 6), run("pcBlink", "start", "s9:start", 4)],
 "labels": [lab("defect", "缺陷（相減後剩下）", "Defect left after subtraction", "amber", "defect-2", "s9:start-4")],
 "overlay": [sec("kla-cmp", "start+24", "s9:start-5", "相鄰晶粒相減", "示意", {"adj": "adj", "sub": "sub", "cancel": "cancel", "defect": "defect", "mask": "mask"}, h=400, y=1010)]}
MX = INFO["MX"]
P["s9"] = {"shot": [shot("start", MX - 0.6, 7, 62, 22, 34, yaw=0.22), shot("align-16", INFO["OVX"], 8.2, 16, 50, 26)],
 "run": [run("ovlPulse", "ovl-4", "s10:start", 6)],
 "labels": [lab("ovl", "成像疊對（框中框標記）", "Imaging overlay", "blue", "ovl-2", "s10:start-4")],
 "overlay": [sec("kla-ovl", "start+24", "s10:start-5", "疊對：兩層對準了嗎", "示意（偏移放大畫）", {"meas": "meas", "ovl": "ovl", "align": "align"})]}
P["s10"] = {"shot": [shot("start", INFO["EX"], 8.0, 34, 12, 30)],
 "run": [run("ellBeam", "pol-2", "s11:start", 6), run("ellAna", "refl-6", "s11:start", 10)],
 "labels": [lab("ell", "偏光片 → 薄膜 → 檢偏器", "Ellipsometer arms", "amber", "pol-2", "thick-4"), lab("film", "薄膜", "Thin film", "blue", "thick-2", "s11:start-4")],
 "overlay": [sec("kla-film", "start+24", "s11:start-5", "膜厚：偏振光怎麼變", "示意（曲線不是量測）", {"pol": "pol", "refl": "refl", "thick": "thick"})]}
P["s11"] = {"shot": [shot("start", -1, 7, 120, 18, 40, yaw=-0.22)],
 "labels": [lab("sign", "KLA", "United States", "amber", "us", "s12:start-4", flag="US", logo="kla")],
 "overlay": [sec("kla-co", "start+24", "s12:start-5", "KLA 科磊", "公司簡介、媒體、人力銀行", {"us": "us", "spec": "spec", "tw": "tw"}, h=360, y=1040)]}
P["s12"] = {"shot": [shot("start", 1.0, 6, 105, 24, 40)],
 "overlay": [sec("kla-next", "start+24", "s13:start-5", "接下來", "下一集：12/14", {"done": "done", "next": "next", "kw": "kw"})]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/26", "noteAlways": True}
levels = [lv("tool", "光學缺陷檢測機（示意）", "OPTICAL INSPECTION", "3 m", "1 m")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-kla", "prevEpisode": "設備五大-4：東京威力科創", "title": "設備五大-5：KLA（科技透明圈）", "asOf": "2026/11/26", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
                 "_說明": "旁白金手指：2.5＋Iapetus＋說明 B（捲舌音要念清楚）；音高關卡 tts-pitch-take.sh（112～126 Hz）；本支尚未配音"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定機型"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["晶片做壞了", "誰抓得到？"], "sub": "設備五大-5：KLA", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
BANNED = ["負載鎖", "FOUP", "EFEM", "SCARA", "TDI", "BBP", "CD-SEM"]   # Andy 第 18 條：念稿與字幕不用
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if re.search(r"[0-9A-Za-z]", t.replace("K L A", "")): bad.append((s["id"], "數字或英文"))
    for w in BANNED:
        if w in (s.get("narration") or "") + s["subtitle"]["zh"]: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] + s.get("pauseAfter", 0) for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
