#!/bin/bash
# Mux rendered frames + mastered audio into the delivery MP4 and print its specs.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p output
ffmpeg -hide_banner -loglevel error -y -framerate 30 -i build/frames/%05d.jpg -i build/mix.wav \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -r 30 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart -shortest output/midterm-3d.mp4
ffprobe -v error -show_entries stream=codec_name,profile,width,height,pix_fmt,r_frame_rate,bit_rate,sample_rate,channels -show_entries format=duration,size -of default=nw=1 output/midterm-3d.mp4
ffmpeg -hide_banner -i output/midterm-3d.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E "I:|Peak:"
