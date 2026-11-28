// node videos/tech-carrier/gen-model.mjs → 寫 videos/tech-carrier/model.json
// 2026/11/28 tech-carrier（中游補充篇 M5：光罩盒與晶圓載具）。模組與細節清單照 visual-spec.md、動作照 physics-spec.md。全部放大示意，非特定廠牌／型號。
// 站點（地板頂面 y＝0）：A 密封盒開場 x0｜B 晶圓盒拆解 x30｜C 盒底對位 x60｜D 天車＋承載埠 x90｜E 氮氣吹淨 x120｜F 出貨盒 x150
//   G 雙層光罩盒 x180｜H 盒子清洗 x210｜T 台灣廠 x240｜N 晶片故障預告 x270
// 每個零件建好就問「它靠什麼撐」：盒子放在台座／銷上、台座落在地上、天車軌道吊在天花板樑下、手臂立柱落在前端搬運區地板上、周邊設備放在底座外地面。
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const R2 = (x) => Math.round(x * 1000) / 1000;
const palette = {
  floorC: "#C9D2DE", panel: "#F3F5F8", panel2: "#E2E8F0", seam: "#8E9BB0", band: "#24324C", steel: "#7D8CA6", steel2: "#A9B5C7", dark: "#3E4A60", darker: "#2A3142",
  lampY: "#F2B632", lampG: "#2FBF71", lampR: "#E5484D", screen: "#5B8DEF", rubber: "#2B2F36", gold: "#C9A24A", whiteP: "#FFFFFF",
  waferC: "#7C89A6", dieC: "#4C5E86", mirC: "#C9D3E2", shellC: "#9CC2EE", shellF: "#D5DCE6", baseC: "#5E6878", combC: "#3A3F4C", doorC: "#E4E8EE",
  fosbC: "#E9ECF1", foamC: "#F4F1E8", kraftC: "#C9A66B", bagC: "#DDEBFA", n2C: "#2F7FE0", h2oC: "#BFE6FF", o2C: "#E5484D", mistC: "#8FCBF2", heatC: "#FF8A3D",
  outC: "#B07CF0", pcbC: "#2F6B4F", pkgC: "#2A2D33", leadC: "#C9D3E2", hotC: "#FF3B2F", quartzC: "#DCE8F5", chromeC: "#3B4150", glassC: "#BFD3F2",
  winC: "#5B8DEF", roofC: "#B6C0CF", markC: "#E8613C", tireC: "#23262B", cabC: "#2F7FE0", podC: "#3C4352", inpodC: "#B8C2D0", lensC: "#D8ECFF", dustC: "#C9A66B",
};
const M = (kind, color, o = {}) => ({ kind, color, ...o });
const glowM = (c, op, ei = 1) => M("std", c, { emissive: c, ei, opacity: op, rough: 1, metal: 0 });
const materials = {
  floor: M("std", "floorC", { rough: 0.7, metal: 0.3, tex: "brushed", texScale: 3 }),
  panel: M("std", "panel", { rough: 0.55, metal: 0.05, env: 0.25 }), panel2: M("std", "panel2", { rough: 0.6, metal: 0.05, env: 0.2 }),
  seam: M("std", "seam", { rough: 0.6, metal: 0.3 }), band: M("std", "band", { rough: 0.4, metal: 0.3, env: 0.4 }),
  steel: M("std", "steel", { rough: 0.35, metal: 0.85, env: 0.5 }), steel2: M("std", "steel2", { rough: 0.3, metal: 0.8, env: 0.6, tex: "brushed", texScale: 2 }),
  dark: M("std", "dark", { rough: 0.5, metal: 0.4, env: 0.3 }), darker: M("std", "darker", { rough: 0.5, metal: 0.3, env: 0.3 }), rubber: M("std", "rubber", { rough: 0.9, metal: 0 }),
  gold: M("std", "gold", { rough: 0.3, metal: 0.9, env: 0.8 }),
  lampY: M("std", "lampY", { emissive: "lampY", ei: 0.45, rough: 0.4, metal: 0 }), lampG: M("std", "lampG", { emissive: "lampG", ei: 0.45, rough: 0.4, metal: 0 }),
  lampR: M("std", "lampR", { emissive: "lampR", ei: 0.4, rough: 0.4, metal: 0 }), screen: M("std", "screen", { emissive: "screen", ei: 0.5, rough: 0.3, metal: 0 }),
  wafer: M("std", "waferC", { rough: 0.15, metal: 0.85, env: 1.1, tex: "traces", texScale: 0.5 }), mirror: M("std", "mirC", { rough: 0.04, metal: 0.95, env: 1.7 }),
  die: M("std", "dieC", { rough: 0.2, metal: 0.6, env: 0.9, tex: "traces", texScale: 0.35 }),
  shell: M("phys", "shellC", { rough: 0.08, metal: 0, clearcoat: 1, opacity: 0.26, env: 0.7 }), shellF: M("std", "shellF", { rough: 0.45, metal: 0.05, env: 0.4 }),
  fbase: M("std", "baseC", { rough: 0.55, metal: 0.1, env: 0.3 }), comb: M("std", "combC", { rough: 0.6, metal: 0.05, env: 0.25 }), door: M("std", "doorC", { rough: 0.45, metal: 0.05, env: 0.35 }),
  fosb: M("phys", "fosbC", { rough: 0.35, metal: 0, clearcoat: 0.4, opacity: 0.45, env: 0.4 }), fosbS: M("std", "fosbC", { rough: 0.45, metal: 0.05, env: 0.3 }),
  foam: M("std", "foamC", { rough: 0.95, metal: 0, tex: "wick", texScale: 0.25 }), kraft: M("std", "kraftC", { rough: 0.9, metal: 0, tex: "brushed", texScale: 1.5 }),
  bag: M("phys", "bagC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.22, env: 1.0 }),
  glass: M("phys", "glassC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.22, env: 0.6 }),
  quartz: M("phys", "quartzC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.55, env: 1.0 }), chrome: M("std", "chromeC", { rough: 0.2, metal: 0.8, env: 0.9, tex: "traces", texScale: 0.18 }),
  pod: M("std", "podC", { rough: 0.5, metal: 0.1, env: 0.3 }), inpod: M("std", "inpodC", { rough: 0.25, metal: 0.9, env: 0.8, tex: "brushed", texScale: 1.2 }),
  pcb: M("std", "pcbC", { rough: 0.5, metal: 0.1, env: 0.4, tex: "traces", texScale: 0.5 }), pkg: M("std", "pkgC", { rough: 0.6, metal: 0.05, env: 0.25 }), lead: M("std", "leadC", { rough: 0.25, metal: 0.9, env: 0.9 }),
  hotOff: M("std", "pkgC", { rough: 0.6, metal: 0.05 }), lens: M("phys", "lensC", { rough: 0.02, metal: 0, clearcoat: 1, opacity: 0.35, env: 1.6 }),
  win: M("std", "winC", { rough: 0.15, metal: 0.4, env: 1.0, emissive: "winC", ei: 0.15 }), roof: M("std", "roofC", { rough: 0.6, metal: 0.3 }),
  mark: M("std", "markC", { rough: 0.5, metal: 0, emissive: "markC", ei: 0.25 }), white: M("std", "whiteP", { rough: 0.7, metal: 0 }),
  tire: M("std", "tireC", { rough: 0.95, metal: 0 }), cab: M("phys", "cabC", { rough: 0.25, metal: 0.2, clearcoat: 0.8, env: 0.6 }),
  fin: M("std", "steel", { rough: 0.4, metal: 0.8, env: 0.5 }), dustD: M("std", "darker", { rough: 0.6, metal: 0 }),
};
const parts = [], layers = [], anchors = {}, actions = {};
const P = (o) => { parts.push(o); return o; };
const LAY = (id, outline, bg) => layers.push({ id, z: 0, k: 0, outline, ...(bg ? { bg: true } : {}) });
const V = [90, 0, 0];
const BOX = (id, layer, x0, x1, y0, y1, z0, z1, mat, o = {}) => P({ id, layer, shape: "box", size: [R2(Math.abs(x1 - x0)), R2(Math.abs(y1 - y0)), R2(Math.abs(z1 - z0))], pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat, ...o });
const VC = (id, layer, R, y0, y1, mat, o = {}) => { const { x = 0, z = 0, ...r } = o; return P({ id, layer, shape: "cyl", size: [R, R2(y1 - y0)], rot: V, pos: [R2(x), R2((y0 + y1) / 2), R2(z)], mat, ...r }); };
const RING = (id, layer, Ro, Ri, y0, y1, mat, x = 0, z = 0) => P({ id, layer, shape: "tube", size: [Ro, Ri, R2(y1 - y0)], rot: V, pos: [R2(x), R2((y0 + y1) / 2), R2(z)], mat });
const SPH = (id, layer, r, x, y, z, mat, o = {}) => P({ id, layer, shape: "sphere", size: [r], pos: [R2(x), R2(y), R2(z)], mat, ...o });
const A = (layer, p, dx, dy) => ({ layer, p: p.map(R2), dx, dy });
const AF = (layer, Wf, u, y, w, dx, dy) => { const [x, z] = Wf(u, w); return A(layer, [x, y, z], dx, dy); };
const plinth = (id, layer, x, z, w, d, h = 0.8) => { BOX(`${id}Pl`, layer, x - w / 2, x + w / 2, 0, h, z - d / 2, z + d / 2, "band"); BOX(`${id}PlT`, layer, x - w / 2, x + w / 2, h, h + 0.05, z - d / 2, z + d / 2, "panel2");
  BOX(`${id}Kick`, layer, x - w / 2 - 0.05, x + w / 2 + 0.05, 0, 0.12, z - d / 2 - 0.05, z + d / 2 + 0.05, "darker");
  P({ id: `${id}Bolt`, layer, shape: "cyl", size: [0.1, 0.04], rot: V, pos: [0, R2(h + 0.07), 0], at: [[x - w / 2 + 0.3, 0, z - d / 2 + 0.3], [x + w / 2 - 0.3, 0, z - d / 2 + 0.3], [x - w / 2 + 0.3, 0, z + d / 2 - 0.3], [x + w / 2 - 0.3, 0, z + d / 2 - 0.3]].map((a) => a.map(R2)), mat: "steel" }); return h + 0.05; };
const panelUI = (id, layer, x, y, z, s = 1) => {
  BOX(`${id}Pn`, layer, x - 0.7 * s, x + 0.7 * s, y, y + 1.0 * s, z, z + 0.08, "darker");
  BOX(`${id}Sc`, layer, x - 0.55 * s, x + 0.35 * s, y + 0.35 * s, y + 0.88 * s, z + 0.08, z + 0.1, "screen");
  SPH(`${id}L0`, layer, 0.06 * s, x + 0.52 * s, y + 0.8 * s, z + 0.1, "lampG"); SPH(`${id}L1`, layer, 0.06 * s, x + 0.52 * s, y + 0.64 * s, z + 0.1, "lampY"); SPH(`${id}L2`, layer, 0.06 * s, x + 0.52 * s, y + 0.48 * s, z + 0.1, "lampR");
  P({ id: `${id}Bt`, layer, shape: "cyl", size: [R2(0.06 * s), 0.04], pos: [0, R2(y + 0.17 * s), R2(z + 0.1)], at: [0, 1, 2, 3, 4].map((i) => [R2(x - 0.5 * s + i * 0.22 * s), 0, 0]), mat: "steel2" });
};
const valve = (id, layer, x, y, z) => { BOX(`${id}B`, layer, x - 0.14, x + 0.14, y - 0.12, y + 0.12, z - 0.12, z + 0.12, "steel"); VC(`${id}S`, layer, 0.03, y + 0.12, y + 0.3, "steel2", { x, z });
  RING(`${id}H`, layer, 0.16, 0.12, y + 0.3, y + 0.34, "lampR", x, z); };
const idsOf = (layer) => parts.filter((q) => q.layer === layer).map((q) => q.id);
const ry = (dx, dz) => R2((Math.atan2(-dz, dx) * 180) / Math.PI);

// ═════ 晶圓盒（FOUP）產生器 ═════
// 局部座標：u＝寬（左右）、v＝高（盒底＝0）、w＝深（+w＝前門那一面）。face "+z"＝門朝鏡頭；face "-x"＝門朝 −x（承載埠那一側）。
// 層：L.b 盒底（底板＋三道放射溝＋資訊墊＋兩側槽齒插件＋後擋＋25 片晶圓）｜L.s 盒殼（半透明殼＋邊框＋門框＋把手＋條碼）｜L.t 頂部法蘭（蘑菇頭＋4 顆螺絲）｜L.d 前門（門板＋密封條＋兩個門閂鑰匙孔＋晶圓壓制彈片）
//   L.k（可省）：被手臂取走的那一片晶圓（第 PICK 片）
const FW = 1.92, FD = 1.8, WR = 1.5, WV = (i) => R2(0.5 + i * 0.1), NW = 25, KR = 1.0, KANG = [90, 210, 330], PICK = 12;
// face：門朝哪個方向，寫角度（度，繞 y 軸；0＝門朝 +z 鏡頭、-90＝門朝 −x、35＝門朝右前方，鏡頭同時看得到門與左側半透明殼）
const fMap = (th, x0, z0) => { const c = Math.cos((th * Math.PI) / 180), s = Math.sin((th * Math.PI) / 180); return (u, w) => [R2(x0 + u * c + w * s), R2(z0 - u * s + w * c)]; };
const foup = (p, x0, y0, z0, face, L, opt = {}) => {
  const th = face === "+z" ? 0 : face === "-x" ? -90 : Number(face);
  const W = fMap(th, x0, z0), RT = th ? { rot: [0, th, 0] } : {};
  // 斜放（不是 90 度倍數）時把大板切成 ≤0.6 的小塊：版面檢查對斜轉零件用外接球估範圍，大板會被估得比實際大很多（畫面看起來一樣）
  const tilt = th % 90 !== 0;
  const LB = (id, ly, u0, u1, v0, v1, w0, w1, mat) => {
    const su = Math.abs(u1 - u0), sw = Math.abs(w1 - w0), nu = tilt ? Math.max(1, Math.ceil(su / 0.6)) : 1, nw = tilt ? Math.max(1, Math.ceil(sw / 0.6)) : 1, tu = su / nu, tw = sw / nw;
    const pts = []; for (let i = 0; i < nu; i++) for (let j = 0; j < nw; j++) { const [x, z] = W(Math.min(u0, u1) + (i + 0.5) * tu, Math.min(w0, w1) + (j + 0.5) * tw); pts.push([x, R2(y0 + (v0 + v1) / 2), z]); }
    return P({ id, layer: ly, shape: "box", size: [R2(tu), R2(Math.abs(v1 - v0)), R2(tw)], pos: [0, 0, 0], at: pts, mat, ...RT }); };
  const LBA = (id, ly, [su, sv, sw], pts, mat) => P({ id, layer: ly, shape: "box", size: [su, sv, sw].map(R2), pos: [0, 0, 0], at: pts.map(([u, v, w]) => { const [x, z] = W(u, w); return [x, R2(y0 + v), z]; }), mat, ...RT });
  const LVC = (id, ly, r, v0, v1, u, w, mat) => { const [x, z] = W(u, w); VC(id, ly, r, y0 + v0, y0 + v1, mat, { x, z }); };
  const LCW = (id, ly, r, len, pts, mat) => P({ id, layer: ly, shape: "cyl", size: [r, len], pos: [0, 0, 0], ...RT, at: pts.map(([u, v, w]) => { const [x, z] = W(u, w); return [x, R2(y0 + v), z]; }), mat });
  // 盒底：底板＋邊緣條＋資訊墊
  LB(`${p}Bp`, L.b, -1.88, 1.88, 0.06, 0.26, -1.82, 1.78, "fbase");
  LB(`${p}BpE`, L.b, -1.9, 1.9, 0.2, 0.26, 1.72, 1.8, "darker");
  LBA(`${p}Pad`, L.b, [0.22, 0.015, 0.22], [[-1.45, 0.268, 1.45], [-1.12, 0.268, 1.45], [1.12, 0.268, 1.45], [1.45, 0.268, 1.45]], "darker");
  // 三道放射溝（每道兩條溝壁，溝底朝下開口）：放到三顆圓頭銷上就自己滑到定位
  // 三道放射 V 形溝（兩片斜 30° 的溝壁＋深色溝底），溝口朝下；放到三顆圓頭銷上，銷頂住兩面溝壁，盒子就被推到正中
  KANG.forEach((a, k) => { const r = (a * Math.PI) / 180, cu = KR * Math.cos(r), cw = KR * Math.sin(r), nu = -Math.sin(r), nw = Math.cos(r);
    const [dx0, dz0] = W(Math.cos(r), Math.sin(r)), [ox, oz] = W(0, 0), yaw = R2((Math.atan2(dx0 - ox, dz0 - oz) * 180) / Math.PI);
    for (const s of [-1, 1]) { const [x, z] = W(cu + s * 0.09 * nu, cw + s * 0.09 * nw);
      P({ id: `${p}Gr${k}${s > 0 ? "a" : "b"}`, layer: L.b, shape: "box", size: [0.16, 0.04, 0.8], pos: [x, R2(y0 + 0.035), z], rot: [0, yaw, s * 30], mat: "steel2" }); }
    const [x, z] = W(cu, cw); P({ id: `${p}GrB${k}`, layer: L.b, shape: "box", size: [0.06, 0.02, 0.8], pos: [x, R2(y0 + 0.07), z], rot: [0, yaw, 0], mat: "darker" }); });
  // 兩側槽齒插件（立在底板上）：背板＋25 道槽齒；後擋＋擋齒
  for (const s of [-1, 1]) {
    // 槽齒插件：兩根立柱（立在底板上）＋25 道槽齒（不做整片背板，側面看得到晶圓）
    LBA(`${p}Cb${s > 0 ? "R" : "L"}`, L.b, [0.12, 2.86, 0.12], [[s * 1.68, 1.69, -0.8], [s * 1.68, 1.69, 0.65]], "comb");
    LBA(`${p}Th${s > 0 ? "R" : "L"}`, L.b, [0.26, 0.03, 1.6], Array.from({ length: NW }, (_, i) => [s * 1.5, WV(i) - 0.015, -0.075]), "comb");
  }
  LB(`${p}Rr`, L.b, -0.5, 0.5, 0.26, 3.12, -1.74, -1.62, "comb");
  LBA(`${p}RrT`, L.b, [0.9, 0.03, 0.14], Array.from({ length: NW }, (_, i) => [0, WV(i) - 0.015, -1.55]), "comb");
  // 25 片晶圓（產品片：表面線路紋）；最上面那片畫出晶粒格
  const wf = Array.from({ length: NW }, (_, i) => i).filter((i) => !(opt.pick && i === PICK)), [wx0, wz0] = W(0, 0);
  // 每 5 片換一片鏡面材質：遠看也看得出一片一片的縫
  P({ id: `${p}Wf`, layer: L.b, shape: "cyl", size: [WR, 0.03], rot: V, pos: [0, 0, 0], at: wf.filter((i) => i % 5 !== 2).map((i) => [wx0, R2(y0 + WV(i) + 0.015), wz0]), mat: "wafer" });
  P({ id: `${p}WfM`, layer: L.b, shape: "cyl", size: [WR, 0.03], rot: V, pos: [0, 0, 0], at: wf.filter((i) => i % 5 === 2).map((i) => [wx0, R2(y0 + WV(i) + 0.015), wz0]), mat: "mirror" });
  { const g = 0.36, at = []; for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) if (Math.hypot(Math.abs(i * g) + g / 2, Math.abs(j * g) + g / 2) < WR * 0.95) { const [x, z] = W(i * g, j * g); at.push([x, R2(y0 + WV(NW - 1) + 0.036), z]); }
    P({ id: `${p}Die`, layer: L.b, shape: "box", size: [R2(g * 0.86), 0.012, R2(g * 0.86)], pos: [0, 0, 0], at, mat: "die" }); }
  if (opt.pick) { const [x, z] = W(0, 0); VC(`${p}PkW`, L.k, WR, y0 + WV(PICK), y0 + WV(PICK) + 0.03, "die", { x, z }); }
  // 盒殼（半透明）：左右、後、頂四面＋不透明邊框＋前門框＋把手＋條碼
  for (const s of [-1, 1]) LB(`${p}Sw${s > 0 ? "R" : "L"}`, L.s, Math.min(s * 1.86, s * FW), Math.max(s * 1.86, s * FW), 0.26, 3.62, -1.86, 1.72, "shell");
  LB(`${p}Sb`, L.s, -FW, FW, 0.26, 3.62, -1.92, -1.86, "shell");
  LB(`${p}St`, L.s, -FW, FW, 3.62, 3.72, -1.92, 1.8, "shell");
  LBA(`${p}Ev`, L.s, [0.08, 3.46, 0.08], [[-FW, 1.94, -1.89], [FW, 1.94, -1.89]], "shellF");
  LBA(`${p}Eu`, L.s, [0.65, 0.08, 0.08], [3.68, 0.3].flatMap((v) => [-1.625, -0.975, -0.325, 0.325, 0.975, 1.625].map((u) => [u, v, -1.89])), "shellF");
  LBA(`${p}Ew`, L.s, [0.08, 0.08, 0.6], [[-FW, 3.68], [FW, 3.68], [-FW, 0.3], [FW, 0.3]].flatMap(([u, v]) => [-1.56, -0.96, -0.36, 0.24, 0.84, 1.44].map((w) => [u, v, w])), "shellF");
  LB(`${p}FfT`, L.s, -FW, FW, 3.48, 3.72, 1.72, 1.8, "shellF"); LB(`${p}FfB`, L.s, -FW, FW, 0.26, 0.38, 1.72, 1.8, "shellF");
  for (const s of [-1, 1]) LB(`${p}FfS${s > 0 ? "R" : "L"}`, L.s, Math.min(s * 1.78, s * FW), Math.max(s * 1.78, s * FW), 0.38, 3.48, 1.72, 1.8, "shellF");
  for (const s of [-1, 1]) { const t = s > 0 ? "R" : "L";
    LBA(`${p}HdS${t}`, L.s, [0.18, 0.14, 0.14], [[s * 2.0, 2.25, -0.62], [s * 2.0, 2.25, 0.62]], "shellF");
    LB(`${p}Hd${t}`, L.s, Math.min(s * 2.06, s * 2.16), Math.max(s * 2.06, s * 2.16), 2.1, 2.4, -0.75, 0.75, "shellF"); }
  LB(`${p}Bc`, L.s, FW, FW + 0.012, 0.9, 1.5, -1.3, -0.3, "white");
  LB(`${p}Rf`, L.s, -FW - 0.07, -FW, 0.45, 0.8, 0.8, 1.4, "dark"); LB(`${p}RfC`, L.s, -FW - 0.08, -FW - 0.07, 0.52, 0.73, 0.88, 1.32, "gold");
  LBA(`${p}BcB`, L.s, [0.012, 0.42, 0.035], [-1.22, -1.12, -1.05, -0.95, -0.86, -0.78, -0.7, -0.58, -0.5, -0.42].map((w) => [FW + 0.014, 1.2, w]), "darker");
  // 頂部法蘭：立柱＋蘑菇頭＋4 顆螺絲
  LVC(`${p}Fp`, L.t, 0.34, 3.72, 3.96, 0, 0, "shellF");
  LB(`${p}Fl`, L.t, -0.9, 0.9, 3.96, 4.08, -0.9, 0.9, "shellF");
  LBA(`${p}FlB`, L.t, [0.1, 0.03, 0.1], [[-0.66, 4.095, -0.66], [0.66, 4.095, -0.66], [-0.66, 4.095, 0.66], [0.66, 4.095, 0.66]], "steel");
  LBA(`${p}FlR`, L.t, [0.6, 0.05, 0.05], [0.92, -0.92].flatMap((w) => [-0.6, 0, 0.6].map((u) => [u, 4.02, w])), "darker");
  // 前門：門板＋四周密封條＋兩個門閂鑰匙孔（凹槽＋鑰匙孔＋一字槽）＋內側晶圓壓制彈片
  LB(`${p}Dp`, L.d, -1.76, 1.76, 0.4, 3.46, 1.8, 1.96, "door");
  LB(`${p}SlT`, L.d, -1.7, 1.7, 3.36, 3.42, 1.74, 1.8, "rubber"); LB(`${p}SlB`, L.d, -1.7, 1.7, 0.44, 0.5, 1.74, 1.8, "rubber");
  for (const s of [-1, 1]) LB(`${p}SlS${s > 0 ? "R" : "L"}`, L.d, Math.min(s * 1.64, s * 1.7), Math.max(s * 1.64, s * 1.7), 0.5, 3.36, 1.74, 1.8, "rubber");
  for (const s of [-1, 1]) LB(`${p}Rc${s > 0 ? "R" : "L"}`, L.d, s * 0.9 - 0.32, s * 0.9 + 0.32, 1.6, 2.24, 1.96, 1.975, "shellF");
  LCW(`${p}Kh`, L.d, 0.17, 0.05, [[-0.9, 1.92, 1.99], [0.9, 1.92, 1.99]], "dark");
  LBA(`${p}KhS`, L.d, [0.24, 0.05, 0.02], [[-0.9, 1.92, 2.02], [0.9, 1.92, 2.02]], "steel2");
  LB(`${p}Rt`, L.d, -0.32, 0.32, 0.55, 3.25, 1.66, 1.8, "comb");
  LBA(`${p}RtF`, L.d, [0.5, 0.02, 0.14], Array.from({ length: NW }, (_, i) => [0, WV(i) + 0.015, 1.58]), "comb");
  return W;
};

// ═════ 地板 ═════
LAY("floor", [320, 2, 135, 0], true);
P({ id: "floor", layer: "floor", shape: "slab", size: [320, 0.5, 44], r: 0.2, pos: [135, -0.25, 0], mat: "floor" });
P({ id: "floorSeam", layer: "floor", shape: "slab", size: [320, 0.04, 0.1], pos: [135, 0.01, 0], at: Array.from({ length: 7 }, (_, i) => [0, 0, R2(-16 + i * 5.3)]), mat: "seam" });

// ═════ 站 A：密封盒開場（x 0）：組好的晶圓盒放在台座上，灰塵在外面飄、碰到門面減速貼著滑走 ═════
const AX = 0;
LAY("aBase", [7, 1, AX, 0.5]);
const AH = plinth("a", "aBase", AX, 0, 6.4, 5.4, 0.8);
LAY("aFoup", [4.4, 4.2, AX, AH + 2.0]);
const AW = foup("a", AX, AH, 0, 35, { b: "aFoup", s: "aFoup", t: "aFoup", d: "aFoup" });
const AP = (pts) => pts.map(([u, v, w]) => { const [x, z] = AW(u, w); return [x, R2(AH + v), z]; });
// r1（物理必改 7）：灰塵從門那一側（右前方）進場，整條路徑都在門面前方；靠近段較快、貼著門面滑走那段較慢（兩條 flow）
actions.aDustIn = { track: false, free: true, type: "flow", _說明: "灰塵從右前方飄向門面（靠近段）", path: AP([[3.8, 3.4, 4.6], [1.9, 2.6, 2.6], [1.0, 2.3, 2.12]]), n: 6, size: 0.08, shape: "grit", rate: 0.3, color: "dustC", layer: "aBase", jitter: 0.06, lanes: 3, laneGap: 0.5, laneDir: [0, 1, 0] };
actions.aDustSlide = { track: false, free: true, type: "flow", _說明: "碰到門面減速，貼著門面滑走、往左下離開，進不去", path: AP([[1.0, 2.3, 2.12], [-0.8, 2.1, 2.1], [-1.6, 1.8, 2.3], [-2.6, 1.0, 3.8]]), n: 6, size: 0.08, shape: "grit", rate: 0.15, phase: 0.3, color: "dustC", layer: "aBase", jitter: 0.04, lanes: 3, laneGap: 0.5, laneDir: [0, 1, 0] };

// ═════ 站 B：晶圓盒拆解（x 30）：盒底｜盒殼｜頂部法蘭｜前門 各一層；前門沿 +z 退出、盒殼往上、法蘭再往上 ═════
const BX = 30;
LAY("bBase", [7, 1, BX, 0.5]);
const BH = plinth("b", "bBase", BX, 0, 6.4, 5.4, 0.8);
LAY("bB", [4.0, 3.0, BX, BH + 1.6]); LAY("bS", [4.4, 3.6, BX, BH + 1.9]); LAY("bT", [2, 0.5, BX, BH + 3.9]); LAY("bD", [3.6, 3.2, BX, BH + 1.9]);
const B_TH = 35;
const BW = foup("b", BX, BH, 0, B_TH, { b: "bB", s: "bS", t: "bT", d: "bD" });
const B_DOOR = 2.6, B_DDX = R2(2.6 * Math.sin((B_TH * Math.PI) / 180)), B_DDZ = R2(2.6 * Math.cos((B_TH * Math.PI) / 180)), B_SHELL = 3.1, B_TOP = 3.9;

// ═════ 站 C：盒底對位（x 60）：台座＋定位板＋三顆圓頭銷；盒子從偏一點的位置往下，接觸後水平滑到定位 ═════
const CX = 60;
LAY("cBase", [7, 3.2, CX, 1.5]);
const CH = plinth("c", "cBase", CX, 0, 6.4, 5.4, 0.8);
VC("cPed", "cBase", 0.6, CH, CH + 1.6, "steel2", { x: CX }); RING("cPedR", "cBase", 1.0, 0.6, CH, CH + 0.2, "dark", CX, 0);
P({ id: "cPedB", layer: "cBase", shape: "cyl", size: [0.07, 0.05], rot: V, pos: [0, R2(CH + 0.22), 0], at: [45, 135, 225, 315].map((d) => [R2(CX + 0.8 * Math.cos((d * Math.PI) / 180)), 0, R2(0.8 * Math.sin((d * Math.PI) / 180))]), mat: "steel" });
P({ id: "cHose", layer: "cBase", shape: "cyl", size: [0.07, 1.4], rot: V, pos: [R2(CX - 0.7), R2(CH + 0.9), 0.3], mat: "rubber" }); SPH("cHoseE", "cBase", 0.09, CX - 0.7, CH + 1.6, 0.3, "rubber");
const CPY = CH + 1.6;
VC("cHub", "cBase", 0.55, CPY, CPY + 0.24, "steel", { x: CX }); RING("cHubR", "cBase", 0.62, 0.55, CPY + 0.18, CPY + 0.26, "dark", CX, 0);
const CPT = CPY + 0.24;
// r1（機構可改＋物理必改 1）：定位板改成三支臂（只有銷底下有板），仰視同時看得到三道溝和三顆銷
const C_TH = 30, CW = fMap(C_TH, CX, 0), CPIN = KANG.map((a) => CW(KR * Math.cos((a * Math.PI) / 180), KR * Math.sin((a * Math.PI) / 180)));
CPIN.forEach(([x, z], k) => { const dx = x - CX, dz = z, L = Math.hypot(dx, dz) + 0.25;
  P({ id: `cArm${k}`, layer: "cBase", shape: "box", size: [0.34, 0.24, R2(L)], pos: [R2(CX + (dx * L) / 2 / Math.hypot(dx, dz)), R2(CPY + 0.12), R2((dz * L) / 2 / Math.hypot(dx, dz))], rot: [0, R2((Math.atan2(dx, dz) * 180) / Math.PI), 0], mat: "steel" }); });
P({ id: "cPinPad", layer: "cBase", shape: "cyl", size: [0.24, 0.24], rot: V, pos: [0, R2(CPY + 0.12), 0], at: CPIN.map(([x, z]) => [x, 0, z]), mat: "steel" });
P({ id: "cPinP", layer: "cBase", shape: "cyl", size: [0.09, 0.16], rot: V, pos: [0, R2(CPT + 0.08), 0], at: CPIN.map(([x, z]) => [x, 0, z]), mat: "steel2" });
P({ id: "cPinH", layer: "cBase", shape: "sphere", size: [0.11], pos: [0, R2(CPT + 0.17), 0], at: CPIN.map(([x, z]) => [x, 0, z]), mat: "steel" });
P({ id: "cPinB", layer: "cBase", shape: "tube", size: [0.2, 0.09, 0.03], rot: V, pos: [0, R2(CPT + 0.015), 0], at: CPIN.map(([x, z]) => [x, 0, z]), mat: "darker" });
const CFY = R2(CPT + 0.22);   // 盒底高度：底板底面（CFY+0.06）剛好碰到圓頭銷頂（CPT+0.28），溝壁跨在圓頭兩側
LAY("cFoup", [4.4, 4.2, CX, CFY + 2.0]);
foup("c", CX, CFY, 0, C_TH, { b: "cFoup", s: "cFoup", t: "cFoup", d: "cFoup" });
const C_DROP = 1.0, C_OFFX = 0.06, C_OFFZ = -0.05, C_LAST = 0.12;   // r1 物理必改 1：偏差 ≤0.08（在溝的捕捉範圍內），最後 0.12 慢降時同時被溝壁推正

// ═════ 站 D：天車（OHT）＋承載埠（load port）＋前端搬運區（x 90）═════
// 承載埠在右、機台前端搬運區在左（門朝 −x）。天車從右邊沿天花板軌道開過來 → 皮帶等速放下（到位前減速）→ 夾爪張開、收回 →
// 承載埠的定位板帶著盒子往機台靠 → 盒門被門板吸住解鎖，兩扇門一起往機台內退、再沿導軌往下 → 手臂叉子從片下水平伸進去、抬一點、退出。
const LPX = 92, SY = 5.0, DFY = R2(SY + 0.24 + 0.2), WX = R2(LPX - 2.3);
LAY("dPort", [5, 5.4, LPX, 2.6]);
// 承載埠本體（落地）＋台座板＋狀態燈＋按鈕面板
BOX("dLpBody", "dPort", WX, LPX + 2.1, 0, SY - 0.15, -2.0, 2.0, "panel"); BOX("dLpKick", "dPort", WX, LPX + 2.15, 0, 0.14, -2.05, 2.05, "darker");
P({ id: "dLpSeam", layer: "dPort", shape: "box", size: [0.03, R2(SY - 0.3), 0.03], pos: [0, R2((SY - 0.15) / 2), 2.01], at: [[R2(LPX - 0.9), 0, 0], [R2(LPX + 0.9), 0, 0]], mat: "seam" });
BOX("dLpStage", "dPort", WX, LPX + 2.2, SY - 0.15, SY, -2.05, 2.05, "steel2");
panelUI("dLpUi", "dPort", LPX + 0.9, 1.8, 2.0, 0.7);
BOX("dRfid", "dPort", LPX + 2.1, LPX + 2.2, SY - 1.2, SY - 0.5, -0.4, 0.4, "dark"); BOX("dRfidW", "dPort", LPX + 2.2, LPX + 2.21, SY - 1.1, SY - 0.6, -0.3, 0.3, "screen");
P({ id: "dLpLamp", layer: "dPort", shape: "box", size: [0.5, 0.14, 0.06], pos: [R2(LPX - 0.4), R2(SY - 0.45), 2.03], at: [[0, 0, 0], [0.6, 0, 0], [1.2, 0, 0]], mat: "lampG" });
BOX("dLpLv", "dPort", LPX - 1.6, LPX + 0.2, 0.6, 1.4, 2.0, 2.02, "seam");
P({ id: "dLpLvS", layer: "dPort", shape: "box", size: [1.7, 0.04, 0.02], pos: [R2(LPX - 0.7), 0, 2.03], at: [0, 1, 2, 3, 4].map((i) => [0, R2(0.7 + i * 0.15), 0]), mat: "dark" });
// 定位板（會帶著盒子往機台靠）：板＋三顆圓頭銷＋氮氣進氣嘴（後）／排氣嘴（前）
LAY("dDock", [4, 0.6, LPX, SY + 0.2]);
BOX("dDockP", "dDock", LPX - 1.95, LPX + 1.95, SY, SY + 0.24, -1.95, 1.95, "steel");
const DPIN = KANG.map((a) => { const r = (a * Math.PI) / 180; return [R2(LPX - KR * Math.sin(r)), R2(KR * Math.cos(r))]; });
P({ id: "dPinP", layer: "dDock", shape: "cyl", size: [0.09, 0.16], rot: V, pos: [0, R2(SY + 0.32), 0], at: DPIN.map(([x, z]) => [x, 0, z]), mat: "steel2" });
P({ id: "dPinH", layer: "dDock", shape: "sphere", size: [0.11], pos: [0, R2(SY + 0.41), 0], at: DPIN.map(([x, z]) => [x, 0, z]), mat: "steel" });
P({ id: "dNoz", layer: "dDock", shape: "cyl", size: [0.13, 0.12], rot: V, pos: [0, R2(SY + 0.3), 0], at: [[LPX + 1.3, 0, -1.1], [LPX + 1.3, 0, 1.1], [LPX - 1.3, 0, 0]].map((a) => a.map(R2)), mat: "lampG" });
// 前端搬運區（EFEM）：落地框體、後板與左板不透明、前（+z）面是觀察玻璃；右牆＝承載埠開口框；頂上濾網（格柵）
const EX0 = R2(WX - 6.4), EY1 = 11.6;
LAY("dEfem", [7, 12.4, WX - 3.2, 6]);
BOX("dEfFloor", "dEfem", EX0, WX, 0, 0.2, -2.6, 2.6, "darker");
BOX("dEfBack", "dEfem", EX0, WX, 0.2, EY1, -2.6, -2.5, "panel2"); BOX("dEfLeft", "dEfem", EX0, EX0 + 0.12, 0.2, EY1, -2.6, 2.6, "panel2");
BOX("dEfGlass", "dEfem", EX0 + 0.12, WX - 0.15, 0.2, EY1, 2.52, 2.58, "glass");
P({ id: "dEfPost", layer: "dEfem", shape: "box", size: [0.16, R2(EY1 - 0.2), 0.16], pos: [0, R2((EY1 + 0.2) / 2), 0], at: [[EX0 + 0.08, 0, 2.55], [WX - 0.08, 0, 2.55], [EX0 + 0.08, 0, -2.55], [WX - 0.08, 0, -2.55], [R2((EX0 + WX) / 2), 0, 2.55]].map((a) => a.map(R2)), mat: "steel" });
P({ id: "dEfRail", layer: "dEfem", shape: "box", size: [R2(WX - EX0), 0.16, 0.16], pos: [R2((EX0 + WX) / 2), 0, 2.55], at: [[0, 0.3, 0], [0, R2(EY1 - 0.08), 0], [0, 4.0, 0]], mat: "steel" });
// 右牆（機台前牆）：開口上下左右四塊＋開口框（深色）
const OY0 = R2(SY + 0.38), OY1 = R2(SY + 3.62);
BOX("dWallB", "dEfem", WX - 0.15, WX, 0.2, OY0, -2.6, 2.5, "panel"); BOX("dWallT", "dEfem", WX - 0.15, WX, OY1, EY1, -2.6, 2.5, "panel");
BOX("dWallL", "dEfem", WX - 0.15, WX, OY0, OY1, -2.6, -1.85, "panel"); BOX("dWallR", "dEfem", WX - 0.15, WX, OY0, OY1, 1.85, 2.5, "panel");
P({ id: "dOpenF", layer: "dEfem", shape: "ring", size: [3.9, R2(OY1 - OY0 + 0.2), 0.06], wall: 0.12, rot: [0, 90, 0], pos: [R2(WX + 0.03), R2((OY0 + OY1) / 2), 0], mat: "dark" });
P({ id: "dStatus", layer: "dEfem", shape: "sphere", size: [0.11], pos: [R2(WX + 0.08), R2(OY1 + 0.5), 0], at: [[0, 0, -0.6], [0, 0, 0], [0, 0, 0.6]], mat: "lampG" });
BOX("dTag", "dEfem", WX, WX + 0.02, OY1 + 0.9, OY1 + 1.5, -1.0, 1.0, "white");
BOX("dMap", "dEfem", WX, WX + 0.12, OY1 + 0.06, OY1 + 0.22, -1.6, 1.6, "darker"); P({ id: "dMapL", layer: "dEfem", shape: "box", size: [0.02, 0.06, 0.12], pos: [R2(WX + 0.13), R2(OY1 + 0.14), 0], at: [-1.2, -0.4, 0.4, 1.2].map((z) => [0, 0, z]), mat: "lampR" });
BOX("dFfu", "dEfem", EX0, WX, EY1, EY1 + 0.7, -2.6, 2.6, "panel"); BOX("dFfuB", "dEfem", EX0, WX, EY1 + 0.7, EY1 + 0.78, -2.62, 2.62, "steel");
P({ id: "dFfuG", layer: "dEfem", shape: "box", size: [0.05, 0.02, 4.8], pos: [0, R2(EY1 - 0.012), 0], at: Array.from({ length: 21 }, (_, i) => [R2(EX0 + 0.3 + i * 0.29), 0, 0]), mat: "darker" });
P({ id: "dFfuG2", layer: "dEfem", shape: "box", size: [R2(WX - EX0 - 0.4), 0.02, 0.05], pos: [R2((EX0 + WX) / 2), R2(EY1 - 0.012), 0], at: Array.from({ length: 9 }, (_, i) => [0, 0, R2(-2.2 + i * 0.55)]), mat: "darker" });
P({ id: "dFfuLv", layer: "dEfem", shape: "box", size: [R2(WX - EX0 - 0.6), 0.04, 0.02], pos: [R2((EX0 + WX) / 2), 0, 2.62], at: [0, 1, 2].map((i) => [0, R2(EY1 + 0.18 + i * 0.16), 0]), mat: "dark" });
actions.dFfuAir = { track: false, free: true, type: "flow", _說明: "濾網往下吹乾淨空氣（機台內是過濾過的空氣，不是外面的空氣）", path: [[R2((EX0 + WX) / 2), EY1 - 0.1, 0], [R2((EX0 + WX) / 2), 1.2, 0]], n: 4, size: 0.12, shape: "arrow", rate: 0.35, color: "h2oC", layer: "dEfem", lanes: 5, laneGap: 1.2, laneDir: [1, 0, 0] };
// 門的下降導軌（機台內兩側）
P({ id: "dGuide", layer: "dEfem", shape: "box", size: [0.12, R2(OY1 - 1.2), 0.12], pos: [R2(WX - 0.62), R2((OY1 + 1.2) / 2), 0], at: [[0, 0, -1.96], [0, 0, 1.96]], mat: "steel2" });
// 機台門（門板＋兩根門閂鑰匙＋兩側滑塊）
LAY("dPD", [3.8, 3.4, WX - 0.1, (OY0 + OY1) / 2]);
BOX("dPDp", "dPD", WX - 0.15, WX - 0.04, OY0 + 0.05, OY1 - 0.05, -1.8, 1.8, "steel2");
P({ id: "dPDkey", layer: "dPD", shape: "cyl", size: [0.07, 0.2], rot: [0, 90, 0], pos: [R2(WX + 0.06), R2(DFY + 1.92), 0], at: [[0, 0, -0.9], [0, 0, 0.9]], mat: "gold" });
P({ id: "dPDcar", layer: "dPD", shape: "box", size: [0.6, 0.5, 0.14], pos: [R2(WX - 0.38), R2((OY0 + OY1) / 2), 0], at: [[0, 0, -1.87], [0, 0, 1.87]], mat: "dark" });
P({ id: "dPDsuck", layer: "dPD", shape: "cyl", size: [0.15, 0.03], rot: [0, 90, 0], pos: [R2(WX - 0.02), 0, 0], at: [[0, R2(OY0 + 0.6), -1.2], [0, R2(OY0 + 0.6), 1.2], [0, R2(OY1 - 0.6), -1.2], [0, R2(OY1 - 0.6), 1.2]], mat: "rubber" });
// 手臂（落地立柱、第一節臂固定在柱頂、第二節臂與叉子沿臂伸縮）
const RCX = R2(WX - 4.2), RWY = R2(DFY + WV(PICK)), RY = R2(RWY - 0.02);
LAY("dRobot", [3, 7, RCX, 3.5]);
BOX("dRbBase", "dRobot", RCX - 0.7, RCX + 0.7, 0.2, 0.6, -0.7, 0.7, "darker");
// r1（機構細節 #4）：立柱改方形外殼＋升降縫＋關節蓋與螺絲；叉子根部真空吸孔
BOX("dRbCol", "dRobot", RCX - 0.42, RCX + 0.42, 0.6, RY - 0.36, -0.42, 0.42, "panel"); BOX("dRbSlot", "dRobot", RCX - 0.05, RCX + 0.05, 1.0, RY - 0.6, 0.42, 0.44, "darker");
P({ id: "dRbColS", layer: "dRobot", shape: "box", size: [0.86, 0.03, 0.86], pos: [RCX, 0, 0], at: [1.8, 3.4, 5.0].map((y) => [0, y, 0]), mat: "seam" });
BOX("dRbTag", "dRobot", RCX - 0.3, RCX + 0.1, 2.4, 2.7, 0.42, 0.44, "white");
P({ id: "dRbBolt", layer: "dRobot", shape: "cyl", size: [0.06, 0.04], rot: V, pos: [0, 0.62, 0], at: [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].map(([x, z]) => [R2(RCX + x), 0, z]), mat: "steel" });
P({ id: "dRbCab", layer: "dRobot", shape: "cyl", size: [0.07, 1.6], pos: [R2(RCX - 0.9), 0.4, -1.4], rot: [0, 90, 0], mat: "rubber" });
BOX("dRbL1", "dRobot", RCX - 0.5, WX - 1.3, RY - 0.3, RY - 0.14, -0.28, 0.28, "steel");
BOX("dRbL1c", "dRobot", RCX - 0.5, RCX + 0.5, RY - 0.36, RY - 0.12, -0.38, 0.38, "dark");
VC("dRbCap", "dRobot", 0.34, RY - 0.12, RY - 0.1, "steel2", { x: RCX }); P({ id: "dRbCapB", layer: "dRobot", shape: "cyl", size: [0.04, 0.02], rot: V, pos: [0, R2(RY - 0.09), 0], at: [0, 90, 180, 270].map((d) => [R2(RCX + 0.24 * Math.cos((d * Math.PI) / 180)), 0, R2(0.24 * Math.sin((d * Math.PI) / 180))]), mat: "steel" });
LAY("dArm2", [2.2, 0.3, RCX + 1.2, RY - 0.1]);
BOX("dRbL2", "dArm2", RCX + 0.1, RCX + 2.1, RY - 0.14, RY - 0.05, -0.2, 0.2, "steel2");
VC("dRbJ", "dArm2", 0.2, RY - 0.16, RY - 0.04, "dark", { x: RCX + 2.0 }); P({ id: "dRbJB", layer: "dArm2", shape: "cyl", size: [0.03, 0.02], rot: V, pos: [0, R2(RY - 0.035), 0], at: [0, 120, 240].map((d) => [R2(RCX + 2.0 + 0.13 * Math.cos((d * Math.PI) / 180)), 0, R2(0.13 * Math.sin((d * Math.PI) / 180))]), mat: "steel" });
LAY("dFork", [2.4, 0.2, RCX + 1.6, RY]);
const FKB = R2(RCX + 0.4);
BOX("dFkB", "dFork", FKB, FKB + 0.4, RY - 0.06, RY - 0.01, -0.5, 0.5, "dark");
P({ id: "dFkT", layer: "dFork", shape: "box", size: [1.8, 0.03, 0.16], pos: [R2(FKB + 1.3), R2(RY - 0.025), 0], at: [[0, 0, -0.36], [0, 0, 0.36]], mat: "steel2" });
P({ id: "dFkPad", layer: "dFork", shape: "box", size: [0.12, 0.015, 0.16], pos: [0, R2(RY - 0.005), 0], at: [[R2(FKB + 0.6), 0, -0.36], [R2(FKB + 0.6), 0, 0.36], [R2(FKB + 2.1), 0, -0.36], [R2(FKB + 2.1), 0, 0.36]], mat: "rubber" });
P({ id: "dFkHole", layer: "dFork", shape: "cyl", size: [0.025, 0.005], rot: V, pos: [0, R2(RY + 0.001), 0], at: [-0.36, 0.36].flatMap((z) => [0.9, 1.4, 1.9].map((x) => [R2(FKB + x), 0, z])), mat: "darker" });
const D_EXT = R2(LPX - 0.3 + 0.9 - (FKB + 2.2)), D_EXT2 = R2(D_EXT * 0.55), D_LIFT = 0.05;
// 晶圓盒（門朝 −x，放在定位板的三顆銷上）
LAY("dB", [3.8, 3.2, LPX, DFY + 1.6]); LAY("dS", [4.4, 3.6, LPX, DFY + 1.9]); LAY("dT", [2, 0.5, LPX, DFY + 3.95]); LAY("dD", [0.4, 3.2, LPX - 1.9, DFY + 1.9]); LAY("dK", [3.2, 0.1, LPX, DFY + WV(PICK)]);
foup("d", LPX, DFY, 0, "-x", { b: "dB", s: "dS", t: "dT", d: "dD", k: "dK" }, { pick: true });
const D_DOCK = 0.3, D_DOOR_X = 0.36, D_DOOR_Y = 3.5;
// 天花板樑＋吊架＋軌道（槽）
const RAILY = 16.0, CEILY = 17.4, RX0 = LPX - 9, RX1 = LPX + 13;
LAY("dCeil", [24, 2, (RX0 + RX1) / 2, 16.6]);
BOX("dCeilB", "dCeil", RX0 - 1, RX1 + 1, CEILY, CEILY + 0.5, -0.8, 0.8, "band"); BOX("dCeilP", "dCeil", RX0 - 1, RX1 + 1, CEILY + 0.5, CEILY + 0.6, -3, 3, "panel2");
P({ id: "dHang", layer: "dCeil", shape: "box", size: [0.14, R2(CEILY - RAILY - 0.2), 0.14], pos: [0, R2((CEILY + RAILY + 0.2) / 2), 0], at: Array.from({ length: 7 }, (_, i) => [R2(RX0 + 0.8 + i * 3.4), 0, 0]), mat: "steel" });
P({ id: "dHangC", layer: "dCeil", shape: "box", size: [0.5, 0.08, 1.2], pos: [0, R2(RAILY + 0.24), 0], at: Array.from({ length: 7 }, (_, i) => [R2(RX0 + 0.8 + i * 3.4), 0, 0]), mat: "steel2" });
BOX("dRailT", "dCeil", RX0, RX1, RAILY, RAILY + 0.2, -0.55, 0.55, "steel2");
for (const s of [-1, 1]) BOX(`dRailS${s > 0 ? "R" : "L"}`, "dCeil", RX0, RX1, RAILY - 0.6, RAILY, s * 0.5 - 0.05, s * 0.5 + 0.05, "steel2");
for (const s of [-1, 1]) BOX(`dRailF${s > 0 ? "R" : "L"}`, "dCeil", RX0, RX1, RAILY - 0.66, RAILY - 0.6, s * 0.38 - 0.12, s * 0.38 + 0.12, "steel");
BOX("dFeed", "dCeil", RX0, RX1, RAILY - 0.5, RAILY - 0.4, -1.5, -1.4, "lampY");
P({ id: "dFeedC", layer: "dCeil", shape: "box", size: [0.08, 0.08, 0.95], pos: [0, R2(RAILY + 0.05), -1.0], at: Array.from({ length: 7 }, (_, i) => [R2(RX0 + 0.8 + i * 3.4), 0, 0]), mat: "steel" });
P({ id: "dFeedV", layer: "dCeil", shape: "box", size: [0.08, 0.55, 0.08], pos: [0, R2(RAILY - 0.17), -1.46], at: Array.from({ length: 7 }, (_, i) => [R2(RX0 + 0.8 + i * 3.4), 0, 0]), mat: "steel" });
// 天車車體：外殼（接縫、銘牌、燈）＋頸部＋輪組（在軌道槽裡）
const VB = R2(DFY + 4.08 + 0.22 + 4.1), VT = R2(VB + 1.5), D_DROP = R2(VB - (DFY + 4.3)), NBELT = 5;
LAY("dVeh", [3.6, 2.6, LPX, VB + 1.2]);
BOX("dVb", "dVeh", LPX - 1.7, LPX + 1.7, VB, VT, -1.25, 1.25, "panel");
BOX("dVbT", "dVeh", LPX - 1.72, LPX + 1.72, VT - 0.08, VT, -1.27, 1.27, "band");
P({ id: "dVbS", layer: "dVeh", shape: "box", size: [0.03, 1.42, 0.03], pos: [0, R2(VB + 0.71), 1.26], at: [[R2(LPX - 0.6), 0, 0], [R2(LPX + 0.6), 0, 0]], mat: "seam" });
BOX("dVbTag", "dVeh", LPX - 0.5, LPX + 0.5, VB + 0.9, VB + 1.3, 1.25, 1.27, "white"); BOX("dVbTagB", "dVeh", LPX - 0.4, LPX + 0.1, VB + 1.02, VB + 1.18, 1.27, 1.28, "darker");
P({ id: "dVbLamp", layer: "dVeh", shape: "box", size: [0.3, 0.12, 0.04], pos: [0, R2(VB + 1.25), 1.27], at: [[R2(LPX - 1.3), 0, 0], [R2(LPX + 1.3), 0, 0]], mat: "lampY" });
BOX("dVbBot", "dVeh", LPX - 1.4, LPX + 1.4, VB - 0.06, VB, -1.0, 1.0, "darker");
// r1（機構細節 #3）：前後防掉落擋板（鉸鏈）、側面散熱百葉、車體下緣感測器窗、集電靴
for (const s of [-1, 1]) { BOX(`dVFlap${s > 0 ? "R" : "L"}`, "dVeh", LPX + s * 1.7 - 0.04, LPX + s * 1.7 + 0.04, VB - 0.9, VB, -1.1, 1.1, "steel2");
  P({ id: `dVHinge${s > 0 ? "R" : "L"}`, layer: "dVeh", shape: "cyl", size: [0.06, 2.2], pos: [R2(LPX + s * 1.7), R2(VB - 0.02), 0], mat: "dark" }); }
P({ id: "dVLouv", layer: "dVeh", shape: "box", size: [0.8, 0.04, 0.02], pos: [R2(LPX + 0.9), 0, 1.27], at: [0, 1, 2, 3].map((i) => [0, R2(VB + 0.3 + i * 0.12), 0]), mat: "dark" });
BOX("dVSens", "dVeh", LPX - 0.3, LPX + 0.3, VB - 0.08, VB - 0.06, 0.6, 0.9, "winC" in palette ? "win" : "dark");
BOX("dVShoe", "dVeh", LPX - 0.2, LPX + 0.2, VT - 0.1, RAILY - 0.5, -1.4, -1.25, "dark");
BOX("dVNeck", "dVeh", LPX - 0.8, LPX + 0.8, VT, RAILY - 0.3, -0.25, 0.25, "dark");
P({ id: "dVWheel", layer: "dVeh", shape: "cyl", size: [0.26, 0.16], pos: [0, R2(RAILY - 0.35), 0], at: [[LPX - 0.55, 0, -0.32], [LPX + 0.55, 0, -0.32], [LPX - 0.55, 0, 0.32], [LPX + 0.55, 0, 0.32]].map((a) => a.map(R2)), mat: "rubber" });
P({ id: "dVAxle", layer: "dVeh", shape: "cyl", size: [0.05, 0.8], pos: [0, R2(RAILY - 0.35), 0], at: [[R2(LPX - 0.55), 0, 0], [R2(LPX + 0.55), 0, 0]], mat: "steel" });
// 夾爪：上板＋左右兩爪（勾在法蘭下）；捲揚皮帶 ×4（分 NBELT 段，放下時一段段伸出車體）
LAY("dGrip", [2.2, 0.4, LPX, DFY + 4.4]);
BOX("dGpP", "dGrip", LPX - 1.0, LPX + 1.0, DFY + 4.18, DFY + 4.36, -1.0, 1.0, "dark"); BOX("dGpC", "dGrip", LPX - 0.4, LPX + 0.4, DFY + 4.36, DFY + 4.42, -0.4, 0.4, "steel");
for (const s of [-1, 1]) { const L = `dJaw${s > 0 ? "R" : "L"}`; LAY(L, [2, 0.6, LPX, DFY + 4.0]);
  BOX(`${L}V`, L, LPX - 0.55, LPX + 0.55, DFY + 3.86, DFY + 4.18, s * 1.0 - 0.06, s * 1.0 + 0.06, "steel2");
  BOX(`${L}H`, L, LPX - 0.55, LPX + 0.55, DFY + 3.86, DFY + 3.94, Math.min(s * 1.0, s * 0.74), Math.max(s * 1.0, s * 0.74), "steel2"); }
const BELTXZ = [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]];
for (let k = 1; k <= NBELT; k++) { const L = `dBelt${k}`, y1 = R2(VB - ((k - 1) * D_DROP) / NBELT), y0 = R2(VB - (k * D_DROP) / NBELT); LAY(L, [1.6, 1, LPX, (y0 + y1) / 2]);
  P({ id: `${L}S`, layer: L, shape: "box", size: [0.16, R2(y1 - y0 + 0.04), 0.03], pos: [0, R2((y0 + y1) / 2), 0], at: BELTXZ.map(([x, z]) => [R2(LPX + x), 0, z]), mat: "rubber" }); }

// ═════ 站 E：氮氣吹淨（x 120）：等待架（立柱＋層板＋定位板）上的晶圓盒；盒底進氣嘴（後）、排氣嘴（前）；地上氣體面板（閥件手輪、流量計、壓力錶） ═════
const EX = 120, ESY = 4.4;
LAY("eRack", [9.6, 5, EX + 1.4, 2.4]);
P({ id: "ePost", layer: "eRack", shape: "box", size: [0.2, R2(ESY), 0.2], pos: [0, R2(ESY / 2), 0], at: [[-2.5, -2.3], [2.5, -2.3], [-2.5, 2.3], [2.5, 2.3]].map(([x, z]) => [R2(EX + x), 0, z]), mat: "steel" });
P({ id: "ePostF", layer: "eRack", shape: "box", size: [0.4, 0.06, 0.4], pos: [0, 0.03, 0], at: [[-2.5, -2.3], [2.5, -2.3], [-2.5, 2.3], [2.5, 2.3]].map(([x, z]) => [R2(EX + x), 0, z]), mat: "darker" });
BOX("eShelf", "eRack", EX - 2.7, EX + 2.7, ESY - 0.2, ESY, -2.5, 2.5, "steel2"); BOX("eShelfE", "eRack", EX - 2.72, EX + 2.72, ESY - 0.28, ESY - 0.2, 2.42, 2.52, "band");
BOX("eBrace", "eRack", EX - 2.5, EX + 2.5, 0.9, 1.0, 2.25, 2.35, "steel"); BOX("eBrace2", "eRack", EX - 2.5, EX + 2.5, 0.9, 1.0, -2.35, -2.25, "steel");
const E_TH = 145, EW = fMap(E_TH, EX, 0), EWY = (pts) => pts.map(([u, v, w]) => { const [x, z] = EW(u, w); return [x, R2(v), z]; });
P({ id: "ePurge", layer: "eRack", shape: "box", size: [3.8, 0.22, 3.8], pos: [EX, R2(ESY + 0.11), 0], rot: [0, E_TH, 0], mat: "steel" });
const EPT = ESY + 0.22, EFY = R2(EPT + 0.2);
const EPIN = KANG.map((a) => EW(KR * Math.cos((a * Math.PI) / 180), KR * Math.sin((a * Math.PI) / 180)));
P({ id: "ePinP", layer: "eRack", shape: "cyl", size: [0.09, 0.16], rot: V, pos: [0, R2(EPT + 0.08), 0], at: EPIN.map(([x, z]) => [x, 0, z]), mat: "steel2" });
P({ id: "ePinH", layer: "eRack", shape: "sphere", size: [0.11], pos: [0, R2(EPT + 0.17), 0], at: EPIN.map(([x, z]) => [x, 0, z]), mat: "steel" });
const EIN = [EW(-0.9, -1.25), EW(0.9, -1.25)], EMID = EW(0, -1.25), EOUT = EW(0, 1.3);
P({ id: "eNozIn", layer: "eRack", shape: "cyl", size: [0.14, 0.26], rot: V, pos: [0, R2(EPT + 0.13), 0], at: EIN.map(([x, z]) => [R2(x), 0, z]), mat: "lampG" });
VC("eNozOut", "eRack", 0.14, EPT, EPT + 0.26, "lampR", { x: EOUT[0], z: EOUT[1] });
// 管線：進氣嘴往下穿過層板 → 匯流 → 往右走到氣體面板；排氣嘴往下 → 地上排氣管
EIN.forEach(([x, z], i) => VC(`eInV${i}`, "eRack", 0.07, ESY - 1.0, ESY - 0.2, "steel2", { x, z }));
P({ id: "eInH", layer: "eRack", shape: "cyl", size: [0.07, 1.8], rot: [0, R2(E_TH + 90), 0], pos: [EMID[0], R2(ESY - 1.0), EMID[1]], mat: "steel2" });
SPH("eInE", "eRack", 0.1, EIN[0][0], ESY - 1.0, EIN[0][1], "steel2"); SPH("eInE2", "eRack", 0.1, EIN[1][0], ESY - 1.0, EIN[1][1], "steel2");
const GPX = EX + 4.4;
P({ id: "eInRun", layer: "eRack", shape: "cyl", size: [0.07, R2(GPX - EMID[0])], rot: [0, 90, 0], pos: [R2((GPX + EMID[0]) / 2), R2(ESY - 1.0), EMID[1]], mat: "steel2" });
SPH("eInE3", "eRack", 0.1, GPX, ESY - 1.0, EMID[1], "steel2"); SPH("eInE4", "eRack", 0.1, GPX, ESY - 1.0, -1.25, "steel2");
P({ id: "eInRunZ", layer: "eRack", shape: "cyl", size: [0.07, R2(Math.abs(EMID[1] + 1.25))], pos: [GPX, R2(ESY - 1.0), R2((EMID[1] - 1.25) / 2)], mat: "steel2" }); VC("eInDrop", "eRack", 0.07, 2.9, ESY - 1.0, "steel2", { x: GPX, z: -1.25 });
P({ id: "eClamp", layer: "eRack", shape: "box", size: [0.25, 0.08, 0.25], pos: [0, R2(ESY - 1.0), EMID[1]], at: [[R2(EX + 2.0), 0, 0], [R2(EX + 3.2), 0, 0]], mat: "steel" });
VC("eOutV", "eRack", 0.08, 0.5, ESY - 0.2, "steel2", { x: EOUT[0], z: EOUT[1] });
BOX("eDuct", "eRack", EOUT[0] - 0.45, EX + 3.4, 0, 0.5, EOUT[1] - 0.3, EOUT[1] + 0.3, "dark"); BOX("eDuctTag", "eRack", EX + 1.2, EX + 2.0, 0.15, 0.35, EOUT[1] + 0.3, EOUT[1] + 0.32, "lampR");
// 氣體面板（落地）：箱體＋流量計（玻璃管＋浮子）＋閥件手輪＋壓力錶
BOX("eGp", "eRack", GPX - 0.8, GPX + 0.8, 0, 2.9, -1.8, -0.7, "panel"); BOX("eGpT", "eRack", GPX - 0.82, GPX + 0.82, 2.9, 2.96, -1.82, -0.68, "band");
P({ id: "eGpS", layer: "eRack", shape: "box", size: [1.5, 0.03, 0.02], pos: [GPX, 0, -0.69], at: [[0, 0.8, 0], [0, 2.0, 0]], mat: "seam" });
P({ id: "eFm", layer: "eRack", shape: "cyl", size: [0.12, 0.9], rot: V, pos: [R2(GPX - 0.35), 1.45, -0.6], mat: "glass" }); SPH("eFmF", "eRack", 0.08, GPX - 0.35, 1.62, -0.6, "lampR");
BOX("eFmT", "eRack", GPX - 0.5, GPX - 0.2, 1.9, 2.0, -0.75, -0.45, "steel"); BOX("eFmB", "eRack", GPX - 0.5, GPX - 0.2, 0.9, 1.0, -0.75, -0.45, "steel");
P({ id: "eGauge", layer: "eRack", shape: "cyl", size: [0.24, 0.08], pos: [R2(GPX + 0.35), 2.35, -0.64], mat: "white" }); RING("eGaugeR", "eRack", 0.27, 0.24, 2.3, 2.4, "steel", GPX + 0.35, -0.6);
P({ id: "eGaugeN", layer: "eRack", shape: "box", size: [0.03, 0.18, 0.01], pos: [R2(GPX + 0.39), 2.38, -0.59], rot: [0, 0, -30], mat: "lampR" });
valve("eV0", "eRack", GPX + 0.35, 1.3, -0.5);
panelUI("eUi", "eRack", EX - 1.2, 0.92, 2.36, 0.7);   // r1：掛在前面橫撐上
LAY("eFoup", [4.4, 4.2, EX, EFY + 2.0]);
foup("e", EX, EFY, 0, E_TH, { b: "eFoup", s: "eFoup", t: "eFoup", d: "eFoup" });
// 氮氣：氣體面板 → 管線 → 後方進氣嘴 → 沿盒子後面空隙往上 → 頂上往前 → 沿門後空隙往下 → 前方排氣嘴（不穿過晶圓）
const eY = (v) => R2(EFY + v);
const EL = EW(1, 0), ELD = [R2(EL[0] - EX), 0, R2(EL[1])];   // 盒子左右方向（並排 lanes 用）
actions.eN2Pipe = { free: true, track: false, type: "flow", _說明: "氮氣在管線裡：從氣體面板經閥件流到後方進氣嘴", path: [[GPX, 2.95, -1.25], [GPX, ESY - 1.0, -1.25], [GPX, ESY - 1.0, EMID[1]], [EMID[0], ESY - 1.0, EMID[1]], [EIN[0][0], ESY - 1.0, EIN[0][1]], [EIN[0][0], EPT + 0.26, EIN[0][1]]].map((a) => a.map(R2)), n: 6, size: 0.12, shape: "arrow", rate: 0.6, color: "n2C", layer: "eRack" };
actions.eN2 = { free: true, track: false, type: "flow", _說明: "氮氣（藍）從盒底後方進氣嘴進去，沿後壁往上、頂上往前、沿門後往下，從前方排氣嘴出去（不穿過晶圓）", path: EWY([[0, eY(0.3), -1.25], [0, eY(1.0), -1.66], [0, eY(3.3), -1.66], [0, eY(3.35), 0], [0, eY(3.3), 1.64], [0, eY(1.0), 1.64], [0, eY(0.3), 1.3]]), n: 10, size: 0.1, shape: "dot", rate: 0.35, color: "n2C", layer: "eRack", lanes: 3, laneGap: 0.7, laneDir: ELD, jitter: 0.04 };
// r1（物理必改 3）：濕氣／氧氣一顆一條 flow（n＝1），每顆只走一趟：從盒內某處出發 → 被推到門後空隙 → 往下 → 排氣嘴 → 排氣管裡；
//   run 的 until 排在那一顆剛走到路徑終點（排氣管下端、已淡出）的那一幀，所以不會在盒子中間憑空消失；出發時間錯開，盒內的點一顆顆變少
const MOIST = (u, v, w) => EWY([[u, eY(v), w], [u * 0.6, eY(3.3), w < 0 ? -0.6 : 0.6], [u * 0.3, eY(3.0), 1.66], [0, eY(1.0), 1.66], [0, eY(0.3), 1.3], [0, 0.7, 1.3]]);
export const E_MOIST = [[-0.9, 3.15, -1.62, "h2oC"], [0.8, 3.2, -1.62, "o2C"], [0.2, 2.2, -1.64, "h2oC"], [-0.5, 1.4, -1.64, "h2oC"], [1.0, 3.25, 0.3, "o2C"], [-1.1, 3.3, 0.6, "h2oC"], [0.5, 1.0, -1.63, "o2C"], [-0.2, 3.3, -0.9, "h2oC"], [0.9, 1.8, -1.63, "h2oC"], [-0.8, 2.5, -1.63, "o2C"]];
const E_U0 = [0.1, 0.34, 0.18, 0.4, 0.14, 0.28, 0.24, 0.12, 0.37, 0.21], E_RATE = 0.3;   // 每顆開始時已走到路徑的哪裡（全部同時開始，越靠近出口的越早出去）
E_MOIST.forEach(([u, v, w, c], i) => { actions[`eM${i}`] = { free: true, track: false, type: "flow", _說明: `${c === "o2C" ? "氧氣（紅）" : "濕氣（藍白）"}第 ${i + 1} 顆：被氮氣推到排氣嘴、從排氣管出去`, path: MOIST(u, v, w), n: 1, size: 0.1, shape: "dot", rate: E_RATE, phase: -E_U0[i], color: c, layer: "eRack" }; });


// ═════ 站 F：出貨盒（x 150）：貨車車斗（車頭、底盤、兩組輪子、葉片彈簧）＋紙箱（前面剖開示意）＋泡棉角＋真空包裝袋＋出貨盒（厚殼＋加強肋＋前門＋門閂＋內部卡榫） ═════
const FX = 150, TBY = 2.2;
LAY("fTruck", [12, 3.4, FX - 0.8, 1.6]);
BOX("fRoad", "fTruck", FX - 8, FX + 6, 0, 0.03, -2.8, 2.8, "darker");
P({ id: "fRoadM", layer: "fTruck", shape: "box", size: [1.2, 0.01, 0.12], pos: [0, 0.035, 2.4], at: [0, 1, 2, 3, 4, 5].map((i) => [R2(FX - 7.2 + i * 2.3), 0, 0]), mat: "white" });
const AXL = [FX - 2.6, FX + 2.4];
P({ id: "fTire", layer: "fTruck", shape: "cyl", size: [0.85, 0.5], pos: [0, 0.85, 0], at: AXL.flatMap((x) => [[R2(x), 0, -1.9], [R2(x), 0, 1.9]]), mat: "tire" });
P({ id: "fHub", layer: "fTruck", shape: "cyl", size: [0.38, 0.54], pos: [0, 0.85, 0], at: AXL.flatMap((x) => [[R2(x), 0, -1.9], [R2(x), 0, 1.9]]), mat: "steel2" });
P({ id: "fHubB", layer: "fTruck", shape: "cyl", size: [0.05, 0.56], pos: [0, 0, 0], at: AXL.flatMap((x) => [0, 72, 144, 216, 288].map((d) => [R2(x + 0.24 * Math.cos((d * Math.PI) / 180)), R2(0.85 + 0.24 * Math.sin((d * Math.PI) / 180)), 1.9])), mat: "steel" });
P({ id: "fAxle", layer: "fTruck", shape: "cyl", size: [0.12, 3.6], pos: [0, 0.85, 0], at: AXL.map((x) => [R2(x), 0, 0]), mat: "steel" });
P({ id: "fLeaf", layer: "fTruck", shape: "box", size: [1.6, 0.08, 0.3], pos: [0, 0, 0], at: AXL.flatMap((x) => [0, 1, 2].flatMap((k) => [[R2(x), R2(1.0 + k * 0.1), -1.1], [R2(x), R2(1.0 + k * 0.1), 1.1]])), mat: "steel" });
BOX("fChassis", "fTruck", FX - 6.8, FX + 4.4, 1.3, 1.6, -1.2, -0.9, "darker"); BOX("fChassis2", "fTruck", FX - 6.8, FX + 4.4, 1.3, 1.6, 0.9, 1.2, "darker");
// 車頭（落在底盤上）
BOX("fCab", "fTruck", FX - 6.8, FX - 4.8, 1.6, 4.6, -1.6, 1.6, "cab"); BOX("fCabW", "fTruck", FX - 6.78, FX - 5.3, 3.3, 4.3, 1.6, 1.62, "win");
BOX("fCabB", "fTruck", FX - 6.85, FX - 4.75, 1.4, 1.7, -1.65, 1.65, "darker"); P({ id: "fCabTire", layer: "fTruck", shape: "cyl", size: [0.85, 0.5], pos: [R2(FX - 5.8), 0.85, 0], at: [[0, 0, -1.9], [0, 0, 1.9]], mat: "tire" });
P({ id: "fCabHub", layer: "fTruck", shape: "cyl", size: [0.38, 0.54], pos: [R2(FX - 5.8), 0.85, 0], at: [[0, 0, -1.9], [0, 0, 1.9]], mat: "steel2" });
BOX("fCabL", "fTruck", FX - 6.86, FX - 6.8, 2.0, 2.3, 0.9, 1.4, "lampY"); BOX("fCabL2", "fTruck", FX - 6.86, FX - 6.8, 2.0, 2.3, -1.4, -0.9, "lampY");
// r1（機構細節 #8）：車門分線、門把、後照鏡、水箱護罩格柵、保險桿、車頭與車斗之間的連接架
P({ id: "fCabSeam", layer: "fTruck", shape: "box", size: [0.03, 2.6, 0.02], pos: [0, 2.9, 1.61], at: [[R2(FX - 6.3), 0, 0], [R2(FX - 4.9), 0, 0]], mat: "band" });
BOX("fCabSeamH", "fTruck", FX - 6.3, FX - 4.9, 1.95, 1.98, 1.61, 1.63, "band"); BOX("fCabHdl", "fTruck", FX - 5.3, FX - 5.0, 2.95, 3.05, 1.62, 1.68, "steel2");
BOX("fMirArm", "fTruck", FX - 6.4, FX - 6.3, 3.7, 3.78, 1.6, 2.0, "dark"); BOX("fMir", "fTruck", FX - 6.45, FX - 6.25, 3.3, 3.9, 2.0, 2.1, "dark");
BOX("fGrille", "fTruck", FX - 6.83, FX - 6.8, 2.4, 3.1, -1.1, 1.1, "darker"); P({ id: "fGrilleS", layer: "fTruck", shape: "box", size: [0.02, 0.05, 2.1], pos: [R2(FX - 6.84), 0, 0], at: [0, 1, 2, 3, 4].map((i) => [0, R2(2.5 + i * 0.13), 0]), mat: "steel2" });
BOX("fBumper", "fTruck", FX - 7.0, FX - 6.8, 1.55, 1.9, -1.7, 1.7, "dark");
BOX("fCabLink", "fTruck", FX - 4.8, FX - 4.6, 1.6, 2.4, -0.8, 0.8, "darker");
// 橫樑：接住車斗底板與底盤
P({ id: "fCross", layer: "fTruck", shape: "box", size: [0.2, 0.35, 2.6], pos: [0, 1.775, 0], at: [-4, -1.5, 1.5, 4].map((x) => [R2(FX + x), 0, 0]), mat: "darker" });
// 車斗（會顛簸）：底板＋木紋條＋側欄＋後欄＋擋泥板
LAY("fBed", [9, 1, FX, TBY + 0.4]);
BOX("fBedP", "fBed", FX - 4.6, FX + 4.6, TBY - 0.25, TBY, -2.2, 2.2, "steel2");
P({ id: "fBedR", layer: "fBed", shape: "box", size: [9.2, 0.02, 0.08], pos: [FX, R2(TBY + 0.01), 0], at: Array.from({ length: 8 }, (_, i) => [0, 0, R2(-1.9 + i * 0.54)]), mat: "seam" });
BOX("fBedSide", "fBed", FX - 4.6, FX + 4.6, TBY, TBY + 0.5, -2.2, -2.1, "steel"); BOX("fBedSide2", "fBed", FX - 4.6, FX + 4.6, TBY, TBY + 0.35, 2.1, 2.2, "steel");
BOX("fBedTail", "fBed", FX + 4.5, FX + 4.6, TBY, TBY + 0.5, -2.2, 2.2, "steel");
P({ id: "fBedPost", layer: "fBed", shape: "box", size: [0.12, 0.5, 0.12], pos: [0, R2(TBY + 0.25), 2.15], at: [-4.5, -1.5, 1.5, 4.5].map((x) => [R2(FX + x), 0, 0]), mat: "steel" });
P({ id: "fFender", layer: "fBed", shape: "box", size: [2.0, 0.1, 0.6], pos: [0, R2(TBY - 0.3), 0], at: AXL.flatMap((x) => [[R2(x), 0, -1.95], [R2(x), 0, 1.95]]), mat: "darker" });
// 紙箱（前面剖開示意）：底、後、左、右四面＋上翻蓋＋封箱膠帶
const CB0 = FX - 2.6, CB1 = FX + 2.6, CY0 = TBY, CY1 = TBY + 4.6, CZ0 = -2.0, CZ1 = 2.0;
BOX("fBoxB", "fBed", CB0, CB1, CY0, CY0 + 0.1, CZ0, CZ1, "kraft"); BOX("fBoxK", "fBed", CB0, CB1, CY0, CY1, CZ0, CZ0 + 0.1, "kraft");
BOX("fBoxL", "fBed", CB0, CB0 + 0.1, CY0, CY1, CZ0, CZ1, "kraft"); BOX("fBoxR", "fBed", CB1 - 0.1, CB1, CY0, CY1, CZ0, CZ1, "kraft");
P({ id: "fFlapL", layer: "fBed", shape: "box", size: [0.06, 1.3, 4.0], pos: [R2(CB0 - 0.2), R2(CY1 + 0.61), 0], rot: [0, 0, 20], mat: "kraft" });
P({ id: "fFlapR", layer: "fBed", shape: "box", size: [0.06, 1.3, 4.0], pos: [R2(CB1 + 0.2), R2(CY1 + 0.61), 0], rot: [0, 0, -20], mat: "kraft" });
BOX("fBoxTape", "fBed", CB0 - 0.01, CB0 + 0.11, CY0 + 1.6, CY0 + 2.0, CZ0, CZ1, "panel2"); BOX("fBoxPrint", "fBed", CB1, CB1 + 0.01, CY0 + 2.6, CY0 + 3.6, -1.0, 0.6, "darker");
BOX("fBoxCutL", "fBed", CB0, CB0 + 0.1, CY0, CY1, CZ1 - 0.02, CZ1, "darker");
// 泡棉角（四個底角＋四個上角）＋底層泡棉
const FOAM = [[CB0 + 0.1, CZ0 + 0.1], [CB1 - 0.1, CZ0 + 0.1], [CB0 + 0.1, CZ1 - 0.1], [CB1 - 0.1, CZ1 - 0.1]];
P({ id: "fFoamLo", layer: "fBed", shape: "box", size: [0.9, 0.9, 0.9], pos: [0, R2(CY0 + 0.55), 0], at: FOAM.map(([x, z]) => [R2(x + (x < FX ? 0.45 : -0.45)), 0, R2(z + (z < 0 ? 0.45 : -0.45))]), mat: "foam" });
P({ id: "fFoamHi", layer: "fBed", shape: "box", size: [0.9, 0.9, 0.9], pos: [0, R2(CY0 + 4.05), 0], at: FOAM.map(([x, z]) => [R2(x + (x < FX ? 0.45 : -0.45)), 0, R2(z + (z < 0 ? 0.45 : -0.45))]), mat: "foam" });
BOX("fFoamBed", "fBed", CB0 + 0.1, CB1 - 0.1, CY0 + 0.1, CY0 + 0.4, CZ0 + 0.1, CZ1 - 0.1, "foam");
// 出貨盒（裝在袋子裡，泡棉托著，位移比車斗小）
LAY("fFosb", [4.4, 4.0, FX, CY0 + 2.3]);
const FBY = CY0 + 0.4;
BOX("fBag", "fFosb", FX - 2.08, FX + 2.08, FBY, FBY + 3.86, -1.66, 1.66, "bag"); BOX("fBagSeal", "fFosb", FX - 2.1, FX + 2.1, FBY + 3.86, FBY + 3.96, -0.06, 0.06, "bag");
BOX("fFsB", "fFosb", FX - 1.98, FX + 1.98, FBY + 0.04, FBY + 0.3, -1.55, 1.55, "fosbS");
BOX("fFsShell", "fFosb", FX - 1.96, FX + 1.96, FBY + 0.3, FBY + 3.5, -1.55, 1.38, "fosb");
BOX("fFsTop", "fFosb", FX - 1.98, FX + 1.98, FBY + 3.5, FBY + 3.66, -1.57, 1.4, "fosbS");
P({ id: "fFsRib", layer: "fFosb", shape: "box", size: [0.1, 3.2, 0.06], pos: [0, R2(FBY + 1.9), 1.4], at: [-1.7, 1.7].map((x) => [R2(FX + x), 0, 0]), mat: "fosbS" });
P({ id: "fFsRibS", layer: "fFosb", shape: "box", size: [0.06, 3.2, 0.1], pos: [0, R2(FBY + 1.9), 0], at: [-1.1, -0.4, 0.4, 1.1].flatMap((z) => [[R2(FX - 1.99), 0, z], [R2(FX + 1.99), 0, z]]), mat: "fosbS" });
P({ id: "fFsRibT", layer: "fFosb", shape: "box", size: [3.8, 0.08, 0.1], pos: [FX, R2(FBY + 3.7), 0], at: [-1.0, 0, 1.0].map((z) => [0, 0, z]), mat: "fosbS" });
for (const s of [-1, 1]) BOX(`fFsHd${s > 0 ? "R" : "L"}`, "fFosb", FX + s * 0.9 - 0.4, FX + s * 0.9 + 0.4, FBY + 3.74, FBY + 3.84, -0.12, 0.12, "fosbS");
P({ id: "fFsHdP", layer: "fFosb", shape: "box", size: [0.1, 0.12, 0.1], pos: [0, R2(FBY + 3.7), 0], at: [-1.25, -0.55, 0.55, 1.25].map((x) => [R2(FX + x), 0, 0]), mat: "fosbS" });
// r1（機構必改 5）：門開透明窗（門框四邊＋窗），殼改半透明，看得到 25 片晶圓和兩側卡榫
BOX("fFsDoorT", "fFosb", FX - 1.9, FX + 1.9, FBY + 2.95, FBY + 3.45, 1.38, 1.52, "fosbS"); BOX("fFsDoorB", "fFosb", FX - 1.9, FX + 1.9, FBY + 0.35, FBY + 0.85, 1.38, 1.52, "fosbS");
BOX("fFsDoorL", "fFosb", FX - 1.9, FX - 1.4, FBY + 0.85, FBY + 2.95, 1.38, 1.52, "fosbS"); BOX("fFsDoorR", "fFosb", FX + 1.4, FX + 1.9, FBY + 0.85, FBY + 2.95, 1.38, 1.52, "fosbS");
BOX("fFsWin", "fFosb", FX - 1.4, FX + 1.4, FBY + 0.85, FBY + 2.95, 1.42, 1.46, "glass");
for (const s of [-1, 1]) BOX(`fFsSH${s > 0 ? "R" : "L"}`, "fFosb", FX + s * 2.0 - 0.06, FX + s * 2.0 + 0.06, FBY + 2.2, FBY + 2.5, -0.6, 0.6, "fosbS");
P({ id: "fFsFoot", layer: "fFosb", shape: "box", size: [0.4, 0.04, 0.4], pos: [0, R2(FBY + 0.02), 0], at: [[-1.6, -1.2], [1.6, -1.2], [-1.6, 1.2], [1.6, 1.2]].map(([x, z]) => [R2(FX + x), 0, z]), mat: "rubber" });
BOX("fFsFl", "fFosb", FX - 0.6, FX + 0.6, FBY + 3.66, FBY + 3.72, -0.6, 0.6, "fosbS"); P({ id: "fFsFlB", layer: "fFosb", shape: "cyl", size: [0.05, 0.03], rot: V, pos: [0, R2(FBY + 3.735), 0], at: [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].map(([x, z]) => [R2(FX + x), 0, z]), mat: "steel" });
P({ id: "fFsLatch", layer: "fFosb", shape: "box", size: [0.4, 0.28, 0.08], pos: [0, R2(FBY + 1.9), 1.55], at: [[R2(FX - 1.65), 0, 0], [R2(FX + 1.65), 0, 0]], mat: "dark" });
P({ id: "fFsLatchK", layer: "fFosb", shape: "cyl", size: [0.08, 0.04], pos: [0, R2(FBY + 1.9), 1.6], at: [[R2(FX - 1.65), 0, 0], [R2(FX + 1.65), 0, 0]], mat: "steel2" });
P({ id: "fFsWf", layer: "fFosb", shape: "cyl", size: [1.45, 0.03], rot: V, pos: [FX, 0, -0.1], at: Array.from({ length: 25 }, (_, i) => [0, R2(FBY + 0.55 + i * 0.105), 0]), mat: "wafer" });
P({ id: "fFsCush", layer: "fFosb", shape: "box", size: [0.3, 0.05, 1.2], pos: [0, 0, -0.1], at: Array.from({ length: 25 }, (_, i) => [[R2(FX - 1.62), R2(FBY + 0.54 + i * 0.105), 0], [R2(FX + 1.62), R2(FBY + 0.54 + i * 0.105), 0]]).flat(), mat: "comb" });
P({ id: "fFsCushB", layer: "fFosb", shape: "box", size: [0.1, 2.8, 1.3], pos: [0, R2(FBY + 1.9), -0.1], at: [[R2(FX - 1.8), 0, 0], [R2(FX + 1.8), 0, 0]], mat: "comb" });
BOX("fFsLbl", "fFosb", FX - 0.7, FX + 0.7, FBY + 3.0, FBY + 3.35, 1.52, 1.54, "white");
// r1（物理可改）：懸吊在車輪／車軸和底盤之間 → 底盤、車頭、橫樑、車斗一起顛（車輪、車軸、葉片彈簧不動）；泡棉被壓扁（振幅介於車斗與盒子之間）
const FOAMP = ["fFoamBed", "fFoamLo"], SPRUNG = parts.filter((q) => q.layer === "fTruck" && /^f(Cab|Chassis|Cross|Mir|Grille|Bumper|Bed)/.test(q.id) && !/Tire|Hub/.test(q.id)).map((q) => q.id);
actions.fBump = { type: "vibrate", _說明: "車斗顛簸（上下）：底盤、車頭、車斗、紙箱一起動", parts: [...idsOf("fBed").filter((q) => !FOAMP.includes(q)), ...SPRUNG], axis: [0, 1, 0], amp: 0.16, freq: 2.4 };
actions.fBumpFoam = { type: "vibrate", _說明: "底層泡棉被壓扁：位移介於車斗和盒子之間", parts: FOAMP, axis: [0, 1, 0], amp: 0.09, freq: 2.4 };
actions.fBumpBox = { type: "vibrate", _說明: "出貨盒被泡棉托住：跟著動但位移只有車斗的 1/5", parts: idsOf("fFosb"), axis: [0, 1, 0], amp: 0.032, freq: 2.4 };

// ═════ 站 G：雙層光罩盒（x 180）：外盒（底座＋殼＋門閂）→ 金屬內盒（底板＋定位銷＋上蓋）＋光罩（石英板＋圖案區）；右邊真空腔（觀察窗、艙門、真空泵） ═════
const GX = 178, GSY = 3.0;
LAY("gStand", [14, 3.2, GX + 4.2, 1.5]);
BOX("gTable", "gStand", GX - 2.4, GX + 2.4, GSY - 0.2, GSY, -2.0, 2.0, "steel2");
P({ id: "gLeg", layer: "gStand", shape: "box", size: [0.2, R2(GSY - 0.2), 0.2], pos: [0, R2((GSY - 0.2) / 2), 0], at: [[-2.2, -1.8], [2.2, -1.8], [-2.2, 1.8], [2.2, 1.8]].map(([x, z]) => [R2(GX + x), 0, z]), mat: "steel" });
BOX("gTableE", "gStand", GX - 2.42, GX + 2.42, GSY - 0.26, GSY - 0.2, 1.9, 2.02, "band");
// 外盒底座（留在台上）：底板＋兩側門閂＋定位腳
BOX("gObase", "gStand", GX - 1.9, GX + 1.9, GSY, GSY + 0.3, -1.6, 1.6, "pod");
P({ id: "gOlatch", layer: "gStand", shape: "box", size: [0.12, 0.5, 0.5], pos: [0, R2(GSY + 0.3), 0], at: [[R2(GX - 1.96), 0, 0], [R2(GX + 1.96), 0, 0]], mat: "dark" });
P({ id: "gOfoot", layer: "gStand", shape: "cyl", size: [0.12, 0.08], rot: V, pos: [0, R2(GSY + 0.34), 0], at: [[-1.5, -1.2], [1.5, -1.2], [-1.5, 1.2], [1.5, 1.2]].map(([x, z]) => [R2(GX + x), 0, z]), mat: "rubber" });
// 傳送軌道：從外盒底座穿過艙門進真空腔
const GCX = GX + 6.6, GRY = R2(GSY + 0.3);
BOX("gRail", "gStand", GX - 0.6, GCX + 1.0, GRY, GRY + 0.06, -0.35, -0.25, "steel2"); BOX("gRail2", "gStand", GX - 0.6, GCX + 1.0, GRY, GRY + 0.06, 0.25, 0.35, "steel2");
// r1（機構必改 4）：軌道跨空處加落地支腳；開盒升降機構（兩根立柱＋導軌條，滑座與橫臂在 gOshell 層，勾住外盒把手一起上去）
P({ id: "gRailLeg", layer: "gStand", shape: "box", size: [0.14, R2(GRY), 0.14], pos: [0, R2(GRY / 2), 0], at: [3.0, 4.0].flatMap((x) => [[R2(GX + x), 0, -0.3], [R2(GX + x), 0, 0.3]]), mat: "steel" });
P({ id: "gRailLegB", layer: "gStand", shape: "box", size: [0.4, 0.05, 0.9], pos: [0, 0.025, 0], at: [3.0, 4.0].map((x) => [R2(GX + x), 0, 0]), mat: "darker" });
P({ id: "gLiftPost", layer: "gStand", shape: "box", size: [0.22, 5.2, 0.22], pos: [0, R2(GSY + 2.6), -1.75], at: [[R2(GX - 2.2), 0, 0], [R2(GX + 2.2), 0, 0]], mat: "steel2" });
P({ id: "gLiftRail", layer: "gStand", shape: "box", size: [0.06, 4.9, 0.06], pos: [0, R2(GSY + 2.7), -1.61], at: [[R2(GX - 2.2), 0, 0], [R2(GX + 2.2), 0, 0]], mat: "steel" });
P({ id: "gLiftCap", layer: "gStand", shape: "box", size: [0.34, 0.12, 0.34], pos: [0, R2(GSY + 5.26), -1.75], at: [[R2(GX - 2.2), 0, 0], [R2(GX + 2.2), 0, 0]], mat: "dark" });
// 外盒殼（往上抬＝在機台外打開）：殼＋加強肋＋把手＋門閂扣
LAY("gOshell", [4, 2.4, GX, GSY + 1.6]);
BOX("gOs", "gOshell", GX - 1.9, GX + 1.9, GSY + 0.3, GSY + 2.4, -1.6, 1.6, "pod");
BOX("gOsT", "gOshell", GX - 1.95, GX + 1.95, GSY + 2.4, GSY + 2.55, -1.65, 1.65, "dark");
P({ id: "gOsRib", layer: "gOshell", shape: "box", size: [3.82, 0.08, 0.06], pos: [GX, 0, 1.62], at: [0.9, 1.5, 2.1].map((y) => [0, R2(GSY + y), 0]), mat: "dark" });
BOX("gOsHd", "gOshell", GX - 0.7, GX + 0.7, GSY + 2.55, GSY + 2.75, -0.15, 0.15, "dark"); P({ id: "gOsHdP", layer: "gOshell", shape: "box", size: [0.12, 0.2, 0.2], pos: [0, R2(GSY + 2.6), 0], at: [[R2(GX - 0.6), 0, 0], [R2(GX + 0.6), 0, 0]], mat: "dark" });
P({ id: "gOsClip", layer: "gOshell", shape: "box", size: [0.1, 0.3, 0.4], pos: [0, R2(GSY + 0.5), 0], at: [[R2(GX - 1.95), 0, 0], [R2(GX + 1.95), 0, 0]], mat: "steel2" });
BOX("gOsLbl", "gOshell", GX - 0.6, GX + 0.6, GSY + 1.0, GSY + 1.5, 1.6, 1.62, "white");
P({ id: "gLiftCar", layer: "gOshell", shape: "box", size: [0.36, 0.5, 0.3], pos: [0, R2(GSY + 2.85), -1.45], at: [[R2(GX - 2.2), 0, 0], [R2(GX + 2.2), 0, 0]], mat: "dark" });
BOX("gLiftBar", "gOshell", GX - 2.1, GX + 2.1, GSY + 2.8, GSY + 2.95, -1.5, -1.38, "steel");
P({ id: "gLiftArm", layer: "gOshell", shape: "box", size: [0.12, 0.1, 1.5], pos: [0, R2(GSY + 2.8), -0.65], at: [[R2(GX - 0.45), 0, 0], [R2(GX + 0.45), 0, 0]], mat: "steel" });
P({ id: "gLiftHook", layer: "gOshell", shape: "box", size: [0.12, 0.3, 0.08], pos: [0, R2(GSY + 2.65), 0.15], at: [[R2(GX - 0.45), 0, 0], [R2(GX + 0.45), 0, 0]], mat: "steel" });
// r1（機構細節 #10）：頂面濾網圓窗（環＋格柵）、四角定位凹槽、門閂扣加轉軸
RING("gOsFilt", "gOshell", 0.55, 0.45, GSY + 2.55, GSY + 2.6, "steel2", GX - 1.1, 0.8);
P({ id: "gOsFiltG", layer: "gOshell", shape: "box", size: [0.9, 0.02, 0.04], pos: [R2(GX - 1.1), R2(GSY + 2.565), 0.8], at: [-0.3, -0.15, 0, 0.15, 0.3].map((z) => [0, 0, z]), mat: "darker" });
P({ id: "gOsNotch", layer: "gOshell", shape: "box", size: [0.25, 0.04, 0.25], pos: [0, R2(GSY + 2.57), 0], at: [[-1.7, -1.4], [1.7, -1.4], [-1.7, 1.4], [1.7, 1.4]].map(([x, z]) => [R2(GX + x), 0, z]), mat: "darker" });
P({ id: "gOsPivot", layer: "gOshell", shape: "cyl", size: [0.05, 0.5], rot: [0, 0, 0], pos: [0, R2(GSY + 0.68), 0], at: [[R2(GX - 2.0), 0, 0], [R2(GX + 2.0), 0, 0]], mat: "steel" });
// 金屬內盒：小車（在軌道上）＋底板＋4 根定位銷＋光罩（石英板＋圖案區）＋上蓋（把手）
LAY("gIn", [3.2, 0.5, GX, GSY + 0.6]);
BOX("gCar", "gIn", GX - 0.9, GX + 0.9, GRY + 0.06, GRY + 0.2, -0.5, 0.5, "dark");
BOX("gIb", "gIn", GX - 1.4, GX + 1.4, GRY + 0.2, GRY + 0.38, -1.3, 1.3, "inpod");
P({ id: "gIpin", layer: "gIn", shape: "cyl", size: [0.06, 0.14], rot: V, pos: [0, R2(GRY + 0.45), 0], at: [[-1.05, -1.05], [1.05, -1.05], [-1.05, 1.05], [1.05, 1.05]].map(([x, z]) => [R2(GX + x), 0, z]), mat: "steel" });
const RTY = R2(GRY + 0.42);
BOX("gRet", "gIn", GX - 0.95, GX + 0.95, RTY, RTY + 0.14, -0.95, 0.95, "quartz");
// 圖案面朝下（EUV 光罩放進內盒時圖案朝下），隔著石英看得到
BOX("gRetP", "gIn", GX - 0.7, GX + 0.7, RTY - 0.012, RTY, -0.7, 0.7, "chrome");
BOX("gRetM", "gIn", GX - 0.9, GX - 0.78, RTY - 0.012, RTY, 0.6, 0.9, "gold");
LAY("gIc", [3, 0.6, GX, GRY + 0.7]);
BOX("gIcB", "gIc", GX - 1.4, GX + 1.4, GRY + 0.38, GRY + 0.88, -1.3, 1.3, "inpod");
BOX("gIcT", "gIc", GX - 1.42, GX + 1.42, GRY + 0.88, GRY + 0.94, -1.32, 1.32, "steel");
P({ id: "gIcTab", layer: "gIc", shape: "box", size: [0.3, 0.12, 0.4], pos: [0, R2(GRY + 0.7), 0], at: [[R2(GX - 1.5), 0, 0], [R2(GX + 1.5), 0, 0]], mat: "steel2" });
BOX("gIcWin", "gIc", GX - 0.45, GX + 0.45, GRY + 0.94, GRY + 0.96, -0.45, 0.45, "glass");
P({ id: "gIcSpr", layer: "gIc", shape: "cyl", size: [0.05, 0.12], rot: V, pos: [0, R2(GRY + 0.62), 0], at: [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]].map(([x, z]) => [R2(GX + x), 0, z]), mat: "gold" });
P({ id: "gIcScrew", layer: "gIc", shape: "cyl", size: [0.05, 0.03], rot: V, pos: [0, R2(GRY + 0.955), 0], at: [[-1.2, -1.1], [1.2, -1.1], [-1.2, 1.1], [1.2, 1.1]].map(([x, z]) => [R2(GX + x), 0, z]), mat: "steel2" });
const G_OUT = 1.9, G_IN = R2(GCX - GX), G_CUP = 1.0;
// 真空腔：四腳＋腔體（後、左右、頂、底不透明，正面觀察玻璃＋框）＋左側艙門（艙門蓋在上方滑軌裡）＋下方真空泵（散熱鰭片）＋壓力計
const VX0 = GCX - 2.0, VX1 = GCX + 2.0, VY0 = GSY - 0.2, VY1 = GSY + 2.4;
BOX("gVfl", "gStand", VX0, VX1, VY0, VY0 + 0.2, -2.0, 2.0, "steel"); BOX("gVback", "gStand", VX0, VX1, VY0, VY1, -2.0, -1.85, "steel2");
BOX("gVtop", "gStand", VX0, VX1, VY1, VY1 + 0.2, -2.0, 2.0, "steel"); BOX("gVright", "gStand", VX1 - 0.15, VX1, VY0, VY1, -2.0, 2.0, "steel2");
BOX("gVleftT", "gStand", VX0, VX0 + 0.15, GRY + 1.4, VY1, -2.0, 2.0, "steel2"); BOX("gVleftB", "gStand", VX0, VX0 + 0.15, VY0, GRY, -2.0, 2.0, "steel2");
for (const s of [-1, 1]) BOX(`gVleftS${s > 0 ? "R" : "L"}`, "gStand", VX0, VX0 + 0.15, GRY, GRY + 1.4, Math.min(s * 1.6, s * 2.0), Math.max(s * 1.6, s * 2.0), "steel2");
// r1（機構細節 #12）：正面改成鋼板＋圓形法蘭觀察窗（環＋12 顆螺栓）
const VWY = R2((VY0 + VY1) / 2 + 0.1);
BOX("gVfT", "gStand", VX0 + 0.15, VX1 - 0.15, VWY + 1.0, VY1, 1.88, 1.96, "steel2"); BOX("gVfB", "gStand", VX0 + 0.15, VX1 - 0.15, VY0 + 0.2, VWY - 1.0, 1.88, 1.96, "steel2");
BOX("gVfL", "gStand", VX0 + 0.15, GCX - 1.0, VWY - 1.0, VWY + 1.0, 1.88, 1.96, "steel2"); BOX("gVfR", "gStand", GCX + 1.0, VX1 - 0.15, VWY - 1.0, VWY + 1.0, 1.88, 1.96, "steel2");
P({ id: "gVglass", layer: "gStand", shape: "cyl", size: [1.18, 0.04], pos: [GCX, VWY, 1.92], mat: "glass" });
P({ id: "gVring", layer: "gStand", shape: "tube", size: [1.45, 1.15, 0.1], pos: [GCX, VWY, 2.0], mat: "steel" });
P({ id: "gVringB", layer: "gStand", shape: "cyl", size: [0.05, 0.05], pos: [0, 0, 2.07], at: Array.from({ length: 12 }, (_, i) => [R2(GCX + 1.3 * Math.cos((i * 30 * Math.PI) / 180)), R2(VWY + 1.3 * Math.sin((i * 30 * Math.PI) / 180)), 0]), mat: "steel2" });
P({ id: "gVleg", layer: "gStand", shape: "box", size: [0.2, R2(VY0), 0.2], pos: [0, R2(VY0 / 2), 0], at: [[VX0 + 0.2, -1.8], [VX1 - 0.2, -1.8], [VX0 + 0.2, 1.8], [VX1 - 0.2, 1.8]].map(([x, z]) => [R2(x), 0, z]), mat: "steel" });
BOX("gPump", "gStand", GCX - 0.7, GCX + 0.7, 0, 1.2, -1.2, 0.2, "darker"); P({ id: "gPumpFin", layer: "gStand", shape: "box", size: [0.04, 0.9, 1.3], pos: [0, 0.6, -0.5], at: [0, 1, 2, 3, 4, 5].map((i) => [R2(GCX - 0.6 + i * 0.24), 0, 0]), mat: "fin" });
VC("gPumpPipe", "gStand", 0.2, 1.2, VY0, "steel2", { x: GCX, z: -0.5 }); RING("gPumpFl", "gStand", 0.3, 0.2, VY0 - 0.12, VY0, "steel", GCX, -0.5);
BOX("gPumpTag", "gStand", GCX - 0.3, GCX + 0.3, 0.4, 0.7, 0.2, 0.22, "lampY");
BOX("gGV", "gStand", GCX - 0.32, GCX + 0.32, 1.7, 2.1, -0.8, -0.2, "dark"); VC("gGVs", "gStand", 0.04, 2.1, 2.4, "steel2", { x: GCX + 0.0, z: -0.5 }); RING("gGVh", "gStand", 0.22, 0.17, 2.4, 2.45, "lampR", GCX, -0.5);
P({ id: "gGauge", layer: "gStand", shape: "cyl", size: [0.26, 0.08], pos: [R2(VX1 - 0.6), R2(VY1 + 0.6), 0], mat: "white" }); VC("gGaugeS", "gStand", 0.05, VY1 + 0.2, VY1 + 0.34, "steel", { x: VX1 - 0.6 });
BOX("gGaugeH", "gStand", VX1 - 0.88, VX1 - 0.32, VY1 + 0.32, VY1 + 0.36, -0.06, 0.06, "steel");
P({ id: "gGaugeN", layer: "gStand", shape: "box", size: [0.03, 0.2, 0.01], pos: [R2(VX1 - 0.6), R2(VY1 + 0.7), 0.05], mat: "lampR" });
actions.gNeedle = { type: "rotate", _說明: "抽真空時壓力錶指針往低壓那邊轉（示意，不標數值）", parts: ["gGaugeN"], axis: [0, 0, 1], pivot: [R2(VX1 - 0.6), R2(VY1 + 0.6), 0.05], angle: -140 };
actions.gPumpOut = { free: true, track: false, drive: true, minVisible: 0, type: "flow", _說明: "抽真空：腔內空氣經抽氣管被抽進真空泵，越抽越少", path: [[GCX, GRY + 1.6, 0], [GCX, VY0 + 0.25, -0.5], [GCX, 1.3, -0.5], [GCX, 0.7, -0.5]].map((a) => a.map(R2)), n: 6, size: 0.1, shape: "dot", rate: 0.9, color: "h2oC", layer: "gStand", lanes: 3, laneGap: 0.6, laneDir: [1, 0, 0] };
BOX("gGateH", "gStand", VX0 - 0.35, VX0, GRY + 1.4, GRY + 3.2, -1.7, 1.7, "dark");
VC("gGateCyl", "gStand", 0.14, GRY + 3.2, GRY + 4.0, "steel2", { x: VX0 - 0.18 }); VC("gGateCylC", "gStand", 0.17, GRY + 3.9, GRY + 4.05, "dark", { x: VX0 - 0.18 });
LAY("gGate", [0.3, 1.6, VX0 - 0.18, GRY + 2.3]);
BOX("gGateP", "gGate", VX0 - 0.3, VX0 - 0.05, GRY + 0.08, GRY + 1.44, -1.62, 1.62, "steel");
P({ id: "gGateO", layer: "gGate", shape: "box", size: [0.05, 0.06, 3.0], pos: [R2(VX0 - 0.02), 0, 0], at: [[0, R2(GRY + 0.14), 0], [0, R2(GRY + 1.38), 0]], mat: "rubber" });
const G_GATE = 1.6;

