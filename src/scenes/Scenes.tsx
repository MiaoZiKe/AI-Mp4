import React from "react";
import { useCurrentFrame } from "remotion";
import { lin, sp } from "../anim";
import {
  BigNumber, Callout, CertTag, CompareSplit, EndCard, FlowRow, HighlightBox, Icon, ImpactCard, SceneTitle, SeatBar, TermCard,
} from "../components";
import { C, CONTENT, CONTENT_W, FONT_MONO, FONT_ZH, SAFE, W } from "../theme";
import { Scene, Script } from "../types";

type P = { scene: Scene; script: Script; no: number; duration: number };
const L = SAFE.left;
const abs = (left: number, top: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left, top, ...extra });
const partyColor = (p?: string) => (p === "D" ? C.blue : p === "R" ? C.red : C.line);

/* 01 鉤子 */
const Hook: React.FC<P> = ({ scene }) => {
  const f = useCurrentFrame();
  const { question, highlight, links } = scene.props;
  const draw = lin(f, 6, 40);
  const tw = lin(f, 30, 56);
  const nodesY = [900, 1050, 1200];
  return (
    <>
      <div style={abs(L, CONTENT.top + 30)}>
        {question.map((line: string, i: number) => {
          const p = sp(f, i * 6, 14);
          const parts = line.split(highlight);
          return (
            <div key={i} style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 104, lineHeight: 1.22, color: C.line, opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>
              {parts.length > 1 ? (
                <>
                  {parts[0]}
                  <span style={{ color: C.yellow, borderBottom: `6px solid ${C.yellow}`, paddingBottom: 2 }}>{highlight}</span>
                  {parts[1]}
                </>
              ) : line}
            </div>
          );
        })}
      </div>
      <div style={abs(L + 10, 900)}>
        <Icon name="capitol" size={330} progress={draw} />
        <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: C.cyan, textAlign: "center", marginTop: 12, letterSpacing: 2 }}>US CONGRESS · 美國國會</div>
      </div>
      <div style={abs(800, 860)}>
        <Icon name="taiwan" size={150} progress={tw} color={C.yellow} fill="rgba(255,200,61,0.12)" />
        <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 30, color: C.yellow, textAlign: "center", marginTop: 8 }}>台灣</div>
      </div>
      <HighlightBox x={770} y={840} w={210} h={370} shape="circle" delay={56} />
      <svg width={W} height={1920} style={abs(0, 0, { overflow: "visible" })}>
        {links.map((_: unknown, i: number) => {
          const p = lin(f, 40 + i * 8, 56 + i * 8);
          const y = nodesY[i] + 50;
          return (
            <g key={i} stroke={C.cyan} strokeWidth={2.5} strokeDasharray="10 8" fill="none">
              <path d={`M400 1040 L${400 + (480 - 400) * p} ${1040 + (y - 1040) * p}`} />
              {p >= 1 && <path d={`M720 ${y} L790 1040`} />}
            </g>
          );
        })}
      </svg>
      {links.map((lk: any, i: number) => {
        const p = sp(f, 48 + i * 8, 13);
        return (
          <div key={i} style={abs(486, nodesY[i], { width: 230, height: 100, border: `2px solid ${C.line}`, borderRadius: 10, background: "rgba(10,31,69,0.85)", display: "flex", alignItems: "center", gap: 12, padding: "0 14px", boxSizing: "border-box", transform: `scale(${p})`, opacity: p })}>
            <Icon name={lk.icon} size={70} progress={p} />
            <div>
              <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 38, color: C.yellow, lineHeight: 1 }}>{lk.label}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 16, color: C.cyan, marginTop: 6 }}>{lk.en}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

