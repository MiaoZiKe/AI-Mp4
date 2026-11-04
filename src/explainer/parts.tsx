import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { K, FONT_ZH, FONT_EN, FPS, SAFE2, glow, STATUS, type Status } from "./theme";

// ---------- 動畫工具 ----------
export const sp = (f: number, delay = 0, damping = 14) =>
  spring({ frame: f - delay, fps: FPS, config: { damping, mass: 0.7, stiffness: 140 } });
export const ease = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
/** 淡入 + 上移 */
export const rise = (f: number, delay = 0, dist = 50) => {
  const s = spring({ frame: f - delay, fps: FPS, config: { damping: 200, mass: 0.8 } });
  return { opacity: s, transform: `translateY(${(1 - s) * dist}px)` } as const;
};
/** 彈出（pop）：0.6 → 1.0 帶一點回彈 */
export const pop = (f: number, delay = 0) => {
  const s = sp(f, delay, 11);
  return { opacity: Math.min(1, s * 1.6), transform: `scale(${0.6 + 0.4 * s})` } as const;
};
export const seeded = (seed: number) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

// ---------- 背景 ----------
const rnd = seeded(20261103);
const DOTS = Array.from({ length: 36 }, () => ({ x: rnd() * 1080, y: rnd() * 1920, r: 1 + rnd() * 2.2, p: rnd() * 6, v: 0.2 + rnd() * 0.5 }));

/** 深墨藍底 + 6% 細格線 + 緩慢漂移的光暈（顏色跟著每幕主色）+ 暗角 */
export const Stage: React.FC<{ tint?: string }> = ({ tint = K.violet }) => {
  const f = useCurrentFrame();
  const gx = 50 + 8 * Math.sin(f / 90), gy = 44 + 6 * Math.cos(f / 110);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${K.ink} 0%, ${K.ink2} 55%, ${K.ink} 100%)` }}>
      <AbsoluteFill style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "60px 60px", backgroundPosition: `0 ${(f * 0.4) % 60}px`,
      }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 65% 38% at ${gx}% ${gy}%, ${tint}38, ${tint}10 55%, transparent 75%)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={(d.y - f * d.v + 1920) % 1920} r={d.r} fill="#fff" opacity={0.12 + 0.12 * Math.sin(f / 18 + d.p)} />
        ))}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 50%, transparent 60%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------- 頂部：品牌 + 章節進度 ----------
export const TopBar: React.FC<{ chapter?: { i: number; n: number; label: string } | null; progress: number }> = ({ chapter, progress }) => (
  <div style={{ position: "absolute", top: SAFE2.top - 4, left: SAFE2.left, right: SAFE2.left, fontFamily: FONT_ZH }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <svg width={56} height={56} viewBox="0 0 64 64" style={{ filter: glow(K.cyan, 8) }}>
          <circle cx="32" cy="32" r="26" fill="none" stroke={K.cyan} strokeWidth={3} />
          <ellipse cx="32" cy="32" rx="10" ry="26" fill="none" stroke={K.cyan} strokeWidth={3} />
          <path d="M6 32h52" stroke={K.amber} strokeWidth={3} />
        </svg>
        <span style={{ color: K.text, fontSize: 38, fontWeight: 900, letterSpacing: 2 }}>白話國際</span>
      </div>
      <div style={{ border: `1.5px solid ${K.amber}`, color: K.amber, borderRadius: 999, padding: "8px 24px", fontSize: 28, fontWeight: 700, boxShadow: `0 0 14px ${K.amber}44` }}>國際白話講</div>
    </div>
    {/* 全片進度條 */}
    <div style={{ marginTop: 18, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.10)", overflow: "hidden" }}>
      <div style={{ width: `${progress * 100}%`, height: "100%", background: `linear-gradient(90deg, ${K.cyan}, ${K.violet})`, boxShadow: `0 0 10px ${K.cyan}` }} />
    </div>
    {chapter && (
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: 30, color: K.ink, background: K.amber, borderRadius: 10, padding: "2px 14px" }}>{chapter.i}/{chapter.n}</span>
        <span style={{ fontSize: 30, fontWeight: 700, color: K.amber }}>{chapter.label}</span>
        <div style={{ display: "flex", gap: 8, marginLeft: 6 }}>
          {Array.from({ length: chapter.n }, (_, k) => (
            <div key={k} style={{ width: 46, height: 8, borderRadius: 4, background: k < chapter.i ? K.amber : "rgba(255,255,255,0.18)" }} />
          ))}
        </div>
      </div>
    )}
  </div>
);

// ---------- 狀態標籤 ----------
export const Pill: React.FC<{ status: Status; text?: string; size?: number }> = ({ status, text, size = 28 }) => {
  const s = STATUS[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: FONT_ZH, fontWeight: 700, fontSize: size, color: s.color, border: `1.5px solid ${s.color}`, background: `${s.color}1a`, borderRadius: 999, padding: "6px 18px", whiteSpace: "nowrap" }}>
      <span style={{ width: size * 0.42, height: size * 0.42, borderRadius: 99, background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
      {text ?? s.label}
    </span>
  );
};

// ---------- 卡片 ----------
export const Card: React.FC<{ color?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ color = K.cyan, style, children }) => (
  <div style={{ background: K.card, borderRadius: 20, border: `1.5px solid ${color}`, boxShadow: `0 0 22px ${color}40, inset 0 0 16px ${color}18`, padding: "28px 34px", ...style }}>{children}</div>
);

// ---------- 字幕（逐句彈入、關鍵詞上色並加底線掃光） ----------
const KW_COLORS = [K.amber, K.cyan, K.coral, K.violet];

const splitLines = (zh: string) => {
  if (zh.includes("\n")) return zh.split("\n");
  if (zh.length <= 14) return [zh];
  const mid = zh.length / 2;
  let best = -1;
  for (let i = 0; i < zh.length - 1; i++) if ("，；：、？".includes(zh[i]) && (best < 0 || Math.abs(i + 1 - mid) < Math.abs(best - mid))) best = i + 1;
  return best > 0 ? [zh.slice(0, best), zh.slice(best)] : [zh];
};

const Highlighted: React.FC<{ text: string; keywords: string[]; f: number; delay: number }> = ({ text, keywords, f, delay }) => {
  if (!keywords.length) return <>{text}</>;
  const esc = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${esc.join("|")})`, "g"));
  return (
    <>
      {parts.map((p, i) => {
        const k = keywords.indexOf(p);
        if (k < 0) return <span key={i}>{p}</span>;
        const c = KW_COLORS[k % KW_COLORS.length];
        const u = ease(f, delay + 6, delay + 16);
        return (
          <span key={i} style={{ color: c, whiteSpace: "nowrap", position: "relative", display: "inline-block" }}>
            {p}
            <span style={{ position: "absolute", left: 0, bottom: 2, height: 8, width: `${u * 100}%`, background: c, opacity: 0.35, borderRadius: 4 }} />
          </span>
        );
      })}
    </>
  );
};

