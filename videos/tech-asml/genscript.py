"""tech-asml 腳本產生器：python3 videos/tech-asml/genscript.py → script.json（先跑 gen-model.mjs 產 model.json）
設備五大-1：艾司摩爾 ASML（曝光）（科技透明圈 系列「代工的供應商」第 7 集；上一集光阻-2：塗佈顯影機（結尾：準不準還是看曝光機）；下一集設備五大-2：應用材料）。
旁白、cue、字幕、hook、片尾卡、hud、voice 與各幕 3D 動作（shot／shift／run／labels／overlay）都在這支；cue 來自 timeline.json，配音後重跑本檔即可。
2D 卡：src/components/three/HudAsml.tsx（asml-*）；另用 Hud.tsx 內建的 section kind lpp、scan。"""
import json, re, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
subprocess.run(["node", os.path.join(HERE, "gen-model.mjs")], check=True)
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook",
 "上集說看曝光機，誰做得出來？最先進的，全世界只有一家。",
 ["上集說看曝光機", "誰做得出來？", "最先進的", "全世界只有一家"],
 ["Last time: it comes down to the scanner.", "Who can build one?", "The most advanced kind:", "only one company on Earth."],
 [("prev", "看曝光機"), ("who", "誰做得出來"), ("top", "最先進"), ("one", "只有一家")],
 ["曝光機", "只有一家"], ["Wikipedia；Tom's Hardware"]),
("s2", "mechanism",
 "它像一台投影機，把光罩上的電路圖，縮小四倍印到晶圓上。",
 ["它像一台投影機", "把光罩上的電路圖", "縮小四倍", "印到晶圓上"],
 ["It works like a projector,", "taking the circuit on the mask,", "shrinking it four times,", "and printing it on the wafer."],
 [("proj", "投影機"), ("mask", "光罩上的電路圖"), ("x4", "縮小四倍"), ("wafer", "印到晶圓上")],
 ["投影機", "縮小四倍"], ["ASML 官網；Wikipedia"]),
("s3", "mechanism",
 "晶片的每一層圖案，都要先被它照過一次，這一步叫曝光。",
 ["晶片的每一層圖案", "都要先被它照過一次", "這一步叫曝光"],
 ["Every layer of a chip's pattern", "has to be printed by it first.", "That step is called exposure."],
 [("layer", "每一層"), ("lit", "照過一次"), ("expo", "叫曝光")],
 ["每一層", "曝光"], ["UW EE 527 講義；USPTO 7728953"]),
("s4", "mechanism",
 "最難的是光。雷射每秒打五萬顆錫滴，打成電漿發出極紫外光。",
 ["最難的是光", "雷射每秒打五萬顆錫滴", "打成電漿", "發出極紫外光"],
 ["The hard part is the light.", "A laser hits 50,000 tin droplets a second,", "turning them into plasma", "that gives off extreme ultraviolet light."],
 [("hard", "最難的是光"), ("laser", "雷射"), ("tin", "五萬顆錫滴"), ("plasma", "打成電漿"), ("euv", "極紫外光")],
 ["雷射", "錫滴", "電漿"], ["ASML 官網；Frontiers 論文"]),
("s5", "mechanism",
 "這種光會被空氣吸掉，所以整台抽真空，用碗形鏡把光收成一束。",
 ["這種光會被空氣吸掉", "所以整台抽真空", "用碗形鏡", "把光收成一束"],
 ["Air absorbs this light,", "so the whole machine is a vacuum,", "and a bowl-shaped mirror", "gathers it into one beam."],
 [("air", "空氣吸掉"), ("vac", "抽真空"), ("bowl", "碗形鏡"), ("beam", "收成一束")],
 ["真空", "碗形鏡"], ["Wikipedia；Frontiers 論文"]),
("s6", "mechanism",
 "光罩台和晶圓台反方向掃過去，到了盡頭先減速，再折回來。",
 ["光罩台和晶圓台", "反方向掃過去", "到了盡頭先減速", "再折回來"],
 ["The mask stage and wafer stage", "sweep in opposite directions,", "slow down at the end,", "and swing back."],
 [("stage", "光罩台和晶圓台"), ("opp", "反方向"), ("slow", "先減速"), ("back", "折回來")],
 ["反方向", "減速"], ["ASML 官網；Wikipedia"]),
