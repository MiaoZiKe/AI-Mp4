// node scripts/three/scene-html.mjs <slug>：把 videos/<slug>/model.json 做成一個可以在瀏覽器旋轉的 3D 場景（OrbitControls），
// 寫到 out/<slug>/scene.html。模型資料直接嵌進檔案；three.js 從 unpkg 載入（要有網路）。只做交付用的檢視器，影片渲染不讀它。
// 形狀照 model.ts：slab 用圓角方塊近似、box、cyl（半徑、高，沿厚度方向）；at＝同一零件的複製位置。下方滑桿＝分開程度（0＝組好、1＝爆炸圖）。
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const slug = process.argv[2];
const model = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "model.json"), "utf8"));
const script = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "script.json"), "utf8"));
// 頻道皮膚（script.json 頂層 hudSkin；沒寫＝和以前一樣的顏色）：蓋掉 CSS 變數、背景、格線與模型色票
const SK = script.hudSkin ? (JSON.parse(fs.readFileSync(path.join(ROOT, "src/theme-hud-skins.json"), "utf8"))[script.hudSkin] ?? {}) : {};
const V = { bg: SK.bg ?? "#070B12", line: SK.line ?? "#3FC8DC", amber: SK.amber ?? "#F2A93B", text: SK.text ?? "#E6F1F8", text2: SK.text2 ?? "#8FA6B8", panel: SK.panel ?? "#0B1724", lineSoft: SK.lineSoft ?? "#1E5E6E", grid: SK.grid ?? "#122030" };
if (script.hudSkin && SK.parts) model.palette = { ...model.palette, ...SK.parts };
const sch = script.hud?.schematic ?? { text: "Schematic – not to scale", zh: "示意圖，非實際比例" };
const labelsV1 = { sub: "基板 substrate", fin: "絕緣層 isolation", sheetA: "奈米薄片 nanosheet", sheetB: "奈米薄片 nanosheet", sheetC: "奈米薄片 nanosheet", epi: "源極／汲極 source / drain", gateMain: "閘極 gate", gateSide: "閘極 gate", via: "接點 contact" };
// model.partNames（可省略）：零件 id 的開頭 → 名稱（最長的開頭優先）；沒寫就用上面第一版的對照表。model.viewer.hide：檢視器裡不畫的層（只在運作動畫出現的示意層）
const pn = model.partNames, labels = pn ? Object.fromEntries(model.parts.map((p) => [p.id, Object.entries(pn).sort((a, b) => b[0].length - a[0].length).find(([k]) => String(p.id).startsWith(k))?.[1] ?? p.id])) : labelsV1;
const hide = new Set(model.viewer?.hide ?? []);
const html = `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${(script.title ?? slug).split("（")[0]} 3D 場景</title>
<style>
:root{--bg:${V.bg};--line:${V.line};--amber:${V.amber};--text:${V.text};--text2:${V.text2}}
html,body{margin:0;height:100%;background:var(--bg);color:var(--text);font-family:"Noto Sans TC","PingFang TC",system-ui,sans-serif;overflow:hidden}
#c{position:fixed;inset:0}
.hud{position:fixed;pointer-events:none;font-size:14px;letter-spacing:.04em}
#tl{left:16px;top:14px}#tl b{display:block;font-size:20px;color:var(--line)}
#tr{right:16px;top:14px;text-align:right;color:var(--text2)}
#bt{left:16px;right:16px;bottom:16px;pointer-events:auto;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
input[type=range]{flex:1;min-width:160px;accent-color:var(--amber)}
button{background:transparent;color:var(--line);border:1.5px solid var(--line);padding:6px 14px;font:inherit;cursor:pointer}
#tip{position:fixed;pointer-events:none;background:${V.panel};border:1.5px solid var(--line);padding:4px 10px;font-size:14px;display:none}
</style>
<script type="importmap">{"imports":{"three":"https://unpkg.com/three@0.160.0/build/three.module.js","three/addons/":"https://unpkg.com/three@0.160.0/examples/jsm/"}}</script>
</head><body>
<canvas id="c"></canvas>
<div class="hud" id="tl"><b>${model.name.split("：")[0]}</b>拖曳旋轉・滾輪縮放・指到零件看名稱</div>
<div class="hud" id="tr">${sch.text}<br>${sch.zh}<br>1 單位 ≈ ${model.unit.replace("約 ", "")}</div>
<div class="hud" id="bt"><span>組好</span><input id="ex" type="range" min="0" max="1" step="0.01" value="0.6"><span>爆炸圖</span><button id="rs">重設視角</button></div>
<div id="tip"></div>
<script type="module">
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const M = ${JSON.stringify(model)};
const NAMES = ${JSON.stringify(labels)};
const HIDE = ${JSON.stringify([...hide])};
const col = (c) => M.palette[c] ?? c;
const r = new THREE.WebGLRenderer({ canvas: document.getElementById("c"), antialias: true });
r.setPixelRatio(Math.min(2, devicePixelRatio));
const scene = new THREE.Scene(); scene.background = new THREE.Color("${V.bg}");
const cam = new THREE.PerspectiveCamera(30, 1, 1, 1000);
const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true;
const home = () => { cam.position.set(46, 70, 92); ctl.target.set(0, 0, 0); ctl.update(); };
home();
scene.add(new THREE.HemisphereLight("#cfe8ff", "#1a2230", 1.1));
const key = new THREE.DirectionalLight("#ffffff", 2.2); key.position.set(20, 40, 25); scene.add(key);
const fill = new THREE.DirectionalLight("#7fd6e8", 0.6); fill.position.set(-25, 10, -10); scene.add(fill);
const grid = new THREE.GridHelper(120, 30, "${V.lineSoft}", "${V.grid}"); grid.position.y = -18; scene.add(grid);
// 模型座標：x 寬、y 深、z 厚（往上）；整個轉成 three 的 y 朝上
const root = new THREE.Group(); root.rotation.x = -Math.PI / 2; scene.add(root);
const layerGroups = {};
for (const L of M.layers) { const g = new THREE.Group(); g.userData = L; root.add(g); layerGroups[L.id] = g; }
const mat = (id) => { const d = M.materials[id] ?? {}; return new THREE.MeshStandardMaterial({ color: col(d.color ?? "#888"), roughness: d.rough ?? 0.5, metalness: d.metal ?? 0.2, transparent: (d.opacity ?? 1) < 1, opacity: d.opacity ?? 1 }); };
const pick = [];
for (const p of M.parts) {
  if (HIDE.includes(p.layer)) continue;
  const [a, b, c] = p.size;
  let geo;
  if (p.shape === "cyl") { geo = new THREE.CylinderGeometry(a, a, b, 24); geo.rotateX(Math.PI / 2); }
  else if (p.shape === "slab") geo = new RoundedBoxGeometry(a, b, c, 2, Math.min(p.r ?? 0.2, c / 2 - 0.01, 1));
  else geo = new THREE.BoxGeometry(a, b, c);
  const m = mat(p.mat);
  for (const at of p.at ?? [[0, 0, 0]]) {
    const mesh = new THREE.Mesh(geo, m);
    const pos = p.pos ?? [0, 0, 0];
    mesh.position.set(pos[0] + at[0], pos[1] + at[1], (pos[2] ?? 0) + (at[2] ?? 0));
    mesh.userData.name = NAMES[p.id] ?? p.id;
    layerGroups[p.layer].add(mesh); pick.push(mesh);
  }
}
const gap = M.pose?.gap ?? 3;
const ex = document.getElementById("ex");
const place = () => { const e = Number(ex.value); for (const L of M.layers) layerGroups[L.id].position.z = L.z + L.k * gap * e * 1.4; };
ex.oninput = place; place();
document.getElementById("rs").onclick = home;
const ray = new THREE.Raycaster(), mp = new THREE.Vector2(), tip = document.getElementById("tip");
addEventListener("pointermove", (e) => {
  mp.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(mp, cam);
  const h = ray.intersectObjects(pick)[0];
  if (h) { tip.style.display = "block"; tip.style.left = e.clientX + 14 + "px"; tip.style.top = e.clientY + 10 + "px"; tip.textContent = h.object.userData.name; } else tip.style.display = "none";
});
const size = () => { r.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
addEventListener("resize", size); size();
r.setAnimationLoop(() => { ctl.update(); r.render(scene, cam); });
</script>
</body></html>
`;
const out = path.join(ROOT, "out", slug, "scene.html");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`✔ out/${slug}/scene.html（${(html.length / 1024).toFixed(1)} KB；three.js 0.160.0 從 unpkg 載入）`);
