#!/usr/bin/env python3
"""npm run audit <slug> [-- --video out/x.mp4] [--baseline] [--bench] [--out path]

量測一支已渲染影片的「流暢度」指標，輸出 videos/<slug>/motion.json（--baseline 時寫 baseline-motion.json）。
算法、遮罩座標與門檻見 scripts/audit/README.md。三層：
  1. 事件層（timeline.json）：每幕 beat（字幕行、關鍵詞、之後的 cue）間距、最後一個 beat 到出場的 hold、
     人聲區間（相鄰兩幕重疊／間隔）、轉場重疊（雙重曝光，解析式）、字幕軌同時顯示組數（解析式）。
  2. 像素層（MP4 解碼）：內容區／字幕區相鄰幀變化比例（舊 an3 算法，可重現 us-midterm-tech 86%）、
     內容覆蓋率（對 public/bg/base.png）→ 換幕黑場幀、區塊比對估每幀最大位移（px）。
  3. 聲音層：MP4 音軌（目前就是人聲 stem）silencedetect −40dB / 0.3s → 靜音占比、片頭靜音、換幕停頓。
只依賴 python3 + numpy + ffmpeg/ffprobe。
"""
import json, os, re, subprocess, sys, statistics, time

import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FPS = 30
# 遮罩（全解析度 1080×1920 座標）
X0, X1 = 64, 1016                 # 左右安全區內
CONTENT = (330, 1360)             # 元件區（Video.tsx 內容框 top=330, height=1030）
SUB = (1340, 1700)                # 字幕區（中英字幕＋來源列）
CROP_Y0, CROP_Y1 = 330, 1700
DIFF_T = 20                       # 相鄰幀亮度差 > 20 視為「變了」（舊 an3 同值）
ACTIVE_T = 1.5                    # 內容區變化像素 > 1.5% 視為「有結構變化」（≤ 這個值＝只有微動）
COVER_T = 40                      # 與背景亮度差 > 40 視為「有內容」
BLACK_RATIO = 0.15                # 覆蓋率 < 相鄰幕中位數 × 15% → 黑場幀
V1_OUT = 9                        # v1 每幕最後 9 幀是出場（舊 an3 的 body 排除）
# styleVersion 2：遮罩讀 src/theme.ts 的 LAYOUT_V2（內容區 CONTENT_TOP–CONTENT_BOTTOM、字幕區 SUB_TOP–來源列底），背景用 base-v2.png
def layout_v2():
    src = open(os.path.join(ROOT, "src", "theme.ts"), encoding="utf8").read()
    m = re.search(r"export const LAYOUT_V2 = \{(.*?)\} as const", src, re.S)
    vals = dict((k, float(v)) for k, v in re.findall(r"(\w+):\s*([\d.]+)", m.group(1))) if m else {}
    bg = re.search(r'bgImage:\s*"([^"]+)"', src)
    return vals, (bg.group(1) if bg else "bg/base-v2.png")


BLK = 16                          # 位移估計：半解析度 16×16 區塊（全解析度 32px）
SHIFT = 24                        # 半解析度最大搜尋 ±24（全解析度 ±48px）


def arg(name, default=None):
    a = sys.argv
    if name in a:
        i = a.index(name)
        if i + 1 < len(a) and not a[i + 1].startswith("--"):
            return a[i + 1]
        return True
    return default


