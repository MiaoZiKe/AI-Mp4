// 2026/11/18 tech-icdesign：IC 設計的 2D 畫面。
//   縮放圖（HudArt.tsx 的 Art 轉過來）：ic-die 整顆晶片的功能區塊｜ic-blk 一個區塊裡的標準元件（密度示意）｜ic-rows 標準元件一行一行（正中央是一顆反相器）｜ic-cell 反相器的俯視（和 model.json 的站 S 同一份座標，交棒給 3D）
//   對照卡（overlay `section` 的 kind 以 "ic-" 開頭，Hud.tsx 的 HudSection 轉過來）：ic-sec 側面剖面（訊號一層一層穿過去）｜ic-flow 設計流程｜ic-mask 光罩 4 倍大 vs 晶圓上｜ic-who 台灣誰在做｜ic-next 下一支
// 全部示意；顏色資料色票和 videos/tech-icdesign/genmodel.py 的 palette 一致（金屬層分色是資料，不是主題色）；時間來自 script.json 的 t（cue）。
import React from "react";
import { FONT_ZH } from "../../theme";
import { H, L, sm, CARD_HEAD, CARD_CONTENT_TOP, cardTitleBox } from "./hudSkin";
import { EASE, tween } from "../anim";
import type { Model3D, Overlay3D } from "./engine";

const zh = (px: number, color: string = H.text, w = 800): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, color, fontWeight: w, whiteSpace: "nowrap" });
const mono = (px: number, color: string = H.text2, w = 600): React.CSSProperties => ({ fontFamily: `${H.font.mono}, ${FONT_ZH}`, fontSize: px, fill: color, color, fontWeight: w, letterSpacing: "0.06em", whiteSpace: "nowrap" });
const onC = (bg: string) => (bg === H.amber ? ((H as any).onAmber ?? H.onAccent) : H.onAccent);
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const lin = (f: number, a: number, d: number) => Math.max(0, Math.min(1, (f - a) / Math.max(1, d)));
const rnd = (s: number) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** 資料色票（和 genmodel.py 的 palette 一致） */
export const IC = {
  si: "#B8C2D6", sti: "#E2E8F2", nSi: "#7FB6E8", pSi: "#EDA0B5", nSD: "#2F7FE0", pSD: "#E0536F", gate: "#F2A93B", ct: "#D5DCE8",
  m1: "#F08A24", m2: "#E8613C", m3: "#8A5CE0", m4: "#2A9D8F", m5: "#2F6FE0",
  cpu: "#3F6FD8", cpu2: "#6B93EA", npu: "#7A5CE0", npu2: "#A58CF2", mem: "#2A9D8F", mem2: "#4CBDAE", io: "#F2A93B", io2: "#F6C46B", chrome: "#1E2433",
};
const METALS: [string, string, string][] = [["M5", IC.m5, "m5"], ["M4", IC.m4, "m4"], ["M3", IC.m3, "m3"], ["M2", IC.m2, "m2"], ["M1", IC.m1, "m1"]];
/** 光罩上的圖案（中心座標 -1…1 的方塊；和 genmodel.py 的 PAT 一致） */
export const PAT: [number, number, number, number][] = [[-.55, -.55, .7, .7], [.45, -.6, .9, .4], [.4, .1, .5, .9], [-.5, .35, .9, .3], [-.1, 0, .25, .25], [.1, -.1, .1, .5], [-.8, .05, .3, .1], [.78, -.85, .3, .1]];

