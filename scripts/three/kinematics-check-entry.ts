// scripts/three/kinematics-check.mjs 用 esbuild 打包這支（不開瀏覽器）：用和畫面同一份的 engine.ts／pose.ts／kin.ts，每 2 幀算出每個零件的畫面姿態，檢查
//   ① 連接：每個關節在父節上算出的轉軸點和在子節上算出的同一點，距離要 <0.5% 臂長（父端點＝子基點）；靜止姿態的轉軸點要真的落在父節與子節的零件上；
//      升降、夾指這類滑動關節：子節只能沿軸移動，偏離軸線也算脫節。
//   ② 夾取：夾住到放開之間，夾持點（兩指中間）要在被夾物件的包圍盒上（距離 ≈0）。
//   ③ 穿模：手臂各零件（含正被夾著的物件）的包圍盒和其他看得到的零件的包圍盒不能交叉（貼著不算；表面的線路、焊墊只有 0.006 厚，重疊 >0.01 才算）。
//   ④ 關節上下限：關鍵格要求的值超出上下限。
// 舊式關節鏈（model.actions 的 rotate 寫 chain／3D pivot）只檢查①。
import * as THREE from "three";
import { buildModel, stateAt } from "../../src/components/three/engine";
import { partFxAt, partOps, rotDelta } from "../../src/components/three/Ops";
import { lidOffset, partPose, type PartPose } from "../../src/components/three/pose";
import { jointMats, kinGripPoint, kinOwner, type KinDef } from "../../src/components/three/kin";
import { buildGeo } from "../../src/components/three/model";

type Issue = { level: "error" | "warn"; kind: string; msg: string; frames: [number, number] };
type PoseFn = (model: any, s: any, p: any, ops: any, lidOff: [number, number, number]) => PartPose;

/** 自我測試用：重現 2026/11/17 之前的舊算法（第一個轉動的四元數被後面 multiply 改掉），證明檢查抓得到 */
export const buggyPose: PoseFn = (model, s, p, ops, lidOff) => {
  const L = s.layers[p.layer], pf = p.id ? partFxAt(ops, s, p) : null;
  if (pf && pf.xf.length > 1 && pf.quat) pf.xf[0] = { ...pf.xf[0], q: pf.quat.clone() }; // 舊版 fx.quat 與 xf[0].q 是同一個物件
  const q = p.pos ?? [0, 0, 0];
  let px = q[0] + L.x + (pf?.off[0] ?? 0), py = q[1] + L.y + (pf?.off[1] ?? 0), pz = (q[2] ?? 0) + L.z + (pf?.off[2] ?? 0);
  if (pf?.quat && pf.hier) { const d = rotDelta(pf, q); px += d[0]; py += d[1]; pz += d[2]; }
  return { pos: [px, py, pz], quat: pf?.quat ?? null, scale: null, fx: pf };
};

/** 自我測試用：關節各自繞自己的轉軸轉、子關節不跟著父關節走（沒有父子階層）——使用者 2026/11/17 看到的「前臂脫離、飄在空中」就是這種 */
export const flatPose: PoseFn = (model, s, p, ops, lidOff) => {
  const o = p.id ? kinOwner(model.kin)?.get(p.id) : undefined;
  if (!o || !s.kin) return partPose(model, s, p, ops, lidOff);
  const d = model.kin[o[0]], flat = { ...d, joints: d.joints.map((j: any) => ({ ...j, parent: undefined })) };
  const M = jointMats(flat, s.kin.vals[o[0]], s.layers[d.layer])[o[1]], q = p.pos ?? [0, 0, 0];
  M.multiply(new THREE.Matrix4().makeTranslation(q[0], q[1], q[2] ?? 0));
  const P = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3(); M.decompose(P, Q, S);
  return { pos: [P.x, P.y, P.z], quat: Q, scale: null, fx: null };
};

