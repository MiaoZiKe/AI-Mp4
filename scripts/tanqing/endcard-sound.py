#!/usr/bin/env python3
"""談晴說礙片尾招牌音（v5）：每個動作拍點一個乾淨的音（純正弦、卡林巴式泛音、無雜訊、無方波）。
拍點讀 script.json 最後一幕 figure／endCard 的 start+N 欄位（和 RiseMarkV5 同一組）。
用法：python3 scripts/tanqing/endcard-sound.py <slug> <out.wav> [--gain dB]
輸出整條片長的音軌（只有片尾有聲音），另寫 <out>.beats.json。"""
import json, sys, wave, re
import numpy as np
slug, out = sys.argv[1], sys.argv[2]
gain_db = float(sys.argv[sys.argv.index('--gain') + 1]) if '--gain' in sys.argv else 0.0
SR, FPS = 48000, 30
sc = json.load(open(f'videos/{slug}/script.json'))
tl = json.load(open(f'videos/{slug}/timeline.json'))
last = sc['scenes'][-1]; fig = last['props']['figure']; ec = last['props'].get('endCard', {})
start = next(s['startFrame'] for s in tl['scenes'] if s['id'] == last['id'])
off = lambda v: int(re.match(r'start([+-]\d+)?$', v).group(1) or 0)
at, sun_at, sun_dur = off(fig['at']), off(fig['sunAt']), int(fig.get('sunDur', 12))
ray_at, ray_step = off(fig['rayAt']), int(fig.get('rayStep', 4))
word_at, word_step = off(fig['wordAt']), int(fig.get('wordStep', 4))
N = int(round(tl['totalFrames'] / FPS * SR)); y = np.zeros(N)
def note(t0, freq, amp, tau=0.7, attack=0.004, kal=True):
    i0 = int(round(t0 * SR)); n = min(N - i0, int(SR * min(4 * tau, 3.2)))
    if n <= 0: return
    t = np.arange(n) / SR
    env = np.minimum(1, t / attack) * np.exp(-t / tau)
    s = np.sin(2 * np.pi * freq * t)
    if kal:  # 卡林巴：八度弱一點、5.4 倍的金屬感泛音很快消失
        s += 0.28 * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t / (tau * 0.5))
        s += 0.10 * np.sin(2 * np.pi * 5.4 * freq * t) * np.exp(-t / 0.05)
    y[i0:i0 + n] += amp * env * s
fr = lambda k: (start + k) / FPS
beats = []
# 雲描線：很輕的低音鋪底（C3＋G3 慢慢進來，片尾前淡出）
t0 = fr(at); n = N - int(t0 * SR); t = np.arange(n) / SR
pad = (np.sin(2*np.pi*130.81*t) + 0.7*np.sin(2*np.pi*196.0*t)) * np.minimum(1, t / 0.45) * 0.10
fade = np.clip((n / SR - t) / 0.35, 0, 1); y[N - n:] += pad * fade; beats.append(('cloud', start + at))
# 太陽落定：溫暖的和弦（C4 E4 G4 C5，起音稍軟）
land = start + sun_at + sun_dur
for f0, a in [(261.63, .30), (329.63, .22), (392.0, .22), (523.25, .26)]: note(land / FPS, f0, a, tau=1.1, attack=0.012)
beats.append(('sun-land', land))
# 三道光：E5 G5 A5 往上
for k, f0 in enumerate([659.25, 783.99, 880.0]):
    fk = start + ray_at + k * ray_step; note(fk / FPS, f0, .34, tau=.55); beats.append((f'ray{k+1}', fk))
# 四個字：招牌旋律 G5 E5 D5 C5（落在主音，第四個字加低八度）
for k, f0 in enumerate([783.99, 659.25, 587.33, 523.25]):
    fk = start + word_at + k * word_step; note(fk / FPS, f0, .36, tau=.7)
    if k == 3: note(fk / FPS, 261.63, .22, tau=1.2, attack=.008)
    beats.append((f'char{k+1}', fk))
if ec.get('at'):
    fk = start + off(ec['at']); note(fk / FPS, 1046.5, .12, tau=.5); note(fk / FPS, 783.99, .10, tau=.5); beats.append(('keyword', fk))
# 溫暖的短回音（乾淨訊號延遲，不加雜訊）
d1, d2 = int(.19 * SR), int(.38 * SR)
y2 = y.copy(); y2[d1:] += .26 * y[:-d1]; y2[d2:] += .10 * y[:-d2]
y2 *= 10 ** (gain_db / 20)
st = np.stack([y2, np.concatenate([np.zeros(24), y2[:-24]])], 1)  # 右聲道晚 0.5ms，一點寬度
pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
with wave.open(out, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
json.dump({'endStartFrame': start, 'endStartSec': start / FPS, 'beats': [{'name': a, 'frame': b, 'sec': round(b / FPS, 3)} for a, b in beats]}, open(out + '.beats.json', 'w'), ensure_ascii=False, indent=1)
print('ok', start, beats)