/* 02 名詞解釋 */
const Term: React.FC<P> = ({ scene }) => {
  const f = useCurrentFrame();
  const { term, en, def, numbers } = scene.props;
  const tl = lin(f, 30, 60);
  const x0 = 100, x1 = 980, mid = (x0 + x1) / 2, y = 860;
  return (
    <>
      <div style={abs(L, CONTENT.top + 30)}>
        <TermCard term={term} en={en} def={def} width={CONTENT_W} />
      </div>
      <svg width={W} height={1920} style={abs(0, 0, { overflow: "visible" })}>
        <text x={x0} y={y - 70} fontFamily={FONT_MONO} fontSize={20} fill={C.cyan} letterSpacing={2} opacity={tl}>PRESIDENTIAL TERM · 總統任期 4 年</text>
        <line x1={x0} y1={y} x2={x0 + (x1 - x0) * tl} y2={y} stroke={C.line} strokeWidth={3} />
        {[0, 1, 2, 3, 4].map((i) => {
          const x = x0 + ((x1 - x0) * i) / 4;
          return (
            <g key={i} opacity={tl >= i / 4 ? 1 : 0}>
              <line x1={x} y1={y - 14} x2={x} y2={y + 14} stroke={C.line} strokeWidth={3} />
              <text x={x} y={y + 48} textAnchor="middle" fontFamily={FONT_MONO} fontSize={24} fill={C.dim}>{2025 + i}</text>
            </g>
          );
        })}
        {/* 尺寸標註：2 年 */}
        <g opacity={lin(f, 50, 62)} stroke={C.line} strokeOpacity={0.6} strokeWidth={1.5}>
          <line x1={x0} y1={y - 34} x2={mid} y2={y - 34} strokeDasharray="6 6" />
          <line x1={mid} y1={y - 34} x2={x1} y2={y - 34} strokeDasharray="6 6" />
        </g>
        <g opacity={lin(f, 56, 66)}>
          <circle cx={mid - 110} cy={y} r={16} fill={C.yellow} />
          <circle cx={mid - 110} cy={y} r={28 + 6 * Math.sin(f / 6)} fill="none" stroke={C.yellow} strokeWidth={2} />
          <text x={mid - 110} y={y + 92} textAnchor="middle" fontFamily={FONT_ZH} fontWeight={700} fontSize={32} fill={C.yellow}>2026/11/3 期中選舉</text>
        </g>
      </svg>
      <div style={abs(L, 1010, { width: CONTENT_W, display: "flex", justifyContent: "space-around" })}>
        {numbers.map((n: any, i: number) => (
          <BigNumber key={i} value={n.value} label={n.label} sub={n.sub} delay={70 + i * 10} size={140} color={i === 0 ? C.yellow : C.cyan} />
        ))}
      </div>
    </>
  );
};

/* 03 參眾兩院 */
const Compare: React.FC<P> = ({ scene }) => {
  const f = useCurrentFrame();
  const { left, right, footer } = scene.props;
  const p = sp(f, 50, 16);
  return (
    <>
      <div style={abs(L, CONTENT.top + 20)}>
        <CompareSplit left={left} right={right} width={CONTENT_W} height={760} />
      </div>
      <div style={abs(L, 1150, { width: CONTENT_W, opacity: p, border: `2px dashed ${C.yellow}`, borderRadius: 10, padding: "18px 20px", boxSizing: "border-box", textAlign: "center", fontFamily: FONT_ZH, fontWeight: 700, fontSize: 32, color: C.yellow })}>
        {footer}
      </div>
    </>
  );
};

