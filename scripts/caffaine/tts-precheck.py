#!/usr/bin/env python3
"""送 TTS API 前必跑：逐句印出每幕念稿（tts，沒有就用 narration），標出問題。
用法：python3 scripts/caffaine/tts-precheck.py <slug> [<slug> ...]；有問題時非零結束。
檢查（2026/11/16 Andy：「開頭有點奇怪 不用"欸" AI的 "A" 也不見了 請確實在使用API前先確認內文有沒有錯誤再發送」）：
- 不准有「欸」等多餘語助詞；AI 要寫「AI」不拆成「A I」；
- 每一句（標點切開）不准用英文字母開頭（AI、ChatGPT、App 放句首會被念成「欸」或吃掉第一個字母）。
"""
import json, re, sys
bad_total = 0
for slug in sys.argv[1:]:
    d = json.load(open(f"videos/{slug}/script.json"))
    print(f"== {slug}")
    for sc in d["scenes"]:
        t = sc.get("tts") or sc.get("narration") or ""
        if not t: continue
        why = []
        if re.search(r"欸|誒|呃", t): why.append("語助詞")
        if "A I" in t: why.append("AI 拆字")
        for part in re.split(r"[，。？！、：；「」\n]", t):
            if re.match(r"\s*[A-Za-z]", part): why.append(f"英文開頭「{part.strip()[:8]}」")
        bad_total += bool(why)
        print(f"{sc['id']} {'⚠ ' + '、'.join(why) if why else '✔'}  {t}")
sys.exit(1 if bad_total else 0)
