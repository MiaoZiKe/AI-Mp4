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

// ── pw-compare：同樣的電，54 V 與 800 V ──
const Compare: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 345, c = (n: string) => col(m.product, n);
  const pw = T(o, "pw"), vi = T(o, "vi"), low = T(o, "low"), big = T(o, "big"), hot = T(o, "hot"), x15 = T(o, "x15"), x219 = T(o, "x219"), v800 = T(o, "v800"), amp = T(o, "amp"), thin = T(o, "thin");
  const cu = c("cu"), cuHi = c("cuHi"), bad = c("lp_bad"), proc = c("lp_proc"), sig = c("lp_sig");
  const aF = tween(f, pw, 8, EASE.enter), aVI = tween(f, vi, 8, EASE.enter);
  const aV = tween(f, low - 4, 10, EASE.move), aI = tween(f, big - 6, 24, EASE.move), aHot = tween(f, hot, 36, EASE.move);
  const bShow = tween(f, x15 - 6, 10, EASE.enter), bI = tween(f, amp - 4, 24, EASE.move) , bV = tween(f, v800 - 2, 16, EASE.move), bHot = tween(f, x219 + 6, 24, EASE.move);
  const shrink = tween(f, thin - 2, 22, EASE.move);
  const cols = [{ x: 24, tag: "54 V" }, { x: 492, tag: "800 V" }];
  const lenV = [20, 300], lenI = [300, 20], lenH = [300, 3];
  const sq = 96, side2 = sq - (sq - sq / 3.85) * shrink;   // 800 V 截面：邊長 1/3.85（面積 1/15）
  const dots = (cx: number, cy: number, s: number, n: number, speed: number, color: string) => Array.from({ length: n }, (_, i) => {
    const u = (((f * speed + i * 0.37) % 1) + 1) % 1; const gx = ((i * 7919) % 100) / 100, gy = (i * 31 % 100) / 100;
    return <circle key={i} cx={cx - s / 2 + 5 + gx * (s - 10)} cy={cy - s / 2 + 5 + ((gy + u) % 1) * (s - 10)} r={2.6} fill={color} opacity={0.95} />; });
  const row = (cx: number, y: number, label: string, len: number, color: string, txt: string, show: number) => (
    <g opacity={show}><text x={cx} y={y} style={zh(sm(30), H.text2, 700)}>{label}</text>
      <rect x={cx + 92} y={y - 26} width={Math.max(3, len)} height={30} fill={color} /><text x={cx + 92 + Math.max(3, len) + 10} y={y} style={mono(sm(30), color, 900)}>{txt}</text></g>);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={aF}><text x={W / 2} y={Hh - 18} textAnchor="middle" style={mono(40, H.text, 900)}>P ＝ V × I</text>
          <text x={W / 2 + 160} y={Hh - 18} style={zh(sm(30), H.amber, 800)} opacity={aVI}>功率不變</text></g>
        {/* 54 V */}
        <text x={cols[0].x} y={92} style={zh(46, H.amber, 900)} opacity={aF}>54 V 供電</text>
        {row(cols[0].x, 134, "電壓", lenV[0], H.text2, "54 V", aV)}
        {row(cols[0].x, 182, "電流", 28 + (lenI[0] - 28) * aI, bad, aI > 0.6 ? "18,519 A" : "", aV)}
        {row(cols[0].x, 230, "發熱", 6 + (lenH[0] - 6) * aHot, bad, aHot > 0.7 ? "×219" : "", tween(f, hot - 4, 8, EASE.enter))}
        <g opacity={aF}>
          <rect x={cols[0].x + 348} y={108} width={sq} height={sq} fill={aHot > 0.3 ? bad : cu} opacity={0.35 + 0.65 * (1 - aHot * 0.3)} stroke={cuHi} strokeWidth={3} />
          {dots(cols[0].x + 348 + sq / 2, 108 + sq / 2, sq, Math.round(8 + 38 * aI), 0.012, proc)}
          <text x={cols[0].x + 348 + sq / 2} y={108 + sq + 28} textAnchor="middle" style={zh(sm(30), H.text2, 700)}>銅排截面</text>
        </g>
        {/* 800 V */}
        <g opacity={bShow}>
          <line x1={474} y1={72} x2={474} y2={Hh - 56} stroke={H.lineSoft} strokeWidth={2} strokeDasharray="4 8" />
          <text x={cols[1].x} y={92} style={zh(46, c("lp_sig"), 900)}>800 V 供電</text>
          {row(cols[1].x, 134, "電壓", 20 + (lenV[1] - 20) * bV, H.text2, "800 V", 1)}
          {row(cols[1].x, 182, "電流", 300 - 280 * bI, sig, bI > 0.6 ? "1,250 A" : "", 1)}
          {row(cols[1].x, 230, "發熱", 300 - 297 * bHot, sig, bHot > 0.7 ? "×1" : "", 1)}
          <rect x={cols[1].x + 348 + (sq - side2) / 2} y={108 + (sq - side2) / 2} width={side2} height={side2} fill={cu} stroke={cuHi} strokeWidth={3} />
          {shrink > 0 ? <rect x={cols[1].x + 348} y={108} width={sq} height={sq} fill="none" stroke={H.text3} strokeWidth={2} strokeDasharray="6 6" /> : null}
          {dots(cols[1].x + 348 + sq / 2, 108 + sq / 2, side2, 4 + Math.round(2 * (1 - shrink)), 0.007, proc)}
          <text x={cols[1].x + 348 + sq / 2} y={108 + sq + 28} textAnchor="middle" style={zh(sm(30), H.text2, 700)}>{shrink > 0.5 ? "截面約 1/15" : "銅排截面"}</text>
        </g>
      </svg>
    </Card>
  );
};

