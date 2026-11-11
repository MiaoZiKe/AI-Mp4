"""試聽音檔量測：總長、去頭尾靜音後的說話長度、句中停頓、平均音高（自相關法估 F0）。
用法：.venv/bin/python -I scripts/voice-measure.py <file.wav>  → 印出 JSON
只用 numpy + 標準庫 wave；音高是估算值（男聲約 90–160Hz、女聲約 160–280Hz），供比較用。"""
import json
import sys
import wave

import numpy as np


def load(path):
    with wave.open(path, "rb") as w:
        sr, n, ch, sw = w.getframerate(), w.getnframes(), w.getnchannels(), w.getsampwidth()
        raw = w.readframes(n)
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)
    return x, sr


def main(path):
    x, sr = load(path)
    total = len(x) / sr
    hop, win = int(sr * 0.01), int(sr * 0.04)
    frames = [x[i:i + win] for i in range(0, len(x) - win, hop)]
    rms = np.array([np.sqrt(np.mean(f * f) + 1e-12) for f in frames])
    db = 20 * np.log10(rms + 1e-9)
    thr = db.max() - 35
    voiced_e = db > thr
    idx = np.where(voiced_e)[0]
    s, e = (idx[0] * hop / sr, (idx[-1] * hop + win) / sr) if len(idx) else (0, total)
    speech = e - s
    # 句中停頓（≥0.15 秒的低能量段）
    pauses, run = [], 0
    for v in voiced_e[idx[0]:idx[-1]] if len(idx) else []:
        if not v:
            run += 1
        else:
            if run * hop / sr >= 0.15:
                pauses.append(round(run * hop / sr, 2))
            run = 0
    # F0：自相關，60–400Hz
    lo, hi = int(sr / 400), int(sr / 60)
    f0 = []
    for f, v in zip(frames, voiced_e):
        if not v:
            continue
        f = f - f.mean()
        ac = np.correlate(f, f, mode="full")[win - 1:]
        if ac[0] <= 0:
            continue
        ac = ac / ac[0]
        seg = ac[lo:hi]
        k = int(np.argmax(seg))
        # 避免倍頻／次諧波誤判：取第一個達到最高峰 90% 的局部峰
        cand = [i for i in range(1, len(seg) - 1) if seg[i] >= 0.9 * seg[k] and seg[i] >= seg[i - 1] and seg[i] >= seg[i + 1]]
        if cand:
            k = cand[0]
        if seg[k] > 0.5:
            f0.append(sr / (lo + k))
    f0 = np.array(f0)
    out = {
        "totalSec": round(total, 2),
        "speechSec": round(speech, 2),
        "pauses": pauses,
        "f0Median": round(float(np.median(f0)), 1) if len(f0) else None,
        "f0Iqr": round(float(np.percentile(f0, 75) - np.percentile(f0, 25)), 1) if len(f0) else None,
        "voicedFrames": int(len(f0)),
    }
    print(json.dumps(out))


if __name__ == "__main__":
    main(sys.argv[1])
