// node scripts/three/card-overlap.mjs <slug> [--only=<kind 片段>] [--json] [--shots=<資料夾>]：HUD 片 2D 疊層（示意卡）的字與圖重疊檢查。不開 3D、不渲染影片。
// 2026/11/20 使用者看量測檢測（tech-metrology s2 met-layer）：「這邊會出現這樣覆蓋問題 修復並避免後續發生」（「金屬二」標籤壓到中間分隔線、上層色塊貼著標題）。
// 做法：script.json 的每個疊層（props.overlay，全部 type：section 各 kind［Hud.tsx 內建與 HudMet／HudImplant／HudCmp／HudDep／HudEtch／HudPkg… 各 Hud*.tsx 的示意卡］、
//   stamp、legend、compare、bars、card…，凡是 Hud.tsx 的 HudOverlays 會畫的都算），在出場＋12 幀、每個 cue（疊層裡任何巢狀 at）＋12 幀、結束前 2 幀，
//   用 react-dom/server 輸出成靜態 HTML，以預裝的 Playwright chromium 載入（字型用 public/fonts 的本地鏡像，和 render 同一批子集），量每段字的實際墨跡框：
//   (a) 字壓字：兩段字的墨跡框重疊
//   (b) 字壓線：字被有描邊的線段／外框（SVG line、path、polyline、polygon、有 stroke 的 rect／circle／ellipse，HTML 的 border 邊）穿過；
//       只有填色、沒有描邊的色塊視為底色，不算；卡片本身的外框歸 (c)
//   (c) 字超出卡片（卡片 overflow:hidden 會被裁掉）、或被標題／右上小字擋到
//   (d) 卡片標題（與右上小字）壓到內容圖形（不含整張卡的底圖）：相交或間距 <4px 是 error（11/22 起，成片比靜態頁多壓 1–3px）；4–6px 給 warning
//   (f) 字壓色條（<20px 的實心長條，相交或間距 <4px）、(g) 字貼圖形（字在實心圖形外、間距 <4px）＝error；(h) 字離卡片內緣 <4px＝warning（11/22 起）
//   容許 2px。不算：透明度 <0.05 的元素（還沒出場）。不涵蓋：3D 標籤與蓋章壓模型、兩張疊層互壓（layout-check.mjs 管）、字幕卡、片尾卡、HudArt 的縮放圖。
// 結果寫 out/<slug>/card-overlap.json；有 error 時結束碼 1。validate-three.mjs 對有 hud 的片自動跑。
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { expandModel, expandScript } from "./parts/index.mjs";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const args = process.argv.slice(2), slug = args.find((a) => !a.startsWith("--"));
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=");
const asJson = args.includes("--json"), only = opt("only"), shotDir = opt("shots");
if (!slug) { console.error("用法：node scripts/three/card-overlap.mjs <slug> [--only=met-layer] [--shots=<資料夾>]"); process.exit(2); }
const vd = path.join(ROOT, "videos", slug);
const script = JSON.parse(fs.readFileSync(path.join(vd, "script.json"), "utf8"));
const tp = path.join(vd, "timeline.json"), mp = path.join(vd, "model.json");
script.timeline = fs.existsSync(tp) ? JSON.parse(fs.readFileSync(tp, "utf8")) : null;
if (!script.model && fs.existsSync(mp)) script.model = JSON.parse(fs.readFileSync(mp, "utf8"));
if (script.model) { script.model = expandModel(script.model); script.scenes = expandScript(script, script.model).scenes; }
const done = (r, code = 0) => { if (asJson) console.log(JSON.stringify(r)); process.exit(code); };
if (!script.hud || !script.timeline || !script.model) { const r = { issues: [], skipped: !script.hud ? "沒有 hud" : !script.timeline ? "沒有 timeline.json" : "沒有 model" }; if (!asJson) console.log(`略過：${r.skipped}`); done(r); }

