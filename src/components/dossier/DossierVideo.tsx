// 檔案室式（styleVersion 3 ＋ stage: "dossier"）：哩股哩股頻道的「專業嚴肅版」。
// 墨藍炭灰底加細格線；襯線大標、黑體內文、等寬數字；白灰字只加一個深紅強調與一個「已確定」用的冷色。
// 文件摹本是淺色紙面卡片，空白處用細紅框與引線標註；查證狀態是單色小標；照片黑白低對比、圖說都標「示意」。
// 動作只有：遮罩擦入、線條描出、打字、淡入、紅框閃一下、每鏡慢推；不彈跳、不搖晃。
// 「國際新聞」版（script.json 頂層有 news；沒有就是原本的樣子）：頂部新聞條與電頭、下三分之一標題條、點陣世界地圖、跑馬燈、報頭式小標、橫向擦切，見檔案後半。
// 時間全部來自 timeline（engine.ts）；顏色與版面讀 THEME_DOSSIER／LAYOUT_DOSSIER。照片：public/dossier/<slug>/（scripts/dossier/make-photos.py）。
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, Img, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_DOSSIER_SERIF as SERIF, FONT_EN, FONT_ZH, FPS, LAYOUT_DOSSIER as L, LAYOUT_DOSSIER_NEWS as LN, LAYOUT_DOSSIER_NEWS_FILL as LNF, THEME_DOSSIER as T, DOSSIER_END as DE } from "../../theme";
import WORLD from "./worldDots.json";
import { EASE, linear, tween } from "../anim";
import { buildDossier, staticShot, type DsShot } from "./engine";

const M = T.motion, N = T.news, NM = T.news.motion;
const r1 = (v: number) => Math.round(v * 10) / 10;
const NUM: React.CSSProperties = { fontFamily: FONT_EN, fontVariantNumeric: "tabular-nums" };
/** 大字級的數字：用比例寬（等寬的 1 在大字級會太鬆）；小字的日期、鏡號才用等寬 */
const NUMB: React.CSSProperties = { fontFamily: FONT_EN, fontVariantNumeric: "proportional-nums", letterSpacing: "-0.01em" };

// ── 襯線字型（public/fonts/dossier/，scripts/dossier/fetch-fonts.mjs 下載的子集） ──
let fontJob: Promise<unknown> | null = null;
const loadFonts = () => {
  if (!fontJob) fontJob = Promise.all(([[String(T.weight.head), "fonts/dossier/serif-900.woff2"], [String(T.weight.serif), "fonts/dossier/serif-600.woff2"]] as const).map(([weight, file]) =>
    new FontFace("DossierSerif", `url(${staticFile(file)}) format("woff2")`, { weight }).load().then((ff) => { document.fonts.add(ff); })));
  return fontJob;
};
const useSerif = () => {
  const [h] = useState(() => delayRender("dossier-fonts"));
  useEffect(() => { loadFonts().then(() => continueRender(h), (e) => { console.error("dossier fonts", e); continueRender(h); }); }, [h]);
};

// ── 動作 ──
const wipeP = (f: number, at: number, dur: number = M.wipe) => tween(f, at, dur, EASE.move);
const fadeP = (f: number, at: number, dur: number = M.fade) => tween(f, at, dur, EASE.enter);
const drawP = (f: number, at: number, dur: number = M.draw) => tween(f, at, dur, EASE.move);
const pen = (p: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: Math.round(1000 * (1 - p)) / 1000 });
/** 紅框閃一下：at 之後 flash 幀內亮暗兩次，其餘時間是 1 */
const flash = (f: number, at: number) => (f >= at && f < at + M.flash && Math.floor((f - at) / 4) % 2 === 0 ? 0.2 : 1);
type Dir = "right" | "down" | "left";
const clip = (p: number, dir: Dir) => (p >= 1 ? undefined : dir === "right" ? `inset(0 ${r1(100 * (1 - p))}% 0 0)` : dir === "left" ? `inset(0 0 0 ${r1(100 * (1 - p))}%)` : `inset(0 0 ${r1(100 * (1 - p))}% 0)`);

/** 遮罩擦入 */
const Reveal: React.FC<{ f: number; at: number; dir?: Dir; dur?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ f, at, dir = "right", dur, style, children }) => {
  const p = wipeP(f, at, dur);
  if (p <= 0) return null;
  return <div data-box="text" style={{ position: "absolute", ...style, clipPath: clip(p, dir), opacity: Math.min(1, p * 3) }}>{children}</div>;
};
/** 淡入 */
const Fade: React.FC<{ f: number; at: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ f, at, style, children }) => {
  const p = fadeP(f, at);
  if (p <= 0) return null;
  return <div data-box="text" style={{ position: "absolute", ...style, opacity: p }}>{children}</div>;
};
/** 一條描出來的直線（水平或垂直） */
const Rule: React.FC<{ f: number; at: number; x: number; y: number; len: number; vertical?: boolean; color?: string; w?: number; dur?: number }> = ({ f, at, x, y, len, vertical, color = T.hair, w = T.stroke.hair, dur }) => {
  const p = drawP(f, at, dur);
  if (p <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, width: vertical ? w : r1(len * p), height: vertical ? r1(len * p) : w, background: color }} />;
};
/** 打字機：字一個一個出現，還沒出現的字先佔位（版面不跳） */
const Typed: React.FC<{ text: string; f: number; at: number; per?: number }> = ({ text, f, at, per = M.type }) => {
  const chars = [...text], n = Math.max(0, Math.min(chars.length, Math.floor((f - at) / per) + 1));
  return <>{chars.slice(0, f < at ? 0 : n).join("")}<span style={{ opacity: 0 }}>{chars.slice(f < at ? 0 : n).join("")}</span></>;
};
/** 數字跳動（選填 count）：字串裡的數字從 0 每 2 幀跳一次、M.count 幀後停在定值；小數位數照原字串；沒有數字就整串直接出現 */
const Counted: React.FC<{ text: string; f: number; at: number }> = ({ text, f, at }) => {
  if (f < at) return null;
  const q = Math.min(1, (Math.floor((f - at) / 2) * 2) / M.count), e = 1 - Math.pow(1 - q, 2);
  return <>{text.replace(/\d+(?:\.\d+)?/g, (m) => { const dp = (m.split(".")[1] ?? "").length; return (Number(m) * e).toFixed(dp); })}</>;
};
/** 字底下描一條強調線 */
const Marked: React.FC<{ f: number; at: number; color?: string; w?: number; gap?: number; children: React.ReactNode }> = ({ f, at, color = T.accent, w = T.stroke.mark, gap = 2, children }) => (
  <span style={{ position: "relative", display: "inline-block" }}>
    {children}
    <span style={{ position: "absolute", left: 0, bottom: -gap - w, height: w, width: `${r1(100 * drawP(f, at))}%`, background: color }} />
  </span>
);
/** 把 text 裡的 mark 那一段包上強調線 */
const withMark = (text: string, mark: string | undefined, f: number, at: number, color?: string, w?: number) => {
  const k = mark ? text.indexOf(mark) : -1;
  if (k < 0 || !mark) return <>{text}</>;
  return <>{text.slice(0, k)}<Marked f={f} at={at} color={color} w={w}>{mark}</Marked>{text.slice(k + mark.length)}</>;
};

