// node scripts/tts.mjs <slug>：有 AZURE_TTS_KEY 或 ELEVENLABS_API_KEY 時逐幕產生旁白，
// 寫入 public/<slug>/vo/*.mp3 與 public/<slug>/timing.json（時長 = 音檔長度 + 0.4 秒）。沒有 key 時不做事。
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { FPS, ROOT, getSlug, loadScript } from "./lib.mjs";

const slug = getSlug();
const script = loadScript(slug);
const azureKey = process.env.AZURE_TTS_KEY;
const azureRegion = process.env.AZURE_TTS_REGION ?? "eastasia";
const elevenKey = process.env.ELEVENLABS_API_KEY;
const elevenVoice = process.env.ELEVENLABS_VOICE_ID;

if (!azureKey && !elevenKey) {
  console.log("▸ 沒有 AZURE_TTS_KEY / ELEVENLABS_API_KEY：使用無聲版（時長依字數估算）");
  const t = path.join(ROOT, "public", slug, "timing.json");
  if (fs.existsSync(t)) fs.rmSync(t);
  process.exit(0);
}

const voDir = path.join(ROOT, "public", slug, "vo");
fs.mkdirSync(voDir, { recursive: true });
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const synth = async (text) => {
  if (azureKey) {
    const ssml = `<speak version="1.0" xml:lang="zh-TW"><voice name="zh-TW-HsiaoChenNeural"><prosody rate="+5%">${esc(text)}</prosody></voice></speak>`;
    const r = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: { "Ocp-Apim-Subscription-Key": azureKey, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3" },
      body: ssml,
    });
    if (!r.ok) throw new Error(`Azure TTS ${r.status}`);
    return Buffer.from(await r.arrayBuffer());
  }
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoice ?? "21m00Tcm4TlvDq8ikWAM"}`, {
    method: "POST",
    headers: { "xi-api-key": elevenKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
  });
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
};

const timing = { durations: {}, voice: {} };
for (const s of script.scenes) {
  const file = path.join(voDir, `${s.id}.mp3`);
  fs.writeFileSync(file, await synth(s.narration));
  const sec = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString());
  timing.durations[s.id] = Math.round((sec + 0.4) * FPS);
  timing.voice[s.id] = `${slug}/vo/${s.id}.mp3`;
  console.log(`  ✓ ${s.id} ${sec.toFixed(2)}s`);
}
fs.writeFileSync(path.join(ROOT, "public", slug, "timing.json"), JSON.stringify(timing, null, 2));
