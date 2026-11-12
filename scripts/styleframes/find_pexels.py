"""依關鍵字在 Pexels 照片鏡像（HF 資料集 opendiffusionai/pexels-photos-janpf，約 13 萬張）裡找圖，再只抓需要的那幾張。
做法與規則見 docs/style-v3/photos-howto.md。

找圖： python3 scripts/styleframes/find_pexels.py 關鍵字 [關鍵字…] [--any] [--people] [--limit=30] [--not=字,字]
        關鍵字是英文（圖說是英文），預設全部都要出現（--any＝任一個）；可寫片語 "circuit board"。
        預設排除圖說裡提到人的照片（--people 才包含）。輸出：md5、Pexels 編號、圖說開頭。
抓圖： python3 scripts/styleframes/find_pexels.py --fetch <slug> 名稱=md5 [名稱=md5 …]
        存成 out/<slug>/assets-raw/photos/<名稱>.jpg（名稱＝之後的紙材名後半：polaroid-<名稱>、print-<名稱>），並印出可貼進 assets.md 的表格列。
索引檔（49MB）第一次用時下載到 out/_pexels/index.jsonl.gz（不 commit）。"""
import sys, os, re, gzip, json, subprocess, glob
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
IDX = os.path.join(ROOT, 'out', '_pexels', 'index.jsonl.gz')
URL = 'https://huggingface.co/datasets/opendiffusionai/pexels-photos-janpf/resolve/main/pexels-130k-jsonl-gz'
PEOPLE = re.compile(r'\b(person|people|man|men|woman|women|girl|boy|child|children|kid|kids|baby|face|faces|portrait|selfie|couple|bride|groom|crowd|he|she|his|her|him|someone|lady|guy|model|worker|workers|student|students|hand|hands)\b', re.I)

def index():
    if not os.path.exists(IDX) or os.path.getsize(IDX) < 1e6:
        os.makedirs(os.path.dirname(IDX), exist_ok=True)
        subprocess.run(['curl', '-sSL', '-m', '600', '-o', IDX, URL], check=True)
    with gzip.open(IDX, 'rt') as f:
        for line in f:
            try: yield json.loads(line)
            except Exception: pass

def pid(url): m = re.search(r'/photos/(\d+)/', url or ''); return m.group(1) if m else '?'

def find(args):
    opt = lambda k, d=None: next((a.split('=', 1)[1] for a in args if a.startswith(f'--{k}=')), d)
    kws = [a.lower() for a in args if not a.startswith('--')]
    nots = [x.lower() for x in (opt('not') or '').split(',') if x]
    limit = int(opt('limit', 30)); n = 0
    for r in index():
        cap = ' '.join(str(r.get(k, '')) for k in ('internlm7b', 'llava38b')); low = cap.lower()
        hit = [k in low for k in kws]
        if not (any(hit) if '--any' in args else all(hit)): continue
        if any(x in low for x in nots): continue
        if '--people' not in args and PEOPLE.search(cap): continue
        print(f"{r['md5']}  pexels {pid(r.get('url')):>9}  {str(r.get('internlm7b') or r.get('llava38b'))[:150]}")
        n += 1
        if n >= limit: break
    print(f'— {n} 張（上限 {limit}）。挑好後：python3 scripts/styleframes/find_pexels.py --fetch <slug> 名稱=md5 …', file=sys.stderr)

def fetch(args):
    slug, pairs = args[0], dict(a.split('=', 1) for a in args[1:])
    out = os.path.join(ROOT, 'out', slug, 'assets-raw', 'photos'); os.makedirs(out, exist_ok=True)
    want = set(pairs.values()); info = {r['md5']: r for r in index() if r['md5'] in want}
    subprocess.run([sys.executable, os.path.join(HERE, 'fetch_pexels.py'), out, *pairs.values()], check=True)
    for name, md5 in pairs.items():
        got = glob.glob(os.path.join(out, md5 + '.*'))
        if not got: print(f'✖ {name}（{md5}）沒抓到'); continue
        from PIL import Image
        im = Image.open(got[0]).convert('RGB'); dst = os.path.join(out, name + '.jpg')
        im.save(dst, quality=93); os.remove(got[0]) if got[0] != dst else None
        p = pid(info.get(md5, {}).get('url'))
        print(f"| `{name}` | {name}.jpg | {im.width}×{im.height} | {p} https://www.pexels.com/photo/{p}/ | （內容，有沒有人／商標） | 未核對 | （用在哪幾鏡） |")

if __name__ == '__main__':
    a = sys.argv[1:]
    if not a: sys.exit(__doc__)
    fetch(a[1:]) if a[0] == '--fetch' else find(a)
