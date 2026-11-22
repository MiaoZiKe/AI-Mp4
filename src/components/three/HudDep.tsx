// 2026/11/18 tech-deposition：薄膜沉積的 2D 示意卡（overlay `section` 的 kind 以 "dep-" 開頭，Hud.tsx 的 HudSection 轉過來）。
//   dep-scale 一層膜有多薄（原子排列）｜dep-chamber 反應腔側視剖面｜dep-cvd CVD 表面反應｜dep-pvd 濺鍍離子撞靶｜
//   dep-cmp 兩種鋪法對照（新舊對照卡）｜dep-ald ALD 四步一圈｜dep-co 誰在做（名單，逐列亮起，3D 另有引線）
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
const cc = (m: Model3D) => (n: string) => col(m.product, n);

/** 側視溝槽剖面：矽（底＋兩鰭）＋ 各層膜。layers＝[{c, t, a}]，t＝厚度(px)，a＝出現程度 0..1，依序往內疊；mode "pvd" 頂厚側薄 */
const Trench: React.FC<{ x: number; y: number; layers: { c: string; t: number; a: number }[]; mode?: "conf" | "pvd"; si: string; siT: string; s?: number }> = ({ x, y, layers, mode = "conf", si, siT, s = 1 }) => {
  const FWp = 100 * s, TWp = 70 * s, FHp = 100 * s, base = 26 * s; // 鰭寬、溝槽寬、鰭高、底厚
  const total = 2 * FWp + TWp, x0 = x - total / 2, yTop = y, yFloor = y + FHp;
  let off = 0; const els: React.ReactNode[] = [];
  layers.forEach((l, i) => {
    const t = l.t * l.a * s;
    if (mode === "conf") {
      const xi = TWp / 2 - off - t;
      els.push(<g key={i}>
        <rect x={x0} y={yTop - off - t} width={FWp + (TWp / 2 - off - t) + 0.001 + (off + t) * 0} height={t} fill={l.c} />
        <rect x={x0 + FWp + TWp - (TWp / 2 - off - t) + 0} y={yTop - off - t} width={FWp + (TWp / 2 - off - t)} height={t} fill={l.c} />
        <rect x={x0 + FWp - off - t} y={yTop - off} width={t} height={FHp + off} fill={l.c} />
        <rect x={x0 + FWp + TWp + off} y={yTop - off} width={t} height={FHp + off} fill={l.c} />
        <rect x={x0 + FWp - off} y={yFloor - off - t} width={TWp + 2 * off} height={t} fill={l.c} />
      </g>); void xi;
      off += l.t * l.a * s;
    } else {
      const top = 22 * l.a * s, wall = 3 * l.a * s, flr = 11 * l.a * s, ov = 15 * l.a * s;
      els.push(<g key={i}>
        <rect x={x0} y={yTop - top} width={FWp + ov} height={top} fill={l.c} />
        <rect x={x0 + FWp + TWp - ov} y={yTop - top} width={FWp + ov} height={top} fill={l.c} />
        <rect x={x0 + FWp - wall} y={yTop} width={wall} height={FHp * 0.45} fill={l.c} />
        <rect x={x0 + FWp + TWp} y={yTop} width={wall} height={FHp * 0.45} fill={l.c} />
        <rect x={x0 + FWp} y={yFloor - flr} width={TWp} height={flr} fill={l.c} />
      </g>);
    }
  });
  return (<g>
    <rect x={x0} y={yFloor} width={total} height={base} fill={si} />
    <rect x={x0} y={yTop} width={FWp} height={FHp} fill={siT} />
    <rect x={x0 + FWp + TWp} y={yTop} width={FWp} height={FHp} fill={siT} />
    {els}
  </g>);
};

