// 等距 2.5D 完整片引擎（script.json 頂層 stage: "iso" ＋ isoVersion: 2）：同一張桌面演完整支片，鏡頭只平移縮放。
// 桌上固定有螢幕（AI）、鍵盤、新聞紙（原文）、放大鏡（搜尋）、提示機（五格托盤）；重點內容是從桌面飛起來、轉正給觀眾看的白色厚卡片。
// 只用 SVG 與 CSS 2D 矩陣。顏色、厚度、動作幀數讀 THEME_ISO／LAYOUT_ISO；時間全部由 engine 的 at() 從 cue 換算。基本零件沿用 IsoVideo.tsx。
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Script, TimelineV2 } from "../../types";
import { FONT_EN, FONT_ZH, FPS, LAYOUT_ISO as L, THEME_ISO as T } from "../../theme";
import { EASE, pop, springAccent, tween, typeChars } from "../anim";
import { buildIso, type Panel } from "./engine";
import * as K from "./IsoVideo";

const M = T.motion, FAR = 1e9;
const col = (name?: string) => T.color[name ?? "primary"] ?? T.color.primary;
const zh: React.CSSProperties = { fontFamily: FONT_ZH, whiteSpace: "nowrap", lineHeight: 1.16 };
const en: React.CSSProperties = { fontFamily: FONT_EN, whiteSpace: "nowrap", lineHeight: 1 };
const wrap: React.CSSProperties = { fontFamily: FONT_ZH, whiteSpace: "normal", lineHeight: 1.3 };

/** 桌上物件的位置（世界座標；桌面 760×760、頂面 z＝0）。螢幕與鍵盤的位置和試片一樣（K.MON） */
const D = {
  desk: 760,
  tray: { x: 350, y: 170, w: 170, h: 342 }, slot: { x: 360, y: 180, w: 150, h: 58, pitch: 66 },
  news: { x: 530, y: 40, w: 210, h: 150 }, sheet: { x: 560, y: 230, w: 170, h: 120 },
  lens: { x: 610, y: 590 }, plant: { x: 664, y: 430 }, pencil: { x: 150, y: 610 },
} as const;
/** 版面上固定的位置（畫面座標） */
const POS = {
  pin: { x: 676, y: 800, w: 340, h: 196 },
  ask: { x: L.X, y: 950, w: L.INNER_W, h: 274 }, note: { x: 610, y: 600, w: 400, h: 176 },
  ans: { x: L.X, y: 716, w: L.INNER_W, h: 520 },
  wrong: { x: 330, y: 436, w: 420, h: 250, toX: 70, toY: 800, toK: 0.56 }, right: { x: 190, y: 432, w: 700, h: 336 },
  why: { x: L.X, y: 350, w: L.INNER_W, h: 300 },
  pills: { y0: 700, y: 348 }, slot: { x: 150, y: 452, w: 780, h: 302 },
  result: { x: L.X, y: 350, w: L.INNER_W },
  cmp: { x: L.X, y: 350, w: L.INNER_W, h: 330, gap: 76 },
  remind: { x: L.X, y: 350, w: L.INNER_W, h: 300 },
  tpl: { x: L.X, y: 340, w: L.INNER_W, h: 884, k: 0.78 }, ask2: { x: L.X, y: 1052, w: L.INNER_W, h: 180 },
  end: { x: L.X, y: 372, w: L.INNER_W, h: 520 },
} as const;

type Obj = { x: number; y: number; z: number; k: number; o: number };
type Block = { tone: string; x: number; y: number; z: number; k: number; o: number };
type FW = { f: number; cam: K.M6; mode: K.ScreenMode; flash: number; num?: { label: string; value: string; size?: number }; lens: Obj | null; sheet: { o: number; tone: "wrong" | "right" } | null; tray: number; trayO: number; blocks: Block[]; news: Obj; newsB: Obj | null; link: number };

const NewsPaper: React.FC<{ id: string; n: Obj; accent: string; pic: string }> = ({ id, n, accent, pic }) => (
  n.o <= 0 ? null : (
    <g opacity={n.o}>
      <K.Shade x={n.x + 6} y={n.y + 6} w={D.news.w * n.k} h={D.news.h * n.k} a={T.shadowAlpha * (n.z > 20 ? 0.7 : 1)} />
      <g transform={`translate(${K.iso(n.x, n.y, n.z).join(" ")}) scale(${n.k})`}>
        <K.Slab id={id} x={0} y={0} w={D.news.w} h={D.news.h} t={6} r={8} c={T.solid.white}>
          <rect x={14} y={14} width={64} height={24} rx={6} fill={accent} />
          <rect x={14} y={50} width={150} height={16} rx={6} fill={T.ink} />
          {[0, 1, 2].map((i) => <rect key={i} x={14} y={80 + i * 20} width={i === 2 ? 70 : 110} height={9} rx={4.5} fill={T.cardSide} />)}
          <rect x={140} y={78} width={54} height={54} rx={8} fill={pic} />
        </K.Slab>
      </g>
    </g>
  )
);

