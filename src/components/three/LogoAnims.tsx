// 片尾卡的開口圈標誌進場動畫（使用者 2026/11/15：「科技感、AI 感等等…再找找合適且好看的」）。
// script.json 最後一幕 props.endCard.logoAnim 選一種；沒寫或寫 "draw" 走 Hud.tsx 原本的 RingMarkAnim。
// 座標：標誌的 100×100 空間（圓心 50,50、半徑 25，圓弧從 -9° 順時針畫到 279°，缺口在 -45° 放橘點），外面的效果可以超出這個框。
// 規則：只看幀數 n（固定 seed，可重現）；只用 SVG 2D；顏色只讀 H（皮膚的 logo 子表，沒有就退回 line／lineSoft／amber）；不發光、不漸層。
// 每種都在約 40 幀內落定（片名 28 幀、slogan 36 幀、下一支 48 幀進場，和原本一致），之後只有很輕的待機動作。
import React from "react";
import { H } from "./hudSkin";
import { EASE, tween } from "../anim";
import { FONT_EN } from "../../theme";

export const LOGO_ANIMS = ["draw", "circuit", "scan", "neural", "particles", "transparent", "glitch", "loading", "orbit", "blueprint"] as const;
export type LogoAnimName = (typeof LOGO_ANIMS)[number];
export const LOGO_ANIM_LABEL: Record<LogoAnimName, string> = {
  draw: "描線（現行）", circuit: "電路走線", scan: "掃描定位", neural: "神經網路", particles: "粒子聚合", transparent: "透明圈",
  glitch: "數位故障", loading: "載入進度", orbit: "電子軌道", blueprint: "藍圖作圖",
};

const ARC = "M74.69 46.09 A25 25 0 1 1 53.91 25.31";
const DOT: [number, number] = [67.68, 32.32];
const rad = (d: number) => (d * Math.PI) / 180;
/** 圓弧上第 t（0–1）的位置；r 預設 25 */
const onArc = (t: number, r = 25): [number, number] => { const a = rad(-9 + 288 * t); return [50 + r * Math.cos(a), 50 + r * Math.sin(a)]; };
const polar = (deg: number, r: number): [number, number] => [50 + r * Math.cos(rad(deg)), 50 + r * Math.sin(rad(deg))];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seeded = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
/** 落定回彈（和原本一樣：落下那一刻放大 28% 再衰減） */
const bounce = (n: number, land: number) => (n < land ? 1 : 1 + 0.28 * Math.exp(-(n - land) / 5) * Math.cos((n - land) / 1.6));
const breathe = (n: number, from: number) => (n > from ? 1 + 0.04 * Math.sin((n - from) / 7) : 1);
const col = () => {
  const g = ((H as any).logo ?? {}) as Record<string, string>;
  return { blue: H.line, orange: H.amber, ink: H.text, soft: H.lineSoft, trace: g.trace ?? H.lineSoft, grid: g.grid ?? H.lineSoft, faint: g.faint ?? H.text3, paper: g.paper ?? H.bg };
};
const monoF = `${(H as any).font?.mono ?? "monospace"}, ${FONT_EN}`;

const Ring: React.FC<{ draw?: number; color?: string; w?: number; o?: number }> = ({ draw = 1, color, w = 9, o = 1 }) =>
  draw <= 0 ? null : <path d={ARC} pathLength={1} fill="none" stroke={color ?? H.line} strokeWidth={w} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={(1 - Math.min(1, draw)).toFixed(4)} opacity={o} />;
const Dot: React.FC<{ s: number; x?: number; y?: number; color?: string }> = ({ s, x = DOT[0], y = DOT[1], color }) => (s <= 0 ? null : <circle cx={x} cy={y} r={6.6 * s} fill={color ?? H.amber} />);

/** 折線上第 t 的位置（依長度） */
const along = (pts: [number, number][], t: number): [number, number] => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = seg.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, t)) * tot;
  for (let i = 0; i < seg.length; i++) { if (d <= seg[i]) { const k = d / seg[i]; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; } d -= seg[i]; }
  return pts[pts.length - 1];
};

