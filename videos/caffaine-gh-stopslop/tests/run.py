import json, os, sys, time, urllib.request, urllib.error
sys.path.insert(0, "../../../scripts/caffaine")
M = sys.argv[1] if len(sys.argv) > 1 else "gemini-3.5-flash-lite"
TASKS = {"A": "Write a short company-wide announcement (under 120 words, English): from Dec 1, all expense reports must be submitted through the new system; paper forms will not be accepted after Nov 30.", "B": "Write a short LinkedIn-style post (under 100 words, English) about why our team switched to a new expense system."}
import sys as _s
TASK = TASKS[_s.argv[2] if len(_s.argv) > 2 else "A"]
PFX = "" if TASK == TASKS["A"] else "B-"
RULES = "\n\n".join(open(f).read() for f in ("SKILL.md", "phrases.md", "structures.md"))
def call(out, system):
    body = {"contents": [{"role": "user", "parts": [{"text": TASK}]}]}
    if system: body["systemInstruction"] = {"parts": [{"text": system}]}
    sent = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    for a in range(4):
        req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{M}:generateContent", data=json.dumps(body).encode(), headers={"content-type": "application/json", "x-goog-api-key": "proxy-injected"})
        try:
            with urllib.request.urlopen(req, timeout=300) as r: st = r.status; j = json.load(r)
        except urllib.error.HTTPError as e:
            st = e.code; j = json.loads(e.read() or b"{}")
            if st in (429, 500, 503) and a < 3: time.sleep(8 + 8 * a); continue
        break
    reply = "".join(p.get("text", "") for p in (j.get("candidates") or [{}])[0].get("content", {}).get("parts", [])) if st == 200 else ""
    rec = {"model": M, "modelVersion": j.get("modelVersion"), "httpStatus": st, "sentAtUTC": sent, "systemInstruction": "（SKILL.md＋references/phrases.md＋references/structures.md 原文，同資料夾）" if system else None, "request": {"contents": body["contents"]}, "response": j, "replyText": reply}
    json.dump(rec, open(out, "w"), ensure_ascii=False, indent=2); print(out, st, len(reply))
for n in (1, 2):
    call(f"{PFX}base-run{n}.json", None); call(f"{PFX}rules-run{n}.json", RULES)
