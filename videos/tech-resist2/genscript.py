"""tech-resist2 腳本產生器：python3 videos/tech-resist2/genscript.py → script.json
光阻-2：塗上去、洗出來的機器（科技透明圈 系列「代工的供應商」第 6 集；上一集光阻-1：光阻是什麼；下一集設備五大-1：ASML）。
只寫前製資料（旁白、cue、字幕、hook、片尾卡、hud、voice）；3D 動作（zoom/shot/shift/run/kin/labels/overlay）由 genmodel.py 併進來。"""
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# (id, beat, 旁白, 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources)
S = [
("s1", "hook",
 "光阻是誰塗上去的？是黏在曝光機旁邊的這台機器。",
 ["光阻是誰塗上去的？", "是黏在曝光機旁邊的", "這台機器"],
 ["Who coats the photoresist?", "A machine bolted to the scanner:", "this one."],
 [("who", "誰塗上去"), ("stick", "黏在曝光機旁邊"), ("this", "這台機器")],
 ["光阻", "曝光機"], ["EPFL CMi；USPTO 6770424"]),
("s2", "mechanism",
 "它叫塗佈顯影機，晶圓進出曝光機，都要經過它。",
 ["它叫塗佈顯影機", "晶圓進出曝光機", "都要經過它"],
 ["It's the coater/developer, or track.", "Wafers going into and out of the scanner", "all pass through it."],
 [("name", "塗佈顯影機"), ("inout", "進出曝光機"), ("pass", "都要經過它")],
 ["塗佈顯影機", "進出"], ["USPTO 6770424、7728953"]),
("s3", "mechanism",
 "先在晶圓中心滴一小灘光阻，再高速旋轉，甩成薄膜。",
 ["先在晶圓中心", "滴一小灘光阻", "再高速旋轉", "甩成薄膜"],
 ["First, a small puddle of resist", "drops onto the wafer's center,", "then it spins fast", "and flings it into a thin film."],
 [("center", "晶圓中心"), ("drop", "滴一小灘光阻"), ("spin", "高速旋轉"), ("film", "甩成薄膜")],
 ["滴", "旋轉", "薄膜"], ["USPTO 8465901；BYU Cleanroom"]),
("s4", "mechanism",
 "轉越快，膜越薄，極紫外光用的光阻，只有幾十奈米厚。",
 ["轉越快，膜越薄", "極紫外光用的光阻", "只有幾十奈米厚"],
 ["Faster spin, thinner film.", "Resist for EUV", "is only tens of nanometers thick."],
 [("fast", "轉越快"), ("thin", "膜越薄"), ("euv", "極紫外光"), ("nm", "幾十奈米")],
 ["轉越快", "膜越薄", "幾十奈米"], ["LBL 旋塗講義；USPTO 6327793、8614047"]),
("s5", "mechanism",
 "接著放上加熱板烤一下，把溶劑趕走。",
 ["接著放上加熱板", "烤一下", "把溶劑趕走"],
 ["Next, onto a hot plate", "for a quick bake", "to drive off the solvent."],
 [("plate", "加熱板"), ("bake", "烤一下"), ("solv", "溶劑趕走")],
 ["加熱板", "溶劑"], ["USPTO 9298093"]),
("s6", "mechanism",
 "機械手臂把晶圓送進曝光機，照出看不見的圖案。",
 ["機械手臂", "把晶圓送進曝光機", "照出看不見的圖案"],
 ["A robot arm", "hands the wafer to the scanner,", "which exposes an invisible pattern."],
 [("arm", "機械手臂"), ("scan", "送進曝光機"), ("expose", "照出"), ("latent", "看不見的圖案")],
 ["機械手臂", "曝光機", "看不見"], ["USPTO 7728953；EPFL CMi"]),
("s7", "mechanism",
 "拿回來再烤一次，讓照到光的地方反應完全。",
 ["拿回來再烤一次", "讓照到光的地方", "反應完全"],
 ["Back it comes for a second bake,", "so the exposed areas", "finish reacting."],
 [("back", "拿回來"), ("peb", "再烤一次"), ("lit", "照到光的地方"), ("react", "反應完全")],
 ["再烤一次", "反應"], ["USPTO 9298093、8614047"]),
("s8", "mechanism",
 "接著噴顯影液，照到光的光阻溶掉，再沖水、甩乾、烤硬，圖案就出來了。",
 ["接著噴顯影液", "照到光的光阻溶掉", "再沖水、甩乾、烤硬", "圖案就出來了"],
 ["Then developer is sprayed on;", "the exposed resist dissolves.", "Rinse, spin dry, hard bake,", "and the pattern appears."],
 [("dev", "噴顯影液"), ("dissolve", "溶掉"), ("rinse", "沖水"), ("dry", "甩乾"), ("hard", "烤硬"), ("pattern", "圖案就出來了")],
 ["顯影液", "溶掉", "圖案"], ["USPTO 10281822；Semiconductor Digest；UW EE 527"]),
("s9", "twist",
 "為什麼要跟曝光機連在一起？因為曝光後的光阻怕等，放久了圖案會走樣。",
 ["為什麼要跟曝光機", "連在一起？", "因為曝光後的光阻怕等", "放久了圖案會走樣"],
 ["Why is it bolted", "to the scanner?", "Exposed resist can't wait;", "left too long, the pattern deforms."],
 [("why", "為什麼"), ("link", "連在一起"), ("wait", "光阻怕等"), ("bad", "圖案會走樣")],
 ["連在一起", "怕等", "走樣"], ["USPTO 6743564、6749988"]),
("s10", "payoff",
 "東京威力科創說，極紫外光用的這種機器，幾乎都是他們做的。",
 ["東京威力科創說", "極紫外光用的這種機器", "幾乎都是他們做的"],
 ["Tokyo Electron says", "nearly every EUV track", "is one of theirs."],
 [("tel", "東京威力科創"), ("euv", "極紫外光用的"), ("all", "幾乎都是")],
 ["東京威力科創", "極紫外光"], ["TEL 新聞稿 2020/9；Yahoo 股市 2026/9（公司說法）"]),
("s11", "payoff",
 "在台灣，它在台南設了維修中心，零組件也找在地廠商加工。",
 ["在台灣", "它在台南設了維修中心", "零組件也找在地廠商加工"],
 ["In Taiwan, it runs", "a repair center in Tainan,", "with parts machined by local suppliers."],
 [("tw", "在台灣"), ("tainan", "台南"), ("repair", "維修中心"), ("parts", "零組件")],
 ["台南", "維修中心", "零組件"], ["科技新報 2024/12/3；1111 新聞 2022（公司說法）"]),
("s12", "cta",
 "塗得再均勻，圖案準不準，還是看曝光機，下一集看艾司摩爾。留言顯影，拿完整資料。",
 ["塗得再均勻", "圖案準不準，還是看曝光機", "下一集看艾司摩爾", "留言顯影，拿完整資料"],
 ["However even the coat,", "pattern accuracy comes down to the scanner.", "Next: ASML.", "Comment \"顯影\" for the full notes."],
 [("even", "塗得再均勻"), ("acc", "準不準"), ("scan", "看曝光機"), ("next", "艾司摩爾"), ("kw", "留言顯影")],
 ["曝光機", "艾司摩爾"], ["示意動畫，不是量測"]),
]
# 念稿替換：沒有「矽」；「艾司摩爾」照寫。
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
scenes[0]["props"]["hook"] = {"kicker": "代工的供應商 6", "title": "光阻誰塗的？", "size": 120, "top": 236}
# 11/24 審片必改 3：片尾卡不再提早到 s12:kw-8（會蓋掉「留言顯影」那句字幕、出處與下一集卡）；改成 s13 開始才蓋上（s13 3.2 秒＝96 幀 ≥ 落定 64＋停 30）
scenes.append({"id": "s13", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene", "sources": [],
               "props": {"endCard": {"next": "設備五大-1 ASML", "trail": ["曝光機"], "comment": "顯影", "logoAnim": "transparent"}}})
