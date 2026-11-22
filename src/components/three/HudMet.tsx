// 2026/11/20 tech-metrology：量測與檢測的 2D 示意卡（overlay `section` 的 kind 以 "met-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   met-prev 磨平後、兩層差兩奈米｜met-layer 一層層做、一步歪全白做｜met-film 光量膜厚（兩道反射→亮暗→厚度）｜met-cd 電子束量線寬（邊緣訊號峰）｜
//   met-ovl 疊對（±1 階亮度差＝歪多少）｜met-def 光學快粗→電子束慢細｜met-loop 量完：送回曝光機／挑出晶圓｜met-co 誰在做｜met-step 這一支在哪
// 全部示意；結構一開始就完整畫出（不留空框），念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。顏色讀 model.json 的 palette。
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
const cc = (m: Model3D) => (n: string) => col(m.product, n);
/** 念到之前是 lo 的不透明度（結構已畫好），念到時 10 幀內亮到 1 */
const lit = (f: number, at: number, lo = 0.55) => lo + (1 - lo) * tween(f, at, 10, EASE.enter);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const ph = (f: number, sp: number, j: number, n: number) => (((f * sp + j / n) % 1) + 1) % 1;
/** 箭頭線段 */
const Arr: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; o?: number; dash?: string }> = ({ x1, y1, x2, y2, c, w = 5, o = 1, dash }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = w * 2.6;
  return <g opacity={o}><path d={`M${x1} ${y1} L${x2 - Math.cos(a) * s * 0.6} ${y2 - Math.sin(a) * s * 0.6}`} stroke={c} strokeWidth={w} strokeDasharray={dash} fill="none" />
    <path d={`M${x2} ${y2} L${x2 - Math.cos(a - 0.45) * s} ${y2 - Math.sin(a - 0.45) * s} L${x2 - Math.cos(a + 0.45) * s} ${y2 - Math.sin(a + 0.45) * s} Z`} fill={c} /></g>;
};
/** 光點沿一段折線跑（光／電子／訊號）；r＝半徑 */
const Dots: React.FC<{ pts: number[][]; f: number; n: number; sp: number; c: string; r: number; o?: number; minus?: boolean }> = ({ pts, f, n, sp, c, r, o = 1, minus }) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = seg.reduce((a, b) => a + b, 0);
  const at = (u: number) => { let d = u * tot, k = 0; while (k < seg.length - 1 && d > seg[k]) { d -= seg[k]; k++; } const t = seg[k] ? d / seg[k] : 0; return [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * t, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * t]; };
  return <g opacity={o}>{Array.from({ length: n }, (_, j) => { const u = ph(f, sp, j, n), [x, y] = at(u), e = Math.min(1, u * 8, (1 - u) * 8);
    return <g key={j} opacity={e}><circle cx={x} cy={y} r={r} fill={c} />{minus ? <path d={`M${x - r * 0.55} ${y} h${r * 1.1}`} stroke="#fff" strokeWidth={Math.max(1.5, r * 0.3)} /> : null}</g>; })}</g>;
};
const Check: React.FC<{ x: number; y: number; s: number; c: string; o?: number }> = ({ x, y, s, c, o = 1 }) => <path opacity={o} d={`M${x} ${y} l${s * 0.35} ${s * 0.35} l${s * 0.65} ${-s * 0.75}`} stroke={c} strokeWidth={s * 0.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />;

// ── met-prev：磨平之後 → 量量看平不平 → 兩層線路疊起來 → 只差約兩奈米 → 怎麼量？ ──
const Prev: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, c = cc(m);
  const a = lit(f, T(o, "flat")), ck = on(f, T(o, "check")), tw = lit(f, T(o, "two"), 0.35), nm = on(f, T(o, "nm")), q = on(f, T(o, "ask"));
  const x0 = 34, w = 470, yT = 184;          // 膜頂
  const scan = x0 + 20 + (w - 40) * ph(f, 0.012, 0, 1);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}>
          <rect x={x0} y={yT} width={w} height={70} fill={c("film")} /><rect x={x0} y={yT + 70} width={w} height={36} fill={c("si")} />
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={x0 + 24 + i * 76} y={yT + 26} width={40} height={30} fill={c("m1")} />)}
          <text x={x0} y={yT + 136} style={zh(sm(30), H.text2, 800)}>磨平的膜（下層線路在裡面）</text>
        </g>
        <g opacity={ck}>
          <path d={`M${x0} ${yT - 4} H${x0 + w}`} stroke={c("lp_good")} strokeWidth={4} strokeDasharray="12 8" />
          <rect x={scan - 16} y={106} width={32} height={24} rx={4} fill={H.text2} /><path d={`M${scan} 130 V${yT - 6}`} stroke={c("litWRim")} strokeWidth={4} />
          <text x={x0 + 4} y={96} style={zh(sm(30), c("lp_good"), 900)}>量量看：平不平？</text>
        </g>
        <g opacity={tw}>
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={x0 + 24 + i * 76 + 7 * nm} y={yT - 34} width={40} height={30} fill={c("m2")} />)}
          <text x={x0 + w - 4} y={96} textAnchor="end" style={zh(sm(30), c("m2"), 900)}>上層線路</text>
        </g>
        <g opacity={nm}>
          <path d={`M${x0 + 24 + 2 * 76} ${yT - 60} V${yT + 64}`} stroke={H.amber} strokeWidth={3} /><path d={`M${x0 + 24 + 2 * 76 + 7} ${yT - 60} V${yT + 64}`} stroke={H.amber} strokeWidth={3} />
        </g>
        <line x1={540} y1={60} x2={540} y2={Hh - 20} stroke={H.lineSoft} strokeWidth={3} />
        <g opacity={lit(f, T(o, "two"), 0.45)}>
          <text x={572} y={110} style={zh(36, H.text, 900)}>兩層線路疊起來</text>
          <text x={572} y={192} style={zh(56, H.amber, 900)} opacity={0.35 + 0.65 * nm}>只差約 2 奈米</text>
        </g>
        <g opacity={0.35 + 0.65 * q}><rect x={572} y={226} width={330} height={76} fill={q > 0.5 ? H.amber : H.cardCompare} stroke={H.amber} strokeWidth={4} />
          <text x={737} y={278} textAnchor="middle" style={zh(42, q > 0.5 ? onC(H.amber) : H.amber, 900)}>這要怎麼量？</text></g>
      </svg>
    </Card>
  );
};

