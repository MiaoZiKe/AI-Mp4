// Generates 9 mockups (3 themes x 3 scenes) as HTML, screenshots them with Playwright,
// and prints WCAG contrast ratios for each theme's tokens.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = __dirname;
const FONT_ROOT = '/home/user/AI-Mp4/public/';

// ---------- fonts (local mirror; Google Fonts is unreachable from headless Chrome here) ----------
const manifest = JSON.parse(fs.readFileSync(FONT_ROOT + 'fonts/manifest.json', 'utf8'));
const fontCss = manifest
  .map(
    (f) => `@font-face{font-family:'${f.family}';font-style:normal;font-weight:${f.weight};font-display:block;src:url('file://${FONT_ROOT}${f.file}') format('woff2');unicode-range:${f.unicodeRange};}`
  )
  .join('\n');

// ---------- contrast ----------
function lum(hex) {
  const n = hex.replace('#', '');
  const c = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// ---------- themes ----------
const themes = {
  A: {
    name: '奶油編輯 Editorial Cream',
    kind: 'editorial',
    t: {
      bg: '#FBF5EA', bg2: '#FBF5EA', text: '#14213D', text2: '#4B5675', text3: '#5F6673',
      card: '#FFFDF8', cardBorder: '#E6D9C2', shadow: '0 2px 0 #E6D9C2, 0 18px 40px -18px rgba(20,33,61,.22)',
      radius: '14px', pill: '999px',
      primary: '#E8613C', primaryText: '#C2441F', acc1: '#F5B83D', acc1Text: '#8A5E00', acc2: '#2A7F8F', acc2Text: '#1F6A78',
      k: ['#C2441F', '#14213D', '#1F6A78'], kMark: '#F5B83D',
      okBg: '#E2F0E7', okFg: '#1E6544', expBg: '#FCEBCB', expFg: '#8A5300', tbdBg: '#ECE7F3', tbdFg: '#5A4D7A',
      dem: '#5B7BA8', rep: '#B0645C',
      titleWeight: 900, bodyWeight: 500,
    },
  },
  B: {
    name: '晴空金融 Clear Fintech',
    kind: 'fintech',
    t: {
      bg: '#F5F8FC', bg2: '#FFFFFF', text: '#0F172A', text2: '#475569', text3: '#5B6A80',
      card: '#FFFFFF', cardBorder: '#E2E8F0', shadow: '0 1px 2px rgba(15,23,42,.06), 0 12px 32px -8px rgba(15,23,42,.10)',
      radius: '24px', pill: '999px',
      primary: '#0EA5E9', primaryText: '#0369A1', acc1: '#10B981', acc1Text: '#047857', acc2: '#F59E0B', acc2Text: '#B45309',
      k: ['#0369A1', '#047857', '#B45309'], kMark: null,
      okBg: '#D1FAE5', okFg: '#065F46', expBg: '#FEF3C7', expFg: '#92400E', tbdBg: '#E2E8F0', tbdFg: '#334155',
      dem: '#4E79A7', rep: '#B5676A',
      titleWeight: 900, bodyWeight: 500,
    },
  },
  C: {
    name: '杏桃薄荷 Apricot Mint',
    kind: 'casual',
    t: {
      bg: '#FFE8D6', bg2: '#E2F5EC', text: '#2A2C33', text2: '#555A64', text3: '#5E636C',
      card: 'rgba(255,255,255,.86)', cardSolid: '#FFFFFF', cardBorder: '#2A2C33', shadow: '6px 8px 0 rgba(42,44,51,.10)',
      radius: '36px', pill: '999px',
      primary: '#F0714B', primaryText: '#A8401C', acc1: '#3BB59C', acc1Text: '#0E7363', acc2: '#8C7BE8', acc2Text: '#5B48C2',
      k: ['#A8401C', '#0E7363', '#5B48C2'], kMark: null,
      okBg: '#D3F1E6', okFg: '#0E6153', expBg: '#FFEBC2', expFg: '#7F5000', tbdBg: '#ECEAF4', tbdFg: '#4E4A66',
      dem: '#5A7BB0', rep: '#B26A60',
      titleWeight: 900, bodyWeight: 500,
    },
  },
};

// ---------- icons ----------
// Each theme draws the same glyph set with its own treatment.
const glyph = {
  btc: `<circle cx="50" cy="50" r="38"/><path d="M40 30v40M48 26v8M48 66v8M40 30h14a9 9 0 0 1 0 18H40M40 48h16a11 11 0 0 1 0 22H40"/>`,
  trendDown: `<path d="M12 26l26 26 16-14 34 34"/><path d="M68 72h20V52"/>`,
  trendUp: `<path d="M12 74l26-26 16 14 34-34"/><path d="M68 28h20v20"/>`,
  percent: `<circle cx="30" cy="30" r="12"/><circle cx="70" cy="70" r="12"/><path d="M78 18L22 82"/>`,
  warn: `<path d="M50 12L90 84H10z"/><path d="M50 40v20M50 70v2"/>`,
  globe: `<circle cx="50" cy="50" r="36"/><ellipse cx="50" cy="50" rx="15" ry="36"/><path d="M14 50h72M20 32h60M20 68h60"/>`,
};
const blobFill = {
  btc: `<circle cx="58" cy="56" r="34"/>`,
  trendDown: `<rect x="40" y="46" width="48" height="40" rx="6"/>`,
  trendUp: `<rect x="40" y="18" width="48" height="40" rx="6"/>`,
  percent: `<circle cx="64" cy="64" r="26"/>`,
  warn: `<path d="M56 24L92 88H20z"/>`,
  globe: `<circle cx="58" cy="56" r="32"/>`,
};
function icon(theme, name, size, opt = {}) {
  const t = theme.t;
  const stroke = opt.stroke || t.text;
  const fill = opt.fill || t.acc1;
  if (theme.kind === 'editorial') {
    // risograph-style: solid offset colour block + navy line on top
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><g fill="${fill}" opacity=".9">${blobFill[name]}</g><g fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="square" stroke-linejoin="miter">${glyph[name]}</g></svg>`;
  }
  if (theme.kind === 'fintech') {
    // crisp rounded line icon inside a tinted squircle tile
    const tile = opt.tile || '#E0F2FE';
    const col = opt.stroke || t.primaryText;
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><rect x="0" y="0" width="100" height="100" rx="28" fill="${tile}"/><g transform="translate(20 20) scale(.6)" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${glyph[name]}</g></svg>`;
  }
  // casual: soft colour blob + wobbly hand-drawn charcoal line (displacement filter)
  const id = 'w' + Math.random().toString(36).slice(2, 7);
  return `<svg width="${size}" height="${size}" viewBox="-6 -6 112 112"><defs><filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="4.5"/></filter></defs><g fill="${fill}" opacity=".55" filter="url(#${id})">${blobFill[name]}</g><g filter="url(#${id})" fill="none" stroke="${stroke}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">${glyph[name]}</g></svg>`;
}

// ---------- shared pieces ----------
function hl(text, kws, theme) {
  // colour keywords in order; editorial also gets a highlighter mark on the 2nd keyword colour
  let out = text;
  kws.forEach((k, i) => {
    const c = theme.t.k[i % theme.t.k.length];
    let style = `color:${c}`;
    if (theme.kind === 'editorial' && i % 3 === 1) style = `color:${theme.t.text};background:linear-gradient(transparent 58%, ${theme.t.kMark}cc 58%, ${theme.t.kMark}cc 92%, transparent 92%)`;
    if (theme.kind === 'casual') style += `;text-decoration:underline wavy ${c}66;text-underline-offset:14px;text-decoration-thickness:4px`;
    out = out.replace(k, `<span class="kw" style="${style}">${k}</span>`);
  });
  return out;
}

function header(theme) {
  return `<header class="hdr">
    <div class="logo"><span class="logo-mark">${icon(theme, 'globe', 60, theme.kind === 'fintech' ? { tile: theme.t.primary, stroke: '#FFFFFF' } : { fill: theme.t.acc1 })}</span><span class="logo-txt">白話國際</span></div>
    <div class="cap">國際白話講</div>
  </header>`;
}
function footer(src) {
  return `<footer class="src">資料來源：${src}｜截至 2026/11/6</footer>`;
}
function subtitle(lines, en, kws, theme) {
  return `<div class="sub"><div class="sub-box"><div class="zh">${lines.map((l) => `<div>${hl(l, kws, theme)}</div>`).join('')}</div><div class="en">${en}</div></div></div>`;
}
function status(kind) {
  const label = { ok: '已確定', exp: '分析預期', tbd: '尚未確定' }[kind];
  return `<span class="st st-${kind}">${label}</span>`;
}

// ---------- scenes ----------
function sceneCover(theme) {
  const t = theme.t;
  return `${header(theme)}
  <main class="cover">
    <div class="kicker"><span class="kdot"></span>比特幣 × 美股｜Strategy (MSTR)</div>
    <h1 class="ctitle">MSTR 說不賣<br><span class="ckey">卻開始賣幣</span></h1>
    <p class="csub">全球最大持幣上市公司的飛輪與反轉</p>
    <div class="illus">${coverIllus(theme)}</div>
    <div class="chips">
      <div class="chip"><b>約 85 萬枚</b><span>持幣全球上市公司第一</span></div>
      <div class="chip"><b>≈ 0.90</b><span>mNAV 溢價幾乎歸零</span></div>
      <div class="chip"><b>5 月起</b><span>賣幣支付優先股息</span></div>
    </div>
  </main>
  ${footer('SEC 8-K、Strategy Q3 2026 財報、CoinDesk')}`;
}

function coverIllus(theme) {
  const t = theme.t;
  const k = theme.kind;
  // chart: rise (flywheel) then fall (reversal); coin sits at the peak
  const pts = [[40, 520], [140, 470], [230, 430], [320, 330], [410, 300], [500, 190], [590, 170], [670, 250], [760, 300], [850, 420], [910, 450]];
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  const area = d + ' L910 600 L40 600 Z';
  const gridCol = k === 'fintech' ? '#E2E8F0' : k === 'editorial' ? '#E6D9C2' : 'rgba(42,44,51,.12)';
  let grid = '';
  for (let y = 120; y <= 600; y += 120) grid += `<line x1="20" x2="932" y1="${y}" y2="${y}" stroke="${gridCol}" stroke-width="2" ${k === 'casual' ? 'stroke-dasharray="2 14" stroke-linecap="round"' : ''}/>`;
  const upCol = k === 'fintech' ? t.acc1 : k === 'editorial' ? t.acc2 : t.acc1;
  const downCol = t.primary;
  const rise = pts.slice(0, 7).map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  const fall = pts.slice(6).map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  const wobble = k === 'casual' ? 'filter="url(#cw)"' : '';
  const sw = k === 'editorial' ? 10 : k === 'fintech' ? 9 : 11;
  const cap = k === 'editorial' ? 'square' : 'round';
  const coinX = 590 - 115, coinY = -130;
  const coin = icon(theme, 'btc', 230, k === 'fintech' ? { tile: '#FEF3C7', stroke: '#B45309' } : { fill: t.acc1 === '#3BB59C' ? '#FFC857' : t.acc1 });
  const areaFill = k === 'fintech' ? `url(#ga)` : k === 'editorial' ? `${t.acc1}33` : `${t.acc1}2e`;
  return `<svg viewBox="0 -90 952 710" preserveAspectRatio="xMidYMax meet">
    <defs>
      <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.primary}" stop-opacity=".22"/><stop offset="1" stop-color="${t.primary}" stop-opacity="0"/></linearGradient>
      <filter id="cw"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter>
    </defs>
    ${grid}
    <path d="${area}" fill="${areaFill}" ${wobble}/>
    <path d="${rise}" fill="none" stroke="${upCol}" stroke-width="${sw}" stroke-linecap="${cap}" stroke-linejoin="round" ${wobble}/>
    <path d="${fall}" fill="none" stroke="${downCol}" stroke-width="${sw}" stroke-linecap="${cap}" stroke-linejoin="round" ${k === 'fintech' ? 'stroke-dasharray="2 18"' : ''} ${wobble}/>
    <path d="M870 380 L912 452 L830 456" fill="none" stroke="${downCol}" stroke-width="${sw}" stroke-linecap="${cap}" stroke-linejoin="round" ${wobble}/>
    <g transform="translate(${coinX} ${coinY + 40})">${coin.replace('<svg ', '<svg x="0" y="0" ')}</g>
    <g font-family="Noto Sans TC" font-weight="900" font-size="34">
      <g transform="translate(70 ${k === 'casual' ? 300 : 300}) ${k === 'casual' ? 'rotate(-4)' : ''}">
        <rect x="0" y="-46" width="230" height="64" rx="${k === 'editorial' ? 6 : 32}" fill="${k === 'fintech' ? '#D1FAE5' : t.cardSolid || t.card}" stroke="${k === 'casual' ? t.text : 'none'}" stroke-width="3"/>
        <text x="115" y="-2" text-anchor="middle" fill="${k === 'fintech' ? '#065F46' : t.text}">飛輪 2024–25</text>
      </g>
      <g transform="translate(680 ${k === 'casual' ? 560 : 560}) ${k === 'casual' ? 'rotate(3)' : ''}">
        <rect x="0" y="-46" width="230" height="64" rx="${k === 'editorial' ? 6 : 32}" fill="${k === 'fintech' ? '#FFE4DA' : t.primary}" stroke="${k === 'casual' ? t.text : 'none'}" stroke-width="3"/>
        <text x="115" y="-2" text-anchor="middle" fill="${k === 'fintech' ? '#9A3412' : k === 'editorial' ? '#FFFFFF' : t.text}">反轉 2026</text>
      </g>
    </g>
  </svg>`;
}

function sceneBig(theme) {
  const t = theme.t;
  return `${header(theme)}
  <main class="content">
    <div class="card big">
      <div class="big-head">${icon(theme, 'percent', 96, theme.kind === 'fintech' ? { tile: '#FFE4DA', stroke: '#C2410C' } : { fill: t.acc1 })}<div><div class="big-label">2026 年至今 BTC Yield</div><div class="big-label-en">Bitcoin per share, YTD</div></div></div>
      <div class="big-num">−3.7<span>%</span></div>
      <div class="bars">
        <div class="bar-row"><span class="bl">持幣數</span><div class="track"><div class="fill f1" style="width:${26 / 31 * 100}%"></div></div><span class="bv up">+26%</span></div>
        <div class="bar-row"><span class="bl">股數</span><div class="track"><div class="fill f2" style="width:100%"></div></div><span class="bv up2">+31%</span></div>
      </div>
      <div class="big-note">公司自創指標：每股所含比特幣的變化率（截至 10/25）</div>
      <div class="big-foot">${status('ok')}</div>
    </div>
  </main>
  ${subtitle(['幣多了26%，', '股數多了31%，', '每股含幣反而少3.7%。'], 'Bitcoin held rose 26%, but diluted shares rose 31%, so bitcoin per share fell 3.7%.', ['26%', '31%', '每股含幣'], theme)}
  ${footer('Strategy Q3 2026 8-K、10-Q')}`;
}

function sceneImpact(theme) {
  const t = theme.t;
  const rows = [
    ['ok', '平均成本約 75,451 美元；11/5 幣價一度跌到約 75,600'],
    ['tbd', 'MSCI 預計 11/11 公布名單，截至 2026/11/6 尚未確定'],
    ['exp', '若被剔除，被動基金得賣股；摩根大通 2025/11 估約 28 億美元'],
    ['exp', '分析師看法分歧，目標價區間很寬（非投資建議）'],
  ];
  return `${header(theme)}
  <main class="content">
    <div class="card impact">
      <div class="imp-head">${icon(theme, 'warn', 88, theme.kind === 'fintech' ? { tile: '#FFE4DA', stroke: '#C2410C' } : { fill: t.primary })}<div><div class="imp-title">風險與批評</div><div class="imp-en">Risks &amp; criticism</div></div></div>
      <div class="imp-rows">${rows.map(([s, txt]) => `<div class="imp-row">${status(s)}<p>${txt}</p></div>`).join('')}</div>
      <div class="imp-note">台灣視角：複委託可買 MSTR；現貨比特幣 ETF 目前限專業投資人</div>
    </div>
  </main>
  ${subtitle(['風險有兩個：', '幣價貼近成本線，', '指數會不會剔除它還沒定。'], 'Two risks: bitcoin sits near its cost basis, and an index removal is still undecided.', ['成本線', '剔除'], theme)}
  ${footer('SEC 8-K、CoinDesk、MarketBeat')}`;
}

// ---------- CSS ----------
function css(theme) {
  const t = theme.t;
  const k = theme.kind;
  const vars = `--bg:${t.bg};--text:${t.text};--text2:${t.text2};--text3:${t.text3};--card:${t.card};--cb:${t.cardBorder};--sh:${t.shadow};--r:${t.radius};--p:${t.primary};--pt:${t.primaryText};--a1:${t.acc1};--a1t:${t.acc1Text};--a2:${t.acc2};--a2t:${t.acc2Text};`;
  const base = `
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:1080px;height:1920px;overflow:hidden}
  body{font-family:Inter,'Noto Sans TC',sans-serif;color:var(--text);${vars}}
  .frame{position:relative;width:1080px;height:1920px;overflow:hidden}
  .hdr{position:absolute;top:220px;left:64px;right:64px;height:72px;display:flex;align-items:center;justify-content:space-between;z-index:3}
  .logo{display:flex;align-items:center;gap:16px}
  .logo-txt{font-size:40px;font-weight:900;letter-spacing:.04em}
  .cap{font-size:28px;font-weight:700;padding:10px 26px;border-radius:999px;letter-spacing:.06em}
  .stack{position:absolute;top:340px;bottom:220px;left:64px;right:64px;display:flex;flex-direction:column;z-index:2}
  .src{flex:0 0 auto;margin-top:26px;font-size:24px;color:var(--text3);font-weight:400;z-index:3}
  .content{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;z-index:2}
  .sub{flex:0 0 auto;margin-top:36px;display:flex;justify-content:center;z-index:3}
  .sub-box{width:100%;text-align:center}
  .zh{font-size:74px;font-weight:900;line-height:1.24;letter-spacing:.01em;color:var(--text)}
  .en{margin-top:16px;font-size:30px;font-weight:500;line-height:1.35;color:var(--text2)}
  .kw{padding:0 2px}
  .card{background:var(--card);border-radius:var(--r);box-shadow:var(--sh);width:100%}
  .st{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;min-width:170px;height:54px;padding:0 18px;border-radius:${k === 'editorial' ? '8px' : '999px'};font-size:28px;font-weight:700;letter-spacing:.04em}
  .st-ok{background:${t.okBg};color:${t.okFg}}
  .st-exp{background:${t.expBg};color:${t.expFg}}
  .st-tbd{background:${t.tbdBg};color:${t.tbdFg}}
  /* big number */
  .big{padding:48px 52px 44px}
  .big-head{display:flex;align-items:center;gap:24px}
  .big-label{font-size:46px;font-weight:900}
  .big-label-en{font-size:26px;color:var(--text3);margin-top:4px}
  .big-num{font-family:Inter;font-weight:800;font-size:230px;line-height:1;letter-spacing:-.04em;margin:26px 0 26px;color:var(--pt);font-variant-numeric:tabular-nums}
  .big-num span{font-size:150px;margin-left:6px}
  .bars{display:flex;flex-direction:column;gap:22px}
  .bar-row{display:flex;align-items:center;gap:20px}
  .bl{width:120px;font-size:32px;font-weight:700;color:var(--text2)}
  .track{flex:1;height:34px;border-radius:${k === 'editorial' ? '4px' : '999px'};background:${k === 'fintech' ? '#EEF2F7' : k === 'editorial' ? '#F1E7D6' : 'rgba(42,44,51,.08)'};overflow:hidden}
  .fill{height:100%;border-radius:inherit}
  .f1{background:var(--a1)} .f2{background:var(--p)}
  .bv{width:120px;text-align:right;font-family:Inter;font-weight:800;font-size:38px}
  .up{color:var(--a1t)} .up2{color:var(--pt)}
  .big-note{margin-top:26px;font-size:32px;line-height:1.5;color:var(--text2)}
  .big-foot{margin-top:24px}
  /* impact */
  .impact{padding:40px 44px 40px}
  .imp-head{display:flex;align-items:center;gap:22px;padding-bottom:22px;margin-bottom:6px}
  .imp-title{font-size:56px;font-weight:900}
  .imp-en{font-size:26px;color:var(--text3);margin-top:2px}
  .imp-rows{display:flex;flex-direction:column}
  .imp-row{display:flex;gap:22px;align-items:flex-start;padding:18px 0}
  .imp-row p{font-size:32px;line-height:1.45;font-weight:500;padding-top:3px}
  .imp-note{margin-top:14px;padding:18px 24px;font-size:27px;line-height:1.5;font-weight:500;border-radius:calc(var(--r) * .6)}
  /* cover */
  .cover{flex:1;min-height:0;display:flex;flex-direction:column;z-index:2}
  .kicker{display:inline-flex;align-self:flex-start;align-items:center;gap:14px;font-size:30px;font-weight:700;color:var(--text2)}
  .kdot{width:14px;height:14px;border-radius:50%;background:var(--p)}
  .ctitle{margin-top:26px;font-size:136px;line-height:1.12;font-weight:900;letter-spacing:-.01em}
  .ckey{color:var(--pt)}
  .csub{margin-top:28px;font-size:46px;font-weight:700;color:var(--text2)}
  .illus svg{width:100%;height:100%}
  .illus{margin-top:30px;flex:1;min-height:0;display:flex;align-items:flex-end;justify-content:center}
  .chips{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:30px}
  .chip{padding:24px 22px;background:var(--card);border-radius:calc(var(--r) * .8);box-shadow:var(--sh);display:flex;flex-direction:column;gap:8px}
  .chip b{font-family:Inter,'Noto Sans TC';font-size:42px;font-weight:900}
  .chip span{font-size:24px;color:var(--text2);line-height:1.35}
  `;

  const perTheme = {
    editorial: `
    .frame{background:var(--bg)}
    .frame::before{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(20,33,61,.07) 1.6px, transparent 1.7px);background-size:24px 24px;}
    .frame::after{content:'';position:absolute;left:64px;right:64px;top:310px;height:4px;background:var(--text);box-shadow:0 10px 0 -2px var(--text)}
    .hdr .logo-txt{font-size:42px}
    .cap{background:transparent;color:var(--pt);border:3px solid var(--pt);border-radius:8px}
    .card{border:2px solid var(--cb)}
    .big-num{color:var(--pt)}
    .kicker{color:var(--text);text-transform:uppercase;letter-spacing:.08em;border-bottom:4px solid var(--a1);padding-bottom:8px}
    .kdot{border-radius:2px;background:var(--p)}
    .ckey{background:linear-gradient(transparent 62%, ${t.acc1}aa 62%, ${t.acc1}aa 94%, transparent 94%);color:var(--text)}
    .ctitle{font-size:140px}
    .imp-head{border-bottom:4px solid var(--text)}
    .imp-row+.imp-row{border-top:2px dashed var(--cb)}
    .imp-note{background:#FFF3DA;border-left:8px solid var(--a1);border-radius:4px;color:var(--text)}
    .chip{border:2px solid var(--cb);border-top:6px solid var(--p)}
    .chip:nth-child(2){border-top-color:var(--a1)} .chip:nth-child(3){border-top-color:var(--a2)}
    .src{border-top:2px solid var(--cb);padding-top:14px}
    .sub-box{padding:0}
    `,
    fintech: `
    .frame{background:linear-gradient(180deg,#FFFFFF 0%, var(--bg) 40%, #EEF4FB 100%)}
    .frame::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(15,23,42,.035) 1.5px, transparent 1.5px),linear-gradient(90deg, rgba(15,23,42,.035) 1.5px, transparent 1.5px);background-size:60px 60px;-webkit-mask-image:linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)}
    .frame::after{content:'';position:absolute;width:900px;height:900px;right:-360px;top:-300px;border-radius:50%;background:radial-gradient(circle, rgba(14,165,233,.16), transparent 65%)}
    .cap{background:#E0F2FE;color:#0369A1}
    .logo-txt{font-weight:900}
    .card{border:1.5px solid var(--cb)}
    .big-num{color:var(--text)}
    .big-num span{color:var(--text2)}
    .big-head .big-label{font-weight:800}
    .ckey{color:var(--pt)}
    .kicker{background:#FFFFFF;border:1.5px solid var(--cb);border-radius:999px;padding:12px 24px;box-shadow:var(--sh);font-size:28px}
    .kdot{background:var(--a1);box-shadow:0 0 0 6px #D1FAE5}
    .imp-head{border-bottom:1.5px solid var(--cb)}
    .imp-row+.imp-row{border-top:1.5px solid #EEF2F7}
    .imp-note{background:#F0F9FF;color:#075985;border:1.5px solid #BAE6FD}
    .chip{border:1.5px solid var(--cb)}
    .chip b{font-family:Inter,'Noto Sans TC';font-weight:800}
    .chip:nth-child(1) b{color:var(--pt)} .chip:nth-child(2) b{color:var(--a2t)} .chip:nth-child(3) b{color:var(--a1t)}
    .sub-box{}
    `,
    casual: `
    .frame{background:linear-gradient(165deg, ${t.bg} 0%, #FFF4EA 46%, ${t.bg2} 100%)}
    .frame::before{content:'';position:absolute;width:760px;height:620px;left:-260px;top:520px;border-radius:46% 54% 60% 40%/50% 42% 58% 50%;background:rgba(255,200,87,.28)}
    .frame::after{content:'';position:absolute;width:700px;height:640px;right:-300px;top:1080px;border-radius:58% 42% 40% 60%/45% 55% 45% 55%;background:rgba(59,181,156,.18)}
    .cap{background:#FFFFFF;color:var(--text);border:3px solid var(--text);transform:rotate(-3deg);box-shadow:4px 5px 0 rgba(42,44,51,.15);margin-right:8px}
    .chips{padding:0 6px}
    .kicker{margin-left:6px}
    .logo-mark{display:inline-flex}
    .card{border:3px solid var(--cb)}
    .big-num{color:var(--pt)}
    .st{border:2.5px solid currentColor}
    .st-tbd{border-style:dashed}
    .kicker{background:#FFFFFF;border:3px solid var(--text);border-radius:999px;padding:10px 24px;transform:rotate(-2deg);color:var(--text)}
    .ckey{color:var(--pt);text-decoration:underline wavy ${t.primary}88;text-decoration-thickness:6px;text-underline-offset:22px}
    .imp-head{border-bottom:3px dashed rgba(42,44,51,.25)}
    .imp-row+.imp-row{border-top:2.5px dotted rgba(42,44,51,.22)}
    .imp-note{background:#FFF1C9;border:2.5px solid var(--text);border-radius:22px;color:var(--text)}
    .chip{border:3px solid var(--text);box-shadow:5px 6px 0 rgba(42,44,51,.12)}
    .chip:nth-child(1){transform:rotate(-1.5deg)} .chip:nth-child(3){transform:rotate(1.5deg)}
    .chip:nth-child(1) b{color:var(--pt)} .chip:nth-child(2) b{color:var(--a1t)} .chip:nth-child(3) b{color:var(--a2t)}
    .sub-box{background:rgba(255,255,255,.88);border:3px solid var(--text);border-radius:40px;padding:30px 28px 28px;box-shadow:6px 8px 0 rgba(42,44,51,.10);position:relative}
    .sub-box::after{content:'';position:absolute;top:-22px;left:90px;width:38px;height:38px;background:#FFFFFF;border-left:3px solid var(--text);border-top:3px solid var(--text);transform:rotate(45deg);border-top-left-radius:6px}
    .zh{font-size:72px}
    .en{font-size:29px}
    `,
  };
  return `${fontCss}\n${base}\n${perTheme[k]}`;
}

function page(theme, body) {
  const i = body.indexOf('</header>') + 9;
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><style>${css(theme)}</style></head><body><div class="frame">${body.slice(0, i)}<div class="stack">${body.slice(i)}</div></div></body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const scenes = [['1-cover', sceneCover], ['2-bignumber', sceneBig], ['3-impact', sceneImpact]];
  for (const [key, theme] of Object.entries(themes)) {
    for (const [sk, fn] of scenes) {
      const html = page(theme, fn(theme));
      const hp = path.join(OUT, 'html', `${key}-${sk}.html`);
      fs.writeFileSync(hp, html);
      await p.goto('file://' + hp);
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(400);
      const missing = await p.evaluate(() => [...document.fonts].filter((f) => f.status === 'error').length);
      // overflow check: any element extending past safe area horizontally
      const ov = await p.evaluate(() => [...document.querySelectorAll('.frame *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.left < 63 || r.right > 1017) && !e.closest('svg') && getComputedStyle(e).position !== 'absolute'; }).map((e) => e.className).slice(0, 5));
      await p.screenshot({ path: path.join(OUT, 'png', `${key}-${sk}.png`) });
      console.log(key, sk, 'fontErrors=', missing, 'outsideSafe=', JSON.stringify(ov));
    }
  }
  await browser.close();

  // contrast report
  for (const [key, theme] of Object.entries(themes)) {
    const t = theme.t;
    const bgs = key === 'C' ? [t.bg, t.bg2, '#FFFFFF'] : [t.bg, '#FFFFFF'];
    const rep = {};
    const pairs = { text: t.text, text2: t.text2, text3: t.text3, primaryText: t.primaryText, acc1Text: t.acc1Text, acc2Text: t.acc2Text, k1: t.k[0], k2: t.k[1], k3: t.k[2] };
    for (const [n, c] of Object.entries(pairs)) rep[n] = bgs.map((b) => ratio(c, b).toFixed(2)).join(' / ');
    rep.ok = ratio(t.okFg, t.okBg).toFixed(2);
    rep.exp = ratio(t.expFg, t.expBg).toFixed(2);
    rep.tbd = ratio(t.tbdFg, t.tbdBg).toFixed(2);
    console.log(key, 'bgs', bgs.join(','), JSON.stringify(rep));
  }
})();
