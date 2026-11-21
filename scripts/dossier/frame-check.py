#!/usr/bin/env python3
"""1 秒抽格檢查（交件四關之一，2026/11/22）。
用法：python3 scripts/dossier/frame-check.py <slug> [--file mp4] [--json 路徑] [--hole 0.40] [--blank 0.40]
每 1 秒抽一格（寬 270），拼成 out/<slug>/frames-1s.jpg（10 格一排，格號＝秒數，給審查直接看）。自動檢查（片尾卡不算）：
  A 主視覺空白：y 330–1250 內最大「單色空白矩形」≥ 該區 40%，且連續 ≥2 格（>1 秒）幾乎不變（平均差 <1.5）→ 列格號
  B 下半部空洞：y 1280–1700（字卡以下到頁尾）內最大單色空白矩形 ≥ 該區 40%（下半部有淡地圖點紋，門檻放寬量測），≥2 格 → 列格號與比例（版面規則：不留死白帶）
  C 文字過小：需要 tesseract；沒裝就跳過並在結果註明「未檢查」（不算通過也不算失敗）。
「單色」＝8×8（原圖 32×32）區塊標準差 <5，且與全格背景眾數色差 <18。有問題 exit 1。"""
import json, os, subprocess, sys, shutil
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
args = sys.argv[1:]
def opt(name, default=None):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
FILE, JOUT = opt("--file"), opt("--json")
HOLE, BLANK = float(opt("--hole", 0.40)), float(opt("--blank", 0.40))
if not args: sys.exit(__doc__)
slug = args[0]
path = FILE or os.path.join("out", f"{slug}.mp4")
if not os.path.isabs(path): path = os.path.join(ROOT, path)
outdir = os.path.join(ROOT, "out", slug); os.makedirs(outdir, exist_ok=True)
W, H = 270, 480  # 縮 1/4
sheet = os.path.join(outdir, "frames-1s.jpg")

dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True).stdout.strip())
n = int(dur)  # 0..n-1 秒
cols = 10; rows = -(-n // cols)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vf", f"fps=1,scale={W}:{H},drawtext=text='%{{n}}':x=4:y=4:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6,tile={cols}x{rows}", "-frames:v", "1", "-q:v", "3", sheet], capture_output=True)
if not os.path.exists(sheet):  # drawtext 可能缺字型：不標號再試
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vf", f"fps=1,scale={W}:{H},tile={cols}x{rows}", "-frames:v", "1", "-q:v", "3", sheet], capture_output=True)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps=1,scale={W}:{H},format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8)
nf = len(fr) // (W * H)
fr = fr[: nf * W * H].reshape(nf, H, W).astype(np.float32)

end_t = None
sbp = os.path.join(ROOT, "videos", slug, "storyboard.json")
if os.path.exists(sbp):
    sb = json.load(open(sbp)); e = sb["scenes"][-1]; end_t = float(e.get("startSec", e["startFrame"] / sb.get("fps", 30)))
use = [t for t in range(nf) if end_t is None or t + 0.5 < end_t]

B = 8
def empty_rect_frac(img, y0, y1, sd=5, md=18):
    reg = img[y0 // 4:y1 // 4]
    bg = float(np.bincount(np.clip(reg, 0, 255).astype(np.uint8).ravel(), minlength=256).argmax())
    gh, gw = reg.shape[0] // B, reg.shape[1] // B
    blk = reg[: gh * B, : gw * B].reshape(gh, B, gw, B)
    std = blk.std(axis=(1, 3)); mean = blk.mean(axis=(1, 3))
    em = (std < sd) & (np.abs(mean - bg) < md)
    # 最大全空矩形（直方圖法）
    best = 0; h = np.zeros(gw, int)
    for r in range(gh):
        h = np.where(em[r], h + 1, 0)
        st = []
        for c in range(gw + 1):
            cur = h[c] if c < gw else 0
            while st and h[st[-1]] >= cur:
                hh = h[st.pop()]; ww = c if not st else c - st[-1] - 1
                best = max(best, hh * ww)
            st.append(c)
    return best / (gh * gw)

A_ROI, B_ROI = (330, 1250), (1280, 1700)
rowsA = {t: empty_rect_frac(fr[t], *A_ROI) for t in use}
rowsB = {t: empty_rect_frac(fr[t], *B_ROI, sd=12, md=30) for t in use}  # 下半部有淡淡的世界地圖點紋，門檻放寬
diff = {t: float(np.abs(fr[t, A_ROI[0] // 4:A_ROI[1] // 4] - fr[t - 1, A_ROI[0] // 4:A_ROI[1] // 4]).mean()) if t > 0 else 99 for t in use}

problems = []
# A：連續 ≥2 格空白且不變
runA, cur = [], []
for t in use:
    if rowsA[t] >= BLANK and (not cur or diff[t] < 1.5): cur.append(t)
    else:
        if len(cur) >= 2: runA.append(cur)
        cur = [t] if rowsA[t] >= BLANK else []
if len(cur) >= 2: runA.append(cur)
for r in runA: problems.append(f"A 主視覺區空白：第 {r[0]}–{r[-1]} 秒（最大空白矩形 {max(rowsA[t] for t in r):.0%}，畫面幾乎不動）")
holesB = [t for t in use if rowsB[t] >= HOLE]
if len(holesB) >= 2: problems.append(f"B 下半部（y1280–1700）大片空洞：第 {','.join(map(str, holesB))} 秒（空白矩形 {min(rowsB[t] for t in holesB):.0%}–{max(rowsB[t] for t in holesB):.0%}，門檻 {HOLE:.0%}）")
ocr = "未檢查（沒有 tesseract）" if not shutil.which("tesseract") else "有 tesseract 但本版尚未接字高估算"
res = {"slug": slug, "file": os.path.relpath(path, ROOT), "frames": nf, "sheet": os.path.relpath(sheet, ROOT), "endCardStartSec": end_t,
       "blankMain": {str(t): round(rowsA[t], 2) for t in use}, "holeLower": {str(t): round(rowsB[t], 2) for t in use},
       "textSizeCheck": ocr, "problems": problems, "ok": not problems}
out = JOUT or os.path.join(outdir, "frame-check.json"); json.dump(res, open(out, "w"), ensure_ascii=False, indent=2)
print(f"抽格檢查：{nf} 格；整張圖 {res['sheet']}；文字大小：{ocr}")
for p in problems: print("  ✖ " + p)
if not problems: print("  ✔ 無空白主視覺／下半部空洞")
sys.exit(1 if problems else 0)
