"""tech-oxidation 腳本產生器：python3 videos/tech-oxidation/genscript.py → script.json
只寫前製資料（旁白、cue、字幕、hook、片尾卡、hud、voice）；3D 動作（zoom/shot/shift/run/labels/overlay）由 genmodel.py 依 visual-spec.md 併進來。"""
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook",
 "上一支洗乾淨了，接著要加熱。最先進的，超過一千度，卻不到千分之一秒，為什麼這麼急？",
 ["上一支洗乾淨了", "接著要加熱", "最先進的", "超過一千度", "卻不到千分之一秒", "為什麼這麼急？"],
 ["The surface is clean now;", "next comes heat.", "The most advanced way:", "over 1,000 °C,", "in under a millisecond.", "Why the rush?"],
 [("prev", "洗乾淨"), ("heat", "加熱"), ("k1000", "超過一千度"), ("ms", "千分之一秒"), ("why", "為什麼")],
 ["加熱", "一千度", "千分之一秒"], ["應用材料 Vantage Astra DSA 產品頁（廠商）"]),
("s2", "mechanism",
 "先看氧化。晶圓排進爐管，通氧氣加熱到八百到一千兩百度，表面的矽就長成二氧化矽。",
 ["先看氧化", "晶圓排進爐管", "通氧氣", "加熱到八百到一千兩百度", "表面的矽", "就長成二氧化矽"],
 ["First, oxidation.", "Wafers go into a tube furnace,", "oxygen flows in,", "heated to 800–1,200 °C,", "and the silicon surface", "grows a layer of silicon dioxide."],
 [("ox", "先看氧化"), ("tube", "排進爐管"), ("o2", "通氧氣"), ("temp", "八百到一千兩百度"), ("grow", "長成二氧化矽")],
 ["爐管", "八百到一千兩百度", "二氧化矽"], ["Wikipedia Thermal oxidation；KTH 講義"]),
("s3", "mechanism",
 "乾式只通氧氣，慢但緻密；濕式加水氣，快很多。",
 ["乾式只通氧氣", "慢但緻密", "濕式加水氣", "快很多"],
 ["Dry: oxygen only,", "slow but dense.", "Wet: add water vapor,", "much faster."],
 [("dry", "乾式只通氧氣"), ("dense", "慢但緻密"), ("wet", "濕式加水氣"), ("fast", "快很多")],
 ["乾式", "濕式", "緻密"], ["Wikipedia Thermal oxidation"]),
("s4", "mechanism",
 "一管放一百多片。表面有一點髒，氧化層就長不均勻，所以上一支才要洗。",
 ["一管放一百多片", "表面有一點髒", "氧化層就長不均勻", "所以上一支才要洗"],
 ["One tube holds 100+ wafers.", "A little dirt on the surface", "and the oxide grows unevenly,", "which is why we cleaned first."],
 [("batch", "一百多片"), ("dirt", "有一點髒"), ("uneven", "長不均勻"), ("clean", "才要洗")],
 ["一百多片", "不均勻"], ["Wikipedia Thermal oxidation；日立評論 2006"]),
("s5", "mechanism",
 "再看退火。佈植的離子卡在縫裡，晶格也被撞亂，還不會導電。",
 ["再看退火", "佈植的離子", "卡在縫裡", "晶格也被撞亂", "還不會導電"],
 ["Next, annealing.", "Implanted ions", "sit in the gaps,", "the lattice is knocked out of order,", "so nothing conducts yet."],
 [("anneal", "再看退火"), ("ion", "佈植的離子"), ("gap", "卡在縫裡"), ("mess", "撞亂"), ("noc", "還不會導電")],
 ["退火", "晶格"], ["UW ECE528 Ch8；tech-implant research.md"]),
("s6", "mechanism",
 "加熱讓晶格排回整齊，離子補進原子的位置，才會導電，叫活化。",
 ["加熱讓晶格", "排回整齊", "離子補進原子的位置", "才會導電", "叫活化"],
 ["Heat lets the lattice", "reorder,", "ions take lattice sites,", "and current can flow:", "activation."],
 [("move", "加熱讓晶格"), ("order", "排回整齊"), ("site", "補進原子的位置"), ("cond", "才會導電"), ("act", "活化")],
 ["排回整齊", "活化"], ["USPTO 7846803；Cambridge MRS 論文"]),
("s7", "twist",
 "但加熱太久，離子會擴散出去；電晶體這麼小，界線一糊就關不起來。",
 ["但加熱太久", "離子會擴散出去", "電晶體這麼小", "界線一糊就關不起來"],
 ["But heat too long", "and the ions diffuse outward;", "transistors are so small", "a blurred edge won't switch off."],
 [("long", "加熱太久"), ("diff", "擴散出去"), ("small", "電晶體這麼小"), ("blur", "界線一糊")],
 ["擴散", "界線"], ["Cambridge MRS 論文（尖峰退火擴散過多）；示意"]),