// ── 1 電路走線：PCB 線路從兩側走進來，焊點亮起，圓圈「通電」 ──
const TRACES = (() => {
  const mk = (deg: number, sx: number, y0: number): [number, number][] => {
    const p = polar(deg, 33.5), s = Math.sign(sx - 50), m: [number, number] = [p[0] + s * Math.abs(y0 - p[1]), y0];
    return Math.abs(y0 - p[1]) < 0.5 ? [[sx, y0], p] : [[sx, y0], m, p];
  };
  return [mk(180, -70, 50), mk(150, -70, 80), mk(210, -70, 18), mk(240, -48, -4), mk(10, 170, 55.8), mk(40, 170, 90), mk(90, 150, 104), mk(120, -48, 104)];
})();
const Circuit: React.FC<{ n: number }> = ({ n }) => {
  const c = col(), on = tween(n, 22, 14, EASE.move), dim = 1 - 0.6 * tween(n, 40, 16, EASE.move);
  return (
    <>
      {TRACES.map((pts, i) => {
        const a = 2 + i * 1.6, d = tween(n, a, 14, EASE.move), lit = n >= a + 14;
        const pd = `M${pts.map((p) => p.join(" ")).join(" L")}`, end = pts[pts.length - 1], st = pts[0];
        // 通電：一顆電流小方塊沿線跑進焊點；落定後每 36 幀再跑一次（很淡）
        const run = n < 40 ? tween(n, a + 8, 12, EASE.move) : ((n - 40 + i * 5) % 36) / 36;
        const q = along(pts, run), qo = n < 40 ? (run > 0 && run < 1 ? 1 : 0) : 0.45;
        return (
          <g key={i} opacity={dim}>
            <path d={pd} pathLength={1} fill="none" stroke={c.trace} strokeWidth={1.1} strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={(1 - d).toFixed(4)} opacity={d > 0 ? 1 : 0} />
            {d > 0 ? <circle cx={st[0]} cy={st[1]} r={1.9} fill={c.paper} stroke={c.trace} strokeWidth={0.9} /> : null}
            {d > 0.95 ? <circle cx={end[0]} cy={end[1]} r={2.3} fill={lit ? c.blue : c.paper} stroke={c.blue} strokeWidth={0.9} /> : null}
            {qo > 0 && n >= a + 8 ? <rect x={q[0] - 1.2} y={q[1] - 1.2} width={2.4} height={2.4} fill={c.blue} opacity={qo} /> : null}
          </g>
        );
      })}
      <Ring draw={1} color={c.soft} o={1 - on} />
      <Ring draw={on} />
      <Dot s={n < 36 ? 0 : bounce(n, 36) * breathe(n, 52)} />
    </>
  );
};

// ── 2 掃描定位：掃描線由上往下掃過，掃過的地方露出標誌，角落框與讀數數到 100% ──
const Scan: React.FC<{ n: number }> = ({ n }) => {
  const c = col(), box = tween(n, 0, 8, EASE.enter), y = lerp(12, 88, tween(n, 4, 26, EASE.move)), done = n >= 30;
  const pct = Math.round(100 * tween(n, 4, 26, EASE.move)), lock = tween(n, 30, 8, EASE.enter);
  const idle = n > 56 ? ((n - 56) % 34) / 34 : -1, iy = lerp(12, 88, idle);
  const B = 40, k = 8 * box, sq = lock ? 1 - 0.1 * lock : 1;
  return (
    <>
      <defs><clipPath id="lg-scan"><rect x={-20} y={-20} width={140} height={y + 20} /></clipPath></defs>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => { const x = 50 + sx * B * sq, yy = 50 + sy * B * sq; return <path key={i} d={`M${x} ${yy - sy * k} V${yy} H${x - sx * k}`} fill="none" stroke={lock > 0 ? c.blue : c.faint} strokeWidth={1.2} />; })}
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={50 - B - 4} x2={50 - B - (i % 2 ? 1.5 : 3)} y1={30 + i * 10} y2={30 + i * 10} stroke={c.faint} strokeWidth={0.6} opacity={box} />)}
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={50 + B + 4} x2={50 + B + (i % 2 ? 1.5 : 3)} y1={30 + i * 10} y2={30 + i * 10} stroke={c.faint} strokeWidth={0.6} opacity={box} />)}
      <g clipPath="url(#lg-scan)"><Ring draw={1} /><Dot s={done ? bounce(n, 30) * breathe(n, 52) : 1} /></g>
      {!done ? <><rect x={4} y={y - 7} width={92} height={7} fill={c.blue} opacity={0.08} /><line x1={2} x2={98} y1={y} y2={y} stroke={c.blue} strokeWidth={0.9} /></> : null}
      {idle >= 0 ? <line x1={10} x2={90} y1={iy} y2={iy} stroke={c.blue} strokeWidth={0.5} opacity={0.35 * Math.sin(Math.PI * idle)} /> : null}
      <text x={50} y={104} textAnchor="middle" style={{ fontFamily: monoF, fontSize: 6, fontWeight: 600, fill: lock > 0.5 ? c.blue : c.faint, letterSpacing: 0.6 }} opacity={box}>{lock > 0.5 ? "LOCKED · 100%" : `SCAN ${String(pct).padStart(3, "0")}%`}</text>
    </>
  );
};

