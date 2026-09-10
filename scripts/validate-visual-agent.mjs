import assert from 'node:assert/strict';
import { assertVisualAgentPlan, buildVisualAgentPlan, CLOUD_VISUAL_AGENT_VERSION } from '../lib/visual-agent.js';

const pack = {
  research: { sourceUrl: 'https://example.com/pauta-principal' },
  slides: Array.from({ length: 5 }, () => ({}))
};
const plan = assertVisualAgentPlan(pack, buildVisualAgentPlan(pack, [{
  sourceUrl: 'https://example.com/pauta-principal',
  path: '/tmp/source.jpg',
  imageHash: 'verified'
}, {
  sourceUrl: 'https://example.com/outra-materia',
  path: '/tmp/unrelated.jpg',
  imageHash: 'unrelated'
}]));

if (plan.approvedVisuals !== 1 || plan.rejectedVisuals !== 1) {
  throw new Error('Agente Visual não separou a imagem pertinente da imagem de outra matéria.');
}
if (plan.slideImagePaths[0] !== '/tmp/source.jpg' || plan.slideImagePaths.slice(1).some(Boolean)) {
  throw new Error('Agente Visual tentou preencher slides internos com imagens sem vínculo comprovado.');
}

for (const sources of [[], [{ sourceUrl: pack.research.sourceUrl, path: '/tmp/repeated.jpg', imageHash: 'old', reusedRelevantImage: true }], [{ sourceUrl: 'https://example.com/unrelated', path: '/tmp/other.jpg', imageHash: 'other' }]]) {
  const blocked = buildVisualAgentPlan(pack, sources);
  assert.equal(blocked.status, 'blocked');
  assert.throws(() => assertVisualAgentPlan(pack, blocked), /foto da matéria/);
}
assert.doesNotThrow(() => assertVisualAgentPlan({ slides: [{}] }, buildVisualAgentPlan({ slides: [{}] })));
console.log(JSON.stringify({ ok: true, agent: plan.agent, version: CLOUD_VISUAL_AGENT_VERSION, policy: plan.policy }, null, 2));
