"""tech-mask1 腳本產生器：python3 videos/tech-mask1/genscript.py → script.json
光罩-1：晶片的底片（科技透明圈 系列 2「代工的供應商」第 3 集；下一集光罩-2：誰做光罩、怎麼運送）。
只寫前製資料（旁白、cue、字幕、hook、片尾卡、hud、voice）；3D 動作（zoom/shot/shift/run/labels/overlay）由 genmodel.py 併進來。"""
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook",
 "晶片的電路，是用光照著底片印上去的。這張底片，叫光罩。",
 ["晶片的電路", "是用光照著底片印上去的", "這張底片，叫光罩"],
 ["A chip's circuits are printed", "by shining light through a negative.", "That negative is the photomask."],
 [("chip", "晶片的電路"), ("light", "用光照著"), ("film", "底片印上去"), ("mask", "叫光罩")],
 ["電路", "底片", "光罩"], ["Wikipedia Photomask"]),
("s2", "mechanism",
 "傳統光罩是石英玻璃，鍍上一層鉻，電路刻在鉻上。",
 ["傳統光罩是石英玻璃", "鍍上一層鉻", "電路刻在鉻上"],
 ["A classic mask is a quartz plate", "coated with chrome;", "the circuit is etched into the chrome."],
 [("quartz", "石英玻璃"), ("cr", "鍍上一層鉻"), ("pat", "電路刻在鉻上")],
 ["石英玻璃", "鉻"], ["USPTO 7767365；Wikipedia Photomask"]),
("s3", "mechanism",
 "光照下來，鉻擋住，玻璃透光，圖案就帶下去。",
 ["光照下來", "鉻擋住，玻璃透光", "圖案就帶下去"],
 ["Light shines down:", "chrome blocks it, glass lets it through,", "so the pattern rides down with the light."],
 [("duv", "光照下來"), ("block", "鉻擋住"), ("pass", "玻璃透光"), ("carry", "帶下去")],
 ["擋住", "透光", "圖案"], ["USPTO 7767365"]),
("s4", "mechanism",
 "再經過鏡頭縮小四倍，投影到晶圓上。",
 ["再經過鏡頭", "縮小四倍", "投影到晶圓上"],
 ["Then a lens", "shrinks it four times", "onto the wafer."],
 [("lens", "經過鏡頭"), ("x4", "縮小四倍"), ("wafer", "投影到晶圓上")],
 ["鏡頭", "四倍", "晶圓"], ["ASML 光罩設計手冊；Wikipedia"]),
("s5", "twist",
 "但更先進的極紫外光，會被玻璃吃掉，穿不過去。",
 ["但更先進的極紫外光", "會被玻璃吃掉", "穿不過去"],
 ["But advanced extreme-ultraviolet light", "is swallowed by glass;", "it can't get through at all."],
 [("euv", "極紫外光"), ("eat", "被玻璃吃掉"), ("no", "穿不過去")],
 ["極紫外光", "吃掉", "穿不過去"], ["Wikipedia EUV lithography；USPTO 12353120"]),
("s6", "mechanism",
 "所以改用反射：鉬和矽交錯疊約四十對，像鏡子把光彈回去。",
 ["所以改用反射", "鉬和矽交錯疊", "約四十對", "像鏡子把光彈回去"],
 ["So the mask reflects instead:", "molybdenum and silicon alternate,", "about forty pairs,", "bouncing light back like a mirror."],
 [("refl", "改用反射"), ("mo", "鉬和矽"), ("n40", "四十對"), ("mirror", "像鏡子")],
 ["反射", "鉬和矽", "四十對"], ["USPTO 11846881、11448956"]),
("s7", "mechanism",
 "電路改用吸收層畫，蓋到的地方不反光，圖案留在反射光裡。",
 ["電路改用吸收層畫", "蓋到的地方不反光", "圖案留在反射光裡"],
 ["The circuit is drawn in an absorber layer:", "covered spots don't reflect,", "so the pattern stays in the reflected light."],
 [("abs", "吸收層"), ("dark", "不反光"), ("pattern", "圖案留在")],
 ["吸收層", "不反光", "圖案"], ["USPTO 12353120、12181797"]),