// ── 3 神經網路：小網路的節點亮起、訊號往右傳，節點收進圓弧，最後亮起的輸出節點就是橘點 ──
const NET = (() => {
  const layers = [[-40, [22, 50, 78]], [8, [12, 37, 63, 88]], [92, [12, 37, 63, 88]], [140, [34, 66]]] as [number, number[]][];
  const nodes = layers.flatMap(([x, ys], l) => ys.map((y, j) => ({ x, y, l, j })));
  const edges: [number, number][] = [];
  nodes.forEach((a, i) => nodes.forEach((b, k) => { if (b.l === a.l + 1) edges.push([i, k]); }));
  const out = nodes.findIndex((p) => p.l === 3 && p.j === 0);
  const rest = nodes.map((p, i) => ({ i, a: ((Math.atan2(p.y - 50, p.x - 50) * 180) / Math.PI + 369) % 360 })).filter((p) => p.i !== out).sort((p, q) => p.a - q.a);
  const target: [number, number][] = nodes.map(() => DOT);
  rest.forEach((p, k) => { target[p.i] = onArc(k / (rest.length - 1)); });
  return { nodes, edges, out, target };
})();
const Neural: React.FC<{ n: number }> = ({ n }) => {
  const c = col(), mv = tween(n, 22, 14, EASE.move), arc = tween(n, 30, 10, EASE.move);
  const pos = NET.nodes.map((p, i) => [lerp(p.x, NET.target[i][0], mv), lerp(p.y, NET.target[i][1], mv)] as [number, number]);
  return (
    <>
      {NET.edges.map(([a, b], i) => {
        const l = NET.nodes[a].l, d = tween(n, 4 + l * 3, 8, EASE.move), sig = tween(n, 10 + l * 4, 5, EASE.move);
        const p = pos[a], q = pos[b], hot = b === NET.out || NET.nodes[b].l < 3;
        return (
          <g key={i} opacity={1 - mv}>
            <line x1={p[0]} y1={p[1]} x2={lerp(p[0], q[0], d)} y2={lerp(p[1], q[1], d)} stroke={c.trace} strokeWidth={0.55} />
            {sig > 0 && sig < 1 && hot && (i % 2 === 0) ? <circle cx={lerp(p[0], q[0], sig)} cy={lerp(p[1], q[1], sig)} r={0.9} fill={c.blue} /> : null}
          </g>
        );
      })}
      <Ring draw={arc} />
      {NET.nodes.map((p, i) => {
        const isOut = i === NET.out, pop = tween(n, 1 + p.l * 3 + p.j, 6, EASE.enter), lit = n >= 10 + p.l * 4 + 5;
        if (isOut) {
          const s = n < 36 ? lerp(0.45, 1, mv) * pop : bounce(n, 36) * breathe(n, 52);
          return <circle key={i} cx={pos[i][0]} cy={pos[i][1]} r={6.6 * s} fill={lit || mv > 0 ? c.orange : c.paper} stroke={c.orange} strokeWidth={lit ? 0 : 1} />;
        }
        const r = 2.8 * pop * (1 - tween(n, 34, 8, EASE.move) * 0.99);
        return r > 0.05 ? <circle key={i} cx={pos[i][0]} cy={pos[i][1]} r={r} fill={lit ? c.blue : c.paper} stroke={c.blue} strokeWidth={0.9} /> : null;
      })}
    </>
  );
};

// ── 4 粒子聚合（加強版，使用者 2026/11/15 選定並要求「效果加強」）：
//    從四面八方、不同方向湧進 180 顆資料點（帶速度殘影），集中排成圓弧（使用者 2026/11/15：「從四面八方不同方向集中」）；橘色粒子聚成圓點；
//    合體那一刻圓環一閃＋兩道衝擊波＋一圈粒子往外迸開；之後有粒子沿外圈繞行 ──
const PARTS = (() => {
  const r = seeded(20261115);
  return Array.from({ length: 180 }, (_, i) => { const t = i / 179; return { t, j: (r() - 0.5) * 6, r0: 110 + r() * 80, a0: r() * 360, at: 8 + r() * 22, s: 0.9 + r() * 1.3, o: r() < 0.12, bend: (r() - 0.5) * 50 }; });
})();
const DOTPARTS = (() => { const r = seeded(7); return Array.from({ length: 22 }, () => ({ r0: 60 + r() * 70, a0: r() * 360, at: 26 + r() * 6, s: 1.2 + r() * 1.2 })); })();
const BURST = (() => { const r = seeded(99); return Array.from({ length: 40 }, () => ({ a: r() * 360, d: 22 + r() * 40, s: 0.6 + r() * 1.1, o: r() < 0.3 })); })();
const LOCK = 34;
const Particles: React.FC<{ n: number }> = ({ n }) => {
  const c = col(), draw = tween(n, 14, 20, EASE.move);
  // 從四面八方（起點平均分布在一圈大圓上）幾乎直線衝向圓弧上自己的位置，路線微彎
  const fly = (r0: number, a0: number, r1: number, a1: number, k: number, bend = 0): [number, number] => {
    const [sx, sy] = polar(a0, r0), [ex, ey] = polar(a1, r1), mx = (sx + ex) / 2, my = (sy + ey) / 2;
    const nx = -(ey - sy), ny = ex - sx, L = Math.hypot(nx, ny) || 1, cx = mx + (nx / L) * bend, cy = my + (ny / L) * bend, u = 1 - k;
    return [u * u * sx + 2 * u * k * cx + k * k * ex, u * u * sy + 2 * u * k * cy + k * k * ey];
  };
  const flash = n >= LOCK ? Math.exp(-(n - LOCK) / 4) : 0;
  return (
    <>
      {[0, 6].map((d) => { const u = tween(n, LOCK + d, 22, EASE.move); return u > 0 && u < 1 ? <circle key={`w${d}`} cx={50} cy={50} r={27 + 48 * u} fill="none" stroke={d ? c.orange : c.blue} strokeWidth={2.4 * (1 - u)} opacity={0.75 * (1 - u)} /> : null; })}
      {flash > 0.02 ? <Ring draw={1} color={c.soft} w={9 + 14 * flash} o={flash} /> : null}
      <g transform={`translate(50 50) scale(${(1 + 0.12 * flash).toFixed(3)}) translate(-50 -50)`}><Ring draw={draw} /></g>
      {PARTS.map((p, i) => {
        const k = tween(n, p.at - 18, 18, EASE.move), o = k <= 0 ? 0 : 1 - tween(n, p.at + 1, 5, EASE.exit);
        if (o <= 0) return null;
        const a1 = -9 + 288 * p.t, [x, y] = fly(p.r0, p.a0, 25 + p.j, a1, k, p.bend), [px, py] = fly(p.r0, p.a0, 25 + p.j, a1, Math.max(0, k - 0.12), p.bend);
        const fill = p.o ? c.orange : i % 7 === 3 ? c.trace : c.blue, rr = p.s * lerp(0.8, 1.3, k);
        return <g key={i} opacity={o}><line x1={px} y1={py} x2={x} y2={y} stroke={fill} strokeWidth={rr * 1.1} strokeLinecap="round" opacity={0.45} /><circle cx={x} cy={y} r={rr} fill={fill} /></g>;
      })}
      {DOTPARTS.map((p, i) => {
        const k = tween(n, p.at - 14, 14, EASE.move);
        if (k <= 0 || n > LOCK + 1) return null;
        const a = rad(p.a0) + (1 - k) * 0.4, rr = lerp(p.r0 + 40, 0, k);
        const [x, y] = [DOT[0] + rr * Math.cos(a), DOT[1] + rr * Math.sin(a)];
        return <circle key={`d${i}`} cx={x} cy={y} r={p.s} fill={c.orange} />;
      })}
      {n >= LOCK ? BURST.map((b, i) => { const u = tween(n, LOCK, 18, EASE.move); if (u >= 1) return null; const [x, y] = polar(b.a, 30 + b.d * u); return <circle key={`b${i}`} cx={x} cy={y} r={b.s * (1 - u)} fill={b.o ? c.orange : c.blue} opacity={1 - u} />; }) : null}
      <Dot s={n < LOCK ? 0 : bounce(n, LOCK) * breathe(n, 52)} />
      {n > 46 ? PARTS.filter((_, i) => i % 12 === 5).map((p, i) => { const u = ((n - 46 + i * 7) % 50) / 50, [x, y] = onArc((p.t + u * 0.35) % 1, 34 + 6 * Math.sin(Math.PI * u)); return <circle key={`i${i}`} cx={x} cy={y} r={1.1} fill={i % 4 === 1 ? c.orange : c.blue} opacity={0.75 * Math.sin(Math.PI * u)} />; }) : null}
    </>
  );
};

