import { PRISM, SOURCE_WAVELENGTHS_NM, tracePrism, visibleSpectrum, sourcePosition } from './optics.js';

const svgNS = 'http://www.w3.org/2000/svg';
const $ = id => document.getElementById(id);
const add = (a,b,s=1) => [a[0]+s*b[0],a[1]+s*b[1]];
const vecString = xy => xy.map(v=>Number(v).toFixed(3)).join(' ');
const node = (tag,attrs) => {const n=document.createElementNS(svgNS,tag);for(const [key,value] of Object.entries(attrs)) n.setAttribute(key,value);return n;};
const pointList = (...p) => p.map(v=>v.map(x=>x.toFixed(3)).join(',')).join(' ');
const segment = (group,start,end,color,weight=2.4,opacity=1) => group.append(node('line',{
  x1:start[0], y1:start[1], x2:end[0], y2:end[1], stroke:color,
  'stroke-width':weight, 'stroke-linecap':'round', opacity
}));
function spectrumColor(nm) {
  // RGB values are display approximations, not a spectral radiometric measurement.
  const stops=[[400,[126,72,221]],[440,[79,88,247]],[480,[42,163,254]],[500,[31,205,197]],[530,[63,219,87]],[570,[224,226,53]],[590,[255,190,48]],[620,[252,117,45]],[650,[240,68,58]],[700,[191,37,62]]];
  let i=0;while(i<stops.length-2 && nm>stops[i+1][0])i++;
  const [a,c1]=stops[i],[b,c2]=stops[i+1];
  const t=Math.max(0,Math.min(1,(nm-a)/(b-a)));
  return `rgb(${c1.map((v,k)=>Math.round(v+(c2[k]-v)*t)).join(',')})`;
}
function normal(group,at,vector){segment(group,add(at,vector,-32),add(at,vector,32),'#f7f9fb',2.2,.95);}

// Educational display-only exaggeration; optics.js still calculates the physically
// correct refractive index, Snell-law directions and prism intersections.
// Shift each wavelength's exit point *along the actual prism surface* so the
// displayed internal color fan is legible, even on a phone.
// Right side runs from apex (0,0) to bottom-right (100,173.205...).
// This tangent MUST follow that edge; the old negative x-component
// incorrectly moved display rays off the glass surface and caused seams.
const rightEdgeTangent=[.5,Math.sqrt(3)/2];
const fanShift=nm=>(550-nm)/150*11;
const endpointX=305;
function visibleExit(ray){return add(ray.exit,rightEdgeTangent,fanShift(ray.wavelengthNm));}
function projectedY(ray,x){
  const dx=x-ray.exit[0];
  return ray.exit[1]+ray.outgoingDirection[1]/ray.outgoingDirection[0]*dx;
}
function visibleEnd(ray){
  const displayOffset=(550-ray.wavelengthNm)/150*26;
  return [endpointX,projectedY(ray,endpointX)+displayOffset];
}
function drawSpectrumBand(group,rays,part){
  for(let i=0;i<rays.length-1;i++){
    const a=rays[i],b=rays[i+1];
    const a0=part==='inner'?a.entry:visibleExit(a);
    const b0=part==='inner'?b.entry:visibleExit(b);
    const a1=part==='inner'?visibleExit(a):visibleEnd(a);
    const b1=part==='inner'?visibleExit(b):visibleEnd(b);
    group.append(node('polygon',{points:pointList(a0,a1,b1,b0),fill:spectrumColor((a.wavelengthNm+b.wavelengthNm)/2),opacity:part==='inner'?.96:1}));
  }
  // Close up the extremely narrow portions at the prism entry and the rainbow tip.
  for(const index of [0,rays.length-1]){
    const ray=rays[index];
    const a=part==='inner'?ray.entry:visibleExit(ray);
    const b=part==='inner'?visibleExit(ray):visibleEnd(ray);
    segment(group,a,b,spectrumColor(ray.wavelengthNm),part==='inner'?1.8:2.4,.97);
  }
}

export function initDispersion(state,onAngleChange){
  const svg=$('opticsSvg'),handle=$('sourceHandle');
  const arc=$('sourceArc'); const [min,max]=PRISM.allowedAnglesDeg;
  arc.setAttribute('d',Array.from({length:61},(_,i)=>{
    const pt=sourcePosition(min+(max-min)*i/60);
    return `${i?'L':'M'} ${vecString(pt)}`;
  }).join(' '));
  function render(){
    ['incomingRays','innerRays','outgoingRays','normalLines'].forEach(id=>$(id).replaceChildren());
    const incoming=$('incomingRays'),inner=$('innerRays'),out=$('outgoingRays'),normals=$('normalLines');
    const waves=state.light==='W'?visibleSpectrum():[SOURCE_WAVELENGTHS_NM[state.light]];
    const rays=waves.map(w=>tracePrism(w,state.angle)).filter(t=>t.status==='OK');
    if(!rays.length)return;
    const source=sourcePosition(state.angle);
    handle.setAttribute('transform',`translate(${vecString(source)})`);
    handle.setAttribute('aria-valuenow',state.angle.toFixed(1));
    const colors={W:'#fffef2',R:'#f54b5f',G:'#42e36c',B:'#519afa'};
    segment(incoming,source,PRISM.entry,colors[state.light],5.3,1);
    if(state.light==='W'){
      // Spectral bands already appear inside the prism, and continue into the
      // widened outgoing fan; no change is made to the physical calculation.
      drawSpectrumBand(inner,rays,'inner');
      drawSpectrumBand(out,rays,'outer');
    }else{
      const r=rays[0];
      segment(inner,r.entry,r.exit,colors[state.light],5.1,1);
      const xEnd=endpointX;
      const end=[xEnd,projectedY(r,xEnd)];
      segment(out,r.exit,end,colors[state.light],5.5,1);
    }
    normal(normals,PRISM.entry,[-Math.sqrt(3)/2,-.5]);
    normal(normals,rays[Math.floor(rays.length/2)].exit,[-Math.sqrt(3)/2,.5]);
  }
  function pointerToWorld(event){
    const ctm=svg.getScreenCTM();if(!ctm)return null;
    const pt=svg.createSVGPoint();pt.x=event.clientX;pt.y=event.clientY;
    return pt.matrixTransform(ctm.inverse());
  }
  function updateFromPointer(event){
    const pt=pointerToWorld(event);if(!pt)return;
    const raw=Math.atan2(PRISM.entry[1]-pt.y,PRISM.entry[0]-pt.x)*180/Math.PI;
    const angle=Math.max(min,Math.min(max,raw));
    if(Number.isFinite(angle)){state.angle=angle;render();onAngleChange?.(angle);}
  }
  let dragId=null;
  handle.addEventListener('pointerdown',event=>{
    event.preventDefault();dragId=event.pointerId;
    handle.setPointerCapture(event.pointerId);updateFromPointer(event);
  });
  handle.addEventListener('pointermove',event=>{if(dragId===event.pointerId)updateFromPointer(event);});
  function stop(event){if(dragId===event.pointerId)dragId=null;}
  handle.addEventListener('pointerup',stop);
  handle.addEventListener('pointercancel',stop);
  handle.addEventListener('lostpointercapture',()=>{dragId=null;});
  handle.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowDown') state.angle=Math.max(min,state.angle-.5);
    else if(event.key==='ArrowRight'||event.key==='ArrowUp') state.angle=Math.min(max,state.angle+.5);
    else if(event.key==='Home') state.angle=min;
    else if(event.key==='End') state.angle=max;
    else return;
    event.preventDefault();render();onAngleChange?.(state.angle);
  });
  return {render};
}
