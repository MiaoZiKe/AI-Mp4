"""tech-dicing 腳本產生器：python3 videos/tech-dicing/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
晶圓切割與薄化（科技透明圈 系列 3「晶片往下游走」第 1 集；前一集 2-22：探針卡-2；下一集 3-2：封裝打線）。念稿定稿於 script.md（一字不改）。
產生：python3 videos/tech-dicing/genscript.py → node scripts/three/silent-timeline.mjs tech-dicing → 再跑一次本檔（cue 來自 timeline.json）。
2D 卡：src/components/three/HudDicing.tsx（dc-*）。構造與物理：physics-spec.md；來源：research.md。
Andy 規則：念稿 ≤260 字、一幕一件事、關鍵畫面念完留 ≥1.2 秒只有畫面、≥3 個比喻、數字 ≤2、爆炸分解步驟全做完、出處列只放真實來源。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, 無聲幕長秒, 開口前只有畫面秒, 念完後最少只有畫面秒)
S = [
("s1", "hook", "一片晶圓，怎麼切成一顆顆？前一集，晶圓測完了。",
 ["一片晶圓", "怎麼切成一顆顆？", "前一集", "晶圓測完了"], ["One wafer:", "how is it cut into chips?", "Last episode:", "the wafer passed testing."],
 [("q", "切成"), ("prev", "前一集"), ("done", "測完了")], ["切成", "測完了"], ["DISCO DAD3350 規格；大學無塵室 SOP；示意動畫，不是量測"], 6.0, 0.0, 1.2),
("s2", "you", "不能拿鋸子。矽又硬又脆，晶片間的走道很窄。",
 ["不能拿鋸子", "矽又硬又脆", "晶片間的走道很窄"], ["You can't use a saw.", "Silicon is hard and brittle,", "and the streets between chips are narrow."],
 [("saw", "鋸子"), ("hard", "硬又脆"), ("street", "走道")], ["鋸子", "硬又脆", "走道"], ["Semiconductor Digest（切割道與刀片）；示意動畫，不是量測"], 6.2, 0.3, 1.6),
("s3", "mechanism", "晶圓先貼在膠膜，繃在鐵框，像繃好的刺繡布。",
 ["晶圓先貼在膠膜", "繃在鐵框", "像繃好的刺繡布"], ["First the wafer goes on tape,", "stretched over a steel frame,", "like cloth in an embroidery hoop."],
 [("tape", "膠膜"), ("frame", "鐵框"), ("hoop", "刺繡布")], ["膠膜", "鐵框", "刺繡布"], ["UCSB、Utah 切割機 SOP；USPTO 8609515；示意"], 6.5, 0.3, 2.2),
("s4", "mechanism", "比頭髮還薄的鑽石刀片，每分鐘最高轉六萬圈，像淋水切磁磚。",
 ["比頭髮還薄的", "鑽石刀片", "每分鐘最高", "轉六萬圈", "像淋水切磁磚"], ["Thinner than a hair,", "a diamond blade", "spins at up to", "60,000 turns a minute,", "like cutting tile under water."],
 [("hair", "頭髮"), ("blade", "鑽石刀片"), ("rpm", "六萬圈"), ("tile", "切磁磚")], ["鑽石刀片", "六萬圈", "切磁磚"], ["DISCO DAD3350 官方規格；示意動畫，不是量測"], 8.0, 0.3, 2.2),
("s5", "twist", "但晶圓越薄，切口越容易崩角。",
 ["但晶圓越薄", "切口越容易崩角"], ["But the thinner the wafer,", "the more the cut edge chips."],
 [("thin", "越薄"), ("chip", "崩角")], ["越薄", "崩角"], ["DISCO 技術說明（背面崩角）；示意動畫，不是量測"], 5.0, 0.3, 1.8),
("s6", "mechanism", "所以有雷射隱形切割，在晶圓裡畫出一排看不見的裂痕。",
 ["所以有", "雷射隱形切割", "在晶圓裡畫出", "一排看不見的裂痕"], ["So there's", "laser stealth dicing:", "inside the wafer it draws", "a row of hidden cracks."],
 [("sd", "隱形切割"), ("inside", "晶圓裡"), ("crack", "裂痕")], ["隱形切割", "晶圓裡", "裂痕"], ["Hamamatsu、DISCO 隱形切割官方說明；示意動畫，不是量測"], 7.2, 0.3, 2.2),
("s7", "mechanism", "再把膠膜撐開，晶片沿裂痕分開，像掰巧克力。",
 ["再把膠膜撐開", "晶片沿裂痕分開", "像掰巧克力"], ["Then the tape is stretched,", "the chips split along the cracks,", "like snapping a chocolate bar."],
 [("exp", "撐開"), ("split", "分開"), ("choc", "巧克力")], ["撐開", "分開", "巧克力"], ["DISCO DDS2300 擴片機規格；示意動畫，不是量測"], 6.6, 0.3, 2.4),
("s8", "mechanism", "為什麼要磨薄？要疊好幾層，快一公釐的晶圓，得磨到比頭髮還薄。",
 ["為什麼要磨薄？", "要疊好幾層", "快一公釐的晶圓", "得磨到比頭髮還薄"], ["Why grind it thin?", "Chips get stacked in layers.", "A wafer almost a millimeter thick", "must end up thinner than a hair."],
 [("why", "磨薄"), ("stack", "疊好幾層"), ("mm", "一公釐"), ("hair", "頭髮")], ["磨薄", "一公釐", "頭髮"], ["晶圓規格 775 µm；TrendForce、SK hynix；示意"], 7.6, 0.3, 2.0),
("s9", "mechanism", "正面貼膠帶，翻過來，鑽石砂輪磨背面，先粗後細。",
 ["正面貼膠帶", "翻過來", "鑽石砂輪磨背面", "先粗後細"], ["Tape on the front,", "flip it over,", "a diamond wheel grinds the back,", "coarse first, then fine."],
 [("tape", "膠帶"), ("flip", "翻過來"), ("wheel", "砂輪"), ("coarse", "先粗"), ("fine", "後細")], ["膠帶", "砂輪", "先粗後細"], ["DISCO DGP8761 型錄；USPTO 8222118；示意動畫，不是量測"], 6.6, 0.3, 2.0),
("s10", "payoff", "最後露出埋好的銅柱，叫矽穿孔，像電梯井，貫穿疊起來的晶片。",
 ["最後露出", "埋好的銅柱", "叫矽穿孔", "像電梯井", "貫穿疊起來的晶片"], ["Finally it exposes", "buried copper posts,", "called through-silicon vias,", "like elevator shafts", "running through the stacked chips."],
 [("cu", "銅柱"), ("tsv", "矽穿孔"), ("lift", "電梯井"), ("thru", "貫穿")], ["銅柱", "矽穿孔", "電梯井"], ["TSV 製程文獻（via-middle、背面露頭）；示意動畫，不是量測"], 7.4, 0.3, 2.0),
("s11", "payoff", "日本迪思科做切割研磨機；台灣有鈦昇雷射切割、昇陽半導體代工薄化。",
 ["日本迪思科", "做切割研磨機", "台灣有鈦昇", "雷射切割", "昇陽半導體", "代工薄化"], ["Japan's DISCO", "makes dicing and grinding tools;", "in Taiwan, E&R (8027)", "does laser dicing,", "and Phoenix Silicon (PSI, 8028)", "thins wafers as a service."],
 [("jp", "迪思科"), ("tw", "台灣"), ("btl", "鈦昇"), ("psi", "昇陽")], ["迪思科", "鈦昇", "昇陽半導體"], ["各公司公開資訊；截至 2026/11/27"], 7.2, 0.2, 1.4),
("s12", "cta", "晶片切好了，電怎麼接出來？下一集，看封裝打線。留言切割，拿完整資料。",
 ["晶片切好了", "電怎麼接出來？", "下一集", "看封裝打線", "留言切割", "拿完整資料"], ["The chips are cut.", "How does the signal get out?", "Next episode:", "packaging and wire bonding.", "Comment \"dicing\"", "for the full notes."],
 [("done", "切好了"), ("next", "下一集"), ("wire", "打線"), ("kw", "留言切割")], ["打線", "切割"], ["示意動畫，不是量測"], 7.4, 0.2, 1.2),
]
HOLD = 0.6          # 念完後只有畫面的秒數（＋下一幕 headSec 0.2～0.3 ≤ 1.0）
def TTS(t):
    t = t.replace("矽", "細")
    for a, b in [("上一集", "前一集"), ("量測", "測量")]:
        t = t.replace(a, b)
    return t
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, dur, head, tail) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？]", "", z)) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？]", "", z)) >= 3, ("字幕短語 <3 字會被併入下一段、英文對位跑掉", sid, z)
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar))
    # Andy 第 39 條（11-27 晚）：旁白之間的無聲 ≤1.0 秒＝本幕 holdSec＋下一幕 headSec；運作動畫在念的期間做完。幕長由念稿長度算（表上的幕長只當上限參考）
    hold = HOLD; dur = round(0.2 + head + nch / 5.2 + hold, 1)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
md = open(os.path.join(HERE, "script.md")).read()
for s in scenes: assert s["tts"] in md, ("念稿和 script.md 不一致", s["id"])
scenes[0]["props"]["hook"] = {"kicker": "接上集：晶圓測完了", "title": "怎麼切開？", "size": 120, "top": 272}
scenes.append({"id": "s13", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "封裝打線", "trail": ["晶片切好了，電怎麼接出來"], "comment": "切割", "logoAnim": "transparent"}}})

# ═════════ 工具 ═════════
FAR = "s13:start+400"
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
def drop(lay, at, dy=6.0, dur=16, bounce=0.06):
    """從上方落下（受重力、落地小彈跳）：at 之前藏在上方，at 開始落下"""
    vis(lay, [(at, FAR)], 1)
    VIS.append({"layer": lay, "at": T0, "until": at, "dur": dur, "dy": dy, "fallIn": True, "bounce": bounce, "opacity": 0})
# 換幕規則（照 tech-pad r1）：每幕的 3D 鏡頭、2D 卡、字幕、出處列在「字幕窗起點＝本幕 voice-3」同一幀換（卡片 cut：1 幀就位、1 幀收走）
C = "voice-3"
CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw):
    return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)

# ── 站 A：主軸換道（Y 進給）：一開始已經切完兩道（k0、k1），s1 中途再切 k2、k3（每切完一道，主軸往 z 進一格）──
SPG = ["spindle", "flangeR", "blade", "flangeF", "nut", "cover"]
KT = ["s1:start+36", "s1:start+115", "s1:start+194"]
VIS += [mv(l, T0, FAR, 1, dz=2.0) for l in SPG]                     # 起點：對準第 3 道（z＝0）
for k, t in enumerate(KT): VIS += [mv(l, t, FAR, 8, dz=1.0) for l in SPG]
vis("kerf2", [(KT[0], FAR)], 1); vis("kerf3", [(KT[1], FAR)], 1); vis("kerf4", [(KT[2], FAR)], 1); vis("kerf5", [], 1)
# ── s3 爆炸分解①：晶圓、膠膜、鐵框沿 y 分開 → 組回 ──
VIS += [mv("wafer", "s3:start+4", "s3:hoop+14", 18, dy=4.2), mv("tape", "s3:tape-4", "s3:hoop+10", 18, dy=2.4), mv("frame", "s3:frame-4", "s3:hoop+6", 18, dy=1.0)]
VIS += [mv(f"kerf{k}", "s3:start+4", "s3:hoop+14", 18, dy=4.2) for k in range(6)]
VIS += [mv(l, "s3:start-6", "s4:start+2", 12, dy=6.5) for l in SPG]          # 主軸先抬高到晶圓升起的高度之上（不穿模），再分開框架組
for c in MODEL["info"]["CLAMPS"]:                                                   # 夾爪：分開前先張開，組回最後一步合上
    VIS.append(mv(c["id"], "s3:start", "s3:hoop+16", 8, dx=round(c["x"] / 10.4 * 2.2, 3), dz=round(c["z"] / 10.4 * 2.2, 3)))
# ── s4 爆炸分解②：刀蓋往上、螺帽／法蘭／刀片沿主軸 z 拉開 → 組回 → 起轉 → 噴水 ──
VIS += [mv("cover", "s4:start+2", "s4:rpm-12", 16, dy=4.2)]
VIS += [mv("nut", "s4:hair-8", "s4:rpm-8", 18, dz=6.4), mv("flangeF", "s4:hair-8", "s4:rpm-6", 18, dz=4.6), mv("blade", "s4:hair-8", "s4:rpm-4", 18, dz=2.8), mv("flangeR", "s4:hair-8", "s4:rpm-2", 18, dz=1.2)]
# ── 站 X：鋸子落下 → 裂開 ──
VIS += [mv("xSaw", T0, "s2:saw", 14, dy=3.6)]                     # 一開始在上方，念到「鋸子」落下
vis("xCrack", [("s2:saw+13", FAR)], 1); vis("xChips", [("s2:saw+14", FAR)], 1)
# ── 站 C：刀片切下去 → 橋消失 → 背面崩角 ──
VIS += [mv("cBlade", T0, "s5:start", 12, dy=4.5), mv("cBlade", T0, "s5:thin", 56, dx=-4.0), mv("cBlade", "s5:thin", FAR, 56, dx=3.5)]   # 刀片先降進切口，再沿 x 走刀
CHX = [-2.4, -1.0, 0.4, 1.6, 2.8]
for i, dx in enumerate(CHX):                                                         # 刀口走過哪裡，那裡的背面就崩一塊（往前掉）
    VIS.append(mv(f"cChip{i}", f"s5:thin+{round((dx + 4.0) / 7.5 * 56)}", FAR, 16, dz=1.2, dy=-0.25, throw=0.5))
vis("cScar", [("s5:thin+12", FAR)], 1)
# ── 站 L：雷射頭沿切割道走，改質點逐段出現，裂紋往上下延伸 ──
LDUR = 132
VIS += [mv("lHead", "s6:sd-4", FAR, LDUR, dx=18.0)]
for g in range(8):
    vis(f"lDot{g}", [(f"s6:sd+{4 + g * 15}", FAR)], 1)
    vis(f"lCrk{g}", [(f"s6:crack+{g * 5}", FAR)], 2)
# ── 站 E：擴片：頂環往上、膠膜撐開、晶片往外散開 ──
EK = 0.3
VIS += [mv("eLift", "s7:exp", FAR, 30, dy=1.5), mv("eTape", "s7:exp", FAR, 30, dy=1.5)]
vis("eSkirt", [("s7:exp+18", FAR)], 2)
for d in INFO["EDIE"]: VIS.append(mv(d["id"], "s7:exp", FAR, 30, dx=round(d["x"] * EK, 3), dz=round(d["z"] * EK, 3), dy=1.5))
# ── 站 T：厚晶片疊三層爆框、薄晶片疊八層剛好 ──
# 兩個框的上蓋先往後滑開（離開晶片落下的路徑）；薄晶片疊完蓋回去；厚的第三層凸出框外，上蓋滑回來被頂住、架在凸出的晶片上（蓋不下去）
VIS += [mv("tALidL", "s8:start", "s8:stack+16", 10, dz=-6.6), mv("tALidL", "s8:stack+6", FAR, 6, dy=1.86), mv("tBLidL", "s8:start", "s8:hair+4", 10, dz=-6.6)]
for k in range(3): drop(f"tK{k}", f"s8:stack-{24 - k * 10}", 1.0, 10)
vis("tBad", [("s8:stack+12", FAR)], 1)
for k in range(8): drop(f"tN{k}", f"s8:mm+{k * 6}", 3.0, 12)
vis("tOk", [("s8:hair+4", FAR)], 1)
# ── 站 G：晶圓翻面落到卡盤 → 轉盤轉一格 → 粗磨（三層依序磨掉）→ 細磨 ──
vis("gFlip", [(T0, "s9:flip+22")], 1)
VIS += [mv("gFlip", "s9:flip+8", FAR, 14, dy=-5.75)]
for nm in ["g0Tape", "g0S0", "g0S1", "g0S2", "g0S3"]: vis(nm, [("s9:flip+22", FAR)], 1)
VIS += [mv("gZ1", T0, "s9:wheel-4", 14, dy=1.8), mv("gZ2", T0, "s9:coarse+4", 14, dy=1.8)]
vis("g0S3", [("s9:flip+22", "s9:wheel+14")], 2); vis("g0S2", [("s9:flip+22", "s9:wheel+30")], 2); vis("g0S1", [("s9:flip+22", "s9:coarse+6")], 2)
# ── 站 V：背面矽一層層磨掉 → 銅柱露頭；V2：四層堆疊 ──
vis("vS2", [(T0, "s10:start+2")], 2); vis("vS1", [(T0, "s10:start+20")], 2); vis("vS0", [(T0, "s10:cu-12")], 2)
vis("vTip", [("s10:cu-12", FAR)], 2)
VIS += [mv("vWheel", t, FAR, 8, dy=-0.8) for t in ("s10:start+2", "s10:start+20", "s10:cu-12")] + [mv("vWheel", "s10:cu-6", FAR, 14, dy=3.4)]   # 砂輪跟著矽面往下進給，最後抬起
# ── 站 P：三只紙箱念到才落下 ──
drop("p0", "s11:jp-8", 3.0, 12); drop("p1", "s11:btl-8", 3.0, 12); drop("p2", "s11:psi-8", 3.0, 12)
# ── 站 K：金線虛線念到「打線」才出現 ──
vis("kWire", [("s12:wire-6", FAR)], 2)

# ── 每一站只在用到它的幕出現（其他時間整站藏起來：版面檢查的主素材框不會算到畫面外的站，渲染也比較快）──
def W(k): return f"s{k}:voice-6"
def E(k): return f"s{k}:voice-1"
STA = {"A": (lambda l: l in ("spindle", "flangeR", "blade", "flangeF", "nut", "cover", "chuck", "frame", "tape", "wafer") or l.startswith("kerf") or l.startswith("clamp"), [(T0, E(2)), (W(3), E(5))]),
       "X": (lambda l: re.match(r"^x[A-Z0-9]", l) is not None, [(W(2), E(3))]), "C": (lambda l: re.match(r"^c[A-Z0-9]", l) is not None, [(W(5), E(6))]), "L": (lambda l: re.match(r"^l[A-Z0-9]", l) is not None, [(W(6), E(7))]),
       "E": (lambda l: re.match(r"^e[A-Z0-9]", l) is not None, [(W(7), E(8))]), "T": (lambda l: re.match(r"^t[A-Z0-9]", l) is not None, [(W(8), E(9))]), "G": (lambda l: re.match(r"^g[A-Z0-9]", l) is not None, [(W(9), E(10))]),
       "V": (lambda l: re.match(r"^v[A-Z0-9]", l) is not None, [(W(10), E(11))]), "P": (lambda l: re.match(r"^p[A-Z0-9]", l) is not None, [(W(11), E(12))]), "K": (lambda l: re.match(r"^k[A-Z0-9]", l) is not None, [(W(12), FAR)])}
for nm, (pred, wins) in STA.items():
    for l in LAYERS:
        if pred(l):
            prev = T0
            for a, b in wins:
                if a != T0: VIS.append(hid(l, prev, a, 1))
                prev = b
            if prev != FAR: VIS.append(hid(l, prev, FAR, 1))
for l in ("base", "col"):                                                                     # 站 A 的機台本體（背景層）跟著站 A 藏
    VIS += [hid(l, E(2), W(3), 1), hid(l, E(5), FAR, 1)]

# ═════ 各幕 ═════
AX, AY = 1.0, 9.0
P = {}
P["s1"] = {"shot": [shot("start-30", AX, AY, 109, 30, 1, yaw=0.0), shot("start", AX, AY, 101, 28, 150)],
 "shift": VIS,
 "run": [run("tableFeed", "start-30", "s2:start+6", 8), run("bladeSpin", "start-30", "s2:start+6", 8), run("water", "start-30", "s2:start+6", 4), run("water2", "start-30", "s2:start+6", 4), run("sawDust", "start-30", "s2:start+6", 4)],
 "overlay": [sec("dc-hook", "start", nxt("s1"), "系列 3・第 1 集", "示意，非實際比例", {"q": "q", "prev": "prev", "done": "done"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "tool", "at": "start-8", "dur": 1}, {"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, 60.0, 8.4, 78, 24, 1), shot("saw+14", 60.0, 8.0, 72, 24, 40)],
 "run": [run("xSawSpin", "start-6", FAR, 8), run("xChipFly", "saw+12", "saw+60", 4), run("xChipFly2", "saw+14", "saw+60", 4)],
 "labels": [lab("xcrack", "脆：一碰就裂", "Brittle: it cracks", "amber", "hard-2", "hard+44"),
            lab("street", "走道很窄", "Narrow street", "blue", "street", "street+46")],
 "overlay": [card("s2", "dc-saw", "不能拿鋸子", "示意（不標尺寸）", {"saw": "saw", "hard": "hard", "street": "street"})]}
P["s3"] = {"zoom": [{"to": "tool", "at": CC, "dur": 1}],
 "shot": [shot(CC, 0.0, 7.4, 90, 26, 1, yaw=0.0), shot("frame", 0.0, 7.2, 92, 24, 40)],
 "labels": [lab("wafer", "晶圓", "Wafer", "blue", "start+8", "tape-6"),
            lab("tape", "膠膜", "Dicing tape", "amber", "tape-4", "tape+42"),
            lab("frame", "鐵框", "Steel frame", "blue", "frame", "frame+46")],
 "overlay": [card("s3", "dc-hoop", "繃好的刺繡布", "示意", {"tape": "tape", "frame": "frame", "hoop": "hoop"})]}
P["s4"] = {"shot": [shot(CC, 0.4, INFO["BCY"] - 0.6, 58, 6, 1, yaw=-0.75), shot("hair", 0.4, INFO["BCY"] - 0.8, 58, 6, 40), shot("rpm+12", 1.0, INFO["BCY"] - 1.4, 56, 8, 24, yaw=-0.35)],
 "run": [run("bladeSpin", "rpm+8", FAR, 30), run("water", "tile-6", FAR, 6), run("water2", "tile-6", FAR, 6), run("sawDust", "tile", FAR, 6)],
 "labels": [lab("cover", "刀蓋與噴嘴", "Blade cover & nozzles", "blue", C, "blade-12", xy=[740, 340]),
            lab("blade", "鑽石刀片", "Diamond blade", "amber", "blade-8", "blade+38"),
            lab("flange", "法蘭（夾住刀片）", "Flanges", "blue", "blade+40", "tile-4"),
            lab("nozzle", "純水沖刀口", "Water on the cut", "blue", "tile+2", "tile+38")],
 "overlay": [card("s4", "dc-blade", "淋水切磁磚", "DISCO 官方規格：最高 60,000 min⁻¹", {"hair": "hair", "blade": "blade", "rpm": "rpm", "tile": "tile"})]}
P["s5"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, 123.0, 2.4, 82, 12, 1, yaw=0.0)],
 "run": [run("cBladeSpin", "start-6", FAR, 8), run("cWater", "start", FAR, 6), run("cDust", "thin+6", FAR, 6), run("cScarGlow", "thin+12", FAR, 8)],
 "labels": [lab("cThick", "厚：切口整齊", "Thick: clean edge", "blue", C, "chip-10"),
            lab("cChip", "薄：背面崩角", "Thin: backside chipping", "amber", "chip-6", "chip+30")],
 "overlay": [card("s5", "dc-chip", "越薄越容易崩角", "示意", {"thin": "thin", "chip": "chip"})]}
P["s6"] = {"shot": [shot(CC, 180.0, 10.0, 86, 14, 1)],
 "run": [run("lPulse", "sd-4", FAR, 4)],
 "labels": [lab("lHead", "雷射頭", "Laser head", "blue", "sd", "inside-6"),
            lab("lFocus", "焦點在晶圓裡面", "Focus inside the wafer", "amber", "inside-4", "crack-6"),
            lab("lDot", "改質層＝看不見的裂痕", "Hidden modified layer", "amber", "crack-4", "crack+30")],
 "overlay": [card("s6", "dc-stealth", "雷射隱形切割", "示意（Hamamatsu／DISCO 原理）", {"sd": "sd", "inside": "inside", "crack": "crack"})]}
P["s7"] = {"zoom": [{"to": "tool", "at": CC, "dur": 1}],
 "shot": [shot(CC, 240.0, 0.8, 81, 44, 1)],
 "run": [run("eHot", "choc+10", FAR, 6)],
 "labels": [lab("eLift", "頂環往上頂", "Lift ring pushes up", "blue", "exp-4", "exp+40"),
            lab("eDie", "晶片沿裂痕分開", "Chips separate", "amber", "split", "split+46")],
 "overlay": [card("s7", "dc-expand", "像掰巧克力", "示意", {"exp": "exp", "split": "split", "choc": "choc"})]}
P["s8"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, 300.0, -0.8, 66, 12, 1)],
 "labels": [lab("tThick", "太厚：疊不進去", "Too thick: won't fit", "amber", "stack+14", "mm-4"),
            lab("tThin", "磨薄：放得進", "Thinned: it fits", "blue", "hair", "hair+40", xy=[790, 330])],
 "overlay": [card("s8", "dc-thin", "為什麼要磨薄", "示意（片中只說量級）", {"why": "why", "stack": "stack", "mm": "mm", "hair": "hair"})]}
GX = INFO["GX"]
P["s9"] = {"zoom": [{"to": "tool", "at": CC, "dur": 1}],
 "shot": [shot(CC, GX + 1.5, 6.0, 99, 30, 1), shot("coarse+8", GX + 0.5, 5.6, 81, 34, 30)],
 "run": [run("gFlipRot", "flip-8", "flip+8", 14), run("gTableIndex", "flip+22", "wheel", 18), run("gZ1Spin", "wheel-12", FAR, 10), run("gWater", "wheel", FAR, 6), run("gCoarse", "wheel+6", FAR, 6),
         run("gZ2Spin", "coarse", FAR, 10), run("gW2Spin", "coarse", FAR, 10), run("gFine", "fine", FAR, 6)],
 "labels": [lab("gTape", "保護膠帶（貼正面）", "Protective tape", "blue", "tape-4", "flip+20"),
            lab("gWheel1", "粗磨砂輪", "Coarse wheel", "amber", "wheel", "coarse+6"),
            lab("gWheel2", "細磨砂輪", "Fine wheel", "blue", "coarse+8", "fine+30")],
 "overlay": [card("s9", "dc-grind", "先粗後細", "示意（DISCO 研磨機原理）", {"tape": "tape", "flip": "flip", "wheel": "wheel", "coarse": "coarse", "fine": "fine"}, h=392, y=1000)]}
P["s10"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, 440.0, 2.5, 66, 26, 1), shot("lift-2", 470.0, 0.6, 50, 14, 1)],
 "run": [run("vWheelRub", "start-4", "cu-6", 4), run("vDust", "start", "cu-6", 4), run("vTipGlow", "cu-10", FAR, 8)] + [run(f"v2Cur{i}", "lift", FAR, 4) for i in range(4)],
 "labels": [lab("vPil", "銅柱（矽穿孔）", "Copper via (TSV)", "amber", "cu", "tsv+30"),
            lab("v2Pil", "電流直通每一層", "Straight through every layer", "blue", "lift+4", "lift+50")],
 "overlay": [card("s10", "dc-tsv", "像電梯井", "示意", {"cu": "cu", "tsv": "tsv", "lift": "lift", "thru": "thru"})]}
P["s11"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [shot(CC, INFO["PX"], -1.4, 74, 10, 1)],
 "overlay": [card("s11", "dc-co", "切割與薄化：相關公司", "公開資訊；截至 2026/11/27", {"jp": "jp", "tw": "tw", "btl": "btl", "psi": "psi"}, h=392, y=1000)]}
P["s12"] = {"zoom": [{"to": "tool", "at": CC, "dur": 1}],
 "shot": [shot(CC, INFO["KX"], -3.4, 50, 36, 1)],
 "run": [run("kPadGlow", "done", FAR, 8), run("kWireGlow", "wire", FAR, 8)],
 "labels": [lab("kPad", "焊墊", "Bond pads", "amber", "done+4", "done+50"),
            lab("kWire", "金線（下一集）", "Wire bonds (next)", "blue", "wire", "wire+46")],
 "overlay": [sec("dc-next", C, "s13:start", "接下來", "下一集：封裝打線", {"done": "done", "next": "next", "wire": "wire", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("tool", "切割與研磨機台（示意）", "DICING & GRINDING", "60 cm", "10 cm"), lv("micro", "剖面放大（示意）", "CROSS-SECTION", "1 mm", "100 µm"), lv("co", "相關公司", "COMPANIES", "100 cm", "10 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-dicing", "prevEpisode": "2-22：探針卡-2", "title": "晶圓切割與薄化（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "晶片往下游走", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b",
                 "_說明": "旁白金手指第三版（tech-andy-fixes 第 34 條）；本支未配音、不送 TTS"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["晶圓", "怎麼切開？"], "sub": "鑽石刀片、雷射、磨薄", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
    for w in ["量測", "TSV", "DISCO"]:
        if w in (s.get("narration") or "") + s["subtitle"]["zh"]: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
