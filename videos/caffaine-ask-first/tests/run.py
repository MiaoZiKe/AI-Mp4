import json, time, urllib.request, urllib.error, sys
M = "gemini-3.5-flash-lite"
Q = "幫我規劃下週的部門聚餐。直接給我完整方案，不要反問。"
Q_B = "幫我規劃下週的部門聚餐。先不要做，先問我 3 個問題。"
FACT = {"人數": "12 個人", "預算": "每人 600 元以內", "素食": "有 2 個人吃素", "時間": "週四晚上", "地點": "公司在信義區，要走路 10 分鐘內到"}
def call(out, contents):
    body = {"contents": contents}; sent = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    for a in range(4):
        req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{M}:generateContent", data=json.dumps(body).encode(), headers={"content-type": "application/json", "x-goog-api-key": "proxy-injected"})
        try:
            with urllib.request.urlopen(req, timeout=300) as r: st = r.status; j = json.load(r)
        except urllib.error.HTTPError as e:
            st = e.code; j = json.loads(e.read() or b"{}")
            if st in (429, 500, 503) and a < 3: time.sleep(8 + 8 * a); continue
        break
    reply = "".join(p.get("text", "") for p in (j.get("candidates") or [{}])[0].get("content", {}).get("parts", [])) if st == 200 else ""
    json.dump({"model": M, "modelVersion": j.get("modelVersion"), "httpStatus": st, "sentAtUTC": sent, "request": body, "response": j, "replyText": reply}, open(out, "w"), ensure_ascii=False, indent=2); print(out, st, len(reply)); return reply
u = lambda t: {"role": "user", "parts": [{"text": t}]}; m = lambda t: {"role": "model", "parts": [{"text": t}]}
if sys.argv[1] == "A":
    for n in (1, 2): call(f"A-run{n}.json", [u(Q)])
elif sys.argv[1] == "B1":
    for n in (1, 2): call(f"B-run{n}-q.json", [u(Q_B)])
if sys.argv[1] == "B2":
    ans = {1: "12 個人，每人 600 元以內。目的都可以，料理也都可以。週四晚上。公司在信義區，走路 10 分鐘內到。", 2: "12 個人，每人 600 元以內。目的都可以，週四晚上。料理都可以，但有 2 個人吃素。公司在信義區，走路 10 分鐘內到。"}
    for n in (1, 2):
        q = json.load(open(f"B-run{n}-q.json"))["replyText"]
        call(f"B-run{n}.json", [u(Q_B), m(q), u(ans[n] + "\n\n現在請直接給我完整方案，不要再問。")])