("s8", "mechanism",
 "所以改用燈管，幾秒把晶圓拉到一千度，到頂就降溫，叫尖峰退火。",
 ["所以改用燈管", "幾秒", "把晶圓拉到一千度", "到頂就降溫", "叫尖峰退火"],
 ["So we switch to lamps:", "in seconds", "the wafer hits 1,000 °C", "and cool it right at the peak:", "spike anneal."],
 [("lamp", "改用燈管"), ("sec", "幾秒"), ("up", "拉到一千度"), ("peak", "到頂就降溫"), ("spike", "尖峰退火")],
 ["燈管", "一千度", "尖峰退火"], ["USPTO 8232114、7968440"]),
("s9", "payoff",
 "更先進的用雷射，只燒表面幾層原子，不到千分之一秒，離子來不及跑遠。",
 ["更先進的用雷射", "只燒表面幾層原子", "不到千分之一秒", "離子來不及跑遠"],
 ["More advanced: lasers", "heat only the top few atomic layers", "for under a millisecond,", "too short for ions to wander."],
 [("laser", "用雷射"), ("top", "表面幾層原子"), ("ms", "千分之一秒"), ("stay", "來不及跑遠")],
 ["雷射", "千分之一秒"], ["應用材料 Vantage Astra DSA 產品頁（廠商）"]),
("s10", "payoff",
 "爐管有日本國際電氣、東京威力科創；雷射退火有美國應用材料、日本迪恩士。台積電也是國際電氣的客戶。",
 ["爐管有日本國際電氣", "東京威力科創", "雷射退火有美國應用材料", "日本迪恩士", "台積電", "也是國際電氣的客戶"],
 ["Furnaces: Japan's Kokusai Electric", "and Tokyo Electron;", "laser anneal: Applied Materials", "and SCREEN.", "TSMC", "is a Kokusai customer."],
 [("koku", "國際電氣"), ("tel", "東京威力科創"), ("rtp", "雷射退火"), ("amat", "應用材料"), ("screen", "迪恩士"), ("tsmc", "台積電")],
 ["國際電氣", "東京威力科創", "應用材料", "迪恩士", "台積電"], ["公司產品頁；科技新報 2023/09"]),
("s11", "cta",
 "氧化層長好、離子歸位，接著要先塗光阻，才能畫線路，所以下一支，看光阻塗佈與顯影。留言氧化，看完整解說。",
 ["氧化層長好", "離子歸位", "接著要先塗光阻", "才能畫線路", "所以下一支", "看光阻塗佈與顯影", "留言氧化", "看完整解說"],
 ["The oxide is grown,", "the ions are in place;", "next we coat photoresist", "so circuits can be drawn.", "So next:", "resist coating and developing.", "Comment \"氧化\"", "for the full notes."],
 [("done", "氧化層長好"), ("ions", "離子歸位"), ("resist", "先塗光阻"), ("draw", "畫線路"), ("next", "下一支"), ("kw", "留言氧化")],
 ["光阻", "氧化"], ["光阻塗佈：TEL 塗佈顯影機產品說明"]),
]
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for c in cues: assert c[1] in nar, (sid, c)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": nar.replace("矽", "細"),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}}
    if i < len(S) - 1: sc["pauseAfter"] = 0.7
    scenes.append(sc)
scenes[0]["props"]["hook"] = {"kicker": "接清洗：加熱", "title": "1毫秒破千度？", "size": 120, "top": 236}
scenes.append({"id": "s12", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "光阻塗佈與顯影", "trail": ["塗佈", "曝光", "顯影"], "at": "s11:kw-8", "comment": "氧化", "logoAnim": "transparent"}}})
lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": True, "note": "查證截至 2026/11/21", "noteAlways": True}
levels = [lv("tool", "熱處理機台", "THERMAL PROCESSING", "3 m", "1 m"), lv("wafer", "晶圓", "WAFER", "30 cm", "10 cm"), lv("lattice", "晶格剖面", "LATTICE CROSS-SECTION", "5 nm", "1 nm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-oxidation", "title": "氧化與熱處理：破千度只要千分之一秒（科技透明圈）", "asOf": "2026/11/21", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
                 "_說明": "旁白金手指（2026/11/21 Andy 定案，docs/prompts/tech-旁白金手指.md）：2.5＋Iapetus＋說明 B；念稿 docs/prompts/tech-oxidation-旁白.txt；整篇 1 次請求（TTS_NO_RETRY=1）"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["破千度", "只要千分之一秒"], "sub": "氧化與熱處理", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
# 念稿檢查（lessons #35、#61）
bad = []
for s in scenes:
    t = s.get("tts") or ""
    if "矽" in t: bad.append((s["id"], "矽"))
    if "欸" in t: bad.append((s["id"], "欸"))
    if re.search(r"[A-Za-z0-9]", t): bad.append((s["id"], "英數字"))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
print("念稿字數", n, "問題", bad)
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
