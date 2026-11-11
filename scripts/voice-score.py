"""試聽回讀比對：把念稿文字與聽寫結果都轉成拼音後算音節錯誤率，繁簡字形差異不算錯（聽寫模型常回簡體）。
用法：.venv/bin/python -I scripts/voice-score.py '<念稿文字>' '<聽寫文字>' → JSON {perTone, perPlain, diff}"""
import json, re, sys
from pypinyin import lazy_pinyin, Style


def units(t):
    out = []
    for tok in re.findall(r"[A-Za-z]+|[一-鿿]", t):
        out.append(tok.lower() if tok.isascii() else tok)
    return out


def py(t, tone):
    us = units(t)
    zh = "".join(u for u in us if not u.isascii())
    p = iter(lazy_pinyin(zh, style=Style.TONE3 if tone else Style.NORMAL, neutral_tone_with_five=True))
    return [u if u.isascii() else next(p) for u in us]


def ed(a, b):
    d = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(b) + 1):
            cur = min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] != b[j - 1]))
            prev, d[j] = d[j], cur
    return d[-1]


ref, hyp = sys.argv[1], sys.argv[2]
rt, ht = py(ref, True), py(hyp, True)
rp, hp = py(ref, False), py(hyp, False)
diff = [f"{a}->{b}" for a, b in zip(rt, ht) if a != b] if len(rt) == len(ht) else ["(長度不同)"]
print(json.dumps({"perTone": round(ed(rt, ht) / len(rt), 3), "perPlain": round(ed(rp, hp) / len(rp), 3), "diff": diff}, ensure_ascii=False))
