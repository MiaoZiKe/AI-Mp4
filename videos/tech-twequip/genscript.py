"""tech-twequip 腳本產生器：python3 videos/tech-twequip/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
系列 2 第 12 集：台灣自己的設備廠（濕式清洗機＋前端搬運區）（科技透明圈 系列「代工的供應商」；上一集設備五大-5：KLA；下一集 2-13 濺鍍靶材）。12/14 18:00 發。
旁白、cue、字幕、hook、片尾卡、hud、voice 與各幕 3D 動作（shot／shift／run／kin／labels／overlay）都在這支；cue 來自 timeline.json，配音後重跑本檔即可。
2D 卡：src/components/three/HudTwequip.tsx（twequip-*）。構造與物理：physics-spec.md；模組清單：visual-spec.md。
Andy 第 18 條：念稿與字幕不用 FOUP／EFEM／FFU／SCARA 等縮寫，術語原名只出現在畫面標籤。第 21／22 條：念稿避開「上」、「量測」寫「測量」。"""
import json, re, os, math, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook",
 "上一集檢查完了，晶圓怎麼洗乾淨？台灣設備廠，又做哪一段？",
 ["上一集檢查完了", "晶圓怎麼洗乾淨？", "台灣設備廠", "又做哪一段？"],
 ["Last time: inspection done.", "How does a wafer get clean?", "Taiwan's equipment makers,", "which step do they handle?"],
 [("prev", "檢查完了"), ("q", "洗乾淨"), ("tw", "台灣設備廠")],
 ["洗乾淨", "台灣設備廠"], ["series_plan 2-11／2-12"]),
("s2", "mechanism",
 "外殼打開。前端搬運區管進出；清洗腔一片一片洗；藥液櫃供應藥液。",
 ["外殼打開", "前端搬運區管進出", "清洗腔一片一片洗", "藥液櫃供應藥液"],
 ["Open the cover.", "The front-end module handles transfer;", "the chambers clean one wafer at a time;", "the chemical cabinet supplies liquids."],
 [("open", "外殼打開"), ("efem", "前端搬運區"), ("chamber", "清洗腔"), ("cab", "藥液櫃")],
 ["前端搬運區", "清洗腔", "藥液櫃"], ["US 10796937；US 5882433；示意"]),
("s3", "mechanism",
 "頂部風扇往下吹乾淨空氣；晶圓盒門被吸開；感測器掃過，數每一槽有沒有片。",
 ["頂部風扇往下吹乾淨空氣", "晶圓盒門被吸開", "感測器掃過", "數每一槽有沒有片"],
 ["Fans on top blow clean air downward;", "the wafer pod's door is pulled open;", "a sensor sweeps across", "to check every slot for a wafer."],
 [("fan", "風扇"), ("air", "乾淨空氣"), ("door", "門被吸開"), ("map", "感測器"), ("slot", "每一槽")],
 ["風扇", "吸開", "感測器"], ["US 10796937；US 12557598"]),
("s4", "mechanism",
 "雙刀手臂伸進盒子托起晶圓；轉一圈對準缺口；再直直送進清洗腔放好。",
 ["雙刀手臂伸進盒子托起晶圓", "轉一圈對準缺口", "再直直送進清洗腔放好"],
 ["A dual-blade arm reaches into the pod and lifts a wafer;", "one turn to align the notch;", "then straight into the chamber."],
 [("arm", "雙刀手臂"), ("lift", "托起晶圓"), ("align", "對準缺口"), ("put", "清洗腔放好")],
 ["雙刀", "對準", "清洗腔"], ["US 6852644；US 10755960"]),
("s5", "mechanism",
 "晶圓轉起來，邊緣有銷抓住。噴嘴臂掃過來，藥液落在中心，推成薄薄的液膜，被離心力一路往外甩。",
 ["晶圓轉起來", "邊緣有銷抓住", "噴嘴臂掃過來", "藥液落在中心", "推成薄薄的液膜", "被離心力一路往外甩"],
 ["The wafer spins,", "held by edge pins.", "The nozzle arm sweeps in,", "liquid lands at the center,", "spreads into a thin film,", "and is flung outward by centrifugal force."],
 [("spin", "晶圓轉起來"), ("pin", "有銷抓住"), ("nz", "噴嘴臂"), ("stream", "藥液落在中心"), ("film", "薄薄的液膜"), ("fling", "往外甩")],
 ["轉起來", "液膜", "離心力"], ["US 5882433；ECS 57301；示意"]),
