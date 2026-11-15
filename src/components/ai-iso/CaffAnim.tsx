// CaffAIne LOGO 動畫（C 款白卡杯，2026/11/15 Andy 定案；「LOGO 需要有動畫效果和引人注目的音效」）。
// 同一張 short-ai 的粉彩等距桌面：白卡從桌面翻起轉正（一道光掃過）→ 像素一格格拼成杯子（連線節點閃）→ 鎖定：整張卡彈大回彈、像素迸開、擴散波、掃描光掃過杯子顯出 AI →
// 游標閃一下 → 資料點蒸氣往上飄 → CaffAIne 逐字彈出 → AI 藍色塊最後「啪」蓋上（擴散波＋震動）→ 標語 → 留言關鍵字。不是轉圈載入圖示。
// 時間在 caffaineTimeline.json（招牌音讀同一份）；位置與框在 caffAnim.ts（版面檢查共用）。
import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT_ZH, LAYOUT_ISO as L, THEME_ISO as T } from "../../theme";
import { AICELLS, CARD, CARDS, CARD_C, CELL, CUPCELLS, DESK, KW_BOX, PROPS, TAG_BOX, TIMELINE as TL, WORD, WORD_X0, backOut, cardMat, clamp, cupCenter, cupX, cupY, easeInOut, easeOut, hash, landScale, lockScale, scanY, shakeAt, type M6 , CUPV, cardMatV, toStage, type Variant } from "./caffAnim";
import { CAFF } from "./caffaineMark";
import { Box, Shade, Slab, css } from "./IsoVideo";

const CUP_K2 = 2.2;
const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
const P = T.color.primary, S = T.solid;
const crisp = { shapeRendering: "crispEdges" } as const;
const TAGLINE = "一杯咖啡的時間，看懂一個 AI 新知";

const Spark: React.FC<{ x: number; y: number; s: number; c?: string; o?: number }> = ({ x, y, s, c = T.color.note.fill, o = 1 }) => <path transform={`translate(${x} ${y}) scale(${s / 50})`} d="M0 50 C0 12 -12 0 -50 0 C-12 0 0 -12 0 -50 C0 -12 12 0 50 0 C12 0 0 12 0 50 Z" fill={c} opacity={o} />;

/** 卡片本體（局部 520×580）：厚度＋白面；bg＝白／後面的色卡 */
const CardBody: React.FC<{ bg: string; side: string; shadow?: boolean }> = ({ bg, side, shadow }) => (
  <g>
    {shadow ? <rect x={12} y={50} width={CARD.w - 24} height={CARD.h} rx={44} fill={T.floor} opacity={0.1} filter="url(#caShadow)" /> : null}
    <rect x={0} y={16} width={CARD.w} height={CARD.h} rx={44} fill={side} />
    <rect x={0} y={0} width={CARD.w} height={CARD.h} rx={44} fill={bg} />
  </g>
);