// ───────────────────────── 縮放圖 ─────────────────────────
// 站 S 的平面（x 右、z 下；單位＝model 單位）：每筆 [中心 x, 中心 z, 寬, 深]
const R4 = (list: number[][], c: string, key?: string) => list.map(([x, z, w, d], i) => <rect key={`${key ?? c}${i}`} x={x - w / 2} y={z - d / 2} width={w} height={d} fill={c} />);
const CellArt: React.FC = () => {
  const u = 1000 / 37.5;
  return (
    <g transform={`scale(${u})`}>
      <rect x={-17} y={-9} width={34} height={18} rx={0.5} fill={IC.si} />
      {R4([[0, 0, 34, 4.6], [0, -7.4, 34, 3.2], [0, 7.4, 34, 3.2]], IC.sti, "sti")}
      {R4([[0, -4, 34, 3.4]], IC.pSi, "p")}{R4([[0, 4, 34, 3.4]], IC.nSi, "n")}
      {R4([[-4.5, -4, 5.2, 3.6], [4.5, -4, 5.2, 3.6], [-14.2, -4, 3.6, 3.6], [14.2, -4, 3.6, 3.6]], IC.pSD, "ps")}
      {R4([[-4.5, 4, 5.2, 3.6], [4.5, 4, 5.2, 3.6], [-14.2, 4, 3.6, 3.6], [14.2, 4, 3.6, 3.6]], IC.nSD, "ns")}
      {R4([[-9, 0, 1.6, 14.4], [0, 0, 1.6, 14.4], [9, 0, 1.6, 14.4]], IC.gate, "g")}
      {[[-4.5, -4], [-4.5, 4], [4.5, -4], [4.5, 4], [0, 0]].map(([x, z], i) => <circle key={`c${i}`} cx={x} cy={z} r={0.55} fill={IC.ct} />)}
      {/* M1 */}
      {R4([[0, -8, 34, 1.6], [0, 8, 34, 1.6], [-4.5, -6, 1.6, 4], [-4.5, 6, 1.6, 4], [4.5, 0, 1.6, 8.8], [6.25, 0, 3.9, 1.4], [-1.5, 0, 3.9, 1.4]], IC.m1, "m1")}
      {/* M2 */}
      {R4([[-3, 2.15, 1.4, 5.8], [8, -2.15, 1.4, 5.8], [-8, 0, 1.4, 16], [12, 0, 1.4, 16], [-15, 0, 1.4, 16]], IC.m2, "m2")}
      {/* M3 */}
      {R4([[-7.5, 5, 10.4, 1.4], [11, -5, 7.4, 1.4], [-11.5, 0, 11, 1.4], [0, -8, 11, 1.4], [0, 8, 11, 1.4], [13.5, 2.5, 7, 1.4]], IC.m3, "m3")}
      {/* M4 */}
      {R4([[-12, 0, 1.4, 11.4], [14, 0, 1.4, 11.4], [-6, 0, 1.4, 16], [3, 0, 1.4, 16]], IC.m4, "m4")}
      {/* M5 */}
      {R4([[-14, -5, 6, 2], [15, 5, 4, 2], [0, 0, 34, 2]], IC.m5, "m5")}
    </g>
  );
};

