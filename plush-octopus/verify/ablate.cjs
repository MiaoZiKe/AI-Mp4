const fs = require('fs');
const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const js = html.split('<script>')[1].split('</script>')[0];
const setup = js.split('//  Camera, input, UI')[0].replace(/^.*\n/, '');
let cpu = 'function makeCpuSim' + js.split('function makeCpuSim')[1].split('const GLSL_COMMON')[0];
const subs = { grav: ['- 9.8 * dt * dt', '- 0'], floor: ['if (P[i * 3 + 1] < r)', 'if (false)'], fric: ['* 0.06', '* 0.0'], wave: ['(0.09 + joy * 0.2) * s', '0'], ftl: ['* 1.12', '* 100'], coll: ['rr = 0.9 + radAt(s2)', 'rr = 0.0'], anc0: ['if (k === 0) d = v3.sub(g(anc), xi);', 'if (k === 0) d = [0,0,0];'], bend: ['const kb = (0.55 + (0.06 - 0.55) * s2) * kBs;', 'const kb = 0;'], k1: ['(k === 1 ? 1 : 0.5) * (l - L) / l', '0.5 * (l - L) / l'],  vol: ['v3.mul(gr, kVol * (Vt - V) / den)', 'v3.mul(gr, 0)'],
  shape: ['xi), kShape)', 'xi), 0)'], edge: ['kEdge * 2.5 / Math.max(n, 1)', '0'], tgt: ['kTgt(s2) * kT));\n              if (k >= 3)', '0));\n              if (k >= 3)'], back: ['0.3 * (l - L) / l', '0'] };
for (const k of (process.argv[2] || '').split(',').filter(Boolean)) { if (!cpu.includes(subs[k][0])) throw k; cpu = cpu.split(subs[k][0]).join(subs[k][1]); }
const m = {}; new Function('module', `const location={search:''};\n${setup}\n${cpu}\nmodule.exports={makeCpuSim,NP,NH,NN,DT,ITERS};`)(m);
const { makeCpuSim, NP, NH, NN, DT, ITERS } = m.exports;
const sim = makeCpuSim(); let t = 0, out = [];
for (let f = 0; f < 600; f++) { const U = new Float32Array(48); U.set([t, DT, 2, ITERS], 20); U.set([0.55, 0.3, 32, 0.085], 24); U.set([0,0,0,-1], 28); const S = sim.step(U); t += 2*DT; if (f % 100 === 0 || f===599) out.push(S.c.map(x => x.toFixed(2)).join(',')); }
console.log((process.argv[2]||'none').padEnd(18), out.join(' | '));
