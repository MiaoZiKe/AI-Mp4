/* Midterm 2026 — data-driven newspaper/infographic template.
 * Everything is driven by script.json (content) + timeline.json (measured audio timing).
 * Rendering is deterministic: window.seek(t) positions a paused GSAP master timeline. */
(async function () {
  const D = window.__DATA__ || {
    script: await (await fetch('../script.json')).json(),
    timeline: await (await fetch('../timeline.json')).json(),
    usmap: await (await fetch('assets/usmap.json')).json(),
  };
  const S = D.script, TL = D.timeline, C = { pending: '#A3A7AE', ...S.meta.colors };
  await Promise.all([document.fonts.load('900 64px "Noto Serif TC"', '選舉'), document.fonts.load('700 32px "Noto Sans TC"', '選舉'), document.fonts.load('700 32px "JetBrains Mono"', '0123')]);
  const W = 1080, CONTENT_W = 952;
  const NS = 'http://www.w3.org/2000/svg';
  const E3 = 'power3.out', EX = 'expo.out';
  const STAG = 0.08; // 80ms stagger (spec 60–100ms)

  // ---------- helpers ----------
  const el = (tag, cls, html, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const sv = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const abs = (e, x, y, w, h) => { Object.assign(e.style, { position: 'absolute', left: x + 'px', top: y + 'px' }); if (w != null) e.style.width = w + 'px'; if (h != null) e.style.height = h + 'px'; return e; };
  const hlWrap = (text, key) => key && text.includes(key) ? text.replace(key, `<span class="hl"><i class="mark"></i>${key}</span>`) : text;
  const fit = (e, maxW, min = 28) => { let fs = parseFloat(getComputedStyle(e).fontSize); while (e.scrollWidth > maxW && fs > min) { fs -= 1; e.style.fontSize = fs + 'px'; } };
  const counters = [];
  const fmtNum = (v, dec, comma) => { let s = v.toFixed(dec); if (comma) { const [i, d] = s.split('.'); s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (d ? '.' + d : ''); } return s; };
  const M = gsap.timeline({ paused: true });
  function countUp(node, to, at, dur = 1.2, { dec = 0, comma = false, pre = '', suf = '' } = {}) {
    const o = { v: 0 }; counters.push({ o, node, f: v => pre + fmtNum(v, dec, comma) + suf });
    node.textContent = pre + fmtNum(0, dec, comma) + suf;
    M.to(o, { v: to, duration: dur, ease: EX }, at);
  }
  const appear = (targets, at, from = { y: 40, opacity: 0 }, dur = 0.7, ease = E3, stagger = STAG) =>
    M.fromTo(targets, from, { x: 0, y: 0, scale: 1, opacity: 1, duration: dur, ease, stagger }, at);
  const markIn = (scope, at) => scope.querySelectorAll('.hl .mark').forEach((m, i) => M.fromTo(m, { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: E3 }, at + i * 0.1));
  function drawStroke(paths, at, dur = 1.2, stagger = STAG) {
    paths.forEach(p => { const L = Math.ceil(p.getTotalLength()); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    M.fromTo(paths, { strokeDashoffset: (i, p) => p.style.strokeDasharray }, { strokeDashoffset: 0, duration: dur, ease: E3, stagger }, at);
  }
  const kicker = (txt, p) => el('div', 'kicker', txt, p);
  function headline(sc, p, size = 66) { const h = el('div', 'headline', hlWrap(sc.headline, sc.highlight), p); h.style.fontSize = size + 'px'; return h; }

  // ---------- bake the feTurbulence paper grain into a bitmap once (identical look, far cheaper per frame) ----------
  {
    const g = document.getElementById('grain'); const xml = new XMLSerializer().serializeToString(g);
    const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    await img.decode(); const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1920;
    cv.getContext('2d').drawImage(img, 0, 0); cv.id = 'grain'; cv.style.cssText = 'position:absolute;inset:0;mix-blend-mode:multiply;opacity:0.12';
    g.replaceWith(cv);
  }
  // ---------- masthead ----------
  document.getElementById('mastTitle').textContent = S.meta.masthead;
  document.getElementById('dateStamp').innerHTML = `<span class="datestamp">資料截至<br>${S.meta.dataAsOf}</span>`;
  const tags = document.getElementById('tags');
  S.meta.tags.forEach((t, i) => el('span', 'tag' + (i === 0 ? ' solid' : ''), t, tags));

  // ---------- icons ----------
  const ICON = {
    budget: `<svg viewBox="0 0 96 96" class="icon"><rect x="16" y="10" width="56" height="76" rx="6" fill="#FBF8F1" stroke="${C.ink}" stroke-width="5"/><path d="M28 30h32M28 44h32M28 58h18" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/><circle cx="70" cy="68" r="18" fill="${C.gold}" stroke="${C.ink}" stroke-width="5"/><path d="M70 58v20M64 63h9a4 4 0 010 8h-6a4 4 0 000 8h9" stroke="${C.ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`,
    tax: `<svg viewBox="0 0 96 96" class="icon"><path d="M20 8h56v80l-9-7-9 7-10-7-10 7-9-7-9 7z" fill="#FBF8F1" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><circle cx="38" cy="34" r="7" fill="${C.gold}" stroke="${C.ink}" stroke-width="4"/><circle cx="58" cy="58" r="7" fill="${C.gold}" stroke="${C.ink}" stroke-width="4"/><path d="M62 28L34 64" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/></svg>`,
    tariff: `<svg viewBox="0 0 96 96" class="icon"><path d="M8 62h80l-10 18H18z" fill="${C.ink}"/><rect x="18" y="38" width="26" height="22" fill="${C.gold}" stroke="${C.ink}" stroke-width="4"/><rect x="46" y="38" width="26" height="22" fill="#FBF8F1" stroke="${C.ink}" stroke-width="4"/><rect x="32" y="16" width="26" height="22" fill="#FBF8F1" stroke="${C.ink}" stroke-width="4"/><path d="M24 44v10M30 44v10M36 44v10M52 44v10M58 44v10M64 44v10" stroke="${C.ink}" stroke-width="2.5"/><path d="M6 88c8-5 14 5 22 0s14 5 22 0 14 5 22 0 12 4 18 0" stroke="${C.ink}" stroke-width="3.5" fill="none"/></svg>`,
    energy: `<svg viewBox="0 0 96 96" class="icon"><circle cx="48" cy="48" r="38" fill="#FBF8F1" stroke="${C.ink}" stroke-width="5"/><path d="M54 14L28 54h18l-6 28 28-42H50z" fill="${C.gold}" stroke="${C.ink}" stroke-width="4.5" stroke-linejoin="round"/></svg>`,
    server: `<svg viewBox="0 0 96 96" class="icon"><rect x="14" y="10" width="68" height="22" rx="4" fill="#FBF8F1" stroke="${C.ink}" stroke-width="5"/><rect x="14" y="37" width="68" height="22" rx="4" fill="#FBF8F1" stroke="${C.ink}" stroke-width="5"/><rect x="14" y="64" width="68" height="22" rx="4" fill="#FBF8F1" stroke="${C.ink}" stroke-width="5"/><circle cx="26" cy="21" r="4" fill="${C.gold}"/><circle cx="26" cy="48" r="4" fill="${C.gold}"/><circle cx="26" cy="75" r="4" fill="${C.gold}"/><path d="M40 21h30M40 48h30M40 75h30" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/></svg>`,
    chip: `<svg viewBox="0 0 96 96" class="icon"><g stroke="${C.ink}" stroke-width="5" stroke-linecap="round"><path d="M34 6v14M48 6v14M62 6v14M34 76v14M48 76v14M62 76v14M6 34h14M6 48h14M6 62h14M76 34h14M76 48h14M76 62h14"/></g><rect x="20" y="20" width="56" height="56" rx="6" fill="${C.ink}"/><rect x="32" y="32" width="32" height="32" rx="3" fill="${C.gold}"/><path d="M40 48h16M48 40v16" stroke="${C.ink}" stroke-width="4"/></svg>`,
    solar: `<svg viewBox="0 0 96 96" class="icon"><circle cx="70" cy="22" r="12" fill="${C.gold}" stroke="${C.ink}" stroke-width="4"/><path d="M10 62l14-30h50l-14 30z" fill="#FBF8F1" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M17 47h50M28 32l-11 30M44 32l-12 30M60 32l-12 30" stroke="${C.ink}" stroke-width="3.5"/><path d="M38 62v18M26 86h26" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/></svg>`,
  };
  const arrowSvg = dir => dir === 'down'
    ? `<svg class="arrow" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" fill="${C.ink}"/><path d="M26 13v24M15 27l11 11 11-11" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    : `<svg class="arrow" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" fill="#FBF8F1" stroke="${C.ink}" stroke-width="4"/><path d="M12 30c5-10 9-10 14 0s9 10 14 0" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;

  // ---------- hemicycle seat chart ----------
  function hemicycle(parent, { total, groups, rows, r0, r1, cx, cy, w, h }) {
    const svg = sv('svg', { viewBox: `0 0 ${w} ${h}`, width: w, height: h }, parent);
    const radii = Array.from({ length: rows }, (_, i) => r0 + (r1 - r0) * i / (rows - 1));
    const sumR = radii.reduce((a, b) => a + b, 0);
    let counts = radii.map(r => total * r / sumR), fl = counts.map(Math.floor);
    let rem = total - fl.reduce((a, b) => a + b, 0);
    counts.map((c, i) => [c - fl[i], i]).sort((a, b) => b[0] - a[0]).slice(0, rem).forEach(([, i]) => fl[i]++);
    const seats = [];
    radii.forEach((r, i) => { const n = fl[i]; for (let j = 0; j < n; j++) { const th = Math.PI * (1 - j / (n - 1)); seats.push({ r, th, ring: i, x: cx + r * Math.cos(th), y: cy - r * Math.sin(th) }); } });
    const dotR = Math.min((r1 - r0) / (rows - 1), Math.PI * r1 / fl[rows - 1]) * 0.4;
    seats.sort((a, b) => b.th - a.th || a.r - b.r); // left → right
    let k = 0; groups.forEach(g => { for (let i = 0; i < g.n; i++) seats[k++].fill = g.color; });
    const dots = seats.map(s => { const c = sv('circle', { cx: s.x.toFixed(1), cy: s.y.toFixed(1), r: dotR.toFixed(2), fill: '#E4DFD3', stroke: '#C9C3B5', 'stroke-width': 1 }, svg); s.el = c; return s; });
    // fill order: from the centre outward (inner ring first), each ring left→right
    const order = [...dots].sort((a, b) => a.ring - b.ring || b.th - a.th);
    return { svg, order, dotR };
  }
  function fillSeats(order, at, dur = 1.4) {
    const step = dur / order.length;
    order.forEach((s, i) => M.fromTo(s.el, { attr: { fill: '#E4DFD3', stroke: '#C9C3B5' }, scale: 0.4, transformOrigin: '50% 50%' },
      { attr: { fill: s.fill, stroke: s.fill }, scale: 1, duration: 0.35, ease: E3 }, at + i * step));
  }

  // ---------- scene builders ----------
  const root = document.getElementById('scenes');
  const B = {};

  B.breaking = (sc, T, p) => {
    const mapW = CONTENT_W, sc_ = mapW / 975, mapH = 610 * sc_;
    const svg = sv('svg', { viewBox: '0 0 975 610', width: mapW, height: mapH }, p); abs(svg, 64, 10);
    const states = D.usmap.map(s => ({ ...s, el: sv('path', { d: s.d, fill: '#CFCCC4', stroke: C.paper, 'stroke-width': 1.6, opacity: 0 }, svg) }));
    states.sort((a, b) => a.c[0] - b.c[0]); // sweep west → east
    states.forEach((s, i) => M.fromTo(s.el, { opacity: 0.35 }, { opacity: 1, attr: { fill: i % 3 === 0 ? '#B9BDC6' : i % 3 === 1 ? '#C6C8CC' : '#D2CFC6' }, duration: 0.5, ease: E3 }, T.start + 0.05 + i * 0.022));
    const pend = states.filter(s => s.id === '02' || s.id === '28');
    pend.forEach(s => M.to(s.el, { attr: { fill: C.gold, stroke: C.ink }, duration: 0.5, ease: E3 }, T.segments[0].start + 0.6));
    // counting stamps next to AK & MS
    pend.forEach((s, i) => {
      const st = el('div', 'stamp counting', '計票中', p);
      abs(st, 64 + s.c[0] * sc_ + (i === 0 ? 70 : -60), 10 + s.c[1] * sc_ + (i === 0 ? -70 : 50));
      M.fromTo(st, { scale: 2, opacity: 0, rotation: -14 }, { scale: 1, opacity: 1, rotation: -6, duration: 0.45, ease: EX }, T.segments[0].start + 0.9 + i * 0.1);
    });
    const bk = el('div', 'stamp breaking', 'BREAKING', p); abs(bk, 560, 8);
    M.fromTo(bk, { scale: 2.4, opacity: 0, rotation: -18 }, { scale: 1, opacity: 1, rotation: -7, duration: 0.5, ease: EX }, T.start + 0.35);
    const k = kicker('2026 期中選舉 · 開票結果', p); abs(k, 64, 640);
    const h = el('div', 'headline', `選完了，<br>你的<span class="hl"><i class="mark"></i>投資</span>會被影響嗎？`, p);
    abs(h, 64, 690); h.style.fontSize = '88px'; h.style.lineHeight = '1.22';
    // hook text is on screen from frame 0 (first frame = thumbnail); only a subtle settle-in
    M.fromTo([k, h], { y: 12 }, { y: 0, duration: 0.8, ease: E3, stagger: STAG }, 0);
    markIn(p, T.segments[1].start + 0.5);
    const src = el('div', 'source', '金黃色：參議院仍在計票的阿拉斯加、密西西比', p);
    appear(src, T.segments[0].start + 1.0, { opacity: 0, y: 10 });
  };

  B.seats = (sc, T, p) => {
    const d = sc.data;
    const k = kicker('AP · NBC · CNBC 交叉比對', p); abs(k, 64, 0);
    const h = headline(sc, p, 64); abs(h, 64, 34);
    appear([k, h], T.start + 0.15);
    const chamber = (y, cfg, data, title, at, labelAt) => {
      const box = el('div', 'chamber', null, p); abs(box, 64, y, CONTENT_W, cfg.h + 110);
      const hc = hemicycle(box, { ...cfg, w: CONTENT_W, cx: CONTENT_W / 2, total: data.total, groups: [{ n: data.dem, color: C.dem }, { n: data.pending, color: C.pending }, { n: data.rep, color: C.rep }] });
      const t = el('div', 'chamber-title', `${title}<div class="mono" style="font-size:24px;color:${'#3A4659'};margin-top:4px">過半 ${data.majority} 席</div>`, box);
      abs(t, CONTENT_W / 2 - 150, cfg.cy - 112, 300); t.style.fontSize = '42px';
      const labs = el('div', 'seat-labels', null, box); abs(labs, 0, cfg.cy + 14, CONTENT_W);
      const L = el('div', 'seat-label dem', `<span class="num">0</span>民主黨${data.note ? '（已宣布）' : ''}`, labs);
      const P = el('div', 'seat-label pend', `<span class="num">0</span>計票中`, labs);
      const R = el('div', 'seat-label rep', `<span class="num">0</span>共和黨${data.note ? '（已宣布）' : ''}`, labs);
      appear(t, at - 0.1, { opacity: 0, y: 20 });
      appear([L, P, R], labelAt, { opacity: 0, y: 24 });
      fillSeats(hc.order, at, data.total > 200 ? 1.6 : 1.1);
      countUp(L.querySelector('.num'), data.dem, labelAt, 1.3); countUp(P.querySelector('.num'), data.pending, labelAt, 1.3); countUp(R.querySelector('.num'), data.rep, labelAt, 1.3);
    };
    chamber(112, { rows: 5, r0: 112, r1: 238, cy: 244, h: 250 }, d.senate, '參議院', T.segments[0].start - 0.1, T.segments[0].start + 0.2);
    chamber(476, { rows: 11, r0: 168, r1: 396, cy: 404, h: 410 }, d.house, '眾議院', T.segments[1].start - 0.2, T.segments[1].start + 0.6);
  };

  B.balance = (sc, T, p) => {
    const k = kicker('權力結構', p); abs(k, 64, 0);
    const h = headline(sc, p, 64); abs(h, 64, 34); appear([k, h], T.start + 0.15); markIn(p, T.segments[1].start + 0.2);
    // Capitol line drawing
    const cap = sv('svg', { viewBox: '0 0 600 300', width: 520, height: 260 }, p); abs(cap, 280, 130);
    const cp = [
      'M40 290H560', 'M70 290V200H530V290', 'M60 200H540', 'M100 200V290M140 200V290M180 200V290M420 200V290M460 200V290M500 200V290',
      'M220 200V160H380V200', 'M210 160H390', 'M240 160V200M270 160V200M300 160V200M330 160V200M360 160V200',
      'M235 160C235 95 365 95 365 160', 'M255 120C265 70 335 70 345 120', 'M300 70V40', 'M290 40H310L300 22Z', 'M250 290V240H350V290',
    ].map(d => sv('path', { d, fill: 'none', stroke: C.ink, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, cap));
    drawStroke(cp, T.start + 0.2, 1.3, 0.06);
    // balance scale
    const bal = sv('svg', { viewBox: '0 0 952 440', width: 952, height: 440 }, p); abs(bal, 64, 400);
    sv('path', { d: 'M476 40V380M396 400H556M436 380H516', stroke: C.ink, 'stroke-width': 10, 'stroke-linecap': 'round', fill: 'none' }, bal);
    sv('circle', { cx: 476, cy: 40, r: 16, fill: C.gold, stroke: C.ink, 'stroke-width': 5 }, bal);
    const beam = sv('g', {}, bal);
    sv('path', { d: 'M156 70H796', stroke: C.ink, 'stroke-width': 10, 'stroke-linecap': 'round' }, beam);
    const pan = (x, party, color, who) => {
      const g = sv('g', {}, beam);
      sv('path', { d: `M${x} 70L${x - 120} 250M${x} 70L${x + 120} 250`, stroke: C.ink, 'stroke-width': 4, fill: 'none' }, g);
      sv('path', { d: `M${x - 140} 250H${x + 140}Q${x + 120} 300 ${x} 300Q${x - 120} 300 ${x - 140} 250Z`, fill: '#FBF8F1', stroke: C.ink, 'stroke-width': 5 }, g);
      const t1 = sv('text', { x, y: 196, 'text-anchor': 'middle', 'font-family': 'Noto Serif TC', 'font-weight': 900, 'font-size': 52, fill: C.ink }, g); t1.textContent = who;
      sv('rect', { x: x - 82, y: 254, width: 164, height: 40, rx: 8, fill: color }, g);
      const t2 = sv('text', { x, y: 284, 'text-anchor': 'middle', 'font-family': 'Noto Sans TC', 'font-weight': 700, 'font-size': 28, fill: '#fff' }, g); t2.textContent = party;
      return g;
    };
    const gl = pan(236, '共和黨', C.rep, '總統'), gr = pan(716, '民主黨', C.dem, '國會');
    M.fromTo(bal, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: E3 }, T.start + 0.5);
    M.fromTo(beam, { rotation: -6, svgOrigin: '476 70' }, { rotation: 0, svgOrigin: '476 70', duration: 1.6, ease: E3 }, T.start + 0.7);
    [gl, gr].forEach((g, i) => M.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: E3 }, T.start + 0.7 + i * STAG));
    const notes = el('div', null, `<div class="ind" style="font-size:34px"><span>法案：國會通過＋總統簽署</span></div><div class="ind" style="font-size:34px;border:none"><span>總統保有否決權，雙方需協商</span></div>`, p);
    abs(notes, 64, 838, CONTENT_W);
    appear(notes.children, T.segments[1].start, { opacity: 0, y: 24 });
  };

  B.list = (sc, T, p) => {
    const k = kicker('立法方向 · 市場普遍預期', p); abs(k, 64, 0);
    const h = headline(sc, p, 64); abs(h, 64, 34); appear([k, h], T.start + 0.15);
    const g = el('div', 'grid2', null, p); abs(g, 64, 150, CONTENT_W);
    const cards = sc.items.map(it => el('div', 'card pcard', `${ICON[it.icon]}<h3>${it.title}</h3><p>${it.text}</p>`, g));
    appear(cards, T.start + 0.45, { opacity: 0, y: 60, scale: 0.96 }, 0.7, E3, 0.09);
    // emphasise the tariff card when narration reaches it
    const tc = cards[2];
    M.to(tc, { borderColor: C.gold, boxShadow: `8px 8px 0 ${C.gold}`, duration: 0.4, ease: E3 }, T.segments[1].start);
    const n = el('div', 'source', '來源：Morningstar、Morgan Stanley、Deutsche Bank、Goldman Sachs 分析（Yahoo Finance 整理）', p);
    abs(n, 64, 880, CONTENT_W); appear(n, T.start + 1.0, { opacity: 0, y: 10 });
  };

  B.chart = (sc, T, p) => {
    const k = kicker('選後首個交易日 · 11/4 盤中', p); abs(k, 64, 0);
    const h = headline(sc, p, 64); abs(h, 64, 34); appear([k, h], T.start + 0.15);
    const card = el('div', 'card', null, p); abs(card, 64, 150, CONTENT_W, 470);
    const svg = sv('svg', { viewBox: '0 0 952 470', width: 952, height: 470 }, card);
    for (let i = 0; i < 5; i++) sv('path', { d: `M60 ${80 + i * 80}H900`, stroke: '#D5CFC1', 'stroke-width': 2, 'stroke-dasharray': '6 8' }, svg);
    const lab = sv('text', { x: 40, y: 50, 'font-family': 'Noto Sans TC', 'font-weight': 700, 'font-size': 26, fill: '#3A4659' }, svg); lab.textContent = '示意圖（非實際報價）';
    // candles: shaky then steadier (schematic) — hollow = up, filled = down
    const cs = [[250, 300, 230, 320, 0], [300, 350, 280, 370, 0], [350, 330, 320, 390, 1], [330, 300, 290, 345, 1], [300, 270, 255, 310, 1], [275, 250, 240, 290, 1], [250, 240, 225, 262, 1], [240, 225, 214, 252, 1]];
    const candles = cs.map(([o, c, hi, lo, up], i) => {
      const x = 120 + i * 100, g = sv('g', {}, svg);
      sv('path', { d: `M${x} ${hi}V${lo}`, stroke: C.ink, 'stroke-width': 4 }, g);
      sv('rect', { x: x - 22, y: Math.min(o, c), width: 44, height: Math.max(8, Math.abs(c - o)), fill: up ? '#FBF8F1' : C.ink, stroke: C.ink, 'stroke-width': 4 }, g);
      return g;
    });
    appear(candles, T.start + 0.45, { opacity: 0, y: 30 }, 0.5, E3, 0.07);
    const yl = sv('path', { d: 'M80 120C170 110 230 150 320 170S470 230 560 250S760 300 900 330', fill: 'none', stroke: C.gold, 'stroke-width': 14, 'stroke-linecap': 'round', opacity: 0.9 }, svg);
    const yl2 = sv('path', { d: 'M80 120C170 110 230 150 320 170S470 230 560 250S760 300 900 330', fill: 'none', stroke: C.ink, 'stroke-width': 5, 'stroke-linecap': 'round' }, svg);
    drawStroke([yl, yl2], T.segments[0].start + 0.3, 1.5, 0);
    const lg = sv('text', { x: 900, y: 380, 'text-anchor': 'end', 'font-family': 'Noto Sans TC', 'font-weight': 700, 'font-size': 26, fill: C.ink }, svg); lg.textContent = '— 10年期殖利率　▮ 美股';
    appear(lg, T.segments[0].start + 1.2, { opacity: 0 });
    const box = el('div', null, null, p); abs(box, 64, 650, CONTENT_W);
    const rows = sc.indicators.map(it => el('div', 'ind', `<span class="lab">${it.label}</span><span class="val">${arrowSvg(it.dir)}${it.text}</span>`, box));
    appear(rows[1], T.segments[0].start + 0.2, { opacity: 0, x: 60 });
    appear([rows[2], rows[0]], T.segments[1].start, { opacity: 0, x: 60 });
    const n = el('div', 'source', '來源：CNBC、FXStreet、Fox Business、Morningstar（初步走勢，非收盤定論）', p);
    abs(n, 64, 960, CONTENT_W); appear(n, T.start + 1.0, { opacity: 0, y: 10 });
  };

  B.trio = (sc, T, p) => {
    const k = kicker('產業焦點', p); abs(k, 64, 0);
    const h = headline(sc, p, 64); abs(h, 64, 34); appear([k, h], T.start + 0.15);
    const box = el('div', null, null, p); abs(box, 64, 150, CONTENT_W);
    const cards = sc.items.map(it => el('div', 'card rowcard', `${ICON[it.icon]}<div><h3>${it.title}</h3><p>${it.text}</p></div>`, box));
    appear(cards, T.start + 0.45, { opacity: 0, x: 120 }, 0.7, E3, 0.09);
    // gold emphasis follows the narration
    [[0, T.segments[0].start], [1, T.segments[1].start]].forEach(([i, at]) =>
      M.to(cards[i], { borderColor: C.gold, boxShadow: `8px 8px 0 ${C.gold}`, duration: 0.4, ease: E3 }, at));
    M.to(cards[0], { borderColor: C.ink, boxShadow: '8px 8px 0 rgba(27,42,65,0.16)', duration: 0.4, ease: E3 }, T.segments[1].start);
    const n = el('div', 'source', '來源：Morningstar、Credendo、Yahoo Finance 分析師整理', p);
    abs(n, 64, 900, CONTENT_W); appear(n, T.start + 1.0, { opacity: 0, y: 10 });
  };

  B.taiwan = (sc, T, p) => {
    const d = sc.data;
    const k = kicker('對台灣的影響', p); abs(k, 64, 0);
    const h = headline(sc, p, 64); abs(h, 64, 34); appear([k, h], T.start + 0.15); markIn(h, T.segments[0].start + 0.4);
    // simplified Taiwan outline (lon/lat → equirectangular w/ cos(lat))
    const pts = [[121.53, 25.30], [121.75, 25.13], [122.0, 25.01], [121.85, 24.75], [121.86, 24.58], [121.62, 23.98], [121.50, 23.45], [121.35, 23.05], [121.15, 22.75], [120.95, 22.45], [120.85, 21.90], [120.74, 21.95], [120.62, 22.30], [120.27, 22.62], [120.10, 23.00], [120.06, 23.30], [120.15, 23.50], [120.35, 24.05], [120.55, 24.35], [120.90, 24.80], [121.05, 25.05], [121.40, 25.17]];
    const k_ = Math.cos(23.7 * Math.PI / 180), sx = 210 / (2.0 * k_), sy = 210 / 2.0;
    const dd = pts.map(([lo, la], i) => `${i ? 'L' : 'M'}${(20 + (lo - 120.0) * k_ * sx).toFixed(1)} ${(20 + (25.35 - la) * sy).toFixed(1)}`).join('') + 'Z';
    const tw = sv('svg', { viewBox: '0 0 260 400', width: 300, height: 462 }, p); abs(tw, 54, 150);
    const twp = sv('path', { d: dd, fill: 'rgba(224,179,58,0)', stroke: C.ink, 'stroke-width': 5, 'stroke-linejoin': 'round' }, tw);
    drawStroke([twp], T.start + 0.3, 1.4);
    M.to(twp, { fill: 'rgba(224,179,58,0.85)', duration: 0.8, ease: E3 }, T.start + 1.2);
    const rt = el('div', null, `<div class="mono" style="font-size:24px;color:#3A4659">台股加權指數 · ${d.date} 收盤</div><div class="bignum" style="font-size:96px;margin:12px 0 8px"><span class="hl"><i class="mark"></i><span class="tx">0</span></span></div><div class="mono" style="font-size:40px">▼ <span class="ch">0</span>（<span class="pc">0</span>%）</div><div style="font-size:26px;color:#3A4659;margin-top:14px;line-height:1.4">台灣白天美國仍在開票，<br>屬對初步結果的反應</div>`, p);
    abs(rt, 380, 190, 620);
    appear(rt, T.start + 0.5, { opacity: 0, y: 30 });
    countUp(rt.querySelector('.tx'), d.taiex, T.start + 0.6, 1.6, { dec: 2, comma: true });
    countUp(rt.querySelector('.ch'), Math.abs(d.change), T.start + 0.8, 1.4, { dec: 2 });
    countUp(rt.querySelector('.pc'), d.pct, T.start + 0.8, 1.4, { dec: 2, pre: '' });
    rt.querySelectorAll('.hl .mark').forEach(m => M.fromTo(m, { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: E3 }, T.segments[2].start + 0.1));
    const cards = el('div', null, null, p); abs(cards, 64, 640, CONTENT_W);
    const c1 = el('div', 'card', `<div style="padding:22px 28px;font-size:34px;line-height:1.35"><span style="font-family:'Noto Serif TC';font-weight:900">對台政策</span>　兩黨支持度高，預期延續</div>`, cards);
    const c2 = el('div', 'card', `<div style="padding:22px 28px;font-size:34px;line-height:1.35"><span style="font-family:'Noto Serif TC';font-weight:900">半導體關稅</span>　232 條款由行政部門主導</div>`, cards);
    c2.style.marginTop = '22px';
    appear(c1, T.segments[0].start, { opacity: 0, y: 40 });
    appear(c2, T.segments[1].start, { opacity: 0, y: 40 });
    const n = el('div', 'source', '來源：Credendo、數位時代、經理人、ETtoday、經濟日報', p);
    abs(n, 64, 960, CONTENT_W); appear(n, T.start + 1.0, { opacity: 0, y: 10 });
  };

  B.stat = (sc, T, p) => {
    const d = sc.data;
    const k = kicker('歷史數據 · 1950 年以來', p); abs(k, 64, 0);
    const h = headline(sc, p, 64); abs(h, 64, 34); appear([k, h], T.start + 0.15);
    const big = el('div', 'bignum', `<span class="hl"><i class="mark"></i><span class="v">+0.0%</span></span>`, p);
    abs(big, 64, 150, CONTENT_W); big.style.fontSize = '210px'; big.style.textAlign = 'center';
    appear(big, T.start + 0.4, { opacity: 0, scale: 0.85 });
    countUp(big.querySelector('.v'), d.avg, T.start + 0.5, 1.8, { dec: 1, pre: '+', suf: '%' });
    markIn(p, T.segments[1].start + 0.1);
    const desc = el('div', null, '期中選舉後 12 個月 · 標普500 平均漲幅', p);
    abs(desc, 64, 400, CONTENT_W); desc.style.cssText += 'font-size:38px;text-align:center';
    appear(desc, T.start + 0.5, { opacity: 0, y: 20 });
    const row = sv('svg', { viewBox: '0 0 952 70', width: 952, height: 70 }, p); abs(row, 64, 500);
    const dots = Array.from({ length: d.total }, (_, i) => {
      const g = sv('g', { transform: `translate(${26 + i * 47.2} 35)` }, row);
      sv('circle', { r: 20, fill: C.gold, stroke: C.ink, 'stroke-width': 3.5 }, g);
      sv('path', { d: 'M-9 0l6 7 12-13', stroke: C.ink, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      return g;
    });
    M.fromTo(dots, { opacity: 0.18, scale: 0.6, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.4, ease: EX, stagger: 0.06 }, T.segments[2].start - 0.3);
    M.fromTo(row, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: E3 }, T.start + 0.6);
    const cnt = el('div', null, `<span class="bignum" style="font-size:64px"><span class="u">0</span> / ${d.total}</span>　次上漲`, p);
    abs(cnt, 64, 590, CONTENT_W); cnt.style.cssText += 'font-size:38px;text-align:center';
    appear(cnt, T.segments[2].start - 0.3, { opacity: 0, y: 20 });
    countUp(cnt.querySelector('.u'), d.up, T.segments[2].start - 0.2, 1.3);
    const disc = el('div', 'card', `<div style="padding:22px 28px;font-size:32px;line-height:1.4">⚠ 樣本只有 19 次，各機構算法不同（約 14%–18%）。<br><b style="font-family:'Noto Serif TC';font-weight:900">過去表現不代表未來。</b></div>`, p);
    abs(disc, 64, 730, CONTENT_W);
    appear(disc, T.segments[2].start + 0.6, { opacity: 0, y: 30 });
    const n = el('div', 'source', '來源：BNY Investments、TradingView（Benzinga）、Deutsche Bank（Investing.com）', p);
    abs(n, 64, 960, CONTENT_W); appear(n, T.start + 1.0, { opacity: 0, y: 10 });
  };

  B.summary = (sc, T, p) => {
    const k = kicker('一句話總結', p); abs(k, 64, 0); appear(k, T.start + 0.1);
    const card = el('div', 'card', null, p); abs(card, 64, 50, CONTENT_W, 520);
    const q = el('div', 'headline', `國會換手，<br><span class="hl"><i class="mark"></i>政策步調變慢</span>`, card);
    abs(q, 44, 40); q.style.fontSize = '100px'; q.style.lineHeight = '1.3';
    const pts = el('div', null, ['分裂政府：法案需雙方協商', '關稅主導權仍在行政部門', '留意 AI、晶片、能源政策'].map(t => `<div style="display:flex;align-items:center;gap:14px;font-size:32px;height:50px"><i style="width:14px;height:14px;background:${C.gold};border:3px solid ${C.ink};display:inline-block;transform:rotate(45deg)"></i>${t}</div>`).join(''), card);
    abs(pts, 48, 330);
    appear(card, T.start + 0.2, { opacity: 0, y: 50 });
    appear(pts.children, T.start + 0.7, { opacity: 0, x: 40 });
    markIn(card, T.segments[0].start + 1.2);
    const cta = el('div', null, `<svg viewBox="0 0 96 96" style="width:150px;height:150px">${document.querySelector('.logo').innerHTML}</svg><div><div style="font-family:'Noto Serif TC';font-weight:900;font-size:56px">追蹤 每日財經筆記</div><div class="mono" style="font-size:40px;margin-top:6px">@daily.finance.notes</div><div style="font-size:30px;color:#3A4659;margin-top:6px">看更多財經重點</div></div>`, p);
    abs(cta, 64, 640, CONTENT_W); cta.style.cssText += 'display:flex;align-items:center;gap:28px';
    appear(cta, T.segments[1].start - 0.15, { opacity: 0, y: 40, scale: 0.95 });
    const n = el('div', 'source', '本片使用 AI 輔助製作，由真人選題與審核 · 內容僅供參考，不構成投資建議', p);
    abs(n, 64, 960, CONTENT_W); appear(n, T.segments[1].start, { opacity: 0, y: 10 });
  };

  // ---------- assemble scenes + transitions ----------
  const sceneEls = [];
  const half = TL.transition / 2;
  S.scenes.forEach((sc, i) => {
    const T = TL.scenes[i];
    const p = el('section', 'scene', null, root); p.dataset.id = sc.id; sceneEls.push(p);
    // entrances start during the incoming push so the sliding page is never empty
    B[sc.card](sc, { ...T, start: i ? T.start - half - 0.4 : T.start }, p);
    p.querySelectorAll('.headline').forEach(h => { if (!h.closest('.card') && sc.card !== 'breaking') fit(h, CONTENT_W); });
    // visibility window
    const vin = i === 0 ? 0 : T.start - half, vout = i === S.scenes.length - 1 ? TL.duration + 1 : T.end + half;
    M.set(p, { visibility: 'visible' }, vin); M.set(p, { visibility: 'hidden' }, vout);
    if (i > 0) M.fromTo(p, { x: W }, { x: 0, duration: TL.transition, ease: E3 }, T.start - half);
    if (i < S.scenes.length - 1) M.fromTo(p, { x: 0 }, { x: -W, duration: TL.transition, ease: E3, immediateRender: false }, T.end - half);
  });
  sceneEls[0].style.visibility = 'visible'; // a set() at exactly t=0 is not rendered by seek(0)

  // ---------- subtitles (one element per narration segment) ----------
  const subBox = document.getElementById('subtitle'); subBox.innerHTML = '';
  TL.scenes.forEach((T, si) => T.segments.forEach((g, gi) => {
    const wrap = el('div', null, null, subBox); Object.assign(wrap.style, { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' });
    const s = el('div', 'sub-inner', `<span class="subText">${g.sub}</span>`, wrap);
    const t = s.querySelector('.subText'); Object.assign(t.style, { display: 'block', fontSize: '54px', lineHeight: '1.3', whiteSpace: 'nowrap', letterSpacing: '1px' });
    fit(t, CONTENT_W - 68, 34);
    const next = T.segments[gi + 1] ? T.segments[gi + 1].start : T.end - 0.12;
    M.fromTo(s, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.25, ease: EX }, g.start - 0.03);
    M.to(s, { opacity: 0, duration: 0.12, ease: E3 }, next - 0.12);
  }));

  // ---------- ambient background motion (per scene, never static) ----------
  // Ambient motion must never stop, so it spans the whole video with a gentle (non-linear) sine curve;
  // power3.out would decelerate to a standstill. Element/transition motion uses power3.out / expo.out only.
  M.fromTo('#bg', { scale: 1 }, { scale: 1.03, duration: TL.duration, ease: 'sine.inOut' }, 0);
  M.fromTo('#halftone', { x: 0, y: 0 }, { x: 140, y: 90, duration: TL.duration, ease: 'sine.inOut' }, 0);
  M.set({}, {}, TL.duration);

  // ---------- public API for the renderer ----------
  window.seek = t => { M.seek(t, true); counters.forEach(c => c.node.textContent = c.f(c.o.v)); return t; };
  window.DURATION = TL.duration;
  await document.fonts.ready;
  window.seek(0);
  window.READY = true;
})();
