# 產生 videos/tech-metrology/script.json（前製版：旁白、字幕、cue、鉤子、片尾卡；3D 分鏡 props 由建模那一棒依 visual-spec.md 補）
import json
def cue(i, t): return {"id": i, "text": t}
def scene(i, beat, tts, zh, en, kw, cues, props, src, pause=0.7, subtitle_zh_text=None):
    assert len(zh) == len(en), (i, len(zh), len(en))
    for c in cues: assert c["text"] in tts, (i, c)
    s = {"id": i, "beat": beat, "para": int(i[1:]), "narration": tts, "tts": tts,
         "subtitle": {"zh": "\n".join(zh), "en": " | ".join(en)}, "keywords": kw, "cues": cues,
         "component": "ThreeScene", "props": props, "sources": src}
    if pause: s["pauseAfter"] = pause
    return s
S = []
S.append(scene("s1", "hook", "磨平之後，還要量量看到底平不平。兩層線路疊起來，只差兩奈米左右，這要怎麼量？",
  ["磨平之後", "還要量量看到底平不平", "兩層線路疊起來", "只差兩奈米左右", "這要怎麼量？"],
  ["After polishing,", "we still check whether it is really flat.", "Stacked, two layers of wiring", "are off by only about 2 nm.", "So how do we measure that?"],
  ["量量看", "兩奈米", "怎麼量"],
  [cue("flat", "磨平之後"), cue("check", "量量看到底平不平"), cue("two", "兩層線路疊起來"), cue("nm", "只差兩奈米左右"), cue("ask", "這要怎麼量")],
  {"hook": {"kicker": "接上一支｜磨平之後", "title": "兩奈米都不能歪", "size": 120, "top": 236}},
  ["上一支：化學機械研磨；疊對 2～2.5 奈米：ASML 研究員 Mulkens 談話，SEMI Engineering"]))
S.append(scene("s2", "you", "晶圓一層層做，前面歪了，後面全白做，所以每一步都要量，還要找缺陷。",
  ["晶圓一層層做", "前面歪了", "後面全白做", "所以每一步都要量", "還要找缺陷"],
  ["Wafers are built layer by layer.", "If an early step drifts,", "everything after is wasted,", "so every step gets measured,", "and checked for defects."],
  ["一層層", "每一步", "缺陷"],
  [cue("layer", "一層層做"), cue("early", "前面歪了"), cue("waste", "後面全白做"), cue("every", "每一步都要量"), cue("defect", "還要找缺陷")],
  {}, ["製程通則"]))
S.append(scene("s3", "mechanism", "先量厚度。光打在膜上，表面和底部各反射一次，兩道光疊起來，亮暗不同，就算得出厚度。",
  ["先量厚度", "光打在膜上", "表面和底部各反射一次", "兩道光疊起來", "亮暗不同", "就算得出厚度"],
  ["First, thickness.", "Light hits the film,", "reflecting once off the top and once off the bottom.", "The two beams overlap,", "bright or dark depending on thickness,", "and that gives the thickness."],
  ["厚度", "各反射一次", "亮暗"],
  [cue("thick", "先量厚度"), cue("hit", "光打在膜上"), cue("refl", "各反射一次"), cue("overlap", "兩道光疊起來"), cue("bd", "亮暗不同"), cue("calc", "算得出厚度")],
  {}, ["反射光干涉測膜厚（通則）：halbleiter.org 膜厚量測、Penn State 橢圓偏光說明"]))
S.append(scene("s4", "mechanism", "再量線寬。電子束掃過去，從跑出來的電子，看出線的邊緣，就量得出寬度。",
  ["再量線寬", "電子束掃過去", "從跑出來的電子", "看出線的邊緣", "就量得出寬度"],
  ["Next, line width.", "An electron beam scans across,", "and from the electrons that come out,", "it finds the edges of each line,", "so the width can be measured."],
  ["線寬", "電子束", "邊緣"],
  [cue("cd", "再量線寬"), cue("scan", "電子束掃過去"), cue("el", "跑出來的電子"), cue("edge", "線的邊緣"), cue("wid", "量得出寬度")],
  {}, ["CD-SEM 原理（通則）；CD-SEM 屬量測設備：SemiconductorX"]))
S.append(scene("s5", "mechanism", "接著量疊對。兩層各刻一組紋路，光打上去，兩邊反射的亮度不同，差多少，就是歪多少。",
  ["接著量疊對", "兩層各刻一組紋路", "光打上去", "兩邊反射的亮度不同", "差多少", "就是歪多少"],
  ["Then, overlay.", "Each layer carries its own set of lines.", "Light hits them,", "and the two sides reflect different brightness.", "The difference", "is how far off they are."],
  ["疊對", "紋路", "歪多少"],
  [cue("ov", "接著量疊對"), cue("two", "兩層各刻一組紋路"), cue("light", "光打上去"), cue("diff", "兩邊反射的亮度不同"), cue("how", "差多少"), cue("off", "就是歪多少")],
  {}, ["繞射式疊對量測（DBO）：+1、−1 階繞射光強度差，SPIE 論文摘要；ASML YieldStar 產品頁"]))
S.append(scene("s6", "twist", "最後找缺陷。光學掃得快但看不細，電子束看得細卻很慢，所以先用光學找出可疑處，再用電子束看清楚。",
  ["最後找缺陷", "光學掃得快但看不細", "電子束看得細卻很慢", "所以先用光學找出可疑處", "再用電子束看清楚"],
  ["Last, defects.", "Optical scans fast but not finely.", "E-beam sees fine detail but is slow.", "So optical flags the suspects first,", "then the e-beam takes a close look."],
  ["缺陷", "光學", "電子束"],
  [cue("def", "最後找缺陷"), cue("fast", "光學掃得快"), cue("fine", "電子束看得細"), cue("slow", "卻很慢"), cue("so", "先用光學找出可疑處"), cue("look", "再用電子束看清楚")],
  {}, ["光學：廣覆蓋、速度快；電子束：靈敏度高、產能低：SemiconductorX、Averroes 說明；兩段式流程（光學掃描→電子束複檢）為業界通則"]))
