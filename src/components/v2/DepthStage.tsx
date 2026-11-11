// styleVersion 2：DepthStage 2.5D 景深舞台（只用 CSS perspective＋2D transform，不用任何 3D 引擎）
// 三層：背景大色塊面板＋細線圖示（視差 0.2）／中景 2 張堆疊卡從右下露出（0.5）／前景主卡 900 寬、rotateX 4–8°＋45° 長陰影（1.0）。
// 前景可以包現有 v2 卡片（CompareSplit、FlowRow、ImpactCard、IconGrid、TermCard、BigNumber），cue 照樣傳進去。
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_ZH, LAYOUT_V2 as L, THEME_V2 as T, accentV2, longShadowCss } from "../../theme";
import { DUR, EASE, bump, springUi, tween } from "../anim";
import { cueAt, cueIn, useCue } from "../../cue";
import { IconV2, reveal } from "./base";
import { CompareSplitV2, FlowRowV2, IconGridV2, ImpactCardV2, TermCardV2 } from "./Cards";
import { BigNumberV2 } from "./BigNumber";

const FRONTS: Record<string, React.FC<any>> = { CompareSplit: CompareSplitV2, FlowRow: FlowRowV2, ImpactCard: ImpactCardV2, IconGrid: IconGridV2, TermCard: TermCardV2, BigNumber: BigNumberV2 };
/** 前景元件本身就是一張卡（有自己的紙底）→ 不再墊一層紙 */
const SELF_CARD = new Set(["ImpactCard", "TermCard", "BigNumber"]);
export const DEPTH_FRONTS = Object.keys(FRONTS);

type Badge = { text: string; color?: string; at?: string; pos?: "tl" | "tr" | "bl" | "br" };
export type DepthStageProps = {
  front: { component: string; props: Record<string, any> };
  stack?: { color?: string }[];
  back?: { icons?: string[]; color?: string };
  badges?: Badge[];
  tilt?: number;
  /** 景深模糊（px，只套在背景層；預設 0，軟體渲染下 blur 很貴） */
  dof?: number;
  color?: string;
};

const H = L.CONTENT_BOTTOM - L.CONTENT_TOP;
const FX = 0, FY = L.DEPTH_TOP - L.CONTENT_TOP, FW = L.FRONT_W, FH = L.DEPTH_BOTTOM - L.DEPTH_TOP;
const K = FW / 952; // 前景元件以 952 寬排版，再縮到 900
/** 細線圖示位置（背景層，局部座標；大多落在前景卡外緣與空白帶） */
const ICON_SLOTS = [{ x: -40, y: -6, s: 120 }, { x: 860, y: -20, s: 96 }, { x: -30, y: 760, s: 104 }, { x: 870, y: 820, s: 130 }, { x: 430, y: 852, s: 72 }];

