#!/usr/bin/env bash
# 用法：scripts/caffaine/ov-all.sh <slug> [step=6] [chunk=30]  分批跑 ov-check（失敗自動重跑該批），把每批 ov-report.json 的 issues 合併寫 out/<slug>-ovall.json
slug="$1"; step="${2:-6}"; chunk="${3:-30}"; cd "$(dirname "$0")/../.."
total=$(python3 -c "import json;print(json.load(open('videos/$slug/timeline.json'))['totalFrames'])")
echo '{"frames":0,"issues":[],"topMax":0,"botMax":0}' > out/$slug-ovall.json
f=0; while [ $f -lt $total ]; do
  list=$(python3 -c "print(','.join(str(x) for x in range($f,min($f+$chunk*$step,$total),$step)))")
  for t in 1 2 3 4; do
    rm -f out/$slug/ov-report.json
    node scripts/caffaine/ov-check.mjs $slug $step --frames=$list >/dev/null 2>&1; [ -f out/$slug/ov-report.json ] && break; sleep 15
  done
  python3 - "$slug" <<'PY'
import json,sys,os
s=sys.argv[1]; a=json.load(open(f"out/{s}-ovall.json"))
if os.path.exists(f"out/{s}/ov-report.json"):
    r=json.load(open(f"out/{s}/ov-report.json")); a["frames"]+=r["frames"]; a["issues"]+=r["issues"]; a["topMax"]=max(a["topMax"],r["topMax"]); a["botMax"]=max(a["botMax"],r["botMax"])
else: a["issues"].append("某批沒跑成")
json.dump(a,open(f"out/{s}-ovall.json","w"),ensure_ascii=False)
PY
  f=$((f+chunk*step))
done
echo FINISHED > out/$slug-ovall.done
