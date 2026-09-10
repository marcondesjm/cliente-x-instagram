import assert from 'node:assert/strict';
import { assertVisualAgentPlan, buildVisualAgentPlan } from '../lib/visual-agent.js';
const pack = { research: { sourceUrl: 'https://example.com/article' }, slides: [{}, {}, {}] };
const sources = Array.from({length:3},(_,i)=>({sourceUrl:pack.research.sourceUrl,path:`/photo-${i}.jpg`,imageHash:`hash-${i}`,imageUrl:`https://example.com/${i}.jpg`}));
assert.equal(assertVisualAgentPlan(pack,buildVisualAgentPlan(pack,sources)).approvedVisuals,3);
for (const photos of [[],sources.slice(0,1),[sources[0],sources[0],sources[2]],sources.map(s=>({...s,reusedRelevantImage:true})),sources.map(s=>({...s,sourceUrl:'https://example.com/unrelated'}))]) {
  assert.throws(()=>assertVisualAgentPlan(pack,buildVisualAgentPlan(pack,photos)),/foto da matéria/);
}
assert.doesNotThrow(()=>assertVisualAgentPlan({slides:[{}]},buildVisualAgentPlan({slides:[{}]})));
console.log('Visual plan: unique photos accepted; missing, repeated, unrelated and historical photos blocked.');
