"""tech-gas 腳本產生器：python3 videos/tech-gas/genscript.py → script.json＋無聲時間軸（含各幕幕尾 hold 的壓縮）＋storyboard.json
特用氣體（科技透明圈 系列 2「代工的供應商」第 15 集；上一集 2-14：前驅物；下一集 2-16：濕式化學品與研磨液）。
2D 卡：src/components/three/HudGas.tsx（gas-*）。構造與物理：physics-spec.md；模組清單：visual-spec.md。
Andy 第 18 條：念稿不用縮寫術語；第 21、22 條：念稿避開「上」、「量測」；第 27 條：念稿 ≤260 字、一幕一件事、每個關鍵畫面念完後留 ≥1.2 秒只有畫面；第 28 條：≥3 個生活比喻；第 29 條：爆炸分解逐步做完。"""
import json, re, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
MODEL = json.load(open(os.path.join(HERE, "model.json"))); INFO = MODEL["info"]; X = INFO["X"]; LY = INFO["LY"]
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, hold秒)
S = [
("s1", "hook", "前一集說，原料要先變成氣。那氣本身呢？一瓶氣，怎麼安全送進廠？",
 ["前一集說", "原料要先變成氣", "那氣本身呢？", "一瓶氣", "怎麼安全送進廠？"],
 ["Last time:", "raw materials turn into gas.", "What about the gas itself?", "One bottle of gas,", "how does it reach the fab safely?"],
 [("prev", "前一集"), ("q", "那氣本身呢"), ("bot", "一瓶氣")], ["氣", "安全"], ["示意動畫，不是量測"], 0.5),
("s2", "mechanism", "蝕刻、鍍膜、摻雜，每一步都要用氣體。",
 ["蝕刻、鍍膜", "摻雜", "每一步都要", "用氣體"], ["Etching, deposition,", "doping:", "every step needs", "gas."],
 [("etch", "蝕刻"), ("dep", "鍍膜"), ("dop", "摻雜"), ("all", "每一步")], ["蝕刻", "氣體"], ["林德、液化空氣技術說明；示意"], 0.5),
("s3", "mechanism", "氣要多乾淨？像一座游泳池，只能混進一小匙雜質。",
 ["氣要多乾淨？", "像一座游泳池", "只能混進", "一小匙雜質"], ["How clean must gas be?", "Like a swimming pool", "with only one spoonful", "of impurity."],
 [("q", "氣要多乾淨"), ("pool", "一座游泳池"), ("spoon", "一小匙")], ["乾淨", "雜質"], ["Entegris、Mott 技術說明；比喻為換算"], 0.6),
("s4", "mechanism", "氣瓶住進氣瓶櫃，門一開，瓶和閥都在。它像一個會自己關閥的瓦斯桶櫃，還有控制器看著。",
 ["氣瓶住進氣瓶櫃", "門一開", "瓶和閥都在", "它像一個會", "自己關閥的", "瓦斯桶櫃", "還有控制器看著"],
 ["The bottle sits in a gas cabinet.", "Open the door:", "bottle and valve inside.", "It is like a gas-tank cabinet", "that shuts its own valve,", "with a controller", "watching over it."],
 [("cab", "氣瓶櫃"), ("open", "門一開"), ("bv", "瓶和閥"), ("like", "自己關閥"), ("gas", "瓦斯桶櫃"), ("ctl", "控制器")], ["氣瓶櫃", "關閥"], ["專利 US4989160、液化空氣型錄；示意"], 1.4),
("s5", "mechanism", "瓶裡壓力很大，調節器分兩段降壓，出口壓力不動。",
 ["瓶裡壓力很大", "調節器", "分兩段降壓", "出口壓力不動"], ["The bottle is under high pressure;", "a regulator", "steps it down in two stages;", "outlet pressure holds steady."],
 [("big", "壓力很大"), ("reg", "調節器"), ("two", "兩段"), ("out", "出口壓力不動")], ["降壓", "調節器"], ["壓力調節器一般原理；示意"], 1.4),
("s6", "mechanism", "出櫃先過純化器，像濾水器，把雜質濾掉。",
 ["出櫃先過", "純化器", "像濾水器", "把雜質濾掉"], ["Out of the cabinet,", "first a purifier,", "like a water filter,", "that strips out the impurities."],
 [("pur", "純化器"), ("like", "濾水器"), ("imp", "雜質"), ("clean", "濾掉")], ["純化器", "濾"], ["Mott、Entegris 技術說明；示意"], 1.3),
("s7", "mechanism", "再到閥箱，一個氣源在這裡，分給好幾台機台。",
 ["再到閥箱", "一個氣源在這裡", "分給好幾台機台"], ["Next, the valve box:", "one gas source here", "is shared among several tools."],
 [("vmb", "閥箱"), ("src", "一個氣源"), ("split", "分給好幾台")], ["閥箱", "分給"], ["液化空氣閥箱型錄；示意"], 2.6),
("s8", "mechanism", "管子外面，再套一根抓漏的管，漏了就自動關閥。",
 ["管子外面", "再套一根", "抓漏的管", "漏了就", "自動關閥"], ["Around the pipe,", "another pipe", "that catches leaks;", "if it leaks,", "the valve closes by itself."],
 [("out", "管子外面"), ("pipe", "抓漏的管"), ("leak", "漏了"), ("valve", "自動關閥")], ["抓漏", "關閥"], ["液化空氣閥箱與雙套管說明；示意"], 1.5),
("s9", "mechanism", "氣進機台，從噴頭均勻灑下，再被泵抽走。",
 ["氣進機台", "從噴頭", "均勻灑下", "再被泵抽走"], ["Gas enters the tool,", "from a showerhead", "falls evenly,", "then a pump draws it away."],
 [("in", "氣進機台"), ("shw", "噴頭"), ("pump", "泵抽走")], ["噴頭", "泵"], ["半導體製程腔通則；示意"], 1.3),
("s10", "mechanism", "用過的氣，先燒掉有害的，再用水洗，像焚化爐，燒完的煙再用水沖一遍。",
 ["用過的氣", "先燒掉有害的", "再用水洗", "像焚化爐", "燒完的煙", "再用水沖一遍"], ["Used gas is", "first burned to remove the harmful part,", "then washed with water,", "like an incinerator,", "whose smoke", "is rinsed with water again."],
 [("used", "用過的氣"), ("burn", "燒掉"), ("wash", "水洗"), ("like", "焚化爐")], ["燒掉", "水洗"], ["美國環保署含氟氣體說明；示意"], 1.4),
("s11", "payoff", "全球有林德、液化空氣，台灣有台特化。",
 ["全球有林德", "液化空氣", "台灣有台特化"], ["Globally, Linde", "and Air Liquide;", "in Taiwan, Taiwan Specialty Chemicals."],
 [("lin", "林德"), ("air", "液化空氣"), ("tw", "台特化")], ["林德", "台特化"], ["林德、液化空氣官網；台特化為媒體報導"], 1.0),
("s12", "cta", "下一集，氣體之外，換看液體。留言氣體，拿資料。",
 ["下一集", "氣體之外", "換看液體", "留言氣體", "拿資料"], ["Next episode:", "beyond gases,", "we look at liquids.", "Comment \"gas\"", "for the notes."],
 [("next", "下一集"), ("liq", "換看液體"), ("kw", "留言")], ["液體", "氣體"], ["示意動畫，不是量測"], 0.5),
]
def TTS(t):
    t = t.replace("上集", "上一集").replace("上一一集", "上一集").replace("矽", "細").replace("光罩", "光照")
    for a, b in [("上一集", "前一集"), ("量測", "測量")]: t = t.replace(a, b)
    return t
