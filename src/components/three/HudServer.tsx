// 2026/11/17 tech-server：伺服器整櫃的 2D 側視／示意卡（overlay `section` 的 kind 以 "srv-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   srv-count 18 層托盤×每層 4 顆 GPU＋2 顆 CPU，數出 72｜srv-mesh 九層交換器把十八層托盤全部連起來（像一顆）｜srv-power 電源層→銅排→每一層，最後變成熱｜srv-cool 風吹不動→冷卻液循環
// 全部示意；顏色讀 H 與 model.json 的 palette；時間全部來自 script.json 的 t（cue）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, sm } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D } from "./engine";
import { col } from "./model";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ position: "absolute", left: 16, top: 10, ...zh(30, onC(H.line), 800), background: H.line, padding: "2px 14px 4px", zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(30), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const ph = (f: number, sp: number, j: number, n: number, seed = 0) => (((f * sp + j / n + seed * 0.17) % 1) + 1) % 1;
const ROW = 14, N = 18;

// ── srv-count ──
const Count: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, c = (n: string) => col(m.product, n);
  const gpu = T(o, "gpu"), tray = T(o, "tray"), cpu = T(o, "cpu");
  const x0 = 40, y0 = 62;
  const nShow = Math.round(N * tween(f, tray - 18, 30, EASE.move));
  const g = tween(f, gpu, 14, EASE.enter), cp = tween(f, cpu, 10, EASE.enter);
  const sig = c("lp_sig"), grn = c("green"), tb = c("trayB");
  const cnt = Math.min(72, Math.round(72 * tween(f, gpu, 40, EASE.move)));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: N }, (_, i) => {
          const y = y0 + i * ROW, on = i < nShow;
          return <g key={i} opacity={on ? 1 : 0.12}>
            <rect x={x0} y={y} width={470} height={ROW - 3} fill={tb} />
            {[0, 1, 2, 3].map((j) => <rect key={j} x={x0 + 14 + j * 38} y={y + 1} width={30} height={ROW - 5} fill={sig} opacity={g > 0 && on ? 0.35 + 0.65 * g : 0.2} />)}
            {[0, 1].map((j) => <rect key={j} x={x0 + 190 + j * 34} y={y + 1} width={26} height={ROW - 5} fill={grn} opacity={cp > 0 && on ? cp : 0.15} />)}
          </g>;
        })}
        <text x={x0 + 480} y={y0 + 70} opacity={g} style={zh(110, c("lp_sig"), 900)}>{cnt}</text>
        <text x={x0 + 480} y={y0 + 118} opacity={g} style={zh(36, H.text, 800)}>顆 GPU（18 層 × 4）</text>
        <text x={x0 + 480} y={y0 + 190} opacity={cp} style={zh(70, grn, 900)}>36</text>
        <text x={x0 + 480} y={y0 + 236} opacity={cp} style={zh(36, H.text, 800)}>顆 CPU（每層 2）</text>
        <text x={x0 + 480} y={Hh - 24} opacity={tween(f, tray, 8, EASE.enter)} style={zh(30, H.text2, 700)}>一格＝一層托盤　示意</text>
      </svg>
    </Card>
  );
};

