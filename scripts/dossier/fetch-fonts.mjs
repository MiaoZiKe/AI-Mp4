// node scripts/dossier/fetch-fonts.mjs [slug]：下載檔案室式（stage: "dossier"）用的襯線字型子集到 public/fonts/dossier/（不 commit）。
// Noto Serif TC（SIL OFL 1.1）：900＝大標、600＝左上字標與文件標題。從 Google Fonts 抓，只抓 script.json 用到的字（做法同 scripts/ai-sketch/fetch-fonts.mjs）。
// 內文、字幕、出處用專案原本的 Noto Sans TC（public/fonts/ 的鏡像）。改了畫面上的字要重跑這支。
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const slug = process.argv[2] ?? "liguligu-jensen-pro";
const script = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "script.json"), "utf8"));
const set = new Set(" ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%，。、？！：；・｜「」（）—–-,.!?:/");
const walk = (v) => { if (typeof v === "string") for (const c of v) set.add(c); else if (v && typeof v === "object") Object.values(v).forEach(walk); };
// 只收會用襯線字排的欄位：封面、各幕 props（大標等）、頻道名
// public/fonts/dossier/ 是所有檔案室片共用的一份子集：收所有 stage "dossier" 的片的字（以前只收一支，做下一支會把上一支的字蓋掉）
const all = fs.readdirSync(path.join(ROOT, "videos")).map((d) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, "videos", d, "script.json"), "utf8")); } catch { return null; } }).filter((x) => x && x.stage === "dossier");
for (const sc of [script, ...all]) { walk(sc.cover); walk(sc.channel); walk(sc.news); for (const s of sc.scenes ?? []) walk(s.props); }
for (const c of "下一集▸留言拿完整資料") set.add(c);
for (const c of "哩股哩股查到底查證截至示意照片非文件原件來源") set.add(c);
set.delete("\n");
const text = [...set].sort().join("");
const dir = path.join(ROOT, "public/fonts/dossier");
const stamp = path.join(dir, "chars.txt");
// --check：不下載，只確認已抓的子集（chars.txt 是上次抓字時存的字表）含本片所有字；缺字或沒抓過就 exit 1 並列出缺字
if (process.argv.includes("--check")) {
  const have = new Set(fs.existsSync(stamp) && fs.existsSync(path.join(dir, "serif-900.woff2")) ? fs.readFileSync(stamp, "utf8") : []);
  const missing = [...set].filter((c) => !have.has(c));
  if (!have.size) { console.log("字型子集不存在（沒抓過）"); process.exit(1); }
  if (missing.length) { console.log(`字型子集缺 ${missing.length} 字：${missing.join("")}`); process.exit(1); }
  console.log(`字型子集已含本片全部 ${set.size} 字`); process.exit(0);
}
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
fs.mkdirSync(dir, { recursive: true });
const curl = (args) => execFileSync("curl", ["-sS", "--fail", "--retry", "3", "-A", UA, ...args]);
for (const [w, file] of [[900, "serif-900.woff2"], [600, "serif-600.woff2"]]) {
  const css = curl([`https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@${w}&text=${encodeURIComponent(text)}`]).toString();
  const urls = [...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]);
  if (urls.length !== 1) throw new Error(`Noto Serif TC ${w}: 預期 1 個子集，拿到 ${urls.length} 個`);
  curl([urls[0], "-o", path.join(dir, file)]);
  console.log(`✔ public/fonts/dossier/${file}（${[...text].length} 字，${fs.statSync(path.join(dir, file)).size} bytes）`);
}
fs.writeFileSync(path.join(dir, "chars.txt"), text);
fs.writeFileSync(stamp, text);
