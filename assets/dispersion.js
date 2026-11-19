import { PRISM, SOURCE_WAVELENGTHS_NM, tracePrism, visibleSpectrum, sourcePosition } from './optics.js';
const svgNS='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id);
const p=(v)=>v.map(x=>Number(x).toFixed(4)).join(',');
const add=(a,b,s=1)=>[a[0]+s*b[0],a[1]+s*b[1]];
const node=(tag,attrs)=>{let n=document.createElementNS(svgNS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n;};
function segment(parent,start,end,color,weight=2.4,opacity=1){parent.append(node('line',{x1:start[0],y1:start[1],x2:end[0],y2:end[1],stroke:color,'stroke-width':weight,'stroke-linecap':'round',opacity}));}
function spectrumColor(nm){
  // Deliberately approximate display color, not spectral radiometry.
  const stops=[[400,[125,75,211]],[440,[74,93,231]],[480,[46,170,235]],[500,[35,207,184]],[530,[61,211,91]],[570,[205,221,50]],[590,[250,191,50]],[620,[242,109,46]],[650,[229,69,63]],[700,[163,36,55]]];
  let i=0;while(i<stops.length-2&&nm>stops[i+1][0])i++;
  const [a,c1]=stops[i], [b,c2]=stops[i+1], t=Math.max(0,Math.min(1,(nm-a)/(b-a)));
  return `rgb(${c1.map((v,k)=>Math.round(v+(c2[k]-v)*t)).join(',')})`;
}
const lineEnd=ray=>add(ray.exit,ray.outgoingDirection,410);
const points=(a,b,c,d)=>[a,b,c,d].map(p).join(' ');
function band(parent,rays,kind){for(let i=0;i<rays.length-1;i++){
  const a=rays[i],b=rays[i+1]; const a0=kind==='inner'?a.entry:a.exit, b0=kind==='inner'?b.entry:b.exit;
  const a1=kind==='inner'?a.exit:lineEnd(a), b1=kind==='inner'?b.exit:lineEnd(b);
  parent.append(node('polygon',{points:points(a0,a1,b1,b0),fill:spectrumColor((a.wavelengthNm+b.wavelengthNm)/2),opacity:kind==='inner'?.6:.85}));
}}
function normal(parent,at,vec){segment(parent,add(at,vec,-30),add(at,vec,30),'#d6e0eb',1.1,.65);}
export function initDispersion(state,onAngleChange){
 const svg=$('opticsSvg'), handle=$('sourceHandle');
 const arc=$('sourceArc');const a=PRISM.allowedAnglesDeg;
 arc.setAttribute('d',Array.from({length:61},(_,i)=>{const v=sourcePosition(a[0]+(a[1]-a[0])*i/60);return `${i?'L':'M'} ${p(v).replace(',',' ')}`}).join(' '));
 function render(){
   const groups=['incomingRays','innerRays','outgoingRays','normalLines'];groups.forEach(id=>$(id).replaceChildren());
   const incoming=$('incomingRays'),inner=$('innerRays'),out=$('outgoingRays'),normals=$('normalLines');
   const wave=state.light==='W'?visibleSpectrum():[SOURCE_WAVELENGTHS_NM[state.light]];
   const traces=wave.map(w=>tracePrism(w,state.angle)).filter(t=>t.status==='OK');
   if(!traces.length)return;
   const source=sourcePosition(state.angle);
   handle.setAttribute('transform',`translate(${p(source).replace(',',' ')})`);
   handle.setAttribute('aria-valuenow',String(state.angle.toFixed(1)));
   const palette={W:'#fffaf0',R:'#eb5659',G:'#41d677',B:'#4d98f5'};
   segment(incoming,source,PRISM.entry,palette[state.light],3.8);
   if(state.light==='W'){
      band(inner,traces,'inner');band(out,traces,'outgoing');
      // Make boundary lines visible without inventing a greater angle.
      for(let i of [0,traces.length-1]){const t=traces[i];segment(out,t.exit,lineEnd(t),spectrumColor(t.wavelengthNm),1,.8);}
   }else{
      const t=traces[0];segment(inner,t.entry,t.exit,palette[state.light],2.6,.92);segment(out,t.exit,lineEnd(t),palette[state.light],3,.95);
   }
   // Both normals are genuine surface normals.
   normal(normals,PRISM.entry,[-Math.sqrt(3)/2,-.5]);
   const exit=traces[Math.floor(traces.length/2)].exit;
   normal(normals,exit,[-Math.sqrt(3)/2,.5]);
 }
 function pointerToWorld(ev){const ctm=svg.getScreenCTM();if(!ctm)return null;let pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;return pt.matrixTransform(ctm.inverse());}
 function updateFromPointer(ev){const v=pointerToWorld(ev);if(!v)return;const dx=PRISM.entry[0]-v.x,dy=PRISM.entry[1]-v.y;const raw=Math.atan2(dy,dx)*180/Math.PI;const newAngle=Math.max(a[0],Math.min(a[1],raw)); if(Number.isFinite(newAngle)){state.angle=newAngle;render();onAngleChange?.(newAngle);}}
 let dragId=null;
 handle.addEventListener('pointerdown',ev=>{ev.preventDefault();dragId=ev.pointerId;handle.setPointerCapture(ev.pointerId);updateFromPointer(ev);});
 handle.addEventListener('pointermove',ev=>{if(dragId===ev.pointerId)updateFromPointer(ev);});
 const stop=ev=>{if(dragId===ev.pointerId)dragId=null;};
 handle.addEventListener('pointerup',stop);handle.addEventListener('pointercancel',stop);handle.addEventListener('lostpointercapture',()=>{dragId=null;});
 handle.addEventListener('keydown',ev=>{if(ev.key==='ArrowLeft'||ev.key==='ArrowDown'){state.angle=Math.max(a[0],state.angle-.5);}else if(ev.key==='ArrowRight'||ev.key==='ArrowUp'){state.angle=Math.min(a[1],state.angle+.5);}else if(ev.key==='Home'){state.angle=a[0];}else if(ev.key==='End'){state.angle=a[1];}else return;ev.preventDefault();render();});
 return {render};
}