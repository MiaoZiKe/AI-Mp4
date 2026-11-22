// 2026/11/17 tech-cooling：液冷的 2D 示意卡（overlay `section` 的 kind 以 "cool-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   cool-cups 同體積水與空氣能裝的熱｜cool-plate 冷板側視剖面（熱從晶片傳進銅、水沿微通道吸熱變色）｜cool-loop 一條迴路（冷板→分歧管→CDU→乾冷器）
//   cool-split 冷板與風扇各帶走多少熱｜cool-next 二選一＋下一支
// 全部示意；顏色讀 H 與 model.json 的 palette；時間全部來自 script.json 的 t（cue）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, sm, CARD_HEAD, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D } from "./engine";
import { col } from "./model";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(30), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const ph = (f: number, sp: number, j: number, n: number, seed = 0) => (((f * sp + j / n + seed * 0.17) % 1) + 1) % 1;
/** 溫度色：0 冷（藍）→ 0.5 暖（琥珀）→ 1 熱（紅） */
const tcol = (m: Model3D, u: number) => {
  const c = (n: string) => col(m.product, n);
  return u < 0.5 ? mix2(c("lp_sig"), c("lp_warm"), u * 2) : mix2(c("lp_warm"), c("lp_bad"), (u - 0.5) * 2);
};
const hex = (s: string) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const mix2 = (a: string, b: string, t: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`; };

// ── cool-cups ──
const Cups: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, c = (n: string) => col(m.product, n);
  const same = T(o, "same"), times = T(o, "times"), water = T(o, "water"), about = T(o, "about"), carry = T(o, "carry");
  const a = tween(f, same, 10, EASE.enter), nA = tween(f, same + 10, 10, EASE.enter), nB = tween(f, carry, 30, EASE.move), pop = 1 + 0.12 * Math.sin(Math.PI * tween(f, times, 10, EASE.move));
  const cube = c("cube"), glass = c("glass"), wat = c("waterB"), bad = c("lp_bad");
  const cx = [130, 380], base = 280, ch = 150, cw = 120;
  const cubes = (n: number, x: number, prog: number) => Array.from({ length: n }, (_, i) => { const col_ = i % 4, row = Math.floor(i / 4); const on = i < Math.round(n * prog);
    return <rect key={i} x={x + 8 + col_ * 26} y={base - 22 - row * 26} width={22} height={22} fill={cube} opacity={on ? 1 : 0} />; });
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}>
          <rect x={cx[0]} y={base - ch} width={cw} height={ch} fill={glass} opacity={0.35} stroke={H.text3} strokeWidth={2} />
          <rect x={cx[1]} y={base - ch} width={cw} height={ch} fill={glass} opacity={0.35} stroke={H.text3} strokeWidth={2} />
          <rect x={cx[1] + 2} y={base - ch * 0.82} width={cw - 4} height={ch * 0.82 - 2} fill={wat} opacity={0.55} />
          {cubes(1, cx[0] + 6, tween(f, same + 4, 6, EASE.enter))}
          {cubes(12, cx[1] + 6, nB)}
          <text x={cx[0] + cw / 2} y={base + 36} textAnchor="middle" style={zh(34, H.text, 800)}>空氣</text>
          <text x={cx[1] + cw / 2} y={base + 36} textAnchor="middle" style={zh(34, H.text, 800)}>水</text>
        </g>
        <text x={cx[0] + cw / 2} y={base - ch - 16} textAnchor="middle" opacity={nA} style={zh(46, bad, 900)}>1 份</text>
        <text x={cx[1] + cw / 2} y={base - ch - 16} textAnchor="middle" opacity={nB} style={zh(46, c("lp_sig"), 900)}>12 份</text>
        <text x={540} y={150} opacity={tween(f, times, 8, EASE.enter)} style={zh(92 * pop, H.amber, 900)}>約 3,450 倍</text>
        <text x={546} y={200} opacity={tween(f, about, 8, EASE.enter)} style={zh(30, H.text, 800)}>同體積、升高 1 度，帶走的熱</text>
        <text x={546} y={252} opacity={tween(f, water, 8, EASE.enter)} style={zh(sm(32), H.text2, 700)}>改讓水來搬熱（物性計算）</text>
      </svg>
    </Card>
  );
};

// ── cool-plate：冷板側視剖面 ──
const Plate: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = (n: string) => col(m.product, n);
  const chan = T(o, "chan"), inn = T(o, "inn"), hot = T(o, "hot"), out = T(o, "out");
  const g1 = tween(f, chan, 10, EASE.enter), gi = tween(f, inn, 14, EASE.move), gh = tween(f, hot, 20, EASE.move), go = tween(f, out, 12, EASE.move);
  const x0 = 40, x1 = 560, yDie = 262, yPaste = 252, yBase = 226, yCh = 148;
  const cu = c("cu"), si = c("si"), heat = c("lp_heat");
  const Nf = 14, fw = (x1 - x0 - 40) / Nf;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={x0 + 120} y={yDie} width={280} height={42} fill={si} />
        <rect x={x0 + 120} y={yDie} width={280} height={8} fill={mix2(si, heat, 0.3 + 0.7 * gh)} />
        <text x={x0 + 126} y={yDie + 34} style={zh(30, H.text, 800)}>晶片（發熱）</text>
        <rect x={x0 + 120} y={yPaste} width={280} height={10} fill={c("paste")} />
        <rect x={x0} y={yBase} width={x1 - x0} height={26} fill={cu} />
        <text x={x0 + 8} y={yBase + 20} style={zh(26, onC(H.amber), 800)}>銅底</text>
        <rect x={x0} y={yCh - 24} width={x1 - x0} height={14} fill={cu} opacity={0.8} />
        {Array.from({ length: Nf + 1 }, (_, i) => <rect key={i} x={x0 + 20 + i * fw - 3} y={yCh - 12} width={6} height={yBase - yCh + 12} fill={cu} opacity={g1} />)}
        {/* 熱從晶片往上傳進銅（箭頭由下往上、越上越淡） */}
        {gh > 0 ? [0, 1, 2, 3, 4].map((j) => { const xx = x0 + 150 + j * 54, p = ph(f, 0.025, j, 5); return <g key={j} opacity={gh * (1 - p) * 0.95}>
          <path d={`M${xx} ${yDie - 2 - p * 70} v-26 m-9 10 l9 -12 l9 12`} stroke={heat} strokeWidth={5} fill="none" strokeLinecap="round" /></g>; }) : null}
        {/* 水：從左進、沿通道往右、顏色隨位置由藍變橘變紅 */}
        {gi > 0 ? Array.from({ length: 28 }, (_, j) => { const u = ph(f, 0.012, j, 28, j % 3); const x = x0 + 20 + (x1 - x0 - 40) * u; if (u > gi + 0.05 && out < 0.05) return null;
          const t = Math.max(0, Math.min(1, ((u - 0.3) / 0.5) * gh)); const y = yCh + 12 + (j % 3) * 16;
          return <circle key={j} cx={x} cy={y} r={5.5} fill={tcol(m, u < 0.3 ? 0 : t)} />; }) : null}
        <path d={`M${x0 - 36} ${yCh + 28} h46`} stroke={c("lp_sig")} strokeWidth={7} opacity={gi} />
        <path d={`M${x1 - 6} ${yCh + 28} h46`} stroke={c("lp_bad")} strokeWidth={7} opacity={go} />
        <text x={x0} y={yCh - 38} opacity={gi} style={zh(34, c("lp_sig"), 900)}>冷水進</text>
        <text x={x1} y={yCh - 38} textAnchor="end" opacity={go} style={zh(34, c("lp_bad"), 900)}>熱水出</text>
        <text x={(x0 + x1) / 2} y={yCh - 40} textAnchor="middle" opacity={g1} style={zh(sm(30), H.text2, 700)}>微通道（很多條細水道）</text>
        {/* 右側步驟 */}
        {[["①", "熱從晶片傳進銅", hot - 4, heat], ["②", "水沿細水道吸熱", hot + 6, c("lp_warm")], ["③", "變熱的水從另一端流出", out, c("lp_bad")]].map(([n, t, at, cc], i) =>
          <text key={i} x={610} y={110 + i * 62} opacity={tween(f, at as number, 8, EASE.enter)} style={zh(34, H.text, 800)}><tspan fill={cc as string}>{n as string}</tspan> {t as string}</text>)}
        <rect x={610} y={Hh - 66} width={300} height={14} fill={`url(#tg${o.at})`} />
        <defs><linearGradient id={`tg${o.at}`} x1="0" x2="1"><stop offset="0" stopColor={c("lp_sig")} /><stop offset="0.5" stopColor={c("lp_warm")} /><stop offset="1" stopColor={c("lp_bad")} /></linearGradient></defs>
        <text x={610} y={Hh - 18} style={zh(sm(30), H.text2, 700)}>較冷</text><text x={910} y={Hh - 18} textAnchor="end" style={zh(sm(30), H.text2, 700)}>較熱（顏色示意，不標溫度）</text>
      </svg>
    </Card>
  );
};

