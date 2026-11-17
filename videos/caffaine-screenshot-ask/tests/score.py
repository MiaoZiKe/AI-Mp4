import json, re
CK = {"R1 E-507": lambda t: "E-507" in t, "R2 0.3 GB": lambda t: "0.3" in t, "R3 1 GB": lambda t: bool(re.search(r"至少 ?\*{0,2}1(\.0)? ?GB|1 ?GB 以上|超過 ?\*{0,2}1 ?GB|大於 ?1 ?GB|需要至少.{0,6}1", t)) or "**1 GB**" in t, "R4 11 月 9 日": lambda t: bool(re.search(r"11 ?月 ?9 ?日", t)),
      "R5 原因＝空間不足": None, "R6 管理儲存空間": lambda t: "管理儲存空間" in t}
# R5 需要人工判斷（程式只先幫忙：回答第一段有沒有把「儲存空間不足」當結論）
man = {"A-full-run1": True, "A-full-run2": True, "B-small-run1": True, "B-small-run2": True, "C-cropped-run1": False, "C-cropped-run2": False}  # 人工讀過全文後的判斷
out = {}
for k, v in man.items():
    t = json.load(open(k + ".json"))["answer"]
    r = {n: f(t) for n, f in CK.items() if f}; r["R5 原因＝空間不足"] = v
    out[k] = {"hits": sum(r.values()), "of": 6, "detail": r}
json.dump(out, open("score.json", "w"), ensure_ascii=False, indent=1)
for k, v in out.items(): print(k, v["hits"], "/ 6", [n for n, ok in v["detail"].items() if not ok])
