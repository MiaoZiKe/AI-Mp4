import sys, numpy as np
from PIL import Image, ImageFilter
from collections import deque
SX0,SX1,SY0,SY1=64,1016,220,1700
def analyze(path):
    im=Image.open(path).convert('RGB').resize((540,960))
    a=np.asarray(im).astype(np.int16)
    lum=np.asarray(im.convert('L')).astype(np.int16)
    light=np.median(lum)>128
    F=ImageFilter.MaxFilter(31) if light else ImageFilter.MinFilter(31)
    bg=np.asarray(im.filter(F).filter(ImageFilter.GaussianBlur(12))).astype(np.int16)
    d=np.abs(a-bg).max(axis=2)
    ink=d>(30 if light else 30)
    # safe area half scale
    x0,x1,y0,y1=SX0//2,SX1//2,SY0//2,SY1//2
    inkS=ink[y0:y1,x0:x1]
    occ=np.asarray(Image.fromarray((ink*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(25)))>0
    occS=occ[y0:y1,x0:x1]
    rows=occS.mean(axis=1)
    empty=rows<0.01
    # longest empty run
    best=cur=0;runs=[];start=None
    for i,e in enumerate(empty):
        if e:
            cur+=1; start=i if cur==1 else start
        else:
            if cur: runs.append((start,cur))
            cur=0
    if cur: runs.append((start,cur))
    longest=max([r[1] for r in runs],default=0)*2
    totalempty=empty.sum()*2
    # main visual: components at 1/8 on dilated mask
    small=np.asarray(Image.fromarray((ink*255).astype(np.uint8)).resize((135,240),Image.BOX))>8
    sm=np.asarray(Image.fromarray((small*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7)))>0
    H,W=sm.shape;lab=-np.ones((H,W),int);comps=[]
    cy0,cy1,cx0,cx1=SY0//8,SY1//8,SX0//8,SX1//8
    for y in range(cy0,cy1):
        for x in range(cx0,cx1):
            if sm[y,x] and lab[y,x]<0:
                q=deque([(y,x)]);lab[y,x]=len(comps);pts=[]
                while q:
                    yy,xx=q.popleft();pts.append((yy,xx))
                    for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
                        ny,nx=yy+dy,xx+dx
                        if cy0<=ny<cy1 and cx0<=nx<cx1 and sm[ny,nx] and lab[ny,nx]<0:
                            lab[ny,nx]=len(comps);q.append((ny,nx))
                ys=[p[0] for p in pts];xs=[p[1] for p in pts]
                ys0,ys1,xs0,xs1=min(ys)*8,max(ys)*8+8,min(xs)*8,max(xs)*8+8
                sub=ink[ys0//2:ys1//2,xs0//2:xs1//2]
                ry=np.where(sub.any(1))[0];rx=np.where(sub.any(0))[0]
                if len(ry): ys0,ys1,xs0,xs1=ys0+ry[0]*2,ys0+ry[-1]*2+2,xs0+rx[0]*2,xs0+rx[-1]*2+2
                comps.append((len(pts),ys0,ys1,xs0,xs1))
    comps.sort(reverse=True)
    m=comps[0] if comps else (0,0,0,0,0)
    sw,sh=SX1-SX0,SY1-SY0
    return dict(ink=inkS.mean()*100,occ=occS.mean()*100,longest=longest,totalempty=totalempty,
        mv_w=(m[4]-m[3])/sw*100,mv_h=(m[2]-m[1])/sh*100,mv_y=(m[1],m[2]),light=light)
print(f"{'file':38s} ink% occ% longestGap totalGap  MVw% MVh%  MVy")
for p in sys.argv[1:]:
    r=analyze(p)
    print(f"{p.split('/')[-1][:38]:38s} {r['ink']:4.1f} {r['occ']:4.1f} {r['longest']:6d}px {r['totalempty']:6d}px  {r['mv_w']:4.0f} {r['mv_h']:4.0f}  {r['mv_y']}")
