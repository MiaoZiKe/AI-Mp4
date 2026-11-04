import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon } from "../components/Icons";
import { K, FONT_ZH, FONT_EN, FPS, glow, type Status } from "./theme";
import { Card, Pill, ease, pop, rise, sp } from "./parts";

const col = (c?: string) => (K as Record<string, string>)[c ?? "cyan"] ?? c ?? K.cyan;

// ============ 1. 鉤子：前 3 秒字幕切換 2–3 次，最後停在大問題 ============
type Beat = { t: number; text: string; color?: string; size?: number };
export const Hook: React.FC<{ beats: Beat[]; question: string[]; chips: { icon: string; text: string; color?: string }[] }> = ({ beats, question, chips }) => {
  const f = useCurrentFrame();
  const sec = f / FPS;
  const qStart = Math.round((beats[beats.length - 1].t + 0.9) * FPS);
  const cur = [...beats].reverse().find((b) => sec >= b.t);
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", fontFamily: FONT_ZH }}>
      {f < qStart && cur && (() => {
        const d = Math.round(cur.t * FPS);
        const shake = f - d < 6 ? Math.sin((f - d) * 3) * 6 : 0;
        return (
          <div key={cur.t} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div style={{ ...pop(f, d), fontWeight: 900, fontSize: cur.size ?? 150, lineHeight: 1.15, color: col(cur.color), filter: glow(col(cur.color), 14), transform: `${pop(f, d).transform} translateX(${shake}px)`, whiteSpace: "pre-line" }}>{cur.text}</div>
          </div>
        );
      })()}
      {f >= qStart && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 10 }}>
          {question.map((q, i) => (
            <div key={i} style={{ ...pop(f, qStart + i * 5), fontWeight: 900, fontSize: i === 1 ? 128 : 92, lineHeight: 1.18, color: i === 1 ? K.amber : K.text, filter: i === 1 ? glow(K.amber, 12) : undefined }}>{q}</div>
          ))}
          <div style={{ display: "flex", gap: 22, marginTop: 56 }}>
            {chips.map((c, i) => (
              <div key={i} style={{ ...pop(f, qStart + 14 + i * 5), display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 190, padding: "18px 0", borderRadius: 20, background: K.card, border: `1.5px solid ${col(c.color)}`, boxShadow: `0 0 18px ${col(c.color)}44` }}>
                <Icon name={c.icon} color={col(c.color)} size={88} draw={ease(f, qStart + 14 + i * 5, qStart + 34 + i * 5)} />
                <span style={{ fontWeight: 900, fontSize: 40, color: col(c.color) }}>{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============ 2. 反差：A 沒變 vs B 變了 + 開放迴圈預告 ============
type Side = { icon: string; title: string; state: string; color?: string; changed?: boolean };
export const Twist: React.FC<{ left: Side; right: Side; teaser: string }> = ({ left, right, teaser }) => {
  const f = useCurrentFrame();
  const tile = (s: Side, d: number) => {
    const c = col(s.color);
    const stamp = sp(f, d + 22, 9);
    return (
      <Card color={c} style={{ ...rise(f, d), width: 430, height: 560, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, position: "relative" }}>
        <Icon name={s.icon} color={c} size={190} draw={ease(f, d, d + 26)} />
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 70, color: K.text }}>{s.title}</div>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 58, color: s.changed ? K.ink : c, background: s.changed ? c : "transparent", border: `3px solid ${c}`, borderRadius: 14, padding: "4px 22px", opacity: stamp, transform: `scale(${1.6 - 0.6 * stamp}) rotate(${s.changed ? -6 : 0}deg)` }}>{s.state}</div>
      </Card>
    );
  };
  const tz = ease(f, 52, 62);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 46 }}>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {tile(left, 0)}
        <div style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: 60, color: K.dim, opacity: ease(f, 18, 26) }}>vs</div>
        {tile(right, 12)}
      </div>
      <div style={{ opacity: tz, transform: `translateY(${(1 - tz) * 30}px)`, fontFamily: FONT_ZH, fontWeight: 900, fontSize: 46, color: K.amber, border: `2px dashed ${K.amber}`, borderRadius: 18, padding: "16px 30px", boxShadow: `0 0 ${12 + 8 * Math.sin(f / 5)}px ${K.amber}55` }}>{teaser}</div>
    </div>
  );
};

