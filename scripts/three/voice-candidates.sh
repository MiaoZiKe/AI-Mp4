#!/bin/bash
# 配音導演：一次產 N 份試聽候選 → 自動量音高／起伏／語速／捲舌 → 和兩奈米比相似分數 → 過關卡 → 排序，
# 前 2 名「合格的」才輸出 m4a 給 Andy 挑（docs/voice-director.md，2026-11-27）。
#
# 用法：bash scripts/three/voice-candidates.sh <slug> <upto幕id> <N> [選項]
#   --line=current|2nm   說明句：current＝現行 TECH_B_LINE（11-27 Andy 定案＝confident-3「聲音明亮、有精神…語速偏快、節奏緊湊」，預設）
#                                2nm＝兩奈米原句「說明 B」（docs/prompts/tech-2nm-親和專業試聽.txt；只留作對照）
#                        （confident-1／2 已作廢：Andy「比原本聲音更低，語速更慢」，不提供）
#   --mode=prefix|parts  送法：prefix＝說明句＋換行＋念稿接成一段（＝正式整篇配音的送法，預設）
#                              parts＝說明句與念稿拆成兩個 part（比較接近 AI Studio 的 Style 欄位）
#   --seed=N             每份都用同一個 TTS_SEED（測「固定 seed 是否幾乎一樣」）
#   --seeds=a,b,c        每份各用一個 seed（份數不足時沿用最後一個）
#   --temp=0.5           TTS_TEMPERATURE（不寫＝模型預設）
#   --max-req=4          這次最多送幾次請求（N 超過就截掉；預設 4）
#   --send               真的送請求。不加＝只印計畫＋把這支已有的候選重新評分（不花額度）
#   --import=a.json,b.json  把別處 tts-take 試聽的 audition.json 也拿進來一起評分（不送請求）
#   --top=2              輸出前幾名合格的 m4a
#   --andy=<wav>         Andy 自己在 AI Studio 配的那份（念稿要和這支前幾幕相同），一起量、列為基準
#   --target=2nm|andy    相似分數的目標：2nm＝兩奈米鎖定值（預設）；andy＝改用 --andy 那份的實測五個數字
# 輸出：out/voice-cand/<slug>/report.md、report.json、wav/<候選>.wav、第1名-<候選>.m4a、第2名-<候選>.m4a
# 規矩：不移調、不加速（量的是原始錄音）；不合格（f0 不在 126–136、IQR<55、含停頓<4.4 字/秒、對齊信心<0.5）的不輸出、不給 Andy 聽。
# 權重與關卡寫在 scripts/three/voice-cand-score.py 檔頭（f0 30／IQR 25／含停頓 20／純說話 15／捲舌 10）。
set -u
SLUG=${1:-}; UPTO=${2:-}; N=${3:-}
[ -z "$SLUG" ] || [ -z "$UPTO" ] || [ -z "$N" ] && { sed -n 4,22p "$0"; exit 2; }
shift 3
LINE=current; MODE=prefix; SEED=""; SEEDS=""; TEMP=""; MAXREQ=4; SEND=0; IMPORT=""; TOP=2; ANDY=""; TARGET=2nm
for a in "$@"; do case $a in
  --line=*) LINE=${a#*=};; --mode=*) MODE=${a#*=};; --seed=*) SEED=${a#*=};; --seeds=*) SEEDS=${a#*=};;
  --temp=*) TEMP=${a#*=};; --max-req=*) MAXREQ=${a#*=};; --send) SEND=1;; --import=*) IMPORT=${a#*=};; --top=*) TOP=${a#*=};; --andy=*) ANDY=${a#*=};; --target=*) TARGET=${a#*=};;
  *) echo "不認得的參數：$a"; exit 2;; esac; done
