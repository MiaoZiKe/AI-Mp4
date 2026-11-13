// 3D 產品台的時間模型與姿態：把各幕 props 的 at（cue id 或 start｜voice｜end｜exit ±N 幀，可寫「幕id:cue±N」指到別幕的 cue）換成絕對幀，
// 再算出每一幀的模型姿態、各層位置與透明度、鏡頭、燈光掃過、熱度、粒子。3D 畫面（Scene.tsx）和 HTML 標籤（ThreeVideo.tsx）讀同一份，
// 所以標籤的位置是用同一台相機投影出來的，會跟著模型走。產品本身（零件、層、標註點、熱循環的範圍）來自 model.json，這裡不寫死任何產品的尺寸。
import * as THREE from "three";
import type { Scene, TimelineV2 } from "../../types";
import { FPS, LAYOUT_3D as L, THEME_3D as T } from "../../theme";
import { EASE, seeded, tween } from "../anim";
import type { ActionDef, ProductModel, Pt, ThermalDef } from "./model";

export type Label3D = { part: string; text: string; en?: string; color: string; at: number; until: number };
export type Model3D = {
  total: number;
  product: ProductModel;
  hook?: { title: string; kicker?: string };
  spin: { t0: number; t1: number };
  drop: number; explode: number; focus: number; focusLayer: string | null;
  cutaway: number; heat: number; vapor: number; spread: number; condense: number; flowBack: number;
  /** 上蓋先微抬一下、鏡頭繞開拉遠、再推回熱點 */
  peek: number; orbit: number; settle: number;
  /** 光掃過主角零件的時刻 */
  sweeps: number[];
  rename?: { part: string; text: string; en?: string; at: number };
  labels: Label3D[];
  /** 運作動畫的觸發（props.run）、鏡頭關鍵格（props.shot）、把某一層移開或變透明（props.shift）；都依 at 排好 */
  runs: Run3D[]; shots: Shot3D[]; shifts: Shift3D[];
};
export type Run3D = { id: string; at: number; until: number; speed: number; gain: number; ramp: number };
export type Shot3D = { at: number; dur: number; d?: number; elev?: number; y?: number; x?: number; yaw?: number };
export type Shift3D = { layer: string; at: number; until: number; dur: number; dx: number; dy: number; dz: number; opacity?: number };

