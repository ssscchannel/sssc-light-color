import {COLORS, COLOR_NAMES, LIGHTS, OBJECTS, reflectedCode, hasReflectedLight, description} from './reflection-model.js';
const $=id=>document.getElementById(id);
const svgNS='http://www.w3.org/2000/svg';
const NAME={W:'白',R:'紅',G:'綠',B:'藍',C:'青',M:'洋紅',Y:'黃',K:'黑'};
const model={light:'W',object:'R'};
function el(tag,attrs){const e=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;}
function line(layer,x1,y1,x2,y2,color,strokeWidth=5){layer.append(el('line',{x1,y1,x2,y2,stroke:color,'stroke-width':strokeWidth,'stroke-linecap':'round'}));}
function layer(id){const root=$(id);root.replaceChildren();return root;}
function initializeButtons(){
  const add=(group,codes,attr,handler)=>{const target=$(group);for(const code of codes){const b=document.createElement('button');b.type='button';b.className='light-option reflection-option';b.dataset[attr]=code;b.textContent=`${NAME[code]}${attr==='reflectionLight'?'光':'色'}`;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>handler(code));target.append(b);}};
  add('reflectionLights',Object.keys(LIGHTS),'reflectionLight',code=>{model.light=code;render();});
  add('reflectionObjects',Object.keys(OBJECTS),'reflectionObject',code=>{model.object=code;render();});
}
function setSwatch(id,color){$(id).style.backgroundColor=COLORS[color];$(id).style.borderColor=color==='W'?'#8796a0':color==='K'?'#7b8790':'#ffffff88';}
function render(){
  const {light,object}=model, result=reflectedCode(light,object), reflected=hasReflectedLight(light,object);
  document.querySelectorAll('[data-reflection-light]').forEach(b=>{const on=b.dataset.reflectionLight===light;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
  document.querySelectorAll('[data-reflection-object]').forEach(b=>{const on=b.dataset.reflectionObject===object;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
  $('reflectionStatus').textContent=`${COLOR_NAMES[light]}光 × ${COLOR_NAMES[object]}物體`;
  $('reflectionExplanation').textContent=description(light,object);
  $('reflectionOriginalName').textContent=COLOR_NAMES[object];
  $('reflectionResultName').textContent=COLOR_NAMES[result];
  setSwatch('reflectionOriginalSwatch',object);setSwatch('reflectionResultSwatch',result);
  // 教學示意：固定平面、固定入射方向；只繪製一條代表性反射光線。
  $('reflectionPlate').setAttribute('fill',COLORS[result]);
  $('reflectionPlate').setAttribute('stroke',result==='K'?'#b9c6d2':'#eff7ff');
  const incoming=layer('reflectionIncoming');line(incoming,90,296,395,166,COLORS[light],5.6);
  const output=layer('reflectionOutgoing');
  if(reflected)line(output,395,166,105,42,COLORS[result],6.5);
  $('reflectionDiagram').setAttribute('aria-label',reflected?`${COLOR_NAMES[light]}光照射${COLOR_NAMES[object]}物體，反射${COLOR_NAMES[result]}光。`:`${COLOR_NAMES[light]}光照射${COLOR_NAMES[object]}物體，沒有可見的反射光線。`);
}
initializeButtons();
export function showReflection(){model.light='W';model.object='R';render();}
