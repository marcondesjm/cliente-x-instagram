#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PERFORMANCE_LEARNING_MODEL_VERSION, summarizePerformanceLearning } from '../lib/performance-learning.js';

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

function performanceScore(metrics = {}) {
  const reach = Number(metrics.reach) || 0;
  if (!reach) return null;
  const shareRate = rate(metrics.shares, reach);
  const saveRate = rate(metrics.saved, reach);
  const commentRate = rate(metrics.comments, reach);
  const likeRate = rate(metrics.likes, reach);
  const interactionRate = rate(metrics.totalInteractions, reach);
  const followRate = rate(metrics.follows, reach);
  const repostRate = rate(metrics.reposts, reach);
  const profileVisitRate = rate(metrics.profileVisits, reach);
  const rawSkipRate = Number(metrics.skipRate);
  const skipRate = Number.isFinite(rawSkipRate) ? clamp(rawSkipRate > 1 ? rawSkipRate / 100 : rawSkipRate, 0, 1) : null;
  const rawAverageWatchTime = Number(metrics.averageWatchTime) || 0;
  const averageWatchSeconds = rawAverageWatchTime > 1000 ? rawAverageWatchTime / 1000 : rawAverageWatchTime;
  const retention = averageWatchSeconds > 0
    ? clamp(averageWatchSeconds / 15, 0, 1)
    : null;
  const viewsPerReach = reach > 0 && Number(metrics.views) > 0
    ? clamp(Number(metrics.views) / reach, 0, 3)
    : null;
  const score = clamp(
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
  return {
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
    }
  };
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
      follows: summary.follows + (Number(metrics.follows) || 0)
    }), { posts: 0, reach: 0, interactions: 0, shares: 0, saved: 0, follows: 0 });
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
      follows: change(current.follows, previous.follows)
    }
  };
}

function buildModels(samples = []) {
  const observations = samples.map((sample) => {
    const latest = [...(sample.observations || [])].sort((a, b) => b.windowHours - a.windowHours)[0];
    return latest?.performance?.score == null ? null : { sample, score: latest.performance.score, reach: Number(latest.metrics?.reach) || 0 };
  }).filter(Boolean);
  const aggregate = (pairs) => {
    const buckets = new Map();
    for (const { key, score, reach } of pairs) {
      if (!key) continue;
      const bucket = buckets.get(key) || [];
      bucket.push({ score, reach });
      buckets.set(key, bucket);
    }
    return Object.fromEntries([...buckets.entries()].map(([key, values]) => {
      const totalReach = values.reduce((sum, value) => sum + value.reach, 0);
      const average = values.reduce((sum, value) => sum + value.score, 0) / values.length;
      const confidence = Math.min(1, values.length / 5) * Math.min(1, totalReach / 200);
      const learned = 50 + ((average - 50) * confidence);
      return [key, {
        samples: values.length,
        totalReach,
        confidence: Number(confidence.toFixed(4)),
        averageScore: Number(average.toFixed(2)),
        learnedScore: Number(learned.toFixed(2))
      }];
    }));
  };
  return {
    sources: aggregate(observations.map(({ sample, score, reach }) => ({ key: String(sample.source || '').toLocaleLowerCase('pt-BR'), score, reach }))),
    topics: aggregate(observations.flatMap(({ sample, score, reach }) => (sample.topics || []).map((key) => ({ key, score, reach })))),
    formats: aggregate(observations.map(({ sample, score, reach }) => ({ key: sample.mediaProductType || sample.mediaType || 'unknown', score, reach }))),
    audiences: aggregate(observations.map(({ sample, score, reach }) => ({ key: sample.audience || 'empresários', score, reach }))),
    hooks: aggregate(observations.map(({ sample, score, reach }) => ({ key: sample.hook || 'afirmação', score, reach })))
  };
}

function validatePureLogic() {
  const strong = performanceScore({ reach: 1000, shares: 30, saved: 25, comments: 12, likes: 80, totalInteractions: 147 });
  const weak = performanceScore({ reach: 1000, shares: 1, saved: 1, comments: 0, likes: 5, totalInteractions: 7 });
  if (!strong || !weak || strong.score <= weak.score || strong.rates.share !== 0.03) throw new Error('Performance score validation failed.');
  const models = buildModels([
    { source: 'Fonte A', topics: ['dados'], audience: 'gestão', hook: 'dado', mediaProductType: 'REELS', observations: [{ windowHours: 24, metrics: { reach: 1000 }, performance: strong }] },
    { source: 'Fonte A', topics: ['dados'], audience: 'gestão', hook: 'dado', mediaProductType: 'REELS', observations: [{ windowHours: 24, metrics: { reach: 1000 }, performance: weak }] }
  ]);
  if (models.sources['fonte a']?.samples !== 2 || models.sources['fonte a']?.confidence !== 0.4 || models.topics.dados?.samples !== 2 || models.audiences.gestão?.samples !== 2 || models.hooks.dado?.samples !== 2) throw new Error('Learning model validation failed.');
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
  console.log(JSON.stringify({ ok: true, performanceScore: 'normalized-by-reach', windows: WINDOWS, modelShrinkage: 'enabled', modelVersion: PERFORMANCE_LEARNING_MODEL_VERSION, staleFallback: 'editorial' }, null, 2));
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
      observations: []
    };
    const dueWindow = WINDOWS.filter((windowHours) => ageHours >= windowHours && !sample.observations.some((item) => item.windowHours === windowHours)).at(-1);
    if (!dueWindow) {
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
    sample.observations.push({
      windowHours: dueWindow,
      collectedAt: new Date().toISOString(),
      ageHours: Number(ageHours.toFixed(2)),
      metrics,
      performance: performanceScore(metrics),
      unavailableMetrics: Object.fromEntries(Object.entries(results).filter(([, result]) => result.error).map(([metric, result]) => [metric, result.error]))
    });
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
  }
  accountState.models = buildModels(accountState.samples);
  accountState.weeklyGrowth = weeklyGrowth(accountState.samples, now);
  accountState.updatedAt = new Date().toISOString();
  accountState.readiness = summarizePerformanceLearning(accountState, accountState.updatedAt, now);
  state.version = 2;
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