// ── 5 數位故障：短短半秒的錯位切片＋藍橘錯色，收成乾淨的標誌（之後只有一次極短的閃動） ──
const Glitch: React.FC<{ n: number }> = ({ n }) => {
  const c = col(), r = seeded(1000 + n), g = n < 3 ? 0 : 1 - tween(n, 4, 16, EASE.move), flick = n === 70 || n === 71 ? 0.25 : 0;
  const amt = Math.max(g, flick), on = n >= 3 && !(n === 6 || n === 11);
  const bands = [0, 18, 34, 46, 60, 74, 100];
  const snap = n >= 20 ? 1 + 0.05 * Math.exp(-(n - 20) / 3) : 1;
  const logo = (stroke: string, dot: string) => <><path d={ARC} fill="none" stroke={stroke} strokeWidth={9} strokeLinecap="round" /><circle cx={DOT[0]} cy={DOT[1]} r={6.6 * (n > 20 ? breathe(n, 52) : 1)} fill={dot} /></>;
  if (!on) return null;
  return (
    <g transform={`translate(50 50) scale(${snap.toFixed(3)}) translate(-50 -50)`}>
      <defs>{bands.slice(1).map((b, i) => <clipPath key={i} id={`lg-gl${i}`}><rect x={-30} y={bands[i]} width={160} height={b - bands[i]} /></clipPath>)}</defs>
      {amt > 0.02 ? <>
        <g transform={`translate(${(3.2 * amt).toFixed(2)} 0)`} opacity={0.7 * amt}>{logo(c.orange, c.orange)}</g>
        <g transform={`translate(${(-3.2 * amt).toFixed(2)} 0)`} opacity={0.7 * amt}>{logo(c.soft, c.soft)}</g>
      </> : null}
      {bands.slice(1).map((_, i) => { const dx = amt > 0.02 && r() < 0.6 ? (r() - 0.5) * 22 * amt : 0; return <g key={i} clipPath={`url(#lg-gl${i})`} transform={`translate(${dx.toFixed(2)} 0)`}>{logo(c.blue, c.orange)}</g>; })}
      {amt > 0.05 ? Array.from({ length: 13 }, (_, i) => <rect key={i} x={10} y={16 + i * 5.4} width={80} height={0.9} fill={c.paper} opacity={0.55 * amt} />) : null}
      {amt > 0.05 && r() < 0.7 ? <rect x={-20 + r() * 90} y={20 + r() * 60} width={8 + r() * 26} height={1.6} fill={r() < 0.5 ? c.blue : c.orange} opacity={amt} /> : null}
    </g>
  );
};

