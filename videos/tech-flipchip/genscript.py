"""tech-flipchip 腳本產生器：python3 videos/tech-flipchip/genscript.py → script.json（自動先跑 gen-model.mjs）
覆晶（科技透明圈 系列 3 第 4 集；前一集 3-3 封裝材料；下一集 3-5 扇出型與晶圓級封裝）。念稿定稿於 script.md，**一字不改**（腳本會逐段比對）。
2D 卡：src/components/three/HudFlipchip.tsx（fc-*）。構造與物理：physics-spec.md；模組與爆炸步驟對照：visual-spec.md。"""
import json, re, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
r = subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], capture_output=True, text=True)
if r.returncode != 0: print(r.stdout, r.stderr); sys.exit(1)
MODEL = json.load(open(os.path.join(HERE, "model.json")))
I = MODEL["info"]
S = [
("s1", "hook", "腳不夠用，晶片的電怎麼接出去？前一集看完封裝材料，這集看覆晶。",
 ["腳不夠用", "晶片的電怎麼接出去？", "前一集", "看完封裝材料", "這集看覆晶"], ["Not enough pins:", "how do a chip's signals get out?", "Last episode:", "packaging materials.", "This one: flip chip."],
 [("q", "接出去"), ("prev", "前一集"), ("fc", "覆晶")], ["腳不夠用", "覆晶"], ["示意動畫，不是量測"], 0, 0.0, 0.7),
("s2", "mechanism", "覆晶，就是把晶片翻過來，正面朝下，像蓋印章，一次壓到載板。",
 ["覆晶就是把晶片翻過來", "正面朝下", "像蓋印章", "一次壓到載板"], ["Flip chip: turn the chip over,", "face down,", "like using a stamp,", "pressed onto the substrate at once."],
 [("fcw", "覆晶"), ("flip", "翻過來"), ("down", "正面朝下"), ("stamp", "蓋印章"), ("press", "壓到載板")], ["翻過來", "蓋印章", "載板"], ["IBM 研究（C4 覆晶，1960 年代）；示意動畫"], 0, 0.2, 0.7),
("s3", "mechanism", "打線只能排在邊緣一圈，覆晶整面都是接點，腳多、路也短。",
 ["打線只能排在", "邊緣一圈", "覆晶整面都是接點", "腳多路也短"], ["Wire bonds only fit", "around the edge;", "flip chip uses the whole face:", "more pins, shorter paths."],
 [("wb", "打線"), ("edge", "邊緣一圈"), ("full", "整面"), ("short", "路也短")], ["邊緣一圈", "整面", "路也短"], ["Amkor、ASE 覆晶技術說明；示意動畫"], 0, 0.2, 0.7),
("s4", "mechanism", "晶片背面朝外，沒有線擋著，直接貼散熱蓋。",
 ["晶片背面朝外", "沒有線擋著", "直接貼散熱蓋"], ["The chip's back faces out,", "no wires in the way,", "so a heat lid goes right on."],
 [("back", "背面朝外"), ("nowire", "沒有線"), ("lid", "散熱蓋")], ["背面", "散熱蓋"], ["覆晶球柵陣列封裝（FCBGA）通則；示意動畫，不是量測"], 0, 0.3, 0.7),
("s5", "mechanism", "接點是小凸塊，晶圓還沒切就先做好：電鍍銅柱，頂端戴一頂錫帽。",
 ["接點是小凸塊", "晶圓還沒切", "就先做好", "電鍍銅柱", "頂端戴一頂錫帽"], ["The contacts are tiny bumps,", "made before the wafer", "is even diced:", "plate copper pillars,", "then top each with a solder cap."],
 [("bump", "小凸塊"), ("wafer", "晶圓還沒切"), ("cu", "電鍍銅柱"), ("sn", "錫帽")], ["小凸塊", "銅柱", "錫帽"], ["晶圓凸塊製程（凸塊下金屬層、電鍍、回焊）文獻；示意動畫"], 0, 0.2, 0.7),
("s6", "mechanism", "放到載板加熱，錫一熔化，表面張力就像水珠，把放歪的晶片拉正。",
 ["放到載板加熱", "錫一熔化", "表面張力", "就像水珠", "把放歪的晶片拉正"], ["Placed on the substrate and heated,", "the solder melts;", "surface tension,", "like a water drop,", "pulls a crooked chip straight."],
 [("place", "放到載板"), ("melt", "熔化"), ("tension", "表面張力"), ("drop", "水珠"), ("align", "拉正")], ["熔化", "表面張力", "拉正"], ["C4 自我對位（錫量多時；細間距改熱壓接合）；示意動畫"], 0, 0.2, 0.7),
("s7", "twist", "可是晶片和載板熱脹冷縮差五倍，焊點會被扭壞。",
 ["可是晶片和載板", "熱脹冷縮差五倍", "焊點會被扭壞"], ["But the chip and substrate", "expand about 5x differently,", "which can twist the joints apart."],
 [("but", "可是"), ("cte", "熱脹冷縮"), ("x5", "五倍"), ("crack", "扭壞")], ["熱脹冷縮", "五倍", "扭壞"], ["文獻：矽約 3、有機載板約 16 ppm/°C；變形誇大示意"], 0, 0.2, 0.7),
("s8", "mechanism", "所以沿邊緣點膠，膠像紙巾吸水滲進縫裡，再烤硬護住焊點。",
 ["所以沿邊緣點膠", "膠像紙巾吸水", "滲進縫裡", "再烤硬", "護住焊點"], ["So glue is dispensed along the edge;", "like a paper towel soaking up water,", "it wicks into the gap,", "then it's baked hard", "to protect the joints."],
 [("edge", "沿邊緣點膠"), ("wick", "紙巾吸水"), ("gap", "滲進縫裡"), ("bake", "烤硬"), ("guard", "護住焊點")], ["點膠", "紙巾吸水", "烤硬"], ["底部填充（毛細流動、固化）製程說明；示意動畫"], 0, 0.2, 0.7),
("s9", "payoff", "封裝大廠有日月光、安靠，覆晶接合機有荷蘭的 Besi。",
 ["封裝大廠有", "日月光・安靠", "覆晶接合機有", "荷蘭的 Besi"], ["Big packaging houses:", "ASE and Amkor;", "flip-chip bonders:", "Besi from the Netherlands."],
 [("big", "封裝大廠"), ("ase", "日月光"), ("amk", "安靠"), ("fcb", "覆晶接合機"), ("besi", "Besi")], ["日月光", "安靠", "Besi"], ["TrendForce 2024 排名；Besi 官網（廠商說法）"], 0, 0.2, 0.87),
("s10", "cta", "覆晶還得靠載板拉線。下一集，把線直接做在晶圓，看扇出型與晶圓級封裝。",
 ["覆晶還得靠載板拉線", "下一集", "把線直接做在晶圓", "看扇出型", "與晶圓級封裝"], ["Flip chip still needs a substrate to route out.", "Next episode:", "wiring built right on the wafer,", "fan-out", "and wafer-level packaging."],
 [("sub", "載板拉線"), ("next", "下一集"), ("rdl", "直接做在晶圓"), ("fo", "扇出型")], ["載板", "扇出型"], ["示意動畫，不是量測"], 0, 0.0, 0.7),
("s11", "cta", "你手機的晶片是哪一種？留言覆晶，拿完整資料。",
 ["你手機的晶片", "是哪一種？", "留言覆晶", "拿完整資料"], ["Which kind is", "the chip in your phone?", "Comment \"flip chip\"", "for the full notes."],
 [("phone", "手機"), ("kw", "留言覆晶")], ["手機", "覆晶"], ["示意動畫，不是量測"], 0, 0.2, 0.7),
]
def TTS(t): return t.replace("矽", "細")
def em(z): return sum(0.55 if re.match(r"[A-Za-z0-9 ]", c) else 1 for c in re.sub(r"[，。？]", "", z))
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src, dur, head, tail) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert em(z) <= 11.5, (sid, z)
    for z in zh: assert not re.search(r"[、，；：]", z[:-1]) and len(re.sub(r"[ ，。？・]", "", z)) >= 3, ("字幕行內不放「、，」、每行 ≥3 字（字幕切分程式會在標點切開、短段併掉，中英錯位）", sid, z)
    for c in cues: assert c[1] in nar and c[1] in "".join(zh).replace("・", "、"), (sid, c)
    # Andy 第 39 條（11-27）：旁白之間的無聲 ≤1 秒 → 念完留白 hold ≤1.0、下一幕開口前 head 很短（hold＋下一幕 head ≤1.0）；動作都在念的期間做完
    # 第 40 條：念完最後一家公司名後再停 ≥1.0 秒（s9 hold 1.0，s10 head 0）；第 13 條：每幕 ≥4.5 秒
    nch = len(re.sub(r"[，。？！、；：\s]", "", nar)); hold = tail
    dur = max(4.5, round(head + nch / 5.2 + hold + 0.2, 1)); hold = round(dur - head - nch / 5.2 - 0.2, 2) if dur == 4.5 else hold
    assert dur <= 10 and hold <= 1.0, (sid, dur, hold)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar), "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues], "component": "ThreeScene", "sources": src, "props": {}, "durationSec": dur, "holdSec": hold}
    if head > 0: sc["headSec"] = head
    if i < len(S) - 1: sc["pauseAfter"] = hold
    scenes.append(sc)
