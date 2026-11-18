#!/bin/bash
# 分段渲染（容器常重開，整支 35 分鐘一次渲常被砍）：每 240 幀一段，已完成的段跳過，可重複執行續渲。
# 用法：bash scripts/three/chunk-render.sh <slug> <ver>   → 產生 out/<slug>.video.mp4，接著跑片尾音、混音、mux、抽格（不重做配音／對齊）
set -e
SLUG=$1; VER=$2; cd "$(dirname "$0")/../.."
N=$(python3 -c "import json;print(json.load(open('videos/$SLUG/storyboard.json'))['totalFrames'])")
D=out/chunks/$SLUG; mkdir -p $D; : > $D/list.txt; : >> out/.render.lock
for ((a=0; a<N; a+=240)); do b=$((a+239)); [ $b -ge $N ] && b=$((N-1))
  f=$D/c$(printf %05d $a).mp4; echo "file '$(basename $f)'" >> $D/list.txt
  [ -s $f ] && continue
  echo "▶ 段 $a-$b / $N"
  flock out/.render.lock env THREE_CONCURRENCY=4 RENDER_TIMEOUT_MS=180000 node scripts/three/render-range.mjs $SLUG $a $b $f.tmp.mp4 && mv $f.tmp.mp4 $f
done
ffmpeg -loglevel error -y -f concat -safe 0 -i $D/list.txt -c copy out/$SLUG.video.mp4
sed 's#^run "3 渲染.*#echo "▶ 3 渲染（分段已完成）"#' scripts/three/.make-foundry-nostep2.sh > out/.make-norender.sh
bash out/.make-norender.sh $SLUG --ver=$VER
