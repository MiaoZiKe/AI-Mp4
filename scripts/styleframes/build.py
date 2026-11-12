"""風格樣張：組 HTML → headless Chrome 截圖 1080×1920 → 拼對照圖。
用法：python3 scripts/styleframes/make_assets.py && python3 scripts/styleframes/build.py"""
import os, json, subprocess, glob, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'out/what-is-server/styleframes'); AS = os.path.join(OUT, 'assets'); HT = os.path.join(OUT, 'html'); os.makedirs(HT, exist_ok=True)
META = json.load(open(os.path.join(AS, 'meta.json')))
CHROME = os.environ.get('REMOTION_BROWSER') or glob.glob('/opt/pw-browsers/chromium_headless_shell-*/chrome-*/chrome-headless-shell')[0]

def font_css():
    m = json.load(open(os.path.join(ROOT, 'public/fonts/manifest.json')))
    return '\n'.join(f"@font-face{{font-family:'{f['family']}';font-weight:{f['weight']};src:url('file://{ROOT}/public/{f['file']}') format('woff2');unicode-range:{f['unicodeRange']};}}" for f in m)

BASE = """*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden}
body{position:relative;font-family:'Inter','Noto Sans TC',sans-serif;-webkit-font-smoothing:antialiased}
img{position:absolute;display:block}
.abs{position:absolute}
.zh{font-family:'Noto Sans TC',sans-serif;font-weight:900}
.en{font-family:'Inter',sans-serif}
/* 手機螢幕（HTML 自製，不是任何真實 App） */
.scr{position:absolute;background:#F4F2EC;border-radius:10px;overflow:hidden;font-family:'Noto Sans TC',sans-serif}
.scr .bar{display:flex;align-items:center;gap:14px;padding:22px 26px 16px}
.scr .av{width:50px;height:50px;border-radius:50%;background:#D9D7D0}
.scr .ln{height:14px;border-radius:7px;background:#DDDBD4}
.scr .spin{width:50px;height:50px;border-radius:50%;border:6px solid #D5D3CC;border-top-color:#7A7870;margin:6px auto 0;transform:rotate(38deg)}
.scr .err{margin:24px 30px 0;padding:30px 20px 32px;background:#fff;border-radius:22px;text-align:center;box-shadow:0 2px 0 #E4E1D8}
.scr .t1{font-weight:900;font-size:50px;line-height:1.2;color:#1E1B16;letter-spacing:.02em}
.scr .t2{font-weight:700;font-size:30px;color:#77746B;margin-top:8px}
.scr .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:30px}
.scr .grid i{display:block;aspect-ratio:1;background:#E3E1DA}
"""
def page(name, css, body):
    html = f"<!doctype html><html lang='zh-Hant'><head><meta charset='utf-8'><style>{font_css()}\n{BASE}\n{css}</style></head><body>{body}</body></html>"
    p = os.path.join(HT, name + '.html'); open(p, 'w').write(html); return p