// ── srv-mesh ──
const Mesh: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = (n: string) => col(m.product, n);
  const one = T(o, "one"), link = T(o, "link"), cab = T(o, "cable"), find = T(o, "find");
  const merge = tween(f, one, 24, EASE.move), lk = tween(f, link, 30, EASE.move), nb = tween(f, cab, 8, EASE.enter), fd = tween(f, find, 10, EASE.enter);
  const sig = c("lp_sig"), orange = c("orange"), grn = c("green"), cu = c("cu"), tb = c("trayB");
  const lx = 90, ly = (i: number) => 62 + i * 14.5, sx = 520, sy = (j: number) => 70 + j * 24;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: N }, (_, i) => (i < 9 ? ly(i) : ly(i) + 0)).map((y, i) => <g key={i}>
          <rect x={lx} y={y} width={90} height={11} fill={tb} />
          <rect x={lx + 6} y={y + 1} width={60} height={9} fill={sig} opacity={0.5 + 0.5 * merge} />
        </g>)}
        {Array.from({ length: 9 }, (_, j) => <rect key={j} x={sx} y={sy(j)} width={120} height={18} fill={orange} />)}
        {Array.from({ length: N }, (_, i) => Array.from({ length: 9 }, (_, j) => <line key={`${i}-${j}`} x1={lx + 90} y1={ly(i) + 5} x2={lx + 90 + (sx - lx - 90) * lk} y2={ly(i) + 5 + (sy(j) + 9 - ly(i) - 5) * lk} stroke={cu} strokeWidth={0.9} opacity={0.55} />))}
        {lk >= 1 ? Array.from({ length: 24 }, (_, j) => { const i = (j * 5) % N, jj = (j * 7) % 9, u = ph(f, 0.03, j, 24); return <circle key={j} cx={lx + 90 + (sx - lx - 90) * u} cy={ly(i) + 5 + (sy(jj) + 9 - ly(i) - 5) * u} r={3.4} fill={sig} />; }) : null}
        {/* 「像一顆」：十八層合成一個大圈 */}
        <g opacity={merge}><rect x={lx - 16} y={52} width={290 + 10} height={18 * 14.5 + 20} fill="none" stroke={H.amber} strokeWidth={4} strokeDasharray="10 8" /></g>
        <text x={650} y={110} opacity={merge} style={zh(52, H.amber, 900)}>72 顆</text>
        <text x={650} y={166} opacity={merge} style={zh(52, H.amber, 900)}>＝ 一顆</text>
        <text x={650} y={222} opacity={nb} style={zh(38, cu, 900)}>5,000+ 條銅線</text>
        <text x={650} y={274} opacity={fd} style={zh(36, sig, 900)}>每顆找得到 71 顆</text>
        <text x={sx} y={Hh - 14} opacity={lk} style={zh(30, H.text2, 700)}>橘＝九層交換器　示意</text>
      </svg>
    </Card>
  );
};

// ── srv-power ──
const Power: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, c = (n: string) => col(m.product, n);
  const inn = T(o, "in"), bus = T(o, "bus"), heat = T(o, "heat");
  const a = tween(f, inn, 8, EASE.enter), b = tween(f, bus, 20, EASE.move), hh = tween(f, heat, 22, EASE.move);
  const pwr = c("pwr"), cu = c("cu"), tb = c("trayB"), hot = c("lp_hot"), proc = c("lp_proc");
  const bx = 330, ry = (i: number) => 60 + i * 14.5;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={110} width={160} height={90} fill={pwr} opacity={a} />
        <text x={120} y={165} textAnchor="middle" opacity={a} style={zh(36, onC(H.amber), 900)}>電源層</text>
        <path d={`M200 155 H${bx}`} stroke={cu} strokeWidth={8} opacity={a} />
        <rect x={bx - 6} y={52} width={12} height={N * 14.5 + 8} fill={cu} opacity={b} />
        {Array.from({ length: N }, (_, i) => <g key={i}>
          <rect x={bx + 20} y={ry(i)} width={300} height={11} fill={hh > 0.4 ? hot : tb} opacity={0.92} />
          <line x1={bx} y1={ry(i) + 5} x2={bx + 20} y2={ry(i) + 5} stroke={cu} strokeWidth={3} opacity={b} />
        </g>)}
        {b > 0.6 ? Array.from({ length: 14 }, (_, j) => <circle key={j} cx={bx} cy={ry(0) + 8 + (N * 14.5 - 16) * ph(f, 0.03, j, 14)} r={4.5} fill={proc} />) : null}
        {a > 0.5 && b < 1 ? Array.from({ length: 5 }, (_, j) => <circle key={j} cx={200 + (bx - 200) * ph(f, 0.04, j, 5)} cy={155} r={5} fill={proc} />) : null}
        {hh > 0 ? Array.from({ length: 6 }, (_, j) => { const u = ph(f, 0.025, j, 6, j), xx = bx + 50 + j * 46; return <path key={j} d={`M${xx} ${ry(17) - u * 150} v-22 m-8 9 l8 -11 l8 11`} stroke={hot} strokeWidth={4.5} fill="none" opacity={hh * (1 - u)} />; }) : null}
        <text x={bx + 340} y={120} opacity={tween(f, bus, 8, EASE.enter)} style={zh(44, cu, 900)}>銅排</text>
        <text x={bx + 340} y={180} opacity={hh} style={zh(50, hot, 900)}>電 → 熱</text>
        <text x={bx + 340} y={232} opacity={hh} style={zh(36, H.text, 800)}>一百多千瓦</text>
      </svg>
    </Card>
  );
};

