"""tech-resist1 腳本產生器：python3 videos/tech-resist1/genscript.py → script.json
光阻-1：照到光就會變的膠（科技透明圈 系列 2「代工的供應商」第 5 集；12/7（一）18:00 發；下一集光阻-2：塗佈顯影機）。
只寫前製資料（旁白、cue、字幕、hook、片尾卡、hud、voice）；3D 動作（zoom/shot/shift/run/labels/overlay）由 genmodel.py 併進來。"""
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook",
 "上集光罩送進了曝光機，光一打，圖案印在哪？印在一層膠上，它照到光就會變。",
 ["上集光罩送進了曝光機", "光一打，圖案印在哪？", "印在一層膠上", "它照到光就會變"],
 ["Last time the mask reached the scanner.", "Light hits. Where does the pattern land?", "On a layer of glue", "that changes when light hits it."],
 [("prev", "光罩送進了曝光機"), ("chip", "圖案印在哪"), ("glue", "一層膠"), ("light", "照到光"), ("change", "就會變")],
 ["晶片", "膠", "光"], ["Wevolver"]),
("s2", "mechanism",
 "這層膠叫光阻，是感光的高分子，薄薄塗在晶圓上。",
 ["這層膠叫光阻", "是感光的高分子", "薄薄塗在晶圓上"],
 ["It's called photoresist,", "a light-sensitive polymer,", "coated thinly on the wafer."],
 [("pr", "光阻"), ("poly", "感光的高分子"), ("coat", "薄薄塗在晶圓上")],
 ["光阻", "感光", "高分子"], ["EPFL CMi"]),
("s3", "mechanism",
 "光穿過光罩，照到的地方，分子會斷開、變質。",
 ["光穿過光罩", "照到的地方", "分子會斷開、變質"],
 ["Light shines through the mask;", "where it lands,", "molecules break and change."],
 [("mask", "光罩"), ("hit", "照到的地方"), ("break", "斷開"), ("alter", "變質")],
 ["光罩", "斷開", "變質"], ["Wevolver；EPFL CMi"]),
("s4", "mechanism",
 "正型光阻，變質的被顯影液洗掉，留下沒照到的。",
 ["正型光阻", "變質的被顯影液洗掉", "留下沒照到的"],
 ["Positive resist:", "developer washes the changed areas away,", "leaving the unexposed parts."],
 [("pos", "正型光阻"), ("dev", "顯影液"), ("wash", "洗掉"), ("keep", "留下沒照到的")],
 ["正型", "顯影液", "洗掉"], ["Wevolver；USPTO 11016386"]),
("s5", "contrast",
 "負型相反，照到的連成網，洗完反而留下。",
 ["負型相反", "照到的連成網", "洗完反而留下"],
 ["Negative resist is the reverse:", "exposed molecules link into a net", "and stay after the wash."],
 [("neg", "負型相反"), ("net", "連成網"), ("stay", "反而留下")],
 ["負型", "連成網", "留下"], ["Wevolver；EPFL CMi"]),
("s6", "twist",
 "但線越畫越細，光不夠用，就要化學放大型光阻。",
 ["但線越畫越細", "光不夠用", "就要化學放大型光阻"],
 ["But as lines shrink,", "there isn't enough light,", "so chemically amplified resist was born."],
 [("thin", "線越畫越細"), ("weak", "光不夠用"), ("car", "化學放大型光阻")],
 ["化學放大", "光阻"], ["IBM RJ10223；SPIE 5376"]),
("s7", "mechanism",
 "照到光，光酸產生劑放出一點酸。",
 ["照到光", "光酸產生劑", "放出一點酸"],
 ["When light hits,", "the photoacid generator", "releases a little acid."],
 [("hv", "照到光"), ("pag", "光酸產生劑"), ("acid", "一點酸")],
 ["光酸產生劑", "酸"], ["IBM RJ10223"]),
("s8", "mechanism",
 "再烘烤，一個酸能連續反應幾百次。",
 ["再烘烤", "一個酸", "能連續反應幾百次"],
 ["Then a bake:", "one acid molecule", "drives hundreds of reactions."],
 [("bake", "烘烤"), ("one", "一個酸"), ("chain", "連續反應"), ("hund", "幾百次")],
 ["烘烤", "幾百次"], ["IBM RJ10223"]),
("s9", "twist",
 "到了極紫外光，同樣能量，光子只剩十四分之一。",
 ["到了極紫外光", "同樣能量", "光子只剩十四分之一"],
 ["With EUV,", "at the same energy,", "you get just 1/14 the photons."],
 [("euv", "極紫外光"), ("same", "同樣能量"), ("frac", "十四分之一")],
 ["極紫外光", "十四分之一"], ["arXiv 2405.11717；USPTO 11940728"]),
("s10", "mechanism",
 "光子少，落點不均，線條會隨機斷掉、黏在一起。",
 ["光子少", "落點不均", "線條會隨機斷掉", "黏在一起"],
 ["Fewer photons,", "uneven hits:", "lines randomly break", "or bridge together."],
 [("few", "光子少"), ("uneven", "落點不均"), ("brk", "隨機斷掉"), ("brg", "黏在一起")],
 ["隨機", "斷掉", "黏在一起"], ["JM3 17(4)；SemiEngineering"]),
