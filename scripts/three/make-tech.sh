#!/bin/bash
# 科技片「配音之後」一條龍：（換配音）→ resplit → align → validate → layout-check → 渲染 → 片尾招牌音混音 → mux → 量響度與抽格。
# 用法：bash scripts/three/make-tech.sh <slug> [--atempo=1.23] [--take=<選定試聽 wav>] [--ver=v1] [--dry]
#   --take   Andy 選定的試聽錄音；會換成正式整篇原始音檔（.raw.orig.wav 存原檔、.raw.wav 為 atempo 後），舊檔備份到 out/old-<slug>-take/
#   --atempo 整篇加速倍數（只在有 --take 時用；預設 1.0）
#   --ver    成片版本名（預設 v1），輸出 out/<slug>.<ver>.mp4
#   --dry    只跑到 layout-check，跳過渲染與混音（驗證用）
#   --allow-pitch  --take 的音高中位數超出 126–136 Hz 也照做（預設停下；2026/11/24 音高關卡，基準 121.5 Hz，配音請用 tts-pitch-take.sh）
# 全程不送 TTS 請求（跑完比對 tts-requests.json 筆數）。任一步失敗就停，印出是哪一步與 log 路徑。
set -u
SLUG=${1:-}; shift || true
[ -z "$SLUG" ] && { echo "用法：bash scripts/three/make-tech.sh <slug> [--atempo=1.23] [--take=<wav>] [--ver=v1] [--dry]"; exit 2; }
ATEMPO=1.0; TAKE=""; VER=v1; DRY=0; ALLOWPITCH=0
for a in "$@"; do case $a in
  --atempo=*) ATEMPO=${a#*=};; --take=*) TAKE=${a#*=};; --ver=*) VER=${a#*=};; --dry) DRY=1;; --allow-pitch) ALLOWPITCH=1;;
  *) echo "不認得的參數：$a"; exit 2;; esac; done
cd "$(dirname "$0")/../.."
V=videos/$SLUG; PUB=public/audio/$SLUG; LOGD=out/$SLUG-make; mkdir -p "$LOGD" out
[ -f $V/script.json ] || { echo "找不到 $V/script.json"; exit 2; }

STEP=""; LOG=""
fail() { echo "✖ 失敗於「$STEP」，log：$LOG"; [ -f "$LOG" ] && tail -n 15 "$LOG"; exit 1; }
run() { STEP=$1; shift; LOG="$LOGD/$(echo "$STEP" | tr -c 'A-Za-z0-9\n' '_').log"; echo "▶ $STEP"; "$@" >"$LOG" 2>&1 || fail; }
nreq() { python3 -c "import json,os;p='$V/tts-requests.json';print(len(json.load(open(p))) if os.path.exists(p) else 0)"; }
REQ0=$(nreq)

# 1. 換配音
if [ -n "$TAKE" ]; then
  [ -f "$TAKE" ] || { echo "找不到 --take 檔：$TAKE"; exit 2; }
  F0=$(.venv/bin/python -I scripts/voice-measure.py "$TAKE" | python3 -c "import json,sys;print(json.load(sys.stdin)['f0Median'])")
  if python3 -c "import sys;sys.exit(0 if 126<=$F0<=136 else 1)"; then echo "  音高關卡：$TAKE f0Median $F0 Hz（126–136）✔"
  elif [ "$ALLOWPITCH" = 1 ]; then echo "  ⚠️ 音高關卡：$TAKE f0Median $F0 Hz 超出 126–136，--allow-pitch 照做"
  else echo "✖ 音高關卡：$TAKE f0Median $F0 Hz 超出 126–136 Hz（基準 131＝兩奈米）。請用 bash scripts/three/tts-pitch-take.sh $SLUG 重配，或加 --allow-pitch 覆寫"; exit 2; fi
  STEP="1 找正式原始音檔"; LOG="$LOGD/hash.log"
  RAWREL=$(node scripts/tts-take.mjs "$SLUG" --hash 2>"$LOG") || fail
  RAW=public/$RAWREL; ORIG=${RAW%.raw.wav}.raw.orig.wav
  BK=out/old-$SLUG-take; mkdir -p $BK
  for f in "$RAW" "$ORIG"; do [ -f "$f" ] && cp -n "$f" "$BK/$(basename "$f").$(date +%H%M%S)"; done
  mkdir -p "$(dirname "$RAW")"; cp "$TAKE" "$ORIG"   # 新片第一次配音時音檔資料夾還不存在
  run "1 atempo $ATEMPO 轉成 raw.wav" ffmpeg -loglevel error -y -i "$ORIG" -filter:a "atempo=$ATEMPO" -ac 1 -c:a pcm_s16le "$RAW"
  echo "  配音換成 $TAKE（atempo $ATEMPO）→ $RAW；舊檔備份在 $BK/"
fi

# 2. resplit → align → validate → layout-check
run "2a tts-take --resplit" node scripts/tts-take.mjs "$SLUG" --resplit
run "2b align --force" npm run align "$SLUG" -- --force
run "2c validate" npm run validate "$SLUG"
run "2d layout-check" node scripts/three/layout-check.mjs "$SLUG"
grep -E "error|warning" "$LOG" | tail -3

