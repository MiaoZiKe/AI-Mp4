// CaffAIne 新 LOGO 四款（2026/11/15，Andy：「先給我新LOGO」「跟之前說 OK 的 AI 影片風格一樣」）：等距 2.5D 粉彩，和 short-ai 同一個世界（THEME_ISO）。
//   A 等距體素杯（小立方塊疊成的杯子，AI 兩字是長春花藍發光的方塊，頂上飄資料點）
//   B 桌上的等距螢幕，螢幕裡是像素咖啡杯（螢幕＝AI，呼應 short-ai 的桌面）
//   C 等距白色厚卡片上的像素杯＋字標，蒸氣是往上飄的資料點
//   D 光滑等距馬克杯，蒸氣是電路走線接到一顆浮起來的 AI 晶片
// 只用 SVG；靜態示意用（還沒做動畫）。出圖：node scripts/caffaine/logo-stills.mjs。
import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT_ZH, LAYOUT_ISO as L, THEME_ISO as T } from "../../theme";
import { CAFF } from "./caffaineMark";
import VB from "./caffLogoVb.json";
import { Box, Shade, Slab, css, ground, iso, wallX } from "./IsoVideo";

const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
const P = T.color.primary;
/** 咖啡液面的焦糖色（品牌色，只在杯子裡的一小塊用） */
const COFFEE = { top: "#C98A55", l: "#B57846", r: "#9E6638" };
const BLUE = { top: "#8E9BFF", l: P.fill, r: P.side };
const crisp = { shapeRendering: "crispEdges" } as const;
type Tone = { top: string; l: string; r: string };
const S = T.solid;

// ───────── 體素 ─────────
const Vox: React.FC<{ x: number; y: number; z: number; u: number; c: Tone; o?: number }> = ({ x, y, z, u, c, o }) => {
  const p = (a: number, b: number, h: number) => iso(a * u, b * u, h * u).join(",");
  const f = (pts: string, fill: string) => <polygon points={pts} fill={fill} stroke={fill} strokeWidth={1.2} strokeLinejoin="round" />;
  return (
    <g opacity={o}>
      {f(`${p(x, y + 1, z + 1)} ${p(x + 1, y + 1, z + 1)} ${p(x + 1, y + 1, z)} ${p(x, y + 1, z)}`, c.l)}
      {f(`${p(x + 1, y + 1, z + 1)} ${p(x + 1, y, z + 1)} ${p(x + 1, y, z)} ${p(x + 1, y + 1, z)}`, c.r)}
      {f(`${p(x, y, z + 1)} ${p(x + 1, y, z + 1)} ${p(x + 1, y + 1, z + 1)} ${p(x, y + 1, z + 1)}`, c.top)}
    </g>
  );
};
const GA = ["010", "101", "111", "101", "101"], GI = ["111", "010", "010", "010", "111"];

/** 資料點：往上飄的小方塊、小圓點與 0／1（客制，淡出） */
const DataDots: React.FC<{ x: number; y: number; n?: number; gap?: number; s?: number }> = ({ x, y, n = 7, gap = 44, s = 14 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const k = i / (n - 1), px = x + 26 * Math.sin(i * 1.5) * (0.6 + k), py = y - i * gap, sz = s * (1.15 - 0.55 * k), c = [P.fill, T.color.sky.fill, T.color.plum.fill][i % 3];
      return i % 3 === 2 ? <text key={i} x={px} y={py + sz} fontFamily={MONO} fontWeight={800} fontSize={sz * 2.2} fill={c} opacity={1 - 0.6 * k} textAnchor="middle">{i % 2 ? "1" : "0"}</text>
        : <rect key={i} x={px - sz / 2} y={py - sz / 2} width={sz} height={sz} rx={i % 3 === 1 ? sz / 2 : 3} fill={c} opacity={1 - 0.6 * k} />;
    })}
  </g>
);
const Spark: React.FC<{ x: number; y: number; s: number; c?: string }> = ({ x, y, s, c = T.color.note.fill }) => <path transform={`translate(${x} ${y}) scale(${s / 50})`} d="M0 50 C0 12 -12 0 -50 0 C-12 0 0 -12 0 -50 C0 -12 12 0 50 0 C12 0 0 12 0 50 Z" fill={c} />;

// ───────── 四款圖形（局部座標；VB＝[x, y, w, h]）─────────
type MarkDef = { vb: [number, number, number, number]; el: React.ReactNode };