FPS = 30
scenes = []; HOLD = {}
for i, (sid, beat, nar, zh, en, cues, kws, src, hold) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for z in zh: assert len(re.sub(r"[ ，。？、]", "", z)) <= 11, (sid, z)
    for c in cues: assert c[1] in nar, (sid, c)
    n = len(re.sub(r"[，。？！、；：\s]", "", nar)); HOLD[sid] = round(hold * FPS)
    dur = round(n / 4.5 + hold + 0.47, 1)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar), "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)}, "keywords": kws,
          "cues": [{"id": a, "text": b} for a, b in cues], "component": "ThreeScene", "sources": src, "props": {}, "durationSec": max(4.5, dur), "pauseAfter": hold}
    scenes.append(sc)
scenes[0]["props"]["hook"] = {"kicker": "接上集：前驅物先汽化", "title": "氣怎麼送進廠？", "size": 120, "top": 236}
scenes.append({"id": "s13", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "濕式化學品與研磨液", "trail": ["清洗與研磨"], "comment": "氣體", "logoAnim": "transparent"}}})
FAR = "s13:start+400"
def run(i, at, until=None, ramp=6, **kw):
    d = {"id": i, "at": at, "ramp": ramp}
    if until: d["until"] = until
    d.update(kw); return d
def lab(part, text, en, color, at, until, **kw):
    d = {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until}; d.update(kw); return d
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
def secu(c):  # 卡片的 t：每個 cue 一個名字，值就是 cue 名
    return {k: k for k in c}
