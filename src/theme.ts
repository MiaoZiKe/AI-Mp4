import { continueRender, delayRender, staticFile } from "remotion";
import { loadFont as loadTC, getInfo as tcInfo } from "@remotion/google-fonts/NotoSansTC";
import { loadFont as loadInter, getInfo as interInfo } from "@remotion/google-fonts/Inter";

/**
 * 字型：Noto Sans TC + Inter（@remotion/google-fonts）。
 * 若 public/fonts/manifest.json 存在（npm run fonts 產生的本地鏡像），改從本地載入同一批子集，
 * 以支援 Chrome 無法直連 fonts.gstatic.com 的環境；否則直接用 Google Fonts。
 */
const loadFonts = () => {
  const handle = delayRender("fonts");
  const google = () => {
    const fams = [
      loadTC("normal", { weights: ["400", "700", "900"] }),
      loadInter("normal", { weights: ["400", "600", "800"], subsets: ["latin", "latin-ext"] }),
    ];
    Promise.all(fams.map((f) => f.waitUntilDone())).finally(() => continueRender(handle));
  };
  fetch(staticFile("fonts/manifest.json"))
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error("no manifest"))))
    .then((list: { family: string; weight: string; unicodeRange: string; file: string }[]) =>
      Promise.all(list.map((f) => {
        const ff = new FontFace(f.family, `url(${staticFile(f.file)}) format("woff2")`, { weight: f.weight, unicodeRange: f.unicodeRange });
        document.fonts.add(ff);
        return ff.load();
      })).then(() => continueRender(handle)))
    .catch(google);
};
if (typeof document !== "undefined") loadFonts();

export const FONT_ZH = `"${interInfo().fontFamily}", "${tcInfo().fontFamily}", sans-serif`;
export const FONT_EN = `"${interInfo().fontFamily}", sans-serif`;

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const SAFE = { top: 220, bottom: 220, x: 64 };

export const C = {
  bg: "#0B1026",
  cyan: "#22E5D4",
  pink: "#FF4FA3",
  yellow: "#FFD54A",
  purple: "#8B7CFF",
  white: "#FFFFFF",
  // 政治中立：低飽和紅藍，只在需要區分兩黨時使用，且一律附文字標示
  dem: "#6F8FC9",
  rep: "#C9807A",
  undecided: "#5B6280",
  card: "rgba(18, 26, 60, 0.72)",
};

export type Accent = "cyan" | "pink" | "yellow" | "purple";
export const accent = (a?: string) => (C as Record<string, string>)[a ?? "cyan"] ?? C.cyan;

export const glow = (color: string, r = 12) => `drop-shadow(0 0 ${r / 2}px ${color}) drop-shadow(0 0 ${r}px ${color}88)`;
export const boxGlow = (color: string) => `0 0 12px ${color}55`;

