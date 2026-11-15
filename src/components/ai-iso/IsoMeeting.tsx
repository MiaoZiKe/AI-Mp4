// 等距 2.5D「會議紀錄變待辦」引擎（script.json 頂層 stage: "iso" ＋ isoVersion: 5；第一支 videos/caffaine-meeting-todo/）。
// 同一張粉彩桌面一鏡到底：左後＝螢幕（AI）、右後＝一疊會議紀錄紙＋螢光筆、右前＝待辦清單卡（會一格一格打勾）、左前＝時鐘。
// 上方是轉正的 2D 說明卡（字一律 ≥28px）：每鏡左上一個「性質小標」、右上常駐「查證截至」、每個說法掛狀態標籤。
// 沒有真實商標與真人：紙、螢幕、時鐘都是自畫示意；會議紀錄是虛構情境。時間全部由 cue 換算。
import React, { useLayoutEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_ISO as L, THEME_ISO as T } from "../../theme";
import { EASE, tween } from "../anim";
import { buildIso, type Panel } from "./engine";
import { CaffEndcard } from "./CaffAnim";
import { Floaters, Glow } from "./IsoShort";
import { ap, at2, Backdrop, bounce, Box, Caption, type Cap, Check, Chip, col, css, face, ground, HeaderIso, iso, type M6, mul, riseIn, Shade, Slab, slam, SourceLine, wallX } from "./IsoVideo";

const zh: React.CSSProperties = { fontFamily: FONT_ZH, whiteSpace: "nowrap", lineHeight: 1.16 };
const en: React.CSSProperties = { fontFamily: FONT_EN, whiteSpace: "nowrap", lineHeight: 1 };
const P = T.color.primary, S = T.solid, FAR = 1e9;
const E = (f: number, at: number, d: number) => tween(f, at, d, EASE.move);
const O = (f: number, at: number, d: number) => tween(f, at, d, EASE.enter);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pulse = (f: number, at: number, dur: number) => (f < at ? 0 : 1 - tween(f, at, dur, EASE.enter));

const DESKW = 760, DESKH = 600;
const MON = { x: 70, y: 70, z: 44, dx: 24, dy: 330, dz: 230 }; // 螢幕（左後，面朝右前）
const STK = { x: 430, y: 60, w: 200, h: 150 }; // 會議紀錄紙（右後）
const TODO = { x: 470, y: 300, w: 230, h: 250 }; // 待辦清單卡（右前，貼在桌面）
const CLK = { x: 250, y: 430, z: 30, r: 62 }; // 時鐘（左前，立著）
const HL = { x: 330, y: 236, dx: 120, dy: 26, dz: 26 }; // 螢光筆
const ROWS = 6;

type Key = { frame: number; dur: number; look: [number, number, number]; zoom: number; sy: number; rot: number };
const camKeys = (panels: Panel[]): Key[] => panels.flatMap((x) => ([] as any[]).concat(x.p.camera ?? []).map((c, i) => ({ frame: i === 0 && !c.at ? x.in : x.at(c.at, x.in), dur: c.dur ?? 20, look: c.look, zoom: c.zoom, sy: c.sy, rot: c.rot ?? 0 }))).sort((a, b) => a.frame - b.frame);
const camAt = (keys: Key[], f: number, shakes: number[]): M6 => {
  if (!keys.length) return at2(L.W / 2, 1000, 0.6);
  let [lx, ly] = iso(...keys[0].look), s = keys[0].zoom, sy = keys[0].sy, rot = keys[0].rot;
  for (const k of keys.slice(1)) { const t = E(f, k.frame, k.dur), [tx, ty] = iso(...k.look); lx += (tx - lx) * t; ly += (ty - ly) * t; s += (k.zoom - s) * t; sy += (k.sy - sy) * t; rot += (k.rot - rot) * t; }
  let dx = 2 * Math.sin(f / 27), dy = 0;
  for (const a of shakes) if (f >= a && f < a + 9) { const d = 1 - (f - a) / 9; dx += 9 * d * Math.sin((f - a) * 2.4); dy += 7 * d * Math.cos((f - a) * 3.1); }
  const r = (rot * Math.PI) / 180, c = Math.cos(r), n = Math.sin(r);
  return mul([c, n, -n, c, L.W / 2 + dx, sy + dy], [s, 0, 0, s, -s * lx, -s * ly]);
};

const stateColor = (t: string) => (/確定/.test(t) ? "right" : /查不到|尚未/.test(t) ? "plum" : /不符|不一致/.test(t) ? "wrong" : "note");
const StatusChip: React.FC<{ f: number; at: number; text: string; color?: string; px?: number; name?: string }> = ({ f, at, text, color, px = 30, name = "狀態" }) => {
  const c = col(color ?? stateColor(text));
  return <div data-ov={name || undefined} style={{ ...bounce(f, at), display: "inline-block" }}><Chip text={text} bg={c.soft} fg={c.text} px={px} /></div>;
};

type PM = Record<string, Panel | undefined>;

