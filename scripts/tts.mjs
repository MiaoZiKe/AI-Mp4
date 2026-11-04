// TTS 介面：讀 TTS_PROVIDER。逐幕合成，回傳 [{ file, at }]（at = 該幕開始秒數 + 0.25s）。
// 未設定、缺 key 或 API 失敗（例如額度用完）→ 回傳 null，影片自動產出「音樂＋音效、無旁白」版本。
// 聲音與語氣指示讀 script.json 的 tts 欄位（預設 marin＋台灣新聞解說口吻）。
import fs from "node:fs";
import path from "node:path";
import { ROOT, fps, sceneFrames } from "./lib.mjs";

const providers = {
  async openai(text, outFile, cfg) {
    if (!process.env.OPENAI_API_KEY) return null;
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.TTS_MODEL || "gpt-4o-mini-tts",
        voice: process.env.TTS_VOICE || cfg.voice || "marin",
        instructions: cfg.instructions,
        input: text, response_format: "mp3",
      }),
    });
    if (!r.ok) throw new Error(`TTS failed: ${r.status} ${(await r.text()).slice(0, 160)}`);
    fs.writeFileSync(outFile, Buffer.from(await r.arrayBuffer()));
    return outFile;
  },
};

export async function synthesize(script) {
  const name = process.env.TTS_PROVIDER;
  if (!name) { console.log("ℹ TTS_PROVIDER 未設定 → 無旁白版（音樂＋音效）"); return null; }
  const fn = providers[name];
  if (!fn) { console.warn(`⚠ 未知 TTS_PROVIDER=${name} → 無旁白版`); return null; }
  const dir = path.join(ROOT, "out", script.slug, "tts");
  fs.mkdirSync(dir, { recursive: true });
  const parts = [];
  let t = 0;
  try {
    for (const [i, s] of script.scenes.entries()) {
      const out = path.join(dir, `${String(i + 1).padStart(2, "0")}-${s.id}.mp3`);
      const res = await fn(s.narration, out, script.tts ?? {});
      if (!res) { console.warn("⚠ 缺少 TTS key → 無旁白版"); return null; }
      parts.push({ file: out, at: t + 0.25 });
      t += sceneFrames(s) / fps;
    }
    return parts;
  } catch (e) { console.warn(`⚠ TTS 失敗（${e.message}）→ 無旁白版`); return null; }
}