// ── srv-cool ──
const Cool: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, c = (n: string) => col(m.product, n);
  const air = T(o, "air"), liq = T(o, "liq"), out = T(o, "out");
  const ag = tween(f, air, 8, EASE.enter), xx = tween(f, air + 14, 8, EASE.enter), lq = tween(f, liq, 22, EASE.move), ot = tween(f, out, 10, EASE.enter);
  const cool = c("lp_cool"), hot = c("lp_hot"), tb = c("trayB"), steel = c("steel"), bad = c("lp_bad");
  const rx = 330, ry = (i: number) => 60 + i * 14.5;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {/* 風扇與被擋住的風 */}
        <g opacity={ag * (1 - lq * 0.7)}>
          <circle cx={90} cy={170} r={44} fill="none" stroke={steel} strokeWidth={5} />
          {[0, 1, 2].map((j) => <path key={j} d={`M90 170 l${34 * Math.cos(f * 0.35 + j * 2.09)} ${34 * Math.sin(f * 0.35 + j * 2.09)}`} stroke={steel} strokeWidth={9} strokeLinecap="round" />)}
          {[0, 1, 2].map((j) => <path key={j} d={`M${150 + (f * 2 + j * 20) % 60} ${140 + j * 30} h28`} stroke={steel} strokeWidth={4} opacity={0.7} />)}
          <path d={`M${rx - 26} 100 l50 140 m0 -140 l-50 140`} stroke={bad} strokeWidth={8} opacity={xx} />
        </g>
        {Array.from({ length: N }, (_, i) => <rect key={i} x={rx} y={ry(i)} width={280} height={11} fill={tb} />)}
        {/* 冷卻液：冷進（左側下→上）、熱出（右側上→下），經過每一層 */}
        <rect x={rx - 14} y={52} width={10} height={N * 14.5 + 8} fill={cool} opacity={lq} />
        <rect x={rx + 284} y={52} width={10} height={N * 14.5 + 8} fill={hot} opacity={lq} />
        {lq > 0.6 ? Array.from({ length: 16 }, (_, j) => <circle key={`c${j}`} cx={rx - 9} cy={ry(N) - (N * 14.5) * ph(f, 0.025, j, 16)} r={4.5} fill={cool} />) : null}
        {lq > 0.6 ? Array.from({ length: 16 }, (_, j) => <circle key={`h${j}`} cx={rx + 289} cy={ry(0) + (N * 14.5) * ph(f, 0.025, j, 16)} r={4.5} fill={hot} />) : null}
        {lq > 0.6 ? Array.from({ length: N }, (_, i) => <line key={i} x1={rx - 4} y1={ry(i) + 5} x2={rx + 284} y2={ry(i) + 5} stroke={cool} strokeWidth={2} opacity={0.5} strokeDasharray="8 10" strokeDashoffset={-f * 1.5} />) : null}
        <text x={rx + 330} y={104} opacity={lq} style={zh(44, cool, 900)}>冷 進來</text>
        <text x={rx + 330} y={160} opacity={lq} style={zh(44, hot, 900)}>熱 帶走</text>
        <g opacity={ot}><rect x={rx + 330} y={196} width={250} height={96} fill={steel} /><text x={rx + 455} y={258} textAnchor="middle" style={zh(40, onC(H.line), 900)}>機櫃外散熱</text></g>
        <text x={40} y={Hh - 18} opacity={ag} style={zh(34, bad, 900)}>風扇　吹不動</text>
      </svg>
    </Card>
  );
};

export const SrvSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "srv-count") return <Count {...p} />;
  if (kd === "srv-mesh") return <Mesh {...p} />;
  if (kd === "srv-power") return <Power {...p} />;
  if (kd === "srv-cool") return <Cool {...p} />;
  return null;
};