// 打包：字型模組換成空殼（只要字型名字，和 theme.ts 的 FONT_ZH 同名，瀏覽器端用本地鏡像的 @font-face）；three 相關照打包（不會被執行到畫布）
const outDir = path.join(ROOT, "out", ".bundle", `cardov-${process.pid}`);
fs.mkdirSync(outDir, { recursive: true });
process.on("exit", () => fs.rmSync(outDir, { recursive: true, force: true }));
const outfile = path.join(outDir, "entry.mjs");
await build({
  entryPoints: [path.join(ROOT, "scripts/three/card-overlap-entry.tsx")], bundle: true, platform: "node", format: "esm", outfile, logLevel: "error",
  jsx: "automatic", loader: { ".json": "json" }, external: ["three", "@remotion/three", "@react-three/fiber", "@react-three/drei"],
  plugins: [{ name: "stub-fonts", setup(b) {
    b.onResolve({ filter: /^@remotion\/google-fonts\// }, (a) => ({ path: a.path, namespace: "stub" }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, (a) => { const fam = /NotoSansTC/.test(a.path) ? "Noto Sans TC" : /Inter/.test(a.path) ? "Inter" : "x";
      return { contents: `export const loadFont = () => ({ fontFamily: ${JSON.stringify(fam)}, waitUntilDone: () => Promise.resolve() }); export const getInfo = () => ({ fontFamily: ${JSON.stringify(fam)} });`, loader: "js" }; });
  } }],
  banner: { js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" },
});
const { shots, schematicRect } = await import(pathToFileURL(outfile).href);
const list = shots(script, only);
const schem = schematicRect(script);

// 頁面：每個（疊層, 幀）一格 1080×1920，直向排下去
const fontsDir = path.join(ROOT, "public", "fonts"), mfp = path.join(fontsDir, "manifest.json");
const faces = fs.existsSync(mfp) ? JSON.parse(fs.readFileSync(mfp, "utf8")).map((f) => `@font-face{font-family:"${f.family}";font-weight:${f.weight};src:url("${pathToFileURL(path.join(ROOT, "public", f.file)).href}") format("woff2");unicode-range:${f.unicodeRange};}`).join("\n") : "";
if (!faces) console.error("⚠ 沒有 public/fonts/manifest.json（先跑 npm run fonts）：字寬會和成片不同");
const page = `<!doctype html><html><head><meta charset="utf-8"><style>${faces}
html,body{margin:0;padding:0;background:${"#fff"}}.scr{position:relative;width:1080px;height:1920px;overflow:hidden}</style></head><body>
${list.map((s, j) => `<div class="scr" id="s${j}">${s.html}</div>`).join("\n")}</body></html>`;
const pageFile = path.join(outDir, "page.html");
fs.writeFileSync(pageFile, page);

const { chromium } = require("playwright");
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await pg.goto(pathToFileURL(pageFile).href);
await pg.evaluate(async () => { await document.fonts.ready; await new Promise((r) => setTimeout(r, 50)); await document.fonts.ready; });
const fontsOk = await pg.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family).filter((v, i, a) => a.indexOf(v) === i));

