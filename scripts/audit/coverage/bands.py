import sys,numpy as np
from PIL import Image,ImageFilter
for p in sys.argv[1:]:
    im=Image.open(p).convert('RGB').resize((540,960))
    a=np.asarray(im).astype(np.int16);light=np.median(np.asarray(im.convert('L')))>128
    F=ImageFilter.MaxFilter(31) if light else ImageFilter.MinFilter(31)
    bg=np.asarray(im.filter(F).filter(ImageFilter.GaussianBlur(12))).astype(np.int16)
    ink=np.abs(a-bg).max(axis=2)>30
    rows=ink[:,32:508].mean(1)>0.003
    occ=np.where(rows)[0]*2
    # gaps >=60px anywhere in 0..1920 listing
    gaps=[];prev=None
    for y in occ:
        if prev is not None and y-prev>=60: gaps.append((int(prev),int(y)))
        prev=y
    print(p.split('/')[-1][:28].ljust(28),'last ink y=',int(occ.max()),'gaps>=60:',gaps)