/* 04 席次結果 */
const Seats: React.FC<P> = ({ scene, no }) => {
  const f = useCurrentFrame();
  const { bars, pending, pendingNote } = scene.props;
  const p = sp(f, 60, 14);
  return (
    <>
      <SceneTitle no={no} zh="這次的結果" en="RESULTS · AS OF 2026/11/4" right={<CertTag cert="已確定" note="BOTH CHAMBERS" />} />
      {bars.map((b: any, i: number) => (
        <div key={i} style={abs(L, 478 + i * 340)}>
          <SeatBar
            title={b.title} titleEn={b.titleEn} total={b.total} threshold={b.threshold} width={CONTENT_W} delay={i * 16} note={b.note}
            segs={b.segs.map((s: any) => ({ label: s.label, value: s.value, pending: s.pending, color: s.pending ? C.line : partyColor(s.party) }))}
          />
        </div>
      ))}
      <div style={abs(L, 1172, { width: CONTENT_W, boxSizing: "border-box", border: `2.5px dashed #FF9F6B`, borderRadius: 10, padding: "10px 22px", background: "rgba(10,31,69,0.8)", opacity: p, transform: `scale(${0.85 + 0.15 * p})` })}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <CertTag cert="尚未確定" size={26} />
          <span style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 30, color: "#FF9F6B" }}>{pendingNote}</span>
        </div>
        <div style={{ fontFamily: FONT_ZH, fontWeight: 500, fontSize: 28, color: C.line, marginTop: 6 }}>{pending.join("　｜　")}</div>
      </div>
    </>
  );
};

/* 05 分裂政府 */
const GovBox: React.FC<{ title: string; en: string; desc: string; colors: [string, string]; labels: [string, string]; delay: number; sign: string; hl?: boolean }> = ({ title, en, desc, colors, labels, delay, sign, hl }) => {
  const f = useCurrentFrame();
  const p = sp(f, delay, 16);
  const d = lin(f, delay, delay + 26);
  return (
    <div style={{ width: 458, height: 430, boxSizing: "border-box", border: `2.5px solid ${hl ? C.yellow : C.line}`, borderRadius: 10, background: "rgba(10,31,69,0.6)", padding: 20, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, textAlign: "center" }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: C.cyan, letterSpacing: 3 }}>{en}</div>
      <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 52, color: hl ? C.yellow : C.line }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 }}>
        {[0, 1].map((k) => (
          <React.Fragment key={k}>
            {k === 1 && <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 48, color: C.yellow, width: 44 }}>{sign}</div>}
            <div>
              <Icon name={k === 0 ? "whitehouse" : "capitol"} size={150} progress={d} color={colors[k]} />
              <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 24, color: colors[k], marginTop: 6 }}>{labels[k]}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={{ fontFamily: FONT_ZH, fontWeight: 500, fontSize: 27, color: C.dim, marginTop: 16, whiteSpace: "pre-line", lineHeight: 1.4 }}>{desc}</div>
    </div>
  );
};
const Divided: React.FC<P> = ({ scene, no }) => {
  const { unified, divided, flow } = scene.props;
  return (
    <>
      <SceneTitle no={no} zh="分裂政府 vs 一致政府" en="DIVIDED vs UNIFIED" />
      <div style={abs(L, 490, { display: "flex", gap: 36 })}>
        <GovBox {...unified} colors={[C.line, C.line]} labels={["白宮", "國會"]} delay={6} sign="=" />
        <GovBox {...divided} colors={[C.red, C.blue]} labels={["白宮·共和黨", "國會·民主黨"]} delay={16} sign="≠" hl />
      </div>
      <div style={abs(L, 960)}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: C.cyan, letterSpacing: 2, marginBottom: 12 }}>LEGISLATIVE FLOW · 立法流程</div>
        <FlowRow width={CONTENT_W} delay={40} boxH={150} steps={flow.map((s: any) => ({ ...s, text: s.text }))} />
      </div>
      <div style={abs(L, 1210, { display: "flex", gap: 16, alignItems: "center" })}>
        <CertTag cert="已確定" note="制度 CONSTITUTION" />
        <span style={{ fontFamily: FONT_ZH, fontWeight: 500, fontSize: 26, color: C.dim }}>本次未出現推翻否決所需的 2/3 多數（分析）</span>
      </div>
    </>
  );
};

