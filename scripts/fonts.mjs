// 依 @remotion/google-fonts 的字型資訊，把 Noto Sans TC / JetBrains Mono 下載到 public/fonts（已存在則略過）
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createRequire } from "node:module";
import { ROOT } from "./lib.mjs";

const require = createRequire(import.meta.url);
const run = promisify(execFile);
export const FONT_SPECS = [
  { mod: "@remotion/google-fonts/NotoSansTC", dir: "NotoSansTC", weights: ["500", "700", "900"] },
  { mod: "@remotion/google-fonts/JetBrainsMono", dir: "JetBrainsMono", weights: ["400", "700"], subsets: ["latin"] },
];

export const ensureFonts = async () => {
  const jobs = [];
  for (const spec of FONT_SPECS) {
    const info = require(spec.mod).getInfo();
    for (const w of spec.weights) {
      const subsets = info.fonts.normal[w];
      for (const [key, url] of Object.entries(subsets)) {
        if (spec.subsets && !spec.subsets.includes(key)) continue;
        const name = `${w}-${key.replace(/[\[\]]/g, "")}.woff2`;
        const out = path.join(ROOT, "public", "fonts", spec.dir, name);
        if (fs.existsSync(out) && fs.statSync(out).size > 0) continue;
        jobs.push({ url, out });
      }
    }
  }
  if (!jobs.length) return;
  console.log(`▸ 下載字型 ${jobs.length} 個分片…`);
  let i = 0;
  const worker = async () => {
    while (i < jobs.length) {
      const j = jobs[i++];
      fs.mkdirSync(path.dirname(j.out), { recursive: true });
      for (let a = 0; a < 5; a++) {
        try {
          await run("curl", ["-sSfL", "--retry", "3", "-o", j.out, j.url]);
          break;
        } catch (e) {
          if (a === 4) throw e;
          await new Promise((r) => setTimeout(r, 1000 * (a + 1)));
        }
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
};

if (import.meta.url === `file://${process.argv[1]}`) await ensureFonts();
