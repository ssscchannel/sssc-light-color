/** 教學理想化 RGB 光色片透射模型；只考慮三個頻帶，不模擬亮度及真實材料光譜。 */
export const LIGHTS=Object.freeze({W:7,R:4,G:2,B:1});
export const FILTERS=Object.freeze({R:4,G:2,B:1,C:3,M:5,Y:6});
export const COLORS=Object.freeze({W:'#FFFFFF',R:'#FF4A54',G:'#45E47D',B:'#4A9EFF',C:'#35D8DD',M:'#EB68E9',Y:'#FFE26A',K:'#14171D'});
export const NAMES=Object.freeze({W:'白',R:'紅',G:'綠',B:'藍',C:'青',M:'洋紅',Y:'黃',K:'黑'});
export const CODES_BY_MASK=Object.freeze(['K','B','G','C','R','M','Y','W']);
function checked(dict,key){if(!Object.hasOwn(dict,key))throw new RangeError('Unknown color code: '+key);return dict[key];}
export function transmittedMask(light,filters){let mask=checked(LIGHTS,light);if(!Array.isArray(filters)||filters.length<1||filters.length>2)throw new RangeError('Use 1 or 2 filters');for(const f of filters)mask&=checked(FILTERS,f);return mask;}
export function transmissionStages(light,filters){let mask=checked(LIGHTS,light);if(!Array.isArray(filters)||filters.length<1||filters.length>2)throw new RangeError('Use 1 or 2 filters');const stages=[CODES_BY_MASK[mask]];for(const f of filters){mask&=checked(FILTERS,f);stages.push(CODES_BY_MASK[mask]);}return stages;}
export function transmittedCode(light,filters){return CODES_BY_MASK[transmittedMask(light,filters)];}
export function explanatoryText(light,filters){const stages=transmissionStages(light,filters);const result=stages.at(-1);if(result==='K')return `${NAMES[light]}光經過${filters.map(f=>NAMES[f]+'色片').join('、')}後，沒有共同可透過的色光成分，因此沒有出射光。`;return `${NAMES[light]}光依序通過${filters.map(f=>NAMES[f]+'色片').join('、')}，最後透出${NAMES[result]}光。`;}