/* 06 預算 */
const Impact: React.FC<P> = ({ scene, no }) => {
  const f = useCurrentFrame();
  const { topic, topicEn, hero, icon, cards } = scene.props;
  return (
    <>
      <SceneTitle no={no} zh={topic} en={topicEn} />
      <div style={abs(L, 500, { width: CONTENT_W, display: "flex", alignItems: "center", justifyContent: "space-between" })}>
        <div style={{ width: 300, display: "flex", justifyContent: "center" }}>
          <Icon name={icon} size={250} progress={lin(f, 4, 36)} />
        </div>
        <div style={{ width: 600, position: "relative" }}>
          <BigNumber value={hero.value} label={hero.label} sub={hero.sub} delay={14} size={170} />
        </div>
      </div>
      <HighlightBox x={L + 340} y={480} w={612} h={320} delay={34} />
      {cards.map((c: any, i: number) => (
        <div key={i} style={abs(L, 870 + i * 200)}>
          <ImpactCard {...c} width={CONTENT_W} delay={40 + i * 14} index={i + 1} />
        </div>
      ))}
    </>
  );
};

/* 07 關稅 */
const Tariff: React.FC<P> = ({ scene, no }) => {
  const f = useCurrentFrame();
  const { topic, topicEn, callouts, card } = scene.props;
  const d = lin(f, 4, 40);
  return (
    <>
      <SceneTitle no={no} zh={topic} en={topicEn} />
      <div style={abs(L + 6, 560)}>
        <Icon name="ship" size={470} progress={d} />
      </div>
            <div style={abs(L + 6, 900, { width: 470, textAlign: "center", fontFamily: FONT_MONO, fontSize: 20, color: C.cyan, letterSpacing: 2, opacity: d })}>FIG.07 — CARGO / 貨櫃船</div>
      <Callout from={[L + 200, 660]} to={[570, 540]} title={callouts[0].title} sub={callouts[0].sub} delay={36} width={446}>
        <CertTag cert={callouts[0].cert} size={22} />
      </Callout>
      <Callout from={[L + 330, 790]} to={[570, 760]} title={callouts[1].title} sub={callouts[1].sub} delay={54} width={446} color={C.yellow}>
        <CertTag cert={callouts[1].cert} size={22} />
      </Callout>
      <div style={abs(L, 1040)}>
        <ImpactCard {...card} width={CONTENT_W} delay={70} icon="capitol" />
      </div>
    </>
  );
};

/* 08 晶片 */
const Chip: React.FC<P> = ({ scene, no }) => {
  const f = useCurrentFrame();
  const { topic, topicEn, callouts } = scene.props;
  const d = lin(f, 4, 40);
  const cx = L + 20, cy = 520, size = 380;
  return (
    <>
      <SceneTitle no={no} zh={topic} en={topicEn} />
      <div style={abs(cx, cy)}>
        <Icon name="chip" size={size} progress={d} accentColor={C.cyan} />
      </div>
      <svg width={W} height={1920} style={abs(0, 0, { overflow: "visible" })} opacity={lin(f, 30, 42)}>
        <g stroke={C.line} strokeOpacity={0.6} strokeWidth={1.5}>
          <line x1={cx + 70} y1={cy + size + 30} x2={cx + size - 70} y2={cy + size + 30} />
          <path d={`M${cx + 70} ${cy + size + 30} l12 -6 v12 z M${cx + size - 70} ${cy + size + 30} l-12 -6 v12 z`} fill={C.line} />
        </g>
        <text x={cx + size / 2} y={cy + size + 66} textAnchor="middle" fontFamily={FONT_MONO} fontSize={20} fill={C.cyan} letterSpacing={2}>FIG.08 — SEMICONDUCTOR · 晶片剖面</text>
      </svg>
      {callouts.map((c: any, i: number) => (
        <Callout key={i} from={[cx + size - 30, cy + 110 + i * 90]} to={[560, 520 + i * 200]} title={c.title} sub={c.sub} delay={30 + i * 18} width={456} color={i === 0 ? C.cyan : C.yellow}>
          <CertTag cert={c.cert} size={22} />
        </Callout>
      ))}
      <div style={abs(L + 24, 1092, { width: CONTENT_W - 48, display: "flex", alignItems: "center", gap: 26, opacity: lin(f, 84, 96) })}>
        <Icon name="taiwan" size={78} progress={lin(f, 84, 110)} color={C.yellow} fill="rgba(255,200,61,0.15)" />
        <div>
          <div style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 46, color: C.yellow }}>牽動台灣半導體供應鏈</div>
          <div style={{ fontFamily: FONT_ZH, fontWeight: 500, fontSize: 28, color: C.dim, marginTop: 6 }}>補助、出口管制與 AI 規範，都由國會參與決定</div>
        </div>
      </div>
      <HighlightBox x={L + 4} y={1072} w={CONTENT_W - 8} h={206} delay={100} />
    </>
  );
};