/** 小格陣列（SRAM、運算單元、快取）：用 pattern 鋪，一格 cw×ch、間隙 g；inner＝格子裡再畫一個小方塊（運算單元的乘加器） */
const Grid: React.FC<{ id: string; x: number; y: number; w: number; h: number; cw: number; ch: number; g?: number; c: string; o?: number; inner?: string }> = ({ id, x, y, w, h, cw, ch, g = 1.5, c, o = 1, inner }) => (
  <g>
    <defs><pattern id={id} x={x} y={y} width={cw} height={ch} patternUnits="userSpaceOnUse">
      <rect width={cw - g} height={ch - g} fill={c} opacity={o} />{inner ? <rect x={cw * 0.28} y={ch * 0.28} width={cw * 0.4} height={ch * 0.4} fill={inner} opacity={0.55} /> : null}
    </pattern></defs>
    <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
  </g>
);
const WIRE = [IC.m1, IC.m2, IC.m3, IC.m4, IC.m5];
/** CPU 核心：取指解碼條、三個運算單元、暫存器格 */
const Core: React.FC<{ id: string; x: number; y: number; w: number; h: number }> = ({ id, x, y, w, h }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={4} fill={IC.cpu2} stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={2} />
    <rect x={x + 6} y={y + 6} width={w - 12} height={h * 0.2} fill={IC.cpu} />
    {range(3).map((i) => <rect key={i} x={x + 6 + i * ((w - 12) / 3)} y={y + h * 0.3} width={(w - 12) / 3 - 4} height={h * 0.26} fill="#C9D8FA" stroke={IC.cpu} strokeWidth={1.5} />)}
    <Grid id={id} x={x + 6} y={y + h * 0.62} w={w - 12} h={h * 0.32} cw={8} ch={6} c="#2A4FB0" />
  </g>
);
/** 整顆晶片：密封環＋四周焊墊、四個功能區塊（各有自己的內部樣子）、標準元件列細紋、多方向多色金屬走線、粗的供電網格；正中央是下一級（一個區塊，寬 40＝field 比例） */
const DieArt: React.FC = () => {
  const pads = range(30), L = 29;
  const blk = (x: number, y: number, w: number, h: number, c: string, t: string) => (
    <g key={t}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={c} stroke={H.line} strokeOpacity={0.6} strokeWidth={3} />
      <text x={x + 16} y={y + 40} style={mono(32, "#FFFFFF", 800)}>{t}</text>
    </g>
  );
  return (
    <g>
      <g transform="scale(0.7)">
        <defs>
          <pattern id="icSc" x={-430} y={-430} width={12} height={6} patternUnits="userSpaceOnUse"><rect width={12} height={6} fill={H.bg2} /><rect y={0} width={12} height={1.6} fill={H.lineSoft} opacity={0.9} /><rect x={3} y={2} width={2} height={3} fill={H.lineSoft} opacity={0.6} /></pattern>
        </defs>
        {/* 晶粒外框與密封環 */}
        <rect x={-470} y={-470} width={940} height={940} rx={18} fill={H.bg2} stroke={H.line} strokeWidth={6} />
        <rect x={-452} y={-452} width={904} height={904} rx={10} fill="none" stroke={IC.ct} strokeWidth={9} /><rect x={-452} y={-452} width={904} height={904} rx={10} fill="none" stroke={H.line} strokeWidth={1.5} strokeOpacity={0.8} />
        <rect x={-436} y={-436} width={872} height={872} fill="url(#icSc)" />
        {/* 四周焊墊（每邊 30 個）＋焊球與往內的走線 */}
        {pads.map((i) => { const u = -420 + i * 29; return <React.Fragment key={i}>
          {[[u, -462, 0], [u, 442, 1]].map(([x, y, d], k) => <g key={k}><rect x={x} y={y} width={16} height={20} fill={IC.ct} stroke={H.line} strokeWidth={1.2} /><rect x={x + 4} y={y + 5} width={8} height={10} fill={IC.gate} opacity={0.85} /><path d={`M ${x + 8} ${d ? y : y + 20} V ${d ? 412 - (i % 4) * 5 : -412 + (i % 4) * 5}`} stroke={WIRE[i % 5]} strokeWidth={2.2} fill="none" /></g>)}
          {[[-462, u, 0], [442, u, 1]].map(([x, y, d], k) => <g key={k}><rect x={x} y={y} width={20} height={16} fill={IC.ct} stroke={H.line} strokeWidth={1.2} /><rect x={x + 5} y={y + 4} width={10} height={8} fill={IC.gate} opacity={0.85} /><path d={`M ${d ? x : x + 20} ${y + 8} H ${d ? 412 - (i % 4) * 5 : -412 + (i % 4) * 5}`} stroke={WIRE[(i + 2) % 5]} strokeWidth={2.2} fill="none" /></g>)}
        </React.Fragment>; })}
        {/* 區塊之間：多方向、多顏色的金屬走線束（橫、直各五條，轉彎處用 45 度） */}
        {range(5).map((i) => <React.Fragment key={`w${i}`}>
          <path d={`M -400 ${-16 + i * 8} H -60 L -44 ${-16 + i * 8 + (i % 2 ? 6 : -6)} H 44 L 60 ${-16 + i * 8} H 400`} stroke={WIRE[i]} strokeWidth={2.6} fill="none" />
          <path d={`M ${-16 + i * 8} -400 V -60 L ${-16 + i * 8 + (i % 2 ? -6 : 6)} -44 V 44 L ${-16 + i * 8} 60 V 400`} stroke={WIRE[(i + 2) % 5]} strokeWidth={2.6} fill="none" />
        </React.Fragment>)}
        {range(5).map((i) => <React.Fragment key={`r${i}`}>
          <path d={`M ${-410 + i * 4} ${-410 + i * 4} H ${410 - i * 4} V ${410 - i * 4} H ${-410 + i * 4} Z`} stroke={WIRE[i]} strokeWidth={1.8} strokeOpacity={0.9} fill="none" />
        </React.Fragment>)}
        {/* CPU：2×2 核心＋下方二級快取 */}
        {blk(-400, -400, 370, 370, IC.cpu, "CPU")}
        {[[-384, -356], [-206, -356], [-384, -226], [-206, -226]].map(([x, y], i) => <Core key={i} id={`icCore${i}`} x={x} y={y} w={170} h={122} />)}
        <Grid id="icL2" x={-384} y={-96} w={340} h={56} cw={10} ch={8} c={IC.cpu2} />
        {/* NPU：整齊的運算陣列（乘加單元）＋緩衝區 */}
        {blk(30, -400, 370, 370, IC.npu, "NPU")}
        <Grid id="icMac" x={46} y={-356} w={336} h={252} cw={42} ch={42} g={5} c={IC.npu2} inner="#FFFFFF" />
        <Grid id="icBuf" x={46} y={-92} w={336} h={52} cw={14} ch={10} c="#6E55C8" />
        {/* 記憶體（SRAM）：密集小格陣列，分四個子陣列，右側是感測放大器 */}
        {blk(-400, 30, 370, 370, IC.mem, "SRAM")}
        <Grid id="icSram" x={-384} y={78} w={296} h={306} cw={8} ch={6} g={1.2} c={IC.mem2} />
        {[-312, -238, -164].map((x) => <rect key={x} x={x} y={78} width={4} height={306} fill={IC.mem} />)}
        <rect x={-80} y={78} width={42} height={306} fill="#1F7A6F" /><Grid id="icSense" x={-76} y={84} w={34} h={294} cw={12} ch={14} c="#7FE0D0" o={0.8} />
        {/* I/O：介面電路條（手指狀電晶體排）＋上下收發器 */}
        {blk(30, 30, 370, 370, IC.io, "I/O")}
        {range(7).map((i) => <Grid key={i} id={`icIo${i}`} x={46 + i * 48} y={78} w={38} h={250} cw={38} ch={7} g={2.5} c={IC.io2} />)}
        {range(14).map((i) => <rect key={`p${i}`} x={46 + i * 24} y={338} width={18} height={40} fill={i % 2 ? IC.m1 : IC.m2} opacity={0.8} />)}
        {/* 粗的供電網格（電源帶，紅藍交替） */}
        {[-350, -230, -110, 110, 230, 350].map((x, i) => <rect key={`gv${x}`} x={x - 4} y={-436} width={8} height={872} fill={i % 2 ? IC.m5 : IC.m2} opacity={0.4} />)}
        {[-350, -230, -110, 110, 230, 350].map((y, i) => <rect key={`gh${y}`} x={-436} y={y - 4} width={872} height={8} fill={i % 2 ? IC.m5 : IC.m2} opacity={0.35} />)}
      </g>
      <rect x={-20} y={-20} width={40} height={40} fill="none" stroke={H.amber} strokeWidth={3} vectorEffect="non-scaling-stroke" />
    </g>
  );
};

