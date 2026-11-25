// 旁白設定檔（voice.profile）：每支片配音前先定義「誰在講、口音、語速、語氣、起承轉合」，再由這裡組成送給 TTS 的說明。
// 規範與四個頻道的預設檔：docs/voice-profiles.md、scripts/voice-profiles.json。tts-take.mjs 與 validate 共用。
//   resolveProfile(voice)   → 展開後的設定檔（voice.profile 是預設檔名字、{ preset, … } 或整份物件）；沒有就回傳 null（舊片照舊用 voice.style）
//   buildDirection(profile) → 「導演筆記」說明文字（不含念稿）；takePrompt(profile, text) → 整個請求文字
//   profileIssues(profile)  → 欄位檢查（validate 用）；cnTermIssues(text) → 念稿裡的中國用語與兒化
// 說明文字的格式是 what-is-server 試聽時實測「沒有被念出來」的導演筆記版（AUDIO PROFILE／PERFORMANCE／TRANSCRIPT，gemini-2.5-flash-preview-tts）。
// 起承轉合只描述「哪一段、什麼情緒」，不引用稿子裡的字——說明裡出現像台詞的句子會被念出來。
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const PRESETS = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts", "voice-profiles.json"), "utf8"));
export const PRESET_NAMES = Object.keys(PRESETS).filter((k) => !k.startsWith("_"));
/** 每支片都一樣的口音句（不放進設定檔讓各片改） */
export const ACCENT_TW = "台灣華語（Taiwanese Mandarin），台北土生土長的台灣人平常講話的口音。捲舌音輕輕帶過、不特別捲舌，沒有兒化音，詞尾不念輕聲。不是中國大陸的普通話，也不是播音員的標準腔。";
export const ENGLISH_STD = "中文和英文都要念得標準、清楚。英文單字用標準美式發音完整念出來，尾音不省略，念完自然接回中文。";
export const LANGUAGE_CODE = "cmn-TW";
/** 後製加速上限：超過就重配，不硬加速 */
export const ATEMPO_MAX = 1.08;
export const ARC_KEYS = ["起", "承", "轉", "合"];
const ARC_WHERE = { 起: "開頭", 承: "中段", 轉: "轉折的地方", 合: "結尾" };
const GENDERS = ["female", "male", "any"];

export function resolveProfile(voice) {
  const p = voice?.profile;
  if (!p) return null;
  if (typeof p === "string") return PRESETS[p] ? { preset: p, ...PRESETS[p] } : { preset: p, _unknown: true };
  if (p.preset) return PRESETS[p.preset] ? { ...PRESETS[p.preset], ...p, arc: { ...PRESETS[p.preset].arc, ...(p.arc ?? {}) } } : { ...p, _unknown: true };
  return p;
}

/** delivery（選填，docs/voice-natural.md）：把固定的 Pacing／Articulation 兩句換掉；沒寫就和以前完全一樣。
 * "chat"＝跟朋友講話版（想到哪講到哪）；"warm-pro"＝親和專業版（前輩當面帶同事做一次：句子講完整、不拖尾音，介於 chat 與沒寫之間）；
 * "probe"＝查證揭露版（哩股哩股：把查到的事一件一件攤給信得過的人聽；講到疑點放慢、講到查證結果乾脆收住，比 warm-pro 低、穩） */
export const DELIVERIES = ["chat", "warm-pro", "probe", "report", "report-lively", "report-tech", "plain", "tech-b"];
/** "report"＝正常報導一件事（2026/11/14，使用者聽完 short-ai：「口吻很奇怪，語速太慢，我只是想要讓它正常的去報導一件事情」）。
 * 整段說明只有一句（和 what-is-server 被接受的 voice.style 同一種寫法：`…說：` 後面直接接念稿），不寫人設、場景、情緒弧線、Avoid。
 * 原因：長篇導演筆記（AUDIO PROFILE＋SCENE＋Arc）會讓 Gemini 2.5 TTS「演」那個角色，短稿尤其明顯——又慢（short-ai 實測 3.3 音節/秒）又怪。
 * persona／scene／tone／arc／avoid 就算寫了也不送；englishTerms 也不送（念法說明放在一句話的提示裡容易被念出來）。 */
