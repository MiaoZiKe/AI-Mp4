"""tech-fa 腳本產生器：python3 videos/tech-fa/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
中游補充篇 M6：材料分析與故障分析（前一集 M5 光罩盒與晶圓載具；下一集 3-1 晶圓切割與薄化）。念稿定稿於 script.md（頻道負責人 2026/11/28 核准；
替身字只在 tts：X 光→艾克斯光）。2D 卡：src/components/three/HudFa.tsx（fa-*）。構造：physics-spec.md；模組：visual-spec.md。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
AS_OF = "2026/11/28"
S = [
("s1", "hook", "前一集說晶片會壞，壞在哪，誰來找？交給第三方實驗室，像幫晶片看病的醫院。",
 ["前一集說晶片會壞", "壞在哪", "誰來找？", "交給第三方實驗室", "像幫晶片看病的醫院"],
 ["Last episode: chips still fail.", "Where's the fault,", "and who finds it?", "A third-party lab,", "like a hospital for chips."],
 [("prev", "前一集"), ("fail", "會壞"), ("q", "誰來找"), ("lab", "第三方實驗室"), ("hosp", "醫院")], ["前一集", "第三方實驗室", "醫院"], ["示意動畫，不是量測"]),
("s2", "mechanism", "晶片先通電，壞掉的地方會發出微弱的光和熱，像熱像儀找發燒的人。",
 ["晶片先通電", "壞掉的地方", "會發出微弱的光和熱", "像熱像儀", "找發燒的人"],
 ["First, power the chip.", "The broken spot", "gives off faint light and heat,", "like a thermal camera", "spotting someone with a fever."],
 [("pow", "通電"), ("bad", "壞掉的地方"), ("light", "光和熱"), ("cam", "熱像儀"), ("fever", "發燒")], ["通電", "光和熱", "熱像儀"],
 ["Thermo Fisher；AnySilicon；示意動畫"]),
("s3", "mechanism", "找到位置才動刀。聚焦離子束像極細的噴砂槍，一點點挖出剖面。",
 ["找到位置才動刀", "聚焦離子束", "像極細的噴砂槍", "一點點挖出剖面"],
 ["Only once it's located do we cut.", "A focused ion beam", "works like a super-fine sandblaster,", "digging out a cross-section bit by bit."],
 [("loc", "找到位置"), ("cut", "動刀"), ("fib", "聚焦離子束"), ("sand", "噴砂槍"), ("dig", "挖出剖面")], ["動刀", "聚焦離子束", "噴砂槍"],
 ["Waterloo QNFCF；EPFL CMI；示意動畫"]),
("s4", "mechanism", "再削成約一百奈米的薄片，薄到電子穿得過去。",
 ["再削成約一百奈米", "的薄片", "薄到電子穿得過去"],
 ["Then it's thinned to about 100 nm", "into a slice", "thin enough for electrons to pass."],
 [("trim", "削成"), ("nm", "一百奈米"), ("slice", "薄片"), ("pass", "穿得過去")], ["一百奈米", "薄片", "電子"],
 ["Waterloo QNFCF；USPTO 7196338；示意（放大）"]),
("s5", "mechanism", "電子顯微鏡用電子代替光，薄膜哪裡斷、哪裡歪，一清二楚。",
 ["電子顯微鏡", "用電子代替光", "薄膜哪裡斷", "哪裡歪", "一清二楚"],
 ["An electron microscope", "uses electrons instead of light;", "where a film breaks", "or bends", "becomes crystal clear."],
 [("tem", "電子顯微鏡"), ("elec", "電子代替光"), ("brk", "哪裡斷"), ("bend", "哪裡歪"), ("clear", "一清二楚")], ["電子顯微鏡", "電子", "一清二楚"],
 ["Thermo Fisher wp0035；AnySilicon；示意動畫"]),
("s6", "twist", "成分分析也靠電子，元素放出的 X 光各不同，像指紋，一比就知道混進什麼。",
 ["成分分析也靠電子", "元素放出的 X 光", "各不同", "像指紋", "一比就知道混進什麼"],
 ["Composition analysis uses electrons too:", "the X-rays each element gives off", "are all different,", "like fingerprints,", "so one match shows what got mixed in."],
 [("comp", "成分分析"), ("elem", "元素"), ("diff", "各不同"), ("finger", "指紋"), ("mix", "混進什麼")], ["成分分析", "X 光", "指紋"],
 ["Thermo Fisher；AnySilicon（EDS）；能譜是示意，不是量測"]),
("s7", "payoff", "機台貴、要專人操作，所以晶圓廠和設計公司常送出去做。",
 ["機台貴", "要專人操作", "所以晶圓廠", "和設計公司", "常送出去做"],
 ["The tools are expensive", "and need specialists,", "so fabs", "and chip-design firms", "often send the work out."],
 [("cost", "機台貴"), ("staff", "專人操作"), ("fab", "晶圓廠"), ("des", "設計公司"), ("send", "送出去")], ["機台貴", "專人", "送出去"],
 ["示意動畫，不是量測"]),
("s8", "payoff", "台灣有宜特，做故障分析和可靠度驗證。閎康以材料分析為主，日本也有據點。",
 ["台灣有宜特", "做故障分析", "和可靠度驗證", "閎康以材料分析為主", "日本也有據點"],
 ["In Taiwan, iST", "does failure analysis", "and reliability testing.", "MA-tek focuses on materials analysis,", "with labs in Japan too."],
 [("ist", "宜特"), ("fa", "故障分析"), ("rel", "可靠度"), ("ma", "閎康"), ("jp", "日本")], ["宜特", "閎康", "日本"],
 ["工商時報、DIGITIMES、聯合報報導；截至 2026/11/28"]),
("s9", "cta", "中游到這裡講完了，晶圓做好、驗過，接著要切成一顆顆晶片，下一集看晶圓切割。留言故障分析，拿完整資料。",
 ["中游到這裡講完了", "晶圓做好、驗過", "接著要切成", "一顆顆晶片", "下一集看晶圓切割", "留言故障分析", "拿完整資料"],
 ["That wraps up the midstream.", "Wafers made and verified", "next get cut", "into individual chips.", "Next episode: wafer dicing.", "Comment \"failure analysis\"", "for the full notes."],
 [("mid", "中游"), ("done", "驗過"), ("cut", "切成"), ("chips", "一顆顆晶片"), ("next", "下一集"), ("kw", "留言故障分析")], ["中游", "晶圓切割", "故障分析"],
 ["示意動畫，不是量測"]),
]
def TTS(t):
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("矽", "細"), ("光罩", "光照"), ("X 光", "艾克斯光")]:
        t = t.replace(a, b)
    return t
scenes = []
HOLD = {"s3": 0.7, "s5": 0.7, "s8": 0.7}   # 第 39 條：holdSec ≤0.7
for i, (sid, beat, nar, zh, en, cues, kws, src) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？、；]", "", z)) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？、；]", "", z)) >= 3, ("字幕短語 <3 字", sid, z)
    assert re.sub(r"[ ，。？、；：]", "", "".join(zh)) == re.sub(r"[ ，。？、；：]", "", nar), (sid, "字幕和念稿不同")
    for c in cues: assert c[1] in nar and c[1] in "".join(zh), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar))
    head = 0.0 if sid == "s1" else 0.3
    hold = HOLD.get(sid, 0.6)
    dur = round(head + nch / 5.2 + 0.2 + hold, 1)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
md = open(os.path.join(HERE, "script.md")).read().split("---")[0].split("\n\n")[1:]
paras = [p.strip() for p in md if p.strip()]
assert [s["narration"] for s in scenes] == paras, ("念稿與 script.md 不同", [s["narration"] for s in scenes], paras)
scenes[0]["props"]["hook"] = {"kicker": "接上集：光罩盒", "title": "晶片壞在哪？", "size": 96, "top": 236}
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "晶圓切割與薄化", "trail": ["故障分析：先定位、再切開、再看清楚"], "comment": "故障分析", "logoAnim": "transparent"}}})

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
    assert lay in LAYERS, lay
    prev = T0
    for a, b in wins:
        if a != T0: VIS.append(hid(lay, prev, a, dur))
        prev = b
    if prev != FAR: VIS.append(hid(lay, prev, FAR, dur))
def move(lay, a, b, dur=22, **kw):
    assert lay in LAYERS, lay
    VIS.append(mv(lay, a, b, dur, **kw))
C = "voice-3"
CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw):
    return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)
def T(sid): return {c[0]: c[0] for c in next(s for s in S if s[0] == sid)[5]}

# ── 各站的層只在自己那幕看得到（主素材框不會把別站、畫面外的層算進去）──
ST = {"a": "s1", "b": "s2", "c": "s3", "d": "s4", "e": "s5", "f": "s6", "g": "s7", "h": "s8", "n": "s9"}
for lay in LAYERS:
    sid = ST.get(lay[0]); n = int(sid[1:])
    a = T0 if n == 1 else f"{sid}:start-20"; b = FAR if n == 9 else f"s{n + 1}:start+20"
    vis(lay, [(a, b)], 2)
vis("aLab", [("s1:lab+46", "s2:start+20")], 10)
# s2：暗箱門開著讓人看到裡面 → 量測前關上 → 量測期間整個暗箱變半透明（剖開示意）
for d in ["bBoxBack", "bDoorL", "bDoorR"]: VIS.append(hid(d, "s2:bad-14", "s3:start+20", 10, 0.2))
# ── 站 A：s1 故障晶片紅光閃；念到「實驗室」送樣箭頭沿地面走到後方實驗室 ──
# ── 站 B：s2 暗箱門打開 → 探針下降接觸銲墊 → 門關上、暗箱半透明 → 熱點亮、光子往上進物鏡、熱圈由內往外錯開擴散 ──
vis("bHot", [("s2:bad-6", FAR)], 6)
move("bTips", T0, "s2:pow+2", 16, dy=0.3)
# ── 站 C：s3 先看組好的雙束機（≥20 幀）→ 前門打開、電子束鏡筒沿軸往上抽出、離子束鏡筒沿 52° 軸往外抽出 → 一次一張標籤 → 組回、門關回
#    → 門變半透明（剖開示意）、鏡頭推到撞擊點 → 離子束等速打樣品、濺射原子直線放射（≥2 秒）──
IC = INFO["ICOL"]
move("cEcol", "s3:start+22", "s3:start+112", 22, dy=2.2)
move("cIcol", "s3:start+22", "s3:start+112", 22, dx=IC["dx"], dy=IC["dy"])
VIS.append(hid("cDoor", "s3:start+116", "s4:start+20", 8, 0.18))
for lay in ["cChamber", "cEcol", "cIcol", "cGis", "cBase", "cCon"]: VIS.append(hid(lay, "s3:start+116", "s4:start+20", 10, 0.25))   # 推近撞擊點：外殼與鏡筒剖開示意
# ── 站 D：s4 鎢針靠近、焊上 → 薄片（連同兩側多餘的厚度）跟著針提起、送到銅載網柱邊 → 在載網上離子束貼著兩面往下削，兩側多餘層依序消失 ──
LF = INFO["LIFT"]
move("dNeedle", T0, "s4:start+16", 18, dx=2.2, dy=2.0)
for lay in ["dLam", "dSkinA", "dSkinB"]: move(lay, "s4:start+20", FAR, 30, dx=LF["dx"], dy=LF["dy"])
move("dNeedle", "s4:start+20", "s4:start+50", 28, dx=LF["dx"], dy=LF["dy"])        # 跟著薄片送到載網
move("dNeedle", "s4:start+50", FAR, 12, dx=2.2, dy=2.0)                            # 焊上載網後切斷，鎢針退出
vis("dWeldG", [("s4:start+48", FAR)], 6)
vis("dSkinA", [(T0, "s4:start+88")], 12); vis("dSkinB", [(T0, "s4:start+116")], 12)
# ── 站 E：s5 鏡筒上段沿垂直軸往上分開、相機往前抽出 → 三張標籤 → 合回 → 電子束收斂、穿過薄片、放大散開到相機 ──
for lay, d in INFO["EXP"].items():
    if d: move(lay, "s5:start+6", "s5:start+96", 18, dy=d)
move("eHolder", "s5:start+6", "s5:start+96", 18, dx=1.2, dy=INFO["EXP"]["eObj"])
move("eCam", "s5:start+6", "s5:start+96", 18, dz=1.6)
# ── 站 G：s7 念到「送出去」兩個送樣盒沿道路走到實驗室（起步加速、到站減速）──
move("gBoxA", "s7:send-4", FAR, 40, dx=round(INFO["GX"] + 6.3 - (INFO["GX"] - 7), 3))
move("gBoxB", "s7:send+4", FAR, 32, dx=round(INFO["GX"] + 7.5 - INFO["GX"] - 0.2, 3))

# ═════ 各幕（看向 x, y, 距離, 仰角）═════
AX, BX, CX, DX, EX, FX, GX, HX, NX, GT = (INFO[k] for k in ["AX", "BX", "CX", "DX", "EX", "FX", "GX", "HX", "NX", "GT"])
AV = (AX + 0.2, 0.9, 21, 30); AV2 = (AX + 0.6, 2.4, 56, 14)
BV = (BX, 4.6, 36, 12); BC = (BX + 0.1, GT + 1.6, 34, 28); BV2 = (BX, GT + 2.9, 38, 4)
CV = (CX - 1.0, 5.6, 46, 10); CC2 = (CX, INFO["SY"] - 0.5, 12, 16)
DV = (DX - 2.6, 2.75, 30, 30)
EV = (EX, 6.4, 54, 8); EV2 = (EX, 5.0, 32, 8)
DS = (INFO["LAMC"][0], INFO["LAMC"][1] - 2.6, 22, 52)
FV = (FX + 1.6, 2.3, 23, 16)
GV = (GX + 0.4, 3.2, 44, 14)
HV = (HX, 4.2, 40, 10)
NV = (NX - 0.6, 0.9, 24, 26)
def S_(at, v, dur=30, yaw=None): return shot(at, v[0], v[1], v[2], v[3], dur, yaw)
P = {}
P["s1"] = {"shot": [S_("start-30", AV, 1, yaw=0.0), S_("lab+34", AV2, 22)], "shift": VIS,
 "run": [run("aFailGlow", "start", "s2:start", 6), run("aSend", "lab+48", "s2:start", 6)],
 "labels": [lab("aChipA", "故障晶片：插在測試板上", "Failed chip on a test board", "amber", "start+1", "lab-2"),
            lab("aLabA", "第三方實驗室（示意）", "Third-party lab (illustrative)", "blue", "lab+52", "s2:start")],
 "overlay": [sec("fa-hook", "start", nxt("s1"), "中游補充篇・M6", "示意", {"prev": "prev", "fail": "fail", "q": "q", "lab": "lab", "hosp": "hosp"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "loc", "at": CC, "dur": 1}],
 "shot": [S_(CC, BV, 1), S_("bad-12", BC, 28), S_("cam-4", BV2, 26)],
 "run": [run("bDoorLOpen", "start-2", "bad-18", 18), run("bDoorROpen", "start-2", "bad-18", 18),
         run("bHotGlow", "bad-4", "s3:start", 8), run("bPhot", "light-4", "s3:start", 6)] + [run(f"bHeat{i}", f"light+{4 + 6 * i}", "s3:start", 8) for i in range(3)],
 "labels": [lab("bDoorA", "暗箱：擋掉外面的光", "Dark box blocks outside light", "blue", "start+14", "bad-20"),
            lab("bHotA", "壞的地方：發光、發熱", "Fault spot: emits light and heat", "amber", "bad-10", "cam-6"),
            lab("bCamA", "冷卻相機：拍下微弱的光", "Cooled camera catches faint light", "blue", "cam-2", "s3:start")],
 "overlay": [card("s2", "fa-loc", "先定位：通電找光和熱", "示意（暗箱半透明剖開）", T("s2"))]}
P["s3"] = {"zoom": [{"to": "fib", "at": CC, "dur": 1}],
 "shot": [S_(CC, CV, 1), S_("start+116", CC2, 24)],
 "run": [run("cDoorOpen", "start+22", "start+112", 22), run("cEbeam", "start+124", "s4:start", 6), run("cIon", "start+124", "s4:start", 6)] + [run(f"cSput{k}", f"start+{130 + 2 * k}", "s4:start", 6) for k in range(5)],
 "labels": [lab("cEcolA", "電子束鏡筒：負責看", "Electron column: imaging", "blue", "start+30", "start+75"),
            lab("cIcolA", "離子束鏡筒：鎵離子負責挖", "Ion column: gallium ions mill", "amber", "start+78", "start+123", xy=[420, 330]),
            lab("cStageA", "樣品台（門剖開示意）", "Stage (door cut away)", "blue", "start+126", "s4:start-8", xy=[540, 330])],
 "overlay": [card("s3", "fa-fib", "再動刀：聚焦離子束挖剖面", "示意", T("s3"))]}
P["s4"] = {"zoom": [{"to": "lam", "at": CC, "dur": 1}],
 "shot": [S_("start", DV, 1), S_("start+64", DS, 1)],
 "run": [run("dThinA", "start+62", "start+90", 6), run("dThinB", "start+90", "start+118", 6)],
 "labels": [lab("dNeedleA", "鎢針先把薄片提到載網", "Needle moves it to a grid", "blue", "start+2", "start+50", xy=[600, 300]),
            lab("dLamA", "在載網上削到約 100 nm", "Thinned to ~100 nm on the grid", "amber", "start+72", "s5:start", xy=[480, 300])],
 "overlay": [card("s4", "fa-lam", "削成薄片：電子穿得過去", "示意（放大）", T("s4"))]}
P["s5"] = {"zoom": [{"to": "tem", "at": CC, "dur": 1}],
 "shot": [S_(CC, EV, 1), S_("start+96", EV2, 20)],
 "run": [run("eCoilGlow", "start+92", "s6:start", 10)] + [run(f"eBeam{k}", "start+96", "s6:start", 6) for k in range(5)],
 "labels": [lab("eGunA", "電子槍＋聚光鏡：射出、聚焦", "Gun + condenser: emit and focus", "blue", "start+8", "start+56", xy=[540, 300]),
            lab("eHolderA", "樣品桿：薄片放這裡", "Holder: the lamella sits here", "amber", "start+58", "start+106", xy=[680, 300]),
            lab("eProjA", "投影鏡＋相機：放大成像", "Projector + camera: magnified image", "blue", "start+108", "s6:start")],
 "overlay": [card("s5", "fa-tem", "電子顯微鏡：用電子代替光", "示意", T("s5"))]}
P["s6"] = {"zoom": [{"to": "eds", "at": CC, "dur": 1}],
 "shot": [S_(CC, FV, 1)],
 "run": [run("fEbeam", "start-6", "s7:start", 6), run("fXsi", "elem-4", "s7:start", 6), run("fXcu", "elem+6", "s7:start", 6), run("fXcl", "mix-10", "s7:start", 6), run("fPartGlow", "mix-6", "s7:start", 6)],
 "labels": [lab("fEdsA", "X 光偵測器（EDS）", "X-ray detector (EDS)", "blue", "start+6", "mix-14"),
            lab("fPartA", "混進的顆粒", "A contaminant particle", "amber", "mix-10", "s7:start")],
 "overlay": [card("s6", "fa-eds", "成分分析：X 光像指紋", "能譜是示意", T("s6"))]}
P["s7"] = {"zoom": [{"to": "out", "at": CC, "dur": 1}],
 "shot": [S_(CC, GV, 1)],
 "labels": [lab("gLabA", "實驗室：機台貴、要專人", "Lab: costly tools, specialists", "blue", "start+4", "fab-8"),
            lab("gFabA", "晶圓廠、設計公司送樣", "Fabs and design firms send samples", "amber", "fab-4", "s8:start")],
 "overlay": [card("s7", "fa-out", "為什麼送出去做", "示意", T("s7"))]}
P["s8"] = {"zoom": [{"to": "tw", "at": CC, "dur": 1}],
 "shot": [S_(CC, HV, 1)],
 "labels": [lab("hAA", "實驗室（示意建築）", "Lab (illustrative building)", "blue", "ist", "ma-4"),
            lab("hBA", "實驗室（示意建築）", "Lab (illustrative building)", "amber", "ma", "s9:start")],
 "overlay": [card("s8", "fa-tw", "台灣的分析實驗室", "媒體報導；截至 2026/11/28", T("s8"), h=392, y=1000)]}
P["s9"] = {"zoom": [{"to": "next", "at": CC, "dur": 1}],
 "shot": [S_("start", NV, 1)],
 "run": [run("nSpin", "cut-6", "s10:start", 12), run("nWater", "cut", "s10:start", 6)],
 "labels": [lab("nBladeA", "切割刀（下一集）", "Dicing blade (next episode)", "amber", "cut", "s10:start")],
 "overlay": [sec("fa-next", C, "s10:start", "下一集：晶圓切割與薄化", "留言「故障分析」", T("s9"), cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": f"查證截至 {AS_OF}", "noteAlways": True}
levels = [lv("start", "故障晶片（示意）", "FAILED CHIP", "30 cm", "3 cm"), lv("loc", "微光顯微鏡定位（示意）", "FAULT ISOLATION", "2 m", "20 cm"),
          lv("fib", "聚焦離子束雙束機（示意）", "DUAL-BEAM FIB", "3 m", "30 cm"), lv("lam", "剖面與薄片（放大示意）", "LAMELLA", "20 µm", "2 µm"),
          lv("tem", "穿透式電子顯微鏡（示意）", "TEM", "3 m", "30 cm"), lv("eds", "成分分析 EDS（示意）", "EDS", "5 mm", "0.5 mm"),
          lv("out", "送樣到第三方實驗室（示意）", "OUTSOURCED LAB", "100 m", "10 m"), lv("tw", "台灣分析實驗室", "TAIWAN LABS", "100 m", "10 m"), lv("next", "晶圓切割（下一集）", "NEXT", "1 m", "10 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-fa", "prevEpisode": "M5：光罩盒與晶圓載具", "title": "材料分析與故障分析（科技透明圈）", "asOf": AS_OF, "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "中游補充篇", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["晶片壞在哪？", "送實驗室找原因"], "sub": "定位→切片→電子顯微鏡→成分分析", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
for s in scenes:
    t = s.get("tts") or ""
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字／英文"))
    for w in ["量測", "矽", "光罩"]:
        if w in t: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("narration") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
