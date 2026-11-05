// Headless check of the PBD model: extracts the shared setup + CPU solver from index.html and steps it.
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const js = html.split('<script>')[1].split('</script>')[0];
const setup = js.split('//  Camera, input, UI')[0].replace(/^.*\n/, '');
const cpu = 'function makeCpuSim' + js.split('function makeCpuSim')[1].split('const GLSL_COMMON')[0];
const src = `const location={search:''};\n${setup.replace(/^\/\/ ═+$/m, '')}\n${cpu}\nmodule.exports={makeCpuSim,NP,NH,NN,Y0,REST,DT,ITERS};`;
const m = {}; new Function('module', src)(m);
const { makeCpuSim, NP, NH, NN, DT, ITERS } = m.exports;
const sim = makeCpuSim();
const opt = JSON.parse(process.argv[2] || '{}');
let t = 0;
for (let f = 0; f < (opt.frames || 600); f++) {
  const U = new Float32Array(48);
  U.set([t, DT, 2, ITERS], 20); U.set([0.55, 0.3, 32, 0.085], 24);
  let grab = -1, tgt = [0, 0, 0];
  if (opt.grab && f >= 200 && f < 260) { grab = NH + 1 * NN + 17; tgt = [0.2 + (f - 200) * 0.03, 0.5 + (f - 200) * 0.025, 2.2]; }
  U.set([...tgt, grab], 28); U.set([0, 0, 0.022 * Math.sin(t * 1.7), 0], 32);
  const S = sim.step(U); t += 2 * DT;
  if (f % (opt.every || 50) === 0 || f === (opt.frames || 600) - 1) {
    let mx = 0, minY = 9; for (let i = 0; i < NP; i++) { mx = Math.max(mx, Math.abs(S.P[i*3]), Math.abs(S.P[i*3+1]), Math.abs(S.P[i*3+2])); minY = Math.min(minY, S.P[i*3+1]); }
    const tip = NH + 1 * NN + 25;
    const up = [2*(S.q[0]*S.q[1]-S.q[2]*S.q[3]), 1-2*(S.q[0]*S.q[0]+S.q[2]*S.q[2]), 2*(S.q[1]*S.q[2]+S.q[0]*S.q[3])]; console.log(`f${f} up=${up.map(x=>x.toFixed(2))} c=${S.c.map(x => x.toFixed(2))} max=${mx.toFixed(2)} minY=${minY.toFixed(3)} tip=${[0,1,2].map(a => S.P[tip*3+a].toFixed(2))} g=${[0,1,2].map(a => S.P[(NH+NN+17)*3+a].toFixed(2))}`);
  }
}
