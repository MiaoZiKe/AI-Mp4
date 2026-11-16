#!/usr/bin/env bash
# 用法：scripts/caffaine/ov-chunks.sh <slug> [step=6] [chunk=25]  分批跑 ov-check（單次連跑太多幀瀏覽器會掛；掛了就對半切再跑），結果寫 out/<slug>-ov.log
slug="$1"; step="${2:-6}"; chunk="${3:-25}"; cd "$(dirname "$0")/../.."
total=$(python3 -c "import json;print(json.load(open('videos/$slug/timeline.json'))['totalFrames'])")
LOG=out/$slug-ov.log; : > $LOG
run() { # $1=逗號分隔的幀
  local out; out=$(node scripts/caffaine/ov-check.mjs $slug $step --frames=$1 2>&1)
  if echo "$out" | grep -q "版面檢查（程式）"; then echo "$out" | grep -E "版面檢查|^   " >> $LOG; return 0; fi
  IFS=',' read -ra A <<< "$1"; local n=${#A[@]}
  if [ $n -le 1 ]; then echo "沒有結果 f$1" >> $LOG; return 1; fi
  local h=$((n/2)); run "$(IFS=,; echo "${A[*]:0:$h}")"; run "$(IFS=,; echo "${A[*]:$h}")"
}
f=0; while [ $f -lt $total ]; do
  list=$(python3 -c "print(','.join(str(x) for x in range($f,min($f+$chunk*$step,$total),$step)))")
  run "$list"; f=$((f+chunk*step))
done
echo FINISHED >> $LOG
