#!/usr/bin/env python3
"""ai-make-video 的畫面（props）產生器：把每一鏡的鏡頭與紙片寫進 script.json。
只改各幕的 props／still 與頂層 cover；旁白、字幕、cue、配音設定一個字都不動（配音是時鐘）。
用法：python3 videos/ai-make-video/props.gen.py   （在 repo 根目錄執行）
時間一律寫成「cue id ± 幾幀」；聲波逐格換圖要的絕對幀，由 timeline.json 換算回最近的 cue。"""
import json, os, random

HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'script.json'), encoding='utf-8'))
TL = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
LEAD = 4
tl = {t['id']: t for t in TL['scenes']}
order = [t['id'] for t in TL['scenes']]
nxt = {a: tl[b]['startFrame'] for a, b in zip(order, order[1:])}

def anchors(sid):
    t = tl[sid]
    a = [('start', t['startFrame'])]
    for c in t.get('cues') or []:
        a.append((c['id'], c['frame'] - LEAD))
    return a

def AT(sid, f):
    """絕對幀 → 本幕裡最近的 cue ± 幾幀"""
    name, base = min(anchors(sid), key=lambda x: abs(f - x[1]))
    d = f - base
    return name if d == 0 else f'{name}{d:+d}'

def cue(sid, cid):
    return next(f for n, f in anchors(sid) if n == cid)

# ---------- 世界座標：每個鏡位的鏡頭中心；(u, v)＝該鏡位的畫面座標 ----------
ST = dict(H=(540, 960), B=(540, 2300), S1=(1700, 2700), S2=(2800, 3700), S3=(1700, 4700), S4=(2800, 5700), S5=(1700, 6700), T=(4600, 2400))
def P(st, u, v):
    cx, cy = ST[st]
    return dict(x=cx - 540 + u, y=cy - 960 + v)
def cam(st, s=1, **kw):
    cx, cy = ST[st]
    return dict(to=[cx, cy, s], **kw)

def strip(paper, st, u, v, w, lines, **kw):
    d = dict(type='strip', paper=paper, **(P(st, u, v) if st else dict(x=u, y=v)), w=w, lines=lines)
    d.update(kw)
    return d
def img(asset, st, u, v, w, **kw):
    d = dict(asset=asset, **(P(st, u, v) if st else dict(x=u, y=v)), w=w)
    d.update(kw)
    return d
def L(t, size, **kw):
    return dict(t=t, size=size, **kw)
DASH = lambda n, size=40: L('—' * n, size, color='ink2', ls=-0.08, lh=1.5)

# ---------- 聲波：6 條紙條長條，逐格換一張（每張是一個 bars 紙片，直接長好） ----------
rng = random.Random(20261113)
PAT = [[rng.choice([2, 3, 4, 5, 6, 7, 8, 9, 10]) for _ in range(6)] for _ in range(12)]
FLAT = [4] * 6
def bars(st, u, v, vals, w=400, h=300, color='blue', **kw):
    d = dict(type='bars', **P(st, u, v), w=w, h=h, max=10, barW=round(w / 6 * 0.56), valSize=2, labelSize=2,
             bars=[dict(v=x, color=color, val='') for x in vals], state=dict(grow=1), to='cut')
    d['from'] = 'cut'
    d.update(kw)
    return d
def wave(st, u, v, sid, f0, f1, step=3, last_until=None, k0=0, **kw):
    """f0–f1（絕對幀）之間每 step 幀換一張；最後一張留到 last_until"""
    out, fs = [], list(range(f0, f1, step))
    for i, f in enumerate(fs):
        d = bars(st, u, v, PAT[(k0 + i) % len(PAT)], at=AT(sid, f), **kw)
        if i < len(fs) - 1: d['until'] = f'{sid}.{AT(sid, fs[i + 1])}'
        elif last_until: d['until'] = last_until
        out.append(d)
    return out