/** 卡片上的內容：杯子逐格拼出、連線節點、掃描光、AI、游標、蒸氣資料點 */
const CardFace: React.FC<{ f: number; v: Variant }> = ({ f, v }) => {
  const lock = TL.lock, [sa, sb] = TL.scan, sy = scanY(f);
  // 連線節點：拼杯子時杯子外框的幾個節點亮起、互相連線，鎖定後淡掉（AI 感）
  const nodes: [number, number][] = [[40, 92], [152, 92], [40, 172], [120, 172], [96, 132], [152, 132]];
  const link = clamp((f - (TL.cupStart - 2)) / 8) * (1 - clamp((f - lock) / 5));
  const doneAt = (c: { at: number }) => f >= c.at;
  return (
    <g>
      <circle cx={70} cy={50} r={9} fill={T.color.wrong.fill} /><circle cx={100} cy={50} r={9} fill={T.color.note.fill} /><circle cx={130} cy={50} r={9} fill={T.color.right.fill} />
      {v !== "C" ? <rect x={110} y={CARD.h - 78} width={300} height={10} rx={5} fill={T.line} /> : null}
      {link > 0 && v === "A" ? (
        <g opacity={0.7 * link}>
          {nodes.map(([a, b], i) => nodes.slice(i + 1).filter((_, j) => (i + j) % 2 === 0).map(([c, d], j) => <line key={`${i}-${j}`} x1={cupX(a)} y1={cupY(b)} x2={cupX(c)} y2={cupY(d)} stroke={P.fill} strokeWidth={3} opacity={0.5} />))}
          {nodes.map(([a, b], i) => <circle key={i} cx={cupX(a)} cy={cupY(b)} r={7 + 4 * Math.abs(Math.sin(f / 3 + i))} fill={T.card} stroke={P.fill} strokeWidth={4} />)}
        </g>
      ) : null}
      {/* 杯子：A 一列列長出；B 咖啡倒進去由下往上滿；C 程式碼收攏重組；D 資料方塊飛來；E 蓋章一次印出 */}
      <g {...crisp}>
        {v === "A" ? CUPCELLS.filter(doneAt).map((c, i) => { const t = backOut((f - c.at) / 5, 2.4), s2 = Math.max(0.01, t), w = CELL * s2; return <rect key={i} x={cupX(c.x) + (CELL - w) / 2} y={cupY(c.y) + (CELL - w) / 2} width={w} height={w} fill={c.k === "cup" ? S.desk.r : S.desk.l} />; }) : null}
        {v === "B" ? (() => {
          const F = clamp((f - 20) / 10), n = F * 11, surf = cupY(180) - n * 8 * CUP_K2;
          return <g>
            {f >= 14 && f < 36 ? CUPV.map((c, i) => <rect key={`g${i}`} x={cupX(c.x)} y={cupY(c.y)} width={CELL} height={CELL} fill={T.line} opacity={0.55 * (1 - clamp((f - 30) / 6))} />) : null}
            {CUPV.filter((c) => n >= 10 - c.row + 0.5 || f >= 31).map((c, i) => <rect key={i} x={cupX(c.x)} y={cupY(c.y)} width={CELL} height={CELL} fill={c.k === "cup" ? S.desk.r : S.desk.l} />)}
            {f >= 16 && f < 36 ? <g opacity={1 - clamp((f - 31) / 5)}><rect x={226} y={14} width={68} height={22} rx={8} fill={T.color.plum.fill} /><rect x={248} y={36} width={24} height={10} fill={T.color.plum.side} /></g> : null}
            {f >= 20 && f < 33 ? Array.from({ length: 9 }, (_, j) => { const top = 52, h = Math.max(40, surf - top), y = top + (((f - 20) * 15 + j * 46) % h); return <rect key={j} x={cupX(100) - 8 + (j % 2) * 8} y={y} width={14} height={14} fill={S.desk.r} />; }) : null}
          </g>; })() : null}
        {v === "C" ? CUPV.map((c, i) => {
          const tp = 4 + c.ty * 0.17; if (f < tp) return null;
          const u = easeInOut((f - 25 - (c.ty % 12) * 0.3) / 5), x = c.code.x + (cupX(c.x) - c.code.x) * u, y = c.code.y + (cupY(c.y) - c.code.y) * u - 40 * Math.sin(Math.PI * u), sz = 15 + (CELL - 15) * u, col = u > 0.7 ? S.desk.r : [P.fill, T.color.sky.fill, T.color.plum.fill, T.color.right.fill][(i * 7) % 4];
          return <rect key={i} x={x} y={y} width={sz} height={sz} rx={u > 0.9 ? 0 : 3} fill={u > 0.7 ? S.desk.r : col} />;
        }) : null}
        {v === "C" && f < 26 ? (() => { const kk = Math.min(131, Math.floor((f - 4) / 0.17)), q = CUPV.find((c) => c.ty === kk); return q && Math.floor(f / 3) % 2 === 0 ? <rect x={q.code.x + 20} y={q.code.y - 2} width={5} height={19} fill={T.ink} /> : null; })() : null}
        {v === "D" ? CUPV.filter((c) => f >= c.dAt).map((c, i) => { const t = backOut((f - c.dAt) / 4, 2.2), w = CELL * Math.max(0.01, t); return <rect key={i} x={cupX(c.x) + (CELL - w) / 2} y={cupY(c.y) + (CELL - w) / 2} width={w} height={w} fill={c.k === "cup" ? S.desk.r : S.desk.l} />; }) : null}
        {v === "E" ? CUPV.filter(() => f >= TL.lock).map((c, i) => { const t = backOut((f - TL.lock) / 5, 3), w = CELL * Math.max(0.01, Math.min(1.12, t)); return <rect key={i} x={cupX(c.x) + (CELL - w) / 2} y={cupY(c.y) + (CELL - w) / 2} width={w} height={w} fill={c.k === "cup" ? S.desk.r : S.desk.l} />; }) : null}
      </g>
      {v === "C" && f >= 22 && f < 42 ? (() => { const press = f >= 28 && f < 32 ? 7 : 0, o = 1 - clamp((f - 36) / 5); return <g opacity={o} transform={`translate(0 ${press})`}><rect x={150} y={494} width={220} height={64} rx={14} fill={T.cardSide} transform="translate(0 7)" /><rect x={150} y={494} width={220} height={64} rx={14} fill={T.card} stroke={T.ink3} strokeWidth={4} /><text x={260} y={537} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={34} fill={T.ink}>Enter ⏎</text></g>; })() : null}
      {/* AI：掃描光掃過才顯現（掃過的那一格閃一下） */}
      <g {...crisp}>
        {(v === "B" || v === "E") ? AICELLS.map((c, i) => { const t0 = v === "B" ? TL.lock + 1 + i * 0.25 : TL.lock + 3 + (c.x - 56) / 8 * 0.6; if (f < t0) return null; const u = clamp((f - t0) / 4), dy = v === "B" ? 26 * (1 - easeOut(u)) : 0; return <rect key={i} x={cupX(c.x)} y={cupY(c.y) + dy} width={CELL} height={CELL} fill={P.fill} opacity={u} />; }) : AICELLS.map((c, i) => { const y = cupY(c.y); if (sy < y || f < sa) return null; const t = f - sa, fresh = sy - y < 26 && f < sb + 3; return <rect key={i} x={cupX(c.x)} y={y} width={CELL} height={CELL} fill={fresh ? "#8E9BFF" : P.fill} />; })}
      </g>
      {/* 游標：AI 後面閃兩下 */}
      {f >= TL.cursor[0] && f < TL.cursor[1] && Math.floor((f - TL.cursor[0]) / 3) % 2 === 0 ? <rect x={cupX(136)} y={cupY(104)} width={9} height={CELL * 5} rx={3} fill={P.fill} /> : null}
      {/* 掃描光 */}
      {f >= sa && f <= sb + 2 && v !== "B" && v !== "E" ? (
        <g opacity={f > sb ? 0.4 : 0.95}>
          <rect x={30} y={sy - 44} width={CARD.w - 60} height={44} fill="url(#caScan)" />
          <rect x={30} y={sy - 3} width={CARD.w - 60} height={6} rx={3} fill="#8E9BFF" />
        </g>
      ) : null}
      {/* 蒸氣：資料點往上飄（小方塊、圓點、0／1），先一個個冒出來，之後一直循環 */}
      {f >= TL.steamStart ? Array.from({ length: 14 }, (_, i) => {
        const age = ((f - TL.steamStart) * 1.15 + i * 11) % 150, born = f - TL.steamStart >= i * 1.3; if (!born) return null;
        const x = cupX(100) + 28 * Math.sin(age / 17 + i * 1.7) * (0.4 + age / 150), y = cupY(70) - age * 1.55, sz = 20 * (1 - 0.5 * age / 150), c = [P.fill, T.color.sky.fill, T.color.plum.fill][i % 3], o = Math.min(1, age / 8) * (1 - clamp((age - 90) / 60));
        return i % 4 === 3 ? <text key={i} x={x} y={y + sz} fontFamily={MONO} fontWeight={800} fontSize={sz * 1.8} fill={c} opacity={o} textAnchor="middle">{i % 2 ? "1" : "0"}</text> : <rect key={i} x={x - sz / 2} y={y - sz / 2} width={sz} height={sz} rx={i % 4 === 1 ? sz / 2 : 3} fill={c} opacity={o} />;
      }) : null}
    </g>
  );
};

