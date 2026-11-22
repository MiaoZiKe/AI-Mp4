// 2026/11/18 tech-etch：蝕刻機的 2D 示意卡（overlay `section` 的 kind 以 "etch-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   etch-dim 洞的比例（寬 100 奈米、深 1 萬奈米，兩條長條照 1 比 100 畫）｜etch-gas 氣體→射頻電→電漿（離子＋自由基）
//   etch-sect 晶圓剖面（孔一點一點變深，與 3D 的塞子同一份時間；保護膜、沒膜對照）｜etch-cold 一般溫度對照零下 70 度｜etch-next 結尾三件事＋下一支
// 全部示意；顏色讀 model.json 的 palette；時間全部來自 script.json 的 t（cue）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, sm, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
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
const NL = 8;

/** 孔的剖面：堆疊 8 層、孔寬 hw；depth＝0..1（已挖到的深度比例）；wall＝0..1 保護膜；taper＝孔越深越窄（對照用） */
/** 粒子上的正負號（畫成線段：它是粒子圖形的一部分，不是要讀的字；11/22 起取代 14～34px 的「＋／－」字） */
const Sign: React.FC<{ x: number; y: number; s: number; w: number; c: string; minus?: boolean }> = ({ x, y, s, w, c, minus }) => <path d={`M${x - s} ${y} H${x + s}${minus ? "" : ` M${x} ${y - s} V${y + s}`}`} stroke={c} strokeWidth={w} strokeLinecap="round" fill="none" />;
const Profile: React.FC<{ m: Model3D; x: number; y: number; w: number; lh: number; hw: number; depth: number; films?: number[]; taper?: number; bowl?: number; ions?: number; f?: number; mask?: boolean; ionTop?: number }> = ({ m, x, y, w, lh, hw, depth, films, taper = 0, bowl = 0, ions = 0, f = 0, mask = true, ionTop = -1e9 }) => {
  const c = (n: string) => col(m.product, n);
  const ox = c("oxide"), ni = c("nitride"), rs = c("resist"), fl = c("film"), si = c("si"), ion = c("lp_ion");
  const cx = x + w / 2, H0 = NL * lh, hd = depth * H0, my = y + 14;
  const half = (yy: number) => { const u = Math.max(0, Math.min(1, (yy - my) / H0)); return hw / 2 * (1 - taper * u) + bowl * Math.sin(Math.PI * Math.min(1, u * 1.1)) * 14; };
  const pts = (side: number) => { const arr: string[] = []; for (let i = 0; i <= 24; i++) { const yy = my + (hd * i) / 24; arr.push(`${cx + side * half(yy)},${yy}`); } return arr; };
  const hole = `M${cx - half(my)},${my} L${pts(-1).join(" L")} L${pts(1).reverse().join(" L")} L${cx + half(my)},${my} Z`;
  return (
    <g>
      <rect x={x} y={my + H0} width={w} height={26} fill={si} />
      {Array.from({ length: NL }, (_, i) => <rect key={i} x={x} y={my + (NL - 1 - i) * lh} width={w} height={lh - 1} fill={i % 2 === 0 ? ox : ni} />)}
      {mask ? <rect x={x} y={my - 14} width={w} height={14} fill={rs} /> : null}
      {mask ? <rect x={cx - hw / 2} y={my - 14} width={hw} height={14} fill={H.cardCompare} /> : null}
      {hd > 0.5 ? <path d={hole} fill={H.cardCompare} /> : null}
      {films ? films.map((a, g) => { const gy0 = my + (3 - g) * 2 * lh, gy1 = gy0 + 2 * lh; const yEnd = Math.min(gy1, my + hd); if (a <= 0.01 || yEnd <= gy0) return null;
        return <g key={g} opacity={a}><rect x={cx - hw / 2 - 5} y={gy0} width={5} height={yEnd - gy0} fill={fl} /><rect x={cx + hw / 2} y={gy0} width={5} height={yEnd - gy0} fill={fl} /></g>; }) : null}
      {ions > 0 && hd < H0 + 1 ? [0, 1, 2].map((j) => { const p = ph(f, 0.03, j, 3), y0 = Math.max(my - 70, ionTop), yy = y0 + p * (my + hd - y0); /* ionTop：離子起點不進標題列（11/22） */ return <g key={j} opacity={ions * (1 - 0.3 * p)}><circle cx={cx + (j - 1) * hw * 0.28} cy={yy} r={5.5} fill={ion} /></g>; }) : null}
    </g>
  );
};