NOTE = ['yellow', 'mint', 'red', 'blue', 'kraft']
NAME = ['題目', '稿子', '聲音', '畫面', '剪接']
def note(i, st, u, v, w, label=True, num=150, lab=112, **kw):
    lines = [L(str(i + 1), num if label else 230, lh=1.0, **(dict(color='white') if NOTE[i] == 'blue' else {}))]
    if label: lines.append(L(NAME[i], lab, lh=1.15, **(dict(color='white') if NOTE[i] == 'blue' else {})))
    return strip(f'note-{NOTE[i]}', st, u, v, w, lines, **kw)

props = {}

# ===== s01 鉤子：第 0 幀就完整（大紙條＋空麥克風拍立得＋聲波） =====
props['s01'] = dict(camera=cam('H'), items=[
    strip('polaroid-mic', 'H', 315, 1010, 430, [L('麥克風前沒人', 46)], id='mic', caption=True, rot=-4, until='end',
          tape=[dict(asset='tape-m', x=250, y=4, rot=3, w=170)]),
    *wave('H', 790, 1010, 's01', 0, nxt['s01'], last_until='s02'),
    strip('strip-hook2', None, 540, 520, 900, [L('這個聲音', 128, lh=1.1), L('[不是]真人錄的', 128, lh=1.2)], id='hook', layer='screen', rot=-1.4,
          align='left', pad=[70, 26], state=dict(mark=0), set=[dict(at='nothuman', mark=1)], until='s03', to='top',
          tape=[dict(asset='tape-y', x=150, y=8, rot=-5), dict(asset='tape-m', x=790, y=0, rot=4)]),
    strip('tag-red', 'H', 470, 822, 290, [L('電腦念的', 66, color='white', ls=0.04)], rot=6, z=5, at='nothuman+10', until='s03', **{'from': 'slam'}),
])

# ===== s02 稿子也是 AI 先寫的：稿紙滑進來蓋住聲波，藍標籤、紅筆 =====
props['s02'] = dict(items=[
    *wave('H', 790, 1010, 's02', nxt['s01'], cue('s02', 'script') + 2, last_until='s03', k0=1),   # 聲波跳到稿紙蓋上來為止
    strip('script', 'H', 765, 985, 440, [DASH(8), DASH(7), DASH(8), DASH(5), DASH(8), DASH(6), DASH(3)], id='script', rot=3, z=3, at='script', until='s04',
          align='left', pad=[50, 40], **{'from': 'right'}),
    strip('tag-blue', 'H', 840, 742, 300, [L('AI 初稿', 68, color='white')], rot=5, z=6, at='draft', until='s04', **{'from': 'slam'}),
    img('underline', 'H', 745, 968, 290, rot=3, z=4, at='draft+12', until='s04', **{'from': 'wipe'}),
    img('circle', 'H', 700, 1102, 200, rot=3, z=4, at='draft+20', until='s04', **{'from': 'wipe'}),
])

# ===== s03 五張便利貼：鏡頭往下到白板中段，五張依序貼上，虛線串起來 =====
BN = [(250, 460), (790, 530), (300, 800), (800, 890), (540, 1125)]
ROTS = [-4, 3, 2, -3, 2]
p_b = [list(P('B', u, v).values()) for u, v in BN]
props['s03'] = dict(camera=cam('B', at='start', dur=16), punch='five', items=[
    dict(type='path', pts=p_b, z=-1, state=dict(grow=0), set=[dict(at='you', grow=1)], until='s05'),
    dict(type='path', pts=[p_b[4], [1050, 2520], list(P('S1', 320, 540).values())], z=-1, state=dict(grow=0), set=[dict(at='you+30', grow=1)], until='s06'),
    *[note(i, 'B', BN[i][0], BN[i][1], 250, label=False, id=f'b{i + 1}', rot=ROTS[i], at=f'five{d:+d}' if d else 'five', until='s16', to='cut', **{'from': 'slam'})
      for i, d in enumerate([0, 4, 7, 10, 12])],
])

