// 3D 產品台的「產品資料」：零件清單（形狀、尺寸、材質、所在層）寫在 videos/<slug>/model.json（或 script.json 的 model），
// 這裡把資料變成 three.js 的幾何與材質。換產品只改資料，不改這個資料夾的程式。資料格式見 docs/three-stage.md。
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { THEME_3D as T } from "../../theme";
import { seeded } from "../anim";

export type Vec3 = [number, number, number];
export type MatDef = {
  /** std＝一般（金屬／塑膠）、phys＝有清漆層（玻璃、烤漆、拋光金屬）、screen＝自發光畫面（上面仍有玻璃反光）、unlit＝不受光 */
  kind?: "std" | "phys" | "screen" | "unlit";
  color: string; rough?: number; metal?: number; clearcoat?: number; clearcoatRough?: number;
  emissive?: string; ei?: number; env?: number; opacity?: number;
  /** 程式產生的紋理：wick 毛細網、traces 線路、brushed 髮絲紋；texScale＝一格紋理多大（模型單位）；bump＝凹凸強度 */
  tex?: "wick" | "traces" | "brushed"; texScale?: number; bump?: number;
};
export type PartDef = {
  id?: string; layer: string;
  shape: "slab" | "ring" | "plane" | "box" | "cyl" | "tube" | "sphere";
  size: number[]; r?: number; wall?: number; bevel?: number;
  pos?: number[]; rot?: number[]; scale?: number[];
  /** 同一個零件複製到多個位置（[x, y] 或 [x, y, z]，加在 pos 上）；grid＝排成 nx×ny 的陣列 */
  at?: number[][]; grid?: { n: [number, number]; step: [number, number] };
  mat: string;
  /** lid＝掀蓋時滑開的上蓋、heatFloor＝會依熱度變色的底板、heatSource＝發熱的零件、xray＝念到「燙」時變透明 */
  role?: "lid" | "heatFloor" | "heatSource" | "xray";
  shadow?: boolean;
};
/** bg（2026/11/16 tech-offer）：背景層（例如整張桌面），不算進主素材框（版面檢查與疊層避讓都不看它） */
export type LayerDef = { id: string; z: number; k: number; outline?: [number, number, number, number]; bg?: boolean };
export type AnchorDef = { layer: string; p: Vec3; dx: number; dy: number };
export type ThermalDef = {
  layer: string; center: [number, number]; size: [number, number]; floorZ: number; hot: [number, number]; lanes: [number, number]; lidTravel: number;
  particles: number; shimmer: number; ramp: string[]; water: string; vapor: string; shimmerColor: string; glow: string; sourceHot: string; sourceWarm: string;
};
/** 一個點：[x, y, z]（在該動作的 layer 裡）或 { layer, p }（指定在哪一層；跨層的排線、聲波用） */
export type Pt = number[] | { layer: string; p: number[] };
/** 運作動畫（model.json 的 actions；script.json 每幕的 run 用 cue 觸發）。各種 type 用到的欄位見 docs/three-stage.md「運作動畫怎麼寫」 */
export type ActionDef = {
  type: "vibrate" | "rotate" | "pulse" | "flow" | "wave" | "trace" | "sum" | "meter" | "lpp";
  /** lpp（2026/11/15 tech-euv）：雷射打錫滴成電漿的循環。at＝焦點；size＝錫滴半徑；halo＝電漿閃光大小；
   *  lpp.drop＝錫滴從哪裡開始掉、beam＝雷射光束的起點、period＝一輪幾秒、queue＝畫面上排隊的錫滴數、pancake＝壓扁後的半徑、burst＝電漿球半徑、spray＝碎點噴多遠、
   *  pre／main／glow＝預脈衝、主脈衝、電漿的色票名、preR／mainR＝兩道光束的粗細 */
  lpp?: { drop?: Pt; beam?: Pt; period?: number; queue?: number; pancake?: number; burst?: number; spray?: number; pre?: string; main?: string; glow?: string; preR?: number; mainR?: number };
  /** flow 的反射衰減（2026/11/15 tech-euv）：keep＝每經過一個反射點剩幾成、bounces＝path 裡哪幾個點是反射點（索引）、lossFloor＝最暗時的不透明度下限 */
  keep?: number; bounces?: number[]; lossFloor?: number;
  layer?: string; color?: string;
  /** vibrate／rotate／pulse：作用在哪些零件（parts 的 id） */
  parts?: string[];
  /** vibrate：方向、幅度（模型單位）、每秒幾下。rotate：軸、每秒幾圈、轉軸位置（預設零件自己的 pos） */
  axis?: number[]; amp?: number; freq?: number; rps?: number; pivot?: number[];
  /** 2026/11/16 tech-offer：vibrate 的 grow＝沿 axis 伸縮（以零件底部為基準）；rotate 的 angle（度）＝轉到固定角度、swing（度）＝來回擺 */
  grow?: boolean; angle?: number; swing?: number; gain0?: number;
  /** rotate（2026/11/16 tech-offer）：damp＝轉到 angle 時用阻尼振盪（過衝後收斂）；level＝吊著、保持水平的零件 id（只跟著 hang 吊點平移）；hang＝[[左吊點 x,y],[右吊點 x,y]]；
   *  flow 的 accel＝受重力加速（位置＝u²） */
  damp?: { f: number; tau: number }; level?: string[]; hang?: number[][]; accel?: boolean;
  /** pulse：零件發光強度（0–1）、光暈大小（0＝不要）、光暈位置（預設第一個零件的 pos） */
  glow?: number; halo?: number; at?: Pt; steady?: boolean;
  /** flow：路徑、顆數、大小、形狀、每秒跑幾趟、要不要畫軌道 */
  path?: Pt[]; n?: number; size?: number; shape?: "dot" | "arrow"; rate?: number; track?: boolean;
  /** flow 進階（2026/11/15，電流效果）：drive＝速度與密度跟著強度（強度降下來＝慢下來、變稀疏、停住）；trail＝每顆後面幾格拖尾、trailGap＝拖尾間距（路徑比例，乘上當下速度）、trailColor；
   *  rim＝每顆外圈的顏色（白點加深色外圈，淺底深底都看得到）、rimScale；minVisible＝最慢時還看得到幾成的點；rest＝停住後留幾幀再淡出、restO＝停住時的不透明度；
   *  jitter＝每顆垂直路徑方向的小抖動（模型單位，讓一群點看起來像流而不是排隊）；lanes＝同一條路徑上並排幾道（間距 laneGap，方向 laneDir） */
  drive?: boolean; trail?: number; trailGap?: number; trailColor?: string; rim?: string; rimScale?: number; rimO?: number; minVisible?: number; rest?: number; restO?: number; jitter?: number; lanes?: number; laneGap?: number; laneDir?: number[];
  /** wave：從哪裡、往哪個方向、走多遠、同時幾圈、起始半徑、每走 1 單位半徑多多少、線寬、相位（0–1）、張角（度；360＝整圈） */
  from?: Pt; dir?: number[]; reach?: number; count?: number; r0?: number; spread?: number; width?: number; phase?: number; arc?: number; arcStart?: number;
  /** trace：from → to 一條線上的行進波；up＝振幅方向、cycles＝線上有幾個波長、invert＝反相、harmonics＝[[倍頻, 相對振幅], …] 讓波形不是單純正弦 */
  to?: Pt; up?: number[]; cycles?: number; invert?: boolean; harmonics?: number[][]; radius?: number; axisLine?: boolean;
  /** sum：把哪幾道 trace 加起來；build＝先畫第一道，再用幾幀把其他幾道加進來（看得到振幅縮小的過程）、buildDelay＝等幾幀才開始加 */
  of?: string[]; build?: number; buildDelay?: number;
  /** meter（HTML 小儀表）：釘在哪個標註點、bar＝音量條｜wave＝小波形、數值跟著哪個動作、標題、要畫的波形（wave 用） */
  anchor?: string; kind?: "bar" | "wave"; source?: string; label?: string; traces?: string[]; accent?: string; w?: number;
  /** 深色 HUD 片（Hud.tsx）的 meter：固定在畫面像素 x、y（不跟著標註點）；sym＝符號（Vg）、lo／hi＝條兩端的字（低／高，不標數值） */
  x?: number; y?: number; sym?: string; lo?: string; hi?: string;
};
export type ProductModel = {
  name?: string; size: { w: number; h: number; r: number; t: number };
  palette: Record<string, string>; materials: Record<string, MatDef>;
  layers: LayerDef[]; parts: PartDef[]; anchors: Record<string, AnchorDef>;
  thermal?: ThermalDef;
  actions?: Record<string, ActionDef>;
  camera?: Record<string, any>; pose?: Record<string, number>; fx?: Record<string, any>;
};
export type Fx = { [K in keyof typeof T.fx]: (typeof T.fx)[K] extends boolean ? boolean : number };
export const fxOf = (m: ProductModel): Fx => ({ ...T.fx, ...(m.fx ?? {}) }) as Fx;
export const col = (m: ProductModel, c: string) => m.palette[c] ?? c;