T0 = "s1:start-40"; E = lambda sc: f"{sc}:start-4"
P = {}
# ── s1 鉤子：全線遠景，開場就在動（調節器出口氣流、指針、警示燈）
P["s1"] = {"shot": [shot("start-30", 18, 9, 96, 20, 1, yaw=-0.18), shot("start", 22, 9, 90, 22, 140)],
 "run": [run("regOut", "start-30", "s2:start-6", 1), run("lineGas", "start-30", "s2:start-6", 1), run("fanBeacon", "start-30", "s2:start-6", 1), run("ctlLed", "start-30", "s2:start-6", 1)],
 "overlay": [sec("gas-hook", "q", "s2:start-18", "系列 2・第 15 集", "示意，非實際比例", secu(["prev", "q", "bot"]))]}
# ── s2 氣體做什麼：製程腔＋噴頭灑氣
P["s2"] = {"zoom": [{"to": "sys", "at": "start-4", "dur": 1}], "shot": [shot("start-2", 79, 3, 58, 20, 1, yaw=-0.1)],
 "run": [run(f"shw{i}", "start", "s3:start-6", 6) for i in range(6)] + [run(f"wfOut{i}", "start", "s3:start-6", 6) for i in range(4)] + [run("plasmaPulse", "etch", "s3:start-6", 6)],
 "overlay": [sec("gas-use", "start+14", "s3:start-18", "氣體在晶片製程做什麼", "示意", secu(["etch", "dep", "dop", "all"]))]}
# ── s3 純度：純化器近景，少量橘色雜質
P["s3"] = {"shot": [shot("start-2", X["pur"], 3, 58, 16, 1)],
 "run": [run("impIn", "start", "s4:start-4", 6), run("cleanOut", "start", "s4:start-4", 6), run("impLeak", "pool", "s4:start-4", 6)],
 "overlay": [sec("gas-ppb", "start+14", "s4:start-18", "多乾淨才夠", "示意（比喻為換算）", secu(["q", "pool", "spoon"]))]}
# ── s4 氣瓶櫃爆炸分解（六步：開門→瓶升＋瓶帽落下→調節器出→吹淨抽出→控制器開蓋→組回＋緊急停止鈕閃）
BACK4 = "ctl+30"
P["s4"] = {"shot": [shot("start-2", 0.5, 10, 62, 24, 1, yaw=0.0), shot("open-10", 0.6, 10.5, 58, 26, 34)],
 "shift": [mv("cabDoor", "open-4", "s5:start+40", 24, dx=-10, dz=3.4),
           mv("botA", "bv+2", BACK4, 24, dy=5.2), mv("bcap", "bv-2", BACK4, 18, dy=-10.9, dx=2.6, fallOut=True, bounce=0.06), mv("regA", "like-18", BACK4, 24, dz=4.8, dy=0.4),
           mv("purge", "gas-6", BACK4, 24, dz=4.6), mv("ctlDoor", "ctl-2", BACK4, 22, dx=3.4, dz=1.6)],
 "run": [run("purgeN2", "gas+10", BACK4, 6), run("estopFlash", "ctl+34", "ctl+54", 4)],
 "labels": [lab("cab", "氣瓶櫃", "Gas cabinet", "amber", "cab-2", "cab+43"),
            lab("bottle", "鋼瓶＋瓶閥", "Bottle + valve", "blue", "bv+4", "bv+49"),
            lab("reg", "調節器", "Regulator", "amber", "like-16", "like+29"),
            lab("purge", "吹淨支路", "Purge line", "blue", "gas-4", "gas+41"),
            lab("pcb", "控制器電路板", "Controller board", "amber", "ctl+2", "ctl+47")]}
