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

// ───────────────────────── 仿介面動畫（styleVersion 3 ＋ stage: "ui"；src/components/ui/） ─────────────────────────
/** 深色的自製介面：視窗、輸入框、游標、欄位、流程節點。元件只讀這裡的 token，不寫死色碼；不用發光、不用 3D。 */
export const THEME_UI = {
  bg: "#0E1016",
  dot: "#1B1F2A",
  panel: "#171A23",
  panel2: "#1F2330",
  field: "#12141B",
  line: "#2D3345",
  lineSoft: "#232838",
  text: "#F2F4F8",
  text2: "#A3ABBD",
  text3: "#6A7387",
  onAccent: "#0E1016",
  /** 強調色（角色）：script.json 的 color 寫這些名字；fill＝色塊、text＝深底上的字、soft＝淡底 */
  accent: {
    violet: { fill: "#8B7CFF", text: "#B9B0FF", soft: "#221F3D" },
    blue: { fill: "#4DA8FF", text: "#8CC6FF", soft: "#152A40" },
    green: { fill: "#3DD68C", text: "#7BE6B2", soft: "#12301F" },
    amber: { fill: "#FFB84D", text: "#FFD08A", soft: "#382A12" },
    coral: { fill: "#FF6B6B", text: "#FF9C9C", soft: "#3A1A1C" },
  } as Record<string, { fill: string; text: string; soft: string }>,
  radius: { window: 36, card: 24, chip: 16, pill: 999 },
  shadow: "0 24px 60px rgba(0,0,0,0.45)",
  weight: { zh: 900, body: 700, light: 500 },
  /** 動作（幀）：進場 8、退場 6、游標移動 14、點擊波紋 10、鏡頭 14、每字打字 2 */
  motion: { in: 8, out: 6, cursor: 14, click: 10, camera: 14, perChar: 2 },
} as const;
export const accentUI = (c?: string) => THEME_UI.accent[c ?? "violet"] ?? THEME_UI.accent.violet;
/** 仿介面動畫版面（1080×1920；安全區上下 220、左右 64） */
export const LAYOUT_UI = {
  W: 1080, H: 1920, X: 64, INNER_W: 952,
  HEADER_TOP: 228, HEADER_H: 64, PROGRESS_TOP: 304,
  MAIN_TOP: 330, MAIN_BOTTOM: 1250,
  CAP_TOP: 1290, CAP_H: 236, CAP_ZH_PX: 70, CAP_EN_PX: 30,
  SRC_TOP: 1552, SRC_PX: 28,
} as const;

// ───────────────────────── stage: "chat"：對話泡泡（感情頻道風格試片） ─────────────────────────
// 元件在 src/components/chat/，顏色與版面一律讀這裡。整個畫面是一個自製的中性聊天介面（不仿任何真實通訊軟體、不放商標）：
// 上面聯絡人列、中間對話串、下面輸入框，最下面深色面板放旁白字幕與出處。時間軸沿用 styleVersion 3 的整篇配音流程。
export const THEME_CHAT = {
  name: "對話泡泡",
  /** 對話串底色與底紋圓點 */
  screen: "#FFF4EE",
  wall: "#F6E4DB",
  /** 聯絡人列、輸入框 */
  bar: "#FFFFFF",
  barLine: "#F1E1D9",
  field: "#F8EEE9",
  ink: "#2B1E33",
  ink2: "#7C6B83",
  ink3: "#B3A5B8",
  /** 自己的泡泡（珊瑚紅）、對方的泡泡（白） */
  me: "#F0525A",
  meText: "#FFFFFF",
  them: "#FFFFFF",
  themText: "#2B1E33",
  /** 強調色：珊瑚、暖黃（深色面板上的關鍵詞）、淡紫（頭像）、薄荷（上線中） */
  accent: "#F0525A",
  gold: "#FFC857",
  lilac: "#B7A3E6",
  mint: "#4FC79A",
  /** 統計卡：沒上色的人形、遮罩 */
  dotOff: "#EADFE6",
  scrim: "rgba(43, 30, 51, 0.42)",
  /** 下方旁白面板（深梅子色） */
  sheet: "#2B1E33",
  sheetLine: "#4A3A54",
  sheetText: "#FFFFFF",
  sheetText2: "#CBBDD2",
  /** 出處列的字（比 sheetText2 亮）、面板底部的頻道水印 */
  sheetText3: "#E9E1ED",
  sheetMark: "#3A2B44",
  /** 聯絡人列上方的色帶（安全區 0–214，只放底色、圓點與頻道水印） */
  band: "#F0525A",
  bandDot: "rgba(255, 255, 255, 0.16)",
  bandMark: "rgba(255, 255, 255, 0.26)",
  shadow: "0 6px 0 rgba(43, 30, 51, 0.06), 0 14px 34px rgba(43, 30, 51, 0.10)",
  shadowCard: "0 30px 80px rgba(43, 30, 51, 0.30)",
  weight: { zh: 900, body: 700, en: 600 },
} as const;
/** 對話泡泡版面（1080×1920；安全區上下 220、左右 64） */
export const LAYOUT_CHAT = {
  /** 聯絡人列：0–330（內容中線 276） */
  BAR_H: 330,
  BAR_MID: 272,
  /** 上方色帶 0–214、下方水印中線 1800 */
  BAND_H: 214,
  MARK_Y: 1800,
  SRC_LH: 38,
  /** 統計卡人形寬 */
  STAT_PERSON: 76,
  /** 對話串可視區：330–1198 */
  VIEW_TOP: 330,
  VIEW_H: 868,
  PAD_X: 64,
  PAD_BOTTOM: 26,
  /** 輸入框：1198–1310 */
  INPUT_TOP: 1198,
  INPUT_H: 112,
  /** 旁白面板：1310 到底；字幕中文 84px 中線 1447、英文 1522、出處 1606 起（最多兩行，到 1682）；1700 以下只放水印 */
  SHEET_TOP: 1310,
  SHEET_R: 44,
  TAG_Y: 1338,
  ZH_Y: 1392,
  ZH_PX: 84,
  EN_Y: 1522,
  EN_PX: 30,
  SRC_Y: 1606,
  SRC_PX: 28,
  /** 泡泡：字 54px、行高 70、內距 24×34、圓角 42；同一邊相鄰 14、換邊 30 */
  BUBBLE_PX: 54,
  BUBBLE_LH: 70,
  BUBBLE_PAD_Y: 24,
  BUBBLE_PAD_X: 34,
  BUBBLE_R: 42,
  GAP_SAME: 14,
  GAP_TURN: 30,
  AVATAR: 76,
  DATE_H: 64,
  CARD_W: 660,
  CARD_H: 404,
  /** 統計卡（蓋住對話串與輸入框） */
  STAT_X: 64,
  STAT_TOP: 352,
  STAT_H: 936,
} as const;

