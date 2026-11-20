"""tech-implant 腳本產生器：python3 videos/tech-implant/genscript.py → script.json
只寫前製資料（旁白、cue、字幕、hook、片尾卡、hud）；3D 動作（zoom/shot/shift/run/labels/overlay）由 Opus 建模時依 visual-spec.md 補。"""
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# (id, beat, para, 旁白, 念稿tts(None=同旁白), 中文字幕行, 英文字幕行, cues[(id,文字)], keywords, sources, pauseAfter)
S = [
("s1","hook",1,
 "上一支量完，表面平，膜厚也對。但這片矽還不會導電，所以把離子打進去，每秒飛一千三百公里。",
 "上一支量完，表面平，膜厚也對。但這片夕還不會導電，所以把離子打進去，每秒飛一千三百公里。",
 ["上一支量完","表面平，膜厚也對","但這片矽還不會導電","所以把離子打進去","每秒飛一千三百公里"],
 ["Last time we measured:","the surface is flat, the film is right.","But this silicon still can't conduct,","so we shoot ions into it,","at 1,300 km per second."],
 [("prev","上一支量完"),("ok","表面平"),("no","還不會導電"),("shoot","把離子打進去"),("speed","每秒飛一千三百公里")],
 ["導電","離子","一千三百公里"],["速度＝v=√(2E/m) 計算，100 keV 硼離子（示意舉例）"],0.7),
("s2","mechanism",2,
 "純矽導電很差。打進磷多出電子，叫N型；打進硼留下電洞，叫P型。",
 "純夕導電很差。打進磷多出電子，叫恩型；打進硼留下電洞，叫皮型。",
 ["純矽導電很差","打進磷多出電子","叫N型","打進硼留下電洞","叫P型"],
 ["Pure silicon barely conducts.","Phosphorus adds electrons,","called N-type.","Boron leaves holes,","called P-type."],
 [("pure","純矽導電很差"),("ph","打進磷"),("ntype","叫N型"),("bo","打進硼"),("hole","留下電洞"),("ptype","叫P型")],
 ["磷","硼","N型","P型"],["NTU 半導體製程講義；摻雜通則"],0.7),
("s3","mechanism",3,
 "光阻先遮住不要打的地方。離子一路飛過離子源、加速管、分析磁鐵、終端站。",
 "光阻先遮住不要打的地方。離子一路飛過離子源、加速管、分析磁鐵、終端站。",
 ["光阻先遮住","不要打的地方","離子一路飛過","離子源、加速管","分析磁鐵、終端站"],
 ["Photoresist first covers the spots to skip.","Ions fly through the beam line:","ion source, accelerator tube,","analyzer magnet, end station."],
 [("mask","光阻先遮住"),("line","離子一路飛過"),("src","離子源"),("acc","加速管"),("mag","分析磁鐵"),("end","終端站")],
 ["光阻","離子源","加速管","終端站"],["uptogo 離子佈植；USPTO 6191012；光阻遮罩通則"],0.7),
("s4","mechanism",4,
 "離子源把氣體變成電漿。磷用磷化氫，硼用三氟化硼，再用電場把離子拉出來。",
 None,
 ["離子源把氣體","變成電漿","磷用磷化氫","硼用三氟化硼","再用電場把離子拉出來"],
 ["The ion source turns gas into plasma.","Phosphine for phosphorus,","boron trifluoride for boron,","then an electric field pulls the ions out."],
 [("gas","把氣體"),("plasma","變成電漿"),("ph3","磷化氫"),("bf3","三氟化硼"),("pull","把離子拉出來")],
 ["電漿","磷化氫","三氟化硼"],["uptogo；USPTO 6191012（電子撞擊氣體分子產生離子）"],0.7),
("s5","mechanism",5,
 "加速管一環一環加電壓，離子越跑越快。十萬電子伏特的硼離子，每秒約一千三百公里。",
 None,
 ["加速管一環一環加電壓","離子越跑越快","十萬電子伏特的硼離子","每秒約一千三百公里"],
 ["The accelerator tube adds voltage ring by ring,","so ions keep getting faster.","A 100 keV boron ion","moves about 1,300 km per second."],
 [("ring","一環一環加電壓"),("fast","越跑越快"),("kev","十萬電子伏特"),("v","每秒約一千三百公里")],
 ["加速管","十萬電子伏特","一千三百公里"],["USPTO 6191012；速度 v=√(2E/m) 計算（示意舉例）"],0.7),
("s6","twist",6,
 "但離子源裡什麼都有。分析磁鐵讓離子轉彎，太重太輕的轉不過去，撞牆被擋掉，只剩對的過關。",
 None,
 ["但離子源裡什麼都有","分析磁鐵讓離子轉彎","太重太輕的轉不過去","撞牆被擋掉","只剩對的過關"],
 ["But the source makes all kinds of ions.","The analyzer magnet bends the beam;","too heavy or too light can't turn,","they hit the wall and stop,","and only the right ones pass."],
 [("all","什麼都有"),("bend","讓離子轉彎"),("miss","轉不過去"),("wall","撞牆被擋掉"),("pass","只剩對的過關")],
 ["分析磁鐵","太重","太輕"],["uptogo；NTU 講義（以質量與電荷比分選）"],0.7),
("s7","mechanism",7,
 "對的離子進終端站。射束左右掃，晶圓上下動，每一點打進的量才一樣。",
 None,
 ["對的離子進終端站","射束左右掃","晶圓上下動","每一點","打進的量才一樣"],
 ["The right ions enter the end station.","The beam sweeps side to side,","the wafer moves up and down,","so every point","gets the same dose."],
 [("enter","進終端站"),("sweep","射束左右掃"),("move","晶圓上下動"),("every","每一點"),("same","打進的量才一樣")],
 ["終端站","左右掃","上下動"],["機械式掃描通則（射束＋載台）；Berkeley EE143 離子佈植講義"],0.7),
("s8","payoff",8,
 "離子打進矽，一路撞一路慢，停在某個深度。能量決定多深，打多久決定多濃。",
 None,
 ["離子打進矽","一路撞一路慢","停在某個深度","能量決定多深","打多久決定多濃"],
 ["Ions drive into silicon,","slowing with every collision,","and stop at a certain depth.","Energy sets how deep,","dose sets how dense."],
 [("in","打進矽"),("slow","一路撞一路慢"),("stop","停在某個深度"),("energy","能量決定多深"),("dose","打多久決定多濃")],
 ["某個深度","能量","多濃"],["UW ECE528 Ch8；Berkeley EE143（示意）"],0.7),
("s9","payoff",9,
 "機台有應用材料和亞舍立，植入氣體有台灣的兆捷。",
 None,
 ["機台有應用材料和亞舍立","植入氣體有台灣的兆捷"],
 ["Tools: Applied Materials and Axcelis.","Implant gases: Taiwan's Jmax."],
 [("am","應用材料"),("ax","亞舍立"),("gas","植入氣體"),("jc","兆捷")],
 ["應用材料","亞舍立","兆捷"],["市場研究摘要；聯合報、經濟日報報導"],0.7),
("s10","cta",10,
 "這樣矽就有了導電的區域。但光阻被打到焦硬，表面也髒，所以下一支，看清洗。留言離子，看完整解說。",
 "這樣夕就有了導電的區域。但光阻被打到焦硬，表面也髒，所以下一支，看清洗。留言離子，看完整解說。",
 ["這樣矽就有了","導電的區域","但光阻被打到焦硬","表面也髒","所以下一支","看清洗","留言離子","看完整解說"],
 ["So silicon now has","its conductive zones.","But the resist is baked hard,","and the surface is dirty,","so next:","cleaning.","Comment \"離子\"","for the full notes."],
 [("so","這樣矽就有了"),("zone","導電的區域"),("hard","打到焦硬"),("dirty","表面也髒"),("next","下一支"),("kw","留言離子")],
 ["導電","焦硬","清洗","離子"],["長庚大學論文摘要；US 5503964"],None),
]
scenes=[]
for sid,beat,para,nar,tts,zh,en,cues,kws,src,pa in S:
    sc={"id":sid,"beat":beat,"para":para,"narration":nar,"tts":(tts or nar).replace("矽","夕"),
        "subtitle":{"zh":"\n".join(zh),"en":" | ".join(en)},
        "keywords":kws,"cues":[{"id":i,"text":t} for i,t in cues],
        "component":"ThreeScene","sources":src,"props":{}}
    if pa is not None: sc["pauseAfter"]=pa
    scenes.append(sc)
