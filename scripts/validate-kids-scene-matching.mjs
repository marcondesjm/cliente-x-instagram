import assert from 'node:assert/strict';
import {matchSceneOptions,matchingSchema,matchingPrompt} from '../lib/kids-scene-matching.js';
const option=scene=>({scene,verse:'19:6',reason:'A cena representa a acolhida descrita no cartão.'});
const matrix=lists=>({cards:lists.map((list,i)=>({card:i+1,options:list.map(option),reason:'Opções avaliadas contra o texto e a passagem.'}))});
// Greedy [1,2] would fail: card 2 has only scene 1. Assignment must backtrack.
const result=matchSceneOptions(matrix([[1,2],[1],[2,3]]),3,3,['19:6']);
assert.deepEqual(result.feed,[2,1]);assert.equal(result.story,3);
assert.equal(matchSceneOptions(matrix([[],[1],[2,3]]),3,3,['19:6']).decision,'reject','No valid cover must block the complete pack');
assert.equal(matchSceneOptions(matrix([[1],[1],[2,3]]),3,3,['19:6']).decision,'reject','Individually valid options need not form a distinct set');
assert.throws(()=>matchSceneOptions(matrix([[1,1],[2],[3]]),3,3,['19:6']),/repetida/);
assert.throws(()=>matchSceneOptions(matrix([[1],[2],[4]]),3,3,['19:6']),/inválida/);
assert.throws(()=>matchSceneOptions(matrix([[1],[2],[3]]),3,3,['19:5']),/passagem/);
const reordered=matrix([[1],[2],[3]]);reordered.cards.reverse();assert.throws(()=>matchSceneOptions(reordered,3,3,['19:6']),/Posição/);
assert.equal(matchingSchema(8,6).properties.cards.items.properties.options.minItems,undefined,'Abstention must remain valid');
assert.match(matchingPrompt('{}',[]),/não uma etapa anterior/);
console.log('PASS: complete distinct assignment, unavailable cover, Hall conflict, invalid/duplicate options, verse bounds and explicit abstention. No API calls.');
