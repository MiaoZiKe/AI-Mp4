"""tech-amat 腳本產生器：python3 videos/tech-amat/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
設備五大-2：應用材料（沉積、離子佈植）（科技透明圈 系列「代工的供應商」第 8 集；上一集設備五大-1：ASML（結尾：曝光前要先鋪薄膜）；下一集設備五大-3：科林研發（蝕刻））。
旁白、cue、字幕、hook、片尾卡、hud、voice 與各幕 3D 動作（shot／shift／run／kin／labels／overlay）都在這支；cue 來自 timeline.json，配音後重跑本檔即可。
2D 卡：src/components/three/HudAmat.tsx（amat-*）。構造與物理：physics-spec.md；模組清單：visual-spec.md。"""
import json, re, os, math, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]; FAC = INFO["FACETS"]
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook",
 "上集說曝光前要先鋪薄膜，誰來鋪？應用材料的集群機台。",
 ["上集說曝光前", "要先鋪薄膜", "誰來鋪？", "應用材料的集群機台"],
 ["Last time: films come before exposure.", "They must be laid down first.", "Who lays them?", "Applied Materials' cluster tool."],
 [("prev", "先鋪薄膜"), ("who", "誰來鋪"), ("amat", "應用材料")],
 ["薄膜", "應用材料"], ["應用材料官網；Applied 專利 US7389645"]),
("s2", "mechanism",
 "中間是真空傳送腔，四周接著好幾個腔體，晶圓不用離開真空。",
 ["中間是真空傳送腔", "四周接著好幾個腔體", "晶圓不用離開真空"],
 ["In the middle: a vacuum transfer chamber,", "ringed by several process chambers,", "so wafers never leave the vacuum."],
 [("mid", "真空傳送腔"), ("ring", "四周"), ("many", "好幾個腔體"), ("vac", "不用離開真空")],
 ["傳送腔", "真空"], ["Applied 專利 US7389645、US6440261；應用材料官網"]),
("s3", "mechanism",
 "晶圓從晶圓盒出來，先進負載鎖抽真空，閘門才打開。",
 ["晶圓從晶圓盒出來", "先進負載鎖抽真空", "閘門才打開"],
 ["The wafer leaves its pod,", "enters a load lock that pumps down,", "and only then does the gate open."],
 [("foup", "晶圓盒"), ("ll", "負載鎖"), ("vac", "抽真空"), ("gate", "閘門才打開")],
 ["負載鎖", "抽真空"], ["Applied 專利 US7389645、US6558509"]),
("s4", "mechanism",
 "手臂把晶圓取出、轉個方向，先加速再減速，停穩才放進腔裡。",
 ["手臂把晶圓取出", "轉個方向", "先加速再減速", "停穩才放進腔裡"],
 ["The robot picks up the wafer,", "turns,", "speeds up, then slows down,", "and only sets it in once it's steady."],
 [("take", "取出"), ("turn", "轉個方向"), ("acc", "先加速"), ("stop", "停穩"), ("put", "放進腔裡")],
 ["手臂", "加速", "減速"], ["Applied 專利 US6440261（雙刀手臂）"]),
("s5", "mechanism",
 "第一種叫濺鍍，氬氣電漿撞擊金屬靶，原子被打出來落到晶圓上。",
 ["第一種叫濺鍍", "氬氣電漿撞擊金屬靶", "原子被打出來", "落到晶圓上"],
 ["The first method is sputtering:", "argon plasma strikes a metal target,", "knocking atoms loose", "that land on the wafer."],
 [("pvd", "濺鍍"), ("ar", "氬氣電漿"), ("tgt", "金屬靶"), ("atom", "原子被打出來"), ("land", "落到晶圓上")],
 ["濺鍍", "電漿", "靶"], ["磁控濺鍍通則（Angstrom Engineering）；US4508612"]),
("s6", "mechanism",
 "靶背後的磁鐵一直轉，把電漿困在靶面，靶才會被均勻吃掉。",
 ["靶背後的磁鐵一直轉", "把電漿困在靶面", "靶才會被均勻吃掉"],
 ["A magnet keeps spinning behind the target,", "trapping the plasma at its surface,", "so the target wears away evenly."],
 [("mag", "磁鐵一直轉"), ("trap", "困在靶面"), ("eat", "均勻吃掉")],
 ["磁鐵", "均勻"], ["US6322679（旋轉磁鐵磁控管）"]),