// ── met-layer：一層層做 → 前面歪了 → 後面全白做 → 每一步都量 → 還要找缺陷 ──
const Layer: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const ly = T(o, "ly"), ea = on(f, T(o, "early")), wa = on(f, T(o, "waste")), ev = T(o, "every"), df = on(f, T(o, "defect"));
  const names = [["矽基板", "si"], ["電晶體", "gate"], ["金屬一", "m1"], ["金屬二", "m2"]] as const;
  // 2026/11/20 使用者回饋：「金屬二」字壓到中間分隔線、上層色塊貼著標題。版面固定：色塊 40–366（含歪掉位移 26）、打勾 376–408、字 420–520、分隔線 560；最上層 y≥92（標題下緣約 52）
  const x0 = 40, bw = 300, bh = 44, y0 = 312, sh = 26;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {names.map(([n, cl], i) => { const y = y0 - i * (bh + 14) - bh, a = lit(f, ly + i * 5, 0.5), dx = i === 2 ? sh * ea : 0, bad = i === 2 ? ea : i === 3 ? wa : 0, ok = on(f, ev + 8 * i);
          return <g key={i} opacity={a}>
            <rect x={x0 + dx} y={y} width={bw} height={bh} fill={c(cl)} stroke={bad > 0.5 ? c("lp_bad") : H.text3} strokeWidth={bad > 0.5 ? 5 : 2} />
            {i === 3 && wa > 0 ? <g opacity={wa}>{Array.from({ length: 8 }, (_, j) => <path key={j} d={`M${x0 + 4 + j * 37} ${y + bh} l28 ${-bh}`} stroke={c("lp_bad")} strokeWidth={4} />)}</g> : null}
            <text x={x0 + bw + sh + 54} y={y + 33} style={zh(sm(30), bad > 0.5 ? c("lp_bad") : H.text, 900)}>{n}</text>
            <g opacity={ok}><circle cx={x0 + bw + sh + 26} cy={y + bh / 2} r={16} fill={c("lp_good")} /><Check x={x0 + bw + sh + 17} y={y + bh / 2} s={18} c="#fff" /></g>
          </g>; })}
        <g opacity={df}><circle cx={x0 + 260} cy={y0 - 3 * (bh + 14) - bh + bh / 2} r={14} fill={c("defO")} /><circle cx={x0 + 260} cy={y0 - 3 * (bh + 14) - bh + bh / 2} r={24} fill="none" stroke={c("defO")} strokeWidth={4} opacity={0.5 + 0.5 * Math.sin(f * 0.3)} /></g>
        <line x1={560} y1={60} x2={560} y2={Hh - 20} stroke={H.lineSoft} strokeWidth={3} />
        {[["① 前面歪了", ea, c("lp_bad")], ["② 後面全白做", wa, c("lp_bad")], ["③ 每一步都要量", on(f, ev), c("lp_good")], ["④ 還要找缺陷", df, H.amber]].map(([t, a, cl], i) =>
          <text key={i} x={590} y={112 + i * 62} opacity={0.4 + 0.6 * (a as number)} style={zh(38, (a as number) > 0.5 ? (cl as string) : H.text, 900)}>{t as string}</text>)}
      </svg>
    </Card>
  );
};

