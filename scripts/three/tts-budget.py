#!/usr/bin/env python3
"""配音額度計數（2026-11-25 Andy：「這不是剛剛確認還有」）。
Gemini 每日額度在太平洋時間午夜（台北 16:00，夏令 15:00）重置；從 videos/*/tts-requests.json 數這一輪已送幾次。
用法：python3 scripts/three/tts-budget.py [--limit 15]　→ 印「這一輪已用 N 次（成功 a、被擋 b），估計還剩 M 次」
上限 15 是 11/24–25 實測推算（官方文件沒寫 TTS 預覽模型免費版的每日次數），被擋過就以被擋前的累計為準。"""
import json, glob, sys
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
lim = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else 15
pt = ZoneInfo("America/Los_Angeles"); now = datetime.now(pt)
start = now.replace(hour=0, minute=0, second=0, microsecond=0)
ok = bad = 0
for f in glob.glob("videos/*/tts-requests.json"):
    try: rows = json.load(open(f))
    except Exception: continue
    for r in rows:
        try: t = datetime.fromisoformat(str(r["at"]).replace("Z", "+00:00"))
        except Exception: continue
        if t >= start: ok += r.get("status") == 200; bad += r.get("status") == 429
used = ok + bad
tp = lambda d: d.astimezone(ZoneInfo("Asia/Taipei")).strftime("%m/%d %H:%M")
print(f"這一輪（台北 {tp(start)} 起）已用 {used} 次（成功 {ok}、被擋 {bad}），估計還剩 {max(0, lim - used)} 次；下次重置 台北 {tp(start + timedelta(days=1))}")
