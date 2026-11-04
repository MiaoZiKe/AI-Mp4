// 資料長廊 Data Corridor — a dark, reflective corridor with one geometric data sculpture per point.
// Deterministic: window.renderAt(frame) poses the whole scene + overlay for t = frame / fps.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { setupOverlay } from './overlay.js';

const W = 1080, H = 1920, RS = 0.8;           // 3D is rendered at 80 % and upscaled; text overlay stays at full 1080p
const [script, tl, fontJSON] = await Promise.all([
  fetch('/script.json').then(r => r.json()),
  fetch('/build/timeline.json').then(r => r.json()),
  fetch('/node_modules/three/examples/fonts/helvetiker_bold.typeface.json').then(r => r.json()),
]);
const META = script.meta, C = META.colors, FPS = tl.fps;
const SEGS = script.segments.map((s, i) => ({ ...s, ...tl.segments[i] }));
const ease3 = gsap.parseEase('power3.inOut'), easeOut = gsap.parseEase('power3.out'), backOut = gsap.parseEase('back.out(1.7)');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, d) => clamp((t - a) / d);
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rand = mulberry32(20261103);

// fonts before anything is shown
const allText = JSON.stringify(script) + '0123456789+−-:/.,%≈↑↓｜：、（）@ 資料截至每日財經筆記民主黨共和黨計票中白宮國會追蹤';
await Promise.all(['900', '700', '500'].map(w => document.fonts.load(`${w} 60px "Noto Sans TC"`, allText))
  .concat([document.fonts.load(`800 40px "JetBrains Mono"`, '0123456789/@.abcdefghijklmnopqrstuvwxyz MIDTERMSUAY'),
           document.fonts.load(`500 40px "JetBrains Mono"`, '0123456789/@.abcdefghijklmnopqrstuvwxyz')]));
await document.fonts.ready;

// ───────────────────────────────────────── renderer
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W * RS, H * RS, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(C.bg);
scene.fog = new THREE.Fog(C.bg, 12, 34);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.32;
const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 120);
camera.setViewOffset(W, H, 0, 240, W, H);   // subject sits in the upper half, data panel below

scene.add(new THREE.HemisphereLight(0x9db2d8, 0x0a0d14, 0.6));
const key = new THREE.DirectionalLight(0xf2f5ff, 2.4);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 20 });
key.shadow.bias = -0.0005; key.shadow.radius = 5;
scene.add(key, key.target);
const rim = new THREE.DirectionalLight(0xffbf55, 2.6); scene.add(rim, rim.target);
const rim2 = new THREE.DirectionalLight(0xffcf7a, 1.2); scene.add(rim2, rim2.target);

// ───────────────────────────────────────── environment: floor, backdrop, light columns, dust
function canvasTex(w, h, draw, repeat) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}
const floorTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#141a26'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(160,180,220,0.10)'; g.lineWidth = 2;
  for (let k = 0; k <= 4; k++) { g.beginPath(); g.moveTo(k * w / 4, 0); g.lineTo(k * w / 4, h); g.stroke(); g.beginPath(); g.moveTo(0, k * h / 4); g.lineTo(w, k * h / 4); g.stroke(); }
}, [60, 12]);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(240, 48),
  new THREE.MeshPhysicalMaterial({ map: floorTex, color: 0xffffff, roughness: 0.3, metalness: 0.2, clearcoat: 0.7, clearcoatRoughness: 0.18 }));
floor.rotation.x = -Math.PI / 2; floor.position.set(30, 0, 0); floor.receiveShadow = true;
scene.add(floor);
// gold guide line running down the corridor
const guide = new THREE.Mesh(new THREE.BoxGeometry(240, 0.004, 0.025), new THREE.MeshStandardMaterial({ color: C.accent, emissive: C.accent, emissiveIntensity: 0.6 }));
guide.position.set(30, 0.002, 1.55); scene.add(guide);

