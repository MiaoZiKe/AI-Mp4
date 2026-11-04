// HTML overlay: brand, segment heading, big-number panel, subtitles, voice waveform.
// Everything is driven by script.json + timeline.json and posed per frame by updateOverlay(t, f).
import { gsap } from 'gsap';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, d) => clamp((t - a) / d);
const easeOut = gsap.parseEase('power3.out');
const $ = s => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
export function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

export function drawLogo(cv) {
  // notebook mark: gold cover, cream page, ruled lines, a rising trend stroke, spiral rings
  const g = cv.getContext('2d');
  g.setTransform(2, 0, 0, 2, 0, 0);
  g.fillStyle = '#E0B33A'; roundRect(g, 14, 6, 62, 74, 10); g.fill();
  g.fillStyle = '#10141C'; roundRect(g, 22, 12, 48, 62, 6); g.fill();
  g.fillStyle = '#F1E7CF'; roundRect(g, 25, 15, 43, 56, 5); g.fill();
  g.strokeStyle = '#9aa3b4'; g.lineWidth = 2.2;
  for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(32, 28 + k * 9); g.lineTo(61, 28 + k * 9); g.stroke(); }
  g.strokeStyle = '#E0B33A'; g.lineWidth = 3.4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(33, 60); g.lineTo(42, 51); g.lineTo(49, 56); g.lineTo(60, 43); g.stroke();
  g.fillStyle = '#10141C';
  for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(14, 18 + k * 13, 4.6, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = '#F1E7CF'; g.lineWidth = 2;
  for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(14, 18 + k * 13, 4.6, Math.PI * 0.9, Math.PI * 2.1); g.stroke(); }
}