// ───────── 桌面（世界座標）─────────
const Clock: React.FC<{ min: number; hr: number; flash: number }> = ({ min, hr, flash }) => {
  const m = wallX(CLK.x + 12, CLK.y + 2 * CLK.r, CLK.z + 2 * CLK.r + 8), r = CLK.r;
  const hand = (deg: number, len: number, w: number, c: string) => <line x1={r} y1={r} x2={r + len * Math.sin((deg * Math.PI) / 180)} y2={r - len * Math.cos((deg * Math.PI) / 180)} stroke={c} strokeWidth={w} strokeLinecap="round" />;
  return (
    <g>
      <Shade x={CLK.x - 6} y={CLK.y - 4} w={40} h={2 * r + 10} r={10} a={0.08} />
      <Box x={CLK.x} y={CLK.y + r - 22} dx={12} dy={44} dz={CLK.z} c={S.lav} />
      <Box x={CLK.x} y={CLK.y} dx={12} dy={2 * r} dz={CLK.z + 2 * r + 8} c={S.white} />
      <g transform={css(m)}>
        <circle cx={r} cy={r} r={r - 6} fill={flash > 0 ? P.soft : "#fff"} stroke={S.lav.l} strokeWidth={8} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={r + (r - 18) * Math.sin((i * Math.PI) / 6)} y1={r - (r - 18) * Math.cos((i * Math.PI) / 6)} x2={r + (r - 28) * Math.sin((i * Math.PI) / 6)} y2={r - (r - 28) * Math.cos((i * Math.PI) / 6)} stroke={T.ink3} strokeWidth={i % 3 ? 3 : 5} strokeLinecap="round" />)}
        {hand(hr, r * 0.5, 7, T.ink)}{hand(min, r * 0.76, 5, P.fill)}
        <circle cx={r} cy={r} r={6} fill={T.color.wrong.fill} />
      </g>
    </g>
  );
};