// ── 幾何 ──
const rr = (w: number, h: number, r: number) => {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  r = Math.max(0.001, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4));
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
};
/** 圓角愈大、曲線分段愈多（大件的圓角要圓、小件省面數） */
const segs = (r: number) => Math.max(3, Math.min(18, Math.round(6 + r * 12)));
const extrude = (s: THREE.Shape, t: number, b: number, cs: number) => {
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, t - 2 * b), bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: b >= 0.03 ? 3 : 2, curveSegments: cs });
  g.translate(0, 0, -Math.max(0.001, t - 2 * b) / 2);
  return g;
};
const circle = (r: number) => { const s = new THREE.Shape(); s.absarc(0, 0, r, 0, Math.PI * 2, false); return s; };

const baseGeo = (p: PartDef): THREE.BufferGeometry => {
  const [a = 1, b = 1, c = 0.1] = p.size, r = p.r ?? 0, bv = p.bevel ?? 0;
  switch (p.shape) {
    case "slab": return extrude(rr(a - 2 * bv, b - 2 * bv, Math.max(0.005, r - bv)), c, bv, segs(r));
    case "ring": {
      const w = p.wall ?? 0.2, s = rr(a - 2 * bv, b - 2 * bv, Math.max(0.005, r - bv));
      s.holes.push(rr(a - 2 * w + 2 * bv, b - 2 * w + 2 * bv, Math.max(0.005, r - w + bv)));
      return extrude(s, c, bv, segs(r));
    }
    case "tube": { const s = circle(a - bv); s.holes.push(circle(b + bv)); return extrude(s, c, bv, 14); }
    case "plane": {
      if (p.role === "heatFloor") {
        // 要逐點變色，所以切成細格；UV 用模型單位（紋理才不會被拉長）
        const g = new THREE.PlaneGeometry(a, b, 20, 36), uv = g.attributes.uv, pos = g.attributes.position;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i), pos.getY(i));
        g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(pos.count * 3).fill(1), 3));
        return g;
      }
      return new THREE.ShapeGeometry(rr(a, b, r), segs(r));
    }
    case "box": return new THREE.BoxGeometry(a, b, c);
    case "cyl": { const g = new THREE.CylinderGeometry(a, a, b, a > 0.3 ? 32 : 14); g.rotateX(Math.PI / 2); return g; }
    case "sphere": return new THREE.SphereGeometry(a, 28, 16);
  }
};
/** 一個零件的幾何（旋轉、縮放、複製都烤進去；外面只要放到 pos） */
export const buildGeo = (p: PartDef): THREE.BufferGeometry => {
  let g = baseGeo(p);
  if (p.scale) { g.scale(p.scale[0], p.scale[1], p.scale[2]); g.computeVertexNormals(); }
  if (p.rot) { const d = Math.PI / 180; g.rotateX(p.rot[0] * d); g.rotateY(p.rot[1] * d); g.rotateZ(p.rot[2] * d); }
  const copies: number[][] = [...(p.at ?? [])];
  if (p.grid) { const [nx, ny] = p.grid.n, [sx, sy] = p.grid.step; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) copies.push([(i - (nx - 1) / 2) * sx, (j - (ny - 1) / 2) * sy]); }
  if (copies.length) {
    const all = copies.map((c) => g.clone().translate(c[0], c[1], c[2] ?? 0));
    const merged = mergeGeometries(all, false);
    all.forEach((x) => x.dispose()); g.dispose();
    if (merged) g = merged;
  }
  return g;
};

