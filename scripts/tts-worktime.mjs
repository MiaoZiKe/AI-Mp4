import fs from "node:fs";
const API = "https://generativelanguage.googleapis.com/v1beta";
const H = { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY || "injected-by-proxy" };
const STYLE = "用台灣人平常講話的口音，不特別捲舌、不兒化，用平常說話的音量和聲音。像一位做深度報導的記者，把剛查完的資料攤開來，跟觀眾一起拆解這則新聞：講數字時清楚、肯定，像在對著資料念；講到「為什麼」和「只是」這種轉折時稍微放慢、帶一點思考；講到結論時篤定收住。整體語速偏快，大約每秒 5.5 個字，句子之間停頓短，不拖尾音、不用氣音、不演，不像主播播報，也不像在講課。直接說：";
// 使用者同一則訊息要求：「後面廢話有點多，介紹完就好，不用特別說什麼天亮著什麼的」→ 拿掉「不過有些傍晚…熱的晚餐」與「你上一次天還亮著下班…」兩句
const BODY = "一年工作兩千零二十七小時。下班的時候，天早就黑了。這是勞動部算的，二零二五年的年總工時。換成一天八小時，是兩百五十三個工作天。二零一四年更長，兩千一百三十五小時。後來一路降，疫情那年不到兩千。之後又回升。去年假變多，全年只少了三點六小時。為什麼降不下來？我們幾乎都是全職。兼職只有百分之三到四，日本大約四個有一個。再來是加班。去年正常工時變少，加班卻變多。還有下班以後。四個人有一個，收過交辦工作的訊息。只是這個數字要小心讀。全職和兼職，是一起平均的。所以不能說，我們比日本人多上將近四百小時的班。只看全職，台灣一週四十一點五小時，比日本還少。下一集，我們看房租。";
const CH = [...BODY].filter((c) => /[一-鿿]/.test(c)).length;
const LO = CH / 5.8, HI = CH / 5.2, MIN = CH / 6.8; // 照使用者的每秒 5.2–5.8 字換算（原稿 340 字＝58–66 秒）
const NUMS = ["兩千零二十七", "二零二五", "兩百五十三", "二零一四", "兩千一百三十五", "三點六", "百分之三到四", "四十一點五"];
const log = (o) => fs.appendFileSync(process.argv[2] + "/log.jsonl", JSON.stringify({ at: new Date().toISOString(), ...o }) + "\n");
const wav = (pcm, rate = 24000) => { const h = Buffer.alloc(44); h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40); return Buffer.concat([h, pcm]); };
async function tts(model, voice) {
  const r = await fetch(`${API}/models/${model}:generateContent`, { method: "POST", headers: H, body: JSON.stringify({ contents: [{ parts: [{ text: STYLE + BODY }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } } }) });
  const st = r.status; let j = null, t = ""; try { j = await r.json(); } catch { t = await r.text().catch(() => ""); }
  log({ kind: "tts", model, voice, status: st });
  const p = j?.candidates?.[0]?.content?.parts?.find((x) => x.inlineData);
  if (st !== 200 || !p) return { err: `${st} ${JSON.stringify(j?.error?.message ?? j?.candidates?.[0]?.finishReason ?? t).slice(0, 200)}` };
  const rate = Number(/rate=(\d+)/.exec(p.inlineData.mimeType ?? "")?.[1] ?? 24000);
  return { pcm: Buffer.from(p.inlineData.data, "base64"), rate };
}
async function asr(buf) {
  const r = await fetch(`${API}/models/gemini-2.5-flash:generateContent`, { method: "POST", headers: H, body: JSON.stringify({ contents: [{ parts: [{ inlineData: { mimeType: "audio/wav", data: buf.toString("base64") } }, { text: "逐字聽寫這段中文語音，數字照念出來的中文字寫（例如「兩千零二十七」），只輸出聽寫文字，不加任何說明。" }] }], generationConfig: { temperature: 0 } }) });
  log({ kind: "asr", status: r.status }); const j = await r.json().catch(() => ({}));
  return (j?.candidates?.[0]?.content?.parts ?? []).map((x) => x.text ?? "").join("").replace(/\s+/g, "");
}
const norm = (s) => s.replace(/[，。？！、：「」\s,.?!]/g, "");
const out = { };
for (const voice of ["Charon", "Sulafat"]) {
  let model = "gemini-3.8-flash-tts", best = null;
  for (let k = 1; k <= 3; k++) {
    let a = await tts(model, voice);
    if (a.err && model !== "gemini-2.5-flash-preview-tts") { console.log(`${voice} ${model} 失敗：${a.err} → 改用 2.5`); model = "gemini-2.5-flash-preview-tts"; a = await tts(model, voice); }
    if (a.err) { console.log(`${voice} 第 ${k} 次失敗：${a.err}`); continue; }
    const buf = wav(a.pcm, a.rate), sec = a.pcm.length / 2 / a.rate, txt = norm(await asr(buf));
    const checks = { len: sec >= MIN && sec <= HI, noPrompt: !/台灣人平常講話|直接說|深度報導|捲舌|兒化/.test(txt.slice(0, 60)), end: /下一集.{0,3}看房租/.test(txt.slice(-20)), nums: NUMS.filter((n) => !txt.includes(n)) };
    const ok = checks.len && checks.noPrompt && checks.end && checks.nums.length === 0;
    const score = (checks.noPrompt ? 0 : 100) + (checks.end ? 0 : 50) + checks.nums.length * 5 + Math.abs(sec - (LO + HI) / 2);
    console.log(`${voice} 第 ${k} 次（${model}）：${sec.toFixed(2)} 秒、${(CH / sec).toFixed(2)} 字/秒、${JSON.stringify(checks)}`);
    fs.writeFileSync(`${process.argv[2]}/${voice}-${k}.wav`, buf); fs.writeFileSync(`${process.argv[2]}/${voice}-${k}.txt`, txt);
    if (!best || score < best.score) best = { k, model, sec, checks, ok, score, buf };
    if (ok) break;
  }
  out[voice] = best && { ...best, buf: undefined };
  if (best) fs.writeFileSync(`/home/user/AI-Mp4/audio/worktime_${voice.toLowerCase()}.wav`, best.buf);
}
fs.writeFileSync(process.argv[2] + "/result.json", JSON.stringify({ CH, LO, HI, out }, null, 1));
console.log(JSON.stringify({ CH, LO: +LO.toFixed(1), HI: +HI.toFixed(1) }));