("s7", "mechanism",
 "第二種是化學氣相沉積，氣體從噴頭小孔均勻噴下，在晶圓上反應成膜。",
 ["第二種是化學氣相沉積", "氣體從噴頭小孔", "均勻噴下", "在晶圓上反應成膜"],
 ["The second is chemical vapor deposition:", "gas from tiny showerhead holes", "sprays down evenly", "and reacts into a film on the wafer."],
 [("cvd", "化學氣相沉積"), ("sh", "噴頭小孔"), ("even", "均勻噴下"), ("film", "反應成膜")],
 ["化學氣相沉積", "噴頭"], ["應用材料 Producer 產品頁；CVD 通則"]),
("s8", "mechanism",
 "更薄的用原子層沉積，兩種氣體輪流進來，一圈只長約一層原子。",
 ["更薄的用原子層沉積", "兩種氣體輪流進來", "一圈只長約一層原子"],
 ["For thinner films: atomic layer deposition.", "Two gases take turns,", "each cycle adds about one atomic layer."],
 [("ald", "原子層沉積"), ("turns", "輪流進來"), ("cycle", "一圈"), ("one", "一層原子")],
 ["原子層沉積", "輪流"], ["ALD 專利 US7393736、US10927459"]),
("s9", "mechanism",
 "離子佈植是另一台機器，把硼打成離子，用磁鐵挑出要的那一種。",
 ["離子佈植是另一台機器", "把硼打成離子", "用磁鐵挑出要的那一種"],
 ["Ion implantation is a separate machine:", "it turns boron into ions,", "and a magnet picks out the right ones."],
 [("imp", "離子佈植"), ("src", "打成離子"), ("mag", "用磁鐵"), ("pick", "挑出要的")],
 ["離子佈植", "磁鐵"], ["應用材料 VIISta 900XP 產品頁；CERN PAC2013 簡報"]),
("s10", "mechanism",
 "再經過加速管加速，打進晶圓表面底下，改變導電性。",
 ["再經過加速管加速", "打進晶圓表面底下", "改變導電性"],
 ["An accelerator tube speeds them up,", "driving them just below the wafer surface", "to change how it conducts."],
 [("acc", "加速管"), ("hit", "打進晶圓"), ("cond", "改變導電性")],
 ["加速管", "導電性"], ["應用材料 VIISta 900XP 產品頁；Axcelis 技術文件"]),
("s11", "payoff",
 "應用材料是美國公司，全球第二大設備商，台灣總部在新竹。",
 ["應用材料是美國公司", "全球第二大設備商", "台灣總部在新竹"],
 ["Applied Materials is a US company,", "the world's No. 2 chip-equipment maker,", "with its Taiwan headquarters in Hsinchu."],
 [("us", "美國公司"), ("no2", "第二大"), ("tw", "新竹")],
 ["美國", "第二大", "新竹"], ["應用材料財報；TechInsights；應用材料台灣官網"]),
("s12", "cta",
 "鋪好膜、照好圖，接著要把多的刻掉，下一集看科林研發。留言應材，拿完整資料。",
 ["鋪好膜、照好圖", "接著要把多的刻掉", "下一集看科林研發", "留言應材，拿完整資料"],
 ["Films down, pattern printed;", "next, the excess gets etched away.", "Next: Lam Research.", "Comment \"應材\" for the full notes."],
 [("film", "鋪好膜"), ("etch", "刻掉"), ("next", "科林研發"), ("kw", "留言應材")],
 ["刻掉", "科林研發"], ["示意動畫，不是量測"]),
]
TTS = lambda t: t.replace("上集", "上一集").replace("矽", "細").replace("光罩", "光照")
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
scenes[0]["props"]["hook"] = {"kicker": "接上集：先鋪薄膜", "title": "誰來鋪薄膜？", "size": 120, "top": 236}
scenes.append({"id": "s13", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "科林研發", "trail": ["蝕刻"], "comment": "應材", "logoAnim": "transparent"}}})

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
def hid(lay, a, b, dur=10): return {"layer": lay, "at": a, "until": b, "opacity": 0, "dur": dur}
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

