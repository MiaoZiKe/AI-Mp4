#!/usr/bin/env bash
# Full pipeline: script.json -> voice -> mix -> frames -> MP4 (+ cover, srt)
set -euo pipefail
cd "$(dirname "$0")"
python3 tools/voice.py 1.28          # TTS per page + timestamps + ASR self-check -> voice_timing.json
python3 tools/mix.py                 # voice chain + room tone + music + sidechain + -14 LUFS
node tools/render.js video output/video_noaudio.mp4
ffmpeg -y -i output/video_noaudio.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart output/midterm-editorial.mp4
node tools/render.js stills preview/cover 5.5 && cp preview/cover/t005.50.png output/cover.png
python3 tools/make_srt.py
node tools/qa_cues.js 2026
