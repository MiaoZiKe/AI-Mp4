import sys,io,zipfile,subprocess,os
BASE="https://huggingface.co/datasets/opendiffusionai/pexels-photos-janpf/resolve/main/"
class R(io.RawIOBase):
    def __init__(s,url):
        s.url=url; s.pos=0
        h=subprocess.run(['curl','-sIL','-m','60',url],capture_output=True,text=True).stdout.lower()
        s.size=max(int(l.split(':')[1]) for l in h.split('\n') if l.startswith('content-length'))
        s.cache={}
    def seekable(s): return True
    def readable(s): return True
    def tell(s): return s.pos
    def seek(s,o,w=0):
        s.pos = o if w==0 else (s.pos+o if w==1 else s.size+o); return s.pos
    def read(s,n=-1):
        if n<0: n=s.size-s.pos
        n=min(n,s.size-s.pos)
        if n<=0: return b''
        BL=1<<20; out=b''
        a=s.pos//BL; b=(s.pos+n-1)//BL
        # fetch missing contiguous
        miss=[i for i in range(a,b+1) if i not in s.cache]
        if miss:
            lo=miss[0]*BL; hi=min((miss[-1]+1)*BL,s.size)-1
            d=subprocess.run(['curl','-sL','-m','300','-r',f'{lo}-{hi}',s.url],capture_output=True).stdout
            assert len(d)==hi-lo+1,(len(d),lo,hi)
            for i in range(miss[0],miss[-1]+1): s.cache[i]=d[(i-miss[0])*BL:(i-miss[0]+1)*BL]
        buf=b''.join(s.cache[i] for i in range(a,b+1))
        off=s.pos-a*BL; s.pos+=n
        return buf[off:off+n]
    def readinto(s,b):
        d=s.read(len(b)); b[:len(d)]=d; return len(d)
out=sys.argv[1]; groups={}
for m in sys.argv[2:]:
    g="0123" if m[1] in "0123" else "4567" if m[1] in "4567" else "89ab" if m[1] in "89ab" else "cdef"
    groups.setdefault(f"{m[0]}_{g[0]}-{g[-1]}.zip",[]).append(m)
for z,ms in groups.items():
    try:
        zf=zipfile.ZipFile(io.BufferedReader(R(BASE+z),1<<20))
        names=zf.namelist()
        for m in ms:
            c=[n for n in names if m in n]
            if not c: print('MISSING',m); continue
            open(os.path.join(out,m+os.path.splitext(c[0])[1]),'wb').write(zf.read(c[0])); print('ok',m,c[0])
    except Exception as e: print('ERR',z,e)