// ═════ 站 H：盒子清洗機（x 210）：機箱（正面觀察窗）、清洗腔、上方噴嘴陣列、旋轉架（晶圓盒殼開口朝下倒扣在中間）、門掛在左壁、熱風口、控制箱、給水管＋閥、排水口＋排水管、儲水槽觀察管 ═════
// r1（機構必改 3、物理必改 6）：腔體加深到 z ±3.1；盒殼改放在立軸正中（最大迴轉半徑 2.58，後壁內面 −2.9、玻璃 3.0），門改掛左壁不跟著轉
const HX = 210, HY0 = 0.9, HY1 = 8.0, HX0 = HX - 3.6, HX1 = HX + 3.6, HZ = 3.1;
LAY("hCab", [9.6, 9, HX + 0.8, 4.4]);
BOX("hBaseB", "hCab", HX0 - 0.1, HX1 + 2.3, 0, HY0, -HZ, HZ, "band"); BOX("hBaseK", "hCab", HX0 - 0.15, HX1 + 2.35, 0, 0.12, -HZ - 0.05, HZ + 0.05, "darker");
BOX("hBack", "hCab", HX0, HX1, HY0, HY1, -HZ, -HZ + 0.2, "panel"); BOX("hLeft", "hCab", HX0, HX0 + 0.2, HY0, HY1, -HZ, HZ, "panel"); BOX("hRight", "hCab", HX1 - 0.2, HX1, HY0, HY1, -HZ, HZ, "panel");
BOX("hTop", "hCab", HX0, HX1, HY1, HY1 + 0.25, -HZ, HZ, "panel2"); BOX("hFloor", "hCab", HX0, HX1, HY0, HY0 + 0.15, -HZ, HZ, "steel2");
BOX("hGlass", "hCab", HX0 + 0.2, HX1 - 0.2, HY0 + 0.15, HY1, HZ - 0.1, HZ - 0.04, "glass");
P({ id: "hFrame", layer: "hCab", shape: "ring", size: [7.2, R2(HY1 - HY0 + 0.1), 0.1], wall: 0.25, pos: [HX, R2((HY0 + HY1) / 2), HZ], mat: "steel" });
P({ id: "hFrameS", layer: "hCab", shape: "box", size: [0.06, R2(HY1 - HY0 - 0.4), 0.06], pos: [HX, R2((HY0 + HY1) / 2), HZ + 0.06], mat: "steel" });
P({ id: "hHinge", layer: "hCab", shape: "cyl", size: [0.07, 0.5], rot: V, pos: [R2(HX0 + 0.05), 0, HZ + 0.06], at: [[0, 2.2, 0], [0, 6.6, 0]], mat: "steel2" });
BOX("hHandle", "hCab", HX + 0.2, HX + 0.35, 3.6, 5.2, HZ + 0.06, HZ + 0.18, "steel2");
P({ id: "hSeam", layer: "hCab", shape: "box", size: [0.03, R2(HY1 - HY0), 0.03], pos: [0, R2((HY0 + HY1) / 2), 0], at: [[R2(HX0 - 0.01), 0, -1.0], [R2(HX0 - 0.01), 0, 1.0]], mat: "seam" });
// 側邊控制箱（落在底座上）：面板＋百葉
BOX("hCtl", "hCab", HX1, HX1 + 2.2, HY0, HY1, -2.7, 2.7, "panel2");
panelUI("hUi", "hCab", HX1 + 1.1, 4.6, 2.7, 1.0);
P({ id: "hCtlLv", layer: "hCab", shape: "box", size: [1.6, 0.04, 0.03], pos: [R2(HX1 + 1.1), 0, 2.72], at: Array.from({ length: 8 }, (_, i) => [0, R2(1.4 + i * 0.16), 0]), mat: "dark" });
BOX("hCtlTag", "hCab", HX1 + 0.5, HX1 + 1.7, 6.6, 7.0, 2.7, 2.72, "white");
VC("hExh", "hCab", 0.45, HY1 + 0.25, HY1 + 1.4, "steel2", { x: HX - 2.4, z: -1.6 }); RING("hExhF", "hCab", 0.55, 0.45, HY1 + 0.25, HY1 + 0.4, "steel", HX - 2.4, -1.6);
// 噴嘴陣列：兩根噴管（吊在頂板下）＋每根 7 顆噴嘴；給水管從噴管穿出頂板、經閥件手輪接進控制箱
const NZY = HY1 - 0.7;
P({ id: "hSprayBar", layer: "hCab", shape: "cyl", size: [0.12, 6.4], rot: [0, 90, 0], pos: [HX, R2(NZY + 0.15), 0], at: [[0, 0, -1.0], [0, 0, 1.0]], mat: "steel2" });
P({ id: "hSprayHang", layer: "hCab", shape: "box", size: [0.1, 0.6, 0.1], pos: [0, R2(NZY + 0.45), 0], at: [-2.5, 0, 2.5].flatMap((x) => [[R2(HX + x), 0, -1.0], [R2(HX + x), 0, 1.0]]), mat: "steel" });
const NZX = [-2.7, -1.8, -0.9, 0, 0.9, 1.8, 2.7];
P({ id: "hNoz", layer: "hCab", shape: "cyl", size: [0.07, 0.22], rot: V, pos: [0, R2(NZY - 0.04), 0], at: NZX.flatMap((x) => [[R2(HX + x), 0, -1.0], [R2(HX + x), 0, 1.0]]), mat: "darker" });
P({ id: "hFeedV", layer: "hCab", shape: "cyl", size: [0.09, R2(HY1 + 0.7 - NZY - 0.15)], rot: V, pos: [R2(HX + 3.0), R2((HY1 + 0.7 + NZY + 0.15) / 2), 0], at: [[0, 0, -1.0], [0, 0, 1.0]], mat: "steel2" });
P({ id: "hFeedH", layer: "hCab", shape: "cyl", size: [0.09, 2.0], rot: [0, 0, 0], pos: [R2(HX + 3.0), R2(HY1 + 0.7), 0], mat: "steel2" });
SPH("hFeedE", "hCab", 0.12, HX + 3.0, HY1 + 0.7, 0, "steel2");
P({ id: "hFeedR", layer: "hCab", shape: "cyl", size: [0.09, R2(HX1 + 1.0 - HX - 3.0)], rot: [0, 90, 0], pos: [R2((HX1 + 1.0 + HX + 3.0) / 2), R2(HY1 + 0.7), 0], mat: "steel2" });
VC("hFeedD", "hCab", 0.09, HY1, HY1 + 0.7, "steel2", { x: HX1 + 1.0 }); SPH("hFeedE2", "hCab", 0.12, HX1 + 1.0, HY1 + 0.7, 0, "steel2");
valve("hFeedV0", "hCab", HX1 + 0.3, HY1 + 0.7, 0);
// 排水：腔底排水口 → 底座正面的排水管 → 右邊地上的排水槽；儲水槽觀察管（底座正面左邊）
VC("hDrain", "hCab", 0.18, HY0 + 0.15, HY0 + 0.17, "darker", { x: HX + 2.6, z: 2.2 });
VC("hDrainV", "hCab", 0.08, 0.25, HY0, "steel2", { x: HX + 2.6, z: HZ + 0.12 });
P({ id: "hDrainH", layer: "hCab", shape: "cyl", size: [0.08, R2(HX1 + 2.9 - HX - 2.6)], rot: [0, 90, 0], pos: [R2((HX1 + 2.9 + HX + 2.6) / 2), 0.25, R2(HZ + 0.12)], mat: "steel2" });
SPH("hDrainE", "hCab", 0.1, HX + 2.6, 0.25, HZ + 0.12, "steel2");
BOX("hDrainBox", "hCab", HX1 + 2.6, HX1 + 3.4, 0, 0.35, HZ - 0.3, HZ + 0.5, "darker"); P({ id: "hDrainG", layer: "hCab", shape: "box", size: [0.7, 0.02, 0.04], pos: [R2(HX1 + 3.0), 0.36, 0], at: [0, 1, 2, 3].map((i) => [0, 0, R2(HZ - 0.2 + i * 0.2)]), mat: "steel" });
P({ id: "hTank", layer: "hCab", shape: "cyl", size: [0.12, 0.7], rot: V, pos: [R2(HX - 2.8), 0.45, R2(HZ + 0.14)], mat: "glass" }); VC("hTankW", "hCab", 0.1, 0.12, 0.5, "mistC" in palette ? "lens" : "glass", { x: HX - 2.8, z: HZ + 0.14 });
BOX("hTankT", "hCab", HX - 2.95, HX - 2.65, 0.78, 0.84, HZ + 0.02, HZ + 0.26, "steel"); BOX("hTankB", "hCab", HX - 2.95, HX - 2.65, 0.06, 0.12, HZ + 0.02, HZ + 0.26, "steel");
BOX("hAir", "hCab", HX1 - 0.32, HX1 - 0.2, 2.2, 3.6, -1.4, 1.4, "dark");
P({ id: "hAirLv", layer: "hCab", shape: "box", size: [0.04, 0.05, 2.6], pos: [R2(HX1 - 0.34), 0, 0], at: [0, 1, 2, 3, 4, 5].map((i) => [0, R2(2.35 + i * 0.22), 0]), mat: "steel2" });
// 晶圓盒的門：掛在左壁兩支托架上（不轉）；門板＋四周密封條＋兩個鑰匙孔
const HDX = HX - 2.88, SHY0 = HY0 + 1.2;
BOX("hDoorP", "hCab", HDX - 0.08, HDX + 0.08, SHY0 + 0.3, SHY0 + 3.36, -1.76, 1.76, "door");
BOX("hDoorSlT", "hCab", HDX + 0.08, HDX + 0.11, SHY0 + 3.24, SHY0 + 3.3, -1.7, 1.7, "rubber"); BOX("hDoorSlB", "hCab", HDX + 0.08, HDX + 0.11, SHY0 + 0.36, SHY0 + 0.42, -1.7, 1.7, "rubber");
P({ id: "hDoorSlS", layer: "hCab", shape: "box", size: [0.03, 2.82, 0.06], pos: [R2(HDX + 0.095), R2(SHY0 + 1.83), 0], at: [[0, 0, -1.67], [0, 0, 1.67]], mat: "rubber" });
P({ id: "hDoorKh", layer: "hCab", shape: "cyl", size: [0.16, 0.04], rot: [0, 90, 0], pos: [R2(HDX + 0.1), R2(SHY0 + 1.9), 0], at: [[0, 0, -0.9], [0, 0, 0.9]], mat: "dark" });
P({ id: "hDoorBrk", layer: "hCab", shape: "box", size: [R2(HDX - 0.08 - HX0 - 0.2), 0.14, 0.14], pos: [R2((HDX - 0.08 + HX0 + 0.2) / 2), 0, 0], at: [[0, R2(SHY0 + 3.1), -1.2], [0, R2(SHY0 + 3.1), 1.2], [0, R2(SHY0 + 0.6), -1.2], [0, R2(SHY0 + 0.6), 1.2]], mat: "steel" });
// 旋轉架：立軸（落在腔底軸承座）＋十字托臂（托住盒殼開口的四邊）＋頂住盒殼內頂的托盤
VC("hBear", "hCab", 0.4, HY0 + 0.15, HY0 + 0.45, "dark", { x: HX });
LAY("hRack", [5.4, 4.6, HX, 4.2]);
VC("hShaft", "hRack", 0.12, HY0 + 0.45, SHY0 + 3.3, "steel2", { x: HX });
BOX("hArmX", "hRack", HX - 1.82, HX + 1.82, SHY0 - 0.12, SHY0, -0.1, 0.1, "steel"); BOX("hArmZ", "hRack", HX - 0.1, HX + 0.1, SHY0 - 0.12, SHY0, -2.0, 2.0, "steel");
P({ id: "hClip", layer: "hRack", shape: "box", size: [0.1, 0.3, 0.16], pos: [0, R2(SHY0 + 0.06), 0], at: [[HX - 1.8, 0], [HX + 1.8, 0]].map(([x]) => [R2(x), 0, 0]), mat: "steel" });
P({ id: "hClipZ", layer: "hRack", shape: "box", size: [0.16, 0.3, 0.1], pos: [0, R2(SHY0 + 0.06), 0], at: [[0, -1.98], [0, 1.98]].map(([x, z]) => [HX, 0, z]), mat: "steel" });
BOX("hTopPad", "hRack", HX - 0.8, HX + 0.8, SHY0 + 3.3, SHY0 + 3.4, -0.8, 0.8, "rubber");
// 晶圓盒殼（開口朝下倒扣）：頂面（原本的後壁）、前後兩面（原本的左右側殼）半透明；−x 面＝盒底那面（不透明，看得到三道溝）；+x 面＝盒頂（法蘭朝外）；開口一圈門框
const SY0 = SHY0, SY1 = SHY0 + 3.66, SXa = HX - 1.73, SXb = HX + 1.73;
BOX("hShTop", "hRack", SXa, SXb, SY1 - 0.06, SY1, -1.92, 1.92, "shell");
for (const s of [-1, 1]) BOX(`hShW${s > 0 ? "R" : "L"}`, "hRack", SXa, SXb, SY0 + 0.08, SY1 - 0.06, Math.min(s * 1.86, s * 1.92), Math.max(s * 1.86, s * 1.92), "shell");
BOX("hShBot", "hRack", SXa, SXa + 0.2, SY0 + 0.08, SY1 - 0.06, -1.88, 1.88, "fbase");
BOX("hShTopF", "hRack", SXb - 0.08, SXb, SY0 + 0.08, SY1 - 0.06, -1.88, 1.88, "shell");
P({ id: "hShE", layer: "hRack", shape: "box", size: [0.08, 0.08, 3.84], pos: [0, 0, 0], at: [[SXa, SY1], [SXb, SY1], [SXa, SY0 + 0.04], [SXb, SY0 + 0.04]].map(([x, y]) => [R2(x), R2(y), 0]), mat: "shellF" });
P({ id: "hShEz", layer: "hRack", shape: "box", size: [3.46, 0.08, 0.08], pos: [HX, 0, 0], at: [[0, SY1, -1.92], [0, SY1, 1.92], [0, SY0 + 0.04, -1.92], [0, SY0 + 0.04, 1.92]].map(([x, y, z]) => [0, R2(y), z]), mat: "shellF" });
P({ id: "hShEv", layer: "hRack", shape: "box", size: [0.08, 3.66, 0.08], pos: [0, R2((SY0 + SY1) / 2), 0], at: [[SXa, -1.92], [SXb, -1.92], [SXa, 1.92], [SXb, 1.92]].map(([x, z]) => [R2(x), 0, z]), mat: "shellF" });
VC("hShFlP", "hRack", 0.34, 0, 0.24, "shellF", { x: 0 }); parts.pop();
P({ id: "hShFlP", layer: "hRack", shape: "cyl", size: [0.34, 0.24], rot: [0, 90, 0], pos: [R2(SXb + 0.12), R2((SY0 + SY1) / 2), 0], mat: "shellF" });
BOX("hShFl", "hRack", SXb + 0.24, SXb + 0.36, (SY0 + SY1) / 2 - 0.9, (SY0 + SY1) / 2 + 0.9, -0.9, 0.9, "shellF");
P({ id: "hShFlB", layer: "hRack", shape: "box", size: [0.03, 0.1, 0.1], pos: [R2(SXb + 0.375), 0, 0], at: [[-0.66, -0.66], [0.66, -0.66], [-0.66, 0.66], [0.66, 0.66]].map(([y, z]) => [0, R2((SY0 + SY1) / 2 + y), z]), mat: "steel" });
for (const s of [-1, 1]) { BOX(`hShHd${s > 0 ? "R" : "L"}`, "hRack", HX - 0.75, HX + 0.75, SY0 + 1.5, SY0 + 1.8, Math.min(s * 2.06, s * 2.16), Math.max(s * 2.06, s * 2.16), "shellF");
  P({ id: `hShHdS${s > 0 ? "R" : "L"}`, layer: "hRack", shape: "box", size: [0.14, 0.14, 0.18], pos: [0, R2(SY0 + 1.65), R2(s * 2.0)], at: [[R2(HX - 0.62), 0, 0], [R2(HX + 0.62), 0, 0]], mat: "shellF" }); }
