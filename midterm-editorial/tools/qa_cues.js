// QA: pick 5 random narration-keyword cues, verify the visual element starts changing within ±2 frames of the word timestamp.
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const ROOT=path.resolve(__dirname,"..");
(async()=>{
 const srv=http.createServer((q,r)=>{const p=path.join(ROOT,decodeURIComponent(q.url.split("?")[0]));if(!fs.existsSync(p)){r.writeHead(404);return r.end()}r.writeHead(200,{"Content-Type":p.endsWith(".html")?"text/html":p.endsWith(".js")?"text/javascript":p.endsWith(".json")?"application/json":"font/ttf"});fs.createReadStream(p).pipe(r)}).listen(0);
 await new Promise(r=>srv.on("listening",r));
 const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
 await pg.goto(`http://127.0.0.1:${srv.address().port}/src/index.html`);await pg.waitForFunction(()=>window.READY);
 const V=JSON.parse(fs.readFileSync(path.join(ROOT,"voice_timing.json")));
 const cues=await pg.evaluate(()=>window.CUES);
 const kpi=cues.filter(c=>c.action.startsWith("kpi:")||c.action.startsWith("hl:")||["seats","tilt"].includes(c.action));
 let seed=Number(process.argv[2]||2026);const rnd=()=>((seed=(seed*1103515245+12345)%2147483648)/2147483648);
 const pick=[];while(pick.length<5){const c=kpi[Math.floor(rnd()*kpi.length)];if(!pick.includes(c))pick.push(c)}
 const out=[];
 for(const c of pick){
  // ground truth: word timestamp from voice_timing
  const P=V.pages.find(p=>p.id===c.page);const s=P.words.map(w=>w.w).join("");
  let idx=-1,from=0;while((idx=s.indexOf(c.say,from))>=0&&c.action.startsWith("hl:")&&P.words[idx].start<c.t-0.2)from=idx+1;
  const wt=P.words[idx].start;
  // probe the DOM state frame by frame around the word
  const probe=async t=>pg.evaluate(([t,c])=>{window.seek(t);
    if(c.action.startsWith("kpi:")){const v=c.action.slice(4);const k=[...document.querySelectorAll(".kpi")].find(e=>e.dataset.v===v&&e.dataset.page===c.page);return +getComputedStyle(k).opacity}
    if(c.action.startsWith("hl:")){const k=[...document.querySelectorAll(".sub .k")].find(e=>e.dataset.page===c.page&&e.textContent===c.action.slice(3));const col=getComputedStyle(k).color;return col==="rgb(237, 232, 223)"?0:1}
    if(c.action==="seats"){const polys=[...[...document.querySelectorAll(".page")].find(p=>p.dataset.page===c.page).querySelectorAll(".box polygon:last-child")];
      const rgb=f=>{if(f.startsWith("#"))return [1,3,5].map(i=>parseInt(f.slice(i,i+2),16));return f.match(/[\d.]+/g).slice(0,3).map(Number)};
      const n=[0x3A,0x39,0x36];const changed=polys.filter(p=>{const c=rgb(p.getAttribute("fill"));return Math.abs(c[0]-n[0])+Math.abs(c[1]-n[1])+Math.abs(c[2]-n[2])>6}).length;return changed}
    if(c.action==="tilt"){const p=[...document.querySelectorAll(".page")].find(p=>p.dataset.page===c.page);const g=p.querySelector("svg > g:not(.float)");return Math.abs(gsap.getProperty(g,"rotation"))>0.01?1:0}
  },[t,c]);
  let first=null;for(let f=-6;f<=6;f++){const t=Math.round(wt*30+f)/30;const v=await probe(t);if(v>0.001&&first===null)first=f}
  out.push({page:c.page,say:c.say,element:c.action,word_ts:wt,first_change_frame_offset:first,ok:first!==null&&Math.abs(first)<=2});
 }
 console.log(JSON.stringify(out,null,1));fs.writeFileSync(path.join(ROOT,"preview/qa/cue_check.json"),JSON.stringify(out,null,1));
 await b.close();srv.close();
})();
