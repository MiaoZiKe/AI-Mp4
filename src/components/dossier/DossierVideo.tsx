// 檔案室式（styleVersion 3 ＋ stage: "dossier"）：哩股哩股頻道的「專業嚴肅版」。
// 墨藍炭灰底加細格線；襯線大標、黑體內文、等寬數字；白灰字只加一個深紅強調與一個「已確定」用的冷色。
// 文件摹本是淺色紙面卡片，空白處用細紅框與引線標註；查證狀態是單色小標；照片黑白低對比、圖說都標「示意」。
// 動作只有：遮罩擦入、線條描出、打字、淡入、紅框閃一下、每鏡慢推；不彈跳、不搖晃。
// 時間全部來自 timeline（engine.ts）；顏色與版面讀 THEME_DOSSIER／LAYOUT_DOSSIER。照片：public/dossier/<slug>/（scripts/dossier/make-photos.py）。
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, Img, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_DOSSIER_SERIF as SERIF, FONT_EN, FONT_ZH, FPS, LAYOUT_DOSSIER as L, THEME_DOSSIER as T } from "../../theme";
import { EASE, linear, tween } from "../anim";
import { buildDossier, staticShot, type DsShot } from "./engine";

const M = T.motion;
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
  return <div style={{ position: "absolute", ...style, clipPath: clip(p, dir), opacity: Math.min(1, p * 3) }}>{children}</div>;
};
/** 淡入 */
const Fade: React.FC<{ f: number; at: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ f, at, style, children }) => {
  const p = fadeP(f, at);
  if (p <= 0) return null;
  return <div style={{ position: "absolute", ...style, opacity: p }}>{children}</div>;
};
/** 一條描出來的直線（水平或垂直） */
const Rule: React.FC<{ f: number; at: number; x: number; y: number; len: number; vertical?: boolean; color?: string; w?: number; dur?: number }> = ({ f, at, x, y, len, vertical, color = T.hair, w = T.stroke.hair, dur }) => {
  const p = drawP(f, at, dur);
  if (p <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, width: vertical ? w : r1(len * p), height: vertical ? r1(len * p) : w, background: color }} />;
};
/** 打字機：字一個一個出現，還沒出現的字先佔位（版面不跳） */
const Typed: React.FC<{ text: string; f: number; at: number }> = ({ text, f, at }) => {
  const chars = [...text], n = Math.max(0, Math.min(chars.length, Math.floor((f - at) / M.type) + 1));
  return <>{chars.slice(0, f < at ? 0 : n).join("")}<span style={{ opacity: 0 }}>{chars.slice(f < at ? 0 : n).join("")}</span></>;
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
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14, height: h, padding: `0 ${big ? 28 : 20}px 0 ${big ? 24 : 18}px`, border: `${T.stroke.hair}px solid ${c}`, background: T.bg, boxSizing: "border-box", clipPath: clip(p, "right"), opacity: Math.min(1, p * 3) }}>
      <span style={{ width: 12, height: 12, boxSizing: "border-box", background: tag.kind === "pending" ? "transparent" : c, border: `${T.stroke.hair}px solid ${c}` }} />
      <span style={{ ...sans(px, T.weight.bold, c), letterSpacing: "0.08em", lineHeight: 1 }}>{tag.text}</span>
    </div>
  );
};