/** 一個區塊裡的標準元件（密度示意）：一整片一行一行的小方塊，上下各有電源軌；正中央是下一級的一小塊 */
const BlkArt: React.FC = () => (
  <g>
    <defs>
      <pattern id="icBlk" x={-500} y={-500} width={150} height={40} patternUnits="userSpaceOnUse">
        <rect width={150} height={40} fill={H.bg2} />
        {[[0, 36], [36, 52], [88, 28], [116, 34]].map(([x, w], i) => <rect key={`a${i}`} x={x + 1} y={3} width={w - 2} height={14} fill={[IC.cpu2, IC.npu2, IC.mem2, IC.io2][i]} opacity={0.75} />)}
        {[[0, 52], [52, 30], [82, 40], [122, 28]].map(([x, w], i) => <rect key={`b${i}`} x={x + 1} y={23} width={w - 2} height={14} fill={[IC.mem2, IC.io2, IC.cpu2, IC.npu2][i]} opacity={0.75} />)}
        <rect x={0} y={-1} width={150} height={3} fill={IC.m1} opacity={0.9} /><rect x={0} y={19} width={150} height={2} fill={IC.m1} opacity={0.5} /><rect x={0} y={39} width={150} height={3} fill={IC.m2} opacity={0.9} />
      </pattern>
    </defs>
    <rect x={-500} y={-500} width={1000} height={1000} fill="url(#icBlk)" />
    <rect x={-500} y={-500} width={1000} height={1000} fill="none" stroke={H.line} strokeWidth={8} />
    <rect x={-8} y={-5} width={16} height={10} fill="none" stroke={H.amber} strokeWidth={3} vectorEffect="non-scaling-stroke" />
  </g>
);