// ── 零件 ──
const serif = (px: number, weight: number = T.weight.head, color: string = T.text): React.CSSProperties => ({ fontFamily: SERIF, fontWeight: weight, fontSize: px, lineHeight: 1.12, color, whiteSpace: "nowrap" });
const sans = (px: number, weight: number = T.weight.bold, color: string = T.text): React.CSSProperties => ({ fontFamily: FONT_ZH, fontWeight: weight, fontSize: px, lineHeight: 1.25, color, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" });

type TagSpec = { kind: keyof typeof T.status; text: string; at: number };
/** 查證狀態標籤：單色小標（方點＋字＋細框）。none／pending 都是紅；pending 的方點是空心 */
const Tag: React.FC<{ tag: TagSpec; f: number; big?: boolean }> = ({ tag, f, big }) => {
  const p = wipeP(f, tag.at), c = T.status[tag.kind] ?? T.text2, h = big ? L.TAG_H + 16 : L.TAG_H, px = big ? L.TAG_TEXT_PX + 8 : L.TAG_TEXT_PX;
  if (p <= 0) return null;
  return (
    <div data-box="tag" style={{ display: "inline-flex", alignItems: "center", gap: 14, height: h, padding: `0 ${big ? 28 : 20}px 0 ${big ? 24 : 18}px`, border: `${T.stroke.hair}px solid ${c}`, background: T.bg, boxSizing: "border-box", clipPath: clip(p, "right"), opacity: Math.min(1, p * 3) }}>
      <span style={{ width: 12, height: 12, boxSizing: "border-box", background: tag.kind === "pending" ? "transparent" : c, border: `${T.stroke.hair}px solid ${c}` }} />
      <span style={{ ...sans(px, T.weight.bold, c), letterSpacing: "0.08em", lineHeight: 1 }}>{tag.text}</span>
    </div>
  );
};

/** 黑白低對比照片：遮罩擦入、極慢推近、細框；圖說在照片下面（都要標「示意」） */
type PhotoOpt = { stepAts?: number[]; stepP?: number[]; dir?: Dir; color?: boolean };
/** 選填（2026/11/21）：stepAts＝簡圖分段畫出（at 先露出第一段，之後每個時間點再擦出下一段，像線段一段一段畫上去）；stepP＝每段畫到的比例（0–1，預設平均）；
 *  dir＝分段擦出的方向（預設 right）；color＝彩色資料圖不蓋暗色壓色。沒填就是原本的樣子。 */
const stepReveal = (f: number, at: number, o: PhotoOpt) => {
  const stops = [at, ...(o.stepAts ?? [])], P = stops.map((_, i) => o.stepP?.[i] ?? (i + 1) / stops.length);
  let p = 0;
  stops.forEach((s, i) => { if (f >= s) p = (i ? P[i - 1] : 0) + (P[i] - (i ? P[i - 1] : 0)) * tween(f, s, M.stepWipe, EASE.move); });
  return p;
};
const Photo: React.FC<{ slug: string; name: string; f: number; at: number; x: number; y: number; w: number; h: number; caption?: string; life: number; endAt?: number; opt?: PhotoOpt; children?: React.ReactNode }> = ({ slug, name, f, at, x, y, w, h, caption, life, endAt, opt, children }) => {
  const noPush = useLN().STAGE_SCALE !== 1;
  // endAt（選填）：簡圖從左往右一格一格長出來（每 M.stepF 幀一格，第 0 幀已露出第一段），到 endAt 長滿；沒寫就是原本的往下擦入
  const stepped = !!opt?.stepAts?.length, grow = stepped || (endAt !== undefined && endAt > at);
  const p = stepped ? stepReveal(f, at, opt!) : grow ? (f < at ? 0 : Math.min(1, M.growP0 + (1 - M.growP0) * Math.floor((f - at) / M.stepF) * M.stepF / (endAt! - at))) : wipeP(f, at, M.wipe + 4);
  if (p <= 0) return null;
  // 填滿版不做「整張圖慢慢放大」（使用者 2026/11/15 禁止事項，改用物件本身的動作）
  const s = noPush ? 1 : 1 + M.photoPush * linear(f, at, Math.max(1, life));
  return (
    <>
      <div data-box="card" style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", clipPath: clip(p, grow ? (opt?.dir ?? "right") : "down"), boxShadow: `inset 0 0 0 ${T.stroke.hair}px ${T.hair}` }}>
        <Img src={staticFile(`dossier/${slug}/${name}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${s.toFixed(4)})` }} />
        <div style={{ position: "absolute", inset: 0, background: opt?.color ? "transparent" : T.photoTint, boxShadow: `inset 0 0 0 ${T.stroke.hair}px ${T.hair}` }} />
        {children}
      </div>
      {caption ? <div data-box="text" style={{ position: "absolute", left: x, top: y + h + 10, ...sans(L.NOTE_PX, T.weight.body, T.text3), opacity: fadeP(f, grow ? at : at + M.wipe) }}>{caption}</div> : null}
    </>
  );
};
/** 實心問句小標（鉤子第 0 幀就在）＋蓋章（stamp：1 秒內壓下，先放大再落定） */
const SolidAsk: React.FC<{ text: string; style?: React.CSSProperties }> = ({ text, style }) => (
  <div data-box="text" style={{ position: "absolute", ...style, padding: "10px 22px 14px", background: T.accent, ...serif(64, T.weight.head, T.bg), lineHeight: 1.1 }}>{text}</div>
);
const Stamp: React.FC<{ text: string; f: number; at: number; style?: React.CSSProperties }> = ({ text, f, at, style }) => {
  if (f < at) return null;
  const q = tween(f, at, M.stamp, EASE.move), s = 1.5 - 0.5 * q;
  return <div style={{ position: "absolute", ...style, padding: "6px 18px 10px", border: `${T.stroke.frame + 2}px solid ${T.accent}`, background: T.bg, ...serif(52, T.weight.head, T.accentText), lineHeight: 1.1, transform: `rotate(-7deg) scale(${s.toFixed(3)})`, transformOrigin: "50% 50%", opacity: Math.min(1, 0.4 + q) }}>{text}</div>;
};

/** 文件摹本的紙面 */
const paperBox = (x: number, y: number, w: number, h: number): React.CSSProperties => ({ left: x, top: y, width: w, height: h, boxSizing: "border-box", background: `linear-gradient(180deg, ${T.paper} 0%, ${T.paper2} 100%)`, boxShadow: T.paperShadow, padding: "30px 34px" });
/** 代表內文的灰色橫條（不寫字，不假造文件內容） */
const Bars: React.FC<{ widths: number[]; mt?: number }> = ({ widths, mt = 22 }) => (
  <div style={{ marginTop: mt }}>{widths.map((w, k) => <div key={k} style={{ width: `${w}%`, height: 14, marginTop: k ? 16 : 0, background: T.paperBar }} />)}</div>
);
const DocHead: React.FC<{ title: React.ReactNode; right?: string }> = ({ title, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 14, borderBottom: `${T.stroke.hair}px solid ${T.paperRule}` }}>
    <span style={serif(38, T.weight.serif, T.paperInk)}>{title}</span>
    {right ? <span style={{ ...NUM, fontWeight: 600, fontSize: 32, color: T.paperInk2 }}>{right}</span> : null}
  </div>
);
const Note: React.FC<{ text?: string; x: number; y: number; f: number; at: number }> = ({ text, x, y, f, at }) => text ? <div data-box="text" style={{ position: "absolute", left: x, top: y, ...sans(L.NOTE_PX, T.weight.body, T.text3), opacity: fadeP(f, at) }}>{text}</div> : null;
const StageSvg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={L.INNER_W} height={L.STAGE_H} viewBox={`0 0 ${L.INNER_W} ${L.STAGE_H}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>{children}</svg>;
/** 細紅框：描出來，描完閃一下；flashAt 再閃一次 */
const RedFrame: React.FC<{ f: number; at: number; flashAt?: number; x: number; y: number; w: number; h: number }> = ({ f, at, flashAt, x, y, w, h }) => {
  const p = drawP(f, at);
  if (p <= 0) return null;
  const o = Math.min(flash(f, at + M.draw), flashAt === undefined ? 1 : flash(f, flashAt));
  return <rect x={x} y={y} width={w} height={h} fill={T.accent} fillOpacity={o < 1 ? 0.16 : 0} stroke={T.accent} strokeWidth={T.stroke.frame} opacity={o < 1 ? 0.45 : 1} {...pen(p)} />;
};

/** 報頭式小標（引述媒體時用）：上粗下細兩條線，中間是媒體名（襯線字，只有文字、不是商標）與日期 */
const Masthead: React.FC<{ f: number; at: number; x: number; y: number; w: number; name: string; date?: string }> = ({ f, at, x, y, w, name, date }) => (
  <>
    <Rule f={f} at={at} x={x} y={y} len={w} color={T.text} w={T.stroke.mark - 2} dur={8} />
    <Fade f={f} at={at + 3} style={{ left: x, top: y + 10, width: w, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ ...serif(40, T.weight.serif), letterSpacing: "0.06em" }}>{name}</span>
      {date ? <span style={{ ...NUM, fontWeight: 600, fontSize: 30, color: T.text2 }}>{date}</span> : null}
    </Fade>
    <Rule f={f} at={at + 3} x={x} y={y + 66} len={w} color={T.line} dur={8} />
  </>
);

type LNT = { [K in keyof typeof LN]: number };
const LNC = React.createContext<LNT>(LN as unknown as LNT);
const useLN = () => React.useContext(LNC);

type PanelProps = { sh: DsShot; f: number; slug: string; news?: boolean };

// ── 鏡 1 鉤子：大字＋公告摹本（掃描線、原因欄紅框、引線「公告：沒寫原因」） ──
const Hook: React.FC<PanelProps> = ({ sh, f, slug }) => {
  const p = sh.p, d = p.doc, c = p.callout, ph = p.photo; // photo（選填）：文件框右邊放一張會長的簡圖，取代引線標註；沒有就是原本的樣子
  const DX = 0, DY = 508, DW = 540, DH = 360, FX = 246, FY = 150, FW = 260, FH = 70; // 文件框與「原因」空白欄（相對文件）
  const fx = DX + FX, fy = DY + FY, midY = fy + FH / 2, cx = 596, PX = 564;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, display: "flex", alignItems: "baseline", gap: 28 }}>
        <span style={{ ...sans(36, T.weight.bold, T.text2), letterSpacing: "0.1em" }}>{p.kicker}</span>
        {p.span ? <span style={{ ...NUM, fontWeight: 600, fontSize: 32, color: T.text3, letterSpacing: "0.04em" }}>{p.span}</span> : null}
      </div>
      <div style={{ position: "absolute", left: -6, top: 50, display: "flex", alignItems: "baseline", gap: 22 }}>
        <span style={{ ...NUMB, fontWeight: T.weight.num, fontSize: 216, lineHeight: 1.08, letterSpacing: "-0.03em", color: T.accentText }}>{p.num}</span>
        <span style={serif(112)}>{p.numText}</span>
      </div>
      <div style={{ position: "absolute", left: 0, top: 296, ...serif(132) }}>{withMark(p.line2, p.mark, f, p.markAt)}</div>
      {/* 公告摹本 */}
      <div style={{ position: "absolute", ...paperBox(DX, DY, DW, DH), overflow: "hidden" }}>
        <DocHead title={d.title} right={d.date} />
        <Bars widths={[100, 64]} />
        <div style={{ position: "absolute", left: 34, top: FY + 8, ...serif(40, T.weight.serif, T.paperInk), lineHeight: `${FH - 16}px` }}>{d.field}</div>
        {d.fill ? <div style={{ position: "absolute", left: FX, top: FY, width: FW, height: FH, display: "flex", alignItems: "center", justifyContent: "center", ...serif(d.fillPx ?? 36, T.weight.serif, T.paperInk) }}><Typed text={d.fill} f={f} at={d.fillAt ?? sh.start} /></div>
          : Math.floor(f / M.caret) % 2 === 0 ? <div style={{ position: "absolute", left: FX + 16, top: FY + 14, width: 4, height: FH - 28, background: T.accentOnPaper }} /> : null}
        <div style={{ position: "absolute", left: 34, right: 34, top: FY + FH + 24 }}><Bars widths={[100, 100, 46]} mt={0} /></div>
        {(d.scanAts as number[]).map((at, k) => {
          const q = linear(f, at, M.scan);
          return f >= at && q < 1 ? (
            <div key={k} style={{ position: "absolute", left: 0, right: 0, top: r1(q * DH) - 70, height: 72 }}>
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${T.scanTrail0} 0%, ${T.scanTrail} 100%)` }} />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: T.scan }} />
            </div>
          ) : null;
        })}
      </div>
      <Note text={d.note} x={DX} y={DY + DH + 12} f={f} at={sh.start - M.fade} />
      <StageSvg>
        <RedFrame f={f} at={d.frameAt} flashAt={d.flashAt} x={fx} y={fy} w={FW} h={FH} />
        {c ? <path d={`M ${fx + FW} ${midY} H ${cx - 30} V ${DY + 76} H ${cx}`} fill="none" stroke={T.accent} strokeWidth={T.stroke.hair} {...pen(drawP(f, c.at))} opacity={drawP(f, c.at) > 0 ? 1 : 0} /> : null}
      </StageSvg>
      {c ? <>
        <Fade f={f} at={c.at + 4} style={{ left: cx + 14, top: DY + 14, ...sans(32, T.weight.bold, T.text2), letterSpacing: "0.2em" }}>{c.label}</Fade>
        <Reveal f={f} at={c.at + 6} style={{ left: cx + 12, top: DY + 62, paddingBottom: 14, ...serif(76) }}><Marked f={f} at={c.markAt} w={T.stroke.line} gap={4}>{c.text}</Marked></Reveal>
      </> : null}
      {ph ? <Photo slug={slug} name={ph.name} f={f} at={ph.at} endAt={ph.endAt} opt={{ stepAts: ph.stepAts, stepP: ph.stepP, dir: ph.dir, color: ph.color }} x={PX} y={DY} w={L.INNER_W - PX} h={DH} caption={ph.caption} life={sh.end - sh.start} /> : null}
      {p.ask ? <SolidAsk text={p.ask} style={{ right: 0, top: 318 }} /> : null}
      {p.stamp ? <Stamp text={p.stamp.text} f={f} at={p.stamp.at} style={p.stamp.pos === "right" ? { right: 8, top: 46 } : { left: 250, top: 214 }} /> : null}
      {p.tag ? <div style={{ position: "absolute", ...(ph ? { right: 0, top: 150 } : { left: cx + 14, top: DY + 196 }) }}><Tag tag={p.tag} f={f} /></div> : null}
    </>
  );
};

