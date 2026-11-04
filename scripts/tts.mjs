// TTS 介面：讀 TTS_PROVIDER。未設定或缺少 key → 回傳 null，影片自動產出無聲版。
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib.mjs";

const providers = {
  // 範例：OpenAI TTS（需 OPENAI_API_KEY）。逐幕合成後由 ffmpeg 串接，暫時以整段旁白合成。
  async openai(text, outFile) {
    if (!process.env.OPENAI_API_KEY) return null;
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.TTS_MODEL || "gpt-4o-mini-tts", voice: process.env.TTS_VOICE || "alloy", input: text, format: "mp3" }),
    });
    if (!r.ok) throw new Error(`TTS failed: ${r.status}`);
    fs.writeFileSync(outFile, Buffer.from(await r.arrayBuffer()));
    return outFile;
  },
};

/** 回傳 public/ 底下的相對路徑，或 null（無聲版） */
export async function synthesize(script) {
  const name = process.env.TTS_PROVIDER;
  if (!name) { console.log("ℹ TTS_PROVIDER 未設定 → 產出無聲版"); return null; }
  const fn = providers[name];
  if (!fn) { console.warn(`⚠ 未知 TTS_PROVIDER=${name} → 無聲版`); return null; }
  const rel = `audio/${script.slug}.mp3`;
  const out = path.join(ROOT, "public", rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  try {
    const res = await fn(script.scenes.map((s) => s.narration).join("\n"), out);
    if (!res) { console.warn("⚠ 缺少 TTS key → 無聲版"); return null; }
    return rel;
  } catch (e) { console.warn(`⚠ TTS 失敗（${e.message}）→ 無聲版`); return null; }
}