# ── s5 調節器：歸位後近拍，高壓表緩降、低壓表不動，上游氣粒密、下游疏
P["s5"] = {"shift": [hid(l, "start-6", "s6:start-1", 4, 0.0) for l in ("botA", "botB", "purge", "ctl", "ctlDoor", "ctlPcb", "cabDoor", "bcap")] + [hid("cabShell", "start-6", "s6:start-1", 4, 0.18)],
 "shot": [shot("start", -1.0, 12.5, 40, 10, 30, yaw=0.0)],
 "run": [run("regIn", "start", "s6:start-4", 6), run("regOut", "start", "s6:start-4", 6), run("needleHigh", "two-6", "s6:start-4", 10), run("lowJit", "two-6", "s6:start-4", 10)],
 "labels": [lab("reg", "兩段調節器", "Two-stage regulator", "amber", "reg-30", "reg+15"),
            lab("gH", "高壓表（降）", "High side falls", "blue", "two-11", "two+34"),
            lab("gL", "低壓表（穩）", "Low side holds", "amber", "out+9", "out+54")],
 "overlay": [sec("gas-reg", "start+20", "s6:start-18", "壓力怎麼降下來", "示意（不標壓力數值）", secu(["big", "reg", "two", "out"]))]}
# ── s6 純化器：罐身沿軸從管路上抽起，露出吸附顆粒；雜質被留住，乾淨的氣離開
P["s6"] = {"shot": [shot("start-2", X["pur"] + 1.5, 6, 66, 16, 1), shot("pur+2", X["pur"] + 1.5, 9.5, 70, 16, 26)],
 "shift": [mv("purCan", "pur+6", "clean+34", 26, dy=9.5)],
 "run": [run("impIn", "pur+30", "s7:start-4", 6), run("cleanOut", "pur+30", "s7:start-4", 6), run("impLeak", "imp", "s7:start-4", 6)],
 "labels": [lab("pur", "純化器", "Purifier", "amber", "pur-2", "pur+43"),
            lab("bed", "吸附顆粒", "Adsorbent beads", "blue", "like+19", "like+64")],
 "overlay": [sec("gas-pur", "start+14", "s7:start-18", "雜質怎麼被留下", "示意", secu(["pur", "like", "imp", "clean"]))]}
# ── s7 閥箱：窗門移開、一條支路抽出、五個元件每 0.67 秒依序分開、組回
P["s7"] = {"shot": [shot("start-2", X["vmb"] + 2, 5, 64, 18, 1)],
 "shift": [mv("vmbDoor", "vmb+14", "split+92", 22, dx=16, dz=2.4), mv("stk", "src+22", "split+92", 22, dz=6),
           *[mv(f"vc{i+1}", "src+22", "split+92", 22, dz=6) for i in range(5)],
           *[mv(f"vc{i+1}", (f"split{i*14-8:+d}"), "split+92", 16, dx=(i - 2) * 1.2) for i in range(5)]],
 "run": [run("lineGas", "start", "s8:start-4", 6)],
 "labels": [lab("vmb", "閥箱（閥門歧管箱 VMB）", "Valve manifold box", "amber", "vmb-2", "vmb+43"),
            lab("stk", "一條支路", "One branch", "blue", "split-14", "split+31")],
 "overlay": [sec("gas-chain", "start+14", "s8:start-18", "氣體走過的路", "示意", secu(["vmb", "src", "split"]))]}