# ═════════ 全片可見度 ═════════
FILMS = {"fP": 3, "fC": 3, "fA": 4}
IMP = ["imp", "impSrc", "impMag", "impAcc", "impEnd", "impScan"]
VIS = []
# 薄膜：念到才一層一層出現（s5、s7、s8 各自排，在 P 裡加）；這裡先全藏到很後面，之後由各幕的 FILM_ON 拿掉
FILM_AT = {"fP0": "s5:land", "fP1": "s5:land+24", "fP2": "s6:mag", "fC0": "s7:film-6", "fC1": "s7:film+18", "fC2": "s8:start-10"}
ALD_C = ["s8:turns+4", "s8:cycle+4", "s8:one+2", "s8:one+30"]
for i, a in enumerate(ALD_C): FILM_AT[f"fA{i}"] = add(a, 40)
for k, a in FILM_AT.items(): VIS.append(hid(k, "s1:start-40", a, 8))
VIS.append(hid("pvdTgtEro", "s1:start-40", "s6:eat-30", 40))
# 離子佈植機：另一台，s9 前才出現（淡入，不是瞬移：同一位置慢慢顯現）
for l in IMP: VIS.append(hid(l, "s1:start-40", "s9:start-24", 18))

# ═════════ s2 爆炸分解：腔體掀蓋、模組沿各自的徑向分開，講完組回（s3 開頭前）═════════
EXP_A, EXP_B = "s2:start-6", "s3:start-14"
EXPLODE = [mv("tcLid", EXP_A, EXP_B, 20, dy=7.5)]
def grp(key, a, r, lift):
    dx, dz = pol(a, r); out = []
    lays = [f"{key}Body", f"{key}Pump", f"v_{key}", f"vd_{key}"]
    extra = {"pvd": ["pvdTgt", "pvdTgtEro", "pvdMag", "pvdPed", "pvdPins", "pvdShield"], "pvd2": ["pvd2Tgt", "pvd2TgtEro", "pvd2Mag", "pvd2Ped", "pvd2Pins", "pvd2Shield"],
             "cvd": ["cvdSH", "cvdPed", "fC0", "fC1", "fC2"], "ald": ["aldSH", "aldPed", "fA0", "fA1", "fA2", "fA3"], "cool": [], "degas": []}[key]
    for j, l in enumerate(lays + extra):
        dy = 0
        if l.endswith("Tgt") or l.endswith("TgtEro"): dy = lift * 0.55
        if l.endswith("Mag"): dy = lift * 0.8
        if l.endswith("SH"): dy = lift * 0.5
        vk = 0.35 if l.startswith("v") else 1
        out.append(mv(l, add(EXP_A, 4 + j), EXP_B, 22, dx=round(dx * vk, 3), dy=dy, dz=round(dz * vk, 3)))
    out.append(mv(f"{key}Lid", add(EXP_A, 2), EXP_B, 22, dx=round(dx, 3), dy=lift, dz=round(dz, 3)))
    return out
for key in ("pvd", "pvd2", "cvd", "ald"): EXPLODE += grp(key, FAC[key], 5.5, 5.5)
for key in ("cool", "degas"): EXPLODE += grp(key, FAC[key], 4.0, 3.5)
for key in ("llL", "llR"):
    dx, dz = pol(FAC[key], 3.2)
    for l in (key, f"{key}Door", f"v_{key}", f"vd_{key}"): EXPLODE.append(mv(l, add(EXP_A, 6), EXP_B, 22, dx=round(dx, 3), dz=round(dz, 3)))
    EXPLODE.append(mv(f"{key}Lid", add(EXP_A, 4), EXP_B, 22, dx=round(dx, 3), dy=3.2, dz=round(dz, 3)))
for l in ("efem", "eb", "ebB", "foup", "foupDoor0", "foupDoor1", "sign", "wf"): EXPLODE.append(mv(l, add(EXP_A, 8), EXP_B, 22, dz=6.5))
EXPLODE.append(mv("ffu", add(EXP_A, 6), EXP_B, 22, dz=6.5, dy=3.5))