("s6", "mechanism",
 "拆開腔體。噴嘴臂噴藥液；擋液杯一層一種藥液，不混在一起；吸盤抓住晶圓，馬達帶著轉。",
 ["拆開腔體", "噴嘴臂噴藥液", "擋液杯一層一種藥液", "不混在一起", "吸盤抓住晶圓", "馬達帶著轉"],
 ["Open up the chamber.", "The nozzle arm sprays liquid;", "the cup has one level per liquid,", "so they never mix;", "the chuck holds the wafer,", "and a motor spins it."],
 [("split", "拆開腔體"), ("nz", "噴嘴臂"), ("cup", "擋液杯"), ("chk", "吸盤"), ("mot", "馬達")],
 ["噴嘴臂", "擋液杯", "吸盤"], ["US 7901514；US 9275849"]),
("s7", "mechanism",
 "最後甩乾：乾的地方從中心往外擴大，異丙醇噴嘴跟著走，不留水痕。",
 ["最後甩乾", "乾的地方從中心往外擴大", "異丙醇噴嘴跟著走", "不留水痕"],
 ["Finally, spin-dry:", "the dry zone grows outward from the center,", "an IPA nozzle follows it,", "leaving no water marks."],
 [("dry", "甩乾"), ("expand", "從中心往外擴大"), ("ipa", "異丙醇"), ("mark", "水痕")],
 ["甩乾", "中心", "水痕"], ["US 8113221；US 7228645"]),
("s8", "mechanism",
 "藥液桶供應藥液；幫浦和濾芯送來濾乾淨；混合閥配好比例；電控箱管整套動作。",
 ["藥液桶供應藥液", "幫浦和濾芯送來濾乾淨", "混合閥配好比例", "電控箱管整套動作"],
 ["Drums supply the chemicals;", "pumps and filters deliver them clean;", "a mixing valve sets the ratio;", "and an electrical cabinet runs it all."],
 [("tank", "藥液桶"), ("pump", "幫浦"), ("mix", "混合閥"), ("eb", "電控箱")],
 ["藥液桶", "幫浦", "混合閥"], ["US 5882433；MKS；配比為通例"]),
("s9", "mechanism",
 "另有批次酸槽，一次泡一批；單片洗則一片一片來，各有用途。",
 ["另有批次酸槽", "一次泡一批", "單片洗則一片一片來", "各有用途"],
 ["There are also batch wet benches,", "soaking a whole batch at once;", "single-wafer tools go one by one;", "each has its use."],
 [("bat", "批次酸槽"), ("one", "一次泡一批"), ("sgl", "單片洗"), ("use", "各有用途")],
 ["批次酸槽", "單片洗"], ["US 7410814；時間為專利範例"]),
("s10", "mechanism",
 "最前段的清洗機，多是日系、美系大廠；台灣廠打進封裝端和中段。",
 ["最前段的清洗機", "多是日系、美系大廠", "台灣廠打進封裝端和中段"],
 ["The front-most cleaning tools", "mostly come from Japanese and US makers;", "Taiwan's makers sell into packaging and the mid-stage."],
 [("front", "最前段"), ("foreign", "日系、美系大廠"), ("tw", "台灣廠"), ("back", "封裝端和中段")],
 ["最前段", "台灣廠", "中段"], ["TechNews 2022；媒體報導"]),
("s11", "payoff",
 "弘塑、辛耘做濕式清洗機，家登做晶圓盒。",
 ["弘塑、辛耘做濕式清洗機", "家登做晶圓盒"],
 ["GPTC and Scientech make wet cleaning tools;", "Gudeng makes wafer pods."],
 [("gptc", "弘塑"), ("sci", "辛耘"), ("gdg", "家登")],
 ["弘塑", "辛耘", "家登"], ["SEMI 會員；公司官網"]),