# ── s8 雙套管：外套縱向剖開約 45°（楔形板條掀起）、兩端封口件外移 → 組回閉合 → 破洞噴出 → 偵測 → 關閥 → 氮氣吹淨
P["s8"] = {"shot": [shot("start-2", X["dbl"] + 1, 5.5, 50, 16, 1)],
 "shift": [mv("dblCut", "out-2", "pipe+20", 26, dy=1.6, dz=0.8), mv("dblSealL", "out-2", "pipe+20", 22, dx=-1.6), mv("dblSealR", "out-2", "pipe+20", 22, dx=1.6),
           hid("dblSkin", "leak-16", "s9:start", 12, 0.1), hid("dblCut", "leak-16", "s9:start", 12, 0.1), hid("dblHole", T0, "leak-8", 6), mv("dblValveAct", "valve+2", "s9:start", 6, dy=-0.4)],
 "run": [run("dblFlow", "start", "valve+4", 6), run("leakJet", "leak-4", "valve+4", 4), run("annL", "leak", "valve+30", 6), run("annR", "leak", "valve+30", 6), run("detBlink", "leak+22", "s9:start-4", 6), run("valveAct", "valve", "s9:start-4", 6), run("dblPurge", "valve+22", "s9:start-4", 6)],
 "labels": [lab("dblOuter", "外套管（剖開）", "Outer sleeve (cut open)", "amber", "out", "out+45"),
            lab("dblInner", "內管", "Inner pipe", "blue", "out+48", "pipe+40"),
            lab("det", "偵測點", "Detector", "amber", "leak+16", "leak+61")],
 "overlay": [sec("gas-dbl", "start+14", "s9:start-18", "漏了怎麼辦", "示意（不標靈敏度）", secu(["out", "pipe", "leak", "valve"]))]}
# ── s9 製程腔：先推近流量控制器，再看噴頭與升降銷，最後看抽氣口與泵
P["s9"] = {"shot": [shot("start-2", 75, 7, 54, 16, 1), shot("shw-8", 77, 5, 52, 18, 24), shot("pump-10", 83, 4, 54, 18, 26)],
 "run": [run(f"shw{i}", "in", "s10:start-4", 6) for i in range(6)] + [run(f"wfOut{i}", "shw", "s10:start-4", 6) for i in range(4)] + [run("plasmaPulse", "shw", "s10:start-4", 6), run("foreline", "pump", "s10:start-4", 6)],
 "labels": [lab("mfc", "質量流量控制器", "Mass flow controller", "blue", "in-2", "in+43"), lab("shw", "噴頭", "Showerhead", "amber", "shw+12", "shw+57"), lab("pump", "乾式泵", "Dry pump", "blue", "pump", "pump+45")],
 "overlay": [sec("gas-chm", "start+14", "s10:start-18", "氣進腔之後", "示意（腔內壓力很低）", secu(["in", "shw", "pump"]))]}
# ── s10 尾氣處理器：外殼打開半邊→水槽、燃燒室、水洗段、排氣口由下而上依序分開→組回
P["s10"] = {"shot": [shot("start-2", X["abt"] + 0.4, 9, 76, 16, 1)],
 "shift": [mv("abDoor", "used-2", "wash+66", 20, dx=6.4), mv("abTank", "used+4", "wash+66", 24, dy=1.2), mv("abBurn", "used+16", "wash+66", 24, dy=3.6), mv("abWash", "used+28", "wash+66", 24, dy=6.0), mv("abStack", "used+40", "wash+66", 24, dy=8.4)],
 "run": [run("abBurnIn", "start", "s11:start-4", 6), run("abFlame", "burn-6", "s11:start-4", 8), run("abPilot", "start", "s11:start-4", 6), run("abAsh", "burn+8", "s11:start-4", 6), run("abClean", "wash+4", "s11:start-4", 6)] + [run(f"abDrop{i}", "wash-6", "s11:start-4", 6) for i in range(6)],
 "labels": [lab("abBurn", "燃燒室", "Burn chamber", "amber", "burn-2", "burn+43"), lab("abWash", "水洗段", "Wet scrubber", "blue", "wash-4", "wash+41")],
 "overlay": [sec("gas-burn", "start+14", "s11:start-18", "兩種尾氣處理", "示意（不標效率）", secu(["used", "burn", "wash", "like"]))]}