const World: React.FC<{ f: number; cam: M6; P: PM; panels: Panel[] }> = ({ f, cam, P: Pn, panels }) => {
  const hk = Pn.hook, run = Pn.run, wr = Pn.wrong, vs = Pn.vs, ru = Pn.rule, lm = Pn.limit, ct = Pn.cta;
  const tTick = hk ? hk.at("tick", FAR) : FAR, tGuess = hk ? hk.at("guess", FAR) : FAR;
  const tSend = run ? run.at("send", FAR) : FAR, tWait = run ? run.at("wait", FAR) : FAR, tDone = run ? run.at("done", FAR) : FAR;
  const tHl = wr ? wr.at("hl", FAR) : FAR, tFix = ru ? ru.at("fix", FAR) : FAR, tAll = ct ? ct.at("all", FAR) : FAR;
  const tVs = vs ? vs.in : FAR, tLim = lm ? lm.at("q", FAR) : FAR;
  const mode: "idle" | "think" | "done" | "ok" = f >= tAll ? "ok" : f >= tDone ? "done" : f >= tSend && tSend < FAR ? "think" : "idle";
  const flash = pulse(f, tDone, 14) + pulse(f, tVs + 4, 10) * 0.7;
  const rowSt = (i: number): "empty" | "tick" | "guess" | "fixed" => {
    if (i < ROWS - 1) return f >= tAll + i * 4 || f >= tTick + i * 6 ? "tick" : "empty";
    return f >= tAll ? "fixed" : f >= tFix ? "fixed" : f >= tGuess ? "guess" : "empty";
  };
  const spin = f >= tWait && f < tDone ? (f - tWait) * 11 : f >= tDone ? (tDone - tWait) * 11 : f * 0.4;
  // 紙飛進螢幕
  const flyers = f >= tSend && f < tSend + 40 ? Array.from({ length: 9 }, (_, i) => {
    const u = clamp((f - tSend - i * 3) / 26); if (u <= 0 || u >= 1) return null;
    const a = { x: STK.x + STK.w / 2, y: STK.y + STK.h / 2, z: 40 }, b = { x: MON.x + 20, y: MON.y + MON.dy / 2, z: 150 };
    const [px, py] = iso(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, a.z + (b.z - a.z) * u + 110 * Math.sin(Math.PI * u));
    return <g key={i} transform={`translate(${px} ${py}) rotate(${(u * 220 + i * 40) % 360})`} opacity={Math.sin(Math.PI * u) ** 0.5}><rect x={-20} y={-26} width={40} height={52} rx={4} fill="#fff" stroke={P.fill} strokeWidth={4} /><rect x={-11} y={-14} width={22} height={5} rx={2} fill={P.soft} /><rect x={-11} y={-4} width={16} height={5} rx={2} fill={P.soft} /></g>;
  }) : null;
  const scr = wallX(MON.x + MON.dx, MON.y + MON.dy, MON.z + MON.dz), W = MON.dy, H = MON.dz;
  const rowsOn = [0, 1, 2, 3, 4].map((i) => rowSt(i) === "tick");
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", clipPath: "inset(330px 0 0 0)" }}>
      <defs>
        <pattern id="mtDots" width={80} height={80} patternUnits="userSpaceOnUse" patternTransform={css(mul(cam, ground((f * 0.5) % 80, (f * 0.25) % 80, -60)))}><circle cx={10} cy={10} r={5} fill={T.dot} /></pattern>
      </defs>
      <rect x={0} y={L.HEADER_TOP + 90} width={L.W} height={L.CAP_TOP - L.HEADER_TOP - 90} fill="url(#mtDots)" />
      <g transform={css(cam)}>
        <Shade x={50} y={50} w={DESKW} h={DESKH} r={56} z={-110} />
        <Slab id="mtDesk" x={0} y={0} w={DESKW} h={DESKH} t={40} r={48} c={S.desk} />
        {/* 螢幕：AI */}
        <Shade x={MON.x - 10} y={MON.y - 6} w={70} h={MON.dy + 24} r={12} a={0.09} />
        <Box x={MON.x + 4} y={MON.y + MON.dy / 2 - 40} dx={14} dy={80} dz={MON.z} c={S.lav} />
        <Box x={MON.x} y={MON.y} z={MON.z} dx={MON.dx} dy={MON.dy} dz={MON.dz} c={S.white} />
        <g transform={css(scr)}>
          <rect x={14} y={14} width={W - 28} height={H - 28} rx={18} fill={T.screen.face} />
          {flash > 0.02 ? <rect x={14} y={14} width={W - 28} height={H - 28} rx={18} fill={T.screen.glow} opacity={Math.min(1, flash)} /> : null}
          {mode === "idle" ? <text x={W / 2} y={H / 2 + 38} textAnchor="middle" fontFamily={FONT_EN} fontWeight={900} fontSize={110} fill={T.screen.on}>AI</text> : null}
          {mode === "think" ? [0, 1, 2].map((i) => <circle key={i} cx={W / 2 - 60 + i * 60} cy={H / 2 - 16 * Math.max(0, Math.sin((f - i * 3) / 2.2))} r={17} fill={T.screen.on} />) : null}
          {mode === "done" ? [250, 210, 270, 160, 230].map((w, i) => <g key={i}><rect x={44} y={42 + i * 34} width={20} height={20} rx={5} fill={i === 3 ? T.color.wrong.fill : T.screen.on} /><rect x={76} y={44 + i * 34} width={w} height={16} rx={8} fill={i === 3 ? T.color.wrong.soft : T.screen.bar} /></g>) : null}
          {mode === "ok" ? <g><circle cx={W / 2} cy={H / 2} r={66} fill={T.screen.on} /><path d={`M${W / 2 - 32} ${H / 2 + 2} L${W / 2 - 8} ${H / 2 + 28} L${W / 2 + 36} ${H / 2 - 24}`} fill="none" stroke={T.color.right.fill} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" /></g> : null}
        </g>
        {/* 會議紀錄：一疊紙＋最上面那張的字行；wr 時一行被螢光筆畫上 */}
        <Shade x={STK.x - 6} y={STK.y - 4} w={STK.w + 24} h={STK.h + 24} r={10} a={0.08} />
        {Array.from({ length: 7 }, (_, i) => <Slab key={i} id={`mtP${i}`} x={STK.x + (i % 2 ? 4 : -3)} y={STK.y + (i % 3) * 2} z={i * 7} w={STK.w} h={STK.h} t={6} r={6} c={S.white}>{i === 6 ? <g>{Array.from({ length: 6 }, (_, k) => <rect key={k} x={18} y={22 + k * 20} width={k % 2 ? 120 : 150} height={8} rx={4} fill={T.line} />)}<rect x={18} y={22 + 4 * 20 - 3} width={f >= tHl ? 150 * E(f, tHl, 9) : 0} height={14} rx={5} fill={T.color.wrong.fill} opacity={0.75} /></g> : null}</Slab>)}
        {/* 螢光筆 */}
        <g transform={`translate(0 ${-14 * pulse(f, tHl, 14) * Math.sin(Math.PI * clamp((f - tHl) / 14))})`}><Box x={HL.x} y={HL.y} dx={HL.dx} dy={HL.dy} dz={HL.dz} c={S.yellow} /><Box x={HL.x + HL.dx - 22} y={HL.y} dx={22} dy={HL.dy} dz={HL.dz} c={S.sky} /></g>
        {/* 待辦清單卡 */}
        <Shade x={TODO.x - 4} y={TODO.y - 2} w={TODO.w + 18} h={TODO.h + 16} r={14} a={0.09} />
        <Slab id="mtTodo" x={TODO.x} y={TODO.y} z={0} w={TODO.w} h={TODO.h} t={12} r={14} c={S.white}>
          <rect x={14} y={14} width={TODO.w - 28} height={34} rx={10} fill={f >= tAll ? T.color.right.fill : P.fill} opacity={0.9} />
          {Array.from({ length: ROWS }, (_, i) => {
            const st = rowSt(i), y = 64 + i * 30, c = st === "guess" ? T.color.wrong.fill : T.color.right.fill;
            return <g key={i}><rect x={20} y={y} width={22} height={22} rx={6} fill={st === "empty" ? "#fff" : c} stroke={st === "empty" ? T.cardSide : c} strokeWidth={3} />
              {st === "tick" || st === "fixed" ? <path d={`M25 ${y + 11} L31 ${y + 17} L38 ${y + 6}`} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" /> : null}
              {st === "guess" ? <text x={31} y={y + 18} textAnchor="middle" fontFamily={FONT_EN} fontWeight={900} fontSize={20} fill="#fff">?</text> : null}
              <rect x={54} y={y + 5} width={st === "guess" ? 96 : 124 - (i % 3) * 14} height={12} rx={6} fill={st === "guess" ? T.color.wrong.soft : T.line} />
              {i === ROWS - 1 && (st === "guess" || st === "fixed") ? <rect x={162} y={y + 3} width={48} height={16} rx={8} fill={st === "guess" ? T.color.wrong.fill : T.color.right.fill} opacity={0.85} /> : null}</g>;
          })}
        </Slab>
        {rowsOn.filter(Boolean).length ? null : null}
        <Clock min={spin} hr={spin / 12 + 40} flash={pulse(f, tDone, 12)} />
        {/* 還不知道：兩疊「別份紀錄」的虛線輪廓＋問號 */}
        {f >= tLim ? [{ x: 40, y: 330 }, { x: 150, y: 470 }].map((q, i) => { const o = O(f, tLim + i * 6, 8); return <g key={i} transform={css(ground(q.x, q.y, 2))} opacity={o}><rect width={150} height={110} rx={10} fill="none" stroke={T.color.plum.fill} strokeWidth={5} strokeDasharray="14 10" /><text x={75} y={78} textAnchor="middle" fontFamily={FONT_EN} fontWeight={900} fontSize={72} fill={T.color.plum.fill}>?</text></g>; }) : null}
        {/* 小盆栽（佈景） */}
        <Box x={640} y={470} dx={46} dy={46} dz={44} c={S.coral} />
        {[0, 1, 2].map((i) => <ellipse key={i} cx={iso(663, 493, 70)[0] + (i - 1) * 22} cy={iso(663, 493, 70)[1] - 14 * Math.abs(i - 1) + 4 * Math.sin(f / 18 + i)} rx={14} ry={32} fill={S.mint.l} transform={`rotate(${(i - 1) * 28} ${iso(663, 493, 70)[0] + (i - 1) * 22} ${iso(663, 493, 70)[1]})`} />)}
      </g>
      <g>{flyers}</g>
    </svg>
  );
};

// ───────── 2D 說明卡 ─────────
const W0 = L.X, TOP = 424;
const Tag: React.FC<{ f: number; p: Panel }> = ({ f, p }) => {
  const o = O(f, p.in, 5) * (1 - O(f, p.out - 6, 5)), c = col(String(p.p.tagColor ?? "primary"));
  const st = p.p.status ? String(p.p.status) : "", tS = p.at(p.p.statusAt, p.in + 10);
  return o <= 0.01 ? null : <div style={{ position: "absolute", left: W0, top: L.MAIN_TOP + 8, opacity: o, display: "flex", alignItems: "center", gap: 14 }}><div data-ov="性質小標" style={{ ...zh, fontWeight: 900, fontSize: 40, color: c.on, background: c.fill, borderRadius: 18, padding: "6px 26px", boxShadow: `0 6px 0 ${c.side}` }}>{String(p.p.tag)}</div>{st ? <StatusChip f={f} at={tS} text={st} px={30} /> : null}</div>;
};
const AsOf: React.FC<{ text: string }> = ({ text }) => <div data-ov="查證日期" style={{ position: "absolute", right: L.X, top: L.MAIN_TOP + 14, ...zh, fontWeight: 800, fontSize: 32, color: T.ink2 }}>{text}</div>;

type Cells = { cells: string[]; at?: any; flag?: boolean; ok?: boolean };
const Row: React.FC<{ r: Cells; f: number; at: number; hide?: number }> = ({ r, f, at, hide = 0 }) => {
  const c = r.flag ? col("wrong") : r.ok ? col("right") : null, hh = 1 - hide;
  return (
    <div style={{ ...riseIn(f, at, 24), display: "flex", alignItems: "center", gap: 14, background: c ? c.soft : "transparent", borderRadius: 18, padding: hh > 0.02 ? "5px 12px" : 0, boxShadow: c ? `inset 0 0 0 4px ${c.fill}` : undefined, maxHeight: 120 * hh, opacity: hh, overflow: "hidden" }}>
      <div style={{ ...zh, fontWeight: 900, fontSize: 32, color: c ? c.text : T.ink, width: 140, flexShrink: 0 }}>{r.cells[0]}</div>
      <div style={{ ...zh, whiteSpace: "normal", fontWeight: 700, fontSize: 30, color: T.ink, flex: 1 }}>{r.cells[1]}</div>
      <div style={{ ...zh, fontWeight: 800, fontSize: 30, color: T.ink2, width: 272, flexShrink: 0, textAlign: "right" }}>{r.cells[2]}</div>
    </div>
  );
};
const AnswerCard: React.FC<{ f: number; at: number; out?: number; by: string; rows: Cells[]; y: number; hideRows?: Record<number, number>; color?: string; label?: string; w?: number }> = ({ f, at, out = FAR, by, rows, y, hideRows = {}, color = "primary", label, w = L.INNER_W }) => {
  const o = O(f, at, 5) * (1 - O(f, out, 6)), c = col(color);
  return o <= 0.01 ? null : (
    <div data-ov="說明卡" style={{ position: "absolute", left: W0, top: y + 14 * (1 - O(f, at, 12)), width: w, opacity: o }}>
      <div style={{ ...face(T.card, c.side, 12), padding: "12px 22px 14px", height: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
          {label ? <Chip text={label} bg={c.fill} fg={c.on} px={30} /> : null}
          <div style={{ ...zh, fontWeight: 700, fontSize: 28, color: T.ink3 }}>{by}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{rows.map((r, i) => <Row key={i} r={r} f={f} at={at + 8 + i * 6} hide={hideRows[i] ?? 0} />)}</div>
      </div>
    </div>
  );
};

const Overlays: React.FC<{ f: number; P: PM; cam: M6 }> = ({ f, P: Pn0 }) => {
  const act = (q?: Panel) => (q && f >= q.in - 1 && f < q.out + 1 ? q : undefined);
  const Pn: PM = Object.fromEntries(Object.entries(Pn0).map(([k, v]) => [k, act(v)]));
  const out: React.ReactNode[] = [];
  const cells = (rs: any[], p: Panel): Cells[] => rs.map((r) => ({ ...r, at: undefined }));

  if (Pn.hook) {
    const h = Pn.hook, p = h.p, tM = h.at(p.mark?.at, 10), tS = h.at(p.stamp?.at, 8), tN = h.at(p.count?.at, 14), o = 1 - O(f, h.out - 8, 8);
    out.push(
      <div key="hk" style={{ position: "absolute", left: W0, top: TOP, width: L.INNER_W, opacity: o }}>
        <div data-ov="鉤子大字" style={{ display: "inline-block", ...zh, fontWeight: 900, fontSize: p.size ?? 132, color: T.ink }}>{p.title[0]}</div><br />
        <div data-ov="鉤子大字2" style={{ display: "inline-block", ...zh, fontWeight: 900, fontSize: p.size ?? 132, marginTop: 8, color: f >= tM ? T.color.wrong.text : T.ink, transform: `scale(${f < tM ? 1 : 1 + 0.1 * Math.exp(-(f - tM) / 5)})`, transformOrigin: "0 50%" }}>{p.title[1]}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 30 }}>
          <div data-ov="蓋章" style={{ ...slam(f, tS, -6, 1.4), ...zh, fontWeight: 900, fontSize: 50, color: T.color.wrong.text, border: `7px solid ${T.color.wrong.fill}`, borderRadius: 16, background: T.card, padding: "4px 24px" }}>{p.stamp?.text}</div>
          <div data-ov="數字卡" style={{ ...bounce(f, tN), ...zh, fontWeight: 900, fontSize: 36, color: T.ink2, background: T.card, borderRadius: 24, padding: "10px 24px", boxShadow: `0 7px 0 ${T.cardSide}` }}><span style={{ ...en, fontSize: 52, color: P.text }}>{p.count?.value}</span> {p.count?.unit}</div>
        </div>

      </div>,
    );
  }
  if (Pn.run) {
    const r = Pn.run, p = r.p, tT = r.at(p.typeAt, 6), tTool = r.at(p.toolAt, 6), tW = r.at("wait", 40), tD = r.at("done", 90), tS = r.at(p.statusAt, 60), o = 1 - O(f, r.out - 8, 8);
    const full: string = p.lines[0], n = Math.floor(clamp((f - tT) / (p.typeDur ?? 28)) * full.length);
    const secs = Math.round(clamp((f - tW) / Math.max(1, tD - tW)) * (p.timer?.secs ?? 170)), mm = Math.floor(secs / 60), ss = String(secs % 60).padStart(2, "0");
    out.push(
      <div key="run" style={{ position: "absolute", left: W0, top: TOP, width: L.INNER_W, opacity: o }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div data-ov="工具標籤" style={{ ...bounce(f, tTool), display: "inline-block" }}><Chip text={p.tool} bg={P.fill} fg="#fff" px={34} side={P.side} /></div>
        </div>
        <div data-ov="說明卡" style={{ ...riseIn(f, tT - 4, 26), marginTop: 18 }}>
          <div style={{ ...face(T.card, P.side, 12), padding: "14px 26px 16px", height: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}><div style={{ ...zh, fontWeight: 700, fontSize: 30, color: T.ink3 }}>我這樣問</div><div style={{ ...zh, fontWeight: 800, fontSize: 28, color: T.color.note.text, background: T.color.note.soft, borderRadius: 20, padding: "2px 16px" }}>{p.sub}</div></div>
            <div style={{ ...zh, fontWeight: 900, fontSize: 64, color: T.ink, marginTop: 4 }}>{full.slice(0, n)}<span style={{ opacity: Math.floor(f / 6) % 2 ? 0 : 1, color: P.fill }}>|</span></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 22, alignItems: "center", marginTop: 18 }}>
          <div data-ov="計時卡" style={{ ...bounce(f, tW - 6), display: "inline-flex", alignItems: "baseline", gap: 14, background: T.card, borderRadius: 26, padding: "10px 28px", boxShadow: `0 8px 0 ${T.cardSide}` }}>
            <span style={{ ...zh, fontWeight: 800, fontSize: 32, color: T.ink2 }}>第一次等了</span><span style={{ ...en, fontWeight: 900, fontSize: 72, color: f >= tD ? T.color.wrong.text : P.text }}>{mm}:{ss}</span>
          </div>
        </div>
      </div>,
    );
  }
  if (Pn.wrong) {
    const w = Pn.wrong, p = w.p, tSrc = w.at(p.src.at, 60), tSt = w.at(p.stamp.at, 80), o = 1 - O(f, w.out - 8, 8), hide = E(f, tSrc, 10);
    const rs: Cells[] = p.rows.map((r: any) => ({ cells: r.cells, flag: !!r.flag, ok: !!r.ok }));
    out.push(
      <React.Fragment key="wr">
        <div style={{ opacity: o }}><AnswerCard f={f} at={w.in + 2} out={w.out - 4} by={p.by} rows={rs} y={TOP} hideRows={{ 0: hide, 1: hide }} /></div>
        {f >= tSrc + 10 ? <div data-ov="說明卡" style={{ ...riseIn(f, tSrc + 10, 30), position: "absolute", left: W0, top: TOP + 172, width: L.INNER_W, opacity: o }}>
          <div style={{ ...face(T.card, T.color.note.side, 12), padding: "16px 26px 18px", height: "auto" }}>
            <div style={{ ...zh, fontWeight: 700, fontSize: 28, color: T.ink3 }}>{p.src.label}</div>
            <div style={{ ...zh, fontWeight: 800, fontSize: 34, color: T.ink, marginTop: 6 }}>{p.src.text}</div>
          </div>
        </div> : null}
        <div style={{ position: "absolute", right: W0, top: TOP + 346, opacity: o, display: "flex", gap: 20, alignItems: "center" }}>
          <div data-ov="蓋章" style={{ ...slam(f, tSt, -4, 1.3), ...zh, fontWeight: 900, fontSize: 46, color: T.color.wrong.text, border: `7px solid ${T.color.wrong.fill}`, borderRadius: 16, background: T.card, padding: "2px 22px" }}>{p.stamp.text}</div>
        </div>
      </React.Fragment>,
    );
  }
  if (Pn.vs) {
    const v = Pn.vs, p = v.p, tA = v.in + 2, tB = v.at(p.bottom.at, v.in + 40), tBd = v.at(p.badge.at, v.in + 70);
    out.push(
      <React.Fragment key="vs">
        <AnswerCard f={f} at={tA} out={v.out - 4} by={p.top.by} rows={[{ cells: p.top.cells, flag: true }]} y={TOP} label={p.top.label} color="wrong" />
        <AnswerCard f={f} at={tB} out={v.out - 4} by={p.bottom.by} rows={[{ cells: p.bottom.cells, ok: true }]} y={TOP + 166} label={p.bottom.label} color="right" />
        <div style={{ position: "absolute", right: W0, top: TOP + 336, opacity: 1 - O(f, v.out - 8, 8), display: "flex", gap: 20, alignItems: "center" }}>
          <div data-ov="蓋章" style={{ ...slam(f, tBd, -3, 1.25), ...zh, fontWeight: 900, fontSize: 44, color: P.text, border: `7px solid ${P.fill}`, borderRadius: 16, background: T.card, padding: "2px 22px" }}>{p.badge.text}</div>
        </div>
      </React.Fragment>,
    );
  }
  if (Pn.rule) {
    const r = Pn.rule, p = r.p, o = 1 - O(f, r.out - 8, 8), tP = r.in + 2, tR = r.at(p.result.at, r.in + 40);
    const rs: Cells[] = p.result.rows.map((q: any) => ({ cells: q.cells, ok: !!q.ok }));
    out.push(
      <React.Fragment key="ru">
        <div data-ov="說明卡" style={{ ...riseIn(f, tP, 26), position: "absolute", left: W0, top: TOP, width: L.INNER_W, opacity: o }}>
          <div style={{ ...face(T.card, P.side, 12), padding: "14px 20px 18px", height: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "nowrap" }}><Chip text="這樣問" bg={P.fill} fg="#fff" px={30} />{(p.rules as any[]).map((q, i) => { const c = col(q.color); return <div key={i} style={{ ...bounce(f, r.at(q.at, tP + 8 + i * 8)) }}><div style={{ ...zh, fontWeight: 900, fontSize: 30, color: c.on, background: c.fill, borderRadius: 22, padding: "6px 14px", boxShadow: `0 6px 0 ${c.side}` }}>{q.text}</div></div>; })}</div>
          </div>
        </div>
        <AnswerCard f={f} at={tR} out={r.out - 4} by={p.result.by} rows={rs} y={TOP + 128} color="right" label={p.result.label} />
      </React.Fragment>,
    );
  }
  if (Pn.limit) {
    const l = Pn.limit, p = l.p, o = 1 - O(f, l.out - 8, 8), tK = l.at("known", l.in + 6), tQ = l.at("q", l.in + 50);
    const one = (key: string, at: number, st: string, c: string, lines: string[], y: number) => <div key={key} data-ov="說明卡" style={{ ...riseIn(f, at, 26), position: "absolute", left: W0, top: y, width: L.INNER_W, opacity: o }}><div style={{ ...face(T.card, col(c).side, 12), padding: "14px 26px 16px", height: "auto" }}><StatusChip f={f} at={at + 4} text={st} color={c} px={30} name="" /><div style={{ ...zh, fontWeight: 900, fontSize: 38, color: T.ink, marginTop: 8 }}>{lines[0]}</div><div style={{ ...zh, fontWeight: 700, fontSize: 32, color: T.ink2, marginTop: 2 }}>{lines[1]}</div></div></div>;
    out.push(one("k", tK, p.known.status, "right", p.known.lines, TOP), one("u", tQ, p.unknown.status, "plum", p.unknown.lines, TOP + 214));
  }
  if (Pn.ask) {
    const a = Pn.ask, p = a.p, o = 1 - O(f, a.out - 8, 8), t1 = a.at("a", a.in + 8), t2 = a.at("b", a.in + 30), tN = a.at("next", a.in + 60);
    out.push(
      <div key="ask" style={{ position: "absolute", left: W0, top: TOP, width: L.INNER_W, opacity: o }}>
        <div style={{ display: "flex", gap: 40 }}>{[[p.a, t1, "note"], [p.b, t2, "primary"]].map(([t, at, c]) => <div key={t as string} data-ov="選項卡" style={{ ...bounce(f, at as number), width: 456 }}><div style={{ ...face(T.card, col(c as string).fill, 12), padding: "32px 24px", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ ...zh, fontWeight: 900, fontSize: 62, color: T.ink }}>{t as string}</div></div></div>)}</div>
        <div data-ov="下一集卡" style={{ ...bounce(f, tN), marginTop: 36, display: "inline-flex", alignItems: "center", gap: 18, background: col("plum").fill, borderRadius: 30, padding: "14px 34px", boxShadow: `0 8px 0 ${col("plum").side}` }}>
          <span style={{ ...zh, fontWeight: 700, fontSize: 34, color: "#fff" }}>{p.next.kicker}</span><span style={{ ...zh, fontWeight: 900, fontSize: 54, color: "#fff" }}>{p.next.text}</span>
        </div>
      </div>,
    );
  }
  if (Pn.cta) {
    const c = Pn.cta, p = c.p, o = 1 - O(f, c.out - 8, 8), t1 = c.at("kw", c.in + 8);
    out.push(
      <div key="cta" style={{ position: "absolute", left: W0, top: TOP, width: L.INNER_W, opacity: o }}>
        <div data-ov="說明卡" style={{ ...slam(f, t1, -2, 1.04) }}>
          <div style={{ ...face(T.card, P.side, 14, 40), padding: "30px 40px 34px", height: "auto" }}>
            <div style={{ ...zh, fontWeight: 800, fontSize: 40, color: T.ink2 }}>{p.kicker}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 10 }}><span style={{ ...zh, fontWeight: 900, fontSize: 70, color: T.ink }}>留言</span><span style={{ ...zh, fontWeight: 900, fontSize: 104, color: "#fff", background: P.fill, borderRadius: 26, padding: "2px 34px", boxShadow: `0 9px 0 ${P.side}` }}>{p.keyword}</span></div>
            <div style={{ ...zh, fontWeight: 800, fontSize: 40, color: T.ink2, marginTop: 14 }}>{p.sub}</div>
          </div>
        </div>
      </div>,
    );
  }
  return <>{out}</>;
};