# ═════════ s3 晶圓盒 → 負載鎖（大氣手臂刀片伸縮；全部緩入緩出）═════════
LLx, LLz = INFO["LL"]; FZ = INFO["FOUPZ"]; EBZ = INFO["EBZ"]
T3 = "s3:start+6"
def at3(n): return add(T3, n)
D_IN = round(FZ - EBZ, 3); D_LL = round(EBZ - LLz, 3)
S3 = [mv("foupDoor0", at3(0), at3(108), 12, dy=-2.7),
      mv("ebB", at3(6), FAR, 18, dz=D_IN),
      mv("ebB", at3(26), FAR, 7, dy=0.15), mv("wf", at3(26), FAR, 7, dy=0.15),
      mv("ebB", at3(35), FAR, 18, dz=-D_IN), mv("wf", at3(35), FAR, 18, dz=-D_IN),
      mv("llLDoor", at3(44), at3(100), 10, dy=1.5),
      mv("ebB", at3(56), FAR, 20, dz=-D_LL), mv("wf", at3(56), FAR, 20, dz=-D_LL),
      mv("ebB", at3(78), FAR, 7, dy=-0.15), mv("wf", at3(78), FAR, 7, dy=-0.15),
      mv("ebB", at3(87), FAR, 18, dz=D_LL)]
# 閘閥開（門板往下滑 1.2）：負載鎖內側在 s3「閘門」開，手臂拿完關；濺鍍腔在 s4 放片時開
S3 += [mv("vd_llL", "s3:gate-4", "s4:start+60", 10, dy=-1.2)]

# ═════════ s4 真空手臂（關節鏈 kin）：取片 → 縮回 → 轉向 → 伸進濺鍍腔 → 放到升降銷 → 縮回 ═════════
def pose(a, al): return {"j1": round(-a + al, 2), "j2": round(-2 * al, 2), "j3": round(al, 2)}
def alpha_for(dist): return round(math.degrees(math.acos((dist - INFO["BL"]) / (2 * INFO["L1"]))), 2)
A_LL, A_PVD = alpha_for(9.6), alpha_for(10.4)
FOLD = 85
KIN0 = {"arm": "vr", "at": "s1:start-40", "keys": [[0, {**pose(FAC["llL"], FOLD), "lift": 0}]]}
K4 = "s4:start-8"
keys4 = [[0, {**pose(FAC["llL"], FOLD), "lift": 0}], [22, pose(FAC["llL"], A_LL)], [30, {"lift": 0.02}], [38, {"lift": 0.22}],
         [60, pose(FAC["llL"], FOLD)], [98, pose(FAC["pvd"], FOLD)], [120, pose(FAC["pvd"], A_PVD)], [128, {"lift": 0.02}], [133, {"lift": -0.15}],
         [156, pose(FAC["pvd"], FOLD)], [170, {"lift": 0}]]
KIN4 = {"arm": "vr", "at": K4, "keys": keys4, "carry": [{"layer": "wf", "grab": 30, "release": 128}]}
S4 = [mv("vd_pvd", add(K4, 84), add(K4, 162), 10, dy=-1.2),
      mv("pvdPed", "s1:start-40", add(K4, 164), 16, dy=-0.7)]   # 基座先降下（升降銷頂著），放好、手臂退出後基座升上來把晶圓托住

# ═════════ 剖開（看裡面）：各幕把擋住的外殼藏起來，之後蓋回 ═════════
CUT = [hid("tcLid", "s3:start+80", "s5:start+20", 14), hid("llLLid", "s3:start-4", "s4:start+70", 12),
       hid("pvdLid", "s4:start+40", "s7:start-6", 14), hid("pvdBody", "s4:start+60", "s7:start-6", 14), hid("pvdShield", "s4:start+40", "s7:start-6", 14),
       hid("pvdTgt", "s4:start+40", "s5:start-14", 12), hid("pvdMag", "s4:start+40", "s5:start-14", 12),
       hid("cvdBody", "s7:start-14", "s8:start-6", 14),
       hid("sign", "s3:start-12", "s11:start-6", 12),
       *[hid(l, "s12:start-4", FAR, 14) for l in ("pvdLid", "pvdBody", "pvdShield", "pvdTgt", "pvdMag")], hid("aldBody", "s8:start-14", "s9:start-6", 14)]