export const Caption: React.FC<{ zh: string; en: string; keywords: string[] }> = ({ zh, en, keywords }) => {
  const f = useCurrentFrame();
  const lines = splitLines(zh);
  return (
    <div style={{ position: "absolute", left: SAFE2.left, right: SAFE2.right, bottom: SAFE2.bottom + 20, textAlign: "center" }}>
      <div style={{ display: "inline-block", padding: "18px 26px 20px", borderRadius: 22, background: "rgba(5,8,20,0.55)", backdropFilter: "blur(6px)" }}>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 64, lineHeight: 1.28, color: K.text, textShadow: "0 4px 18px rgba(0,0,0,0.85)" }}>
          {lines.map((line, i) => (
            <div key={i} style={rise(f, 3 + i * 9, 26)}><Highlighted text={line} keywords={keywords} f={f} delay={3 + i * 9} /></div>
          ))}
        </div>
        <div style={{ fontFamily: FONT_EN, fontSize: 28, lineHeight: 1.35, color: "rgba(255,255,255,0.7)", marginTop: 10, ...rise(f, 10 + lines.length * 6, 14) }}>{en}</div>
      </div>
    </div>
  );
};

export const SourceLine: React.FC<{ sources: string[]; asOf: string }> = ({ sources, asOf }) => (
  <div style={{ position: "absolute", left: SAFE2.left, right: SAFE2.right, bottom: SAFE2.bottom - 52, textAlign: "center", fontFamily: FONT_ZH, fontSize: 22, color: "rgba(255,255,255,0.45)" }}>
    {sources.length ? `資料來源：${sources.join("、")}｜截至 ${asOf}` : `資料截至 ${asOf}`}
  </div>
);