BOX("hShBc", "hRack", HX - 1.2, HX - 0.2, SY0 + 2.2, SY0 + 2.8, 1.92, 1.93, "white");
P({ id: "hShBcB", layer: "hRack", shape: "box", size: [0.035, 0.42, 0.012], pos: [0, R2(SY0 + 2.5), 1.935], at: [-1.12, -1.02, -0.95, -0.85, -0.76, -0.68, -0.6, -0.48, -0.4, -0.32].map((x) => [R2(HX + x), 0, 0]), mat: "darker" });
P({ id: "hShGr", layer: "hRack", shape: "box", size: [0.03, 0.8, 0.12], pos: [R2(SXa - 0.015), 0, 0], at: [[R2((SY0 + SY1) / 2 + 0.6), 0], [R2((SY0 + SY1) / 2 - 0.4), -0.6], [R2((SY0 + SY1) / 2 - 0.4), 0.6]].map(([y, z]) => [0, y, z]), mat: "darker" });
actions.hSpin = { type: "rotate", _說明: "旋轉架繞立軸慢慢轉（起轉加速），盒殼各面都被噴到；最大迴轉半徑 2.58 < 腔壁 2.9", parts: idsOf("hRack"), axis: [0, 1, 0], pivot: [HX, HY0, 0], rps: 0.18, rampSpin: true };
actions.hMist = { track: false, free: true, type: "flow", _說明: "清洗水霧：從噴嘴往下噴（受重力加速），打在盒殼頂面", path: [[HX, NZY - 0.18, -1.0], [HX, SY1 + 0.04, -1.0]].map((a) => a.map(R2)), n: 6, size: 0.07, shape: "liquid", rate: 0.9, accel: true, color: "mistC", layer: "hCab", band: 0.02, bandO: 0.3, lanes: 5, laneGap: 0.8, laneDir: [1, 0, 0], jitter: 0.06 };
actions.hMist2 = { ...actions.hMist, path: [[HX, NZY - 0.18, 1.0], [HX, SY1 + 0.04, 1.0]].map((a) => a.map(R2)) };
actions.hRun = { track: false, free: true, type: "flow", _說明: "水沿著盒殼外側往下流、從開口邊滴到腔底排水口", path: [[HX, SY1 - 0.1, 1.96], [HX, SY0 + 0.1, 1.97], [HX + 0.6, HY0 + 0.2, 2.1]].map((a) => a.map(R2)), n: 5, size: 0.05, shape: "liquid", rate: 0.5, accel: true, color: "mistC", layer: "hCab", band: 0.02, bandO: 0.3, lanes: 4, laneGap: 0.8, laneDir: [1, 0, 0] };
actions.hHot = { track: false, free: true, type: "flow", _說明: "沖完水才吹熱風：從右壁風口吹向盒殼，把水烘乾", path: [[HX1 - 0.4, 2.9, 0], [HX + 2.6, 3.1, 0.6], [SXb + 0.1, 3.3, 1.2]].map((a) => a.map(R2)), n: 6, size: 0.16, shape: "arrow", rate: 0.6, color: "heatC", layer: "hCab", lanes: 3, laneGap: 0.7, laneDir: [0, 1, 0] };
actions.hSoak = { track: false, free: true, type: "flow", _說明: "空氣裡的水氣（小白點）慢慢滲進塑膠盒殼表面", path: [[HX - 3.0, SY0 + 2.6, 2.8], [HX - 1.6, SY0 + 2.2, 2.4], [HX - 0.6, SY0 + 1.9, 1.95]].map((a) => a.map(R2)), n: 6, size: 0.08, shape: "dot", rate: 0.3, color: "h2oC", layer: "hCab", lanes: 3, laneGap: 0.6, laneDir: [0, 1, 0], jitter: 0.05 };
actions.hOut = { track: false, free: true, type: "flow", _說明: "塑膠放氣（紫點）：從盒殼表面慢慢跑出來", path: [[HX + 0.3, SY0 + 1.6, 1.95], [HX + 1.2, SY0 + 2.2, 2.4], [HX + 2.0, SY0 + 3.2, 2.8]].map((a) => a.map(R2)), n: 5, size: 0.08, shape: "dot", rate: 0.3, color: "outC", layer: "hCab", lanes: 2, laneGap: 0.7, laneDir: [0, 1, 0], jitter: 0.05 };

