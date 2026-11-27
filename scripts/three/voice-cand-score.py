#!/usr/bin/env python3
"""配音導演：試聽候選評分（2026-11-27，docs/voice-director.md）。
把每一份候選錄音量五個數字，和兩奈米（科技透明圈旁白基準，docs/prompts/tech-旁白金手指.md 最上方鎖定表）比，
算一個 0–100 的相似分數，套關卡、排序，寫 report.md，前 N 名「合格的」才轉成 m4a。

用法：.venv/bin/python -I scripts/three/voice-cand-score.py <jobs.json> <輸出資料夾> [--top 2] [--title 標題]
  jobs.json = [{"id": "c1", "file": "x.wav", "text": "念稿（各幕空一行）", "meta": {...任意，照抄進報告}}]
  只量本機檔、不送任何 TTS 請求。

五個數字（量法和兩奈米鎖定值同一套）：
  f0 中位數／IQR：scripts/voice-measure.py（自相關法）
  含停頓字/秒   ：中文字數 ÷（第一個字起音 → 最後一個字結束），字的位置用 scripts/fa.py 強制對齊
                  （兩奈米 232 字 ÷ 49.27 秒＝4.71）
  純說話字/秒   ：中文字數 ÷ 各幕（念稿空一行＝一幕）自己第一個字到最後一個字的長度加總（扣掉換幕停頓；兩奈米 5.46）
  捲舌指標      ：scripts/voice-retro.py 的 gapHz（ㄗㄘㄙ 擦音重心 − ㄓㄔㄕ 擦音重心；越大＝捲舌越明顯）

相似分數權重（改這裡；總和 100）：每一項得分＝權重 ×max(0, 1 −|差|/容忍)
"""
import importlib.util, json, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
PY = sys.executable

# ── 基準與權重 ─────────────────────────────────────────────────────────────
# 目標值＝docs/prompts/tech-旁白金手指.md 鎖定表（兩奈米原始錄音）；捲舌目標由兩奈米成片音軌實測（REF_GAP 由 --ref 量出覆蓋）
TARGET = {"f0": 131.1, "iqr": 63.5, "pace": 4.71, "pure": 5.46, "gap": None}  # pure／gap 有兩奈米基準檔時改用同量法實測（5.74／約 4700）
WEIGHT = {"f0": 30, "iqr": 25, "pace": 20, "pure": 15, "gap": 10}
TOL = {"f0": 5.0, "iqr": 10.0, "pace": 0.40, "pure": 0.50, "gap": 1500.0}
# 關卡（不合格的不准給 Andy 聽）：鎖定表的音高 126–136、IQR ≥55、含停頓 ≥4.4 字/秒；另外念稿對齊信心 <0.5 視為可能念錯
GATE = {"f0": (126.0, 136.0), "iqrMin": 55.0, "paceMin": 4.4, "faMin": 0.5}  # paceMin：含停頓字/秒太慢直接淘汰（11-27 Andy：confident-1/2「語速更慢」）
NAMES = {"f0": "f0 中位數", "iqr": "f0 IQR", "pace": "含停頓字/秒", "pure": "純說話字/秒", "gap": "捲舌 gapHz"}

CJK = re.compile(r"[一-鿿]")