// ───────────────────────── stage: "three"：3D 產品台（科技頻道風格試片；對外稱 v4） ─────────────────────────
// 元件在 src/components/three/（全專案只有這個資料夾可以用 three.js／@remotion/three）。淺色攝影棚、風格化的實心模型：
// 產品在轉盤上轉、躺下後沿厚度方向一層層分開、零件貼標籤。沒有擬真反光與陰影貼圖（這台機器沒有顯示卡）。時間軸沿用 styleVersion 3 的整篇配音流程。
export const THEME_3D = {
  name: "3D 產品台",
  /** 攝影棚：背景、地面色帶、格線 */
  bg: "#EEF1F5",
  floor: "#E1E6ED",
  grid: "#D5DCE5",
  ink: "#111827",
  ink2: "#4B5563",
  ink3: "#8792A3",
  panel: "#FFFFFF",
  line: "#D5DBE4",
  onAccent: "#FFFFFF",
  /** 強調色（角色）：script.json 的 color 寫這些名字 */
  accent: {
    amber: { fill: "#E8890C", text: "#A85F00", soft: "#FDEFD3" },
    blue: { fill: "#2F80ED", text: "#1B5FC0", soft: "#DCEBFF" },
    coral: { fill: "#F0553A", text: "#C4381F", soft: "#FFE4DD" },
    mint: { fill: "#1FB58A", text: "#0E7F5F", soft: "#D8F5EA" },
  } as Record<string, { fill: string; text: string; soft: string }>,
  /** 模型各零件的顏色 */
  part: {
    back: "#2C3648", island: "#232B3A", lens: "#0C1118", lensRing: "#9AA5B8",
    battery: "#454E60", batteryBand: "#1FB58A", board: "#1E7B64", boardPart: "#141A24", chip: "#596579", chipTop: "#B8C2D2",
    plate: "#D9A066", plateRim: "#C48A4E", plateFloor: "#9A6B42", wick: "#B98556",
    frame: "#AEB8C8", screen: "#10151F", screenUi: "#2F80ED", screenUi2: "#7FB4FF", screenUi3: "#E8890C",
    water: "#3BA4FF", vapor: "#FFFFFF", hot: "#FF5230", warm: "#F29A5C", shadow: "#0B1220",
    /** 自發光畫面（材質 kind: "screen"）的底色：近黑，玻璃反光才看得出來 */
    screenBase: "#05070B",
  },
  /** 程式畫的攝影棚環境貼圖（256×128 的全景）：天、中段、地平線下、地面的顏色；boxes＝柔光箱、flags＝黑旗（讓金屬有明暗對比），[x, y, 寬, 高] */
  env: {
    sky: "#FFFFFF", mid: "#DCE3EC", ground: "#8D97A6", floor: "#5B6575", box: "#FFFFFF", dark: "#1F2632",
    boxes: [[20, 8, 60, 26], [150, 4, 44, 34], [222, 30, 26, 30], [96, 40, 20, 18]] as number[][],
    flags: [[84, 30, 8, 36], [200, 40, 10, 30], [0, 44, 14, 22]] as number[][],
  },
  /** 特效開關（model.json 的 fx 可以蓋掉；node scripts/three/bench-fx.mjs 逐項量成本）。數字的意義見 docs/three-stage.md */
  fx: {
    pbr: false, env: true, clearcoat: true, textures: true, shadows: 1, shadowSoft: true, shadowSize: 1024, fog: true, sweep: true, glow: true,
    vaporSprites: true, shimmer: true, ghost: true, guides: true, dust: true, sheen: true, backdropBlur: 0, vignette: true,
    transmission: false, dpr: 1.35, msaa: false,
  },
  /** 霧（景深感的替代品）：遠處的零件往背景色靠。near／far 是「離鏡頭比模型中心遠多少」，立著／分解／聚焦三個狀態 */
  fog: { color: "#E6EAF0", stand: [2, 60], explode: [-2, 34], focus: [-1, 20] },
  /** 地面：陰影濃度、躺下後離地多高 */
  ground: { shadow: 0.2, float: 1.1, size: 44, blob: 0.075 },
  /** 便宜材質（Phong）的換算：金屬底色加亮、高光銳利度（一般／清漆）、高光強度（金屬／清漆／一般）、環境反光強度（清漆是加上去、金屬是乘上去） */
  phong: { metalBoost: 1.35, shine: 160, shineCoat: 420, specMetal: 0.9, specCoat: 0.9, specPlain: 0.35, envCoat: 0.07, envMetal: 0.8 },
  /** 聚焦時四角壓暗的漸層（中間透明 → 邊緣） */
  vignette: ["rgba(17, 24, 39, 0)", "rgba(17, 24, 39, 0.16)"],
  /** 光掃（聚光燈）強度與張角、熱點的點光強度、熱浪粒子最大不透明度、蒸氣團不透明度 */
  sweepLight: { intensity: 5, angle: 0.3, height: 9 },
  glow: 14,
  shimmer: 0.15,
  puff: 0.5,
  /** 微塵光斑：顆數、開場／收尾時與平常的不透明度 */
  dust: { n: 16, peak: 0.75, rest: 0.25, color: "#FFFFFF" },
  /** 運作動畫（model.json 的 actions）：進出場幀數、軌道線粗細與不透明度、聲波圈線寬與不透明度、波形線粗細、光暈不透明度、發光時零件本色留多少、音量條最短留多少 */
  ops: { ramp: 8, track: 0.05, trackO: 0.55, ring: 0.09, ringO: 0.85, trace: 0.07, axis: 0.02, axisO: 0.55, halo: 0.6, keep: 0.35, meterMin: 0.03 },
  /** 燈光強度：環境、主燈、補燈 */
  light: { ambient: 1.25, key: 2.5, fill: 0.8, env: 0.9, keyPos: [9, 22, 13] },
  /** 退到背景的零件透明度、地面假陰影透明度 */
  dim: 0.22,
  shadow: 0.07,
  /** 念到「燙」時板子變透明的程度（露出下面的晶片）；3D 畫布的像素倍率（2＝兩倍渲染再縮小，邊緣比較平滑） */
  xray: 0.72,
  dpr: 2,
  radius: { card: 28, chip: 18, pill: 999 },
  cardShadow: "0 18px 44px rgba(17, 24, 39, 0.10)",
  weight: { zh: 900, body: 700, light: 500 },
  /** 動作（幀）：進場 8、躺下 22、每層分開 22（層與層錯開 3）、聚焦 20、掀蓋 16、粒子 26 */
  motion: { in: 8, lay: 22, explode: 22, stagger: 3, focus: 20, lid: 16, flow: 26, peek: 12, orbit: 34, cool: 18, sweep: 18, outro: 20, leader: 9 },
  /** 鏡頭（視角 fov、距離 d、仰角 elev 度、看向的高度 y）：立著轉、分解、聚焦三個狀態 */
  camera: {
    fov: 26,
    stand: { d: 44, elev: 5, y: 2.05 },
    explode: { d: 56, elev: 26, y: 0.4 },
    focus: { d: 35, elev: 38, y: -1.6 },
    /** 後段的兩次鏡頭變化（加在聚焦狀態上的增量）：繞開拉遠看整片板子、再推回熱點 */
    orbit: { d: 6, elev: -5, y: -0.6, yaw: 0.3 },
    settle: { d: -7, elev: 4, y: 0.9, yaw: 0.14 },
    /** 收尾時鏡頭往後退多少 */
    outro: { d: 3 },
  },
  /** 模型姿態：起始偏轉、躺下後的俯仰與偏轉（弧度）、層距、每幀慢轉 */
  pose: { yaw0: -0.42, pitch: -1.22, yawIso: 0.66, gap: 3.1, drift: 0.0009, peekYaw: -0.12, focusUp: 7, focusDown: 3 },
} as const;
export const accent3D = (c?: string) => THEME_3D.accent[c ?? "amber"] ?? THEME_3D.accent.amber;
/** 3D 產品台版面（1080×1920；安全區上下 220、左右 64）：頁首 228–308｜3D 舞台 300–1290（整個寬度）｜字幕卡 1296–1532｜出處 1560 */
export const LAYOUT_3D = {
  W: 1080, H: 1920, X: 64, INNER_W: 952,
  HEADER_TOP: 228, HEADER_H: 64, PROGRESS_TOP: 304,
  STAGE_TOP: 300, STAGE_H: 990,
  CAP_TOP: 1296, CAP_H: 236, CAP_ZH_PX: 72, CAP_EN_PX: 30,
  SRC_TOP: 1560, SRC_PX: 24,
  /** 鉤子大標的位置、標籤離右側安全區再多留的寬度、立著時腳下影子的寬度 */
  HOOK_TOP: 322, LABEL_PAD: 30, FOOT_W: 560,
} as const;