// ═════ 站 T：台灣載具廠（x 240）：外牆接縫、窗、百葉、屋頂空調箱、卸貨門、屋頂名牌「載具廠（示意）」 ═════
const TX = 240;
const SIGNS = [["carrierfab", "載具廠|（示意）"]];
{ const r = spawnSync("node", [path.join(HERE, "..", "..", "scripts", "three", "make-brand-tex.mjs"), "tech-carrier", ...SIGNS.map(([id, t]) => `text:${id}=${t}`)], { encoding: "utf8" }); if (r.status !== 0) { console.error(r.stdout, r.stderr); process.exit(1); } }
materials.t_carrierfab = { kind: "unlit", color: "#FFFFFF", img: "tex/brand/sign-carrierfab.png" };
const TW0 = TX - 5.5, TW1 = TX + 4.5;
LAY("tFab", [11.6, 6.2, TX - 0.5, 3.0]);
BOX("tBody", "tFab", TW0, TW1, 0, 4.2, -3, 1.4, "panel"); BOX("tRoof", "tFab", TW0 - 0.1, TW1 + 0.1, 4.2, 4.35, -3.1, 1.5, "roof");
BOX("tBand", "tFab", TW0, TW1, 3.3, 3.6, 1.4, 1.43, "band");
P({ id: "tWin", layer: "tFab", shape: "box", size: [0.9, 0.7, 0.03], pos: [0, 2.6, 1.43], at: Array.from({ length: 7 }, (_, i) => [R2(TW0 + 0.9 + i * 1.35), 0, 0]), mat: "win" });
P({ id: "tSeam", layer: "tFab", shape: "box", size: [0.03, 4.15, 0.03], pos: [0, 2.1, 1.42], at: Array.from({ length: 13 }, (_, i) => [R2(TW0 + 0.4 + i * 0.77), 0, 0]), mat: "seam" });
P({ id: "tLouv", layer: "tFab", shape: "box", size: [0.6, 0.04, 0.03], pos: [0, 0, 1.44], at: Array.from({ length: 8 }, (_, i) => [R2(TX + 1.4 + (i % 4) * 0.75), R2(1.2 + Math.floor(i / 4) * 0.14), 0]), mat: "dark" });
const RU = [[TX - 4.6, -1.6], [TX - 3.4, -1.6], [TX + 2.4, -1.6], [TX + 3.6, -1.6]];
P({ id: "tRoofU", layer: "tFab", shape: "box", size: [1.0, 0.5, 1.0], pos: [0, 4.6, 0], at: RU.map(([x, z]) => [R2(x), 0, z]), mat: "roof" });
P({ id: "tRoofF", layer: "tFab", shape: "cyl", size: [0.38, 0.06], rot: V, pos: [0, 4.88, 0], at: RU.map(([x, z]) => [R2(x), 0, z]), mat: "darker" });
P({ id: "tDock", layer: "tFab", shape: "box", size: [1.2, 1.3, 0.04], pos: [0, 0.65, 1.43], at: [[TX - 2.4, 0, 0], [TX - 0.9, 0, 0]].map((a) => a.map(R2)), mat: "seam" });
P({ id: "tDockS", layer: "tFab", shape: "box", size: [1.1, 0.03, 0.02], pos: [0, 0, 1.46], at: [[TX - 2.4], [TX - 0.9]].flatMap(([x]) => [0.3, 0.6, 0.9].map((y) => [R2(x), y, 0])), mat: "dark" });
BOX("tCanopy", "tFab", TX - 3.2, TX - 0.1, 1.55, 1.65, 1.43, 2.3, "band"); P({ id: "tCanopyS", layer: "tFab", shape: "box", size: [0.06, 0.06, 0.9], pos: [0, 1.75, 1.86], at: [[R2(TX - 3.0), 0, 0], [R2(TX - 0.3), 0, 0]], rot: [-30, 0, 0], mat: "steel" });
P({ id: "tDuct", layer: "tFab", shape: "cyl", size: [0.18, 3.4], rot: V, pos: [R2(TW1 - 0.5), 2.4, 1.62], mat: "steel2" }); P({ id: "tDuctC", layer: "tFab", shape: "box", size: [0.5, 0.08, 0.3], pos: [R2(TW1 - 0.5), 0, 1.53], at: [[0, 1.2, 0], [0, 3.2, 0]], mat: "steel" });
P({ id: "tSignPost", layer: "tFab", shape: "box", size: [0.12, 1.75, 0.12], pos: [0, 5.22, 0.85], at: [[R2(TX - 2.1), 0, 0], [R2(TX + 1.1), 0, 0]], mat: "steel" });
BOX("tSignBk", "tFab", TX - 2.45, TX + 1.45, 4.5, 6.1, 0.92, 0.98, "band");
P({ id: "tSign", layer: "tFab", shape: "plane", size: [3.8, 1.6], pos: [R2(TX - 0.5), 5.3, 0.99], mat: "t_carrierfab", uv01: true });
// 門口的出貨盒堆（落地棧板上）
BOX("tPallet", "tFab", TX + 5.0, TX + 7.4, 0, 0.3, -0.2, 2.0, "kraft");
P({ id: "tPalletS", layer: "tFab", shape: "box", size: [2.4, 0.04, 0.1], pos: [R2(TX + 6.2), 0.31, 0], at: [0.1, 0.6, 1.1, 1.6].map((z) => [0, 0, z]), mat: "seam" });
P({ id: "tCrate", layer: "tFab", shape: "box", size: [1.1, 1.0, 1.0], pos: [0, 0, 0], at: [[TX + 5.65, 0.8, 0.4], [TX + 6.8, 0.8, 0.4], [TX + 5.65, 0.8, 1.5], [TX + 6.8, 0.8, 1.5], [TX + 6.2, 1.8, 0.95]].map((a) => a.map(R2)), mat: "kraft" });
P({ id: "tCrateT", layer: "tFab", shape: "box", size: [1.12, 0.12, 0.08], pos: [0, 0, 0], at: [[TX + 5.65, 0.9, 0.91], [TX + 6.8, 0.9, 0.91], [TX + 5.65, 0.9, 2.01], [TX + 6.8, 0.9, 2.01], [TX + 6.2, 1.9, 1.46]].map((a) => a.map(R2)), mat: "panel2" });

