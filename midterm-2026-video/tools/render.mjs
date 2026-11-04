// Deterministic frame renderer: Playwright seeks the GSAP timeline frame by frame.
// usage: node tools/render.mjs video [workers]   -> build/video.mp4 (silent)
//        node tools/render.mjs stills t1,t2,...  -> build/stills/t_<t>.png
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)(process.env.PW || 'playwright'); import fs from 'fs'; import path from 'path'; import { spawn } from 'child_process';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const data = { script: JSON.parse(fs.readFileSync(ROOT + '/script.json')), timeline: JSON.parse(fs.readFileSync(ROOT + '/timeline.json')), usmap: JSON.parse(fs.readFileSync(ROOT + '/template/assets/usmap.json')) };
const [mode = 'video', arg] = process.argv.slice(2);
fs.mkdirSync(ROOT + '/build/stills', { recursive: true });
const launch = () => chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text'] });
const browsers = [];
async function newPage(scale = 1) {
  const browser = await launch(); browsers.push(browser);
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  await page.addInitScript(d => { window.__DATA__ = d; }, data);
  await page.goto('file://' + ROOT + '/template/index.html');
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  return page;
}
const fps = data.timeline.fps, N = data.timeline.frames;
if (mode === 'bench') {
  const page = await newPage(); const t0 = Date.now();
  for (let f = 300; f < 330; f++) { await page.evaluate(t => window.seek(t), f / fps); await page.screenshot({ type: 'png' }); }
  console.log('ms/frame', (Date.now() - t0) / 30);
} else if (mode === 'stills') {
  const page = await newPage();
  for (const t of arg.split(',').map(Number)) {
    await page.evaluate(t => window.seek(t), t);
    await page.screenshot({ path: `${ROOT}/build/stills/t_${t.toFixed(2)}.png` });
  }
} else {
  const W = +(arg || 4), chunk = Math.ceil(N / W), parts = [];
  const t0 = Date.now();
  await Promise.all(Array.from({ length: W }, async (_, w) => {
    const a = w * chunk, b = Math.min(N, a + chunk); if (a >= b) return;
    const out = `${ROOT}/build/part${w}.mkv`; parts[w] = out;
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const page = await newPage();
    for (let f = a; f < b; f++) {
      await page.evaluate(t => window.seek(t), f / fps);
      const buf = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (w === 0 && f % 60 === 0) console.log(`frame ${f}/${b} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }));
  fs.writeFileSync(ROOT + '/build/parts.txt', parts.filter(Boolean).map(p => `file '${p}'`).join('\n'));
  await new Promise(r => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', ROOT + '/build/parts.txt', '-c', 'copy', ROOT + '/build/video.mkv'], { stdio: 'inherit' }).on('close', r));
  console.log('done', ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
await Promise.all(browsers.map(b => b.close()));
