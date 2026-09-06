import assert from 'node:assert/strict';
import { reelRetentionMetrics as metrics, retentionHookModels, retentionHookAdjustment } from '../lib/performance-learning.js';
assert.equal(metrics({ averageWatchTime: 500, durationSeconds: 10 }).retention, 0.05);
assert.equal(metrics({ averageWatchTime: 1000, durationSeconds: 10 }).retention, 0.1);
assert.equal(metrics({ averageWatchTime: 3000, durationSeconds: 30 }).retention, 0.1);
assert.equal(metrics({ averageWatchTime: 3000 }).retention, null);
assert.equal(metrics({ averageWatchTime: 0, durationSeconds: 30 }).retention, 0);
assert.equal(metrics({ skipRate: 1 }).skip, 0.01);
assert.equal(metrics({ skipRate: 0 }).skip, 0);
assert.equal(metrics({ skipRate: null }).skip, null);
assert.equal(metrics({ skipRate: 101 }).skip, null);
assert.equal(metrics({}).score, null);
const now = Date.now();
const samples = Array.from({ length: 4 }, (_, i) => ({ mediaId: String(i), hook: 'novidade',
  publishedAt: new Date(now - 4 * 86400000).toISOString(), mediaProductType: 'REELS',
  observations: [{ windowHours: 24, ageHours: 25, metrics: { reach: 40, skipRate: 80 } }] }));
const model = retentionHookModels(samples, now).novidade;
assert(model.eligible);
assert(retentionHookAdjustment(model, 'REELS') < 0);
assert(Math.abs(retentionHookAdjustment(model, 'REELS')) <= 3);
assert.equal(retentionHookAdjustment(model, 'FEED'), 0);
assert.equal(retentionHookAdjustment(retentionHookModels(samples.slice(0, 2), now).novidade, 'REELS'), 0);
assert.equal(retentionHookModels([...samples, ...samples], now).novidade.samples, 4);
for (const patch of [{ reach: 7 }, { skipRate: null }]) {
  const small = samples.map(s => ({ ...s, observations: s.observations.map(o => ({ ...o, metrics: { ...o.metrics, ...patch } })) }));
  assert.deepEqual(retentionHookModels(small, now), {});
}
for (const patch of [{ windowHours: 2, ageHours: 3 }, { ageHours: 60 }]) {
  assert.deepEqual(retentionHookModels(samples.map(s => ({ ...s, observations: s.observations.map(o => ({ ...o, ...patch })) })), now), {});
}
assert.deepEqual(retentionHookModels(samples.map(s => ({ ...s, mediaProductType: 'FEED' })), now), {});
console.log('Retention: units, duration, missing metrics, small samples, maturity, duplicate IDs and bounded Reel-only ranking passed.');