// ── met-film：光打在膜上 → 表面、底部各反射一次 → 兩道光疊起來 → 亮暗不同 → 算出厚度 ──
const Film: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const hi = on(f, T(o, "hit")), rf = on(f, T(o, "refl")), ov = on(f, T(o, "overlap")), bd = on(f, T(o, "bd")), ca = on(f, T(o, "calc"));
  const yT = 220, yB = 276, px = 240, qx = 300;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={30} y={yT} width={480} height={yB - yT} fill={c("film")} /><rect x={30} y={yB} width={480} height={44} fill={c("si")} />
        <text x={40} y={yT + 38} style={zh(sm(30), "#fff", 900)}>膜</text><text x={40} y={yB + 34} style={zh(sm(30), "#fff", 900)}>矽基板</text>
        <path d={`M18 ${yT} v${yB - yT}`} stroke={H.amber} strokeWidth={4} opacity={0.4 + 0.6 * ca} /><path d={`M10 ${yT} h16 M10 ${yB} h16`} stroke={H.amber} strokeWidth={4} opacity={0.4 + 0.6 * ca} />
        <g opacity={0.35 + 0.65 * hi}><path d={`M80 80 L${px} ${yT}`} stroke={c("litWRim")} strokeWidth={6} /><Dots pts={[[80, 80], [px, yT]]} f={f} n={4} sp={0.04} c={c("litWRim")} r={6} o={hi} />
          <text x={40} y={118} style={zh(sm(30), H.text, 900)}>光</text></g>
        <g opacity={0.3 + 0.7 * rf}>
          <path d={`M${px} ${yT} L${px + 150} 70`} stroke={c("litARim")} strokeWidth={6} />
          <path d={`M${px} ${yT} L${px + 30} ${yB} L${qx} ${yT} L${qx + 150} 70`} stroke={c("litCRim")} strokeWidth={6} fill="none" />
          <Dots pts={[[px, yT], [px + 150, 70]]} f={f} n={3} sp={0.04} c={c("litARim")} r={6} o={rf} /><Dots pts={[[px, yT], [px + 30, yB], [qx, yT], [qx + 150, 70]]} f={f} n={4} sp={0.035} c={c("litCRim")} r={6} o={rf} />
          <text x={px + 58} y={152} textAnchor="end" style={zh(sm(30), c("litARim"), 900)}>表面</text><text x={px + 100} y={yT + 46} style={zh(sm(30), c("litCRim"), 900)}>底部</text>
        </g>
        <line x1={540} y1={60} x2={540} y2={Hh - 20} stroke={H.lineSoft} strokeWidth={3} />
        {/* 兩道光疊起來：兩條波（相位差跟著膜厚變）＋相加 */}
        <g opacity={0.3 + 0.7 * ov}>
          <text x={566} y={92} style={zh(sm(30), H.text, 900)}>兩道光疊起來</text>
          {[0, 1].map((j) => <path key={j} d={Array.from({ length: 41 }, (_, i) => `${i ? "L" : "M"}${566 + i * 8} ${128 + 22 * Math.sin(i * 0.45 - f * 0.12 + j * (1.2 + 1.9 * (0.5 + 0.5 * Math.sin(f * 0.04))))}`).join(" ")} stroke={j ? c("litCRim") : c("litARim")} strokeWidth={4} fill="none" />)}
        </g>
        <g opacity={0.3 + 0.7 * bd}>
          {Array.from({ length: 14 }, (_, i) => { const v = 0.5 + 0.5 * Math.cos(i * 0.9 + f * 0.05); return <rect key={i} x={566 + i * 25} y={174} width={25} height={40} fill={c("fringe")} opacity={0.1 + 0.9 * v} />; })}
          <text x={566} y={244} style={zh(sm(30), H.text2, 800)}>亮、暗、亮…（條紋）</text>
        </g>
        <g opacity={0.3 + 0.7 * ca}>
          <rect x={566} y={262} width={360} height={58} fill={ca > 0.5 ? c("lp_good") : H.cardCompare} stroke={c("lp_good")} strokeWidth={3} />
          <text x={746} y={302} textAnchor="middle" style={zh(36, ca > 0.5 ? "#fff" : c("lp_good"), 900)}>亮暗 → 算出厚度</text>
        </g>
      </svg>
    </Card>
  );
};