export const REPORT_LINE = "用台灣人平常講話的口音，不兒化，但捲舌音（ㄓㄔㄕㄖ）一定要念清楚、不可念成ㄗㄘㄙ，像平常跟人講一件事那樣，正常語速、不拖尾音、不演，直接說：";
/** "report-lively"＝report 的變體（2026/11/14，使用者聽完 short-ai 第 3 版：「可以，但可以再快那麼一點點，並且有點起伏，依據內容變化」）。
 * 仍然只有一句、沒有人設場景；多了「再快一點點」和「語氣跟著內容起伏」的描述。只描述哪一類句子怎麼講（問句、數字、和預期不一樣的地方、最後一句），
 * 不引用稿子裡的字、不寫成逐句的表演指示。"report" 的輸出不變。 */
export const REPORT_LIVELY_LINE = "用台灣人平常講話的口音，不特別捲舌、不兒化，像平常跟人講一件事那樣，語速比平常再快一點點、不拖尾音、不演；語氣跟著內容有自然的起伏，問句自然上揚，數字講清楚，講到和預期不一樣的地方帶一點點意外，最後一句輕鬆收尾，直接說：";
/** "report-tech"＝科技頻道版的 report（2026/11/14，tech-2nm）：同樣只有一句，語速稍快、語氣沉穩。 */
export const REPORT_TECH_LINE = "用台灣人平常講話的口音，不特別捲舌、不兒化，像平常跟人講一件事那樣，語速稍快、語氣沉穩、不拖尾音、不演，直接說：";
/** "plain"＝正常說話（2026/11/14，談晴說礙 short-talk；使用者聽完第 1 版：「我覺得正常說話，不要太奇怪，那個氣音很奇怪」）。
 * 一樣只有一句、沒有人設場景；不寫「小聲、放低、講心事」這類會引出氣音或耳語的描述，只要求平常的音量和聲音。其他 delivery 的輸出不變。 */