("s11", "mechanism",
 "所以業界在試吸光更強的金屬氧化物光阻。",
 ["所以業界在試", "吸光更強的", "金屬氧化物光阻"],
 ["So the industry is testing", "stronger-absorbing", "metal-oxide resists."],
 [("try", "業界在試"), ("abs", "吸光更強"), ("mor", "金屬氧化物光阻")],
 ["金屬氧化物光阻"], ["SemiEngineering；JSR 2025/9/16"]),
("s13", "payoff",
 "這些光阻以日本廠為主，捷時雅還找夥伴，在雲林合資蓋廠，最快 2028 年投產。",
 ["這些光阻以日本廠為主", "捷時雅還找夥伴", "在雲林合資蓋廠", "最快 2028 年投產"],
 ["These resists come mostly from Japan;", "JSR even teamed up with partners", "to build a plant in Yunlin, Taiwan,", "starting as early as 2028."],
 [("jp", "日本廠為主"), ("tw", "捷時雅還找夥伴"), ("yl", "雲林"), ("jv", "合資"), ("y28", "2028")],
 ["日本", "雲林", "合資", "2028"], ["日經 2026/5/5；Tom's Hardware"]),
("s14", "cta",
 "但膠要塗得又薄又平，下集看塗佈顯影機。留言光阻，拿完整資料。",
 ["但膠要塗得又薄又平", "下集看", "塗佈顯影機", "留言光阻", "拿完整資料"],
 ["But it must go on thin and flat.", "Next episode:", "the coater-developer.", "Comment \"光阻\"", "for the full notes."],
 [("ok", "膠要塗得"), ("flat", "又薄又平"), ("next", "下集"), ("track", "塗佈顯影機"), ("kw", "留言光阻")],
 ["塗佈顯影機"], []),
]
# 11/24：v1「最快二零二八年投產」疑似吞掉「年」（對齊 0.08 秒、字分數 0）→ 念稿改寫成不易吞字的說法，字幕不變
TTS = lambda t: t.replace("矽", "細").replace("最快 2028 年投產", "最快在二零二八年開始投產").replace(" 2028 ", "二零二八").replace("光罩", "光照").replace("上集", "上一集")  # 11/24 Andy：光罩念成光掃、上集念成喪集（scripts/three/tts-subst.json）
scenes = []
PAUSE = {"s1": 0.6, "s2": 0.4, "s3": 0.4, "s4": 0.4, "s5": 0.6, "s6": 0.4, "s7": 0.3, "s8": 0.6, "s9": 0.4, "s10": 0.4, "s11": 0.6, "s13": 0.6}
for i, (sid, beat, nar, zh, en, cues, kws, src) in enumerate(S):
    assert len(zh) == len(en), (sid, len(zh), len(en))
    for c in cues: assert c[1] in nar, (sid, c)
    for z in zh: assert len(z.replace(" ", "")) <= 14, (sid, z)
    sc = {"id": sid, "beat": beat, "para": i + 1, "narration": nar, "tts": TTS(nar),
          "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)},
          "keywords": kws, "cues": [{"id": a, "text": b} for a, b in cues],
          "component": "ThreeScene", "sources": src, "props": {}}
    if sid in PAUSE: sc["pauseAfter"] = PAUSE[sid]
    scenes.append(sc)
scenes[0]["props"]["hook"] = {"kicker": "接上集：光罩送進曝光機", "title": "圖案印在哪？", "size": 110, "top": 236}
scenes.append({"id": "s15", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "光阻-2 塗佈顯影機", "trail": ["塗佈顯影機"], "at": "s14:kw-8", "comment": "光阻", "logoAnim": "transparent"}}})
lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": True, "note": "查證截至 2026/11/23", "noteAlways": True}
levels = [lv("wafer", "晶圓", "WAFER", "30 cm", "10 cm"), lv("film", "光阻層剖面", "RESIST CROSS-SECTION", "2 µm", "500 nm"),
          lv("mol", "分子", "MOLECULES", "20 nm", "5 nm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-resist1", "prevEpisode": "光罩-2", "title": "光阻-1：照到光就會變的膠（科技透明圈）", "asOf": "2026/11/23", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
                 "_說明": "旁白金手指（2026/11/21 Andy 定案，docs/prompts/tech-旁白金手指.md）：2.5＋Iapetus＋說明 B；整篇 1 次請求（TTS_NO_RETRY=1）。本輪只做前段，不配音"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["照到光", "就會變的膠"], "sub": "光阻-1：正型、負型、化學放大", "frame": 40}, "sample": False, "scenes": scenes}
json.dump(out, open(os.path.join(HERE, "script.json"), "w"), ensure_ascii=False, indent=1)
bad = []
for s in scenes:
    t = s.get("tts") or ""
    for w in ("矽", "夕", "欸"):
        if w in t: bad.append((s["id"], w))
    if re.search(r"[A-Za-z0-9]", t): bad.append((s["id"], "英數字"))
n = sum(len(re.sub(r"[，。？！、；：\s]", "", s.get("tts") or "")) for s in scenes)
print("念稿字數", n, "問題", bad)
open(os.path.join(HERE, "_tts.txt"), "w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