/** stage "three" 的深色科技 HUD 與 Powers of Ten 縮放（script.json 頂層 hud: { theme: "dark", levels }；src/components/three/Hud.tsx）。
 *  只是新增，沒寫 hud 的片完全不讀這裡。HUD 是細線 UI（1.5–3px、實色），不用發光濾鏡。 */
export const THEME_3D_HUD = {
  bg: "#070B12",
  bg2: "#0C1420",
  grid: "#122030",
  line: "#3FC8DC",
  lineSoft: "#1E5E6E",
  amber: "#F2A93B",
  amberSoft: "#6E4C1C",
  text: "#E6F1F8",
  text2: "#8FA6B8",
  text3: "#5D7488",
  panel: "#0B1724",
  /** 第三個強調色（衝突點的蓋章）、實心色塊上的深色字、假光暈（3D 外圈的 drop-shadow 與舞台中心的柔光，不是 3D bloom） */
  coral: "#FF6B4A",
  onAccent: "#071018",
  glow: { rim: "rgba(63, 200, 220, 0.55)", rimPx: 14, center: "rgba(63, 200, 220, 0.16)", warm: "rgba(242, 169, 59, 0.12)" },
  /** 2D 縮放圖層的畫法用色（手機、主機板、晶片、陣列） */
  art: { body: "#1A2533", edge: "#3A4E66", board: "#123A33", trace: "#2E7D6E", part: "#22303F", die: "#1B2738", block: "#24405A", block2: "#3B2E1A", gate: "#C98A2E", sheet: "#3FC8DC", sd: "#2F6FB0", via: "#C8794A", sub: "#2A3646" },
  /** 線寬、掃描線（間距 px、不透明度、每秒往下掃幾 px）、角框長度、尺標高度 */
  stroke: { thin: 1.5, mid: 2, bold: 3 },
  scan: { gap: 6, opacity: 0.06, sweep: 420, bandH: 120, bandO: 0.08 },
  bracket: 56,
  ruler: { h: 18, ticks: 10 },
  /** 字：讀數用等寬英數、標題用中文 */
  font: { mono: "'JetBrains Mono', 'Inter', monospace", px: { readout: 30, label: 34, big: 64 } },
  /** 動作（幀）：每一級縮放、交棒給 3D 的淡入、讀數跳字 */
  motion: { zoom: 20, handoff: 12, tick: 2, drift: 0.12 },
} as const;

