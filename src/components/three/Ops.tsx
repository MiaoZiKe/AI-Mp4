// 運作動畫的 3D 部分（model.json 的 actions，由 script.json 每幕的 run 用 cue 觸發）：
// flow 沿路徑流動的光點／箭頭、wave 往外擴散的聲波圈、trace／sum 行進波與疊加後的波形、pulse 的光暈。
// vibrate／rotate／pulse 對零件本身的作用（位移、旋轉、發光）在 Scene.tsx 的零件迴圈裡；meter 是 HTML（ThreeVideo.tsx）。
// 這裡不寫任何產品的尺寸或顏色：位置、顏色、速度都讀資料；線寬與不透明度讀 THEME_3D.ops。
import React, { useMemo } from "react";
import * as THREE from "three";
import { THEME_3D as T } from "../../theme";
import { opPoint, signalVal, type State3D } from "./engine";
import { col, puff, type ActionDef, type ProductModel } from "./model";

const O = T.ops, UP = new THREE.Vector3(0, 1, 0), ZP = new THREE.Vector3(0, 0, 1);
const v3 = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2] ?? 0);
const frac = (x: number) => x - Math.floor(x);
/** 畫在最上層（不被零件擋住）的不受光材質；def.depth＝true 的動作才會被零件擋住 */
const flat = (color: string, depth = false) => new THREE.MeshBasicMaterial({ color, transparent: true, depthTest: depth, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false });
const SAMPLES = 72, RADIAL = 6;

type Res = { mat: THREE.MeshBasicMaterial; mats: THREE.MeshBasicMaterial[]; halo?: THREE.SpriteMaterial; ring?: THREE.BufferGeometry; tube?: THREE.BufferGeometry; axis: THREE.MeshBasicMaterial };

