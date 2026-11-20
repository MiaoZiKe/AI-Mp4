// 2026/11/20 tech-cmp：化學機械研磨的 2D 示意卡（overlay `section` 的 kind 以 "cmp-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   cmp-prev 膜凹凸不平｜cmp-why 為什麼要磨平（景深）｜cmp-tool 機台側視｜cmp-spin 兩個盤同向不同速（俯視、軌跡）｜cmp-head 研磨頭爆炸剖面｜
//   cmp-slurry 磨粒＋藥劑近景｜cmp-cond 修整器刮新墊面｜cmp-flat 凸起磨得快→變平｜cmp-co 誰在做｜cmp-step 這一支在哪
// 全部示意；結構一開始就完整畫出（不留空框），念到時該處亮起、動起來；時間全部來自 script.json 的 t（cue）。顏色讀 model.json 的 palette。
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
const cc = (m: Model3D) => (n: string) => col(m.product, n);
const lit = (f: number, at: number, lo = 0.4) => lo + (1 - lo) * tween(f, at, 10, EASE.enter);
/** 下箭頭（壓力） */
const Dn: React.FC<{ x: number; y: number; len: number; c: string; w?: number; o?: number }> = ({ x, y, len, c, w = 7, o = 1 }) => <g opacity={o}><path d={`M${x} ${y} v${len}`} stroke={c} strokeWidth={w} /><path d={`M${x - w * 1.6} ${y + len - w * 1.4} L${x} ${y + len + w * 0.9} L${x + w * 1.6} ${y + len - w * 1.4} Z`} fill={c} /></g>;
/** 弧形箭頭：圓心 (cx,cy)、半徑 r、從角度 a0 轉到 a1（度，螢幕座標，順時針為正） */
const Arc: React.FC<{ cx: number; cy: number; r: number; a0: number; a1: number; c: string; w?: number; rx?: number; o?: number }> = ({ cx, cy, r, a0, a1, c, w = 6, rx, o = 1 }) => {
  const rr = rx ?? r, p = (a: number) => [cx + rr * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1), dir = a1 > a0 ? 1 : -1, big = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const ta = ((a1 + dir * 90) * Math.PI) / 180, hx = Math.cos(ta), hy = Math.sin(ta) * (r / rr);
  const n = Math.hypot(hx, hy) || 1, ux = hx / n, uy = hy / n, s = w * 2.4;
  return <g opacity={o}><path d={`M${x0} ${y0} A${rr} ${r} 0 ${big} ${dir > 0 ? 1 : 0} ${x1} ${y1}`} stroke={c} strokeWidth={w} fill="none" />
    <path d={`M${x1 + ux * s} ${y1 + uy * s} L${x1 - uy * s * 0.7} ${y1 + ux * s * 0.7} L${x1 + uy * s * 0.7} ${y1 - ux * s * 0.7} Z`} fill={c} /></g>;
};
/** 晶圓表面剖面：film 蓋住溝槽與鰭，bump(0..1) 是鰭上方凸起的高度比例；(x,y)＝左上、y 是「平的那條線」 */
const Prof: React.FC<{ x: number; y: number; w: number; bump: number; si: string; siT: string; film: string; bh?: number; fh?: number }> = ({ x, y, w, bump, si, siT, film, bh = 40, fh = 56 }) => {
  const fw = w * 0.26, f1 = x + w * 0.1, f2 = x + w * 0.64, hh = bump * bh;
  return (<g>
    <rect x={x} y={y} width={w} height={fh + 66} fill={film} />
    <rect x={f1} y={y - hh} width={fw} height={hh + 0.5} fill={film} /><rect x={f2} y={y - hh} width={fw} height={hh + 0.5} fill={film} />
    <rect x={x} y={y + fh + 40} width={w} height={26} fill={si} />
    <rect x={f1} y={y + fh} width={fw} height={42} fill={siT} /><rect x={f2} y={y + fh} width={fw} height={42} fill={siT} />
  </g>);
};

