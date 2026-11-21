#!/bin/bash
# 哩股哩股成片音軌：旁白（整條調到 −16 LUFS、真峰值 −1.5）＋片尾招牌音（只在片尾卡）。正片沒有背景音樂與音效。
# 用法：bash scripts/dossier/mix-final.sh <旁白 wav 或 none> <招牌音 wav> <片尾卡開始秒> <總長秒> <輸出 wav>
# 招牌音乘固定倍數 G（預設 4.9），過 limiter（latency=1：補回 lookahead，音效準確落在畫面那一幀）；目標片尾段約 −11.5 LUFS、真峰值 ≤ −1 dBTP。
# 2026/11/21 音訊不斷續（docs/channels/audio-continuity-rule.md）：
#   - 旁白先過 voice-prep.py（剪掉夾在 PCM 裡的 C2PA 區塊，量首字起音）；
#   - 片頭淡入 FADE_IN（預設 0.3 秒，但不超過首字起音前 0.03 秒，舊錄音首字很早時自動縮短，不吃字）；
#   - 全片疊一層極低的粉紅噪音 dither（DITHER_A，預設 0.00006 ≈ −90 dBFS RMS），成品不會出現樣本值全 0 的數位靜音。
set -e
VOICE=$1; STING=$2; AT=$3; DUR=$4; OUT=$5; G=${G:-4.9}
HERE=$(cd "$(dirname "$0")" && pwd)
MS=$(python3 -c "print(int(round($AT*1000)))")
DA=${DITHER_A:-0.00006}
if [ "$VOICE" = "none" ]; then IN0=(-f lavfi -t "$DUR" -i "anullsrc=r=48000:cl=stereo"); VF="[0:a]anull[v]";
else
  PREP="${OUT%.wav}.voice.wav"; ONSET=$(python3 "$HERE/voice-prep.py" "$VOICE" "$PREP")
  FI=$(python3 -c "print(round(max(0.02, min(${FADE_IN:-0.3}, $ONSET - 0.03)), 3))")
  IN0=(-i "$PREP"); VF="[0:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad=whole_dur=$DUR,atrim=0:$DUR,afade=t=in:st=0:d=$FI:curve=qsin[v]"
fi
ffmpeg -loglevel error -y "${IN0[@]}" -i "$STING" -f lavfi -t "$DUR" -i "anoisesrc=r=48000:c=pink:a=$DA:seed=7" -filter_complex "$VF;[1:a]aresample=48000,adelay=$MS|$MS,volume=$G,alimiter=limit=0.86:attack=5:release=150:level=disabled:latency=1[s];[2:a]aformat=channel_layouts=stereo[n];[v][s][n]amix=inputs=3:normalize=0:duration=first,alimiter=limit=0.87:attack=3:release=60:level=disabled:latency=1[o]" -map "[o]" -ar 48000 -c:a pcm_s16le "$OUT"
if [ -n "$PREP" ]; then rm -f "$PREP"; fi
echo "片尾段（$AT 秒起）："; ffmpeg -nostats -ss $AT -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)"