/** 標準元件一行一行：每行高 32、寬度是 30 的倍數；正中央（-30…30）是一顆反相器（下一級） */
const RowsArt: React.FC = () => {
  const rows = range(31).map((r) => r - 15);
  const tones = [IC.cpu2, IC.npu2, IC.mem2, IC.io2, "#BBD3F8"];
  const cells = (r: number) => {
    const out: { x: number; w: number; t: number }[] = [];
    const wid = (i: number) => [60, 90, 120, 60, 150][Math.floor(rnd(r * 31 + i) * 5)];
    if (r === 0) {
      let x = -30, i = 0; while (x > -500) { const w = wid(i++); out.push({ x: x - w, w, t: i }); x -= w; }
      x = 30; i = 20; while (x < 500) { const w = wid(i++); out.push({ x, w, t: i }); x += w; }
    } else { let x = -500 - Math.floor(rnd(r) * 4) * 30, i = 0; while (x < 500) { const w = wid(i++); out.push({ x, w, t: i + r }); x += w; } }
    return out;
  };
  return (
    <g>
      <rect x={-500} y={-500} width={1000} height={1000} fill={H.bg2} />
      {rows.map((r) => (
        <g key={r} transform={`translate(0 ${r * 32 - 16})`}>
          {cells(r).map((c, i) => (
            <g key={i}>
              <rect x={c.x + 1.5} y={1} width={c.w - 3} height={30} rx={2} fill={tones[c.t % 5]} opacity={0.8} stroke={H.lineSoft} strokeWidth={1} />
              {range(Math.floor(c.w / 30)).map((j) => <rect key={j} x={c.x + 14 + j * 30} y={4} width={3} height={24} fill={IC.gate} opacity={0.85} />)}
              <rect x={c.x + 3} y={14} width={c.w - 6} height={3} fill={IC.m1} opacity={0.7} />
            </g>
          ))}
          <rect x={-500} y={-1} width={1000} height={3.5} fill={r % 2 ? IC.pSD : IC.nSD} opacity={0.8} /><rect x={-500} y={29.5} width={1000} height={3.5} fill={r % 2 ? IC.nSD : IC.pSD} opacity={0.8} />
        </g>
      ))}
      <rect x={-30} y={-16} width={60} height={32} fill={IC.si} />
      <g transform={`scale(${60 / 906})`}><CellArt /></g>
      <rect x={-30} y={-16} width={60} height={32} fill="none" stroke={H.amber} strokeWidth={3} vectorEffect="non-scaling-stroke" />
    </g>
  );
};

export const IcArt: React.FC<{ kind: string }> = ({ kind }) => {
  if (kind === "ic-die") return <DieArt />;
  if (kind === "ic-blk") return <BlkArt />;
  if (kind === "ic-rows") return <RowsArt />;
  return <CellArt />;
};

// ───────────────────────── 對照卡 ─────────────────────────
type P = { o: Overlay3D; f: number; k: number; m: Model3D };
const T = (o: Overlay3D, n: string) => ((o as any).t?.[n]?.at ?? o.at) as number;
const Card: React.FC<{ o: Overlay3D; k: number; W: number; Hh: number; children: React.ReactNode }> = ({ o, k, W, Hh, children }) => (
  <div style={{ position: "absolute", left: o.x ?? L.X, top: o.y ?? 900, width: W, height: Hh, opacity: k, background: H.cardCompare, border: `2px solid ${H.lineSoft}`, boxSizing: "border-box", overflow: "hidden" }}>
    {o.title ? <div style={{ ...zh(CARD_HEAD.px, onC(H.line), 800), ...cardTitleBox(), background: H.line, zIndex: 2 }}>{o.title}</div> : null}
    {o.tag ? <div style={{ position: "absolute", right: 16, top: 14, ...zh(sm(30), H.text2, 600), zIndex: 2 }}>{o.tag}</div> : null}
    {children}
  </div>
);

