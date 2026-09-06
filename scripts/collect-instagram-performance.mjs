#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PERFORMANCE_LEARNING_MODEL_VERSION, relativeViewEvidence, summarizePerformanceLearning } from '../lib/performance-learning.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_DIR = join(ROOT, 'automation', 'instagram-template', 'config');
const ACCOUNTS_PATH = join(CONFIG_DIR, 'accounts.json');
const HISTORY_PATH = join(CONFIG_DIR, 'publication-history.json');
const PERFORMANCE_PATH = join(CONFIG_DIR, 'performance-insights.json');
const EXCLUSIONS_PATH = join(CONFIG_DIR, 'performance-learning-exclusions.json');
const IG_BASE = 'https://graph.facebook.com/v21.0';
const WINDOWS = [2, 24, 72];
const INSIGHT_METRICS = [
  'reach',
  'saved',
  'shares',
  'total_interactions',
  'views',
  'ig_reels_video_view_total_time',
  'ig_reels_avg_watch_time',
  'reels_skip_rate',
  'reposts',
  'follows',
  'profile_visits'
];

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function clamp(value, minimum = 0, maximum = 100) {
  return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}

function rate(value, reach) {
  return reach > 0 ? Number(value || 0) / reach : 0;
}

const DISTRIBUTION_THRESHOLDS = {
  lowViews: 20,
  healthyViews: 40,
  healthyReach: 25
};

function distributionEvidence(metrics = {}) {
  const views = Math.max(0, Number(metrics.views) || 0);
  const reach = Math.max(0, Number(metrics.reach) || 0);
  const confidence = clamp(Math.max(
    views / DISTRIBUTION_THRESHOLDS.healthyViews,
    reach / DISTRIBUTION_THRESHOLDS.healthyReach
  ), 0, 1);
  return {
    views,
    reach,
    confidence: Number(confidence.toFixed(5)),
    low: views > 0 && views < DISTRIBUTION_THRESHOLDS.lowViews,
    band: views <= 0 ? 'unknown' : views < DISTRIBUTION_THRESHOLDS.lowViews ? 'critical' : views < DISTRIBUTION_THRESHOLDS.healthyViews ? 'limited' : 'healthy'
  };
}