("s7", "mechanism",
 "掃完一格，晶圓台移到下一格，停穩再掃，一片要照好幾十格。",
 ["掃完一格", "晶圓台移到下一格", "停穩再掃", "一片要照好幾十格"],
 ["One field done,", "the stage moves to the next,", "settles, then scans again.", "A wafer takes dozens of fields."],
 [("done", "掃完一格"), ("move", "移到下一格"), ("settle", "停穩"), ("many", "好幾十格")],
 ["下一格", "停穩"], ["Wikipedia；ASML 官網"]),
("s8", "payoff",
 "做曝光機的主要三家，荷蘭艾司摩爾，日本尼康和佳能。",
 ["做曝光機的主要三家", "荷蘭艾司摩爾", "日本尼康和佳能"],
 ["Three main scanner makers:", "ASML of the Netherlands,", "and Japan's Nikon and Canon."],
 [("three", "主要三家"), ("asml", "荷蘭艾司摩爾"), ("jp", "日本尼康"), ("canon", "佳能")],
 ["艾司摩爾", "尼康", "佳能"], ["36Kr；MarketResearch；Bits&Chips"]),
("s9", "twist",
 "但極紫外光機只有艾司摩爾做得出來，一台約兩億美元。",
 ["但極紫外光機", "只有艾司摩爾做得出來", "一台約兩億美元"],
 ["But only ASML", "can build EUV machines,", "at about 200 million US dollars each."],
 [("euv", "極紫外光機"), ("only", "只有艾司摩爾"), ("price", "兩億美元")],
 ["只有艾司摩爾", "兩億美元"], ["工商時報、數位時代（媒體報導）"]),
("s10", "payoff",
 "去年它出了四十八台極紫外光機，營收兩成多來自台灣。",
 ["去年它出了", "四十八台極紫外光機", "營收兩成多來自台灣"],
 ["Last year it shipped", "48 EUV machines,", "with over a fifth of sales from Taiwan."],
 [("year", "去年"), ("n48", "四十八台"), ("tw", "來自台灣")],
 ["四十八台", "台灣"], ["ASML 2025 年報；Nasdaq"]),
("s11", "payoff",
 "在台灣，總部在新竹，林口在蓋新據點，帆宣、家登、公準是供應商。",
 ["在台灣，總部在新竹", "林口在蓋新據點", "帆宣、家登、公準", "是供應商"],
 ["In Taiwan, it's headquartered in Hsinchu,", "with a new site going up in Linkou;", "Marketech, Gudeng and Kung Chun", "are among its suppliers."],
 [("hq", "新竹"), ("lk", "林口"), ("mic", "帆宣"), ("gd", "家登"), ("kc", "公準")],
 ["新竹", "林口", "供應商"], ["ASML 官網；中央社；科技新報"]),
("s12", "cta",
 "照之前，晶圓要先鋪好薄膜，下一集看應用材料。留言ASML，拿完整資料。",
 ["照之前，晶圓要先鋪好薄膜", "下一集看應用材料", "留言 ASML，拿完整資料"],
 ["Before exposure, films must be laid down.", "Next: Applied Materials.", "Comment \"ASML\" for the full notes."],
 [("film", "鋪好薄膜"), ("next", "應用材料"), ("kw", "留言ASML")],
 ["薄膜", "應用材料"], ["示意動畫，不是量測"]),
]
TTS = lambda t: t.replace("矽", "細").replace("光罩", "光照").replace("上集", "上一集").replace("留言ASML", "留言 A S M L")
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for c in cues: assert c[1] in nar, (sid, c)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}}
    if i < len(S) - 1: sc["pauseAfter"] = 0.6
    scenes.append(sc)
scenes[0]["props"]["hook"] = {"kicker": "接上集：看曝光機", "title": "誰做得出來？", "size": 120, "top": 236}
scenes.append({"id": "s13", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "應用材料", "trail": ["沉積", "離子佈植"], "comment": "ASML", "logoAnim": "transparent"}}})

# ═════════ 各幕 3D 動作與 2D 卡 ═════════
FAR = "s13:start+400"
def run(i, at, until=None, ramp=6, **kw):
    d = {"id": i, "at": at, "ramp": ramp}
    if until: d["until"] = until
    d.update(kw); return d