// ───────────────────────── stage: "chart"：資料圖表主導（股票頻道風格試片；src/components/chartlead/） ─────────────────────────
/** 整個畫面是一張會動的圖表：深色看盤底、細格線、等寬數字。台股慣例紅色＝上漲。元件只讀這裡的 token，不寫死色碼；不用發光、不用 3D。 */
export const THEME_CHARTLEAD = {
  name: "資料圖表主導",
  bg: "#0A0F0D",
  grid: "#141D19",
  panel: "#101714",
  rule: "#26332D",
  ruleSoft: "#1A2420",
  text: "#EEF2EC",
  text2: "#9DAAA2",
  text3: "#66736C",
  onAccent: "#0A0F0D",
  /** 上漲（台股慣例紅色）：階梯線、漲幅長條 */
  up: "#FF4D4F",
  upText: "#FF8587",
  upSoft: "#2A1213",
  /** 讀數與時間長條（琥珀） */
  amber: "#FFB000",
  amberText: "#FFC94D",
  amberSoft: "#2E2408",
  radius: { chip: 6, bar: 3 },
  weight: { zh: 900, body: 700, light: 500 },
  stroke: { line: 7, lineDim: 4, grid: 2, target: 3 },
  /** 沒被講到的東西降到這個不透明度 */
  dim: 0.38,
  /** 動作（幀）：進場 8、時間軸縮放 18、台階往上 6、長條長出 12、標籤 6 */
  motion: { in: 8, zoom: 18, rise: 6, bar: 12, label: 6 },
} as const;
/** 資料圖表主導版面（1080×1920；安全區上下 220、左右 64） */
export const LAYOUT_CHARTLEAD = {
  W: 1080, H: 1920, X: 64, INNER_W: 952,
  HEADER_TOP: 228, HEADER_H: 64, PROGRESS_TOP: 304,
  /** 圖表標題 326–450（第 0 幀就是帶數字的主張） */
  KICKER_TOP: 326, KICKER_PX: 28, TITLE_TOP: 360, TITLE_PX: 72,
  /** 讀數放在繪圖區左上角的空位（階梯從左下走到右上）：標籤一行、數字一行 */
  READ_X: 196, READ_TOP: 484, READ_H: 84, READ_PX: 80, READ_TAG_PX: 34, READ_TAG_H: 50,
  /** 階梯圖繪圖區 470–1090（高 620；y 軸標籤在左邊 64–160） */
  PLOT_X0: 176, PLOT_X1: 1000, PLOT_TOP: 470, PLOT_BOTTOM: 1090,
  /** y 軸範圍留白：最低關卡下面留 0.45 格、最高關卡上面留 1.25 格（上面放讀數） */
  Y_PAD: 0.45, Y_PAD_TOP: 1.25, Y_LABEL_PX: 36, TICK_TOP: 1094, TICK_PX: 28, NOTE_TOP: 1142, NOTE_PX: 28,
  /** 長條區 1200–1392：小標＋三列 */
  BARS_TOP: 1200, BARS_HEAD_PX: 30, ROW_TOP: 1246, ROW_GAP: 50, ROW_H: 46, BAR_X: 270, BAR_W: 440, ROW_PX: 38,
  CAP_TOP: 1416, CAP_H: 220, CAP_ZH_PX: 74, CAP_EN_PX: 30,
  SRC_TOP: 1650, SRC_PX: 28,
} as const;

