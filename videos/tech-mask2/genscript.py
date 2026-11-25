"""tech-mask2 腳本產生器：python3 videos/tech-mask2/genscript.py → script.json
光罩-2：誰做光罩、怎麼運送（科技透明圈 系列「代工的供應商」第 4 集；上一集光罩-1；下一集光阻-1：照到光就會變的膠）。
只寫前製資料（旁白、cue、字幕、hook、片尾卡、hud、voice）；3D 動作（zoom/shot/shift/run/labels/overlay）由 genmodel.py 併進來。"""
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook",
 "上集說光罩是晶片底片，這張底片誰做？怎麼送進曝光機？",
 ["上集說光罩是晶片底片", "這張底片誰做？", "怎麼送進曝光機？"],
 ["Last time: a photomask is the chip's negative.", "Who makes it?", "How does it reach the scanner?"],
 [("prev", "晶片底片"), ("who", "誰做"), ("how", "怎麼送進"), ("scan", "曝光機")],
 ["光罩", "底片", "曝光機"], ["IMS 規格；SemiEng"]),
("s2", "mechanism",
 "最先進的光罩，台積電、英特爾、三星自己做，改版最快。",
 ["最先進的光罩", "台積電、英特爾、三星自己做", "改版最快"],
 ["The most advanced masks", "are made in-house by TSMC, Intel and Samsung,", "so revisions turn fastest."],
 [("adv", "最先進的光罩"), ("tsmc", "台積電"), ("intel", "英特爾"), ("ss", "三星"), ("fast", "改版最快")],
 ["台積電", "英特爾", "三星", "自己做"], ["SemiEng；遠見 2023/10"]),
("s3", "mechanism",
 "其他公司交給專業光罩廠，主要是日本兩家、美國一家。",
 ["其他公司交給專業光罩廠", "主要是日本兩家", "美國一家"],
 ["Everyone else uses merchant mask shops:", "two big ones in Japan,", "one in the US."],
 [("mer", "專業光罩廠"), ("jp", "日本兩家"), ("us", "美國一家")],
 ["專業光罩廠", "日本", "美國"], ["SemiEng；Photronics 10-K"]),
("s4", "mechanism",
 "台灣有台灣光罩，主力是成熟製程光罩。",
 ["台灣有台灣光罩", "主力是成熟製程光罩"],
 ["Taiwan has Taiwan Mask,", "focused on mature-node masks."],
 [("tmc", "台灣光罩"), ("mat", "成熟製程")],
 ["台灣光罩", "成熟製程"], ["鉅亨網；財訊；遠見"]),
("s5", "mechanism",
 "怎麼做？鍍鉻石英板塗上光阻，電子束把電路一筆筆寫上去。",
 ["怎麼做？", "鍍鉻石英板塗上光阻", "電子束把電路", "一筆筆寫上去"],
 ["How is it made?", "A chrome-coated quartz plate gets resist,", "and an electron beam", "writes the circuit stroke by stroke."],
 [("how", "怎麼做"), ("qz", "石英板"), ("cr", "鍍鉻"), ("res", "塗上光阻"), ("eb", "電子束"), ("wr", "一筆筆寫上去")],
 ["鉻", "石英", "光阻", "電子束"], ["USPTO 7220531"]),
("s6", "mechanism",
 "線路越細，一道寫太慢，最先進的用二十六萬道一起寫。",
 ["線路越細", "一道寫太慢", "最先進的用", "二十六萬道一起寫"],
 ["Finer lines mean", "one beam is too slow;", "the most advanced use", "262,144 beams at once."],
 [("fine", "線路越細"), ("slow", "一道寫太慢"), ("adv", "最先進的"), ("n26", "二十六萬道"), ("all", "一起寫")],
 ["一道", "二十六萬道", "電子束"], ["IMS 規格；SemiEng"]),
("s7", "mechanism",
 "寫完要檢查，因為一個瑕疵，每次曝光都會印上去。",
 ["寫完要檢查", "因為一個瑕疵", "每次曝光都會印上去"],
 ["Then it is inspected,", "because one defect on the mask", "prints on every exposure."],
 [("ins", "寫完要檢查"), ("def", "一個瑕疵"), ("rep", "每次曝光")],
 ["檢查", "瑕疵", "每次曝光"], ["SPIE 12751；SemiEng"]),