export const check = (script: any, opts: { step?: number; pose?: PoseFn } = {}) => {
  const model = script.model, tl = script.timeline, step = opts.step ?? 2, poseFn = opts.pose ?? partPose;
  const issues: Issue[] = [];
  // 同一種問題連續幾幀合成一筆
  const open = new Map<string, Issue>();
  const hit = (level: "error" | "warn", kind: string, key: string, msg: string, f: number) => {
    const k = `${kind}|${key}`, o = open.get(k);
    if (o && f - o.frames[1] <= step) { o.frames[1] = f; return; }
    const n: Issue = { level, kind, msg, frames: [f, f] }; open.set(k, n); issues.push(n);
  };
  const byId = new Map<string, any>(model.parts.filter((p: any) => p.id).map((p: any) => [p.id, p]));
  // 每個零件的局部包圍盒（含 rot、at 複製；和畫面同一份幾何）
  // at／grid 複製出來的每一份各算一個盒子（不然兩側護欄合成一個大盒子，中間的東西都會被算成穿模）
  const boxCache = new Map<string, THREE.Box3[]>();
  const localBoxes = (p: any) => {
    let b = boxCache.get(p.id);
    if (!b) {
      const g = buildGeo({ ...p, at: undefined, grid: undefined }); g.computeBoundingBox(); const one = g.boundingBox!.clone(); g.dispose();
      const copies: number[][] = [...(p.at ?? [])];
      if (p.grid) { const [nx, ny] = p.grid.n, [sx, sy] = p.grid.step; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) copies.push([(i - (nx - 1) / 2) * sx, (j - (ny - 1) / 2) * sy]); }
      b = copies.length ? copies.map((c) => one.clone().translate(new THREE.Vector3(c[0], c[1], c[2] ?? 0))) : [one];
      boxCache.set(p.id, b);
    }
    return b;
  };
  const union = (bs: THREE.Box3[]) => bs.reduce((a, b) => a.union(b), new THREE.Box3());
  const restBox = (p: any) => { const q = p.pos ?? [0, 0, 0]; return union(localBoxes(p)).translate(new THREE.Vector3(q[0], q[1], q[2] ?? 0)); };
  const poseMat = (pp: PartPose) => new THREE.Matrix4().compose(new THREE.Vector3(...pp.pos), pp.quat ?? new THREE.Quaternion(), new THREE.Vector3(...(pp.scale ?? [1, 1, 1])));
  const restInv = (p: any) => { const q = p.pos ?? [0, 0, 0]; return new THREE.Matrix4().makeTranslation(-q[0], -q[1], -(q[2] ?? 0)); };
  const near = (b: THREE.Box3, pt: THREE.Vector3, tol: number) => b.clone().expandByScalar(tol).containsPoint(pt);

  const kin: Record<string, KinDef> = model.kin ?? {};
  // ── 靜態：轉軸點要落在父節與子節的零件上（不然轉起來就是繞空中一點轉，一定脫節） ──
  type Link = { arm: string; joint: any; parentParts: string[]; childParts: string[]; tol: number; size: number };
  const links: Link[] = [];
  for (const [arm, d] of Object.entries(kin)) {
    const J = new Map(d.joints.map((j) => [j.id, j]));
    const upParts = (id?: string): string[] => { let j = id ? J.get(id) : undefined; while (j && !j.parts.length) j = j.parent ? J.get(j.parent) : undefined; return j ? j.parts : []; };
    const downParts = (id: string): string[] => { const j = J.get(id)!; if (j.parts.length) return j.parts; for (const c of d.joints) if (c.parent === id) { const r = downParts(c.id); if (r.length) return r; } return []; };
    for (const j of d.joints) {
      const pp = j.parent ? upParts(j.parent) : [], cp = downParts(j.id), tol = 0.005 * d.size;
      // 沒有自己零件的轉動關節（例如腕 j3：只帶著下面的升降桿轉）由下一個滑動關節檢查（子節只能沿軸移動）
      if (!j.parent || !pp.length || !cp.length || (j.type === "rot" && !j.parts.length)) continue;
      links.push({ arm, joint: j, parentParts: pp, childParts: cp, tol, size: d.size });
      if (j.type === "rot") {
        const pv = new THREE.Vector3(...(j.pivot as [number, number, number]));
        if (!pp.some((id) => near(restBox(byId.get(id)), pv, tol))) hit("error", "連接", `${arm}.${j.id}.p`, `${arm} 的關節 ${j.id}：轉軸點 ${pv.toArray().map((v) => v.toFixed(2))} 不在父節（${pp.join("、")}）上，轉起來會脫節`, 0);
        if (!cp.some((id) => near(restBox(byId.get(id)), pv, tol))) hit("error", "連接", `${arm}.${j.id}.c`, `${arm} 的關節 ${j.id}：轉軸點 ${pv.toArray().map((v) => v.toFixed(2))} 不在子節（${cp.join("、")}）上，轉起來會脫節`, 0);
      } else {
        // 滑動關節：靜止時子節要貼著父節
        const ok = cp.some((c) => pp.some((p) => restBox(byId.get(c)).clone().expandByScalar(tol).intersectsBox(restBox(byId.get(p)))));
        if (!ok) hit("error", "連接", `${arm}.${j.id}.s`, `${arm} 的滑動關節 ${j.id}：靜止時子節（${cp.join("、")}）沒有貼著父節（${pp.join("、")}）`, 0);
      }
    }
  }
  // 舊式關節鏈：rotate 動作寫了 chain 或 3D pivot，B 的零件是 A 的子集合＝B 掛在 A 下面
  const legacy: { a: string; b: string; pivot: number[]; parentParts: string[]; childParts: string[]; tol: number }[] = [];
  const rots = Object.entries(model.actions ?? {}).filter(([, d]: any) => d.type === "rotate" && (d.chain || (d.pivot && d.pivot.length > 2)) && d.parts?.length) as [string, any][];
  for (const [ia, A] of rots) for (const [ib, B] of rots) {
    if (ia === ib || B.parts.length >= A.parts.length || !B.parts.every((x: string) => A.parts.includes(x)) || !B.pivot || B.pivot.length < 3) continue;
    const pp = A.parts.filter((x: string) => !B.parts.includes(x));
    const ext = new THREE.Box3(); for (const id of A.parts) if (byId.get(id)) ext.union(restBox(byId.get(id)));
    const tol = 0.005 * ext.getSize(new THREE.Vector3()).length();
    legacy.push({ a: ia, b: ib, pivot: B.pivot, parentParts: pp, childParts: B.parts, tol });
    const pv = new THREE.Vector3(...B.pivot);
    if (!pp.some((id: string) => near(restBox(byId.get(id)), pv, tol)) || !B.parts.some((id: string) => near(restBox(byId.get(id)), pv, tol))) hit("error", "連接", `${ia}>${ib}.static`, `舊式關節鏈 ${ia} → ${ib}：${ib} 的轉軸點不在兩節的接頭上`, 0);
  }
  if (!links.length && !legacy.length && !Object.keys(kin).length) return { issues, stats: { frames: 0, arms: 0, legacy: 0 } };
  if (!tl) return { issues, stats: { frames: 0, arms: Object.keys(kin).length, legacy: legacy.length, skipped: "沒有 timeline.json" } };

  const m = buildModel(script.scenes, tl, model), pops = partOps(model);
  const armParts = new Set<string>(); for (const d of Object.values(kin)) for (const id of d.body) armParts.add(id);
  const layerParts = (layer: string) => model.parts.filter((p: any) => p.layer === layer && p.id);
  let frames = 0;
  for (let f = 0; f < m.total; f += step) {
    frames++;
    const s: any = stateAt(m, f), lo = lidOffset(model, s);
    const cache = new Map<string, PartPose>();
    const pose = (id: string) => { let r = cache.get(id); if (!r) { const p = byId.get(id); r = poseFn(model, s, p, pops.get(id), lo); cache.set(id, r); } return r; };
    const world = (id: string, pt: THREE.Vector3) => pt.clone().applyMatrix4(restInv(byId.get(id))).applyMatrix4(poseMat(pose(id)));
    const wboxes = (id: string) => { const M = poseMat(pose(id)); return localBoxes(byId.get(id)).map((b) => b.clone().applyMatrix4(M)); };
    const wbox = (id: string) => union(wboxes(id));
    const vis = (id: string) => (s.layers[byId.get(id).layer]?.opacity ?? 0) > 0.05;
    // ① 連接（關節鏈）
    for (const L of links) {
      const j = L.joint, pId = L.parentParts[0], cId = L.childParts[0];
      if (j.type === "rot") {
        const pv = new THREE.Vector3(...(j.pivot as [number, number, number])), a = world(pId, pv), b = world(cId, pv), d = a.distanceTo(b);
        if (d > L.tol) hit("error", "連接", `${L.arm}.${j.id}`, `${L.arm} 的關節 ${j.id} 脫節：父節（${pId}）的端點和子節（${cId}）的基點差 ${d.toFixed(3)}（容許 ${L.tol.toFixed(3)}＝臂長 0.5%）`, f);
      } else {
        // 子節的參考點相對父節只能沿軸移動
        const ref = new THREE.Vector3(...(byId.get(cId).pos as [number, number, number]));
        const a = world(pId, ref), b = world(cId, ref), ax = new THREE.Vector3(...(j.axis as [number, number, number])).normalize().transformDirection(poseMat(pose(pId)));
        const dv = b.clone().sub(a), along = dv.dot(ax), perp = dv.clone().sub(ax.clone().multiplyScalar(along)).length();
        if (perp > L.tol) hit("error", "連接", `${L.arm}.${j.id}`, `${L.arm} 的滑動關節 ${j.id} 脫節：子節偏離滑軌 ${perp.toFixed(3)}（容許 ${L.tol.toFixed(3)}）`, f);
        if (along < (j.min ?? -Infinity) - L.tol || along > (j.max ?? Infinity) + L.tol) hit("error", "連接", `${L.arm}.${j.id}.r`, `${L.arm} 的滑動關節 ${j.id} 滑出行程：${along.toFixed(3)}（${j.min}～${j.max}）`, f);
      }
    }
    for (const L of legacy) {
      if (!pops.get(L.childParts[0])?.some(([id]) => s.ops[id])) continue;
      const pv = new THREE.Vector3(...(L.pivot as [number, number, number])), a = world(L.parentParts[0], pv), b = world(L.childParts[0], pv), d = a.distanceTo(b);
      if (d > L.tol) hit("error", "連接", `${L.a}>${L.b}`, `舊式關節鏈 ${L.a} → ${L.b} 脫節：父節（${L.parentParts[0]}）的端點和子節（${L.childParts[0]}）的基點差 ${d.toFixed(3)}（容許 ${L.tol.toFixed(3)}）`, f);
    }
    if (!s.kin) continue;
    // ④ 關節上下限
    for (const [arm, d] of Object.entries(kin)) for (const j of d.joints) {
      const v = s.kin.vals[arm]?.[j.drive ?? j.id] ?? 0;
      if (v < (j.min ?? -Infinity) - 1e-6 || v > (j.max ?? Infinity) + 1e-6) hit("error", "上下限", `${arm}.${j.id}`, `${arm} 的關節 ${j.id}＝${v.toFixed(2)} 超出上下限 ${j.min}～${j.max}`, f);
    }
    // ② 夾取
    const carried = new Set<string>();
    for (const c of m.kinCarries ?? []) {
      if (f < c.grab || f > c.release) continue;
      const d = kin[c.arm]; if (!d) continue;
      const g = kinGripPoint(d, s.kin, c.arm), ids = layerParts(c.layer).map((p: any) => p.id), box = new THREE.Box3();
      ids.forEach((id: string) => { carried.add(id); box.union(wbox(id)); });
      const dist = box.distanceToPoint(g), tol = 0.005 * d.size;
      if (dist > tol) hit("error", "夾取", `${c.arm}.${c.layer}`, `${c.arm} 夾著「${c.layer}」的期間，夾持點離物件 ${dist.toFixed(3)}（應該 ≈0，容許 ${tol.toFixed(3)}）：夾爪沒有真的夾住`, f);
    }
    // ③ 穿模：手臂（含正被夾著的物件）× 其他看得到的零件
    const mine = [...armParts, ...carried].filter((id) => byId.get(id) && vis(id));
    if (!mine.length) continue;
    const others = model.parts.filter((p: any) => p.id && !armParts.has(p.id) && !carried.has(p.id) && vis(p.id) && p.shape !== "plane");
    const ob = others.flatMap((p: any) => wboxes(p.id).map((b) => [p.id, b] as [string, THREE.Box3]));
    for (const id of mine) for (const a of wboxes(id)) {
      for (const [oid, b] of ob) {
        const i = a.clone().intersect(b);
        if (i.isEmpty()) continue;
        const sz = i.getSize(new THREE.Vector3());
        if (Math.min(sz.x, sz.y, sz.z) > 0.01) hit("error", "穿模", `${id}×${oid}`, `${id} 穿過 ${oid}（重疊 ${sz.toArray().map((v) => v.toFixed(3)).join("×")}）`, f);
      }
    }
  }
  return { issues, stats: { frames, arms: Object.keys(kin).length, legacy: legacy.length } };
};
