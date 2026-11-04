#!/bin/bash
# Full pipeline: audio → frames → MP4 → cover.  Requires .venv (python3.11 + tensorflow-cpu 2.12.1 + zhtts) and node.
set -euo pipefail
cd "$(dirname "$0")/.."
.venv/bin/python tools/build_audio.py
node tools/render.js --all --workers 1 --force
bash tools/encode.sh
node tools/render.js --cover 1700
