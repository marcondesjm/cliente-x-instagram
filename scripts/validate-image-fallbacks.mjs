import assert from 'node:assert/strict';
import { editorialImageCandidates } from '../lib/editorial-image-fallbacks.js';

const research = {
  sourceUrl: 'https://tecnoblog.net/noticias/apple-anuncia-airpods-5-com-cancelamento-de-ruido-melhorado-e-ia/',
  source: 'Tecnoblog', sourceImageUrl: 'https://example.com/thumbnail.png'
};
const calls = [];
const mockFetch = async (url) => {
  calls.push(url);
  if (url === research.sourceUrl) throw new Error('source unavailable');
  return { ok: true, text: async () => '<meta property="og:image" content="https://www.apple.com/photo.jpg">' };
};
const iterator = editorialImageCandidates(research, mockFetch);
assert.equal((await iterator.next()).value.imageUrl, research.sourceImageUrl);
assert.equal(calls.length, 0, 'Page requests must be lazy');
const fallback = (await iterator.next()).value;
assert.equal(fallback.imageCredit, 'Apple');
assert.match(fallback.imageSourcePageUrl, /^https:\/\/www.apple.com\/newsroom\//);
assert.ok(fallback.imageEvidence);
assert.equal((await iterator.next()).done, true);
const unrelatedCalls = [];
for await (const candidate of editorialImageCandidates({ sourceUrl: 'https://example.com/airpods-4' }, async (url) => {
  unrelatedCalls.push(url); return { ok: false };
})) assert.fail('Unverified topic must not receive an alternative image');
assert.deepEqual(unrelatedCalls, ['https://example.com/airpods-4']);
console.log('Image fallback: lazy requests, source failure recovery, provenance and exact article isolation passed.');