// ───────────────────────── stage: "type"：動態大字（AI 教學頻道風格試片；src/components/ai-type/） ─────────────────────────
/** 全螢幕大字跟著旁白一個字一個字出現：只有兩種底（墨黑／紙白）、一個主強調色（橘紅）、四個欄位色。元件只讀這裡的 token。不用漸層、發光、3D。 */
export const THEME_TYPE = {
  /** 底色（script.json 每幕的 ground）：fg＝主字、fg2＝次要字、fg3＝退下去的字與空心字描邊、rule＝細線 */
  grounds: {
    ink: { bg: "#0E0E10", fg: "#F4F1EA", fg2: "#A29F97", fg3: "#5F5D58", rule: "#2C2C30" },
    paper: { bg: "#F2EEE6", fg: "#0E0E10", fg2: "#57544E", fg3: "#A9A49A", rule: "#D8D2C6" },
  } as Record<string, { bg: string; fg: string; fg2: string; fg3: string; rule: string }>,
  /** 強調色（script.json 的 color）：fill＝色塊、on＝色塊上的字、text＝直接放在墨黑／紙白底上的字 */
  accent: {
    hot: { fill: "#FF4D1A", on: "#0E0E10", text: { ink: "#FF5A2A", paper: "#E53A08" } },
    blue: { fill: "#2F5BFF", on: "#F4F1EA", text: { ink: "#8AA2FF", paper: "#2447E0" } },
    green: { fill: "#14B887", on: "#0E0E10", text: { ink: "#3FD6A6", paper: "#0B8560" } },
    yellow: { fill: "#FFC61A", on: "#0E0E10", text: { ink: "#FFD145", paper: "#8A6500" } },
  } as Record<string, { fill: string; on: string; text: Record<string, string> }>,
  weight: { zh: 900, body: 700, en: 800, enBody: 600 },
  /** 空心字描邊（px） */
  stroke: 3,
  /** 動作（幀）：單字落定 5、整詞砸下 7、退場 6、換底 9、移動 10、劃線 7、打字每字 2 */
  motion: { char: 5, slam: 7, exit: 6, wipe: 9, move: 10, strike: 7, step: 2 },
} as const;
/** 動態大字版面（1080×1920；安全區上下 220、左右 64；所有字靠左對齊 x＝64） */
export const LAYOUT_TYPE = {
  W: 1080, H: 1920, X: 64, INNER_W: 952,
  HEADER_TOP: 228, HEADER_H: 64, PROGRESS_TOP: 304,
  MAIN_TOP: 320, MAIN_BOTTOM: 1540,
  EN_TOP: 1586, EN_PX: 30, SRC_TOP: 1644, SRC_PX: 24,
} as const;

// ───────────────────────── stage: "sketch"：白板手繪（AI 教學頻道風格試片；src/components/ai-sketch/） ─────────────────────────
/** 點點方格紙底＋麥克筆線條：線一筆一筆描出來、字一個一個寫出來。元件只讀這裡的 token，不寫死色碼；不用陰影、漸層、3D。 */
export const THEME_SKETCH = {
  board: "#F6F4EC",
  dot: "#D9D5C7",
  rule: "#CFCABA",
  /** 筆的顏色（角色）：script.json 的 color 寫這些名字 */
  pen: {
    ink: "#20242C", ink2: "#5B6270", ink3: "#9A9FA8",
    red: "#E0412F", blue: "#2563D9", green: "#1F9A55", amber: "#E08A00", violet: "#7A4FD6",
  } as Record<string, string>,
  /** 螢光筆（半透明塗色）：字的底、欄位的底 */
  marker: {
    yellow: "#FFE14D", red: "#FFB3A8", blue: "#A9C8FF", green: "#A8E3BF", amber: "#FFD48A", violet: "#D0BDFA",
  } as Record<string, string>,
  markerOpacity: 0.62,
  /** 線寬：一般筆、粗筆、螢光筆 */
  stroke: { pen: 7, bold: 10, marker: 30 },
  /** 手抖：端點抖動 px、彎度（線長比例）、每個字的旋轉度數與上下位移 px */
  wobble: { jitter: 3.2, bow: 0.012, charRot: 2.2, charDy: 3 },
  /** 動作（幀）：描線速度 px/幀、每個字 2 幀、鏡頭 16；線畫完後每 6 幀輕微重描一次（±1.1px）讓畫面不死掉 */
  motion: { drawSpeed: 150, drawMin: 5, drawMax: 16, perChar: 2, camera: 16, boilEvery: 6, boilAmp: 1.1, boilPhases: 3 },
  /** 字加粗（text-stroke，px 佔字級比例）讓楷體像麥克筆 */
  textStroke: 0.022,
} as const;
export const penSketch = (c?: string) => THEME_SKETCH.pen[c ?? "ink"] ?? THEME_SKETCH.pen.ink;
export const markerSketch = (c?: string) => THEME_SKETCH.marker[c ?? "yellow"] ?? THEME_SKETCH.marker.yellow;
export const FONT_SKETCH_ZH = `"SketchKai", ${FONT_ZH}`;
export const FONT_SKETCH_EN = `"SketchHand", "SketchKai", ${FONT_EN}`;
/** 白板手繪版面（1080×1920；安全區上下 220、左右 64）。主畫面是一塊比螢幕大的板子，鏡頭在上面移動 */
export const LAYOUT_SKETCH = {
  W: 1080, H: 1920, X: 64, INNER_W: 952,
  HEADER_TOP: 226, HEADER_H: 70, PROGRESS_TOP: 306,
  MAIN_TOP: 336, MAIN_H: 920,
  RULE_Y: 1276,
  CAP_TOP: 1300, CAP_ZH_PX: 74, CAP_EN_TOP: 1420, CAP_EN_PX: 44,
  SRC_TOP: 1600, SRC_PX: 30,
  GRID: 40,
} as const;