const FAR = 1e9;
export const buildModel = (scenes: Scene[], tl: TimelineV2, product: ProductModel): Model3D => {
  const by = Object.fromEntries(tl.scenes.map((x, i) => [x.id, { ...x, exit: tl.scenes[i + 1]?.startFrame ?? tl.totalFrames }]));
  const m: Model3D = { total: tl.totalFrames, product, spin: { t0: 0, t1: FAR }, drop: FAR, explode: FAR, focus: FAR, focusLayer: null, cutaway: FAR, heat: FAR, vapor: FAR, spread: FAR, condense: FAR, flowBack: FAR, peek: FAR, orbit: FAR, settle: FAR, sweeps: [], labels: [], runs: [], shots: [], shifts: [] };
  scenes.forEach((s) => {
    const own = by[s.id];
    if (!own) return;
    const at = (spec: unknown, fb: number) => {
      const r = /^(?:([^\s:+-]+):)?([^\s:+-]+)([+-]\d+)?$/.exec(String(spec ?? ""));
      if (!r) return fb;
      const t = r[1] ? by[r[1]] : own;
      if (!t) return fb;
      const base = r[2] === "start" ? t.startFrame : r[2] === "voice" ? t.voiceStartFrame : r[2] === "end" ? t.voiceEndFrame : r[2] === "exit" ? t.exit : (t.cues ?? []).find((q) => q.id === r[2])?.frame;
      return base === undefined || base === null ? fb : base + Number(r[3] ?? 0);
    };
    const p = (s.props ?? {}) as Record<string, any>;
    if (p.hook) m.hook = p.hook;
    if (p.spin) m.spin = { t0: at(p.spin.at, own.startFrame), t1: at(p.spin.until, own.exit) };
    for (const k of ["drop", "explode", "focus", "cutaway", "heat", "vapor", "spread", "condense", "flowBack", "peek", "orbit", "settle"] as const) if (p[k]) m[k] = at(p[k].at, own.voiceStartFrame);
    if (p.focus) m.focusLayer = p.focus.layer ?? product.anchors[p.focus.part]?.layer ?? p.focus.part ?? null;
    for (const sw of [].concat(p.sweep ?? [])) m.sweeps.push(at((sw as any).at, own.voiceStartFrame));
    if (p.rename) m.rename = { ...p.rename, at: at(p.rename.at, own.voiceStartFrame) };
    for (const l of p.labels ?? []) m.labels.push({ ...l, at: at(l.at, own.voiceStartFrame), until: l.until ? at(l.until, FAR) : FAR });
    for (const r of [].concat(p.run ?? []) as any[]) if (product.actions?.[r.id]) m.runs.push({ id: r.id, at: at(r.at, own.voiceStartFrame), until: r.until ? at(r.until, FAR) : FAR, speed: r.speed ?? 1, gain: r.gain ?? 1, ramp: r.ramp ?? T.ops.ramp });
    for (const c of [].concat(p.shot ?? []) as any[]) m.shots.push({ ...c, at: at(c.at, own.voiceStartFrame), dur: c.dur ?? T.motion.orbit });
    for (const c of [].concat(p.shift ?? []) as any[]) m.shifts.push({ layer: c.layer, at: at(c.at, own.voiceStartFrame), until: c.until ? at(c.until, FAR) : FAR, dur: c.dur ?? T.motion.focus, dx: c.dx ?? 0, dy: c.dy ?? 0, dz: c.dz ?? 0, opacity: c.opacity });
  });
  m.runs.sort((a, b) => a.at - b.at); m.shots.sort((a, b) => a.at - b.at); m.shifts.sort((a, b) => a.at - b.at);
  return m;
};

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** 粒子（水滴／蒸氣）與熱浪：固定 seed。座標是熱循環區域自己的（中心在 thermal.center）。near＝熱點附近、far＝散到整片後的位置 */
const pcache = new WeakMap<ThermalDef, ReturnType<typeof makeParticles>>();
const makeParticles = (th: ThermalDef) => {
  const r = seeded(20261113), [w, h] = th.size, hx = th.hot[0], hy = th.hot[1], cols = 5, rows = Math.ceil(th.particles / cols);
  const drops = Array.from({ length: th.particles }, (_, i) => {
    const a = r() * Math.PI * 2, d = 0.2 + r() * 1.35;
    const near = [Math.max(-w / 2, Math.min(w / 2, hx + Math.cos(a) * d * 1.2)), Math.max(-h / 2, Math.min(h / 2, hy + Math.sin(a) * d))];
    const far = [-w / 2 + ((i % cols) + 0.15 + r() * 0.7) * (w / cols), h / 2 - (Math.floor(i / cols) + 0.1 + r() * 0.8) * (h / rows)];
    return { near, far, lag: r(), size: 0.15 + r() * 0.12, lane: th.lanes[i % 2] };
  });
  const shimmer = Array.from({ length: th.shimmer }, () => ({ a: r() * Math.PI * 2, d: r(), ph: r(), sp: 0.022 + r() * 0.014, size: 0.7 + r() * 0.7 }));
  return { drops, shimmer };
};
export const particlesOf = (th: ThermalDef) => { let p = pcache.get(th); if (!p) { p = makeParticles(th); pcache.set(th, p); } return p; };