export const DepthStage: React.FC<DepthStageProps> = ({ front, stack = [{}, {}], back = {}, badges = [], tilt = T.depth.tiltX, dof = 0, color }) => {
  const f = useCurrentFrame();
  const c = useCue();
  const Comp = FRONTS[front.component];
  if (!Comp) throw new Error(`DepthStage: 前景不支援 ${front.component}`);
  const acc = accentV2(color ?? back.color);
  // 視差：整幕緩慢水平漂移，三層速度 0.2 : 0.5 : 1.0（前景 60px）
  const d = tween(f, 0, Math.max(1, c.exit), EASE.move);
  const [pb, pm, pf] = T.depth.parallax;
  // 只往左漂（右側留給堆疊卡與徽章）：前景 x 60 → 0、中景 30 → 0、背景 12 → 0，始終在安全區內
  const sh = (_k: number) => 0 * d; // v3：拿掉整幕漂移
  // 前景進場：rotateX 12° → tilt（ui spring，無過衝），上移 24px
  const s = springUi(f, 0);
  const rx = T.depth.tiltEnter + (Math.min(8, Math.max(4, tilt)) - T.depth.tiltEnter) * s;
  return (
    <div style={{ position: "relative", width: 952, height: H }}>
      {/* 背景層：大色塊面板（比前景大約 12%、偏移 40px）＋細線圖示 */}
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${sh(pb).toFixed(2)}px)`, filter: dof > 0 ? `blur(${Math.min(4, dof)}px)` : undefined }}>
        <div style={{ position: "absolute", left: FX - 46, top: FY - 40, width: FW * 1.06 + 40, height: FH * 1.06 + 40, borderRadius: L.BLOCK_RADIUS, background: acc.soft, opacity: tween(f, 0, DUR.m) }} />
        {(back.icons ?? []).slice(0, 5).map((name, i) => {
          const sl = ICON_SLOTS[i];
          return <div key={i} style={{ position: "absolute", left: sl.x, top: sl.y, opacity: 0.14 * tween(f, 4 + i * 4, DUR.m) }}><IconV2 name={name} color={back.color ?? color} size={sl.s} /></div>;
        })}
      </div>
      {/* 中景：堆疊卡（以右下角為縮放原點，從右下各露出 24px） */}
      {stack.slice(0, 2).map((st, i) => {
        const cfg = T.depth.stack[i];
        const e = tween(f, 4 + i * 4, DUR.l, EASE.enter);
        const a = accentV2(st.color ?? (i ? "yellow" : "cyan"));
        return (
          <div key={i} style={{ position: "absolute", left: FX, top: FY, width: FW, height: FH, zIndex: 2 - i, opacity: cfg.opacity * e,
            transform: `translateX(${(sh(pm) + cfg.dx * e).toFixed(2)}px) translateY(${(cfg.dy * e).toFixed(1)}px) scale(${cfg.scale})`, transformOrigin: "100% 100%",
            background: T.card, border: `${T.cardBorderW}px solid ${T.cardBorder}`, borderRight: `10px solid ${a.fill}`, borderBottom: `10px solid ${a.fill}`, borderRadius: T.radius, boxShadow: T.shadow }} />
        );
      })}
      {/* 前景：透視傾斜＋長陰影 */}
      <div style={{ position: "absolute", left: FX, top: FY, width: FW, height: FH, zIndex: 5, perspective: T.depth.perspective, perspectiveOrigin: "50% 30%" }}>
        <div style={{ width: FW, height: FH, opacity: tween(f, 0, DUR.s), transform: `translateX(${sh(pf).toFixed(2)}px) translateY(${Math.round((1 - s) * 24)}px) rotateX(${rx.toFixed(2)}deg)`, transformOrigin: "50% 100%",
          borderRadius: T.radius, boxShadow: longShadowCss(), background: SELF_CARD.has(front.component) ? undefined : T.card, border: SELF_CARD.has(front.component) ? undefined : `${T.cardBorderW}px solid ${T.cardBorder}` }}>
          <div style={{ width: 952, height: FH / K, transform: `scale(${K.toFixed(4)})`, transformOrigin: "0 0", display: "flex", alignItems: "stretch", justifyContent: "center", padding: SELF_CARD.has(front.component) ? 0 : "28px 0", boxSizing: "border-box" }}>
            <Comp {...front.props} />
          </div>
        </div>
        {/* 徽章：貼在前景卡邊緣、可半出界 */}
        {badges.slice(0, 2).map((b, i) => {
          const t = cueIn(c, b.at, 14 + i * 8);
          const r = reveal(f, t, 1, 12);
          const a = accentV2(b.color);
          const pos = b.pos ?? (i ? "br" : "tr");
          const place: React.CSSProperties = { ...(pos[0] === "t" ? { top: -34 } : { bottom: -34 }), ...(pos[1] === "l" ? { left: 12 } : { right: -14 }) };
          return (
            <div key={i} style={{ position: "absolute", ...place, ...r, transform: `${r.transform} translateX(${sh(pf).toFixed(2)}px) rotate(${pos[1] === "l" ? -3 : 3}deg)`,
              background: a.fill, color: T.onAccent, fontFamily: FONT_ZH, fontSize: 40, fontWeight: 900, padding: "10px 26px", borderRadius: T.radiusTag, boxShadow: longShadowCss(12), whiteSpace: "nowrap", zIndex: 6 }}>{b.text}</div>
          );
        })}
      </div>
    </div>
  );
};