// ============ 3. 名詞卡 ============
export const Term: React.FC<{ icon: string; term: string; en: string; def: string; facts: { k: string; v: string }[]; color?: string }> = ({ icon, term, en, def, facts, color }) => {
  const f = useCurrentFrame();
  const c = col(color);
  const typed = Math.floor(ease(f, 16, 16 + def.length * 1.4) * def.length);
  return (
    <Card color={c} style={{ ...rise(f, 0), width: 900, padding: "44px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <Icon name={icon} color={c} size={150} draw={ease(f, 0, 24)} />
        <div>
          <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 84, color: K.text }}>{term}</div>
          <div style={{ fontFamily: FONT_EN, fontSize: 32, color: K.dim }}>{en}</div>
        </div>
      </div>
      <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 46, lineHeight: 1.45, color: c, marginTop: 30, minHeight: 134 }}>
        {def.slice(0, typed)}<span style={{ opacity: typed < def.length && f % 16 < 8 ? 1 : 0 }}>▍</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${facts.length}, 1fr)`, gap: 18, marginTop: 26 }}>
        {facts.map((x, i) => (
          <div key={i} style={{ ...pop(f, 40 + i * 8), textAlign: "center", borderRadius: 16, background: "rgba(255,255,255,0.05)", padding: "18px 8px" }}>
            <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 50, color: K.amber }}>{x.v}</div>
            <div style={{ fontFamily: FONT_ZH, fontSize: 28, color: K.dim, marginTop: 4 }}>{x.k}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ============ 4. 席次條（低飽和並列 + 文字標示 + 過半門檻線 + 數字遞增） ============
type Seg = { label: string; seats: number; color: "dem" | "rep" | "pending" };
type Chamber = { name: string; en: string; total: number; majority: number; segments: Seg[]; status: Status; statusText?: string; note?: string };
const BAR = 820;
export const Seats: React.FC<{ chambers: Chamber[]; headline?: string }> = ({ chambers, headline }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30, width: 900 }}>
      {headline && <div style={{ ...rise(f, 0), fontFamily: FONT_ZH, fontWeight: 900, fontSize: 64, color: K.text, textAlign: "center" }}>{headline}</div>}
      {chambers.map((ch, ci) => {
        const d = 8 + ci * 26;
        const p = 1 - Math.pow(1 - ease(f, d + 8, d + 48), 3);
        let x = 0;
        const mx = (ch.majority / ch.total) * BAR;
        return (
          <Card key={ci} color={K.violet} style={{ ...rise(f, d), padding: "26px 40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><span style={{ fontFamily: FONT_ZH, fontSize: 52, fontWeight: 900, color: K.text }}>{ch.name}</span><span style={{ fontFamily: FONT_EN, fontSize: 26, color: K.dim, marginLeft: 12 }}>{ch.en}</span></div>
              <Pill status={ch.status} text={ch.statusText} size={26} />
            </div>
            <div style={{ position: "relative", width: BAR, height: 62, marginTop: 56, borderRadius: 12, background: "rgba(255,255,255,0.06)" }}>
              {ch.segments.map((s, i) => {
                const w = (s.seats / ch.total) * BAR; const left = x; x += w;
                return <div key={i} style={{ position: "absolute", left: left * p, top: 0, height: 62, width: Math.max(0, w * p - 3), background: K[s.color], borderRadius: 10 }} />;
              })}
              <div style={{ position: "absolute", left: mx - 2, top: -14, height: 90, borderLeft: `4px dashed ${K.amber}`, opacity: ease(f, d + 34, d + 44) }} />
              <div style={{ position: "absolute", left: mx - 130, width: 260, textAlign: "center", top: -50, fontFamily: FONT_ZH, fontWeight: 700, fontSize: 26, color: K.amber, opacity: ease(f, d + 34, d + 44) }}>過半門檻 {ch.majority}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              {ch.segments.map((s, i) => (
                <div key={i} style={{ fontFamily: FONT_ZH, fontSize: 30, color: "rgba(255,255,255,0.9)" }}>
                  <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 4, background: K[s.color], marginRight: 8 }} />
                  {s.label} <b style={{ fontFamily: FONT_EN, fontSize: 42, color: K.text }}>{Math.round(s.seats * p)}</b>
                </div>
              ))}
            </div>
            {ch.note && <div style={{ fontFamily: FONT_ZH, fontSize: 25, color: K.dim, marginTop: 10 }}>{ch.note}</div>}
          </Card>
        );
      })}
    </div>
  );
};

// ============ 5. 對峙：白宮 vs 國會（分裂政府） ============
export const Standoff: React.FC<{ left: { icon: string; title: string; sub: string }; right: { icon: string; title: string; sub: string }; arrows: { text: string; dir: "lr" | "rl" }[]; term: string; termDef: string }> = ({ left, right, arrows, term, termDef }) => {
  const f = useCurrentFrame();
  const node = (s: { icon: string; title: string; sub: string }, d: number, c: string) => (
    <div style={{ ...rise(f, d), display: "flex", flexDirection: "column", alignItems: "center", width: 300 }}>
      <Icon name={s.icon} color={c} size={190} draw={ease(f, d, d + 24)} />
      <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 54, color: K.text, marginTop: 6 }}>{s.title}</div>
      <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 32, color: c, marginTop: 4 }}>{s.sub}</div>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {node(left, 0, K.amber)}
        <div style={{ display: "flex", flexDirection: "column", gap: 26, width: 260 }}>
          {arrows.map((a, i) => {
            const d = 24 + i * 14, p = ease(f, d, d + 16);
            return (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 28, color: K.text, opacity: p }}>{a.text}</div>
                <svg width={240} height={30} style={{ overflow: "visible", filter: glow(K.cyan, 6) }}>
                  <path d={a.dir === "lr" ? "M10 15 H220 M206 4 L222 15 L206 26" : "M230 15 H20 M34 4 L18 15 L34 26"} fill="none" stroke={K.cyan} strokeWidth={3} strokeLinecap="round" strokeDasharray={260} strokeDashoffset={260 * (1 - p)} />
                </svg>
              </div>
            );
          })}
        </div>
        {node(right, 10, K.violet)}
      </div>
      <Card color={K.cyan} style={{ ...rise(f, 56), width: 860, textAlign: "center" }}>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 60, color: K.cyan }}>{term}</div>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 38, color: K.text, marginTop: 10, lineHeight: 1.4 }}>{termDef}</div>
      </Card>
    </div>
  );
};

// ============ 6. 影響卡（章節 1/3、2/3、3/3） ============
type Row = { text: string; status: Status; note?: string };
export const Impact: React.FC<{ icon: string; title: string; en: string; color?: string; rows: Row[]; big?: { v: string; k: string } }> = ({ icon, title, en, color, rows, big }) => {
  const f = useCurrentFrame();
  const c = col(color);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: 900 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, ...rise(f, 0) }}>
        <div style={{ transform: `scale(${0.8 + 0.2 * sp(f, 0)})` }}><Icon name={icon} color={c} size={130} draw={ease(f, 0, 26)} /></div>
        <div>
          <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 72, color: K.text, lineHeight: 1.1 }}>{title}</div>
          <div style={{ fontFamily: FONT_EN, fontSize: 30, color: K.dim, marginTop: 6 }}>{en}</div>
        </div>
        {big && (
          <div style={{ ...pop(f, 14), textAlign: "center", marginLeft: 10 }}>
            <div style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: 86, color: K.amber, filter: glow(K.amber, 10), lineHeight: 1 }}>{big.v}</div>
            <div style={{ fontFamily: FONT_ZH, fontSize: 26, color: K.dim, marginTop: 6 }}>{big.k}</div>
          </div>
        )}
      </div>
      {rows.map((r, i) => (
        <Card key={i} color={c} style={{ ...rise(f, 18 + i * 14), width: "100%", padding: "16px 28px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div><Pill status={r.status} size={26} /></div>
          <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 38, lineHeight: 1.36, color: K.text }}>{r.text}</div>
          {r.note && <div style={{ fontFamily: FONT_ZH, fontSize: 26, color: K.dim }}>{r.note}</div>}
        </Card>
      ))}
    </div>
  );
};

// ============ 7. 時間軸：接下來要盯的日期 ============
type Ev = { date: string; text: string; status: Status };
export const Timeline: React.FC<{ title: string; events: Ev[] }> = ({ title, events }) => {
  const f = useCurrentFrame();
  const lineP = ease(f, 6, 6 + events.length * 14);
  return (
    <div style={{ width: 900 }}>
      <div style={{ ...rise(f, 0), display: "flex", alignItems: "center", gap: 18, justifyContent: "center", marginBottom: 30 }}>
        <Icon name="calendar" color={K.cyan} size={100} draw={ease(f, 0, 22)} />
        <span style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 68, color: K.text }}>{title}</span>
      </div>
      <div style={{ position: "relative", paddingLeft: 70 }}>
        <div style={{ position: "absolute", left: 26, top: 20, width: 4, height: `calc(${lineP * 100}% - 40px)`, background: `linear-gradient(${K.cyan}, ${K.violet})`, boxShadow: `0 0 10px ${K.cyan}` }} />
        {events.map((e, i) => {
          const d = 10 + i * 14;
          return (
            <div key={i} style={{ ...rise(f, d, 30), position: "relative", marginBottom: 26 }}>
              <div style={{ position: "absolute", left: -56, top: 22, width: 26, height: 26, borderRadius: 99, background: K.ink, border: `4px solid ${K.cyan}`, boxShadow: `0 0 10px ${K.cyan}` }} />
              <Card color={K.violet} style={{ padding: "18px 26px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: 40, color: K.amber }}>{e.date}</span>
                  <Pill status={e.status} size={24} />
                </div>
                <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 38, color: K.text, marginTop: 6, lineHeight: 1.35 }}>{e.text}</div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ 8. 回扣：重提開頭的問題 → 三個答案 ============
export const Recap: React.FC<{ question: string; answers: { icon: string; text: string; color?: string }[] }> = ({ question, answers }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, width: 900 }}>
      <div style={{ ...rise(f, 0), fontFamily: FONT_ZH, fontWeight: 900, fontSize: 56, color: K.dim, textAlign: "center", lineHeight: 1.3, whiteSpace: "pre-line" }}>{question}</div>
      <div style={{ ...pop(f, 12), fontFamily: FONT_ZH, fontWeight: 900, fontSize: 96, color: K.amber, filter: glow(K.amber, 12) }}>答案是：</div>
      {answers.map((a, i) => (
        <Card key={i} color={col(a.color)} style={{ ...rise(f, 24 + i * 12), width: "100%", display: "flex", alignItems: "center", gap: 26, padding: "18px 30px" }}>
          <Icon name={a.icon} color={col(a.color)} size={96} draw={ease(f, 24 + i * 12, 44 + i * 12)} />
          <span style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 46, color: K.text, lineHeight: 1.3 }}>{a.text}</span>
        </Card>
      ))}
    </div>
  );
};

// ============ 9. 片尾：留言提問 CTA + slogan ============
export const End: React.FC<{ ask: string; options: string[]; slogan: string }> = ({ ask, options, slogan }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pulse = 1 + 0.03 * Math.sin(f / 5);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34, width: 900, textAlign: "center" }}>
      <div style={{ ...rise(f, 0), fontFamily: FONT_ZH, fontWeight: 900, fontSize: 64, color: K.text, lineHeight: 1.3, whiteSpace: "pre-line" }}>{ask}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 760 }}>
        {options.map((o, i) => (
          <div key={i} style={{ ...rise(f, 12 + i * 8), fontFamily: FONT_ZH, fontWeight: 700, fontSize: 44, color: K.cyan, border: `1.5px solid ${K.cyan}`, borderRadius: 18, padding: "14px 0", background: `${K.cyan}12` }}>{o}</div>
        ))}
      </div>
      <div style={{ marginTop: 40, opacity: ease(f, 44, 56), display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <svg width={170} height={170} viewBox="0 0 64 64" style={{ filter: glow(K.cyan, 12), transform: `rotate(${interpolate(f, [0, durationInFrames], [0, 30])}deg)` }}>
          <circle cx="32" cy="32" r="26" fill="none" stroke={K.cyan} strokeWidth={2.4} />
          <ellipse cx="32" cy="32" rx="10" ry="26" fill="none" stroke={K.cyan} strokeWidth={2.4} />
          <path d="M6 32h52" stroke={K.amber} strokeWidth={2.4} />
        </svg>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 86, color: K.text, letterSpacing: 6 }}>白話國際</div>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 60, color: K.amber, filter: glow(K.amber, 10), transform: `scale(${pulse})` }}>{slogan}</div>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 36, color: K.dim, marginTop: 8 }}>追蹤我們，下一支講透另一件事</div>
      </div>
    </div>
  );
};

// ============ 10. 市場第一反應（只陳述事實，不給建議） ============
type Tile = { label: string; value: string; dir: "up" | "down"; note: string; status: Status };
export const Markets: React.FC<{ title: string; tiles: Tile[]; caveat: string }> = ({ title, tiles, caveat }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ width: 920, display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ ...rise(f, 0), display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <Icon name="chart" color={K.cyan} size={96} draw={ease(f, 0, 22)} />
        <span style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 66, color: K.text }}>{title}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {tiles.map((t, i) => {
          const c = t.dir === "up" ? K.cyan : K.coral;
          return (
            <Card key={i} color={c} style={{ ...pop(f, 12 + i * 8), padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 40, color: K.text }}>{t.label}</span>
                <svg width={44} height={44} viewBox="0 0 40 40" style={{ filter: glow(c, 6) }}>
                  <path d={t.dir === "up" ? "M20 6 L34 26 H6 Z" : "M20 34 L34 14 H6 Z"} fill={c} />
                </svg>
              </div>
              <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 46, color: c, marginTop: 8 }}>{t.value}</div>
              <div style={{ fontFamily: FONT_ZH, fontSize: 25, color: K.dim, marginTop: 6, lineHeight: 1.35 }}>{t.note}</div>
              <div style={{ marginTop: 10 }}><Pill status={t.status} size={22} /></div>
            </Card>
          );
        })}
      </div>
      <div style={{ ...rise(f, 50), fontFamily: FONT_ZH, fontWeight: 700, fontSize: 30, color: K.amber, textAlign: "center", lineHeight: 1.4, whiteSpace: "pre-line" }}>{caveat}</div>
    </div>
  );
};