/* 09 對台對中 */
const Taiwan: React.FC<P> = ({ scene, no }) => {
  const f = useCurrentFrame();
  const { topic, topicEn, cards } = scene.props;
  const d = lin(f, 4, 40);
  return (
    <>
      <SceneTitle no={no} zh={topic} en={topicEn} />
      <div style={abs(L + 20, 560)}>
        <Icon name="taiwan" size={200} progress={d} color={C.yellow} fill="rgba(255,200,61,0.12)" />
      </div>
      <svg width={W} height={1920} style={abs(0, 0, { overflow: "visible" })} opacity={lin(f, 30, 40)}>
        <g stroke={C.line} strokeOpacity={0.55} strokeWidth={1.5}>
          <line x1={L + 250} y1={560} x2={L + 250} y2={980} />
          <path d={`M${L + 250} 560 l-6 12 h12 z M${L + 250} 980 l-6 -12 h12 z`} fill={C.line} />
        </g>
        <text x={L + 120} y={1040} textAnchor="middle" fontFamily={FONT_MONO} fontSize={20} fill={C.cyan} letterSpacing={2}>TAIWAN · 台灣</text>
      </svg>
      <HighlightBox x={L} y={540} w={240} h={460} shape="circle" delay={40} />
      {cards.map((c: any, i: number) => (
        <div key={i} style={abs(L + 290, 490 + i * 270)}>
          <ImpactCard {...c} width={CONTENT_W - 290} delay={18 + i * 16} />
        </div>
      ))}
    </>
  );
};

/* 10 市場 */
const Market: React.FC<P> = ({ scene, no }) => {
  const f = useCurrentFrame();
  const { topic, topicEn, numbers, view, disclaimer } = scene.props;
  return (
    <>
      <SceneTitle no={no} zh={topic} en={topicEn} right={<CertTag cert="已確定" note="MARKET DATA" />} />
      <div style={abs(L, 510, { width: CONTENT_W, display: "flex", justifyContent: "space-around" })}>
        {numbers.map((n: any, i: number) => (
          <div key={i} style={{ width: 440, border: `2px solid ${C.gray}`, borderRadius: 10, padding: "26px 0", background: "rgba(10,31,69,0.6)" }}>
            <BigNumber {...n} delay={10 + i * 14} size={104} color={i === 0 ? C.cyan : C.yellow} />
          </div>
        ))}
      </div>
      <div style={abs(L, 830, { width: CONTENT_W, display: "flex", gap: 30, alignItems: "center" })}>
        <div style={{ width: 380 }}>
          <Icon name="stock" size={380} progress={lin(f, 20, 60)} accentColor={C.yellow} />
          <div style={{ fontFamily: FONT_MONO, fontSize: 18, color: C.dim, textAlign: "center", marginTop: 6 }}>示意圖 ILLUSTRATIVE</div>
        </div>
        <div style={{ flex: 1, border: `2.5px solid ${C.yellow}`, borderRadius: 10, padding: "20px 22px", opacity: sp(f, 44, 16), background: "rgba(10,31,69,0.75)" }}>
          <CertTag cert="分析預期" size={22} />
          <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 34, color: C.line, lineHeight: 1.45, marginTop: 12 }}>{view}</div>
        </div>
      </div>
      <div style={abs(L, 1180, { width: CONTENT_W, textAlign: "center", fontFamily: FONT_ZH, fontWeight: 700, fontSize: 28, color: "#FF9F6B", border: "2px dashed #FF9F6B", borderRadius: 8, padding: "12px 0", opacity: lin(f, 60, 72) })}>
        ⚠ {disclaimer}
      </div>
    </>
  );
};