const cell = (v: string[], r: number, c: number) => v[r][c] === "1";
const MarkA = (): MarkDef => {
  const u = 30, W = 9, D = 5, H = 7;
  const inMask = (x: number, y: number) => x >= 0 && x < W && y >= 0 && y < D && !((x === 0 || x === W - 1) && (y === 0 || y === D - 1));
  const boundary = (x: number, y: number) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => !inMask(x + a, y + b));
  const vs: { x: number; y: number; z: number; c: Tone }[] = [];
  const letter = (x: number, z: number) => {
    // 前面（y＝D-1）x∈1..7、z∈1..5 是 AI 兩個字
    const gx = x - 1; if (gx < 0 || gx > 6) return false;
    const g = gx < 3 ? GA : gx === 3 ? null : GI, col = gx < 3 ? gx : gx - 4, row = 5 - z;
    return !!g && row >= 0 && row < 5 && cell(g, row, col);
  };
  for (let z = 0; z < H; z++) for (let y = 0; y < D; y++) for (let x = 0; x < W; x++) {
    if (!inMask(x, y)) continue;
    if (z === 0 && (x === 0 || x === W - 1)) continue;
    if (z === H - 1 && !boundary(x, y)) continue;
    let c: Tone = S.white;
    if (false && letter(x, z)) c = BLUE;
    else if (z === H - 2 && !boundary(x, y)) c = { ...S.white, top: COFFEE.top };
    vs.push({ x, y, z, c });
  }
  // 杯把（右側 +x）：一個方框
  for (const [x, z] of [[W, 4], [W + 1, 4], [W + 1, 3], [W + 1, 2], [W, 2]]) vs.push({ x, y: 2, z, c: S.white });
  vs.sort((a, b) => a.x + a.y - (b.x + b.y) || a.z - b.z);
  const lf = (x0: number, x1: number, z0: number, z1: number) => `${iso(x0 * u, D * u, z1 * u)} ${iso(x1 * u, D * u, z1 * u)} ${iso(x1 * u, D * u, z0 * u)} ${iso(x0 * u, D * u, z0 * u)}`;
  return {
    vb: [-190, -470, 700, 640],
    el: (
      <g>
        <defs><filter id="aGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={9} /></filter></defs>
        <Shade x={-70} y={-70} w={W * u + 2 * u + 120} h={D * u + 140} r={40} z={-14} a={0.12} />
        <Slab id="aTile" x={-50} y={-50} z={-10} w={W * u + 2 * u + 80} h={D * u + 100} t={22} r={34} c={S.desk} />
        {vs.map((v, i) => <Vox key={i} {...v} u={u} />)}
        {/* AI 發光：前面那排方塊上蓋一層模糊的藍 */}
        <g filter="url(#aGlow)" opacity={0.5}>{vs.filter((v) => v.c === BLUE).map((v, i) => <Vox key={i} {...v} u={u} c={{ top: "#B7C0FF", l: "#7F8DFF", r: "#7F8DFF" }} />)}</g>
        {vs.filter((v) => v.c === BLUE).map((v, i) => <Vox key={`b${i}`} {...v} u={u} />)}
        {/* AI 兩個字：貼在杯子前面（+y 面）的斜面上，長春花藍，後面一層模糊的光 */}
        {(() => { const o = iso(0.9 * u, D * u, 6.2 * u), m = [0.866, 0.5, 0, 1, o[0], o[1]]; return (
          <g transform={css(m as any)}>
            <text x={3.6 * u} y={3.9 * u} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={4.6 * u} fill="#8E9BFF" filter="url(#aGlow)" opacity={0.9}>AI</text>
            <text x={3.6 * u} y={3.9 * u} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={4.6 * u} fill={P.fill}>AI</text>
          </g>); })()}
        <g transform={`translate(${iso(4.5 * u, 2.5 * u, H * u)[0]} ${iso(4.5 * u, 2.5 * u, H * u)[1] - 40})`}><DataDots x={0} y={0} n={7} gap={46} s={16} /></g>
        <Spark x={iso(9 * u, 0, 8.5 * u)[0] + 60} y={iso(9 * u, 0, 8.5 * u)[1] - 120} s={34} />
      </g>
    ),
  };
};

