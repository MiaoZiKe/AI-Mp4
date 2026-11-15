// 等距 2.5D「AI 代理的一圈」引擎（script.json 頂層 stage: "iso" ＋ isoVersion: 4；第一支 videos/caffaine-agent-loop/）。
// 同一張粉彩桌面一鏡到底：中間是「AI 核心」，桌上一圈軌道，三站＝看（資料夾＋放大鏡）、做（工具箱＋終端機＋檔案）、檢查（測試板 ✓／✗），
// 一道「權限閘門」擋在看和做之間；光點彗星沿軌道跑（第二圈比第一圈快）。畫面上方是同步的 2D 說明卡。顏色、厚度讀 THEME_ISO；時間全部由 cue 換算。
// 沒有真實商標與介面：工具、檔案、終端機都是自畫的示意物件。
import React, { useLayoutEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_ISO as L, THEME_ISO as T } from "../../theme";
import { EASE, tween } from "../anim";
import { buildIso, type Panel } from "./engine";
import { CaffAnim } from "./CaffAnim";
import { Floaters, Glow } from "./IsoShort";
import { ap, at2, Backdrop, Bb, bounce, Box, Caption, type Cap, Check, Chip, col, css, face, ground, HeaderIso, iso, type M6, mul, Shade, Slab, SourceLine, wallX } from "./IsoVideo";

const zh: React.CSSProperties = { fontFamily: FONT_ZH, whiteSpace: "nowrap", lineHeight: 1.16 };
const en: React.CSSProperties = { fontFamily: FONT_EN, whiteSpace: "nowrap", lineHeight: 1 };
const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
const P = T.color.primary, S = T.solid;
const FAR = 1e9;
const E = (f: number, at: number, d: number) => tween(f, at, d, EASE.move);
const O = (f: number, at: number, d: number) => tween(f, at, d, EASE.enter);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const pulse = (f: number, at: number, dur: number) => (f < at ? 0 : 1 - tween(f, at, dur, EASE.enter));

// ───────── 桌面與軌道（世界座標）─────────
const DESKW = 860, DESKH = 660, C = { x: 430, y: 330 }, R = 200;
const ang = (s: number) => ((135 + 360 * s) * Math.PI) / 180;
const rp = (s: number) => ({ x: C.x + R * Math.cos(ang(s)), y: C.y + R * Math.sin(ang(s)) });
const ST = { look: 0, act: 1 / 3, check: 2 / 3, gate: 0.28 };
const LK = rp(ST.look), AC = rp(ST.act), CK = rp(ST.check), GT = rp(ST.gate);
const dens = (s: number) => Math.abs(((s % 1) + 1.5) % 1 - 0.5);
const near = (s: number, st: number, w = 0.09) => clamp(1 - Math.min(Math.abs(((s - st) % 1 + 1.5) % 1 - 0.5)) / w);

type Key = { frame: number; dur: number; look: [number, number, number]; zoom: number; sy: number; rot: number };
const camKeys = (panels: Panel[]): Key[] => panels.flatMap((x) => ([] as any[]).concat(x.p.camera ?? []).map((c, i) => ({ frame: i === 0 && !c.at ? x.in : x.at(c.at, x.in), dur: c.dur ?? 20, look: c.look, zoom: c.zoom, sy: c.sy, rot: c.rot ?? 0 }))).sort((a, b) => a.frame - b.frame);
const camAt = (keys: Key[], f: number, shakes: number[]): M6 => {
  if (!keys.length) return at2(L.W / 2, 900, 0.6);
  let [lx, ly] = iso(...keys[0].look), s = keys[0].zoom, sy = keys[0].sy, rot = keys[0].rot;
  for (const k of keys.slice(1)) { const t = E(f, k.frame, k.dur), [tx, ty] = iso(...k.look); lx += (tx - lx) * t; ly += (ty - ly) * t; s += (k.zoom - s) * t; sy += (k.sy - sy) * t; rot += (k.rot - rot) * t; }
  s *= 1 + 0.005 * Math.sin(f / 23); sy += 3 * Math.sin(f / 19);
  let dx = 2 * Math.sin(f / 27), dy = 0;
  for (const a of shakes) if (f >= a && f < a + 9) { const d = 1 - (f - a) / 9; dx += 10 * d * Math.sin((f - a) * 2.4); dy += 8 * d * Math.cos((f - a) * 3.1); }
  const r = (rot * Math.PI) / 180, c = Math.cos(r), n = Math.sin(r);
  return mul([c, n, -n, c, L.W / 2 + dx, sy + dy], [s, 0, 0, s, -s * lx, -s * ly]);
};

/** 彗星在軌道上的位置 s（可大於 1＝繞了幾圈）：每個 panel 的 props.comet = [{ at, to, dur }]，從上一個目標走到這個目標（ease-in-out） */
const cometAt = (panels: Panel[], f: number) => {
  const ks = panels.flatMap((x) => ([] as any[]).concat(x.p.comet ?? []).map((c) => ({ frame: x.at(c.at, x.in), to: c.to as number, dur: (c.dur ?? 30) as number }))).sort((a, b) => a.frame - b.frame);
  let cur = 0; for (const k of ks) cur += (k.to - cur) * E(f, k.frame, k.dur); return cur;
};
const speedAt = (panels: Panel[], f: number) => (cometAt(panels, f + 1) - cometAt(panels, f)) * FPS;

