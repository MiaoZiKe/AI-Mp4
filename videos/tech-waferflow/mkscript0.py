import json, sys
sys.path.insert(0,'/home/user/ai-mp4/videos/tech-waferflow')
from narr import S
sc=[]
for i,b,p,t,zh,en,kw,cues in S:
    assert len(zh)==len(en),i
    for _,c in cues: assert c in t,(i,c)
    sc.append({"id":i,"beat":b,"para":p,"narration":t,"tts":t,"subtitle":{"zh":"\n".join(zh),"en":" | ".join(en)},"keywords":kw,"cues":[{"id":a,"text":c} for a,c in cues],"component":"ThreeScene","props":{},"sources":[]})
sc.append({"id":"s12","beat":"end","silent":True,"durationSec":3.2,"subtitle":{"zh":"","en":""},"keywords":[],"cues":[],"component":"ThreeScene","props":{},"sources":[]})
json.dump({"slug":"tech-waferflow","title":"一片晶圓要經過哪些流程（科技透明圈 第 11 支）","asOf":"2026/11/25","styleVersion":3,"stage":"three","channel":{"name":"科技透明圈","tag":"放大來看","slogan":"一支講透一件事"},"hudSkin":"light",
 "voice":{"voiceName":"Iapetus","model":"gemini-2.5-flash-preview-tts","mode":"take","languageCode":"cmn-TW","profile":"tech-b"},"sample":False,"scenes":sc},open('/home/user/ai-mp4/videos/tech-waferflow/script.json','w'),ensure_ascii=False,indent=1)