def lab(part, text, en, color, at, until, xy=None, **kw):
    d = {"part": part, "text": text, "en": en, "color": color, "at": at, "until": until}
    if xy: d["xy"] = xy
    d.update(kw); return d
def shot(at, x, y, d, elev, dur=30): return {"at": at, "dur": dur, "x": x, "y": y, "d": d, "elev": elev}
def hid(lay, a, b, dur=10): return {"layer": lay, "at": a, "until": b, "opacity": 0, "dur": dur}
def sec(kind, at, until, title, tag, t=None, y=1066, h=330, **kw):
    d = {"type": "section", "kind": kind, "at": at, "until": until, "x": 64, "y": y, "w": 952, "h": h, "avoid": False, "title": title, "tag": tag}
    if t is not None: d["t"] = {k: {"at": v} for k, v in t.items()}
    d.update(kw); return d
def stamp(text, at, until, x, y, color="amber", size=50, rot=-4, **kw):
    d = {"type": "stamp", "at": at, "until": until, "x": x, "y": y, "text": text, "color": color, "rot": rot, "size": size, "avoid": False}; d.update(kw); return d

# 全片固定的可見度（v2，Andy 第 16 條）：s1 外殼完整蓋著（看得出是一台大機台）；s2「投影機」外殼掀開＋模組沿軸線分開（爆炸分解）、
# 一次亮一張標籤講模組，s3「叫曝光」前組回去；外殼一直掀著到 s8 才蓋回（中間看內部運作）。光錐只在組好、而且那一段光路在畫面裡時才亮
VIS = [hid("lens", "s1:start-40", FAR, 1), hid("sign", "s1:start-40", "s8:asml-4", 1),
       hid("cone", "s1:start-40", "s3:expo+2", 1), hid("cone", "s4:start-8", "s5:bowl-6", 8),
       hid("coneW", "s1:start-40", "s3:expo+2", 1), hid("coneW", "s4:start-8", "s6:start", 8),
       hid("coneI", "s1:start-40", "s3:expo+2", 1), hid("coneI", "s4:start-8", "s6:start", 8)]
def mv(lay, a, b, dur=22, **kw):
    d = {"layer": lay, "at": a, "until": b, "dur": dur}; d.update(kw); return d
# 外殼掀開：前板往上前方掀走、頂板往上、右側板往右、光源艙外殼往左上；s8 開頭蓋回
OPEN_A, OPEN_B = "s2:proj-24", "s8:start-16"
HULL_OPEN = [mv("hullF", OPEN_A, OPEN_B, 20, dy=5, dz=9, opacity=0), mv("hullR", "s2:proj-20", OPEN_B, 20, dy=9, opacity=0),
             mv("hullE", "s2:proj-18", OPEN_B, 20, dx=9, opacity=0), mv("hullS", "s2:proj-22", OPEN_B, 20, dx=-6, dy=4, dz=6, opacity=0),
             mv("hull", "s2:proj-14", OPEN_B, 18, opacity=0)]
# 模組沿軸線分開（一層一層錯開幾幀），s3「叫曝光」前組回去
EXP_B = "s3:expo-18"
EXPLODE = [mv("mask", "s2:proj", EXP_B, dy=6.5), mv("illum", "s2:proj+4", EXP_B, dx=-4, dy=3.5), mv("src", "s2:proj+6", EXP_B, dx=-9),
           mv("frame", "s2:proj+8", EXP_B, dy=-3.5), mv("wafer", "s2:proj+8", EXP_B, dy=-6.5), mv("laser", "s2:proj+10", EXP_B, dy=-6),
           mv("floor", "s2:proj+2", "s3:expo-14", 14, opacity=0)]
# 換格（s7）：晶圓台沿 z 一格一格移動；每一步緩入緩出（EASE.move）＋到位後阻尼過衝（spring），表示慣性
STEP = 1.6
def add(c, n):
    m = re.match(r"([^+-]+)([+-]\d+)?$", c); k = int(m.group(2) or 0) + n
    return f"{m.group(1)}{'+' if k >= 0 else '-'}{abs(k)}"
def step(at, n):
    return [{"layer": "wafer", "at": at, "until": FAR, "dur": 14, "dx": STEP},
            {"layer": "wafer", "at": add(at, 12), "until": add(at, 14), "dur": 2, "dx": 0.22, "spring": {"tau": 5, "period": 10}}]