// ───────────────────────── stage: "split"：前後對照分割畫面（AI 教學頻道風格試片；src/components/ai-split/） ───────────
/** 淺色底上兩塊面板：上半「隨便問」是灰階、下半「這樣問」是白底加四個欄位色；中間一條可滑動的分隔線。元件只讀這裡的 token。不用發光、漸層、3D。 */
export const THEME_SPLIT = {
  bg: "#ECEEF3",
  ink: "#10131A",
  ink2: "#4A5162",
  ink3: "#8A91A1",
  onInk: "#FFFFFF",
  /** 字幕關鍵詞的螢光筆底 */
  key: "#FFD84A",
  /** 上半（隨便問）：全部灰階 */
  bad: { panel: "#D6DAE2", card: "#E9ECF1", line: "#B9BFCB", text: "#3C4352", text2: "#6C7384", pill: "#7C8494", stamp: "#4A5162" },
  /** 下半（這樣問）：白底、墨色標籤 */
  good: { panel: "#FFFFFF", card: "#F4F6FA", line: "#D9DEE7", text: "#10131A", text2: "#4A5162", pill: "#10131A", ghost: "#B4BBC8" },
  /** 欄位色（script.json 的 color）：fill＝色塊、on＝色塊上的字、soft＝淡底、text＝白底上的字 */
  accent: {
    violet: { fill: "#6B4DFF", on: "#FFFFFF", soft: "#ECE8FF", text: "#4A2FD6" },
    blue: { fill: "#1C7BEA", on: "#FFFFFF", soft: "#E3F0FF", text: "#0E5BB8" },
    green: { fill: "#0FA36B", on: "#FFFFFF", soft: "#DFF5EA", text: "#0A7A4F" },
    amber: { fill: "#F2A900", on: "#10131A", soft: "#FFF1D1", text: "#8F5E00" },
  } as Record<string, { fill: string; on: string; soft: string; text: string }>,
  radius: { panel: 36, card: 22, chip: 16, pill: 999 },
  shadow: "0 18px 48px rgba(16,19,26,0.14)",
  weight: { zh: 900, body: 700, light: 500, en: 800 },
  /** 動作（幀）：進場 8、分隔線滑動 16、欄位變形 12、推滿 18、每字打字 1 */
  motion: { in: 8, slide: 16, morph: 12, full: 18, perChar: 1 },
} as const;
export const accentSplit = (c?: string) => THEME_SPLIT.accent[c ?? "violet"] ?? THEME_SPLIT.accent.violet;
/** 分割畫面版面（1080×1920；安全區上下 220、左右 64）。STAGE＝兩塊面板加分隔線；GAP＝分隔線佔的高度 */
export const LAYOUT_SPLIT = {
  W: 1080, H: 1920, X: 64, INNER_W: 952,
  HEADER_TOP: 228, HEADER_H: 64, PROGRESS_TOP: 304,
  STAGE_TOP: 326, STAGE_BOTTOM: 1296, GAP: 28, PAD: 36,
  CAP_ZH_TOP: 1336, CAP_ZH_PX: 68, CAP_EN_TOP: 1448, CAP_EN_PX: 30,
  SRC_TOP: 1624, SRC_PX: 26,
} as const;

// ───────────────────────── stage: "bright"：亮色產品發表風（AI 教學頻道風格試片；src/components/ai-bright/） ─────────────────────────
/** 淺色底＋一個主色（靛藍）＋一個輔色（珊瑚橘）：圓角大卡片、柔和陰影、淡淡的光暈；提示詞與回答是大字卡，不是軟體視窗。元件只讀這裡的 token。 */
export const THEME_BRIGHT = {
  /** 底：暖白；card＝卡片白；line＝細線與虛線框 */
  bg: "#F7F5F0", card: "#FFFFFF", line: "#E4E0D6",
  /** 字：ink 主字、ink2 次要字、ink3 輔助字（在底色上對比 ≥4.5:1） */
  ink: "#14162B", ink2: "#4E526B", ink3: "#6C7088",
  /** 兩個顏色（script.json 的 color 寫 primary｜accent）：fill＝色塊、on＝色塊上的字、text＝白底上的字、soft＝螢光標記與淡色標籤底 */
  color: {
    primary: { fill: "#4F46FF", on: "#FFFFFF", text: "#3A31E0", soft: "#E3E1FF" },
    accent: { fill: "#FF5C39", on: "#FFFFFF", text: "#D63A14", soft: "#FFDACF" },
  } as Record<string, { fill: string; on: string; text: string; soft: string }>,
  /** 背景光暈的透明度（主色在右上、輔色在左下，慢慢漂） */
  glow: { primary: 0.2, accent: 0.16, drift: 46, period: 210 },
  /** 陰影：card＝白卡片；lift＝浮在上面的色卡（陰影帶一點該卡的顏色，透明度在這裡） */
  shadow: { card: "0 34px 80px rgba(20,22,43,0.10), 0 8px 20px rgba(20,22,43,0.05)", liftY: 30, liftBlur: 64, liftAlpha: 0.34 },
  radius: { card: 52, inner: 28, pill: 999, mark: 16 },
  weight: { title: 900, strong: 800, body: 600, num: 800 },
  /** 動作（幀）：卡片滑入位移 150px、退場 8 幀往上 70px、螢光標記抹出 9、劃線 7、數字跳動 16、打字每字 2、卡片之間錯開 4 */
  motion: { slide: 150, exit: 8, exitRise: 70, mark: 9, strike: 7, count: 16, step: 2, stagger: 4 },
} as const;
/** 亮色產品發表風版面（1080×1920；安全區上下 220、左右 64） */
export const LAYOUT_BRIGHT = {
  W: 1080, H: 1920, X: 64, INNER_W: 952,
  HEADER_TOP: 228, HEADER_H: 60, PROGRESS_TOP: 304,
  MAIN_TOP: 336, MAIN_BOTTOM: 1250,
  CAP_TOP: 1290, CAP_H: 236, CAP_ZH_PX: 70, CAP_EN_PX: 32,
  SRC_TOP: 1562, SRC_PX: 28, MIN_PX: 28,
} as const;

