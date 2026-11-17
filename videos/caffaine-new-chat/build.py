# node scripts/caffaine/autoscript.mjs caffaine-new-chat --force && python3 videos/caffaine-new-chat/build.py
import json
F = "videos/caffaine-new-chat/script.json"; d = json.load(open(F)); S = {s["id"]: s["props"] for s in d["scenes"]}
d["noEnSub"] = True
for s in d["scenes"]: s["subtitle"]["en"] = ""   # Andy 11/17：畫面不放英文副字幕
p = S["s01"]; p["title"] = "長對話（第 17 輪）"
p["msgs"] = [{"who": "me", "text": "我一開始交代你什麼規定？", "typeAt": "start+4", "typeDur": 24, "at": "start+30"}, {"who": "ai", "text": "報告：您一開始交代的回覆規定為：每一則回覆都要以「報告：」開頭，⋯", "at": "k2"}]
p["chips"] = [{"text": "16 份文件，約 9 萬字", "at": "k1", "color": "note", "hot": True}]
p = S["s02"]; p["items"] = [{"t": "整段對話", "h": 1.0, "color": "wrong"}, {"t": "交接摘要", "h": 0.04, "color": "right"}]; p["chips"] = [{"text": "約 9 萬字", "at": "k1", "color": "wrong"}, {"text": "約 350 字", "at": "k2", "color": "right"}]; p["note"] = "示意：長短依字數（實測：16 份文件的對話與它寫的摘要）"
p = S["s03"]; p["head"] = {"text": "研究怎麼說", "at": "start-1", "color": "primary"}
p["items"] = [{"text": "18 個模型，輸入越長越不穩", "sub": "Chroma 研究，2025 年 7 月", "at": "k1", "color": "wrong"}, {"text": "重點放中間，表現最差", "sub": "「迷失在中間」論文，2023 年", "at": "k3", "color": "wrong"}]
p = S["s04"]
for n, (ic, sub, c) in zip(p["nodes"], [("text", "請 AI 寫", "primary"), ("window", "空白對話", "sky"), ("file", "照規定繼續", "right")]): n["icon"] = ic; n["sub"] = sub; n["color"] = c
p = S["s05"]; p["file"] = "交接摘要提示詞.txt"; p["status2"] = "照抄就能用"
L = ["我要換到新的對話繼續。", "請寫一段交接摘要，讓我貼到新對話：", "要包含我交代你的規定，以及我們聊過的主要主題。"]
p["lines"] = [{"t": t, "n": i + 1, "at": ["start+4", "start+40", "k2"][i], "dur": 28} for i, t in enumerate(L)]; p["before"] = 0; p["after"] = 0; p["hl"] = 2; p["hlAt"] = "k3"; p["size"] = 44
p = S["s06"]; p["title"] = "舊對話：寫交接摘要"
p["msgs"] = [{"who": "me", "text": "我要換到新的對話繼續。請寫一段交接摘要⋯", "typeAt": "start+4", "typeDur": 26, "at": "start+34"}, {"who": "ai", "text": "報告：【交接摘要】1. 對話規則：每一則回覆必須以「報告：」開頭，⋯", "at": "k1"}]; p.pop("chips", None)
p = S["s07"]; p["title"] = "新對話：貼上交接摘要"
p["msgs"] = [{"who": "me", "text": "以下是上一段對話的交接摘要，請照裡面的規定繼續：", "typeAt": "start+4", "typeDur": 30, "at": "start+38"}, {"who": "ai", "text": "報告：收到交接摘要與相關規定。", "at": "k2"}]
p["chips"] = [{"text": "四次都守住", "at": "k3", "color": "right", "hot": True}]
p = S["s08"]; p["rows"] = [{"big": "不是變笨", "unit": "", "at": "start-10", "color": "primary", "size": 210, "usize": 100}, {"big": "是越長越不穩", "unit": "", "at": "k2", "color": "wrong", "size": 130, "usize": 100}, {"big": "留言「交接」", "unit": "", "at": "k3", "color": "right", "size": 105, "usize": 100}]
json.dump(d, open(F, "w"), ensure_ascii=False, indent=1)
