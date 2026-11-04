#!/usr/bin/env bash
# Full pipeline: narration -> timeline.json -> frames -> score/SFX -> MP4 -> HTML -> poster
set -euo pipefail
cd "$(dirname "$0")"
pip install -q numpy pillow scipy soundfile pyloudnorm edge-tts sherpa-onnx opencc-python-reimplemented
# local TTS fallback model (only used when edge-tts cannot reach its server)
if [ ! -d build/models/kokoro-multi-lang-v1_1 ]; then
  mkdir -p build/models && curl -sSL https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_1.tar.bz2 | tar xj -C build/models
fi
python3 src/tts.py                       # narration clips + frame-exact timeline.json
python3 src/render.py --out build/frames # 1584 PNG frames (multiprocessing)
python3 src/audio.py                     # build/mix.wav  (-16 LUFS, <= -1 dBTP)
ffmpeg -y -v error -framerate 24 -i build/frames/f%05d.png -i build/mix.wav \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -profile:v high -tune film \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -t 66 output/midterm-cinematic.mp4
python3 src/make_html.py
cp build/frames/f00420.png output/poster.png
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration output/midterm-cinematic.mp4