// ═════ 站 N：晶片故障預告（x 270）：檢查台上的電路板（走線紋、銲墊、過孔、被動元件）＋封裝晶片（四邊鷗翼接腳、上蓋、腳位圓點）＋熱點＋龍門架放大鏡掃過 ═════
const NX = 270;
LAY("nBench", [8.4, 6.4, NX, 3]);
const NH = plinth("n", "nBench", NX, 0, 7.6, 5.4, 0.9);
P({ id: "nStand", layer: "nBench", shape: "box", size: [0.4, 0.5, 0.4], pos: [0, R2(NH + 0.25), 0], at: [[-2.6, -1.6], [2.6, -1.6], [-2.6, 1.6], [2.6, 1.6]].map(([x, z]) => [R2(NX + x), 0, z]), mat: "steel" });
const PBY = R2(NH + 0.5);
BOX("nPcb", "nBench", NX - 3.0, NX + 3.0, PBY, PBY + 0.14, -2.0, 2.0, "pcb");
P({ id: "nPad", layer: "nBench", shape: "box", size: [0.16, 0.012, 0.3], pos: [0, R2(PBY + 0.146), 0], at: [...Array.from({ length: 10 }, (_, i) => [R2(NX - 1.08 + i * 0.24), 0, -1.32]), ...Array.from({ length: 10 }, (_, i) => [R2(NX - 1.08 + i * 0.24), 0, 1.32])], mat: "gold" });
P({ id: "nPadS", layer: "nBench", shape: "box", size: [0.3, 0.012, 0.16], pos: [0, R2(PBY + 0.146), 0], at: [...Array.from({ length: 10 }, (_, i) => [R2(NX - 1.32), 0, R2(-1.08 + i * 0.24)]), ...Array.from({ length: 10 }, (_, i) => [R2(NX + 1.32), 0, R2(-1.08 + i * 0.24)])], mat: "gold" });
P({ id: "nVia", layer: "nBench", shape: "cyl", size: [0.05, 0.02], rot: V, pos: [0, R2(PBY + 0.145), 0], at: Array.from({ length: 24 }, (_, i) => [R2(NX - 2.7 + (i % 8) * 0.25), 0, R2(-1.7 + Math.floor(i / 8) * 0.25)]).concat(Array.from({ length: 16 }, (_, i) => [R2(NX + 1.9 + (i % 4) * 0.25), 0, R2(0.6 + Math.floor(i / 4) * 0.3)])), mat: "gold" });
P({ id: "nTrace", layer: "nBench", shape: "box", size: [0.04, 0.01, 1.4], pos: [0, R2(PBY + 0.146), 0], at: Array.from({ length: 6 }, (_, i) => [R2(NX - 0.6 + i * 0.24), 0, R2(-2.0 + 0.7 - 0.02)]), mat: "gold" });
P({ id: "nTraceX", layer: "nBench", shape: "box", size: [1.5, 0.01, 0.04], pos: [0, R2(PBY + 0.146), 0], at: Array.from({ length: 5 }, (_, i) => [R2(NX + 2.2), 0, R2(-0.6 + i * 0.24)]), mat: "gold" });
P({ id: "nCap", layer: "nBench", shape: "box", size: [0.3, 0.16, 0.16], pos: [0, R2(PBY + 0.22), 0], at: [[NX - 2.4, 0, 0.6], [NX - 2.4, 0, 1.0], [NX - 2.4, 0, 1.4], [NX + 2.4, 0, -1.4], [NX + 2.0, 0, -1.4]].map((a) => a.map(R2)), mat: "lampY" });
P({ id: "nCapE", layer: "nBench", shape: "box", size: [0.06, 0.17, 0.17], pos: [0, R2(PBY + 0.22), 0], at: [[NX - 2.55, 0, 0.6], [NX - 2.25, 0, 0.6], [NX - 2.55, 0, 1.0], [NX - 2.25, 0, 1.0], [NX - 2.55, 0, 1.4], [NX - 2.25, 0, 1.4]].map((a) => a.map(R2)), mat: "lead" });
BOX("nConn", "nBench", NX + 1.8, NX + 2.9, PBY + 0.14, PBY + 0.5, 1.4, 1.9, "darker"); P({ id: "nConnP", layer: "nBench", shape: "box", size: [0.05, 0.1, 0.05], pos: [0, R2(PBY + 0.55), 1.65], at: Array.from({ length: 8 }, (_, i) => [R2(NX + 1.9 + i * 0.13), 0, 0]), mat: "gold" });
// 封裝晶片（QFP）：本體＋上蓋（散熱片）＋四邊接腳（腳跟落在銲墊上）＋腳位圓點
const QY = R2(PBY + 0.36);
BOX("nPkg", "nBench", NX - 1.15, NX + 1.15, PBY + 0.2, QY, -1.15, 1.15, "pkg");
BOX("nLid", "nBench", NX - 0.8, NX + 0.8, QY, QY + 0.06, -0.8, 0.8, "steel2");
VC("nDot", "nBench", 0.08, QY, QY + 0.005, "white", { x: NX - 0.95, z: 0.95 });
const LEADS = Array.from({ length: 10 }, (_, i) => R2(-1.08 + i * 0.24));
P({ id: "nLeadZ", layer: "nBench", shape: "box", size: [0.08, 0.04, 0.34], pos: [0, R2(PBY + 0.27), 0], at: [...LEADS.map((u) => [R2(NX + u), 0, -1.3]), ...LEADS.map((u) => [R2(NX + u), 0, 1.3])], mat: "lead" });
P({ id: "nLeadZf", layer: "nBench", shape: "box", size: [0.08, 0.13, 0.04], pos: [0, R2(PBY + 0.2), 0], at: [...LEADS.map((u) => [R2(NX + u), 0, -1.46]), ...LEADS.map((u) => [R2(NX + u), 0, 1.46])], mat: "lead" });
P({ id: "nLeadX", layer: "nBench", shape: "box", size: [0.34, 0.04, 0.08], pos: [0, R2(PBY + 0.27), 0], at: [...LEADS.map((u) => [R2(NX - 1.3), 0, R2(u)]), ...LEADS.map((u) => [R2(NX + 1.3), 0, R2(u)])], mat: "lead" });
P({ id: "nLeadXf", layer: "nBench", shape: "box", size: [0.04, 0.13, 0.08], pos: [0, R2(PBY + 0.2), 0], at: [...LEADS.map((u) => [R2(NX - 1.46), 0, R2(u)]), ...LEADS.map((u) => [R2(NX + 1.46), 0, R2(u)])], mat: "lead" });
// 熱點（平常是暗的；念到「壞」才亮紅）
VC("nHot", "nBench", 0.26, QY + 0.06, QY + 0.075, "hotOff", { x: NX + 0.35, z: -0.25 });
actions.nHotGlow = { type: "pulse", _說明: "晶片某處熱點變紅（示意，不標數值）", parts: ["nHot"], color: "hotC", glow: 1, freq: 1.2, halo: 0 };
// 龍門架（兩根立柱落在台座上＋橫樑）＋滑車＋吊著的放大鏡（鏡框＋鏡片）
for (const s of [-1, 1]) BOX(`nGPost${s > 0 ? "R" : "L"}`, "nBench", NX + s * 3.4 - 0.15, NX + s * 3.4 + 0.15, NH, NH + 3.6, -1.85, -1.55, "steel2");
BOX("nGBeam", "nBench", NX - 3.55, NX + 3.55, NH + 3.6, NH + 3.9, -1.95, -1.45, "steel2");
BOX("nGRail", "nBench", NX - 3.2, NX + 3.2, NH + 3.5, NH + 3.6, -1.45, -1.38, "steel");
LAY("nMag", [2.4, 3.2, NX, NH + 2.4]);
BOX("nMCar", "nMag", NX - 0.35, NX + 0.35, NH + 3.3, NH + 3.75, -1.38, -1.1, "dark");
BOX("nMArm", "nMag", NX - 0.08, NX + 0.08, NH + 1.9, NH + 3.3, -1.3, -1.14, "steel");
BOX("nMArm2", "nMag", NX - 0.08, NX + 0.08, NH + 1.82, NH + 1.98, -1.3, -0.9, "steel");
P({ id: "nMRim", layer: "nMag", shape: "tube", size: [0.95, 0.82, 0.12], rot: V, pos: [NX, R2(NH + 1.75), -0.1], mat: "darker" });
VC("nMLens", "nMag", 0.82, NH + 1.7, NH + 1.8, "lens", { x: NX, z: -0.1 });
const MAG_AMP = 1.4, MAG_F = 0.35;
actions.nScan = { type: "vibrate", _說明: "放大鏡沿橫樑來回掃過晶片（兩端減速）", parts: idsOf("nMag"), axis: [1, 0, 0], amp: MAG_AMP, freq: MAG_F };

