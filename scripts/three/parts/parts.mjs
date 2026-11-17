// 科技片零件庫：model.json 的 parts 裡寫 { "part": "wafer", "id": "wf", "pos": [x,y,z], ...參數 } 就展開成一組零件。
// 約定：座標 x 向右、y 向上、z 向觀眾；單位跟著該片的 model（packaging／euv 都是 1＝1 cm）；
//   每個零件的原點（pos）＝底面中心（特別註明的除外）；零件內部的尺寸都可以用參數改。
//   展開後的零件 id＝「<id>_<名稱>」（例如 wf_body、wf_dies），層 id＝ <id>（或參數 layer），動作 id＝「<id>_<名稱>」（例如 nz_suck）。
//   動作與零件參數的 "@id" 會展開成該實例所有零件 id，"@id:名稱" 只展開名稱開頭符合的（例如 "@wf:dies"）。
import { seeded } from "./util.mjs";

const R2 = (x) => Math.round(x * 1000) / 1000;
const V = [90, 0, 0]; // 圓柱／圓管的軸預設沿 z；轉 90 度＝立起來（沿 y）
const grid = (nx, nz, sx, sz) => { const a = []; for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) a.push([R2((i - (nx - 1) / 2) * sx), 0, R2((j - (nz - 1) / 2) * sz)]); return a; };
/** 兩點之間的一根圓柱：回傳 { len, mid, rot }（圓柱預設沿 z；先繞 x 轉 θ 再繞 y 轉 ψ） */
export const aim = (a, b) => {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], len = Math.hypot(...d) || 1e-6, u = d.map((x) => x / len);
  return { len, mid: [R2((a[0] + b[0]) / 2), R2((a[1] + b[1]) / 2), R2((a[2] + b[2]) / 2)], rot: [R2((Math.asin(-u[1]) * 180) / Math.PI), R2((Math.atan2(u[0], u[2]) * 180) / Math.PI), 0] };
};
const add3 = (p, q) => [R2(p[0] + (q[0] ?? 0)), R2(p[1] + (q[1] ?? 0)), R2(p[2] + (q[2] ?? 0))];