/** 上下兩條淡色帶（平台介面區也有內容）＋底部的「會議紀錄 → AI 整理 → 待辦清單」追蹤條 */
const Bands: React.FC<{ f: number; on: number }> = ({ f, on }) => {
  const steps: [string, string][] = [["會議紀錄", "note"], ["AI 整理", "primary"], ["待辦清單", "right"]];
  return (
    <>
      <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={0} y={0} width={L.W} height={64} fill={S.lav.top} /><rect x={0} y={L.H - 64} width={L.W} height={64} fill={S.mint.top} />
        {Array.from({ length: 27 }, (_, i) => <g key={i}><rect x={i * 40 + 16} y={22} width={8} height={8} rx={2} fill={P.fill} opacity={0.35} /><rect x={i * 40 + 16} y={L.H - 42} width={8} height={8} rx={2} fill={T.color.right.fill} opacity={0.4} /></g>)}
      </svg>
      <div style={{ position: "absolute", left: L.X, width: L.INNER_W, top: 1690, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
        {steps.map(([w, c], i) => { const act = on === i, cc = col(c); return (
          <React.Fragment key={w}>
            {i ? <svg width={54} height={30} viewBox="0 0 60 30"><path d="M4 15 H46 M36 5 L48 15 L36 25" fill="none" stroke={T.ink3} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
            <div data-ov="追蹤條" style={{ ...zh, fontWeight: 900, fontSize: 46, padding: "12px 30px", borderRadius: 30, background: act ? cc.fill : T.card, color: act ? cc.on : T.ink3, boxShadow: `0 8px 0 ${act ? cc.side : T.cardSide}`, transform: `scale(${act ? 1.06 : 1})` }}>{w}</div>
          </React.Fragment>); })}
      </div>
    </>
  );
};

export const MeetingIso: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel, ...rest }) => {
  const f = useCurrentFrame();
  const ov = !!(rest as any).ovcheck;
  const [hdl] = useState(() => (ov ? delayRender("ovcheck") : 0));
  useLayoutEffect(() => {
    if (!ov) return;
    const eff = (el: Element | null) => { let o = 1; while (el && el !== document.body) { o *= Number(getComputedStyle(el).opacity); el = el.parentElement; } return o; };
    const boxes = Array.from(document.querySelectorAll("[data-ov]")).map((el) => { const r = el.getBoundingClientRect(); return { n: el.getAttribute("data-ov"), x: r.x, y: r.y, w: r.width, h: r.height, o: eff(el), ovf: (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth + 2 }; }).filter((b) => b.w > 1 && b.h > 1 && b.o > 0.5);
    const small: { t: string; fs: number }[] = [];
    document.querySelectorAll("div,span").forEach((el) => { const tn = Array.from(el.childNodes).filter((c) => c.nodeType === 3 && (c.textContent ?? "").trim()); if (tn.length && eff(el) > 0.5) { const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 28) small.push({ t: (el.textContent ?? "").slice(0, 12), fs }); } });
    console.log("OVREPORT " + JSON.stringify({ f, boxes, small, desk: (window as any).__deskPoly ?? null, objs: (window as any).__objs ?? [] }));
    continueRender(hdl);
  });
  const panels = useMemo(() => buildIso(scenes, timeline), [scenes, timeline]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const caps: Cap[] = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ en: s.subtitle.en, window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines.map((l) => ({ ...l, text: l.text.replace(/[，、；：。]+$/, "") })), keywords: s.keywords ?? [], kw: ((s.props as any)?.kw ?? {}) as Record<string, string> }));
  const srcs = ordered.map((s) => ({ sources: s.sources, window: by[s.id].sourceWindow }));
  const endP = panels.find((x) => x.kind === "caffend");
  const world = panels.filter((x) => x.kind !== "caffend");
  const Pn: PM = Object.fromEntries(world.map((x) => [x.kind, x]));
  const keys = useMemo(() => camKeys(world), [panels]);
  const shakes = [Pn.hook ? Pn.hook.at(Pn.hook.p.stamp?.at, 8) + 0 : FAR, Pn.wrong ? Pn.wrong.at(Pn.wrong.p.stamp.at, FAR) : FAR, Pn.rule ? Pn.rule.at("fix", FAR) : FAR].filter((t) => t < FAR / 2);
  const cam = camAt(keys, f, shakes);
  const inEnd = !!endP && f >= endP.in;
  const deskPoly = [[0, 0], [DESKW, 0], [DESKW, DESKH], [0, DESKH]].map(([x, y]) => { const [px, py] = iso(x, y, 0); return [cam[0] * px + cam[2] * py + cam[4], cam[1] * px + cam[3] * py + cam[5]]; });
  (window as any).__deskPoly = deskPoly;
  { const pj = (x: number, y: number, z: number, r: number) => { const [px, py] = iso(x, y, z); return { x: cam[0] * px + cam[2] * py + cam[4], y: cam[1] * px + cam[3] * py + cam[5], r: r * cam[0] }; }; (window as any).__objs = [{ n: "螢幕", ...pj(MON.x + 12, MON.y + MON.dy / 2, MON.z + MON.dz / 2, 150) }, { n: "會議紀錄", ...pj(STK.x + 100, STK.y + 75, 30, 80) }, { n: "待辦卡", ...pj(TODO.x + 115, TODO.y + 125, 6, 110) }, { n: "時鐘", ...pj(CLK.x, CLK.y + CLK.r, CLK.z + CLK.r, 70) }]; }
  const asOf = String((scenes[0].props as any)?.asOf ?? "");
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Backdrop /><Glow f={f} />
      <World f={f} cam={cam} P={Pn} panels={world} />
      <Bands f={f} on={inEnd ? -1 : ({ hook: -1, run: 1, wrong: 2, vs: 2, rule: 2, limit: 0, ask: 2, cta: 2 } as Record<string, number>)[(world.filter((q) => q.in <= f).pop()?.kind) ?? "hook"] ?? -1} />
      <Floaters f={f} cam={cam} />
      {inEnd ? null : <Overlays f={f} P={Pn} cam={cam} />}
      {inEnd ? null : world.map((p) => <Tag key={p.sid} f={f} p={p} />)}
      {inEnd ? null : <AsOf text={asOf} />}
      {inEnd ? <CaffEndcard f={f - endP!.in} keyword={String(endP!.p.keyword ?? "")} /> : null}
      {inEnd ? null : <HeaderIso name={channel?.name ?? "AI"} tag={channel?.tag ?? ""} right={channel?.slogan} progress={Math.min(1, f / Math.max(1, timeline.totalFrames - 1))} logo />}
      {inEnd ? null : <Caption cues={caps} f={f} />}
      {inEnd ? null : <SourceLine cues={srcs} f={f} />}
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>)}
    </AbsoluteFill>
  );
};
export const CoverMeeting: React.FC<Script> = ({ channel }) => <AbsoluteFill style={{ background: T.bg }}><Backdrop /><HeaderIso name={channel?.name ?? "AI"} tag="" right={channel?.slogan} progress={0} logo /></AbsoluteFill>;
