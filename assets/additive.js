import {CHANNELS, LABELS, additiveColor, describeChannels} from './additive-model.js';
const $=id=>document.getElementById(id);
const active=new Set(CHANNELS);
const groups=Object.freeze({R:'additiveRed',G:'additiveGreen',B:'additiveBlue'});
export function renderAdditive(){
  const selected=CHANNELS.filter(c=>active.has(c));
  const combo=additiveColor(selected);
  for(const code of CHANNELS){
    const on=active.has(code);
    $(groups[code]).style.display=on?'':'none';
    const button=document.querySelector('[data-additive="'+code+'"]');
    button.setAttribute('aria-pressed',String(on));
    button.classList.toggle('selected',on);
    button.querySelector('.additive-onoff').textContent=on?'開':'關';
  }
  $('additiveStatus').textContent=selected.length===3?'三色全開':selected.length===0?'全部關閉':selected.length+' 色開啟';
  $('additiveExplanation').textContent=describeChannels(selected);
  $('additiveDiagram').setAttribute('aria-label',describeChannels(selected));
  return combo;
}
for(const button of document.querySelectorAll('[data-additive]')){
  button.addEventListener('click',()=>{const code=button.dataset.additive;if(active.has(code))active.delete(code);else active.add(code);renderAdditive();});
}
export function showAdditive(){active.clear();CHANNELS.forEach(c=>active.add(c));renderAdditive();}
