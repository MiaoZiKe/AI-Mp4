#!/bin/bash
# usage: tools/sheet.sh out.png f1.png f2.png ... (up to 6) → 3x2 contact sheet at half size
out=$1; shift
ins=(); for f in "$@"; do ins+=(-i "$f"); done
n=$#
layout=""; for ((i=0;i<n;i++)); do x=$(( (i%3)*540 )); y=$(( (i/3)*960 )); layout+="${x}_${y}|"; done
filt=""; for ((i=0;i<n;i++)); do filt+="[$i:v]scale=540:960[s$i];"; done
for ((i=0;i<n;i++)); do filt+="[s$i]"; done
ffmpeg -hide_banner -loglevel error -y "${ins[@]}" -filter_complex "${filt}xstack=inputs=$n:layout=${layout%|}:fill=black" "$out"