# ===== s04 第一張：題目，只講一件事 =====
props['s04'] = dict(camera=cam('S1', at='start', dur=16), items=[
    note(0, 'S1', 320, 540, 400, rot=-3, z=2, at='n1', until='s06', **{'from': 'slam'}),
    strip('polaroid-notebook', 'S1', 300, 1030, 380, [L('先想一句話', 46)], caption=True, rot=-5, z=3, at='n1+22', until='s06', **{'from': 'left'},
          tape=[dict(asset='tape-y', x=250, y=4, rot=-4, w=170)]),
    strip('slip', 'S1', 790, 500, 400, [L('題目 A', 62, color='ink2')], rot=2, at='one-26', until='s04.one', to='right', exitDist=900),
    strip('slip', 'S1', 780, 660, 400, [L('題目 B', 62)], id='keep', rot=-2, at='one-22', until='s06'),
    strip('slip', 'S1', 795, 820, 400, [L('題目 C', 62, color='ink2')], rot=3, at='one-18', until='s04.one+5', to='right', exitDist=900),
    img('pin-red', 'S1', 612, 652, 60, z=5, at='one+9', until='s06', **{'from': 'slam'}),
    strip('label-s', 'S1', 775, 1020, 440, [L('只講[一件事]', 64)], rot=-3, z=4, at='one+12', until='s06', state=dict(mark=0), set=[dict(at='one+20', mark=1)], **{'from': 'slam'},
          tape=[dict(asset='tape-m', x=60, y=4, rot=-20, w=150)]),
    dict(type='path', pts=[list(P('S1', 320, 540).values()), [2200, 2900], list(P('S2', 790, 520).values())], z=-1, state=dict(grow=0), set=[dict(at='one+16', grow=1)], until='s07'),
])

# ===== s05 第二張：稿子，跟 AI 講清楚觀眾是誰、要幾個字 =====
props['s05'] = dict(camera=cam('S2', at='start', dur=16), items=[
    note(1, 'S2', 790, 520, 380, id='n2', rot=3, z=2, at='n2', until='s08', **{'from': 'slam'}),
    dict(type='phone', id='ph', layer='near', x=330, y=895, w=400, rot=-2, at='n2+26', state=dict(screen='chat', msgs=1),
         set=[dict(at='n2+40', msgs=2), dict(at='who-16', msgs=3)], until='s06', to='left', exitDist=900, **{'from': 'bottom'}),
    strip('label-s', None, 370, 720, 400, [L('寫給誰看？', 66)], layer='near', rot=-4, z=3, at='who', until='s06', to='left', exitDist=900, **{'from': 'slam'},
          tape=[dict(asset='tape-y', x=50, y=4, rot=-24, w=150)]),
    strip('label-s', None, 320, 930, 400, [L('要幾個字？', 66)], layer='near', rot=3, z=3, at='len', until='s06', to='left', exitDist=900, **{'from': 'slam'},
          tape=[dict(asset='tape-m', x=370, y=4, rot=20, w=150)]),
])

# ===== s06 實測：一分鐘大概 260 個字 =====
props['s06'] = dict(punch='num', items=[
    strip('polaroid-timer', 'S2', 300, 610, 400, [L('一分鐘', 50, ls=0.1)], caption=True, rot=-5, z=3, at='test', until='s08', **{'from': 'left'},
          tape=[dict(asset='tape-r', x=250, y=4, rot=4, w=170)]),
    dict(type='num', id='num', **P('S2', 560, 1030), w=660, z=5, at='num-6', value=260, unit='字', head=dict(t='一分鐘大概', size=54, color='ink3'), size=210,
         state=dict(count=0), set=[dict(at='num', count=1)], until='s07', to='top', exitDist=1100, **{'from': 'slam'},
         tape=[dict(asset='tape-y', x=320, y=4, rot=-3, w=180)]),
    dict(type='path', pts=[list(P('S2', 790, 520).values()), [2300, 4000], list(P('S3', 250, 480).values())], z=-1, state=dict(grow=0), set=[dict(at='num+16', grow=1)], until='s09'),
])

