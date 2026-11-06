// styleVersion 2：UnitGrid（waffle／人形格子）。格子填滿主視覺區，逐格依 cue 填色，框出一組加註解。
// order：row＝逐列、col＝逐欄（新增的一組剛好是右側整欄，方便框選）、wave＝對角波浪。未填格 25% 描邊。
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_EN, FONT_ZH, LAYOUT_V2 as L, THEME_V2 as T, accentV2 } from "../../theme";
import { DUR, EASE, bump, countUp, tween } from "../anim";
import { cueAt, cueIn, useCue } from "../../cue";
import { EN, fmtNum, markerBg, reveal } from "./base";

type Group = { count: number; color?: string; label: string; at?: string };
type Counter = { label: string; from: number; to: number; unit?: string; color?: string; startAt?: string; at?: string };
export type UnitGridProps = {
  title: string; titleEn?: string; titleMark?: string; titleAt?: string;
  total: number; cols: number; icon?: "coin" | "person" | "square"; order?: "row" | "col" | "wave";
  groups: Group[]; frame?: { group: number; label: string; at?: string }; counters?: Counter[]; note?: { text: string; at?: string };
};

const H = L.CONTENT_BOTTOM - L.CONTENT_TOP;
const TOP = 210, BOTTOM = 780;

const Cell: React.FC<{ icon: string; size: number; fill?: string; on: number }> = ({ icon, size, fill, on }) => {
  const s = size;
  const st = on > 0 ? fill : T.chart.emptyCell;
  const fl = on > 0 ? fill : "none";
  const sc = 0.82 + 0.18 * on;
  return (
    <g transform={`scale(${sc.toFixed(3)})`} opacity={on > 0 ? 0.35 + 0.65 * on : 1}>
      {icon === "person" ? (
        <>
          <circle cx={0} cy={-s * 0.24} r={s * 0.16} fill={fl} stroke={st} strokeWidth={3} />
          <path d={`M${-s * 0.28} ${s * 0.42} Q${-s * 0.28} ${-s * 0.02} 0 ${-s * 0.02} Q${s * 0.28} ${-s * 0.02} ${s * 0.28} ${s * 0.42} Z`} fill={fl} stroke={st} strokeWidth={3} />
        </>
      ) : icon === "square" ? (
        <rect x={-s * 0.42} y={-s * 0.42} width={s * 0.84} height={s * 0.84} rx={4} fill={fl} stroke={st} strokeWidth={3} />
      ) : (
        <>
          <circle cx={0} cy={0} r={s * 0.42} fill={fl} stroke={st} strokeWidth={3} />
          <circle cx={0} cy={0} r={s * 0.25} fill="none" stroke={on > 0 ? T.card : st} strokeWidth={3} opacity={0.8} />
        </>
      )}
    </g>
  );
};

