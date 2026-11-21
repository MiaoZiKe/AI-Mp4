#!/usr/bin/env python3
"""交件前四道驗證（Andy 2026/11/22：「請你務必確實檢查影片是否丟問題…為何沒有安排驗證 請重做」，所有頻道）。
規則全文：tw-rotation docs/marketing/channels/video_logic.md「交件前四道驗證」。

用法：python3 scripts/verify4.py <成片.mp4> <slug> [--out 目錄] [--no-gemini] [--refresh] [--noise -40] [--min 0.25]
  輸出：<out>/report.json、report.md、sheet.png（每 1 秒一格拼圖）、frames/（每秒一格 540×960）、flagged/（程式標出的格）
  預設 out＝out/<slug>/verify4/（out/ 不 commit）

第 1、3 道（停頓）：silencedetect 找 ≥0.25 秒停頓（片尾卡之前），用 videos/<slug>/timeline.json 的逐字時間分成
  「換幕」「句號後」「句中（逗號）」「句中（無標點）」「句中（字內）」；標準＝句中 0 處、全片停頓數 ≤ 句數＋2（逗號處 TTS 自然停頓 ≤0.45 秒不算句中、也不計入總數）；
  再跑 scripts/dossier/audio-check.py（Z／C／R／N 要 0）。
第 2 道（聽感）：片尾卡之前的成品音訊送 Gemini 音訊理解（generativelanguage.googleapis.com，代理自動補金鑰，curl 走 HTTPS_PROXY）
  ① 逐句回報斷續／卡頓／字被切／停頓不自然＋時間點 ② ASR 聽寫與念稿（script.json 的 tts，沒有就 narration）逐字比對。
  每支片最多 2 次有回內容的請求（忙線 429／503 沒回內容，重試 3 次後換 3.7／3.5 flash）；結果依音訊雜湊快取在 out 目錄（--refresh 才重送）。不送任何 TTS 請求。
第 4 道（畫面）：每 1 秒抽一格拼圖；程式檢查 ① 連續 >1 秒幾乎沒變化且大片空白 ② 下半部（y960 到字幕區上緣）空洞
  ③ 字太小／疊層重疊（直接讀 scripts/three/layout-check.mjs 的結果）。程式標出的格＋隨機 5 格要人用眼睛看
  （report.md 列出檔名），看完把結論寫回交件紀錄。
結束碼：四道都過＝0；有任一道不過＝1（第 4 道的「待人看」不算不過，程式標出的格算）。"""
import base64, difflib, hashlib, json, os, random, re, shutil, subprocess, sys, time

import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
args = sys.argv[1:]
def opt(name, default=None):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
def flag(name):
    if name in args: args.remove(name); return True
    return False
OUT = opt("--out"); NOISE = float(opt("--noise", "-40")); MIN_SIL = float(opt("--min", "0.25"))
NO_GEM = flag("--no-gemini"); REFRESH = flag("--refresh")
MODELS = [m for m in (opt("--model"), "gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash") if m]
if len(args) < 2: sys.exit(__doc__)
MP4, SLUG = os.path.abspath(args[0]), args[1]
VD = os.path.join(ROOT, "videos", SLUG)
OUT = os.path.abspath(OUT or os.path.join(ROOT, "out", SLUG, "verify4"))
os.makedirs(OUT, exist_ok=True)
FPS = 30
END_PUNCT, COMMA_PUNCT = "。？！?!…", "，、,；;：:"

COMMA_OK = 0.45  # tw-rotation video_logic.md 四道驗證 11/22 補定義（b0f840395）

def run(cmd, **kw): return subprocess.run(cmd, capture_output=True, text=True, **kw)
def tc(s): return f"{int(s // 60)}:{s % 60:05.2f}"

