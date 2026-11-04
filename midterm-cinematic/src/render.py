"""Render frames to PNG in parallel.
usage: python render.py [--frames 0,100,200 | --range a:b:step] [--out DIR] [--workers N]
"""
import argparse, os, sys, time
import multiprocessing as mp
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from PIL import Image
import film
from scenes import render_frame

OUT = None


def work(f):
    t = time.time()
    arr = render_frame(f)
    Image.fromarray(arr).save(os.path.join(OUT, f"f{f:05d}.png"), compress_level=1)
    return f, time.time() - t


def main():
    global OUT
    ap = argparse.ArgumentParser()
    ap.add_argument("--frames"); ap.add_argument("--range"); ap.add_argument("--out", default=os.path.join(film.ROOT, "build/frames"))
    ap.add_argument("--workers", type=int, default=os.cpu_count())
    a = ap.parse_args()
    OUT = a.out; os.makedirs(OUT, exist_ok=True)
    if a.frames:
        frames = [int(x) for x in a.frames.split(",")]
    elif a.range:
        s, e, st = (a.range.split(":") + ["1"])[:3]
        frames = list(range(int(s), int(e), int(st)))
    else:
        frames = list(range(1584))
    t0 = time.time()
    film.build_all()
    print(f"assets {time.time() - t0:.1f}s", flush=True)
    done = 0
    if a.workers <= 1 or len(frames) == 1:
        for f in frames:
            print(work(f), flush=True)
    else:
        with mp.get_context("fork").Pool(a.workers) as pool:
            for f, dt in pool.imap_unordered(work, frames, chunksize=2):
                done += 1
                if done % 48 == 0 or done == len(frames):
                    el = time.time() - t0
                    print(f"{done}/{len(frames)} frames  {el:.0f}s elapsed  last {dt:.2f}s/frame", flush=True)
    print(f"total {time.time() - t0:.1f}s", flush=True)


if __name__ == "__main__":
    main()
