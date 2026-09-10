import { similarPhoto } from './photo-uniqueness.js';
export const CLOUD_VISUAL_AGENT_VERSION = 'nerion-visual-agent-v1.1.1';

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
    status: sourceUrl && approved.length < 1 ? 'blocked' : 'approved',
    policy: 'relevant-cover-distinct-photos-typographic-fallback', sourceUrl, slideCount,
    approvedVisuals: approved.length, rejectedVisuals: visualSources.length - approved.length,
    slideImagePaths: Array.from({ length: slideCount }, (_, index) => approved[index]?.path || null),
    decisions: Array.from({ length: slideCount }, (_, index) => ({
      slide: index + 1, mode: approved[index] ? 'distinct-editorial-photo' : 'typographic-card',
      reason: approved[index]?.imageEvidence || 'No additional distinct relevant photograph available; use the approved typographic layout'
    }))
  };
}

export function assertVisualAgentPlan(pack = {}, plan = {}) {
  const paths = Array.isArray(plan.slideImagePaths) ? plan.slideImagePaths : [];
  const photos = paths.filter(Boolean);
  if (pack.research?.sourceUrl && (plan.status !== 'approved' || plan.approvedVisuals < 1 || paths.length !== pack.slides.length || !paths[0] || new Set(photos).size !== photos.length)) {
    throw new Error('Agente Visual bloqueou a publicação: a capa e o Story precisam de uma foto real da matéria, disponível e não repetida.');
  }
  return plan;
}
