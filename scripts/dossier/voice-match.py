#!/usr/bin/env python3
"""python3 scripts/dossier/voice-match.py <參考.wav> <候選資料夾> [每秒音節數的參考文字字數]
比對候選音色與參考錄音：resemblyzer 說話人 embedding 餘弦相似度（沒有就退回 MFCC 平均向量）、音高中位數（自相關法）、語速（字數÷有聲時間）。
候選資料夾裡每個 <音色>.wav 都是同一句念稿（電費稿前兩句，35 個音節）。輸出 markdown 表格（依相似度排序）。"""
import sys, os, glob, json
import numpy as np
ref, folder = sys.argv[1], sys.argv[2]
NSYL = int(sys.argv[3]) if len(sys.argv) > 3 else 35
def load(p):
    import wave
    with wave.open(p) as w:
        sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels(); x = np.frombuffer(w.readframes(n), np.int16).astype(np.float32) / 32768
    if ch > 1: x = x.reshape(-1, ch).mean(1)
    return x, sr
def f0_median(x, sr):
    fr, hop, out = int(0.04 * sr), int(0.01 * sr), []
    for i in range(0, len(x) - fr, hop):
        s = x[i:i + fr]; s = s - s.mean()
        if np.sqrt((s ** 2).mean()) < 0.02: continue
        ac = np.correlate(s, s, "full")[fr - 1:]; lo, hi = int(sr / 300), int(sr / 70)
        k = lo + int(np.argmax(ac[lo:hi])); 
        if ac[k] > 0.35 * ac[0]: out.append(sr / k)
    return float(np.median(out)) if out else float("nan")
def voiced_sec(x, sr):
    fr = int(0.02 * sr); e = np.array([np.sqrt((x[i:i + fr] ** 2).mean()) for i in range(0, len(x) - fr, fr)])
    return (e > 0.02).sum() * 0.02, len(x) / sr
try:
    from resemblyzer import VoiceEncoder, preprocess_wav
    enc = VoiceEncoder("cpu"); emb = lambda p: enc.embed_utterance(preprocess_wav(p)); method = "resemblyzer"
except Exception as ex:
    import librosa
    def emb(p):
        y, sr = librosa.load(p, sr=16000); m = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20); return np.concatenate([m.mean(1), m.std(1)])
    method = "MFCC"
cos = lambda a, b: float(np.dot(a, b) / np.linalg.norm(a) / np.linalg.norm(b))
re = emb(ref); xr, sr = load(ref); rv, rt = voiced_sec(xr, sr)
rows = []
for p in sorted(glob.glob(os.path.join(folder, "*.wav"))):
    name = os.path.splitext(os.path.basename(p))[0]
    if "__" in name: continue
    x, s = load(p); v, tot = voiced_sec(x, s)
    rows.append((name, cos(re, emb(p)), f0_median(x, s), NSYL / tot, tot))
rows.sort(key=lambda r: -r[1])
print(f"方法：{method}；參考錄音音高中位數 {f0_median(xr, sr):.0f} Hz、長 {rt:.1f} 秒\n")
print("| 名次 | 音色 | 相似度 | 音高中位數 | 語速（音節/秒，含頭尾） | 長度 |\n|---|---|---|---|---|---|")
for i, (n, c, f, r, t) in enumerate(rows): print(f"| {i+1} | {n} | {c:.3f} | {f:.0f} Hz | {r:.2f} | {t:.2f} 秒 |")
json.dump([dict(voice=n, sim=c, f0=f, rate=r, sec=t) for n, c, f, r, t in rows], open(os.path.join(folder, "match.json"), "w"), ensure_ascii=False, indent=2)
