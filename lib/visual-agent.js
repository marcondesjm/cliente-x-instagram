export const CLOUD_VISUAL_AGENT_VERSION = 'nerion-visual-agent-v1.0.0';

function normalizeUrl(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

export function buildVisualAgentPlan(pack = {}, visualSources = []) {
  const sourceUrl = normalizeUrl(pack?.research?.sourceUrl);
  const slideCount = Array.isArray(pack?.slides) ? pack.slides.length : 0;
  const approved = visualSources.filter((visual) => (
    sourceUrl && normalizeUrl(visual?.sourceUrl) === sourceUrl && visual?.path && visual?.imageHash
  ));
  const rejected = visualSources.filter((visual) => !approved.includes(visual));
  const cover = approved[0] || null;
  return {
    agent: 'Nerion Visual Cloud',
    version: CLOUD_VISUAL_AGENT_VERSION,
    status: 'approved',
    policy: 'article-image-on-cover-typographic-supporting-slides',
    sourceUrl: sourceUrl || null,
    slideCount,
    approvedVisuals: cover ? 1 : 0,
    rejectedVisuals: rejected.length,
    slideImagePaths: Array.from({ length: slideCount }, (_, index) => index === 0 ? cover?.path || null : null),
    decisions: Array.from({ length: slideCount }, (_, index) => ({
      slide: index + 1,
      mode: index === 0 && cover ? 'verified-article-image' : 'typographic',
      reason: index === 0 && cover
        ? 'image source URL matches the selected article'
        : 'no unrelated or unverifiable image is allowed'
    }))
  };
}

export function assertVisualAgentPlan(pack = {}, plan = {}) {
  if ((plan.slideImagePaths || []).slice(1).some(Boolean)) {
    throw new Error('Agente Visual bloqueou imagens de outras matérias nos slides internos.');
  }
  return plan;
}
