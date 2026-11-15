#!/bin/bash
# 獨立片尾頁 3 款背景（light 淺色／dark 深色／white 純白景深）→ out/caffaine-endcard-standalone/（不進 git）；音效沿用 out/caffaine-logo-anim/sting-mix.wav
set -e
cd "$(dirname "$0")/../.."
O=out/caffaine-endcard-standalone; S=out/caffaine-logo-anim/sting-mix.wav; mkdir -p $O
for B in light dark white; do
  node scripts/caffaine/render-logo-clip.mjs video $B $O/$B.silent.mp4
  ffmpeg -loglevel error -y -i $O/$B.silent.mp4 -i $S -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -t 3.8667 $O/caffaine-endcard-$B.mp4
done
echo done