("s12", "cta",
 "下一集看濺鍍靶材。留言設備廠，拿完整資料。",
 ["下一集看濺鍍靶材", "留言設備廠", "拿完整資料"],
 ["Next: sputtering targets.", "Comment \"equipment makers\"", "for the full notes."],
 [("next", "濺鍍靶材"), ("kw", "留言")],
 ["濺鍍靶材", "設備廠"], ["示意動畫，不是量測"]),
]
def TTS(t):
    t = t.replace("上集", "上一集").replace("上一一集", "上一集").replace("矽", "細").replace("光罩", "光照")
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("上百片", "一百多片"), ("往上是", "再過去是"), ("放上", "放到"), ("幫浦", "幫浦")]:
        t = t.replace(a, b)  # Andy 11-26 規範第 21 條：念稿避開「上」
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
DUR = {"s1": 4.8, "s2": 8.6, "s3": 7.2, "s4": 7.6, "s5": 8.4, "s6": 9.6, "s7": 7.2, "s8": 7.6, "s9": 6.0, "s10": 6.0, "s11": 4.6, "s12": 4.8}
for sc in scenes:
    if sc["id"] in DUR: sc["durationSec"] = DUR[sc["id"]]
scenes[1]["pauseAfter"] = 0.7
scenes[0]["props"]["hook"] = {"kicker": "接上集：檢查完了", "title": "怎麼洗乾淨？", "size": 120, "top": 236}
scenes.append({"id": "s13", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "濺鍍靶材", "trail": ["薄膜沉積"], "comment": "設備廠", "logoAnim": "transparent"}}})

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
def sec(kind, at, until, title, tag, t=None, y=1040, h=360, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag}
    if t is not None: d["t"] = {k: {"at": v} for k, v in t.items()}
    d.update(kw); return d
def add(c, n):
    m = re.match(r"([^+-]+)([+-]\d+)?$", c); k = int(m.group(2) or 0) + n
    return f"{m.group(1)}{'+' if k >= 0 else '-'}{abs(k)}"

# ═════════ 大氣手臂的逆運動學（俯視：pol 角度 a → 關節值 −a） ═════════
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
    """收臂：腕收到底座前 0.15，刀片朝 phi（晶圓整片在底座半徑 3.3 以內，轉向時不掃到裝載埠與預對準器）"""
    u = (math.cos(math.radians(phi)), math.sin(math.radians(phi)))
    return pose(RB[0] + (BL + 0.15) * u[0], RB[1] + (BL + 0.15) * u[1], phi, lift, side)
FX, FZ1, ALN, CX1 = INFO["FX"], INFO["FZ"][1], INFO["ALN"], INFO["CX1"]
LO, HI = -0.08, 0.12
K4 = "s4:start+6"
PRE = pose(FX + 3.6, FZ1, 180)   # 晶圓盒口外：刀片對正盒口，直直伸進去、直直退出來
AW = pose(ALN[0], ALN[1] - 2.4, 90)   # 預對準器前的直線進出點（手臂直直進、直直退，不斜著掃過感測軸）
AIN = [[78 + 2 * i, pose(ALN[0], ALN[1] - 2.4 + 0.6 * i, 90)] for i in range(4)] + [[86, pose(ALN[0], ALN[1] - 0.6, 90)]]
keys4 = [[0, {**PRE, "lift": LO}], [16, pose(FX, FZ1, 180)], [22, {"lift": 0.0}], [28, {"lift": HI}], [42, PRE], [54, park(180)], [72, park(90)],
         *AIN, [89, pose(ALN[0], ALN[1], 90)], [93, {"lift": 0.0}], [98, {"lift": LO}],
         [134, {"lift": 0.0}], [140, {"lift": HI}], [142, pose(ALN[0], ALN[1] - 0.6, 90)], [144, pose(ALN[0], ALN[1] - 1.2, 90)], [146, pose(ALN[0], ALN[1] - 1.8, 90)], [148, AW], [156, park(90)],
         [159, park(75)], [162, park(55)], [165, park(35)], [168, park(15)], [171, park(0)], [186, pose(CX1, 0, 0)], [192, {"lift": 0.0}], [197, {"lift": LO}], [212, park(0)]]