def load_mod(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


retro = load_mod("voice_retro", os.path.join(ROOT, "scripts", "voice-retro.py"))


def measure(path):
    r = subprocess.run([PY, "-I", os.path.join(ROOT, "scripts", "voice-measure.py"), path], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def gap_from_units(path, text, units):
    from pypinyin import pinyin, Style
    x, sr = retro.load(path)
    g = {"retro": [], "dental": []}
    for u in units:
        ch = text[u["i"]]
        if not CJK.match(ch):
            continue
        ini = pinyin(ch, style=Style.INITIALS, strict=True)[0][0]
        k = "retro" if ini in ("zh", "ch", "sh") else "dental" if ini in ("z", "c", "s") else None
        if not k:
            continue
        c = retro.centroid(x[int(max(0, u["start"] - 0.05) * sr):int((u["start"] + 0.09) * sr)], sr)
        if c:
            g[k].append(c)
    import numpy as np
    med = {k: (float(np.median(v)) if v else None) for k, v in g.items()}
    return (round(med["dental"] - med["retro"]) if med["retro"] and med["dental"] else None), len(g["retro"]), len(g["dental"])


def pace(text, units):
    """含停頓／純說話字/秒；幕＝念稿裡以空行分開的段落"""
    if not units:
        return None, None
    bounds, pos = [], 0
    for para in text.split("\n\n"):
        bounds.append((pos, pos + len(para)))
        pos += len(para) + 2
    n = len(CJK.findall(text))
    span = units[-1]["end"] - units[0]["start"]
    pure = 0.0
    for a, b in bounds:
        us = [u for u in units if a <= u["i"] < b]
        if us:
            pure += us[-1]["end"] - us[0]["start"]
    return round(n / span, 2), (round(n / pure, 2) if pure else None)


def score(m):
    tot, parts = 0.0, {}
    for k, w in WEIGHT.items():
        t, v = TARGET[k], m.get(k)
        if t is None or v is None:
            parts[k] = 0.0  # 量不到就不給分
            continue
        s = w * max(0.0, 1 - abs(v - t) / TOL[k])
        parts[k] = round(s, 1)
        tot += s
    return round(tot, 1), parts


def gate(m):
    why = []
    lo, hi = GATE["f0"]
    if m["f0"] is None or not (lo <= m["f0"] <= hi):
        why.append(f"f0 {m['f0']} 不在 {lo:g}–{hi:g}")
    if m["iqr"] is None or m["iqr"] < GATE["iqrMin"]:
        why.append(f"IQR {m['iqr']} <{GATE['iqrMin']:g}（太平板）")
    if m["pace"] is None or m["pace"] < GATE["paceMin"]:
        why.append(f"含停頓 {m['pace']} 字/秒 <{GATE['paceMin']}（太慢）")
    if m.get("fa") is not None and m["fa"] < GATE["faMin"]:
        why.append(f"對齊信心 {m['fa']} <{GATE['faMin']}（可能念錯，要人耳聽）")
    return why


def main():
    a = sys.argv[1:]
    if len(a) < 2:
        print(__doc__)
        sys.exit(2)
    jobs, outdir = json.load(open(a[0])), a[1]
    top = int(a[a.index("--top") + 1]) if "--top" in a else 2
    title = a[a.index("--title") + 1] if "--title" in a else "試聽候選評分"
    os.makedirs(outdir, exist_ok=True)
    # 一次跑完所有對齊（模型載入一次約 1–2 分鐘）
    # 對齊結果快取（檔案路徑＋修改時間＋念稿雜湊）：重新評分只對齊新的檔（主機忙時 10 份要十幾分鐘）
    import hashlib
    cp = os.path.join(outdir, "fa-cache.json")
    cache = json.load(open(cp)) if os.path.exists(cp) else {}
    key = lambda j: hashlib.sha1(f"{os.path.abspath(j['file'])}\u0001{os.path.getmtime(j['file'])}\u0001{j['text']}".encode()).hexdigest()[:16]
    todo = [{"id": j["id"], "file": j["file"], "text": j["text"]} for j in jobs if key(j) not in cache]
    if todo:
        r = subprocess.run([PY, os.path.join(ROOT, "scripts", "fa.py")], input=json.dumps(todo, ensure_ascii=False), capture_output=True, text=True)
        if r.returncode:
            sys.stderr.write(r.stderr[-2000:])
            sys.exit(1)
        got = {x["id"]: x for x in json.loads(r.stdout)}
        for j in jobs:
            g = got.get(j["id"])
            if g and g.get("ok"):
                cache[key(j)] = {k: g[k] for k in ("ok", "units", "confidence")}
        json.dump(cache, open(cp, "w"), ensure_ascii=False)
    fa = {j["id"]: cache.get(key(j), {}) for j in jobs}
    rows = []
    for j in jobs:
        ms = measure(j["file"])
        f = fa.get(j["id"], {})
        units = f.get("units", []) if f.get("ok") else []
        pc, pu = pace(j["text"], units)
        gp, nr, nd = gap_from_units(j["file"], j["text"], units) if units else (None, 0, 0)
        m = {"id": j["id"], "file": j["file"], "sec": ms["totalSec"], "f0": ms["f0Median"], "iqr": ms["f0Iqr"], "pace": pc, "pure": pu, "gap": gp,
             "retroN": nr, "dentalN": nd, "fa": f.get("confidence"), "chars": len(CJK.findall(j["text"])), "ref": bool(j.get("ref")), "meta": j.get("meta", {})}
        rows.append(m)
    ref = [m for m in rows if m["ref"]]
    # 目標：預設＝兩奈米鎖定值（捲舌用兩奈米實測）；jobs 裡標 "target": true 的那份（例：Andy 網站配的）→ 五個數字全改用它的實測值
    tj = [m for m, j in zip(rows, jobs) if j.get("target")]
    if tj:
        for k in TARGET:
            if tj[0].get(k) is not None:
                TARGET[k] = tj[0][k]
    elif ref:
        # 捲舌與純說話用兩奈米「同量法」實測（鎖定表的 5.46 是 timeline 每幕人聲區間算的，和 fa 首字→末字量法差 0.3）
        for k in ("gap", "pure"):
            if ref[0].get(k) is not None:
                TARGET[k] = ref[0][k]
    for m in rows:
        m["score"], m["parts"] = score(m)
        m["fail"] = gate(m) if not m["ref"] else []
    cands = sorted([m for m in rows if not m["ref"]], key=lambda m: (bool(m["fail"]), -m["score"]))
    ok = [m for m in cands if not m["fail"]]
    picks = []
    for k, m in enumerate(ok[:top], 1):
        dst = os.path.join(outdir, f"第{k}名-{m['id']}.m4a")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", m["file"], "-c:a", "aac", "-b:a", "160k", dst], check=True)
        picks.append(dst)
        m["m4a"] = dst
    # ── 報告 ──
    L = [f"# {title}", "", "量測：scripts/three/voice-cand-score.py（只量本機檔，不送 TTS 請求）。目標＝兩奈米鎖定值；分數＝各項 權重×max(0, 1−|差|/容忍) 加總（滿分 100）。", "",
         "| 項目 | 目標 | 容忍 | 權重 |", "|---|---|---|---|"]
    for k in WEIGHT:
        L.append(f"| {NAMES[k]} | {TARGET[k]} | {TOL[k]:g} | {WEIGHT[k]} |")
    L += ["", f"關卡：f0 {GATE['f0'][0]:g}–{GATE['f0'][1]:g} Hz、IQR ≥{GATE['iqrMin']:g}、含停頓 ≥{GATE['paceMin']} 字/秒、對齊信心 ≥{GATE['faMin']}。不合格的不轉 m4a、不給 Andy 聽。", "",
          "| 名次 | 候選 | 秒 | f0 | IQR | 含停頓字/秒 | 純說話字/秒 | 捲舌 gap | 對齊信心 | 分數 | 結果 | 設定 |", "|---|---|---|---|---|---|---|---|---|---|---|---|"]
    def row(rank, m, res):
        meta = "、".join(f"{k}={v}" for k, v in m["meta"].items())
        return f"| {rank} | {m['id']} | {m['sec']} | {m['f0']} | {m['iqr']} | {m['pace']} | {m['pure']} | {m['gap']}（{m['retroN']}／{m['dentalN']}） | {m['fa']} | {m['score']} | {res} | {meta} |"
    for m in ref:
        L.append(row("基準", m, "（同量法量基準，確認量法對得上鎖定值）"))
    for k, m in enumerate(cands, 1):
        L.append(row(k, m, "✅ 合格" + (f"→ {os.path.basename(m['m4a'])}" if m.get("m4a") else "") if not m["fail"] else "✖ " + "；".join(m["fail"])))
    L += ["", "各項得分明細（f0／IQR／含停頓／純說話／捲舌）：", ""]
    for m in cands:
        L.append(f"- {m['id']}：" + "／".join(str(m["parts"][k]) for k in WEIGHT))
    L += ["", f"合格 {len(ok)}／{len(cands)} 份；輸出：" + ("、".join(os.path.basename(p) for p in picks) if picks else "沒有合格的，不輸出任何音檔（照規矩重配，不給 Andy 聽）"), ""]
    open(os.path.join(outdir, "report.md"), "w").write("\n".join(L))
    json.dump({"target": TARGET, "weight": WEIGHT, "tol": TOL, "gate": GATE, "rows": rows}, open(os.path.join(outdir, "report.json"), "w"), ensure_ascii=False, indent=1)
    print("\n".join(L))


if __name__ == "__main__":
    main()