md = open(os.path.join(HERE, "script.md")).read().split("---")[0].split("\n\n")[1:]
paras = [p.strip() for p in md if p.strip() and not p.startswith("念稿字數") and not p.startswith("已套用")]
assert [s["tts"] for s in scenes] == paras, ("念稿不一致", [s["tts"] for s in scenes], paras)
scenes[0]["props"]["hook"] = {"kicker": "接上集：倒過來好在哪？", "title": "腳不夠用？", "size": 120, "top": 236}
scenes.append({"id": "s12", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "扇出型與晶圓級封裝", "trail": ["線直接做在晶圓"], "comment": "覆晶", "logoAnim": "transparent"}}})
# ═════ 工具 ═════
FAR = "s12:start+400"; T0 = "s1:start-40"
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
C = "voice-3"; CC = "voice-4"
def nxt(sid): return f"s{int(sid[1:]) + 1}:voice-3" if sid != "s9" else "s10:voice"
# s9→s10：第 39 條（無聲 ≤1.0 秒）與第 40 條（念完最後一家公司名後 ≥1.0 秒才換幕）同時成立的做法：s9 念完留白 0.87 秒＋s10 開口前 4 幀＝1.0 秒，
# s9 的鏡頭撐到 s10 開口那一幀才換（Besi 念完到換幕剛好 1.0 秒），公司卡與出處列同一幀換
def card(sid, kind, title, tag, t=None, **kw): return sec(kind, C, nxt(sid), title, tag, t, cut=True, **kw)

