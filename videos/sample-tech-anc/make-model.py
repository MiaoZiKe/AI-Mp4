# 從 videos/bake-a/model.json 產生這支的 model.json（拿掉靜態波形層，加耳道層、標註點與運作動畫）。改完重跑：python3 videos/sample-tech-anc/make-model.py
import json, collections
R='/home/user/AI-Mp4/videos/'
m=json.load(open(R+'bake-a/model.json'), object_pairs_hook=collections.OrderedDict)
m['layers']=[l for l in m['layers'] if l['id'] not in ('noise','anti')]
m['layers'].insert(0, {"id":"ear","z":-2.4,"k":-3,"outline":[0.1,0.1,0,3.0]})
parts=[]
for p in m['parts']:
    if p['layer'] in ('noise','anti'): continue
    if p['id'] in ('outerMic','outerMicPort'):
        for nm,xy in (('A',[0.95,4.4]),('B',[-1.3,3.9])):
            q=dict(p); q['id']=p['id'].replace('outerMic','mic'+nm) ; q['at']=[xy]; parts.append(q)
        continue
    parts.append(p)
m['parts']=parts
for k in ('noiseWave','antiWave','noiseRim','antiRim','scope','scopeLine'): m['materials'].pop(k,None)
m['palette'].update({"signal":"#F5A623","quiet":"#1FB58A"})
H=[[1,1],[2,0.38],[3,0.2]]
m['anchors']={
 "mic":{"layer":"board","p":[0.95,4.4,0.3],"dx":190,"dy":-70},
 "chip":{"layer":"board","p":[-0.45,3.35,0.3],"dx":-170,"dy":-10},
 "speaker":{"layer":"driver","p":[1.6,3.0,0.15],"dx":190,"dy":40},
 "noiseSrc":{"layer":"shell","p":[-1.4,3.0,3.2],"dx":-150,"dy":-20},
 "chipMeter":{"layer":"board","p":[-0.9,2.9,0.3],"dx":-110,"dy":170},
 "antiOut":{"layer":"tip","p":[0.9,3.0,-2.2],"dx":170,"dy":30},
 "earNoise":{"layer":"ear","p":[-2.1,3.0,0.9],"dx":-50,"dy":-150},
 "earAnti":{"layer":"ear","p":[2.1,3.0,0.9],"dx":30,"dy":-150},
 "earSum":{"layer":"ear","p":[1.4,3.0,-1.5],"dx":60,"dy":110},
 "earMeter":{"layer":"ear","p":[-1.6,3.0,-1.5],"dx":-40,"dy":120},
 # 2026/11/14 留存改版：結尾圈起來的回饋麥克風、衝突幕打叉的位置、開場蓋章指的位置
 "fbMic":{"layer":"driver","p":[-1.75,1.15,0.12],"dx":150,"dy":150},
 "earCross":{"layer":"ear","p":[0,3.0,-1.5],"dx":0,"dy":0},
 "head":{"layer":"shell","p":[0,3.0,0.6],"dx":0,"dy":0}}
