// 2026/11/17 tech-800v：2D 剖面／對照卡（overlay `section` 的 kind 以 "pw-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   pw-compare 54 V vs 800 V：電壓、電流、發熱長條與銅排截面（電流光點）｜pw-chain 800 V 一階一階降到晶片電壓
//   pw-unk 省多少？查不到｜pw-sum 一句話結論
// 數字都是算式或示意（P＝V×I、發熱＝I²R）；顏色讀 H 與 model.json 的 palette，動作時間來自 script.json 的 t（cue）。
import React from "react";
import { FONT_EN, FONT_ZH } from "../../theme";
import { H, sm } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D } from "./engine";
import { col } from "./model";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const mono = (px: number, color: string = H.text2, w = 600): React.CSSProperties => ({ fontFamily: `${H.font.mono}, ${FONT_EN}`, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;

const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? 64, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ position: "absolute", left: 16, top: 10, ...zh(30, onC(H.line), 800), background: H.line, padding: "2px 14px 4px", zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(30), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);

// ── pw-compare：同樣的電，54 V 與 800 V（每個 cue 各有自己的變化：power 公式 P、vxi V×I、low 電壓、big 電流、hot 發熱、thick 變粗、x15 八百伏特欄、x219 兩百多倍、v800／amp 強調、thin 截面縮小）──
const Compare: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 345, c = (n: string) => col(m.product, n);
  const g = (n: string) => T(o, n);
  const cu = c("cu"), cuHi = c("cuHi"), bad = c("lp_bad"), proc = c("lp_proc"), sig = c("lp_sig");
  const aP = tween(f, g("power"), 8, EASE.enter), aVI = tween(f, g("vxi"), 8, EASE.enter);
  const aV = tween(f, g("low") - 2, 10, EASE.enter), aVb = tween(f, g("low"), 16, EASE.move);
  const aIs = tween(f, g("big") - 4, 8, EASE.enter), aI = tween(f, g("big"), 22, EASE.move);
  const aHs = tween(f, g("hot") - 2, 8, EASE.enter), aHot = tween(f, g("hot"), Math.max(20, g("x219") - g("hot")), EASE.move), aThick = tween(f, g("thick"), 14, EASE.move);
  const bShow = tween(f, g("x15") - 4, 10, EASE.enter), bV = tween(f, g("x15"), 16, EASE.move), bI = tween(f, g("x15") + 6, 22, EASE.move), bHot = tween(f, g("x219"), 20, EASE.move);
  const popV = 1 + 0.1 * Math.sin(Math.PI * tween(f, g("v800"), 14, EASE.move)), popA = 1 + 0.12 * Math.sin(Math.PI * tween(f, g("amp"), 14, EASE.move));
  const shrink = tween(f, g("thin") - 2, 22, EASE.move);
  const lenV = [20, 170], lenI = [170, 20];
  const sq0 = 88, sq = sq0 * (1 + 0.14 * aThick), side2 = sq0 - (sq0 - sq0 / 3.85) * shrink;
  const dots = (cx: number, cy: number, s: number, n: number, speed: number, color: string) => Array.from({ length: n }, (_, i) => {
    const u = (((f * speed + i * 0.37) % 1) + 1) % 1; const gx = ((i * 7919) % 100) / 100, gy = (i * 31 % 100) / 100;
    return <circle key={i} cx={cx - s / 2 + 5 + gx * (s - 10)} cy={cy - s / 2 + 5 + ((gy + u) % 1) * (s - 10)} r={2.6} fill={color} opacity={0.95} />; });
  const row = (cx: number, y: number, label: string, len: number, color: string, txt: string, show: number, pop = 1) => {
    const L = Math.max(4, len), inside = L >= 110;
    return (<g opacity={show}><text x={cx} y={y} style={zh(sm(30), H.text2, 700)}>{label}</text>
      <rect x={cx + 84} y={y - 26} width={L} height={32} fill={color} />
      {txt ? <text x={inside ? cx + 84 + L - 8 : cx + 84 + L + 10} y={y} textAnchor={inside ? "end" : "start"} style={{ ...mono(sm(30) * pop, inside ? H.onAccent : color, 900), transformOrigin: "left" }}>{txt}</text> : null}</g>);
  };
  const c0 = 24, c1 = 492, sqY = 124;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={W / 2 - 150} y={Hh - 12} style={mono(40, H.text, 900)} opacity={aP}>P ＝</text>
        <text x={W / 2 - 80} y={Hh - 12} style={mono(40, H.text, 900)} opacity={aVI}>V × I</text>
        <text x={W / 2 + 70} y={Hh - 12} style={zh(sm(30), H.amber, 800)} opacity={aVI}>功率不變</text>
        {/* 54 V */}
        <text x={c0} y={112} style={zh(44, H.amber, 900)} opacity={aV}>54 V 供電</text>
        {row(c0, 156, "電壓", lenV[0], H.text2, "54 V", aV, 1)}
        {row(c0, 204, "電流", 28 + (lenI[0] - 28) * aI, bad, aI > 0.6 ? "18,519 A" : "", aIs)}
        {row(c0, 252, "發熱", 6 + 164 * aHot, bad, bHot > 0.9 ? "×219" : "", aHs)}
        <g opacity={aIs}>
          <rect x={c0 + 340 - (sq - sq0) / 2} y={sqY - (sq - sq0) / 2} width={sq} height={sq} fill={aHot > 0.3 ? bad : cu} opacity={0.35 + 0.65 * (1 - aHot * 0.3)} stroke={cuHi} strokeWidth={3} />
          {dots(c0 + 340 + sq0 / 2, sqY + sq0 / 2, sq, Math.round(8 + 38 * aI), 0.012, proc)}
          <text x={c0 + 340 + sq0 / 2} y={sqY + sq0 + 28} textAnchor="middle" style={zh(sm(30), aThick > 0.5 ? H.amber : H.text2, 700)}>{aThick > 0.5 ? "越做越粗" : "銅排截面"}</text>
        </g>
        {/* 800 V */}
        <g opacity={bShow}>
          <line x1={474} y1={72} x2={474} y2={Hh - 56} stroke={H.lineSoft} strokeWidth={2} strokeDasharray="4 8" />
          <text x={c1} y={112} style={{ ...zh(44 * popV, sig, 900) }}>800 V 供電</text>
          {row(c1, 156, "電壓", 20 + (lenV[1] - 20) * bV, H.text2, "800 V", 1, popV)}
          {row(c1, 204, "電流", 170 - 150 * bI, sig, bI > 0.6 ? "1,250 A" : "", 1, popA)}
          {row(c1, 252, "發熱", 170 - 167 * bHot, sig, bHot > 0.9 ? "×1" : "", tween(f, g("x219"), 8, EASE.enter))}
          <rect x={c1 + 340 + (sq0 - side2) / 2} y={sqY + (sq0 - side2) / 2} width={side2} height={side2} fill={cu} stroke={cuHi} strokeWidth={3} />
          {shrink > 0 ? <rect x={c1 + 340} y={sqY} width={sq0} height={sq0} fill="none" stroke={H.text3} strokeWidth={2} strokeDasharray="6 6" /> : null}
          {dots(c1 + 340 + sq0 / 2, sqY + sq0 / 2, side2, 4 + Math.round(2 * (1 - shrink)), 0.007, proc)}
          <text x={c1 + 340 + sq0 / 2} y={sqY + sq0 + 28} textAnchor="middle" style={zh(sm(30), H.text2, 700)}>{shrink > 0.5 ? "截面約 1/15" : "銅排截面"}</text>
        </g>
        <text x={W - 20} y={Hh - 12} textAnchor="end" style={zh(sm(30), H.text2, 700)} opacity={bHot}>發熱＝I²R，同一條銅排（估算）</text>
      </svg>
    </Card>
  );
};