tl = json.load(open(os.path.join(VD, "timeline.json")))
script = json.load(open(os.path.join(VD, "script.json")))
sb_p = os.path.join(VD, "storyboard.json")
sb = json.load(open(sb_p)) if os.path.exists(sb_p) else None
dur = float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", MP4]).stdout.strip())
# 片尾卡開始秒：timeline 最後一幕是 silent 就用它的 startFrame
last = tl["scenes"][-1]
END = last["startFrame"] / FPS if last.get("silent") or not last.get("audio") else dur
if abs(tl.get("totalSec", dur) - dur) > 0.3:
    print(f"⚠ 成片長 {dur:.2f} 秒和 timeline.json 的 {tl.get('totalSec')} 秒不一致，逐字時間可能對不上")

# ── 逐字時間（絕對秒）＋每字後面接什麼標點 ─────────────────────────
sc_by_id = {s["id"]: s for s in script["scenes"]}
chars = []  # {t0, t1, ch, scene, after: 'end'|'comma'|''}
sentences = 0
sent_texts = []
for si, s in enumerate(tl["scenes"]):
    if not s.get("audio") or not s.get("words"): continue
    base = s["audioFrame"] / FPS
    src = sc_by_id.get(s["id"], {})
    text = src.get("narration") or s.get("sub", "")
    for seg in re.split(f"[{END_PUNCT}]", text):
        if seg.strip(): sentences += 1; sent_texts.append(seg.strip())
    # 把 words（逐字）對回 narration，找每個字後面的標點
    pos, ws = 0, s["words"]
    for wi, w in enumerate(ws):
        j = text.find(w["text"], pos)
        after = ""
        if j >= 0:
            nxt = text.find(ws[wi + 1]["text"], j + len(w["text"])) if wi + 1 < len(ws) else len(text)
            between = text[j + len(w["text"]):nxt if nxt >= 0 else len(text)]
            after = "end" if any(c in END_PUNCT for c in between) else ("comma" if any(c in COMMA_PUNCT for c in between) else "")
            pos = j + len(w["text"])
        if wi == len(ws) - 1: after = "end"
        chars.append({"t0": base + w["start"], "t1": base + w["end"], "ch": w["text"], "scene": s["id"], "after": after})

# ── 第 1、3 道：停頓 ─────────────────────────────────────────────
af = run(["ffmpeg", "-v", "info", "-nostats", "-t", f"{END:.3f}", "-i", MP4, "-map", "0:a:0",
          "-af", f"silencedetect=noise={NOISE}dB:d={MIN_SIL}", "-f", "null", "-"]).stderr
sil, st = [], None
for line in af.splitlines():
    m = re.search(r"silence_start: ([\d.]+)", line)
    if m: st = float(m.group(1))
    m = re.search(r"silence_end: ([\d.]+) \| silence_duration: ([\d.]+)", line)
    if m and st is not None: sil.append((st, float(m.group(1)))); st = None
if st is not None and END - st >= MIN_SIL: sil.append((st, END))
first_on = chars[0]["t0"] if chars else 0; last_off = chars[-1]["t1"] if chars else END
pauses = []
for a, b in sil:
    if b <= first_on + 0.02 or a >= last_off - 0.02: continue  # 片頭、片尾
    mid = (a + b) / 2
    kind, ctx = "句中（字內）", ""
    for i in range(len(chars) - 1):
        L, R = chars[i], chars[i + 1]
        if L["t1"] - 0.12 <= mid <= R["t0"] + 0.12 and L["t0"] < mid:
            if L["scene"] != R["scene"]: kind = "換幕"
            elif L["after"] == "end": kind = "句號後"
            elif L["after"] == "comma": kind = "逗號自然" if (b - a) <= COMMA_OK else "句中（逗號）"
            else: kind = "句中（無標點）"
            ctx = "".join(c["ch"] for c in chars[max(0, i - 5):i + 1]) + "｜" + "".join(c["ch"] for c in chars[i + 1:i + 6])
            break
    else:
        near = min(range(len(chars)), key=lambda k: abs(chars[k]["t0"] - mid))
        ctx = "".join(c["ch"] for c in chars[max(0, near - 5):near + 5])
    pauses.append({"start": round(a, 3), "end": round(b, 3), "sec": round(b - a, 3), "kind": kind, "context": ctx})