# ===== s07 第三張：聲音。稿子貼進配音工具，電腦念出來 =====
f_read = cue('s07', 'read')
props['s07'] = dict(camera=cam('S3', at='start', dur=16), items=[
    note(2, 'S3', 250, 480, 330, rot=-4, z=2, at='n3', until='s09', **{'from': 'slam'}),
    strip('script', 'S3', 650, 620, 360, [DASH(8), DASH(7), DASH(8), DASH(5), DASH(8), DASH(6), DASH(3)], rot=2, z=3, at='paste-8', until='s09',
          align='left', pad=[50, 40], moves=[dict(at='paste+4', to=dict(y=P('S3', 0, 730)['y'], rot=0), dur=8)], **{'from': 'top'}),
    strip('card-kraft', 'S3', 600, 990, 640, [L('配音工具', 96, ls=0.06)], box=[40, 26, 560, 150], z=4, at='n3+20', until='s09',
          tape=[dict(asset='tape-w', x=70, y=6, rot=-18, w=170), dict(asset='tape-w', x=575, y=6, rot=16, w=170)]),
    *wave('S3', 600, 1065, 's07', f_read, nxt['s07'] - 1, w=470, h=190, z=5, last_until='s09', k0=3),
    dict(type='path', pts=[list(P('S3', 250, 480).values()), [2200, 5100], list(P('S4', 260, 450).values())], z=-1, state=dict(grow=0), set=[dict(at='read+8', grow=1)], until='s10'),
])

# ===== s08 第四張：畫面，聲音先做好 =====
props['s08'] = dict(camera=cam('S4', at='start', dur=16), items=[
    note(3, 'S4', 250, 455, 320, id='n4', rot=-3, z=2, at='n4', until='s11', **{'from': 'slam'}),
    img('wavestrip', 'S4', 540, 1110, 900, id='ws', z=2, at='n4+18', until='s11', **{'from': 'left'}),
    *[bars('S4', 240 + 200 * k, 1098, PAT[k + 5], w=190, h=112, color='white', z=3, at=f'n4+{28 + 3 * k}', until='s11', onDark=True, growDur=6, stagger=1, state={}, **{'from': 'paste'}) for k in range(4)],
    strip('tag-mint', 'S4', 840, 1232, 280, [L('先做好', 68)], rot=-3, z=6, at='first', until='s11', **{'from': 'slam'}),
])

# ===== s09 再照著聲音貼自己拍的照片 =====
PH = [('street', 225, 740, 300, -4, '巷口', 'tape-y'), ('food', 540, 700, 290, 2, '午餐', 'tape-r'), ('desk', 850, 740, 300, 4, '書桌', 'tape-m')]
props['s09'] = dict(items=[
    *[img('arrow-yellow', 'S4', 225 + 312 * k, 975, 120, rot=90, z=4, at=f'follow+{3 * k}' if k else 'follow', until='s11') for k in range(3)],
    *[strip(f'polaroid-{n}', 'S4', u, v, w, [L(t, 48, ls=0.1)], caption=True, rot=r, z=5, at=f'photo+{d}' if d else 'photo', until='s11',
            tape=[dict(asset=tp, x=250 if n != 'food' else 235, y=4, rot=-3 + 3 * i, w=160)])
      for i, ((n, u, v, w, r, t, tp), d) in enumerate(zip(PH, [0, 5, 8]))],
    dict(type='path', pts=[list(P('S4', 250, 455).values()), [2300, 6000], list(P('S5', 270, 470).values())], z=-1, state=dict(grow=0), set=[dict(at='photo+16', grow=1)], until='s11'),
])

# ===== s10 最後一張：剪接，字幕自動上，再自己看一遍 =====
props['s10'] = dict(camera=cam('S5', at='start', dur=16), items=[
    note(4, 'S5', 270, 470, 330, rot=-3, z=2, at='n5', until='s12', **{'from': 'slam'}),
    strip('polaroid-scissors', 'S5', 760, 560, 400, [L('修一修', 50, ls=0.1)], caption=True, rot=4, z=3, at='n5+22', until='s12', **{'from': 'right'},
          tape=[dict(asset='tape-b', x=250, y=4, rot=-4, w=170)]),
    strip('strip-white', 'S5', 540, 1060, 800, [L('字慕自動上', 116, ls=0.02)], z=4, at='auto-10', until='s12', **{'from': 'bottom'}),
    strip('tag-blue', 'S5', 830, 905, 280, [L('軟體上的', 62, color='white')], rot=5, z=6, at='auto+8', until='s12', **{'from': 'slam'}),
    img('circle', 'S5', 415, 1060, 215, z=5, at='check', until='s12', **{'from': 'wipe'}),
    strip('patch-y', 'S5', 415, 1058, 136, [L('幕', 104)], pad=[4, 4], rot=-3, z=7, at='check+14', until='s12', **{'from': 'slam'}),
])

