import sherpa_onnx as so, soundfile as sf, sys, time
M="models/"; OUT=sys.argv[1]
txt="美國選完了，這跟你的股票有什麼關係？其實，參議院民主黨至少拿下五十四席。重點來了——國會換人，總統做事就要看國會臉色。"
def kok():
    d=M+"kokoro-multi-lang-v1_1/"
    c=so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(kokoro=so.OfflineTtsKokoroModelConfig(model=d+"model.onnx",voices=d+"voices.bin",tokens=d+"tokens.txt",data_dir=d+"espeak-ng-data",dict_dir=d+"dict",lexicon=d+"lexicon-us-en.txt,"+d+"lexicon-zh.txt"),num_threads=4),rule_fsts=d+"date-zh.fst,"+d+"phone-zh.fst,"+d+"number-zh.fst")
    return so.OfflineTts(c)
def mel():
    d=M+"vits-melo-tts-zh_en/"
    c=so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(vits=so.OfflineTtsVitsModelConfig(model=d+"model.onnx",lexicon=d+"lexicon.txt",tokens=d+"tokens.txt",dict_dir=d+"dict"),num_threads=4),rule_fsts=d+"date.fst,"+d+"phone.fst,"+d+"number.fst,"+d+"new_heteronym.fst")
    return so.OfflineTts(c)
def mat():
    d=M+"matcha-icefall-zh-baker/"
    c=so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(matcha=so.OfflineTtsMatchaModelConfig(acoustic_model=d+"model-steps-3.onnx",vocoder=M+"vocos-22khz-univ.onnx",lexicon=d+"lexicon.txt",tokens=d+"tokens.txt",dict_dir=d+"dict"),num_threads=4),rule_fsts=d+"phone.fst,"+d+"date.fst,"+d+"number.fst")
    return so.OfflineTts(c)
k=kok(); print("kokoro speakers",k.num_speakers)
for sid in [3,8,15,30,45,50,60,80]:
    a=k.generate(txt,sid=sid,speed=1.0); sf.write(f"{OUT}/kok_{sid}.wav",a.samples,a.sample_rate); print(sid,len(a.samples)/a.sample_rate)
for name,f in [("melo",mel),("matcha",mat)]:
    t=f(); a=t.generate(txt,sid=0,speed=1.0); sf.write(f"{OUT}/{name}.wav",a.samples,a.sample_rate); print(name,len(a.samples)/a.sample_rate)