mid_pauses = [p for p in pauses if p["kind"].startswith("句中")]
counted = [p for p in pauses if p["kind"] != "逗號自然"]  # 11/22 定義：TTS 在逗號自然念出、≤0.45 秒的不算，也不計入第 3 項總數
limit = sentences + 2
g13 = {"pauses": len(counted), "commaNatural": len(pauses) - len(counted), "sentences": sentences, "limit": limit, "midSentence": len(mid_pauses),
       "byKind": {k: sum(1 for p in pauses if p["kind"] == k) for k in ("換幕", "句號後", "逗號自然", "句中（逗號）", "句中（無標點）", "句中（字內）")},
       "list": pauses, "noiseDb": NOISE, "minSec": MIN_SIL}
ac_json = os.path.join(OUT, "audio-check.json")
acr = run(["python3", os.path.join(ROOT, "scripts/dossier/audio-check.py"), SLUG, "--file", MP4, "--end", f"{END:.3f}", "--json", ac_json, "--quiet"])
ac = json.load(open(ac_json)) if os.path.exists(ac_json) else {"pass": False, "counts": {}, "issues": [], "err": acr.stderr[-500:]}
g13["audioCheck"] = {"pass": ac.get("pass"), "counts": ac.get("counts"), "issues": ac.get("issues", [])[:30], "summary": acr.stdout.strip()}
g1 = {"pass": len(mid_pauses) == 0}
g3 = {"pass": len(mid_pauses) == 0 and len(counted) <= limit and bool(ac.get("pass"))}

# ── 第 2 道：Gemini 聽感＋ASR ───────────────────────────────────
mp3 = os.path.join(OUT, "voice-before-endcard.mp3")
run(["ffmpeg", "-v", "error", "-y", "-t", f"{END:.3f}", "-i", MP4, "-map", "0:a:0", "-ac", "1", "-ar", "24000", "-b:a", "64k", mp3])
ahash = hashlib.sha1(open(mp3, "rb").read()).hexdigest()[:16]
tts_text = "\n".join((sc_by_id.get(s["id"], {}).get("tts") or sc_by_id.get(s["id"], {}).get("narration") or "") for s in tl["scenes"] if s.get("audio"))
requests_used = 0

