// 運作動畫的 3D 部分（model.json 的 actions，由 script.json 每幕的 run 用 cue 觸發）：
// flow 沿路徑流動的光點／箭頭、wave 往外擴散的聲波圈、trace／sum 行進波與疊加後的波形、pulse 的光暈。
// vibrate／rotate／pulse 對零件本身的作用（位移、旋轉、發光）在 Scene.tsx 的零件迴圈裡；meter 是 HTML（ThreeVideo.tsx）。
// 這裡不寫任何產品的尺寸或顏色：位置、顏色、速度都讀資料；線寬與不透明度讀 THEME_3D.ops。
import React, { useMemo } from "react";
import * as THREE from "three";
import { THEME_3D as T } from "../../theme";
import { EASE, tween } from "../anim";
import { opPoint, signalVal, type State3D } from "./engine";
import { col, puff, type ActionDef, type ProductModel } from "./model";

const O = T.ops, UP = new THREE.Vector3(0, 1, 0), ZP = new THREE.Vector3(0, 0, 1);
const v3 = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2] ?? 0);
const frac = (x: number) => x - Math.floor(x);
/** 固定 seed 的亂數（同一個 k 永遠同一個值）：電子流的稀疏順序與抖動 */
const hash01 = (k: number) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** 畫在最上層（不被零件擋住）的不受光材質；def.depth＝true 的動作才會被零件擋住 */
const flat = (color: string, depth = false) => new THREE.MeshBasicMaterial({ color, transparent: true, depthTest: depth, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false });
const SAMPLES = 72, RADIAL = 6;
/** lpp 一輪裡的時刻（0–1）：預脈衝打到、主脈衝打到（之後是電漿發光） */
export const LPP = { pre: 0.32, main: 0.58 };
/** lpp 的相位（0–1）：觸發後的時間 ÷ 一輪幾秒；3D（Ops）和 2D 剖面（Hud.tsx section kind: "lpp"）共用 */
export const lppPhase = (d: ActionDef, t: number) => { const per = d.lpp?.period ?? 1.1; const x = t / per + (d.phase ?? 0); return x - Math.floor(x); };

type Res = { mat: THREE.MeshBasicMaterial; mats: THREE.MeshBasicMaterial[]; pm?: THREE.MeshBasicMaterial[]; halo?: THREE.SpriteMaterial; ring?: THREE.BufferGeometry; tube?: THREE.BufferGeometry; axis: THREE.MeshBasicMaterial };