// ── cmp-prev：上一支的結果（膜凹凸不平）→ 下一層對不準 → 怎麼磨平 ──
const Prev: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, c = cc(m);
  const a = lit(f, T(o, "bump"), 0.5), b = tween(f, T(o, "mis"), 12, EASE.enter), q = tween(f, T(o, "ask"), 10, EASE.enter);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}>
          <Prof x={60} y={170} w={420} bump={1} si={c("siB")} siT={c("siF")} film={c("film")} bh={46} />
          <path d="M60 164 H480" stroke={c("focus")} strokeWidth={3} strokeDasharray="10 8" />
          <path d="M498 170 v-46" stroke={H.amber} strokeWidth={5} /><path d="M488 124 h20 M488 170 h20" stroke={H.amber} strokeWidth={4} />
          <text x={514} y={158} style={zh(sm(32), H.amber, 900)}>高低不平</text>
          <text x={60} y={118} style={zh(36, H.text, 900)}>上一支長出的膜</text>
        </g>
        <g opacity={b}>
          {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${100 + i * 80} 224 v-70`} stroke={c("uv")} strokeWidth={4} opacity={0.5 + 0.5 * ph(f, 0.05, i, 5)} />)}
        </g>
        <g opacity={b}>
          <rect x={560} y={96} width={340} height={96} fill={H.cardCompare} stroke={c("lp_bad")} strokeWidth={4} />
          <text x={730} y={142} textAnchor="middle" style={zh(38, c("lp_bad"), 900)}>下一層曝光</text><text x={730} y={180} textAnchor="middle" style={zh(sm(34), c("lp_bad"), 900)}>光就會對不準</text>
        </g>
        <g opacity={q}>
          <rect x={560} y={216} width={340} height={78} fill={H.amber} />
          <text x={730} y={268} textAnchor="middle" style={zh(44, onC(H.amber), 900)}>怎麼磨平？</text>
        </g>
      </svg>
    </Card>
  );
};

// ── cmp-why：景深很淺，凸起頂端失焦 ──
const Why: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const dp = T(o, "depth"), df = T(o, "diff"), bl = T(o, "blur"), fl = T(o, "flat");
  const d1 = lit(f, dp), b1 = lit(f, df), s1 = tween(f, bl, 12, EASE.enter), r1 = lit(f, fl);
  const yF = 168, xL = 40, xR = 520, w = 400;
  const rays = (x0: number, hits: number[]) => hits.map((hx, i) => <path key={i} d={`M${x0 + 20 + i * 90} 72 L${hx} ${yF - 2}`} stroke={c("uv")} strokeWidth={4} opacity={0.4 + 0.6 * ph(f, 0.06, i, 5)} />);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={d1}>
          <rect x={xL} y={62} width={w} height={14} fill={c("steel")} /><text x={xL + 8} y={56} style={zh(sm(28), H.text2, 700)}>曝光的光</text>
          {rays(xL, [xL + 60, xL + 150, xL + 240, xL + 330, xL + 380])}
          <path d={`M${xL} ${yF} H${xL + w}`} stroke={c("focus")} strokeWidth={3} strokeDasharray="10 8" /><text x={xL + w + 6} y={yF + 8} style={zh(sm(26), c("focus"), 900)}>對焦</text>
        </g>
        <g opacity={b1}><Prof x={xL} y={yF} w={w} bump={1} si={c("siB")} siT={c("siF")} film={c("film")} bh={44} /></g>
        <g opacity={s1}>
          {[xL + 60 + 0.1 * w * 0, xL + 0.1 * w + 20, xL + 0.64 * w + 20].map((x, i) => <circle key={i} cx={x + 14} cy={yF - 46} r={20} fill={c("lp_bad")} opacity={0.35 + 0.15 * Math.sin(f * 0.3 + i)} />)}
          <text x={xL + 8} y={yF + 148} style={zh(34, c("lp_bad"), 900)}>凸起處失焦，圖案糊掉</text>
        </g>
        <g opacity={b1}><rect x={xL + 4} y={100} width={150} height={36} fill={H.cardCompare} /><text x={xL + 10} y={128} style={zh(sm(30), H.text, 900)}>高低差太大</text></g>
        <line x1={W / 2 + 10} y1={60} x2={W / 2 + 10} y2={Hh - 20} stroke={H.lineSoft} strokeWidth={3} />
        <g opacity={r1}>
          <rect x={xR} y={62} width={w - 20} height={14} fill={c("steel")} />
          {rays(xR - 20, [xR + 40, xR + 130, xR + 210, xR + 290, xR + 360])}
          <path d={`M${xR} ${yF} H${xR + w - 20}`} stroke={c("focus")} strokeWidth={3} strokeDasharray="10 8" />
          <Prof x={xR} y={yF} w={w - 20} bump={0} si={c("siB")} siT={c("siF")} film={c("film")} />
          {[40, 130, 210, 290, 360].map((x, i) => <circle key={i} cx={xR + x} cy={yF - 2} r={6} fill={c("lp_good")} />)}
          <text x={xR + 8} y={yF + 148} style={zh(34, c("lp_good"), 900)}>磨平後，每一處都對焦</text>
        </g>
      </svg>
    </Card>
  );
};

// ── cmp-tool：機台側視（晶圓朝下壓在轉動的研磨墊上，旁邊噴研磨液、鑽石碟修整） ──
const Tool: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const wf = T(o, "wafer"), pd = T(o, "pad"), sl = T(o, "slurry");
  const a = lit(f, wf), b = lit(f, pd), s = lit(f, sl);
  const yP = 232, x0 = 50, x1 = 600, hx = 300;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={b}>
          <rect x={x0 - 14} y={yP + 20} width={x1 - x0 + 28} height={34} fill={c("steel")} />
          <rect x={x0} y={yP} width={x1 - x0} height={20} fill={c("padB")} />
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={x0 + 26 + i * 60} y={yP} width={8} height={6} fill={c("padG")} />)}
          <rect x={(x0 + x1) / 2 - 22} y={yP + 54} width={44} height={36} fill={c("steel2")} />
          <Arc cx={(x0 + x1) / 2} cy={yP + 37} r={11} rx={230} a0={30} a1={150} c={c("rot")} w={6} />
          <text x={x0} y={Hh - 8} style={zh(sm(28), H.text, 800)}>研磨盤與研磨墊（轉動）</text>
        </g>
        <g opacity={a}>
          <rect x={hx - 28} y={64} width={56} height={40} fill={c("steelHi")} />
          <rect x={hx - 100} y={104} width={200} height={42} fill={c("steel")} />
          <rect x={hx - 112} y={146} width={14} height={yP - 146} fill={c("steel2")} /><rect x={hx + 98} y={146} width={14} height={yP - 146} fill={c("steel2")} />
          <rect x={hx - 84} y={yP - 22} width={168} height={20} fill={c("siTop")} />
          {[-60, -20, 20, 60].map((dx, i) => <Dn key={i} x={hx + dx} y={152} len={34 + 4 * Math.sin(f * 0.2 + i)} c={c("press")} w={6} />)}
          <Arc cx={hx} cy={74} r={14} rx={52} a0={200} a1={340} c={c("rot")} w={5} />
          <text x={hx - 80} y={yP - 28} style={zh(sm(28), H.text, 900)}>晶圓（朝下）</text>
          <text x={hx + 120} y={96} style={zh(sm(30), H.text, 800)}>研磨頭</text>
          <text x={hx - 120} y={176} textAnchor="end" style={zh(sm(28), c("press"), 900)}>壓力</text>
        </g>
        <g opacity={s}>
          <rect x={70} y={66} width={14} height={80} fill={c("pipe")} /><rect x={40} y={66} width={60} height={14} fill={c("pipe")} />
          {Array.from({ length: 4 }, (_, j) => { const u = ph(f, 0.03, j, 4); return <ellipse key={j} cx={77} cy={152 + u * 74} rx={6} ry={10} fill={c("slurry")} />; })}
          <path d={`M77 ${yP - 6} h${hx - 190}`} stroke={c("slurry")} strokeWidth={6} opacity={0.7} />
          <text x={92} y={206} style={zh(sm(28), c("slurryRim"), 900)}>研磨液</text>
        </g>
        <g opacity={0.85}>
          <rect x={x1 - 90} y={120} width={14} height={yP - 120} fill={c("steel2")} /><rect x={x1 - 130} y={yP - 24} width={92} height={24} fill={c("dia")} />
          <text x={x1 - 98} y={160} textAnchor="end" style={zh(sm(28), H.text2, 800)}>鑽石碟</text>
        </g>
        <text x={650} y={118} opacity={a} style={zh(34, H.text, 800)}>① 晶圓朝下</text><text x={650} y={176} opacity={b} style={zh(34, H.text, 800)}>② 壓在轉動的墊上</text><text x={650} y={234} opacity={s} style={zh(34, H.text, 800)}>③ 邊磨邊淋液</text>
      </svg>
    </Card>
  );
};

// ── cmp-spin：俯視，研磨盤與研磨頭同方向、不同轉速；晶圓上三個點的軌跡布滿整片墊 ──
const Spin: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const sm_ = T(o, "same"), df = T(o, "diff"), ev = T(o, "even");
  const a = lit(f, sm_), b = lit(f, df), e = tween(f, ev, 10, EASE.enter);
  const cx = 250, cy = 190, R = 128, hr = 38, ho = 62; // 盤半徑、頭半徑、頭中心離盤心
  const wp = 0.03, wh = 0.072;                         // 角速度（弧度／幀）：頭轉得比盤快，同方向
  const t = Math.max(0, f - sm_ + 20);
  const tr = (r: number, color: string) => {
    const pts: string[] = [];
    for (let i = 0; i <= 120; i++) {
      const tt = t - (120 - i) * 1.2; if (tt < 0) continue;
      const ap = -wp * tt, ah = wh * tt;
      const hx = ho * Math.cos(ap), hy = ho * Math.sin(ap);       // 盤座標系下的頭中心
      const px = hx + r * Math.cos(ah + ap * 0 - wp * tt), py = hy + r * Math.sin(ah - wp * tt);
      pts.push(`${i === 0 || !pts.length ? "M" : "L"}${cx + px} ${cy + py}`);
    }
    return <path d={pts.join(" ")} stroke={color} strokeWidth={3} fill="none" opacity={0.9} />;
  };
  const ap = wp * f, ah = wh * f;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}>
          <circle cx={cx} cy={cy} r={R} fill={c("padB")} />
          {[40, 80, 118].map((r) => <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke={c("padG")} strokeWidth={4} />)}
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${cx} ${cy} L${cx + R * Math.cos(ap + (i * Math.PI) / 4)} ${cy + R * Math.sin(ap + (i * Math.PI) / 4)}`} stroke={c("padG")} strokeWidth={3} />)}
          <circle cx={cx + R * Math.cos(ap)} cy={cy + R * Math.sin(ap)} r={7} fill={c("focus")} />
          <Arc cx={cx} cy={cy} r={R + 18} a0={-30} a1={-140} c={c("rot")} w={6} />
        </g>
        <g opacity={b}>
          <circle cx={cx + ho} cy={cy} r={hr} fill={c("steel")} />
          <circle cx={cx + ho} cy={cy} r={hr - 8} fill={c("siTop")} />
          <circle cx={cx + ho + (hr - 8) * Math.cos(ah)} cy={cy + (hr - 8) * Math.sin(ah)} r={5} fill={c("focus")} />
          <Arc cx={cx + ho} cy={cy} r={hr + 14} a0={-30} a1={-140} c={c("rot")} w={5} />
        </g>
        <g opacity={e}>{tr(0, c("lp_bad"))}{tr(hr - 8, c("film"))}{tr(18, c("atomG"))}</g>
        <text x={cx - R} y={Hh - 14} opacity={a} style={zh(sm(28), H.text, 800)}>研磨盤：慢</text><text x={cx + 20} y={Hh - 14} opacity={b} style={zh(sm(28), H.text, 800)}>研磨頭：快</text>
        <text x={560} y={118} opacity={a} style={zh(36, H.text, 900)}>① 兩個都朝同一方向轉</text>
        <text x={560} y={182} opacity={b} style={zh(36, H.text, 900)}>② 轉速不一樣</text>
        <text x={560} y={246} opacity={e} style={zh(36, c("lp_good"), 900)}>③ 晶圓每一點都磨得到</text>
        <text x={560} y={296} opacity={e} style={zh(sm(28), H.text2, 700)}>線＝晶圓上三個點走過的路</text>
      </svg>
    </Card>
  );
};

