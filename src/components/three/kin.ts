// 關節鏈（運動學，2026/11/17）：機械手臂這類「一節接一節」的東西，用真正的父子階層變換算，不再讓每個零件各自繞轉軸轉。
//   model.kin[臂 id]＝{ layer, joints: [{ id, parent?, type: "rot"｜"slide", axis, pivot（rot 的轉軸點，靜止姿態的世界座標）, parts, min, max, drive? }], tip, grip, body, size }
//   每個關節的世界矩陣＝父關節的世界矩陣 × 自己的局部變換（rot：繞 pivot 轉；slide：沿 axis 平移），等同 three.js 的 Group 一層包一層；
//   零件的畫面位置＝該關節的世界矩陣 × 零件的靜止位置。子關節一定跟著父關節走，不可能脫節。
//   被夾的東西（carry）：夾住那一幀記下「夾爪→物件」的相對變換，之後物件＝夾爪世界矩陣 × 這個相對變換（等同 reparent 到夾爪，世界座標連續不跳）；
//   放開那一幀起停在放開時的位置。關節角度由 script.json 的 props.kin 關鍵格（motions.mjs 的 arm-transfer 會產生）內插，緩入緩出。
// 這支只做數學（沒有 React），Scene.tsx（畫面）和 scripts/three/kinematics-check.mjs（逐幀檢查）用同一份。
import * as THREE from "three";
import { EASE } from "../anim";

export type KinJoint = { id: string; parent?: string; type: "rot" | "slide"; axis: number[]; pivot?: number[]; parts: string[]; min?: number; max?: number; drive?: string };
export type KinDef = {
  layer: string; joints: KinJoint[];
  /** 末端關節（夾爪掛在這節） */ tip: string;
  /** 夾持點（兩根手指中間、手指高度一半；靜止姿態的世界座標） */ grip: number[];
  /** 這支手臂所有的零件（含不動的底座），檢查穿模時用 */ body: string[];
  /** 臂長（各節長度相加），連接誤差的容許值用它的 0.5% */ size: number;
  info?: Record<string, any>;
};
/** 一段動作的關鍵格：絕對幀 → 各關節的值（rot＝度、slide＝長度）；值是累積的（沒寫的沿用上一格） */
export type KinTrack = { arm: string; keys: [number, Record<string, number>][] };
export type KinCarry = { arm: string; layer: string; grab: number; release: number };
export type KinState = {
  vals: Record<string, Record<string, number>>;
  /** 各臂各關節的世界矩陣（含手臂那一層的位移） */
  mats: Record<string, Record<string, THREE.Matrix4>>;
  /** 被夾物件那一層的世界矩陣（乘在零件的靜止位置上；沒被夾過＝沒有） */
  carry: Record<string, THREE.Matrix4>;
};
type Layers = Record<string, { x: number; y: number; z: number }>;

const v3 = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2] ?? 0);

/** 這一幀各關節的值（關鍵格之間緩入緩出；第一格之前＝第一格；沒有關鍵格＝全 0） */
export const kinVals = (def: KinDef, tracks: KinTrack[], arm: string, f: number): Record<string, number> => {
  const v: Record<string, number> = {};
  for (const j of def.joints) v[j.drive ?? j.id] = 0;
  for (const tr of tracks) {
    if (tr.arm !== arm || !tr.keys.length) continue;
    const ks = tr.keys;
    if (f < ks[0][0]) continue;
    let i = 0;
    while (i < ks.length - 1 && f >= ks[i + 1][0]) i++;
    const a: Record<string, number> = { ...v };
    for (let j = 0; j <= i; j++) Object.assign(a, ks[j][1]);
    if (i === ks.length - 1) { Object.assign(v, a); continue; }
    const b = { ...a, ...ks[i + 1][1] }, t = EASE.move(Math.max(0, Math.min(1, (f - ks[i][0]) / Math.max(1, ks[i + 1][0] - ks[i][0]))));
    for (const k of Object.keys(b)) v[k] = (a[k] ?? 0) + ((b[k] ?? 0) - (a[k] ?? 0)) * t;
  }
  return v;
};

/** 一個關節自己的局部變換（在靜止姿態的座標裡） */
const localOf = (j: KinJoint, val: number) => {
  if (j.type === "slide") return new THREE.Matrix4().makeTranslation(v3(j.axis).normalize().multiplyScalar(val));
  const p = v3(j.pivot ?? [0, 0, 0]);
  return new THREE.Matrix4().makeTranslation(p.x, p.y, p.z)
    .multiply(new THREE.Matrix4().makeRotationAxis(v3(j.axis).normalize(), (val * Math.PI) / 180))
    .multiply(new THREE.Matrix4().makeTranslation(-p.x, -p.y, -p.z));
};