function performanceScore(metrics = {}) {
  const reach = Number(metrics.reach) || 0;
  const distribution = distributionEvidence(metrics);
  // Em alguns carrosséis a Meta entrega `views`, curtidas e comentários, mas
  // mantém `reach` em zero. Descartar toda a observação fazia um marco real de
  // distribuição desaparecer do aprendizado. Sem alcance não calculamos
  // taxas: usamos somente sinais absolutos, com teto e peso conservadores.
  if (!reach) {
    if (!distribution.views) return null;
    const likes = Math.max(0, Number(metrics.likes) || 0);
    const comments = Math.max(0, Number(metrics.comments) || 0);
    const shares = Math.max(0, Number(metrics.shares) || 0);
    const saved = Math.max(0, Number(metrics.saved) || 0);
    const interactionBonus = Math.min(20, (likes * 1.5) + (comments * 3) + (shares * 4) + (saved * 4));
    // Continua distinguindo crescimento acima de 40 views, sem tratar views
    // como pessoas únicas nem deixar uma publicação dominar o aprendizado.
    const growthBonus = Math.min(10, Math.max(0, Math.log2(distribution.views / 40) * 5));
    const score = clamp(15 + (distribution.confidence * 45) + interactionBonus + growthBonus);
    const discovery = clamp(20 + (distribution.confidence * 55) + Math.min(15, likes * 1.5) + growthBonus);
    return {
      modelVersion: PERFORMANCE_LEARNING_MODEL_VERSION,
      evidenceMode: 'views-only-with-absolute-interactions',
      score: Number(score.toFixed(2)),
      rates: {
        share: null, save: null, comment: null, like: null, interaction: null,
        follow: null, repost: null, profileVisit: null, skip: null,
        retention: null, viewsPerReach: null
      },
      objectiveScores: {
        discovery: Number(discovery.toFixed(2)),
        utility: Number(Math.min(40, (saved * 8) + (shares * 5)).toFixed(2)),
        conversation: Number(Math.min(40, (comments * 8) + (shares * 4)).toFixed(2)),
        conversion: 0,
        retention: 0
      },
      distribution
    };
  }
  const shareRate = rate(metrics.shares, reach);
  const saveRate = rate(metrics.saved, reach);
  const commentRate = rate(metrics.comments, reach);
  const likeRate = rate(metrics.likes, reach);
  const interactionRate = rate(metrics.totalInteractions, reach);
  const followRate = rate(metrics.follows, reach);
  const repostRate = rate(metrics.reposts, reach);
  const profileVisitRate = rate(metrics.profileVisits, reach);
  const rawSkipRate = metrics.skipRate == null ? NaN : Number(metrics.skipRate);
  const skipRate = Number.isFinite(rawSkipRate) ? clamp(rawSkipRate > 1 ? rawSkipRate / 100 : rawSkipRate, 0, 1) : null;
  const rawAverageWatchTime = Number(metrics.averageWatchTime) || 0;
  const averageWatchSeconds = rawAverageWatchTime > 1000 ? rawAverageWatchTime / 1000 : rawAverageWatchTime;
  const retention = averageWatchSeconds > 0
    ? clamp(averageWatchSeconds / 15, 0, 1)
    : null;
  const viewsPerReach = reach > 0 && Number(metrics.views) > 0
    ? clamp(Number(metrics.views) / reach, 0, 3)
    : null;
  const evidenceMultiplier = 0.25 + (distribution.confidence * 0.75);
  const objectiveScores = {
    discovery: clamp((((viewsPerReach === null ? 0 : viewsPerReach * 24) + (profileVisitRate * 2200) + (followRate * 4000)) * evidenceMultiplier) + (distribution.confidence * 20)),
    utility: clamp(((saveRate * 2600) + (shareRate * 1800) + (repostRate * 1200)) * evidenceMultiplier),
    conversation: clamp(((commentRate * 3000) + (shareRate * 900)) * evidenceMultiplier),
    conversion: clamp(((followRate * 5000) + (profileVisitRate * 3000) + (commentRate * 1200)) * evidenceMultiplier),
    retention: clamp((retention === null ? 0 : retention * 75) + (skipRate === null ? 10 : (1 - skipRate) * 25))
  };
  const engagementScore = clamp(
    Math.min(35, shareRate * 1750)
    + Math.min(20, saveRate * 1000)
    + Math.min(10, commentRate * 1000)
    + Math.min(12, likeRate * 240)
    + Math.min(6, interactionRate * 75)
    + Math.min(5, followRate * 1000)
    + Math.min(3, repostRate * 750)
    + Math.min(3, profileVisitRate * 300)
    + (retention === null ? 5 : retention * 10)
    - (skipRate === null ? 0 : skipRate * 10)
  );
  const score = clamp(
    (engagementScore * (0.35 + (distribution.confidence * 0.65)))
    + (distribution.confidence * 15)
  );
  return {
    modelVersion: PERFORMANCE_LEARNING_MODEL_VERSION,
    score: Number(score.toFixed(2)),
    rates: {
      share: Number(shareRate.toFixed(5)),
      save: Number(saveRate.toFixed(5)),
      comment: Number(commentRate.toFixed(5)),
      like: Number(likeRate.toFixed(5)),
      interaction: Number(interactionRate.toFixed(5)),
      follow: Number(followRate.toFixed(5)),
      repost: Number(repostRate.toFixed(5)),
      profileVisit: Number(profileVisitRate.toFixed(5)),
      skip: skipRate === null ? null : Number(skipRate.toFixed(5)),
      retention: retention === null ? null : Number(retention.toFixed(5)),
      viewsPerReach: viewsPerReach === null ? null : Number(viewsPerReach.toFixed(5))
    },
    objectiveScores: Object.fromEntries(Object.entries(objectiveScores).map(([key, value]) => [key, Number(value.toFixed(2))])),
    distribution
  };
}

function saoPauloHour(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hourCycle: 'h23' }).format(date));
}

