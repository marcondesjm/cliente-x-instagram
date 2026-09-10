import assert from 'node:assert/strict';
import { editorialImageCandidates, sameEditorialEvent, articlePhotoUrls } from '../lib/editorial-image-fallbacks.js';
import { photoIdentity, similarPhoto } from '../lib/photo-uniqueness.js';

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
const event = { sourceTitle: 'Apple anuncia AirPods 5 com cancelamento de ruído melhorado', publishedAt: '2026-09-09' };
assert.ok(sameEditorialEvent(event, { ...event, sourceTitle: 'AirPods 5: Apple anuncia cancelamento de ruído melhorado', publishedAt: '2026-09-10' }));
assert.ok(!sameEditorialEvent(event, { ...event, sourceTitle: event.sourceTitle.replace('5', '4') }));
assert.ok(!sameEditorialEvent(event, { ...event, publishedAt: '2025-09-09' }));
assert.ok(!sameEditorialEvent(event, { ...event, sourceTitle: 'IA transforma empresas e negócios' }));
assert.equal(photoIdentity('https://example.com/photo.jpg.small_2x.jpg'),photoIdentity('https://example.com/photo.jpg.large.jpg'));
assert.equal(
  photoIdentity('https://example.com/Apple-iPhone-18-Pro-color-lineup-260909.jpg'),
  photoIdentity('https://example.com/Apple-iPhone-18-Pro-color-lineup-260909-1280x640.jpg.webp')
);
assert.ok(similarPhoto('01'.repeat(128), '01'.repeat(128)));
assert.ok(!similarPhoto('01'.repeat(128), '10'.repeat(128)));
assert.deepEqual(articlePhotoUrls('<main><img alt="AirPods 5" src="/airpods-5.jpg"><img alt="logo" src="/logo.png"></main>', 'https://example.com/article', 'AirPods 5 chegam ao Brasil'), ['https://example.com/airpods-5.jpg']);
const other = { research: { ...event, sourceUrl: 'https://another.example/news', source: 'Other portal' } };
const requested = [];
const found = [];
for await (const candidate of editorialImageCandidates({ ...event, sourceUrl: 'https://example.com/news' }, async url => {
  requested.push(url); return { ok: true, text: async () => '<meta property="og:image" content="https://another.example/photo.jpg">' };
}, [other])) found.push(candidate);
assert.ok(requested.includes(other.research.sourceUrl));
assert.ok(found.some(photo => photo.imageSourcePageUrl === other.research.sourceUrl));
console.log('Related portal discovery, model/date mismatch, image identity and article photo extraction passed.');
