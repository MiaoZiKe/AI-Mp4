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
 "earMeter":{"layer":"ear","p":[-1.6,3.0,-1.5],"dx":-40,"dy":120}}
m['actions']=collections.OrderedDict([
 ("noiseIn",{"type":"wave","from":{"layer":"shell","p":[0.5,3.4,4.4]},"dir":[0,0,-1],"reach":3.4,"count":4,"r0":1.5,"spread":0.25,"rate":0.5,"width":0.07,"color":"noise"}),
 ("micPulse",{"type":"pulse","parts":["micA","micAPort"],"color":"signal","freq":3,"glow":0.9,"halo":1.5}),
 ("sigIn",{"type":"flow","layer":"board","path":[[0.95,4.4,0.34],[0.5,4.4,0.34],[0.5,3.6,0.34],[0.2,3.6,0.34]],"n":3,"size":0.085,"rate":1.3,"color":"signal"}),
 ("chipPulse",{"type":"pulse","parts":["soc","socLid"],"color":"anti","freq":3.5,"glow":0.85,"halo":2.3}),
 ("mIn",{"type":"trace","hidden":True,"amp":0.5,"cycles":1.6,"rate":0.8,"harmonics":H,"color":"noise"}),
 ("mOut",{"type":"trace","hidden":True,"amp":0.5,"cycles":1.6,"rate":0.8,"harmonics":H,"invert":True,"color":"anti"}),
 ("chipScope",{"type":"meter","anchor":"chipMeter","kind":"wave","traces":["mIn","mOut"],"label":"算出反相","accent":"blue","w":330}),
 ("sigOut",{"type":"flow","path":[{"layer":"board","p":[0.3,3.0,0.34]},{"layer":"board","p":[2.3,3.0,0.1]},{"layer":"driver","p":[2.38,3.0,0.05]}],"n":5,"size":0.2,"shape":"arrow","rate":0.75,"color":"anti"}),
 ("cone",{"type":"vibrate","parts":["drvDome","drvSurround","drvCoil"],"axis":[0,0,1],"amp":0.16,"freq":5}),
 ("antiWave",{"type":"wave","from":{"layer":"driver","p":[0,3.0,-0.4]},"dir":[0,0,-1],"reach":7.4,"count":5,"r0":1.25,"spread":0.04,"rate":0.3,"width":0.14,"color":"anti"}),
 ("tNoise",{"type":"trace","layer":"ear","from":[-2.8,3.0,0.9],"to":[2.8,3.0,0.9],"up":[0,0,1],"amp":0.75,"cycles":2.2,"rate":0.8,"harmonics":H,"color":"noise","radius":0.09}),
 ("tAnti",{"type":"trace","layer":"ear","from":[-2.8,3.0,0.9],"to":[2.8,3.0,0.9],"up":[0,0,1],"amp":0.75,"cycles":2.2,"rate":0.8,"harmonics":H,"invert":True,"color":"anti","axisLine":False,"radius":0.09}),
 ("tSum",{"type":"sum","layer":"ear","of":["tNoise","tAnti"],"from":[-2.8,3.0,-1.5],"to":[2.8,3.0,-1.5],"up":[0,0,1],"build":26,"buildDelay":8,"color":"quiet","radius":0.1}),
 ("earLevel",{"type":"meter","anchor":"earMeter","kind":"bar","source":"tSum","label":"耳內音量","accent":"mint","w":280}),
])
m['pose']={"gap":2.2,"yawIso":0.22}
m['camera']={"stand":{"d":40,"elev":5,"y":1.3},"explode":{"d":42,"elev":24,"y":1.9},"outro":{"d":2}}
m['fx']={"dpr":1.25}
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