// ── 鏡 2 時間線：細線與刻度、兩個節點、中間的缺口；左邊聲明摹本、右邊辭職 ──
const Timeline: React.FC<PanelProps> = ({ sh, f, slug, news }) => {
  const p = sh.p, ax = p.axis, days: string[] = ax.days, n = days.length;
  const X0 = 44, X1 = 876, AY = 376, CY = 446, CH = 400, LW = 520, RX = 550, RW = 370;
  const dx = (i: number) => X0 + ((X1 - X0) * i) / (n - 1);
  const ap = drawP(f, ax.at, M.draw + 8), gp = drawP(f, p.gap.at), gflash = flash(f, p.gap.flashAt);
  const l = p.left, r = p.right;
  return (
    <>
      <Photo slug={slug} name={p.photo.name} f={f} at={p.photo.at} x={0} y={0} w={L.INNER_W} h={206} caption={p.photo.caption} life={sh.end - sh.start}>
        {news && ax.label ? <div style={{ position: "absolute", left: 0, top: 0, padding: "10px 18px", background: T.bg, display: "flex", alignItems: "baseline", gap: 14, lineHeight: 1 }}>
          <span style={{ ...sans(28, T.weight.bold), letterSpacing: "0.16em", lineHeight: 1 }}>{ax.label}</span>
          {ax.labelEn ? <span style={{ ...NUM, fontWeight: 600, fontSize: 28, lineHeight: 1, color: T.text3, letterSpacing: "0.14em" }}>{ax.labelEn}</span> : null}
        </div> : null}
      </Photo>
      {/* 軸與刻度 */}
      <Rule f={f} at={ax.at} x={X0} y={AY} len={X1 - X0} color={T.line} dur={M.draw + 8} />
      {days.map((d, i) => {
        const on = ap * (n - 1) >= i - 0.01, end = i === 0 || i === n - 1;
        return on ? (
          <React.Fragment key={d}>
            <div style={{ position: "absolute", left: dx(i) - 1, top: AY - (end ? 14 : 8), width: T.stroke.hair, height: end ? 30 : 18, background: end ? T.text : T.line }} />
            {end && news ? (
              <>
                {/* 新聞時間軸：兩端是日期籤（起點白底、終點紅底）加軸上的方形節點 */}
                <div style={{ position: "absolute", top: AY - 88, ...(i === 0 ? { left: dx(i) - 8 } : { right: L.INNER_W - dx(i) - 8 }), padding: "6px 16px 8px", background: i === 0 ? T.text : N.red, ...NUMB, fontWeight: T.weight.num, fontSize: 48, lineHeight: 1, color: i === 0 ? T.bg : N.onRed }}>{d}</div>
                <div style={{ position: "absolute", left: dx(i) - 9, top: AY - 8, width: 18, height: 18, background: i === 0 ? T.text : N.red }} />
              </>
            ) : end ? <div style={{ position: "absolute", top: AY - 84, ...(i === 0 ? { left: dx(i) - 4 } : { right: L.INNER_W - dx(i) - 4 }), ...NUMB, fontWeight: T.weight.num, fontSize: 56, lineHeight: 1, color: T.text }}>{d}</div>
              : <div style={{ position: "absolute", left: dx(i) - 60, width: 120, textAlign: "center", top: AY + 18, ...NUM, fontWeight: 400, fontSize: 28, lineHeight: 1, color: T.text3 }}>{d}</div>}
          </React.Fragment>
        ) : null;
      })}
      {/* 缺口：紅線段＋「只隔 4 天」 */}
      {gp > 0 ? <div style={{ position: "absolute", left: dx(0), top: AY - 2, width: r1((X1 - X0) * gp), height: T.stroke.mark, background: T.accent, opacity: gflash }} /> : null}
      <Fade f={f} at={p.gap.at} style={{ left: 0, width: L.INNER_W, top: AY - 122, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 14 }}>
        <span style={sans(40, T.weight.bold, T.text2)}>{p.gap.pre}</span>
        <span style={{ ...NUMB, fontWeight: T.weight.num, fontSize: 104, lineHeight: 1, color: T.accentText, opacity: gflash }}>{p.gap.num}</span>
        <span style={sans(40, T.weight.bold, T.text2)}>{p.gap.unit}</span>
      </Fade>
      <Rule f={f} at={l.at - 2} x={dx(0)} y={AY + 16} len={CY - AY - 16} vertical color={T.line} dur={8} />
      <Rule f={f} at={r.at - 2} x={dx(n - 1)} y={AY + 16} len={CY - AY - 16} vertical color={T.line} dur={8} />
      {/* 左：董事會聲明（文件摹本） */}
      <Reveal f={f} at={l.at} dir="down" style={{ ...paperBox(0, CY, LW, CH) }}>
        <DocHead title={l.title} right={l.date} />
        <div style={{ marginTop: 18, height: 40, ...sans(30, T.weight.bold, T.paperInk2), opacity: fadeP(f, l.subAt) }}>{l.sub}</div>
        <div style={{ marginTop: 26, ...serif(60, T.weight.serif, T.paperInk) }}><Typed text={l.lines[0]} f={f} at={l.typeAt} /></div>
        <div style={{ marginTop: 10, ...serif(96, T.weight.head, T.paperInk) }}>
          <Marked f={f} at={l.markAt} color={T.accentOnPaper}><Typed text={l.lines[1]} f={f} at={l.typeAt + [...l.lines[0]].length * M.type + 4} /></Marked>
        </div>
      </Reveal>
      {/* 右：11/12 辭職（深色卡，頂端一條紅線） */}
      <Reveal f={f} at={r.at} dir="down" style={{ left: RX, top: CY, width: RW, height: CH, boxSizing: "border-box", background: T.panel, border: `${T.stroke.hair}px solid ${T.panelLine}`, borderTop: `${T.stroke.mark}px solid ${T.accent}`, padding: "26px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={sans(30, T.weight.bold, T.text2)}>{r.label}</span>
          <span style={{ ...NUM, fontWeight: 600, fontSize: 32, color: T.text2 }}>{r.date}</span>
        </div>
        <div style={{ marginTop: 44, ...serif(132) }}>{r.lines[0]}</div>
        <div style={{ marginTop: 14, ...serif(62, T.weight.serif, T.accentText) }}>{r.lines[1]}</div>
      </Reveal>
      <Note text={l.note} x={0} y={CY + CH + 16} f={f} at={l.at + M.wipe} />
      {p.tag ? <div style={{ position: "absolute", left: 0, width: LW, top: CY + CH + 10, display: "flex", justifyContent: "flex-end" }}><Tag tag={p.tag} f={f} /></div> : null}
    </>
  );
};

// ── 鏡 3 兩種說法並排：官方文件（紙面摹本）對媒體報導（深色引述卡） ──
const Versus: React.FC<PanelProps> = ({ sh, f, slug }) => {
  // photo（選填）：兩欄卡縮矮（不畫內文橫條），出處與標籤往上收，下方放一張撐滿寬度、會逐格長出的簡圖；不畫 mid 圈（兩欄縫只有 30px，圈會壓到卡）；右欄大字整字一次出現。沒有 photo 就是原本的樣子。
  const p = sh.p, l = p.left, r = p.right, ph = p.photo, cpt = !!ph, CW = 445, RX = 475, TOP = 30, CY = TOP + 104, CH = cpt ? 270 : 500;
  const SRC_Y = cpt ? CY + CH + 20 : CY + CH + 64, TAG_Y = cpt ? CY + CH + 78 : CY + CH + 130, PY = CY + CH + 156;
  const head = (x: number, text: string, at: number, color: string) => (
    <>
      <Rule f={f} at={at} x={x} y={TOP} len={CW} color={color} w={T.stroke.line} />
      <Fade f={f} at={at + 4} style={{ left: x, top: TOP + 20, ...sans(42, T.weight.bold, color), letterSpacing: "0.12em" }}>{text}</Fade>
    </>
  );
  const src = (x: number, text: string, at: number) => (
    <Fade f={f} at={at} style={{ left: x, top: SRC_Y, display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ width: 28, height: T.stroke.hair, background: T.line }} /><span style={sans(32, T.weight.bold, T.text2)}>{text}</span>
    </Fade>
  );
  return (
    <>
      {head(0, l.head, l.headAt, T.cool)}
      {head(RX, r.head, r.headAt, T.text2)}
      <Reveal f={f} at={l.at} dir="down" style={{ ...paperBox(0, CY, CW, CH) }}>
        <DocHead title={l.doc} />
        {cpt ? null : <Bars widths={[100, 58]} />}
        <div style={{ marginTop: cpt ? 24 : 40, ...serif(l.bigFit ?? l.bigPx ?? 160, T.weight.head, T.paperInk) }}><Marked f={f} at={l.bigAt + 8} color={T.accentOnPaper}>{l.count ? <Counted text={l.big} f={f} at={l.bigAt} /> : <Typed text={l.big} f={f} at={l.bigAt} />}</Marked></div>
        {cpt ? null : <Bars widths={[100, 82, 100]} mt={44} />}
      </Reveal>
      <Note text={l.note} x={0} y={CY + CH + 12} f={f} at={l.at + M.wipe} />
      {/* 右欄：先有一個空框（還沒有東西可放），媒體的說法念到才進來 */}
      <Fade f={f} at={r.headAt} style={{ left: RX, top: CY, width: CW, height: CH, boxSizing: "border-box", border: `${T.stroke.hair}px dashed ${T.hair}` }}>{null}</Fade>
      <Reveal f={f} at={r.at} dir="down" style={{ left: RX, top: CY, width: CW, height: CH, boxSizing: "border-box", background: T.panel, border: `${T.stroke.hair}px solid ${T.panelLine}`, padding: "18px 34px" }}>
        <div style={{ marginTop: 16, width: 64, height: T.stroke.mark, background: r.masthead ? "transparent" : T.text3 }} />
        {(r.big as string[]).map((t, k) => <div key={k} style={{ marginTop: k ? 10 : 84, ...serif(r.bigPx ?? 112), ...(cpt ? { opacity: f >= r.bigAt + k * 6 ? 1 : 0 } : { clipPath: clip(wipeP(f, r.bigAt + k * 6), "right"), opacity: wipeP(f, r.bigAt + k * 6) > 0 ? 1 : 0 }) }}>{r.count ? <Counted text={t} f={f} at={r.bigAt + k * 6} /> : t}</div>)}
      </Reveal>
      {r.masthead ? <Masthead f={f} at={r.masthead.at} x={RX + 34} y={CY + 30} w={CW - 68} name={r.masthead.name} date={r.masthead.date} /> : null}
      {src(0, l.src, l.srcAt)}
      {src(RX, r.src, r.srcAt)}
      <div style={{ position: "absolute", left: 0, top: TAG_Y }}><Tag tag={l.tag} f={f} /></div>
      <div style={{ position: "absolute", left: RX, top: TAG_Y }}><Tag tag={r.tag} f={f} /></div>
      {ph ? <Photo slug={slug} name={ph.name} f={f} at={ph.at} endAt={ph.endAt} opt={{ stepAts: ph.stepAts, stepP: ph.stepP, dir: ph.dir, color: ph.color }} x={0} y={PY} w={L.INNER_W} h={310} caption={ph.caption} life={sh.end - sh.start} /> : null}
      {p.mid && !cpt ? (
        <Fade f={f} at={p.mid.at} style={{ left: (L.INNER_W - 76) / 2, top: CY + CH / 2 - 38, width: 76, height: 76, boxSizing: "border-box", borderRadius: 38, background: T.bg, border: `${T.stroke.frame}px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ ...serif(48, T.weight.head, T.accentText), lineHeight: 1 }}>{p.mid.text}</span>
        </Fade>
      ) : null}
    </>
  );
};

// ── 鏡 4 外界的懷疑：問句大標＋報導（示意照片）＋報導裡的說法 ──
const Claim: React.FC<PanelProps> = ({ sh, f, slug }) => {
  const p = sh.p, h = p.head, ph = p.photo, q = p.quote, TOP = 50, PY = TOP + 196, PS = ph.size ?? 440, QX = PS + 46; // photo.size（選填）：簡圖要看得清楚時放大，引文往右收
  return (
    <>
      <Reveal f={f} at={h.at} style={{ left: 0, top: TOP, paddingBottom: 16, paddingRight: 8, ...serif(116) }}>{withMark(h.text, h.mark, f, h.markAt)}</Reveal>
      <Photo slug={slug} name={ph.name} f={f} at={ph.at} opt={{ stepAts: ph.stepAts, stepP: ph.stepP, dir: ph.dir, color: ph.color }} x={0} y={PY} w={PS} h={PS} caption={ph.caption} life={sh.end - sh.start}>
        {ph.date ? <div style={{ position: "absolute", left: 0, top: 0, padding: "10px 18px", background: T.bg, ...NUMB, fontWeight: T.weight.num, fontSize: 40, lineHeight: 1, color: T.text, opacity: fadeP(f, ph.dateAt) }}>{ph.date}</div> : null}
      </Photo>
      {q.masthead ? <Masthead f={f} at={q.byAt} x={QX} y={PY} w={L.INNER_W - QX} name={q.masthead.name} date={q.masthead.date} /> : (
        <>
          <Rule f={f} at={q.byAt} x={QX} y={PY} len={L.INNER_W - QX} color={T.line} />
          <Fade f={f} at={q.byAt + 4} style={{ left: QX, top: PY + 20, ...sans(34, T.weight.bold, T.text2) }}>{q.by}</Fade>
        </>
      )}
      <Reveal f={f} at={q.at} style={{ left: QX, top: PY + 96, ...sans(64, T.weight.sub) }}>{q.pre}</Reveal>
      <Reveal f={f} at={q.bigAt} style={{ left: QX - 4, top: PY + 176, paddingBottom: 18, ...serif(176) }}><Marked f={f} at={q.bigAt + 8}>{q.count ? <Counted text={q.big} f={f} at={q.bigAt} /> : q.big}</Marked></Reveal>
      <Fade f={f} at={q.bigAt + 4} style={{ left: QX, top: PY + 392, ...sans(64, T.weight.sub) }}>{q.post}</Fade>
      {p.tag ? <div style={{ position: "absolute", left: QX, top: PY + PS + 46 }}><Tag tag={p.tag} f={f} /></div> : null}
      {p.note ? <Note text={p.note.text} x={QX} y={PY + PS + 150} f={f} at={p.note.at} /> : null}
    </>
  );
};

// ── 鏡 5 樂見 ≠ 設局：兩個詞之間一個不等號，下面兩列各自的查證狀態 ──
const NotEqual: React.FC<PanelProps> = ({ sh, f }) => {
  const p = sh.p, TOP = 80, RY = TOP + 370, RH = 190;
  return (
    <>
      <Reveal f={f} at={p.aAt} style={{ left: 0, top: TOP, ...serif(196) }}>{p.a}</Reveal>
      <Fade f={f} at={p.opAt} style={{ left: 0, width: L.INNER_W, top: TOP + 6, textAlign: "center" }}>
        <div style={{ ...NUM, fontWeight: T.weight.num, fontSize: 168, lineHeight: 1, color: T.accentText }}>{p.op}</div>
        <div style={{ marginTop: 6, ...sans(32, T.weight.bold, T.text2), letterSpacing: "0.16em" }}>{p.opLabel}</div>
      </Fade>
      <Reveal f={f} at={p.bAt} dir="left" style={{ right: 0, top: TOP, ...serif(196) }}>{p.b}</Reveal>
      <Rule f={f} at={p.aAt + 4} x={0} y={RY - 40} len={L.INNER_W} color={T.line} />
      {(p.rows as { text: string; at: number; tag: TagSpec }[]).map((r, k) => (
        <React.Fragment key={k}>
          <Reveal f={f} at={r.at} style={{ left: 0, top: RY + k * RH, ...serif(96, T.weight.serif) }}>{r.text}</Reveal>
          <Rule f={f} at={r.at + 4} x={420} y={RY + k * RH + 56} len={L.INNER_W - 420 - 290} color={T.hair} />
          <div style={{ position: "absolute", right: 0, top: RY + k * RH + 28 }}><Tag tag={r.tag} f={f} /></div>
          <Rule f={f} at={r.at} x={0} y={RY + (k + 1) * RH - 40} len={L.INNER_W} color={T.hair} />
        </React.Fragment>
      ))}
    </>
  );
};

// ── 鏡 6 還不知道的：調查（示意照片）還沒結論；本人的說明是一張空白的紙 ──
const Pending: React.FC<PanelProps> = ({ sh, f, slug }) => {
  const p = sh.p, l = p.left, r = p.right, CW = 445, RX = 475, TOP = 40, CH = 430, FX = 62, FY = 170, FW = CW - 124, FH = 96;
  const row = (x: number, text: string, at: number) => (
    <>
      <Rule f={f} at={at} x={x} y={TOP + CH + 84} len={96} vertical color={T.accent} w={T.stroke.mark} dur={8} />
      <Reveal f={f} at={at + 2} style={{ left: x + 26, top: TOP + CH + 80, ...serif(p.rowPx ?? 88) }}>{text}</Reveal>
    </>
  );
  return (
    <>
      <Photo slug={slug} name={l.photo.name} f={f} at={l.photo.at} opt={{ stepAts: l.photo.stepAts, stepP: l.photo.stepP, dir: l.photo.dir, color: l.photo.color }} x={0} y={TOP} w={CW} h={CH} caption={l.photo.caption} life={sh.end - sh.start} />
      {row(0, l.row, l.rowAt)}
      <Reveal f={f} at={r.at} dir="down" style={{ ...paperBox(RX, TOP, CW, CH) }}>
        <DocHead title={<Typed text={r.title} f={f} at={r.titleAt} />} />
        <Bars widths={[100, 60]} />
        <div style={{ position: "absolute", left: FX, top: FY, width: FW, height: FH, display: "flex", alignItems: "center", justifyContent: "center", ...serif(40, T.weight.serif, T.paperInk2), opacity: fadeP(f, r.titleAt + 14) }}>{r.field}</div>
        <div style={{ position: "absolute", left: 34, right: 34, top: FY + FH + 26 }}><Bars widths={[100, 100, 70]} mt={0} /></div>
      </Reveal>
      <Note text={r.note} x={RX} y={TOP + CH + 10} f={f} at={r.at + M.wipe} />
      <StageSvg><RedFrame f={f} at={r.frameAt} x={RX + FX} y={TOP + FY} w={FW} h={FH} /></StageSvg>
      {row(RX, r.row, r.rowAt)}
      {p.tag ? <div style={{ position: "absolute", left: 0, width: L.INNER_W, top: TOP + CH + 236, display: "flex", justifyContent: "center" }}><Tag tag={p.tag} f={f} big /></div> : null}
    </>
  );
};

// ── 鏡 7 提問＋下一集 ──
const Ask: React.FC<PanelProps> = ({ sh, f, slug }) => {
  const p = sh.p, h = p.head, nx = p.next, PY = 520, PH = 380, sizes = [150, 128];
  return (
    <>
      {(h.lines as string[]).map((t, k) => (
        <Reveal key={k} f={f} at={h.at + k * 5} style={{ left: 0, top: k ? 172 : 0, paddingBottom: 16, paddingRight: 8, ...serif(sizes[k] ?? 128) }}>{withMark(t, h.marks?.[k], f, h.markAts?.[k] ?? h.at)}</Reveal>
      ))}
      {p.cta ? <Fade f={f} at={p.cta.at} style={{ left: 0, top: 354, display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ width: 44, height: T.stroke.hair, background: T.line }} /><span style={sans(40, T.weight.bold, T.text2)}>{p.cta.text}</span>
      </Fade> : null}
      <Rule f={f} at={nx.at} x={0} y={PY - 70} len={L.INNER_W} color={T.line} />
      <Fade f={f} at={nx.at + 2} style={{ left: 0, top: PY - 54, ...sans(34, T.weight.bold, T.accentText), letterSpacing: "0.24em" }}>{nx.label}</Fade>
      <Photo slug={slug} name={nx.photo.name} f={f} at={nx.photo.at} opt={{ stepAts: nx.photo.stepAts, stepP: nx.photo.stepP, dir: nx.photo.dir, color: nx.photo.color }} x={0} y={PY} w={L.INNER_W} h={PH} life={sh.end - nx.photo.at + 30}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 240, background: `linear-gradient(180deg, ${T.photoFade0} 0%, ${T.photoFade} 78%)` }} />
        <div style={{ position: "absolute", right: 0, top: 0, padding: "10px 16px", background: T.bg, ...sans(L.NOTE_PX, T.weight.body, T.text2), lineHeight: 1 }}>{nx.photo.caption}</div>
        <div style={{ position: "absolute", left: 36, bottom: 34, ...serif(84) }}><Typed text={nx.title} f={f} at={nx.titleAt} /></div>
      </Photo>
      <StageSvg><RedFrame f={f} at={nx.frameAt} x={0} y={PY} w={L.INNER_W} h={PH} /></StageSvg>
    </>
  );
};

const PANELS: Record<string, React.FC<PanelProps>> = { hook: Hook, timeline: Timeline, versus: Versus, claim: Claim, notequal: NotEqual, pending: Pending, ask: Ask };

/** 一鏡：內容畫在主舞台框裡，整鏡極慢推近；換鏡時舊鏡淡出 */
/** 下半部資訊帶（選填 props.band，2026/11/22；沒填就是原本的樣子）：字幕條下方到出處列之間（約 y 1480–1692）一條深色資料帶，
 *  左邊直排小標，右邊 1–4 格「小字／大字／註」（時間線、對照數字、放大的出處卡）。整條從這一鏡開始就在（跟著換鏡擦切），
 *  格子有 at 的念到之前降亮度、念到時亮起並描一條底線；tone＝red（2022／過去）｜cool（現在）｜q（未定，虛線框）｜text。 */
type BandCell = { top: string; big: string; sub?: string; tone?: "red" | "cool" | "q" | "text"; at?: number };
const LowerBand: React.FC<{ band: { title: string; cells: BandCell[]; arrows?: boolean; bigPx?: number }; f: number }> = ({ band, f }) => {
  const ln = useLN();
  const top = ln.LT_TOP + ln.LT_H + 16, h = ln.SRC_TOP - 14 - top, TW = 70, px = band.bigPx ?? 58;
  const tone = (t?: string) => (t === "red" ? T.accentText : t === "cool" ? T.cool : t === "q" ? T.text2 : T.text);
  return (
    <div data-box="card" style={{ position: "absolute", left: L.X, top, width: L.INNER_W, height: h, boxSizing: "border-box", background: N.ltBg, border: `${T.stroke.hair}px solid ${T.panelLine}`, display: "flex", alignItems: "stretch" }}>
      <div style={{ width: TW, flexShrink: 0, background: N.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ ...sans(30, T.weight.bold, N.onRed), writingMode: "vertical-rl", letterSpacing: "0.16em", lineHeight: 1 }}>{band.title}</span>
      </div>
      {band.cells.map((c, k) => {
        const on = c.at === undefined || f >= c.at, lp = c.at === undefined ? 1 : drawP(f, c.at);
        return (
          <React.Fragment key={k}>
            {k ? <div style={{ width: band.arrows ? 40 : T.stroke.hair, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: band.arrows ? "transparent" : T.panelLine, ...sans(36, T.weight.bold, T.text3) }}>{band.arrows ? "→" : null}</div> : null}
            <div style={{ flex: 1, minWidth: 0, padding: "0 18px", display: "flex", flexDirection: "column", justifyContent: "center", opacity: on ? 1 : 0.62 }}>
              <div style={{ ...sans(30, T.weight.bold, T.text2), letterSpacing: "0.04em" }}>{c.top}</div>
              <div style={{ marginTop: 6, alignSelf: "flex-start", position: "relative", padding: c.tone === "q" ? "0 10px" : 0, border: c.tone === "q" ? `${T.stroke.hair}px dashed ${T.line}` : undefined }}>
                <span style={{ ...NUMB, fontFamily: `${FONT_EN}, ${FONT_ZH}`, fontWeight: T.weight.num, fontSize: px, lineHeight: 1.12, color: tone(c.tone), whiteSpace: "nowrap" }}>{c.big}</span>
                {c.at !== undefined && lp > 0 ? <span style={{ position: "absolute", left: 0, bottom: -4, height: T.stroke.mark - 2, width: `${r1(100 * lp)}%`, background: T.accent }} /> : null}
              </div>
              {c.sub ? <div style={{ marginTop: 8, ...sans(30, T.weight.body, T.text2) }}>{c.sub}</div> : null}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Shot: React.FC<{ sh: DsShot; f: number; slug: string; cut?: boolean }> = ({ sh, f, slug, cut }) => {
  const P = PANELS[sh.panel];
  const ln = useLN();
  if (!P) return null;
  if (cut) {
    // 「國際新聞」版：橫向擦切。新鏡從左邊露出來、舊鏡同時從左邊被切掉，中間一條條帶（SweepBand）掃過；沒有淡出，所以換鏡時畫面不會空。
    const pin = sh.index === 0 ? 1 : tween(f, sh.start, NM.cut, EASE.move), pout = tween(f, sh.outAt, NM.cut, EASE.move);
    if (f < sh.start || pout >= 1) return null;
    const sc = ln.STAGE_SCALE !== 1 ? 1 : 1 + NM.push * linear(f, sh.start, Math.max(1, sh.end + NM.cut - sh.start)); // 填滿版不慢推整鏡
    return (
      <AbsoluteFill style={{ clipPath: pin >= 1 && pout <= 0 ? undefined : `inset(0 ${r1(100 * (1 - pin))}% 0 ${r1(100 * pout)}%)` }}>
        <div style={{ position: "absolute", left: L.X, top: ln.STAGE_TOP, width: L.INNER_W, height: L.STAGE_H, transform: ln.STAGE_SCALE === 1 ? undefined : `scale(${ln.STAGE_SCALE})`, transformOrigin: "50% 0" }}>
          <div style={{ position: "absolute", inset: 0, transform: `scale(${sc.toFixed(4)})`, transformOrigin: "0 50%" }}>
            <P sh={sh} f={f} slug={slug} news />
          </div>
        </div>
        {sh.p.band ? <LowerBand band={sh.p.band} f={f} /> : null}
      </AbsoluteFill>
    );
  }
  if (f < sh.start || f >= sh.outAt + M.out) return null;
  const s = 1 + M.push * linear(f, sh.start, Math.max(1, sh.outAt + M.out - sh.start));
  return (
    <div style={{ position: "absolute", left: L.X, top: L.STAGE_TOP, width: L.INNER_W, height: L.STAGE_H, opacity: 1 - tween(f, sh.outAt, M.out, EASE.exit), transform: `scale(${s.toFixed(4)})`, transformOrigin: "50% 50%" }}>
      <P sh={sh} f={f} slug={slug} />
    </div>
  );
};

// ── 常駐的東西 ──
const Backdrop: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 40%, ${T.bgHi} 0%, ${T.bg} 70%)` }} />
    <AbsoluteFill style={{ backgroundImage: `linear-gradient(${T.grid} 1px, transparent 1px), linear-gradient(90deg, ${T.grid} 1px, transparent 1px)`, backgroundSize: `${T.gridPx}px ${T.gridPx}px` }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 120% 80% at 50% 45%, transparent 55%, ${T.vignette} 100%)` }} />
  </>
);
/** 頁首：左上小字標、右上欄目名；下面一條細線兼全片進度 */
const Header: React.FC<{ name: string; tag: string; progress: number }> = ({ name, tag, progress }) => (
  <>
    <div style={{ position: "absolute", left: L.X, top: L.HEAD_TOP, height: L.HEAD_H, display: "flex", alignItems: "center", gap: 16 }}>
      <span style={{ width: 12, height: 12, background: T.accent }} />
      <span style={{ ...serif(L.MARK_PX, T.weight.serif), letterSpacing: "0.14em", lineHeight: 1 }}>{name}</span>
    </div>
    <div style={{ position: "absolute", right: L.X, top: L.HEAD_TOP, height: L.HEAD_H, display: "flex", alignItems: "center", ...sans(L.TAG_PX, T.weight.bold, T.text3), letterSpacing: "0.3em" }}>{tag}</div>
    <div style={{ position: "absolute", left: L.X, top: L.RULE_Y, width: L.INNER_W, height: T.stroke.hair, background: T.hair }} />
    <div style={{ position: "absolute", left: L.X, top: L.RULE_Y, width: r1(L.INNER_W * progress), height: T.stroke.hair, background: T.text2 }} />
  </>
);
type Cap = { en: string; keywords: string[]; window: [number, number]; phrases: { text: string; start: number }[] };
const enSplit = (en: string) => String(en ?? "").split("|").map((x) => x.trim()).filter(Boolean);
/** 把關鍵詞那幾個字加上紅色底線（字仍然是白的） */
const kwSpans = (text: string, kws: string[]) => {
  const out: React.ReactNode[] = [];
  let i = 0, key = 0;
  while (i < text.length) {
    const kw = kws.filter((k) => k && text.startsWith(k, i)).sort((a, b) => b.length - a.length)[0];
    if (kw) { out.push(<span key={key++} style={{ boxShadow: `inset 0 -${T.stroke.mark}px 0 ${T.accent}` }}>{kw}</span>); i += kw.length; } else { out.push(text[i]); i += 1; }
  }
  return out;
};
/** 字幕：靠左、左邊一條紅線；中文一次一段、英文跟著換 */
const Caption: React.FC<{ cues: Cap[]; f: number }> = ({ cues, f }) => {
  const cue = cues.find((c) => f >= c.window[0] && f < c.window[1]);
  if (!cue || !cue.phrases.length) return null;
  let k = 0; cue.phrases.forEach((ph, i) => { if (f >= ph.start) k = i; });
  const zh = cue.phrases[k].text.replace(/[，、；：]$/, "");
  const en = enSplit(cue.en), ek = Math.min(en.length - 1, Math.floor((k * en.length) / cue.phrases.length));
  const from = Math.max(cue.window[0], cue.phrases[k].start);
  const o = from === 0 ? 1 : tween(f, from, M.cap, EASE.enter); // 第 0 幀的字幕直接在
  return (
    <div style={{ position: "absolute", left: L.X, top: L.CAP_TOP, paddingLeft: L.CAP_PAD, borderLeft: `${L.CAP_BAR}px solid ${T.accent}` }}>
      <div style={{ opacity: o }}>
        <div style={{ ...sans(L.CAP_ZH_PX, T.weight.sub), lineHeight: 1.3 }}>{kwSpans(zh, cue.keywords)}</div>
        <div style={{ marginTop: 14, fontFamily: FONT_EN, fontWeight: 400, fontSize: L.CAP_EN_PX, lineHeight: 1.3, color: T.text2, whiteSpace: "nowrap" }}>{en[ek] ?? " "}</div>
      </div>
    </div>
  );
};
/** 出處（每鏡一行）＋底部常駐「查證截至」與鏡號 */
const Footer: React.FC<{ shots: DsShot[]; f: number; asOf: string }> = ({ shots, f, asOf }) => {
  let cur = 0; shots.forEach((sh, i) => { if (f >= sh.inAt) cur = i; });
  return (
    <>
      {shots.map((sh, i) => {
        if (!sh.sources.length || f < sh.start || f >= sh.outAt + M.out) return null;
        const o = (i === 0 ? 1 : fadeP(f, sh.inAt)) * (1 - tween(f, sh.outAt, M.out, EASE.exit));
        return <div key={sh.id} style={{ position: "absolute", left: L.X, width: L.INNER_W, top: L.SRC_TOP, opacity: o, ...sans(L.SRC_PX, T.weight.body, T.text3) }}>來源：{sh.sources.join("；")}</div>;
      })}
      <div style={{ position: "absolute", left: L.X, top: L.FOOT_RULE_Y, width: L.INNER_W, height: T.stroke.hair, background: T.hair }} />
      <div style={{ position: "absolute", left: L.X, top: L.FOOT_TOP, display: "flex", alignItems: "center", gap: 14, ...sans(L.FOOT_PX, T.weight.bold, T.text2), letterSpacing: "0.06em" }}>
        <span style={{ width: 10, height: 10, background: T.accent }} />查證截至 <span style={{ ...NUM, fontWeight: 600, color: T.text }}>{asOf}</span>
      </div>
      <div style={{ position: "absolute", right: L.X, top: L.FOOT_TOP, ...NUM, fontWeight: 600, fontSize: L.FOOT_PX, lineHeight: 1.25, color: T.text3, letterSpacing: "0.06em" }}>{String(cur + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}</div>
    </>
  );
};


// ───────────────────────── 哩股哩股 Li 字標與片尾卡 ─────────────────────────
// Li 字標：深藍 L（檔案的直角邊）＋深藍 i 身＋銅紅 i 點。片尾動畫的意思＝「i 點落定」：資料（L、i 身）先就位，最後那一點（查證結果）落下、撞擊、定住。
// 不轉、不繞圈、落定後沒有待機動作。座標 viewBox 0–100。
type LiState = { lv: number; lh: number; stem: number; dotY: number; squash: number };
const LI_DONE: LiState = { lv: 1, lh: 1, stem: 1, dotY: 0, squash: 0 };
/** 正式字標 5C（viewBox 512，translate(27,0)）：L＝M118 104H190V330H340V400H118Z（拆成直邊與底邊兩段畫）；i 身 x276 y214 64×116；i 點 (308,154) r38 */
const LiMark: React.FC<{ size: number; s?: LiState }> = ({ size, s = LI_DONE }) => {
  const sq = s.squash;
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" style={{ display: "block", overflow: "visible" }}>
      <g transform="translate(27,0)">
        <rect x={118} y={330 - 226 * s.lv} width={72} height={226 * s.lv} fill={DE.navy} />
        <rect x={118} y={330} width={222 * s.lh} height={70} fill={DE.navy} opacity={s.lh > 0 ? 1 : 0} />
        <rect x={276} y={330 - 116 * s.stem} width={64} height={116 * s.stem} fill={DE.copper} />
        {s.dotY > -900 ? <ellipse cx={308} cy={154 + s.dotY * 4 + 12 * sq} rx={38 * (1 + 0.28 * sq)} ry={38 * (1 - 0.3 * sq)} fill={DE.copper} /> : null}
      </g>
    </svg>
  );
};
/** 新聞條左邊的小字標（每一鏡、片尾卡都在同一個位置、同一個大小） */
const LiTile: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, background: DE.paper, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <LiMark size={Math.round(size * 0.92)} />
  </div>
);
type EndSpec = { comment?: string; next?: string; tags?: string[] };
/** 固定 seed 的亂數（片尾用；每一幀算出來都一樣） */
const rng = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const easeOut3 = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const easeIn2 = (x: number) => Math.pow(Math.min(1, Math.max(0, x)), 2);
/** 字標座標（viewBox 512，含 translate 27）→ 畫面座標 */
const LX = (x: number) => DE.LOGO_CX - DE.LOGO_S / 2 + ((x + 27) * DE.LOGO_S) / 512;
const LY = (y: number) => DE.LOGO_CY - DE.LOGO_S / 2 + (y * DE.LOGO_S) / 512;
/** 片尾的世界地圖（整張寬 1080：每度 3px），畫在字標後面 */
const EMX = (lon: number) => L.W / 2 + lon * 3, EMY = (lat: number) => DE.MAP_Y + (DE.MAP_LAT - lat) * 3;
const END_MAP = (() => { let d = ""; WORLD.rows.forEach((row: string, r: number) => { const y = EMY(WORLD.lat0 - r * WORLD.step); for (let c = 0; c < row.length; c++) if (row[c] === "1") { const x = EMX(WORLD.lon0 + c * WORLD.step); d += `M${r1(x - 2)} ${r1(y - 2)}h4v4h-4z`; } }); return d; })();
const END_DOTS = (() => { const out: [number, number][] = []; WORLD.rows.forEach((row: string, r: number) => { for (let c = 0; c < row.length; c++) if (row[c] === "1") out.push([EMX(WORLD.lon0 + c * WORLD.step), EMY(WORLD.lat0 - r * WORLD.step)]); }); return out; })();
/** 世界各地的新聞來源點：每一點飛出一張數字／文件碎片，沿弧線收進 L（全球資訊被收進檔案） */
// 選填 endCard.tags（2026/11/22）：本片關鍵字依序換掉碎片上的字（不足 12 個就循環）；位置、時間不變。沒填就是下面的預設字（舊片不變）
const END_CITIES: [number, number, string][] = [[-74, 40.7, "+4.3%"], [-77, 38.9, "8-K"], [-0.1, 51.5, "28.92"], [4.4, 50.9, "2026"], [8.7, 50.1, "±2%"], [139.7, 35.7, "10-Q"], [121.5, 25, "1080"], [116.4, 39.9, "CPI"], [103.8, 1.4, "325"], [-46.6, -23.5, "EPFR"], [-122, 37.4, "Q3"], [72.9, 19.1, "FOMC"]];
const makeFrags = (tags?: string[]) => {
  const r = rng(1115);
  return END_CITIES.map(([lon, lat, dft], k) => {
    const txt = tags?.length ? tags[k % tags.length] : dft;
    const foot = k % 3 === 0, tx = LX(foot ? 140 + r() * 180 : 135 + r() * 40), ty = LY(foot ? 345 + r() * 40 : 125 + r() * 190);
    const sx = EMX(lon), sy = EMY(lat), cx = (sx + tx) / 2 + (r() - 0.5) * 200, cy = Math.min(sy, ty) - 160 - r() * 120;
    return { sx, sy, tx, ty, cx, cy, txt, d: k * 1.1 + r() * 2 };
  });
};
const FRAGS = makeFrags();
const bez = (f: (typeof FRAGS)[number], q: number) => [(1 - q) * (1 - q) * f.sx + 2 * (1 - q) * q * f.cx + q * q * f.tx, (1 - q) * (1 - q) * f.sy + 2 * (1 - q) * q * f.cy + q * q * f.ty] as const;
/** 撞擊時迸開的紙屑（小紙片，往外飛、受重力往下、減速） */
const CONFETTI = (() => { const r = rng(808); return Array.from({ length: 22 }, (_, k) => ({ a: (k / 22) * Math.PI * 2 + r() * 0.25, v: 220 + r() * 260, w: 10 + r() * 14, h: 6 + r() * 6, rot: (r() - 0.5) * 2, c: k % 3 })); })();

const EndCardDossier: React.FC<{ sh: DsShot; f: number; slogan: string; name: string; tag: string }> = ({ sh, f, slogan, name, tag }) => {
  const e = f - sh.start, F = DE.f;
  const spec = (sh.p.endCard ?? {}) as EndSpec;
  const tagKey = (spec.tags ?? []).join("|");
  const frags = useMemo(() => (tagKey ? makeFrags(tagKey.split("|")) : FRAGS), [tagKey]);
  if (e < 0) return null;
  const pin = tween(f, sh.start, NM.cut, EASE.move);
  const ease = (a: number, d: number) => tween(e, a, d, EASE.enter);
  const k = e >= F.impact && e < F.shakeEnd ? 1 - (e - F.impact) / (F.shakeEnd - F.impact) : 0;
  const sx = r1(k * DE.shake * Math.sin((e - F.impact) * 2.7)), sy = r1(k * DE.shake * 0.85 * Math.cos((e - F.impact) * 3.3));
  const solid = ease(F.solid, F.solidDur), stem = ease(F.stem, F.stemDur);
  // 查證章：28 幀從 2.6 倍大、淡淡的樣子加速壓下，36 幀重重蓋下（之後壓扁回彈一下）
  const dq = e < F.stamp ? -1 : Math.min(1, (e - F.stamp) / (F.impact - F.stamp));
  const dScale = dq < 0 ? 0 : dq < 1 ? 2.6 - 1.6 * easeIn2(dq) : 1 + 0.14 * Math.max(0, 1 - (e - F.impact) / 6) * Math.cos((e - F.impact) * 1.4);
  const dOp = dq < 0 ? 0 : dq < 1 ? 0.2 + 0.8 * dq : 1;
  const dcx = LX(308), dcy = LY(154), dr = (38 * DE.LOGO_S) / 512;
  const flash = e >= F.impact ? Math.max(0, 1 - (e - F.impact) / F.flashDur) : 0;
  const scanP = e >= F.scan && e < F.scan + F.scanDur ? (e - F.scan) / F.scanDur : -1;
  const waves = F.wave.map((a) => (e >= a ? 1400 * easeOut3((e - a) / F.waveDur) : -1));
  const mapO = 0.18 + 0.22 * ease(0, 10);
  const chars = [...name];
  return (
    <div style={{ position: "absolute", left: 0, top: DE.TOP, width: L.W, height: DE.BOTTOM - DE.TOP, background: T.bg, clipPath: `inset(0 ${r1(100 * (1 - pin))}% 0 0)`, overflow: "hidden" }}>
      <Backdrop />
      <div style={{ position: "absolute", left: sx, top: sy - DE.TOP, width: L.W, height: L.H }}>
        <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <defs><radialGradient id="endglow"><stop offset="0%" stopColor={DE.glowHi} /><stop offset="35%" stopColor={DE.glow} /><stop offset="100%" stopColor="rgba(208,100,63,0)" /></radialGradient></defs>
          {/* 世界地圖點陣（淡）；撞擊後兩圈銅紅波從字標往外，經過的陸地點亮起 */}
          <path d={END_MAP} fill={DE.mapDot} opacity={r1(mapO)} />
          {e >= F.wave[0] && e < F.wave[1] + F.waveDur + 4 ? END_DOTS.map(([x, y], i) => {
            const dd = Math.hypot(x - DE.LOGO_CX, y - DE.LOGO_CY), hit = Math.max(0, ...waves.map((w) => (w < 0 ? 0 : 1 - Math.abs(dd - w) / 60)));
            return hit > 0.05 ? <rect key={i} x={x - 2.5} y={y - 2.5} width={5} height={5} fill={DE.darkCopper} opacity={r1(hit)} /> : null;
          }) : null}
          {/* 各地新聞來源點：脈衝亮起 → 銅紅連線往字標長出 → 數字／文件碎片沿線飛進來，越近越小、最後收進 L */}
          {frags.map((fr, i) => {
            if (e < fr.d - 3) return null;
            const q = easeOut3((e - fr.d) / F.gatherDur), lineO = e < F.solid ? 1 : Math.max(0, 1 - (e - F.solid) / 10);
            const n = 18, pts: string[] = []; for (let j = 0; j <= n; j++) { const [x, y] = bez(fr, (j / n) * q); pts.push(`${j ? "L" : "M"}${r1(x)} ${r1(y)}`); }
            const [hx, hy] = bez(fr, q), ping = Math.max(0, 1 - (e - fr.d + 3) / 10);
            return <g key={i}>
              {ping > 0 ? <circle cx={fr.sx} cy={fr.sy} r={r1(6 + 22 * (1 - ping))} fill="none" stroke={DE.darkCopper} strokeWidth={2} opacity={r1(ping)} /> : null}
              <rect x={fr.sx - 4} y={fr.sy - 4} width={8} height={8} fill={DE.darkCopper} opacity={r1(lineO)} />
              {q > 0 ? <path d={pts.join("")} fill="none" stroke={DE.darkCopper} strokeWidth={2} strokeDasharray="6 6" opacity={r1(0.8 * lineO)} /> : null}
              {q > 0 && q < 1 ? <g transform={`translate(${r1(hx)},${r1(hy)}) scale(${r1(1.2 - 0.8 * q)})`}>
                <rect x={-58} y={-24} width={116} height={48} fill={DE.paper} />
                <text x={0} y={10} textAnchor="middle" style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 28 }} fill={DE.navy}>{fr.txt}</text>
              </g> : null}
            </g>;
          })}
          {flash > 0 ? <circle cx={dcx} cy={dcy} r={r1(dr * (2.4 + 8 * (1 - flash)))} fill="url(#endglow)" opacity={r1(flash)} /> : null}
          {/* L：碎片到齊後實心化（米白），i 身升起（銅紅） */}
          <path d={`M${LX(118)} ${LY(104)}H${LX(190)}V${LY(330)}H${LX(340)}V${LY(400)}H${LX(118)}Z`} fill={DE.darkL} opacity={r1(solid)} />
          <rect x={LX(276)} y={LY(330) - (LY(330) - LY(214)) * stem} width={LX(340) - LX(276)} height={(LY(330) - LY(214)) * stem} fill={DE.darkCopper} />
          {/* 查證章（i 點）：蓋下前外面有一圈雙線章框，蓋下的瞬間章框放大成第一圈震波 */}
          {dq >= 0 ? <>
            {e < F.impact ? <circle cx={dcx} cy={dcy} r={r1(dr * dScale * 1.9)} fill="none" stroke={DE.darkCopper} strokeWidth={3} opacity={r1(dOp * 0.8)} /> : null}
            <circle cx={dcx} cy={dcy} r={r1(dr * dScale)} fill={DE.darkCopper} opacity={r1(dOp)} />
          </> : null}
          {F.ring.map((a, j) => { const q = (e - a) / F.ringDur; return q > 0 && q < 1 ? <circle key={j} cx={dcx} cy={dcy} r={r1(dr * 1.9 + 520 * easeOut3(q))} fill="none" stroke={DE.darkCopper} strokeWidth={r1(9 * (1 - q) + 1)} opacity={r1(1 - q)} /> : null; })}
          {/* 紙屑迸散（往外、受重力、減速） */}
          {e >= F.spark && e < F.spark + F.sparkDur ? CONFETTI.map((c, j) => {
            const tt = (e - F.spark) / F.sparkDur, d = c.v * easeOut3(tt), x = dcx + Math.cos(c.a) * (dr + d), y = dcy + Math.sin(c.a) * (dr + d) + 260 * tt * tt;
            return <rect key={j} x={r1(x - c.w / 2)} y={r1(y - c.h / 2)} width={r1(c.w)} height={r1(c.h)} fill={c.c === 0 ? DE.darkCopper : c.c === 1 ? DE.paper : T.text3} opacity={r1(1 - tt)} transform={`rotate(${r1(c.rot * 140 * tt)} ${r1(x)} ${r1(y)})`} />;
          }) : null}
        </svg>
      </div>
      {/* 撞擊閃白（4 幀） */}
      {e >= F.impact && e < F.impact + 4 ? <div style={{ position: "absolute", inset: 0, background: DE.flashFull, opacity: r1(DE.flashO * (1 - (e - F.impact) / 4)) }} /> : null}
      {/* 新聞條式掃描光：一道帶銅紅邊的亮帶由左橫掃到右 */}
      {scanP >= 0 ? <div style={{ position: "absolute", top: DE.LOGO_CY - DE.LOGO_S / 2 - DE.TOP, height: DE.LOGO_S, left: r1(-200 + (L.W + 400) * easeOut3(scanP)), width: 140, background: `linear-gradient(90deg, rgba(251,250,246,0) 0%, ${DE.scanHi} 70%, ${DE.darkCopper} 100%)`, opacity: r1(0.55 * Math.sin(Math.PI * scanP)) }} /> : null}
      <div style={{ position: "absolute", left: 0, width: L.W, top: DE.NAME_Y - DE.TOP, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 6 }}>
        {chars.map((c, i) => { const a = F.name[Math.min(i, F.name.length - 1)]; return <span key={i} style={{ ...serif(DE.NAME_PX), lineHeight: 1, opacity: e >= a ? 1 : 0, transform: `translateY(${e >= a ? r1(14 * (1 - ease(a, 5))) : 0}px)` }}>{c}</span>; })}
        <span style={{ ...serif(DE.TAG_PX, T.weight.serif, T.text2), lineHeight: 1, marginLeft: 18, opacity: ease(F.tag, 6) }}>｜{tag}</span>
      </div>
      <div style={{ position: "absolute", left: (L.W - 560) / 2, top: DE.RULE_Y - DE.TOP, width: r1(560 * ease(F.rule, F.ruleDur)), height: T.stroke.mark, background: DE.darkCopper }} />
      <div style={{ position: "absolute", left: 0, width: L.W, top: DE.SLOGAN_Y - DE.TOP, textAlign: "center", ...sans(DE.SLOGAN_PX, T.weight.bold, T.text2), letterSpacing: "0.3em", opacity: ease(F.slogan, 8) }}>{slogan}</div>
      {spec.next ? <div style={{ position: "absolute", left: 0, width: L.W, top: DE.NEXT_Y - DE.TOP, textAlign: "center", ...sans(DE.NEXT_PX, T.weight.bold, T.text), opacity: ease(F.next, 6) }}><span style={{ color: T.accentText, letterSpacing: "0.2em" }}>下一集 ▸ </span>{spec.next}</div> : null}
      {spec.comment ? <div style={{ position: "absolute", left: 0, width: L.W, top: DE.CMT_Y - DE.TOP, display: "flex", justifyContent: "center", opacity: ease(F.cmt, 6) }}>
        <div style={{ padding: "16px 34px", border: `2px solid ${T.accent}`, ...sans(DE.CMT_PX, T.weight.bold, T.text) }}>留言「<span style={{ color: T.accentText }}>{spec.comment}</span>」拿完整資料</div>
      </div> : null}
    </div>
  );
};

// ───────────────────────── 「國際新聞」版（script.json 頂層有 news） ─────────────────────────
// 頂部新聞條＋電頭、下三分之一標題條（取代左邊紅線的字幕）、出處、點陣世界地圖（淡背景，標出地點與連線）、底部跑馬燈、橫向擦切。
// 顏色與時間讀 THEME_DOSSIER.news，版面讀 LAYOUT_DOSSIER_NEWS。不放任何媒體或公司的商標圖案，媒體名只用文字。
type Place = { zh: string; en: string; lon: number; lat: number };
type NewsSpec = { layout?: "fill"; /** 左上新聞條的頻道字樣（哩股哩股預設 LIGULIGU，和網站站名一致；使用者 2026/11/15） */ mark?: string; section: string; sectionEn?: string; places?: Record<string, Place>; link?: { from: string; to: string; at: string }; /** 選填：底部欄右側改放固定短字（不跑馬燈，不會被「查證截至」徽章切到） */ tickerStatic?: string; /** 選填（2026/11/22）：字幕條英文字級（填了就改用較亮的字色，沒填＝CAP_EN_PX） */ capEnPx?: number };
type ShotNews = { dateline?: string; place?: string; lt?: string };
const shotNews = (sh: DsShot): ShotNews => (sh.p.news ?? {}) as ShotNews;
const curShot = (shots: DsShot[], f: number) => { let c = shots[0]; for (const sh of shots) if (f >= sh.start) c = sh; return c; };
const mapX = (lon: number, ln: LNT = LN as unknown as LNT) => L.W / 2 + (lon - ln.MAP_LON_C) * ln.MAP_K;
const mapY = (lat: number, ln: LNT = LN as unknown as LNT) => ln.MAP_LAT_Y + (ln.MAP_LAT_REF - lat) * ln.MAP_K;
/** 點陣陸地與經緯線（不會動，只算一次） */
const MAP_CACHE = new Map<number, { dots: string; grat: string }>();
const mapStatic = (ln: LNT) => {
  const hit = MAP_CACHE.get(ln.MAP_LAT_Y * 10000 + ln.MAP_TOP); if (hit) return hit;
  let dots = "", grat = "";
  const d = ln.MAP_DOT, h = d / 2;
  WORLD.rows.forEach((row: string, r: number) => {
    const y = mapY(WORLD.lat0 - r * WORLD.step, ln);
    if (y < ln.MAP_TOP || y > L.H + d) return;
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== "1") continue;
      const x = mapX(WORLD.lon0 + c * WORLD.step, ln);
      if (x > -d && x < L.W + d) dots += `M${r1(x - h)} ${r1(y - h)}h${d}v${d}h${-d}z`;
    }
  });
  for (let lon = -180; lon <= 180; lon += 10) { const x = mapX(lon, ln); if (x >= 0 && x <= L.W) grat += `M${r1(x)} ${ln.MAP_TOP}V${L.H}`; }
  for (let lat = 80; lat >= -60; lat -= 10) { const y = mapY(lat, ln); if (y >= ln.MAP_TOP && y <= L.H) grat += `M0 ${r1(y)}H${L.W}`; }
  const out = { dots, grat }; MAP_CACHE.set(ln.MAP_LAT_Y * 10000 + ln.MAP_TOP, out); return out;
};
/** 淡背景世界地圖：地點（方點＋名稱）、目前這一鏡的地點有往外擴的脈衝圈、兩地之間的連線（描出來之後有光點沿線走） */
const WorldMap: React.FC<{ news: NewsSpec; shots: DsShot[]; f: number; linkAt: number }> = ({ news, shots, f, linkAt }) => {
  const ln = useLN(), MS = mapStatic(ln);
  const places = news.places ?? {}, active = shotNews(curShot(shots, f)).place, cur = curShot(shots, f);
  const firstAt = (id: string) => {
    const sh = shots.find((x) => shotNews(x).place === id), a = sh ? (sh.index === 0 ? -9999 : sh.start + 2) : Infinity;
    return news.link && news.link.to === id ? Math.min(a, linkAt + M.draw - 4) : a;
  };
  const A = news.link ? places[news.link.from] : undefined, B = news.link ? places[news.link.to] : undefined;
  const ax = A ? mapX(A.lon, ln) : 0, ay = A ? mapY(A.lat, ln) : 0, bx = B ? mapX(B.lon, ln) : 0, by = B ? mapY(B.lat, ln) : 0, cx = (ax + bx) / 2, cy = Math.min(ay, by) - 44;
  const lp = drawP(f, linkAt), q = lp >= 1 ? ((f - linkAt - M.draw) % NM.pulse) / NM.pulse : -1;
  const bez = (t: number) => [(1 - t) * (1 - t) * ax + 2 * (1 - t) * t * cx + t * t * bx, (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * cy + t * t * by];
  const ring = ((f - (cur.index === 0 ? 0 : cur.start)) % NM.ping) / NM.ping;
  return (
    <>
      <svg width={L.W} height={L.H} viewBox={`0 0 ${L.W} ${L.H}`} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={MS.grat} fill="none" stroke={N.mapGrat} strokeWidth={1} />
        <path d={MS.dots} fill={N.mapDot} />
        {A && B && lp > 0 ? <path d={`M ${r1(ax)} ${r1(ay)} Q ${r1(cx)} ${r1(cy)} ${r1(bx)} ${r1(by)}`} fill="none" stroke={T.accent} strokeWidth={T.stroke.hair} {...pen(lp)} /> : null}
        {q >= 0 ? <circle cx={r1(bez(q)[0])} cy={r1(bez(q)[1])} r={5} fill={T.text} /> : null}
        {Object.entries(places).map(([id, pl]) => {
          if (f < firstAt(id)) return null;
          const x = mapX(pl.lon, ln), y = mapY(pl.lat, ln), on = id === active;
          return (
            <React.Fragment key={id}>
              {on ? <circle cx={r1(x)} cy={r1(y)} r={r1(8 + 24 * ring)} fill="none" stroke={T.accent} strokeWidth={T.stroke.hair} opacity={r1(1 - ring)} /> : null}
              <rect x={r1(x - 7)} y={r1(y - 7)} width={14} height={14} fill={on ? T.accent : T.text2} />
            </React.Fragment>
          );
        })}
      </svg>
      {Object.entries(places).map(([id, pl]) => {
        const at = firstAt(id);
        if (f < at) return null;
        const on = id === active;
        return (
          <div key={id} style={{ position: "absolute", left: mapX(pl.lon, ln) - 200, width: 400, top: mapY(pl.lat, ln) + 16, display: "flex", justifyContent: "center", opacity: fadeP(f, at) }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "2px 10px", background: N.mapLabelBg }}>
              <span style={{ ...sans(ln.MAP_LABEL_PX, T.weight.bold, on ? T.text : T.text2), lineHeight: 1.15 }}>{pl.zh}</span>
              <span style={{ ...NUM, fontWeight: 600, fontSize: ln.MAP_LABEL_PX, lineHeight: 1.15, color: on ? T.text2 : T.text3, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{pl.en}</span>
            </div>
          </div>
        );
      })}
    </>
  );
};
/** 頂部新聞條：紅底頻道字標＋欄目（國際｜INTERNATIONAL）＋右邊頻道標語；下緣一條細線兼全片進度；再下面一行電頭（地點・日期，換鏡時重打）與鏡號 */
const NewsBar: React.FC<{ name: string; tag: string; news: NewsSpec; shots: DsShot[]; f: number; progress: number }> = ({ name, tag, news, shots, f, progress }) => {
  const ln = useLN();
  const cur = curShot(shots, f), dl = shotNews(cur).dateline, at = cur.index === 0 ? -9999 : cur.start + 2;
  // 換鏡時只重打和上一鏡不同的部分（地點相同就只打日期），電頭不會有一大段時間只剩半句
  const prevDl = cur.index > 0 ? shotNews(shots[cur.index - 1]).dateline ?? "" : "";
  let keep = 0; if (dl) { while (keep < dl.length && keep < prevDl.length && dl[keep] === prevDl[keep]) keep++; const sep = dl.indexOf("・"); if (keep < dl.length) keep = sep >= 0 && keep > sep ? sep + 1 : 0; }
  return (
    <>
      <div data-box="header" style={{ position: "absolute", left: L.X, top: ln.BAR_TOP, width: L.INNER_W, height: ln.BAR_H, background: N.barBg, display: "flex", alignItems: "stretch" }}>
        <LiTile size={ln.BAR_H} /><div style={{ background: N.red, padding: "0 22px", display: "flex", alignItems: "center" }}><span style={{ ...serif(ln.MARK_PX, T.weight.serif, N.onRed), letterSpacing: "0.1em", lineHeight: 1 }}>{news.mark ?? (name === "哩股哩股" ? "LIGULIGU" : name)}</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, paddingLeft: 20 }}>
          <span style={{ ...sans(ln.SEC_PX, T.weight.bold), letterSpacing: "0.12em", lineHeight: 1 }}>{news.section}</span>
          {news.sectionEn ? <><span style={{ width: T.stroke.hair, height: 28, background: T.line }} /><span style={{ ...NUM, fontWeight: 600, fontSize: ln.SEC_EN_PX, lineHeight: 1, color: T.text2, letterSpacing: "0.14em" }}>{news.sectionEn}</span></> : null}
        </div>
        <div style={{ marginLeft: "auto", paddingRight: 20, display: "flex", alignItems: "center", ...sans(L.TAG_PX, T.weight.bold, T.text3), letterSpacing: "0.3em" }}>{tag}</div>
      </div>
      <div style={{ position: "absolute", left: L.X, top: ln.BAR_TOP + ln.BAR_H, width: L.INNER_W, height: ln.PROG_H, background: T.hair }} />
      <div style={{ position: "absolute", left: L.X, top: ln.BAR_TOP + ln.BAR_H, width: r1(L.INNER_W * progress), height: ln.PROG_H, background: T.text2 }} />
      <div data-box="header" style={{ position: "absolute", left: L.X, top: ln.DL_TOP, height: 36, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 12, height: 12, background: T.accent, opacity: f >= at && f < at + M.flash && Math.floor((f - at) / 4) % 2 === 0 ? 0.25 : 1 }} />
        {dl ? <span style={{ ...NUM, fontWeight: 600, fontSize: ln.DL_PX, lineHeight: 1, color: T.text, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{dl.slice(0, keep)}<Typed text={dl.slice(keep)} f={f} at={at} per={NM.dl} /></span> : null}
      </div>
      <div style={{ position: "absolute", right: L.X, top: ln.DL_TOP, height: 36, display: "flex", alignItems: "center", ...NUM, fontWeight: 600, fontSize: ln.DL_PX, color: T.text3, letterSpacing: "0.06em" }}>{String(cur.index + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}</div>
    </>
  );
};
/** 下三分之一標題條：紅色欄目籤（這一鏡在講什麼）＋深色條，左邊紅色粗邊；中文一次一段、英文跟著換，換段時從左邊擦出來。條本身一直在。 */
const LowerThird: React.FC<{ cues: Cap[]; shots: DsShot[]; f: number; fixed?: string; capEnPx?: number }> = ({ cues, shots, f, fixed, capEnPx }) => {
  const ln = useLN();
  const cur = curShot(shots, f), label = shotNews(cur).lt;
  if (cur.panel === "end" && f >= cur.start) return null;
  const cue = cues.find((c) => f >= c.window[0] && f < c.window[1]) ?? cues[cues.length - 1];
  let zh: React.ReactNode = fixed ?? null, en = "", p = 1;
  if (!fixed && cue && cue.phrases.length) {
    let k = 0; cue.phrases.forEach((ph, i) => { if (f >= ph.start) k = i; });
    const ens = enSplit(cue.en), from = Math.max(cue.window[0], cue.phrases[k].start);
    zh = kwSpans(cue.phrases[k].text.replace(/[，、；：]$/, ""), cue.keywords);
    en = ens[Math.min(ens.length - 1, Math.floor((k * ens.length) / cue.phrases.length))] ?? "";
    p = from === 0 ? 1 : 0.25 + 0.75 * tween(f, from, NM.lt, EASE.enter); // 換段的第一幀就露出四分之一，標題條不會空一格
  }
  const lp = cur.index === 0 ? 1 : tween(f, cur.start, NM.lt, EASE.enter);
  return (
    <>
      {label ? <div data-box="subtitle" style={{ position: "absolute", left: L.X, top: ln.LT_TAB_TOP, height: ln.LT_TAB_H, padding: "0 20px", background: N.red, display: "flex", alignItems: "center", clipPath: clip(lp, "right") }}><span style={{ ...sans(ln.LT_TAB_PX, T.weight.bold, N.onRed), letterSpacing: "0.2em", lineHeight: 1 }}>{label}</span></div> : null}
      <div data-box="subtitle" style={{ position: "absolute", left: L.X, top: ln.LT_TOP, width: L.INNER_W, height: ln.LT_H, boxSizing: "border-box", background: N.ltBg, borderLeft: `${ln.LT_EDGE}px solid ${N.red}`, borderTop: `${T.stroke.hair}px solid ${T.panelLine}`, borderBottom: `${T.stroke.hair}px solid ${T.panelLine}`, paddingLeft: ln.LT_PAD, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ clipPath: clip(p, "right") }}>
          <div style={fixed ? { ...serif(ln.CAP_ZH_PX + 4), lineHeight: 1.3 } : { ...sans(ln.CAP_ZH_PX, T.weight.sub), lineHeight: 1.3 }}>{zh}</div>
          {en ? <div style={{ marginTop: 6, fontFamily: FONT_EN, fontWeight: capEnPx ? 500 : 400, fontSize: capEnPx ?? ln.CAP_EN_PX, lineHeight: 1.3, color: capEnPx ? T.text : T.text2, whiteSpace: "nowrap" }}>{en}</div> : null}
        </div>
      </div>
    </>
  );
};
/** 出處（每鏡一行，換鏡時擦入）＋底部跑馬燈：左邊固定「查證截至」，右邊全片的來源一直往左走 */
const SourceTicker: React.FC<{ shots: DsShot[]; f: number; asOf: string; fixedText?: string }> = ({ shots, f, asOf, fixedText }) => {
  const ln = useLN();
  const cur = curShot(shots, f), sp = cur.index === 0 ? 1 : tween(f, cur.start + 2, NM.lt + 2, EASE.enter);
  const items = [...new Set(shots.flatMap((sh) => sh.sources))];
  const estW = items.reduce((a, t) => a + [...t].reduce((b, ch) => b + (ch.charCodeAt(0) < 256 ? 0.56 : 1), 0) * ln.TICK_PX + 64, 0);
  const frac = ((f * NM.tick) % estW) / estW;
  const row = (k: number) => <div key={k} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{items.map((t, i) => <React.Fragment key={i}><span style={{ ...sans(ln.TICK_PX, T.weight.body, T.text2), lineHeight: 1 }}>{t}</span><span style={{ width: 8, height: 8, margin: "0 28px", background: T.text3, flexShrink: 0 }} /></React.Fragment>)}</div>;
  return (
    <>
      {cur.sources.length ? <div data-box="source" style={{ position: "absolute", left: L.X, width: L.INNER_W, top: ln.SRC_TOP, clipPath: clip(sp, "right"), ...sans(ln.SRC_PX, T.weight.body, T.text2) }}>來源：{cur.sources.join("；")}</div> : null}
      <div data-box="ticker" style={{ position: "absolute", left: L.X, top: ln.TICK_TOP, width: L.INNER_W, height: ln.TICK_H, background: N.tickBg, boxSizing: "border-box", borderTop: `${T.stroke.hair}px solid ${T.panelLine}`, display: "flex", alignItems: "stretch", overflow: "hidden" }}>
        <div style={{ background: N.red, padding: "0 18px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, zIndex: 1, ...sans(ln.TICK_PX, T.weight.bold, N.onRed), letterSpacing: "0.04em", lineHeight: 1 }}>查證截至 <span style={{ ...NUM, fontWeight: 700 }}>{asOf}</span></div>
        <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
          {fixedText ? <div style={{ position: "absolute", left: 24, top: 0, height: "100%", display: "flex", alignItems: "center", whiteSpace: "nowrap", ...sans(ln.TICK_PX, T.weight.body, T.text2), lineHeight: 1 }}>{fixedText}</div> : <div style={{ position: "absolute", left: 24, top: 0, height: "100%", display: "flex", alignItems: "center", transform: `translateX(${r1(-50 * frac)}%)` }}>{row(0)}{row(1)}</div>}
        </div>
      </div>
    </>
  );
};
/** 換鏡的條帶：一條紅線帶著一段暗影從左掃到右（和 Shot 的橫向擦切同步） */
const SweepBand: React.FC<{ shots: DsShot[]; f: number }> = ({ shots, f }) => {
  const ln = useLN();
  const sh = shots.find((x) => x.index > 0 && f >= x.start && f < x.start + NM.cut);
  if (!sh) return null;
  const x = L.W * tween(f, sh.start, NM.cut, EASE.move);
  return (
    <div style={{ position: "absolute", left: r1(x - NM.band), top: ln.STAGE_TOP - 10, width: NM.band + T.stroke.mark, height: r1(L.STAGE_H * ln.STAGE_SCALE) + 20 }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${N.bandShade0} 0%, ${N.bandShade} 100%)` }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: T.stroke.mark, background: T.accent }} />
    </div>
  );
};

/** 版面量測（scripts/dossier/overlap-check.mjs 用）：輸入屬性帶 __probe 才掛上，把 data-box 元素的框印到 console，不影響畫面 */
const BoxProbe: React.FC<{ f: number }> = ({ f }) => {
  useEffect(() => {
    const h = delayRender("box-probe");
    const done = () => {
      const out = Array.from(document.querySelectorAll("[data-box]")).map((el) => {
        const e = el as HTMLElement, r = e.getBoundingClientRect(), g = document.createRange(); g.selectNodeContents(e);
        const t = g.getBoundingClientRect(), cs = getComputedStyle(e);
        return { kind: e.dataset.box, x: r.left, y: r.top, w: r.width, h: r.height, tx: t.left, ty: t.top, tw: t.width, th: t.height, sw: e.scrollWidth, cw: e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight, op: Number(cs.opacity), ov: cs.overflow, text: (e.textContent ?? "").slice(0, 24) };
      });
      console.log("@@BOXES@@" + JSON.stringify({ f, boxes: out }));
      continueRender(h);
    };
    document.fonts.ready.then(() => setTimeout(done, 300));
  }, []);
  return null;
};

export const VideoDossier: React.FC<Script & { timeline: TimelineV2 }> = (props) => {
  const { slug, scenes, timeline, channel, asOf } = props;
  const news = (props as { news?: NewsSpec }).news;
  useSerif();
  const f = useCurrentFrame();
  const m = useMemo(() => buildDossier(scenes, timeline, { cut: !!news }), [scenes, timeline, news]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const caps: Cap[] = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ en: s.subtitle.en, keywords: s.keywords ?? [], window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines }));
  const audio = timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
    <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
  ));
  if (news) return (
    <LNC.Provider value={(news.layout === "fill" ? LNF : LN) as unknown as LNT}>
    <AbsoluteFill style={{ background: T.bg }}>
      <Backdrop />
      <WorldMap news={news} shots={m.shots} f={f} linkAt={news.link ? m.time(news.link.at, 0) : 1e9} />
      {m.shots.map((sh) => <Shot key={sh.id} sh={sh} f={f} slug={slug} cut />)}
      <SweepBand shots={m.shots} f={f} />
      <LowerThird cues={caps} shots={m.shots} f={f} capEnPx={news.capEnPx} />
      <SourceTicker shots={m.shots} f={f} asOf={asOf} fixedText={news.tickerStatic} />
      {m.shots.filter((sh) => sh.panel === "end").map((sh) => <EndCardDossier key={sh.id} sh={sh} f={f} name={channel?.name ?? "哩股哩股"} tag={channel?.tag ?? "查到底"} slogan={channel?.slogan ?? "數字，查過再信"} />)}
      <NewsBar name={channel?.name ?? "哩股哩股"} tag={channel?.tag ?? "查到底"} news={news} shots={m.shots} f={f} progress={f / Math.max(1, m.total - 1)} />
      {audio}
      {(props as { __probe?: boolean }).__probe ? <BoxProbe f={f} /> : null}
    </AbsoluteFill>
    </LNC.Provider>
  );
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Backdrop />
      {m.shots.map((sh) => <Shot key={sh.id} sh={sh} f={f} slug={slug} />)}
      <Header name={channel?.name ?? "哩股哩股"} tag={channel?.tag ?? "查到底"} progress={f / Math.max(1, m.total - 1)} />
      <Caption cues={caps} f={f} />
      <Footer shots={m.shots} f={f} asOf={asOf} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：第一鏡做完的樣子＋一句副標 */