// ── met-cd：電子束掃過線條 → 跑出來的電子 → 邊緣處兩個峰 → 峰的間距＝線寬 ──
const Cd: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const sc = T(o, "scan"), s1 = on(f, sc), el = on(f, T(o, "el")), ed = on(f, T(o, "edge")), wd = on(f, T(o, "wid"));
  const x0 = 40, x1 = 912, yL = 160, lh = 56;
  const lines = [[150, 250], [400, 500], [650, 750]];
  // 掃描位置：和 3D 偏轉線圈同一個節奏（0.45 Hz 來回）
  const u = 0.5 + 0.5 * Math.sin(((f - sc) / 30) * Math.PI * 2 * 0.45 - Math.PI / 2);
  const bx = x0 + 20 + (x1 - x0 - 40) * (f < sc ? 0 : u);
  const sig = (x: number) => { let v = 0.15; for (const [a, b] of lines) { v += 0.85 * Math.exp(-(((x - a) / 9) ** 2)) + 0.85 * Math.exp(-(((x - b) / 9) ** 2)); if (x > a && x < b) v += 0.12; } return v; };
  const yS = 300, amp = 74;
  const drawTo = f < sc ? x0 : x0 + (x1 - x0) * Math.min(1, (f - T(o, "el")) / 40);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={x0} y={yL + lh} width={x1 - x0} height={18} fill={c("si")} />
        {lines.map(([a, b], i) => <path key={i} d={`M${a - 8} ${yL + lh} L${a + 6} ${yL} L${b - 6} ${yL} L${b + 8} ${yL + lh} Z`} fill={c("m1")} />)}
        <g opacity={ed}>{lines.flatMap(([a, b]) => [a, b]).map((x, i) => <rect key={i} x={x - 6} y={yL} width={12} height={lh} fill={c("eSec")} opacity={0.7 + 0.3 * Math.sin(f * 0.3 + i)} />)}</g>
        <g opacity={0.3 + 0.7 * s1}>
          <path d={`M${bx} 64 L${bx} ${yL - 2}`} stroke={c("eBeamRim")} strokeWidth={5} /><Dots pts={[[bx, 64], [bx, yL - 2]]} f={f} n={4} sp={0.06} c={c("eBeam")} r={5} minus />
          <text x={bx < x1 - 130 ? bx + 14 : bx - 14} y={92} textAnchor={bx < x1 - 130 ? "start" : "end"} style={zh(sm(30), c("eBeamRim"), 900)}>電子束</text>
        </g>
        <g opacity={el}>{[0, 1, 2, 3].map((j) => { const t = ph(f, 0.05, j, 4); return <g key={j} opacity={1 - t}><circle cx={bx + (j % 2 ? 1 : -1) * (12 + 50 * t)} cy={yL - 8 - 60 * t} r={7} fill={c("eSec")} /><path d={`M${bx + (j % 2 ? 1 : -1) * (12 + 50 * t) - 4} ${yL - 8 - 60 * t} h8`} stroke="#fff" strokeWidth={2} /></g>; })}
          <text x={x1} y={yS + 30} textAnchor="end" style={zh(sm(30), c("eSecRim"), 900)}>跑出來的電子</text></g>
        <path d={`M${x0} ${yS} H${x1}`} stroke={H.text3} strokeWidth={2} />
        <path d={Array.from({ length: 220 }, (_, i) => { const x = x0 + ((x1 - x0) * i) / 219; return x <= drawTo ? `${i ? "L" : "M"}${x} ${yS - amp * sig(x)}` : ""; }).join(" ")} stroke={c("eSecRim")} strokeWidth={4} fill="none" opacity={0.4 + 0.6 * el} />
        <text x={x0} y={yS + 30} style={zh(sm(30), H.text2, 800)} opacity={0.4 + 0.6 * ed}>訊號：邊緣是兩個峰</text>
        <g opacity={wd}><path d={`M${400} ${yS - amp - 26} H${500}`} stroke={H.amber} strokeWidth={5} /><path d={`M400 ${yS - amp - 38} v24 M500 ${yS - amp - 38} v24`} stroke={H.amber} strokeWidth={5} />
          <rect x={386} y={yS + 4} width={130} height={36} fill={H.amber} /><text x={451} y={yS + 33} textAnchor="middle" style={zh(sm(30), onC(H.amber), 900)}>線寬</text></g>
      </svg>
    </Card>
  );
};

