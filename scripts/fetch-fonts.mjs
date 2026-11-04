// 把 @remotion/google-fonts 用到的字型子集下載到 public/fonts/，並寫出 manifest。
// 用途：在 render 環境的 Chrome 無法直連 fonts.gstatic.com 時（例如有 TLS 攔截代理），改用本地檔案。
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { ROOT } from "./lib.mjs";

const require = createRequire(import.meta.url);
const FONTS = [
  { mod: "@remotion/google-fonts/NotoSansTC", weights: ["400", "700", "900"] },
  { mod: "@remotion/google-fonts/Inter", weights: ["400", "600", "800"], subsets: ["latin", "latin-ext"] },
];
const dir = path.join(ROOT, "public", "fonts");
fs.mkdirSync(dir, { recursive: true });
const manifest = [];
const jobs = [];
for (const f of FONTS) {
  const info = require(f.mod).getInfo();
  for (const w of f.weights) {
    for (const [sub, url] of Object.entries(info.fonts.normal[w])) {
      if (f.subsets && !f.subsets.includes(sub)) continue;
      const file = `${info.importName}-${w}-${sub.replace(/[\[\]]/g, "")}.woff2`;
      manifest.push({ family: info.fontFamily, weight: w, unicodeRange: info.unicodeRanges[sub], file: `fonts/${file}` });
      if (!fs.existsSync(path.join(dir, file))) jobs.push([url, path.join(dir, file)]);
    }
  }
}
// curl 走系統代理與 CA，平行下載
const BATCH = 24;
for (let i = 0; i < jobs.length; i += BATCH) {
  const args = ["-sS", "--fail", "--retry", "3", "-Z"];
  for (const [u, o] of jobs.slice(i, i + BATCH)) args.push(u, "-o", o);
  execFileSync("curl", args, { stdio: "inherit" });
}
fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest));
console.log(`✔ fonts: ${manifest.length} subsets (${jobs.length} downloaded)`);
