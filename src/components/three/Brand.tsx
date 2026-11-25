// 2026/11/24 共用：國旗（程式繪製）與公司 LOGO（官方原檔），科技片的 3D 標籤與 2D 卡共用。
//   Andy 11/24：「有國家就標上國旗，有公司就附上 LOGO」。
//   ・國旗：照各國官方比例與色碼用 SVG 畫（不用 emoji、不用點陣圖）。<Flag code="JP" h={30} />
//   ・LOGO：只用官網或 Wikimedia Commons 原檔，放 public/logos/<檔名>，不重畫、不改色；來源寫在 LOGOS 表與各片 assets.md。
//     <Logo id="hoya" h={44} />（HTML <Img>，Remotion 會等圖載入才渲染該幀）；在 SVG 裡用 <LogoSvg id x y h />。
//   ・標籤（Hud.tsx 的 HudLabels）：labels 加 `logo: "hoya"`、`flag: "JP"` 就會在中文名下方多一列 LOGO、英文前面加國旗；
//     hudLayout.ts 的 labelSize 也會把這一列算進去（版面檢查才準）。
// 新增 LOGO：檔案放 public/logos/，在 LOGOS 加一筆（w／h＝原檔長寬比，source＝原檔網址），各片 assets.md 記來源。
// 新增國旗：在 FLAGS 加一個函式（viewBox 寬高照官方比例），色碼寫官方值並註明出處。
import React from "react";
import { Img, staticFile } from "remotion";

export type LogoSpec = { file: string; w: number; h: number; name: string; source: string; bg?: string; /** 方形、字在圖下方的 LOGO（例如 Photronics）在標籤裡要放大才看得清：標籤用這個高度（沒寫＝46） */ labelH?: number };
/** 公司 LOGO 表（w:h＝原檔 viewBox 比例） */
export const LOGOS: Record<string, LogoSpec> = {
  // 2026-11-24 Andy 在②聊天室提供原圖（官方 LOGO 截圖；白底只裁邊、SK Siltron 灰底換白，未改色）
  globalwafers: { file: "logos/globalwafers.png", w: 488, h: 112, name: "環球晶 GlobalWafers", source: "Andy 11-24 提供（②聊天室）", bg: "#FFFFFF" },
  sksiltron: { file: "logos/sksiltron.png", w: 190, h: 96, name: "SK Siltron", source: "Andy 11-24 提供（②聊天室）", bg: "#FFFFFF", labelH: 56 },
  tmc: { file: "logos/tmc.png", w: 383, h: 118, name: "台灣光罩", source: "Andy 11-24 提供（②聊天室）", bg: "#FFFFFF" },
  asml: { file: "logos/asml.svg", w: 1065, h: 300, name: "ASML", source: "https://commons.wikimedia.org/wiki/File:ASML_Holding_N.V._logo.svg" },
  // HOYA、AGC：Commons 原檔 SVG 由 Wikimedia 自己轉出的 960px PNG（thumb.php；upload 伺服器限流，SVG 原檔當天抓不到），未重畫、未改色
  hoya: { file: "logos/hoya.png", w: 960, h: 273, name: "HOYA", source: "https://commons.wikimedia.org/wiki/File:Hoya_Corporation_logo.svg" },
  agc: { file: "logos/agc.png", w: 960, h: 332, name: "AGC", source: "https://commons.wikimedia.org/wiki/File:AGC_Logo.svg（2018 起現行版）" },
  // 2026/11/24 光罩-2（tech-mask2）：官網或 Commons 原檔，未重畫、未改色；來源同時記在 videos/tech-mask2/assets.md
  tsmc: { file: "logos/tsmc.svg", w: 273, h: 215, name: "台積電 TSMC", source: "https://commons.wikimedia.org/wiki/File:Tsmc-text.svg" },
  intel: { file: "logos/intel.svg", w: 388.2, h: 150.6, name: "英特爾 Intel", source: "https://commons.wikimedia.org/wiki/File:Intel_logo_2023.svg" },
  samsung: { file: "logos/samsung.svg", w: 7051.4024, h: 1080, name: "三星 Samsung", source: "https://commons.wikimedia.org/wiki/File:Samsung_wordmark.svg" },
  dnp: { file: "logos/dnp.svg", w: 110, h: 33, name: "大日本印刷 DNP", source: "https://www.global.dnp/content/dam/dnp-global/common/img/logo.svg" },
  tekscend: { file: "logos/tekscend.svg", w: 199, h: 32, name: "Tekscend Photomask", source: "https://www.photomask.com/assets/img/common/header_logo.svg" },
  photronics: { file: "logos/photronics.svg", w: 114, h: 134.538, labelH: 90, name: "Photronics", source: "https://www.photronics.com/wp-content/uploads/2018/11/logo.svg" },
  entegris: { file: "logos/entegris.svg", w: 181, h: 43, name: "英特格 Entegris", source: "https://www.entegris.com/content/dam/web/ux/global/header/logo-header-desktop.svg" },
  // 2026/11/26 設備五大-1（tech-asml）：Commons 原檔，未重畫、未改色；來源同時記在 videos/tech-asml/assets.md
  nikon: { file: "logos/nikon.svg", w: 400, h: 400, labelH: 80, name: "尼康 Nikon", source: "https://commons.wikimedia.org/wiki/File:Nikon_Logo.svg" },
  canon: { file: "logos/canon.svg", w: 1000.04, h: 209.153, name: "佳能 Canon", source: "https://commons.wikimedia.org/wiki/File:Canon_wordmark.svg" },
  // 2026/11/26 設備五大-2（tech-amat）：Commons 原檔 SVG 由 Wikimedia 自己轉出的 960px PNG（upload 伺服器限流），未重畫、未改色
  amat: { file: "logos/amat.png", w: 960, h: 274, name: "應用材料 Applied Materials", source: "https://commons.wikimedia.org/wiki/File:Applied_Materials_Logo.svg" },
  gudeng: { file: "logos/gudeng.svg", w: 307.716, h: 87.038, name: "家登 Gudeng", source: "https://www.gudeng.com/img/logo.svg" },
};
export const hasLogo = (id?: string) => !!id && !!LOGOS[id];
export const logoLabelH = (id: string, base: number) => LOGOS[id]?.labelH ?? base;
export const logoW = (id: string, h: number) => (LOGOS[id] ? Math.round((h * LOGOS[id].w) / LOGOS[id].h) : 0);