// ── met-ovl：兩層紋路 → 光打上去 → ±1 階一亮一暗 → 差多少＝歪多少 ──
const Ovl: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const tw = lit(f, T(o, "two")), li = on(f, T(o, "light")), df = on(f, T(o, "diff")), hw = on(f, T(o, "how")), of = on(f, T(o, "off"));
  const x0 = 50, yG = 236, sh = 14 * tw;
  const P = [270, yG - 40];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={tw}>
          <rect x={x0 - 10} y={yG + 32} width={460} height={30} fill={c("si")} />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={x0 + i * 76} y={yG} width={36} height={30} fill={c("grB")} />)}
          <rect x={x0 - 10} y={yG - 6} width={460} height={6} fill={c("ox")} />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={x0 + i * 76 + sh} y={yG - 38} width={36} height={30} fill={c("grO")} />)}
          <text x={x0 + 470} y={yG - 16} style={zh(sm(30), c("grO"), 900)}>上層</text><text x={x0 + 470} y={yG + 24} style={zh(sm(30), c("grB"), 900)}>下層</text>
        </g>
        <g opacity={0.25 + 0.75 * li}>
          <path d={`M${P[0] - 6} 66 V${P[1]}`} stroke={c("litWRim")} strokeWidth={6} /><Dots pts={[[P[0] - 6, 66], [P[0] - 6, P[1]]]} f={f} n={3} sp={0.05} c={c("litWRim")} r={6} o={li} />
          <path d={`M${P[0] + 6} ${P[1]} V66`} stroke={c("litWRim")} strokeWidth={3} opacity={0.6} /><text x={P[0] + 14} y={86} style={zh(sm(30), H.text2, 800)}>0 階</text>
          <path d={`M${P[0]} ${P[1]} L${P[0] + 170} 80`} stroke={c("litARim")} strokeWidth={4 + 6 * df} /><path d={`M${P[0]} ${P[1]} L${P[0] - 170} 80`} stroke={c("litCRim")} strokeWidth={4 + 1.5 * df} opacity={1 - 0.5 * df} />
          <text x={P[0] + 150} y={70} style={zh(sm(30), c("litARim"), 900)}>+1</text><text x={58} y={116} style={zh(sm(30), c("litCRim"), 900)}>−1</text>
        </g>
        {/* 歪了多少：上下兩層的錯開量 */}
        <g opacity={of}><path d={`M${x0 + 152} ${yG - 52} V${yG + 34} M${x0 + 152 + sh} ${yG - 52} V${yG + 34}`} stroke={c("lp_bad")} strokeWidth={3} />
          <text x={x0 + 120} y={yG + 92} style={zh(sm(30), c("lp_bad"), 900)}>錯開＝歪多少</text></g>
        <line x1={600} y1={60} x2={600} y2={Hh - 20} stroke={H.lineSoft} strokeWidth={3} />
        <g opacity={0.3 + 0.7 * df}>
          <text x={630} y={92} style={zh(sm(30), H.text, 900)}>兩邊的亮度</text>
          <path d={`M626 ${Hh - 56} H924`} stroke={H.text3} strokeWidth={2} />
          <rect x={640} y={Hh - 56 - 170 * (0.5 + 0.45 * df)} width={70} height={170 * (0.5 + 0.45 * df)} fill={c("litCRim")} opacity={0.5} />
          <rect x={640} y={Hh - 56 - 170 * (0.5 - 0.2 * df)} width={70} height={170 * (0.5 - 0.2 * df)} fill={c("litCRim")} />
          <rect x={840} y={Hh - 56 - 170 * (0.5 + 0.45 * df)} width={70} height={170 * (0.5 + 0.45 * df)} fill={c("litARim")} />
          <text x={675} y={Hh - 22} textAnchor="middle" style={zh(sm(30), c("litCRim"), 900)}>−1</text><text x={875} y={Hh - 22} textAnchor="middle" style={zh(sm(30), c("litARim"), 900)}>+1</text>
        </g>
        <g opacity={hw}><path d={`M724 ${Hh - 56 - 170 * 0.95} V${Hh - 56 - 170 * 0.3}`} stroke={H.amber} strokeWidth={5} /><path d={`M714 ${Hh - 56 - 170 * 0.95} h20 M714 ${Hh - 56 - 170 * 0.3} h20`} stroke={H.amber} strokeWidth={5} />
          <text x={738} y={Hh - 56 - 170 * 0.6} style={zh(sm(30), H.amber, 900)}>差多少</text></g>
      </svg>
    </Card>
  );
};

