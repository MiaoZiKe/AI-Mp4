// Deterministic frame renderer: serves the project, opens web/index.html in headless Chromium,
// calls window.renderAt(f) for each frame (fixed time step = 1/fps) and screenshots it.
//   node tools/render.js --qa 0,90,300          → qa/frame_00000.png ...
//   node tools/render.js --all --workers 3       → build/frames/00000.jpg ...
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/opt/node-tools/node_modules/playwright'); }
const { chromium } = playwright;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-vsync', '--force-color-profile=srgb'],
});

async function openPage(query = '') {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('pageerror', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('console', m.text()); });
  await page.goto(`http://127.0.0.1:${port}/web/index.html${query}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  return page;
}

async function shoot(page, f, file, type) {
  await page.evaluate(f => window.renderAt(f), f);
  await page.screenshot({ path: file, type, ...(type === 'jpeg' ? { quality: 95 } : {}), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
}

if (args.includes('--cover')) {
  const f = Number(opt('--cover'));
  const page = await openPage('?cover=1');
  fs.mkdirSync(path.join(ROOT, 'output'), { recursive: true });
  await shoot(page, f, path.join(ROOT, 'output/cover.png'), 'png');
  console.log('cover written from frame', f);
} else if (args.includes('--qa')) {
  const frames = opt('--qa').split(',').map(Number);
  const out = path.join(ROOT, opt('--out', 'qa'));
  fs.mkdirSync(out, { recursive: true });
  const page = await openPage();
  for (const f of frames) {
    const file = path.join(out, `frame_${String(f).padStart(5, '0')}.png`);
    const t0 = Date.now();
    await shoot(page, f, file, 'png');
    console.log(file, `${Date.now() - t0}ms`);
  }
} else {
  const page0 = await openPage();
  const meta = await page0.evaluate(() => window.__meta);
  await page0.close();
  const total = meta.frames;
  const start = Number(opt('--start', 0)), end = Number(opt('--end', total));
  const workers = Number(opt('--workers', 3));
  const out = path.join(ROOT, 'build/frames');
  fs.mkdirSync(out, { recursive: true });
  let next = start, done = 0;
  const t0 = Date.now();
  // each worker renders a contiguous block so GSAP seeks move forward
  const per = Math.ceil((end - start) / workers);
  await Promise.all([...Array(workers)].map(async (_, w) => {
    const page = await openPage();
    const a = start + w * per, b = Math.min(end, a + per);
    for (let f = a; f < b; f++) {
      const file = path.join(out, `${String(f).padStart(5, '0')}.jpg`);
      if (!args.includes('--force') && fs.existsSync(file) && fs.statSync(file).size > 10000) { done++; continue; }
      await shoot(page, f, file, 'jpeg');
      done++;
      if (done % 50 === 0) {
        const el = (Date.now() - t0) / 1000;
        console.log(`${done}/${end - start} frames  ${el.toFixed(0)}s  eta ${(el / done * (end - start - done)).toFixed(0)}s`);
      }
    }
    await page.close();
  }));
  console.log('rendered', end - start, 'frames in', ((Date.now() - t0) / 1000).toFixed(0), 's');
}
await browser.close();
server.close();
