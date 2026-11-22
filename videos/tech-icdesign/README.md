# tech-icdesign：IC 設計（科技透明圈 第 10 支，11/23（一）20:00）

## 做到哪（2026/11/18）
- v1：`out/tech-icdesign.v1.mp4`（61.9 秒；格子圖 `out/tech-icdesign.v1-grid.jpg`、逐句對照拼圖 `out/tech-icdesign-sync.jpg`、近景 `out/tech-icdesign.v1-closeup-metal.png`／`-closeup-mask.png`）。
- 配音：Iapetus＋tech-b，整篇 1 次請求（`out/voice-icdesign/icdesign-a.wav`，65.69 秒；音高中位數 118.8 Hz，在 110–125 內）；念稿 253 字（不含標點）；原始含停頓 3.85 字/秒，atempo 1.12（已到上限）→ 成片含停頓 4.31 字/秒、純說話 4.77 字/秒；沒有再送 TTS（tts-requests.json 1 筆）。
- 對照 mp3：`out/IC設計配音比對_曝光機_IC設計.mp3`（曝光機 12 秒＋嗶＋本片 12 秒）。
- 檢查：validate 0 error、layout-check 0 error（頂端空白 0px、底端空白 46px）、kinematics 0 error；重疊檢查：程式 1858 幀 0 筆。
- 產生程式：`genmodel.py`、`genscript.py`（改程式再重產 model.json、script.json）；2D 縮放圖與對照卡 `src/components/three/HudIc.tsx`（Hud.tsx、HudArt.tsx 各加一行轉接，舊片不受影響）。
- 站別：S x=0 電晶體＋五層金屬（爆炸剖析、訊號流動）｜D x=150 設計流程｜M x=300 光罩曝光｜Z x=450 整顆晶片＋設計電腦（站距 150，遠景看不到隔壁站）。

## 運作動畫
A 訊號沿 M5→M1 穿過各層到閘極、再從汲極流出（3D 光點＋2D 側面剖面 `ic-sec` 同 cue）｜B 設計流程五步驟落下、資料光點流過、模擬游標掃過方波、繞線長出（`ic-flow`）｜C 光穿過光罩、鏡組縮小、印上晶圓（`ic-mask` 4 倍 vs 1 倍對照）。

## 已知限制
- 語速：原始 3.85 字/秒偏慢，atempo 上限 1.12 後含停頓 4.31，沒到 4.7 目標；要到 4.7 需要重配音（先回報 CEO，不自己送）。
- 金屬層畫 5 層（標示「示意 5 層・實際 10～15 層」）；層數出處是技術文章，不是廠商公布。
- s8 字幕的「創意電子・世芯」用中點，避免字幕引擎在「、」切開後把世芯和下一段合併。
- 公司引線：創意、世芯→晶片本體、力旺→記憶體區塊、晶心科→CPU 區塊、三大 EDA→設計電腦螢幕，是「性質對應」的示意，不是各公司真實的晶片位置；來源皆為媒體報導（見 research.md）。
- 設計電腦、曝光機是示意造型，不仿特定機型；光源顏色是示意。
- 人耳未確認；捲舌指標未量。

## v2（2026/11/18，依 CEO 退回意見）
`out/tech-icdesign.v2.mp4`，同一份音軌與時間軸（沒送 TTS）。改：查證日改 2026/11/18（畫面、research、說明檔）；s6 步驟標籤一次只留一個；s8 念到「設計服務」就出卡片第一列與引線；s9「設計公司」方塊不再淡化；s1 大標縮小上移、取消漂移不壓主素材。

## 11/22 重配（「矽」念錯，Andy 11/22 18:45 同意重配）
- 根因：舊念稿 s8 漏改，直接送「矽智財」，被念成 guì。改成念稿寫「細智財」（「細」兩岸都念第四聲 xì；寫「夕」會被念成一聲 xī），字幕維持「矽」。genscript.py 的 scene() 自動把 tts 的「矽」換成「細」。⚠ script.json 有 11/22 第 4 道修正（s4／s7 鏡頭、s8 卡片提早）沒回寫 genscript.py，這次只直接改 script.json 的 s8 tts，不要重跑 genscript 蓋掉。
- 配音：旁白金手指（2.5＋Iapetus＋tech-b），TTS 請求 1 次（`.take-a33eed9084`，原始 61.93 秒，備份 `.raw.orig.wav`）。原始音高中位數 107.4 Hz（金手指原始 113.7，−5.5%）、純說話 4.90 字/秒；整篇 atempo 1.1735 → 純說話 5.70、含停頓 4.75。`--resplit`＋`ALIGN_PROVIDER=fa align --force`，整篇信心 0.94；時間軸 57.2 秒（1716 幀）。
- 片尾音：`G=22 mix-endsting.sh voice.wav out/tech-icdesign.sting.wav 52.8 54.0667 57.2 out/tech-icdesign.revoice.wav`（片尾段 −11.3 LUFS、峰值 −1.3 dBFS；audio-check 全 0）。
- 渲染：`AUDIO=out/tech-icdesign.revoice.wav CONC=2 bash scripts/three/chunk-render.sh tech-icdesign revoice` → `out/tech-icdesign.revoice.mp4`。
- 試聽：`out/voice-compare/1122/IC設計-重配-前20秒.m4a`、`IC設計-矽-修正後.m4a`。
