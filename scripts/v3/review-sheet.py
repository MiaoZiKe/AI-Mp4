#!/usr/bin/env python3
"""python3 scripts/v3/review-sheet.py <slug> → out/<slug>-review.png
交付用評審圖：selfcheck 的 9 個關鍵時刻拼圖（out/<slug>/selfcheck/grid9.png）＋獨立評審六項分數。
分數只從 videos/<slug>/review.md 第一張評分表讀（和 selfcheck.mjs 同一條規則），這支腳本不改分數。"""
import os, sys, re, json, glob, html, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = os.environ.get('REMOTION_BROWSER') or glob.glob('/opt/pw-browsers/chromium_headless_shell-*/chrome-*/chrome-headless-shell')[0]
ITEMS = ['前 2 秒抓人', '手機上看得清', '動作自然', '畫面變化', '構圖', '聲畫匹配']
slug = sys.argv[1]
vdir, odir = os.path.join(ROOT, 'videos', slug), os.path.join(ROOT, 'out', slug, 'selfcheck')
txt = open(os.path.join(vdir, 'review.md'), encoding='utf8').read()
scores = {}
for k in ITEMS:
    m = re.search(r'\|\s*' + re.escape(k) + r'\s*\|\s*(\d+(?:\.\d+)?)', txt)
    scores[k] = m.group(1) if m else '?'
rnd = re.search(r'^##\s*(第 \d+ 輪[^\n]*)', txt, re.M)
sc = json.load(open(os.path.join(vdir, 'selfcheck.json')))
sb = json.load(open(os.path.join(vdir, 'storyboard.json')))
script = json.load(open(os.path.join(vdir, 'script.json')))
frames = sc['grid9']['frames']
def scene_of(f):
    return [s['id'] for s in sb['scenes'] if s['startFrame'] <= f][-1]
m = json.load(open(os.path.join(ROOT, 'public/fonts/manifest.json')))
fonts = '\n'.join(f"@font-face{{font-family:'{f['family']}';font-weight:{f['weight']};src:url('file://{ROOT}/public/{f['file']}') format('woff2');unicode-range:{f['unicodeRange']};}}" for f in m)
gates = sc.get('gates', {})
gate_txt = '、'.join(f"{'✔' if v else ('–' if v is None else '✖')} {k}" for k, v in gates.items())
total = sb['scenes'][-1]['startFrame'] + sb['scenes'][-1]['durationFrames']
css = """*{box-sizing:border-box;margin:0}body{width:1080px;background:#F3EBDD;color:#221E19;font-family:'Inter','Noto Sans TC',sans-serif;padding:36px 36px 44px}
h1{font-size:44px;font-weight:900;line-height:1.25}.sub{font-size:24px;color:#5F5A52;margin:8px 0 22px;line-height:1.5}
.grid{position:relative;width:1008px;height:1792px;background:url('file://%s') 0 0/1008px 1792px}
.cap{position:absolute;background:#221E19;color:#fff;font-size:20px;font-weight:800;padding:3px 10px}
.scores{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-top:22px}
.s{background:#FFFDF8;border:2px solid #D9CDB8;padding:12px 6px;text-align:center}.s b{display:block;font-size:56px;font-weight:900;line-height:1.1}.s span{font-size:22px;font-weight:800;color:#5F5A52}
.foot{font-size:21px;color:#5F5A52;line-height:1.55;margin-top:16px}""" % os.path.join(odir, 'grid9.png')
caps = ''.join(f"<div class='cap' style='left:{(i % 3) * 336}px;top:{(i // 3) * 597.33:.0f}px'>{scene_of(f)}・{f / 30:.1f}s</div>" for i, f in enumerate(frames))
body = f"""<h1>{html.escape(script['title'])}</h1>
<div class='sub'>9 個關鍵時刻（幀 {'、'.join(map(str, frames))}）｜全片 {total} 幀 {total / 30:.2f} 秒｜獨立評審 {html.escape(rnd.group(1) if rnd else '')}</div>
<div class='grid'>{caps}</div>
<div class='scores'>{''.join(f"<div class='s'><b>{scores[k]}</b><span>{k}</span></div>" for k in ITEMS)}</div>
<div class='foot'>分數取自 videos/{slug}/review.md（沒參與製作的評審；評審沒有聽音檔，語氣與發音要人耳確認）。<br>量測關口：{html.escape(gate_txt)}</div>"""
hp = os.path.join(odir, 'review.html')
open(hp, 'w', encoding='utf8').write(f"<!doctype html><html lang='zh-Hant'><head><meta charset='utf-8'><style>{fonts}\n{css}</style></head><body>{body}</body></html>")
out = os.path.join(ROOT, 'out', f'{slug}-review.png')
subprocess.run([CHROME, '--no-sandbox', '--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1080,2330',
                '--virtual-time-budget=4000', f'--screenshot={out}', 'file://' + hp], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print('✔', os.path.relpath(out, ROOT), scores)
