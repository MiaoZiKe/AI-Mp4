// 動作組合預設。兩層：
//  ① 模型層（model.json 的 actions）：{ "preset": "current", ... } 展開成引擎認得的 actions（八種 type 之一或多個）。
//  ② 腳本層（script.json 某一幕 props.motion）：{ "preset": "pick-place", ... } 展開成該幕的 props.shift（層的位移）＋props.run（觸發動作）。
//  at／until 一律寫 cue（"cue"、"cue+8"、"s4:cue-4"，同引擎）；下面的偏移是「幀」（30 fps），參數 k 可以整體放慢（k＝2 就慢一倍）。
import { LIB_PALETTE } from "./materials.mjs";

/** 色名：庫裡的短名（proc、sig、heat…）→ lp_ 前綴；已經有前綴或是色碼就原樣 */
const lc = (x) => (typeof x === "string" && LIB_PALETTE[x] ? `lp_${x}` : x);
const usedColors = new Set();
const C = (x) => { const y = lc(x); if (typeof y === "string" && y.startsWith("lp_") && LIB_PALETTE[y.slice(3)]) usedColors.add(y.slice(3)); return y; };
export const takeColors = () => { const a = [...usedColors]; usedColors.clear(); return a; };

/** cue 字串加幀數："s4:test+12" + 5 → "s4:test+17" */
export const off = (at, n) => {
  const m = /^(.*?)([+-]\d+)?$/.exec(String(at)), t = Math.round(Number(m[2] ?? 0) + n);
  return `${m[1]}${t >= 0 ? "+" : "-"}${Math.abs(t)}`;
};
const R3 = (x) => Math.round(x * 1000) / 1000;

// ─────────── ① 模型層預設：回傳 { 後綴: ActionDef }，後綴 "" ＝ 這個鍵本身 ───────────
export const ACTION_PRESETS = {
  /** 電流流動：沿 path（絕對座標折線）跑一串帶拖尾與外圈的亮點 */
  current: (o) => ({ "": { type: "flow", layer: o.layer, path: o.path, n: o.n ?? 4, lanes: o.lanes ?? 1, laneGap: o.laneGap ?? 0.3, laneDir: o.laneDir, size: o.size ?? 0.07, shape: "dot", rate: o.rate ?? 1.4, color: C(o.color ?? "sig"), rim: C(o.rim ?? "sigRim"), rimScale: 1.6, rimO: 0.45, trail: o.trail ?? 3, trailGap: 0.03, trailColor: C(o.color ?? "sig"), drive: o.drive, track: o.track ?? true } }),
  /** 流體／資料沿路徑流（箭頭）：氣體、冷卻液、訊號方向 */
  stream: (o) => ({ "": { type: "flow", layer: o.layer, path: o.path, n: o.n ?? 6, size: o.size ?? 0.14, shape: o.shape ?? "arrow", rate: o.rate ?? 0.7, color: C(o.color ?? "proc"), track: o.track ?? false } }),
  /** 熱擴散：從 from 往外一圈圈熱浪（wave），parts 同時發橘光（<鍵>_glow） */
  "heat-spread": (o) => ({ "": { type: "wave", from: o.from, dir: o.dir ?? [0, 1, 0], reach: o.reach ?? 2, count: o.count ?? 3, r0: o.r0 ?? 0.6, spread: o.spread ?? 0.8, rate: o.rate ?? 0.8, color: C(o.color ?? "heat"), width: 0.05 }, ...(o.parts ? { _glow: { type: "pulse", parts: o.parts, color: C(o.color ?? "heat"), steady: true, glow: o.glow ?? 0.75, halo: 0 } } : {}) }),
  /** 發光（穩定亮著）：回流焊熔化、通電的線路 */
  glow: (o) => ({ "": { type: "pulse", parts: o.parts, color: C(o.color ?? "proc"), steady: o.steady ?? true, freq: o.freq, glow: o.glow ?? 0.9, halo: o.halo ?? 0 } }),
  /** 旋轉 */
  spin: (o) => ({ "": { type: "rotate", parts: o.parts, axis: o.axis ?? [0, 0, 1], rps: o.rps ?? 1, pivot: o.pivot } }),
  /** 振動／往復 */
  shake: (o) => ({ "": { type: "vibrate", parts: o.parts, axis: o.axis ?? [1, 0, 0], amp: o.amp ?? 0.2, freq: o.freq ?? 4 } }),
};

