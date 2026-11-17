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
  const one = T(o, "one"), link = T(o, "link"), cab = T(o, "cable"), find = T(o, "find"), rest = T(o, "rest");
  const merge = tween(f, one, 24, EASE.move), lk = tween(f, link, 30, EASE.move), nb = tween(f, cab, 8, EASE.enter), fd = tween(f, find, 10, EASE.enter), rs = tween(f, rest, 10, EASE.enter);
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
        <text x={650} y={274} opacity={fd} style={zh(36, sig, 900)}>每顆都連到交換器</text>
        <text x={650} y={326} opacity={rs} style={zh(40, H.amber, 900)}>另外 71 顆</text>
        <text x={sx} y={Hh - 14} opacity={lk} style={zh(30, H.text2, 700)}>橘＝九層交換器　示意</text>
      </svg>
    </Card>
  );
};

// ── srv-power：市電 → 電源層（整流）→ 匯流排（銅排）→ 各托盤 → 變成熱，念到哪一段就亮哪一段 ──
const Power: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 400, c = (n: string) => col(m.product, n);
  const el = T(o, "elec"), inn = T(o, "in"), bus = T(o, "bus"), tray = T(o, "tray"), heat = T(o, "heat");
  const a0 = tween(f, el, 8, EASE.enter), a1 = tween(f, inn, 8, EASE.enter), a2 = tween(f, bus, 8, EASE.enter), a3 = tween(f, tray, 8, EASE.enter), hh = tween(f, heat, 22, EASE.move);
  const pwr = c("pwr"), cu = c("cu"), tb = c("trayB"), hot = c("lp_hot"), proc = c("lp_proc"), steel = c("steel");
  const bx = 600, ry = (i: number) => 74 + i * 15;
  const arrow = (x0: number, x1: number, y: number, on: number, key: number) => <g opacity={0.25 + 0.75 * on}>
    <path d={`M${x0} ${y} H${x1 - 10}`} stroke={cu} strokeWidth={8} />
    <path d={`M${x1 - 16} ${y - 12} L${x1} ${y} L${x1 - 16} ${y + 12} Z`} fill={cu} />
    {on > 0.6 ? Array.from({ length: 3 }, (_, j) => <circle key={j} cx={x0 + (x1 - 16 - x0) * ph(f, 0.04, j, 3, key)} cy={y} r={5.5} fill={proc} />) : null}
  </g>;
  const box = (x: number, w: number, label: string, sub: string, on: number, fill: string, tc: string) => <g opacity={0.3 + 0.7 * on}>
    <rect x={x} y={140} width={w} height={110} fill={fill} />
    <text x={x + w / 2} y={192} textAnchor="middle" style={zh(40, tc, 900)}>{label}</text>
    <text x={x + w / 2} y={232} textAnchor="middle" style={zh(sm(30), tc, 700)}>{sub}</text>
  </g>;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {box(28, 130, "市電", "交流電", a0, steel, onC(H.line))}
        {arrow(160, 214, 195, a1, 0)}
        {box(216, 170, "電源層", "整流成直流", a1, pwr, onC(H.amber))}
        {arrow(388, 440, 195, a2, 1)}
        <g opacity={0.3 + 0.7 * a2}><rect x={bx - 130} y={64} width={16} height={N * 15 + 12} fill={cu} /><text x={bx - 150} y={Hh - 44} textAnchor="start" style={zh(sm(34), cu, 900)}>匯流排（銅排）</text></g>
        {Array.from({ length: N }, (_, i) => <g key={i} opacity={0.3 + 0.7 * a3}>
          <rect x={bx} y={ry(i)} width={300} height={12} fill={hh > 0.4 ? hot : tb} />
          <line x1={bx - 114} y1={ry(i) + 6} x2={bx} y2={ry(i) + 6} stroke={cu} strokeWidth={3} />
        </g>)}
        {a3 > 0.6 ? Array.from({ length: 16 }, (_, j) => <circle key={j} cx={bx - 122} cy={ry(0) + 8 + (N * 15 - 16) * ph(f, 0.03, j, 16)} r={4.5} fill={proc} />) : null}
        <text x={bx + 160} y={Hh - 44} textAnchor="middle" opacity={0.3 + 0.7 * a3} style={zh(sm(34), H.text, 900)}>各層托盤</text>
        {hh > 0 ? Array.from({ length: 6 }, (_, j) => { const u = ph(f, 0.025, j, 6, j), xx = bx + 30 + j * 48; return <path key={j} d={`M${xx} ${ry(17) - u * 150} v-22 m-8 9 l8 -11 l8 11`} stroke={hot} strokeWidth={4.5} fill="none" opacity={hh * (1 - u)} />; }) : null}
        <text x={bx + 316} y={120} opacity={hh} style={zh(50, hot, 900)}>變成熱</text>
      </svg>
    </Card>
  );
};

