"""實測用的小工具：把請求送 Gemini API，原始請求與回應完整存成 json（圖／PDF 的 base64 換成檔名與 sha256）。
用法（在 Python 裡）：from llm import gemini, tpart, fpart
金鑰由代理注入，不用設定。必須先 `export NODE_USE_ENV_PROXY=1` 不需要（Python 自動吃 HTTPS_PROXY）。"""
import base64, hashlib, json, mimetypes, os, time, urllib.error, urllib.request

def tpart(t): return {"text": t}

def fpart(path):
    mt = mimetypes.guess_type(path)[0] or "application/octet-stream"
    return {"inline_data": {"mime_type": mt, "data": base64.b64encode(open(path, "rb").read()).decode()}, "_file": path}

def _scrub(parts):
    out = []
    for p in parts:
        if "inline_data" in p:
            raw = p["inline_data"]["data"]
            out.append({"inline_data": {"mime_type": p["inline_data"]["mime_type"], "data": f"<base64 省略 {len(raw)} 字元，檔案 {p.get('_file')}，sha256 {hashlib.sha256(base64.b64decode(raw)).hexdigest()[:16]}>"}})
        else: out.append(p)
    return out

def gemini(out, model, parts, temperature=None, retries=4):
    body = {"contents": [{"role": "user", "parts": [{k: v for k, v in p.items() if k != "_file"} for p in parts]}]}
    if temperature is not None: body["generationConfig"] = {"temperature": temperature}
    sent = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()); t0 = time.time(); status = None; j = {}
    for a in range(retries):
        req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent", data=json.dumps(body).encode(), headers={"content-type": "application/json", "x-goog-api-key": "proxy-injected"})
        try:
            with urllib.request.urlopen(req, timeout=300) as r: status = r.status; j = json.load(r)
        except urllib.error.HTTPError as e:
            status = e.code; j = json.loads(e.read() or b"{}")
            if status in (503, 500, 429) and a < retries - 1: time.sleep(6 + 6 * a); continue
        break
    reply = "".join(p.get("text", "") for p in (j.get("candidates") or [{}])[0].get("content", {}).get("parts", [])) if status == 200 else ""
    rec = {"id": os.path.basename(out)[:-5], "tool": "Gemini API（generateContent，沒有開搜尋工具）", "model": model, "modelVersion": j.get("modelVersion"), "httpStatus": status, "sentAtUTC": sent, "elapsedSec": round(time.time() - t0, 2), "request": {**body, "contents": [{"role": "user", "parts": _scrub(parts)}]}, "response": {k: v for k, v in j.items()}, "replyText": reply, "answer": reply}
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True); json.dump(rec, open(out, "w"), ensure_ascii=False, indent=2)
    return rec
