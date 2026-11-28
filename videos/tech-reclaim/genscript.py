"""tech-reclaim 腳本產生器：python3 videos/tech-reclaim/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
中游補充篇 M4：再生晶圓（前一集 M3 化合物半導體 SiC／GaN；下一集 M5 光罩盒與晶圓載具）。念稿定稿於 script.md（頻道負責人 2026/11/28 核准；
念稿「光照」＝字幕「光罩」）。2D 卡：src/components/three/HudReclaim.tsx（reclaim-*）。構造：physics-spec.md；模組：visual-spec.md。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
AS_OF = "2026/11/28"
S = [
("s1", "hook", "前一集說的測試片，到底拿來幹嘛？它們不做晶片，專門用來測機台。",
 ["前一集說的測試片", "到底拿來幹嘛？", "它們不做晶片", "專門用來測機台"],
 ["Last episode's test wafers:", "what are they actually for?", "They never become chips;", "they're just for testing tools."],
 [("prev", "前一集"), ("test", "測試片"), ("q", "幹嘛"), ("chip", "不做晶片"), ("tool", "測機台")], ["前一集", "測試片", "測機台"], ["示意動畫，不是量測"]),
("s2", "mechanism", "機台開工前，先放一片空白晶圓試跑，像廚師先試一口湯，測膜厚、數灰塵。",
 ["機台開工前", "先放一片", "空白晶圓試跑", "像廚師先試一口湯", "測膜厚", "數灰塵"],
 ["Before a tool starts work,", "it first runs", "a blank test wafer,", "like a chef tasting the soup,", "then measures film thickness", "and counts dust."],
 [("tool", "機台"), ("blank", "空白晶圓"), ("run", "試跑"), ("soup", "試一口湯"), ("film", "測膜厚"), ("dust", "數灰塵")], ["空白晶圓", "試一口湯", "灰塵"],
 ["USPTO 5711848（測試晶圓）；示意動畫，不是量測"]),
("s3", "mechanism", "另一種叫擋片，補在爐管空位，像烤盤沒排滿，用假餅乾補位，熱才均勻。",
 ["另一種叫擋片", "補在爐管空位", "像烤盤沒排滿", "用假餅乾補位", "熱才均勻"],
 ["Another kind is the dummy wafer,", "filling empty furnace slots,", "like a half-full baking tray", "padded with fake cookies", "so the heat stays even."],
 [("dum", "擋片"), ("gap", "空位"), ("tray", "烤盤"), ("cookie", "假餅乾"), ("heat", "均勻")], ["擋片", "爐管", "均勻"],
 ["SEMI 中文 zh-46236；USPTO 7955956；示意動畫"]),
("s4", "twist", "這些片子跑一趟就沾滿薄膜，丟掉太貴，所以送去再生。",
 ["這些片子跑一趟", "就沾滿薄膜", "丟掉太貴", "所以送去再生"],
 ["After one run, these wafers", "are coated with films.", "Tossing them costs too much,", "so they get reclaimed."],
 [("run", "跑一趟"), ("film", "薄膜"), ("toss", "丟掉"), ("ship", "再生")], ["薄膜", "太貴", "再生"],
 ["數位時代、科技新報報導；示意（膜厚放大）"]),
("s5", "mechanism", "第一步泡藥水，把薄膜和金屬一層層溶掉，像幫鍋子去油垢。",
 ["第一步泡藥水", "把薄膜和金屬", "一層層溶掉", "像幫鍋子去油垢"],
 ["Step one: a chemical bath", "that dissolves films and metal", "layer by layer,", "like degreasing a pan."],
 [("dip", "泡藥水"), ("metal", "金屬"), ("layer", "一層層"), ("pan", "鍋子")], ["泡藥水", "一層層", "去油垢"],
 ["USPTO 7775856、6458712；示意動畫"]),
("s6", "mechanism", "接著研磨、拋光回到鏡面，再清洗、檢查刮傷和微粒。",
 ["接著研磨", "拋光回到鏡面", "再清洗", "檢查刮傷和微粒"],
 ["Then grinding", "and polishing back to a mirror,", "then cleaning,", "and checking for scratches and particles."],
 [("grind", "研磨"), ("pol", "拋光"), ("mirror", "鏡面"), ("clean", "清洗"), ("insp", "檢查")], ["研磨", "鏡面", "微粒"],
 ["USPTO 6276997（研磨拋光）；示意動畫"]),
("s7", "payoff", "每磨一次就薄一點，一片大約能用六到二十次，太薄就淘汰。",
 ["每磨一次就薄一點", "一片大約能用", "六到二十次", "太薄就淘汰"],
 ["Each pass makes it thinner;", "one wafer can be used", "about six to twenty times,", "then it's too thin and retired."],
 [("thin", "薄一點"), ("use", "能用"), ("n", "六到二十次"), ("out", "淘汰")], ["薄一點", "六到二十次", "淘汰"],
 ["數位時代（業者說法）；USPTO 7732303；示意（厚度放大）"]),
("s8", "payoff", "台灣有昇陽半，產能全球數一數二。中砂是做砂輪起家的，再生占它營收大約一半。辛耘代理設備，也自己做再生。",
 ["台灣有昇陽半", "產能全球數一數二", "中砂是做砂輪起家的", "再生占它營收", "大約一半", "辛耘代理設備", "也自己做再生"],
 ["In Taiwan, PSI", "ranks near the top in global capacity.", "Kinik started with grinding wheels;", "reclaim makes up", "about half its revenue.", "Scientech distributes equipment", "and does its own reclaim too."],
 [("psi", "昇陽半"), ("cap", "數一數二"), ("kinik", "中砂"), ("wheel", "砂輪"), ("half", "一半"), ("sci", "辛耘"), ("self", "自己做再生")], ["昇陽半", "中砂", "辛耘"],
 ["聯合報、工商時報、財訊報導；截至 2026/11/28"]),
("s9", "cta", "因為晶圓不能沾灰塵，來回運送全靠密封盒。下一集看光罩盒與晶圓載具。留言再生晶圓，拿完整資料。",
 ["因為晶圓不能沾灰塵", "來回運送", "全靠密封盒", "下一集看", "光罩盒與晶圓載具", "留言再生晶圓", "拿完整資料"],
 ["Because wafers can't touch dust,", "every trip back and forth", "relies on sealed boxes.", "Next episode:", "mask pods and wafer carriers.", "Comment \"reclaim\"", "for the full notes."],
 [("dust", "灰塵"), ("move", "來回運送"), ("box", "密封盒"), ("next", "下一集"), ("pod", "光罩盒"), ("kw", "留言再生晶圓")], ["灰塵", "密封盒", "光罩盒"],
 ["示意動畫，不是量測"]),
]
def TTS(t):
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("矽", "細"), ("光罩", "光照")]:
        t = t.replace(a, b)
    return t
scenes = []
HOLD = {"s6": 0.7, "s3": 0.7, "s4": 0.7, "s8": 0.7}   # 第 39 條：holdSec ≤0.7
for i, (sid, beat, nar, zh, en, cues, kws, src) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？、；]", "", z)) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？、；]", "", z)) >= 3, ("字幕短語 <3 字", sid, z)
    assert re.sub(r"[ ，。？、；：]", "", "".join(zh)) == re.sub(r"[ ，。？、；：]", "", nar), (sid, "字幕和念稿不同")
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar))
    head = 0.0 if sid == "s1" else 0.3
    hold = HOLD.get(sid, 0.6)   # 第 39 條：念完 hold 秒換幕（＋下一幕開口前 0.3 秒＝無聲 ≤1.0 秒）
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
assert [s["tts"] for s in scenes] == paras, ("念稿與 script.md 不同", [s["tts"] for s in scenes], paras)
scenes[0]["props"]["hook"] = {"kicker": "接上集：化合物", "title": "不做晶片的晶圓？", "size": 92, "top": 236}
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "光罩盒與晶圓載具", "trail": ["再生晶圓：測試片磨掉一層再用"], "comment": "再生晶圓", "logoAnim": "transparent"}}})

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
    """依「可見區間」清單產生隱藏：區間之外全藏。a＝T0 表示一開始就看得到；b＝FAR 表示一直看到片尾"""
    assert lay in LAYERS, lay
    prev = T0
    for a, b in wins:
        if a != T0: VIS.append(hid(lay, prev, a, dur))
        prev = b
    if prev != FAR: VIS.append(hid(lay, prev, FAR, dur))
def drop(lay, at, dy=1.6, dur=12, bounce=0.06):
    """從上方受重力落下（之前不顯示）"""
    assert lay in LAYERS, lay
    VIS.append({"layer": lay, "at": T0, "until": at, "dur": dur, "dy": dy, "fallIn": True, "bounce": bounce, "opacity": 0})
def move(lay, a, b, dur=22, **kw):
    assert lay in LAYERS, lay
    VIS.append(mv(lay, a, b, dur, **kw))
C = "voice-3"
CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw):
    return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)

# ── 站 A：s1 念到「測試片」那片空白測試片沿滑槽往前抽出（抽到 2.2，整片離開盒子前緣）、發白光 ──
move("aTest", "s1:test-4", "s2:start", 24, dz=2.2)
# ── 站 B：s2 腔內電漿亮、噴頭噴氣、膜長出來 → 晶圓經閘門送到量測台（箭頭；腔內那片收掉、量測台那片滑進來）→ 斜射光測膜厚 → 雷射掃過，微粒被掃到才亮 ──
vis("bPlasma", [("s2:blank-8", "s2:run+12")], 6)
vis("bFilm", [("s2:run-4", "s2:run+14")], 12); vis("bCW", [(T0, "s2:run+14")], 8)
move("bMW", T0, "s2:run+16", 12, dx=-1.2, opacity=0)
vis("bScan", [("s2:film+2", FAR)], 4); vis("bDust", [("s2:film+2", FAR)], 4)
TL = json.load(open(os.path.join(HERE, "timeline.json"))) if os.path.exists(os.path.join(HERE, "timeline.json")) else None
def cue_abs(sid, cid):
    for s in (TL or {}).get("scenes", []):
        if s["id"] == sid:
            if cid == "start": return s["startFrame"]
            for c in s.get("cues", []):
                if c["id"] == cid: return c.get("frame")
    return None
def dust_hits():
    """物理 r0 必改 7：依掃描線 x(f)＝MX＋A·g·sin(2π·F·f/30)（Ops.tsx vibrate 用全片時間）算每顆微粒第一次被掃到的幀"""
    import math
    f0, st, end = cue_abs("s2", "film"), cue_abs("s2", "start"), cue_abs("s3", "start")
    if f0 is None or st is None or end is None: return [("s2:film+20", i) for i in range(len(INFO["DUSTX"]))]
    at, ramp, A, F = f0 + 6, 6, INFO["SCAN_AMP"], INFO["SCAN_F"]
    xs = lambda f: A * min(1, max(0, (f - at) / ramp)) * math.sin(2 * math.pi * F * f / 30)
    out = []
    for i, dx in enumerate(INFO["DUSTX"]):
        hit = end - 4
        for f in range(at + 1, end):
            if (xs(f - 1) - dx) * (xs(f) - dx) <= 0: hit = f; break
        out.append((f"s2:start+{hit - st}", i))
    return out
DUST = dust_hits()
# ── 站 C：s3 先看組好的爐子 → 外罩左右對開（爆炸；剖開示意，量產機是整圈圓筒）→ 傳送叉把擋片從正面水平送進上下空槽、叉子退出 → 線圈通電變亮、熱往中心 → 晶舟上升入管 → 外罩合回、停住 ──
move("cJacketL", "s3:start+24", "s3:cookie+8", 22, dx=-3.2); move("cJacketR", "s3:start+24", "s3:cookie+8", 22, dx=3.2)
move("cDummy", T0, "s3:gap", 18, dz=2.6); move("cFork", T0, "s3:gap", 18, dz=2.6)
move("cFork", "s3:gap+20", FAR, 16, dz=2.6); vis("cFork", [(T0, "s3:gap+34")], 8)
move("cBoat", "s3:gap+36", FAR, 30, dy=INFO["BOATUP"]); move("cDummy", "s3:gap+36", FAR, 30, dy=INFO["BOATUP"])
# ── 站 D：s4 膜層已沿厚度分開（爆炸）→ 金屬、氮化、氧化一層一張標籤 → 合回停住；「丟掉」淘汰桶＋紅叉；「再生」進運送箱 ──
move("dOx", T0, "s4:start+108", 14, dy=0.9); move("dNit", T0, "s4:start+108", 14, dy=1.8); move("dMet", T0, "s4:start+108", 14, dy=2.7)
vis("dX", [("s4:toss+6", FAR)], 3)
# ── 站 E：s5 整籃下降入槽（加減速）→ 金屬、氮化、氧化由外往內依序溶掉 ──
for lay in ["eLift", "eFm", "eFn", "eFo"]: move(lay, "s5:dip-2", FAR, 26, dy=-INFO["LUP"])
vis("eFm", [(T0, "s5:metal+6")], 14); vis("eFn", [(T0, "s5:layer+4")], 14); vis("eFo", [(T0, "s5:pan-2")], 14)
# ── 站 F：s6 研磨頭整組沿立柱抬起（加減速）→ 三層沿軸線分開（頭蓋 +1.0、膜片 +0.5、晶圓不動）→ 依序標名 → 合回、壓回拋光墊 → 研磨頭起轉；
#    轉盤一開始就轉、研磨液滴下順著轉向流；念到「清洗」刷輪轉、噴水；「檢查」光條亮（同一個鏡頭）──
for lay in ["fHeadT", "fHeadM", "fHeadW"]: move(lay, "s6:start+3", "s6:start+88", 14, dy=INFO["HEADLIFT"])
for lay, d in INFO["HEADSEP"].items(): move(lay, "s6:start+14", "s6:start+76", 12, dy=d)
# ── 站 G：s7 卡尺夾著最厚那片；念到「薄一點」抬起、移到下一片、游尺收進去、夾下；晶圓一片片出現（越來越薄）；「淘汰」最薄那片沿拋物線落進淘汰箱 ──
for lay in ["gCal", "gCalJ"]: move(lay, "s7:thin-8", "s7:thin+20", 10, dy=INFO["CAL_LIFT"])
move("gCal", "s7:thin+2", FAR, 16, dx=INFO["CAL_DX"]); move("gCalCar", "s7:thin+2", FAR, 16, dx=INFO["CAL_DX"]); move("gCalJ", "s7:thin+2", FAR, 16, dx=INFO["CAL_DXJ"])
vis("gW1", [("s7:start", FAR)], 6); vis("gW2", [("s7:thin-6", FAR)], 6); vis("gW3", [("s7:thin+4", FAR)], 6); vis("gW4", [("s7:use", FAR)], 6); vis("gW4D", [("s7:use", FAR)], 6)
move("gW4D", "s7:out", FAR, 22, dx=round(180 + 5.7 - INFO["GWX"][4], 3), dy=-1.07, throw=0.9)
# ── 站 N：s9 門開著（繞鉸鏈）；念到「灰塵」關上 → 灰塵貼著門面滑走 → 停 1.5 秒 → 拉遠看盒子沿軌道走過去再回來 ──
move("nBox", "s9:box+20", "s9:kw+6", 36, dx=6.0); move("nDoor", "s9:box+20", "s9:kw+6", 36, dx=6.0)

# ═════ 各幕（看向 x, y, 距離, 仰角）═════
AV = (INFO["AX"], 2.6, 56, 14)
BV = (INFO["BX"] - 1.6, 2.6, 46, 16)
BM = (INFO["MX"], 2.3, 33, 24)
CV = (INFO["CX"], 5.4, 62, 8)
CV2 = (INFO["CX"], 5.8, 56, 6)
DV = (INFO["DX"], 1.6, 36, 22)
EV = (INFO["EX"] + 0.9, 3.4, 44, 18)
FV = (INFO["FX"] + 4.2, 1.9, 50, 28)
TV = (INFO["GX2"] + 1.0, 1.4, 42, 16)
HV = (INFO["HX"] - 0.8, 2.4, 46, 12)
NC = (INFO["NB"] - 0.6, 1.8, 26, 14)
NV = (INFO["NX"] - 1.1, 1.4, 52, 14)
def S_(at, v, dur=30, yaw=None): return shot(at, v[0], v[1], v[2], v[3], dur, yaw)
P = {}
# 標籤一次只亮一張、每張 ≥45 幀（tech-andy-fixes 第 13 條；r1 逐幕排過）
P["s1"] = {"shot": [S_("start-30", AV, 1, yaw=0.0)], "shift": VIS,
 "run": [run("aGlow", "test", "s2:start", 6)],
 "labels": [lab("aProdA", "產品片：上面是一顆顆晶片", "Product wafer: dies", "blue", "start+1", "test+16"),
            lab("aTestA", "空白測試片：不做晶片", "Blank test wafer: no chips", "amber", "test+19", "s2:start")],
 "overlay": [sec("reclaim-hook", "start", nxt("s1"), "中游補充篇・M4", "示意", {"prev": "prev", "test": "test", "q": "q", "chip": "chip", "tool": "tool"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "test", "at": CC, "dur": 1}],
 "shot": [S_(CC, BV, 1), S_("run+12", BM, 20)],
 "run": [run("bPlGlow", "blank-6", "run+12", 4), run("bGasIn", "blank-4", "run+10", 6), run("bXfer", "run+8", "soup-6", 4),
         run("bBeam", "soup-12", "film+4", 6), run("bScanGo", "film+6", "s3:start", 6)] + [run(f"bDG{i}", at, "s3:start", 3) for at, i in DUST],
 "labels": [lab("bChA", "沉積腔：先試跑一次", "Deposition chamber: test run", "blue", "blank-8", "run+14"),
            lab("bBeamA", "斜射光：測膜厚", "Angled light: film thickness", "amber", "soup-17", "film+5"),
            lab("bScanA", "雷射掃過：數灰塵", "Laser scan: dust count", "blue", "film+8", "s3:start")],
 "overlay": [card("s2", "reclaim-test", "測試片：機台開工前先試跑", "示意", {"tool": "tool", "blank": "blank", "run": "run", "soup": "soup", "film": "film", "dust": "dust"})]}
P["s3"] = {"zoom": [{"to": "dummy", "at": CC, "dur": 1}],
 "shot": [S_(CC, CV, 1), S_("cookie+2", CV2, 30)],
 "run": [run("cCoilGlow", "gap+20", "s4:start", 10), run("cHeat", "tray+12", "cookie+8", 8), run("cHeat2", "tray+12", "cookie+8", 8)],
 "labels": [lab("cJacketA", "加熱器外罩（左右對開示意）", "Heater jacket (split open, illustrative)", "blue", "start+21", "gap-3"),
            lab("cDummyA", "擋片：從正面送進上下空位", "Dummy wafers slide into the end slots", "amber", "gap", "cookie-9"),
            lab("cCoilA", "加熱線圈通電：熱往中心", "Coils powered: heat moves inward", "blue", "cookie-6", "heat-3")],
 "overlay": [card("s3", "reclaim-dummy", "擋片：補空位，熱才均勻", "示意", {"dum": "dum", "gap": "gap", "tray": "tray", "cookie": "cookie", "heat": "heat"})]}
P["s4"] = {"zoom": [{"to": "used", "at": CC, "dur": 1}],
 "shot": [S_("start", DV, 1)],
 "run": [run("dShip", "ship-4", "s5:start", 6)],
 "labels": [lab("dMetA", "金屬層", "Metal layer", "amber", "start+2", "start+47"),
            lab("dNitA", "氮化層", "Nitride layer", "blue", "start+50", "start+95"),
            lab("dOxA", "氧化層", "Oxide layer", "amber", "start+98", "start+143")],
 "overlay": [card("s4", "reclaim-used", "用過一次：沾滿薄膜", "示意（膜厚放大）", {"run": "run", "film": "film", "toss": "toss", "ship": "ship"})]}
P["s5"] = {"zoom": [{"to": "strip", "at": CC, "dur": 1}],
 "shot": [S_(CC, EV, 1)],
 "run": [run("eWave", "start-10", "s6:start", 10), run("eBub", "dip+10", "s6:start", 8)],
 "labels": [lab("eBasketA", "整籃晶圓（直立插在籃裡）", "A basket of upright wafers", "blue", "start", "dip+20"),
            lab("eTankA", "藥水槽：溶掉薄膜", "Chemical bath dissolves films", "amber", "dip+22", "s6:start-8")],
 "overlay": [card("s5", "reclaim-strip", "第一步：泡藥水去膜", "示意", {"dip": "dip", "metal": "metal", "lyr": "layer", "pan": "pan"})]}
P["s6"] = {"zoom": [{"to": "cmp", "at": CC, "dur": 1}],
 "shot": [S_("start", FV, 1)],
 "run": [run("fSpin", "grind", "s7:start", 10), run("fHSpin", "start+100", "s7:start", 10), run("fSlurry", "start-10", "s7:start", 6), run("fSlSpread", "grind+10", "s7:start", 8),
         run("fSlFling", "grind+30", "s7:start", 6), run("fCdSwing", "pol", "s7:start", 8), run("fBrush", "clean-6", "s7:start", 8), run("fSpray", "clean-6", "s7:start", 6), run("fInspGlow", "insp-2", "s7:start", 4)],
 "labels": [lab("fHwA", "晶圓（研磨頭抬起露出來）", "Wafer (head lifted)", "blue", "start+9", "start+54"),
            lab("fHMemA", "壓力膜片＋保持環", "Pressure membrane + retaining ring", "amber", "start+57", "start+102"),
            lab("fHTopA", "研磨頭：壓回墊上轉", "Polishing head presses and spins", "blue", "start+105", "s7:start")],
 "overlay": [card("s6", "reclaim-cmp", "研磨、拋光、清洗、檢查", "示意", {"grind": "grind", "pol": "pol", "mirror": "mirror", "clean": "clean", "insp": "insp"})]}
P["s7"] = {"zoom": [{"to": "thin", "at": CC, "dur": 1}],
 "shot": [S_(CC, TV, 1)],
 "labels": [lab("gW0A", "新的：最厚（卡尺夾著量）", "New: thickest (caliper on it)", "blue", "start+6", "use-2"),
            lab("gW4A", "太薄：淘汰", "Too thin: retired", "amber", "out-16", "s8:start")],
 "overlay": [card("s7", "reclaim-thin", "每磨一次，就薄一點", "數位時代（業者說法）；示意", {"thin": "thin", "use": "use", "n": "n", "out": "out"})]}
P["s8"] = {"zoom": [{"to": "tw", "at": CC, "dur": 1}],
 "shot": [S_(CC, HV, 1)],
 "labels": [lab("hFabA", "再生廠（示意）", "Reclaim plant (illustrative)", "blue", "psi", "kinik-2")],
 "overlay": [card("s8", "reclaim-tw", "台灣的再生晶圓廠", "媒體報導；截至 2026/11/28", {"psi": "psi", "cap": "cap", "kinik": "kinik", "wheel": "wheel", "half": "half", "sci": "sci", "self": "self"}, h=392, y=1000)]}
P["s9"] = {"zoom": [{"to": "next", "at": CC, "dur": 1}],
 "shot": [S_("start", NC, 1), S_("box+14", NV, 30)],
 "run": [run("nDoorSwing", "start-60", "dust", 16), run("nDust", "dust+2", "box+20", 8)],
 "labels": [lab("nDoorA", "門關上：灰塵進不去", "Door shut: dust stays out", "amber", "dust+14", "box+12"),
            lab("nBoxA", "密封盒（來回運送）", "Sealed wafer box (shuttles back and forth)", "blue", "box+15", "s10:start")],
 "overlay": [sec("reclaim-next", C, "s10:start", "下一集：光罩盒與晶圓載具", "留言「再生晶圓」", {"dust": "dust", "move": "move", "box": "box", "next": "next", "pod": "pod", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": f"查證截至 {AS_OF}", "noteAlways": True}
levels = [lv("start", "晶圓盒（示意）", "WAFER CASSETTE", "60 cm", "5 cm"), lv("test", "測試片試跑（示意）", "TEST WAFER", "2 m", "20 cm"),
          lv("dummy", "直立爐管與擋片（示意）", "FURNACE DUMMY", "3 m", "30 cm"), lv("used", "用過的測試片（示意）", "USED TEST WAFER", "30 cm", "3 cm"),
          lv("strip", "濕式去膜（示意）", "CHEMICAL STRIP", "2 m", "20 cm"), lv("cmp", "研磨拋光（示意）", "GRIND / POLISH", "2 m", "20 cm"),
          lv("thin", "每次再生都變薄（示意）", "THINNING", "30 cm", "3 cm"), lv("tw", "台灣再生晶圓廠", "TAIWAN MAKERS", "100 m", "10 m"), lv("next", "密封盒（下一集）", "NEXT", "2 m", "20 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-reclaim", "prevEpisode": "M3：化合物半導體 SiC／GaN", "title": "再生晶圓（科技透明圈）", "asOf": AS_OF, "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "中游補充篇", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["再生晶圓", "測試片磨掉一層再用"], "sub": "測試片＋擋片→去膜→研磨拋光", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
for s in scenes:
    t = s.get("tts") or ""
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9]", t): bad.append((s["id"], "數字"))
    for w in ["量測", "矽", "光罩"]:
        if w in t: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