// ── 程式產生的紋理（灰階，乘在材質顏色上；固定 seed） ──
const texCache = new Map<string, THREE.Texture>();
const gray = (v: number) => { const x = Math.round(Math.max(0, Math.min(255, v))); return `rgb(${x},${x},${x})`; };
const drawTex = (kind: string, size: number) => {
  const cv = document.createElement("canvas"); cv.width = cv.height = size;
  const c = cv.getContext("2d") as CanvasRenderingContext2D, r = seeded(kind.length * 7919 + 13);
  if (kind === "wick") {
    // 毛細結構：細密的交錯網點（亮點＝凸起的顆粒，暗線＝縫）
    c.fillStyle = gray(150); c.fillRect(0, 0, size, size);
    const n = 16, st = size / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = (i + (j % 2 ? 0.5 : 0)) * st, y = j * st + st / 2, g = c.createRadialGradient(x, y, 0, x, y, st * 0.56);
      g.addColorStop(0, gray(255)); g.addColorStop(0.55, gray(205 + r() * 30)); g.addColorStop(1, gray(120));
      c.fillStyle = g; c.beginPath(); c.arc(x, y, st * 0.56, 0, Math.PI * 2); c.fill();
      if (i === 0 && j % 2) { c.beginPath(); c.arc(x + size, y, st * 0.56, 0, Math.PI * 2); c.fill(); }
    }
  } else if (kind === "traces") {
    // 線路：底色＋幾條轉 45 度的走線與焊點
    c.fillStyle = gray(190); c.fillRect(0, 0, size, size);
    c.strokeStyle = gray(255); c.lineWidth = size / 64; c.lineCap = "round"; c.lineJoin = "round";
    for (let i = 0; i < 14; i++) {
      const y0 = Math.round(r() * 16) * (size / 16), x1 = (0.2 + r() * 0.5) * size, dy = (r() > 0.5 ? 1 : -1) * (size / 16) * (1 + Math.floor(r() * 2));
      c.beginPath(); c.moveTo(0, y0); c.lineTo(x1, y0); c.lineTo(x1 + Math.abs(dy), y0 + dy); c.lineTo(size, y0 + dy); c.stroke();
      // 上下、左右接得起來
      c.beginPath(); c.moveTo(0, y0 + dy); c.lineTo(1, y0 + dy); c.stroke();
    }
    c.fillStyle = gray(255);
    for (let i = 0; i < 18; i++) { c.beginPath(); c.arc(r() * size, Math.round(r() * 16) * (size / 16), size / 70, 0, Math.PI * 2); c.fill(); }
  } else {
    // brushed：橫向髮絲紋
    c.fillStyle = gray(236); c.fillRect(0, 0, size, size);
    for (let i = 0; i < size * 1.5; i++) { c.fillStyle = gray(214 + r() * 41); c.globalAlpha = 0.5; c.fillRect(0, r() * size, size, 1); }
    c.globalAlpha = 1;
  }
  return cv;
};
const texture = (kind: string, scale: number) => {
  const key = `${kind}/${scale}`;
  let t = texCache.get(key);
  if (!t) {
    t = new THREE.CanvasTexture(drawTex(kind, 256));
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / scale, 1 / scale); t.colorSpace = THREE.SRGBColorSpace;
    texCache.set(key, t);
  }
  return t;
};