def shot(html, png, w=1080, h=1920):
    subprocess.run([CHROME, '--no-sandbox', '--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--virtual-time-budget=6000',
                    f'--window-size={w},{h}', f'--screenshot={png}', 'file://' + html], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def im(name, x, y, rot=0, style=''):
    t = f'transform:rotate({rot}deg);' if rot else ''
    return f"<img src='file://{AS}/{name}' style='left:{x}px;top:{y}px;{t}{style}'>"

def body_at(name, x, y, rot=0, style=''):
    """用『紙本體』的左上角定位（PNG 四邊有陰影留白）"""
    px, py = META[name.replace('.png', '') + '-body'][:2] if name.replace('.png', '') + '-body' in META else (40, 40)
    return im(name, x - px, y - py, rot, style)

def screen(x, y, w, h, extra=''):
    s = w / 526
    return f"""<div class='scr' style='left:{x}px;top:{y}px;width:{w}px;height:{h}px;{extra}'><div style='width:526px;transform:scale({s});transform-origin:0 0'>
<div class='bar'><div class='av'></div><div style='flex:1'><div class='ln' style='width:46%'></div><div class='ln' style='width:28%;margin-top:10px;opacity:.7'></div></div></div>
<div class='spin'></div>
<div class='err'><div class='t1'>無法載入</div><div class='t2'>請再試一次</div></div>
<div class='grid'>{'<i></i>' * 12}</div></div></div>"""

# ================= 方向 A：桌面紙拼貼 =================
A_CSS = """
body{background:#EFE6D4;color:#1E1B16}
.hd{position:absolute;left:64px;right:64px;top:228px;height:64px;display:flex;justify-content:space-between;align-items:center}
.hd .l{display:flex;align-items:center;gap:14px;font:900 40px 'Noto Sans TC';letter-spacing:.04em}
.hd .l img{position:static;width:26px;height:26px}
.hd .r{font:700 26px 'Noto Sans TC';letter-spacing:.08em;color:#1F3A5F;border:3px solid #1F3A5F;border-radius:6px;padding:6px 20px}
.dark .hd .l{color:#FFFDF7}.dark .hd .r{color:#F2E9D5;border-color:#F2E9D5}
.mk{background-repeat:no-repeat;background-position:center 78%;background-size:104% 62%;padding:0 .06em;margin:0 -.03em}
.cap{position:absolute;left:64px;width:952px;top:1300px;height:232px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.cap .z{font:900 72px/1.2 'Noto Sans TC';letter-spacing:.02em;white-space:nowrap}
.cap .z .en{font-weight:800;letter-spacing:0}
.cap .e{font:600 30px/1.3 'Inter';color:#5B5245;margin-top:12px}
.src{position:absolute;left:84px;top:1601px;width:470px;height:62px;display:flex;align-items:center;padding-left:22px;font:700 24px 'Noto Sans TC';color:#3A2F1C;letter-spacing:.02em}
"""
def a_header():
    return f"<div class='hd'><div class='l'><img src='file://{AS}/a-dot.png'>白話國際</div><div class='r'>國際白話講</div></div>"
def mk(txt, w, cls=''):
    return f"<span class='mk {cls}' style=\"background-image:url('file://{AS}/a-mark-{w}.png')\">{txt}</span>"
def a_cap(zh, en, dark=False):
    return im('a-caption-dark.png' if dark else 'a-caption.png', 24, 1260) + f"<div class='cap'><div class='z'>{zh}</div><div class='e'>{en}</div></div>"
def a_src():
    return im('a-src.png', 64, 1581) + "<div class='src'>來源：Meta 工程部落格 2021/10</div>"

def A1():
    bx, by = 240, 770
    sx, sy, sw, sh = bx + 0.062 * 600, by + 0.088 * 1164, 0.876 * 600, 0.78 * 1164
    b = im('a-desk.png', 0, 0) + a_header()
    b += body_at('a-phone.png', bx, by) + screen(round(sx), round(sy), round(sw), round(sh))
    b += f"<div class='abs' style='left:0;top:0;width:1080px;height:1920px;transform:rotate(-1.6deg);transform-origin:540px 560px'>" + im('a-strip-hook.png', 40, 294)
    b += """<div class='abs zh' style='left:150px;top:354px;width:780px'>
<div style='font-size:132px;line-height:1.08;letter-spacing:.01em'><span class='en' style='font-weight:800'>IG</span> 掛過</div>
<div style='font-size:132px;line-height:1.12;letter-spacing:.01em;white-space:nowrap'>約 <span style='color:#D9482B;font-size:176px'><span class='en' style='font-weight:800'>6</span> 小時</span></div>
<div style='font-size:54px;line-height:1.3;margin-top:14px;color:#3A342B'>那次""" + mk('不是你', 250) + """網路爛</div></div></div>"""
    b += im('a-tape-y.png', 118, 300, -5) + im('a-tape-m.png', 742, 286, 4)
    b += a_cap('先' + mk('怪自己', 250) + '網路爛？', 'Do you blame your own connection first?') + a_src()
    return page('A-1', A_CSS, b)

def A2():
    b = im('a-desk.png', 0, 0) + a_header()
    for i, (x, y, r) in enumerate(((-6, 1716, -74), (22, 1618, -70), (52, 1238, -58), (104, 1160, -52), (164, 1090, -46))):
        b += im(f'a-dash-{i}.png', x, y, r)
    b += body_at('a-rack.png', 170, 336)
    b += "<div class='abs' style='left:0;top:0;width:1080px;height:1920px;transform:rotate(-4deg);transform-origin:720px 640px'>" + im('a-label.png', 412, 452)
    b += "<div class='abs' style='left:452px;top:492px;width:560px;height:300px;display:flex;flex-direction:column;justify-content:center;padding-left:46px'>"
    b += "<div class='en' style='font-weight:800;font-size:128px;line-height:1;letter-spacing:-.02em'>Server</div>"
    b += "<div class='zh' style='font-size:66px;line-height:1.25;margin-top:10px;letter-spacing:.06em'>" + mk('伺服器', 230) + "</div></div>"
    b += im('a-tape-m.png', 640, 440, 3) + "</div>"
    b += a_cap('就叫 ' + mk("<span class='en'>Server</span>", 300), 'That kind of computer is called a server.')
    return page('A-2', A_CSS, b)

def A3():
    b = im('a-mat.png', 0, 0) + a_header()
    b += body_at('a-pass.png', 90, 336)
    b += "<div class='abs' style='left:0;top:0;width:1080px;height:1920px;transform:rotate(4deg);transform-origin:540px 1135px'>" + im('a-red.png', 120, 970)
    b += "<div class='abs zh' style='left:160px;top:1010px;width:760px;height:250px;display:flex;align-items:center;justify-content:center;font-size:172px;color:#FFFDF7;letter-spacing:.04em'>出事？</div>"
    b += im('a-tape-y.png', 96, 985, 58) + "</div>"
    b += a_cap('廚房' + mk('出事', 220) + '了呢？', 'But what if something goes wrong at the kitchen?', dark=True)
    return page('A-3', A_CSS, f"<div class='dark'>{b}</div>")

# ================= 方向 B：實拍照片大字報 =================
B_CSS = """
body{background:#0E1320;color:#F6F2E8}
.hd{position:absolute;left:64px;right:64px;top:228px;height:60px;display:flex;justify-content:space-between;align-items:center}
.hd .l{display:flex;align-items:center;gap:14px;font:900 38px 'Noto Sans TC';letter-spacing:.06em}
.hd .l i{display:block;width:20px;height:20px;background:#F4E04D}
.hd .r{font:700 24px 'Noto Sans TC';letter-spacing:.12em;color:#E4DFD2;border:2px solid rgba(246,242,232,.55);padding:6px 18px}
.hl{background-repeat:no-repeat;background-position:center 60%;background-size:100% 84%;color:#0E1320;padding:0 .14em;margin:0 .02em}
.cap{position:absolute;left:64px;width:952px;top:1318px;text-align:center}
.cap .z{font:900 70px/1.25 'Noto Sans TC';letter-spacing:.02em;white-space:nowrap;text-shadow:0 0 2px #0E1320,0 3px 14px rgba(14,19,32,.9),0 0 3px #0E1320}
.cap .z .hl{text-shadow:none}
.cap .z .en{font-weight:800;letter-spacing:0}
.cap .e{font:600 29px/1.3 'Inter';color:#D9D3C5;margin-top:16px;text-shadow:0 2px 8px rgba(14,19,32,.9)}
.src{position:absolute;left:64px;top:1612px;font:700 23px 'Noto Sans TC';color:#B8B2A4;letter-spacing:.04em}
.big{position:absolute;left:64px;width:952px;text-shadow:0 6px 40px rgba(14,19,32,.75)}
"""
def b_header():
    return "<div class='hd'><div class='l'><i></i>白話國際</div><div class='r'>國際白話講</div></div>"
def hl(txt, w):
    return f"<span class='hl' style=\"background-image:url('file://{AS}/b-mark-{w}.png')\">{txt}</span>"
def b_cap(zh, en):
    return f"<div class='cap'><div class='z'>{zh}</div><div class='e'>{en}</div></div>"

def B1():
    x, y, w, h = META['b1-body']
    sx, sy, sw, sh = x + 0.062 * w, y + 0.088 * h, 0.876 * w, 0.78 * h
    b = im('b1-bg.png', 0, 0) + b_header()
    b += screen(round(sx), round(sy), round(sw), round(sh), "background:#E6E2D8;box-shadow:0 0 90px rgba(233,228,216,.22);-webkit-mask-image:linear-gradient(#000 0,#000 41%,rgba(0,0,0,.1) 48%,transparent 53%);")
    b += """<div class='big zh' style='top:322px'>
<div style='font-size:134px;line-height:1.1'><span class='en' style='font-weight:800'>IG</span> 掛過</div>
<div style='font-size:134px;line-height:1.3;white-space:nowrap;text-shadow:none'><span style='text-shadow:0 6px 40px rgba(14,19,32,.75)'>約</span> """ + hl("<span style='font-size:168px'><span class='en' style='font-weight:800'>6</span> 小時</span>", 470) + """</div>
<div style='font-size:50px;line-height:1.3;font-weight:700;margin-top:8px;color:#EDE8DB'>那次，<span style='border-bottom:7px solid #F4E04D;padding-bottom:2px'>不是你</span>網路爛</div></div>"""
    b += b_cap('先' + hl('怪自己', 250) + '網路爛？', 'Do you blame your own connection first?')
    b += "<div class='src'>來源：Meta 工程部落格 2021/10</div>"
    return page('B-1', B_CSS, b)

def B2():
    b = im('b2-bg.png', 0, 0) + b_header()
    b += """<div class='big' style='top:770px'>
<div class='zh' style='font-weight:700;font-size:44px;letter-spacing:.12em;color:#F4E04D;margin-bottom:6px'>那種電腦，就叫</div>
<div class='en' style='font-weight:800;font-size:236px;line-height:1.02;letter-spacing:-.035em;margin-left:-10px'>SERVER</div>
<div class='zh' style='font-size:50px;font-weight:700;display:flex;align-items:center;gap:18px;margin-top:6px;text-shadow:none'><span style='color:#D9D3C5;text-shadow:0 2px 10px rgba(14,19,32,.9)'>中文叫</span>""" + hl("<span style='font-size:100px;font-weight:900;letter-spacing:.06em;line-height:1.25'>伺服器</span>", 330) + """</div></div>"""
    b += b_cap('就叫 ' + hl("<span class='en'>Server</span>", 300), 'That kind of computer is called a server.')
    return page('B-2', B_CSS, b)

def B3():
    b = im('b3-bg.png', 0, 0) + b_header()
    b += """<div class='big zh' style='top:560px;text-align:center'>
<div style='font-size:46px;font-weight:700;letter-spacing:.5em;margin-right:-.5em;color:#E4DFD2'>廚房</div>
<div style='width:120px;height:5px;background:#E4DFD2;margin:22px auto 0;opacity:.8'></div>
<div style='font-size:300px;line-height:1.15;color:#FF6B35;letter-spacing:.02em;white-space:nowrap;margin-left:-40px;margin-right:-40px;text-shadow:0 8px 50px rgba(14,19,32,.85)'>出事？</div></div>"""
    b += b_cap('廚房' + hl('出事', 200) + '了呢？', 'But what if something goes wrong at the kitchen?')
    return page('B-3', B_CSS, b)

def compare():
    S = 0.5; cw, chh = 540, 960; gap = 36; lab = 150; top = 250; W = lab + 2 * cw + 3 * gap; H = top + 3 * (chh + gap) + 60
    rows = [('鉤子', 's01', '第 0 幀就有主張'), ('解說', 's05', '名詞出現的那一鏡'), ('轉', 's10', '那萬一，廚房出事了呢？')]
    css = f"""html,body{{width:{W}px;height:{H}px}}body{{background:#17181C;color:#F3F0E8;font-family:'Inter','Noto Sans TC',sans-serif}}
.col{{position:absolute;top:40px;width:{cw}px}}.col h1{{font:900 46px 'Noto Sans TC';letter-spacing:.02em}}.col h1 b{{font:800 54px 'Inter';margin-right:14px;color:#F4E04D}}
.col p{{font:400 25px/1.45 'Noto Sans TC';color:#C9C5BA;margin-top:12px}}
.row{{position:absolute;left:{gap}px;width:{lab}px}}.row .a{{font:900 44px 'Noto Sans TC'}}.row .b{{font:800 26px 'Inter';color:#F4E04D;margin-top:8px}}.row .c{{font:400 21px/1.4 'Noto Sans TC';color:#A9A59B;margin-top:10px;padding-right:14px}}
img.f{{width:{cw}px;height:{chh}px;border-radius:6px}}"""
    b = f"<div class='col' style='left:{lab + gap}px'><h1><b>A</b>桌面紙拼貼</h1><p>米色桌面、撕邊紙條、剪貼的實物照片。<br>親切、像有人在桌上擺給你看。</p></div>"
    b += f"<div class='col' style='left:{lab + 2 * gap + cw}px'><h1><b>B</b>實拍照片大字報</h1><p>滿版真實照片、深色調、超大字加螢光筆。<br>紀實、有份量，像紀錄片預告。</p></div>"
    for i, (a, s, c) in enumerate(rows):
        y = top + i * (chh + gap)
        b += f"<div class='row' style='top:{y + 10}px'><div class='a'>{a}</div><div class='b'>{s}</div><div class='c'>{c}</div></div>"
        b += f"<img class='f' src='file://{OUT}/A-{i + 1}.png' style='left:{lab + gap}px;top:{y}px'><img class='f' src='file://{OUT}/B-{i + 1}.png' style='left:{lab + 2 * gap + cw}px;top:{y}px'>"
    p = page('compare', css, b)
    shot(p, os.path.join(ROOT, 'out/what-is-server/styleframes-compare.png'), W, H)

if __name__ == '__main__':
    only = sys.argv[1:]
    for n, f in (('A-1', A1), ('A-2', A2), ('A-3', A3), ('B-1', B1), ('B-2', B2), ('B-3', B3)):
        if only and n not in only: continue
        shot(f(), os.path.join(OUT, n + '.png')); print('ok', n)
    if not only or 'compare' in only: compare(); print('ok compare')
