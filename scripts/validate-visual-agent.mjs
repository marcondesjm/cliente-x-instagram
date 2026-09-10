import assert from 'node:assert/strict';
import { assertVisualAgentPlan, buildVisualAgentPlan } from '../lib/visual-agent.js';
const pack = { research: { sourceUrl: 'https://example.com/article' }, slides: [{}, {}, {}] };
const sources = Array.from({length:3},(_,i)=>({sourceUrl:pack.research.sourceUrl,path:`/photo-${i}.jpg`,imageHash:`hash-${i}`,imageUrl:`https://example.com/${i}.jpg`}));
assert.equal(assertVisualAgentPlan(pack,buildVisualAgentPlan(pack,sources)).approvedVisuals,3);
const partial = assertVisualAgentPlan(pack,buildVisualAgentPlan(pack,sources.slice(0,1)));
assert.equal(partial.approvedVisuals,1);
assert.deepEqual(partial.decisions.map(decision=>decision.mode),['distinct-editorial-photo','typographic-card','typographic-card']);
assert.deepEqual(partial.slideImagePaths,['/photo-0.jpg',null,null]);
const repeated = assertVisualAgentPlan(pack,buildVisualAgentPlan(pack,[sources[0],sources[0],sources[2]]));
assert.equal(repeated.approvedVisuals,2);
assert.equal(new Set(repeated.slideImagePaths.filter(Boolean)).size,2);
for (const photos of [[],sources.map(s=>({...s,reusedRelevantImage:true})),sources.map(s=>({...s,sourceUrl:'https://example.com/unrelated'}))]) {
  assert.throws(()=>assertVisualAgentPlan(pack,buildVisualAgentPlan(pack,photos)),/foto real da matéria/);
}
assert.doesNotThrow(()=>assertVisualAgentPlan({slides:[{}]},buildVisualAgentPlan({slides:[{}]})));
console.log('Visual plan: relevant cover required; extra distinct photos accepted; typographic fallback used without repetition.');