/** LOGO（HTML）：高 h，寬照原檔比例；白底小板讓深色／彩色 LOGO 在任何皮膚上都看得清楚（pad＝板邊距，0＝不加板） */
export const Logo: React.FC<{ id: string; h: number; pad?: number; style?: React.CSSProperties }> = ({ id, h, pad = 0, style }) => {
  const s = LOGOS[id];
  if (!s) return null;
  const img = <Img src={staticFile(s.file)} style={{ height: h, width: logoW(id, h), display: "block" }} />;
  if (!pad) return <div style={style}>{img}</div>;
  return <div style={{ background: s.bg ?? "#FFFFFF", padding: pad, border: "2px solid #E3E7EE", display: "inline-block", ...style }}>{img}</div>;
};
/** LOGO（放在 <svg> 裡）：x,y＝左上角 */
export const LogoSvg: React.FC<{ id: string; x: number; y: number; h: number; opacity?: number }> = ({ id, x, y, h, opacity = 1 }) => {
  const s = LOGOS[id];
  if (!s) return null;
  return <image href={staticFile(s.file)} x={x} y={y} height={h} width={logoW(id, h)} opacity={opacity} preserveAspectRatio="xMidYMid meet" />;
};

// ── 國旗（viewBox 照官方比例；色碼出處寫在每一面旁邊） ──
type FlagDef = { w: number; h: number; draw: () => React.ReactNode; name: string };
const star5 = (cx: number, cy: number, r: number) => {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.382 : r; p.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`); }
  return p.join(" ");
};
export const FLAGS: Record<string, FlagDef> = {
  // 日本：國旗國歌法（1999）2:3、日章直徑＝旗高 3/5、置中；紅＝#BC002D（內閣府建議色）
  JP: { name: "日本", w: 3, h: 2, draw: () => <><rect width={3} height={2} fill="#FFFFFF" /><circle cx={1.5} cy={1} r={0.6} fill="#BC002D" /></> },
  // 荷蘭：2:3 紅白藍三等分；紅 #AE1C28、藍 #21468B（荷蘭政府標準色）
  NL: { name: "荷蘭", w: 3, h: 2, draw: () => <><rect width={3} height={2 / 3} fill="#AE1C28" /><rect y={2 / 3} width={3} height={2 / 3} fill="#FFFFFF" /><rect y={4 / 3} width={3} height={2 / 3} fill="#21468B" /></> },
  // 德國：3:5 黑紅金；#000000、#DD0000、#FFCE00（聯邦政府設計規範）
  DE: { name: "德國", w: 5, h: 3, draw: () => <><rect width={5} height={1} fill="#000000" /><rect y={1} width={5} height={1} fill="#DD0000" /><rect y={2} width={5} height={1} fill="#FFCE00" /></> },
  // 中華民國（台灣）：2:3 紅地 #FE0000、左上青天 #000095 佔 1/4（寬 1/2、高 1/2）、白日 12 道光芒（國旗法；以 240×160 繪製）
  TW: { name: "台灣", w: 240, h: 160, draw: () => {
    const pts: string[] = [];
    for (let i = 0; i < 24; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 12, r = i % 2 ? 16 : 30; pts.push(`${(60 + r * Math.cos(a)).toFixed(2)},${(40 + r * Math.sin(a)).toFixed(2)}`); }
    return <><rect width={240} height={160} fill="#FE0000" /><rect width={120} height={80} fill="#000095" /><polygon points={pts.join(" ")} fill="#FFFFFF" /><circle cx={60} cy={40} r={17} fill="#000095" /><circle cx={60} cy={40} r={15} fill="#FFFFFF" /></>;
  } },
  // 美國：10:19、13 道紅白條、藍區寬 0.76、高 7 條；紅 #B22234、藍 #3C3B6E（美國國務院色）；50 星
  US: { name: "美國", w: 1.9, h: 1, draw: () => {
    const sh = 1 / 13, st: React.ReactNode[] = [];
    for (let i = 0; i < 13; i += 2) st.push(<rect key={`s${i}`} y={i * sh} width={1.9} height={sh} fill="#B22234" />);
    const stars: React.ReactNode[] = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < (r % 2 ? 5 : 6); c++) stars.push(<polygon key={`t${r}-${c}`} points={star5(0.063 + (r % 2 ? 0.063 : 0) + c * 0.126, 0.054 + r * 0.054, 0.0308)} fill="#FFFFFF" />);
    return <><rect width={1.9} height={1} fill="#FFFFFF" />{st}<rect width={0.76} height={7 * sh} fill="#3C3B6E" />{stars}</>;
  } },
};
export const hasFlag = (code?: string) => !!code && !!FLAGS[code];
export const flagW = (code: string, h: number) => (FLAGS[code] ? Math.round((h * FLAGS[code].w) / FLAGS[code].h) : 0);
/** 國旗（HTML 或 SVG 都可用：asSvg＝true 時回傳 <svg> 子元素，x,y＝左上角） */
export const Flag: React.FC<{ code: string; h: number; x?: number; y?: number; asSvg?: boolean; opacity?: number }> = ({ code, h, x = 0, y = 0, asSvg, opacity = 1 }) => {
  const d = FLAGS[code];
  if (!d) return null;
  const w = flagW(code, h);
  const inner = <svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${d.w} ${d.h}`} preserveAspectRatio="none" opacity={opacity} style={asSvg ? undefined : { display: "block" }}>{d.draw()}</svg>;
  // 細灰邊：白底國旗（日本）放在白卡上才看得出旗面範圍
  return asSvg ? <g>{inner}<rect x={x} y={y} width={w} height={h} fill="none" stroke="#9AA3B2" strokeWidth={1.5} opacity={opacity} /></g>
    : <div style={{ display: "inline-block", outline: "1.5px solid #9AA3B2", lineHeight: 0 }}>{inner}</div>;
};