// ── met-def：光學掃得快、看不細 ↔ 電子束看得細、很慢 → 先光學找可疑處 → 再電子束看清楚 ──
const Def: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const fa = T(o, "fast"), f1 = on(f, fa), fi = on(f, T(o, "fine")), sl = on(f, T(o, "slow")), so = on(f, T(o, "so")), lk = on(f, T(o, "look"));
  const cx = 150, cy = 184, r = 100;
  const sweep = Math.min(1, Math.max(0, (f - fa) / 40)), sy = cy - r + 2 * r * sweep;
  const spots = [[-44, -52], [34, -22], [-14, 8], [54, 38], [-60, 52]];
  const hot = so > 0 ? 2 : 0;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill={c("siTop")} stroke={H.text3} strokeWidth={3} />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${cx - r} ${cy - r + i * 25} H${cx + r} M${cx - r + i * 25} ${cy - r} V${cy + r}`} stroke="#fff" strokeWidth={1.5} opacity={0.6} clipPath="url(#mwf)" />)}
        <defs><clipPath id="mwf"><circle cx={cx} cy={cy} r={r} /></clipPath></defs>
        {f1 > 0 && sweep < 1 ? <rect x={cx - r} y={sy - 4} width={2 * r} height={8} fill={c("lp_warm")} clipPath="url(#mwf)" /> : null}
        {spots.map(([dx, dy], i) => { const seen = f1 > 0 && cy + dy < sy + 2; const sel = (i === 0 && fi > 0.5 && so < 0.5) || (i === hot && lk > 0.5);
          return seen ? <g key={i}><circle cx={cx + dx} cy={cy + dy} r={9} fill={c("defO")} />{sel ? <circle cx={cx + dx} cy={cy + dy} r={20} fill="none" stroke={c("eBeamRim")} strokeWidth={4} /> : null}</g> : null; })}
        <text x={cx - r - 6} y={cy + r + 32} style={zh(sm(30), H.text2, 800)} opacity={0.4 + 0.6 * f1}>色點＝可疑處</text>
        {/* 對照表 */}
        <g transform="translate(330 60)">
          {[["", "光學", "電子束"], ["速度", "快", "很慢"], ["看得", "不細", "很細"]].map((row, i) => row.map((t, j) => { const a = i === 0 ? 1 : j === 1 ? f1 : i === 1 ? sl : fi;
            return <text key={`${i}${j}`} x={j === 0 ? 0 : j === 1 ? 140 : 250} y={34 + i * 62} textAnchor={j === 0 ? "start" : "middle"} opacity={i === 0 || j === 0 ? 1 : 0.3 + 0.7 * a}
              style={zh(i === 0 ? 34 : 38, i === 0 ? H.text : j === 1 ? (i === 1 ? c("lp_good") : c("lp_bad")) : j === 2 ? (i === 1 ? c("lp_bad") : c("lp_good")) : H.text2, 900)}>{t}</text>; }))}
          <path d={`M0 52 H310 M0 114 H310`} stroke={H.lineSoft} strokeWidth={2} />
        </g>
        {/* 兩段式：先光學 → 再電子束；電子束視窗看到顆粒外形 */}
        <g opacity={0.35 + 0.65 * so}><rect x={330} y={258} width={140} height={56} fill={so > 0.5 && lk < 0.5 ? H.amber : H.cardCompare} stroke={H.amber} strokeWidth={3} />
          <text x={400} y={296} textAnchor="middle" style={zh(sm(30), so > 0.5 && lk < 0.5 ? onC(H.amber) : H.amber, 900)}>① 光學找</text></g>
        <Arr x1={474} y1={286} x2={502} y2={286} c={H.text3} w={4} o={0.35 + 0.65 * so} />
        <g opacity={0.35 + 0.65 * lk}><rect x={506} y={258} width={170} height={56} fill={lk > 0.5 ? H.line : H.cardCompare} stroke={H.line} strokeWidth={3} />
          <text x={591} y={296} textAnchor="middle" style={zh(sm(30), lk > 0.5 ? "#fff" : H.line, 900)}>② 電子束看</text></g>
        <g transform="translate(800 180)">
          <circle r={112} fill="#3a3f4a" stroke={H.line} strokeWidth={4} opacity={0.4 + 0.6 * Math.max(fi * (1 - so), lk)} />
          <defs><clipPath id="mzoom"><circle r={110} /></clipPath></defs>
          <g opacity={Math.max(fi * (1 - so), lk)} clipPath="url(#mzoom)">
            {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M-100 ${-90 + i * 30} H100`} stroke="#5a606c" strokeWidth={8} />)}
            <path d="M-34 -10 C-30 -44 10 -50 30 -26 C52 -4 40 30 10 36 C-20 42 -40 24 -34 -10 Z" fill="#c9ccd3" /><path d="M-14 -16 C-6 -30 14 -28 18 -14" stroke="#eef0f4" strokeWidth={6} fill="none" />
            <path d="M-112 0 H-60 M60 0 H112 M0 -112 V-64 M0 64 V112" stroke={c("lp_warm")} strokeWidth={3} />
          </g>
          <text x={0} y={140} textAnchor="middle" style={zh(sm(30), H.text2, 800)} opacity={0.4 + 0.6 * Math.max(fi, lk)}>電子束看到的顆粒</text>
        </g>
      </svg>
    </Card>
  );
};

