// node scripts/dossier/short-voice-prompt.mjs [slug]：產生「說明只有一句」的男聲試聽提示詞 → docs/prompts/liguligu-男聲試聽-短說明.txt。不送任何 TTS 請求。
// 為什麼只有一句：videos/short-ai/voice.md 的教訓——長篇導演筆記（人設＋場景＋弧線）會讓 Gemini 變慢、變演。
// 念稿由 script.json 各幕的 tts（沒有就用 narration）接起來，照 PARAS 分成三段、段內不換行；建議音色沿用 docs/prompts/liguligu-男聲試聽.txt 的清單。
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const slug = process.argv[2] ?? "liguligu-jensen-pro";
const script = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "script.json"), "utf8"));
export const LINE = "用台灣人平常講話的口音，不特別捲舌、不兒化，像國際新聞記者把查到的事講清楚，語速偏快、語氣沉穩篤定、不拖尾音、不演，直接說：";
/** 分段：事件與疑點（s01–s03）／外界懷疑與查證（s04–s05）／還不知道的與提問（s06–s07） */
const PARAS = [["s01", "s02", "s03"], ["s04", "s05"], ["s06", "s07"]];
const by = Object.fromEntries(script.scenes.map((s) => [s.id, s.tts ?? s.narration]));
const used = PARAS.flat();
if (used.length !== script.scenes.length || used.some((id) => !by[id])) throw new Error("PARAS 和 script.json 的幕對不上");
const transcript = PARAS.map((ids) => ids.map((id) => by[id]).join("")).join("\n");
const syl = (transcript.match(/[一-鿿]/g) ?? []).length;
const old = fs.readFileSync(path.join(ROOT, "docs/prompts/liguligu-男聲試聽.txt"), "utf8");
const voices = old.slice(old.indexOf("建議依序試的男聲"), old.indexOf("要聽什麼")).trim();
const out = `【哩股哩股】男聲試聽提示詞・短說明版（${script.title}）
產生方式：node scripts/dossier/short-voice-prompt.mjs ${slug}（念稿取自 videos/${slug}/script.json 的 7 句念稿，共 ${syl} 個字）。沒有送任何 TTS 請求。產生日 ${script.asOf}。

怎麼用
1. 打開 Google AI Studio 的語音生成頁（aistudio.google.com/generate-speech），模型選 Gemini 2.5 Flash Preview TTS，單人模式。
2. 把最下面「要貼的內容」整段（從「用台灣人」到最後一行）貼進去，不要分開貼到別的欄位。
3. 音色照下面的清單一個一個換，各生成一次，告訴我你選哪一個。選定之前我不會送任何配音請求。
4. 選好後請把那一次的錄音檔也傳給我（要 7 句都念完的），我可以直接接到影片上。

和舊版（liguligu-男聲試聽.txt）差在哪裡
- 舊版的說明是一整頁（人設、場景、情緒走向）。同樣的寫法在 AI 短片試過兩次，Gemini 都念得又慢又像在演（每秒 3.3 個字）；改成一句話之後才正常（紀錄在 videos/short-ai/voice.md）。
- 這一版說明只有一句，並照你說的「帶點新聞、國際風格，語速要調整快點」寫成「像國際新聞記者、語速偏快」。
- 念稿連成三段（不是一句一行），模型比較不會每句都停很久。

${voices}

要聽什麼
- 是不是台灣口音（沒有捲舌很重、沒有兒化）。
- 像不像記者在講查到的事：沉穩、有把握，不像主播念稿，也不像在演戲。
- 語速：整段大約 21–23 秒（每秒 5 個字上下）算剛好；超過 26 秒就是太慢。
- 「公告沒寫原因。」「但樂見，不等於設局。」這種短句有沒有乾脆收住。

==================== 要貼的內容 ====================
${LINE}
${transcript}
`;
const file = path.join(ROOT, "docs/prompts/liguligu-男聲試聽-短說明.txt");
fs.writeFileSync(file, out);
console.log(`✔ ${path.relative(ROOT, file)}（說明 ${[...LINE].length} 字、念稿 ${syl} 字、${PARAS.length} 段）`);