// ───────────────────────── styleVersion 2：A 奶油編輯（Editorial Cream） ─────────────────────────
// v2 元件的顏色、陰影、背景、版面一律從這裡讀；換主題只改這一段（v1 仍用上面的 C／SAFE，不受影響）。
// 來源：docs/style-v2/styles.md 的 A 節（對比值以背景 #FBF5EA 計算）。
export type AccentV2 = { fill: string; text: string; soft: string };
export const THEME_V2 = {
  name: "A 奶油編輯",
  bg: "#FBF5EA",
  /** 背景紙紋：海軍藍圓點（預先渲染成 public/bg/base-v2.png） */
  bgImage: "bg/base-v2.png",
  dot: { color: "rgba(20,33,61,0.07)", r: 1.6, gap: 24 },
  text: "#14213D",
  text2: "#4B5675",
  text3: "#5F6673",
  card: "#FFFDF8",
  cardBorder: "#E6D9C2",
  cardBorderW: 2,
  shadow: "0 2px 0 #E6D9C2, 0 18px 40px -18px rgba(20,33,61,0.22)",
  radius: 14,
  radiusTag: 8,
  /** 卡片頂端色條 */
  topBar: 6,
  /** 報頭線（Header 下方）與分隔線 */
  rule: "#14213D",
  ruleW: 4,
  divider: "#E6D9C2",
  /** 色塊上的字（≥24px 粗體才可用白字，對比 3.38:1） */
  onAccent: "#FFFFFF",
  /** 提示框（台灣視角等） */
  noteBg: "#FFF3DA",
  track: "#F1E7D6",
  /** 背景色塊：深一階米色；主色淡底（約 10%）；安全區外的出血色帶 */
  block: "#F3E7D2",
  blockTint: 0.1,
  watermark: "#14213D",
  /** 色名 → 實際色（script.json 仍寫 cyan／pink／yellow／purple，v2 對應到 A 的語意色） */
  accent: {
    pink: { fill: "#E8613C", text: "#C2441F", soft: "#FBE4DB" },
    yellow: { fill: "#F5B83D", text: "#8A5E00", soft: "#FCEBCB" },
    cyan: { fill: "#2A7F8F", text: "#1F6A78", soft: "#DCEEF0" },
    purple: { fill: "#7A6CA8", text: "#5A4D7A", soft: "#ECE7F3" },
  } as Record<string, AccentV2>,
  status: {
    fact: { zh: "已確定", bg: "#E2F0E7", fg: "#1E6544" },
    expected: { zh: "分析預期", bg: "#FCEBCB", fg: "#8A5300" },
    pending: { zh: "尚未確定", bg: "#ECE7F3", fg: "#5A4D7A" },
  } as Record<string, { zh: string; bg: string; fg: string }>,
  /** 政治題材兩黨（低飽和，需加文字標示） */
  dem: "#5B7BA8",
  rep: "#B0645C",
  /** 字幕關鍵詞色序：① 珊瑚字 ② 海軍藍字＋黃色螢光筆底 ③ 深青字 */
  kw: [
    { color: "#C2441F", mark: null as string | null },
    { color: "#14213D", mark: "rgba(245,184,61,0.80)" },
    { color: "#1F6A78", mark: null as string | null },
  ],
  /** 螢光筆底（標題重點、kicker 底線） */
  marker: "rgba(245,184,61,0.67)",
  /** 圖示：海軍藍方角線稿，下面墊錯位色塊（套印風），不發光 */
  icon: { stroke: "#14213D", strokeW: 6, blobOpacity: 0.9 },
  /** focus：其他項目降到這個透明度（v3：0.35→0.70；在卡片白底上主文字 5.9:1、次要字 #4B5675 3.5:1、輔助字 #5F6673 3.0:1，都 ≥3:1） */
  dim: 0.7,
  weight: { title: 900, body: 500, num: 800 },
  /** 2.5D：長陰影（45°，全片只用這一種）、透視、視差、堆疊卡 */
  depth: {
    shadowInk: "rgba(20,33,61,0.12)",
    shadowLen: 28,
    perspective: 1900,
    tiltX: 6,
    tiltEnter: 12,
    parallax: [0.2, 0.5, 1.0],
    drift: 60,
    /** 圖表的 2.5D 平移：整張圖表隨整幕由下往上漂移的總量（px；主視覺區上下各留 20px 餘裕） */
    panY: 36,
    stack: [{ dx: 18, dy: 18, scale: 0.96, opacity: 0.7 }, { dx: 36, dy: 36, scale: 0.92, opacity: 0.45 }],
  },
  /** 圖表：格線、軸標籤、未填格、非重點條透明度 */
  chart: {
    grid: "rgba(20,33,61,0.14)",
    axis: "#14213D",
    axisW: 3,
    label: "#4B5675",
    lineW: 9,
    areaTop: 0.18,
    areaBottom: 0.02,
    bandOpacity: 0.55,
    emptyCell: "rgba(20,33,61,0.25)",
    mute: 0.5,
  },
  /** 等角長條三面明度：top 往卡片白混、side 往墨色混 */
  iso: { top: 0.35, side: 0.28, skew: 30, depth: 56 },
} as const;
/** 色彩混合（#rrggbb）：t=0 → a，t=1 → b（等角三面明度、淡底用） */
export const mixHex = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
};
/** 45° 長陰影（多層位移 box-shadow，硬邊、墨色 12%） */
export const longShadowCss = (len: number = THEME_V2.depth.shadowLen, ink: string = THEME_V2.depth.shadowInk) =>
  Array.from({ length: Math.max(1, Math.round(len / 4)) }, (_, i) => `${(i + 1) * 4}px ${(i + 1) * 4}px 0 ${ink}`).join(", ");
export const accentV2 = (a?: string): AccentV2 => THEME_V2.accent[a ?? "pink"] ?? THEME_V2.accent.pink;

