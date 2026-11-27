"""tech-cleanroom 腳本產生器：python3 videos/tech-cleanroom/genscript.py → script.json（自動先跑 gen-model.mjs 產 model.json）
廠務-1：無塵室（科技透明圈 系列 2 第 19 集；前一集 2-18：耗材「放在一個超乾淨的房間」；下一集 2-20：廠務的水氣電）。念稿定稿於 script.md（**一字不改**）。
旁白、cue、字幕、hook、片尾卡、hud、voice 與各幕 3D 動作（shot／shift／run／labels／overlay）都在這支；cue 來自 timeline.json，配音後重跑本檔即可。
2D 卡：src/components/three/HudCleanroom.tsx（cr-*）。構造與物理：physics-spec.md；模組清單與爆炸步驟對應：visual-spec.md。
Andy 第 27 條：念稿 ≤260 字、一幕一件事、關鍵畫面念完留 ≥1.2 秒（holdSec／headSec）；第 28 條：≥3 個生活比喻；第 29 條：爆炸分解步驟全部做完；
第 18 條：念稿不用縮寫；第 21、22 條：念稿避開「上」「量測」；第 32 條：出處列只放真實來源；第 13 條：每幕 ≥4.5 秒、標籤 ≥45 幀一次一張。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
INFO = MODEL["info"]
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, 無聲幕長秒, 開口前只有畫面秒, 念完後最少只有畫面秒)
S = [
("s1", "hook", "機台住的那間房，到底有多乾淨？前一集說，機台都放在超乾淨的房間。",
 ["機台住的那間房", "到底有多乾淨？", "前一集說", "機台都放在", "超乾淨的房間"], ["The room the tools live in:", "how clean is it?", "Last episode said", "the tools all sit", "in an ultra-clean room."],
 [("room", "那間房"), ("clean", "多乾淨"), ("prev", "前一集")], ["多乾淨", "前一集", "超乾淨"], ["示意動畫，不是量測"], 6.6, 0.0, 1.2),
("s2", "mechanism", "這間房叫無塵室。最乾淨那一級，衣櫃大的空氣，最多只准十顆灰塵。",
 ["這間房叫無塵室", "最乾淨那一級", "衣櫃大的空氣", "最多只准", "十顆灰塵"], ["It's called a cleanroom.", "In the cleanest class,", "a closet's worth of air", "may hold at most", "ten dust particles."],
 [("cr", "無塵室"), ("top", "最乾淨"), ("closet", "衣櫃"), ("ten", "十顆灰塵")], ["無塵室", "最乾淨", "十顆灰塵"], ["ISO 14644-1（Class 1 約 10 顆／m³）；HORIBA、igus"], 7.6, 0.3, 1.6),
("s3", "mechanism", "空氣怎麼乾淨？天花板鋪滿風扇加濾網，把乾淨空氣往下吹，像一道瀑布。",
 ["空氣怎麼乾淨？", "天花板鋪滿", "風扇加濾網", "把乾淨空氣", "往下吹", "像一道瀑布"], ["How is the air cleaned?", "The ceiling is covered", "with fan filter units,", "pushing clean air", "straight down,", "like a waterfall."],
 [("how", "怎麼乾淨"), ("ceil", "天花板"), ("ffu", "風扇加濾網"), ("down", "往下吹"), ("fall", "瀑布")], ["天花板", "風扇加濾網", "瀑布"], ["ASHRAE ch.18；Wikipedia：Fan filter unit；示意"], 7.9, 0.3, 2.0),
("s4", "mechanism", "濾網裡是一團纖維迷宮，灰塵撞到就黏住。空氣再從地板孔洞抽回，重新過濾。",
 ["濾網裡是", "一團纖維迷宮", "灰塵撞到就黏住", "空氣再從", "地板孔洞抽回", "重新過濾"], ["Inside the filter is", "a maze of fibers;", "dust hits and sticks.", "Then the air", "is pulled back through floor holes", "and filtered again."],
 [("filt", "濾網"), ("maze", "纖維迷宮"), ("stick", "黏住"), ("floor", "地板孔洞"), ("again", "重新過濾")], ["濾網", "纖維迷宮", "地板孔洞"], ["HEPA 濾材原理（IEST）；USPTO 9115910；示意"], 8.9, 0.3, 2.0),
("s5", "mechanism", "最大的灰塵來源，其實是人。所以要穿無塵衣，像連身雨衣，把皮屑和頭髮都包住。",
 ["最大的灰塵來源", "其實是人", "所以要穿無塵衣", "像連身雨衣", "把皮屑和頭髮", "都包住"], ["The biggest dust source", "is actually people.", "So they wear cleanroom suits,", "like a one-piece raincoat,", "keeping skin flakes and hair", "all sealed in."],
 [("src", "灰塵來源"), ("ppl", "是人"), ("suit", "無塵衣"), ("rain", "連身雨衣"), ("hair", "皮屑")], ["是人", "無塵衣", "連身雨衣"], ["RSSL、Prudential（供應商估計）；示意動畫"], 8.5, 0.3, 1.6),
("s6", "mechanism", "房間氣壓比外面高，像輪胎的氣，門一開，風只往外吹，髒空氣進不來。",
 ["房間氣壓", "比外面高", "像輪胎的氣", "門一開", "風只往外吹", "髒空氣進不來"], ["The room's air pressure", "is higher than outside,", "like air in a tire.", "When a door opens,", "air only blows out;", "dirty air can't get in."],
 [("pres", "氣壓"), ("tire", "輪胎"), ("door", "門一開"), ("out", "往外吹"), ("dirty", "進不來")], ["氣壓", "輪胎", "往外吹"], ["Wikipedia: Cleanroom；ASHRAE ch.18；示意動畫，不是量測"], 7.5, 0.3, 1.6),
("s7", "mechanism", "溫度、濕度也被固定，不然材料會脹縮，靜電也會亂跑。",
 ["溫度、濕度", "也被固定", "不然材料會脹縮", "靜電也會亂跑"], ["Temperature and humidity", "are held fixed too,", "or materials swell and shrink", "and static runs wild."],
 [("temp", "溫度"), ("hum", "濕度"), ("fix", "固定"), ("exp", "脹縮"), ("static", "靜電")], ["溫度、濕度", "靜電"], ["Semiconductor Digest 環境控制；示意（不標溫濕度數值）"], 6.3, 0.3, 1.6),
("s8", "payoff", "台灣有漢唐、亞翔、洋基工程，專門蓋這種房間。",
 ["台灣有漢唐", "亞翔、洋基工程", "專門蓋這種房間"], ["In Taiwan: UIS,", "L&K, and Yankey Engineering", "build these rooms."],
 [("tw", "台灣"), ("uis", "漢唐"), ("lk", "亞翔"), ("yk", "洋基"), ("build", "專門蓋")], ["漢唐", "亞翔、洋基工程"], ["經濟日報、工商時報、自由時報報導；截至 2026/11/27"], 5.5, 0.2, 1.3),
("s9", "cta", "房間乾淨了，機台還需要水、氣、電。下一集，看廠務的水氣電。留言無塵室，拿完整資料。",
 ["房間乾淨了", "機台還需要", "水、氣、電", "下一集", "看廠務的水氣電", "留言無塵室", "拿完整資料"], ["The room is clean,", "but the tools still need", "water, gas, and power.", "Next episode:", "the fab's water, gas and power.", "Comment \"cleanroom\"", "for the full notes."],
 [("clean", "乾淨了"), ("need", "還需要"), ("w", "水、氣、電"), ("next", "下一集"), ("kw", "留言無塵室")], ["水、氣、電", "下一集", "無塵室"], ["示意動畫，不是量測"], 8.4, 0.2, 1.2),
]
def TTS(t):
    t = t.replace("上集", "上一集").replace("上一一集", "上一集").replace("矽", "細").replace("光罩", "光照")
    for a, b in [("上一集", "前一集"), ("量測", "測量"), ("上百片", "一百多片")]:
        t = t.replace(a, b)
    return t
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, dur, head, tail) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    assert re.sub(r"[ 、]", "", "".join(zh)) == re.sub(r"[，。、]", "", nar), (sid, "字幕與旁白文字不同")
    for z in zh: assert len(re.sub(r"[ ，。？]", "", z)) <= 11, (sid, z)
    for z in zh[:-1]: assert len(re.sub(r"[ ，。？]", "", z)) >= 3, ("字幕短語 <3 字會被併入下一段、英文對位跑掉", sid, z)
    for e in en: assert len(e) <= 42, (sid, e)
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace(" ", ""), (sid, c)
    # Andy 第 39 條（11-27 晚）：旁白之間的無聲最多 1 秒 → 念完後留白一律 1.0 秒（本幕 hold＋下一幕 head ≤ 1.0），幕長＝開口前＋念稿估計＋留白
    head = 0.0      # 開口前不另留白（上一幕的 1.0 秒留白已算進兩幕之間的無聲）
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar)); hold = 0.85   # 加上 silent-timeline 開口前 4 幀＝兩幕人聲間隔 0.98 秒
    dur = max(4.5, round(head + 0.2 + nch / 5.2 + hold, 1))
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
md = open(os.path.join(HERE, "script.md")).read()
blk = md.split("## 可直接貼 AI Studio 的念稿")[1].split("## 字幕與念稿差異")[0]
paras = [p.strip() for p in blk.split("\n\n")[1:] if p.strip()]
assert paras == [s["narration"] for s in scenes], ("念稿與 script.md 不同", paras, [s["narration"] for s in scenes])
scenes[0]["props"]["hook"] = {"kicker": "接上集：超乾淨的房間也分等級", "title": "最乾淨一級：10 顆", "size": 104, "top": 236}
scenes.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "廠務的水氣電", "trail": ["房間乾淨了，還要水氣電"], "comment": "無塵室", "logoAnim": "transparent"}}})

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
# 換幕規則：每幕的 3D 鏡頭切換、2D 卡片、字幕、出處列在「字幕窗起點＝本幕 voice-3」同一幀換（卡片與標籤用 cut：1 幀就位、1 幀收走）
C = "voice-3"
CC = "voice-4"       # 3D 鏡頭硬切與 HUD 層級切換（dur 1）提早 1 幀下指令，voice-3 那一幀完全換好
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3"
def card(sid, kind, title, tag, t=None, **kw):
    return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)

# ── 站 R 的狀態層 ──
# s2：前牆左右兩半向兩側滑開（爆炸 2.1-1），滑到畫面外後收掉；院子（警衛室、旗桿、冷卻水塔、管排）在鏡頭切到衣櫃時收掉，之後的廠房內部鏡頭不被擋
VIS += [mv("frontL", "s2:cr-2", FAR, 26, dx=-14.0), mv("frontR", "s2:cr-2", FAR, 26, dx=14.0)]
VIS += [hid("frontL", "s2:cr+30", FAR, 4, 0), hid("frontR", "s2:cr+30", FAR, 4, 0)]
VIS += [hid("yard", "s2:closet-6", FAR, 1, 0)]
# s3：風扇濾網陣列沿 Y 往上分開半個身位（爆炸 2.1-2），停住 1.6 秒後組回、空氣才開始往下吹
for l in ("ffuArr", "ffuFront", "oneFrame", "oneFan", "oneHepa"):
    VIS += [mv(l, "s3:ffu-4", "s3:ffu+40", 18, dy=1.5)]
# s3 俯看天花板時屋頂與屋頂機組暫時拿掉（剖開看見風扇濾網方格陣列與上方空氣室），鏡頭回到平視時放回
VIS += [hid(l, "s3:ffu-10", "s3:down-6", 10, 0) for l in ("roof", "roofTop")]
# s4：拉出一台（爆炸 2.1-3）：風扇箱往上、濾網往下、外框留在原位；切到纖維放大期間組回
VIS += [mv("oneFan", "s4:voice-3", "s4:maze+30", 20, dy=1.1), mv("oneHepa", "s4:voice-3", "s4:maze+30", 20, dy=-0.8)]
# s4：高架地板往下分開（爆炸 2.1-4），露出回風層；念完「重新過濾」組回（2.1-5）
VIS += [mv(l, "s4:floor-2", "s4:again+14", 20, dy=-0.6) for l in ("rFloor", "slab")]
# s7：靜電電弧只在念「靜電」時出現約 0.7 秒（前後不留白色殘形）
vis("hSpark", [("s7:static+2", "s7:static+24")], 1)
# s9：水、氣、電管路依序淡入
vis("utilW", [("s9:w-4", FAR)], 10); vis("utilG", [("s9:w+10", FAR)], 10); vis("utilP", [("s9:w+24", FAR)], 10)
# 站 F：攔住的灰塵分三批出現（越積越多）
vis("fStuck0", [("s4:stick-6", "s4:floor-4")], 4); vis("fStuck1", [("s4:stick+14", "s4:floor-4")], 4); vis("fStuck2", [("s4:stick+34", "s4:floor-4")], 4)
# 站 P：無塵衣從上方落下套上（連身服 → 頭罩 → 手套 → 鞋套）；頭罩套上後頭髮收掉
VIS += [hid("person", "s5:suit+36", FAR, 1, 0)]       # 無塵衣全部套好後收掉便服層（避免便服從連身服穿出來）
for l, k in (("suitBody", 0), ("suitHood", 8), ("suitGlove", 14), ("suitBoot", 20)):
    VIS += [{"layer": l, "at": T0, "until": f"s5:suit+{k}", "dur": 16, "dy": {"suitBody": 1.6, "suitHood": 1.2, "suitGlove": 2.0, "suitBoot": 2.4}[l], "fallIn": True, "bounce": 0.05, "opacity": 0}]
# 站 B：漢唐模組一開始就在；亞翔、洋基念到時從上方落下
for l, c in (("bMod0", "uis"), ("bMod1", "lk"), ("bMod2", "yk")):
    VIS += [mv(l, f"s8:{c}-4", f"s8:{c}+8", 8, dy=0.6)]      # 念到哪家，那個模組跳起一下（三個一開始就都在，不留空景）
# s4 拉近看單台濾網時，下方與外殼各層暫時收掉（鏡頭只看天花板，主素材框不被畫面外的樓板撐大）；切回全景那一幀放回來
for l in ("shell", "tools", "rFloor", "slab", "subfab", "roofTop", "roof"):
    VIS += [hid(l, "s4:voice-4", "s4:floor-7", 1, 0)]

# ═════ 各幕 ═════
RX, RY, RD, RE = 0.0, 0.28, 67.5, 12      # 站 R 內部剖面（看向、距離、俯角）：整個剖面撐滿寬度，上緣約 y330
P = {}
P["s1"] = {"zoom": [{"to": "room", "at": "start", "dur": 1}],
 "shot": [shot("start-30", 0.75, 0.35, 106, 15, 1, yaw=0.0), shot("start", 0.75, 0.35, 102, 15, 170)],
 "shift": VIS,
 "run": [run("ffuLed", "start-30", FAR, 6), run("roofSpin", "start-30", "s2:closet", 4), run("flagWave", "start-30", "s2:closet", 4)],
 "overlay": [sec("cr-hook", "start", nxt("s1"), "系列 2・第 19 集", "示意，非特定廠房", {"room": "room", "clean": "clean", "prev": "prev"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "room", "at": "voice-18", "dur": 1}, {"to": "room", "at": CC, "dur": 1}],   # 第一個 zoom 讓鉤子大字在換幕前退場
 "shot": [shot(CC, 0.5, 0.95, 81, 15, 1), shot("cr+4", RX, RY, RD, RE, 30), shot("closet-6", 41.85, 1.63, 32, 14, 1, yaw=0.0), shot("closet", 41.85, 1.63, 30.5, 14, 60)],
 "run": [run(f"kBrown{i}", "closet-8", "s3:start+4", 6) for i in range(10)] + [run("kGlow", "ten-2", "s3:start+4", 6), run("kSample", "top", "s3:start+4", 6), run("ffuSpin", "cr+10", "s2:closet-6", 8)],
 "labels": [lab("room", "無塵室", "Cleanroom", "blue", "cr", "closet-8", xy=[300, 320]),
            lab("closet", "一立方公尺（衣櫃大）", "1 cubic meter", "amber", "closet+2", "closet+48"),
            lab("dust1", "灰塵（放大圈）", "Dust (circled)", "blue", "ten-4", "ten+42")],
 "overlay": [card("s2", "cr-class", "最乾淨那一級", "ISO 14644-1", {"cr": "cr", "top": "top", "closet": "closet", "ten": "ten"})]}
P["s3"] = {"zoom": [{"to": "room", "at": CC, "dur": 1}],
 "shot": [shot(CC, RX, RY, RD, RE, 1), shot("ffu-10", 0.0, 4.01, 63.0, 36, 24), shot("down-6", 0.0, 3.8, 44.0, 8, 30)],
 "run": [run("ffuSpin", "ceil-6", "s4:end+60", 10), run("ffuLed", "start", FAR, 6)] + [run(f"airDown{k}", "down", "s4:voice-6", 1) for k in range(3)] + [run(f"airDot{k}", "down+4", "s4:voice-6", 1) for k in range(3)]
        + [run("airWake", "down+10", "s4:voice-6", 1), run("dustDown", "down+6", "s4:voice-6", 1)],
 "labels": [lab("ffu", "風扇濾網（一台台排滿）", "Fan filter units", "amber", "ffu", "ffu+46")],
 "overlay": [card("s3", "cr-fall", "像一道瀑布：往下吹", "示意（不標風速）", {"ceil": "ceil", "ffu": "ffu", "down": "down", "fall": "fall"})]}
P["s4"] = {"zoom": [{"to": "room", "at": CC, "dur": 1}, {"to": "fiber", "at": "maze+16", "dur": 1}, {"to": "room", "at": "floor-6", "dur": 1}],
 "shot": [shot(CC, -0.8, 6.0, 21.5, 22, 1), shot("voice+2", -0.8, 5.9, 19.5, 22, 30), shot("maze+16", 70.0, 2.41, 35.0, 6, 1, yaw=0.0), shot("floor-6", RX, RY, RD, RE, 1)],
 "run": [run("oneSpin", "start", "maze+16", 8), run("ffuSpin", "start", FAR, 6), run("fAir", "maze-6", "floor-4", 6), run("fOut", "maze", "floor-4", 6)]
        + [run(f"fDust{i}", f"maze+{4 + i * 7}", "floor-4", 4) for i in range(6)]
        + [run("floorSuck", "floor+4", "s5:start+4", 6), run("loopL", "floor+10", "s5:start+4", 8), run("loopR", "floor+10", "s5:start+4", 8)]
        + [run(f"airDown{k}", "floor-6", "s5:start+4", 1) for k in range(3)] + [run("dustDown", "floor-6", "s5:start+4", 1)],
 "labels": [lab("hepa", "濾網（褶成 V 形）", "Filter, V-pleated", "amber", "voice-2", "voice+44", xy=[340, 968]),
            lab("stuck", "纖維黏住灰塵", "Fibers trap dust", "amber", "maze+18", "maze+64"),
            lab("ret", "回風（地板下）", "Return air", "blue", "floor+8", "floor+54")],
 "overlay": [card("s4", "cr-maze", "纖維迷宮＋回風循環", "示意", {"filt": "filt", "maze": "maze", "stick": "stick", "floor": "floor", "again": "again"})]}
P["s5"] = {"zoom": [{"to": "room", "at": CC, "dur": 1}],
 "shot": [shot(CC, 100.0, 3.08, 43.0, 6, 1)],
 "run": [run("walkL", "start", "suit-6", 10), run("walkR", "start", "suit-6", 10), run("armL", "start", "suit-6", 10), run("armR", "start", "suit-6", 10)]
        + [run(f"shed{i}", "start+2", "suit+4", 4) for i in range(12)]
        + [run(f"leak{i}", "hair-4", "s6:start+4", 6) for i in range(6)] + [run("leakGlow", "hair-4", "s6:start+4", 6), run("pDown", "start", "s6:start+4", 6)]
        + [run("walkL", "hair", "s6:start+4", 12, gain=0.6), run("walkR", "hair", "s6:start+4", 12, gain=0.6), run("armL", "hair", "s6:start+4", 12, gain=0.6), run("armR", "hair", "s6:start+4", 12, gain=0.6)],
 "labels": [lab("person", "皮屑、頭髮", "Skin flakes, hair", "amber", "src", "src+46"),
            lab("suit", "無塵衣", "Cleanroom suit", "blue", "suit+24", "suit+70")],
 "overlay": [card("s5", "cr-suit", "人是最大的灰塵來源", "示意（供應商估計，不標數字）", {"src": "src", "ppl": "ppl", "suit": "suit", "rain": "rain", "hair": "hair"})]}
P["s6"] = {"zoom": [{"to": "room", "at": CC, "dur": 1}],
 "shot": [shot(CC, 129.0, 0.54, 51, 30, 1)],
 "run": [run("gGaugeGlow", "pres", "tire+10", 6), run("gLockB", "door-20", "door+16", 4), run("doorB", "door-22", "door+6", 12), run("gOutB", "door-18", "door+18", 6),
         run("gShower", "door-18", "door+30", 4), run("gShower2", "door-18", "door+30", 4), run("gAnteGlow", "door-20", "door+40", 6),
         run("gLockA", "door+14", "s7:start+4", 4), run("doorA", "door+14", "s7:start+4", 14), run("gOutA", "door+22", "s7:start+4", 6), run("gDustBack", "door+26", "s7:start+4", 6)],
 "labels": [lab("gauge", "壓差表：裡面比外面高", "Pressure gauges", "amber", "pres", "pres+46"),
            lab("ante", "前室（風淋）", "Anteroom, air shower", "blue", "door-18", "door+28"),
            lab("press", "正壓：風只往外", "Positive pressure: air out", "amber", "door+30", "door+76")],
 "overlay": [card("s6", "cr-tire", "像輪胎的氣：只往外漏", "示意（不標壓差數字）", {"pres": "pres", "tire": "tire", "door": "door", "out": "out", "dirty": "dirty"})]}
P["s7"] = {"zoom": [{"to": "room", "at": CC, "dur": 1}],
 "shot": [shot(CC, 160.6, 1.84, 39.0, 20, 1)],
 "run": [run("hDialGlow", "temp", "exp", 6), run("hExpL", "exp-4", "static+20", 8), run("hExpBrL", "exp-4", "static+20", 8), run("hExpR", "exp-4", "static+20", 8), run("hSparkFlash", "static+2", "static+24", 2), run("hDustPull", "static+4", "s8:start+4", 6)],
 "labels": [lab("dial", "溫度表、濕度表", "Temp & humidity gauges", "blue", "temp", "temp+46"),
            lab("wafer", "圖案跟著脹縮（放大示意）", "Pattern swells and shrinks", "amber", "exp-4", "exp+42")],
 "overlay": [card("s7", "cr-env", "溫度、濕度都固定", "示意（不標溫濕度數值）", {"temp": "temp", "hum": "hum", "fix": "fix", "exp": "exp", "static": "static"})]}
P["s8"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [shot(CC, 190.0, -1.02, 49.0, 28, 1)],
 "run": [run("bHook", "start", "s9:start+4", 6), run("bGlow", "build-2", "s9:start+4", 6)],
 "overlay": [card("s8", "cr-co", "無塵室工程公司（台灣）", "報導；截至 2026/11/27", {"tw": "tw", "uis": "uis", "lk": "lk", "yk": "yk", "build": "build"})]}
P["s9"] = {"zoom": [{"to": "room", "at": CC, "dur": 1}],
 "shot": [shot(CC, RX, RY, RD, RE, 1)],
 "run": [run("ffuSpin", "start", FAR, 6)] + [run(f"airDown{k}", "start", FAR, 6) for k in range(3)] + [run("loopL", "start", FAR, 6), run("loopR", "start", FAR, 6),
         run("uWaterFlow", "w", FAR, 6), run("uGasFlow", "w+12", FAR, 6), run("uPowerFlow", "w+26", FAR, 6)],
 "labels": [lab("water", "水（超純水）", "Water", "blue", "w", "w+46"), lab("gas", "氣（各種氣體）", "Gas", "blue", "w+48", "w+94"), lab("power", "電", "Power", "amber", "w+96", "w+142")],
 "overlay": [sec("cr-next", C, "s10:start", "接下來", "下一集：廠務的水氣電", {"clean": "clean", "need": "need", "w": "w", "next": "next", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("room", "無塵室（示意）", "CLEANROOM", "10 m", "1 m"), lv("fiber", "濾網纖維放大（示意）", "FILTER FIBERS", "20 µm", "5 µm"), lv("co", "無塵室工程公司", "CLEANROOM BUILDERS", "10 m", "1 m")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-cleanroom", "prevEpisode": "2-18：耗材", "title": "無塵室（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b",
                 "_說明": "旁白金手指：照 docs/prompts/tech-旁白金手指.md；本支子聊天室不配音、不送 TTS"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠房"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["無塵室", "多乾淨？"], "sub": "衣櫃大的空氣只准十顆灰塵", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], r["from"]))
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
    for w in ["FFU", "HEPA", "ULPA", "ISO", "量測"]:
        if w in (s.get("narration") or "") + s["subtitle"]["zh"]: bad.append((s["id"], w))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = sum(s["durationSec"] for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(tot, 1), "秒；各幕", [s["durationSec"] for s in scenes], "hold", [s.get("holdSec") for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
# 字幕切段自查（r1 物理審查必改 4）：用 validate.mjs 的 splitPhrases 實際切中文，英文段數必須相同、每段 ≥3 字（「、」會被切開，需要時把整串放進 keywords）
chk = subprocess.run(["node", "-e", 'import("./scripts/validate.mjs").then(({splitPhrases,SUB_MAX_EM_V2,clean})=>{const s=JSON.parse(require("fs").readFileSync("videos/tech-cleanroom/script.json","utf8"));let bad=[];for(const c of s.scenes){if(!c.subtitle.zh)continue;const z=splitPhrases(c.subtitle.zh,c.keywords,SUB_MAX_EM_V2),e=c.subtitle.en.split("|");if(z.length!==e.length||z.some(x=>clean(x).length<3))bad.push(c.id+":"+z.join("/"))}console.log(bad.length?"字幕切段不符 "+bad.join(" "):"字幕切段 OK");process.exit(bad.length?1:0)})'], cwd=os.path.join(HERE, "..", ".."), capture_output=True, text=True)
print(chk.stdout.strip()); assert chk.returncode == 0, chk.stdout
