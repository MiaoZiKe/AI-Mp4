import sys, json
sys.path.insert(0, "../../../scripts/caffaine")
from llm import gemini, tpart
M = sys.argv[1] if len(sys.argv) > 1 else "gemini-3.5-flash-lite"
doc = open("shop.txt", encoding="utf-8").read().strip()
base = "你是晨光早餐店的客服，請親切、有幫助地回答客人的問題。\n\n店家資料：\n" + doc + "\n\n客人問："
adds = {"0-base": "", "1-only-source": "\n\n請只根據上面的店家資料回答。", "2-allow-idk": "\n\n如果資料裡沒有寫，就回答「資料裡沒有寫」，不要猜。", "3-quote-first": "\n\n回答前，先從店家資料裡引用一句相關的原文；找不到原文，就回答「找不到原文，我不知道」。"}
qs = {"U1": "有沒有素食的選項？", "U2": "可以外送嗎？", "U3": "有沒有 Wi-Fi 可以用？", "U4": "蛋餅有哪些口味？", "U5": "店門口有停車位嗎？", "K1": "紅茶一杯多少錢？", "K2": "可以刷信用卡嗎？"}
out = {}
for c, add in adds.items():
    for q, t in qs.items():
        r = gemini(f"{c}-{q}.json", M, [tpart(base + t + add)], retries=6); out[f"{c}-{q}"] = [r["httpStatus"], r["modelVersion"], r["elapsedSec"]]; print(c, q, out[f"{c}-{q}"], flush=True)