export function setupOverlay(SEGS, META, tl) {
  const C = META.colors;
  drawLogo($('#logo'));
  $('#asof').innerHTML = `<b>資料截至</b>${META.dataAsOf}`;
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const partyName = { dem: '民主黨', rep: '共和黨' };
  const partyColor = { dem: C.dem, rep: C.rep };

  const segUI = SEGS.map((s, i) => {
    const head = el('div', 'head hidden');
    const numText = s.num || (s.kind === 'hook' ? '2026 MIDTERMS' : 'SUMMARY');
    head.innerHTML = `<div class="num"><span class="tx"></span><span class="cursor"></span></div><div class="ttl">${s.title}</div>`;
    $('#heads').appendChild(head);
    const panel = el('div', 'panel hidden');
    const b = s.big;
    const counters = [];
    if (b.type === 'versus') {
      const tot = s.id === 'senate' ? 100 : 435;
      panel.innerHTML = `
        <div class="vs">
          <div class="side"><div class="party"><span class="dot" style="background:${partyColor[b.leftParty]}"></span>${partyName[b.leftParty]}</div><div class="n"><span class="c0">0</span><small>席</small></div></div>
          <div class="colon">:</div>
          <div class="side"><div class="party"><span class="dot" style="background:${partyColor[b.rightParty]}"></span>${partyName[b.rightParty]}</div><div class="n"><span class="c1">0</span><small>席</small></div></div>
        </div>
        <div class="bar"><i class="bl" style="background:${partyColor[b.leftParty]};width:0%"></i><i class="bp" style="background:${C.pending};width:0%"></i><i class="br" style="background:${partyColor[b.rightParty]};width:0%;margin-left:auto"></i><span class="mid"></span></div>
        <div class="label">${b.label}</div><div class="note">${b.note}</div>`;
      counters.push({ sel: '.c0', to: b.left }, { sel: '.c1', to: b.right });
      panel._bar = { tot, l: b.left, r: b.right, p: tot - b.left - b.right };
    } else if (b.type === 'keyword' || b.type === 'fraction') {
      let extra = '';
      if (s.id === 'divided') extra = `<div class="twin"><span class="pill"><span class="dot" style="background:${C.rep}"></span>白宮：共和黨</span><span class="pill"><span class="dot" style="background:${C.dem}"></span>國會：民主黨</span></div>`;
      panel.innerHTML = `<div class="kw"><span class="kt">${b.text}</span><span class="u"></span></div>${extra}<div class="label">${b.label || ''}</div>`;
    } else if (b.type === 'count') {
      const pills = (b.stats || []).map(x => `<span class="pill">${x.k}<b>${x.v}</b></span>`).join('');
      panel.innerHTML = `<div class="cnt">${b.prefix || ''}<span class="c0">0</span><small>${b.suffix || ''}</small></div><div class="label">${b.label}</div><div class="pills">${pills}</div>`;
      counters.push({ sel: '.c0', to: b.value });
    } else if (b.type === 'outro') {
      panel.innerHTML = `<div class="kw outro">追蹤<br><span class="h">@daily.finance.notes</span><span class="u"></span></div><div class="label">${b.label}</div>`;
    }
    $('#panels').appendChild(panel);
    const subs = s.chunks.map(c => { const d = el('div', 'sub hidden', `<span>${c.sub}</span>`); $('#subs').appendChild(d); return d; });
    return { head, panel, subs, counters, numText };
  });
  // fit each subtitle to the 952 px safe width on one line
  for (const ui of segUI) for (const d of ui.subs) {
    const sp = d.firstChild; let fs = 60;
    d.classList.remove('hidden'); d.style.visibility = 'hidden';
    while (sp.scrollWidth > 952 && fs > 36) { fs -= 2; sp.style.fontSize = fs + 'px'; }
    d.style.visibility = ''; d.classList.add('hidden');
  }

  // GSAP master timeline (paused; seeked per frame)
  const master = gsap.timeline({ paused: true });
  SEGS.forEach((s, i) => {
    const ui = segUI[i];
    const inAt = i === 0 ? 0.0 : s.start - 0.05;
    const outAt = i < SEGS.length - 1 ? SEGS[i + 1].start - 0.18 : 1e6;
    master.fromTo(ui.head, { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.45, ease: 'power3.out', immediateRender: false }, inAt);
    master.fromTo(ui.panel, { autoAlpha: 0, y: 40, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.6)', immediateRender: false }, s.start + 0.3);
    const u = ui.panel.querySelector('.u');
    if (u) master.fromTo(u, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.out', immediateRender: false }, (s.countEnd ?? s.start + 1) - 0.2);
    if (i < SEGS.length - 1) {
      master.to(ui.head, { autoAlpha: 0, x: 30, duration: 0.2, ease: 'power2.in' }, outAt);
      master.to(ui.panel, { autoAlpha: 0, y: -24, duration: 0.2, ease: 'power2.in' }, outAt);
    }
    s.chunks.forEach((c, k) => {
      const d = ui.subs[k];
      master.fromTo(d, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out', immediateRender: false }, c.start - 0.04);
      const nextStart = s.chunks[k + 1]?.start ?? (SEGS[i + 1]?.chunks[0].start ?? 1e6);
      master.to(d, { autoAlpha: 0, duration: 0.08, ease: 'none' }, Math.min(c.end + 0.25, nextStart - 0.06));
    });
  });

  const wave = $('#wave').getContext('2d');
  function drawWave(f) {
    const spec = tl.spectrum[Math.min(f, tl.spectrum.length - 1)];
    const prev = tl.spectrum[Math.max(0, Math.min(f, tl.spectrum.length - 1) - 1)];
    const rms = tl.rms[Math.min(f, tl.rms.length - 1)] / 255;
    wave.clearRect(0, 0, 952, 100);
    const B = spec.length, bars = B * 2, gap = 6;
    const bw = (952 - gap * (bars - 1)) / bars;
    wave.fillStyle = 'rgba(224,179,58,0.22)';
    wave.fillRect(0, 49, 952, 2);
    for (let i = 0; i < bars; i++) {
      const b = i < B ? B - 1 - i : i - B; // mirrored: low bands in the middle
      const v = (0.65 * spec[b] + 0.35 * prev[b]) / 255;
      const h = 8 + Math.pow(v, 1.15) * 88 * (0.55 + 0.45 * rms);
      const grd = wave.createLinearGradient(0, 50 - h / 2, 0, 50 + h / 2);
      grd.addColorStop(0, '#F3D27A'); grd.addColorStop(0.5, '#E0B33A'); grd.addColorStop(1, '#B98A22');
      wave.fillStyle = grd;
      roundRect(wave, i * (bw + gap), 50 - h / 2, bw, h, Math.min(bw / 2, h / 2)); wave.fill();
    }
  }

  return function updateOverlay(t, f) {
    master.seek(t, false);
    SEGS.forEach((sg, j) => {
      const ui = segUI[j];
      if (t >= sg.start - 0.3 && t < sg.end + 0.3) {
        const txt = ui.numText;
        const k = clamp((t - (sg.start + 0.02)) / 0.42);
        const tx = ui.head.querySelector('.tx');
        const want = txt.slice(0, Math.round(k * txt.length));
        if (tx.textContent !== want) tx.textContent = want;
        ui.head.querySelector('.cursor').style.opacity = (k < 1 || Math.floor(t * 2.4) % 2 === 0) ? 1 : 0;
      }
      if (ui.counters.length) {
        const a = sg.countStart ?? sg.start + 0.45, e = sg.countEnd ?? sg.start + 1.55;
        const k = easeOut(prog(t, a, e - a));
        ui.counters.forEach(c => { const n = ui.panel.querySelector(c.sel); const v = fmt(c.to * k); if (n.textContent !== v) n.textContent = v; });
        if (ui.panel._bar) {
          const B = ui.panel._bar;
          ui.panel.querySelector('.bl').style.width = (B.l / B.tot * 100 * k) + '%';
          ui.panel.querySelector('.br').style.width = (B.r / B.tot * 100 * k) + '%';
          ui.panel.querySelector('.bp').style.width = (B.p / B.tot * 100 * k) + '%';
        }
      }
    });
    drawWave(f);
  };
}
