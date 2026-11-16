#!/usr/bin/env bash
# 用法：scripts/caffaine/make.sh <slug> [--silent|--voice]   （預設 --silent）
# 一支指令跑完：念稿預檢 → validate → tsc（src 有變才跑）→ 出片（finish.sh）→ 版面檢查（每 6 幀）→ 停住偵測 → 16 格拼圖 → 一行摘要。
# 任何一步失敗就停，並印出「卡在哪一步」＋該步輸出最後 15 行（報錯才需要派人修）。
set -uo pipefail
cd "$(dirname "$0")/../.."
slug="${1:?用法：make.sh <slug> [--silent|--voice]}"; mode="${2:---silent}"
[ -d "videos/$slug" ] || { echo "找不到 videos/$slug"; exit 2; }
LOG="out/$slug-make.log"; mkdir -p out; : > "$LOG"
step() { # step <名稱> <指令…>
  local name="$1"; shift; echo "▶ $name"
  if ! "$@" >>"$LOG.step" 2>&1; then echo "✖ 卡在【$name】："; tail -15 "$LOG.step"; cat "$LOG.step" >>"$LOG"; rm -f "$LOG.step"; exit 1; fi
  cat "$LOG.step" >>"$LOG"; rm -f "$LOG.step"
}
rm -f "$LOG.step"
step "1 念稿預檢" python3 scripts/caffaine/tts-precheck.py "$slug"
step "2 validate" npm run -s validate "$slug"
h=$(find src -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | sort -z | xargs -0 md5sum | md5sum | cut -c1-32)
if [ "$(cat out/.tsc-hash 2>/dev/null)" != "$h" ]; then step "3 tsc（src 有變動）" npm run -s typecheck; echo "$h" > out/.tsc-hash; else echo "▶ 3 tsc 略過（src 沒變）"; fi
if [ "$mode" = "--voice" ]; then
  [ -f "videos/$slug/tts-manifest.json" ] || { echo "✖ --voice 要先配音：scripts/caffaine/voice-batch.sh $slug"; exit 1; }
  if [ ! -f "videos/$slug/timeline.json" ] || [ "videos/$slug/tts-manifest.json" -nt "videos/$slug/timeline.json" ]; then
    step "4a align" env NODE_USE_ENV_PROXY=1 ALIGN_GAP_MIN=0.3 ALIGN_BEAT_GAP=0.7 npm run -s align "$slug" -- --force
  fi
fi
if [ "$mode" != "--voice" ] && { [ ! -f "videos/$slug/timeline.json" ] || [ "videos/$slug/script.json" -nt "videos/$slug/timeline.json" ]; }; then
  step "4a 無聲時間軸" node scripts/ui/silent-timeline.mjs "$slug"
fi
step "4 出片 $mode（finish.sh）" bash scripts/caffaine/finish.sh "$slug"
step "5 版面檢查（ov-check 每 6 幀）" node scripts/caffaine/ov-check.mjs "$slug" 6
python3 - "$slug" >"$LOG.ov" <<'PY' || { echo "✖ 卡在【5 版面檢查】："; head -15 "$LOG.ov"; exit 1; }
import json,sys
r=json.load(open(f"out/{sys.argv[1]}/ov-report.json")); n=len(r["issues"]); print(n)
for i in r["issues"][:15]: print(i)
sys.exit(1 if n else 0)
PY
ovn=$(head -1 "$LOG.ov")
mp4="out/$slug.mp4"
fz=$(ffmpeg -nostats -i "$mp4" -vf "freezedetect=n=-60dB:d=1.5" -an -f null - 2>&1 | grep -c "freeze_start" || true)
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$mp4")
ffmpeg -loglevel error -y -i "$mp4" -vf "fps=16/$dur,scale=270:-1,tile=4x4" -frames:v 1 "out/$slug-sheet.png" || { echo "✖ 卡在【6 拼圖】"; exit 1; }
lufs=$(grep -E "^\s+I:" "$LOG" | tail -1 | awk '{print $2}')
printf "✔ %s｜片長 %.1f 秒｜重疊 %s 筆｜停住 %s 次｜片尾 %s LUFS｜拼圖 out/%s-sheet.png\n" "$slug" "$dur" "${ovn:-0}" "$fz" "${lufs:-?}" "$slug"
[ "${fz:-0}" -gt 0 ] && echo "⚠ 有停住 ≥1.5 秒的段落，看 $LOG 或 freezedetect"
exit 0
