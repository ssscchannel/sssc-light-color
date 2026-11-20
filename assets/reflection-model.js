/** 教學理想化 RGB 反射模型。RGB 頻帶視為獨立的可反射成分，不計亮度、材料光譜與表面質地。 */
export const LIGHTS = Object.freeze({W:7,R:4,G:2,B:1,C:3,M:5,Y:6});
export const OBJECTS = Object.freeze({...LIGHTS,K:0});
export const COLOR_NAMES = Object.freeze({W:'白色',R:'紅色',G:'綠色',B:'藍色',C:'青色',M:'洋紅色',Y:'黃色',K:'黑色'});
export const COLORS = Object.freeze({W:'#FFFFFF',R:'#FF4A54',G:'#45E47D',B:'#4A9EFF',C:'#35D8DD',M:'#EB68E9',Y:'#FFE26A',K:'#14171D'});
export function reflectedMask(light,object){
  if (!Object.hasOwn(LIGHTS,light) || !Object.hasOwn(OBJECTS,object)) throw new RangeError('Unknown color code');
  return LIGHTS[light] & OBJECTS[object];
}
const CODES_BY_MASK = Object.freeze(['K','B','G','C','R','M','Y','W']);
export function reflectedCode(light,object){return CODES_BY_MASK[reflectedMask(light,object)];}
export function reflectedColor(light,object){return COLORS[reflectedCode(light,object)];}
export function hasReflectedLight(light,object){return reflectedMask(light,object)!==0;}
export function description(light,object){
  const result=reflectedCode(light,object);
  if(result==='K') return `${COLOR_NAMES[light]}光照在${COLOR_NAMES[object]}物體上，理想模型中沒有共同的可反射色光，因此看起來是黑色。`;
  if(light==='W') return `白光包含紅、綠、藍三種色光成分；${COLOR_NAMES[object]}物體反射其中部分成分，因此看起來是${COLOR_NAMES[result]}。`;
  return `${COLOR_NAMES[light]}光照在${COLOR_NAMES[object]}物體上，可反射的色光成分形成${COLOR_NAMES[result]}，因此物體看起來是${COLOR_NAMES[result]}。`;
}
