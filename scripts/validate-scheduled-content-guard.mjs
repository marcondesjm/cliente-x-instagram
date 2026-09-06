import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { availableBookStoryPacks, reconcileScheduledDuplicates, scheduledDuplicate } from '../lib/scheduled-content-guard.js';
import { solutionForWatchdogError } from './watchdog-error-classification.mjs';

const read = (name) => JSON.parse(readFileSync(new URL(`../automation/instagram-template/config/${name}.json`, import.meta.url)));
const posts = read('scheduled-posts')[0].posts;
const history = read('publication-history')['cliente-x'];
const original = posts.find((post) => post.id === 'livro-claude-code-20260902-14');
const duplicate = scheduledDuplicate(original.pack, history);
assert.equal(duplicate.storyMediaId, '18100281905263544');
assert.equal(duplicate.publishedAt, '2026-09-06T16:28:26.378Z');
const pending = { ...structuredClone(original), status: 'pending' };
const fresh = { ...structuredClone(pending), id: 'fresh', pack: { slides: [{ title: 'Uma pauta realmente inédita sobre outro assunto.' }] } };
const future = { ...structuredClone(pending), id: 'future', scheduledFor: '2099-01-01T12:00:00Z' };
const infrastructure = { ...structuredClone(pending), id: 'infra', status: 'failed', error: 'FFmpeg ENOENT' };
const queue = [pending, fresh, future, infrastructure];
const errors = [
  { account: 'cliente-x', status: 'open', scheduledAt: original.scheduledFor, error: 'Conteudo repetido bloqueado' },
  { account: 'cliente-x', status: 'open', scheduledAt: '2026-09-06T11:10:00Z', error: 'Conteudo repetido bloqueado' },
  { account: 'other', status: 'open', scheduledAt: original.scheduledFor, error: 'Conteudo repetido bloqueado' },
  { account: 'cliente-x', status: 'open', scheduledAt: original.scheduledFor, error: 'FFmpeg ENOENT' }
];
assert(reconcileScheduledDuplicates(queue, history, errors, 'cliente-x', new Date('2026-09-06T21:00:00Z')));
assert.equal(pending.status, 'skipped_duplicate');
assert.equal(pending.publishedAt, undefined);
assert.equal(fresh.status, 'pending');
assert.equal(future.status, 'pending');
assert.equal(infrastructure.status, 'failed');
assert.deepEqual(errors.map((entry) => entry.status), ['resolved', 'open', 'open', 'open']);
assert.equal(reconcileScheduledDuplicates(queue, history, errors, 'cliente-x', new Date('2026-09-06T21:00:00Z')), false);
assert.equal(scheduledDuplicate(original.pack, [{ ...duplicate, mediaId: null, storyMediaId: null }]), null);
const reserved = posts.filter((post) => post.status === 'pending' || post.status === 'failed');
assert.equal(availableBookStoryPacks(reserved).length, 0);
assert(availableBookStoryPacks(posts).length > 0);
assert.match(solutionForWatchdogError(original.error || 'Conteudo repetido bloqueado'), /sem republicar/);
console.log('Scheduled content guard: real Story collision, reservation, fresh queue, future dates, scoped alerts and idempotence passed.');
