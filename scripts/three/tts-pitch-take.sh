#!/bin/bash
# 科技片「音高關卡」配音（2026/11/24 Andy 聽出矽晶圓與光罩的旁白音色差很多）：
#   整篇配音一次 → 量原始錄音音高中位數（voice-measure.py 的 f0Median）→ 落在 120–135 Hz 才收下；
#   不合格就把這版存成 out/<slug>-take-reject-N.wav 再重配，最多共 3 次 TTS 請求；
#   3 次都不合格 → 選最接近基準 121.5 Hz 的那版，輸出標 ⚠️。
# 收下（或選中）的原始錄音複製到 out/<slug>-take.orig.wav，接著用 make-tech.sh --take=out/<slug>-take.orig.wav。
# 每次結果寫進 videos/<slug>/tts-pitch.json。
# 用法：bash scripts/three/tts-pitch-take.sh <slug> [--max=3]
# 注意：tts-take.mjs 以「念稿＋音色＋提示」的雜湊快取原始錄音（public/audio/<slug>/.take-<hash>.raw.wav），
#       而 make-tech.sh 會把那個檔換成 atempo 後的版本 → 一律帶 --force 才會真的重新生成；舊檔先備份到 out/old-<slug>-take/。
set -u
# 2026-11-25：配音一次只送一支（flock out/.tts.lock），避免兩支同時配音撞到「每分鐘」額度；每分鐘額度 tts-take.mjs 會自動等待重送。
SLUG=${1:-}; shift || true
[ -z "$SLUG" ] && { echo "用法：bash scripts/three/tts-pitch-take.sh <slug> [--max=3]"; exit 2; }
MAX=3
for a in "$@"; do case $a in --max=*) MAX=${a#*=};; *) echo "不認得的參數：$a"; exit 2;; esac; done
cd "$(dirname "$0")/../.."
LO=120; HI=135; BASE=127.5   # 2026-11-26 Andy：「131 這音頻OK 以後可以120～135 Hz」
V=videos/$SLUG; [ -f $V/script.json ] || { echo "找不到 $V/script.json"; exit 2; }
PJ=$V/tts-pitch.json
python3 scripts/three/tts-budget.py || true   # 11-25：配音前先印額度剩幾次
RAWREL=$(node scripts/tts-take.mjs "$SLUG" --hash) || exit 1
RAW=public/$RAWREL
BK=out/old-$SLUG-take; mkdir -p "$BK" out
[ -f "$RAW" ] && cp -n "$RAW" "$BK/$(basename "$RAW").$(date +%H%M%S)"

f0() { .venv/bin/python -I scripts/voice-measure.py "$1" | python3 -c "import json,sys;print(json.load(sys.stdin)['f0Median'])"; }
record() { # n f0 sec accepted file note
  python3 - "$PJ" "$@" <<'PY'
import json,os,sys,datetime
p,n,f0,sec,acc,file,note=sys.argv[1:8]
d=json.load(open(p)) if os.path.exists(p) else {"rule":"f0Median 120–135 Hz 才收下（基準 121.5 Hz＝光罩-1／光罩-2 實測），最多 3 次請求","runs":[]}
if n=="1" or not d["runs"] or d["runs"][-1].get("closed"): d["runs"].append({"startedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),"attempts":[]})
r=d["runs"][-1]
r["attempts"].append({"n":int(n),"at":datetime.datetime.now(datetime.timezone.utc).isoformat(),"f0Median":float(f0) if f0 else None,"sec":float(sec) if sec else None,"accepted":acc=="1","file":file,"note":note})
json.dump(d,open(p,"w"),ensure_ascii=False,indent=1); open(p,"a").write("\n")
PY
}
close_run() { # chosenFile f0 status
  python3 - "$PJ" "$@" <<'PY'
import json,sys
p,f,f0,st=sys.argv[1:5]
d=json.load(open(p)); r=d["runs"][-1]; r.update(closed=True,chosen=f,chosenF0=float(f0),status=st)
json.dump(d,open(p,"w"),ensure_ascii=False,indent=1); open(p,"a").write("\n")
PY
}

BEST=""; BESTF=""; BESTD=999
for N in $(seq 1 "$MAX"); do
  echo "▶ 第 $N 次配音（TTS 請求 1 次）：$(TZ=Asia/Taipei date '+%H:%M:%S')"
  if ! TTS_NO_RETRY=1 NODE_USE_ENV_PROXY=1 flock out/.tts.lock node scripts/tts-take.mjs "$SLUG" --force > out/$SLUG-pitch-take-$N.log 2>&1; then
    tail -5 out/$SLUG-pitch-take-$N.log
    # 已生成原始錄音但後段（對齊）失敗時仍可量；沒有音檔就停
    if ! grep -q "^✔ public/" out/$SLUG-pitch-take-$N.log; then
      record "$N" "" "" 0 "" "請求失敗：$(grep -m1 '✖' out/$SLUG-pitch-take-$N.log)"
      echo "✖ 第 $N 次請求失敗，停止（不重試、不換帳號）"; break
    fi
  fi
  F=$(f0 "$RAW"); SEC=$(python3 -c "import wave;w=wave.open('$RAW');print(round(w.getnframes()/w.getframerate(),2))")
  D=$(python3 -c "print(abs($F-$BASE))")
  if python3 -c "import sys;sys.exit(0 if $LO<=$F<=$HI else 1)"; then
    cp "$RAW" out/$SLUG-take.orig.wav
    record "$N" "$F" "$SEC" 1 "out/$SLUG-take.orig.wav" "合格"
    close_run "out/$SLUG-take.orig.wav" "$F" "accepted"
    echo "✔ 第 $N 次 f0Median $F Hz（${SEC}s）合格 → out/$SLUG-take.orig.wav"; exit 0
  fi
  REJ=out/$SLUG-take-reject-$N.wav; cp "$RAW" "$REJ"
  record "$N" "$F" "$SEC" 0 "$REJ" "超出 $LO–$HI Hz"
  echo "✖ 第 $N 次 f0Median $F Hz（${SEC}s）不合格 → $REJ"
  if python3 -c "import sys;sys.exit(0 if $D<$BESTD else 1)"; then BEST=$REJ; BESTF=$F; BESTD=$D; fi
done
[ -z "$BEST" ] && { echo "✖ 沒有任何可用的錄音"; exit 1; }
cp "$BEST" out/$SLUG-take.orig.wav
close_run "$BEST" "$BESTF" "fallback-closest"
echo "⚠️ $MAX 次都不在 $LO–$HI Hz，選最接近 $BASE Hz 的 $BEST（$BESTF Hz）→ out/$SLUG-take.orig.wav；make-tech.sh 需加 --allow-pitch"
exit 3