# ===== s11 轉：最容易出事的，不是工具（切割墊蓋上） =====
props['s11'] = dict(camera=cam('T', at='start', dur=12), mat=True, punch='nottool', items=[
    *[note(i, 'T', 140 + 200 * i, 600, 185, label=False, id=f't{i + 1}', layer='mat', rot=ROTS[i], at=f'start+{8 + i}', exitDist=1500, exitDur=8, until='s12') for i in range(5)],
    strip('tag-red', 'T', 140, 800, 250, [L('出事？', 76, color='white')], id='hop', layer='mat', rot=-4, z=5, at='but-12', exitDist=1500, exitDur=8, until='s12', **{'from': 'slam'},
          moves=[dict(at=f'but{d:+d}', to=dict(x=P('T', 140 + 200 * (k + 1), 0)['x'], rot=4 if k % 2 == 0 else -4), dur=3) for k, d in enumerate([-7, -2, 3, 8])]),
    *[dict(ref=r, at='nottool-5', exit=True, to='left') for r in ['t1', 't2', 't3', 't4', 't5', 'hop']],
    strip('strip-white', 'T', 540, 760, 900, [L('{不是}工具', 176, ls=0.04)], id='nt', layer='mat', rot=-2, z=6, at='nottool', until='s12', to='top', exitDist=1300, **{'from': 'slam'},
          tape=[dict(asset='tape-y', x=110, y=6, rot=-5), dict(asset='tape-r', x=660, y=0, rot=4)]),
])

# ===== s12 AI 很會把錯的事講得跟真的一樣順 =====
X13 = 594
props['s12'] = dict(items=[
    strip('strip-white', 'T', 540, 700, 840, [L('一年有 13 個月', 96)], id='fact', layer='mat', z=2, at='wrong', until='s14', to='left', exitDist=1500),
    img('tape-y', 'T', 165, 585, 180, layer='mat', rot=-32, z=3, at='smooth', until='s14', to='left', exitDist=1500, **{'from': 'slam'}),
    img('tape-m', 'T', 915, 815, 180, layer='mat', rot=-30, z=3, at='smooth+4', until='s14', to='left', exitDist=1500, **{'from': 'slam'}),
    strip('tag-blue', 'T', 770, 930, 320, [L('講得很順', 66, color='white')], layer='mat', rot=4, z=5, at='smooth+10', until='s13.every+12', to='right', exitDist=900, **{'from': 'slam'}),
])

# ===== s13 每個數字都要回頭查來源 =====
props['s13'] = dict(items=[
    img('circle', 'T', X13, 700, 240, layer='mat', z=4, at='every', until='s13.src', to='cut', **{'from': 'wipe'}),
    strip('label-s', 'T', 320, 960, 420, [L('真的嗎？', 80)], layer='mat', rot=-4, z=5, at='every+14', until='s14', to='left', exitDist=1500, **{'from': 'right'},
          tape=[dict(asset='tape-r', x=60, y=4, rot=-22, w=150)]),
    strip('patch-wide', 'T', X13, 698, 180, [L('12', 112)], layer='mat', pad=[4, 4], rot=-3, z=6, at='src', until='s14', to='left', exitDist=1500, **{'from': 'slam'}),
    strip('tag-kraft', 'T', 740, 1010, 340, [L('有來源', 76)], layer='mat', rot=3, z=6, at='src+10', until='s14', to='left', exitDist=1500, **{'from': 'slam'}),
])