// ── 6 載入進度：圓弧當成進度圈一格一格長滿，中間數字數到 100%，數字收起、橘點補進缺口 ──
const Loading: React.FC<{ n: number }> = ({ n }) => {
  const c = col(), raw = tween(n, 4, 28, EASE.move), steps = [0, 0.18, 0.31, 0.52, 0.6, 0.83, 0.94, 1];
  const prog = (() => { const x = raw * (steps.length - 1), i = Math.floor(x), k = x - i; return i >= steps.length - 1 ? 1 : lerp(steps[i], steps[i + 1], Math.min(1, k * 1.8)); })();
  const pct = Math.round(prog * 100), num = 1 - tween(n, 33, 6, EASE.exit), cursor = Math.floor(n / 8) % 2 === 0;
  const typed = "> loading channel".slice(0, Math.max(0, Math.floor((n - 1) / 1.1)));
  const ready = n >= 36;
  return (
    <>
      <circle cx={50} cy={50} r={25} fill="none" stroke={c.soft} strokeWidth={9} opacity={1 - tween(n, 32, 8, EASE.move)} />
      <Ring draw={prog} />
      {num > 0 ? <text x={50} y={54} textAnchor="middle" style={{ fontFamily: monoF, fontSize: 11, fontWeight: 700, fill: c.ink }} opacity={num}>{pct}<tspan style={{ fontSize: 6 }}>%</tspan></text> : null}
      <Dot s={n < 36 ? 0 : bounce(n, 36) * breathe(n, 52)} />
      <text x={6} y={4} style={{ fontFamily: monoF, fontSize: 5.4, fontWeight: 600, fill: ready ? c.blue : c.faint, letterSpacing: 0.3 }}>{ready ? "> ready ✓" : typed}{!ready && cursor ? "▌" : ""}</text>
      <text x={94} y={104} textAnchor="end" style={{ fontFamily: monoF, fontSize: 4.6, fontWeight: 500, fill: c.faint }} opacity={tween(n, 6, 6)}>{`[${"■".repeat(Math.round(prog * 10)).padEnd(10, "·")}]`}</text>
    </>
  );
};

// ── 7 電子軌道：橘點像電子沿傾斜的橢圓軌道繞，帶著殘影，軌道收成正圓、停進缺口（呼應電晶體主題） ──
const orbitAt = (n: number) => {
  const u = tween(n, 0, 36, EASE.enter), m = tween(n, 18, 18, EASE.move), rot = -30;
  const phi = -15 - 860 * (1 - u), rx = lerp(42, 25, m), ry = lerp(13, 25, m);
  const x0 = rx * Math.cos(rad(phi)), y0 = ry * Math.sin(rad(phi));
  return { x: 50 + x0 * Math.cos(rad(rot)) - y0 * Math.sin(rad(rot)), y: 50 + x0 * Math.sin(rad(rot)) + y0 * Math.cos(rad(rot)), rx, ry, m };
};
const Orbit: React.FC<{ n: number }> = ({ n }) => {
  const c = col(), o = orbitAt(Math.min(n, 36)), shells = tween(n, 0, 8, EASE.enter) * (1 - tween(n, 24, 12, EASE.move));
  const ring = tween(n, 22, 14, EASE.move), core = tween(n, 2, 8, EASE.enter) * (1 - tween(n, 26, 8, EASE.move));
  return (
    <>
      {[30, 90, 150].map((r, i) => <ellipse key={i} cx={50} cy={50} rx={i === 0 ? o.rx : 42} ry={i === 0 ? o.ry : 13} transform={`rotate(${i === 0 ? -30 : r} 50 50)`} fill="none" stroke={c.trace} strokeWidth={0.7} opacity={i === 0 ? Math.max(shells, 1 - o.m) * (1 - ring) : shells} />)}
      {core > 0 ? <circle cx={50} cy={50} r={4 * core} fill={c.blue} opacity={0.85} /> : null}
      <Ring draw={ring} />
      {n < 36 ? Array.from({ length: 7 }, (_, k) => { const p = orbitAt(n - (k + 1) * 0.9); return <circle key={k} cx={p.x} cy={p.y} r={6.6 * 0.6 * (1 - k / 8)} fill={c.orange} opacity={0.32 * (1 - k / 7)} />; }) : null}
      <circle cx={o.x} cy={o.y} r={6.6 * (n < 36 ? lerp(0.6, 1, o.m) : bounce(n, 36) * breathe(n, 52))} fill={c.orange} />
      {n > 36 && n < 56 ? <circle cx={DOT[0]} cy={DOT[1]} r={6.6 + 10 * tween(n, 36, 18, EASE.move)} fill="none" stroke={c.orange} strokeWidth={1.4 * (1 - tween(n, 36, 18))} opacity={1 - tween(n, 36, 18)} /> : null}
    </>
  );
};