// ── cool-loop：一條迴路 ──
const Loop: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300, c = (n: string) => col(m.product, n);
  const names: [string, string, string][] = [["冷板", "吸熱", "plate"], ["分歧管＋快接頭", "分水、可拔插", "mani"], ["CDU", "把熱交給機房水", "cdu"], ["乾冷器", "放掉熱", "dry"]];
  const bw = 196, gap = 56, x0 = 24, y0 = 92, bh = 96;
  const on = names.map(([, , key]) => tween(f, T(o, key), 8, EASE.enter));
  const link = (i: number) => Math.min(on[i], on[i + 1]);
  const cc = [c("lp_sig"), c("lp_sig"), c("lp_warm"), c("lp_bad")];
  const hotT = [0.9, 0.85, 0.5, 0.2];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {names.map(([n, d], i) => { const x = x0 + i * (bw + gap); const a = on[i]; const act = a > 0.5 && (i === 3 || on[i + 1] < 0.5);
          return <g key={i} opacity={0.25 + 0.75 * a}>
            <rect x={x} y={y0} width={bw} height={bh} fill={H.cardCompare} stroke={act ? H.amber : H.text3} strokeWidth={act ? 6 : 3} />
            <text x={x + bw / 2} y={y0 + 44} textAnchor="middle" style={zh(i === 1 ? 29 : 38, H.text, 900)}>{n}</text>
            <text x={x + bw / 2} y={y0 + 80} textAnchor="middle" style={zh(sm(30), H.text2, 700)}>{d}</text>
            <rect x={x} y={y0 + bh} width={bw} height={10} fill={tcol(m, hotT[i])} />
          </g>; })}
        {[0, 1, 2].map((i) => { const xa = x0 + i * (bw + gap) + bw, xb = xa + gap, a = link(i);
          return <g key={i} opacity={a}><path d={`M${xa} ${y0 + 48} H${xb}`} stroke={tcol(m, hotT[i] * 0.6 + 0.25)} strokeWidth={6} /><path d={`M${xb - 12} ${y0 + 36} l12 12 l-12 12`} stroke={tcol(m, hotT[i] * 0.6 + 0.25)} strokeWidth={6} fill="none" />
            {[0, 1].map((j) => <circle key={j} cx={xa + gap * ph(f, 0.03, j, 2)} cy={y0 + 48} r={5} fill={H.amber} />)}</g>; })}
        {/* 回流：底下一條冷水管 */}
        {(() => { const xa = x0 + 3 * (bw + gap) + bw / 2, xb = x0 + bw / 2, yy = y0 + bh + 58, a = tween(f, T(o, "loop"), 14, EASE.move);
          return <g opacity={a}><path d={`M${xa} ${y0 + bh + 10} V${yy} H${xb} V${y0 + bh + 10}`} stroke={c("lp_sig")} strokeWidth={6} fill="none" />
            {[0, 1, 2, 3].map((j) => { const u = ph(f, 0.014, j, 4); const L1 = yy - y0 - bh - 10, L2 = xa - xb, L3 = L1, tot = L1 + L2 + L3, d = u * tot; let px = xa, py = y0 + bh + 10 + d;
              if (d > L1 && d <= L1 + L2) { px = xa - (d - L1); py = yy; } else if (d > L1 + L2) { px = xb; py = yy - (d - L1 - L2); } return <circle key={j} cx={px} cy={py} r={6} fill={c("lp_sig")} />; })}
            <text x={(xa + xb) / 2} y={yy + 34} textAnchor="middle" style={zh(34, c("lp_sig"), 900)}>降溫的水，一直循環回來</text></g>; })()}
      </svg>
    </Card>
  );
};