case $LINE in current|2nm) ;; *) echo "--line 只能 current|2nm"; exit 2;; esac
case $MODE in prefix|parts) ;; *) echo "--mode 只能 prefix|parts"; exit 2;; esac
case $TARGET in 2nm|andy) ;; *) echo "--target 只能 2nm|andy"; exit 2;; esac
[ "$TARGET" = andy ] && [ -z "$ANDY" ] && { echo "--target=andy 要同時給 --andy=<wav>"; exit 2; }
[ -n "$ANDY" ] && [ ! -f "$ANDY" ] && { echo "找不到 --andy 的檔：$ANDY"; exit 2; }
cd "$(dirname "$0")/../.."
V=videos/$SLUG; [ -f "$V/script.json" ] || { echo "找不到 $V/script.json"; exit 2; }
OUT=out/voice-cand/$SLUG; WAV=$OUT/wav; mkdir -p "$WAV" out/voice-cand/_ref
META=$OUT/cand-meta.json; [ -f "$META" ] || echo '{}' > "$META"

# 兩奈米原句（說明 B）——來源 docs/prompts/tech-2nm-親和專業試聽.txt 第 11 行，Andy 11/15 在 AI Studio 錄兩奈米用的
LINE_2NM="用台灣人平常講話的口音，不特別捲舌、不兒化，語氣溫和親切，像在跟一個好奇的朋友解說，問句自然上揚，講到答案時肯定一點，語速稍快、不拖尾音，直接說："
if [ "$LINE" = 2nm ]; then STYLE_LINE=$LINE_2NM; else STYLE_LINE=$(node -e 'import("./scripts/voice-profile.mjs").then(m=>process.stdout.write(m.TECH_B_LINE))'); fi
[ -n "$STYLE_LINE" ] || { echo "讀不到說明句"; exit 1; }

# 這個組合的念稿副本（只給試聽用，不動 videos/<slug>/script.json）
VS=$OUT/script-$LINE-$MODE.json
node -e '
const fs=require("fs");const [src,dst,line,mode]=process.argv.slice(1);
const s=JSON.parse(fs.readFileSync(src,"utf8"));s.voice={...(s.voice||{}),styleText:line,styleMode:mode};
fs.writeFileSync(dst,JSON.stringify(s,null,1));' "$V/script.json" "$VS" "$STYLE_LINE" "$MODE"

echo "── 配音導演：$SLUG 到 $UPTO，候選 $N 份（說明句 $LINE、送法 $MODE、seed ${SEED:-${SEEDS:-隨機}}、temperature ${TEMP:-預設}）"
python3 scripts/three/tts-budget.py || true
REQ=$N; [ "$REQ" -gt "$MAXREQ" ] && { echo "⚠ N=$N 超過 --max-req=$MAXREQ，只送 $MAXREQ 次"; REQ=$MAXREQ; }