/** 柔邊圓點（蒸氣、熱浪用的貼圖） */
let puffTex: THREE.Texture | null = null;
export const puff = () => {
  if (puffTex) return puffTex;
  const cv = document.createElement("canvas"); cv.width = cv.height = 64;
  const c = cv.getContext("2d") as CanvasRenderingContext2D, g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.45, "rgba(255,255,255,0.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g; c.fillRect(0, 0, 64, 64);
  return (puffTex = new THREE.CanvasTexture(cv));
};

/** 地面假陰影用的貼圖：一塊邊緣模糊的圓角方形（白色，透明度當陰影濃度） */
let blobTex: THREE.Texture | null = null;
export const SHADOW_PAD = 0.18;
export const shadowBlob = () => {
  if (blobTex) return blobTex;
  const n = 128, cv = document.createElement("canvas"); cv.width = cv.height = n;
  const c = cv.getContext("2d") as CanvasRenderingContext2D, pad = n * SHADOW_PAD, r = n * 0.09;
  c.filter = `blur(${Math.round(n * 0.055)}px)`;
  c.fillStyle = gray(255);
  c.beginPath(); c.moveTo(pad + r, pad); c.arcTo(n - pad, pad, n - pad, n - pad, r); c.arcTo(n - pad, n - pad, pad, n - pad, r); c.arcTo(pad, n - pad, pad, pad, r); c.arcTo(pad, pad, n - pad, pad, r); c.closePath(); c.fill();
  return (blobTex = new THREE.CanvasTexture(cv));
};

/** 攝影棚環境貼圖（程式畫的全景：上亮下暗＋幾塊柔光箱＋黑旗），給金屬與玻璃反光用。顏色讀 THEME_3D.env。
 *  soft＝縮到很小再放大（等於模糊），給霧面金屬用；sharp 給玻璃與拋光面用 */