def unwrap(keys):
    """關節角沿時間連續（每格和上一格差不超過 180°），避免內插時繞一整圈"""
    keys = [[t, dict(v)] for t, v in keys]
    last = {}
    for _, v in keys:
        for j in ("j1", "j2", "j3"):
            if j in v and j in last:
                while v[j] - last[j] > 180: v[j] -= 360
                while v[j] - last[j] < -180: v[j] += 360
            if j in v: v[j] = round(v[j], 2); last[j] = v[j]
    for j in ("j1", "j2", "j3"):
        vals = [v[j] for _, v in keys if j in v]; sh = 360 * round((max(vals) + min(vals)) / 2 / 360)
        for _, v in keys:
            if j in v: v[j] = round(v[j] - sh, 2)
    return keys
keys4 = unwrap(keys4)
KIN0 = {"arm": "ar", "at": "s1:start-40", "keys": [[0, dict(keys4[0][1])]]}
KIN4 = {"arm": "ar", "at": K4, "keys": keys4, "carry": [{"layer": "wfA", "grab": 22, "release": 93}, {"layer": "wfB", "grab": 134, "release": 192}]}
def k4(n): return add(K4, n)

# ═════════ 可見度（預設藏著的層：只在需要時顯示） ═════════
ALL = [l["id"] for l in MODEL["layers"] if not l.get("bg")]
DEFHID = {"lMap", "wfR", "wfB", "wfC", "nzStr", "ipStr", *[f"film{k}" for k in range(8)], "filmEdge", *[f"dry{j}" for j in range(7)]}
def show(lay, a, b, dur=6):
    return [hid(lay, "s1:start-40", a, dur), hid(lay, b, FAR, dur)]
VIS = []
VIS += show("lMap", "s3:map-2", "s4:start-4")
VIS += [hid("wfR", "s1:start-40", k4(94), 1), hid("wfR", k4(130), FAR, 1), hid("wfA", k4(94), FAR, 1), hid("wfB", "s1:start-40", k4(130), 1), hid("wfB", k4(193), FAR, 1), hid("wfC", "s1:start-40", k4(192), 1)]
# 液膜：8 層圓盤由中心往外一層一層出現（疊起來中心較厚＝先厚後薄）；s7 甩乾時換成 7 段環形濕膜（內徑一段比一段大＝乾區由中心向外擴）
for k in range(8): VIS += [hid(f"film{k}", "s1:start-40", add("s5:film", 6 * k), 4), hid(f"film{k}", "s7:dry+6", FAR, 4)]
VIS += show("filmEdge", "s5:film+44", "s7:expand+54", 6)
for j in range(7):
    a = add("s7:expand", 9 * j - 6) if j else "s7:dry+12"
    b = add("s7:expand", 9 * (j + 1) + 4) if j < 6 else "s7:mark+30"
    VIS += [hid(f"dry{j}", "s1:start-40", a, 3), hid(f"dry{j}", b, FAR, 3)]
VIS += show("nzStr", "s5:stream-2", "s5:film+56", 5)
VIS += show("ipStr", "s7:expand-8", "s7:expand+70", 5)

# ═════════ 晶圓盒前門、取門器、擋液杯、噴嘴臂 ═════════
DOOR = [mv("foup2Door", "s3:door-6", "s5:start+30", 10, dx=0.25), mv("foup2Door", "s3:door+4", "s5:start+20", 14, dy=-3.3), mv("door2Arm", "s3:door-6", "s5:start+30", 10, dx=0.25), mv("door2Arm", "s3:door+4", "s5:start+20", 14, dy=-3.3),
        mv("lMap", "s3:map-2", "s4:start-4", 78, dy=-2.95)]