// ── ic-sec：側面剖面，訊號從最上層一層一層穿到電晶體，再從汲極往上流出去（t：top 最上層｜lay 一層一層｜tr 電晶體｜out 流出去）──
const ROWY: Record<string, number> = { m5: 102, m4: 136, m3: 170, m2: 204, m1: 238, dev: 278, sub: 318 };
type Seg = { x: number; y: number };
const PATH_IN: Seg[] = [{ x: 150, y: ROWY.m5 }, { x: 250, y: ROWY.m5 }, { x: 250, y: ROWY.m4 }, { x: 330, y: ROWY.m4 }, { x: 330, y: ROWY.m3 }, { x: 410, y: ROWY.m3 }, { x: 410, y: ROWY.m2 }, { x: 470, y: ROWY.m2 }, { x: 470, y: ROWY.m1 }, { x: 520, y: ROWY.m1 }, { x: 520, y: 260 }];
const PATH_OUT: Seg[] = [{ x: 640, y: 260 }, { x: 640, y: ROWY.m1 }, { x: 690, y: ROWY.m1 }, { x: 690, y: ROWY.m2 }, { x: 750, y: ROWY.m2 }, { x: 750, y: ROWY.m3 }, { x: 810, y: ROWY.m3 }, { x: 810, y: ROWY.m4 }, { x: 860, y: ROWY.m4 }, { x: 860, y: ROWY.m5 }, { x: 920, y: ROWY.m5 }];
const along = (p: Seg[], u: number) => {
  const len = p.slice(1).map((q, i) => Math.hypot(q.x - p[i].x, q.y - p[i].y)), tot = len.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, u)) * tot;
  for (let i = 0; i < len.length; i++) { if (d <= len[i] || i === len.length - 1) { const t = len[i] ? d / len[i] : 0; return { x: p[i].x + (p[i + 1].x - p[i].x) * t, y: p[i].y + (p[i + 1].y - p[i].y) * t }; } d -= len[i]; }
  return p[0];
};
const Sec: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 340;
  const tTop = T(o, "top"), tTr = T(o, "tr"), tOut = T(o, "out");
  const pin = lin(f, tTop, Math.max(20, tTr - tTop)), pout = lin(f, tOut, 54);
  const showIn = f >= tTop - 4, flash = Math.max(0, 1 - Math.abs(f - tTr - 6) / 14);
  const dot = (pp: Seg[], u: number, key: string) => {
    const tr = [0, 0.03, 0.06].map((d) => along(pp, u - d)); const q = tr[0];
    return <g key={key}>{[2, 1].map((i) => <circle key={i} cx={tr[i].x} cy={tr[i].y} r={9 - i * 2.4} fill="#38B6FF" opacity={0.55 - i * 0.18} />)}<circle cx={q.x} cy={q.y} r={13} fill="#1F6FEB" opacity={0.45} /><circle cx={q.x} cy={q.y} r={8} fill="#FFFFFF" /></g>;
  };
  const wire = (p: Seg[], c: string[]) => p.slice(1).map((q, i) => {
    const a = p[i], horiz = a.y === q.y, rowKey = horiz ? Object.entries(ROWY).find(([, y]) => y === a.y)?.[0] : null;
    return <line key={i} x1={a.x} y1={a.y} x2={q.x} y2={q.y} stroke={horiz ? (c[METALS.findIndex((m) => m[2] === rowKey)] ?? IC.m1) : IC.ct} strokeWidth={horiz ? 14 : 8} strokeLinecap="butt" />;
  });
  const cols = METALS.map((m) => m[1]);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {METALS.map(([n, c, key]) => <g key={n}><text x={22} y={ROWY[key] + 10} style={mono(30, c, 800)}>{n}</text><line x1={124} x2={W - 24} y1={ROWY[key]} y2={ROWY[key]} stroke={H.lineSoft} strokeWidth={1.5} strokeDasharray="4 8" /></g>)}
        <text x={22} y={ROWY.dev + 10} style={zh(30, H.text2, 800)}>電晶體</text><text x={22} y={ROWY.sub + 10} style={zh(30, H.text2, 800)}>矽基板</text>
        <rect x={124} y={ROWY.sub - 16} width={W - 148} height={34} fill={IC.si} />
        {/* 電晶體：源極、汲極、閘極 */}
        <rect x={460} y={ROWY.dev - 6} width={70} height={24} fill={IC.nSD} /><rect x={630} y={ROWY.dev - 6} width={70} height={24} fill={IC.nSD} /><rect x={530} y={ROWY.dev + 6} width={100} height={12} fill={IC.nSi} />
        <rect x={562} y={ROWY.dev - 18} width={36} height={32} fill={IC.gate} opacity={0.6 + 0.4 * flash} />
        {flash > 0 ? <circle cx={580} cy={ROWY.dev - 2} r={22 + 30 * (1 - flash)} fill="none" stroke={IC.gate} strokeWidth={5} opacity={flash} /> : null}
        <rect x={510} y={ROWY.dev - 6} width={20} height={4} fill={IC.ct} opacity={0} />
        <g opacity={showIn ? 1 : 0}>{wire(PATH_IN, cols)}{wire(PATH_OUT, cols)}</g>
        <line x1={520} y1={260} x2={580} y2={ROWY.dev - 18} stroke={IC.ct} strokeWidth={6} opacity={showIn ? 1 : 0} /><line x1={640} y1={260} x2={640} y2={ROWY.dev - 4} stroke={IC.ct} strokeWidth={6} opacity={showIn ? 1 : 0} />
        {pin > 0 && pin < 1 ? dot(PATH_IN, pin, "in") : null}
        {pout > 0 && pout < 1 ? dot(PATH_OUT, pout, "out") : null}
        <text x={236} y={ROWY.m5 - 22} style={zh(30, H.line, 800)} opacity={showIn ? 1 : 0}>訊號進來</text>
        <text x={W - 24} y={ROWY.m5 - 22} textAnchor="end" style={zh(30, H.line, 800)} opacity={lin(f, tOut, 6)}>流出去</text>
      </svg>
    </Card>
  );
};

