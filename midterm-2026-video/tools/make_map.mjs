// Pre-projected (Albers USA) state outlines -> simplified SVG paths
import fs from 'fs'; import * as topo from 'topojson-client'; import {geoPath} from 'd3-geo';
const us=JSON.parse(fs.readFileSync('node_modules/us-atlas/states-albers-10m.json'));
const fc=topo.feature(us,us.objects.states); const p=geoPath(null).digits(1);
const states=fc.features.map(f=>({id:f.id,name:f.properties.name,d:p(f),c:p.centroid(f).map(Math.round)}));
fs.writeFileSync('template/assets/usmap.json',JSON.stringify(states));
console.log(states.length, fs.statSync('template/assets/usmap.json').size);