# ═════ 站 A：取晶粒 → 翻面 → 交給接合頭 → 沾助焊劑 → 放到載板（s2）＝所有位移照幾何算 ═════
L1, U = 0.6, 0.6
BB = round(2 * I["PY"] - (I["TY"] + I["DT"] + 0.075), 3)          # 翻面後凸塊底（模型座標）
D1 = round(BB + L1 + U - (I["DY"] + 0.26), 3)                       # 往下沾助焊劑
D2 = round(BB + L1 + U - (I["SUBY"] + 0.02), 3)                     # 往下放到載板焊墊
DX1 = round(I["FX"] - I["HX"], 3); DX2 = round(I["SX"] - I["FX"], 3)
F = lambda n: f"s2:flip{n:+d}"
# 第 39 條：整段取放在 s2 念的期間做完（約 4.6 秒）：頂針頂起 → 翻面單元吸起 → 轉 180 度 → 接合頭接手 → 沾助焊劑 → 放到載板 → 抬起
VIS += [mv("eject", F(-22), F(6), 6, dy=0.12)]
VIS += [mv(l, F(-12), F(24), 10, dy=L1) for l in ("flipper", "flipper2")] + [mv("die", F(-12), FAR, 10, dy=L1)]
vis("flipper", [(T0, F(22))]); vis("flipper2", [(F(22), FAR)], dur=1)
VIS += [mv("head", T0, FAR, 1, dy=L1), mv("head", T0, F(16), 8, dy=1.4)]
for l in ("die", "head"):
    VIS += [mv(l, F(26), FAR, 8, dy=U), mv(l, F(34), FAR, 12, dx=DX1), mv(l, F(46), F(52), 6, dy=-D1), mv(l, F(58), FAR, 12, dx=DX2), mv(l, F(72), FAR, 8, dy=-D2)]
