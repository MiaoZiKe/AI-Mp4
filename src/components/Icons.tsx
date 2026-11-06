import React from "react";
import { useCurrentFrame } from "remotion";
import { useV2 } from "../style";
import { AMBIENT } from "./anim";

/** 自繪霓虹描邊圖示（stroke 3px + 外發光），不使用外部圖片 */
const P: Record<string, React.ReactNode> = {
  capitol: (<>
    <path d="M20 88h80M26 88V58h68v30M34 58v30M46 58v30M58 58v30M70 58v30M82 58v30M22 58h76" />
    <path d="M36 58c0-16 10-26 24-26s24 10 24 26" /><path d="M60 32V18M54 18h12" /><path d="M48 44h24" />
  </>),
  ballot: (<>
    <rect x="22" y="52" width="76" height="44" rx="6" /><path d="M42 52h36" />
    <path d="M44 20h32v38H44z" /><path d="M52 36l6 6 12-12" />
  </>),
  scale: (<>
    <path d="M60 18v78M40 96h40M24 36h72" /><circle cx="60" cy="18" r="4" />
    <path d="M24 36l-12 28h24zM96 36l-12 28h24z" /><path d="M12 64c2 8 22 8 24 0M84 64c2 8 22 8 24 0" />
  </>),
  chip: (<>
    <rect x="32" y="32" width="56" height="56" rx="8" /><rect x="46" y="46" width="28" height="28" rx="3" />
    <path d="M44 32V18M60 32V18M76 32V18M44 102V88M60 102V88M76 102V88M32 44H18M32 60H18M32 76H18M102 44H88M102 60H88M102 76H88" />
  </>),
  container: (<>
    <rect x="14" y="40" width="92" height="44" rx="4" /><path d="M30 40v44M46 40v44M62 40v44M78 40v44M94 40v44" />
    <path d="M10 96h100" /><path d="M40 40l20-16 20 16" />
  </>),
  globe: (<>
    <circle cx="60" cy="60" r="40" /><ellipse cx="60" cy="60" rx="16" ry="40" /><path d="M20 60h80M26 40h68M26 80h68" />
  </>),
  money: (<>
    <rect x="16" y="34" width="88" height="52" rx="8" /><circle cx="60" cy="60" r="13" />
    <path d="M60 50v20M55 55h8a3 3 0 010 6h-6a3 3 0 000 6h9" /><path d="M28 46v28M92 46v28" />
  </>),
  chart: (<>
    <path d="M18 98h86M18 98V20" /><path d="M28 80l20-22 16 12 28-36" /><path d="M80 34h12v12" />
  </>),
  shield: (<>
    <path d="M60 16l36 14v26c0 24-16 38-36 46-20-8-36-22-36-46V30z" /><path d="M46 60l10 10 20-20" />
  </>),
  island: (<>
    <path d="M58 22c10 6 18 18 20 30s-2 30-10 40-16 12-20 4 2-20 0-32 0-24 4-34 2-12 6-8z" /><path d="M14 104h92" />
  </>),
  question: (<>
    <circle cx="60" cy="60" r="40" /><path d="M46 48c0-10 6-16 14-16s14 6 14 14c0 10-14 12-14 22" /><circle cx="60" cy="84" r="2" />
  </>),
  gavel: (<>
    <path d="M40 30l26 26M30 40l26 26" /><rect x="34" y="28" width="22" height="34" rx="3" transform="rotate(-45 45 45)" />
    <path d="M58 58l34 34" /><path d="M18 102h50" />
  </>),
  users: (<>
    <circle cx="44" cy="44" r="14" /><path d="M18 96c0-16 12-28 26-28s26 12 26 28" />
    <circle cx="82" cy="48" r="11" /><path d="M76 72c14 0 26 10 26 24" />
  </>),
  house: (<>
    <path d="M20 60L60 24l40 36" /><path d="M32 52v44h56V52" /><path d="M52 96V70h16v26" />
  </>),
  baby: (<>
    <circle cx="60" cy="46" r="22" /><path d="M60 24c0-8 6-10 10-8" /><path d="M28 102c0-18 14-30 32-30s32 12 32 30" />
    <circle cx="52" cy="44" r="2" /><circle cx="68" cy="44" r="2" /><path d="M52 54c4 4 12 4 16 0" />
  </>),
  heart: (<>
    <path d="M60 100S18 72 18 44c0-12 10-22 22-22 9 0 16 5 20 12 4-7 11-12 20-12 12 0 22 10 22 22 0 28-42 56-42 56z" />
  </>),
  clock: (<>
    <circle cx="60" cy="60" r="40" /><path d="M60 34v28l18 10" />
  </>),
  wallet: (<>
    <rect x="16" y="36" width="88" height="56" rx="8" /><path d="M16 50h88" /><path d="M78 64h26v16H78a8 8 0 010-16z" /><path d="M24 36l56-14 8 14" />
  </>),
  briefcase: (<>
    <rect x="16" y="40" width="88" height="54" rx="8" /><path d="M44 40V28h32v12" /><path d="M16 64h88M52 64v10h16V64" />
  </>),
  bitcoin: (<>
    <circle cx="60" cy="60" r="40" /><path d="M48 38h18a10 10 0 010 20H48zM48 58h22a10 10 0 010 20H48z" /><path d="M48 38v40M56 30v8M66 30v8M56 78v8M66 78v8" />
  </>),
  building: (<>
    <path d="M24 100V28h48v72" /><path d="M72 56h24v44" /><path d="M14 100h92" />
    <path d="M36 40h8M52 40h8M36 54h8M52 54h8M36 68h8M52 68h8M84 68h4M84 82h4M44 100V84h8v16" />
  </>),
  bank: (<>
    <path d="M16 48L60 24l44 24" /><path d="M20 48h80" /><path d="M28 48v34M44 48v34M60 48v34M76 48v34M92 48v34" /><path d="M16 82h88M12 96h96" />
  </>),
  cycle: (<>
    <path d="M92 44a36 36 0 00-66-8" /><path d="M20 30v16h16" /><path d="M28 76a36 36 0 0066 8" /><path d="M100 90V74H84" />
  </>),
  vault: (<>
    <rect x="18" y="22" width="84" height="76" rx="8" /><circle cx="60" cy="60" r="20" /><circle cx="60" cy="60" r="6" />
    <path d="M60 40v8M60 72v8M40 60h8M72 60h8" /><path d="M30 98v8M90 98v8" />
  </>),
  warning: (<>
    <path d="M60 20L106 100H14z" /><path d="M60 48v26" /><circle cx="60" cy="86" r="2" />
  </>),
  rocket: (<>
    <path d="M60 14c16 10 24 32 20 56H40c-4-24 4-46 20-56z" /><circle cx="60" cy="48" r="8" />
    <path d="M40 60L24 76l16 2M80 60l16 16-16 2" /><path d="M52 70l-4 20 12-8 12 8-4-20" />
  </>),
  bulb: (<>
    <path d="M40 50a20 20 0 1140 0c0 10-8 14-8 22H48c0-8-8-12-8-22z" /><path d="M48 84h24M52 94h16" /><path d="M60 14v6M26 30l4 4M94 30l-4 4" />
  </>),
  brain: (<>
    <path d="M56 24c-10 0-18 8-18 16-8 2-14 8-14 16 0 6 2 10 6 14-2 10 6 18 14 18 2 6 8 8 12 8V24z" />
    <path d="M64 24c10 0 18 8 18 16 8 2 14 8 14 16 0 6-2 10-6 14 2 10-6 18-14 18-2 6-8 8-12 8V24z" /><path d="M44 56h12M64 56h12M48 76h8M64 76h8" />
  </>),
  bolt: (<>
    <path d="M66 14L30 66h24l-6 40 40-54H64z" />
  </>),
  flag: (<>
    <path d="M28 108V16" /><path d="M28 22h60l-12 18 12 18H28" />
  </>),
  handshake: (<>
    <path d="M12 54l22-18 20 8 12-8 22 18" /><path d="M12 54l28 28c3 3 8 2 10-2M48 70l12 12c3 3 8 2 10-2M60 68l12 12c3 3 8 2 10-2M72 66l10 10 6-6" />
    <path d="M54 44L40 58c-2 2-2 6 1 8 2 2 6 2 8 0l9-9" />
  </>),
  graduation: (<>
    <path d="M12 48l48-20 48 20-48 20z" /><path d="M32 56v22c0 8 56 8 56 0V56" /><path d="M108 48v24" />
  </>),
  calendar: (<>
    <rect x="18" y="28" width="84" height="72" rx="8" /><path d="M18 48h84M40 20v16M80 20v16" /><path d="M34 64h8M56 64h8M78 64h8M34 82h8M56 82h8" />
  </>),
  lock: (<>
    <rect x="26" y="52" width="68" height="50" rx="8" /><path d="M40 52V38a20 20 0 0140 0v14" /><circle cx="60" cy="74" r="6" /><path d="M60 80v10" />
  </>),
  trendUp: (<>
    <path d="M18 92l26-28 16 14 40-40" /><path d="M78 38h22v22" />
  </>),
  trendDown: (<>
    <path d="M18 28l26 28 16-14 40 40" /><path d="M78 82h22V60" />
  </>),
  percent: (<>
    <path d="M28 92L92 28" /><circle cx="36" cy="36" r="12" /><circle cx="84" cy="84" r="12" />
  </>),
  ring: (<>
    <circle cx="60" cy="70" r="30" /><path d="M48 40l12-16 12 16" /><path d="M48 40h24" />
  </>),
  document: (<>
    <path d="M30 14h40l20 20v72H30z" /><path d="M70 14v20h20" /><path d="M42 56h36M42 70h36M42 84h24" />
  </>),
  server: (<>
    <rect x="20" y="20" width="80" height="24" rx="6" /><rect x="20" y="48" width="80" height="24" rx="6" /><rect x="20" y="76" width="80" height="24" rx="6" />
    <path d="M32 32h2M32 60h2M32 88h2M84 32h6M84 60h6M84 88h6" />
  </>),
  robot: (<>
    <rect x="24" y="40" width="72" height="56" rx="10" /><path d="M60 40V24" /><circle cx="60" cy="18" r="6" />
    <circle cx="44" cy="64" r="6" /><circle cx="76" cy="64" r="6" /><path d="M46 84h28" /><path d="M24 60H12M108 60H96" />
  </>),
  cloud: (<>
    <path d="M34 92a18 18 0 01-2-36 26 26 0 0150-8 20 20 0 014 44z" />
  </>),
  atom: (<>
    <circle cx="60" cy="60" r="5" /><ellipse cx="60" cy="60" rx="42" ry="16" /><ellipse cx="60" cy="60" rx="42" ry="16" transform="rotate(60 60 60)" /><ellipse cx="60" cy="60" rx="42" ry="16" transform="rotate(-60 60 60)" />
  </>),
  medical: (<>
    <rect x="20" y="20" width="80" height="80" rx="12" /><path d="M60 40v40M40 60h40" />
  </>),
  stroller: (<>
    <path d="M22 28h10l12 40h44l12-26H48" /><circle cx="46" cy="90" r="9" /><circle cx="90" cy="90" r="9" /><path d="M50 68l-4 13M86 68l4 13" />
  </>),
  coins: (<>
    <ellipse cx="60" cy="36" rx="30" ry="10" /><path d="M30 36v16c0 6 14 10 30 10s30-4 30-10V36" /><path d="M30 52v16c0 6 14 10 30 10s30-4 30-10V52" /><path d="M30 68v16c0 6 14 10 30 10s30-4 30-10V68" />
  </>),
  megaphone: (<>
    <path d="M20 50v20h14l34 20V30L34 50z" /><path d="M20 60H12" /><path d="M78 46a16 16 0 010 28M88 36a30 30 0 010 48" /><path d="M34 70l6 22h12l-4-22" />
  </>),
  key: (<>
    <circle cx="40" cy="60" r="20" /><circle cx="40" cy="60" r="6" /><path d="M58 60h48M92 60v14M80 60v10" />
  </>),
};

