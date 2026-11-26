# tech-kla：設備五大-5：KLA（量測檢測）（科技透明圈 系列「代工的供應商」第 11 集；上一集設備五大-4：東京威力科創；下一集 12/14：台灣自己的設備廠）
- 狀態（2026/11/26 台北）：前段完成（研究、腳本、建模、12 張 2D 卡、無聲時間軸）。**未配音、未渲染**。12/13（日）18:00 發，留言關鍵字「KLA」。
- 產生：`python3 videos/tech-kla/genscript.py`（自動先跑 gen-model.mjs）→ model.json＋script.json。無聲時間軸：`node scripts/three/silent-timeline.mjs tech-kla` 後再跑一次 genscript。2D 卡：`src/components/three/HudKla.tsx`（kla-*）。
- **要掛上才能渲染**（本 agent 依指示沒改 Hud.tsx、Brand.tsx）：
  - Hud.tsx：`import { KlaSection } from "./HudKla";`＋分派 `if (String((o as any).kind ?? "").startsWith("kla-")) return <KlaSection o={o} f={f} k={k} m={m} s={s} />;`
  - Brand.tsx LOGOS：`kla: { file: "logos/kla.png", w: 960, h: 214, name: "KLA 科磊", source: "https://commons.wikimedia.org/wiki/File:KLA_Corp._logo.svg" },`
  - 3D 貼圖：`node scripts/three/make-brand-tex.mjs tech-kla flag:US logo:kla`（掛上 Brand 之後跑）
- 12 幕＋片尾卡；念稿 312 字；無聲估 80 秒（含片尾 3.2 秒）。偏長：配音後照第 13 條 atempo（上限 1.12）會落在約 72 秒；若要再短，先砍 s3（9.8 秒，搬運動作）。
- 開場：s1「上一集圖案做好了，有沒有做壞？」（問號約第 2.9 秒）；kicker「接上集：圖案做好了」、標題「有沒有做壞？」。結尾：「檢查做完了，下一集看台灣自己的設備廠。」
- 光罩補充（CEO 11/26）：s8 加一句「光罩也要這樣檢查。」＋卡片下排「光罩也要查：極紫外光光罩｜日本國旗＋Lasertec 名牌｜專門檢測・媒體報導」，不寫數字、不另做 3D。
- 檢查（在記憶體掛上 Hud／Brand 的工作樹跑）：validate 0 error（184 warning，多為長 until 離 cue 遠）、layout-check 0 error、card-overlap 0／0、flow-check 0、關節鏈 0（1112 幀）。主工作樹不掛會有 Hud／Brand 未掛的 error。
- 抽格：`out/tech-kla/keyframes.png`（20 格，原尺寸單張在 `out/tech-kla/kf/`）、`out/tech-kla/explode.png`（6 格爆炸分解）。
- 已知：①量測站在 s9 前才淡入（同一位置），s10 只留晶圓台與兩支臂；②s3 推近時前端搬運區外殼與主機面板直接隱藏（不留半透明殘影）；③手臂是單刀 SCARA（型式示意，標籤寫明）；④光譜色條、速度梯形、膜厚曲線全標「示意」；⑤沒有獨立審片評分（本 agent 是製作者）。

## Andy 修正清單自查（docs/channels/tech-andy-fixes.md 第 1～17 條；第 18 條另列）
| # | 規則 | 結果 |
|---|---|---|
| 1 | 音色一致 | 不適用（未配音）；voice 照應材（Iapetus＋tech-b），配音走 tts-pitch-take.sh |
| 2 | 替身字 | 符合：「上一集」；s8「光罩」念稿自動換「光照」；KLA 念稿「K L A」；genscript 對 tts-subst 全表檢查 0 問題 |
| 3 | ASR 差異不自己放行 | 不適用（未配音） |
| 4 | 國旗＋官方 LOGO | 符合：KLA 用 Commons 原檔（3D 廠牌＋2D 卡＋標籤）、美國國旗；Lasertec 抓不到原檔 → 文字名牌＋日本國旗（記 assets.md） |
| 5 | 動畫不簡陋 | 符合（待審）：20 個模組、每 2–4 秒一個跟 cue 的事件 |
| 6 | 獨立審片 | **未做**：要由沒參與製作的審片人審 |
| 7 | 只補需要的段落 | 不適用（新片） |
| 8 | 每支評分 | **未達**：同第 6 條 |
| 9 | 渲染好先給 Andy | 不適用（本次不渲染整支） |
| 10 | 接上集＋3 秒問句 | 符合：問號約 2.9 秒；validate 開場銜接／鉤子 0 error |
| 11 | 地圖真實輪廓 | 符合：台灣 27 點經緯度輪廓，竹北、桃園、台南照經緯度 |
| 12 | 配音額度 | 不適用 |
| 13 | 節奏 | 符合：每幕 4.6–9.8 秒＋0.6 秒停頓；每個運鏡停住 ≥2 秒；標籤每張 ≥45 幀、一次一張（s3 換片時改成依手臂動作排） |
| 14 | 捲舌音 | 不適用（未配音） |
| 15 | 物理 | 符合：光錐收斂、斜射＋鏡面反射進擋板、散射往外變淡；手臂／門／吸盤／晶圓台／轉盤緩入緩出、無瞬移（換片是同位置） |
| 16 | 機台擬真＋爆炸分解 | 符合：visual-spec 20 項；s2 爆炸分解 4 張標籤、組回停住才移鏡 |
| 17 | 專業度 ≥8 | 待評：先照 amat／lam 審查扣分點避開（現象都在 3D 主畫面、推鏡停 ≥2 秒、flow 0、前端模組不透明、不需要的模組直接隱藏） |
| 18 | 念稿與字幕不用術語縮寫 | 符合：負載鎖／FOUP／EFEM／SCARA／TDI 只在標籤；genscript BANNED 檢查 0 |