// ── met-loop：量到歪了 → 數字送回曝光機修正；量到缺陷 → 挑出來 ──
const Box: React.FC<{ x: number; y: number; w: number; t: string; a: number; hl?: boolean; c?: string }> = ({ x, y, w, t, a, hl, c = H.line }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y} width={w} height={64} fill={hl ? c : H.cardCompare} stroke={c} strokeWidth={4} />
    <text x={x + w / 2} y={y + 43} textAnchor="middle" style={zh(sm(32), hl ? "#fff" : c, 900)}>{t}</text></g>);
const Loop: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const of = on(f, T(o, "off")), bk = on(f, T(o, "back")), bd = on(f, T(o, "bad")), pl = on(f, T(o, "pull"));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Box x={40} y={74} w={210} t="量測：歪了" a={of} hl={of > 0.5 && bk < 0.5} c={c("lp_bad")} />
        <Arr x1={258} y1={106} x2={420} y2={106} c={c("data")} w={6} o={0.35 + 0.65 * bk} />
        {bk > 0 ? <g opacity={bk}>{[0, 1, 2].map((j) => { const t = ph(f, 0.03, j, 3), x = 268 + 130 * t; return <path key={j} d={`M${x} 92 v-14 h14 v14 h14 v-14`} stroke={c("data")} strokeWidth={3} fill="none" />; })}</g> : null}
        <text x={268} y={152} style={zh(sm(30), c("data"), 900)} opacity={0.35 + 0.65 * bk}>送回數字</text>
        <Box x={428} y={74} w={230} t="曝光機" a={bk} hl={bk > 0.5 && bd < 0.5} />
        <text x={680} y={116} style={zh(36, c("lp_good"), 900)} opacity={0.35 + 0.65 * bk}>→ 下一片修正</text>
        <line x1={30} y1={176} x2={W - 30} y2={176} stroke={H.lineSoft} strokeWidth={3} />
        <Box x={40} y={202} w={210} t="量到缺陷" a={bd} hl={bd > 0.5 && pl < 0.5} c={H.amber} />
        <Arr x1={258} y1={234} x2={420} y2={234} c={H.text3} w={6} o={0.35 + 0.65 * pl} />
        <Box x={428} y={202} w={230} t="手臂夾起" a={pl} />
        <Arr x1={666} y1={234} x2={716} y2={234} c={H.text3} w={6} o={0.35 + 0.65 * pl} />
        <Box x={722} y={202} w={190} t="檢出盒" a={pl} hl={pl > 0.5} c={c("lp_bad")} />
      </svg>
    </Card>
  );
};