// ── pw-vrm：降壓一級怎麼做（輸入 12 V → 開關快速切換 → 電感與電容整平 → 約 1 V 給晶片）──
const Vrm: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 345, c = (n: string) => col(m.product, n);
  const t0 = T(o, "chip");
  const proc = c("lp_proc"), sig = c("lp_sig"), cu = c("cuHi"), steel = c("steel");
  const a0 = tween(f, t0, 10, EASE.enter), a1 = tween(f, t0 + 12, 10, EASE.enter), a2 = tween(f, t0 + 24, 10, EASE.enter), a3 = tween(f, t0 + 36, 10, EASE.enter), a4 = tween(f, t0 + 48, 10, EASE.enter);
  const on = Math.floor(f / 7) % 2 === 0;
  const y = 190, dots = (n: number, x0: number, x1: number, color: string, op: number) => Array.from({ length: n }, (_, j) => { const u = (((f * 0.016 + j / n) % 1) + 1) % 1; return <circle key={j} cx={x0 + (x1 - x0) * u} cy={y} r={5} fill={color} opacity={op} />; });
  const coil = Array.from({ length: 5 }, (_, i) => `a30 30 0 0 1 ${i < 4 ? 40 : 40} 0`).join(" ");
  const pulses = Array.from({ length: 12 }, (_, i) => { const x = 250 + i * 15; return `${x},${108} ${x},${68} ${x + 7},${68} ${x + 7},${108}`; }).join(" ");
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a0}><path d={`M40 ${y} H190`} stroke={cu} strokeWidth={8} /><text x={40} y={y - 24} style={mono(44, H.amber, 900)}>12 V 進</text>{dots(3, 40, 190, proc, 1)}</g>
        <g opacity={a1}><rect x={190} y={y - 38} width={80} height={76} fill={H.line} /><text x={230} y={y + 12} textAnchor="middle" style={zh(sm(30), H.onAccent, 900)}>{on ? "通" : "斷"}</text><text x={230} y={y + 70} textAnchor="middle" style={zh(sm(30), H.text2, 700)}>開關</text>
          <polyline points={pulses} fill="none" stroke={proc} strokeWidth={4} opacity={0.9} /><text x={330} y={52} textAnchor="middle" style={zh(sm(30), H.text2, 700)}>快速通斷</text></g>
        <g opacity={a2}><path d={`M270 ${y} H340 m0 0 ${"c0 -34 38 -34 38 0 c0 -34 38 -34 38 0 c0 -34 38 -34 38 0 c0 -34 38 -34 38 0"} H560`} stroke={cu} strokeWidth={8} fill="none" /><text x={415} y={y + 70} textAnchor="middle" style={zh(sm(30), H.text2, 700)}>電感</text>{dots(3, 270, 560, proc, 0.9)}</g>
        <g opacity={a3}><path d={`M600 ${y - 40} V${y + 40} M624 ${y - 40} V${y + 40}`} stroke={steel} strokeWidth={8} /><path d={`M560 ${y} H600 M624 ${y} H700`} stroke={cu} strokeWidth={8} /><text x={612} y={y + 70} textAnchor="middle" style={zh(sm(30), H.text2, 700)}>電容</text>
          <path d={`M620 108 H700`} stroke={sig} strokeWidth={4} /></g>
        <g opacity={a4}><rect x={700} y={y - 44} width={170} height={88} fill={sig} /><text x={785} y={y + 14} textAnchor="middle" style={zh(40, H.onAccent, 900)}>晶片</text>
          <text x={785} y={y + 80} textAnchor="middle" style={mono(44, sig, 900)}>約 1 V</text>{dots(3, 640, 700, sig, 1)}</g>
      </svg>
    </Card>
  );
};

