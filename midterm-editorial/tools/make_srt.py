"""output/subtitles.srt from voice_timing.json word timestamps + script.json subtitle text."""
import json
S=json.load(open("script.json")); V=json.load(open("voice_timing.json"))
def ts(t):
    ms=int(round(t*1000)); h,ms=divmod(ms,3600000); m,ms=divmod(ms,60000); s,ms=divmod(ms,1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
out=[]; n=1
for pg,pt in zip(S["pages"],V["pages"]):
    sents=pt["sentences"]
    for i,s in enumerate(sents):
        st=max(0,s["start"]-0.08)
        en=sents[i+1]["start"]-0.1 if i+1<len(sents) else s["end"]+0.25
        out.append(f"{n}\n{ts(st)} --> {ts(en)}\n{pg['subtitle_zh'][i]}\n{pg['subtitle_en'][i]}\n"); n+=1
open("output/subtitles.srt","w").write("\n".join(out))
print(n-1,"cues")