// ── 8 藍圖作圖：十字中心線、圓規臂掃出虛線圓、尺寸標註 Ø50 與 72° 缺口，最後上墨成實心標誌 ──
const Blueprint: React.FC<{ n: number }> = ({ n }) => {
  const c = col(), cross = tween(n, 0, 8, EASE.move), sw = tween(n, 5, 20, EASE.move), ang = -9 + 288 * sw;
  const dim = tween(n, 12, 10, EASE.move), ink = tween(n, 24, 12, EASE.move), fade = 1 - 0.7 * tween(n, 40, 16, EASE.move);
  const tip = polar(ang, 25), arm = n >= 5 && n < 30 ? 1 - tween(n, 26, 4) : 0;
  const deg = (Math.round(288 * sw) + "").padStart(3, " ");
  const label: React.CSSProperties = { fontFamily: monoF, fontSize: 4.8, fontWeight: 600, fill: c.blue, letterSpacing: 0.3 };
  return (
    <>
      <g opacity={fade}>
        <line x1={50 - 44 * cross} x2={50 + 44 * cross} y1={50} y2={50} stroke={c.faint} strokeWidth={0.45} strokeDasharray="3 1.4 0.6 1.4" />
        <line y1={50 - 44 * cross} y2={50 + 44 * cross} x1={50} x2={50} stroke={c.faint} strokeWidth={0.45} strokeDasharray="3 1.4 0.6 1.4" />
        <path d={ARC} pathLength={1} fill="none" stroke={c.blue} strokeWidth={0.6} strokeDasharray="1 1" strokeDashoffset={(1 - sw).toFixed(4)} opacity={sw > 0 ? 1 : 0} />
        <g opacity={dim}>
          <line x1={25} x2={75} y1={93} y2={93} stroke={c.blue} strokeWidth={0.5} />
          {[25, 75].map((x) => <React.Fragment key={x}><line x1={x} x2={x} y1={82} y2={96} stroke={c.blue} strokeWidth={0.4} /><path d={`M${x} 93 l${x < 50 ? 2.4 : -2.4} -1.1 v2.2 z`} fill={c.blue} /></React.Fragment>)}
          <rect x={41} y={90} width={18} height={6} fill={c.paper} /><text x={50} y={94.7} textAnchor="middle" style={label}>Ø 50</text>
          <path d={`M${polar(-81, 38).join(" ")} A38 38 0 0 1 ${polar(-9, 38).join(" ")}`} fill="none" stroke={c.blue} strokeWidth={0.45} />
          {[-81, -9].map((a) => <line key={a} x1={polar(a, 32)[0]} y1={polar(a, 32)[1]} x2={polar(a, 41)[0]} y2={polar(a, 41)[1]} stroke={c.blue} strokeWidth={0.4} />)}
          <text x={polar(-45, 47)[0]} y={polar(-45, 47)[1] + 1.6} textAnchor="middle" style={label}>72°</text>
        </g>
        {arm > 0 ? <g opacity={arm}>
          <line x1={50} y1={50} x2={tip[0]} y2={tip[1]} stroke={c.ink} strokeWidth={0.6} />
          <circle cx={50} cy={50} r={1.6} fill={c.paper} stroke={c.ink} strokeWidth={0.6} />
          <circle cx={tip[0]} cy={tip[1]} r={1} fill={c.ink} />
          <text x={50} y={60} textAnchor="middle" style={{ ...label, fill: c.ink }}>R25 · {deg}°</text>
        </g> : null}
        {n >= 16 && n < 36 ? <circle cx={DOT[0]} cy={DOT[1]} r={6.6} fill="none" stroke={c.orange} strokeWidth={0.6} strokeDasharray="1.4 1" opacity={tween(n, 16, 4)} /> : null}
      </g>
      <Ring draw={ink} />
      <Dot s={n < 36 ? 0 : bounce(n, 36) * breathe(n, 52)} />
    </>
  );
};