# 片尾音參數（以 storyboard 為準）
read AT FADE DUR <<<$(python3 - "$SLUG" <<'PY'
import json,re,sys
slug=sys.argv[1]; V=f"videos/{slug}/"
sb=json.load(open(V+"storyboard.json")); sc=json.load(open(V+"script.json"))
fps=sb.get("fps",30)
at=None
for s in sc["scenes"]:
    ec=(s.get("props") or {}).get("endCard")
    if ec and ec.get("at"): at=ec["at"]
fr=None
if at is None:  # 2026-11-25 光阻-2：endCard 沒寫 at＝片尾卡從最後一幕（片尾卡那幕）開頭出現
    ecs=[s["id"] for s in sc["scenes"] if (s.get("props") or {}).get("endCard")]
    for s in sb["scenes"]:
        if ecs and s["id"]==ecs[-1]: fr=s["startFrame"]
    if fr is None: sys.exit("找不到片尾卡那幕")
else:
    m=re.fullmatch(r"(\w+):(\w+)([+-]\d+)?",at)
    if not m: sys.exit("endCard.at 格式看不懂："+str(at))
    for s in sb["scenes"]:
        if s["id"]==m.group(1):
            for c in s["cues"]:
                if c["id"]==m.group(2): fr=c["frame"]
    if fr is None: sys.exit("storyboard 找不到 cue "+at)
    fr+=int(m.group(3) or 0)
ve=max(s["voice"]["endFrame"] for s in sb["scenes"] if s.get("voice"))
print(f"{fr/fps:.4f} {ve/fps:.4f} {sb['totalFrames']/fps:.4f}")
PY
) || { echo "✖ 算片尾音參數失敗"; exit 1; }
echo "  片尾音參數：AT=$AT FADE=$FADE DUR=$DUR"

if [ "$DRY" = 1 ]; then
  [ "$(nreq)" = "$REQ0" ] || { echo "✖ tts-requests.json 筆數變了（不該送請求）"; exit 1; }
  echo "✔ --dry：跑到 layout-check 為止；AT=$AT FADE=$FADE DUR=$DUR；TTS 請求筆數 $REQ0 不變"; exit 0
fi

# 3. 渲染
AVAIL=$(df -BG --output=avail / | tail -1 | tr -dc 0-9)
[ "$AVAIL" -lt 2 ] && { STEP="3 磁碟"; LOG="df -h /"; echo "可用 ${AVAIL}GB <2GB"; fail; }
mkdir -p out; : >> out/.render.lock
# 2026-11-24：渲染前清孤兒 Chrome、記負載；渲染記開始／結束與分鐘數；超過 RENDER_WARN_MIN（預設 60 分，平常 23～42 分）印警告與當下前 5 名程序
T0=$(date +%s); echo "渲染開始 $(TZ=Asia/Taipei date +%H:%M)"
( sleep $(( ${RENDER_WARN_MIN:-60} * 60 )); if pgrep -f "scripts/render.mjs $SLUG" >/dev/null; then echo "⚠ 渲染已超過 ${RENDER_WARN_MIN:-60} 分鐘（平常 23～42 分），負載 $(cut -d' ' -f1-3 /proc/loadavg)："; ps -eo pcpu=,pid=,ppid=,args= --sort=-pcpu | head -5 | cut -c1-100; fi ) & WATCH=$!
run "3 渲染（flock out/.render.lock）" flock out/.render.lock bash -c 'bash scripts/three/render-guard.sh && THREE_CONCURRENCY=4 node scripts/render.mjs "$0"' "$SLUG"
kill $WATCH 2>/dev/null; MIN=$(( ($(date +%s)-T0)/60 )); echo "渲染結束 $(TZ=Asia/Taipei date +%H:%M)，共 ${MIN} 分鐘"; head -3 "$LOG"
echo -e "$(TZ=Asia/Taipei date +%F_%H:%M)\t$SLUG\t$VER\t${MIN}" >> out/render-times.tsv
VID=out/$SLUG.video.mp4; [ -f $VID ] || VID=out/$SLUG.mp4

# 4. 片尾音
run "4a 合成招牌音" python3 scripts/three/sfx-logo-tech.py out/$SLUG.sting.wav
run "4b 混音" env G=28 bash scripts/three/mix-endsting.sh $VID out/$SLUG.sting.wav $AT $FADE $DUR out/$SLUG.$VER.wav
OUTMP4=out/$SLUG.$VER.mp4
run "4c mux" ffmpeg -loglevel error -y -i $VID -i out/$SLUG.$VER.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -t $DUR $OUTMP4

# 5. 響度、抽格
lufs() { ffmpeg -nostats -ss ${2:-0} -i "$1" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}'; }
L_ALL=$(ffmpeg -nostats -t $AT -i $OUTMP4 -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
L_END=$(lufs $OUTMP4 $AT)
GRID=out/$SLUG.$VER-grid.jpg
run "5 抽格拼圖" bash -c "rm -rf $LOGD/g && mkdir -p $LOGD/g && ffmpeg -loglevel error -y -i $OUTMP4 -vf 'fps=1/4.5,scale=216:-1' $LOGD/g/%03d.png && N=\$(ls $LOGD/g | wc -l) && ffmpeg -loglevel error -y -i $LOGD/g/%03d.png -vf \"tile=6x\$(( (N+5)/6 ))\" -frames:v 1 -q:v 3 $GRID"
[ "$(nreq)" = "$REQ0" ] || { echo "✖ tts-requests.json 筆數變了（不該送請求）"; exit 1; }
echo "✔ $OUTMP4｜片長 ${DUR}s｜正片 ${L_ALL} LUFS｜片尾 ${L_END} LUFS｜grid $GRID｜TTS 請求 0 次"