m['actions']=collections.OrderedDict([
 ("noiseIn",{"type":"wave","from":{"layer":"shell","p":[0.5,3.4,4.4]},"dir":[0,0,-1],"reach":3.4,"count":4,"r0":1.5,"spread":0.25,"rate":0.5,"width":0.07,"color":"noise"}),
 ("micPulse",{"type":"pulse","parts":["micA","micAPort"],"color":"signal","freq":3,"glow":0.9,"halo":1.5}),
 ("sigIn",{"type":"flow","layer":"board","path":[[0.95,4.4,0.34],[0.5,4.4,0.34],[0.5,3.6,0.34],[0.2,3.6,0.34]],"n":3,"size":0.085,"rate":1.3,"color":"signal"}),
 ("chipPulse",{"type":"pulse","parts":["soc","socLid"],"color":"anti","freq":3.5,"glow":0.85,"halo":2.3}),
 ("mIn",{"type":"trace","hidden":True,"amp":0.5,"cycles":1.6,"rate":0.8,"harmonics":H,"color":"noise"}),
 ("mOut",{"type":"trace","hidden":True,"amp":0.5,"cycles":1.6,"rate":0.8,"harmonics":H,"invert":True,"color":"anti"}),
 ("chipScope",{"type":"meter","anchor":"chipMeter","kind":"wave","traces":["mIn","mOut"],"label":"算出相反","accent":"blue","w":500,"h":150}),
 ("sigOut",{"type":"flow","path":[{"layer":"board","p":[0.3,3.0,0.34]},{"layer":"board","p":[2.3,3.0,0.1]},{"layer":"driver","p":[2.38,3.0,0.05]}],"n":5,"size":0.2,"shape":"arrow","rate":0.75,"color":"anti"}),
 ("cone",{"type":"vibrate","parts":["drvDome","drvSurround","drvCoil"],"axis":[0,0,1],"amp":0.16,"freq":5}),
 ("antiWave",{"type":"wave","from":{"layer":"driver","p":[0,3.0,-0.4]},"dir":[0,0,-1],"reach":7.4,"count":5,"r0":1.25,"spread":0.04,"rate":0.3,"width":0.14,"color":"anti"}),
 ("tNoise",{"type":"trace","layer":"ear","from":[-2.8,3.0,0.9],"to":[2.8,3.0,0.9],"up":[0,0,1],"amp":0.75,"cycles":2.2,"rate":0.8,"harmonics":H,"color":"noise","radius":0.09}),
 ("tAnti",{"type":"trace","layer":"ear","from":[-2.8,3.0,0.9],"to":[2.8,3.0,0.9],"up":[0,0,1],"amp":0.75,"cycles":2.2,"rate":0.8,"harmonics":H,"invert":True,"color":"anti","axisLine":False,"radius":0.09}),
 ("tSum",{"type":"sum","layer":"ear","of":["tNoise","tAnti"],"from":[-2.8,3.0,-1.5],"to":[2.8,3.0,-1.5],"up":[0,0,1],"build":26,"buildDelay":8,"color":"quiet","radius":0.1}),
 ("earLevel",{"type":"meter","anchor":"earMeter","kind":"bar","source":"tSum","label":"耳內音量","accent":"mint","w":280}),
 # ── 2026/11/14 留存改版新增 ──
 # 開場（耳機立著）：噪音圈從外側撞過來、耳機自己往耳塞那一側放出聲音
 ("hookNoise",{"type":"wave","from":{"layer":"shell","p":[0,3.0,7.6]},"dir":[0,0,-1],"reach":6.4,"count":4,"r0":3.3,"spread":-0.06,"rate":0.7,"width":0.07,"color":"noise"}),
 ("hookAnti",{"type":"wave","from":{"layer":"tip","p":[0,3.0,-1.6]},"dir":[0,0,-1],"reach":4.6,"count":4,"r0":0.9,"spread":0.34,"rate":0.75,"width":0.1,"color":"anti"}),
 # 衝突：變化快的聲音（示意），相反的波慢了一點、對不準，加起來還是很大
 ("tVoice",{"type":"trace","layer":"ear","from":[-2.8,3.0,0.9],"to":[2.8,3.0,0.9],"up":[0,0,1],"amp":0.75,"cycles":3.6,"rate":1.5,"harmonics":[[1,1],[1.63,0.7],[2.31,0.5]],"color":"noise","radius":0.09}),
 ("tAntiV",{"type":"trace","layer":"ear","from":[-2.8,3.0,0.9],"to":[2.8,3.0,0.9],"up":[0,0,1],"amp":0.75,"cycles":3.6,"rate":1.5,"harmonics":[[1,1],[1.63,0.7],[2.31,0.5]],"invert":True,"phase":0.2,"color":"anti","axisLine":False,"radius":0.09}),
 ("tSumV",{"type":"sum","layer":"ear","of":["tVoice","tAntiV"],"from":[-2.8,3.0,-1.5],"to":[2.8,3.0,-1.5],"up":[0,0,1],"build":16,"buildDelay":6,"color":"noise","radius":0.1}),
 ("earLevelV",{"type":"meter","anchor":"earMeter","kind":"bar","source":"tSumV","label":"耳內音量","accent":"coral","w":280}),
])
m['pose']={"gap":2.2,"yawIso":0.22,"yaw0":-1.2}
m['camera']={"stand":{"d":40,"elev":5,"y":1.3},"explode":{"d":42,"elev":24,"y":1.9},"outro":{"d":2}}
m['fx']={"dpr":1.25,"srcPx":30}
m['name']="示意真無線耳機（單耳，非特定機型、沒有商標）：主動降噪運作示範"
# 緊湊輸出：每個零件一行
def dump(o):
    out=['{']
    ks=list(o.keys())
    for i,k in enumerate(ks):
        v=o[k]; c=',' if i<len(ks)-1 else ''
        if k in ('parts','layers'):
            out.append(f' "{k}": [\n'+',\n'.join('  '+json.dumps(x,ensure_ascii=False) for x in v)+'\n ]'+c)
        elif k in ('materials','anchors','actions','palette') :
            out.append(f' "{k}": {{\n'+',\n'.join(f'  "{a}": '+json.dumps(b,ensure_ascii=False) for a,b in v.items())+'\n }'+c)
        else: out.append(f' "{k}": '+json.dumps(v,ensure_ascii=False)+c)
    out.append('}')
    return '\n'.join(out)+'\n'
s=dump(m); json.loads(s)
open(R+'sample-tech-anc/model.json','w').write(s)
print(len(m['parts']),'parts')