P = {}
OPS_ALL = lambda a, b: [run(i, a, b, 8) for i in ("light", "maskScan", "waferScan", "expose", "coneGlow", "coneWGlow", "coneIGlow")]
P["s1"] = {"shot": [shot("start-30", 1.5, 1.2, 184, 15, 1), shot("start", 1.5, 0.8, 176, 16, 70), shot("who-10", 1, -10, 200, 15, 30)],
 "shift": VIS + HULL_OPEN + EXPLODE,
 "run": [run("status", "start-30", FAR, 1), run("portGlow", "start-30", "s2:proj", 1)],
 "overlay": [sec("asml-hook", "who", "s2:start-5", "設備五大-1", "示意，非實際比例", {"who": "who", "top": "top", "one": "one"})]}
# s2–s3 爆炸分解：一次只亮一張標籤（每張 ≥1.5 秒），名字＋功能
P["s2"] = {"zoom": [{"to": "machine", "at": "start-4", "dur": 1}], "shot": [shot("start-4", 1, -10, 200, 15, 1), shot("proj-20", -3, -7, 246, 15, 40)],
 "labels": [lab("maskBox", "光罩台：放電路原圖", "Reticle stage", "blue", "mask-4", "x4-2"),
            lab("poBox", "投影鏡組：縮小 4 倍", "Projection optics", "amber", "x4", "x4+44"),
            lab("stageBox", "晶圓台：兩座輪流", "Twin wafer stages", "blue", "wafer+22", "s3:layer+4")],
 "overlay": [sec("asml-proj", "start+2", "s3:start-5", "曝光機像投影機", "示意", {"proj": "proj", "mask": "mask", "x4": "x4", "wafer": "wafer"})]}
P["s3"] = {"shot": [shot("expo-14", 0, -10, 206, 14, 30)],
 "run": OPS_ALL("expo+4", "s4:start"),
 "labels": [lab("srcBox", "光源艙：雷射打錫滴", "EUV source", "amber", "layer+6", "lit-10"),
            lab("illumBox", "照明系統：把光整形", "Illuminator", "blue", "lit-8", "expo-6")],
 "overlay": [sec("asml-step", "start+2", "s4:start-5", "它負責哪一步", "示意", {"lay": "layer", "lit": "lit", "expo": "expo"})]}
SRC_HIDE = [hid(l, "s4:start-6", "s6:start-10", 14) for l in ("optics", "shell", "mask", "wafer", "frame", "illum", "laser", "floor")]
P["s4"] = {"shot": [shot("start-6", -12, -11.5, 104, 10)], "shift": SRC_HIDE,
 "run": [run("tin", "tin-6", "s6:start"), run("lpp", "laser-12", "s7:start-6")],
 "labels": [lab("tin", "錫滴", "Tin droplets", "blue", "tin-2", "s5:start-4"), lab("plasma", "電漿", "Plasma", "amber", "plasma", "s5:start-4", xy=[860, 560])],
 "overlay": [stamp("每秒 {n} 顆", "tin-2", "s5:start-6", 540, 970, size=56, countTo=50000, countDur=30),
             sec("asml-lpp", "laser-6", "s5:start-5", "雷射打錫滴（側視）", "放大、放慢示意", source="lpp")]}
P["s5"] = {"shot": [shot("start-6", -10.5, -10.5, 110, 12)],
 "run": [run("coneGlow", "bowl-4", FAR, 12)],
 "labels": [lab("collector", "碗形收集鏡", "Collector mirror", "amber", "bowl", "s6:start-4"), lab("ifp", "收成一束", "Intermediate focus", "blue", "beam", "s6:start-10")],
 "overlay": [sec("asml-col", "start+2", "s6:start-5", "空氣吸光→真空", "示意", {"air": "air", "vac": "vac", "bowl": "bowl", "beam": "beam"})]}
P["s6"] = {"shot": [shot("start-6", 4.5, -14, 182, 22, 34)],
 "run": [run("maskScan", "start", "s8:start"), run("waferScan", "start", "s8:start"), run("expose", "start", "s8:start"), run("light", "start", "s7:start-10"), run("coneWGlow", "start", "s7:start-6"), run("coneIGlow", "start", "s7:start-6"), run("coneGlow", "start", "s7:start-6")],
 "labels": [lab("mask", "光罩台", "Mask stage", "blue", "stage", "s7:start-4"), lab("wafer", "晶圓台", "Wafer stage", "amber", "opp", "s7:start-4")],
 "overlay": [sec("asml-scan", "start+2", "s7:start-8", "掃描曝光（側視）", "示意", mask="maskScan")]}
