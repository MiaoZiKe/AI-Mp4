#!/bin/bash
# 把一支片在雲端分段渲染（.github/workflows/render-chunks.yml）需要、但不進 git 的素材，一鍵推到素材分支（預設 renders/series2）。
# 用法：bash scripts/three/push-render-assets.sh <slug> [ver]   （ver 預設 v1；BRANCH=renders/series2 可改分支）
# 推上去的東西（全部在素材分支的 assets/<slug>/ 底下，用 git add -f）：
#   audio/          public/audio/<slug>/ 整個資料夾（timeline.json 指到的配音檔，loadScript 會檢查存在）
#   track.wav       混好片尾招牌音的成品音軌 out/<slug>.<ver>.wav（make-tech.sh 第 4b 步產生）；沒有就從 out/<slug>.<ver>.mp4 抽 track.m4a
#   video/          videos/<slug>/ 的 json 快照（timeline／storyboard 常常是本機剛 align 完還沒 commit 的，雲端以快照為準）
#   tex/            model.json 用到的 public/tex/brand/ 貼圖（和本機同一份，畫面才會一致）
#   meta.json       ver、程式碼 commit（雲端 checkout 這個 commit）、總幀數、上傳時間
# 不送 TTS 請求、不碰 out/ 以外的本機檔案、不放任何金鑰。
set -euo pipefail
SLUG=${1:-}; VER=${2:-v1}; BRANCH=${BRANCH:-renders/series2}
[ -z "$SLUG" ] && { echo "用法：bash scripts/three/push-render-assets.sh <slug> [ver]"; exit 2; }
cd "$(dirname "$0")/../.."
ROOT=$(pwd); V=videos/$SLUG; A=public/audio/$SLUG
[ -f $V/storyboard.json ] || { echo "✖ 找不到 $V/storyboard.json"; exit 2; }
[ -d $A ] || { echo "✖ 找不到 $A/（先配音）"; exit 2; }
TRACK=out/$SLUG.$VER.wav; MP4=out/$SLUG.$VER.mp4
if [ ! -f "$TRACK" ] && [ ! -f "$MP4" ]; then echo "✖ 找不到成品音軌 $TRACK（也沒有 $MP4 可抽）"; exit 2; fi

# 程式碼 commit：src/ 與 scripts/ 有沒 commit 的改動就停（雲端拿不到）；HEAD 必須已經在遠端
if [ -n "$(git status --porcelain -- src scripts package.json package-lock.json | grep -v '^??' || true)" ]; then
  echo "✖ src/ 或 scripts/ 有還沒 commit 的改動，雲端會渲成舊版；先 commit＋push"; git status --short -- src scripts; exit 1; fi
SRC=$(git rev-parse HEAD)
git fetch -q origin
git branch -r --contains "$SRC" | grep -q . || { echo "✖ $SRC 還沒推到遠端；先 git push"; exit 1; }
N=$(python3 -c "import json;print(json.load(open('$V/storyboard.json'))['totalFrames'])")

WT=$ROOT/out/.assets-wt
git worktree remove --force "$WT" 2>/dev/null || rm -rf "$WT"; git worktree prune
if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null; then
  git fetch -q origin "$BRANCH:refs/remotes/origin/$BRANCH"
  git worktree add -q --detach "$WT" "origin/$BRANCH"
else
  git worktree add -q --detach "$WT" HEAD
  (cd "$WT" && git checkout -q --orphan tmp-assets && git rm -rqf . && printf '# %s\n雲端分段渲染的素材（assets/<slug>/）與成品（renders/）。由 scripts/three/push-render-assets.sh 與 render-chunks.yml 維護。\n' "$BRANCH" > README.md && git add README.md)
fi
trap 'cd "$ROOT"; git worktree remove --force "$WT" 2>/dev/null || true' EXIT
D=$WT/assets/$SLUG; rm -rf "$D"; mkdir -p "$D/audio" "$D/video" "$D/tex"
cp -r $A/. "$D/audio/"
cp $V/*.json "$D/video/"
if [ -f "$TRACK" ]; then cp "$TRACK" "$D/track.wav"; TN=track.wav
else ffmpeg -loglevel error -y -i "$MP4" -vn -c:a copy "$D/track.m4a"; TN=track.m4a; fi
# 貼圖：model.json 用到的 tex/... 一張張複製（缺圖就停，雲端渲出來會少東西）
if [ -f $V/model.json ]; then
  for t in $(grep -o '"tex/[^"]*"' $V/model.json | tr -d '"' | sort -u); do
    [ -f public/$t ] || { echo "✖ model.json 用到 public/$t 但本機沒有（先跑 python3 $V/genmodel.py）"; exit 1; }
    mkdir -p "$D/$(dirname "$t")"; cp public/$t "$D/$t"
  done
  [ -f public/tex/brand/meta.json ] && mkdir -p "$D/tex/brand" && cp public/tex/brand/meta.json "$D/tex/brand/"
fi
LDUR=$( [ -f "$MP4" ] && ffprobe -v error -show_entries format=duration -of csv=p=0 "$MP4" || echo "")
cat > "$D/meta.json" <<EOF
{"slug":"$SLUG","ver":"$VER","src":"$SRC","totalFrames":$N,"track":"$TN","localDuration":"$LDUR","uploaded":"$(TZ=Asia/Taipei date '+%F %H:%M')"}
EOF
cd "$WT"
git add -f -A "assets/$SLUG" README.md 2>/dev/null || git add -f -A "assets/$SLUG"
if git diff --cached --quiet; then echo "（素材沒有變，不用推）"; exit 0; fi
git -c user.name="$(git -C "$ROOT" config user.name)" -c user.email="$(git -C "$ROOT" config user.email)" commit -q -m "素材：$SLUG $VER（程式碼 ${SRC:0:7}、$N 幀）

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018gakVSXeR33SqgpaRXvXkS"
for i in 1 2 3; do
  git -c push.negotiate=true push -q origin "HEAD:refs/heads/$BRANCH" && break
  echo "推送失敗，重抓後再試（$i）"; git fetch -q origin "$BRANCH" && git rebase -q FETCH_HEAD; sleep 3
done
echo "✔ 已推 assets/$SLUG/ 到 $BRANCH（$(du -sh "$D" | cut -f1)，程式碼 ${SRC:0:7}，$N 幀，音軌 $TN）"
echo "  觸發：Actions → render-chunks → slug=$SLUG ver=$VER asset_branch=$BRANCH"