/** 像素杯（沿用定稿 LOGO 的格子）畫在平面上：cup 色、AI 色、杯把色、蒸氣色 */
const PixelCup: React.FC<{ k: number; cup: string; ai: string; handle: string; steam: (i: number) => React.ReactNode }> = ({ k, cup, ai, handle, steam }) => (
  <g {...crisp} transform={`scale(${k}) translate(-100 -12)`}>
    {(CAFF.cup as unknown as number[][]).map(([x, y], i) => <rect key={`c${i}`} x={x} y={y} width={8.2} height={8.2} fill={cup} />)}
    {(CAFF.ai as unknown as number[][]).map(([x, y], i) => <rect key={`a${i}`} x={x} y={y} width={8.2} height={8.2} fill={ai} />)}
    {(CAFF.handle as unknown as number[][]).map(([x, y], i) => <rect key={`h${i}`} x={x} y={y} width={8.2} height={8.2} fill={handle} />)}
    {(CAFF.steam as unknown as number[][]).map(([x, y], i) => <g key={`s${i}`}>{steam(i) && <rect x={x} y={y} width={8} height={8} rx={2} fill={[P.fill, T.color.sky.fill, T.color.plum.fill][i % 3]} opacity={1 - 0.05 * i} />}</g>)}
  </g>
);

const MarkB = (): MarkDef => {
  const M = { x: 0, y: 0, z: 70, dx: 28, dy: 460, dz: 290 };
  const sw = M.dy, sh = M.dz, m = wallX(M.x + M.dx, M.y + M.dy, M.z + M.dz);
  return {
    vb: [-330, -440, 760, 860],
    el: (
      <g>
        <Shade x={-120} y={-60} w={300} h={560} r={50} z={-6} a={0.12} />
        <Slab id="bTile" x={-170} y={-50} z={-10} w={420} h={560} t={22} r={40} c={S.desk} />
        {/* 底座與頸 */}
        <Slab id="bBase" x={-20} y={150} z={0} w={110} h={160} t={14} r={20} c={S.white} />
        <Box x={4} y={190} z={14} dx={24} dy={80} dz={64} c={S.white} />
        <Box {...M} c={S.white} />
        <g transform={css(m)}>
          <rect x={16} y={16} width={sw - 32} height={sh - 32} rx={22} fill={T.screen.face} />
          <rect x={16} y={16} width={sw - 32} height={sh - 32} rx={22} fill="url(#bScr)" />
          <g transform={`translate(${sw / 2} ${sh / 2 - 118})`}>
            <PixelCup k={1.5} cup={T.card} ai={P.fill} handle="#E1E5FF" steam={() => true} />
          </g>
          <rect x={60} y={sh - 62} width={sw - 120} height={22} rx={11} fill={T.screen.bar} opacity={0.5} />
          <rect x={72} y={sh - 58} width={110} height={14} rx={7} fill={T.screen.on} />
          <rect x={192} y={sh - 62} width={8} height={22} rx={3} fill={T.screen.on} />
        </g>
        <defs><radialGradient id="bScr" cx="50%" cy="40%" r="60%"><stop offset="0" stopColor={T.screen.glow} stopOpacity={0.55} /><stop offset="1" stopColor={T.screen.glow} stopOpacity={0} /></radialGradient></defs>
        {/* 鍵盤 */}
        <Slab id="bKb" x={150} y={120} z={2} w={90} h={250} t={10} r={12} c={S.lav}>
          {Array.from({ length: 15 }, (_, i) => <rect key={i} x={10 + (i % 3) * 24} y={12 + Math.floor(i / 3) * 46} width={18} height={34} rx={5} fill={T.card} opacity={0.85} />)}
        </Slab>
        <Spark x={iso(0, 520, 380)[0] + 70} y={iso(0, 520, 380)[1]} s={36} />
        <Spark x={iso(0, 0, 420)[0] - 40} y={iso(0, 0, 420)[1] + 120} s={26} c={T.color.plum.fill} />
      </g>
    ),
  };
};