// ── ic-flow：設計流程（t：hand｜spec｜code｜sim｜pr｜wire）──
const Flow: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300;
  const steps: [string, string, string][] = [["規格", "要做什麼", "spec"], ["程式", "描述電路", "code"], ["模擬驗證", "先跑一遍", "sim"], ["排位置", "擺放元件", "pr"], ["接線", "連好線路", "wire"]];
  const cw = 168, gap = 22, x0 = (W - (cw * 5 + gap * 4)) / 2 + 0;
  const hand = tween(f, T(o, "hand"), 8, EASE.enter);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <text x={W - 28} y={104} textAnchor="end" style={zh(sm(34), H.text2, 800)} opacity={hand}>手畫每一條線</text>
        <line x1={W - 290} x2={W - 28} y1={92} y2={92} stroke={H.coral} strokeWidth={6} opacity={hand} /><text x={W - 330} y={106} style={zh(44, H.coral, 900)} opacity={hand}>✕</text>
        {steps.map(([t, s, key], i) => {
          const on = tween(f, T(o, key), 8, EASE.enter), x = x0 + i * (cw + gap), c = i < 2 ? IC.cpu : i === 2 ? IC.mem : IC.io;
          return (
            <g key={key} opacity={0.35 + 0.65 * on}>
              <rect x={x} y={140} width={cw} height={84} rx={10} fill={on > 0.5 ? c : H.bg2} stroke={c} strokeWidth={3} />
              <text x={x + cw / 2} y={194} textAnchor="middle" style={zh(sm(36), on > 0.5 ? (i === 3 || i === 4 ? "#14213D" : "#FFFFFF") : H.text, 900)}>{t}</text>
              <text x={x + cw / 2} y={262} textAnchor="middle" style={zh(sm(30), H.text2, 700)}>{s}</text>
              {i < 4 ? <path d={`M ${x + cw + 3} 182 H ${x + cw + gap - 3} m -8 -9 l 8 9 l -8 9`} fill="none" stroke={H.line} strokeWidth={4} /> : null}
            </g>
          );
        })}
        <text x={28} y={104} style={zh(sm(34), H.text, 800)} opacity={1 - 0.5 * hand}>工程師要做的事</text>
      </svg>
    </Card>
  );
};

