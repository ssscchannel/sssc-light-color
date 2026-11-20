import {LIGHTS,FILTERS,COLORS,NAMES,transmissionStages,explanatoryText} from './transmission-model.js';
const $=id=>document.getElementById(id);
const NS='http://www.w3.org/2000/svg';
const state={light:'W',filters:['R']};
function svgLine(g,x1,y1,x2,y2,color){const l=document.createElementNS(NS,'line');for(const [k,v] of Object.entries({x1,y1,x2,y2,stroke:color,'stroke-width':7,'stroke-linecap':'round'}))l.setAttribute(k,v);g.append(l);}
function updateButtons(){
  document.querySelectorAll('[data-transmission-light]').forEach(b=>{
    const on=b.dataset.transmissionLight===state.light;
    b.classList.toggle('selected',on);
    b.setAttribute('aria-pressed',String(on));
  });
  $('transmissionFilter0').value=state.filters[0];
  $('transmissionFilter1').value=state.filters[1]??'NONE';
  $('transmissionSwap').disabled=state.filters.length===1;
}
export function renderTransmission(){
  updateButtons();
  const stages=transmissionStages(state.light,state.filters);
  const firstFilter=$('transmissionPlateFirst'), secondFilter=$('transmissionPlateSecond');
  // The first plate never shifts when the second filter is selected or removed.
  firstFilter.setAttribute('x','234');
  firstFilter.setAttribute('fill',COLORS[state.filters[0]]);
  // SVG <rect> should use CSS display, not the HTML hidden attribute.
  secondFilter.removeAttribute('hidden');
  secondFilter.style.display=state.filters.length===2?'':'none';
  if(state.filters.length===2) secondFilter.setAttribute('fill',COLORS[state.filters[1]]);
  const beam=$('transmissionRays');
  beam.replaceChildren();
  const y=173,xs=state.filters.length===1?[65,242,520]:[65,242,363,520];
  for(let i=0;i<stages.length;i++){
    if(stages[i]==='K')break;
    svgLine(beam,xs[i],y,xs[i+1],y,COLORS[stages[i]]);
  }
  const result=stages.at(-1);
  $('transmissionStatus').textContent=state.filters.length===1?'單片色片':'雙片色片';
  $('transmissionResultName').textContent=result==='K'?'無出射光':NAMES[result]+'光';
  $('transmissionResultSwatch').style.backgroundColor=COLORS[result];
  $('transmissionExplanation').textContent=explanatoryText(state.light,state.filters);
  $('transmissionDiagram').setAttribute('aria-label',explanatoryText(state.light,state.filters));
}
function initialize(){
  const group=$('transmissionLights');
  for(const code of Object.keys(LIGHTS)){
    const b=document.createElement('button');
    b.type='button';b.className='light-option transmission-option';
    b.textContent=NAMES[code]+'光';b.dataset.transmissionLight=code;
    b.addEventListener('click',()=>{state.light=code;renderTransmission();});
    group.append(b);
  }
  for(let i=0;i<2;i++){
    const picker=$('transmissionFilter'+i);
    if(i===1){
      const none=document.createElement('option');none.value='NONE';none.textContent='無';picker.append(none);
    }
    for(const code of Object.keys(FILTERS)){
      const opt=document.createElement('option');opt.value=code;
      opt.textContent=NAMES[code]+'色片';picker.append(opt);
    }
    picker.addEventListener('change',()=>{
      if(i===0) state.filters[0]=picker.value;
      else state.filters=picker.value==='NONE'?[state.filters[0]]:[state.filters[0],picker.value];
      renderTransmission();
    });
  }
  $('transmissionSwap').addEventListener('click',()=>{
    if(state.filters.length===2)state.filters.reverse();
    renderTransmission();
  });
}
initialize();
export function showTransmission(){state.light='W';state.filters=['R'];renderTransmission();}