export const Ops: React.FC<{ model: ProductModel; s: State3D }> = ({ model, s }) => {
  const acts = model.actions ?? {};
  const geo = useMemo(() => ({ ball: new THREE.SphereGeometry(1, 14, 10), cone: new THREE.ConeGeometry(0.75, 2, 12), rod: new THREE.CylinderGeometry(1, 1, 1, 8) }), []);
  const res = useMemo(() => {
    const out: Record<string, Res> = {};
    for (const [id, d] of Object.entries(acts)) {
      const c = col(model, d.color ?? T.ink), dp = !!(d as any).depth;
      const r: Res = { mat: flat(c, dp), mats: [], axis: flat(T.ink3, dp) };
      // 每一圈聲波、每一顆光點各自一份材質（各自淡入淡出）
      if (d.type === "wave") {
        r.mats = Array.from({ length: d.count ?? 4 }, () => flat(c, dp));
        const w = Math.min(0.5, d.width ?? O.ring), a0 = ((d.arcStart ?? 0) * Math.PI) / 180, al = ((d.arc ?? 360) * Math.PI) / 180;
        r.ring = new THREE.RingGeometry(1 - w, 1, 56, 1, a0, al);
      }
      if (d.type === "flow") r.mats = Array.from({ length: d.n ?? 4 }, () => flat(c, dp));
      if (d.type === "pulse" && (d.halo ?? 0) > 0) r.halo = new THREE.SpriteMaterial({ map: puff(), color: c, transparent: true, depthTest: false, depthWrite: false, fog: false });
      if (d.type === "trace" || d.type === "sum") {
        // 一條管子：每一幀只改頂點位置（不重建幾何）
        const g = new THREE.BufferGeometry(), idx: number[] = [];
        g.setAttribute("position", new THREE.BufferAttribute(new Float32Array((SAMPLES + 1) * RADIAL * 3), 3));
        for (let j = 0; j < SAMPLES; j++) for (let k = 0; k < RADIAL; k++) { const a = j * RADIAL + k, b = j * RADIAL + ((k + 1) % RADIAL), c2 = a + RADIAL, d2 = b + RADIAL; idx.push(a, c2, b, b, c2, d2); }
        g.setIndex(idx);
        r.tube = g;
      }
      out[id] = r;
    }
    return out;
  }, [model]);

  const nodes: React.ReactNode[] = [];
  /** 兩點之間的一根細桿（軌道、波形的基準線） */
  const rod = (key: string, a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) => {
    const d = b.clone().sub(a), len = d.length();
    if (len < 1e-4) return;
    nodes.push(<mesh key={key} geometry={geo.rod} material={mat} position={a.clone().add(b).multiplyScalar(0.5)} quaternion={new THREE.Quaternion().setFromUnitVectors(UP, d.normalize())} scale={[r, len, r]} renderOrder={7} frustumCulled={false} />);
  };

  for (const [id, d] of Object.entries(acts)) {
    const op = s.ops[id], r = res[id];
    if (!op || !r || op.k <= 0.004 || (d as any).hidden) continue;
    if (d.type === "flow") {
      const pts = (d.path ?? []).map((p) => v3(opPoint(s, p, d.layer)));
      if (pts.length < 2) continue;
      const seg = pts.slice(1).map((p, i) => p.distanceTo(pts[i])), total = seg.reduce((a, b) => a + b, 0);
      if (d.track !== false) { r.mat.opacity = O.trackO * op.k; pts.slice(1).forEach((p, i) => rod(`${id}-t${i}`, pts[i], p, O.track, r.mat)); }
      const n = d.n ?? 4, size = (d.size ?? 0.12) * (0.6 + 0.4 * Math.min(1, op.g));
      for (let i = 0; i < n; i++) {
        const raw = op.t * (d.rate ?? 0.8) - (d.phase ?? 0) - i / n; // flow 的 phase＝晚一點出發（幾條並排的路徑錯開）
        if (raw < 0) continue; // 還沒出發
        const u = frac(raw);
        let dist = u * total, k = 0;
        while (k < seg.length - 1 && dist > seg[k]) { dist -= seg[k]; k++; }
        const dir = pts[k + 1].clone().sub(pts[k]).normalize(), pos = pts[k].clone().addScaledVector(dir, dist);
        const e = Math.min(1, u * 10, (1 - u) * 10);
        r.mats[i].opacity = op.k * e;
        nodes.push(d.shape === "arrow"
          ? <mesh key={`${id}-p${i}`} geometry={geo.cone} material={r.mats[i]} position={pos} quaternion={new THREE.Quaternion().setFromUnitVectors(UP, dir)} scale={size} renderOrder={9} frustumCulled={false} />
          : <mesh key={`${id}-p${i}`} geometry={geo.ball} material={r.mats[i]} position={pos} scale={size * (0.7 + 0.3 * e)} renderOrder={9} frustumCulled={false} />);
      }
    } else if (d.type === "wave" && r.ring) {
      const from = v3(opPoint(s, d.from, d.layer)), dir = v3(d.dir ?? [0, 0, 1]).normalize(), q = new THREE.Quaternion().setFromUnitVectors(ZP, dir);
      const n = d.count ?? 4, reach = d.reach ?? 3;
      for (let i = 0; i < n; i++) {
        const raw = op.t * (d.rate ?? 0.5) + (d.phase ?? 0) - i / n;
        if (raw < 0) continue;
        const u = frac(raw), rad = (d.r0 ?? 0.5) + (d.spread ?? 0.4) * u * reach;
        r.mats[i].opacity = O.ringO * Math.min(1, op.g) * Math.min(1, u * 7) * Math.pow(1 - u, 0.8);
        nodes.push(<mesh key={`${id}-w${i}`} geometry={r.ring} material={r.mats[i]} position={from.clone().addScaledVector(dir, u * reach)} quaternion={q} scale={rad} renderOrder={8} frustumCulled={false} />);
      }
    } else if ((d.type === "trace" || d.type === "sum") && r.tube) {
      const a = v3(opPoint(s, d.from, d.layer)), b = v3(opPoint(s, d.to, d.layer)), along = b.clone().sub(a);
      const up = v3(d.up ?? [0, 0, 1]).normalize(), side = along.clone().normalize().cross(up).normalize(), rad = d.radius ?? O.trace;
      const pos = r.tube.attributes.position as THREE.BufferAttribute;
      for (let j = 0; j <= SAMPLES; j++) {
        const u = j / SAMPLES, y = signalVal(model, s, id, u) * Math.min(1, u * 8, (1 - u) * 8);
        const cx = a.x + along.x * u + up.x * y, cy = a.y + along.y * u + up.y * y, cz = a.z + along.z * u + up.z * y;
        for (let k = 0; k < RADIAL; k++) { const t = (k / RADIAL) * Math.PI * 2, cu = Math.cos(t) * rad, cs = Math.sin(t) * rad; pos.setXYZ(j * RADIAL + k, cx + up.x * cu + side.x * cs, cy + up.y * cu + side.y * cs, cz + up.z * cu + side.z * cs); }
      }
      pos.needsUpdate = true;
      r.mat.opacity = op.k;
      if (d.axisLine !== false) { r.axis.opacity = O.axisO * op.k; rod(`${id}-ax`, a, b, O.axis, r.axis); }
      nodes.push(<mesh key={id} geometry={r.tube} material={r.mat} renderOrder={9} frustumCulled={false} />);
    } else if (d.type === "pulse" && r.halo) {
      const part = model.parts.find((p) => p.id === d.parts?.[0]);
      const c = d.at ? opPoint(s, d.at, d.layer) : opPoint(s, [(part?.pos?.[0] ?? 0) + (part?.at?.[0]?.[0] ?? 0), (part?.pos?.[1] ?? 0) + (part?.at?.[0]?.[1] ?? 0), (part?.pos?.[2] ?? 0) + (part?.at?.[0]?.[2] ?? 0)], part?.layer);
      const beat = d.steady ? 1 : 0.5 + 0.5 * Math.sin(Math.PI * 2 * (d.freq ?? 2) * op.t - Math.PI / 2), sz = (d.halo ?? 1) * (0.75 + 0.5 * beat);
      r.halo.opacity = O.halo * Math.min(1, op.g) * (0.35 + 0.65 * beat);
      nodes.push(<sprite key={id} material={r.halo} position={c} scale={[sz, sz, 1]} renderOrder={10} />);
    }
  }
  return <>{nodes}</>;
};