// ── cool-split：冷板帶走多少、風扇帶走多少 ──
const Split: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300, c = (n: string) => col(m.product, n);
  const notall = T(o, "notall"), pct = T(o, "pct"), fan = T(o, "fan");
  const a = tween(f, notall, 14, EASE.move), b = tween(f, pct, 12, EASE.enter), cf = tween(f, fan, 8, EASE.enter);
  const cx = 190, cy = 160, r = 100, p = 0.85 * a;
  const arc = (t0: number, t1: number) => { const A0 = -Math.PI / 2 + t0 * 2 * Math.PI, A1 = -Math.PI / 2 + t1 * 2 * Math.PI; return `M${cx} ${cy} L${cx + r * Math.cos(A0)} ${cy + r * Math.sin(A0)} A${r} ${r} 0 ${t1 - t0 > 0.5 ? 1 : 0} 1 ${cx + r * Math.cos(A1)} ${cy + r * Math.sin(A1)} Z`; };
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={arc(0, p)} fill={c("lp_sig")} />
        <path d={arc(p, p + 0.15 * b)} fill={c("lp_warm")} />
        <text x={cx} y={cy + 12} textAnchor="middle" opacity={a} style={zh(40, H.onAccent, 900)}> </text>
        <text x={350} y={118} opacity={a} style={zh(42, c("lp_sig"), 900)}>冷板　約 8～9 成</text>
        <text x={350} y={178} opacity={b} style={zh(42, c("lp_warm"), 900)}>風扇　約 1～2 成</text>
        <text x={350} y={222} opacity={b} style={zh(sm(32), H.text2, 700)}>業界說法，各家不同</text>
        <g opacity={cf} transform={`translate(780 150) rotate(${f * 16})`}>{[0, 1, 2].map((j) => <rect key={j} x={-9} y={-62} width={18} height={62} fill={c("lp_warm")} transform={`rotate(${j * 120})`} />)}<circle r={12} fill={c("steel")} /></g>
        <text x={780} y={236} textAnchor="middle" opacity={cf} style={zh(42, H.text, 900)}>靠風扇帶走</text>
      </svg>
    </Card>
  );
};

