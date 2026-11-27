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
 "前一集檢查完，晶圓怎麼洗乾淨？台灣廠做哪一段？",
 ["前一集檢查完", "晶圓怎麼洗乾淨？", "台灣廠做哪一段？"],
 ["Last time: inspection done.", "How does a wafer get clean?", "Which step do Taiwan's makers handle?"],
 [("prev", "檢查完"), ("q", "洗乾淨"), ("tw", "台灣廠")],
 ["洗乾淨", "台灣廠"], ["示意動畫，不是量測"]),
("s2", "mechanism",
 "外殼打開。晶圓先到玄關，拿出盒子擺正，叫前端搬運區。再往裡，才是洗的地方。",
 ["外殼打開", "晶圓先到玄關", "拿出盒子擺正", "叫前端搬運區", "再往裡", "才是洗的地方"],
 ["Open the cover.", "A wafer first reaches the foyer,", "is taken from its pod and aligned:", "the front-end module.", "Further in,", "is where it gets washed."],
 [("open", "外殼打開"), ("foyer", "玄關"), ("efem", "前端搬運區"), ("chamber", "洗的地方")],
 ["玄關", "前端搬運區"], ["US 10796937；US 5882433；示意"]),
("s3", "mechanism",
 "風扇吹下乾淨空氣，盒門打開，數每槽有沒有片。",
 ["風扇吹下乾淨空氣", "盒門打開", "數每槽有沒有片"],
 ["Fans blow clean air downward,", "the pod door opens,", "and every slot is checked for a wafer."],
 [("fan", "風扇"), ("air", "乾淨空氣"), ("door", "盒門打開"), ("map", "數每槽"), ("slot", "有沒有片")],
 ["風扇", "盒門打開", "數每槽"], ["US 10796937；US 12557598"]),
("s4", "mechanism",
 "手臂托起一片，轉一圈擺正邊緣的缺口，再送進去洗。",
 ["手臂托起一片", "轉一圈擺正", "邊緣的缺口", "再送進去洗"],
 ["The arm lifts one wafer,", "one turn to align", "the notch on its edge,", "then straight in to be washed."],
 [("arm", "手臂"), ("lift", "托起一片"), ("align", "轉一圈"), ("put", "送進去洗")],
 ["托起", "缺口", "送進去洗"], ["US 6852644；US 10755960"]),
("s5", "mechanism",
 "像洗盤子，一次一片，邊轉邊沖。藥液落中心，甩成薄膜帶走髒污。",
 ["像洗盤子", "一次一片", "邊轉邊沖", "藥液落中心", "甩成薄膜帶走髒污"],
 ["Like washing a plate:", "one at a time,", "rinsed while it turns.", "Liquid lands at the center,", "spins into a thin film that carries dirt away."],
 [("spin", "像洗盤子"), ("nz", "邊轉邊沖"), ("stream", "落中心"), ("film", "甩成薄膜"), ("fling", "帶走髒污")],
 ["洗盤子", "邊轉邊沖", "薄膜"], ["US 5882433；ECS 57301；示意"]),
("s6", "mechanism",
 "拆開看：擋液杯一層一種藥液，像分類回收桶。",
 ["拆開看", "擋液杯一層一種藥液", "像分類回收桶"],
 ["Take it apart:", "the cup has one level per liquid,", "like sorted recycling bins."],
 [("split", "拆開看"), ("cup", "擋液杯"), ("bin", "回收桶")],
 ["擋液杯", "分類回收桶"], ["US 7901514；US 9275849"]),
("s7", "mechanism",
 "最後甩乾。異丙醇是一種酒精，跟著乾區，把水帶走不留水痕。",
 ["最後甩乾", "異丙醇是一種酒精", "跟著乾區", "把水帶走", "不留水痕"],
 ["Finally, spin-dry.", "Isopropanol is a kind of alcohol,", "follows the dry front", "and carries the water away,", "leaving no water marks."],
 [("dry", "甩乾"), ("ipa", "異丙醇"), ("expand", "乾區"), ("mark", "水痕")],
 ["甩乾", "異丙醇", "水痕"], ["US 8113221；US 7228645"]),