/** 零件本身的作用：vibrate 的位移、rotate 的旋轉、pulse 的發光（Scene.tsx 每個零件問一次） */
export type PartFx = { off: [number, number, number]; quat: THREE.Quaternion | null; pivot: number[] | null; glow: number; color: string | null };
export const partOps = (model: ProductModel): Map<string, [string, ActionDef][]> => {
  const m = new Map<string, [string, ActionDef][]>();
  for (const [id, d] of Object.entries(model.actions ?? {})) if (["vibrate", "rotate", "pulse"].includes(d.type)) for (const p of d.parts ?? []) m.set(p, [...(m.get(p) ?? []), [id, d]]);
  return m;
};
export const partFxAt = (list: [string, ActionDef][] | undefined, s: State3D): PartFx | null => {
  if (!list) return null;
  const fx: PartFx = { off: [0, 0, 0], quat: null, pivot: null, glow: 0, color: null };
  for (const [id, d] of list) {
    const op = s.ops[id];
    if (!op) continue;
    if (d.type === "vibrate") {
      const a = d.axis ?? [0, 0, 1], v = (d.amp ?? 0.1) * op.g * Math.sin(Math.PI * 2 * (d.freq ?? 4) * op.T);
      fx.off = [fx.off[0] + a[0] * v, fx.off[1] + a[1] * v, fx.off[2] + (a[2] ?? 0) * v];
    } else if (d.type === "rotate") {
      // 角度＝轉速 × 觸發後的時間（until 之後時間不再走，停在原地）
      fx.quat = new THREE.Quaternion().setFromAxisAngle(v3(d.axis ?? [0, 0, 1]).normalize(), Math.PI * 2 * (d.rps ?? 1) * op.t);
      fx.pivot = d.pivot ?? null;
    } else if (d.type === "pulse") {
      // steady＝不閃，穩定亮著（強度只跟著進出場 ramp；例如電壓維持在高的那段時間）
      const beat = d.steady ? 1 : 0.5 + 0.5 * Math.sin(Math.PI * 2 * (d.freq ?? 2) * op.t - Math.PI / 2);
      fx.glow = Math.max(fx.glow, (d.glow ?? 0.8) * Math.min(1, op.g) * (0.35 + 0.65 * beat)); fx.color = d.color ?? null;
    }
  }
  return fx;
};
