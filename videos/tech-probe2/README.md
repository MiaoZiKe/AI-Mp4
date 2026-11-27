# tech-probe2：探針卡-2 誰在做（系列 2 第 22 集收尾；前一集 2-21 探針卡-1；下一個系列 3 第一集「晶圓切割與薄化」）
- 狀態（2026/11/27 台北）：無聲完整版（子聊天室製作），未配音、未渲染整片。12/24 發，留言關鍵字「探針卡廠」。
- 產生：`python3 videos/tech-probe2/genscript.py`（自動先跑 gen-model.mjs）→ `node scripts/three/silent-timeline.mjs tech-probe2` → 再跑一次 genscript。配音後：align 產生新 timeline.json，再跑 genscript（cue 都綁在念稿字上）。
- 9 幕＋片尾卡；念稿 238 字（script.md 一字未改；字幕寫「旺矽」，念稿 tts 寫「旺細」）；無聲估 72.2 秒（每幕 6.6～9.4 秒，≤10）。
- 2D 卡：`src/components/three/HudProbe2.tsx`（9 張，kind `probe2-*`）；Hud.tsx 只加 import 與一行登記。
- 規格對照：visual-spec.md（站點、模組 13 項的做法、爆炸 8 步與製作順序、運作動畫、比喻）；素材來源：assets.md（LOGO 三類來源都抓不到 → 文字名牌）。

## 檢查（無聲版）
validate 0 error、layout-check 0 error、card-overlap 0 error、kinematics-check 0 error、flow-check 0 error、precheck（含幕界抽幀）0 error 0 warning。結果數字以回報當下重跑為準。

## 已知限制
- 公司 LOGO：Commons 查無；FormFactor、旺矽、精測官網與維基百科在本環境被網路代理擋下（403）。要換官方 LOGO 需頻道負責人放原檔並在 Brand.tsx 登記。
- physics-spec 模組 3、4（MEMS 針與電鍍製針）沒做：念稿沒講 MEMS；模組 12 的出貨箭頭沒做：念稿沒講出貨。
- 「旺矽在新竹」「FormFactor 在加州 Livermore」研究稿標「既有知識待核」；畫面寫「旺矽（新竹）」、FormFactor 只寫「美國探針卡廠」。
- 配音後 s6「保養」「更換」兩字相隔很近，清針與換針都放在念完後的留白（holdSec 3.1）；配音後若留白變短，要把換針動作提前或縮短。
