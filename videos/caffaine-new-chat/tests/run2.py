import json, os, sys
sys.path.insert(0,'.')
from run import call, ok, u, m, turn, D
os.makedirs("docs2", exist_ok=True)
TOPICS=["年度預算檢討會議紀錄","新進員工訓練手冊","客戶服務流程規範","產品改版需求文件","供應商評選辦法","資訊安全注意事項","差旅報支規定","行銷活動企劃書","季度營運報告","辦公室搬遷計畫","專案風險評估表","出貨與倉儲作業說明","人才招募流程","客訴處理案例彙整","會員制度改版提案","年度教育訓練計畫"]
docs=[]
for i,t in enumerate(TOPICS):
    fn=f"docs2/doc{i+1:02d}.txt"
    if os.path.exists(fn): docs.append(open(fn,encoding="utf-8").read()); continue
    r=call([u(f"請寫一份約 3000 字的公司內部文件，主題是「{t}」。只要內容，不要前言。")]); open(fn,"w",encoding="utf-8").write(r["reply"]); docs.append(r["reply"]); print("doc",i+1,len(r["reply"]),flush=True)
hist=[]; log=[]
turn(hist, D["rule"], log, "rule")
for i,dc in enumerate(docs): turn(hist, f"以下是文件「{TOPICS[i]}」，請列出三個重點。\n\n{dc}", log, "filler")
json.dump(log,open("chat2-part1.json","w"),ensure_ascii=False,indent=1)
h2=list(hist)
for q in D["test"]: turn(h2,q,log,"A-test")
turn(h2,D["recall"],log,"A-recall")
json.dump(log,open("chat2-A.json","w"),ensure_ascii=False,indent=1)
h3=list(hist); logb=[]
s=turn(h3,"我要換到新的對話繼續。請寫一段交接摘要，讓我貼到新對話：要包含我交代你的規定，以及我們聊過的主要主題。",logb,"summary")
hb=[]; turn(hb,"以下是上一段對話的交接摘要，請照裡面的規定繼續：\n\n"+s["reply"],logb,"B-open")
for q in D["test"]: turn(hb,q,logb,"B-test")
json.dump(logb,open("chat2-B.json","w"),ensure_ascii=False,indent=1)
