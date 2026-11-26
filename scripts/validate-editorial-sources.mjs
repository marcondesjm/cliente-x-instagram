import assert from 'node:assert/strict';
import { EDITORIAL_SOURCES, normalizeEditorialSources } from '../lib/editorial-research.js';

assert.equal(EDITORIAL_SOURCES.length, 40, 'Radar must expose an expanded pool of forty sources.');
assert.equal(new Set(EDITORIAL_SOURCES.map(source => source.url)).size, EDITORIAL_SOURCES.length, 'Source URLs must be unique.');
assert.ok(EDITORIAL_SOURCES.every(source => source.name && /^https:\/\//i.test(source.url)));
assert.equal(normalizeEditorialSources(EDITORIAL_SOURCES).length, 40);
assert.equal(normalizeEditorialSources([...EDITORIAL_SOURCES, ...EDITORIAL_SOURCES]).length, 40);
assert.equal(normalizeEditorialSources([{name:'bad',url:'http://insecure.example/feed'}]).length, 0);
console.log('Radar source pool: 40 unique HTTPS feeds/sitemaps; normalization and deduplication passed.');
