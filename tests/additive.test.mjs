import test from 'node:test';
import assert from 'node:assert/strict';
import {CHANNELS,normalizedChannels,additiveColor,describeChannels} from '../assets/additive-model.js';
test('RGB channel names and default order',()=>assert.deepEqual(CHANNELS,['R','G','B']));
test('Three enabled lights give white',()=>assert.deepEqual(additiveColor(['R','G','B']),{code:'RGB',label:'白光',hex:'#ffffff'}));
test('Red+green gives yellow',()=>assert.equal(additiveColor(['R','G']).hex,'#ffff00'));
test('Green+blue gives cyan',()=>assert.equal(additiveColor(['G','B']).hex,'#00ffff'));
test('Red+blue gives magenta',()=>assert.equal(additiveColor(['R','B']).hex,'#ff00ff'));
test('One enabled light gives its own color',()=>{assert.equal(additiveColor(['R']).hex,'#ff0000');assert.equal(additiveColor(['G']).hex,'#00ff00');assert.equal(additiveColor(['B']).hex,'#0000ff')});
test('No enabled lights gives dark stage',()=>assert.equal(additiveColor([]).code,''));
test('Input order and duplicates do not affect mixture',()=>assert.equal(additiveColor(['B','R','R']).code,'RB'));
test('Invalid channels rejected',()=>{assert.throws(()=>additiveColor(['X']),RangeError);assert.throws(()=>normalizedChannels('RGB'),TypeError)});
test('User-facing explanations distinguish one, two, three, none',()=>{assert.match(describeChannels(['R']),/單獨/);assert.match(describeChannels(['R','G']),/黃光/);assert.match(describeChannels(['R','G','B']),/白/);assert.match(describeChannels([]),/關閉/)})
