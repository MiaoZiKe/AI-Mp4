// CPI 實測短片：使用者自己的旁白音檔 → scripts/cpi/run.mjs 對齊後把「每段開始幀、關鍵字 cue、字幕行」當 props 傳進來。
// 這個 composition 只畫畫面（無聲）；旁白由 run.mjs 用 ffmpeg 混進 MP4（AAC），不加任何音樂或音效。
// 顏色與版面讀 THEME_CPI／LAYOUT_CPI；對話框自己畫，「Gemini」只用文字，不畫商標。
import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { tween } from "../anim";
import { FONT_EN, FONT_ZH, LAYOUT_CPI as L, THEME_CPI as T } from "../../theme";

export type CpiSeg = { id: string; from: number; to: number; cues: Record<string, number> };
export type CpiLine = { text: string; from: number; to: number };
export type CpiProps = { durationInFrames: number; segs: CpiSeg[]; lines: CpiLine[] };

const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
const lin = (t: number) => t;
const prog = (f: number, at: number, dur: number) => tween(f, at, dur, ease);
/** 先放大到 peak（5 幀）再回到 1 */
const overshoot = (f: number, at: number, from: number, peak: number, total: number) =>
  f < at + 5 ? from + (peak - from) * tween(f, at, 5, ease) : peak + (1 - peak) * tween(f, at + 5, total - 5, ease);
/** 數字強調：0.6 → 1.18 → 1 */
const punch = (f: number, at: number) => overshoot(f, at, 0.6, 1.18, T.motion.punch);
/** 進場：淡入＋上移 */
const rise = (f: number, at: number, dy = 36): React.CSSProperties => {
  const p = prog(f, at, 8);
  return { opacity: p, transform: `translateY(${((1 - p) * dy).toFixed(1)}px)` };
};

const NUM_RE = /(\d+(?:\.\d+)?%|Gemini|AI|CPI)/;
/** 把數字、英文詞包成 span：數字黃色加大、英文用 Inter */
const Rich: React.FC<{ text: string; numScale?: number }> = ({ text, numScale = 1.15 }) => (
  <>
    {text.split(NUM_RE).map((p, i) =>
      i % 2 === 1 ? (
        /%$/.test(p) ? (
          <span key={i} style={{ color: T.num, fontFamily: FONT_EN, fontWeight: 900, fontSize: `${numScale}em`, margin: "0 0.12em" }}>{p}</span>
        ) : (
          <span key={i} style={{ fontFamily: FONT_EN, fontWeight: 800, color: T.accent, margin: "0 0.12em" }}>{p}</span>
        )
      ) : (
        <span key={i}>{p}</span>
      ),
    )}
  </>
);

