// 每個零件這一幀的畫面姿態（位置、轉向、伸縮）。Scene.tsx（畫面）與 scripts/three/kinematics-check.mjs（逐幀檢查）用同一份，
// 所以檢查看到的就是畫面上的位置。歸關節鏈（model.kin）管的零件與被夾的物件走 kin.ts 的階層變換；其他零件照舊（vibrate 位移、rotate 繞轉軸、grow 伸縮）。
import * as THREE from "three";
import type { State3D } from "./engine";
import { kinPartMatrix } from "./kin";
import type { PartDef, ProductModel } from "./model";
import { partFxAt, rotDelta, type PartFx } from "./Ops";
import type { ActionDef } from "./model";

export type PartPose = { pos: [number, number, number]; quat: THREE.Quaternion | null; scale: [number, number, number] | null; fx: PartFx | null };
const _p = new THREE.Vector3(), _s = new THREE.Vector3();
export const lidOffset = (model: ProductModel, s: State3D): [number, number, number] => {
  const th = model.thermal;
  return th ? [-th.lidTravel * s.lid - 0.9 * s.lidLift, 0, 0.5 * Math.sin(Math.PI * Math.min(1, s.lid)) + 1.6 * s.lidLift] : [0, 0, 0];
};
export const partPose = (model: ProductModel, s: State3D, p: PartDef, ops: [string, ActionDef][] | undefined, lidOff: [number, number, number]): PartPose => {
  const L = s.layers[p.layer];
  const pf = p.id ? partFxAt(ops, s, p) : null;
  const km = kinPartMatrix(model.kin, s.kin, p);
  if (km) { const q = new THREE.Quaternion(); km.decompose(_p, q, _s); return { pos: [_p.x, _p.y, _p.z], quat: q, scale: null, fx: pf }; }
  const q = p.pos ?? [0, 0, 0], off = p.role === "lid" ? lidOff : [0, 0, 0];
  // 運作動畫：vibrate 加位移；rotate 繞轉軸轉（轉軸預設是零件自己的位置）
  let px = q[0] + off[0] + L.x + (pf?.off[0] ?? 0), py = q[1] + off[1] + L.y + (pf?.off[1] ?? 0);
  let pz = (q[2] ?? 0) + L.z + off[2] + (pf?.off[2] ?? 0);
  if (pf?.quat && pf.hier) { const dd = rotDelta(pf, q); px += dd[0]; py += dd[1]; pz += dd[2]; }
  else if (pf?.quat && pf.pivot) { const r = new THREE.Vector3(q[0] - pf.pivot[0], q[1] - pf.pivot[1], 0).applyQuaternion(pf.quat); px += r.x - (q[0] - pf.pivot[0]); py += r.y - (q[1] - pf.pivot[1]); }
  // grow：以零件底部（y 最低處）為基準伸縮，底部不離開桌面
  const gs = pf?.grow ?? null;
  if (gs) py += ((gs[1] - 1) * (p.size[1] ?? 0)) / 2;
  return { pos: [px, py, pz], quat: pf?.quat ?? null, scale: gs, fx: pf };
};
