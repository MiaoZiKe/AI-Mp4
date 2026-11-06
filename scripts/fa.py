#!/usr/bin/env python3
"""P0-6：CTC 強制對齊（forced alignment）。

用法（align.mjs 會自動呼叫；也可單獨跑）：
  .venv/bin/python scripts/fa.py < jobs.json > result.json
  jobs.json = [{"id": "hook", "file": "public/audio/x/01-hook.wav", "text": "念稿文字"}]

模型：MMS-300M forced-alignment checkpoint（torchaudio MMS_FA 同一份權重的 HF Transformers 版，
  ctc-forced-aligner 使用的 MahmoudAshraf/mms-300m-1130-forced-aligner），第一次執行從 huggingface.co 下載約 1.2GB，
  之後讀 ~/.cache/huggingface。CTC Viterbi 在本檔用 numpy 實作（與 torchaudio.functional.forced_align 同一演算法）。
文字前處理：中文字 → pypinyin 無聲調拼音（整段一起轉，多音字依上下文）；英文單字小寫；
  全大寫縮寫（≤5 個字母，例如 MSTR、MSCI）與單一字母逐字母念（m→em、s→es…）；數字逐位轉中文念法。
  標點、空白不參與對齊。
輸出：每個「念稿字元」的 start/end（秒，相對音檔）與 score（CTC 後驗機率平均），
  每幕 confidence（字元 score 平均）、minScore，以及 onsetCheck：
  停頓（≥0.12 秒、−40 dBFS）後的第一個字，與能量起音點比對的誤差（毫秒）。
環境：依賴 torch、transformers、pypinyin、numpy（見 scripts/fa-requirements.txt）；音訊用 ffmpeg 轉 16kHz。
"""
import json, os, re, subprocess, sys, statistics

import numpy as np

os.environ.setdefault("HF_HUB_DISABLE_XET", "1")  # xet CDN 在部分網路環境被擋；走一般 HTTP 下載

MODEL = os.environ.get("FA_MODEL", "MahmoudAshraf/mms-300m-1130-forced-aligner")
SR = 16000
STRIDE = 320  # wav2vec2：每個 emission 幀 20ms
LETTER = dict(a="ei", b="bi", c="si", d="di", e="i", f="ef", g="ji", h="eich", i="ai", j="jei", k="kei", l="el", m="em",
              n="en", o="ou", p="pi", q="kiu", r="ar", s="es", t="ti", u="iu", v="vi", w="dabliu", x="eks", y="wai", z="zi")
DIGIT = dict(zip("0123456789", ["ling", "yi", "er", "san", "si", "wu", "liu", "qi", "ba", "jiu"]))
CJK = re.compile(r"[㐀-䶿一-鿿豈-﫿]")


