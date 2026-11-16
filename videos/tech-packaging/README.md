# tech-packaging：先進封裝（科技透明圈 第 5 支，11/18（三）20:00）

- 狀態（2026/11/16 11:30）：畫面完成（無聲時間軸），validate 0 error。**配音未做**：主控要先確認念稿是否改（Andy 11-16 新規則 video_logic.md 第六節）；另外 Gemini TTS 免費層當日額度已用完（429，約台北 16:00 重置）。
- 規格以 `device-spec.md` 為準；畫面、鏡頭、物理在 `gen-script.mjs`，模型在 `gen-model.mjs`（改這兩支再重跑，不要手改 json）。
- 2D 卡：`src/components/three/HudPkg.tsx`（overlay `section` 的 `kind: "pkg-frames｜pkg-wafers｜pkg-detour｜pkg-xsec｜pkg-warp｜pkg-choice"`），顏色讀 model.json palette，光點讀 3D flow 同一份數值。
- 引擎擴充（向下相容）：`engine.ts` shift 的 `spring: { tau, period }`（回來那段是阻尼彈簧，回流焊自對位用）。
- 開發工具：`node scripts/three/rect-probe.mjs <slug> <幀,…>`（印主素材框，調鏡頭用；`PER=1` 印每一層）。
- 鏡頭：PK 封裝（s1–s4、s7–s9）、KG 已知良品挑選站（s5）、XS 晶片與 HBM 交界（s6）、FULL 全貌（s10），換完不動。
- 與 device-spec 的差異：片尾「下一支」縮成「HBM 為什麼疊 12 層」（原文一行放不下）；HBM 拉高拆 12 層接在「疊十二層」（spec 寫「往上疊」，「往上疊」時改成二選一卡右邊亮）；s1 的「≥ 5 倍」放在框卡下方；s5 標籤改成一行小標（探針測試（示意）→ 吸嘴 → 中介層晶圓），因為站台佔滿畫面中央、引線標籤會壓到主素材。
- 預覽：`out/tech-packaging-silent-grid.png`、`out/tech-packaging-ops-A.png`、`out/tech-packaging-ops-BC.png`。

## 配音後要做的（照 playbook 第九節 16、第十節）

1. `NODE_USE_ENV_PROXY=1 node scripts/tts-take.mjs tech-packaging`（1 次請求）→ 量純說話字／秒，<5.3 就 atempo（倍數＝5.46÷實測，原檔留 .orig.wav）→ `tts-take --resplit` → `npm run align tech-packaging -- --force`。
2. `node scripts/three/layout-check.mjs tech-packaging`、抽格看 s5 的取放時間（test、bad 兩個 cue 相距要 ≥ 約 2 秒，否則吸嘴還在搬時壞的那顆已經被推下去）。
3. render（flock）→ 片尾招牌音（sfx-logo-tech.py＋mix-endsting.sh）→ `out/tech-packaging.v1.mp4`。