const meta = list.map((s) => ({ title: s.title ?? null, tag: s.tag ?? null }));
const found = await pg.evaluate(({ meta, TOL, NEAR, TOUCH, GAP, schem }) => {
  const res = [];
  const effOp = (el, stop) => { let o = 1; for (let e = el; e && e !== stop; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return 0; o *= Number(cs.opacity); } return o; };
  const ctx = document.createElement("canvas").getContext("2d");
  const inter = (a, b) => [Math.min(a.r, b.r) - Math.max(a.l, b.l), Math.min(a.b, b.b) - Math.max(a.t, b.t)];
  const R = (r) => ({ l: r.left, t: r.top, r: r.right, b: r.bottom });
  const rnd = (r) => [r.l, r.t, r.r, r.b].map((v) => Math.round(v));
  document.querySelectorAll(".scr").forEach((scr, j) => {
    const so = scr.getBoundingClientRect(), loc = (r) => ({ l: r.l - so.left, t: r.t - so.top, r: r.r - so.left, b: r.b - so.top });
    const { title, tag } = meta[j];
    for (const root of [...scr.children]) {
      if (effOp(root, scr) < 0.05) continue;
      const cr = R(root.getBoundingClientRect()), rcs = getComputedStyle(root);
      const inner = { l: cr.l + parseFloat(rcs.borderLeftWidth), t: cr.t + parseFloat(rcs.borderTopWidth), r: cr.r - parseFloat(rcs.borderRightWidth), b: cr.b - parseFloat(rcs.borderBottomWidth) };
      const cardArea = (cr.r - cr.l) * (cr.b - cr.t);
      // 標題與右上小字：卡片裡字一模一樣、不在 svg 裡的 HTML 元素
      const heads = [...root.querySelectorAll("div,span")].filter((e) => !e.closest("svg") && e.children.length === 0 && [title, tag].includes(e.textContent.trim()) && e.textContent.trim()).map((e) => ({ el: e, name: e.textContent.trim() === title ? "標題" : "右上小字", box: R(e.getBoundingClientRect()) }));
      // 字：SVG <text>（整段）與 HTML 文字節點；框＝墨跡框（canvas measureText 的 actualBoundingBox，換算到畫面縮放）
      const texts = [];
      const inkOf = (el, rects, str) => {
        const cs = getComputedStyle(el);
        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const mm = ctx.measureText(str), fA = mm.fontBoundingBoxAscent, fD = mm.fontBoundingBoxDescent, aA = mm.actualBoundingBoxAscent, aD = mm.actualBoundingBoxDescent;
        return rects.filter((r) => r.width > 0 && r.height > 0).map((r) => { const k = r.height / (fA + fD || 1); return { l: r.left, r: r.right, t: r.top + (fA - aA) * k, b: r.top + (fA + aD) * k }; });
      };
      for (const el of root.querySelectorAll("text")) {
        const str = el.textContent.trim(); if (!str) continue;
        const op = effOp(el, scr); if (op < 0.05) continue;
        // SVG 字：在自己的座標系量（getBBox＝字型框），換成墨跡框之後再轉到畫面（旋轉、縮放的蓋章字不會被放大成整個外接框）
        const bb = el.getBBox(), M = el.getScreenCTM(), cs = getComputedStyle(el);
        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const mm = ctx.measureText(str), kk = bb.height / ((mm.fontBoundingBoxAscent + mm.fontBoundingBoxDescent) || 1);
        const t0 = bb.y + (mm.fontBoundingBoxAscent - mm.actualBoundingBoxAscent) * kk, t1 = bb.y + (mm.fontBoundingBoxAscent + mm.actualBoundingBoxDescent) * kk;
        const cn = [[bb.x, t0], [bb.x + bb.width, t0], [bb.x, t1], [bb.x + bb.width, t1]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(M));
        if (bb.width > 0) texts.push({ el, str, op, M, inv: M.inverse(), lbox: { l: bb.x, r: bb.x + bb.width, t: t0, b: t1 }, box: { l: Math.min(...cn.map((q) => q.x)), r: Math.max(...cn.map((q) => q.x)), t: Math.min(...cn.map((q) => q.y)), b: Math.max(...cn.map((q) => q.y)) } });
      }
      const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        const str = n.textContent.trim(); if (!str || n.parentElement.closest("svg")) continue;
        const el = n.parentElement, op = effOp(el, scr); if (op < 0.05) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const box of inkOf(el, [...rg.getClientRects()], str)) texts.push({ el, str, box, op, head: heads.find((h) => h.el === el)?.name });
      }
      // 被後畫的實心圖形蓋住的部分看不到，不算（例如導線穿過「矽」那塊色塊底下、磷原子蓋掉原本的矽）：同一張卡裡、文件順序在後面、不透明填色的 SVG 圖形
      const fillers = [...root.querySelectorAll("rect,path,circle,ellipse,polygon")].filter((g) => { const cs = getComputedStyle(g); return cs.fill !== "none" && !/,\s*0\)$/.test(cs.fill) && Number(cs.fillOpacity) >= 0.8; });
      const common = (a, b) => { let e = a; while (e && !e.contains(b)) e = e.parentElement; return e; };
      const covered = (el, x, y) => fillers.some((g) => { if (g === el || g.contains(el) || !(el.compareDocumentPosition(g) & Node.DOCUMENT_POSITION_FOLLOWING) || effOp(g, common(g, el)) < 0.8) return false; const M = g.getScreenCTM(); if (!M) return false; const q = new DOMPoint(x, y).matrixTransform(M.inverse()); try { return g.isPointInFill(q); } catch { return false; } });
      // 點是否落在字的墨跡框裡（四邊各內縮 pad）；SVG 字在自己的座標系判斷（旋轉的字不會用外接框）
      const inInk = (T, x, y, pad) => { if (!T.inv) return x > T.box.l + pad && x < T.box.r - pad && y > T.box.t + pad && y < T.box.b - pad; const q = new DOMPoint(x, y).matrixTransform(T.inv), b = T.lbox; return q.x > b.l + pad && q.x < b.r - pad && q.y > b.t + pad && q.y < b.b - pad; };
      const inkPts = (T) => { const out = []; const b = T.inv ? T.lbox : T.box; for (let u = 0; u <= 4; u++) for (let v = 0; v <= 2; v++) { const x = b.l + 1 + ((b.r - b.l - 2) * u) / 4, y = b.t + 1 + ((b.b - b.t - 2) * v) / 2; if (T.inv) { const q = new DOMPoint(x, y).matrixTransform(T.M); out.push([q.x, q.y]); } else out.push([x, y]); } return out; };
      const push = (level, kind, msg, box) => res.push({ j, level, kind, msg, box: box && rnd(loc(box)) });
      // (i) 示意卡 vs 右下示意標籤：卡片外框和標籤字框相交（超過 TOL）＝error（2026/11/27）；只算卡片自己的外框，標籤在畫面座標
      if (schem && effOp(root, scr) >= 0.05) {
        const sr = { l: schem.l + so.left, r: schem.r + so.left, t: schem.t + so.top, b: schem.b + so.top }, [w, h] = inter(cr, sr);
        if (w > TOL && h > TOL) push("error", "壓到示意標籤", `示意卡外框（下緣 y${Math.round(cr.b - so.top)}）壓到右下「示意」標籤 ${Math.round(w)}×${Math.round(h)}px（卡下緣要 ≤ y${Math.round(schem.t)}）`, cr);
      }
      // 被後畫的實心圖形整段蓋掉的字看不到（例如磷原子蓋掉原本那顆矽的「Si」）→ 不算；只蓋掉一部分 → 字被蓋住
      for (let a = texts.length - 1; a >= 0; a--) { const T = texts[a]; if (!T.el.closest("svg")) continue; const pts = inkPts(T), n = pts.filter(([x, y]) => covered(T.el, x, y)).length;
        if (n === pts.length) texts.splice(a, 1); else if (n > 0) push("error", "字被蓋住", `「${T.str}」有一部分被後畫的圖形蓋住`, T.box); }
      // (a) 字壓字
      for (let a = 0; a < texts.length; a++) for (let b = a + 1; b < texts.length; b++) {
        const A = texts[a], B = texts[b]; if (A.el === B.el && A.str === B.str) continue;
        const [w, h] = inter(A.box, B.box);
        if (w > TOL && h > TOL) push("error", "字壓字", `「${A.str}」和「${B.str}」重疊 ${Math.round(w)}×${Math.round(h)}px`, { l: Math.max(A.box.l, B.box.l), t: Math.max(A.box.t, B.box.t), r: Math.min(A.box.r, B.box.r), b: Math.min(A.box.b, B.box.b) });
      }
      // (b) 字壓線：描邊取樣點（每 3px）落進字的墨跡框（四邊各內縮 TOL）
      const strokes = [];
      for (const g of root.querySelectorAll("line,path,polyline,polygon,rect,circle,ellipse")) {
        const cs = getComputedStyle(g); if (cs.stroke === "none" || !cs.stroke || parseFloat(cs.strokeWidth) <= 0 || /rgba\(.*,\s*0\)$/.test(cs.stroke)) continue;
        const op = effOp(g, scr); if (op < 0.05 || typeof g.getTotalLength !== "function") continue;
        const M = g.getScreenCTM(); if (!M) continue;
        let len = 0; try { len = g.getTotalLength(); } catch { continue; }
        if (!(len > 0)) continue;
        const sw = parseFloat(cs.strokeWidth) * Math.hypot(M.a, M.b) / 2, pts = [];
        for (let d = 0; d <= len; d += 3) { let p; try { p = g.getPointAtLength(d); } catch { break; } const q = new DOMPoint(p.x, p.y).matrixTransform(M); pts.push([q.x, q.y]); }
        strokes.push({ el: g, name: g.tagName, pts, sw });
      }
      for (const e of root.querySelectorAll("*")) {
        if (e === root || e.closest("svg")) continue;
        const cs = getComputedStyle(e), r = R(e.getBoundingClientRect()), op = effOp(e, scr); if (op < 0.05) continue;
        const sides = [["Top", [[r.l, r.t], [r.r, r.t]]], ["Bottom", [[r.l, r.b], [r.r, r.b]]], ["Left", [[r.l, r.t], [r.l, r.b]]], ["Right", [[r.r, r.t], [r.r, r.b]]]];
        for (const [sd, [p0, p1]] of sides) {
          const bw = parseFloat(cs[`border${sd}Width`]); if (!(bw > 0) || cs[`border${sd}Style`] === "none") continue;
          const n = Math.max(1, Math.ceil(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 3)), pts = [];
          for (let i = 0; i <= n; i++) pts.push([p0[0] + ((p1[0] - p0[0]) * i) / n, p0[1] + ((p1[1] - p0[1]) * i) / n]);
          strokes.push({ el: e, name: `邊框(${sd})`, pts, sw: 0 });
        }
      }
      for (const T of texts) for (const S of strokes) {
        if (S.el === T.el) continue;
        const hitp = S.pts.find(([x, y]) => inInk(T, x, y, TOL - S.sw) && !(S.el.closest("svg") && covered(S.el, x, y)));
        if (hitp) push("error", "字壓線", `「${T.str}」被一條${S.name === "line" ? "線" : S.name.startsWith("邊框") ? S.name : `線段（${S.name}）`}穿過（約 x${Math.round(hitp[0] - so.left)} y${Math.round(hitp[1] - so.top)}）`, T.box);
      }
      // (e) 字壓到色塊邊緣：字的墨跡框和一塊實心填色圖形（寬高都 ≥20px，排除會跑動的小光點）部分重疊——整段字落在色塊裡（色塊當底）或完全在外面都不算
      for (const T of texts) for (const g of fillers) {
        if (g.contains(T.el) || effOp(g, scr) < 0.3) continue;
        const r = R(g.getBoundingClientRect()); if (r.r - r.l < 20 || r.b - r.t < 20 || (r.r - r.l) * (r.b - r.t) >= 0.6 * cardArea) continue;
        const [w, h] = inter(T.box, r); if (!(w > TOL && h > TOL)) continue;
        const M = g.getScreenCTM(); if (!M) continue; const Mi = M.inverse();
        const pts = inkPts(T);
        const vis = pts.filter(([x, y]) => !covered(g, x, y)); if (!vis.length) continue; // 色塊這一處被後畫的實心圖形（例如字自己的底）蓋住就看不到邊緣
        const ins = vis.map(([x, y]) => { const q = new DOMPoint(x, y).matrixTransform(Mi); try { return g.isPointInFill(q); } catch { return false; } });
        const n = ins.filter(Boolean).length; if (n === 0 || n === ins.length) continue;
        push("error", "字壓色塊", `「${T.str}」一半壓在色塊（${g.tagName}）上、一半在外面`, T.box);
      }
      // (f) 字壓色條：寬或高 <20px 的實心長條（頂線、底板線、溫度計管…），(e) 不管這種細條；字的墨跡框和它相交或間距 <GAP 就算（11/22 etch-ion「離子（帶正電）」貼在電漿框頂線上）
      // (g) 字貼圖形：字整段在一塊實心圖形（≥20px）外面、但墨跡框往外擴 GAP 後碰到它（11/22 etch-cold 溫度計的球碰到「−70°」字頂）
      for (const T of texts) {
        if (T.inv && Math.abs(T.M.b) > 0.01) continue; // 旋轉的字（蓋章）不查貼邊
        const b = T.box, ex = { l: b.l - GAP, t: b.t - GAP, r: b.r + GAP, b: b.b + GAP };
        for (const g of fillers) {
          if (g.contains(T.el) || T.el.contains(g) || effOp(g, scr) < 0.3) continue;
          const r = R(g.getBoundingClientRect()), gw = r.r - r.l, gh = r.b - r.t; if (Math.max(gw, gh) < 20 || gw * gh >= 0.6 * cardArea) continue;
          const [w0, h0] = inter(ex, r); if (!(w0 > 0 && h0 > 0)) continue;
          const M = g.getScreenCTM(); if (!M) continue; const Mi = M.inverse();
          const inF = (x, y) => { const q = new DOMPoint(x, y).matrixTransform(Mi); try { return g.isPointInFill(q) && !covered(g, x, y); } catch { return false; } };
          const pts = inkPts(T), nIn = pts.filter(([x, y]) => inF(x, y)).length;
          if (Math.min(gw, gh) < 20) {
            if (nIn === pts.length && pts.length) continue; // 字整段在色條上（色條當底）
            const ring = []; for (let x = ex.l; x <= ex.r; x += 3) ring.push([x, ex.t], [x, ex.b], [x, (b.t + b.b) / 2]); for (let y = ex.t; y <= ex.b; y += 3) ring.push([ex.l, y], [ex.r, y]);
            if (nIn > 0 || ring.some(([x, y]) => inF(x, y))) push("error", "字壓色條", `「${T.str}」${nIn > 0 ? "壓在" : `離不到 ${GAP}px 就碰到`}一條實心長條（${g.tagName} ${Math.round(gw)}×${Math.round(gh)}）`, T.box);
          } else if (nIn === 0) {
            const ring = []; for (let x = ex.l; x <= ex.r; x += 3) ring.push([x, ex.t], [x, ex.b]); for (let y = ex.t; y <= ex.b; y += 3) ring.push([ex.l, y], [ex.r, y]);
            if (ring.some(([x, y]) => inF(x, y))) push("error", "字貼圖形", `「${T.str}」和實心圖形（${g.tagName}）間距不到 ${GAP}px`, T.box);
          }
        }
      }
      // (h) 字貼卡片邊：墨跡框離卡片內緣 <GAP（還沒超出）
      for (const T of texts) { const d = Math.min(T.box.l - inner.l, inner.r - T.box.r, T.box.t - inner.t, inner.b - T.box.b); if (d >= -TOL && d < GAP) push("warn", "字貼卡片邊", `「${T.str}」離卡片邊只有 ${Math.max(0, Math.round(d))}px（建議 ≥${GAP}px）`, T.box); }
      // (c) 字超出卡片、被標題／右上小字擋到
      for (const T of texts) {
        const o = Math.max(inner.l - T.box.l, T.box.r - inner.r, inner.t - T.box.t, T.box.b - inner.b);
        if (o > TOL) push("error", "超出卡片", `「${T.str}」超出卡片邊界 ${Math.round(o)}px（會被裁掉）`, T.box);
        if (T.head) continue;
        for (const hd of heads) { if (hd.el.contains(T.el)) continue; const [w, h] = inter(T.box, hd.box); if (w > TOL && h > TOL) push("error", "被標題擋到", `「${T.str}」被${hd.name}「${hd.el.textContent.trim()}」擋到 ${Math.round(w)}×${Math.round(h)}px`, T.box); }
      }
      // (d) 標題壓到內容圖形（SVG 圖形與有底色的 HTML 塊；面積 ≥ 卡片 60% 的是底圖，不算）；貼著（0–NEAR px）給 warning
      const shapes = [];
      for (const g of root.querySelectorAll("rect,path,circle,ellipse,line,polyline,polygon,image")) {
        if (effOp(g, scr) < 0.05) continue; const cs = getComputedStyle(g); if ((cs.fill === "none" || /,\s*0\)$/.test(cs.fill)) && (cs.stroke === "none" || !cs.stroke)) continue;
        const r = R(g.getBoundingClientRect()); if ((r.r - r.l) * (r.b - r.t) >= 0.6 * cardArea) continue; shapes.push({ el: g, r, name: g.tagName });
      }
      for (const e of root.querySelectorAll("div")) {
        if (e === root || e.closest("svg") || heads.some((h) => h.el === e || e.contains(h.el)) || effOp(e, scr) < 0.05) continue;
        const cs = getComputedStyle(e); if (cs.backgroundColor === "rgba(0, 0, 0, 0)" || cs.backgroundColor === "transparent") continue;
        const r = R(e.getBoundingClientRect()); if ((r.r - r.l) * (r.b - r.t) >= 0.6 * cardArea) continue; shapes.push({ el: e, r, name: "色塊" });
      }
      for (const hd of heads) for (const S of shapes) {
        const [w, h] = inter(hd.box, S.r);
        // 2026/11/22 起：標題框和內容框（膠囊、色塊、圖）相交或貼著（間距 < TOUCH）一律 error。靜態頁和 Remotion 成片會差 1–3px（tech-icdesign ic-who 這裡量 0px、成片實際壓到 3px），
        // 所以不能再用 TOL 放過。Andy 原話：「這邊發生重疊 需要避免以後繼續發生」。
        if (w > TOL && h > -TOUCH) push("error", "標題壓圖", `${hd.name}「${hd.el.textContent.trim()}」${h > 0 ? `壓到內容圖形（${S.name}）${Math.round(w)}×${Math.round(h)}px` : `和內容圖形（${S.name}）只差 ${Math.round(-h)}px（成片會壓到，至少留 ${TOUCH}px）`}`, S.r);
        else if (w > TOL && h > -NEAR) push("warn", "貼著標題", `內容圖形（${S.name}）和${hd.name}「${hd.el.textContent.trim()}」只差 ${Math.max(0, Math.round(-h))}px（建議 ≥${NEAR}px）`, S.r);
      }
    }
  });
  return res;
}, { meta, TOL: 2, NEAR: 6, TOUCH: 4, GAP: 4, schem });
if (shotDir) {
  fs.mkdirSync(shotDir, { recursive: true });
  for (let j = 0; j < list.length; j++) {
    const s = list[j], el = await pg.$(`#s${j}`);
    await el.screenshot({ path: path.join(shotDir, `${String(s.i).padStart(2, "0")}-${s.kind ?? s.type}-f${s.frame}.png`) });
  }
}
await browser.close();