FAR_HIDE = lambda a, b: [hid(l, a, b, 14) for l in ("src", "optics", "shell", "mask", "illum", "sign", "cone", "coneI", "coneW", "laser", "floor", "hullF", "hullR", "hullE", "hullS", "hull")]
P["s7"] = {"shot": [shot("start-6", 10, -17.5, 84, 28, 30)],
 "shift": step("s7:move", 1) + step("s7:settle+20", 2) + step("s7:many+4", 3) + FAR_HIDE("s7:start-6", "s8:start+24"),
 "run": [run("expose", "settle", FAR)],
 "labels": [lab("stage", "晶圓台：一格一格走", "Step to next field", "amber", "move", "s8:start-4", xy=[600, 340])],
 "overlay": [sec("asml-grid", "start+2", "s8:start-5", "照好幾十格", "示意（一格約 26×33 mm）", {"done": "done", "move": "move", "settle": "settle", "many": "many"})]}
P["s8"] = {"shot": [shot("start-6", -1, -9, 200, 12, 34)],
 "run": [run("portGlow", "start", "s12:start-6")],
 "labels": [lab("sign", "艾司摩爾", "Netherlands", "amber", "asml", "s10:start-4", flag="NL", logo="asml")],
 "overlay": [sec("asml-co", "start+2", "s9:start-5", "全球誰做曝光機", "研究機構估計", {"three": "three", "asml": "asml", "jp": "jp", "canon": "canon"})]}
P["s9"] = {"shot": [shot("start-4", -1, -9, 194, 12)],
 "overlay": [sec("asml-euv", "start+2", "s10:start-5", "極紫外光曝光機", "價格為媒體報導", {"euv": "euv", "only": "only", "price": "price"})]}
P["s10"] = {"shot": [shot("start-4", -1, -9, 200, 15)],
 "overlay": [sec("asml-num", "start+2", "s11:start-5", "2025 年", "公司財報（系統營收地區別）", {"year": "year", "n48": "n48", "tw": "tw"})]}
P["s11"] = {"shot": [shot("start-4", -1, -9, 204, 13)],
 "overlay": [sec("asml-tw", "start+2", "s12:start-5", "在台灣", "公司官網、媒體報導", {"hq": "hq", "lk": "lk", "mic": "mic", "gd": "gd", "kc": "kc"}, h=360, y=1040)]}
P["s12"] = {"shot": [shot("start-4", 8, -14, 120, 30)], "shift": FAR_HIDE("s12:start-4", FAR),
 "labels": [lab("wafer", "先鋪薄膜", "Films first", "blue", "film", "s13:start-4")],
 "overlay": [sec("asml-next", "start+2", "s13:start-5", "接下來", "下一集：設備五大-2", {"film": "film", "next": "next", "kw": "kw"})]}
for sc in scenes:
    if sc["id"] in P: sc["props"].update(P[sc["id"]])

lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": False, "note": "查證截至 2026/11/25", "noteAlways": True}
levels = [lv("machine", "曝光機（示意）", "EUV SCANNER", "10 m", "1 m")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-asml", "prevEpisode": "光阻-2", "title": "設備五大-1：艾司摩爾 ASML（科技透明圈）", "asOf": "2026/11/25", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
                 "_說明": "旁白金手指：2.5＋Iapetus＋說明 B（TECH_B_LINE 11/25 改：捲舌音要念清楚）；第一次用新提示詞，先試聽到 s3 給 Andy 聽，正式整篇配音等同意"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "", "zh": "示意，極紫外光實際不可見"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["曝光機", "只有一家？"], "sub": "設備五大-1：艾司摩爾", "frame": 40}, "sample": False, "model": None, "scenes": scenes}
del out["model"]
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
for s in scenes:
    t = s.get("tts") or ""
    for ch in ("矽", "光罩", "上集", "欸"):
        if ch in t and not (ch == "上集" and "上一集" in t): bad.append((s["id"], ch))
    if re.search(r"[0-9]", t): bad.append((s["id"], "數字"))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
print("念稿字數", n, "問題", bad)
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