// ─────────── ② 腳本層預設：回傳 { shift: [], run: [] } ───────────
const S = (o) => { const x = { ...o }; for (const k of Object.keys(x)) if (x[k] === undefined) delete x[k]; return x; };
export const MOTIONS = {
  // 下面五個動作（取放、熱壓接合、逐層堆疊、切割、掃描檢測）照真實機台的節拍寫：有加速減速（位移都是緩入緩出）、有停頓（吸附、保壓、視覺定位）、有反作用（壓下時被壓的零件微壓縮）。
  // 每個的「真實機台怎麼做」與來源寫在 docs/three-parts.md 第三節。幀數是 30 fps，k 整體放慢（k＝2 慢一倍）。
  /** 取放（pick-and-place）：吸嘴下降 → 真空吸附（嘴尖亮、停一下）→ 上升 → 平移 → 停住（視覺定位量到偏差）→ 微調對位 → 下降 → 破真空放開（零件落下、被壓一下）→ 上升 → 回原位。約 126 幀。
   *  tool＝吸嘴的層、item＝被吸的層、to＝[dx, dz] 平移量、down＝吸嘴往下多少才碰到、lift＝抬多高、dyEnd＝放下後比原本高多少、press＝放下時被壓的層、
   *  align＝[ex, ez] 平移後的對位偏差（預設 [0.12, -0.08]，false＝不演微調）。 */
  "pick-place": (m, o, model) => {
    const k = o.k ?? 1, t = (n) => off(o.at, n * k), f = (n) => Math.max(1, Math.round(n * k)), down = o.down ?? 1.5, L = o.lift ?? 1.5, [dx, dz] = o.to ?? [3, 0], e = o.dyEnd ?? 0;
    const [ex, ez] = o.align === false ? [0, 0] : o.align ?? [0.12, -0.08], suck = o.suck ?? (model.actions?.[`${o.tool}_suck`] ? `${o.tool}_suck` : null), END = 104;
    return {
      shift: [
        // 吸嘴：下降（慢慢靠近）→ 停在零件上 → 上升
        S({ layer: o.tool, at: t(0), until: t(16), dy: -down, dur: f(10) }),
        S({ layer: o.tool, at: t(16), until: t(END), dy: L, dur: f(10) }),
        S({ layer: o.tool, at: t(28), until: t(END), dx: R3(dx + ex), dz: R3(dz + ez), dur: f(22) }),          // 平移（先到差一點的位置）
        S({ layer: o.tool, at: t(60), until: t(END), dx: -ex, dz: -ez, dur: f(8) }),                           // 看完（停 10 幀）後微調
        S({ layer: o.tool, at: t(70), until: t(90), dy: R3(e + 0.05 - L), dur: f(10) }),                       // 對位後下降
        S({ layer: o.tool, at: t(84), until: t(END), dy: 0.6, dur: f(8) }),                                    // 放開後先抬一點
        // 零件：吸附瞬間彈起貼上嘴尖，之後跟著吸嘴走
        S({ layer: o.item, at: t(14), dy: 0.03, dur: 2 }), S({ layer: o.item, at: t(16), dy: R3(L - 0.03), dur: f(10) }),
        S({ layer: o.item, at: t(28), dx: R3(dx + ex), dz: R3(dz + ez), dur: f(22) }), S({ layer: o.item, at: t(60), dx: -ex, dz: -ez, dur: f(8) }),
        S({ layer: o.item, at: t(70), dy: R3(e + 0.07 - L), dur: f(10) }),
        S({ layer: o.item, at: t(82), dy: -0.07, dur: 4, fallOut: true, bounce: 0.25, press: o.press, pressAmt: o.pressAmt ?? 0.012 }),   // 破真空：落下、被壓一下、小回彈
      ],
      run: suck ? [S({ id: suck, at: t(10), until: t(82), ramp: 3 })] : [],
    };
  },
  /** 熱壓接合（thermo-compression bonding）：壓頭先加熱 → 緩降到接觸 → 加壓（零件微壓縮、被壓的層下沉）→ 保壓數秒、凸塊熔化相連 → 冷卻（壓頭橘光慢慢退）→ 才抬起 → 通電測試。約 100 幀。
   *  tool＝壓頭層、down＝下降量、press＝被壓的層、sink＝保壓時被壓的層下沉量（預設 0.015）、melt＝熔化動作 id、current＝電流動作 id、heat＝壓頭加熱動作 id（預設 <tool>_heat）、hold＝保壓幀數（預設 54）。 */
  "press-bond": (m, o, model) => {
    const k = o.k ?? 1, t = (n) => off(o.at, n * k), f = (n) => Math.max(1, Math.round(n * k)), hold = o.hold ?? 54, sink = o.sink ?? 0.015, down = o.down ?? 0.3, lift = 18 + hold;
    const heat = o.heat ?? (model.actions?.[`${o.tool}_heat`] ? `${o.tool}_heat` : null), P = [].concat(o.press ?? []);
    return {
      shift: [
        S({ layer: o.tool, at: t(0), until: t(lift), dy: -(down - 0.05), dur: f(14) }),                                                               // 慢慢靠近
        S({ layer: o.tool, at: t(14), until: t(lift), dy: -0.05, dur: 3, fallOut: true, bounce: 0.1, press: P, pressAmt: o.pressAmt ?? 0.012 }),       // 接觸：被壓一下
        ...P.map((l) => S({ layer: l, at: t(17), until: t(lift - 2), dy: -sink, dur: f(6) })),                                                          // 保壓：被壓的層微微下沉
      ],
      run: [
        ...(heat ? [S({ id: heat, at: t(-14), until: t(lift - 6), ramp: f(14) })] : []),       // 先加熱（橘光漸亮），保壓結束後慢慢冷卻
        ...[].concat(o.melt ?? []).map((id) => S({ id, at: t(18), until: t(lift - 14), ramp: f(8) })),
        ...[].concat(o.current ?? []).map((id) => S({ id, at: t(lift + 4), until: t(lift + 30), ramp: 4 })),
      ],
    };
  },
  /** 逐層堆疊（每層都要「對位 → 放下 → 接合」）：layers（由下到上）依序從上方落下；落下時帶一點橫向偏差、在著地前修正（對位），著地後前一層被壓一下、bond[i] 動作亮起（接合）；
   *  先在 hide（預設該幕開頭）藏起來。gap＝每層間隔幀數（預設 16）、align＝[ex, ez]（預設 0.1，每層交替方向）、bond＝每層的接合動作 id 陣列（可省） */
  "stack-up": (m, o) => {
    const gap = o.gap ?? 16, [ax, az] = o.align === false ? [0, 0] : o.align ?? [0.1, 0.06];
    return {
      shift: o.layers.flatMap((l, i) => {
        const land = off(o.at, i * gap), sg = i % 2 ? -1 : 1;
        return [S({ layer: l, at: o.hide ?? "start-2", until: land, dy: o.from ?? 1.4, opacity: 0, dur: 12, fallIn: true, bounce: o.bounce ?? 0.03, press: o.press ?? (i ? [o.layers[i - 1]] : o.base), pressAmt: o.pressAmt ?? 0.01 }),
          ...(ax || az ? [S({ layer: l, at: o.hide ?? "start-2", until: land, dx: R3(ax * sg), dz: R3(az * sg), dur: 12 })] : [])];
      }),
      run: o.bond ? o.layers.flatMap((l, i) => [].concat(o.bond[i] ?? []).map((id) => S({ id, at: off(o.at, i * gap + 12), until: off(o.at, i * gap + 30), ramp: 5 }))) : [],
    };
  },
  /** 切割（blade dicing）：刀片先空轉升速、冷卻水先開 → 下刀（plunge）切進晶圓 → 沿切割道前進（緩入緩出）→ 抬刀 → 退回、降速；切完 after 裡的層（切下來的晶粒）各自微微分開。
   *  blade＝刀片層、len＝沿切割道走幾幀（預設 60）、dx／dz＝走多遠、depth＝下刀深度（預設 0.35）、coolant＝冷卻水動作 id（預設 <blade>_coolant）、spin＝轉動動作 id。 */
  cut: (m, o, model) => {
    const len = o.len ?? 60, d = o.depth ?? 0.35, cool = o.coolant ?? (model.actions?.[`${o.blade}_coolant`] ? `${o.blade}_coolant` : null);
    return {
      shift: [
        S({ layer: o.blade, at: off(o.at, -4), until: off(o.at, len + 14), dy: -d, dur: 12 }),              // 下刀 / 抬刀
        S({ layer: o.blade, at: off(o.at, 8), until: off(o.at, len + 28), dx: o.dx ?? 6, dz: o.dz ?? 0, dur: len }),   // 沿切割道走
        ...(o.after ?? []).map((a) => S({ dur: 8, ...a, at: off(o.at, len + 10) })),
      ],
      run: [S({ id: o.spin ?? `${o.blade}_spin`, at: off(o.at, -34), until: off(o.at, len + 24), ramp: 26 }), ...(cool ? [S({ id: cool, at: off(o.at, -20), until: off(o.at, len + 18), ramp: 8 })] : [])],
    };
  },
  /** 掃描檢測（inspection scan）：檢測頭沿 dz 掃過去，左右掃描（<tool>_sweep）、發光；掃到缺陷（stops 的位置，預設走到一半）就停下來，標記亮起（flag），停 stop 幀後繼續掃到底。
   *  tool＝檢測頭的層、len＝全程幀數、dz／dx＝走多遠、stops＝停在全程的幾成（陣列）、stop＝停幾幀（預設 12）、flag＝發現缺陷時亮起的動作 id（可多個，依序對應每個 stop）。 */
  scan: (m, o) => {
    const len = o.len ?? 90, stops = (o.stops ?? [0.5]).slice().sort((a, b) => a - b), pause = o.stop ?? 12, edges = [0, ...stops, 1], flags = [].concat(o.flag ?? []), shift = [], run = [];
    const total = len + pause * stops.length, END = total + 8;
    let cur = 0;
    for (let i = 0; i < edges.length - 1; i++) {
      const frac = edges[i + 1] - edges[i], dur = Math.max(4, Math.round(len * frac));
      shift.push(S({ layer: o.tool, at: off(o.at, cur), until: off(o.at, END), dx: R3((o.dx ?? 0) * frac), dz: R3((o.dz ?? 3) * frac), dur }));
      cur += dur;
      if (i < stops.length) { if (flags[i]) run.push(S({ id: flags[i], at: off(o.at, cur - 4), until: off(o.at, total + 24), ramp: 4 })); cur += pause; }
    }
    run.push(S({ id: `${o.tool}_sweep`, at: o.at, until: off(o.at, END), ramp: 8 }), S({ id: `${o.tool}_glow`, at: o.at, until: off(o.at, END), ramp: 8 }));
    return { shift, run };
  },
  /** 輸送前進一格：layers 整排往 dx 前進（dur 幀） */
  advance: (m, o) => ({ shift: o.layers.map((l) => S({ layer: l, at: o.at, dx: o.dx ?? 1.9, dz: o.dz, dur: o.dur ?? 10 })), run: [] }),
  /** 出現／消失：layers 在 at 之前藏起來（從 hide 開始），到 at 浮現；off 給了就在那個 cue 再藏起來 */
  reveal: (m, o) => ({
    shift: [].concat(o.layers ?? o.layer).flatMap((l) => [S({ layer: l, at: o.hide ?? "start-40", until: o.at, opacity: 0, dur: 2 }), ...(o.off ? [S({ layer: l, at: o.off, opacity: 0, dur: 6 })] : [])]),
    run: [],
  }),
  /** 手臂擺過去再回來（不夾東西）：肩 j1 轉 angle 度（預設 28）、夾爪下伸 grab 再抬起。關節鏈版（2026/11/17）。 */
  "arm-reach": (m, o, model) => {
    const k = o.k ?? 1, f = (n) => Math.round(n * k), A = o.arm, def = model.kin?.[A];
    if (!def) throw new Error(`arm-reach：model 裡沒有手臂「${A}」（零件 part: "arm"）`);
    const ang = o.angle ?? 28, g = o.grab ?? 0.5;
    return { shift: [], run: [], kin: [{ arm: A, at: o.at, keys: [[0, { j1: 0, lift: 0 }], [f(24), { j1: ang }], [f(34), { lift: g }], [f(46), { lift: 0 }], [f(70), { j1: 0 }]] }] };
  },
  /** 手臂搬運（水平多關節，關節鏈版 2026/11/17）：夾爪下伸 → 兩指夾緊（此刻物件掛到夾爪上）→ 抬起 → 肩、肘、腕同時水平迴轉（緩入緩出）到放料位
   *  → 下放到放料面 → 兩指張開（此刻放下）→ 抬起 → 手臂轉回。約 108 幀。
   *  arm＝手臂實例 id（model 裡 part: "arm"，給 to 或 j1／j2）、item＝被夾的層（整層一起走）、grab＝夾爪下伸量（預設依手指底和物件底自動算）、
   *  put＝放料面比取料面高多少（預設 0）、raise＝搬運時再抬高多少（預設 0.15）、press＝放下時被壓一下的層、k＝整體放慢倍數。 */
  "arm-transfer": (m, o, model) => {
    const k = o.k ?? 1, f = (n) => Math.round(n * k), A = o.arm, def = model.kin?.[A];
    if (!def) throw new Error(`arm-transfer：model 裡沒有手臂「${A}」（零件 part: "arm"）`);
    const inf = def.info, put = o.put ?? 0, pl = inf.place;
    let g = o.grab;
    if (g === undefined) {
      const ps = (model.parts ?? []).filter((p) => p.layer === o.item && p.shape === "box");
      if (!ps.length) throw new Error(`arm-transfer：item「${o.item}」這一層沒有方塊零件，請直接寫 grab`);
      const bottom = Math.min(...ps.map((p) => p.pos[1] - p.size[1] / 2));
      g = R3(inf.fingerBottom - (bottom + 0.02));
    }
    const up = R3(-(o.raise ?? 0.15)), close = inf.close;
    if (g > inf.liftMax || g - put > inf.liftMax) throw new Error(`arm-transfer：夾爪要下伸 ${g}，超過升降行程 ${inf.liftMax}（把手臂立柱 h 調低，或改 grab）`);
    const keys = [
      [0, { j1: 0, j2: 0, j3: 0, lift: 0, claw: 0 }],
      [f(12), { lift: g }], [f(18), { claw: close }], [f(24), {}], [f(34), { lift: up }],
      [f(58), { j1: pl.j1, j2: pl.j2, j3: pl.j3 }], [f(68), { lift: R3(g - put) }], [f(74), { claw: 0 }], [f(84), { lift: 0 }],
      [f(108), { j1: 0, j2: 0, j3: 0 }],
    ];
    return {
      shift: o.press ? [S({ layer: [].concat(o.press)[0], at: off(o.at, f(68)), dur: 2, dy: 0, fallOut: true, bounce: 0, press: [].concat(o.press), pressAmt: o.pressAmt ?? 0.012 })] : [],
      run: [],
      kin: [{ arm: A, at: o.at, keys, ...(o.item ? { carry: [{ layer: o.item, grab: f(18), release: f(68) }] } : {}) }],
    };
  },
  /** 一次觸發好幾個動作（熱擴散：晶片發熱、散熱片發橘、熱浪）；stagger＝每個晚幾幀 */
  run: (m, o) => ({ shift: [], run: o.ids.map((id, i) => S({ id, at: off(o.at, i * (o.stagger ?? 0)), until: o.until, ramp: o.ramp ?? 6, gain: o.gain, speed: o.speed })) }),
};