// backdrop: faint data texture (bars, dot grid, line traces — nothing readable)
const backTex = canvasTex(4096, 1024, (g, w, h) => {
  const r = mulberry32(7);
  const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, '#0d1118'); grd.addColorStop(1, '#1a2130');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(150,170,210,0.10)';
  for (let x = 0; x < w; x += 32) for (let y = 0; y < h; y += 32) g.fillRect(x, y, 3, 3);
  for (let k = 0; k < 70; k++) {                       // chart fragments
    const x = r() * w, y = 150 + r() * (h - 300), cw = 160 + r() * 260, ch = 80 + r() * 160;
    g.globalAlpha = 0.16 + r() * 0.14;
    if (r() < 0.5) {
      const n = 6 + (r() * 8 | 0);
      for (let i = 0; i < n; i++) { const bh = ch * (0.2 + r() * 0.8); g.fillStyle = i === n - 1 && r() < 0.5 ? '#E0B33A' : '#8b9ab8'; g.fillRect(x + i * cw / n, y + ch - bh, cw / n - 6, bh); }
    } else {
      g.strokeStyle = r() < 0.4 ? '#E0B33A' : '#8b9ab8'; g.lineWidth = 4; g.beginPath();
      let yy = y + ch / 2; for (let i = 0; i <= 12; i++) { yy += (r() - 0.5) * ch * 0.3; g.lineTo(x + i * cw / 12, yy); } g.stroke();
    }
  }
  g.globalAlpha = 1;
}, null);
backTex.wrapS = THREE.RepeatWrapping; backTex.repeat.set(3, 1);
const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(240, 16), new THREE.MeshBasicMaterial({ map: backTex, color: 0xb9c3d8 }));
backdrop.position.set(30, 6.5, -9); scene.add(backdrop);
const backTex2 = canvasTex(4096, 1024, (g, w, h) => {
  const r = mulberry32(99);
  for (let k = 0; k < 60; k++) {
    const x = r() * w, y = r() * h, s = 30 + r() * 90;
    g.strokeStyle = `rgba(224,179,58,${0.10 + r() * 0.18})`; g.lineWidth = 3;
    g.strokeRect(x, y, s * 2.2, s);
    g.fillStyle = `rgba(200,210,235,${0.05 + r() * 0.08})`; g.fillRect(x + 8, y + 8, s * 1.4, 8);
  }
}, null);
backTex2.wrapS = THREE.RepeatWrapping; backTex2.repeat.set(3, 1);
const backdrop2 = new THREE.Mesh(new THREE.PlaneGeometry(240, 12), new THREE.MeshBasicMaterial({ map: backTex2, transparent: true, depthWrite: false }));
backdrop2.position.set(30, 4.8, -6.5); scene.add(backdrop2);

// soft vertical light columns behind every station
const glowTex = canvasTex(64, 256, (g, w, h) => {
  const grd = g.createLinearGradient(0, 0, w, 0);
  grd.addColorStop(0, 'rgba(224,179,58,0)'); grd.addColorStop(0.5, 'rgba(224,179,58,0.55)'); grd.addColorStop(1, 'rgba(224,179,58,0)');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  const v = g.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.65, 'rgba(0,0,0,0)');
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = v; g.fillRect(0, 0, w, h);
}, null);
const columns = [];
for (let i = 0; i < 9; i++) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 9), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35 }));
  m.position.set(i * 6, 4.5, -4.2); scene.add(m); columns.push(m);
}