const envCache = new Map<string, THREE.Texture>();
export const studioEnv = (soft = false) => {
  const key = soft ? "soft" : "sharp";
  const hit = envCache.get(key);
  if (hit) return hit;
  const E = T.env, cv = document.createElement("canvas"); cv.width = 256; cv.height = 128;
  const c = cv.getContext("2d") as CanvasRenderingContext2D, g = c.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, E.sky); g.addColorStop(0.5, E.mid); g.addColorStop(0.56, E.ground); g.addColorStop(1, E.floor);
  c.fillStyle = g; c.fillRect(0, 0, 256, 128);
  c.fillStyle = E.box;
  for (const [x, y, w, h] of E.boxes) c.fillRect(x, y, w, h);
  c.fillStyle = E.dark;
  for (const [x, y, w, h] of E.flags) c.fillRect(x, y, w, h);
  let src = cv;
  if (soft) { src = document.createElement("canvas"); src.width = 32; src.height = 16; const c2 = src.getContext("2d") as CanvasRenderingContext2D; c2.imageSmoothingEnabled = true; c2.drawImage(cv, 0, 0, 32, 16); }
  const t = new THREE.CanvasTexture(src);
  t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
  envCache.set(key, t);
  return t;
};

/** 材質：資料 → three.js 材質。
 *  預設走「便宜的」路（fx.pbr＝false）：Phong 光照＋一次查表的環境反光。金屬＝底色乘上環境（有色的反光）、玻璃／清漆＝底色加上環境（白色的反光）。
 *  fx.pbr＝true 走物理材質（MeshStandard／Physical＋PMREM 環境貼圖），這台沒有顯示卡的機器每幀要多二十幾秒，只留著比較用。 */
export const makeMaterial = (m: ProductModel, name: string, fx: Fx, vertexColors = false): THREE.Material => {
  const d = m.materials[name] ?? { color: T.ink };
  const c = col(m, d.color), kind = d.kind ?? "std", rough = d.rough ?? (kind === "screen" ? 0.12 : 0.6), metal = d.metal ?? 0.05;
  if (kind === "unlit") return new THREE.MeshBasicMaterial({ color: c });
  const map = d.tex && fx.textures ? texture(d.tex, d.texScale ?? 1) : null;
  if (fx.pbr) {
    const common: THREE.MeshStandardMaterialParameters = { color: kind === "screen" ? T.part.screenBase : c, roughness: rough, metalness: metal, envMapIntensity: (d.env ?? (kind === "screen" ? 0.45 : 1)) * T.light.env, vertexColors };
    if (kind === "screen") { common.emissive = new THREE.Color(c); common.emissiveIntensity = d.ei ?? 0.9; (common as any).toneMapped = false; }
    else if (d.emissive) { common.emissive = new THREE.Color(col(m, d.emissive)); common.emissiveIntensity = d.ei ?? 0.3; }
    if (map) { common.map = map; if (d.bump) { common.bumpMap = map; common.bumpScale = d.bump; } }
    if ((kind === "phys" || kind === "screen") && fx.clearcoat) return new THREE.MeshPhysicalMaterial({ ...common, clearcoat: d.clearcoat ?? 1, clearcoatRoughness: d.clearcoatRough ?? 0.05 });
    return new THREE.MeshStandardMaterial(common);
  }
  const K = T.phong, gloss = 1 - rough, isMetal = metal >= 0.5, coat = (kind === "phys" || kind === "screen") && fx.clearcoat;
  const base = new THREE.Color(kind === "screen" ? T.part.screenBase : c);
  const p: THREE.MeshPhongMaterialParameters = { color: base.clone().multiplyScalar(isMetal ? K.metalBoost : 1), shininess: 4 + gloss * gloss * (coat ? K.shineCoat : K.shine), vertexColors };
  // 高光顏色：金屬帶底色、非金屬是灰白；愈粗糙愈弱
  p.specular = isMetal ? new THREE.Color(c).multiplyScalar(K.specMetal * (0.4 + 0.6 * gloss)) : new THREE.Color(T.panel).multiplyScalar((coat ? K.specCoat : K.specPlain) * gloss);
  if (kind === "screen") { p.emissive = new THREE.Color(c); p.emissiveIntensity = d.ei ?? 0.9; p.toneMapped = false; }
  else if (d.emissive) { p.emissive = new THREE.Color(col(m, d.emissive)); p.emissiveIntensity = d.ei ?? 0.3; }
  if (map) p.map = map;
  // 自發光畫面不加環境反光（面積大、每個像素多查一次貼圖，看起來差很少）；要加就在材質寫 env
  if (fx.env && (isMetal || coat) && (kind !== "screen" || d.env !== undefined)) {
    p.envMap = studioEnv(!(coat || rough < 0.27));
    if (isMetal) { p.combine = THREE.MultiplyOperation; p.reflectivity = Math.min(1, (d.env ?? 1) * K.envMetal * (0.55 + 0.45 * metal)); }
    else { p.combine = THREE.AddOperation; p.reflectivity = (d.env ?? 1) * K.envCoat * (d.clearcoat ?? 1); }
  }
  return new THREE.MeshPhongMaterial(p);
};