export const PLAIN_LINE = "用台灣人平常講話的口音，不特別捲舌、不兒化，用平常說話的音量和聲音，正常語速、不拖尾音、不用氣音、不演，直接說：";
/** "tech-b"＝科技頻道「說明 B」（使用者 2026/11/15 決定 Iapetus＋說明 B；和 docs/prompts/tech-*-旁白.txt 交給使用者在 AI Studio 用的那句一字不差）。 */
export const TECH_B_LINE = "用台灣人平常講話的口音，不特別捲舌、不兒化，語氣溫和親切，像在跟一個好奇的朋友解說，問句自然上揚，講到答案時肯定一點，語速稍快、不拖尾音，直接說：";
const REPORT_LINES = { "tech-b": TECH_B_LINE, report: REPORT_LINE, "report-lively": REPORT_LIVELY_LINE, "report-tech": REPORT_TECH_LINE, plain: PLAIN_LINE };
/** 這個 delivery 是不是「只送一句話」的報導類 */
export const isReport = (profile) => Object.hasOwn(REPORT_LINES, profile?.delivery ?? "");
const one = (s) => String(s ?? "").replace(/\s+/g, " ").replace(/[。．.]+$/, "").trim();
export function buildDirection(profile) {
  if (isReport(profile)) return REPORT_LINES[profile.delivery];
  const L = ["以下是給配音員的說明，不要念出來，只念 TRANSCRIPT 之後的內容。", "", "# AUDIO PROFILE", `${one(profile.persona)}。`, ...(profile.scene ? ["", "# SCENE", `${one(profile.scene)}。`] : []), "", "# PERFORMANCE", `Accent: ${ACCENT_TW}`, `Tone: ${one(profile.tone)}。`];
  const chat = profile.delivery === "chat", warm = profile.delivery === "warm-pro", probe = profile.delivery === "probe";
  if (chat && Array.isArray(profile.pace)) L.push(`Pacing: 跟朋友講話的速度，平均大約每秒 ${profile.pace[0]} 到 ${profile.pace[1]} 個字。想到哪講到哪：有的地方一口氣帶過去，有的地方想一下才接下去；停頓有長有短，逗號不一定要停。`);
  else if (warm && Array.isArray(profile.pace)) L.push(`Pacing: 當面跟同事解釋事情的速度，平均大約每秒 ${profile.pace[0]} 到 ${profile.pace[1]} 個字。一句一句講完整，步驟和步驟之間自然停一下，講到數字稍微慢一點；停頓有長有短，不用每一句都一樣。`);
  else if (probe && Array.isArray(profile.pace)) L.push(`Pacing: 私下把查到的事講給對方聽的速度，平均大約每秒 ${profile.pace[0]} 到 ${profile.pace[1]} 個字。一件一件講，講到還有疑問的地方放慢一點，講到查證的結果就乾脆講完；句號停得比逗號久，停頓有長有短。`);
  else if (Array.isArray(profile.pace)) L.push(`Pacing: 像平常講話的速度，大約每秒 ${profile.pace[0]} 到 ${profile.pace[1]} 個字；有快有慢，重點前面留一口氣，句子講完才換氣。`);
  const arc = ARC_KEYS.filter((k) => profile.arc?.[k]).map((k) => `${ARC_WHERE[k]}${one(profile.arc[k])}`);
  if (arc.length) L.push(`Arc: 整篇的情緒依內容走：${arc.join("；")}。`);
  const en = Object.entries(profile.englishTerms ?? {}).map(([k, v]) => `${k}（${one(v)}）`);
  if (chat) L.push(`Articulation: 平常講話的咬字就好，虛字和語助詞輕輕帶過，不用每個字都一樣重；句尾不用每一句都收得很乾淨。英文單字用標準美式發音完整念出來，念完自然接回中文。${en.length ? `特別注意：${en.join("、")}。` : ""}`);
  else if (warm) L.push(`Articulation: 平常講話的咬字，虛字輕輕帶過；句子講完整，句尾自然收住，不拖長、不往上飄。英文單字用標準美式發音完整念出來，念完自然接回中文。${en.length ? `特別注意：${en.join("、")}。` : ""}`);
  else if (probe) L.push(`Articulation: 平常講話的咬字，聲音放低、放穩，虛字輕輕帶過；句尾往下收住，不拖長、不往上飄，問句也只是平平地問。英文單字用標準美式發音完整念出來，念完自然接回中文。${en.length ? `特別注意：${en.join("、")}。` : ""}`);
  else L.push(`Articulation: 每個字都講得出來，但是像平常講話，不是朗讀。${ENGLISH_STD}${en.length ? `特別注意：${en.join("、")}。` : ""}`);
  if (profile.avoid?.length) L.push(`Avoid: ${profile.avoid.map(one).join("、")}。`);
  return L.join("\n");
}
export const takePrompt = (profile, text) => (isReport(profile) ? `${REPORT_LINES[profile.delivery]}\n${text}` : `${buildDirection(profile)}\n\n# TRANSCRIPT\n${text}`);