/**
 * v2 版面格線（全解析度座標；docs/layout-rules.md）。元件、字幕、來源列、audit 遮罩都讀這裡（audit.py 以 regex 解析本段數字，
 * 只寫「名稱: 數字」）。之後的新元件（KineticText、LineChart、UnitGrid、DepthStage、BarChart）也沿用這組常數。
 *  頁首帶 220–310｜主視覺區 330–1250｜字幕區 1270–1560｜出處帶 1580–1690｜1700–1920 只放背景層
 */
export const LAYOUT_V2 = {
  X: 64,
  X_RIGHT: 1016,
  SAFE_TOP: 220,
  SAFE_BOTTOM: 1700,
  HEADER_TOP: 220,
  RULE_Y: 310,
  CONTENT_TOP: 330,
  CONTENT_BOTTOM: 1250,
  SUB_TOP: 1270,
  SUB_BOTTOM: 1560,
  SUB_RIGHT: 960,
  SOURCE_TOP: 1580,
  SOURCE_BOTTOM: 1690,
  SUB_ZH_PX: 76,
  SUB_EN_PX: 30,
  /** 字幕短語每行上限（em；76px 時約 11 個全形字，874px < 896px） */
  SUB_MAX_EM: 11.5,
  /** 英文副字幕每段上限（字元） */
  SUB_EN_MAX: 42,
  /** 主視覺外框尺寸下限（鉤子／CTA 幕高 ≥ 45% 安全區即可） */
  MAIN_MIN_W: 856,
  MAIN_MIN_H: 814,
  /** 圖表繪圖區下限 */
  CHART_MIN_W: 856,
  CHART_MIN_H: 640,
  /** 空白帶上限：主視覺區內、安全區內、主視覺與字幕間距 */
  GAP_MAX_MAIN: 120,
  GAP_MAX_SAFE: 160,
  GAP_MAX_SUB: 140,
  /** 背景層：大字水印尺寸與透明度、色塊圓角 */
  WATERMARK_PX: 480,
  WATERMARK_OPACITY: 0.05,
  BLOCK_RADIUS: 40,
  /** 新元件（KineticText／LineChart／UnitGrid／DepthStage／BarChart）的區塊：全解析度 y */
  KT_TOP: 380,
  KT_BOTTOM: 1200,
  CHART_TITLE_TOP: 340,
  PLOT_TOP: 440,
  PLOT_BOTTOM: 1180,
  BAR_TOP: 400,
  DEPTH_TOP: 360,
  DEPTH_BOTTOM: 1180,
  FRONT_W: 856,
} as const;

