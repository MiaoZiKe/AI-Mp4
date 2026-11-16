#!/usr/bin/env bash
# 用法：scripts/caffaine/voice-batch.sh [--dry] <slug1> <slug2> ...    （各頻道共用；至少 1 支，建議 4～8 支）
# 任意 N 支念稿合成「同一次」TTS 請求（省免費額度）→ 切回各支 → 各自 align。
# 音色、profile、languageCode 讀各片 script.json 的 voice（沒有才用 CaffAIne 預設 Sulafat＋ai-report-v5）；各支不一致會直接報錯。
# 不加速（不設 TAKE_ATEMPO）。停頓預設 句間 ≥0.3／段落 0.7（環境變數 ALIGN_GAP_MIN／ALIGN_BEAT_GAP 可覆蓋；
#   或在第一支 script.json 的 voice 寫 gapMin／beatGap）。--dry 只合併、檢查、不送請求。
set -euo pipefail
cd "$(dirname "$0")/../.."
dry=0; [ "${1:-}" = "--dry" ] && { dry=1; shift; }
[ $# -ge 1 ] || { sed -n 2,7p "$0"; exit 2; }
for s in "$@"; do [ -f "videos/$s/script.json" ] || { echo "找不到 videos/$s/script.json"; exit 2; }; done
python3 scripts/caffaine/tts-precheck.py "$@" >/dev/null || { python3 scripts/caffaine/tts-precheck.py "$@" | grep "⚠"; echo "✖ 念稿預檢有 ⚠，先修"; exit 1; }
python3 scripts/caffaine/voice-batch.py merge "$@"
gmin=${ALIGN_GAP_MIN:-$(python3 -c "import json;print((json.load(open('videos/$1/script.json')).get('voice') or {}).get('gapMin',0.3))")}
bgap=${ALIGN_BEAT_GAP:-$(python3 -c "import json;print((json.load(open('videos/$1/script.json')).get('voice') or {}).get('beatGap',0.7))")}
[ $dry = 1 ] && { echo "（--dry：已寫 videos/voice-batch-tmp/script.json，沒送請求；停頓 $gmin／$bgap）"; exit 0; }
NODE_USE_ENV_PROXY=1 node scripts/tts-take.mjs voice-batch-tmp
python3 scripts/caffaine/voice-batch.py split "$@"
for s in "$@"; do NODE_USE_ENV_PROXY=1 ALIGN_GAP_MIN=$gmin ALIGN_BEAT_GAP=$bgap npm run -s align "$s" -- --force; done
echo "完成：$# 支配音＋對齊。請把 voice-batch-tmp 留著（含原始整篇錄音），不要重送。"
