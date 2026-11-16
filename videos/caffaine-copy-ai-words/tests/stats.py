# 統計 N 篇文案裡重複最多的詞：用字元 2～4 字詞組（n-gram）算「出現在幾篇」。用法：python3 stats.py <前綴> [篇數]
import sys, os, json, re, glob, collections
d = os.path.dirname(os.path.abspath(__file__)); pre = sys.argv[1]
docs = []
for f in sorted(glob.glob(os.path.join(d, pre + "[0-9]*.json"))):
    docs.append(json.load(open(f))["answer"].strip())
docs = [x for x in docs if x]
clean = lambda s: re.sub(r"[^一-鿿A-Za-z0-9]+", "|", s)
cnt = collections.Counter(); tot = collections.Counter()
for t in docs:
    seen = set()
    for seg in clean(t).split("|"):
        for n in (2, 3, 4):
            for i in range(len(seg) - n + 1):
                g = seg[i:i + n]; tot[g] += 1; seen.add(g)
    for g in seen: cnt[g] += 1
# 去掉被更長詞完全包含且篇數相同的短詞
rows = [(g, c, tot[g]) for g, c in cnt.items() if c >= 3]
rows.sort(key=lambda r: (-r[1], -len(r[0])))
keep = []
for g, c, t in rows:
    if any(g in k[0] and k[1] == c for k in keep): continue
    keep.append((g, c, t))
print(f"{len(docs)} 篇，平均 {sum(len(x) for x in docs)/max(1,len(docs)):.0f} 字")
for g, c, t in keep[:40]: print(f"{g}\t{c}/{len(docs)} 篇\t共 {t} 次")
json.dump({"篇數": len(docs), "詞": [{"詞": g, "出現篇數": c, "總次數": t} for g, c, t in keep[:40]]}, open(os.path.join(d, pre + "-stats.json"), "w"), ensure_ascii=False, indent=1)