// ── etch-dim：洞的比例（兩條長條照 1 比 100 畫）──
const Dim: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, c = (n: string) => col(m.product, n);
  const mem = T(o, "mem"), wide = T(o, "wide"), deep = T(o, "deep"), q = T(o, "q");
  const a = tween(f, mem, 10, EASE.enter), b = tween(f, wide, 10, EASE.enter), d = tween(f, deep, 26, EASE.move), e = tween(f, q, 10, EASE.enter);
  const bx = 250, wpx = 6, dpx = 620;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}><Profile m={m} x={40} y={78} w={150} lh={22} hw={12} depth={1} f={f} /></g>
        <g opacity={b}>
          <text x={bx} y={118} style={zh(32, H.text, 800)}>寬約 100 奈米</text>
          <rect x={bx} y={128} width={wpx} height={20} fill={c("lp_ion")} />
        </g>
        <g opacity={d > 0.02 ? 1 : 0}>
          <text x={bx} y={190} style={zh(32, H.text, 800)}>深超過 10,000 奈米</text>
          <rect x={bx} y={200} width={dpx * d} height={20} fill={c("lp_sig")} />
          <text x={bx} y={250} opacity={d > 0.9 ? 1 : 0} style={zh(sm(30), H.text2, 700)}>兩條長度照 1 比 100 畫</text>
        </g>
        <text x={bx} y={304} opacity={e} style={zh(38, H.amber, 900)}>深寬比 100：1，怎麼挖才直？</text>
      </svg>
    </Card>
  );
};

// ── etch-gas：氣體→射頻電→電漿 ──
const Gas: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 335, c = (n: string) => col(m.product, n);
  const gas = T(o, "gas"), inn = T(o, "in"), rf = T(o, "rf"), pl = T(o, "plasma"), gl = T(o, "glow");
  const g = tween(f, gas, 10, EASE.enter), i1 = tween(f, inn, 14, EASE.move), r = tween(f, rf, 10, EASE.enter), p = tween(f, pl, 14, EASE.move), gg = tween(f, gl, 10, EASE.enter);
  const x0 = 70, x1 = 430, yT = 122, yB = 248;
  const blue = c("lp_sig"), ion = c("lp_ion"), amber = c("lp_warm"), pur = c("lp_pl");
  const N = 14;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={x0} y={yT + 14} width={x1 - x0} height={yB - yT - 14} fill={pur} opacity={0.22 * p * (0.7 + 0.3 * gg * Math.abs(Math.sin(f * 0.18)))} />
        <rect x={x0 - 10} y={yT - 12} width={x1 - x0 + 20} height={14} fill={c("steelHi")} /><text x={x0 - 6} y={yT - 20} style={zh(sm(30), H.text2, 700)}>噴氣頭（上電極）</text>
        <rect x={x0 - 10} y={yB + 4} width={x1 - x0 + 20} height={14} fill={c("ceramic")} /><text x={x0 - 6} y={yB + 54} style={zh(sm(30), H.text2, 700)}>靜電吸盤（下電極）</text>
        {r > 0 ? <path d={`M${x1 + 6} ${yT - 6} h30 v${yB - yT + 16} h-30`} stroke={c("lp_proc")} strokeWidth={5} fill="none" opacity={r} /> : null}
        {r > 0 ? <path d={Array.from({ length: 41 }, (_, j) => `${j ? "L" : "M"}${x1 + 56 + j * 2.2} ${(yT + yB) / 2 + Math.sin(j * 0.5 - f * 0.4) * 26 * r}`).join(" ")} stroke={c("lp_proc")} strokeWidth={4} fill="none" opacity={r} /> : null}
        {Array.from({ length: N }, (_, j) => {
          const u = ph(f, 0.01, j, N, j % 3), x = x0 + 24 + ((j * 53) % (x1 - x0 - 48)), y = yT + 8 + (yB - yT - 24) * (i1 > 0 ? (0.15 + 0.85 * ((u + j / N) % 1)) : 0.2 + (j % 5) * 0.12);
          const split = p, dx = Math.sin(f * 0.2 + j) * 8 * split;
          return (
            <g key={j} opacity={g}>
              {split < 0.5 ? <><circle cx={x} cy={y} r={9} fill={blue} /><circle cx={x + 11} cy={y + 5} r={6} fill={blue} opacity={0.8} /></> :
                <><circle cx={x - 7 + dx} cy={y} r={8} fill={ion} /><Sign x={x - 7 + dx} y={y} s={4.5} w={2.2} c={H.onAccent} /><circle cx={x + 12 - dx} cy={y + 5} r={6} fill={amber} /></>}
            </g>);
        })}
        <text x={x1 + 56} y={252} opacity={r} style={zh(sm(32), c("lp_proc"), 900)}>射頻電</text>
        <g opacity={tween(f, pl + 8, 10, EASE.enter)}>
          <circle cx={650} cy={112} r={9} fill={ion} /><text x={668} y={122} style={zh(sm(32), H.text, 800)}>離子（帶電）</text>
          <circle cx={650} cy={160} r={7} fill={amber} /><text x={668} y={170} style={zh(sm(32), H.text, 800)}>自由基（不帶電）</text>
        </g>
        <text x={610} y={Hh - 34} opacity={gg} style={zh(34, pur, 900)}>分子被打散而發光</text>
      </svg>
    </Card>
  );
};