// ── pw-chain：800 V → 50 V → 12 V → 約 1 V ──
const Chain: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 345, c = (n: string) => col(m.product, n);
  const why = T(o, "why"), chip = T(o, "chip") + 20, hi = T(o, "hi"), steps = T(o, "steps"), many = T(o, "many");
  const heat = c("lp_heat"), proc = c("lp_proc"), cu = c("cu");
  const st = [{ v: "800 V", at: hi, h: 130 }, { v: "50 V", at: steps, h: 92 }, { v: "12 V", at: many, h: 62 }, { v: "約 1 V", at: chip, h: 30 }];
  const bw = 150, gap = 56, x0 = 34, yb = Hh - 70;
  const names = ["電源側櫃", "降壓模組", "降壓模組", "晶片"];
  const order = [3, 0, 1, 2];   // 先看到「晶片只吃很低」，再由高往低
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {st.map((s, i) => {
          const a = tween(f, s.at, 10, EASE.move), x = x0 + i * (bw + gap), hh = s.h; const y = yb - hh;
          const gl = Math.max(0, 1 - (f - s.at) / 40);
          return <g key={i} opacity={a} transform={`translate(0 ${(1 - a) * 18})`}>
            <rect x={x} y={y} width={bw} height={hh} fill={i === 3 ? c("lp_sig") : i === 0 ? H.amber : H.line} opacity={0.88} />
            <rect x={x} y={y} width={bw} height={hh} fill="none" stroke={heat} strokeWidth={4 * gl} />
            <text x={x + bw / 2} y={y - 12} textAnchor="middle" style={mono(44, H.text, 900)}>{s.v}</text>
            <text x={x + bw / 2} y={yb + 34} textAnchor="middle" style={zh(sm(30), H.text2, 700)}>{names[i]}</text>
            {i < 3 ? <g opacity={tween(f, st[i + 1].at - 8, 8, EASE.enter)}><path d={`M${x + bw + 6} ${yb - 20} h${gap - 12}`} stroke={proc} strokeWidth={5} /><path d={`M${x + bw + gap - 14} ${yb - 30} l10 10 l-10 10`} stroke={proc} strokeWidth={5} fill="none" />
              <text x={x + bw + gap / 2} y={yb - 36} textAnchor="middle" style={zh(sm(30), heat, 800)}>降</text></g> : null}
          </g>;
        })}
        <text x={W - 24} y={Hh - 14} textAnchor="end" style={zh(sm(30), H.text2, 700)} opacity={tween(f, many + 4, 8, EASE.enter)}>每降一次，就要一級電源</text>
        <text x={W - 24} y={96} textAnchor="end" style={zh(sm(30), H.text2, 700)} opacity={tween(f, why, 8, EASE.enter)}>晶片本身只吃很低的電壓</text>
      </svg>
    </Card>
  );
};