// ── cool-next：二選一＋下一支 ──
const Next: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300, c = (n: string) => col(m.product, n);
  const more = T(o, "more"), wire = T(o, "wire"), volt = T(o, "volt"), next = T(o, "next"), v8 = T(o, "v8");
  const a = tween(f, more, 10, EASE.enter), b = tween(f, wire, 10, EASE.enter), v = tween(f, volt, 10, EASE.enter), n = tween(f, next, 10, EASE.enter), e8 = tween(f, v8, 8, EASE.enter);
  const pulse = 1 + 0.06 * Math.sin(f * 0.25);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={W / 2} y={92} textAnchor="middle" opacity={a} style={zh(40, H.text, 900)}>機櫃還會更耗電，二選一</text>
        <g opacity={b}><rect x={60} y={112} width={380} height={80} fill="none" stroke={c("cableCu")} strokeWidth={6} /><rect x={90} y={142} width={320} height={16 * pulse} fill={c("cableCu")} /><text x={250} y={232} textAnchor="middle" style={zh(40, H.text, 900)}>電線加粗</text></g>
        <g opacity={v}><rect x={512} y={112} width={380} height={80} fill="none" stroke={c("lp_proc")} strokeWidth={6} /><text x={702} y={176} textAnchor="middle" opacity={e8} style={zh(70 * pulse, c("lp_proc"), 900)}>800 V</text><path d={`M600 170 l20 -26 l20 26 M620 144 v44`} stroke={c("lp_proc")} strokeWidth={6} fill="none" opacity={1 - e8} /><text x={702} y={232} textAnchor="middle" style={zh(40, H.text, 900)}>電壓拉高</text></g>
        <text x={476} y={166} textAnchor="middle" opacity={v} style={zh(44, H.text2, 900)}>或</text>
        <g opacity={n}><rect x={W / 2 - 260} y={Hh - 58} width={520} height={46} fill={H.amber} /><text x={W / 2} y={Hh - 22} textAnchor="middle" style={zh(34, onC(H.amber), 900)}>下一支 ▸ 八百伏特</text></g>
      </svg>
    </Card>
  );
};


