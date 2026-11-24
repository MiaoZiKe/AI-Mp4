"""tech-wafer2 腳本產生器：python3 videos/tech-wafer2/genscript.py → script.json
矽晶圓-2：台灣誰在做（科技透明圈 系列 2「代工的供應商」第 2 集；上一集矽晶圓-1；下一集光罩-1：晶片的底片）。
只寫前製資料（旁白、cue、字幕、hook、片尾卡、hud、voice）；3D 動作（zoom/shot/shift/run/labels/overlay）由 genmodel.py 併進來。"""
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# 11/24 審片：英文以「|」切成和中文字幕短語同數（Tracks.tsx 依比例對應，數量不同會落後一句）
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook",
 "同樣是晶圓，有的拋光完還要再長一層矽，叫磊晶，差在哪？",
 ["同樣是晶圓", "有的拋光完", "還要再長一層矽", "叫磊晶，差在哪？"],
 ["Same wafer,", "but some, after polishing,", "grow one more layer of silicon: | it's called epitaxy.", "Why?"],
 [("same", "同樣是晶圓"), ("pol", "拋光完"), ("grow", "再長一層矽"), ("epi", "叫磊晶"), ("why", "差在哪")],
 ["晶圓", "拋光", "磊晶"], ["USPTO 6995077；Okmetic"]),
("s2", "mechanism",
 "上一集做好的鏡面晶圓，叫拋光晶圓，整片的雜質濃度都一樣。",
 ["上一集做好的鏡面晶圓", "叫拋光晶圓", "整片的雜質濃度都一樣"],
 ["The mirror wafer from last episode", "is a polished wafer:", "the doping is the same all the way through."],
 [("last", "上一集"), ("polw", "拋光晶圓"), ("same", "濃度都一樣")],
 ["拋光晶圓", "雜質濃度"], ["Wikipedia Wafer (electronics)"]),
("s3", "mechanism",
 "磊晶是送進反應腔，燈管加熱到一千一百度上下，通入含矽氣體。",
 ["磊晶是送進反應腔", "燈管加熱", "到一千一百度上下", "通入含矽氣體"],
 ["For epitaxy, it goes into a reactor;", "lamps heat it", "to about 1,100 °C,", "then silicon-bearing gas flows in."],
 [("in", "送進反應腔"), ("lamp", "燈管加熱"), ("deg", "一千一百度"), ("gas", "含矽氣體")],
 ["反應腔", "燈管", "一千一百度", "含矽氣體"], ["USPTO 8038793、9240316"]),
("s4", "mechanism",
 "托盤帶著晶圓慢慢轉，矽原子照底下的排列，長出一層新的單晶矽。",
 ["托盤帶著晶圓慢慢轉", "矽原子照底下的排列", "長出一層新的單晶矽"],
 ["The susceptor slowly spins the wafer;", "silicon atoms follow the lattice below", "and grow a new single-crystal layer."],
 [("spin", "慢慢轉"), ("atom", "照底下的排列"), ("layer", "長出一層")],
 ["托盤", "排列", "單晶矽"], ["USPTO 8216920；USPTO 6995077"]),
("s5", "mechanism",
 "好處是這層雜質能另外調，底下摻多、上面摻少，功率晶片常用。",
 ["好處是這層雜質能另外調", "底下摻多", "上面摻少", "功率晶片常用"],
 ["The payoff: this layer's doping is set separately,", "heavy below,", "light on top;", "power chips use this a lot."],
 [("adj", "另外調"), ("heavy", "底下摻多"), ("light", "上面摻少"), ("power", "功率晶片")],
 ["雜質", "摻多", "摻少", "功率晶片"], ["Okmetic N++ epi；USPTO 5306939"]),
("s6", "payoff",
 "尺寸也分工，十二吋做先進邏輯和記憶體，八吋、六吋多做功率晶片。",
 ["尺寸也分工", "十二吋做先進邏輯和記憶體", "八吋、六吋", "多做功率晶片"],
 ["Sizes split the work too:", "12-inch for advanced | logic and memory;", "8-inch,", "6-inch mostly for power chips."],
 [("size", "尺寸也分工"), ("w12", "十二吋"), ("w8", "八吋、六吋"), ("pw", "功率晶片")],
 ["十二吋", "八吋", "六吋"], ["台勝科法說 2025/11；TrendForce"]),
("s7", "payoff",
 "台灣最大的是環球晶，全球五大之一，去年營收六百多億元。",
 ["台灣最大的是環球晶", "全球五大之一", "去年營收六百多億元"],
 ["Taiwan's biggest is GlobalWafers,", "one of the global top five;", "2025 revenue: over NT$60 billion."],
 [("who", "台灣最大"), ("gw", "環球晶"), ("top5", "全球五大"), ("rev", "六百多億元")],
 ["環球晶", "五大", "六百多億"], ["旺得富 2026/03；經濟日報"]),
