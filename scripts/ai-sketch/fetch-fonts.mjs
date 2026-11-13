// node scripts/ai-sketch/fetch-fonts.mjs [slug]：下載白板手繪用的手寫字型子集到 public/fonts/sketch/（不 commit）。
// 中文：LXGW WenKai TC 700（霞鶩文楷，SIL OFL 1.1）；英文：Caveat 700（SIL OFL 1.1）。都從 Google Fonts 抓，只抓 script.json 用到的字。
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const slug = process.argv[2] ?? "sample-ai-sketch";
const script = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "script.json"), "utf8"));
const set = new Set(" 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz，。、？！：；｜「」（）《》＋=＝…,.!?:'|+-/");
const walk = (v) => { if (typeof v === "string") for (const c of v) set.add(c); else if (v && typeof v === "object") Object.values(v).forEach(walk); };
walk(script);
for (const c of "來源資料截至白話國際動手做") set.add(c);
set.delete("\n");
const text = [...set].sort().join("");
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const dir = path.join(ROOT, "public/fonts/sketch");
fs.mkdirSync(dir, { recursive: true });
const curl = (args) => execFileSync("curl", ["-sS", "--fail", "--retry", "3", "-A", UA, ...args]);
for (const [family, file, t] of [["LXGW+WenKai+TC:wght@700", "kai.woff2", text], ["Caveat:wght@700", "hand.woff2", [...text].filter((c) => c.charCodeAt(0) < 127).join("")]]) {
  const css = curl([`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(t)}`]).toString();
  const urls = [...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]);
  if (urls.length !== 1) throw new Error(`${family}: 預期 1 個子集，拿到 ${urls.length} 個`);
  curl([urls[0], "-o", path.join(dir, file)]);
  console.log(`✔ public/fonts/sketch/${file}（${[...t].length} 字，${fs.statSync(path.join(dir, file)).size} bytes）`);
}
fs.writeFileSync(path.join(dir, "chars.txt"), text);