export const UnitGrid: React.FC<UnitGridProps> = ({ title, titleEn, titleMark, titleAt, total, cols, icon = "coin", order = "row", groups, frame, counters = [], note }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const rows = Math.ceil(total / cols);
  const cw = 952 / cols, ch = (BOTTOM - TOP) / rows;
  const size = Math.min(cw, ch) * 0.86;
  const pos = (k: number) => order === "col" ? { r: k % rows, col: Math.floor(k / rows) } : { r: Math.floor(k / cols), col: k % cols };
  let seq = Array.from({ length: total }, (_, k) => k);
  if (order === "wave") seq = seq.map((k) => ({ k, d: (k % cols) + Math.floor(k / cols) })).sort((a, b) => a.d - b.d || a.k - b.k).map((x) => x.k);
  // 每組的填色時間：組內逐格錯開，整組在 ≤ 1.3 秒內填完
  const owner: { g: number; t: number }[] = Array(total).fill(null);
  let idx = 0, prevEnd = 4;
  groups.forEach((g, gi) => {
    const st = hasAt(g.at) ? cueIn(c, g.at, prevEnd) : prevEnd;
    const dur = Math.min(40, Math.max(DUR.l, g.count * 0.5));
    for (let j = 0; j < g.count && idx < total; j++, idx++) owner[seq[idx]] = { g: gi, t: st + (j / Math.max(1, g.count)) * dur };
    prevEnd = st + dur + DUR.s;
    function hasAt(a?: string) { return Boolean(a && c.cues[a] !== undefined); }
  });
  const fr = frame ? (() => {
    const ks = owner.map((o, k) => (o && o.g === frame.group ? k : -1)).filter((k) => k >= 0);
    const ps = ks.map(pos);
    const r0 = Math.min(...ps.map((p) => p.r)), r1 = Math.max(...ps.map((p) => p.r)), c0 = Math.min(...ps.map((p) => p.col)), c1 = Math.max(...ps.map((p) => p.col));
    const t = Math.max(...ks.map((k) => owner[k].t));
    return { x: c0 * cw - 6, y: TOP + r0 * ch - 6, w: (c1 - c0 + 1) * cw + 12, h: (r1 - r0 + 1) * ch + 12, t: cueIn(c, frame.at, Math.round(t) + 4) };
  })() : null;
  const tAt = cueAt(c, titleAt, 0);
  return (
    <div style={{ position: "relative", width: 952, height: H }}>
      <div style={{ ...reveal(f, 0), position: "absolute", left: 0, right: 0, top: 4 }}>
        <div style={{ fontFamily: FONT_ZH, fontSize: 56, fontWeight: T.weight.title, color: T.text, whiteSpace: "nowrap", lineHeight: 1.15 }}>
          {titleMark ? title.split(titleMark).map((part, i, arr) => (
            <React.Fragment key={i}>{part}{i < arr.length - 1 && <span style={{ ...markerBg(titleAt ? tween(f, tAt, DUR.m) : 1), display: "inline-block", transform: `scale(${bump(f, tAt, 0.06).toFixed(4)})` }}>{titleMark}</span>}</React.Fragment>
          )) : title}
        </div>
        {titleEn && <div style={{ ...EN, marginTop: 2 }}>{titleEn}</div>}
      </div>
      {/* 計數列 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 112, height: 88, display: "flex", gap: 20 }}>
        {counters.map((k, i) => {
          const land = cueAt(c, k.at, 40 + i * 20);
          const st = cueAt(c, k.startAt, Math.max(4, land - 30));
          const v = k.from + (k.to - k.from) * countUp(f, st, land);
          const a = accentV2(k.color);
          return (
            <div key={i} style={{ ...reveal(f, i * 4, 1, 12), flex: 1, display: "flex", alignItems: "center", gap: 14, padding: "0 20px", background: T.card, border: `${T.cardBorderW}px solid ${T.cardBorder}`, borderLeft: `10px solid ${a.fill}`, borderRadius: T.radius }}>
              <span style={{ fontFamily: FONT_ZH, fontSize: 36, fontWeight: 700, color: T.text2, whiteSpace: "nowrap" }}>{k.label}</span>
              <span style={{ fontFamily: FONT_EN, fontSize: 60, fontWeight: T.weight.num, color: a.text, fontVariantNumeric: "tabular-nums", transform: `scale(${bump(f, land, 0.06).toFixed(4)})` }}>{fmtNum(v)}</span>
              {k.unit && <span style={{ fontFamily: FONT_ZH, fontSize: 32, fontWeight: 700, color: T.text2 }}>{k.unit}</span>}
            </div>
          );
        })}
      </div>
      <svg width={952} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {Array.from({ length: total }, (_, k) => {
          const p = pos(k);
          const o = owner[k];
          const on = o ? tween(f, o.t, DUR.s, EASE.enter) : 0;
          const fill = o ? accentV2(groups[o.g].color).fill : undefined;
          return <g key={k} transform={`translate(${(p.col * cw + cw / 2).toFixed(1)},${(TOP + p.r * ch + ch / 2).toFixed(1)})`}><Cell icon={icon} size={size} fill={fill} on={on} /></g>;
        })}
        {fr && (
          <rect x={fr.x} y={fr.y} width={fr.w} height={fr.h} rx={10} fill="none" stroke={T.text} strokeWidth={5}
            pathLength={1} opacity={tween(f, fr.t, DUR.xs)} style={{ strokeDasharray: `${tween(f, fr.t, DUR.l, EASE.enter).toFixed(3)} 1` }} />
        )}
      </svg>
      {fr && frame && (
        <div style={{ ...reveal(f, fr.t + 4, 1, 12), position: "absolute", left: Math.max(0, Math.min(952 - 260, fr.x + fr.w / 2 - 130)), top: fr.y + fr.h + 12, width: 260, textAlign: "center", fontFamily: FONT_ZH, fontSize: 36, fontWeight: 900, color: T.onAccent, background: T.accent.pink.fill, borderRadius: T.radiusTag, padding: "2px 0" }}>{frame.label}</div>
      )}
      {/* 圖例 */}
      <div style={{ position: "absolute", left: 0, top: BOTTOM + 20, display: "flex", gap: 30 }}>
        {groups.map((g, i) => (
          <div key={i} style={{ ...reveal(f, owner.find((o) => o && o.g === i)?.t ?? 0, 1, 8), display: "flex", alignItems: "center", gap: 10, fontFamily: FONT_ZH, fontSize: 32, fontWeight: 700, color: T.text2 }}>
            <span style={{ width: 26, height: 26, borderRadius: 13, background: accentV2(g.color).fill }} />{g.label}
          </div>
        ))}
      </div>
      {note && (() => {
        const t = cueIn(c, note.at, 100);
        const r = reveal(f, t, 1, 16);
        return (
          <div style={{ ...r, position: "absolute", left: 0, right: 0, top: BOTTOM + 72, textAlign: "center", fontFamily: FONT_ZH, fontSize: 52, fontWeight: T.weight.title, color: T.text, transform: `${r.transform} scale(${bump(f, cueAt(c, note.at, t + 4), 0.05).toFixed(4)})` }}>
            <span style={markerBg(tween(f, t + 2, DUR.m))}>{note.text}</span>
          </div>
        );
      })()}
    </div>
  );
};
