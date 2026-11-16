"""自己寫的規則解析（對照用）：從搜尋頁文字取每筆商品的名稱、現價、原價，取前 N 筆。這是「對照人工看網頁」的基準；另外再用截圖人工抽看。"""
import json, re, sys
def parse(body, n=15):
    L = [l for l in body if l.strip()]; out = []; i = 0
    while i < len(L) and len(out) < n:
        if re.fullmatch(r"\$[\d,]+", L[i]) and not (i and re.fullmatch(r"\$[\d,]+|\(售價已折\)", L[i - 1])):
            k = i - 1
            while k >= 0 and re.fullmatch(r"\(\d+\)", L[k]): k -= 1
            name = L[k]; now = int(L[i][1:].replace(",", "")); j = i + 1
            if j < len(L) and L[j] == "(售價已折)": j += 1
            orig = int(L[j][1:].replace(",", "")) if j < len(L) and re.fullmatch(r"\$[\d,]+", L[j]) else None
            out.append({"name": name, "price_now": now, "price_original": orig}); i = j + 1
        else: i += 1
    return out
if __name__ == "__main__":
    for f in ["pchome", "etmall"]:
        t = parse(open(f"{f}-body.txt").read().split("\n"), 15); json.dump(t, open(f"truth-{f}.json", "w"), ensure_ascii=False, indent=1)
        print("==", f, len(t)); [print(x["price_now"], x["price_original"], x["name"][:50]) for x in t]