const World: React.FC<{ st: FW }> = ({ st }) => {
  const S = T.solid, MON = K.MON, tr = D.tray, sl = D.slot, tc = K.iso(tr.x + tr.w / 2, tr.y + tr.h / 2, 0);
  const sh = D.sheet, ln = st.lens;
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <pattern id="isoDots2" width={80} height={80} patternUnits="userSpaceOnUse" patternTransform={K.css(K.mul(st.cam, K.ground(0, 0, -60)))}><circle cx={10} cy={10} r={5} fill={T.dot} /></pattern>
        <clipPath id="ifClip"><rect x={-200} y={L.PROGRESS_TOP + 18} width={L.W + 400} height={L.H} /></clipPath>
      </defs>
      <rect x={0} y={L.HEADER_TOP + 90} width={L.W} height={L.CAP_TOP - L.HEADER_TOP - 90} fill="url(#isoDots2)" />
      <g clipPath="url(#ifClip)"><g transform={K.css(st.cam)}>
        <K.Shade x={50} y={50} w={D.desk} h={D.desk} r={56} z={-110} />
        <K.Slab id="ifDesk" x={0} y={0} w={D.desk} h={D.desk} t={40} r={48} c={S.desk} />
        {/* 螢幕 */}
        <K.Shade x={MON.x} y={MON.y} w={190} h={MON.dy} />
        <K.Slab id="ifBase" x={44} y={250} z={10} w={120} h={120} t={10} r={16} c={S.white} />
        <K.Box x={68} y={296} z={10} dx={14} dy={28} dz={40} c={S.white} />
        <K.Box {...MON} c={S.white} />
        <K.ScreenFace st={st as unknown as K.WorldState} />
        {/* 鍵盤 */}
        <K.Shade x={216} y={206} w={104} h={260} />
        <K.Slab id="ifKb" x={210} y={200} z={12} w={96} h={260} t={12} r={12} c={S.lav}>
          {Array.from({ length: 21 }, (_, i) => <rect key={i} x={10 + (i % 3) * 27} y={12 + Math.floor(i / 3) * 34} width={21} height={26} rx={5} fill={T.card} opacity={0.82} />)}
        </K.Slab>
        {/* 新聞紙（原文） */}
        <NewsPaper id="ifNews" n={st.news} accent={T.color.wrong.fill} pic={S.mint.top} />
        {/* 提示機：五格托盤，一條線接到螢幕 */}
        {st.tray > 0 && st.trayO > 0 ? (
          <g opacity={st.trayO} transform={`translate(${tc[0]} ${tc[1]}) scale(${st.tray.toFixed(4)}) translate(${-tc[0]} ${-tc[1]})`}>
            <polyline points={[[tr.x, tr.y + tr.h / 2], [320, tr.y + tr.h / 2], [320, 330], [100, 330]].map(([a, b]) => K.iso(a, b, 1).join(",")).join(" ")} fill="none" stroke={T.color.primary.fill} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 14" />
            <K.Shade x={tr.x + 8} y={tr.y + 8} w={tr.w} h={tr.h} />
            <K.Slab id="ifTray" x={tr.x} y={tr.y} z={10} w={tr.w} h={tr.h} t={10} r={14} c={S.white}>
              {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={sl.x - tr.x} y={sl.y - tr.y + i * sl.pitch} width={sl.w} height={sl.h} rx={8} fill={T.line} />)}
            </K.Slab>
          </g>
        ) : null}
        {st.blocks.map((b, i) => b.o > 0 ? (
          <g key={i} opacity={b.o} transform={`translate(${K.iso(b.x, b.y, b.z).join(" ")}) scale(${b.k.toFixed(4)})`}>
            <K.Slab id={`ifBlk${i}`} x={0} y={0} w={sl.w} h={sl.h} t={12} r={8} c={S[b.tone] ?? S.lav}>
              <rect x={12} y={15} width={28} height={28} rx={8} fill={T.card} opacity={0.9} />
              <rect x={52} y={22} width={i % 2 ? 62 : 82} height={14} rx={7} fill={T.card} opacity={0.75} />
            </K.Slab>
          </g>
        ) : null)}
        {/* 鉛筆 */}
        <K.Shade x={D.pencil.x + 6} y={D.pencil.y + 8} w={150} h={18} r={6} />
        <K.Box x={D.pencil.x} y={D.pencil.y} dx={150} dy={14} dz={12} c={S.coral} />
        {/* 落回桌上的回答紙 */}
        {st.sheet && st.sheet.o > 0 ? (
          <g opacity={st.sheet.o}>
            <K.Slab id="ifSheet" x={sh.x} y={sh.y} z={5} w={sh.w} h={sh.h} t={5} r={8} c={S.white}>{[110, 130, 90].map((w, i) => <rect key={i} x={18} y={22 + i * 28} width={w} height={12} rx={6} fill={i === 0 ? T.color[st.sheet!.tone].fill : T.cardSide} />)}</K.Slab>
          </g>
        ) : null}
        {/* 「對原文」的虛線：回答紙 ↔ 新聞紙 */}
        {st.link > 0 ? <line x1={K.iso(sh.x + sh.w / 2, sh.y, 8)[0]} y1={K.iso(sh.x + sh.w / 2, sh.y, 8)[1]} x2={K.iso(sh.x + sh.w / 2, sh.y - (sh.y - D.news.y - D.news.h) * st.link, 8)[0]} y2={K.iso(sh.x + sh.w / 2, sh.y - (sh.y - D.news.y - D.news.h) * st.link, 8)[1]} stroke={T.color.primary.fill} strokeWidth={8} strokeDasharray="3 15" strokeLinecap="round" /> : null}
        {st.newsB ? <NewsPaper id="ifNewsB" n={st.newsB} accent={T.color.primary.fill} pic={S.yellow.top} /> : null}
        {/* 盆栽 */}
        <K.Shade x={D.plant.x} y={D.plant.y} w={86} h={56} />
        <K.Box x={D.plant.x} y={D.plant.y} dx={56} dy={56} dz={50} c={S.mint} />
        {[[-16, -64, -24], [14, -70, 16], [0, -92, 0]].map(([dx, dy, rot], i) => { const [px, py] = K.iso(D.plant.x + 28, D.plant.y + 28, 50); return <ellipse key={i} cx={px + dx} cy={py + dy + 30} rx={15} ry={34} transform={`rotate(${rot} ${px + dx} ${py + dy + 30})`} fill={i === 2 ? S.mint.l : S.mint.r} />; })}
        {/* 放大鏡（搜尋） */}
        {ln && ln.o > 0 ? (
          <g opacity={ln.o}>
            {ln.z > 14 ? <g transform={K.css(K.ground(ln.x, ln.y, 1))}><circle r={46} fill={T.floor} opacity={T.shadowAlpha} /></g> : null}
            {[0, 10].map((z) => (
              <g key={z} transform={K.css(K.ground(ln.x, ln.y, ln.z + z))}>
                <line x1={34} y1={34} x2={92} y2={92} stroke={z ? S.lav.l : S.lav.r} strokeWidth={18} strokeLinecap="round" />
                <circle r={44} fill={z ? T.card : S.lav.r} fillOpacity={z ? 0.7 : 1} stroke={z ? S.lav.top : S.lav.r} strokeWidth={14} />
              </g>
            ))}
          </g>
        ) : null}
      </g></g>
    </svg>
  );
};

/** 蓋章樣式的字（白底＋色框） */
const Stamp: React.FC<{ text: string; color: string; px?: number }> = ({ text, color, px = 46 }) => {
  const c = col(color);
  return <div style={{ ...zh, display: "inline-block", fontWeight: T.weight.title, fontSize: px, color: c.text, background: T.card, border: `6px solid ${c.fill}`, borderRadius: 16, padding: "8px 22px", boxShadow: T.depth.soft }}>{text}</div>;
};
const Cross: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 48 48"><path d="M13 13 L35 35 M35 13 L13 35" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" /></svg>
);
/** 卡片上的字：念到哪個詞，那個詞抹上螢光底（marks 依出現順序寫） */
const hilite = (text: string, marks: { text: string; at: unknown }[], at: (a: unknown) => number, f: number, bg: string, fg: string): React.ReactNode => {
  const outN: React.ReactNode[] = [];
  let rest = text;
  marks.forEach((mk, i) => { const k = rest.indexOf(mk.text); if (k < 0) return; outN.push(rest.slice(0, k), <K.Mark key={i} f={f} at={at(mk.at)} bg={bg} fg={fg}>{mk.text}</K.Mark>); rest = rest.slice(k + mk.text.length); });
  return <>{outN}{rest}</>;
};
const hop = (f: number, at: number, h = 46, dur = 12) => (f < at || f > at + dur ? 0 : h * Math.sin((Math.PI * (f - at)) / dur));
/** 卡片表頭：左邊色籤、右邊小字（實測標示） */
const Head: React.FC<{ label: string; color?: string; by?: string; solid?: boolean }> = ({ label, color, by, solid = true }) => {
  const c = col(color);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
      <K.Chip text={label} bg={solid ? c.fill : c.soft} fg={solid ? c.on : c.text} px={30} />
      {by ? <div style={{ ...zh, fontWeight: T.weight.body, fontSize: L.MIN_PX, color: T.ink3 }}>{by}</div> : null}
    </div>
  );
};

type Row = { t: string; head?: boolean; color?: string; at: number; mark?: { text: string; color?: string; at: number; box?: boolean; under?: boolean }; check?: number; focus?: number };

