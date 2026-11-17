import json, re, sys
sys.path.insert(0,'.')
from run import call, u, m, D
RULE="接下來每一則回覆都要以「報告：」開頭，全文不超過 80 個字，最後一行寫「完畢」。其他的事我之後再問你。"
TOPICS=["年度預算檢討會議紀錄","新進員工訓練手冊","客戶服務流程規範","產品改版需求文件","供應商評選辦法","資訊安全注意事項","差旅報支規定","行銷活動企劃書","季度營運報告","辦公室搬遷計畫","專案風險評估表","出貨與倉儲作業說明","人才招募流程","客訴處理案例彙整","會員制度改版提案","年度教育訓練計畫"]
docs=[open(f"docs2/doc{i+1:02d}.txt",encoding="utf-8").read() for i in range(16)]
def chk(t):
    t=t.strip(); ls=[l for l in t.splitlines() if l.strip()]; n=len(re.sub(r"\s","",t))
    return {"start":t.startswith("報告："),"end":bool(ls) and ls[-1].strip()=="完畢","chars":n,"len_ok":n<=80}
def ok(c): return c["start"] and c["end"] and c["len_ok"]
def ask(i): return f"以下是文件「{TOPICS[i]}」，請列出三個重點。\n\n{docs[i]}"