const Background: React.FC = () => (
  <AbsoluteFill style={{ background: T.bg }}>
    <AbsoluteFill style={{ backgroundImage: `linear-gradient(${T.grid} 1.5px, transparent 1.5px), linear-gradient(90deg, ${T.grid} 1.5px, transparent 1.5px)`, backgroundSize: "60px 60px" }} />
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${T.glow}, transparent 62%)` }} />
  </AbsoluteFill>
);

const Header: React.FC = () => (
  <div style={{ position: "absolute", left: L.X, top: L.HEADER_TOP, width: L.INNER_W, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: FONT_ZH }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14, color: T.text, fontSize: 34, fontWeight: 800 }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, background: T.accent }} />白話國際
    </div>
    <div style={{ padding: "8px 22px", borderRadius: T.radius.chip, border: `2px solid ${T.accent}`, color: T.accent, fontSize: 28, fontWeight: 700 }}>
      <span style={{ fontFamily: FONT_EN }}>AI</span> 實測
    </div>
  </div>
);

const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode; border?: string }> = ({ style, children, border = T.line }) => (
  <div style={{ background: T.panel, border: `2px solid ${border}`, borderRadius: T.radius.card, boxShadow: "0 24px 60px rgba(0,0,0,0.35)", ...style }}>{children}</div>
);

// ───────── 對話框（S2、S3 共用）─────────
const PROMPT = "台灣十月物價重點？";
const ChatWindow: React.FC<{ children: React.ReactNode; input?: string; caret?: boolean; height?: number }> = ({ children, input, caret, height = 900 }) => (
  <div style={{ position: "absolute", left: L.X, top: L.MAIN_TOP + 10, width: L.INNER_W, height, fontFamily: FONT_ZH }}>
    <Card style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ height: 86, borderBottom: `2px solid ${T.line}`, display: "flex", alignItems: "center", padding: "0 30px", gap: 12 }}>
        {[0, 1, 2].map((k) => <div key={k} style={{ width: 16, height: 16, borderRadius: 8, background: T.line }} />)}
        <div style={{ marginLeft: 18, color: T.text, fontFamily: FONT_EN, fontWeight: 700, fontSize: 34 }}>Gemini</div>
        <div style={{ marginLeft: "auto", color: T.sub, fontSize: 26 }}>模擬畫面</div>
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 116, bottom: 150 }}>{children}</div>
      <div style={{ position: "absolute", left: 30, right: 30, bottom: 30, height: 96, borderRadius: 48, background: T.panel2, border: `2px solid ${T.line}`, display: "flex", alignItems: "center", padding: "0 36px", fontSize: 38, color: T.text }}>
        {input ? <span>{input}</span> : <span style={{ color: T.dim }}>輸入問題…</span>}
        {caret ? <span style={{ display: "inline-block", width: 4, height: 44, marginLeft: 4, background: T.accent }} /> : null}
        <div style={{ marginLeft: "auto", width: 60, height: 60, borderRadius: 30, background: input ? T.accent : T.line }} />
      </div>
    </Card>
  </div>
);

const UserBubble: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{ display: "flex", justifyContent: "flex-end", ...style }}>
    <div style={{ background: T.user, color: "#fff", fontSize: 40, fontWeight: 700, padding: "22px 32px", borderRadius: T.radius.bubble, borderBottomRightRadius: 8 }}>{PROMPT}</div>
  </div>
);

// ───────── 六段畫面 ─────────
/** S1 開場問題 */
const S1: React.FC<{ f: number; s: CpiSeg }> = ({ f, s }) => {
  const q = s.cues.q ?? s.from + 30;
  const tick = Math.floor(f / 3);
  return (
    <div style={{ position: "absolute", left: L.X, top: L.MAIN_TOP, width: L.INNER_W, height: L.MAIN_BOTTOM - L.MAIN_TOP, fontFamily: FONT_ZH }}>
      <div style={{ ...rise(f, s.from), textAlign: "center", marginTop: 40 }}>
        <div style={{ color: T.sub, fontSize: 40, fontWeight: 700, letterSpacing: 6 }}>台灣 消費者物價指數</div>
        <div style={{ color: T.text, fontSize: 150, fontWeight: 900, lineHeight: 1.15, marginTop: 10 }}>十月物價</div>
        <div style={{ color: T.text, fontSize: 96, fontWeight: 900 }}>出來了</div>
      </div>
      <Card style={{ ...rise(f, s.from + 6), margin: "50px auto 0", width: 640, padding: "30px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: T.sub, fontSize: 36, fontWeight: 700 }}><span style={{ fontFamily: FONT_EN }}>CPI</span> 年增率</div>
        <div style={{ color: T.dim, fontFamily: FONT_EN, fontWeight: 900, fontSize: 80, opacity: tick % 2 ? 0.6 : 1 }}>?.??%</div>
      </Card>
      <div style={{ ...rise(f, q - 4, 50), marginTop: 70, textAlign: "center" }}>
        <div style={{ display: "inline-block", padding: "30px 50px", borderRadius: T.radius.card, background: T.accentSoft, border: `3px solid ${T.accent}`, color: T.text, fontSize: 64, fontWeight: 900 }}>
          你有請 <span style={{ color: T.accent, fontFamily: FONT_EN }}>AI</span> 抓重點嗎？
        </div>
      </div>
    </div>
  );
};

/** S2 模擬對話框：只打一句話 */
const S2: React.FC<{ f: number; s: CpiSeg }> = ({ f, s }) => {
  const t0 = (s.cues.type ?? s.from) + 8, t1 = Math.max(t0 + 12, s.cues.typeEnd ?? s.to - 20);
  const n = Math.round(tween(f, t0, t1 - t0, lin) * PROMPT.length);
  const sent = f >= t1 + 6;
  const bp = prog(f, t1 + 6, 8);
  return (
    <div style={rise(f, s.from)}>
      <ChatWindow input={sent ? undefined : PROMPT.slice(0, n)} caret={!sent && Math.floor(f / 8) % 2 === 0}>
        {sent ? <UserBubble style={{ opacity: bp, transform: `translateY(${(1 - bp) * 60}px)` }} /> : null}
        <div style={{ ...rise(f, t1 + 2), position: "absolute", left: 0, right: 0, bottom: 20, textAlign: "center" }}>
          <span style={{ display: "inline-block", padding: "16px 34px", borderRadius: T.radius.chip, border: `2px dashed ${T.accent}`, color: T.accent, fontSize: 40, fontWeight: 800 }}>只打一句話</span>
        </div>
      </ChatWindow>
    </div>
  );
};

/** S3 AI 回一大篇、標出 1.69% */
const SKEL = [0.92, 0.84, 0.97, 0.6, 0.9, 0.78, 0.95, 0.7, 0.55];
const S3: React.FC<{ f: number; s: CpiSeg }> = ({ f, s }) => {
  const num = s.cues.num ?? s.to - 30;
  const shown = Math.floor(tween(f, s.from + 4, num - 8 - s.from, lin) * SKEL.length);
  const hp = prog(f, num, 6);
  const big = punch(f, num);
  return (
    <>
      <ChatWindow>
        <UserBubble />
        <div style={{ marginTop: 28, background: T.panel2, borderRadius: T.radius.bubble, borderTopLeftRadius: 8, padding: "26px 30px", fontSize: 34, color: T.text, lineHeight: 1.5 }}>
          <div style={{ fontWeight: 700 }}>好的，幫你整理十月物價重點：</div>
          <div style={{ marginTop: 8, fontWeight: 700 }}>
            <span style={{ fontFamily: FONT_EN }}>CPI</span> 年增率是{" "}
            <span style={{ fontFamily: FONT_EN, fontWeight: 900, padding: "0 10px", borderRadius: 8, color: hp > 0 ? T.bg : T.text, background: hp > 0 ? T.num : "transparent", boxShadow: hp > 0 ? `0 0 0 ${4 * hp}px ${T.numGlow}` : undefined }}>1.69%</span>
          </div>
          {SKEL.map((w, k) => (
            <div key={k} style={{ height: 22, width: `${w * 100}%`, borderRadius: 11, background: T.skeleton, marginTop: k % 4 === 3 ? 34 : 18, opacity: k < shown ? 1 : 0 }} />
          ))}
        </div>
      </ChatWindow>
      <div style={{ position: "absolute", left: (L.INNER_W - 600) / 2 + L.X, top: L.MAIN_TOP + 560, width: 600, opacity: hp, transform: `scale(${big.toFixed(3)})`, transformOrigin: "50% 60%" }}>
        <Card border={T.num} style={{ padding: "22px 30px", textAlign: "center", boxShadow: `0 0 0 10px ${T.numGlow}, 0 30px 70px rgba(0,0,0,0.5)` }}>
          <div style={{ color: T.sub, fontFamily: FONT_ZH, fontSize: 32, fontWeight: 700 }}><span style={{ fontFamily: FONT_EN }}>AI</span> 說十月是</div>
          <div style={{ color: T.num, fontFamily: FONT_EN, fontWeight: 900, fontSize: 150, lineHeight: 1.1 }}>1.69%</div>
        </Card>
      </div>
    </>
  );
};

/** S4 打叉＋實際 2.33% */
const S4: React.FC<{ f: number; s: CpiSeg }> = ({ f, s }) => {
  const past = s.cues.past ?? s.from + 20, num = s.cues.num ?? s.to - 30;
  const x1 = prog(f, past, T.motion.strike), x2 = prog(f, past + 4, T.motion.strike);
  const big = punch(f, num);
  const XLEN = 520;
  return (
    <div style={{ position: "absolute", left: L.X, top: L.MAIN_TOP, width: L.INNER_W, fontFamily: FONT_ZH }}>
      <Card style={{ ...rise(f, s.from), position: "relative", padding: "34px 40px 30px", textAlign: "center" }}>
        <div style={{ color: T.sub, fontSize: 36, fontWeight: 700 }}><span style={{ fontFamily: FONT_EN }}>AI</span> 的答案</div>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div style={{ color: x1 > 0 ? T.dim : T.num, fontFamily: FONT_EN, fontWeight: 900, fontSize: 170, lineHeight: 1.15 }}>1.69%</div>
          <svg width={XLEN} height={220} style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -XLEN / 2, marginTop: -110, overflow: "visible" }}>
            <line x1={40} y1={20} x2={40 + (XLEN - 80) * x1} y2={20 + 180 * x1} stroke={T.wrong} strokeWidth={22} strokeLinecap="round" opacity={x1 > 0 ? 1 : 0} />
            <line x1={XLEN - 40} y1={20} x2={XLEN - 40 - (XLEN - 80) * x2} y2={20 + 180 * x2} stroke={T.wrong} strokeWidth={22} strokeLinecap="round" opacity={x2 > 0 ? 1 : 0} />
          </svg>
        </div>
        <div style={{ ...rise(f, past + 6, 20), marginTop: 6, display: "inline-block", padding: "12px 30px", borderRadius: T.radius.chip, background: T.wrongSoft, color: T.wrong, fontSize: 38, fontWeight: 800 }}>
          那是兩年前的數字（<span style={{ fontFamily: FONT_EN }}>2024</span> 年 <span style={{ fontFamily: FONT_EN }}>10</span> 月）
        </div>
      </Card>
      <div style={{ opacity: prog(f, num - 2, 4), transform: `scale(${big.toFixed(3)})`, marginTop: 50 }}>
        <Card border={T.right} style={{ padding: "36px 40px", textAlign: "center", boxShadow: `0 0 0 10px ${T.rightSoft}, 0 30px 70px rgba(0,0,0,0.5)` }}>
          <div style={{ color: T.right, fontSize: 48, fontWeight: 900 }}>實際：</div>
          <div style={{ color: T.num, fontFamily: FONT_EN, fontWeight: 900, fontSize: 200, lineHeight: 1.1 }}>2.33%</div>
          <div style={{ color: T.text, fontSize: 44, fontWeight: 800 }}>（今年 <span style={{ fontFamily: FONT_EN }}>10</span> 月）</div>
        </Card>
      </div>
    </div>
  );
};

const IconSearch: React.FC<{ c: string }> = ({ c }) => (
  <svg width={84} height={84} viewBox="0 0 84 84"><circle cx={36} cy={36} r={22} fill="none" stroke={c} strokeWidth={7} /><line x1={53} y1={53} x2={72} y2={72} stroke={c} strokeWidth={8} strokeLinecap="round" /></svg>
);
const IconNews: React.FC<{ c: string }> = ({ c }) => (
  <svg width={84} height={84} viewBox="0 0 84 84"><rect x={10} y={12} width={64} height={60} rx={8} fill="none" stroke={c} strokeWidth={7} /><line x1={22} y1={30} x2={62} y2={30} stroke={c} strokeWidth={6} /><line x1={22} y1={44} x2={62} y2={44} stroke={c} strokeWidth={6} /><line x1={22} y1={58} x2={48} y2={58} stroke={c} strokeWidth={6} /></svg>
);

/** S5 沒開搜尋、沒給新聞 */
const S5: React.FC<{ f: number; s: CpiSeg }> = ({ f, s }) => {
  const a = s.cues.search ?? s.from + 40, b = s.cues.news ?? s.from + 80;
  const Row: React.FC<{ at: number; icon: React.ReactNode; label: string; state: string; toggle?: boolean }> = ({ at, icon, label, state, toggle }) => {
    const p = prog(f, at - 4, 8);
    return (
      <Card style={{ ...rise(f, at - 6), marginTop: 36, padding: "30px 40px", display: "flex", alignItems: "center", gap: 30 }} border={p > 0.5 ? T.wrong : T.line}>
        {icon}
        <div style={{ color: T.text, fontSize: 56, fontWeight: 900 }}>{label}</div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 }}>
          {toggle ? (
            <div style={{ width: 120, height: 64, borderRadius: 32, background: T.line, position: "relative" }}>
              <div style={{ position: "absolute", top: 7, left: 7, width: 50, height: 50, borderRadius: 25, background: T.dim }} />
            </div>
          ) : null}
          <div style={{ padding: "10px 26px", borderRadius: T.radius.chip, background: T.wrongSoft, color: T.wrong, fontSize: 40, fontWeight: 900 }}>{state}</div>
        </div>
      </Card>
    );
  };
  return (
    <div style={{ position: "absolute", left: L.X, top: L.MAIN_TOP + 40, width: L.INNER_W, fontFamily: FONT_ZH }}>
      <div style={{ ...rise(f, s.from), textAlign: "center", color: T.text, fontSize: 100, fontWeight: 900 }}>不能怪它</div>
      <div style={{ ...rise(f, s.from + 4), textAlign: "center", color: T.sub, fontSize: 40, fontWeight: 700, marginTop: 6 }}>這次我們給它的條件</div>
      <Row at={a} icon={<IconSearch c={T.sub} />} label="網路搜尋" state="沒開" toggle />
      <Row at={b} icon={<IconNews c={T.sub} />} label="最新新聞" state="沒給" />
      <div style={{ ...rise(f, b + 12), marginTop: 50, textAlign: "center", color: T.accent, fontSize: 44, fontWeight: 800 }}>沒有新資料，只能憑舊印象回答</div>
    </div>
  );
};

/** S6 結尾字卡：換個問法 */
const S6: React.FC<{ f: number; s: CpiSeg }> = ({ f, s }) => {
  const ask = s.cues.ask ?? s.from + 15;
  const big = overshoot(f, ask, 0.7, 1.08, 14);
  const u = prog(f, ask + 8, 12);
  return (
    <div style={{ position: "absolute", left: L.X, top: L.MAIN_TOP, width: L.INNER_W, height: L.MAIN_BOTTOM - L.MAIN_TOP, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT_ZH }}>
      <div style={{ ...rise(f, s.from), color: T.sub, fontSize: 60, fontWeight: 800 }}>所以</div>
      <div style={{ opacity: prog(f, ask - 2, 4), transform: `scale(${big.toFixed(3)})`, color: T.text, fontSize: 180, fontWeight: 900, lineHeight: 1.2, marginTop: 10 }}>換個問法</div>
      <div style={{ height: 14, width: 700 * u, borderRadius: 7, background: T.accent, marginTop: 20 }} />
      <div style={{ ...rise(f, ask + 16), marginTop: 70, width: 760, height: 96, borderRadius: 48, background: T.panel2, border: `2px solid ${T.accent}`, display: "flex", alignItems: "center", padding: "0 36px", color: T.dim, fontSize: 38 }}>
        下一次，問之前先…
        <span style={{ display: "inline-block", width: 4, height: 44, marginLeft: 6, background: T.accent, opacity: Math.floor(f / 10) % 2 }} />
      </div>
    </div>
  );
};

const SCENES: Record<string, React.FC<{ f: number; s: CpiSeg }>> = { open: S1, ask: S2, reply: S3, wrong: S4, why: S5, end: S6 };

const Subtitle: React.FC<{ f: number; lines: CpiLine[] }> = ({ f, lines }) => {
  const ln = lines.find((l) => f >= l.from && f < l.to);
  if (!ln) return null;
  const p = 0.4 + 0.6 * prog(f, ln.from, 4); // 換行第一幀就看得到字（不留空白字幕）
  return (
    <div style={{ position: "absolute", left: L.X, top: L.CAP_TOP, width: L.INNER_W, height: L.CAP_H, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: p, transform: `translateY(${(1 - p) * 14}px)`, padding: "20px 34px", borderRadius: 22, background: "rgba(8,12,26,0.78)", border: `2px solid ${T.line}`, color: T.text, fontFamily: FONT_ZH, fontWeight: 900, fontSize: L.CAP_PX, lineHeight: 1.25, whiteSpace: "nowrap" }}>
        <Rich text={ln.text} />
      </div>
    </div>
  );
};

export const CpiVideo: React.FC<CpiProps> = ({ segs, lines }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background />
      <Header />
      {segs.map((s) => {
        if (f < s.from || f >= s.to) return null;
        const Comp = SCENES[s.id];
        const out = 1 - tween(f, s.to - T.motion.exit, T.motion.exit, lin);
        const last = s === segs[segs.length - 1];
        return Comp ? <AbsoluteFill key={s.id} style={{ opacity: last ? 1 : out }}><Comp f={f} s={s} /></AbsoluteFill> : null;
      })}
      <Subtitle f={f} lines={lines} />
    </AbsoluteFill>
  );
};