("s8", "mechanism",
 "光罩上方繃著一層護膜，灰塵落在膜上，對不到焦，印不出來。",
 ["光罩上方繃著一層護膜", "灰塵落在膜上", "對不到焦", "印不出來"],
 ["A thin pellicle is stretched above the mask.", "Dust lands on the film,", "out of focus,", "so it never prints."],
 [("pel", "護膜"), ("dust", "灰塵落在膜上"), ("focus", "對不到焦"), ("no", "印不出來")],
 ["護膜", "灰塵", "對不到焦"], ["USPTO 11635681；Brouns et al. 2017"]),
("s9", "payoff",
 "先進晶片要幾十片光罩，片片不能有缺陷，一套上千萬美元。",
 ["先進晶片要幾十片光罩", "片片不能有缺陷", "一套上千萬美元"],
 ["An advanced chip needs dozens of masks,", "each one defect-free;", "a full set can top ten million dollars."],
 [("many", "幾十片光罩"), ("def", "不能有缺陷"), ("cost", "上千萬美元")],
 ["幾十片", "缺陷", "上千萬美元"], ["IC Knowledge；IBS；SemiAnalysis"]),
("s10", "payoff",
 "空白光罩是還沒畫圖的白紙，極紫外光用的，幾乎都來自日本豪雅和旭硝子。",
 ["空白光罩", "是還沒畫圖的白紙", "極紫外光用的", "幾乎都來自日本", "豪雅和旭硝子"],
 ["A mask blank", "is blank paper with no circuit yet.", "For EUV,", "nearly all come from Japan:", "HOYA and AGC."],
 [("blank", "空白光罩"), ("paper", "還沒畫圖的白紙"), ("euv", "極紫外光用的"), ("jp", "日本"), ("hoya", "豪雅"), ("agc", "旭硝子")],
 ["空白光罩", "豪雅", "旭硝子"], ["QYResearch；Morningstar；DigitalToday 2026"]),
("s11", "cta",
 "白紙有了，誰把電路畫上去？又怎麼送進工廠？下一集看。留言光罩，拿完整資料。",
 ["白紙有了", "誰把電路畫上去？", "又怎麼送進工廠？", "下一集看", "留言光罩", "拿完整資料"],
 ["The blank paper is ready.", "Who draws the circuit on it?", "How does it reach the fab?", "Next episode.", "Comment \"光罩\"", "for the full notes."],
 [("paper", "白紙有了"), ("who", "誰把電路畫上去"), ("ship", "送進工廠"), ("next", "下一集"), ("kw", "留言光罩")],
 ["誰把電路畫上去", "送進工廠", "光罩"], []),  # 11-24 審片：s11 拿掉出處列
]
TTS = lambda t: t.replace("矽", "細").replace("鉻", "各").replace("鉬", "目")
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
# 2026/11/24 審片必改 4：第 0 幀要有數字（旁白不改，s9 的「一套上千萬美元」提前當鉤子大字）
scenes[0]["props"]["hook"] = {"kicker": "晶片的底片＝光罩", "title": "一套上千萬美元", "size": 104, "top": 136}
scenes.append({"id": "s12", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "光罩-2 誰在做", "trail": ["畫電路", "光罩盒"], "at": "s11:kw-8", "comment": "光罩", "logoAnim": "transparent"}}})
lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": True, "note": "查證截至 2026/11/23", "noteAlways": True}
levels = [lv("tool", "曝光光路", "LITHO OPTICS", "1 m", "20 cm"), lv("mask", "光罩", "PHOTOMASK", "15 cm", "5 cm"),
          lv("cut", "光罩剖面", "MASK CROSS-SECTION", "2 μm", "0.5 μm"), lv("layer", "多層膜", "MULTILAYER", "400 nm", "100 nm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-mask1", "title": "光罩-1：晶片的底片（科技透明圈）", "asOf": "2026/11/23", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
                 "_說明": "旁白金手指（2026/11/21 Andy 定案，docs/prompts/tech-旁白金手指.md）：2.5＋Iapetus＋說明 B；整篇 1 次請求（TTS_NO_RETRY=1）。本輪不配音"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3, "readoutPlate": True},
       "cover": {"title": ["晶片的底片", "長什麼樣"], "sub": "光罩-1", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
for s in scenes:
    t = s.get("tts") or ""
    for ch in ("矽", "夕", "欸", "鉻", "鉬"):
        if ch in t: bad.append((s["id"], ch))
    if re.search(r"[A-Za-z0-9]", t): bad.append((s["id"], "英數字"))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
print("念稿字數", n, "問題", bad)
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
