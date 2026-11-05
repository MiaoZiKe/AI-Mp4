const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', headless: true,
    args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--use-webgpu-adapter=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  const t0 = Date.now();
  p.on('console', m => console.log(((Date.now() - t0) / 1000).toFixed(1), m.type(), m.text().slice(0, 300)));
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.goto('http://127.0.0.1:8765/index.html' + (process.argv[2] || ''));
  for (let i = 0; i < 24; i++) { await new Promise(r => setTimeout(r, 5000)); const f = await p.evaluate(() => window.__octo ? __octo.frames() : -1).catch(() => 'eval-timeout'); console.log(((Date.now() - t0) / 1000).toFixed(0) + 's frames', f); if (f > 4) break; }
  await b.close();
})();
