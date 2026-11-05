// Usage: node verify.cjs <query> <outPrefix>
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const [query = '', prefix = 'webgpu'] = process.argv.slice(2);
const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true,
    args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--use-webgpu-adapter=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 760 }, deviceScaleFactor: 1 });
  const errors = [], warns = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); if (m.type() === 'warning') warns.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto('http://127.0.0.1:8765/index.html' + query);
  await page.waitForFunction(() => window.__octo && window.__octo.frames() > 5, null, { timeout: 120000 });
  const backend = await page.evaluate(() => window.__octo.backend);
  await sleep(3000);
  const out = n => path.join(__dirname, `${prefix}_${n}.png`);
  await page.screenshot({ path: out('1_initial') });
  const info = await page.evaluate(() => ({ NH: __octo.NH, NN: __octo.NN, fps: document.getElementById('fps').textContent, simT: __octo.simTime(), head: __octo.head() }));
  const T = 1, K = 17, idx = info.NH + T * info.NN + K;
  const p0 = await page.evaluate(i => { const p = __octo.positions(); return [p[i*4], p[i*4+1], p[i*4+2]]; }, idx);
  const s0 = await page.evaluate(i => __octo.project(i), idx);
  await page.mouse.move(s0.x, s0.y);
  await page.mouse.down();
  for (let k = 1; k <= 30; k++) { await page.mouse.move(s0.x + k * 7, s0.y - k * 8); await sleep(40); }
  await sleep(500);
  const pDrag = await page.evaluate(i => { const p = __octo.positions(); return [p[i*4], p[i*4+1], p[i*4+2]]; }, idx);
  await page.screenshot({ path: out('2_dragging') });
  await page.mouse.up();
  await sleep(1000);
  await page.screenshot({ path: out('3_released_1s') });
  const pRel = await page.evaluate(i => { const p = __octo.positions(); return [p[i*4], p[i*4+1], p[i*4+2]]; }, idx);
  // 10 s stability run (with a double-click joy and a head poke in the middle)
  let worst = { nan: 0, maxAbs: 0, maxY: 0 };
  for (let s = 0; s < 10; s++) {
    if (s === 3) { const h = await page.evaluate(() => __octo.project(5)); await page.mouse.dblclick(h.x, h.y); }
    await sleep(1000);
    const st = await page.evaluate(() => { const p = __octo.positions(); let nan = 0, mx = 0, my = 0; for (let i = 0; i < p.length; i += 4) { for (let a = 0; a < 3; a++) { if (!Number.isFinite(p[i+a])) nan++; else mx = Math.max(mx, Math.abs(p[i+a])); } my = Math.max(my, p[i+1]); } return { nan, mx, my }; });
    worst.nan += st.nan; worst.maxAbs = Math.max(worst.maxAbs, st.mx); worst.maxY = Math.max(worst.maxY, st.my);
  }
  const end = await page.evaluate(() => ({ simT: __octo.simTime(), head: __octo.head(), frames: __octo.frames(), fps: document.getElementById('fps').textContent }));
  const pEnd = await page.evaluate(i => { const p = __octo.positions(); return [p[i*4], p[i*4+1], p[i*4+2]]; }, idx);
  const d = (a, b) => Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2]).toFixed(3);
  console.log(JSON.stringify({ backend, startFps: info.fps, endFps: end.fps, simTime: end.simT.toFixed(2), headStart: info.head.c.map(x => +x.toFixed(3)), headEnd: end.head.c.map(x => +x.toFixed(3)),
    tentNode: idx, moveDuringDrag: d(p0, pDrag), offsetAfter1s: d(p0, pRel), offsetAtEnd: d(p0, pEnd), stability: worst, errors, warnings: warns.slice(0, 5) }, null, 1));
  await browser.close();
})().catch(e => { console.error('VERIFY FAILED', e); process.exit(1); });