export const CaffAnim: React.FC<{ f: number; keyword?: string; kw?: boolean; header?: boolean; format?: "tall" | "square"; variant?: Variant }> = ({ f, keyword = "", kw = true, format = "tall", variant: v = "A" }) => {
  const sh = shakeAt(f), sc = landScale(f) * lockScale(f), cc = cupCenter();
  // 光掃過白卡（落地那一刻）：斜的淡藍色帶從左上滑到右下
  const glossT = (f - (TL.flip[1] - 4)) / 10, gloss = glossT > 0 && glossT < 1;
  const stampT = f - TL.stamp, cw = 0.6 * WORD.px;
  const cardTf = `translate(${sh.dx} ${sh.dy}) translate(${CARD_C.x} ${CARD_C.y}) scale(${sc}) translate(${-CARD_C.x} ${-CARD_C.y})`;
  const wordY = WORD.base;
  const scene = (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <filter id="caShadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={16} /></filter>
        <linearGradient id="caScan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8E9BFF" stopOpacity={0} /><stop offset="1" stopColor="#8E9BFF" stopOpacity={0.55} /></linearGradient>
        <linearGradient id="caGloss" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#CFD6FF" stopOpacity={0} /><stop offset="0.5" stopColor="#CFD6FF" stopOpacity={0.95} /><stop offset="1" stopColor="#CFD6FF" stopOpacity={0} /></linearGradient>
        <clipPath id="caClip"><rect width={CARD.w} height={CARD.h} rx={44} /></clipPath>
      </defs>
      {/* 桌面（和 short-ai 同一張粉彩桌，放大鋪滿）＋桌上的小東西 */}
      <g transform={`translate(${DESK.cx} ${DESK.top})`}>
        <Shade x={30} y={30} w={DESK.S} h={DESK.S} r={70} z={-110} />
        <Slab id="caDesk" x={0} y={0} w={DESK.S} h={DESK.S} t={40} r={64} c={S.desk} />
        <Slab id="caKb" x={PROPS[0].x} y={PROPS[0].y} z={4} w={PROPS[0].w} h={PROPS[0].h} t={12} r={12} c={S.lav}>{Array.from({ length: 21 }, (_, i) => <rect key={i} x={10 + (i % 7) * 34} y={14 + Math.floor(i / 7) * 28} width={26} height={20} rx={5} fill={T.card} opacity={0.85} />)}</Slab>
        <Box x={PROPS[1].x} y={PROPS[1].y} dx={60} dy={60} dz={50} c={S.mint} />
      </g>
      {/* 卡片：三張，後面兩張色卡晚一點出發 */}
      <g transform={cardTf}>
        {[0, 1, 2].map((i) => { const m = cardMatV(i, f, v), c = CARDS[i], bg = c.bg === "white" ? T.card : T.color[c.bg].soft, side = c.bg === "white" ? T.cardSide : c.bg === "plum" ? T.color.plum.fill : T.color.note.side; return <g key={i} transform={css(m)}><CardBody bg={bg} side={side} shadow={i === 2} />{i === 2 ? (
          <g clipPath="url(#caClip)"><CardFace f={f} v={v} />{gloss ? <g transform={`translate(${-260 + 1000 * easeOut(glossT)} 0) skewX(-18)`}><rect x={0} y={-40} width={190} height={CARD.h + 80} fill="url(#caGloss)" /></g> : null}</g>
        ) : null}</g>; })}
      </g>
      {/* D：桌面四周的資料方塊沿弧線飛向白卡、到位就變成杯子的一格 */}
      {v === "D" ? CUPV.map((c, i) => {
        if (f >= c.dAt) return null;
        const [tx, ty] = toStage(cupX(c.x) + CELL / 2, cupY(c.y) + CELL / 2, f, v), sx = 540 + Math.cos(c.ang) * c.rad, sy0 = 676 + Math.sin(c.ang) * c.rad * 0.8;
        const sgn = hash(i * 1.7) > 0.5 ? 1 : -1, nx = -(ty - sy0), ny = tx - sx, nl = Math.hypot(nx, ny) || 1;
        const at = (t: number) => { const e = 1 - Math.pow(1 - clamp(t), 2.2), mx = (sx + tx) / 2 + (nx / nl) * 240 * sgn, my = (sy0 + ty) / 2 + (ny / nl) * 240 * sgn; return [(1 - e) * (1 - e) * sx + 2 * (1 - e) * e * mx + e * e * tx, (1 - e) * (1 - e) * sy0 + 2 * (1 - e) * e * my + e * e * ty]; };
        const t = f / c.dAt, col = [P.fill, T.color.sky.fill, T.color.plum.fill, T.color.note.fill][i % 4];
        return <g key={i}>{[0.07, 0.14, 0.21].map((b, k) => { const [gx, gy] = at(t - b); return <rect key={k} x={gx - 8} y={gy - 8} width={16} height={16} fill={col} opacity={0.32 - k * 0.09} />; })}{(() => { const [gx, gy] = at(t); return <rect x={gx - 9} y={gy - 9} width={18} height={18} fill={col} />; })()}</g>;
      }) : null}
      {/* E：蓋章。印章砸下來（和鎖定的撞擊同一幀）、抬起來，底下已經印好杯子 */}
      {v === "E" && f >= 18 && f < 44 ? (() => {
        const [cx, cy] = toStage(cupX(100), cupY(132), f, v), fall = clamp((f - 20) / 10), lift = clamp((f - 33) / 7), yo = f < TL.lock ? -560 * (1 - fall * fall) : -420 * lift * lift, sq = f >= TL.lock && f < TL.lock + 4 ? 0.9 : 1, o = f < 33 ? 1 : 1 - lift;
        return (
          <g opacity={o}>
            <ellipse cx={cx} cy={cy + 10} rx={170 * fall} ry={46 * fall} fill={T.floor} opacity={0.2 * fall * (f < 34 ? 1 : 0)} />
            <g transform={`translate(${cx} ${cy + yo}) scale(1 ${sq})`}>
              <rect x={-190} y={-60} width={380} height={140} rx={26} fill={S.plum.r} /><rect x={-190} y={-74} width={380} height={140} rx={26} fill={S.plum.top} />
              <rect x={-50} y={-170} width={100} height={104} rx={30} fill={S.plum.l} /><rect x={-50} y={-176} width={100} height={104} rx={30} fill={S.plum.top} />
              <rect x={-150} y={-30} width={300} height={14} rx={7} fill={T.card} opacity={0.5} />
            </g>
          </g>);
      })() : null}
      {/* 鎖定：像素迸開、擴散波 */}
      {(() => {
        const t = f - TL.lock; if (t < 0 || t > 24) return null;
        const [m0, m1] = cardMat(2, f), cx = CARD_C.x + (cc[0] - CARD.w / 2) + sh.dx, cy = CARD_C.y + (cc[1] - CARD.h / 2) + sh.dy;
        return (
          <g {...crisp}>
            {Array.from({ length: 34 }, (_, k) => { const life = 14 + 10 * hash(k * 3.3), u = t / life; if (u >= 1) return null; const a = hash(k * 7.7) * Math.PI * 2, r = (120 + 340 * (0.35 + 0.65 * hash(k * 2.1))) * easeOut(u), size = Math.round((10 + hash(k * 5.5) * 14) / 2) * 2; return <rect key={k} x={Math.round((cx + Math.cos(a) * r) / 2) * 2} y={Math.round((cy + Math.sin(a) * r * 0.9) / 2) * 2} width={size} height={size} fill={[S.desk.r, P.fill, T.color.sky.fill, T.color.plum.fill, T.color.note.fill][k % 5]} opacity={1 - u * u} />; })}
            <circle cx={cx} cy={cy} r={50 + 520 * easeOut(t / 16)} fill="none" stroke={P.fill} strokeWidth={Math.max(2, 14 * (1 - t / 16))} opacity={t < 16 ? 0.5 * (1 - t / 16) : 0} />
          </g>
        );
      })()}
      {/* 字標：C a f f 逐字彈出，n e，最後 AI 藍色塊「啪」蓋上 */}
      <g transform={`translate(${shakeAt(f).dx} ${shakeAt(f).dy})`}>
        {TL.letters.map((lf, i) => { if (f < lf) return null; const idx = i < 4 ? i : i + 2, t = backOut((f - lf) / 6, 2), dy = Math.round(46 * (1 - t)), s = 0.6 + 0.4 * Math.min(1, t); return <text key={i} transform={`translate(${WORD_X0 + (idx + 0.5) * cw} ${wordY + dy}) scale(${s})`} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={WORD.px} fill={T.ink} opacity={clamp((f - lf) / 2)}>{"Caffne"[i]}</text>; })}
        {f >= TL.stamp ? (() => {
          const u = clamp(stampT / 5), sc2 = 1 + 0.9 * (1 - easeOut(u)), w = 2 * cw - 2, h = WORD.px * 1.1, x = WORD_X0 + 4 * cw + 1, y = wordY - 0.8 * WORD.px - 10;
          const iPop = f >= TL.iPop ? backOut((f - TL.iPop) / 5, 2.6) : 0;
          return (
            <g transform={`translate(${x + w / 2} ${y + h / 2}) scale(${sc2}) translate(${-(x + w / 2)} ${-(y + h / 2)})`} opacity={1}>
              <rect x={x} y={y + 8} width={w} height={h} rx={WORD.px * 0.2} fill={P.side} /><rect x={x} y={y} width={w} height={h} rx={WORD.px * 0.2} fill={P.fill} />
              <text x={x + cw * 0.5} y={wordY} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={WORD.px} fill="#fff">A</text>
              <text x={x + cw * 1.5} y={wordY - 0.1 * WORD.px * (iPop - 1)} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={WORD.px * Math.max(0.01, Math.min(1.15, iPop))} fill="#fff">I</text>
            </g>
          );
        })() : null}
        {stampT >= 0 && stampT < 16 ? <circle cx={WORD_X0 + 5 * cw} cy={wordY - 0.3 * WORD.px} r={40 + 380 * easeOut(stampT / 14)} fill="none" stroke={P.fill} strokeWidth={Math.max(2, 12 * (1 - stampT / 16))} opacity={0.5 * (1 - stampT / 16)} /> : null}
      </g>
      {/* 標語（一格一格抹出，叮叮兩顆星）、留言列 */}
      {f >= TL.tagline ? (() => {
        const w = Math.ceil(8 * clamp((f - TL.tagline) / 8)) / 8, dy = Math.round(18 * (1 - backOut((f - TL.tagline) / 8, 1.2)));
        return <g transform={`translate(0 ${dy})`}><clipPath id="caTag"><rect x={TAG_BOX.x} y={TAG_BOX.y - 4} width={TAG_BOX.w * w} height={TAG_BOX.h + 8} /></clipPath><text clipPath="url(#caTag)" x={540} y={TAG_BOX.y + 46} textAnchor="middle" fontFamily={FONT_ZH} fontWeight={800} fontSize={42} fill={T.ink2}>{TAGLINE}</text></g>;
      })() : null}
      <Spark x={150} y={TAG_BOX.y - 6} s={26} o={f >= TL.tagline && f < TL.tagline + 10 ? 1 : 0} /><Spark x={930} y={TAG_BOX.y - 6} s={26} o={f >= TL.tagline2 && f < TL.tagline2 + 10 ? 1 : 0} />
      {kw && f >= TL.keyword ? (() => { const t = clamp((f - TL.keyword) / 6), dy = Math.round(40 * (1 - backOut((f - TL.keyword) / 7, 1.4))); return (
        <g transform={`translate(0 ${dy})`} opacity={Math.min(1, t * 2)}>
          <rect x={KW_BOX.x} y={KW_BOX.y + 8} width={KW_BOX.w} height={KW_BOX.h} rx={30} fill={T.cardSide} /><rect x={KW_BOX.x} y={KW_BOX.y} width={KW_BOX.w} height={KW_BOX.h} rx={30} fill={T.card} />
          <text x={540} y={KW_BOX.y + 68} textAnchor="middle" fontFamily={FONT_ZH} fontWeight={800} fontSize={50} fill={T.ink}>留言「<tspan fill={P.text}>{keyword}</tspan>」拿完整資料</text>
        </g>); })() : null}
    </svg>
  );
  // 方形版（1080×1080）：整個場景縮一點、上移，讓卡片到標語落在正中
  const wrap: React.CSSProperties = format === "square" ? { position: "absolute", inset: 0, transform: "translateY(-300px) scale(1.0)", transformOrigin: "50% 0" } : { position: "absolute", inset: 0 };
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bg2} 100%)` }}>
      {[[260, 640, P.soft], [820, 1000, T.color.note.soft]].map(([x, y, c], i) => <div key={i} style={{ position: "absolute", left: (x as number) + 70 * Math.sin(f / 31 + i) - 330 + (format === "square" ? 0 : 0), top: (y as number) - 330 + (format === "square" ? -300 : 0), width: 660, height: 660, borderRadius: "50%", background: `radial-gradient(closest-side, ${c}, ${c}00)`, opacity: 0.85 }} />)}
      <div style={wrap}>
        {/* 上面一條淡紫色帶（平台介面區也有內容，不留死白）＋漂浮小物 */}
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <rect x={0} y={0} width={1080} height={64} fill={S.lav.top} />{Array.from({ length: 27 }, (_, i) => <rect key={i} x={i * 40 + 16} y={22} width={8} height={8} rx={2} fill={P.fill} opacity={0.35} />)}
          <Spark x={140} y={420} s={34 + 4 * Math.sin(f / 7)} /><Spark x={950} y={380} s={28 + 4 * Math.sin(f / 6)} c={P.fill} /><circle cx={990} cy={640} r={14} fill={T.color.right.fill} opacity={0.6 + 0.3 * Math.sin(f / 9)} /><circle cx={90} cy={800} r={16} fill={T.color.wrong.fill} opacity={0.6 + 0.3 * Math.sin(f / 8)} />
        </svg>
        {scene}
      </div>
    </AbsoluteFill>
  );
};
