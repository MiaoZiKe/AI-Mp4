"""Frame renderer with multiprocessing.
  python src/render.py frames OUT --frames 0,30 [--scale .5]   |   --seg house --times 1,3
  python src/render.py all OUT [--scale 1] [--jobs 4]"""
import sys, json, argparse, time
from pathlib import Path
from multiprocessing import Pool
import numpy as np
from PIL import Image
SRC = Path(__file__).resolve().parent; sys.path.insert(0, str(SRC))
from common import *
import scenes, transitions
ROOT = SRC.parent
TL = json.loads((ROOT / "timeline.json").read_text())

def render_seg(si, t):
    seg = TL["segments"][si]
    ctx = Ctx(seg, t, seg["start_frame"] + int(round(t * TL["fps"])), TL)
    return scenes.render(ctx)

def render_frame(gf):
    fps = TL["fps"]
    for tr in TL["transitions"]:
        if tr["start_frame"] <= gf < tr["end_frame"]:
            a, b = TL["segments"][tr["from_seg"]], TL["segments"][tr["to_seg"]]
            A = render_seg(tr["from_seg"], (gf - a["start_frame"]) / fps)
            B = render_seg(tr["to_seg"], max(0.0, (gf - b["start_frame"]) / fps))
            return transitions.apply(A, B, (gf - tr["start_frame"] + 0.5) / (tr["end_frame"] - tr["start_frame"]))
    for i, s in enumerate(TL["segments"]):
        if s["start_frame"] <= gf < s["start_frame"] + s["n_frames"]:
            return render_seg(i, (gf - s["start_frame"]) / fps)
    return render_seg(len(TL["segments"]) - 1, TL["segments"][-1]["duration"] - 1 / fps)

def save(img, path, scale=1.0):
    im = Image.fromarray(to_u8(img))
    if scale != 1.0:
        im = im.resize((int(W * scale), int(H * scale)), Image.LANCZOS)
    im.save(path, compress_level=1)

_O = None; _S = 1.0
def _init(o, s):
    global _O, _S; _O, _S = o, s
def _job(gf):
    save(render_frame(gf), Path(_O) / f"f{gf:05d}.png", _S); return gf

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("mode"); ap.add_argument("out")
    ap.add_argument("--scale", type=float, default=1.0); ap.add_argument("--frames", default="")
    ap.add_argument("--seg", default=""); ap.add_argument("--times", default=""); ap.add_argument("--jobs", type=int, default=4)
    a = ap.parse_args(); out = Path(a.out); out.mkdir(parents=True, exist_ok=True); t0 = time.time()
    if a.mode == "frames":
        if a.seg:
            si = [s["id"] for s in TL["segments"]].index(a.seg)
            for tt in a.times.split(","):
                save(render_seg(si, float(tt)), out / f"{a.seg}_{float(tt):05.2f}.png", a.scale)
        else:
            for f in a.frames.split(","):
                save(render_frame(int(f)), out / f"f{int(f):05d}.png", a.scale)
    else:
        frames = list(range(TL["total_frames"]))
        with Pool(a.jobs, initializer=_init, initargs=(str(out), a.scale)) as p:
            for n, _ in enumerate(p.imap_unordered(_job, frames, chunksize=8)):
                if n % 300 == 0:
                    print(f"{n}/{len(frames)} {time.time()-t0:.0f}s", flush=True)
    print(f"done in {time.time()-t0:.1f}s")

if __name__ == "__main__":
    main()