// drifting dust
const DUST = 900;
const dustGeo = new THREE.BufferGeometry();
const dustBase = new Float32Array(DUST * 3), dustVel = new Float32Array(DUST * 3);
for (let i = 0; i < DUST; i++) {
  dustBase.set([-6 + rand() * 66, rand() * 5, -5 + rand() * 8], i * 3);
  dustVel.set([(rand() - 0.5) * 0.06, 0.02 + rand() * 0.05, (rand() - 0.5) * 0.04], i * 3);
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(DUST * 3), 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xf3d58a, size: 0.025, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
scene.add(dust);

// ───────────────────────────────────────── materials & helpers
const MAT = {
  gold: new THREE.MeshStandardMaterial({ color: C.accent, roughness: 0.28, metalness: 0.75 }),
  goldGlow: new THREE.MeshStandardMaterial({ color: C.accent, emissive: C.accent, emissiveIntensity: 0.9, roughness: 0.4 }),
  slate: new THREE.MeshStandardMaterial({ color: 0x4a5670, roughness: 0.45, metalness: 0.25 }),
  slateDark: new THREE.MeshStandardMaterial({ color: 0x232b3b, roughness: 0.5, metalness: 0.3 }),
  base: new THREE.MeshStandardMaterial({ color: 0x1b2230, roughness: 0.4, metalness: 0.4 }),
  cream: new THREE.MeshStandardMaterial({ color: 0xEDE6D6, roughness: 0.6 }),
  dem: new THREE.MeshStandardMaterial({ color: C.dem, roughness: 0.4, metalness: 0.1 }),
  rep: new THREE.MeshStandardMaterial({ color: C.rep, roughness: 0.4, metalness: 0.1 }),
};
function mesh(geo, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  if (parent) parent.add(m); return m;
}
const stations = {};
function station(id, x) {
  const root = new THREE.Group(); root.position.set(x, 0, 0); scene.add(root);
  const inner = new THREE.Group(); root.add(inner);
  // plinth + floor marker disc
  mesh(new THREE.CylinderGeometry(1.25, 1.3, 0.05, 64), MAT.base, 0, 0.025, 0, root);
  const ring = mesh(new THREE.TorusGeometry(1.27, 0.008, 6, 96), MAT.goldGlow, 0, 0.052, 0, root); ring.rotation.x = Math.PI / 2;
  stations[id] = { root, inner, x };
  return inner;
}
function hemicycle(parent, n, rIn, rOut, rows, makeGeo) {
  const radii = [...Array(rows)].map((_, k) => lerp(rIn, rOut, k / (rows - 1)));
  const sumR = radii.reduce((a, b) => a + b, 0);
  const counts = radii.map(r => Math.round(n * r / sumR));
  counts[counts.length - 1] += n - counts.reduce((a, b) => a + b, 0);
  const seats = [];
  radii.forEach((r, k) => { for (let j = 0; j < counts[k]; j++) { const a = Math.PI * j / (counts[k] - 1); seats.push({ r, a, row: k, x: -Math.cos(a) * r, z: -Math.sin(a) * r }); } });
  const inst = new THREE.InstancedMesh(makeGeo(), new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1 }), seats.length);
  inst.castShadow = true; inst.receiveShadow = true;
  parent.add(inst);
  const byAngle = seats.map((_, i) => i).sort((p, q) => seats[p].a - seats[q].a);
  const fillOrder = seats.map((_, i) => i).sort((p, q) => (seats[p].r - seats[q].r) * 10 + (Math.abs(seats[p].a - Math.PI / 2) - Math.abs(seats[q].a - Math.PI / 2)));
  const rank = new Array(seats.length); fillOrder.forEach((idx, r) => rank[idx] = r);
  return { inst, seats, byAngle, fillOrder, rank };
}
const dummy = new THREE.Object3D(), tmpCol = new THREE.Color();
function poseHemi(h, dem, rep, k, hBase, hRow) {
  const n = h.seats.length;
  const party = new Array(n);
  h.byAngle.forEach((idx, r) => { party[idx] = r < dem ? C.dem : r >= n - rep ? C.rep : C.pending; });
  h.seats.forEach((s, i) => {
    // seats fill from the centre outward: each rises and takes its colour in order
    const local = clamp(k * 1.25 * n - h.rank[i] * 1.0, 0, n * 0.25) / (n * 0.25);
    const e = easeOut(local);
    const height = 0.02 + (hBase + s.row * hRow) * e;
    dummy.position.set(s.x, height / 2, s.z); dummy.scale.set(1, height, 1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
    h.inst.setMatrixAt(i, dummy.matrix);
    tmpCol.set(0x2a3345).lerp(new THREE.Color(party[i]), e);
    h.inst.setColorAt(i, tmpCol);
  });
  h.inst.instanceMatrix.needsUpdate = true; h.inst.instanceColor.needsUpdate = true;
}

// ───────────────────────────────────────── the eight (+ intro) sculptures
const SP = 6;
const font = new FontLoader().parse(fontJSON);

{ // hook — "2026" monument + eight pillars
  const p = station('hook', 0);
  const g = new TextGeometry('2026', { font, size: 0.62, depth: 0.16, curveSegments: 6, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.018, bevelSegments: 3 });
  g.center();
  const txt = mesh(g, MAT.gold, 0, 0.9, 0.15, p);
  stations.hook.txt = txt;
  stations.hook.pillars = [...Array(8)].map((_, i) => {
    const a = Math.PI * (0.12 + 0.76 * i / 7);
    const m = mesh(new RoundedBoxGeometry(0.13, 1, 0.13, 2, 0.03), i % 2 ? MAT.slate : MAT.slateDark, -Math.cos(a) * 0.95, 0, -Math.sin(a) * 0.75, p);
    const cap = mesh(new THREE.BoxGeometry(0.14, 0.02, 0.14), MAT.goldGlow, 0, 0, 0, m); cap.position.y = 0.5;
    return m;
  });
}
{ // 01 Senate — 100 seat pillars
  const p = station('senate', SP * 1);
  stations.senate.hemi = hemicycle(p, 100, 0.45, 1.05, 5, () => { const g = new THREE.CylinderGeometry(0.045, 0.045, 1, 14); return g; });
  const maj = mesh(new THREE.BoxGeometry(0.012, 0.01, 0.7), MAT.goldGlow, 0, 0.06, -0.75, p);
}
{ // 02 House — 435 seat cubes
  const p = station('house', SP * 2);
  stations.house.hemi = hemicycle(p, 435, 0.38, 1.12, 11, () => new RoundedBoxGeometry(0.05, 1, 0.05, 1, 0.012));
  mesh(new THREE.BoxGeometry(0.012, 0.01, 0.8), MAT.goldGlow, 0, 0.06, -0.75, p);
}
{ // 03 Divided government — two equal monoliths with a gold light gap
  const p = station('divided', SP * 3);
  const slabG = new RoundedBoxGeometry(0.62, 1.5, 0.22, 3, 0.05);
  slabG.translate(0, 0.75, 0);
  const L = mesh(slabG, MAT.rep, -0.44, 0.05, 0, p), R = mesh(slabG, MAT.dem, 0.44, 0.05, 0, p);
  // cream emblems: a columned house (white house) and a domed hall (congress)
  const e1 = new THREE.Group(); e1.position.set(0, 1.05, 0.12); L.add(e1);
  mesh(new THREE.BoxGeometry(0.34, 0.14, 0.03), MAT.cream, 0, 0, 0, e1);
  const roof = mesh(new THREE.CylinderGeometry(0.0, 0.2, 0.08, 3), MAT.cream, 0, 0.11, 0, e1); roof.rotation.y = Math.PI / 6; roof.scale.z = 0.2;
  for (let k = 0; k < 4; k++) mesh(new THREE.BoxGeometry(0.025, 0.1, 0.04), MAT.cream, -0.09 + k * 0.06, -0.01, 0.02, e1);
  const e2 = new THREE.Group(); e2.position.set(0, 1.05, 0.12); R.add(e2);
  mesh(new THREE.BoxGeometry(0.36, 0.1, 0.03), MAT.cream, 0, -0.03, 0, e2);
  const dome = mesh(new THREE.SphereGeometry(0.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), MAT.cream, 0, 0.02, 0, e2); dome.scale.z = 0.35;
  mesh(new THREE.BoxGeometry(0.015, 0.06, 0.02), MAT.cream, 0, 0.14, 0, e2);
  const gap = mesh(new THREE.BoxGeometry(0.03, 1.6, 0.03), MAT.goldGlow, 0, 0.85, 0, p);
  Object.assign(stations.divided, { L, R, gap });
}
{ // 04 Budget — coin stacks frozen inside a glass block, with a pause glyph
  const p = station('budget', SP * 4);
  const coinG = new THREE.CylinderGeometry(0.17, 0.17, 0.045, 32);
  const coins = [];
  [[-0.32, 9], [0.02, 13], [0.34, 6]].forEach(([x, n], s) => { for (let k = 0; k < n; k++) coins.push(mesh(coinG, MAT.gold, x, 0.08 + k * 0.05, (s - 1) * 0.06, p)); });
  const glass = mesh(new RoundedBoxGeometry(1.15, 0.95, 0.65, 3, 0.04), new THREE.MeshPhysicalMaterial({ color: 0xa9c1e8, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.2, clearcoat: 1, depthWrite: false }), 0, 0.53, 0, p);
  glass.castShadow = false;
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.15, 0.95, 0.65)), new THREE.LineBasicMaterial({ color: C.accent, transparent: true, opacity: 0.9 }));
  edges.position.set(0, 0.53, 0); p.add(edges);
  const pause = new THREE.Group(); pause.position.set(0, 1.35, 0); p.add(pause);
  mesh(new RoundedBoxGeometry(0.09, 0.32, 0.07, 2, 0.02), MAT.goldGlow, -0.08, 0, 0, pause);
  mesh(new RoundedBoxGeometry(0.09, 0.32, 0.07, 2, 0.02), MAT.goldGlow, 0.08, 0, 0, pause);
  Object.assign(stations.budget, { coins, glass, edges, pause });
}
{ // 05 Tariffs — three thirds; two light up (2/3 to override a veto) + a container
  const p = station('tariff', SP * 5);
  const slabs = [-0.48, 0, 0.48].map(x => mesh(new RoundedBoxGeometry(0.4, 1.35, 0.14, 2, 0.03), new THREE.MeshStandardMaterial({ color: 0x3a4459, roughness: 0.4, metalness: 0.3, emissive: C.accent, emissiveIntensity: 0 }), x, 0.73, -0.25, p));
  const cont = new THREE.Group(); cont.position.set(0.15, 0.05, 0.55); cont.rotation.y = -0.25; p.add(cont);
  mesh(new THREE.BoxGeometry(0.9, 0.3, 0.32), MAT.slate, 0, 0.15, 0, cont);
  for (let k = 0; k < 14; k++) mesh(new THREE.BoxGeometry(0.018, 0.27, 0.335), MAT.slate, -0.4 + k * 0.8 / 13, 0.15, 0, cont);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(new THREE.BoxGeometry(0.04, 0.3, 0.04), MAT.gold, sx * 0.43, 0.15, sz * 0.15, cont);
  Object.assign(stations.tariff, { slabs, cont });
}
{ // 06 Chips — package + vertical inspection ring
  const p = station('chips', SP * 6);
  const chip = new THREE.Group(); chip.position.set(0, 0.32, 0); chip.rotation.x = 0.55; p.add(chip);
  mesh(new RoundedBoxGeometry(0.8, 0.09, 0.8, 2, 0.02), MAT.slateDark, 0, 0, 0, chip);
  const pinG = new THREE.BoxGeometry(0.035, 0.022, 0.11);
  for (let s = 0; s < 4; s++) for (let k = 0; k < 10; k++) {
    const off = -0.315 + k * 0.07, pin = mesh(pinG, MAT.gold, 0, -0.01, 0, chip);
    if (s < 2) pin.position.set(off, -0.01, s ? -0.45 : 0.45); else { pin.position.set(s === 2 ? 0.45 : -0.45, -0.01, off); pin.rotation.y = Math.PI / 2; }
  }
  mesh(new RoundedBoxGeometry(0.44, 0.04, 0.44, 2, 0.01), new THREE.MeshStandardMaterial({ color: 0x2c3446, roughness: 0.25, metalness: 0.7 }), 0, 0.06, 0, chip);
  for (let k = 0; k < 6; k++) mesh(new THREE.BoxGeometry(0.34, 0.006, 0.014), MAT.goldGlow, 0, 0.083, -0.15 + k * 0.06, chip);
  const ring = mesh(new THREE.TorusGeometry(0.72, 0.035, 12, 96), MAT.goldGlow, 0, 0.78, -0.05, p);
  const ring2 = mesh(new THREE.TorusGeometry(0.8, 0.008, 6, 96), MAT.gold, 0, 0.78, -0.05, p);
  Object.assign(stations.chips, { chip, ring, ring2 });
}
{ // 07 Market — rising bar chart with an up arrow
  const p = station('market', SP * 7);
  const hs = [0.35, 0.42, 0.38, 0.5, 0.47, 0.58, 0.55];
  const bars = hs.map((h, i) => { const m = mesh(new RoundedBoxGeometry(0.15, 1, 0.15, 2, 0.02), MAT.slate, -0.78 + i * 0.2, 0, -0.05, p); m.userData.h = h; return m; });
  const big = mesh(new RoundedBoxGeometry(0.17, 1, 0.17, 2, 0.02), MAT.gold, 0.66, 0, -0.05, p);
  const arrow = new THREE.Group(); arrow.position.set(-0.62, 0.42, 0.3); arrow.rotation.z = 0.5; p.add(arrow);   // points up-right
  mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 12), MAT.goldGlow, 0, 0, 0, arrow).rotation.z = -Math.PI / 2;
  mesh(new THREE.ConeGeometry(0.09, 0.2, 16), MAT.goldGlow, 0.68, 0, 0, arrow).rotation.z = -Math.PI / 2;
  Object.assign(stations.market, { bars, big, arrow });
}
{ // 08 Taiwan — island outline (lon/lat polygon) with an orbit of chip tiles
  const p = station('taiwan', SP * 8);
  const ll = [[121.54, 25.30], [121.75, 25.15], [121.92, 25.02], [121.85, 24.85], [121.87, 24.60], [121.75, 24.30], [121.63, 24.00], [121.50, 23.50], [121.40, 23.10], [121.15, 22.75], [120.92, 22.35], [120.85, 21.90], [120.70, 22.00], [120.62, 22.30], [120.42, 22.55], [120.30, 22.62], [120.15, 23.00], [120.12, 23.40], [120.25, 23.80], [120.50, 24.20], [120.75, 24.60], [120.93, 24.85], [121.20, 25.10], [121.45, 25.25]];
  const shape = new THREE.Shape();
  ll.forEach(([lo, la], i) => { const x = (lo - 121) * 0.42, y = (la - 21.9) * 0.42; i ? shape.lineTo(x, y) : shape.moveTo(x, y); });
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.015, bevelSegments: 2 });
  g.center();
  const isl = mesh(g, MAT.gold, 0, 0.92, 0, p);
  mesh(new RoundedBoxGeometry(0.5, 0.08, 0.26, 2, 0.02), MAT.slateDark, 0, 0.09, 0, p);
  mesh(new THREE.BoxGeometry(0.04, 0.12, 0.04), MAT.slateDark, 0, 0.18, 0, p);
  const orbit = new THREE.Group(); orbit.position.y = 0.75; p.add(orbit);
  for (let k = 0; k < 12; k++) {
    const a = k / 12 * Math.PI * 2, c = mesh(new RoundedBoxGeometry(0.12, 0.02, 0.12, 1, 0.005), MAT.slateDark, Math.cos(a) * 0.95, 0, Math.sin(a) * 0.55, orbit);
    mesh(new THREE.BoxGeometry(0.06, 0.006, 0.06), MAT.goldGlow, 0, 0.013, 0, c);
  }
  Object.assign(stations.taiwan, { isl, orbit });
}
const STATION_OF = { hook: 'hook', senate: 'senate', house: 'house', divided: 'divided', budget: 'budget', tariff: 'tariff', chips: 'chips', market: 'market', taiwan: 'taiwan' };

