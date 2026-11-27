// 2026/11/28 tech-glass：玻璃基板（系列 3 第 10 集）的 2D 示意卡（overlay `section` 的 kind 以 "glass-" 開頭，Hud.tsx 的 HudSection 轉過來）。寫法照 HudBt.tsx。
//   glass-hook 接前一集｜glass-swap 芯板換成玻璃｜glass-cookie 樹脂受熱翹（餅乾）｜glass-tile 地磚對地毯＋英特爾說十倍｜glass-tgv 雷射改質→蝕刻→鍍銅、會裂｜
//   glass-co 五家公司（英特爾、三星電機官方 LOGO 原檔；Absolics、欣興、群創抓不到原檔→白底文字名牌）＋國旗｜glass-road 量產時程（分析預期，尚未確定）｜glass-next 下一集銅箔基板＋留言關鍵字。
// LOGO、國旗 100% 不透明（未輪到用細灰框）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { Flag, LogoSvg, logoW } from "./Brand";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
type P = { o: Overlay3D; f: number; k: number; m: Model3D; s?: State3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;
const CT = CARD_CONTENT_TOP;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(28, H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);
const on = (f: number, at: number, d = 10) => tween(f, at, d, EASE.enter);
const RED = "#E0472F", BLUE = "#2F7FE0", SI = "#5E6B82", CU = "#C77B3C", LASER = "#E0473A", ABF = "#9CCFB0", CLOTH = "#F1EEE4", PREPREG = "#E3B65A", GLASS = "#BFE3F0", GLASSD = "#7FB6CF",
  COOKIE = "#D9A55B", COOKIED = "#B07A35", TILE = "#E9EDF2", CARPET = "#C9A98A", CARPETD = "#A9876A", ETCH = "#8FD3C4";
const Sep: React.FC<{ x: number }> = ({ x }) => <line x1={x} y1={CT + 4} x2={x} y2={316} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const Sv: React.FC<{ W: number; Hh: number; children: React.ReactNode }> = ({ W, Hh, children }) => <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>{children}</svg>;
const Arr: React.FC<{ x1: number; y: number; x2: number; c: string; w?: number }> = ({ x1, y, x2, c, w = 4 }) => { const d = Math.sign(x2 - x1) || 1; return (
  <g><line x1={x1} y1={y} x2={x2 - d * 8} y2={y} stroke={c} strokeWidth={w} /><path d={`M${x2},${y} L${x2 - d * 14},${y - 8} L${x2 - d * 14},${y + 8} Z`} fill={c} /></g>); };
// 載板小剖面：上下增層＋芯板（cloth＝玻纖布泡樹脂、glass＝玻璃＋穿孔銅柱）
const Stack: React.FC<{ x: number; y: number; w: number; core: "cloth" | "glass"; a?: number; bend?: number }> = ({ x, y, w, core, a = 1, bend = 0 }) => {
  const cy = y + 28, ch = 44, b = bend;
  const curve = (yy: number) => `M${x},${yy - b} Q${x + w / 2},${yy + b * 0.6} ${x + w},${yy - b}`;
  return (<g opacity={a}>
    {[0, 9, 18].map((d) => <path key={`t${d}`} d={curve(y + d + 4)} stroke={d === 18 ? CU : ABF} strokeWidth={d === 18 ? 4 : 8} fill="none" />)}
    {core === "cloth" ? (<g><path d={`${curve(cy)} L${x + w},${cy + ch - b} Q${x + w / 2},${cy + ch + b * 0.6} ${x},${cy + ch - b} Z`} fill={PREPREG} stroke={H.text2} strokeWidth={1.5} />
      {Array.from({ length: Math.floor(w / 22) }, (_, j) => { const u = (11 + j * 22) / w; return <ellipse key={j} cx={x + 11 + j * 22} cy={cy + ch / 2 - b + 3.2 * u * (1 - u) * b} rx={8} ry={5} fill={CLOTH} />; })}</g>)
      : (<g><rect x={x} y={cy} width={w} height={ch} fill={GLASS} stroke={GLASSD} strokeWidth={2} />
        {Array.from({ length: Math.floor(w / 26) }, (_, j) => <rect key={j} x={x + 10 + j * 26} y={cy} width={7} height={ch} fill={CU} />)}</g>)}
    {[0, 9, 18].map((d) => <path key={`b${d}`} d={curve(cy + ch + 4 + d)} stroke={d === 0 ? CU : ABF} strokeWidth={d === 0 ? 4 : 8} fill="none" />)}
  </g>);
};

// ── glass-hook：接上一集（布再改還是會脹）→ 玻璃做的載板，好在哪？ ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, gl = on(f, T(o, "glass")), gd = on(f, T(o, "good")), pv = on(f, T(o, "prev")), gs = on(f, T(o, "gs"));
  const sw = 3 + 3 * Math.sin(f / 9);
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <Stack x={24} y={CT + 30} w={130} core="cloth" bend={sw} a={0.45 + 0.55 * pv} />
    <Arr x1={162} y={CT + 92} x2={192} c={H.text2} />
    <Stack x={198} y={CT + 30} w={120} core="glass" a={0.45 + 0.55 * gl} />
    <text x={258} y={CT + 22} textAnchor="middle" style={zh(40, RED, 900)} opacity={gd}>？</text>
    <text x={89} y={CT + 196} textAnchor="middle" style={zh(28, H.text2, 800)}>布核心</text><text x={258} y={CT + 196} textAnchor="middle" style={zh(28, H.text2, 800)}>玻璃核心</text>
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="玻璃做的載板，好在哪？" c={BLUE} a={Math.max(gl, gd)} />
    <Row x={360} y={CT + 122} t="上一集：布再改還是會脹" c={H.text2} a={pv} />
    <Row x={360} y={CT + 188} t="這集：玻璃基板" c={H.amber} a={gs} />
  </Sv></Card>);
};
// ── glass-swap：芯板（玻纖布泡樹脂）→ 換成一片玻璃 ──
const Swap: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, co = on(f, T(o, "core")), cl = on(f, T(o, "cloth")), re = on(f, T(o, "resin")), sw = on(f, T(o, "swap"), 16);
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g transform={`translate(${-140 * sw},0)`} opacity={1 - sw}><Stack x={60} y={CT + 40} w={200} core="cloth" a={0.5 + 0.5 * Math.max(cl, re)} /></g>
    <g transform={`translate(${140 * (1 - sw)},0)`} opacity={sw}><Stack x={60} y={CT + 40} w={200} core="glass" /></g>
    <rect x={40} y={CT + 64} width={240} height={52} fill="none" stroke={H.amber} strokeWidth={4} strokeDasharray="10 6" opacity={co} />
    <text x={160} y={CT + 196} textAnchor="middle" style={zh(28, H.text2, 800)}>{sw > 0.5 ? "芯板：一片玻璃" : "芯板：玻纖布＋樹脂"}</text>
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="載板中間有塊芯板" c={H.amber} a={co} />
    <Row x={360} y={CT + 122} t="平常：玻纖布泡樹脂" c={H.text2} a={Math.max(cl, re)} />
    <Row x={360} y={CT + 188} t="玻璃基板：換成一片玻璃" c={BLUE} a={sw} />
  </Sv></Card>);
};
// ── glass-cookie：樹脂受熱翹，像餅乾烤過邊捲起來；晶片越大越翹 ──
const Cookie: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ht = on(f, T(o, "heat")), wp = on(f, T(o, "warp"), 20), ck = on(f, T(o, "cookie")), cu = on(f, T(o, "curl"), 20), bg = on(f, T(o, "big"), 16), ln = on(f, T(o, "line"));
  const b = 6 + 20 * cu;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.4 + 0.6 * ck}><path d={`M40,${CT + 70 - b} Q160,${CT + 70 + b * 0.8} 280,${CT + 70 - b} L280,${CT + 96 - b} Q160,${CT + 96 + b * 0.8} 40,${CT + 96 - b} Z`} fill={COOKIE} stroke={COOKIED} strokeWidth={3} />
      {[70, 120, 170, 220].map((x) => <circle key={x} cx={x + 10} cy={CT + 82 + b * 0.3} r={5} fill={COOKIED} />)}</g>
    <text x={160} y={CT + 30} textAnchor="middle" style={zh(26, H.text2, 800)}>餅乾烤過</text>
    <Stack x={50} y={CT + 128} w={220} core="cloth" bend={4 + 14 * wp + 8 * bg} a={0.45 + 0.55 * Math.max(ht, wp)} />
    <rect x={160 - 30 - 26 * bg} y={CT + 112 - (4 + 14 * wp + 8 * bg) * 0.5} width={60 + 52 * bg} height={14} fill={SI} />
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="樹脂一受熱就會翹" c={RED} a={Math.max(ht, wp)} />
    <Row x={360} y={CT + 122} t="像餅乾烤過邊捲起來" c={H.amber} a={Math.max(ck, cu)} />
    <Row x={360} y={CT + 188} t="晶片越大越翹，線拉不細" c={H.text2} a={Math.max(bg, ln)} />
  </Sv></Card>);
};
// ── glass-tile：玻璃平（地磚）對樹脂（地毯）；英特爾說線路密度可到十倍 ──
const Tile: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, fl = on(f, T(o, "flat")), tl = on(f, T(o, "tile")), cp = on(f, T(o, "carpet")), it = on(f, T(o, "intel")), tn = on(f, T(o, "ten"));
  const draw = (t0: number) => Math.max(0, Math.min(1, (f - t0) / 24));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.45 + 0.55 * Math.max(fl, tl)}><rect x={24} y={CT + 26} width={140} height={150} fill={TILE} stroke={H.text2} strokeWidth={1.5} />
      {[1, 2].map((i) => <line key={`a${i}`} x1={24 + i * 46.7} y1={CT + 26} x2={24 + i * 46.7} y2={CT + 176} stroke="#C5CDD8" strokeWidth={2} />)}
      {[1, 2].map((i) => <line key={`b${i}`} x1={24} y1={CT + 26 + i * 50} x2={164} y2={CT + 26 + i * 50} stroke="#C5CDD8" strokeWidth={2} />)}
      {Array.from({ length: 10 }, (_, i) => <line key={i} x1={34} y1={CT + 40 + i * 13} x2={34 + 120 * draw(T(o, "tile") + i)} y2={CT + 40 + i * 13} stroke={CU} strokeWidth={3} />)}</g>
    <g opacity={0.45 + 0.55 * cp}><path d={`M182,${CT + 30} Q206,${CT + 22} 230,${CT + 32} T278,${CT + 30} T318,${CT + 32} L318,${CT + 176} L182,${CT + 176} Z`} fill={CARPET} stroke={CARPETD} strokeWidth={2} />
      {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M192,${CT + 56 + i * 32} Q222,${CT + 46 + i * 32} 250,${CT + 60 + i * 32} T308,${CT + 54 + i * 32}`} stroke={CU} strokeWidth={9} fill="none" strokeDasharray="140" strokeDashoffset={140 * (1 - draw(T(o, "carpet") + i * 3))} />)}</g>
    <text x={94} y={CT + 214} textAnchor="middle" style={zh(28, H.text2, 800)}>地磚＝玻璃</text><text x={250} y={CT + 214} textAnchor="middle" style={zh(28, H.text2, 800)}>地毯＝樹脂</text>
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="玻璃很平，受熱不太變形" c={BLUE} a={fl} />
    <Row x={360} y={CT + 122} t="平地磚上畫線，比地毯細" c={H.amber} a={Math.max(tl, cp)} />
    <Row x={360} y={CT + 188} t="英特爾說：線路密度可到" c={H.text2} a={it} />
    <text x={384} y={CT + 244} style={zh(40, BLUE, 900)} opacity={0.3 + 0.7 * tn}>十倍（公司說法）</text>
  </Sv></Card>);
};
// ── glass-tgv：玻璃不導電 → 雷射改質、蝕刻開孔、鍍銅接通；玻璃脆會裂 ──
const Tgv: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ins = on(f, T(o, "ins")), cn = on(f, T(o, "conn")), ho = on(f, T(o, "hole")), cu = on(f, T(o, "cu")), wi = on(f, T(o, "window")), cr = on(f, T(o, "crack"));
  const step = (x: number, n: string, a: number, kind: number) => (
    <g opacity={0.4 + 0.6 * a}>
      <rect x={x} y={CT + 50} width={84} height={56} fill={GLASS} stroke={GLASSD} strokeWidth={2} />
      {[16, 42, 68].map((d) => kind === 0 ? <line key={d} x1={x + d} y1={CT + 50} x2={x + d} y2={CT + 106} stroke={LASER} strokeWidth={3} strokeDasharray="5 4" />
        : <rect key={d} x={x + d - 6} y={CT + 50} width={12} height={56} fill={kind === 1 ? "#FFFFFF" : CU} stroke={kind === 1 ? ETCH : "none"} strokeWidth={2} />)}
      {kind === 0 ? <path d={`M${x + 42},${CT + 14} L${x + 34},${CT + 46} L${x + 50},${CT + 46} Z`} fill={LASER} /> : null}
      <text x={x + 42} y={CT + 140} textAnchor="middle" style={zh(23, H.text2, 800)}>{n}</text>
    </g>);
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {step(24, "雷射改質", Math.max(cn, ho), 0)}{step(124, "蝕刻開孔", ho, 1)}{step(224, "鍍銅", cu, 2)}
    <g opacity={0.4 + 0.6 * Math.max(wi, cr)}><rect x={60} y={CT + 170} width={200} height={40} fill={GLASS} stroke={GLASSD} strokeWidth={2} />
      <rect x={154} y={CT + 150} width={12} height={22} fill={SI} />
      <path d={`M160,${CT + 170} L150,${CT + 182} L166,${CT + 192} L152,${CT + 210}`} stroke={RED} strokeWidth={4} fill="none" opacity={cr} />
      <path d={`M160,${CT + 170} L178,${CT + 186} L170,${CT + 200}`} stroke={RED} strokeWidth={3} fill="none" opacity={cr} /></g>
    <text x={160} y={CT + 244} textAnchor="middle" style={zh(26, RED, 800)} opacity={cr}>直接鑽：裂</text>
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="玻璃不導電，上下要接通" c={H.text2} a={Math.max(ins, cn)} />
    <Row x={360} y={CT + 122} t="打很多穿孔，再鍍銅" c={BLUE} a={Math.max(ho, cu)} />
    <Row x={360} y={CT + 188} t="玻璃脆，一不小心就裂" c={RED} a={Math.max(wi, cr)} />
  </Sv></Card>);
};
// ── glass-co：誰在做（念到的順序：英特爾、三星電機、南韓公司在美國的專廠、台灣廠商送樣） ──
const NamePlate: React.FC<{ x: number; y: number; w: number; h: number; t: string; a: number; px?: number }> = ({ x, y, w, h, t, a, px = 30 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <text x={x + w / 2} y={y + h / 2 + px * 0.34} textAnchor="middle" style={zh(px, "#1F3A5F", 900)}>{t}</text></g>
);
const LogoPlate: React.FC<{ id: string; x: number; y: number; w: number; h: number; a: number; lh: number }> = ({ id, x, y, w, h, a, lh }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    <LogoSvg id={id} x={x + (w - logoW(id, lh)) / 2} y={y + (h - lh) / 2} h={lh} /></g>
);
const Co: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 400, it = on(f, T(o, "intel")), sm = on(f, T(o, "sem")), kr = on(f, Math.min(T(o, "kr"), T(o, "us"))), tw = on(f, T(o, "tw")), sp = on(f, T(o, "sample"));
  const rows: { fl: string[]; logo?: string; lh?: number; name: string; sub: string; s: string; a: number }[] = [
    { fl: ["US"], logo: "intel", lh: 34, name: "英特爾", sub: "", s: "美國晶片大廠：研發、展示樣品", a: it },
    { fl: ["KR"], logo: "samsung", lh: 14, name: "三星電機", sub: "", s: "南韓零件廠：試產線", a: sm },
    { fl: ["KR", "US"], name: "Absolics", sub: "", s: "南韓 SKC 子公司：美國喬治亞專廠", a: kr },
    { fl: ["TW"], name: "欣興", sub: "", s: "台灣載板廠：送樣、驗證中", a: Math.max(tw, sp) },
    { fl: ["TW"], name: "群創", sub: "", s: "台灣面板廠：送樣、試產規劃", a: Math.max(tw, sp) },
  ];
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    {rows.map((r, i) => { const y = CT + 10 + i * 64; return (<g key={r.name}>
      {r.fl.map((c, j) => <FlagBox key={c} code={c} x={20 + j * 56} y={y + 6} a={r.a} />)}
      {r.logo ? (<g><LogoPlate id={r.logo} x={140} y={y} w={120} h={48} a={r.a} lh={r.lh!} /><text x={270} y={y + 36} style={zh(28, H.text, 900)}>{r.name}</text></g>)
        : <NamePlate x={140} y={y} w={230} h={48} t={r.name} a={r.a} px={28} />}
      <text x={400} y={y + 35} style={zh(28, H.text2, 800)} opacity={0.4 + 0.6 * r.a}>{r.s}</text></g>); })}
  </Sv></Card>);
};
// ── glass-road：量產一延再延；多數說最快 2027 年以後；截至 11/28 尚未確定 ──
const Road: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, ms = on(f, T(o, "mass")), dl = on(f, T(o, "delay"), 24), mo = on(f, T(o, "most")), fa = on(f, T(o, "early")), un = on(f, T(o, "unk"), 8);
  const xs = [90, 380, 670], px = 90 + 470 * ms - 230 * dl + 200 * fa;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <line x1={50} y1={CT + 110} x2={900} y2={CT + 110} stroke={H.text2} strokeWidth={4} />
    {["2026｜現在", "2027｜最快", "2028 以後"].map((t, i) => (<g key={t} opacity={i === 0 ? 1 : 0.4 + 0.6 * mo}>
      <circle cx={xs[i] + 60} cy={CT + 110} r={12} fill={i === 1 ? H.amber : H.text2} />
      <text x={xs[i] + 60} y={CT + 160} textAnchor="middle" style={zh(30, H.text, 900)}>{t}</text></g>))}
    <g transform={`translate(${px},${CT + 50})`}><rect x={0} y={10} width={90} height={22} fill={GLASS} stroke={GLASSD} strokeWidth={2} />
      {[12, 34, 56, 78].map((d) => <rect key={d} x={d - 3} y={10} width={6} height={22} fill={CU} />)}
      <circle cx={18} cy={42} r={8} fill={SI} /><circle cx={72} cy={42} r={8} fill={SI} /></g>
    <text x={150} y={CT + 220} textAnchor="middle" style={zh(30, RED, 900)} opacity={0.35 + 0.65 * dl}>一延再延</text>
    <g opacity={un} transform={`rotate(-6 690 ${CT + 222})`}><rect x={540} y={CT + 192} width={300} height={56} fill="none" stroke={RED} strokeWidth={5} />
      <text x={690} y={CT + 232} textAnchor="middle" style={zh(32, RED, 900)}>截至 11/28 尚未確定</text></g>
  </Sv></Card>);
};
// ── glass-next：現在主角還是樹脂芯板 → 下一集銅箔基板；留言「玻璃基板」 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, nw = on(f, T(o, "now")), nx = on(f, T(o, "next")), cc = on(f, T(o, "ccl")), kw = on(f, T(o, "kw"));
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.45 + 0.55 * Math.max(nx, cc)}>
      {[0, 1, 2].map((i) => <g key={i}><rect x={40} y={CT + 40 + i * 50} width={240} height={8} fill={CU} /><rect x={40} y={CT + 48 + i * 50} width={240} height={30} fill={PREPREG} stroke={H.text2} strokeWidth={1.5} />
        {Array.from({ length: 10 }, (_, j) => <ellipse key={j} cx={52 + j * 24} cy={CT + 63 + i * 50} rx={8} ry={5} fill={CLOTH} />)}<rect x={40} y={CT + 78 + i * 50} width={240} height={8} fill={CU} /></g>)}</g>
    <text x={160} y={CT + 220} textAnchor="middle" style={zh(28, H.text2, 800)}>銅箔＋浸樹脂玻纖布</text>
    <Sep x={334} />
    <Row x={360} y={CT + 56} t="現在主角：樹脂芯板" c={H.text2} a={nw} />
    <Row x={360} y={CT + 122} t="下一集：銅箔基板" c={BLUE} a={Math.max(nx, cc)} />
    <Row x={360} y={CT + 188} t="留言「玻璃基板」拿資料" c={H.amber} a={kw} />
  </Sv></Card>);
};

export const GlassSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  const M: Record<string, React.FC<P>> = { "glass-hook": Hook, "glass-swap": Swap, "glass-cookie": Cookie, "glass-tile": Tile, "glass-tgv": Tgv, "glass-co": Co, "glass-road": Road, "glass-next": Next };
  const C2 = M[kd]; return C2 ? <C2 {...p} /> : null;
};
