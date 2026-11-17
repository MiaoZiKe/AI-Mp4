#!/usr/bin/env python3
"""依子 agent id 加總 token（讀本機 ~/.claude/projects 逐字稿，不連網、不改檔）。
用法：python3 scripts/ops/token-by-agent.py <agent_id> [<agent_id> ...]
輸出 JSON：每個 id 與合計的 input／output／cache_write／cache_read／total。"""
import json, glob, os, sys
ids = sys.argv[1:]
out, tot = {}, dict(input=0, output=0, cache_write=0, cache_read=0)
for aid in ids:
    s = dict(input=0, output=0, cache_write=0, cache_read=0); seen = set()
    for f in glob.glob(os.path.expanduser(f"~/.claude/projects/**/agent-{aid}.jsonl"), recursive=True):
        for line in open(f, errors="ignore"):
            try: e = json.loads(line)
            except Exception: continue
            m = e.get("message") or {}; u = m.get("usage")
            if e.get("type") != "assistant" or not u: continue
            k = m.get("id") or e.get("uuid")
            if k in seen: continue
            seen.add(k)
            s["input"] += u.get("input_tokens", 0); s["output"] += u.get("output_tokens", 0)
            s["cache_write"] += u.get("cache_creation_input_tokens", 0); s["cache_read"] += u.get("cache_read_input_tokens", 0)
    s["total"] = sum(s.values()); out[aid] = s
    for k in tot: tot[k] += s[k]
tot["total"] = sum(tot.values()); out["合計"] = tot
print(json.dumps(out, ensure_ascii=False))