// ───────── 亮色雜誌編排（styleVersion 3 ＋ stage: "editorial"；src/components/ai-editorial/） ─────────
export const THEME_EDITORIAL = {
  /** 底：米白；clip＝被剪下的引文底（比底再白一階） */
  paper: "#F3EFE6", clip: "#FFFFFF",
  /** 字與線：ink 主字與粗線、ink2 次要字、ink3 輔助字（米白底上對比 ≥4.5:1）、hair＝細欄線 */
  ink: "#111111", ink2: "#4A4741", ink3: "#6A665E", hair: "#CFC8B8",
  /** 唯一的強調色（番茄紅）：fill＝色塊與色筆線、text＝米白底上的字、on＝色塊上的字、onDim＝色塊上的次要字 */
  accent: { fill: "#E5351B", text: "#C22A12", on: "#FFFFFF", onDim: "#FFE1DA" },
  weight: { title: 900, strong: 800, body: 600, light: 500 },
  /** 線寬：粗線、細線、色筆線 */
  rule: { thick: 6, hair: 2, pen: 14 },
  /** 動作（幀）：線長出來 10、字從遮罩升起 9、色筆線 8、劃掉 7、整頁退場 6、數字跳動 14、打字每字 2、同頁元素錯開 3 */
  motion: { rule: 10, rise: 9, pen: 8, strike: 7, exit: 6, count: 14, step: 2, stagger: 3 },
} as const;
/** 亮色雜誌編排版面（1080×1920；安全區上下 220、左右 64） */
export const LAYOUT_EDITORIAL = {
  W: 1080, H: 1920, X: 64, INNER_W: 952, COL_GAP: 48,
  HEADER_TOP: 228, HEADER_H: 56, PROGRESS_TOP: 300,
  MAIN_TOP: 336, MAIN_BOTTOM: 1250,
  CAP_TOP: 1284, CAP_ZH_PX: 68, CAP_EN_PX: 30,
  SRC_TOP: 1590, SRC_PX: 28, MIN_PX: 28,
} as const;

// ───────── 亮色 2.5D 小場景（styleVersion 3 ＋ stage: "iso"；src/components/ai-iso/） ─────────
/** 粉彩等距（isometric）小桌面：一張桌子上有螢幕、鍵盤、新聞紙、放大鏡、便條；卡片從桌面飛起來轉正給觀眾看。只用 SVG／CSS 2D 矩陣，不用 3D 引擎。元件只讀這裡的 token。 */
export const THEME_ISO = {
  /** 底：淡天藍到淡紫的直向漸層；dot＝地面圓點格；floor＝桌子落在地上的影子色（配 shadowAlpha） */
  bg: "#EEF3FF", bg2: "#F8F3FF", dot: "#C7D3EF", floor: "#1B2545", shadowAlpha: 0.1,
  /** 字：ink 主字、ink2 次要字、ink3 輔助字（淡底上對比 ≥4.5:1） */
  ink: "#1B2545", ink2: "#465074", ink3: "#5E6889",
  /** 轉正的卡片：白面＋下緣一條厚度色 */
  card: "#FFFFFF", cardSide: "#CBD4EA", line: "#DCE3F3",
  /** 等距實體的三個面：top 頂面、l 左前面（受光）、r 右前面（背光） */
  solid: {
    desk: { top: "#FFF3DC", l: "#F8DDB6", r: "#EFC892" },
    white: { top: "#FFFFFF", l: "#E1E7F5", r: "#C8D1E8" },
    lav: { top: "#CFC9FB", l: "#B5ACF3", r: "#9B90E6" },
    mint: { top: "#B2EAD9", l: "#8DD9C3", r: "#6CC5AB" },
    yellow: { top: "#FFE08A", l: "#F7CE66", r: "#EBB944" },
    coral: { top: "#FFAE9C", l: "#F98F78", r: "#EC7458" },
    sky: { top: "#BFE3FA", l: "#9CD0F2", r: "#7BBAE6" },
    plum: { top: "#E5C8F5", l: "#D5ACEC", r: "#C290E0" },
  } as Record<string, { top: string; l: string; r: string }>,
  /** 語意色（script.json 的 color／kw 寫這些名字）：fill 色塊、on 色塊上的字、text 白底上的字、soft 淡底、side 卡片厚度 */
  color: {
    primary: { fill: "#5566F0", on: "#FFFFFF", text: "#3D4BD1", soft: "#E1E5FF", side: "#3A48C2" },
    wrong: { fill: "#FF7A5C", on: "#FFFFFF", text: "#C2381B", soft: "#FFE3DB", side: "#D9553A" },
    right: { fill: "#19A88A", on: "#FFFFFF", text: "#0E775F", soft: "#D8F4EB", side: "#0F8169" },
    note: { fill: "#FFD766", on: "#1B2545", text: "#765300", soft: "#FFF2C6", side: "#E3B23A" },
    /** 完整片（isoVersion 2）的「這樣問」欄位多兩個中性色：天藍、梅紫（沒有對錯的意思） */
    sky: { fill: "#2F9BE0", on: "#FFFFFF", text: "#17699F", soft: "#DCEFFC", side: "#1E7DBB" },
    plum: { fill: "#B565D9", on: "#FFFFFF", text: "#8537AB", soft: "#F3E2FB", side: "#9247B8" },
  } as Record<string, { fill: string; on: string; text: string; soft: string; side: string }>,
  /** 螢幕面（發亮的那一面）與螢幕上的灰階橫條 */
  screen: { face: "#5566F0", glow: "#8E9BFF", on: "#FFFFFF", bar: "#AEB8FF" },
  radius: { card: 32, chip: 999, tile: 36, mark: 14 },
  weight: { title: 900, strong: 800, body: 600 },
  /** 卡片厚度（px）與柔影 */
  depth: { card: 10, tile: 14, soft: "0 28px 48px rgba(27,37,69,0.13)" },
  /** 動作（幀）：鏡頭移動 18、卡片飛行 14、彈出／蓋章 5、退場 8、螢光標記 9、劃線 7、打字每字 2、錯開 4；飛行弧高 px */
  motion: { cam: 18, fly: 14, slam: 5, exit: 8, mark: 9, strike: 7, step: 2, stagger: 4, arc: 110 },
} as const;
/** 亮色 2.5D 小場景版面（1080×1920；安全區上下 220、左右 64） */
export const LAYOUT_ISO = {
  W: 1080, H: 1920, X: 64, INNER_W: 952,
  HEADER_TOP: 228, HEADER_H: 60, PROGRESS_TOP: 304,
  MAIN_TOP: 336, MAIN_BOTTOM: 1250,
  CAP_TOP: 1290, CAP_H: 226, CAP_ZH_PX: 70, CAP_EN_PX: 32,
  SRC_TOP: 1560, SRC_PX: 28, MIN_PX: 28,
} as const;