// ── dep-scale：一層膜有多薄 ──
const Scale: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, c = cc(m);
  const film = T(o, "film"), thin = T(o, "thin"), how = T(o, "how");
  const a = tween(f, film, 12, EASE.enter), b = tween(f, thin, 16, EASE.move), q = tween(f, how, 10, EASE.enter);
  const R = 15, gx = 560, gy = 112, cols = 12, rows = 6;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}>
          <rect x={60} y={196} width={300} height={74} fill={c("si")} /><rect x={60} y={176} width={300} height={20} fill={c("film")} />
          <text x={60} y={164} style={zh(sm(32), c("film"), 900)}>一層膜</text><text x={200} y={246} style={zh(34, H.text, 800)}>矽晶圓</text>
          <path d={`M360 186 L${gx - 18} ${gy + 4 * R * 1.7}`} stroke={H.text3} strokeWidth={3} strokeDasharray="8 6" fill="none" />
        </g>
        <g opacity={b}>
          {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, i) => {
            const isFilm = r < 4; const x = gx + i * R * 1.9 + (r % 2) * R, y = gy + r * R * 1.7;
            const on = isFilm ? tween(f, thin + 4 + (3 - r) * 8, 8, EASE.enter) : 1;
            return <circle key={`${r}-${i}`} cx={x} cy={y} r={R} fill={isFilm ? c("film") : c("si")} stroke={H.cardCompare} strokeWidth={2} opacity={on} />; }))}
        </g>
        <text x={372} y={172} opacity={b} style={zh(32, H.text, 900)}>放大到原子</text>
        <text x={gx} y={gy + 6 * R * 1.7 + 36} opacity={q} style={zh(sm(32), H.text2, 800)}>約 3～5 層原子（示意）</text>
        <g opacity={q}><path d={`M${gx + 11 * R * 1.9 + 2 * R + 8} ${gy - R} V${gy + 3 * R * 1.7 + R}`} stroke={H.amber} strokeWidth={5} /><text x={gx + 11 * R * 1.9 + 2 * R + 8} y={gy - R - 10} textAnchor="middle" style={zh(sm(30), H.amber, 900)}>膜</text></g>{/* 11/22：標線移到原子右邊、「膜」放在標線上方，不碰原子 */}
      </svg>
    </Card>
  );
};

// ── dep-chamber：反應腔側視剖面（結構一開始就完整畫出，念到時該處亮起、動起來） ──
const Chamber: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const sh = T(o, "shower"), wf = T(o, "wafer"), pu = T(o, "pump");
  const lit = (at: number) => 0.4 + 0.6 * tween(f, at, 10, EASE.enter);
  const b = lit(sh), w = lit(wf), p = lit(pu), gb = tween(f, sh, 10, EASE.enter), gp = tween(f, pu, 10, EASE.enter);
  const cx = 300, x0 = 70, x1 = 530, yS = 118, yW = 222; // 11/22：加熱座加高、字和加熱條分開，整組上移 16px
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <path d={`M${x0} 74 V${Hh - 38} H${x1} V74`} stroke={H.text3} strokeWidth={6} fill="none" />
        <rect x={cx - 24} y={52} width={48} height={22} fill={c("steel")} />
        <text x={cx + 34} y={70} style={zh(sm(30), H.text2, 700)}>進氣</text>
        <g opacity={b}>
          <rect x={x0 + 30} y={yS} width={x1 - x0 - 60} height={16} fill={c("steel2")} />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={x0 + 46 + i * 36} y={yS + 3} width={8} height={10} fill={H.cardCompare} />)}
          <text x={x1 + 10} y={yS + 14} style={zh(sm(30), H.text, 800)}>噴氣頭</text>
        </g>
        {Array.from({ length: 12 }, (_, i) => Array.from({ length: 3 }, (_, j) => { const u = ph(f, 0.018, j, 3, i % 4); return <circle key={`${i}-${j}`} cx={x0 + 50 + i * 36} cy={yS + 22 + u * (yW - yS - 28)} r={5} fill={c("lp_sig")} opacity={0.15 + 0.85 * gb} />; }))}
        {Array.from({ length: 3 }, (_, j) => { const u = ph(f, 0.02, j, 3); return <circle key={`in${j}`} cx={cx} cy={52 + u * 60} r={7} fill={c("lp_sig")} opacity={0.2 + 0.8 * gb} />; })}
        <g opacity={w}>
          <rect x={x0 + 60} y={yW} width={x1 - x0 - 120} height={10} fill={c("si")} /><rect x={x0 + 50} y={yW + 10} width={x1 - x0 - 100} height={46} fill={c("steel")} />
          <rect x={x0 + 50} y={yW + 50} width={x1 - x0 - 100} height={6} fill={c("lp_heat")} opacity={0.5 + 0.4 * Math.sin(f * 0.15)} />
          <text x={x0 + 66} y={yW - 10} style={zh(sm(30), H.text, 800)}>晶圓</text><text x={cx + 20} y={yW + 42} style={zh(sm(26), onC(H.amber), 800)}>加熱座</text>
        </g>
        <g opacity={p}>
          {Array.from({ length: 4 }, (_, j) => { const u = ph(f, 0.018, j, 4); return <g key={j}><circle cx={x0 + 30} cy={yW - 6 + u * 70} r={6} fill={c("lp_bad")} opacity={0.2 + 0.8 * gp} /><circle cx={x1 - 30} cy={yW - 6 + u * 70} r={6} fill={c("lp_bad")} opacity={0.2 + 0.8 * gp} /></g>; })}
          <path d={`M${x0 + 30} ${Hh - 52} H${x1 + 80}`} stroke={c("lp_bad")} strokeWidth={6} fill="none" />
          {Array.from({ length: 3 }, (_, j) => { const u = ph(f, 0.014, j, 3); return <circle key={j} cx={x1 - 30 + u * 120} cy={Hh - 52} r={6} fill={c("lp_bad")} opacity={0.2 + 0.8 * gp} />; })}
          <text x={x1 + 90} y={Hh - 44} style={zh(sm(30), c("lp_bad"), 900)}>抽走</text>
        </g>
        <text x={640} y={118} opacity={b} style={zh(30, H.text, 800)}>① 噴氣頭灑下氣體</text>
        <text x={640} y={176} opacity={w} style={zh(30, H.text, 800)}>② 熱晶圓上反應</text>
        <text x={640} y={234} opacity={p} style={zh(30, H.text, 800)}>③ 用過的氣體抽走</text>
      </svg>
    </Card>
  );
};