// ── pw-unk：省多少？廠商目標值（非實測）──
const Unk: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 345;
  const a = tween(f, T(o, "save"), 8, EASE.enter), b = tween(f, T(o, "none"), 8, EASE.enter), r = tween(f, T(o, "real"), 8, EASE.enter);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}><rect x={60} y={80} width={330} height={200} fill="none" stroke={H.amber} strokeWidth={5} strokeDasharray="14 10" />
          <text x={225} y={206} textAnchor="middle" style={zh(110, H.amber, 900)}>？</text></g>
        <g opacity={b}><text x={420} y={150} style={zh(38, H.text, 900)}>廠商目標：總成本最多少三成</text></g>
        <g opacity={r}><rect x={420} y={196} width={300} height={60} fill={H.amber} /><text x={570} y={240} textAnchor="middle" style={zh(40, onC(H.amber), 900)}>目標值，非實測</text></g>
      </svg>
    </Card>
  );
};

// ── pw-sum：電壓↑ 電流↓ 銅排細 ──
const Sum: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 345, c = (n: string) => col(m.product, n);
  const up = T(o, "up"), small = T(o, "small"), slim = T(o, "slim"), so = T(o, "so");
  const items = [{ t: "電壓", s: "拉高", at: up, a: "↑" }, { t: "電流", s: "變小", at: small, a: "↓" }, { t: "銅排", s: "變細", at: slim, a: "↓" }];
  const bw = 250, gap = 46, x0 = (W - 3 * bw - 2 * gap) / 2;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={W / 2} y={70} textAnchor="middle" style={zh(sm(34), H.text2, 800)} opacity={tween(f, so, 8, EASE.enter)}>所以</text>
        {items.map((it, i) => { const a = tween(f, it.at - 2, 10, EASE.enter), x = x0 + i * (bw + gap), pop = 1 + 0.08 * Math.sin(Math.PI * tween(f, it.at, 12, EASE.move));
          return <g key={i} opacity={a} transform={`translate(0 ${(1 - a) * 16})`}>
            <rect x={x} y={86} width={bw} height={200} fill={i === 0 ? H.amber : H.line} />
            <text x={x + bw / 2} y={150} textAnchor="middle" style={zh(48, onC(i === 0 ? H.amber : H.line), 900)}>{it.t}</text>
            <text x={x + bw / 2} y={254} textAnchor="middle" style={zh(70 * pop, onC(i === 0 ? H.amber : H.line), 900)}>{it.s} {it.a}</text>
            {i < 2 ? <path d={`M${x + bw + 8} 186 h${gap - 16} m-10 -10 l10 10 l-10 10`} stroke={c("lp_proc")} strokeWidth={5} fill="none" /> : null}
          </g>; })}
      </svg>
    </Card>
  );
};

export const PwSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "pw-compare") return <Compare {...p} />;
  if (kd === "pw-chain") return <Chain {...p} />;
  if (kd === "pw-vrm") return <Vrm {...p} />;
  if (kd === "pw-unk") return <Unk {...p} />;
  if (kd === "pw-sum") return <Sum {...p} />;
  return null;
};
