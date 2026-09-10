import { similarPhoto } from './photo-uniqueness.js';
export const CLOUD_VISUAL_AGENT_VERSION = 'nerion-visual-agent-v1.1.0';

export function buildVisualAgentPlan(pack = {}, visualSources = []) {
  const sourceUrl = pack.research?.sourceUrl || null;
  const slideCount = pack.slides?.length || 0;
  const approved = [];
  for (const visual of visualSources) {
    if (!sourceUrl || visual.sourceUrl !== sourceUrl || !visual.path || !visual.imageHash || visual.reusedRelevantImage) continue;
    if (approved.some(prior => prior.path === visual.path || prior.imageHash === visual.imageHash || (prior.imageUrl && prior.imageUrl === visual.imageUrl) || similarPhoto(prior.perceptualHash, visual.perceptualHash))) continue;
    approved.push(visual);
  }
  return {
    agent: 'Nerion Visual Cloud', version: CLOUD_VISUAL_AGENT_VERSION,
    status: sourceUrl && approved.length < slideCount ? 'blocked' : 'approved',
    policy: 'distinct-relevant-photo-per-slide', sourceUrl, slideCount,
    approvedVisuals: approved.length, rejectedVisuals: visualSources.length - approved.length,
    slideImagePaths: Array.from({ length: slideCount }, (_, index) => approved[index]?.path || null),
    decisions: Array.from({ length: slideCount }, (_, index) => ({
      slide: index + 1, mode: approved[index] ? 'distinct-editorial-photo' : 'missing-photo',
      reason: approved[index]?.imageEvidence || 'No distinct relevant photograph available'
    }))
  };
}

export function assertVisualAgentPlan(pack = {}, plan = {}) {
  if (pack.research?.sourceUrl && (plan.status !== 'approved' || plan.approvedVisuals < pack.slides.length || plan.slideImagePaths?.length !== pack.slides.length || plan.slideImagePaths.some(path => !path) || new Set(plan.slideImagePaths).size !== pack.slides.length)) {
    throw new Error('Agente Visual bloqueou a publicação: cada cartão/cena precisa de uma foto da matéria distinta, disponível e não repetida.');
  }
  return plan;
}
