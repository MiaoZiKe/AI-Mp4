import json,re,sys
A=sys.argv[1]
def load(p): return [float(m)/255*100 for m in re.findall(r"YAVG=([\d.]+)",open(p).read())]
c=load(A+"/content.txt"); s=load(A+"/sub.txt")
tl=json.load(open("videos/us-midterm-tech-2026/timeline.json"))
acc=0
for t in tl["scenes"]:
    n=round(t["durationSec"]*30); a=acc; acc+=n
    row=[]; rs=[]
    for k in range(0,n,10):
        seg=c[a+k:a+min(n,k+10)]; row.append(max(seg) if seg else 0)
        seg=s[a+k:a+min(n,k+10)]; rs.append(max(seg) if seg else 0)
    print(f'{t["id"][:14]:<15}C '+" ".join(f"{x:4.1f}" for x in row))
    print(f'{"":<15}S '+" ".join(f"{x:4.1f}" for x in rs))
