// 2026/11/28 tech-carrier：中游補充篇 M5「光罩盒與晶圓載具」的 2D 示意卡（overlay `section` 的 kind 以 "carrier-" 開頭，Hud.tsx 轉過來）。
//   carrier-hook 前一集密封盒→長怎樣？→怎麼擋灰塵｜carrier-drawer 晶圓盒正面＋抽屜櫃對照｜carrier-kc 仰視三溝三銷、一放就滑到定位
//   carrier-oht 天車→承載埠→兩扇門一起開→取片｜carrier-purge 氮氣進、濕氣氧氣出（逐漸變少）＋餅乾罐乾燥劑｜carrier-egg 蛋盒對照＋防震
//   carrier-pod 雙層光罩盒剖面（外盒外面開、內盒真空裡開）｜carrier-clean 塑膠吸水放氣＋清洗｜carrier-tw 家登、中勤｜carrier-next 晶片熱點→下一集故障分析＋留言關鍵字
// LOGO 只用 Brand.tsx LOGOS 表的原檔（100% 不透明，未輪到細灰框、輪到粗框）；沒有原檔的公司（中勤）用白底深色文字名牌（不仿商標）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D, State3D } from "./engine";
import { Flag, LOGOS, LogoSvg } from "./Brand";

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
const cl01 = (x: number) => Math.min(1, Math.max(0, x));
// 示意色（材料本身的顏色，不是頻道色票）
const RED = "#E0472F", OK = "#14A38B", BLUE = "#2F7FE0", SHELL = "#BFD8F4", SHELLE = "#6F8FB8", DOOR = "#E4E8EE", COMB = "#3A3F4C", MIR = "#C9D3E2", STEEL = "#8E9BB0",
  N2 = "#2F7FE0", H2O = "#7CC8F2", O2 = "#E5484D", JAR = "#D9C7A0", EGG = "#F3E3C3", CARTON = "#B99A6B", FOAM = "#F4F1E8", POD = "#3C4352", INPOD = "#B8C2D0", QZ = "#9CC8EE",
  PCB = "#2F6B4F", PKG = "#2A2D33", LEAD = "#B8C2D0", HOT = "#FF3B2F", PURP = "#B07CF0", MIST = "#8FCBF2";