S.append(scene("s7", "payoff", "量到歪了，數字送回曝光機修正；量到缺陷，就把那片挑出來。",
  ["量到歪了", "數字送回曝光機修正", "量到缺陷", "就把那片挑出來"],
  ["If it is off,", "the numbers go back to the scanner to correct.", "If there is a defect,", "that wafer is pulled out."],
  ["送回", "修正", "挑出來"],
  [cue("off", "量到歪了"), cue("back", "數字送回曝光機修正"), cue("bad", "量到缺陷"), cue("pull", "挑出來")],
  {}, ["疊對量測資料回饋曝光機（掃描機）：SEMI Engineering《How Overlay Keeps Pace With EUV Patterning》；KLA 資料分析頁"]))
S.append(scene("s8", "payoff", "疊對有科磊和艾司摩爾，電子束有應用材料和日立先端科技，台灣有華洋精機和牧德。",
  ["疊對有科磊和艾司摩爾", "電子束有應用材料", "和日立先端科技", "台灣有華洋精機和牧德"],
  ["Overlay: KLA and ASML.", "E-beam: Applied Materials", "and Hitachi High-Tech.", "In Taiwan: Hwa Yang Precision and MAK Tech."],
  ["科磊", "應用材料", "華洋精機", "牧德"],
  [cue("kla", "科磊"), cue("asml", "艾司摩爾"), cue("am", "應用材料"), cue("hit", "日立先端科技"), cue("tw", "台灣有"), cue("hy", "華洋精機"), cue("mak", "牧德")],
  {}, ["研究 research.md 公司表：科磊／艾司摩爾（疊對）、應用材料／日立先端科技（電子束）、華洋精機（光罩微粒檢測）、牧德（晶圓外觀檢查）"]))
S.append(scene("s9", "cta", "量過沒問題，才放行。接下來，要用離子把雜質打進夕裡，才控制得了導電。下一支，看離子佈植。留言量測，看完整解說。",
  ["量過沒問題", "才放行", "接下來", "要用離子把雜質打進矽裡", "才控制得了導電", "下一支", "看離子佈植", "留言量測", "看完整解說"],
  ["Once it checks out,", "it moves on.", "Next,", "ions drive impurities into the silicon", "to control how it conducts.", "Next up:", "ion implantation.", "Comment \"量測\"", "for the full notes."],
  ["放行", "離子佈植", "量測"],
  [cue("ok", "量過沒問題"), cue("go", "才放行"), cue("next", "接下來"), cue("ion", "用離子"), cue("imp", "雜質"), cue("cond", "控制得了導電"), cue("nx", "下一支"), cue("ii", "看離子佈植"), cue("kw", "留言量測"), cue("full", "看完整解說")],
  {}, ["離子佈植：下一支；系列表 series_plan.md"], pause=None))
S.append({"id": "s10", "beat": "end", "silent": True, "durationSec": 3.2, "subtitle": {"zh": "", "en": ""}, "keywords": [], "cues": [], "component": "ThreeScene",
  "props": {"endCard": {"next": "離子佈植", "trail": ["離子", "佈植", "導電"], "at": "s9:kw-8", "comment": "量測", "logoAnim": "transparent"}}, "sources": []})
NOTE = "查證截至 2026/11/20"
script = {
 "slug": "tech-metrology", "title": "量測與檢測：每做完一步，都要量一次（科技透明圈）", "asOf": "2026/11/20", "styleVersion": 3, "stage": "three",
 "channel": {"name": "科技透明圈", "tag": "放大來看", "slogan": "一支講透一件事"}, "hudSkin": "light",
 "voice": {"voiceName": "Iapetus", "model": "gemini-2.5-flash-preview-tts", "mode": "take", "languageCode": "cmn-TW", "profile": "tech-b",
           "_說明": "念稿：docs/prompts/tech-metrology-旁白.txt；整篇 1 次請求"},
 "hud": {"levels": [
   {"id": "tool", "label": "量測檢測機台", "en": "METROLOGY TOOL", "field": "3 m", "ruler": "1 m", "art": "none", "handoff3D": True, "readout": True, "note": NOTE, "noteAlways": True},
   {"id": "wafer", "label": "晶圓", "en": "WAFER", "field": "30 cm", "ruler": "10 cm", "art": "none", "readout": True, "note": NOTE, "noteAlways": True},
   {"id": "pattern", "label": "線路與膜層", "en": "PATTERN & FILM", "field": "300 nm", "ruler": "100 nm", "art": "none", "readout": True, "note": NOTE, "noteAlways": True}],
   "theme": "dark", "schematic": {"text": "Schematic – not to scale", "zh": "示意圖，非實際比例"}, "maxLabels": 4, "smallPx": 30, "layout": "fill", "scanBand": 0.3},
 "cover": {"title": ["每做完一步", "都要量一次"], "sub": "量測與檢測", "frame": 40},
 "sample": False, "scenes": S,
}
json.dump(script, open("/home/user/ai-mp4/videos/tech-metrology/script.json", "w"), ensure_ascii=False, indent=1)
print("ok", len(S), "字數", sum(len(s["tts"]) for s in S if "tts" in s))
