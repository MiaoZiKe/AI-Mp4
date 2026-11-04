"""Stage 3: TTS per page (one generation per page), trim, char timestamps, ASR self-check.
Outputs audio/pages/pXX.wav, audio/voice_dry.wav, voice_timing.json, audio/asr_report.json
"""
import json, re, sys, difflib, numpy as np, soundfile as sf, sherpa_onnx as so, opencc
sys.path.insert(0, "tools")
import asr

SR = 24000
SID = 30          # kokoro v1.1-zh female voice (calm, f0≈214Hz)
SPEED = float(sys.argv[1]) if len(sys.argv) > 1 else 1.2
GAP = 0.30        # pause between pages
LEAD, TAIL = 0.45, 1.0
DASH_PAUSE = 0.18
t2s = opencc.OpenCC("t2s")
PUNCT = set("，。？！、：；——…「」（）,.?! ")

def tts():
    d = "models/kokoro-multi-lang-v1_1/"
    c = so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(kokoro=so.OfflineTtsKokoroModelConfig(
        model=d+"model.onnx", voices=d+"voices.bin", tokens=d+"tokens.txt", data_dir=d+"espeak-ng-data",
        dict_dir=d+"dict", lexicon=d+"lexicon-us-en.txt,"+d+"lexicon-zh.txt"), num_threads=8),
        rule_fsts=d+"date-zh.fst,"+d+"phone-zh.fst,"+d+"number-zh.fst")
    return so.OfflineTts(c)

def rms_env(a, hop=0.005):
    h = int(hop*SR); n = len(a)//h
    return np.sqrt((a[:n*h].reshape(n, h)**2).mean(1) + 1e-12), h

def trim(a, thr_db=-42, keep=0.03):
    e, h = rms_env(a); db = 20*np.log10(e/ (np.abs(a).max()+1e-9))
    idx = np.where(db > thr_db)[0]
    s = max(0, idx[0]*h - int(keep*SR)); t = min(len(a), (idx[-1]+1)*h + int(keep*SR))
    return a[s:t]

def fade(a, ms=15):
    n = int(ms/1000*SR); w = np.linspace(0, 1, n)
    a = a.copy(); a[:n] *= w; a[-n:] *= w[::-1]; return a

def norm_cn(s):
    return "".join(ch for ch in t2s.convert(s) if ch not in PUNCT and not ch.isspace())

CN = "零一二三四五六七八九"
def num2cn(m):
    s = m.group(0)
    if "." in s:
        a, b = s.split("."); return num2cn_int(int(a)) + "点" + "".join(CN[int(x)] for x in b)
    return num2cn_int(int(s))