// ── etch-sect：孔一點一點變深（與 3D 塞子同一份時間）；保護膜；沒膜 vs 有膜 ──
const Sect: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, c = (n: string) => col(m.product, n);
  let n = 0; for (let i = 0; i < NL; i++) n += tween(f, T(o, `p${i}`), 10, EASE.move);
  const depth = n / NL;
  const films = [0, 1, 2, 3].map((g) => tween(f, T(o, `f${g}`), 12, EASE.move));
  const film = tween(f, T(o, "film"), 10, EASE.enter), side = tween(f, T(o, "side"), 10, EASE.enter), st = tween(f, T(o, "straight"), 10, EASE.enter), hit = tween(f, T(o, "hit"), 8, EASE.enter);
  const bad = c("lp_bad"), good = c("lp_good");
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <Profile m={m} x={40} y={66} w={240} lh={20} hw={18} depth={depth} films={films} ions={hit} f={f} ionTop={CARD_CONTENT_TOP + 6} />
        <text x={300} y={110} opacity={hit} style={zh(30, H.text, 800)}><tspan fill={c("lp_ion")}>①</tspan> 離子往下打，孔底被打掉</text>
        <text x={300} y={160} opacity={film} style={zh(30, H.text, 800)}><tspan fill={good}>②</tspan> 保護膜留在洞壁</text>
        <text x={300} y={210} opacity={side} style={zh(28, H.text, 800)}><tspan fill={good}>③</tspan> 側面不被刻到，洞才直</text>
        <g opacity={film}>
          <g transform="translate(635 190)"><Profile m={m} x={0} y={0} w={90} lh={7} hw={12} depth={1} bowl={1.4} mask={false} f={f} /></g>
          <text x={680} y={Hh - 14} textAnchor="middle" style={zh(28, bad, 800)}>沒膜：碗形</text>
        </g>
        <g opacity={st}>
          <g transform="translate(825 190)"><Profile m={m} x={0} y={0} w={90} lh={7} hw={12} depth={1} films={[1, 1, 1, 1]} mask={false} f={f} /></g>
          <text x={858} y={Hh - 14} textAnchor="middle" style={zh(28, good, 800)}>有膜：直壁 ✓</text>
        </g>
      </svg>
    </Card>
  );
};

// ── etch-cold：一般溫度 對照 零下 70 度 ──
const Cold: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, c = (n: string) => col(m.product, n);
  const deep = T(o, "deep"), hard = T(o, "hard"), so = T(o, "so"), cold = T(o, "cold");
  const a = tween(f, deep, 24, EASE.move), b = tween(f, hard, 10, EASE.enter), r = tween(f, so, 24, EASE.move), cc = tween(f, cold, 10, EASE.enter);
  const bad = c("lp_bad"), blue = c("lp_sig");
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={190} y={100} textAnchor="middle" opacity={a > 0.1 ? 1 : 0} style={zh(34, H.text, 800)}>一般溫度</text>
        <Profile m={m} x={60} y={112} w={260} lh={16} hw={20} depth={0.78 * a} taper={0.55} f={f} />
        <text x={190} y={Hh - 14} textAnchor="middle" opacity={b} style={zh(32, bad, 900)}>越挖越窄，底部刻不動</text>
        <text x={620} y={100} textAnchor="middle" opacity={r > 0.1 ? 1 : 0} style={zh(34, H.text, 800)}>晶圓降到零下 70 度</text>
        <Profile m={m} x={490} y={112} w={260} lh={16} hw={20} depth={r} f={f} />
        <text x={620} y={Hh - 14} textAnchor="middle" opacity={cc} style={zh(32, blue, 900)}>一路挖到底，還是直的</text>
        <g opacity={cc} transform="translate(850 116)"><rect x={-9} y={0} width={18} height={118} fill="none" stroke={H.text3} strokeWidth={3} /><rect x={-5} y={40} width={10} height={74} fill={blue} /><circle cx={0} cy={126} r={18} fill={blue} />{/* 11/22：溫度計縮短，球和「−70°」留 ≥8px、字離卡片下緣也留距離 */}
          <text x={0} y={192} textAnchor="middle" style={zh(40, blue, 900)}>−70°</text></g>
      </svg>
    </Card>
  );
};

