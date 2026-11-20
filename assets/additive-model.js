/** Teaching-oriented ideal RGB additive-light model. */
export const CHANNELS=Object.freeze(['R','G','B']);
export const LABELS=Object.freeze({R:'紅光',G:'綠光',B:'藍光'});
export const COMBINATION=Object.freeze({
  '':'無色光',R:'紅光',G:'綠光',B:'藍光',RG:'黃光',RB:'洋紅光',GB:'青光',RGB:'白光'
});
export const HEX=Object.freeze({'':'#252536',R:'#ff0000',G:'#00ff00',B:'#0000ff',RG:'#ffff00',RB:'#ff00ff',GB:'#00ffff',RGB:'#ffffff'});
export function normalizedChannels(codes){
  if(!Array.isArray(codes))throw new TypeError('Channels must be array');
  const set=new Set(codes);
  for(const c of set)if(!CHANNELS.includes(c))throw new RangeError('Unknown channel '+c);
  return CHANNELS.filter(c=>set.has(c)).join('');
}
export function additiveColor(codes){const code=normalizedChannels(codes);return {code,label:COMBINATION[code],hex:HEX[code]};}
export function describeChannels(codes){
  const code=normalizedChannels(codes);
  if(code==='RGB')return '紅、綠、藍三色光全部開啟；紅綠重疊呈黃、綠藍呈青、紅藍呈洋紅，三色重疊呈白。';
  if(!code)return '三個色光都已關閉，畫面沒有投射光。';
  if(code.length===1)return LABELS[code]+'單獨投射時，只有一種色光。';
  const names={RG:'紅光與綠光',RB:'紅光與藍光',GB:'綠光與藍光'};
  return names[code]+'重疊區形成'+COMBINATION[code]+'。';
}