// 標註點
Object.assign(anchors, {
  aDoorA: AF("aFoup", AW, 1.0, AH + 3.3, 1.98, 170, -200), aBoxA: AF("aFoup", AW, -1.92, AH + 3.6, -0.6, -170, -150),
  bTopA: AF("bT", BW, 0.9, BH + 4.05, 0.3, 170, -90), bDoorA: AF("bD", BW, 1.2, BH + 3.0, 1.98, 200, -170), bShellA2: AF("bS", BW, -1.92, BH + 3.4, 0.4, -170, -200), bShellA: AF("bB", BW, -1.5, BH + 1.6, 0.6, -200, -250),
  cGrA: AF("cFoup", CW, -0.9, CFY + 0.04, 0.6, -190, 190), cPinA: A("cBase", [CPIN[1][0], CPT + 0.2, CPIN[1][1]], -190, 190), cFoupA: AF("cFoup", CW, 1.9, CFY + 3.4, 1.0, 190, -170),
  dOhtA: A("dVeh", [LPX - 1.7, VB + 1.0, 1.25], -190, -40), dPortA: A("dPort", [LPX + 2.1, SY - 0.1, 1.6], 170, 70), dDoorA: A("dPD", [WX - 0.1, OY0 + 1.2, 1.6], 400, 60), dArmA: A("dFork", [FKB + 2.1, RY, 0.36], 380, -120),
  eN2A: A("eRack", [EIN[0][0], EPT + 0.2, EIN[0][1]], -200, 230), eFoupA: AF("eFoup", EW, 1.9, EFY + 0.3, -1.0, 200, 200), eGasA: A("eRack", [GPX + 0.8, 2.4, -0.7], 120, 90),
  fFosbA: A("fFosb", [FX + 1.9, FBY + 3.0, 1.5], 170, -110), fFoamA: A("fBed", [CB1 - 0.6, CY0 + 0.6, 1.5], 170, 60),
  gOutA: A("gOshell", [GX - 1.9, GSY + 1.0, 1.6], -150, 230), gInA: A("gIc", [GX + 1.4, GRY + 0.7, 1.3], 170, -90), gRetA: A("gIn", [GX - 0.9, RTY + 0.14, 0.9], -170, 60),
  hShA: A("hRack", [HX - 0.8, SHY0 + 2.6, 1.92], -190, -110), hNozA: A("hCab", [HX + 2.7, NZY, 1.0], 170, -80),
  tFabA: A("tFab", [TX - 4.0, 2.6, 1.43], -150, -100),
  nPkgA: A("nBench", [NX + 1.3, PBY + 0.3, 1.3], 170, 60), nHotA: A("nBench", [NX + 0.35, QY + 0.08, -0.25], 170, -90), nMagA: A("nMag", [NX, NH + 1.75, 0.85], -170, -80),
});

