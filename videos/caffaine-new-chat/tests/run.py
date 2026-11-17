import json, time, urllib.request, urllib.error, sys
M = "gemini-3.5-flash-lite"
D = json.load(open("questions.json", encoding="utf-8"))
def call(contents):
    body = {"contents": contents}; sent = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()); st=None; j={}
    for a in range(5):
        req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{M}:generateContent", data=json.dumps(body).encode(), headers={"content-type": "application/json", "x-goog-api-key": "proxy-injected"})
        try:
            with urllib.request.urlopen(req, timeout=300) as r: st = r.status; j = json.load(r)
        except urllib.error.HTTPError as e:
            st = e.code; j = json.loads(e.read() or b"{}")
            if st in (429,500,503) and a<4: time.sleep(8+8*a); continue
        break
    reply = "".join(p.get("text","") for p in (j.get("candidates") or [{}])[0].get("content",{}).get("parts",[])) if st==200 else ""
    return {"sentAtUTC":sent,"httpStatus":st,"usage":j.get("usageMetadata"),"reply":reply}
def ok(t):
    t=t.strip(); ls=[l for l in t.splitlines() if l.strip()]
    return t.startswith("報告：") and bool(ls) and ls[-1].strip()=="完畢"
u=lambda t:{"role":"user","parts":[{"text":t}]}; m=lambda t:{"role":"model","parts":[{"text":t}]}
def turn(hist, q, log, tag):
    hist.append(u(q)); r=call(hist); hist.append(m(r["reply"]))
    rec={"turn":len([h for h in hist if h["role"]=="user"]),"tag":tag,"question":q,"ok":ok(r["reply"]),**r}; log.append(rec)
    print(tag, rec["turn"], rec["ok"], (r["usage"] or {}).get("promptTokenCount"), flush=True); return r
if __name__=="__main__":
    hist=[]; log=[]
    turn(hist, D["rule"], log, "rule")
    for q in D["questions"]: turn(hist,q,log,"filler")
    json.dump(log,open("chat-A-part1.json","w"),ensure_ascii=False,indent=1)
    h2=list(hist)
    for q in D["test"]: turn(h2,q,log,"A-test")
    turn(h2,D["recall"],log,"A-recall")
    json.dump(log,open("chat-A.json","w"),ensure_ascii=False,indent=1)
    # B：交接摘要
    h3=list(hist); logb=[]
    s=turn(h3,"我要換到新的對話繼續。請寫一段交接摘要，讓我貼到新對話：要包含我交代你的規定，以及我們聊過的主要主題。",logb,"summary")
    hb=[]; turn(hb,"以下是上一段對話的交接摘要，請照裡面的規定繼續：\n\n"+s["reply"],logb,"B-open")
    for q in D["test"]: turn(hb,q,logb,"B-test")
    json.dump(logb,open("chat-B.json","w"),ensure_ascii=False,indent=1)
