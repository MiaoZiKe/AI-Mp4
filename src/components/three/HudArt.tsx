// 深色 HUD 片（Hud.tsx）的 2D 縮放圖層：每一級一張 SVG（座標：寬 1000＝那一級的 field，以中心為原點）。
// 2026/11/14 short-tech 第二版把每一級補細節：手機內部（鏡頭模組、電池、無線充電線圈、排線、喇叭、屏蔽罩）、
// 主機板（走線、被動元件、屏蔽罩框、連接器、晶片封裝與錫球）、晶片（封裝基板、錫球、裸晶、凸塊、功能區塊）、
// 電晶體陣列（電源軌、主動區、閘極條、接點、上層金屬線）、單顆電晶體俯視（和 model.json 的零件位置一致）。
// 都是幾何示意：沒有商標、不仿特定機型、區塊配置不是任何一顆真實晶片。顏色只讀 THEME_3D_HUD。
// 每一級正中央都留著下一級（大小照 field 的比例），所以縮放是一路鑽進同一個點。
import React from "react";
import { FONT_EN, FONT_ZH } from "../../theme";
import { H } from "./hudSkin";

const mono = (px: number, color: string = H.text2, w = 600): React.CSSProperties => ({ fontFamily: `${H.font.mono}, ${FONT_EN}`, fontSize: px, fill: color, fontWeight: w, letterSpacing: "0.06em", whiteSpace: "nowrap" });
const zh = (px: number, color: string = H.text2, w = 700): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: px, fill: color, fontWeight: w, whiteSpace: "nowrap" });
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
// 每次讀都拿目前皮膚的 art（H 會跟著 hudSkin 換）
const A = new Proxy({} as typeof H.art, { get: (_, k) => (H.art as any)[k] });

/** 一顆有接腳的晶片（俯視）：本體、四邊的接腳點、pin 1 圓點、印字 */
const Ic: React.FC<{ x: number; y: number; w: number; h: number; t?: string; pins?: number }> = ({ x, y, w, h, t, pins = 6 }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={6} fill={A.part} stroke={A.edge} strokeWidth={2.5} />
    {range(pins).map((i) => <React.Fragment key={i}>
      <rect x={x + ((i + 0.5) * w) / pins - 3} y={y - 7} width={6} height={7} fill={A.solder} opacity={0.7} />
      <rect x={x + ((i + 0.5) * w) / pins - 3} y={y + h} width={6} height={7} fill={A.solder} opacity={0.7} />
    </React.Fragment>)}
    <circle cx={x + 12} cy={y + 12} r={4} fill={A.edge} />
    {t ? <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle" style={mono(22, H.text3)}>{t}</text> : null}
  </g>
);
/** 一排被動元件（電容／電阻）：米色本體＋兩端銀色焊點 */
const Caps: React.FC<{ x: number; y: number; n: number; dx?: number; dy?: number; v?: boolean }> = ({ x, y, n, dx = 22, dy = 0, v }) => (
  <g>
    {range(n).map((i) => { const w = v ? 9 : 16, h = v ? 16 : 9, px = x + i * dx, py = y + i * dy; return (
      <g key={i}>
        <rect x={px} y={py} width={w} height={h} fill={A.cap} />
        <rect x={px} y={py} width={v ? w : 4} height={v ? 4 : h} fill={A.solder} /><rect x={v ? px : px + w - 4} y={v ? py + h - 4 : py} width={v ? w : 4} height={v ? 4 : h} fill={A.solder} />
      </g>
    ); })}
  </g>
);
/** 屏蔽罩（X 光畫法：只畫框、四角的焊點與幾個散熱孔） */
const Shield: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={10} fill={A.shield} fillOpacity={0.08} stroke={A.shield} strokeWidth={4} />
    <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={6} fill="none" stroke={A.shield} strokeWidth={1.5} strokeDasharray="10 8" />
    {[[x + 14, y + 14], [x + w - 14, y + 14], [x + 14, y + h - 14], [x + w - 14, y + h - 14]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={4} fill={A.shield} />)}
  </g>
);