export const Ops: React.FC<{ model: ProductModel; s: State3D }> = ({ model, s }) => {
  const acts = model.actions ?? {};
  const geo = useMemo(() => ({ ball: new THREE.SphereGeometry(1, 14, 10), cone: new THREE.ConeGeometry(0.75, 2, 12), rod: new THREE.CylinderGeometry(1, 1, 1, 8), box: new THREE.BoxGeometry(1, 1, 1), disc: new THREE.CylinderGeometry(1, 1, 0.18, 10) }), []);
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
      if (d.type === "flow") {
        // 每顆一份核心材質；有 rim／trail 時再加外圈與拖尾（各自淡入淡出）
        const per = 2 + (d.trail ?? 0), tc = col(model, d.trailColor ?? d.color ?? T.ink), rc = col(model, d.rim ?? d.color ?? T.ink);
        r.mats = Array.from({ length: (d.n ?? 4) * Math.max(1, d.lanes ?? 1) * per }, (_, j) => flat(j % per === 0 ? c : j % per === 1 ? rc : tc, dp));
        // plus（2026/11/24 tech-resist1）：每顆點一個白色「＋」（正離子），畫在點的上層
        if (d.plus) r.pm = Array.from({ length: (d.n ?? 4) * Math.max(1, d.lanes ?? 1) }, () => flat(typeof d.plus === "string" ? col(model, d.plus) : "#FFFFFF", false));
      }
      if (d.type === "lpp") {
        // 0–7 錫滴（排隊往下掉）、8 預脈衝光束、9 主脈衝光束、10 扁平錫餅、11 電漿球、12–19 噴出的碎點；halo＝電漿閃光
        const L = d.lpp ?? {};
        r.mats = Array.from({ length: 20 }, (_, j) => flat(j < 8 ? c : j === 8 ? col(model, L.pre ?? d.color ?? T.ink) : j === 9 ? col(model, L.main ?? d.color ?? T.ink) : j === 10 ? c : col(model, L.glow ?? d.color ?? T.ink), dp));
        r.halo = new THREE.SpriteMaterial({ map: puff(), color: col(model, L.glow ?? d.color ?? T.ink), transparent: true, depthTest: false, depthWrite: false, fog: false });
      }
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
    if (!op || !r || (d as any).hidden) continue;
    // drive 的 flow 停住後還要留 rest 幀（停住的點），其他動作強度歸零就不畫
    if (op.k <= 0.004 && !(d.type === "flow" && d.drive && d.rest && op.f < op.end + d.rest + 8)) continue;
    if (d.type === "flow") {
      const pts0 = (d.path ?? []).map((p) => v3(opPoint(s, p, d.layer)));
      if (pts0.length < 2) continue;
      const n = d.n ?? 4, lanes = Math.max(1, d.lanes ?? 1), trail = d.trail ?? 0, drive = !!d.drive;
      // drive：位置用累積量 u（強度下降＝慢下來）；停住後留 rest 幀（restO 不透明度）再淡出
      // 從開始減速（until）起，點至少保持 restO 的不透明度：看得到「慢下來、停住」，停住後留 rest 幀再淡出
      const restK = drive && d.rest && op.f >= op.until ? (d.restO ?? 0.55) * (1 - tween(op.f, op.end + d.rest, 8, EASE.move)) : 0;
      const vis = drive ? Math.max(op.k, restK) : op.k;
      if (vis <= 0.004) continue;
      const pos0 = drive ? op.u : op.t, speed = drive ? Math.min(1, op.g) : 1;
      // 密度：最慢時只剩 minVisible 成的點（依固定亂數順序先收掉）
      const keep = drive ? Math.max(d.minVisible ?? 0.35, speed) : 1;
      const ld = v3(d.laneDir ?? [0, 1, 0]).normalize();
      for (let ln = 0; ln < lanes; ln++) {
        const off = ld.clone().multiplyScalar((ln - (lanes - 1) / 2) * (d.laneGap ?? 1));
        const pts = pts0.map((p) => p.clone().add(off));
        const seg = pts.slice(1).map((p, i) => p.distanceTo(pts[i])), total = seg.reduce((a, b) => a + b, 0);
        if (d.track !== false && ln === 0) { r.mat.opacity = O.trackO * vis; pts0.slice(1).forEach((p, i) => rod(`${id}-t${i}`, pts0[i], p, O.track, r.mat)); }
        // accel（2026/11/16 tech-offer）：受重力的落下（位置＝u²，越掉越快），水滴、硬幣用
        const at = (u0: number) => {
          const u = d.accel ? u0 * u0 : u0;
          let dist = u * total, k = 0;
          while (k < seg.length - 1 && dist > seg[k]) { dist -= seg[k]; k++; }
          const dir = pts[k + 1].clone().sub(pts[k]).normalize();
          return { pos: pts[k].clone().addScaledVector(dir, Math.min(dist, seg[k])), dir, k };
        };
        for (let i = 0; i < n; i++) {
          const id2 = ln * n + i, rk = hash01(id2 * 7.13 + 1.7);
          const raw = pos0 * (d.rate ?? 0.8) - (d.phase ?? 0) - i / n - ln * (0.5 / n); // flow 的 phase＝晚一點出發（幾條並排的路徑錯開）
          if (raw < 0) continue; // 還沒出發
          if (drive && rk > keep) continue;
          const u = frac(raw), fadeK = drive ? Math.min(1, (keep - rk) * 8) : 1;
          const { pos, dir, k: segK } = at(u);
          // keep＋bounces（2026/11/15 tech-euv）：每經過一個反射點（path 的第幾個點）只剩 keep 成，光點越後面越淡、越小
          const loss = d.keep !== undefined && d.bounces ? Math.pow(d.keep, d.bounces.filter((b) => b <= segK).length) : 1, lossO = d.keep !== undefined ? (d.lossFloor ?? 0.16) + (1 - (d.lossFloor ?? 0.16)) * loss : 1, lossS = d.keep !== undefined ? 0.5 + 0.5 * Math.sqrt(loss) : 1;
          if (d.jitter) pos.addScaledVector(ld, (hash01(id2 * 3.1 + Math.floor(raw)) - 0.5) * d.jitter);
          const e = Math.min(1, u * 10, (1 - u) * 10) * lossO, size = (d.size ?? 0.12) * (drive ? 1 : 0.6 + 0.4 * Math.min(1, op.g)) * lossS;
          const mats = r.mats.slice(id2 * (2 + trail), (id2 + 1) * (2 + trail));
          const core = mats[0] ?? r.mats[i];
          core.opacity = vis * e * fadeK;
          // 2026/11/20 tech-cmp 新增的流動物形狀（只在 shape 寫這幾個值時走這裡，舊片不受影響）：
          //   liquid＝水滴形（沿行進方向拉長的橢球）＋整條路徑一條連續液體帶（d.band＝帶寬、d.bandO＝帶的不透明度）｜grit＝磨粒（小方塊，翻滾）｜
          //   mol＝分子（兩顆球黏在一起，慢慢轉）｜flake＝碎屑（薄片，翻滾）
          if (d.shape === "liquid") {
            if (ln === 0 && i === 0) { r.mat.opacity = (d.bandO ?? 0.5) * vis; pts0.slice(1).forEach((p, j) => rod(`${id}-b${j}`, pts0[j], p, d.band ?? 0.12, r.mat)); }
            nodes.push(<mesh key={`${id}-p${id2}`} geometry={geo.ball} material={core} position={pos} quaternion={new THREE.Quaternion().setFromUnitVectors(UP, dir)} scale={[size * 0.62, size * 1.5, size * 0.62]} renderOrder={10} frustumCulled={false} />);
            continue;
          }
          if (d.shape === "grit" || d.shape === "flake") {
            const tq = new THREE.Quaternion().setFromEuler(new THREE.Euler(raw * 9 + id2, raw * 7 + id2 * 2, id2));
            nodes.push(<mesh key={`${id}-p${id2}`} geometry={d.shape === "grit" ? geo.box : geo.disc} material={core} position={pos} quaternion={tq} scale={d.shape === "grit" ? size : [size * 1.5, size * 1.5, size * 1.5]} renderOrder={10} frustumCulled={false} />);
            if (d.rim && mats[1]) { mats[1].opacity = vis * e * fadeK * (d.rimO ?? 0.9); nodes.push(<mesh key={`${id}-r${id2}`} geometry={d.shape === "grit" ? geo.box : geo.disc} material={mats[1]} position={pos} quaternion={tq} scale={d.shape === "grit" ? size * 1.45 : size * 1.9} renderOrder={9} frustumCulled={false} />); }
            continue;
          }
          if (d.shape === "mol") {
            const ax = new THREE.Vector3(Math.cos(raw * 5 + id2), Math.sin(raw * 4 + id2 * 1.3), Math.sin(raw * 3 + id2)).normalize();
            nodes.push(<mesh key={`${id}-p${id2}`} geometry={geo.ball} material={core} position={pos.clone().addScaledVector(ax, size * 0.55)} scale={size * 0.8} renderOrder={10} frustumCulled={false} />);
            if (mats[1]) { mats[1].opacity = vis * e * fadeK; nodes.push(<mesh key={`${id}-r${id2}`} geometry={geo.ball} material={mats[1]} position={pos.clone().addScaledVector(ax, -size * 0.55)} scale={size * 0.62} renderOrder={10} frustumCulled={false} />); }
            continue;
          }
          if (d.shape === "arrow") { nodes.push(<mesh key={`${id}-p${id2}`} geometry={geo.cone} material={core} position={pos} quaternion={new THREE.Quaternion().setFromUnitVectors(UP, dir)} scale={size} renderOrder={9} frustumCulled={false} />); continue; }
          nodes.push(<mesh key={`${id}-p${id2}`} geometry={geo.ball} material={core} position={pos} scale={size * (0.7 + 0.3 * e)} renderOrder={10} frustumCulled={false} />);
          if (r.pm && r.pm[id2]) {
            const pm = r.pm[id2], sc = size * (0.7 + 0.3 * e);
            pm.opacity = core.opacity;
            nodes.push(<mesh key={`${id}-x${id2}`} geometry={geo.box} material={pm} position={pos} scale={[sc * 1.25, sc * 0.3, sc * 0.1]} renderOrder={12} frustumCulled={false} />);
            nodes.push(<mesh key={`${id}-y${id2}`} geometry={geo.box} material={pm} position={pos} scale={[sc * 0.3, sc * 1.25, sc * 0.1]} renderOrder={12} frustumCulled={false} />);
          }
          if (d.rim && mats[1]) { mats[1].opacity = vis * e * fadeK * (d.rimO ?? 0.9); nodes.push(<mesh key={`${id}-r${id2}`} geometry={geo.ball} material={mats[1]} position={pos} scale={size * (d.rimScale ?? 1.55) * (0.7 + 0.3 * e)} renderOrder={9} frustumCulled={false} />); }
          // 拖尾：間距乘上當下速度（慢下來時拖尾縮短、停住時收成一點）
          for (let j = 1; j <= trail; j++) {
            const uj = u - j * (d.trailGap ?? 0.02) * speed;
            if (uj <= 0 || speed < 0.05) continue;
            const m2 = mats[1 + j];
            if (!m2) continue;
            m2.opacity = vis * fadeK * lossO * Math.min(1, uj * 10, (1 - uj) * 10) * (0.62 - (0.5 * j) / (trail + 1));
            nodes.push(<mesh key={`${id}-q${id2}-${j}`} geometry={geo.ball} material={m2} position={at(uj).pos} scale={size * (1 - (0.55 * j) / (trail + 1))} renderOrder={8} frustumCulled={false} />);
          }
        }
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
    } else if (d.type === "lpp" && r.halo) {
      // 雷射打錫滴的循環（2026/11/15 tech-euv）：錫滴排隊往下掉 → 預脈衝（細光束）打到 → 錫滴被壓扁成餅 → 主脈衝（粗光束）→ 炸成電漿發光、碎點噴開。
      // 每 period 秒一輪；相位用觸發後的時間 op.t，2D 剖面（Hud.tsx 的 section kind: "lpp"）讀同一個 lppPhase，兩邊同步
      const L = d.lpp ?? {}, ph = lppPhase(d, op.t), focus = v3(opPoint(s, d.at ?? [0, 0, 0], d.layer)), top = v3(opPoint(s, L.drop ?? [0, 3, 0], d.layer)), beam0 = v3(opPoint(s, L.beam ?? [-3, 0, 0], d.layer));
      const q = L.queue ?? 4, sz = d.size ?? 0.3, bd = focus.clone().sub(beam0).normalize(), qb = new THREE.Quaternion().setFromUnitVectors(UP, bd), k = op.k;
      const P = LPP;
      // 錫滴：j＝0 是這一輪要被打的那顆（到 P.pre 時抵達焦點），後面排隊
      for (let j = 0; j < q; j++) {
        if (j === 0 && ph >= P.pre) continue;
        const t = 1 - (P.pre - ph + j) / q;
        if (t < 0) continue;
        r.mats[j].opacity = k * Math.min(1, t * 6);
        nodes.push(<mesh key={`${id}-d${j}`} geometry={geo.ball} material={r.mats[j]} position={top.clone().lerp(focus, L.gravity ? (1 - L.gravity) * t + L.gravity * t * t : t)} scale={sz} renderOrder={10} frustumCulled={false} />);
      }
      const tri = (a: number, b: number) => (ph < a || ph > b ? 0 : Math.sin((Math.PI * (ph - a)) / (b - a)));
      const pre = tri(P.pre - 0.05, P.pre + 0.05), main = tri(P.main - 0.05, P.main + 0.06);
      if (pre > 0.01) { r.mats[8].opacity = k * pre; rod(`${id}-pre`, beam0, focus, (L.preR ?? 0.1) * (0.6 + 0.4 * pre), r.mats[8]); }
      if (main > 0.01) { r.mats[9].opacity = k * main; rod(`${id}-main`, beam0, focus, (L.mainR ?? 0.28) * (0.6 + 0.4 * main), r.mats[9]); }
      // 錫餅：預脈衝之後沿光束方向壓扁、往兩側攤開，主脈衝打到就消失
      if (ph >= P.pre && ph < P.main + 0.02) {
        const e = EASE.enter(Math.min(1, (ph - P.pre) / (P.main - P.pre))), rad = sz + ((L.pancake ?? sz * 3) - sz) * e;
        r.mats[10].opacity = k;
        nodes.push(<mesh key={`${id}-pan`} geometry={geo.ball} material={r.mats[10]} position={focus} quaternion={qb} scale={[rad, sz * (1 - 0.72 * e), rad]} renderOrder={10} frustumCulled={false} />);
      }
      // 電漿：主脈衝打到後膨脹發光、慢慢暗下來；碎點往四周噴
      if (ph >= P.main) {
        const u = (ph - P.main) / (1 - P.main), fade = Math.pow(1 - u, 1.6), br = (L.burst ?? sz * 4) * (0.45 + 0.55 * EASE.enter(Math.min(1, u * 3)));
        r.mats[11].opacity = k * fade * 0.9;
        nodes.push(<mesh key={`${id}-pl`} geometry={geo.ball} material={r.mats[11]} position={focus} scale={br} renderOrder={10} frustumCulled={false} />);
        r.halo.opacity = O.halo * k * fade;
        const hs = (d.halo ?? 4) * (0.6 + 0.6 * EASE.enter(Math.min(1, u * 2.5)));
        nodes.push(<sprite key={`${id}-h`} material={r.halo} position={focus} scale={[hs, hs, 1]} renderOrder={11} />);
        for (let j = 0; j < 8; j++) {
          const a = (j / 8) * Math.PI * 2 + 0.3, dirv = new THREE.Vector3(Math.cos(a), Math.sin(a), 0.4 * Math.sin(a * 3)).normalize();
          r.mats[12 + j].opacity = k * fade;
          nodes.push(<mesh key={`${id}-x${j}`} geometry={geo.ball} material={r.mats[12 + j]} position={focus.clone().addScaledVector(dirv, br * 0.6 + (L.spray ?? 2.2) * EASE.enter(u))} scale={sz * 0.42 * (1 - 0.5 * u)} renderOrder={10} frustumCulled={false} />);
        }
      }
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
export type PartFx = { off: [number, number, number]; quat: THREE.Quaternion | null; pivot: number[] | null; xf: { q: THREE.Quaternion; pivot: number[] | null }[]; hier: boolean; glow: number; color: string | null; grow: [number, number, number] | null };
export const partOps = (model: ProductModel): Map<string, [string, ActionDef][]> => {
  const m = new Map<string, [string, ActionDef][]>();
  for (const [id, d] of Object.entries(model.actions ?? {})) if (["vibrate", "rotate", "pulse"].includes(d.type)) for (const p of [...(d.parts ?? []), ...(d.level ?? [])]) m.set(p, [...(m.get(p) ?? []), [id, d]]);
  return m;
};
/** rotate 的角度（弧度）。angle＋damp（2026/11/16 tech-offer）：阻尼振盪的步階響應——從觸發起 θ＝A·(1−e^(−t/τ)·cos 2πft)，過衝幾次後停在 A；
 *  until 之後再用同一個式子回到 0。damp＝{ f（每秒擺幾次）, tau（衰減時間常數，秒） } */
export const rotAngle = (d: ActionDef, op: { k: number; g: number; T: number; t: number; n: number; f: number; until: number; end: number; u: number }) => {
  if (d.angle !== undefined && d.damp) {
    const A = (d.angle * Math.PI) / 180, st = (t: number) => (t <= 0 ? 0 : 1 - Math.exp(-t / d.damp!.tau) * Math.cos(Math.PI * 2 * d.damp!.f * t));
    return A * (st(op.n / 30) - st((op.f - op.until) / 30));
  }
  // hold（2026/11/17）：轉到定位後 until 也不轉回來（只跟著進場那一段）
  if (d.angle !== undefined && d.hold) return ((d.angle * Math.PI) / 180) * tween(op.f, op.f - op.n, Math.max(1, op.end - op.until), EASE.move) * (d.gain0 ?? 1);
  if (d.angle !== undefined) return ((d.angle * Math.PI) / 180) * op.k * (d.gain0 ?? 1);
  if (d.swing !== undefined) { const w0 = Math.PI * 2 * (d.freq ?? 1) * op.T; return ((d.swing * Math.PI) / 180) * op.g * ((d as any).tri ? (2 / Math.PI) * Math.asin(Math.sin(w0)) : Math.sin(w0)); }
  // rampSpin（2026/11/17）：轉速跟著進出場強度（起轉慢慢加速、停轉慢慢減速）；角度＝轉速的累積量 op.u
  if (d.rampSpin) return Math.PI * 2 * (d.rps ?? 1) * op.u;
  return Math.PI * 2 * (d.rps ?? 1) * op.t;
};
/** 新式轉軸（3D pivot／pivots／chain）的位移：零件原點 q（零件座標）依關節鏈由內往外各繞自己的轉軸轉。pivot 沒寫（null）＝繞零件自己現在的位置 */
export const rotDelta = (fx: PartFx, q: number[]): [number, number, number] => {
  const p = new THREE.Vector3(q[0], q[1], q[2] ?? 0);
  for (let i = fx.xf.length - 1; i >= 0; i--) {
    const { q: qq, pivot } = fx.xf[i];
    const pv = pivot ? new THREE.Vector3(pivot[0], pivot[1], pivot[2] ?? p.z) : p.clone();
    p.sub(pv).applyQuaternion(qq).add(pv);
  }
  return [p.x - q[0], p.y - q[1], p.z - (q[2] ?? 0)];
};
export const partFxAt = (list: [string, ActionDef][] | undefined, s: State3D, part?: { id?: string; pos?: number[] }): PartFx | null => {
  if (!list) return null;
  let lvAng = 0, lvD: ActionDef | null = null;
  const fx: PartFx = { off: [0, 0, 0], quat: null, pivot: null, xf: [], hier: false, glow: 0, color: null, grow: null };
  for (const [id, d] of list) {
    const op = s.ops[id];
    if (!op) continue;
    if (d.type === "vibrate") {
      // tri（2026/11/26 tech-amat）：等速三角波（到端點直接折返，例如離子束掃描）；沒寫照舊正弦
      const a = d.axis ?? [0, 0, 1], w0 = Math.PI * 2 * (d.freq ?? 4) * op.T, v = (d.amp ?? 0.1) * op.g * ((d as any).tri ? (2 / Math.PI) * Math.asin(Math.sin(w0)) : Math.sin(w0));
      // grow（2026/11/16 tech-offer）：不是位移，是沿 axis 伸縮（以零件底部為基準；amp＝相對伸縮量，0.4＝±40%）
      if (d.grow) { const g0 = fx.grow ?? [1, 1, 1]; fx.grow = [g0[0] * (1 + Math.abs(a[0]) * v), g0[1] * (1 + Math.abs(a[1]) * v), g0[2] * (1 + Math.abs(a[2] ?? 0) * v)]; }
      else fx.off = [fx.off[0] + a[0] * v, fx.off[1] + a[1] * v, fx.off[2] + (a[2] ?? 0) * v];
    } else if (d.type === "rotate") {
      // 角度＝轉速 × 觸發後的時間（until 之後時間不再走，停在原地）。
      // 2026/11/16 tech-offer：angle（度）＝轉到固定角度（跟著 run 的進出場 ramp 轉過去、until 後轉回來）；swing（度）＝來回擺（± swing、每秒 freq 下，相位用全片時間，和 vibrate 同一個式子）；
      // 同一個零件有好幾個 rotate 時角度相乘（以前只取最後一個）
      const ang = rotAngle(d, op);
      // level（2026/11/16 tech-offer）：吊著的零件（天平秤盤、吊繩、盤上的東西）不跟著轉，只跟著吊點（hang）平移，永遠保持水平
      if (part?.id && d.level?.includes(part.id)) { lvAng += ang; lvD = d; continue; }
      const q = new THREE.Quaternion().setFromAxisAngle(v3(d.axis ?? [0, 0, 1]).normalize(), ang);
      // 2026/11/17 修：第一個轉動要複製一份——以前直接把 q 當 fx.quat，下一個轉動 multiply 時把 xf[0].q 也改掉了（關節鏈的第一節被套了兩次角度，前臂脫節）
      fx.quat = fx.quat ? fx.quat.multiply(q) : q.clone();
      fx.pivot = d.pivot ?? fx.pivot ?? null;
      // 2026/11/17：3D 轉軸、每零件自己的轉軸、關節鏈（沒用到這幾個欄位的舊動作完全走上面那條舊路）
      const pv = (part?.id ? d.pivots?.[part.id] : undefined) ?? d.pivot ?? null;
      fx.xf.push({ q, pivot: pv });
      if (d.pivots || d.chain || (d.pivot && d.pivot.length > 2)) fx.hier = true;
    } else if (d.type === "pulse") {
      // steady＝不閃，穩定亮著（強度只跟著進出場 ramp；例如電壓維持在高的那段時間）
      const beat = d.steady ? 1 : 0.5 + 0.5 * Math.sin(Math.PI * 2 * (d.freq ?? 2) * op.t - Math.PI / 2);
      fx.glow = Math.max(fx.glow, (d.glow ?? 0.8) * Math.min(1, op.g) * (0.35 + 0.65 * beat)); fx.color = d.color ?? null;
    }
  }
  if (lvD && part?.pos) {
    // 吊點：零件在轉軸哪一邊就用哪一邊的 hang 點；吊點繞轉軸轉 θ，零件整個平移同樣的位移（不轉）
    const pv = lvD.pivot ?? [0, 0], side = part.pos[0] < pv[0] ? 0 : 1, h = lvD.hang?.[side] ?? [part.pos[0], pv[1]];
    const ax = (lvD.axis?.[2] ?? 1) < 0 ? -1 : 1, c = Math.cos(lvAng * ax), sn = Math.sin(lvAng * ax), rx = h[0] - pv[0], ry = h[1] - pv[1];
    fx.off = [fx.off[0] + pv[0] + rx * c - ry * sn - h[0], fx.off[1] + pv[1] + rx * sn + ry * c - h[1], fx.off[2]];
  }
  return fx;
};
