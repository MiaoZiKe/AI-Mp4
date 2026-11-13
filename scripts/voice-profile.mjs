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

/** delivery: "chat"（選填，docs/voice-natural.md）：把固定的 Pacing／Articulation 兩句換成「跟朋友講話」版；沒寫就和以前完全一樣 */
export const DELIVERIES = ["chat"];
const one = (s) => String(s ?? "").replace(/\s+/g, " ").replace(/[。．.]+$/, "").trim();
export function buildDirection(profile) {
  const L = ["以下是給配音員的說明，不要念出來，只念 TRANSCRIPT 之後的內容。", "", "# AUDIO PROFILE", `${one(profile.persona)}。`, ...(profile.scene ? ["", "# SCENE", `${one(profile.scene)}。`] : []), "", "# PERFORMANCE", `Accent: ${ACCENT_TW}`, `Tone: ${one(profile.tone)}。`];
  const chat = profile.delivery === "chat";
  if (chat && Array.isArray(profile.pace)) L.push(`Pacing: 跟朋友講話的速度，平均大約每秒 ${profile.pace[0]} 到 ${profile.pace[1]} 個字。想到哪講到哪：有的地方一口氣帶過去，有的地方想一下才接下去；停頓有長有短，逗號不一定要停。`);
  else if (Array.isArray(profile.pace)) L.push(`Pacing: 像平常講話的速度，大約每秒 ${profile.pace[0]} 到 ${profile.pace[1]} 個字；有快有慢，重點前面留一口氣，句子講完才換氣。`);
  const arc = ARC_KEYS.filter((k) => profile.arc?.[k]).map((k) => `${ARC_WHERE[k]}${one(profile.arc[k])}`);
  if (arc.length) L.push(`Arc: 整篇的情緒依內容走：${arc.join("；")}。`);
  const en = Object.entries(profile.englishTerms ?? {}).map(([k, v]) => `${k}（${one(v)}）`);
  if (chat) L.push(`Articulation: 平常講話的咬字就好，虛字和語助詞輕輕帶過，不用每個字都一樣重；句尾不用每一句都收得很乾淨。英文單字用標準美式發音完整念出來，念完自然接回中文。${en.length ? `特別注意：${en.join("、")}。` : ""}`);
  else L.push(`Articulation: 每個字都講得出來，但是像平常講話，不是朗讀。${ENGLISH_STD}${en.length ? `特別注意：${en.join("、")}。` : ""}`);
  if (profile.avoid?.length) L.push(`Avoid: ${profile.avoid.map(one).join("、")}。`);
  return L.join("\n");
}
export const takePrompt = (profile, text) => `${buildDirection(profile)}\n\n# TRANSCRIPT\n${text}`;

export function profileIssues(profile) {
  const out = [];
  if (profile._unknown) return [`voice.profile 的預設檔「${profile.preset}」不存在（${PRESET_NAMES.join("／")}）`];
  for (const k of ["persona", "tone"]) if (typeof profile[k] !== "string" || !profile[k].trim()) out.push(`voice.profile 缺 ${k}`);
  if (!GENDERS.includes(profile.gender)) out.push(`voice.profile.gender 要是 ${GENDERS.join("／")}`);
  if (profile.accent !== "台灣華語") out.push("voice.profile.accent 固定寫「台灣華語」");
  if (!Array.isArray(profile.pace) || profile.pace.length !== 2 || profile.pace.some((v) => typeof v !== "number") || profile.pace[0] >= profile.pace[1] || profile.pace[0] < 3 || profile.pace[1] > 5.5) out.push("voice.profile.pace 要是 [下限, 上限]（音節/秒，3–5.5 之間）");
  for (const k of ARC_KEYS) if (typeof profile.arc?.[k] !== "string" || !profile.arc[k].trim()) out.push(`voice.profile.arc 缺「${k}」（起／承／轉／合各一句情緒指示）`);
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
