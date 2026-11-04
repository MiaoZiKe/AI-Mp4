"""Automated QA on the rendered frames / timeline / final MP4."""
import json, os, re, subprocess, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tl = json.load(open(os.path.join(ROOT, "timeline.json"), encoding="utf-8"))
research = open(os.path.join(ROOT, "research.md"), encoding="utf-8").read()
ok = True

# 1. frame statistics: black frames, flicker, jumps
fr = os.path.join(ROOT, "build/frames")
means = []
for f in range(tl["frames"]):
    im = np.asarray(Image.open(os.path.join(fr, f"f{f:05d}.png")).reduce(8), np.float32)
    means.append(im.mean())
means = np.array(means)
d = np.abs(np.diff(means))
print(f"frames: {len(means)}  min mean luma {means.min():.1f} (frame {means.argmin()})  max step {d.max():.2f} (frame {d.argmax()})")
black = np.where(means < 6)[0]
print("black frames:", list(black) if len(black) else "none")
ok &= len(black) == 0
ok &= d.max() < 8.0
# flicker: sign-alternating large steps
flick = [i for i in range(1, len(d)) if d[i] > 2.5 and d[i - 1] > 2.5 and np.sign(means[i + 1] - means[i]) != np.sign(means[i] - means[i - 1])]
print("flicker candidates:", flick or "none")

# 2. caption/narration sync + caption length
for c in tl["cues"]:
    err = c["caption_in_frame"] - c["vo_start_frame"]
    n = len(c["caption"].replace(" ", ""))
    if err != 0 or n > 18:
        ok = False
    print(f"  {c['vo_start_s']:6.2f}s  sync err {err} f  chars {n:2d}  {c['caption']}")

# 3. every number on a caption must appear in research.md
for c in tl["cues"]:
    for num in re.findall(r"\d[\d,\.]*", c["caption"]):
        found = num in research or num.replace(",", "") in research.replace(",", "")
        if not found:
            ok = False
        print(f"  number {num:>8} in research.md: {found}")

# 4. final file
mp4 = os.path.join(ROOT, "output/midterm-cinematic.mp4")
if os.path.exists(mp4):
    p = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_name,width,height,r_frame_rate,nb_frames:format=duration",
                        "-of", "json", mp4], capture_output=True, text=True)
    info = json.loads(p.stdout)
    v = [s for s in info["streams"] if s["codec_name"] == "h264"][0]
    dur = float(info["format"]["duration"])
    print(f"mp4: {v['width']}x{v['height']} {v['r_frame_rate']} frames={v['nb_frames']} duration={dur:.3f}s")
    ok &= v["width"] == 1920 and v["height"] == 804 and v["r_frame_rate"] == "24/1" and abs(dur - 66.0) < 0.01
print("QA:", "PASS" if ok else "FAIL")