VIS += [mv("head", F(84), FAR, 8, dy=1.0)]
# s1 爆炸（第 39 條：全在念的期間做完）：①頂蓋與接合頭抬開（標「接合頭」）→停 1.2 秒 →②翻面單元往左抽出、助焊劑盤往前滑出（標「翻面單元」）→停 1.4 秒 →③全部組回（念完前 0.5 秒落定）
Q = lambda n: f"s1:q{n:+d}"
VIS += [mv("cover", Q(-30), Q(76), 14, dy=1.0), mv("head", Q(-30), Q(76), 14, dx=3.0)]
VIS += [mv(l, Q(20), Q(76), 12, dx=-2.4) for l in ("flipper", "flipBase")] + [mv("flux", Q(20), Q(76), 12, dz=2.4)]

# ═════ 站 B：覆晶晶片先浮在焊墊上方（看得到凸塊陣列），念完往下貼合 ═════
VIS += [mv("fcDie", T0, "s3:short", 20, dy=1.0)]

# ═════ 站 C：散熱蓋從上方落下貼到導熱膏 ═════
VIS += [{"layer": "cLid", "at": T0, "until": "s4:lid-4", "dur": 18, "dy": 2.6, "fallIn": True, "bounce": 0.03}]

# ═════ 站 D：凸塊製程逐步 ═════
vis("dUbm", [("s5:bump+2", "s5:sn+28")]); vis("dUbmK", [("s5:bump+2", FAR)])
VIS += [{"layer": "dResist", "at": T0, "until": "s5:bump+14", "dur": 14, "dy": 1.6, "fallIn": True, "bounce": 0.02}]
vis("dResist", [("s5:bump+14", "s5:sn+30")]); VIS += [mv("dResist", "s5:sn+16", FAR, 12, dy=2.6)]
for k in range(4): vis(f"dCu{k}", [(f"s5:cu{(-4 + k * 8):+d}", FAR)])
for k in range(2): vis(f"dSn{k}", [(f"s5:sn{(k * 6 - 6):+d}", "s5:sn+30")])
vis("dDome", [("s5:sn+30", FAR)])

# ═════ 站 P：回焊自我對位（s6）→ 熱脹冷縮（s7）→ 底部填充（s8）═════
OFF = [("pDie", 0.55, 0.07), ("pSnSolid", 0.55, 0.07), ("pHot", 0.55, 0.07), ("pSnL", 0.55, 0.07), ("pSnC", 0.55, 0.07), ("pSnR", 0.55, 0.07)]
VIS += [mv(l, T0, "s6:melt+6", 30, dx=dx, dy=dy) for l, dx, dy in OFF]
vis("pSnSolid", [(T0, "s6:melt+4")]); vis("pHot", [("s6:place+10", "s6:melt+10")])
for s in ("L", "C", "R"): vis(f"pSn{s}", [("s6:melt+4", "s7:cte+16"), ("s7:crack+38", FAR)], dur=6)
vis("pHeater", [("s6:place+6", "s6:align+10"), ("s7:cte-4", "s7:crack+24"), ("s8:bake-2", FAR)])
# s7：載板兩半往外伸、焊墊依離中心的距離往外移（外圈 0.38、內圈 0.19）；伸到一半時換成斜成平行四邊形的焊點（越外圈越斜），冷卻回縮時換回
VIS += [mv("pSubL", "s7:cte+4", "s7:crack+26", 24, dx=-0.38), mv("pSubR", "s7:cte+4", "s7:crack+26", 24, dx=0.38)]
VIS += [mv(f"pPad{i}", "s7:cte+4", "s7:crack+26", 24, dx=d) for i, d in ((0, -0.38), (1, -0.19), (3, 0.19), (4, 0.38))]
vis("pStrain", [("s7:cte+16", "s7:crack+38")], dur=6)
vis("pCrack", [("s7:crack", "s8:start")])
vis("pNeedle", [("s8:start-6", "s8:bake+20")])
for k in range(I["UFN"]): vis(f"pUf{k}", [(f"s8:wick{(k * 7 - 10):+d}", "s8:bake+12")])
vis("pUfFillet", [("s8:wick+56", "s8:bake+12")]); vis("pUfCure", [("s8:bake+10", FAR)])
VIS += [mv("pNeedle", "s8:bake+14", FAR, 16, dy=2.0)]
vis("nRdl", [("s10:rdl", FAR)])

