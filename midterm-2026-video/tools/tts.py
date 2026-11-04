"""Generate one wav per narration segment (Kokoro zm_yunjian via sherpa-onnx), trim silence, write audio/segments.json."""
import json, os, sys, numpy as np, soundfile as sf, sherpa_onnx
M=os.environ.get('KOKORO_DIR','/tmp/claude-0/tts/kokoro-multi-lang-v1_0/')
s=json.load(open('script.json')); v=s['meta']['voice']
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
  model=M+'model.onnx',voices=M+'voices.bin',tokens=M+'tokens.txt',data_dir=M+'espeak-ng-data',dict_dir=M+'dict',
  lexicon=M+'lexicon-us-en.txt,'+M+'lexicon-zh.txt'),num_threads=4),
  rule_fsts=M+'date-zh.fst,'+M+'phone-zh.fst,'+M+'number-zh.fst',max_num_sentences=2)
tts=sherpa_onnx.OfflineTts(cfg)
os.makedirs('audio/seg',exist_ok=True); out=[]
for si,sc in enumerate(s['scenes']):
    for gi,g in enumerate(sc['segments']):
        a=tts.generate(g['tts'],sid=v['sid'],speed=v['speed'])
        x=np.array(a.samples,dtype=np.float32); sr=a.sample_rate
        env=np.convolve(np.abs(x),np.ones(240)/240,'same'); idx=np.where(env>0.01)[0]
        x=x[max(0,idx[0]-480):min(len(x),idx[-1]+960)]
        p=f'audio/seg/s{si}_{gi}.wav'; sf.write(p,x,sr)
        out.append({'scene':si,'seg':gi,'file':p,'dur':round(len(x)/sr,3),'sr':sr})
        print(p,out[-1]['dur'])
json.dump(out,open('audio/segments.json','w'),indent=1)