// ── met-co：誰在做（念到誰誰亮；3D 另有引線指到對應部位） ──
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300;
  const rows: [string, string, string][] = [["科磊", "疊對、缺陷檢測", "kla"], ["艾司摩爾", "疊對量測", "asml"], ["應用材料", "電子束複檢、線寬", "am"], ["日立先端科技", "電子束線寬", "hit"], ["華洋精機（台）", "光罩微粒檢測", "hy"], ["牧德（台）", "晶圓外觀檢查", "mak"]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {rows.map(([n, d, key], i) => { const a = tween(f, T(o, key), 10, EASE.enter); const cur = a > 0.5 && (i === rows.length - 1 || tween(f, T(o, rows[i + 1][2]), 4) < 0.5);
          const y = 66 + i * 40;
          return <g key={i}>
            <rect x={20} y={y} width={W - 40} height={36} fill={cur ? H.amber : a > 0.5 ? "#E7EEF8" : "#F1F4F8"} stroke={cur ? H.amber : H.text3} strokeWidth={cur ? 4 : 2} />
            <text x={36} y={y + 28} style={zh(30, cur ? onC(H.amber) : H.text, 900)}>{n}</text>
            <text x={W - 36} y={y + 28} textAnchor="end" style={zh(30, cur ? onC(H.amber) : H.text2, 800)}>{d}</text></g>; })}
      </svg>
    </Card>
  );
};

// ── met-step：研磨 → 量測檢測（這一支）→ 離子佈植（下一支） ──
const Step: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 250;
  const a = on(f, T(o, "cmp")), b = on(f, T(o, "met")), c2 = on(f, T(o, "next"));
  const names = [["研磨", "磨平每一層", a], ["量測檢測", "量過才放行", b], ["離子佈植", "下一支", c2]] as const;
  const bw = 250, gap = 80, x0 = 36;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {names.map(([n, d, v], i) => { const x = x0 + i * (bw + gap); const hl = i === 1 && v > 0.5 && c2 < 0.5; const nx = i === 2 && v > 0.5;
          return <g key={i} opacity={0.35 + 0.65 * v}>
            <rect x={x} y={70} width={bw} height={130} fill={hl || nx ? H.amber : H.cardCompare} stroke={H.text3} strokeWidth={hl || nx ? 6 : 3} />
            <text x={x + bw / 2} y={128} textAnchor="middle" style={zh(n.length > 2 ? 42 : 48, hl || nx ? onC(H.amber) : H.text, 900)}>{n}</text>
            <text x={x + bw / 2} y={174} textAnchor="middle" style={zh(sm(32), hl || nx ? onC(H.amber) : H.text2, 700)}>{d}</text>
            {i < 2 ? <path d={`M${x + bw + 10} 135 H${x + bw + gap - 14} m-14 -12 l14 12 l-14 12`} stroke={H.text3} strokeWidth={5} fill="none" /> : null}
          </g>; })}
      </svg>
    </Card>
  );
};

export const MetSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "met-prev") return <Prev {...p} />;
  if (kd === "met-layer") return <Layer {...p} />;
  if (kd === "met-film") return <Film {...p} />;
  if (kd === "met-cd") return <Cd {...p} />;
  if (kd === "met-ovl") return <Ovl {...p} />;
  if (kd === "met-def") return <Def {...p} />;
  if (kd === "met-loop") return <Loop {...p} />;
  if (kd === "met-co") return <Co {...p} />;
  if (kd === "met-step") return <Step {...p} />;
  return null;
};
