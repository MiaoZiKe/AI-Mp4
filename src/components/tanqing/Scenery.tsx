// 談晴說礙 v5（tanqing.layout: "v5"）：每頁第二層＝情境線稿插畫（放在大標下面的插畫帶，不壓主圖）。
// 兩層景深：遠景（淡線）跟著頁面進度慢慢往左、近景移得比較多（視差）；每張都有不停的小動作（時鐘指針、熱氣、窗燈、公車輪子、日曆翻頁、葉子）。
// 只用頻道的灰線稿＋白／米填色，不放橘色（橘色留給主圖的重點）。全部是固定函式，沒有隨機。
import React from "react";
import { THEME_TANQING as T } from "../../theme";

const VW = 888, VH = 220, G = 206; // 視窗座標、地面線
const S = { fill: "none", stroke: T.line, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const H = { fill: "none", stroke: T.hair, strokeWidth: 2, strokeLinecap: "round" as const };
const lit = (k: number, f: number) => ((k * 7 + Math.floor(f / 26 + k * 0.37)) % 5) < 2; // 窗燈慢慢輪流亮（固定公式）

const Skyline: React.FC<{ y?: number }> = ({ y = G }) => (
  <g>{[[20, 60, 70], [90, 46, 110], [146, 70, 84], [236, 50, 128], [300, 80, 76], [520, 60, 96], [592, 44, 140], [648, 74, 88], [740, 56, 118], [806, 70, 80]].map(([x, w, h], k) => <rect key={k} x={x} y={y - h} width={w} height={h} rx={6} {...H} />)}</g>
);
const Clock: React.FC<{ x: number; y: number; r: number; f: number }> = ({ x, y, r, f }) => {
  const m = (f * 6) % 360, h = (f * 0.5) % 360;
  return (
    <g>
      <circle cx={x} cy={y} r={r} {...S} fill={T.fill} />
      <line x1={x} y1={y} x2={x} y2={y - r * 0.72} {...S} transform={`rotate(${m.toFixed(1)} ${x} ${y})`} />
      <line x1={x} y1={y} x2={x} y2={y - r * 0.46} {...S} strokeWidth={4} transform={`rotate(${h.toFixed(1)} ${x} ${y})`} />
    </g>
  );
};
const Steam: React.FC<{ x: number; y: number; f: number; n?: number }> = ({ x, y, f, n = 2 }) => (
  <g>{Array.from({ length: n }, (_, k) => { const d = Math.sin(f / 14 + k * 2) * 5, ph = ((f / 40 + k * 0.5) % 1); return <path key={k} d={`M ${x + k * 16} ${y} c ${-8 + d} -10, ${8 - d} -18, 0 -28 s ${-6 + d} -16, 2 -26`} {...H} strokeWidth={3} opacity={(0.5 + 0.5 * Math.sin(ph * Math.PI)).toFixed(2)} />; })}</g>
);

const Desk: React.FC<{ f: number; near: number }> = ({ f, near }) => (
  <g transform={`translate(${near} 0)`}>
    <line x1={60} y1={G - 70} x2={760} y2={G - 70} {...S} />
    <path d={`M 100 ${G - 70} V ${G} M 720 ${G - 70} V ${G}`} {...S} />
    <rect x={300} y={G - 170} width={190} height={100} rx={10} {...S} fill={T.fill} />
    <path d={`M 270 ${G - 70} L 300 ${G - 80} H 490 L 520 ${G - 70}`} {...S} />
    {[0, 1, 2].map((k) => <line key={k} x1={324} y1={G - 146 + k * 22} x2={324 + (k === 2 ? 60 + 40 * Math.abs(Math.sin(f / 20)) : 130 - k * 30)} y2={G - 146 + k * 22} {...H} strokeWidth={4} />)}
    {Math.floor(f / 15) % 2 ? <rect x={330 + 60 + 40 * Math.abs(Math.sin(f / 20)) + 4} y={G - 108} width={4} height={18} fill={T.line} /> : null}
    <path d={`M 590 ${G - 70} V ${G - 150} L 640 ${G - 178}`} {...S} />
    <path d={`M 622 ${G - 190} l 44 14 l -14 30 z`} {...S} fill={T.fillB} transform={`rotate(${(Math.sin(f / 40) * 2).toFixed(2)} 640 ${G - 178})`} />
    <rect x={180} y={G - 112} width={44} height={42} rx={8} {...S} fill={T.fillB} />
    <Steam x={192} y={G - 120} f={f} />
    <Clock x={800} y={60} r={34} f={f} />
  </g>
);
const City: React.FC<{ f: number; near: number }> = ({ f, near }) => (
  <g transform={`translate(${near} 0)`}>
    {[[60, 110, 150], [190, 80, 110], [290, 120, 176], [440, 90, 130], [560, 130, 160], [720, 100, 120]].map(([x, w, h], k) => (
      <g key={k}>
        <rect x={x} y={G - h} width={w} height={h} rx={8} {...S} fill={k % 2 ? T.fillB : T.fill} />
        {Array.from({ length: Math.floor((h - 30) / 30) * 2 }, (_, j) => <rect key={j} x={x + 18 + (j % 2) * (w - 54)} y={G - h + 20 + Math.floor(j / 2) * 30} width={18} height={14} rx={3} fill={lit(k * 9 + j, f) ? T.dot : T.hair} />)}
      </g>
    ))}
  </g>
);
const Commute: React.FC<{ f: number; near: number }> = ({ f, near }) => {
  const bx = 900 - ((f * 2.2) % 1200); // 公車由右往左開過去（循環）
  const wheel = (cx: number) => (<g><circle cx={cx} cy={G - 16} r={16} {...S} fill={T.fill} /><line x1={cx} y1={G - 16} x2={cx + 12} y2={G - 16} {...S} strokeWidth={2} transform={`rotate(${(-f * 9) % 360} ${cx} ${G - 16})`} /></g>);
  return (
    <g>
      <g transform={`translate(${near} 0)`}>
        <path d={`M 640 ${G} V ${G - 150}`} {...S} />
        <rect x={610} y={G - 190} width={60} height={44} rx={10} {...S} fill={T.fill} />
        <line x1={622} y1={G - 168} x2={658} y2={G - 168} {...H} strokeWidth={4} />
      </g>
      <g transform={`translate(${bx.toFixed(1)} ${(Math.sin(f / 4) * 1.2).toFixed(2)})`}>
        <rect x={0} y={G - 120} width={250} height={92} rx={22} {...S} fill={T.fill} />
        {[0, 1, 2, 3].map((k) => <rect key={k} x={20 + k * 54} y={G - 104} width={40} height={34} rx={6} {...S} fill={T.fillB} strokeWidth={2} />)}
        {wheel(56)}{wheel(196)}
        {[0, 1, 2].map((k) => <line key={k} x1={262 + k * 8} y1={G - 90 + k * 22} x2={300 + k * 14} y2={G - 90 + k * 22} {...H} />)}
      </g>
    </g>
  );
};
const Calendar: React.FC<{ f: number; near: number }> = ({ f, near }) => {
  const ph = (f % 48) / 48, lift = ph < 0.4 ? Math.sin((ph / 0.4) * Math.PI) : 0; // 每 1.6 秒翻一頁
  return (
    <g transform={`translate(${near} 0)`}>
      <line x1={60} y1={G} x2={828} y2={G} {...S} />
      <rect x={330} y={14} width={230} height={186} rx={14} {...S} fill={T.fill} />
      <rect x={330} y={14} width={230} height={44} rx={14} {...S} fill={T.fillB} />
      {Array.from({ length: 15 }, (_, k) => <rect key={k} x={350 + (k % 5) * 40} y={76 + Math.floor(k / 5) * 38} width={28} height={24} rx={5} {...H} />)}
      <path d={`M 330 58 H 560 V ${200 - 120 * lift} Q 445 ${200 - 150 * lift} 330 ${200 - 120 * lift} Z`} {...S} fill={T.fill} opacity={lift > 0 ? 1 : 0} />
      <Clock x={170} y={110} r={50} f={f} />
      <rect x={680} y={G - 76} width={60} height={76} rx={10} {...S} fill={T.fillB} />
      {[-1, 1].map((s, k) => <path key={k} d={`M 710 ${G - 76} q ${s * 30} -40 ${s * 8} -80`} {...S} transform={`rotate(${(Math.sin(f / 22 + k) * 4).toFixed(2)} 710 ${G - 76})`} />)}
    </g>
  );
};
const Home: React.FC<{ f: number; near: number }> = ({ f, near }) => (
  <g transform={`translate(${near} 0)`}>
    <line x1={60} y1={G} x2={828} y2={G} {...S} />
    <path d={`M 160 ${G - 40} V ${G - 110} q 0 -20 20 -20 H 420 q 20 0 20 20 V ${G - 40} Z`} {...S} fill={T.fillB} />
    <rect x={130} y={G - 70} width={340} height={50} rx={16} {...S} fill={T.fill} />
    <path d={`M 160 ${G - 20} V ${G} M 440 ${G - 20} V ${G}`} {...S} />
    <rect x={560} y={G - 60} width={150} height={12} rx={6} {...S} fill={T.fill} />
    <path d={`M 580 ${G - 48} V ${G} M 690 ${G - 48} V ${G}`} {...S} />
    <rect x={606} y={G - 92} width={30} height={30} rx={6} {...S} fill={T.fill} />
    <circle cx={636} cy={G - 92} r={6} fill={T.line} opacity={(0.35 + 0.65 * Math.abs(Math.sin(f / 18))).toFixed(2)} />
    <path d={`M 770 ${G} V ${G - 150} M 740 ${G - 150} h 60 l -12 -36 h -36 z`} {...S} fill={T.fill} />
    <rect x={540} y={20} width={150} height={110} rx={12} {...S} fill={T.fill} />
    <path d={`M 615 20 V 130 M 540 75 H 690`} {...H} />
    <circle cx={660} cy={46} r={12} {...H} strokeWidth={3} opacity={(0.6 + 0.4 * Math.sin(f / 30)).toFixed(2)} />
  </g>
);
const Cafe: React.FC<{ f: number; near: number }> = ({ f, near }) => (
  <g transform={`translate(${near} 0)`}>
    <line x1={60} y1={G} x2={828} y2={G} {...S} />
    <ellipse cx={444} cy={G - 80} rx={200} ry={14} {...S} fill={T.fill} />
    <path d={`M 444 ${G - 66} V ${G} M 400 ${G} H 488`} {...S} />
    <path d={`M 340 ${G - 94} h 60 v 10 q 0 10 -10 10 h -40 q -10 0 -10 -10 z`} {...S} fill={T.fillB} />
    <Steam x={356} y={G - 102} f={f} />
    <rect x={460} y={G - 116} width={110} height={30} rx={8} {...S} fill={T.fill} />
    <line x1={515} y1={G - 116} x2={515} y2={G - 86} {...H} />
    <rect x={150} y={G - 60} width={50} height={60} rx={8} {...S} fill={T.fillB} />
    {[-1, 0, 1].map((s, k) => <path key={k} d={`M 175 ${G - 60} q ${s * 34} -36 ${s * 10} -86`} {...S} transform={`rotate(${(Math.sin(f / 24 + k) * 3).toFixed(2)} 175 ${G - 60})`} />)}
    <Clock x={760} y={80} r={40} f={f} />
  </g>
);

const SCENES: Record<string, React.FC<{ f: number; near: number }>> = { desk: Desk, city: City, commute: Commute, calendar: Calendar, home: Home, cafe: Cafe };
export const SCENERY_TYPES = Object.keys(SCENES);

/** 情境插畫帶：w×h 的區域；q＝頁面進度 0–1（視差）；p＝出場進度（遠景先淡淡畫上，近景從下面彈上來） */
export const Scenery: React.FC<{ type?: string; f: number; q: number; p: number; w: number; h: number; back: (p: number) => number }> = ({ type, f, q, p, w, h, back }) => {
  const C = type ? SCENES[type] : undefined;
  if (!C || h < 60 || p <= 0) return null;
  const far = -14 * q, near = 10 - 34 * q;
  const rise = back(Math.min(1, p));
  return (
    <svg width={w} height={h} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMax meet" style={{ position: "absolute", left: 0, top: 0, overflow: "hidden" }}>
      <g transform={`translate(${far.toFixed(1)} 0)`} opacity={Math.min(1, p * 1.4).toFixed(2)}><Skyline y={G - 4} /></g>
      <g transform={`translate(0 ${(40 * (1 - rise)).toFixed(1)})`}><C f={f} near={near} /></g>
      <line x1={0} y1={G + 2} x2={VW} y2={G + 2} stroke={T.hair} strokeWidth={2} />
    </svg>
  );
};
