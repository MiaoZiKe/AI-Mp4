#!/bin/bash
# 片尾招牌音混音（v7，2026/11/15 Andy：「音效很棒，但可以再大聲點」）。正片（招牌音開始前）一個樣本都不動，只疊上招牌音。
# 用法：bash scripts/three/mix-endsting.sh <原音軌(mp4/wav)> <招牌音 wav（sfx-logo-tech.py 產生）> <片尾卡開始秒數> <背景音淡到 0.3 的起點秒數> <總長秒> <輸出 wav>
# v8 起音量平衡做在 sfx-logo-tech.py 裡（鎖定前 ×0.275、主音尾巴降到 ×0.5625），這裡只乘固定倍數 G（預設 22）；
# 第一道 limiter −1.3 dBFS（lookahead 20 ms、release 200 ms，latency=1：補回 lookahead 的延遲，音效準確對到畫面那一幀；v7 沒補，主音晚了 20 ms），
# 總和再過 −1.4 dBFS（3 ms，整條音軌一致延後 3 ms，和 v6／v7 正片相同）。
# 結果（tech-2nm v8）：片尾段 −11.6 LUFS、true peak −1.3 dBTP（AAC 後同）；招牌音單獨 −10.9 LUFS；鎖定那一幀 RMS 比四次撞合高 5–8 dB。
set -e
SRC=$1; STING=$2; AT=$3; FADE=$4; DUR=$5; OUT=$6
LOCK=$(python3 -c "print(round($AT + 34/30, 4))")
MS=$(python3 -c "print(int(round($AT*1000)))")
G=${G:-22}
ffmpeg -loglevel error -y -i "$SRC" -i "$STING" -filter_complex "[0:a]aresample=48000,apad=whole_dur=$DUR,volume='if(lt(t,$FADE),1,max(0.3,1-(t-$FADE)/0.25*0.7))':eval=frame[bg];[1:a]adelay=$MS|$MS,volume=$G,alimiter=limit=0.86:attack=20:release=${LR:-200}:level=disabled:latency=1[s];[bg][s]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.85:attack=3:release=60:level=disabled[o]" -map "[o]" -ar 48000 -c:a pcm_s16le "$OUT"
echo "片尾段："; ffmpeg -nostats -ss $AT -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)"
