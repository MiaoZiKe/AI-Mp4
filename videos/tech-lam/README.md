# tech-lam：設備五大-3：科林研發（蝕刻）（科技透明圈 系列「代工的供應商」第 9 集；上一集設備五大-2：應用材料；下一集設備五大-4：東京威力科創）
- 狀態（2026/11/26 05:40 台北）：前段完成（研究、腳本、建模、12 張 2D 卡、無聲時間軸、關鍵幀）。**未配音、未渲染**。12/11（五）18:00 發，留言關鍵字「科林」。
- **⚠ 待決定：`src/components/three/Hud.tsx` 還沒接上 `HudLam.tsx`**（本次限制「不改共用 Hud 檔」，自動權限也擋下）。要加的只有兩行（同每一集的做法）：
  `import { LamSection } from "./HudLam";`，以及 HudSection 裡 `if (String((o as any).kind ?? "").startsWith("lam-")) return <LamSection o={o} f={f} k={k} m={m} s={s} />;`。
  沒接上之前，成片的 2D 卡會是空白預設卡，validate 會報 12 筆「示意卡［標題壓圖］」（全部來自預設卡，非 HudLam）。關鍵幀與 card-overlap 是在打包時於記憶體注入這兩行驗的（原檔未動）。
- 產生：`python3 videos/tech-lam/genscript.py`（自動先跑 gen-model.mjs）→ model.json＋script.json；無聲時間軸 `node scripts/three/silent-timeline.mjs tech-lam`。配音後：tts-pitch-take → align --force → 重跑 genscript.py → validate。
- 12 幕＋片尾卡；念稿 295 字；無聲估計 72.3 秒（每幕 4.6–8.3 秒＋換幕停頓 0.6 秒）。
- 開場接上集：s1「上集說把多的刻掉，怎麼刻？」（問號約第 2.5 秒）；kicker「接上集：把多的刻掉」、標題「怎麼刻掉多的？」。結尾：「刻之前，光阻得先塗好、顯影好，下一集看東京威力科創」（下一集開頭可接「誰在塗光阻」，避開蝕刻）。
- 模組 21 項（visual-spec.md 第一節）；爆炸分解 s3（線圈／介電窗／靜電吸盤／邊緣環四張標籤、拆機順序錯開、組回停住才移鏡）；3D 主畫面看得到的現象：電漿輝光（ICP 青藍、CCP 粉紫，閃動）、線圈發光、氣體注入錐、離子垂直加速、自由基亂飛、產物經節流閥→渦輪泵→前級管抽走（轉子起停有加減速）、剖面模型記憶孔 12 節變深（越深越慢、孔壁保護膜、離子到孔底越來越少）、低溫吸盤冷氣下沉、ALE 三圈四步。
- 檢查（2026/11/26）：layout-check 0 error（5 warning：主素材邊緣、IG 底部出處列）；card-overlap（注入版）0 error、0 warning；flow-check 0 error；關節鏈 0 error；validate 除上述 12 筆預設卡外 0 error。
- 關鍵幀（全解析度 1080×1920）：`out/tech-lam/keyframes.png`（17 格；單張在 out/tech-lam/kf/）；爆炸分解：`out/tech-lam/explode.png`（6 格）。
- 尚未做：獨立審片人與 mechanical-engineer 評分（第 6、8、17 條，製作者不能自評）；配音。

## Andy 修正清單自查（docs/channels/tech-andy-fixes.md 第 1～17 條）
| # | 規則 | 結果 |
|---|---|---|
| 1 | 音色一致 | 不適用（未配音）；voice 照應材（Iapetus＋tech-b），配音走 tts-pitch-take.sh |
| 2 | 易念錯字替身字 | 符合：genscript 套用 tts-subst.json 全表，「上集」→「上一集」；檢查 0 問題 |
| 3 | ASR 差異不自己放行 | 不適用（未配音） |
| 4 | 國旗＋官方 LOGO | 符合：科林 LOGO 用 Commons 原檔（3D 廠牌、標籤、2D 卡）＋美國國旗；下一集卡東京威力 LOGO＋日本國旗；台灣國旗 |
| 5 | 動畫不簡陋 | 符合（待審片人評）：21 個模組、每 2–4 秒有跟 cue 的事件 |
| 6 | 獨立審片 | **未達**：需另派審片人 |
| 7 | 只補需要優化的段落 | 不適用（新片） |
| 8 | 每支評分 | **未達**：同第 6 條 |
| 9 | 渲染好先給 Andy | 不適用（未渲染） |
| 10 | 接上集＋3 秒問句 | 符合：validate 開場銜接／鉤子 0 error |
| 11 | 地圖真實輪廓 | 符合：lam-co 台灣 27 點經緯度輪廓，新竹、台中、台南、高雄照經緯度 |
| 12 | 配音額度判斷 | 不適用 |
| 13 | 節奏 | 符合：每幕 ≥4.6 秒＋0.6 秒停頓、12 幕；標籤一次一張且 ≥45 幀；鏡頭停住 ≥2 秒（換景移到幕間停頓） |
| 14 | 捲舌音 | 不適用（未配音） |
| 15 | 物理 | 符合：離子 accel、自由基亂飄、產物沿抽氣路徑、轉子 rampSpin、冷氣下沉、手臂與閘閥緩入緩出、無瞬移；剖面孔深度越來越慢 |
| 16 | 機台擬真＋爆炸分解 | 符合：visual-spec 21 項；s3 爆炸分解；EFEM 正常高度不透明面板、FOUP 貼緊載入埠、腔底裙板與支撐樑（避開應材審查扣分點） |
| 17 | 設備片爆炸分解、專業度 ≥8 | 部分：physics-spec 照做；**分數待 mechanical-engineer 與審片人打** |