SHUT = [mv("c1Shut", k4(60), k4(205), 14, dy=-2.4)]                        # 手臂伸進腔體前，窄縫擋板往下收進牆裡；退出後關回
CUPPOS = [mv("c1Cup", "s1:start-40", "s5:spin-4", 22, dy=-2.3), mv("c1Cup", "s7:dry-4", FAR, 22, dy=-0.9)]   # 裝片時杯口降到刀片下面；甩乾時杯口換到純水那一層（杯口升降）
# 噴嘴臂 IPA 臂：停放 → 掃進（run，不是 kin）
# ═════════ s2 爆炸分解：外殼掀開、三大模組各自分開；一次一張標籤，講完組回來才移鏡 ═════════
EXP_A, EXP_B = "s2:open-2", "s3:start-16"
EFEML = ["efem", "efemFloor", "ffu", "lp1", "lp2", "lp3", "foup1", "foup2", "foup3", "foup1Door", "foup2Door", "foup3Door", "door2Arm", "door2Rail", "aligner", "ar", "wfA"]
CABL = ["cc", "ccTank", "ccPump", "ccFilter", "ccHeater", "ccValve", "ccPipe", "ccDrain", "ebox", "ebDoor", "ebIn"]
EXPLODE = [mv("ffu", EXP_A, EXP_B, 22, dy=6.0), mv("efemFront", EXP_A, EXP_B, 22, dz=8), hid("efemFront", add(EXP_A, 14), EXP_B, 10), mv("clFront", EXP_A, EXP_B, 22, dz=8), hid("clFront", add(EXP_A, 14), EXP_B, 10),
           mv("ccDoor", EXP_A, EXP_B, 22, dz=8), hid("ccDoor", add(EXP_A, 14), EXP_B, 10),
           *[mv(l, "s2:efem-6", EXP_B, 22, dx=-3.0) for l in EFEML if l != "ffu"], mv("ffu", "s2:efem-6", EXP_B, 22, dx=-3.0),
           mv("cl", "s2:chamber-6", EXP_B, 22, dy=4.0), mv("c3", "s2:chamber-6", EXP_B, 22, dy=2.4), mv("c4", "s2:chamber-6", EXP_B, 22, dy=2.4),
           *[mv(l, "s2:cab-6", EXP_B, 22, dx=4.0) for l in CABL]]
# ═════════ s6 拆開腔體：腔體牆隱藏、頂風扇上升、噴嘴臂向外上方旋開、擋液杯整環向上抽出、晶圓取走、吸盤與馬達分開 ═════════
X6A, X6B = "s6:split-2", "s7:start-14"
EXP6 = [mv("c1NzA", "s6:nz-8", X6B, 20, dy=4.8, dx=1.6), mv("c1Nz", "s6:nz-8", X6B, 20, dy=4.8, dx=1.6), mv("c1Cup", "s6:cup-8", X6B, 20, dy=6.0), mv("c1CupPipe", "s6:cup-8", X6B, 20, dy=6.0),
        mv("c1Chuck", "s6:chk-8", X6B, 20, dy=3.0), mv("wfC", "s6:chk-8", X6B, 20, dy=3.0)]
# ═════════ s8 化學液櫃：門滑開，藥液沿管路流動；之後鏡頭移到電控箱，門打開 ═════════
CAB8 = [mv("ccDoor", "s8:start+4", FAR, 18, dz=8), hid("ccDoor", "s8:start+14", FAR, 8)]
# ═════════ s9 批次酸槽：卡匣一槽一槽浸泡（拖車沿導軌走、桿子伸縮、卡匣下降再升起） ═════════
BB = []
t0 = "s9:one-4"
for i in range(4):
    a = 56 * i
    if i: BB += [mv("bbCar", add(t0, a - 14), FAR, 16, dx=3.2), mv("bbCass", add(t0, a - 14), FAR, 16, dx=3.2)]
    BB += [mv("bbCass", add(t0, a), add(t0, a + 30), 12, dy=-3.0)]