# ═════════ 鏡頭推近時，焦點以外的模組退成半透明（不是消失；主素材＝焦點那一組，2D 卡不會蓋到它）═════════
ALL = [l["id"] for l in MODEL["layers"] if not l.get("bg")]
def focus(pred, a, b, o=0.22):
    return [{"layer": l, "at": a, "until": b, "opacity": o, "dur": 14} for l in ALL if not pred(l)]
isPVD = lambda l: (l.startswith("pvd") and not l.startswith("pvd2")) or l in ("v_pvd", "vd_pvd", "wf") or l.startswith("fP")
isCVD = lambda l: l.startswith("cvd") or l in ("v_cvd", "vd_cvd") or l.startswith("fC")
isALD = lambda l: l.startswith("ald") or l in ("v_ald", "vd_ald") or l.startswith("fA")
isIMP = lambda l: l.startswith("imp")
isS4 = lambda l: l in ("tc", "vr", "wf", "llL", "llLDoor", "v_llL", "vd_llL", "v_pvd", "vd_pvd", "main") or (l.startswith("pvd") and not l.startswith("pvd2")) or l.startswith("fP")
isS3 = lambda l: l in ("efem", "ffu", "eb", "ebB", "foup", "foupDoor0", "foupDoor1", "wf", "llL", "llLDoor", "llLLid", "v_llL", "vd_llL", "sign")
FOCUS = focus(isS3, "s3:start-2", "s4:start+16") + focus(isS4, "s4:start-2", "s5:start+16") + focus(isPVD, "s5:start-2", "s7:start+16") + focus(isCVD, "s7:start-2", "s8:start+16") + focus(isALD, "s8:start-2", "s9:start+16") \
      + focus(isIMP, "s9:start-2", "s11:start+16") + focus(isPVD, "s12:start-2", FAR)
P = {}
# s1：整台平台（看得出是一台大機台：前端 EFEM＋晶圓盒、中間八角傳送腔、後面一圈腔體）＋廠牌
P["s1"] = {"shot": [shot("start-30", 0, -2, 122, 28, 1), shot("start", 0, -2, 110, 30, 90)],
 "shift": VIS + EXPLODE + S3 + S4 + CUT + FOCUS, "kin": [KIN0],
 "run": [run("status", "start-30", FAR, 1), run("ffuAir", "start-30", "s4:start", 1), run("pvd2Glow0", "start-30", "s2:start", 1) if False else run("status", "start-30", FAR, 1)],
 "labels": [lab("sign", "應用材料", "United States", "amber", "amat", "s2:start-4", flag="US", logo="amat")],
 "overlay": [sec("amat-hook", "who", "s2:start-5", "設備五大-2", "示意，非實際比例", {"prev": "prev", "who": "who", "amat": "amat"})]}
P["s1"]["run"] = [run("status", "start-30", FAR, 1), run("ffuAir", "start-30", "s4:start", 1)]
# s2：爆炸分解（一次一張標籤，每張 ≥1.5 秒）
P["s2"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}], "shot": [shot("start-8", 0, -6, 140, 36, 36, yaw=-0.12)],
 "labels": [lab("vr", "傳送腔＋真空手臂", "Transfer chamber & robot", "blue", "start-2", "start+44"),
            lab("pvd", "濺鍍腔（PVD）", "PVD chamber", "amber", "start+46", "start+92"),
            lab("cvd", "化學氣相沉積腔", "CVD chamber", "blue", "start+94", "s3:start-6")],
 "overlay": [sec("amat-cluster", "start+2", "s3:start-5", "集群式平台（俯視）", "示意", {"mid": "mid", "ring": "ring", "many": "many", "vac": "vac"})]}
