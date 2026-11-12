# 把整篇原始錄音裡超過 thr 秒的靜音縮短成 thr + slope×(原長 − thr)，從靜音正中間剪、8ms 交叉淡化；不動說話的部分。
# 用法：.venv/bin/python -I videos/stock-jensen/voice-tighten.py <原始.wav> <輸出.wav> 0.45 0.3（之後再用 ffmpeg atempo 加速，見 voice.md）
import sys,wave,numpy as np
src,dst,thr,slope=sys.argv[1],sys.argv[2],float(sys.argv[3]),float(sys.argv[4])
w=wave.open(src,'rb');sr=w.getframerate();x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)
hop=int(sr*.01);n=len(x)//hop
db=np.array([10*np.log10(np.mean((x[k*hop:(k+1)*hop]/32768)**2)+1e-12) for k in range(n)])
sil=db<-40;out=[];pos=0;k=0;log=[];xf=int(sr*.008)
def app(seg):
    if out and len(seg)>xf and len(out[-1])>xf:
        r=np.linspace(0,1,xf);a=out[-1];mix=a[-xf:]*(1-r)+seg[:xf]*r;out[-1]=a[:-xf];out.append(mix);out.append(seg[xf:])
    else:out.append(seg)
while k<n:
    if sil[k]:
        j=k
        while j<n and sil[j]:j+=1
        L=(j-k)*.01
        if L>thr and k>0 and j<n:
            new=thr+slope*(L-thr);cut=int((L-new)*sr);mid=(k+j)*hop//2;a=mid-cut//2;b=a+cut
            app(x[pos:a]);pos=b-xf;log.append((round(k*.01,2),round(L,2),round(new,2)))
        k=j
    else:k+=1
app(x[pos:]);y=np.concatenate(out)
o=wave.open(dst,'wb');o.setnchannels(1);o.setsampwidth(2);o.setframerate(sr);o.writeframes(np.clip(y,-32768,32767).astype(np.int16).tobytes())
print(len(log),'gaps tightened',round(len(x)/sr,2),'->',round(len(y)/sr,2));print(log)
