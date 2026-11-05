// Auto-fallback check: default headless shell has no navigator.gpu → must switch to WebGL2 by itself.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 900, height: 640 } });
  const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/index.html');
  await p.waitForFunction(() => window.__octo && __octo.frames() > 2, null, { timeout: 300000 });
  const r = await p.evaluate(() => ({ gpu: !!navigator.gpu, backend: __octo.backend, toast: document.getElementById('toast').textContent, shown: getComputedStyle(document.getElementById('toast')).display }));
  console.log(JSON.stringify({ ...r, errors: errs }));
  await b.close();
})();