# ── s11 公司：全線遠景（整條送氣路徑當背景）＋公司卡
P["s11"] = {"shot": [shot("start-2", 48, 9, 112, 20, 1, yaw=0.15)],
 "run": [run("lineGas", "start", "s12:start-4", 6), run("regOut", "start", "s12:start-4", 6)],
 "overlay": [sec("gas-co", "start-4", "s12:start+14", "做氣體的公司", "公司官網與年報", secu(["lin", "air", "tw"]), h=360, y=1040)]}
P["s12"] = {"shot": [shot("start+14", 22, 9, 96, 22, 1, yaw=0.0)],
 "run": [run("lineGas", "start", "s13:start-4", 6), run("regOut", "start", "s13:start-4", 6)],
 "overlay": [sec("gas-next", "start+32", "s13:start-18", "接下來", "下一集：濕式化學品與研磨液", secu(["next", "liq", "kw"]))]}

# ── 各站只在講到它的幕出現（其餘淡出，主素材框才不會被整條線撐大）；換幕那一幀鏡頭硬切，新舊 ≤4 幀交叉淡化
ST = {"CAB": (["cabShell", "cabDoor", "botA", "botB", "bcap", "regA", "regB", "purge", "ctl", "ctlDoor", "ctlPcb"], ["s1", "s4", "s5", "s11", "s12"]),
      "PUR": (["purBase", "purCan", "purFilt"], ["s1", "s3", "s6", "s11", "s12"]),
      "VMB": (["vmbShell", "vmbDoor", "vmbStx", "stk", "vc1", "vc2", "vc3", "vc4", "vc5"], ["s1", "s7", "s11", "s12"]),
      "DBL": (["dblPipe", "dblJacket", "dblSkin", "dblCut", "dblSealL", "dblSealR", "dblDet", "dblHole", "dblValve", "dblValveAct"], ["s8", "s11", "s12"]),
      "CHM": (["chm", "chShw", "chMfc", "chWf", "pmp"], ["s2", "s9", "s11", "s12"]),
      "ABT": (["abTank", "abBase", "abDoor", "abBurn", "abWash", "abStack", "abCab"], ["s10", "s11", "s12"]),
      "LN": (["line"], ["s1", "s11", "s12"])}
ORDER = [s["id"] for s in scenes]
VIS = []
for lays, shown in ST.values():
    wins = []
    for sid in shown:
        i = ORDER.index(sid)
        if wins and wins[-1][1] == i - 1: wins[-1][1] = i
        else: wins.append([i, i])
    for lay in lays:
        prev = T0
        for a, b in wins:
            st = f"{ORDER[a]}:start-4"
            if a > 0: VIS.append(hid(lay, prev, st, 4))
            prev = f"{ORDER[b + 1]}:start-4" if b + 1 < len(ORDER) else FAR
        if prev != FAR: VIS.append(hid(lay, prev, FAR, 4))