/** 黑白低對比照片：遮罩擦入、極慢推近、細框；圖說在照片下面（都要標「示意」） */
const Photo: React.FC<{ slug: string; name: string; f: number; at: number; x: number; y: number; w: number; h: number; caption?: string; life: number; children?: React.ReactNode }> = ({ slug, name, f, at, x, y, w, h, caption, life, children }) => {
  const p = wipeP(f, at, M.wipe + 4);
  if (p <= 0) return null;
  const s = 1 + M.photoPush * linear(f, at, Math.max(1, life));
  return (
    <>
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", clipPath: clip(p, "down"), boxShadow: `inset 0 0 0 ${T.stroke.hair}px ${T.hair}` }}>
        <Img src={staticFile(`dossier/${slug}/${name}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${s.toFixed(4)})` }} />
        <div style={{ position: "absolute", inset: 0, background: T.photoTint, boxShadow: `inset 0 0 0 ${T.stroke.hair}px ${T.hair}` }} />
        {children}
      </div>
      {caption ? <div style={{ position: "absolute", left: x, top: y + h + 10, ...sans(L.NOTE_PX, T.weight.body, T.text3), opacity: fadeP(f, at + M.wipe) }}>{caption}</div> : null}
    </>
  );
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
const Note: React.FC<{ text?: string; x: number; y: number; f: number; at: number }> = ({ text, x, y, f, at }) => text ? <div style={{ position: "absolute", left: x, top: y, ...sans(L.NOTE_PX, T.weight.body, T.text3), opacity: fadeP(f, at) }}>{text}</div> : null;
const StageSvg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={L.INNER_W} height={L.STAGE_H} viewBox={`0 0 ${L.INNER_W} ${L.STAGE_H}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>{children}</svg>;
/** 細紅框：描出來，描完閃一下；flashAt 再閃一次 */
const RedFrame: React.FC<{ f: number; at: number; flashAt?: number; x: number; y: number; w: number; h: number }> = ({ f, at, flashAt, x, y, w, h }) => {
  const p = drawP(f, at);
  if (p <= 0) return null;
  const o = Math.min(flash(f, at + M.draw), flashAt === undefined ? 1 : flash(f, flashAt));
  return <rect x={x} y={y} width={w} height={h} fill={T.accent} fillOpacity={o < 1 ? 0.16 : 0} stroke={T.accent} strokeWidth={T.stroke.frame} opacity={o < 1 ? 0.45 : 1} {...pen(p)} />;
};

type PanelProps = { sh: DsShot; f: number; slug: string };

// ── 鏡 1 鉤子：大字＋公告摹本（掃描線、原因欄紅框、引線「公告：沒寫原因」） ──
const Hook: React.FC<PanelProps> = ({ sh, f }) => {
  const p = sh.p, d = p.doc, c = p.callout;
  const DX = 0, DY = 508, DW = 540, DH = 360, FX = 246, FY = 150, FW = 260, FH = 70; // 文件框與「原因」空白欄（相對文件）
  const fx = DX + FX, fy = DY + FY, midY = fy + FH / 2, cx = 596;
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
        {Math.floor(f / M.caret) % 2 === 0 ? <div style={{ position: "absolute", left: FX + 16, top: FY + 14, width: 4, height: FH - 28, background: T.accentOnPaper }} /> : null}
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
      <Note text={d.note} x={DX} y={DY + DH + 12} f={f} at={sh.start} />
      <StageSvg>
        <RedFrame f={f} at={d.frameAt} flashAt={d.flashAt} x={fx} y={fy} w={FW} h={FH} />
        <path d={`M ${fx + FW} ${midY} H ${cx - 30} V ${DY + 76} H ${cx}`} fill="none" stroke={T.accent} strokeWidth={T.stroke.hair} {...pen(drawP(f, c.at))} opacity={drawP(f, c.at) > 0 ? 1 : 0} />
      </StageSvg>
      <Fade f={f} at={c.at + 4} style={{ left: cx + 14, top: DY + 14, ...sans(32, T.weight.bold, T.text2), letterSpacing: "0.2em" }}>{c.label}</Fade>
      <Reveal f={f} at={c.at + 6} style={{ left: cx + 12, top: DY + 62, paddingBottom: 14, ...serif(76) }}><Marked f={f} at={c.markAt} w={T.stroke.line} gap={4}>{c.text}</Marked></Reveal>
      {p.tag ? <div style={{ position: "absolute", left: cx + 14, top: DY + 196 }}><Tag tag={p.tag} f={f} /></div> : null}
    </>
  );
};

// ── 鏡 2 時間線：細線與刻度、兩個節點、中間的缺口；左邊聲明摹本、右邊辭職 ──
const Timeline: React.FC<PanelProps> = ({ sh, f, slug }) => {
  const p = sh.p, ax = p.axis, days: string[] = ax.days, n = days.length;
  const X0 = 44, X1 = 876, AY = 376, CY = 446, CH = 400, LW = 520, RX = 550, RW = 370;
  const dx = (i: number) => X0 + ((X1 - X0) * i) / (n - 1);
  const ap = drawP(f, ax.at, M.draw + 8), gp = drawP(f, p.gap.at), gflash = flash(f, p.gap.flashAt);
  const l = p.left, r = p.right;
  return (
    <>
      <Photo slug={slug} name={p.photo.name} f={f} at={p.photo.at} x={0} y={0} w={L.INNER_W} h={206} caption={p.photo.caption} life={sh.end - sh.start} />
      {/* 軸與刻度 */}
      <Rule f={f} at={ax.at} x={X0} y={AY} len={X1 - X0} color={T.line} dur={M.draw + 8} />
      {days.map((d, i) => {
        const on = ap * (n - 1) >= i - 0.01, end = i === 0 || i === n - 1;
        return on ? (
          <React.Fragment key={d}>
            <div style={{ position: "absolute", left: dx(i) - 1, top: AY - (end ? 14 : 8), width: T.stroke.hair, height: end ? 30 : 18, background: end ? T.text : T.line }} />
            {end ? <div style={{ position: "absolute", top: AY - 84, ...(i === 0 ? { left: dx(i) - 4 } : { right: L.INNER_W - dx(i) - 4 }), ...NUMB, fontWeight: T.weight.num, fontSize: 56, lineHeight: 1, color: T.text }}>{d}</div>
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
const Versus: React.FC<PanelProps> = ({ sh, f }) => {
  const p = sh.p, l = p.left, r = p.right, CW = 445, RX = 475, TOP = 30, CY = TOP + 104, CH = 500;
  const head = (x: number, text: string, at: number, color: string) => (
    <>
      <Rule f={f} at={at} x={x} y={TOP} len={CW} color={color} w={T.stroke.line} />
      <Fade f={f} at={at + 4} style={{ left: x, top: TOP + 20, ...sans(42, T.weight.bold, color), letterSpacing: "0.12em" }}>{text}</Fade>
    </>
  );
  const src = (x: number, text: string, at: number) => (
    <Fade f={f} at={at} style={{ left: x, top: CY + CH + 64, display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ width: 28, height: T.stroke.hair, background: T.line }} /><span style={sans(32, T.weight.bold, T.text2)}>{text}</span>
    </Fade>
  );
  return (
    <>
      {head(0, l.head, l.headAt, T.cool)}
      {head(RX, r.head, r.headAt, T.text2)}
      <Reveal f={f} at={l.at} dir="down" style={{ ...paperBox(0, CY, CW, CH) }}>
        <DocHead title={l.doc} />
        <Bars widths={[100, 58]} />
        <div style={{ marginTop: 40, ...serif(160, T.weight.head, T.paperInk) }}><Marked f={f} at={l.bigAt + 8} color={T.accentOnPaper}><Typed text={l.big} f={f} at={l.bigAt} /></Marked></div>
        <Bars widths={[100, 82, 100]} mt={44} />
      </Reveal>
      <Note text={l.note} x={0} y={CY + CH + 12} f={f} at={l.at + M.wipe} />
      {/* 右欄：先有一個空框（還沒有東西可放），媒體的說法念到才進來 */}
      <Fade f={f} at={r.headAt} style={{ left: RX, top: CY, width: CW, height: CH, boxSizing: "border-box", border: `${T.stroke.hair}px dashed ${T.hair}` }}>{null}</Fade>
      <Reveal f={f} at={r.at} dir="down" style={{ left: RX, top: CY, width: CW, height: CH, boxSizing: "border-box", background: T.panel, border: `${T.stroke.hair}px solid ${T.panelLine}`, padding: "18px 34px" }}>
        <div style={{ marginTop: 16, width: 64, height: T.stroke.mark, background: T.text3 }} />
        {(r.big as string[]).map((t, k) => <div key={k} style={{ marginTop: k ? 10 : 84, ...serif(112), clipPath: clip(wipeP(f, r.bigAt + k * 6), "right"), opacity: wipeP(f, r.bigAt + k * 6) > 0 ? 1 : 0 }}>{t}</div>)}
      </Reveal>
      {src(0, l.src, l.srcAt)}
      {src(RX, r.src, r.srcAt)}
      <div style={{ position: "absolute", left: 0, top: CY + CH + 130 }}><Tag tag={l.tag} f={f} /></div>
      <div style={{ position: "absolute", left: RX, top: CY + CH + 130 }}><Tag tag={r.tag} f={f} /></div>
      {p.mid ? (
        <Fade f={f} at={p.mid.at} style={{ left: (L.INNER_W - 76) / 2, top: CY + CH / 2 - 38, width: 76, height: 76, boxSizing: "border-box", borderRadius: 38, background: T.bg, border: `${T.stroke.frame}px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ ...serif(48, T.weight.head, T.accentText), lineHeight: 1 }}>{p.mid.text}</span>
        </Fade>
      ) : null}
    </>
  );
};

