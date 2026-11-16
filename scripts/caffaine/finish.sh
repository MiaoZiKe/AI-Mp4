#!/usr/bin/env bash
# 用法：scripts/caffaine/finish.sh <slug>
# render → 改名 .no-sting.mp4 → 疊片尾招牌音（at＝storyboard 最後一幕 startFrame÷30）→ 影像複製、音軌換成疊好的 → 量片尾段 LUFS
set -euo pipefail
cd "$(dirname "$0")/../.."
slug="$1"; STING=out/caffaine-endcard-standalone/sting-soft.wav
npm run -s render "$slug"
mv -f "out/$slug.mp4" "out/$slug.no-sting.mp4"
at=$(python3 -c "import json;s=json.load(open('videos/$slug/storyboard.json'));print(s['scenes'][-1]['startFrame']/s['fps'])")
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "out/$slug.no-sting.mp4")
python3 scripts/caffaine/mix-endsting.py "$STING" "out/$slug-sting.wav" --src "out/$slug.no-sting.mp4" --at "$at" --dur "$dur"
ffmpeg -loglevel error -y -i "out/$slug.no-sting.mp4" -i "out/$slug-sting.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest "out/$slug.mp4"
echo "片尾段（${at}s 起）響度："; ffmpeg -nostats -ss "$at" -i "out/$slug.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tail -2
echo "完成 out/$slug.mp4  $(date)"