// ── cool-hx：板式熱交換器剖面（熱側由上往下、冷側由下往上，逆向，隔著金屬片傳熱） ──
const Hx: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 310, c = (n: string) => col(m.product, n);
  const cdu = T(o, "cdu"), give = T(o, "give"), cool = T(o, "cool");
  const a = tween(f, cdu, 10, EASE.enter), g = tween(f, give, 16, EASE.move), cl = tween(f, cool, 12, EASE.enter);
  const x0 = 60, y0 = 106, hh = 152, n = 9, pw = 30, gp = 20;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={x0 - 14} y={y0 - 12} width={n * (pw + gp) + 28} height={hh + 24} fill="none" stroke={H.text3} strokeWidth={3} />
        {Array.from({ length: n }, (_, i) => { const x = x0 + i * (pw + gp), hot = i % 2 === 0; return <g key={i} opacity={a}>
          <rect x={x} y={y0} width={pw} height={hh} fill={hot ? c("lp_bad") : c("lp_sig")} opacity={0.18} />
          <rect x={x - 3} y={y0} width={4} height={hh} fill={c("steelHi")} />
          {Array.from({ length: 6 }, (_, j) => { const u = ph(f, 0.016, j, 6, i * 0.31); const yy = hot ? y0 + 8 + u * (hh - 16) : y0 + hh - 8 - u * (hh - 16);
            const tt = hot ? 1 - u * 0.9 * g : u * 0.9 * g; return <circle key={j} cx={x + pw / 2} cy={yy} r={6} fill={tcol(m, hot ? Math.max(0.05, tt) : Math.max(0.05, tt))} />; })}
        </g>; })}
        <text x={x0} y={y0 - 14} opacity={a} style={zh(sm(30), c("lp_bad"), 800)}>機櫃來的熱水</text>
        <text x={x0 + n * (pw + gp) - 20} y={y0 + hh + 40} textAnchor="end" opacity={a} style={zh(sm(30), c("lp_sig"), 800)}>機房冷卻水</text>
        {/* 熱箭頭：水平穿過金屬片 */}
        {g > 0 ? [0, 1, 2, 3].map((j) => { const yy = y0 + 24 + j * 36, xx = x0 + 60 + ((f * 0.9 + j * 17) % 200); return <path key={j} d={`M${xx} ${yy} h26 m-9 -9 l9 9 l-9 9`} stroke={c("lp_heat")} strokeWidth={5} fill="none" opacity={g * 0.9} />; }) : null}
        <text x={560} y={110} opacity={tween(f, cdu + 6, 8, EASE.enter)} style={zh(36, H.text, 800)}>① 兩邊的水各走各的</text>
        <text x={560} y={170} opacity={tween(f, give, 8, EASE.enter)} style={zh(36, H.text, 800)}>② 熱隔著金屬片傳過去</text>
        <text x={560} y={230} opacity={cl} style={zh(36, H.text, 800)}>③ 熱水降溫、冷水變暖</text>
        <text x={560} y={278} opacity={cl} style={zh(sm(30), H.text2, 700)}>顏色示意，不標溫度</text>
      </svg>
    </Card>
  );
};

export const CoolSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "cool-cups") return <Cups {...p} />;
  if (kd === "cool-plate") return <Plate {...p} />;
  if (kd === "cool-loop") return <Loop {...p} />;
  if (kd === "cool-hx") return <Hx {...p} />;
  if (kd === "cool-split") return <Split {...p} />;
  if (kd === "cool-next") return <Next {...p} />;
  return null;
};
