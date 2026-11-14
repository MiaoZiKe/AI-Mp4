// node scripts/voice-prompts.mjs [--out=docs/voice-prompts-full.md] [--short=6] <slug>[:short] ...
// 產生「給網頁版試聽用」的完整提示詞檔：每支片一段，內容＝voice-profile.mjs 的 takePrompt（設定說明＋TRANSCRIPT 念稿），
// 和 tts-take.mjs 正式配音送出的文字是同一個函式組的。不送任何請求（試聽不花 API 額度，見 CLAUDE.md「試聽規則」）。
// slug 後面加 :short 會多附一段只有前 N 句（預設 6，以 。？！ 斷句）的短版，方便快速試聽。
// 預設：node scripts/voice-prompts.mjs sample-ai-news:short sample-talk-notes
// --append：不重寫整份檔，只把指定的片加進（或換掉）現有檔案裡自己的那一段，其他片的段落原封不動。
// --txt=<路徑>：另外把第一支片的完整提示詞存成純文字檔（可直接整份貼上，例：docs/prompts/tech-anc-降噪耳機.txt）。
import fs from "node:fs";
import path from "node:path";
import { resolveProfile, takePrompt, profileIssues } from "./voice-profile.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2), opt = (k, d) => (args.find((a) => a.startsWith(`--${k}=`)) ?? `--${k}=${d}`).split("=").slice(1).join("=");
const outPath = path.join(ROOT, opt("out", "docs/voice-prompts-full.md")), SHORT_N = Number(opt("short", 6));
const targets = args.filter((a) => !a.startsWith("--"));
if (!targets.length) targets.push("sample-ai-news:short", "sample-talk-notes");

const L = ["# 完整影片旁白提示詞（給網頁版試聽用）", "", "這份檔案由 `node scripts/voice-prompts.mjs` 從各片的 script.json 與 `scripts/voice-profile.mjs` 產生，不要手改；改了稿子或設定檔就重跑。沒有送任何 TTS 請求。", ""];
let firstPrompt = null;
for (const t of targets) {
  const [slug, flag] = t.split(":");
  const script = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "script.json"), "utf8"));
  const profile = resolveProfile(script.voice);
  if (!profile) { console.error(`✖ ${slug} 沒有 voice.profile`); process.exit(1); }
  const issues = profileIssues(profile);
  if (issues.length) { console.error(`✖ ${slug} 的旁白設定檔沒過檢查：\n  ${issues.join("\n  ")}`); process.exit(1); }
  const paras = script.scenes.filter((s) => s.silent !== true && (s.tts ?? s.narration)).map((s) => (s.tts ?? s.narration).trim());
  const model = /2\.5-flash/.test(script.voice.model ?? "") ? "Gemini 2.5 Flash TTS" : script.voice.model;
  const how = profile.delivery === "warm-pro" ? "親和專業" : profile.delivery === "chat" ? "聊天" : "預設";
  firstPrompt ??= takePrompt(profile, paras.join("\n\n"));
  L.push(`## ${slug}（${script.title}）`, "", `用法：Google AI Studio 語音生成頁面，模型選 ${model}、音色選 **${script.voice.voiceName}**，把下面整段貼進去。說話方式：${how}${profile.delivery ? `（\`delivery: "${profile.delivery}"\`）` : ""}；念稿 ${paras.length} 段。`, "", "```", takePrompt(profile, paras.join("\n\n")), "```", "");
  if (flag === "short") {
    // 前 N 句：照句號、問號、驚嘆號斷句，取到滿 N 句的那一段為止（段落不切半）
    const short = [];
    let n = 0;
    for (const p of paras) { if (n >= SHORT_N) break; short.push(p); n += (p.match(/[。？！?!]/g) ?? [""]).length; }
    L.push(`### ${slug} 短版（前 ${n} 句，${short.length} 段；設定說明和上面完全一樣，快速試聽用）`, "", "```", takePrompt(profile, short.join("\n\n")), "```", "");
  }
}
if (args.includes("--append") && fs.existsSync(outPath)) {
  // 現有檔案照「## slug（」切段；這次產生的段落換掉同名的舊段，沒有的接在最後
  const cut = (t) => t.split(/^(?=## )/m);
  const [head, ...old] = cut(fs.readFileSync(outPath, "utf8")), fresh = cut(L.slice(4).join("\n")).filter((x) => x.startsWith("## "));
  const name = (sec) => /^## ([^（\s]+)/.exec(sec)?.[1];
  const kept = old.map((sec) => { const i = fresh.findIndex((f) => name(f) === name(sec)); return i < 0 ? sec : fresh.splice(i, 1)[0].replace(/\n*$/, "\n\n"); });
  fs.writeFileSync(outPath, [head, ...kept.map((x) => x.replace(/\n*$/, "\n\n")), ...fresh].join("").replace(/\n+$/, "\n"));
} else fs.writeFileSync(outPath, L.join("\n"));
const txt = opt("txt", "");
if (txt && firstPrompt) { fs.mkdirSync(path.dirname(path.join(ROOT, txt)), { recursive: true }); fs.writeFileSync(path.join(ROOT, txt), firstPrompt + "\n"); console.log(`✔ ${txt}`); }
console.log(`✔ ${path.relative(ROOT, outPath)}（${targets.join("、")}）`);