const CardFace: React.FC<{ x: number; y: number; w: number; h: number; r?: number; bg?: string; side?: string }> = ({ x, y, w, h, r = 44, bg = T.card, side = T.cardSide }) => (
  <g>
    <rect x={x + 10} y={y + 44} width={w - 20} height={h} rx={r} fill={T.floor} opacity={0.1} filter="url(#cShadow)" />
    <rect x={x} y={y + 16} width={w} height={h} rx={r} fill={side} />
    <rect x={x} y={y} width={w} height={h} rx={r} fill={bg} />
  </g>
);
const MarkC = (): MarkDef => (
  {
    vb: [-80, -60, 660, 720],
    el: (
      <g>
        <defs><filter id="cShadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={16} /></filter></defs>
        {/* 後面兩塊色板（桌面上疊著的彩色小卡）＋白色厚卡 */}
        <g transform="translate(-30 40) rotate(-6 100 300)"><CardFace x={20} y={40} w={460} h={540} bg={T.color.plum.soft} side={T.color.plum.fill} /></g>
        <g transform="translate(40 -10) rotate(5 300 300)"><CardFace x={60} y={30} w={460} h={540} bg={T.color.note.soft} side={T.color.note.side} /></g>
        <CardFace x={20} y={0} w={500} h={560} />
        <g transform="translate(270 96)"><PixelCup k={2.2} cup={S.desk.r} ai={P.fill} handle={S.desk.l} steam={() => true} /></g>
        <rect x={100} y={500} width={340} height={10} rx={5} fill={T.line} />
        <circle cx={70} cy={50} r={9} fill={T.color.wrong.fill} /><circle cx={100} cy={50} r={9} fill={T.color.note.fill} /><circle cx={130} cy={50} r={9} fill={T.color.right.fill} />
        <Spark x={560} y={90} s={40} /><Spark x={-10} y={480} s={28} c={P.fill} />
      </g>
    ),
  }
);

const MarkD = (): MarkDef => {
  const r = 120, rx = 1.2247 * r, ry = 0.7071 * r, h = 190;
  const cy = 0; // 杯口橢圓中心
  const body = `M ${-rx} ${cy} L ${-rx} ${cy + h} A ${rx} ${ry} 0 0 0 ${rx} ${cy + h} L ${rx} ${cy} Z`;
  return {
    vb: [-330, -620, 760, 900],
    el: (
      <g>
        <defs>
          <clipPath id="dR"><rect x={-20} y={-300} width={400} height={900} /></clipPath>
          <filter id="dGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation={8} /></filter>
        </defs>
        {/* 桌面圓台 */}
        <ellipse cx={0} cy={h + 40} rx={rx + 130} ry={ry + 75} fill={T.floor} opacity={0.1} />
        <ellipse cx={0} cy={h + 48 + 22} rx={rx + 120} ry={ry + 70} fill={S.desk.r} />
        <ellipse cx={0} cy={h + 48} rx={rx + 120} ry={ry + 70} fill={S.desk.top} />
        {/* 杯把 */}
        <path d={`M ${rx - 6} ${cy + 50} C ${rx + 120} ${cy + 20}, ${rx + 130} ${cy + 150}, ${rx - 10} ${cy + 150}`} fill="none" stroke={S.white.r} strokeWidth={30} strokeLinecap="round" />
        <path d={`M ${rx - 6} ${cy + 50} C ${rx + 120} ${cy + 20}, ${rx + 130} ${cy + 150}, ${rx - 10} ${cy + 150}`} fill="none" stroke={S.white.l} strokeWidth={20} strokeLinecap="round" />
        {/* 杯身：左亮右暗 */}
        <path d={body} fill={S.white.l} />
        <g clipPath="url(#dR)"><path d={body} fill={S.white.r} /></g>
        <ellipse cx={0} cy={cy} rx={rx} ry={ry} fill={S.white.top} />
        <ellipse cx={0} cy={cy} rx={rx - 16} ry={ry - 9} fill={COFFEE.top} />
        <ellipse cx={-30} cy={cy - 4} rx={30} ry={9} fill="#FFFFFF" opacity={0.28} />
        {/* AI：發光 */}
        <g transform={`translate(-8 ${cy + h * 0.6})`}>
          <text x={0} y={0} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={104} fill={P.fill} filter="url(#dGlow)" opacity={0.85}>AI</text>
          <text x={0} y={0} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={104} fill={P.fill}>AI</text>
        </g>
        {/* 蒸氣＝電路走線，接到浮起來的 AI 晶片 */}
        {[[-60, 0, [-60, -80, -100, -80], P.fill], [0, 0, [0, -140], T.color.sky.fill], [60, 0, [60, -60, 100, -60, 100, -170], T.color.plum.fill]].map(([x0, , pts, c], i) => {
          const a = pts as number[], d = [`M ${x0} ${cy - 8}`]; for (let k = 0; k < a.length; k += 2) d.push(`L ${a[k]} ${cy - 10 - 0 + (a[k + 1] as number) - 70 * 0}`);
          return <g key={i}><path d={d.join(" ")} fill="none" stroke={c as string} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" transform="translate(0 -6)" /><circle cx={a[a.length - 2]} cy={cy - 10 + a[a.length - 1] - 6} r={11} fill={T.card} stroke={c as string} strokeWidth={6} /></g>;
        })}
        {/* 浮起來的晶片 */}
        <g transform="translate(160 -330)">
          <ellipse cx={0} cy={86} rx={70} ry={20} fill={T.floor} opacity={0.12} />
          <circle r={96} fill="none" stroke={P.fill} strokeWidth={4} opacity={0.25} /><circle r={118} fill="none" stroke={P.fill} strokeWidth={3} opacity={0.14} />
          <rect x={-72} y={-50} width={144} height={110} rx={26} fill={P.side} /><rect x={-72} y={-62} width={144} height={110} rx={26} fill={P.fill} />
          {[-40, 0, 40].map((x) => <rect key={x} x={x - 6} y={-80} width={12} height={20} rx={4} fill={P.soft} />)}
          <text x={0} y={-2} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={64} fill="#FFFFFF">AI</text>
        </g>
        <path d={`M 100 -176 L 100 -230`} stroke={P.fill} strokeWidth={6} strokeDasharray="2 14" strokeLinecap="round" />
        <Spark x={-180} y={-200} s={36} /><Spark x={-250} y={-60} s={24} c={P.fill} />
      </g>
    ),
  };
};