# ===== s14 YouTube 2025 年也講明了 =====
props['s14'] = dict(items=[
    strip('label', 'T', 540, 720, 820, [L('YouTube 營利政策', 50, color='ink3', lh=1.3), L('[2025/7/15]', 92, lh=1.25)], id='date', layer='mat', rot=-2, z=3, at='start+8',
          pad=[30, 30], state=dict(mark=0), set=[dict(at='clear', mark=1)], until='s16', to='top', exitDist=1500, exitDur=8, **{'from': 'right'}),
    img('pin-red', 'T', 540, 545, 70, id='pin', layer='mat', z=5, at='yt', until='s15', to='cut', **{'from': 'slam'}),
    img('tape-y', 'T', 190, 560, 180, layer='mat', rot=-28, z=4, at='yt+8', until='s15', to='cut', **{'from': 'slam'}),
])

# ===== s15 大量複製的內容不能分潤 =====
r2 = random.Random(7)
copies = []
for k, d in enumerate([0, 4, 8, 11, 14, 16, 18, 19, 20]):
    copies.append(strip('copy', 'T', 560 + r2.randint(-70, 70), 930 + r2.randint(-40, 40), 300, [DASH(6, 44), DASH(5, 44), DASH(6, 44), DASH(4, 44), DASH(6, 44)], layer='mat',
                        rot=r2.uniform(-10, 10).__round__(1), z=6 + k, at=f'mass+{d}' if d else 'mass', until='s16', to='top', exitDist=1500, exitDur=8, align='left', pad=[44, 40]))
props['s15'] = dict(punch='no', items=[
    dict(ref='date', at='start', x=P('T', 300, 0)['x'], y=P('T', 0, 470)['y'], w=440, rot=-4, dur=10),
    *copies,
    strip('strip-red', 'T', 550, 930, 800, [L('不能分潤', 150, color='white', ls=0.04)], layer='mat', rot=-5, z=30, at='no', until='s16', to='top', exitDist=1500, exitDur=8, **{'from': 'slam'}),
    strip('slip-long', 'T', 560, 1175, 660, [L('不管是不是 AI 做的', 58)], layer='mat', rot=1.5, z=31, at='no+12', until='s16', to='top', exitDist=1500, exitDur=8),
])

# ===== s16 合：AI 動手，動腦的還是你（切割墊掀開，回到五張便利貼） =====
ROW = [(140 + 200 * i, 470) for i in range(5)]
props['s16'] = dict(camera=cam('B', at='start', dur=12), mat=False, items=[
    *[note(i, 'B', BN[i][0], BN[i][1], 250, num=130, lab=104, id=f'r{i + 1}', rot=ROTS[i], at='start', exitDist=1200, until='s18', to='cut', **{'from': 'cut'},
           moves=[dict(at=f'start+{10 + i}', to=dict(**P('B', *ROW[i]), w=192), dur=10)]) for i in range(5)],
    strip('strip-blue', 'B', 400, 790, 600, [L('AI 動手', 120, color='white')], rot=-2, z=4, at='hand', until='s17', to='bottom', exitDist=1100, **{'from': 'slam'}),
    strip('strip-yellow', 'B', 610, 1070, 720, [L('{你} 動腦', 150, accentSize=190)], rot=2, z=5, at='brain', until='s17', to='bottom', exitDist=1100, **{'from': 'slam'},
          tape=[dict(asset='tape-r', x=80, y=6, rot=-12, w=170)]),
])

# ===== s17 提問：如果只做一支，你最想講什麼題目？ =====
props['s17'] = dict(items=[
    *[dict(ref=f'r{i + 1}', at=f'one+{3 * (i - 1)}' if i > 1 else 'one', exit=True, to='top') for i in range(1, 5)],
    dict(ref='r1', at='one+8', **P('B', 540, 530), w=400, rot=-2, dur=12),
    dict(type='phone', layer='near', x=540, y=1180, w=470, at='topic-10', state=dict(screen='comment', placeholder='我想講……'), set=[dict(at='topic+6', hop=1)],
         until='s18', to='bottom', exitDist=1300, **{'from': 'bottom'}),
])

# ===== s18 對了，AI 配音怎麼聽起來不像機器人？（回到開場的麥克風） =====
f_robot, f_open = cue('s18', 'robot'), cue('s19', 'open')
steps = []
for k in range(1, 7):   # 一條一條重貼成高低不一
    f = f_robot + 2 * (k - 1)
    steps.append(bars('H', 790, 1010, PAT[2][:k] + FLAT[k:], at=AT('s18', f), until=f"s18.{AT('s18', f + 2)}"))
