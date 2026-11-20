"""tech-clean 腳本產生器：python3 videos/tech-clean/genscript.py → script.json
只寫前製資料（旁白、cue、字幕、hook、片尾卡、hud、voice）；3D 動作（zoom/shot/shift/run/labels/overlay）由 genmodel.py 依 visual-spec.md 併進來。"""
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
STYLE = "知識科普頻道的旁白。男聲，音高比一般男聲稍高一點、較明亮，不要低沉。台灣口音，不捲舌、不兒化，咬字清楚。語氣平穩、中性，從頭到尾維持同一個平穩的語調，不帶任何情緒：不興奮、不好奇、不溫柔、不戲劇化，不像跟朋友聊天，也不像主播或廣告。問句也用平穩的陳述語調念，句尾不刻意上揚。不加語助詞，照稿念，不加字。語速略快、節奏平均。所有字詞用台灣國語標準讀音；疊對（ㄉㄧㄝˊ ㄉㄨㄟˋ）、電子束（ㄉㄧㄢˋ ㄗˇ ㄕㄨˋ）、左右（ㄗㄨㄛˇ ㄧㄡˋ）。直接說："
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook",
 "上一支打完離子，光阻焦硬，表面也髒。先進晶片要洗五十次以上，為什麼？",
 ["上一支打完離子", "光阻焦硬，表面也髒", "先進晶片要洗五十次以上", "為什麼？"],
 ["After implanting ions,", "the resist is baked hard and the surface is dirty.", "Advanced chips get cleaned 50+ times.", "Why?"],
 [("prev", "打完離子"), ("hard", "光阻焦硬"), ("dirty", "表面也髒"), ("n50", "五十次以上"), ("why", "為什麼")],
 ["焦硬", "五十次以上"], ["SemiconductorX：7 奈米以下約 50 次以上"]),
("s2", "mechanism",
 "因為線寬只剩幾十奈米，一顆線寬一半大的顆粒，就可能讓線路短路。",
 ["因為線寬只剩幾十奈米", "一顆線寬一半大的顆粒", "就可能讓線路短路"],
 ["Lines are only tens of nanometers wide;", "a particle half that size", "can short the circuit."],
 [("width", "線寬只剩幾十奈米"), ("half", "線寬一半大的顆粒"), ("short", "線路短路")],
 ["幾十奈米", "一半", "短路"], ["USPTO 10332741；示意"]),
("s3", "mechanism",
 "先去光阻。焦硬的殼，用氧電漿低溫慢慢燒掉，叫灰化。",
 ["先去光阻", "焦硬的殼", "用氧電漿低溫慢慢燒掉", "叫灰化"],
 ["First, strip the resist.", "The hardened crust", "is burned off slowly by low-temperature oxygen plasma:", "ashing."],
 [("strip", "先去光阻"), ("crust", "焦硬的殼"), ("plasma", "氧電漿"), ("slow", "低溫慢慢燒掉"), ("ash", "灰化")],
 ["氧電漿", "灰化"], ["USPTO 8193096、9564344；示意"]),
("s4", "twist",
 "不能高溫，因為底下的光阻會冒氣，把殼撐破，碎片噴滿晶圓。",
 ["不能高溫", "底下的光阻會冒氣", "把殼撐破", "碎片噴滿晶圓"],
 ["Not too hot:", "the resist underneath outgasses,", "bursts the crust,", "and sprays debris across the wafer."],
 [("hot", "不能高溫"), ("gas", "會冒氣"), ("pop", "把殼撐破"), ("spray", "碎片噴滿晶圓")],
 ["冒氣", "撐破"], ["光阻爆裂（popping）：USPTO 8367555、9564344"]),
("s5", "mechanism",
 "殼燒穿後再加溫燒乾淨，殘渣用硫酸加雙氧水溶掉。",
 ["殼燒穿後", "再加溫燒乾淨", "殘渣用硫酸加雙氧水溶掉"],
 ["Once the crust is through,", "the rest burns off hotter,", "and sulfuric acid with peroxide dissolves the residue."],
 [("through", "殼燒穿後"), ("warm", "再加溫燒乾淨"), ("spm", "硫酸加雙氧水")],
 ["加溫", "硫酸加雙氧水"], ["USPTO 9564344；HAL hal-01882454"]),
("s6", "mechanism",
 "接著是單片清洗。晶圓在轉盤上旋轉，噴嘴從中心掃到邊緣，把顆粒往外甩。",
 ["接著是單片清洗", "晶圓在轉盤上旋轉", "噴嘴從中心掃到邊緣", "把顆粒往外甩"],
 ["Next: single-wafer cleaning.", "The wafer spins on a chuck,", "the nozzle sweeps from center to edge,", "flinging particles outward."],
 [("single", "單片清洗"), ("spin", "晶圓在轉盤上旋轉"), ("sweep", "噴嘴從中心掃到邊緣"), ("fling", "把顆粒往外甩")],
 ["單片清洗", "旋轉", "噴嘴"], ["單晶圓旋轉清洗：USPTO 8303724；示意"]),