// ── ic-mask：光罩上的圖案是 4 倍大，縮小印到晶圓上（t：four｜wafer）──
const MaskCard: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 310;
  const four = tween(f, T(o, "four"), 10, EASE.enter), wf = tween(f, T(o, "wafer"), 10, EASE.enter), pop = 1 + 0.12 * Math.sin(Math.PI * tween(f, T(o, "four"), 12, EASE.move));
  const pat = (cx: number, cy: number, s: number, c: string) => PAT.map(([x, y, w, d], i) => <rect key={i} x={cx + (x - w / 2) * s} y={cy + (y - d / 2) * s} width={w * s} height={d * s} fill={c} />);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <rect x={48} y={70} width={190} height={190} rx={6} fill={H.bg2} stroke={H.line} strokeWidth={4} />{pat(143, 165, 82, IC.chrome)}
        <text x={143} y={294} textAnchor="middle" style={zh(sm(30), H.text, 800)}>光罩上的圖案</text>
        <g opacity={four}>
          <path d="M 270 190 H 600" stroke={IC.m1} strokeWidth={8} /><path d="M 586 170 L 612 190 L 586 210" fill="none" stroke={IC.m1} strokeWidth={8} />
          <text x={435} y={140} textAnchor="middle" style={zh(66 * pop, H.amber, 900)}>縮小 4 倍</text>
          <text x={435} y={246} textAnchor="middle" style={zh(sm(30), H.text2, 700)}>鏡組把光縮小（常見比例）</text>
        </g>
        <g opacity={wf}>
          <rect x={660} y={130} width={120} height={120} rx={4} fill={IC.cpu2} opacity={0.5} stroke={H.line} strokeWidth={3} />{pat(720, 190, 23.5, IC.m1)}
          <text x={720} y={294} textAnchor="middle" style={zh(sm(30), H.text, 800)}>晶圓上的圖案</text>
        </g>
      </svg>
    </Card>
  );
};

// ── ic-who：台灣誰在做（t：guc｜em｜eda）──
const Who: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300;
  const rows: [string, string, string, string][] = [["設計服務", "創意電子、世芯", IC.cpu, "guc"], ["矽智財", "力旺、晶心科", IC.npu, "em"], ["設計軟體", "新思、益華、西門子", IC.mem, "eda"]];
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        {rows.map(([a, b, c, key], i) => {
          const on = tween(f, T(o, key), 8, EASE.enter), y = CARD_CONTENT_TOP + i * 64; // 第一列從標題下緣＋8px 開始（11/22 Andy：標題壓到膠囊）
          return (
            <g key={key} opacity={on} transform={`translate(${(1 - on) * -30} 0)`}>
              <rect x={28} y={y} width={230} height={58} rx={8} fill={c} /><text x={143} y={y + 41} textAnchor="middle" style={zh(sm(34), "#FFFFFF", 900)}>{a}</text>
              <text x={286} y={y + 42} style={zh(sm(38), H.text, 900)}>{b}</text>
            </g>
          );
        })}
        <text x={W - 24} y={Hh - 8} textAnchor="end" style={zh(sm(26), H.text3, 600)}>媒體報導：數位時代、科技新報、工商時報</text>
      </svg>
    </Card>
  );
};

// ── ic-next：下一支（t：make｜next）──
const Next: React.FC<P> = ({ o, f, k }) => {
  const W = o.w ?? 952, Hh = o.h ?? 300;
  const a = tween(f, T(o, "make"), 10, EASE.enter), b = tween(f, T(o, "next"), 10, EASE.enter);
  return (
    <Card o={o} k={k} W={W} Hh={Hh}>
      <svg width={W} height={Hh} style={{ position: "absolute", inset: 0 }}>
        <g opacity={1}>
          <rect x={40} y={80} width={330} height={160} rx={12} fill={IC.cpu} /><text x={205} y={146} textAnchor="middle" style={zh(sm(44), "#FFFFFF", 900)}>設計公司</text><text x={205} y={196} textAnchor="middle" style={zh(sm(32), "#FFFFFF", 700)}>畫好設計圖</text>
        </g>
        <g opacity={a}><path d="M 392 160 H 548" stroke={H.line} strokeWidth={8} /><path d="M 532 140 L 560 160 L 532 180" fill="none" stroke={H.line} strokeWidth={8} /></g>
        <g opacity={b} transform={`translate(${(1 - b) * 30} 0)`}>
          <rect x={582} y={80} width={330} height={160} rx={12} fill={H.amber} /><text x={747} y={146} textAnchor="middle" style={zh(sm(44), (H as any).onAmber ?? "#0F1C3A", 900)}>晶圓代工</text><text x={747} y={196} textAnchor="middle" style={zh(sm(32), (H as any).onAmber ?? "#0F1C3A", 700)}>把它做出來</text>
        </g>
      </svg>
    </Card>
  );
};

export const IcSection: React.FC<P> = (p) => {
  const kind = String((p.o as any).kind ?? "");
  if (kind === "ic-sec") return <Sec {...p} />;
  if (kind === "ic-flow") return <Flow {...p} />;
  if (kind === "ic-mask") return <MaskCard {...p} />;
  if (kind === "ic-who") return <Who {...p} />;
  if (kind === "ic-next") return <Next {...p} />;
  return null;
};
