// styleVersion 2 卡片類元件：CompareSplit、FlowRow、ImpactCard、IconGrid、TermCard。
// v3：靜止態先完整排版——每一項最晚在第 10 幀起就以 dim（灰階＋淡）排上版，念到（cue）時才換成全彩 focus；
// 不再 scale 脈衝（bump），強調只用顏色；最後一個 cue 之後 release 全部恢復。
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_EN, FONT_ZH, THEME_V2 as T, accentV2 } from "../../theme";
import { DUR, EASE, STAGGER, tween, typeChars } from "../anim";
import { cueIn, firstEarly, focusLevel, hasCue, layoutStarts, useCue } from "../../cue";
import { CardV2, EN, IconV2, KwText, NoteBoxV2, StatusTagV2, drawIn, reveal } from "./base";

const zh = (size: number, weight: number = T.weight.body, color: string = T.text): React.CSSProperties => ({ fontFamily: FONT_ZH, fontSize: size, fontWeight: weight, color, lineHeight: 1.42 });

// ───────── CompareSplit ─────────
type Side = { title: string; titleEn?: string; icon: string; color?: string; items: string[]; at?: string };
export const CompareSplitV2: React.FC<{ left: Side; right: Side; footer?: string; footerAt?: string }> = ({ left, right, footer, footerAt }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const sides = [left, right];
  const starts = sides.map((s, i) => cueIn(c, s.at, i * 10));
  const lay = layoutStarts(starts, 6);
  const cued = sides.map((s) => hasCue(c, s.at));
  return (
    <div style={{ width: 952, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 24, flex: 1 }}>
        {sides.map((s, i) => {
          const fo = focusLevel(f, c, starts, cued, i, true);
          return (
            <CardV2 key={i} topBar={s.color} style={{ ...reveal(f, lay[i], fo), flex: 1, padding: "36px 30px 30px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly" }}>
              <IconV2 name={s.icon} color={s.color} size={150} draw={drawIn(f, starts[i])} />
              <div style={{ ...zh(60, T.weight.title, accentV2(s.color).text), marginTop: 8 }}>{s.title}</div>
              {s.titleEn && <div style={EN}>{s.titleEn}</div>}
              <div style={{ alignSelf: "stretch" }}>
                {s.items.map((it, k) => (
                  <div key={k} style={{ ...reveal(f, lay[i] + 4 + k * STAGGER, 1, 12), ...zh(40, 700), padding: "20px 0", borderTop: k ? `2px dashed ${T.divider}` : "none" }}><KwText text={it} /></div>
                ))}
              </div>
            </CardV2>
          );
        })}
      </div>
      {footer && <NoteBoxV2 style={{ ...reveal(f, cueIn(c, footerAt, 40) + (footerAt ? 10 : 0), 1, 12), marginTop: 26, fontSize: 38 }}><KwText text={footer} /></NoteBoxV2>}
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
  const lay = layoutStarts(starts, 5);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 952 }}>
      {title && <div style={{ ...reveal(f, 0), ...zh(58, T.weight.title), marginBottom: 16 }}><KwText text={title} /></div>}
      {steps.map((s, i) => {
        const fo = focusLevel(f, c, starts, cued, i, true);
        const r = reveal(f, lay[i], fo);
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <svg width={60} height={58} style={{ overflow: "visible" }}>
                <path d="M30 4v40M16 32l14 16 14-16" fill="none" stroke={T.rule} strokeWidth={5} strokeLinecap="square" strokeLinejoin="miter" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - tween(f, starts[i] - 6, DUR.m, EASE.enter)} />
              </svg>
            )}
            <CardV2 topBar={undefined} style={{ ...r, width: "100%", flex: 1, padding: "18px 34px", display: "flex", alignItems: "center", gap: 30, borderLeft: `10px solid ${accentV2(s.color).fill}` }}>
              <IconV2 name={s.icon} color={s.color} size={steps.length > 3 ? 104 : 128} draw={drawIn(f, starts[i])} />
              <div>
                <div style={zh(steps.length > 3 ? 50 : 56, T.weight.title)}><KwText text={s.label} /></div>
                {s.note && <div style={{ ...zh(steps.length > 3 ? 34 : 38, T.weight.body, T.text2), marginTop: 4 }}><KwText text={s.note} /></div>}
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
  const lay = layoutStarts(starts, 5);
  return (
    <CardV2 topBar={color} style={{ ...reveal(f, 0), width: 952, padding: "40px 48px 40px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, paddingBottom: 20, borderBottom: `${T.ruleW}px solid ${T.rule}` }}>
        <IconV2 name={icon} color={color} size={120} draw={drawIn(f, 0)} />
        <div>
          <div style={zh(64, T.weight.title)}><KwText text={title} /></div>
          {titleEn && <div style={EN}>{titleEn}</div>}
        </div>
      </div>
      {rows.map((r, i) => {
        const fo = focusLevel(f, c, starts, cued, i, true);
        return (
          <div key={i} style={{ ...reveal(f, lay[i], fo, 16), display: "flex", gap: 24, alignItems: "center", flex: 1, padding: "16px 0", borderTop: i ? `2px dashed ${T.divider}` : "none" }}>
            <span><StatusTagV2 status={r.status} size={32} /></span>
            <div style={{ ...zh(rows.length > 3 ? 38 : 44, 700) }}><KwText text={r.text} /></div>
          </div>
        );
      })}
      {taiwan && <NoteBoxV2 style={{ ...reveal(f, cueIn(c, taiwanAt, fixed) + (taiwanAt ? 12 : 0), 1, 12), marginTop: 12, fontSize: 36 }}><KwText text={taiwan} /></NoteBoxV2>}
    </CardV2>
  );
};

// ───────── IconGrid ─────────
type Item = { icon: string; label: string; note?: string; color?: string; at?: string };
export const IconGridV2: React.FC<{ title?: string; items: Item[]; columns?: number }> = ({ title, items, columns = 2 }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const starts = items.map((it, i) => cueIn(c, it.at, 8 + i * 7));
  const lay = layoutStarts(starts, 4);
  const cued = items.map((it) => hasCue(c, it.at));
  return (
    <div style={{ width: 952 }}>
      {title && <div style={{ ...reveal(f, 0), ...zh(54, T.weight.title), textAlign: "center", marginBottom: 26 }}><KwText text={title} /></div>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 22 }}>
        {items.map((it, i) => (
          <CardV2 key={i} topBar={it.color} style={{ ...reveal(f, lay[i], focusLevel(f, c, starts, cued, i, true)), padding: 24, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <IconV2 name={it.icon} color={it.color} size={92} draw={drawIn(f, starts[i])} />
            <div style={{ ...zh(40, T.weight.title, accentV2(it.color).text), marginTop: 8 }}><KwText text={it.label} /></div>
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
