"""ASR helpers: whisper-small (sherpa-onnx) for transcript check, paraformer for per-char timestamps."""
import sherpa_onnx as so, soundfile as sf, numpy as np, sys
M="models/"
_w=_p=None
def load(path):
    a,sr=sf.read(path,dtype="float32")
    if a.ndim>1:a=a.mean(1)
    if sr!=16000:
        import math
        n=int(len(a)*16000/sr); a=np.interp(np.linspace(0,len(a)-1,n),np.arange(len(a)),a).astype("float32"); sr=16000
    return a,sr
def whisper(path):
    global _w
    if _w is None:
        d=M+"sherpa-onnx-whisper-small/"
        _w=so.OfflineRecognizer.from_whisper(encoder=d+"small-encoder.int8.onnx",decoder=d+"small-decoder.int8.onnx",tokens=d+"small-tokens.txt",language="zh",task="transcribe",num_threads=4)
    a,sr=load(path); out=[]
    # whisper handles <=30s windows
    step=25*sr
    for i in range(0,len(a),step):
        s=_w.create_stream(); s.accept_waveform(sr,a[i:i+step]); _w.decode_stream(s); out.append(s.result.text)
    return "".join(out)
def paraformer(path):
    global _p
    if _p is None:
        d=M+"sherpa-onnx-paraformer-zh-2024-03-09/"
        _p=so.OfflineRecognizer.from_paraformer(paraformer=d+"model.int8.onnx",tokens=d+"tokens.txt",num_threads=4)
    a,sr=load(path); s=_p.create_stream(); s.accept_waveform(sr,a); _p.decode_stream(s)
    r=s.result; return r.text, list(zip(r.tokens,r.timestamps))
if __name__=="__main__":
    for p in sys.argv[1:]:
        print(p.split("/")[-1],"| W:",whisper(p),"| P:",paraformer(p)[0])

_s=None
def sensevoice(path):
    """char-level timestamps (60ms resolution)"""
    global _s
    if _s is None:
        d=M+"sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17/"
        _s=so.OfflineRecognizer.from_sense_voice(model=d+"model.int8.onnx",tokens=d+"tokens.txt",language="zh",use_itn=False,num_threads=4)
    a,sr=load(path); s=_s.create_stream(); s.accept_waveform(sr,a); _s.decode_stream(s)
    r=s.result; return r.text, list(zip(r.tokens,r.timestamps))