// ── dep-cvd：表面反應 ──
const Cvd: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, c = cc(m);
  const cvd = T(o, "cvd"), react = T(o, "react"), solid = T(o, "solid");
  const a = tween(f, cvd, 12, EASE.enter), r = tween(f, react, 24, EASE.move), s = tween(f, solid, 40, EASE.move);
  const yS = 250, x0 = 40, x1 = 560;
  const N = 6;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={x0} y={yS} width={x1 - x0} height={50} fill={c("si")} />
        <rect x={x0} y={yS} width={x1 - x0} height={7} fill={c("lp_heat")} opacity={0.35 + 0.65 * r} />
        {Array.from({ length: N }, (_, i) => <rect key={i} x={x0 + 20 + i * 86} y={yS - 22 * s} width={64} height={22 * s} fill={c("film")} />)}
        {Array.from({ length: N }, (_, i) => { const u = ph(f, 0.011, i, N, i % 3); const px = x0 + 50 + i * 86; const y = 118 + u * (yS - 22 * s - 118 - 18); // 11/22：起點在「兩種氣體分子」字下面
          const merged = r > 0.5 && u > 0.82;
          return <g key={i} opacity={a}>
            {!merged ? <><circle cx={px - 14} cy={y} r={11} fill={c("lp_sig")} /><circle cx={px + 14} cy={y + 8} r={11} fill={c("lp_proc")} /></> : null}
            {r > 0.2 ? <circle cx={px + 30} cy={y - (yS - 80) * 0.0 - 30 * (u > 0.85 ? (u - 0.85) * 6 : 0)} r={0} fill="none" /> : null}
          </g>; })}
        {Array.from({ length: 4 }, (_, j) => { const u = ph(f, 0.01, j, 4); return <circle key={j} cx={x0 + 90 + j * 120} cy={yS - 30 * s - u * 150} r={6} fill={c("purge")} opacity={r * (1 - u)} />; })}
        <text x={x0} y={96} opacity={a} style={zh(sm(32), H.text, 800)}>兩種氣體分子</text>
        <text x={x1 - 10} y={yS + 40} textAnchor="end" opacity={r} style={zh(sm(30), onC(H.amber), 800)}>熱晶圓表面</text>
        <text x={620} y={110} opacity={a} style={zh(34, H.text, 800)}>① 氣體落到表面</text>
        <text x={620} y={168} opacity={r} style={zh(34, H.text, 800)}>② 受熱起反應</text>
        <text x={620} y={226} opacity={s} style={zh(34, c("film"), 900)}>③ 固體留下長成膜</text>
        <text x={620} y={282} opacity={r} style={zh(sm(30), H.text2, 700)}>灰點是副產物，被抽走</text>
      </svg>
    </Card>
  );
};