# ═════════ 每一幕的「焦點」：不在那幕的層直接藏起來，不留糊殘影 ═════════
G_EFEM = {"efem", "efemFloor", "ffu", "lp1", "lp2", "lp3", "foup1", "foup2", "foup3", "foup1Door", "foup2Door", "foup3Door", "door2Arm", "door2Rail", "aligner", "ar", "wfA", "wfR", "wfB", "lMap", "floor"}
G_C1 = {"c1Wall", "c1Chuck", "c1Motor", "c1Cup", "c1CupPipe", "c1Drain", "c1Exh", "c1Shut", "c1Fan", "c1Valve", "c1Nz", "c1NzA", "c1Ip", "c1IpA", "nzStr", "ipStr", "wfC", "c1Pipe", "filmEdge", *[f"film{k}" for k in range(8)], *[f"dry{j}" for j in range(7)]}
G_EFEM_BARE = G_EFEM - {"efem", "ffu"}
S4 = G_EFEM_BARE | {"c1Wall", "c1Chuck", "c1Cup", "c1CupPipe", "c1Drain", "c1Shut", "wfC"}
S5 = {"c1Cup", "c1Chuck", "wfC", "c1Nz", "c1NzA", "nzStr", "filmEdge", *[f"film{k}" for k in range(8)]}
S6 = {"c1Cup", "c1CupPipe", "c1Chuck", "c1Motor", "wfC", "c1Nz", "c1NzA", "c1Drain"}
S7 = {"c1Cup", "c1Chuck", "wfC", "c1Ip", "c1IpA", "ipStr", "filmEdge", *[f"dry{j}" for j in range(7)]}
G_CAB = {"cc", "ccDoor", "ccTank", "ccPump", "ccFilter", "ccHeater", "ccValve", "ccPipe", "ccDrain", "ebox", "ebDoor", "ebIn"}
G_BB = {"bb", "bbLid", "bbRail", "bbCar", "bbCass"}
G_CL = {"cl", "clFront", "c2", "c3", "c4"}
ALLNB = set(ALL) - G_BB
FSETS = {1: ALLNB, 2: ALLNB, 3: G_EFEM, 4: S4, 5: S5, 6: S6, 7: S7, 8: G_CAB, 9: G_BB | {"floor"}, 10: ALLNB, 11: ALLNB, 12: ALLNB}
FOCUS = []
for l in ALL:
    if l in DEFHID and l not in {"wfA"}: continue          # 預設藏著的層由各自的顯示窗口管
    run_ = None
    for i in list(range(1, 13)) + [99]:
        out_ = i != 99 and l not in FSETS[i]
        if out_ and run_ is None: run_ = i
        if not out_ and run_ is not None:
            a = "s1:start-40" if run_ == 1 else f"s{run_}:start+2"
            b = FAR if i == 99 else f"s{i}:start+14"
            FOCUS.append(hid(l, a, b, 10)); run_ = None
# s2 中 clFront／efemFront 會被爆炸動作拉走，不另藏
# ═════════ 各幕 props ═════════
def lab_(part, text, en, color, at, until, **kw): return lab(part, text, en, color, at, until, **kw)
P = {}
BASE = VIS + DOOR + SHUT + CUPPOS + EXPLODE + EXP6 + CAB8 + BB + FOCUS
P["s1"] = {"shot": [shot("start-30", 5, 8.5, 175, 22, 1), shot("start", 5, 8.5, 160, 24, 90)],
 "shift": BASE, "kin": [KIN0],
 "run": [run("alnGreen", "start-30", FAR, 1), run("cabLed", "start-30", FAR, 1), run("ebLamp", "start-30", FAR, 1), run("nzPark", "start-30", "s5:nz-2", 1), run("ipPark", "start-30", "s7:dry", 1),
         run("pumpBeat", "s8:pump", "s8:mix", 6)],
 "overlay": [sec("twequip-hook", "q", "s2:start-5", "系列 2 第 12 集", "示意，非實際比例", {"prev": "prev", "q": "q", "tw": "tw"})]}
P["s2"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}], "shot": [shot("start", 5, 9.5, 150, 30, 30, yaw=0.1)],
 "labels": [lab_("efemTop", "前端搬運區（EFEM）", "Front-end module", "blue", "efem-2", "chamber-9"),
            lab_("chamber", "清洗腔（單片旋轉）", "Single-wafer chamber", "amber", "chamber-2", "cab-9"),
            lab_("ccTop", "化學液供應櫃", "Chemical cabinet", "blue", "cab-2", "s3:start-6")],
 "overlay": [sec("twequip-tour", "start+24", "s3:start-5", "拆開清洗機", "示意（非弘塑／辛耘實機）", {"open": "open", "efem": "efem", "chamber": "chamber", "cab": "cab"})]}
P["s3"] = {"shot": [shot("start", -9.5, 10.6, 98, 30, 30, yaw=-0.1)],
 "run": [run("ffuAir", "fan-4", "s4:start", 8), run("ffuAir2", "fan-4", "s4:start", 8), run("ffuAir3", "fan-4", "s4:start", 8), run("mapBeam", "map-2", "s4:start-4", 4)],
 "labels": [lab_("ffu", "頂部風扇濾網（FFU）", "Fan filter unit", "blue", "fan-2", "door-9"),
            lab_("door", "裝載端取門器＋晶圓盒", "Load port & wafer pod", "amber", "door-1", "map-9"),
            lab_("map", "映射感測：數每一槽", "Wafer mapping sensor", "blue", "map-1", "s4:start-4")],
 "overlay": [sec("twequip-foup", "start+2", "s4:start-5", "晶圓盒開門與映射", "示意（片數、片距為示意）", {"fan": "fan", "door": "door", "map": "map", "slot": "slot"})]}