// ───────── 世界裡的小東西 ─────────
const ringPtsF = () => Array.from({ length: 73 }, (_, i) => { const a = ang(i / 72); return iso(C.x + R * Math.cos(a), C.y + R * Math.sin(a), 3).join(","); }).join(" ");
const Tool: React.FC<{ kind: number; x: number; y: number; o?: number; s?: number }> = ({ kind, x, y, o = 1, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle r={30} fill={T.card} stroke={T.cardSide} strokeWidth={4} />
    {kind === 0 ? <g transform="rotate(-40)"><rect x={-5} y={-4} width={10} height={26} rx={4} fill={S.coral.r} /><rect x={-16} y={-18} width={32} height={16} rx={5} fill={S.lav.r} /></g> : null}
    {kind === 1 ? <g transform="rotate(35)"><rect x={-4} y={-2} width={8} height={26} rx={4} fill={S.mint.r} /><circle cy={-9} r={11} fill="none" stroke={S.sky.r} strokeWidth={7} /></g> : null}
    {kind === 2 ? <g transform="rotate(40)"><rect x={-5} y={-18} width={10} height={30} rx={3} fill={S.yellow.r} /><path d="M-5 12 L5 12 L0 22 Z" fill={T.ink} /></g> : null}
  </g>
);

const Glyph: React.FC<{ kind: "ok" | "bad" | "q"; k?: number }> = ({ kind, k = 1 }) => (
  <g transform={`scale(${k})`}>
    <circle r={46} fill={kind === "ok" ? T.color.right.fill : kind === "bad" ? T.color.wrong.fill : T.cardSide} />
    {kind === "ok" ? <path d="M-22 2 L-6 18 L24 -16" fill="none" stroke="#fff" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" /> : kind === "bad" ? <path d="M-18 -18 L18 18 M18 -18 L-18 18" stroke="#fff" strokeWidth={11} strokeLinecap="round" /> : <text y={16} textAnchor="middle" fontFamily={FONT_EN} fontWeight={900} fontSize={52} fill="#fff">?</text>}
  </g>
);

type PM = Record<string, Panel | undefined>;
const World: React.FC<{ f: number; cam: M6; P: PM; panels: Panel[] }> = ({ f, cam, P: Pn, panels }) => {
  const ringPts = useMemo(ringPtsF, []);
  const s = cometAt(panels, f), sp = Math.abs(speedAt(panels, f)), live = f >= (panels[0]?.in ?? 0) + 4;
  const lk = Pn.look, ac = Pn.act, gt = Pn.gate, ck = Pn.check;
  const tRead = lk ? lk.at("read", FAR) : FAR, tTools = ac ? ac.at("tools", FAR) : FAR, tGate = gt ? gt.at("gate", FAR) : FAR, tChk = ck ? ck.at("check", FAR) : FAR, tAgain = ck ? ck.at("again", FAR) : FAR;
  const tOpen = tGate + 34, gateOpen = E(f, tOpen, 14), gateOn = tween(f, tGate - 4, 8) * (1 - 0.0);
  const readP = clamp((f - tRead) / 40), pages = Math.floor(readP * 4.01);
  const toolsP = (i: number) => E(f, tTools + i * 9, 26);
  const edited = E(f, tTools + 40, 24), typed = clamp((f - (tTools + 14)) / 50);
  const bad = f >= tChk + 16 && f < tAgain + 54, ok = f >= tAgain + 54;
  const hl = (k: keyof typeof ST, panel?: Panel) => Math.max(near(s, ST[k]) * (live ? 1 : 0), panel && f >= panel.in && f < panel.out ? 0.7 : 0);
  const coreGlow = 0.35 + 0.35 * Math.sin(f / 9) + 0.5 * pulse(f, tRead + 24, 30) + 0.5 * pulse(f, tAgain + 54, 20);
  const dir = (p: { x: number; y: number }) => ({ x: p.x - C.x, y: p.y - C.y });
  // 光點：從 a 飛到 b（拋物線），n 顆接力
  const flow = (a: { x: number; y: number }, b: { x: number; y: number }, t0: number, t1: number, color: string, key: string, z0 = 40, z1 = 60) => {
    if (f < t0 || f > t1) return null;
    const fade = Math.min(O(f, t0, 8), 1 - O(f, t1 - 8, 8));
    return <g key={key} opacity={fade}>{Array.from({ length: 9 }, (_, i) => { const u = (((f - t0) * 0.022 + i / 9) % 1), x = a.x + (b.x - a.x) * u, y = a.y + (b.y - a.y) * u, z = z0 + (z1 - z0) * u + 70 * Math.sin(Math.PI * u), [px, py] = iso(x, y, z), r = 9 * (0.6 + 0.6 * Math.sin(Math.PI * u)); return <rect key={i} x={px - r} y={py - r} width={2 * r} height={2 * r} rx={i % 3 === 0 ? r : 3} fill={color} opacity={0.4 + 0.6 * Math.sin(Math.PI * u)} />; })}</g>;
  };
  const chevs = [0.06, 0.23, 0.4, 0.56, 0.73, 0.9].map((u) => { const a = ang(u), p = rp(u), tx = -Math.sin(a), ty = Math.cos(a), nx = Math.cos(a), ny = Math.sin(a); const q = (dx: number, dy: number) => iso(p.x + tx * dx + nx * dy, p.y + ty * dx + ny * dy, 3).join(","); const on = 0.35 + 0.65 * near(s, u, 0.06); return <polygon key={u} points={`${q(16, 0)} ${q(-8, 12)} ${q(-8, -12)}`} fill={P.fill} opacity={0.3 + 0.5 * on} />; });
  const trail = Array.from({ length: 14 }, (_, k) => { const p = rp(s - k * (0.006 + 0.0042 * sp)), [px, py] = iso(p.x, p.y, 12), r = (15 - k) * 1.05; return <g key={k}><circle cx={px} cy={py} r={r * 1.9} fill={P.fill} opacity={0.13 * (1 - k / 14)} /><circle cx={px} cy={py} r={r} fill={k === 0 ? "#fff" : P.fill} stroke={k === 0 ? P.fill : "none"} strokeWidth={5} opacity={1 - k / 15} /></g>; });
  const pg = [0, 1, 2, 3].map((i) => ({ x: LK.x - 44 + (i % 2) * 52, y: LK.y - 34 + Math.floor(i / 2) * 44 }));
  const lens = (() => { const t = E(f, tRead, 36), u = Math.min(1, t * 1.0); const sx = LK.x - 90 + 160 * Math.sin(u * Math.PI * 2 * 0.5) * 0 + 150 * u, sy = LK.y - 60 + 110 * Math.abs(Math.sin(u * Math.PI * 1.5)); return { x: LK.x - 80 + 140 * u, y: LK.y - 50 + 80 * Math.sin(u * Math.PI * 2.5) * (1 - u * 0.4), z: 58 + 6 * Math.sin(f / 6), on: f >= tRead - 10 && f < tRead + 80 }; })();
  const lid = E(f, ac ? ac.at("act", FAR) : FAR, 14);
  const termM = wallX(AC.x - 130 + 70, AC.y - 90 + 110, 60);
  const boardM = wallX(CK.x - 8 + 16, CK.y - 65 + 130, 110);
  const gateD = dir(GT), gl = Math.hypot(gateD.x, gateD.y), gr = { x: gateD.x / gl, y: gateD.y / gl };
  const gp = (k: number, z: number) => iso(GT.x + gr.x * k, GT.y + gr.y * k, z).join(",");
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <pattern id="agDots" width={80} height={80} patternUnits="userSpaceOnUse" patternTransform={css(mul(cam, ground((f * 0.5) % 80, (f * 0.25) % 80, -60)))}><circle cx={10} cy={10} r={5} fill={T.dot} /></pattern>
        <radialGradient id="agCore"><stop offset="0" stopColor="#8E9BFF" stopOpacity={0.9} /><stop offset="1" stopColor="#8E9BFF" stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={0} y={L.HEADER_TOP + 90} width={L.W} height={L.CAP_TOP - L.HEADER_TOP - 90} fill="url(#agDots)" />
      <g transform={css(cam)}>
        <Shade x={50} y={50} w={DESKW} h={DESKH} r={56} z={-110} />
        <Slab id="agDesk" x={0} y={0} w={DESKW} h={DESKH} t={40} r={48} c={S.desk} />
        {/* 軌道：虛線小點＋方向箭頭＋彗星 */}
        <polyline points={ringPts} fill="none" stroke={P.soft} strokeWidth={26} strokeLinejoin="round" opacity={0.9} />
        <polyline points={ringPts} fill="none" stroke={P.fill} strokeWidth={6} strokeDasharray="2 16" strokeLinecap="round" opacity={0.55} />
        {chevs}
        {/* 各站的光圈（彗星經過或正在講這一站時亮起） */}
        {([["look", LK, lk], ["act", AC, ac], ["check", CK, ck]] as const).map(([k, p, pn]) => { const h = hl(k as any, pn as any); return h > 0.02 ? <g key={k} transform={css(ground(p.x, p.y, 2))}><circle r={78 + 8 * Math.sin(f / 5)} fill={P.soft} opacity={0.8 * h} /><circle r={78 + 8 * Math.sin(f / 5)} fill="none" stroke={P.fill} strokeWidth={6} opacity={0.7 * h} /></g> : null; })}
        {/* 後面的：做（工具箱、終端機、檔案）、閘門 */}
        <g>
          <Shade x={AC.x - 140} y={AC.y - 100} w={230} h={170} r={20} />
          <Box x={AC.x - 130} y={AC.y - 90} z={0} dx={70} dy={110} dz={60} c={{ top: "#2A3566", l: "#1B2545", r: "#141C38" }} />
          <g transform={css(termM)}>
            <rect x={6} y={6} width={98} height={48} rx={8} fill="#0F1630" />
            <text x={12} y={28} fontFamily={MONO} fontWeight={800} fontSize={20} fill="#7DF0C6">$</text>
            <rect x={30} y={16} width={Math.max(0, 60 * typed)} height={9} rx={4} fill="#7DF0C6" />
            <rect x={30} y={32} width={Math.max(0, 44 * clamp(typed * 1.4 - 0.4))} height={9} rx={4} fill="#9BB0FF" />
            {Math.floor(f / 7) % 2 === 0 && typed > 0 ? <rect x={34 + 60 * typed} y={14} width={8} height={14} fill="#7DF0C6" /> : null}
          </g>
          <Slab id="agFile" x={AC.x + 40} y={AC.y - 80} z={2} w={86} h={110} t={6} r={8} c={S.white}>
            {[0, 1, 2, 3].map((i) => <rect key={i} x={12} y={16 + i * 22} width={62 - (i % 2) * 18} height={9} rx={4} fill={edited > i / 4 + 0.1 ? T.color.right.fill : T.cardSide} />)}
          </Slab>
          <Box x={AC.x - 40} y={AC.y - 36} z={0} dx={92} dy={64} dz={34} c={S.coral} />
          <Slab id="agLid" x={AC.x - 44} y={AC.y - 40} z={34 + 46 * lid} w={100} h={72} t={8} r={8} c={S.coral} />
          {Array.from({ length: 3 }, (_, i) => { const t = toolsP(i), from = iso(AC.x + 5, AC.y, 60), to = i === 1 ? iso(AC.x - 95, AC.y - 35, 95) : iso(AC.x + 80, AC.y - 25, 78 + 8 * i); const x = from[0] + (to[0] - from[0]) * t, y = from[1] + (to[1] - from[1]) * t - 120 * Math.sin(Math.PI * t), back = E(f, tTools + 36 + i * 6, 22), x2 = x + (from[0] - x) * back, y2 = y + (from[1] - y) * back; return f >= tTools + i * 9 && back < 0.98 ? <Tool key={i} kind={i} x={x2} y={y2} s={0.95 + 0.1 * Math.sin(f / 4 + i)} o={1 - back * 0.5} /> : null; })}
        </g>
        {/* 閘門：兩根柱子＋橫樑＋會亮的擋條；通過後擋條升起 */}
        <g>
          <Shade x={GT.x - 50} y={GT.y - 50} w={100} h={100} r={14} a={0.07} />
          <polygon points={`${gp(-44, 20)} ${gp(44, 20)} ${gp(44, 96)} ${gp(-44, 96)}`} fill={T.color.note.fill} opacity={(0.2 + 0.55 * gateOn * (1 - gateOpen)) * (0.85 + 0.15 * Math.sin(f / 3))} />
          {Array.from({ length: 5 }, (_, i) => <line key={i} x1={iso(GT.x + gr.x * (-40 + i * 20), GT.y + gr.y * (-40 + i * 20), 22)[0]} y1={iso(GT.x + gr.x * (-40 + i * 20), GT.y + gr.y * (-40 + i * 20), 22)[1]} x2={iso(GT.x + gr.x * (-40 + i * 20), GT.y + gr.y * (-40 + i * 20), 94)[0]} y2={iso(GT.x + gr.x * (-40 + i * 20), GT.y + gr.y * (-40 + i * 20), 94)[1]} stroke={T.color.note.fill} strokeWidth={5} opacity={0.55 * gateOn * (1 - gateOpen)} />)}
          <Box x={GT.x + gr.x * -52 - 7} y={GT.y + gr.y * -52 - 7} dx={14} dy={14} dz={104} c={S.yellow} />
          <Box x={GT.x + gr.x * 52 - 7} y={GT.y + gr.y * 52 - 7} dx={14} dy={14} dz={104} c={S.yellow} />
          <polygon points={`${gp(-56, 108)} ${gp(56, 108)} ${gp(56, 96)} ${gp(-56, 96)}`} fill={S.yellow.r} />
        </g>
        {/* 中間：AI 核心 */}
        {(() => { const [cx, cy] = iso(C.x, C.y, 40); return <g><circle cx={cx} cy={cy} r={140} fill="url(#agCore)" opacity={clamp(coreGlow) * 0.8} /></g>; })()}
        <Shade x={C.x - 34} y={C.y - 34} w={68} h={68} r={10} />
        <Box x={C.x - 30} y={C.y - 30} dx={60} dy={60} dz={58} c={{ top: "#8E9BFF", l: P.fill, r: P.side }} />
        <g transform={css(ground(C.x - 30, C.y - 30, 58))}><text x={30} y={42} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={34} fill="#fff">AI</text></g>
        {/* 前面的：看（資料夾堆、頁面、放大鏡）、檢查（測試板） */}
        <g>
          <Shade x={LK.x - 60} y={LK.y - 46} w={120} h={92} r={14} />
          <Slab id="agF1" x={LK.x - 56} y={LK.y - 42} z={0} w={112} h={84} t={10} r={10} c={S.lav} />
          <Slab id="agF2" x={LK.x - 56} y={LK.y - 42} z={10} w={112} h={84} t={10} r={10} c={S.mint} />
          <Slab id="agF3" x={LK.x - 56} y={LK.y - 42} z={20} w={112} h={84} t={10} r={10} c={S.yellow} />
          {pg.map((q, i) => { const lit = i < pages; return <Slab key={i} id={`agPg${i}`} x={q.x} y={q.y} z={30 + (lit ? 10 + 6 * Math.sin(f / 5 + i) : 0)} w={44} h={34} t={4} r={5} c={lit ? { top: P.soft, l: "#C7CFFF", r: "#AEB8FF" } : S.white}><rect x={7} y={9} width={30} height={5} rx={2.5} fill={lit ? P.fill : T.cardSide} /><rect x={7} y={19} width={20} height={5} rx={2.5} fill={lit ? P.fill : T.cardSide} /></Slab>; })}
          {lens.on ? <g>{[0, 12].map((z) => <g key={z} transform={css(ground(lens.x, lens.y, lens.z + z))}><line x1={30} y1={30} x2={84} y2={84} stroke={z ? S.lav.l : S.lav.r} strokeWidth={16} strokeLinecap="round" /><circle r={40} fill={z ? T.card : S.lav.r} fillOpacity={z ? 0.7 : 1} stroke={z ? S.lav.top : S.lav.r} strokeWidth={13} /></g>)}</g> : null}
        </g>
        {flow(LK, C, tRead + 22, (lk?.out ?? FAR) - 4, P.fill, "f1", 50, 62)}
        {flow(C, AC, tTools - 10, (ac?.out ?? FAR) - 4, T.color.sky.fill, "f2", 62, 50)}
        <g>
          <Shade x={CK.x - 30} y={CK.y - 70} w={60} h={140} r={10} />
          <Slab id="agBase" x={CK.x - 40} y={CK.y - 70} z={0} w={80} h={140} t={8} r={10} c={S.white} />
          <Box x={CK.x - 8} y={CK.y - 65} z={8} dx={16} dy={130} dz={102} c={S.white} />
          <g transform={css(boardM)}>
            <rect x={6} y={6} width={118} height={90} rx={10} fill={ok ? T.color.right.soft : bad ? T.color.wrong.soft : P.soft} />
            <g transform="translate(65 52)"><Glyph kind={ok ? "ok" : bad ? "bad" : "q"} k={f >= tChk + 16 ? 0.55 + 0.45 * Math.min(1, 1 + 0.5 * Math.sin((f - (ok ? tAgain + 54 : tChk + 16)) * 0.6) * Math.exp(-(f - (ok ? tAgain + 54 : tChk + 16)) / 6)) : 0.6} /></g>
          </g>
        </g>
        {flow(CK, C, tChk + 4, tChk + 20, T.color.sky.fill, "f3", 70, 62)}
        {live ? trail : null}
      </g>
    </svg>
  );
};

// ───────── 2D 說明卡 ─────────
const Card: React.FC<{ x: number; y: number; w: number; h: number; f: number; at: number; children: React.ReactNode; bg?: string; side?: string; out?: number }> = ({ x, y, w, h, f, at, children, bg, side, out = FAR }) => {
  const o = O(f, at, 5) * (1 - O(f, out, 6)), t = 1 - 1 / (1 + Math.exp(-(f - at - 5) * 0.4));
  return o <= 0.01 ? null : <div data-ov="說明卡" style={{ position: "absolute", left: x, top: y + 50 * Math.max(0, 1 - O(f, at, 12)), width: w, height: h, opacity: o }}><div style={{ ...face(bg, side), padding: "22px 28px", position: "relative", overflow: "hidden" }}>{children}</div></div>;
};
const Step: React.FC<{ n: string; label: string; c: string; on: number; f: number; at: number }> = ({ n, label, c, on, f, at }) => {
  const cc = col(c);
  return <div data-ov={`步驟${n}`} style={{ ...bounce(f, at), display: "inline-flex", alignItems: "center", gap: 14, background: on > 0.5 ? cc.fill : T.card, color: on > 0.5 ? cc.on : T.ink, borderRadius: 30, padding: "14px 30px 14px 16px", boxShadow: `0 8px 0 ${on > 0.5 ? cc.side : T.cardSide}, ${T.depth.soft}` }}>
    <div style={{ width: 48, height: 48, borderRadius: 16, background: on > 0.5 ? "rgba(255,255,255,0.28)" : cc.soft, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: 900, fontSize: 32, color: on > 0.5 ? cc.on : cc.text }}>{n}</div>
    <div style={{ ...zh, fontWeight: 900, fontSize: 54 }}>{label}</div>
  </div>;
};
const Arrow: React.FC<{ w?: number; c?: string }> = ({ w = 60, c = T.ink3 }) => <svg width={w} height={30} viewBox="0 0 60 30"><path d="M4 15 H46 M36 5 L48 15 L36 25" fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></svg>;

const Overlays: React.FC<{ f: number; P: PM; cam: M6; panels: Panel[] }> = ({ f, P: Pn0, cam, panels }) => {
  let Pn = Pn0;
  const out: React.ReactNode[] = [];
  const act = (q?: Panel) => (q && f >= q.in - 1 && f < q.out + 1 ? q : undefined);
  Pn = { hook: act(Pn.hook), vs: act(Pn.vs), loop: act(Pn.loop), look: act(Pn.look), act: act(Pn.act), gate: act(Pn.gate), check: act(Pn.check), ask: act(Pn.ask), next: act(Pn.next) };
  const W0 = L.X, TOP = L.MAIN_TOP + 8;
  const s = cometAt(panels, f);
  // 錨在世界裡某個點的小標籤
  const tag = (key: string, wp: { x: number; y: number }, z: number, text: string, c: string, at: number, until = FAR) => { const [sx, sy] = ap(cam, iso(wp.x, wp.y, z)); const o = O(f, at, 5) * (1 - O(f, until, 6)); return o > 0.02 ? <div key={key} data-ov="標籤" style={{ position: "absolute", left: sx, top: sy, opacity: o }}><div style={{ transform: "translate(-50%,-100%)" }}><div style={bounce(f, at)}><Chip text={text} bg={col(c).fill} fg={col(c).on} px={34} side={col(c).side} /></div></div></div> : null; };
  // ── 1 鉤子：第 0 幀就是兩行實心大字，右邊的「不停」立刻有動作 ──
  if (Pn.hook) {
    const h = Pn.hook, tS = h.at("stop", 8), tG = h.at("go", 34), a = O(f, h.in, 4);
    out.push(
      <div key="hk" style={{ position: "absolute", left: W0, top: TOP + 10, width: L.INNER_W, opacity: 1 - O(f, h.out - 10, 8) }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 30 }}>
          <div data-ov="鉤子大字" style={{ display: "inline-block", ...zh, fontWeight: 900, fontSize: 116, color: T.ink2 }}>聊天 AI<br /><span style={{ color: T.ink }}>答完就停</span></div>
          <div data-ov="停章" style={{ marginTop: 8, transform: `rotate(-8deg) scale(${f < tS ? 0 : 1 + 1.2 * (1 - O(f, tS, 5))})`, opacity: f < tS ? 0 : 1, ...zh, fontWeight: 900, fontSize: 76, color: T.color.wrong.text, border: `8px solid ${T.color.wrong.fill}`, borderRadius: 16, background: T.card, padding: "4px 18px" }}>停</div>
        </div>
        <div data-ov="鉤子大字2" style={{ display: "inline-block", ...zh, fontWeight: 900, fontSize: 116, color: f < tG ? T.ink3 : P.text, marginTop: 20, transform: `scale(${f < tG ? 1 : 1 + 0.12 * Math.exp(-(f - tG) / 5)})`, transformOrigin: "0 50%" }}>代理不會停</div>
      </div>,
    );
  }
  // ── 2 對照：左邊聊天 AI 一問一答就停，右邊代理繞圈 ──
  if (Pn.vs) {
    const v = Pn.vs, tAsk = v.at("ask", 12), tDo = v.at("do", 60), o = 1 - O(f, v.out - 8, 8);
    const cw = 448, ch = 410, y = TOP + 6;
    out.push(
      <Card key="vsL" x={W0} y={y} w={cw} h={ch} f={f} at={v.in + 2} out={v.out - 6}>
        <Chip text="聊天 AI" bg={T.ink} fg={T.card} px={38} />
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...bounce(f, tAsk), alignSelf: "flex-end", background: P.fill, color: "#fff", ...zh, fontWeight: 800, fontSize: 38, padding: "12px 26px", borderRadius: "26px 26px 6px 26px" }}>你問</div>
          <div style={{ ...bounce(f, tAsk + 14), alignSelf: "flex-start", background: T.line, color: T.ink, ...zh, fontWeight: 800, fontSize: 38, padding: "12px 26px", borderRadius: "26px 26px 26px 6px" }}>它答</div>
          <div style={{ ...bounce(f, tAsk + 30), alignSelf: "center", marginTop: 14, display: "flex", alignItems: "center", gap: 14 }}><div style={{ width: 70, height: 70, borderRadius: 20, background: T.color.wrong.fill, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 28, height: 28, background: "#fff", borderRadius: 4 }} /></div><span style={{ ...zh, fontWeight: 900, fontSize: 44, color: T.color.wrong.text }}>就停</span></div>
        </div>
      </Card>,
      <Card key="vsR" x={W0 + cw + 56} y={y} w={cw} h={ch} f={f} at={v.in + 8} bg={T.card} out={v.out - 6}>
        <Chip text="AI 代理" bg={P.fill} fg="#fff" px={38} side={P.side} />
        <svg width={392} height={300} viewBox="0 40 392 300" style={{ marginTop: 0 }}>
          {(() => { const cx = 196, cy = 190, r = 120, t = O(f, tDo, 10); const pts = [0, 1, 2].map((i) => { const a = (-90 + i * 120) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }); const u = ((f - tDo) * 0.018) % 1, a = (-90 + 360 * u) * Math.PI / 180;
            return <g opacity={t}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={P.soft} strokeWidth={26} /><circle cx={cx} cy={cy} r={r} fill="none" stroke={P.fill} strokeWidth={5} strokeDasharray="2 14" strokeLinecap="round" />
              {["看", "做", "查"].map((w, i) => <g key={w} transform={`translate(${pts[i][0]} ${pts[i][1]})`}><circle r={40} fill={[T.color.right.fill, T.color.note.fill, T.color.wrong.fill][i]} stroke="#fff" strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT_ZH} fontWeight={900} fontSize={42} fill={i === 1 ? T.ink : "#fff"}>{w}</text></g>)}
              {Array.from({ length: 8 }, (_, k) => { const aa = a - k * 0.12; return <circle key={k} cx={cx + r * Math.cos(aa)} cy={cy + r * Math.sin(aa)} r={14 - k * 1.3} fill={P.fill} opacity={1 - k / 9} />; })}
              <text x={cx} y={cy + 14} textAnchor="middle" fontFamily={FONT_ZH} fontWeight={900} fontSize={40} fill={T.ink}>自己動手</text>
            </g>; })()}
        </svg>
      </Card>,
    );
  }
  // ── 3 一圈三步：看、做、檢查，彗星經過哪一步就亮哪一步 ──
  if (Pn.loop) {
    const l = Pn.loop, tL = l.at("loop", 6), tA = l.at("see", 40), tB = l.at("act", 60), tC = l.at("chk", 80), o = 1 - O(f, l.out - 8, 8);
    const on = (st: number) => (near(((s % 1) + 1) % 1, st, 0.12) > 0.4 || (f > l.out - 30) ? 1 : 0) as number;
    out.push(
      <div key="lp" style={{ position: "absolute", left: W0, top: TOP + 10, width: L.INNER_W, opacity: o }}>
        <div data-ov="標籤chip" style={{ ...bounce(f, tL), display: "inline-block", marginBottom: 22 }}><Chip text="繞一個圈" bg={T.ink} fg={T.card} px={40} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Step n="1" label="看" c="right" on={on(ST.look)} f={f} at={tA} /><Arrow /><Step n="2" label="做" c="note" on={on(ST.act)} f={f} at={tB} /><Arrow /><Step n="3" label="檢查" c="wrong" on={on(ST.check)} f={f} at={tC} />
        </div>
      </div>,
    );
  }
  // ── 4 看 ──
  if (Pn.look) {
    const k = Pn.look, tRd = k.at("read", 30), o = 1 - O(f, k.out - 8, 8);
    out.push(
      <div key="lk" style={{ position: "absolute", left: W0, top: TOP + 10, width: L.INNER_W, opacity: o }}>
        <Step n="1" label="先看" c="right" on={1} f={f} at={k.in + 2} />
        <div data-ov="細節" style={{ ...bounce(f, tRd), marginTop: 32, display: "inline-flex", alignItems: "center", gap: 14, background: T.card, borderRadius: 26, padding: "14px 28px", boxShadow: `0 8px 0 ${T.cardSide}, ${T.depth.soft}` }}><span style={{ ...zh, fontWeight: 900, fontSize: 48, color: T.ink }}>讀你的檔案</span><span style={{ ...zh, fontWeight: 700, fontSize: 36, color: T.ink3 }}>搞清楚狀況</span></div>
      </div>,
      tag("lkT", LK, 120, "你的檔案", "right", k.in + 14, k.out - 8),
    );
  }
  // ── 5 做 ──
  if (Pn.act) {
    const k = Pn.act, tT = k.at("tools", 30), o = 1 - O(f, k.out - 8, 8);
    out.push(
      <div key="ac" style={{ position: "absolute", left: W0, top: TOP + 10, width: L.INNER_W, opacity: o }}>
        <Step n="2" label="再做" c="note" on={1} f={f} at={k.in + 2} />
        <div style={{ display: "flex", gap: 16, marginTop: 32 }}>{["用工具改檔案", "跑指令"].map((t, i) => <div key={t} data-ov="細節" style={{ ...bounce(f, tT + i * 12), background: T.card, borderRadius: 26, padding: "14px 28px", boxShadow: `0 8px 0 ${T.cardSide}, ${T.depth.soft}`, ...zh, fontWeight: 900, fontSize: 46, color: T.ink }}>{t}</div>)}</div>
      </div>,
      tag("acT", AC, 150, "工具箱", "note", k.in + 14, k.out - 8),
    );
  }
  // ── 6 閘門：要放行嗎？按下「放行」，擋條升起 ──
  if (Pn.gate) {
    const k = Pn.gate, tG = k.at("gate", 20), tOk = tG + 34, o = 1 - O(f, k.out - 8, 8), press = pulse(f, tOk, 8);
    const [gx, gy] = ap(cam, iso(GT.x, GT.y, 130));
    out.push(
      <div key="gt" style={{ position: "absolute", left: W0, top: TOP + 10, width: L.INNER_W, opacity: o }}>
        <div data-ov="標籤chip" style={{ ...bounce(f, k.in + 2), display: "inline-block" }}><Chip text="權限這一關" bg={T.color.note.fill} fg={T.ink} px={50} side={T.color.note.side} /></div>
        <div data-ov="細節" style={{ ...bounce(f, tG), marginTop: 52, display: "inline-flex", alignItems: "center", gap: 18, background: T.card, borderRadius: 28, padding: "16px 22px 16px 30px", boxShadow: `0 8px 0 ${T.cardSide}, ${T.depth.soft}` }}>
          <span style={{ ...zh, fontWeight: 900, fontSize: 46, color: T.ink }}>要放行嗎？</span>
          <div style={{ transform: `scale(${1 - 0.12 * press})`, ...zh, fontWeight: 900, fontSize: 44, color: f >= tOk ? "#fff" : T.ink, background: f >= tOk ? T.color.right.fill : T.color.right.soft, borderRadius: 20, padding: "8px 26px", boxShadow: `0 ${f >= tOk ? 2 : 7}px 0 ${T.color.right.side}` }}>放行</div>
          <div style={{ ...zh, fontWeight: 800, fontSize: 40, color: T.ink3, borderRadius: 20, padding: "8px 22px", background: T.line }}>不要</div>
        </div>
      </div>,
      <div key="gtL" data-ov="標籤" style={{ position: "absolute", left: gx, top: gy, opacity: O(f, tG, 5) * (1 - O(f, tOk + 6, 6)) }}><div style={{ transform: "translate(-50%,-100%)" }}><Chip text="🔒 等你放行" bg={T.color.note.fill} fg={T.ink} px={34} side={T.color.note.side} /></div></div>,
    );
  }
  // ── 7 檢查：第 1 圈 ✗ → 再繞一圈（更快）→ 第 2 圈 ✓ ──
  if (Pn.check) {
    const k = Pn.check, tC = k.at("check", 20), tA = k.at("again", 90), o = 1 - O(f, k.out - 8, 8), laps = Math.max(0, Math.floor(s + 0.001));
    out.push(
      <div key="ck" style={{ position: "absolute", left: W0, top: TOP + 10, width: L.INNER_W, opacity: o }}>
        <Step n="3" label="最後檢查" c="wrong" on={1} f={f} at={k.in + 2} />
        <div style={{ display: "flex", gap: 16, marginTop: 32, alignItems: "center" }}>
          <div data-ov="細節" style={{ ...bounce(f, tC + 14), background: f >= tC + 14 ? T.color.wrong.soft : T.card, borderRadius: 24, padding: "12px 26px", boxShadow: `0 8px 0 ${T.cardSide}`, ...zh, fontWeight: 900, fontSize: 44, color: T.color.wrong.text }}>第 1 圈　✗ 不對</div>
          {f >= tA && f < tA + 54 ? <div data-ov="細節" style={{ ...bounce(f, tA + 4), ...zh, fontWeight: 900, fontSize: 44, color: P.text, background: P.soft, borderRadius: 24, padding: "12px 26px", boxShadow: `0 8px 0 ${P.fill}` }}>再繞 · 更快</div> : null}
          {f >= tA + 54 ? <div data-ov="細節" style={{ ...bounce(f, tA + 54), background: T.color.right.soft, borderRadius: 24, padding: "12px 26px", boxShadow: `0 8px 0 ${T.color.right.side}`, ...zh, fontWeight: 900, fontSize: 44, color: T.color.right.text }}>第 2 圈　✓ 對了</div> : null}
        </div>
      </div>,
    );
  }
  // ── 8 二選一 ──
  if (Pn.ask) {
    const k = Pn.ask, t1 = k.at("every", 10), t2 = k.at("free", 40), o = 1 - O(f, k.out - 8, 8), cw = 448, y = TOP + 6;
    const gateIcon = <svg width={120} height={100} viewBox="0 0 120 100"><rect x={12} y={20} width={14} height={76} rx={4} fill={S.yellow.r} /><rect x={94} y={20} width={14} height={76} rx={4} fill={S.yellow.r} /><rect x={8} y={12} width={104} height={14} rx={6} fill={S.yellow.top} /><rect x={30} y={36} width={60} height={46} rx={8} fill={T.color.note.fill} opacity={0.7} /></svg>;
    const fastIcon = <svg width={120} height={100} viewBox="0 0 120 100"><circle cx={60} cy={50} r={36} fill="none" stroke={P.soft} strokeWidth={16} /><circle cx={60} cy={50} r={36} fill="none" stroke={P.fill} strokeWidth={5} strokeDasharray="2 12" strokeLinecap="round" /><circle cx={96} cy={50} r={11} fill={P.fill} /><circle cx={84} cy={22} r={7} fill={P.fill} opacity={0.5} /></svg>;
    out.push(
      <div key="ask" style={{ position: "absolute", left: W0, top: y, width: L.INNER_W, opacity: o }}>
        <div style={{ display: "flex", gap: 56 }}>
          {[["每一步都問你", gateIcon, t1, "note"], ["放手讓它做", fastIcon, t2, "primary"]].map(([t, ic, at, c]) => <div key={t as string} data-ov="選項卡" style={{ ...bounce(f, at as number), width: cw }}><div style={{ ...face(T.card, col(c as string).fill, 12), padding: "26px 20px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>{ic as React.ReactNode}<div style={{ ...zh, fontWeight: 900, fontSize: 56, color: T.ink }}>{t as string}</div></div></div>)}
        </div>
      </div>,
    );
  }
  // ── 9 下一集 ──
  if (Pn.next) {
    const k = Pn.next, tN = k.at("next", 10), pc = col("plum");
    out.push(
      <div key="nx" style={{ position: "absolute", left: W0, top: TOP + 10, width: L.INNER_W }}>
        <div data-ov="下一集卡" style={{ ...bounce(f, tN, -2) }}>
          <div style={{ ...face(pc.fill, pc.side, 14, 40), padding: "28px 36px" }}>
            <div style={{ ...zh, fontWeight: 700, fontSize: 36, color: pc.on }}>下一集</div>
            <div style={{ ...zh, fontWeight: 900, fontSize: 92, color: pc.on, marginTop: 6 }}>四種權限模式</div>
            <div style={{ display: "flex", gap: 14, marginTop: 20 }}>{["manual", "auto-accept", "auto", "Plan Mode"].map((t, i) => <div key={t} style={{ ...bounce(f, tN + 8 + i * 5), ...en, fontWeight: 800, fontSize: 32, color: pc.text, background: T.card, borderRadius: 18, padding: "10px 18px" }}>{t}</div>)}</div>
          </div>
        </div>
      </div>,
    );
  }
  return <>{out}</>;
};

/** 上下兩條淡色帶（平台介面區也有內容）＋底部的「一圈三步」追蹤條：彗星在哪一站就亮哪一站 */
const Bands: React.FC<{ f: number; s: number }> = ({ f, s }) => {
  const steps: [string, number, string][] = [["看", ST.look, "right"], ["做", ST.act, "note"], ["檢查", ST.check, "wrong"]];
  return (
    <>
      <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={0} y={0} width={L.W} height={64} fill={S.lav.top} /><rect x={0} y={L.H - 64} width={L.W} height={64} fill={S.mint.top} />
        {Array.from({ length: 27 }, (_, i) => <g key={i}><rect x={i * 40 + 16} y={22} width={8} height={8} rx={2} fill={P.fill} opacity={0.35} /><rect x={i * 40 + 16} y={L.H - 42} width={8} height={8} rx={2} fill={T.color.right.fill} opacity={0.4} /></g>)}
      </svg>
      <div style={{ position: "absolute", left: L.X, width: L.INNER_W, top: 1690, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
        {steps.map(([w, st, c], i) => { const on = near(((s % 1) + 1) % 1, st, 0.17) > 0.35, cc = col(c); return (
          <React.Fragment key={w}>
            {i ? <svg width={54} height={30} viewBox="0 0 60 30"><path d="M4 15 H46 M36 5 L48 15 L36 25" fill="none" stroke={T.ink3} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
            <div data-ov="追蹤條" style={{ ...zh, fontWeight: 900, fontSize: 50, padding: "14px 34px", borderRadius: 30, background: on ? cc.fill : T.card, color: on ? cc.on : T.ink3, boxShadow: `0 8px 0 ${on ? cc.side : T.cardSide}`, transform: `scale(${on ? 1.06 : 1})`, transition: "none" }}>{w}</div>
          </React.Fragment>); })}
      </div>
    </>
  );
};

export const AgentIso: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel, ...rest }) => {
  const f = useCurrentFrame();
  const ov = !!(rest as any).ovcheck;
  const [hdl] = useState(() => (ov ? delayRender("ovcheck") : 0));
  // 版面檢查用（scripts/caffaine/ov-check.mjs 傳 ovcheck: true）：量每個 data-ov 元素的框，連同桌面四角用 console.log 回報
  useLayoutEffect(() => {
    if (!ov) return;
    const eff = (el: Element | null) => { let o = 1; while (el && el !== document.body) { o *= Number(getComputedStyle(el).opacity); el = el.parentElement; } return o; };
    const boxes = Array.from(document.querySelectorAll("[data-ov]")).map((el) => { const r = el.getBoundingClientRect(); return { n: el.getAttribute("data-ov"), x: r.x, y: r.y, w: r.width, h: r.height, o: eff(el), ovf: (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth + 2 }; }).filter((b) => b.w > 1 && b.h > 1 && b.o > 0.5);
    const small: { t: string; fs: number }[] = [];
    document.querySelectorAll("div,span").forEach((el) => { const tn = Array.from(el.childNodes).filter((c) => c.nodeType === 3 && (c.textContent ?? "").trim()); if (tn.length && eff(el) > 0.5) { const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 28) small.push({ t: (el.textContent ?? "").slice(0, 12), fs }); } });
    console.log("OVREPORT " + JSON.stringify({ f, boxes, small, desk: (window as any).__deskPoly ?? null }));
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
  const gateP = Pn.gate, shakes = [gateP ? gateP.at("gate", FAR) + 34 : FAR, Pn.hook ? Pn.hook.at("stop", FAR) + 4 : FAR, Pn.check ? Pn.check.at("again", FAR) + 54 : FAR].filter((t) => t < FAR / 2);
  const cam = camAt(keys, f, shakes);
  const inEnd = !!endP && f >= endP.in;
  const deskPoly = [[0, 0], [DESKW, 0], [DESKW, DESKH], [0, DESKH]].map(([x, y]) => { const [px, py] = iso(x, y, 0); return [cam[0] * px + cam[2] * py + cam[4], cam[1] * px + cam[3] * py + cam[5]]; });
  (window as any).__deskPoly = deskPoly;
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Backdrop /><Glow f={f} />
      <Bands f={f} s={cometAt(world, f)} />
      <World f={f} cam={cam} P={Pn} panels={world} />
      <Floaters f={f} cam={cam} />
      <Overlays f={f} P={Pn} cam={cam} panels={world} />
      {inEnd ? <CaffAnim f={f - endP!.in} keyword={String(endP!.p.keyword ?? "")} /> : null}
      <HeaderIso name={channel?.name ?? "AI"} tag={channel?.tag ?? ""} right={channel?.slogan} progress={Math.min(1, f / Math.max(1, timeline.totalFrames - 1))} logo />
      {inEnd ? null : <Caption cues={caps} f={f} />}
      {inEnd ? null : <SourceLine cues={srcs} f={f} />}
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>)}
    </AbsoluteFill>
  );
};
/** 封面：鉤子那一幀（第 0 幀的實心大字＋桌面） */
export const CoverAgent: React.FC<Script> = ({ scenes, channel }) => <AbsoluteFill style={{ background: T.bg }}><Backdrop /><HeaderIso name={channel?.name ?? "AI"} tag="" right={channel?.slogan} progress={0} logo /></AbsoluteFill>;
