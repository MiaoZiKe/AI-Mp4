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
  /** 取放：吸嘴下去 → 吸住（嘴尖亮）→ 抬起 → 平移 → 對位下降 → 放開（小回彈）→ 回原位。
   *  tool＝吸嘴的層、item＝被吸的層、to＝[dx, dz] 平移量、down＝吸嘴往下多少才碰到、lift＝抬多高、dyEnd＝放下後比原本高多少（預設 0）。約 52 幀。 */
  "pick-place": (m, o, model) => {
    const k = o.k ?? 1, t = (n) => off(o.at, n * k), down = o.down ?? 1.5, L = o.lift ?? 1.5, [dx, dz] = o.to ?? [3, 0], e = o.dyEnd ?? 0, f = (n) => Math.round(n * k);
    const suck = o.suck ?? (model.actions?.[`${o.tool}_suck`] ? `${o.tool}_suck` : null);
    return {
      shift: [
        S({ layer: o.tool, at: t(0), until: t(7), dy: -down, dur: f(6) }), S({ layer: o.tool, at: t(7), until: t(52), dy: L, dur: f(8) }), S({ layer: o.tool, at: t(16), until: t(52), dx, dz, dur: f(14) }),
        S({ layer: o.tool, at: t(32), until: t(42), dy: R3(e - L + 0.05), dur: f(7) }), S({ layer: o.tool, at: t(42), until: t(52), dy: 0.6, dur: f(6) }),
        S({ layer: o.item, at: t(6), dy: 0.03, dur: 2 }), S({ layer: o.item, at: t(7), dy: R3(L - 0.03), dur: f(8) }), S({ layer: o.item, at: t(16), dx, dz, dur: f(14) }),
        S({ layer: o.item, at: t(32), dy: R3(e + 0.07 - L), dur: f(7) }), S({ layer: o.item, at: t(39), dy: -0.07, dur: 4, fallOut: true, bounce: 0.25 }),
      ],
      run: suck ? [S({ id: suck, at: t(6), until: t(44), ramp: 2 })] : [],
    };
  },
  /** 下壓接合：tool 受力下壓（加速、碰到後回彈）→ press 裡的層被壓一下 → melt 動作（凸塊熔化發光）→ 冷卻。約 40 幀 */
  "press-bond": (m, o) => {
    const t = (n) => off(o.at, n * (o.k ?? 1));
    return {
      shift: [S({ layer: o.tool, at: t(0), until: t(16), dy: -(o.down ?? 0.3), dur: 6, fallOut: true, bounce: 0.12, press: o.press, pressAmt: o.pressAmt ?? 0.012 })],
      run: [...[].concat(o.melt ?? []).map((id) => S({ id, at: t(8), until: t(34), ramp: 5 })), ...[].concat(o.current ?? []).map((id) => S({ id, at: t(10), until: t(30), ramp: 4 }))],
    };
  },
  /** 逐層堆疊：layers（由下到上）依序從上方落下（受重力、小回彈、壓一下下面）；先在 hide（預設該幕開頭）藏起來 */
  "stack-up": (m, o) => ({
    shift: o.layers.map((l, i) => S({ layer: l, at: o.hide ?? "start-2", until: off(o.at, i * (o.gap ?? 4)), dy: o.from ?? 1.4, opacity: 0, dur: 9, fallIn: true, bounce: o.bounce ?? 0.03, press: o.press ?? (i ? [o.layers[i - 1]] : o.base), pressAmt: o.pressAmt ?? 0.01 })),
    run: [],
  }),
  /** 切割：blade 沿 dx／dz 切過去（len 幀），轉動（<blade>_spin）；切完 after 裡的層（切下來的晶粒）各自微微分開 */
  cut: (m, o) => {
    const len = o.len ?? 60;
    return {
      shift: [S({ layer: o.blade, at: o.at, until: off(o.at, len + 6), dx: o.dx ?? 6, dz: o.dz ?? 0, dur: len }), ...(o.after ?? []).map((a) => S({ dur: 8, ...a, at: off(o.at, len) }))],
      run: [S({ id: o.spin ?? `${o.blade}_spin`, at: off(o.at, -6), until: off(o.at, len + 10), ramp: 4 })],
    };
  },
  /** 掃描檢測：tool（檢測頭的層）沿 dz 掃過去（len 幀），同時左右掃（<tool>_sweep）、發光（<tool>_glow）；flag＝掃到一半亮起來標記壞的動作（例如 wf_badGlow） */
  scan: (m, o) => {
    const len = o.len ?? 90;
    return {
      shift: [S({ layer: o.tool, at: o.at, until: off(o.at, len + 6), dx: o.dx ?? 0, dz: o.dz ?? 3, dur: len })],
      run: [S({ id: `${o.tool}_sweep`, at: o.at, until: off(o.at, len + 6), ramp: 6 }), S({ id: `${o.tool}_glow`, at: o.at, until: off(o.at, len + 6), ramp: 6 }),
        ...[].concat(o.flag ?? []).map((id) => S({ id, at: off(o.at, len * 0.5), until: off(o.at, len + 20), ramp: 4 }))],
    };
  },
  /** 輸送前進一格：layers 整排往 dx 前進（dur 幀） */
  advance: (m, o) => ({ shift: o.layers.map((l) => S({ layer: l, at: o.at, dx: o.dx ?? 1.9, dz: o.dz, dur: o.dur ?? 10 })), run: [] }),
  /** 出現／消失：layers 在 at 之前藏起來（從 hide 開始），到 at 浮現；off 給了就在那個 cue 再藏起來 */
  reveal: (m, o) => ({
    shift: [].concat(o.layers ?? o.layer).flatMap((l) => [S({ layer: l, at: o.hide ?? "start-40", until: o.at, opacity: 0, dur: 2 }), ...(o.off ? [S({ layer: l, at: o.off, opacity: 0, dur: 6 })] : [])]),
    run: [],
  }),
  /** 機械手臂取放：吊臂轉過去（<arm>_reach）、夾爪往下伸再抬起 */
  "arm-reach": (m, o) => ({
    shift: [S({ layer: `${o.arm}_grip`, at: off(o.at, 12), until: off(o.at, 34), dy: -(o.grab ?? 0.5), dur: 7 }), ...(o.item ? [S({ layer: o.item, at: off(o.at, 22), dx: o.dx, dz: o.dz, dy: o.dy, dur: 12 })] : [])],
    run: [S({ id: `${o.arm}_reach`, at: o.at, until: o.until ?? off(o.at, 70), ramp: o.ramp ?? 12 })],
  }),
  /** 一次觸發好幾個動作（熱擴散：晶片發熱、散熱片發橘、熱浪）；stagger＝每個晚幾幀 */
  run: (m, o) => ({ shift: [], run: o.ids.map((id, i) => S({ id, at: off(o.at, i * (o.stagger ?? 0)), until: o.until, ramp: o.ramp ?? 6, gain: o.gain, speed: o.speed })) }),
};