/** 各關節的世界矩陣：由根往末端連乘（父 × 子）；layer＝手臂那一層的位移 */
export const jointMats = (def: KinDef, vals: Record<string, number>, layer?: { x: number; y: number; z: number }) => {
  const out: Record<string, THREE.Matrix4> = {}, root = new THREE.Matrix4().makeTranslation(layer?.x ?? 0, layer?.y ?? 0, layer?.z ?? 0);
  for (const j of def.joints) {
    const parent = j.parent ? out[j.parent] : root;
    if (!parent) throw new Error(`kin：關節「${j.id}」的父關節「${j.parent}」要寫在它前面`);
    const lo = j.min ?? -Infinity, hi = j.max ?? Infinity, raw = vals[j.drive ?? j.id] ?? 0;
    out[j.id] = parent.clone().multiply(localOf(j, Math.max(lo, Math.min(hi, raw))));
  }
  return out;
};

/** stateAt 用：算這一幀所有手臂的關節矩陣與被夾物件的矩陣。layersAt(f)＝那一幀各層的位移（不含 kin，避免遞迴） */
export const kinState = (kin: Record<string, KinDef> | undefined, tracks: KinTrack[], carries: KinCarry[], f: number, layers: Layers, layersAt: (f: number) => Layers): KinState | undefined => {
  if (!kin || !Object.keys(kin).length) return undefined;
  const st: KinState = { vals: {}, mats: {}, carry: {} };
  const tipAt = (arm: string, g: number, L: Layers) => { const d = kin[arm]; return jointMats(d, kinVals(d, tracks, arm, g), L[d.layer])[d.tip]; };
  for (const [arm, d] of Object.entries(kin)) {
    st.vals[arm] = kinVals(d, tracks, arm, f);
    st.mats[arm] = jointMats(d, st.vals[arm], layers[d.layer]);
  }
  for (const c of carries) {
    if (f < c.grab || !kin[c.arm]) continue;
    const Lg = layersAt(c.grab), fr = Math.min(f, c.release), Lr = fr === f ? layers : layersAt(fr);
    const Ag = tipAt(c.arm, c.grab, Lg), Ar = fr === f ? st.mats[c.arm][kin[c.arm].tip] : tipAt(c.arm, fr, Lr);
    const li = (L: Layers) => L[c.layer] ?? { x: 0, y: 0, z: 0 }, g0 = li(Lg), r0 = li(Lr), n0 = li(layers);
    // 物件世界矩陣＝（放開之後該層的新位移）×夾爪(放開或現在)×夾爪(夾住)⁻¹×物件(夾住時)
    st.carry[c.layer] = new THREE.Matrix4().makeTranslation(n0.x - r0.x, n0.y - r0.y, n0.z - r0.z)
      .multiply(Ar).multiply(Ag.clone().invert()).multiply(new THREE.Matrix4().makeTranslation(g0.x, g0.y, g0.z));
  }
  return st;
};

/** 零件 id → 所屬（臂, 關節）。每個 kin 定義算一次 */
const ownerCache = new WeakMap<object, Map<string, [string, string]>>();
export const kinOwner = (kin: Record<string, KinDef> | undefined) => {
  if (!kin) return null;
  let m = ownerCache.get(kin);
  if (!m) { m = new Map(); for (const [arm, d] of Object.entries(kin)) for (const j of d.joints) for (const p of j.parts) m.set(p, [arm, j.id]); ownerCache.set(kin, m); }
  return m;
};

/** 零件的畫面矩陣（含零件靜止位置；乘在幾何上就是畫面位置）。不歸關節鏈管、也沒被夾的零件回傳 null（走舊算法） */
export const kinPartMatrix = (kin: Record<string, KinDef> | undefined, ks: KinState | undefined, p: { id?: string; layer: string; pos?: number[] }): THREE.Matrix4 | null => {
  if (!ks || !kin) return null;
  const q = p.pos ?? [0, 0, 0], rest = new THREE.Matrix4().makeTranslation(q[0], q[1], q[2] ?? 0);
  const cm = ks.carry[p.layer];
  if (cm) return cm.clone().multiply(rest);
  const o = p.id ? kinOwner(kin)?.get(p.id) : undefined;
  if (!o) return null;
  return ks.mats[o[0]][o[1]].clone().multiply(rest);
};

/** 夾持點這一幀的世界座標 */
export const kinGripPoint = (def: KinDef, ks: KinState, arm: string) => v3(def.grip).applyMatrix4(ks.mats[arm][def.tip]);
