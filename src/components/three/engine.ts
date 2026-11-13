// 3D 產品台的時間模型與姿態：把各幕 props 的 at（cue id 或 start｜voice｜end｜exit ±N 幀）換成絕對幀，
// 再算出每一幀的模型姿態、各層位置與透明度、鏡頭、粒子狀態。3D 畫面（Scene.tsx）和 HTML 標籤（ThreeVideo.tsx）讀同一份，
// 所以標籤的位置是用同一台相機投影出來的，會跟著模型走。內容與時間都來自 script.json，不手填秒數。
import * as THREE from "three";
import type { Scene, TimelineV2 } from "../../types";
import { LAYOUT_3D as L, THEME_3D as T } from "../../theme";
import { EASE, seeded, tween } from "../anim";

export type Label3D = { part: string; text: string; en?: string; color: string; at: number };
export type Model3D = {
  total: number;
  hook?: { title: string; kicker?: string };
  spin: { t0: number; t1: number };
  drop: number;
  explode: number;
  focus: number;
  cutaway: number;
  heat: number;
  vapor: number;
  spread: number;
  condense: number;
  flowBack: number;
  rename?: { part: string; text: string; en?: string; at: number };
  labels: Label3D[];
};

const FAR = 1e9;
export const buildModel = (scenes: Scene[], tl: TimelineV2): Model3D => {
  const by = Object.fromEntries(tl.scenes.map((x) => [x.id, x]));
  const m: Model3D = { total: tl.totalFrames, spin: { t0: 0, t1: FAR }, drop: FAR, explode: FAR, focus: FAR, cutaway: FAR, heat: FAR, vapor: FAR, spread: FAR, condense: FAR, flowBack: FAR, labels: [] };
  scenes.forEach((s, i) => {
    const t = by[s.id];
    if (!t) return;
    const next = scenes[i + 1] && by[scenes[i + 1].id];
    const at = (spec: unknown, fb: number) => {
      const r = /^([^\s+-]+)([+-]\d+)?$/.exec(String(spec ?? ""));
      if (!r) return fb;
      const base = r[1] === "start" ? t.startFrame : r[1] === "voice" ? t.voiceStartFrame : r[1] === "end" ? t.voiceEndFrame : r[1] === "exit" ? (next ? next.startFrame : tl.totalFrames) : (t.cues ?? []).find((q) => q.id === r[1])?.frame;
      return base === undefined || base === null ? fb : base + Number(r[2] ?? 0);
    };
    const p = (s.props ?? {}) as Record<string, any>;
    if (p.hook) m.hook = p.hook;
    if (p.spin) m.spin = { t0: at(p.spin.at, t.startFrame), t1: at(p.spin.until, next ? next.startFrame : tl.totalFrames) };
    for (const k of ["drop", "explode", "focus", "cutaway", "heat", "vapor", "spread", "condense", "flowBack"] as const) if (p[k]) m[k] = at(p[k].at, t.voiceStartFrame);
    if (p.rename) m.rename = { ...p.rename, at: at(p.rename.at, t.voiceStartFrame) };
    for (const l of p.labels ?? []) m.labels.push({ ...l, at: at(l.at, t.voiceStartFrame) });
  });
  return m;
};

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// ── 模型尺寸（單位：公分左右的抽象單位；手機 7.2 × 15 × 0.84） ──
export const G = {
  W: 7.2, H: 15, R: 1.05, TH: 0.84,
  /** 各層：組裝時的 z、分解時往哪邊（幾個層距） */
  layers: { back: { z: -0.36, k: -2 }, inner: { z: -0.14, k: -1 }, plate: { z: 0.1, k: 0 }, frame: { z: 0, k: 1 }, screen: { z: 0.36, k: 2 } },
  plate: { w: 5.4, h: 9.6, y: 1.7, t: 0.34, r: 0.5 },
  chip: { x: -0.9, y: 4.5, s: 1.7 },
  N: 26,
} as const;
export type LayerId = keyof typeof G.layers;
export const LAYER_IDS = Object.keys(G.layers) as LayerId[];
/** 熱點（晶片正上方）在均熱板自己座標裡的位置 */
export const HOT = { x: G.chip.x, y: G.chip.y - G.plate.y };

/** 粒子（水滴／蒸氣）：固定 seed。near＝熱點附近的位置、far＝散到整片板子後的位置 */
export const PARTICLES = (() => {
  const r = seeded(20261113);
  return Array.from({ length: G.N }, (_, i) => {
    const a = r() * Math.PI * 2, d = 0.25 + r() * 1.25;
    const near = [Math.max(-2.3, Math.min(2.3, HOT.x + Math.cos(a) * d * 1.2)), Math.max(-4.3, Math.min(4.3, HOT.y + Math.sin(a) * d))];
    const far = [-2.2 + ((i % 5) + 0.15 + r() * 0.7) * 0.88, 3.9 - (Math.floor(i / 5) + r() * 0.8) * 1.5];
    return { near, far, lag: r(), size: 0.2 + r() * 0.12, lane: i % 2 ? 2.35 : -2.35 };
  });
})();

