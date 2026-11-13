// 仿介面動畫的固定層：頁首（頻道名＋標籤＋進度條）、字幕列、出處。時間讀 timeline（和 v3 同一套字幕短語）。
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_EN, FONT_ZH, LAYOUT_UI as L, THEME_UI as T, accentUI } from "../../theme";
import { EASE, tween } from "../anim";
import { splitParts } from "../Subtitle";
import type { PhraseCue } from "../v2/Tracks";

const display = (p: string) => p.replace(/\n/g, "").replace(/[，、；：。]+$/, "");
const enSplit = (en: string) => String(en ?? "").split("|").map((x) => x.trim()).filter(Boolean);

/** tagPx：右上標籤字級（第 2 版用 28；不給＝第 1 版的 26） */
export const HeaderUI: React.FC<{ name: string; tag: string; total: number; tagPx?: number }> = ({ name, tag, total, tagPx = 26 }) => {
  const f = useCurrentFrame();
  const a = accentUI("violet");
  return (
    <>
      <div style={{ position: "absolute", left: L.X, right: L.X, top: L.HEADER_TOP, height: L.HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: FONT_ZH }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: a.fill, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: T.bg }} />
          </div>
          <div style={{ fontWeight: T.weight.zh, fontSize: 40, color: T.text, letterSpacing: "0.04em" }}>{name}</div>
        </div>
        <div style={{ fontWeight: T.weight.body, fontSize: tagPx, color: a.text, background: a.soft, borderRadius: T.radius.pill, padding: "8px 24px", letterSpacing: "0.08em" }}>{tag}</div>
      </div>
      <div style={{ position: "absolute", left: L.X, top: L.PROGRESS_TOP, width: L.INNER_W, height: 4, borderRadius: 2, background: T.lineSoft }}>
        <div style={{ width: `${(100 * Math.min(1, f / Math.max(1, total - 1))).toFixed(2)}%`, height: 4, borderRadius: 2, background: a.fill }} />
      </div>
    </>
  );
};

/** 字幕列：一次一段單行；關鍵詞念到時換成強調色並畫底線；英文跟著中文的句 */
export const CaptionUI: React.FC<{ cues: PhraseCue[]; top?: number }> = ({ cues, top = L.CAP_TOP }) => {
  const f = useCurrentFrame();
  const act = cues.filter((c) => c.phrases.length);
  if (!act.length) return null;
  const cue = [...act].reverse().find((c) => f >= c.window[0]) ?? act[0];
  const [a, b] = cue.window, ps = cue.phrases;
  const startOf = (k: number) => (k === 0 ? a : ps[k].start);
  let k = 0; for (let i = 0; i < ps.length; i++) if (f >= startOf(i)) k = i;
  const en = enSplit(cue.en);
  const enStart = (e: number) => (e === 0 ? a : ps[Math.ceil((e * ps.length) / en.length)]?.start ?? a);
  let e = 0; for (let i = 0; i < en.length; i++) if (f >= enStart(i)) e = i;
  const kwAt = Object.fromEntries(cue.keywords_at.map((x) => [x.text, x.start]));
  // 整句很短（例如四個詞用頓號隔開）就整句同列，念到哪個詞哪個詞上色；不一次只放一個詞
  const whole = ps.map((x) => x.text).join("");
  const joined = ps.length > 1 && [...display(whole)].length <= 11;
  if (joined) k = 0;
  const p = a <= 0 && k === 0 ? 1 : tween(f, startOf(k), 5, EASE.enter);
  const colors = ["violet", "amber", "green", "blue"];
  void b;
  return (
    <div style={{ position: "absolute", left: L.X, top, width: L.INNER_W, height: L.CAP_H, background: T.panel, border: `2px solid ${T.line}`, borderRadius: T.radius.window }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 30, height: 104, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_ZH, fontWeight: T.weight.zh, fontSize: L.CAP_ZH_PX, color: T.text, letterSpacing: "0.02em", whiteSpace: "nowrap", transform: `translateY(${Math.round(8 * (1 - p))}px)` }}>
        <span>
          {splitParts(joined ? display(whole) : display(ps[k].text), cue.keywords).map((s, i) => {
            if (s.k < 0) return <span key={i}>{s.text}</span>;
            const q = kwAt[s.text] === undefined ? 1 : tween(f, kwAt[s.text] - 1, 8, EASE.move);
            const c = accentUI(colors[s.k % colors.length]);
            return (
              <span key={i} style={{ position: "relative", color: q > 0.5 ? c.text : joined ? T.text3 : T.text }}>
                {s.text}
                <span style={{ position: "absolute", left: 0, bottom: -6, height: 8, width: `${(100 * q).toFixed(1)}%`, background: c.fill, borderRadius: 4 }} />
              </span>
            );
          })}
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 156, textAlign: "center", fontFamily: FONT_EN, fontWeight: T.weight.light, fontSize: L.CAP_EN_PX, color: T.text2, whiteSpace: "nowrap" }}>{joined ? en.join(" ") : en[e]}</div>
    </div>
  );
};

/** 出處：字幕列下方一行小字；相鄰幕相同就不重貼 */
/** top：出處列的位置（不給＝LAYOUT_UI.SRC_TOP）；cue 的 plain＝這一行不是出處，不加「來源：」 */
export const SourceUI: React.FC<{ cues: { sources: string[]; window: [number, number]; plain?: boolean }[]; top?: number }> = ({ cues, top = L.SRC_TOP }) => {
  const f = useCurrentFrame();
  const cur = cues.find((c) => c.sources?.length && f >= c.window[0] && f < c.window[1]);
  if (!cur) return null;
  const j = cur.sources.join("、");
  const first = cues.find((c) => c.sources?.join("、") === j) as { window: [number, number] };
  const p = tween(f, first.window[0], T.motion.in, EASE.enter);
  return (
    <div style={{ position: "absolute", left: L.X + 8, top, display: "flex", alignItems: "center", gap: 12, opacity: p, fontFamily: FONT_ZH, fontWeight: T.weight.light, fontSize: L.SRC_PX, color: T.text2, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      <div style={{ width: 10, height: 10, borderRadius: T.radius.pill, background: T.text2 }} />
      {cur.plain || /^(資料)?來源/.test(j) ? j : `來源：${j}`}
    </div>
  );
};
