import { createRequire } from 'module'; import path from 'path';
const { chromium } = createRequire(import.meta.url)(process.env.PW || 'playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
await p.goto('file://' + ROOT + '/template/cover.html'); await p.waitForFunction(() => window.READY);
await p.screenshot({ path: ROOT + '/output/cover.png' }); await b.close(); console.log('cover ok');