def load_layout(slug):
    """回傳 scenes 版面：[{id, start, dur, trans, voiceStart, voiceEnd, events:[frame], subWin:[in,out]}]（幀，絕對）"""
    d = os.path.join(ROOT, "videos", slug)
    script = json.load(open(os.path.join(d, "script.json")))
    tl_path = os.path.join(d, "timeline.json")
    tl = json.load(open(tl_path)) if os.path.exists(tl_path) else None
    out = []
    if tl and tl.get("version") == 2:
        for s in tl["scenes"]:
            ev = [l["start"] for l in s.get("lines", [])] + [k["start"] for k in s.get("keywords", [])] + [c["frame"] for c in s.get("cues", []) if c.get("frame") is not None]
            out.append(dict(id=s["id"], start=s["startFrame"], dur=s["durationFrames"], trans=s.get("transitionFrames", 0),
                            transition=s.get("transition"), voiceStart=s.get("voiceStartFrame"), voiceEnd=s.get("voiceEndFrame"),
                            events=sorted(ev), sub=s.get("subtitleWindow")))
        return script, tl, out, 2
    # v1：幕長 = round(durationSec*30)（或字數估算），不重疊；時間相對幕開始
    acc = 0
    tmap = {s["id"]: s for s in (tl or {}).get("scenes", [])}
    for sc in script["scenes"]:
        t = tmap.get(sc["id"])
        if t:
            n = round(t["durationSec"] * FPS)
        elif sc.get("durationSec"):
            n = round(sc["durationSec"] * FPS)
        else:
            chars = len(re.sub(r"[\s，。、！？：；「」（）,.!?]", "", sc["narration"]))
            n = min(10, max(5, -(-chars // 5) + 1)) * FPS
        ev, vs, ve = [], None, None
        if t:
            ev = [acc + round(l["start"] * FPS) for l in t.get("lines", [])] + [acc + round(k["start"] * FPS) for k in t.get("keywords", [])]
            vs = acc + round(t.get("leadSec", 0) * FPS)
            ve = vs + round(t.get("audioSec", 0) * FPS)
        end = sc["component"] == "EndCard"
        out.append(dict(id=sc["id"], start=acc, dur=n, trans=0, transition=None, voiceStart=vs, voiceEnd=ve, events=sorted(ev),
                        sub=None if end else [acc, acc + n]))
        acc += n
    return script, tl, out, 1


def total_frames(layout):
    return max(s["start"] + s["dur"] for s in layout)


# ---------- 事件層 ----------
def exit_opacity(k, tr):
    a, b = tr.get("exit", [0, 5])
    u = min(1, max(0, (k - a) / max(1, b - a)))
    return 1 - u


def enter_opacity(k, tr):
    a, b = tr.get("enter", [3, 8])
    u = min(1, max(0, (k - a) / max(1, b - a)))
    return 1 - (1 - u) * (1 - u)  # Easing.out(quad)


def event_layer(layout, version):
    scenes, doubles, max_subs = [], 0, 1
    for i, s in enumerate(layout):
        nxt = layout[i + 1] if i + 1 < len(layout) else None
        # 本幕「獨占」區間：進場轉場結束 → 下一幕轉場開始
        own0 = s["start"] + s["trans"]
        own1 = nxt["start"] if nxt else s["start"] + s["dur"]
        visual_out = (nxt["start"] if nxt else s["start"] + s["dur"]) if version == 2 else s["start"] + s["dur"] - V1_OUT
        evs = sorted(set([own0] + [e for e in s["events"] if s["start"] <= e < visual_out]))
        gaps = [(b - a) / FPS for a, b in zip(evs, evs[1:])]
        scenes.append(dict(id=s["id"], frames=s["dur"], beats=len(evs), maxBeatGapSec=round(max(gaps), 2) if gaps else None,
                           holdSec=round((visual_out - evs[-1]) / FPS, 2)))
        if nxt and version == 2 and nxt["transition"]:
            for k in range(nxt["trans"]):
                if exit_opacity(k, nxt["transition"]) > 0.4 and enter_opacity(k, nxt["transition"]) > 0.4:
                    doubles += 1
    # 字幕軌：同一幀最多幾組
    wins = [s["sub"] for s in layout if s["sub"]]
    T = total_frames(layout)
    cnt = np.zeros(T + 1, dtype=np.int32)
    for a, b in wins:
        cnt[max(0, a):min(T, b)] += 1
    max_subs = int(cnt.max()) if len(wins) else 0
    # 人聲區間
    gaps, overlaps = [], 0
    for a, b in zip(layout, layout[1:]):
        if a["voiceEnd"] is None or b["voiceStart"] is None:
            continue
        g = (b["voiceStart"] - a["voiceEnd"]) / FPS
        gaps.append(round(g, 3))
        if g < 0:
            overlaps += 1
    return dict(scenes=scenes, doubleExposureFrames=doubles, maxSubtitleGroupsPerFrame=max_subs,
                voiceGapsSec=gaps, voiceOverlaps=overlaps,
                beatGapMaxSec=max([x["maxBeatGapSec"] or 0 for x in scenes]),
                holdSecMedian=round(statistics.median([x["holdSec"] for x in scenes]), 2))


# ---------- 像素層 ----------
def ffprobe_frames(video):
    o = subprocess.run(["ffprobe", "-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets",
                        "-of", "csv=p=0", video], capture_output=True, text=True).stdout.strip()
    return int(o.split(",")[0])


def gray_frames(src, single=False):
    W, H = X1 - X0, CROP_Y1 - CROP_Y0
    cmd = ["ffmpeg", "-v", "error", "-i", src, "-an", "-vf", f"crop={W}:{H}:{X0}:{CROP_Y0},format=gray", "-f", "rawvideo", "-pix_fmt", "gray", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    n = W * H
    while True:
        buf = p.stdout.read(n)
        if len(buf) < n:
            break
        yield np.frombuffer(buf, dtype=np.uint8).reshape(H, W)
        if single:
            break
    p.stdout.close()
    p.wait()


def displacement(a, b):
    """半解析度區塊比對：回傳全解析度 px 的最大可信位移（需 ≥2 個區塊同意），沒有則 0"""
    a = a[::2, ::2].astype(np.int16)
    b = b[::2, ::2].astype(np.int16)
    H, W = a.shape
    H2, W2 = (H - 2 * SHIFT) // BLK * BLK, (W - 2 * SHIFT) // BLK * BLK
    ref = b[SHIFT:SHIFT + H2, SHIFT:SHIFT + W2]   # 新幀的區塊
    def bsad(dy, dx):
        src = a[SHIFT + dy:SHIFT + dy + H2, SHIFT + dx:SHIFT + dx + W2]
        return np.abs(ref - src).reshape(H2 // BLK, BLK, W2 // BLK, BLK).sum(axis=(1, 3))
    sad0 = bsad(0, 0)
    tex = ref.reshape(H2 // BLK, BLK, W2 // BLK, BLK).std(axis=(1, 3))
    cand = (sad0 > BLK * BLK * 6) & (tex > 12)
    if cand.sum() == 0:
        return 0
    best = sad0.astype(np.float64).copy()
    bestd = np.zeros_like(best)
    for d in range(1, SHIFT + 1):
        for dy, dx in ((d, 0), (-d, 0), (0, d), (0, -d)):
            s = bsad(dy, dx)
            m = s < best
            best[m] = s[m]
            bestd[m] = d
    ok = cand & (best < 0.35 * sad0) & (best < BLK * BLK * 6) & (bestd > 0)
    vals = np.sort(bestd[ok])[::-1]
    if len(vals) < 3:
        return 0
    # 至少三個區塊位移相近（±1）才算數，避免淡入淡出、新字出現造成的誤配
    for v in vals:
        if (np.abs(vals - v) <= 1).sum() >= 3:
            return int(v * 2)
    return 0


def masks(version, legacy=False):
    """回傳 (內容區 y0,y1, 字幕區 y0,y1, 背景圖)。v2 讀 LAYOUT_V2；legacy=True 時 v2 也用 v1 遮罩（與 M1 數字對照用）"""
    if version == 2:
        L, bgimg = layout_v2()
        if legacy:
            return CONTENT, SUB, bgimg
        return (int(L.get("CONTENT_TOP", 340)), int(L.get("CONTENT_BOTTOM", 1290))), (int(L.get("SUB_TOP", 1310)), int(L.get("SOURCE_TOP", 1486)) + 40), bgimg
    return CONTENT, SUB, "bg/base.png"


def pixel_layer(video, layout, version, legacy=False):
    (cy0, cy1), (sy0, sy1), bgimg = masks(version, legacy)
    bg = next(gray_frames(os.path.join(ROOT, "public", bgimg), single=True)).astype(np.int16)
    c0, c1 = cy0 - CROP_Y0, cy1 - CROP_Y0
    s0, s1 = sy0 - CROP_Y0, sy1 - CROP_Y0
    bgc = bg[c0:c1]
    content, sub, cover, disp = [], [], [], []
    prev = None
    t0 = time.time()
    for f in gray_frames(video):
        fi = f.astype(np.int16)
        cover.append(float((np.abs(fi[c0:c1] - bgc) > COVER_T).mean() * 100))
        if prev is not None:
            d = np.abs(fi - prev) > DIFF_T
            cc = float(d[c0:c1].mean() * 100)
            content.append(cc)
            sub.append(float(d[s0:s1].mean() * 100))
            disp.append(displacement(prev.astype(np.uint8), f) if cc > 0.3 or sub[-1] > 0.3 else 0)
        prev = fi
    decode_sec = time.time() - t0
    n = len(cover)
    # 舊 an3：每幕 body（v1 排除最後 9 幀出場；v2 為本幕獨占區間）內 content ≤1.5% 的幀比例
    amb = tot = 0
    per_scene = []
    blacks = []
    for i, s in enumerate(layout):
        nxt = layout[i + 1] if i + 1 < len(layout) else None
        if version == 2:
            a, b = s["start"], (nxt["start"] if nxt else s["start"] + s["dur"] - V1_OUT)
        else:
            a, b = s["start"], s["start"] + s["dur"] - V1_OUT
        body = [k for k in range(a, b) if k < len(content)]
        act = [k for k in body if content[k] > ACTIVE_T]
        last = max(act) if act else a
        am = sum(1 for k in body if content[k] <= ACTIVE_T)
        amb += am
        tot += len(body)
        stable = [cover[k] for k in range(s["start"] + s["trans"] + 10, min(n, s["start"] + s["dur"] - 12))] or [cover[min(n - 1, s["start"])]]
        per_scene.append(dict(id=s["id"], lastActiveSec=round((last - a) / FPS, 2), holdSec=round((b - last) / FPS, 2),
                              ambientOnlyPct=round(am / max(1, len(body)) * 100, 1), coverMedianPct=round(statistics.median(stable), 2)))
    # 換幕黑場：邊界 ±12 幀內，覆蓋率 < 兩側幕中位數較小者 × 15%
    for i in range(1, len(layout)):
        s = layout[i]
        ref = min(per_scene[i - 1]["coverMedianPct"], per_scene[i]["coverMedianPct"])
        lo, hi = s["start"] - 12, s["start"] + max(s["trans"], 0) + 12
        bf = [k for k in range(max(0, lo), min(n, hi)) if cover[k] < ref * BLACK_RATIO]
        blacks.append(dict(at=layout[i]["id"], frame=s["start"], blackFrames=len(bf), frames=bf))
    moving = [x for x in disp if x > 0]
    return dict(
        frames=n,
        ambientOnlyPct=round(amb / max(1, tot) * 100, 1),
        ambientOnlyFrames=amb, bodyFrames=tot,
        subtitleStaticPct=round(sum(1 for x in sub if x <= 0.05) / max(1, len(sub)) * 100, 1),
        blackFramesTotal=sum(b["blackFrames"] for b in blacks),
        blackFramesMaxPerCut=max([b["blackFrames"] for b in blacks] or [0]),
        maxDisplacementPx=max(disp or [0]),
        p99DisplacementPx=int(np.percentile(moving, 99)) if moving else 0,
        framesOver24px=sum(1 for x in disp if x > 24),
        over24=[[i + 1, x] for i, x in enumerate(disp) if x > 24][:300],  # [幀, px]（幀＝後一幀）
        decodeSec=round(decode_sec, 1),
        scenes=per_scene, cuts=[{k: v for k, v in b.items() if k != "frames" or v} for b in blacks],
    ), content, sub


# ---------- 聲音層 ----------
def audio_layer(video, layout, version):
    o = subprocess.run(["ffmpeg", "-v", "info", "-i", video, "-vn", "-af", "silencedetect=noise=-40dB:d=0.3", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", video],
                               capture_output=True, text=True).stdout.strip())
    st = [float(x) for x in re.findall(r"silence_start: ([\d.\-e]+)", o)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.\-e]+)", o)]
    sil = [(max(0.0, s), en[i] if i < len(en) else dur) for i, s in enumerate(st)]
    total = sum(e - s for s, e in sil)
    head = next((e for s, e in sil if s <= 0.01), 0.0)
    # 換幕停頓：v1 邊界＝幕開始；v2 邊界＝前一幕人聲結束與下一幕人聲開始之間
    cuts = []
    for a, b in zip(layout, layout[1:]):
        t = (b["start"] if version == 1 else ((a["voiceEnd"] or b["start"]) + (b["voiceStart"] or b["start"])) / 2) / FPS
        hit = [round(e - s, 3) for s, e in sil if s - 0.05 <= t <= e + 0.05]
        cuts.append(hit[0] if hit else 0.0)
    return dict(durationSec=round(dur, 2), silences=len(sil), silenceSec=round(total, 2), silencePct=round(total / dur * 100, 1),
                headSilenceSec=round(head, 3), cutPausesSec=cuts, cutPauseMaxSec=max(cuts or [0]),
                cutPauseMedianSec=round(statistics.median(cuts), 3) if cuts else 0)


def main():
    slug = next((a for a in sys.argv[1:] if not a.startswith("--") and sys.argv[sys.argv.index(a) - 1] not in ("--video", "--out")), None)
    if not slug:
        print("用法：npm run audit <slug> [-- --video out/x.mp4 --baseline --bench --out path]")
        sys.exit(2)
    video = arg("--video") or os.path.join(ROOT, "out", f"{slug}.mp4")
    if not os.path.isabs(video):
        video = os.path.join(ROOT, video)
    if not os.path.exists(video):
        print(f"找不到 {video}，請先 npm run render {slug}")
        sys.exit(2)
    script, tl, layout, version = load_layout(slug)
    expect = total_frames(layout)
    got = ffprobe_frames(video)
    print(f"▶ {slug}（styleVersion {version}）{len(layout)} 幕，timeline {expect} 幀，MP4 {got} 幀")
    ev = event_layer(layout, version)
    px, _, _ = pixel_layer(video, layout, version)
    if version == 2 and not arg("--no-legacy"):
        # 與 M1 對照：v2 也用舊遮罩（內容 330–1360）再量一次靜止比例（舊遮罩會把字幕的變化算進內容區，只當參考）
        lg, _, _ = pixel_layer(video, layout, version, legacy=True)
        px["ambientOnlyPctLegacyMask"] = lg["ambientOnlyPct"]
    au = audio_layer(video, layout, version)
    bench = None
    rj = os.path.join(ROOT, "out", f"{slug}.render.json")
    if os.path.exists(rj):
        bench = json.load(open(rj))
    if arg("--bench"):
        o = subprocess.run(["node", os.path.join(ROOT, "scripts", "bench.mjs"), slug, "300", "60"], capture_output=True, text=True, cwd=ROOT).stdout
        m = re.search(r"→ (\d+) ms/frame", o)
        bench = dict(bench or {}, benchMsPerFrame=int(m.group(1)) if m else None, benchRange=[300, 359])
    res = dict(slug=slug, styleVersion=version, video=os.path.relpath(video, ROOT), measuredAt=time.strftime("%Y-%m-%d %H:%M"),
               timelineFrames=expect, mp4Frames=got, framesMatch=expect == got,
               summary=dict(
                   ambientOnlyPct=px["ambientOnlyPct"], ambientOnlyPctLegacyMask=px.get("ambientOnlyPctLegacyMask"), blackFramesTotal=px["blackFramesTotal"], blackFramesMaxPerCut=px["blackFramesMaxPerCut"],
                   doubleExposureFrames=ev["doubleExposureFrames"], maxSubtitleGroupsPerFrame=ev["maxSubtitleGroupsPerFrame"],
                   maxDisplacementPx=px["maxDisplacementPx"], p99DisplacementPx=px["p99DisplacementPx"], framesOver24px=px["framesOver24px"],
                   silencePct=au["silencePct"], headSilenceSec=au["headSilenceSec"], cutPauseMaxSec=au["cutPauseMaxSec"], cutPauseMedianSec=au["cutPauseMedianSec"],
                   voiceOverlaps=ev["voiceOverlaps"], beatGapMaxSec=ev["beatGapMaxSec"], holdSecMedian=ev["holdSecMedian"],
                   durationSec=au["durationSec"], msPerFrame=(bench or {}).get("msPerFrame") or (bench or {}).get("benchMsPerFrame")),
               event=ev, pixel=px, audio=au, bench=bench,
               thresholds=dict(DIFF_T=DIFF_T, ACTIVE_T=ACTIVE_T, COVER_T=COVER_T, BLACK_RATIO=BLACK_RATIO, content=list(masks(version)[0]), subtitle=list(masks(version)[1]), background=masks(version)[2], x=[X0, X1]))
    out = arg("--out") or os.path.join(ROOT, "videos", slug, "baseline-motion.json" if arg("--baseline") else "motion.json")
    if not os.path.isabs(out):
        out = os.path.join(ROOT, out)
    json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
    s = res["summary"]
    print("  幀數一致：", "✔" if res["framesMatch"] else f"✖（timeline {expect} ≠ MP4 {got}）")
    for k, v in s.items():
        print(f"  {k:<26}{v}")
    print(f"✔ {os.path.relpath(out, ROOT)}")


if __name__ == "__main__":
    main()