lv = lambda i, l, e, f, r: {"id": i, "label": l, "en": e, "field": f, "ruler": r, "art": "none", "readout": True, "note": "查證截至 2026/11/23", "noteAlways": True}
levels = [lv("bay", "黃光區", "LITHO BAY", "12 m", "2 m"), lv("tool", "塗佈顯影機", "COATER / DEVELOPER", "4 m", "1 m"),
          lv("module", "模組", "MODULE", "60 cm", "10 cm")]
levels[0]["handoff3D"] = True
out = {"slug": "tech-resist2", "title": "光阻-2：塗上去、洗出來的機器（科技透明圈）", "asOf": "2026/11/23", "styleVersion": 3, "stage": "three",
       "channel": {"name": "科技透明圈", "tag": "代工的供應商", "slogan": "一支講透一件事"}, "hudSkin": "light",
       "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
                 "_說明": "旁白金手指（2026/11/21 Andy 定案，docs/prompts/tech-旁白金手指.md）：2.5＋Iapetus＋說明 B；整篇 1 次請求（TTS_NO_RETRY=1）。本輪不配音（等通知）"},
       "hud": {"levels": levels, "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
       "cover": {"title": ["光阻", "誰塗上去的"], "sub": "光阻-2：塗佈顯影機", "frame": 40}, "sample": False, "scenes": scenes}
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
