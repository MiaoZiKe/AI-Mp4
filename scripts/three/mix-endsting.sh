#!/bin/bash
# 片尾招牌音混音（v7，2026/11/15 Andy：「音效很棒，但可以再大聲點」）。正片（招牌音開始前）一個樣本都不動，只疊上招牌音。
# 用法：bash scripts/three/mix-endsting.sh <原音軌(mp4/wav)> <招牌音 wav（sfx-logo-tech.py 產生）> <片尾卡開始秒數> <背景音淡到 0.3 的起點秒數> <總長秒> <輸出 wav>
# 招牌音音量包絡（相對 sfx 檔的 −3 dBFS 峰值）：鎖定前 ×4.4（≈+6 dB 於 v6 的 ×2.2）、鎖定前 60 ms 線性升到 ×16、主音保持 0.8 秒、0.8 秒降到 ×6.5 的尾巴；
# 第一道 limiter（−1.3 dBFS、lookahead 20 ms、release 400 ms，慢包絡不產生失真）只壓主音，最後一道 −1.2 dBFS 保護。
# 結果（tech-2nm）：片尾段 −11.1 LUFS、true peak −1.2 dBTP（AAC 後同）；招牌音單獨 −10.3 LUFS（v6 −14.1）。主音那 0.1 秒仍是全段最大聲。
set -e
SRC=$1; STING=$2; AT=$3; FADE=$4; DUR=$5; OUT=$6
LOCK=$(python3 -c "print(round($AT + 34/30, 4))")
MS=$(python3 -c "print(int(round($AT*1000)))")
ENV="asetnsamples=n=16,volume='if(lt(t,$LOCK-0.06),4.4,if(lt(t,$LOCK),4.4+(16-4.4)*(t-$LOCK+0.06)/0.06,if(lt(t,$LOCK+0.8),16,if(lt(t,$LOCK+1.6),16+(6.5-16)*(t-$LOCK-0.8)/0.8,6.5))))':eval=frame"
ffmpeg -loglevel error -y -i "$SRC" -i "$STING" -filter_complex "[0:a]aresample=48000,apad=whole_dur=$DUR,volume='if(lt(t,$FADE),1,max(0.3,1-(t-$FADE)/0.25*0.7))':eval=frame[bg];[1:a]adelay=$MS|$MS,$ENV,alimiter=limit=0.86:attack=20:release=400:level=disabled[s];[bg][s]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.87:attack=3:release=60:level=disabled[o]" -map "[o]" -ar 48000 -c:a pcm_s16le "$OUT"
echo "片尾段："; ffmpeg -nostats -ss $AT -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)"