/** 每個零件產生器：(o 參數, c 工具) → 往 c 裡加零件、層、標註點、動作 */
export const PARTS = {
  // ── 晶圓：吸盤＋圓盤＋晶粒格；bad＝壞晶粒顆數（固定亂數）、pick＝[i,j] 要被吸走的那一顆（獨立一層 <id>_pick） ──
  wafer(o, c) {
    const r = o.r ?? 3.6, t = o.t ?? 0.06, step = o.step ?? 0.62, ds = step - (o.gap ?? 0.07), dt = 0.014, K = Math.ceil(r / step), rnd = seeded(7 + (o.seed ?? 0));
    if (o.chuck !== false) {
      c.P("chuck", { shape: "cyl", size: [R2(r * 1.12), 0.16], rot: V, pos: [0, -0.08, 0], mat: "chuck" });
      const ph = o.postH ?? 1.0; c.P("post", { shape: "cyl", size: [R2(r * 0.3), ph], rot: V, pos: [0, R2(-0.16 - ph / 2), 0], mat: "steel2" });
    }
    c.P("body", { shape: "cyl", size: [r, t], rot: V, pos: [0, t / 2, 0], mat: "wafer" });
    const ok = [], bad = [], pk = o.pick ? `${o.pick[0]},${o.pick[1]}` : "", cells = [];
    for (let i = -K; i <= K; i++) for (let j = -K; j <= K; j++) {
      const x = i * step, z = j * step, h = ds / 2;
      if ([[x - h, z - h], [x + h, z - h], [x - h, z + h], [x + h, z + h]].every(([a, b]) => Math.hypot(a, b) < r * 0.97)) cells.push([i, j, R2(x), R2(z)]);
    }
    const nBad = Math.min(o.bad ?? 0, cells.length), badSet = new Set();
    while (badSet.size < nBad) { const k = Math.floor(rnd() * cells.length); if (`${cells[k][0]},${cells[k][1]}` !== pk) badSet.add(k); }
    cells.forEach(([i, j, x, z], k) => { if (`${i},${j}` === pk) return; (badSet.has(k) ? bad : ok).push([x, 0, z]); });
    c.P("dies", { shape: "box", size: [R2(ds), dt, R2(ds)], pos: [0, R2(t + dt / 2), 0], at: ok, mat: "die" });
    if (bad.length) c.P("bad", { shape: "box", size: [R2(ds), dt + 0.004, R2(ds)], pos: [0, R2(t + dt / 2), 0], at: bad, mat: "dieBad" });
    if (bad.length) c.act("badGlow", { type: "pulse", parts: c.ids("bad"), color: "lp_bad", freq: 2.4, glow: 1, halo: 0 }, ["bad"]);
    if (o.pick) { const cell = cells.find((q) => q[0] === o.pick[0] && q[1] === o.pick[1]); c.L(`${c.id}_pick`); const pt = o.pickT ?? 0.18; c.P("pick", { layer: `${c.id}_pick`, shape: "box", size: [R2(ds), pt, R2(ds)], pos: [cell[2], R2(t + pt / 2), cell[3]], mat: "die" }); c.P("pickTop", { layer: `${c.id}_pick`, shape: "box", size: [R2(ds - 0.1), 0.004, R2(ds - 0.1)], pos: [cell[2], R2(t + pt + 0.002), cell[3]], mat: "chipTop" }); c.anchor("pick", { layer: `${c.id}_pick`, p: [cell[2], R2(t + pt), cell[3]], dx: 90, dy: -90 }); c.out.info.pickAt = add3(c.pos, [cell[2], t + pt, cell[3]]); }
    c.anchor("", { p: [0, t + 0.02, R2(r * 0.8)], dx: 110, dy: 60 }); c.out.info.topY = R2(c.pos[1] + t); c.out.info.r = r;
    c.outline(r * 2.2, r * 2.2);
  },
  // ── 晶片：本體＋頂面＋網格線＋底下一整片微凸塊（凸塊在原點下方，原點＝本體底面）；kind: "hbm" 換成記憶體配色 ──
  die(o, c) {
    const w = o.w ?? 2.6, d = o.d ?? 3.3, t = o.t ?? 0.32, hbm = o.kind === "hbm", p = o.pitch ?? 0.19;
    c.P("body", { shape: "box", size: [w, t, d], pos: [0, t / 2, 0], mat: hbm ? "hbm" : "chip" });
    c.P("top", { shape: "box", size: [R2(w - 0.16), 0.004, R2(d - 0.16)], pos: [0, R2(t + 0.002), 0], mat: hbm ? "hbmTop" : "chipTop" });
    if (o.grid !== false && !hbm) {
      c.P("gridV", { shape: "box", size: [0.008, 0.004, R2(d - 0.16)], pos: [0, R2(t + 0.005), 0], at: Array.from({ length: 7 }, (_, i) => [R2(-w / 2 + 0.08 + (i + 1) * ((w - 0.16) / 8)), 0, 0]), mat: "gridLn" });
      c.P("gridH", { shape: "box", size: [R2(w - 0.16), 0.004, 0.008], pos: [0, R2(t + 0.005), 0], at: Array.from({ length: 9 }, (_, i) => [0, 0, R2(-d / 2 + 0.08 + (i + 1) * ((d - 0.16) / 10))]), mat: "gridLn" });
    }
    if (o.bumps !== false) c.P("bumps", { shape: "cyl", size: [0.045, 0.03], rot: V, pos: [0, -0.015, 0], at: grid(Math.max(2, Math.floor((w - 0.2) / p)), Math.max(2, Math.floor((d - 0.2) / p)), p, p), mat: "ubump" });
    c.anchor("", { p: [0, t, R2(-d * 0.3)], dx: -110, dy: -110 }); c.outline(w, d);
    // 發熱：晶片頂面一塊熱點閃橘（和 heatsink 的 heat 一起演熱擴散）
    c.act("hot", { type: "pulse", parts: c.ids("body", "top"), color: "lp_heat", freq: 2, glow: 0.9, halo: 0 }, ["heat"]);
  },
  // ── 凸塊陣列：kind micro（微凸塊）／c4／ball（錫球）；n＝[橫, 縱]、pitch＝間距；原點＝陣列中心、底面。動作 melt＝回流焊熔化發光 ──
  bumps(o, c) {
    const kind = o.kind ?? "c4", d = { micro: { r: 0.045, h: 0.03, mat: "ubump", p: 0.19 }, c4: { r: 0.075, h: 0.06, mat: "c4", p: 0.295 }, ball: { r: 0.11, h: 0.22, mat: "ball", p: 0.47 } }[kind], p = o.pitch ?? d.p, n = o.n ?? [10, 8];
    if (kind === "ball") c.P("array", { shape: "sphere", size: [d.r], pos: [0, d.r, 0], at: grid(n[0], n[1], p, p), mat: d.mat });
    else c.P("array", { shape: "cyl", size: [d.r, d.h], rot: V, pos: [0, d.h / 2, 0], at: grid(n[0], n[1], p, p), mat: d.mat });
    c.anchor("", { p: [R2(((n[0] - 1) * p) / 2), d.h, R2(((n[1] - 1) * p) / 2)], dx: 100, dy: 60 }); c.outline((n[0] - 1) * p + 0.4, (n[1] - 1) * p + 0.4);
    c.act("melt", { type: "pulse", parts: c.ids("array"), color: "lp_melt", steady: true, glow: 1, halo: 0 }, ["melt"]);
  },
  // ── 矽穿孔：沿一條線（line＝[x0,z0,x1,z1]，相對原點）排 n 根垂直細柱，高 h；或 grid＝[nx,nz]＋pitch ──
  tsv(o, c) {
    const h = o.h ?? 0.08, w = o.w ?? 0.022;
    let at;
    if (o.grid) at = grid(o.grid[0], o.grid[1], o.pitch ?? 0.12, o.pitch ?? 0.12);
    else { const [x0, z0, x1, z1] = o.line ?? [-3, 0, 3, 0], n = o.n ?? 40; at = Array.from({ length: n }, (_, i) => [R2(x0 + ((x1 - x0) * i) / (n - 1)), 0, R2(z0 + ((z1 - z0) * i) / (n - 1))]); }
    c.P("pillars", { shape: "box", size: [w, h, w], pos: [0, h / 2, 0], at, mat: "tsv" });
    c.anchor("", { p: [at[0][0], h, at[0][2]], dx: 100, dy: 60 });
    c.act("glow", { type: "pulse", parts: c.ids("pillars"), color: "lp_proc", steady: true, glow: 0.95, halo: 0 }, ["proc"]);
  },
  // ── 矽中介層：半透明矽本體＋上表面 RDL 細線＋前緣一排 TSV；原點＝底面中心 ──
  interposer(o, c) {
    const w = o.w ?? 8.1, d = o.d ?? 5.2, t = o.t ?? 0.08, nr = o.rdl ?? 28;
    c.P("body", { shape: "box", size: [w, t, d], pos: [0, t / 2, 0], mat: "interposer" });
    if (nr) c.P("rdl", { shape: "box", size: [R2(w * 0.86), 0.006, 0.024], pos: [0, R2(t + 0.002), 0], at: Array.from({ length: nr }, (_, i) => [0, 0, R2((i - (nr - 1) / 2) * ((d * 0.86) / nr))]), mat: "rdl" });
    if (o.tsv !== false) c.P("tsv", { shape: "box", size: [0.022, R2(t * 0.96), 0.022], pos: [0, R2(t / 2), R2(d / 2 - 0.1)], at: Array.from({ length: o.tsvN ?? 60 }, (_, i) => [R2(-w / 2 + 0.12 + i * ((w - 0.24) / ((o.tsvN ?? 60) - 1))), 0, 0]), mat: "tsv" });
    c.anchor("", { p: [R2(-w / 2 + 0.3), t, R2(d / 2 - 0.2)], dx: -120, dy: 80 }); c.outline(w, d);
    c.act("rdlGlow", { type: "pulse", parts: c.ids("rdl"), color: "lp_proc", steady: true, glow: 0.95, halo: 0 }, ["proc"]);
  },
  // ── 有機基板：上增層→核心（厚）→下增層，側面看得到層；上面接點區與一圈去耦電容；原點＝底面中心 ──
  substrate(o, c) {
    const w = o.w ?? 11, d = o.d ?? 8.2, T = o.t ?? 0.55, L = [["sub", 0.05], ["copper", 0.012], ["sub", 0.05], ["copper", 0.012], ["sub2", 0.2], ["copper", 0.012], ["sub", 0.05], ["copper", 0.012], ["sub", 0.05]], sum = L.reduce((a, [, x]) => a + x, 0);
    let y = 0;
    L.forEach(([mat, t], i) => { const tt = R2((t * T) / sum); c.P(`l${i}`, { shape: "box", size: [mat === "copper" ? w - 0.02 : w, tt, mat === "copper" ? d - 0.02 : d], pos: [0, R2(y + tt / 2), 0], mat }); y += tt; });
    if (o.pads !== false) { const n = o.pads ?? [27, 17], p = o.pitch ?? 0.295; c.P("pads", { shape: "box", size: [0.12, 0.006, 0.12], pos: [0, R2(T + 0.003), 0], at: grid(n[0], n[1], p, p), mat: "pad" }); }
    if (o.caps !== false) {
      const at = []; for (let i = 0; i < 14; i++) { const x = R2(-w * 0.445 + i * (w * 0.89 / 13)); at.push([x, 0, R2(-d / 2 + 0.45)], [x, 0, R2(d / 2 - 0.45)]); }
      c.P("caps", { shape: "box", size: [0.3, 0.12, 0.16], pos: [0, R2(T + 0.06), 0], at, mat: "cap" });
    }
    c.anchor("", { p: [R2(w / 2), 0.3, R2(d / 2)], dx: 110, dy: 30 }); c.out.info.topY = R2(c.pos[1] + T); c.outline(w, d);
  },
  // ── 主機板（示意塊）：深綠板＋銅墊陣列＋幾條走線 ──
  pcb(o, c) {
    const w = o.w ?? 12.2, d = o.d ?? 9.4, t = o.t ?? 0.3;
    c.P("body", { shape: "box", size: [w, t, d], pos: [0, t / 2, 0], mat: "pcb" });
    if (o.pads !== false) c.P("pads", { shape: "box", size: [0.2, 0.006, 0.2], pos: [0, R2(t + 0.003), 0], at: grid(...(o.pads ?? [22, 17]), 0.47, 0.47), mat: "pcbCu" });
    c.P("traces", { shape: "box", size: [1.3, 0.006, 0.05], pos: [0, R2(t + 0.003), 0], at: Array.from({ length: 10 }, (_, i) => [R2(i < 5 ? -w * 0.467 : w * 0.467), 0, R2(-d * 0.42 + (i % 5) * 0.5)]), mat: "pcbCu" });
    c.anchor("", { p: [R2(-w / 2 + 0.1), t, R2(d / 2 - 0.5)], dx: -110, dy: 60 }); c.out.info.topY = R2(c.pos[1] + t); c.outline(w, d);
  },
  // ── HBM 記憶體堆疊：底部邏輯晶片＋n 層薄片（兩色交錯，側面看得到層）＋頂蓋＋底下微凸塊。slices:true＝每片自己一層（<id>_s0…），拿來「逐層堆疊」 ──
  hbm(o, c) {
    const w = o.w ?? 1.1, T = o.t ?? 0.32, n = o.n ?? 12, bt = 0.044, sl = R2((T - bt) / n);
    c.P("base", { shape: "box", size: [R2(w + 0.06), bt, R2(w + 0.06)], pos: [0, bt / 2, 0], mat: "hbmBase" });
    c.P("bumps", { shape: "cyl", size: [0.045, 0.03], rot: V, pos: [0, -0.015, 0], at: grid(5, 5, 0.19, 0.19), mat: "ubump" });
    if (o.slices) {
      const ids = [];
      for (let i = 0; i < n; i++) { const L = `${c.id}_s${i}`; c.L(L); ids.push(L); c.P(`s${i}`, { layer: L, shape: "box", size: [w, R2(sl * 0.86), w], pos: [0, R2(bt + sl * (i + 0.5)), 0], mat: i % 2 ? "hbm2" : "hbm" }); if (i === n - 1) c.P("top", { layer: L, shape: "box", size: [R2(w - 0.12), 0.004, R2(w - 0.12)], pos: [0, R2(T + 0.002), 0], mat: "hbmTop" }); }
      c.out.info.sliceLayers = ids;
    } else {
      c.P("slA", { shape: "box", size: [w, R2(sl * 0.86), w], pos: [0, R2(bt + sl / 2), 0], at: Array.from({ length: Math.ceil(n / 2) }, (_, i) => [0, R2(i * 2 * sl), 0]), mat: "hbm" });
      c.P("slB", { shape: "box", size: [w, R2(sl * 0.86), w], pos: [0, R2(bt + sl * 1.5), 0], at: Array.from({ length: Math.floor(n / 2) }, (_, i) => [0, R2(i * 2 * sl), 0]), mat: "hbm2" });
      c.P("top", { shape: "box", size: [R2(w - 0.12), 0.004, R2(w - 0.12)], pos: [0, R2(T + 0.002), 0], mat: "hbmTop" });
    }
    c.anchor("", { p: [R2(w / 2), T, 0], dx: 110, dy: 60 }); c.outline(w, w);
    c.act("glow", { type: "pulse", parts: c.ids("sl", "s", "top"), color: "lp_proc", freq: 2.4, glow: 0.7, halo: 0 }, ["proc"]);
  },
  // ── 逐層堆疊：layers＝[{ t 厚度, mat 材質短名, w, d, name }]，由下到上；每一層自己一個層 <id>_l<i>，拿來 stack-up 動作一層層落下 ──
  stack(o, c) {
    let y = 0; const ids = [];
    (o.layers ?? [{ t: 0.1, mat: "silicon" }, { t: 0.1, mat: "pcb" }]).forEach((l, i) => { const L = `${c.id}_l${i}`; c.L(L); ids.push(L); c.P(`l${i}`, { layer: L, shape: "box", size: [l.w ?? o.w ?? 3, l.t, l.d ?? o.d ?? 3], pos: [0, R2(y + l.t / 2), 0], mat: l.mat ?? "silicon" }); y += l.t + (o.gap ?? 0); });
    c.out.info.sliceLayers = ids; c.out.info.topY = R2(c.pos[1] + y); c.anchor("", { p: [R2((o.w ?? 3) / 2), y, 0], dx: 100, dy: 50 }); c.outline(o.w ?? 3, o.d ?? 3);
  },
  // ── 吸嘴（取放頭）：原點＝吸嘴底面；上面依序是吸嘴、頭、升降臂、真空軟管。動作 suck＝吸住時嘴尖亮綠 ──
  nozzle(o, c) {
    const s = o.scale ?? 1, tr = R2(0.22 * s);
    c.P("tip", { shape: "cyl", size: [tr, R2(0.16 * s)], rot: V, pos: [0, R2(0.08 * s), 0], mat: "dark" });
    c.P("body", { shape: "cyl", size: [R2(0.32 * s), R2(0.6 * s)], rot: V, pos: [0, R2(0.46 * s), 0], mat: "steel" });
    c.P("arm", { shape: "box", size: [R2(0.18 * s), R2(1.3 * s), R2(0.18 * s)], pos: [0, R2(1.4 * s), 0], mat: "steel2" });
    c.P("hose", { shape: "box", size: [R2(0.1 * s), R2(0.9 * s), R2(0.1 * s)], pos: [R2(0.35 * s), R2(1.1 * s), R2(0.1 * s)], mat: "hose" });
    c.anchor("", { p: [0, R2(1.0 * s), 0], dx: 70, dy: -120 }); c.outline(1, 1);
    c.act("suck", { type: "pulse", parts: c.ids("tip"), color: "lp_good", steady: true, glow: 0.95, halo: 0 }, ["good"]);
    // 熱壓接合時壓頭加熱（press-bond 會用）：嘴尖、嘴身、升降臂發橘
    c.act("heat", { type: "pulse", parts: c.ids("tip", "body", "arm"), color: "lp_heat", steady: true, glow: 0.85, halo: 0 }, ["heat"]);
  },
  // ── 機械手臂（水平多關節 SCARA，晶圓搬運手臂就是這型）：底座＋立柱＋肩 j1（大臂）→ 肘 j2（小臂，比大臂低一階）→ 腕 j3（抵消前兩節，夾爪方向不變）
  //   → 升降桿 lift（往下伸）→ 兩根手指 claw（往中間夾）。2026/11/17 起是真正的關節鏈（model.kin，src/components/three/kin.ts）：每一節是上一節的子物件，
  //   角度只在自己的局部座標轉，子節一定跟著父節走；被夾的東西由 arm-transfer 在夾住那一刻掛到夾爪上、放開那一刻放下。
  //   原點＝底座底面中心；伸直（全部 0）時夾爪在 x＝l1＋l2（＝取料位置，把手臂擺在讓夾爪剛好在料的正上方）。
  //   o.to＝[dx,dz]：放料位置相對取料位置的位移（解析式兩連桿反運動學算 j1、j2，超出可達範圍或關節上下限直接報錯）；也可直接寫 j1、j2（度）。肘朝哪邊折用 elbow(1｜-1)。
  //   o.gw＝要夾的東西的寬度（手指張開時內緣比它寬，夾住時剛好貼到兩側），預設 0.5。
  //   零件：<id>_base／column（不動）、shoulder／link1／elbow（j1）、link2／wristHub（j2）、quill／palm（lift）、fingerL／fingerR（claw）
  arm(o, c) {
    const h = o.h ?? 2.2, l1 = o.l1 ?? 2.4, l2 = o.l2 ?? 2.0, drop = o.drop ?? 0.9, gw = o.gw ?? 0.5, G = `${c.id}_grip`, step = 0.3;
    c.P("base", { shape: "cyl", size: [0.9, 0.35], rot: V, pos: [0, 0.175, 0], mat: "dark" });
    c.P("column", { shape: "cyl", size: [0.35, h], rot: V, pos: [0, R2(0.35 + h / 2), 0], mat: "steel" });
    const y = R2(0.35 + h), y2 = R2(y - step);           // 大臂中心高 y、小臂中心高 y2（SCARA 的小臂掛在大臂下面）
    c.P("shoulder", { shape: "cyl", size: [0.36, 0.42], rot: V, pos: [0, y, 0], mat: "steel2" });
    c.P("link1", { shape: "box", size: [l1, 0.26, 0.44], pos: [R2(l1 / 2), y, 0], mat: "steel" });
    c.P("elbow", { shape: "cyl", size: [0.27, R2(step + 0.34)], rot: V, pos: [l1, R2(y - step / 2), 0], mat: "steel2" });
    c.P("link2", { shape: "box", size: [l2, 0.24, 0.36], pos: [R2(l1 + l2 / 2), y2, 0], mat: "steel" });
    c.P("wristHub", { shape: "cyl", size: [0.2, 0.34], rot: V, pos: [R2(l1 + l2), y2, 0], mat: "steel2" });
    // 升降桿：上端藏在小臂裡（抬到最高也還插在腕座裡），下端接手掌
    const palmY = R2(y2 - 0.12 - drop - 0.06), qLen = R2(drop + 0.12 + 0.4);
    c.P("quill", { shape: "cyl", size: [0.07, qLen], rot: V, pos: [R2(l1 + l2), R2(palmY + 0.06 + qLen / 2), 0], mat: "steel2" });
    c.L(G);
    const fx = R2(gw / 2 + 0.05 + 0.12), fh = 0.34, fy = R2(palmY - 0.06 - fh / 2);
    c.P("palm", { layer: G, shape: "box", size: [R2(2 * fx + 0.2), 0.12, 0.36], pos: [R2(l1 + l2), palmY, 0], mat: "dark" });
    c.P("fingerL", { layer: G, shape: "box", size: [0.1, fh, 0.3], pos: [R2(l1 + l2 - fx), fy, 0], mat: "steel" });
    c.P("fingerR", { layer: G, shape: "box", size: [0.1, fh, 0.3], pos: [R2(l1 + l2 + fx), fy, 0], mat: "steel" });
    c.anchor("", { layer: c.layer, p: [R2(l1), y + 0.4, 0], dx: 110, dy: -80 });
    const W = (p) => add3(c.pos, p), fingerBottom = R2(c.pos[1] + fy - fh / 2);
    c.out.info.reachEnd = W([l1 + l2, fy - fh / 2, 0]);
    // 反運動學（解析式兩連桿）：平面座標 (X, Y) ＝ (x, −z)（繞 +y 轉正角＝從 +x 往 −z 轉）
    const LIM = { j1: [-170, 170], j2: [-150, 150], j3: [-340, 340] };
    let j1 = o.j1 ?? 0, j2 = o.j2 ?? 0;
    if (o.to) {
      const tx = l1 + l2 + o.to[0], ty = -o.to[1], d = Math.hypot(tx, ty);
      if (d > l1 + l2 - 1e-6 || d < Math.abs(l1 - l2) + 1e-6) throw new Error(`arm「${c.id}」夠不到 to=${JSON.stringify(o.to)}（可達距離 ${R2(Math.abs(l1 - l2))}～${R2(l1 + l2)}，要求 ${R2(d)}）`);
      const cb = (d * d - l1 * l1 - l2 * l2) / (2 * l1 * l2), b2 = (o.elbow ?? 1) * Math.acos(Math.max(-1, Math.min(1, cb)));
      const a1 = Math.atan2(ty, tx) - Math.atan2(l2 * Math.sin(b2), l1 + l2 * Math.cos(b2));
      j1 = R2((a1 * 180) / Math.PI); j2 = R2((b2 * 180) / Math.PI);
    }
    for (const [k, v] of [["j1", j1], ["j2", j2], ["j3", -(j1 + j2)]]) if (v < LIM[k][0] || v > LIM[k][1]) throw new Error(`arm「${c.id}」的 ${k}＝${R2(v)} 度超出關節上下限 ${LIM[k].join("～")}`);
    const yy = R2(c.pos[1] + y), yy2 = R2(c.pos[1] + y2);
    const lift = { min: R2(-0.35), max: R2(drop + 0.6) };
    c.kin({
      layer: c.layer, tip: "lift", size: R2(l1 + l2),
      grip: W([l1 + l2, R2(fy - fh / 2 + 0.05), 0]), // 夾持點＝兩指中間、指尖往上 0.05（夾住時這一點在物件裡面）
      joints: [
        { id: "j1", type: "rot", axis: [0, 1, 0], pivot: W([0, y, 0]), parts: c.ids("shoulder", "link1", "elbow"), min: LIM.j1[0], max: LIM.j1[1] },
        { id: "j2", parent: "j1", type: "rot", axis: [0, 1, 0], pivot: W([l1, y2, 0]), parts: c.ids("link2", "wristHub"), min: LIM.j2[0], max: LIM.j2[1] },
        { id: "j3", parent: "j2", type: "rot", axis: [0, 1, 0], pivot: W([l1 + l2, y2, 0]), parts: [], min: LIM.j3[0], max: LIM.j3[1] },
        { id: "lift", parent: "j3", type: "slide", axis: [0, -1, 0], parts: c.ids("quill", "palm"), min: lift.min, max: lift.max },
        { id: "clawL", parent: "lift", type: "slide", axis: [1, 0, 0], drive: "claw", parts: c.ids("fingerL"), min: 0, max: 0.13 },
        { id: "clawR", parent: "lift", type: "slide", axis: [-1, 0, 0], drive: "claw", parts: c.ids("fingerR"), min: 0, max: 0.13 },
      ],
      body: c.ids(""),
      info: { place: { j1, j2, j3: R2(-(j1 + j2)) }, fingerBottom, close: 0.12, gw, liftMax: lift.max },
    });
    c.out.info.joints = { j1, j2, j3: R2(-(j1 + j2)) };
  },
  // ── 探針頭：原點＝針尖；由下往上＝探針（細線）→兩片導板→小電路板→排線，旁邊立柱。動作 test＝測試電流沿針流下 ──
  probe(o, c) {
    c.P("pins", { shape: "box", size: [0.018, 0.86, 0.018], pos: [0, 0.43, 0], at: grid(6, 8, 0.2, 0.2), mat: "steel2" });
    c.P("guide", { shape: "box", size: [1.5, 0.05, 1.8], pos: [0, 0.72, 0], at: [[0, 0, 0], [0, -0.3, 0]], mat: "steel" });
    c.P("board", { shape: "box", size: [1.9, 0.14, 2.2], pos: [0, 1.08, 0], mat: "pcb" });
    c.P("cu", { shape: "box", size: [1.5, 0.006, 0.04], pos: [0, 1.153, 0], at: Array.from({ length: 6 }, (_, i) => [0, 0, R2(-0.8 + i * 0.32)]), mat: "pcbCu" });
    c.P("cable", { shape: "box", size: [0.5, 0.9, 0.14], pos: [0, 1.6, -0.3], mat: "hose" });
    c.P("post", { shape: "box", size: [0.2, 1.4, 0.2], pos: [0, 1.85, -1.25], mat: "steel2" });
    c.anchor("", { p: [-0.95, 1.08, 0], dx: -110, dy: -90 }); c.outline(2, 2);
    const [x, y, z] = c.pos;
    c.act("test", { type: "flow", layer: c.layer, path: [[x, R2(y + 1.0), z], [x, R2(y + 0.05), z]], n: 4, lanes: 3, laneGap: 0.4, laneDir: [1, 0, 0], size: 0.06, shape: "dot", rate: 1.6, color: "lp_sig", rim: "lp_sigRim", rimScale: 1.6, rimO: 0.45, trail: 3, trailGap: 0.03, trailColor: "lp_sig" }, ["sig", "sigRim"]);
  },
  // ── 光束：from→to（絕對座標）的一根細圓柱（不受光、半透明）；color＝beam（紅雷射）／beamEuv（紫）。動作 glow＝閃、ray＝光點沿光束跑 ──
  beam(o, c) {
    const a = o.from ?? [0, 3, 0], b = o.to ?? [0, 0, 0], r = o.r ?? 0.06, A = aim(a, b), mat = o.color ?? "beam";
    c.P("core", { shape: "cyl", size: [r, R2(A.len)], rot: A.rot, pos: A.mid, mat, abs: true });
    if (o.halo !== false) c.P("halo", { shape: "cyl", size: [R2(r * 2.6), R2(A.len)], rot: A.rot, pos: A.mid, mat, abs: true });
    c.anchor("", { p: A.mid, dx: 100, dy: -70, abs: true });
    c.act("glow", { type: "pulse", parts: c.ids("core", "halo"), color: "lp_proc", freq: 3, glow: 0.8, halo: 0 }, ["proc"]);
    c.act("ray", { type: "flow", layer: c.layer, path: [a, b], n: 5, size: R2(r * 1.6), shape: "dot", rate: 1.2, color: "lp_proc", track: false }, ["proc"]);
  },
  // ── 腔體：沿 x 躺著的圓筒（半透明玻璃）＋兩端法蘭＋螺栓圈＋肋＋兩個鞍座；原點＝圓筒中心 ──
  chamber(o, c) {
    const r = o.r ?? 2.6, len = o.len ?? 6, nb = o.bolts ?? 14, fx = R2(len / 2 + 0.1);
    c.P("vessel", { shape: "cyl", size: [r, len], rot: [0, 90, 0], pos: [0, 0, 0], mat: "glass" });
    c.P("flange", { shape: "tube", size: [R2(r + 0.55), R2(r - 0.2), 0.6], rot: [0, 90, 0], pos: [0, 0, 0], at: [[-fx, 0, 0], [fx, 0, 0]], mat: "steel" });
    c.P("ribs", { shape: "tube", size: [R2(r + 0.25), R2(r - 0.05), 0.25], rot: [0, 90, 0], pos: [0, 0, 0], at: [[R2(-len * 0.25), 0, 0], [R2(len * 0.25), 0, 0]], mat: "steel" });
    const bolts = []; for (const x of [-fx, fx]) for (let i = 0; i < nb; i++) { const t = (i / nb) * Math.PI * 2; bolts.push([x, R2((r + 0.22) * Math.sin(t)), R2((r + 0.22) * Math.cos(t))]); }
    c.P("bolts", { shape: "cyl", size: [0.16, 0.9], rot: [0, 90, 0], pos: [0, 0, 0], at: bolts, mat: "dark" });
    c.P("saddle", { shape: "box", size: [1.4, R2(r * 0.5), R2(r * 1.6)], pos: [0, R2(-r - r * 0.25), 0], at: [[R2(-len * 0.3), 0, 0], [R2(len * 0.3), 0, 0]], mat: "steel2" });
    c.anchor("", { p: [0, r, 0], dx: 0, dy: -130 }); c.outline(len + 1.4, r * 2.4);
  },
  // ── 管線：path（絕對座標折線）＋半徑 r；每個轉角放一顆接頭球。動作 flow＝液體／氣體沿管流動 ──
  pipe(o, c) {
    const pts = o.path ?? [[0, 0, 0], [3, 0, 0]], r = o.r ?? 0.14;
    pts.slice(1).forEach((q, i) => { const A = aim(pts[i], q); c.P(`seg${i}`, { shape: "cyl", size: [r, R2(A.len)], rot: A.rot, pos: A.mid, mat: o.mat ?? "hose", abs: true }); });
    pts.slice(1, -1).forEach((q, i) => c.P(`joint${i}`, { shape: "sphere", size: [R2(r * 1.25)], pos: q, mat: "steel", abs: true }));
    c.anchor("", { p: pts[Math.floor(pts.length / 2)], dx: 100, dy: -70, abs: true });
    c.act("flow", { type: "flow", layer: c.layer, path: pts, n: o.n ?? 6, size: R2(r * 0.7), shape: "dot", rate: 0.7, color: o.flowColor ?? "lp_sig", rim: "lp_sigRim", rimScale: 1.5, rimO: 0.5, track: false }, ["sig", "sigRim"]);
  },
  // ── 散熱片：底板＋n 片鰭片；原點＝底板底面中心。動作 heat＝熱從底板往鰭片擴散（鰭片發橘＋底板往上一圈圈熱浪） ──
  heatsink(o, c) {
    const w = o.w ?? 4, d = o.d ?? 4, bt = o.base ?? 0.2, n = o.fins ?? 9, fh = o.finH ?? 1.1, ft = o.finT ?? 0.08;
    c.P("base", { shape: "box", size: [w, bt, d], pos: [0, bt / 2, 0], mat: "steel" });
    c.P("fins", { shape: "box", size: [ft, fh, R2(d * 0.92)], pos: [0, R2(bt + fh / 2), 0], at: Array.from({ length: n }, (_, i) => [R2((i - (n - 1) / 2) * ((w - 0.3) / (n - 1))), 0, 0]), mat: "fin" });
    c.anchor("", { p: [R2(w / 2), R2(bt + fh), 0], dx: 110, dy: -60 }); c.outline(w, d);
    c.act("heat", { type: "pulse", parts: c.ids("base", "fins"), color: "lp_heat", glow: 0.75, halo: 0, steady: true }, ["heat"]);
    c.act("waves", { type: "wave", from: add3(c.pos, [0, bt, 0]), dir: [0, 1, 0], reach: R2(fh + 0.8), count: 3, r0: R2(w * 0.12), spread: 0.9, rate: 0.8, color: "lp_heat", width: 0.05 }, ["heat"]);
  },
  // ── 輸送軌：沿 x 的軌床＋兩側護欄＋滾輪＋腳；原點＝軌面中心（東西放在 y＝0 上面）；len 長、w 寬。
  //   每支滾輪是獨立零件（r0、r1…，各自繞自己的軸心轉），滾輪上有一條亮標記才看得出在轉。動作 roll＝所有滾輪一起轉（rps 每秒圈數，有起轉與停轉的加減速） ──
  rail(o, c) {
    const len = o.len ?? 12, w = o.w ?? 2.1, n = Math.max(3, Math.round(len / 0.7)), rr = 0.13;
    const xs = Array.from({ length: n }, (_, i) => R2(-len / 2 + 0.45 + i * ((len - 0.9) / (n - 1))));
    c.P("bed", { shape: "box", size: [len, 0.12, R2(w - 0.1)], pos: [0, -0.34, 0], mat: "rail" });
    c.P("side", { shape: "box", size: [len, 0.22, 0.12], pos: [0, -0.06, 0], at: [[0, 0, R2(-w / 2 - 0.03)], [0, 0, R2(w / 2 + 0.03)]], mat: "steel2" });
    c.P("r", { shape: "cyl", size: [rr, R2(w - 0.1)], pos: [0, -0.12, 0], at: xs.map((x) => [x, 0, 0]), mat: "roller", split: true });
    c.P("rmark", { shape: "box", size: [0.05, 0.05, R2(w - 0.06)], pos: [0, -0.12, 0], at: xs.map((x) => [R2(x + rr * 0.8), 0, 0]), mat: "binEdge", split: true });
    const lh = o.legH ?? 1.2; c.P("legs", { shape: "box", size: [0.24, lh, 0.24], pos: [0, R2(-0.4 - lh / 2), 0], at: [[R2(-len * 0.45), 0, R2(-w * 0.4)], [R2(-len * 0.45), 0, R2(w * 0.4)], [R2(len * 0.45), 0, R2(-w * 0.4)], [R2(len * 0.45), 0, R2(w * 0.4)]], mat: "steel2" });
    c.anchor("", { p: [R2(-len / 2), 0, R2(w / 2)], dx: -60, dy: 110 }); c.outline(len, w + 1);
    // 每個標記繞自己滾輪的軸心轉（pivots）；滾輪本身是圓柱，繞自己轉看不出來，標記才轉得出來
    const pivots = {}; xs.forEach((x, i) => { pivots[`${c.id}_rmark${i}`] = add3(c.pos, [x, -0.12, 0]); });
    c.act("roll", { type: "rotate", parts: c.ids("rmark"), axis: [0, 0, 1], rps: o.rps ?? 1.1, rampSpin: true, pivots });
  },
  // ── 廢料盒：敞口淺盒（紅邊）；原點＝盒底中心 ──
  bin(o, c) {
    const w = o.w ?? 2.4, d = o.d ?? 1.8, h = o.h ?? 0.5;
    c.P("floor", { shape: "box", size: [w, 0.1, d], pos: [0, 0.05, 0], mat: "bin" });
    c.P("wallX", { shape: "box", size: [w, h, 0.08], pos: [0, R2(h / 2 + 0.05), 0], at: [[0, 0, R2(-d / 2 + 0.04)], [0, 0, R2(d / 2 - 0.04)]], mat: "bin" });
    c.P("wallZ", { shape: "box", size: [0.08, h, d], pos: [0, R2(h / 2 + 0.05), 0], at: [[R2(-w / 2 + 0.04), 0, 0], [R2(w / 2 - 0.04), 0, 0]], mat: "bin" });
    c.P("rim", { shape: "box", size: [R2(w + 0.1), 0.06, 0.1], pos: [0, R2(h + 0.08), 0], at: [[0, 0, R2(-d / 2)], [0, 0, R2(d / 2)]], mat: "binEdge" });
    c.anchor("", { p: [R2(w / 2), h, R2(d / 2)], dx: 110, dy: 60 }); c.outline(w, d);
  },
  // ── 切割刀片：立在 xy 平面的圓盤（刀口紅邊＋轉動標記），原點＝圓心；動作 spin＝高速旋轉 ──
  blade(o, c) {
    const r = o.r ?? 1.2, t = o.t ?? 0.05;
    c.P("disc", { shape: "cyl", size: [r, t], pos: [0, 0, 0], mat: "blade" });
    c.P("edge", { shape: "tube", size: [r, R2(r - 0.08), R2(t * 1.3)], pos: [0, 0, 0], mat: "bladeEdge" });
    c.P("hub", { shape: "cyl", size: [R2(r * 0.22), R2(t * 3)], pos: [0, 0, 0], mat: "steel2" });
    c.P("marks", { shape: "box", size: [0.1, R2(r * 0.34), R2(t * 1.6)], pos: [0, 0, 0], at: Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return [R2(r * 0.62 * Math.cos(a)), R2(r * 0.62 * Math.sin(a)), 0]; }), mat: "dark" });
    c.anchor("", { p: [0, r, 0], dx: 80, dy: -90 }); c.outline(r * 2, 0.4);
    c.act("spin", { type: "rotate", parts: c.ids("marks"), axis: [0, 0, 1], rps: o.rps ?? 3, rampSpin: true });
    // 冷卻水：兩支水管從刀片兩側斜斜噴向刀口（切割時一定要有水：降溫、沖掉矽屑）。動作 coolant＝水珠沿噴嘴流向刀口（跟著刀片的層移動）
    const [bx, by, bz] = c.pos, jets = [0.32, -0.32].map((dz) => [[R2(bx - r * 1.15), R2(by + r * 0.85), R2(bz + dz)], [R2(bx - r * 0.12), R2(by - r * 0.95), R2(bz + dz * 0.1)]]);
    jets.forEach(([a, b], i) => { const A = aim(a, b); c.P(`jet${i}`, { shape: "cyl", size: [0.05, R2(A.len * 0.45)], rot: A.rot, pos: [R2(a[0] + (b[0] - a[0]) * 0.22), R2(a[1] + (b[1] - a[1]) * 0.22), R2(a[2] + (b[2] - a[2]) * 0.22)], mat: "steel", abs: true }); });
    c.act("coolant", { type: "flow", layer: c.layer, path: [[R2(bx - r * 1.15), R2(by + r * 0.85), bz], [R2(bx - r * 0.12), R2(by - r * 0.95), bz]], n: 7, lanes: 2, laneGap: 0.64, laneDir: [0, 0, 1], size: 0.045, shape: "dot", rate: 1.6, color: "lp_water", rim: "lp_sigRim", rimScale: 1.5, rimO: 0.35, trail: 2, trailGap: 0.03, trailColor: "lp_water", track: false }, ["water", "sigRim"]);
  },
  // ── 檢測頭（相機／感測器）：原點＝鏡頭底面；上面是機身與吊臂，下面可以拉一道細光（ray＝長度，0＝不要）。動作 sweep＝左右掃、glow＝光閃 ──
  sensor(o, c) {
    const ray = o.ray ?? 0;
    c.P("lens", { shape: "cyl", size: [0.2, 0.3], rot: V, pos: [0, 0.15, 0], mat: "lens" });
    c.P("body", { shape: "box", size: [1.2, 0.5, 0.9], pos: [0, 0.55, 0], mat: "sensor" });
    c.P("mount", { shape: "box", size: [0.2, 1.4, 0.2], pos: [0, 1.5, 0], mat: "steel2" });
    if (ray) c.P("ray", { shape: "cyl", size: [0.03, ray], rot: V, pos: [0, R2(-ray / 2), 0], mat: "beam" });
    c.anchor("", { p: [0.6, 0.6, 0], dx: 100, dy: -90 }); c.outline(1.2, 1);
    c.act("sweep", { type: "vibrate", parts: c.ids("lens", "body", "mount", "ray"), axis: [1, 0, 0], amp: o.sweepAmp ?? 2.2, freq: o.sweepFreq ?? 0.6 });
    c.act("glow", { type: "pulse", parts: c.ids("lens", "ray"), color: "lp_proc", freq: 3, glow: 0.8, halo: 0 }, ["proc"]);
  },
  // ── 光罩台（EUV 掃描機的 reticle stage，抽自 tech-euv）：上方兩條導軌＋成排磁鐵（不動）、移動台＋兩顆線性馬達、反射式光罩（朝下）＋四個夾具＋護膜框。
  //   原點＝光罩下表面中心。w＝移動台寬、len＝導軌長、mw＝光罩邊長。動作 scan＝移動台沿 x 來回掃（光罩跟著動）、drive＝磁鐵與馬達通電發光 ──
  maskstage(o, c) {
    const w = o.w ?? 15, len = o.len ?? 24, mw = o.mw ?? 6.4, nm = Math.round(len - 2), by = 0.225;
    c.P("rail", { shape: "slab", size: [len, 0.5, 1.0], r: 0.15, pos: [0, 2.275, 0], at: [[0, 0, -3.9], [0, 0, 3.9]], mat: "steel" });
    c.P("mag", { shape: "slab", size: [0.62, 0.35, 1.1], r: 0.06, pos: [0, 2.675, 0], at: Array.from({ length: nm }, (_, i) => [[R2(-(nm - 1) / 2 + i), 0, -3.9], [R2(-(nm - 1) / 2 + i), 0, 3.9]]).flat(), mat: "dark" });
    c.P("stage", { shape: "slab", size: [w, 1.4, 9], r: 0.4, bevel: 0.1, pos: [0, 1.175, 0], mat: "stage" });
    c.P("motor", { shape: "slab", size: [2.4, 1.0, 9.4], r: 0.2, pos: [0, 1.675, 0], at: [[R2(-w * 0.43), 0, 0], [R2(w * 0.43), 0, 0]], mat: "dark" });
    c.P("mask", { shape: "slab", size: [mw, 0.45, mw], r: 0.2, pos: [0, by, 0], mat: "mask" });
    c.P("clamp", { shape: "box", size: [0.8, 0.5, 0.8], pos: [0, 0.575, 0], at: [[-3.4, 0, -3.4], [3.4, 0, -3.4], [-3.4, 0, 3.4], [3.4, 0, 3.4]].map(([x, y, z]) => [R2(x * mw / 6.8), y, R2(z * mw / 6.8)]), mat: "dark" });
    c.P("pellicle", { shape: "ring", size: [R2(mw * 0.94), R2(mw * 0.94), 0.3], r: 0.2, wall: 0.25, rot: [90, 0, 0], pos: [0, -0.225, 0], mat: "steel" });
    c.anchor("", { p: [R2(mw / 2), by, R2(mw / 2)], dx: 120, dy: 70 }); c.outline(len, 9);
    c.act("scan", { type: "vibrate", parts: c.ids("stage", "motor", "mask", "clamp", "pellicle"), axis: [1, 0, 0], amp: o.amp ?? 1.6, freq: o.freq ?? 0.4 });
    c.act("drive", { type: "pulse", parts: c.ids("mag", "motor"), color: "lp_sig", steady: true, glow: 0.6, halo: 0 }, ["sig"]);
  },
  // ── 反射鏡面陣列（EUV 的場鏡面／瞳鏡面，抽自 tech-euv 的 facetPlate）：底板＋n×n 片小鏡面；tilt＝整片繞 z 傾斜（度，鏡面法線從 +y 往 −x 偏），原點＝鏡面板中心。動作 glint＝鏡面亮起（反射光） ──
  mirrorarray(o, c) {
    const w = o.w ?? 4.2, n = o.n ?? 4, fs = o.fs ?? 0.9, a = ((o.tilt ?? 0) * Math.PI) / 180, t = [Math.cos(a), Math.sin(a)], nv = [-Math.sin(a), Math.cos(a)], st = w / n;
    c.P("plate", { shape: "slab", size: [w, 0.45, w], r: 0.2, rot: [0, 0, o.tilt ?? 0], pos: [R2(-nv[0] * 0.3), R2(-nv[1] * 0.3), 0], mat: "steel" });
    const at = []; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const u = (i - (n - 1) / 2) * st, v = (j - (n - 1) / 2) * st; at.push([R2(t[0] * u + nv[0] * 0.05), R2(t[1] * u + nv[1] * 0.05), R2(v)]); }
    c.P("facets", { shape: "slab", size: [fs, 0.28, fs], r: 0.08, rot: [0, 0, o.tilt ?? 0], pos: [0, 0, 0], at, mat: "facet" });
    c.P("arm", { shape: "cyl", size: [0.22, 1.8], rot: [90, 0, o.tilt ?? 0], pos: [R2(-nv[0] * 1.3), R2(-nv[1] * 1.3), 0], mat: "dark" });
    c.anchor("", { p: [R2(nv[0] * 0.4), R2(nv[1] * 0.4 + 0.2), R2(w / 2)], dx: 100, dy: -90 }); c.outline(w, w);
    c.act("glint", { type: "pulse", parts: c.ids("facets"), color: "lp_proc", freq: o.freq ?? 2, glow: 0.7, halo: 0 }, ["proc"]);
  },
  // ── 對位框（抽自 tech-packaging 的 rectLines）：水平放的矩形框線（橘色，不受光）；w×d、dash＞0＝虛線（每段長度）、t＝線寬。原點＝框中心（y＝所在高度）。動作 glow＝框閃（對位對準的提示） ──
  alignframe(o, c) {
    const w = o.w ?? 3, d = o.d ?? 3, t = o.t ?? 0.03, dash = o.dash ?? 0;
    if (!dash) {
      c.P("H", { shape: "box", size: [w, 0.01, t], pos: [0, 0, 0], at: [[0, 0, R2(-d / 2)], [0, 0, R2(d / 2)]], mat: "frame" });
      c.P("V", { shape: "box", size: [t, 0.01, d], pos: [0, 0, 0], at: [[R2(-w / 2), 0, 0], [R2(w / 2), 0, 0]], mat: "frame" });
    } else {
      const nh = Math.round(w / dash / 2), nv = Math.round(d / dash / 2), sh = [], sv = [];
      for (let i = 0; i < nh; i++) { const x = R2(-w / 2 + (i + 0.5) * (w / nh)); sh.push([x, 0, R2(-d / 2)], [x, 0, R2(d / 2)]); }
      for (let i = 0; i < nv; i++) { const z = R2(-d / 2 + (i + 0.5) * (d / nv)); sv.push([R2(-w / 2), 0, z], [R2(w / 2), 0, z]); }
      c.P("H", { shape: "box", size: [R2((w / nh) * 0.55), 0.012, t], pos: [0, 0, 0], at: sh, mat: "frame" });
      c.P("V", { shape: "box", size: [t, 0.012, R2((d / nv) * 0.55)], pos: [0, 0, 0], at: sv, mat: "frame" });
    }
    c.anchor("", { p: [R2(w / 2), 0, R2(d / 2)], dx: 90, dy: 60 }); c.outline(w, d);
    c.act("glow", { type: "pulse", parts: c.ids("H", "V"), color: "lp_proc", freq: 3, glow: 0.8, halo: 0 }, ["proc"]);
  },
};
export const PART_NAMES = Object.keys(PARTS);
