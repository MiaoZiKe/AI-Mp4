import json,re,sys
A=sys.argv[1]
def load(p): return [float(m)/255*100 for m in re.findall(r"YAVG=([\d.]+)",open(p).read())]
c=load(A+"/content.txt"); s=load(A+"/sub.txt")
tl=json.load(open("videos/us-midterm-tech-2026/timeline.json"))
acc=0; TH=1.5; T_amb=0; T=0; rows=[]
for t in tl["scenes"]:
    n=round(t["durationSec"]*30); a=acc; acc+=n
    body=range(a+0,a+n-9)
    act=[i for i in body if c[i]>TH]
    last=max(act) if act else a
    amb=sum(1 for i in body if c[i]<=TH)
    T_amb+=amb; T+=len(body)
    rows.append((t["id"],(last-a)/30,(a+n-9-last)/30,amb/len(body)))
for r in rows: print(f"{r[0][:22]:<23} last-active {r[1]:4.2f}s  hold {r[2]:4.2f}s  ambient-only {r[3]*100:3.0f}%")
print(f"overall content ambient-only frames: {T_amb}/{T} = {T_amb/T*100:.0f}%  ({T_amb/30:.1f}s)")
