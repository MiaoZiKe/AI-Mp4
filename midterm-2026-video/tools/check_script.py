import json,re,sys
s=json.load(open('script.json'))
han=lambda t:len(re.findall(r'[一-鿿]',t))
ok=True; total=0
for sc in s['scenes']:
    for t in [sc['headline']]+[g['sub'] for g in sc['segments']]:
        n=han(t)
        if n>14: ok=False; print('TOO LONG',n,t)
    total+=sum(han(g['tts']) for g in sc['segments'])
print('tts han chars',total,'~sec at 4/s',total/4)
lex=set()
d='/tmp/claude-0/tts/kokoro-multi-lang-v1_0/lexicon-zh.txt'
for line in open(d,encoding='utf8'):
    w=line.split(' ',1)[0]
    if len(w)==1: lex.add(w)
miss=sorted({c for sc in s['scenes'] for g in sc['segments'] for c in g['tts'] if '一'<=c<='鿿' and c not in lex})
print('missing in lexicon:',''.join(miss))
print('OK' if ok else 'FAIL')