P["s4"] = {"shot": [shot("start", -7, 6.8, 72, 32, 30, yaw=-0.1), shot(k4(150), -7, 6.8, 72, 32, 28)], "kin": [KIN4],
 "run": [run("alnLaser", k4(97), k4(128), 4), run("alnSpin", k4(98), k4(122), 8)],
 "labels": [lab_("blade", "單臂雙刀大氣手臂", "Dual-blade atmospheric robot", "blue", "arm-2", "align-9"),
            lab_("aln", "預對準器：找缺口", "Pre-aligner", "amber", "align-2", "put-9"),
            lab_("chuck", "吸盤＋邊緣抓取銷", "Chuck & edge-grip pins", "blue", "put-1", "s5:start-4")],
 "overlay": [sec("twequip-arm", "start+2", "s5:start-5", "手臂直線伸入、雙刀快換", "示意（專利範例：換片約 8–16 秒）", {"arm": "arm", "lift": "lift", "align": "align", "put": "put"})]}
P["s5"] = {"shot": [shot("start", CX1, 8.8, 40, 40, 30, yaw=0.05)],
 "run": [run("c1Air", "start", FAR, 8), run("cupHot", "stream", "s7:dry", 8), run("spinLo", "spin", "s7:start", 12), run("nzSwing", "nz+22", "s5:film+60", 8),
         run("nzGlow", "stream", "film+56", 4)] + [run(f"spir{k}", "film+8", "s6:start", 6) for k in range(4)] + [run(f"fling{k}", "fling-24", "s6:start", 6) for k in range(6)] + [run(f"dr{k}", "film+46", "s7:dry", 6) for k in range(3)] +
         [run("nzPark", "film+60", "s6:split", 24)],
 "labels": [lab_("chuck", "旋轉吸盤＋抓取銷", "Spin chuck & edge-grip pins", "blue", "spin-2", "nz-9"),
            lab_("nz", "噴嘴臂：中心掃到邊緣", "Swing nozzle arm", "amber", "nz-2", "film-9"),
            lab_("chamber", "液膜：離心力推開", "Liquid film", "blue", "film-2", "s6:start-4")],
 "overlay": [sec("twequip-chamber", "start+24", "s6:start-5", "單片腔：噴液與液膜", "示意（轉速、溫度為示意）", {"spin": "spin", "nz": "nz", "stream": "stream", "film": "film", "fling": "fling"})]}
P["s6"] = {"shot": [shot("start", CX1 + 0.5, 9.0, 74, 28, 30, yaw=0.1)],
 "run": [run("nzPark", "start", FAR, 1)],
 "labels": [lab_("nz", "噴嘴臂", "Nozzle arm", "amber", "nz-2", "cup-9"),
            lab_("cup", "擋液杯（三層）", "Splash cup (3 levels)", "blue", "cup-2", "chk-9"),
            lab_("chuck", "旋轉吸盤", "Spin chuck", "amber", "chk-2", "mot-9"),
            lab_("motor", "馬達", "Spin motor", "blue", "mot-2", "s7:start-4")],
 "overlay": [sec("twequip-cup", "start+24", "s7:start-5", "杯內分路：一層一種藥液", "示意（SC1 歷史配比、溫度為通例）", {"split": "split", "nz": "nz", "cup": "cup", "chk": "chk", "mot": "mot"})]}
P["s7"] = {"shot": [shot("start", CX1, 7.3, 36, 52, 30)],
 "run": [run("spinHi", "dry", FAR, 14), run("c1Air", "start", FAR, 4), run("ipSweep", "expand", FAR, 52), run("n2Glow", "expand-8", "expand+70", 4), run("ipaGlow", "expand-8", "expand+70", 4), run("nzPark", "start", FAR, 1)] + [run(f"dw{k}", "dry", "mark+20", 6) for k in range(3)] + [run(f"fling{k}", "dry", "expand", 6) for k in range(6)],
 "labels": [lab_("ip", "IPA／氮氣臂：跟著乾區走", "IPA & N2 arm follows the dry front", "amber", "ipa-2", "s8:start-4")],
 "overlay": [sec("twequip-dry", "start+24", "s8:start-5", "甩乾：乾區由中心向外", "示意", {"dry": "dry", "expand": "expand", "ipa": "ipa", "mark": "mark"})]}
