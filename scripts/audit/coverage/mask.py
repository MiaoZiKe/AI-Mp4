import sys,numpy as np
from PIL import Image,ImageFilter
ims=[]
for p in sys.argv[2:]:
    im=Image.open(p).convert('RGB').resize((540,960))
    a=np.asarray(im).astype(np.int16);lum=np.asarray(im.convert('L'))
    light=np.median(lum)>128
    F=ImageFilter.MaxFilter(31) if light else ImageFilter.MinFilter(31)
    bg=np.asarray(im.filter(F).filter(ImageFilter.GaussianBlur(12))).astype(np.int16)
    ink=np.abs(a-bg).max(axis=2)>30
    out=np.asarray(im).copy()//3; out[ink]=[255,80,80]
    o=Image.fromarray(out.astype(np.uint8))
    from PIL import ImageDraw; ImageDraw.Draw(o).rectangle([32,110,508,850],outline=(0,255,0))
    ims.append(o)
W=Image.new('RGB',(540*len(ims),960))
for i,o in enumerate(ims): W.paste(o,(540*i,0))
W.resize((270*len(ims),480)).save(sys.argv[1])