const Sep: React.FC<{ x: number; y2?: number }> = ({ x, y2 = 316 }) => <line x1={x} y1={CT + 4} x2={x} y2={y2} stroke={H.lineSoft} strokeWidth={3} />;
const Row: React.FC<{ x: number; y: number; t: string; c: string; a: number; px?: number }> = ({ x, y, t, c, a, px = 30 }) => (
  <g opacity={0.35 + 0.65 * a}><rect x={x} y={y - px * 0.72} width={12} height={px * 0.72} fill={c} /><text x={x + 24} y={y} style={zh(px, H.text, 900)}>{t}</text></g>
);
const Cap: React.FC<{ x: number; y: number; t: string; px?: number; c?: string }> = ({ x, y, t, px = 24, c }) => <text x={x} y={y} textAnchor="middle" style={zh(px, c ?? H.text2, 800)}>{t}</text>;
const Sv: React.FC<{ W: number; Hh: number; children: React.ReactNode }> = ({ W, Hh, children }) => <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>{children}</svg>;
const FlagBox: React.FC<{ code: string; x: number; y: number; a: number }> = ({ code, x, y, a }) => (
  <g><rect x={x} y={y} width={50} height={36} fill="none" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} /><Flag code={code} h={28} x={x + 4} y={y + 4} asSvg /></g>
);
const Brand: React.FC<{ id: string; name: string; x: number; y: number; w: number; h: number; a: number }> = ({ id, name, x, y, w, h, a }) => {
  const s = LOGOS[id]; const lh = h - 14, lw = s ? Math.min(w - 16, (lh * s.w) / s.h) : 0, lh2 = s ? (lw * s.h) / s.w : 0;
  return (<g><rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={a > 0.5 ? H.amber : H.lineSoft} strokeWidth={a > 0.5 ? 4 : 1.5} />
    {s ? <LogoSvg id={id} x={x + (w - lw) / 2} y={y + (h - lh2) / 2} h={lh2} /> : <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" style={zh(30, "#1F3A5F", 900)}>{name}</text>}</g>);
};
// 晶圓盒正面（門拿掉時看得到一層層晶圓）：x,y＝左上角，w,h＝外框
const FoupFront: React.FC<{ x: number; y: number; w: number; h: number; open: number; n?: number }> = ({ x, y, w, h, open, n = 13 }) => {
  const sl: React.ReactNode[] = []; for (let i = 0; i < n; i++) { const yy = y + h - 14 - i * ((h - 30) / (n - 1)); sl.push(<line key={i} x1={x + 12} y1={yy} x2={x + w - 12} y2={yy} stroke={MIR} strokeWidth={3} />, <rect key={`t${i}`} x={x + 4} y={yy - 2} width={8} height={4} fill={COMB} />, <rect key={`u${i}`} x={x + w - 12} y={yy - 2} width={8} height={4} fill={COMB} />); }
  return (<g><rect x={x} y={y} width={w} height={h} rx={8} fill={SHELL} stroke={SHELLE} strokeWidth={3} />{sl}
    <rect x={x + w / 2 - 22} y={y - 14} width={44} height={14} fill={SHELLE} />
    <g opacity={1 - open}><rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} rx={6} fill={DOOR} stroke={H.text2} strokeWidth={2} />
      <circle cx={x + w * 0.28} cy={y + h / 2} r={8} fill={H.text2} /><circle cx={x + w * 0.72} cy={y + h / 2} r={8} fill={H.text2} /></g></g>);
};

// ── carrier-hook：前一集的密封盒 → 到底長什麼樣？ → 門封住，灰塵擋在外面 ──
const Hook: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, pv = on(f, T(o, "prev")), bx = on(f, T(o, "box")), lk = on(f, T(o, "look")), du = on(f, T(o, "dust"));
  const bx0 = 70, by0 = CT + 34, bw = 170, bh = 166;
  const dots = [0, 1, 2, 3, 4, 5].map((i) => { const u = ((f * 0.9 + i * 23) % 120) / 120, x = 20 + u * 60, y = CT + 60 + i * 30; const stop = bx0 - 8; return [Math.min(x, stop) - (x > stop ? (x - stop) * 0.15 : 0), y + (x > stop ? (x - stop) * 0.9 : 0)]; });
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.45 + 0.55 * Math.max(pv, bx)}><FoupFront x={bx0} y={by0} w={bw} h={bh} open={0} /></g>
    <g opacity={lk * (1 - du)}><circle cx={bx0 + bw / 2} cy={by0 + bh / 2} r={34} fill="#FFFFFF" stroke={RED} strokeWidth={3} /><text x={bx0 + bw / 2} y={by0 + bh / 2 + 13} textAnchor="middle" style={zh(36, RED, 900)}>？</text></g>
    {dots.map(([x, y], i) => <circle key={i} cx={x} cy={Math.min(y, CT + 200)} r={6} fill="#C9A66B" opacity={0.4 + 0.6 * du} />)}
    <g opacity={du}><line x1={bx0 - 4} y1={by0} x2={bx0 - 4} y2={by0 + bh} stroke={OK} strokeWidth={6} /></g>
    <Cap x={bx0 + bw / 2} y={CT + 240} t="密封盒（示意）" />
    <Sep x={334} />
    <Row x={360} y={CT + 64} t="前一集：密封盒來回送晶圓" c={H.text2} a={Math.max(pv, bx)} />
    <Row x={360} y={CT + 138} t="到底長什麼樣？" c={BLUE} a={lk} />
    <Row x={360} y={CT + 212} t="怎麼擋灰塵？門封住" c={H.amber} a={du} />
  </Sv></Card>);
};
// ── carrier-drawer：晶圓盒正面（門打開看到一層層晶圓）＋抽屜櫃對照 ──
const Drawer: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, fp = on(f, T(o, "foup")), dr = on(f, T(o, "door"), 14), n = on(f, T(o, "n25")), dw = on(f, T(o, "drawer"));
  const cx = 196, cy = CT + 26;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.45 + 0.55 * Math.max(fp, dr)}><FoupFront x={24} y={CT + 30} w={140} h={166} open={dr} /></g>
    <Cap x={100} y={CT + 240} t="晶圓盒（開門）" />
    <g opacity={0.35 + 0.65 * dw}>
      <rect x={cx} y={cy} width={120} height={170} rx={6} fill="#C9A66B" stroke={H.text2} strokeWidth={2} />
      {[0, 1, 2, 3].map((i) => <g key={i}><rect x={cx + 10} y={cy + 10 + i * 40} width={100} height={32} rx={3} fill="#E3C995" stroke={H.text2} strokeWidth={1.5} transform={i === 1 ? `translate(${dw * 22} 0)` : undefined} />
        <rect x={cx + 50} y={cy + 22 + i * 40} width={20} height={6} rx={3} fill={H.text2} transform={i === 1 ? `translate(${dw * 22} 0)` : undefined} /></g>)}
    </g>
    <Cap x={cx + 60} y={CT + 240} t="抽屜櫃" />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="廠裡叫晶圓盒（FOUP）" c={BLUE} a={fp} />
    <Row x={360} y={CT + 114} t="前面開門，從前面拿" c={H.amber} a={dr} />
    <Row x={360} y={CT + 176} t="一盒 25 片，一格一片" c={OK} a={n} />
    <Row x={360} y={CT + 238} t="像抽屜櫃" c={H.text2} a={dw} />
  </Sv></Card>);
};
// ── carrier-kc：仰視盒底：三道放射溝 ＋ 三顆圓頭凸點；一放下，凸點滑到溝的正中（自己對準） ──
const Kc: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, gr = on(f, T(o, "groove")), pn = on(f, T(o, "pins")), al = on(f, T(o, "align"), 18);
  const cx = 168, cy = CT + 104, R = 58, off = (1 - al) * 6;
  const ang = [90, 210, 330];
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={cx - 104} y={cy - 96} width={208} height={192} rx={14} fill="#5E6878" stroke={H.text2} strokeWidth={2} />
    {ang.map((d) => { const r = (d * Math.PI) / 180, ux = Math.cos(r), uy = Math.sin(r), nx = -uy, ny = ux; return (<g key={d} opacity={0.45 + 0.55 * gr}>
      {[-1, 1].map((s) => <line key={s} x1={cx + ux * (R - 28) + s * 9 * nx} y1={cy + uy * (R - 28) + s * 9 * ny} x2={cx + ux * (R + 28) + s * 9 * nx} y2={cy + uy * (R + 28) + s * 9 * ny} stroke="#FFFFFF" strokeWidth={5} />)}</g>); })}
    {ang.map((d) => { const r = (d * Math.PI) / 180; return <circle key={`p${d}`} cx={cx + R * Math.cos(r) + off} cy={cy + R * Math.sin(r) - off * 0.6} r={9} fill={H.amber} stroke={H.text} strokeWidth={2} opacity={pn} />; })}
    <Cap x={cx} y={CT + 240} t="仰視盒底（示意）" />
    <Sep x={334} />
    <Row x={360} y={CT + 64} t="盒底：三道放射溝" c={BLUE} a={gr} />
    <Row x={360} y={CT + 138} t="機台：三顆圓頭凸點" c={H.amber} a={pn} />
    <Row x={360} y={CT + 212} t="一放就對準，自己滑到位" c={OK} a={al} />
  </Sv></Card>);
};
// ── carrier-oht：側視：天花板軌道上的天車 → 吊到承載埠 → 盒門＋機台門一起往內開 → 晶圓只在機台內潔淨區移動 ──
const Oht: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, rl = on(f, T(o, "rail")), hg = on(f, T(o, "hang"), 24), dr = on(f, T(o, "door")), op = on(f, T(o, "open"), 16), ai = on(f, T(o, "air"), 16);
  const ry = CT + 8, bxY = CT + 30 + hg * 100, bx = 200;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={16} y={ry} width={300} height={10} fill={STEEL} />
    <g opacity={0.45 + 0.55 * rl}><rect x={bx - 10} y={ry + 12} width={90} height={22} rx={4} fill="#F3F5F8" stroke={H.text2} strokeWidth={2} />
      <line x1={bx + 12} y1={ry + 34} x2={bx + 12} y2={bxY} stroke={COMB} strokeWidth={3} /><line x1={bx + 58} y1={ry + 34} x2={bx + 58} y2={bxY} stroke={COMB} strokeWidth={3} />
      <rect x={bx} y={bxY} width={70} height={64} rx={6} fill={SHELL} stroke={SHELLE} strokeWidth={2} /><rect x={bx - 8} y={bxY + 6} width={8} height={52} fill={DOOR} stroke={H.text2} strokeWidth={1.5} transform={`translate(${-op * 34} ${op * 50})`} /></g>
    <rect x={bx - 20} y={CT + 194} width={110} height={12} fill={STEEL} /><rect x={bx - 10} y={CT + 206} width={90} height={44} fill={H.lineSoft} />
    <rect x={16} y={CT + 56} width={150} height={194} fill="none" stroke={H.text2} strokeWidth={3} />
    <rect x={162} y={CT + 134} width={8} height={60} fill={STEEL} transform={`translate(${-op * 24} ${op * 50})`} />
    <g opacity={ai}><line x1={60} y1={CT + 164} x2={200} y2={CT + 164} stroke={OK} strokeWidth={4} /><rect x={60} y={CT + 160} width={64} height={8} fill={MIR} stroke={H.text2} strokeWidth={1} transform={`translate(${(1 - ai) * 120} 0)`} /></g>
    <Cap x={90} y={CT + 92} t="機台內" px={22} />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="天車：沿天花板軌道跑" c={BLUE} a={rl} />
    <Row x={360} y={CT + 114} t="吊到承載埠（Load port）" c={H.amber} a={hg} />
    <Row x={360} y={CT + 176} t="盒門＋機台門一起開" c={OK} a={Math.max(dr, op)} />
    <Row x={360} y={CT + 238} t="晶圓不碰外面空氣" c={RED} a={ai} />
  </Sv></Card>);
};
// ── carrier-purge：盒子剖面：氮氣（藍箭頭）從盒底進、濕氣（藍白點）氧氣（紅點）被推出去，點數逐漸變少；右邊餅乾罐＋乾燥劑 ──
const Purge: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, wt = on(f, T(o, "wait")), n2 = on(f, T(o, "n2")), mo = on(f, T(o, "moist")), ox = on(f, T(o, "o2")), jr = on(f, T(o, "jar"));
  const x0 = 24, y0 = CT + 22, w = 170, h = 156;
  // r1（物理可改）：每顆點依序被推到右下排氣口才消失（不是原地不見）
  const ex = x0 + w - 34, ey = y0 + h + 16, n20 = T(o, "n2");
  const dots = Array.from({ length: 12 }, (_, i) => { const sx = x0 + 20 + ((i * 37) % 130), sy = y0 + 20 + ((i * 53) % 120), p = cl01((f - n20 - 6 - i * 7) / 36), e = p * p;
    return { x: sx + (ex - sx) * e, y: sy + (ey - sy) * e, c: i % 3 === 0 ? O2 : H2O, show: p < 1 }; });
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={x0} y={y0} width={w} height={h} rx={8} fill={SHELL} stroke={SHELLE} strokeWidth={3} opacity={0.45 + 0.55 * Math.max(wt, n2)} />
    {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={x0 + 22} y1={y0 + 30 + i * 22} x2={x0 + w - 22} y2={y0 + 30 + i * 22} stroke={MIR} strokeWidth={3} />)}
    {dots.map((d, i) => (d.show ? <circle key={i} cx={d.x} cy={d.y} r={6} fill={d.c} stroke={H.text2} strokeWidth={1} opacity={0.4 + 0.6 * Math.max(mo, ox, 1 - n2)} /> : null))}
    <g opacity={n2}>{[0, 1, 2].map((i) => { const u = ((f * 1.4 + i * 30) % 90) / 90; return <path key={i} d={`M${x0 + 30 + i * 8},${y0 + h + 10 - u * 60} l-8,12 l16,0 Z`} fill={N2} />; })}
      <line x1={x0 + 34} y1={y0 + h + 24} x2={x0 + 34} y2={y0 + h - 6} stroke={N2} strokeWidth={5} /></g>
    <g opacity={Math.max(mo, ox)}><line x1={x0 + w - 34} y1={y0 + h - 6} x2={x0 + w - 34} y2={y0 + h + 24} stroke={RED} strokeWidth={5} /><path d={`M${x0 + w - 42},${y0 + h + 16} l8,12 l8,-12 Z`} fill={RED} /></g>
    <g opacity={0.35 + 0.65 * jr}>
      <rect x={226} y={CT + 56} width={88} height={130} rx={14} fill={JAR} stroke={H.text2} strokeWidth={2} /><rect x={220} y={CT + 42} width={100} height={18} rx={6} fill={H.text2} />
      {[0, 1, 2].map((i) => <circle key={i} cx={248 + i * 22} cy={CT + 160} r={10} fill="#C98A4B" stroke={H.text2} strokeWidth={1} />)}
      <rect x={252} y={CT + 86} width={36} height={26} rx={4} fill="#FFFFFF" stroke={H.text2} strokeWidth={1.5} /></g>
    <Cap x={x0 + w / 2} y={CT + 240} t="盒內（剖面）" /><Cap x={270} y={CT + 240} t="乾燥劑" />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="排隊等下一台機台時" c={H.text2} a={wt} />
    <Row x={360} y={CT + 114} t="從盒底灌氮氣" c={BLUE} a={n2} />
    <Row x={360} y={CT + 176} t="趕走濕氣和氧氣" c={RED} a={Math.max(mo, ox)} />
    <Row x={360} y={CT + 238} t="像餅乾罐放乾燥劑" c={H.amber} a={jr} />
  </Sv></Card>);
};
// ── carrier-egg：出貨盒放在泡棉裡（車斗顛簸、盒子少動）＋蛋盒對照 ──
const Egg: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, sh = on(f, T(o, "ship")), fs = on(f, T(o, "fosb")), ls = on(f, T(o, "less")), sk = on(f, T(o, "shock")), eg = on(f, T(o, "egg"));
  const b = Math.sin(f * 0.5) * 8 * sk, bi = b * 0.2;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g transform="translate(0 -36)"><g transform={`translate(0 ${b})`}>
      <rect x={20} y={CT + 40} width={170} height={170} fill={CARTON} stroke={H.text2} strokeWidth={2} />
      {[[24, CT + 44], [154, CT + 44], [24, CT + 174], [154, CT + 174]].map(([x, y], i) => <rect key={i} x={x} y={y} width={32} height={32} fill={FOAM} stroke={H.text2} strokeWidth={1} />)}
    </g>
    <g transform={`translate(0 ${bi})`} opacity={0.45 + 0.55 * Math.max(sh, fs)}>
      <rect x={56} y={CT + 76} width={98} height={98} rx={6} fill="#E9ECF1" stroke={H.text2} strokeWidth={2} />
      {[0, 1, 2].map((i) => <line key={i} x1={66} y1={CT + 96 + i * 28} x2={144} y2={CT + 96 + i * 28} stroke={H.lineSoft} strokeWidth={4} />)}
      <rect x={66} y={CT + 150} width={18} height={12} fill={ls > 0.5 ? OK : H.text2} /><rect x={126} y={CT + 150} width={18} height={12} fill={ls > 0.5 ? OK : H.text2} /></g>
    <rect x={14} y={CT + 214 + b} width={182} height={12} fill={STEEL} />
    <g opacity={sk}><path d={`M200,${CT + 220} l12,-10 l0,20 Z`} fill={RED} /></g>
    <g opacity={0.35 + 0.65 * eg}>
      <path d={`M220,${CT + 150} q16,40 32,0 q16,40 32,0 q16,40 32,0 l0,40 l-96,0 Z`} fill={CARTON} stroke={H.text2} strokeWidth={2} />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={236 + i * 32} cy={CT + 140} rx={13} ry={17} fill={EGG} stroke={H.text2} strokeWidth={1.5} />)}</g></g>
    <Cap x={105} y={CT + 240} t="出貨盒＋泡棉" /><Cap x={268} y={CT + 240} t="蛋盒" />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="送客戶：換出貨盒（FOSB）" c={BLUE} a={Math.max(sh, fs)} />
    <Row x={360} y={CT + 114} t="少開門：門閂一路鎖著" c={OK} a={ls} />
    <Row x={360} y={CT + 176} t="重點：防撞、防震" c={RED} a={sk} />
    <Row x={360} y={CT + 238} t="像蛋盒，一格格托住" c={H.amber} a={eg} />
  </Sv></Card>);
};
// ── carrier-pod：雙層光罩盒剖面：外盒（深色）在機台外打開 → 金屬內盒進真空腔（虛線框）→ 真空裡才打開上蓋，光罩留在底板 ──
const Pod: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, mk = on(f, T(o, "mask")), pd = on(f, T(o, "pod")), ev = on(f, T(o, "euv"), 16), tw = on(f, T(o, "two"), 20), vc = on(f, T(o, "vac")), opn = on(f, T(o, "open") + 6, 14);
  // r1（物理必改 4）：關好門 → 抽真空（框內的點一顆顆被抽走）→ 才開上蓋
  const pump = cl01((f - T(o, "vac") - 4) / 26);
  const ox = 30, oy = CT + 82, ix = ox + 24 + tw * 140, iy = oy + 40;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={ox} y={oy + 96} width={130} height={16} fill={POD} />
    <g transform={`translate(0 ${-ev * 70})`} opacity={0.45 + 0.55 * Math.max(mk, pd)}><path d={`M${ox},${oy + 96} L${ox},${oy} L${ox + 130},${oy} L${ox + 130},${oy + 96}`} fill="none" stroke={POD} strokeWidth={10} /></g>
    <rect x={180} y={CT + 76} width={140} height={128} fill="none" stroke={BLUE} strokeWidth={3} strokeDasharray="10 7" opacity={0.3 + 0.7 * vc} />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (i / 8 >= pump ? <circle key={`v${i}`} cx={196 + ((i * 41) % 110)} cy={CT + 92 + ((i * 29) % 40)} r={4} fill={H2O} stroke={H.text2} strokeWidth={1} opacity={vc} /> : null))}
    <g opacity={vc * (1 - opn)}><line x1={250} y1={CT + 204} x2={250} y2={CT + 222} stroke={BLUE} strokeWidth={4} /><path d={`M244,${CT + 216} l6,8 l6,-8 Z`} fill={BLUE} /></g>
    <rect x={ix} y={iy + 40} width={82} height={10} fill={INPOD} stroke={H.text2} strokeWidth={1.5} />
    <rect x={ix + 8} y={iy + 30} width={66} height={10} fill={QZ} stroke={BLUE} strokeWidth={1.5} />
    <g transform={`translate(0 ${-opn * 26})`}><path d={`M${ix},${iy + 40} L${ix},${iy + 8} L${ix + 82},${iy + 8} L${ix + 82},${iy + 40}`} fill="none" stroke={INPOD} strokeWidth={7} /></g>
    <Cap x={95} y={CT + 240} t="機台外" /><Cap x={250} y={CT + 240} t="真空腔" c={BLUE} />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="光罩也有專屬盒子" c={H.text2} a={Math.max(mk, pd)} />
    <Row x={360} y={CT + 114} t="極紫外光用：兩層" c={BLUE} a={Math.max(ev, tw)} />
    <Row x={360} y={CT + 176} t="外盒：機台外打開" c={H.amber} a={ev} />
    <Row x={360} y={CT + 238} t="金屬內盒：真空裡才開" c={OK} a={Math.max(vc, opn)} />
  </Sv></Card>);
};
// ── carrier-clean：塑膠盒殼剖面：水氣滲進去（藍點）、放氣跑出來（紫點）→ 高純度塑膠 → 清洗機噴水＋烘乾 ──
const Clean: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, dt = on(f, T(o, "dirty")), ab = on(f, T(o, "absorb")), ot = on(f, T(o, "out")), pu = on(f, T(o, "pure")), ws = on(f, T(o, "wash")), ws2 = on(f, T(o, "wash") + 12);
  const wx = 150, wy = CT + 24, wh = 180;
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={wx} y={wy} width={36} height={wh} fill={pu > 0.5 ? "#D6E8FA" : SHELL} stroke={SHELLE} strokeWidth={3} opacity={0.5 + 0.5 * Math.max(dt, ab)} />
    {[0, 1, 2, 3, 4].map((i) => { const u = ((f * 0.8 + i * 21) % 100) / 100; return <circle key={`a${i}`} cx={40 + u * (wx - 40 + 18)} cy={wy + 30 + i * 36} r={6} fill={H2O} stroke={H.text2} strokeWidth={1} opacity={ab * (1 - ws) * (u < 0.98 ? 1 : 0)} />; })}
    {[0, 1, 2, 3].map((i) => { const u = ((f * 0.7 + i * 27) % 100) / 100; return <circle key={`o${i}`} cx={wx + 36 + u * 110} cy={wy + 50 + i * 40 - u * 20} r={6} fill={PURP} opacity={ot * (1 - pu)} />; })}
    <g opacity={ws2}>{[0, 1, 2].map((i) => { const u = ((f * 1.2 + i * 20) % 60) / 60; return <path key={`h${i}`} d={`M${300 - u * 90},${wy + 40 + i * 50} l-16,-8 l0,16 Z`} fill="#FF8A3D" />; })}</g>
    <g opacity={ws * (1 - ws2)}>{[0, 1, 2, 3, 4, 5].map((i) => { const u = ((f * 1.6 + i * 17) % 60) / 60; return <line key={i} x1={44 + i * 18} y1={wy + 4 + u * 160} x2={44 + i * 18} y2={wy + 18 + u * 160} stroke={MIST} strokeWidth={4} strokeLinecap="round" />; })}
      <rect x={30} y={wy - 8} width={110} height={10} fill={STEEL} /></g>
    <Cap x={168} y={CT + 240} t="塑膠盒壁（剖面）" />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="盒子自己也怕髒" c={H.text2} a={dt} />
    <Row x={360} y={CT + 114} t="塑膠會吸水、放氣" c={RED} a={Math.max(ab, ot)} />
    <Row x={360} y={CT + 176} t="所以用高純度塑膠" c={BLUE} a={pu} />
    <Row x={360} y={CT + 238} t="還要定期清洗、烘乾" c={OK} a={ws} />
  </Sv></Card>);
};
// ── carrier-tw：家登（3680，光罩盒起家、晶圓盒也是主力）、中勤（台灣廠，自有品牌晶圓盒）──
const Tw: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, a1 = on(f, T(o, "gd")), mk = on(f, T(o, "mask")), fp = on(f, T(o, "foup")), a2 = on(f, T(o, "ck")), ow = on(f, T(o, "own"));
  const rows: [string, string, string, string, number][] = [["gudeng", "家登", "代號 3680", "光罩盒起家、晶圓盒主力", Math.max(a1, mk, fp)], ["ckplas", "中勤 CKplas", "台灣載具廠", "自有品牌做晶圓盒", Math.max(a2, ow)]];
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <g opacity={0.45 + 0.55 * Math.max(a1, mk)}><rect x={30} y={CT + 70} width={120} height={80} rx={8} fill={POD} /><rect x={52} y={CT + 92} width={76} height={36} fill={QZ} /></g>
    <Cap x={90} y={CT + 180} t="光罩盒" />
    <g opacity={0.45 + 0.55 * Math.max(fp, a2, ow)}><FoupFront x={186} y={CT + 56} w={120} h={110} open={1} n={8} /></g>
    <Cap x={246} y={CT + 196} t="晶圓盒" />
    <Sep x={334} />
    {rows.map(([id, n, s1, s2, a], i) => <g key={id}><FlagBox code="TW" x={360} y={CT + 34 + i * 116} a={a} /><Brand id={id} name={n} x={428} y={CT + 20 + i * 116} w={200} h={66} a={a} />
      <text x={646} y={CT + 46 + i * 116} style={zh(26, H.text, 900)} opacity={0.4 + 0.6 * a}>{s1}</text>
      <text x={646} y={CT + 82 + i * 116} style={zh(24, H.text2, 800)} opacity={0.4 + 0.6 * a}>{s2}</text></g>)}
  </Sv></Card>);
};
// ── carrier-next：封裝晶片（四邊接腳）→ 熱點變紅 → 放大鏡掃過找壞點 → 下一集故障分析；留言關鍵字 ──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 330, cn = on(f, T(o, "clean")), bd = on(f, T(o, "bad")), wh = on(f, T(o, "where")), an = on(f, T(o, "anal")), nx = on(f, T(o, "next")), fa = on(f, T(o, "fa")), kw = on(f, T(o, "kw"));
  const cx = 168, cy = CT + 106, s = 58, mx = cx + Math.sin(f * 0.07) * 50 * Math.max(bd, an);
  const leads: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) { const t = -s + 14 + i * ((2 * s - 28) / 6); leads.push(<rect key={`t${i}`} x={cx + t - 4} y={cy - s - 16} width={8} height={16} fill={LEAD} />, <rect key={`b${i}`} x={cx + t - 4} y={cy + s} width={8} height={16} fill={LEAD} />, <rect key={`l${i}`} x={cx - s - 16} y={cy + t - 4} width={16} height={8} fill={LEAD} />, <rect key={`r${i}`} x={cx + s} y={cy + t - 4} width={16} height={8} fill={LEAD} />); }
  return (<Card o={o} k={k} W={W} Hh={Hh}><Sv W={W} Hh={Hh}>
    <rect x={cx - s - 30} y={cy - s - 30} width={2 * s + 60} height={2 * s + 60} fill={PCB} />
    {leads}
    <rect x={cx - s} y={cy - s} width={2 * s} height={2 * s} fill={PKG} opacity={0.5 + 0.5 * Math.max(cn, bd)} />
    <circle cx={cx + 20} cy={cy - 14} r={16} fill={HOT} opacity={an * (0.6 + 0.4 * Math.sin(f * 0.25))} />
    <g opacity={Math.max(bd, wh)}><circle cx={mx} cy={cy - 10} r={34} fill="none" stroke={H.text} strokeWidth={6} /><line x1={mx + 24} y1={cy + 14} x2={mx + 52} y2={cy + 42} stroke={H.text} strokeWidth={8} strokeLinecap="round" /></g>
    <Cap x={cx} y={CT + 240} t="封裝晶片（示意）" />
    <Sep x={334} />
    <Row x={360} y={CT + 52} t="盒子再乾淨，晶片還是會壞" c={H.text2} a={Math.max(cn, bd)} />
    <Row x={360} y={CT + 114} t="壞在哪？要靠分析找" c={RED} a={Math.max(wh, an)} />
    <Row x={360} y={CT + 176} t="下一集：故障分析" c={BLUE} a={Math.max(nx, fa)} />
    <Row x={360} y={CT + 238} t="留言「晶圓盒」拿資料" c={H.amber} a={kw} />
  </Sv></Card>);
};
export const CarrierSection: React.FC<P> = (p) => {
  const kd = String((p.o as any).kind);
  const M: Record<string, React.FC<P>> = { "carrier-hook": Hook, "carrier-drawer": Drawer, "carrier-kc": Kc, "carrier-oht": Oht, "carrier-purge": Purge, "carrier-egg": Egg, "carrier-pod": Pod, "carrier-clean": Clean, "carrier-tw": Tw, "carrier-next": Next };
  const C2 = M[kd]; return C2 ? <C2 {...p} /> : null;
};