// ── 台灣本島輪廓（2026-11-25 Andy：「台灣需要描繪更清楚」）：27 個海岸點（富貴角、三貂角、鵝鑾鼻、安平…）照經緯度等距投影。
//   twPath(ox, oy, k)：左上基準 (ox, oy)、每度緯度 k px；twPt(lon, lat, ox, oy, k)：城市位置（台南 120.20,23.00；雲林麥寮 120.25,23.75）。
const TW_COAST: [number, number][] = [[121.54, 25.30], [121.74, 25.15], [121.92, 25.02], [122.00, 25.01], [121.83, 24.86], [121.86, 24.59], [121.80, 24.45], [121.62, 23.98], [121.52, 23.60], [121.38, 23.10], [121.15, 22.75], [120.90, 22.34], [120.85, 21.90], [120.73, 21.93], [120.60, 22.36], [120.45, 22.46], [120.27, 22.62], [120.15, 22.99], [120.08, 23.15], [120.15, 23.38], [120.20, 23.78], [120.40, 24.05], [120.50, 24.27], [120.67, 24.50], [120.92, 24.82], [121.08, 25.03], [121.40, 25.18]];
const TW_COS = Math.cos((23.6 * Math.PI) / 180);
export const twPt = (lon: number, lat: number, ox: number, oy: number, k: number): [number, number] => [ox + (lon - 120.08) * k * TW_COS, oy + (25.3 - lat) * k];
export const twPath = (ox: number, oy: number, k: number) => "M" + TW_COAST.map(([a, b]) => twPt(a, b, ox, oy, k).map((v) => v.toFixed(1)).join(" ")).join(" L") + "Z";