("s8", "mechanism",
 "藥液從桶子出發，幫浦推著走，閥門像調飲料配比例。",
 ["藥液從桶子出發", "幫浦推著走", "閥門像調飲料配比例"],
 ["Liquid starts in the drums,", "pumps push it along,", "and a valve mixes the ratio like a drink."],
 [("tank", "桶子"), ("pump", "幫浦"), ("mix", "閥門")],
 ["桶子", "幫浦", "調飲料"], ["US 5882433；MKS；示意動畫，不是量測"]),
("s9", "mechanism",
 "另一種像整籃碗泡進槽裡，一次洗很多；單片逐片洗。",
 ["另一種", "像整籃碗泡進槽裡", "一次洗很多", "單片逐片洗"],
 ["Another way:", "like soaking a whole basket of bowls,", "many at a time;", "single-wafer goes one by one."],
 [("bat", "整籃碗"), ("one", "泡進槽裡"), ("sgl", "單片"), ("use", "逐片洗")],
 ["整籃碗", "單片"], ["US 7410814；時間為專利範例"]),
("s10", "mechanism",
 "最前段多是日美大廠，台灣廠主攻封裝端與中段。",
 ["最前段多是", "日美大廠", "台灣廠主攻", "封裝端與中段"],
 ["The very front stage is mostly", "Japanese and US makers;", "Taiwan's makers focus on", "packaging and the mid-stage."],
 [("front", "最前段"), ("foreign", "日美"), ("tw", "台灣廠"), ("back", "封裝端")],
 ["最前段", "台灣廠", "中段"], ["TechNews 2022；媒體報導"]),
("s11", "payoff",
 "弘塑、辛耘做濕式清洗機，家登做晶圓盒。",
 ["弘塑、辛耘做濕式清洗機", "家登做晶圓盒"],
 ["GPTC and Scientech make wet cleaning tools;", "Gudeng makes wafer pods."],
 [("gptc", "弘塑"), ("sci", "辛耘"), ("gdg", "家登")],
 ["弘塑", "辛耘", "家登"], ["SEMI 會員；公司官網"]),
