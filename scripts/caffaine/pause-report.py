#!/usr/bin/env python3
"""量人聲分軌 public/audio/<slug>/voice.wav 的停頓並分類（句中／句間／換幕），輸出驗證用數字。
用法：python3 scripts/caffaine/pause-report.py <slug> [輸出.txt]
判定：silencedetect n=-35dB d=0.25；前後字用 timeline.json 逐字時間（audioFrame/fps＋words）對應念稿標點。
句中＝逗號頓號冒號分號或無標點；句間＝。？！；換幕＝前後字不同幕。片頭（0 秒）與片尾卡後的靜音不算。
結尾印：句中≥0.25 秒數、全片停頓數（不含片頭／片尾）、句數＋2。"""
import json, re, subprocess, sys, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
slug = sys.argv[1]
tl = json.load(open(f"{ROOT}/videos/{slug}/timeline.json")); man = json.load(open(f"{ROOT}/videos/{slug}/tts-manifest.json"))
fps = tl["fps"]; txt = {s["id"]: s["text"] for s in man["scenes"]}
PUNCT = set("，。？！、：；「」『』（）()…— \n\t,.?!:;\"'")
words = []  # (start, end, sceneId, k)
for sc in tl["scenes"]:
    if "words" not in sc: continue
    off = sc["audioFrame"] / fps
    for k, w in enumerate(sc["words"]): words.append((off + w["start"], off + w["end"], sc["id"], k))
def punct_after(t, k):
    c = -1
    for i, ch in enumerate(t):
        if ch not in PUNCT: c += 1
        if c == k:
            j = i + 1; s = ""
            while j < len(t) and t[j] in PUNCT: s += t[j]; j += 1
            return s
    return ""
o = subprocess.run(["ffmpeg", "-hide_banner", "-i", f"{ROOT}/public/audio/{slug}/voice.wav", "-af", "silencedetect=n=-35dB:d=0.25", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", o)]; du = [float(x) for x in re.findall(r"silence_duration: ([\d.]+)", o)]
first = words[0][0]; last = words[-1][1]
mid = btw = sc_ = 0; lines = []
for s, d in zip(st, du):
    if s + d <= first + 0.05 or s >= last - 0.05: lines.append(f"{s:6.2f} {d:.2f} 片頭／片尾（不計）"); continue
    pre = [w for w in words if w[1] <= s + 0.08]; nxt = [w for w in words if w[0] >= s + d - 0.08]
    if not pre or not nxt: continue
    a, b = pre[-1], nxt[0]
    if a[2] != b[2]: kind, p = "換幕", ""; sc_ += 1
    else:
        p = punct_after(txt[a[2]], a[3])
        kind = "句間" if any(c in "。？！.?!" for c in p) else "句中"
    if kind == "句中": mid += 1
    if kind == "句間": btw += 1
    lines.append(f"{s:6.2f} {d:.2f} {kind} 「{p or '無標點'}」")
sent = sum(len(re.findall(r"[。？！]", s["text"])) or 1 for s in man["scenes"])
total = mid + btw + sc_
out = lines + [f"句中≥0.25 秒：{mid} 處；句間 {btw}；換幕 {sc_}；全片停頓 {total}（上限 句數{sent}＋2＝{sent+2}）"]
print("\n".join(out))
if len(sys.argv) > 2: open(sys.argv[2], "w").write("\n".join(out) + "\n")
