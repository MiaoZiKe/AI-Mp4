#!/usr/bin/env python3
"""量旁白音高中位數（自相關，只是比較兩支用）：python3 scripts/caffaine/pitch-median.py <slug>…"""
import sys, json, wave, numpy as np
def load(p):
    w = wave.open(p); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)/32768; return x, w.getframerate()
for slug in sys.argv[1:]:
    m = json.load(open(f"videos/{slug}/tts-manifest.json")); f0s = []; syl = 0; sp = 0
    for e in m["scenes"]:
        x, sr = load("public/" + e["file"]); n = int(sr*0.04); hop = int(sr*0.01); lo, hi = int(sr/400), int(sr/100)
        for i in range(0, len(x)-n, hop):
            f = x[i:i+n]; f = f - f.mean()
            if np.sqrt((f**2).mean()) < 0.02: continue
            ac = np.correlate(f, f, "full")[n-1:]; 
            if ac[0] <= 0: continue
            k = lo + int(np.argmax(ac[lo:hi])); 
            if ac[k]/ac[0] > 0.5: f0s.append(sr/k)
    print(slug, "f0 中位數 %.1f Hz" % np.median(f0s), "n=%d" % len(f0s))