export type State3D = ReturnType<typeof stateAt>;
/** 第 f 幀的完整狀態 */
export const stateAt = (m: Model3D, f: number) => {
  const pr = m.product, M = T.motion, P = { ...T.pose, ...(pr.pose ?? {}) }, C = { ...T.camera, ...(pr.camera ?? {}) } as typeof T.camera;
  const lay = tween(f, m.explode, M.lay, EASE.move);
  const fo = tween(f, m.focus, M.focus, EASE.move);
  // 轉盤：第 0 幀就在轉（先快後慢），不用慢起步
  const st = clamp01((f - m.spin.t0) / Math.max(1, Math.min(m.spin.t1, m.explode) - m.spin.t0));
  const spin = 1 - (1 - st) * (1 - st);
  const pk = tween(f, m.peek, M.peek, EASE.move);
  const orb = tween(f, m.orbit, M.orbit, EASE.move), set = tween(f, m.settle, M.orbit, EASE.move);
  // 收尾：最後幾幀鏡頭慢慢往後退
  const outro = tween(f, m.total - M.outro, M.outro, EASE.move);
  let yaw = mix(P.yaw0 + Math.PI * 2 * spin, Math.PI * 2 + P.yawIso, lay) + P.drift * Math.max(0, f - m.explode) + P.peekYaw * pk + C.orbit.yaw * orb + C.settle.yaw * set;
  const pitch = mix(0, P.pitch, lay);
  // 各層：分解時沿厚度方向分開；聚焦時，主角上面的層往鏡頭飛走並淡出、正下方那層靠近一點、更下面的往後退並淡出
  const fk = pr.layers.find((x) => x.id === m.focusLayer)?.k ?? null;
  const fade = 1 - tween(f, m.focus, M.focus * 0.7, EASE.move);
  const layers: Record<string, { z: number; opacity: number; e: number; x: number; y: number }> = {};
  for (const d of pr.layers) {
    const e = tween(f, m.explode + 8 + (2 - Math.min(2, Math.abs(d.k))) * M.stagger, M.explode, EASE.move);
    let z = d.z + d.k * P.gap * e, opacity = 1;
    if (fk !== null) {
      if (d.k > fk) { z += P.focusUp * fo; opacity = fade; }
      else if (d.k === fk - 1) z += P.gap * 0.5 * fo;
      else if (d.k < fk - 1) { z -= P.focusDown * fo; opacity = fade; }
    }
    layers[d.id] = { z, opacity, e, x: 0, y: 0 };
  }
  // props.shift：把某一層移開／變透明（露出下面的零件），until 之後回來
  for (const sh of m.shifts) {
    const q = layers[sh.layer], tw = tween(f, sh.at, sh.dur, EASE.move) * (1 - tween(f, sh.until, sh.dur, EASE.move));
    if (!q || tw <= 0) continue;
    q.x += sh.dx * tw; q.y += sh.dy * tw; q.z += sh.dz * tw;
    if (sh.opacity !== undefined) q.opacity = mix(q.opacity, sh.opacity, tw);
  }
  const cam = {
    d: mix(mix(C.stand.d, C.explode.d, lay), C.focus.d, fo) + C.orbit.d * orb + C.settle.d * set,
    elev: mix(mix(C.stand.elev, C.explode.elev, lay), C.focus.elev, fo) + C.orbit.elev * orb + C.settle.elev * set,
    y: mix(mix(C.stand.y, C.explode.y, lay), C.focus.y, fo) + C.orbit.y * orb + C.settle.y * set,
    x: 0,
  };
  // props.shot：鏡頭關鍵格（距離、仰角、看向的高度／左右是絕對值，yaw 是增量），一格接一格補間過去
  for (const c of m.shots) {
    const tw = tween(f, c.at, c.dur, EASE.move);
    if (tw <= 0) continue;
    cam.d = mix(cam.d, c.d ?? cam.d, tw); cam.elev = mix(cam.elev, c.elev ?? cam.elev, tw); cam.y = mix(cam.y, c.y ?? cam.y, tw); cam.x = mix(cam.x, c.x ?? cam.x, tw);
    yaw += (c.yaw ?? 0) * tw;
  }
  cam.d += C.outro.d * outro;
  // 地面：跟著看得見的最低一點走（立著時貼地，躺下分解後離地一點，陰影才有「浮著」的感覺）
  let low = 1e9;
  for (const d of pr.layers) {
    const q = layers[d.id];
    if (q.opacity < 0.5) continue;
    for (const sy of [-1, 1]) for (const sz of [-1, 1]) low = Math.min(low, sy * (pr.size.h / 2) * Math.cos(pitch) - (q.z + sz * 0.2) * Math.sin(pitch));
  }
  const groundY = low - mix(0.02, T.ground.float, lay);

  const lid = tween(f, m.cutaway, M.lid, EASE.move);
  const lidLift = pk * (1 - lid);
  const heat0 = tween(f, m.heat, 14, EASE.enter);
  // 念到「涼了」：M.cool 幀內整片退回金屬色
  const cool = tween(f, m.condense, M.cool, EASE.move);
  const heat = heat0 * (1 - cool);
  // 念到「燙」：底板短暫變透明，看得到下面的晶片先變紅；蒸氣出現前恢復
  const xray = tween(f, m.heat, 6, EASE.enter) * (1 - tween(f, m.vapor - 4, 10, EASE.move));
  // 光掃：最近一次 sweep 的進度（0→1 掃過主角零件），沒有在掃時 on＝0
  let sweep = { p: 0, on: 0 };
  for (const a of m.sweeps) if (f >= a && f <= a + M.sweep) { const p = (f - a) / M.sweep; sweep = { p, on: Math.sin(Math.PI * p) }; }

  const th = pr.thermal;
  const spreadP = tween(f, m.spread - 2, M.flow + 10, EASE.move);
  let parts: { x: number; y: number; z: number; gas: number; drop: number; puff: number; flat: number; stretch: number }[] = [];
  let shimmer: { x: number; y: number; z: number; o: number; s: number }[] = [];
  /** 熱沿著板子擴散：輸入＝離熱點多遠（0–1，1＝最遠的角落） */
  const heatAt = (u: number) => clamp01(heat * clamp01(1.15 - u * 1.25 + spreadP * 1.1 - (1 - spreadP) * u * 2.2) * mix(1, 0.7, spreadP * u));
  if (th) {
    const ps = particlesOf(th);
    parts = ps.drops.map((p) => {
      const show = tween(f, m.cutaway + 4 + p.lag * 8, 8, EASE.enter);
      const vap = tween(f, m.vapor + p.lag * 10, 10, EASE.move);
      const spr = tween(f, m.spread - 4 + p.lag * 14, M.flow, EASE.move);
      const con = tween(f, m.condense + p.lag * 12, 10, EASE.move);
      const back = tween(f, m.flowBack + p.lag * 12, M.flow + 4, EASE.move);
      // 回程：先靠到板子邊緣（毛細結構的路），再回到熱點
      const edge = Math.sin(Math.PI * back);
      const x = mix(mix(p.near[0], p.far[0], spr), p.near[0], back) + (p.lane - mix(p.near[0], p.far[0], 0.5)) * edge * 0.85;
      const y = mix(mix(p.near[1], p.far[1], spr), p.near[1], back);
      const gas = vap - con;
      const wob = gas * 0.14 * Math.sin(f * 0.21 + p.lag * 40);
      return {
        x: x + wob, y, z: 0.07 + gas * (0.55 + 0.7 * p.lag) + gas * 0.1 * Math.sin(f * 0.13 + p.lag * 17), gas,
        // 水滴在變成蒸氣的過程中縮小消失；蒸氣團同時長大（↔ 反過來）
        drop: show * p.size * (1 - gas * 0.999), puff: show * gas * (1.5 + p.size * 5), flat: 0.5, stretch: 1 + 0.9 * edge,
      };
    });
    // 熱浪：熱的時候從熱區往上飄的暖色柔光點；範圍跟著熱擴散變大
    shimmer = ps.shimmer.map((q) => {
      const ph = (f * q.sp + q.ph) % 1, rad = q.d * mix(0.9, Math.max(th.size[0], th.size[1]) * 0.5, spreadP);
      const x = Math.max(-th.size[0] / 2, Math.min(th.size[0] / 2, th.hot[0] + Math.cos(q.a) * rad * 0.8)), y = Math.max(-th.size[1] / 2, Math.min(th.size[1] / 2, th.hot[1] + Math.sin(q.a) * rad - spreadP * q.d * th.size[1] * 0.35));
      return { x: x + 0.12 * Math.sin(ph * 9 + q.ph * 30), y, z: 0.3 + ph * 2.4, o: heat * Math.sin(Math.PI * ph) * T.shimmer, s: q.size * (0.7 + ph * 0.9) };
    });
  }
  // 運作動畫：每個動作這一幀的強度 g（0–1 的進出場 × gain）、k（只有進出場）、t（觸發後幾秒 × speed）、T（全片時間 × speed；波形用，兩道波才對得上相位）
  const ops: Record<string, Op3D> = {};
  for (const r of m.runs) {
    if (f < r.at) continue;
    const k = tween(f, r.at, r.ramp, EASE.move) * (1 - tween(f, r.until, r.ramp, EASE.move));
    ops[r.id] = { g: k * r.gain, k, t: ((Math.min(f, r.until + r.ramp) - r.at) / FPS) * r.speed, T: (f / FPS) * r.speed, n: f - r.at };
  }
  return { f, yaw, pitch, lay, fo, layers, cam, groundY, lid, lidLift, xray, heat, heatAt, spreadP, sweep, parts, shimmer, outro, ops };
};
export type Op3D = { g: number; k: number; t: number; T: number; n: number };