export function profileIssues(profile) {
  const out = [];
  if (profile._unknown) return [`voice.profile 的預設檔「${profile.preset}」不存在（${PRESET_NAMES.join("／")}）`];
  const report = isReport(profile); // 只送一句固定的話：persona／tone／arc 不需要
  if (!report) for (const k of ["persona", "tone"]) if (typeof profile[k] !== "string" || !profile[k].trim()) out.push(`voice.profile 缺 ${k}`);
  if (!GENDERS.includes(profile.gender)) out.push(`voice.profile.gender 要是 ${GENDERS.join("／")}`);
  if (profile.accent !== "台灣華語") out.push("voice.profile.accent 固定寫「台灣華語」");
  if (!Array.isArray(profile.pace) || profile.pace.length !== 2 || profile.pace.some((v) => typeof v !== "number") || profile.pace[0] >= profile.pace[1] || profile.pace[0] < 3 || profile.pace[1] > 5.5) out.push("voice.profile.pace 要是 [下限, 上限]（音節/秒，3–5.5 之間）");
  if (!report) for (const k of ARC_KEYS) if (typeof profile.arc?.[k] !== "string" || !profile.arc[k].trim()) out.push(`voice.profile.arc 缺「${k}」（起／承／轉／合各一句情緒指示）`);
  if (profile.englishTerms !== undefined && (typeof profile.englishTerms !== "object" || Array.isArray(profile.englishTerms))) out.push("voice.profile.englishTerms 要是 { 英文詞: 念法 }");
  if (profile.avoid !== undefined && !Array.isArray(profile.avoid)) out.push("voice.profile.avoid 要是陣列");
  if (profile.delivery !== undefined && !DELIVERIES.includes(profile.delivery)) out.push(`voice.profile.delivery 只能是 ${DELIVERIES.join("／")}（或不寫）`);
  if (profile.scene !== undefined && (typeof profile.scene !== "string" || !profile.scene.trim())) out.push("voice.profile.scene 要是一句話（在哪裡、對誰講），或不寫");
  // 說明裡不能有像台詞的句子（會被念出來）
  const texts = [profile.persona, profile.scene, profile.tone, ...ARC_KEYS.map((k) => profile.arc?.[k]), ...(profile.avoid ?? []), ...Object.values(profile.englishTerms ?? {})].filter((t) => typeof t === "string");
  for (const t of texts) { if (/[「『“"][^」』”"]{4,}[」』”"]/.test(t)) out.push(`voice.profile 的說明「${t.slice(0, 16)}…」含引號裡的句子，可能被念出來：只描述說話方式，不放台詞`); if (t.length > 60) out.push(`voice.profile 的說明「${t.slice(0, 16)}…」超過 60 字：一句話就好`); }
  return out;
}

/** 中國用語 → 台灣說法（念稿與字幕都不該出現）。只收不會誤傷台灣常用詞的。 */
export const CN_TERMS = { 視頻: "影片", 短視頻: "短影音", 信息: "資訊／訊息", 軟件: "軟體", 硬件: "硬體", 網絡: "網路", 互聯網: "網路", 服務器: "伺服器", 內存: "記憶體", 硬盤: "硬碟", 芯片: "晶片", 屏幕: "螢幕", 鼠標: "滑鼠", 打印: "列印", 博客: "部落格", 博主: "創作者", 默認: "預設", 激活: "啟用", 人工智能: "人工智慧", 智能手機: "智慧型手機", 移動支付: "行動支付", 二維碼: "QR Code", 程序員: "工程師", 渠道: "通路／管道", 立馬: "馬上", 靠譜: "可靠", 給力: "很厲害", 接地氣: "貼近生活", 小伙伴: "朋友", 小夥伴: "朋友", 性價比: "CP 值", 出租車: "計程車", 公交車: "公車", 打車: "叫車", 土豆: "馬鈴薯", 西紅柿: "番茄", 酸奶: "優格", 方便麵: "泡麵", 質量: "品質（物理的質量除外）", 高清: "高畫質", 首席執行官: "執行長", 回調: "回檔", 板塊: "類股／族群（地質的板塊除外）", 利好: "利多", 股民: "投資人／散戶" };
const ERHUA = /(這兒|那兒|哪兒|一點兒|一會兒|一塊兒|玩兒|事兒|沒準兒|好好兒|慢慢兒|花兒|今兒|明兒|哥們兒)/g;
export function cnTermIssues(text) {
  const t = String(text ?? ""), out = [];
  const hit = Object.keys(CN_TERMS).filter((k) => t.includes(k)).filter((k, _, a) => !a.some((o) => o !== k && o.includes(k) && t.includes(o)));
  if (hit.length) out.push(`中國用語：${hit.map((k) => `${k}→${CN_TERMS[k]}`).join("、")}`);
  const er = t.match(ERHUA);
  if (er) out.push(`兒化：${[...new Set(er)].join("、")}（台灣華語不兒化，改掉「兒」）`);
  return out;
}