def gemini(prompt, tag):
    """一次 generateContent；快取在 OUT/gemini-<tag>-<音訊雜湊>.json。回傳 (dict, 模型名)。"""
    global requests_used
    cp = os.path.join(OUT, f"gemini-{tag}-{ahash}.json")
    if os.path.exists(cp) and not REFRESH:
        c = json.load(open(cp)); return c["result"], c["model"] + "（快取）"
    if NO_GEM: return None, "略過（--no-gemini）"
    if requests_used >= 2: return None, "略過（已達每支 2 次上限）"
    body = {"contents": [{"parts": [{"inline_data": {"mime_type": "audio/mp3", "data": base64.b64encode(open(mp3, "rb").read()).decode()}}, {"text": prompt}]}],
            "generationConfig": {"temperature": 0, "responseMimeType": "application/json"}}
    bp = os.path.join(OUT, f".body-{tag}.json"); json.dump(body, open(bp, "w"))
    try:
        tried = []
        for model in MODELS:
          for attempt in range(3):
            r = run(["curl", "-s", "--max-time", "240", "-H", "Content-Type: application/json", "-X", "POST", "--data-binary", f"@{bp}",
                     f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"])
            try: j = json.loads(r.stdout)
            except Exception: return None, f"{model} 回應無法解析：{r.stdout[:200]}{r.stderr[-200:]}"
            if "error" in j:
                code = j["error"].get("code")
                tried.append(f"{model}:{code}")
                if code in (404, 400) and "not found" in j["error"].get("message", "").lower(): break  # 模型沒開，換下一個
                if code in (429, 500, 503): time.sleep(15 * (attempt + 1)); continue  # 忙線沒回內容，不算理解請求；重試後換下一個模型
                requests_used += 1
                return None, f"{model} 錯誤：{j['error'].get('message', '')[:200]}"
            requests_used += 1
            txt = "".join(p.get("text", "") for p in j["candidates"][0]["content"]["parts"])
            txt = re.sub(r"^```(json)?|```$", "", txt.strip()).strip()
            try: res = json.loads(txt)
            except Exception: res = {"raw": txt}
            json.dump({"model": model, "result": res}, open(cp, "w"), ensure_ascii=False, indent=1)
            return res, model
        return None, "沒有可用模型（" + "、".join(tried) + "）"
    finally:
        os.remove(bp)

P_LISTEN = f"""你是嚴格的影片音訊品管。這段是一支繁體中文科普短片的旁白成品（片尾音效之前），長 {END:.1f} 秒。
念稿如下（每行一幕）：
{tts_text}

請逐句仔細聽，找出觀眾會聽到的問題：斷續（聲音忽然斷掉又接上）、卡頓（字拖住或重複）、字被切（字頭或字尾被截掉）、
停頓不自然（句子中間不該停的地方停了、停太久、或該停沒停連在一起）、雜音爆音、音量忽大忽小、念錯字。
沒問題的句子不要列。時間點用秒（從音訊開頭算，到小數一位）。只回 JSON：
{{"issues":[{{"t":秒,"type":"斷續|卡頓|字被切|停頓不自然|雜音|音量|念錯","sentence":"那一句的原文","detail":"具體聽到什麼","severity":"明顯|輕微"}}],"overall":"一句總評"}}"""
P_ASR = """請把這段中文旁白逐字聽寫成繁體中文（台灣用字），不要修飾、不要改寫、不要補字，聽到什麼寫什麼；
數字照念的寫成國字（例如「二零二六」「五十幾」），英文字母照念的寫成英文。依停頓分行。只回 JSON：{"text":"逐字稿，每句一行"}"""
listen, listen_model = gemini(P_LISTEN, "listen")
asr, asr_model = gemini(P_ASR, "asr")
gem_issues = (listen or {}).get("issues", []) if isinstance(listen, dict) else []
def norm(s): return re.sub(r"[\s，。？！、,.?!：:；;「」『』（）()“”\"'…—\-]", "", s or "").upper()
diffs = []
if isinstance(asr, dict) and asr.get("text"):
    A, B = norm(tts_text), norm(asr["text"])
    sm = difflib.SequenceMatcher(None, A, B, autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op != "equal": diffs.append({"op": {"replace": "念成", "delete": "漏念", "insert": "多念"}[op], "script": A[i1:i2], "heard": B[j1:j2], "context": A[max(0, i1 - 6):i2 + 6]})
    cer = round(1 - sm.ratio(), 4)
else:
    cer = None
g2 = {"pass": (listen is not None and asr is not None and not gem_issues and not diffs),
      "listenModel": listen_model, "asrModel": asr_model, "issues": gem_issues, "overall": (listen or {}).get("overall") if isinstance(listen, dict) else None,
      "asrDiffs": diffs, "asrCerApprox": cer, "asrText": (asr or {}).get("text") if isinstance(asr, dict) else None, "requests": requests_used}
if listen is None or asr is None: g2["pass"] = None  # 沒跑到＝未驗

# ── 第 4 道：畫面 ───────────────────────────────────────────────
fdir = os.path.join(OUT, "frames"); shutil.rmtree(fdir, ignore_errors=True); os.makedirs(fdir)
run(["ffmpeg", "-v", "error", "-i", MP4, "-vf", "fps=1,scale=540:960", "-q:v", "4", os.path.join(fdir, "f%03d.jpg")])
frames = sorted(os.listdir(fdir))  # f001＝第 0 秒、f002＝第 1 秒…
# 動態：4 fps 小灰階
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", MP4, "-vf", "fps=4,scale=135:240,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
small = np.frombuffer(raw, np.uint8).reshape(-1, 240, 135).astype(np.float32)
mot = np.abs(np.diff(small, axis=0)).mean(axis=(1, 2))  # 每 0.25 秒的平均變化
def blank_ratio(g, y0=0, y1=None):
    g = g[y0:y1]; h, w = g.shape; b = 8
    g = g[:h - h % b, :w - w % b].reshape(h // b, b, w // b, b).std(axis=(1, 3))
    return float((g < 2.0).mean())
STILL_T = 0.6  # 平均變化 <0.6 灰階＝幾乎沒變
static_runs, i0 = [], None
for k in range(len(mot) + 1):
    still = k < len(mot) and mot[k] < STILL_T and k / 4 < END
    if still and i0 is None: i0 = k
    if not still and i0 is not None:
        if (k - i0) / 4 > 1.0:
            br = np.mean([blank_ratio(small[j]) for j in range(i0, k + 1)])
            static_runs.append({"from": round(i0 / 4, 2), "to": round(k / 4, 2), "sec": round((k - i0) / 4, 2), "blank": round(br, 2)})
        i0 = None
# 字幕區上緣：LAYOUT 不同片不同，取 hud 設定沒有就用 1400（1080×1920 座標）
sub_top = 1400
lower = []
per_frame = []
for n, f in enumerate(frames):
    g = np.asarray(Image.open(os.path.join(fdir, f)).convert("L"), np.float32)
    t = n  # fps=1 取第 n 秒那一格
    full_b = blank_ratio(g); low_b = blank_ratio(g, 480, int(sub_top / 2))
    per_frame.append({"t": t, "file": f, "blank": round(full_b, 2), "lowerBlank": round(low_b, 2)})
    if t < END and low_b > 0.80: lower.append({"t": t, "file": f, "lowerBlank": round(low_b, 2)})
lc_p = os.path.join(ROOT, "out", SLUG, "layout-check.json")
lr = run(["node", os.path.join(ROOT, "scripts/three/layout-check.mjs"), SLUG, "--json"], cwd=ROOT, timeout=300)
try: lc = json.loads(lr.stdout.strip().splitlines()[-1])
except Exception: lc = json.load(open(lc_p)) if os.path.exists(lc_p) else {"issues": [], "skipped": "layout-check 失敗"}
small_txt = [i for i in lc.get("issues", []) if "小字" in i.get("kind", "") or "<30px" in i.get("msg", "") or "字太小" in i.get("msg", "")]
lc_err = [i for i in lc.get("issues", []) if i.get("level") == "error"]
flag_t = set()
for r in static_runs:
    if r["blank"] > 0.5: flag_t.update(int(x) for x in np.arange(r["from"], r["to"] + 0.01, 1.0))
for r in lower: flag_t.add(int(r["t"]))
for i in small_txt + lc_err:
    if i.get("frames"): flag_t.add(int((i["frames"][0] + i["frames"][1]) / 2 / FPS))
flag_t = sorted(t for t in flag_t if t < len(frames))
rnd = random.Random(f"{SLUG}-{ahash}"); pool = [n for n in range(len(frames)) if n not in flag_t and n < END]
rand_t = sorted(rnd.sample(pool, min(5, len(pool))))
qdir = os.path.join(OUT, "flagged"); shutil.rmtree(qdir, ignore_errors=True); os.makedirs(qdir)
for t in flag_t: shutil.copy(os.path.join(fdir, frames[t]), os.path.join(qdir, f"flag-{t:03d}s.jpg"))
for t in rand_t: shutil.copy(os.path.join(fdir, frames[t]), os.path.join(qdir, f"rand-{t:03d}s.jpg"))
# 拼圖：每格 180×320，10 欄，左上標秒數
from PIL import ImageDraw
cols, W, H = 10, 180, 320
rows = (len(frames) + cols - 1) // cols
sheet = Image.new("RGB", (cols * W, rows * H), (20, 20, 20)); dr = ImageDraw.Draw(sheet)
for n, f in enumerate(frames):
    im = Image.open(os.path.join(fdir, f)).resize((W, H)); x, y = (n % cols) * W, (n // cols) * H
    sheet.paste(im, (x, y)); dr.rectangle([x, y, x + 34, y + 16], fill=(255, 0, 0) if n in flag_t else (0, 0, 0)); dr.text((x + 3, y + 2), f"{n}s", fill=(255, 255, 255))
sheet.save(os.path.join(OUT, "sheet.png"))
g4 = {"pass": not [r for r in static_runs if r["blank"] > 0.5] and not lower and not small_txt and not lc_err,
      "staticRuns": static_runs, "lowerHollow": lower, "smallText": small_txt, "layoutErrors": lc_err,
      "flaggedSec": flag_t, "randomSec": rand_t, "humanCheck": "待人看 flagged/ 內的圖", "frames": len(frames)}

# ── 輸出 ───────────────────────────────────────────────────────
rep = {"slug": SLUG, "file": MP4, "durationSec": round(dur, 2), "endCardSec": round(END, 2), "audioHash": ahash,
       "gate1": g1, "gate2": g2, "gate3": g3, "gate4": g4, "pauses": g13}
json.dump(rep, open(os.path.join(OUT, "report.json"), "w"), ensure_ascii=False, indent=1)
def yn(v): return "✅ 過" if v is True else ("—（未驗）" if v is None else "✖ 不過")
L = [f"# 四道驗證：{SLUG}", "", f"- 成片：`{MP4}`（{dur:.2f} 秒，片尾卡 {END:.2f} 秒起不查音訊）", "",
     "| 道 | 結果 | 摘要 |", "|---|---|---|",
     f"| 1 句中不停頓 | {yn(g1['pass'])} | 句中停頓 {len(mid_pauses)} 處 |",
     f"| 2 聽感 | {yn(g2['pass'])} | Gemini 標 {len(gem_issues)} 處；ASR 差異 {len(diffs)} 處（{listen_model}／{asr_model}） |",
     f"| 3 停頓密度 | {yn(g3['pass'])} | 停頓 {len(counted)}（另有逗號自然 {len(pauses) - len(counted)}）／句數 {sentences}（上限 {limit}）；audio-check {ac.get('counts')} |",
     f"| 4 畫面 | {yn(g4['pass'])} | 靜止空白 {len([r for r in static_runs if r['blank'] > 0.5])} 段、下半部空洞 {len(lower)} 格、小字 {len(small_txt)}、layout 錯誤 {len(lc_err)}；待人看 {len(flag_t)}＋隨機 {len(rand_t)} 格 |", "",
     "## 停頓（≥%.2f 秒，%g dB）" % (MIN_SIL, NOISE), ""]
L += [f"- {tc(p['start'])}–{tc(p['end'])}（{p['sec']:.2f} 秒）{p['kind']}：{p['context']}" for p in pauses]
L += ["", "## Gemini 聽感", ""] + [f"- {tc(float(i.get('t', 0)))} {i.get('type')}（{i.get('severity', '')}）：{i.get('sentence', '')}—{i.get('detail', '')}" for i in gem_issues]
L += ["", "## ASR 差異（念稿→聽到）", ""] + [f"- {d['op']}：「{d['script']}」→「{d['heard']}」（…{d['context']}…）" for d in diffs]
L += ["", "## 畫面", "", f"- 靜止段：{static_runs}", f"- 下半部空洞：{[r['t'] for r in lower]}",
      f"- layout-check 錯誤：" + "；".join(f"{i['kind']} {i['msg']}" for i in lc_err), f"- 小字：" + "；".join(i["msg"] for i in small_txt),
      f"- 待人看：{flag_t}；隨機：{rand_t}（檔案在 flagged/）", f"- 拼圖：sheet.png"]
open(os.path.join(OUT, "report.md"), "w").write("\n".join(L) + "\n")
print(f"{SLUG}：1 {yn(g1['pass'])}｜2 {yn(g2['pass'])}｜3 {yn(g3['pass'])}｜4 {yn(g4['pass'])}｜停頓 {len(counted)}/{sentences} 句中 {len(mid_pauses)}｜"
      f"Gemini {len(gem_issues)}｜ASR {len(diffs)}｜audio-check {ac.get('counts')}｜→ {OUT}")
sys.exit(0 if all(g.get("pass") for g in (g1, g2, g3, g4)) else 1)
