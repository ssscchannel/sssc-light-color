// 光與顏色｜第 75 步：純物理運算模組（不操作 DOM 或外部資源）
// 座標：x 向右，y 向下；角度以 x 軸正向為 0°，順時針為正。
export const PRISM = Object.freeze({
  vertices: [[0, 0], [-100, 100 * Math.sqrt(3)], [100, 100 * Math.sqrt(3)]],
  entry: [-50, 50 * Math.sqrt(3)],
  sourceRadius: 180,
  allowedAnglesDeg: [-32, -10],
  defaultAngleDeg: -21,
});
export const SOURCE_WAVELENGTHS_NM = Object.freeze({R:650,G:530,B:460});
const B = [1.03961212, 0.231792344, 1.01046945];
const C = [0.00600069867, 0.0200179144, 103.560653];
const EPS = 1e-9;
const add = (a,b) => [a[0]+b[0],a[1]+b[1]];
const sub = (a,b) => [a[0]-b[0],a[1]-b[1]];
const mul = (a,s) => [a[0]*s,a[1]*s];
const dot = (a,b) => a[0]*b[0]+a[1]*b[1];
const cross = (a,b) => a[0]*b[1]-a[1]*b[0];
const length = v => Math.hypot(...v);
const norm = v => mul(v, 1/length(v));
const clamp = (v, lo, hi) => Math.max(lo,Math.min(hi,v));
const radians = d => d*Math.PI/180;
export const degrees = r => r*180/Math.PI;
export function refractiveIndex(wavelengthNm) {
  if (!Number.isFinite(wavelengthNm) || wavelengthNm < 400 || wavelengthNm > 700) throw new RangeError('Wavelength outside configured visible range');
  const l2 = (wavelengthNm/1000)**2;
  return Math.sqrt(1+B.reduce((sum, b, i)=> sum+b*l2/(l2-C[i]), 0));
}
// n1 -> n2; normal points toward incident medium. No falsely transmitted ray under TIR.
export function refract(direction, surfaceNormalTowardIncident, n1, n2) {
  const d = norm(direction), normal = norm(surfaceNormalTowardIncident);
  const cosI = -dot(normal,d);
  if (cosI < -EPS) throw new Error('Normal points away from incident medium');
  const eta = n1/n2;
  const k = 1-eta*eta*(1-cosI*cosI);
  if (k < -EPS) return null;
  return norm(add(mul(d,eta),mul(normal,eta*cosI-Math.sqrt(Math.max(0,k)))));
}
// ray P+tD intersects finite segment A+u(B-A), t>=0 and 0<=u<=1.
export function intersectRaySegment(p,d,a,b) {
  const segment=sub(b,a), den=cross(d,segment);
  if(Math.abs(den) < EPS) return null;
  const rel=sub(a,p);
  const t=cross(rel,segment)/den, u=cross(rel,d)/den;
  if (t < -EPS || u < -EPS || u > 1+EPS) return null;
  return {point:add(p,mul(d,t)),distance:t,segmentFraction:u};
}
export function sourcePosition(angleDeg) {
  if (!Number.isFinite(angleDeg)) throw new RangeError('Angle must be finite');
  const angle=radians(clamp(angleDeg,...PRISM.allowedAnglesDeg));
  return sub(PRISM.entry, mul([Math.cos(angle),Math.sin(angle)],PRISM.sourceRadius));
}
export function tracePrism(wavelengthNm, angleDeg=PRISM.defaultAngleDeg) {
  if (!Number.isFinite(angleDeg) || angleDeg < PRISM.allowedAnglesDeg[0]-EPS || angleDeg > PRISM.allowedAnglesDeg[1]+EPS) throw new RangeError('Incident direction outside supported arc');
  const index=refractiveIndex(wavelengthNm), dir=[Math.cos(radians(angleDeg)),Math.sin(radians(angleDeg))];
  const [top,left,right]=PRISM.vertices;
  // The left sloping side's air-facing normal and right sloping side's glass-facing normal.
  const leftOut=norm([-Math.sqrt(3)/2,-1/2]);
  const inside=refract(dir,leftOut,1,index);
  if(!inside) return {status:'TOTAL_INTERNAL_REFLECTION_ENTRY'};
  const hit=intersectRaySegment(PRISM.entry,inside,top,right);
  if(!hit) return {status:'NO_RIGHT_FACE_INTERSECTION', entry:PRISM.entry, internalDirection:inside};
  const rightIn=norm([-Math.sqrt(3)/2,1/2]);
  const outgoing=refract(inside,rightIn,index,1);
  if(!outgoing) return {status:'TOTAL_INTERNAL_REFLECTION_EXIT', entry:PRISM.entry, exit:hit.point};
  return {status:'OK', wavelengthNm, refractiveIndex:index, source:sourcePosition(angleDeg), entry:PRISM.entry, internalDirection:inside, exit:hit.point, outgoingDirection:outgoing, outgoingAngleDeg:degrees(Math.atan2(outgoing[1],outgoing[0]))};
}
export function visibleSpectrum(stepNm=5) {
  if(!Number.isFinite(stepNm) || stepNm<=0 || 300%stepNm!==0) throw new RangeError('Step must evenly divide 300 nm');
  return Array.from({length:300/stepNm+1},(_,i)=>400+i*stepNm);
}