export type State3D = ReturnType<typeof stateAt>;
/** 第 f 幀的完整狀態 */
export const stateAt = (m: Model3D, f: number) => {
  const M = T.motion, P = T.pose, C = T.camera;
  const lay = tween(f, m.explode, M.lay, EASE.move);
  const fo = tween(f, m.focus, M.focus, EASE.move);
  const spin = tween(f, m.spin.t0, Math.max(1, Math.min(m.spin.t1, m.explode) - m.spin.t0), EASE.move);
  const yaw = mix(P.yaw0 + Math.PI * 2 * spin, Math.PI * 2 + P.yawIso, lay) + P.drift * Math.max(0, f - m.explode);
  const pitch = mix(0, P.pitch, lay);
  const layers = {} as Record<LayerId, { z: number; opacity: number }>;
  LAYER_IDS.forEach((id) => {
    const d = G.layers[id];
    const e = tween(f, m.explode + 8 + (2 - Math.abs(d.k)) * M.stagger, M.explode, EASE.move);
    let z = d.z + d.k * P.gap * e, opacity = 1;
    if (id === "frame" || id === "screen") { z += 7 * fo; opacity = 1 - tween(f, m.focus, M.focus * 0.7, EASE.move); }
    if (id === "back") { z -= 3 * fo; opacity = 1 - tween(f, m.focus, M.focus * 0.7, EASE.move); }
    if (id === "inner") z += P.gap * 0.5 * fo;
    layers[id] = { z, opacity };
  });
  const cam = { d: mix(mix(C.stand.d, C.explode.d, lay), C.focus.d, fo), elev: mix(mix(C.stand.elev, C.explode.elev, lay), C.focus.elev, fo), y: mix(mix(C.stand.y, C.explode.y, lay), C.focus.y, fo) };
  const lid = tween(f, m.cutaway, M.lid, EASE.move);
  const heat = tween(f, m.heat, 14, EASE.enter);
  const cool = tween(f, m.condense + 6, 30, EASE.move);
  const parts = PARTICLES.map((p) => {
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
    const wob = gas * 0.12 * Math.sin(f * 0.21 + p.lag * 40);
    return { x: x + wob, y, z: 0.2 + gas * (0.55 + 0.35 * p.lag), gas, scale: show * p.size * mix(1, 0.72, gas), flat: mix(0.55, 1, gas) };
  });
  // 熱沿著板子擴散：0＝熱點那一端、1＝最遠端
  const spreadP = tween(f, m.spread - 2, M.flow + 10, EASE.move);
  const heatAt = (u: number) => Math.max(0, Math.min(1, heat * (1 - cool * 0.75) * Math.max(0, Math.min(1, 1.15 - u * 1.25 + spreadP * 1.1 - (1 - spreadP) * u * 2.2)) * mix(1, 0.62, spreadP * u)));
  return { f, yaw, pitch, lay, fo, layers, cam, lid, heat: heat * (1 - cool * 0.75), heatAt, parts };
};

/** 相機（3D 畫面與標籤投影共用） */
export const cameraFor = (s: State3D) => {
  const cam = new THREE.PerspectiveCamera(T.camera.fov, L.W / L.STAGE_H, 1, 400);
  const e = (s.cam.elev * Math.PI) / 180;
  cam.position.set(0, s.cam.y + s.cam.d * Math.sin(e), s.cam.d * Math.cos(e));
  cam.lookAt(0, s.cam.y, 0);
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();
  return cam;
};
/** 模型座標（某一層裡的一點）→ 整個畫面上的像素位置 */
export const projectPoint = (s: State3D, cam: THREE.PerspectiveCamera, layer: LayerId, p: [number, number, number]) => {
  const v = new THREE.Vector3(p[0], p[1], p[2] + s.layers[layer].z);
  v.applyEuler(new THREE.Euler(s.pitch, 0, 0)).applyEuler(new THREE.Euler(0, s.yaw, 0)).project(cam);
  return { x: ((v.x + 1) / 2) * L.W, y: L.STAGE_TOP + ((1 - v.y) / 2) * L.STAGE_H };
};
/** 標籤要指的地方：哪一層、層內座標、標籤往哪邊放（px） */
export const ANCHORS: Record<string, { layer: LayerId; p: [number, number, number]; dx: number; dy: number }> = {
  chip: { layer: "inner", p: [G.chip.x - G.chip.s / 2, G.chip.y, 0.3], dx: -150, dy: -40 },
  plate: { layer: "plate", p: [G.plate.w / 2, G.plate.y - 2.6, 0.2], dx: 130, dy: 70 },
  water: { layer: "plate", p: [HOT.x + 1.1, G.plate.y + HOT.y - 0.6, 0.3], dx: 200, dy: -90 },
  vapor: { layer: "plate", p: [0.6, G.plate.y + 0.6, 0.9], dx: 210, dy: -120 },
  loop: { layer: "plate", p: [-G.plate.w / 2, G.plate.y - 1.2, 0.2], dx: -120, dy: 150 },
  back: { layer: "back", p: [0, 0, 0], dx: 160, dy: 40 },
  battery: { layer: "inner", p: [0, -3, 0.2], dx: 180, dy: 40 },
  board: { layer: "inner", p: [1.5, 4.5, 0.2], dx: 180, dy: -40 },
  frame: { layer: "frame", p: [G.W / 2, 0, 0], dx: 150, dy: 0 },
  screen: { layer: "screen", p: [G.W / 2, 2, 0], dx: 150, dy: -40 },
};