// 同一張卡、同一種問題、同一段字只報一次（記下出現在哪些幀）
const merged = new Map();
for (const r of found) {
  const s = list[r.j], key = `${s.i}|${r.kind}|${r.msg.replace(/\d+×\d+px|約 x\d+ y\d+|\d+px/g, "")}`;
  const e = merged.get(key) ?? { level: r.level, kind: r.kind, overlay: s.i, type: s.type, ovKind: s.kind, title: s.title, msg: r.msg, box: r.box, frames: [] };
  if (!e.frames.includes(s.frame)) e.frames.push(s.frame);
  if (r.level === "error") e.level = "error";
  merged.set(key, e);
}
const issues = [...merged.values()];
const res = { slug, issues, stats: { overlays: new Set(list.map((s) => s.i)).size, shots: list.length, fonts: fontsOk, kinds: [...new Set(list.map((s) => s.kind ?? s.type))], ranges: Object.values(Object.fromEntries(list.map((s) => [s.i, { overlay: s.i, kind: s.kind ?? s.type, at: s.at, until: s.until }]))) } };
fs.mkdirSync(path.join(ROOT, "out", slug), { recursive: true });
fs.writeFileSync(path.join(ROOT, "out", slug, "card-overlap.json"), JSON.stringify(res, null, 1));
const ne = issues.filter((i) => i.level === "error").length;
if (!asJson) {
  for (const i of issues) console.log(`${i.level === "error" ? "✖" : "⚠"} [${i.kind}] 疊層 #${i.overlay} ${i.ovKind ?? i.type}${i.title ? `「${i.title}」` : ""}：${i.msg}（第 ${i.frames.join("、")} 幀；框 ${JSON.stringify(i.box)}）`);
  console.log(`${ne ? "✖" : "✔"} 示意卡重疊檢查 ${slug}：${ne} error、${issues.length - ne} warning（${res.stats.overlays} 個疊層、${list.length} 個時間點；字型 ${fontsOk.join("／") || "無"}）`);
}
done(res, ne ? 1 : 0);