("s8", "payoff",
 "台勝科是台塑和日本勝高合資，主力十二吋，公司說占營收七成以上。",
 ["台勝科是台塑", "和日本勝高合資", "主力十二吋", "公司說占營收七成以上"],
 ["FST is a joint venture", "of Formosa Plastics and SUMCO;", "its focus is 12-inch,", "over 70% of revenue, per the company."],
 [("fst", "台勝科"), ("jv", "勝高合資"), ("main", "十二吋"), ("p70", "七成以上")],
 ["台勝科", "勝高", "七成"], ["台勝科法說 2025/11（旺得富、優分析）"]),
("s9", "payoff",
 "合晶主攻六吋、八吋，供應功率元件，也在擴十二吋。",
 ["合晶主攻六吋、八吋", "供應功率元件", "也在擴十二吋"],
 ["Wafer Works focuses on 6-inch", "and 8-inch, supplying power devices,", "and is now adding 12-inch."],
 [("ww", "合晶"), ("p68", "六吋、八吋"), ("pwr", "功率元件"), ("x12", "擴十二吋")],
 ["合晶", "六吋", "八吋", "功率元件"], ["經濟日報；工商時報 2026/03"]),
("s10", "payoff",
 "嘉晶專做磊晶，除了矽，也做碳化矽和氮化鎵的磊晶。",
 ["嘉晶專做磊晶", "除了矽", "也做碳化矽和氮化鎵的磊晶"],
 ["Episil focuses on epitaxy:", "besides silicon,", "it also grows SiC and | GaN epi layers."],
 [("epi", "嘉晶專做磊晶"), ("si", "除了矽"), ("sic", "碳化矽"), ("gan", "氮化鎵")],
 ["嘉晶", "碳化矽", "氮化鎵"], ["富果投研 2025/09；旺得富 2026/05"]),
("s11", "cta",
 "晶圓備好了，電路怎麼印上去？靠光罩，下一集看。留言磊晶，拿完整資料。",
 ["晶圓備好了", "電路怎麼印上去？", "靠光罩，下一集看", "留言磊晶", "拿完整資料"],
 ["The wafer is ready.", "How do circuits get printed on it?", "With a photomask; | next episode.", "Comment \"磊晶\"", "for the full notes."],
 [("ready", "晶圓備好了"), ("print", "怎麼印上去"), ("mask", "靠光罩"), ("next", "下一集"), ("kw", "留言磊晶")],
 ["光罩", "磊晶"], ["示意動畫，不是量測"]),
]
TTS = lambda t: t.replace("矽", "細").replace("光罩", "光照").replace("上集", "上一集")  # 11/24 Andy：光罩念成光掃、上集念成喪集（scripts/three/tts-subst.json）
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
scenes[0]["props"]["hook"] = {"kicker": "代工的供應商 2｜磊晶差在哪", "title": "1100°C 長一層矽", "size": 112, "top": 236}
scenes.append({"id": "s12", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "光罩-1 晶片的底片", "trail": ["環球晶", "台勝科", "合晶", "嘉晶"], "at": "s11:kw-8", "comment": "磊晶", "logoAnim": "transparent"}}})
lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": True, "note": "查證截至 2026/11/23", "noteAlways": True}
levels = [lv("plant", "晶圓廠", "WAFER MAKERS", "4 m", "1 m"), lv("tool", "磊晶爐", "EPI REACTOR", "1.5 m", "50 cm"),
          lv("wafer", "晶圓", "WAFER", "30 cm", "10 cm"), lv("atom", "原子", "ATOMS", "2 nm", "0.5 nm"),
          lv("litho", "曝光機（下一集）", "LITHOGRAPHY", "1.2 m", "30 cm")]   # 放最後：其他幕的縮放路徑不會經過它（v2 放在中間，s3、s7 開頭閃過「曝光機」）
levels[0]["handoff3D"] = True
out = {"slug": "tech-wafer2", "title": "矽晶圓-2：台灣誰在做（科技透明圈）", "asOf": "2026/11/23", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
                 "_說明": "旁白金手指（2026/11/21 Andy 定案，docs/prompts/tech-旁白金手指.md）：2.5＋Iapetus＋說明 B；整篇 1 次請求（TTS_NO_RETRY=1）"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["同一片晶圓", "為何再長一層"], "sub": "矽晶圓-2：磊晶", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
for s in scenes:
    t = s.get("tts") or ""
    if "矽" in t: bad.append((s["id"], "矽"))
    if "夕" in t: bad.append((s["id"], "夕"))
    if "欸" in t: bad.append((s["id"], "欸"))
    if re.search(r"[A-Za-z0-9]", t): bad.append((s["id"], "英數字"))
    if len(re.sub(r"[，。？！、；：\s]", "", t)) < 12 and t: bad.append((s["id"], "少於 12 字"))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
print("念稿字數", n, "問題", bad)
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
