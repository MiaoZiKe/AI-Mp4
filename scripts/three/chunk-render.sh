#!/bin/bash
# 分段渲染（容器常重開，整支 35 分鐘一次渲常被砍）：每 240 幀一段，已完成的段跳過，可重複執行續渲。
# 用法：AUDIO=<上一版成品 mp4 或 wav> bash scripts/three/chunk-render.sh <slug> <ver>   → 產生 out/<slug>.video.mp4，接著跑片尾音、混音、mux、抽格（不重做配音／對齊）
set -e
SLUG=$1; VER=$2; cd "$(dirname "$0")/../.."
N=$(python3 -c "import json;print(json.load(open('videos/$SLUG/storyboard.json'))['totalFrames'])")
D=out/chunks/$SLUG; mkdir -p $D; : > $D/list.txt; : >> out/.render.lock
for ((a=0; a<N; a+=240)); do b=$((a+239)); [ $b -ge $N ] && b=$((N-1))
  f=$D/c$(printf %05d $a).mp4; echo "file '$(basename $f)'" >> $D/list.txt
  [ -s $f ] && continue
  echo "▶ 段 $a-$b / $N"
  flock out/.render.lock env THREE_CONCURRENCY=${CONC:-2} RENDER_TIMEOUT_MS=180000 node scripts/three/render-range.mjs $SLUG $a $b $f.tmp.mp4 && mv $f.tmp.mp4 $f
done
ffmpeg -loglevel error -y -f concat -safe 0 -i $D/list.txt -c copy out/$SLUG.video.mp4
# 音軌：沿用同一條時間軸的上一版成品音軌（AUDIO=檔案，wav 或 mp4 都可），不重混音
OUT=out/$SLUG.$VER.mp4
ffmpeg -loglevel error -y -i out/$SLUG.video.mp4 -i "$AUDIO" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest $OUT
G=out/$SLUG-make/g; rm -rf $G; mkdir -p $G
ffmpeg -loglevel error -y -i $OUT -vf 'fps=1/4.5,scale=216:-1' $G/%03d.png
ffmpeg -loglevel error -y -pattern_type glob -i "$G/*.png" -vf 'tile=6x3' -frames:v 1 out/$SLUG.$VER-grid.jpg
echo "✔ $OUT 片長 $(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT)"