# ═════ 各幕 ═════
P = {}
P["s1"] = {"shot": [shot("start-30", 0.4, 2.0, 42, 28, 1, yaw=0.0), shot("start", 0.4, 2.0, 40, 29, 160)], "shift": VIS,
 "run": [run("fluxSpin", "start-30", "s2:press+30", 10), run("upcamFlash", "start-30", "s1:end+20", 6)],
 "labels": [lab("head", "接合頭", "Bond head", "blue", "q-26", "q+14"), lab("flipper", "翻面單元", "Flip unit", "amber", "q+24", "q+66")],
 "overlay": [sec("fc-hook", "start", nxt("s1"), "系列 3・第 4 集", "示意，非實際比例", {"q": "q", "prev": "prev", "fc": "fc"}, cut=True)]}
P["s2"] = {"zoom": [{"to": "tool", "at": "start-14", "dur": 1}],
 "shot": [shot(CC, -2.4, 2.6, 24, 32, 1), shot("flip+40", 0.8, 2.4, 28, 34, 40)],
 "run": [run("vac", "flip-16", "flip+24", 4), run("vacHead", "flip+16", "flip+82", 4), run("flip", "flip", "flip+1", 18), run("flipBackArm", "flip+28", "flip+29", 20)],
 "labels": [lab("flipper", "翻面單元", "Flip unit", "amber", "flip-6", "flip+39"), lab("rail", "載板", "Substrate", "blue", "flip+60", "flip+105")],
 "overlay": [card("s2", "fc-stamp", "像蓋印章：一次全部接好", "示意", {"fcw": "fcw", "flip": "flip", "down": "down", "stamp": "stamp", "press": "press"})]}
P["s3"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, I["BX"], 1.2, 30, 48, 1)],
 "run": [run("sigWire", "short-10", FAR, 6), run("sigBump", "short-10", FAR, 6)],
 "labels": [lab("wbWire", "打線：邊緣一圈", "Wire bond: edge only", "amber", "edge-4", "edge+41"), lab("fcBumpA", "覆晶：整面凸塊", "Flip chip: full array", "blue", "full", "full+45")],
 "overlay": [card("s3", "fc-vs", "邊緣一圈 vs 整面", "示意（不標腳數）", {"wb": "wb", "edge": "edge", "full": "full", "many": "short", "short": "short"})]}
P["s4"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, I["CX"], 0.6, 22, 46, 1)],
 "run": [run("dieHot", "start", FAR, 8), run("heatUp", "lid+16", FAR, 8)],
 "labels": [lab("timA", "導熱膏", "Thermal paste", "amber", "back", "back+45"), lab("lidA", "散熱蓋", "Heat lid", "blue", "lid+5", "lid+36", xy=[820, 400])],
 "overlay": [card("s4", "fc-heat", "背面朝外：熱往上走", "示意，不是量測", {"back": "back", "nowire": "nowire", "lid": "lid"})]}
P["s5"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, I["DX"], 2.6, 26, 18, 1)],
 "run": [run("plate", "cu-6", "sn+16", 6)],
 "labels": [lab("resistA", "光阻開孔", "Resist openings", "blue", "bump+14", "bump+59"), lab("cuA", "電鍍銅柱", "Plated copper pillar", "amber", "cu+2", "cu+47")],
 "overlay": [card("s5", "fc-bump", "凸塊怎麼長", "示意（不標尺寸）", {"bump": "bump", "wafer": "wafer", "cu": "cu", "sn": "sn"})]}
P["s6"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, I["PX0"], 1.5, 27, 18, 1)],
 "run": [run("heaterOn", "place+6", "align+10", 8), run("melt", "place+10", "melt+10", 6), run("meltM", "melt+4", "align+12", 8)],
 "labels": [lab("pDieA", "放歪的晶片", "Off-center chip", "amber", "place", "place+45"), lab("pSnA", "熔錫拉正", "Molten solder pulls", "blue", "melt+10", "melt+55")],
 "overlay": [card("s6", "fc-align", "像水珠把東西拉正", "示意（錫量多時）", {"place": "place", "melt": "melt", "tension": "tension", "drop": "drop", "align": "align"})]}
