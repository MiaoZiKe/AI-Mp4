"""Stage 4a: narration synthesis + timeline.json.

Preferred engine: edge-tts zh-TW-HsiaoChenNeural (+0%).  If the Bing speech
endpoint is unreachable (it is blocked by this environment's egress policy),
fall back to a fully local neural TTS (Kokoro-82M v1.1-zh via sherpa-onnx).
Each clip is trimmed of silence; its start is snapped to a frame boundary
and the caption uses exactly the same frame -> sync error 0 frames.
"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(__file__))
from script_data import *

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VO = os.path.join(ROOT, "build", "vo"); os.makedirs(VO, exist_ok=True)
SR = 48000
ENGINE = None

def try_edge(text, path):
    r = subprocess.run(["edge-tts", "--voice", "zh-TW-HsiaoChenNeural", "--rate", "+0%",
                        "--text", text, "--write-media", path + ".mp3"]
                       + (["--proxy", os.environ["HTTPS_PROXY"]] if os.environ.get("HTTPS_PROXY") else []),
                       capture_output=True, timeout=60)
    if r.returncode != 0 or os.path.getsize(path + ".mp3") < 1000:
        return False
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", path + ".mp3", "-ar", str(SR), "-ac", "1", path], check=True)
    return True

_kok = None
def kokoro(text, path, speed=1.0):
    global _kok
    import sherpa_onnx, opencc
    if _kok is None:
        d = os.path.join(ROOT, "build/models/kokoro-multi-lang-v1_1") + "/"
        cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
            kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(model=d+"model.onnx", voices=d+"voices.bin",
                tokens=d+"tokens.txt", data_dir=d+"espeak-ng-data", dict_dir=d+"dict",
                lexicon=d+"lexicon-us-en.txt,"+d+"lexicon-zh.txt"), num_threads=4),
            rule_fsts=d+"date-zh.fst,"+d+"phone-zh.fst,"+d+"number-zh.fst", max_num_sentences=1)
        _kok = (sherpa_onnx.OfflineTts(cfg), opencc.OpenCC("t2s"))
    tts, cc = _kok
    a = tts.generate(cc.convert(text).replace("AI", "A I"), sid=22, speed=speed)
    x = np.asarray(a.samples, np.float32)
    # resample 24k -> 48k (band-limited, scipy)
    from scipy.signal import resample_poly
    sf.write(path, resample_poly(x, SR, a.sample_rate).astype(np.float32), SR)

def trim(x, thr=0.012):
    env = np.convolve(np.abs(x), np.ones(480) / 480, "same")
    idx = np.where(env > thr)[0]
    a, b = max(idx[0] - 240, 0), min(idx[-1] + 2400, len(x))   # keep a natural 50ms tail
    return x[a:b]

def main():
    global ENGINE
    cues = []
    prev_end = 0.0
    for i, c in enumerate(CUES):
        p = os.path.join(VO, f"cue{i:02d}.wav")
        c = dict(c); c["at"] = max(c["at"], prev_end + 0.2)
        nxt = CUES[i + 1]["at"] if i + 1 < len(CUES) else 65.6
        limit = nxt - c["at"] - 0.12
        speed = 1.0
        while True:
            if ENGINE in (None, "edge") and speed == 1.0 and try_edge(c["narration"], p):
                ENGINE = "edge-tts zh-TW-HsiaoChenNeural"
            else:
                ENGINE = "kokoro-82M-v1.1-zh (sherpa-onnx, local) sid=22"
                kokoro(c["narration"], p, speed)
            x, _ = sf.read(p, dtype="float32"); x = trim(x); sf.write(p, x, SR)
            dur = len(x) / SR
            if dur <= limit or speed >= 1.06: break
            speed = round(speed + 0.03, 2)
        f0 = round(c["at"] * FPS)
        f1 = f0 + int(np.ceil(dur * FPS))
        cap_end = min(f1 + 6, N_FRAMES - 1)       # hold caption 0.25 s after speech
        prev_end = (f0 / FPS) + dur
        cues.append({**c, "vo_file": os.path.relpath(p, ROOT), "vo_start_frame": f0,
                     "vo_start_s": f0 / FPS, "vo_dur_s": round(dur, 3), "tts_speed": speed,
                     "caption_in_frame": f0, "caption_out_frame": cap_end,
                     "caption_chars": len(c["caption"].replace(" ", "")),
                     "fits": bool(dur <= limit)})
        print(f"{i:2d} at={c['at']:6.2f} dur={dur:5.2f} limit={limit:5.2f} speed={speed} {'OK' if dur<=limit else 'OVER'} | {c['caption']}")
    tl = {"fps": FPS, "frames": N_FRAMES, "duration_s": DURATION, "size": [1920, 804],
          "data_date": DATA_DATE, "brand": BRAND, "handle": HANDLE, "tts_engine": ENGINE,
          "scenes": SCENES, "cards": CARDS, "cues": cues}
    json.dump(tl, open(os.path.join(ROOT, "timeline.json"), "w"), ensure_ascii=False, indent=2)
    print("engine:", ENGINE)

if __name__ == "__main__":
    main()
