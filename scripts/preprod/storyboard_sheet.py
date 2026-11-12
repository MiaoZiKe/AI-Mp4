#!/usr/bin/env python3
"""分鏡總覽圖：讀 videos/<slug>/storyboard.draft.json，輸出 out/<slug>/storyboard-sheet-N.png。
用法：python3 scripts/preprod/storyboard_sheet.py what-is-server
每鏡一格（鏡號、起訖秒、旁白、畫面、畫面上的字、轉場）；有樣張的鏡放縮圖。HTML＋headless Chrome 截圖。"""
import os, sys, json, glob, html, subprocess
from PIL import Image, ImageChops

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
slug = sys.argv[1] if len(sys.argv) > 1 else 'what-is-server'
OUT = os.path.join(ROOT, 'out', slug)
CHROME = os.environ.get('REMOTION_BROWSER') or glob.glob('/opt/pw-browsers/chromium_headless_shell-*/chrome-*/chrome-headless-shell')[0]
d = json.load(open(os.path.join(ROOT, 'videos', slug, 'storyboard.draft.json')))
# 樣張對應（鏡 id → 檔名前綴序號）
FRAMES = {'s01': '1', 's05': '2', 's10': '3'}
BEAT = {'起': '#C2441F', '承': '#1F6A78', '轉': '#8A5E00', '合': '#5A4D7A', '片尾卡': '#4B5675'}
W, BG = 1080, (251, 245, 234)

def font_css():
    m = json.load(open(os.path.join(ROOT, 'public/fonts/manifest.json')))
    return '\n'.join(f"@font-face{{font-family:'{f['family']}';font-weight:{f['weight']};src:url('file://{ROOT}/public/{f['file']}') format('woff2');unicode-range:{f['unicodeRange']};}}" for f in m)

CSS = """*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;background:#FBF5EA;color:#14213D;font-family:'Inter','Noto Sans TC',sans-serif;padding:40px 36px 60px}
h1{font-size:50px;font-weight:900;line-height:1.25}
.sub{font-size:28px;color:#4B5675;margin:10px 0 26px;line-height:1.5}
.card{background:#FFFDF8;border:2px solid #E6D9C2;border-radius:14px;margin-bottom:22px;overflow:hidden}
.bar{display:flex;align-items:center;gap:16px;padding:12px 22px;color:#fff;font-size:30px;font-weight:800}
.bar .id{font-size:36px}.bar .t{margin-left:auto;font-weight:600}
.in{padding:18px 22px 20px}
.nar{font-size:42px;font-weight:900;line-height:1.35;margin-bottom:14px}
.row{display:flex;gap:14px;font-size:29px;line-height:1.5;margin-top:10px}
.k{flex:0 0 96px;font-weight:800;color:#5F6673}
.v{flex:1}
.txt .v{font-weight:800;color:#C2441F}
.pause{display:inline-block;background:#FCEBCB;color:#8A5300;border-radius:8px;padding:2px 12px;font-size:26px;font-weight:800;margin-left:8px}
.thumbs{display:flex;gap:18px;margin-top:16px}
.thumbs figure{flex:0 0 300px}
.thumbs img{width:300px;display:block;border:2px solid #E6D9C2;border-radius:8px}
.thumbs figcaption{font-size:26px;font-weight:800;color:#4B5675;margin-top:6px;text-align:center}
.foot{font-size:26px;color:#5F6673;line-height:1.5;margin-top:8px}
"""

def e(s): return html.escape(str(s or ''))

shots, t = [], 0.0
pauses = {p['after']: p['sec'] for p in d.get('pauses', [])}
for s in d['shots']:
    s = dict(s); s['t0'] = t; t += s['estSec']; s['t1'] = t; shots.append(s)

def seg(s):
    b = s['beat']
    if b == 'end': return '片尾卡'
    acc = 0
    for name, sec in d['segmentsSec'].items():
        acc += sec
        if s['t0'] < acc - 0.01: return name
    return '合'

def card(s):
    g = seg(s)
    nar = s['narration'] if s.get('tts') else '（無旁白）'
    pz = f"<span class='pause'>之後停 {pauses[s['id']]} 秒</span>" if s['id'] in pauses else ''
    th = ''
    if s['id'] in FRAMES:
        n = FRAMES[s['id']]
        th = "<div class='thumbs'>" + ''.join(
            f"<figure><img src='file://{OUT}/styleframes/{k}-{n}.png'><figcaption>樣張 {k}-{n}（{lab}）</figcaption></figure>"
            for k, lab in (('A', '紙拼貼'), ('B', '照片大字'))) + '</div>'
    return f"""<div class='card'><div class='bar' style='background:{BEAT[g]}'><span class='id'>{s['id']}</span><span>{g}</span>
<span class='t'>{s['t0']:.1f}–{s['t1']:.1f} 秒（{s['estSec']} 秒）</span></div><div class='in'>
<div class='nar'>{e(nar)}{pz}</div>
<div class='row'><div class='k'>畫面</div><div class='v'>{e(s['visual'])}</div></div>
<div class='row'><div class='k'>何時變</div><div class='v'>{e(s['trigger'])}</div></div>
<div class='row txt'><div class='k'>畫面字</div><div class='v'>{e(s.get('onScreenText') or '無（只有字幕）')}</div></div>
<div class='row'><div class='k'>接下鏡</div><div class='v'>{e(s['transition'])}</div></div>{th}</div></div>"""

def trim(png):
    im = Image.open(png).convert('RGB')
    box = ImageChops.difference(im, Image.new('RGB', im.size, BG)).getbbox()
    im.crop((0, 0, im.width, min(im.height, box[3] + 50))).save(png)
    return Image.open(png).size

pages = [('起＋承', [s for s in shots if seg(s) in ('起', '承')]), ('轉', [s for s in shots if seg(s) == '轉']),
         ('合＋片尾卡', [s for s in shots if seg(s) in ('合', '片尾卡')])]
os.makedirs(os.path.join(OUT, 'sheet-html'), exist_ok=True)
for i, (name, ss) in enumerate(pages, 1):
    body = f"<h1>分鏡總覽 {i}/{len(pages)}｜{name}</h1><div class='sub'>{e(d['title'])}<br>共 {len(shots)} 鏡、預估 {d['estTotalSec']} 秒（秒數依字數估，配音後會變）。本頁 {ss[0]['id']}–{ss[-1]['id']}。</div>"
    body += ''.join(card(s) for s in ss)
    body += "<div class='foot'>畫面描述以方向 A（桌面紙拼貼）為準；樣張只做了 s01、s05、s10 三鏡。</div>"
    hp = os.path.join(OUT, 'sheet-html', f'sheet-{i}.html')
    open(hp, 'w').write(f"<!doctype html><html lang='zh-Hant'><head><meta charset='utf-8'><style>{font_css()}\n{CSS}</style></head><body>{body}</body></html>")
    png = os.path.join(OUT, f'storyboard-sheet-{i}.png')
    subprocess.run([CHROME, '--no-sandbox', '--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                    '--virtual-time-budget=8000', f'--window-size={W},12000', f'--screenshot={png}', 'file://' + hp],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(png, trim(png))