// ── dep-pvd：濺鍍離子撞靶（剖面一開始就完整畫出：靶材→電漿→晶圓溝槽；離子往上撞靶、原子往下落，念到時加強並長膜） ──
const Pvd: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const spu = T(o, "spu"), ion = T(o, "ion"), tg = T(o, "target"), at = T(o, "atom"), land = T(o, "land");
  const a = 0.4 + 0.6 * tween(f, spu, 12, EASE.enter), i1 = tween(f, ion, 10, EASE.enter), g = tween(f, tg, 10, EASE.enter), t1 = tween(f, at, 10, EASE.enter), l1 = tween(f, land, 40, EASE.move);
  const x0 = 40, x1 = 560, yT = 84, cx = 300;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={x0} y={CARD_CONTENT_TOP} width={x1 - x0} height={yT - CARD_CONTENT_TOP} fill={c("atomG")} opacity={0.55 + 0.45 * g} />{/* 靶材從標題下緣＋8px 開始（11/22） */}
        <text x={x1 + 10} y={yT - 6} style={zh(sm(30), H.text, 800)}>靶材</text>
        <rect x={x0} y={yT} width={x1 - x0} height={112} fill={c("ion")} opacity={0.12 * a + 0.1 * i1} />
        {Array.from({ length: 9 }, (_, j) => { const u = ph(f, 0.02, j, 9, j % 3); const x = x0 + 30 + j * 56; return <circle key={j} cx={x} cy={yT + 100 - u * 92} r={8} fill={c("ion")} opacity={(0.3 + 0.7 * i1) * (u < 0.96 ? 1 : 0)} />; })}
        {Array.from({ length: 9 }, (_, j) => { const u = ph(f, 0.014, j, 9, j % 3); const x = x0 + 40 + j * 56 + (j % 2 ? 10 : -10) * u; return <circle key={j} cx={x} cy={yT + 6 + u * 124} r={6} fill={c("atomG")} opacity={0.2 + 0.8 * t1} />; })}
        <Trench x={cx} y={yT + 138} layers={[{ c: c("atomG"), t: 1, a: 0.05 + 0.95 * l1 }]} mode="pvd" si={c("siB")} siT={c("siF")} s={0.95} />
        <text x={490} y={Hh - 10} style={zh(sm(30), H.text, 800)}>晶圓上的溝槽</text>{/* 11/22：移到溝槽右邊，不再一半壓在溝槽上 */}
        <text x={620} y={118} opacity={0.35 + 0.65 * i1} style={zh(34, H.text, 800)}>① 離子加速撞靶</text>
        <text x={620} y={176} opacity={0.35 + 0.65 * t1} style={zh(34, H.text, 800)}>② 靶材原子被打出來</text>
        <text x={620} y={234} opacity={0.35 + 0.65 * l1} style={zh(34, c("atomG"), 900)}>③ 直線落到晶圓上</text>
        <text x={620} y={286} opacity={l1} style={zh(sm(30), H.text2, 700)}>只鋪得到正對的面</text>
      </svg>
    </Card>
  );
};

// ── dep-cmp：兩種鋪法對照（新舊對照卡） ──
const Cmp: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const deep = T(o, "deep"), unev = T(o, "uneven"), ald = T(o, "ald");
  const a = 0.5 + 0.5 * tween(f, deep, 12, EASE.enter), u = tween(f, unev, 24, EASE.move), e = tween(f, ald, 24, EASE.move);
  const si = c("siB"), siT = c("siF");
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <line x1={W / 2} y1={60} x2={W / 2} y2={Hh - 20} stroke={H.lineSoft} strokeWidth={3} />
        <g opacity={a}>
          <Trench x={W / 4} y={140} layers={[{ c: c("film"), t: 1, a: u }]} mode="pvd" si={si} siT={siT} />
          <text x={W / 4} y={92} textAnchor="middle" style={zh(36, H.text, 900)}>鋪不均勻（以濺鍍為例）</text>
          <text x={W / 4} y={Hh - 24} textAnchor="middle" opacity={u} style={zh(sm(32), c("lp_bad"), 900)}>頂端厚、側壁薄、洞口變窄</text>
        </g>
        <g opacity={a}>
          <Trench x={(3 * W) / 4} y={140} layers={[{ c: c("film"), t: 16, a: e }]} si={si} siT={siT} />
          <text x={(3 * W) / 4} y={92} textAnchor="middle" style={zh(36, H.text, 900)}>原子層沉積</text>
          <text x={(3 * W) / 4} y={Hh - 24} textAnchor="middle" opacity={e} style={zh(sm(32), c("lp_good"), 900)}>每一面一樣厚</text>
        </g>
      </svg>
    </Card>
  );
};