P["s7"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, I["PX0"], 1.5, 27, 18, 1)],
 "run": [run("heaterOn", "cte-4", "crack+24", 8), run("crackP", "crack", "s8:start", 4)],
 "labels": [lab("pCrackA", "焊點被扭", "Joint strained", "amber", "crack-12", "crack+33")],
 "overlay": [card("s7", "fc-cte", "熱脹冷縮差五倍", "文獻值；示意，變形誇大", {"but": "but", "cte": "cte", "x5": "x5", "crack": "crack"})]}
P["s8"] = {"zoom": [{"to": "micro", "at": CC, "dur": 1}],
 "shot": [shot(CC, I["PX0"], 1.5, 27, 18, 1)],
 "run": [run("ufDrip", "edge", "wick+50", 6), run("heaterOn", "bake-2", FAR, 8), run("ufCureGlow", "bake+10", "bake+60", 8)],
 "labels": [lab("pNeedleA", "點膠針頭", "Dispensing needle", "amber", "edge", "edge+45"), lab("pUfA", "底部填充", "Underfill", "blue", "gap-8", "gap+37", xy=[800, 420])],
 "overlay": [card("s8", "fc-uf", "像紙巾吸水", "示意", {"edge": "edge", "wick": "wick", "gap": "gap", "bake": "bake", "guard": "guard"})]}
P["s9"] = {"zoom": [{"to": "co", "at": CC, "dur": 1}],
 "shot": [shot(CC, I["HX0"], 1.6, 70, 22, 1)],
 "run": [run("aseOn", "ase-4", FAR, 6), run("amkOn", "amk-4", FAR, 6), run("besiOn", "besi-4", FAR, 6)],
 "labels": [lab("aseA", "日月光（台灣）", "ASE, Taiwan", "blue", "big", "big+45", flag="TW"),
            lab("besiA", "Besi（荷蘭）", "Besi, Netherlands", "amber", "besi-4", "besi+41")],
 "overlay": [card("s9", "fc-co", "誰在做", "TrendForce 2024；Besi 廠商說法", {"big": "big", "ase": "ase", "amk": "amk", "fcb": "fcb", "besi": "besi"}, h=360, y=1036)]}
P["s10"] = {"zoom": [{"to": "next", "at": "voice", "dur": 1}],
 "shot": [shot("voice", I["NX"], 0.8, 28, 52, 1)],
 "run": [run("rdlGlow", "rdl+6", FAR, 8)],
 "labels": [lab("rdlA", "重布線（示意）", "Redistribution lines", "amber", "rdl+4", "rdl+49")],
 "overlay": [sec("fc-next", "voice+1", nxt("s10"), "下一集", "系列 3 預告", {"sub": "sub", "next": "next", "rdl": "rdl", "fo": "fo"}, cut=True)] if True else [card("s10", "fc-next", "下一集", "系列 3 預告", {"sub": "sub", "next": "next", "rdl": "rdl", "fo": "fo"})]}
P["s11"] = {"zoom": [{"to": "next", "at": CC, "dur": 1}],
 "shot": [shot(CC, I["NX"], 0.8, 32, 58, 30)],
 "overlay": [sec("fc-ask", C, "s12:start", "留言", "覆晶", {"phone": "phone", "kw": "kw"}, cut=True)]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])
lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("tool", "覆晶接合機（示意）", "FLIP-CHIP BONDER", "30 cm", "5 cm"), lv("micro", "覆晶剖面（示意放大）", "FLIP-CHIP CROSS-SECTION", "1 mm", "100 µm"),
          lv("co", "誰在做（示意位置）", "WHO MAKES IT", "200 m", "50 m"), lv("next", "下一集（預告）", "NEXT EPISODE", "30 cm", "5 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-flipchip", "prevEpisode": "3-3：封裝材料", "title": "封裝-2：覆晶（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "晶片往下游走", "slogan": "一支講透一件事"}, "hudSkin": "light", "sourceFollowsCaption": True,
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b", "_說明": "依 docs/prompts/tech-旁白金手指.md；本子聊天室不配音、不送 TTS"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["覆晶", "晶片翻過來接"], "sub": "像蓋印章一次接好", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
subst = json.load(open(os.path.join(HERE, "..", "..", "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for rr in subst:
        if rr["from"] in t: bad.append((s["id"], rr["from"]))
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9]", t): bad.append((s["id"], "數字"))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
print("念稿字數", n, "問題", bad, "無聲估計片長", round(sum(s["durationSec"] for s in scenes), 1), "秒；hold", [s.get("holdSec") for s in scenes])
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
