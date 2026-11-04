#!/usr/bin/env bash
# Full pipeline: TTS -> timeline -> frames -> audio -> mux (H.264 CRF18 yuv420p, AAC 192k, -14 LUFS) -> cover
set -euo pipefail
cd "$(dirname "$0")/.."
export PW=${PW:-$(node -e "console.log(require.resolve('playwright'))")}
STEP=${1:-all}
if [[ $STEP == all ]]; then
  python3 tools/check_script.py
  python3 tools/tts.py
  node tools/timeline.mjs
  node tools/render.mjs video 4
fi
python3 tools/audio.py
# two-pass loudnorm (after a gentle limiter so the normaliser can stay linear)
PRE="alimiter=limit=0.7:attack=3:release=60:level=disabled"
J=$(ffmpeg -hide_banner -i build/mix.wav -af "$PRE,loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
LN="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true"
DUR=$(python3 -c "import json;print(json.load(open('timeline.json'))['duration'])")
mkdir -p output
ffmpeg -y -hide_banner -loglevel error -i build/video.mkv -i build/mix.wav \
  -filter_complex "[1:a]$PRE,$LN,aresample=48000[a]" -map 0:v -map "[a]" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -r 30 \
  -c:a aac -b:a 192k -ar 48000 -t "$DUR" -movflags +faststart output/midterm-2026.mp4
node tools/cover.mjs
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,channels,bit_rate -show_entries format=duration -of compact output/midterm-2026.mp4
ffmpeg -hide_banner -i output/midterm-2026.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E "I:|Peak"