// ── dep-ald：四步一圈（溝槽放大；念到哪一步，該步亮起、畫面同步） ──
const Ald: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340, c = cc(m);
  const turn = T(o, "turn"), A = T(o, "a"), full = T(o, "full"), purge = T(o, "purge"), B = T(o, "b"), one = T(o, "one");
  const a = 0.4 + 0.6 * tween(f, turn, 10, EASE.enter);
  const l1 = [tween(f, full, 18, EASE.move), tween(f, B + 26, 18, EASE.move)];
  const l2 = [tween(f, one + 10, 10, EASE.move), tween(f, one + 22, 10, EASE.move)];
  const l3 = [tween(f, one + 34, 10, EASE.move), tween(f, one + 46, 10, EASE.move)];
  const L = 4.5;
  const layers = [{ c: c("layA"), t: L, a: l1[0] }, { c: c("layB"), t: L, a: l1[1] }, { c: c("layA"), t: L, a: l2[0] }, { c: c("layB"), t: L, a: l2[1] }, { c: c("layA"), t: L, a: l3[0] }, { c: c("layB"), t: L, a: l3[1] }];
  const cyc = f < B + 26 ? 0 : f < one + 10 ? 1 : f < one + 34 ? 2 : 3;
  // 目前是哪一步（0 還沒開始；1 通 A；2 貼滿＋吹掉；3 通 B 反應；4 吹掃長出一層；one 之後快轉輪流）
  const step = f < A ? 0 : f < full ? 1 : f < B ? 2 : f < B + 26 ? 3 : f < one ? 4 : 1 + (Math.floor((f - one) / 12) % 4);
  const steps: [string, string, string][] = [["①", "通入 A 氣", c("gasA")], ["②", "貼滿一層，吹掉多的", c("purge")], ["③", "通入 B 氣，反應", c("gasB")], ["④", "吹掃，長出一層", c("purge")]];
  const gasA = step === 1, gasB = step === 3, purging = step === 2 && f >= purge || step === 4;
  const cx = 250, s = 1.3, yTop = 126;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}>
          <Trench x={cx} y={yTop} layers={layers} si={c("siB")} siT={c("siF")} s={s} />
          {(gasA || gasB) ? Array.from({ length: 9 }, (_, j) => { const u = ph(f, 0.016, j, 9, j % 3); const x = cx - 220 + j * 55; const inT = Math.abs(x - cx) < 40; return <circle key={j} cx={x} cy={CARD_CONTENT_TOP + 9 + u * (inT ? 230 - CARD_CONTENT_TOP - 9 : 120 - CARD_CONTENT_TOP - 9)} r={9} fill={gasA ? c("gasA") : c("gasB")} />; }) : null}
          {purging ? Array.from({ length: 7 }, (_, j) => { const u = ph(f, 0.014, j, 7); return <circle key={`p${j}`} cx={cx - 160 + j * 52} cy={yTop - 4 - u * (yTop - 11 - CARD_CONTENT_TOP)} r={7} fill={c("purge")} opacity={1 - u} />; }) : null}
        </g>
        {steps.map(([n, t, col2], i) => {
          const hl = step === i + 1;
          return <g key={i} opacity={step === 0 ? 0.4 : hl ? 1 : 0.5}><rect x={520} y={74 + i * 58} width={410} height={48} fill={hl ? col2 : H.cardCompare} stroke={col2} strokeWidth={3} />
            <text x={536} y={108 + i * 58} style={zh(sm(32), hl ? onC(H.amber) : H.text, 800)}>{n} {t}</text></g>; })}
        <text x={40} y={Hh - 8} opacity={a} style={zh(38, H.amber, 900)}>已長 {cyc} 圈＝{cyc} 層</text>
      </svg>
    </Card>
  );
};