export const Art: React.FC<{ kind: string; f: number }> = ({ kind }) => {
  if (kind === "phone") return (
    // 手機：X 光線稿，高 840＝畫面寬 18 cm 的約 15 cm。主機板那一級的圖會照比例疊在正中央（寬約 1/3）
    <g>
      <rect x={-210} y={-420} width={420} height={840} rx={60} fill={A.body} stroke={H.line} strokeOpacity={0.75} strokeWidth={6} />
      <rect x={-186} y={-394} width={372} height={788} rx={40} fill={H.bg2} stroke={H.lineSoft} strokeWidth={3} />
      {/* 邊框的天線斷點、側邊按鍵 */}
      {[[-213, -300], [-213, 300], [204, -300], [204, 300]].map(([x, y], i) => <rect key={i} x={x} y={y} width={9} height={14} fill={H.bg} />)}
      <rect x={210} y={-190} width={7} height={90} rx={3} fill={A.edge} /><rect x={-217} y={-230} width={7} height={50} rx={3} fill={A.edge} /><rect x={-217} y={-165} width={7} height={50} rx={3} fill={A.edge} />
      {/* 上段：鏡頭模組（三顆鏡頭＋閃光燈）、聽筒、前鏡頭、上方小板與屏蔽罩 */}
      <rect x={-172} y={-380} width={176} height={212} rx={30} fill={A.part} stroke={A.edge} strokeWidth={3} />
      {[[-124, -330, 34], [-44, -330, 34], [-124, -236, 34]].map(([cx, cy, r], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill={H.bg} stroke={H.line} strokeOpacity={0.8} strokeWidth={4} />
          <circle cx={cx} cy={cy} r={r * 0.62} fill="none" stroke={H.lineSoft} strokeWidth={3} /><circle cx={cx} cy={cy} r={r * 0.28} fill={H.lineSoft} />
        </g>
      ))}
      <circle cx={-44} cy={-246} r={13} fill={A.cap} opacity={0.85} /><circle cx={-44} cy={-208} r={7} fill="none" stroke={H.lineSoft} strokeWidth={2.5} />
      <rect x={-34} y={-388} width={68} height={8} rx={4} fill={H.lineSoft} /><circle cx={62} cy={-384} r={6} fill="none" stroke={H.lineSoft} strokeWidth={2.5} />
      <rect x={22} y={-366} width={150} height={196} rx={12} fill={A.board} fillOpacity={0.55} stroke={A.trace} strokeWidth={2.5} />
      <Shield x={34} y={-354} w={126} h={78} /><Shield x={34} y={-264} w={74} h={82} />
      <Caps x={118} y={-258} n={4} dx={0} dy={20} /><Caps x={140} y={-258} n={4} dx={0} dy={20} />
      {/* 中段：主機板的位置（板子本身由下一級的圖畫）；左右是把上下兩段接起來的排線 */}
      <rect x={-176} y={-122} width={352} height={244} rx={14} fill="none" stroke={H.lineSoft} strokeWidth={3} strokeDasharray="14 10" />
      {[-6, 0, 6].map((d) => <path key={d} d={`M ${-150 + d} -168 V -122`} stroke={A.flex} strokeWidth={2.5} fill="none" />)}
      {[-6, 0, 6].map((d) => <path key={`r${d}`} d={`M ${120 + d} -170 V -122`} stroke={A.flex} strokeWidth={2.5} fill="none" />)}
      {/* 下段：電池（極耳、無線充電線圈）、排線、喇叭、振動馬達、充電孔 */}
      <rect x={-160} y={140} width={300} height={200} rx={16} fill={A.part} fillOpacity={0.6} stroke={H.line} strokeOpacity={0.6} strokeWidth={4} />
      <rect x={-130} y={128} width={56} height={14} fill={A.cap} /><rect x={-60} y={128} width={30} height={14} fill={A.solder} />
      {[78, 66, 54, 42].map((r) => <circle key={r} cx={-10} cy={240} r={r} fill="none" stroke={A.copper} strokeOpacity={0.55} strokeWidth={3} />)}
      <text x={-10} y={250} textAnchor="middle" style={mono(26, H.text2)}>BATTERY</text>
      {[-5, 0, 5].map((d) => <path key={`f${d}`} d={`M ${160 + d} 122 V 352 H ${120 + d}`} stroke={A.flex} strokeWidth={2.5} fill="none" />)}
      <rect x={-166} y={352} width={130} height={32} rx={6} fill={A.part} stroke={A.edge} strokeWidth={2.5} />
      {range(8).map((i) => <circle key={i} cx={-152 + i * 15} cy={368} r={3.5} fill={H.lineSoft} />)}
      <rect x={-26} y={356} width={52} height={24} rx={12} fill="none" stroke={H.line} strokeOpacity={0.7} strokeWidth={3} />
      <rect x={40} y={350} width={110} height={36} rx={6} fill={A.part} stroke={A.edge} strokeWidth={2.5} /><rect x={52} y={360} width={86} height={16} rx={3} fill="none" stroke={H.lineSoft} strokeWidth={2} />
      {[[-170, -140], [170, -140], [-170, 132], [176, 344], [-176, 344], [8, -150]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={7} fill="none" stroke={A.solder} strokeOpacity={0.7} strokeWidth={2} /><path d={`M${x - 4} ${y} H${x + 4} M${x} ${y - 4} V${y + 4}`} stroke={A.solder} strokeOpacity={0.7} strokeWidth={1.5} /></g>)}
      <rect x={-28} y={-28} width={56} height={56} fill="none" stroke={H.amber} strokeWidth={3} />
    </g>
  );
  if (kind === "board") return (
    // 主機板：1000×660＝60×40 mm。走線、被動元件、屏蔽罩框、幾顆周邊晶片、板對板連接器、螺絲孔；正中央是主晶片的封裝
    <g>
      <rect x={-500} y={-330} width={1000} height={660} rx={30} fill={A.board} stroke={A.trace} strokeWidth={4} />
      {[[-462, -292], [462, -292], [-462, 292], [462, 292]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={20} fill={H.bg} stroke={A.copper} strokeWidth={6} /><circle cx={x} cy={y} r={30} fill="none" stroke={A.copper} strokeOpacity={0.35} strokeWidth={2} /></g>)}
      {/* 走線：從主晶片四邊扇出，折 45 度到周邊晶片與連接器 */}
      {range(16).map((i) => <path key={`b${i}`} d={`M ${-75 + i * 10} 96 V ${150 + (i % 4) * 14} L ${-200 + i * 26} ${230 + (i % 3) * 10} V 300`} fill="none" stroke={A.trace} strokeWidth={3.5} />)}
      {range(14).map((i) => <path key={`t${i}`} d={`M ${-65 + i * 10} -96 V ${-140 - (i % 5) * 8} L ${-250 + i * 12} ${-200 - (i % 5) * 8} H ${-330 - (i % 4) * 6}`} fill="none" stroke={A.trace} strokeWidth={3} />)}
      {range(12).map((i) => <path key={`r${i}`} d={`M 96 ${-55 + i * 10} H ${150 + (i % 4) * 12} L ${230 + (i % 4) * 12} ${-150 + i * 4} H 260`} fill="none" stroke={A.trace} strokeWidth={3} />)}
      {range(12).map((i) => <path key={`l${i}`} d={`M -96 ${-55 + i * 10} H ${-150 - (i % 3) * 12} L ${-250 - (i % 3) * 12} ${40 + i * 12} H -420`} fill="none" stroke={A.trace} strokeWidth={3} />)}
      {range(9).map((i) => <path key={`q${i}`} d={`M 96 ${20 + i * 8} H ${200 + i * 8} V ${150 + (i % 2) * 6} H 300`} fill="none" stroke={A.trace} strokeWidth={2.5} />)}
      {/* 導孔（走線換層的小圓點） */}
      {range(40).map((i) => <circle key={`v${i}`} cx={-430 + ((i * 197) % 860)} cy={-285 + ((i * 131) % 570)} r={4.5} fill={A.board} stroke={A.copper} strokeWidth={2.5} />)}
      {/* 周邊晶片 */}
      <Ic x={-430} y={-270} w={170} h={96} t="PMIC" pins={8} /><Ic x={250} y={-280} w={200} h={124} t="RF" pins={9} /><Ic x={300} y={130} w={150} h={116} t="NAND" pins={7} />
      <Ic x={-440} y={150} w={110} h={110} t="WIFI" pins={5} /><Ic x={-260} y={196} w={84} h={64} pins={4} /><Ic x={130} y={206} w={92} h={58} pins={4} /><Ic x={-150} y={-286} w={90} h={60} pins={4} />
      {/* 屏蔽罩框（射頻與電源區各一個） */}
      <Shield x={228} y={-304} w={244} h={176} /><Shield x={-452} y={-294} w={214} h={146} />
      {/* 被動元件：主晶片四周的去耦電容，和幾排電阻電容 */}
      <Caps x={-122} y={-134} n={11} /><Caps x={-122} y={124} n={11} /><Caps x={-136} y={-100} n={9} dx={0} dy={22} v /><Caps x={126} y={-100} n={9} dx={0} dy={22} v />
      <Caps x={-400} y={-140} n={7} /><Caps x={-400} y={-118} n={5} /><Caps x={262} y={-116} n={8} /><Caps x={30} y={-290} n={8} /><Caps x={30} y={-268} n={6} />
      <Caps x={-300} y={110} n={5} /><Caps x={150} y={284} n={6} /><Caps x={-60} y={270} n={7} /><Caps x={470} y={-80} n={6} dx={0} dy={22} v />
      {/* 電感（方形線圈）與石英震盪器 */}
      {[[-236, -120], [-190, -120], [212, 82]].map(([x, y], i) => <g key={i}><rect x={x} y={y} width={38} height={38} rx={5} fill={A.part} stroke={A.edge} strokeWidth={2} /><circle cx={x + 19} cy={y + 19} r={10} fill="none" stroke={A.copper} strokeWidth={3} /></g>)}
      <rect x={-330} y={280} width={60} height={26} rx={4} fill={A.solder} opacity={0.7} />
      {/* 板對板連接器（排線插在這裡）：兩排金色接點 */}
      {[[-492, -60, 34, 150, true], [366, -70, 104, 34, false], [-40, -322, 120, 30, false]].map(([x, y, w, h, v], i) => (
        <g key={i}>
          <rect x={x as number} y={y as number} width={w as number} height={h as number} rx={5} fill={H.bg2} stroke={A.edge} strokeWidth={2.5} />
          {range(v ? 12 : Math.floor((w as number) / 10)).map((j) => v
            ? <React.Fragment key={j}><rect x={(x as number) + 5} y={(y as number) + 8 + j * 11.5} width={8} height={5} fill={A.bump} /><rect x={(x as number) + 21} y={(y as number) + 8 + j * 11.5} width={8} height={5} fill={A.bump} /></React.Fragment>
            : <React.Fragment key={j}><rect x={(x as number) + 6 + j * 10} y={(y as number) + 5} width={5} height={8} fill={A.bump} /><rect x={(x as number) + 6 + j * 10} y={(y as number) + (h as number) - 13} width={5} height={8} fill={A.bump} /></React.Fragment>)}
        </g>
      ))}
      {/* 測試點、絲印角標 */}
      {range(10).map((i) => <circle key={`p${i}`} cx={-80 + i * 18} cy={310} r={5} fill={A.bump} opacity={0.8} />)}
      <path d="M -104 -104 h 18 M -104 -104 v 18 M 104 104 h -18 M 104 104 v -18" stroke={H.text3} strokeWidth={3} fill="none" />
      {/* 主晶片封裝（正中央；大小＝下一級的 1/6 畫面寬）：封裝外框、底下一圈錫球（X 光） */}
      <rect x={-84} y={-84} width={168} height={168} rx={8} fill={A.die} stroke={H.line} strokeWidth={4} />
      {range(11).map((i) => range(11).map((j) => (i < 2 || i > 8 || j < 2 || j > 8 ? <circle key={`${i}-${j}`} cx={-70 + i * 14} cy={-70 + j * 14} r={3.6} fill={A.solder} opacity={0.5} /> : null)))}
    </g>
  );
  if (kind === "die") return (
    // 晶片封裝：1000＝約 10 mm。封裝基板（綠）＋底下的錫球陣列（X 光）＋基板走線；中間是裸晶，上面一整片凸塊，裡面分成幾個功能區塊（示意配置）
    <g>
      <rect x={-500} y={-500} width={1000} height={1000} rx={16} fill={A.substrate} stroke={H.line} strokeWidth={5} />
      {range(13).map((i) => range(13).map((j) => <circle key={`${i}-${j}`} cx={-456 + i * 76} cy={-456 + j * 76} r={17} fill="none" stroke={A.solder} strokeOpacity={0.5} strokeWidth={3} />))}
      {range(24).map((i) => { const u = -360 + i * 31; return <React.Fragment key={i}>
        <path d={`M ${u} -380 V ${-420 - (i % 3) * 14} L ${u + (u < 0 ? -30 : 30)} ${-470}`} fill="none" stroke={A.trace} strokeWidth={3} /><path d={`M ${u} 380 V ${420 + (i % 3) * 14} L ${u + (u < 0 ? -30 : 30)} 470`} fill="none" stroke={A.trace} strokeWidth={3} />
        <path d={`M -380 ${u} H ${-420 - (i % 3) * 14} L -470 ${u + (u < 0 ? -30 : 30)}`} fill="none" stroke={A.trace} strokeWidth={3} /><path d={`M 380 ${u} H ${420 + (i % 3) * 14} L 470 ${u + (u < 0 ? -30 : 30)}`} fill="none" stroke={A.trace} strokeWidth={3} />
      </React.Fragment>; })}
      {/* 基板四角的被動元件 */}
      <Caps x={-480} y={-492} n={4} dx={24} /><Caps x={390} y={482} n={4} dx={24} /><Caps x={-492} y={400} n={4} dx={0} dy={22} v /><Caps x={482} y={-480} n={4} dx={0} dy={22} v />
      {/* 裸晶 */}
      <rect x={-380} y={-380} width={760} height={760} fill={A.die} stroke={H.line} strokeWidth={5} />
      <rect x={-368} y={-368} width={736} height={736} fill="none" stroke={H.lineSoft} strokeWidth={2} strokeDasharray="6 5" />
      {/* 功能區塊（示意）：處理器核心、繪圖、AI 運算、基頻、影像處理、快取記憶體、輸出入 */}
      {([[-356, -356, 330, 236, A.block, "CPU"], [-10, -356, 366, 196, A.block2, "GPU"], [-356, -104, 190, 250, A.block, "NPU"], [-356, 162, 300, 194, A.block2, "MODEM"], [196, -144, 160, 250, A.block, "ISP"], [-40, 222, 396, 134, A.block, "I/O"], [-150, -144, 330, 350, A.block, "CACHE"]] as [number, number, number, number, string, string][]).map(([x, y, w, h, c, t], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} fill={c} stroke={H.line} strokeOpacity={0.7} strokeWidth={3} />
          <text x={x + 14} y={y + 38} style={mono(28, H.text2)}>{t}</text>
        </g>
      ))}
      {/* 區塊裡的細節：核心方塊、繪圖單元格、記憶體的細條紋 */}
      {range(6).map((i) => <rect key={`c${i}`} x={-340 + (i % 3) * 104} y={-304 + Math.floor(i / 3) * 90} width={i < 2 ? 96 : 90} height={78} fill="none" stroke={H.lineSoft} strokeWidth={2.5} />)}
      {range(8).map((i) => <rect key={`g${i}`} x={6 + (i % 4) * 86} y={-304 + Math.floor(i / 4) * 68} width={76} height={58} fill="none" stroke={A.gate} strokeOpacity={0.5} strokeWidth={2} />)}
      {range(22).map((i) => <line key={`n${i}`} x1={-344} x2={-178} y1={-56 + i * 9} y2={-56 + i * 9} stroke={H.lineSoft} strokeWidth={2} />)}
      {range(16).map((i) => <line key={`m${i}`} x1={-340 + i * 18} x2={-340 + i * 18} y1={206} y2={344} stroke={A.gate} strokeOpacity={0.4} strokeWidth={2} />)}
      {range(13).map((i) => <rect key={`s${i}`} x={208} y={-96 + i * 15} width={136} height={8} fill="none" stroke={H.lineSoft} strokeWidth={1.5} />)}
      {range(18).map((i) => <rect key={`o${i}`} x={-26 + i * 21} y={300} width={14} height={44} fill="none" stroke={H.lineSoft} strokeWidth={2} />)}
      {/* 凸塊（裸晶和基板之間的接點；X 光畫法）：一整片小圓點 */}
      {range(19).map((i) => range(19).map((j) => <circle key={`u${i}-${j}`} cx={-360 + i * 40} cy={-360 + j * 40} r={5} fill={A.bump} opacity={0.42} />))}
      {/* 三個名稱：封裝基板／裸晶／凸塊 */}
      <text x={-486} y={-404} style={zh(30, H.text2)}>封裝基板</text><text x={372} y={-392} textAnchor="end" style={zh(30, H.line)}>裸晶</text>
      <path d="M 300 -320 L 250 -270" stroke={A.bump} strokeWidth={2.5} /><text x={258} y={-250} textAnchor="end" style={zh(28, A.bump)}>凸塊</text>
      {/* 正中央一層比一層細的格線：一路放大幾百倍，畫面都還有線條在流動 */}
      {[40, 8, 1.6, 0.32, 0.064].map((sp, j) => { const hw = sp * 7.5, n = 15; return (
        <g key={`g${j}`} stroke={H.line} strokeOpacity={0.4} strokeWidth={sp * 0.035}>
          {range(n + 1).map((i) => <line key={`a${i}`} x1={-hw + i * sp} x2={-hw + i * sp} y1={-hw} y2={hw} />)}
          {range(n + 1).map((i) => <line key={`b${i}`} y1={-hw + i * sp} y2={-hw + i * sp} x1={-hw} x2={hw} />)}
        </g>
      ); })}
      <rect x={-10} y={-10} width={20} height={20} fill="none" stroke={H.amber} strokeWidth={3} vectorEffect="non-scaling-stroke" />
    </g>
  );
  if (kind === "cells") return (
    // 電晶體陣列（俯視，示意密度）：一列一列的元件。每列上下各一條電源軌（銅色）、兩條主動區（藍）、垂直的閘極條（琥珀，列與列之間切斷）、
    // 閘極之間的接點（銀色小方塊）；上面再疊幾條上層金屬線。圖樣用 <pattern> 鋪，正中央剛好是一條閘極
    <g>
      <defs>
        <pattern id="hudCells" x={-10} y={-20} width={20} height={64} patternUnits="userSpaceOnUse">
          <rect x={0} y={0} width={20} height={64} fill={A.die} />
          <rect x={0} y={8} width={20} height={20} fill={A.sd} opacity={0.85} /><rect x={0} y={36} width={20} height={20} fill={A.block} />
          <rect x={7.5} y={5} width={5} height={54} fill={A.gate} opacity={0.9} />
          <rect x={0.5} y={14} width={4} height={8} fill={A.contact} opacity={0.8} /><rect x={15.5} y={42} width={4} height={8} fill={A.contact} opacity={0.8} />
          <rect x={0} y={-1.5} width={20} height={4} fill={A.copper} opacity={0.75} /><rect x={0} y={61.5} width={20} height={4} fill={A.copper} opacity={0.75} />
        </pattern>
        <pattern id="hudCellsM2" x={-70} y={0} width={140} height={1000} patternUnits="userSpaceOnUse">
          <rect x={20} y={0} width={6} height={1000} fill={A.copper} opacity={0.45} /><rect x={104} y={0} width={6} height={1000} fill={A.copper} opacity={0.3} />
        </pattern>
      </defs>
      <rect x={-500} y={-500} width={1000} height={1000} fill="url(#hudCells)" />
      <rect x={-500} y={-500} width={1000} height={1000} fill="url(#hudCellsM2)" />
      {range(7).map((i) => <rect key={i} x={-470 + ((i * 290) % 900)} y={-436 + i * 128} width={150 + (i % 3) * 40} height={5} fill={A.copper} opacity={0.5} />)}
      <rect x={-6} y={-6} width={12} height={12} fill="none" stroke={H.text} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </g>
  );
  // gates：一顆奈米片電晶體的俯視（1 單位＝4 nm，畫面寬 150 nm＝37.5 單位）；和 model.json 的零件位置一致（y 朝上），交棒給 3D 時對得上。
  // 由下到上：矽基板、兩側的隔離氧化層、奈米片露出的兩端、源極／汲極、間隔層、閘極、接點、最上面的銅線
  const u = 1000 / 37.5, R = (x: number, y: number, w: number, h: number) => ({ x: (x - w / 2) * u, y: (-y - h / 2) * u, width: w * u, height: h * u });
  const X6 = [-13.125, -8.875, -2.125, 2.125, 8.875, 13.125];
  return (
    <g>
      <rect {...R(0, 0, 34, 18)} rx={10} fill={A.sub} />
      <rect {...R(0, 0, 34, 10)} fill={A.fin} />
      {[-7, 7].map((y) => <rect key={y} {...R(0, y, 34, 4)} fill={A.sti} />)}
      {[-11, 0, 11].map((x) => <rect key={x} {...R(x, 0, 5.5, 10)} fill={A.sheet} opacity={0.9} />)}
      {[-5.5, 5.5].map((x) => <rect key={x} {...R(x, 0, 5.5, 11)} fill={A.sd} />)}
      {X6.map((x) => <rect key={x} {...R(x, 0, 1.25, 14)} fill={A.spacer} opacity={0.75} />)}
      {[-11, 0, 11].map((x) => <rect key={`g${x}`} {...R(x, 0, 3, 14)} fill={A.gate} />)}
      {[-5.5, 5.5].map((x) => <rect key={`c${x}`} {...R(x, 0, 2.6, 8)} fill={A.contact} />)}
      {[-5.5, 5.5].map((x) => <rect key={`m${x}`} {...R(x, 0, 3, 17)} fill={A.copper} />)}
      <rect {...R(0, 6, 2.2, 7)} fill={A.copper} />
    </g>
  );
};