# s3：前端：晶圓盒 → 負載鎖
P["s3"] = {"shot": [shot("start-10", -2, -12, 100, 44, 30, yaw=0.12)],
 "run": [run("llAir", "vac-6", "gate-8", 6), run("llPump", "vac-6", "gate-6", 4), run("llReady", "gate-6", "s4:start+40", 4)],
 "labels": [lab("foup", "晶圓盒（FOUP）", "Wafer pod", "blue", "start", "start+60"),
            lab("ll", "負載鎖：抽真空", "Load lock", "amber", "start+62", "s4:start-4")],
 "overlay": [sec("amat-load", "start+2", "s4:start-5", "負載鎖：大氣 → 真空", "示意", {"foup": "foup", "ll": "ll", "vac": "vac", "gate": "gate"})]}
# s4：真空手臂搬運（從上往下看進傳送腔）
P["s4"] = {"shot": [shot("start-2", 2, -6, 100, 62, 30)], "kin": [KIN4],
 "labels": [lab("vr", "真空手臂", "Vacuum robot", "amber", "take", "s5:start-4")],
 "overlay": [sec("amat-move", "start+2", "s5:start-5", "手臂搬運的速度", "示意", {"take": "take", "turn": "turn", "acc": "acc", "stop": "stop", "put": "put"})]}
# s5–s6：濺鍍腔剖面（側視）
Y_PVD = math.atan2(INFO["PVD"][1], INFO["PVD"][0])
PVD_ATOMS = [f"pvdAtom{i}" for i in range(7)]; PVD_IONS = [f"pvdIon{i}" for i in range(4)]
P["s5"] = {"shot": [shot("start-2", 8.9, 3, 44, 18, 34, yaw=Y_PVD - (-0.3))],
 "run": [run("pvdGlow", "ar-6", "s7:start", 10), run("pvdArIn", "start", "s7:start", 8)] + [run(i, "ar+2", "s7:start", 8) for i in PVD_IONS] + [run(i, "atom-4", "s7:start", 10) for i in PVD_ATOMS] + [run("pvdSpin", "start", "s7:start-4", 20)],
 "labels": [lab("tgt", "銅靶材", "Copper target", "amber", "start+28", "atom-4"), lab("plasma", "氬電漿", "Argon plasma", "blue", "atom-2", "s6:start-4")],
 "overlay": [sec("amat-pvd", "start+2", "s6:start-5", "濺鍍（側視剖面）", "放大示意", {"ar": "ar", "tgt": "tgt", "atom": "atom", "land": "land"})]}
P["s6"] = {"shot": [shot("start-6", 8.9, 3, 44, 30, 30)],
 "labels": [lab("mag", "旋轉磁鐵（磁控）", "Rotating magnetron", "amber", "mag", "s7:start-4")],
 "overlay": [sec("amat-mag", "start+2", "s7:start-5", "磁鐵困住電漿（俯視靶面）", "示意", {"mag": "mag", "trap": "trap", "eat": "eat"}, act="pvdSpin")]}
# s7：CVD 剖面
Y_CVD = math.atan2(INFO["CVD"][1], INFO["CVD"][0])
CVD_G = [f"cvdA{i}" for i in range(5)] + [f"cvdB{i}" for i in range(5)]
P["s7"] = {"shot": [shot("start-2", 8.9, 3, 44, 10, 34, yaw=Y_CVD - Y_PVD)],
 "run": [run("cvdHeat", "start-6", "s8:start", 10)] + [run(g, "sh-4", "s8:start-4", 8) for g in CVD_G],
 "labels": [lab("sh", "噴頭（底面孔陣）", "Showerhead", "blue", "start+6", "film-26"), lab("heat", "加熱基座", "Heated pedestal", "amber", "film-22", "s8:start-4")],
 "overlay": [sec("amat-cvd", "start+2", "s8:start-5", "化學氣相沉積（側視）", "示意", {"cvd": "cvd", "sh": "sh", "even": "even", "film": "film"})]}
# s8：ALD：A 脈衝 → 吹淨 → B 脈衝 → 吹淨，一圈長一層
Y_ALD = math.atan2(INFO["ALD"][1], INFO["ALD"][0])
AA = [f"aldA{i}" for i in range(5)]; AB = [f"aldB{i}" for i in range(5)]; AP_ = [f"aldP{i}" for i in range(5)]
ald_run = [run("aldHeat", "start-6", "s9:start", 10)]
for i, c in enumerate(ALD_C):
    ald_run += [run(g, c, add(c, 12), 5) for g in AA] + [run(g, add(c, 12), add(c, 20), 5) for g in AP_] + [run(g, add(c, 20), add(c, 32), 5) for g in AB] + [run(g, add(c, 32), add(c, 40), 5) for g in AP_]
