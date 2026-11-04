#!/usr/bin/env bash
# Download the OFL fonts used by the template (Noto Serif TC, Noto Sans TC, JetBrains Mono) from google/fonts.
set -euo pipefail; cd "$(dirname "$0")/../template/fonts"
B=https://raw.githubusercontent.com/google/fonts/main/ofl
curl -fsSL -o NotoSansTC.ttf    "$B/notosanstc/NotoSansTC%5Bwght%5D.ttf"
curl -fsSL -o NotoSerifTC.ttf   "$B/notoseriftc/NotoSerifTC%5Bwght%5D.ttf"
curl -fsSL -o JetBrainsMono.ttf "$B/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf"