// ── etch-next：結尾三件事＋下一支 ──
const Next: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300, c = (n: string) => col(m.product, n);
  const ans = T(o, "ans"), ion = T(o, "ion"), prot = T(o, "prot"), fill = T(o, "fill"), next = T(o, "next"), dep = T(o, "dep");
  const L = (t: number) => 0.28 + 0.72 * t, a = 1, b = L(tween(f, ion, 10, EASE.enter)), p = L(tween(f, prot, 10, EASE.enter)), fl = L(tween(f, fill, 10, EASE.enter)), n = L(tween(f, next, 10, EASE.enter)), d = tween(f, dep, 8, EASE.enter);
  const pulse = 1 + 0.05 * Math.sin(f * 0.25);
  const chip = (x: number, w: number, t: string, cl: string, al: number) => <g opacity={al}><rect x={x} y={104} width={w} height={72} fill="none" stroke={cl} strokeWidth={6} /><text x={x + w / 2} y={152} textAnchor="middle" style={zh(36, H.text, 900)}>{t}</text></g>;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={W / 2} y={92} textAnchor="middle" opacity={a} style={zh(40, H.text, 900)}>又深又直，靠兩件事</text>
        {chip(60, 256, "電漿往下打", c("lp_ion"), b)}
        <text x={346} y={152} textAnchor="middle" opacity={p} style={zh(40, H.text2, 900)}>＋</text>
        {chip(376, 256, "洞壁有保護", c("lp_good"), p)}
        <g opacity={fl}><rect x={660} y={104} width={232} height={72} fill={c("cuHi")} opacity={0.9} /><text x={776} y={152} textAnchor="middle" style={zh(34, H.onAccent, 900)}>再填回材料</text></g>
        <g opacity={n}><rect x={W / 2 - 280} y={Hh - 82} width={560} height={52 * pulse} fill={H.amber} /><text x={W / 2} y={Hh - 44} textAnchor="middle" style={zh(36, onC(H.amber), 900)}>下一支 ▸ {d > 0.5 ? "薄膜沉積" : "…"}</text></g>
      </svg>
    </Card>
  );
};


