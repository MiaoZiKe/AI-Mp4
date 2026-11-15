#!/bin/bash
# 哩股哩股成片音軌：旁白（使用者上傳的錄音，整條調到 −16 LUFS、真峰值 −1.5）＋片尾招牌音（只在片尾卡）。正片沒有背景音樂與音效。
# 用法：bash scripts/dossier/mix-final.sh <旁白 wav 或 none> <招牌音 wav> <片尾卡開始秒> <總長秒> <輸出 wav>
# 招牌音乘固定倍數 G（預設 3.7），過 limiter（latency=1：補回 lookahead，音效準確落在畫面那一幀）；目標片尾段約 −11.5 LUFS、真峰值 ≤ −1 dBTP。
set -e
VOICE=$1; STING=$2; AT=$3; DUR=$4; OUT=$5; G=${G:-3.7}
MS=$(python3 -c "print(int(round($AT*1000)))")
if [ "$VOICE" = "none" ]; then IN0=(-f lavfi -t "$DUR" -i "anullsrc=r=48000:cl=stereo"); VF="[0:a]anull[v]";
else IN0=(-i "$VOICE"); VF="[0:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad=whole_dur=$DUR,atrim=0:$DUR[v]"; fi
ffmpeg -loglevel error -y "${IN0[@]}" -i "$STING" -filter_complex "$VF;[1:a]aresample=48000,adelay=$MS|$MS,volume=$G,alimiter=limit=0.86:attack=5:release=150:level=disabled:latency=1[s];[v][s]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.87:attack=3:release=60:level=disabled:latency=1[o]" -map "[o]" -ar 48000 -c:a pcm_s16le "$OUT"
echo "片尾段（$AT 秒起）："; ffmpeg -nostats -ss $AT -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)"