P["s8"] = {"shot": [shot("start-2", 8.9, 3, 44, 10, 34, yaw=Y_ALD - Y_CVD)], "run": ald_run,
 "labels": [lab("aldF", "一圈一層", "One layer per cycle", "amber", "cycle", "s9:start-4", xy=[600, 300])],
 "overlay": [sec("amat-ald", "start+2", "s9:start-5", "原子層沉積：一圈四步", "示意（每圈約 0.1 奈米）", {"ald": "ald", "turns": "turns", "cycle": "cycle", "one": "one"})]}
# s9–s10：離子佈植機（另一台，鏡頭往右移過去）
IMPI = INFO["IMP"]
P["s9"] = {"shot": [shot("start-2", 47, 0, 100, 40, 32, yaw=0 - Y_ALD)],
 "run": [run("srcGlow", "src-6", FAR, 8), run("ionSel", "mag-4", "s11:start", 8), run("ionLight", "mag-4", "s10:start+20", 8), run("ionHeavy", "mag-4", "s10:start+20", 8)],
 "labels": [lab("src", "離子源", "Ion source", "blue", "start+30", "mag-2"), lab("magnet", "分析磁鐵", "Analyzer magnet", "amber", "mag", "s10:start-4")],
 "overlay": [sec("amat-imp", "start+30", "s10:start-5", "磁鐵挑離子（俯視）", "示意", {"imp": "imp", "src": "src", "mag": "mag", "pick": "pick"})]}
P["s10"] = {"shot": [shot("start-2", 52, 1, 70, 26, 34)],
 "run": [run("accGlow", "acc-6", "s11:start", 8), run("ionAcc", "acc-4", "s11:start", 8), run("ionHit", "hit-8", "s11:start", 8), run("scanSweep", "hit-8", "s11:start", 12)],
 "labels": [lab("acc", "加速管", "Accelerator", "amber", "start-2", "hit-2"), lab("end", "晶圓（傾斜平台）", "Wafer on tilted platen", "blue", "hit", "s11:start-4")],
 "overlay": [sec("amat-acc", "start+2", "s11:start-5", "打進表面底下", "示意（深度、劑量不標）", {"acc": "acc", "hit": "hit", "cond": "cond"})]}
P["s11"] = {"shot": [shot("start-2", 0, -2, 110, 26, 40, yaw=-0.3)],
 "labels": [lab("sign", "應用材料", "United States", "amber", "us", "s12:start-4", flag="US", logo="amat")],
 "overlay": [sec("amat-co", "start+2", "s12:start-5", "應用材料", "公司財報、研究機構、官網", {"us": "us", "no2": "no2", "tw": "tw"}, h=360, y=1040)]}
P["s12"] = {"shot": [shot("start-2", 8.9, 2, 48, 40, 34, yaw=Y_PVD - (-0.3))],
 "labels": [lab("wfP", "鋪好的銅膜", "Deposited film", "amber", "film", "s13:start-4", xy=[600, 300])],
 "overlay": [sec("amat-next", "start+2", "s13:start-5", "接下來", "下一集：設備五大-3", {"film": "film", "etch": "etch", "next": "next", "kw": "kw"})]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/26", "noteAlways": True}
levels = [lv("tool", "集群式沉積平台（示意）", "CLUSTER TOOL", "4 m", "1 m")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-amat", "prevEpisode": "設備五大-1：ASML", "title": "設備五大-2：應用材料（科技透明圈）", "asOf": "2026/11/26", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
                 "_說明": "旁白金手指：2.5＋Iapetus＋說明 B（捲舌音要念清楚）；音高關卡 tts-pitch-take.sh（112～126 Hz）；本支尚未配音"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定機型"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["誰來鋪", "薄膜？"], "sub": "設備五大-2：應用材料", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] + s.get("pauseAfter", 0) for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