// ── pw-chain：800 V → 50 V → 12 V → 約 1 V ──
const Chain: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 345, c = (n: string) => col(m.product, n);
  const why = T(o, "why"), chip = T(o, "chip"), hi = T(o, "hi"), steps = T(o, "steps"), many = T(o, "many");
  const heat = c("lp_heat"), proc = c("lp_proc"), cu = c("cu");
  const st = [{ v: "800 V", at: hi, h: 190 }, { v: "50 V", at: steps, h: 120 }, { v: "12 V", at: many, h: 76 }, { v: "約 1 V", at: chip, h: 36 }];
  const bw = 150, gap = 56, x0 = 34, yb = Hh - 66;
  const names = ["電源側櫃", "降壓模組", "降壓模組", "晶片"];
  const order = [3, 0, 1, 2];   // 先看到「晶片只吃很低」，再由高往低
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {st.map((s, i) => {
          const a = tween(f, s.at, 10, EASE.move), x = x0 + i * (bw + gap), hh = 36 + (s.h - 36) * 1; const y = yb - hh;
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

// ── pw-unk：省多少？廠商目標，沒有實際機房數字 ──
const Unk: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 345;
  const save = T(o, "save"), none = T(o, "none"), real = T(o, "real");
  const a = tween(f, save, 8, EASE.enter), b = tween(f, none, 8, EASE.enter), r = tween(f, real, 8, EASE.enter);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}><rect x={60} y={80} width={330} height={200} fill="none" stroke={H.amber} strokeWidth={5} strokeDasharray="14 10" />
          <text x={225} y={206} textAnchor="middle" style={zh(110, H.amber, 900)}>？</text></g>
        <g opacity={b}><text x={430} y={130} style={zh(46, H.text, 900)}>廠商目標：總成本最多少三成</text>
          <text x={430} y={186} style={zh(sm(34), H.text2, 700)}>（目標值，不是實測）</text></g>
        <g opacity={r}><rect x={430} y={216} width={470} height={60} fill={H.amber} /><text x={665} y={260} textAnchor="middle" style={zh(40, onC(H.amber), 900)}>實際機房數字：查不到</text></g>
      </svg>
    </Card>
  );
};

// ── pw-sum：電壓↑ 電流↓ 銅排細 ──
const Sum: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 345, c = (n: string) => col(m.product, n);
  const up = T(o, "up"), small = T(o, "small"), slim = T(o, "slim");
  const items = [{ t: "電壓", s: "拉高", at: up, a: "↑" }, { t: "電流", s: "變小", at: small, a: "↓" }, { t: "銅排", s: "變細", at: slim, a: "↓" }];
  const bw = 250, gap = 46, x0 = (W - 3 * bw - 2 * gap) / 2;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
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
  if (kd === "pw-unk") return <Unk {...p} />;
  if (kd === "pw-sum") return <Sum {...p} />;
  return null;
};