// ── dep-step：蝕刻→沉積→研磨（這一支在哪） ──
const Step: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 250, c = cc(m);
  const et = T(o, "etch"), bk = T(o, "back"), dp = T(o, "dep");
  const on = [tween(f, et, 10, EASE.enter), tween(f, bk, 10, EASE.enter), tween(f, dp, 10, EASE.enter)];
  const names = [["蝕刻", "挖出溝槽"], ["沉積", "把材料鋪回去"], ["研磨", "下一支"]];
  const bw = 250, gap = 80, x0 = 36;
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {names.map(([n, d], i) => { const x = x0 + i * (bw + gap); const a = i === 2 ? 0.45 : 0.25 + 0.75 * (i === 1 ? Math.max(on[1], on[2]) : on[0]); const hl = i === 1 && on[2] > 0.5;
          return <g key={i} opacity={a}>
            <rect x={x} y={70} width={bw} height={130} fill={hl ? H.amber : H.cardCompare} stroke={H.text3} strokeWidth={hl ? 6 : 3} />
            <text x={x + bw / 2} y={128} textAnchor="middle" style={zh(48, hl ? onC(H.amber) : H.text, 900)}>{n}</text>
            <text x={x + bw / 2} y={174} textAnchor="middle" style={zh(sm(32), hl ? onC(H.amber) : H.text2, 700)}>{d}</text>
            {i < 2 ? <path d={`M${x + bw + 10} 135 H${x + bw + gap - 14} m-14 -12 l14 12 l-14 12`} stroke={H.text3} strokeWidth={5} fill="none" /> : null}
          </g>; })}
        <g opacity={on[0]}><path d={`M${x0 + 60} 214 h40 l6 22 h30 l6 -22 h40`} stroke={c("film")} strokeWidth={0} fill="none" /></g>
      </svg>
    </Card>
  );
};

// ── dep-co：誰在做（不透明、大字；念到誰誰亮；3D 另有引線指到機台部位） ──
const Co: React.FC<P> = ({ o, f, k, m }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300, c = cc(m);
  const rows: [string, string, string][] = [["應用材料", "沉積機台", "am"], ["科林研發", "沉積機台", "lam"], ["東京威力科創", "沉積機台", "tel"], ["ASM", "原子層沉積機台", "asm"], ["光洋科（台灣）", "靶材", "gy"], ["京鼎（台灣）", "應用材料設備供應鏈", "jd"]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <div style={{ position: "absolute", inset: 0, background: H.cardCompare }} />
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {rows.map(([n, d, key], i) => { const on = tween(f, T(o, key), 10, EASE.enter); const cur = on > 0.5 && (i === 5 || tween(f, T(o, rows[i + 1][2]), 4) < 0.5);
          const y = CARD_CONTENT_TOP + i * 38; // 第一列從標題下緣＋8px 開始（11/22）
          return <g key={i}>
            <rect x={20} y={y} width={W - 40} height={34} fill={cur ? H.amber : on > 0.5 ? "#E7EEF8" : "#F1F4F8"} stroke={cur ? H.amber : H.text3} strokeWidth={cur ? 4 : 2} />
            <text x={36} y={y + 27} style={zh(30, cur ? onC(H.amber) : H.text, 900)}>{n}</text>
            <text x={W - 36} y={y + 27} textAnchor="end" style={zh(28, cur ? onC(H.amber) : H.text2, 800)}>{d}</text></g>; })}
      </svg>
    </Card>
  );
};

export const DepSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  if (kd === "dep-scale") return <Scale {...p} />;
  if (kd === "dep-chamber") return <Chamber {...p} />;
  if (kd === "dep-cvd") return <Cvd {...p} />;
  if (kd === "dep-pvd") return <Pvd {...p} />;
  if (kd === "dep-cmp") return <Cmp {...p} />;
  if (kd === "dep-ald") return <Ald {...p} />;
  if (kd === "dep-co") return <Co {...p} />;
  if (kd === "dep-step") return <Step {...p} />;
  return null;
};
