import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { maskSecret, ownDirectComment, testInstagramAccountConnection, handleInstagramWebhook } from '../api/state.js';

test('credential status reveals no prefix, suffix, or length', () => {
  assert.equal(maskSecret('short'), maskSecret('a'.repeat(300)));
  assert.equal(maskSecret('secret-value'), 'Configurado · valor protegido');
  assert.equal(maskSecret(''), '');
});
test('own comments are ignored by ID or normalized account username', () => {
  assert.equal(ownDirectComment({ from: { id: '123' } }, {}, '123'), true);
  assert.equal(ownDirectComment({ from: { username: 'MARCONDES' } }, { expectedUsername: '@marcondes' }), true);
  assert.equal(ownDirectComment({ from: { username: 'visitor' } }, { expectedUsername: 'marcondes' }), false);
});
test('Facebook connection never requests the unsupported account_type field', async () => {
  const old = globalThis.fetch;
  process.env.TEST_TOKEN = 'test-token'; process.env.TEST_ID = '123';
  const calls = [];
  globalThis.fetch = async url => {
    calls.push(String(url));
    return { ok: true, json: async () => String(url).includes('/me/permissions')
      ? { data: [{ permission: 'instagram_content_publish', status: 'granted' }] }
      : { id: '123', username: 'marcondes', media_count: 10 } };
  };
  try {
    const result = await testInstagramAccountConnection({ accessTokenEnv: 'TEST_TOKEN', userIdEnv: 'TEST_ID', expectedUsername: 'marcondes' });
    assert.equal(result.publishingPermission, true);
    assert.equal(new URL(calls[0]).searchParams.get('fields'), 'id,username,media_count');
  } finally { globalThis.fetch = old; }
});
test('concurrent duplicate webhook events send one Direct; own comment sends none', async () => {
  const old = globalThis.fetch;
  process.env.GITHUB_TOKEN = 'mock'; process.env.INSTAGRAM_APP_SECRET = 'test-signature';
  process.env.TEST_ID = '123'; process.env.TEST_INSTAGRAM_ACCESS_TOKEN = 'mock-instagram';
  const account = { account: 'cliente-x', expectedUsername: 'marcondes', userIdEnv: 'TEST_ID', accessTokenEnv: 'TEST_INSTAGRAM_ACCESS_TOKEN' };
  const groups = [{ account: 'cliente-x', automations: [{ id: 'guide', name: 'Guide', enabled: true, keyword: 'IA', matchMode: 'exact', materialUrl: 'https://example.com/guide', message: 'Here: {link}', publicReply: 'Sent' }], deliveries: [] }];
  let data = structuredClone(groups), sha = 1, sends = 0;
  globalThis.fetch = async (url, options = {}) => {
    const path = String(url);
    if (path.includes('graph.instagram.com')) {
      if (path.includes('/messages')) { sends++; return { ok: true, json: async () => ({ message_id: 'm1' }) }; }
      return { ok: false, status: 400, json: async () => ({ error: { code: 100, message: 'public reply failed' } }) };
    }
    if (path.includes('accounts.json')) return { ok: true, json: async () => ({ content: Buffer.from(JSON.stringify([account])).toString('base64'), sha: 'accounts' }) };
    if (path.includes('direct-automations.json')) {
      if (options.method === 'PUT') {
        const body = JSON.parse(options.body);
        if (body.sha !== String(sha)) return { ok: false, status: 409, text: async () => JSON.stringify({message:'Conflict'}), json: async () => ({ message: 'Conflict' }) };
        data = JSON.parse(Buffer.from(body.content, 'base64').toString()); sha++;
        return { ok: true, json: async () => ({ content: { sha: String(sha) } }) };
      }
      const snapshot = { sha: String(sha), content: Buffer.from(JSON.stringify(data)).toString('base64') };
      return { ok: true, json: async () => snapshot };
    }
    throw new Error('Unexpected request ' + path);
  };
  const mockedFetch = globalThis.fetch;
  globalThis.fetch = async (...args) => { const result = await mockedFetch(...args); result.text ||= async () => JSON.stringify(await result.json()); return result; };
  const body = { object: 'instagram', entry: [{ id: '123', changes: [{ field: 'comments', value: { id: 'comment-1', text: 'IA', from: { id: 'visitor', username: 'visitor' } } }] }] };
  const invoke = body => { const raw = JSON.stringify(body); const signature = 'sha256=' + createHmac('sha256', process.env.INSTAGRAM_APP_SECRET).update(raw).digest('hex'); return handleInstagramWebhook(body, raw, signature, { headers: { host: 'example.com' } }); };
  try {
    const results = await Promise.allSettled([invoke(body), invoke(body)]);
    assert.ok(results.some(r => r.status === "fulfilled"), results.map(r=>r.reason?.stack).join("\n"));
    assert.equal(sends, 1);
    assert.equal(data[0].deliveries.length, 1);
    assert.equal(data[0].deliveries[0].status, 'sent');
    assert.equal(data[0].deliveries[0].publicReplyError, 'public reply failed');
    await invoke(body);
    assert.equal(sends, 1);
    const own = structuredClone(body); own.entry[0].changes[0].value = { id: 'own-comment', text: 'IA', from: { id: '123', username: 'marcondes' } };
    await invoke(own);
    assert.equal(sends, 1);
  } finally { globalThis.fetch = old; }
});

import handler from '../api/render.js';
import { createSessionCookie } from '../lib/auth.js';

process.env.ADMIN_EMAIL = 'preview-test@example.com';
process.env.ADMIN_PASSWORD = 'local-test-only';
process.env.GITHUB_TOKEN = 'mock-workflow-token';

async function request(body, email = process.env.ADMIN_EMAIL) {
  let dispatched;
  const original = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    dispatched = JSON.parse(options.body);
    return { ok: true, status: 204 };
  };
  const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; } };
  try {
    await handler({ method: 'POST', body, headers: { cookie: createSessionCookie(email).split(';')[0] } }, res);
    return { ...res, dispatched };
  } finally { globalThis.fetch = original; }
}

test('editor content 21 renders the exact supplied pack with a default BRT date', async () => {
  const pack = { slides: [{ title: 'Selected content', imageUrl: 'https://example.com/photo.jpg' }], caption: 'Example' };
  const result = await request({ slotIndex: 21, account: 'cliente-x', pack });
  assert.equal(result.code, 202);
  assert.equal(result.dispatched.inputs.slot_index, '21');
  assert.deepEqual(JSON.parse(result.dispatched.inputs.pack_json), pack);
  assert.match(result.dispatched.inputs.preview_date, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(result.data.imageUrls[0], /slot-21\/slide-01.jpg$/);
});
test('automatic schedule still rejects out-of-range slot 21', async () => {
  const result = await request({ slotIndex: 21, previewDate: '2026-11-05' });
  assert.equal(result.code, 400);
  assert.equal(result.dispatched, undefined);
});
test('automatic preview accepts slot 12 without explicit content', async () => {
  const result = await request({ slotIndex: 12, previewDate: '2026-11-05' });
  assert.equal(result.code, 202);
  assert.equal(result.dispatched.inputs.pack_json, '');
});
test('invalid indexes and oversized content do not dispatch a workflow', async () => {
  for (const slotIndex of [-1, 1.5, 'invalid']) {
    assert.equal((await request({ slotIndex, pack: { slides: [{}] } })).code, 400);
  }
  assert.equal((await request({ slotIndex: 21, pack: { slides: [{}], caption: 'x'.repeat(60001) } })).code, 400);
});