// ───────────────────────── styleVersion 3：桌面紙拼貼（Paper Collage） ─────────────────────────
// v3 元件（src/components/v3/）的顏色、字級、版面一律讀這裡；紙材 PNG 由 scripts/make-paper.py 產生（色表兩邊要一致）。
// 來源：docs/style-v3/viral-style-research.md 方向 A、docs/style-v3/styleframes.md。不用漸層、發光、SVG 圖示。
import SKINS_V3 from "./theme-v3-skins.json";
export const THEME_V3 = {
  name: "桌面紙拼貼",
  desk: "#EFE6D4",
  mat: "#2F4A3A",
  paper: "#FFFDF7",
  kraft: "#C9A66B",
  red: "#D9482B",
  yellow: "#F2B632",
  blue: "#1F3A5F",
  mint: "#7DB7A0",
  ink: "#1E1B16",
  ink2: "#5B5245",
  ink3: "#3A342B",
  /** 深色底（切割墊）上的字 */
  onDark: "#FFFDF7",
  onDark2: "#F2E9D5",
  /** 出處紙條上的字 */
  srcInk: "#3A2F1C",
  /** script.json 的色名 → 色 */
  color: { ink: "#1E1B16", red: "#D9482B", yellow: "#F2B632", blue: "#1F3A5F", mint: "#7DB7A0", white: "#FFFDF7", ink2: "#5B5245" } as Record<string, string>,
  /** 手機螢幕（HTML 自製的中性介面，不是任何真實軟體） */
  screen: { bg: "#F4F2EC", card: "#FFFFFF", cardEdge: "#E4E1D8", ph: "#DDDBD4", ph2: "#E3E1DA", ph3: "#D5D3CC", text: "#1E1B16", text2: "#77746B", spin: "#7A7870", bubble: "#E6E3DA", bubbleMe: "#CFE3D8", fail: "#B3321A", failBg: "#FFFFFF" },
  weight: { zh: 900, en: 800, body: 700, enBody: 600 },
  /** 動作（幀）：一般貼上、重點重貼、滑入、退場、鏡頭移動、逐格更新間隔、落定後抖動間隔與幅度 */
  motion: { paste: 6, slam: 4, slide: 8, exit: 6, wipe: 8, camera: 12, step: 2, jitterEvery: 9, jitterPx: 1, jitterDeg: 0.3, slideDist: 900, punch: 0.96 },
  /** 外觀（script.json 頂層 skin）：每套只換色票與桌面紙紋，版面、動作不變。色名是「角色」：red＝強調、yellow＝螢光筆／便條、blue＝次要深色、mint＝第三色、kraft＝出處紙條。
   *  數值在 src/theme-v3-skins.json（scripts/make-paper.py 讀同一份，兩邊不會不一致） */
  skins: SKINS_V3 as Record<string, SkinV3>,
  /** 頻道頁首與片尾卡的預設文字（script.json 頂層 channel 可覆寫） */
  channel: { name: "白話國際", tag: "國際白話講", slogan: "一支講透一件事" },
} as const;
type V3Palette = { desk: string; mat: string; paper: string; kraft: string; red: string; yellow: string; blue: string; mint: string; ink: string; ink2: string; ink3: string; onDark: string; onDark2: string; srcInk: string };
export type SkinV3 = Partial<V3Palette> & { label: string; deskKind: string; deskLine?: string; deskDark?: boolean; headerPlate?: boolean; photo?: string; extra?: Record<string, string> };
export type ChannelV3 = { name: string; tag: string; slogan: string };
/** 套用 skin 後的 v3 主題：元件一律用 useT()（src/components/v3/assets.tsx）拿，不直接讀 THEME_V3 的色票 */
export type ThemeV3 = Omit<typeof THEME_V3, keyof V3Palette | "color" | "skins" | "channel"> & V3Palette & { color: Record<string, string>; skin: string; deskDark: boolean; headerPlate: boolean };
const PALETTE_KEYS = ["desk", "mat", "paper", "kraft", "red", "yellow", "blue", "mint", "ink", "ink2", "ink3", "onDark", "onDark2", "srcInk"] as const;
const themeCache: Record<string, ThemeV3> = {};
export const themeV3 = (skin?: string): ThemeV3 => {
  const name = skin && THEME_V3.skins[skin] ? skin : "desk";
  if (themeCache[name]) return themeCache[name];
  const sk = THEME_V3.skins[name] ?? { label: "", deskKind: "plain" };
  const pal = Object.fromEntries(PALETTE_KEYS.map((k) => [k, sk[k] ?? THEME_V3[k]])) as V3Palette;
  const color = name === "desk" ? THEME_V3.color : { ink: pal.ink, red: pal.red, yellow: pal.yellow, blue: pal.blue, mint: pal.mint, white: pal.paper, ink2: pal.ink2, ink3: pal.ink3, kraft: pal.kraft };
  return (themeCache[name] = { ...THEME_V3, ...pal, color, skin: name, deskDark: !!sk.deskDark, headerPlate: !!sk.headerPlate });
};
export const channelV3 = (c?: Partial<ChannelV3> | null): ChannelV3 => ({ ...THEME_V3.channel, ...(c ?? {}) });
/** v3 版面（1080×1920；安全區上下 220、左右 64） */
export const LAYOUT_V3 = {
  W: 1080,
  H: 1920,
  X: 64,
  SAFE_TOP: 220,
  SAFE_BOTTOM: 1700,
  HEADER_TOP: 228,
  HEADER_H: 64,
  /** 字幕紙條（紙本體）：1300–1532 */
  CAP_X: 64,
  CAP_TOP: 1300,
  CAP_W: 952,
  CAP_H: 232,
  CAP_ZH_PX: 72,
  CAP_EN_PX: 30,
  /** 出處紙條（紙本體左上） */
  SRC_X: 64,
  SRC_TOP: 1601,
  SRC_H: 62,
  SRC_PX: 24,
  /** 主視覺可用區（頁首下緣到字幕紙條上緣） */
  MAIN_TOP: 310,
  MAIN_BOTTOM: 1280,
  /** 手機螢幕內容的設計寬度（px；PhoneMock 依手機寬度等比縮放） */
  SCREEN_W: 526,
  /** 手機螢幕在機身內的比例（左、上、右、下；make-paper.py 的 phone） */
  SCREEN_BOX: [0.062, 0.088, 0.938, 0.868],
} as const;
