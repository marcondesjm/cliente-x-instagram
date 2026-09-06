export const PERFORMANCE_LEARNING_MODEL_VERSION = 'nerion-adaptive-v1.4.0';
export const PERFORMANCE_LEARNING_MAX_AGE_HOURS = 5;

// Compare unique publications at the same format and observation window.
// Late collections must not masquerade as early distribution evidence.
export function relativeViewEvidence(samples = [], now = Date.now()) {
  const unique = [...new Map(samples.filter(s => s.mediaId).map(s => [String(s.mediaId), s])).values()];
  const eligible = unique.filter(s => {
    const age = (now - Date.parse(s.publishedAt)) / 86400000;
    return age >= 0 && age <= 42 && (s.mediaProductType || s.mediaType);
  });
  const observationAt = (sample, window) => (sample.observations || []).find(o => {
    const age = o.ageHours ?? ((Date.parse(o.collectedAt) - Date.parse(sample.publishedAt)) / 3600000);
    return o.windowHours === window && Number.isFinite(age) && age >= window
      && age <= window + ({ 2: 3, 24: 8, 72: 24 }[window])
      && o.metrics?.views != null && Number.isFinite(Number(o.metrics.views)) && Number(o.metrics.views) >= 0;
  });
  return Object.fromEntries(eligible.flatMap(sample => {
    for (const windowHours of [72, 24, 2]) {
      const observation = observationAt(sample, windowHours);
      if (!observation) continue;
      const peers = eligible.filter(peer => String(peer.mediaId) !== String(sample.mediaId)
        && (peer.mediaProductType || peer.mediaType) === (sample.mediaProductType || sample.mediaType))
        .map(peer => observationAt(peer, windowHours)).filter(Boolean)
        .map(o => Number(o.metrics.views)).sort((a, b) => a - b);
      if (peers.length < 5) continue;
      const middle = Math.floor(peers.length / 2);
      const medianViews = peers.length % 2 ? peers[middle] : (peers[middle - 1] + peers[middle]) / 2;
      const ratio = (Number(observation.metrics.views) + 1) / (medianViews + 1);
      const maturityWeight = windowHours >= 24 ? 1 : 0.25;
      const score = 50 + Math.max(-25, Math.min(25, Math.log2(ratio) * 15)) * maturityWeight;
      return [[String(sample.mediaId), { score: Number(score.toFixed(2)), windowHours, medianViews, peers: peers.length, maturityWeight }]];
    }
    return [];
  }));
}

const CONFIDENCE_THRESHOLDS = {
  moderate: { effectiveSamples: 30, effectiveReach: 200, controlledSamples: 10 },
  high: { effectiveSamples: 50, effectiveReach: 1000, controlledSamples: 30 }
};

function mostMatureObservation(sample = {}) {
  return [...(sample.observations || [])]
    .filter((item) => item?.performance?.score != null)
    .sort((left, right) => Number(right.windowHours) - Number(left.windowHours))[0] || null;
}

function modeCounts(samples = []) {
  return samples.reduce((counts, sample) => {
    const mode = String(sample.selectionMode || '').trim();
    if (['exploit', 'explore', 'experiment'].includes(mode)) counts[mode] += 1;
    return counts;
  }, { exploit: 0, explore: 0, experiment: 0 });
}

function meetsThreshold(summary, threshold, requireModeCoverage = false) {
  if (summary.effectiveSamples < threshold.effectiveSamples) return false;
  if (summary.effectiveReach < threshold.effectiveReach) return false;
  if (summary.controlledSamples < threshold.controlledSamples) return false;
  if (!requireModeCoverage) return true;
  return summary.selectionModes.exploit >= 10
    && summary.selectionModes.explore >= 5
    && summary.selectionModes.experiment >= 3;
}