/* 11 總結 */
const Summary: React.FC<P> = ({ scene }) => {
  const f = useCurrentFrame();
  const { label, labelEn, quote, hlLine } = scene.props;
  const top = 520, lh = 108;
  return (
    <>
      <div style={abs(L, CONTENT.top + 40, { display: "flex", alignItems: "center", gap: 16, opacity: sp(f, 0, 16) })}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 22, color: "#0A1F45", background: C.cyan, padding: "4px 12px", borderRadius: 4, letterSpacing: 2 }}>{labelEn}</span>
        <span style={{ fontFamily: FONT_ZH, fontWeight: 900, fontSize: 48, color: C.line }}>{label}</span>
      </div>
      <svg width={90} height={70} style={abs(L + 10, 450)}><path d="M8 62 V34 Q8 8 34 4 V16 Q20 20 20 34 H36 V62 Z M52 62 V34 Q52 8 78 4 V16 Q64 20 64 34 H80 V62 Z" fill={C.yellow} opacity={0.5} /></svg>
      {quote.map((q: string, i: number) => {
        const p = sp(f, 8 + i * 10, 15);
        return (
          <div key={i} style={abs(L + 40, top + i * lh, { fontFamily: FONT_ZH, fontWeight: 900, fontSize: 76, lineHeight: `${lh}px`, color: i === hlLine ? C.yellow : C.line, opacity: p, transform: `translateX(${(1 - p) * 40}px)`, whiteSpace: "nowrap" })}>
            {q}
          </div>
        );
      })}
      <HighlightBox x={L + 20} y={top + hlLine * lh + 4} w={720} h={lh - 8} delay={56} />
      <div style={abs(L, 1010, { width: CONTENT_W, display: "flex", justifyContent: "space-around" })}>
        {[["ship", "關稅"], ["chip", "晶片"], ["shield", "軍售"]].map(([ic, t], i) => (
          <div key={i} style={{ textAlign: "center", opacity: sp(f, 60 + i * 8, 14) }}>
            <Icon name={ic} size={130} progress={lin(f, 60 + i * 8, 90 + i * 8)} />
            <div style={{ fontFamily: FONT_ZH, fontWeight: 700, fontSize: 32, color: C.cyan, marginTop: 8 }}>{t}監督 ↑</div>
          </div>
        ))}
      </div>
    </>
  );
};

/* 12 片尾 */
const End: React.FC<P> = ({ scene, script }) => (
  <EndCard channel={script.channel} series={script.series} slogan={script.slogan} notes={scene.props.notes} asOf={script.asOf} />
);

export const SCENES: Record<string, React.FC<P>> = { Hook, Term, Compare, Seats, Divided, Impact, Tariff, Chip, Taiwan, Market, Summary, End };

/** 推鏡焦點（相對全畫面座標） */
export const FOCUS: Record<string, [number, number]> = {
  Hook: [540, 1000], Term: [540, 860], Compare: [540, 700], Seats: [540, 700], Divided: [540, 700], Impact: [540, 640],
  Tariff: [300, 720], Chip: [270, 710], Taiwan: [190, 780], Market: [540, 640], Summary: [400, 700], End: [540, 700],
};
