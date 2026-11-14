// 3D 產品台的固定層（HTML）：頁首（頻道名＋標籤＋進度條）、字幕卡、出處。時間讀 timeline（和 v3 同一套字幕短語）。顏色只讀 THEME_3D。
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_EN, FONT_ZH, LAYOUT_3D as L, THEME_3D as T, accent3D } from "../../theme";
import { EASE, tween } from "../anim";
import { splitParts } from "../Subtitle";
import type { PhraseCue } from "../v2/Tracks";

const display = (p: string) => p.replace(/\n/g, "").replace(/[，、；：。]+$/, "");
const enSplit = (en: string) => String(en ?? "").split("|").map((x) => x.trim()).filter(Boolean);

export const Header3D: React.FC<{ name: string; tag: string; total: number }> = ({ name, tag, total }) => {
  const f = useCurrentFrame();
  const a = accent3D("amber");
  return (
    <>
      <div style={{ position: "absolute", left: L.X, right: L.X, top: L.HEADER_TOP, height: L.HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: FONT_ZH }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* 標誌：一個等距的小方塊（三個面） */}
          <svg width={52} height={52} viewBox="0 0 52 52">
            <path d="M26 4 L46 15 L26 26 L6 15 Z" fill={a.fill} />
            <path d="M6 15 L26 26 L26 48 L6 37 Z" fill={T.ink} />
            <path d="M46 15 L26 26 L26 48 L46 37 Z" fill={T.ink2} />
          </svg>
          <div style={{ fontWeight: T.weight.zh, fontSize: 40, color: T.ink, letterSpacing: "0.04em" }}>{name}</div>
        </div>
        <div style={{ fontWeight: T.weight.body, fontSize: 26, color: T.panel, background: T.ink, borderRadius: T.radius.pill, padding: "8px 24px", letterSpacing: "0.08em" }}>{tag}</div>
      </div>
      <div style={{ position: "absolute", left: L.X, top: L.PROGRESS_TOP, width: L.INNER_W, height: 4, borderRadius: 2, background: T.line }}>
        <div style={{ width: `${(100 * Math.min(1, f / Math.max(1, total - 1))).toFixed(2)}%`, height: 4, borderRadius: 2, background: a.fill }} />
      </div>
    </>
  );
};

/** 字幕卡：一次一段單行；關鍵詞念到時換成強調色並畫底線；英文跟著中文的句 */
export const Caption3D: React.FC<{ cues: PhraseCue[] }> = ({ cues }) => {
  const f = useCurrentFrame();
  const act = cues.filter((c) => c.phrases.length);
  if (!act.length) return null;
  const cue = [...act].reverse().find((c) => f >= c.window[0]) ?? act[0];
  const a = cue.window[0], ps = cue.phrases;
  const startOf = (k: number) => (k === 0 ? a : ps[k].start);
  let k = 0; for (let i = 0; i < ps.length; i++) if (f >= startOf(i)) k = i;
  const en = enSplit(cue.en);
  const enStart = (e: number) => (e === 0 ? a : ps[Math.ceil((e * ps.length) / en.length)]?.start ?? a);
  let e = 0; for (let i = 0; i < en.length; i++) if (f >= enStart(i)) e = i;
  const kwAt = Object.fromEntries(cue.keywords_at.map((x) => [x.text, x.start]));
  const p = a <= 0 && k === 0 ? 1 : tween(f, startOf(k), 5, EASE.enter);
  const colors = ["coral", "blue", "amber", "mint"];
  return (
    <div style={{ position: "absolute", left: L.X, top: L.CAP_TOP, width: L.INNER_W, height: L.CAP_H, background: T.panel, border: `2px solid ${T.line}`, borderRadius: T.radius.card, boxShadow: T.cardShadow }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 28, height: 108, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_ZH, fontWeight: T.weight.zh, fontSize: L.CAP_ZH_PX, color: T.ink, letterSpacing: "0.02em", whiteSpace: "nowrap", transform: `translateY(${Math.round(8 * (1 - p))}px)` }}>
        <span>
          {splitParts(display(ps[k].text), cue.keywords).map((s, i) => {
            if (s.k < 0) return <span key={i}>{s.text}</span>;
            const q = kwAt[s.text] === undefined ? 1 : tween(f, kwAt[s.text] - 1, 8, EASE.move);
            const c = accent3D(colors[s.k % colors.length]);
            return (
              <span key={i} style={{ position: "relative", color: q > 0.5 ? c.text : T.ink }}>
                {s.text}
                <span style={{ position: "absolute", left: 0, bottom: -4, height: 8, width: `${(100 * q).toFixed(1)}%`, background: c.fill, borderRadius: 4 }} />
              </span>
            );
          })}
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 158, textAlign: "center", fontFamily: FONT_EN, fontWeight: T.weight.light, fontSize: L.CAP_EN_PX, color: T.ink2, whiteSpace: "nowrap" }}>{en[e]}</div>
    </div>
  );
};

/** 出處：字幕卡下方一行小字；相鄰幕相同就不重貼 */
export const Source3D: React.FC<{ cues: { sources: string[]; window: [number, number] }[]; px?: number }> = ({ cues, px }) => {
  const f = useCurrentFrame();
  const cur = cues.find((c) => c.sources?.length && f >= c.window[0] && f < c.window[1]);
  if (!cur) return null;
  const j = cur.sources.join("、");
  const first = cues.find((c) => c.sources?.join("、") === j) as { window: [number, number] };
  const p = tween(f, first.window[0], T.motion.in, EASE.enter);
  return (
    <div style={{ position: "absolute", left: L.X + 8, top: L.SRC_TOP, display: "flex", alignItems: "center", gap: 12, opacity: p, fontFamily: FONT_ZH, fontWeight: T.weight.light, fontSize: px ?? L.SRC_PX, color: T.ink2, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      <div style={{ width: 10, height: 10, borderRadius: T.radius.pill, background: T.ink3 }} />
      {/^(資料)?來源|示意/.test(j) ? j : `來源：${j}`}
    </div>
  );
};
