import json,re,sys
A=sys.argv[1]
def load(p):
    v=[float(m) for m in re.findall(r"YAVG=([\d.]+)",open(p).read())]
    return [x/255*100 for x in v]  # percent pixels changed
c=load(A+"/content.txt"); s=load(A+"/sub.txt"); g=[float(m) for m in re.findall(r"YAVG=([\d.]+)",open(A+"/diff.txt").read())]
tl=json.load(open("videos/us-midterm-tech-2026/timeline.json"))
sc={x["id"]:x for x in json.load(open("videos/us-midterm-tech-2026/script.json"))["scenes"]}
acc=0; TH=0.05
tot_static=0; tot=0
print("frame index i = diff between frame i and i+1")
for t in tl["scenes"]:
    n=round(t["durationSec"]*30); a,b=acc,acc+n
    cs=c[a:b-1]; ss=s[a:b-1]
    # last frame with content motion >TH excluding last OUT=9 frames
    body=range(a, b-9)
    last_c=max([i for i in body if i<len(c) and c[i]>TH] or [a])
    last_s=max([i for i in body if i<len(s) and s[i]>TH] or [a])
    last_any=max(last_c,last_s)
    static=[i for i in body if i<len(c) and c[i]<=TH and s[i]<=TH]
    tot_static+=len(static); tot+=len(body)
    kws=[round(k["start"],2) for k in t["keywords"]]
    print(f'{t["id"][:20]:<21}{sc[t["id"]]["component"]:<12} {n:4d}f  content-last-move @{(last_c-a)/30:5.2f}s  sub-last @{(last_s-a)/30:5.2f}s  still-before-out {(b-9-last_any)/30:4.2f}s  static frames {len(static)/max(1,len(body))*100:4.0f}%  audio-end {t["leadSec"]+t["audioSec"]:.2f}s kw{kws}')
    acc=b
print(f"TOTAL static (content+sub <{TH}% px changed) = {tot_static}/{tot} = {tot_static/tot*100:.1f}%")
# distribution of content motion
import statistics
print("global mean abs diff per frame (0-255, 270x480): median",statistics.median(g),"p90",sorted(g)[int(len(g)*.9)])