/** 每個子圖形加 pathLength=1：描線進度與實際路徑長度無關，所有筆畫同時從起點畫到終點 */
const withPathLength = (shape: React.ReactNode): React.ReactNode => {
  const kids = React.isValidElement(shape) ? (shape.props as { children?: React.ReactNode }).children : shape;
  return React.Children.map(kids, (c) => (React.isValidElement(c) ? React.cloneElement(c as React.ReactElement<{ pathLength?: number }>, { pathLength: 1 }) : c));
};
const SHAPES_V2: Record<string, React.ReactNode> = {};
const shapeV2 = (name: string) => (SHAPES_V2[name] ??= withPathLength(P[name] ?? P.question));
/** styleVersion 2 元件共用：圖示路徑（每個子圖形 pathLength=1） */
export const iconShapeV2 = shapeV2;

/** 霓虹光暈：不用 CSS filter（軟體渲染太慢），改用三層描邊（粗半透明 → 中 → 3px 實線），粗層透明度緩慢呼吸 */
export const Icon: React.FC<{ name: string; color: string; size?: number; draw?: number }> = ({ name, color, size = 120, draw = 1 }) => {
  const f = useCurrentFrame();
  const v2 = useV2();
  const breath = 0.26 + 0.1 * Math.sin((AMBIENT ? f : 0) / 9);
  // v1：固定 dasharray 420（短筆畫先畫完、長筆畫畫不滿）；v2：pathLength=1，畫完仍保留同一組 dash 設定（不切換渲染狀態）
  const dash = v2 ? { strokeDasharray: "1 1", strokeDashoffset: 1 - Math.min(1, Math.max(0, draw)) } : draw < 1 ? { strokeDasharray: 420, strokeDashoffset: 420 * (1 - draw) } : {};
  const shape = v2 ? shapeV2(name) : P[name] ?? P.question;
  const common = { fill: "none", stroke: color, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, ...dash };
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ overflow: "visible" }}>
      <g {...common} strokeWidth={11} opacity={breath}>{shape}</g>
      <g {...common} strokeWidth={6} opacity={0.4}>{shape}</g>
      <g {...common} strokeWidth={3}>{shape}</g>
    </svg>
  );
};
