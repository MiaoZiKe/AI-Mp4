import json, time, urllib.request, urllib.error, re, sys
M = "gemini-3.5-flash-lite"
REQ = "幫我回覆同事：下週三的產品會議要改到週四下午三點，原因是客戶臨時出差。"
RULES = open("rules.txt", encoding="utf-8").read().strip()
def call(out, system=None):
    body = {"contents": [{"role": "user", "parts": [{"text": REQ}]}]}
    if system: body["systemInstruction"] = {"parts": [{"text": system}]}
    sent = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()); st=None; j={}
    for a in range(4):
        req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{M}:generateContent", data=json.dumps(body).encode(), headers={"content-type": "application/json", "x-goog-api-key": "proxy-injected"})
        try:
            with urllib.request.urlopen(req, timeout=300) as r: st = r.status; j = json.load(r)
        except urllib.error.HTTPError as e:
            st = e.code; j = json.loads(e.read() or b"{}")
            if st in (429,500,503) and a<3: time.sleep(8+8*a); continue
        break
    reply = "".join(p.get("text","") for p in (j.get("candidates") or [{}])[0].get("content",{}).get("parts",[])) if st==200 else ""
    json.dump({"model":M,"httpStatus":st,"sentAtUTC":sent,"request":body,"response":j,"replyText":reply}, open(out,"w"), ensure_ascii=False, indent=2)
    return reply
EMO = re.compile("[\U0001F300-\U0001FAFF☀-➿⭐✅❌]")
def score(t):
    lines=[l for l in t.strip().splitlines() if l.strip()]
    r=[bool(lines) and "週四" in lines[0] and ("三點" in lines[0] or "15:00" in lines[0]),
       len(re.sub(r"\s","",t))<=80,
       not re.search("您好|你好|敬祝|謝謝|感謝|辛苦了|希望",t),
       not EMO.search(t),
       sum(1 for l in lines if re.match(r"\s*([・\-\*•]|\d+[\.、])",l))<=3]
    return r
if __name__=="__main__":
    res={}
    for tag,sys_ in (("A",None),("B",RULES)):
        res[tag]=[]
        for n in range(1,6):
            t=call(f"{tag}-run{n}.json",sys_); s=score(t); res[tag].append({"run":n,"score":sum(s),"checks":s,"chars":len(re.sub(r'\s','',t))}); print(tag,n,sum(s),s,len(t))
    json.dump(res,open("score.json","w"),ensure_ascii=False,indent=1)
