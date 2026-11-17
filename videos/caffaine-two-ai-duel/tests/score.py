# 依 rubric.md 記分（8 分）：三類別各「小計、筆數」＋總額＋格式
import json, re
std = {"餐飲": (4, 450), "交通": (4, 210), "娛樂": (3, 280)}; total = 940
out = {}
for m in ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]:
    for i in (1, 2):
        t = json.load(open(f"{m}-run{i}.json"))["answer"]; rows = {}
        for line in t.split("\n"):
            c = [x.strip() for x in line.strip().strip("|").split("｜" if "｜" in line else "|")]
            if len(c) == 3 and c[1].isdigit(): rows[c[0]] = (int(c[1]), int(c[2]))
        s = 0; det = {}
        for k, (n, v) in std.items():
            r = rows.get(k, (None, None)); det[k + "筆數"] = r[0] == n; det[k + "小計"] = r[1] == v
        det["總額"] = rows.get("總額", (0, 0))[1] == total; det["格式"] = len(t.strip().split("\n")) <= 6 and "類別" in t
        out[f"{m}-run{i}"] = {"score": sum(det.values()), "of": 8, "detail": det, "rows": rows}
        print(m, i, sum(det.values()), "/ 8", [k for k, v in det.items() if not v])
json.dump(out, open("score.json", "w"), ensure_ascii=False, indent=1)
