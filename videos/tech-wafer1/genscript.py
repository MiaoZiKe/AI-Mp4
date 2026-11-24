"""tech-wafer1 腳本產生器：python3 videos/tech-wafer1/genscript.py → script.json
矽晶圓-1：一塊砂怎麼變成晶圓（科技透明圈 系列 2「代工的供應商」第 1 集；下一集矽晶圓-2：台灣誰在做）。
只寫前製資料（旁白、cue、字幕、hook、片尾卡、hud、voice）；3D 動作（zoom/shot/shift/run/labels/overlay）由 genmodel.py 併進來。"""
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook",
 "晶片做在晶圓上，晶圓是砂子變的，怎麼變成一面鏡子？",
 ["晶片做在晶圓上", "晶圓是砂子變的", "怎麼變成一面鏡子？"],
 ["Chips are built on wafers,", "and wafers start as sand.", "How does sand become a mirror?"],
 [("chip", "晶片做在晶圓上"), ("sand", "砂子變的"), ("how", "怎麼變成"), ("mirror", "一面鏡子")],
 ["晶圓", "砂子", "鏡子"], ["Wikipedia Wafer (electronics)"]),
("s2", "mechanism",
 "砂子是二氧化矽，先跟碳一起燒掉氧，變成九成八純的冶金級矽。",
 ["砂子是二氧化矽", "先跟碳一起燒掉氧", "變成九成八純的冶金級矽"],
 ["Sand is silicon dioxide.", "Burn it with carbon to strip the oxygen,", "giving 98%-pure metallurgical silicon."],
 [("sio2", "二氧化矽"), ("carbon", "跟碳一起燒"), ("oxy", "燒掉氧"), ("p98", "九成八"), ("mg", "冶金級矽")],
 ["二氧化矽", "碳", "九成八", "冶金級矽"], ["USPTO 9067338；Fraunhofer ISE 多晶矽報告"]),
("s3", "twist",
 "但晶片要十一個九，一千億個原子，雜質不到一個，電晶體才準。",
 ["但晶片要十一個九", "一千億個原子", "雜質不到一個", "電晶體才準"],
 ["But chips need eleven nines:", "in 100 billion atoms,", "less than one impurity,", "or transistors drift."],
 [("but", "但晶片要"), ("n11", "十一個九"), ("e11", "一千億個原子"), ("imp", "雜質不到一個"), ("ok", "電晶體才準")],
 ["十一個九", "一千億", "雜質"], ["Bernreuter Research；USPTO 11512001"]),
("s4", "mechanism",
 "所以用西門子法，把矽變成氣體蒸餾，再長回棒子上，叫多晶矽。",
 ["所以用西門子法", "把矽變成氣體蒸餾", "再長回棒子上", "叫多晶矽"],
 ["So we use the Siemens process:", "turn silicon into a gas and distill it,", "then grow it back onto rods:", "polysilicon."],
 [("siem", "西門子法"), ("gas", "變成氣體"), ("dist", "蒸餾"), ("rod", "長回棒子上"), ("poly", "多晶矽")],
 ["西門子法", "蒸餾", "多晶矽"], ["Fraunhofer ISE；Wacker 2022 年報"]),
("s5", "mechanism",
 "但多晶矽原子排得亂，放進石英坩堝，加熱到一千四百多度熔掉。",
 ["但多晶矽原子排得亂", "放進石英坩堝", "加熱到一千四百多度", "熔掉"],
 ["But polysilicon atoms are jumbled.", "Load it into a quartz crucible,", "heat past 1,400 °C,", "and melt it."],
 [("messy", "排得亂"), ("cruc", "石英坩堝"), ("heat", "加熱"), ("deg", "一千四百多度"), ("melt", "熔掉")],
 ["多晶矽", "石英坩堝", "一千四百多度"], ["Wikipedia Czochralski method；PVA TePla"]),
("s6", "mechanism",
 "接著晶種浸下去，一邊慢轉一邊往上拉，原子跟著排隊，長成單晶晶棒。",
 ["接著晶種浸下去", "一邊慢轉", "一邊往上拉", "原子跟著排隊", "長成單晶晶棒"],
 ["Then a seed crystal dips in,", "turning slowly", "while it is pulled up;", "atoms line up behind it", "into a single-crystal ingot."],
 [("seed", "晶種浸下去"), ("rot", "慢轉"), ("pull", "往上拉"), ("line", "跟著排隊"), ("ingot", "單晶晶棒")],
 ["晶種", "往上拉", "單晶晶棒"], ["Wikipedia Czochralski method；USPTO 6689209"]),