export const CoverDossier: React.FC<Script> = (props) => {
  const { slug, scenes, cover, channel, asOf } = props;
  const news = (props as { news?: NewsSpec }).news;
  useSerif();
  const c = (cover ?? {}) as { sub?: string };
  const sh = staticShot(scenes[0]);
  if (news) {
    const s0 = { ...sh, index: 0, start: 0 };
    return (
      <LNC.Provider value={(news.layout === "fill" ? LNF : LN) as unknown as LNT}>
      <AbsoluteFill style={{ background: T.bg }}>
        <Backdrop />
        <WorldMap news={news} shots={[s0]} f={0} linkAt={1e9} />
        <Shot sh={{ ...s0, start: -9999 }} f={0} slug={slug} cut />
        <NewsBar name={channel?.name ?? "哩股哩股"} tag={channel?.tag ?? "查到底"} news={news} shots={[s0]} f={0} progress={0} />
        <LowerThird cues={[]} shots={[s0]} f={0} fixed={c.sub ?? ""} />
        <SourceTicker shots={[s0]} f={0} asOf={asOf} />
      </AbsoluteFill>
      </LNC.Provider>
    );
  }
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Backdrop />
      <Shot sh={sh} f={0} slug={slug} />
      <Header name={channel?.name ?? "哩股哩股"} tag={channel?.tag ?? "查到底"} progress={0} />
      {c.sub ? <div style={{ position: "absolute", left: L.X, top: L.CAP_TOP, paddingLeft: L.CAP_PAD, borderLeft: `${L.CAP_BAR}px solid ${T.accent}`, ...serif(L.CAP_ZH_PX + 8) }}>{c.sub}</div> : null}
      <Footer shots={[sh]} f={0} asOf={asOf} />
    </AbsoluteFill>
  );
};