def num2cn_int(n):
    if n < 10: return CN[n]
    if n >= 10000: return "".join(CN[int(x)] for x in str(n))
    digs = [(n//1000)%10, (n//100)%10, (n//10)%10, n%10]; units = ["千","百","十",""]
    out = ""; pend_zero = False
    for d, u in zip(digs, units):
        if d == 0:
            if out: pend_zero = True
            continue
        if pend_zero: out += "零"; pend_zero = False
        out += ("两" if (d == 2 and u in ("千","百")) else CN[d]) + u
    if out.startswith("一十"): out = out[1:]
    return out

def asr_norm(s):
    s = re.sub(r"(\d+(?:\.\d+)?)%", r"百分之\1", s)
    s = re.sub(r"\d+(\.\d+)?", num2cn, s.replace("%", ""))
    return norm_cn(s)

def align(narr_chars, asr_toks):
    """map each narration char -> time using ASR char timestamps (paraformer)."""
    a = [t2s.convert(c) for c in narr_chars]
    b = [t for t, _ in asr_toks]; bt = [x for _, x in asr_toks]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    times = [None]*len(a)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag in ("equal", "replace"):
            for k in range(i2-i1):
                jj = j1 + min(k, j2-j1-1) if j2 > j1 else None
                if jj is not None: times[i1+k] = bt[jj]
    # interpolate gaps
    known = [i for i, t in enumerate(times) if t is not None]
    for i in range(len(times)):
        if times[i] is None:
            lo = max([k for k in known if k < i], default=None); hi = min([k for k in known if k > i], default=None)
            if lo is None: times[i] = times[hi]
            elif hi is None: times[i] = times[lo] + 0.2*(i-lo)
            else: times[i] = times[lo] + (times[hi]-times[lo])*(i-lo)/(hi-lo)
    ratio = sm.ratio()
    return times, ratio

PAUSE_TARGET = {"，": 0.15, "、": 0.12, "：": 0.18, "。": 0.32, "？": 0.34, "！": 0.32, "——": 0.36}

def silence_run(a, t0, t1, thr=-38):
    """longest silent run (s) and its centre inside [t0,t1]"""
    e, h = rms_env(a); ref = np.abs(a).max() + 1e-9
    i0, i1 = max(0, int(t0*SR)//h), min(len(e), max(int(t0*SR)//h+2, int(t1*SR)//h))
    db = 20*np.log10(e[i0:i1]/ref + 1e-9); sil = db < thr
    best = (0, None); cur = 0
    for k, v in enumerate(sil):
        cur = cur+1 if v else 0
        if cur > best[0]: best = (cur, k - cur//2)
    if best[1] is None:  # no silence: cut at energy minimum only if it is a deep dip
        k = int(np.argmin(e[i0:i1]))
        return (0.0 if db[k] < -30 else None), (i0 + k)*h
    return best[0]*h/SR, (i0 + best[1])*h

def shape_pauses(a, text, times):
    # positions: (number of chars before punct, punct)
    marks = []; n = 0; i = 0
    while i < len(text):
        if text[i:i+2] == "——": marks.append((n, "——")); i += 2; continue
        ch = text[i]
        if ch in PAUSE_TARGET: marks.append((n, ch))
        elif ch not in PUNCT and not ch.isspace(): n += 1
        i += 1
    # merge marks at same position (keep the longest target)
    pos = {}
    for k, m in marks: pos[k] = max(pos.get(k, 0), PAUSE_TARGET[m])
    log = []
    for k in sorted(pos, reverse=True):          # reverse so earlier times stay valid
        if k <= 0 or k >= len(times): continue   # end of page handled by gap
        t0, t1 = times[k-1] + 0.06, times[k] + 0.03
        have, cut = silence_run(a, t0, t1)
        if have is None: log.append((k, "skip-voiced", pos[k])); continue
        add = round(pos[k] - have, 3)
        log.append((k, round(have, 3), pos[k]))
        if add > 0.01:
            m = int(0.005*SR); L = a[:cut].copy(); R = a[cut:].copy()
            L[-m:] *= np.linspace(1, 0, m); R[:m] *= np.linspace(0, 1, m)
            a = np.concatenate([L, np.zeros(int(add*SR), np.float32), R])
            ct = cut/SR; times = [t + add if t >= ct else t for t in times]
    return a, times, log

def main():
    S = json.load(open("script.json"))
    eng = tts()
    pages_audio, report, timing_pages = [], [], []
    for p in S["pages"]:
        text = "".join(p["narration"])
        tts_text = t2s.convert(text.replace("——", "，"))
        g = eng.generate(tts_text, sid=SID, speed=SPEED)
        a = np.array(g.samples, dtype=np.float32)
        assert g.sample_rate == SR
        a = trim(a)
        sf.write(f"audio/pages/{p['id']}_raw.wav", a, SR)
        _, toks = asr.sensevoice(f"audio/pages/{p['id']}_raw.wav")
        # narration chars (with sentence/item index)
        chars = []
        for si, sent in enumerate(p["narration"]):
            for ci, ch in enumerate(sent):
                if ch in PUNCT: continue
                chars.append({"ch": ch, "sent": si})
        times, ratio = align([c["ch"] for c in chars], toks)
        # punctuation-driven rhythm: comma = short pause, period/question = long, dash = longest
        a, times, pauses = shape_pauses(a, text, times)
        report_pauses = pauses
        a = fade(a)
        sf.write(f"audio/pages/{p['id']}.wav", a, SR)
        dur = len(a)/SR
        # ends: next char start, last char -> end of speech
        for i, c in enumerate(chars):
            c["start"] = round(times[i], 3)
            nxt = times[i+1] if i+1 < len(chars) else dur - 0.03
            c["end"] = round(min(nxt, times[i] + 0.45), 3)
        # ASR check (whisper small) on final page audio
        sf.write("/tmp/_w.wav", a, SR)
        wtxt = asr.whisper("/tmp/_w.wav"); ptxt, _ = asr.paraformer("/tmp/_w.wav"); stxt, _ = asr.sensevoice("/tmp/_w.wav")
        ref = norm_cn(text)
        wn, pn = asr_norm(wtxt), asr_norm(ptxt)
        wr = difflib.SequenceMatcher(None, ref, wn).ratio(); pr = difflib.SequenceMatcher(None, ref, pn).ratio()
        diffs = [(ref[i1:i2], wn[j1:j2]) for t, i1, i2, j1, j2 in difflib.SequenceMatcher(None, ref, wn).get_opcodes() if t != "equal"]
        report.append({"id": p["id"], "pauses": report_pauses, "dur": round(dur, 2), "align_ratio": round(ratio, 3), "whisper": wtxt,
                       "whisper_sim": round(wr, 3), "paraformer": ptxt, "sensevoice": stxt, "paraformer_sim": round(pr, 3), "whisper_diffs": diffs})
        print(p["id"], round(dur, 2), "align", round(ratio, 3), "whisper", round(wr, 3), "para", round(pr, 3), diffs, flush=True)
        pages_audio.append(a); timing_pages.append({"id": p["id"], "dur": dur, "chars": chars})
    # timeline
    out = [np.zeros(int(LEAD*SR), np.float32)]; t = LEAD; pages_t = []
    for i, (a, tp) in enumerate(zip(pages_audio, timing_pages)):
        st = t
        for c in tp["chars"]: c["start"] = round(c["start"]+st, 3); c["end"] = round(c["end"]+st, 3)
        out.append(a); t += len(a)/SR
        pages_t.append({"id": tp["id"], "voice_start": round(st, 3), "voice_end": round(t, 3), "chars": tp["chars"]})
        if i < len(pages_audio)-1:
            out.append(np.zeros(int(GAP*SR), np.float32)); t += GAP
    out.append(np.zeros(int(TAIL*SR), np.float32)); t += TAIL
    voice = np.concatenate(out)
    sf.write("audio/voice_dry.wav", voice, SR)
    # sentences + words
    for pt, p in zip(pages_t, S["pages"]):
        sents = []
        for si, sent in enumerate(p["narration"]):
            cs = [c for c in pt["chars"] if c["sent"] == si]
            sents.append({"i": si, "text": sent, "start": cs[0]["start"], "end": cs[-1]["end"]})
        pt["sentences"] = sents
        pt["words"] = [{"w": c["ch"], "start": c["start"], "end": c["end"]} for c in pt["chars"]]
        del pt["chars"]
    # page display spans: transitions centered in the gaps
    for i, pt in enumerate(pages_t):
        pt["page_start"] = 0.0 if i == 0 else round((pages_t[i-1]["voice_end"] + pt["voice_start"])/2, 3)
    for i, pt in enumerate(pages_t):
        pt["page_end"] = round(t, 3) if i == len(pages_t)-1 else pages_t[i+1]["page_start"]
    json.dump({"engine": "sherpa-onnx Kokoro v1.1-zh (offline)", "voice": f"sid {SID}", "speed": SPEED,
               "sample_rate": SR, "gap": GAP, "lead": LEAD, "total": round(t, 3), "pages": pages_t},
              open("voice_timing.json", "w"), ensure_ascii=False, indent=1)
    json.dump(report, open("audio/asr_report.json", "w"), ensure_ascii=False, indent=1)
    print("TOTAL", round(t, 2))

if __name__ == "__main__":
    main()
