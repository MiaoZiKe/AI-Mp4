import json, re
PH = ["here's the thing","here's what","here's why","it turns out","the truth is","let me be clear","let that sink in","this matters because","make no mistake","game-changer","game changer","navigate","lean into","landscape","moving forward","circle back","deep dive","on the same page","unpack","double down","uncomfortable truth","i'm going to be honest"]
ADV = ["really","just","literally","honestly","simply","actually","truly","genuinely","deeply"]
def score(t):
    l = t.lower(); words = re.findall(r"[A-Za-z']+", t)
    EXC = {"family","early","apply","reply","assembly","supply","july","daily","only","italy"}
    toks = re.findall(r"\b[a-z]+\b", l)
    adv = sum(1 for w in toks if (w.endswith("ly") and w not in EXC) or w in ADV)   # 每個字只算一次（修正：actually 同時符合兩條時原本算兩次）
    notx = len(re.findall(r"not just|not only|it's not|isn't|it isn't|not a ", l))
    return {"破折號": t.count("—") + t.count("–"), "套話片語": sum(l.count(p) for p in PH), "副詞": adv, "不是X而是Y": notx, "字數": len(words)}
out = {}
import os
for k in [x[:-5] for x in sorted(os.listdir(".")) if x.endswith("-run1.json") or x.endswith("-run2.json")]:
    t = json.load(open(k + ".json"))["replyText"]; out[k] = score(t); print(k, out[k])
json.dump(out, open("score.json","w"), ensure_ascii=False, indent=1)