P["s8"] = {"shot": [shot("start", 18.5, 5.9, 95, 22, 30, yaw=0.05)],
 "run": [run("chemFlow", "tank-4", FAR, 8), run("chemFlow2", "tank+8", FAR, 8), run("pumpBeat", "pump-4", FAR, 6), run("ebDoorOpen", "eb-6", "s9:start", 22), run("ebBlink", "eb", "s9:start", 6)],
 "labels": [lab_("tank", "藥液桶（PE）", "Chemical drums", "blue", "tank-2", "pump-9"),
            lab_("pump", "幫浦＋濾芯", "Pump & filter", "amber", "pump-2", "mix-9"),
            lab_("mix", "混合閥島", "Mixing valve island", "blue", "mix-2", "eb-8"),
            lab_("eb", "電控箱（門打開）", "Electrical cabinet", "amber", "eb", "s9:start-4")],
 "overlay": [sec("twequip-chem", "start+24", "s9:start-5", "藥液怎麼送進腔", "示意（歷史配比為通例，本機不標）", {"tank": "tank", "pump": "pump", "mix": "mix", "eb": "eb"})]}
P["s9"] = {"shot": [shot("start", 44, 5.15, 115, 24, 30, yaw=-0.05)],
 "run": [run(f"bbOver{i}", "start", FAR, 6) for i in range(6)] + [run("bbIpa", "start", FAR, 6)],
 "labels": [lab_("bb", "批次酸槽（卡匣浸泡）", "Batch wet bench", "amber", "bat-2", "s10:start-4")],
 "overlay": [sec("twequip-batch", "start+24", "s10:start-5", "批次 vs 單片", "專利範例，不是弘塑／辛耘機台規格", {"bat": "bat", "one": "one", "sgl": "sgl", "use": "use"})]}
P["s10"] = {"shot": [shot("start", 5, 8.5, 160, 22, 40, yaw=-0.2)],
 "overlay": [sec("twequip-who", "start+24", "s11:start-5", "台灣廠負責哪一段", "媒體報導；不列市占數字", {"front": "front", "foreign": "foreign", "tw": "tw", "back": "back"})]}
P["s11"] = {"shot": [shot("start", 5, 8.5, 150, 24, 40, yaw=-0.3)],
 "overlay": [sec("twequip-co", "start+24", "s12:start-5", "台灣設備與載具廠", "機台外觀為示意，非其實機", {"gptc": "gptc", "sci": "sci", "gdg": "gdg"})]}
P["s12"] = {"shot": [shot("start", 5, 8.5, 150, 26, 40)],
 "overlay": [sec("twequip-next", "start+24", "s13:start-5", "接下來", "下一集：2-13", {"next": "next", "kw": "kw"})]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("tool", "單片旋轉清洗機（示意）", "SINGLE-WAFER CLEANER", "3 m", "1 m")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-twequip", "prevEpisode": "設備五大-5：KLA", "title": "台灣自己的設備廠（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
                 "_說明": "旁白金手指：2.5＋Iapetus＋說明 B（捲舌音要念清楚）；音高關卡 tts-pitch-take.sh（120～135 Hz）；本支尚未配音"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定機型"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["晶圓怎麼洗乾淨？", "台灣廠做哪一段"], "sub": "台灣自己的設備廠", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
BANNED = ["負載鎖", "FOUP", "EFEM", "SCARA", "FFU", "TDI", "CD-SEM", "IPA", "SC1"]   # Andy 第 18 條：念稿與字幕不用
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
    for w in BANNED:
        if w in (s.get("narration") or "") + s["subtitle"]["zh"]: bad.append((s["id"], w))
    if "上" in t.replace("前一集", ""): bad.append((s["id"], "含上"))
    if "量測" in t: bad.append((s["id"], "量測"))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] + s.get("pauseAfter", 0) for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
