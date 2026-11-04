import React from "react";
import { glow } from "../theme";

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
  whitehouse: (<>
    <path d="M14 96h92M20 96V56h80v40M14 56l46-26 46 26" /><path d="M34 56v40M48 56v40M72 56v40M86 56v40" />
    <path d="M52 96V78h16v18" /><path d="M60 30V16" /><path d="M60 16h12v8H60" />
  </>),
  calendar: (<>
    <rect x="18" y="26" width="84" height="74" rx="10" /><path d="M18 46h84M40 16v20M80 16v20" />
    <path d="M36 64h10M56 64h10M76 64h10M36 82h10M56 82h10" />
  </>),
  bill: (<>
    <path d="M30 14h44l18 18v74H30z" /><path d="M74 14v18h18" /><path d="M42 50h38M42 64h38M42 78h24" />
  </>),
  tag: (<>
    <path d="M18 60l42-42h40v40l-42 42z" /><circle cx="82" cy="36" r="7" /><path d="M48 68l8-8M56 76l14-14" />
  </>),
  bolt: (<>
    <path d="M66 12L28 68h28l-6 40 40-58H60z" />
  </>),
  users: (<>
    <circle cx="44" cy="44" r="14" /><path d="M18 96c0-16 12-28 26-28s26 12 26 28" />
    <circle cx="82" cy="48" r="11" /><path d="M76 72c14 0 26 10 26 24" />
  </>),
};

export const Icon: React.FC<{ name: string; color: string; size?: number; draw?: number }> = ({ name, color, size = 120, draw = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{ filter: glow(color, 10), overflow: "visible" }}>
    <g fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={draw < 1 ? 420 : undefined} strokeDashoffset={draw < 1 ? 420 * (1 - draw) : undefined}>
      {P[name] ?? P.question}
    </g>
  </svg>
);
