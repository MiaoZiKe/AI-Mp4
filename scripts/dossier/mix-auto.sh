#!/bin/bash
# 自動找招牌音增益 G：片尾段（片尾卡開始秒到結尾）在 AAC 320k 編碼後量到 −11.5 LUFS（±0.3）、真峰值 ≤ −1.0 dBTP。
# 用法：bash scripts/dossier/mix-auto.sh <voice.wav|none> <sting.wav> <片尾開始秒> <總長秒> <video.mp4> <out.mp4>
# 包 mix-final.sh：割線法（對 log G）最多 5 次；每次 mix → 換音軌（-c:v copy -c:a aac -b:a 320k）→ 量片尾段。
# 輸出 out.mp4 與 <out>.mix.wav（最後選用的混音）。環境變數 TARGET（預設 -11.5）、TOL（0.3）、G0（起始 4.5）。
set -e
VOICE=$1; STING=$2; AT=$3; DUR=$4; VIDEO=$5; OUT=$6
TARGET=${TARGET:--11.5}; TOL=${TOL:-0.3}; G=${G0:-4.5}
HERE=$(cd "$(dirname "$0")" && pwd)
WAV="${OUT%.mp4}.mix.wav"; TMP="${OUT%.mp4}.try.mp4"
measure() { ffmpeg -nostats -ss "$AT" -i "$TMP" -af ebur128=peak=true -f null - 2>&1 | awk '/^ +I:/{i=$2} /^ +Peak:/{p=$2} END{print i, p}'; }
PG=""; PL=""; BEST=""; N=0
while [ $N -lt 5 ]; do
  N=$((N+1))
  G=$G bash "$HERE/mix-final.sh" "$VOICE" "$STING" "$AT" "$DUR" "$WAV.try.wav" >/dev/null
  ffmpeg -loglevel error -y -i "$VIDEO" -i "$WAV.try.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest "$TMP"
  read L TP <<<"$(measure)"
  echo "try $N: G=$G LUFS=$L TP=$TP"
  OK=$(python3 -c "L,T=$L,$TP;print(int(abs(L-($TARGET))<=$TOL and T<=-1.0))")
  if [ "$OK" = 1 ]; then BEST="$G $L $TP"; cp "$TMP" "$OUT"; mv "$WAV.try.wav" "$WAV"; break; fi
  # 紀錄「真峰值合格且最接近目標」的備案
  python3 -c "import sys;sys.exit(0 if $TP<=-1.0 else 1)" && {
    CUR=$(python3 -c "print(abs($L-($TARGET)))"); BD=${BD:-999}
    if python3 -c "import sys;sys.exit(0 if $CUR<$BD else 1)"; then BD=$CUR; BEST="$G $L $TP"; cp "$TMP" "$OUT"; cp "$WAV.try.wav" "$WAV"; fi
  }
  NG=$(python3 - <<PY
import math
G,L,T=$G,$L,$TP; tgt=$TARGET; pg="$PG"; pl="$PL"
if pg:
    pg,pl=float(pg),float(pl)
    if abs(L-pl)>0.05 and abs(math.log(G/pg))>1e-6:
        s=(L-pl)/math.log(G/pg); ng=G*math.exp((tgt-L)/s)
    else: ng=G*10**((tgt-L)/20)
else: ng=G*10**((tgt-L)/20)
if T>-1.0:  # 真峰值超標：至少降一點
    ng=min(ng,G*10**((-1.0-T-0.2)/20))
print(round(max(0.5,min(ng,20)),3))
PY
)
  PG=$G; PL=$L; G=$NG
done
rm -f "$TMP" "$WAV.try.wav"
[ -n "$BEST" ] || { echo "沒有真峰值合格的結果"; exit 1; }
echo "最終 G / LUFS / 真峰值(dBTP)：$BEST（$N 次）→ $OUT"