function daypartFor(value) {
  const hour = saoPauloHour(value);
  if (hour === null) return 'unknown';
  if (hour < 10) return 'morning';
  if (hour < 14) return 'midday';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function objectiveFor(entry = {}) {
  const configured = String(entry.learningContext?.objective || '').trim();
  if (configured) return configured;
  const text = `${entry.coverTitle || ''} ${entry.caption || ''}`.toLocaleLowerCase('pt-BR');
  if (/salve|checklist|passo a passo|guia/iu.test(text)) return 'utility';
  if (/comente|qual |\?/iu.test(text)) return 'conversation';
  if (/direct|perfil|consultoria|treinamento|me chame/iu.test(text)) return 'conversion';
  return 'discovery';
}

async function graphGet(path, params, token) {
  const url = new URL(`${IG_BASE}${path}`);
  for (const [key, value] of Object.entries({ ...params, access_token: token })) url.searchParams.set(key, value);
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(payload?.error?.message || `Graph API ${response.status}`);
  return payload;
}

function insightValue(payload, name) {
  const item = payload?.data?.find((entry) => entry.name === name);
  const value = item?.values?.[0]?.value ?? item?.total_value?.value;
  return typeof value === 'number' ? value : null;
}

async function collectMetric(mediaId, metric, token) {
  try {
    const payload = await graphGet(`/${mediaId}/insights`, { metric }, token);
    return { value: insightValue(payload, metric), error: null };
  } catch (error) {
    return { value: null, error: String(error.message || error) };
  }
}

function topicTokens(entry = {}) {
  const text = `${entry.coverTitle || ''} ${entry.research?.theme || ''}`.toLocaleLowerCase('pt-BR');
  return ['automação', 'agente', 'dados', 'gestão', 'produtividade', 'vendas', 'cliente', 'custo', 'token', 'modelo', 'empresa', 'mercado', 'segurança']
    .filter((token) => text.includes(token));
}

function audienceSegment(entry = {}) {
  const text = `${entry.coverTitle || ''} ${entry.caption || ''} ${entry.research?.theme || ''}`.toLocaleLowerCase('pt-BR');
  const segments = [
    ['vendas', /venda|comercial|lead|cliente|crm/iu],
    ['rh', /rh|recrut|talento|colaborador|equipe|pessoas/iu],
    ['operações', /opera(?:ç|c)ão|processo|rotina|produtividade|automação/iu],
    ['tecnologia', /código|software|api|modelo|token|dados|agente/iu],
    ['gestão', /gestão|gestor|liderança|decisão|estratégia|negócio|empresa/iu]
  ];
  return segments.find(([, pattern]) => pattern.test(text))?.[0] || 'empresários';
}

function hookArchetype(entry = {}) {
  const title = String(entry.coverTitle || '').trim();
  if (/\?|como|por que/iu.test(title)) return 'pergunta';
  if (/\d|%|r\$|milh(?:ão|ões)|bilh(?:ão|ões)/iu.test(title)) return 'dado';
  if (/erro|risco|cuidado|antes|não faça|nao faca/iu.test(title)) return 'alerta';
  if (/novo|mudou|lançou|chegou|agora/iu.test(title)) return 'novidade';
  return 'afirmação';
}

function weeklyGrowth(samples = [], now = Date.now()) {
  const summarize = (minimumAgeDays, maximumAgeDays) => {
    const selected = samples.map((sample) => {
      const ageDays = (now - Date.parse(sample.publishedAt)) / 86400000;
      const latest = [...(sample.observations || [])].sort((a, b) => b.windowHours - a.windowHours)[0];
      return ageDays >= minimumAgeDays && ageDays < maximumAgeDays && latest?.metrics ? latest.metrics : null;
    }).filter(Boolean);
    return selected.reduce((summary, metrics) => ({
      posts: summary.posts + 1,
      reach: summary.reach + (Number(metrics.reach) || 0),
      interactions: summary.interactions + (Number(metrics.totalInteractions) || 0),
      shares: summary.shares + (Number(metrics.shares) || 0),
      saved: summary.saved + (Number(metrics.saved) || 0),
      follows: summary.follows + (Number(metrics.follows) || 0),
      profileVisits: summary.profileVisits + (Number(metrics.profileVisits) || 0)
    }), { posts: 0, reach: 0, interactions: 0, shares: 0, saved: 0, follows: 0, profileVisits: 0 });
  };
  const current = summarize(0, 7);
  const previous = summarize(7, 14);
  const change = (value, baseline) => baseline > 0 ? Number((((value - baseline) / baseline) * 100).toFixed(1)) : null;
  return {
    current,
    previous,
    change: {
      reach: change(current.reach, previous.reach),
      interactions: change(current.interactions, previous.interactions),
      follows: change(current.follows, previous.follows),
      profileVisits: change(current.profileVisits, previous.profileVisits)
    }
  };
}

function buildModels(samples = []) {
  const relativeViews = relativeViewEvidence(samples);
  const observations = samples.map((sample) => {
    const latest = [...(sample.observations || [])].sort((a, b) => b.windowHours - a.windowHours)[0];
    if (latest?.performance?.score == null) return null;
    const ageDays = Math.max(0, (Date.now() - Date.parse(sample.publishedAt || latest.collectedAt || '')) / 86400000);
    const recencyWeight = Number.isFinite(ageDays) ? Math.pow(0.5, ageDays / 21) : 0.5;
    return {
      sample,
      score: latest.performance.score,
      reach: Number(latest.metrics?.reach) || 0,
      views: Number(latest.metrics?.views) || 0,
      windowHours: Number(latest.windowHours) || 0,
      lowDistribution: Boolean(latest.performance?.distribution?.low),
      recencyWeight,
      performance: latest.performance
    };
  }).filter(Boolean);
  const aggregate = (pairs) => {
    const buckets = new Map();
    for (const { key, score, reach, views = 0, windowHours = 0, lowDistribution = false, recencyWeight = 1 } of pairs) {
      if (!key) continue;
      const bucket = buckets.get(key) || [];
      bucket.push({ score, reach, views, windowHours, lowDistribution, recencyWeight });
      buckets.set(key, bucket);
    }
    return Object.fromEntries([...buckets.entries()].map(([key, values]) => {
      const totalReach = values.reduce((sum, value) => sum + value.reach, 0);
      const totalWeight = values.reduce((sum, value) => sum + value.recencyWeight, 0) || 1;
      const average = values.reduce((sum, value) => sum + (value.score * value.recencyWeight), 0) / totalWeight;
      const matureSamples = values.filter((value) => value.windowHours >= 24).length;
      const lowDistributionSamples = values.filter((value) => value.windowHours >= 24 && value.lowDistribution).length;
      const reachConfidence = Math.min(1, values.length / 5) * Math.min(1, totalReach / 200);
      const viewsOnly = values.filter((value) => !value.reach && value.views > 0 && value.windowHours >= 24);
      const totalViewsOnly = viewsOnly.reduce((sum, value) => sum + value.views, 0);
      const viewsConfidence = viewsOnly.length >= 3
        ? Math.min(0.3, (viewsOnly.length / 10) * Math.min(1, totalViewsOnly / 400))
        : 0;
      // Repetidos testes maduros com distribuição crítica são evidência real,
      // mesmo quando o alcance acumulado ainda é pequeno. Uma única amostra
      // continua insuficiente para empurrar o modelo longe do neutro.
      const failureConfidence = matureSamples >= 2 ? Math.min(0.6, lowDistributionSamples / 5) : 0;
      const confidence = Math.max(reachConfidence, failureConfidence, viewsConfidence);
      const learned = 50 + ((average - 50) * confidence);
      return [key, {
        samples: values.length,
        totalReach,
        viewsOnlySamples: viewsOnly.length,
        viewsConfidence: Number(viewsConfidence.toFixed(4)),
        matureSamples,
        lowDistributionSamples,
        recencyWeight: Number(totalWeight.toFixed(3)),
        confidence: Number(confidence.toFixed(4)),
        averageScore: Number(average.toFixed(2)),
        learnedScore: Number(learned.toFixed(2))
      }];
    }));
  };
  const discoveryObservations = observations.flatMap(({ sample, ...evidence }) => {
    const relative = relativeViews[String(sample.mediaId)];
    const metrics = sample.observations.find(o => o.windowHours === relative?.windowHours)?.metrics;
    return relative ? [{ sample, ...evidence, score: relative.score, reach: Number(metrics?.reach) || 0, views: Number(metrics?.views) || 0, windowHours: relative.windowHours, lowDistribution: false }] : [];
  });
  return {
    discovery: {
      method: 'same-format-window-median-v1',
      evidence: relativeViews,
      sources: aggregate(discoveryObservations.map(({ sample, ...evidence }) => ({ key: String(sample.source || '').trim().toLocaleLowerCase('pt-BR'), ...evidence }))),
      topics: aggregate(discoveryObservations.flatMap(({ sample, ...evidence }) => (sample.topics || []).map(key => ({ key, ...evidence })))),
      hooks: aggregate(discoveryObservations.map(({ sample, ...evidence }) => ({ key: sample.hook, ...evidence })))
    },
    sources: aggregate(observations.map(({ sample, ...evidence }) => ({ key: String(sample.source || '').toLocaleLowerCase('pt-BR'), ...evidence }))),
    topics: aggregate(observations.flatMap(({ sample, ...evidence }) => (sample.topics || []).map((key) => ({ key, ...evidence })))),
    formats: aggregate(observations.map(({ sample, ...evidence }) => ({ key: sample.mediaProductType || sample.mediaType || 'unknown', ...evidence }))),
    audiences: aggregate(observations.map(({ sample, ...evidence }) => ({ key: sample.audience || 'empresários', ...evidence }))),
    hooks: aggregate(observations.map(({ sample, ...evidence }) => ({ key: sample.hook || 'afirmação', ...evidence }))),
    contexts: aggregate(observations.map(({ sample, performance, ...evidence }) => {
      const format = sample.mediaProductType || sample.mediaType || 'unknown';
      const objective = sample.learningContext?.objective || sample.objective || 'discovery';
      const contextualScore = Number(performance?.objectiveScores?.[objective]);
      return { key: `${format}|${sample.daypart || daypartFor(sample.publishedAt)}|${objective}`, ...evidence, score: Number.isFinite(contextualScore) ? contextualScore : evidence.score };
    }))
  };
}

function validatePureLogic() {
  const now = Date.now();
  const peers = Array.from({ length: 8 }, (_, index) => ({
    mediaId: `peer-${index}`, publishedAt: new Date(now - 4 * 86400000).toISOString(),
    mediaProductType: 'FEED', source: 'Fonte teste', hook: 'dado', topics: ['dados'],
    observations: [{ windowHours: 24, ageHours: 25, metrics: { views: index === 0 ? 80 : 20, reach: 0 } }]
  }));
  const evidence = relativeViewEvidence(peers, now);
  if (evidence['peer-0']?.medianViews !== 20 || evidence['peer-0'].score <= 50 || evidence['peer-0'].peers !== 7) throw new Error('Comparable views baseline failed.');
  const duplicateEvidence = relativeViewEvidence([...peers, peers[0]], now);
  if (duplicateEvidence['peer-0'].peers !== 7) throw new Error('Duplicate publications inflated learning.');
  if (Object.keys(relativeViewEvidence(peers.slice(0, 5), now)).length) throw new Error('Sparse views must remain neutral.');
  const late = peers.map(s => ({ ...s, observations: s.observations.map(o => ({ ...o, ageHours: 60 })) }));
  if (Object.keys(relativeViewEvidence(late, now)).length) throw new Error('Late collection entered an early cohort.');
  const otherFormat = peers.map(s => ({ ...s, mediaId: `reel-${s.mediaId}`, mediaProductType: 'REELS', observations: s.observations.map(o => ({ ...o, metrics: { views: 10000 } })) }));
  if (relativeViewEvidence([...peers, ...otherFormat], now)['peer-0'].medianViews !== 20) throw new Error('Format cohorts were mixed.');
  const early = peers.map(s => ({ ...s, observations: s.observations.map(o => ({ ...o, windowHours: 2, ageHours: 3 })) }));
  if (relativeViewEvidence(early, now)['peer-0'].score >= evidence['peer-0'].score) throw new Error('Early evidence was not discounted.');
  const matureModels = buildModels(peers.map(s => ({ ...s, observations: s.observations.map(o => ({ ...o, performance: performanceScore(o.metrics) })) })));
  if (matureModels.discovery.sources['fonte teste']?.matureSamples !== 8) throw new Error('Discovery model did not reach candidate selection.');
  if (performanceScore({ reach: 100, views: 100, skipRate: null }).rates.skip !== null) throw new Error('Missing skip rate became a measured zero.');
  const strong = performanceScore({ reach: 1000, shares: 30, saved: 25, comments: 12, likes: 80, totalInteractions: 147 });
  const weak = performanceScore({ reach: 1000, shares: 1, saved: 1, comments: 0, likes: 5, totalInteractions: 7 });
  const criticalDistribution = performanceScore({ reach: 2, views: 4, shares: 0, saved: 0, comments: 0, likes: 0, totalInteractions: 0 });
  const limitedDistribution = performanceScore({ reach: 10, views: 20, shares: 0, saved: 0, comments: 0, likes: 0, totalInteractions: 0 });
  const viewsOnlyHealthy = performanceScore({ reach: 0, views: 40, shares: 0, saved: 0, comments: 0, likes: 0, totalInteractions: 0 });
  const viewsOnlyMissing = performanceScore({ reach: 0, views: 0 });
  if (!strong || !weak || strong.score <= weak.score || strong.rates.share !== 0.03) throw new Error('Performance score validation failed.');
  if (!criticalDistribution?.distribution?.low || criticalDistribution.distribution.band !== 'critical' || limitedDistribution.score <= criticalDistribution.score) throw new Error('Absolute distribution validation failed.');
  if (viewsOnlyHealthy?.evidenceMode !== 'views-only-with-absolute-interactions' || viewsOnlyHealthy.score < 60 || viewsOnlyHealthy.distribution.band !== 'healthy' || viewsOnlyMissing !== null) throw new Error('Views-only distribution learning failed.');
  if (performanceScore({ views: 52 }).score <= performanceScore({ views: 43 }).score
    || performanceScore({ views: 1000000 }).score > 70) throw new Error('Views growth must improve the score with a bounded bonus.');
  const viewsSamples = Array.from({ length: 5 }, () => ({
    publishedAt: new Date().toISOString(), source: 'Views sem alcance',
    observations: [{ windowHours: 24, metrics: { reach: 0, views: 52 }, performance: performanceScore({ reach: 0, views: 52 }) }]
  }));
  const viewsModel = buildModels(viewsSamples).sources['views sem alcance'];
  const singleViewsModel = buildModels(viewsSamples.slice(0, 1)).sources['views sem alcance'];
  if (viewsModel.learnedScore <= 50 || viewsModel.confidence > 0.3 || singleViewsModel.confidence !== 0) {
    throw new Error('Mature views-only evidence needs multiple posts and conservative confidence.');
  }
  const models = buildModels([
    { publishedAt: new Date().toISOString(), source: 'Fonte A', topics: ['dados'], audience: 'gestão', hook: 'dado', mediaProductType: 'REELS', daypart: 'afternoon', objective: 'conversion', observations: [{ windowHours: 24, metrics: { reach: 1000 }, performance: strong }] },
    { publishedAt: new Date().toISOString(), source: 'Fonte A', topics: ['dados'], audience: 'gestão', hook: 'dado', mediaProductType: 'REELS', daypart: 'afternoon', objective: 'conversion', observations: [{ windowHours: 24, metrics: { reach: 1000 }, performance: weak }] }
  ]);
  if (models.sources['fonte a']?.samples !== 2 || models.sources['fonte a']?.confidence !== 0.4 || models.topics.dados?.samples !== 2 || models.audiences.gestão?.samples !== 2 || models.hooks.dado?.samples !== 2 || models.contexts['REELS|afternoon|conversion']?.samples !== 2) throw new Error('Learning model validation failed.');
  if (strong.objectiveScores.conversion <= weak.objectiveScores.conversion || strong.objectiveScores.utility <= weak.objectiveScores.utility) throw new Error('Objective-specific scoring validation failed.');
  const readiness = summarizePerformanceLearning({
    updatedAt: new Date().toISOString(),
    samples: Array.from({ length: 30 }, (_, index) => ({
      selectionMode: index < 7 ? (index < 4 ? 'exploit' : index < 6 ? 'explore' : 'experiment') : null,
      observations: [{ windowHours: 24, metrics: { reach: 10 }, performance: strong }]
    }))
  });
  if (readiness.confidenceLevel !== 'initial' || readiness.operatingMode !== 'assisted-learning' || readiness.modelVersion !== PERFORMANCE_LEARNING_MODEL_VERSION) {
    throw new Error('Learning readiness validation failed.');
  }
  const highReadiness = summarizePerformanceLearning({
    updatedAt: new Date().toISOString(),
    samples: Array.from({ length: 50 }, (_, index) => ({
      selectionMode: index < 20 ? 'exploit' : index < 27 ? 'explore' : index < 30 ? 'experiment' : null,
      observations: [{ windowHours: 72, metrics: { reach: 25 }, performance: strong }]
    }))
  });
  if (highReadiness.confidenceLevel !== 'high' || !highReadiness.autonomousReady) throw new Error('High-confidence readiness validation failed.');
  const stale = summarizePerformanceLearning({ updatedAt: '2020-01-01T00:00:00.000Z', samples: [] });
  if (stale.learningEnabled || stale.operatingMode !== 'editorial-fallback') throw new Error('Stale learning fallback validation failed.');
  const repeatedLowDistribution = buildModels(Array.from({ length: 3 }, (_, index) => ({
    publishedAt: new Date().toISOString(),
    source: 'Fonte crítica',
    mediaProductType: 'REELS',
    daypart: 'afternoon',
    objective: 'discovery',
    observations: [{ windowHours: 24, metrics: { reach: 2 + index, views: 4 + index }, performance: performanceScore({ reach: 2 + index, views: 4 + index }) }]
  })));
  const repeatedLowContext = repeatedLowDistribution.contexts['REELS|afternoon|discovery'];
  if (repeatedLowContext?.lowDistributionSamples !== 3 || repeatedLowContext.learnedScore >= 45) throw new Error('Repeated low distribution must reduce the learned context score.');
  console.log(JSON.stringify({ ok: true, performanceScore: 'reach-normalized-or-conservative-views-only', distributionThresholds: DISTRIBUTION_THRESHOLDS, objectiveScores: 'discovery-utility-conversation-conversion-retention', windows: WINDOWS, modelShrinkage: 'enabled-with-21-day-decay-and-repeated-failure-evidence', contextualBaseline: 'format-daypart-objective', modelVersion: PERFORMANCE_LEARNING_MODEL_VERSION, staleFallback: 'editorial' }, null, 2));
}

async function main() {
  if (process.argv.includes('--validate')) return validatePureLogic();
  const accountKey = process.env.ACCOUNT || 'cliente-x';
  const accounts = readJson(ACCOUNTS_PATH, []);
  const account = accounts.find((item) => item.account === accountKey);
  if (!account) throw new Error(`Conta ${accountKey} nao encontrada.`);
  const token = process.env[account.accessTokenEnv];
  if (!token) throw new Error(`${account.accessTokenEnv} ausente.`);
  const history = readJson(HISTORY_PATH, {})[accountKey] || [];
  const state = readJson(PERFORMANCE_PATH, { version: 1, accounts: {} });
  const accountState = state.accounts[accountKey] || { samples: [], models: {} };
  const sampleMap = new Map(accountState.samples.map((sample) => [String(sample.mediaId), sample]));
  const exclusions = new Set((readJson(EXCLUSIONS_PATH, {})[accountKey] || []).map((item) => String(item.mediaId || item)));
  for (const mediaId of exclusions) sampleMap.delete(mediaId);
  const now = Date.now();

  for (const entry of history.filter((item) => item.mediaId && item.publishedAt && !exclusions.has(String(item.mediaId))).slice(-60)) {
    const ageHours = (now - Date.parse(entry.publishedAt)) / 3600000;
    if (ageHours < 1.5 || ageHours > 24 * 10) continue;
    const sample = sampleMap.get(String(entry.mediaId)) || {
      mediaId: String(entry.mediaId),
      permalink: entry.permalink || null,
      publishedAt: entry.publishedAt,
      source: entry.research?.source || null,
      theme: entry.research?.theme || null,
      coverTitle: entry.coverTitle || null,
      topics: topicTokens(entry),
      audience: audienceSegment(entry),
      hook: hookArchetype(entry),
      selectionMode: entry.selectionMode || null,
      learningContext: entry.learningContext || null,
      objective: objectiveFor(entry),
      daypart: daypartFor(entry.publishedAt),
      observations: []
    };
    const dueWindow = WINDOWS.filter((windowHours) => ageHours >= windowHours && !sample.observations.some((item) => item.windowHours === windowHours)).at(-1);
    const lastCollected = Date.parse(sample.latestObservation?.collectedAt || sample.observations.at(-1)?.collectedAt || '');
    const refreshDue = ageHours >= 2 && ageHours <= 72
      && (!Number.isFinite(lastCollected) || now - lastCollected >= 2 * 3600000);
    if (!dueWindow && !refreshDue) {
      sampleMap.set(sample.mediaId, sample);
      continue;
    }
    let media;
    try {
      media = await graphGet(`/${sample.mediaId}`, { fields: 'id,media_type,media_product_type,timestamp,like_count,comments_count,permalink' }, token);
    } catch (error) {
      sample.lastError = String(error.message || error);
      sampleMap.set(sample.mediaId, sample);
      continue;
    }
    const results = Object.fromEntries(await Promise.all(INSIGHT_METRICS.map(async (metric) => [metric, await collectMetric(sample.mediaId, metric, token)])));
    const metrics = {
      reach: results.reach.value,
      saved: results.saved.value,
      shares: results.shares.value,
      totalInteractions: results.total_interactions.value,
      views: results.views.value,
      watchTime: results.ig_reels_video_view_total_time.value,
      averageWatchTime: results.ig_reels_avg_watch_time.value,
      skipRate: results.reels_skip_rate.value,
      reposts: results.reposts.value,
      follows: results.follows.value,
      profileVisits: results.profile_visits.value,
      likes: Number(media.like_count) || 0,
      comments: Number(media.comments_count) || 0
    };
    sample.mediaType = media.media_type || null;
    sample.mediaProductType = media.media_product_type || null;
    sample.permalink = media.permalink || sample.permalink;
    const observation = {
      windowHours: dueWindow || null,
      collectedAt: new Date().toISOString(),
      ageHours: Number(ageHours.toFixed(2)),
      metrics,
      performance: performanceScore(metrics),
      unavailableMetrics: Object.fromEntries(Object.entries(results).filter(([, result]) => result.error).map(([metric, result]) => [metric, result.error]))
    };
    // Acompanhamento entre marcos não substitui as amostras de 2/24/72h.
    // Assim o mesmo post não vira várias evidências independentes no ranking.
    const previous = sample.latestObservation || sample.observations.at(-1);
    const previousViews = previous?.metrics?.views;
    sample.viewGrowth = previousViews != null && metrics.views != null ? {
      from: previous.collectedAt,
      to: observation.collectedAt,
      previousViews,
      currentViews: metrics.views,
      delta: metrics.views - previousViews,
      percent: previousViews > 0 ? Number(((metrics.views - previousViews) / previousViews * 100).toFixed(2)) : null
    } : null;
    sample.latestObservation = observation;
    if (dueWindow) sample.observations.push(observation);
    delete sample.lastError;
    sampleMap.set(sample.mediaId, sample);
  }

  accountState.samples = [...sampleMap.values()]
    .filter((sample) => !exclusions.has(String(sample.mediaId)))
    .sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt))
    .slice(-120);
  for (const sample of accountState.samples) {
    sample.audience ||= audienceSegment(sample);
    sample.hook ||= hookArchetype(sample);
    sample.objective ||= objectiveFor(sample);
    sample.daypart ||= daypartFor(sample.publishedAt);
    // Migra observações persistidas para a fórmula vigente. Sem isso, um
    // contexto ruim continuaria carregando indefinidamente a nota da versão
    // anterior até receber uma nova janela de coleta.
    for (const observation of sample.observations || []) {
      observation.performance = performanceScore(observation.metrics || {});
    }
  }
  accountState.models = buildModels(accountState.samples);
  accountState.weeklyGrowth = weeklyGrowth(accountState.samples, now);
  accountState.updatedAt = new Date().toISOString();
  accountState.readiness = summarizePerformanceLearning(accountState, accountState.updatedAt, now);
  state.version = 3;
  state.modelVersion = PERFORMANCE_LEARNING_MODEL_VERSION;
  state.accounts[accountKey] = accountState;
  state.updatedAt = accountState.updatedAt;
  writeJson(PERFORMANCE_PATH, state);
  console.log(JSON.stringify({ ok: true, account: accountKey, samples: accountState.samples.length, models: Object.fromEntries(Object.entries(accountState.models).map(([key, value]) => [key, Object.keys(value).length])) }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
