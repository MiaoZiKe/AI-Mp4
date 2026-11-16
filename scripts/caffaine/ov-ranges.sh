#!/usr/bin/env bash
# 用法：scripts/caffaine/ov-ranges.sh <slug> <起-迄,起-迄…> [step=6]  只重跑指定幀範圍的 ov-check（掛了對半切），結果寫 out/<slug>-ov2.log
slug="$1"; ranges="$2"; step="${3:-6}"; cd "$(dirname "$0")/../.."; LOG=out/$slug-ov2.log; : > $LOG
run() { local out; out=$(node scripts/caffaine/ov-check.mjs $slug $step --frames=$1 2>&1)
  if echo "$out" | grep -q "版面檢查（程式）"; then echo "$out" | grep -E "版面檢查|^   " >> $LOG; return 0; fi
  IFS=',' read -ra A <<< "$1"; local n=${#A[@]}; [ $n -le 1 ] && { echo "沒有結果 f$1" >> $LOG; return 1; }
  local h=$((n/2)); run "$(IFS=,; echo "${A[*]:0:$h}")"; run "$(IFS=,; echo "${A[*]:$h}")"; }
for r in ${ranges//,/ }; do a=${r%-*}; b=${r#*-}
  list=$(python3 -c "print(','.join(str(x) for x in range($a,$b,$step)))"); run "$list"; done
echo FINISHED >> $LOG
