import json, time, urllib.request, urllib.error, re
M = "gemini-3.5-flash-lite"
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
    return {"sentAtUTC":sent,"httpStatus":st,"request":body,"replyText":reply}
u=lambda t:{"role":"user","parts":[{"text":t}]}; m=lambda t:{"role":"model","parts":[{"text":t}]}
P1="我想學「複利」。請用國中生聽得懂的話解釋，不要超過 150 字，用一個生活例子。"
P2="我用自己的話講一遍：複利就是銀行每年固定給你一筆利息，存越久領越多，利率越高越好。"
P3="請你當老師：指出我剛才講錯或漏掉的地方，再問我一個問題，檢查我有沒有真的懂。先不要給完整答案。"
P4="我懂了。請把正確的版本再簡化成一句話，讓我可以直接講給同事聽。"
h=[u(P1)]; r1=call(h); json.dump(r1,open("step1.json","w"),ensure_ascii=False,indent=1)
h+= [m(r1["replyText"]), u(P2+"\n\n"+P3)]
res=[]
for n in range(1,4):
    r=call(h); json.dump(r,open(f"step3-run{n}.json","w"),ensure_ascii=False,indent=1)
    hit=bool(re.search("利滾利|利息.{0,6}(再|也).{0,4}(生|產生|算)|本金.{0,6}(加|和).{0,6}利息|利息也會|利上加利",r["replyText"])); res.append(hit); print("step3",n,hit)
r3=json.load(open("step3-run1.json"))
h4=h+[m(r3["replyText"]),u(P4)]; r4=call(h4); json.dump(r4,open("step4.json","w"),ensure_ascii=False,indent=1)
json.dump({"step3_caught":res},open("score.json","w"),ensure_ascii=False)
for f in ["step1","step3-run1","step4"]: print("=====",f,"\n",json.load(open(f+".json"))["replyText"])