if [ $SEND = 1 ]; then
  IFS=, read -r -a SL <<< "${SEEDS}"
  STAMP=$(TZ=Asia/Taipei date +%m%d%H%M)
  for i in $(seq 1 "$REQ"); do
    S=$SEED; if [ ${#SL[@]} -gt 0 ]; then k=$((i-1)); [ $k -ge ${#SL[@]} ] && k=$((${#SL[@]}-1)); S=${SL[$k]}; fi
    ID="$LINE-$MODE-s${S:-r}-t${TEMP:-d}-$STAMP-$i"
    echo "▶ 候選 $i/$REQ：$ID（1 次請求）$(TZ=Asia/Taipei date '+%H:%M:%S')"
    if ! env ${S:+TTS_SEED=$S} ${TEMP:+TTS_TEMPERATURE=$TEMP} TTS_NO_RETRY=1 NODE_USE_ENV_PROXY=1 \
         flock out/.tts.lock node scripts/tts-take.mjs "$SLUG" --audition="$ID" --upto="$UPTO" --script="$VS" --out="$WAV" > "$OUT/$ID.log" 2>&1; then
      tail -3 "$OUT/$ID.log"; echo "✖ 請求失敗，停止（不重試、不換帳號）"; break
    fi
    python3 - "$META" "$ID" "$LINE" "$MODE" "${S:-}" "${TEMP:-}" <<'PY'
import json,sys
p,i,l,m,s,t=sys.argv[1:7];d=json.load(open(p))
d[i]={"說明句":l,"送法":m,"seed":s or "隨機","temperature":t or "預設"};json.dump(d,open(p,"w"),ensure_ascii=False,indent=1)
PY
  done
else
  echo "（沒加 --send：不送請求。會送的全文如下，接著只把已有的候選重新評分）"
  printf '%s\n' "$STYLE_LINE" | sed 's/^/  說明句：/'
  echo "  送法：$MODE；念稿＝$V/script.json 第一幕到 $UPTO（念稿版 tts 優先）"
fi

# 兩奈米基準音軌（成片 0–49.5 秒＝旁白結束前；有 BGM，但低通 900Hz，不影響 f0 與擦音量測）
REF=out/voice-cand/_ref/2nm.wav
SRC2NM=../tw-rotation/social/tc/queue/20261115_2nm/tech-2nm.mp4
[ -f "$REF" ] || { [ -f "$SRC2NM" ] && ffmpeg -v error -y -i "$SRC2NM" -t 49.5 -vn -ac 1 -ar 24000 -c:a pcm_s16le "$REF"; }

JOBS=$OUT/jobs.json
# --andy：不是 wav 就先轉成 24k 單聲道 wav（m4a／mp3 都可以）
ANDYWAV=""
if [ -n "$ANDY" ]; then ANDYWAV=$OUT/andy-$(basename "${ANDY%.*}").wav; ffmpeg -v error -y -i "$ANDY" -vn -ac 1 -ar 24000 -c:a pcm_s16le "$ANDYWAV" || exit 1; fi
python3 - "$JOBS" "$WAV/audition.json" "$META" "$REF" "$IMPORT" "$ANDYWAV" "$TARGET" "$V/script.json" "$UPTO" <<'PY'
import json,os,sys
jobs_p,aud,meta_p,ref,imp,andy,target,sp,upto=sys.argv[1:10]
meta=json.load(open(meta_p)) if os.path.exists(meta_p) else {}
jobs=[]
if os.path.exists(ref):
    s=json.load(open("videos/tech-2nm/script.json"))
    txt="\n\n".join(x["narration"].strip() for x in s["scenes"] if x.get("narration","").strip())
    jobs.append({"id":"兩奈米","file":ref,"text":txt,"ref":True,"meta":{"來源":"tech-2nm.mp4 0–49.5s"}})
if andy:
    sc=[x for x in json.load(open(sp))["scenes"] if (x.get("tts") or x.get("narration") or "").strip()]
    k=next(i for i,x in enumerate(sc) if x["id"]==upto)
    # 與 tts-take 同規則：同 para 接同一行，換 para 空一行
    t="";prev=None
    for i,x in enumerate(sc[:k+1]):
        p=x.get("para",i); t+=("" if i==0 else ("" if p==prev else "\n\n"))+(x.get("tts") or x["narration"]).strip(); prev=p
    jobs.append({"id":"Andy網站配","file":andy,"text":t,"ref":True,"target":target=="andy","meta":{"來源":os.path.basename(andy)}})
srcs=[aud]+[x for x in imp.split(",") if x]
for a in srcs:
    if not os.path.exists(a): continue
    d=json.load(open(a)); tag=os.path.basename(os.path.dirname(os.path.abspath(a)))
    for k,r in d.get("rows",{}).items():
        f=r["file"]
        if not os.path.exists(f): continue
        st=r.get("style") or ""
        m=meta.get(k) or {"來源":tag,"說明句":("沉穩專業" if "沉穩專業" in st else "溫和親切(2nm 說明B)" if "溫和親切" in st else st[:12]),"送法":("parts" if "\u0001parts" in st else "prefix")}
        jobs.append({"id":k if a==aud else f"{tag.replace('voice-audition-','')}/{k}","file":f,"text":r["text"],"meta":m})
json.dump(jobs,open(jobs_p,"w"),ensure_ascii=False,indent=1)
print(f"評分 {len(jobs)} 份（含基準）")
PY
.venv/bin/python -I scripts/three/voice-cand-score.py "$JOBS" "$OUT" --top "$TOP" --title "配音導演候選：$SLUG（到 $UPTO）"
echo "→ $OUT/report.md"