def load_audio(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def units_of(text):
    """念稿文字 → [(字元索引, 羅馬拼寫)]；只保留會念出聲的字元"""
    from pypinyin import lazy_pinyin, Style
    out = []
    i, n = 0, len(text)
    while i < n:
        ch = text[i]
        if CJK.match(ch):
            j = i
            while j < n and CJK.match(text[j]):
                j += 1
            run = text[i:j]
            py = lazy_pinyin(run, style=Style.NORMAL, errors=lambda x: ["*"] * len(x))
            if len(py) != len(run):  # 保險：逐字轉
                py = [lazy_pinyin(c, style=Style.NORMAL)[0] for c in run]
            for k, p in enumerate(py):
                out.append((i + k, re.sub(r"[^a-z']", "", p.lower().replace("ü", "v"))))
            i = j
        elif ch.isascii() and ch.isalpha():
            j = i
            while j < n and text[j].isascii() and text[j].isalpha():
                j += 1
            word = text[i:j]
            if len(word) == 1 or (word.isupper() and len(word) <= 5):
                for k, c in enumerate(word):
                    out.append((i + k, LETTER[c.lower()]))
            else:
                for k, c in enumerate(word.lower()):  # 英文單字：每個字母一個單位（同一個詞連續）
                    out.append((i + k, c))
            i = j
        elif ch in DIGIT:
            out.append((i, DIGIT[ch]))
            i += 1
        else:
            i += 1
    return [(i, r) for i, r in out if r]


def ctc_viterbi(logp, targets, blank=0):
    """CTC 強制對齊（Viterbi）。logp: (T, V) log 機率；targets: token id 序列 → 每幀的狀態索引（2k+1 = 第 k 個 token）"""
    T = logp.shape[0]
    L = len(targets)
    S = 2 * L + 1
    ext = np.full(S, blank, dtype=np.int64)
    ext[1::2] = targets
    skip = np.zeros(S, dtype=bool)
    skip[3::2] = ext[3::2] != ext[1:-2:2]
    NEG = -1e30
    dp = np.full(S, NEG)
    dp[0] = logp[0, blank]
    if S > 1:
        dp[1] = logp[0, ext[1]]
    bp = np.zeros((T, S), dtype=np.int8)
    for t in range(1, T):
        c1 = np.concatenate(([NEG], dp[:-1]))
        c2 = np.concatenate(([NEG, NEG], dp[:-2]))
        c2[~skip] = NEG
        stack = np.stack([dp, c1, c2])
        arg = stack.argmax(0)
        dp = stack[arg, np.arange(S)] + logp[t, ext]
        bp[t] = arg
    s = S - 1 if S == 1 or dp[S - 1] >= dp[S - 2] else S - 2
    if dp[s] <= NEG / 2:
        raise RuntimeError("音檔太短，對不上念稿")
    path = np.zeros(T, dtype=np.int64)
    for t in range(T - 1, -1, -1):
        path[t] = s
        s -= int(bp[t, s])
    return path


def onset_check(wav, units_t):
    """能量起音：停頓（≥0.12 秒、< −40 dBFS）之後第一次超過門檻的時間；與停頓後第一個字的對齊起點比對"""
    hop = int(SR * 0.01)
    n = len(wav) // hop
    if n < 3:
        return []
    rms = np.sqrt(np.mean(wav[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    quiet = db < -40
    # 短於 60ms 的有聲片段（呼吸聲、雜音）視為仍在停頓中
    k = 0
    while k < n:
        if not quiet[k]:
            j = k
            while j < n and not quiet[j]:
                j += 1
            if j - k < 6 and k > 0 and j < n:
                quiet[k:j] = True
            k = j
        else:
            k += 1
    res = []
    k = 0
    while k < n:
        if quiet[k]:
            j = k
            while j < n and quiet[j]:
                j += 1
            if j < n and (j - k) >= 12 and k > 0:  # 不算檔頭（切檔留下的 40ms 不是停頓）
                onset = j * 0.01
                after = [u for u in units_t if u["start"] >= k * 0.01 - 0.05]
                if after:
                    res.append(dict(onset=round(onset, 3), start=round(after[0]["start"], 3), ch=after[0]["ch"], errMs=round((after[0]["start"] - onset) * 1000)))
            k = j
        else:
            k += 1
    return res


def main():
    jobs = json.load(sys.stdin)
    import torch
    from transformers import Wav2Vec2ForCTC
    torch.set_num_threads(max(1, os.cpu_count() or 1))
    model = Wav2Vec2ForCTC.from_pretrained(MODEL).eval()
    vocab_path = None
    try:
        from huggingface_hub import hf_hub_download
        vocab_path = hf_hub_download(MODEL, "vocab.json")
    except Exception:
        pass
    vocab = json.load(open(vocab_path)) if vocab_path else {c: i for i, c in enumerate(["<blank>", "<pad>", "</s>", "<unk>", *"aienoutsrmkldghybpwcvjzf'qx"])}
    blank = vocab.get("<blank>", 0)
    out = []
    for job in jobs:
        try:
            wav = load_audio(job["file"])
            x = (wav - wav.mean()) / (wav.std() + 1e-7)
            with torch.inference_mode():
                logits = model(torch.from_numpy(x)[None]).logits[0]
                logp = torch.log_softmax(logits, dim=-1).numpy().astype(np.float64)
            units = units_of(job["text"])
            toks, owner = [], []
            for ui, (_, rom) in enumerate(units):
                for c in rom:
                    if c in vocab:
                        toks.append(vocab[c])
                        owner.append(ui)
            if not toks:
                raise RuntimeError("念稿沒有可對齊的字")
            path = ctc_viterbi(logp, np.array(toks))
            T = logp.shape[0]
            sec = STRIDE / SR
            tok_frames = [[] for _ in toks]
            for t in range(T):
                s = path[t]
                if s % 2 == 1:
                    tok_frames[s // 2].append(t)
            res = []
            for ui, (ci, rom) in enumerate(units):
                ks = [k for k, o in enumerate(owner) if o == ui and tok_frames[k]]
                if not ks:
                    continue
                fr = [t for k in ks for t in tok_frames[k]]
                probs = [float(np.exp(logp[t, toks[k]])) for k in ks for t in tok_frames[k]]
                res.append(dict(i=ci, ch=job["text"][ci], rom=rom, start=round(min(fr) * sec, 3), end=round((max(fr) + 1) * sec, 3), score=round(float(np.mean(probs)), 3)))
            scores = [u["score"] for u in res]
            oc = onset_check(wav, res)
            errs = [abs(o["errMs"]) for o in oc]
            out.append(dict(id=job["id"], ok=True, units=res, nUnits=len(units), confidence=round(float(np.mean(scores)), 3), minScore=round(float(min(scores)), 3),
                            audioSec=round(len(wav) / SR, 3), onsetCheck=oc, onsetMedianMs=round(statistics.median(errs)) if errs else None, onsetMaxMs=max(errs) if errs else None))
            print(f"  fa {job['id']}: {len(res)}/{len(units)} 字，信心 {out[-1]['confidence']}", file=sys.stderr)
        except Exception as e:  # 單幕失敗：讓 align.mjs 對這幕回退
            out.append(dict(id=job["id"], ok=False, error=str(e)[:300]))
            print(f"  fa {job['id']} 失敗：{e}", file=sys.stderr)
    json.dump(out, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