("s12", "cta",
 "洗乾淨就鍍薄膜，下一集看濺鍍靶材。留言設備廠拿資料。",
 ["洗乾淨就鍍薄膜", "下一集看濺鍍靶材", "留言設備廠", "拿資料"],
 ["Clean wafers get coated:", "next, sputtering targets.", "Comment \"equipment makers\"", "for the notes."],
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
# 時長與留白（Andy 11-27 第 27 條）：DUR＝整幕秒數；HEAD＝開口前只有畫面；念完後的留白＝DUR − HEAD − 字數/4.7（只有畫面，演出關鍵動作）
DUR = {"s1": 4.6, "s2": 12.2, "s3": 5.9, "s4": 6.4, "s5": 6.8, "s6": 8.3, "s7": 6.7, "s8": 11.6, "s9": 6.0, "s10": 5.2, "s11": 4.5, "s12": 5.98}   # 無聲估計總長 ≤85 秒（協調者 11-27）
HEAD = {"s1": 0, "s2": 1.5, "s3": 0.4, "s4": 0.3, "s5": 0.2, "s6": 0.8, "s7": 0.3, "s8": 0.8, "s9": 0.3, "s10": 0.3, "s11": 0.3, "s12": 0.3}
RATE = 4.7   # 念稿估計速度（字／秒）；重配後以實際錄音為準
for sc in scenes:
    if sc["id"] in DUR:
        n_ = len(re.sub(r"[，。？！、；：\s]", "", sc["tts"]))
        sc["durationSec"] = DUR[sc["id"]]; sc["headSec"] = HEAD[sc["id"]]
        sc["holdSec"] = round(DUR[sc["id"]] - HEAD[sc["id"]] - n_ / RATE, 2)
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
def sec(kind, at, until, title, tag, t=None, y=1040, h=356, **kw):
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
TKX_C = INFO["TKX"][0] + 1.6
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
TS = 0.6   # 取放節奏 0.75 倍（r5：載片退出與轉向放回 0.75；r4 曾縮到 0.65）；幾何不變，只是同一條路徑走得快一點
def SC(n): return int(round(n * TS))
_last = -1
for kk in keys4:
    kk[0] = max(SC(kk[0]), _last + 1); _last = kk[0]
KIN0 = {"arm": "ar", "at": "s1:start-40", "keys": [[0, dict(keys4[0][1])]]}
KIN4 = {"arm": "ar", "at": K4, "keys": keys4, "carry": [{"layer": "wfA", "grab": SC(22), "release": SC(93)}, {"layer": "wfB", "grab": SC(134), "release": SC(192)}]}
def k4(n): return add(K4, SC(n))

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
VIS += [hid("wfC", "s8:start+6", "s10:start-6", 8)]
VIS += show("nzStr", "s5:stream-2", "s5:film+56", 5)
VIS += show("ipStr", "s7:expand-8", "s7:expand+70", 5)

# ═════════ 晶圓盒前門、取門器、擋液杯、噴嘴臂 ═════════
DOOR = [mv("foup2Door", "s3:door-6", "s5:start+30", 10, dx=0.25), mv("foup2Door", "s3:door+4", "s5:start+20", 14, dy=-3.3), mv("door2Arm", "s3:door-6", "s5:start+30", 10, dx=0.25), mv("door2Arm", "s3:door+4", "s5:start+20", 14, dy=-3.3),
        mv("lMap", "s3:map-2", "s4:start-4", 44, dy=-2.95)]
SHUT = [mv("c1Shut", k4(60), k4(205), 14, dy=-2.4)]                        # 手臂伸進腔體前，窄縫擋板往下收進牆裡；退出後關回
CUPPOS = [mv("c1Cup", "s1:start-40", "s5:spin-4", 22, dy=-2.3), mv("c1Cup", "s7:dry-4", "s7:start+58", 22, dy=-0.9), mv("c1Cup", "s7:start+58", FAR, 22, dy=0.9)]   # 裝片時杯口降到刀片下面；甩乾時杯口換到純水那一層（杯口升降）
# 噴嘴臂 IPA 臂：停放 → 掃進（run，不是 kin）
# ═════════ s2 爆炸分解（規格 10 步中的 1～6 與 10；7 在 s6、8 與 9 在 s8）：一次一張標籤，每張 ≥45 幀；組回後停 ≥1.5 秒才換幕 ═════════
def st2(n): return f"s2:start+{n}"
S2 = dict(ffu=34, panel=46, lpPull=86, body=128, lift=178, back=210)   # Andy 第 39 條：全在旁白念的期間做完（念到「外殼打開」34、「玄關」86、「前端搬運區」128、「再往裡」178），組回 210→228，幕尾 246          # 步驟 2 風扇濾網上移｜3 外殼面板滑開｜4 裝載端向機外拉開｜5 搬運區整體向左滑開｜6 清洗機上層腔體抬起｜10 全部組回
EXP_B = st2(S2["back"])
LPL = ["lp1", "lp2", "lp3", "lp1Base", "lp2Base", "lp3Base"]
EFEML = ["arBase", "arZ", "lp1Base", "lp2Base", "lp3Base", "efem", "efemFloor", "ffu", "lp1", "lp2", "lp3", "foup1", "foup2", "foup3", "foup1Door", "foup2Door", "foup3Door", "door2Arm", "door2Rail", "aligner", "ar", "wfA"]
CABL = ["cc", "ccTank", "ccPump", "ccFilter", "ccHeater", "ccValve", "ccPipe", "ccDrain"]
EXPLODE = [mv("ffu", st2(S2["ffu"]), EXP_B, 18, dy=6.0),                                                       # 2：風扇濾網向上滑出（氣流線留在原位）
           *[mv(l, st2(S2["panel"]), EXP_B, 18, dz=8) for l in ("efemFront", "clFront", "ccDoor")], *[hid(l, st2(S2["panel"] + 14), EXP_B, 8) for l in ("efemFront", "clFront", "ccDoor")],   # 3：前面板整塊移走
           hid("efem", st2(S2["panel"] + 12), EXP_B, 10, 0.2),                                                   # 搬運區殼板半透明：露出手臂與預對準器
           *[mv(l, st2(S2["lpPull"]), EXP_B, 18, dx=-2.5) for l in LPL],                                          # 4：裝載端三個向機外（−X）拉開，晶圓盒留在原位
           *[mv(l, st2(S2["body"]), EXP_B, 22, dx=-4.5) for l in EFEML],                                          # 5：搬運區整體向 −X 滑開，露出清洗機的交接口
           mv("cl", st2(S2["lift"]), EXP_B, 18, dy=4.0), mv("c3", st2(S2["lift"]), EXP_B, 18, dy=2.4), mv("c4", st2(S2["lift"]), EXP_B, 18, dy=2.4),   # 6：清洗機上層腔體組抬起
           mv("c1Fan", st2(S2["lift"] + 6), EXP_B, 18, dy=3.0)]                                                   # 6：第一個腔體的頂蓋（風扇濾網）掀開
# ═════════ s6 拆開腔體：腔體牆隱藏、頂風扇上升、噴嘴臂向外上方旋開、擋液杯整環向上抽出、晶圓取走、吸盤與馬達分開 ═════════
def st6(n): return f"s6:start+{n}"
X6B = st6(132)
EXP6 = [mv("c1NzA", st6(4), X6B, 18, dy=4.8, dx=1.6), mv("c1Nz", st6(4), X6B, 20, dy=4.8, dx=1.6),                    # 7a：噴嘴臂向外上方旋開
        mv("c1Cup", st6(54), X6B, 18, dy=6.0), mv("c1CupPipe", st6(54), X6B, 18, dy=6.0),                              # 7b：擋液杯整環向上抽出
        mv("c1Chuck", st6(98), X6B, 18, dy=3.0), mv("wfC", st6(98), X6B, 18, dy=3.0)]                                # 7c：吸盤（載著晶圓）與底下的馬達分開
# ═════════ s8 化學液櫃（規格第 8 步）：門滑開 → 液櫃向 +X 拉開、內部儲桶／泵／濾芯／加熱／閥島由下往上依序垂直排開（一次一張標籤）→ 組回 → 藥液沿管路流 → 鏡頭到電控箱、門打開（第 9 步） ═════════
def st8(n): return f"s8:start+{n}"
# r5：爆炸、標籤、組回、起流全部綁念稿 cue 或收聲（end），不用固定幀——有錄音後各幀跟著實際念到的位置走（見 README r5）
BACK8 = "s8:start+110"                      # 組回：念完才開始（收聲後 6 幀）；18 幀組完＝end+24
FL0, FL1 = "s8:start+112", "s8:start+134"    # 組完後先靜止 38 幀（1.27 秒），鏡頭在這段推近管路；再起流 54 幀（1.8 秒）
EB = lambda n: f"s8:start+{132 + n}"      # 電控箱段（流動結束後鏡頭轉到電控箱）
EB_B = BACK8
CAB8 = [mv("ccDoor", st8(4), FAR, 18, dz=8), hid("ccDoor", st8(14), FAR, 8),
        *[mv(l, st8(10), EB_B, 18, dx=3.0) for l in CABL],
        mv("ccPump", "s8:pump-4", EB_B, 18, dy=2.2), mv("ccFilter", "s8:pump+2", EB_B, 18, dy=4.4), mv("ccHeater", "s8:pump+10", EB_B, 18, dy=6.6), mv("ccValve", "s8:mix-4", EB_B, 18, dy=8.8),
        hid("ccPipe", "s8:pump-4", EB_B, 10, 0.12), hid("cc", "s8:pump-12", EB_B, 10, 0.16)]
# ═════════ s9 批次酸槽：卡匣一槽一槽浸泡（拖車沿導軌走、桿子伸縮、卡匣下降再升起） ═════════
BB = []
t0 = "s9:start+62"
for i in range(1):
    a = 56 * i
    if i: BB += [mv("bbCar", add(t0, a - 14), FAR, 16, dx=3.2), mv("bbCass", add(t0, a - 14), FAR, 16, dx=3.2), mv("bbRod", add(t0, a - 14), FAR, 16, dx=3.2)]
    BB += [mv("bbCass", add(t0, a), add(t0, a + 30), 12, dy=-3.0), mv("bbRod", add(t0, a), add(t0, a + 30), 12, dy=-3.0)]

# ═════════ 每一幕的「焦點」：不在那幕的層直接藏起來，不留糊殘影 ═════════
G_EFEM = {"arBase", "arZ", "lp1Base", "lp2Base", "lp3Base", "efem", "efemFloor", "ffu", "lp1", "lp2", "lp3", "foup1", "foup2", "foup3", "foup1Door", "foup2Door", "foup3Door", "door2Arm", "door2Rail", "aligner", "ar", "wfA", "wfR", "wfB", "lMap", "floor"}
G_C1 = {"c1Wall", "c1Chuck", "c1Motor", "c1Cup", "c1CupPipe", "c1Drain", "c1Exh", "c1Shut", "c1Fan", "c1Valve", "c1Nz", "c1NzA", "c1Ip", "c1IpA", "nzStr", "ipStr", "wfC", "c1Pipe", "filmEdge", *[f"film{k}" for k in range(8)], *[f"dry{j}" for j in range(7)]}
G_EFEM_BARE = G_EFEM - {"efem", "ffu"}
S4 = (G_EFEM_BARE - {"door2Rail"}) | {"c1Wall", "c1Chuck", "c1Cup", "c1CupPipe", "c1Drain", "c1Shut", "wfC"}
S5 = {"c1Cup", "c1Chuck", "wfC", "c1Nz", "c1NzA", "nzStr", "filmEdge", *[f"film{k}" for k in range(8)]}
S6 = {"c1Cup", "c1CupPipe", "c1Chuck", "c1Motor", "wfC", "c1Nz", "c1NzA", "c1Drain"}
S7 = {"c1Cup", "c1Chuck", "wfC", "c1Ip", "c1IpA", "ipStr", "filmEdge", *[f"dry{j}" for j in range(7)]}
G_CAB = {"cc", "ccDoor", "ccTank", "ccPump", "ccFilter", "ccHeater", "ccValve", "ccPipe", "ccDrain", "ebox", "ebDoor", "ebIn"}
G_BB = {"bb", "bbLid", "bbRail", "bbCar", "bbRod", "bbCass", *[f"bbT{i}" for i in range(6)]}
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
            a = "s1:start-40" if run_ == 1 else ("s9:start-8" if run_ == 9 else (f"s{run_}:start+6" if run_ in (8, 10) else f"s{run_}:start+2"))
            b = FAR if i == 99 else ("s9:start-10" if i == 9 else (f"s{i}:start-6" if i in (8, 10) else f"s{i}:start+14"))
            FOCUS.append(hid(l, a, b, 10)); run_ = None
# ═════════ 近景視窗：一段時間內只留特寫主角，其他層藏起來（主素材框才會小、鏡頭才能貼近而不被讀數帶或卡片蓋住） ═════════
def CLOSE(keep, a, b, dur=8): return [hid(l, a, b, dur) for l in ALL if l not in keep]
CL3 = {"lp2", "foup2", "foup2Door", "door2Arm", "door2Rail", "lMap", "wfA"}
CL4 = {"ar", "foup2", "wfA", "arZ"}
CL8 = {"ebox", "ebDoor", "ebIn"}
CL9 = {"bbT0", "bbT1", "bbCass"}
CL8b = CL8 | G_BB
CL9_BB = {l for l in G_BB if l in CL9}
WIN = (CLOSE(CL3 | CL4, "s3:door-14", k4(80)) + [hid(l, "s4:start-6", k4(80), 6) for l in sorted(CL3 - CL4)] + CLOSE(CL8b, EB(-24), "s9:start-8")
       + CLOSE(CL9 | (set(ALL) - G_BB), "s9:start+40", "s10:start-6") + [hid(l, "s9:start+40", FAR, 8) for l in G_BB if l not in CL9])
# ═════════ 各幕 props ═════════
def lab_(part, text, en, color, at, until, **kw): return lab(part, text, en, color, at, until, **kw)
P = {}
BASE = VIS + DOOR + SHUT + CUPPOS + EXPLODE + EXP6 + CAB8 + BB + FOCUS + WIN
P["s1"] = {"shot": [shot("start-30", 5, 8.5, 175, 22, 1), shot("start", 5, 8.5, 160, 24, 90)],
 "shift": BASE, "kin": [KIN0],
 "run": [run("alnGreen", "start-30", FAR, 1), run("cabLed", "start-30", FAR, 1), run("ebLamp", "start-30", FAR, 1), run("nzPark", "start-30", "s5:nz-2", 1), run("ipPark", "start-30", "s7:dry", 1),
         run("pumpBeat", "s8:pump", "s8:mix", 6)],
 "overlay": [sec("twequip-hook", "q", "s2:start-5", "系列 2 第 12 集", "示意，非實際比例", {"prev": "prev", "q": "q", "tw": "tw"})]}
P["s2"] = {"zoom": [{"to": "tool", "at": "start-4", "dur": 1}], "shot": [shot("start", 2.5, 9.5, 170, 30, 30, yaw=0.1)],
 "labels": [lab_("ffu", "頂部風扇濾網（FFU）", "Fan filter unit", "blue", "start+36", "start+81"),
            lab_("lp", "裝載端＋晶圓盒", "Load ports & wafer pods", "amber", "start+88", "start+133"),
            lab_("armCol", "搬運手臂（雙刀）", "Dual-blade robot", "blue", "start+140", "start+185"),
            lab_("chamber", "清洗腔（單片旋轉）", "Single-wafer chamber", "amber", "start+192", "start+237")],   # 一次一張、每張 45 幀；預對準器與交接口兩張拿掉（放不下）
 "overlay": [sec("twequip-tour", "start+24", "s3:start-5", "拆開清洗機", "示意（非弘塑／辛耘實機）", {"open": "open", "efem": "efem", "chamber": "chamber", "cab": "start+206"})]}
P["s3"] = {"shot": [shot("start", -9.5, 10.6, 98, 30, 30, yaw=-0.1), shot("start+52", FX + 1.05, 9.2, 36, 30, 30)],
 "run": [run("ffuAir", "fan-4", "s4:start", 8), run("ffuAir2", "fan-4", "s4:start", 8), run("ffuAir3", "fan-4", "s4:start", 8), run("mapBeam", "map-2", "s4:start-4", 4)],
 "labels": [lab_("ffu", "頂部風扇濾網（FFU）", "Fan filter unit", "blue", "start+3", "start+48"),
            lab_("door", "裝載端取門器＋晶圓盒", "Load port & wafer pod", "amber", "start+51", "start+96"),
            lab_("map", "映射感測：數每一槽", "Wafer mapping sensor", "blue", "start+98", "start+143")],
 "overlay": [sec("twequip-foup", "start+2", "s4:start-5", "晶圓盒開門與映射", "示意（片數、片距為示意）", {"fan": "fan", "door": "door", "map": "map", "slot": "slot"})]}
P["s4"] = {"shot": [shot("start", -10.6, 9.6, 32, 34, 30), shot("start+44", -7, 6.8, 72, 32, 22)], "kin": [KIN4],
 "run": [run("alnLaser", k4(97), k4(128), 4), run("alnSpin", k4(98), k4(122), 8), run("zSpin", k4(18), k4(36), 8), run("zSpin", k4(130), k4(146), 8)],
 "labels": [lab_("blade", "雙刀：上刀載片、下刀空刀", "Dual blade: upper carries, lower empty", "blue", "start+8", "start+53"),
            lab_("aln", "預對準器：找缺口", "Pre-aligner", "amber", "start+56", "start+101"),
            lab_("chuck", "旋轉吸盤＋抓取銷", "Spin chuck & edge-grip pins", "blue", "start+104", "start+149")],
 "overlay": [sec("twequip-arm", "start+2", "s5:start-5", "手臂直線伸入、雙刀快換", "示意（專利範例）", {"arm": "arm", "lift": "lift", "align": "align", "put": "put"})]}
P["s5"] = {"shot": [shot("start", CX1, 8.8, 40, 40, 30, yaw=0.05)],
 "run": [run("c1Air", "start", FAR, 8), run("cupHot", "stream", "s7:dry", 8), run("spinLo", "spin", "s7:start", 12), run("nzSwing", "nz+22", "s5:film+60", 8),
         run("nzGlow", "stream", "film+56", 4), run("backJet", "stream", "s6:start", 6)] + [run(f"spir{k}", "film+8", "s6:start", 6) for k in range(4)] + [run(f"fling{k}", "fling-24", "s6:start", 6) for k in range(6)] + [run(f"dr{k}", "film+46", "s7:dry", 6) for k in range(3)] +
         [run("nzPark", "film+60", "s6:split", 24)],
 "labels": [lab_("chuck", "旋轉吸盤＋抓取銷", "Spin chuck & edge-grip pins", "blue", "start+8", "start+53"),
            lab_("nz", "噴嘴臂：中心掃到邊緣", "Swing nozzle arm", "amber", "start+58", "start+103"),
            lab_("film", "液膜：離心力推開", "Liquid film", "blue", "start+112", "start+157")],
 "overlay": [sec("twequip-chamber", "start+24", "s6:start-5", "單片腔：噴液與液膜", "示意（轉速、溫度為示意）", {"spin": "spin", "nz": "nz", "stream": "stream", "film": "film", "fling": "fling"})]}
P["s6"] = {"shot": [shot("start", CX1 + 0.5, 7.4, 84, 28, 30, yaw=0.1)],
 "run": [run("nzPark", "start", FAR, 1)],
 "labels": [lab_("nz", "噴嘴臂（旋開）", "Nozzle arm swings out", "amber", "start+6", "start+51"),
            lab_("cup", "擋液杯（三層）", "Splash cup (3 levels)", "blue", "start+58", "start+103"),
            lab_("chuck", "旋轉吸盤＋下方馬達", "Spin chuck & motor below", "amber", "start+110", "start+155")],   # 馬達那張併進吸盤（放不下 4 張）
 "overlay": [sec("twequip-cup", "start+24", "s7:start-5", "杯內分路：一層一種藥液", "示意（配比、溫度不標）", {"split": "split", "nz": "start+12", "cup": "cup", "chk": "start+100", "mot": "start+118"})]}
P["s7"] = {"shot": [shot("start", CX1, 7.3, 36, 52, 30)],
 "run": [run("spinHi", "dry", FAR, 14), run("c1Air", "start", FAR, 4), run("ipSweep", "expand", FAR, 52), run("n2Glow", "expand-8", "expand+70", 4), run("ipaGlow", "expand-8", "expand+70", 4), run("nzPark", "start", FAR, 1)] + [run(f"dw{k}", "dry", "ipa-8", 6) for k in range(3)] + [run(f"dp{k}", "ipa", "mark+20", 6) for k in range(3)] + [run(f"fling{k}", "dry", "expand", 6) for k in range(6)],
 "labels": [lab_("ip", "異丙醇（IPA）臂：跟著乾區走", "IPA arm follows the dry front", "amber", "start+52", "start+97")],
 "overlay": [sec("twequip-dry", "start+24", "s8:start-5", "甩乾：乾區由中心向外", "示意", {"dry": "dry", "expand": "expand", "ipa": "ipa", "mark": "mark"})]}
P["s8"] = {"shot": [shot("start", 22.5, 9.5, 128, 20, 30, yaw=0.05), shot("start+84", 20.6, 7.5, 88, 17, 26), shot(EB(-18), 12.2, 4.4, 40, 14, 24)],
 "capNote": [{"at": EB(-4), "until": "start+170", "zh": "電控箱：控制整套動作", "en": "Electrical cabinet: runs the whole sequence"}],
 "run": [run("chemFlow", FL0, FL1, 8), run("chemFlow2", add(FL0, 6), FL1, 8), run("pumpBeat", "pump-4", FAR, 6), run("ebDoorOpen", EB(-12), "s9:start", 22), run("ebBlink", EB(0), "s9:start", 6)],
 "labels": [lab_("tank", "藥液桶（PE）", "Chemical drums", "blue", "start+30", "start+75"),
            lab_("pump", "幫浦＋濾芯", "Pump & filter", "amber", "start+80", "start+125")],   # 電控箱那張標籤拿掉：s9 開場切景（s9:start-8）會讓標籤蓋到中央，改用 capNote 說明；混合閥島也拿掉（放不下，一次一張×45 幀）
 "overlay": [sec("twequip-chem", "start+24", "s9:start-5", "藥液怎麼送進腔", "示意（配比不標數字）", {"tank": "tank", "pump": "pump", "mix": "mix", "eb": EB(-4)})]}
P["s9"] = {"shot": [shot("start-10", 45, 5.2, 105, 24, 22, yaw=-0.05), shot("start+46", TKX_C, -0.5, 50, 30, 30)],
 "run": [run(f"bbOver{i}", "start", FAR, 6) for i in range(2)] + [run("bbIpa", "start", FAR, 6), run("bbDrip", "start+92", FAR, 6)],
 "labels": [lab_("bb", "批次酸槽（卡匣浸泡）", "Batch wet bench", "amber", "start+8", "start+53"),
            lab_("bbweir", "溢流堰＋外槽", "Overflow weir & trough", "blue", "start+59", "start+104"),
            lab_("bbht", "加熱棒＋下方泵與濾芯", "Heater, pump & filter", "amber", "start+110", "start+155")],
 "overlay": [sec("twequip-batch", "start+24", "s10:start-5", "批次 vs 單片", "專利範例，不是弘塑／辛耘機台規格", {"bat": "bat", "one": "one", "sgl": "sgl", "use": "use"})]}
P["s10"] = {"shot": [shot("start-16", 5, 8.5, 160, 22, 28, yaw=-0.2)],
 "overlay": [sec("twequip-who", "start+24", "s11:start-5", "台灣廠負責哪一段", "媒體報導；不列市占數字", {"front": "front", "foreign": "foreign", "tw": "tw", "back": "back"})]}
P["s11"] = {"shot": [shot("start-26", 5, 8.5, 150, 24, 20, yaw=-0.3)],   # 公司卡期間鏡頭不動（Andy 第 40 條）：鏡頭在卡片出現前就位
 
 "overlay": [sec("twequip-co", "gptc-6", "s12:start+36", "台灣設備與載具廠", "機台外觀為示意，非其實機", {"gptc": "gptc", "sci": "sci", "gdg": "gdg"})]}
P["s12"] = {"shot": [shot("start+38", 5, 8.5, 150, 26, 40)],   # 公司卡延長到本幕 start+36，延長期間鏡頭不動
 "overlay": [sec("twequip-next", "start+44", "s13:start-14", "接下來", "下一集：2-13", {"next": "next", "kw": "kw"})]}
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
