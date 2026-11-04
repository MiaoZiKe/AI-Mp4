import React from "react";
import { C, STROKE } from "../theme";

const circ = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y} H${x + w} V${y + h} H${x} Z`;

/** Catmull-Rom 平滑封閉曲線 */
const smoothClosed = (pts: [number, number][]) => {
  const n = pts.length;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d + " Z";
};

const TAIWAN: [number, number][] = [
  [122, 8], [146, 20], [166, 40], [172, 62], [164, 100], [154, 150], [142, 205], [126, 262],
  [110, 312], [96, 352], [82, 392], [70, 372], [54, 334], [38, 290], [24, 236], [20, 190],
  [28, 148], [44, 108], [66, 70], [90, 36], [106, 16],
];

type IconDef = { w: number; h: number; paths: string[]; accent?: string[] };

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export const ICONS: Record<string, IconDef> = {
  capitol: {
    w: 200, h: 160,
    paths: [
      "M6 154 H194", "M16 146 H184 V154", "M20 146 V104 H70 V146", "M130 146 V104 H180 V146",
      "M70 146 V92 H130 V146", "M64 92 L100 78 L136 92", "M80 78 V62 H120 V78",
      "M74 62 Q100 8 126 62", "M96 28 V16 H104 V28", "M100 16 V4",
      ...[82, 94, 106, 118].map((x) => `M${x} 146 V98`),
      ...[30, 42, 54, 146, 158, 170].map((x) => `M${x} 146 V110`),
    ],
    accent: ["M20 104 L70 104", "M130 104 L180 104"],
  },
  ballot: {
    w: 160, h: 160,
    paths: [
      "M62 72 V18 H98 V72", "M70 42 L78 52 L92 30", rect(18, 72, 124, 78), "M56 72 V66 H104 V72",
      "M34 96 H126", "M34 132 H70",
    ],
  },
  scale: {
    w: 160, h: 160,
    paths: [
      "M80 22 V140", "M54 152 H106", "M62 140 H98 V152", "M18 40 H142", circ(80, 22, 6),
      "M18 40 L6 92", "M18 40 L30 92", "M4 92 Q18 108 32 92 Z",
      "M142 40 L130 92", "M142 40 L154 92", "M128 92 Q142 108 156 92 Z",
    ],
  },
  chip: {
    w: 200, h: 200,
    paths: [
      rect(40, 40, 120, 120), rect(68, 68, 64, 64), circ(54, 54, 5),
      ...range(6).flatMap((i) => {
        const p = 52 + i * 19.2;
        return [`M${p} 40 V20`, `M${p} 160 V180`, `M40 ${p} H20`, `M160 ${p} H180`];
      }),
    ],
    accent: range(7).map((i) => {
      const o = (i + 1) * 16;
      return `M${68 + Math.max(0, o - 64)} ${Math.min(132, 68 + o)} L${Math.min(132, 68 + o)} ${68 + Math.max(0, o - 64)}`;
    }),
  },
  ship: {
    w: 240, h: 150,
    paths: [
      "M8 96 H232 L212 128 H32 Z", "M188 96 V52 H216 V96", "M194 64 H210", "M202 52 V38",
      ...[0, 1, 2, 3, 4].map((i) => rect(24 + i * 32, 72, 30, 24)),
      ...[0, 1, 2, 3].map((i) => rect(40 + i * 32, 48, 30, 24)),
      "M0 142 Q15 134 30 142 T60 142 T90 142 T120 142 T150 142 T180 142 T210 142 T240 142",
    ],
  },
  globe: {
    w: 160, h: 160,
    paths: [
      circ(80, 80, 70), "M10 80 H150", "M80 10 V150",
      "M80 10 Q30 80 80 150", "M80 10 Q130 80 80 150",
      "M22 42 Q80 56 138 42", "M22 118 Q80 104 138 118",
    ],
  },
  taiwan: { w: 190, h: 400, paths: [smoothClosed(TAIWAN)] },
  stock: {
    w: 260, h: 160,
    paths: [
      "M20 10 V140 H250",
      "M20 70 L52 64 L80 78 L104 110 L122 120 L140 96 L166 88 L192 60 L220 44 L246 30",
      ...[50, 100, 150, 200].map((x) => `M${x} 140 V146`),
    ],
  },
  shield: {
    w: 140, h: 160,
    paths: ["M70 8 L130 30 V80 Q130 128 70 152 Q10 128 10 80 V30 Z", "M70 24 L116 40 V80 Q116 118 70 138 Q24 118 24 80 V40 Z", "M48 80 L64 96 L94 62"],
  },
  whitehouse: {
    w: 200, h: 150,
    paths: [
      "M8 144 H192", "M16 136 H184 V144", rect(20, 70, 160, 66), "M60 70 L100 40 L140 70",
      ...[66, 82, 98, 114, 130].map((x) => `M${x + 2} 136 V76`),
      ...[32, 46, 154, 168].map((x) => rect(x - 4, 88, 8, 16)),
      "M100 40 V14", "M100 14 H118 V24 H100",
    ],
  },
};

type IconProps = {
  name: keyof typeof ICONS | string;
  size: number; // 寬度 px
  progress?: number; // 0..1 描線進度
  color?: string;
  accentColor?: string;
  strokeWidth?: number;
  fill?: string;
  style?: React.CSSProperties;
};

/** 線稿圖示，progress 控制 stroke-dashoffset 描線動畫（逐筆錯開） */
export const Icon: React.FC<IconProps> = ({
  name, size, progress = 1, color = C.line, accentColor = C.cyan, strokeWidth = STROKE, fill = "none", style,
}) => {
  const def = ICONS[name];
  if (!def) return null;
  const scale = size / def.w;
  const all = [...def.paths.map((d) => ({ d, c: color })), ...(def.accent ?? []).map((d) => ({ d, c: accentColor }))];
  const n = all.length;
  return (
    <svg width={size} height={def.h * scale} viewBox={`-4 -4 ${def.w + 8} ${def.h + 8}`} style={{ overflow: "visible", ...style }}>
      {all.map((p, i) => {
        const local = Math.max(0, Math.min(1, progress * (1 + n * 0.08) - i * 0.08));
        return (
          <path
            key={i}
            d={p.d}
            pathLength={1}
            fill={i === 0 && local >= 1 ? fill : "none"}
            stroke={p.c}
            strokeWidth={strokeWidth / scale}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={1}
            strokeDashoffset={1 - local}
          />
        );
      })}
    </svg>
  );
};

export const Logo: React.FC<{ size: number; color?: string }> = ({ size, color = C.line }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx={32} cy={32} r={26} fill="none" stroke={color} strokeWidth={3} />
    <ellipse cx={32} cy={32} rx={11} ry={26} fill="none" stroke={color} strokeWidth={2.2} />
    <path d="M6 32 H58 M10 19 H54 M10 45 H54" stroke={color} strokeWidth={2.2} fill="none" />
    <path d="M32 0 V10 M32 54 V64 M0 32 H6 M58 32 H64" stroke={C.yellow} strokeWidth={3} />
    <circle cx={32} cy={32} r={4} fill={C.yellow} />
  </svg>
);