const model = {
  name: "示意 光罩盒與晶圓載具：晶圓盒（前開式，半透明盒殼）拆解、盒底三溝三銷對位、天車＋承載埠＋前端搬運區、氮氣吹淨架、出貨盒運送、雙層光罩盒與真空腔、盒子清洗機、台灣載具廠、封裝晶片（示意，非特定廠牌／型號）",
  unit: "示意（放大）",
  size: { w: 40, h: 18, r: 0.6, t: 30 },
  palette, materials,
  partNames: { bWf: "晶圓", dPkW: "晶圓" },
  layers, parts, anchors, actions,
  pose: { yaw0: 0, yawIso: 0, drift: 0 },
  camera: { stand: { d: 70, elev: 24, y: 4 } },
  fx: { dpr: 1, srcPx: 30, shadows: 0, fog: false, dust: false, vaporSprites: false, shimmer: false },
  info: { AX, AH, BX, BH, B_DOOR, B_DDX, B_DDZ, B_SHELL, B_TOP, CX, CFY: R2(CFY), C_DROP, C_OFFX, C_OFFZ, C_LAST, LPX, SY, DFY, WX, VB, D_DROP, NBELT, D_DOCK, D_DOOR_X, D_DOOR_Y, D_EXT, D_EXT2, D_LIFT, RCX,
    EX, EFY, E_U0, E_RATE, NM: E_MOIST.length, FX, GX, GCX: R2(GCX), G_OUT, G_IN, G_CUP, G_GATE, HX, TX, NX, NH, MAG_AMP, MAG_F, RAILY },
};
fs.writeFileSync(path.join(HERE, "model.json"), JSON.stringify(model, null, 1) + "\n");
console.log(`✔ model.json：${parts.length} 個零件、${parts.reduce((a, p) => a + Math.max(1, p.at?.length ?? 0), 0)} 個實體、${layers.length} 層`);