// ── srv-cool：風冷（風扇吹、鰭片熱度升到頂）對比 液冷（冷板水道帶走熱、溫度穩住）──
const Cool: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 400, c = (n: string) => col(m.product, n);
  const air = T(o, "air"), liq = T(o, "liq"), chipf = T(o, "chipf"), out = T(o, "out");
  const ag = tween(f, air, 8, EASE.enter), rise = tween(f, air + 4, 40, EASE.move), dead = tween(f, liq - 6, 10, EASE.enter);
  const lq = tween(f, liq, 10, EASE.enter), flow = tween(f, chipf, 12, EASE.enter), ot = tween(f, out, 10, EASE.enter);
  const cool = c("lp_cool"), hot = c("lp_hot"), bad = c("lp_bad"), steel = c("steel"), cu = c("cuHi"), tb = c("trayB");
  const tempBar = (x: number, v: number, col2: string, label: string, on: number) => <g opacity={on}>
    <rect x={x} y={90} width={26} height={220} fill="none" stroke={H.text3} strokeWidth={2} />
    <rect x={x + 3} y={307 - 214 * v} width={20} height={214 * v} fill={col2} />
    <text x={x + 13} y={340} textAnchor="middle" style={zh(sm(30), H.text2, 800)}>{label}</text>
  </g>;
  const redV = 0.25 + 0.7 * rise;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {/* 左：風冷 */}
        <g opacity={ag * (1 - 0.55 * dead)}>
          <text x={30} y={78} style={zh(36, H.text, 900)}>風冷</text>
          <circle cx={70} cy={200} r={44} fill="none" stroke={steel} strokeWidth={5} />
          {[0, 1, 2].map((j) => <path key={j} d={`M70 200 l${34 * Math.cos(f * 0.35 + j * 2.09)} ${34 * Math.sin(f * 0.35 + j * 2.09)}`} stroke={steel} strokeWidth={9} strokeLinecap="round" />)}
          {[0, 1, 2].map((j) => <path key={j} d={`M${126 + (f * 2 + j * 20) % 50} ${170 + j * 30} h24`} stroke={steel} strokeWidth={4} opacity={0.7} />)}
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={190 + i * 18} y={150} width={9} height={90} fill={rise > 0.6 + i * 0.03 ? hot : steel} />)}
          <rect x={186} y={240} width={170} height={20} fill={tb} />
          {tempBar(372, redV, rise > 0.7 ? bad : hot, "溫度", ag)}
          <text x={190} y={288} opacity={rise} style={zh(sm(32), bad, 900)}>熱卡在鰭片上</text>
          <path d="M184 120 l190 150 m0 -150 l-190 150" stroke={bad} strokeWidth={8} opacity={dead} />
        </g>
        <line x1={W / 2 + 10} y1={70} x2={W / 2 + 10} y2={Hh - 40} stroke={H.lineSoft} strokeWidth={2} strokeDasharray="4 8" opacity={lq} />
        {/* 右：液冷 */}
        <g opacity={lq}>
          <text x={W / 2 + 40} y={78} style={zh(36, cool, 900)}>液冷</text>
          <rect x={W / 2 + 40} y={250} width={300} height={22} fill={steel} />
          <text x={W / 2 + 46} y={268} style={zh(sm(30), onC(H.line), 800)}>晶片</text>
          <rect x={W / 2 + 40} y={186} width={300} height={62} fill={cu} stroke={H.text3} strokeWidth={1.5} />
          <path d={`M${W / 2 + 52} 217 H${W / 2 + 328}`} stroke={H.cardCompare} strokeWidth={22} />
          {Array.from({ length: 12 }, (_, j) => { const u = ph(f, 0.022, j, 12); return <circle key={j} cx={W / 2 + 56 + 256 * u} cy={217} r={6} fill={u < 0.5 ? cool : hot} opacity={flow} />; })}
          <text x={W / 2 + 44} y={176} opacity={flow} style={zh(sm(32), cool, 900)}>冷 →</text>
          <text x={W / 2 + 252} y={176} opacity={flow} style={zh(sm(32), hot, 900)}>→ 熱帶走</text>
          {tempBar(W / 2 + 360, 0.34, cool, "溫度", flow)}
          <text x={W / 2 + 44} y={304} opacity={flow} style={zh(sm(32), H.text, 800)}>水道把熱帶走</text>
          <g opacity={ot}><rect x={W / 2 + 40} y={316} width={300} height={44} fill={steel} /><text x={W / 2 + 190} y={348} textAnchor="middle" style={zh(sm(34), onC(H.line), 900)}>送到機櫃外散熱</text></g>
        </g>
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