scenes[0]["props"]["hook"]={"kicker":"接量測｜怎麼導電？","title":"離子每秒飛1,300公里","size":120,"top":236}
scenes[-1]["props"]["_endCard說明"]="片尾卡在 s11（silent）"
scenes.append({"id":"s11","beat":"end","silent":True,"durationSec":3.2,"subtitle":{"zh":"","en":""},"keywords":[],"cues":[],"component":"ThreeScene","sources":[],
 "props":{"endCard":{"next":"清洗","trail":["清洗","光阻","殘留"],"at":"s10:kw-8","comment":"離子","logoAnim":"transparent"}}})
lv=lambda i,l,e,f,r:{"id":i,"label":l,"en":e,"field":f,"ruler":r,"art":"none","readout":True,"note":"查證截至 2026/11/20","noteAlways":True}
levels=[lv("tool","離子佈植機","ION IMPLANTER","10 m","1 m"),lv("magnet","分析磁鐵","ANALYZER MAGNET","1 m","30 cm"),lv("wafer","晶圓剖面","WAFER CROSS-SECTION","100 nm","10 nm")]
levels[0]["handoff3D"]=True
out={"slug":"tech-implant","title":"離子佈植：把離子打進矽，讓它能導電（科技透明圈）","asOf":"2026/11/20","styleVersion":3,"stage":"three",
 "channel":{"name":"科技透明圈","tag":"放大來看","slogan":"一支講透一件事"},"hudSkin":"light",
 "voice":{"voiceName":"Iapetus","model":"gemini-2.5-flash-preview-tts","mode":"take","languageCode":"cmn-TW","profile":"tech-b","_說明":"念稿：docs/prompts/tech-implant-旁白.txt；整篇 1 次請求"},
 "hud":{"levels":levels,"theme":"dark","schematic":{"text":"Schematic – not to scale","zh":"示意圖，非實際比例"},"maxLabels":4,"smallPx":30,"layout":"fill","scanBand":0.3},
 "cover":{"title":["打進離子","矽才導電"],"sub":"離子佈植","frame":40},"sample":False,"scenes":scenes}
json.dump(out,open(os.path.join(HERE,"script.json"),"w"),ensure_ascii=False,indent=1)
# 念稿檢查
bad=[]
for s in scenes:
    t=s.get("tts") or ""
    if "矽" in t: bad.append((s["id"],"矽"))
    if "欸" in t: bad.append((s["id"],"欸"))
    for sent in re.split(r"[。？！]",t):
        if sent and re.match(r"[A-Za-z]",sent): bad.append((s["id"],"英文開頭"))
    if re.search(r"[A-Za-z0-9]",t): bad.append((s["id"],"英數字"))
n=sum(len(re.sub(r"[，。？！、；：\s]","",s.get("tts") or "")) for s in scenes)
print("念稿字數",n,"問題",bad)
open(os.path.join(HERE,"_tts.txt"),"w").write("\n\n".join(s["tts"] for s in scenes if s.get("tts")))
