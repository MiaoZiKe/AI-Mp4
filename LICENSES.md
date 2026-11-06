# 素材授權紀錄

| 素材 | 來源 | 授權 | 備註 |
|---|---|---|---|
| 字型 Noto Sans TC、Inter | Google Fonts（@remotion/google-fonts，本地鏡像 public/fonts/） | SIL Open Font License 1.1 | |
| 圖示 | 自繪 SVG（src/components/Icons.tsx） | 自製 | |
| 背景 public/bg/*.png | 程式預渲染（scripts/make-bg.mjs） | 自製 | |
| 音效 whoosh／pop／chime（public/sfx/，不入庫） | scripts/mix.mjs 以 ffmpeg anoisesrc／aevalsrc 合成 | 自製，無第三方素材 | 參數與峰值位置記在 videos/<slug>/mix.json |
| BGM 中性和弦底（out/<slug>.bgm.wav，不入庫） | scripts/mix.mjs 以 ffmpeg aevalsrc 合成（C–G–B–D–E 正弦） | 自製，無第三方素材 | 之後若換成授權曲目，請在此列出曲名、來源與授權證明 |
| 配音 | Gemini TTS（generativelanguage.googleapis.com） | 依 Google 服務條款 | |
| 強制對齊模型 | MahmoudAshraf/mms-300m-1130-forced-aligner（Hugging Face，MMS 權重的 HF 轉檔） | CC-BY-NC 4.0（MMS 原始授權，使用前請再確認商用條件） | 只用來算時間戳，不進入成品 |