// ── 鏡 4 外界的懷疑：問句大標＋報導（示意照片）＋報導裡的說法 ──
const Claim: React.FC<PanelProps> = ({ sh, f, slug }) => {
  const p = sh.p, h = p.head, ph = p.photo, q = p.quote, TOP = 50, PY = TOP + 196, PS = 440, QX = 486;
  return (
    <>
      <Reveal f={f} at={h.at} style={{ left: 0, top: TOP, paddingBottom: 16, paddingRight: 8, ...serif(116) }}>{withMark(h.text, h.mark, f, h.markAt)}</Reveal>
      <Photo slug={slug} name={ph.name} f={f} at={ph.at} x={0} y={PY} w={PS} h={PS} caption={ph.caption} life={sh.end - sh.start}>
        {ph.date ? <div style={{ position: "absolute", left: 0, top: 0, padding: "10px 18px", background: T.bg, ...NUMB, fontWeight: T.weight.num, fontSize: 40, lineHeight: 1, color: T.text, opacity: fadeP(f, ph.dateAt) }}>{ph.date}</div> : null}
      </Photo>
      <Rule f={f} at={q.byAt} x={QX} y={PY} len={L.INNER_W - QX} color={T.line} />
      <Fade f={f} at={q.byAt + 4} style={{ left: QX, top: PY + 20, ...sans(34, T.weight.bold, T.text2) }}>{q.by}</Fade>
      <Reveal f={f} at={q.at} style={{ left: QX, top: PY + 96, ...sans(64, T.weight.sub) }}>{q.pre}</Reveal>
      <Reveal f={f} at={q.bigAt} style={{ left: QX - 4, top: PY + 176, paddingBottom: 18, ...serif(176) }}><Marked f={f} at={q.bigAt + 8}>{q.big}</Marked></Reveal>
      <Fade f={f} at={q.bigAt + 4} style={{ left: QX, top: PY + 392, ...sans(64, T.weight.sub) }}>{q.post}</Fade>
      {p.tag ? <div style={{ position: "absolute", left: QX, top: PY + PS + 46 }}><Tag tag={p.tag} f={f} /></div> : null}
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
      <Reveal f={f} at={at + 2} style={{ left: x + 26, top: TOP + CH + 80, ...serif(88) }}>{text}</Reveal>
    </>
  );
  return (
    <>
      <Photo slug={slug} name={l.photo.name} f={f} at={l.photo.at} x={0} y={TOP} w={CW} h={CH} caption={l.photo.caption} life={sh.end - sh.start} />
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
      <Fade f={f} at={p.cta.at} style={{ left: 0, top: 354, display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ width: 44, height: T.stroke.hair, background: T.line }} /><span style={sans(40, T.weight.bold, T.text2)}>{p.cta.text}</span>
      </Fade>
      <Rule f={f} at={nx.at} x={0} y={PY - 70} len={L.INNER_W} color={T.line} />
      <Fade f={f} at={nx.at + 2} style={{ left: 0, top: PY - 54, ...sans(34, T.weight.bold, T.accentText), letterSpacing: "0.24em" }}>{nx.label}</Fade>
      <Photo slug={slug} name={nx.photo.name} f={f} at={nx.photo.at} x={0} y={PY} w={L.INNER_W} h={PH} life={sh.end - nx.photo.at + 30}>
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
const Shot: React.FC<{ sh: DsShot; f: number; slug: string }> = ({ sh, f, slug }) => {
  if (f < sh.start || f >= sh.outAt + M.out) return null;
  const P = PANELS[sh.panel];
  if (!P) return null;
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

export const VideoDossier: React.FC<Script & { timeline: TimelineV2 }> = ({ slug, scenes, timeline, channel, asOf }) => {
  useSerif();
  const f = useCurrentFrame();
  const m = useMemo(() => buildDossier(scenes, timeline), [scenes, timeline]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const caps: Cap[] = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ en: s.subtitle.en, keywords: s.keywords ?? [], window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines }));
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
export const CoverDossier: React.FC<Script> = ({ slug, scenes, cover, channel, asOf }) => {
  useSerif();
  const c = (cover ?? {}) as { sub?: string };
  const sh = staticShot(scenes[0]);
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
