// styleVersion 2 卡片類元件：CompareSplit、FlowRow、ImpactCard、IconGrid、TermCard。
// 元素依 cue 進場（at）；同一個元件裡多個 cue 項目時做 focus（其他項降到 THEME_V2.dim），念到時 punch 一次。
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_EN, FONT_ZH, THEME_V2 as T, accentV2 } from "../../theme";
import { DUR, EASE, STAGGER, bump, tween, typeChars } from "../anim";
import { cueAt, cueIn, firstEarly, focusLevel, hasCue, useCue } from "../../cue";
import { CardV2, EN, IconV2, NoteBoxV2, StatusTagV2, drawIn, reveal } from "./base";

const zh = (size: number, weight: number = T.weight.body, color: string = T.text): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: size, fontWeight: weight, color, lineHeight: 1.42 });

// ───────── CompareSplit ─────────
type Side = { title: string; titleEn?: string; icon: string; color?: string; items: string[]; at?: string };
export const CompareSplitV2: React.FC<{ left: Side; right: Side; footer?: string; footerAt?: string }> = ({ left, right, footer, footerAt }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const sides = [left, right];
  const starts = firstEarly(sides.map((s, i) => cueIn(c, s.at, i * 10)));
  const cued = sides.map((s) => hasCue(c, s.at));
  return (
    <div style={{ width: 952 }}>
      <div style={{ display: "flex", gap: 24 }}>
        {sides.map((s, i) => {
          const fo = focusLevel(f, c, starts, cued, i);
          const pun = cued[i] ? bump(f, cueAt(c, s.at, 0), 0.03) : 1;
          return (
            <CardV2 key={i} topBar={s.color} style={{ ...reveal(f, starts[i], fo), flex: 1, padding: "30px 30px 26px", display: "flex", flexDirection: "column", alignItems: "center", transform: `${reveal(f, starts[i]).transform} scale(${pun})` }}>
              <IconV2 name={s.icon} color={s.color} size={104} draw={drawIn(f, starts[i])} />
              <div style={{ ...zh(52, T.weight.title, accentV2(s.color).text), marginTop: 8 }}>{s.title}</div>
              {s.titleEn && <div style={EN}>{s.titleEn}</div>}
              <div style={{ marginTop: 16, alignSelf: "stretch" }}>
                {s.items.map((it, k) => (
                  <div key={k} style={{ ...reveal(f, starts[i] + 4 + k * STAGGER, 1, 12), ...zh(34), padding: "12px 0", borderTop: k ? `2px dashed ${T.divider}` : "none" }}>{it}</div>
                ))}
              </div>
            </CardV2>
          );
        })}
      </div>
      {footer && <NoteBoxV2 style={{ ...reveal(f, cueIn(c, footerAt, 40) + (footerAt ? 10 : 0), 1, 12), marginTop: 26 }}>{footer}</NoteBoxV2>}
    </div>
  );
};

// ───────── FlowRow ─────────
type Step = { icon: string; label: string; note?: string; color?: string; at?: string };
export const FlowRowV2: React.FC<{ title?: string; steps: Step[] }> = ({ title, steps }) => {
  const f = useCurrentFrame();
  const c = useCue();
  // 沒有 cue 的步驟：在第一個有 cue 的步驟之前依序出現（固定延遲）
  let fixed = 6;
  const starts = steps.map((s) => { if (hasCue(c, s.at)) return cueIn(c, s.at, 0); const v = fixed; fixed += 12; return v; });
  starts.splice(0, starts.length, ...firstEarly(starts));
  for (let i = 1; i < starts.length; i++) starts[i] = Math.max(starts[i], starts[i - 1] + 6);
  const cued = steps.map((s) => hasCue(c, s.at));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 900 }}>
      {title && <div style={{ ...reveal(f, 0), ...zh(52, T.weight.title), marginBottom: 20 }}>{title}</div>}
      {steps.map((s, i) => {
        const fo = focusLevel(f, c, starts, cued, i);
        const pun = cued[i] ? bump(f, cueAt(c, s.at, 0), 0.03) : 1;
        const r = reveal(f, starts[i], fo);
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <svg width={60} height={58} style={{ overflow: "visible" }}>
                <path d="M30 4v40M16 32l14 16 14-16" fill="none" stroke={T.rule} strokeWidth={5} strokeLinecap="square" strokeLinejoin="miter" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - tween(f, starts[i] - 6, DUR.m, EASE.enter)} />
              </svg>
            )}
            <CardV2 topBar={undefined} style={{ ...r, transform: `${r.transform} scale(${pun})`, width: "100%", padding: "20px 30px", display: "flex", alignItems: "center", gap: 26, borderLeft: `10px solid ${accentV2(s.color).fill}` }}>
              <IconV2 name={s.icon} color={s.color} size={92} draw={drawIn(f, starts[i])} />
              <div>
                <div style={zh(46, T.weight.title)}>{s.label}</div>
                {s.note && <div style={{ ...zh(32, T.weight.body, T.text2), marginTop: 4 }}>{s.note}</div>}
              </div>
            </CardV2>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ───────── ImpactCard ─────────
