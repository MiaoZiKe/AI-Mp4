# tech-800v：八百伏特（科技透明圈 第 9 支，11/22（日）20:00）

## 進度（2026/11/17）
- [x] research.md 複查（第二來源、信心度、台灣公司）
- [x] 念稿改寫（九段、249 字、結尾預告 11/23「IC 設計為什麼沒有工廠」、留言「供電」）
- [x] device-spec.md（每一步怎麼動、物理現象清單）
- [x] model.json／script.json（genmodel.py、genscript.py 產生）＋ HudPower.tsx 四張 2D 卡（pw-compare、pw-chain、pw-unk、pw-sum）
- [x] validate 0 error、layout-check 0 error、kinematics-check 0 error
- [x] 配音 1 次請求（out/voice-800v/800v-a.wav，63.85 秒）
- [ ] make-tech 渲染 v1、抽格自查（見下）

## 配音量測
- 原始 249 字，純說話 53.1 秒＝4.69 字/秒（基準 4.3–5.0 內）；atempo ＝ 5.46÷4.69 ＝ 1.165。
- 音高（同一支自寫自相關估計，曝光機基準 112 Hz／p90 170 Hz）：本次中位數 127.7 Hz、p90 202 Hz，**比基準高約 15 Hz，略超出 110–125 範圍**。依指示只送 1 次、沒有重配；比對 mp3 已做，等人耳確認。

## 查證與已知限制
- 銅排 200 kg 是廠商估算（NVIDIA；Tom's Hardware、Converge Digest 同寫）；18,519／1,250 A 與 219 倍是自己算的式子；光寶科時程兩說不一，念稿不講；華城等本輪查不到 800 V 直流的公開來源，不放。
- 機櫃兩側銅排是示意（真實在背面中央）；降壓路徑 800→50→12→約 1 V 是常見路徑之一。
- 水冷沒有畫（本題不涉及）。