// ───────────────────────────────────────── camera path (script.json → camera)
function segPose(i, t) {
  const s = SEGS[i], c = s.camera;
  const k = clamp((t - s.start) / Math.max(0.1, s.end - s.start));
  const az = THREE.MathUtils.degToRad((c.azDeg || 0) + c.orbitDeg * (k - 0.5));
  const el = THREE.MathUtils.degToRad(c.elevDeg);
  const dist = c.dist * (1 - 0.04 * k);                       // slow push-in
  const tgt = new THREE.Vector3(...c.target);
  const pos = new THREE.Vector3(tgt.x + Math.sin(az) * Math.cos(el) * dist, tgt.y + Math.sin(el) * dist, tgt.z + Math.cos(az) * Math.cos(el) * dist);
  return { pos, tgt, dist };
}
const TRANS = 0.5;
function poseAt(t) {
  for (let j = 1; j < SEGS.length; j++) {
    const b = SEGS[j].start;
    if (t >= b - TRANS / 2 && t < b + TRANS / 2) {                   // overlapping move across the cut
      const k = ease3((t - (b - TRANS / 2)) / TRANS);
      const a = segPose(j - 1, t), c = segPose(j, t);
      return { pos: a.pos.lerp(c.pos, k), tgt: a.tgt.lerp(c.tgt, k), dist: lerp(a.dist, c.dist, k) };
    }
  }
  let i = SEGS.findIndex(s => t < s.end); if (i < 0) i = SEGS.length - 1;
  return segPose(i, t);
}