// ── etch-ion：電子撞上氣體分子 → 分子變離子（帶正電）→ 電場往下拉 ──
const Ion: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, c = (n: string) => col(m.product, n);
  const ion = T(o, "ion"), chg = T(o, "charge"), fld = T(o, "field"), pul = T(o, "pull");
  const hit = tween(f, ion, 22, EASE.move), split = tween(f, chg, 12, EASE.enter), fa = tween(f, fld, 10, EASE.enter), pull = tween(f, pul, 26, (x: number) => x * x);
  const blue = c("lp_sig"), pink = c("lp_ion"), amb = c("lp_warm"), mx = 230, my = 150;
  const ex = 60 + (mx - 60 - 28) * hit;       // 電子從左邊飛來
  const iy = my + 120 * pull;
  const el = (x: number, y: number, al: number) => <g opacity={al}><circle cx={x} cy={y} r={11} fill={amb} /><Sign x={x} y={y} s={5.5} w={2.6} c={H.onAccent} minus /></g>;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={102} width={400} height={184} fill={c("lp_pl")} opacity={0.12 + 0.06 * Math.sin(f * 0.2)} />
        {[0, 1, 2, 3, 4].map((j) => { const u = ph(f, 0.004, j, 5, j), bx = 70 + ((u * 340 + j * 97) % 340), by = 130 + ((j * 41 + Math.sin(f * 0.05 + j) * 14) % 140); if (Math.abs(bx - mx) < 50 && Math.abs(by - my) < 40) return null;
          return <g key={j} opacity={0.75}><circle cx={bx} cy={by} r={11} fill={blue} /><circle cx={bx + 13} cy={by + 6} r={7} fill={blue} opacity={0.8} /></g>; })}
        {[0, 1, 2].map((j) => { const u = ph(f, 0.02, j, 3, j), ex2 = 60 + u * 360, ey = 120 + ((j * 67 + u * 80) % 150); return <g key={"e" + j} opacity={0.9}><circle cx={ex2} cy={ey} r={7} fill={amb} /><Sign x={ex2} y={ey} s={3.5} w={2} c={H.onAccent} minus /></g>; })}
        <rect x={40} y={100} width={400} height={6} fill={c("steelHi")} /><text x={436} y={86} textAnchor="end" style={zh(sm(28), H.text2, 700)}>電漿</text>
        <rect x={40} y={280} width={400} height={8} fill={c("si")} /><text x={44} y={320} style={zh(sm(28), H.text2, 700)}>晶圓</text>
        {split < 0.5 ? <><circle cx={mx} cy={my} r={20} fill={blue} /><circle cx={mx + 22} cy={my + 10} r={13} fill={blue} opacity={0.85} /></> : null}
        {el(ex, my + 4, 1 - split)}
        {split > 0 ? <>
          {el(mx - 20 - 70 * split, my - 34 * split, split)}{el(mx - 20 - 70 * split, my + 48 * split, split)}
          <g transform={`translate(${mx} ${iy})`} opacity={split}><circle r={26} fill={pink} /><Sign x={0} y={0} s={12} w={5} c={H.onAccent} /></g>
          <text x={mx} y={89} textAnchor="middle" opacity={split * (1 - pull)} style={zh(sm(26), pink, 900)}>離子（帶正電）</text>{/* 11/22：放在電漿框頂線上方、標題下面，和頂線、電子都留 ≥8px */}
        </> : null}
        {fa > 0 ? [0, 1, 2].map((j) => <path key={j} d={`M${mx + 80 + j * 40} 130 v${120 - 0 * j} m-9 -16 l9 18 l9 -18`} stroke={c("lp_proc")} strokeWidth={5} fill="none" opacity={fa} />) : null}
        <text x={mx + 174} y={206} opacity={fa} style={zh(sm(30), c("lp_proc"), 900)}>電場</text>{/* 11/22：原本在箭頭上方，和「離子（帶正電）」重疊 */}
        <text x={480} y={124} opacity={tween(f, ion, 8, EASE.enter)} style={zh(32, H.text, 800)}><tspan fill={amb}>①</tspan> 電子撞上氣體分子</text>
        <text x={480} y={184} opacity={split} style={zh(32, H.text, 800)}><tspan fill={pink}>②</tspan> 分子被撞掉電子，帶正電</text>
        <text x={480} y={244} opacity={fa} style={zh(32, H.text, 800)}><tspan fill={c("lp_proc")}>③</tspan> 電場把離子往下拉</text>
      </svg>
    </Card>
  );
};

// ── etch-co / etch-tw：公司卡（名字＋做什麼；各列依 cue 出現）──
const Co: React.FC<P & { rows: [string, string, string][]; head?: string; headAt?: string; sub?: string; subAt?: string }> = ({ o, f, k, rows, head, headAt, sub, subAt }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {head ? <text x={40} y={102} opacity={tween(f, T(o, headAt ?? "no"), 10, EASE.enter)} style={zh(38, H.text, 900)}>{head}</text> : null}
        {sub ? <text x={400} y={102} opacity={tween(f, T(o, subAt ?? "parts"), 10, EASE.enter)} style={zh(36, H.amber, 900)}>{sub}</text> : null}
        {rows.map(([name, desc, key], i) => { const y = (head ? 168 : 120) + i * (head ? 56 : 76), al = 0.3 + 0.7 * tween(f, T(o, key), 10, EASE.enter);
          return <g key={i} opacity={al}><rect x={40} y={y - 36} width={8} height={46} fill={H.amber} />
            <text x={62} y={y} style={zh(40, H.text, 900)}>{name}</text><text x={330} y={y} style={zh(32, H.text2, 800)}>{desc}</text></g>; })}
      </svg>
    </Card>
  );
};

export const EtchSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "etch-dim") return <Dim {...p} />;
  if (kd === "etch-gas") return <Gas {...p} />;
  if (kd === "etch-sect") return <Sect {...p} />;
  if (kd === "etch-cold") return <Cold {...p} />;
  if (kd === "etch-next") return <Next {...p} />;
  if (kd === "etch-ion") return <Ion {...p} />;
  if (kd === "etch-co") return <Co {...p} rows={[["科林研發", "電漿蝕刻機", "lam"], ["東京威力科創", "蝕刻機（含低溫蝕刻）", "tel"], ["應用材料", "蝕刻機（前後段都有）", "amat"]]} />;
  if (kd === "etch-tw") return <Co {...p} head="台灣沒有整機廠" headAt="no" sub="但有零件" subAt="parts" rows={[["京鼎", "替應材代工設備模組", "jd"], ["瑞耘", "腔體零件（氣體分配盤等）", "ry"], ["翔名", "蝕刻等設備的耗材", "xm"]]} />;
  return null;
};
