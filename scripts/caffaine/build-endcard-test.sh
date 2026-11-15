#!/bin/bash
# 片尾卡測試片：渲染畫面 → 合成招牌音 → 調響度 → 合成 mp4（AAC）＋只有片尾音效的 mp3。成品都在 out/（不進 git）。
set -e
cd "$(dirname "$0")/../.."
SLUG=caffaine-endcard-test; O=out/$SLUG; mkdir -p $O/sfx
node scripts/caffaine/make-endcard-timeline.mjs $SLUG
npm run render $SLUG
python3 scripts/caffaine/sfx-caffaine.py $O/sfx/sting.wav
python3 scripts/caffaine/mix-endsting.py $O/sfx/sting.wav $O/sfx/sting-mix.wav
DUR=$(python3 -c "import json;print(json.load(open('src/components/ai-iso/caffaineTimeline.json'))['total']/30)")
ffmpeg -loglevel error -y -i out/$SLUG.mp4 -i $O/sfx/sting-mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -t $DUR out/$SLUG.final.mp4
ffmpeg -loglevel error -y -i $O/sfx/sting-mix.wav -t 3.4 -c:a libmp3lame -b:a 256k out/caffaine-endsting.mp3
echo "✔ out/$SLUG.final.mp4　out/caffaine-endsting.mp3"