const Stage: React.FC<{ panels: Panel[]; f: number; channel?: { name?: string; tag?: string; slogan?: string } }> = ({ panels, f, channel }) => {
  const keys = useMemo(() => K.camKeys(panels), [panels]);
  const cam = K.camAt(keys, f);
  const one = (k: string) => panels.find((x) => x.kind === k);
  const hk = one("hook"), ak = one("ask"), an = one("answer"), bp = one("bump"), wy = one("why"), tt = one("title"), slots = panels.filter((x) => x.kind === "slot");
  const results = panels.filter((x) => x.kind === "result"), cm = one("compare"), rm = one("remind"), tp = one("template"), qs = one("question"), nx = one("next"), ed = one("end");
  const scrCard = (w: number) => K.mul(cam, K.mul(K.SCR, K.at2(0, 40, K.SCR_W / w)));
  const w2s = (x: number, y: number, z = 0) => K.ap(cam, K.iso(x, y, z));
  const sheetM = (w: number) => K.mul(cam, K.mul(K.ground(D.sheet.x, D.sheet.y, 12), K.at2(0, 0, D.sheet.w / w)));

  // ── 各段的關鍵時刻（全部從 cue 來） ──
  const askIn = ak?.in ?? FAR, tSend = ak ? ak.at(ak.p.sendAt, FAR) : FAR, arrive = tSend + M.fly;
  const ansIn = an?.in ?? FAR, tOut = an ? an.at(an.p.outAt, ansIn) : FAR, settled = tOut + M.fly;
  const bpIn = bp?.in ?? FAR, tDrop = bp ? bp.at(bp.p.right?.at, bpIn + 30) : FAR, land = tDrop + 8;
  const wyIn = wy?.in ?? FAR, ttIn = tt?.in ?? FAR, tTray = tt ? tt.at(tt.p.trayAt, ttIn + 10) : FAR;
  const rs = results[0], tGo = rs ? rs.at(rs.p.sendAt, rs.in) : FAR;
  // 「這樣問」的欄位：依序出現在正面的大卡上，下一個要出現前飛進托盤的格子
  const items = slots.flatMap((x) => ((x.p.items ?? []) as any[]).map((it) => ({ x, it, tIn: x.at(it.at, x.in) })));
  const fields = items.map((q, i) => { const tFly = Math.min(items[i + 1] ? items[i + 1].tIn - M.fly - 2 : FAR, tGo - M.fly - 4); return { ...q, i, tFly, tLand: tFly + M.fly }; });
  const nB = fields.length, tArr2 = tGo + (nB - 1) * 3 + M.fly;
  const group = (r: Panel) => { const i = panels.indexOf(r), g = [r]; for (let k = i + 1; panels[k]?.kind === "add"; k++) g.push(panels[k]); return g; };
  const resT = results.map((r) => { const g = group(r), end = g[g.length - 1].out; return { r, g, out: Math.max(r.at(r.p.outAt, r.in + 6), r === rs ? tArr2 + 2 : 0), end }; });
  const cmIn = cm?.in ?? FAR, rmIn = rm?.in ?? FAR, tpIn = tp?.in ?? FAR, qsIn = qs?.in ?? FAR, nxIn = nx?.in ?? FAR, edIn = ed?.in ?? FAR;
  const tLens2 = rm ? rm.at(rm.p.lensAt, rmIn + 8) : FAR;

  // ── 世界狀態 ──
  const modes: [number, K.ScreenMode, boolean][] = [[0, "num", false], [askIn + 4, "idle", false], [arrive, "think", true], [tOut, "done", true], [ttIn, "idle", false], [tArr2, "think", true], ...resT.map((x): [number, K.ScreenMode, boolean] => [x.out, "done", true]), [nxIn, "idle", false], [edIn + 8, "ok", true]];
  const cur = modes.filter((m) => m[0] < FAR && f >= m[0]).sort((a, b) => a[0] - b[0]).pop() ?? modes[0];
  const flash = cur[2] ? 0.85 * (1 - tween(f, cur[0], 10, EASE.enter)) : 0;
  const lensRide = an ? an.at(an.p.lens?.at, FAR) : FAR;
  let lens: Obj | null = { x: D.lens.x, y: D.lens.y, z: 0, k: 1, o: 1 };
  if (f >= lensRide && f < wyIn) lens = null;
  else if (f >= wyIn && wy) { const d = tween(f, wyIn + 2, 8, EASE.exit); lens.z = 220 * (1 - d) + hop(f, wy.at(wy.p.items?.[0]?.at, FAR)); lens.o = tween(f, wyIn + 2, 3); }
  if (rm && f >= tLens2) {
    const a = tween(f, tLens2, M.cam, EASE.move) * (1 - tween(f, tpIn, M.fly, EASE.move)), tx = D.news.x + 150, ty = D.news.y + 80;
    lens = { x: D.lens.x + (tx - D.lens.x) * a, y: D.lens.y + (ty - D.lens.y) * a, z: 70 * a + 60 * Math.sin(Math.PI * Math.min(1, a)) * (a < 1 ? 1 : 0), k: 1, o: 1 };
  }
  const newsHop = hop(f, wy ? wy.at(wy.p.items?.[1]?.at, FAR) : FAR) + hop(f, fields[0]?.tIn ?? FAR) + hop(f, rm ? rm.at(rm.p.pulseAt, FAR) : FAR, 30);
  const duel = nx ? tween(f, nx.at(nx.p.splitAt, nxIn + 20), 10, EASE.move) : 0;
  const news: Obj = { x: D.news.x - 30 * duel, y: D.news.y, z: 6 + newsHop + 46 * duel, k: 1, o: 1 };
  const bIn = nx ? nxIn + 6 : FAR;
  const newsB: Obj | null = nx && f >= bIn ? { x: D.news.x - 30 + 30 * duel, y: D.news.y + 190 + 40 * duel, z: 6 + 46 * duel + 200 * (1 - tween(f, bIn, 8, EASE.exit)), k: 1, o: tween(f, bIn, 3) } : null;
  const resSheet = resT.find((x) => x.r.p.exit === "sheet");
  const sheet: FW["sheet"] = f >= bpIn + M.fly - 2 && f < ttIn + 6 ? { o: 1 - tween(f, ttIn, 6), tone: "wrong" } : resSheet && f >= resSheet.end + M.fly - 2 && f < nxIn + 6 ? { o: 1 - tween(f, nxIn, 6), tone: "right" } : null;
  const scrPos = { x: K.MON.x + K.MON.dx + 6, y: K.MON.y + K.MON.dy / 2 - D.slot.h / 4, z: K.MON.z + 120 };
  const blocks: Block[] = fields.map((q) => {
    const sx = D.slot.x, sy = D.slot.y + q.i * D.slot.pitch, g = tween(f, tGo + q.i * 3, M.fly, EASE.move);
    return { tone: q.it.tone ?? "lav", x: sx + (scrPos.x - sx) * g, y: sy + (scrPos.y - sy) * g, z: 22 + (scrPos.z - 22) * g + 110 * Math.sin(Math.PI * g) + 40 * (1 - tween(f, q.tLand - 2, 5, EASE.exit)), k: 1 - 0.5 * g, o: f >= q.tLand - 2 ? 1 - tween(f, tGo + q.i * 3 + M.fly - 3, 3) : 0 };
  });
  const link = rm ? tween(f, rm.at(rm.p.linkAt, rmIn + 14), 12, EASE.move) * (1 - tween(f, tpIn, 6)) : 0;
  const st: FW = { f, cam, mode: cur[1], flash, num: hk?.p.screen, lens, sheet, tray: f >= tTray ? pop(f, tTray, 0.5) : 0, trayO: 1 - tween(f, tArr2 + 4, 8), blocks, news, newsB, link };

  const out: React.ReactNode[] = [];
  // ── s01 鉤子：大字主張＋螢幕上的錯數字＋今年的數字卡 ──
  if (hk && f < askIn + M.exit) {
    const p = hk.p, e = tween(f, askIn, M.exit, EASE.exit), o = 1 - e, up = -70 * e, size = p.size ?? 128;
    out.push(
      <div key="hk-title" style={{ position: "absolute", left: L.X, top: L.MAIN_TOP + 6, width: L.INNER_W, opacity: o, transform: `translateY(${up}px)` }}>
        <K.Chip text={p.kicker} bg={T.card} fg={T.ink2} side={T.cardSide} />
        <div style={{ marginTop: 22 }}>{(p.title as string[]).map((t, i) => <div key={i} style={{ ...zh, fontWeight: T.weight.title, fontSize: size, color: T.ink, letterSpacing: "-0.01em" }}>{K.marked(t, p.mark?.text, f, hk.at(p.mark?.at, 0), col(p.mark?.color).soft, col(p.mark?.color).text)}</div>)}</div>
      </div>,
    );
    if (p.stamp) {
      const [sx, sy] = w2s(K.MON.x + K.MON.dx, K.MON.y + 150, K.MON.z + 70);
      out.push(<div key="hk-stamp" style={{ position: "absolute", left: sx + 10, top: sy + 64, opacity: o }}><div style={K.slam(f, hk.at(p.stamp.at, 10), -7)}><Stamp text={p.stamp.text} color="wrong" /></div></div>);
    }
    if (p.pin) {
      const c = col("right"), q = POS.pin, bAt = hk.at(p.pin.bumpAt, FAR), k = f >= bAt ? pop(f, bAt, 0.9) : 1;
      out.push(
        <K.Bb key="hk-pin" m={K.popM(q.x, q.y + up, q.w, q.h, k)} w={q.w} h={q.h} o={o}>
          <div style={{ ...K.face(c.fill, c.side, T.depth.tile, T.radius.tile), padding: "22px 30px" }}>
            <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 34, color: c.on }}>{p.pin.label}</div>
            <div style={{ ...en, fontWeight: T.weight.title, fontSize: p.pin.size ?? 92, color: c.on, marginTop: 12 }}>{p.pin.value}</div>
          </div>
          {p.pin.tag ? <div style={{ position: "absolute", right: -6, top: q.h + 30, ...K.bounce(f, hk.at(p.pin.tagAt, FAR), -3), transformOrigin: "100% 0" }}><K.Chip text={p.pin.tag} bg={T.card} fg={c.text} px={32} side={T.cardSide} /></div> : null}
        </K.Bb>,
      );
    }
  }
  // ── s02 只打一句話：提示卡打字 → 沿虛線飛進螢幕 ──
  if (ak && f >= askIn && f < Math.max(arrive, ansIn) + M.exit) {
    const p = ak.p, q = POS.ask, c = col("primary"), t = tween(f, tSend, M.fly, EASE.move);
    const lines = p.lines as string[], total = lines.join("").length, shown = typeChars(f, ak.at(p.typeAt, askIn), total, M.step);
    const ent = springAccent(f, askIn + 3), home = K.at2(q.x, q.y + Math.round((1 - ent) * 160));
    let used = 0;
    out.push(
      <K.Bb key="ak-card" m={K.fly(home, scrCard(q.w), t)} w={q.w} h={q.h} o={tween(f, askIn + 3, 5) * (1 - tween(f, arrive - 3, 3))}>
        <div style={{ ...K.face(), padding: "26px 40px" }}>
          <K.Chip text={p.label} bg={c.soft} fg={c.text} px={30} />
          <div style={{ marginTop: 14 }}>{lines.map((ln, i) => { const n = Math.max(0, Math.min(ln.length, shown - used)); used += ln.length; const caret = shown < total ? (n > 0 && n < ln.length) || (n === ln.length && shown === used) : false; return <div key={i} style={{ ...zh, fontWeight: T.weight.title, fontSize: p.size ?? 68, color: T.ink, height: Math.round((p.size ?? 68) * 1.2) }}>{ln.slice(0, n)}{caret || (i === lines.length - 1 && shown >= total && Math.floor(f / 8) % 2 === 0 && t === 0) ? <span style={{ display: "inline-block", width: 8, height: "0.9em", background: c.fill, marginLeft: 6, verticalAlign: "-0.08em", borderRadius: 4 }} /> : null}</div>; })}</div>
        </div>
      </K.Bb>,
    );
    if (t > 0 && f < arrive + 6) {
      const pts = Array.from({ length: Math.max(2, Math.round(t * 18)) }).map((_, i, a) => K.ap(K.fly(home, scrCard(q.w), (t * i) / (a.length - 1)), [q.w / 2, q.h / 2]).map((v) => v.toFixed(1)).join(",")).join(" ");
      out.push(<svg key="ak-trail" width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0, opacity: 1 - tween(f, arrive, 6) }}><polyline points={pts} fill="none" stroke={c.fill} strokeWidth={7} strokeDasharray="5 18" strokeLinecap="round" /></svg>);
    }
    const ex = 1 - tween(f, Math.max(ansIn, arrive), M.exit, EASE.exit);
    if (p.tag) out.push(<div key="ak-tag" style={{ position: "absolute", left: L.X, top: L.MAIN_TOP + 8, opacity: ex }}><div style={{ ...K.bounce(f, ak.at(p.tag.at, askIn)), transformOrigin: "0 50%" }}><K.Chip text={p.tag.text} bg={T.card} fg={T.ink2} px={30} side={T.cardSide} /></div></div>);
    if (p.note) {
      const nq = POS.note, nc = col("note");
      out.push(
        <div key="ak-note" style={{ position: "absolute", left: nq.x, top: nq.y, width: nq.w, height: nq.h, opacity: ex }}>
          <div style={{ width: "100%", height: "100%", ...K.bounce(f, ak.at(p.note.at, askIn), 3) }}>
            <div style={{ ...K.face(nc.fill, nc.side, T.depth.card, 18), padding: "22px 28px" }}>
              <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 60, color: nc.on }}>{p.note.text}</div>
              <div style={{ ...zh, fontWeight: T.weight.body, fontSize: 30, color: nc.text, marginTop: 12 }}>{p.note.sub}</div>
            </div>
          </div>
        </div>,
      );
    }
  }
  // ── s03 螢幕吐出回答卡（實測節錄）→ 後面還有一大疊 → 放大鏡找到錯的數字 ──
  if (an && f >= tOut && f < bpIn + M.fly) {
    const p = an.p, q = POS.ans, c = col("primary"), w = col("wrong");
    const t = tween(f, tOut, M.fly, EASE.move), b = tween(f, bpIn, M.fly, EASE.move);
    const m = b > 0 ? K.fly(K.at2(q.x, q.y), sheetM(q.w), b, 40) : K.fly(scrCard(q.w), K.at2(q.x, q.y), t);
    const tStack = Math.max(an.at(p.stackAt, settled), settled), tLens = an.at(p.lens?.at, FAR), target = p.lens?.text as string | undefined;
    let first = true;
    const line = (ln: string, key: number) => {
      const segs = target ? ln.split(target) : [ln];
      return (
        <div key={key} style={{ ...wrap, fontWeight: T.weight.body, fontSize: 40, lineHeight: 1.5, color: T.ink, marginTop: key ? 14 : 0 }}>
          {segs.map((s, i) => {
            const host = i > 0 && first; if (i > 0) first = false;
            return (
              <React.Fragment key={i}>
                {i > 0 ? <K.Mark f={f} at={tLens} bg={w.soft} fg={w.text} style={{ position: "relative", fontWeight: T.weight.title, whiteSpace: "nowrap" }}>{target}{host ? <K.Lens f={f} at={tLens} text={target as string} /> : null}</K.Mark> : null}
                {s}
              </React.Fragment>
            );
          })}
        </div>
      );
    };
    if (b === 0) [1, 0].forEach((i) => { const s = tween(f, tStack + i * M.stagger, 8); if (s > 0) out.push(<div key={`an-st${i}`} style={{ position: "absolute", left: q.x + 22 * (i + 1), top: q.y + Math.round(17 * (i + 1) * s), width: q.w - 44 * (i + 1), height: q.h, borderRadius: T.radius.card, background: T.card, boxShadow: `0 ${T.depth.card}px 0 ${T.cardSide}`, opacity: s }} />); });
    out.push(
      <K.Bb key="an-card" m={m} w={q.w} h={q.h} o={tween(f, tOut, 3) * (1 - tween(f, bpIn + M.fly - 4, 4))}>
        <div style={{ ...K.face(), padding: "30px 40px" }}>
          <div style={{ marginBottom: 18 }}><Head label={p.label} by={p.by} /></div>
          {(p.lines as string[]).map(line)}
          {p.more ? <div style={{ ...zh, fontWeight: T.weight.body, fontSize: L.MIN_PX, color: T.ink3, marginTop: 14, opacity: tween(f, tStack, 6) }}>{p.more}</div> : null}
        </div>
      </K.Bb>,
    );
    void c;
  }
  // ── s04 錯的數字被彈開、對的蓋章 ──
  if (bp && f >= bpIn && f < wyIn + M.exit) {
    const p = bp.p, wq = POS.wrong, rq = POS.right, wc = col("wrong"), rc = col("right");
    const e = tween(f, wyIn, M.exit, EASE.exit), o = 1 - e, up = -80 * e;
    const a = tween(f, bpIn + 2, 10, EASE.move), k = tween(f, land, 16, EASE.enter), tStamp = bp.at(p.wrong.stampAt, bpIn + 10);
    const wk = (0.3 + 0.7 * a) * (1 + (wq.toK - 1) * k);
    const wx = 640 + (wq.x - 640) * a + (wq.toX - wq.x) * k, wyy = 860 + (wq.y - 860) * a + (wq.toY - wq.y) * k - 150 * Math.sin(Math.PI * k) + up;
    out.push(
      <K.Bb key="bp-wrong" m={K.at2(wx, wyy, wk)} w={wq.w} h={wq.h} o={tween(f, bpIn + 2, 3) * o}>
        <div style={{ width: "100%", height: "100%", transform: `rotate(${(-14 * k).toFixed(2)}deg)` }}>
          <div style={{ ...K.face(wc.soft, wc.fill, T.depth.tile, T.radius.tile), padding: "22px 34px" }}>
            <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 34, color: wc.text }}>{p.wrong.label}</div>
            <div style={{ position: "relative", display: "inline-block", ...en, fontWeight: T.weight.title, fontSize: p.wrong.size ?? 124, color: wc.text, marginTop: 10 }}>{p.wrong.value}<K.Strike f={f} at={tStamp} color={T.ink} /></div>
          </div>
          <div style={{ position: "absolute", right: -70, bottom: -34, ...K.slam(f, tStamp + 3, -6), transformOrigin: "50% 50%" }}><Stamp text={p.wrong.stamp} color="wrong" px={50} /></div>
        </div>
      </K.Bb>,
    );
    if (f >= tDrop) {
      const d = tween(f, tDrop, 8, EASE.exit), sq = f < land ? 1 : 0.9 + 0.1 * springAccent(f, land);
      const y = -500 + (rq.y + 500) * d + up, tSeal = bp.at(p.right.sealAt, land + 10);
      out.push(
        <K.Bb key="bp-right" m={[1, 0, 0, sq, rq.x, y + rq.h * (1 - sq)]} w={rq.w} h={rq.h} o={o}>
          <div style={{ ...K.face(rc.fill, rc.side, T.depth.tile, T.radius.tile), padding: "30px 44px" }}>
            <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 40, color: rc.on }}>{p.right.label}</div>
            <div style={{ ...en, fontWeight: T.weight.title, fontSize: p.right.size ?? 190, color: rc.on, marginTop: 14 }}>{p.right.value}</div>
          </div>
          {p.right.seal ? (
            <div style={{ position: "absolute", right: -34, top: -70, width: 196, height: 196, ...K.slam(f, tSeal, 12, 2.6) }}>
              <div style={{ width: "100%", height: "100%", boxSizing: "border-box", borderRadius: "50%", background: T.card, border: `8px solid ${rc.fill}`, outline: `4px solid ${T.card}`, boxShadow: T.depth.soft, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                <K.Check size={74} color={rc.fill} />
                <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 32, color: rc.text }}>{p.right.seal}</div>
              </div>
            </div>
          ) : null}
        </K.Bb>,
      );
      if (p.right.sub) out.push(<div key="bp-sub" style={{ position: "absolute", left: L.X, width: L.INNER_W, top: rq.y + rq.h + 40 + up, textAlign: "center", opacity: o }}><div style={{ display: "inline-block", ...K.bounce(f, land + 8) }}><K.Chip text={p.right.sub} bg={T.card} fg={T.ink2} px={30} side={T.cardSide} /></div></div>);
    }
  }
  // ── s05 為什麼：再問一次還是舊的；桌上的放大鏡（搜尋）和新聞紙（原文）都沒用到 ──
  if (wy && f >= wyIn && f < ttIn + M.exit) {
    const p = wy.p, q = POS.why, w = col("wrong"), e = tween(f, ttIn, M.exit, EASE.exit), o = 1 - e;
    const t = tween(f, wyIn + 2, M.fly, EASE.move), tMark = wy.at(p.mark?.at, wyIn + M.fly + 6), tTag = wy.at(p.tagAt, tMark + 6);
    const i0 = p.mark?.text ? String(p.line).indexOf(p.mark.text) : -1;
    out.push(
      <K.Bb key="wy-card" m={K.fly(scrCard(q.w), K.at2(q.x, q.y - 70 * e), t)} w={q.w} h={q.h} o={tween(f, wyIn + 2, 3) * o}>
        <div style={{ ...K.face(), padding: "28px 40px" }}>
          <Head label={p.label} by={p.by} />
          <div style={{ ...wrap, fontWeight: T.weight.body, fontSize: 40, lineHeight: 1.5, color: T.ink, marginTop: 14 }}>
            {i0 < 0 ? p.line : <>{String(p.line).slice(0, i0)}<K.Mark f={f} at={tMark} bg={w.soft} fg={w.text} style={{ fontWeight: T.weight.title, whiteSpace: "nowrap" }}>{p.mark.text}</K.Mark>{String(p.line).slice(i0 + p.mark.text.length)}</>}
          </div>
        </div>
        {p.tag ? <div style={{ position: "absolute", right: 24, bottom: -40, ...K.slam(f, tTag, -4), transformOrigin: "50% 50%" }}><Stamp text={p.tag} color="wrong" px={44} /></div> : null}
      </K.Bb>,
    );
    const spots = [[D.lens.x, D.lens.y, 60, -150], [D.news.x + 105, D.news.y + 75, 40, -130]];
    ((p.items ?? []) as any[]).slice(0, 2).forEach((it, i) => {
      const c = col(it.color ?? "note"), [sx, sy] = w2s(spots[i][0], spots[i][1], spots[i][2]), tI = wy.at(it.at, wyIn + 20);
      out.push(
        <div key={`wy-it${i}`} style={{ position: "absolute", left: Math.max(L.X + 170, Math.min(L.W - L.X - 170, sx)), top: sy + spots[i][3], opacity: o }}>
          <div style={{ transform: "translateX(-50%)" }}><div style={K.bounce(f, tI)}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.card, borderRadius: 24, padding: "14px 26px 14px 16px", boxShadow: `0 8px 0 ${c.fill}, ${T.depth.soft}` }}>
              <div style={{ width: 50, height: 50, borderRadius: 16, background: c.soft, display: "flex", alignItems: "center", justifyContent: "center" }}><Cross size={36} color={c.text} /></div>
              <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 46, color: T.ink }}>{it.label}</div>
            </div>
          </div></div>
        </div>,
      );
    });
    if (p.foot) out.push(<div key="wy-foot" style={{ position: "absolute", left: L.X, width: L.INNER_W, top: L.MAIN_BOTTOM - 62, textAlign: "center", opacity: o * tween(f, wyIn + 14, 6) }}><K.Chip text={p.foot} bg={T.card} fg={T.ink2} px={L.MIN_PX} side={T.cardSide} /></div>);
  }
  // ── s06／s19 大字標題（換個問法／下一集） ──
  for (const x of [tt, nx]) {
    if (!x || f < x.in || f >= x.out + M.exit) continue;
    const p = x.p, c = col(p.color), a0 = x.in + 7, e = tween(f, x.out, M.exit, EASE.exit);
    out.push(
      <div key={`tt-${x.sid}`} style={{ position: "absolute", left: L.X, top: L.MAIN_TOP + 6, width: L.INNER_W, opacity: 1 - e }}>
        <div style={{ transform: `translateY(${-70 * e}px)` }}><div style={K.riseIn(f, a0)}>
          <K.Chip text={p.kicker} bg={c.fill} fg={c.on} px={40} side={c.side} />
          <div style={{ marginTop: 16 }}>{([] as string[]).concat(p.title).map((t, i) => <div key={i} style={{ ...zh, fontWeight: T.weight.title, fontSize: p.size ?? 176, color: T.ink, letterSpacing: "-0.01em" }}>{K.marked(t, p.mark?.text, f, x.at(p.mark?.at, a0), c.soft, c.text)}</div>)}</div>
          {p.old ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, opacity: tween(f, a0 + 6, 6) }}>
              <span style={{ ...zh, fontWeight: T.weight.body, fontSize: 30, color: T.ink3 }}>{p.old.label}</span>
              <span style={{ position: "relative", ...zh, fontWeight: T.weight.strong, fontSize: 44, color: T.ink2 }}>{p.old.text}<K.Strike f={f} at={x.at(p.old.strikeAt, a0)} color={col("wrong").fill} h={8} /></span>
            </div>
          ) : null}
        </div></div>
      </div>,
    );
  }
  // ── s06–s10「這樣問」：上面一排五個欄位名，念到哪個亮哪個；欄位的字在正面大卡上，講完飛進桌上的托盤 ──
  if (tt && fields.length && f >= tTray && f < tArr2 + M.exit) {
    const labels = (tt.p.pills ?? fields.map((q) => q.it.label)) as string[], t0 = fields[0].tIn;
    const y = POS.pills.y0 + (POS.pills.y - POS.pills.y0) * tween(f, t0 - 8, M.cam, EASE.move), o = 1 - tween(f, tArr2, M.exit);
    out.push(
      <div key="sl-pills" style={{ position: "absolute", left: L.X, width: L.INNER_W, top: y, display: "flex", justifyContent: "space-between", opacity: o }}>
        {labels.map((t, i) => {
          const q = fields[i], c = col(q?.it.color), on = q ? tween(f, q.tIn, 5) : 0, k = q && f >= q.tIn ? pop(f, q.tIn, 0.8) : 1;
          return (
            <div key={i} style={{ ...K.bounce(f, tTray + 4 + i * 3) }}>
              <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 30, padding: "12px 15px", borderRadius: 18, transform: `scale(${k.toFixed(3)})`, color: on > 0.5 ? c.on : T.ink3, background: on > 0.5 ? c.fill : T.card, boxShadow: `0 6px 0 ${on > 0.5 ? c.side : T.cardSide}` }}>{i + 1} {t}</div>
            </div>
          );
        })}
      </div>,
    );
    for (const q of fields) {
      if (f < q.tIn || f >= q.tLand) continue;
      const c = col(q.it.color), sq = POS.slot, t = tween(f, q.tFly, M.fly, EASE.move), ent = pop(f, q.tIn, 0.7);
      const home = K.popM(sq.x, sq.y, sq.w, sq.h, ent), dst = K.mul(cam, K.mul(K.ground(D.slot.x, D.slot.y + q.i * D.slot.pitch, 40), K.at2(0, 0, D.slot.w / sq.w)));
      out.push(
        <K.Bb key={`sl-card${q.i}`} m={K.fly(home, dst, t, 60)} w={sq.w} h={sq.h} o={tween(f, q.tIn, 3) * (1 - tween(f, q.tLand - 3, 3))}>
          <div style={{ ...K.face(T.card, c.fill, T.depth.tile), padding: "26px 36px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 58, height: 58, borderRadius: 18, background: c.fill, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: T.weight.title, fontSize: 36, color: c.on }}>{q.i + 1}</div>
              <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 46, color: c.text }}>{q.it.label}</div>
            </div>
            {q.it.text ? <div style={{ ...wrap, fontWeight: T.weight.strong, fontSize: q.it.px ?? 56, color: T.ink, marginTop: 16 }}>{hilite(q.it.text, (q.it.marks ?? []) as any[], (a) => q.x.at(a, FAR), f, c.soft, c.text)}</div> : null}
            {q.it.parts ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
                {(q.it.parts as any[]).map((pt, j) => { const pc = col(pt.color ?? q.it.color); return <div key={j} style={K.bounce(f, q.x.at(pt.at, q.tIn))}><K.Chip text={pt.t} bg={pc.soft} fg={pc.text} px={34} /></div>; })}
              </div>
            ) : null}
          </div>
        </K.Bb>,
      );
    }
  }
  // ── s11–s13、s15 回答卡：從螢幕飛出來，一段一段往下長 ──
  resT.forEach(({ r, g, out: tO, end }, ri) => {
    const sheetExit = r.p.exit === "sheet";
    if (f < tO || f >= end + (sheetExit ? M.fly : M.exit)) return;
    const p = r.p, q = POS.result, t = tween(f, tO, M.fly, EASE.move), e = sheetExit ? 0 : tween(f, end, M.exit, EASE.exit), b = sheetExit ? tween(f, end, M.fly, EASE.move) : 0;
    const rows: Row[] = g.flatMap((x, gi) => ((x.p.rows ?? []) as any[]).map((row, i) => ({ t: row.t, head: row.head, color: row.color, at: x.at(row.at, gi === 0 ? tO + M.fly - 6 + i * M.stagger : x.in), mark: row.mark ? { ...row.mark, at: x.at(row.mark.at, FAR) } : undefined, check: row.checkAt ? x.at(row.checkAt, FAR) : undefined, focus: row.focusAt ? x.at(row.focusAt, FAR) : undefined })));
    const hs = rows.map((row) => (row.head ? 76 : 66) * tween(f, row.at, 8, EASE.enter)), H = 30 + 56 + 14 + hs.reduce((a, v) => a + v, 0) + 30;
    const home = K.at2(q.x, q.y - 70 * e), m = b > 0 ? K.fly(home, sheetM(q.w), b, 40) : K.fly(scrCard(q.w), home, t);
    out.push(
      <K.Bb key={`rs-${ri}`} m={m} w={q.w} h={H} o={tween(f, tO, 3) * (1 - e) * (1 - tween(f, end + M.fly - 4, 4) * (sheetExit ? 1 : 0))}>
        <div style={{ ...K.face(), padding: "30px 40px" }}>
          <div style={{ marginBottom: 14 }}><Head label={p.label} color={p.color} by={p.by} /></div>
          {rows.map((row, i) => {
            const s = tween(f, row.at, 8, EASE.enter), c = col(row.color), mk = row.mark, mc = col(mk?.color), i0 = mk ? row.t.indexOf(mk.text) : -1, fo = row.focus !== undefined ? tween(f, row.focus, M.mark, EASE.move) : 0;
            if (s <= 0) return null;
            return (
              <div key={i} style={{ position: "relative", height: hs[i], opacity: s, display: "flex", alignItems: "center" }}>
                {row.head ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ width: 16, height: 40, borderRadius: 8, background: c.fill }} /><div style={{ ...zh, fontWeight: T.weight.title, fontSize: 42, color: c.text }}>{row.t}</div></div>
                ) : (
                  <div style={{ ...zh, fontWeight: T.weight.body, fontSize: 40, color: T.ink, backgroundImage: `linear-gradient(${col("note").soft},${col("note").soft})`, backgroundRepeat: "no-repeat", backgroundSize: `${(100 * fo).toFixed(1)}% 100%`, borderRadius: T.radius.mark, padding: "4px 6px", marginLeft: -6 }}>
                    {i0 < 0 || !mk ? row.t : <>{row.t.slice(0, i0)}<K.Mark f={f} at={mk.at} bg={mc.soft} fg={mc.text} style={{ fontWeight: T.weight.title, boxShadow: mk.box && f >= mk.at ? `0 0 0 5px ${mc.fill}` : mk.under && f >= mk.at ? `0 6px 0 ${mc.fill}` : undefined }}>{mk.text}</K.Mark>{row.t.slice(i0 + mk.text.length)}</>}
                  </div>
                )}
                {row.check !== undefined ? <div style={{ position: "absolute", right: -22, top: -98, width: 104, height: 104, ...K.slam(f, row.check, 10, 2.6) }}><div style={{ width: "100%", height: "100%", boxSizing: "border-box", borderRadius: "50%", background: T.card, border: `8px solid ${col("right").fill}`, boxShadow: T.depth.soft, display: "flex", alignItems: "center", justifyContent: "center" }}><K.Check size={64} color={col("right").fill} /></div></div> : null}
              </div>
            );
          })}
        </div>
        {p.sticker ? (() => { const sc = col(p.sticker.color ?? "note"); return (
          <div style={{ position: "absolute", right: 10, top: H + 26, opacity: 1 - tween(f, end, 4), ...K.slam(f, r.at(p.sticker.at, FAR), -3), transformOrigin: "70% 0" }}>
            <div style={{ background: sc.fill, borderRadius: 22, padding: "20px 30px", boxShadow: `0 ${T.depth.card}px 0 ${sc.side}, ${T.depth.soft}` }}>
              <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 52, color: sc.on }}>{p.sticker.text}</div>
              {p.sticker.sub ? <div style={{ ...zh, fontWeight: T.weight.body, fontSize: 32, color: sc.text, marginTop: 8 }}>{p.sticker.sub}</div> : null}
            </div>
          </div>
        ); })() : null}
      </K.Bb>,
    );
  });
  // ── s14 上下並排對照：兩個回答同時停在畫面上 ──
  if (cm && f >= cmIn && f < cm.out + M.exit) {
    const p = cm.p, q = POS.cmp, e = tween(f, cm.out, M.exit, EASE.exit), tBadge = cm.at(p.badge?.at, cmIn + 14);
    [p.top, p.bottom].forEach((s: any, i: number) => {
      const c = col(s.color ?? (i ? "right" : "wrong")), y = q.y + i * (q.h + q.gap), t0 = cmIn + 2 + i * 5, ent = springAccent(f, t0);
      const i0 = s.mark ? String(s.answer).indexOf(s.mark) : -1;
      out.push(
        <K.Bb key={`cm-${i}`} m={K.at2(q.x, y + (1 - ent) * (i ? 220 : -160) - 70 * e)} w={q.w} h={q.h} o={tween(f, t0, 4) * (1 - e)}>
          <div style={{ ...K.face(T.card, c.fill, T.depth.tile), padding: "26px 40px" }}>
            <Head label={s.label} color={s.color ?? (i ? "right" : "wrong")} by={p.by} />
            <div style={{ ...zh, fontWeight: T.weight.body, fontSize: 30, color: T.ink3, marginTop: 14 }}>{s.promptLabel ?? "我打的"}：{s.prompt}</div>
            <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 40, color: T.ink, marginTop: 14 }}>{i0 < 0 ? s.answer : <>{String(s.answer).slice(0, i0)}<span style={{ color: c.text, fontWeight: T.weight.title, background: c.soft, borderRadius: T.radius.mark, padding: "0 0.08em" }}>{s.mark}</span>{String(s.answer).slice(i0 + s.mark.length)}</>}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: c.fill, display: "flex", alignItems: "center", justifyContent: "center" }}>{i ? <K.Check size={40} color={c.on} /> : <Cross size={38} color={c.on} />}</div>
              <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 44, color: c.text }}>{s.tag}</div>
            </div>
          </div>
        </K.Bb>,
      );
    });
    if (p.badge) out.push(<div key="cm-badge" style={{ position: "absolute", left: L.X, width: L.INNER_W, top: q.y + q.h + T.depth.tile + 2 - 70 * e, textAlign: "center", opacity: 1 - e }}><div style={{ display: "inline-block", ...K.bounce(f, tBadge) }}><K.Chip text={p.badge.text} bg={T.ink} fg={T.card} px={36} /></div></div>);
  }
  // ── s16 提醒：回答紙落回桌上，放大鏡移到新聞紙（原文）上面 ──
  if (rm && f >= rmIn && f < tpIn + M.exit) {
    const p = rm.p, q = POS.remind, c = col("note"), e = tween(f, tpIn, M.exit, EASE.exit), tIn = rm.at(p.at, rmIn + 6), tPulse = rm.at(p.pulseAt, FAR);
    const k = f < tIn ? 0.6 : pop(f, tIn, 0.6) * (f >= tPulse ? pop(f, tPulse, 0.93) : 1);
    out.push(
      <K.Bb key="rm-card" m={K.popM(q.x, q.y - 70 * e, q.w, q.h, k)} w={q.w} h={q.h} o={tween(f, tIn, 3) * (1 - e)}>
        <div style={{ ...K.face(c.fill, c.side, T.depth.tile, T.radius.tile), padding: "30px 44px" }}>
          <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 128, color: c.on }}>{p.text}</div>
          <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 48, color: c.text, marginTop: 14 }}>{p.sub}</div>
        </div>
      </K.Bb>,
    );
    ((p.tags ?? []) as any[]).forEach((tg, i) => {
      const [sx, sy] = i ? w2s(D.news.x + 60, D.news.y + 40, 60) : w2s(D.sheet.x + 60, D.sheet.y + 110, 30);
      out.push(<div key={`rm-tag${i}`} style={{ position: "absolute", left: sx, top: sy + (i ? -150 : 60), opacity: 1 - e }}><div style={{ transform: "translateX(-50%)" }}><div style={K.bounce(f, rm.at(tg.at, rmIn + 16))}><K.Chip text={tg.text} bg={T.ink} fg={T.card} px={38} /></div></div></div>);
    });
  }
  // ── s17–s18 範本卡（正面平視、可截圖）＋提問 ──
  if (tp && f >= tpIn && f < (qs ?? tp).out + M.exit) {
    const p = tp.p, q = POS.tpl, c = col("primary"), endT = (qs ?? tp).out, e = tween(f, endT, M.exit, EASE.exit);
    const ent = springAccent(f, tpIn + 2), sh = tween(f, qsIn - 2, M.cam, EASE.move), k = 1 + (q.k - 1) * sh, tHint = tp.at(p.hintAt, FAR), fl = f >= tHint ? 1 - tween(f, tHint, 8) : 0;
    out.push(
      <K.Bb key="tp-card" m={K.at2(q.x + (q.w / 2) * (1 - k), q.y + (1 - ent) * 300 + 120 * e, k)} w={q.w} h={q.h} o={tween(f, tpIn + 2, 4) * (1 - e)}>
        <div style={{ ...K.face(), padding: "32px 44px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 58, color: T.ink }}>{p.title}</div>
            {p.hint ? <div style={K.bounce(f, tHint, 3)}><K.Chip text={p.hint} bg={c.fill} fg={c.on} px={34} side={c.side} /></div> : null}
          </div>
          <div style={{ height: 6, borderRadius: 6, background: T.line, margin: "18px 0 14px" }} />
          {(p.lines as string[]).map((ln, i) => {
            const isHead = /^\d\./.test(ln), isSlot = /^【/.test(ln), hc = [col("right"), col("note"), col("primary")][Math.max(0, Number(ln[0]) - 1) % 3];
            return <div key={i} style={{ ...zh, height: p.lineH ?? 60, display: "flex", alignItems: "center", fontWeight: isHead || isSlot ? T.weight.title : T.weight.body, fontSize: p.linePx ?? 42, color: isHead ? hc.text : isSlot ? c.text : T.ink }}>{isSlot ? <span style={{ background: c.soft, borderRadius: 12, padding: "2px 14px" }}>{ln}</span> : ln}</div>;
          })}
          <div style={{ ...zh, fontWeight: T.weight.body, fontSize: 36, color: T.ink3, marginTop: 8 }}>{p.foot}</div>
          {fl > 0 ? <div style={{ position: "absolute", inset: 0, borderRadius: T.radius.card, background: T.color.primary.soft, opacity: 0.45 * fl }} /> : null}
          {f >= tHint ? [[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b], i) => <div key={i} style={{ position: "absolute", [a ? "right" : "left"]: 14, [b ? "bottom" : "top"]: 14, width: 44, height: 44, [`border${b ? "Bottom" : "Top"}`]: `8px solid ${c.fill}`, [`border${a ? "Right" : "Left"}`]: `8px solid ${c.fill}`, borderRadius: 6, opacity: tween(f, tHint, 3) }} />) : null}
        </div>
      </K.Bb>,
    );
    if (qs) {
      const a = POS.ask2, qc = col("primary"), tQ = qs.at(qs.p.at, qsIn + 6);
      out.push(
        <K.Bb key="qs-card" m={K.popM(a.x, a.y + 120 * e, a.w, a.h, f < tQ ? 0.6 : pop(f, tQ, 0.6))} w={a.w} h={a.h} o={tween(f, tQ, 3) * (1 - e)}>
          <div style={{ ...K.face(qc.fill, qc.side, T.depth.tile, T.radius.tile), display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 44px" }}>
            <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 34, color: qc.on, opacity: 0.92 }}>{qs.p.kicker}</div>
            <div style={{ ...zh, fontWeight: T.weight.title, fontSize: qs.p.size ?? 76, color: qc.on, marginTop: 8 }}>{qs.p.text}</div>
          </div>
        </K.Bb>,
      );
    }
  }
  // ── s19 下一集：桌上兩份報導分開，中間一個問號 ──
  if (nx && f >= nxIn && f < nx.out + M.exit) {
    const p = nx.p, e = tween(f, nx.out, M.exit, EASE.exit), tAsk = nx.at(p.askAt, nxIn + 40);
    ([[news, p.left, 0], [newsB, p.right, 1]] as [Obj | null, string, number][]).forEach(([n, label, i]) => {
      if (!n || !label) return;
      const [sx, sy] = w2s(n.x + D.news.w / 2, n.y + D.news.h / 2, n.z);
      out.push(<div key={`nx-l${i}`} style={{ position: "absolute", left: sx, top: i ? sy + 76 : sy - 130, opacity: 1 - e }}><div style={{ transform: "translateX(-50%)" }}><div style={K.bounce(f, nx.at(p.splitAt, nxIn + 20) + i * 3)}><K.Chip text={label} bg={T.ink} fg={T.card} px={40} /></div></div></div>);
    });
    if (newsB) {
      const [ax, ay] = w2s(news.x + D.news.w / 2, news.y + D.news.h / 2, news.z), [bx, by] = w2s(newsB.x + D.news.w / 2, newsB.y + D.news.h / 2, newsB.z), c = col("note");
      out.push(<div key="nx-q" style={{ position: "absolute", left: (ax + bx) / 2, top: (ay + by) / 2 - 20, opacity: 1 - e }}><div style={{ transform: "translate(-50%,-50%)" }}><div style={K.bounce(f, tAsk, -6)}><div style={{ width: 150, height: 150, borderRadius: 40, background: c.fill, boxShadow: `0 ${T.depth.tile}px 0 ${c.side}, ${T.depth.soft}`, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: T.weight.title, fontSize: 120, color: c.on }}>?</div></div></div></div>);
    }
  }
  // ── 片尾卡 ──
  if (ed && f >= edIn) {
    const p = ed.p, q = POS.end, c = col("primary"), tIn = ed.at(p.at, edIn + 10);
    out.push(
      <K.Bb key="ed-card" m={K.at2(q.x, q.y + (1 - springAccent(f, tIn)) * 200)} w={q.w} h={q.h} o={tween(f, tIn, 5)}>
        <div style={{ ...K.face(), padding: "40px 48px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 92, height: 82, borderRadius: 24, background: c.fill, boxShadow: `0 8px 0 ${c.side}`, display: "flex", alignItems: "center", justifyContent: "center", ...en, fontWeight: T.weight.strong, fontSize: 46, color: c.on }}>{channel?.name ?? "AI"}</div>
            <div style={{ ...zh, fontWeight: T.weight.title, fontSize: 54, color: T.ink }}>{channel?.tag ?? "AI 動手做"}</div>
          </div>
          <div style={{ ...zh, fontWeight: T.weight.title, fontSize: p.size ?? 118, color: T.ink, marginTop: 30 }}>{p.title}</div>
          <div style={{ ...zh, fontWeight: T.weight.strong, fontSize: 44, color: c.text, marginTop: 16 }}>{p.sub}</div>
          <div style={{ marginTop: 26, ...K.bounce(f, tIn + 10) }}><K.Chip text={channel?.slogan ?? ""} bg={c.soft} fg={c.text} px={36} /></div>
          <div style={{ ...zh, fontWeight: T.weight.body, fontSize: L.MIN_PX, color: T.ink3, marginTop: 26 }}>{p.note}</div>
        </div>
      </K.Bb>,
    );
  }
  return (
    <>
      <World st={st} />
      {out}
    </>
  );
};

export const FilmIso: React.FC<Script & { timeline: TimelineV2 }> = ({ scenes, timeline, channel }) => {
  const f = useCurrentFrame();
  const panels = useMemo(() => buildIso(scenes, timeline), [scenes, timeline]);
  const by = Object.fromEntries(timeline.scenes.map((x) => [x.id, x]));
  const ordered = scenes.filter((s) => by[s.id]);
  const caps: K.Cap[] = ordered.filter((s) => by[s.id].subtitleWindow).map((s) => ({ en: s.subtitle.en, window: by[s.id].subtitleWindow as [number, number], phrases: by[s.id].lines.map((l) => ({ ...l, text: l.text.replace(/[，、；：。]+$/, "") })), keywords: s.keywords ?? [], kw: ((s.props as any)?.kw ?? {}) as Record<string, string> }));
  const capEnd = Math.max(0, ...caps.map((c) => c.window[1]));
  const srcs = ordered.map((s) => ({ sources: s.sources, window: by[s.id].sourceWindow }));
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <K.Backdrop />
      <Stage panels={panels} f={f} channel={channel} />
      <K.HeaderIso name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} right={channel?.slogan} progress={Math.min(1, f / Math.max(1, timeline.totalFrames - 1))} />
      {f < capEnd ? <K.Caption cues={caps} f={f} /> : null}
      <K.SourceLine cues={srcs} f={f} />
      {timeline.voice ? <Audio src={staticFile(timeline.voice.file)} /> : timeline.scenes.filter((t) => t.audio).map((t) => (
        <Sequence key={`${t.id}-audio`} from={t.audioFrame} durationInFrames={Math.ceil(t.audioSec * FPS) + 1} name={`${t.id}-audio`} layout="none"><Audio src={staticFile(t.audio as string)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** 封面：鉤子那一鏡的落定畫面 */
export const CoverFilm: React.FC<Script & { coverCrop?: number }> = ({ scenes, channel, coverCrop }) => {
  const p = (scenes[0]?.props ?? {}) as Record<string, any>;
  const shift = coverCrop ? (L.H - coverCrop) / 2 - 150 : 0;
  const panel: Panel = { kind: "hook", sid: "cover", in: 0, out: 1e9, p, at: () => 0 };
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <K.Backdrop />
      <Stage panels={[panel]} f={9999} channel={channel} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}><K.HeaderIso name={channel?.name ?? "AI"} tag={channel?.tag ?? "AI 動手做"} right={channel?.slogan} progress={0} /></div>
    </AbsoluteFill>
  );
};