/** CPI 實測短片（src/components/cpi/，composition「CpiVideo」，scripts/cpi/run.mjs）：深色乾淨科技感、自畫對話框、數字放大強調 */
export const THEME_CPI = {
  bg: "#0A0F1E", grid: "rgba(140,170,255,0.05)", glow: "rgba(70,110,255,0.16)",
  panel: "#121A2E", panel2: "#18223A", line: "#283655", skeleton: "#2A3756",
  text: "#EEF2FF", sub: "#93A0BF", dim: "#5F6B89",
  accent: "#3DDCFF", user: "#2D6BF0", num: "#FFD54A", wrong: "#FF5A5F", right: "#3BE38B",
  numGlow: "rgba(255,213,74,0.35)", wrongSoft: "rgba(255,90,95,0.14)", rightSoft: "rgba(59,227,139,0.14)", accentSoft: "rgba(61,220,255,0.12)",
  radius: { card: 28, bubble: 26, chip: 999 },
  /** 幀：場景淡入 6、退場 4、數字強調（放大到 1.18 再回 1）14、打叉描線 8 */
  motion: { enter: 6, exit: 4, punch: 14, strike: 8 },
} as const;
export const LAYOUT_CPI = {
  X: 64, INNER_W: 952, HEADER_TOP: 232, MAIN_TOP: 330, MAIN_BOTTOM: 1250,
  CAP_TOP: 1300, CAP_H: 230, CAP_PX: 64, CAP_MAX: 14,
} as const;

// ───────────────────────── stage: "talk"：夜窗（談晴說礙；src/components/talk/） ─────────────────────────
/** 全螢幕實拍照片＋慢推鏡＋底片顆粒＋一個大數字；礙的幕是冷的夜色，晴的幕調成暖燈色。元件只讀這裡的 token；不用 3D、霓虹發光。設計理由：docs/channels/tanqing-visual-research.md */
export const THEME_TALK = {
  /** 照片沒到位時的底色 */
  bg: "#0D1117",
  /** 主字、次要字、出處字 */
  fg: "#F3EEE4", fg2: "#C9C2B5", fg3: "#9A9387",
  /** 晴的字色（暖燈）、礙的數字色（冷白） */
  warm: "#F2C27B", cold: "#DCE6F2",
  /** 調色：照片上蓋一層色（mix-blend multiply）＋亮度；night＝礙、warm＝晴 */
  grade: {
    night: { tint: "#2B3D5C", tintAlpha: 0.55, brightness: 0.62, saturate: 0.55 },
    warm: { tint: "#7A4A1E", tintAlpha: 0.32, brightness: 0.82, saturate: 0.9 },
  } as Record<string, { tint: string; tintAlpha: number; brightness: number; saturate: number }>,
  /** 字下面的暗帶（讓字在照片上可讀；不用發光） */
  scrim: "rgba(8,10,14,0.58)",
  /** 暗角強度 0–1、顆粒強度 0–1（每 2 幀換一次 seed） */
  vignette: 0.55, grain: 0.10,
  /** 壓暗用的黑、頁首細線、字幕字影（照片上的字才讀得到；不是發光） */
  black: "#000000", rule: "rgba(243,238,228,0.18)", capShadow: "0 2px 10px rgba(0,0,0,0.6)",
  /** 窗格（十格裡亮幾格）：亮的窗、暗的窗 */
  window: { lit: "#F2C27B", dark: "rgba(220,230,242,0.16)", frame: "rgba(243,238,228,0.55)" },
  weight: { num: 800, zh: 700, body: 500, en: 500 },
  /** 動作（幀）：字淡入 12、字退場 10、換照片交疊 18、調色換 24、窗亮起每格 4；慢推鏡每幕放大 4% */
  motion: { in: 12, out: 10, cross: 18, grade: 24, lit: 4, push: 0.04 },
} as const;
/** 夜窗版面（1080×1920；安全區上下 220、左右 64） */
export const LAYOUT_TALK = {
  W: 1080, H: 1920, X: 64, INNER_W: 952,
  HEADER_TOP: 232, HEADER_H: 56,
  /** 大數字區、句子區、窗格區 */
  NUM_TOP: 470, NUM_PX: 260, LINE_TOP: 820, LINE_PX: 64, WIN_TOP: 1000, WIN_CELL: 78, WIN_GAP: 18,
  CAP_TOP: 1300, CAP_ZH_PX: 66, CAP_EN_PX: 30,
  SRC_TOP: 1590, SRC_PX: 28, MIN_PX: 28,
} as const;