("s8", "mechanism",
 "光罩裝進光罩盒，極紫外光用的有兩層，外盒擋灰塵，內盒是金屬。",
 ["光罩裝進光罩盒", "極紫外光用的有兩層", "外盒擋灰塵", "內盒是金屬"],
 ["The mask goes into a pod;", "EUV pods have two layers:", "the outer pod blocks dust,", "the inner pod is metal."],
 [("pod", "裝進光罩盒"), ("euv", "極紫外光用的"), ("two", "有兩層"), ("out", "外盒擋灰塵"), ("inn", "內盒是金屬")],
 ["光罩盒", "兩層", "外盒", "內盒"], ["Entegris；SEMATECH"]),
("s9", "twist",
 "極紫外光罩很難加保護膜，所以內盒到真空機台才打開。",
 ["極紫外光罩", "很難加保護膜", "所以內盒到", "真空機台才打開"],
 ["EUV masks", "can hardly carry a protective film,", "so the inner pod opens only", "inside the vacuum tool."],
 [("why", "極紫外光罩"), ("film", "很難加保護膜"), ("vac", "真空機台"), ("open", "才打開")],
 ["保護膜", "真空", "內盒"], ["Entegris 產品頁；USPTO 7477358；SPIE"]),
("s10", "payoff",
 "最早通過曝光機大廠認證的，是美國英特格和台灣家登。",
 ["最早通過曝光機大廠認證的", "是美國英特格", "和台灣家登"],
 ["The first pods qualified by the scanner maker", "came from Entegris in the US", "and Gudeng in Taiwan."],
 [("cert", "通過曝光機大廠認證"), ("ent", "英特格"), ("gd", "家登")],
 ["認證", "英特格", "家登"], ["Entegris 2018；中央社 2018"]),
("s11", "cta",
 "光罩到了，還要一層膠接住圖案，照到光就會變，下一集看。留言光罩盒，拿完整資料。",
 ["光罩到了", "還要一層膠接住圖案", "照到光就會變", "下一集看", "留言光罩盒", "拿完整資料"],
 ["The mask has arrived,", "but a film of resist must catch the pattern;", "it changes when light hits it.", "Next episode.", "Comment \"光罩盒\"", "for the full notes."],
 [("arr", "光罩到了"), ("glue", "一層膠"), ("light", "照到光就會變"), ("next", "下一集"), ("kw", "留言光罩盒")],
 ["光阻", "膠", "光罩盒"], ["示意動畫，不是量測"]),
]
# 念稿替換：「鉻」（ㄍㄜˋ）寫成同音「各」，避免模型念錯；字幕維持「鉻」
TTS = lambda t: t.replace("鉻", "各").replace("矽", "細").replace("光罩", "光照").replace("上集", "上一集")  # 11/24 Andy：光罩念成光掃、上集念成喪集（scripts/three/tts-subst.json）
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
scenes[0]["props"]["hook"] = {"kicker": "接上集：光罩＝晶片底片", "title": "這張底片誰做？", "size": 96, "top": 236}  # 審片必改 4：鉤子要有數字（research 第 11 列，IMS 512×512）
scenes.append({"id": "s12", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "光阻-1 照光就變的膠", "trail": [], "at": "s11:kw-8", "comment": "光罩盒", "logoAnim": "transparent"}}})
lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": True, "note": "查證截至 2026/11/24", "noteAlways": True}
levels = [lv("plant", "光罩廠", "MASK SHOP", "10 m", "2 m"), lv("tool", "設備", "EQUIPMENT", "2 m", "50 cm"),
          lv("pod", "光罩盒", "RETICLE POD", "30 cm", "10 cm"), lv("mask", "光罩", "PHOTOMASK", "15 cm", "5 cm")]
levels[0]["handoff3D"] = True
levels[0]["readout"] = False  # 地圖幕（s2–s4）不放倍率與「2 m」比例尺（地圖本來就不照比例；審片 R2-7）
out = {"slug": "tech-mask2", "prevEpisode": "光罩-1", "title": "光罩-2：誰做光罩、怎麼運送（科技透明圈）", "asOf": "2026/11/24", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
                 "_說明": "旁白金手指（2026/11/21 Andy 定案，docs/prompts/tech-旁白金手指.md）：2.5＋Iapetus＋說明 B；整篇 1 次請求（TTS_NO_RETRY=1）"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["光罩誰做", "怎麼送進機台"], "sub": "光罩-2：光罩盒", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
for s in scenes:
    t = s.get("tts") or ""
    for ch in ("矽", "夕", "欸", "鉻"):
        if ch in t: bad.append((s["id"], ch))
    if re.search(r"[A-Za-z0-9]", t): bad.append((s["id"], "英數字"))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
print("念稿字數", n, "問題", bad)
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