("s7", "mechanism",
 "晶棒用鑽石線，切成一片片薄片。",
 ["晶棒用鑽石線", "切成一片片薄片"],
 ["Diamond wire slices the ingot", "into thin discs."],
 [("saw", "鑽石線"), ("slice", "切成一片片")],
 ["鑽石線", "薄片"], ["Wikipedia Wafer (electronics)"]),
("s8", "mechanism",
 "再研磨、拋光成鏡面，就是晶圓。",
 ["再研磨", "拋光成鏡面", "就是晶圓"],
 ["Then grind them,", "polish to a mirror:", "a wafer."],
 [("grind", "研磨"), ("pol", "拋光成鏡面"), ("wafer", "就是晶圓")],
 ["研磨", "拋光", "鏡面"], ["Wikipedia Wafer (electronics)；USPTO 9108289"]),
("s9", "payoff",
 "為什麼是十二吋？面積是八吋的兩倍多，一次能做更多晶片。",
 ["為什麼是十二吋？", "面積是八吋的兩倍多", "一次能做更多晶片"],
 ["Why 12 inches?", "It has over twice the area of 8-inch,", "so each step makes more chips."],
 [("why", "十二吋"), ("area", "兩倍多"), ("more", "更多晶片")],
 ["十二吋", "八吋", "兩倍多"], ["Wevolver 200 mm vs 300 mm；Wikipedia Wafer"]),
("s10", "payoff",
 "全球主要是信越、勝高、環球晶、世創，和一家韓國廠，五家超過八成。",
 ["全球主要是信越", "勝高", "環球晶", "世創", "和一家韓國廠", "五家超過八成"],
 ["Globally: Shin-Etsu,", "SUMCO,", "GlobalWafers,", "Siltronic,", "and Korea's SK Siltron;", "the five hold over 80%."],
 [("shin", "信越"), ("sumco", "勝高"), ("gw", "環球晶"), ("sil", "世創"), ("sk", "韓國廠"), ("top5", "超過八成")],
 ["信越", "勝高", "環球晶", "世創", "八成"], ["旺得富（中時）2026/07；官股投顧報告（鉅亨轉載）"]),
("s11", "cta",
 "台灣除了環球晶，還有台勝科、合晶，各做什麼？下一集看。留言拉晶，拿完整資料。",
 ["台灣除了環球晶", "還有台勝科、合晶", "各做什麼？", "下一集看", "留言拉晶", "拿完整資料"],
 ["Besides GlobalWafers, Taiwan has", "FST and Wafer Works.", "What does each do?", "Next episode.", "Comment \"拉晶\"", "for the full notes."],
 [("tw", "台灣除了環球晶"), ("fst", "台勝科"), ("ww", "合晶"), ("what", "各做什麼"), ("next", "下一集"), ("kw", "留言拉晶")],
 ["環球晶", "台勝科", "合晶"], ["SemiEngineering；股感；鉅亨"]),
]
TTS = lambda t: t.replace("矽", "細").replace("坩堝", "甘鍋")
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
scenes[0]["props"]["hook"] = {"kicker": "代工的供應商 1｜砂子變晶圓", "title": "純度 11 個 9", "size": 120, "top": 236}
scenes.append({"id": "s12", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "矽晶圓-2 台灣誰在做", "trail": ["環球晶", "台勝科", "合晶"], "at": "s11:kw-8", "comment": "拉晶", "logoAnim": "transparent"}}})
lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": True, "note": "查證截至 2026/11/24", "noteAlways": True}
levels = [lv("plant", "材料工廠", "MATERIALS PLANT", "10 m", "2 m"), lv("tool", "設備", "EQUIPMENT", "3 m", "1 m"),
          lv("wafer", "晶圓", "WAFER", "30 cm", "10 cm"), lv("atom", "原子", "ATOMS", "2 nm", "0.5 nm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-wafer1", "title": "矽晶圓-1：一塊砂怎麼變成晶圓（科技透明圈）", "asOf": "2026/11/24", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
                 "_說明": "旁白金手指（2026/11/21 Andy 定案，docs/prompts/tech-旁白金手指.md）：2.5＋Iapetus＋說明 B；整篇 1 次請求（TTS_NO_RETRY=1）"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["一把砂", "怎麼變晶圓"], "sub": "矽晶圓-1：拉晶", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
for s in scenes:
    t = s.get("tts") or ""
    if "矽" in t: bad.append((s["id"], "矽"))
    if "夕" in t: bad.append((s["id"], "夕"))
    if "欸" in t: bad.append((s["id"], "欸"))
    if re.search(r"[A-Za-z0-9]", t): bad.append((s["id"], "英數字"))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
print("念稿字數", n, "問題", bad)
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