// ── cmp-head：研磨頭爆炸剖面（由上到下：轉軸、頭體、橡膠膜、固定環、晶圓；氣壓往下推膜） ──
const Head: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const names: [string, string, string][] = [["sh", "轉軸", "steelHi"], ["bd", "頭體（有氣孔）", "steel"], ["mm", "橡膠膜", "press"], ["rg", "固定環", "steel2"], ["wf", "晶圓（朝下）", "siTop"]];
  const x0 = 60, w = 320, cxx = x0 + w / 2;
  const ys = [34, 98, 162, 212, 268];
  const hs = [46, 46, 14, 26, 14];
  const air = tween(f, T(o, "air"), 10, EASE.enter);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {names.map(([key, nm, cl], i) => {
          const on = lit(f, T(o, key), 0.45); const x = i === 0 ? cxx - 36 : x0, ww = i === 0 ? 72 : w;
          return (<g key={key} opacity={on}>
            {i === 3 ? <><rect x={x0 - 14} y={ys[i]} width={60} height={hs[i]} fill={c(cl)} /><rect x={x0 + w - 46} y={ys[i]} width={60} height={hs[i]} fill={c(cl)} /></> : <rect x={x} y={ys[i]} width={ww} height={hs[i]} fill={c(cl)} />}
            {i === 2 ? [0, 1, 2].map((j) => <rect key={j} x={x0 + 50 + j * 100} y={ys[i] - 5} width={60} height={5} fill={c("lp_bad")} />) : null}
            <text x={x0 + w + 24} y={ys[i] + hs[i] / 2 + 10} style={zh(sm(32), H.text, 900)}>{nm}</text>
            <path d={`M${x0 + w + 16} ${ys[i] + hs[i] / 2} H${x0 + w - 10}`} stroke={H.text3} strokeWidth={2} />
          </g>);
        })}
        {[-100, -30, 30, 100].map((dx, i) => <Dn key={i} x={cxx + dx} y={ys[1] + 48} len={22 + 3 * Math.sin(f * 0.25 + i)} c={c("press")} w={5} o={air} />)}
        <text x={700} y={122} opacity={air} style={zh(34, c("press"), 900)}>氣壓往下推膜</text>
        <text x={700} y={176} opacity={air} style={zh(sm(30), H.text2, 700)}>壓力傳到整片晶圓</text>
        <text x={700} y={300} opacity={tween(f, T(o, "wf"), 10)} style={zh(sm(28), H.text2, 700)}>擋住晶圓不滑出</text>
      </svg>
    </Card>
  );
};

