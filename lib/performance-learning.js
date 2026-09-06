export const PERFORMANCE_LEARNING_MODEL_VERSION = 'nerion-adaptive-v1.2.2';
export const PERFORMANCE_LEARNING_MAX_AGE_HOURS = 5;

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
