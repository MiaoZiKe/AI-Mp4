# CaffAIne 片尾卡測試片

只有片尾卡（3.33 秒、無旁白）。畫面 `src/components/ai-iso/CaffEnd.tsx`（位置與框 `caffaineEnd.ts`、時間表 `caffaineTimeline.json`），招牌音 `scripts/caffaine/sfx-caffaine.py`，響度 `mix-endsting.py`。
重做：`bash scripts/caffaine/build-endcard-test.sh` → `out/caffaine-endcard-test.final.mp4`、`out/caffaine-endsting.mp3`；版面檢查 `node scripts/caffaine/layout-check.mjs`。

## 給任何一支 CaffAIne 影片用
- script.json 頂層加 `"channelLogo": "caffaine"`（左上角放 LOGO，每幕同位置同大小）。
- 最後一幕：`{ "id": "sXX", "silent": true, "durationSec": 3.34, "component": "IsoScene", "props": { "panel": "caffend", "keyword": "關鍵字" }, ... }`。
- 混音：`python3 scripts/caffaine/mix-endsting.py <招牌音.wav> <輸出.wav> --src <原音軌> --at <片尾卡開始秒數> --dur <總長秒>`（招牌音先跑 sfx-caffaine.py）。