// ── cmp-slurry：磨粒＋藥劑近景 ──
const Slurry: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const gr = T(o, "grit"), ch = T(o, "chem"), sf = T(o, "soft"), sc = T(o, "scrape");
  const g = lit(f, gr), cm = lit(f, ch), s1 = tween(f, sf, 14, EASE.move), s2 = tween(f, sc, 14, EASE.enter);
  const x0 = 30, x1 = 560, yPad = 78, yF = 238;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={x0} y={yPad - 30} width={x1 - x0} height={30} fill={c("padB")} />
        {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={x0 + 30 + i * 54} cy={yPad + 4} r={9} fill={c("padHi")} />)}
        <rect x={x0} y={yPad} width={x1 - x0} height={yF - yPad} fill={c("slurryBox")} opacity={0.22} />
        <Prof x={x0} y={yF} w={x1 - x0} bump={1} si={c("siB")} siT={c("siF")} film={c("film")} bh={30} fh={40} />
        <rect x={x0 + 0.1 * (x1 - x0)} y={yF - 30} width={(x1 - x0) * 0.26} height={7 + 0 * s1} fill={c("softC")} opacity={s1} />
        <rect x={x0 + 0.64 * (x1 - x0)} y={yF - 30} width={(x1 - x0) * 0.26} height={7} fill={c("softC")} opacity={s1} />
        {Array.from({ length: 12 }, (_, i) => { const u = ph(f, 0.01, i, 12, i % 3); const x = x0 + 24 + ((i * 47 + u * 120) % (x1 - x0 - 50)); const y = 118 + (i % 4) * 22;
          return <g key={i} opacity={g}><rect x={x - 7} y={y - 7} width={14} height={14} fill={c("grit")} stroke={c("gritRim")} strokeWidth={2} transform={`rotate(${i * 31 + f * 3} ${x} ${y})`} /></g>; })}
        {Array.from({ length: 8 }, (_, i) => { const u = ph(f, 0.014, i, 8, i % 3); const x = x0 + 40 + i * 62; const y = 96 + u * (yF - 40 - 96);
          return <g key={i} opacity={cm}><circle cx={x - 6} cy={y} r={7} fill={c("mol")} /><circle cx={x + 6} cy={y + 4} r={5.5} fill={c("mol2")} /></g>; })}
        {Array.from({ length: 5 }, (_, i) => { const u = ph(f, 0.012, i, 5, i % 2); return <ellipse key={i} cx={x0 + 120 + i * 80 + u * 40} cy={yF - 52 - u * 40} rx={9} ry={3.5} fill={c("flake")} opacity={s2 * (1 - u)} transform={`rotate(${u * 160} ${x0 + 120 + i * 80 + u * 40} ${yF - 52 - u * 40})`} />; })}
        <text x={x0 + 6} y={64} style={zh(sm(28), H.text2, 800)}>研磨墊</text>
        <text x={x1 - 150} y={yF + 78} opacity={s1} style={zh(sm(28), H.text, 900)}>表面變軟</text>
        <g opacity={g}><rect x={620} y={96} width={26} height={26} fill={c("grit")} stroke={c("gritRim")} strokeWidth={3} /><text x={660} y={120} style={zh(34, H.text, 900)}>磨粒：負責刮</text></g>
        <g opacity={cm}><circle cx={628} cy={176} r={9} fill={c("mol")} /><circle cx={642} cy={182} r={7} fill={c("mol2")} /><text x={660} y={190} style={zh(34, H.text, 900)}>藥劑：讓表面變軟</text></g>
        <text x={620} y={250} opacity={s1} style={zh(sm(32), c("lp_good"), 900)}>藥劑先軟化</text><text x={620} y={296} opacity={s2} style={zh(sm(32), c("gritRim"), 900)}>磨粒再刮掉</text>
      </svg>
    </Card>
  );
};

