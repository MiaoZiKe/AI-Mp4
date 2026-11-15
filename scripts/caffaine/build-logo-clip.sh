#!/bin/bash
# CaffAIne LOGO 動畫獨立短片（1080×1920 與 1080×1080，各約 3.9 秒，有聲）＋只有音效的 mp3 → out/caffaine-logo-anim/（不進 git）
set -e
cd "$(dirname "$0")/../.."
O=out/caffaine-logo-anim; mkdir -p $O
python3 scripts/caffaine/sfx-caffaine.py $O/sting.wav
python3 scripts/caffaine/mix-endsting.py $O/sting.wav $O/sting-mix.wav
for F in tall square; do
  node scripts/caffaine/render-logo-clip.mjs video $F $O/$F.silent.mp4
  ffmpeg -loglevel error -y -i $O/$F.silent.mp4 -i $O/sting-mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -t 3.8667 $O/caffaine-logo-anim-$F.mp4
done
ffmpeg -loglevel error -y -i $O/sting-mix.wav -c:a libmp3lame -b:a 256k out/caffaine-endsting.mp3
echo "✔ $O/caffaine-logo-anim-tall.mp4　$O/caffaine-logo-anim-square.mp4　out/caffaine-endsting.mp3"
