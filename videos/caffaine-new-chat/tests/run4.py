# 第三輪重跑一條完整長對話（保存全部歷史），再接 A 長對話三題 ＋ B 交接摘要新對話三題
import json, sys
sys.path.insert(0,'.')
from run import call, u, m, D
from r3common import RULE, TOPICS, docs, chk, ok, ask
T=["幫我想三個部門下午茶的點子。","幫我把『這個月的報告晚交』改成比較委婉的說法。","給我兩個一對一面談的開場問題。"]
hist=[u(RULE)]; r=call(hist); hist.append(m(r["reply"])); first=r["reply"]; long=[]
for i in range(16):
    hist.append(u(ask(i))); r=call(hist); hist.append(m(r["reply"])); c=chk(r["reply"]); long.append({"turn":i+2,"doc":i+1,"ok":ok(c),**c,"tokens":(r["usage"] or {}).get("promptTokenCount"),"reply":r["reply"]}); print("long",i+1,ok(c),c["chars"],(r["usage"] or {}).get("promptTokenCount"),flush=True)
json.dump({"first":first,"long":long},open("chat4-long.json","w"),ensure_ascii=False,indent=1)
h2=list(hist); A=[]
for q in T:
    h2.append(u(q)); r=call(h2); h2.append(m(r["reply"])); c=chk(r["reply"]); A.append({"q":q,"ok":ok(c),**c,"tokens":(r["usage"] or {}).get("promptTokenCount"),"reply":r["reply"]}); print("A-test",ok(c),c["chars"],flush=True)
h3=list(hist); h3.append(u("我要換到新的對話繼續。請寫一段交接摘要，讓我貼到新對話：要包含我交代你的規定，以及我們聊過的主要主題。")); s=call(h3)
hb=[u("以下是上一段對話的交接摘要，請照裡面的規定繼續：\n\n"+s["reply"])]; r=call(hb); hb.append(m(r["reply"])); B=[{"q":"(開場)","reply":r["reply"],**chk(r["reply"])}]
for q in T:
    hb.append(u(q)); r=call(hb); hb.append(m(r["reply"])); c=chk(r["reply"]); B.append({"q":q,"ok":ok(c),**c,"tokens":(r["usage"] or {}).get("promptTokenCount"),"reply":r["reply"]}); print("B-test",ok(c),c["chars"],flush=True)
json.dump({"A":A,"summary":s["reply"],"B":B},open("chat4-AB.json","w"),ensure_ascii=False,indent=1)
