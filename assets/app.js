import { PRISM } from './optics.js';
import { initDispersion } from './dispersion.js';
const $=id=>document.getElementById(id);
const menu=$('menuView'),dispersion=$('dispersionView');
const state={light:'W',angle:PRISM.defaultAngleDeg};
const ui=initDispersion(state);
function setLight(light){state.light=light;document.querySelectorAll('[data-light]').forEach(el=>{const on=el.dataset.light===light;el.classList.toggle('selected',on);el.setAttribute('aria-pressed',String(on));});const explanations={W:'白光進入三稜鏡後就開始色散，出射後不同顏色分離得更明顯。',R:'紅色單色光通過三稜鏡後會折射，但不會分散成彩虹。',G:'綠色單色光通過三稜鏡後會折射，但不會分散成彩虹。',B:'藍色單色光通過三稜鏡後會折射，但不會分散成彩虹。'};$('resultText').textContent=explanations[light];$('lightStatus').textContent={W:'白光',R:'紅光',G:'綠光',B:'藍光'}[light];// Keep the note visible at a stable height for all light sources.
$('visualNote').textContent=light==='W'?'※ 為了容易觀察，圖中各色光的分離幅度已視覺放大。':'※ 白光的色散會視覺放大；單色光僅顯示一條折射光路。';ui.render();}
function showMenu(){dispersion.hidden=true;menu.hidden=false;$('headerModule').textContent='光與顏色';}
function showDispersion(){state.angle=PRISM.defaultAngleDeg;dispersion.hidden=false;menu.hidden=true;$('headerModule').textContent='光的色散';setLight('W');}
$('homeButton').addEventListener('click',showMenu);
$('dispersionEntry').addEventListener('click',showDispersion);
document.querySelectorAll('[data-light]').forEach(el=>el.addEventListener('click',()=>setLight(el.dataset.light)));
showMenu();
