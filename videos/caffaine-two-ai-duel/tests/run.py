import sys
sys.path.insert(0, "../../../scripts/caffaine")
from llm import gemini, tpart
data = open("data.txt", encoding="utf-8").read().strip()
Q = "下面是一份流水帳。請照類別加總，類別只有三種：餐飲、交通、娛樂（飲料算餐飲，手遊儲值算娛樂）。規則：標明「重複貼上」的那一筆要排除；中文數字要換成阿拉伯數字；負數是退款，算一筆，要從該類別小計扣掉。\n請只輸出一張表格，欄位是「類別｜筆數｜小計」，表格最後一行寫「總額」，不要其他說明。\n\n" + data
models = sys.argv[1:] or ["gemini-3-flash-preview", "gemini-3.5-flash-lite"]
for m in models:
    for i in (1, 2):
        r = gemini(f"{m}-run{i}.json", m, [tpart(Q)], retries=6); print(m, i, r["httpStatus"], r["modelVersion"], r["elapsedSec"], flush=True)