f2 = f_robot + 12
wv = []
fs = list(range(f2, nxt['s18'], 3))
for i, f in enumerate(fs):
    d = bars('H', 790, 1010, PAT[(i + 3) % 12], at=AT('s18', f))
    d['until'] = f"s18.{AT('s18', fs[i + 1])}" if i < len(fs) - 1 else 's19'
    wv.append(d)
props['s18'] = dict(camera=cam('H', at='start', dur=14), items=[
    bars('H', 790, 1010, FLAT, at='start', until='s18.robot'),
    strip('tag-blue', 'H', 470, 822, 290, [L('AI 配音', 68, color='white')], rot=6, z=5, at='voice', until='s19.open', to='cut', **{'from': 'slam'}),
    *steps, *wv,
    strip('strip-white', 'H', 540, 530, 860, [L('不像機器人？', 100)], rot=-1.5, z=6, at='robot+14', until='s19', to='top', exitDist=1100, **{'from': 'slam'},
          tape=[dict(asset='tape-y', x=110, y=6, rot=-5), dict(asset='tape-m', x=650, y=0, rot=4)]),
])

# ===== s19 下一集，把我們的做法攤開給你看 =====
fs = list(range(nxt['s18'], f_open, 3))
wv2 = []
for i, f in enumerate(fs):
    d = bars('H', 790, 1010, PAT[(i + 7) % 12], at=AT('s19', f))
    d['until'] = f"s19.{AT('s19', fs[i + 1])}" if i < len(fs) - 1 else 's19.open+6'
    wv2.append(d)
props['s19'] = dict(items=[
    *wv2,
    strip('note-white', 'H', 540, 540, 400, [L('下一集', 116), L('做法攤開', 70, color='ink3', lh=1.4)], rot=-3, z=6, at='next', until='end', **{'from': 'slam'},
          tape=[dict(asset='tape-r', x=210, y=6, rot=3, w=180)]),
    strip('card-white', 'H', 540, 1020, 440, [DASH(8), DASH(6), DASH(8), DASH(4)], id='c1', rot=-3, z=7, at='open', until='end', align='left', pad=[60, 50],
          moves=[dict(at='open+5', to=dict(x=290, rot=-5), dur=10)]),
    strip('card-white', 'H', 540, 1020, 440, [DASH(7), DASH(8), DASH(5), DASH(8)], id='c2', rot=3, z=8, at='open+2', until='end', align='left', pad=[60, 50],
          moves=[dict(at='open+5', to=dict(x=795, rot=4), dur=10)]),
    img('sheet-cream', None, 540, 980, 1240, layer='top', at='end-8', until='end', **{'from': 'bottom'}),
])

# ---------- 封面 ----------
S['cover'] = dict(camera=dict(to=[540, 960, 1]), items=[
    strip('polaroid-mic', None, 300, 1150, 460, [L('麥克風前沒人', 46)], caption=True, rot=-5, tape=[dict(asset='tape-m', x=250, y=4, rot=3, w=170)]),
    strip('note-yellow', None, 760, 1010, 330, [L('1', 150, lh=1.0), L('題目', 112, lh=1.15)], rot=4),
    strip('note-mint', None, 830, 1290, 300, [L('2', 150, lh=1.0), L('稿子', 112, lh=1.15)], rot=-5),
    strip('strip-hook2', None, 540, 600, 940, [L('用 AI 做一支片', 104, lh=1.15), L('照這 {5 張} 便利貼', 92, accentSize=150, lh=1.15)], layer='screen', rot=-1.4, align='left', pad=[70, 26],
          tape=[dict(asset='tape-y', x=150, y=8, rot=-5), dict(asset='tape-m', x=790, y=0, rot=4)]),
])

for sc in S['scenes']:
    if sc['id'] in props:
        sc['props'] = props[sc['id']]
json.dump(S, open(os.path.join(HERE, 'script.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', sum(len(p.get('items', [])) for p in props.values()), 'items')
