"""捲舌量測（口音輔助指標，不能代替人耳）：量 ㄓㄔㄕ 開頭的字和 ㄗㄘㄙ 開頭的字，擦音能量集中在多高的頻率。
兩組中位數差距越大＝捲舌越重（越像標準普通話）；台灣華語兩組會靠近。參考值（2026/11 量五支片）：
what-is-server 0.9 kHz、tech-cowos 0.5、love-stats 2.9、ai-make-video 4.7、stock-jensen 4.4（被聽成中國口音）。
用法：.venv/bin/python scripts/voice-retro.py <file.wav> '<念稿文字>'  → JSON（內部呼叫 fa.py 找每個字的位置）
限制：字的位置來自強制對齊，有誤差；樣本少於 8 個字時數字不可靠；聲調、輕聲、語調量不到。"""
import json, os, subprocess, sys, wave
import numpy as np
from pypinyin import pinyin, Style

HERE = os.path.dirname(os.path.abspath(__file__))


def load(p):
    w = wave.open(p, "rb"); sr = w.getframerate(); ch = w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return (x.reshape(-1, ch).mean(1) if ch > 1 else x), sr


def centroid(seg, sr):
    """這一小段裡擦音最強的 20ms 的頻譜重心（1.5kHz 以上）；不是擦音回傳 None"""
    best, n = None, int(sr * 0.02)
    for i in range(0, max(1, len(seg) - n), int(sr * 0.005)):
        f = seg[i:i + n]
        if len(f) < n: break
        S = np.abs(np.fft.rfft(f * np.hanning(n))) ** 2; fr = np.fft.rfftfreq(n, 1 / sr)
        hf = S[fr >= 2500].sum(); lf = S[fr < 1000].sum() + 1e-12
        if hf / lf < 1: continue
        m = fr >= 1500; c = (S[m] * fr[m]).sum() / S[m].sum()
        if best is None or hf > best[0]: best = (hf, c)
    return best[1] if best else None


def main(path, text):
    r = subprocess.run([sys.executable, os.path.join(HERE, "fa.py")], input=json.dumps([{"id": "a", "file": path, "text": text}]), capture_output=True, text=True)
    fa = json.loads(r.stdout)[0]
    x, sr = load(path)
    res = {"retro": [], "dental": [], "x": []}
    for u in fa["units"]:
        ch = text[u["i"]]
        if not ("一" <= ch <= "鿿"): continue
        ini = pinyin(ch, style=Style.INITIALS, strict=True)[0][0]
        g = "retro" if ini in ("zh", "ch", "sh") else "dental" if ini in ("z", "c", "s") else "x" if ini == "x" else None
        if not g: continue
        c = centroid(x[int(max(0, u["start"] - 0.05) * sr):int((u["start"] + 0.09) * sr)], sr)
        if c: res[g].append(c)
    med = {k: (round(float(np.median(v))) if v else None) for k, v in res.items()}
    cjk = [u for u in fa["units"]]
    print(json.dumps({"confidence": fa.get("confidence"), "minScore": fa.get("minScore"), "units": len(cjk), "firstStart": fa["units"][0]["start"], "lastEnd": fa["units"][-1]["end"],
                      "retroN": len(res["retro"]), "dentalN": len(res["dental"]), "retroHz": med["retro"], "dentalHz": med["dental"], "xHz": med["x"],
                      "gapHz": (med["dental"] - med["retro"]) if med["retro"] and med["dental"] else None}))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
