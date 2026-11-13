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
  },
  /** 燈光強度：環境、主燈、補燈 */
  light: { ambient: 1.5, key: 2.6, fill: 0.9 },
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
  motion: { in: 8, lay: 22, explode: 22, stagger: 3, focus: 20, lid: 16, flow: 26, peek: 12, orbit: 34, cool: 18 },
  /** 鏡頭（視角 fov、距離 d、仰角 elev 度、看向的高度 y）：立著轉、分解、聚焦三個狀態 */
  camera: {
    fov: 26,
    stand: { d: 44, elev: 5, y: 2.05 },
    explode: { d: 56, elev: 26, y: 0.4 },
    focus: { d: 35, elev: 38, y: -1.6 },
    /** 後段的兩次鏡頭變化（加在聚焦狀態上的增量）：繞開拉遠看整片板子、再推回熱點 */
    orbit: { d: 6, elev: -5, y: -0.6, yaw: 0.3 },
    settle: { d: -7, elev: 4, y: 0.9, yaw: 0.14 },
  },
  /** 模型姿態：起始偏轉、躺下後的俯仰與偏轉（弧度）、層距、每幀慢轉 */
  pose: { yaw0: -0.42, pitch: -1.22, yawIso: 0.66, gap: 3.1, drift: 0.0009, peekYaw: -0.12 },
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
