# AI-Mp4

用程式自動生成知識科普短影音（白話國際｜國際白話講）。規範見 [CLAUDE.md](CLAUDE.md)。

```bash
npm install
npm run still us-midterm-2026   # 每幕截圖 + 封面 + 總覽
npm run render us-midterm-2026  # out/us-midterm-2026.mp4
```

## 鉤子提問解說版（Explainer）

`videos/us-midterm-impact/` 使用新版版型（`src/explainer/`）：script.json 頂層加 `composition: { video: "Explainer", cover: "ExplainerCover" }` 即切換。

- 每幕可加 `tint`（背景光暈色）、`chapter`（`{ i, n, label }`，頂部顯示 1/3 進度）、`sfx`（`[{ t, name }]`，name：whoosh／pop／tick／riser／hit／ding）
- 頂層 `music: { bpm, seed }`：程式合成 BGM；`tts: { voice, instructions }`：逐幕旁白設定
- `npm run render <slug>`：Remotion 輸出無聲畫面 → `scripts/mix.mjs` 混入 BGM、音效、旁白（有旁白時 BGM 自動 sidechain 壓低）→ loudnorm −14 LUFS

```bash
TTS_PROVIDER=openai npm run render us-midterm-impact   # 需 OpenAI 額度；失敗會自動退回無旁白版
```