// ── 運作動畫的訊號（3D 畫面與 HTML 儀表讀同一份） ──
/** 一道行進波在線上 u（0–1）的位移：amp × 強度 × Σ 各倍頻的正弦；invert＝反相（整個乘 −1） */
export const traceVal = (d: ActionDef, op: Op3D | undefined, u: number) => {
  if (!op) return 0;
  const ph = (d.cycles ?? 2) * u - (d.rate ?? 1) * op.T + (d.phase ?? 0);
  let v = 0, norm = 0;
  for (const [mul, a] of d.harmonics ?? [[1, 1]]) { v += a * Math.sin(Math.PI * 2 * mul * ph); norm += Math.abs(a); }
  return ((d.invert ? -1 : 1) * (d.amp ?? 0.5) * op.g * v) / Math.max(1e-6, norm);
};
/** 一條線上的值：trace 就是自己；sum＝把 of 列的幾道加起來（先只有第一道，build 幀內把其他幾道加進來） */
export const signalVal = (pr: ProductModel, s: { ops: Record<string, Op3D> }, id: string, u: number): number => {
  const d = pr.actions?.[id], op = s.ops[id];
  if (!d || !op) return 0;
  if (d.type === "trace") return traceVal(d, op, u);
  if (d.type !== "sum") return 0;
  const b = tween(op.n, d.buildDelay ?? 0, d.build ?? 1, EASE.move);
  return (d.of ?? []).reduce((a, tid, i) => a + (i === 0 ? 1 : b) * traceVal(pr.actions?.[tid] ?? ({} as ActionDef), s.ops[tid], u), 0) * op.k;
};
/** 動作的「大小」（0–1，儀表用）：波形＝線上最大位移 ÷ 第一道波的振幅；其他＝強度 */
export const signalLevel = (pr: ProductModel, s: { ops: Record<string, Op3D> }, id: string) => {
  const d = pr.actions?.[id], op = s.ops[id];
  if (!d || !op) return 0;
  if (d.type !== "trace" && d.type !== "sum") return clamp01(op.g);
  const ref = d.type === "trace" ? d.amp ?? 0.5 : pr.actions?.[d.of?.[0] ?? ""]?.amp ?? 0.5;
  let mx = 0;
  for (let i = 0; i <= 32; i++) mx = Math.max(mx, Math.abs(signalVal(pr, s, id, i / 32)));
  return clamp01(mx / Math.max(1e-6, ref));
};
/** 動作裡的一個點 → 模型座標（加上那一層這一幀的位置） */
export const opPoint = (s: { layers: Record<string, { x: number; y: number; z: number }> }, pt: Pt | undefined, layer?: string): [number, number, number] => {
  const p = Array.isArray(pt) ? pt : pt?.p ?? [0, 0, 0], q = s.layers[(Array.isArray(pt) ? layer : pt?.layer ?? layer) ?? ""];
  return [p[0] + (q?.x ?? 0), p[1] + (q?.y ?? 0), (p[2] ?? 0) + (q?.z ?? 0)];
};

/** 相機（3D 畫面與標籤投影共用） */
export const cameraFor = (s: State3D) => {
  const cam = new THREE.PerspectiveCamera(T.camera.fov, L.W / L.STAGE_H, 1, 400);
  const e = (s.cam.elev * Math.PI) / 180;
  cam.position.set(s.cam.x, s.cam.y + s.cam.d * Math.sin(e), s.cam.d * Math.cos(e));
  cam.lookAt(s.cam.x, s.cam.y, 0);
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();
  return cam;
};
/** 模型座標（某一層裡的一點）→ 整個畫面上的像素位置 */
export const projectPoint = (s: State3D, cam: THREE.PerspectiveCamera, layer: string, p: number[]) => {
  const q = s.layers[layer];
  const v = new THREE.Vector3(p[0] + (q?.x ?? 0), p[1] + (q?.y ?? 0), (p[2] ?? 0) + (q?.z ?? 0));
  v.applyEuler(new THREE.Euler(s.pitch, 0, 0)).applyEuler(new THREE.Euler(0, s.yaw, 0)).project(cam);
  return { x: ((v.x + 1) / 2) * L.W, y: L.STAGE_TOP + ((1 - v.y) / 2) * L.STAGE_H };
};
