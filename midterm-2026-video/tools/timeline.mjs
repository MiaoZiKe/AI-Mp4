// Build timeline.json from script.json + measured segment durations.
import fs from 'fs';
const s=JSON.parse(fs.readFileSync('script.json')); const segs=JSON.parse(fs.readFileSync('audio/segments.json'));
const {leadIn,segmentGap,tail,transition}=s.meta.timing;
let t=0; const scenes=[];
s.scenes.forEach((sc,i)=>{
  const start=t; let c=start+leadIn; const out=[];
  sc.segments.forEach((g,j)=>{const d=segs.find(x=>x.scene===i&&x.seg===j).dur; out.push({start:+c.toFixed(3),end:+(c+d).toFixed(3),dur:d,sub:g.sub,file:`audio/seg/s${i}_${j}.wav`}); c+=d+(j<sc.segments.length-1?segmentGap:0);});
  const end=+(c+tail).toFixed(3); scenes.push({id:sc.id,start:+start.toFixed(3),end,dur:+(end-start).toFixed(3),segments:out}); t=end;
});
const tl={fps:s.meta.fps,duration:+t.toFixed(3),frames:Math.ceil(t*s.meta.fps),transition,scenes};
fs.writeFileSync('timeline.json',JSON.stringify(tl,null,1)); console.log('duration',tl.duration,'frames',tl.frames);
scenes.forEach(x=>console.log(x.id,x.start,x.end,x.dur));
// write scene seconds back to script.json
s.scenes.forEach((sc,i)=>sc.seconds=scenes[i].dur); fs.writeFileSync('script.json',JSON.stringify(s,null,2));
