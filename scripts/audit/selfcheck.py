#!/usr/bin/env python3
"""v3 自查（亞里＋huashu film_gate 移植版）：讀一支 MP4（建議 AUDIT=1 渲染）與 timeline.json，量下列代理指標，寫 JSON。

  fastMotionRatio      內容區變化像素 ≥ FAST_T 的幀佔比（film_gate「快速運動」）           門檻 ≥ 0.06
  midEmptyFrames       片長 5%–95% 之間，內容區佔用 < EMPTY_T 的幀數（中段空畫面）           門檻 0
  staticRunsOver1_5s   內容區連續 > 45 幀沒有結構變化（diff 像素 < STATIC_T）               門檻 0
  hookDiffs            第 0/15/30/45/60 幀兩兩之間主視覺幀差（%）                           門檻 全部 > 3
  jumpFrames           單幀跳變：本幀變化 > 鄰幀 3 倍且 > JUMP_MIN（轉場區間外）             門檻 0
  transitionOccupancy  轉場每一幀內容區佔用 ≥ 兩側較小者 × 60%                             門檻 全部通過

用法：python3 scripts/audit/selfcheck.py <video.mp4> <timeline.json> <out.json> [--frames N]
座標：以 540×960 解碼（全解析度 ÷2），內容區 x 32–508、y 165–625（LAYOUT_V2 330–1250）。
"""
import json, subprocess, sys
import numpy as np

W, H = 540, 960
CY0, CY1, CX0, CX1 = 165, 625, 32, 508
DIFF_T = 20          # 灰階差 > 20 才算這個像素變了
FAST_T = 2.0         # % 內容區像素變化 ≥ 2% ＝快速運動幀
STATIC_T = 0.3       # % < 0.3 ＝沒有結構變化
EMPTY_T = 5.0        # % 內容區佔用 < 5% ＝空畫面
COVER_T = 40         # 與背景圖灰階差 > 40 ＝有內容
JUMP_MIN = 8.0       # % 單幀跳變的最低變化量


def frames(path, limit=None):
    cmd = ["ffmpeg", "-v", "error", "-i", path, "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    n = 0
    while True:
        b = p.stdout.read(W * H)
        if len(b) < W * H:
            break
        yield np.frombuffer(b, np.uint8).reshape(H, W).astype(np.int16)
        n += 1
        if limit and n >= limit:
            p.kill()
            break


def bg_gray(root):
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{root}/public/bg/base-v2.png", "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
    return np.frombuffer(out, np.uint8).reshape(H, W).astype(np.int16)


def runs(mask):
    r, s = [], None
    for i, v in enumerate(mask):
        if v and s is None:
            s = i
        if not v and s is not None:
            r.append((s, i)); s = None
    if s is not None:
        r.append((s, len(mask)))
    return r


def main():
    video, tl_path, out_path = sys.argv[1:4]
    limit = int(sys.argv[sys.argv.index("--frames") + 1]) if "--frames" in sys.argv else None
    root = __file__.rsplit("/scripts/", 1)[0]
    tl = json.load(open(tl_path))
    bg = bg_gray(root)[CY0:CY1, CX0:CX1]
    act, occ, keep = [], [], {}
    prev = None
    for i, f in enumerate(frames(video, limit)):
        c = f[CY0:CY1, CX0:CX1]
        occ.append(float((np.abs(c - bg) > COVER_T).mean() * 100))
        act.append(0.0 if prev is None else float((np.abs(c - prev) > DIFF_T).mean() * 100))
        if i in (0, 15, 30, 45, 60):
            keep[i] = c
        prev = c
    act, occ = np.array(act), np.array(occ)
    n = len(act)
    scenes = [s for s in tl["scenes"] if s["startFrame"] < n]
    trans = [(s["startFrame"], s["startFrame"] + s.get("transitionFrames", 0)) for s in scenes if s.get("transitionFrames")]
    in_tr = np.zeros(n, bool)
    for a, b in trans:
        in_tr[max(0, a - 1):min(n, b + 2)] = True

    res = {"frames": n}
    res["fastMotionRatio"] = round(float((act >= FAST_T).mean()), 3)
    lo, hi = int(n * 0.05), int(n * 0.95)
    res["midEmptyFrames"] = [int(i) for i in range(lo, hi) if occ[i] < EMPTY_T]
    sruns = []
    for a, b in runs(act < STATIC_T):
        if b - a > 45:
            sc = [s["id"] for s in scenes if s["startFrame"] <= a][-1]
            sruns.append({"from": a, "to": b, "sec": round((b - a) / 30, 2), "scene": sc})
    # 片尾卡最後的停留不算（交付規範：片尾卡停在最後一幀）
    last = scenes[-1]
    sruns = [r for r in sruns if not (r["scene"] == last["id"] and r["to"] >= n - 1)]
    res["staticRunsOver1_5s"] = sruns
    import itertools
    res["hookDiffs"] = {f"{a}-{b}": round(float((np.abs(keep[a] - keep[b]) > DIFF_T).mean() * 100), 2) for a, b in itertools.combinations(sorted(keep), 2)}
    jumps = []
    for i in range(1, n - 1):
        if in_tr[i]:
            continue
        nb = max(act[i - 1], act[i + 1])
        if act[i] > JUMP_MIN and act[i] > 3 * nb:
            jumps.append({"frame": i, "pct": round(float(act[i]), 2), "neighbor": round(float(nb), 2)})
    res["jumpFrames"] = jumps
    tocc = []
    for a, b in trans:
        if a - 1 < 0 or b + 1 >= n:
            continue
        ref = min(occ[a - 1], occ[min(n - 1, b + 1)])
        worst = float(min(occ[a:b + 1]))
        tocc.append({"start": a, "minOcc": round(worst, 2), "ref": round(float(ref), 2), "ratio": round(worst / ref, 2) if ref > 0 else None, "ok": bool(worst >= 0.6 * ref)})
    res["transitionOccupancy"] = tocc
    gates = {
        "fastMotionRatio>=0.06": res["fastMotionRatio"] >= 0.06,
        "midEmptyFrames==0": len(res["midEmptyFrames"]) == 0,
        "staticRunsOver1_5s==0": len(sruns) == 0,
        "hookDiffs>3": all(v > 3 for v in res["hookDiffs"].values()) if len(keep) == 5 else None,
        "jumpFrames==0": len(jumps) == 0,
        "transitionOccupancy>=60%": all(t["ok"] for t in tocc),
    }
    res["gates"] = gates
    res["pass"] = all(v is not False for v in gates.values())
    json.dump(res, open(out_path, "w"), ensure_ascii=False, indent=1)
    for k, v in gates.items():
        print(("✔" if v else ("–" if v is None else "✖")), k)
    sys.exit(0 if res["pass"] else 1)


if __name__ == "__main__":
    main()