VIS += [hid("purBed", T0, "s6:pur+14", 6), hid("purBed", "s6:clean+64", FAR, 6)]
P["s1"]["shift"] = VIS
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])
lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/27", "noteAlways": True}
levels = [lv("sys", "特用氣體送氣系統（示意）", "SPECIALTY GAS DELIVERY", "100 m", "10 m")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-gas", "prevEpisode": "2-14：前驅物", "title": "特用氣體（科技透明圈）", "asOf": "2026/11/27", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "profile": "tech-b", "_說明": "旁白金手指：兩奈米鎖定表（docs/prompts/tech-旁白金手指.md）；本支尚未配音"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，非特定廠牌實機"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["特用氣體", "怎麼送？"], "sub": "特用氣體", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
# ── 無聲時間軸＋幕尾 hold 壓縮（讓靜音 hold 在無聲版就看得到）
subprocess.run(["node", os.path.join(ROOT, "scripts/three/silent-timeline.mjs"), "tech-gas"], check=True, cwd=ROOT, stdout=subprocess.DEVNULL)
TLP = os.path.join(HERE, "timeline.json"); tl = json.load(open(TLP))
for sc in tl["scenes"]:
    H = HOLD.get(sc["id"], 0)
    if not H: continue
    vs, ve = sc["voiceStartFrame"], sc["voiceEndFrame"]; ve2 = ve - H; k = (ve2 - vs) / (ve - vs)
    mp = lambda f: None if f is None else round(vs + (f - vs) * k) if f >= vs else f
    for q in sc["cues"]: q["frame"] = mp(q["frame"])
    for kw in sc["keywords"]: kw["start"] = mp(kw["start"])
    for ln in sc["lines"]: ln["start"] = mp(ln["start"]); ln["chars"] = [mp(c) for c in ln["chars"]]
    sc["voiceEndFrame"] = ve2; sc["holdFrames"] = H
json.dump(tl, open(TLP, "w"), ensure_ascii=False, indent=1)
subprocess.run(["node", "-e", f"import('./scripts/subs.mjs').then(m=>{{const fs=require('fs');m.writeStoryboard('tech-gas',JSON.parse(fs.readFileSync('videos/tech-gas/script.json')),JSON.parse(fs.readFileSync('videos/tech-gas/timeline.json')))}})"], cwd=ROOT, check=False)
# ── 事件落點檢查：每個 cue 錨定的事件不得超出該幕結尾（除 FAR／下一幕開頭），並印出每個標籤的亮著時間
cueF = {s["id"]: {q["id"]: q["frame"] for q in s["cues"]} | {"start": s["startFrame"], "end": s["startFrame"] + s["durationFrames"]} for s in tl["scenes"]}
def fr(spec, cur):
    m = re.match(r"^(?:(s\d+):)?([a-z0-9]+)([+-]\d+)?$", spec); sid = m.group(1) or cur; return cueF[sid][m.group(2)] + int(m.group(3) or 0)
bad = []; lines = []
for sc in scenes:
    if sc["id"] not in cueF: continue
    endF = cueF[sc["id"]]["end"]; labs = sorted([(fr(l["at"], sc["id"]), fr(l["until"], sc["id"]), l["text"]) for l in sc["props"].get("labels", [])])
    for a, b, t in labs:
        if b - a < 45: bad.append((sc["id"], "標籤<1.5秒", t, b - a))
    for (a1, b1, t1), (a2, b2, t2) in zip(labs, labs[1:]):
        if a2 < b1: bad.append((sc["id"], "標籤重疊", t1, t2, b1 - a2))
    for key in ("shift", "run"):
        for e in sc["props"].get(key, []):
            for w in ("at", "until"):
                v = e.get(w)
                if v and not v.startswith(("s13", "s1:start-40")) and ":" not in v:
                    f = fr(v, sc["id"])
                    if f > endF - 4: bad.append((sc["id"], key, e.get("id") or e.get("layer"), w, v, f - endF))
    if sc["props"].get("shift"):
        last = max([fr(e["at"], sc["id"]) + e.get("dur", 22) for e in sc["props"]["shift"] if ":" not in e["at"] and not e["at"].startswith("s1:")] + [0])
    lines.append((sc["id"], endF - cueF[sc["id"]]["start"]))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
tot = tl["totalSec"]
subst = json.load(open(os.path.join(ROOT, "scripts", "three", "tts-subst.json")))["subst"]
for s in scenes:
    t = s.get("tts") or ""
    for r in subst:
        if r["from"] in t and not (r["from"] == "上集" and "上一集" in t): bad.append((s["id"], "替身字", r["from"]))
    if "上" in t: bad.append((s["id"], "念稿有上"))
    if re.search(r"[0-9A-Za-z]", t): bad.append((s["id"], "數字或英文"))
print("念稿字數", n, "；無聲片長", tot, "秒；各幕秒數", [round(d / 30, 1) for _, d in lines]); print("檢查問題", bad)
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
