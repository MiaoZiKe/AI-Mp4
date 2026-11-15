#!/bin/bash
# 片尾 LOGO 動畫 5 款（A 現行／B 咖啡倒進杯子／C 打字游標／D 資料流匯聚／E 印章蓋出杯子）→ out/caffaine-logo-anim-variants/（不進 git）
set -e
cd "$(dirname "$0")/../.."
O=out/caffaine-logo-anim-variants; S=out/caffaine-logo-anim/sting-mix.wav; mkdir -p $O
[ -f $S ] || { python3 scripts/caffaine/sfx-caffaine.py out/caffaine-logo-anim/sting.wav; python3 scripts/caffaine/mix-endsting.py out/caffaine-logo-anim/sting.wav $S; }
for V in A B C D E; do
  node scripts/caffaine/render-logo-clip.mjs video $V $O/$V.silent.mp4
  ffmpeg -loglevel error -y -i $O/$V.silent.mp4 -i $S -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -t 3.8667 $O/caffaine-logo-$V.mp4
done
echo done