const RAW: Record<string, () => MarkDef> = { A: MarkA, B: MarkB, C: MarkC, D: MarkD };
/** 圖形外框（viewBox）由 scripts/caffaine/logo-stills.mjs --probe 量出來寫進 caffLogoVb.json；沒量過用各款的預設值 */
const MARKS: Record<string, () => MarkDef> = Object.fromEntries(Object.entries(RAW).map(([k, f]) => [k, () => { const m = f(); const v = (VB as any)[k]; return v ? { ...m, vb: v as [number, number, number, number] } : m; }]));
export const RAW_MARKS = RAW;
export const VARIANT_NAMES: Record<string, string> = { A: "體素杯", B: "螢幕裡的杯", C: "白卡像素杯", D: "馬克杯＋AI 晶片" };

// ───────── 字標、橫式組合 ─────────
/** 字標：CaffAIne，AI 兩個字放在長春花藍色塊上，最突出；回傳寬度（字寬 0.6em） */
export const wordWidth = (px: number) => 8 * 0.6 * px;
const Wordmark: React.FC<{ x: number; y: number; px: number }> = ({ x, y, px }) => (
  <g>
    <rect x={x + 4 * 0.6 * px - px * 0.06} y={y - px * 0.86} width={1.2 * px + px * 0.12} height={px * 1.08} rx={px * 0.2} fill={P.side} transform={`translate(0 ${px * 0.07})`} />
    <rect x={x + 4 * 0.6 * px - px * 0.06} y={y - px * 0.86} width={1.2 * px + px * 0.12} height={px * 1.08} rx={px * 0.2} fill={P.fill} />
    <text x={x} y={y} fontFamily={MONO} fontWeight={800} fontSize={px} fill={T.ink}>Caff<tspan fill="#FFFFFF">AI</tspan>ne</text>
  </g>
);
const TAG = "一杯咖啡的時間，看懂一個 AI 新知";

/** 橫式組合：圖形在左、字標在右（高度 markH）；回傳 <g> 與寬度。origin＝左上角 */
const Lockup: React.FC<{ v: string; x: number; y: number; markH: number; wordPx: number; tag?: number }> = ({ v, x, y, markH, wordPx, tag }) => {
  const m = MARKS[v](), k = markH / m.vb[3], mw = m.vb[2] * k, gap = markH * 0.08;
  return (
    <g>
      <svg x={x} y={y} width={mw} height={markH} viewBox={m.vb.join(" ")} style={{ overflow: "visible" }}>{m.el}</svg>
      <Wordmark x={x + mw + gap} y={y + markH / 2 + wordPx * 0.3} px={wordPx} />
      {tag ? <text x={x + mw + gap} y={y + markH / 2 + wordPx * 0.3 + tag * 1.9} fontFamily={FONT_ZH} fontWeight={600} fontSize={tag} fill={T.ink2}>{TAG}</text> : null}
    </g>
  );
};
export const lockupWidth = (v: string, markH: number, wordPx: number) => { const m = MARKS[v](); return (m.vb[2] / m.vb[3]) * markH + markH * 0.08 + wordWidth(wordPx); };