("s7", "mechanism",
 "黏太緊的小顆粒，用兆音波。每秒振動約一百萬次，推出細小水流，把顆粒推走。",
 ["黏太緊的小顆粒", "用兆音波", "每秒振動約一百萬次", "推出細小水流", "把顆粒推走"],
 ["Stubborn tiny particles", "get megasonics:", "about a million vibrations per second", "push fine currents in the liquid", "that carry particles away."],
 [("stuck", "黏太緊的小顆粒"), ("mega", "兆音波"), ("mhz", "一百萬次"), ("stream", "推出細小水流"), ("away", "把顆粒推走")],
 ["兆音波", "一百萬次"], ["兆音波約 1 MHz、聲流：USPTO 6006765；示意"]),
("s8", "mechanism",
 "藥液輪流換，一種去顆粒和有機物，一種去金屬，每換一次都用超純水沖淨。",
 ["藥液輪流換", "一種去顆粒和有機物", "一種去金屬", "每換一次都用超純水沖淨"],
 ["Chemicals take turns:", "one removes particles and organics,", "one removes metals,", "with an ultrapure-water rinse after each."],
 [("turn", "藥液輪流換"), ("sc1", "去顆粒和有機物"), ("sc2", "去金屬"), ("rinse", "超純水沖淨")],
 ["顆粒", "金屬", "超純水"], ["RCA 清洗：Wikipedia；USPTO 5695572"]),
("s9", "payoff",
 "最後是乾燥。直接甩乾會留水痕、拉倒細線，所以用異丙醇把水換掉，從中心往外推乾。",
 ["最後是乾燥", "直接甩乾會留水痕", "拉倒細線", "所以用異丙醇把水換掉", "從中心往外推乾"],
 ["Finally, drying.", "Spinning water off leaves watermarks", "and can topple fine lines,", "so IPA replaces the water", "and the dry front moves from center out."],
 [("dry", "最後是乾燥"), ("mark", "留水痕"), ("fall", "拉倒細線"), ("ipa", "異丙醇"), ("front", "從中心往外推乾")],
 ["水痕", "異丙醇"], ["IPA 乾燥、水痕與圖形倒塌：USPTO 8303724、11069520"]),
("s10", "payoff",
 "機台有日本的迪恩士、東京威力科創、美國科林研發；台灣辛耘、弘塑做先進封裝的濕製程。",
 ["機台有日本的迪恩士", "東京威力科創", "美國科林研發", "台灣辛耘、弘塑", "做先進封裝的濕製程"],
 ["Tools: Japan's SCREEN,", "Tokyo Electron,", "and America's Lam Research;", "Taiwan's Scientech and GPTC", "supply wet process for advanced packaging."],
 [("screen", "迪恩士"), ("tel", "東京威力科創"), ("lam", "科林研發"), ("tw", "台灣辛耘"), ("pkg", "先進封裝的濕製程")],
 ["迪恩士", "東京威力科創", "科林研發", "辛耘", "弘塑"], ["市場研究摘要；經濟日報、工商時報報導"]),
("s11", "cta",
 "表面洗乾淨，才長得出均勻的氧化層；離子也要加熱才會歸位導電。所以下一支，看氧化與熱處理。留言清洗，看完整解說。",
 ["表面洗乾淨", "才長得出均勻的氧化層", "離子也要加熱", "才會歸位導電", "所以下一支", "看氧化與熱處理", "留言清洗", "看完整解說"],
 ["A clean surface", "grows an even oxide;", "the ions also need heat", "to settle in and conduct.", "So next:", "oxidation and heat treatment.", "Comment \"清洗\"", "for the full notes."],
 [("clean", "表面洗乾淨"), ("oxide", "均勻的氧化層"), ("heat", "加熱"), ("next", "下一支"), ("kw", "留言清洗")],
 ["氧化層", "加熱", "清洗"], ["Wikipedia RCA clean；UW ECE528 Ch8"]),
]
scenes = []
for i, (sid, beat, nar, zh, en, cues, kws, src) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for c in cues: assert c[1] in nar, (sid, c)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": nar.replace("矽", "夕"),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}}
    if i < len(S) - 1: sc["pauseAfter"] = 0.7
    scenes.append(sc)
scenes[0]["props"]["hook"] = {"kicker": "接離子佈植", "title": "要洗50次以上？", "size": 120, "top": 236}
scenes.append({"id": "s12", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "氧化與熱處理", "trail": ["氧化", "退火", "熱處理"], "at": "s11:kw-8", "comment": "清洗", "logoAnim": "transparent"}}})
lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": True, "note": "查證截至 2026/11/20", "noteAlways": True}
levels = [lv("tool", "單片清洗機", "SINGLE-WAFER CLEANER", "3 m", "1 m"), lv("wafer", "晶圓", "WAFER", "30 cm", "10 cm"), lv("surface", "表面剖面", "SURFACE CROSS-SECTION", "200 nm", "50 nm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-clean", "title": "清洗：先進晶片為什麼要洗五十次以上（科技透明圈）", "asOf": "2026/11/20", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-3.8-flash-tts", "styleText": STYLE,
                 "_說明_金手指": "2026-11-20 Andy：旁白金手指（docs/prompts/tech-旁白金手指.md），Style 原文一字不改",
                 "styleMode": "profile", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
                 "_說明": "念稿：docs/prompts/tech-clean-旁白.txt；整篇 1 次請求（TTS_NO_RETRY=1）"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["晶片要洗", "五十次以上"], "sub": "清洗", "frame": 40}, "sample": False, "scenes": scenes}
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
