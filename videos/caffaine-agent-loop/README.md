# caffaine-agent-loop：聊天 AI 只會回答，AI 代理會自己看、做、檢查（CaffAIne 線 B 第一支，無聲動畫版）

- 引擎：`stage: "iso"` ＋ `isoVersion: 4`（`src/components/ai-iso/IsoAgent.tsx`）；片尾卡 `props.panel: "caffend"`（C 款白卡杯動畫，`CaffAnim.tsx`，時間表 `caffaineTimeline.json`）；頂層 `channelLogo: "caffaine"`＝左上角 C 款小 LOGO。
- 內容與出處：`research.md`（Claude Academy《Claude Code 101》官方課程頁快照）。畫面全是示意，沒有真實商標與介面。
- 無聲版時間軸：`node scripts/ui/silent-timeline.mjs caffaine-agent-loop --force`（之後旁白照字幕念，配音後 align 會整份覆蓋，畫面全部跟 cue）。
- 渲染：`npm run render caffaine-agent-loop` → `out/caffaine-agent-loop.mp4`（無聲）；片尾招牌音疊上去：`python3 scripts/caffaine/mix-endsting.py <招牌音.wav> <輸出.wav> --src <原音軌> --at <片尾卡開始秒> --dur <總長秒>`。
- 版面檢查（量真實 DOM）：`node scripts/caffaine/ov-check.mjs caffaine-agent-loop 6 825`；片尾卡：`node scripts/caffaine/layout-check.mjs`。
- script.json 的 props：每鏡 `camera`（look／zoom／sy／dur）、`comet`（彗星在軌道上的目標位置，大於 1＝繞第幾圈，`{ at: cue, to, dur }`）、`kw`（關鍵詞顏色）。