export function summarizePerformanceLearning(accountState = {}, storedUpdatedAt = null, now = Date.now()) {
  const samples = Array.isArray(accountState.samples) ? accountState.samples : [];
  const mature = samples.map((sample) => mostMatureObservation(sample)).filter(Boolean);
  const selectionModes = modeCounts(samples);
  const controlledSamples = Object.values(selectionModes).reduce((total, value) => total + value, 0);
  const effectiveReach = mature.reduce((total, item) => total + (Number(item.metrics?.reach) || 0), 0);
  const updatedAt = accountState.updatedAt || storedUpdatedAt || null;
  const updatedTime = Date.parse(updatedAt || '');
  const ageHours = Number.isFinite(updatedTime) ? Math.max(0, (now - updatedTime) / 3600000) : null;
  const freshness = ageHours === null
    ? 'missing'
    : ageHours > PERFORMANCE_LEARNING_MAX_AGE_HOURS ? 'stale' : 'current';
  const summary = {
    modelVersion: PERFORMANCE_LEARNING_MODEL_VERSION,
    productStage: 'stable',
    updatedAt,
    ageHours: ageHours === null ? null : Number(ageHours.toFixed(2)),
    freshness,
    effectiveSamples: mature.length,
    effectiveReach,
    controlledSamples,
    selectionModes
  };
  const high = meetsThreshold(summary, CONFIDENCE_THRESHOLDS.high, true);
  const moderate = meetsThreshold(summary, CONFIDENCE_THRESHOLDS.moderate);
  const confidenceLevel = high ? 'high' : moderate ? 'moderate' : 'initial';
  const learningEnabled = freshness === 'current';
  return {
    ...summary,
    confidenceLevel,
    autonomousReady: high,
    learningEnabled,
    operatingMode: learningEnabled ? 'assisted-learning' : 'editorial-fallback',
    criteria: {
      moderate: CONFIDENCE_THRESHOLDS.moderate,
      high: {
        ...CONFIDENCE_THRESHOLDS.high,
        selectionModes: { exploit: 10, explore: 5, experiment: 3 }
      }
    }
  };
}

// Raw Instagram insights: average watch time in milliseconds, skip rate in percent.
// Never infer units from magnitude or invent a duration for historical media.
export function reelRetentionMetrics(metrics = {}) {
  const number = value => value == null || value === '' ? null : Number.isFinite(Number(value)) ? Number(value) : null;
  const averageMs = number(metrics.averageWatchTime);
  const duration = number(metrics.durationSeconds);
  const percent = number(metrics.skipRate);
  const skip = percent !== null && percent >= 0 && percent <= 100 ? percent / 100 : null;
  const averageSeconds = averageMs !== null && averageMs >= 0 ? averageMs / 1000 : null;
  const retention = averageSeconds !== null && duration > 0 ? Math.min(1, averageSeconds / duration) : null;
  const components = [retention === null ? null : [retention, 0.75], skip === null ? null : [1 - skip, 0.25]].filter(Boolean);
  const weight = components.reduce((sum, [, w]) => sum + w, 0);
  const score = weight ? 100 * components.reduce((sum, [v, w]) => sum + v * w, 0) / weight : null;
  return { averageSeconds, durationSeconds: duration > 0 ? duration : null, skip, retention, score };
}

export function retentionHookModels(samples = [], now = Date.now()) {
  const buckets = new Map();
  const unique = new Map(samples.filter(s => s.mediaId).map(s => [String(s.mediaId), s]));
  for (const sample of unique.values()) {
    if (sample.mediaProductType !== 'REELS' || !sample.hook) continue;
    const ageDays = (now - Date.parse(sample.publishedAt)) / 86400000;
    if (!(ageDays >= 0 && ageDays <= 42)) continue;
    const observation = [...(sample.observations || [])].filter(o => {
      const age = o.ageHours ?? (Date.parse(o.collectedAt) - Date.parse(sample.publishedAt)) / 3600000;
      return [24, 72].includes(o.windowHours) && age >= o.windowHours
        && age <= o.windowHours + (o.windowHours === 24 ? 8 : 24)
        && Number(o.metrics?.reach) >= 20 && reelRetentionMetrics(o.metrics).score !== null;
    }).sort((a, b) => b.windowHours - a.windowHours)[0];
    if (!observation) continue;
    const bucket = buckets.get(sample.hook) || [];
    bucket.push({ score: reelRetentionMetrics(observation.metrics).score, reach: Number(observation.metrics.reach), weight: Math.pow(0.5, ageDays / 21) });
    buckets.set(sample.hook, bucket);
  }
  return Object.fromEntries([...buckets].map(([hook, values]) => {
    const totalReach = values.reduce((sum, v) => sum + v.reach, 0);
    const weight = values.reduce((sum, v) => sum + v.weight, 0);
    const average = values.reduce((sum, v) => sum + v.score * v.weight, 0) / weight;
    const eligible = values.length >= 3 && totalReach >= 100;
    const confidence = eligible ? Math.min(1, values.length / 8, totalReach / 400) : 0;
    return [hook, { samples: values.length, totalReach, eligible, averageScore: average,
      learnedScore: 50 + (average - 50) * confidence, confidence }];
  }));
}

export function retentionHookAdjustment(model, format) {
  if (format !== 'REELS' || !model?.eligible || model.samples < 3 || model.totalReach < 100 || !Number.isFinite(model.learnedScore)) return 0;
  return Math.max(-3, Math.min(3, (model.learnedScore - 50) * 0.2));
}