// ── cmp-cond：碎屑塞住墊面 → 鑽石碟掃過 → 刮新 ──
const Cond: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const cl = T(o, "clog"), ds = T(o, "disc"), fr = T(o, "fresh");
  const a = lit(f, cl), b = tween(f, ds, 12, EASE.enter), e = tween(f, fr, 24, EASE.move);
  const x0 = 40, x1 = 600, yP = 200;
  const sw = x0 + 60 + (x1 - x0 - 200) * (0.5 + 0.5 * Math.sin(Math.max(0, f - ds) * 0.07));
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={x0} y={yP} width={x1 - x0} height={70} fill={c("padB")} />
        {Array.from({ length: 12 }, (_, i) => { const x = x0 + 22 + i * 46; return <g key={i}>
          <rect x={x} y={yP - 10} width={26} height={12} fill={c("padB")} />
          <rect x={x + 4} y={yP - 10 + 12 * e} width={18} height={12 - 12 * e + 0.01} fill={c("flake")} opacity={a * (1 - e)} />
          <rect x={x - 12} y={yP + 2} width={12} height={5} fill={c("padG")} /></g>; })}
        <g opacity={b}>
          <rect x={sw - 20} y={96} width={14} height={yP - 120} fill={c("steel2")} />
          <rect x={sw - 70} y={yP - 28} width={124} height={26} fill={c("dia")} />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${sw - 62 + i * 14} ${yP - 2} l5 10 l5 -10 z`} fill={c("grit")} />)}
          <path d={`M${sw - 80} 74 h150`} stroke={H.text3} strokeWidth={4} /><path d={`M${sw - 80} 74 l16 -10 v20 z M${sw + 70} 74 l-16 -10 v20 z`} fill={H.text3} />
        </g>
        {Array.from({ length: 4 }, (_, j) => { const u = ph(f, 0.02, j, 4); return <ellipse key={j} cx={sw + 70 + u * 60} cy={yP - 40 - u * 40} rx={9} ry={3.5} fill={c("flake")} opacity={b * (1 - u)} />; })}
        <text x={x0} y={yP + 100} opacity={a} style={zh(sm(30), c("flakeRim"), 900)}>墊面被碎屑塞住</text><text x={x1 - 190} y={yP + 100} opacity={e} style={zh(sm(30), c("lp_good"), 900)}>墊面刮新</text>
        <text x={640} y={118} opacity={a} style={zh(34, H.text, 800)}>① 碎屑塞住墊面</text><text x={640} y={176} opacity={b} style={zh(34, H.text, 800)}>② 鑽石碟來回掃</text><text x={640} y={234} opacity={e} style={zh(34, c("lp_good"), 900)}>③ 墊面刮新</text>
      </svg>
    </Card>
  );
};

// ── cmp-flat：凸起壓力大、磨得快；凹處磨得慢；最後變平 ──
const Flat: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const pr = T(o, "press"), lo = T(o, "low"), fl = T(o, "flat");
  const a = lit(f, pr), b = lit(f, lo), e = tween(f, fl, 40, EASE.move);
  const bump = 1 - e, x = 40, w = 520, yF = 200;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={x - 10} y={yF - 118} width={w + 20} height={34} fill={c("padB")} />
        <Prof x={x} y={yF} w={w} bump={bump} si={c("siB")} siT={c("siF")} film={c("film")} bh={52} fh={50} />
        {[0.1 + 0.13, 0.64 + 0.13].map((u, i) => <Dn key={i} x={x + u * w} y={yF - 84} len={40 + 0 * i + (1 - e) * 26} c={c("press")} w={9} o={a} />)}
        <Dn x={x + 0.46 * w} y={yF - 84} len={18} c={c("press")} w={4} o={0.5 * b} /><Dn x={x + 0.96 * w - 4} y={yF - 84} len={18} c={c("press")} w={4} o={0.5 * b} />
        <text x={x + 0.1 * w} y={yF - 128} opacity={a} style={zh(sm(30), c("press"), 900)}>凸起：壓力大，磨得快</text>
        <text x={x + 0.34 * w} y={yF + 150} opacity={b} style={zh(sm(30), H.text, 800)}>凹處：磨得慢</text>
        <text x={x + 0.1 * w} y={yF + 178} opacity={e} style={zh(sm(34), c("lp_good"), 900)}>最後就變平了</text>
        <text x={620} y={118} opacity={a} style={zh(34, H.text, 800)}>① 凸起先被磨掉</text><text x={620} y={176} opacity={b} style={zh(34, H.text, 800)}>② 凹處慢慢跟上</text><text x={620} y={234} opacity={e} style={zh(34, c("lp_good"), 900)}>③ 整面一樣高</text>
      </svg>
    </Card>
  );
};

// ── cmp-co：誰在做（不透明、大字；念到誰誰亮；3D 另有引線指到對應部位） ──
const Co: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300;
  const rows: [string, string, string][] = [["應用材料、荏原", "CMP 機台", "mc"], ["英特格、富士軟片", "研磨液", "sl"], ["杜邦", "研磨墊", "pd"], ["頌勝（台灣）", "研磨墊", "ss"], ["中砂（台灣）", "鑽石碟（修整器）", "zs"]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <div style={{ position: "absolute", inset: 0, background: H.cardCompare }} />
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {rows.map(([n, d, key], i) => { const on = tween(f, T(o, key), 10, EASE.enter); const cur = on > 0.5 && (i === rows.length - 1 || tween(f, T(o, rows[i + 1][2]), 4) < 0.5);
          const y = 64 + i * 46;
          return <g key={i}>
            <rect x={20} y={y} width={W - 40} height={40} fill={cur ? H.amber : on > 0.5 ? "#E7EEF8" : "#F1F4F8"} stroke={cur ? H.amber : H.text3} strokeWidth={cur ? 4 : 2} />
            <text x={36} y={y + 30} style={zh(32, cur ? onC(H.amber) : H.text, 900)}>{n}</text>
            <text x={W - 36} y={y + 30} textAnchor="end" style={zh(30, cur ? onC(H.amber) : H.text2, 800)}>{d}</text></g>; })}
      </svg>
    </Card>
  );
};

// ── cmp-step：沉積 → 研磨（這一支）→ 量測檢測（下一支） ──
const Step: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 250;
  const a = tween(f, T(o, "dep"), 10, EASE.enter), b = tween(f, T(o, "cmp"), 10, EASE.enter), c2 = tween(f, T(o, "next"), 10, EASE.enter);
  const names = [["沉積", "長出不平的膜", a], ["研磨", "每一層磨平", b], ["量測檢測", "下一支", c2]] as const;
  const bw = 250, gap = 80, x0 = 36;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {names.map(([n, d, on], i) => { const x = x0 + i * (bw + gap); const hl = i === 1 && on > 0.5 && c2 < 0.5; const nx = i === 2 && on > 0.5;
          return <g key={i} opacity={0.3 + 0.7 * on}>
            <rect x={x} y={70} width={bw} height={130} fill={hl || nx ? H.amber : H.cardCompare} stroke={H.text3} strokeWidth={hl || nx ? 6 : 3} />
            <text x={x + bw / 2} y={128} textAnchor="middle" style={zh(n.length > 2 ? 42 : 48, hl || nx ? onC(H.amber) : H.text, 900)}>{n}</text>
            <text x={x + bw / 2} y={174} textAnchor="middle" style={zh(sm(32), hl || nx ? onC(H.amber) : H.text2, 700)}>{d}</text>
            {i < 2 ? <path d={`M${x + bw + 10} 135 H${x + bw + gap - 14} m-14 -12 l14 12 l-14 12`} stroke={H.text3} strokeWidth={5} fill="none" /> : null}
          </g>; })}
      </svg>
    </Card>
  );
};

export const CmpSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "cmp-prev") return <Prev {...p} />;
  if (kd === "cmp-why") return <Why {...p} />;
  if (kd === "cmp-tool") return <Tool {...p} />;
  if (kd === "cmp-spin") return <Spin {...p} />;
  if (kd === "cmp-head") return <Head {...p} />;
  if (kd === "cmp-slurry") return <Slurry {...p} />;
  if (kd === "cmp-cond") return <Cond {...p} />;
  if (kd === "cmp-flat") return <Flat {...p} />;
  if (kd === "cmp-co") return <Co {...p} />;
  if (kd === "cmp-step") return <Step {...p} />;
  return null;
};
