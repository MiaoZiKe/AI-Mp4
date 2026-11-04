"""Synthesize narration per scene, measure real durations, write timeline.json.
Preferred: edge-tts zh-TW-YunJheNeural (+5%). Fallback when unreachable: offline zhtts (tts_offline.py)."""
import json, sys, asyncio, subprocess, math
from pathlib import Path
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))
from script import SEGMENTS, DATA_DATE

FPS, SR = 30, 48000
LEAD, TAIL = 0.25, 0.30
VO = ROOT / "build" / "vo"; VO.mkdir(parents=True, exist_ok=True)

def edge_tts_wav(text, path):
    import edge_tts
    async def go():
        await edge_tts.Communicate(text, "zh-TW-YunJheNeural", rate="+5%").save(str(path.with_suffix(".mp3")))
    asyncio.run(asyncio.wait_for(go(), 30))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(path.with_suffix(".mp3")), "-ar", str(SR), "-ac", "1", str(path)], check=True)

def offline_wav(tts, text, path):
    a, sr = tts.synth(text)
    a = resample_poly(a, SR, sr).astype(np.float32)
    idx = np.where(np.abs(a) > 0.01 * np.abs(a).max())[0]
    a = a[max(0, idx[0] - 240): idx[-1] + 2400]
    a = a / (np.abs(a).max() + 1e-9) * 0.8
    wavfile.write(path, SR, (a * 32767).astype(np.int16))

def main():
    engine = "edge-tts zh-TW-YunJheNeural +5%"
    try:
        edge_tts_wav("測試", VO / "_probe.wav")
    except Exception as e:
        print("edge-tts unavailable:", type(e).__name__)
        from tts_offline import OfflineTTS
        tts = OfflineTTS(speed=0.95)
        engine = "offline zhtts FastSpeech2+MB-MelGAN (edge-tts host blocked in sandbox)"
    t = 0.0; out = []
    for i, s in enumerate(SEGMENTS):
        p = VO / f"{i:02d}_{s['id']}.wav"
        edge_tts_wav(s["narration"], p) if engine.startswith("edge") else offline_wav(tts, s["narration"], p)
        sr, a = wavfile.read(p); dur_a = len(a) / sr
        lead = LEAD if i else 0.5
        n_frames = math.ceil((lead + dur_a + TAIL) * FPS)
        start_f = round(t * FPS); vo_f = start_f + round(lead * FPS)
        e = dict(s, index=i, start=start_f / FPS, duration=n_frames / FPS, start_frame=start_f, n_frames=n_frames,
                 vo_file=str(p.relative_to(ROOT)), vo_start=vo_f / FPS, vo_duration=round(dur_a, 4),
                 sub_start_frame=vo_f, sub_end_frame=vo_f + math.ceil(dur_a * FPS))
        out.append(e); t = (start_f + n_frames) / FPS
        print(f"{i:02d} {s['id']:8s} vo={dur_a:5.2f}s scene={n_frames/FPS:5.2f}s")
    total = out[-1]["start_frame"] + out[-1]["n_frames"]
    trans = [dict(index=i - 1, from_seg=i - 1, to_seg=i, start_frame=out[i]["start_frame"] - 6,
                  end_frame=out[i]["start_frame"] + 6) for i in range(1, len(out))]
    tl = dict(fps=FPS, width=1080, height=1920, sample_rate=SR, total_frames=total, duration=total / FPS,
              data_date=DATA_DATE, tts_engine=engine, segments=out, transitions=trans)
    (ROOT / "timeline.json").write_text(json.dumps(tl, ensure_ascii=False, indent=2))
    print("total", total / FPS)

if __name__ == "__main__":
    main()