type Row = { status: "fact" | "expected" | "pending"; text: string; at?: string };
export const ImpactCardV2: React.FC<{ icon: string; title: string; titleEn?: string; color?: string; rows: Row[]; taiwan?: string; taiwanAt?: string }> = ({ icon, title, titleEn, color, rows, taiwan, taiwanAt }) => {
  const f = useCurrentFrame();
  const c = useCue();
  let fixed = 14;
  const starts = rows.map((r, i) => { if (hasCue(c, r.at)) return cueIn(c, r.at, 0) + (i > 0 && rows[i - 1].at === r.at ? STAGGER * 3 : 0); const v = fixed; fixed += 10; return v; });
  const cued = rows.map((r) => hasCue(c, r.at));
  return (
    <CardV2 topBar={color} style={{ ...reveal(f, 0), width: 952, padding: "36px 44px 36px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, paddingBottom: 20, borderBottom: `${T.ruleW}px solid ${T.rule}` }}>
        <IconV2 name={icon} color={color} size={92} draw={drawIn(f, 0)} />
        <div>
          <div style={zh(56, T.weight.title)}>{title}</div>
          {titleEn && <div style={EN}>{titleEn}</div>}
        </div>
      </div>
      {rows.map((r, i) => {
        const fo = focusLevel(f, c, starts, cued, i);
        return (
          <div key={i} style={{ ...reveal(f, starts[i], fo, 16), display: "flex", gap: 22, alignItems: "flex-start", padding: "20px 0", borderTop: i ? `2px dashed ${T.divider}` : "none" }}>
            <span style={{ transform: `scale(${cued[i] ? bump(f, cueAt(c, r.at, 0), 0.06) : 1})` }}><StatusTagV2 status={r.status} /></span>
            <div style={{ ...zh(34), paddingTop: 4 }}>{r.text}</div>
          </div>
        );
      })}
      {taiwan && <NoteBoxV2 style={{ ...reveal(f, cueIn(c, taiwanAt, fixed) + (taiwanAt ? 12 : 0), 1, 12), marginTop: 12, fontSize: 30 }}>{taiwan}</NoteBoxV2>}
    </CardV2>
  );
};

// ───────── IconGrid ─────────
type Item = { icon: string; label: string; note?: string; color?: string; at?: string };
export const IconGridV2: React.FC<{ title?: string; items: Item[]; columns?: number }> = ({ title, items, columns = 2 }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const starts = firstEarly(items.map((it, i) => cueIn(c, it.at, 8 + i * 7)));
  const cued = items.map((it) => hasCue(c, it.at));
  return (
    <div style={{ width: 952 }}>
      {title && <div style={{ ...reveal(f, 0), ...zh(54, T.weight.title), textAlign: "center", marginBottom: 26 }}>{title}</div>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 22 }}>
        {items.map((it, i) => (
          <CardV2 key={i} topBar={it.color} style={{ ...reveal(f, starts[i], focusLevel(f, c, starts, cued, i)), padding: 24, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <IconV2 name={it.icon} color={it.color} size={92} draw={drawIn(f, starts[i])} />
            <div style={{ ...zh(40, T.weight.title, accentV2(it.color).text), marginTop: 8 }}>{it.label}</div>
            {it.note && <div style={{ ...zh(30, T.weight.body, T.text2), marginTop: 4, lineHeight: 1.35 }}>{it.note}</div>}
          </CardV2>
        ))}
      </div>
    </div>
  );
};

// ───────── TermCard ─────────
export const TermCardV2: React.FC<{ icon: string; term: string; termEn?: string; definition: string; points?: (string | { text: string; at?: string })[]; color?: string; defAt?: string }> = ({ icon, term, termEn, definition, points = [], color, defAt }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const d0 = cueIn(c, defAt, 18);
  const n = typeChars(f, d0, definition.length);
  return (
    <CardV2 topBar={color} style={{ ...reveal(f, 0), width: 900 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        <IconV2 name={icon} color={color} size={120} draw={drawIn(f, 0)} />
        <div>
          <div style={zh(66, T.weight.title, accentV2(color).text)}>{term}</div>
          {termEn && <div style={{ ...EN, fontSize: 28 }}>{termEn}</div>}
        </div>
      </div>
      <div style={{ ...zh(42), lineHeight: 1.5, marginTop: 24 }}>
        {definition.slice(0, n)}<span style={{ opacity: 0 }}>{definition.slice(n)}</span>
      </div>
      {points.map((p, i) => {
        const pt = typeof p === "string" ? { text: p } : p;
        return <div key={i} style={{ ...reveal(f, cueIn(c, pt.at, d0 + 30 + i * 8), 1, 12), ...zh(36, T.weight.body, T.text2), marginTop: 12 }}><span style={{ color: accentV2(color).fill }}>■ </span>{pt.text}</div>;
      })}
    </CardV2>
  );
};

/** 字型：英數用 Inter（給 CtaCard／EndCard 共用） */
export const enFont = FONT_EN;