// ── 10 透明圈 v2（使用者 2026/11/15：「不夠吸引人 幫我優化」）：「科技＋透明＋圈」
//    ① 0–12 幀：五層透明圈（底板、電路、晶片、外框、玻璃面）從上下左右不同方向帶旋轉飛進來，放大到約 1.6 倍斜放成爆炸圖；
//    ② 11–25 幀：一道寬的 X 光掃描帶由上往下掃，掃過的那一層電路亮起橘／藍；
//    ③ 23–33 幀：由上而下一層接一層砸合，每砸一下畫面輕震；同時轉正、縮回原尺寸；
//    ④ 34 幀鎖定：白→藍的圓環閃一下、兩道衝擊波、粒子往四面八方迸開，橘點從上方掉進缺口回彈；
//    ⑤ 待機：每 30 幀一道白色玻璃反光沿圓環掃過，外圈有幾顆粒子繞行 ──
const TC_TRACES: [number, number][][] = [
  [[30, 50], [40, 50], [45, 44], [55, 44]], [[50, 28], [50, 38], [57, 45]], [[70, 50], [60, 50], [55, 56], [45, 56]],
  [[50, 72], [50, 62], [43, 55]], [[34, 36], [41, 43]], [[66, 64], [59, 57]], [[64, 34], [58, 40]], [[34, 64], [40, 58]],
];
const TC_PTS = (pts: [number, number][]) => pts.map((p) => p.join(",")).join(" ");
// 每層：爆炸圖位置 dy、飛進來的方向（dx,dy）與旋轉、砸合時間
const TC_LAYERS = [
  { k: "base", dy: 38, fx: 0, fy: 140, rot: 0, inAt: 0, slam: 32 },
  { k: "trace", dy: 19, fx: -150, fy: 20, rot: -25, inAt: 2, slam: 30 },
  { k: "chip", dy: 0, fx: 150, fy: -10, rot: 30, inAt: 4, slam: 28 },
  { k: "frame", dy: -19, fx: -60, fy: -150, rot: 20, inAt: 6, slam: 26 },
  { k: "glass", dy: -38, fx: 130, fy: -130, rot: -30, inAt: 8, slam: 24 },
];
const TC_BURST = (() => { const r = seeded(4242); return Array.from({ length: 56 }, () => ({ a: r() * 360, d: 26 + r() * 46, s: 0.7 + r() * 1.3, o: r() < 0.3, sp: 0.8 + r() * 0.5 })); })();
const Transparent: React.FC<{ n: number }> = ({ n }) => {
  const c = col(), white = H.panel ?? "#FFFFFF", navy = c.ink, LOCK = 34;
  const tilt = 1 - tween(n, 24, 10, EASE.move);                     // 斜放 → 轉正
  const zoom = lerp(1, 1.6, 1 - tween(n, 24, 11, EASE.move));        // 1.6 倍 → 原尺寸
  const lift = 28 * (1 - tween(n, 24, 10, EASE.move));               // 建構時整組稍微往下，避開頁首
  // 砸合的震動：每層落下那一刻
  let shake = 0; for (const L of TC_LAYERS) { const d = n - (L.slam + 3); if (d >= 0 && d < 6) shake += (L.k === "base" ? 0 : 1.6) * Math.exp(-d / 1.5) * Math.cos(d * 2.4); }
  const lockShake = n >= LOCK && n < LOCK + 8 ? 2.4 * Math.exp(-(n - LOCK) / 2) * Math.cos((n - LOCK) * 2.6) : 0;
  const sy = lerp(1, 0.55, tilt), skew = -16 * tilt;
  const scanY = lerp(4, 112, tween(n, 11, 14, EASE.move));         // 掃描帶在整組座標的 y
  const scanOn = n >= 11 && n <= 26;
  const inner = 1 - tween(n, LOCK, 5, EASE.exit);                     // 鎖定後內部結構收掉
  const flash = n >= LOCK ? Math.exp(-(n - LOCK) / 3.5) : 0;
  const layer = (L: (typeof TC_LAYERS)[number], i: number) => {
    const fin = tween(n, L.inAt, 10, EASE.move);
    if (fin <= 0) return null;
    const close = tween(n, L.slam, 4, EASE.enter);                   // 4 幀砸下（加速）
    const ox = L.fx * (1 - fin), oy = L.fy * (1 - fin), r = L.rot * (1 - fin);
    const y = 50 + L.dy * (1 - close) + oy;
    const lit = tween(n, 12 + (4 - i) * 2.6, 4, EASE.enter);          // 掃描帶經過後亮起
    const cx = 50, cy = 50;
    let body: React.ReactNode = null;
    if (L.k === "base") body = <><circle cx={cx} cy={cy} r={32} fill={c.grid} stroke={navy} strokeWidth={1.6} /><circle cx={cx} cy={cy} r={27} fill="none" stroke={c.blue} strokeWidth={0.8} strokeDasharray="2 2" /></>;
    else if (L.k === "trace") body = <><circle cx={cx} cy={cy} r={32} fill={white} fillOpacity={0.35} stroke={navy} strokeWidth={1.3} />
      {TC_TRACES.map((p, j) => <polyline key={j} points={TC_PTS(p)} fill="none" stroke={lit > 0.5 ? (j % 3 === 1 ? c.orange : c.blue) : c.trace} strokeWidth={lerp(1.4, 2.4, lit)} strokeLinejoin="round" strokeLinecap="round" />)}
      {TC_TRACES.map((p, j) => <circle key={`p${j}`} cx={p[0][0]} cy={p[0][1]} r={lerp(1.4, 2.3, lit)} fill={c.orange} stroke={navy} strokeWidth={0.5} />)}</>;
    else if (L.k === "chip") body = <><circle cx={cx} cy={cy} r={32} fill={white} fillOpacity={0.3} stroke={navy} strokeWidth={1.3} />
      <rect x={38.5} y={38.5} width={23} height={23} rx={2} fill={white} stroke={navy} strokeWidth={1.4} />
      {[0, 1, 2].map((a) => [0, 1, 2].map((b) => <rect key={`${a}${b}`} x={41 + a * 6.4} y={41 + b * 6.4} width={5} height={5} rx={0.8} fill={lit > 0.5 && (a + b) % 2 === 0 ? c.orange : c.blue} />))}</>;
    else if (L.k === "frame") body = <><circle cx={cx} cy={cy} r={32} fill="none" stroke={navy} strokeWidth={1.3} /><path d={ARC} fill="none" stroke={navy} strokeWidth={11.5} strokeLinecap="round" /><path d={ARC} fill="none" stroke={lit > 0.5 ? c.blue : c.soft} strokeWidth={8.5} strokeLinecap="round" /></>;
    else body = <><circle cx={cx} cy={cy} r={32} fill={white} fillOpacity={0.45} stroke={c.blue} strokeWidth={1.6} />
      <path d="M26 40 A26 26 0 0 1 40 25" fill="none" stroke={white} strokeWidth={3.4} strokeLinecap="round" />
      <path d="M62 74 A26 26 0 0 0 74 62" fill="none" stroke={white} strokeWidth={2} strokeLinecap="round" /></>;
    const o = inner;
    if (o <= 0) return null;
    return <g key={L.k} opacity={o} transform={`translate(${(50 + ox).toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(1)}) skewX(${skew.toFixed(2)}) scale(1 ${sy.toFixed(3)}) translate(-50 -50)`}>{body}</g>;
  };
  return (
    <g transform={`translate(${(lockShake * 0.6).toFixed(2)} ${(shake + lockShake + lift).toFixed(2)}) translate(50 50) scale(${zoom.toFixed(3)}) translate(-50 -50)`}>
      {/* 爆炸圖的對位虛線 */}
      {tilt > 0.05 ? [-32, 32].map((x) => <line key={x} x1={50 + x * lerp(1, 1, tilt)} y1={50 - 38} x2={50 + x} y2={50 + 38} stroke={navy} strokeWidth={0.6} strokeDasharray="1.6 1.6" opacity={tween(n, 8, 6, EASE.enter) * (1 - tween(n, 24, 6, EASE.exit))} />) : null}
      {/* 衝擊波 */}
      {[0, 5].map((d) => { const u = tween(n, LOCK + d, 20, EASE.move); return u > 0 && u < 1 ? <circle key={`w${d}`} cx={50} cy={50} r={30 + 46 * u} fill="none" stroke={d ? c.orange : c.blue} strokeWidth={3.2 * (1 - u)} opacity={1 - u} /> : null; })}
      {TC_LAYERS.map(layer)}
      {/* X 光掃描帶：寬帶＋最前緣一條亮線 */}
      {scanOn ? <g>
        <rect x={0} y={scanY - 22} width={100} height={22} fill={c.soft} opacity={0.35} />
        <rect x={-4} y={scanY - 1.6} width={108} height={3.2} fill={white} />
        <rect x={-4} y={scanY + 1.6} width={108} height={1.4} fill={c.blue} />
        <rect x={-6} y={scanY - 3} width={4} height={6} fill={c.orange} /><rect x={102} y={scanY - 3} width={4} height={6} fill={c.orange} />
      </g> : null}
      {/* 鎖定：白→藍閃光圓環 */}
      {flash > 0.03 ? <path d={ARC} fill="none" stroke={flash > 0.55 ? white : c.blue} strokeWidth={9 + 16 * flash} strokeLinecap="round" opacity={Math.min(1, flash * 1.4)} /> : null}
      {n >= LOCK ? <path d={ARC} fill="none" stroke={c.blue} strokeWidth={9} strokeLinecap="round" /> : null}
      {/* 粒子迸開 */}
      {n >= LOCK ? TC_BURST.map((b, i) => { const u = tween(n, LOCK, 16 * b.sp, EASE.move); if (u >= 1) return null; const [x, y] = polar(b.a, 30 + b.d * u); return <circle key={`b${i}`} cx={x} cy={y} r={b.s * (1 - u * 0.8)} fill={b.o ? c.orange : c.blue} opacity={1 - u} />; }) : null}
      {/* 待機：玻璃反光沿圓環掃過 */}
      {n > LOCK + 10 ? (() => { const u = ((n - LOCK - 10) % 30) / 16; if (u >= 1) return null; const t0 = Math.max(0, u - 0.18), t1 = Math.min(1, u);
        const [ax, ay] = onArc(t0), [bx, by] = onArc(t1);
        return <path d={`M${ax.toFixed(2)} ${ay.toFixed(2)} A25 25 0 0 1 ${bx.toFixed(2)} ${by.toFixed(2)}`} fill="none" stroke={white} strokeWidth={3} strokeLinecap="round" opacity={0.9 * Math.sin(Math.PI * u)} />; })() : null}
      {n > LOCK + 6 ? [0, 1, 2, 3, 4, 5].map((i) => { const a = (n - LOCK) * 2.2 + i * 60, rr = 37 + 3 * Math.sin((n + i * 11) / 9), [x, y] = polar(a, rr); return <circle key={`o${i}`} cx={x} cy={y} r={i % 3 === 1 ? 1.5 : 1.1} fill={i % 3 === 1 ? c.orange : c.blue} opacity={0.8 * tween(n, LOCK + 6 + i * 2, 8, EASE.enter)} />; }) : null}
      {/* 橘點從上方掉進缺口 */}
      {n >= LOCK ? (() => { const k = tween(n, LOCK, 5, EASE.enter), y = lerp(DOT[1] - 40, DOT[1], k); return <Dot s={bounce(n, LOCK + 5) * breathe(n, 58)} y={y} />; })() : null}
    </g>
  );
};

const MAP: Record<string, React.FC<{ n: number }>> = { circuit: Circuit, scan: Scan, neural: Neural, particles: Particles, transparent: Transparent, glitch: Glitch, loading: Loading, orbit: Orbit, blueprint: Blueprint };
export const hasLogoAnim = (name?: string) => !!name && !!MAP[name];
/** n＝片尾卡第幾幀；size＝標誌 100 單位對應幾 px（和 RingMarkAnim 一樣，畫在已平移到中心的 <g> 裡） */
export const LogoAnim: React.FC<{ name: string; n: number; size: number }> = ({ name, n, size }) => {
  const C = MAP[name];
  return C ? <g transform={`scale(${size / 100}) translate(-50 -50)`}><C n={n} /></g> : null;
};
