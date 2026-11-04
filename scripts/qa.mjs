// node scripts/qa.mjs <slug>：自動品質檢查
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { ROOT, buildProps, getSlug } from "./lib.mjs";

const require = createRequire(import.meta.url);
const slug = getSlug();
const { script, frames } = buildProps(slug);
const research = fs.readFileSync(path.join(ROOT, "videos", slug, "research.md"), "utf8");
const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok, detail });

// 1. 數字與來源一致：字幕與 props 中的數字都要出現在 research.md
const textOf = (o) => (typeof o === "string" ? o : Array.isArray(o) ? o.map(textOf).join(" ") : o && typeof o === "object" ? Object.values(o).map(textOf).join(" ") : String(o ?? ""));
const nums = new Set();
for (const s of script.scenes) {
  for (const m of textOf([s.subtitle_zh, s.props]).matchAll(/\d[\d,.\/]*\d|\d/g)) nums.add(m[0].replace(/,/g, ""));
}
const researchFlat = research.replace(/,/g, "");
const ignore = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "01", "02", "03", "232", "301", "1/3", "2025", "2027", "2028", "2029"]);
const missing = [...nums].filter((n) => !ignore.has(n) && !researchFlat.includes(n));
check("數字皆可在 research.md 找到來源", missing.length === 0, missing.join(", "));

// 2. 尚未確定的部分有標示
const certs = new Set(["已確定", "分析預期", "尚未確定"]);
check("每幕都有確定度標記", script.scenes.every((s) => certs.has(s.certainty)));
const pendingScenes = script.scenes.filter((s) => s.certainty === "尚未確定" || textOf(s.props).includes("尚未確定"));
check("尚未確定的內容有標示（含日期）", pendingScenes.length > 0 && textOf(script.scenes.find((s) => s.component === "Seats")?.props).includes(`截至 ${script.asOf} 尚未確定`), pendingScenes.map((s) => s.id).join(","));
check("每幕有來源（片尾除外）", script.scenes.every((s) => s.component === "End" || s.sources.length > 0));

// 3. 中立、無投資建議
const banned = ["買進", "賣出", "建議買", "必漲", "必跌", "推薦", "抄底", "慘敗", "大勝", "痛擊", "崩盤", "暴跌", "狂", "藍色浪潮", "背叛", "可恥", "好消息", "壞消息"];
const all = script.scenes.map((s) => textOf([s.narration, s.subtitle_zh, s.subtitle_en, s.props])).join(" ");
const hits = banned.filter((w) => all.includes(w));
check("用詞中立、無投資建議字眼", hits.length === 0, hits.join(","));
check("市場幕有「分析師普遍認為」與免責", all.includes("分析師普遍認為") && all.includes("不構成投資建議"));

// 4. 字幕長度（每行 ≤ 14 全形字或可在逗號處斷開）
const fits = (l) => {
  const c = Array.from(l);
  if (c.length <= 14) return true;
  return c.some((ch, i) => "，、：；".includes(ch) && i + 1 <= 15 && c.length - i - 1 <= 15);
};
const longLines = script.scenes.flatMap((s) => s.subtitle_zh).filter((l) => !fits(l));
check("字幕可在兩行內排完", longLines.length === 0, longLines.join(" / "));
const narr = script.scenes.flatMap((s) => s.subtitle_zh.map((l) => Array.from(l.replace(/[，。、：；！？%]/g, "")).length));
check("旁白每句 15–25 字（片尾除外）", script.scenes.filter((s) => s.component !== "End").every((s) => s.subtitle_zh.every((l) => { const n = Array.from(l).length; return n >= 15 && n <= 25; })), narr.join(","));

// 5. 缺字檢查：所有中文字元都在 Noto Sans TC 分片的 unicode-range 內，且字型檔已下載
const info = require("@remotion/google-fonts/NotoSansTC").getInfo();
const ranges = Object.values(info.unicodeRanges).flatMap((r) => r.split(",").map((x) => x.trim().replace(/^U\+/i, "")).map((x) => {
  const [a, b] = x.split("-");
  return [parseInt(a, 16), parseInt(b ?? a, 16)];
}));
const srcText = all + fs.readdirSync(path.join(ROOT, "src"), { recursive: true }).filter((f) => f.endsWith(".tsx")).map((f) => fs.readFileSync(path.join(ROOT, "src", f), "utf8")).join("");
const cjk = new Set([...srcText].filter((ch) => /[　-鿿＀-￯]/.test(ch)));
const uncovered = [...cjk].filter((ch) => { const cp = ch.codePointAt(0); return !ranges.some(([a, b]) => cp >= a && cp <= b); });
check("中文字元皆有字型覆蓋（無方框）", uncovered.length === 0, uncovered.join(""));
const fontFiles = fs.readdirSync(path.join(ROOT, "public/fonts/NotoSansTC")).length;
check("字型分片已下載", fontFiles >= 300, `${fontFiles} files`);

// 6. 結構
check("最後一幕是片尾卡", script.scenes.at(-1).component === "End");
check("幕數 11–12", script.scenes.length >= 11 && script.scenes.length <= 12, String(script.scenes.length));
check("每幕 5–10 秒", frames.every((f) => f >= 150 && f <= 300), frames.map((f) => (f / 30).toFixed(1)).join(","));

// 7. 成品影片
const mp4 = path.join(ROOT, "out", `${slug}.mp4`);
if (fs.existsSync(mp4)) {
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", mp4]).toString());
  const dur = parseFloat(probe.format.duration);
  const v = probe.streams.find((s) => s.codec_type === "video");
  const a = probe.streams.find((s) => s.codec_type === "audio");
  check("影片長度 80–100 秒", dur >= 80 && dur <= 100, `${dur.toFixed(2)}s`);
  check("1080×1920 / 30fps / H.264", v.width === 1080 && v.height === 1920 && v.codec_name === "h264" && v.r_frame_rate === "30/1", `${v.width}x${v.height} ${v.codec_name} ${v.r_frame_rate}`);
  check("有音軌（BGM）", !!a, a?.codec_name ?? "none");
  try {
    execFileSync("ffmpeg", ["-v", "error", "-i", mp4, "-f", "null", "-"], { stdio: "pipe" });
    check("完整解碼無錯誤（可正常播放）", true);
  } catch (e) {
    check("完整解碼無錯誤（可正常播放）", false, String(e.stderr).slice(0, 200));
  }
  const r = spawnVol(mp4);
  check("BGM 平均音量約 -20 dB", r !== null && Math.abs(r + 20) <= 3, `${r} dB`);
} else check("成品影片存在", false, mp4);

function spawnVol(file) {
  const out = execFileSync("bash", ["-c", `ffmpeg -hide_banner -i "${file}" -vn -af volumedetect -f null - 2>&1 | grep mean_volume`]).toString();
  const m = out.match(/mean_volume:\s*(-?[\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

let pass = true;
for (const r of results) {
  if (!r.ok) pass = false;
  console.log(`${r.ok ? "✅" : "❌"} ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
}
console.log(pass ? "\nALL PASSED" : "\nFAILED");
process.exit(pass ? 0 : 1);