const Bg: React.FC = () => <AbsoluteFill style={{ background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bg2} 100%)` }} />;
const GlowBlobs: React.FC<{ spots: [number, number, string][] }> = ({ spots }) => <>{spots.map(([x, y, c], i) => <div key={i} style={{ position: "absolute", left: x - 330, top: y - 330, width: 660, height: 660, borderRadius: "50%", background: `radial-gradient(closest-side, ${c}, ${c}00)`, opacity: 0.85 }} />)}</>;

export const CaffLogoStill: React.FC<{ variant: string; layout: "square" | "phone" | "probe" }> = ({ variant: v, layout }) => {
  if (layout === "probe") { const m = RAW[v](); return <AbsoluteFill style={{ background: "#fff" }}><svg width={1080} height={1080} viewBox="-900 -900 1800 1800"><rect x={-900} y={-900} width={1800} height={1800} fill="#fff" />{m.el}</svg></AbsoluteFill>; }
  if (layout === "square") {
    // 1080×1080 淺底大圖（畫在 1080×1920 畫布的上面 1080，之後裁切）：橫式組合置中＋標語
    const wordPx = 108, aspect = MARKS[v]().vb[2] / MARKS[v]().vb[3], markH = Math.min(470, (940 - wordWidth(wordPx)) / (aspect + 0.08)), w = lockupWidth(v, markH, wordPx), x0 = (1080 - w) / 2;
    return (
      <AbsoluteFill>
        <Bg /><GlowBlobs spots={[[220, 300, P.soft], [900, 800, T.color.note.soft]]} />
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <Lockup v={v} x={x0} y={540 - markH / 2} markH={markH} wordPx={wordPx} tag={34} />
        </svg>
      </AbsoluteFill>
    );
  }
  // phone：1080×1920 片尾構圖示意（和 short-ai 同一張粉彩桌面）：LOGO 約佔寬 50%
  const m = MARKS[v](), mw = 540, mh = (mw / m.vb[2]) * m.vb[3];
  const my = 560, wp = 86, ww = wordWidth(wp);
  const headH = 88, hw = lockupWidth(v, headH, 44);
  return (
    <AbsoluteFill>
      <Bg /><GlowBlobs spots={[[260, 700, P.soft], [820, 1100, T.color.note.soft]]} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* 同一張桌面（x,y 640 的粉彩桌，比 short-ai 放大、置中偏下），LOGO 立在上面 */}
        <g transform={css([1.2, 0, 0, 1.2, 540, 560])}>
          <Shade x={50} y={50} w={640} h={640} r={56} z={-110} />
          <Slab id="pDesk" x={0} y={0} w={640} h={640} t={40} r={48} c={S.desk} />
        </g>
        {[[-1, 1], [1, 1], [-0.6, -1]].map(([sx], i) => null)}
        <svg x={(1080 - mw) / 2} y={my} width={mw} height={mh} viewBox={m.vb.join(" ")} style={{ overflow: "visible" }}>{m.el}</svg>
        <Wordmark x={(1080 - ww) / 2} y={my + mh + 150} px={wp} />
        <text x={540} y={my + mh + 150 + 80} textAnchor="middle" fontFamily={FONT_ZH} fontWeight={700} fontSize={36} fill={T.ink2}>{TAG}</text>
        <g transform={`translate(0 ${my + mh + 150 + 130})`}>
          <rect x={150} y={8} width={780} height={104} rx={30} fill={T.cardSide} /><rect x={150} y={0} width={780} height={104} rx={30} fill={T.card} />
          <text x={540} y={68} textAnchor="middle" fontFamily={FONT_ZH} fontWeight={800} fontSize={48} fill={T.ink}>留言「<tspan fill={P.text}>Claude</tspan>」拿完整資料</text>
        </g>
        {/* 頁首：小版 LOGO（每幕同位置同大小）＋進度條 */}
        <Lockup v={v} x={L.X} y={214} markH={headH} wordPx={44} />
        <text x={L.W - L.X} y={266} textAnchor="end" fontFamily={FONT_ZH} fontWeight={600} fontSize={30} fill={T.ink3}>看懂一個 AI 新知</text>
        <rect x={L.X} y={304} width={L.INNER_W} height={8} rx={4} fill={T.line} /><rect x={L.X} y={304} width={L.INNER_W} height={8} rx={4} fill={P.fill} />
        <Spark x={150} y={470} s={34} /><Spark x={930} y={1620} s={30} c={P.fill} /><circle cx={960} cy={440} r={14} fill={T.color.right.fill} /><circle cx={110} cy={1560} r={16} fill={T.color.wrong.fill} />
      </svg>
    </AbsoluteFill>
  );
};
