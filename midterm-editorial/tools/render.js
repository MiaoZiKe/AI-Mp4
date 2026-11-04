// Deterministic renderer: seeks the GSAP master timeline at fixed 1/fps steps and pipes frames to ffmpeg.
// usage: node tools/render.js video  <out.mp4> [--scale 0.5] [--fps 30] [--from s] [--to s]
//        node tools/render.js stills <dir> t1 t2 ...        (PNG at full res)
//        node tools/render.js cues   <out.json>             (exports cue table)
const http = require("http"), fs = require("fs"), path = require("path"), { spawn } = require("child_process");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".ttf": "font/ttf", ".png": "image/png" };
function serve() {
  return new Promise(res => {
    const srv = http.createServer((q, r) => {
      const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p)) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
    }).listen(0, "127.0.0.1", () => res(srv));
  });
}
(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  const opt = (k, d) => { const i = rest.indexOf("--" + k); return i >= 0 ? parseFloat(rest[i + 1]) : d; };
  const scale = opt("scale", 1), fps = opt("fps", 30);
  const srv = await serve(); const port = srv.address().port;
  const browser = await chromium.launch({ args: ["--disable-gpu", "--font-render-hinting=none"] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
  page.on("console", m => { if (m.type() === "warning" || m.type() === "error") console.error("[page]", m.text()); });
  await page.goto(`http://127.0.0.1:${port}/src/index.html`);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  const total = await page.evaluate(() => window.TOTAL);
  if (mode === "cues") { fs.writeFileSync(out, JSON.stringify(await page.evaluate(() => window.CUES), null, 1)); }
  else if (mode === "stills") {
    fs.mkdirSync(out, { recursive: true });
    for (const t of rest.filter(x => !x.startsWith("--")).map(Number)) {
      await page.evaluate(t => window.seek(t), t);
      await page.screenshot({ path: path.join(out, `t${t.toFixed(2).padStart(6, "0")}.png`) });
    }
  } else {
    const from = opt("from", 0), to = Math.min(opt("to", total), total);
    const n = Math.round((to - from) * fps);
    const W = Math.round(1080 * scale), H = Math.round(1920 * scale);
    const ff = spawn("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
      "-vf", `scale=${W}:${H}:flags=lanczos,format=yuv420p`, "-c:v", "libx264", "-preset", scale < 1 ? "veryfast" : "slow", "-crf", "18", "-r", String(fps), out], { stdio: ["pipe", "inherit", "inherit"] });
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const t = from + i / fps;
      await page.evaluate(t => window.seek(t), t);
      const buf = await page.screenshot({ type: "jpeg", quality: 94 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
      if (i % 150 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on("close", r));
    console.log("frames", n, "fps", fps, "dur", (n / fps).toFixed(3));
  }
  await browser.close(); srv.close();
})();