const composer = new EffectComposer(renderer);
composer.setPixelRatio(1); composer.setSize(W * RS, H * RS);
composer.addPass(new RenderPass(scene, camera));
const bokeh = new BokehPass(scene, camera, { focus: 6, aperture: 0.0035, maxblur: 0.01 });
composer.addPass(bokeh);
composer.addPass(new OutputPass());

const updateOverlay = setupOverlay(SEGS, META, tl);
const segAt = id => SEGS.find(s => s.id === id);

// ───────────────────────────────────────── per-frame update
function update(t, f) {
  const pose = poseAt(t);
  camera.position.copy(pose.pos); camera.lookAt(pose.tgt);
  bokeh.uniforms.focus.value = pose.dist;
  key.position.copy(pose.tgt).add(new THREE.Vector3(2.5, 6, 4)); key.target.position.copy(pose.tgt);
  rim.position.copy(pose.tgt).add(new THREE.Vector3(-3, 3, -5)); rim.target.position.copy(pose.tgt);
  rim2.position.copy(pose.tgt).add(new THREE.Vector3(3.5, 2, -4)); rim2.target.position.copy(pose.tgt);

  backTex.offset.x = t * 0.0025; backTex2.offset.x = -t * 0.004;
  const pos = dustGeo.attributes.position.array;
  for (let i = 0; i < DUST; i++) {
    pos[i * 3] = dustBase[i * 3] + dustVel[i * 3] * t;
    pos[i * 3 + 1] = (dustBase[i * 3 + 1] + dustVel[i * 3 + 1] * t) % 5;
    pos[i * 3 + 2] = dustBase[i * 3 + 2] + dustVel[i * 3 + 2] * t + Math.sin(t * 0.5 + i) * 0.05;
  }
  dustGeo.attributes.position.needsUpdate = true;

  // each sculpture rises out of its plinth at the start of its segment (hook is visible from frame 0)
  SEGS.forEach(s => {
    const st = stations[STATION_OF[s.id]]; if (!st) return;
    const k = s.id === 'hook' ? 1 : prog(t, s.start + 0.2, 0.65);
    st.inner.scale.setScalar(Math.max(0.001, backOut(k)));
    st.inner.position.y = (1 - easeOut(k)) * -0.2;
    const ci = Object.keys(STATION_OF).indexOf(s.id);
    if (columns[ci]) columns[ci].material.opacity = 0.18 + 0.3 * easeOut(prog(t, s.start, 0.8));
  });

  { // hook
    const st = stations.hook, s = segAt('hook');
    st.txt.position.y = 0.9 + Math.sin(t * 1.4) * 0.03; st.txt.rotation.y = Math.sin(t * 0.7) * 0.12;
    st.pillars.forEach((m, i) => { const k = backOut(prog(t, 0.3 + i * 0.12, 0.5)); const h = Math.max(0.001, (0.35 + i * 0.05) * k); m.scale.y = h; m.position.y = h / 2; });
  }
  { const s = segAt('senate'); poseHemi(stations.senate.hemi, 54, 44, prog(t, s.start + 0.55, 1.7), 0.16, 0.05); }
  { const s = segAt('house'); poseHemi(stations.house.hemi, 228, 139, prog(t, s.start + 0.55, 1.9), 0.06, 0.018); }
  { const st = stations.divided, s = segAt('divided');
    const k = easeOut(prog(t, s.start + 0.9, 1.0));
    st.L.position.x = -0.44 - 0.08 * k; st.R.position.x = 0.44 + 0.08 * k;
    st.gap.scale.y = Math.max(0.001, k); st.gap.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 4); }
  { const st = stations.budget, s = segAt('budget');
    st.coins.forEach((c, i) => { const k = easeOut(prog(t, s.start + 0.4 + i * 0.035, 0.35)); c.visible = k > 0.001; c.position.y = c.userData.y0 ?? (c.userData.y0 = c.position.y); c.position.y = c.userData.y0 + (1 - k) * 0.8; });
    const kg = easeOut(prog(t, s.start + 1.6, 0.6));
    st.glass.material.opacity = 0.05 + 0.17 * kg; st.edges.material.opacity = kg; st.glass.scale.setScalar(lerp(1.25, 1, kg)); st.edges.scale.setScalar(lerp(1.25, 1, kg));
    st.pause.scale.setScalar(Math.max(0.001, backOut(prog(t, s.start + 2.0, 0.5)))); st.pause.position.y = 1.35 + Math.sin(t * 2) * 0.03; }
  { const st = stations.tariff, s = segAt('tariff');
    st.slabs.forEach((m, i) => { const on = i < 2 ? easeOut(prog(t, s.start + 1.6 + i * 0.5, 0.4)) : 0; m.material.emissiveIntensity = on * 0.28; m.material.color.set(0x3a4459).lerp(new THREE.Color(C.accent), on); });
    st.cont.position.x = 0.15 + Math.sin(prog(t, s.start + 0.9, 1.6) * Math.PI) * 0.08; }
  { const st = stations.chips; st.ring.rotation.y = t * 0.6; st.ring2.rotation.y = -t * 0.4; st.ring.material.emissiveIntensity = 0.7 + 0.3 * Math.sin(t * 3); st.chip.rotation.y = Math.sin(t * 0.6) * 0.25; }
  { const st = stations.market, s = segAt('market');
    st.bars.forEach((m, i) => { const k = easeOut(prog(t, s.start + 0.5 + i * 0.08, 0.5)); const h = Math.max(0.001, m.userData.h * k); m.scale.y = h; m.position.y = 0.05 + h / 2; });
    const kb = easeOut(prog(t, s.start + 1.0, 1.4)); const hb = Math.max(0.001, 1.05 * kb); st.big.scale.y = hb; st.big.position.y = 0.05 + hb / 2;
    st.arrow.scale.setScalar(Math.max(0.001, backOut(prog(t, s.start + 1.6, 0.6)))); }
  { const st = stations.taiwan; st.isl.rotation.y = Math.sin(t * 0.7) * 0.18; st.orbit.rotation.y = t * 0.35; }

  updateOverlay(t, f);
}

// cover mode (?cover=1): same 3D scene, overlay replaced by the cover title
if (new URLSearchParams(location.search).has('cover')) {
  for (const sel of ['#heads', '#panels', '#subs', '#wave', '#disc']) document.querySelector(sel).style.display = 'none';
  const cv = document.createElement('div');
  cv.id = 'cover';
  cv.innerHTML = `<div class="k">2026 MIDTERMS</div><div class="l1">美國期中選舉</div><div class="l2"><span>8</span> 件事</div><div class="l3">影響你的錢包</div><div class="tags"><span>參眾兩院</span><span>關稅</span><span>晶片</span><span>美股</span><span>台股</span></div>`;
  document.getElementById('stage').appendChild(cv);
}

window.renderAt = async (f) => {
  const t = f / FPS;
  update(t, f);
  composer.render();
  renderer.getContext().finish();
  await new Promise(r => requestAnimationFrame(() => r()));
  return t;
};
window.__meta = { frames: tl.frames, fps: FPS };
window.__ready = true;
